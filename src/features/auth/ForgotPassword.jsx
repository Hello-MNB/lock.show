import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { PageShell, Wordmark, Field, Spinner, ErrorNote } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

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
      <PageShell max="max-w-sm">
        <div className="text-center mb-8">
          <Wordmark className="justify-center mb-3" />
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-3">📧</div>
          <h2 className="text-lg font-bold text-soft mb-2">{T.reset.sentTitle}</h2>
          <p className="text-sm text-muted mb-4">{T.reset.sentBody}</p>
          <Link to="/login" className="text-accent text-sm">{T.reset.backToLogin}</Link>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell max="max-w-sm">
      <div className="text-center mb-8">
        <Wordmark className="justify-center mb-3" />
        <h1 className="text-xl font-bold text-soft">{T.reset.forgotTitle}</h1>
      </div>
      <form onSubmit={onSubmit} className="card">
        <ErrorNote>{error}</ErrorNote>
        <p className="text-sm text-muted mb-4">{T.reset.forgotIntro}</p>
        <Field label={T.login.email}>
          <input className="field" type="email" dir="ltr" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <><Spinner /> {T.common.sending}</> : T.reset.sendLink}
        </button>
        <p className="text-center mt-4 text-sm text-muted">
          <Link to="/login" className="text-accent">{T.reset.backToLogin}</Link>
        </p>
      </form>
    </PageShell>
  )
}
