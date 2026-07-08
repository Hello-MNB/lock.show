'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useLocale } from '@/lib/locale-context'
import type { Locale } from '@/lib/i18n'
import { DoorStamp } from '@/components/door-stamp'

import { APP_URL } from '@/lib/app-url'

const NAV_LINK_KEYS = [
  { href: '/artists',      key: 'artists'      },
  { href: '/bookers',      key: 'bookers'      },
  { href: '/producers',    key: 'producers'    },
  { href: '/how-it-works', key: 'howItWorks'   },
  { href: '/methodology',  key: 'methodology'  },
  { href: '/pricing',      key: 'pricing'      },
] as const

function LocaleToggle() {
  const { locale, setLocale } = useLocale()
  const next: Locale = locale === 'en' ? 'he' : 'en'
  const label = locale === 'en' ? 'עב' : 'EN'
  return (
    <button
      onClick={() => setLocale(next)}
      aria-label={locale === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
      style={{
        fontFamily: 'var(--font-space-mono)',
        fontSize: '0.65rem',
        letterSpacing: '0.06em',
        color: 'var(--color-tally)',
        background: 'none',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 'var(--radius-sm)',
        padding: '5px 9px',
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
  const { messages } = useLocale()
  const nav = messages.nav
  const pathname = usePathname()

  const navLinks = NAV_LINK_KEYS.map(({ href, key }) => ({
    href,
    label: nav[key as keyof typeof nav] as string,
  }))

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname?.startsWith(`${href}/`)

  return (
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
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Wordmark + stamp logo */}
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
          }}
          aria-label="LOCK home"
        >
          <DoorStamp size={36} style={{ color: 'var(--color-stamp)' }} />
          LOCK
        </Link>

        {/* Desktop links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
          }}
          className="nav-desktop"
        >
          {navLinks.map(({ href, label }) => {
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
            href={`${APP_URL}/signup`}
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.65rem',
              letterSpacing: '0.08em',
              color: 'var(--color-ink)',
              textDecoration: 'none',
              backgroundColor: 'var(--color-stamp)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              whiteSpace: 'nowrap',
              fontWeight: 700,
            }}
          >
            {nav.getStarted} →
          </a>
        </div>

        {/* Mobile hamburger — 44px min touch target */}
        <button
          aria-label={open ? nav.closeMenu : nav.openMenu}
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

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          style={{
            backgroundColor: 'rgba(10,13,11,0.97)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '16px 24px 24px',
          }}
          className="nav-mobile-menu"
        >
          {navLinks.map(({ href, label }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-heebo)',
                  fontSize: '1rem',
                  fontWeight: active ? 700 : 400,
                  color: active ? 'var(--color-stamp)' : 'var(--color-paper)',
                  textDecoration: 'none',
                  padding: '14px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {label}
              </Link>
            )
          })}
          <div style={{ paddingTop: '16px', paddingBottom: '4px' }}>
            <LocaleToggle />
          </div>
          <a
            href={`${APP_URL}/signup`}
            style={{
              display: 'block',
              marginTop: '12px',
              padding: '14px 20px',
              backgroundColor: 'var(--color-stamp)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              textDecoration: 'none',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
              fontWeight: 700,
            }}
          >
            {nav.getStarted} →
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
