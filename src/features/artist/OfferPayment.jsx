import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getMyArtist, getEntitlement, createEntitlement } from '../../lib/db.js'
import { logEvent, EVENTS } from '../../lib/analytics.js'
import { PageShell, Loading, ErrorState, Spinner } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// A8 — Founding Passport offer + MANUAL payment (Bit/transfer/invoice, no Stripe).
// Artist marks "I've paid" → entitlement 'pending' → operator confirms → 'active'.
// The artist is never stuck: this screen reflects the status, with the date the
// confirmation was received and a calm "the operator will activate you" note.
// Bit recipient (the operator). Not a secret — shown to any signed-in artist on
// this screen. Price stays the existing range copy until the owner locks one.
const BIT_NUMBER = '054-4555060'

// Deterministic payment-reference code so the artist can add it to the Bit
// transfer note BEFORE paying, and the operator can match it in her Bit app
// after: "GP-" + first 4 chars of the artist id, uppercased.
function paymentRefCode(id) {
  return id ? `GP-${id.slice(0, 4).toUpperCase()}` : ''
}

export default function OfferPayment() {
  const { T } = useLang()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [artist, setArtist] = useState(null)
  const [ent, setEnt] = useState(null)
  const [busy, setBusy] = useState(false)
  const [amount, setAmount] = useState('')
  const [copied, setCopied] = useState(false)

  async function load() {
    setError(false)
    try {
      const a = await getMyArtist(user.id)
      setArtist(a)
      if (a) setEnt(await getEntitlement(a.id))
    } catch { setError(true) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [user.id])

  async function markPaid() {
    if (busy || !artist || !amount) return
    setBusy(true)
    try {
      const refCode = paymentRefCode(artist.id)
      await createEntitlement(artist.id, user.id, `${refCode} · ₪${amount} · Bit`)
      // GATE signal — willingness-to-pay: an artist created a payment reference.
      logEvent(EVENTS.PAYMENT_REF_CREATED, { artist_id: artist.id })
      await load()
    } catch { setError(true) } finally { setBusy(false) }
  }

  async function copyBit() {
    try {
      await navigator.clipboard.writeText(BIT_NUMBER)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch { /* clipboard blocked — the number is still visible/selectable */ }
  }

  if (loading) return <Loading />
  if (error) return (
    <PageShell>
      <ErrorState title={T.common.error} onRetry={() => { setLoading(true); load() }} /></PageShell>
  )

  const status = ent?.status
  const O = T.offer
  const paidOn = ent?.created_at
    ? new Date(ent.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  return (
    <PageShell max="max-w-md">
      <div className="mb-6 flex items-center justify-end">
        <Link to="/artist/home" className="text-sm text-muted transition-colors hover:text-ink">{T.common.back}</Link>
      </div>

      {status === 'active' ? (
        <div className="card text-center" role="status">
          <span aria-hidden className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full border border-line2 text-xl text-good">✓</span>
          <h1 className="font-display mb-2 text-xl font-bold tracking-[-0.01em] text-ink">{O.activeTitle}</h1>
          <p className="mb-4 text-muted">{O.activeBody}</p>
          {artist && <Link to={`/passport/${artist.id}`} className="btn-primary block">{T.dashboard.viewPublic}</Link>}
        </div>
      ) : status === 'pending' ? (
        /* "I've paid" confirmation state — date on record + calm operator note */
        <div className="card relative overflow-hidden text-center" role="status">
          {/* the one warm aura on this view */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-14 h-40"
            style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(242,192,99,0.10), transparent 70%)' }} />
          <span aria-hidden className="relative mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full border border-line2 text-xl text-ink/80">✓</span>
          <h1 className="font-display relative mb-1 text-xl font-bold tracking-[-0.01em] text-ink">{O.pendingTitle}</h1>
          {paidOn && (
            <p className="relative mb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">Payment confirmation received · {paidOn}</p>
          )}
          {ent?.amount_note && (
            <p dir="ltr" className="relative mb-2 font-mono text-sm font-bold text-ink">{ent.amount_note}</p>
          )}
          <p className="relative text-sm text-muted">{O.pendingBody}</p>
          <p className="relative mt-3 border-t border-line pt-3 text-xs text-muted">
            {O.verifyNote}
          </p>
        </div>
      ) : (
        <>
          <h1 className="font-display mb-1 text-2xl font-bold tracking-[-0.01em] text-ink">{O.title}</h1>
          <p className="mb-1 font-mono text-sm font-bold text-ink">{O.price}</p>
          <p className="mb-4 text-xs text-muted">{O.notSubscription}</p>
          <div className="card mb-4"><p className="text-sm text-ink/90">{O.trustLine}</p></div>
          <div className="card mb-4">
            <p className="mb-1 font-bold text-ink">{O.howToPay}</p>
            <p className="mb-3 text-sm text-muted">{O.payMethods}</p>

            <p className="mb-1 text-xs uppercase tracking-[0.08em] text-muted">{O.bitNumberLabel}</p>
            <div className="mb-3 flex items-center gap-2">
              <span dir="ltr" className="font-mono text-lg font-bold text-ink">{BIT_NUMBER}</span>
              <button type="button" onClick={copyBit} className="btn-ghost shrink-0 px-3 py-1.5 text-xs">
                {copied ? 'Copied ✓' : O.copyBit}
              </button>
            </div>

            <p className="mb-1 text-xs uppercase tracking-[0.08em] text-muted">{O.referenceLabel}</p>
            <p dir="ltr" className="mb-3 font-mono text-lg font-bold text-ink">{paymentRefCode(artist?.id)}</p>

            <p className="text-sm text-muted">{O.payInstructions}</p>
          </div>
          <div className="card mb-4">
            <label htmlFor="amountSent" className="mb-1 block text-sm font-bold text-ink">{O.amountLabel}</label>
            <input id="amountSent" className="field" dir="ltr" type="number" inputMode="decimal" min="0" step="1"
              value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <p className="mt-2 text-xs text-muted">{O.verifyNote}</p>
          </div>
          <button className="btn-primary w-full" onClick={markPaid} disabled={busy || !amount}>
            {busy ? <Spinner /> : O.paidCta}
          </button>
        </>
      )}
    </PageShell>
  )
}
