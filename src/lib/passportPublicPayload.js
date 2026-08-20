const PUBLIC_ARTIST_FIELDS = [
  'id', 'stage_name', 'name', 'genre', 'city', 'photo_url', 'one_line', 'regions',
  'set_length', 'invoice_ready', 'music_links', 'lineup_frequency_band',
  'sells_tickets', 'price_band', 'community_size_band', 'published',
]
const PUBLIC_ITEM_FIELDS = ['id', 'item_type', 'title', 'detail', 'item_date', 'public_url', 'source_status']
const PUBLIC_CLAIM_FIELDS = [
  'id', 'claim_type', 'value', 'public_band', 'public_wording', 'source_type',
  'verification_status', 'method_label', 'verified_at',
]

function pickDefined(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return Object.fromEntries(fields
    .filter((field) => value[field] !== undefined)
    .map((field) => [field, structuredClone(value[field])]))
}

// Final public boundary for both current rows and historical immutable snapshots.
// It is intentionally an allowlist: new private RADAR fields stay private unless
// the Product/Privacy contract explicitly promotes them into this list.
export function sanitizePassportPayload(payload = {}) {
  return {
    artist: pickDefined(payload.artist, PUBLIC_ARTIST_FIELDS),
    items: Array.isArray(payload.items)
      ? payload.items.map((item) => pickDefined(item, PUBLIC_ITEM_FIELDS)).filter(Boolean)
      : [],
    claims: Array.isArray(payload.claims)
      ? payload.claims.map((claim) => pickDefined(claim, PUBLIC_CLAIM_FIELDS)).filter(Boolean)
      : [],
  }
}
