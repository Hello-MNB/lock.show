import { supabase } from './supabase.js'
import { DEMO } from './demo.js'
import { persistMyIdentity } from './identityCore.js'

export async function saveMyIdentity(rawDisplayName, { client = supabase } = {}) {
  const displayName = String(rawDisplayName || '').trim()
  if (!displayName) throw new Error('Display name is required.')
  if (displayName.length > 120) throw new Error('Display name is too long.')
  if (DEMO) return { displayName, authMetadataSynced: true }
  return persistMyIdentity(displayName, client)
}
