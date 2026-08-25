import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider.jsx'

const AdminAccessCtx = createContext(null)
const ADMIN_ENVIRONMENT = 'production'
const ADMIN_RETURN_KEY = 'lockshow:admin-return'

function isSafeAdminReturnPath(value) {
  return typeof value === 'string'
    && value.startsWith('/')
    && !value.startsWith('//')
    && value !== '/admin'
    && !value.startsWith('/admin/')
}

function adminReturnStorageKey(userId) {
  return userId ? `${ADMIN_RETURN_KEY}:${userId}` : null
}

function readAdminReturnPath(userId) {
  const key = adminReturnStorageKey(userId)
  if (!key || typeof window === 'undefined') return '/'
  try {
    const value = window.sessionStorage.getItem(key)
    return isSafeAdminReturnPath(value) ? value : '/'
  } catch {
    return '/'
  }
}

function writeAdminReturnPath(userId, value) {
  const key = adminReturnStorageKey(userId)
  if (!key || typeof window === 'undefined' || !isSafeAdminReturnPath(value)) return
  try { window.sessionStorage.setItem(key, value) } catch { /* fail closed to root */ }
}

function clearAdminReturnPath(userId) {
  const key = adminReturnStorageKey(userId)
  if (!key || typeof window === 'undefined') return
  try { window.sessionStorage.removeItem(key) } catch { /* no persistent authority state */ }
}

export const useAdminAccess = () => useContext(AdminAccessCtx) || {}

export function AdminAccessProvider({ children }) {
  const { user, session } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(Boolean(user))
  const [access, setAccess] = useState({ allowed: false, reason: 'not_checked' })
  const returnPath = useRef(readAdminReturnPath(user?.id))
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
    returnPath.current = readAdminReturnPath(user?.id)
  }, [user?.id])

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
    writeAdminReturnPath(user?.id, returnPath.current)
    nav('/admin')
    return current
  }, [location.pathname, location.search, nav, preflight, user?.id])

  const exitAdmin = useCallback(() => {
    const target = readAdminReturnPath(user?.id) || returnPath.current || '/'
    returnPath.current = '/'
    clearAdminReturnPath(user?.id)
    nav(target)
  }, [nav, user?.id])

  useEffect(() => {
    if (adminMode && !loading && !access.allowed) {
      const target = readAdminReturnPath(user?.id)
      clearAdminReturnPath(user?.id)
      returnPath.current = '/'
      nav(target, { replace: true })
    }
  }, [access.allowed, adminMode, loading, nav, user?.id])

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
