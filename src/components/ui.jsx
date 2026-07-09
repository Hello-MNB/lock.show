import { useState, useCallback, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import { useLang } from '../context/LangContext.jsx'
import { STATUS, methodLabelFor, OAUTH_FACEBOOK_ENABLED } from '../lib/constants.js'

// ── BottomSheet — mobile-first sheet (slides from the bottom in the thumb zone;
// centered card on desktop). Controlled: <BottomSheet open onClose title>…</BottomSheet>.
// PORTALED to <body>: an ancestor with backdrop-filter/transform (e.g. the shell
// header's backdrop-blur) creates a containing block that clamps fixed children —
// audit E4 found the workspace sheet trapped inside the 56px header, making
// switching impossible on mobile. The portal makes `fixed inset-0` mean the
// real viewport regardless of where the sheet is mounted.
export function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-bg/70" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm bg-surface border-t sm:border border-line2 rounded-t-2xl sm:rounded-2xl p-5 shadow-card"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
        {title && (
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-ink">{title}</h2>
            <button onClick={onClose} aria-label="close" className="text-muted hover:text-ink text-2xl leading-none min-h-[40px] px-2">×</button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
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
      {/* bottom-20 on mobile clears the fixed BottomNav (h-16); desktop has no bottom bar */}
      <div className="fixed bottom-20 sm:bottom-4 inset-x-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} role="status"
            className="pointer-events-auto flex items-center gap-2.5 rounded bg-surface border border-line2 px-4 py-2.5 text-sm font-bold text-ink shadow-card animate-fade-in">
            <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${t.type === 'warn' ? 'bg-amber' : 'bg-accent'}`} />
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

// `demo` (DEMO build persona-picker mode, no real Supabase client): the buttons
// stay tappable — never inert — but explain via toast instead of attempting a
// real OAuth call (there is no supabase client to call in DEMO). This wins over
// `disabled` (the OAUTH_ENABLED-off "coming soon" state) so a demo build never
// silently no-ops a tap.
export function SocialAuthButtons({ onOAuth, disabled = false, demo = false }) {
  const { T } = useLang()
  const { show } = useToast()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function handle(provider) {
    if (demo) { show(T.login.oauthDemoNotice, 'warn'); return }
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

  const inert = disabled && !demo
  const btnClass = `w-full flex items-center justify-center gap-3 py-3 px-4 rounded-sm border border-line2 bg-surface2 text-sm font-medium transition-colors ${
    inert ? 'opacity-50 cursor-not-allowed text-muted' : 'hover:bg-raise text-ink'
  }`

  return (
    <div className={`space-y-2 ${inert ? 'pointer-events-none' : ''}`}>
      {err && <ErrorNote>{err}</ErrorNote>}
      <button type="button" disabled={busy || inert}
        className={btnClass}
        title={inert ? T.login.oauthComingSoon : undefined}
        onClick={() => handle('google')}>
        <GoogleIcon />
        {T.login.googleCta}
      </button>
      {OAUTH_FACEBOOK_ENABLED && (
        <button type="button" disabled={busy || inert}
          className={btnClass}
          title={inert ? T.login.oauthComingSoon : undefined}
          onClick={() => handle('facebook')}>
          <FacebookIcon />
          {T.login.facebookCta}
        </button>
      )}
      {inert && <p className="text-xs text-muted text-center">{T.login.oauthComingSoon}</p>}
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
  // Skeleton shimmer, not a spinner — the screen "arrives", it doesn't churn.
  return (
    <div className="py-10 space-y-3" role="status" aria-live="polite">
      <div className="skeleton h-5 w-2/5" />
      <div className="skeleton h-4 w-4/5" />
      <div className="skeleton h-4 w-3/5" />
      <span className="sr-only">{label ?? T.common.loading}</span>
    </div>
  )
}

// ── THE 5-STATE DATA-COLLECTION VOCABULARY (master-class mandate §1) ─────────
// Every state = ONE color + ONE icon + ONE verb, everywhere. Text + a distinct
// SHAPE icon, never color alone (WCAG 1.4.1) — categorical, never a gauge.
//   ✦ found          gold  — "we discovered something for you" (gentle glow)
//   ✓ confirmed      lime  — "locked into your proof"
//   ◌ developing     teal  — "growing, more to surface"
//   + needs-you      amber — "one small step, big value" (invitation, never shame)
//   ○ not-assessable grey  — "not relevant to you" (removed weight, never a gap)
const STATE_DEF = {
  found: { icon: '✦', c: 'bg-found-bg text-found glow-found', key: 'found' },
  confirmed: { icon: '✓', c: 'bg-good-bg text-good', key: 'strong' },
  developing: { icon: '◌', c: 'bg-dev-bg text-dev', key: 'developing' },
  'needs-you': { icon: '+', c: 'bg-need-bg text-need', key: 'missing' },
  'not-assessable': { icon: '○', c: 'bg-na-bg text-na', key: 'notAssessable' },
}

// Legacy status values (STATUS.* and older chip vocab) → canonical state.
const STATE_ALIAS = {
  [STATUS.STRONG]: 'confirmed',
  [STATUS.DEVELOPING]: 'developing',
  [STATUS.MISSING]: 'needs-you',
  [STATUS.NOT_ASSESSABLE]: 'not-assessable',
  ok: 'confirmed',
  warn: 'developing',
  gap: 'needs-you',
  na: 'not-assessable',
}

// Canonical state badge. <StateBadge state="found" /> — or pass children to
// override the verb ("6 gigs found"). Accepts canonical states AND legacy
// STATUS.* values, so existing call sites can migrate gradually.
export function StateBadge({ state, children, className = '' }) {
  const { T } = useLang()
  const s = STATE_DEF[state] ?? STATE_DEF[STATE_ALIAS[state]] ?? STATE_DEF['not-assessable']
  return (
    <span className={`chip ${s.c} ${className}`}>
      <span aria-hidden="true">{s.icon}</span> {children ?? T.status[s.key]}
    </span>
  )
}

// Bounded status pill — the ONLY status vocabulary the firewall permits.
// Back-compat wrapper: keeps accepting the STATUS.* prop values used across
// the app, now rendered through the canonical 5-state vocabulary above.
export function StatusChip({ status }) {
  return <StateBadge state={status} />
}

// ── MethodLabel — trust jewelry, not debug metadata (mandate §3). Mono,
// uppercase, small and precise; gold border/text on transparent;
// producer-confirmed (strongest) in lime.
// <MethodLabel variant="lime">PRODUCER-CONFIRMED</MethodLabel>
export function MethodLabel({ children, variant = 'gold' }) {
  const v = variant === 'lime' || variant === 'producer'
    ? 'border-accent/30 text-accent'
    : 'border-gold/30 text-gold'
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border bg-transparent px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] ${v}`}>
      {children}
    </span>
  )
}

// ── BandPill — a bounded range that reads human: numbers only WITH context
// words, e.g. <BandPill context="paid heads">180–300</BandPill> →
// "180–300 paid heads". Bordered mono capsule — NEVER a progress bar/gauge.
export function BandPill({ children, context }) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded-full border border-line2 bg-surface2 px-2.5 py-1 font-mono text-xs text-ink">
      {children}
      {context && <span className="text-muted">{context}</span>}
    </span>
  )
}

// ── reviewedDate — dates as humans say them: "Reviewed June 2026" (mandate §3).
// Returns '' for missing/invalid input so callers can render-or-skip.
export function reviewedDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return `Reviewed ${d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
}

// ── NextMove — the artist's ONE next move (mandate §3): what → why it matters
// → one action. Neutral surface (restraint: no tinted card, no aura) — the
// lime primary button IS the view's single accent moment. Renders `action`
// (any node) if given, else a primary button from cta/onAction. Use at most
// one per view.
export function NextMove({ label = 'Next move', what, why, cta, onAction, action, className = '' }) {
  return (
    <section className={`card ${className}`}>
      <p className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</p>
      <h3 className="font-display text-[19px] leading-snug text-ink">{what}</h3>
      {why && <p className="mt-1 text-sm text-muted">{why}</p>}
      {(action || cta) && (
        <div className="mt-4">
          {action ?? <button type="button" className="btn-primary" onClick={onAction}>{cta}</button>}
        </div>
      )}
    </section>
  )
}

// The 6 METHOD LABELS (firewall §3) — distinct SHAPE icon each (UX §15.1).
// Producer-confirmed is strongest. Categorical icons, never a gauge.
const METHOD_ICON = {
  'producer-confirmed': { icon: '★', variant: 'lime' }, // strongest — lime
  'evidence-supported': { icon: '✓', variant: 'gold' },
  'source-linked': { icon: '↗', variant: 'gold' },
  'artist-declared': { icon: '✎', variant: 'gold' },
  'unable-to-verify': { icon: '?', variant: 'gold' },
  stale: { icon: '↻', variant: 'gold' },
}

// Method label for a fact (the 6-label SSOT). Pass a claim's verification_status
// as `status` and (optionally) its `methodLabel` override (e.g. producer-confirmed).
export function SourceLabel({ status, methodLabel, expiresAt }) {
  const { T } = useLang()
  const key = methodLabelFor({ method_label: methodLabel, verification_status: status, expires_at: expiresAt })
  const m = METHOD_ICON[key] ?? METHOD_ICON['artist-declared']
  return (
    <MethodLabel variant={m.variant}>
      <span aria-hidden="true">{m.icon}</span> {T.methodLabel[key]}
    </MethodLabel>
  )
}

// Language toggle pill — place in any header.
export function LanguageToggle() {
  const { lang, setLang, T } = useLang()
  return (
    <button
      onClick={() => setLang(lang === 'he' ? 'en' : 'he')}
      className="text-xs font-mono font-semibold text-muted border border-line rounded-full px-3 py-1 hover:text-ink hover:border-line2 transition"
      title={T.common.switchLanguage}
      aria-label={T.common.switchLanguage}
    >
      {T.common.langCode}
    </button>
  )
}

export function Field({ label, hint, error, children }) {
  return (
    <div className="mb-4">
      {label && <label className="label">{label}</label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-xs text-need">{error}</p>}
    </div>
  )
}

export function PageShell({ children, max = 'max-w-xl' }) {
  // Spacing rhythm: 16px gutters on mobile → 32/44 on desktop (spec layout)
  return (
    <div className="min-h-full px-4 py-6 sm:px-8 md:py-11">
      <div className={`mx-auto ${max} animate-fade-in`}>{children}</div>
    </div>
  )
}

// ── CODEX icon sprite (public/assets/gigproof-icons.svg, 18 symbols) ─────────
export function GpIcon({ id, className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <use href={`/assets/gigproof-icons.svg#${id}`} />
    </svg>
  )
}

// ── Platform marks — the artist's content world, recognizable at a glance ────
// Brand color + simplified glyph. Never a metric, purely identity.
const PLATFORMS = {
  spotify: { bg: '#1DB954', glyph: <g stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none"><path d="M7.5 15.2c2.8-.8 6-.7 8.7.7" /><path d="M7 12c3.3-1 7-.8 10 .9" /><path d="M6.5 8.8c3.9-1.2 8.4-.9 11.8 1.1" /></g> },
  instagram: { bg: '#E1306C', glyph: <g stroke="#fff" strokeWidth="1.8" fill="none"><rect x="5.5" y="5.5" width="13" height="13" rx="3.5" /><circle cx="12" cy="12" r="3" /><circle cx="16.2" cy="7.8" r="0.6" fill="#fff" stroke="none" /></g> },
  youtube: { bg: '#FF0000', glyph: <path d="M10 8.5v7l6-3.5z" fill="#fff" /> },
  soundcloud: { bg: '#FF5500', glyph: <g stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M6 14v3M9 12v5M12 10v7M15 9v8" /><path d="M15 17h2.5a2.5 2.5 0 0 0 .4-4.97A4.5 4.5 0 0 0 15 9.5" fill="none" /></g> },
  tiktok: { bg: '#0A0D0B', glyph: <path d="M13 6v8.2a2.8 2.8 0 1 1-2.4-2.77M13 6c.3 1.8 1.6 3.2 3.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" /> },
  facebook: { bg: '#1877F2', glyph: <path d="M13.5 8H15V5.5h-1.8c-2 0-3.2 1.3-3.2 3.3V11H8v2.5h2V19h2.6v-5.5h2.1l.4-2.5h-2.5V9c0-.6.3-1 .9-1z" fill="#fff" /> },
  apple: { bg: '#FA243C', glyph: <path d="M15.5 6.5v7.2a2.3 2.3 0 1 1-1.8-2.25V8l-4 1v6.2a2.3 2.3 0 1 1-1.8-2.25V7.5z" fill="#fff" /> },
  bandcamp: { bg: '#629AA9', glyph: <path d="M6 15.5 10.5 8.5H18L13.5 15.5z" fill="#fff" /> },
}

export function platformOf(url = '') {
  const u = url.toLowerCase()
  for (const k of Object.keys(PLATFORMS)) if (u.includes(k === 'youtube' ? 'youtu' : k)) return k
  if (u.includes('music.apple')) return 'apple'
  return null
}

export function PlatformMark({ platform, size = 'h-7 w-7' }) {
  const p = PLATFORMS[platform]
  if (!p) return (
    <span className={`grid ${size} shrink-0 place-items-center rounded-full bg-surface text-muted`} data-platform="link">
      <GpIcon id="gp-source" className="h-4 w-4" />
    </span>
  )
  return (
    <span className={`grid ${size} shrink-0 place-items-center rounded-full`} style={{ background: p.bg }} data-platform={platform} aria-hidden="true">
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">{p.glyph}</svg>
    </span>
  )
}

export function Wordmark({ className = '' }) {
  // LOCK wordmark: lime "L" square (30px, rounded) + wordmark
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-accent font-display text-[15px] font-black text-bg" aria-hidden>
        L
      </span>
      <b className="text-sm font-extrabold tracking-tight text-ink">LOCK</b>
    </div>
  )
}

// ── HeroImage / PhotoCard — photography is structural (mandate §2). Image +
// gradient veil + optional warm gold radial aura behind it; children overlay
// the veil at the bottom (text always readable). Gold = atmosphere, lime = action.
// <HeroImage src={photo} alt="…" className="h-56"><h2>…</h2></HeroImage>
export function HeroImage({ src, alt = '', aura = true, className = '', children }) {
  return (
    <div className={`relative min-h-40 overflow-hidden rounded-xl bg-surface ${className}`}>
      {aura && <div aria-hidden="true" className="pointer-events-none absolute -inset-10 aura-gold" />}
      {src && <img src={src} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 veil-photo" />
      {children && <div className="absolute inset-x-0 bottom-0 p-5">{children}</div>}
    </div>
  )
}
export const PhotoCard = HeroImage

// ── EmptyState — never a grey box (mandate §2). With `image` it sells the
// dream: photo + display headline ("Your proof starts here") + next action.
// Back-compat: <EmptyState title action /> still renders the plain dark card.
export function EmptyState({ title, action, image, imageAlt = '', headline }) {
  if (!image) {
    return (
      <div className="card text-center">
        {headline && <h3 className="mb-1 font-display text-xl text-ink">{headline}</h3>}
        <p className="text-muted">{title}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    )
  }
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface text-center shadow-card">
      <HeroImage src={image} alt={imageAlt} className="h-44 sm:h-56 rounded-none" />
      <div className="relative -mt-10 px-6 pb-6">
        {headline && <h3 className="font-display text-2xl text-ink">{headline}</h3>}
        {title && <p className="mt-1 text-muted">{title}</p>}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  )
}

export function ErrorNote({ children }) {
  if (!children) return null
  return <p role="alert" className="mb-4 rounded-lg bg-need-bg border border-need/25 px-4 py-3 text-sm text-need">{children}</p>
}

// Load-failure state with an optional retry. Use in place of a silent empty list.
export function ErrorState({ title, onRetry }) {
  const { T } = useLang()
  return (
    <div className="card text-center" role="alert">
      <p className="text-ink">{title ?? T.common.error}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost mt-4">{T.common.continue}</button>
      )}
    </div>
  )
}
