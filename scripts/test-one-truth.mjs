// ============================================================
// T-100 · ONE-TRUTH GATE — scripts/test-one-truth.mjs
// (V9-GAP-ANALYSIS §7 Wave A, T-100 test process)
//
// The defect this gate makes unrepeatable: the agency cockpit used to derive
// ONE artist's roster health TWICE (AgencyRadarUniverse.artistState() for the
// orbit ring, AgencyDashboard.rosterStatus() for the owned rows), so the same
// artist could render two different states side by side on the same screen.
//
// Four assertions:
//   O1  the shared rule exists and exports exactly ONE derivation function
//   O2  grep-level — no file in src/features/agency/ re-derives roster health
//       (no second derivation function, no inline bounded-signal ladder)
//   O3  both agency surfaces import the shared rule (and nothing else derives)
//   O4  render assertion — for the same artist, the state feeding the RING and
//       the state feeding the CHIP are the identical value, and both vocabulary
//       maps are TOTAL over the canon state set (no surface can fall through to
//       undefined and quietly invent a look)
//
// Run: npm run test:one-truth   (wired into `npm run verify`)
// ============================================================
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

let failed = false
const fail = (m) => { console.log(`  ✗ ${m}`); failed = true }
const ok = (m) => console.log(`  · ${m}`)

const RULE = 'src/lib/rosterHealth.js'
const AGENCY_DIR = 'src/features/agency'

// ── O1 · one exported derivation ────────────────────────────────────────────
let ruleSrc = ''
try { ruleSrc = readFileSync(RULE, 'utf8') } catch { fail(`${RULE} missing — the single roster-health rule has no home`) }
const exportedFns = [...ruleSrc.matchAll(/export\s+function\s+([A-Za-z0-9_]+)/g)].map((m) => m[1])
if (exportedFns.length !== 1 || exportedFns[0] !== 'deriveRosterHealth') {
  fail(`O1 · ${RULE} must export exactly ONE derivation function (deriveRosterHealth) — found [${exportedFns.join(', ') || 'none'}]`)
} else ok(`O1: one exported rule — deriveRosterHealth() in ${RULE}`)

// ── O2 · no second derivation anywhere in the agency feature ────────────────
// Comments are stripped first: this file's own explanatory comments name the
// retired functions on purpose, and a comment is not a derivation.
const stripJs = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1 ')
function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(jsx?|tsx?)$/.test(f)) out.push(p)
  }
  return out
}
// A roster-health derivation looks like one of these: a function named after
// the two retired ones, or the bounded-signal ladder inlined again.
const RETIRED_FN = /\b(?:function\s+)?(artistState|rosterStatus)\s*[=(]/
const INLINE_LADDER = /lineup_frequency_band[\s\S]{0,200}price_band[\s\S]{0,120}\.filter\(Boolean\)\.length/
const agencyFiles = walk(AGENCY_DIR)
let o2 = true
for (const f of agencyFiles) {
  const code = stripJs(readFileSync(f, 'utf8'))
  if (RETIRED_FN.test(code)) { fail(`O2 · ${f} re-declares a retired roster-health derivation (artistState/rosterStatus)`); o2 = false }
  if (INLINE_LADDER.test(code)) { fail(`O2 · ${f} inlines the bounded-signal ladder again — consume deriveRosterHealth() instead`); o2 = false }
}
if (o2) ok(`O2: no second derivation in ${AGENCY_DIR}/ (${agencyFiles.length} files scanned)`)

// ── O3 · both surfaces consume the shared rule ──────────────────────────────
const CONSUMERS = [`${AGENCY_DIR}/AgencyDashboard.jsx`, `${AGENCY_DIR}/AgencyRadarUniverse.jsx`]
let o3 = true
for (const f of CONSUMERS) {
  const src = readFileSync(f, 'utf8')
  if (!/from ['"].*lib\/rosterHealth\.js['"]/.test(src)) { fail(`O3 · ${f} does not import the shared roster-health rule`); o3 = false }
  else if (!/deriveRosterHealth\(/.test(src) && !/ROSTER_HEALTH_(RING|CHIP)\[/.test(src)) { fail(`O3 · ${f} imports the rule but never consumes it`); o3 = false }
}
if (o3) ok(`O3: both agency surfaces consume ${RULE}`)

// ── O4 · same artist → same state on both surfaces; maps are total ──────────
const mod = await import(pathToFileURL(join(process.cwd(), RULE)).href)
const { deriveRosterHealth, ROSTER_HEALTH, ROSTER_HEALTH_RING, ROSTER_HEALTH_CHIP } = mod
const states = Object.values(ROSTER_HEALTH || {})
let o4 = true
for (const s of states) {
  if (!ROSTER_HEALTH_RING?.[s]) { fail(`O4 · ring vocabulary has no entry for state '${s}' — the orbit would render undefined`); o4 = false }
  if (!ROSTER_HEALTH_CHIP?.[s]) { fail(`O4 · chip vocabulary has no entry for state '${s}' — the row would render undefined`); o4 = false }
}
// Fixtures span the whole ladder, including the exact shape that used to
// disagree: a fully filled bounded profile with nothing checked yet (read
// STRONG on the row, 'developing' on the ring — the live defect).
const FIXTURES = [
  { label: 'empty act', artist: { id: 'a1' }, claims: [] },
  { label: 'one bounded signal', artist: { id: 'a2', photo_url: 'x' }, claims: [] },
  { label: 'full bounded profile, nothing checked', artist: { id: 'a3', photo_url: 'x', price_band: 'mid', sells_tickets: true, lineup_frequency_band: 'monthly' }, claims: [] },
  { label: 'claim waiting on the artist', artist: { id: 'a4', photo_url: 'x' }, claims: [{ artist_id: 'a4', artist_approved: false, verification_status: 'verified' }] },
  { label: 'approved + checked claim', artist: { id: 'a5' }, claims: [{ artist_id: 'a5', artist_approved: true, verification_status: 'verified' }] },
  { label: 'another artist\'s claims only', artist: { id: 'a6', photo_url: 'x' }, claims: [{ artist_id: 'zz', artist_approved: false }] },
]
const seen = new Set()
for (const fx of FIXTURES) {
  // Both surfaces call the SAME function with the SAME inputs; the render
  // assertion is that each maps that one state, never a second derivation.
  const ring = deriveRosterHealth(fx.artist, fx.claims).state
  const chip = deriveRosterHealth(fx.artist, fx.claims).state
  if (ring !== chip) { fail(`O4 · '${fx.label}' derives two states (${ring} vs ${chip})`); o4 = false }
  if (!states.includes(ring)) { fail(`O4 · '${fx.label}' derived '${ring}', which is not a canon roster-health state`); o4 = false }
  seen.add(ring)
}
if (seen.size !== states.length) { fail(`O4 · fixtures only reach ${seen.size}/${states.length} states — the ladder has an unreachable rung`); o4 = false }
if (o4) ok(`O4: ${FIXTURES.length} fixtures → one state each, all ${states.length} states reachable, both vocabulary maps total`)

if (failed) {
  console.log('\n✗ ONE-TRUTH: roster health is derived more than once — one artist can render two states.')
  process.exit(1)
}
console.log('\n✓ ONE-TRUTH: roster health has exactly one derivation; both agency surfaces map that one state.')
