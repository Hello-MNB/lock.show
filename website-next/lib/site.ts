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
