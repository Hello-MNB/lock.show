import type { Metadata } from 'next'
import { MarketingPage } from '@/components/marketing-page'

export const metadata: Metadata = {
  alternates: { canonical: '/sample' },
  title: 'Illustrative PASSPORT',
  description: 'A fictional, bounded illustration of PASSPORT structure with no real artist, venue, or event data.',
}

export default function SamplePage() {
  return <MarketingPage page="sample" />
}
