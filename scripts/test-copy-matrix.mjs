#!/usr/bin/env node
// ============================================================
// COPY MATRIX GATE — website-next/content/copy-matrix.ts
//
// The matrix exists so marketing copy can be edited in every language at once.
// That only holds if the file cannot silently drift: a missing Hebrew string,
// a duplicate id, or a technical phrase leaking into public copy would each
// break the promise quietly.
// ============================================================
import { readFileSync } from 'node:fs'

const SRC = 'website-next/content/copy-matrix.ts'
const src = readFileSync(SRC, 'utf8')
let failed = false
const fail = (m) => { failed = true; console.error(`  ✗ ${m}`) }
const ok = (m) => console.log(`  ✓ ${m}`)

const LOCALES = (src.match(/export const LOCALES = \[([^\]]+)\]/)?.[1] || '')
  .split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean)
if (LOCALES.length < 2) fail('LOCALES could not be parsed, or only one locale is declared')
else ok(`locales declared: ${LOCALES.join(', ')}`)

// Rows: id + the per-locale block.
const rows = [...src.matchAll(/\{\s*id:\s*'([^']+)'[\s\S]*?t:\s*\{([^}]*)\}\s*\}/g)]
  .map(([, id, body]) => ({ id, body }))
if (rows.length < 20) fail(`only ${rows.length} rows parsed — the matrix looks truncated (vacuous-pass guard)`)
else ok(`${rows.length} copy rows parsed`)

// 1 · EVERY row carries EVERY locale, non-empty.
let missing = 0
for (const { id, body } of rows) {
  for (const loc of LOCALES) {
    const m = body.match(new RegExp(`${loc}\\s*:\\s*(['"\`])((?:\\\\.|(?!\\1).)*)\\1`, 's'))
    if (!m || !m[2].trim()) { missing++; if (missing <= 8) fail(`${id}: missing or empty "${loc}"`) }
  }
}
if (missing === 0) ok(`every row carries all ${LOCALES.length} locales, non-empty`)
else fail(`${missing} missing translation(s) — a blank string ships as a blank headline`)

// 2 · Ids unique.
const ids = rows.map((r) => r.id)
const dupes = ids.filter((v, i) => ids.indexOf(v) !== i)
if (dupes.length === 0) ok('all ids unique')
else fail(`duplicate id(s): ${[...new Set(dupes)].join(', ')}`)

// 3 · Id matches its own page/section/component fields — the id IS the address,
// so a mismatch makes matrixByPage() lie about where a string lives.
let addr = 0
for (const [, id, page] of src.matchAll(/id:\s*'([^']+)'\s*,\s*page:\s*'([^']+)'/g)) {
  if (!id.startsWith(page + '.')) { addr++; fail(`${id}: id does not start with its page "${page}"`) }
}
if (addr === 0) ok('every id is addressed by its own page')

// 4 · Public marketing copy must not carry ENGINEERING vocabulary. Utility rows
// are exempt by declaration, which is why `voice` exists.
const TECHNICAL = /\b(localStorage|API|RPC|JSON|env var|migration|Supabase|RLS|null|undefined|boolean|SDK|endpoint)\b/
let tech = 0
for (const m of src.matchAll(/\{\s*id:\s*'([^']+)'([\s\S]*?)\n\s*\},?\n/g)) {
  const [, id, block] = m
  if (/voice:\s*'utility'/.test(block)) continue
  for (const s of block.matchAll(/(en|he)\s*:\s*'((?:\\.|[^'])*)'/g)) {
    if (TECHNICAL.test(s[2])) { tech++; fail(`${id}: technical vocabulary in marketing copy — "${s[2].slice(0, 60)}"`) }
  }
}
if (tech === 0) ok('no engineering vocabulary in marketing-voice rows')

// 5 · No raw phone number in any copy row (the harvesting rule).
if (/\+?972[\s-]?5\d/.test(src)) fail('a phone number appears in the copy matrix — numbers belong in a link target, never in copy')
else ok('no phone number in copy')

// 6 · Option vocabularies are localized too.
for (const name of ['CONTACT_SUBJECTS', 'CONTACT_ROLES']) {
  const block = src.match(new RegExp(`export const ${name}[^=]*=\\s*\\[([\\s\\S]*?)\\n\\]`))?.[1] || ''
  const opts = [...block.matchAll(/value:\s*'([^']+)'/g)].length
  let bad = 0
  for (const loc of LOCALES) {
    const got = [...block.matchAll(new RegExp(`${loc}:\\s*'[^']+'`, 'g'))].length
    if (got !== opts) { bad++; fail(`${name}: ${opts} options but ${got} "${loc}" labels`) }
  }
  if (!bad && opts > 0) ok(`${name}: ${opts} options, fully localized`)
}

console.log('')
if (failed) { console.error('✗ COPY MATRIX: violations above.'); process.exit(1) }
console.log('✓ COPY MATRIX: every row carries every locale, ids are unique and self-addressing, marketing rows carry no engineering vocabulary, no phone number in copy.')
process.exit(0)
