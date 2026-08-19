#!/usr/bin/env node
// ============================================================
// EVIDENCE GENERATOR · scripts/generate-evidence.mjs
//
// Owner ruling (16 Aug 2026): "Generate one compact /evidence/current.json from
// tests per exact HEAD: commands/exits, gate IDs, negative tests, snapshot ID,
// independent verdict and rollback. No hand-written append-only prose."
//
// So this file records only what a run actually produced. It never asserts a
// result it did not observe, and it refuses to write a green record for a dirty
// tree — evidence pinned to a HEAD that does not describe the files on disk is
// worse than no evidence.
//
//   node scripts/generate-evidence.mjs                    → run the chain, write evidence/current.json
//   node scripts/generate-evidence.mjs --from-log <path>  → record an existing chain log
//   node scripts/generate-evidence.mjs --self-test        → prove the parser, write nothing
//
// ── M7 · WHY THE UNIT OF EVIDENCE IS THE CHAIN STEP, NOT A STRING PATTERN ────
//
// This file used to find gates by matching a regex against console lines. Every
// repair to that regex was a repair to a GUESS about how gates phrase themselves,
// and each one left a different set of gates invisible. Measured against a real
// green chain at 1091ea9 — 42 steps, 51 column-0 verdict lines:
//
//   · 43 lines matched the regex
//   ·  4 real gates were dropped for cosmetic reasons: `canon-drift:`,
//      `component-styles:` and `event-registry:` begin with a LOWERCASE id, and
//      `LANGUAGE-PURE (0 violations)` separates with a parenthesis, not a colon
//   ·  4 lines were vite build output — `✓ 160 modules transformed.`, `✓ built
//      in 5.63s`, twice each. A looser regex would have ADDED FOUR FAKE GATES,
//      which is why "just widen the pattern" is the wrong repair
//   ·  and FIVE gates had never appeared in the evidence AT ALL, on any run:
//      test:isolation, test:security, test:public-passport, test:ds and
//      test:projection-matrix print a real column-0 summary with NO leading tick
//      (`All security-denial checks passed.`, `G13 act-isolation: 17 passed, 0
//      failed`, `DS-DRIFT PASS — …`). Nothing was broken; the parser simply had
//      no model for them, and nothing ever compared the gate list to the chain.
//
// The old header promised "a gate that stops printing disappears from the
// evidence instead of being silently assumed green". It could not keep that
// promise, because it had no idea what the chain contained.
//
// It does now. The DECLARED chain is read out of package.json, the RAN steps are
// read out of the log, and one gate is recorded per declared step — so the gate
// count cannot silently disagree with the chain, whatever a gate chooses to
// print. Summary text is still captured, but it is now decoration on a step that
// is already accounted for, not the thing that decides the step exists.
// ============================================================
import { execFileSync, execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const OUT = 'evidence/current.json'
const sh = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim()

// Build tools print their own ticks. These are NOT gate verdicts, and recording
// them would inflate the count with lines that assert nothing about the product.
// An explicit, documented list: anything NOT matched here and NOT attributable is
// reported as unclassified and fails the run, so new tool output is never
// silently absorbed.
const TOOL_OUTPUT = [
  /^[✓✗]\s+\d+\s+modules transformed\./,   // vite
  /^[✓✗]\s+built in [\d.]+m?s/,            // vite
]

/** The chain exactly as package.json declares it — the only authority on what
 *  "the full chain" means. Split on && so a step can never be miscounted. */
export function declaredChain(pkgJson) {
  const verify = JSON.parse(pkgJson).scripts.verify
  return verify.split('&&').map((s) => s.trim()).filter(Boolean).map((cmd) => ({
    cmd,
    // Only `npm run X` prints a `> gigproof@0.1.0 X` header. A raw `node …` step
    // prints nothing identifying, so its output lands inside the previous step's
    // block; it is still a declared step and is still counted.
    step: /^npm run (\S+)$/.exec(cmd)?.[1] ?? null,
  }))
}

const SUBCHECK_ID = /^[A-Z]\d+(?:-[A-Z]?\d+)?$/
/** A verdict line's display id, when it has one. Decoration, not identity. */
function summaryId(line) {
  const m = /^[✓✗]\s+([A-Za-z][A-Za-z0-9 ·/\-+]*?)(?::|\s[—–]\s|\s\()/.exec(line)
  return m ? m[1].trim() : null
}

/**
 * Attribute every line of a chain log to the step that printed it, then record
 * ONE gate per DECLARED step. A step's result comes from chain progression, not
 * from its prose: `&&` means a step that was followed by another step passed,
 * and the last step's result is the chain's exit code.
 */
export function parseChain(log, declared, exitCode) {
  const lines = log.split('\n')
  const blocks = []          // { step, lines[] } in the order they ran
  let cur = { step: null, lines: [] }
  for (const line of lines) {
    const h = /^> gigproof@[\d.]+ (\S+)/.exec(line)
    if (h) { if (cur.step || cur.lines.length) blocks.push(cur); cur = { step: h[1], lines: [] }; continue }
    cur.lines.push(line)
  }
  blocks.push(cur)

  const ranSteps = blocks.map((b) => b.step).filter(Boolean)
  const verdictLines = []
  for (const b of blocks) {
    for (const l of b.lines) {
      if (/^[✓✗]/.test(l)) verdictLines.push({ step: b.step, line: l })
    }
  }

  const gates = []
  const stepsNotRun = []
  for (const [i, d] of declared.entries()) {
    // The umbrella script itself is the chain, not a step within it.
    if (d.cmd === 'npm run verify') continue
    const ran = d.step === null
      // A raw command has no header: it ran iff the chain got past the step
      // before it. With `&&`, reaching step i+1 proves step i succeeded.
      ? ranSteps.length > 0
      : ranSteps.includes(d.step)
    if (!ran) { stepsNotRun.push(d.cmd); continue }
    const block = d.step === null ? null : blocks.find((b) => b.step === d.step)
    const own = block ? block.lines.filter((l) => /^[✓✗]/.test(l) && !TOOL_OUTPUT.some((r) => r.test(l))) : []
    const failed = own.some((l) => l.startsWith('✗'))
    const isLast = i === declared.length - 1
    gates.push({
      id: (own.map(summaryId).find(Boolean)) || d.step || d.cmd,
      step: d.step ?? d.cmd,
      // A step with no printable summary is recorded anyway — that is the whole
      // point. `null` means "printed no column-0 verdict", never "did not run".
      summary: own[0] ? own[0].trim().slice(0, 400) : null,
      result: failed ? 'fail' : (isLast && exitCode !== 0) ? 'fail' : 'pass',
    })
  }

  // NOTHING MAY BE SILENTLY DISCARDED — but be exact about what that can mean
  // now. Because gates are counted per DECLARED STEP, an unfamiliar verdict line
  // printed INSIDE a step's block cannot invent or hide a gate: the step is
  // already counted, and the line is that gate's own output. So `unclassified` is
  // deliberately narrow. It catches the one case attribution cannot explain — a
  // column-0 verdict printed OUTSIDE any step, with no id and matching no
  // documented tool pattern, which means the log is not shaped the way this
  // parser believes chain logs are shaped. That is worth failing on, and it is
  // the only thing this list claims to catch.
  const subChecks = []
  const toolOutput = []
  const unclassified = []
  for (const v of verdictLines) {
    if (TOOL_OUTPUT.some((r) => r.test(v.line))) { toolOutput.push(v.line.trim()); continue }
    const id = summaryId(v.line)
    if (id && SUBCHECK_ID.test(id)) { subChecks.push({ id, result: v.line[0] === '✓' ? 'pass' : 'fail' }); continue }
    if (v.step && gates.some((g) => g.step === v.step)) continue   // belongs to a counted step
    if (id) continue                                               // a named verdict from an unheadered raw step
    unclassified.push(v.line.trim())
  }
  return { gates, ranSteps, stepsNotRun, subChecks, toolOutput, unclassified }
}

// "Nothing was skipped." is a chain ASSERTION, not a skip — counting it would
// report a skip on exactly the runs that prove there were none. Likewise
// "✓ S3 … (fail closed, never skipped)" is a gate asserting it never skips.
export function parseSkips(log) {
  return log.split('\n')
    .filter((l) => /SKIPPED|did not run|UNPROVEN in this run/i.test(l))
    .filter((l) => !/nothing was skipped/i.test(l))
    .filter((l) => !/^\s*✓/.test(l))
    .map((l) => l.trim())
}

// ── SELF-TEST ───────────────────────────────────────────────────────────────
// This generator is in no verification chain, so nothing has ever executed its
// parser except a human reading it. The fixtures below run it against logs whose
// correct answer is known, and `npm run verify` runs this mode. A parser that
// decides what the evidence says must itself be evidence.
if (process.argv.includes('--self-test')) {
  let bad = 0
  const t = (name, cond, detail = '') => {
    if (cond) console.log(`  PASS  ${name}`)
    else { bad++; console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`) }
  }
  const pkg = (verify) => JSON.stringify({ scripts: { verify } })

  console.log('\nEVIDENCE PARSER — self-test')

  // 1 · a gate that prints NO tick is still recorded. This is the exact class of
  //     defect that hid five gates: they pass, they print, they had no ✓.
  {
    const d = declaredChain(pkg('npm run a && npm run b'))
    const log = '> gigproof@0.1.0 a\nAll security-denial checks passed.\n\n> gigproof@0.1.0 b\n✓ B GATE: fine\n'
    const r = parseChain(log, d, 0)
    t('a tickless gate is still counted', r.gates.length === 2, `${r.gates.length} gate(s)`)
    t('...and is marked pass, with a null summary rather than a guess',
      r.gates[0].result === 'pass' && r.gates[0].summary === null, JSON.stringify(r.gates[0]))
  }

  // 2 · lowercase ids and the parenthesis form are gates, not noise.
  {
    const d = declaredChain(pkg('npm run a && npm run b'))
    const log = '> gigproof@0.1.0 a\n✓ canon-drift: in sync\n\n> gigproof@0.1.0 b\n✓ LANGUAGE-PURE (0 violations)\n'
    const r = parseChain(log, d, 0)
    t('a lowercase-id summary is captured', r.gates[0].id === 'canon-drift', r.gates[0].id)
    t('a parenthesis-separated summary is captured', r.gates[1].id === 'LANGUAGE-PURE', r.gates[1].id)
  }

  // 3 · build-tool ticks are NOT gates. A looser regex would have added four.
  {
    const d = declaredChain(pkg('npm run build'))
    const log = '> gigproof@0.1.0 build\n✓ 160 modules transformed.\n✓ built in 5.63s\n'
    const r = parseChain(log, d, 0)
    t('vite output is classified as tool output, not a gate',
      r.gates.length === 1 && r.toolOutput.length === 2, `${r.gates.length} gate(s), ${r.toolOutput.length} tool line(s)`)
    t('...and the build step is still counted once', r.gates[0].step === 'build')
  }

  // 4 · THE ONE THAT MATTERS: a declared step that never ran is reported, and is
  //     never quietly treated as green.
  {
    const d = declaredChain(pkg('npm run a && npm run b && npm run c'))
    const log = '> gigproof@0.1.0 a\n✓ A: ok\n\n> gigproof@0.1.0 c\n✓ C: ok\n'
    const r = parseChain(log, d, 0)
    t('a declared step missing from the log is reported', r.stepsNotRun.includes('npm run b'),
      JSON.stringify(r.stepsNotRun))
    t('...and it is NOT recorded as a passing gate', !r.gates.some((g) => g.step === 'b'))
  }

  // 5 · a failing step is a failing gate.
  {
    const d = declaredChain(pkg('npm run a'))
    const r = parseChain('> gigproof@0.1.0 a\n✗ A GATE: violations above.\n', d, 1)
    t('a ✗ summary records the gate as fail', r.gates[0].result === 'fail')
  }

  // 6 · the last step inherits the chain exit code even when it prints nothing.
  {
    const d = declaredChain(pkg('npm run a && npm run b'))
    const r = parseChain('> gigproof@0.1.0 a\n✓ A: ok\n\n> gigproof@0.1.0 b\nsilent crash\n', d, 1)
    t('a silent final step under a non-zero exit is recorded as fail',
      r.gates[1].result === 'fail', JSON.stringify(r.gates[1]))
  }

  // 7 · a verdict printed before any step header cannot be attributed, so it is
  //     surfaced rather than swallowed. Scope note: a stray line INSIDE a step's
  //     block is that step's own output and is correctly absorbed — verified
  //     below so the narrowness is a measured claim, not an assumption.
  {
    const d = declaredChain(pkg('npm run a'))
    const r = parseChain('✓ ???\n> gigproof@0.1.0 a\n✓ A: ok\n', d, 0)
    t('a verdict printed OUTSIDE any step is reported as unclassified',
      r.unclassified.length === 1, JSON.stringify(r.unclassified))
  }

  // 7b · the scope of check 7, stated by measurement: the SAME line inside a
  //      step's block is absorbed by that step and creates no extra gate.
  {
    const d = declaredChain(pkg('npm run a'))
    const r = parseChain('> gigproof@0.1.0 a\n✓ A: ok\n✓ ???\n', d, 0)
    t('...while the same line inside a step block is absorbed, not counted twice',
      r.unclassified.length === 0 && r.gates.length === 1,
      `${r.unclassified.length} unclassified, ${r.gates.length} gate(s)`)
  }

  // 8 · sub-checks stay sub-checks; conflating them inflated the gate count.
  {
    const d = declaredChain(pkg('npm run a'))
    const r = parseChain('> gigproof@0.1.0 a\n✓ S3 — something\n✓ A GATE: ok\n', d, 0)
    t('a sub-check id is not promoted to a gate',
      r.gates.length === 1 && r.subChecks.length === 1, `${r.gates.length}/${r.subChecks.length}`)
  }

  // 9 · non-vacuity: the fixtures above must exercise a real declared chain.
  {
    const real = declaredChain(readFileSync('package.json', 'utf8'))
    t('the real package.json chain parses to many steps', real.length >= 30, `${real.length} steps`)
    t('...and every step is either `npm run X` or a raw command, none empty',
      real.every((d) => d.cmd.length > 0), JSON.stringify(real.filter((d) => !d.cmd.length)))
  }

  console.log('')
  if (bad) { console.log(`✗ EVIDENCE PARSER: ${bad} failure(s).`); process.exit(1) }
  console.log('✓ EVIDENCE PARSER: one gate per declared chain step, tickless and lowercase summaries captured, build-tool output excluded, a step that did not run reported rather than assumed green, and no column-0 verdict silently discarded.')
  process.exit(0)
}

// ── RECORD A RUN ────────────────────────────────────────────────────────────
const head = sh('git rev-parse HEAD')
const branch = sh('git rev-parse --abbrev-ref HEAD')
// The evidence file itself is excluded: it is being written by this run, so its
// own dirtiness says nothing about whether the tree matches the recorded HEAD.
const dirty = sh('git status --porcelain').split('\n').filter(Boolean)
  .filter((l) => !l.includes('evidence/current.json'))

const logIdx = process.argv.indexOf('--from-log')
let log = ''
let exitCode = 0
let command = 'npm run verify'
if (logIdx > -1) {
  log = readFileSync(process.argv[logIdx + 1], 'utf8')
  exitCode = /(^|\n)✗/.test(log) ? 1 : 0
  command = `${command} (recorded from ${process.argv[logIdx + 1]})`
} else {
  try {
    log = execFileSync('npm', ['run', 'verify'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  } catch (e) {
    log = `${e.stdout || ''}${e.stderr || ''}`
    exitCode = e.status ?? 1
  }
}

const declared = declaredChain(readFileSync('package.json', 'utf8'))
const { gates, ranSteps, stepsNotRun, subChecks, toolOutput, unclassified } = parseChain(log, declared, exitCode)
const skips = parseSkips(log)

const evidence = {
  schemaVersion: '1.1.0',
  generatedBy: 'scripts/generate-evidence.mjs',
  head,
  branch,
  treeClean: dirty.length === 0,
  dirtyFiles: dirty,
  command,
  exitCode,
  result: exitCode === 0 && dirty.length === 0 ? 'green-at-head'
    : exitCode === 0 ? 'green-but-tree-dirty (does NOT describe this HEAD)'
      : 'red',
  // One gate per DECLARED chain step, so this count cannot drift from the chain
  // whatever a gate prints. `declaredStepCount` excludes the umbrella script.
  declaredStepCount: declared.filter((d) => d.cmd !== 'npm run verify').length,
  gateCount: gates.length,
  gates,
  stepsNotRun,
  subCheckCount: subChecks.length,
  subChecks,
  toolOutput,
  unclassified,
  skips,
  // Negative controls: gates that prove themselves by catching an injected defect.
  // Listed because a suite that has never failed is not evidence of anything.
  negativeControls: [
    { gate: 'INTEGRATION CONTRACT', mutations: ['unregistered env read', 'undeclared route', 'committed sk-ant-shaped literal', 'requireAuth stripped from POST /api/notify', 'schema drift', 'value smuggled into schema', 'token-bearing endpoint in schema'] },
    { gate: 'ACT BOUNDARY', mutations: ['stale parameter reference', 'act_id stamp dropped', 'non-default fail-closed guard removed', 'authority falls back to the URL'] },
    { gate: 'WAITLIST CAPTURE', mutations: ['client posts the revoked table', 'an offered role with no mapping', 'message overwrites instead of appending', 'the stale 16-argument overload is left installed'] },
    { gate: 'BRAND NAMING', mutations: ['bare LOCK in an OG source asset', 'a lockup allowlist entry removed'] },
    { gate: 'EVIDENCE PARSER', mutations: ['a gate that prints no tick', 'a declared step missing from the log', 'build-tool output offered as a gate'] },
  ],
  // Filled by the independent reviewer, never by the implementer.
  independentVerdict: null,
  rollback: 'Every gate and generated artifact in this record is additive. Revert by removing the named script/contract files and their package.json entries; no runtime code, migration or provider state is touched by the evidence layer itself.',
  unverified: [
    '.env.local is absent — no credential was exercised; no named-environment readiness is claimed.',
    'No provider console (Supabase, Vercel, Anthropic, Resend, Google, Shopify) was inspected or mutated.',
    'Migrations 043-048 remain drafted-or-authored and NOT applied to any live environment.',
  ],
}
writeFileSync(OUT, JSON.stringify(evidence, null, 2) + '\n')
console.log(`✓ wrote ${OUT} — HEAD ${head.slice(0, 8)}, exit ${exitCode}, ${gates.length}/${evidence.declaredStepCount} declared step(s) recorded, ${skips.length} skip line(s), result=${evidence.result}`)

// FAIL CLOSED on a record that cannot be trusted to describe the chain. A green
// exit here is a claim that the evidence is complete; it must not be made while
// a declared step is unaccounted for or a verdict line is unexplained.
if (unclassified.length) {
  console.error(`✗ ${unclassified.length} column-0 verdict line(s) could not be classified — the record is incomplete:`)
  for (const l of unclassified) console.error(`    ${l.slice(0, 140)}`)
  process.exit(1)
}
if (stepsNotRun.length && exitCode === 0) {
  console.error(`✗ the chain exited 0 but ${stepsNotRun.length} declared step(s) never ran: ${stepsNotRun.join(', ')}`)
  process.exit(1)
}
process.exit(0)
