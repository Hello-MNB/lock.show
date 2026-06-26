import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { PageShell, Wordmark, Field } from '../../components/ui.jsx'

// Bookers are trust-receivers: they open a Passport from a link they were
// sent. Open marketplace/discovery is deferred (post-validation), so this
// is a light entry that resolves a passport link or id.
export default function BookerHome() {
  const { signOut } = useAuth()
  const nav = useNavigate()
  const [v, setV] = useState('')

  function open() {
    const m = v.trim().match(/passport\/([0-9a-f-]{6,})/i)
    const id = m ? m[1] : v.trim()
    if (id) nav(`/passport/${id}`)
  }

  return (
    <PageShell max="max-w-md">
      <div className="flex items-center justify-between mb-6">
        <Wordmark />
        <button className="text-sm text-muted" onClick={() => { signOut(); nav('/login') }}>יציאה</button>
      </div>
      <h1 className="text-xl font-bold text-soft mb-2">פתח פרופיל אמן</h1>
      <p className="text-sm text-muted mb-4">הדבק קישור Passport שקיבלת כדי לצפות בהוכחות ולבדוק זמינות.</p>
      <div className="card">
        <Field label="קישור / מזהה Passport">
          <input className="field" dir="ltr" value={v} onChange={(e) => setV(e.target.value)}
            placeholder=".../passport/…" onKeyDown={(e) => e.key === 'Enter' && open()} />
        </Field>
        <button className="btn-primary w-full" onClick={open}>פתח</button>
      </div>
    </PageShell>
  )
}
