import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { listAgencyArtists, upsertArtist } from '../../lib/db.js'
import { PageShell, Wordmark, Loading, ErrorState, StatusChip, Field, Spinner, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { useOrg } from '../../context/OrgContext.jsx'
import { STATUS } from '../../lib/constants.js'

function ChecklistRow({ done, label, to }) {
  const inner = (<><span className={done ? 'text-ok' : 'text-muted'} aria-hidden="true">{done ? '✓' : '○'}</span><span className={done ? 'text-muted line-through' : 'text-soft'}>{label}</span></>)
  return <li className="flex items-center gap-2">{to && !done ? <Link to={to} className="flex items-center gap-2 hover:text-accent">{inner}</Link> : inner}</li>
}

// bounded roster signal (firewall: never a number)
function rosterStatus(a) {
  const signals = [a.lineup_frequency_band, a.sells_tickets != null, a.price_band, a.photo_url].filter(Boolean).length
  if (signals >= 3) return STATUS.STRONG
  if (signals >= 1) return STATUS.DEVELOPING
  return STATUS.MISSING
}

export default function AgencyDashboard() {
  const { T } = useLang()
  const { user, signOut } = useAuth()
  const { isAgency } = useOrg()
  const nav = useNavigate()
  const [hideChecklist, setHideChecklist] = useState(() => { try { return localStorage.getItem('gigproof_hide_checklist') === '1' } catch { return false } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [artists, setArtists] = useState([])
  const [adding, setAdding] = useState(false)
  const [f, setF] = useState({ stage_name: '', genre: '' })
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function load() {
    setError(false)
    try {
      setArtists(await listAgencyArtists(user.id))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [user.id])

  async function addArtist(e) {
    e.preventDefault()
    if (!f.stage_name.trim()) return
    setSaveError(''); setBusy(true)
    try {
      await upsertArtist({ created_by: user.id, name: f.stage_name, stage_name: f.stage_name, genre: f.genre })
      setF({ stage_name: '', genre: '' }); setAdding(false); await load()
    } catch {
      setSaveError(T.agency.saveError)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loading />
  if (error) return <PageShell><Wordmark className="mb-6" /><ErrorState title={T.admin.loadError} onRetry={() => { setLoading(true); load() }} /></PageShell>

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <Wordmark />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button className="text-sm text-muted hover:text-soft" onClick={() => { signOut(); nav('/login') }}>{T.settings.logout}</button>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-soft">{T.agency.title}</h1>
        <div className="flex items-center gap-3">
          <Link to="/agency/radar" className="text-sm text-accent">RADAR ›</Link>
          <Link to="/agency/requests" className="text-sm text-accent">{T.agency.requests} ›</Link>
        </div>
      </div>

      {/* first-run checklist — dismissible, non-shaming */}
      {!hideChecklist && (
        <div className="card mb-4 border border-line">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-soft text-sm">{T.org.checklistTitle}</p>
            <button className="text-xs text-muted" onClick={() => { try { localStorage.setItem('gigproof_hide_checklist', '1') } catch { /* ignore */ } setHideChecklist(true) }}>{T.org.checklistDismiss}</button>
          </div>
          <ul className="space-y-1.5 text-sm">
            <ChecklistRow done={artists.length > 0} label={T.org.checklistAddArtist} />
            <ChecklistRow done={false} label={T.org.checklistInviteTeam} to="/org/members" />
            <ChecklistRow done={artists.some((a) => a.published)} label={T.org.checklistPublish} />
          </ul>
        </div>
      )}

      {artists.length === 0 && !adding ? (
        <div className="card text-center py-8">
          <p className="font-bold text-soft mb-1">{T.org.emptyRosterTitle}</p>
          <p className="text-sm text-muted mb-4">{T.org.emptyRosterBody}</p>
          <div className="flex flex-col gap-2">
            <button className="btn-primary" onClick={() => setAdding(true)}>{T.agency.addArtist}</button>
            <Link to="/org/members" className="btn-ghost">{T.org.inviteTeamCta}</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {artists.map((a) => (
              <Link key={a.id} to={`/passport/${a.id}`}
                className="card flex items-center justify-between hover:border-accent transition">
                <div className="flex items-center gap-3">
                  {a.photo_url ? <img src={a.photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                    : <div className="h-12 w-12 rounded-full bg-surface" />}
                  <div>
                    <p className="font-bold text-soft">{a.stage_name || T.agency.noName}</p>
                    <p className="text-xs text-muted">{a.genre || '—'} · {a.published ? T.agency.publishedTag : T.agency.draftTag}</p>
                  </div>
                </div>
                <StatusChip status={rosterStatus(a)} />
              </Link>
            ))}
          </div>
          {adding ? (
            <form onSubmit={addArtist} className="card">
              <Field label={T.onboarding.stageName}><input className="field" value={f.stage_name} onChange={(e) => setF({ ...f, stage_name: e.target.value })} /></Field>
              <Field label={T.onboarding.genre}><input className="field" value={f.genre} onChange={(e) => setF({ ...f, genre: e.target.value })} /></Field>
              {saveError && <p className="text-xs text-warn mb-2">{saveError}</p>}
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
    </PageShell>
  )
}
