// One-shot mechanical reconciliation of F1 logo_asset IDs to the Codex v1.6.15
// governing map (2-part namespace:slug — the 🚩 flag resolution, SYNC §22).
// Rules (Codex law): an ID is display metadata only; unmapped brands get the
// explicit no-logo state generic:none (render = text badge from source_brand);
// already-governed IDs are left untouched; only *:pending IDs are rewritten.
// Alias handling: registry 'Tickchak' ↔ map 'Tichak' (map spelling flagged to
// Codex) → governed slug codex:tickchak (correct brand spelling).
import { readFileSync, writeFileSync } from 'node:fs'

const MAP = {
  // Codex v1.6.15 SOURCE_BRANDS_LOGO_MAP (verbatim IDs)
  'Eventer': 'codex:eventer', 'Tickchak': 'codex:tickchak', 'Tichak': 'codex:tickchak',
  'Ticketmaster Israel': 'codex:ticketmaster-il', 'Go-out': 'codex:go-out',
  'Spotify': 'codex:spotify', 'Apple Music': 'codex:apple-music', 'SoundCloud': 'codex:soundcloud',
  'Bandcamp': 'codex:bandcamp', 'YouTube': 'codex:youtube', 'Vimeo': 'codex:vimeo',
  'Instagram': 'codex:instagram', 'TikTok': 'codex:tiktok', 'Facebook': 'codex:facebook',
  'Resident Advisor': 'codex:resident-advisor', 'Linktree': 'codex:linktree',
  'WhatsApp': 'codex:whatsapp', 'Telegram': 'codex:telegram',
  // account-variant brands share the parent platform logo (display metadata only)
  'Spotify for Artists': 'codex:spotify', 'Apple Music for Artists': 'codex:apple-music',
  'YouTube Studio': 'codex:youtube', 'YouTube Music': 'codex:youtube',
  'Facebook Events': 'codex:facebook', 'Meta Business Suite': 'codex:facebook',
  'WhatsApp Communities': 'codex:whatsapp', 'WhatsApp Channels': 'codex:whatsapp',
  'Telegram Groups': 'codex:telegram', 'Telegram Channels': 'codex:telegram',
  // generic classes from the map
  'Official website': 'generic:official-website', 'Venue website': 'generic:venue-site',
  'Festival website': 'generic:festival-site', 'LOCK': 'generic:declared-manual',
}
const ENTITY_GENERIC = 'generic:none' // unmapped → explicit no-logo (text badge)

const file = 'docs/registry/F1.csv'
const text = readFileSync(file, 'utf8')
const lines = text.split(/\r?\n/)
const header = lines[0].split(',')
const iBrand = header.indexOf('source_brand')
const iLogo = header.indexOf('logo_asset')
let rewritten = 0, toNone = 0

// naive-but-safe CSV cell walk: only touch rows whose logo cell is *:pending;
// cells are located by comma-count only when no quoted field precedes logo_asset
// — logo_asset (col 8) sits AFTER 'segment' (col 3) which is the only quoted
// field in this file, so split-on-quote-aware parse per line:
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
const quote = (c) => /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c

const out = [lines[0]]
for (let n = 1; n < lines.length; n++) {
  if (!lines[n]) { out.push(lines[n]); continue }
  const cells = splitCsv(lines[n])
  if (cells[iLogo] === 'codex:pending' || cells[iLogo] === 'generic:pending') {
    const mapped = MAP[cells[iBrand]]
    if (mapped) { cells[iLogo] = mapped; rewritten++ }
    else { cells[iLogo] = ENTITY_GENERIC; toNone++ }
    out.push(cells.map(quote).join(','))
  } else out.push(lines[n])
}
writeFileSync(file, out.join('\n'))
console.log(`reconciled: ${rewritten} mapped to governed IDs · ${toNone} unmapped → generic:none (text badge) · governed IDs untouched`)
