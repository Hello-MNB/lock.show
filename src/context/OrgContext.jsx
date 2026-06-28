import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '../features/auth/AuthProvider.jsx'
import { getMyMemberships, getActiveOrgId, setActiveOrg as persistActiveOrg } from '../lib/orgs.js'

// Active-organization context. The org is the tenant; this exposes which org the
// person is acting in, their org_role, and the plan (drives agency-feature unlock).
const OrgCtx = createContext(null)
export const useOrg = () => useContext(OrgCtx) || {}

export function OrgProvider({ children }) {
  const { user } = useAuth()
  const [memberships, setMemberships] = useState([])
  const [activeOrgId, setActiveOrgId] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) { setMemberships([]); setActiveOrgId(null); setLoading(false); return }
    setLoading(true)
    try {
      const m = await getMyMemberships()
      setMemberships(m)
      const active = (await getActiveOrgId()) || m[0]?.organization?.id || null
      setActiveOrgId(active)
    } catch {
      setMemberships([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  const switchOrg = useCallback(async (orgId) => {
    setActiveOrgId(orgId)
    try { await persistActiveOrg(orgId) } catch { /* non-blocking */ }
  }, [])

  const active = memberships.find((m) => m.organization?.id === activeOrgId) || memberships[0] || null
  const plan = active?.organization?.plan || 'solo'
  const value = {
    loading,
    memberships,
    activeOrgId: active?.organization?.id || null,
    activeOrg: active?.organization || null,
    orgRole: active?.org_role || null,
    plan,
    isAgency: ['agency', 'agency_plus'].includes(plan),
    isOwner: active?.org_role === 'owner',
    isAdmin: ['owner', 'admin'].includes(active?.org_role),
    switchOrg,
    reload: load,
  }
  return <OrgCtx.Provider value={value}>{children}</OrgCtx.Provider>
}
