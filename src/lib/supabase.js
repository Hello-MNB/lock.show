import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

// The app stays loadable before keys are added: we expose `isConfigured`
// so the UI can show a friendly setup screen instead of crashing.
export const isConfigured = Boolean(
  url && anon && !url.includes('YOUR-PROJECT')
)

export const supabase = isConfigured
  ? createClient(url, anon, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
