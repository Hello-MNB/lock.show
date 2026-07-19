'use client'

/**
 * GA4 Consent Mode v2 banner — spec: docs/legal/CONSENT-BANNER-SPEC.md
 * Defaults are DENIED (set in layout head). gtag.js is injected only after
 * the visitor grants consent; a stored grant loads it on return visits.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/locale-context'

const STORAGE_KEY = 'gigproof_consent'
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000 // re-ask after 12 months

type Choice = 'granted' | 'denied'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

function readChoice(): Choice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const { value, at } = JSON.parse(raw)
    if (!value || Date.now() - (at || 0) > MAX_AGE_MS) return null
    return value
  } catch {
    return null
  }
}

function storeChoice(value: Choice) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, at: Date.now() }))
  } catch {
    /* storage unavailable — banner re-shows next visit */
  }
}

// §14.1.4 first-party rule (owner ruling 18 Jul, audit T-55): no third-party
// pixel on evidence surfaces. On the site this matters for the 404-bounce
// moment, where the page path can briefly be /app/passport/… before the
// deep-link restore — GA must not load with an evidence path in the URL.
const EVIDENCE_SURFACE = /(^|\/)(passport|confirm|evidence)(\/|$)/

function loadGA(gaId: string) {
  if (EVIDENCE_SURFACE.test(window.location.pathname)) return
  if (document.getElementById('ga4-src')) return
  window.gtag('consent', 'update', { analytics_storage: 'granted' })
  const s = document.createElement('script')
  s.id = 'ga4-src'
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
  document.head.appendChild(s)
  window.gtag('config', gaId, { anonymize_ip: true })
}

export function ConsentBanner({ gaId }: { gaId: string }) {
  const { messages, dir } = useLocale()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const choice = readChoice()
    if (choice === 'granted') loadGA(gaId)
    else if (choice === null) setVisible(true)
  }, [gaId])

  if (!visible) return null
  const t = messages.consent

  const decide = (value: Choice) => {
    storeChoice(value)
    setVisible(false)
    if (value === 'granted') loadGA(gaId)
  }

  return (
    <div
      role="dialog"
      aria-label={t.ariaLabel}
      dir={dir}
      style={{
        position: 'fixed',
        insetInline: 0,
        bottom: 0,
        zIndex: 90,
        borderTop: '1px solid rgba(255,255,255,.08)',
        background: 'rgba(14,16,15,.95)',
        backdropFilter: 'blur(8px)',
        padding: '12px 20px',
      }}
    >
      <div
        style={{
          margin: '0 auto',
          maxWidth: 760,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <p style={{ flex: '1 1 320px', fontSize: 14, color: 'var(--color-tally, #98A19A)', margin: 0 }}>
          {t.message}{' '}
          <Link href="/privacy" style={{ color: 'var(--color-paper, #F3F0E8)', textDecoration: 'underline' }}>
            {t.privacyLink}
          </Link>
        </p>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => decide('denied')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,.15)',
              background: 'transparent',
              color: 'var(--color-paper, #F3F0E8)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t.decline}
          </button>
          <button
            type="button"
            onClick={() => decide('granted')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(180deg,#BEE24E,#9FD531)',
              color: '#12160A',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  )
}
