import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider.jsx'
import { getMyMemberships, getActiveOrgId, setActiveOrg as persistActiveOrg } from '../lib/orgs.js'
import { ROLES } from '../lib/constants.js'
import { logEvent, EVENTS } from '../lib/analytics.js'

// Active-organization context. The org is the tenant; this exposes which org the
// person is acting in, their org_role, and the plan (drives agency-feature unlock).
//
// ROUND 4 canon (person → workspace → role): `role` here is the EFFECTIVE
// nav/routing role, derived from the ACTIVE workspace's role_assignment
// (functional_role), NOT the static global profile role from useAuth(). Every
// nav/route consumer (App.jsx RequireRole/RoleHome, SideNav, BottomNav,
// ContextSwitcher) should read `role` from HERE, not from useAuth() — that is
// what makes switching workspaces actually recompute the screen-set instead of
// only moving a highlighted pill in the switcher sheet.
const OrgCtx = createContext(null)
export const useOrg = () => useContext(OrgCtx) || {}

const ACTIVE_ORG_KEY = 'gigproof_active_org_id'

// Only these base (profile) roles currently "own" a workspace that can be
// switched between (an artist's solo org vs. an agency/production org).
// producer/booker/operator have no workspace-switch concept in this model yet,
// so their profile role is left as the effective role — this keeps those demo
// personas (and any real account in the same boat) working exactly as before.
const ORG_DERIVED_ROLES = [ROLES.ARTIST, ROLES.AGENCY]

export function OrgProvider({ children }) {
  const { user, role: authRole } = useAuth()
  const nav = useNavigate()
  const [memberships, setMemberships] = useState([])
  const [activeOrgId, setActiveOrgIdState] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) { setMemberships([]); setActiveOrgIdState(null); setLoading(false); return }
    setLoading(true)
    try {
      const m = await getMyMemberships()
      setMemberships(m)
      // Restore order: this device's explicit last choice (localStorage) →
      // server-persisted active_role_context → the membership matching the
      // current profile role (keeps each role's existing default home on
      // first load) → first membership.
      const stored = localStorage.getItem(ACTIVE_ORG_KEY)
      const storedValid = stored && m.some((mm) => mm.organization?.id === stored)
      const roleMatchId = m.find((mm) => mm.functional_role === authRole)?.organization?.id
      const active = storedValid ? stored : ((await getActiveOrgId()) || roleMatchId || m[0]?.organization?.id || null)
      setActiveOrgIdState(active)
    } catch {
      setMemberships([])
    } finally {
      setLoading(false)
    }
  }, [user, authRole])

  useEffect(() => { load() }, [load])

  // Switching a workspace is client-side derivation only (no RLS/db writes
  // beyond the existing active_role_context upsert) — persist locally so a
  // reload keeps the chosen workspace, then send the user to "/" so RoleHome
  // (App.jsx) re-routes into the NEW workspace's home + nav set.
  const switchOrg = useCallback(async (orgId) => {
    setActiveOrgIdState(orgId)
    try { localStorage.setItem(ACTIVE_ORG_KEY, orgId) } catch { /* storage unavailable — in-memory only */ }
    try { await persistActiveOrg(orgId) } catch { /* non-blocking */ }
    logEvent(EVENTS.WORKSPACE_SWITCHED, { org_id: orgId }) // pilot signal (A10)
    nav('/')
  }, [nav])

  const active = memberships.find((m) => m.organization?.id === activeOrgId) || memberships[0] || null
  const plan = active?.organization?.plan || 'solo'
  // workspace_type (migration 027) — a SEPARATE axis from functional_role/plan:
  // a production company (e.g. INSOMNIA TLV) has functional_role='agency' (same
  // nav-role family as a booking/management agency) but workspace_type='producer'
  // — it runs its own events/lineups, so it gets the production nav set instead
  // of the generic roster screen. Orgs created before 027 (or in DEMO without an
  // explicit value) default to 'artist', matching the migration's own backfill.
  const workspaceType = active?.organization?.workspace_type || 'artist'
  const isProducerWorkspace = workspaceType === 'producer'

  // Effective role — recomputed from the ACTIVE workspace every time
  // activeOrgId changes, not read once from a static profile field.
  const role = (authRole && ORG_DERIVED_ROLES.includes(authRole) && active?.functional_role)
    ? active.functional_role
    : authRole

  const value = {
    loading,
    memberships,
    activeOrgId: active?.organization?.id || null,
    activeOrg: active?.organization || null,
    orgRole: active?.org_role || null,
    role,
    plan,
    workspaceType,
    isProducerWorkspace,
    isAgency: ['agency', 'agency_plus'].includes(plan),
    isOwner: active?.org_role === 'owner',
    isAdmin: ['owner', 'admin'].includes(active?.org_role),
    switchOrg,
    reload: load,
  }
  return <OrgCtx.Provider value={value}>{children}</OrgCtx.Provider>
}
