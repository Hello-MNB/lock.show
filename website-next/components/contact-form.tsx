'use client'

/**
 * CONTACT FORM — fully localized, subject-first.
 *
 * FIELD ORDER IS DELIBERATE (owner request 17 Aug: "improve the UX of field
 * order"). Old order was Name → Email → Role → Message: it asked who you are
 * before it asked what you want, so the reader had no context for the role
 * question. New order is:
 *
 *   1 Subject   — what this is about. Frames everything below it.
 *   2 Role      — who is asking, now that the topic is known; routes the reply.
 *   3 Message   — the substance, while the thought is fresh.
 *   4 Name      — identity last; low-effort fields belong after commitment.
 *   5 Email     — the one required identifier, immediately above the button.
 *
 * Message before name follows the same logic as any well-built intake form: the
 * person came to say something, so let them say it before asking who they are.
 *
 * Every string resolves through content/copy-matrix.ts — no hardcoded copy — so
 * a marketing edit is one row in every language at once.
 */
import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from '../lib/locale-context'
import { t, CONTACT_SUBJECTS, CONTACT_ROLES } from '../content/copy-matrix'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qexfndiyallwqhhzeerd.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_rEoMmflkjGIoAEUFBab_IA_c6k4tgOu'

type State = 'idle' | 'sending' | 'done' | 'duplicate' | 'error'

export default function ContactForm() {
  const { locale, dir } = useLocale()
  const [state, setState] = useState<State>('idle')

  const label: React.CSSProperties = { fontFamily: 'var(--font-space-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--color-tally-onlight)', textTransform: 'uppercase' }
  const field: React.CSSProperties = { padding: '12px 14px', minHeight: 44, border: '1px solid rgba(10,13,11,0.15)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-paper)', fontFamily: 'var(--font-heebo)', fontSize: '0.95rem', color: 'var(--color-ink)', width: '100%', boxSizing: 'border-box' }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return
    const fd = new FormData(e.currentTarget)
    setState('sending')
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist_signup`, {
        method: 'POST',
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({
          email: String(fd.get('email') || '').trim(),
          name: String(fd.get('name') || '').trim() || null,
          // Subject and role are carried in the message body so this keeps
          // working against the 026 shape without a schema change.
          message: [`[${String(fd.get('subject') || 'other')}]`, `[${String(fd.get('role') || 'other')}]`,
                    String(fd.get('message') || '').trim()].join(' ').trim(),
          source_page: typeof window !== 'undefined' ? window.location.pathname : null,
          locale,
        }),
      })
      if (res.ok) setState('done')
      else if (res.status === 409) setState('duplicate')
      else setState('error')
    } catch { setState('error') }
  }

  if (state === 'done' || state === 'duplicate') {
    return (
      <div role="status" dir={dir} style={{ padding: '28px 24px', border: '1px solid rgba(200,240,77,0.25)', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(200,240,77,0.05)' }}>
        <p style={{ ...label, color: 'var(--color-stamp-onlight)', fontWeight: 700, fontSize: '0.75rem', margin: '0 0 8px' }}>
          {state === 'done' ? t('contact.form.success.success', locale) : t('contact.form.duplicate.success', locale)}
        </p>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-tally-onlight)', margin: 0, lineHeight: 1.6 }}>
          {t('contact.form.successBody.body', locale)}
        </p>
      </div>
    )
  }

  const req = t('contact.form.required.help', locale)
  const opt = t('contact.form.optional.help', locale)

  return (
    <form onSubmit={onSubmit} dir={dir} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* 1 · SUBJECT — first, so everything below is read in context */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="c-subject" style={label}>{t('contact.form.subject.label', locale)} · {req}</label>
        <select id="c-subject" name="subject" required style={{ ...field, appearance: 'none' }}>
          {CONTACT_SUBJECTS.map((o) => <option key={o.value} value={o.value}>{o.t[locale]}</option>)}
        </select>
      </div>

      {/* 2 · ROLE — who is asking, now that the topic is known */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="c-role" style={label}>{t('contact.form.role.label', locale)} · {opt}</label>
        <select id="c-role" name="role" style={{ ...field, appearance: 'none' }}>
          <option value="">—</option>
          {CONTACT_ROLES.map((o) => <option key={o.value} value={o.value}>{o.t[locale]}</option>)}
        </select>
      </div>

      {/* 3 · MESSAGE — the substance, while the thought is fresh */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="c-message" style={label}>{t('contact.form.message.label', locale)} · {opt}</label>
        <textarea id="c-message" name="message" rows={5} placeholder={t('contact.form.message.placeholder', locale)}
                  style={{ ...field, resize: 'vertical' }} />
      </div>

      {/* 4 · NAME — identity after commitment */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="c-name" style={label}>{t('contact.form.name.label', locale)} · {opt}</label>
        <input id="c-name" name="name" type="text" autoComplete="name" style={field} />
      </div>

      {/* 5 · EMAIL — the one required identifier, right above the button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="c-email" style={label}>{t('contact.form.email.label', locale)} · {req}</label>
        <input id="c-email" name="email" type="email" required autoComplete="email" style={field} />
      </div>

      <button type="submit" disabled={state === 'sending'}
              style={{ padding: '14px 28px', minHeight: 48, backgroundColor: 'var(--color-stamp)', color: 'var(--color-ink)', fontFamily: 'var(--font-space-mono)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', border: 'none', borderRadius: 'var(--radius-sm)', cursor: state === 'sending' ? 'wait' : 'pointer', width: '100%', opacity: state === 'sending' ? 0.7 : 1 }}>
        {state === 'sending' ? t('contact.form.sending.cta', locale) : t('contact.form.submit.cta', locale)}
      </button>

      {state === 'error' && (
        <p role="alert" style={{ fontSize: '0.85rem', color: 'var(--color-void)', margin: 0 }}>
          {t('contact.form.error.error', locale)}
        </p>
      )}

      {/* Privacy link AT THE POINT OF COLLECTION — the audit found the form
          collected name, email and free text with no link to the policy. */}
      <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.65rem', letterSpacing: '0.05em', color: 'var(--color-tally-onlight)', margin: 0, lineHeight: 1.7 }}>
        {t('contact.form.privacy.help', locale, { link: '' })}
        <Link href="/privacy" style={{ color: 'var(--color-stamp-onlight)', textDecoration: 'underline' }}>
          {t('contact.form.privacyLink.label', locale)}
        </Link>
      </p>
    </form>
  )
}
