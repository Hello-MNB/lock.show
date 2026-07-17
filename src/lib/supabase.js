import { createClient } from '@supabase/supabase-js'
import { DEMO } from './demo.js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

const realConfig = Boolean(url && anon && !url.includes('YOUR-PROJECT'))

// `isConfigured` gates the setup notice. In DEMO mode it's true (routes render
// from fixtures) even though there is no real client.
export const isConfigured = DEMO || realConfig

// Endless-skeleton guard (owner hit 17 Jul: /artist/home stuck on skeletons).
// A data call that neither resolves nor rejects (dropped connection, stalled
// token refresh in a many-tab browser) left `loading` true forever. Every
// request now aborts after 15s → the promise REJECTS → each screen's existing
// catch/finally path renders its error-retry state instead of a silent hang.
const FETCH_TIMEOUT_MS = 15_000
function timeoutFetch(input, init = {}) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(new DOMException('timeout', 'TimeoutError')), FETCH_TIMEOUT_MS)
  // respect a caller-provided signal as well
  if (init.signal) init.signal.addEventListener('abort', () => ctrl.abort(init.signal.reason), { once: true })
  return fetch(input, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(t))
}

// No real client in DEMO — db.js + the public Passport short-circuit to fixtures.
export const supabase = (!DEMO && realConfig)
  ? createClient(url, anon, {
      global: { fetch: timeoutFetch },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // OAuth (Google) fix: Supabase's provider redirect returns a `?code=`
        // (PKCE). Without flowType:'pkce' + detectSessionInUrl the client can't
        // exchange it, so the user lands back on the login screen after Google
        // — the exact bug Maria hit 9 Jul. PKCE is also the secure default for
        // a browser SPA.
        flowType: 'pkce',
        detectSessionInUrl: true,
      },
    })
  : null
