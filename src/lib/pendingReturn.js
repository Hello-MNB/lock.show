export const PENDING_RETURN_KEY = 'lock_pending_return'

export function normalizePendingReturn(value) {
  const path = typeof value === 'string' ? value.trim() : ''
  if (!path.startsWith('/') || path.startsWith('//')) return null
  if (/^\/(login|signup|select)(?:[/?#]|$)/.test(path)) return null
  return path
}

export function locationReturnPath(location) {
  return normalizePendingReturn(`${location?.pathname || ''}${location?.search || ''}`)
}

export function savePendingReturn(value) {
  const path = normalizePendingReturn(value)
  if (!path) return null
  try { sessionStorage.setItem(PENDING_RETURN_KEY, path) } catch { /* unavailable */ }
  return path
}

export function readPendingReturn({ consume = false } = {}) {
  let path = null
  try {
    path = normalizePendingReturn(sessionStorage.getItem(PENDING_RETURN_KEY))
    if (consume && path) sessionStorage.removeItem(PENDING_RETURN_KEY)
  } catch { /* unavailable */ }
  return path
}
