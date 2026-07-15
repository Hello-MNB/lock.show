// FinalCTA band — shared page-system component (Codex rebuild brief §8).
// Props: one-line outcome · primary CTA · secondary text link.
// This band carries the section's single lime CTA.

import Link from 'next/link'

import { Icon } from './icons'
import type { Cta } from './hero'

export function FinalCta({
  title,
  body,
  primaryCta,
  secondaryLink,
}: {
  title: string
  body?: string
  primaryCta: Cta
  secondaryLink?: Cta
}) {
  const external = primaryCta.href.startsWith('http') || primaryCta.href.startsWith('/app')
  const primaryStyle = 'mk-btn mk-btn--primary'
  return (
    <section
      className="mk-section mk-final-cta"
      style={{
        background:
          'radial-gradient(760px 360px at 50% 120%, rgba(255,255,255,0.34), transparent 68%), var(--color-stamp)',
        color: 'var(--color-ink)',
        textAlign: 'center',
      }}
    >
      <div className="mk-container--narrow">
        <h2
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            letterSpacing: '-0.035em',
            lineHeight: 1.08,
            margin: '0 0 1rem',
              color: 'var(--color-ink)',
          }}
        >
          {title}
        </h2>
        {body ? (
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.65,
              color: 'rgba(10,13,11,0.68)',
              maxWidth: '520px',
              margin: '0 auto 2rem',
            }}
          >
            {body}
          </p>
        ) : (
          <div style={{ height: '1.25rem' }} />
        )}

        <div
          className="mk-cta-row"
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {external ? (
            <a href={primaryCta.href} className={primaryStyle}>
              {primaryCta.label}
              <Icon id="arrow" size={16} />
            </a>
          ) : (
            <Link href={primaryCta.href} className={primaryStyle}>
              {primaryCta.label}
              <Icon id="arrow" size={16} />
            </Link>
          )}
          {secondaryLink ? (
            <Link
              href={secondaryLink.href}
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-ink)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '44px',
              }}
            >
              {secondaryLink.label}
              <Icon id="arrow" size={14} />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
