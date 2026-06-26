import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isConfigured } from '../../lib/supabase.js'
import { getProfile, upsertProfile } from '../../lib/db.js'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
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
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) loadProfile(data.session.user.id)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s?.user) loadProfile(s.user.id)
      else setProfile(null)
    })
    return () => sub.subscription.unsubscribe()
  }, [loadProfile])

  const signUp = useCallback(async ({ email, password, fullName, role }) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    const user = data.user
    // data.session is null when Supabase requires email confirmation.
    // Only write the profile row if we already have a live session.
    // If not, the profile is created after the user confirms and logs in
    // (RoleHome sends them to /select → UserTypeSelect creates the row).
    if (user && data.session) {
      await upsertProfile({ id: user.id, role: role ?? 'artist', full_name: fullName ?? null })
      await loadProfile(user.id)
    }
    return data
  }, [loadProfile])

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.user) await loadProfile(data.user.id)
    return data
  }, [loadProfile])

  const signInWithOAuth = useCallback(async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
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
