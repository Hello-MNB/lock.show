import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getMyArtist, getEntitlement, createEntitlement } from '../../lib/db.js'
import { PageShell, Wordmark, Loading, ErrorState, Spinner } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// A8 — Founding Passport offer + MANUAL payment (Bit/transfer/invoice, no Stripe).
// Artist marks "I've paid" → entitlement 'pending' → operator confirms → 'active'.
// The artist is never stuck: this screen reflects the status, with the date the
// confirmation was received and a calm "the operator will activate you" note.
export default function OfferPayment() {
  const { T } = useLang()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [artist, setArtist] = useState(null)
  const [ent, setEnt] = useState(null)
  const [busy, setBusy] = useState(false)

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
    if (busy || !artist) return
    setBusy(true)
    try {
      await createEntitlement(artist.id, user.id)
      await load()
    } catch { setError(true) } finally { setBusy(false) }
  }

  if (loading) return <Loading />
  if (error) return (
    <PageShell><Wordmark className="mb-6" />
      <ErrorState title={T.common.error} onRetry={() => { setLoading(true); load() }} /></PageShell>
  )

  const status = ent?.status
  const O = T.offer
  const paidOn = ent?.created_at
    ? new Date(ent.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  return (
    <PageShell max="max-w-md">
      <div className="mb-6 flex items-center justify-between">
        <Wordmark /><Link to="/artist/home" className="text-sm text-muted transition-colors hover:text-ink">{T.common.back}</Link>
      </div>

      {status === 'active' ? (
        <div className="card text-center" role="status">
          <span aria-hidden className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full border border-line2 text-xl text-[#CBEE72]">✓</span>
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
          <p className="relative text-sm text-muted">{O.pendingBody}</p>
          <p className="relative mt-3 border-t border-line pt-3 text-xs text-muted">
            The operator will activate you shortly — nothing else is needed from you.
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
            <p className="mb-1 text-sm text-muted">{O.payMethods}</p>
            <p className="text-sm text-muted">{O.payInstructions}</p>
          </div>
          <button className="btn-primary w-full" onClick={markPaid} disabled={busy}>
            {busy ? <Spinner /> : O.paidCta}
          </button>
        </>
      )}
    </PageShell>
  )
}
