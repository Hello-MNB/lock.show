// EntityCard — shared page-system component (Codex rebuild brief §8).
// Props: icon · title · one-line value · CTA · audience-specific label.
// Variants provide the brief's card rhythm (paper / dark) instead of
// same-width repetitive white cards.

import Link from 'next/link'

import { Icon, type IconId } from './icons'
import type { Cta } from './hero'

export function EntityCard({
  icon,
  audienceLabel,
  title,
  body,
  cta,
  variant = 'paper',
}: {
  icon: IconId
  audienceLabel: string
  title: string
  body: string
  cta: Cta
  variant?: 'paper' | 'forest'
}) {
  const dark = variant === 'forest'
  return (
    <article
      className="mk-card"
      style={{
        background: dark ? 'var(--color-forest)' : '#ffffff',
        border: dark ? '1px solid rgba(243,245,239,0.1)' : '1px solid rgba(10,13,11,0.1)',
        padding: 'clamp(1.5rem, 3vw, 2rem)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.4rem',
            height: '2.4rem',
            borderRadius: '12px',
            background: dark ? 'rgba(200,240,77,0.12)' : 'rgba(10,13,11,0.05)',
            border: dark ? '1px solid rgba(200,240,77,0.25)' : '1px solid rgba(10,13,11,0.08)',
            color: dark ? 'var(--color-stamp)' : 'var(--color-ink)',
            flexShrink: 0,
          }}
        >
          <Icon id={icon} size={18} />
        </span>
        <span
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.11em',
            textTransform: 'uppercase',
            color: dark ? 'var(--color-stamp)' : 'var(--color-tally-onlight)',
          }}
        >
          {audienceLabel}
        </span>
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-archivo)',
          fontSize: '1.15rem',
          fontWeight: 800,
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
          color: dark ? 'var(--color-paper)' : 'var(--color-ink)',
          margin: 0,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.95rem',
          lineHeight: 1.65,
          color: dark ? 'rgba(243,245,239,0.65)' : 'var(--color-tally-onlight)',
          margin: 0,
          flex: 1,
        }}
      >
        {body}
      </p>

      <Link
        href={cta.href}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-space-mono)',
          fontSize: '0.74rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          color: dark ? 'var(--color-stamp)' : 'var(--color-ink)',
          padding: '0.5rem 0 0',
          minHeight: '44px',
          alignSelf: 'flex-start',
        }}
      >
        {cta.label}
        <Icon id="arrow" size={14} />
      </Link>
    </article>
  )
}
