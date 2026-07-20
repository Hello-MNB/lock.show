import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { listAgencyArtists, listClaimsByArtists, listRequestsForAgency, upsertArtist } from '../../lib/db.js'
import { requestArtistAccess, listOutgoingAccessRequests, revokeArtistAccess, listRosterGrants } from '../../lib/orgs.js'
import { pickRosterAction, fetchGrantArtistState } from './rosterNextAction.js'
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
// artist approves, so there is literally no content to leak here. Reads REAL
// artist_access rows (migration 027: scope[], territory, expires_at, status) —
// scope chips, territory and expiry all render from the actual grant, not a
// guess. Either side may revoke an active grant, or the requesting org may
// cancel its own still-pending invite (both go through revoke_artist_access).
function AccessRequestsCard({ requests, T, onRevoked }) {
  const [busyId, setBusyId] = useState(null)
  if (!requests || requests.length === 0) return null

  async function revoke(r) {
    const name = r.artist?.stage_name || r.artist_stage_name || T.agency.pendingArtistLabel
    if (!window.confirm(T.representation.revokeConfirm(name))) return
    setBusyId(r.id)
    try {
      await revokeArtistAccess(r.id)
      await onRevoked?.()
    } finally {
      setBusyId(null)
    }
  }

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
                <>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(r.scope || []).map((s) => (
                      <span key={s} className="chip border border-line bg-surface2 px-2 py-0.5 text-[10px] text-ink">
                        {T.access[`scope${s.charAt(0).toUpperCase()}${s.slice(1)}`] || s}
                      </span>
                    ))}
                  </div>
                  {(r.territory || r.expires_at) && (
                    <p className="mt-1 text-[11px] text-faint">
                      {[r.territory, r.expires_at && `${T.agency.accessExpires} ${fmtDate(r.expires_at)}`].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </>
              )}
              {r.status === 'revoked' && <p className="text-xs text-muted">{T.agency.accessRevoked}</p>}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <span className={`font-mono text-[10px] uppercase tracking-[0.08em] ${r.status === 'active' ? 'text-accent' : r.status === 'pending' ? 'text-amber' : 'text-faint'}`}>
                {r.status === 'active' ? T.representation.activeLabel : r.status === 'pending' ? T.agency.pendingArtistLabel : T.representation.revokedLabel}
              </span>
              {(r.status === 'pending' || r.status === 'active') && (
                <button className="chip border border-line bg-surface2 px-2 py-0.5 text-[10px] text-amber min-h-[44px]"
                  onClick={() => revoke(r)} disabled={busyId === r.id}>
                  {busyId === r.id ? <Spinner /> : (r.status === 'pending' ? T.agency.cancelInvite : T.representation.revoke)}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChecklistRow({ done, label, to }) {
  const inner = (<><span className={done ? 'text-accent' : 'text-muted'} aria-hidden="true">{done ? '✓' : '○'}</span><span className={done ? 'text-muted line-through' : 'text-ink'}>{label}</span></>)
  return <li className="flex items-center gap-2">{to && !done ? <Link to={to} className="tap-target flex items-center gap-2 hover:text-accent">{inner}</Link> : inner}</li>
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

// G4 (A5): the ONE next-best-action chip — commercial action TEXT bound to a
// specific artist's route (rosterNextAction.js derives it from real state).
// FIREWALL: never a count/%/score on the chip.
function NextActionChip({ action, T }) {
  return (
    <Link
      to={action.to}
      className={`chip min-h-[44px] border px-2 py-0.5 text-[10px] font-semibold transition ${
        action.urgent ? 'border-accent/60 text-accent hover:border-accent' : 'border-line text-ink hover:border-line2'}`}
    >
      {T.agency[action.key]} ›
    </Link>
  )
}

// Open 'new' availability requests for ONE artist — ladder input, never rendered.
const openRequestsFor = (requests, artistId) =>
  (requests || []).filter((r) => r.status === 'new' && r.artist_id === artistId).length

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
          <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold text-[#12160A]">{T.agency.newCount(fresh.length)}</span>
        )}
      </div>
      {failed ? (
        <p className="text-xs text-muted">{T.agency.requestsLoadError}</p>
      ) : list.length === 0 ? (
        <p className="text-xs text-muted">{T.agency.requestsEmptyHint}</p>
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
      <Link to="/agency/requests" className="tap-target mt-3 block text-sm font-semibold text-accent hover:underline">{T.agency.openInbox} ›</Link>
    </div>
  )
}

export default function AgencyDashboard() {
  const { T } = useLang()
  const { user } = useAuth()
  const { isAgency, activeOrgId, memberships } = useOrg()
  // DEMO ONLY: prefer the ACTIVE workspace if it's already a valid
  // (non-production) agency/management org — the switcher IS functional now
  // (OrgContext derives `role`/`isProducerWorkspace` from the active
  // membership, and RequireAgency/RequireProduction route on that) — only
  // fall back to picking any such demo org when activeOrgId doesn't resolve
  // to one (e.g. a stale deep link). Producer-type workspaces (INSOMNIA) are
  // deliberately excluded — that org's screen is ProductionDashboard, never
  // this one, even in demo mode.
  const isNonProductionAgency = (m) => ['agency', 'agency_plus'].includes(m.organization?.plan) && m.organization?.workspace_type !== 'producer'
  const orgIdForThisScreen = DEMO
    ? (memberships.find((m) => m.organization?.id === activeOrgId && isNonProductionAgency(m))?.organization?.id
        || memberships.find(isNonProductionAgency)?.organization?.id
        || activeOrgId)
    : activeOrgId
  const toast = useToast()
  const [hideChecklist, setHideChecklist] = useState(() => { try { return localStorage.getItem('gigproof_hide_checklist') === '1' } catch { return false } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [artists, setArtists] = useState([])
  const [rosterClaims, setRosterClaims] = useState([])
  const [requests, setRequests] = useState([])
  const [accessRequests, setAccessRequests] = useState([])
  const [grants, setGrants] = useState(null) // A6 (032): ACTIVE consented grants — null until 032 applied
  const [grantState, setGrantState] = useState({}) // G4: per-granted-artist bounded state (publish/evidence/requests)
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
      try {
        const g = await listRosterGrants() // A6 — consented roster (032)
        setGrants(g)
        // G4: the grant row carries no publish/evidence state — fetch the bounded
        // extra read-model here (feature-local; degrades to unknown on failure).
        if (Array.isArray(g) && g.length > 0) {
          try { setGrantState(await fetchGrantArtistState(g.map((x) => x.artist_id))) } catch { setGrantState({}) }
        } else {
          setGrantState({})
        }
      } catch { setGrants(null) }
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
      toast.show(T.agency.addedToRoster(addedName))
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
          <Link to="/agency/radar" className="tap-target font-mono text-[11px] uppercase tracking-[0.1em] text-accent hover:underline">{T.nav.radar} ›</Link>
          <Link to="/agency/requests" className="tap-target font-mono text-[11px] uppercase tracking-[0.1em] text-accent hover:underline">{T.agency.requests} ›</Link>
        </div>
      </div>

      {/* ── THE ROSTER UNIVERSE — the manager's home: artists as worlds ── */}
      <AgencyRadarUniverse artists={artists} claims={rosterClaims} />

      {/* ── Representation — the artist_access consent handshake this org has
            requested (pending/active/revoked). Separate from the owned roster
            below: this is ACCESS, not ownership. ── */}
      <AccessRequestsCard requests={accessRequests} T={T} onRevoked={load} />

      {/* ── A6 (032-backed): the CONSENTED roster — ACTIVE ArtistAccess grants.
            A grant, never ownership (ENTITY-GLOSSARY §2c boundary). Renders only
            when 032 is applied AND at least one grant is active.
            G4 (A5): ONE commercial next action per artist row, derived from that
            artist's REAL state — open request → reply · unpublished → publish ·
            stale evidence (>90d) → refresh · else share / request video. The 032
            grant row carries no publish/evidence fields, so fetchGrantArtistState
            loads that bounded read-model feature-side; unknown state degrades to
            the always-allowed view floor, never a guess. Scope-gated: only
            actions this grant's scope allows. Destination always carries the
            artist id — never a bare /agency/radar. ── */}
      {Array.isArray(grants) && grants.length > 0 && (
        <div className="card mb-4 border border-line">
          <p className="mb-0.5 font-bold text-ink text-sm">{T.agency.consentedTitle}</p>
          <p className="mb-2 text-xs text-muted">{T.agency.consentedHint}</p>
          <div className="space-y-1.5">
            {grants.map((g) => {
              const st = grantState[g.artist_id] || {}
              const action = pickRosterAction({
                artistId: g.artist_id,
                published: st.published ?? null,
                items: st.items ?? null,
                openRequests: Math.max(openRequestsFor(requests, g.artist_id), st.openRequests || 0),
                scope: g.scope || ['view'],
              })
              return (
                <div key={g.grant_id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface2 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{g.artist_stage_name || '—'}</p>
                    {g.artist_city && <p className="truncate text-[11px] text-muted">{g.artist_city}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <div className="hidden items-center gap-1 sm:flex">
                      {(g.scope || []).map((s) => (
                        <span key={s} className="chip bg-na-bg text-[9px] uppercase tracking-[0.06em] text-muted">{s}</span>
                      ))}
                    </div>
                    {/* the ONE next action — real state only, bound to THIS artist */}
                    <NextActionChip action={action} T={T} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* first-run checklist — dismissible, non-shaming */}
      {!hideChecklist && (
        <div className="card mb-4 border border-line">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-ink text-sm">{T.org.checklistTitle}</p>
            <button className="tap-target text-xs text-muted" onClick={() => { try { localStorage.setItem('gigproof_hide_checklist', '1') } catch { /* ignore */ } setHideChecklist(true) }}>{T.org.checklistDismiss}</button>
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
                  // G4 (A5): ONE commercial next action from THIS artist's real
                  // state (listAgencyArtists now carries bounded profile_items).
                  // Owned row → no grant, nothing scope-gated (scope: null).
                  const action = pickRosterAction({
                    artistId: a.id,
                    published: !!a.published,
                    items: a.profile_items ?? null,
                    openRequests: openRequestsFor(requests, a.id),
                    scope: null,
                  })
                  return (
                    <div key={a.id}
                      className={`card flex items-center justify-between gap-3 transition hover:border-accent ${a.id === justAddedId ? 'border-accent ring-1 ring-accent animate-fade-in' : ''}`}>
                      <Link to={`/passport/${a.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                        {a.photo_url ? <img src={a.photo_url} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                          : <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface2 font-display text-lg text-ink">{(a.stage_name || '?').slice(0, 1)}</div>}
                        <div className="min-w-0">
                          <p className="truncate font-bold text-ink">{a.stage_name || T.agency.noName}</p>
                          <p className="line-clamp-2 whitespace-normal break-words text-xs text-muted leading-snug">{a.genre || '—'} · {a.published ? T.agency.publishedTag : T.agency.draftTag}</p>
                          {fresh && <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-faint">{T.agency.updatedOn(fresh)}</p>}
                        </div>
                      </Link>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <StatusChip status={rosterStatus(a)} />
                        <NextActionChip action={action} T={T} />
                      </div>
                    </div>
                  )
                })}
              </div>
              {adding ? (
                <div className="card">
                  {/* mode toggle — invite (canon-correct, artist keeps their own
                      account + approval control) vs. legacy owned placeholder */}
                  <div className="mb-3 flex gap-1 rounded-full border border-line bg-surface2 p-1">
                    <button type="button"
                      className={`flex min-h-[44px] flex-1 items-center justify-center rounded-full py-1.5 text-xs font-semibold transition ${addMode === 'invite' ? 'bg-accent text-[#12160A]' : 'text-muted'}`}
                      onClick={() => setAddMode('invite')}>{T.agency.inviteTabInvite}</button>
                    <button type="button"
                      className={`flex min-h-[44px] flex-1 items-center justify-center rounded-full py-1.5 text-xs font-semibold transition ${addMode === 'own' ? 'bg-accent text-[#12160A]' : 'text-muted'}`}
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
                            <label key={s} className="tap-target flex items-center gap-1.5 rounded-full border border-line bg-surface2 px-2.5 py-1 text-xs text-ink">
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
