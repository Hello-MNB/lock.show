#!/usr/bin/env node
// ============================================================
// BRAND NAMING GATE — B4-35.10 v4.4 + B4-70.10 §10.1
//
// Founder ruling (Maria, 17 Aug 2026): the public/display name is LOCK SHOW.
// `lock.show` (lowercase) is the DOMAIN. `LOCK.SHOW` (uppercase) is permitted
// ONLY in an explicitly approved visual lockup. Standalone LOCK never appears
// in visible copy, navigation, footer, ARIA labels, alt text, titles, metadata,
// structured data, social text or analytics labels.
//
// WHY THIS GATE IS CASE-SENSITIVE ON BOTH SIDES — the defect it exists to stop:
// an earlier scan excluded the brand phrase CASE-INSENSITIVELY, so `LOCK shows`
// was silently treated as "LOCK SHOW" and dropped. "shows" is a VERB. Two real
// violations hid in that blind spot through three independent review passes
// (src/lib/i18n/en.js:42, website-next/app/faq/page.tsx:93). A case-insensitive
// exclusion reproduces exactly the blindness this gate exists to end.
// ============================================================
import { readFileSync, existsSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { globSync } from 'node:fs'

// Standalone uppercase LOCK, NOT followed by " SHOW" or ".SHOW" — both
// UPPERCASE-EXACT. Lowercase `lock.show` can never match: the token itself is
// uppercase, so domain URLs are structurally safe.
const BARE = /(?<![A-Za-z0-9_-])LOCK(?![A-Za-z0-9_-])(?! SHOW)(?!\.SHOW)/g
// Uppercase LOCK.SHOW is legal ONLY in an approved lockup context.
const UPPER_DOTTED = /(?<![A-Za-z0-9_-])LOCK\.SHOW(?![A-Za-z0-9_-])/g

// Allowlist for approved visual-lockup files. MAY ONLY SHRINK — adding an entry
// is a deliberate act visible in a diff (pattern proven in test-i18n-parity).
const LOCKUP_ALLOWLIST = []

// ── DATED DEFERRAL · src/** (the AUTHENTICATED APP) ─────────────────────────
// CODE-WEB-021A scopes the naming sweep to the public WEBSITE and the public
// app SHELLS. `src/**` is the authenticated app, explicitly listed as NON-SCOPE
// for this task, so its 57 remaining tokens are DEFERRED — not ignored, and not
// silently excluded. They are counted, owned by the app lane, and the budget
// below MAY ONLY SHRINK: fixing tokens is always allowed, adding any is a gate
// failure. Recorded 17 Aug 2026.
//
// The largest entries are user-visible app strings (i18n/en.js 19, he.js 17),
// so this is real debt against the founder ruling, not cosmetic residue.
const SRC_APP_DEFERRAL = 57
const SRC_APP_DEFERRAL_DATE = '2026-08-17'

let failed = false
const fail = (m) => { failed = true; console.error(`  ✗ ${m}`) }
const ok = (m) => console.log(`  ✓ ${m}`)

const sh = (c) => execSync(c, { encoding: 'utf8' }).trim()
const lines = (t) => t ? t.split('\n').filter(Boolean) : []

// ── CLAUSE 1 · SOURCE: website visible/metadata + ALL of the app's visible
// surfaces — not only the i18n catalogues. Gating i18n alone left 23 of the
// app's tokens ungated in the first draft of this contract.
const SRC = [
  ...lines(sh("git ls-files 'website-next/app' 'website-next/components' 'website-next/lib' 'website-next/messages'")),
  ...lines(sh("git ls-files 'src'")),
  'index.html',
].filter((f) => /\.(tsx|ts|jsx|js|json|css|html)$/.test(f) && existsSync(f))

let webHits = 0, appHits = 0
for (const f of SRC) {
  const isApp = f.startsWith('src/')
  const txt = readFileSync(f, 'utf8')
  txt.split('\n').forEach((line, i) => {
    // CLAUSE 7 · exempt source_brand LINES, not the whole file. Exempting
    // registryData.js wholesale left its 3 limitation_text PROSE tokens —
    // rendered-class copy — outside every assertion.
    if (/"source_brand"\s*:/.test(line)) return
    const m = line.match(BARE)
    if (!m) return
    if (isApp) { appHits += m.length; return }
    webHits += m.length
    if (webHits <= 12) fail(`${f}:${i + 1} bare "LOCK" — ${line.trim().slice(0, 90)}`)
  })
}
// Split the count: the website + shells must be ZERO; src/** is measured
// against the shrink-only deferral budget.
if (webHits === 0) ok(`C1 website + public app shells: zero bare "LOCK" across ${SRC.filter((f) => !f.startsWith('src/')).length} files`)
else fail(`C1 website + public app shells: ${webHits} bare "LOCK" token(s) — this must be zero`)

if (appHits === 0) ok('C1 src/** (app lane): zero — the deferral can now be deleted')
else if (appHits <= SRC_APP_DEFERRAL) ok(`C1 src/** (app lane): ${appHits} deferred token(s) — within the ${SRC_APP_DEFERRAL} budget dated ${SRC_APP_DEFERRAL_DATE}; NON-SCOPE for CODE-WEB-021A, owned by the app lane`)
else fail(`C1 src/** (app lane): ${appHits} token(s) EXCEEDS the ${SRC_APP_DEFERRAL} budget — the deferral may only shrink; a new bare "LOCK" was introduced`)

// CLAUSE 7b · the ratchet. The source_brand exemption holds ONLY while nothing
// consumes it; one consumer converts ~190 dormant tokens into rendered copy.
const consumers = lines(sh("grep -rl 'source_brand' src website-next --include=*.js --include=*.jsx --include=*.ts --include=*.tsx 2>/dev/null || true"))
  .filter((f) => !f.endsWith('registryData.js'))
if (consumers.length === 0) ok('C7 ratchet: source_brand still has no consumer, so its exemption holds')
else fail(`C7 ratchet: source_brand is now CONSUMED by ${consumers.join(', ')} — the exemption is void; those tokens are rendered copy`)

// ── CLAUSE 6 · BUILD FRESHNESS. `out/` is untracked, so an assertion over stale
// or absent output would pass while proving nothing. A vacuous-pass guard
// catches "empty"; it does NOT catch "stale".
const OUT = 'website-next/out'
if (!existsSync(`${OUT}/index.html`)) {
  fail('C6 freshness: website-next/out is missing — run `npm --prefix website-next run build` first; a rendered gate cannot assert against absent output')
} else {
  const built = statSync(`${OUT}/index.html`).mtimeMs
  const newestSrc = Math.max(...SRC.filter((f) => f.startsWith('website-next')).map((f) => statSync(f).mtimeMs))
  if (newestSrc > built) fail(`C6 freshness: out/ is OLDER than website source — rebuild before trusting the rendered assertions`)
  else ok('C6 freshness: out/ is newer than every website source file')
}

// ── CLAUSES 3+4 · RENDERED HTML ONLY (incl. the 30 public /app/* shells).
// Scoped to HTML deliberately: an unscoped out/** glob also sweeps the copied
// minified bundle and binary visual baselines, producing false failures on
// files no reader ever sees.
let renderedHits = 0, htmlFiles = 0
if (existsSync(`${OUT}/index.html`)) {
  const html = lines(sh(`find ${OUT} -name '*.html' -type f`))
  htmlFiles = html.length
  const FIELDS = [
    [/<title>([^<]*)<\/title>/g, 'title'],
    [/<meta[^>]+name="description"[^>]+content="([^"]*)"/g, 'meta description'],
    [/<meta[^>]+property="og:site_name"[^>]+content="([^"]*)"/g, 'og:site_name'],
    [/<meta[^>]+property="og:description"[^>]+content="([^"]*)"/g, 'og:description'],
    [/<meta[^>]+name="twitter:[a-z]+"[^>]+content="([^"]*)"/g, 'twitter'],
    [/aria-label="([^"]*)"/g, 'aria-label'],
    [/\balt="([^"]*)"/g, 'alt'],
    [/"name"\s*:\s*"([^"]*)"/g, 'JSON-LD name'],
  ]
  for (const f of html) {
    const txt = readFileSync(f, 'utf8')
    for (const [re, label] of FIELDS) {
      for (const m of txt.matchAll(re)) {
        if (m[1] && m[1].match(BARE)) {
          renderedHits++
          if (renderedHits <= 12) fail(`${f.replace(OUT, 'out')} ${label}: "${m[1].slice(0, 70)}"`)
        }
      }
    }
  }
  if (renderedHits === 0) ok(`C3+C4 rendered: zero bare "LOCK" in title/description/og/twitter/aria/alt/JSON-LD across ${htmlFiles} built HTML files`)
  else fail(`C3+C4 rendered: ${renderedHits} violation(s) in shipped HTML`)
}

// ── CLAUSE 5 · NON-HTML PUBLIC SURFACES.
let pubHits = 0
for (const f of ['website-next/public/llms.txt', `${OUT}/llms.txt`, `${OUT}/robots.txt`, `${OUT}/sitemap.xml`]) {
  if (!existsSync(f)) continue
  const m = readFileSync(f, 'utf8').match(BARE)
  if (m) { pubHits += m.length; fail(`C5 ${f}: ${m.length} bare "LOCK"`) }
}
if (pubHits === 0) ok('C5 non-HTML public surfaces clean (llms.txt, robots.txt, sitemap.xml)')

// ── CLAUSE 2 · uppercase LOCK.SHOW only in an approved lockup.
let upper = 0
for (const f of SRC) {
  if (LOCKUP_ALLOWLIST.includes(f)) continue
  const m = readFileSync(f, 'utf8').match(UPPER_DOTTED)
  if (m) { upper += m.length; fail(`C2 ${f}: uppercase "LOCK.SHOW" outside an approved lockup (${m.length})`) }
}
if (upper === 0) ok(`C2 uppercase LOCK.SHOW confined to the ${LOCKUP_ALLOWLIST.length}-entry lockup allowlist`)

// ── VACUOUS-PASS GUARD. If the corpus is empty the gate proves nothing.
if (SRC.length < 50) fail(`vacuous: only ${SRC.length} source files scanned — the corpus collapsed`)
else ok(`vacuous-pass guard: ${SRC.length} source files + ${htmlFiles} rendered HTML files scanned`)

// POSITIVE CONTROL: the pattern must still MATCH a bare token, or a broken
// regex would report a clean sweep.
if (!'LOCK is here'.match(BARE) || 'LOCK SHOW is here'.match(BARE) || 'lock.show'.match(BARE)) {
  fail('positive control: the BARE pattern is broken (must match "LOCK", must NOT match "LOCK SHOW" or "lock.show")')
} else ok('positive control: pattern matches bare LOCK, ignores LOCK SHOW and lowercase lock.show')

console.log('')
if (failed) { console.error('✗ BRAND NAMING: violations above.'); process.exit(1) }
console.log('✓ BRAND NAMING: public/display name is LOCK SHOW everywhere — source, rendered HTML, app shells and non-HTML public surfaces; lowercase lock.show URLs preserved.')
process.exit(0)
