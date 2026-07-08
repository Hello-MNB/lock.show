import type { Metadata } from 'next'
import TermsContent from './terms-content'

export const metadata: Metadata = {
  title: 'Terms of Use | LOCK',
  description: 'LOCK terms of use — draft under legal review. Covers the service, evidence and content rules, payments, liability, and governing law.',
}

export default function Terms() {
  return <TermsContent />
}
