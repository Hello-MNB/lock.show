// ============================================================
// ACT SCOPE — the ONE authority for "which Act does this write belong to?"
//
// CANON (CLAUDE.md · MULTI-ACT): one Person may hold several Acts, each with its
// own Passport and its own evidence. **Evidence is per-Act and NON-transferable
// — a new Act starts empty.**
//
// THE DEFECT THIS MODULE EXISTS TO MAKE UNREPEATABLE (LANE-A T-106, wrong-entity
// write after an Act switch):
//   The Radar's Act switch (RadarUniverse.pickAct) swapped the READ side only —
//   `effArtist/effItems/effClaims` came from the selected Act — while every
//   WRITE still addressed `artist.id`, i.e. the DEFAULT Act:
//     · updateAct(artist.id, …)                  ← goal + declared community count
//     · addProfileItem({ artist_id: artist.id })  ← migration 020's
//     · addEvidence({ artist_id: artist.id })        `set_act_from_artist_id`
//                                                    trigger then stamps
//                                                    act_id := artist_id, so the
//                                                    row is filed under the
//                                                    DEFAULT Act
//     · onArtistChange(patch) → upsertArtist on the DEFAULT `artists` row
//     · onClaimsChange(…)     → the parent's (default-Act) claims array, which
//                               the switched view does not even render
//   Net effect: while a second Act was on screen, everything the artist added
//   silently crossed into their FIRST Act, and the screen never changed — so the
//   control also read as dead. Both halves are fixed by routing every write
//   through the helpers below.
//
// TRANSITION MODEL (migration 020): the DEFAULT Act shares its id with the
// `artists` row, so `actId === artist.id` means "default Act" and the existing
// artists-first write path stays byte-identical. Only a NON-default Act takes
// the act-scoped path.
// ============================================================

// Identity fields that exist on BOTH `artists` and `act` — the mapping is
// artists-column → act-column. Same table used by ActEditor.jsx (which proved
// this pattern for the identity editor); imported from here so the two screens
// can never drift into two different mappings.
export const ACT_IDENTITY_COLS = Object.freeze({
  stage_name: 'stage_name',
  city: 'city',
  photo_url: 'photo_url',
  genre: 'genre',
  one_line: 'positioning',
})

// Act-only columns (public.act), addressed by their own name in both directions.
export const ACT_OWN_FIELDS = Object.freeze(['artist_goal', 'format', 'community_count_declared'])

// TRUE when this id addresses the default Act (migration 020: act.id === artists.id).
export function isDefaultAct(actId, artistId) {
  return !actId || !artistId || actId === artistId
}

// Split an artists-shaped patch into the part that HAS an act-scoped home and
// the part that does not.
//   → { actPatch, unscoped }
// `unscoped` holds the draw/kit fields that live only on `artists`
// (lineup_frequency_band, sells_tickets, price_band, community_size_band,
// set_length, regions, rider_url, invoice_ready, whatsapp_number…). Migration
// 020 threaded act_id through the ELEVEN evidence/proof tables — it did NOT
// act-scope these columns, and RadarUniverse's own Act-switch already blanks
// them for a non-default Act precisely because they have no act-scoped value.
// Writing them anyway is what produced the cross-Act contamination; the caller
// must refuse instead (see actScopeGap below), never silently retarget them.
export function splitArtistPatchForAct(patch) {
  const actPatch = {}
  const unscoped = []
  for (const [k, v] of Object.entries(patch || {})) {
    const col = ACT_IDENTITY_COLS[k]
    if (col) { actPatch[col] = v; continue }
    if (ACT_OWN_FIELDS.includes(k)) { actPatch[k] = v; continue }
    unscoped.push(k)
  }
  return { actPatch, unscoped }
}

// Stamp an evidence/proof insert with the Act it really belongs to. Passing
// act_id EXPLICITLY is what stops migration 020's `set_act_from_artist_id`
// BEFORE-INSERT trigger from defaulting it to artist_id (the trigger only fills
// a NULL). artist_id stays the owning artists row — a non-default Act has no
// artists row of its own, which is exactly why act_id is the discriminator.
export function withActId(row, actId) {
  if (!actId) return row
  return { ...row, act_id: actId }
}
