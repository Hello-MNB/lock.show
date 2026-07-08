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
    card: 'summary_large_image',
    site: '@lock',
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'en': SITE_URL,
      'he': `${SITE_URL}/he`,
    },
  },
}

// JSON-LD: WebSite + Organization schema
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
      description:
        'LOCK provides standardized, method-labeled proof of live performance for independent artists. Free for booking managers.',
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
