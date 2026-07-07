import type { Metadata } from 'next'
import { Manrope, DM_Mono } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { LocaleProvider } from '@/lib/locale-context'

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

const SITE_URL = 'https://gigproof.co'
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
    default: 'GIGPROOF — Booking Proof for Independent Artists',
    template: '%s | GIGPROOF',
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
    'GIGPROOF',
    'verified gig history',
    'music industry verification',
  ],
  authors: [{ name: 'GIGPROOF', url: SITE_URL }],
  creator: 'GIGPROOF',
  publisher: 'GIGPROOF',
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
    siteName: 'GIGPROOF',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'GIGPROOF — Booking Proof for Independent Artists',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gigproof',
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
      name: 'GIGPROOF',
      description:
        'Pre-booking proof and risk-reduction tool for independent artists and booking managers.',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: ['en', 'he'],
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'GIGPROOF',
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
        'GIGPROOF provides standardized, method-labeled proof of live performance for independent artists. Free for booking managers.',
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
        </LocaleProvider>
      </body>
    </html>
  )
}
