import { supabase } from './supabase.js'
import { VISIBILITY, PUBLISHABLE_STATUSES } from './constants.js'
import { StubClaimProcessor } from './ai/stub.js'
import { DEMO, demoArtist, demoArtist2, demoItems, demoEvidence, demoClaims, demoRequests, demoEntitlement, demoConsents, demoAudit, demoPassportPayload } from './demo.js'

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

// Public/by-id read — BUYER-SAFE columns only (anon-facing: availability flow).
// Never selects private fields (whatsapp/rider/created_by); the owner uses
// getMyArtist for their full record. Matches the anon column grant (migration 016).
const PUBLIC_ARTIST_COLS = 'id, stage_name, name, genre, city, photo_url, one_line, regions, set_length, invoice_ready, music_links, lineup_frequency_band, sells_tickets, price_band, community_size_band, published'
export async function getArtist(id) {
  if (DEMO) return id === demoArtist2.id ? demoArtist2 : demoArtist
  const { data, error } = await supabase.from('artists').select(PUBLIC_ARTIST_COLS).eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function upsertArtist(artist) {
  if (DEMO) return { ...demoArtist, ...artist }
  const { data, error } = await supabase.from('artists').upsert(artist).select().single()
  if (error) throw error
  return data
}

// ── Act (multi-Act spine, migration 020) ────────────────────────────────────
// Transition model: act.id === artists.id for the default Act, so the artist id
// addresses the Act directly. Act-only fields (artist_goal, format, alias…)
// live on public.act — never on artists.
export async function getMyAct(actId) {
  if (DEMO) return { id: actId, artist_goal: null, format: null, is_default: true }
  const { data, error } = await supabase.from('act').select('*').eq('id', actId).maybeSingle()
  if (error) throw error
  return data
}

export async function updateAct(actId, patch) {
  if (DEMO) return { id: actId, ...patch }
  const { data, error } = await supabase.from('act').update(patch).eq('id', actId).select().single()
  if (error) throw error
  return data
}

// Roster-wide claim states for the agency radar — WORKFLOW facts (what waits),
// never a cross-artist score. RLS scopes rows to artists this org can access.
export async function listClaimsByArtists(artistIds) {
  if (DEMO) return []
  if (!artistIds?.length) return []
  const { data, error } = await supabase.from('claims')
    .select('id, artist_id, artist_approved, verification_status, status')
    .in('artist_id', artistIds)
  if (error) throw error
  return data ?? []
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

// A8 review actions — the artist-approval gate. Nothing reaches any view
// without an explicit artist action (canon: zero claims publish without review).
export async function updateClaim(id, patch) {
  if (DEMO) return { id, ...patch }
  const { data, error } = await supabase.from('claims').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}

// Omit = the artist chooses not to use an unpublished claim of their own.
// Hard delete for now; the operator audit trail arrives with the ops queue.
export async function deleteClaim(id) {
  if (DEMO) return
  const { error } = await supabase.from('claims').delete().eq('id', id)
  if (error) throw error
}

// ── Measurement (024) — a VIEW is not a REACTION; never merge them ──────────
// Anonymous browser session id for first-party measurement (no PII).
export function publicSessionId() {
  let s = localStorage.getItem('gp_session')
  if (!s) { s = crypto.randomUUID(); localStorage.setItem('gp_session', s) }
  return s
}

// Opening a Passport writes passport_view_event ONLY (canon P0-5).
// Fire-and-forget: measurement must never break the page.
export async function recordPassportView(artistId) {
  if (DEMO) return
  try {
    const { data: pv } = await supabase.from('passport_versions')
      .select('id').eq('artist_id', artistId)
      .order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (!pv) return
    await supabase.from('passport_view_event').insert({
      passport_version_id: pv.id,
      public_session_id: publicSessionId(),
    })
  } catch { /* silent — measurement is best-effort */ }
}

// A professional explicitly taps an action → professional_reaction (019).
// check_availability / request_price ALSO create an availability_request via
// the request form; all other actions write the reaction only.
export async function recordProfessionalReaction(artistId, actionType) {
  if (DEMO) return { ok: true }
  const day = new Date().toISOString().slice(0, 10)
  const { error } = await supabase.from('professional_reaction').insert({
    artist_id: artistId,
    action_type: actionType,
    public_session_id: publicSessionId(),
    idempotency_key: `${artistId}:${publicSessionId()}:${actionType}:${day}`,
  })
  // duplicate same-day tap = already recorded — treat as success (idempotent)
  if (error && !`${error.message}`.includes('duplicate')) throw error
  return { ok: true }
}

// Artist controls whether a track-record item crosses Mirror→Passport.
// Server buildSafePayload still filters to visibility=passport-ok, so this is
// the single lever; RLS guarantees only the owner can flip it.
export async function updateItemVisibility(id, visibility) {
  if (DEMO) return
  const { error } = await supabase.from('profile_items').update({ visibility }).eq('id', id)
  if (error) throw error
}

// ── Public Passport — buyer view, NO server (anon + RLS, firewall via 016) ──
// The artist row is visible to anon only when published (artists_public_read);
// items/claims are RLS-filtered to passport-ok (items/claims_public_read); the
// 016 column grants block PII/score/raw-timestamp. So a direct anon read is
// firewall-safe — no service-role, no /api/passport. getArtist() already selects
// buyer-safe columns only.
export async function getPublicPassport(id) {
  if (DEMO) return demoPassportPayload
  const artist = await getArtist(id) // null if not published (RLS hides it from anon)
  if (!artist || !artist.published) return { artist: null, items: [], claims: [] }
  // Two viewer classes, two firewalls (verified live 8 Jul):
  // · ANON — the RLS row gate already restricts to published+passport-ok, and the
  //   016 column grants do NOT include `visibility`, so referencing it in WHERE
  //   throws 42501. No client filter — the DB is the firewall.
  // · AUTHENTICATED (owner / agency member) — their RLS shows ALL their rows, so
  //   the buyer view MUST filter explicitly or private/mirror-only claims leak
  //   into the "public" view. One Passport = identical for every viewer.
  const { data: { session } } = await supabase.auth.getSession()
  let itemsQ = supabase.from('profile_items')
    .select('id, item_type, title, detail, item_date, public_url, source_status')
    .eq('artist_id', id)
  let claimsQ = supabase.from('claims')
    .select('id, claim_type, value, public_band, public_wording, source_type, verification_status, reason_code, method_label, verified_at, expires_at')
    .eq('artist_id', id)
  if (session) {
    itemsQ = itemsQ.eq('visibility', VISIBILITY.PASSPORT_OK)
    claimsQ = claimsQ.eq('visibility', VISIBILITY.PASSPORT_OK).in('verification_status', PUBLISHABLE_STATUSES)
  }
  const [itemsRes, claimsRes] = await Promise.all([
    itemsQ.order('item_date', { ascending: false, nullsFirst: false }),
    claimsQ,
  ])
  if (itemsRes.error) throw itemsRes.error
  if (claimsRes.error) throw claimsRes.error
  return { artist, items: itemsRes.data ?? [], claims: claimsRes.data ?? [] }
}

// Owner-side immutable snapshot. The owner's RLS sees ALL visibilities, so unlike
// the anon read we MUST filter to passport-ok explicitly here (mirrors the server's
// buildSafePayload). Buyer-safe columns only — never private/score columns.
async function buildPassportSnapshot(artistId) {
  const artist = await getArtist(artistId)
  const [itemsRes, claimsRes] = await Promise.all([
    supabase.from('profile_items')
      .select('id, item_type, title, detail, item_date, public_url, source_status')
      .eq('artist_id', artistId).eq('visibility', VISIBILITY.PASSPORT_OK),
    supabase.from('claims')
      .select('id, claim_type, value, source_type, verification_status, reason_code, method_label')
      .eq('artist_id', artistId).eq('visibility', VISIBILITY.PASSPORT_OK).in('verification_status', PUBLISHABLE_STATUSES),
  ])
  return { artist: { ...artist, published: true }, items: itemsRes.data ?? [], claims: claimsRes.data ?? [] }
}

// ── Passport publish — NO server. The connected owner flips published + writes a
// buyer-safe immutable snapshot, both under RLS on their own artist. published=true
// is the firewall gate (anon then reads live via getPublicPassport). The snapshot
// (pv_owner_insert / migration 017) is the immutable record; it's best-effort so a
// missing 017 never blocks publishing — the live-read view works regardless.
export async function publishPassport(artistId) {
  if (DEMO) return { ok: true, published: true, snapshotWritten: true }
  const { error: upErr } = await supabase.from('artists').update({ published: true }).eq('id', artistId)
  if (upErr) throw upErr
  let snapshotWritten = false
  try {
    const snapshot = await buildPassportSnapshot(artistId)
    const { error: snapErr } = await supabase.from('passport_versions').insert({ artist_id: artistId, snapshot })
    if (snapErr) throw snapErr
    snapshotWritten = true
  } catch (e) {
    console.warn('[publish] immutable snapshot deferred (apply migration 017 pv_owner_insert):', e?.message || e)
  }
  return { ok: true, published: true, snapshotWritten }
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
    // artist_id is needed by the P1-1 "payment activated" notification writer
    // (AdminDashboard.activate) — it can't be derived from artists(stage_name).
    .select('id, artist_id, status, created_at, artists(stage_name)')
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
