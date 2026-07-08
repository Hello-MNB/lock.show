import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { Field, Spinner, ErrorNote } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import AuthScene from './AuthScene.jsx'

export default function ForgotPassword() {
  const { T } = useLang()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (err) throw err
      setSent(true)
    } catch (e) {
      setError(e.message || T.reset.sendError)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthScene>
        <div className="card text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-surface2 text-2xl" aria-hidden>✉️</span>
          <h2 className="mb-2 text-lg font-bold text-ink">{T.reset.sentTitle}</h2>
          <p className="mb-5 text-sm text-muted">{T.reset.sentBody}</p>
          <Link to="/login" className="text-sm font-semibold text-accent hover:underline">{T.reset.backToLogin}</Link>
        </div>
      </AuthScene>
    )
  }

  return (
    <AuthScene>
      <h1 className="mb-1 text-2xl font-bold text-ink">{T.reset.forgotTitle}</h1>
      <p className="mb-6 text-sm text-muted">{T.reset.forgotIntro}</p>
      <form onSubmit={onSubmit}>
        <ErrorNote>{error}</ErrorNote>
        <Field label={T.login.email}>
          <input className="field" type="email" dir="ltr" autoComplete="email"
            placeholder="you@stage.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <><Spinner /> {T.common.sending}</> : T.reset.sendLink}
        </button>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-muted transition hover:text-ink">{T.reset.backToLogin}</Link>
        </p>
      </form>
    </AuthScene>
  )
}
