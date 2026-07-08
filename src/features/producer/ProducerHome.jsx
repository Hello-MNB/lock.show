import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { PageShell, Wordmark, LanguageToggle, GpIcon } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// Producer (מפיק) home. The producer's real action is the no-login magic-link
// claim confirmation (P1, /confirm/:token). This logged-in landing explains the
// role — and links to the received-passports space so it is never orphaned.
export default function ProducerHome() {
  const { T } = useLang()
  const { signOut } = useAuth()
  const nav = useNavigate()

  const steps = [
    'An artist asks you to confirm one specific statement — a show, a crowd, a rebooking.',
    'You get an email with a secure one-time link. No account, no dashboard.',
    'One tap: Yes · Partly right · No · Not the right person. Revocable any time.',
  ]

  return (
    <PageShell max="max-w-md">
      <div className="mb-8 flex items-center justify-between">
        <Wordmark />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button className="text-sm text-muted transition hover:text-ink"
            onClick={() => { signOut(); nav('/login') }}>{T.settings.logout}</button>
        </div>
      </div>

      <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">Producer workspace</p>
      <h1 className="mb-2 text-2xl font-bold text-ink">You confirm — artists prove.</h1>
      <p className="mb-6 text-sm text-muted">
        Your word carries weight. Artists ask you to confirm single statements about nights you actually ran — one tap, one statement, nothing more.
      </p>

      <div className="card mb-3">
        <p className="mb-4 font-bold text-ink">How it works</p>
        <ol className="space-y-4">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface2 font-mono text-xs font-semibold text-gold" aria-hidden>
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-ink">{s}</p>
            </li>
          ))}
        </ol>
      </div>

      <Link to="/producer/received" className="card block transition hover:bg-raise">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface2 text-gold" aria-hidden>
              <GpIcon id="gp-passport" className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold text-ink">Passports shared with you</p>
              <p className="mt-0.5 text-sm text-muted">Open a Passport an artist sent you.</p>
            </div>
          </div>
          <span className="text-muted" aria-hidden>→</span>
        </div>
      </Link>

      <p className="mt-5 text-center text-[11px] text-faint">
        Confirmations refer to specific statements only — never a general endorsement, never a score.
      </p>
    </PageShell>
  )
}
