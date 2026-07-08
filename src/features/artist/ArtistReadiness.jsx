import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getMyArtist, listProfileItems, listClaims } from '../../lib/db.js'
import { PageShell, Wordmark, Loading, StatusChip, EmptyState, ErrorState } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { STATUS } from '../../lib/constants.js'

// Internal readiness. Computes a bounded status per axis. FIREWALL:
// a 0–100 may exist internally but is NEVER displayed — only the bounded StatusChip.
function axisStatus(score) {
  if (score == null) return STATUS.NOT_ASSESSABLE
  if (score >= 70) return STATUS.STRONG
  if (score >= 35) return STATUS.DEVELOPING
  return STATUS.MISSING
}

export default function ArtistReadiness() {
  const { T } = useLang()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    (async () => {
     try {
      const a = await getMyArtist(user.id)
      if (!a) { setLoading(false); return }
      const items = await listProfileItems(a.id)
      const claims = await listClaims(a.id)
      const exp = items.filter((i) => !['link'].includes(i.item_type))
      const links = items.filter((i) => i.item_type === 'link')
      const verified = claims.filter((c) => c.verification_status === 'verified').length
      const R = T.readiness

      // `next` is either a real ACTION or a satisfied-state note; `actionable`
      // separates them so the "Your next step" card never echoes a status.
      const axes = [
        {
          key: 'draw', label: R.axisDraw,
          score: (a.lineup_frequency_band ? 35 : 0) + (a.sells_tickets ? 35 : 0) + (verified ? 30 : 0),
          next: !a.lineup_frequency_band ? R.nextAddFrequency : (verified ? R.nextVerifiedExists : R.nextUploadProof),
          actionable: !a.lineup_frequency_band || !verified,
        },
        {
          key: 'track', label: R.axisTrack,
          score: Math.min(100, exp.length * 25),
          next: exp.length < 3 ? R.nextAddExperience : R.nextGoodBase,
          actionable: exp.length < 3,
        },
        {
          key: 'reach', label: R.axisReach,
          score: Math.min(100, links.length * 34),
          next: links.length === 0 ? R.nextAddLink : R.nextPresenceExists,
          actionable: links.length === 0,
        },
        {
          key: 'ready', label: R.axisReady,
          score: (a.set_length ? 40 : 0) + (a.regions ? 30 : 0) + (a.invoice_ready ? 30 : 0),
          next: !a.invoice_ready ? R.nextEnableInvoice : R.nextReady,
          actionable: !a.invoice_ready,
        },
      ]
      // single most-impactful next action = weakest axis that still has a real move
      const weakest = axes.filter((x) => x.actionable).sort((x, y) => x.score - y.score)[0]
      setData({ a, axes, nextAction: weakest ? weakest.next : R.nextAllCovered })
      setLoading(false)
     } catch {
      setLoadError(true)
      setLoading(false)
     }
    })()
  }, [user.id, T])

  if (loading) return <Loading />
  if (loadError) return (
    <PageShell><Wordmark className="mb-6" />
      <ErrorState title={T.common.error} onRetry={() => { setLoading(true); setLoadError(false); window.location.reload() }} /></PageShell>
  )
  if (!data) return (
    <PageShell><Wordmark className="mb-6" />
      <EmptyState title={T.readiness.emptyTitle}
        action={<Link to="/onboarding" className="btn-primary">{T.readiness.buildProfile}</Link>} /></PageShell>
  )

  return (
    <PageShell>
      <div className="mb-6 flex items-center justify-between">
        <Wordmark /><Link to="/artist/home" className="text-sm text-muted transition-colors hover:text-ink">{T.common.back}</Link>
      </div>
      <h1 className="font-display mb-1 text-2xl font-bold tracking-[-0.01em] text-ink">{T.readiness.title}</h1>
      <p className="mb-4 text-sm text-muted">{T.readiness.subtitle}</p>

      <div className="mb-6 space-y-3">
        {data.axes.map((ax) => (
          <div key={ax.key} className="card flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-ink">{ax.label}</p>
              <p className="text-xs text-muted">{ax.next}</p>
            </div>
            <StatusChip status={axisStatus(ax.score)} />
          </div>
        ))}
      </div>

      {/* one dominant next step — the coach's move, quiet and typographic */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.75)]">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{T.readiness.nextStep}</p>
        <p className="font-display text-lg font-bold tracking-[-0.01em] text-ink">{data.nextAction}</p>
      </div>
    </PageShell>
  )
}
