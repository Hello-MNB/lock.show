export async function loadArtistDashboardData(artistId, {
  getAct,
  listItems,
  listClaims,
  getEntitlement,
  listRequests,
}) {
  const [act, items, claims, entitlement, requests] = await Promise.all([
    getAct(artistId).catch(() => null),
    listItems(artistId),
    listClaims(artistId),
    getEntitlement(artistId),
    listRequests(artistId).catch(() => null),
  ])

  return { act, items, claims, entitlement, requests }
}
