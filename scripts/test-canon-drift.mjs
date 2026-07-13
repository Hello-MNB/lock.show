// ============================================================
// CANON DRIFT GATE (Cowork, 13 Jul) — the analytics event vocabulary lives in
// TWO places that have drifted twice by hand:
//   1. src/lib/analytics.js  → const CANON = new Set([...])   (the app)
//   2. the HIGHEST-numbered migration touching the DB CHECK
//      analytics_event_event_name_check (034 today)           (the DB)
// This gate parses BOTH and fails the build when the sets differ, so a canon
// edit without a matching migration (or vice versa) can never ship silently.
// Run: npm run test:canon   (wired into npm run verify)
// ============================================================
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

let failed = false
function fail(msg) { console.error(`✗ canon-drift: ${msg}`); failed = true }

// ── 1. app CANON ─────────────────────────────────────────────────────────────
const analyticsSrc = readFileSync('src/lib/analytics.js', 'utf8')
const canonMatch = analyticsSrc.match(/const CANON = new Set\(\[([\s\S]*?)\]\)/)
if (!canonMatch) { fail('CANON set not found in src/lib/analytics.js'); process.exit(1) }
const canon = new Set([...canonMatch[1].matchAll(/'([a-z0-9_]+)'/g)].map((m) => m[1]))

// ── 2. DB CHECK from the highest-numbered migration touching the constraint ──
// .down.sql files (undo scripts) and .DRAFT files are not applied migrations.
const MIG_DIR = 'supabase/migrations'
const touching = readdirSync(MIG_DIR)
  .filter((f) => /^\d+_.*\.sql$/.test(f) && !f.endsWith('.down.sql'))
  .filter((f) => readFileSync(join(MIG_DIR, f), 'utf8').includes('analytics_event_event_name_check'))
  .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
if (!touching.length) { fail('no applied migration touches analytics_event_event_name_check'); process.exit(1) }
const highest = touching.at(-1)
const sql = readFileSync(join(MIG_DIR, highest), 'utf8')
const checkMatch = sql.match(/analytics_event_event_name_check\s+check\s*\(\s*event_name\s+in\s*\(([\s\S]*?)\)\s*\)/i)
if (!checkMatch) { fail(`CHECK list not parseable in ${highest}`); process.exit(1) }
const db = new Set([...checkMatch[1].matchAll(/'([a-z0-9_]+)'/g)].map((m) => m[1]))

// ── 3. compare — any asymmetric difference is drift ──────────────────────────
const onlyApp = [...canon].filter((n) => !db.has(n))
const onlyDb = [...db].filter((n) => !canon.has(n))
if (onlyApp.length) fail(`in app CANON but missing from ${highest}: ${onlyApp.join(', ')}`)
if (onlyDb.length) fail(`in ${highest} but missing from app CANON: ${onlyDb.join(', ')}`)
if (failed) {
  console.error(`✗ CANON DRIFT — app CANON (${canon.size}) != ${highest} CHECK (${db.size}). Regenerate the migration from CANON (file = DB = app).`)
  process.exit(1)
}
console.log(`✓ canon-drift: app CANON == ${highest} CHECK (${canon.size} events, in sync)`)
