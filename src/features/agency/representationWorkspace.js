export async function loadRepresentationWorkspace({
  listRosterGrants,
  fetchGrantArtistState,
  listClaimsByArtists,
  listRequestsForArtists,
}) {
  const grants = await listRosterGrants()
  if (!Array.isArray(grants)) {
    return { available: false, artists: [], claims: [], requests: [], grants: [], state: {} }
  }

  const artistIds = grants.map((grant) => grant.artist_id).filter(Boolean)
  const state = artistIds.length ? await fetchGrantArtistState(artistIds) : {}
  const artists = grants.map((grant) => {
    const bounded = state[grant.artist_id] || {}
    return {
      id: grant.artist_id,
      stage_name: grant.artist_stage_name,
      city: grant.artist_city,
      published: bounded.published ?? null,
      profile_items: bounded.items ?? null,
      open_requests: bounded.openRequests || 0,
      access_scope: grant.scope || ['view'],
      grant_id: grant.grant_id,
    }
  })
  const [claims, requests] = artistIds.length
    ? await Promise.all([listClaimsByArtists(artistIds), listRequestsForArtists(artistIds)])
    : [[], []]
  return { available: true, artists, claims, requests, grants, state }
}
