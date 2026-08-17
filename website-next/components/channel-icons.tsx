/**
 * CHANNEL GLYPHS — simple in-house geometry, currentColor, no bitmaps.
 *
 * RIGHTS POSITION, STATED RATHER THAN ASSUMED: these are ORIGINAL simplified
 * glyphs drawn here, not the platforms' registered logo artwork. Each platform
 * DOES permit its official icon for linking to your own profile, under its own
 * brand guidelines — but that requires downloading the official asset and
 * following those rules, which is an owner action with a rights trail, not
 * something to improvise. Swapping these for official marks later is a
 * one-file change. Recorded against the open ASSET-RIGHTS decision in
 * docs/OWNER-PENDING.md so it is not silently forgotten.
 *
 * Every glyph is decorative (aria-hidden) — the accessible name lives on the
 * anchor, so a screen reader announces "LOCK SHOW on Instagram", not "image".
 */
type P = { size?: number }
const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true as const, focusable: 'false' as const })

export function WhatsAppGlyph({ size = 20 }: P) {
  return (
    <svg {...base(size)}>
      {/* speech bubble with a tail — the universally-read "chat" shape */}
      <path d="M12 3a9 9 0 0 0-7.7 13.7L3 21l4.4-1.3A9 9 0 1 0 12 3Z"
            stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      {/* handset inside */}
      <path d="M9 8.6c.2-.5.6-.5.9-.5.3 0 .6.1.8.6l.5 1.2c.1.3 0 .5-.2.7l-.4.4c-.1.2-.2.3 0 .6.4.7 1 1.3 1.8 1.7.3.1.4.1.6-.1l.4-.4c.2-.2.4-.2.7-.1l1.2.5c.4.2.5.5.5.8 0 .4-.2.9-.7 1.1-.4.2-1 .3-1.6.1-1.2-.3-2.4-1.1-3.3-2-.9-.9-1.6-2-1.8-3.1-.1-.6 0-1.1.2-1.5Z"
            fill="currentColor" />
    </svg>
  )
}

export function InstagramGlyph({ size = 20 }: P) {
  return (
    <svg {...base(size)}>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.1" cy="6.9" r="1.15" fill="currentColor" />
    </svg>
  )
}

export function FacebookGlyph({ size = 20 }: P) {
  return (
    <svg {...base(size)}>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M14.6 8.4h-1.2c-.6 0-1 .4-1 1v1.3h2.1l-.3 2.2h-1.8v5.1h-2.2v-5.1H8.5v-2.2h1.7V9.2c0-1.8 1.1-2.9 2.8-2.9h1.6v2.1Z"
            fill="currentColor" />
    </svg>
  )
}

export function LinkedInGlyph({ size = 20 }: P) {
  return (
    <svg {...base(size)}>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="7.8" cy="7.9" r="1.25" fill="currentColor" />
      <rect x="6.9" y="10.2" width="1.8" height="7" rx=".5" fill="currentColor" />
      <path d="M11 17.2v-7h1.8v.9c.5-.7 1.2-1.05 2.1-1.05 1.7 0 2.7 1.1 2.7 3v4.15h-1.8v-3.8c0-1.05-.5-1.65-1.4-1.65s-1.6.65-1.6 1.75v3.7H11Z"
            fill="currentColor" />
    </svg>
  )
}

export const GLYPH: Record<string, (p: P) => React.JSX.Element> = {
  whatsapp: WhatsAppGlyph,
  instagram: InstagramGlyph,
  facebook: FacebookGlyph,
  linkedin: LinkedInGlyph,
}
