#!/usr/bin/env node
/**
 * CHAIN CLOSED — VERIFY-CLOSED
 *
 * A gate that reports exit 0 while measuring nothing is worse than no gate: it
 * converts an absent proof into a green one. Three rendered gates in this repo
 * did exactly that — `test-fit`, `test-hero-contract` (its rendered half) and
 * `test-visual-regression` printed a loud SKIP and exited 0 when Chromium was
 * unavailable.
 *
 * WHAT WAS AND WAS NOT TRUE BEFORE THIS GATE, stated precisely. `npm run verify`
 * as a whole did NOT go green without a browser: `test-client-store.mjs` sits in
 * the same chain and hard-fails ("this gate is rendered-only, a skip is NOT a
 * pass"). So the chain failed closed — but only INCIDENTALLY, through one gate's
 * presence and position, which nothing pinned. Each of the three individually
 * (`npm run test:fit`, and so on) reported success having measured no pixel, and
 * evidence generation scrapes console text for the word SKIPPED rather than
 * reading an exit code.
 *
 * WHAT THIS GATE MEASURES. Not source text — BEHAVIOUR. Every gate in the
 * `verify` chain that imports `playwright` is EXECUTED with `playwright` made
 * unresolvable (an ESM resolve hook in the child process; nothing on disk is
 * touched), and must exit non-zero AND say why. A gate that merely crashed for
 * an unrelated reason does not satisfy it — the reason marker is required.
 *
 * C1 also pins the SET, so a newly added rendered gate cannot quietly join the
 * chain without a fail-closed path.
 *
 * KNOWN LIMIT, stated: this measures the unavailability path only. The positive
 * control — that these gates pass when the browser IS present — is provided by
 * the same `npm run verify` chain running them for real, not by this file.
 *
 * Run: node scripts/test-chain-closed.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(DIR, '..')
const REGISTER = path.join(DIR, 'lib', 'block-playwright-register.mjs')

// The marker every fail-closed path must print. It is the repo's own words for
// this rule, so it doubles as a search key.
const MARKER = /a skip is NOT a pass/i

const findings = []
let checks = 0
const check = (label, cond, detail = '') => {
  checks++
  if (cond) console.log(`  ✓ ${label}`)
  else findings.push(`${label}${detail ? ` — ${detail}` : ''}`)
}

// ── S0 mechanism self-test — runs BEFORE anything is spawned ────────────────
// The whole gate rests on one claim: that the resolve hook really makes
// `playwright` unresolvable in a child. If that claim is false, every C2/C3
// below passes or hangs for reasons that have nothing to do with fail-closed
// behaviour — so this is checked first and exits immediately, rather than
// spawning four real gates that would then launch real browsers.
const PROBE = "import('playwright').then(()=>{console.log('RESOLVED');process.exit(0)},()=>{console.log('BLOCKED');process.exit(3)})"
{
  const blocked = spawnSync(process.execPath, ['--import', REGISTER, '-e', PROBE], { cwd: ROOT, encoding: 'utf8', timeout: 60_000 })
  check('S0 the resolve hook really makes `playwright` unresolvable in the child',
    blocked.status === 3 && /BLOCKED/.test(blocked.stdout ?? ''),
    `exit=${blocked.status} out=${(blocked.stdout ?? '').trim().slice(0, 80)}`)
  const free = spawnSync(process.execPath, ['-e', PROBE], { cwd: ROOT, encoding: 'utf8', timeout: 120_000 })
  check('S0b non-vacuity — `playwright` IS installed here, so the block is what C2/C3 measure, not an absent package',
    free.status === 0 && /RESOLVED/.test(free.stdout ?? ''),
    `exit=${free.status} out=${(free.stdout ?? '').trim().slice(0, 80)}`)
  if (findings.length) {
    console.error(`\n✖ CHAIN CLOSED: the mechanism is broken, so no verdict below would mean anything — ${findings[0]}`)
    process.exit(1)
  }
}

// ── which gates does `verify` actually run? ─────────────────────────────────
const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
const chain = pkg.scripts?.verify ?? ''

// EVERY STEP IS ACCOUNTED FOR (independent review finding F3). The old parser
// looked for two shapes and silently dropped anything else — `node ./scripts/x`
// (a leading `./`) and `npx …` both vanished, so a gate could be in the chain
// and invisible to this file. Now the chain is split into steps, each step is
// classified, and an UNCLASSIFIED step is a failure rather than a silent gap.
const NODE_SCRIPT = /^node\s+(?:\.\/)?(scripts\/[\w.-]+\.mjs)\b/
const NON_GATE = /^(npm\s+run\s+(build|build:demo|build:embed|registry:events)\b|node\s+(?:\.\/)?scripts\/generate-event-registry\.mjs\b)/
const steps = chain.split('&&').map((x) => x.trim()).filter(Boolean)
const gateFiles = []
const unparsed = []
for (const step of steps) {
  const asNpm = /^npm\s+run\s+([\w:-]+)$/.exec(step)
  const expanded = asNpm ? (pkg.scripts?.[asNpm[1]] ?? '') : step
  if (asNpm && !expanded) { unparsed.push(`${step} (no such npm script)`); continue }
  const file = NODE_SCRIPT.exec(expanded.trim())
  if (file) { if (!gateFiles.includes(file[1])) gateFiles.push(file[1]); continue }
  if (NON_GATE.test(step) || NON_GATE.test(expanded.trim())) continue
  unparsed.push(`${step} → ${expanded.trim().slice(0, 70)}`)
}

check('C0 the verify chain was parsed and names real gate files', gateFiles.length > 10, `found ${gateFiles.length}`)
check('C0c every step of the verify chain is accounted for — no step silently dropped by the parser',
  unparsed.length === 0, `unclassified: ${unparsed.join(' · ')}`)
// Classifying a step is not the same as it being real. Mutation J2 added
// `node ./scripts/test-qa-unknown.mjs` to the chain: the parser happily
// classified it as a gate file, `playwrightPath` returned null because the file
// does not exist, and nothing failed. "Accounted for" has to mean the file is
// actually there, or the accounting is a formality.
const ghostGates = gateFiles.filter((f) => !existsSync(path.join(ROOT, f)))
check('C0d every gate file named by the chain exists on disk',
  ghostGates.length === 0, `missing: ${ghostGates.join(', ')}`)
check('C0b this gate is itself part of the chain it audits', gateFiles.includes('scripts/test-chain-closed.mjs'),
  'test-chain-closed.mjs is not in `npm run verify` — it would audit a chain it does not run in')

// SELF-EXCLUSION, and why it is needed rather than tidy: this file carries the
// literal `import('playwright')` inside the C4/C5 probe strings it hands to
// `node -e`. Without excluding itself it matched, spawned itself, and hung
// until the per-gate timeout — caught by running the gate, not by reading it.
const SELF = 'scripts/test-chain-closed.mjs'

// TRANSITIVE, not literal (independent review finding F3). Detection used to be
// a text scan of the gate file itself, so a gate that reached a browser through
// a shared helper — `import { launch } from './lib/browser.mjs'` — carried no
// `playwright` token and joined the chain undetected. The scan now follows
// RELATIVE imports through the local module graph and reports the path by which
// playwright is reachable, so the reason is legible in the output.
// LITERAL SPECIFIERS ONLY — the two blind spots that left, and how each is closed.
//
// (1) THE PACKAGE NAME WAS PINNED TO ONE SPELLING. `DIRECT` matched the exact
//     string 'playwright', so `import { test } from '@playwright/test'` — the
//     ordinary way a Playwright test file is written — carried no match, resolved
//     to "no browser needed", and would have joined the chain with no fail-closed
//     proof. Same for `playwright-core`. The pattern now covers the family.
//
// (2) A NON-LITERAL SPECIFIER CANNOT BE RESOLVED AT ALL, and returning null for it
//     was the wrong answer. `await import(mod)` or `import(`./${name}.mjs`)` is not
//     evidence that a file reaches no browser; it is evidence that this scanner
//     cannot tell. Silently answering "clean" is the failure mode every review in
//     this lane has found in some other form. Such a file is now REPORTED and the
//     gate FAILS: an unanalysable import is an open question, not a pass.
//
// Neither had a live instance when this was written — both are holes in the
// ratchet rather than live defects, which is exactly when they are cheapest to
// close, and the same posture recorded for the Hebrew suffix-particle hole.
// A PACKAGE PREFIX, not an enumeration (QA-INDEP-04, H3). Enumerating
// `playwright|playwright-core|@playwright/*` still missed two real ways in:
// a deep import — `import('playwright-core/lib/server/index.js')` — because the
// pattern demanded the closing quote right after the name, and the published
// `playwright-chromium` / `-firefox` / `-webkit` packages, which the fixture
// `playwrightish` was written to justify excluding. The boundary is now a `-`,
// `/` or end-of-specifier, so the family and its subpaths match while a
// lookalike like `playwrightish` still does not.
const DIRECT = /(?:from|import)\s*\(?\s*['"](?:@playwright\/[^'"]+|playwright(?:-[a-z]+)?(?:\/[^'"]*)?)['"]/
const RELATIVE = /(?:from|import)\s*\(?\s*['"](\.[^'"]+)['"]/g
// A dynamic import whose argument is not a plain quoted specifier. Not all of
// these are unanalysable: the FIRST version of this rule reported seven real
// files, and every one turned out to use a literal wrapped in a URL helper —
//
//   await import(new URL('../server/index.js', import.meta.url))
//   await import(pathToFileURL(resolve('src/lib/radar.js')).href)
//
// which this scanner can follow perfectly well. Declaring a resolvable idiom
// "unknowable" would have been the same overreach as exempting a whole file for
// one element. So the call's argument list is searched for a string literal, and
// for a bare identifier resolved one level against a `const NAME = '…'` in the
// same file; only what survives that is genuinely computed.
// Scanned per LINE rather than by counting parentheses. The first attempt tried to
// balance nested calls with a bounded `(?:\)[^)]*){0,3}?` and quietly failed on
// `import(pathToFileURL(join(process.cwd(), RULE)).href)` — four levels deep —
// reporting a file whose specifier is a plain `const RULE = 'src/lib/…'`. A regex
// that miscounts brackets is a worse oracle than the line it appears on, and every
// dynamic import in this repo fits on one line.
const DYNAMIC_LINE = /\bimport\s*\((.*)$/
const STRING_IN = /['"]([^'"]+)['"]/
// EVERY all-caps candidate, not the first (QA-INDEP-04, H3). The first version
// took `IDENT_IN`'s single first match, so
// `import(pathToFileURL(path.join(ROOT, RULE)).href)` bound to ROOT — and
// `const ROOT = path.join(DIR, '..')` is the house idiom at this file's own
// line 39 — yielding the literal "..". The reviewer injected exactly that into a
// live chain gate that really does launch Chromium and watched C1, C2b and C2c
// all pass. That is worse than the silence M6 set out to fix: the hole answered
// "cannot tell"; this answered "clean", confidently and wrongly.
//
// So: collect ALL candidates, resolve each, and take a candidate only if it
// names a real FILE. If several resolve, or none does, the specifier is opaque —
// "cannot tell" is the honest answer and it fails loudly.
const IDENT_ALL = /\b([A-Z][A-Z0-9_]*)\b/g
/** Files whose imports this scanner cannot resolve. Collected while walking, so
 *  the report names the file rather than the gate that happened to reach it. */
const opaque = new Set()
/** Does this specifier name a real FILE, from `fromAbs` or from the repo root?
 *  A directory is not a module, and ".." is the answer a broken resolver gives. */
function resolvesToFile(fromAbs, spec) {
  for (const base of [path.dirname(fromAbs), ROOT]) {
    const t = path.resolve(base, spec)
    try { if (existsSync(t) && statSync(t).isFile()) return true } catch { /* not a file */ }
  }
  return false
}
function playwrightPath(file, seen = new Set()) {
  const abs = path.join(ROOT, file)
  if (seen.has(abs) || !existsSync(abs)) return null
  seen.add(abs)
  let src
  try { src = readFileSync(abs, 'utf8') } catch { return null }
  // Dynamic specifiers: resolve what is resolvable, report only the rest.
  const dynamicTargets = []
  if (file !== SELF) {
    for (const line of src.split('\n')) {
      const m = DYNAMIC_LINE.exec(line)
      if (!m) continue
      const args = m[1]
      if (/^\s*['"]/.test(args)) continue                    // a plain literal; RELATIVE handles it
      // An interpolated template is genuinely computed even though it contains
      // quote-free text — check for it before looking for a literal.
      const interpolated = /`[^`]*\$\{/.test(args)
      // A literal in the call itself is unambiguous.
      let lit = interpolated ? null : args.match(STRING_IN)?.[1]
      if (!lit && !interpolated) {
        // One level of indirection through a CONST in this file. Every all-caps
        // identifier in the argument list is a candidate; a candidate counts only
        // if its literal names a file that EXISTS. `ROOT` resolving to ".." names
        // a directory, so it is discarded rather than believed.
        const cands = []
        IDENT_ALL.lastIndex = 0
        for (const idm of args.matchAll(IDENT_ALL)) {
          const decl = src.match(new RegExp(`\\bconst\\s+${idm[1]}\\s*=([^\\n]*)`))?.[1]
          const cand = decl?.match(STRING_IN)?.[1]
          if (cand && resolvesToFile(abs, cand)) cands.push(cand)
        }
        // Exactly one real file is a resolution; zero or several is a guess.
        if (cands.length === 1) lit = cands[0]
      }
      // A literal that does not name a real file is not a resolution either —
      // it is a specifier this scanner failed to understand.
      if (lit && !resolvesToFile(abs, lit)) lit = null
      if (lit) dynamicTargets.push(lit)
      else opaque.add(file)
    }
  }
  if (DIRECT.test(src)) return [file]
  for (const m of src.matchAll(RELATIVE)) {
    const target = path.relative(ROOT, path.resolve(path.dirname(abs), m[1]))
    const deeper = playwrightPath(target, seen)
    if (deeper) return [file, ...deeper]
  }
  // A resolved dynamic target is a real edge in the graph — a gate that reaches a
  // browser through `import(new URL('./lib/browser.mjs', import.meta.url))` is as
  // browser-dependent as one that writes the import statically.
  for (const lit of dynamicTargets) {
    const base = lit.startsWith('.') ? path.dirname(abs) : ROOT
    const deeper = playwrightPath(path.relative(ROOT, path.resolve(base, lit)), seen)
    if (deeper) return [file, ...deeper]
  }
  return null
}

// ── S1 reachability self-test, on fixtures, before any real verdict ─────────
{
  const dir = path.join(ROOT, 'scripts', '.chain-closed-fixture')
  const w = (name, body) => { writeFileSync(path.join(dir, name), body) }
  mkdirSync(dir, { recursive: true })
  try {
    w('direct.mjs', "import { chromium } from 'playwright'\nexport default chromium\n")
    w('helper1.mjs', "import { chromium } from 'playwright'\nexport const launch = () => chromium.launch()\n")
    w('viaHelper.mjs', "import { launch } from './helper1.mjs'\nexport default launch\n")
    w('helper2.mjs', "import { launch } from './helper1.mjs'\nexport const go = launch\n")
    w('viaTwo.mjs', "import { go } from './helper2.mjs'\nexport default go\n")
    w('innocent.mjs', "export const x = 1\n")
    w('viaInnocent.mjs', "import { x } from './innocent.mjs'\nexport default x\n")
    // M6 · the package family, not one spelling. `@playwright/test` is the
    // ordinary way a Playwright test file is written and matched nothing before.
    w('scoped.mjs', "import { test } from '@playwright/test'\nexport default test\n")
    w('core.mjs', "import { chromium } from 'playwright-core'\nexport default chromium\n")
    w('viaScoped.mjs', "import t from './scoped.mjs'\nexport default t\n")
    // …and a package whose name merely STARTS with the token must not match, or
    // the widening would trade one blind spot for a false positive.
    w('lookalike.mjs', "import { x } from 'playwrightish'\nexport default x\n")
    // M6 · an import this scanner cannot read. Not "no browser" — "cannot tell".
    // NOT `process.env.X` — the integration-contract gate scans source for env
    // reads and demands they be registered, and it correctly flagged this fixture
    // STRING as an unregistered read. A fixture must not smuggle a real-looking
    // credential surface into the tree just to be unresolvable.
    w('opaque.mjs', "const m = String(Math.trunc(1))\nexport default await import(m)\n")
    w('opaqueTpl.mjs', "const n = 'a'\nexport default await import(`./${n}.mjs`)\n")
    // …and the WRAPPED-LITERAL idioms this repo actually uses, which are
    // resolvable and must be followed rather than reported.
    w('viaUrl.mjs', "export default await import(new URL('./helper1.mjs', import.meta.url))\n")
    w('viaPathToFileUrl.mjs', "export default await import(pathToFileURL(resolve('scripts/.chain-closed-fixture/helper1.mjs')).href)\n")
    w('viaConst.mjs', "const RULE = 'scripts/.chain-closed-fixture/helper1.mjs'\nexport default await import(pathToFileURL(RULE).href)\n")
    // QA-INDEP-04 H3, verbatim: TWO all-caps candidates, and the FIRST one is a
    // directory. Taking the first match resolved this to ".." and called a
    // browser-launching gate clean.
    w('viaRootJoin.mjs', "const ROOT = path.join(DIR, '..')\nconst RULE = 'scripts/.chain-closed-fixture/helper1.mjs'\nexport default await import(pathToFileURL(path.join(ROOT, RULE)).href)\n")
    // A const whose literal names nothing on disk is not a resolution.
    w('viaMissing.mjs', "const GONE = './does-not-exist.mjs'\nexport default await import(pathToFileURL(GONE).href)\n")
    // Deep import into the package, and the published playwright-* family.
    w('deep.mjs', "export default await import('playwright-core/lib/server/index.js')\n")
    w('family.mjs', "import { chromium } from 'playwright-chromium'\nexport default chromium\n")
    w('viaUrlClean.mjs', "export default await import(new URL('./innocent.mjs', import.meta.url))\n")
    const rel = (n) => `scripts/.chain-closed-fixture/${n}`
    const cases = [
      ['direct.mjs', true], ['viaHelper.mjs', true], ['viaTwo.mjs', true],
      ['scoped.mjs', true], ['core.mjs', true], ['viaScoped.mjs', true],
      ['viaUrl.mjs', true], ['viaPathToFileUrl.mjs', true], ['viaConst.mjs', true],
      ['viaRootJoin.mjs', true], ['deep.mjs', true], ['family.mjs', true],
      ['innocent.mjs', false], ['viaInnocent.mjs', false], ['lookalike.mjs', false],
      ['viaUrlClean.mjs', false],
    ]
    const wrong = cases.filter(([n, want]) => !!playwrightPath(rel(n)) !== want)
    check('S1 reachability self-test — playwright is found through a helper, through TWO helpers, and under @playwright/* and playwright-core; it is not invented where absent, nor for a lookalike package name',
      wrong.length === 0, wrong.map(([n, want]) => `${n} should ${want ? '' : 'NOT '}resolve`).join(' · '))

    // S1b · the OPAQUE case, proven in both directions on fixtures. A file whose
    // import argument is not a literal must be REPORTED, and an ordinary literal
    // import must not be — otherwise the new rule would flag the whole codebase.
    opaque.clear()
    for (const n of ['opaque.mjs', 'opaqueTpl.mjs', 'direct.mjs', 'viaHelper.mjs',
      'viaUrl.mjs', 'viaPathToFileUrl.mjs', 'viaConst.mjs', 'viaRootJoin.mjs',
      'viaMissing.mjs']) playwrightPath(rel(n))
    const flagged = [...opaque].map((f) => f.split('/').pop()).sort()
    check('S1b only a GENUINELY computed specifier is reported — a wrapped literal, or a const that resolves to a real FILE, is followed; a candidate that names a directory or nothing at all is reported rather than believed',
      JSON.stringify(flagged) === JSON.stringify(['opaque.mjs', 'opaqueTpl.mjs', 'viaMissing.mjs']),
      `flagged ${JSON.stringify(flagged)}`)
    opaque.clear()
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
  // Scope the hard exit to S1's OWN finding. It used to test `findings.length`,
  // which by this point also holds C0/C0b/C0c/C0d — so a chain-parsing failure
  // was announced as "the reachability scan is broken". A gate that misnames its
  // own failure sends the reader to the wrong file.
  const s1Failure = findings.find((f) => f.startsWith('S1 '))
  if (s1Failure) {
    console.error(`\n✖ CHAIN CLOSED: the reachability scan is broken, so no verdict below would mean anything — ${s1Failure}`)
    process.exit(1)
  }
}

const renderedPaths = new Map()
for (const f of gateFiles) {
  if (f === SELF) continue
  const via = playwrightPath(f)
  if (via) renderedPaths.set(f, via)
}
const rendered = [...renderedPaths.keys()].sort()

// Pinned SET. A new rendered gate must be added here deliberately — with a
// fail-closed path — rather than joining the chain unnoticed.
const EXPECTED = [
  'scripts/test-client-store.mjs',
  'scripts/test-fit.mjs',
  'scripts/test-hero-contract.mjs',
  // Added by QA-INDEP-03 H2: the brand gate can read an SVG but never a PNG, so
  // the SERVED share card was unasserted. test:og-assets re-renders every og/*.svg
  // and compares bytes, which needs a real browser — and therefore needs the same
  // fail-closed proof every other rendered gate here gets.
  'scripts/test-og-assets.mjs',
  'scripts/test-visual-regression.mjs',
].sort()
check('C1 the set of browser-dependent gates in the verify chain is exactly the pinned set',
  JSON.stringify(rendered) === JSON.stringify(EXPECTED),
  `pinned ${JSON.stringify(EXPECTED)}, found ${JSON.stringify(rendered)}`)
check('C1b non-vacuity — at least one browser-dependent gate was detected', rendered.length > 0)
// AN UNANALYSABLE IMPORT IS AN OPEN QUESTION, NOT A PASS (M6). If a gate or any
// module it reaches imports through a computed specifier, this scanner cannot say
// whether a browser is on the other side — and "cannot say" must not be recorded
// as "does not need one", which is how a rendered gate would rejoin the chain
// with no fail-closed proof. There is no live instance today; this keeps it so.
// PINNED, MAY ONLY SHRINK. One file in the chain genuinely computes its specifier:
// test-i18n-parity's `load(path)` interpolates a parameter — `new URL(\`../${path}\`,
// import.meta.url)` — and its callers pass i18n catalogue paths. No amount of
// static analysis resolves a function parameter, so this is recorded as a known
// unknown rather than pretended away, and adding a second one is a gate failure.
const OPAQUE_PINNED = ['scripts/test-i18n-parity.mjs']
const opaqueNew = [...opaque].filter((f) => !OPAQUE_PINNED.includes(f))
const opaqueStale = OPAQUE_PINNED.filter((f) => !opaque.has(f))
check('C2b no NEW file imports through a computed specifier — reachability must never be unknown by accident',
  opaqueNew.length === 0,
  `${opaqueNew.length} unpinned file(s) with an unresolvable specifier: ${opaqueNew.join(', ')}`)
check('C2c the pinned unknowns are still unknown — a stale pin is an exemption nobody re-earned',
  opaqueStale.length === 0,
  `no longer opaque, remove from OPAQUE_PINNED: ${opaqueStale.join(', ')}`)

// ── execute each one with playwright unresolvable ───────────────────────────
for (const gate of rendered) {
  const r = spawnSync(process.execPath, ['--import', REGISTER, path.join(ROOT, gate)], {
    cwd: ROOT, encoding: 'utf8', timeout: 120_000,
    env: { ...process.env, CI: '1' },
  })
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`
  check(`C2 ${gate} exits NON-ZERO when playwright cannot be resolved`,
    r.status !== 0 && r.status !== null,
    `exit=${r.status}${r.signal ? ` signal=${r.signal}` : ''} · last line: ${out.trim().split('\n').slice(-1)[0]?.slice(0, 160)}`)
  check(`C3 ${gate} says WHY — it names the rule rather than failing by accident`,
    MARKER.test(out),
    `no "a skip is NOT a pass" in output · last line: ${out.trim().split('\n').slice(-1)[0]?.slice(0, 160)}`)
}

if (findings.length) {
  console.error(`\n✖ CHAIN CLOSED — ${findings.length} finding(s) of ${checks} checks:`)
  for (const f of findings) console.error(`   · ${f}`)
  process.exit(1)
}
console.log(`\n✓ CHAIN CLOSED — ${checks} checks hold: ${rendered.length} browser-dependent gates in \`verify\`, each proven to fail closed by execution, not by reading its source.`)
