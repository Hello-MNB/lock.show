import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { upsertProfile, requestAccountDeletion } from '../../lib/db.js'
import { PageShell, Wordmark, Field, ErrorNote, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { logEvent, EVENTS } from '../../lib/analytics.js'

export default function Settings() {
  const { T, lang } = useLang()
  const { user, profile, role, signOut, reloadProfile } = useAuth()
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
      <div className="flex items-center justify-between mb-6">
        <Wordmark />
        <Link to={role === 'artist' ? '/artist/home' : role === 'agency' ? '/agency' : '/'} className="text-sm text-muted">
          {T.common.back}
        </Link>
      </div>
      <h1 className="text-xl font-bold text-soft mb-4">{T.settings.title}</h1>

      <ErrorNote>{error}</ErrorNote>
      {deleteSubmitted && (
        <div className="card bg-ok/10 border-ok/30 mb-4">
          <p className="text-ok text-sm">{T.settings.deleteSubmitted}</p>
        </div>
      )}

      {/* Profile */}
      <div className="card mb-4">
        <h2 className="font-bold text-soft mb-3">פרופיל</h2>
        <Field label={T.settings.displayName}>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveProfile()} />
        </Field>
        <Field label="אימייל" hint={T.settings.emailReadOnly}>
          <input className="field opacity-60" value={user?.email || ''} readOnly />
        </Field>
        <button className="btn-primary w-full" onClick={saveProfile} disabled={saving}>
          {saving ? T.common.loading : saved ? T.settings.saved + ' ✓' : T.settings.save}
        </button>
      </div>

      {/* Language */}
      <div className="card mb-4">
        <h2 className="font-bold text-soft mb-3">{T.settings.language}</h2>
        <div className="flex items-center justify-between">
          <span className="text-soft text-sm">{lang === 'he' ? T.settings.languageHe : T.settings.languageEn}</span>
          <LanguageToggle />
        </div>
      </div>

      {/* Consents */}
      <div className="card mb-4">
        <h2 className="font-bold text-soft mb-1">{T.settings.consents}</h2>
        <p className="text-xs text-muted mb-3">{T.settings.consentsHint}</p>
        <div className="space-y-1 text-xs text-muted">
          <p>• Privacy Policy (v2) — {lang === 'he' ? 'מאושר' : 'Accepted'}</p>
          <p>• Data Processing (v2) — {lang === 'he' ? 'מאושר' : 'Accepted'}</p>
          <p>• Evidence Storage (v2) — {lang === 'he' ? 'מאושר' : 'Accepted'}</p>
        </div>
        <p className="mt-3 text-[11px] text-muted italic">
          {lang === 'he'
            ? 'לניהול מלא צור קשר: privacy@gigproof.com (DRAFT)'
            : 'For full management contact: privacy@gigproof.com (DRAFT)'}
        </p>
      </div>

      {/* Sign out */}
      <button className="btn-ghost w-full mb-4" onClick={handleSignOut}>
        {T.settings.logout}
      </button>

      {/* Delete account */}
      <div className="card border-red-900/40 mb-4">
        <h2 className="font-bold text-red-400 mb-1">{T.settings.dangerZone}</h2>
        <p className="text-xs text-muted mb-3">{T.settings.deleteWarning}</p>
        {!showDeleteConfirm ? (
          <button className="w-full rounded-xl border border-red-900 bg-red-950/30 py-2 text-sm text-red-400 hover:bg-red-900/40 transition"
            onClick={() => setShowDeleteConfirm(true)}>
            {T.settings.deleteBtn}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-red-300 font-bold">{lang === 'he' ? 'האם אתה בטוח?' : 'Are you sure?'}</p>
            <div className="flex gap-2">
              <button className="flex-1 rounded-xl border border-red-600 bg-red-900/50 py-2 text-sm text-red-300 hover:bg-red-800/50 transition"
                onClick={handleDeleteAccount} disabled={deleteBusy}>
                {deleteBusy ? T.common.loading : T.settings.deleteConfirm}
              </button>
              <button className="flex-1 btn-ghost" onClick={() => setShowDeleteConfirm(false)}>
                {T.common.cancel}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-muted">{lang === 'he' ? 'GIGPROOF v1 · DRAFT' : 'GIGPROOF v1 · DRAFT'}</p>
    </PageShell>
  )
}
