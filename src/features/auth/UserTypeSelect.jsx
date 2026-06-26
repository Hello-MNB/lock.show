import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { upsertProfile } from '../../lib/db.js'
import { PageShell, Wordmark } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

export default function UserTypeSelect() {
  const { T } = useLang()
  const { user, reloadProfile } = useAuth()
  const nav = useNavigate()
  const [busy, setBusy] = useState(false)

  const ROLES = [
    { key: 'agency', label: T.roleSelect.agency, route: '/agency' },
    { key: 'artist', label: T.roleSelect.artist, route: '/consent' },
    { key: 'booker', label: T.roleSelect.booker, route: '/discover' },
  ]

  async function choose(role, route) {
    if (busy) return
    setBusy(true)
    if (user) {
      const full_name = user.user_metadata?.full_name || user.user_metadata?.name || null
      await upsertProfile({ id: user.id, role, full_name })
      await reloadProfile()
    }
    nav(route)
  }

  return (
    <PageShell max="max-w-md">
      <div className="text-center mb-8">
        <Wordmark className="justify-center mb-3" />
        <h1 className="text-xl font-bold text-soft">{T.roleSelect.title}</h1>
      </div>
      <div className="space-y-3">
        {ROLES.map((r) => (
          <button key={r.key} onClick={() => choose(r.key, r.route)} disabled={busy}
            className="card w-full text-right text-lg font-bold text-soft hover:border-accent transition disabled:opacity-50">
            {r.label}
          </button>
        ))}
      </div>
    </PageShell>
  )
}
