import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { listRequestsForAgency, updateRequestStatus } from '../../lib/db.js'
import * as UI from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

const { PageShell, Loading, EmptyState, ErrorState } = UI

// Band capsule — mono, bordered, NEVER a bar/gauge (firewall). Prefer the shared
// ui.jsx BandPill once the foundation ships it; local fallback keeps builds green.
const BandPill = UI.BandPill || function BandPill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-ink">
      {children}
    </span>
  )
}

const STATUS_STYLE = { new: 'bg-accent/10 text-accent', replied: 'bg-teal/10 text-teal', closed: 'bg-surface2 text-muted' }

export default function AgencyRequestsInbox() {
  const { T } = useLang()
  const STATUS_LABEL = { new: T.agency.statusNew, replied: T.agency.statusReplied, closed: T.agency.statusClosed }
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [rows, setRows] = useState([])
  const [openId, setOpenId] = useState(null)       // one row expanded at a time
  const [confirmCloseId, setConfirmCloseId] = useState(null) // inline confirm chip, never a modal
  const [busyId, setBusyId] = useState(null)
  // G4 (A5): the roster's "Reply to request" chip deep-links here BOUND to one
  // artist (?artist=<id>) — filter to that artist and auto-open their newest
  // 'new' request, so the action lands ON the thing to answer, not a pile.
  const [searchParams, setSearchParams] = useSearchParams()
  const artistFilter = searchParams.get('artist') || ''
  const autoOpened = useRef(false)

  async function load() {
    setError(false)
    try {
      setRows(await listRequestsForAgency(user.id))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [user.id])

  // Auto-open ONCE after load: the artist's first still-'new' request, else
  // their most recent one — never re-fires after status changes/reloads.
  useEffect(() => {
    if (autoOpened.current || loading || !artistFilter) return
    const mine = rows.filter((r) => r.artist_id === artistFilter)
    const first = mine.find((r) => r.status === 'new') || mine[0]
    if (first) { autoOpened.current = true; setOpenId(first.id) }
  }, [loading, artistFilter, rows])

  async function setStatus(id, status) {
    setBusyId(id)
    try { await updateRequestStatus(id, status); await load() } catch { setError(true) }
    finally { setBusyId(null); setConfirmCloseId(null) }
  }

  function toggle(id) {
    setConfirmCloseId(null)
    setOpenId((cur) => (cur === id ? null : id))
  }

  if (loading) return <Loading />
  if (error) return <PageShell><ErrorState title={T.agency.loadError} onRetry={() => { setLoading(true); load() }} /></PageShell>

  const visible = artistFilter ? rows.filter((r) => r.artist_id === artistFilter) : rows
  const filterName = artistFilter ? visible.find((r) => r.artists?.stage_name)?.artists?.stage_name || '' : ''

  return (
    <PageShell>
      <div className="flex items-center justify-end mb-6">
        <Link to="/agency" className="tap-target text-sm text-muted hover:text-ink">{T.common.back}</Link>
      </div>
      <h1 className="font-display text-xl font-bold text-ink mb-4">{T.agency.requests}</h1>

      {/* artist-bound view notice — a triage filter, never a rank */}
      {artistFilter && (
        <div className="mb-3 flex items-center gap-2">
          <span className="chip border border-line bg-surface2 px-2.5 py-1 text-xs text-ink">{T.agency.filteredForArtist(filterName)}</span>
          <button type="button" className="tap-target text-xs text-muted underline hover:text-ink" onClick={() => setSearchParams({}, { replace: true })}>
            {T.agency.showAllRequests}
          </button>
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState title={T.agency.requestsEmpty}
          action={artistFilter ? (
            <button className="btn-ghost" onClick={() => setSearchParams({}, { replace: true })}>{T.agency.showAllRequests}</button>
          ) : undefined} />
      ) : (
        <div className="space-y-3">
          {visible.map((r) => {
            const open = openId === r.id
            return (
              <div key={r.id} className={`card transition ${open ? 'border-accent' : ''}`}>
                {/* collapsed row — one tap opens the detail in place (no drawer, no modal) */}
                <button type="button" onClick={() => toggle(r.id)} aria-expanded={open}
                  className="flex min-h-[44px] w-full items-center justify-between gap-2 text-start">
                  <div className="min-w-0">
                    <p className="line-clamp-2 whitespace-normal break-words font-bold leading-snug text-ink">{r.requester_name}{r.requester_org ? ` · ${r.requester_org}` : ''}</p>
                    <p className="line-clamp-2 whitespace-normal break-words text-xs leading-snug text-muted">
                      {r.artists?.stage_name && <>{T.agency.forArtist} {r.artists.stage_name} · </>}
                      <span className="font-mono">{r.event_date || T.agency.noDate}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`chip ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                    <span aria-hidden="true" className={`text-muted transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
                  </div>
                </button>

                {/* expanded detail — requester, event, bands, message, actions */}
                {open && (
                  <div className="mt-3 border-t border-line pt-3 animate-fade-in">
                    <div className="space-y-1.5 text-sm">
                      <DetailRow label={T.agency.requesterLabel} value={`${r.requester_name}${r.requester_org ? ` · ${r.requester_org}` : ''}`} />
                      {r.artists?.stage_name && <DetailRow label={T.agency.artistLabel || 'Artist'} value={r.artists.stage_name} />}
                      <DetailRow label={T.agency.eventLabel} value={`${r.event_date || T.agency.noDate} · ${r.location || '—'}`} mono />
                      {(r.capacity_band || r.budget_band) && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {r.capacity_band && <BandPill>{T.agency.audience} {r.capacity_band}</BandPill>}
                          {r.budget_band && <BandPill>{T.agency.budget} {r.budget_band}</BandPill>}
                        </div>
                      )}
                      {r.message && <p className="rounded-lg bg-surface2 px-3 py-2 text-sm text-ink">{r.message}</p>}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {r.status !== 'replied' && (
                        <button className="btn-ghost text-sm py-2" disabled={busyId === r.id}
                          onClick={() => setStatus(r.id, 'replied')}>{T.agency.markReplied}</button>
                      )}
                      {r.status !== 'closed' && (confirmCloseId === r.id ? (
                        // inline confirm chip — closing hides the request, so ask once, in place
                        <span className="inline-flex items-center gap-2 rounded-full border border-amber px-3 py-1.5 text-xs animate-fade-in">
                          <span className="text-amber">{T.agency.closeConfirm}</span>
                          <button className="tap-target font-bold text-amber underline" disabled={busyId === r.id}
                            onClick={() => setStatus(r.id, 'closed')}>{T.agency.markClosed}</button>
                          <button className="tap-target text-muted" onClick={() => setConfirmCloseId(null)}>{T.common.cancel}</button>
                        </span>
                      ) : (
                        <button className="btn-ghost text-sm py-2" disabled={busyId === r.id}
                          onClick={() => setConfirmCloseId(r.id)}>{T.agency.markClosed}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}

function DetailRow({ label, value, mono = false }) {
  return (
    <p className="flex items-baseline gap-2">
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">{label}</span>
      <span className={`min-w-0 text-ink ${mono ? 'font-mono text-[13px]' : ''}`}>{value}</span>
    </p>
  )
}
