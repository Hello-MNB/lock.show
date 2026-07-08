import { useEffect, useState } from 'react'
import { useLang } from '../context/LangContext.jsx'

const GA_ID = 'G-ZX907M2NY8'
const STORAGE_KEY = 'gigproof_consent'
// Re-ask after 12 months (spec: docs/legal/CONSENT-BANNER-SPEC.md)
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000

function readChoice() {
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

function storeChoice(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, at: Date.now() }))
  } catch {
    /* private mode — banner will just re-show next visit */
  }
}

function loadGA() {
  if (document.getElementById('ga4-src')) return
  window.gtag('consent', 'update', { analytics_storage: 'granted' })
  const s = document.createElement('script')
  s.id = 'ga4-src'
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
  window.gtag('config', GA_ID, { anonymize_ip: true })
}

export default function ConsentBanner() {
  const { T, lang } = useLang()
  const dir = lang === 'he' ? 'rtl' : 'ltr'
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const choice = readChoice()
    if (choice === 'granted') loadGA()
    else if (choice === null) setVisible(true)
  }, [])

  if (!visible) return null
  const t = T.cookieConsent

  const decide = (value) => {
    storeChoice(value)
    setVisible(false)
    if (value === 'granted') loadGA()
  }

  return (
    <div
      role="dialog"
      aria-label={t.ariaLabel}
      dir={dir}
      className="fixed inset-x-3 bottom-20 z-[90] mx-auto max-w-3xl rounded-md border border-line bg-bg2/95 shadow-card backdrop-blur px-4 py-3 sm:inset-x-6 sm:px-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-muted">
          {t.message}{' '}
          <a
            href="https://gigproof-website.vercel.app/privacy"
            target="_blank"
            rel="noreferrer"
            className="text-ink underline decoration-line2 underline-offset-2 hover:text-accent"
          >
            {t.privacyLink}
          </a>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" className="btn-ghost !py-2 !px-4" onClick={() => decide('denied')}>
            {t.decline}
          </button>
          <button type="button" className="btn-primary !py-2 !px-4" onClick={() => decide('granted')}>
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  )
}
