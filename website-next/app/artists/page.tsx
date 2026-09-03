import type { Metadata } from 'next'
import { MarketingPage } from '@/components/marketing-page'

export const metadata: Metadata = {
  alternates: { canonical: '/artists' },
  title: 'For Artists & Acts',
  description: 'Organize professional evidence privately, keep acts distinct, and share selected context by permission.',
}

export default function ArtistsPage() {
  return <MarketingPage page="artists" />
}
