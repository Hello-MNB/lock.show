import type { Metadata } from 'next'
import Script from 'next/script'
import { Manrope, DM_Mono } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { LocaleProvider } from '@/lib/locale-context'
import { ConsentBanner } from '@/components/consent-banner'
import { SAME_AS, WHATSAPP_E164, CONTACT_POINTS } from '@/lib/social'
import { SITE_URL, OG_DEFAULT_IMAGE } from '@/lib/site'

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

// SITE_URL comes from lib/site.ts — the ONE place the canonical www origin
// is declared (owner ruling D2). Do not re-declare a host string here.
const OG_IMAGE = OG_DEFAULT_IMAGE
// Square brand mark for Organization.logo — a real logo asset, not an OG card
// (C9 fix). SVG is valid as an ImageObject URL per schema.org; this is the
// self-contained spotlight-lens symbol on its ink background (1000×1000).
const LOGO_URL = `${SITE_URL}/brand/lockshow-symbol-spotlight-lens-v2-lime-on-ink.svg`

// Next.js App Router viewport export
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111612',
} as const

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'LOCK SHOW — Booking Proof for Independent Artists',
    template: '%s | LOCK SHOW',
  },
  description:
    'Standardized, method-labeled proof of live performance for independent artists. Built for booking managers who need to verify before they risk their name.',
  // NO `keywords` meta: deprecated by every major engine (dead weight), and
  // the removed list carried the WRONG actor noun (אמרגן = artist-side agent —
  // LOCK SHOW's buyer is the מזמין הופעות; the site's own FAQ says so). C4 fix,
  // authorized by the D2 execution-order metadata alignment.
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
        alt: 'LOCK SHOW — Booking Proof for Independent Artists',
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
      name: 'LOCK SHOW',
      description:
        'Pre-booking proof and risk-reduction tool for independent artists and booking managers.',
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
        url: LOGO_URL,
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
        'LOCK SHOW provides standardized, method-labeled proof of live performance for independent artists. Free for booking managers.',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      // url = where the APPLICATION actually lives today: the embedded SPA at
      // /app on the www origin (C8 fix). Not the marketing homepage, and not
      // app.lock.show — that migration is D3-gated and has not shipped.
      url: `${SITE_URL}/app`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'A verification tool for the live-music industry: independent artists build a standardized, method-labeled record of their live performance history, and booking managers (מזמיני הופעות) review it before booking — no scores, percentiles, or predictions, only labeled evidence.',
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: {
        '@type': 'Country',
        name: 'Israel',
      },
      // 'en' only — see WebSite node above for the same HE-scope note.
      inLanguage: ['en'],
      // Offer text matches /pricing's actual published truth (C7 fix):
      // artists free during the pilot, booking managers free always. No
      // invented tiers, no "by arrangement" contradiction.
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'ILS',
        description:
          'Free during the pilot: artists build and publish their Passport at no cost while the closed pilot runs. Booking managers read Passports free, always. Post-pilot artist pricing is not set yet.',
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
