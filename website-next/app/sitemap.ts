import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const BASE = 'https://lock.show'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const pages: Array<{
    path: string
    priority: number
    changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'always' | 'hourly' | 'never'
  }> = [
    // Priorities per owner spec: home 1.0; personas 0.8; methodology/
    // how-it-works 0.7; pricing 0.6; faq/radar/contact 0.5; legal 0.2.
    // /passport/demo isn't in any named tier — it's the flagship proof
    // artifact (closest thing to a product demo), so it sits with the
    // personas at 0.8 rather than inventing an unlisted priority band.
    { path: '',               priority: 1.0,  changeFrequency: 'weekly'  },
    { path: '/passport/demo', priority: 0.8,  changeFrequency: 'monthly' },
    { path: '/artists',       priority: 0.8,  changeFrequency: 'monthly' },
    { path: '/bookers',       priority: 0.8,  changeFrequency: 'monthly' },
    { path: '/producers',     priority: 0.8,  changeFrequency: 'monthly' },
    { path: '/managers',      priority: 0.8,  changeFrequency: 'monthly' }, // S9 outreach — artist-side offices
    { path: '/production',    priority: 0.8,  changeFrequency: 'monthly' }, // S9 outreach — production offices
    { path: '/how-it-works',  priority: 0.7,  changeFrequency: 'monthly' },
    { path: '/methodology',   priority: 0.7,  changeFrequency: 'monthly' },
    // '/pricing' unpublished (owner, 12 Jul night — S8 beta focus; redirects to /artists)
    { path: '/radar',         priority: 0.5,  changeFrequency: 'monthly' },
    { path: '/faq',           priority: 0.5,  changeFrequency: 'monthly' },
    { path: '/contact',       priority: 0.5,  changeFrequency: 'monthly' },
    { path: '/privacy',       priority: 0.2,  changeFrequency: 'yearly'  },
    { path: '/terms',         priority: 0.2,  changeFrequency: 'yearly'  },
    { path: '/accessibility', priority: 0.2,  changeFrequency: 'yearly'  },
  ]

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
