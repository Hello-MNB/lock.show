import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { upsertProfile, requestAccountDeletion, hasConsent, recordConsentScope } from '../../lib/db.js'
import { listIncomingAccessRequests, respondToAccessRequest, revokeArtistAccess } from '../../lib/orgs.js'
import { ROLES } from '../../lib/constants.js'
import { PageShell, Field, ErrorNote, LanguageToggle, BottomSheet, Spinner, useToast } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { useOrg } from '../../context/OrgContext.jsx'
import ContextSwitcher from '../org/ContextSwitcher.jsx'
import { logEvent, EVENTS } from '../../lib/analytics.js'

// The exact 5 canon scope values (DB-STRUCTURE.md Layer 1).
const ALL_SCOPES = ['view', 'upload', 'edit', 'share', 'publish']
const scopeWord = (T, s) => T.access[`scope${s.charAt(0).toUpperCase()}${s.slice(1)}`] || s

// ── Representation — "who wants access to me / who already has it"
// (REPRESENTATION-CANON §1.1/§1.5). Pending grants show ONLY the requesting
// org's identity + requested scope — nothing about the artist's own data is
// at stake here, since the artist hasn't approved anything yet.
function RepresentationSection({ T, toast }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [approveTarget, setApproveTarget] = useState(null)
  const [approveScope, setApproveScope] = useState({})

  async function load() {
    try { setRequests(await listIncomingAccessRequests()) } catch { setRequests([]) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function openApprove(r) {
    setApproveScope(Object.fromEntries(ALL_SCOPES.map((s) => [s, (r.scope || ['view']).includes(s)])))
    setApproveTarget(r)
  }

  async function confirmApprove() {
    if (!approveTarget) return
    setBusyId(approveTarget.id)
    try {
      const scope = ALL_SCOPES.filter((s) => approveScope[s])
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

  async function revoke(r) {
    if (!window.confirm(T.representation.revokeConfirm(r.organization_name))) return
    setBusyId(r.id)
    try {
      const res = await revokeArtistAccess(r.id)
      if (res?.ok === false) toast.show(T.representation.migrationNote, 'warn')
      await load()
    } finally { setBusyId(null) }
  }

  const pending = requests.filter((r) => r.status === 'pending')
  const active = requests.filter((r) => r.status === 'active')
  const revoked = requests.filter((r) => r.status === 'revoked' || r.status === 'disputed')

  return (
    <div className="card mb-3">
      <SectionHead className="mb-1">{T.representation.title}</SectionHead>
      <p className="mb-3 text-xs text-muted">{T.representation.subtitle}</p>
      {loading ? (
        <p className="text-xs text-muted">{T.common.loading}</p>
      ) : requests.length === 0 ? (
        <p className="text-xs text-muted">{T.representation.empty}</p>
      ) : (
        <div className="space-y-2">
          {[...pending, ...active, ...revoked].map((r) => (
            <div key={r.id} className="rounded-xl border border-line bg-surface2 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{r.organization_name}</p>
                  <p className="text-xs text-muted">
                    {r.status === 'pending' ? T.representation.wantsAccess(r.organization_name)
                      : r.status === 'active' ? T.representation.activeLabel
                        : T.representation.revokedLabel}
                  </p>
                </div>
                {r.status === 'pending' && (
                  <div className="flex shrink-0 gap-1">
                    <button className="chip border border-line bg-surface2 text-xs text-ink min-h-[36px] px-2"
                      onClick={() => openApprove(r)} disabled={busyId === r.id}>{T.representation.approve}</button>
                    <button className="chip border border-line bg-surface2 text-xs text-amber min-h-[36px] px-2"
                      onClick={() => decline(r)} disabled={busyId === r.id}>{busyId === r.id ? <Spinner /> : T.representation.decline}</button>
                  </div>
                )}
                {r.status === 'active' && (
                  <button className="chip border border-line bg-surface2 text-xs text-amber min-h-[36px] px-2"
                    onClick={() => revoke(r)} disabled={busyId === r.id}>{busyId === r.id ? <Spinner /> : T.representation.revoke}</button>
                )}
              </div>
              {r.status === 'active' && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {(r.scope || []).map((s) => (
                    <span key={s} className="chip border border-line text-[10px] text-ink">{scopeWord(T, s)}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <BottomSheet open={!!approveTarget} onClose={() => setApproveTarget(null)} title={T.representation.approveTitle}>
        <p className="mb-3 text-sm text-ink">{approveTarget && T.representation.wantsAccess(approveTarget.organization_name)}</p>
        <p className="mb-2 text-xs text-muted">{T.representation.approveScopeHint}</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {ALL_SCOPES.map((s) => (
            <label key={s} className="flex items-center gap-1.5 rounded-full border border-line bg-surface2 px-2.5 py-1 text-xs text-ink">
              <input type="checkbox" checked={!!approveScope[s]} onChange={(e) => setApproveScope({ ...approveScope, [s]: e.target.checked })} />
              {scopeWord(T, s)}
            </label>
          ))}
        </div>
        {approveScope.publish && <p className="mb-3 text-xs text-muted">{T.access.publishHint}</p>}
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={confirmApprove} disabled={busyId === approveTarget?.id}>
            {busyId === approveTarget?.id ? <Spinner /> : T.representation.approveCta}
          </button>
          <button className="btn-ghost" onClick={() => setApproveTarget(null)}>{T.common.cancel}</button>
        </div>
      </BottomSheet>
    </div>
  )
}

export default function Settings() {
  const { T, lang } = useLang()
  const { user, profile, role, signOut, reloadProfile } = useAuth()
  const { activeOrg, isAgency, isOwner } = useOrg()
  const nav = useNavigate()
  const toast = useToast()
  const [name, setName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteSubmitted, setDeleteSubmitted] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  // Marketing consent (4th, optional purpose) — moved here per canon; privacy +
  // processing fire inline at onboarding, publication fires at publish time.
  const [marketing, setMarketing] = useState(false)
  const [marketingLoaded, setMarketingLoaded] = useState(false)
  const [marketingBusy, setMarketingBusy] = useState(false)

  logEvent(EVENTS.SETTINGS_OPENED, { role })

  useEffect(() => {
    (async () => {
      try { setMarketing(await hasConsent(user.id, 'marketing')) } catch { /* default false */ }
      finally { setMarketingLoaded(true) }
    })()
  }, [user.id])

  async function toggleMarketing() {
    if (marketingBusy) return
    const next = !marketing
    setMarketingBusy(true)
    try {
      await recordConsentScope(user.id, 'marketing', { status: next ? 'accepted' : 'declined', marketing_opt_in: next })
      setMarketing(next)
    } catch (e) {
      setError(e.message || T.common.error)
    } finally {
      setMarketingBusy(false)
    }
  }

  async function saveProfile() {
    setSaving(true); setError(''); setSaved(false)
    try {
      await upsertProfile({ id: user.id, role, full_name: name.trim() || null })
      await reloadProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError(e.message || T.common.error)
    } finally { setSaving(false) }
  }

  async function handleDeleteAccount() {
    setDeleteBusy(true)
    try {
      await requestAccountDeletion(user.id)
      logEvent(EVENTS.DELETE_ACCOUNT_REQUESTED, { user_id: user.id })
      setDeleteSubmitted(true)
      setShowDeleteConfirm(false)
      setTimeout(async () => { await signOut(); nav('/login') }, 4000)
    } catch (e) {
      setError(e.message || T.common.error)
    } finally { setDeleteBusy(false) }
  }

  async function handleSignOut() {
    await signOut()
    nav('/login')
  }

  return (
    <PageShell max="max-w-md">
      <div className="mb-7 flex items-center justify-end">
        <Link to={role === ROLES.ARTIST ? '/artist/home' : role === ROLES.AGENCY ? '/agency' : '/'}
          className="text-sm text-muted transition hover:text-ink">
          {T.common.back}
        </Link>
      </div>
      <h1 className="mb-5 text-2xl font-bold text-ink">{T.settings.title}</h1>

      <ErrorNote>{error}</ErrorNote>
      {deleteSubmitted && (
        <div className="card mb-4 border-accent/30 bg-accent/10">
          <p className="text-sm text-accent">{T.settings.deleteSubmitted}</p>
        </div>
      )}

      {/* Profile */}
      <div className="card mb-3">
        <SectionHead>{T.settings.profile}</SectionHead>
        <Field label={T.settings.displayName}>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveProfile()} />
        </Field>
        <Field label={T.settings.email} hint={T.settings.emailReadOnly}>
          <input className="field opacity-60" value={user?.email || ''} readOnly />
        </Field>
        <button className="btn-primary w-full" onClick={saveProfile} disabled={saving}>
          {saving ? T.common.loading : saved ? T.settings.saved + ' ✓' : T.settings.save}
        </button>
      </div>

      {/* Organization (org-first account model) */}
      <div className="card mb-3">
        <div className="mb-3 flex items-center justify-between">
          <SectionHead className="mb-0 truncate">{activeOrg?.name || (isAgency ? T.org.entityAgency : T.org.entitySolo)}</SectionHead>
          <ContextSwitcher />
        </div>
        <div className="flex flex-col gap-2">
          <Link to="/org/settings" className="btn-ghost">{T.org.settingsTitle}</Link>
          <Link to="/org/members" className="btn-ghost">{T.org.membersTitle}</Link>
          {!isAgency && <Link to="/org/upgrade" className="btn-ghost">{T.org.upgradeTitle}</Link>}
          {isOwner && <Link to="/org/billing" className="btn-ghost">{T.org.billingTitle}</Link>}
          {isAgency && <Link to="/agency" className="btn-primary mt-1">{T.agency.title}</Link>}
        </div>
      </div>

      {/* Representation — incoming/active artist_access grants (both directions
          of the consent handshake live here: artist approves/declines/revokes).
          Artist-facing only — an org with no artist of its own has nothing to show. */}
      {role === ROLES.ARTIST && <RepresentationSection T={T} toast={toast} />}

      {/* Language */}
      <div className="card mb-3">
        <SectionHead>{T.settings.language}</SectionHead>
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink">{lang === 'he' ? T.settings.languageHe : T.settings.languageEn}</span>
          <LanguageToggle />
        </div>
      </div>

      {/* Consents */}
      <div className="card mb-3">
        <SectionHead className="mb-1">{T.settings.consents}</SectionHead>
        <p className="mb-3 text-xs text-muted">{T.settings.consentsHint}</p>
        <div className="space-y-1.5 text-xs text-muted">
          <p><span className="text-accent" aria-hidden>✓</span> Privacy Policy (v2) — {T.settings.accepted}</p>
          <p><span className="text-accent" aria-hidden>✓</span> Data Processing (v2) — {T.settings.accepted}</p>
          <p><span className="text-accent" aria-hidden>✓</span> Evidence Storage (v2) — {T.settings.accepted}</p>
        </div>

        {/* 4th purpose — optional, its own toggle, separate from the required pair */}
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{T.consent.marketingTitle}</p>
            <p className="text-xs text-muted">{T.consent.marketing}</p>
          </div>
          <button
            onClick={toggleMarketing}
            disabled={marketingBusy || !marketingLoaded}
            aria-pressed={marketing}
            className={`chip min-h-[40px] shrink-0 px-3 py-1.5 text-xs font-bold transition ${
              marketing ? 'bg-[rgba(190,226,78,0.10)] text-[#CBEE72]' : 'border border-white/15 bg-white/[0.04] text-muted'
            }`}>
            {marketingBusy ? T.common.loading : marketing ? T.common.yes : T.common.no}
          </button>
        </div>

        <p className="mt-3 text-[11px] italic text-faint">{T.settings.consentsContact}</p>
      </div>

      {/* Sign out */}
      <button className="btn-ghost mb-3 w-full" onClick={handleSignOut}>
        {T.settings.logout}
      </button>

      {/* Delete account */}
      <div className="card mb-5 border-amber/30">
        <SectionHead className="mb-1 text-amber">{T.settings.dangerZone}</SectionHead>
        <p className="mb-3 text-xs text-muted">{T.settings.deleteWarning}</p>
        {!showDeleteConfirm ? (
          <button className="min-h-[44px] w-full rounded-xl border border-amber/40 bg-amber/10 py-2 text-sm text-amber transition hover:bg-amber/20"
            onClick={() => setShowDeleteConfirm(true)}>
            {T.settings.deleteBtn}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-bold text-amber">{T.settings.deleteSure}</p>
            <div className="flex gap-2">
              <button className="min-h-[44px] flex-1 rounded-xl border border-amber bg-amber py-2 text-sm font-bold text-bg transition hover:brightness-110"
                onClick={handleDeleteAccount} disabled={deleteBusy}>
                {deleteBusy ? T.common.loading : T.settings.deleteConfirm}
              </button>
              <button className="btn-ghost flex-1" onClick={() => setShowDeleteConfirm(false)}>
                {T.common.cancel}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-faint">
        <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">Controlled beta</span>
        <span>LOCK v1</span>
      </div>
    </PageShell>
  )
}

function SectionHead({ children, className = 'mb-3' }) {
  return <h2 className={`font-bold text-ink ${className}`}>{children}</h2>
}
