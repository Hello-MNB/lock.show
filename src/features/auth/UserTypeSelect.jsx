import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { upsertProfile } from '../../lib/db.js'
import { bootstrapOrg } from '../../lib/orgs.js'
import { PageShell, Wordmark, GpIcon } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { ROLES } from '../../lib/constants.js'

export default function UserTypeSelect() {
  const { T } = useLang()
  const { user, reloadProfile } = useAuth()
  const nav = useNavigate()
  const [busy, setBusy] = useState(false)

  // S2 "what do you do?" — three self-select roles:
  //   ARTIST  = אמן            (supply side, self-serve Passport builder)
  //   BOOKER  = מזמין/מפיק אירוע (demand side, trust-receiver — evaluates Passports)
  //   AGENCY  = אמרגן/סוכנות    (talent agency, primary payer — manages artist roster)
  //
  // NOTE: PRODUCER (claim-confirmer / מפיק מאשר) is NOT self-selected here.
  // Claim-confirmers arrive via a one-time magic link (/confirm/:token) and never
  // need a full account. Putting PRODUCER here caused venue-bookers to tap it
  // thinking they were the demand-side מפיק — wrong flow entirely.
  //
  // NOTE: אמרגן in Israeli music = talent AGENT (supply side). The demand-side
  // event organizer is called מזמין or מפיק אירוע — hence BOOKER label above.
  // Mapping אמרגן → BOOKER was a critical domain inversion (fixed BT-56–58).
  const ROLE_OPTIONS = [
    {
      key: ROLES.ARTIST, label: T.roleSelect.artist, route: '/consent', icon: 'gp-artist',
      what: 'Build a Passport of provable evidence — bands and confirmed facts, never a score.',
    },
    {
      key: ROLES.BOOKER, label: T.roleSelect.booker, route: '/discover', icon: 'gp-booking',
      what: 'Evaluate an unfamiliar artist on method-labeled evidence before you risk your name.',
    },
    {
      key: ROLES.AGENCY, label: T.roleSelect.agency, route: '/agency', icon: 'gp-manager',
      what: 'Keep your whole roster’s proof in one place — ready to send, always current.',
    },
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
      <div className="mb-8 text-center">
        <Wordmark className="mb-4 justify-center" />
        <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">One quick question</p>
        <h1 className="text-2xl font-bold text-ink">{T.roleSelect.title}</h1>
      </div>
      <div className="space-y-3">
        {ROLE_OPTIONS.map((r) => (
          <button key={r.key} onClick={() => choose(r.key, r.route)} disabled={busy}
            className="card group w-full text-start transition hover:bg-raise disabled:opacity-50">
            <div className="flex items-start gap-4">
              <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface2 text-gold transition group-hover:text-accent" aria-hidden>
                <GpIcon id={r.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-bold text-ink">{r.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{r.what}</p>
              </div>
              <span className="ms-auto mt-1 text-muted transition group-hover:text-accent" aria-hidden>→</span>
            </div>
          </button>
        ))}
      </div>
      <p className="mt-6 text-center text-[11px] text-faint">You can change this later in Settings.</p>
    </PageShell>
  )
}
