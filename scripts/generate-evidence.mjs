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
//   node scripts/generate-evidence.mjs            → run the chain, write evidence/current.json
//   node scripts/generate-evidence.mjs --from-log <path>  → record an existing chain log
// ============================================================
import { execFileSync, execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const OUT = 'evidence/current.json'
const sh = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim()

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

// Gate IDs are read out of the run, not from a hand-kept list — a gate that stops
// printing disappears from the evidence instead of being silently assumed green.
//
// TWO PARSER DEFECTS, both found by an independent reviewer's F13 and both
// measured against a real green chain log before this was changed:
//   1. `line.trim()` destroyed the only signal separating a GATE summary
//      (printed at column 0) from an indented sub-check, so both were recorded
//      as gates.
//   2. The separator was `:` only, so every gate whose summary reads
//      "✓ NAME — n checks hold" was silently ABSENT from the evidence while
//      passing. Five real gates were missing on the last green run: STORAGE
//      RESILIENCE, LOGICAL DIRECTION, REGISTRY VALID, DELTAS VALID and CHAIN
//      CLOSED. The comment above promised exactly what the code failed to do.
// The separator accepts `:` or a SPACED em/en dash — a bare hyphen would split
// hyphenated ids (WIDGET-STATES became WIDGET).
//
// Sub-checks are still recorded, as `checks`, because they are real evidence —
// they are simply not gates, and conflating them inflated the gate count.
const SUBCHECK_ID = /^[A-Z]\d+(?:-[A-Z]?\d+)?$/
const gates = []
const checks = []
for (const line of log.split('\n')) {
  const m = /^([✓✗])\s+([A-Z][A-Z0-9 ·/\-+]*?)(?::|\s[—–]\s)/.exec(line)
  if (!m) continue
  const entry = { id: m[2].trim(), result: m[1] === '✓' ? 'pass' : 'fail' }
  ;(SUBCHECK_ID.test(entry.id) ? checks : gates).push(entry)
}
// "Nothing was skipped." is a chain ASSERTION, not a skip — counting it would
// report a skip on exactly the runs that prove there were none.
// A line that PASSES an assertion about skipping is not a skip. Both exclusions
// below are for exactly that: "Nothing was skipped." is the chain's own summary,
// and "✓ S3 … (fail closed, never skipped)" is a gate asserting it never skips —
// recorded as a skip until this filter was added, which meant every green run
// reported one.
const skips = log.split('\n')
  .filter((l) => /SKIPPED|did not run|UNPROVEN in this run/i.test(l))
  .filter((l) => !/nothing was skipped/i.test(l))
  .filter((l) => !/^\s*✓/.test(l))
  .map((l) => l.trim())

const evidence = {
  schemaVersion: '1.0.0',
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
  gateCount: gates.length,
  gates,
  subCheckCount: checks.length,
  subChecks: checks,
  skips,
  // Negative controls: gates that prove themselves by catching an injected defect.
  // Listed because a suite that has never failed is not evidence of anything.
  negativeControls: [
    { gate: 'INTEGRATION CONTRACT', mutations: ['unregistered env read', 'undeclared route', 'committed sk-ant-shaped literal', 'requireAuth stripped from POST /api/notify', 'schema drift', 'value smuggled into schema', 'token-bearing endpoint in schema'] },
    { gate: 'ACT BOUNDARY', mutations: ['stale parameter reference', 'act_id stamp dropped', 'non-default fail-closed guard removed', 'authority falls back to the URL'] },
  ],
  // Filled by the independent reviewer, never by the implementer.
  independentVerdict: null,
  rollback: 'Every gate and generated artifact in this record is additive. Revert by removing the named script/contract files and their package.json entries; no runtime code, migration or provider state is touched by the evidence layer itself.',
  unverified: [
    '.env.local is absent — no credential was exercised; no named-environment readiness is claimed.',
    'No provider console (Supabase, Vercel, Anthropic, Resend, Google, Shopify) was inspected or mutated.',
    'Migrations 038/040/041/042 remain drafted-or-authored and NOT applied to any live environment.',
  ],
}
writeFileSync(OUT, JSON.stringify(evidence, null, 2) + '\n')
console.log(`✓ wrote ${OUT} — HEAD ${head.slice(0, 8)}, exit ${exitCode}, ${gates.length} gate(s), ${skips.length} skip line(s), result=${evidence.result}`)
process.exit(0)
