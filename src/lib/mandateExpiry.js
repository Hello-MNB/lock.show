// ── T-103 · MANDATE EXPIRY — the choice behind `artist_access.expires_at` ────
//
// The column has existed since migration 027 and both read gates already honor
// it (`can_access_artist()` and `artist_access_has_scope()` refuse a grant whose
// `expires_at` is in the past). Nothing ever WROTE it, so every mandate an
// artist granted was endless — "scoped and revocable" (canon §3.3) in the
// scope half only. This module is the one place the four choices and their
// arithmetic live, so the artist screen and the account-hub accordion cannot
// drift apart on what "6 months" means.
//
// NULL is a real, deliberate answer — "no end date" — not a missing value.

export const MANDATE_EXPIRY_CHOICES = ['3m', '6m', '1y', 'none']

// A real end date is the safer default: an artist who does not think about it
// still gets a mandate that lapses instead of one that outlives the working
// relationship. A year is long enough not to nag, short enough to matter, and
// the artist can re-approve or end it at any time.
export const DEFAULT_MANDATE_EXPIRY = '1y'

const MONTHS = { '3m': 3, '6m': 6, '1y': 12 }

/**
 * Turn a chooser value into what goes in `expires_at`.
 * @returns {string|null} ISO timestamp, or null for "no end date" (endless).
 */
export function expiryFromChoice(choice, from = new Date()) {
  const months = MONTHS[choice]
  if (!months) return null
  const d = new Date(from.getTime())
  const day = d.getDate()
  d.setMonth(d.getMonth() + months)
  // Month arithmetic overflows on short months (31 Aug + 6m → 2 Mar). Pull
  // back to the last day of the intended month so the date the artist was
  // shown is the date that is stored.
  if (d.getDate() < day) d.setDate(0)
  return d.toISOString()
}

/**
 * Has this mandate lapsed? Mirrors the SQL exactly: null = endless = never
 * expired; anything strictly in the past no longer grants capability.
 */
export function isMandateExpired(expiresAt, now = new Date()) {
  if (!expiresAt) return false
  const t = Date.parse(expiresAt)
  return Number.isFinite(t) && t <= now.getTime()
}

/** An access row still carrying authority right now (status AND expiry). */
export function isMandateLive(row, now = new Date()) {
  return row?.status === 'active' && !isMandateExpired(row?.expires_at, now)
}
