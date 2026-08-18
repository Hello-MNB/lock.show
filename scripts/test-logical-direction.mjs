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
 * `border-line` (a colour token used 185 times here), "rounded-l" matches
 * `rounded-lg`, and "left-" matches the words `left-panel` and `left-to-right`
 * in prose. Every candidate is therefore matched as a full Tailwind token and
 * its VALUE shape is checked, and the classifier is self-tested (S1) against
 * both the real utilities and those exact false friends before any verdict.
 *
 * BASELINE = the physical usages that remain, each with a reason. It is a
 * ratchet, not an allowlist to grow at will: a NEW physical utility fails, and
 * fixing a baselined one ALSO fails until the baseline is tightened.
 *
 * KNOWN LIMITS, stated: this reads Tailwind class tokens in tracked JS/JSX under
 * `src/`. It does not read `.css` files (physical `padding-left` in a stylesheet
 * is invisible to it), it does not resolve classes composed at runtime from
 * fragments, and it says nothing about gradient direction (`bg-gradient-to-r`
 * has no logical form in Tailwind 3). Passing does not mean the UI mirrors
 * correctly — only that no NEW physical utility was introduced in this scope.
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
const RULES = [
  { re: new RegExp(String.raw`(?:^|[\s"'\`{])(-?(?:pl|pr|ml|mr)${NUM})(?![\w-])`, 'g'), fix: 'ps-/pe-, ms-/me-' },
  { re: new RegExp(String.raw`(?:^|[\s"'\`{])(-?(?:left|right)${NUM})(?![\w-])`, 'g'), fix: 'start-/end-' },
  { re: new RegExp(String.raw`(?:^|[\s"'\`{])(text-(?:left|right))(?![\w-])`, 'g'), fix: 'text-start/text-end' },
  { re: new RegExp(String.raw`(?:^|[\s"'\`{])(border-[lr]${NUM}?)(?![\w-])`, 'g'), fix: 'border-s/border-e' },
  { re: new RegExp(String.raw`(?:^|[\s"'\`{])(rounded-(?:[lr]|t[lr]|b[lr])${SIZE}?)(?![\w-])`, 'g'), fix: 'rounded-s/rounded-e (or the -ss/-se/-es/-ee corners)' },
  { re: new RegExp(String.raw`(?:^|[\s"'\`{])((?:float|clear|origin)-(?:left|right))(?![\w-])`, 'g'), fix: 'the logical equivalent' },
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
    'border-l', 'border-l-4', 'border-r-2', 'rounded-l', 'rounded-r-xl', 'rounded-tl-lg', 'float-right', '-ml-1']
  const FALSE_FRIENDS = ['border-line', 'border-line2', 'rounded-lg', 'left-panel', 'right-rail', 'left-to-right',
    'ps-5', 'pe-4', 'ms-auto', 'me-2', 'start-10', 'end-16', 'text-start', 'text-end', 'border-s-4', 'rounded-e-xl',
    'leftovers', 'copyright-notice']
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

console.log(`\n  scanned ${files.length} tracked src files · ${totalFound} physical direction utilities, all baselined as direction-neutral`)
if (findings.length) {
  console.error(`\n✖ LOGICAL DIRECTION — ${findings.length} finding(s) of ${checks} checks:`)
  for (const x of findings) console.error(`   · ${x}`)
  process.exit(1)
}
console.log(`✓ LOGICAL DIRECTION — ${checks} checks hold`)
