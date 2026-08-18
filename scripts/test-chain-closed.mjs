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
import { readFileSync } from 'node:fs'
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
const scriptNames = [...chain.matchAll(/npm run ([\w:-]+)/g)].map((m) => m[1])
const gateFiles = [...new Set(
  scriptNames
    .map((n) => pkg.scripts?.[n])
    .filter(Boolean)
    .flatMap((cmd) => [...cmd.matchAll(/node (scripts\/[\w.-]+\.mjs)/g)].map((m) => m[1])),
)]
// Gates invoked directly in the chain (not via `npm run`) count too.
for (const m of chain.matchAll(/node (scripts\/[\w.-]+\.mjs)/g)) if (!gateFiles.includes(m[1])) gateFiles.push(m[1])

check('C0 the verify chain was parsed and names real gate files', gateFiles.length > 10, `found ${gateFiles.length}`)
check('C0b this gate is itself part of the chain it audits', gateFiles.includes('scripts/test-chain-closed.mjs'),
  'test-chain-closed.mjs is not in `npm run verify` — it would audit a chain it does not run in')

// SELF-EXCLUSION, and why it is needed rather than tidy: this file carries the
// literal `import('playwright')` inside the C4/C5 probe strings it hands to
// `node -e`. Without excluding itself it matched, spawned itself, and hung
// until the per-gate timeout — caught by running the gate, not by reading it.
const SELF = 'scripts/test-chain-closed.mjs'
const rendered = gateFiles
  .filter((f) => f !== SELF)
  .filter((f) => /from ['"]playwright['"]|import\(['"]playwright['"]\)/.test(readFileSync(path.join(ROOT, f), 'utf8')))
  .sort()

// Pinned SET. A new rendered gate must be added here deliberately — with a
// fail-closed path — rather than joining the chain unnoticed.
const EXPECTED = [
  'scripts/test-client-store.mjs',
  'scripts/test-fit.mjs',
  'scripts/test-hero-contract.mjs',
  'scripts/test-visual-regression.mjs',
].sort()
check('C1 the set of browser-dependent gates in the verify chain is exactly the pinned set',
  JSON.stringify(rendered) === JSON.stringify(EXPECTED),
  `pinned ${JSON.stringify(EXPECTED)}, found ${JSON.stringify(rendered)}`)
check('C1b non-vacuity — at least one browser-dependent gate was detected', rendered.length > 0)

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
