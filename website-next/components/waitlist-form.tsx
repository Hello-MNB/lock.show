'use client'

import { useState } from 'react'

// ── First-party waitlist capture (Phase-1) ───────────────────────────────────
// Writes straight into the LOCK Supabase (waitlist_signup, migration 026).
// The values below are the PUBLISHABLE client credentials — they ship in every
// browser bundle by design; the table is write-only for the public (RLS:
// anon INSERT only, zero read columns). No third-party service touches the data.
const SUPABASE_URL = 'https://qexfndiyallwqhhzeerd.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_rEoMmflkjGIoAEUFBab_IA_c6k4tgOu'

// S4 (rel-07.13) type floor: every text in this form is >= 1rem (16px) at all
// widths — readability minimum + prevents iOS Safari auto-zoom on focus.
const inputStyle: React.CSSProperties = {
  padding: '12px 14px',
  border: '1px solid rgba(10,13,11,0.15)',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: 'var(--color-paper)',
  fontFamily: 'var(--font-heebo)',
  fontSize: '1rem',
  color: 'var(--color-ink)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-space-mono)',
  fontSize: '1rem',
  letterSpacing: '0.1em',
  color: 'var(--color-tally-onlight)',
  textTransform: 'uppercase',
}

// S9 (rel-07.13): per-entity presets — presetRole locks the role (select hidden),
// source names the page for attribution, and an outreach `?src=` token in the URL
// (Maria's per-batch send links, e.g. /managers?src=wa-batch1) is appended to
// source_page so every registration is traceable to its outreach wave.
export default function WaitlistForm({
  presetRole,
  source,
  cta,
  helper,
}: {
  presetRole?: string
  source?: string
  cta?: string
  helper?: string
} = {}) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'duplicate' | 'error'>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return
    const fd = new FormData(e.currentTarget)
    setState('sending')
    try {
      const srcToken =
        typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('src') : null
      const basePage =
        source || (typeof window !== 'undefined' ? window.location.pathname : null)
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist_signup`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          email: String(fd.get('email') || '').trim(),
          name: String(fd.get('name') || '').trim() || null,
          role: presetRole || String(fd.get('role') || '') || null,
          message: String(fd.get('message') || '').trim() || null,
          source_page: basePage ? `${basePage}${srcToken ? `?src=${srcToken}` : ''}` : null,
          locale: typeof document !== 'undefined' ? document.documentElement.lang || 'en' : 'en',
        }),
      })
      if (res.ok) setState('done')
      else if (res.status === 409) setState('duplicate') // unique(lower(email)) — already on the list
      else setState('error')
    } catch {
      setState('error')
    }
  }

  if (state === 'done' || state === 'duplicate') {
    return (
      <div
        style={{
          padding: '28px 24px',
          border: '1px solid rgba(200,240,77,0.25)',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(200,240,77,0.05)',
        }}
        role="status"
      >
        <p
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--color-stamp-onlight)',
            textTransform: 'uppercase',
            margin: '0 0 8px',
          }}
        >
          {state === 'done' ? "✓ You're on the list" : "✓ You're already on the list"}
        </p>
        <p style={{ fontSize: '1rem', color: 'var(--color-tally-onlight)', margin: 0, lineHeight: 1.6 }}>
          {state === 'done'
            ? "We'll only use your email to contact you about LOCK beta access. No spam, no third parties."
            : "This email is already registered — we'll be in touch about beta access."}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label htmlFor="f-name" style={labelStyle}>
          Name
        </label>
        <input type="text" id="f-name" name="name" autoComplete="name" style={inputStyle} />
      </div>

      {/* Email */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label htmlFor="f-email" style={labelStyle}>
          Email address
        </label>
        <input type="email" id="f-email" name="email" required autoComplete="email" style={inputStyle} />
      </div>

      {/* Role — hidden when the page presets it (per-entity landing pages) */}
      {!presetRole && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="f-role" style={labelStyle}>
            Role
          </label>
          <select id="f-role" name="role" style={{ ...inputStyle, appearance: 'none' }}>
            <option value="">— Select —</option>
            <option value="artist">Artist</option>
            <option value="booking_manager">Booking Manager</option>
            <option value="artist_manager">Artist Manager / Agency</option>
            <option value="production">Production Office</option>
            <option value="producer">Producer</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}

      {/* Message */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label htmlFor="f-message" style={labelStyle}>
          Message (optional)
        </label>
        <textarea id="f-message" name="message" rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={state === 'sending'}
        style={{
          padding: '14px 28px',
          backgroundColor: 'var(--color-stamp)',
          color: 'var(--color-ink)',
          fontFamily: 'var(--font-space-mono)',
          fontSize: '1rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          cursor: state === 'sending' ? 'wait' : 'pointer',
          width: '100%',
          opacity: state === 'sending' ? 0.7 : 1,
        }}
      >
        {state === 'sending' ? 'SENDING…' : (cta || 'JOIN THE WAITLIST →')}
      </button>

      {helper && (
        <p style={{ fontSize: '1rem', color: 'var(--color-tally-onlight)', margin: 0 }}>{helper}</p>
      )}

      {state === 'error' && (
        <p style={{ fontSize: '1rem', color: 'var(--color-void)', margin: 0 }} role="alert">
          Something went wrong — your input is still here, please try again.
        </p>
      )}

      <p
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '1rem',
          letterSpacing: '0.06em',
          color: 'var(--color-tally-onlight)',
          margin: 0,
        }}
      >
        No spam. Data is not shared with third parties.
      </p>
    </form>
  )
}
