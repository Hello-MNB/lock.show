// ── Radar Universe — derivation brain (Radar-Interface-Design-Spec v2.1) ─────
// The Radar is a DERIVED view: it reads artist + act + profile_items + claims
// and computes planet/node states at render time. Nothing here stores, scores,
// ranks or predicts — nodes carry bounded STATES only (✓ ✦ ? +), never numbers
// that grade the artist. N/A ≠ weakness; missing = invitation.

// The 6 planets ↔ 18 segments (spec §2). Icons from the CODEX sprite —
// the artist's world speaks in pictures, not codes.
export const PLANETS = [
  { key: 'identity', code: 'ID', icon: 'gp-artist', angle: -90 },
  { key: 'music', code: 'MU', icon: 'gp-live', angle: -30 },      // equalizer bars = the music itself
  { key: 'live', code: 'LV', icon: 'gp-producer', angle: 30 },    // stage board = the live show
  { key: 'audience', code: 'AU', icon: 'gp-audience', angle: 90 },
  { key: 'prokit', code: 'PK', icon: 'gp-booking', angle: 150 },
  { key: 'proof', code: 'PR', icon: 'gp-approved', angle: 210 },
]

// Node states (spec legend): confirmed ✓ · found ✦ · review ? · missing +
export const NODE = { CONFIRMED: 'confirmed', FOUND: 'found', REVIEW: 'review', MISSING: 'missing' }

// What a source proves / does NOT prove (canon Discovery §7c honesty lines) —
// keyed by source_type; shown verbatim on the Impact Card at the confirm moment.
export const PROVES = {
  'ticket-export': {
    proves: 'Tickets were issued/sold per the export — real, sourced draw.',
    notProves: 'Does not establish the crowd came specifically for you.',
  },
  settlement: {
    proves: 'A settled event with real box-office figures.',
    notProves: 'Does not establish the crowd came specifically for you.',
  },
  'producer-vouch': {
    proves: 'A counterparty acknowledged this specific claim.',
    notProves: 'Not a general endorsement — it covers this claim only.',
  },
  'public-profile': {
    proves: 'A public footprint that can be checked against its source.',
    notProves: 'Does not establish local ticket demand.',
  },
  screenshot: {
    proves: 'A captured record supporting the claim.',
    notProves: 'Authenticity is limited without a source link.',
  },
  'self-band': {
    proves: 'Your own declaration, shown as a band.',
    notProves: 'Nothing beyond your declaration — strengthen with a source.',
  },
  'self-reported': {
    proves: 'Your own declaration.',
    notProves: 'Nothing beyond your declaration — strengthen with a source.',
  },
}

const linkPlanet = (url = '') => {
  const u = url.toLowerCase()
  if (/spotify|apple|soundcloud|bandcamp|deezer/.test(u)) return 'music'
  if (/youtube|youtu\.be|vimeo/.test(u)) return 'live'
  if (/instagram|tiktok|facebook|twitter|x\.com|t\.me|whatsapp/.test(u)) return 'audience'
  return 'identity'
}

const claimPlanet = (c) => {
  const t = `${c.claim_type || ''} ${c.source_type || ''}`
  if (/community/.test(t)) return 'audience'
  if (/frequency|lineup/.test(t)) return 'live'
  return 'proof' // draw / tickets / vouch / settlement → Career Proof
}

const host = (url = '') => {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url.slice(0, 24) }
}

// Community count → its display BAND (the integer stays working-only; the band
// is the only public form — firewall).
export const bandFromCount = (n) =>
  n < 250 ? '<250' : n < 500 ? '250–500' : n < 1000 ? '500–1,000' :
  n < 2500 ? '1,000–2,500' : n < 5000 ? '2,500–5,000' : '5,000+'

// ── Worlds (content-world tags) — a SECOND filter axis, spec §5 family ────────
// An artist can live in several worlds (techno · trance · weddings · festivals…).
// Worlds are TAGS that filter which nodes light up — pure subset, zero judgment,
// never a position ("where do I stand" = evidence coverage per world, not rank).
// The Hebrew literals below are venue/context CLASSIFIER patterns (matching an
// artist's own text), NOT user-facing copy — they intentionally live in code. i18n-allow
const CONTEXT_WORLDS = [
  { key: 'club', match: /club|קלאב|מועדון|barby|kuli/i },       // i18n-allow
  { key: 'festival', match: /festival|פסטיבל|midburn|stage/i },  // i18n-allow
  { key: 'weddings', match: /wedding|חתונ|private|corporate|אירוע/i }, // i18n-allow
]

export function deriveWorlds({ artist = {}, items = [] }) {
  const worlds = []
  for (const g of String(artist.genre || '').split(/[\/,·]+/).map((s) => s.trim()).filter(Boolean)) worlds.push(g)
  for (const cw of CONTEXT_WORLDS) {
    if (items.some((i) => cw.match.test(`${i.title || ''}`))) worlds.push(cw.key)
  }
  return [...new Set(worlds)]
}

function nodeWorlds({ artist, text = '' }) {
  const w = []
  for (const cw of CONTEXT_WORLDS) if (cw.match.test(text)) w.push(cw.key)
  // genre worlds apply to the artist's musical output by default
  if (w.length === 0) for (const g of String(artist.genre || '').split(/[\/,·]+/).map((s) => s.trim()).filter(Boolean)) w.push(g)
  return w
}

// Build the whole universe. Returns { planets: {key → {nodes, state, foundCount}}, foundTotal }
// `act` carries the Act-level fields (artist_goal — migration 020); optional so
// callers without an Act loaded keep working (the goal node simply won't show).
export function buildUniverse({ artist = {}, act = null, items = [], claims = [], T }) {
  const S = T.radar.universe
  const nodes = { identity: [], music: [], live: [], audience: [], prokit: [], proof: [] }
  const push = (planet, node) => nodes[planet].push({
    id: `${planet}-${nodes[planet].length}-${node.label}`,
    worlds: nodeWorlds({ artist, text: `${node.label} ${node.sub || ''} ${node.claim?.public_wording || ''}` }),
    ...node,
  })

  // ── claims → the north-star nodes ──
  for (const c of claims) {
    const planet = claimPlanet(c)
    const state = c.status === 'disputed' ? NODE.REVIEW : c.artist_approved ? NODE.CONFIRMED : NODE.FOUND
    push(planet, {
      state,
      label: c.value || c.claim_type,
      sub: T.methodLabel?.[c.method_label] || c.source_type,
      claim: c,
      proves: PROVES[c.source_type]?.proves || S.provesDefault,
      notProves: PROVES[c.source_type]?.notProves || S.notProvesDefault,
    })
  }

  // ── profile links → source-presence nodes (artist-provided, with their marks) ──
  const links = items.filter((i) => i.item_type === 'link' && i.public_url)
  for (const l of links) {
    push(linkPlanet(l.public_url), {
      state: NODE.CONFIRMED,
      label: host(l.public_url),
      sub: S.linkConnected,
      url: l.public_url, // PlatformMark derives the brand mark from this
      proves: PROVES['public-profile'].proves,
      notProves: PROVES['public-profile'].notProves,
    })
  }

  // Snapshot BEFORE the deferred-field nodes below: the curated suggestions at
  // the end key off "does this planet have any REAL signal yet" (claims/links),
  // not off the always-present field nodes.
  const musicHadSignal = nodes.music.length > 0

  // ── identity / pro-kit fields → presence or IN-PLACE fill (no screen swaps).
  //    Onboarding no longer collects these (owner order, 8 Jul — entry is
  //    stage name + city + one link only): every field the old wizard asked
  //    for lives HERE as a quiet fillable node. A gap is an invitation. ──
  const idBits = [
    { ok: !!artist.photo_url, label: S.src.photo, fill: { kind: 'photo', field: 'photo_url' } },
    { ok: !!artist.one_line, label: S.src.positioning, fill: { kind: 'text', field: 'one_line', max: 120 } },
    { ok: !!artist.genre, label: S.src.genre, fill: { kind: 'text', field: 'genre' } },
  ]
  // Goal (Act-level, canon A4): guidance data — it prioritizes evidence paths,
  // never changes what is true. Only offered when the caller loaded the Act.
  if (act) idBits.push({ ok: !!act.artist_goal, label: S.src.goal, fill: { kind: 'goal' } })
  for (const b of idBits) push('identity', b.ok
    ? { state: NODE.CONFIRMED, label: b.label, sub: S.inPlace }
    : { state: NODE.MISSING, label: b.label, sub: S.addIt, fill: b.fill })

  const kitBits = [
    { ok: !!artist.set_length, label: S.src.setLength, fill: { kind: 'text', field: 'set_length', placeholder: '90 min' } },
    { ok: !!artist.regions, label: S.src.regions, fill: { kind: 'text', field: 'regions' } },
    { ok: !!artist.rider_url, label: S.src.rider, fill: { kind: 'url', field: 'rider_url' } },
    { ok: artist.invoice_ready === true, label: S.src.invoice, fill: { kind: 'boolean', field: 'invoice_ready' } },
    { ok: !!artist.whatsapp_number, label: S.src.whatsapp, fill: { kind: 'text', field: 'whatsapp_number', placeholder: '05…' } },
  ]
  for (const b of kitBits) push('prokit', b.ok
    ? { state: NODE.CONFIRMED, label: b.label, sub: S.inPlace }
    : { state: NODE.MISSING, label: b.label, sub: S.addIt, fill: b.fill })

  // ── draw bands (firewall: bands + booleans ONLY — deferred from the old
  //    onboarding StepDraw). Career Proof carries them; a ticket export in the
  //    evidence flow stays the stronger path for the same facts. ──
  const drawBits = [
    { ok: !!artist.lineup_frequency_band, label: S.src.freqBand, fill: { kind: 'band', field: 'lineup_frequency_band', set: 'frequency' } },
    { ok: artist.sells_tickets != null, label: S.src.sellsTickets, fill: { kind: 'yesno', field: 'sells_tickets' } },
    { ok: !!artist.price_band, label: S.src.priceBand, fill: { kind: 'band', field: 'price_band', set: 'price' } },
  ]
  for (const b of drawBits) push('proof', b.ok
    ? { state: NODE.CONFIRMED, label: b.label, sub: S.inPlace }
    : { state: NODE.MISSING, label: b.label, sub: S.addIt, fill: b.fill })

  // Community size — always offered (deferred from onboarding): the integer
  // stays working-only; only the derived band goes anywhere (firewall).
  push('audience', artist.community_size_band
    ? { state: NODE.CONFIRMED, label: S.src.community, sub: S.inPlace }
    : { state: NODE.MISSING, label: S.src.community, sub: S.addIt, fill: { kind: 'number' } })

  // ── experience items → Live/Proof presence ──
  const exp = items.filter((i) => i.item_type !== 'link')
  if (exp.length > 0) {
    push('live', { state: NODE.CONFIRMED, label: S.src.trackRecord, sub: T.radar.onRecord(exp.length) })
  } else {
    push('live', { state: NODE.MISSING, label: S.src.trackRecord, sub: S.addIt, fill: { kind: 'event' } })
  }

  // ── curated missing suggestions (spec source inventory) when a planet has
  //    no real signal yet (claims/links — field nodes don't count) ──
  if (!musicHadSignal) push('music', { state: NODE.MISSING, label: S.src.streaming, sub: S.addIt, fill: { kind: 'link' } })
  if (!nodes.proof.some((n) => n.claim)) push('proof', { state: NODE.MISSING, label: S.src.ticketExport, sub: S.addIt, evidence: true }) // needs the evidence+consent flow

  // ── planet rollup: bounded state, never a number ──
  const planets = {}
  let foundTotal = 0
  for (const p of PLANETS) {
    const list = nodes[p.key]
    const found = list.filter((n) => n.state === NODE.FOUND || n.state === NODE.REVIEW).length
    foundTotal += found
    const confirmed = list.some((n) => n.state === NODE.CONFIRMED)
    const state = found > 0 ? 'needs' : confirmed ? 'established' : 'developing'
    planets[p.key] = { nodes: list, state, foundCount: found }
  }
  return { planets, foundTotal }
}
