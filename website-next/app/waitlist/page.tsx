import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'
import { APP_URL } from '@/lib/app-url'

/**
 * /waitlist — the conversion surface for PUBLIC_CONVERSION_MODE=waitlist.
 *
 * NOINDEX BY DEFAULT, per B4-70.10 §10.1: "The page is a focused utility route
 * and should default to noindex unless Public Web/SEO explicitly approves
 * indexation." It is deliberately absent from app/sitemap.ts for the same
 * reason, alongside the D5/D6 exclusions already documented there.
 *
 * A self-referential canonical is still emitted: noindex tells a crawler not to
 * list the page, and the canonical resolves the query-string variants
 * (?src=&placement=&entity=) that attribution appends, so they never read as
 * distinct URLs if the page is ever opened to indexing.
 */
export const metadata: Metadata = {
  title: 'Join the beta waitlist',
  description:
    'Join the LOCK SHOW beta waitlist. Tell us how you work in live entertainment and we will invite people in focused groups as each workflow is ready.',
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl('/waitlist') },
}

export default function WaitlistPage() {
  const signupUrl = `${APP_URL}/signup?utm_source=site&utm_campaign=waitlist_redirect`

  return (
    <main style={{ backgroundColor: 'var(--color-paper)', minHeight: '100vh', padding: '64px 20px' }}>
      <meta httpEquiv="refresh" content={`0;url=${signupUrl}`} />
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1>Registration is open</h1>
        <p>The waitlist is closed. Continue to create your account.</p>
        <a href={signupUrl}>Continue to signup</a>
      </div>
    </main>
  )
}
