// Hero — shared page-system component (Codex rebuild brief §8, flat rework
// per OWNER DESIGN RULING SYNC §45: NO FRAMES-INSIDE-FRAMES).
//
// Composition: FLAT and integrated. The hero image is no longer a rounded
// card — it bleeds to the section edge (right ~60% on desktop, full-width
// band on mobile) and is blended into the hero background with a soft
// gradient mask. No border, no rounded frame, no shadow box, no floating
// mini-cards, no boxed chips. Depth comes from the image + gradient +
// typography only.
//
// Backward compatible: every prop of the previous card-based hero is still
// accepted. `floatingTop` / `floatingBottom` are intentionally NOT rendered
// (kept for compat so no page needs edits). `chips` render as a quiet mono
// text line (dot-separated) under the trust line. `image.overlay` (W4)
// still works as the gradient tint layered over the image.
//
// Layout tokens (brief §3): ONE lime CTA per viewport (primary only),
// secondary CTA is outline, buttons ≥44px mobile.

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

export interface HeroProps {
  eyebrow: string
  title: ReactNode
  body: string
  primaryCta: Cta
  secondaryCta?: Cta
  trustLine?: string
  /** `overlay` optionally replaces the default tint gradient over the image
   *  (must be a full CSS gradient). The edge-blend mask that integrates the
   *  image into the hero background is applied regardless. */
  image: { src: string; alt: string; position?: string; overlay?: string }
  /** Product labels (e.g. Radar · Passport). Rendered as one quiet
   *  dot-separated mono text line under the trust line — no boxes. */
  chips?: string[]
  /** Accepted for backward compatibility — no longer rendered
   *  (flat-composition ruling: no floating cards over the image). */
  floatingTop?: ReactNode
  /** Accepted for backward compatibility — no longer rendered. */
  floatingBottom?: ReactNode
  /** Optional extra row under the CTAs (badges, micro-steps). */
  below?: ReactNode
}

export function Hero(props: HeroProps) {
  // NOTE: props.floatingTop / props.floatingBottom are deliberately unused —
  // the flat composition renders no overlapping cards (SYNC §45).
  const {
    eyebrow,
    title,
    body,
    primaryCta,
    secondaryCta,
    trustLine,
    image,
    chips,
    below,
  } = props

  // Tint over the image (kept subtle — the mask does the blending).
  const tint =
    image.overlay ??
    'linear-gradient(200deg, rgba(10,13,11,0) 42%, rgba(10,13,11,0.38) 88%, rgba(10,13,11,0.55) 100%)'

  return (
    <section
      className="mk-hero mk-hero--flat"
      style={{
        background:
          'radial-gradient(720px 480px at 85% 0%, rgba(200,240,77,0.08), transparent 60%), linear-gradient(160deg, var(--color-ink) 0%, var(--color-forest) 100%)',
        color: 'var(--color-paper)',
      }}
    >
      <div className="mk-container mk-hero-inner">
        {/* ── Copy column ── */}
        <div className="mk-hero-copy">
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

          {chips && chips.length > 0 ? (
            // Flat product-label line — mono uppercase, dot separators,
            // no backgrounds, no borders (SYNC §45).
            <p className="mk-hero-tags">
              {chips.map((chip, i) => (
                <span key={chip} className="mk-hero-tag">
                  {i > 0 ? (
                    <span aria-hidden="true" className="mk-hero-tag-dot">
                      ·
                    </span>
                  ) : null}
                  {chip}
                </span>
              ))}
            </p>
          ) : null}

          {below ? <div style={{ marginTop: '1.5rem' }}>{below}</div> : null}
        </div>
      </div>

      {/* ── Flat image region — bleeds to the section edge, blended in by a
             gradient mask. Placed after the copy in the DOM so it flows
             below the text as a full-width band on mobile. ── */}
      <div
        className="mk-hero-bleed"
        role="img"
        aria-label={image.alt}
        style={{
          background: `${tint}, url('${image.src}') ${image.position ?? 'center'} / cover no-repeat`,
        }}
      />
    </section>
  )
}
