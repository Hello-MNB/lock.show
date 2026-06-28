import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { PageShell, Wordmark, Field, Spinner, ErrorNote, SocialAuthButtons, OrDivider, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { ROLES, OAUTH_ENABLED } from '../../lib/constants.js'

export default function Login() {
  const { T } = useLang()
  const { signIn, signInWithOAuth, demo, setDemoRole } = useAuth()
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

  // DEMO: persona switcher instead of a real login.
  if (demo) {
    // Artist starts at /consent → onboarding (the real first-run journey, so the
    // demo shows the full flow). Other personas go to their home via RoleHome ('/').
    const personas = [
      [ROLES.ARTIST, T.roleSelect.artist, '/consent'], [ROLES.BOOKER, T.roleSelect.booker, '/'],
      [ROLES.PRODUCER, T.roleSelect.producer, '/'], [ROLES.AGENCY, T.roleSelect.agency, '/'],
      [ROLES.OPERATOR, T.roleSelect.operator, '/'],
    ]
    return (
      <PageShell max="max-w-md">
        <div className="text-center mb-6">
          <Wordmark className="justify-center mb-3" />
          <div className="flex justify-center mb-2"><LanguageToggle /></div>
          <h1 className="text-xl font-bold text-soft">{T.demo.title}</h1>
          <p className="text-xs text-muted mt-1">{T.demo.subtitle}</p>
        </div>
        <div className="space-y-3">
          {personas.map(([role, label, route]) => (
            <button key={role} onClick={() => { setDemoRole(role); nav(route) }}
              className="card w-full text-start text-lg font-bold text-soft hover:border-accent transition">{label}</button>
          ))}
          <Link to="/passport/demo-artist" className="btn-ghost w-full block text-center">{T.demo.viewPassport}</Link>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell max="max-w-sm">
      <div className="text-center mb-8">
        <Wordmark className="justify-center mb-3" />
        <LanguageToggle />
        <h1 className="text-xl font-bold text-soft">{T.login.title}</h1>
      </div>
      {OAUTH_ENABLED && (
        <div className="card">
          <SocialAuthButtons onOAuth={signInWithOAuth} />
          <OrDivider />
        </div>
      )}
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
          <Link to="/forgot-password" className="text-muted hover:text-soft">{T.login.forgot}</Link>
        </p>
        <p className="text-center mt-2 text-sm text-muted">
          <Link to="/signup" className="text-accent">{T.login.secondary}</Link>
        </p>
      </form>
    </PageShell>
  )
}
