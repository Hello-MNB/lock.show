import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider.jsx'

const AdminAccessCtx = createContext(null)
const ADMIN_ENVIRONMENT = 'production'

export const useAdminAccess = () => useContext(AdminAccessCtx) || {}

export function AdminAccessProvider({ children }) {
  const { user, session } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(Boolean(user))
  const [access, setAccess] = useState({ allowed: false, reason: 'not_checked' })
  const returnPath = useRef('/')
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

  useEffect(() => {
    if (!adminMode) return undefined
    const refresh = () => { if (document.visibilityState === 'visible') preflight() }
    const timer = window.setInterval(preflight, 60_000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [adminMode, preflight])

  const enterAdmin = useCallback(async ({ dirtyWork } = {}) => {
    if (dirtyWork?.state === 'DIRTY') return { allowed: false, reason: 'DIRTY_WORK_BLOCKED' }
    const current = await preflight()
    if (!current.allowed) return current
    returnPath.current = location.pathname + location.search
    nav('/admin')
    return current
  }, [location.pathname, location.search, nav, preflight])

  const exitAdmin = useCallback(() => {
    const target = returnPath.current || '/'
    returnPath.current = '/'
    nav(target === '/admin' || target.startsWith('/admin/') ? '/' : target)
  }, [nav])

  useEffect(() => {
    if (adminMode && !loading && !access.allowed) nav('/', { replace: true })
  }, [access.allowed, adminMode, loading, nav])

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
