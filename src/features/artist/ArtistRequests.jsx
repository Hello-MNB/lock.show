import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getMyArtist, listRequestsForArtist, updateRequestStatus } from '../../lib/db.js'
import * as UI from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { logEvent, EVENTS } from '../../lib/analytics.js'

const { PageShell, Loading, EmptyState, ErrorState } = UI

// Band capsule — mono, bordered, NEVER a bar/gauge (firewall). Same fallback
// pattern as AgencyRequestsInbox, kept local so builds stay green either way.
const BandPill = UI.BandPill || function BandPill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-ink">
      {children}
    </span>
  )
}

const STATUS_STYLE = { new: 'bg-accent/10 text-accent', replied: 'bg-teal/10 text-teal', closed: 'bg-surface2 text-muted' }

// V5(a) (owner witness-fix 20 Jul) — root cause of the "1980-10-10" sighting:
// this row/detail rendering does ZERO date parsing (no `new Date()` anywhere
// below) — event_date is printed as the raw `date` column string, so a value
// like 1980-10-10 can only be literally what a row's event_date column holds.
// That rules out a client-side parsing/epoch bug in THIS component; it is a
// bad row (either a manual/API test insert, since server/index.js only checks
// the /^\d{4}-\d{2}-\d{2}$/ SHAPE — not plausibility — before writing
// availability_requests.event_date, or a stray seed/test row). As a defensive
// belt-and-suspenders fix regardless of DB hygiene, treat any date before the
// product's plausible floor as garbage and render the same no-date i18n
// label instead of a nonsense year — never hides a genuine past booking
// (requests can legitimately reference a date that has since passed).
const EVENT_DATE_FLOOR_YEAR = 2020
function isSaneEventDate(d) {
  if (!d || typeof d !== 'string') return false
  const m = /^(\d{4})-\d{2}-\d{2}$/.exec(d)
  return !!m && Number(m[1]) >= EVENT_DATE_FLOOR_YEAR
}
function eventDateLabel(d, T) {
  return isSaneEventDate(d) ? d : T.agency.noDate
}

// §17.A.4 decision-widget: a missing-info flag list computed from the
// request's OWN fields — deliberately about this request's completeness,
// never a match/fit assessment between artist and buyer. The firewall's
// "fit is a one-sentence human reason, never a match score" rules out
// computing genuine artist-vs-request compatibility here anyway (this
// screen never loads the artist's own capability data) — completeness is
// the honest, buildable reading of "fit line" available without a migration.
function missingFields(r, T) {
  const out = []
  if (!isSaneEventDate(r.event_date)) out.push(T.request.eventDate)
  if (!r.location) out.push(T.request.location)
  if (!r.capacity_band) out.push(T.request.capacity)
  if (!r.budget_band) out.push(T.request.budget)
  if (!r.message) out.push(T.request.message)
  return out
}

// Artist nav "Requests" tab (IA CORRECTION — canon: Radar · Passport ·
// Requests · Account). Incoming availability requests from booking managers —
// the buyer-side "Check availability" action on the public Passport (A15)
// lands here. Same lean list → expand → in-place-decide pattern as the
// agency inbox (AgencyRequestsInbox), scoped to the artist's OWN requests
// only, now deepened to the §17.A.4 "decision widget" spec (T-A2, 20 Jul):
// each request card carries a one-sentence completeness line, a safety cue,
// and the two buildable of its three named actions ("Say I may be
// available" / "Not for me" — see the in-place comment below for why "Ask
// one question" is a flagged gap, not faked). The artist's reply now fires
// `availability_request_responded` (CANON since 028, never wired anywhere
// until this pass) — the Gate-adjacent reaction signal §17.A.4 names.
export default function ArtistRequests() {
  const { T } = useLang()
  // Chip labels are spec-worded for THIS screen only — AgencyRequestsInbox
  // keeps its own generic statusReplied/statusClosed wording untouched.
  const STATUS_LABEL = { new: T.agency.statusNew, replied: T.agency.availabilitySentChip, closed: T.agency.declinedChip }
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [rows, setRows] = useState([])
  const [openId, setOpenId] = useState(null)       // one row expanded at a time
  const [confirmCloseId, setConfirmCloseId] = useState(null) // inline confirm chip, never a modal
  const [busyId, setBusyId] = useState(null)
  const [bloomId, setBloomId] = useState(null)     // brief .bloom-confirm on a successful "available" reply

  async function load() {
    setError(false)
    try {
      const artist = await getMyArtist(user.id)
      setRows(artist ? await listRequestsForArtist(artist.id) : [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [user.id])

  async function setStatus(id, status, artistId) {
    setBusyId(id)
    try {
      await updateRequestStatus(id, status)
      await load()
      // GATE-adjacent reaction signal (§17.A.4 "this is the Gate reaction
      // path") — the artist's own reply to a real request. Method-safe:
      // carries WHICH bounded response, never a score/count back to anyone.
      logEvent(EVENTS.REQUEST_RESPONDED, { artist_id: artistId, request_id: id, response: status })
      if (status === 'replied') {
        setBloomId(id)
        setTimeout(() => setBloomId((cur) => (cur === id ? null : cur)), 520)
      }
    } catch { setError(true) }
    finally { setBusyId(null); setConfirmCloseId(null) }
  }

  function toggle(id) {
    setConfirmCloseId(null)
    setOpenId((cur) => (cur === id ? null : id))
  }

  if (loading) return <Loading />
  if (error) return <PageShell><ErrorState title={T.agency.loadError} onRetry={() => { setLoading(true); load() }} /></PageShell>

  return (
    // One viewport, contained-scroll list region — the same idiom already
    // proven on Settings.jsx / ActEditor.jsx (§6 law 7 / §10.2): the title
    // row stays fixed, the (variable-length) request list scrolls inside
    // ONE named internal region, never the outer page.
    <div className="flex h-[calc(100dvh-7.5rem)] flex-col overflow-hidden px-4 pt-4 sm:px-8 md:h-[calc(100dvh-3.5rem)] md:pt-6">
      <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col animate-fade-in">
        <h1 className="font-display shrink-0 text-xl font-bold text-ink mb-4">{T.agency.requests}</h1>

        {rows.length === 0 ? (
          // V5(b) (owner witness-fix 20 Jul): a warm empty state, not a bare
          // title — `requestsEmptyHint` already exists in both i18n locales
          // (used today by AgencyDashboard's own empty state) but wasn't wired
          // here; reusing it needs no new manifest keys. headline carries the
          // short title, title carries the explanatory line (EmptyState's own
          // layout), matching the same warm pattern already used elsewhere.
          <div className="min-h-0 flex-1 overflow-y-auto">
            <EmptyState headline={T.agency.requestsEmpty} title={T.agency.requestsEmptyHint} />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pb-4" role="region" aria-label={T.agency.requests}>
            <div className="space-y-3">
              {rows.map((r) => {
                const open = openId === r.id
                const missing = missingFields(r, T)
                return (
                  <div key={r.id}
                    className={`card transition ${open ? 'border-accent' : ''} ${bloomId === r.id ? 'bloom-confirm' : ''} ${r.status === 'new' && !open ? 'glow-found' : ''}`}>
                    {/* collapsed row — one tap opens the detail in place (no drawer, no modal) */}
                    <button type="button" onClick={() => toggle(r.id)} aria-expanded={open}
                      className="flex min-h-[44px] w-full items-center justify-between gap-2 text-start">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 font-bold text-ink">
                          {/* "new" state visual (§17.A.4 state map: "lime dot, raised") —
                              text still carries the state via the chip below, this dot is
                              the extra motion cue, never the only signal. */}
                          {r.status === 'new' && <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                          <span className="min-w-0 truncate">{r.requester_name}{r.requester_org ? ` · ${r.requester_org}` : ''}</span>
                        </p>
                        <p className="truncate text-xs text-muted"><span className="font-mono">{eventDateLabel(r.event_date, T)}</span></p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className={`chip ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                        <span aria-hidden="true" className={`text-muted transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
                      </div>
                    </button>

                    {/* expanded detail — decision-widget summary, then requester, event, bands, message, actions */}
                    {open && (
                      <div className="mt-3 border-t border-line pt-3 animate-fade-in">
                        <p className="text-sm font-semibold text-ink">
                          {missing.length === 0 ? T.agency.requestFitComplete : T.agency.requestFitPartial}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">{T.agency.safetyCueNoContact}</p>
                        {missing.length > 0 && (
                          <p className="mt-0.5 text-xs text-muted">
                            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-faint">{T.agency.missingInfoLabel}</span>{' '}
                            {missing.join(' · ')}
                          </p>
                        )}

                        <div className="mt-2 space-y-1.5 text-sm">
                          <DetailRow label={T.agency.requesterLabel} value={`${r.requester_name}${r.requester_org ? ` · ${r.requester_org}` : ''}`} />
                          <DetailRow label={T.agency.eventLabel} value={`${eventDateLabel(r.event_date, T)} · ${r.location || '—'}`} mono />
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
                            <button className="btn-primary text-sm py-2" disabled={busyId === r.id}
                              onClick={() => setStatus(r.id, 'replied', r.artist_id)}>{T.agency.requestSayAvailable}</button>
                          )}
                          {/* "Ask one question" (§17.A.4) is intentionally NOT built here:
                              AvailabilityRequest.jsx captures no buyer contact (no email/
                              phone column on availability_requests, migration 001) and
                              the `status` CHECK constraint has no 'asked' value — there is
                              today no channel to deliver a question back to a buyer, or a
                              state to record one pending. A real gap, flagged in the build
                              report (needs buyer-contact capture + a migration + reverse-
                              direction email), not faked with a button that goes nowhere. */}
                          {r.status !== 'closed' && (confirmCloseId === r.id ? (
                            // inline confirm chip — declining hides the primary action, so ask once, in place
                            <span className="inline-flex items-center gap-2 rounded-full border border-amber px-3 py-1.5 text-xs animate-fade-in">
                              <span className="text-amber">{T.agency.declineConfirm}</span>
                              <button className="font-bold text-amber underline" disabled={busyId === r.id}
                                onClick={() => setStatus(r.id, 'closed', r.artist_id)}>{T.agency.requestNotForMe}</button>
                              <button className="text-muted" onClick={() => setConfirmCloseId(null)}>{T.common.cancel}</button>
                            </span>
                          ) : (
                            <button className="btn-ghost text-sm py-2" disabled={busyId === r.id}
                              onClick={() => setConfirmCloseId(r.id)}>{T.agency.requestNotForMe}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
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
