import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { Field, Spinner, ErrorNote } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import AuthScene from './AuthScene.jsx'

export default function ResetPassword() {
  const { T } = useLang()
  const nav = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    if (password !== confirm) { setError(T.reset.mismatch); return }
    setError('')
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) throw err
      setDone(true)
      setTimeout(() => nav('/'), 2000)
    } catch (e) {
      setError(e.message || T.reset.saveError)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthScene>
        <div className="card text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-accent text-2xl font-black text-[#12160A]" aria-hidden>✓</span>
          <p className="font-bold text-ink">{T.reset.doneTitle}</p>
          <p className="mt-1 text-sm text-muted">{T.reset.redirecting}</p>
        </div>
      </AuthScene>
    )
  }

  if (!ready) {
    return (
      <AuthScene>
        <div className="card text-center">
          <Spinner className="mx-auto mb-3 text-muted" />
          <p className="text-sm text-muted">{T.reset.verifying}</p>
          <p className="mt-4 text-xs text-muted">
            {T.reset.directHit} <Link to="/forgot-password" className="font-semibold text-accent hover:underline">{T.reset.requestNew}</Link>
          </p>
        </div>
      </AuthScene>
    )
  }

  return (
    <AuthScene>
      <h1 className="mb-1 text-2xl font-bold text-ink">{T.reset.newTitle}</h1>
      <p className="mb-6 text-sm text-muted">Pick a new password — you’ll stay signed in.</p>
      <form onSubmit={onSubmit}>
        <ErrorNote>{error}</ErrorNote>
        <Field label={T.reset.newLabel} hint={T.common.minChars}>
          <input className="field" type="password" autoComplete="new-password" minLength={6}
            placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <Field label={T.reset.confirmLabel}>
          <input className="field" type="password" autoComplete="new-password" minLength={6}
            placeholder="••••••••"
            value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </Field>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <><Spinner /> {T.common.saving}</> : T.reset.savePassword}
        </button>
      </form>
    </AuthScene>
  )
}
