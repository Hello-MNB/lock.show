import { supabase } from './supabase.js'

// ── Profiles ─────────────────────────────────────────────
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data ?? null
}

export async function upsertProfile({ id, role, full_name }) {
  const { error } = await supabase.from('profiles').upsert({ id, role, full_name })
  if (error) throw error
}

// ── Artists ──────────────────────────────────────────────
export async function getMyArtist(userId) {
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
  const { data, error } = await supabase.from('artists').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function upsertArtist(artist) {
  const { data, error } = await supabase.from('artists').upsert(artist).select().single()
  if (error) throw error
  return data
}

export async function listAgencyArtists(userId) {
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
  let q = supabase.from('profile_items').select('*').eq('artist_id', artistId)
  if (publicOnly) q = q.eq('visibility', 'passport-ok')
  const { data, error } = await q.order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function addProfileItem(item) {
  const { data, error } = await supabase.from('profile_items').insert(item).select().single()
  if (error) throw error
  return data
}

export async function deleteProfileItem(id) {
  const { error } = await supabase.from('profile_items').delete().eq('id', id)
  if (error) throw error
}

// ── Evidence ─────────────────────────────────────────────
export async function addEvidence(item) {
  const { data, error } = await supabase.from('evidence_artifacts').insert(item).select().single()
  if (error) throw error
  return data
}

export async function listEvidence(artistId) {
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
  let q = supabase.from('claims').select('*').eq('artist_id', artistId)
  if (passportOk) {
    q = q.eq('visibility', 'passport-ok').in('verification_status', ['verified', 'supporting'])
  }
  const { data, error } = await q.order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// ── Availability requests ────────────────────────────────
export async function createRequest(req) {
  const { data, error } = await supabase.from('availability_requests').insert(req).select().single()
  if (error) throw error
  return data
}

export async function listRequestsForAgency(userId) {
  // RLS joins requests to the agency's own artists.
  const { data, error } = await supabase
    .from('availability_requests')
    .select('*, artists!inner(name, created_by)')
    .eq('artists.created_by', userId)
    .order('created_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function updateRequestStatus(id, status) {
  const { error } = await supabase.from('availability_requests').update({ status }).eq('id', id)
  if (error) throw error
}

// ── Claims ─────────────────────────────────────────────── (extended)
export async function updateClaimVisibility(id, visibility) {
  const { error } = await supabase.from('claims').update({ visibility }).eq('id', id)
  if (error) throw error
}

// ── Consent ──────────────────────────────────────────────
export async function recordConsent(rec) {
  const { data, error } = await supabase.from('consent_records').insert(rec).select().single()
  if (error) throw error
  return data
}

export async function recordConsents(userId, { marketing }) {
  const version = 'v2-four-consents'
  const base = { subject_id: userId, version }
  const rows = [
    { ...base, scope: 'privacy-policy',    status: 'accepted' },
    { ...base, scope: 'data-processing',   status: 'accepted' },
    { ...base, scope: 'evidence-storage',  status: 'accepted' },
    { ...base, scope: 'marketing',         status: marketing ? 'accepted' : 'declined', marketing_opt_in: marketing },
  ]
  const { error } = await supabase.from('consent_records').insert(rows)
  if (error) throw error
}

export async function getConsents(userId) {
  const { data, error } = await supabase
    .from('consent_records')
    .select('*')
    .eq('subject_id', userId)
    .order('timestamp', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function latestConsent(userId) {
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
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
}
