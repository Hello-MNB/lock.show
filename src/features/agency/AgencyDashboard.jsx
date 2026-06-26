import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { listAgencyArtists, upsertArtist } from '../../lib/db.js'
import { PageShell, Wordmark, Loading, EmptyState, StatusChip, Field, Spinner, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// bounded roster signal (firewall: never a number)
function rosterStatus(a) {
  const signals = [a.lineup_frequency_band, a.sells_tickets != null, a.price_band, a.photo_url].filter(Boolean).length
  if (signals >= 3) return 'strong'
  if (signals >= 1) return 'developing'
  return 'missing'
}

export default function AgencyDashboard() {
  const { T } = useLang()
  const { user, signOut } = useAuth()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [artists, setArtists] = useState([])
  const [adding, setAdding] = useState(false)
  const [f, setF] = useState({ stage_name: '', genre: '' })
  const [busy, setBusy] = useState(false)

  async function load() { setArtists(await listAgencyArtists(user.id)); setLoading(false) }
  useEffect(() => { load() }, [user.id])

  async function addArtist(e) {
    e.preventDefault()
    if (!f.stage_name.trim()) return
    setBusy(true)
    await upsertArtist({ created_by: user.id, name: f.stage_name, stage_name: f.stage_name, genre: f.genre })
    setF({ stage_name: '', genre: '' }); setAdding(false); await load(); setBusy(false)
  }

  if (loading) return <Loading />

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <Wordmark />
        <LanguageToggle />
        <button className="text-sm text-muted" onClick={() => { signOut(); nav('/login') }}>יציאה</button>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-soft">{T.agency.title}</h1>
        <Link to="/agency/requests" className="text-sm text-accent">{T.agency.requests} ›</Link>
      </div>

      {artists.length === 0 && !adding ? (
        <EmptyState title={T.agency.empty}
          action={<button className="btn-primary" onClick={() => setAdding(true)}>{T.agency.addArtist}</button>} />
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
                    <p className="font-bold text-soft">{a.stage_name || 'ללא שם'}</p>
                    <p className="text-xs text-muted">{a.genre || '—'} {a.published ? '· מפורסם' : '· טיוטה'}</p>
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
              <div className="flex gap-2">
                <button className="btn-primary flex-1" disabled={busy}>{busy ? <Spinner /> : 'שמור'}</button>
                <button type="button" className="btn-ghost" onClick={() => setAdding(false)}>ביטול</button>
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
