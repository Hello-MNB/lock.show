import type { Metadata } from 'next'
import { EarlyAccessPage } from '@/components/waitlist-form'

export const metadata: Metadata = {
  alternates: { canonical: '/early-access' },
  title: 'Request Early Access',
  description: 'Request a conversation about LOCK SHOW early access. Submission does not guarantee access or timing.',
}

export default function RequestEarlyAccessPage() {
  return <EarlyAccessPage />
}
