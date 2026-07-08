import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { listAgencyArtists, listClaimsByArtists, listRequestsForAgency, upsertArtist } from '../../lib/db.js'
import AgencyRadarUniverse from './AgencyRadarUniverse.jsx'
import { PageShell, Wordmark, Loading, ErrorState, StatusChip, Field, Spinner, LanguageToggle, useToast } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { useOrg } from '../../context/OrgContext.jsx'
import { STATUS } from '../../lib/constants.js'

function ChecklistRow({ done, label, to }) {
  const inner = (<><span className={done ? 'text-accent' : 'text-muted'} aria-hidden="true">{done ? '✓' : '○'}</span><span className={done ? 'text-muted line-through' : 'text-ink'}>{label}</span></>)
  return <li className="flex items-center gap-2">{to && !done ? <Link to={to} className="flex items-center gap-2 hover:text-accent">{inner}</Link> : inner}</li>
}

// bounded roster signal (firewall: never a number)
function rosterStatus(a) {
  const signals = [a.lineup_frequency_band, a.sells_tickets != null, a.price_band, a.photo_url].filter(Boolean).length
  if (signals >= 3) return STATUS.STRONG
  if (signals >= 1) return STATUS.DEVELOPING
  return STATUS.MISSING
}

const fmtDate = (d) => {
  if (!d) return null
  const t = new Date(d)
  return Number.isNaN(t.getTime()) ? null : t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Incoming-requests side card — the ops-room "what's knocking" panel.
// The count is an INBOX count (like unread mail), never a grade.
function RequestsSideCard({ requests, T }) {
  const failed = requests === null
  const list = requests || []
  const fresh = list.filter((r) => r.status === 'new')
  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">{T.agency.requests}</p>
        {fresh.length > 0 && (
          <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold text-[#12160A]">{fresh.length} new</span>
        )}
      </div>
      {failed ? (
        <p className="text-xs text-muted">Couldn't load requests right now.</p>
      ) : list.length === 0 ? (
        <p className="text-xs text-muted">No requests yet. Share a published Passport link — availability requests land here.</p>
      ) : (
        <ul className="space-y-2">
          {list.slice(0, 3).map((r) => (
            <li key={r.id} className="flex items-start justify-between gap-2 border-b border-line pb-2 last:border-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{r.requester_name}</p>
                <p className="truncate text-xs text-muted">{r.artists?.stage_name || '—'}</p>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-faint">{fmtDate(r.event_date || r.created_date) || T.agency.noDate}</span>
            </li>
          ))}
        </ul>
      )}
      <Link to="/agency/requests" className="mt-3 block text-sm font-semibold text-accent hover:underline">Open inbox ›</Link>
    </div>
  )
}

export default function AgencyDashboard() {
  const { T } = useLang()
  const { user, signOut } = useAuth()
  const { isAgency } = useOrg()
  const nav = useNavigate()
  const toast = useToast()
  const [hideChecklist, setHideChecklist] = useState(() => { try { return localStorage.getItem('gigproof_hide_checklist') === '1' } catch { return false } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [artists, setArtists] = useState([])
  const [rosterClaims, setRosterClaims] = useState([])
  const [requests, setRequests] = useState([])
  const [adding, setAdding] = useState(false)
  const [f, setF] = useState({ stage_name: '', genre: '' })
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [justAddedId, setJustAddedId] = useState(null)
  const highlightTimer = useRef(null)

  async function load() {
    setError(false)
    try {
      const roster = await listAgencyArtists(user.id)
      setArtists(roster)
      try { setRosterClaims(await listClaimsByArtists(roster.map((a) => a.id))) } catch { setRosterClaims([]) }
      try { setRequests(await listRequestsForAgency(user.id)) } catch { setRequests(null) }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [user.id])
  useEffect(() => () => clearTimeout(highlightTimer.current), [])

  async function addArtist(e) {
    e.preventDefault()
    if (!f.stage_name.trim()) return
    setSaveError(''); setBusy(true)
    try {
      const created = await upsertArtist({ created_by: user.id, name: f.stage_name, stage_name: f.stage_name, genre: f.genre })
      const addedName = f.stage_name
      setF({ stage_name: '', genre: '' }); setAdding(false)
      await load()
      // SUCCESS is visible: toast + the new row glows for a moment (no silent reload)
      toast.show(`${addedName} added to your roster`)
      if (created?.id) {
        setJustAddedId(created.id)
        clearTimeout(highlightTimer.current)
        highlightTimer.current = setTimeout(() => setJustAddedId(null), 4000)
      }
    } catch {
      setSaveError(T.agency.saveError)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loading />
  if (error) return <PageShell><Wordmark className="mb-6" /><ErrorState title={T.admin.loadError} onRetry={() => { setLoading(true); load() }} /></PageShell>

  return (
    <PageShell max="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Wordmark />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button className="text-sm text-muted hover:text-ink" onClick={() => { signOut(); nav('/login') }}>{T.settings.logout}</button>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-xl font-bold text-ink">{T.agency.title}</h1>
        <div className="flex items-center gap-4">
          <Link to="/agency/radar" className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent hover:underline">Radar ›</Link>
          <Link to="/agency/requests" className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent hover:underline">{T.agency.requests} ›</Link>
        </div>
      </div>

      {/* ── THE ROSTER UNIVERSE — the manager's home: artists as worlds ── */}
      <AgencyRadarUniverse artists={artists} claims={rosterClaims} />

      {/* first-run checklist — dismissible, non-shaming */}
      {!hideChecklist && (
        <div className="card mb-4 border border-line">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-ink text-sm">{T.org.checklistTitle}</p>
            <button className="text-xs text-muted" onClick={() => { try { localStorage.setItem('gigproof_hide_checklist', '1') } catch { /* ignore */ } setHideChecklist(true) }}>{T.org.checklistDismiss}</button>
          </div>
          <ul className="space-y-1.5 text-sm">
            <ChecklistRow done={artists.length > 0} label={T.org.checklistAddArtist} />
            <ChecklistRow done={false} label={T.org.checklistInviteTeam} to="/org/members" />
            <ChecklistRow done={artists.some((a) => a.published)} label={T.org.checklistPublish} />
          </ul>
        </div>
      )}

      {/* ── OPS ROOM: roster (main) + incoming requests (side) ── */}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div id="roster">
          {artists.length === 0 && !adding ? (
            <div className="card text-center py-8">
              <p className="font-display font-bold text-ink mb-1">{T.agency.empty}</p>
              <p className="text-sm text-muted mb-4">{T.org.emptyRosterBody}</p>
              <div className="flex flex-col gap-2">
                <button className="btn-primary" onClick={() => setAdding(true)}>{T.agency.addArtist}</button>
                <Link to="/org/members" className="btn-ghost">{T.org.inviteTeamCta}</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {artists.map((a) => {
                  const fresh = fmtDate(a.updated_at || a.created_at)
                  return (
                    <Link key={a.id} to={`/passport/${a.id}`}
                      className={`card flex items-center justify-between gap-3 transition hover:border-accent ${a.id === justAddedId ? 'border-accent ring-1 ring-accent animate-fade-in' : ''}`}>
                      <div className="flex min-w-0 items-center gap-3">
                        {a.photo_url ? <img src={a.photo_url} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                          : <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface2 font-display text-lg text-ink">{(a.stage_name || '?').slice(0, 1)}</div>}
                        <div className="min-w-0">
                          <p className="truncate font-bold text-ink">{a.stage_name || T.agency.noName}</p>
                          <p className="truncate text-xs text-muted">{a.genre || '—'} · {a.published ? T.agency.publishedTag : T.agency.draftTag}</p>
                          {fresh && <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-faint">Updated {fresh}</p>}
                        </div>
                      </div>
                      <StatusChip status={rosterStatus(a)} />
                    </Link>
                  )
                })}
              </div>
              {adding ? (
                <form onSubmit={addArtist} className="card">
                  <Field label={T.onboarding.stageName}><input className="field" value={f.stage_name} onChange={(e) => setF({ ...f, stage_name: e.target.value })} /></Field>
                  <Field label={T.onboarding.genre}><input className="field" value={f.genre} onChange={(e) => setF({ ...f, genre: e.target.value })} /></Field>
                  {saveError && <p className="text-xs text-amber mb-2">{saveError}</p>}
                  <div className="flex gap-2">
                    <button className="btn-primary flex-1" disabled={busy}>{busy ? <Spinner /> : T.common.save}</button>
                    <button type="button" className="btn-ghost" onClick={() => setAdding(false)}>{T.common.cancel}</button>
                  </div>
                </form>
              ) : (
                <button className="btn-ghost w-full" onClick={() => setAdding(true)}>+ {T.agency.addArtist}</button>
              )}
            </>
          )}
        </div>

        <RequestsSideCard requests={requests} T={T} />
      </div>
    </PageShell>
  )
}
