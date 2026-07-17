'use client'

// Role selector BEFORE the message (Codex rebuild brief §5.11).
//
// Submission mechanics are EXACTLY the existing ones: this only wraps the
// shared <WaitlistForm /> (components/waitlist-form.tsx → Supabase
// waitlist_signup, migration 026/033). The chosen role feeds the form's
// supported `presetRole` prop — values are the DB CHECK tokens (033):
//   artist · artist_manager · production · booking_manager · producer · other
// Hidden source attribution (?src=…) is already handled inside WaitlistForm:
// it appends the URL's src token to source_page on submit.

import { useState } from 'react'

import WaitlistForm from '@/components/waitlist-form'
import { contactContent, type WaitlistRole } from '@/content/contact'

const t = contactContent.en

export default function ContactLane() {
  const [role, setRole] = useState<WaitlistRole | null>(null)

  return (
    <div>
      {/* ── Role selector — comes before the message form ── */}
      <p
        id="contact-role-prompt"
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--color-tally-onlight)',
          margin: '0 0 1rem',
        }}
      >
        {t.form.rolePrompt}
      </p>
      <div
        role="radiogroup"
        aria-labelledby="contact-role-prompt"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.6rem',
          marginBottom: '1.75rem',
        }}
      >
        {t.form.roles.map((r) => {
          const active = role === r.value
          return (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setRole(r.value)}
              style={{
                minHeight: '44px',
                padding: '0.6rem 0.9rem',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: active ? 'var(--color-ink)' : 'var(--color-tally-onlight)',
                background: active ? 'rgba(200,240,77,0.35)' : '#ffffff',
                border: active
                  ? '1px solid var(--color-stamp-onlight)'
                  : '1px solid rgba(10,13,11,0.15)',
              }}
            >
              {r.label}
            </button>
          )
        })}
      </div>

      {/* ── The form itself — unchanged mechanics, role preset from above ── */}
      {role ? (
        <WaitlistForm presetRole={role} cta={t.form.submitLabel} helper={t.form.helper} />
      ) : (
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.6,
            color: 'var(--color-tally-onlight)',
            border: '1px dashed rgba(10,13,11,0.2)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            margin: 0,
          }}
        >
          {t.form.pickRoleHint}
        </p>
      )}
    </div>
  )
}
