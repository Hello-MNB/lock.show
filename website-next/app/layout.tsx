import type { Metadata } from 'next'
import Script from 'next/script'
import { Manrope, DM_Mono } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { LocaleProvider } from '@/lib/locale-context'
import { ConsentBanner } from '@/components/consent-banner'
import { SAME_AS, CONTACT_POINTS } from '@/lib/social'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-heebo',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-space-mono',
  display: 'swap',
})

// GA4 — property LOCK SHOW (544738110), stream LOCK SHOW App; env can override
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-ZX907M2NY8'

const SITE_URL = 'https://lock.show'
const OG_IMAGE = `${SITE_URL}/og/og-default.png`

// Next.js App Router viewport export
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111612',
} as const

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'LOCK SHOW — Trust on Cue',
    template: '%s | LOCK SHOW',
  },
  description:
    'A private RADAR for understanding professional signals, and an owner-approved PASSPORT for sharing selected evidence with confidence.',
  keywords: [
    'artist intelligence radar',
    'live performance verification',
    'artist passport',
    'artist passport',
    'אמרגן',
    'אמן',
    'LOCK SHOW',
    'verified gig history',
    'music industry verification',
  ],
  authors: [{ name: 'LOCK SHOW', url: SITE_URL }],
  creator: 'LOCK SHOW',
  publisher: 'LOCK SHOW',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    // No alternateLocale: page bodies are EN-only today (locale toggle covers
    // nav/footer/consent copy only, not page content — T-84 HE-scope note).
    // Claiming he_IL here would overclaim translated content that doesn't exist.
    siteName: 'LOCK SHOW',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'LOCK SHOW — Trust on Cue',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    // No verified @lock handle exists yet — omit `site`/`creator` rather than
    // claim a handle that may belong to someone else. Add back once secured.
    card: 'summary_large_image',
    images: [OG_IMAGE],
  },
  // Canonical is declared PER PAGE (relative, resolved via metadataBase) —
  // a global canonical here made every subpage claim the homepage as its
  // canonical (audit G8 finding: site-wide duplicate signal). No /he hreflang
  // until a real Hebrew route exists.
  icons: {
    icon: [{ url: '/brand/lockshow-symbol-spotlight-lens-v2-lime-on-ink.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.png', type: 'image/png' }],
  },
}

// JSON-LD: WebSite + Organization + SoftwareApplication schema.
// No SearchAction on WebSite — the site has no internal search.
// No aggregateRating / review anywhere — firewall: no scores, and we have none.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'LOCK SHOW',
      description:
    'A private evidence-led RADAR and an owner-approved public PASSPORT for live-entertainment professionals.',
      publisher: { '@id': `${SITE_URL}/#organization` },
      // 'en' only: page bodies are English-only today; the locale toggle
      // covers nav/footer/consent copy, not page content (T-84 HE-scope note).
      inLanguage: ['en'],
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'LOCK SHOW',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: OG_IMAGE,
      },
      foundingLocation: {
        '@type': 'Place',
        name: 'Tel Aviv, Israel',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Tel Aviv',
        addressCountry: 'IL',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Israel',
      },
      // Verified profiles — search + AI answer-engines use sameAs to bind the
      // brand to its official channels (single source: lib/social.ts).
      sameAs: SAME_AS,
      contactPoint: [
        ...CONTACT_POINTS.map((c) => ({
          '@type': 'ContactPoint',
          contactType: c.contactType,
          email: c.email,
          areaServed: 'IL',
          availableLanguage: ['he', 'en'],
        })),
      ],
      description:
        'LOCK SHOW turns permissioned professional evidence into a private RADAR and a public PASSPORT approved by its owner.',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: 'LOCK SHOW — RADAR and PASSPORT',
      url: SITE_URL,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'An evidence-led workspace for live entertainment: people build a private RADAR, then publish only selected, method-labeled evidence in an owner-approved PASSPORT.',
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: {
        '@type': 'Country',
        name: 'Israel',
      },
      // 'en' only — see WebSite node above for the same HE-scope note.
      inLanguage: ['en'],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description:
          'Public PASSPORT viewing is free. Private RADAR access is available during the pilot.',
      },
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${manrope.variable} ${dmMono.variable} antialiased`}
        style={{
          fontFamily: 'var(--font-heebo), Manrope, system-ui, sans-serif',
          backgroundColor: 'var(--color-night)',
          color: 'var(--color-paper)',
        }}
      >
        <LocaleProvider>
          <Nav />
          {children}
          <Footer />
          <ConsentBanner gaId={GA_ID} />
        </LocaleProvider>
        {/* GA4 Consent Mode v2 — defaults DENIED; gtag.js loads only after the
            visitor grants consent in the banner (docs/legal/CONSENT-BANNER-SPEC.md) */}
        <Script id="ga4-consent-default" strategy="beforeInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied', analytics_storage: 'denied',
  ad_user_data: 'denied', ad_personalization: 'denied',
  wait_for_update: 500
});
gtag('js', new Date());`}
        </Script>
      </body>
    </html>
  )
}
