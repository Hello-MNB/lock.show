import type { Metadata } from 'next'
import { MarketingPage } from '@/components/marketing-page'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  title: 'LOCK SHOW',
  description: 'Private RADAR, guided improvement, and permissioned PASSPORT sharing for artists and acts.',
  openGraph: {
    title: 'LOCK SHOW',
    description: 'Private RADAR. Guided improvement. Permissioned PASSPORT.',
    url: 'https://lock.show/',
  },
}

export default function HomePage() {
  return <MarketingPage page="home" />
}
