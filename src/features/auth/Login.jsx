import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { PageShell, Wordmark, Field, Spinner, ErrorNote, SocialAuthButtons, OrDivider, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

export default function Login() {
  const { T } = useLang()
  const { signIn, signInWithOAuth } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn({ email, password })
      nav('/')
    } catch {
      setError(T.login.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell max="max-w-sm">
      <div className="text-center mb-8">
        <Wordmark className="justify-center mb-3" />
        <LanguageToggle />
        <h1 className="text-xl font-bold text-soft">{T.login.title}</h1>
      </div>
      <div className="card">
        <SocialAuthButtons onOAuth={signInWithOAuth} />
        <OrDivider />
      </div>
      <form onSubmit={onSubmit} className="card">
        <ErrorNote>{error}</ErrorNote>
        <Field label={T.login.email}>
          <input className="field" type="email" dir="ltr" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label={T.login.password}>
          <input className="field" type="password" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <><Spinner /> {T.common.loading}</> : T.login.cta}
        </button>
        <p className="text-center mt-3 text-sm text-muted">
          <Link to="/forgot-password" className="text-muted hover:text-soft">שכחתי סיסמה</Link>
        </p>
        <p className="text-center mt-2 text-sm text-muted">
          <Link to="/signup" className="text-accent">{T.login.secondary}</Link>
        </p>
      </form>
    </PageShell>
  )
}
