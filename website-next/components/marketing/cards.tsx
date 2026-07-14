// WAVE-6 card + chip variants (Codex build scope §4 / SYNC §47).
// Cards vary by PURPOSE so the site stops reading as one repeated rounded
// rectangle. All interactive elements inherit hover/focus/active states from
// the .mk-v-card / .mk-chip classes in styles/marketing.css.

import type { ReactNode } from 'react'
import Link from 'next/link'

import { Icon, type IconId } from './icons'

export type ChipType = 'action' | 'source' | 'method' | 'neutral'

/** Chip coloured by TYPE — never all-lime. `onLight` for paper backgrounds. */
export function Chip({
  type,
  children,
  onLight = false,
  icon,
}: {
  type: ChipType
  children: ReactNode
  onLight?: boolean
  icon?: IconId
}) {
  return (
    <span className={`mk-chip mk-chip--${type}${onLight ? ' mk-chip--on-light' : ''}`}>
      {icon ? <Icon id={icon} size={12} /> : null}
      {children}
    </span>
  )
}

/** SignalCard — dark, compact, lime live-signal edge. */
export function SignalCard({
  icon,
  label,
  title,
  body,
}: {
  icon?: IconId
  label?: string
  title: string
  body: string
}) {
  return (
    <article className="mk-v-card mk-signal-card">
      {(icon || label) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {icon ? <Icon id={icon} size={16} color="var(--color-stamp)" /> : null}
          {label ? (
            <span
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.64rem',
                fontWeight: 700,
                letterSpacing: '0.11em',
                textTransform: 'uppercase',
                color: 'var(--color-stamp)',
              }}
            >
              {label}
            </span>
          ) : null}
        </div>
      )}
      <h3
        style={{
          fontFamily: 'var(--font-archivo)',
          fontSize: '1.05rem',
          fontWeight: 800,
          lineHeight: 1.3,
          color: 'var(--color-paper)',
          margin: 0,
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'rgba(243,245,239,0.62)', margin: 0 }}>
        {body}
      </p>
    </article>
  )
}

/** EditorialCard — borderless, typographic (problem/pain text). */
export function EditorialCard({
  index,
  title,
  body,
  accent = 'neutral',
}: {
  index?: string
  title: string
  body: string
  accent?: 'neutral' | 'warm' | 'cool'
}) {
  const cls =
    accent === 'warm'
      ? ' mk-editorial-card--warm'
      : accent === 'cool'
        ? ' mk-editorial-card--cool'
        : ''
  return (
    <div className={`mk-editorial-card${cls}`}>
      {index ? (
        <span
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'var(--color-tally-onlight)',
          }}
        >
          {index}
        </span>
      ) : null}
      <h3
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 'clamp(1.15rem, 2.4vw, 1.4rem)',
          fontWeight: 400,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          color: 'var(--color-ink)',
          margin: 0,
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--color-tally-onlight)', margin: 0 }}>
        {body}
      </p>
    </div>
  )
}

/** MediaTile — image-first, caption over gradient. */
export function MediaTile({
  image,
  caption,
  href,
}: {
  image: { src: string; alt: string; position?: string }
  caption: ReactNode
  href?: string
}) {
  const inner = (
    <>
      <span
        className="mk-media-tile__img"
        aria-hidden="true"
        style={{ backgroundImage: `url('${image.src}')`, backgroundPosition: image.position ?? 'center' }}
      />
      <span className="mk-media-tile__cap">{caption}</span>
    </>
  )
  if (href) {
    return (
      <Link href={href} className="mk-v-card mk-media-tile" aria-label={image.alt}>
        {inner}
      </Link>
    )
  }
  return (
    <div className="mk-v-card mk-media-tile" role="img" aria-label={image.alt}>
      {inner}
    </div>
  )
}

/** EntityMoment — emotional image + message band for entity pages.
 *  Purpose: replace dry explanatory card stacks with one human "I see myself"
 *  moment per audience. The image is atmosphere, not evidence. */
export function EntityMoment({
  eyebrow,
  title,
  body,
  image,
  points,
}: {
  eyebrow: string
  title: string
  body: string
  image: { src: string; alt: string; position?: string }
  points: string[]
}) {
  return (
    <section className="mk-entity-moment" aria-label={eyebrow}>
      <div className="mk-container mk-entity-moment__grid">
        <div className="mk-entity-moment__media" role="img" aria-label={image.alt}>
          <span
            className="mk-entity-moment__image"
            aria-hidden="true"
            style={{ backgroundImage: `url('${image.src}')`, backgroundPosition: image.position ?? 'center' }}
          />
        </div>
        <div className="mk-entity-moment__copy">
          <p className="mk-entity-moment__eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{body}</p>
          <ul>
            {points.map((point) => (
              <li key={point}>
                <Icon id="confirm" size={14} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/** FirewallCard — protection semantics (dark, warm-guard outline). */
export function FirewallCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="mk-firewall-card">
      <span className="mk-firewall-card__shield" aria-hidden="true">
        <Icon id="lock" size={16} />
      </span>
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: '1rem',
            fontWeight: 800,
            lineHeight: 1.3,
            color: 'var(--color-paper)',
            margin: '0 0 0.35rem',
          }}
        >
          {title}
        </h3>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'rgba(243,245,239,0.68)', margin: 0 }}>
          {body}
        </p>
      </div>
    </article>
  )
}
