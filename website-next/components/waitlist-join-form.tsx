'use client'

/**
 * WAITLIST JOIN FORM — B4-70.10 §10.1 form contract.
 *
 * Upgrades the Phase-1 contact form rather than replacing it: the existing
 * components/waitlist-form.tsx stays on /contact untouched, because that is a
 * CONTACT surface with different copy and a different job. This component is
 * the conversion surface.
 *
 * Three things changed structurally from the Phase-1 form:
 *  1. It calls the SECURITY DEFINER RPC join_waitlist (migration 048), not the
 *     table. The browser can no longer INSERT directly, so validation,
 *     idempotency and rate limiting are enforced where they cannot be skipped.
 *  2. WhatsApp consent is SEPARATE, EXPLICIT and VERSIONED — the exact consent
 *     text, its version, the locale it was shown in and the timestamp are all
 *     recorded. A ticked box with no record is not a consent.
 *  3. All ten states from §10.1 are real states, not three.
 *
 * NO ACCOUNT IS CREATED HERE. That is stated in the trust line, in the approved
 * copy, and is true of the RPC — it touches one table and creates no auth user.
 */

import { useState, useRef, useEffect } from 'react'
import { useLocale } from '../lib/locale-context'
import { ENTITY_ROLES, type EntityRole } from '../lib/conversion'
import { track } from '../lib/analytics'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qexfndiyallwqhhzeerd.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_rEoMmflkjGIoAEUFBab_IA_c6k4tgOu'

/** Bump when the consent WORDING changes. Stored with every consent so an old
 *  record always states which text the person actually agreed to. */
export const WHATSAPP_CONSENT_VERSION = '2026-08-17.v1'

type FormState =
  | 'idle' | 'focused' | 'validation' | 'sending'
  | 'success' | 'duplicate' | 'rate_limited' | 'offline' | 'server_error'

const COPY = {
  en: {
    eyebrow: 'WAITLIST OPEN · ISRAEL BETA',
    h1: 'Join the LOCK SHOW beta waitlist',
    support: 'Tell us how you work in live entertainment. We’ll invite people in focused groups as each workflow is ready.',
    trust: 'No account is created today. We’ll contact you only about beta access and essential pilot updates. WhatsApp is optional.',
    email: 'Email address', emailReq: 'required',
    name: 'Name', optional: 'optional',
    role: 'How do you work in live entertainment?',
    rolePlaceholder: '— Select —',
    need: 'What would you want it to help with?',
    whatsapp: 'WhatsApp number',
    whatsappConsent: 'You may contact me on WhatsApp about beta access. I can withdraw at any time.',
    submit: 'JOIN THE WAITLIST',
    sending: 'SENDING…',
    successTitle: '✓ You’re on the list',
    successBody: 'We’ll be in touch when a group opens for how you work. No account has been created.',
    duplicateTitle: '✓ You’re on the list',
    duplicateBody: 'This address is already registered. Your details have been updated. No account has been created.',
    errValidation: 'Please check the highlighted fields.',
    errEmail: 'Enter a valid email address.',
    errRole: 'Please choose how you work.',
    errWhatsapp: 'Enter a valid phone number, or leave it empty.',
    errConsent: 'Add a WhatsApp number, or untick the WhatsApp option.',
    errRate: 'Too many attempts just now. Please try again in a few minutes.',
    errOffline: 'You appear to be offline. Your answers are still here — reconnect and try again.',
    errServer: 'Something went wrong on our side. Your answers are still here.',
    retry: 'TRY AGAIN',
  },
  he: {
    eyebrow: 'רשימת ההמתנה פתוחה · בטא בישראל',
    h1: 'הצטרפות לרשימת ההמתנה לבטא של LOCK SHOW',
    support: 'ספרו לנו איך אתם עובדים בתעשיית ההופעות. נזמין משתתפים בקבוצות ממוקדות ככל שכל תהליך יהיה מוכן.',
    trust: 'לא נפתח עבורכם חשבון בשלב זה. ניצור קשר רק בנוגע לגישה לבטא ולעדכוני פילוט חיוניים. WhatsApp הוא לבחירה.',
    email: 'כתובת אימייל', emailReq: 'שדה חובה',
    name: 'שם', optional: 'לבחירה',
    role: 'איך אתם עובדים בתעשיית ההופעות?',
    rolePlaceholder: '— בחירה —',
    need: 'במה תרצו שזה יעזור?',
    whatsapp: 'מספר WhatsApp',
    whatsappConsent: 'אפשר ליצור איתי קשר ב-WhatsApp בנוגע לגישה לבטא. אפשר לבטל בכל עת.',
    submit: 'הצטרפות לרשימת ההמתנה',
    sending: 'שולח…',
    successTitle: '✓ אתם ברשימה',
    successBody: 'נהיה בקשר כשתיפתח קבוצה שמתאימה לאופן העבודה שלכם. לא נפתח חשבון.',
    duplicateTitle: '✓ אתם ברשימה',
    duplicateBody: 'הכתובת כבר רשומה. הפרטים עודכנו. לא נפתח חשבון.',
    errValidation: 'בדקו את השדות המסומנים.',
    errEmail: 'הזינו כתובת אימייל תקינה.',
    errRole: 'בחרו איך אתם עובדים.',
    errWhatsapp: 'הזינו מספר טלפון תקין, או השאירו ריק.',
    errConsent: 'הוסיפו מספר WhatsApp, או בטלו את הסימון.',
    errRate: 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.',
    errOffline: 'נראה שאין חיבור. התשובות שלכם נשמרו — התחברו ונסו שוב.',
    errServer: 'אירעה תקלה אצלנו. התשובות שלכם נשמרו.',
    retry: 'נסו שוב',
  },
} as const

const ROLE_LABEL: Record<EntityRole, { en: string; he: string }> = {
  artist:                  { en: 'Artist',                             he: 'אמן/אמנית' },
  representative_agency:   { en: 'Artist representative / agency',     he: 'ייצוג אמן / סוכנות' },
  producer_promoter:       { en: 'Producer / promoter',                he: 'מפיק / מפיץ' },
  programmer_booker_buyer: { en: 'Programmer / booker / buyer',        he: 'מתכנת / מזמין הופעות' },
  venue:                   { en: 'Venue',                              he: 'מועדון / אולם' },
  other:                   { en: 'Other',                              he: 'אחר' },
}

export default function WaitlistJoinForm() {
  const { locale, dir } = useLocale()
  const t = COPY[locale] ?? COPY.en
  const [state, setState] = useState<FormState>('idle')
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({})
  const [waConsent, setWaConsent] = useState(false)
  const started = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => { track('waitlist_page_view', { page: '/waitlist', locale }) }, [locale])

  // form_start fires ONCE, on first real interaction — not on render, which
  // would make the page-view→form-start rate meaningless.
  function onFirstInput() {
    if (started.current) return
    started.current = true
    track('waitlist_form_start', { page: '/waitlist', locale })
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') || '').trim()
    const role = String(fd.get('entity_role') || '')
    const wa = String(fd.get('whatsapp') || '').trim()

    // Client validation is a courtesy; the RPC re-validates everything.
    const errs: Record<string, string> = {}
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = t.errEmail
    if (!ENTITY_ROLES.includes(role as EntityRole)) errs.entity_role = t.errRole
    if (wa && !/^\+?[0-9\s-]{7,20}$/.test(wa)) errs.whatsapp = t.errWhatsapp
    if (waConsent && !wa) errs.whatsapp = t.errConsent
    if (Object.keys(errs).length) { setFieldErr(errs); setState('validation'); return }
    setFieldErr({})

    if (typeof navigator !== 'undefined' && navigator.onLine === false) { setState('offline'); return }

    setState('sending')
    track('waitlist_submit_attempt', { page: '/waitlist', locale, entity_role: role })

    const url = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/join_waitlist`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_email: email,
          p_entity_role: role,
          p_name: String(fd.get('name') || '').trim() || null,
          p_primary_need: String(fd.get('primary_need') || '').trim() || null,
          p_whatsapp: wa || null,
          p_whatsapp_consent: waConsent,
          // The EXACT text shown, its version and the locale it was shown in.
          p_consent_text: waConsent ? t.whatsappConsent : null,
          p_consent_version: waConsent ? WHATSAPP_CONSENT_VERSION : null,
          p_locale: locale,
          p_source_page: url.get('src'),
          p_cta_placement: url.get('placement'),
          p_utm_source: url.get('utm_source'),
          p_utm_medium: url.get('utm_medium'),
          p_utm_campaign: url.get('utm_campaign'),
          p_utm_content: url.get('utm_content'),
          p_referrer: typeof document !== 'undefined' ? document.referrer || null : null,
        }),
      })
      if (!res.ok) { setState('server_error'); track('waitlist_join_error', { locale, error_code: `http_${res.status}` }); return }
      const out = await res.json()
      if (out?.ok === true && out.code === 'joined') {
        setState('success')
        track('waitlist_join_success', { page: '/waitlist', locale, entity_role: role })
        if (waConsent) track('waitlist_whatsapp_opt_in', { locale, entity_role: role })
      } else if (out?.ok === true && out.code === 'already') {
        setState('duplicate')
        track('waitlist_join_duplicate', { page: '/waitlist', locale, entity_role: role })
        if (waConsent) track('waitlist_whatsapp_opt_in', { locale, entity_role: role })
      } else if (out?.code === 'rate_limited') {
        setState('rate_limited'); track('waitlist_join_error', { locale, error_code: 'rate_limited' })
      } else {
        setState('validation')
        setFieldErr({ form: t.errValidation })
        track('waitlist_join_error', { locale, error_code: String(out?.code || 'unknown').slice(0, 40) })
      }
    } catch {
      const off = typeof navigator !== 'undefined' && navigator.onLine === false
      setState(off ? 'offline' : 'server_error')
      track('waitlist_join_error', { locale, error_code: off ? 'offline' : 'network' })
    }
  }

  if (state === 'success' || state === 'duplicate') {
    const isNew = state === 'success'
    return (
      <div role="status" dir={dir} style={{ padding: '28px 24px', border: '1px solid rgba(200,240,77,0.25)', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(200,240,77,0.05)' }}>
        <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-stamp-onlight)', textTransform: 'uppercase', margin: '0 0 8px' }}>
          {isNew ? t.successTitle : t.duplicateTitle}
        </p>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-tally-onlight)', margin: 0, lineHeight: 1.6 }}>
          {isNew ? t.successBody : t.duplicateBody}
        </p>
      </div>
    )
  }

  const label: React.CSSProperties = { fontFamily: 'var(--font-space-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--color-tally-onlight)', textTransform: 'uppercase' }
  const input: React.CSSProperties = { padding: '12px 14px', border: '1px solid rgba(10,13,11,0.15)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-paper)', fontFamily: 'var(--font-heebo)', fontSize: '0.95rem', color: 'var(--color-ink)', width: '100%', boxSizing: 'border-box', minHeight: 44 }
  const errStyle: React.CSSProperties = { fontSize: '0.8rem', color: 'var(--color-void)', margin: 0 }
  const banner = state === 'rate_limited' ? t.errRate : state === 'offline' ? t.errOffline : state === 'server_error' ? t.errServer : null

  return (
    <form ref={formRef} onSubmit={onSubmit} onInput={onFirstInput} onFocus={() => state === 'idle' && setState('focused')} dir={dir}
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="w-email" style={label}>{t.email} <span aria-hidden="true">·</span> {t.emailReq}</label>
        <input id="w-email" name="email" type="email" required autoComplete="email" style={input}
               aria-invalid={!!fieldErr.email} aria-describedby={fieldErr.email ? 'w-email-e' : undefined} />
        {fieldErr.email && <p id="w-email-e" role="alert" style={errStyle}>{fieldErr.email}</p>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="w-name" style={label}>{t.name} <span aria-hidden="true">·</span> {t.optional}</label>
        <input id="w-name" name="name" type="text" autoComplete="name" style={input} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="w-role" style={label}>{t.role} <span aria-hidden="true">·</span> {t.emailReq}</label>
        <select id="w-role" name="entity_role" required style={{ ...input, appearance: 'none' }}
                aria-invalid={!!fieldErr.entity_role} aria-describedby={fieldErr.entity_role ? 'w-role-e' : undefined}>
          <option value="">{t.rolePlaceholder}</option>
          {ENTITY_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r][locale] ?? ROLE_LABEL[r].en}</option>)}
        </select>
        {fieldErr.entity_role && <p id="w-role-e" role="alert" style={errStyle}>{fieldErr.entity_role}</p>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="w-need" style={label}>{t.need} <span aria-hidden="true">·</span> {t.optional}</label>
        <textarea id="w-need" name="primary_need" rows={4} maxLength={2000} style={{ ...input, resize: 'vertical' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="w-wa" style={label}>{t.whatsapp} <span aria-hidden="true">·</span> {t.optional}</label>
        <input id="w-wa" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" style={input} dir="ltr"
               aria-invalid={!!fieldErr.whatsapp} aria-describedby={fieldErr.whatsapp ? 'w-wa-e' : undefined} />
        {fieldErr.whatsapp && <p id="w-wa-e" role="alert" style={errStyle}>{fieldErr.whatsapp}</p>}
      </div>

      {/* SEPARATE, EXPLICIT consent. Unticked by default and never implied by
          entering a number — supplying a phone number is not agreeing to be
          contacted on it. */}
      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', minHeight: 44 }}>
        <input type="checkbox" name="whatsapp_consent" checked={waConsent}
               onChange={(e) => setWaConsent(e.currentTarget.checked)}
               style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0 }} />
        <span style={{ fontSize: '0.85rem', color: 'var(--color-tally-onlight)', lineHeight: 1.5 }}>{t.whatsappConsent}</span>
      </label>

      {banner && <p role="alert" style={errStyle}>{banner}</p>}
      {fieldErr.form && <p role="alert" style={errStyle}>{fieldErr.form}</p>}

      <button type="submit" disabled={state === 'sending'}
              style={{ padding: '14px 28px', minHeight: 44, backgroundColor: 'var(--color-stamp)', color: 'var(--color-ink)', fontFamily: 'var(--font-space-mono)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', border: 'none', borderRadius: 'var(--radius-sm)', cursor: state === 'sending' ? 'wait' : 'pointer', width: '100%', opacity: state === 'sending' ? 0.7 : 1 }}>
        {state === 'sending' ? t.sending : (banner ? t.retry : t.submit)}
      </button>

      <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.65rem', letterSpacing: '0.06em', color: 'var(--color-tally-onlight)', margin: 0, lineHeight: 1.7 }}>
        {t.trust}
      </p>
    </form>
  )
}

export { COPY as WAITLIST_COPY }
