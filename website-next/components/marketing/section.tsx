// Shared page rhythm — Codex rebuild brief §3.
// Every marketing section flows through Section + SectionHeading so the
// site keeps one consistent vertical rhythm (96px desktop / 56px mobile).

import type { CSSProperties, ReactNode } from 'react'

const TONES = {
  paper: { background: 'var(--color-paper)', color: 'var(--color-ink)' },
  forest: { background: 'var(--color-forest)', color: 'var(--color-paper)' },
  ink: { background: 'var(--color-ink)', color: 'var(--color-paper)' },
} as const

export type SectionTone = keyof typeof TONES

export function Section({
  tone = 'paper',
  narrow = false,
  style,
  children,
}: {
  tone?: SectionTone
  narrow?: boolean
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <section className="mk-section" style={{ ...TONES[tone], ...style }}>
      <div className={narrow ? 'mk-container--narrow' : 'mk-container'}>{children}</div>
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  tone = 'paper',
  align = 'center',
}: {
  eyebrow?: string
  title: string
  body?: string
  tone?: SectionTone
  align?: 'center' | 'start'
}) {
  const onDark = tone !== 'paper'
  const textAlign = align === 'center' ? 'center' : ('start' as const)
  return (
    <header style={{ textAlign, marginBottom: 'clamp(2.25rem, 5vw, 3.5rem)' }}>
      {eyebrow ? (
        <p
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: onDark ? 'var(--color-stamp)' : 'var(--color-tally-onlight)',
            marginBottom: '0.75rem',
          }}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 400,
          fontSize: 'clamp(1.7rem, 3.6vw, 2.6rem)',
          letterSpacing: '-0.03em',
          lineHeight: 1.08,
          color: onDark ? 'var(--color-paper)' : 'var(--color-ink)',
          margin: 0,
        }}
      >
        {title}
      </h2>
      {body ? (
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.65,
            maxWidth: '560px',
            margin: align === 'center' ? '1rem auto 0' : '1rem 0 0',
            color: onDark ? 'rgba(243,245,239,0.65)' : 'var(--color-tally-onlight)',
          }}
        >
          {body}
        </p>
      ) : null}
    </header>
  )
}
