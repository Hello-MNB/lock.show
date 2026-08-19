'use client'

import { useState } from 'react'

// ── First-party waitlist capture (Phase-1) ───────────────────────────────────
// SUPERSEDED SURFACE, STILL LIVE CODE. components/waitlist-join-form.tsx is the
// conversion form on /waitlist and components/contact-form.tsx is the form on
// /contact; this Phase-1 component is currently imported by neither. It is kept
// rather than deleted — it is prior work and the copy still reads — but it is NOT
// exempt from the write-path contract: an unmounted component that still POSTs a
// revoked table is a trap for whoever mounts it next.
//
// GAP-W1: writes through the governed RPC join_waitlist (migration 048), not into
// waitlist_signup. Migration 048 revokes anon INSERT, so the old direct write is
// a permanent 401 once applied.
//
// The values below are the PUBLISHABLE client credentials — they ship in every
// browser bundle by design; the table is write-only for the public and has zero
// public read columns. No third-party service touches the data.
const SUPABASE_URL = 'https://qexfndiyallwqhhzeerd.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_rEoMmflkjGIoAEUFBab_IA_c6k4tgOu'

const inputStyle: React.CSSProperties = {
  padding: '12px 14px',
  border: '1px solid rgba(10,13,11,0.15)',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: 'var(--color-paper)',
  fontFamily: 'var(--font-heebo)',
  fontSize: '0.95rem',
  color: 'var(--color-ink)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-space-mono)',
  fontSize: '0.65rem',
  letterSpacing: '0.1em',
  color: 'var(--color-tally-onlight)',
  textTransform: 'uppercase',
}

// Phase-1 offered four roles; B4-70.10 §10.1 defines six Entity/Roles. The two
// that renamed are mapped, not dropped — a legacy `booking_manager` IS the
// programmer/booker/buyer Entity/Role, and collapsing it to `other` would throw
// away the one thing the person told us.
const ENTITY_ROLE_FOR_LEGACY: Record<string, string> = {
  artist: 'artist',
  booking_manager: 'programmer_booker_buyer',
  producer: 'producer_promoter',
  other: 'other',
}

export default function WaitlistForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'duplicate' | 'error'>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return
    const fd = new FormData(e.currentTarget)
    setState('sending')
    try {
      const legacyRole = String(fd.get('role') || '')
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/join_waitlist`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_email: String(fd.get('email') || '').trim(),
          p_name: String(fd.get('name') || '').trim() || null,
          // The select is `required`, so an unanswered role no longer reaches
          // here as an empty string that the RPC would refuse as invalid_role.
          p_entity_role: ENTITY_ROLE_FOR_LEGACY[legacyRole] || 'other',
          p_message: String(fd.get('message') || '').trim() || null,
          p_source_page: typeof window !== 'undefined' ? window.location.pathname : null,
          p_cta_placement: 'phase1_waitlist_form',
          p_locale: typeof document !== 'undefined' ? document.documentElement.lang || 'en' : 'en',
        }),
      })
      if (!res.ok) { setState('error'); return }
      const out = await res.json()
      // `already` is a success with a different receipt — the 026 path surfaced
      // the same condition as an HTTP 409 from unique(lower(email)).
      if (out?.ok === true && out.code === 'joined') setState('done')
      else if (out?.ok === true && out.code === 'already') setState('duplicate')
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
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--color-stamp-onlight)',
            textTransform: 'uppercase',
            margin: '0 0 8px',
          }}
        >
          {state === 'done' ? '✓ Message sent' : '✓ We already have your message'}
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-tally-onlight)', margin: 0, lineHeight: 1.6 }}>
          {state === 'done'
            ? <>We usually reply within <bdi dir="ltr">1–2</bdi> business days. Your email is used only to reply — no spam, no third parties.</>
            : "This email has already reached us — we'll reply to your earlier message."}
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

      {/* Role */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label htmlFor="f-role" style={labelStyle}>
          Role
        </label>
        <select id="f-role" name="role" required style={{ ...inputStyle, appearance: 'none' }}>
          <option value="">— Select —</option>
          <option value="artist">Artist</option>
          <option value="booking_manager">Booking Manager</option>
          <option value="producer">Producer</option>
          <option value="other">Other</option>
        </select>
      </div>

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
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          cursor: state === 'sending' ? 'wait' : 'pointer',
          width: '100%',
          opacity: state === 'sending' ? 0.7 : 1,
        }}
      >
        {state === 'sending' ? 'SENDING…' : 'SEND MESSAGE →'}
      </button>

      {state === 'error' && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-void)', margin: 0 }} role="alert">
          Something went wrong — your input is still here, please try again.
        </p>
      )}

      <p
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.06em',
          color: 'var(--color-tally-onlight)',
          margin: 0,
        }}
      >
        We usually reply within <bdi dir="ltr">1–2</bdi> business days. No spam. Data is not shared with third parties.
      </p>
    </form>
  )
}
