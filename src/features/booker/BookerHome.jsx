import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { PageShell, Wordmark, Field, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// Bookers are trust-receivers: they open a Passport from a link they were
// sent. Open marketplace/discovery is deferred (post-validation), so this
// is a light entry that resolves a passport link or id.
export default function BookerHome() {
  const { T } = useLang()
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
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button className="text-sm text-muted hover:text-soft" onClick={() => { signOut(); nav('/login') }}>{T.settings.logout}</button>
        </div>
      </div>
      <h1 className="text-xl font-bold text-soft mb-2">{T.booker.title}</h1>
      <p className="text-sm text-muted mb-4">{T.booker.subtitle}</p>
      <div className="card">
        <Field label={T.booker.inputLabel}>
          <input className="field" dir="ltr" value={v} onChange={(e) => setV(e.target.value)}
            placeholder=".../passport/…" onKeyDown={(e) => e.key === 'Enter' && open()} />
        </Field>
        <button className="btn-primary w-full" onClick={open}>{T.booker.openCta}</button>
      </div>
    </PageShell>
  )
}
