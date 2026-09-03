import type { Metadata } from 'next'
import { MarketingPage } from '@/components/marketing-page'

export const metadata: Metadata = {
  alternates: { canonical: '/trust' },
  title: 'Privacy, Permission & Provenance',
  description: 'How LOCK SHOW approaches private work, permissioned sharing, evidence provenance, and freshness.',
}

export default function TrustPage() {
  return <MarketingPage page="trust" />
}
