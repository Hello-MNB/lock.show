import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider.jsx'

const AdminAccessCtx = createContext(null)
const ADMIN_ENVIRONMENT = 'production'
const ADMIN_RETURN_KEY = 'lockshow:admin-return'

export function isSafeAdminReturnPath(value) {
  return typeof value === 'string'
    && value.startsWith('/')
    && !value.startsWith('//')
    && value !== '/admin'
    && !value.startsWith('/admin/')
}

export function adminReturnStorageKey(userId) {
  return userId ? `${ADMIN_RETURN_KEY}:${userId}` : null
}

function browserSessionStorage() {
  if (typeof window === 'undefined') return null
  try { return window.sessionStorage } catch { return null }
}

export function readAdminReturnPath(userId, storage = browserSessionStorage()) {
  const key = adminReturnStorageKey(userId)
  if (!key || !storage) return null
  try {
    const value = storage.getItem(key)
    return isSafeAdminReturnPath(value) ? value : null
  } catch {
    return null
  }
}

export function writeAdminReturnPath(userId, value, storage = browserSessionStorage()) {
  const key = adminReturnStorageKey(userId)
  if (!key || !storage || !isSafeAdminReturnPath(value)) return
  try { storage.setItem(key, value) } catch { /* the in-memory return remains authoritative */ }
}

export function clearAdminReturnPath(userId, storage = browserSessionStorage()) {
  const key = adminReturnStorageKey(userId)
  if (!key || !storage) return
  try { storage.removeItem(key) } catch { /* no persistent authority state */ }
}

export function resolveAdminReturnPath(...candidates) {
  return candidates.find(isSafeAdminReturnPath) || '/'
}

export function leaveAdminContext({ userId, memoryRef, storage = browserSessionStorage(), navigate, replace = false }) {
  const target = resolveAdminReturnPath(readAdminReturnPath(userId, storage), memoryRef?.current)
  clearAdminReturnPath(userId, storage)
  if (memoryRef) memoryRef.current = '/'
  if (replace) navigate(target, { replace: true })
  else navigate(target)
  return target
}

export async function runAdminCapabilityPreflight({
  user,
  accessToken,
  background = false,
  fetchImpl = fetch,
  setAccess,
  setLoading,
}) {
  if (!user || !accessToken) {
    const denied = { allowed: false, reason: 'auth_required' }
    setAccess(denied)
    setLoading(false)
    return denied
  }
  if (!background) setLoading(true)
  try {
    const response = await fetchImpl(`/api/admin/capability?environment=${ADMIN_ENVIRONMENT}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
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
    if (!background) setLoading(false)
  }
}

export function subscribeAdminRevalidation({ windowRef = window, documentRef = document, revalidate }) {
  const refresh = () => {
    if (documentRef.visibilityState === 'visible') revalidate({ background: true })
  }
  const timer = windowRef.setInterval(() => revalidate({ background: true }), 60_000)
  windowRef.addEventListener('focus', refresh)
  documentRef.addEventListener('visibilitychange', refresh)
  return () => {
    windowRef.clearInterval(timer)
    windowRef.removeEventListener('focus', refresh)
    documentRef.removeEventListener('visibilitychange', refresh)
  }
}

export const useAdminAccess = () => useContext(AdminAccessCtx) || {}

export function AdminAccessProvider({ children }) {
  const { user, session } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(Boolean(user))
  const [access, setAccess] = useState({ allowed: false, reason: 'not_checked' })
  const returnPath = useRef(readAdminReturnPath(user?.id) || '/')
  const adminMode = location.pathname === '/admin' || location.pathname.startsWith('/admin/')

  const preflight = useCallback((options = {}) => runAdminCapabilityPreflight({
    user,
    accessToken: session?.access_token,
    background: options.background,
    setAccess,
    setLoading,
  }), [session?.access_token, user])

  useEffect(() => { preflight() }, [preflight])

  useEffect(() => {
    returnPath.current = readAdminReturnPath(user?.id) || '/'
  }, [user?.id])

  useEffect(() => {
    if (!adminMode) return undefined
    return subscribeAdminRevalidation({ revalidate: preflight })
  }, [adminMode, preflight])

  const enterAdmin = useCallback(async () => {
    const current = await preflight()
    if (!current.allowed) return current
    returnPath.current = resolveAdminReturnPath(location.pathname + location.search)
    writeAdminReturnPath(user?.id, returnPath.current)
    nav('/admin')
    return current
  }, [location.pathname, location.search, nav, preflight, user?.id])

  const exitAdmin = useCallback(() => {
    leaveAdminContext({ userId: user?.id, memoryRef: returnPath, navigate: nav })
  }, [nav, user?.id])

  useEffect(() => {
    if (adminMode && !loading && !access.allowed) {
      leaveAdminContext({ userId: user?.id, memoryRef: returnPath, navigate: nav, replace: true })
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
