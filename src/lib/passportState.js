// Tracks whether the artist has visibility/claim edits not yet pushed to the
// public snapshot. Device-local (localStorage) — a lightweight "you have
// unpublished changes" hint, NOT a security boundary. The server's immutable
// passport_versions snapshot remains the source of truth; this only nudges the
// artist to re-publish so their edits reach the public דרכון.
const key = (artistId) => `gigproof_pp_dirty_${artistId}`

export function markPassportDirty(artistId) {
  try { if (artistId) localStorage.setItem(key(artistId), '1') } catch { /* storage unavailable — ignore */ }
}

export function clearPassportDirty(artistId) {
  try { if (artistId) localStorage.removeItem(key(artistId)) } catch { /* ignore */ }
}

export function isPassportDirty(artistId) {
  try { return !!artistId && localStorage.getItem(key(artistId)) === '1' } catch { return false }
}
