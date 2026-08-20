import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { authHeaders, listClaimsByArtists, listRequestsForArtists } from '../../lib/db.js'
import { requestArtistAccess, listOutgoingAccessRequests, revokeArtistAccess, listRosterGrants } from '../../lib/orgs.js'
import { createRosterInvitation } from '../../lib/rosterInvites.js'
import { pickRosterAction, fetchGrantArtistState } from './rosterNextAction.js'
import AgencyRadarUniverse from './AgencyRadarUniverse.jsx'
import { PageShell, Loading, ErrorState, StatusChip, Field, Spinner, useToast } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { useOrg } from '../../context/OrgContext.jsx'
import { STATUS } from '../../lib/constants.js'
import { DEMO } from '../../lib/demo.js'
import { loadRepresentationWorkspace } from './representationWorkspace.js'

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
  const { activeOrgId, memberships } = useOrg()
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
  const [adding, setAdding] = useState(false)
  const [addMode, setAddMode] = useState('invite') // existing LOCK artist | not-yet-registered artist
  const [inviteInput, setInviteInput] = useState('')
  const [newInvite, setNewInvite] = useState({ artistName: '', email: '' })
  const [inviteReceipt, setInviteReceipt] = useState(null)
  const [inviteTerritory, setInviteTerritory] = useState('')
  const [inviteScope, setInviteScope] = useState(() => Object.fromEntries(OPTIONAL_SCOPES.map((s) => [s, false])))
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState('')
  const loadEpoch = useRef(0)

  async function load(targetOrgId = orgIdForThisScreen) {
    const epoch = ++loadEpoch.current
    setLoading(true)
    setError(false)
    setArtists([])
    setRosterClaims([])
    setRequests([])
    setAccessRequests([])
    if (!targetOrgId) {
      setError(true)
      setLoading(false)
      return
    }
    try {
      let outgoing = []
      try { outgoing = await listOutgoingAccessRequests(targetOrgId) } catch { outgoing = [] }
      try {
        const roster = await loadRepresentationWorkspace({
          organizationId: targetOrgId,
          listRosterGrants,
          fetchGrantArtistState,
          listClaimsByArtists,
          listRequestsForArtists,
        })
        if (!roster.available) throw new Error('consented roster unavailable')
        if (epoch !== loadEpoch.current) return
        setAccessRequests(outgoing)
        setArtists(roster.artists)
        setRosterClaims(roster.claims)
        setRequests(roster.requests)
      } catch {
        if (epoch === loadEpoch.current) setError(true)
      }
    } catch {
      if (epoch === loadEpoch.current) setError(true)
    } finally {
      if (epoch === loadEpoch.current) setLoading(false)
    }
  }
  useEffect(() => {
    load(orgIdForThisScreen)
    return () => { loadEpoch.current += 1 }
  }, [orgIdForThisScreen])

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

  async function sendNewArtistInvite(e) {
    e.preventDefault()
    if (!newInvite.artistName.trim() || !newInvite.email.trim() || !orgIdForThisScreen) return
    setSaveError(''); setBusy(true); setInviteReceipt(null)
    try {
      const scope = ['view', ...OPTIONAL_SCOPES.filter((s) => inviteScope[s])]
      const result = await createRosterInvitation({
        organizationId: orgIdForThisScreen,
        artistName: newInvite.artistName.trim(),
        email: newInvite.email.trim(),
        scope,
        territory: inviteTerritory.trim() || null,
      }, await authHeaders())
      setInviteReceipt(result)
      setNewInvite({ artistName: '', email: '' })
      toast.show(result.delivery === 'sent' ? T.agency.inviteDelivered : T.agency.inviteLinkReady)
    } catch (error) {
      setSaveError(error.code === 'forbidden' ? T.agency.inviteForbidden : T.agency.saveError)
    } finally {
      setBusy(false)
    }
  }

  async function copyInviteLink() {
    if (!inviteReceipt?.inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteReceipt.inviteUrl)
      toast.show(T.agency.inviteCopied)
    } catch { setSaveError(T.agency.inviteCopyFailed) }
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

      {/* Pending/revoked ArtistAccess requests. Active grants appear exactly
          once in the roster below: access never becomes ownership. */}
      <AccessRequestsCard requests={accessRequests.filter((request) => request.status !== 'active')} T={T} onRevoked={load} />
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
                  // G4 (A5): ONE commercial next action from this consented
                  // ArtistAccess grant. Representation never implies ownership.
                  const action = pickRosterAction({
                    artistId: a.id,
                    published: !!a.published,
                    items: a.profile_items ?? null,
                    openRequests: openRequestsFor(requests, a.id),
                    scope: a.access_scope,
                  })
                  return (
                    <div key={a.id}
                      className="card flex items-center justify-between gap-3 transition hover:border-accent">
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
                  {/* Existing Artist by private Passport link, or a new Artist by
                      single-use invitation. Both require Artist consent. */}
                  <div className="mb-3 flex gap-1 rounded-full border border-line bg-surface2 p-1">
                    <button type="button"
                      className={`flex min-h-[44px] flex-1 items-center justify-center rounded-full py-1.5 text-xs font-semibold transition ${addMode === 'invite' ? 'bg-accent text-[#12160A]' : 'text-muted'}`}
                      onClick={() => { setAddMode('invite'); setInviteReceipt(null); setSaveError('') }}>{T.agency.inviteTabInvite}</button>
                    <button type="button"
                      className={`flex min-h-[44px] flex-1 items-center justify-center rounded-full py-1.5 text-xs font-semibold transition ${addMode === 'new' ? 'bg-accent text-[#12160A]' : 'text-muted'}`}
                      onClick={() => { setAddMode('new'); setInviteReceipt(null); setSaveError('') }}>{T.agency.inviteTabNew}</button>
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
                  ) : inviteReceipt ? (
                    <div className="rounded-2xl bg-surface2 p-4">
                      <p className="font-bold text-ink">{T.agency.inviteReadyTitle}</p>
                      <p className="mt-1 text-sm text-muted">{T.agency.inviteReadyBody}</p>
                      <div className="mt-3 flex gap-2">
                        <input className="field min-w-0 flex-1" dir="ltr" readOnly value={inviteReceipt.inviteUrl} aria-label={T.agency.inviteLinkLabel} />
                        <button type="button" className="btn-primary shrink-0" onClick={copyInviteLink}>{T.agency.inviteCopy}</button>
                      </div>
                      <button type="button" className="btn-ghost mt-3 w-full" onClick={() => setAdding(false)}>{T.common.back}</button>
                    </div>
                  ) : (
                    <form onSubmit={sendNewArtistInvite}>
                      <Field label={T.onboarding.stageName}>
                        <input className="field" value={newInvite.artistName} onChange={(e) => setNewInvite({ ...newInvite, artistName: e.target.value })} required />
                      </Field>
                      <Field label={T.agency.inviteEmailLabel}>
                        <input className="field" type="email" dir="ltr" autoComplete="email" value={newInvite.email} onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })} required />
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
                      </Field>
                      {saveError && <p className="text-xs text-amber mb-2">{saveError}</p>}
                      <div className="flex gap-2">
                        <button className="btn-primary flex-1" disabled={busy || !newInvite.artistName.trim() || !newInvite.email.trim()}>{busy ? <Spinner /> : T.agency.inviteCreateLink}</button>
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
