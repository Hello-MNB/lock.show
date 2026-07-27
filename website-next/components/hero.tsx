import type { CSSProperties, ReactNode } from 'react'

/**
 * Shared hero band — T-97 hero system.
 *
 * Exactly 4 approved variants; all min-heights / paddings / rhythm come from
 * styles/hero.css tokens (the ONLY place those numbers live). This component
 * owns band STRUCTURE only — each page keeps its own content, imagery, and
 * full-bleed background via `style` / `className` / children.
 *
 * Contract (scripts/test-hero-contract.mjs):
 *   - every public hero page renders <Hero variant="…"> with an approved
 *     variant string literal
 *   - pages must not set their own hero min-height — the token file does
 *
 * Rhythm inside the band is consumed via CSS vars set per variant:
 *   var(--hero-gap-eyebrow)  eyebrow → h1
 *   var(--hero-gap-h1)       h1 → description
 *   var(--hero-gap-desc)     description → CTA row
 *   var(--hero-desc-max-w)   description measure (feature/primary: 520px)
 */

export type HeroVariant = 'feature' | 'primary' | 'standard' | 'compact'
export type HeroAlign = 'center' | 'end' | 'start'

export function Hero({
  variant,
  align = 'start',
  legal = false,
  className,
  style,
  children,
}: {
  variant: HeroVariant
  /** vertical content alignment inside the band (page-preserved structure) */
  align?: HeroAlign
  /** compact legal sub-flavor: pad-bottom 32 (terms/privacy/accessibility) */
  legal?: boolean
  className?: string
  /** page-specific surface: background imagery, colors, borders — NOT sizing */
  style?: CSSProperties
  children: ReactNode
}) {
  const cls = [
    'hero',
    `hero--${variant}`,
    `hero--align-${align}`,
    legal ? 'hero--legal' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <section className={cls} style={style}>
      {children}
    </section>
  )
}
