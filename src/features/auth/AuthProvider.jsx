import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isConfigured } from '../../lib/supabase.js'
import { getProfile } from '../../lib/db.js'
import { DEMO } from '../../lib/demo.js'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

// DEMO: pick a persona (stored in localStorage) — no real auth, no Supabase.
function DemoAuthProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem('gigproof_demo_role') || null)
  const setDemoRole = useCallback((r) => {
    if (r) localStorage.setItem('gigproof_demo_role', r)
    else localStorage.removeItem('gigproof_demo_role')
    setRole(r)
  }, [])
  const user = role ? { id: 'demo-user', email: 'demo@gigproof.test' } : null
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
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      // AWAIT the profile: `loading` must cover the ROLE too, or every hard
      // reload races RequireRole/RoleHome with role=null and bounces the user
      // to /select ("Who are you?") — the exact broken-refresh Maria hit.
      if (data.session?.user) await loadProfile(data.session.user.id)
      setLoading(false)
    })
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
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: fullName ?? null } },
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
    // Respect the embed base path: '/' standalone (app.gigproof.co) vs '/app/'
    // when served under the public website (gigproof-website.vercel.app/app).
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
