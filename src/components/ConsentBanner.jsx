import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
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

// §14.1.4 first-party rule (owner ruling 18 Jul, audit T-55): NO third-party
// pixel on any evidence surface — public Passport, confirm ceremony, evidence
// screens. GA4 must never load while the viewer is ON one of these routes:
// consent is still recorded, the load simply waits for a non-evidence route
// (the next app open elsewhere). Matches both standalone and /app/ embed paths.
const EVIDENCE_SURFACE = /(^|\/)(passport|confirm|evidence)(\/|$)/
function onEvidenceSurface() {
  return EVIDENCE_SURFACE.test(window.location.pathname)
}

function loadGA() {
  if (onEvidenceSurface()) return
  if (document.getElementById('ga4-src')) return
  window.gtag('consent', 'update', { analytics_storage: 'granted' })
  const s = document.createElement('script')
  s.id = 'ga4-src'
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
  window.gtag('config', GA_ID, { anonymize_ip: true })
}

// Height of any OTHER bar docked to the viewport bottom (fixed/sticky — e.g. the
// Passport CTA bar or the mobile tab nav) so the banner sits ABOVE it instead of
// covering its interactive controls (§10.2 / §15.2 — the banner may never occlude).
function bottomBarOffset(exclude) {
  const w = window.innerWidth
  const h = window.innerHeight
  let offset = 0
  for (const x of [w / 2, 12, w - 12]) {
    for (const el of document.elementsFromPoint(x, h - 2)) {
      if (el === exclude || (exclude && exclude.contains(el))) continue
      if (el === document.documentElement || el === document.body) continue
      const pos = getComputedStyle(el).position
      if (pos !== 'fixed' && pos !== 'sticky') continue
      const r = el.getBoundingClientRect()
      // Only true bottom-docked bars (anchored to the viewport bottom edge).
      if (r.bottom >= h - 1 && r.top > h / 2) offset = Math.max(offset, h - r.top)
    }
  }
  return Math.round(offset)
}

export default function ConsentBanner() {
  const { T, lang } = useLang()
  const dir = lang === 'he' ? 'rtl' : 'ltr'
  const [visible, setVisible] = useState(false)
  const [offset, setOffset] = useState(0)
  const ref = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const choice = readChoice()
    if (choice === 'granted') loadGA()
    else if (choice === null) setVisible(true)
  }, [])

  // Docked-bar contract: never cover interactive content. While the banner is
  // open the app's scroll container (#root) is shrunk so it ends exactly at the
  // banner's top edge — the banner occupies RESERVED space below the content
  // instead of overlaying it, and any other bottom-docked bar stays visible
  // below the banner (the banner sits above it via `offset`). Fixed-position
  // descendants (CTA bars, sheets, toasts) escape the overflow clip, so only
  // in-flow content is pushed.
  useEffect(() => {
    if (!visible) return undefined
    const el = ref.current
    const root = document.getElementById('root')
    const sync = () => {
      const off = bottomBarOffset(el)
      setOffset(off)
      if (root) {
        root.style.height = `calc(100dvh - ${off + (el ? el.offsetHeight : 0)}px)`
        root.style.overflowY = 'auto'
      }
    }
    const raf = requestAnimationFrame(sync)
    window.addEventListener('resize', sync)
    const ro = el && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sync) : null
    if (ro) ro.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', sync)
      if (ro) ro.disconnect()
      if (root) {
        root.style.height = ''
        root.style.overflowY = ''
      }
    }
  }, [visible, pathname, lang])

  if (!visible) return null
  const t = T.cookieConsent

  const decide = (value) => {
    storeChoice(value)
    setVisible(false)
    if (value === 'granted') loadGA()
  }

  // Accept is the ONE lime-filled action on this bar; Decline is a quiet ghost
  // (.btn-ghost) — two competing filled buttons reads as a false choice, so
  // Decline stays exactly as easy to tap (same size/position, just unfilled).
  // Accept borrows .btn-primary's lime-gradient/dark-text look WITHOUT the
  // literal class: this bar can be visible over a screen that already has its
  // own .btn-primary (Sign in, Continue, …), and the "exactly one primary CTA
  // per view" law (scripts/test-fit.mjs · LOCK-PRODUCT-SPECIFICATION.md) counts
  // that selector — Accept must look primary without being counted as a
  // second one.
  const acceptClass = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-extrabold text-[#12160A] transition active:translate-y-px active:scale-[0.99] bg-gradient-to-b from-accent to-accent-deep hover:brightness-[1.06]'
  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={t.ariaLabel}
      dir={dir}
      style={{ bottom: offset }}
      className="fixed inset-x-0 z-[90] border-t border-line bg-bg2/95 px-4 py-2.5 backdrop-blur sm:px-6"
    >
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2">
        <p className="min-w-[14rem] flex-1 text-xs leading-snug text-muted">
          {t.message}{' '}
          <a
            href="https://lock.show/privacy"
            target="_blank"
            rel="noreferrer"
            className="tap-target inline-block text-ink underline decoration-line2 underline-offset-2 hover:text-accent"
          >
            {t.privacyLink}
          </a>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" className="btn-ghost !py-2 !px-4" onClick={() => decide('denied')}>
            {t.decline}
          </button>
          <button type="button" className={acceptClass} onClick={() => decide('granted')}>
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  )
}
