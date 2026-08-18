'use client'

/**
 * GA4 Consent Mode v2 banner — spec: docs/legal/CONSENT-BANNER-SPEC.md
 * Defaults are DENIED (set in layout head). gtag.js is injected only after
 * the visitor grants consent; a stored grant loads it on return visits.
 */

import { useEffect, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/locale-context'

const STORAGE_KEY = 'gigproof_consent'
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000 // re-ask after 12 months

type Choice = 'granted' | 'denied'

// 'unknown' is the SERVER / first-hydration snapshot: the store has not been
// read yet, so the banner stays hidden. `null` means the store WAS read and
// holds no valid choice — that is the state that shows the banner.
type Snapshot = Choice | null | 'unknown'

// ─── localStorage as an external store ─────────────────────────────────────
// The stored consent choice lives OUTSIDE React, so it is READ with
// useSyncExternalStore rather than mirrored into state by an effect
// (react-hooks/set-state-in-effect).
//
// `sessionChoice` is the in-memory override. Without it a visitor whose
// localStorage throws (private mode, storage disabled, sandboxed iframe)
// could never dismiss the banner, because readChoice would keep reporting
// null. It preserves the pre-repair behaviour: the choice holds for the
// session, it just does not survive a reload.
let sessionChoice: Choice | null = null

const listeners = new Set<() => void>()

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange)
  return () => {
    listeners.delete(onStoreChange)
  }
}

function getServerSnapshot(): Snapshot {
  return 'unknown'
}

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

function readChoice(): Choice | null {
  if (sessionChoice !== null) return sessionChoice
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
  sessionChoice = value
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, at: Date.now() }))
  } catch {
    /* storage unavailable — banner re-shows next visit */
  }
  for (const listener of listeners) listener()
}

function loadGA(gaId: string) {
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
  const choice = useSyncExternalStore<Snapshot>(subscribe, readChoice, getServerSnapshot)

  // gtag.js is an external system, so loading it belongs in an effect. loadGA
  // is idempotent (it guards on the injected #ga4-src node), so re-running it
  // after a grant is a no-op rather than a second injection.
  useEffect(() => {
    if (choice === 'granted') loadGA(gaId)
  }, [choice, gaId])

  // Hidden for 'granted', 'denied' AND 'unknown' — identical to the previous
  // `visible` flag, which only ever turned true on a read that found nothing.
  if (choice !== null) return null
  const t = messages.consent

  const decide = (value: Choice) => {
    storeChoice(value)
  }

  return (
    <div
      role="dialog"
      aria-label={t.ariaLabel}
      dir={dir}
      className="consent-banner"
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
        className="consent-inner"
        style={{
          margin: '0 auto',
          maxWidth: 760,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <p
          className="consent-msg"
          style={{ flex: '1 1 320px', fontSize: 14, color: 'var(--color-tally, #98A19A)', margin: 0 }}
        >
          {t.message}{' '}
          <Link
            href="/privacy"
            style={{
              color: 'var(--color-paper, #F3F0E8)',
              textDecoration: 'underline',
              // ≥44px hit area without moving the text line (inline-block +
              // symmetric padding cancelled by negative margin)
              display: 'inline-block',
              padding: '0.95rem 0',
              margin: '-0.95rem 0',
            }}
          >
            {t.privacyLink}
          </Link>
        </p>
        <div className="consent-actions" style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => decide('denied')}
            style={{
              minHeight: '44px',
              minWidth: '44px',
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
              minHeight: '44px',
              minWidth: '44px',
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
      {/* T-97 P1: compact single-line variant at small widths (≤430px) so the
          fixed banner never covers a hero CTA (verified by elementFromPoint at
          320/390 in scripts/test-hero-contract.mjs). The full message stays in
          the DOM for assistive tech; visually it clamps to two short lines. */}
      <style>{`
        @media (max-width: 430px) {
          .consent-banner { padding: 6px 10px !important; }
          .consent-inner { flex-wrap: nowrap !important; gap: 8px !important; }
          .consent-msg {
            flex: 1 1 auto !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .consent-actions { gap: 6px !important; }
          .consent-actions button {
            padding: 6px 10px !important;
            font-size: 12px !important;
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  )
}
