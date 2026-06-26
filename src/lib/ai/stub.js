// StubClaimProcessor — deterministic mock, no API call.
// Used when ANTHROPIC_API_KEY is absent. Results are predictable and testable.
export class StubClaimProcessor {
  async label(ev) {
    const map = {
      'ticket-export':  { status: 'verified',       claim_type: 'sells-tickets',          reason: 'tickets issued/sold per export' },
      settlement:       { status: 'verified',       claim_type: 'payment-attendance',     reason: 'settlement document' },
      'producer-vouch': { status: 'supporting',     claim_type: 'producer-confirmation',  reason: 'producer reference' },
      'public-profile': { status: 'supporting',     claim_type: 'audience-footprint',     reason: 'public profile context' },
      screenshot:       { status: 'self-reported',  claim_type: 'claim-image',            reason: 'image only — not independently verified' },
      'self-band':      { status: 'self-reported',  claim_type: 'draw-band',              reason: 'artist-provided band' },
      'self-reported':  { status: 'self-reported',  claim_type: 'self-reported',          reason: 'artist statement' },
    }
    // band + public reference URL upgrades to supporting
    if (ev.evidence_type === 'band' && ev.public_url) {
      return { status: 'supporting', claim_type: 'draw-band', value: ev.value ?? null, reason: 'band with public reference' }
    }
    const r = map[ev.source_type] ?? map['self-reported']
    return { ...r, value: ev.value ?? null }
  }
}
