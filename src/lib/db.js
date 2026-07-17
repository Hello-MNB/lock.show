import { supabase } from './supabase.js'
import { VISIBILITY, PUBLISHABLE_STATUSES } from './constants.js'
import { StubClaimProcessor } from './ai/stub.js'
import { DEMO, demoArtist, demoArtist2, demoActs, demoItems, demoEvidence, demoClaims, demoRequests, demoEntitlement, demoConsents, demoAudit, demoPassportPayload, demoSwitchAct } from './demo.js'

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

// Artist-controlled WhatsApp sharing (owner ruling 9 Jul). The artist sets their
// number + opt-in in Settings; a booking manager only sees it after a request,
// via the gated RPC below. whatsapp_number stays firewall-private (016).
// Resilient to running BEFORE migration 029: if whatsapp_share doesn't exist yet
// the update retries with just the number so Settings never hard-errors.
export async function saveArtistWhatsApp(artistId, { number, share }) {
  if (DEMO) return
  const num = (number || '').trim() || null
  const full = { id: artistId, whatsapp_number: num, whatsapp_share: !!share }
  const { error } = await supabase.from('artists').update(full).eq('id', artistId)
  if (!error) return
  // Pre-029 fallback: unknown column whatsapp_share → save the number only.
  if (/whatsapp_share|column .* does not exist|schema cache/i.test(error.message || '')) {
    const { error: e2 } = await supabase.from('artists').update({ whatsapp_number: num }).eq('id', artistId)
    if (e2) throw e2
    return
  }
  throw error
}

// Buyer-facing gated read: returns the artist's WhatsApp ONLY if they published
// and opted in (SECURITY DEFINER RPC, migration 029). Null on any error — a
// missing RPC (pre-029) or block just means "no WhatsApp CTA", never a crash.
export async function getSharedWhatsApp(artistId) {
  if (DEMO) return demoArtist.whatsapp_number ?? null
  if (!artistId) return null
  const { data, error } = await supabase.rpc('get_shared_whatsapp', { p_artist_id: artistId })
  if (error) return null
  return data ?? null
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

// One Person may hold several Acts (canon: a psytrance Act + a techno Act),
// each with its OWN Passport and its OWN evidence, per-Act non-transferable.
// The default Act shares its id with `artists` (migration 020's transition
// rule) — listActs resolves that Act's person_id first, then returns every
// Act the same Person holds (radar center-star Act-switch, Design Spec §MULTI-ACT).
export async function listActs(artistId) {
  if (DEMO) return demoActs
  const { data: mine, error: e1 } = await supabase.from('act').select('person_id').eq('id', artistId).maybeSingle()
  if (e1) throw e1
  if (!mine?.person_id) return []
  const { data, error } = await supabase.from('act')
    .select('id, stage_name, genre, city, positioning, photo_url, is_default, created_at')
    .eq('person_id', mine.person_id)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

// Create a SECOND (or third…) Act for the same Person (rel-07.13 A3/N12).
// Canon: the new Act starts EMPTY — evidence is per-Act and never transfers.
// person_id is resolved from the currently-active Act row (same resolution
// path listActs uses), so a caller can never attach an Act to someone else.
// Known transition gap (documented in switchAct): a non-default Act has no
// matching `artists` row — artists-only fields stay honestly absent for it.
export async function createAct(currentActId, { stage_name, genre = null }) {
  if (DEMO) throw new Error('demo') // UI shows the friendly demo hint
  const name = (stage_name || '').trim()
  if (!name) throw new Error('stage name required')
  const { data: mine, error: e1 } = await supabase.from('act').select('person_id').eq('id', currentActId).maybeSingle()
  if (e1) throw e1
  if (!mine?.person_id) throw new Error('active act has no person — cannot create')
  const { data, error } = await supabase.from('act')
    .insert({ person_id: mine.person_id, stage_name: name, genre, is_default: false })
    .select('id, stage_name, genre, city, positioning, photo_url, is_default, created_at')
    .single()
  if (error) throw error
  return data
}

// Switching Acts swaps the WHOLE evidence universe. Reads are act_id-scoped —
// migration 020 threaded act_id through every evidence table and backfilled it
// for existing rows, so the default Act's own history still resolves here too.
// A genuinely NEW Act has no rows yet: items/claims come back empty, which is
// the correct, honest "new Act starts empty" behaviour — never inherited from
// another Act. Real-DB depth gap (documented, not fixed here): a non-default
// Act has no matching `artists` row, so artists-only fields (draw bands,
// sells_tickets, rider, WhatsApp…) aren't yet act-scoped in the schema; callers
// should treat those as honestly absent for a non-default Act.
export async function switchAct(actId) {
  if (DEMO) return demoSwitchAct(actId)
  const [actRes, itemsRes, claimsRes] = await Promise.all([
    supabase.from('act').select('*').eq('id', actId).maybeSingle(),
    supabase.from('profile_items').select('*').eq('act_id', actId).order('created_at', { ascending: false }),
    supabase.from('claims').select('*').eq('act_id', actId).order('created_at', { ascending: false }),
  ])
  if (actRes.error) throw actRes.error
  if (itemsRes.error) throw itemsRes.error
  if (claimsRes.error) throw claimsRes.error
  return { act: actRes.data, items: itemsRes.data ?? [], claims: claimsRes.data ?? [] }
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
  // G4 (A5) read model: each roster row carries the BOUNDED per-artist state the
  // one next-best-action ladder derives from — `published` rides on artists.*,
  // and the nested profile_items are limited to item_type + created_at (evidence
  // presence/kind/age only, never content). FIREWALL: inputs to a rule; the UI
  // renders action text, never a count/%/score.
  const { data, error } = await supabase
    .from('artists')
    .select('*, profile_items(item_type, created_at)')
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

// Artist-facing — incoming availability requests for the artist's OWN Passport
// (canon IA: artist nav "Requests" tab). Scoped by artist_id, unlike
// listRequestsForAgency which resolves via created_by across a whole roster.
export async function listRequestsForArtist(artistId) {
  if (DEMO) return demoRequests.filter((r) => r.artist_id === artistId)
  const { data, error } = await supabase
    .from('availability_requests')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

// ── Evidence → method-labeled Claims ──────────────────────────────
// The artist's core loop. Tries the serverless API first (enables real Anthropic
// AI on a key — Phase-2). On a STATIC deploy with no server, falls back to the
// SAME deterministic canon stub CLIENT-SIDE, so evidence→claim→method-label works
// with the anon key alone (no server, no secret). FIREWALL: bounded statuses +
// bands + method-labels only — never a score/percentile/head-count.
//
// G12 static-deploy capability signal: the client stub is a DEPLOYMENT MODE,
// not an error handler. It may run only when the build itself declares "no API
// exists here" — VITE_NO_API=1, or the embed build (vite.config sets base
// '/app/' exclusively in embed mode; the embed ships inside the static
// website-next export, which has no /api function). `import.meta.env?.` keeps
// this file importable outside Vite (constants.js precedent).
const NO_API_DEPLOY =
  import.meta.env?.VITE_NO_API === '1' || import.meta.env?.BASE_URL === '/app/'
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
      // G12 truthful provenance: this is the CLIENT stub path, so the stored
      // method says exactly that. 'mock' is reserved for the server's keyless
      // StubClaimProcessor; DEMO mode never reaches this insert (processEvidence
      // returns fixtures first). claims.extraction_method is unconstrained text
      // (001/schema.sql) — no CHECK migration needed for 'client_stub'.
      extraction_method: 'client_stub', model_version: 'client-stub-v1',
      reason_code: labelled.reason || null,
    }
    const { data: inserted, error: cErr } = await supabase.from('claims').insert(claim).select().single()
    if (cErr) throw cErr
    claims.push(inserted)
    await supabase.from('evidence_artifacts').update({ status: 'processed' }).eq('id', ev.id)
  }
  return { processed: claims.length, ai: 'client-stub', claims }
}

// G11 client side — protected API routes need the caller's Supabase JWT.
// Returns {} when there is no session (server then answers 401 and callers
// fall back / surface it per their own contract).
export async function authHeaders() {
  try {
    const { data } = await supabase.auth.getSession()
    const t = data?.session?.access_token
    return t ? { Authorization: `Bearer ${t}` } : {}
  } catch { return {} }
}

// Server errors that mean "the server DECIDED not to process" (auth, abuse
// controls, budget, schema). Masking any of these with the client stub would
// both defeat the control AND mislabel the result (G12+G14) — they must
// surface as an error state, never as stub claims.
const SERVER_REFUSAL_CODES = new Set([
  'auth_required', 'forbidden', 'rate_limited', 'too_many_items',
  'daily_limit_reached', 'monthly_budget_reached', 'field_too_long',
])

export async function processEvidence(artistId) {
  if (DEMO) return { processed: demoClaims.length, ai: 'demo', claims: demoClaims }
  // Static/embed deploy declared at BUILD time (NO_API_DEPLOY above): there is
  // no /api by design, so the client stub IS the processor — no fetch attempt.
  if (NO_API_DEPLOY) return processEvidenceClientSide(artistId)
  let res
  try {
    res = await fetch('/api/process-evidence', {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify({ artistId }),
    })
  } catch (e) {
    // Network-unreachable (fetch rejects with TypeError before any response) —
    // the ONLY runtime stub case. Anything stranger than that is not "offline",
    // so it surfaces as the retryable error state instead of fake stub claims.
    if (e instanceof TypeError) return processEvidenceClientSide(artistId)
    const err = new Error(e?.message || 'network error')
    err.code = 'server_refused'
    throw err
  }
  const ct = res.headers.get('content-type') || ''
  const body = ct.includes('application/json') ? await res.json().catch(() => null) : null
  if (res.ok && body) return body
  // G12+G14 refusal policy: a 401/403/429 or an explicit refusal code is a
  // server DECISION — surface it (EvidenceCapture shows T.evidence.serverRefused),
  // never run the client stub over it. SERVER_REFUSAL_CODES kept for the
  // explicit enumeration even though every arrived failure now throws.
  if (body && ([401, 403, 429].includes(res.status) || SERVER_REFUSAL_CODES.has(body.error))) {
    const err = new Error(body.error || `server refused (${res.status})`)
    err.code = 'server_refused'
    err.status = res.status
    throw err
  }
  // G12 (reopened 14 Jul): ANY response that arrived but isn't usable JSON —
  // an HTML 404/500 error page, a proxy error, a truncated body — is a LIVE
  // but FAILING server, never proof that no server exists. Auto-stubbing here
  // turned outages into fake-successful claims. Throw the same retryable
  // server-refusal error so the UI shows the retry state and evidence stays
  // 'submitted'.
  const err = new Error(body?.error || `server error (${res.status})`)
  err.code = 'server_refused'
  err.status = res.status
  throw err
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

// ── Milestone M7 input (Codex M7) — has THIS artist ever had a share link
// created, per the localStorage analytics ring buffer (analytics.js KEY —
// 'gigproof_events'). Works offline and on the static embed. HONESTY NOTE:
// device-local only — a share made on another device won't be seen here; the
// server-side share_link_created query is P1.
export function hasShareEvent(artistId) {
  if (DEMO) return true
  try {
    const events = JSON.parse(localStorage.getItem('gigproof_events') || '[]')
    return events.some((e) => e?.name === 'share_link_created' && e?.props?.artist_id === artistId)
  } catch { return false }
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
  // Sample passport — the booker/login "see a sample" escape hatch. artists.id is
  // a uuid, so 'demo-artist' would throw 22P02 on live and dead-end the one
  // no-link-in-hand path (flow-gap B). Serve the canned demo payload instead.
  if (id === 'demo-artist') return demoPassportPayload
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
    // artist_approved: the publish gate (031). An authenticated viewer's RLS shows
    // ALL their claims, so we must exclude unreviewed ones explicitly — same rule
    // the anon path gets from claims_public_read.
    claimsQ = claimsQ.eq('visibility', VISIBILITY.PASSPORT_OK).in('verification_status', PUBLISHABLE_STATUSES).eq('artist_approved', true)
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
      .eq('artist_id', artistId).eq('visibility', VISIBILITY.PASSPORT_OK).in('verification_status', PUBLISHABLE_STATUSES).eq('artist_approved', true),
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
// W4-1 — DEMO walks the WHOLE pilot payment loop (none → "I've paid" pending →
// operator activates), because the Gate's pay half must be RECORDABLE end-to-end.
// State lives in localStorage (fixtures only, rule 11 — no DB, no network) so it
// survives a reload and the demo persona switch artist → operator. No stored
// state = no entitlement yet, so the offer form actually shows in DEMO.
const DEMO_ENT_KEY = 'lock_demo_entitlement'
function readDemoEnt() {
  try {
    const raw = localStorage.getItem(DEMO_ENT_KEY)
    // merge over the fixture so display fields (stage name, email) stay present
    return raw ? { ...demoEntitlement, ...JSON.parse(raw) } : null
  } catch { return null }
}
function writeDemoEnt(patch) {
  try {
    let cur = {}
    try { cur = JSON.parse(localStorage.getItem(DEMO_ENT_KEY)) || {} } catch { /* corrupt → restart */ }
    localStorage.setItem(DEMO_ENT_KEY, JSON.stringify({ ...cur, ...patch }))
  } catch { /* storage blocked — demo state simply won't persist */ }
}

export async function getEntitlement(artistId) {
  if (DEMO) return readDemoEnt()
  const { data, error } = await supabase
    .from('entitlements')
    .select('id, status, kind, created_at, amount_note')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) return null
  return data
}

// amountNote is optional (back-compat) — set by OfferPayment as
// "GP-XXXX · ₪<amount> · Bit" so the operator can match the transfer in her Bit app.
export async function createEntitlement(artistId, subjectId, amountNote) {
  if (DEMO) {
    // DEMO has no server round-trip — persist the "I've paid" mark locally so
    // the pending screen (and the operator's payments queue) reflects it.
    writeDemoEnt({
      status: 'pending',
      created_at: new Date().toISOString(),
      ...(amountNote ? { amount_note: amountNote } : {}),
    })
    return readDemoEnt()
  }
  const insert = { artist_id: artistId, subject_id: subjectId, kind: 'founding_passport', status: 'pending' }
  if (amountNote) insert.amount_note = amountNote
  const { data, error } = await supabase.from('entitlements')
    .insert(insert)
    .select().single()
  if (error) throw error
  return data
}

export async function adminListPendingEntitlements() {
  if (DEMO) {
    // Only a reference the demo artist actually marked shows up — the operator
    // queue mirrors the same local lifecycle (and empties after activation).
    const e = readDemoEnt()
    return e?.status === 'pending' ? [e] : []
  }
  const { data, error } = await supabase
    .from('entitlements')
    // artist_id is needed by the P1-1 "payment activated" notification writer
    // (AdminDashboard.activate) — it can't be derived from artists(stage_name).
    .select('id, artist_id, status, created_at, amount_note, subject_id, artists(stage_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  const rows = data ?? []
  // Best-effort subject email lookup (public.person, keyed on the same auth.users id).
  // Not a foreign-key embed on purpose: entitlements.subject_id has no FK to
  // public.person, so a PostgREST embed would 400. A plain filtered select degrades
  // to "no email" (RLS may not yet grant operator read on person) without ever
  // failing the whole payments list.
  const subjectIds = [...new Set(rows.map((r) => r.subject_id).filter(Boolean))]
  let emailById = {}
  if (subjectIds.length) {
    const { data: people } = await supabase.from('person').select('id, email').in('id', subjectIds)
    emailById = Object.fromEntries((people ?? []).map((p) => [p.id, p.email]))
  }
  return rows.map((r) => ({ ...r, subject_email: emailById[r.subject_id] || null }))
}

export async function adminActivateEntitlement(id) {
  if (DEMO) { writeDemoEnt({ status: 'active', activated_at: new Date().toISOString() }); return }
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
