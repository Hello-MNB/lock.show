// ============================================================
// REGISTRY DATA GENERATOR (R-6 phase 1, §16.A.5b) — parses the ONE schema
// (docs/registry/F1.csv, 483 rows · 376 fields · 18 segments → 6 planets)
// and emits src/lib/registryData.js: a plain generated JS module the Radar
// layer (later wiring slot) and any other UI-adjacent code can read.
//
// Cardinality reminder (F1 contract, registry README §Answers-to-GPT-Q4):
// F1 is ONE ROW PER FIELD × SOURCE — a field with 5 valid sources = 5 rows
// sharing the same field_id, each with its own evidence_ceiling/freshness.
// This generator AGGREGATES those rows down to one record per field_id
// (see "representative row" below) while losslessly preserving every raw
// source row under `sources[]` — nothing from the 15 F1 columns is dropped.
//
// Family scope (ruling ①, dj-club FIRST): F1 itself IS the dj-club family
// baseline — no F2-F6-DELTAS.csv overlay is needed to read it "as dj-club".
// This generator still filters F2-F6-DELTAS.csv for any dj-club-tagged
// records (future-proofing — none exist today; family_id enum there is only
// F2-F5-F6 per validate-deltas.mjs) and asserts/logs that count rather than
// silently assuming zero.
//
// Run: node scripts/generate-registry-data.mjs
// ============================================================
import { readFileSync, writeFileSync } from 'node:fs'

const F1_FILE = 'docs/registry/F1.csv'
const DELTAS_FILE = 'docs/registry/F2-F6-DELTAS.csv'
const OUT_FILE = 'src/lib/registryData.js'

// Canon 6 planets (radarUniverse.js PLANETS keys — §2). Duplicated here as a
// plain string list (NOT an import) so this generated-data layer stays
// independent of the live Radar until the later wiring slot connects them.
const PLANET_KEYS = ['identity', 'music', 'live', 'audience', 'prokit', 'proof']

// evidence_ceiling strength order — used to pick each field's REPRESENTATIVE
// row (the strongest evidentiary path available for that field across all
// of its sources). applicability/visibility/freshness/method_ceiling for the
// field all come from this one representative row so the record stays
// internally coherent (never mixing "required" from one source with the
// freshness rule of an unrelated source).
const CEILING_RANK = { verified: 4, supporting: 3, 'self-reported': 2, 'not-assessable': 1 }
// applicability strength order, used only to flag+report fields whose rows
// disagree (F1 currently has 6 such fields — see report).
const APPLICABILITY_RANK = { required: 3, conditional: 2, supporting: 1, na: 0 }

// Minimal RFC-4180 parser (quotes, embedded commas/newlines) — identical
// algorithm to scripts/validate-registry.mjs's parser, kept in sync by hand
// since these are two independent, single-purpose scripts.
function parseCsv(text) {
  const rows = []
  let row = [], cell = '', inQ = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++ } else inQ = false }
      else cell += c
    } else if (c === '"') inQ = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell); cell = ''
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
    } else cell += c
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  return rows
}

function readRows(file) {
  const rows = parseCsv(readFileSync(file, 'utf8'))
  const header = rows.shift()
  const idx = Object.fromEntries(header.map((c, i) => [c, i]))
  return { header, idx, rows }
}

// ── 1. parse F1.csv ──────────────────────────────────────────────────────
const F1 = readRows(F1_FILE)
const F1_EXPECTED_HEADER = ['field_id', 'field', 'segment', 'planet', 'source_brand', 'source_channel',
  'source_type', 'logo_asset', 'connection_method', 'evidence_ceiling', 'visibility', 'freshness_rule',
  'consent_requirement', 'limitation_text', 'applicability']
const unmapped = F1_EXPECTED_HEADER.filter((c) => !(c in F1.idx))
if (unmapped.length) {
  console.error(`✗ F1.csv columns not found (schema drift): ${unmapped.join(', ')}`)
  process.exit(1)
}
const extraCols = F1.header.filter((c) => !F1_EXPECTED_HEADER.includes(c))
if (extraCols.length) {
  console.error(`✗ F1.csv has columns this generator does not map: ${extraCols.join(', ')} — update the mapping table before regenerating.`)
  process.exit(1)
}

// ── 2. group rows by field_id, preserving first-seen field order ─────────
const order = []
const byField = new Map()
for (const r of F1.rows) {
  const id = r[F1.idx.field_id]
  if (!byField.has(id)) { byField.set(id, []); order.push(id) }
  byField.get(id).push(r)
}

const disagreements = { segment: [], planet: [], visibility: [], applicability: [], freshness: [], evidence_ceiling: [] }
const FIELDS = []
for (const id of order) {
  const rows = byField.get(id)
  const seg = new Set(rows.map((r) => r[F1.idx.segment]))
  const pl = new Set(rows.map((r) => r[F1.idx.planet]))
  const vis = new Set(rows.map((r) => r[F1.idx.visibility]))
  const appl = new Set(rows.map((r) => r[F1.idx.applicability]))
  const fresh = new Set(rows.map((r) => r[F1.idx.freshness_rule]))
  const ceil = new Set(rows.map((r) => r[F1.idx.evidence_ceiling]))
  if (seg.size > 1) disagreements.segment.push(id)
  if (pl.size > 1) disagreements.planet.push(id)
  if (vis.size > 1) disagreements.visibility.push(id)
  if (appl.size > 1) disagreements.applicability.push(id)
  if (fresh.size > 1) disagreements.freshness.push(id)
  if (ceil.size > 1) disagreements.evidence_ceiling.push(id)

  // segment/planet/visibility MUST be field-level constants (F1 contract) —
  // hard-fail if a future CSV edit breaks that invariant instead of silently
  // picking one.
  if (seg.size > 1) { console.error(`✗ field '${id}' has inconsistent segment across sources: ${[...seg]}`); process.exit(1) }
  if (pl.size > 1) { console.error(`✗ field '${id}' has inconsistent planet across sources: ${[...pl]}`); process.exit(1) }
  if (vis.size > 1) { console.error(`✗ field '${id}' has inconsistent visibility across sources: ${[...vis]}`); process.exit(1) }

  // representative row = the row with the STRONGEST evidence_ceiling this
  // field can reach (verified > supporting > self-reported > not-assessable).
  // applicability / freshness / method_ceiling for the field come from THIS
  // row so the record never mixes attributes across unrelated sources.
  const rep = [...rows].sort((a, b) =>
    (CEILING_RANK[b[F1.idx.evidence_ceiling]] || 0) - (CEILING_RANK[a[F1.idx.evidence_ceiling]] || 0))[0]

  FIELDS.push({
    field_id: id,
    field_label_en: rows[0][F1.idx.field], // consistent per field_id — enforced by validate-registry.mjs
    planet_key: rows[0][F1.idx.planet],
    segment: rows[0][F1.idx.segment],
    applicability: rep[F1.idx.applicability],
    visibility: rows[0][F1.idx.visibility],
    freshness: rep[F1.idx.freshness_rule],
    method_ceiling: rep[F1.idx.evidence_ceiling],
    why_key: id, // field_id doubles as its own i18n key (README ruling: why_a_buyer_cares is an i18n KEY, not stored text)
    sources: rows.map((r) => ({
      source_brand: r[F1.idx.source_brand],
      source_channel: r[F1.idx.source_channel],
      source_type: r[F1.idx.source_type],
      logo_asset: r[F1.idx.logo_asset],
      connection_method: r[F1.idx.connection_method],
      evidence_ceiling: r[F1.idx.evidence_ceiling],
      freshness_rule: r[F1.idx.freshness_rule],
      consent_requirement: r[F1.idx.consent_requirement],
      limitation_text: r[F1.idx.limitation_text] || null,
      applicability: r[F1.idx.applicability],
    })),
  })
}

// ── 3. F2-F6-DELTAS.csv — dj-club filter (ruling ①: dj-club family FIRST;
//    F1 is already the dj-club baseline, so this is expected to be a no-op
//    today; kept so a future dj-club-tagged delta record applies automatically
//    without generator changes) ──
const DELTAS = readRows(DELTAS_FILE)
const djClubDeltaRows = DELTAS.rows.filter((r) => {
  const famId = r[DELTAS.idx.family_id] || ''
  const famName = r[DELTAS.idx.family_name] || ''
  return /dj.?club/i.test(famId) || /dj.?club/i.test(famName)
})
if (djClubDeltaRows.length > 0) {
  console.error(`✗ Found ${djClubDeltaRows.length} dj-club-tagged delta record(s) in F2-F6-DELTAS.csv — this generator does not yet apply delta operations (out of scope this slot). Flag to the orchestrator before regenerating.`)
  process.exit(1)
}

// ── 4. why-key i18n manifest — KEY NAMES only. Per ruling (why_a_buyer_cares
//    is an i18n KEY): we never invent the persuasive "why a buyer cares"
//    copy here. F1 DOES carry a plain label per field (the `field` column,
//    e.g. "Stage name") — that's surfaced as a seed for EN only, per the
//    "propose EN from it, HE left for orchestrator" instruction. This is a
//    label seed, NOT the final why-copy — the orchestrator still owns the
//    actual "why a buyer cares" sentence per key.
const WHY_KEY_MANIFEST = FIELDS.map((f) => ({
  why_key: f.why_key,
  field_id: f.field_id,
  field_label_en_seed: f.field_label_en,
  he_seed: null, // left for orchestrator — do not invent
}))

// ── 5. self-test (bullet 3) ───────────────────────────────────────────────
const segments = new Set(FIELDS.map((f) => f.segment))
const planets = new Set(FIELDS.map((f) => f.planet_key))
const badPlanets = [...planets].filter((p) => !PLANET_KEYS.includes(p))
const naFields = FIELDS.filter((f) => f.applicability === 'na')

const assertions = [
  [FIELDS.length === 376, `expected 376 unique field_ids, got ${FIELDS.length}`],
  [segments.size === 18, `expected 18 segments, got ${segments.size}`],
  [badPlanets.length === 0, `planet_keys outside the canon 6: ${badPlanets.join(', ')}`],
  [naFields.length === 0, `fieldsForFamily('dj-club') must exclude all 'na' fields (N-rule) — found ${naFields.length} 'na' fields in the dj-club dataset itself`],
]
const failed = assertions.filter(([ok]) => !ok)
if (failed.length) {
  console.error(`✗ SELF-TEST FAILED:`)
  failed.forEach(([, msg]) => console.error(`  - ${msg}`))
  process.exit(1)
}

// ── 6. emit src/lib/registryData.js ───────────────────────────────────────
const banner = `// GENERATED — do not hand-edit; source docs/registry/F1.csv; regenerate via
// \`node scripts/generate-registry-data.mjs\` (npm script TBD by orchestrator).
// R-6 phase 1 (§16.A.5b) — one row per FIELD × SOURCE in F1.csv, aggregated
// here to one record per field_id. See scripts/generate-registry-data.mjs
// for the exact column mapping + aggregation rule (representative row =
// strongest evidence_ceiling available for that field).
// FIREWALL: no score / rank / % / weight numbers anywhere in this file.
// why_key is an i18n KEY ONLY — never store the "why a buyer cares" sentence
// here; that copy lives in src/lib/i18n/{en,he}.js, staged by the orchestrator.
`

const body = `${banner}
export const PLANET_KEYS = ${JSON.stringify(PLANET_KEYS, null, 2)}

// One record per field_id (376 total). See generator header for the
// aggregation rule and for what \`sources[]\` losslessly preserves from the
// raw F1 rows (source_brand/source_channel/source_type/logo_asset/
// connection_method/consent_requirement/limitation_text/per-source
// evidence_ceiling+freshness_rule+applicability).
export const FIELDS = ${JSON.stringify(FIELDS, null, 2)}

// KEY NAMES only — see generator header. field_label_en_seed is a literal
// F1 label, NOT persuasive copy; he_seed is intentionally null (orchestrator
// owns HE + the actual "why a buyer cares" sentence per key).
export const WHY_KEY_MANIFEST = ${JSON.stringify(WHY_KEY_MANIFEST, null, 2)}
`

writeFileSync(OUT_FILE, body)

console.log(`✓ REGISTRY DATA GENERATED — ${FIELDS.length} fields · ${segments.size} segments · ${planets.size} planets · 0 dj-club delta records applied (none exist yet) · wrote ${OUT_FILE}`)
if (disagreements.applicability.length) {
  console.log(`  note: ${disagreements.applicability.length} field(s) had >1 distinct applicability across sources (resolved via strongest-evidence-ceiling row): ${disagreements.applicability.join(', ')}`)
}
if (disagreements.freshness.length) {
  console.log(`  note: ${disagreements.freshness.length} field(s) had >1 distinct freshness_rule across sources (resolved via strongest-evidence-ceiling row): ${disagreements.freshness.join(', ')}`)
}
if (disagreements.evidence_ceiling.length) {
  console.log(`  note: ${disagreements.evidence_ceiling.length} field(s) had >1 distinct evidence_ceiling across sources (took the strongest): ${disagreements.evidence_ceiling.join(', ')}`)
}
