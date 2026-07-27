// ============================================================
// ANALYTICS CONTRACT REGRESSION HARNESS — scripts/test-analytics-contract.mjs
// (T-96 Phase 5, built FIRST — asserts the CURRENT analytics state so later
// SEO/analytics phases cannot silently regress it).
//
// Complements test-canon-drift.mjs (which asserts app CANON == DB CHECK
// equality). This gate asserts the CONTRACT AROUND the vocabulary:
//   A1  app CANON ⊆ the highest migration's CHECK list (same parsing approach
//       as test-canon-drift.mjs — a CANON name the DB would reject means the
//       event silently degrades to localStorage-only)
//   A2  every EVENTS map value is either in CANON (persisted) or in the
//       documented DEV_ONLY list (localStorage-only by design) — no third state
//   A3  every DEV_ONLY name is genuinely absent from CANON (a dev-only name
//       that entered CANON without moving out of the dev-only section is drift)
//   A4  FIREWALL — no logEvent() call site passes a property key named
//       score / percent / percentage / percentile / rank. The firewall bans
//       scores-about-people from the wire; property keys are where they'd leak.
//
// Run: npm run test:analytics   (wired into `npm run verify`)
// ============================================================
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

let failed = false
function fail(msg) { console.error(`✗ analytics-contract: ${msg}`); failed = true }

// ── A1. app CANON ⊆ highest migration CHECK ─────────────────────────────────
const ANALYTICS = 'src/lib/analytics.js'
const analyticsSrc = readFileSync(ANALYTICS, 'utf8')
const canonMatch = analyticsSrc.match(/const CANON = new Set\(\[([\s\S]*?)\]\)/)
if (!canonMatch) { fail(`CANON set not found in ${ANALYTICS}`); process.exit(1) }
const canon = new Set([...canonMatch[1].matchAll(/'([a-z0-9_]+)'/g)].map((m) => m[1]))

// same approach as scripts/test-canon-drift.mjs: highest applied migration
// touching the CHECK constraint; .down.sql undo scripts are not applied state.
const MIG_DIR = 'supabase/migrations'
const touching = readdirSync(MIG_DIR)
  .filter((f) => /^\d+_.*\.sql$/.test(f) && !f.endsWith('.down.sql'))
  .filter((f) => readFileSync(join(MIG_DIR, f), 'utf8').includes('analytics_event_event_name_check'))
  .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
if (!touching.length) { fail('no migration touches analytics_event_event_name_check'); process.exit(1) }
const highest = touching.at(-1)
const sql = readFileSync(join(MIG_DIR, highest), 'utf8')
const checkMatch = sql.match(/analytics_event_event_name_check\s+check\s*\(\s*event_name\s+in\s*\(([\s\S]*?)\)\s*\)/i)
if (!checkMatch) { fail(`CHECK list not parseable in ${highest}`); process.exit(1) }
const db = new Set([...checkMatch[1].matchAll(/'([a-z0-9_]+)'/g)].map((m) => m[1]))

const notInDb = [...canon].filter((n) => !db.has(n))
if (notInDb.length) fail(`A1 · CANON names the DB CHECK (${highest}) would reject: ${notInDb.join(', ')}`)
else console.log(`✓ A1: app CANON (${canon.size}) ⊆ ${highest} CHECK (${db.size})`)

// ── A2 + A3. EVENTS map: persisted ∪ documented dev-only, nothing else ──────
// DEV_ONLY mirrors the "dev-only (NOT persisted — absent from CANON)" section
// at the bottom of the EVENTS map in src/lib/analytics.js. A new dev-only
// event is added HERE and THERE together — that is the documentation step.
const DEV_ONLY = new Set([
  'onboarding_step',
  'claim_visibility_changed',
  'request_whatsapp_click',
  'settings_opened',
  'delete_account_requested',
  'language_changed',
])
const eventsMatch = analyticsSrc.match(/export const EVENTS = \{([\s\S]*?)\n\}/)
if (!eventsMatch) { fail(`EVENTS map not found in ${ANALYTICS}`); process.exit(1) }
const eventsValues = [...eventsMatch[1].matchAll(/:\s*'([a-z0-9_]+)'/g)].map((m) => m[1])
if (!eventsValues.length) { fail('EVENTS map parsed empty'); process.exit(1) }
let a2ok = true
for (const v of eventsValues) {
  if (!canon.has(v) && !DEV_ONLY.has(v)) {
    fail(`A2 · EVENTS value '${v}' is neither in CANON (persisted) nor in the documented DEV_ONLY list — undocumented third state`)
    a2ok = false
  }
}
if (a2ok) console.log(`✓ A2: all ${eventsValues.length} EVENTS values are CANON (${eventsValues.filter((v) => canon.has(v)).length}) or documented dev-only (${eventsValues.filter((v) => DEV_ONLY.has(v)).length})`)
let a3ok = true
for (const v of DEV_ONLY) {
  if (canon.has(v)) { fail(`A3 · '${v}' is documented dev-only but present in CANON — move it out of the dev-only section or update this list`); a3ok = false }
}
if (a3ok) console.log(`✓ A3: all ${DEV_ONLY.size} documented dev-only names are absent from CANON`)

// ── A4. firewall: no score-shaped property keys at any logEvent call site ───
const BANNED_KEY = /(?:^|[{,\s'"])(score|percent|percentage|percentile|rank)(?:['"])?\s*:/i

/** All source files that could call logEvent (app src + server). */
function collectFiles(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) { if (entry.name !== 'node_modules') collectFiles(p, acc) }
    else if (/\.(js|jsx|ts|tsx|mjs)$/.test(entry.name)) acc.push(p)
  }
  return acc
}
const files = [...collectFiles('src'), ...collectFiles('server')]

/** Extract the full argument text of each logEvent(...) call (paren-matched). */
function logEventCalls(src) {
  const calls = []
  let idx = 0
  while ((idx = src.indexOf('logEvent(', idx)) !== -1) {
    const open = idx + 'logEvent'.length
    let depth = 0, inStr = null
    for (let i = open; i < src.length; i++) {
      const c = src[i]
      if (inStr) {
        if (c === '\\') i++
        else if (c === inStr) inStr = null
        continue
      }
      if (c === "'" || c === '"' || c === '`') { inStr = c; continue }
      if (c === '(') depth++
      else if (c === ')') {
        depth--
        if (depth === 0) { calls.push(src.slice(open + 1, i)); idx = i; break }
      }
    }
    idx++
  }
  return calls
}

let callSites = 0, a4ok = true
for (const f of files) {
  const src = readFileSync(f, 'utf8')
  if (!src.includes('logEvent(')) continue
  for (const call of logEventCalls(src)) {
    callSites++
    const m = BANNED_KEY.exec(call)
    if (m) {
      fail(`A4 · FIREWALL: logEvent call in ${f} passes a banned property key '${m[1]}': ${call.slice(0, 120).replace(/\s+/g, ' ')}...`)
      a4ok = false
    }
  }
}
if (!callSites) fail('A4 · no logEvent call sites found — parser broken or analytics removed')
else if (a4ok) console.log(`✓ A4: firewall holds — ${callSites} logEvent call sites across src/ + server/, no score/percent/percentage/percentile/rank property keys`)

// ── verdict ──────────────────────────────────────────────────────────────────
if (failed) {
  console.error('\n✗ ANALYTICS CONTRACT: violations above.')
  process.exit(1)
}
console.log('\n✓ ANALYTICS CONTRACT: all assertions hold.')
