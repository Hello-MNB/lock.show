// Registry release gate (docs/registry/*.csv) — GPT's F1 audit turned into a
// repeatable check (RADAR-SOURCE-ARCHITECTURE + docs/registry/README.md contract).
// Run: npm run validate:registry
import { readFileSync } from 'node:fs'

const FILE = 'docs/registry/F1.csv'
const HEADER = 'field_id,field,segment,planet,source_brand,source_channel,source_type,logo_asset,connection_method,evidence_ceiling,visibility,freshness_rule,consent_requirement,limitation_text,applicability'
const ENUMS = {
  planet: ['identity', 'music', 'live', 'audience', 'prokit', 'proof'],
  source_type: ['platform', 'document', 'entity', 'declared'],
  connection_method: ['oauth', 'upload', 'url', 'declaration', 'counterparty', 'derived'],
  evidence_ceiling: ['verified', 'supporting', 'self-reported', 'not-assessable'],
  visibility: ['working', 'artist', 'passport-eligible', 'buyer-context', 'internal'],
  applicability: ['required', 'conditional', 'supporting', 'na'],
}
// FIREWALL: words that may never appear as a field/segment SURFACE (limitation
// text is allowed to prohibit them — that's defensive language, not a violation).
const FORBIDDEN_SURFACE = /\b(score|rank|percentile|leaderboard|completion %|profile completeness)\b/i

// Minimal RFC-4180 parser (quotes, embedded commas/newlines).
function parseCsv(text) {
  const rows = []
  let row = [], cell = '', inQ = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++ } else inQ = false }
      else cell += c
    } else if (c === '"') inQ = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell); cell = ''
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
    } else cell += c
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  return rows
}

const text = readFileSync(FILE, 'utf8')
const rows = parseCsv(text)
const header = rows.shift()
const errors = []
const cols = HEADER.split(',')

if (header.join(',') !== HEADER) errors.push(`header mismatch:\n  got  ${header.join(',')}\n  want ${HEADER}`)

const idx = Object.fromEntries(cols.map((c, i) => [c, i]))
const seen = new Set()
const fieldNames = new Map() // field_id → field (must be consistent across rows)

rows.forEach((r, n) => {
  const line = n + 2
  if (r.length !== cols.length) { errors.push(`L${line}: ${r.length} cells (want ${cols.length})`); return }
  const id = r[idx.field_id]
  if (!/^[a-z0-9_]+$/.test(id)) errors.push(`L${line}: field_id '${id}' not snake_case`)
  for (const [col, allowed] of Object.entries(ENUMS)) {
    if (!allowed.includes(r[idx[col]])) errors.push(`L${line}: ${col}='${r[idx[col]]}' not in enum`)
  }
  const dupKey = `${id}|${r[idx.source_brand]}|${r[idx.source_channel]}`
  if (seen.has(dupKey)) errors.push(`L${line}: duplicate field×source '${dupKey}'`)
  seen.add(dupKey)
  if (fieldNames.has(id) && fieldNames.get(id) !== r[idx.field])
    errors.push(`L${line}: field_id '${id}' has inconsistent field name`)
  fieldNames.set(id, r[idx.field])
  // firewall: check the SURFACE columns only (field name + segment), never limitation_text
  if (FORBIDDEN_SURFACE.test(r[idx.field]) || FORBIDDEN_SURFACE.test(r[idx.segment]))
    errors.push(`L${line}: forbidden scoring language on a field surface`)
  if (!/^(codex|generic):/.test(r[idx.logo_asset])) errors.push(`L${line}: logo_asset '${r[idx.logo_asset]}' missing codex:/generic: prefix`)
  // ticketing hierarchy: the four IL ticketing brands must use the exact governed channel
  if (['Eventer', 'Tickchak', 'Ticketmaster Israel', 'Go-out'].includes(r[idx.source_brand]) &&
      r[idx.evidence_ceiling] === 'verified' && r[idx.source_channel] !== 'artist-owned account export')
    errors.push(`L${line}: ${r[idx.source_brand]} verified row must use 'artist-owned account export'`)
})

if (errors.length) {
  console.error(`✗ REGISTRY INVALID — ${errors.length} error(s):`)
  errors.slice(0, 40).forEach((e) => console.error('  ' + e))
  if (errors.length > 40) console.error(`  …and ${errors.length - 40} more`)
  process.exit(1)
}
console.log(`✓ REGISTRY VALID — ${rows.length} rows · ${fieldNames.size} unique fields · header + enums + ids + duplicates + firewall-surface + ticketing-hierarchy all pass`)
