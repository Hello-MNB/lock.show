import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useOrg } from '../../context/OrgContext.jsx'
import { getOrg, updateOrg, deleteOrg, getMembers, transferOwnership } from '../../lib/orgs.js'
import { PageShell, Wordmark, Field, Spinner, ErrorNote, Loading, BottomSheet, useToast } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

const planLabel = (plan, T) => ({ solo: T.org.planSolo, agency: T.org.planAgency, agency_plus: T.org.planAgencyPlus }[plan] || plan)

// O1 — Settings. Title is plan-aware ("הגדרות הסוכנות" / "הגדרות החשבון" — never
// "ארגון"). admin edits name; owner-only 2-step transfer + audited delete.
export default function OrgSettings() {
  const { T } = useLang()
  const toast = useToast()
  const nav = useNavigate()
  const { signOut } = useAuth()
  const { activeOrgId, isOwner, isAdmin, isAgency, reload } = useOrg()
  const [org, setOrg] = useState(null)
  const [name, setName] = useState('')
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [transferOpen, setTransferOpen] = useState(false)
  const [transferTo, setTransferTo] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [reason, setReason] = useState('')

  useEffect(() => { (async () => {
    if (!activeOrgId) { setLoading(false); return }
    try {
      const o = await getOrg(activeOrgId); setOrg(o); setName(o?.name || '')
      if (isOwner) setMembers(await getMembers(activeOrgId))
    } finally { setLoading(false) }
  })() }, [activeOrgId, isOwner])

  async function save() {
    setBusy(true); setError('')
    try { await updateOrg(activeOrgId, { name }); await reload(); toast.show(T.org.savedToast) }
    catch (e) { setError(e.message || T.common.error) } finally { setBusy(false) }
  }
  async function doTransfer() {
    if (!transferTo) return
    setBusy(true)
    try { await transferOwnership(activeOrgId, transferTo.person.id); setTransferOpen(false); setTransferTo(null); await reload() }
    catch (e) { setError(e.message || T.common.error) } finally { setBusy(false) }
  }
  async function doDelete() {
    setBusy(true); setError('')
    try {
      await deleteOrg(activeOrgId)
      // the org is gone — end the session properly instead of leaving a stale one
      try { await signOut() } catch { /* session already invalid */ }
      nav('/login')
    } catch (e) { setError(e.message || T.common.error); setBusy(false) }
  }

  if (loading) return <Loading />
  const entity = isAgency ? T.org.entityAgency : T.org.entitySolo
  const transferable = members.filter((m) => m.status === 'active' && m.org_role !== 'owner' && m.person)

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6"><Wordmark /><Link to="/" className="text-sm text-muted hover:text-ink">{T.common.back}</Link></div>
      <h1 className="font-display text-xl font-bold text-ink mb-4">{isAgency ? T.org.settingsTitleAgency : T.org.settingsTitleSolo}</h1>
      <ErrorNote>{error}</ErrorNote>

      <div className="card mb-4">
        <Field label={T.org.nameLabel}>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} disabled={!isAdmin} />
        </Field>
        <div className="flex flex-wrap gap-2 text-xs text-muted mt-2">
          <span className="chip border border-line bg-surface2 font-mono text-[11px] text-ink">{T.org.planLabel}: {planLabel(org?.plan, T)}</span>
          {org?.slug && <span className="chip border border-line bg-surface2 font-mono text-[11px] text-ink">{T.org.slugLabel}: {org.slug}</span>}
          {org?.created_at && <span className="chip border border-line bg-surface2 font-mono text-[11px] text-ink">{T.org.createdLabel}: {new Date(org.created_at).toLocaleDateString()}</span>}
        </div>
        {isAdmin && <button className="btn-primary w-full mt-4" onClick={save} disabled={busy}>{busy ? <Spinner /> : T.org.save}</button>}
      </div>

      {/* owner-only zone */}
      <div className="card border border-amber/40">
        {isOwner ? (
          <>
            <button className="btn-ghost w-full mb-2" onClick={() => transferable.length ? setTransferOpen(true) : toast.show(T.org.transferNoMembers, 'warn')}>{T.org.transferOwnership}</button>
            {!confirmDelete ? (
              <button className="btn-ghost w-full text-amber" onClick={() => setConfirmDelete(true)}>{T.org.deleteOrg}</button>
            ) : (
              <div>
                <p className="text-sm text-amber mb-2">{T.org.deleteConfirm}</p>
                <input className="field mb-2" placeholder={T.org.deleteReason} value={reason} onChange={(e) => setReason(e.target.value)} />
                <div className="flex gap-2">
                  <button className="btn-primary flex-1" onClick={doDelete} disabled={busy || !reason.trim()}>{T.org.deleteOrg}</button>
                  <button className="btn-ghost" onClick={() => setConfirmDelete(false)}>{T.common.cancel}</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-muted">{T.org.adminCantDelete}</p>
        )}
      </div>

      {/* 2-step ownership transfer (never leaves the org ownerless) */}
      <BottomSheet open={transferOpen} onClose={() => { setTransferOpen(false); setTransferTo(null) }} title={T.org.transferTitle}>
        {!transferTo ? (
          <>
            <p className="text-sm text-muted mb-3">{T.org.transferPick}</p>
            <div className="space-y-2">
              {transferable.map((m) => (
                <button key={m.id} className="card w-full text-start hover:border-accent" onClick={() => setTransferTo(m)}>
                  <p className="text-ink text-sm font-medium">{m.person?.display_name || m.person?.email}</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-ink mb-4">{T.org.transferConfirm(transferTo.person?.display_name || transferTo.person?.email)}</p>
            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={doTransfer} disabled={busy}>{busy ? <Spinner /> : T.org.transferCta}</button>
              <button className="btn-ghost" onClick={() => setTransferTo(null)} disabled={busy}>{T.common.back}</button>
            </div>
          </>
        )}
      </BottomSheet>
    </PageShell>
  )
}
