export async function persistMyIdentity(rawDisplayName, client) {
  const displayName = String(rawDisplayName || '').trim()
  if (!displayName) throw new Error('Display name is required.')
  if (displayName.length > 120) throw new Error('Display name is too long.')
  if (!client) throw new Error('Identity service is not configured.')

  const { error } = await client.rpc('update_my_identity', { p_display_name: displayName })
  if (error) throw error

  const { error: authError } = await client.auth.updateUser({
    data: { full_name: displayName, name: displayName },
  })
  return { displayName, authMetadataSynced: !authError }
}
