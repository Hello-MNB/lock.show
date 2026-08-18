import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

// Canonical www origin from lib/site.ts (owner ruling D2) — never a literal here.
const BASE = SITE_URL

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const pages: Array<{
    path: string
    priority: number
    changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'always' | 'hourly' | 'never'
  }> = [
    // Priorities per owner spec: home 1.0; personas 0.8; methodology/
    // how-it-works 0.7; pricing 0.6; faq/radar/contact 0.5.
    //
    // DELIBERATELY ABSENT (do not re-add without an owner ruling):
    // - /privacy /terms /accessibility — D6: noindex + out of sitemap until
    //   the owner supplies the legal facts and review completes.
    // - /passport/demo — D5: fictional sample profile, noindex + out of
    //   sitemap (a fabricated history must never be an indexation target).
    // - /app/* — private product surface, noindexed via X-Robots-Tag + meta.
    { path: '',               priority: 1.0,  changeFrequency: 'weekly'  },
    { path: '/artists',       priority: 0.8,  changeFrequency: 'monthly' },
    { path: '/bookers',       priority: 0.8,  changeFrequency: 'monthly' },
    { path: '/producers',     priority: 0.8,  changeFrequency: 'monthly' },
    { path: '/how-it-works',  priority: 0.7,  changeFrequency: 'monthly' },
    { path: '/methodology',   priority: 0.7,  changeFrequency: 'monthly' },
    { path: '/pricing',       priority: 0.6,  changeFrequency: 'monthly' },
    { path: '/radar',         priority: 0.5,  changeFrequency: 'monthly' },
    { path: '/faq',           priority: 0.5,  changeFrequency: 'monthly' },
    { path: '/contact',       priority: 0.5,  changeFrequency: 'monthly' },
  ]

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
