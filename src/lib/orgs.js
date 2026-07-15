// Org-first account model — the ONLY module that talks to Supabase for org data.
// Bootstrap, memberships, members/invites, subscription/seats. Demo-guarded.
// RLS (008) + RPCs (009) enforce tenancy + seat limits server-side; these are thin wrappers.
import { supabase } from './supabase.js'
import { ROLES } from './constants.js'
import {
  DEMO, demoOrg, demoSubscription, demoMemberships, demoMembers, demoRadarRecords, demoUpgradeRequests, demoInviteInfo,
  demoAccessRequests, demoRequestArtistAccess, demoRespondToAccessRequest, demoRevokeArtistAccess,
  demoOrgGigs, demoOrgConfirmRequests, demoCreateWorkspace,
} from './demo.js'

// Maps role_assignment.functional_role (the DB vocabulary — includes rep/
// production seniority tiers like artist_manager/booking_agent) onto the app's
// 5 top-level ROLES used for nav/routing (ROUND 4: the ACTIVE workspace's
// functional_role drives nav/home, not a single global profile role). Client-
// side normalization only — never writes back to the DB.
function normalizeFunctionalRole(fr) {
  switch (fr) {
    case 'artist': return ROLES.ARTIST
    case 'booking_manager': case 'booker': case 'venue_programmer': return ROLES.BOOKER
    case 'agency': case 'artist_manager': case 'booking_agent': case 'roster_coordinator': case 'viewer': return ROLES.AGENCY
    case 'producer': return ROLES.PRODUCER
    case 'operator': return ROLES.OPERATOR
    default: return null
  }
}

// ── Bootstrap a personal solo org at signup (§19.5) ──
export async function bootstrapOrg({ name, functionalRole, email, displayName }) {
  if (DEMO) return demoOrg.id
  const { data, error } = await supabase.rpc('bootstrap_personal_org', {
    p_name: name || null,
    p_functional_role: functionalRole || 'booker',
    p_email: email || null,
    p_display_name: displayName || null,
  })
  if (error) throw error
  return data
}

// ── A2/N12 — create an ADDITIONAL workspace (G3) ──
// bootstrap_personal_org can't do this: it is deliberately idempotent per owner
// (returns the EXISTING org when the caller already owns one), and a direct
// client-side insert can't either — the first owner membership row can never
// pass mem_admin_write RLS (008) because the creator isn't a member yet (the
// exact chicken-and-egg 009 solved with a SECURITY DEFINER RPC). So this calls
// the create_workspace RPC (migration 035 — function only, no table/column
// changes) and fails SOFT with a typed result until 035 is applied, same
// pattern as the 027/032 wrappers above — the UI renders an honest
// "needs migration" note, never a crash and never a half-created workspace.
//
// G3 BOUNDARY (DEPLOY-GAPS testable condition): the RPC creates ONLY the
// organization + solo subscription + owner membership + role_assignment.
// NOTHING is copied or moved — evidence, billing and ArtistAccess grants stay
// bound to their original workspace; the new workspace starts empty.
//
// UI type vocabulary → DB vocabulary (migration 027 constraint values):
//   artist → 'artist' · agency → 'management' · production → 'producer'.
// functional_role: an agency AND a production office both normalize to the
// AGENCY nav family (workspace_type picks the production screen-set) — see
// normalizeFunctionalRole above and OrgContext's isProducerWorkspace.
const WORKSPACE_TYPE_BY_UI = { artist: 'artist', agency: 'management', production: 'producer' }
const FUNCTIONAL_ROLE_BY_UI = { artist: 'artist', agency: 'artist_manager', production: 'artist_manager' }
const MIGRATION_035_NOTE =
  '[create_workspace] migration 035 not applied yet — run supabase/migrations/035_create_workspace.sql (owner-approved) to enable adding workspaces.'

export async function createWorkspace({ name, type = 'artist' } = {}) {
  if (DEMO) return demoCreateWorkspace(name, type)
  const { data, error } = await supabase.rpc('create_workspace', {
    p_name: name || null,
    p_workspace_type: WORKSPACE_TYPE_BY_UI[type] || 'artist',
    p_functional_role: FUNCTIONAL_ROLE_BY_UI[type] || 'artist',
  })
  if (error) {
    if (error.code === '42883' || error.code === 'PGRST202' || /function .* does not exist/i.test(error.message || '')) {
      console.warn(MIGRATION_035_NOTE)
      return { ok: false, reason: 'migration-035-required' }
    }
    throw error
  }
  return { ok: true, id: data }
}

// ── Memberships + active-org context (O3) ──
export async function getMyMemberships() {
  if (DEMO) return demoMemberships
  const { data, error } = await supabase
    .from('organization_membership')
    // workspace_type (migration 027) drives the production-vs-management workspace
    // split — read alongside plan (tier) so OrgContext can derive BOTH axes: the
    // functional_role (nav role) and the org's workspace_type (production nav set).
    .select('id, org_role, status, organization:organization_id(id, name, slug, plan, workspace_type)')
    .eq('status', 'active')
  if (error) throw error
  const memberships = data ?? []
  // Attach the CALLER's functional_role per org (role_assignment, migration 008)
  // so OrgContext can derive the effective nav/routing role from the ACTIVE
  // workspace instead of a single global profile role (ROUND 4 canon: person →
  // workspace → role). Read-only, best-effort: any failure here just leaves
  // functional_role unset and the caller falls back to the profile role — it
  // never blocks the membership list itself from loading.
  try {
    const { data: { user } = {} } = await supabase.auth.getUser()
    if (user && memberships.length) {
      const { data: roles } = await supabase
        .from('role_assignment')
        .select('organization_id, functional_role')
        .eq('person_id', user.id)
      const byOrg = new Map((roles || []).map((r) => [r.organization_id, r.functional_role]))
      for (const m of memberships) m.functional_role = normalizeFunctionalRole(byOrg.get(m.organization?.id))
    }
  } catch { /* non-blocking */ }
  return memberships
}

export async function getActiveOrgId() {
  if (DEMO) {
    // Respect the demo persona just picked at the login chooser so each entity
    // lands on ITS OWN workspace (audit #2: was hardcoded to the artist org, so
    // the agency chip wrongly landed on /artist/home). artist→artist org,
    // agency/booker→management org, producer→producer org.
    try {
      const r = localStorage.getItem('gigproof_demo_role')
      if (r === 'agency' || r === 'booker') return 'demo-org-3'
      if (r === 'producer') return 'demo-org-2'
    } catch { /* storage unavailable — fall through to artist org */ }
    return demoOrg.id
  }
  const { data } = await supabase.from('active_role_context').select('active_organization_id').maybeSingle()
  return data?.active_organization_id ?? null
}

export async function setActiveOrg(orgId) {
  if (DEMO) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { error } = await supabase.from('active_role_context')
    .upsert({ person_id: user.id, active_organization_id: orgId, updated_at: new Date().toISOString() })
  if (error) throw error
}

// ── Organization settings (O1) ──
export async function getOrg(orgId) {
  if (DEMO) return demoOrg
  const { data, error } = await supabase.from('organization').select('*').eq('id', orgId).maybeSingle()
  if (error) throw error
  return data
}
export async function updateOrg(orgId, patch) {
  if (DEMO) return
  const { error } = await supabase.from('organization').update(patch).eq('id', orgId)
  if (error) throw error
}
export async function transferOwnership(orgId, toPersonId) {
  if (DEMO) return
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('organization_membership').update({ org_role: 'admin' })
    .eq('organization_id', orgId).eq('person_id', user.id)
  const { error } = await supabase.from('organization_membership').update({ org_role: 'owner' })
    .eq('organization_id', orgId).eq('person_id', toPersonId)
  if (error) throw error
}
export async function deleteOrg(orgId) {
  if (DEMO) return
  const { error } = await supabase.from('organization').delete().eq('id', orgId)
  if (error) throw error
}

// ── Members + invites (O2) ──
export async function getMembers(orgId) {
  if (DEMO) return demoMembers
  const { data, error } = await supabase
    .from('organization_membership')
    .select('id, org_role, status, invited_email, person:person_id(id, email, display_name)')
    .eq('organization_id', orgId)
    .order('created_at')
  if (error) throw error
  return data ?? []
}
export async function inviteMember(orgId, email, role) {
  if (DEMO) return 'demo-token'
  const { data, error } = await supabase.rpc('invite_member', { p_org: orgId, p_email: email, p_role: role || 'member' })
  if (error) throw error
  return data
}
export async function changeMemberRole(memId, role) {
  if (DEMO) return
  const { error } = await supabase.from('organization_membership').update({ org_role: role }).eq('id', memId)
  if (error) throw error
}
export async function removeMember(memId) {
  if (DEMO) return
  const { error } = await supabase.from('organization_membership').delete().eq('id', memId)
  if (error) throw error
}

// ── Accept invite (O4) ──
export async function acceptInvite(token) {
  if (DEMO) return demoOrg.id
  const { data, error } = await supabase.rpc('accept_invite', { p_token: token })
  if (error) throw error
  return data
}
// O4 — show who/what/where before the invitee is a member (SECURITY DEFINER RPC).
export async function getInviteInfo(token) {
  if (DEMO) return demoInviteInfo
  const { data, error } = await supabase.rpc('invite_info', { p_token: token })
  if (error) throw error
  return (data && data[0]) || null
}
// Resend = re-emit the invite (email provider is Phase-2); the membership/token persist.
export async function resendInvite(/* memId */) {
  if (DEMO) return
}
// Cancel a pending invite = remove the invited membership row.
export const cancelInvite = removeMember

// ── Subscription / seats (O5, O6) ──
export async function getSubscription(orgId) {
  if (DEMO) return demoSubscription
  const { data, error } = await supabase.from('subscription').select('*').eq('organization_id', orgId).maybeSingle()
  if (error) throw error
  return data
}
// Manual pilot: mark the upgrade as requested (status=trialing). A founder/operator
// confirms it (→ plan=agency, seats raised) in Step 4. No Stripe.
export async function requestUpgrade(orgId) {
  if (DEMO) return
  const { error } = await supabase.from('subscription').update({ status: 'trialing' }).eq('organization_id', orgId)
  if (error) throw error
}
export async function addSeats(orgId, seats) {
  if (DEMO) return
  const { data: sub } = await supabase.from('subscription').select('seats_included').eq('organization_id', orgId).maybeSingle()
  const { error } = await supabase.from('subscription')
    .update({ seats_included: (sub?.seats_included || 1) + seats }).eq('organization_id', orgId)
  if (error) throw error
}

// ── Operator: agency-upgrade queue + approval (founder confirms Solo→Agency). ──
export async function listUpgradeRequests() {
  if (DEMO) return demoUpgradeRequests
  const { data, error } = await supabase.from('subscription')
    .select('organization_id, plan, seats_included, status, organization:organization_id(name)')
    .eq('status', 'trialing')
  if (error) throw error
  return data ?? []
}
export async function approveUpgrade(orgId, seats = 5) {
  if (DEMO) return
  const { error } = await supabase.rpc('approve_agency_upgrade', { p_org: orgId, p_seats: seats })
  if (error) throw error
}

// ── ARTIST_ACCESS consent handshake (migration 027 target — REPRESENTATION-CANON
//    §1.1/§1.5, ENTITY-SPEC-ORG §2.5/§4(1)). Feature-detected: the scope/status
//    columns and the RPCs below only exist once 027 is applied to the live DB.
//    Until then every call here fails SOFT (console note + a typed {ok:false}
//    result) instead of throwing into the UI, so the screens can render a
//    "needs migration 027" state rather than crash. ──
const MIGRATION_027_NOTE =
  '[artist_access] migration 027 not applied yet — run supabase/migrations/027_workspace_types_and_access_scopes.sql (owner-approved) to enable the access handshake.'
function isPreMigration027(err) {
  const code = err?.code
  const msg = `${err?.message || ''} ${err?.details || ''} ${err?.hint || ''}`.toLowerCase()
  // 42P17 = infinite RLS recursion (artists<->artist_access before migration 030).
  // Catching it makes every cross-org read degrade to an honest empty + notice
  // instead of a hard throw (flow-gap F) — even if a future policy regresses.
  return code === 'PGRST202' || code === '42883' || code === '42703' || code === '23514' || code === '42P17'
    || msg.includes('could not find') || msg.includes('does not exist') || msg.includes('violates check constraint')
    || msg.includes('infinite recursion')
}

// Agency/production side — invite (or re-invite) an EXISTING artist by id.
// Never a cold directory (Amendment-13): the caller must already have the
// artist's Passport link/id. Starts status='pending' — no content is visible
// to the requesting org until the artist approves (RLS: can_access_artist()
// requires status='active').
export async function requestArtistAccess(orgId, artistId, { scope = ['view'], territory = null } = {}) {
  if (DEMO) return demoRequestArtistAccess(orgId, artistId, scope, territory)
  const { data, error } = await supabase.rpc('request_artist_access', {
    p_org: orgId, p_artist: artistId, p_scope: scope, p_territory: territory,
  })
  if (error) {
    if (isPreMigration027(error)) { console.warn(MIGRATION_027_NOTE); return { ok: false, reason: 'migration-027-required' } }
    throw error
  }
  return { ok: true, id: data }
}

// Agency side — requests THIS org has sent (pending/active/revoked). The
// embedded artist name only resolves once a grant is active — RLS hides the
// artists row entirely while pending, which is the "no content visible" rule
// enforced at the data layer, not just in the UI copy.
export async function listOutgoingAccessRequests(orgId) {
  if (DEMO) return demoAccessRequests.filter((r) => r.organization_id === orgId)
  const { data, error } = await supabase
    .from('artist_access')
    .select('id, artist_id, scope, territory, status, consent_at, expires_at, created_at, artist:artist_id(stage_name)')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  if (error) {
    if (isPreMigration027(error)) { console.warn(MIGRATION_027_NOTE); return [] }
    throw error
  }
  return data ?? []
}

// Artist side — incoming requests/grants targeting artists the caller's own
// active org(s) own. Uses the SECURITY DEFINER RPC because plain RLS never
// lets one org read another org's `name` — without it there'd be no safe way
// to show the artist WHO is asking.
export async function listIncomingAccessRequests() {
  if (DEMO) return demoAccessRequests
  const { data, error } = await supabase.rpc('list_incoming_access_requests')
  if (error) {
    if (isPreMigration027(error)) { console.warn(MIGRATION_027_NOTE); return [] }
    throw error
  }
  return data ?? []
}

// Artist side — approve (optionally narrowing scope) or decline a pending
// request. Approving stamps consent_at (the artist's explicit consent, per
// REPRESENTATION-CANON §1.1 — "grant requires the ARTIST's acceptance").
export async function respondToAccessRequest(id, approve, scope = null) {
  if (DEMO) return demoRespondToAccessRequest(id, approve, scope)
  const { error } = await supabase.rpc('respond_to_access_request', { p_id: id, p_approve: approve, p_scope: scope })
  if (error) {
    if (isPreMigration027(error)) { console.warn(MIGRATION_027_NOTE); return { ok: false, reason: 'migration-027-required' } }
    throw error
  }
  return { ok: true }
}

// Either side may revoke an active grant — "takes immediate effect... without
// revealing future artist data" (Screen-Spec AG2 acceptance criterion).
export async function revokeArtistAccess(id) {
  if (DEMO) return demoRevokeArtistAccess(id)
  const { error } = await supabase.rpc('revoke_artist_access', { p_id: id })
  if (error) {
    if (isPreMigration027(error)) { console.warn(MIGRATION_027_NOTE); return { ok: false, reason: 'migration-027-required' } }
    throw error
  }
  return { ok: true }
}

// ── Migration-032 RPCs (rel-07.13 A6+A7) — roster-from-grants + production inbox ──
// Both return null (not []) when 032 is not applied yet, so screens can render
// their honest needs-state gap instead of a fake empty state. 42883 = undefined
// function (SQL), PGRST202 = missing RPC (PostgREST).
const RPC_MISSING = (e) => e && (e.code === '42883' || e.code === 'PGRST202' || /function .* does not exist/i.test(e.message || ''))

// Manager office: ACTIVE consented grants → roster rows (grant ≠ ownership).
export async function listRosterGrants() {
  if (DEMO) return demoRadarRecords.map((r) => ({
    grant_id: `demo-grant-${r.artist.id}`, artist_id: r.artist.id,
    artist_stage_name: r.artist.stage_name || r.artist.name, artist_city: null,
    scope: ['view'], territory: null, status: 'active',
    consent_at: '2026-07-01T00:00:00Z', expires_at: null, created_at: '2026-07-01T00:00:00Z',
  }))
  const { data, error } = await supabase.rpc('list_roster_grants')
  if (error) { if (RPC_MISSING(error)) return null; throw error }
  return data ?? []
}

// Production workspace: availability requests this org sent, with status.
export async function listProductionRequests() {
  if (DEMO) return []
  const { data, error } = await supabase.rpc('list_production_requests')
  if (error) { if (RPC_MISSING(error)) return null; throw error }
  return data ?? []
}

// ── RADAR inputs (O5 agencies): per-roster-artist record for the §20 rules engine. ──
export async function getRadarInputs(orgId) {
  if (DEMO) return demoRadarRecords
  const { data: access } = await supabase
    .from('artist_access')
    .select('artist:artist_id(id, stage_name, name, published)')
    .eq('organization_id', orgId)
    .eq('status', 'active')
  const records = []
  for (const a of access || []) {
    const artist = a.artist
    if (!artist) continue
    const [claims, draw, demand] = await Promise.all([
      supabase.from('claims').select('claim_type, verification_status, visibility, method_label, expires_at').eq('artist_id', artist.id),
      supabase.from('draw_signals').select('signal_type, computed_at').eq('artist_id', artist.id),
      supabase.from('availability_requests').select('id, event_type, location, status').eq('artist_id', artist.id).eq('status', 'new'),
    ])
    records.push({ artist, claims: claims.data || [], draw: draw.data || [], demand: demand.data || [] })
  }
  return records
}

// ============================================================
// PRODUCTION WORKSPACE (organization.workspace_type = 'producer', migration 027)
// A production company (e.g. INSOMNIA TLV) runs its own events and books
// lineup slots — distinct from the individual `producer` (מפיק) role that
// confirms a single claim via a no-login magic link (role_assignment/
// ProducerConfirm.jsx). This section is org-scoped, real-schema, real-RLS.
// ============================================================

// Events + lineup — the `gigs` table (008 + 023 gig-depth) is org-scoped and
// one row = one artist's slot on one event (artist_id, role_at_event). There is
// no separate `event` table, so "events" are derived client-side by grouping
// gigs that share the same date+venue+title — each gig row inside a group is
// one lineup slot. Honest with the real schema: never invents an event that
// isn't backed by at least one gigs row.
export async function listOrgGigs(orgId) {
  if (DEMO) return demoOrgGigs
  const { data, error } = await supabase
    .from('gigs')
    .select('id, artist_id, title, event_date, venue, city, status, role_at_event, audience_band, closeout_status, artist:artist_id(stage_name)')
    .eq('organization_id', orgId)
    .order('event_date', { ascending: true })
  if (error) throw error
  return data ?? []
}

// Groups flat gig rows into events with nested lineup slots (pure client-side
// derivation — no new schema/migration needed; see listOrgGigs comment).
export function groupGigsIntoEvents(gigs) {
  const byKey = new Map()
  for (const g of gigs || []) {
    const key = `${g.event_date || 'tbd'}|${g.venue || ''}|${g.title || ''}`
    if (!byKey.has(key)) byKey.set(key, { key, event_date: g.event_date, venue: g.venue, city: g.city, title: g.title, slots: [] })
    byKey.get(key).slots.push(g)
  }
  return [...byKey.values()].sort((a, b) => (a.event_date || '9999').localeCompare(b.event_date || '9999'))
}

// Confirm-requests surface — producer_confirmations rows where THIS org is the
// confirming counterparty (an artist asked this production company to confirm
// a claim about one of its events). HONEST GAP, confirmed by reading 005/008/
// 018/019/027: no migration ever added an RLS policy or RPC letting the
// CONFIRMING org list producer_confirmations addressed to it — today's
// policies only cover the artist's own org (pc_org_read, via can_access_artist)
// and the operator (pc_operator_read). RLS would silently filter every row to
// zero for this org (no error — just an always-empty result), which would
// render as a false "no requests yet" state if we ran the query as-is. We
// deliberately return `null` (not `[]`) instead of querying, so the UI can
// render an honest "not wired yet" needs-state rather than a fake empty one.
// Fix: a list_incoming_confirmation_requests SECURITY DEFINER RPC, same
// pattern as migration 027's list_incoming_access_requests, is the real build
// step this unblocks — tracked, not attempted here (out of this session's
// migration scope).
export async function listOrgConfirmRequests(orgId) {
  if (DEMO) return demoOrgConfirmRequests
  void orgId
  return null
}
