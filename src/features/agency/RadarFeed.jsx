import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useOrg } from '../../context/OrgContext.jsx'
import { getRadarInputs } from '../../lib/orgs.js'
import { logEvent, EVENTS } from '../../lib/analytics.js'
import { computeRadarSignals, projectRadarForRep } from '../../lib/radar.js'
import { RADAR_AUDIENCE_SPLIT_ENABLED } from '../../lib/constants.js'
import { PageShell, Loading, EmptyState, ErrorState, StatusChip, SourceLabel } from '../../components/ui.jsx'
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

// Categorical signal glyphs — one per action family. Shape + text, never a gauge.
const SIGNAL_ICON = {
  'refresh-evidence': '↻',
  'request-evidence': '✚',
  respond: '✉',
  publish: '↗',
  promote: '★',
  review: '✓',
}

// AG9 — RADAR feed. Each card = explained match + evidence basis + method-label +
// date + ONE action. Filters are triage only (no ranking sort).
export default function RadarFeed() {
  const { T } = useLang()
  const { activeOrgId } = useOrg()
  const nav = useNavigate()
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [fArtist, setFArtist] = useState('')
  const [fType, setFType] = useState('')
  // T-101: the rep entity fired ZERO analytics events. `radar_opened` is the
  // canon event for exactly this surface (already fired by the artist-side
  // radar home) — same name, rep side, so the operator cockpit stops being
  // blind to half the product. Fire-and-forget, once per mount, ids only.
  const radarLogged = useRef(false)

  // A failed query must NEVER masquerade as "no signals" — catch → real error state.
  async function load() {
    setError(false)
    try {
      // P0-PRIVACY B2 — AUDIENCE. This screen belongs to a REPRESENTATION org,
      // not to the artist. RADAR is artist-private intelligence: an
      // `artist_access` grant never authorizes the private interpretation, only
      // a purpose-bounded projection the artist named. With the flag ON we keep
      // ONLY that projection (src/lib/radar.js — the client mirror of migration
      // 042's SQL content law); with it OFF behavior is byte-identical to today.
      // Flag default OFF: this tightening removes information from a shipped
      // screen, so the owner enables it, not a deploy.
      const inputs = await getRadarInputs(activeOrgId, { audience: RADAR_AUDIENCE_SPLIT_ENABLED ? 'rep_summary' : 'artist_private' })
      const computed = computeRadarSignals(inputs)
      setSignals(RADAR_AUDIENCE_SPLIT_ENABLED ? projectRadarForRep(computed) : computed)
      if (!radarLogged.current) { radarLogged.current = true; logEvent(EVENTS.RADAR_OPENED, { role: 'agency', org_id: activeOrgId }) }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [activeOrgId])

  const artists = useMemo(() => [...new Set(signals.map((s) => s.artistName))], [signals])
  const types = useMemo(() => [...new Set(signals.map((s) => s.ruleId))], [signals])
  const filtered = signals.filter((s) => (!fArtist || s.artistName === fArtist) && (!fType || s.ruleId === fType))

  function actionRoute(sig) {
    // Every destination here must be AGENCY-reachable. `/evidence/:id` is gated
    // RequireRole=ARTIST (App.jsx), so routing the evidence actions there bounced
    // the agency straight back to /agency — a dead-end on the primary "Next" CTA
    // and the R1/R7/R8 cards. The agency can't edit an artist's evidence or
    // publish for them; its actionable surface for a roster artist is the
    // passport (or the requests inbox for a 'respond' signal).
    if (sig.actionType === 'respond') return '/agency/requests'
    return `/passport/${sig.artistId}`
  }

  if (loading) return <Loading />

  return (
    <PageShell>
      <div className="flex items-center justify-end mb-4"><Link to="/agency" className="tap-target text-sm text-muted hover:text-ink">{T.common.back}</Link></div>
      <h1 className="font-display text-xl font-bold text-ink mb-1">{T.radar.title}</h1>
      <p className="text-sm text-muted mb-4">{T.radar.subtitle}</p>
      {/* Honesty line, not a redesign: when the audience split is on, an empty
          or short feed is a MANDATE boundary, never "the artist has nothing". */}
      {RADAR_AUDIENCE_SPLIT_ENABLED && (
        <p className="text-xs text-faint mb-4">{T.radar.repProjectionNote}</p>
      )}

      {error ? (
        <ErrorState title={T.agency.loadError} onRetry={() => { setLoading(true); load() }} />
      ) : (
        <>
          {signals.length > 0 && (
            <div className="flex gap-2 mb-4">
              <select aria-label={T.radar.filterArtist} value={fArtist} onChange={(e) => setFArtist(e.target.value)}
                className="field flex-1 min-h-[44px] rounded-lg px-2 py-2 text-xs">
                <option value="">{T.radar.filterArtist}: {T.radar.filterAll}</option>
                {artists.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <select aria-label={T.radar.filterType} value={fType} onChange={(e) => setFType(e.target.value)}
                className="field flex-1 min-h-[44px] rounded-lg px-2 py-2 text-xs">
                <option value="">{T.radar.filterType}: {T.radar.filterAll}</option>
                {types.map((t) => <option key={t} value={t}>{T.radar.ruleLabel?.[t] || t}</option>)}
              </select>
            </div>
          )}

          {signals.length === 0 ? (
            // genuinely empty — the quiet is real, not a swallowed failure
            <EmptyState title={T.radar.empty} />
          ) : filtered.length === 0 ? (
            <EmptyState title={T.radar.empty}
              action={<button className="btn-ghost" onClick={() => { setFArtist(''); setFType('') }}>{T.radar.filterAll}</button>} />
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {filtered.map((sig) => (
                  <div key={`${sig.artistId}-${sig.ruleId}`} className="card">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span aria-hidden="true"
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line bg-surface2 text-[13px] text-gold">
                          {SIGNAL_ICON[sig.actionType] || '·'}
                        </span>
                        <StatusChip status={sig.status} />
                      </div>
                      <span className="font-mono text-[11px] text-faint">{sig.signalDate}</span>
                    </div>
                    <p className="text-sm text-ink mb-2">{explain(sig, T)}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        {(sig.methodLabel || sig.vstatus) && <SourceLabel status={sig.vstatus} methodLabel={sig.methodLabel} />}
                        {sig.evidenceBasis && <span className="min-w-0 line-clamp-2 whitespace-normal break-words text-xs leading-snug text-muted">{T.radar.basisLabel}: {sig.evidenceBasis}</span>}
                      </div>
                      <button onClick={() => nav(actionRoute(sig))}
                        className="chip bg-accent text-[#12160A] text-xs font-bold shrink-0 min-h-[44px] px-3">
                        {T.radar.action[sig.actionType]}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => nav(actionRoute(filtered[0]))} className="btn-primary w-full">{T.radar.next}</button>
            </>
          )}
        </>
      )}
    </PageShell>
  )
}
