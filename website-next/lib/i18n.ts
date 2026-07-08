/**
 * GIGPROOF i18n — minimal, dependency-free.
 *
 * Phase 1: EN + HE scaffolded.
 * Phase 2: RU + DE (requires native-editor pass before shipping).
 *
 * Usage (server component):
 *   import { getMessages } from '@/lib/i18n'
 *   const t = await getMessages('en')
 *   t.nav.artists  // "For Artists"
 *
 * Usage (client component):
 *   const { locale } = useParams()
 *   // pass messages as props from parent server component
 *
 * NOTE: Method labels (TICKET EXPORT, PRODUCER-CONFIRMED, etc.) are NOT
 * translated — they are identity marks, rendered identically in all locales.
 */

export type Locale = 'en' | 'he'

export const SUPPORTED_LOCALES: Locale[] = ['en', 'he']
export const DEFAULT_LOCALE: Locale = 'en'
export const RTL_LOCALES: Locale[] = ['he']

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale)
}

export function isValidLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale)
}

/**
 * Load messages for a locale.
 * Falls back to 'en' if locale messages are missing.
 */
export async function getMessages(locale: Locale = DEFAULT_LOCALE) {
  try {
    // Dynamic import — Next.js will code-split per locale
    const messages = await import(`../messages/${locale}.json`)
    return messages.default as Messages
  } catch {
    // Fallback to EN
    const messages = await import('../messages/en.json')
    return messages.default as Messages
  }
}

// ─── Type definitions ──────────────────────────────────────────────────────
// Derived from messages/en.json — keep in sync.

export interface Messages {
  consent: {
    ariaLabel: string
    message: string
    privacyLink: string
    accept: string
    decline: string
    preferences: string
  }
  nav: {
    artists: string
    bookers: string
    producers: string
    howItWorks: string
    methodology: string
    pricing: string
    getStarted: string
    openMenu: string
    closeMenu: string
  }
  footer: {
    tagline: string
    entityNotice: string
    firewallNotice: string
    copyright: string
    privacy: string
    terms: string
    accessibility: string
    consentPrefs: string
    contact: string
  }
  home: {
    hero: {
      badge: string
      headline: string
      sub: string
      ctaBuild: string
      ctaDemo: string
    }
    firewall: string
    actors: {
      heading: string
      sub: string
      artist: { tag: string; title: string; body: string; cta: string }
      booker: { tag: string; title: string; body: string; cta: string }
      producer: { tag: string; title: string; body: string; cta: string }
    }
    ctaFinal: { heading: string; sub: string; cta: string }
  }
  passport: {
    demoBanner: string
    footer: string
    sections: {
      draw: string
      performance: string
      community: string
      readiness: string
      feeContext: string
    }
    methodLabels: {
      ticketExport: string
      producerConfirmed: string
      platformData: string
      operatorReviewed: string
      selfReported: string
    }
    bandNote: string
    streamingNote: string
  }
  methodology: {
    firewallPrinciple: string
    methodLabels: Record<string, { label: string; desc: string }>
  }
  common: {
    reviewed: string
    sampleFictional: string
    closedBeta: string
    telAviv: string
  }
}
