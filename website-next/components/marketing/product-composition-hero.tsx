// ProductCompositionHero — Free Pilot / Contact hero (Codex build scope §7,
// SYNC §47). NO photo: a central lime "Free pilot" tile with entity chips
// orbiting it, over a forest + soft amber glow. Mobile-first: copy + CTA
// first, then the composition stacks below.

import Link from 'next/link'

import { Icon, type IconId } from './icons'
import type { Cta } from './hero'

function CtaLink({ cta, variant }: { cta: Cta; variant: 'primary' | 'outline-dark' }) {
  const className = `mk-btn mk-btn--${variant}`
  const external = cta.href.startsWith('http') || cta.href.startsWith('/app')
  const content = (
    <>
      {cta.label}
      {variant === 'primary' ? <Icon id="arrow" size={16} /> : null}
    </>
  )
  return external ? (
    <a href={cta.href} className={className}>
      {content}
    </a>
  ) : (
    <Link href={cta.href} className={className}>
      {content}
    </Link>
  )
}

export interface OrbitChip {
  label: string
  icon: IconId
}

export function ProductCompositionHero({
  eyebrow,
  title,
  body,
  primaryCta,
  secondaryCta,
  trustLine,
  coreEyebrow,
  coreTitle,
  chips,
  note,
}: {
  eyebrow: string
  title: string
  body: string
  primaryCta: Cta
  secondaryCta?: Cta
  trustLine?: string
  coreEyebrow: string
  coreTitle: string
  chips: OrbitChip[]
  note: string
}) {
  return (
    <section
      className="mk-hero mk-product-hero"
      style={{
        background:
          'radial-gradient(680px 460px at 78% 8%, var(--accent-warm), transparent 62%), radial-gradient(520px 380px at 20% 96%, var(--accent-cool), transparent 60%), var(--gradient-nightlife)',
        color: 'var(--color-paper)',
      }}
    >
      {/* mk-hero-grid collapses to a single column ≤960px (marketing.css), so
          on mobile the copy + CTA come first and the composition stacks below. */}
      <div className="mk-container mk-hero-grid">
        {/* Copy column */}
        <div className="mk-hero-copy">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.4rem' }}>
            <span
              aria-hidden="true"
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--color-stamp)',
                boxShadow: '0 0 10px var(--color-stamp)',
              }}
            />
            <p
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-stamp)',
                margin: 0,
              }}
            >
              {eyebrow}
            </p>
          </div>
          <h1
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: 'clamp(2.2rem, 4.6vw, 3.4rem)',
              lineHeight: 1.03,
              letterSpacing: '-0.04em',
              margin: '0 0 1.3rem',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.1rem)',
              lineHeight: 1.7,
              color: 'rgba(243,245,239,0.72)',
              maxWidth: '480px',
              margin: '0 0 2rem',
            }}
          >
            {body}
          </p>
          <div
            className="mk-cta-row"
            style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}
          >
            <CtaLink cta={primaryCta} variant="primary" />
            {secondaryCta ? <CtaLink cta={secondaryCta} variant="outline-dark" /> : null}
          </div>
          {trustLine ? (
            <p
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.06em',
                color: 'rgba(243,245,239,0.55)',
                margin: 0,
              }}
            >
              {trustLine}
            </p>
          ) : null}
        </div>

        {/* Product composition — NOT a photo */}
        <div className="mk-pilot-stage">
          <div className="mk-pilot-core">
            <span className="mk-pilot-core__eyebrow">{coreEyebrow}</span>
            <span className="mk-pilot-core__title">{coreTitle}</span>
          </div>
          <div className="mk-pilot-ring">
            {chips.map((chip) => (
              <span key={chip.label} className="mk-pilot-orb">
                <Icon id={chip.icon} size={15} />
                {chip.label}
              </span>
            ))}
          </div>
          <p className="mk-pilot-note">{note}</p>
        </div>
      </div>
    </section>
  )
}
