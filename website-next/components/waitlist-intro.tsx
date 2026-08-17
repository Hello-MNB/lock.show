'use client'

/**
 * The approved waitlist header copy, rendered from the SAME source the form
 * uses so the page and the form can never drift into two different promises.
 * Every string here is the B4-70.10 §10.1 approved microcopy baseline, verbatim
 * — eyebrow, H1, support line. Nothing on this page is generated copy.
 */
import { useLocale } from '../lib/locale-context'
import { WAITLIST_COPY } from './waitlist-join-form'

export function WaitlistIntro() {
  const { locale, dir } = useLocale()
  const t = WAITLIST_COPY[locale] ?? WAITLIST_COPY.en
  return (
    <header dir={dir}>
      <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--color-stamp-onlight)', textTransform: 'uppercase', margin: '0 0 16px' }}>
        {t.eyebrow}
      </p>
      <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', lineHeight: 1.15, color: 'var(--color-ink)', margin: '0 0 16px', fontWeight: 800 }}>
        {t.h1}
      </h1>
      <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--color-tally-onlight)', margin: 0 }}>
        {t.support}
      </p>
    </header>
  )
}
