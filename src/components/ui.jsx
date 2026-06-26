import { useState } from 'react'
import { useLang } from '../context/LangContext.jsx'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
    </svg>
  )
}

export function SocialAuthButtons({ onOAuth }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function handle(provider) {
    setErr('')
    setBusy(true)
    try {
      await onOAuth(provider)
    } catch (e) {
      setErr(e.message || 'שגיאה בכניסה עם רשת חברתית')
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      {err && <ErrorNote>{err}</ErrorNote>}
      <button type="button" disabled={busy}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-line bg-surface hover:bg-card text-soft text-sm font-medium transition-colors"
        onClick={() => handle('google')}>
        <GoogleIcon />
        כניסה עם Google
      </button>
      <button type="button" disabled={busy}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-line bg-surface hover:bg-card text-soft text-sm font-medium transition-colors"
        onClick={() => handle('facebook')}>
        <FacebookIcon />
        כניסה עם Facebook
      </button>
    </div>
  )
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-line" />
      <span className="text-xs text-muted">או</span>
      <div className="flex-1 h-px bg-line" />
    </div>
  )
}

export function Spinner({ className = '' }) {
  return (
    <span
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden
    />
  )
}

export function Loading({ label = T.common.loading }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted">
      <Spinner /> <span>{label}</span>
    </div>
  )
}

// Bounded status pill — the ONLY status vocabulary the firewall permits.
export function StatusChip({ status }) {
  const { T } = useLang()
  const map = {
    strong: { t: T.status.strong, c: 'bg-ok/15 text-ok' },
    developing: { t: T.status.developing, c: 'bg-warn/15 text-warn' },
    missing: { t: T.status.missing, c: 'bg-gap/20 text-soft' },
    notAssessable: { t: T.status.notAssessable, c: 'bg-gap/20 text-muted' },
  }
  const s = map[status] ?? map.notAssessable
  return <span className={`chip ${s.c}`}>{s.t}</span>
}

// Quiet provenance label for a fact (verified / supporting / self-reported).
export function SourceLabel({ status }) {
  const { T } = useLang()
  const map = {
    verified: { t: `${T.source.verified} · ${T.source.publicRecord}`, c: 'text-accent' },
    supporting: { t: T.source.supporting, c: 'text-soft' },
    'self-reported': { t: T.source.byArtist, c: 'text-muted' },
  }
  const s = map[status] ?? map['self-reported']
  return <span className={`text-[11px] ${s.c}`}>{s.t}</span>
}

// Language toggle pill — place in any header.
export function LanguageToggle() {
  const { lang, setLang } = useLang()
  return (
    <button
      onClick={() => setLang(lang === 'he' ? 'en' : 'he')}
      className="text-xs font-semibold text-muted border border-line rounded-full px-3 py-1 hover:text-soft hover:border-soft transition"
      title={lang === 'he' ? 'Switch to English' : 'עבור לעברית'}
    >
      {lang === 'he' ? 'EN' : 'עב'}
    </button>
  )
}

export function Field({ label, hint, error, children }) {
  return (
    <div className="mb-4">
      {label && <label className="label">{label}</label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function PageShell({ children, max = 'max-w-xl' }) {
  return (
    <div className="min-h-full px-4 py-6">
      <div className={`mx-auto ${max} animate-fade-in`}>{children}</div>
    </div>
  )
}

export function Wordmark({ className = '' }) {
  return (
    <div className={`text-2xl font-extrabold tracking-tight ${className}`}>
      GIG<span className="text-accent">PROOF</span>
    </div>
  )
}

// Sticky bottom CTA bar (mobile-first CTA law: primary always reachable).
export function StickyCTA({ children }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-line bg-ink/95 px-4 py-3 backdrop-blur">
      {children}
    </div>
  )
}

export function EmptyState({ title, action }) {
  return (
    <div className="card text-center">
      <p className="text-muted">{title}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorNote({ children }) {
  if (!children) return null
  return <p className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{children}</p>
}
