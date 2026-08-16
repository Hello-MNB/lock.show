#!/usr/bin/env node
// ============================================================
// ENV SCHEMA GENERATOR · scripts/generate-env-schema.mjs
//
// Owner ruling (16 Aug 2026): "generate contracts/env.schema.json FROM the
// existing docs/INTEGRATION-CONTRACT-REGISTER.md and make the existing gate fail
// on drift. The generated schema is a machine projection, not a second authority.
// Zero values/secrets/token-bearing URLs."
//
// So this file INVENTS NOTHING. Every field is read out of the register's
// MACHINE:ENV table. If a fact is not recorded there, it does not appear here —
// requiredness included, which is why the register carries a Required column.
//
//   node scripts/generate-env-schema.mjs           → write contracts/env.schema.json
//   node scripts/generate-env-schema.mjs --check    → exit 1 if the file has drifted
// ============================================================
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

export const REGISTER = 'docs/INTEGRATION-CONTRACT-REGISTER.md'
export const SCHEMA = 'contracts/env.schema.json'

const PURPOSE = {
  PUBLIC: 'Bundle-visible by design; published to the browser at build time. Never a secret.',
  SECRET: 'Server-only credential. Never bundled, never logged, never committed.',
  CONFIG: 'Behaviour knob with a code default. Carries no credential.',
  AMBIENT: 'Supplied by the runtime or framework; not set by hand.',
  TOOLING: 'Local test-harness input. Not part of any deployed surface.',
}

export function parseRegister(text) {
  const m = text.match(/<!-- MACHINE:ENV:START -->([\s\S]*?)<!-- MACHINE:ENV:END -->/)
  if (!m) throw new Error(`${REGISTER}: MACHINE:ENV block not found`)
  return m[1].split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|') && !/^\|\s*-+/.test(l) && !/\|\s*Name\s*\|/i.test(l))
    .map((l) => l.replace(/^\||\|$/g, '').split('|').map((c) => c.trim().replace(/^`|`$/g, '')))
    .map(([name, cls, surface, consumer, activation, required]) =>
      ({ name, cls, surface, consumer, activation, required }))
}

export function buildSchema(rows) {
  const properties = {}
  for (const r of [...rows].sort((a, b) => a.name.localeCompare(b.name))) {
    properties[r.name] = {
      type: 'string',
      description: PURPOSE[r.cls] ?? 'Unclassified.',
      'x-class': r.cls,
      'x-surface': r.surface,
      'x-consumer': r.consumer,
      'x-activation': r.activation,
    }
  }
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://lock.show/contracts/env.schema.json',
    title: 'LOCK.SHOW environment interface',
    description:
      'Machine projection of the MACHINE:ENV table in docs/INTEGRATION-CONTRACT-REGISTER.md. ' +
      'NOT a second authority: edit the register, then regenerate. Names, types, class, purpose ' +
      'and requiredness only — this file carries no value, no secret and no token-bearing URL.',
    'x-generated-from': REGISTER,
    'x-generator': 'scripts/generate-env-schema.mjs',
    'x-authority': 'projection',
    type: 'object',
    properties,
    required: rows.filter((r) => r.required === 'required').map((r) => r.name).sort(),
    additionalProperties: true,
  }
}

const serialise = (o) => JSON.stringify(o, null, 2) + '\n'

if (import.meta.url === `file://${process.argv[1]}`) {
  const rows = parseRegister(readFileSync(REGISTER, 'utf8'))
  const bad = rows.filter((r) => !['required', 'optional'].includes(r.required))
  if (bad.length) {
    console.error(`✗ register rows missing a Required value: ${bad.map((b) => b.name).join(', ')}`)
    process.exit(1)
  }
  const next = serialise(buildSchema(rows))
  if (process.argv.includes('--check')) {
    const cur = existsSync(SCHEMA) ? readFileSync(SCHEMA, 'utf8') : ''
    if (cur !== next) {
      console.error(`✗ ${SCHEMA} has drifted from ${REGISTER}. Run: node scripts/generate-env-schema.mjs`)
      process.exit(1)
    }
    console.log(`✓ ${SCHEMA} matches ${REGISTER} (${rows.length} entries)`)
    process.exit(0)
  }
  writeFileSync(SCHEMA, next)
  console.log(`✓ wrote ${SCHEMA} — ${rows.length} entries, ${buildSchema(rows).required.length} required`)
}
