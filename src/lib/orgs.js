// Org-first account model — the ONLY module that talks to Supabase for org data.
// Bootstrap, memberships, members/invites, subscription/seats. Demo-guarded.
// RLS (008) + RPCs (009) enforce tenancy + seat limits server-side; these are thin wrappers.
import { supabase } from './supabase.js'
import { DEMO, demoOrg, demoSubscription, demoMemberships, demoMembers, demoRadarRecords, demoUpgradeRequests, demoInviteInfo } from './demo.js'

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

// ── Memberships + active-org context (O3) ──
export async function getMyMemberships() {
  if (DEMO) return demoMemberships
  const { data, error } = await supabase
    .from('organization_membership')
    .select('id, org_role, status, organization:organization_id(id, name, slug, plan)')
    .eq('status', 'active')
  if (error) throw error
  return data ?? []
}

export async function getActiveOrgId() {
  if (DEMO) return demoOrg.id
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
