#!/usr/bin/env node
// ============================================================
// RELEASE-ARTIFACT ASSERTION  ·  scripts/test-release-artifacts.mjs
//
// Owner rule (16 Aug 2026): "Never use localhost in release artifacts."
// A release artifact is anything a user or a crawler can receive: the built
// marketing export, the committed app embed, public text files, and the
// published metadata. A localhost URL in any of them is a broken promise at
// best and an internal-host disclosure at worst.
//
// This gate is deliberately narrow: it asserts on SHIPPED OUTPUT, never on
// source or dev config, where localhost is correct and expected.
// ============================================================
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOT = process.cwd()
let violations = 0
const ok = (m) => console.log(`  · ${m}`)
const bad = (m) => { console.log(`  ✗ ${m}`); violations++ }

// Shipped surfaces only. Source and dev config are intentionally absent.
const TARGETS = [
  { dir: 'website-next/out', exts: ['.html', '.txt', '.xml', '.json'], label: 'marketing export' },
  { dir: 'website-next/public/app', exts: ['.html'], label: 'committed app embed' },
  { dir: 'website-next/public', exts: ['.txt', '.xml'], label: 'public text/metadata', shallow: true },
]
const LOCALHOST = /\b(?:localhost|127\.0\.0\.1|0\.0\.0\.0|::1)\b/i

function walk(dir, exts, shallow) {
  const out = []
  let entries = []
  try { entries = readdirSync(dir) } catch { return out }
  for (const e of entries) {
    const p = join(dir, e)
    let st
    try { st = statSync(p) } catch { continue }
    if (st.isDirectory()) { if (!shallow) out.push(...walk(p, exts, false)); continue }
    if (exts.includes(extname(e))) out.push(p)
  }
  return out
}

console.log('[1] no localhost/loopback host in any shipped artifact')
let scanned = 0, missing = 0
for (const t of TARGETS) {
  const abs = join(ROOT, t.dir)
  if (!existsSync(abs)) { missing++; console.log(`  ~ ${t.label} (${t.dir}) not built in this run — SKIPPED, not passed`); continue }
  const files = walk(abs, t.exts, t.shallow)
  for (const f of files) {
    scanned++
    const body = readFileSync(f, 'utf8')
    if (LOCALHOST.test(body)) {
      const line = body.split('\n').findIndex((l) => LOCALHOST.test(l)) + 1
      bad(`${f.replace(ROOT + '/', '')}:${line} — loopback host in a ${t.label}`)
    }
  }
  ok(`${t.label}: ${files.length} file(s) clean`)
}

console.log('')
if (violations) {
  console.log(`✗ RELEASE ARTIFACTS: ${violations} violation(s) — a shipped file names a loopback host.`)
  process.exit(1)
}
if (missing === TARGETS.length) {
  console.log('✗ RELEASE ARTIFACTS: nothing was scanned — every target was absent. Not a pass.')
  process.exit(1)
}
console.log(`✓ RELEASE ARTIFACTS: ${scanned} shipped file(s) scanned, no loopback host${missing ? ` (${missing} target(s) SKIPPED — see above)` : ''}.`)
process.exit(0)
