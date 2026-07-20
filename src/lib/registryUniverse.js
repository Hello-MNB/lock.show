// ── Registry Universe — pure lookup layer over the generated registry data
// (R-6 phase 1, §16.A.5b). Reads src/lib/registryData.js (376 fields · 18
// segments → 6 planets, source docs/registry/F1.csv) and exposes small pure
// functions over it. No React, no DOM, no side effects, no network.
//
// This module is DELIBERATELY not wired into the live Radar yet — that
// happens in a later slot, once owner witness-fixes on radarUniverse.js /
// src/features/** / src/lib/i18n/** land (single-writer law, this territory
// is new-files-only). See the bottom of this file for the exact integration
// points scouted for that later slot.
//
// Family support today: 'dj-club' ONLY. F1.csv IS the dj-club baseline (no
// F2-F6-DELTAS.csv overlay needed to read it as dj-club — see generator
// header). The other five families (F2 Vocal · F3 Instrumental · F4 Band/
// Ensemble · F5 Live Electronic/Hybrid · F6 Creator/Composer/Producer) need
// the delta-application layer (segment_baseline / field_override /
// field_addition / activation_rule) built first — that is out of scope for
// this slot (F6 explicitly ruled out of scope pre-Gate; the others aren't
// ruled in yet either). Asking for any family other than 'dj-club' throws,
// rather than silently returning the wrong (unfiltered) data.

import { FIELDS, PLANET_KEYS } from './registryData.js'

export const SUPPORTED_FAMILIES = ['dj-club']

function assertSupportedFamily(family) {
  if (!SUPPORTED_FAMILIES.includes(family)) {
    throw new Error(
      `registryUniverse: family '${family}' is not wired yet (only ${SUPPORTED_FAMILIES.join(', ')} today) — ` +
      `F2-F6-DELTAS.csv application (segment_baseline/field_override/field_addition/activation_rule) is a later build slot.`
    )
  }
}

// fieldsForFamily(family) — the N-rule: applicability === 'na' fields are
// NEVER shown, NEVER asked, NEVER counted as a gap. F1's dj-club baseline
// currently has zero 'na' rows (asserted at generation time), so this is a
// no-op filter today — it stays here so the rule holds structurally even if
// a future CSV edit introduces an 'na' field.
export function fieldsForFamily(family) {
  assertSupportedFamily(family)
  return FIELDS.filter((f) => f.applicability !== 'na')
}

// planetGroups(family) — fields grouped planet → segment, segments as
// labeled clusters (§8.2). Returns an array ordered by the canon 6 planet
// order (PLANET_KEYS), each with its segments in first-appearance order
// within that planet, each segment holding its ordered field list:
//   [{ planet_key, segments: [{ segment, fields: [...] }] }]
export function planetGroups(family) {
  const fields = fieldsForFamily(family)
  const byPlanet = new Map(PLANET_KEYS.map((p) => [p, new Map()]))
  for (const f of fields) {
    const segMap = byPlanet.get(f.planet_key)
    if (!segMap) continue // defensive — generator's self-test already guarantees this never fires
    if (!segMap.has(f.segment)) segMap.set(f.segment, [])
    segMap.get(f.segment).push(f)
  }
  return PLANET_KEYS.map((planet_key) => ({
    planet_key,
    segments: [...byPlanet.get(planet_key).entries()].map(([segment, segFields]) => ({ segment, fields: segFields })),
  }))
}

// fieldById(id) — single field lookup by field_id (unique per field, across
// all families — the delta layer only ever overrides/adds field_ids, it
// never renames them).
export function fieldById(id) {
  return FIELDS.find((f) => f.field_id === id) || null
}

// ── LATER WIRING SLOT — integration points scouted, NOT touched here ──────
// (src/lib/radarUniverse.js is hard-fenced; read-only notes for whoever
// picks up the next slot)
//
// 1. radarUniverse.js buildUniverse()'s field nodes (idBits/kitBits/drawBits,
//    lines ~197-230) are currently a HAND-WRITTEN subset of 16 fields, each
//    carrying its own `why` key into T.radar.universe.why[whyKey] (en.js /
//    he.js ~L1109 / ~L1080). Those 16 why-keys (photo, positioning, genre,
//    goal, setLength, regions, rider, invoice, whatsapp, freqBand,
//    sellsTickets, priceBand, community, trackRecord, streaming,
//    ticketExport) are a DIFFERENT namespace from this module's why_key
//    (which equals field_id, e.g. 'stage_name', 'legal_name', …) — no
//    collisions today, but the later slot should decide whether the 16
//    hand-written nodes get re-derived FROM fieldsForFamily('dj-club') (by
//    matching field_id) or stay hand-written and simply gain a registry
//    cross-reference via fieldById().
// 2. claimPlanet()/linkPlanet() in radarUniverse.js hard-code planet
//    inference from claim_type/source_type/url patterns — the registry's
//    per-field `planet_key` (this module) is the governed source of truth
//    for the SAME 6 planets; a future pass could replace the heuristics with
//    a fieldById()/registry lookup where a claim's underlying field_id is
//    known.
// 3. i18n: WHY_KEY_MANIFEST (src/lib/registryData.js) lists all 376 why_key
//    entries with an EN label seed (field_label_en_seed, literal F1 text,
//    NOT persuasive copy) and he_seed: null. The later slot (or the
//    orchestrator directly) needs to write the actual "why a buyer cares"
//    sentence per key into src/lib/i18n/en.js + he.js under a NEW namespace
//    (something like T.registry.why[field_id] — do not collide with the
//    existing T.radar.universe.why[...] 16-key namespace described above).
// 4. PLANET_KEYS here is a plain duplicate of radarUniverse.js's PLANETS
//    key order (identity, music, live, audience, prokit, proof) — kept
//    independent on purpose (see file header). Once wiring starts, prefer
//    importing PLANETS from radarUniverse.js directly rather than keeping
//    two copies of the canon order in sync by hand.
