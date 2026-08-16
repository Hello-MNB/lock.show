import { ACTIVE_LOCALES } from './locales'

// Single source of truth for the site's canonical origin (owner ruling D2,
// docs/SEO-CHANGELOG.md Entry 2): canonical host = WWW. The apex
// (lock.show) 308-redirects to www at the Vercel domain layer — every
// canonical, sitemap URL, robots reference, OG url and JSON-LD @id must be
// minted on this origin and nowhere else.
export const SITE_URL = 'https://www.lock.show'

/** Absolute URL on the canonical origin: absoluteUrl('/pricing') → https://www.lock.show/pricing */
export function absoluteUrl(path = '/'): string {
  return new URL(path, SITE_URL).toString()
}

/**
 * `alternates` for an INDEX-class marketing page: canonical + reciprocal
 * hreflang for every ACTIVE locale + x-default. Today ACTIVE_LOCALES = [en]
 * only, so this emits a self-referencing `en` + `x-default` pair — that is
 * correct (not a placeholder): Google's own guidance is to declare
 * x-default whenever a language/region selector exists on the page (the
 * site's EN/HE nav toggle is exactly that), even before a second indexed
 * locale ships. The moment `he` (or ru/de) flips to 'active' in
 * lib/locales.ts AND gets its own route tree, this function starts emitting
 * the reciprocal pair automatically — no page file needs to change.
 *
 * NOINDEX-class pages (legal/demo/404) intentionally do NOT call this —
 * hreflang on a noindexed URL is a contradictory signal search engines
 * ignore, so those pages keep a bare `{ canonical }`.
 */
export function localeAlternates(path: string): {
  canonical: string
  languages: Record<string, string>
} {
  const languages: Record<string, string> = {}
  for (const locale of ACTIVE_LOCALES) {
    // en pages live unprefixed at the bare path; a future locale's route
    // prefix (e.g. /he/artists) is that locale's own concern to resolve —
    // this stays a plain path→URL map keyed by hreflang code.
    languages[locale.code] = absoluteUrl(path)
  }
  languages['x-default'] = absoluteUrl(path)
  return { canonical: path, languages }
}
