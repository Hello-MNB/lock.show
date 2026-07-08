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
    { path: '',               priority: 1.0,  changeFrequency: 'weekly'  },
    { path: '/passport/demo', priority: 0.95, changeFrequency: 'monthly' },
    { path: '/artists',       priority: 0.9,  changeFrequency: 'monthly' },
    { path: '/bookers',       priority: 0.9,  changeFrequency: 'monthly' },
    { path: '/producers',     priority: 0.85, changeFrequency: 'monthly' },
    { path: '/how-it-works',  priority: 0.85, changeFrequency: 'monthly' },
    { path: '/methodology',   priority: 0.8,  changeFrequency: 'monthly' },
    { path: '/pricing',       priority: 0.8,  changeFrequency: 'monthly' },
    { path: '/radar',         priority: 0.75, changeFrequency: 'monthly' },
    { path: '/faq',           priority: 0.7,  changeFrequency: 'monthly' },
    { path: '/contact',       priority: 0.65, changeFrequency: 'monthly' },
    { path: '/privacy',       priority: 0.3,  changeFrequency: 'yearly'  },
    { path: '/terms',         priority: 0.3,  changeFrequency: 'yearly'  },
    { path: '/accessibility', priority: 0.3,  changeFrequency: 'yearly'  },
  ]

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
