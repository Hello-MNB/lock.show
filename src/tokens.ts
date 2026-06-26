// Single source of visual truth for GIGPROOF.
// Feature screens compose from these via Tailwind classes + /components/ui primitives.
// A full redesign = change this file + /components/ui only — no feature code changes.

export const colors = {
  ink: '#0E0F13',
  surface: '#16181F',
  card: '#1C1F28',
  line: '#2A2E3A',
  muted: '#8A90A0',
  soft: '#C4C9D6',
  accent: '#F0C24B',       // warm gold — verified cue + primary CTA
  accentDark: '#C99A2E',   // hover / pressed state
  ok: '#5BD6A0',           // חזק (strong)
  warn: '#E9A23B',         // מתפתח (developing)
  gap: '#6B7280',          // חסר-הוכחה / לא-ניתן-להעריך
} as const

export const fontFamily = {
  sans: '"Heebo", "Assistant", system-ui, Arial, sans-serif',
} as const

export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  xl2: '1.25rem',
  full: '9999px',
} as const

export const spacing = {
  cardPad: '1.25rem',
  pagePad: '1rem',
  chipPad: '0.5rem 0.875rem',
} as const

export const animation = {
  fadeIn: 'fade-in 220ms ease-out both',
} as const

export type Color = keyof typeof colors
