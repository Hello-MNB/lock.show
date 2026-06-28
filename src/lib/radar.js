// RADAR — deterministic, evidence-based rules engine (§20.2). $0 AI.
// Input: per-roster-artist records { artist, claims[], draw[], demand[] }.
// Output: signal objects, each = bounded status + evidence basis + method-label +
// date + ONE action. FIREWALL: never a score / percentile / rank / prediction;
// the only numbers are dates/ages (days) and bands — never a head-count or grade.
//
// status   → the bounded UI status (StatusChip): strong | developing | missing | notAssessable
// vstatus  → a verification_status for SourceLabel to derive the method-label from
// methodLabel → an explicit override label ('producer-confirmed' | 'stale') or null
const DAY = 86400000
const daysSince = (iso, now) => (iso ? Math.floor((now - new Date(iso).getTime()) / DAY) : null)
const isoDay = (now) => new Date(now).toISOString().slice(0, 10)

export function computeRadarSignals(records, now = Date.now()) {
  const signals = []
  for (const rec of records || []) {
    const { artist, claims = [], draw = [], demand = [] } = rec
    if (!artist) continue
    const name = artist.stage_name || artist.name
    const openDemand = demand.filter((d) => d.status === 'new')
    const strong = claims.filter((c) => ['verified', 'supporting'].includes(c.verification_status))
    const passportOkStrong = strong.filter((c) => c.visibility === 'passport-ok')
    const stale = claims.filter((c) => c.method_label !== 'producer-confirmed' && c.expires_at && new Date(c.expires_at).getTime() < now)
    const producerConfirmed = claims.find((c) => c.method_label === 'producer-confirmed')
    const staleDraw = draw.find((d) => d.computed_at && daysSince(d.computed_at, now) > 90)
    const hasClaim = claims.length > 0
    const d0 = openDemand[0]
    const demandOf = (d) => (d ? { event_type: d.event_type, location: d.location, id: d.id } : null)
    const base = (ruleId, extra) => ({ ruleId, artistId: artist.id, artistName: name, signalDate: isoDay(now), demand: null, ageDays: null, methodLabel: null, vstatus: null, evidenceBasis: null, ...extra })

    // R1 (hero): stale evidence ∩ matching inbound demand → refresh evidence.
    if (stale.length && d0) {
      signals.push(base('R1', { status: 'developing', actionType: 'refresh-evidence', evidenceBasis: stale[0].claim_type, methodLabel: 'stale', ageDays: daysSince(stale[0].expires_at, now), demand: demandOf(d0) }))
    }
    // R2: ready published Passport (passport-ok strong claim) ∩ demand → respond.
    if (artist.published && passportOkStrong.length && d0) {
      signals.push(base('R2', { status: 'strong', actionType: 'respond', evidenceBasis: passportOkStrong[0].claim_type, vstatus: passportOkStrong[0].verification_status, methodLabel: passportOkStrong[0].method_label || null, demand: demandOf(d0) }))
    } else if (d0) {
      // R3: new inbound demand awaiting a response.
      signals.push(base('R3', { status: 'developing', actionType: 'respond', evidenceBasis: 'demand', demand: demandOf(d0) }))
    }
    // R4: evidence ready but Passport not published → publish.
    if (!artist.published && strong.length) {
      signals.push(base('R4', { status: 'developing', actionType: 'publish', evidenceBasis: strong[0].claim_type, vstatus: strong[0].verification_status, methodLabel: strong[0].method_label || null }))
    }
    // R5: producer-confirmed strength present → promote.
    if (producerConfirmed) {
      signals.push(base('R5', { status: 'strong', actionType: 'promote', evidenceBasis: producerConfirmed.claim_type, methodLabel: 'producer-confirmed', vstatus: 'verified' }))
    }
    // R6: demand present but no strong proof (all self-reported / not-assessable) → review.
    if (d0 && hasClaim && strong.length === 0) {
      signals.push(base('R6', { status: 'notAssessable', actionType: 'review', evidenceBasis: 'demand', vstatus: 'not-assessable', demand: demandOf(d0) }))
    }
    // R7: draw band aging > 90 days → refresh draw evidence.
    if (staleDraw) {
      signals.push(base('R7', { status: 'developing', actionType: 'refresh-evidence', evidenceBasis: 'draw-band', vstatus: 'self-reported', ageDays: daysSince(staleDraw.computed_at, now) }))
    }
    // R8: roster artist with no evidence at all → start evidence.
    if (!hasClaim) {
      signals.push(base('R8', { status: 'missing', actionType: 'request-evidence' }))
    }
  }
  // Triage order: fixed rule order (R1 hero first), then artist. NOT a ranking/score.
  return signals.sort((a, b) => a.ruleId.localeCompare(b.ruleId) || (a.artistName || '').localeCompare(b.artistName || ''))
}

export const RADAR_ACTIONS = ['refresh-evidence', 'request-evidence', 'respond', 'publish', 'promote', 'review']
