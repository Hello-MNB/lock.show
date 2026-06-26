import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { PageShell, Wordmark, Field, Spinner, ErrorNote } from '../../components/ui.jsx'

export default function ForgotPassword() {
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
      setError(e.message || 'שגיאה בשליחת הקישור')
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
          <h2 className="text-lg font-bold text-soft mb-2">קישור נשלח</h2>
          <p className="text-sm text-muted mb-4">
            בדוק את תיבת הדואר שלך ולחץ על הקישור לאיפוס הסיסמה.
          </p>
          <Link to="/login" className="text-accent text-sm">חזרה לכניסה</Link>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell max="max-w-sm">
      <div className="text-center mb-8">
        <Wordmark className="justify-center mb-3" />
        <h1 className="text-xl font-bold text-soft">שכחתי סיסמה</h1>
      </div>
      <form onSubmit={onSubmit} className="card">
        <ErrorNote>{error}</ErrorNote>
        <p className="text-sm text-muted mb-4">
          הכנס את כתובת הדואר האלקטרוני שלך ונשלח לך קישור לאיפוס.
        </p>
        <Field label="אימייל">
          <input className="field" type="email" dir="ltr" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? <><Spinner /> שולח…</> : 'שלח קישור'}
        </button>
        <p className="text-center mt-4 text-sm text-muted">
          <Link to="/login" className="text-accent">חזרה לכניסה</Link>
        </p>
      </form>
    </PageShell>
  )
}
