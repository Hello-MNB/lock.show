import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { upsertProfile, requestAccountDeletion } from '../../lib/db.js'
import { ROLES } from '../../lib/constants.js'
import { PageShell, Wordmark, Field, ErrorNote, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { useOrg } from '../../context/OrgContext.jsx'
import ContextSwitcher from '../org/ContextSwitcher.jsx'
import { logEvent, EVENTS } from '../../lib/analytics.js'

export default function Settings() {
  const { T, lang } = useLang()
  const { user, profile, role, signOut, reloadProfile } = useAuth()
  const { activeOrg, isAgency, isOwner } = useOrg()
  const nav = useNavigate()
  const [name, setName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteSubmitted, setDeleteSubmitted] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)

  logEvent(EVENTS.SETTINGS_OPENED, { role })

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
      <div className="mb-7 flex items-center justify-between">
        <Wordmark />
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
              <button className="min-h-[44px] flex-1 rounded-xl border border-amber bg-amber py-2 text-sm font-bold text-[#231506] transition hover:brightness-110"
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
        <span>GIGPROOF v1</span>
      </div>
    </PageShell>
  )
}

function SectionHead({ children, className = 'mb-3' }) {
  return <h2 className={`font-bold text-ink ${className}`}>{children}</h2>
}
