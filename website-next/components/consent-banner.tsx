'use client'

/**
 * GA4 Consent Mode v2 banner — spec: docs/legal/CONSENT-BANNER-SPEC.md
 * Defaults are DENIED (set in layout head). gtag.js is injected only after
 * the visitor grants consent; a stored grant loads it on return visits.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/locale-context'

const STORAGE_KEY = 'lockshow_consent'
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000 // re-ask after 12 months

type Choice = 'granted' | 'denied'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

function measurementContext() {
  const host = window.location.hostname
  const environment =
    host === 'localhost' || host === '127.0.0.1'
      ? 'development'
      : host.includes('vercel.app')
        ? 'staging'
        : 'production'

  return {
    surface: 'marketing',
    auth_state: 'anonymous',
    route_name: window.location.pathname || '/',
    environment,
    event_schema_version: 'site-2026-07-14',
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

function loadGA(gaId: string) {
  if (document.getElementById('ga4-src')) return
  window.gtag('consent', 'update', { analytics_storage: 'granted' })
  const s = document.createElement('script')
  s.id = 'ga4-src'
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
  document.head.appendChild(s)
  window.gtag('config', gaId, { anonymize_ip: true, ...measurementContext() })
}

function loadGTM(gtmId: string) {
  if (document.getElementById('gtm-src')) return
  window.gtag('consent', 'update', { analytics_storage: 'granted' })
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: 'lock_consent_granted', ...measurementContext() })
  const s = document.createElement('script')
  s.id = 'gtm-src'
  s.async = true
  s.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`
  document.head.appendChild(s)
}

function loadMeasurement({ gaId, gtmId }: { gaId: string; gtmId?: string }) {
  if (gtmId) loadGTM(gtmId)
  else loadGA(gaId)
}

export function ConsentBanner({ gaId, gtmId }: { gaId: string; gtmId?: string }) {
  const { messages, dir } = useLocale()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const choice = readChoice()
    if (choice === 'granted') loadMeasurement({ gaId, gtmId })
    else if (choice === null) queueMicrotask(() => setVisible(true))
  }, [gaId, gtmId])

  if (!visible) return null
  const t = messages.consent

  const decide = (value: Choice) => {
    storeChoice(value)
    setVisible(false)
    if (value === 'granted') loadMeasurement({ gaId, gtmId })
  }

  return (
    <div
      className="mk-consent"
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
        className="mk-consent__inner"
        style={{
          margin: '0 auto',
          maxWidth: 760,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <p className="mk-consent__text" style={{ flex: '1 1 320px', fontSize: 14, color: 'var(--color-tally, #98A19A)', margin: 0 }}>
          {t.message}{' '}
          <Link href="/privacy" style={{ color: 'var(--color-paper, #F3F0E8)', textDecoration: 'underline' }}>
            {t.privacyLink}
          </Link>
        </p>
        <div className="mk-consent__actions" style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
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
