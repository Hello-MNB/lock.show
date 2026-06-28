import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { listRequestsForAgency, updateRequestStatus } from '../../lib/db.js'
import { PageShell, Wordmark, Loading, EmptyState, ErrorState } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

const STATUS_STYLE = { new: 'bg-accent/20 text-accent', replied: 'bg-ok/15 text-ok', closed: 'bg-surface text-muted' }

export default function AgencyRequestsInbox() {
  const { T } = useLang()
  const STATUS_LABEL = { new: T.agency.statusNew, replied: T.agency.statusReplied, closed: T.agency.statusClosed }
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [rows, setRows] = useState([])

  async function load() {
    setError(false)
    try {
      setRows(await listRequestsForAgency(user.id))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [user.id])

  async function setStatus(id, status) {
    try { await updateRequestStatus(id, status); await load() } catch { setError(true) }
  }

  if (loading) return <Loading />
  if (error) return <PageShell><Wordmark className="mb-6" /><ErrorState title={T.agency.loadError} onRetry={() => { setLoading(true); load() }} /></PageShell>

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <Wordmark /><Link to="/agency" className="text-sm text-muted hover:text-soft">{T.common.back}</Link>
      </div>
      <h1 className="text-xl font-bold text-soft mb-4">{T.agency.requests}</h1>

      {rows.length === 0 ? (
        <EmptyState title={T.agency.requestsEmpty} />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-soft">{r.requester_name}{r.requester_org ? ` · ${r.requester_org}` : ''}</p>
                <span className={`chip ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
              </div>
              <p className="text-sm text-muted">
                {r.artists?.stage_name && <>{T.agency.forArtist} {r.artists.stage_name} · </>}
                {r.event_date || T.agency.noDate} · {r.location || '—'}
              </p>
              {(r.capacity_band || r.budget_band) && (
                <p className="text-sm text-muted">{T.agency.audience} {r.capacity_band || '—'} · {T.agency.budget} {r.budget_band || '—'}</p>
              )}
              {r.message && <p className="text-sm text-soft mt-2">{r.message}</p>}
              <div className="flex gap-2 mt-3">
                {r.status !== 'replied' && <button className="btn-ghost text-sm py-2" onClick={() => setStatus(r.id, 'replied')}>{T.agency.markReplied}</button>}
                {r.status !== 'closed' && <button className="btn-ghost text-sm py-2" onClick={() => setStatus(r.id, 'closed')}>{T.agency.markClosed}</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
