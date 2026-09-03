import type { Metadata } from 'next'
import { MarketingPage } from '@/components/marketing-page'

export const metadata: Metadata = {
  alternates: { canonical: '/faq' },
  title: 'FAQ',
  description: 'Bounded answers about RADAR, PASSPORT, permissions, evidence context, and early access.',
}

export default function FaqPage() {
  return <MarketingPage page="faq" />
}
