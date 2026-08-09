// ── T-100 · ROSTER HEALTH — the ONE rule (V9-GAP-ANALYSIS §7 Wave A) ────────
//
// THE DEFECT THIS CLOSES: the agency cockpit derived one artist's health TWICE.
//   · AgencyRadarUniverse.artistState()  → needs / established / developing / missing
//     (claim-workflow aware, drove the orbit ring colour + the ✦ waiting badge)
//   · AgencyDashboard.rosterStatus()     → strong / developing / missing
//     (bounded profile signals only, drove the StatusChip on the owned rows)
// The same artist could therefore render two DIFFERENT states side by side on
// the same screen — e.g. a full bounded profile with nothing checked yet read
// "STRONG" on its row and "developing" on its ring. Two derivations of one
// truth is a defect, not a design choice; any design renders ONE state.
//
// THE FOLD: one ordered ladder over BOTH axes the old pair each saw half of —
// claim workflow first (something is waiting on a human), then proof depth
// (checked claims OR a filled bounded profile), then any beginning, then
// nothing. Each surface keeps its own visual vocabulary by MAPPING this one
// state (ring colours here, StatusChip words there) — the words may differ,
// the state underneath never does.
//
// FIREWALL (absolute): every value here is a bounded categorical STATE. The
// counts consumed below (`pending`, `signals`) are inputs to a rule and to an
// inbox badge — never a score, percentage, rank, grade or comparison, and
// never rendered as a number about an artist's quality.

import { STATUS } from './constants.js'

// The 4 canonical roster-health states. `needs` is a WORKFLOW state (the
// artist has claims waiting for their own approval), the other three are
// EVIDENCE states.
export const ROSTER_HEALTH = {
  NEEDS: 'needs',
  ESTABLISHED: 'established',
  DEVELOPING: 'developing',
  MISSING: 'missing',
}

// The bounded profile fields that count as "this act has a shape". Bands and
// binaries only — deliberately never a number, an amount or a date.
const PROFILE_SIGNALS = (a) =>
  [a?.lineup_frequency_band, a?.sells_tickets != null, a?.price_band, a?.photo_url].filter(Boolean).length

// A profile this filled used to read STRONG on the owned rows; the fold keeps
// that reachable so unifying does not silently demote every owned artist.
const ESTABLISHED_SIGNAL_FLOOR = 3

/**
 * The ONE roster-health rule. Both agency surfaces consume this and nothing
 * else derives roster health anywhere in src/features/agency/.
 *
 * @param {object}  artist  an `artists` row (bounded profile fields only)
 * @param {Array}   claims  claims for the WHOLE roster (filtered here by
 *                          artist_id) — pass [] / omit when unreadable; an
 *                          unreadable claim table degrades to the evidence
 *                          axis, it never guesses.
 * @returns {{ state: string, pending: number }} `pending` = claims still
 *          waiting for the ARTIST's own approval (an inbox count for the ✦
 *          badge, never a grade).
 */
export function deriveRosterHealth(artist, claims = []) {
  const own = Array.isArray(claims) ? claims.filter((c) => c.artist_id === artist?.id) : []
  const pending = own.filter((c) => !c.artist_approved).length

  // 1 · Something is waiting on a human — beats every evidence state.
  if (pending > 0) return { state: ROSTER_HEALTH.NEEDS, pending }

  // 2 · Established: an approved claim that was actually checked, OR a
  //     bounded profile filled to the old owned-row floor.
  const checked = own.some((c) => c.artist_approved && ['verified', 'supporting'].includes(c.verification_status))
  const signals = PROFILE_SIGNALS(artist)
  if (checked || signals >= ESTABLISHED_SIGNAL_FLOOR) return { state: ROSTER_HEALTH.ESTABLISHED, pending: 0 }

  // 3 · Something has begun — any bounded signal, or any claim at all.
  if (signals >= 1 || own.length > 0) return { state: ROSTER_HEALTH.DEVELOPING, pending: 0 }

  // 4 · Genuinely empty. An empty Act starts here and that is honest.
  return { state: ROSTER_HEALTH.MISSING, pending: 0 }
}

// ── Per-surface vocabulary maps (the ONLY thing allowed to differ) ──────────

// Orbit ring colours — spec state tokens: amber (needs-you) · lime
// (established) · teal (developing) · quiet line (nothing yet). Categorical,
// never a gauge.
export const ROSTER_HEALTH_RING = {
  [ROSTER_HEALTH.NEEDS]: 'border-amber',
  [ROSTER_HEALTH.ESTABLISHED]: 'border-accent',
  [ROSTER_HEALTH.DEVELOPING]: 'border-teal',
  [ROSTER_HEALTH.MISSING]: 'border-line',
}

// StatusChip words (the shared StateBadge vocabulary). `needs` reads as
// DEVELOPING here because the chip has no workflow word — the ring and the ✦
// badge carry "waiting on you"; the chip carries evidence depth.
export const ROSTER_HEALTH_CHIP = {
  [ROSTER_HEALTH.NEEDS]: STATUS.DEVELOPING,
  [ROSTER_HEALTH.ESTABLISHED]: STATUS.STRONG,
  [ROSTER_HEALTH.DEVELOPING]: STATUS.DEVELOPING,
  [ROSTER_HEALTH.MISSING]: STATUS.MISSING,
}
