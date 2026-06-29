import { useState, useCallback, createContext, useContext } from 'react'
import { useLang } from '../context/LangContext.jsx'
import { STATUS, methodLabelFor } from '../lib/constants.js'

// ── BottomSheet — mobile-first sheet (slides from the bottom in the thumb zone;
// centered card on desktop). Controlled: <BottomSheet open onClose title>…</BottomSheet>.
export function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm bg-card border-t sm:border border-line rounded-t-2xl sm:rounded-2xl p-5"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
        {title && (
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-soft">{title}</h2>
            <button onClick={onClose} aria-label="close" className="text-muted text-2xl leading-none min-h-[40px] px-2">×</button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

// ── Toast — global, bottom-anchored (thumb zone). useToast().show(msg, 'ok'|'warn').
const ToastCtx = createContext(null)
export const useToast = () => useContext(ToastCtx) || { show: () => {} }
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const show = useCallback((msg, type = 'ok') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, msg, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600)
  }, [])
  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 inset-x-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} role="status"
            className={`pointer-events-auto rounded-xl px-4 py-2 text-sm font-bold shadow-lg ${t.type === 'warn' ? 'bg-warn text-ink' : 'bg-ok text-ink'}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

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

export function SocialAuthButtons({ onOAuth, disabled = false }) {
  const { T } = useLang()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function handle(provider) {
    if (disabled) return
    setErr('')
    setBusy(true)
    try {
      await onOAuth(provider)
    } catch (e) {
      setErr(e.message || T.login.socialError)
      setBusy(false)
    }
  }

  const btnClass = `w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-line bg-surface text-sm font-medium transition-colors ${
    disabled ? 'opacity-50 cursor-not-allowed text-muted' : 'hover:bg-card text-soft'
  }`

  return (
    <div className={`space-y-2 ${disabled ? 'pointer-events-none' : ''}`}>
      {err && <ErrorNote>{err}</ErrorNote>}
      <button type="button" disabled={busy || disabled}
        className={btnClass}
        title={disabled ? T.login.oauthComingSoon : undefined}
        onClick={() => handle('google')}>
        <GoogleIcon />
        {T.login.googleCta}
      </button>
      <button type="button" disabled={busy || disabled}
        className={btnClass}
        title={disabled ? T.login.oauthComingSoon : undefined}
        onClick={() => handle('facebook')}>
        <FacebookIcon />
        {T.login.facebookCta}
      </button>
      {disabled && <p className="text-xs text-muted text-center">{T.login.oauthComingSoon}</p>}
    </div>
  )
}

export function OrDivider() {
  const { T } = useLang()
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-line" />
      <span className="text-xs text-muted">{T.common.or}</span>
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

export function Loading({ label }) {
  const { T } = useLang()
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted">
      <Spinner /> <span>{label ?? T.common.loading}</span>
    </div>
  )
}

// Bounded status pill — the ONLY status vocabulary the firewall permits.
// UX §15.1: text + a distinct SHAPE icon (filled/half/empty/dash), never
// color alone — satisfies WCAG 1.4.1 and the firewall (categorical, not a gauge).
export function StatusChip({ status }) {
  const { T } = useLang()
  const map = {
    [STATUS.STRONG]: { t: T.status.strong, c: 'bg-ok/15 text-ok', icon: '●' },
    [STATUS.DEVELOPING]: { t: T.status.developing, c: 'bg-warn/15 text-warn', icon: '◐' },
    [STATUS.MISSING]: { t: T.status.missing, c: 'bg-gap/20 text-soft', icon: '○' },
    [STATUS.NOT_ASSESSABLE]: { t: T.status.notAssessable, c: 'bg-gap/20 text-muted', icon: '–' },
  }
  const s = map[status] ?? map[STATUS.NOT_ASSESSABLE]
  return <span className={`chip ${s.c}`}><span aria-hidden="true">{s.icon}</span> {s.t}</span>
}

// The 6 METHOD LABELS (firewall §3) — distinct SHAPE icon each (UX §15.1).
// Producer-confirmed is strongest. Categorical icons, never a gauge.
const METHOD_ICON = {
  'producer-confirmed': { icon: '★', c: 'text-accent' },
  'evidence-supported': { icon: '✓', c: 'text-ok' },
  'source-linked': { icon: '↗', c: 'text-soft' },
  'artist-declared': { icon: '✎', c: 'text-muted' },
  'unable-to-verify': { icon: '?', c: 'text-muted' },
  stale: { icon: '↻', c: 'text-warn' },
}

// Method label for a fact (the 6-label SSOT). Pass a claim's verification_status
// as `status` and (optionally) its `methodLabel` override (e.g. producer-confirmed).
export function SourceLabel({ status, methodLabel, expiresAt }) {
  const { T } = useLang()
  const key = methodLabelFor({ method_label: methodLabel, verification_status: status, expires_at: expiresAt })
  const m = METHOD_ICON[key] ?? METHOD_ICON['artist-declared']
  return <span className={`text-[11px] ${m.c}`}><span aria-hidden="true">{m.icon}</span> {T.methodLabel[key]}</span>
}

// Language toggle pill — place in any header.
export function LanguageToggle() {
  const { lang, setLang, T } = useLang()
  return (
    <button
      onClick={() => setLang(lang === 'he' ? 'en' : 'he')}
      className="text-xs font-semibold text-muted border border-line rounded-full px-3 py-1 hover:text-soft hover:border-soft transition"
      title={T.common.switchLanguage}
      aria-label={T.common.switchLanguage}
    >
      <span aria-hidden="true">🌐 </span>{T.common.langCode}
    </button>
  )
}

export function Field({ label, hint, error, children }) {
  return (
    <div className="mb-4">
      {label && <label className="label">{label}</label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-xs text-red-400">{error}</p>}
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
  return <p role="alert" className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{children}</p>
}

// Load-failure state with an optional retry. Use in place of a silent empty list.
export function ErrorState({ title, onRetry }) {
  const { T } = useLang()
  return (
    <div className="card text-center" role="alert">
      <p className="text-soft">{title ?? T.common.error}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost mt-4">{T.common.continue}</button>
      )}
    </div>
  )
}
