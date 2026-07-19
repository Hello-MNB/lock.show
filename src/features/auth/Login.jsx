import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { Field, Spinner, ErrorNote, SocialAuthButtons } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { ROLES, OAUTH_ENABLED } from '../../lib/constants.js'
import { logEvent, EVENTS, isReturnVisit } from '../../lib/analytics.js'
import AuthScene from './AuthScene.jsx'
import { classifyAuthError, EMAIL_SHAPE } from './authError.js'

export default function Login() {
  const { T } = useLang()
  const { signIn, signInWithOAuth, demo, setDemoRole } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  // Prefill the email + show a friendly notice when Signup redirected here
  // because the account already exists (state.notice === 'exists').
  const [email, setEmail] = useState(loc.state?.email || '')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Per-field i18n validation (B1 QA finding 4 / §10.4): the form is
  // noValidate so the browser's native, non-localized bubbles never appear —
  // empty/invalid feedback comes from these keys in the active language.
  const [fieldErrors, setFieldErrors] = useState({})
  const alreadyExists = loc.state?.notice === 'exists'

  function validate() {
    const fe = {}
    if (!email.trim()) fe.email = T.login.emailRequired
    else if (!EMAIL_SHAPE.test(email.trim())) fe.email = T.login.emailInvalid
    if (!password) fe.password = T.login.passwordRequired
    setFieldErrors(fe)
    return Object.keys(fe).length === 0
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      await signIn({ email, password })
      // returning = this browser has held a session before (first-party
      // seen-marker, audit T-55) — the retention read model counts on it.
      logEvent(EVENTS.LOGIN, { via: 'password', returning: isReturnVisit('app') || undefined })
      // Honor the return path RequireAuth/AcceptInvite stashed in state.from
      // (deep link or /invite/:token) — otherwise every login dead-drops on "/"
      // and invited teammates / bounced deep-links never reach where they meant
      // to go. Falls back to RoleHome for a plain login.
      nav(loc.state?.from || '/')
    } catch (err) {
      // B1 finding 1: never tell the user their credentials are wrong when the
      // request never reached the server — classify, then show i18n text only.
      setError(T.login[classifyAuthError(err)])
    } finally {
      setLoading(false)
    }
  }

  // DEMO: persona switcher instead of a real login — subtle chips, same scene.
  if (demo) {
    // Artist goes STRAIGHT to onboarding — first value first, no consent wall
    // (privacy+processing consent now fires inline on onboarding step 1).
    // Other personas go to their home via RoleHome ('/').
    const personas = [
      [ROLES.ARTIST, T.roleSelect.artist, '/onboarding'], [ROLES.BOOKER, T.roleSelect.booker, '/'],
      [ROLES.PRODUCER, T.roleSelect.producer, '/'], [ROLES.AGENCY, T.roleSelect.agency, '/'],
      [ROLES.OPERATOR, T.roleSelect.operator, '/'],
    ]
    return (
      <AuthScene>
        <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">{T.demo.sampleData}</p>
        <h1 className="mb-1 text-2xl font-bold text-ink">{T.demo.title}</h1>
        <p className="mb-6 text-sm text-muted">{T.demo.subtitle}</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {personas.map(([role, label, route]) => (
            <button key={role} onClick={() => { setDemoRole(role); nav(route) }}
              className="min-h-[44px] rounded-full border border-line bg-surface2 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent/60 hover:bg-raise">
              {label}
            </button>
          ))}
        </div>
        <Link to="/passport/demo-artist" className="btn-ghost block w-full text-center">{T.demo.viewPassport}</Link>
      </AuthScene>
    )
  }

  return (
    <AuthScene>
      <h1 className="mb-1 text-2xl font-bold text-ink">{T.login.title}</h1>
      <p className="mb-6 text-sm text-muted">{T.login.heroLine}</p>
      {/* noValidate: validation feedback is ours (i18n, both languages) — the
          browser's native English-only bubbles never show (B1 finding 4). */}
      <form onSubmit={onSubmit} noValidate>
        {alreadyExists && (
          <p className="mb-3 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-ink">
            {T.login.alreadyExists}
          </p>
        )}
        <ErrorNote>{error}</ErrorNote>
        <Field label={T.login.email} error={fieldErrors.email}>
          <input className="field" type="email" dir="ltr" autoComplete="email"
            placeholder="you@stage.com" aria-invalid={!!fieldErrors.email}
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined })) }} />
        </Field>
        <Field label={T.login.password} error={fieldErrors.password}>
          {/* show/hide toggle — a spec component (§17.B.2), B1 finding 3 */}
          <div className="relative">
            <input className="field pe-16" type={showPw ? 'text' : 'password'} autoComplete="current-password"
              placeholder="••••••••" aria-invalid={!!fieldErrors.password}
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined })) }} />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? T.login.hidePasswordAria : T.login.showPasswordAria}
              className="absolute inset-y-0 end-0 flex min-h-[44px] min-w-[44px] items-center justify-center px-3 text-xs font-semibold text-muted transition hover:text-ink">
              {showPw ? T.login.hidePassword : T.login.showPassword}
            </button>
          </div>
        </Field>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <><Spinner /> {T.common.loading}</> : T.login.cta}
        </button>
        {/* text links get a ≥44px hit area without changing the visual design
            (B1 finding 2, §10.2 tap targets) */}
        <p className="mt-2 text-center text-sm">
          <Link to="/forgot-password" className="inline-flex min-h-[44px] items-center px-3 text-muted transition hover:text-ink">{T.login.forgot}</Link>
        </p>
        <p className="text-center text-sm text-muted">
          <Link to="/signup" className="inline-flex min-h-[44px] items-center px-3 font-semibold text-accent hover:underline">{T.login.secondary}</Link>
        </p>
      </form>
      {/* OAuth below the working form — disabled controls never lead the screen */}
      <div className="mt-6 border-t border-line pt-5">
        <SocialAuthButtons onOAuth={signInWithOAuth} disabled={!OAUTH_ENABLED} demo={demo} />
      </div>
    </AuthScene>
  )
}
