import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { Field, Spinner, ErrorNote, SocialAuthButtons, OrDivider } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { OAUTH_ENABLED } from '../../lib/constants.js'
import AuthScene from './AuthScene.jsx'

export default function Signup() {
  const { T } = useLang()
  const { signUp, signInWithOAuth } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState(loc.state?.email || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmPending, setConfirmPending] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await signUp({ email, password, fullName })
      if (!data.session) {
        // Supabase requires email confirmation — user is not yet logged in.
        setConfirmPending(true)
      } else {
        nav('/select')
      }
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
    <AuthScene tagline="Your nights, made provable.">
      <h1 className="mb-1 text-2xl font-bold text-ink">{T.signup.title}</h1>
      <p className="mb-6 text-sm text-muted">{T.signup.heroLine}</p>
      {OAUTH_ENABLED && (
        <>
          <SocialAuthButtons onOAuth={signInWithOAuth} />
          <OrDivider />
        </>
      )}
      <form onSubmit={onSubmit}>
        <ErrorNote>{error}</ErrorNote>
        <Field label={T.signup.name}>
          <input className="field" placeholder="Your name"
            value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </Field>
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
