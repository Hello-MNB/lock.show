export function resolveRosterArtistSelection(artists, selectedId) {
  const eligible = Array.isArray(artists) ? artists.filter((artist) => artist?.id) : []
  if (eligible.length === 0) return { state: 'missing', artistId: null }
  if (eligible.length === 1) return { state: 'ready', artistId: eligible[0].id }
  if (!selectedId) return { state: 'selection_required', artistId: null }
  if (!eligible.some((artist) => artist.id === selectedId)) return { state: 'invalid', artistId: null }
  return { state: 'ready', artistId: selectedId }
}
