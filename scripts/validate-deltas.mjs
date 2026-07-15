// Release gate for docs/registry/F2-F6-DELTAS.csv — GPT's family delta package
// (337 records, sha256 76f6668b…, delivered 13 Jul via owner relay).
// Contract (registry README §8): deltas NEVER mutate F1 — they compose over it.
// Checks: header order · closed enums · record-type/operation closure ·
// referential integrity vs F1 field_ids (overrides target existing fields,
// additions must NOT collide) · snake_case ids · firewall surface with the
// musical-score allowlist (sheet-music notation ≠ grading score) · ticketing
// channel law on any verified ticketing row.
import { readFileSync } from 'node:fs'

const F1 = 'docs/registry/F1.csv'
const FILE = 'docs/registry/F2-F6-DELTAS.csv'

const HEADER = ['record_type','family_id','family_name','segment_id','taxonomy_segment','repo_segment','planet','target_field_id','operation','applicability','source_brand','source_channel','source_type','connection_method','evidence_ceiling','visibility','freshness_rule','consent_requirement','activation_rule','rationale','authority_reference','status','implementation_note']

const ENUMS = {
  record_type: ['segment_baseline','field_override','field_addition','activation_rule','governance'],
  family_id: ['F2','F3','F4','F5','F6',''],
  operation: ['set_segment_default','set_applicability','add_field','apply_activation_override','document_mapping','normalize_channel','blocked_by_open_flag','document_rule','implementation_order'],
  applicability: ['required','conditional','supporting','na',''],
  source_type: ['platform','document','entity','declared',''],
  connection_method: ['oauth','upload','url','declaration','counterparty','derived',''],
  evidence_ceiling: ['verified','supporting','self-reported','not-assessable',''],
  visibility: ['working','artist','passport-eligible','buyer-context','internal',''],
  status: ['canonical','ready_for_review','reasoned_proposal','proposed_for_registry_review','ready_for_claude','blocked'],
}

// musical-score fields: notation/sheet-music vocabulary, NOT grading — allowlisted
const MUSICAL_SCORE_ALLOW = new Set(['score_or_chart_reading_capability','score_and_parts_delivery'])
const FORBIDDEN_SURFACE = /(percentile|rank(?:ing)?|rating|grade|bookability|score)/i

function splitCsv(line) {
  const out = []; let cell = '', q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (q) { if (c === '"') { if (line[i+1] === '"') { cell += '"'; i++ } else q = false } else cell += c }
    else if (c === '"') q = true
    else if (c === ',') { out.push(cell); cell = '' }
    else cell += c
  }
  out.push(cell)
  return out
}

const errs = []
const lines = readFileSync(FILE, 'utf8').split(/\r?\n/).filter(l => l.length)
const header = splitCsv(lines[0])
if (header.join('|') !== HEADER.join('|')) errs.push(`header mismatch: got ${header.join(',')}`)
const col = Object.fromEntries(HEADER.map((h, i) => [h, i]))
const rows = lines.slice(1).map(splitCsv)

const f1ids = new Set(readFileSync(F1, 'utf8').split(/\r?\n/).filter(l => l.length).slice(1).map(l => splitCsv(l)[0]))
const addIds = new Set()

rows.forEach((r, n) => {
  const line = n + 2
  if (r.length !== HEADER.length) { errs.push(`L${line}: ${r.length} cols (want ${HEADER.length})`); return }
  for (const [field, allowed] of Object.entries(ENUMS)) {
    if (!allowed.includes(r[col[field]])) errs.push(`L${line}: ${field}='${r[col[field]]}' not in enum`)
  }
  const rt = r[col.record_type], id = r[col.target_field_id]
  if (rt === 'field_override' && !f1ids.has(id)) errs.push(`L${line}: override targets '${id}' — not in F1`)
  if (rt === 'field_addition') {
    if (f1ids.has(id)) errs.push(`L${line}: addition '${id}' collides with F1`)
    if (!/^[a-z][a-z0-9_]*$/.test(id)) errs.push(`L${line}: addition id '${id}' not snake_case`)
    addIds.add(id)
  }
  if (rt === 'activation_rule' && id && !f1ids.has(id) && !addIds.has(id)) errs.push(`L${line}: activation targets unknown field '${id}'`)
  // firewall surface: ids + segment labels only (rationale prose may discuss the law itself)
  for (const f of ['target_field_id','repo_segment','taxonomy_segment']) {
    const v = r[col[f]]
    if (v && FORBIDDEN_SURFACE.test(v) && !MUSICAL_SCORE_ALLOW.has(v)) errs.push(`L${line}: firewall surface in ${f}: '${v}'`)
  }
  // ticketing hierarchy law (governance row 'normalize_channel' is canonical)
  if (/^(Eventer|Tickchak|Ticketmaster Israel|Go-out)$/.test(r[col.source_brand]) && r[col.evidence_ceiling] === 'verified'
      && r[col.source_channel] !== 'artist-owned account export') {
    errs.push(`L${line}: verified ${r[col.source_brand]} row must use 'artist-owned account export'`)
  }
})

if (errs.length) {
  console.error(`✗ DELTAS INVALID — ${errs.length} error(s):`)
  errs.slice(0, 40).forEach(e => console.error('  ' + e))
  process.exit(1)
}
const byType = {}
rows.forEach(r => { byType[r[col.record_type]] = (byType[r[col.record_type]] || 0) + 1 })
console.log(`✓ DELTAS VALID — ${rows.length} records · ` + Object.entries(byType).map(([k, v]) => `${k}:${v}`).join(' · ') + ` · referential integrity vs F1 (${f1ids.size} ids) + firewall (musical-score allowlist) pass`)
