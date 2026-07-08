// GIGPROOF "Live Intelligence" design tokens — warm cinematic night.
// SSOT mirrored in tailwind.config.js — keep both files in sync.
// Feature screens compose from these via Tailwind classes + /components/ui
// primitives; a full redesign = change tailwind.config.js + this mirror +
// /components/ui only — no feature code changes.

export const colors = {
  // Canvas & surfaces
  bg: '#0B0C0B',        // page canvas (dark)
  bg2: '#0E100F',       // sidebar / nav bg
  surface: '#14181A',   // cards
  surface2: '#1B2022',  // inputs, nested surfaces
  raise: '#232A2B',     // hover elevation

  // Text
  ink: '#F3F0E8',       // primary text
  muted: '#98A19A',     // secondary text
  faint: '#69716B',     // tertiary / placeholders

  // Accent & atmosphere — lime ALWAYS carries dark text
  accent: '#BEE24E',
  accentDeep: '#9FD531',
  onAccent: '#12160A',  // the ONLY text color allowed on lime
  gold: '#F2C063',      // warm atmosphere, method labels, artist aura
  teal: '#46DCC2',      // developing state
  amber: '#E39A4B',     // needs-you state

  // Hairlines
  line: 'rgba(255,255,255,.08)',
  line2: 'rgba(255,255,255,.15)',
} as const

// Bounded-status pairs (fg on tinted bg) — categorical words + shape icons,
// NEVER a score/gauge (firewall).
export const status = {
  good: { fg: '#CBEE72', bg: 'rgba(190,226,78,.12)' }, // Established
  dev:  { fg: '#82E8D6', bg: 'rgba(70,220,194,.12)' }, // Developing
  need: { fg: '#F0B478', bg: 'rgba(227,154,75,.15)' }, // Needs you
  na:   { fg: '#9AA29B', bg: 'rgba(255,255,255,.06)' }, // Not assessed
} as const

export const fontFamily = {
  display: '"Frank Ruhl Libre", Georgia, serif',            // headings
  sans: '"Heebo", system-ui, sans-serif',                   // body/UI (covers Hebrew)
  mono: '"IBM Plex Mono", ui-monospace, monospace',         // method labels · bands · dates
} as const

export const borderRadius = {
  button: '12px',
  input: '11px',
  row: '14px',
  card: '20px',   // cards 18–24px
  full: '9999px', // chips
} as const

export const shadow = {
  card: '0 24px 60px -24px rgba(0,0,0,.75)',
  glow: '0 10px 26px -10px rgba(190,226,78,.6)', // lime glow — primary CTA only
} as const

export const spacing = {
  cardPad: '1.25rem',
  pagePad: '1rem',
  chipPad: '0.5rem 0.875rem',
} as const

export const animation = {
  fadeIn: 'fade-in 220ms ease-out both',
  shimmer: 'shimmer 1.6s linear infinite',
} as const

export type Color = keyof typeof colors
export type Status = keyof typeof status
