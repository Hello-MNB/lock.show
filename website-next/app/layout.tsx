import type { Metadata } from 'next'
import Script from 'next/script'
import { Rubik, Fraunces, DM_Mono } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { LocaleProvider } from '@/lib/locale-context'
import { ConsentBanner } from '@/components/consent-banner'

const rubik = Rubik({
  subsets: ['latin', 'hebrew'],
  variable: '--font-body',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
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
    'A private professional-evidence workspace for artists and acts, with permissioned PASSPORT sharing for selected recipients.',
  keywords: [
    'artist professional evidence',
    'live performance context',
    'artist passport',
    'אמן',
    'LOCK SHOW',
    'music industry evidence',
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
    title: 'LOCK SHOW',
    description: 'Private RADAR. Guided improvement. Permissioned PASSPORT.',
    images: [{ url: '/og/og-default.svg', width: 1200, height: 630, alt: 'LOCK SHOW' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LOCK SHOW',
    description: 'Private RADAR. Guided improvement. Permissioned PASSPORT.',
    images: ['/og/og-default.svg'],
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

// JSON-LD: bounded website identity only. Product and Organization assertions
// remain out of structured data until their release authority is explicit.
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
      inLanguage: ['en', 'he'],
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
        className={`${rubik.variable} ${fraunces.variable} ${dmMono.variable} antialiased`}
        style={{
          fontFamily: 'var(--font-body), Rubik, system-ui, sans-serif',
          backgroundColor: 'var(--color-night)',
          color: 'var(--color-paper)',
        }}
      >
        <LocaleProvider>
          <a className="skip-link" href="#main-content">Skip to main content</a>
          <Nav />
          <div id="main-content">{children}</div>
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
