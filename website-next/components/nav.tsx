'use client'

// Header chrome — structure/labels per Codex rebuild brief §4 (2026-07-14):
// Artists · Managers · Production · Bookers · How it works · Passport demo,
// then locale toggle + Log in + "Join free pilot" CTA. All strings live in
// content/chrome.ts ({ en, he }); mechanics (sticky header, APP_URL signup
// href, mobile hamburger, aria patterns) are unchanged from the previous nav.
//
// LIME-COLLISION DECISION: every rebuilt page hero renders a lime primary
// CTA (.mk-btn--primary) above the fold, and the brief's layout tokens allow
// only ONE lime CTA per viewport. The sticky header shares that viewport, so
// the header CTA uses the DARK/OUTLINE variant (matches .mk-btn--outline-dark
// tokens) instead of lime — in both desktop and mobile menus.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useLocale } from '@/lib/locale-context'
import type { Locale } from '@/lib/i18n'
import { chromeContent } from '@/content/chrome'

import { APP_URL } from '@/lib/app-url'

function LocaleToggle() {
  const { locale, setLocale } = useLocale()
  const next: Locale = locale === 'en' ? 'he' : 'en'
  const label = locale === 'en' ? 'HE' : 'EN'
  return (
    <button
      onClick={() => setLocale(next)}
      aria-label={locale === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
      style={{
        fontFamily: 'var(--font-space-mono)',
        fontSize: '0.75rem',
        letterSpacing: '0.06em',
        color: 'var(--color-tally)',
        background: 'none',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '10px',
        padding: '15px 12px',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  )
}

export function Nav() {
  const [open, setOpen] = useState(false)
  const { locale } = useLocale()
  const t = chromeContent[locale].nav
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname?.startsWith(`${href}/`)

  // Close the mobile sheet on Escape; lock body scroll while it is open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  return (
    <>
    <nav
      role="navigation"
      aria-label="Main navigation"
      style={{
        backgroundColor: 'var(--nav-bg)',
        backdropFilter: 'var(--nav-blur)',
        WebkitBackdropFilter: 'var(--nav-blur)',
        borderBottom: '1px solid var(--nav-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '0 max(20px, 4vw)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Governed DS wordmark: use physical brand asset, never an improvised mark. */}
        <Link
          href="/"
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
            flexShrink: 0,
            minHeight: '44px',
            padding: '6px 0',
          }}
          aria-label="LOCK home"
        >
          <img
            src="/brand/lockshow-symbol-spotlight-lens-v2-master-lime.svg"
            alt=""
            width={32}
            height={32}
            style={{ display: 'block', width: 32, height: 32 }}
          />
          LOCK
        </Link>

        {/* Desktop links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(14px, 1.65vw, 24px)',
          }}
          className="nav-desktop"
        >
          {t.links.map(({ href, label }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                style={{
                  fontFamily: 'var(--font-heebo)',
                  fontSize: '0.875rem',
                  fontWeight: active ? 700 : 400,
                  color: active ? 'var(--color-paper)' : 'var(--color-tally)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: '44px',
                  paddingBottom: '4px',
                  borderBottom: active
                    ? '2px solid var(--color-stamp)'
                    : '2px solid transparent',
                }}
              >
                {label}
              </Link>
            )
          })}
          <LocaleToggle />
          <a
            href={`${APP_URL}/login`}
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              color: 'var(--color-paper)',
              textDecoration: 'none',
              padding: '15px 12px',
              whiteSpace: 'nowrap',
              fontWeight: 600,
            }}
          >
            {t.login}
          </a>
          {/* Header CTA — outline variant, NOT lime (page heroes own the one
              lime CTA in this viewport; see file header note). */}
          <a
            href={`${APP_URL}/signup`}
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              color: 'var(--color-paper)',
              textDecoration: 'none',
              backgroundColor: 'transparent',
              border: '1px solid rgba(243,245,239,0.28)',
              padding: '14px 18px',
              borderRadius: '10px',
              whiteSpace: 'nowrap',
              fontWeight: 700,
            }}
          >
            {t.cta}
          </a>
        </div>

        {/* Mobile hamburger — 44px min touch target */}
        <button
          aria-label={open ? t.closeMenu : t.openMenu}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
          className="nav-mobile-btn"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            minWidth: '44px',
            minHeight: '44px',
            display: 'none',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
          }}
        >
          <span style={{ display: 'block', width: '20px', height: '2px', backgroundColor: 'var(--color-paper)', transition: 'all 0.2s', transform: open ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ display: 'block', width: '20px', height: '2px', backgroundColor: 'var(--color-paper)', opacity: open ? 0 : 1, transition: 'all 0.2s' }} />
          <span style={{ display: 'block', width: '20px', height: '2px', backgroundColor: 'var(--color-paper)', transition: 'all 0.2s', transform: open ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
      `}</style>
    </nav>

      {/* Mobile SHEET — rendered OUTSIDE <nav> so the nav's backdrop-filter
          does not become the fixed sheet's containing block (that clipped it
          to the 64px header). Slide-in from the right, dark surface, 52px tap
          rows, sticky primary CTA at bottom (Codex build scope §2). */}
      {open && (
        <>
          <div
            className="mk-sheet-backdrop"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.closeMenu}
            className="mk-sheet"
          >
            {/* Sheet header — wordmark + close */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontFamily: 'var(--font-space-mono)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  letterSpacing: '0.06em',
                  color: 'var(--color-paper)',
                }}
              >
                <img
                  src="/brand/lockshow-symbol-spotlight-lens-v2-master-lime.svg"
                  alt=""
                  width={32}
                  height={32}
                  style={{ display: 'block', width: 32, height: 32 }}
                />
                LOCK
              </span>
              <button
                aria-label={t.closeMenu}
                onClick={() => setOpen(false)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  color: 'var(--color-paper)',
                  width: '44px',
                  height: '44px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Scrollable rows */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 20px' }}>
              {t.links.map(({ href, label }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className="mk-sheet__row"
                  >
                    <span>{label}</span>
                    <span aria-hidden="true" style={{ opacity: 0.4 }}>→</span>
                  </Link>
                )
              })}

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                <LocaleToggle />
                <a
                  href={`${APP_URL}/login`}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '48px',
                    border: '1px solid rgba(243,245,239,0.28)',
                    color: 'var(--color-paper)',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.08em',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    fontWeight: 600,
                  }}
                >
                  {t.login}
                </a>
              </div>
            </div>

            {/* Sticky primary CTA at bottom of the sheet — lime is allowed here
                (the sheet covers the hero, so it owns this viewport). */}
            <div
              style={{
                padding: '16px 20px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(10,13,11,0.6)',
              }}
            >
              <a
                href={`${APP_URL}/signup`}
                className="mk-btn mk-btn--primary"
                style={{ width: '100%' }}
              >
                {t.cta}
              </a>
            </div>
          </div>
        </>
      )}
    </>
  )
}
