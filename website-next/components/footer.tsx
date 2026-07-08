'use client'

import Link from 'next/link'

import { APP_URL } from '@/lib/app-url'
import { useLocale } from '@/lib/locale-context'
import { DoorStamp } from '@/components/door-stamp'

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
        padding: 0,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-heebo)',
        fontSize: '0.875rem',
        color: 'rgba(255,255,255,0.6)',
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
      { href: '/artists',     label: 'Why GIGPROOF' },
      { href: '/radar',       label: 'Artist Radar' },
      { href: '/methodology', label: 'Methodology' },
      { href: '/pricing',     label: 'Pricing' },
    ],
  },
  {
    heading: 'FOR BOOKERS',
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

export function Footer() {
  const { messages } = useLocale()
  const t = messages.footer

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-night)',
        color: 'rgba(255,255,255,0.7)',
        padding: '56px 24px 32px',
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
              aria-label="GIGPROOF home"
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
              }}
            >
              <DoorStamp size={36} style={{ color: 'var(--color-stamp)' }} />
              GIGPROOF
            </Link>
            <p style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.62rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.35)',
              margin: 0,
            }}>
              VERIFIED PROOF · METHOD-LABELED · TEL AVIV
            </p>
          </div>
          <a
            href={`${APP_URL}/signup`}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: 'var(--color-stamp)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.68rem',
              letterSpacing: '0.08em',
              textDecoration: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            BUILD YOUR PASSPORT →
          </a>
        </div>

        {/* Link columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '32px',
          marginBottom: '48px',
        }}>
          {FOOTER_LINKS.map(({ heading, links }) => (
            <div key={heading}>
              <p style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.14em',
                color: 'rgba(255,255,255,0.35)',
                margin: '0 0 16px',
              }}>
                {heading}
              </p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {links.map(({ href, label }) => (
                  <li key={href} style={{ marginBottom: '10px' }}>
                    <Link
                      href={href}
                      style={{
                        fontFamily: 'var(--font-heebo)',
                        fontSize: '0.875rem',
                        color: 'rgba(255,255,255,0.6)',
                        textDecoration: 'none',
                      }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Legal column — locale-aware (footer.* keys) */}
          <div>
            <p style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.14em',
              color: 'rgba(255,255,255,0.35)',
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
                <li key={href} style={{ marginBottom: '10px' }}>
                  <Link
                    href={href}
                    style={{
                      fontFamily: 'var(--font-heebo)',
                      fontSize: '0.875rem',
                      color: 'rgba(255,255,255,0.6)',
                      textDecoration: 'none',
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li style={{ marginBottom: '10px' }}>
                <ConsentPrefsButton label={t.consentPrefs} />
              </li>
            </ul>
          </div>
        </div>

        {/* Entity + firewall notice */}
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '32px',
        }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.3)',
            margin: 0,
            lineHeight: 1.8,
          }}>
            אמרגן ≠ מפיק · BOOKING MANAGER ≠ PRODUCER — DISTINCT ROLES, NEVER MERGED.
            {' '}NO SCORE · NO RANKING · NO PREDICTION · NO GUARANTEE.
            {' '}ALL CLAIMS ARE METHOD-LABELED. AUDIENCE DRAW SHOWN AS A BAND ONLY.
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
            fontSize: '0.6rem',
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.25)',
            margin: 0,
          }}>
            © 2026 GIGPROOF · CLOSED BETA · TEL AVIV, ISRAEL
          </p>
          <Link
            href="/contact"
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.3)',
              textDecoration: 'none',
            }}
          >
            CONTACT
          </Link>
        </div>

      </div>
    </footer>
  )
}
