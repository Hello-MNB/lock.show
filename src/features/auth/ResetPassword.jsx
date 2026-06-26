import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { PageShell, Wordmark, Field, Spinner, ErrorNote } from '../../components/ui.jsx'

export default function ResetPassword() {
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
    if (password !== confirm) { setError('הסיסמאות אינן תואמות'); return }
    setError('')
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) throw err
      setDone(true)
      setTimeout(() => nav('/'), 2000)
    } catch (e) {
      setError(e.message || 'שגיאה באיפוס הסיסמה')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <PageShell max="max-w-sm">
        <div className="card text-center mt-20">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-bold text-soft">הסיסמה עודכנה!</p>
          <p className="text-sm text-muted mt-1">מועבר לאפליקציה…</p>
        </div>
      </PageShell>
    )
  }

  if (!ready) {
    return (
      <PageShell max="max-w-sm">
        <div className="text-center mb-8"><Wordmark className="justify-center mb-3" /></div>
        <div className="card text-center">
          <Spinner className="mx-auto mb-3" />
          <p className="text-muted text-sm">מאמת קישור איפוס…</p>
          <p className="mt-4 text-xs text-muted">
            הגעת ישירות לדף הזה? <Link to="/forgot-password" className="text-accent">בקש קישור חדש</Link>
          </p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell max="max-w-sm">
      <div className="text-center mb-8">
        <Wordmark className="justify-center mb-3" />
        <h1 className="text-xl font-bold text-soft">סיסמה חדשה</h1>
      </div>
      <form onSubmit={onSubmit} className="card">
        <ErrorNote>{error}</ErrorNote>
        <Field label="סיסמה חדשה" hint="לפחות 6 תווים">
          <input className="field" type="password" autoComplete="new-password" minLength={6}
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <Field label="אימות סיסמה">
          <input className="field" type="password" autoComplete="new-password" minLength={6}
            value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </Field>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <><Spinner /> שומר…</> : 'שמור סיסמה'}
        </button>
      </form>
    </PageShell>
  )
}
