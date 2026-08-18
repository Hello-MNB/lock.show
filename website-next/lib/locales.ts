// Locale registry — the single source of truth for which languages the
// MARKETING SITE serves as real, indexable, server-rendered routes, and
// their status. This is a registry only: adding a locale here does NOT ship
// it — it declares the contract so shipping it later is a content +
// route-tree change, not a rediscovery of what hreflang/x-default/dir a new
// locale needs (owner scope: "so adding them later is config not surgery").
//
// STATUS MEANING:
//   'active'   — real server-rendered page bodies exist at this locale's
//                routes; eligible for hreflang alternates + sitemap entries.
//   'inactive' — reserved (planned RU/DE), no routes exist yet; carries NO
//                hreflang tag until routes ship (an hreflang pointing at a
//                URL that 404s is worse than no hreflang at all).
//
// TODAY: only 'en' is active. The site's runtime EN/HE toggle (nav.tsx,
// lib/locale-context.tsx) is real but scoped to chrome only (nav/footer/
// consent copy) — see that file's own honest-scope comment. It does NOT
// mean a `he` route tree with server-rendered, natively-reviewed page
// bodies exists; that is a separate, larger build (see docs "he route
// migration" note) gated on real Hebrew marketing copy from a native
// reviewer, not on engineering effort alone. Marking `he` 'active' here
// before that copy exists would be exactly the "silently ship untested
// copy" failure mode this registry exists to prevent.
export type LocaleStatus = 'active' | 'inactive'

export interface LocaleDef {
  /** BCP-47 / hreflang code. */
  code: string
  label: string
  dir: 'ltr' | 'rtl'
  status: LocaleStatus
  /**
   * Whether this locale has natively-reviewed page-BODY copy (not just
   * chrome). A locale can be 'active' at the ROUTE level while individual
   * pages are still `nativeReview: false` during a phased rollout — that
   * per-page flag lives with the page content, this is the registry-wide
   * default expectation.
   */
  nativeReviewRequired: boolean
}

export const LOCALES: readonly LocaleDef[] = [
  { code: 'en', label: 'English', dir: 'ltr', status: 'active', nativeReviewRequired: false },
  { code: 'he', label: 'עברית', dir: 'rtl', status: 'inactive', nativeReviewRequired: true },
  { code: 'ru', label: 'Русский', dir: 'ltr', status: 'inactive', nativeReviewRequired: true },
  { code: 'de', label: 'Deutsch', dir: 'ltr', status: 'inactive', nativeReviewRequired: true },
] as const

export const ACTIVE_LOCALES: readonly LocaleDef[] = LOCALES.filter((l) => l.status === 'active')

export const DEFAULT_LOCALE_CODE = 'en'
