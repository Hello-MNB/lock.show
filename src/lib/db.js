import { supabase } from './supabase.js'
import { VISIBILITY, PUBLISHABLE_STATUSES } from './constants.js'
import { StubClaimProcessor } from './ai/stub.js'
import { DEMO, demoArtist, demoArtist2, demoItems, demoEvidence, demoClaims, demoRequests, demoEntitlement, demoConsents, demoAudit } from './demo.js'

// In DEMO mode every function returns local fixtures (no Supabase client exists).

// ── Profiles ─────────────────────────────────────────────
export async function getProfile(userId) {
  if (DEMO) return { id: userId, role: 'artist', full_name: 'Demo' }
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data ?? null
}

export async function upsertProfile({ id, role, full_name }) {
  if (DEMO) return
  const { error } = await supabase.from('profiles').upsert({ id, role, full_name })
  if (error) throw error
}

// ── Artists ──────────────────────────────────────────────
export async function getMyArtist(userId) {
  if (DEMO) return demoArtist
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getArtist(id) {
  if (DEMO) return id === demoArtist2.id ? demoArtist2 : demoArtist
  const { data, error } = await supabase.from('artists').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function upsertArtist(artist) {
  if (DEMO) return { ...demoArtist, ...artist }
  const { data, error } = await supabase.from('artists').upsert(artist).select().single()
  if (error) throw error
  return data
}

export async function listAgencyArtists(userId) {
  if (DEMO) return [demoArtist, demoArtist2]
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// ── Profile items (track record + links + draw signals) ──
export async function listProfileItems(artistId, { publicOnly = false } = {}) {
  if (DEMO) return publicOnly ? demoItems.filter((i) => i.visibility === VISIBILITY.PASSPORT_OK) : demoItems
  let q = supabase.from('profile_items').select('*').eq('artist_id', artistId)
  if (publicOnly) q = q.eq('visibility', VISIBILITY.PASSPORT_OK)
  const { data, error } = await q.order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function addProfileItem(item) {
  if (DEMO) return { id: 'demo-new', ...item }
  const { data, error } = await supabase.from('profile_items').insert(item).select().single()
  if (error) throw error
  return data
}

export async function deleteProfileItem(id) {
  if (DEMO) return
  const { error } = await supabase.from('profile_items').delete().eq('id', id)
  if (error) throw error
}

// ── Evidence ─────────────────────────────────────────────
export async function addEvidence(item) {
  if (DEMO) return { id: 'demo-ev', status: 'submitted', ...item }
  const { data, error } = await supabase.from('evidence_artifacts').insert(item).select().single()
  if (error) throw error
  return data
}

export async function listEvidence(artistId) {
  if (DEMO) return demoEvidence
  const { data, error } = await supabase
    .from('evidence_artifacts')
    .select('*')
    .eq('artist_id', artistId)
    .order('uploaded_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// ── Claims (output of AI processing) ─────────────────────
export async function listClaims(artistId, { passportOk = false } = {}) {
  if (DEMO) return passportOk
    ? demoClaims.filter((c) => c.visibility === VISIBILITY.PASSPORT_OK && PUBLISHABLE_STATUSES.includes(c.verification_status))
    : demoClaims
  let q = supabase.from('claims').select('*').eq('artist_id', artistId)
  if (passportOk) {
    q = q.eq('visibility', VISIBILITY.PASSPORT_OK).in('verification_status', PUBLISHABLE_STATUSES)
  }
  const { data, error } = await q.order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// ── Availability requests ────────────────────────────────
export async function createRequest(req) {
  if (DEMO) return { id: 'demo-req', ...req }
  const { data, error } = await supabase.from('availability_requests').insert(req).select().single()
  if (error) throw error
  return data
}

export async function listRequestsForAgency(userId) {
  if (DEMO) return demoRequests
  const { data, error } = await supabase
    .from('availability_requests')
    .select('*, artists!inner(stage_name, created_by)')
    .eq('artists.created_by', userId)
    .order('created_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function updateRequestStatus(id, status) {
  if (DEMO) return
  const { error } = await supabase.from('availability_requests').update({ status }).eq('id', id)
  if (error) throw error
}

// ── Evidence → method-labeled Claims ──────────────────────────────
// The artist's core loop. Tries the serverless API first (enables real Anthropic
// AI on a key — Phase-2). On a STATIC deploy with no server, falls back to the
// SAME deterministic canon stub CLIENT-SIDE, so evidence→claim→method-label works
// with the anon key alone (no server, no secret). FIREWALL: bounded statuses +
// bands + method-labels only — never a score/percentile/head-count.
const _clientProcessor = new StubClaimProcessor()
async function processEvidenceClientSide(artistId) {
  const { data: evidence, error } = await supabase
    .from('evidence_artifacts').select('*').eq('artist_id', artistId).eq('status', 'submitted')
  if (error) throw error
  const claims = []
  for (const ev of evidence ?? []) {
    const labelled = await _clientProcessor.label(ev)
    const claim = {
      artist_id: artistId, evidence_id: ev.id,
      claim_type: labelled.claim_type || 'claim',
      value: labelled.value || ev.value || null,
      source_type: ev.source_type,
      verification_status: labelled.status,
      verified_by: 'system', verified_at: new Date().toISOString(),
      visibility: PUBLISHABLE_STATUSES.includes(labelled.status) ? VISIBILITY.PASSPORT_OK : VISIBILITY.MIRROR_ONLY,
      extraction_method: 'mock', model_version: 'mock-v1',
      reason_code: labelled.reason || null,
    }
    const { data: inserted, error: cErr } = await supabase.from('claims').insert(claim).select().single()
    if (cErr) throw cErr
    claims.push(inserted)
    await supabase.from('evidence_artifacts').update({ status: 'processed' }).eq('id', ev.id)
  }
  return { processed: claims.length, ai: 'client-stub', claims }
}

export async function processEvidence(artistId) {
  if (DEMO) return { processed: demoClaims.length, ai: 'demo', claims: demoClaims }
  try {
    const res = await fetch('/api/process-evidence', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artistId }),
    })
    const ct = res.headers.get('content-type') || ''
    if (res.ok && ct.includes('application/json')) return await res.json()
  } catch { /* no server (static deploy) — fall through to the client-side stub */ }
  return processEvidenceClientSide(artistId)
}

// ── Claims ─────────────────────────────────────────────── (extended)
export async function updateClaimVisibility(id, visibility) {
  if (DEMO) return
  const { error } = await supabase.from('claims').update({ visibility }).eq('id', id)
  if (error) throw error
}

// Artist controls whether a track-record item crosses Mirror→Passport.
// Server buildSafePayload still filters to visibility=passport-ok, so this is
// the single lever; RLS guarantees only the owner can flip it.
export async function updateItemVisibility(id, visibility) {
  if (DEMO) return
  const { error } = await supabase.from('profile_items').update({ visibility }).eq('id', id)
  if (error) throw error
}

// ── Passport publish (server builds the immutable snapshot) ──
export async function publishPassport(artistId) {
  if (DEMO) return { ok: true, published: true }
  const res = await fetch(`/api/publish/${artistId}`, { method: 'POST' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'publish failed')
  return json
}

export async function unpublishArtist(artist) {
  if (DEMO) return { ...artist, published: false }
  return upsertArtist({ ...artist, published: false })
}

// ── Operator / Admin ─────────────────────────────────────
export async function adminListArtists() {
  if (DEMO) return [demoArtist, demoArtist2]
  const { data, error } = await supabase
    .from('artists')
    .select('id, stage_name, city, genre, published, created_at, created_by, lineup_frequency_band, sells_tickets, price_band, community_size_band')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function adminListRequests() {
  if (DEMO) return demoRequests
  const { data, error } = await supabase
    .from('availability_requests')
    .select('*, artists(stage_name)')
    .order('created_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function adminListClaims() {
  if (DEMO) return demoClaims
  const { data, error } = await supabase
    .from('claims')
    .select('id, artist_id, claim_type, value, verification_status, visibility, method_label, expires_at, created_at')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data ?? []
}

export async function adminSetPublished(id, published) {
  if (DEMO) return { id, published }
  const { data, error } = await supabase.from('artists').update({ published }).eq('id', id).select().single()
  if (error) throw error
  return data
}

// ── Entitlements (A8 Founding Passport, manual payment) ──────
export async function getEntitlement(artistId) {
  if (DEMO) return demoEntitlement
  const { data, error } = await supabase
    .from('entitlements')
    .select('id, status, kind, created_at')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) return null
  return data
}

export async function createEntitlement(artistId, subjectId) {
  if (DEMO) return demoEntitlement
  const { data, error } = await supabase.from('entitlements')
    .insert({ artist_id: artistId, subject_id: subjectId, kind: 'founding_passport', status: 'pending' })
    .select().single()
  if (error) throw error
  return data
}

export async function adminListPendingEntitlements() {
  if (DEMO) return [demoEntitlement]
  const { data, error } = await supabase
    .from('entitlements')
    .select('id, status, created_at, artists(stage_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function adminActivateEntitlement(id) {
  if (DEMO) return
  const { error } = await supabase.from('entitlements')
    .update({ status: 'active', activated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// ── Operator data-rights (§21: OP3 consents · OP12 export/erasure) ──
export async function adminListConsents() {
  if (DEMO) return demoConsents
  const { data, error } = await supabase.from('consent_records')
    .select('id, subject_id, scope, version, status, marketing_opt_in, timestamp')
    .order('timestamp', { ascending: false }).limit(200)
  if (error) throw error
  return data ?? []
}
export async function adminExportArtist(artistId) {
  if (DEMO) return { artist: demoArtist, claims: demoClaims, items: demoItems, evidence: demoEvidence, requests: demoRequests }
  const [a, c, i, e, r] = await Promise.all([
    supabase.from('artists').select('*').eq('id', artistId).maybeSingle(),
    supabase.from('claims').select('*').eq('artist_id', artistId),
    supabase.from('profile_items').select('*').eq('artist_id', artistId),
    supabase.from('evidence_artifacts').select('*').eq('artist_id', artistId),
    supabase.from('availability_requests').select('*').eq('artist_id', artistId),
  ])
  return { artist: a.data, claims: c.data || [], items: i.data || [], evidence: e.data || [], requests: r.data || [] }
}
// Destructive: writes an audit row BEFORE the cascade delete (firewall: due process).
export async function adminDeleteArtist(artistId, reason) {
  if (DEMO) return
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('audit_log').insert({ actor_id: user?.id || null, action: 'delete_artist', target_type: 'artist', target_id: artistId, reason })
  const { error } = await supabase.from('artists').delete().eq('id', artistId)
  if (error) throw error
}
export async function adminListAudit() {
  if (DEMO) return demoAudit
  const { data, error } = await supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(100)
  if (error) throw error
  return data ?? []
}

// ── Consent ──────────────────────────────────────────────
export async function recordConsent(rec) {
  if (DEMO) return {}
  const { data, error } = await supabase.from('consent_records').insert(rec).select().single()
  if (error) throw error
  return data
}

export async function recordConsentScope(userId, scope, extra = {}) {
  if (DEMO) return
  const { error } = await supabase.from('consent_records').insert({
    subject_id: userId, scope, version: 'v3-inline-gates', status: 'accepted', ...extra,
  })
  if (error) throw error
}

export async function hasConsent(userId, scope) {
  if (DEMO) return true
  const { data, error } = await supabase
    .from('consent_records')
    .select('id')
    .eq('subject_id', userId)
    .eq('scope', scope)
    .eq('status', 'accepted')
    .limit(1)
    .maybeSingle()
  if (error) return false
  return Boolean(data)
}

export async function getConsents(userId) {
  if (DEMO) return []
  const { data, error } = await supabase
    .from('consent_records')
    .select('*')
    .eq('subject_id', userId)
    .order('timestamp', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function latestConsent(userId) {
  if (DEMO) return null
  const { data, error } = await supabase
    .from('consent_records')
    .select('*')
    .eq('subject_id', userId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function requestAccountDeletion(userId) {
  if (DEMO) return
  const { error } = await supabase.from('consent_records').insert({
    subject_id: userId,
    scope: 'account-deletion',
    version: 'v1',
    status: 'withdrawn',
  })
  if (error) throw error
}

// ── Notifications ─────────────────────────────────────────
export async function getNotifications(userId) {
  if (DEMO) return []
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) return []
  return data ?? []
}

export async function markNotificationsRead(userId) {
  if (DEMO) return
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
}
