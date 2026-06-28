import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useOrg } from '../../context/OrgContext.jsx'
import { getRadarInputs } from '../../lib/orgs.js'
import { computeRadarSignals } from '../../lib/radar.js'
import { PageShell, Wordmark, Loading, EmptyState, StatusChip, SourceLabel } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// Build the firewall-safe explanation from the rule's i18n function.
function explain(sig, T) {
  const r = T.radar.rule[sig.ruleId]
  if (!r) return ''
  const demand = sig.demand ? `${sig.demand.event_type}${sig.demand.location ? ' · ' + sig.demand.location : ''}` : ''
  switch (sig.ruleId) {
    case 'R1': return r(sig.artistName, demand, sig.ageDays)
    case 'R2': case 'R3': case 'R6': return r(sig.artistName, demand)
    case 'R7': return r(sig.artistName, sig.ageDays)
    default: return r(sig.artistName)
  }
}

// AG9 — RADAR feed. Each card = explained match + evidence basis + method-label +
// date + ONE action. Filters are triage only (no ranking sort).
export default function RadarFeed() {
  const { T } = useLang()
  const { activeOrgId } = useOrg()
  const nav = useNavigate()
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(true)
  const [fArtist, setFArtist] = useState('')
  const [fType, setFType] = useState('')

  useEffect(() => { (async () => {
    try { const inputs = await getRadarInputs(activeOrgId); setSignals(computeRadarSignals(inputs)) }
    finally { setLoading(false) }
  })() }, [activeOrgId])

  const artists = useMemo(() => [...new Set(signals.map((s) => s.artistName))], [signals])
  const types = useMemo(() => [...new Set(signals.map((s) => s.ruleId))], [signals])
  const filtered = signals.filter((s) => (!fArtist || s.artistName === fArtist) && (!fType || s.ruleId === fType))

  function actionRoute(sig) {
    switch (sig.actionType) {
      case 'refresh-evidence':
      case 'request-evidence': return `/evidence/${sig.artistId}`
      case 'respond': return '/agency/requests'
      default: return `/passport/${sig.artistId}`
    }
  }

  if (loading) return <Loading />

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-4"><Wordmark /><Link to="/agency" className="text-sm text-muted">{T.common.back}</Link></div>
      <h1 className="text-xl font-bold text-soft mb-1">{T.radar.title}</h1>
      <p className="text-sm text-muted mb-4">{T.radar.subtitle}</p>

      {signals.length > 0 && (
        <div className="flex gap-2 mb-4">
          <select aria-label={T.radar.filterArtist} value={fArtist} onChange={(e) => setFArtist(e.target.value)}
            className="bg-surface text-soft text-xs rounded-lg px-2 py-2 border border-line flex-1 min-h-[40px]">
            <option value="">{T.radar.filterArtist}: {T.radar.filterAll}</option>
            {artists.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select aria-label={T.radar.filterType} value={fType} onChange={(e) => setFType(e.target.value)}
            className="bg-surface text-soft text-xs rounded-lg px-2 py-2 border border-line flex-1 min-h-[40px]">
            <option value="">{T.radar.filterType}: {T.radar.filterAll}</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title={T.radar.empty} />
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {filtered.map((sig) => (
              <div key={`${sig.artistId}-${sig.ruleId}`} className="card">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <StatusChip status={sig.status} />
                  <span className="text-xs text-muted">{sig.signalDate}</span>
                </div>
                <p className="text-sm text-soft mb-2">{explain(sig, T)}</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {(sig.methodLabel || sig.vstatus) && <SourceLabel status={sig.vstatus} methodLabel={sig.methodLabel} />}
                    {sig.evidenceBasis && <span className="text-xs text-muted truncate">{T.radar.basisLabel}: {sig.evidenceBasis}</span>}
                  </div>
                  <button onClick={() => nav(actionRoute(sig))}
                    className="chip bg-accent text-ink text-xs font-bold shrink-0 min-h-[36px] px-3">
                    {T.radar.action[sig.actionType]}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => nav(actionRoute(filtered[0]))} className="btn-primary w-full">{T.radar.next}</button>
        </>
      )}
    </PageShell>
  )
}
