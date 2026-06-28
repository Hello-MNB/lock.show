import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { PageShell, Wordmark, Field, Spinner, ErrorNote, SocialAuthButtons, OrDivider, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

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
      <PageShell max="max-w-sm">
        <div className="text-center mb-8">
          <Wordmark className="justify-center mb-3" />
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-3">📧</div>
          <h2 className="text-lg font-bold text-soft mb-2">{T.signup.confirmTitle}</h2>
          <p className="text-sm text-muted mb-4">{T.signup.confirmBody(email)}</p>
          <Link to="/login" className="btn-primary block">{T.signup.backToLogin}</Link>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell max="max-w-sm">
      <div className="text-center mb-8">
        <Wordmark className="justify-center mb-3" />
        <LanguageToggle />
        <h1 className="text-xl font-bold text-soft">{T.signup.title}</h1>
      </div>
      <div className="card">
        <SocialAuthButtons onOAuth={signInWithOAuth} />
        <OrDivider />
      </div>
      <form onSubmit={onSubmit} className="card">
        <ErrorNote>{error}</ErrorNote>
        <Field label={T.signup.name}>
          <input className="field" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </Field>
        <Field label={T.signup.email}>
          <input className="field" type="email" dir="ltr" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label={T.signup.password} hint={T.common.minChars}>
          <input className="field" type="password" autoComplete="new-password" minLength={6}
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <><Spinner /> {T.common.loading}</> : T.signup.cta}
        </button>
        <p className="text-center mt-4 text-sm text-muted">
          <Link to="/login" className="text-accent">{T.signup.secondary}</Link>
        </p>
      </form>
    </PageShell>
  )
}
