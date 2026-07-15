import type { Metadata } from 'next'

export const SITE_URL = 'https://lock.show'
export const DEFAULT_OG_IMAGE = '/og/og-default.png'

export type PageSeoKey =
  | 'home'
  | 'artists'
  | 'managers'
  | 'production'
  | 'bookers'
  | 'sourceConfirmers'
  | 'passportDemo'
  | 'radar'
  | 'howItWorks'
  | 'methodology'
  | 'freePilot'
  | 'faq'
  | 'contact'

type SeoEntry = {
  path: string
  title: string
  description: string
  audience: string
  intent: string
  keywords: string[]
  image?: string
}

export const PAGE_SEO: Record<PageSeoKey, SeoEntry> = {
  home: {
    path: '/',
    title: 'LOCK — Private Radar and public Passport for artist booking context',
    description:
      'LOCK helps artists turn shows, sources, links and context into a private Radar and a public Passport that booking people can understand before a call.',
    audience: 'Artists, artist representatives, production offices, professional buyers and private event clients',
    intent: 'Understand what LOCK is and choose the right lane',
    keywords: ['artist passport', 'artist booking context', 'pre-booking proof', 'music booking Israel'],
  },
  artists: {
    path: '/artists',
    title: 'LOCK for Artists — improve your career context without being scored',
    description:
      'A private Radar helps artists organize links, shows and sources, then choose what becomes a public Passport. No scores, no rankings, no public weakness language.',
    audience: 'Independent artists, DJs, live acts and performers',
    intent: 'Help artists understand the value of Radar and Passport',
    keywords: ['artist growth tool', 'DJ booking profile', 'artist EPK alternative', 'artist passport'],
  },
  managers: {
    path: '/managers',
    title: 'LOCK for Representation — make every roster pitch clearer',
    description:
      'For artist managers, booking agents and representation teams: see roster readiness, scoped access and one clear next action per artist.',
    audience: 'Artist managers, booking agents, representation offices and roster teams',
    intent: 'Explain how representation teams use LOCK without implying artist ownership',
    keywords: ['artist management software', 'artist roster tool', 'booking agent workflow', 'artist representation'],
  },
  production: {
    path: '/production',
    title: 'LOCK for Production — build lineups with clearer artist context',
    description:
      'For production offices and event teams: collect artist context, requests and replies in one workspace before lineup commitment.',
    audience: 'Independent producers, production offices, event teams and festival operations',
    intent: 'Position Production as an event and lineup workspace, not a source confirmer',
    keywords: ['event production artist booking', 'lineup planning', 'artist context for production'],
  },
  bookers: {
    path: '/bookers',
    title: 'LOCK for Buyers — understand the artist before you say yes',
    description:
      'Open a Passport without an account and understand whether an artist fits a room, wedding, private event, venue or production context.',
    audience: 'Professional bookers, venue buyers, promoters, corporate buyers and private clients',
    intent: 'Help buyers understand artist fit without becoming a workspace user',
    keywords: ['book artist for event', 'artist booking check', 'wedding DJ context', 'private event artist'],
  },
  sourceConfirmers: {
    path: '/producers',
    title: 'LOCK for Source Confirmers — one link, one claim, no account',
    description:
      'Confirm one artist detail through a bounded magic link. No dashboard, no account and no ongoing role.',
    audience: 'People who personally witnessed or can confirm one artist-related detail',
    intent: 'Clarify source confirmation as a one-time bounded action',
    keywords: ['source confirmation', 'artist proof confirmation', 'music event confirmation'],
  },
  passportDemo: {
    path: '/passport/demo',
    title: 'Sample Artist Passport — Shidapu demo',
    description:
      'See how an artist Passport presents identity, genre, media, source labels and public-safe context without scores or rankings.',
    audience: 'Artists, buyers, representation teams and production offices evaluating LOCK',
    intent: 'Show the product outcome as a visual proof artifact',
    keywords: ['artist passport example', 'DJ passport', 'artist booking profile example'],
  },
  radar: {
    path: '/radar',
    title: 'Artist Radar — private workspace for booking context',
    description:
      'The private Radar helps artists see what LOCK found, what is missing and what to improve before anything becomes public.',
    audience: 'Artists and teams helping artists prepare stronger booking context',
    intent: 'Explain the private intelligence layer behind the Passport',
    keywords: ['artist radar', 'artist proof workspace', 'booking readiness tool'],
  },
  howItWorks: {
    path: '/how-it-works',
    title: 'How LOCK works — from one link to a Passport you control',
    description:
      'Start with one link. LOCK organizes sources in a private Radar, helps the artist review context and creates a public Passport only after approval.',
    audience: 'All LOCK audiences',
    intent: 'Answer process questions in a simple step-by-step format',
    keywords: ['how artist passport works', 'pre-booking workflow', 'artist proof process'],
  },
  methodology: {
    path: '/methodology',
    title: 'LOCK Methodology — source labels, privacy and no scores',
    description:
      'LOCK shows how each public detail was sourced, what stays private and why Passports never include scores, rankings or predictions.',
    audience: 'Trust-sensitive visitors, artists, buyers and partners',
    intent: 'Build trust for search and answer engines by explaining the method',
    keywords: ['artist proof methodology', 'source labels', 'no artist scores', 'artist privacy'],
  },
  freePilot: {
    path: '/pricing',
    title: 'LOCK Free Pilot — no plans, no payment, no scores',
    description:
      'LOCK is free during the pilot while artists, buyers, representation teams and production offices help validate what creates real value.',
    audience: 'Pilot participants and early adopters',
    intent: 'Clarify pricing is not launched and remove payment anxiety',
    keywords: ['LOCK free pilot', 'artist booking beta', 'free artist passport'],
  },
  faq: {
    path: '/faq',
    title: 'LOCK FAQ — artists, buyers, Passports and Radar',
    description:
      'Answers about LOCK, artist Passports, the private Radar, buyers, source labels, privacy and the free pilot.',
    audience: 'Visitors comparing or validating LOCK',
    intent: 'Answer common questions directly for SEO, AEO and GEO',
    keywords: ['LOCK FAQ', 'artist passport questions', 'artist radar questions'],
  },
  contact: {
    path: '/contact',
    title: 'Contact LOCK — join the free pilot or ask about your role',
    description:
      'Contact LOCK if you are an artist, representation office, production team, buyer or partner exploring the free pilot.',
    audience: 'Pilot leads, partners, press and support contacts',
    intent: 'Route interested visitors to the correct next step',
    keywords: ['contact LOCK', 'artist booking pilot', 'LOCK pilot'],
  },
}

export function buildPageMetadata(
  key: PageSeoKey,
  override?: Partial<Pick<SeoEntry, 'title' | 'description'>>,
): Metadata {
  const entry = PAGE_SEO[key]
  const title = override?.title ?? entry.title
  const description = override?.description ?? entry.description
  const image = entry.image ?? DEFAULT_OG_IMAGE
  return {
    alternates: { canonical: entry.path },
    title,
    description,
    keywords: entry.keywords,
    openGraph: {
      url: entry.path,
      title,
      description,
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export function buildWebPageJsonLd(key: PageSeoKey) {
  const entry = PAGE_SEO[key]
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}${entry.path}#webpage`,
    url: `${SITE_URL}${entry.path}`,
    name: entry.title,
    description: entry.description,
    audience: {
      '@type': 'Audience',
      audienceType: entry.audience,
    },
    about: entry.intent,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: ['en', 'he'],
  }
}
