import type { Metadata } from 'next'
import { MarketingPage } from '@/components/marketing-page'

export const metadata: Metadata = {
  alternates: { canonical: '/how-it-works' },
  title: 'How It Works',
  description: 'How LOCK SHOW moves from private RADAR to guided improvement and permissioned PASSPORT sharing.',
}

export default function HowItWorksPage() {
  return <MarketingPage page="how" />
}
