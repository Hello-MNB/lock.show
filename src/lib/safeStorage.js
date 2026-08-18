/**
 * FAIL-SOFT WEB STORAGE — the executable half of ONB-RESUME-STORAGE.
 *
 * Web storage is not a null-returning cache. When a browser has site data
 * disabled (restricted webviews, some private modes, enterprise policy) the
 * PROPERTY ACCESS itself throws a SecurityError — before any method is called.
 * That is why every helper here reaches for `globalThis.sessionStorage` INSIDE
 * the try: a wrapper that resolved the store first and guarded only the method
 * call would still throw on the browsers this exists for.
 *
 * WHY THIS IS A MODULE AND NOT THREE LOCAL FUNCTIONS. Independent review
 * (QA-INDEP-01, finding F4) showed the gate could only prove the SHAPE of a
 * try/catch, never the behaviour: a `catch` that rethrew still counted as
 * guarded, so the defect this code exists to prevent could be reintroduced with
 * the gate green. Local functions inside a React component module cannot be
 * imported by a test without pulling in the router, the Supabase client and the
 * whole component tree. Exported here, the fail-soft path can be EXECUTED
 * against a throwing store and asserted — which is the difference between a
 * gate that models the mechanism and one that measures it.
 *
 * Return contract, so callers never have to guess:
 *   get    → the stored string, or null when storage is unavailable OR unset
 *            (a caller that must tell those apart should not be using storage)
 *   set    → true if it was written, false if storage refused
 *   remove → true if the call completed, false if storage refused
 */

export function safeSessionGet(key) {
  try { return globalThis.sessionStorage.getItem(key) } catch { return null }
}

export function safeSessionSet(key, value) {
  try { globalThis.sessionStorage.setItem(key, value); return true } catch { return false }
}

export function safeSessionRemove(key) {
  try { globalThis.sessionStorage.removeItem(key); return true } catch { return false }
}

export function safeLocalGet(key) {
  try { return globalThis.localStorage.getItem(key) } catch { return null }
}

export function safeLocalSet(key, value) {
  try { globalThis.localStorage.setItem(key, value); return true } catch { return false }
}

export function safeLocalRemove(key) {
  try { globalThis.localStorage.removeItem(key); return true } catch { return false }
}
