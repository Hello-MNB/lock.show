// ── PlatformLogo — the single shared logo set (brand pass) ──────────────────
// Monochrome (currentColor) inline SVG marks, 24×24 viewBox. Recognizability
// comes from SHAPE, never color (DESIGN-SPEC.md restraint: "recognizability
// comes from SHAPE"). Same silhouettes as the approved prototype's PLOGO map
// (gigproof-desktop.html) so the buyer-facing prototype and this app read as
// one branded system, not two.
//
// Usage:
//   <PlatformLogo name="instagram" size={20} />
//   const key = detectPlatform(url_or_label)   // → 'instagram' | 'ticket' | null
//
// Covers the 11 recognizable platform brands the owner named (Instagram,
// Facebook, Spotify, SoundCloud, YouTube, TikTok, WhatsApp, Telegram, Apple
// Music, Beatport, Bandcamp) plus 5 neutral marks for categories that aren't a
// single brand (ticket export / venue archive / press coverage / mailing list
// / web search) — those stay generic shapes on purpose, never a trademarked
// logo (e.g. no literal Google "G").

const MARKS = {
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.7" cy="7.3" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 8.2h-1.6c-.9 0-1.6.7-1.6 1.6v2.1h3l-.45 2.6h-2.55V21" />
    </>
  ),
  spotify: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M7.6 10.4c2.9-.9 6.3-.7 8.8.9M8.1 13.3c2.3-.7 5-.5 7 .7M8.7 15.9c1.7-.5 3.7-.4 5.2.5" />
    </>
  ),
  soundcloud: (
    <>
      <path d="M3 15v3M6 13v5M9 11v7" />
      <path d="M12 18h5.5a3.5 3.5 0 0 0 .7-6.93A5.5 5.5 0 0 0 12 7.5V18z" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="4" />
      <path d="M10.3 9.6l5 2.4-5 2.4z" fill="currentColor" stroke="none" />
    </>
  ),
  tiktok: (
    <>
      <path d="M14 3.2v11.3a3.4 3.4 0 1 1-2.3-3.2" />
      <path d="M14 3.2c.35 2.1 2.05 3.75 4.1 4v2.5c-1.55 0-3.05-.5-4.1-1.35" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M12 3a9 9 0 0 0-7.5 13.9L3 21l4.3-1.4A9 9 0 1 0 12 3z" />
      <path
        fill="currentColor" stroke="none"
        d="M9 8.5c.2-.5.4-.5.6-.5s.4 0 .5.3c.2.4.6 1.4.7 1.5.1.2.1.3 0 .5-.1.2-.2.3-.3.4-.1.1-.2.3-.1.5.3.5.7 1 1.2 1.4.5.4.9.6 1.1.7.2.1.3.1.5-.1.1-.2.5-.6.7-.8.2-.2.3-.1.5 0 .2.1 1.3.6 1.5.7.2.1.3.2.3.3 0 .1 0 .7-.2 1.2-.3.6-1.3 1-1.9 1.1-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.6-.6-2.3-1-3.7-3.3-3.8-3.4-.1-.2-.9-1.1-.9-2.2 0-1 .5-1.5.7-1.7z"
      />
    </>
  ),
  telegram: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path fill="currentColor" stroke="none" d="M6.5 12.4l11-5-2 11.3-3.6-2.7-1.9 1.9-.4-3 6.5-6-7.7 4.6z" />
    </>
  ),
  applemusic: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="9.3" cy="16.3" r="1.9" fill="currentColor" stroke="none" />
      <circle cx="15.7" cy="14.9" r="1.9" fill="currentColor" stroke="none" />
      <path d="M11.2 16.3V8.6L17.6 7v7.9" />
    </>
  ),
  beatport: (
    <path d="M12 3v6M8.2 5.4v10.2M15.8 5.4v10.2M4.6 8v7M19.4 8v7M12 15v6" />
  ),
  bandcamp: (
    <path d="M4 6.5h12l4 5.5-4 5.5H4z" strokeLinejoin="round" />
  ),
  // ── neutral marks (category, not a single brand) ──
  ticket: (
    <>
      <path d="M4 9.2a2 2 0 0 1 0-4V6a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 20 6v.7a2 2 0 0 1 0 4V12a2 2 0 0 1 0 4v1.3a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.3V16a2 2 0 0 1 0-4z" />
      <path d="M14.5 5v14" strokeDasharray="1.6 2.2" />
    </>
  ),
  venue: (
    <>
      <path d="M4 21V9.5l8-5 8 5V21" />
      <path d="M9 21v-6h6v6" />
    </>
  ),
  press: (
    <>
      <path d="M3 10v4h3l6.5 4.2V5.8L6 10z" />
      <path d="M15.3 9.2a4.2 4.2 0 0 1 0 5.6" />
    </>
  ),
  mailing: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.3 6.5l8.7 6.2 8.7-6.2" />
    </>
  ),
  search: (
    <>
      <circle cx="10.4" cy="10.4" r="6.4" />
      <path d="M19.8 19.8l-4.9-4.9" />
    </>
  ),
  // generic fallback — a plain link/chain glyph, used when nothing recognized
  link: (
    <>
      <path d="M9.5 14.5l5-5" />
      <path d="M11 8l1.2-1.2a3 3 0 1 1 4.2 4.2L15 12.2" />
      <path d="M13 16l-1.2 1.2a3 3 0 1 1-4.2-4.2L9 11.8" />
    </>
  ),
}

/** <PlatformLogo name="instagram" size={20} /> — one shared, monochrome mark. */
export function PlatformLogo({ name, size = 20, className = '' }) {
  const mark = (name && MARKS[name]) || MARKS.link
  return (
    <svg
      viewBox="0 0 24 24" width={size} height={size}
      fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true"
    >
      {mark}
    </svg>
  )
}

// order matters — more specific patterns first (e.g. "apple music" before a
// bare "apple", ticket/venue before generic terms)
const DETECT = [
  [/soundcloud/i, 'soundcloud'],
  [/instagr/i, 'instagram'],
  [/facebook|fb\.com/i, 'facebook'],
  [/spotify/i, 'spotify'],
  [/youtu\.?be/i, 'youtube'],
  [/tiktok/i, 'tiktok'],
  [/whatsapp|wa\.me/i, 'whatsapp'],
  [/telegram|t\.me/i, 'telegram'],
  [/music\.apple|apple\s*music/i, 'applemusic'],
  [/beatport/i, 'beatport'],
  [/bandcamp/i, 'bandcamp'],
  [/selector|go-?out|ticket|settlement/i, 'ticket'],
  [/venue|residency|producer[\s-]?(vouch|confirm)/i, 'venue'],
  [/press|media coverage|\bcoverage\b/i, 'press'],
  [/mailing list/i, 'mailing'],
  [/\bepk\b|website|google|\bweb search\b|ra\.co|residentadvisor/i, 'search'],
]

/**
 * detectPlatform(url) — names the platform from a URL (or any free-text label
 * / source_type, e.g. claim.source_type) so the same detector works for a
 * pasted link AND for a claim row that only carries a category string. Never
 * guesses — returns null rather than a wrong logo.
 */
export function detectPlatform(url) {
  const v = String(url || '')
  if (!v.trim()) return null
  const hit = DETECT.find(([re]) => re.test(v))
  return hit ? hit[1] : null
}

export default PlatformLogo
