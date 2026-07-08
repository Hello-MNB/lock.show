import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { listAgencyArtists, listClaimsByArtists, listRequestsForAgency, upsertArtist } from '../../lib/db.js'
import { requestArtistAccess, listOutgoingAccessRequests } from '../../lib/orgs.js'
import AgencyRadarUniverse from './AgencyRadarUniverse.jsx'
import { PageShell, Loading, ErrorState, StatusChip, Field, Spinner, useToast } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { useOrg } from '../../context/OrgContext.jsx'
import { STATUS } from '../../lib/constants.js'
import { DEMO } from '../../lib/demo.js'

// The exact 5 canon scope values (DB-STRUCTURE.md Layer 1) minus `view`, which
// is always included and never opted out of — every grant carries at least
// read access, that's the floor.
const OPTIONAL_SCOPES = ['upload', 'edit', 'share', 'publish']

function parseArtistId(raw) {
  const t = (raw || '').trim()
  const m = t.match(/\/passport\/([^/?#]+)/)
  return m ? m[1] : t
}

// ── Access-requests card — grants THIS org has requested against artists it
// does not own. Firewall/canon: a pending grant shows NOTHING about the
// artist beyond identification — RLS itself hides the artists row until the
// artist approves, so there is literally no content to leak here.
function AccessRequestsCard({ requests, T }) {
  if (!requests || requests.length === 0) return null
  return (
    <div className="mb-4">
      <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">{T.agency.accessRequestsTitle}</p>
      <div className="space-y-2">
        {requests.map((r) => (
          <div key={r.id} className="card flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-bold text-ink">{r.artist?.stage_name || r.artist_stage_name || T.agency.pendingArtistLabel}</p>
              {r.status === 'pending' && <p className="text-xs text-amber">{T.agency.awaitingApproval}</p>}
              {r.status === 'active' && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {(r.scope || []).map((s) => (
                    <span key={s} className="chip border border-line bg-surface2 px-2 py-0.5 text-[10px] text-ink">
                      {T.access[`scope${s.charAt(0).toUpperCase()}${s.slice(1)}`] || s}
                    </span>
                  ))}
                </div>
              )}
              {r.status === 'revoked' && <p className="text-xs text-muted">{T.agency.accessRevoked}</p>}
            </div>
            <span className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] ${r.status === 'active' ? 'text-accent' : r.status === 'pending' ? 'text-amber' : 'text-faint'}`}>
              {r.status === 'active' ? T.representation.activeLabel : r.status === 'pending' ? T.agency.pendingArtistLabel : T.representation.revokedLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

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
  const { user } = useAuth()
  const { isAgency, activeOrgId, memberships } = useOrg()
  // DEMO ONLY: OrgContext's activeOrgId defaults to the solo/artist org even
  // on this screen (the already-documented "context switcher is a no-op"
  // gap — ENTITY-SPEC-ORG §3/§6.1 item 5). This screen inherently represents
  // the agency workspace, so resolve it directly from the demo memberships
  // rather than depend on a switch the user hasn't necessarily made. Real
  // accounts use activeOrgId as-is — switching context there is the real,
  // still-open fix tracked separately.
  const orgIdForThisScreen = DEMO
    ? (memberships.find((m) => ['agency', 'agency_plus'].includes(m.organization?.plan))?.organization?.id || activeOrgId)
    : activeOrgId
  const toast = useToast()
  const [hideChecklist, setHideChecklist] = useState(() => { try { return localStorage.getItem('gigproof_hide_checklist') === '1' } catch { return false } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [artists, setArtists] = useState([])
  const [rosterClaims, setRosterClaims] = useState([])
  const [requests, setRequests] = useState([])
  const [accessRequests, setAccessRequests] = useState([])
  const [adding, setAdding] = useState(false)
  const [addMode, setAddMode] = useState('invite') // 'invite' (canon-correct, default) | 'own' (legacy placeholder)
  const [f, setF] = useState({ stage_name: '', genre: '' })
  const [inviteInput, setInviteInput] = useState('')
  const [inviteTerritory, setInviteTerritory] = useState('')
  const [inviteScope, setInviteScope] = useState(() => Object.fromEntries(OPTIONAL_SCOPES.map((s) => [s, false])))
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
      try { setAccessRequests(orgIdForThisScreen ? await listOutgoingAccessRequests(orgIdForThisScreen) : []) } catch { setAccessRequests([]) }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [user.id, orgIdForThisScreen])
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

  // Invite an EXISTING artist by Passport link/id — creates a status='pending'
  // artist_access row. Nothing about the artist is visible to this org until
  // they approve (REPRESENTATION-CANON §1.1 — grant requires artist consent).
  async function sendInvite(e) {
    e.preventDefault()
    const artistId = parseArtistId(inviteInput)
    if (!artistId || !orgIdForThisScreen) return
    setSaveError(''); setBusy(true)
    try {
      const scope = ['view', ...OPTIONAL_SCOPES.filter((s) => inviteScope[s])]
      const res = await requestArtistAccess(orgIdForThisScreen, artistId, { scope, territory: inviteTerritory.trim() || null })
      if (res?.ok === false) {
        setSaveError(T.agency.migration027Note)
      } else {
        setInviteInput(''); setInviteTerritory('')
        setInviteScope(Object.fromEntries(OPTIONAL_SCOPES.map((s) => [s, false])))
        setAdding(false)
        await load()
        toast.show(T.agency.inviteSent)
      }
    } catch {
      setSaveError(T.agency.saveError)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loading />
  if (error) return <PageShell><ErrorState title={T.admin.loadError} onRetry={() => { setLoading(true); load() }} /></PageShell>

  return (
    <PageShell max="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-xl font-bold text-ink">{T.agency.title}</h1>
        <div className="flex items-center gap-4">
          <Link to="/agency/radar" className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent hover:underline">Radar ›</Link>
          <Link to="/agency/requests" className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent hover:underline">{T.agency.requests} ›</Link>
        </div>
      </div>

      {/* ── THE ROSTER UNIVERSE — the manager's home: artists as worlds ── */}
      <AgencyRadarUniverse artists={artists} claims={rosterClaims} />

      {/* ── Representation — the artist_access consent handshake this org has
            requested (pending/active/revoked). Separate from the owned roster
            below: this is ACCESS, not ownership. ── */}
      <AccessRequestsCard requests={accessRequests} T={T} />

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
                <div className="card">
                  {/* mode toggle — invite (canon-correct, artist keeps their own
                      account + approval control) vs. legacy owned placeholder */}
                  <div className="mb-3 flex gap-1 rounded-full border border-line bg-surface2 p-1">
                    <button type="button"
                      className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition ${addMode === 'invite' ? 'bg-accent text-[#12160A]' : 'text-muted'}`}
                      onClick={() => setAddMode('invite')}>{T.agency.inviteTabInvite}</button>
                    <button type="button"
                      className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition ${addMode === 'own' ? 'bg-accent text-[#12160A]' : 'text-muted'}`}
                      onClick={() => setAddMode('own')}>{T.agency.inviteTabOwn}</button>
                  </div>

                  {addMode === 'invite' ? (
                    <form onSubmit={sendInvite}>
                      <Field label={T.agency.inviteFieldLabel} hint={T.agency.inviteFieldHint}>
                        <input className="field" dir="ltr" value={inviteInput} onChange={(e) => setInviteInput(e.target.value)} placeholder="https://…/passport/…" />
                      </Field>
                      <Field label={T.agency.inviteTerritoryLabel}>
                        <input className="field" value={inviteTerritory} onChange={(e) => setInviteTerritory(e.target.value)} />
                      </Field>
                      <Field label={T.agency.inviteScopeLabel}>
                        <div className="flex flex-wrap gap-2">
                          {OPTIONAL_SCOPES.map((s) => (
                            <label key={s} className="flex items-center gap-1.5 rounded-full border border-line bg-surface2 px-2.5 py-1 text-xs text-ink">
                              <input type="checkbox" checked={inviteScope[s]} onChange={(e) => setInviteScope({ ...inviteScope, [s]: e.target.checked })} />
                              {T.access[`scope${s.charAt(0).toUpperCase()}${s.slice(1)}`]}
                            </label>
                          ))}
                        </div>
                        {inviteScope.publish && <p className="mt-1.5 text-xs text-muted">{T.access.publishHint}</p>}
                      </Field>
                      {saveError && <p className="text-xs text-amber mb-2">{saveError}</p>}
                      <div className="flex gap-2">
                        <button className="btn-primary flex-1" disabled={busy || !inviteInput.trim()}>{busy ? <Spinner /> : T.agency.inviteSend}</button>
                        <button type="button" className="btn-ghost" onClick={() => setAdding(false)}>{T.common.cancel}</button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={addArtist}>
                      <p className="mb-3 text-xs text-muted">{T.agency.quickAddHint}</p>
                      <Field label={T.onboarding.stageName}><input className="field" value={f.stage_name} onChange={(e) => setF({ ...f, stage_name: e.target.value })} /></Field>
                      <Field label={T.onboarding.genre}><input className="field" value={f.genre} onChange={(e) => setF({ ...f, genre: e.target.value })} /></Field>
                      {saveError && <p className="text-xs text-amber mb-2">{saveError}</p>}
                      <div className="flex gap-2">
                        <button className="btn-primary flex-1" disabled={busy}>{busy ? <Spinner /> : T.common.save}</button>
                        <button type="button" className="btn-ghost" onClick={() => setAdding(false)}>{T.common.cancel}</button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <button className="btn-ghost w-full" onClick={() => { setSaveError(''); setAdding(true) }}>+ {T.agency.addArtist}</button>
              )}
            </>
          )}
        </div>

        <RequestsSideCard requests={requests} T={T} />
      </div>
    </PageShell>
  )
}
