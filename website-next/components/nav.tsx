'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { APP_URL } from '@/lib/app-url'
import { useLocale } from '@/lib/locale-context'
import { marketingCopy } from '@/lib/marketing-copy'
import { BrandSymbol } from '@/components/brand-symbol'
import { TrackedLink } from '@/components/tracked-link'

const links = [
  { href: '/how-it-works', key: 'how' },
  { href: '/artists', key: 'artists' },
  { href: '/professionals', key: 'professionals' },
  { href: '/trust', key: 'trust' },
  { href: '/faq', key: 'faq' },
] as const

function pageSlug(pathname: string | null) {
  if (!pathname || pathname === '/') return 'home'
  return pathname.replace(/^\/+|\/+$/g, '').replace(/\//g, '-')
}

export function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { locale, setLocale, dir } = useLocale()
  const copy = marketingCopy[locale]
  const loginHref = `${APP_URL}/login?utm_source=site&utm_campaign=${pageSlug(pathname)}&utm_content=nav`
  const navigation = links.map((link) => ({ ...link, label: copy.nav[link.key] }))

  function switchLocale() {
    setLocale(locale === 'en' ? 'he' : 'en')
    setOpen(false)
  }

  return (
    <nav className="site-nav" aria-label={locale === 'he' ? 'ניווט ראשי' : 'Main navigation'} dir={dir}>
      <div className="site-nav-inner">
        <Link href="/" className="site-wordmark" aria-label={locale === 'he' ? 'דף הבית של LOCK SHOW' : 'LOCK SHOW home'}>
          <BrandSymbol size={34} />
          <span>LOCK SHOW</span>
        </Link>

        <div className="site-nav-desktop">
          {navigation.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className="site-nav-link">
                {item.label}
              </Link>
            )
          })}
          <button type="button" className="site-language" onClick={switchLocale} aria-label={copy.nav.switchLanguage}>
            {copy.nav.switchLanguage}
          </button>
          <a className="site-login" href={loginHref}>{copy.nav.login}</a>
          <TrackedLink
            href="/early-access#request"
            eventName="early_access_cta_click"
            eventContext="nav"
            className="button button-primary button-nav"
          >
            {copy.nav.earlyAccess}
          </TrackedLink>
        </div>

        <button
          type="button"
          className="site-menu-button"
          aria-expanded={open}
          aria-controls="site-mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? copy.nav.closeMenu : copy.nav.openMenu}
        </button>
      </div>

      {open && (
        <div id="site-mobile-menu" className="site-mobile-menu">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
          ))}
          <button type="button" onClick={switchLocale}>{copy.nav.switchLanguage}</button>
          <a href={loginHref}>{copy.nav.login}</a>
          <TrackedLink
            href="/early-access#request"
            eventName="early_access_cta_click"
            eventContext="mobile_nav"
            className="button button-primary"
          >
            {copy.nav.earlyAccess}
          </TrackedLink>
        </div>
      )}
    </nav>
  )
}
