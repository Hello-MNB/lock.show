import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrg } from '../../context/OrgContext.jsx'
import { getMembers, getSubscription, inviteMember, changeMemberRole, removeMember, transferOwnership, resendInvite } from '../../lib/orgs.js'
import { PageShell, Wordmark, Field, Spinner, ErrorNote, Loading, BottomSheet, useToast } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

const roleLabel = (r, T) => ({ owner: T.org.roleOwner, admin: T.org.roleAdmin, member: T.org.roleMember }[r] || r)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// O2 — Team. Sheet-based multi-invite with optimistic rows, role legend, soft seat
// cap → upsell (never a hard error), last-owner protection. owner/admin only.
export default function Members() {
  const { T } = useLang()
  const toast = useToast()
  const { activeOrgId, isAdmin, isOwner, reload } = useOrg()
  const [members, setMembers] = useState([])
  const [sub, setSub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [permsOpen, setPermsOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [emails, setEmails] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviteErr, setInviteErr] = useState('')

  async function load() {
    if (!activeOrgId) { setLoading(false); return }
    try { setMembers(await getMembers(activeOrgId)); setSub(await getSubscription(activeOrgId)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [activeOrgId])

  const seatsUsed = sub?.seats_used ?? members.filter((m) => ['active', 'invited'].includes(m.status)).length
  const seatsTotal = sub?.seats_included ?? 1
  const full = seatsUsed >= seatsTotal
  const ownersCount = members.filter((m) => m.org_role === 'owner' && m.status === 'active').length
  const activeCount = members.filter((m) => m.status === 'active').length
  const lanes = Math.max(seatsTotal, seatsUsed, 1)

  async function sendInvites() {
    setInviteErr('')
    const list = emails.split(/[,\n]/).map((e) => e.trim().toLowerCase()).filter(Boolean)
    if (!list.length) return
    for (const e of list) {
      if (!EMAIL_RE.test(e)) { setInviteErr(`${T.org.errInvalidEmail}: ${e}`); return }
      if (members.some((m) => m.invited_email === e || m.person?.email === e)) { setInviteErr(`${T.org.errAlreadyMember}: ${e}`); return }
    }
    setBusy(true)
    const optimistic = list.map((e, i) => ({ id: `pending-${i}-${e}`, org_role: inviteRole, status: 'invited', invited_email: e, person: null, _optimistic: true }))
    setMembers((prev) => [...prev, ...optimistic])
    try {
      for (const e of list) await inviteMember(activeOrgId, e, inviteRole)
      toast.show(T.org.toastInviteSent)
      setEmails(''); setInviteOpen(false)
      await load()
    } catch (err) {
      setMembers((prev) => prev.filter((m) => !m._optimistic))
      setInviteErr(String(err.message).includes('SEAT_LIMIT') ? T.org.seatCapSoft : (err.message || T.common.error))
    } finally { setBusy(false) }
  }

  async function setRole(m, role) {
    if (m.org_role === 'owner' && role !== 'owner' && ownersCount <= 1) { toast.show(T.org.lastOwnerProtected, 'warn'); return }
    setBusy(true)
    try {
      if (role === 'owner') await transferOwnership(activeOrgId, m.person.id)
      else await changeMemberRole(m.id, role)
      await load(); await reload()
    } finally { setBusy(false) }
  }

  async function doRemove() {
    const m = removeTarget
    if (!m) return
    if (m.org_role === 'owner' && m.status === 'active' && ownersCount <= 1) { toast.show(T.org.lastOwnerProtected, 'warn'); setRemoveTarget(null); return }
    setBusy(true)
    try { await removeMember(m.id); await load() } finally { setBusy(false); setRemoveTarget(null) }
  }

  async function resend(m) { await resendInvite(m.id); toast.show(T.org.toastInviteResent) }

  if (loading) return <Loading />

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6"><Wordmark /><Link to="/" className="text-sm text-muted hover:text-ink">{T.common.back}</Link></div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-xl font-bold text-ink">{T.org.membersTitle}</h1>
        <button onClick={() => setPermsOpen(true)} aria-label={T.org.permsTitle} className="text-muted hover:text-ink text-sm border border-line rounded-full w-7 h-7 min-h-[36px] min-w-[36px] transition">?</button>
      </div>
      <p className="text-sm text-muted mb-3">{T.org.seatsInUse(seatsUsed, seatsTotal)}</p>

      {/* seat strip */}
      <div className="card mb-4">
        <div className="flex gap-1.5">
          {Array.from({ length: lanes }).map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded ${i < seatsUsed ? 'bg-accent' : 'bg-surface2'}`} />
          ))}
        </div>
      </div>

      {/* team-of-1 nudge */}
      {activeCount <= 1 && !members.some((m) => m.status === 'invited') && (
        <div className="card mb-4 border border-line text-center">
          <p className="text-sm text-ink mb-3">{T.org.teamOfOne}</p>
          {isAdmin && <button className="btn-primary w-full" onClick={() => { setInviteErr(''); setInviteOpen(true) }}>{T.org.invite}</button>}
        </div>
      )}

      {/* members list */}
      <div className="space-y-2 mb-4">
        {members.map((m) => (
          <div key={m.id} className={`card ${m._optimistic ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-ink text-sm font-medium truncate">{m.person?.display_name || m.person?.email || m.invited_email}</p>
                <p className="text-xs text-muted">{roleLabel(m.org_role, T)} · {m.status === 'invited' ? T.org.invitedRow : T.org.statusActive}</p>
              </div>
              {isAdmin && (
                <div className="flex gap-1 shrink-0">
                  {m.status === 'invited' ? (
                    <>
                      <button className="chip border border-line bg-surface2 text-xs text-ink min-h-[36px] px-2" onClick={() => resend(m)} disabled={busy || m._optimistic}>{T.org.resend}</button>
                      <button className="chip border border-line bg-surface2 text-xs text-amber min-h-[36px] px-2" onClick={() => setRemoveTarget(m)} disabled={busy || m._optimistic}>{T.org.cancelInvite}</button>
                    </>
                  ) : m.org_role !== 'owner' && (
                    <>
                      {isOwner && m.person && <button className="chip border border-line bg-surface2 text-xs text-ink min-h-[36px] px-2" onClick={() => setRole(m, 'owner')} disabled={busy}>{T.org.roleOwner}</button>}
                      <button className="chip border border-line bg-surface2 text-xs text-ink min-h-[36px] px-2" onClick={() => setRole(m, m.org_role === 'admin' ? 'member' : 'admin')} disabled={busy}>{T.org.changeRole}</button>
                      <button className="chip border border-line bg-surface2 text-xs text-amber min-h-[36px] px-2" onClick={() => setRemoveTarget(m)} disabled={busy}>{T.org.removeMember}</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* primary CTA: invite */}
      {isAdmin && <button className="btn-primary w-full" onClick={() => { setInviteErr(''); setInviteOpen(true) }}>{T.org.invite}</button>}

      {/* invite sheet — soft-blocks on seat cap (never a hard error) */}
      <BottomSheet open={inviteOpen} onClose={() => setInviteOpen(false)} title={T.org.inviteSheetTitle}>
        {full ? (
          <div>
            <p className="text-sm text-amber mb-3">{T.org.seatCapSoft}</p>
            {isOwner
              ? <Link to="/org/billing" className="btn-primary w-full block text-center">{T.org.addSeats}</Link>
              : <p className="text-xs text-muted">{T.org.contactOwner}</p>}
          </div>
        ) : (
          <>
            {inviteErr && <ErrorNote>{inviteErr}</ErrorNote>}
            <Field label={T.org.inviteEmailsLabel}>
              <textarea className="field" dir="ltr" rows={2} value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="dj@example.com, …" />
            </Field>
            <Field label={T.org.inviteRoleLabel}>
              <select className="field" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="member">{T.org.roleMember}</option>
                <option value="admin">{T.org.roleAdmin}</option>
              </select>
            </Field>
            <button className="btn-primary w-full mt-1" onClick={sendInvites} disabled={busy || !emails.trim()}>{busy ? <Spinner /> : T.org.inviteSend}</button>
          </>
        )}
      </BottomSheet>

      {/* permissions legend */}
      <BottomSheet open={permsOpen} onClose={() => setPermsOpen(false)} title={T.org.permsTitle}>
        <ul className="space-y-2 text-sm text-ink">
          <li><span className="font-bold">{T.org.roleOwner}</span> — {T.org.permsOwner.split('—')[1]?.trim() || T.org.permsOwner}</li>
          <li><span className="font-bold">{T.org.roleAdmin}</span> — {T.org.permsAdmin.split('—')[1]?.trim() || T.org.permsAdmin}</li>
          <li><span className="font-bold">{T.org.roleMember}</span> — {T.org.permsMember.split('—')[1]?.trim() || T.org.permsMember}</li>
        </ul>
      </BottomSheet>

      {/* remove / cancel confirm */}
      <BottomSheet open={!!removeTarget} onClose={() => setRemoveTarget(null)} title={removeTarget?.status === 'invited' ? T.org.cancelInvite : T.org.removeMember}>
        <p className="text-sm text-ink mb-4">{T.org.removeConfirmName(removeTarget?.person?.display_name || removeTarget?.person?.email || removeTarget?.invited_email || '')}</p>
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={doRemove} disabled={busy}>{busy ? <Spinner /> : T.org.removeMember}</button>
          <button className="btn-ghost" onClick={() => setRemoveTarget(null)} disabled={busy}>{T.common.cancel}</button>
        </div>
      </BottomSheet>
    </PageShell>
  )
}
