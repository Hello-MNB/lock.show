import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isConfigured } from '../../lib/supabase.js'
import { getProfile } from '../../lib/db.js'
import { DEMO } from '../../lib/demo.js'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

// NOTE on `role` (ROUND 4 IA fix): this provider only ever knows the person's
// BASE/global role (profiles.role in real mode; the persona picked at the demo
// login chooser in DEMO mode). It intentionally does NOT know which workspace
// is active — OrgProvider is mounted BELOW this one (see main.jsx) precisely so
// the org/membership lookups can read `user` from here without a circular
// dependency. The EFFECTIVE role that should drive nav + RoleHome routing after
// a workspace switch lives in OrgContext.jsx (`useOrg().role`), derived from the
// ACTIVE workspace's role_assignment — NOT this `role`. Read useOrg().role for
// anything nav/route-related; this `role` remains the right value only for
// identity-level operations that must never change on a workspace switch (e.g.
// saving profiles.role itself in Settings).

// DEMO: pick a persona (stored in localStorage) — no real auth, no Supabase.
function DemoAuthProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem('gigproof_demo_role') || null)
  const setDemoRole = useCallback((r) => {
    if (r) localStorage.setItem('gigproof_demo_role', r)
    else localStorage.removeItem('gigproof_demo_role')
    setRole(r)
  }, [])
  const user = role ? { id: 'demo-user', email: 'demo@lock.test' } : null
  const profile = role ? { id: 'demo-user', role, full_name: 'Demo' } : null
  const value = {
    isConfigured: true, loading: false, session: user ? { user } : null,
    user, profile, role, demo: true, setDemoRole,
    reloadProfile: async () => {},
    signUp: async () => ({}), signIn: async () => ({}), signInWithOAuth: async () => {},
    signOut: async () => setDemoRole(null),
  }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function AuthProvider({ children }) {
  return DEMO ? <DemoAuthProvider>{children}</DemoAuthProvider> : <RealAuthProvider>{children}</RealAuthProvider>
}

function RealAuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null) // { id, role, full_name }
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId) => {
    if (!userId || !supabase) return null
    const data = await getProfile(userId)
    setProfile(data)
    return data
  }, [])

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }
    ;(async () => {
      // OAuth callback (Google): the provider returns ?code=… (PKCE). The
      // automatic URL-detection races the router — routing bounced the user to
      // /login before the code was exchanged, stripping ?code, so login never
      // stuck (Maria, 9 Jul). Do the exchange EXPLICITLY here, before any
      // routing/getSession, then clean the URL. This is the robust SPA pattern.
      try {
        const params = new URLSearchParams(window.location.search)
        if (params.get('code')) {
          await supabase.auth.exchangeCodeForSession(window.location.href)
          // strip ?code/?state from the address bar (no reload)
          window.history.replaceState({}, '', window.location.pathname)
        }
      } catch (e) {
        console.error('[oauth] code exchange failed:', e?.message || e)
      }
      try {
        const { data } = await supabase.auth.getSession()
        setSession(data.session)
        // AWAIT the profile: `loading` must cover the ROLE too, or every hard
        // reload races RequireRole/RoleHome with role=null and bounces the user
        // to /select ("Who are you?") — the exact broken-refresh Maria hit.
        if (data.session?.user) await loadProfile(data.session.user.id)
      } catch (e) {
        // A transient getSession/getProfile failure on boot must NEVER strand
        // the whole app on the <Loading/> spinner with no recovery. Always fall
        // through to setLoading(false) so the router can render (login/home).
        console.error('[auth] boot init failed:', e?.message || e)
      } finally {
        setLoading(false)
      }
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s?.user) loadProfile(s.user.id)
      else setProfile(null)
    })
    return () => sub.subscription.unsubscribe()
  }, [loadProfile])

  const signUp = useCallback(async ({ email, password, fullName }) => {
    // Auth FIRST. No role/profile is created here — the user picks their type at
    // /select (UserTypeSelect) AFTER auth, which creates the profile row. Keeps the
    // flow uniform for email + OAuth: auth → choose user-type → route. The name is
    // stashed in auth metadata so /select can persist it.
    // emailRedirectTo must match the surface the user signed up on (standalone
    // app.lock.show vs the /app embed) — OAuth already does this; email signup
    // must too, or confirmation links bounce to the wrong deployment.
    const base = import.meta.env.BASE_URL || '/'
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName ?? null },
        emailRedirectTo: window.location.origin + base,
      },
    })
    if (error) throw error
    return data
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.user) await loadProfile(data.user.id)
    return data
  }, [loadProfile])

  const signInWithOAuth = useCallback(async (provider) => {
    // Respect the embed base path: '/' standalone (app.lock.show) vs '/app/'
    // when served under the public website (lock.show/app).
    // Landing back on the right base means the redirect hits RoleHome ("/"),
    // which already bounces a role-less user (first-time social signer) to
    // /select — same profile-bootstrap path email signup uses (UserTypeSelect).
    const base = import.meta.env.BASE_URL || '/'
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin + base },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut()
    setProfile(null)
  }, [])

  const value = {
    isConfigured,
    loading,
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.role ?? null,
    reloadProfile: () => loadProfile(session?.user?.id),
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
  }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
