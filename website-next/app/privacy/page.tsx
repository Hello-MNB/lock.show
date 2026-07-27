import type { Metadata } from 'next'
import PrivacyContent from './privacy-content'

export const metadata: Metadata = {
  alternates: { canonical: '/privacy' },
  // D6 (owner ruling): legal pages stay NOINDEX + out of sitemap.ts until the
  // owner supplies the legal facts and review completes. Body text untouched.
  robots: { index: false, follow: false },
  title: 'Privacy Policy',
  description: 'LOCK privacy policy — draft under legal review. What we collect, why, who we share it with, your rights, and cookie consent.',
}

export default function Privacy() {
  return <PrivacyContent />
}
