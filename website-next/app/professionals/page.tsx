import type { Metadata } from 'next'
import { MarketingPage } from '@/components/marketing-page'

export const metadata: Metadata = {
  alternates: { canonical: '/professionals' },
  title: 'For Representation & Recipients',
  description: 'Bounded professional context for representation, booking, programming, production, and selected recipients.',
}

export default function ProfessionalsPage() {
  return <MarketingPage page="professionals" />
}
