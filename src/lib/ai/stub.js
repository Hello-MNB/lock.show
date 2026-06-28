// StubClaimProcessor — deterministic mock, no API call.
// Used when ANTHROPIC_API_KEY is absent. Results are predictable and testable,
// and varied enough that seeded test journeys look real.
//
// FIREWALL: a label NEVER carries a score / percentile / rank / exact head-count.
// Draw is only ever a band string; status is one of the four bounded values.

// Infer the specific draw signal from a band's text (works for he + en values).
const BAND_KIND = [
  { re: /(הופע|ליינ|lineup|shows?|gigs?|פעמ|בשנה|\/\s*year)/i, claim_type: 'lineup-frequency' },
  { re: /(₪|\bnis\b|guarantee|גרנט|מחיר|price|fee)/i,          claim_type: 'price-band' },
  { re: /(קהיל|community|followers?|וואטסאפ|whatsapp|\big\b|עוקב)/i, claim_type: 'community-size' },
]

function bandClaimType(value) {
  if (!value) return 'draw-band'
  const hit = BAND_KIND.find((b) => b.re.test(value))
  return hit ? hit.claim_type : 'draw-band'
}

// Provenance drives the bounded status (stronger source → stronger status).
const SOURCE_MAP = {
  'ticket-export':  { status: 'verified',      claim_type: 'sells-tickets',         reason: 'tickets issued/sold per export' },
  settlement:       { status: 'verified',      claim_type: 'payment-attendance',    reason: 'settlement document' },
  'producer-vouch': { status: 'supporting',    claim_type: 'producer-confirmation', reason: 'producer reference' },
  'public-profile': { status: 'supporting',    claim_type: 'audience-footprint',    reason: 'public profile context' },
  screenshot:       { status: 'self-reported', claim_type: 'claim-image',           reason: 'image only — not independently verified' },
  'self-band':      { status: 'self-reported', claim_type: 'draw-band',             reason: 'artist-provided band' },
  'self-reported':  { status: 'self-reported', claim_type: 'self-reported',         reason: 'artist statement' },
}

export class StubClaimProcessor {
  async label(ev) {
    // 1) Band evidence: infer the specific signal; a public reference upgrades
    //    provenance from self-reported → supporting.
    if (ev.evidence_type === 'band') {
      const claim_type = bandClaimType(ev.value)
      return ev.public_url
        ? { status: 'supporting',    claim_type, value: ev.value ?? null, reason: 'band corroborated by a public reference' }
        : { status: 'self-reported', claim_type, value: ev.value ?? null, reason: 'artist-provided band' }
    }

    // 2) Link evidence: public link is supporting CONTEXT — never proof of draw.
    if (ev.evidence_type === 'link') {
      return { status: 'supporting', claim_type: 'public-presence', value: ev.value ?? ev.public_url ?? null, reason: 'public link — context, not proof of draw' }
    }

    // 3) File / other: provenance map (with a public_url upgrade for weak sources).
    const r = SOURCE_MAP[ev.source_type] ?? SOURCE_MAP['self-reported']
    if (r.status === 'self-reported' && ev.public_url) {
      return { status: 'supporting', claim_type: r.claim_type, value: ev.value ?? null, reason: `${r.reason} + public reference` }
    }
    return { ...r, value: ev.value ?? null }
  }
}
