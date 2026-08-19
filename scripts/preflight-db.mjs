#!/usr/bin/env node
// ============================================================
// PREFLIGHT · IS THE LOCAL DATABASE THERE, AND CAN IT BE BROUGHT BACK?
//
// TWELVE steps in the declared chain execute against a real PostgreSQL; eleven of
// them refuse through pgAvailable() and fail closed without one, and
// test:sql-migrations needs it too though it has no such refusal. (I wrote
// "fifteen" and then "twelve" two paragraphs apart — QA-INDEP-10, M5. Counted:
// 11 chain steps call pgAvailable, 12 scripts call it in total, and one of those
// twelve is this file, which is neither a gate nor a chain step.) That is right — CLAUDE.md's GATE DISCIPLINE says a skip is
// not a pass, and these were deliberately made to exit 1 rather than skip.
//
// What was missing is the other half: WHY it is absent, and what to do. In this
// remote session the cluster does not survive between scheduled runs. Observed
// twice, with the same signature both times:
//
//   pg_isready            -> no response
//   pg_lsclusters         -> 16 main 5432 down
//   server log            -> ends on a routine timed checkpoint; no shutdown
//                            record, no PANIC, no OOM (14 GB free), disk 37%
//   pg_ctlcluster start   -> "Removed stale pid file"
//
// So it is reaped, not crashed. An operator — or a future session — meeting
// twelve simultaneous RED gates would reasonably diagnose a code regression.
//
// THIS SCRIPT DOES NOT RUN INSIDE THE CHAIN, AND THAT IS DELIBERATE. A verify
// step that silently starts a database would make the chain's green depend on
// mutating its own environment, and would hide a genuine outage in CI behind an
// auto-heal. Recovery is an explicit, separate act:
//
//   npm run preflight:db            report only  (exit 0 = up, 1 = not)
//   npm run preflight:db -- --start report, and start it if it is down
// ============================================================

import { execFileSync } from 'node:child_process'
import { pgAvailable, pgUnavailableReason } from './lib/pgharness.mjs'

const START = process.argv.includes('--start')
const sh = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8' }).trim()
const quiet = (cmd, args) => { try { return sh(cmd, args) } catch (e) { return String(e.stdout || e.message || '').trim() } }

console.log('\n══ DATABASE PREFLIGHT ══')
console.log(`  pg_isready    : ${quiet('pg_isready', []).replace(/\n/g, ' ')}`)
const clusters = quiet('pg_lsclusters', []).split('\n').filter((l) => /^\d/.test(l))
console.log(`  clusters      : ${clusters.length ? clusters.map((l) => l.replace(/\s+/g, ' ')).join(' | ') : '(none reported)'}`)

if (pgAvailable()) {
  console.log('✓ PREFLIGHT DB: a local PostgreSQL is up and answering — the chain\'s 12 database-dependent steps will execute.')
  process.exit(0)
}

const why = pgUnavailableReason()
console.log(`  diagnosis     : ${why.kind} — ${why.text}`)

if (!START) {
  console.error('✗ PREFLIGHT DB: no usable local PostgreSQL. Re-run with `--start` to attempt recovery.')
  console.error('  Until then every database gate will FAIL CLOSED, which is correct and is NOT a code regression.')
  process.exit(1)
}

if (why.kind !== 'down') {
  console.error(`✗ PREFLIGHT DB: cannot recover automatically — ${why.text}`)
  process.exit(1)
}

// START THE CLUSTER THE DIAGNOSIS NAMED, not a hardcoded one — M4(b).
const target = why.cluster ?? { ver: '16', cluster: 'main' }
console.log(`  starting      : pg_ctlcluster ${target.ver} ${target.cluster} start`)
console.log(`  ${quiet('pg_ctlcluster', [target.ver, target.cluster, 'start']) || '(no output)'}`)

// PROVE IT, DO NOT ANNOUNCE IT. `pg_ctlcluster` exiting 0 says the start command
// was accepted, not that a query can run — so the success line below is gated on
// an actual round trip through the same check the gates use.
if (!pgAvailable()) {
  console.error('✗ PREFLIGHT DB: start was attempted and the server still does not answer.')
  console.error('  Check /var/log/postgresql/postgresql-16-main.log — this one is not the usual reaping.')
  process.exit(1)
}
console.log('✓ PREFLIGHT DB: cluster was DOWN and is now up and answering — verified by an executed query, not by the start command\'s exit code.')
process.exit(0)
