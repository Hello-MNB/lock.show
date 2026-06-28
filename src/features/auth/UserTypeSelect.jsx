import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { upsertProfile } from '../../lib/db.js'
import { bootstrapOrg } from '../../lib/orgs.js'
import { PageShell, Wordmark } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { ROLES } from '../../lib/constants.js'

export default function UserTypeSelect() {
  const { T } = useLang()
  const { user, reloadProfile } = useAuth()
  const nav = useNavigate()
  const [busy, setBusy] = useState(false)

  // S2 "what do you do?" (§19.5): אמן / אמרגן / מפיק. 'agency' is NOT offered —
  // an agency is a booker-org that upgraded + added seats (O5). 'operator' is
  // internal. Everyone starts in a personal SOLO org.
  const ROLE_OPTIONS = [
    { key: ROLES.ARTIST, label: T.roleSelect.artist, route: '/consent' },
    { key: ROLES.BOOKER, label: T.roleSelect.booker, route: '/discover' },
    { key: ROLES.PRODUCER, label: T.roleSelect.producer, route: '/producer' },
  ]

  async function choose(role, route) {
    if (busy) return
    setBusy(true)
    if (user) {
      const full_name = user.user_metadata?.full_name || user.user_metadata?.name || null
      await upsertProfile({ id: user.id, role, full_name })
      // Org-first: auto-create the person's personal solo org + owner membership +
      // functional role. Idempotent server-side; non-blocking if already bootstrapped.
      try {
        await bootstrapOrg({ name: full_name, functionalRole: role, email: user.email, displayName: full_name })
      } catch { /* already bootstrapped or RPC unavailable — proceed */ }
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
        {ROLE_OPTIONS.map((r) => (
          <button key={r.key} onClick={() => choose(r.key, r.route)} disabled={busy}
            className="card w-full text-right text-lg font-bold text-soft hover:border-accent transition disabled:opacity-50">
            {r.label}
          </button>
        ))}
      </div>
    </PageShell>
  )
}
