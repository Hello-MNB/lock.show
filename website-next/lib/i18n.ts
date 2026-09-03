/**
 * LOCK i18n — minimal, dependency-free.
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

export interface Messages {
  consent: {
    ariaLabel: string
    message: string
    privacyLink: string
    accept: string
    decline: string
    preferences: string
  }
}
