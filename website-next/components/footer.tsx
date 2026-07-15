'use client'

// Footer chrome — structure per Codex rebuild brief §4 (2026-07-14):
// exactly 4 link columns — Product (Artists, Managers, Production, Bookers,
// Passport demo, Radar) · Trust (How it works, Methodology, FAQ) · Company
// (Contact, Accessibility) · Legal (Terms, Privacy + cookie preferences).
// The CONNECT/social block is kept as a separate row below the columns
// (lib/social.ts stays the single source). All strings live in
// content/chrome.ts ({ en, he }); micro-copy is the brief's exact wording.
// Columns stack on narrow screens via the existing auto-fit grid pattern.

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { APP_URL } from '@/lib/app-url'
import { useLocale } from '@/lib/locale-context'
import { chromeContent } from '@/content/chrome'
import { SOCIAL, EMAILS } from '@/lib/social'

const CONSENT_STORAGE_KEY = 'lockshow_consent'

const footerLinkStyle = {
  fontFamily: 'var(--font-heebo)',
  fontSize: '0.875rem',
  color: 'rgba(243,245,239,0.7)',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '44px',
  minWidth: '44px',
  padding: '0.35rem 0',
} as const

const columnHeadingStyle = {
  fontFamily: 'var(--font-space-mono)',
  fontSize: '0.75rem',
  letterSpacing: '0.14em',
  color: 'rgba(243,245,239,0.55)',
  margin: '0 0 16px',
} as const

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
        minHeight: '44px',
        padding: '0.35rem 0',
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

export function Footer() {
  const { locale } = useLocale()
  const t = chromeContent[locale].footer

  // Desktop (≥721px): every column is expanded (the accordion is a mobile-only
  // affordance). matchMedia guarantees the links render regardless of the
  // <details> open-state quirks across Chromium versions.
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 721px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return (
    <footer
      className="mk-footer"
      style={{
        backgroundColor: 'var(--color-night)',
        color: 'rgba(255,255,255,0.7)',
        padding: 'clamp(64px, 7vw, 92px) max(20px, 4vw) 36px',
      }}
      aria-label="Site footer"
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Top row: wordmark + CTA */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: 'clamp(36px, 5vw, 56px)',
          paddingBottom: 'clamp(28px, 4vw, 40px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div>
            <Link
              className="mk-footer-brand"
              href="/"
              aria-label="LOCK home"
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
                minHeight: '44px',
                minWidth: '44px',
              }}
            >
              <img
                src="/brand/lockshow-symbol-spotlight-lens-v2-master-lime.svg"
                alt=""
                width={36}
                height={36}
                style={{ display: 'block', width: 36, height: 36 }}
              />
              LOCK
            </Link>
            <p style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: 'rgba(243,245,239,0.55)',
              margin: 0,
            }}>
              {t.tagline}
            </p>
          </div>
          {/* Footer CTA — lime is fine here (own viewport, far from the hero) */}
          <a
            href={`${APP_URL}/signup`}
            className="mk-btn mk-btn--primary"
            style={{
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            {t.cta}
          </a>
        </div>

        {/* Link columns — exactly 4: Product · Trust · Company · Legal.
            Mobile: each column is an <details> ACCORDION (Codex build scope §3).
            Desktop (≥721px): CSS forces every accordion open into a 4-col grid
            with non-interactive headings. */}
        <div className="mk-foot-cols" style={{ marginBottom: '40px' }}>
          {t.columns.map(({ heading, links }, i) => {
            const isLegal = i === t.columns.length - 1
            return (
              <details key={heading} className="mk-foot-acc" open={isDesktop || i === 0}>
                <summary style={columnHeadingStyle as React.CSSProperties}>{heading}</summary>
                <ul style={{ listStyle: 'none', margin: 0, padding: '0 0 12px' }}>
                  {links.map(({ href, label }) => (
                    <li key={href} style={{ marginBottom: '4px' }}>
                      <Link href={href} style={footerLinkStyle}>
                        {label}
                      </Link>
                    </li>
                  ))}
                  {isLegal ? (
                    <li style={{ marginBottom: '4px' }}>
                      <ConsentPrefsButton label={t.consentPrefs} />
                    </li>
                  ) : null}
                </ul>
              </details>
            )
          })}
        </div>

        {/* CONNECT — official channels (single source: lib/social.ts) */}
        <div style={{
          marginBottom: '40px',
          paddingBottom: '32px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <p style={columnHeadingStyle}>{t.connectHeading}</p>
          <ul style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: '28px',
            rowGap: '4px',
          }}>
            {SOCIAL.map(({ key, label, href }) => (
              <li key={key}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={footerLinkStyle}
                >
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${EMAILS.hello}`} dir="ltr" style={footerLinkStyle}>
                {EMAILS.hello}
              </a>
            </li>
          </ul>
        </div>

        {/* Micro-copy — brief §4 EXACT wording ({ en, he } in content/chrome.ts) */}
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          marginBottom: '32px',
        }}>
          <p style={{
            fontFamily: 'var(--font-heebo)',
            fontSize: '0.875rem',
            color: 'rgba(243,245,239,0.7)',
            margin: 0,
            lineHeight: 1.7,
          }}>
            {t.microCopy}
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
            {t.copyright}
          </p>
        </div>

      </div>
    </footer>
  )
}
