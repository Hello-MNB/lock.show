import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { listRequestsForAgency, updateRequestStatus } from '../../lib/db.js'
import { PageShell, Wordmark, Loading, EmptyState } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

const STATUS_STYLE = { new: 'bg-accent/20 text-accent', replied: 'bg-ok/15 text-ok', closed: 'bg-surface text-muted' }

export default function AgencyRequestsInbox() {
  const { T } = useLang()
  const STATUS_LABEL = { new: T.agency.statusNew, replied: T.agency.statusReplied, closed: T.agency.statusClosed }
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])

  async function load() { setRows(await listRequestsForAgency(user.id)); setLoading(false) }
  useEffect(() => { load() }, [user.id])

  async function setStatus(id, status) { await updateRequestStatus(id, status); await load() }

  if (loading) return <Loading />

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <Wordmark /><Link to="/agency" className="text-sm text-muted">חזרה</Link>
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
                {r.artists?.name && <>לאמן: {r.artists.name} · </>}
                {r.event_date || 'ללא תאריך'} · {r.location || '—'}
              </p>
              {(r.capacity_band || r.budget_band) && (
                <p className="text-sm text-muted">קהל: {r.capacity_band || '—'} · תקציב: {r.budget_band || '—'}</p>
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
