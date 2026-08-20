import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider.jsx'

const AdminAccessCtx = createContext(null)
const ADMIN_ENVIRONMENT = 'production'
const RETURN_KEY = 'lock_show_admin_return_path'

export const useAdminAccess = () => useContext(AdminAccessCtx) || {}

export function AdminAccessProvider({ children }) {
  const { user, session } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(Boolean(user))
  const [access, setAccess] = useState({ allowed: false, reason: 'not_checked' })
  const adminMode = location.pathname === '/admin' || location.pathname.startsWith('/admin/')

  const preflight = useCallback(async () => {
    if (!user || !session?.access_token) {
      setAccess({ allowed: false, reason: 'auth_required' })
      setLoading(false)
      return { allowed: false, reason: 'auth_required' }
    }
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/capability?environment=${ADMIN_ENVIRONMENT}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const result = await response.json().catch(() => ({ allowed: false, reason: 'invalid_response' }))
      const safe = response.ok && result.allowed
        ? result
        : { allowed: false, reason: result.reason || 'denied' }
      setAccess(safe)
      return safe
    } catch {
      const failed = { allowed: false, reason: 'preflight_failed' }
      setAccess(failed)
      return failed
    } finally {
      setLoading(false)
    }
  }, [session?.access_token, user])

  useEffect(() => { preflight() }, [preflight])

  const enterAdmin = useCallback(async () => {
    const current = await preflight()
    if (!current.allowed) return current
    try { sessionStorage.setItem(RETURN_KEY, location.pathname + location.search) } catch { /* in-memory navigation still works */ }
    nav('/admin')
    return current
  }, [location.pathname, location.search, nav, preflight])

  const exitAdmin = useCallback(() => {
    let target = '/'
    try {
      target = sessionStorage.getItem(RETURN_KEY) || '/'
      sessionStorage.removeItem(RETURN_KEY)
    } catch { /* safe default */ }
    nav(target === '/admin' || target.startsWith('/admin/') ? '/' : target)
  }, [nav])

  const value = useMemo(() => ({
    ...access,
    loading,
    adminMode,
    environmentId: access.environmentId || ADMIN_ENVIRONMENT,
    preflight,
    enterAdmin,
    exitAdmin,
  }), [access, adminMode, enterAdmin, exitAdmin, loading, preflight])

  return <AdminAccessCtx.Provider value={value}>{children}</AdminAccessCtx.Provider>
}
