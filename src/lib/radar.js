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

// ── APPSEC F2 · CROSS-ORGANIZATION DEMAND ───────────────────────────────────
// A demand row belongs to ONE organization (availability_requests.organization_id,
// 008:118; NULL = the artist's own context, which is what the anonymous
// public-Passport insert path writes). These three fields are the only place a
// RADAR signal can carry another organization's inbound demand into a reader's
// hands, and no mandate scope in this codebase (view/upload/edit/share/publish)
// names a projection that authorizes them.
//
// The rule: a record must EARN demand detail by declaring `demandDetail: true`,
// which src/lib/orgs.js sets only when the reading organization owns the
// artist's demand context. Absent or false → the signal still says demand is
// PRESENT (a binary, which is what R1/R2/R3/R6 are actually about) and carries
// no event type, no location and no request id. Fail-closed by default: a
// caller that forgets to declare gets the redacted shape, never the leak.
export const DEMAND_DETAIL_FIELDS = Object.freeze(['event_type', 'location', 'id'])

/** Presence, with every cross-organization field explicitly nulled. */
export function redactDemand(d) {
  return d ? { present: true, event_type: null, location: null, id: null } : null
}

export function computeRadarSignals(records, now = Date.now()) {
  const signals = []
  for (const rec of records || []) {
    const { artist, claims = [], draw = [], demand = [], demandDetail = false } = rec
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
    // APPSEC F2 · detail only when the reader owns the demand context.
    const demandOf = (d) => {
      if (!d) return null
      if (demandDetail !== true) return redactDemand(d)
      return { present: true, event_type: d.event_type ?? null, location: d.location ?? null, id: d.id ?? null }
    }
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

// ── P0-PRIVACY B2 · THE REP-SUMMARY PROJECTION ──────────────────────────────
// AUTHORITY: RADAR is artist-private intelligence. Organization membership or
// an artist_access row NEVER grants automatic access to private RADAR gaps or
// interpretation. Representation may receive ONLY a purpose-bounded,
// artist-authorized projection; a mandate scope authorizes only the named
// projection/action.
// Owner ruling 9 Aug 2026 (docs/OWNER-PENDING.md R-11): the ARTIST-PRIVATE
// surface may show everything — percentages, coverage, gaps. The firewall stays
// absolute on every OTHER entity's surface: bands + binaries + method labels,
// never private gap or coaching content.
//
// These three constants are the CLIENT MIRROR of the SQL content law in
// migration 042 §2 (`radar_signal_rep_content_check`). If one side changes the
// other must change with it — scripts/test-projection-matrix.mjs asserts they
// still agree, in both directions.

// The only rules a representation org may ever receive: R2 = a ready, published
// Passport meeting real inbound demand (coordination); R5 = a producer-confirmed
// strength (a strength, never a gap). Everything else IS the private
// interpretation: R1/R7 staleness coaching, R3 unanswered demand, R4
// "not published yet", R6 "no strong proof", R8 "no evidence at all".
export const REP_SUMMARY_RULE_IDS = ['R2', 'R5']
export const REP_SUMMARY_ACTIONS = ['respond', 'promote']
export const REP_SUMMARY_STATUSES = ['strong']

// Fields that are private interpretation even on an allowed rule: `ageDays` is
// staleness (a gap measured in days) and never crosses to another entity.
const REP_SUMMARY_STRIPPED_FIELDS = ['ageDays']

/**
 * Narrow a full (artist-private) RADAR signal set down to what a mandate may
 * authorize a representation org to see. Pure, total, and deliberately a
 * SUBTRACTION — it can only ever drop signals and drop fields, never invent,
 * re-rank, aggregate or summarize one. No counts, no score, no next-best-action.
 *
 * NOTE ON AUTHORIZATION: this function enforces the CEILING (what content is
 * eligible to be projected at all). It does NOT by itself prove a mandate
 * authorized it — that lives in the DB (migration 042 §1 radar_projection_purpose
 * + §6 RLS) and, as of this writing, NO purpose is enabled, so the authorized
 * projection is legitimately EMPTY until the owner names one.
 */
export function projectRadarForRep(signals) {
  return (signals || [])
    .filter((s) => s
      && REP_SUMMARY_RULE_IDS.includes(s.ruleId)
      && REP_SUMMARY_ACTIONS.includes(s.actionType)
      && REP_SUMMARY_STATUSES.includes(s.status)
      && Boolean(s.methodLabel || s.vstatus))   // method label is mandatory off-artist
    .map((s) => {
      const out = { ...s }
      for (const f of REP_SUMMARY_STRIPPED_FIELDS) out[f] = null
      // APPSEC F2 · belt AND braces. Even if a caller hands this function a
      // signal that was computed WITH demand detail, the detail does not cross
      // to a representation surface: R2 says "meeting real inbound demand", and
      // which request that is belongs to whoever received it. Mirrors the SQL
      // (042 §2 radar_signal_rep_demand_check + §6.2, which writes no
      // demand_request_id on a rep_summary row at all).
      out.demand = redactDemand(out.demand)
      return out
    })
}
