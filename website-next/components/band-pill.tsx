// BandPill — text-only audience draw indicator.
// NO fill bar. NO gauge. NO CSS width animation. NO fraction representation.
// Always renders as plain text in DM Mono.

interface BandPillProps {
  value: string      // e.g. "70–150"
  size?: 'sm' | 'md' | 'lg'
  onDark?: boolean   // true → paper color; false → ink color (default: auto via currentColor)
}

export function BandPill({ value, size = 'md', onDark }: BandPillProps) {
  const fontSize =
    size === 'sm' ? '1rem' :
    size === 'lg' ? '1.75rem' :
    '1.3rem'

  const color = onDark === true
    ? 'var(--color-paper)'
    : onDark === false
      ? 'var(--color-ink)'
      : 'inherit'

  return (
    <span
      // dir="ltr": band ranges like "70–150" must never visually reverse to
      // "150–70" when the page is toggled to Hebrew (RTL). Same rule as the
      // Wordmark's dir="ltr" precedent.
      dir="ltr"
      style={{
        fontFamily: 'var(--font-space-mono)',
        fontSize,
        fontWeight: 700,
        color,
        letterSpacing: '-0.01em',
        display: 'inline-block',
      }}
      aria-label={`Audience draw: ${value}`}
    >
      {value}
    </span>
  )
}
