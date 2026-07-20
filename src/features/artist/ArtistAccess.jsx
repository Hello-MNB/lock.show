import { useEffect, useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { getMyArtist } from '../../lib/db.js'
import { listIncomingAccessRequests, respondToAccessRequest, revokeArtistAccess, inviteArtistRepresentative } from '../../lib/orgs.js'
import { appUrl } from '../../lib/appUrl.js'
import { Spinner, ErrorState, BottomSheet, useToast } from '../../components/ui.jsx'

// ── Artist Access — "Who can act for you" (spec §8.5, `/artist/access`, U31).
// Surfaces the ArtistAccess grant: the artist grants a trusted manager/
// representative scoped, revocable help — never the account, never
// ownership (the FIREWALL/entity law this whole screen exists to honor).
//
// REAL DATA, HONEST GAPS (backfill — ratify:R00, see task report): every row
// here reads/writes the SAME `artist_access` table + RPCs the Settings.jsx
// "Representation" accordion already uses in production
// (listIncomingAccessRequests / respondToAccessRequest / revokeArtistAccess,
// migrations 008/027/030) — this screen is a dedicated, full-fidelity surface
// for the SAME data, reachable on its own route per the spec's nav ask,
// not a fork of it. The one spec ask with NO backend yet is the artist
// INITIATING an invite (today only an org can request access; the artist
// approves/declines/revokes/edits scope — see orgs.js inviteArtistRepresentative's
// comment). The "Invite someone" flow below is honest about that: it offers
// the Passport-link path that already works end-to-end today, and attempts
// the direct-invite RPC only as a forward-compatible stub that fails soft.

const ALL_SCOPES = ['view', 'upload', 'edit', 'share', 'publish']
const scopeWord = (T, s) => T.access[`scope${s.charAt(0).toUpperCase()}${s.slice(1)}`] || s

function fmtDate(iso) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) }
  catch { return '' }
}

function StatePill({ status, T }) {
  const a = T.artistAccess
  const cls = status === 'active' ? 'border-accent/40 bg-accent/10 text-accent'
    : status === 'pending' ? 'border-gold/40 bg-gold/10 text-gold'
      : 'border-line2 bg-surface2 text-faint'
  const label = status === 'active' ? a.activePill : status === 'pending' ? a.pendingPill : a.endedPill
  return <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${cls}`}>{label}</span>
}

// ── One rep card — org identity, state pill, scope pills (active only),
// actions per state. Every state reads as a human sentence, never a raw
// DB status word (§8.5 DEFINITION OF DONE: "grants readable as human
// sentences").
function RepCard({ r, T, busy, onApprove, onDecline, onChangeScopes, onEnd, undoTarget, onUndo }) {
  const a = T.artistAccess
  const isUndoing = undoTarget === r.id

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold text-ink">{r.organization_name || a.unknownOrg}</p>
          <p className="mt-0.5 text-xs text-muted">
            {isUndoing ? a.endedNote
              : r.status === 'active' ? a.since(fmtDate(r.consent_at))
                : r.status === 'pending' ? a.wantsAccess
                  : a.endedNote}
          </p>
        </div>
        <StatePill status={isUndoing ? 'revoked' : r.status} T={T} />
      </div>

      {r.status === 'active' && !isUndoing && (r.scope || []).length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {(r.scope || []).map((s) => (
            <span key={s} className="chip border border-line bg-surface2 px-2 py-0.5 text-[10px] text-ink">{scopeWord(T, s)}</span>
          ))}
        </div>
      )}

      {isUndoing ? (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-line bg-surface2 px-3 py-2">
          <p className="text-xs text-muted">{a.endedToast(r.organization_name)}</p>
          <button type="button" className="tap-target shrink-0 font-mono text-[11px] font-bold uppercase tracking-[0.07em] text-accent hover:underline" onClick={() => onUndo(r)}>
            {a.undo}
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {r.status === 'pending' && (
            <>
              <button type="button" className="btn-primary min-h-[40px] px-3 py-1.5 text-xs" disabled={busy === r.id} onClick={() => onApprove(r)}>
                {busy === r.id ? <Spinner /> : a.approve}
              </button>
              <button type="button" className="btn-ghost min-h-[40px] px-3 py-1.5 text-xs" disabled={busy === r.id} onClick={() => onDecline(r)}>
                {a.decline}
              </button>
            </>
          )}
          {r.status === 'active' && (
            <>
              <button type="button" className="btn-ghost min-h-[40px] px-3 py-1.5 text-xs" disabled={busy === r.id} onClick={() => onChangeScopes(r)}>
                {a.changeScopes}
              </button>
              <button type="button" className="min-h-[40px] rounded-full border border-amber/40 bg-amber/10 px-3 py-1.5 text-xs text-amber transition hover:bg-amber/20" disabled={busy === r.id} onClick={() => onEnd(r)}>
                {a.endAccess}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Invite someone (§8.5 primary CTA). Honest split: the Passport-link path
// works today end-to-end (an org that requests access on that link shows up
// in the list below for the artist to approve); the direct-email path is a
// forward-compatible stub (inviteArtistRepresentative) that fails soft with
// an honest "not available yet" note rather than a fake success.
function InviteSheet({ open, onClose, T, artist, toast }) {
  const a = T.artistAccess
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const link = artist ? appUrl(`/passport/${artist.id}`) : ''
  const copiedTimer = useRef(null)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      clearTimeout(copiedTimer.current)
      copiedTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked — link stays visible/selectable below */ }
  }

  async function sendInvite(e) {
    e.preventDefault()
    const clean = email.trim()
    if (!clean || !artist?.id) return
    setSending(true)
    try {
      const res = await inviteArtistRepresentative(artist.id, clean, ['view'])
      if (res?.ok === false) toast.show(a.inviteComingSoon, 'warn')
      else { toast.show(a.inviteSent(clean), 'ok'); setEmail(''); onClose() }
    } finally { setSending(false) }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={a.inviteTitle}>
      <p className="mb-3 text-sm text-ink">{a.inviteBody}</p>
      <button type="button" className="btn-ghost w-full text-sm" onClick={copyLink}>
        {copied ? `✓ ${a.inviteLinkCopied}` : a.inviteCopyLink}
      </button>
      <p className="mt-1.5 break-all text-center font-mono text-[10px] text-faint" dir="ltr">{link}</p>

      <div className="mt-4 border-t border-line pt-4">
        <p className="mb-2 text-xs font-semibold text-muted">{a.inviteEmailLabel}</p>
        <form onSubmit={sendInvite} className="flex gap-2">
          {/* Example email format, not translatable content — same precedent
              as the WhatsApp number placeholder in Settings.jsx (a literal in
              the component, not routed through i18n). */}
          <input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="their@email.com" className="field min-w-0 flex-1" />
          <button type="submit" className="btn-primary shrink-0 px-3 py-1.5 text-xs" disabled={sending || !email.trim()}>
            {sending ? <Spinner /> : a.inviteEmailSubmit}
          </button>
        </form>
      </div>
    </BottomSheet>
  )
}

export default function ArtistAccess() {
  const { user } = useAuth()
  const { T } = useLang()
  const a = T.artistAccess
  const toast = useToast()

  const [artist, setArtist] = useState(null)
  const [requests, setRequests] = useState(null) // null = loading
  const [loadErr, setLoadErr] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [approveTarget, setApproveTarget] = useState(null) // pending row being approved
  const [scopeTarget, setScopeTarget] = useState(null) // active row having scopes changed
  const [draftScope, setDraftScope] = useState({})
  const [inviteOpen, setInviteOpen] = useState(false)
  const [undoTarget, setUndoTarget] = useState(null) // { row, prevScope } briefly shown post-end
  const undoTimer = useRef(null)

  async function load() {
    try {
      const [art, reqs] = await Promise.all([getMyArtist(user.id), listIncomingAccessRequests()])
      setArtist(art || null)
      setRequests(reqs || [])
    } catch (e) { setLoadErr(e.message || T.common.error) }
  }
  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(undoTimer.current), [])

  const sorted = useMemo(() => {
    if (!requests) return []
    const order = { pending: 0, active: 1, revoked: 2, disputed: 2 }
    return [...requests].sort((x, y) => (order[x.status] ?? 3) - (order[y.status] ?? 3))
  }, [requests])

  function openApprove(r) {
    setDraftScope(Object.fromEntries(ALL_SCOPES.map((s) => [s, (r.scope || ['view']).includes(s)])))
    setApproveTarget(r)
  }
  function openChangeScopes(r) {
    setDraftScope(Object.fromEntries(ALL_SCOPES.map((s) => [s, (r.scope || ['view']).includes(s)])))
    setScopeTarget(r)
  }

  async function confirmApprove() {
    if (!approveTarget) return
    setBusyId(approveTarget.id)
    try {
      const scope = ALL_SCOPES.filter((s) => draftScope[s])
      const res = await respondToAccessRequest(approveTarget.id, true, scope.length ? scope : ['view'])
      if (res?.ok === false) toast.show(T.representation.migrationNote, 'warn')
      setApproveTarget(null)
      await load()
    } finally { setBusyId(null) }
  }

  async function decline(r) {
    setBusyId(r.id)
    try {
      const res = await respondToAccessRequest(r.id, false)
      if (res?.ok === false) toast.show(T.representation.migrationNote, 'warn')
      await load()
    } finally { setBusyId(null) }
  }

  async function saveScopes() {
    if (!scopeTarget) return
    setBusyId(scopeTarget.id)
    try {
      const scope = ALL_SCOPES.filter((s) => draftScope[s])
      const res = await respondToAccessRequest(scopeTarget.id, true, scope.length ? scope : ['view'])
      if (res?.ok === false) toast.show(T.representation.migrationNote, 'warn')
      setScopeTarget(null)
      await load()
    } finally { setBusyId(null) }
  }

  // End-access ceremony (§8.5 DoD: "revoke ceremony with confirm+undo
  // pattern"). Confirm happens inline on the card (no native window.confirm —
  // a warm ceremony, not a browser dialog); the actual revoke call fires
  // immediately (so a real refresh/second device sees it end right away), but
  // the card shows a 7s "Undo" that re-approves with the SAME prior scope —
  // safe because respond_to_access_request (the RPC behind
  // respondToAccessRequest) sets status regardless of the row's prior state.
  async function endAccess(r) {
    setBusyId(r.id)
    try {
      const res = await revokeArtistAccess(r.id)
      if (res?.ok === false) { toast.show(T.representation.migrationNote, 'warn'); return }
      setUndoTarget(r.id)
      clearTimeout(undoTimer.current)
      undoTimer.current = setTimeout(() => setUndoTarget(null), 7000)
      await load()
    } finally { setBusyId(null) }
  }

  async function undoEnd(r) {
    clearTimeout(undoTimer.current)
    setUndoTarget(null)
    setBusyId(r.id)
    try {
      const scope = (r.scope || ['view'])
      await respondToAccessRequest(r.id, true, scope)
      await load()
    } finally { setBusyId(null) }
  }

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] flex-col overflow-hidden px-4 pt-3 sm:px-8 md:h-[calc(100dvh-3.5rem)] md:pt-5">
      <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col animate-fade-in">
        <div className="shrink-0">
          <div className="flex items-center justify-between gap-3">
            <Link to="/artist/home" className="inline-flex min-h-[44px] items-center font-mono text-[11px] uppercase tracking-[0.07em] text-muted hover:text-ink">← {a.back}</Link>
          </div>
          <h1 className="mt-1 font-display text-2xl text-ink">{a.title}</h1>
          <p className="mt-1 text-sm text-muted">{a.subtitle}</p>
          <button type="button" className="btn-primary mt-3 w-full sm:w-auto" onClick={() => setInviteOpen(true)}>
            {a.inviteCta}
          </button>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pb-4">
          {loadErr ? (
            <ErrorState title={loadErr} onRetry={load} />
          ) : requests === null ? (
            <div className="mt-10 flex justify-center"><Spinner /></div>
          ) : sorted.length === 0 ? (
            <div className="card text-center">
              <p className="font-semibold text-ink">{a.emptyTitle}</p>
              <p className="mt-1 text-sm text-muted">{a.emptyBody}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((r) => (
                <RepCard key={r.id} r={r} T={T} busy={busyId}
                  onApprove={openApprove} onDecline={decline}
                  onChangeScopes={openChangeScopes} onEnd={endAccess}
                  undoTarget={undoTarget} onUndo={undoEnd} />
              ))}
            </div>
          )}
        </div>
      </div>

      <InviteSheet open={inviteOpen} onClose={() => setInviteOpen(false)} T={T} artist={artist} toast={toast} />

      <BottomSheet open={!!approveTarget} onClose={() => setApproveTarget(null)} title={a.approveTitle}>
        <p className="mb-3 text-sm text-ink">{approveTarget && T.representation.wantsAccess(approveTarget.organization_name)}</p>
        <p className="mb-2 text-xs text-muted">{a.approveScopeHint}</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {ALL_SCOPES.map((s) => (
            <label key={s} className="flex items-center gap-1.5 rounded-full border border-line bg-surface2 px-2.5 py-1 text-xs text-ink">
              <input type="checkbox" checked={!!draftScope[s]} onChange={(e) => setDraftScope({ ...draftScope, [s]: e.target.checked })} />
              {scopeWord(T, s)}
            </label>
          ))}
        </div>
        {draftScope.publish && <p className="mb-3 text-xs text-muted">{T.access.publishHint}</p>}
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={confirmApprove} disabled={busyId === approveTarget?.id}>
            {busyId === approveTarget?.id ? <Spinner /> : a.approveCta}
          </button>
          <button className="btn-ghost" onClick={() => setApproveTarget(null)}>{T.common.cancel}</button>
        </div>
      </BottomSheet>

      <BottomSheet open={!!scopeTarget} onClose={() => setScopeTarget(null)} title={a.changeScopes}>
        <p className="mb-3 text-sm text-ink">{scopeTarget?.organization_name}</p>
        <p className="mb-2 text-xs text-muted">{a.approveScopeHint}</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {ALL_SCOPES.map((s) => (
            <label key={s} className="flex items-center gap-1.5 rounded-full border border-line bg-surface2 px-2.5 py-1 text-xs text-ink">
              <input type="checkbox" checked={!!draftScope[s]} onChange={(e) => setDraftScope({ ...draftScope, [s]: e.target.checked })} />
              {scopeWord(T, s)}
            </label>
          ))}
        </div>
        {draftScope.publish && <p className="mb-3 text-xs text-muted">{T.access.publishHint}</p>}
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={saveScopes} disabled={busyId === scopeTarget?.id}>
            {busyId === scopeTarget?.id ? <Spinner /> : a.saveScopes}
          </button>
          <button className="btn-ghost" onClick={() => setScopeTarget(null)}>{T.common.cancel}</button>
        </div>
      </BottomSheet>
    </div>
  )
}
