import type { Metadata } from 'next'
import AccessibilityContent from './accessibility-content'

export const metadata: Metadata = {
  alternates: { canonical: '/accessibility' },
  // D6 (owner ruling): legal pages stay NOINDEX + out of sitemap.ts until the
  // owner supplies the legal facts and review completes. Body text untouched.
  robots: { index: false, follow: false },
  title: 'Accessibility',
  description: 'LOCK SHOW accessibility statement — draft. Our commitment, what has been made accessible so far, known limitations, and how to reach us.',
}

export default function Accessibility() {
  return <AccessibilityContent />
}
