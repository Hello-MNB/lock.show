import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const BASE = 'https://lock.show'
const LAST_MODIFIED = new Date('2026-09-03T00:00:00Z')

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: '', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/how-it-works', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/artists', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/professionals', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/trust', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/faq', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/early-access', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/sample', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.2, changeFrequency: 'yearly' as const },
    { path: '/accessibility', priority: 0.2, changeFrequency: 'yearly' as const },
  ]

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: LAST_MODIFIED,
    changeFrequency,
    priority,
  }))
}
