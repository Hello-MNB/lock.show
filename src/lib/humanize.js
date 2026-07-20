// §5.10 — Humanized rendering of bounded data (the warmth layer OVER the firewall).
// The DB stores bounded bands/binaries (the firewall is unchanged); these pure helpers
// render warm human language ON TOP of that truth. FIREWALL RULES (spec §5.10 / §2.9):
//   • the human line describes room FIT, never RANKS the artist (no ordered better→worse ladder);
//   • the band stays the stored truth and is always shown alongside;
//   • no numeric grade is ever produced.
// These functions never invent a value — they only look up a line for a KNOWN band.

// Draw band → venue-context line. `capacityBands` = BANDS.capacity (the localized array),
// `contextLines` = T.passport.drawContext (index-aligned). Returns null for an unknown band
// (caller then shows the band alone). Kept dependency-free + pure for unit testing.
export function humanizeDrawBand(band, capacityBands, contextLines) {
  if (!band || !Array.isArray(capacityBands) || !Array.isArray(contextLines)) return null
  const i = capacityBands.indexOf(band)
  return i >= 0 ? (contextLines[i] ?? null) : null
}

// Binary → positive capability line (buyer-side shows ONLY the true/positive case;
// false/missing is never shown to a buyer, spec §5.10 / §8.7). Returns the label when
// `value` is truthy, else null.
export function humanizeBinary(value, positiveLabel) {
  return value ? (positiveLabel ?? null) : null
}

// Reviewed/verified date → warm month+year, never a raw dd/mm/yyyy stamp
// (spec §5.10: "Fresh proof · July 2026" / "added this month," not
// "Reviewed 12/05/2026"). Returns { monthYear, isFresh } or null for a
// missing/invalid date. The CALLER composes the final sentence via
// T.passport.dateFresh(monthYear) / T.passport.dateVerified(monthYear) —
// this helper only computes the locale-aware month label + freshness,
// never the display copy (that stays i18n-owned).
export function humanizeReviewDate(dateStr, { lang = 'en', now = new Date(), freshDays = 90 } = {}) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return null
  const monthYear = new Intl.DateTimeFormat(lang === 'he' ? 'he' : 'en-US', { month: 'long', year: 'numeric' }).format(d)
  const ageDays = (now.getTime() - d.getTime()) / 86400000
  return { monthYear, isFresh: ageDays >= 0 && ageDays <= freshDays }
}
