'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/locale-context'
import { marketingCopy } from '@/lib/marketing-copy'
import { BrandSymbol } from '@/components/brand-symbol'

export function Footer() {
  const { locale, dir } = useLocale()
  const copy = marketingCopy[locale]
  return (
    <footer className="site-footer" dir={dir}>
      <div className="marketing-container">
        <div className="site-footer-grid">
          <div>
            <div className="site-wordmark site-footer-wordmark"><BrandSymbol size={34} /><span>LOCK SHOW</span></div>
            <p>{copy.common.privacyLine}</p>
          </div>
          <div>
            <p className="marketing-kicker">{locale === 'he' ? 'מידע' : 'Explore'}</p>
            <Link href="/how-it-works">{copy.nav.how}</Link>
            <Link href="/artists">{copy.nav.artists}</Link>
            <Link href="/professionals">{copy.nav.professionals}</Link>
            <Link href="/trust">{copy.nav.trust}</Link>
            <Link href="/faq">{copy.nav.faq}</Link>
          </div>
          <div>
            <p className="marketing-kicker">{locale === 'he' ? 'מדיניות' : 'Policies'}</p>
            <Link href="/privacy">{locale === 'he' ? 'פרטיות' : 'Privacy'}</Link>
            <Link href="/terms">{locale === 'he' ? 'תנאי שימוש' : 'Terms'}</Link>
            <Link href="/accessibility">{locale === 'he' ? 'נגישות' : 'Accessibility'}</Link>
          </div>
        </div>
        <div className="site-footer-bottom">
          <p>© 2026 LOCK SHOW</p>
          <p>{copy.common.disclaimer}</p>
        </div>
      </div>
    </footer>
  )
}
