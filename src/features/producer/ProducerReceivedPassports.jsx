import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as UI from '../../components/ui.jsx'
import { PageShell, Wordmark, Field, LanguageToggle, GpIcon } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'

// Producer landing — passports shared with this producer. There is no
// received-passports fetch in the data layer yet, so this screen is HONEST
// about that ("will appear here") and still useful: it explains what a
// GIGPROOF Passport is and opens any passport link the producer was sent
// (same resolver pattern as the booker entry). No dead ends.

// Local fallbacks if the shared MethodLabel / BandPill exports are missing.
function LocalMethodLabel({ children, variant = 'gold' }) {
  const tone = variant === 'lime' ? 'border-accent/50 text-accent' : 'border-gold/50 text-gold'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] ${tone}`}>
      {children}
    </span>
  )
}
function LocalBandPill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line2 px-2.5 py-0.5 font-mono text-[11px] text-ink">
      {children}
    </span>
  )
}
const MethodLabel = UI.MethodLabel ?? LocalMethodLabel
const BandPill = UI.BandPill ?? LocalBandPill

export default function ProducerReceivedPassports() {
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
      <div className="mb-8 flex items-center justify-between">
        <Wordmark />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button className="text-sm text-muted transition hover:text-ink"
            onClick={() => { signOut(); nav('/login') }}>{T.settings.logout}</button>
        </div>
      </div>

      <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">Producer workspace</p>
      <h1 className="mb-2 text-2xl font-bold text-ink">Passports shared with you</h1>
      <p className="mb-6 text-sm text-muted">
        When an artist sends you their Passport, it will appear here — standardized, method-labeled evidence you can read in two minutes.
      </p>

      {/* honest empty state — and the immediate way past it */}
      <div className="card mb-3 text-center">
        <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-surface2 text-gold" aria-hidden>
          <GpIcon id="gp-passport" className="h-5 w-5" />
        </span>
        <p className="font-bold text-ink">Nothing here yet</p>
        <p className="mt-1 text-sm text-muted">Passports shared with you will appear here as they arrive.</p>
      </div>

      {/* got a link already? open it — no dead end */}
      <div className="card mb-3">
        <p className="mb-3 font-bold text-ink">Got a Passport link already?</p>
        <Field label="Passport link / ID">
          <input className="field" dir="ltr" value={v} onChange={(e) => setV(e.target.value)}
            placeholder=".../passport/…" onKeyDown={(e) => e.key === 'Enter' && open()} />
        </Field>
        <button className="btn-primary w-full" onClick={open} disabled={!v.trim()}>Open Passport</button>
      </div>

      {/* what a passport is — evidence vocabulary, firewall-safe */}
      <div className="card mb-3">
        <p className="mb-1 font-bold text-ink">What is a GIGPROOF Passport?</p>
        <p className="mb-4 text-sm text-muted">
          One page of an artist’s working reality — every statement carries the method it was checked by, so you can judge the evidence, not the hype.
        </p>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <BandPill>180–300 heads</BandPill>
          <MethodLabel variant="lime">★ Producer-confirmed</MethodLabel>
          <MethodLabel>Ticket export</MethodLabel>
        </div>
        <ul className="space-y-2 text-sm text-muted">
          <li className="flex gap-2"><span className="text-gold" aria-hidden>·</span> Draw shown as bands and yes/no facts — never a score or ranking.</li>
          <li className="flex gap-2"><span className="text-gold" aria-hidden>·</span> Every claim is labeled by how it was verified.</li>
          <li className="flex gap-2"><span className="text-gold" aria-hidden>·</span> Evidence only — not a guarantee.</li>
        </ul>
      </div>

      <Link to="/producer" className="card block transition hover:bg-raise">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-bold text-ink">How one-tap confirmations work</p>
            <p className="mt-0.5 text-sm text-muted">Artists may ask you to confirm one specific statement — takes seconds, no account.</p>
          </div>
          <span className="text-muted" aria-hidden>→</span>
        </div>
      </Link>
    </PageShell>
  )
}
