import type { Metadata } from 'next'
import PrivacyContent from './privacy-content'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'LOCK privacy policy — draft under legal review. What we collect, why, who we share it with, your rights, and cookie consent.',
}

export default function Privacy() {
  return <PrivacyContent />
}
