// Genre → planet-weight map (DS v1.6.11 #genre-planet-weights, Codex-ratified).
// INTERNAL prioritization ONLY (RADAR-SOURCE-ARCHITECTURE §3): orders next-action
// guidance and planet emphasis. FIREWALL: never rendered as a number, score,
// rank, percentage, genre leaderboard, public badge, or buyer-facing weakness.
//
// Family resolution is DETERMINISTIC from act.format (bounded CHECK in the act
// table: dj-set/live-set/duo/band/open-format/vocalist/other) with a genre-text
// hint only as a tiebreaker — free-text genre never hard-fails the mapping.
// Planet keys match radarUniverse.js: identity · music · live · audience · prokit · proof.

export const GENRE_FAMILIES = {
  'dj-club':        { primary: ['live', 'audience', 'prokit'],  secondary: ['proof', 'identity'] },
  'dj-festival':    { primary: ['music', 'live', 'proof'],      secondary: ['audience', 'identity'] },
  'open-format':    { primary: ['prokit', 'live', 'proof'],     secondary: ['audience', 'identity'] },
  'live-band':      { primary: ['live', 'prokit', 'proof'],     secondary: ['audience', 'identity'] },
  'original-artist':{ primary: ['music', 'identity', 'live'],   secondary: ['proof', 'audience'] },
  'live-electronic':{ primary: ['music', 'live', 'identity'],   secondary: ['prokit', 'proof'] },
  'comedian-host':  { primary: ['live', 'identity', 'prokit'],  secondary: ['proof', 'audience'] },
  'corporate-ceremony': { primary: ['prokit', 'proof', 'live'], secondary: ['identity', 'music'] },
}

const FESTIVAL_HINT = /festival|psytrance|trance|rave/i

// act.format → family (deterministic); genre text only refines dj-set.
export function familyFor(act, artist) {
  const format = act?.format || null
  const genre = act?.genre || artist?.genre || ''
  switch (format) {
    case 'dj-set':      return FESTIVAL_HINT.test(genre) ? 'dj-festival' : 'dj-club'
    case 'open-format': return 'open-format'
    case 'band':
    case 'duo':         return 'live-band'
    case 'vocalist':    return 'original-artist'
    case 'live-set':    return 'live-electronic'
    default:            return FESTIVAL_HINT.test(genre) ? 'dj-festival' : 'dj-club' // sensible IL default
  }
}

// Is this planet a PRIMARY focus for the artist's family? (drives the
// "matters most in your genre" guidance line — wording lives in i18n.)
export function isPrimaryPlanet(planetKey, act, artist) {
  const fam = GENRE_FAMILIES[familyFor(act, artist)]
  return !!fam && fam.primary.includes(planetKey)
}

// Emphasis order for planet rendering / next-action candidate sorting:
// primary planets first (family order), then secondary, then the rest.
export function planetEmphasisOrder(act, artist) {
  const fam = GENRE_FAMILIES[familyFor(act, artist)] || GENRE_FAMILIES['dj-club']
  const all = ['identity', 'music', 'live', 'audience', 'prokit', 'proof']
  const rest = all.filter((p) => !fam.primary.includes(p) && !fam.secondary.includes(p))
  return [...fam.primary, ...fam.secondary, ...rest]
}
