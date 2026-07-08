import type { Metadata } from 'next'
import Script from 'next/script'
import { Manrope, DM_Mono } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { LocaleProvider } from '@/lib/locale-context'
import { ConsentBanner } from '@/components/consent-banner'

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

// GA4 — property LOCK (544738110), stream LOCK App; env can override
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
    default: 'LOCK — Booking Proof for Independent Artists',
    template: '%s | LOCK',
  },
  description:
    'Standardized, method-labeled proof of live performance for independent artists. Built for booking managers who need to verify before they risk their name.',
  keywords: [
    'artist booking proof',
    'live performance verification',
    'booking manager',
    'artist passport',
    'אמרגן',
    'אמן',
    'LOCK',
    'verified gig history',
    'music industry verification',
  ],
  authors: [{ name: 'LOCK', url: SITE_URL }],
  creator: 'LOCK',
  publisher: 'LOCK',
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
    alternateLocale: 'he_IL',
    siteName: 'LOCK',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'LOCK — Booking Proof for Independent Artists',
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
  alternates: {
    // No /he route ships yet (see messages/he.json — used for in-page locale
    // toggle only, not a separate URL). Declaring an 'he' hreflang alternate
    // that 404s is an SEO error, so we keep a single-locale canonical until a
    // Hebrew route exists.
    canonical: SITE_URL,
  },
  icons: {
    icon: [{ url: '/favicon.ico' }],
    apple: [{ url: '/app/apple-touch-icon.png' }],
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
      name: 'LOCK',
      description:
        'Pre-booking proof and risk-reduction tool for independent artists and booking managers.',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: ['en', 'he'],
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'LOCK',
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
      description:
        'LOCK provides standardized, method-labeled proof of live performance for independent artists. Free for booking managers.',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: 'LOCK — Bookability Passport',
      url: SITE_URL,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'A verification tool for the live-music industry: independent artists build a standardized, method-labeled record of their live performance history, and booking managers (אמרגנים) review it before booking — no scores, percentiles, or predictions, only labeled evidence.',
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: {
        '@type': 'Country',
        name: 'Israel',
      },
      inLanguage: ['en', 'he'],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description:
          'Free, unlimited access for booking managers to review a Passport. Artist access is by arrangement during the closed beta — no public pricing tier is locked yet.',
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
