import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { Field, Spinner, ErrorNote, SocialAuthButtons } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { ROLES, OAUTH_ENABLED } from '../../lib/constants.js'
import AuthScene from './AuthScene.jsx'

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
              className="rounded-full border border-line bg-surface2 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent/60 hover:bg-raise">
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
      <p className="mb-6 text-sm text-muted">Sign in to your proof workspace.</p>
      <form onSubmit={onSubmit}>
        <ErrorNote>{error}</ErrorNote>
        <Field label={T.login.email}>
          <input className="field" type="email" dir="ltr" autoComplete="email"
            placeholder="you@stage.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label={T.login.password}>
          <input className="field" type="password" autoComplete="current-password"
            placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <><Spinner /> {T.common.loading}</> : T.login.cta}
        </button>
        <p className="mt-4 text-center text-sm">
          <Link to="/forgot-password" className="text-muted transition hover:text-ink">{T.login.forgot}</Link>
        </p>
        <p className="mt-2 text-center text-sm text-muted">
          <Link to="/signup" className="font-semibold text-accent hover:underline">{T.login.secondary}</Link>
        </p>
      </form>
      {/* OAuth below the working form — disabled controls never lead the screen */}
      <div className="mt-6 border-t border-line pt-5">
        <SocialAuthButtons onOAuth={signInWithOAuth} disabled={!OAUTH_ENABLED} demo={demo} />
      </div>
    </AuthScene>
  )
}
