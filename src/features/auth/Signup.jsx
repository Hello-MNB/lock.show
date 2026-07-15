import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { Field, Spinner, ErrorNote, SocialAuthButtons, OrDivider } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { OAUTH_ENABLED } from '../../lib/constants.js'
import { logEvent, EVENTS } from '../../lib/analytics.js'
import { PENDING_ROLE_KEY, JOB_ROLES } from './roleHint.js'
import AuthScene from './AuthScene.jsx'

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
      if (session) { logEvent(EVENTS.SIGNUP, { surface: import.meta.env.BASE_URL === '/app/' ? 'embed' : 'standalone' }); nav('/select') }
      else setConfirmPending(true)
    } catch (err) {
      setError(err?.message?.includes('registered') ? T.signup.error : (err.message || T.common.error))
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
      <form onSubmit={onSubmit}>
        <ErrorNote>{error}</ErrorNote>
        <div className="grid grid-cols-2 gap-3">
          <Field label={T.signup.firstName}>
            <input className="field" placeholder={T.signup.firstNamePlaceholder} autoComplete="given-name"
              value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </Field>
          <Field label={T.signup.lastName}>
            <input className="field" placeholder={T.signup.lastNamePlaceholder} autoComplete="family-name"
              value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </Field>
        </div>
        <Field label={T.signup.email}>
          <input className="field" type="email" dir="ltr" autoComplete="email"
            placeholder="you@stage.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label={T.signup.password} hint={T.common.minChars}>
          <input className="field" type="password" autoComplete="new-password" minLength={6}
            placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
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
