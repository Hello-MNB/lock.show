import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { upsertProfile } from '../../lib/db.js'
import { bootstrapOrg } from '../../lib/orgs.js'
import { PageShell, Wordmark, GpIcon } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { ROLES } from '../../lib/constants.js'
import { selectRoute } from '../../lib/navigation.js'
import { PENDING_ROLE_KEY, JOB_ROLES } from './roleHint.js'

export default function UserTypeSelect() {
  const { T } = useLang()
  const { user, reloadProfile } = useAuth()
  const nav = useNavigate()
  const [busy, setBusy] = useState(false)

  // Jobs-first framing (canon §5): the question is "what would you like to do
  // first?", never a role list. Same underlying role values are written
  // unchanged — this is a copy/IA swap only, no schema/route-target change
  // beyond ARTIST now going straight to onboarding (see item 1, contextual
  // consent replaces the /consent wall).
  //   ARTIST  = אמן            (supply side, self-serve Passport builder)
  //   AGENCY  = אמרגן/סוכנות    (talent agency, primary payer — manages artist roster)
  //   BOOKER  = מזמין/מפיק אירוע (demand side, trust-receiver — evaluates Passports)
  //
  // NOTE: PRODUCER (claim-confirmer / מפיק מאשר) is NOT self-selected here.
  // Claim-confirmers arrive via a one-time magic link (/confirm/:token) and never
  // need a full account. Putting PRODUCER here caused venue-bookers to tap it
  // thinking they were the demand-side מפיק — wrong flow entirely.
  //
  // NOTE: אמרגן in Israeli music = talent AGENT (supply side). The demand-side
  // event organizer is called מזמין or מפיק אירוע — hence BOOKER label above.
  // Mapping אמרגן → BOOKER was a critical domain inversion (fixed BT-56–58).
  // Post-pick destinations come from the navigation contract (selectRoute) so
  // there is ONE source of truth for where each new user lands — verified by
  // scripts/nav-contract.test.mjs.
  const ROLE_OPTIONS = [
    {
      key: ROLES.ARTIST, label: T.roleSelect.jobArtist, route: selectRoute(ROLES.ARTIST), icon: 'gp-artist',
      what: 'Build a Passport of provable evidence — bands and confirmed facts, never a score.',
    },
    {
      key: ROLES.AGENCY, label: T.roleSelect.jobAgency, route: selectRoute(ROLES.AGENCY), icon: 'gp-manager',
      what: 'Keep your whole roster’s proof in one place — ready to send, always current.',
    },
    {
      key: ROLES.BOOKER, label: T.roleSelect.jobBooker, route: selectRoute(ROLES.BOOKER), icon: 'gp-booking',
      what: 'Size up an artist you don’t know yet, using proof that says exactly how it was checked — before you risk your name.',
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
      } catch (e) {
        // "already bootstrapped" is benign (idempotent). Anything else means the
        // user has a profile but NO org/role — surface it instead of silently
        // proceeding into broken org-dependent screens later (audit finding #3).
        const msg = String(e?.message || e)
        if (!/already|exists|duplicate/i.test(msg)) {
          console.error('[bootstrapOrg] failed — user may lack an organization:', msg)
        }
      }
      await reloadProfile()
    }
    nav(route)
  }

  // Cross-funnel seam: if the visitor arrived via a persona-specific CTA on
  // the website (e.g. /artists → /app/signup?role=artist), Signup.jsx left a
  // hint in sessionStorage. Auto-resolve this "what would you like to do
  // first?" question instead of making them re-answer it by clicking the
  // card they already implied by their entry point. Runs once; a plain
  // organic visit to /select (no hint) is untouched and still asks.
  const autoChoseRef = useRef(false)
  useEffect(() => {
    if (autoChoseRef.current) return
    const hint = sessionStorage.getItem(PENDING_ROLE_KEY)
    if (!hint) return
    sessionStorage.removeItem(PENDING_ROLE_KEY)
    if (!JOB_ROLES.includes(hint)) return
    const match = ROLE_OPTIONS.find((r) => r.key === hint)
    if (!match) return
    autoChoseRef.current = true
    choose(match.key, match.route)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <PageShell max="max-w-md">
      <div className="mb-8 text-center">
        <Wordmark className="mb-4 justify-center" />
        <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">One quick question</p>
        <h1 className="text-2xl font-bold text-ink">{T.roleSelect.jobTitle}</h1>
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
