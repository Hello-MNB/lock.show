#!/usr/bin/env node
// ============================================================
// HE/EN KEY PARITY — scripts/test-i18n-parity.mjs
//
// Hebrew is the declared launch language (docs/LOCALIZATION-MATRIX.md), so a key
// that exists in English and not in Hebrew is a screen that will render an English
// string — or nothing — to the launch audience.
//
// WHY THIS FILE DID NOT EXIST UNTIL NOW: scripts/i18n-purity.mjs:2 says it catches
// language-mixing "that parity can't", which reads as though a parity gate lives
// somewhere else. It does not. Nothing in the chain compared the two catalogues.
// Measured at the time of writing: 1332 EN keys, 1328 HE.
//
// WHAT THIS GATE DOES NOT DO: it does not invent Hebrew copy. Translation needs
// native review (owner rule), so the four keys already missing are recorded below
// as a DATED ALLOWLIST with their reason. The allowlist may only SHRINK — adding to
// it is a deliberate act a reviewer can see in the diff, and any NEW divergence
// fails immediately.
// ============================================================
import { readFileSync } from 'node:fs'

const EN = 'src/lib/i18n/en.js'
const HE = 'src/lib/i18n/he.js'

// Recorded 17 Aug 2026. Present in EN, absent in HE, awaiting native Hebrew review.
// Remove entries as they are translated; never add without a reason and a date.
const KNOWN_UNTRANSLATED = new Set([
  'dashboard.managePassport',
  'dashboard.readinessBlock',
  'consent.contextualNote',
  'status.found',
])

const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? flatten(v, `${prefix}${k}.`)
      : [`${prefix}${k}`])

const load = async (path) => {
  const mod = await import(new URL(`../${path}`, import.meta.url))
  return mod.default ?? mod.T ?? mod
}

let failures = 0
const ok = (m) => console.log(`  · ${m}`)
const bad = (m) => { console.log(`  ✗ ${m}`); failures++ }

const en = flatten(await load(EN))
const he = flatten(await load(HE))
const enSet = new Set(en)
const heSet = new Set(he)

console.log(`[1] catalogue sizes — EN ${enSet.size}, HE ${heSet.size}`)
if (!enSet.size || !heSet.size) bad('a catalogue is empty — the loader read nothing, so every check below would pass vacuously')
else ok('both catalogues loaded with keys')

console.log('[2] every EN key exists in HE (or is an allowlisted, dated gap)')
const missingInHe = en.filter((k) => !heSet.has(k))
const unexpected = missingInHe.filter((k) => !KNOWN_UNTRANSLATED.has(k))
for (const k of unexpected) bad(`${k} exists in ${EN} and is MISSING from ${HE} — Hebrew is the launch language`)
if (!unexpected.length) ok(`${missingInHe.length} gap(s), all allowlisted: ${[...KNOWN_UNTRANSLATED].join(', ') || 'none'}`)

console.log('[3] no HE key without an EN counterpart (orphans drift silently)')
const orphans = he.filter((k) => !enSet.has(k))
for (const k of orphans) bad(`${k} exists in ${HE} with no EN counterpart — it can never be reached through the EN key path`)
if (!orphans.length) ok('no orphan Hebrew keys')

console.log('[4] the allowlist may only shrink')
const stale = [...KNOWN_UNTRANSLATED].filter((k) => heSet.has(k) || !enSet.has(k))
for (const k of stale) {
  bad(`${k} is allowlisted but is no longer a gap (translated, or removed from EN) — delete it from KNOWN_UNTRANSLATED`)
}
if (!stale.length) ok(`${KNOWN_UNTRANSLATED.size} allowlisted gap(s), all still real`)

console.log('')
if (failures) {
  console.log(`✗ I18N PARITY: ${failures} violation(s).`)
  process.exit(1)
}
console.log(`✓ I18N PARITY: ${enSet.size} EN / ${heSet.size} HE keys — no unexpected divergence, no orphans, allowlist accurate.`)
process.exit(0)
