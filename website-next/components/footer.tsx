'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { APP_URL } from '@/lib/app-url'
import { conversionHref, conversionLabel } from '@/lib/conversion'
import { useLocale } from '@/lib/locale-context'
import { SOCIAL, WHATSAPP_URL } from '@/lib/social'

const CONSENT_STORAGE_KEY = 'gigproof_consent'

function ConsentPrefsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        try {
          localStorage.removeItem(CONSENT_STORAGE_KEY)
        } catch {
          // localStorage unavailable — nothing to clear
        }
        window.location.reload()
      }}
      style={{
        display: 'block',
        marginTop: '2px',
        padding: '0.75rem 0',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-heebo)',
        fontSize: '0.875rem',
        color: 'rgba(243,245,239,0.7)',
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
      }}
    >
      {label}
    </button>
  )
}

const FOOTER_LINKS = [
  {
    heading: 'FOR ARTISTS',
    links: [
      { href: '/artists',     label: 'Why LOCK SHOW' },
      { href: '/radar',       label: 'Artist Radar' },
      { href: '/methodology', label: 'Methodology' },
      { href: '/pricing',     label: 'Pricing' },
    ],
  },
  {
    heading: 'FOR BOOKING MANAGERS',
    links: [
      { href: '/bookers',       label: 'For Booking Managers' },
      { href: '/producers',     label: 'For Producers' },
      { href: '/passport/demo', label: 'Sample Passport' },
      { href: '/how-it-works',  label: 'How It Works' },
    ],
  },
  {
    heading: 'LEARN MORE',
    links: [
      { href: '/faq',         label: 'FAQ' },
      { href: '/contact',     label: 'Contact' },
    ],
  },
]

// T-84 CTA attribution law (docs/SITE-REWRITE-BRIEF.md): footer is shared
// across every page, so the campaign must be derived from the route, not
// hardcoded — otherwise 100% of footer-driven signups attribute via referrer
// only.
function pageSlug(pathname: string | null): string {
  if (!pathname || pathname === '/') return 'home'
  return pathname.replace(/^\/+|\/+$/g, '').replace(/\//g, '-')
}

export function Footer() {
  const { messages, locale } = useLocale()
  const t = messages.footer
  const pathname = usePathname()
  const slug = pageSlug(pathname)
  // Central conversion helper — see lib/conversion.ts. Login and the shop
  // link are deliberately NOT routed through it.
  const signupHref = conversionHref({ page: slug, placement: 'footer' })
  // Owner order 21 Jul: quiet footer link to the LOCK SHOW shop (top-nav slot waits
  // until the store is live + stocked). Attribution law applies to every
  // off-site CTA: source + per-page campaign + placement.
  const shopHref = `https://shop.lock.show/?utm_source=site&utm_campaign=${slug}&utm_content=footer-shop`

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-night)',
        color: 'rgba(255,255,255,0.7)',
        padding: '56px max(24px, 4vw) 32px',
        // T-97.1 dark-adjacency law: the footer is always night, so its top
        // edge carries a structural seam — the boundary stays visible even
        // when the preceding band is dark (image CTA bands, 404, ink CTAs).
        borderTop: '1px solid #2a342d',
      }}
      aria-label="Site footer"
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Top row: wordmark + CTA */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '48px',
          paddingBottom: '32px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div>
            <Link
              href="/"
              aria-label="LOCK SHOW home"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontFamily: 'var(--font-space-mono)',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '0.06em',
                color: 'var(--color-paper)',
                textDecoration: 'none',
                marginBottom: '6px',
                // ≥44px hit area (T-97 P1 tap targets)
                minHeight: '44px',
                padding: '4px 0',
              }}
            >
              {/* Official spotlight-lens symbol — same drawing as the favicon
                  (owner logo-consistency ruling; master-lime = transparent
                  variant for dark surfaces) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/lockshow-symbol-spotlight-lens-v2-master-lime.svg"
                alt=""
                width={36}
                height={36}
                style={{ display: 'block', flexShrink: 0 }}
              />
              LOCK SHOW
            </Link>
            <p style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: 'rgba(243,245,239,0.55)',
              margin: 0,
            }}>
              REAL NIGHTS · CHECKED PROOF · TEL AVIV
            </p>
          </div>
          <a
            href={signupHref}
            style={{
              display: 'inline-block',
              padding: '15px 24px',
              backgroundColor: 'var(--color-stamp)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {conversionLabel(locale)}
          </a>
        </div>

        {/* Link columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(160px, 100%), 1fr))',
          gap: '32px',
          marginBottom: '48px',
        }}>
          {FOOTER_LINKS.map(({ heading, links }) => (
            <div key={heading}>
              <p style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.14em',
                color: 'rgba(243,245,239,0.55)',
                margin: '0 0 16px',
              }}>
                {heading}
              </p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {links.map(({ href, label }) => (
                  <li key={href} style={{ marginBottom: 0 }}>
                    <Link
                      href={href}
                      style={{
                        fontFamily: 'var(--font-heebo)',
                        fontSize: '0.875rem',
                        color: 'rgba(243,245,239,0.7)',
                        textDecoration: 'none',
                        display: 'inline-block',
                        minWidth: '44px',
                        padding: '0.75rem 0',
                      }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
                {heading === 'LEARN MORE' && (
                  <li style={{ marginBottom: 0 }}>
                    <a
                      href={shopHref}
                      style={{
                        fontFamily: 'var(--font-heebo)',
                        fontSize: '0.875rem',
                        color: 'rgba(243,245,239,0.7)',
                        textDecoration: 'none',
                        display: 'inline-block',
                        minWidth: '44px',
                        padding: '0.75rem 0',
                      }}
                    >
                      Shop
                    </a>
                  </li>
                )}
              </ul>
            </div>
          ))}

          {/* Legal column — locale-aware (footer.* keys) */}
          <div>
            <p style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              color: 'rgba(243,245,239,0.55)',
              margin: '0 0 16px',
            }}>
              LEGAL
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {[
                { href: '/privacy',       label: t.privacy },
                { href: '/terms',         label: t.terms },
                { href: '/accessibility', label: t.accessibility },
              ].map(({ href, label }) => (
                <li key={href} style={{ marginBottom: 0 }}>
                  <Link
                    href={href}
                    style={{
                      fontFamily: 'var(--font-heebo)',
                      fontSize: '0.875rem',
                      color: 'rgba(243,245,239,0.7)',
                      textDecoration: 'none',
                      display: 'inline-block',
                      minWidth: '44px',
                      padding: '0.75rem 0',
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li style={{ marginBottom: 0 }}>
                <ConsentPrefsButton label={t.consentPrefs} />
              </li>
            </ul>
          </div>

          {/* Connect — official channels (single source: lib/social.ts) */}
          <div>
            <p style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              color: 'rgba(243,245,239,0.55)',
              margin: '0 0 16px',
            }}>
              CONNECT
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {SOCIAL.map(({ key, label, href }) => (
                <li key={key} style={{ marginBottom: 0 }}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'var(--font-heebo)',
                      fontSize: '0.875rem',
                      color: 'rgba(243,245,239,0.7)',
                      textDecoration: 'none',
                      display: 'inline-block',
                      minWidth: '44px',
                      padding: '0.75rem 0',
                    }}
                  >
                    {label}
                  </a>
                </li>
              ))}
              {/* Footer contact rule (21 Jul): channel links only — no raw
                  phone number or email address rendered in the footer. The
                  contact page carries the full details. */}
              <li style={{ marginBottom: 0 }}>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-heebo)',
                    fontSize: '0.875rem',
                    color: 'rgba(243,245,239,0.7)',
                    textDecoration: 'none',
                    display: 'inline-block',
                    padding: '0.75rem 0',
                  }}
                >
                  Message LOCK SHOW on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Entity + firewall notice */}
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          marginBottom: '32px',
        }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            color: 'rgba(243,245,239,0.55)',
            margin: 0,
            lineHeight: 1.8,
          }}>
            The booking manager and the producer are two different people doing two different jobs — LOCK SHOW never mixes them up.
            {' '}Every claim says how it was checked. Every crowd is an honest range, never a guess dressed up as a number.
            {' '}The call is always yours.
          </p>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            color: 'rgba(243,245,239,0.55)',
            margin: 0,
          }}>
            © 2026 LOCK SHOW · CLOSED BETA · TEL AVIV, ISRAEL
          </p>
          <Link
            href="/contact"
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              color: 'rgba(243,245,239,0.7)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: '44px',
              padding: '0.5rem 0',
            }}
          >
            CONTACT
          </Link>
        </div>

      </div>
    </footer>
  )
}
