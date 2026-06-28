import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getMyArtist, getEntitlement, createEntitlement } from '../../lib/db.js'
import { PageShell, Wordmark, Loading, ErrorState, Spinner } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// A8 — Founding Passport offer + MANUAL payment (Bit/transfer/invoice, no Stripe).
// Artist marks "I've paid" → entitlement 'pending' → operator confirms → 'active'.
// The artist is never stuck: this screen reflects the status.
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

  return (
    <PageShell max="max-w-md">
      <div className="flex items-center justify-between mb-6">
        <Wordmark /><Link to="/artist/home" className="text-sm text-muted hover:text-soft">{T.common.back}</Link>
      </div>

      {status === 'active' ? (
        <div className="card text-center" role="status">
          <p className="text-3xl mb-3" aria-hidden="true">🌐</p>
          <h1 className="text-xl font-bold text-soft mb-2">{O.activeTitle}</h1>
          <p className="text-muted mb-4">{O.activeBody}</p>
          {artist && <Link to={`/passport/${artist.id}`} className="btn-primary block">{T.dashboard.viewPublic}</Link>}
        </div>
      ) : status === 'pending' ? (
        <div className="card text-center" role="status">
          <p className="text-3xl mb-3" aria-hidden="true">⏳</p>
          <h1 className="text-xl font-bold text-soft mb-2">{O.pendingTitle}</h1>
          <p className="text-muted">{O.pendingBody}</p>
        </div>
      ) : (
        <>
          <h1 className="text-xl font-bold text-soft mb-1">{O.title}</h1>
          <p className="text-accent font-bold mb-1">{O.price}</p>
          <p className="text-xs text-muted mb-4">{O.notSubscription}</p>
          <div className="card mb-4"><p className="text-sm text-soft">{O.trustLine}</p></div>
          <div className="card mb-4">
            <p className="font-bold text-soft mb-1">{O.howToPay}</p>
            <p className="text-sm text-muted mb-1">{O.payMethods}</p>
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
