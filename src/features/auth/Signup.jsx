import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { Field, Spinner, ErrorNote, SocialAuthButtons, OrDivider } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { OAUTH_ENABLED } from '../../lib/constants.js'
import { logEvent, EVENTS, getFirstTouch } from '../../lib/analytics.js'
import { PENDING_ROLE_KEY, JOB_ROLES } from './roleHint.js'
import AuthScene from './AuthScene.jsx'
import { classifyAuthError, EMAIL_SHAPE } from './authError.js'

export default function Signup() {
  const { T } = useLang()
  const { signUp, signIn, signInWithOAuth, demo } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const fullName = `${firstName} ${lastName}`.trim()
  const [email, setEmail] = useState(loc.state?.email || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmPending, setConfirmPending] = useState(false)
  // Per-field i18n validation (§10.4 empty/typing/invalid states; mirrors the
  // same fix Login.jsx already carries — B1 finding 4): native English-only
  // browser bubbles never show (form is noValidate below); empty/invalid
  // feedback comes from these i18n keys in the active language instead.
  const [fieldErrors, setFieldErrors] = useState({})

  function validate() {
    const fe = {}
    if (!firstName.trim()) fe.firstName = T.signup.firstNameRequired
    if (!lastName.trim()) fe.lastName = T.signup.lastNameRequired
    if (!email.trim()) fe.email = T.signup.emailRequired
    else if (!EMAIL_SHAPE.test(email.trim())) fe.email = T.signup.emailInvalid
    if (!password) fe.password = T.signup.passwordRequired
    else if (password.length < 6) fe.password = T.signup.passwordTooShort
    setFieldErrors(fe)
    return Object.keys(fe).length === 0
  }

  // Persona-page handoff (cross-funnel seam): the website's /artists page
  // links here as `/signup?role=artist`. Stash the hint in sessionStorage —
  // not query/state alone — so it survives the email-confirmation
  // interruption too; UserTypeSelect reads it once the account exists.
  const roleHint = new URLSearchParams(loc.search).get('role')
  if (roleHint && JOB_ROLES.includes(roleHint)) {
    sessionStorage.setItem(PENDING_ROLE_KEY, roleHint)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      const data = await signUp({ email, password, fullName })
      // ALREADY-REGISTERED: Supabase anti-enumeration returns a user with an
      // EMPTY identities array and no session for an email that already exists —
      // no error, no session, so signup silently dead-ends (the exact confusion
      // Maria hit: "sign up lands me on /login"). Detect it and send them to LOG
      // IN with the email prefilled + a clear notice, instead of a dead end.
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        nav('/login', { state: { email, notice: 'exists' } })
        return
      }
      // PKCE gotcha: with flowType:'pkce' (needed for Google OAuth), signUp
      // returns session:null EVEN when the project auto-confirms emails
      // (mailer_autoconfirm=true) — it defers the session to a code exchange.
      // That dropped every email signup onto the "check your inbox" dead-end
      // and back to /login (Maria, 9 Jul), despite no confirmation being
      // required. When there's no session, try an immediate password sign-in:
      //  • auto-confirm ON  → sign-in succeeds → straight into /select.
      //  • confirmation ON  → sign-in throws "Email not confirmed" → we show
      //    the real "check your inbox" screen. Correct in both worlds.
      let session = data.session
      if (!session) {
        try {
          const signedIn = await signIn({ email, password })
          session = signedIn?.session ?? null
        } catch {
          /* genuine confirmation-required: fall through to confirmPending */
        }
      }
      // CFRO surface attribution: which build converted — the lock.show/app
      // embed (BASE_URL '/app/') or the standalone app.lock.show deploy.
      // + first-touch attribution (audit T-55): utm_*/referrer/landing captured
      // at first app open (main.jsx) — makes the signup traceable to the site
      // page / campaign / share link that produced it. First-party only.
      if (session) { logEvent(EVENTS.SIGNUP, { surface: import.meta.env.BASE_URL === '/app/' ? 'embed' : 'standalone', ...getFirstTouch() }); nav('/select') }
      else setConfirmPending(true)
    } catch (err) {
      // U8 / lexicon law (§17.B.1 STATES, matching Login's classifyAuthError
      // treatment): the raw Supabase/fetch error text must never reach the
      // screen. A dropped connection through the corporate/VPN/proxy layer
      // surfaced literally as "Failed to fetch" here before this fix (found
      // live against the real project) — classify it like Login does instead.
      if (err?.message?.includes('registered')) setError(T.signup.error)
      else {
        const kind = classifyAuthError(err)
        setError(kind === 'errorNetwork' ? T.signup.errorNetwork : kind === 'errorRateLimited' ? T.signup.errorRateLimited : T.common.error)
      }
    } finally {
      setLoading(false)
    }
  }

  if (confirmPending) {
    return (
      <AuthScene>
        <div className="card text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-surface2 text-gold" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </span>
          <h2 className="mb-2 text-lg font-bold text-ink">{T.signup.confirmTitle}</h2>
          <p className="mb-5 text-sm text-muted">{T.signup.confirmBody(email)}</p>
          <Link to="/login" className="btn-primary block">{T.signup.backToLogin}</Link>
        </div>
      </AuthScene>
    )
  }

  return (
    <AuthScene tagline={T.authScene.taglineSignup}>
      <h1 className="mb-1 text-2xl font-bold text-ink">{T.signup.title}</h1>
      <p className="mb-6 text-sm text-muted">{T.signup.heroLine}</p>
      {(OAUTH_ENABLED || demo) && (
        <>
          <SocialAuthButtons onOAuth={signInWithOAuth} disabled={!OAUTH_ENABLED} demo={demo} />
          <OrDivider />
        </>
      )}
      {/* noValidate: validation feedback is ours (i18n, both languages) — the
          browser's native English-only bubbles never show (mirrors Login.jsx,
          B1 finding 4). */}
      <form onSubmit={onSubmit} noValidate>
        <ErrorNote>{error}</ErrorNote>
        <div className="grid grid-cols-2 gap-3">
          <Field label={T.signup.firstName} error={fieldErrors.firstName}>
            <input className="field" placeholder={T.signup.firstNamePlaceholder} autoComplete="given-name"
              aria-invalid={!!fieldErrors.firstName}
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); if (fieldErrors.firstName) setFieldErrors((f) => ({ ...f, firstName: undefined })) }} />
          </Field>
          <Field label={T.signup.lastName} error={fieldErrors.lastName}>
            <input className="field" placeholder={T.signup.lastNamePlaceholder} autoComplete="family-name"
              aria-invalid={!!fieldErrors.lastName}
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); if (fieldErrors.lastName) setFieldErrors((f) => ({ ...f, lastName: undefined })) }} />
          </Field>
        </div>
        <Field label={T.signup.email} error={fieldErrors.email}>
          <input className="field" type="email" dir="ltr" autoComplete="email"
            placeholder="you@stage.com" aria-invalid={!!fieldErrors.email}
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined })) }} />
        </Field>
        <Field label={T.signup.password} hint={T.common.minChars} error={fieldErrors.password}>
          <input className="field" type="password" autoComplete="new-password" minLength={6}
            placeholder="••••••••" aria-invalid={!!fieldErrors.password}
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined })) }} />
        </Field>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <><Spinner /> {T.common.loading}</> : T.signup.cta}
        </button>
        <p className="mt-4 text-center text-sm text-muted">
          <Link to="/login" className="font-semibold text-accent hover:underline">{T.signup.secondary}</Link>
        </p>
      </form>
    </AuthScene>
  )
}
