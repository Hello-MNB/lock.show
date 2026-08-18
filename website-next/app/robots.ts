import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // NO `Disallow: /app` — deliberate inversion (T-96 step ③, C12 fix):
        // /app/* is de-indexed by an explicit noindex directive instead —
        // X-Robots-Tag: noindex, nofollow (website-next/vercel.json headers)
        // plus <meta name="robots" content="noindex, nofollow"> in every
        // committed /app/**/index.html shell. A robots Disallow would BLOCK
        // crawling, so Google could never read those noindex directives and
        // the blocked URLs could still be indexed URL-only ("indexed, though
        // blocked by robots.txt"). Crawl must stay open for noindex to work.
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
