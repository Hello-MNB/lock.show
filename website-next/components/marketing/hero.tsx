// Hero — shared page-system component (Codex rebuild brief §8).
// Props: eyebrow · H1 · body · primary CTA · secondary CTA · trust line ·
// image asset · optional floating product cards. Used on every main page.
//
// Layout tokens (brief §3): hero card radius 32px, ONE lime CTA per
// viewport (primary only), secondary CTA is outline.

import type { ReactNode } from 'react'
import Link from 'next/link'

import { Icon } from './icons'

export interface Cta {
  label: string
  href: string
}

function CtaLink({
  cta,
  variant,
}: {
  cta: Cta
  variant: 'primary' | 'outline-dark'
}) {
  const className = `mk-btn mk-btn--${variant}`
  const external = cta.href.startsWith('http') || cta.href.startsWith('/app')
  if (external) {
    return (
      <a href={cta.href} className={className}>
        {cta.label}
        {variant === 'primary' ? <Icon id="arrow" size={16} /> : null}
      </a>
    )
  }
  return (
    <Link href={cta.href} className={className}>
      {cta.label}
      {variant === 'primary' ? <Icon id="arrow" size={16} /> : null}
    </Link>
  )
}

export function Hero({
  eyebrow,
  title,
  body,
  primaryCta,
  secondaryCta,
  trustLine,
  image,
  chips,
  floatingTop,
  floatingBottom,
  below,
}: {
  eyebrow: string
  title: ReactNode
  body: string
  primaryCta: Cta
  secondaryCta?: Cta
  trustLine?: string
  image: { src: string; alt: string; position?: string }
  /** Small product chips overlaid on the image card (e.g. Radar · Passport). */
  chips?: string[]
  /** Optional floating product card, top edge of the image card. */
  floatingTop?: ReactNode
  /** Optional floating product card, bottom edge of the image card. */
  floatingBottom?: ReactNode
  /** Optional extra row under the CTAs (badges, micro-steps). */
  below?: ReactNode
}) {
  return (
    <section
      className="mk-hero"
      style={{
        background:
          'radial-gradient(720px 480px at 85% 0%, rgba(200,240,77,0.08), transparent 60%), linear-gradient(160deg, var(--color-ink) 0%, var(--color-forest) 100%)',
        color: 'var(--color-paper)',
      }}
    >
      <div className="mk-container">
        <div className="mk-hero-grid">
          {/* ── Left: copy ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: 'var(--color-stamp)',
                  boxShadow: '0 0 10px var(--color-stamp)',
                  flexShrink: 0,
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
                fontSize: 'clamp(2.2rem, 4.6vw, 3.6rem)',
                lineHeight: 1.02,
                letterSpacing: '-0.04em',
                color: 'var(--color-paper)',
                margin: '0 0 1.4rem',
              }}
            >
              {title}
            </h1>

            <p
              style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.1rem)',
                lineHeight: 1.7,
                color: 'rgba(243,245,239,0.7)',
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

            {below ? <div style={{ marginTop: '1.5rem' }}>{below}</div> : null}
          </div>

          {/* ── Right: cinematic image card + floating product cards ── */}
          <div className="mk-hero-media">
            <div
              className="mk-hero-media-img"
              role="img"
              aria-label={image.alt}
              style={{
                background: `linear-gradient(200deg, rgba(10,13,11,0.06) 30%, rgba(10,13,11,0.62) 82%, rgba(10,13,11,0.85) 100%), url('${image.src}') ${image.position ?? 'center'} / cover no-repeat`,
              }}
            >
              {chips && chips.length > 0 ? (
                <div
                  style={{
                    position: 'absolute',
                    insetInlineStart: '1.1rem',
                    bottom: '1.1rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.45rem',
                    maxWidth: 'calc(100% - 2.2rem)',
                  }}
                >
                  {chips.map((chip) => (
                    <span
                      key={chip}
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        letterSpacing: '0.09em',
                        textTransform: 'uppercase',
                        color: 'var(--color-paper)',
                        background: 'rgba(10,13,11,0.55)',
                        border: '1px solid rgba(243,245,239,0.22)',
                        borderRadius: '999px',
                        padding: '0.32rem 0.7rem',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {floatingTop ? <div className="mk-float mk-float--top">{floatingTop}</div> : null}
            {floatingBottom ? (
              <div className="mk-float mk-float--bottom">{floatingBottom}</div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
