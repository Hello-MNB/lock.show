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

// GA4 — property LOCK SHOW (544738110), stream LOCK SHOW App; env can override
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-ZX907M2NY8'

const SITE_URL = 'https://lock.show'

// Next.js App Router viewport export
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111612',
} as const

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'LOCK SHOW',
    template: '%s | LOCK SHOW',
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
  },
  twitter: {
    // No verified @lock handle exists yet — omit `site`/`creator` rather than
    // claim a handle that may belong to someone else. Add back once secured.
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

// JSON-LD: WebSite + SoftwareApplication schema.
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
      // 'en' only: page bodies are English-only today; the locale toggle
      // covers nav/footer/consent copy, not page content (T-84 HE-scope note).
      inLanguage: ['en'],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: 'LOCK SHOW — Bookability Passport',
      url: SITE_URL,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'A verification tool for the live-music industry: independent artists build a standardized, method-labeled record of their live performance history, and booking managers (מזמיני הופעות) review it before booking — no scores, percentiles, or predictions, only labeled evidence.',
      // 'en' only — see WebSite node above for the same HE-scope note.
      inLanguage: ['en'],
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
