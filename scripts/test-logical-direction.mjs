#!/usr/bin/env node
/**
 * LOGICAL DIRECTION — RTL-MIRROR
 *
 * `test-fit` now renders every screen in he/rtl and measures GEOMETRY: boxes,
 * overflow, overlap, tap targets. It is structurally blind to MIRRORING. A gold
 * quote bar pinned with `border-l-4` does not overflow anything in Hebrew — it
 * simply sits on the wrong side of the quote, on the end instead of the start,
 * and every spatial assertion passes.
 *
 * Tailwind's logical utilities (`ps/pe`, `ms/me`, `start/end`, `border-s/e`,
 * `rounded-s/e`, `text-start/end`) resolve to the SAME pixels as their physical
 * counterparts under `dir=ltr`, and flip under `dir=rtl`. So the physical form
 * is never more correct — it is only less correct in Hebrew. This gate finds
 * the physical ones.
 *
 * PRECISION IS THE WHOLE PROBLEM. A naive scan for "border-l" matches
 * `border-line` (a colour token; `border-line`+`border-line2` occur 186 times
 * here — an earlier comment said 185 for the bare token, which does not
 * reproduce), "rounded-l" matches
 * `rounded-lg`, and "left-" matches the words `left-panel` and `left-to-right`
 * in prose. Every candidate is therefore matched as a full Tailwind token and
 * its VALUE shape is checked, and the classifier is self-tested (S1) against
 * both the real utilities and those exact false friends before any verdict.
 *
 * BASELINE = the physical usages that remain, each with a reason. It is a
 * ratchet, not an allowlist to grow at will: a NEW physical utility fails, and
 * fixing a baselined one ALSO fails until the baseline is tightened.
 *
 * TWO SCOPES. (A) Tailwind class tokens in tracked JS/JSX under `src/`.
 * (B) CSS DECLARATIONS in the authored stylesheets both surfaces actually ship —
 * scope (B) closes the blind spot scope (A) shipped with, since a physical
 * `padding-left` in a stylesheet is invisible to a class scan.
 *
 * KNOWN LIMITS, stated: it does not resolve classes composed at runtime from
 * fragments; it says nothing about gradient direction (`bg-gradient-to-r` has no
 * logical form in Tailwind 3) or about `background-position: left`, which is
 * direction-sensitive and has no logical form either. Passing does not mean the
 * UI mirrors correctly — only that no NEW physical utility or declaration was
 * introduced in these scopes.
 *
 * Run: node scripts/test-logical-direction.mjs
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// ── the physical utilities, each with the logical form that replaces it ──────
// `value` describes what may follow the token, so `border-l` matches
// `border-l` / `border-l-4` but NOT `border-line`.
// Longest alternative FIRST: with `\d+` before `\d+\/\d+`, `left-1/2` matched as
// the token `left-1` — detected, but reported wrong. S1 now compares the exact
// token text, not merely "something was found", so that cannot recur silently.
const NUM = String.raw`(?:-(?:\d+\/\d+|\d+(?:\.\d+)?|px|auto|full|reverse|\[[^\]]+\]))`
const SIZE = String.raw`(?:-(?:none|sm|md|lg|xl|2xl|3xl|full|\[[^\]]+\]))`
// VARIANT PREFIXES (independent review finding F2). The boundary used to be a
// bare `(?:^|[\s"'\`{])`, so any Tailwind variant chain or `!` important marker
// in front of the token suppressed the match entirely: `sm:pl-5`, `hover:ml-2`,
// `md:text-left`, `lg:border-l-4`, `dark:right-0` and `!pl-5` were all invisible
// — and responsive variants are how most layout in this repo is written, so the
// hole sat exactly where new physical utilities would appear. The boundary now
// consumes an optional `!` and any number of `xxx:` variants, and the reported
// token KEEPS them, so a baseline entry names which breakpoint the debt is at.
const VARIANT = String.raw`(?:!?(?:[a-zA-Z0-9_@\[\]./-]+:)*)`
const RULES = [
  { re: new RegExp(String.raw`(?:^|[\s"'\`{])(${VARIANT}-?(?:pl|pr|ml|mr)${NUM})(?![\w-])`, 'g'), fix: 'ps-/pe-, ms-/me-' },
  { re: new RegExp(String.raw`(?:^|[\s"'\`{])(${VARIANT}-?(?:left|right)${NUM})(?![\w-])`, 'g'), fix: 'start-/end-' },
  { re: new RegExp(String.raw`(?:^|[\s"'\`{])(${VARIANT}text-(?:left|right))(?![\w-])`, 'g'), fix: 'text-start/text-end' },
  { re: new RegExp(String.raw`(?:^|[\s"'\`{])(${VARIANT}border-[lr]${NUM}?)(?![\w-])`, 'g'), fix: 'border-s/border-e' },
  { re: new RegExp(String.raw`(?:^|[\s"'\`{])(${VARIANT}rounded-(?:[lr]|t[lr]|b[lr])${SIZE}?)(?![\w-])`, 'g'), fix: 'rounded-s/rounded-e (or the -ss/-se/-es/-ee corners)' },
  { re: new RegExp(String.raw`(?:^|[\s"'\`{])(${VARIANT}(?:float|clear|origin)-(?:left|right))(?![\w-])`, 'g'), fix: 'the logical equivalent' },
]

const findings = []
let checks = 0
const check = (label, cond, detail = '') => {
  checks++
  if (cond) console.log(`  ✓ ${label}`)
  else findings.push(`${label}${detail ? ` — ${detail}` : ''}`)
}

function scan(text) {
  const hits = []
  for (const { re, fix } of RULES) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(text)) !== null) { hits.push({ token: m[1], fix }); re.lastIndex = m.index + 1 }
  }
  return hits
}

// ── S1 classifier self-test — the real utilities AND the exact false friends ──
{
  const REAL = ['pl-5', 'pr-4', 'ml-auto', 'mr-2', 'left-10', 'right-1.5', 'left-1/2', 'text-left', 'text-right',
    'border-l', 'border-l-4', 'border-r-2', 'rounded-l', 'rounded-r-xl', 'rounded-tl-lg', 'float-right', '-ml-1',
    // variant-prefixed forms (F2) — the token keeps its variants, so a baseline
    // entry says which breakpoint or state the debt lives at
    'sm:pl-5', 'md:text-left', 'lg:border-l-4', 'dark:right-0', 'hover:ml-2', '!pl-5', 'sm:hover:pr-3', 'max-md:left-4']
  const FALSE_FRIENDS = ['border-line', 'border-line2', 'rounded-lg', 'left-panel', 'right-rail', 'left-to-right',
    'ps-5', 'pe-4', 'ms-auto', 'me-2', 'start-10', 'end-16', 'text-start', 'text-end', 'border-s-4', 'rounded-e-xl',
    'leftovers', 'copyright-notice',
    'sm:ps-5', 'md:text-start', 'hover:ms-auto', '!pe-4', 'sm:border-line', 'md:rounded-lg']
  // Compare the exact token, not just "found something": a regex that matches
  // `left-1` inside `left-1/2` would pass a mere detection check and then report
  // and baseline the wrong string.
  const missed = REAL.filter((t) => { const h = scan(` ${t} `); return h.length !== 1 || h[0].token !== t })
  const wrong = FALSE_FRIENDS.filter((t) => scan(` ${t} `).length > 0)
  check('S1 classifier self-test — every real physical utility is detected AND reported by its exact token',
    missed.length === 0, `missed or mis-tokenised: ${missed.map((t) => `${t} -> ${JSON.stringify(scan(` ${t} `).map((h) => h.token))}`).join(' · ')}`)
  check('S1b classifier self-test — no false friend is flagged (border-line, rounded-lg, left-panel, the logical forms…)',
    wrong.length === 0, `wrongly flagged: ${wrong.join(', ')}`)
  if (findings.length) {
    console.error(`\n✖ LOGICAL DIRECTION: the classifier is broken, so no verdict below would mean anything — ${findings[0]}`)
    process.exit(1)
  }
}

// ── scan the tracked app tree ───────────────────────────────────────────────
const files = execSync("git ls-files 'src/*' 'src/**/*'", { encoding: 'utf8' })
  .split('\n').filter((f) => /\.(jsx?|tsx?)$/.test(f))
check('S2 non-vacuity — the tracked src tree was enumerated', files.length > 50, `${files.length} files`)

const found = {}
for (const f of files) {
  const hits = scan(readFileSync(f, 'utf8'))
  if (hits.length) (found[f] ||= []).push(...hits.map((h) => h.token))
}

// ── BASELINE: physical utilities that remain, WITH the reason each is kept ───
// Direction-NEUTRAL by construction — mirroring them would change nothing, and
// converting them would only obscure the intent.
const BASELINE = {
  // `left-1/2` always pairs with `-translate-x-1/2`: this is horizontal
  // CENTRING, not a side. `start-1/2` would centre identically and read worse.
  'src/features/artist/RadarUniverse.jsx': ['left-1/2', 'left-1/2'],
  'src/features/passport/passportKit.jsx': ['left-1/2'],
  'src/features/agency/AgencyRadarUniverse.jsx': ['left-1/2'],
  // `left-0 right-0` pins BOTH sides — a symmetric stretch, identical mirrored.
  'src/features/passport/Passport.jsx': ['left-0', 'right-0'],
}

const norm = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, [...v].sort()]).sort(([a], [b]) => a.localeCompare(b)))
const got = norm(found), want = norm(BASELINE)
for (const f of Object.keys(got)) {
  if (!want[f]) { findings.push(`R1 NEW physical direction utility in ${f}: ${got[f].join(', ')} — use the logical form (identical under LTR, correct under RTL), or add it to BASELINE with a reason`); continue }
  if (JSON.stringify(got[f]) !== JSON.stringify(want[f])) {
    findings.push(`R1 ${f} changed — baseline ${JSON.stringify(want[f])}, found ${JSON.stringify(got[f])}`)
  }
}
for (const f of Object.keys(want)) {
  if (!got[f]) findings.push(`R1 STALE baseline — ${f} no longer uses a physical direction utility; remove it from BASELINE so the ratchet stays tight`)
}
check('R1 ratchet — the physical-utility set matches BASELINE exactly (no new, no stale)', !findings.some((x) => x.startsWith('R1 ')))

// ── R2 non-vacuity: the scan must be capable of finding something here ───────
const totalFound = Object.values(found).flat().length
check('R2 non-vacuity — the scanner did find physical utilities in this tree (it is not silently matching nothing)',
  totalFound > 0, `found ${totalFound}`)

// ── (B) CSS declarations in the stylesheets that actually ship ──────────────
// SCOPE, with the evidence for each exclusion rather than a silent filter:
//   · docs/reference/LOCK_DESIGN_SYSTEM_THEME.v8.css — a reference document.
//     `grep -rn LOCK_DESIGN_SYSTEM_THEME` outside docs/reference/ returns
//     NOTHING: no import, no build step, no <link>. It ships nowhere.
//   · website-next/public/app/assets/*.css — the PRE-BUILT embed bundle copied
//     around by scripts/embed-post.mjs. Generated output, not authored source.
// Everything else tracked with a .css extension is in scope, so a NEW stylesheet
// is scanned the moment it is added rather than needing to be opted in.
const CSS_EXCLUDE = [/^docs\/reference\//, /^website-next\/public\//]
const cssFiles = execSync("git ls-files '*.css'", { encoding: 'utf8' })
  .split('\n').filter(Boolean).filter((f) => !CSS_EXCLUDE.some((re) => re.test(f)))
// The old S3 asked whether `cssFiles` contained an excluded file — but
// `cssFiles` was PRODUCED by filtering with those same patterns, so the second
// conjunct could never be false (review finding F6). Worse, widening
// CSS_EXCLUDE silently shrank the scope and S3 still passed. The scope is now
// PINNED by name: adding an exclusion, or losing a stylesheet, changes this list
// and fails. Adding a NEW stylesheet also fails, deliberately — a new authored
// stylesheet must be looked at once, not swept in silently.
const EXPECTED_CSS_SCOPE = [
  'src/index.css',
  'website-next/app/globals.css',
  'website-next/styles/design-system.css',
  'website-next/styles/hero.css',
]
check('S3 the scanned stylesheet set is exactly the pinned scope (widening CSS_EXCLUDE cannot shrink it silently)',
  JSON.stringify([...cssFiles].sort()) === JSON.stringify([...EXPECTED_CSS_SCOPE].sort()),
  `pinned ${JSON.stringify(EXPECTED_CSS_SCOPE)}, scanned ${JSON.stringify(cssFiles)}`)
// And each exclusion must still be doing work — a dead pattern is a pattern
// nobody notices has stopped matching.
const allCss = execSync("git ls-files '*.css'", { encoding: 'utf8' }).split('\n').filter(Boolean)
const deadExclusions = CSS_EXCLUDE.filter((re) => !allCss.some((f) => re.test(f)))
check('S3b every CSS_EXCLUDE pattern still matches a real tracked file (no dead exclusions)',
  deadExclusions.length === 0, `dead: ${deadExclusions.map(String).join(', ')}`)

// A declaration, not a substring: the property must follow `{`, `;` or the start
// of a line. That is what keeps `[style*="right: 14px"]` inside a SELECTOR, and
// a `.left-panel` class name, from reading as a physical declaration.
const PHYSICAL_PROP = /^(?:padding-(?:left|right)|margin-(?:left|right)|border-(?:left|right)(?:-(?:width|color|style))?|left|right|scroll-(?:margin|padding)-(?:left|right))$/
const VALUE_PROP = /^(?:text-align|float|clear)$/
// SHORTHANDS (review finding F2). `padding: 0 0 0 24px` is every bit as physical
// as `padding-left: 24px`, and the longhand-only list could not see it. A
// shorthand is direction-sensitive only when its RESOLVED left and right differ:
// the 1-, 2- and 3-value forms are all horizontally symmetric, so only the
// 4-value form can be, and `padding: 4px 4px 4px 4px` still is not.
const BOX_SHORTHAND = /^(?:padding|margin|inset|border-width|border-color|border-style|scroll-margin|scroll-padding)$/
// `!important` is a flag, not a component. Counting it as one made
// `border-radius: 0 !important` parse as two corners and read asymmetric — a
// false positive this file's own self-test now pins.
const parts = (value) => value.replace(/!\s*important/gi, '').split('/')[0].trim().split(/\s+/).filter(Boolean)
function boxIsAsymmetric(value) {
  const p = parts(value)
  return p.length === 4 && p[1] !== p[3] // [top, RIGHT, bottom, LEFT]
}
function radiusIsAsymmetric(value) {
  // corners resolve as [TL, TR, BR, BL]; mirroring swaps TL<->TR and BL<->BR
  const p = parts(value)
  const [tl, tr = tl, br = tl, bl = tr] = p
  return p.length > 1 && (tl !== tr || bl !== br)
}
function scanCss(text) {
  // Strip comments FIRST — "/* pinned to the left */" is prose, not a rule.
  const src = text.replace(/\/\*[\s\S]*?\*\//g, '')
  const out = []
  const re = /(?:^|[{;])\s*(--[\w-]+|[a-zA-Z-]+)\s*:\s*([^;{}]*)/g
  let m
  while ((m = re.exec(src)) !== null) {
    const prop = m[1], value = (m[2] || '').trim()
    if (prop.startsWith('--')) continue // a custom property named --left-rail is a NAME, not a direction
    if (PHYSICAL_PROP.test(prop)) out.push(prop)
    else if (VALUE_PROP.test(prop) && /^(left|right)\b/.test(value)) out.push(`${prop}:${value.split(/\s/)[0]}`)
    else if (BOX_SHORTHAND.test(prop) && boxIsAsymmetric(value)) out.push(`${prop}(asymmetric)`)
    else if (prop === 'border-radius' && radiusIsAsymmetric(value)) out.push('border-radius(asymmetric)')
  }
  return out
}

// S4 CSS classifier self-test — real declarations AND the exact false friends.
{
  const REAL = [
    ['a{padding-left:4px}', ['padding-left']],
    ['a{margin-right:4px}', ['margin-right']],
    ['a{border-left:1px solid red}', ['border-left']],
    ['a{border-left-color:red}', ['border-left-color']],
    ['a{left:50%}', ['left']],
    ['a{text-align:left}', ['text-align:left']],
    ['a{float:right}', ['float:right']],
    ['a{color:red;right:0}', ['right']],
    // asymmetric shorthands (F2)
    ['a{padding:0 0 0 24px}', ['padding(asymmetric)']],
    ['a{margin:0 0 0 16px}', ['margin(asymmetric)']],
    ['a{border-width:1px 1px 1px 4px}', ['border-width(asymmetric)']],
    ['a{inset:0 auto 0 12px}', ['inset(asymmetric)']],
    ['a{border-radius:0 8px 8px 0}', ['border-radius(asymmetric)']],
    ['a{padding:0 0 0 24px !important}', ['padding(asymmetric)']],
  ]
  const FRIENDS = [
    'a{padding-inline-start:4px}', 'a{border-inline-end:1px solid red}', 'a{inset-inline-start:0}',
    'a{--left-rail:4px}', 'a{border-radius:4px}', 'a{text-align:center}', 'a{float:none}',
    '.left-panel{color:red}', '[style*="right: 14px"]{color:red}', 'a{/* on the left */color:red}',
    'a{background:left}',
    // SYMMETRIC shorthands must NOT be flagged — 1/2/3-value forms and equal
    // 4-value forms are identical mirrored
    'a{padding:4px}', 'a{padding:4px 8px}', 'a{padding:1px 2px 3px}', 'a{padding:2px 2px 2px 2px}',
    'a{margin:0 auto}', 'a{border-radius:8px}', 'a{border-radius:4px 4px}', 'a{inset:0}',
    'a{border-radius:0 !important}', 'a{padding:4px !important}', 'a{margin:0 auto !important}',
    // A COMMENTED-OUT RULE is the case that actually needs the comment strip:
    // the `{` inside the comment satisfies the declaration anchor, so without
    // stripping this reads as a live `left:` declaration. The weaker probe
    // above ("/* on the left */", no colon, no brace) passed either way, which
    // is why removing the comment strip survived its first mutation run.
    '/* .foo { left: 0 } */ a{color:red}',
    '/* legacy: { padding-left: 8px; } */ a{color:red}',
  ]
  const bad = REAL.filter(([css, want]) => JSON.stringify(scanCss(css)) !== JSON.stringify(want))
  const leaked = FRIENDS.filter((css) => scanCss(css).length > 0)
  check('S4 CSS classifier self-test — every physical declaration is detected by its exact property',
    bad.length === 0, bad.map(([c, w]) => `${c} -> ${JSON.stringify(scanCss(c))} (wanted ${JSON.stringify(w)})`).join(' · '))
  check('S4b CSS classifier self-test — no false friend leaks (logical properties, --custom names, class selectors, [style*=…], comments)',
    leaked.length === 0, leaked.map((c) => `${c} -> ${JSON.stringify(scanCss(c))}`).join(' · '))
  if (findings.some((f) => f.startsWith('S4'))) {
    console.error(`\n✖ LOGICAL DIRECTION: the CSS classifier is broken, so its verdict would mean nothing — ${findings.find((f) => f.startsWith('S4'))}`)
    process.exit(1)
  }
}

// BASELINE (CSS): direction-NEUTRAL survivors, each with its reason.
const CSS_BASELINE = {
  // `.tap-target::before` centres the 44px hit area with left:50% + translate(-50%,-50%).
  'src/index.css': ['left'],
  // `.m-flat` / `.m-flat-white` zero BOTH sides — a symmetric reset, identical mirrored.
  'website-next/app/globals.css': ['padding-left', 'padding-left', 'padding-right', 'padding-right'],
}
const cssFound = {}
for (const f of cssFiles) {
  const hits = scanCss(readFileSync(f, 'utf8'))
  if (hits.length) (cssFound[f] ||= []).push(...hits)
}
const cssGot = norm(cssFound), cssWant = norm(CSS_BASELINE)
for (const f of Object.keys(cssGot)) {
  if (!cssWant[f]) { findings.push(`R3 NEW physical direction declaration in ${f}: ${cssGot[f].join(', ')} — use the logical property (padding-inline-start, border-inline-start, inset-inline-start, text-align:start…), or add it to CSS_BASELINE with a reason`); continue }
  if (JSON.stringify(cssGot[f]) !== JSON.stringify(cssWant[f])) {
    findings.push(`R3 ${f} changed — baseline ${JSON.stringify(cssWant[f])}, found ${JSON.stringify(cssGot[f])}`)
  }
}
for (const f of Object.keys(cssWant)) {
  if (!cssGot[f]) findings.push(`R3 STALE CSS baseline — ${f} no longer has a physical direction declaration; remove it from CSS_BASELINE so the ratchet stays tight`)
}
check('R3 CSS ratchet — the physical-declaration set matches CSS_BASELINE exactly (no new, no stale)', !findings.some((x) => x.startsWith('R3 ')))
const cssTotal = Object.values(cssFound).flat().length
check('R4 non-vacuity — the CSS scanner did find declarations in this tree', cssTotal > 0, `found ${cssTotal}`)

// ── R5 · HORIZONTAL GRADIENTS MUST MIRROR ───────────────────────────────────
// This gate used to name gradients as an accepted limit ("bg-gradient-to-r has
// no logical form in Tailwind 3"). True — and not a reason to leave them
// unchecked, because the `rtl:` variant IS the idiom. Measured consequence,
// AuthScene at 1440: in LTR the photo panel occupies x 0→920 and the veil's
// opaque end lands on the seam with the form at 920; in RTL the panel moves to
// x 520→1440 while a physical `to-r` kept ramping toward 1440, the OUTER screen
// edge, leaving the seam under the most transparent stop. The veil's whole job
// is that seam. So: any gradient with a HORIZONTAL component must carry an
// `rtl:` counterpart on the same element. Vertical (`to-t` / `to-b`) is exempt.
//
// SCOPE, named: the src/ token list PLUS website-next/{app,components}. The
// token scan above is src-only; this check is deliberately wider because a
// marketing-site gradient has exactly the same failure mode. Measured today:
// one horizontal gradient in the whole tree, already mirrored.
const GRAD_H = /(?:^|[\s"'`{:])(?:!?(?:[a-zA-Z0-9_@\[\]./-]+:)*)bg-gradient-to-(?:r|l|tr|tl|br|bl)\b/
const GRAD_RTL = /rtl:bg-gradient-to-/
function gradientViolations(text) {
  const out = []
  text.split('\n').forEach((line, i) => {
    if (!GRAD_H.test(line)) return
    // A line that only carries the rtl: counterpart is the counterpart.
    const bare = line.replace(/rtl:bg-gradient-to-(?:r|l|tr|tl|br|bl)\b/g, '')
    if (!GRAD_H.test(bare)) return
    if (!GRAD_RTL.test(line)) out.push({ line: i + 1, text: line.trim().slice(0, 100) })
  })
  return out
}
{
  // Self-test first: the rule must fire on an unmirrored horizontal gradient,
  // stay silent on a mirrored one, and never fire on a vertical one.
  const CASES = [
    ['<div className="bg-gradient-to-r from-a to-b" />', 1],
    ['<div className="bg-gradient-to-l from-a to-b" />', 1],
    ['<div className="md:bg-gradient-to-br from-a to-b" />', 1],
    ['<div className="bg-gradient-to-r rtl:bg-gradient-to-l from-a to-b" />', 0],
    ['<div className="bg-gradient-to-t from-a to-b" />', 0],
    ['<div className="bg-gradient-to-b from-a to-b" />', 0],
    ['<div className="rtl:bg-gradient-to-l from-a to-b" />', 0],
    ['<div className="bg-linear-to-r from-a to-b" />', 0],
  ]
  const wrong = CASES.filter(([src, want]) => gradientViolations(src).length !== want)
  check('S5 gradient-mirror self-test — fires on an unmirrored horizontal gradient, silent on a mirrored or vertical one',
    wrong.length === 0, wrong.map(([src]) => src).join(' · '))
}
const GRAD_FILES = [...files, ...execSync("git ls-files 'website-next/app' 'website-next/components'", { encoding: 'utf8' })
  .split('\n').filter((f) => f && /\.(jsx?|tsx?)$/.test(f))]
let gradSites = 0
for (const f of GRAD_FILES) {
  for (const v of gradientViolations(readFileSync(f, 'utf8'))) {
    gradSites++
    findings.push(`R5 ${f}:${v.line} horizontal gradient with no rtl: counterpart — add \`rtl:bg-gradient-to-<mirror>\`; identical in LTR, correct in RTL — ${v.text}`)
  }
}
check('R5 every horizontal gradient carries an rtl: counterpart', gradSites === 0, `${gradSites} unmirrored`)

console.log(`\n  scanned ${files.length} tracked src files · ${totalFound} physical direction utilities, all baselined as direction-neutral`)
console.log(`  scanned ${cssFiles.length} authored stylesheet(s) · ${cssTotal} physical direction declaration(s), all baselined as direction-neutral`)
if (findings.length) {
  console.error(`\n✖ LOGICAL DIRECTION — ${findings.length} finding(s) of ${checks} checks:`)
  for (const x of findings) console.error(`   · ${x}`)
  process.exit(1)
}
console.log(`✓ LOGICAL DIRECTION — ${checks} checks hold`)
