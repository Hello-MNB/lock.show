'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Facebook, Instagram, Linkedin, Mail, Radar, ShieldCheck } from 'lucide-react'

import { APP_URL } from '@/lib/app-url'
import { useLocale } from '@/lib/locale-context'
import { BrandSymbol } from '@/components/brand-symbol'
import { SOCIAL, EMAILS } from '@/lib/social'

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
        padding: '0.4rem 0',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-heebo)',
        fontSize: '0.875rem',
        color: 'rgba(243,245,239,0.7)',
        textDecoration: 'none',
      }}
    >
      {label}
    </button>
  )
}

const FOOTER_LINKS = [
  {
    heading: 'PRODUCT',
    links: [
      { href: '/radar',       label: 'RADAR' },
      { href: '/passport/demo', label: 'PASSPORT' },
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/methodology', label: 'Methodology' },
    ],
  },
  {
    heading: 'FOR PEOPLE',
    links: [
      { href: '/artists',       label: 'Artists' },
      { href: '/bookers',       label: 'Passport Recipients' },
      { href: '/producers',     label: 'Claim Confirmers' },
    ],
  },
  {
    heading: 'COMPANY',
    links: [
      { href: '/faq',         label: 'FAQ' },
      { href: '/contact',     label: 'Contact' },
      { href: '/pricing',     label: 'Pilot Access' },
    ],
  },
]

const SOCIAL_ICONS = { instagram: Instagram, facebook: Facebook, linkedin: Linkedin }

// T-84 CTA attribution law (docs/SITE-REWRITE-BRIEF.md): footer is shared
// across every page, so the campaign must be derived from the route, not
// hardcoded — otherwise 100% of footer-driven signups attribute via referrer
// only.
function pageSlug(pathname: string | null): string {
  if (!pathname || pathname === '/') return 'home'
  return pathname.replace(/^\/+|\/+$/g, '').replace(/\//g, '-')
}

export function Footer() {
  const { messages } = useLocale()
  const t = messages.footer
  const pathname = usePathname()
  const signupHref = `${APP_URL}/signup?utm_source=site&utm_campaign=${pageSlug(pathname)}&utm_content=footer`

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-night)',
        color: 'rgba(255,255,255,0.7)',
        padding: '56px max(24px, 4vw) 32px',
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
              }}
            >
              <BrandSymbol size={36} />
              LOCK SHOW
            </Link>
            <p style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: 'rgba(243,245,239,0.55)',
              margin: 0,
            }}>
              Trust on Cue
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
            START YOUR RADAR →
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
                fontSize: '0.75rem',
                letterSpacing: '0.14em',
                color: 'rgba(243,245,239,0.55)',
                margin: '0 0 16px',
              }}>
                {heading}
              </p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {links.map(({ href, label }) => (
                  <li key={href} style={{ marginBottom: '4px' }}>
                    <Link
                      href={href}
                      style={{
                        fontFamily: 'var(--font-heebo)',
                        fontSize: '0.875rem',
                        color: 'rgba(243,245,239,0.7)',
                        textDecoration: 'none',
                        display: 'inline-block',
                        padding: '0.4rem 0',
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
                <li key={href} style={{ marginBottom: '4px' }}>
                  <Link
                    href={href}
                    style={{
                      fontFamily: 'var(--font-heebo)',
                      fontSize: '0.875rem',
                      color: 'rgba(243,245,239,0.7)',
                      textDecoration: 'none',
                      display: 'inline-block',
                      padding: '0.4rem 0',
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li style={{ marginBottom: '4px' }}>
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
              {SOCIAL.map(({ key, label, href }) => {
                const Icon = SOCIAL_ICONS[key]
                return (
                <li key={key} style={{ marginBottom: '4px' }}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'var(--font-heebo)',
                      fontSize: '0.875rem',
                      color: 'rgba(243,245,239,0.7)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0.4rem 0',
                    }}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {label}
                  </a>
                </li>
                )
              })}
              <li style={{ marginBottom: '4px' }}>
                <a
                  href={`mailto:${EMAILS.hello}`}
                  dir="ltr"
                  style={{
                    fontFamily: 'var(--font-heebo)',
                    fontSize: '0.875rem',
                    color: 'rgba(243,245,239,0.7)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.4rem 0',
                  }}
                >
                  <Mail size={16} aria-hidden="true" />
                  {EMAILS.hello}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Product promise — public language, not internal governance copy. */}
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          marginBottom: '32px',
        }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(243,245,239,0.68)', margin: 0, lineHeight: 1.6 }}>
            <ShieldCheck size={18} color="var(--color-stamp)" aria-hidden="true" />
            <span><strong style={{ color: 'var(--color-paper)' }}>Private RADAR.</strong> Owner-approved PASSPORT. Trust on Cue.</span>
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
            © 2026 LOCK SHOW · TEL AVIV, ISRAEL
          </p>
          <Link
            href="/contact"
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              color: 'rgba(243,245,239,0.7)',
              textDecoration: 'none',
              display: 'inline-block',
              padding: '0.5rem 0',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}><Radar size={15} aria-hidden="true" /> CONTACT</span>
          </Link>
        </div>

      </div>
    </footer>
  )
}
