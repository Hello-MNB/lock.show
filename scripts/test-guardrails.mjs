// ============================================================
// §20 EXECUTABLE GUARDRAILS — the mechanical inspectors that back the rules
// CLAUDE.md / spec §20 state but that no verify check previously enforced.
//
// Five inspectors, each a numbered sub-check with its own findings, one exit
// code (1 on ANY violation). Wired into `npm run verify`.
//
//   1. PERSON-SCORE on real surfaces — no score / rank / % / rating field about
//      a PERSON in code, DB columns, or the buyer payload. (§2, §20.A)
//   2. RETIRED WORD — no "Mirror" / "המראה" in user-facing text. (§4, §20.A)
//   3. DESTRUCTIVE MIGRATION — no DROP TABLE / DROP COLUMN in an UP migration. (§20.B)
//   4. INTERNAL CONFIDENCE — the AI's private number never in a buyer payload. (§13.5, §20.A)
//   5. REACTION-AS-NUMBER — a reaction to the artist is never a count. (§2.5, §20.A)
//
// DESIGN NOTE (why this is not a naïve word-ban): the product is *named*
// "Bookability Passport" and its copy deliberately PROMISES "never a score /
// rank / %". Banning those words in copy would flag the product's own name and
// its own firewall promises. A real per-person score cannot live in static
// text — it enters as DATA. So inspector 1 scans where a score would actually
// live (code identifiers, DB columns, the buyer payload), with comments
// stripped, and leaves reassurance copy + the product name alone.
//
// Escape hatch: a line carrying `guardrail-allow` is skipped (use sparingly,
// with a reason). Run: node scripts/test-guardrails.mjs
// ============================================================
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
let violations = 0
const fail = (msg) => { console.log(`  ✗ ${msg}`); violations++ }
const okline = (msg) => console.log(`  · ${msg}`)

// ── helpers ────────────────────────────────────────────────────────────────
function walk(dir, exts, out = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const f of entries) {
    const p = join(dir, f)
    const st = statSync(p)
    if (st.isDirectory()) {
      if (f === 'node_modules' || f === 'dist' || f === '.git') continue
      walk(p, exts, out)
    } else if (exts.some((e) => f.endsWith(e))) {
      out.push(p)
    }
  }
  return out
}
// Strip /* block */ and // line comments (JS) — we scan for keywords, never
// execute, so mild over-stripping inside strings is safe (it can only remove
// text, never invent a keyword). SQL variant strips -- line comments too.
function stripJs(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1 ')
}
function stripSql(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/--.*$/gm, ' ')
}
const rel = (p) => p.replace(ROOT + '/', '')
// Report each violation with file:line by re-scanning kept lines.
function scanFile(path, stripFn, patterns, allow = () => false) {
  const raw = readFileSync(path, 'utf8')
  const rawLines = raw.split('\n')
  const stripped = stripFn(raw).split('\n')
  stripped.forEach((line, i) => {
    // the escape marker lives in a comment → check the RAW line (comments are
    // stripped out of `line` before scanning).
    if (/guardrail-allow/.test(rawLines[i] || '')) return
    for (const { re, label } of patterns) {
      const m = line.match(re)
      if (m && !allow(m[0], line)) {
        fail(`${rel(path)}:${i + 1}  ${label} → "${m[0]}"   ${line.trim().slice(0, 80)}`)
      }
    }
  })
}

// ── 1. PERSON-SCORE on real surfaces ────────────────────────────────────────
console.log('[1] person-score on real surfaces (code · DB columns · buyer payload)')
// Musical notation ≠ grading (sheet-music vocabulary) — allowlisted, matches the
// registry/deltas allowlist. `internal_confidence` is the ONE deliberate DB-only
// score column (§16), guarded by inspector 4 — its NAME is not a scoring word.
const MUSICAL_ALLOW = /score_or_chart_reading|score_and_parts/i
const CODE_SCORE = [
  { re: /\b[a-z]\w*Score\b/, label: 'score identifier' },       // bookabilityScore, riskScore
  { re: /\b\w*_score\b/i, label: 'score column/field' },        // bookability_score
  { re: /(['"]?)score\1\s*[:=][^=]/i, label: 'score assignment' }, // score: 82 / score=
  { re: /\bpercentile\b/i, label: 'percentile' },
  { re: /\bleaderboard\b/i, label: 'leaderboard' },
  { re: /\bbookability\s*[:=]/i, label: 'bookability metric' },  // as a value, not the product name
]
// Code surfaces: src app code + the server payload — EXCLUDE i18n copy (holds the
// product name + firewall promises) and the server-side AI classifier (produces
// internal_confidence internally, never buyer-facing).
const codeFiles = [
  ...walk(join(ROOT, 'src'), ['.js', '.jsx', '.ts', '.tsx']),
  join(ROOT, 'server', 'index.js'),
].filter((p) => !/\/i18n\//.test(p) && !/\/lib\/ai/.test(p) && !/\/(demo|analytics)\.js$/.test(p))
for (const f of codeFiles) scanFile(f, stripJs, CODE_SCORE, (hit) => MUSICAL_ALLOW.test(hit))

// DB columns: an UP migration must not add a scoring column about a person.
const COL_SCORE = [
  { re: /\b\w*_score\b/i, label: 'score column' },
  { re: /\bscore_\w+\b/i, label: 'score column' },
  { re: /\bpercentile\b/i, label: 'percentile column' },
  { re: /\bleaderboard\b/i, label: 'leaderboard' },
  { re: /\bbookability\w*\b/i, label: 'bookability column' },
]
const upMigrations = walk(join(ROOT, 'supabase', 'migrations'), ['.sql'])
  .filter((p) => !p.endsWith('.down.sql') && !p.endsWith('.DRAFT'))
for (const f of upMigrations) scanFile(f, stripSql, COL_SCORE, (hit) => MUSICAL_ALLOW.test(hit))
okline(`scanned ${codeFiles.length} code files + ${upMigrations.length} UP migrations`)

// ── 2. RETIRED WORD "Mirror" / "המראה" in user-facing text ───────────────────
console.log('[2] retired word "Mirror" / "המראה" in user-facing i18n text')
// Scope = i18n string VALUES (the real user-facing surface). The internal
// `mirror-only` visibility enum (constants.js/db.js) is a DATA value §4 kept —
// NOT the retired UI name — and is intentionally out of scope.
const RETIRED = [{ re: /\bmirror\b/i, label: 'retired word "Mirror"' }, { re: /המראה/, label: 'retired word "המראה"' }]
for (const f of ['src/lib/i18n/en.js', 'src/lib/i18n/he.js']) {
  const path = join(ROOT, f)
  readFileSync(path, 'utf8').split('\n').forEach((line, i) => {
    if (/guardrail-allow/.test(line)) return
    // only string VALUES (right of a `key:` on a quoted string) — skip code/keys
    const val = line.match(/:\s*['"`]([^'"`]*)['"`]/)
    const hay = val ? val[1] : ''
    for (const { re, label } of RETIRED) if (re.test(hay)) fail(`${f}:${i + 1}  ${label} → ${line.trim().slice(0, 80)}`)
  })
}
okline('scanned en.js + he.js string values')

// ── 3. DESTRUCTIVE MIGRATION (DROP TABLE / DROP COLUMN in an UP migration) ────
console.log('[3] destructive migration (DROP TABLE / DROP COLUMN in an UP migration)')
const DROP = [{ re: /drop\s+table\b/i, label: 'DROP TABLE' }, { re: /drop\s+column\b/i, label: 'DROP COLUMN' }]
for (const f of upMigrations) scanFile(f, stripSql, DROP)
okline(`scanned ${upMigrations.length} UP migrations (down-migrations may legitimately drop)`)

// ── 4. INTERNAL CONFIDENCE never in a buyer payload ──────────────────────────
console.log('[4] internal_confidence (AI private number) never in a buyer-facing payload')
// The buyer serializers + the public Passport screen must not REFERENCE the
// column in code (comments, which explain the firewall, are stripped first).
const PAYLOAD_FILES = ['server/index.js', 'src/lib/db.js', 'src/features/passport/Passport.jsx']
const CONF = [{ re: /\binternal_confidence\b/i, label: 'internal_confidence in buyer path' }]
for (const f of PAYLOAD_FILES) scanFile(join(ROOT, f), stripJs, CONF)
okline(`scanned ${PAYLOAD_FILES.length} buyer-facing files (comments stripped)`)

// ── 5. REACTION shown to the artist as a NUMBER ──────────────────────────────
console.log('[5] reaction to the artist shown as a number/count (method-safe text only)')
const REACT_COUNT = [
  { re: /\b(professional_)?reactions?\b[\s\S]{0,30}?\.length/i, label: 'reaction .length render' },
  { re: /\bcount\b[\s\S]{0,20}?reaction/i, label: 'reaction count' },
  { re: /reaction[\w.]*\s*[:=]\s*\d/i, label: 'reaction numeric' },
]
const artistFiles = walk(join(ROOT, 'src', 'features', 'artist'), ['.jsx', '.js'])
for (const f of artistFiles) scanFile(f, stripJs, REACT_COUNT)
okline(`scanned ${artistFiles.length} artist-facing files`)

// ── 6. TWO-VIEW FIREWALL (N5 / T-65, owner R00 law 18 Jul) ───────────────────
// The Radar (private) shows gaps + coaching; the Passport (buyer) shows
// STRENGTHS ONLY — the coaching vocabulary must be ABSENT from every
// buyer-facing surface: no coaching lines, no why-a-buyer-cares keys, no
// own-history frame, no gap language in the Passport DOM or payload.
console.log('[6] two-view firewall: coaching/gap vocabulary absent from buyer surfaces')
const COACH_VOCAB = [
  { re: /\bcoachIn\b/, label: 'coaching composer on a buyer surface' },
  { re: /\bhistoryLine\b/, label: 'own-history frame on a buyer surface' },
  { re: /universe\.(why|coach)\b/, label: 'radar-private why/coach keys on a buyer surface' },
  { re: /\bS\.why\[|\bS\.coach\[/, label: 'why/coach lookup on a buyer surface' },
  { re: /\bprivate-gaps|gapsBar|privateGap/i, label: 'gap component on a buyer surface' },
]
const buyerFiles = [...walk(join(ROOT, 'src', 'features', 'passport'), ['.jsx', '.js']), join(ROOT, 'server', 'index.js')]
for (const f of buyerFiles) scanFile(f, stripJs, COACH_VOCAB)
okline(`scanned ${buyerFiles.length} buyer-facing files (passport/** + server payload)`)

// ── verdict ──────────────────────────────────────────────────────────────────
console.log('')
if (violations) {
  console.log(`✗ GUARDRAILS: ${violations} violation(s) — a §20 firewall rule was broken.`)
  process.exit(1)
}
console.log('✓ GUARDRAILS: all 6 §20 inspectors pass (person-score · retired-word · destructive-migration · internal-confidence · reaction-as-number · two-view).')
process.exit(0)
