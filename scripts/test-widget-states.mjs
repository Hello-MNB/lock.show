// ============================================================
// T-90 WIDGET STATE-CHECK — the 10-state proof-widget machine gate.
//
// THE LAW (T-90, owner-ratified, enforcing spec §5.8's full state set):
// every one of the six Artist-Home proof widgets ships ALL TEN states —
//   empty · loading · found · needs-user · ready · error · not-mine ·
//   saved · mobile-collapsed · mobile-expanded
// — and a MISSING STATE FAILS THE BUILD.
//
// How it proves it (static, deterministic, no browser):
//   1. RadarUniverse.jsx exports WIDGET_STATES whose values are EXACTLY the
//      ten canon states (no fewer, no extras, no renames).
//   2. The single render map (WIDGET_RENDER) carries one entry per state —
//      deleting any state's handler fails here.
//   3. deriveWidgetState() actually RETURNS every content state — a state
//      whose derivation was removed (unreachable render path) fails here.
//   4. Both display states are USED at real call sites via renderWidgetState
//      (the collapsed shelf card + the expanded sheet/rail body).
//   5. The shelf renders the widgets by mapping the 6 PLANETS through the
//      machine — six widgets, one machine, no bespoke card.
//   6. Every edge-state line + the progress count exist in BOTH i18n files.
//   7. Firewall spot-guard: no '%' inside the machine's i18n lines.
//
// Run: node scripts/test-widget-states.mjs   (exit 1 on any violation)
// ============================================================
import { readFileSync } from 'node:fs'

const CANON = [
  'empty', 'loading', 'found', 'needs-user', 'ready', 'error',
  'not-mine', 'saved', 'mobile-collapsed', 'mobile-expanded',
]
const CONTENT_KEYS = ['EMPTY', 'LOADING', 'FOUND', 'NEEDS_USER', 'READY', 'ERROR', 'NOT_MINE', 'SAVED']
const DISPLAY_KEYS = ['MOBILE_COLLAPSED', 'MOBILE_EXPANDED']

const src = readFileSync('src/features/artist/RadarUniverse.jsx', 'utf8')
let violations = 0
const fail = (msg) => { console.log(`  ✗ ${msg}`); violations++ }
const ok = (msg) => console.log(`  · ${msg}`)

// Extract a `{ … }` block by brace-counting from a start marker.
function block(source, marker) {
  const at = source.indexOf(marker)
  if (at < 0) return null
  const open = source.indexOf('{', at + marker.length - 1)
  if (open < 0) return null
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') { depth--; if (depth === 0) return source.slice(open, i + 1) }
  }
  return null
}

// ── 1 · the exported enum is exactly the ten canon states ──────────────────
const enumBlock = block(src, 'export const WIDGET_STATES = Object.freeze(')
if (!enumBlock) fail('WIDGET_STATES export missing from RadarUniverse.jsx — the machine has no enum.')
else {
  const values = [...enumBlock.matchAll(/[A-Z_]+:\s*'([a-z-]+)'/g)].map((m) => m[1])
  const missing = CANON.filter((s) => !values.includes(s))
  const extra = values.filter((s) => !CANON.includes(s))
  if (missing.length) fail(`WIDGET_STATES missing canon state(s): ${missing.join(', ')}`)
  if (extra.length) fail(`WIDGET_STATES carries non-canon state(s): ${extra.join(', ')}`)
  if (!missing.length && !extra.length) ok(`enum: all ${CANON.length} canon states present, no extras`)
}

// ── 2 · one render entry per state in the single render map ────────────────
const renderBlock = block(src, 'const WIDGET_RENDER = {')
if (!renderBlock) fail('WIDGET_RENDER map missing — no single render path for widget states.')
else {
  const missing = [...CONTENT_KEYS, ...DISPLAY_KEYS].filter((k) => !renderBlock.includes(`[WIDGET_STATES.${k}]:`))
  if (missing.length) fail(`WIDGET_RENDER missing handler(s) for: ${missing.join(', ')} — a widget state has no render path.`)
  else ok('render map: one handler per state, all 10 wired')
}

// ── 3 · the derivation can actually REACH every content state ──────────────
const deriveBlock = (() => {
  const at = src.indexOf('export function deriveWidgetState')
  if (at < 0) return null
  return block(src.slice(at), ')')  // first block after the arg list = fn body
})()
if (!deriveBlock) fail('deriveWidgetState() missing — no state derivation.')
else {
  const unreachable = CONTENT_KEYS.filter((k) => !new RegExp(`return\\s+WIDGET_STATES\\.${k}\\b`).test(deriveBlock))
  if (unreachable.length) fail(`deriveWidgetState never returns: ${unreachable.join(', ')} — state(s) unreachable.`)
  else ok('derivation: all 8 content states reachable')
}

// ── 4 · both display states are used at real call sites ────────────────────
for (const k of DISPLAY_KEYS) {
  const uses = [...src.matchAll(new RegExp(`renderWidgetState\\(WIDGET_STATES\\.${k}`, 'g'))].length
  if (uses < 1) fail(`display state ${k} has no call site — the surface never renders through the machine.`)
  else ok(`display: ${k} rendered at ${uses} call site(s)`)
}

// ── 5 · six widgets, one machine: the shelf maps PLANETS through it ────────
const shelfIdx = src.indexOf('renderWidgetState(WIDGET_STATES.MOBILE_COLLAPSED')
const mapIdx = src.lastIndexOf('PLANETS.map', shelfIdx)
if (shelfIdx < 0 || mapIdx < 0 || shelfIdx - mapIdx > 2000) {
  fail('the shelf does not map PLANETS through the widget machine (mobile-collapsed path).')
} else ok('shelf: PLANETS.map → machine (6 widgets, one render path)')
const lib = readFileSync('src/lib/radarUniverse.js', 'utf8')
const planetsBlock = lib.slice(lib.indexOf('export const PLANETS'), lib.indexOf(']', lib.indexOf('export const PLANETS')))
const planetCount = [...planetsBlock.matchAll(/\{\s*key:/g)].length
if (planetCount !== 6) fail(`PLANETS defines ${planetCount} dimensions — the six-widget shelf contract broke.`)
else ok('PLANETS: exactly 6 proof dimensions')

// ── 6 · EN+HE lexicon parity for the machine's lines ───────────────────────
const en = readFileSync('src/lib/i18n/en.js', 'utf8')
const he = readFileSync('src/lib/i18n/he.js', 'utf8')
for (const key of ['emptyLine', 'loadingLine', 'errorLine', 'notMineLine', 'savedLine', 'rooms:', 'roomsAria:', 'openUniverse:', 'universeTitle:', 'universeHint:', 'closeUniverse:']) {
  for (const [name, txt] of [['en.js', en], ['he.js', he]]) {
    if (!txt.includes(key)) fail(`i18n key ${key.replace(':', '')} missing from ${name}`)
  }
}
ok('i18n: machine lines present in EN and HE')

// ── 7 · firewall spot-guard: the machine's lines carry no percentage ───────
for (const [name, txt] of [['en.js', en], ['he.js', he]]) {
  const widgetBlock = block(txt, 'widget: {') || ''
  const progressBlock = block(txt, 'progress: {') || ''
  if (/%/.test(widgetBlock) || /%/.test(progressBlock)) fail(`${name}: a '%' appears inside the widget/progress lines — firewall (§2.1) violation.`)
}
ok('firewall: no % in widget/progress lines')

if (violations) {
  console.log(`✗ WIDGET-STATES: ${violations} violation(s) — a proof widget is missing part of the 10-state machine (T-90 law: missing state = build fail).`)
  process.exit(1)
}
console.log('✓ WIDGET-STATES: all 6 proof widgets render through the full 10-state machine (T-90 / §5.8).')
process.exit(0)
