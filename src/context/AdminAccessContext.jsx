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

export function createAdminPreflightGate(initialIdentity = null) {
  let identity = initialIdentity
  let generation = 0
  let disposed = false

  return {
    setIdentity(nextIdentity) {
      if (disposed || Object.is(identity, nextIdentity)) return
      identity = nextIdentity
      generation += 1
    },
    begin(expectedIdentity) {
      if (disposed || !expectedIdentity || !Object.is(identity, expectedIdentity)) return null
      generation += 1
      return { identity, generation }
    },
    isCurrent(request) {
      return !disposed
        && Boolean(request)
        && Object.is(identity, request.identity)
        && generation === request.generation
    },
    invalidate() {
      generation += 1
    },
    dispose() {
      disposed = true
      generation += 1
    },
  }
}

export async function runAdminCapabilityPreflight({
  user,
  accessToken,
  background = false,
  identity,
  requestGate,
  fetchImpl = fetch,
  setAccess,
  setLoading,
}) {
  const request = requestGate?.begin(identity)
  const isCurrent = () => !requestGate || requestGate.isCurrent(request)
  if (requestGate && !request) return { allowed: false, reason: 'stale_preflight' }
  if (!user || !accessToken) {
    const denied = { allowed: false, reason: 'auth_required' }
    if (!isCurrent()) return { allowed: false, reason: 'stale_preflight' }
    setAccess(denied)
    if (!background) setLoading(false)
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
    if (!isCurrent()) return { allowed: false, reason: 'stale_preflight' }
    setAccess(safe)
    return safe
  } catch {
    if (!isCurrent()) return { allowed: false, reason: 'stale_preflight' }
    const failed = { allowed: false, reason: 'preflight_failed' }
    setAccess(failed)
    return failed
  } finally {
    if (!background && isCurrent()) setLoading(false)
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
  const { user, session, loading: authLoading = false } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [accessSnapshot, setAccessSnapshot] = useState({
    identity: null,
    value: { allowed: false, reason: 'not_checked' },
  })
  const returnPath = useRef('/')
  const requestGate = useRef(createAdminPreflightGate())
  const adminMode = location.pathname === '/admin' || location.pathname.startsWith('/admin/')
  const accessToken = session?.access_token
  const preflightIdentity = useMemo(
    () => authLoading ? null : Symbol('admin-preflight-identity'),
    [accessToken, authLoading, user?.id],
  )
  const setAccess = useCallback((value) => {
    setAccessSnapshot({ identity: preflightIdentity, value })
  }, [preflightIdentity])
  const accessIdentityMatches = Object.is(accessSnapshot.identity, preflightIdentity)
  const access = accessIdentityMatches
    ? accessSnapshot.value
    : { allowed: false, reason: authLoading ? 'auth_loading' : 'identity_changed' }
  const effectiveLoading = authLoading || loading || !accessIdentityMatches

  const preflight = useCallback((options = {}) => runAdminCapabilityPreflight({
    user,
    accessToken,
    background: options.background,
    identity: preflightIdentity,
    requestGate: requestGate.current,
    setAccess,
    setLoading,
  }), [accessToken, preflightIdentity, setAccess, user?.id])

  useEffect(() => {
    requestGate.current.setIdentity(preflightIdentity)
    setLoading(true)
    setAccess({ allowed: false, reason: authLoading ? 'auth_loading' : 'not_checked' })
    if (authLoading) return () => requestGate.current.invalidate()
    returnPath.current = readAdminReturnPath(user?.id) || '/'
    preflight()
    return () => requestGate.current.invalidate()
  }, [authLoading, preflight, preflightIdentity, user?.id])

  useEffect(() => {
    if (authLoading || loading || !user?.id || !accessToken || !adminMode) return undefined
    return subscribeAdminRevalidation({ revalidate: preflight })
  }, [accessToken, adminMode, authLoading, loading, preflight, user?.id])

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
    if (!authLoading && adminMode && !effectiveLoading && !access.allowed) {
      leaveAdminContext({ userId: user?.id, memoryRef: returnPath, navigate: nav, replace: true })
    }
  }, [access.allowed, adminMode, authLoading, effectiveLoading, nav, user?.id])

  const value = useMemo(() => ({
    ...access,
    loading: effectiveLoading,
    adminMode,
    environmentId: access.environmentId || ADMIN_ENVIRONMENT,
    preflight,
    enterAdmin,
    exitAdmin,
  }), [access, adminMode, effectiveLoading, enterAdmin, exitAdmin, preflight])

  return <AdminAccessCtx.Provider value={value}>{children}</AdminAccessCtx.Provider>
}
