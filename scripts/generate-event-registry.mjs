// ============================================================
// EVENT REGISTRY GENERATOR (T-40 / W3-4, spec §14.3) — machine-readable
// registry of the analytics event vocabulary, GENERATED FROM CODE so it can
// never drift by hand:
//   source of truth 1: src/lib/analytics.js  → const CANON (persisted names)
//   source of truth 2: src/lib/analytics.js  → export const EVENTS (constants)
//   source of truth 3: server/index.js       → server-side analytics_event inserts
// Emits docs/registry/events.json: [{ name, constant, gateRelevant, surface }]
//   gateRelevant — reaction / payment / availability-request events (the Gate
//                  funnel, §14.4); derived from the name, deterministic.
//   surface      — 'app'    CANON is the client writer (analytics.js persist());
//                  'both'   ALSO inserted by server/index.js (event_name: '…');
//                  'server' inserted ONLY by the server (no client emission).
// Output is sorted by name → byte-deterministic.
// Modes:
//   node scripts/generate-event-registry.mjs           write the file
//   node scripts/generate-event-registry.mjs --check   regenerate in memory,
//     diff against the committed file, exit 1 on drift (wired into `verify`).
// ============================================================
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const ANALYTICS = join(ROOT, 'src/lib/analytics.js')
const SERVER = join(ROOT, 'server/index.js')
const OUT = join(ROOT, 'docs/registry/events.json')

function die(msg) { console.error(`✗ event-registry: ${msg}`); process.exit(1) }

// ── 1. CANON — the persisted vocabulary (must match the DB CHECK, see
//      scripts/test-canon-drift.mjs which enforces app == DB) ────────────────
const analyticsSrc = readFileSync(ANALYTICS, 'utf8')
const canonMatch = analyticsSrc.match(/const CANON = new Set\(\[([\s\S]*?)\]\)/)
if (!canonMatch) die('CANON set not found in src/lib/analytics.js')
const canon = [...canonMatch[1].matchAll(/'([a-z0-9_]+)'/g)].map((m) => m[1])
if (new Set(canon).size !== canon.length) die('duplicate names inside CANON')

// ── 2. EVENTS map — reverse lookup name → exported constant ─────────────────
const eventsMatch = analyticsSrc.match(/export const EVENTS = \{([\s\S]*?)\n\}/)
if (!eventsMatch) die('EVENTS map not found in src/lib/analytics.js')
const constantOf = {} // name → constant
for (const m of eventsMatch[1].matchAll(/^\s*([A-Z0-9_]+):\s*'([a-z0-9_]+)'/gm)) {
  constantOf[m[2]] = m[1]
}

// ── 3. server-side inserts — object-literal `event_name: 'x'` is the insert
//      payload shape; `.eq('event_name', …)` reads are deliberately excluded ─
const serverSrc = readFileSync(SERVER, 'utf8')
const serverEvents = new Set(
  [...serverSrc.matchAll(/event_name:\s*'([a-z0-9_]+)'/g)].map((m) => m[1]),
)

// ── 4. client emission sites — EVENTS.<CONST> referenced anywhere in src
//      outside analytics.js itself ───────────────────────────────────────────
function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) walk(p, acc)
    else if (/\.(js|jsx)$/.test(entry)) acc.push(p)
  }
  return acc
}
const usedConstants = new Set()
for (const file of walk(join(ROOT, 'src'))) {
  if (file === ANALYTICS) continue
  for (const m of readFileSync(file, 'utf8').matchAll(/EVENTS\.([A-Z0-9_]+)/g)) {
    usedConstants.add(m[1])
  }
}

// ── 5. build rows — one per CANON event, sorted by name (deterministic) ─────
const GATE_RE = /reaction|payment|entitlement|availability_request/ // §14.4 Gate funnel
const rows = [...canon].sort().map((name) => {
  const constant = constantOf[name] ?? null
  if (!constant) die(`CANON event '${name}' has no constant in the EVENTS map`)
  const onServer = serverEvents.has(name)
  const onApp = usedConstants.has(constant) || !onServer // CANON = client vocabulary; uninstrumented names still belong to the app writer
  return {
    name,
    constant,
    gateRelevant: GATE_RE.test(name),
    surface: onServer ? (onApp ? 'both' : 'server') : 'app',
  }
})
const json = JSON.stringify(rows, null, 2) + '\n'

// ── 6. write or --check ──────────────────────────────────────────────────────
if (process.argv.includes('--check')) {
  let committed = null
  try { committed = readFileSync(OUT, 'utf8') } catch { /* missing file = drift */ }
  if (committed !== json) {
    die(`docs/registry/events.json is stale — regenerate with: npm run registry:events (${rows.length} events expected)`)
  }
  console.log(`✓ event-registry: docs/registry/events.json in sync (${rows.length} events)`)
} else {
  writeFileSync(OUT, json)
  console.log(`✓ event-registry: wrote docs/registry/events.json (${rows.length} events)`)
}
