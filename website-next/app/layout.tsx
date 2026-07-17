import type { Metadata } from 'next'
import Script from 'next/script'
import { Manrope, DM_Mono } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { LocaleProvider } from '@/lib/locale-context'
import { ConsentBanner } from '@/components/consent-banner'
import { SAME_AS, WHATSAPP_E164, CONTACT_POINTS } from '@/lib/social'

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
    default: 'LOCK — Private Radar and public Passport for artist booking context',
    template: '%s | LOCK',
  },
  description:
    'LOCK helps artists, representation teams, production offices and buyers share clearer pre-booking context through a private Radar and a public Passport.',
  keywords: [
    'artist booking context',
    'artist passport',
    'private artist radar',
    'live performance context',
    'artist representation',
    'production office',
    'private event artist',
    'booking buyer',
    'מזמין הופעות',
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
        alt: 'LOCK — private Radar and public Passport for artist booking context',
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
        'Pre-booking context tool for artists, representation teams, production offices and buyers.',
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
      // Verified profiles — search + AI answer-engines use sameAs to bind the
      // brand to its official channels (single source: lib/social.ts).
      sameAs: SAME_AS,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          telephone: WHATSAPP_E164,
          areaServed: 'IL',
          availableLanguage: ['he', 'en'],
        },
        ...CONTACT_POINTS.map((c) => ({
          '@type': 'ContactPoint',
          contactType: c.contactType,
          email: c.email,
          areaServed: 'IL',
          availableLanguage: ['he', 'en'],
        })),
      ],
      description:
        'LOCK helps artists organize private context in a Radar and publish a controlled Passport for booking conversations.',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: 'LOCK — Artist Radar and Passport',
      url: SITE_URL,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'A pre-booking context tool for the live-music industry: artists organize sources in a private Radar and approve a public Passport for buyers, representation teams and production offices — no scores, percentiles or predictions.',
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
          'Free pilot access. No public paid plan is active yet.',
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
