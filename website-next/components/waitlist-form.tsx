'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useLocale } from '@/lib/locale-context'
import { marketingCopy } from '@/lib/marketing-copy'
import { trackMarketingEvent } from '@/components/tracked-link'

const SUPABASE_URL = 'https://qexfndiyallwqhhzeerd.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_rEoMmflkjGIoAEUFBab_IA_c6k4tgOu'

type FormState = 'idle' | 'sending' | 'done' | 'duplicate' | 'error'

export function WaitlistForm() {
  const { locale, dir } = useLocale()
  const copy = marketingCopy[locale]
  const [state, setState] = useState<FormState>('idle')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'sending') return
    const form = event.currentTarget
    const data = new FormData(form)
    if (String(data.get('website') || '')) {
      setState('done')
      return
    }

    setState('sending')
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist_signup`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          email: String(data.get('email') || '').trim().toLowerCase(),
          role: String(data.get('role') || '') || null,
          name: null,
          message: null,
          source_page: typeof window === 'undefined' ? '/early-access' : window.location.pathname,
          locale,
        }),
      })

      if (response.ok) {
        setState('done')
        form.reset()
        trackMarketingEvent('early_access_submit_success', { locale, role: String(data.get('role') || 'unspecified') })
      } else if (response.status === 409) {
        setState('duplicate')
        trackMarketingEvent('early_access_submit_duplicate', { locale })
      } else {
        setState('error')
        trackMarketingEvent('early_access_submit_error', { locale, status: String(response.status) })
      }
    } catch {
      setState('error')
      trackMarketingEvent('early_access_submit_error', { locale, status: 'network' })
    }
  }

  if (state === 'done' || state === 'duplicate') {
    return (
      <div className="form-receipt" role="status" tabIndex={-1}>
        <h2>{state === 'done' ? copy.form.successTitle : copy.form.duplicateTitle}</h2>
        <p>{state === 'done' ? copy.form.successBody : copy.form.duplicateBody}</p>
      </div>
    )
  }

  return (
    <form className="early-access-form" onSubmit={onSubmit} dir={dir}>
      <div className="form-field">
        <label htmlFor="early-access-email">{copy.form.email}</label>
        <input id="early-access-email" name="email" type="email" autoComplete="email" required maxLength={254} />
      </div>
      <div className="form-field">
        <label htmlFor="early-access-role">{copy.form.role}</label>
        <select id="early-access-role" name="role" defaultValue="" required>
          <option value="" disabled>{copy.form.rolePrompt}</option>
          {copy.form.roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
        </select>
      </div>
      <div className="form-trap" aria-hidden="true">
        <label htmlFor="early-access-website">Website</label>
        <input id="early-access-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="form-consent">
        <input name="consent" type="checkbox" required />
        <span>{copy.form.consent}</span>
      </label>
      <button className="button button-primary form-submit" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? copy.form.sending : copy.form.submit}
      </button>
      {state === 'error' && <p className="form-error" role="alert">{copy.form.error}</p>}
      <Link className="form-privacy" href="/privacy">{copy.form.privacy}</Link>
    </form>
  )
}

export function EarlyAccessPage() {
  const { locale, dir } = useLocale()
  const copy = marketingCopy[locale]
  return (
    <main className="marketing-site" dir={dir}>
      <section className="marketing-hero marketing-hero-compact">
        <div className="marketing-container marketing-hero-inner">
          <p className="marketing-kicker">{copy.form.kicker}</p>
          <h1>{copy.form.title}</h1>
          <p className="marketing-lead">{copy.form.lead}</p>
        </div>
      </section>
      <section id="request" className="marketing-section marketing-section-paper">
        <div className="marketing-container marketing-form-layout">
          <div>
            <p className="marketing-kicker marketing-kicker-dark">{copy.common.privacyLine}</p>
            <h2>{copy.common.earlyTitle}</h2>
            <p>{copy.common.earlyBody}</p>
            <p className="marketing-boundary">{copy.common.disclaimer}</p>
          </div>
          <WaitlistForm />
        </div>
      </section>
    </main>
  )
}
