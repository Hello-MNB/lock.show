/**
 * PUBLIC CONVERSION MODE — the single switch for every primary CTA.
 *
 * B4-70.10 §10.1 (Maria, 17 Aug 2026): the public site launches as a waitlist
 * acquisition surface while the application is completed. This is a temporary
 * conversion MODE, not a new website, and the contract is explicit that a
 * return to signup must be "one configuration change plus a tested deployment,
 * not mass content edits".
 *
 * That is why every primary CTA resolves through this one helper. Nothing
 * page-level knows which mode is active; flipping NEXT_PUBLIC_CONVERSION_MODE
 * moves all of them at once, and the rollback test asserts exactly that.
 *
 * LOGIN IS NOT A CONVERSION CTA and never routes through here — invited users
 * must keep reaching the app in either mode (§10.1: "Login remains available").
 */
import { APP_URL } from './app-url'
import type { Locale } from './i18n'

export type ConversionMode = 'waitlist' | 'signup'

/** The six Entity/Roles. §10.1 forbids collapsing producer, programmer,
 *  booking manager and representative into one role, so they stay distinct
 *  here and in the form, the DB constraint and the analytics dimension. */
export type EntityRole =
  | 'artist'
  | 'representative_agency'
  | 'producer_promoter'
  | 'programmer_booker_buyer'
  | 'venue'
  | 'other'

export const ENTITY_ROLES: EntityRole[] = [
  'artist', 'representative_agency', 'producer_promoter',
  'programmer_booker_buyer', 'venue', 'other',
]

/**
 * Waitlist is the DEFAULT so a missing env var fails toward the safe state:
 * an un-set variable must not silently send visitors to a signup the release
 * has not opened yet.
 */
export const CONVERSION_MODE: ConversionMode =
  process.env.NEXT_PUBLIC_CONVERSION_MODE === 'signup' ? 'signup' : 'waitlist'

export const WAITLIST_PATH = '/waitlist'

export interface ConversionContext {
  /** Which page the CTA sits on — first-party attribution. */
  page: string
  /** Where on the page (nav | hero | footer | pricing-card | …). */
  placement: string
  /** Intended Entity context, when the surface implies one. */
  entity?: EntityRole
}

/**
 * The destination for a primary CTA.
 *
 * §10.1: waitlist entry "preserves source page, CTA placement, locale,
 * campaign/UTM and intended Entity context WITHOUT PUTTING SENSITIVE DATA IN
 * THE URL". Page, placement and entity are non-sensitive routing context. UTM
 * is deliberately NOT copied here — it is read from the live URL at submit
 * time, so it never has to be marshalled through a link.
 */
export function conversionHref(ctx: ConversionContext): string {
  if (CONVERSION_MODE === 'signup') {
    const q = new URLSearchParams({ utm_source: 'site', utm_campaign: ctx.page, utm_content: ctx.placement })
    if (ctx.entity === 'artist') q.set('role', 'artist')
    return `${APP_URL}/signup?${q.toString()}`
  }
  const q = new URLSearchParams({ src: ctx.page, placement: ctx.placement })
  if (ctx.entity) q.set('entity', ctx.entity)
  return `${WAITLIST_PATH}?${q.toString()}`
}

/** Login target — identical in both modes, by contract. */
export function loginHref(): string {
  return `${APP_URL}/login`
}

/**
 * APPROVED CTA LABEL, verbatim from B4-70.10 §10.1. Not paraphrased and not
 * generated: the EN and HE strings below are the approved microcopy baseline.
 */
const CTA_LABEL: Record<ConversionMode, Record<Locale, string>> = {
  waitlist: { en: 'JOIN THE WAITLIST', he: 'הצטרפות לרשימת ההמתנה' },
  signup:   { en: 'GET STARTED',       he: 'התחלה' },
}

export function conversionLabel(locale: Locale = 'en'): string {
  return CTA_LABEL[CONVERSION_MODE][locale] ?? CTA_LABEL[CONVERSION_MODE].en
}

/** Analytics label for a CTA click — no PII, per §10.1. */
export function conversionEvent(): 'waitlist_cta_click' | 'signup_cta_click' {
  return CONVERSION_MODE === 'waitlist' ? 'waitlist_cta_click' : 'signup_cta_click'
}
