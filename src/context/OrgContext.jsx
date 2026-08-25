import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider.jsx'
import { getMyMemberships, resolvePrimaryWorkspace, commitActiveWorkspace, normalizeFunctionalRole } from '../lib/orgs.js'
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

// Base (profile) roles whose EFFECTIVE role is recomputed from the active
// workspace's functional_role. Per the entity model (spec §3), role derives from
// the OrgContext, not the static profile field. OPERATOR is deliberately excluded
// — it is a platform role, not a workspace membership, and must stay operator.
// booker/producer are INCLUDED (D2 fix): a base-role booker or producer who
// creates or switches INTO an agency/production workspace was previously
// dead-ended — the pill moved but the screen-set didn't, because their effective
// role was never recomputed. The derivation below only changes behavior when the
// active membership's functional_role DIFFERS from the base role (i.e. an actual
// switch); a membership-less account has no active.functional_role and falls back
// to authRole, so those personas are unaffected.
export function OrgProvider({ children }) {
  const { user, role: authRole } = useAuth()
  const nav = useNavigate()
  const [memberships, setMemberships] = useState([])
  const [activeOrgId, setActiveOrgIdState] = useState(null)
  const [contextVersion, setContextVersion] = useState(0)
  const [resolutionOutcome, setResolutionOutcome] = useState(null)
  const [resolvedRole, setResolvedRole] = useState(null)
  const [dirtyWork, setDirtyWork] = useState({ state: 'CLEAN', owners: [] })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) { setMemberships([]); setActiveOrgIdState(null); setResolvedRole(null); setLoading(false); return }
    setLoading(true)
    try {
      const m = await getMyMemberships()
      setMemberships(m)
      const resolution = await resolvePrimaryWorkspace(window.location.pathname)
      setResolutionOutcome(resolution?.outcome || 'ERROR_OR_OFFLINE')
      setContextVersion(resolution?.contextVersion || 0)
      setActiveOrgIdState(resolution?.outcome === 'RESOLVED_PRIMARY' ? resolution.workspace?.id : null)
      if (resolution?.outcome === 'RESOLVED_PRIMARY') setResolvedRole(resolution?.role)
      else setResolvedRole(null)
    } catch {
      setMemberships([])
      setResolutionOutcome('ERROR_OR_OFFLINE')
      setResolvedRole(null)
    } finally {
      setLoading(false)
    }
  }, [user, authRole])

  useEffect(() => { load() }, [load])

  // Context/nav never changes until the server returns a committed receipt.
  // Client storage is not an authority source and is deliberately absent.
  const switchOrg = useCallback(async (orgId) => {
    if (dirtyWork.state === 'DIRTY') throw new Error('DIRTY_WORK_BLOCKED')
    const receipt = await commitActiveWorkspace({
      orgId,
      contextVersion,
      idempotencyKey: crypto.randomUUID(),
      returnTo: '/',
    })
    if (receipt?.status !== 'COMMITTED') throw new Error('workspace_switch_not_committed')
    setActiveOrgIdState(receipt.workspace.id)
    setContextVersion(receipt.contextVersion)
    setResolutionOutcome('RESOLVED_PRIMARY')
    setResolvedRole(receipt.role)
    logEvent(EVENTS.WORKSPACE_SWITCHED, { org_id: orgId }) // pilot signal (A10)
    nav(receipt.route || '/')
    return receipt
  }, [contextVersion, dirtyWork.state, nav])

  const registerDirtyWork = useCallback((owner, isDirty) => {
    setDirtyWork((current) => {
      const owners = new Set(current.owners)
      if (isDirty) owners.add(owner); else owners.delete(owner)
      return { state: owners.size ? 'DIRTY' : 'CLEAN', owners: [...owners] }
    })
  }, [])

  const active = memberships.find((m) => m.organization?.id === activeOrgId) || null
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
  const serverRole = normalizeFunctionalRole(resolvedRole?.type)
  const role = resolutionOutcome === 'RESOLVED_PRIMARY' ? serverRole : authRole

  const value = {
    loading,
    memberships,
    resolutionOutcome,
    contextVersion,
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
    dirtyWork,
    registerDirtyWork,
    reload: load,
  }
  return <OrgCtx.Provider value={value}>{children}</OrgCtx.Provider>
}
