import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /app is the embedded product SPA (private tool screens, auth
        // walls, and a duplicate HTML shell) — not marketing content, and it
        // must not be indexed or compete with the marketing pages above it.
        disallow: ['/app', '/app/*'],
      },
    ],
    sitemap: 'https://lock.show/sitemap.xml',
    host: 'https://lock.show',
  }
}
