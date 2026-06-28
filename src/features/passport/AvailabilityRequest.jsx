import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getArtist, createRequest } from '../../lib/db.js'
import { PageShell, Wordmark, Field, Spinner, ErrorNote, Loading } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

export default function AvailabilityRequest() {
  const { T, BANDS } = useLang()
  const { id } = useParams()
  const nav = useNavigate()
  const [artist, setArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [f, setF] = useState({
    requester_name: '', requester_org: '', event_date: '', location: '',
    capacity_band: '', budget_band: '', message: '',
  })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  useEffect(() => { getArtist(id).then((a) => { setArtist(a); setLoading(false) }) }, [id])

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await createRequest({ artist_id: id, ...f, event_date: f.event_date || null })
      nav(`/passport/${id}/sent`, {
        state: { requester_name: f.requester_name, artist_name: artist?.stage_name },
      })
    } catch (err) { setError(err.message || T.common.error) } finally { setBusy(false) }
  }

  if (loading) return <Loading />
  const name = artist?.stage_name || T.request.theArtist

  return (
    <PageShell max="max-w-md">
      <Wordmark className="mb-4" />
      <h1 className="text-xl font-bold text-soft">{T.request.title(name)}</h1>
      <p className="text-sm text-muted mb-4">{T.request.subtitle}</p>
      <form onSubmit={submit} className="card">
        <ErrorNote>{error}</ErrorNote>
        <Field label={T.request.name}><input className="field" value={f.requester_name} onChange={set('requester_name')} required /></Field>
        <Field label={T.request.org}><input className="field" value={f.requester_org} onChange={set('requester_org')} /></Field>
        <Field label={T.request.eventDate}><input className="field" type="date" value={f.event_date} onChange={set('event_date')} /></Field>
        <Field label={T.request.location}><input className="field" value={f.location} onChange={set('location')} /></Field>
        <Field label={T.request.capacity}>
          <select className="field" value={f.capacity_band} onChange={set('capacity_band')}>
            <option value="">—</option>{BANDS.capacity.map((b) => <option key={b}>{b}</option>)}
          </select>
        </Field>
        <Field label={T.request.budget}>
          <select className="field" value={f.budget_band} onChange={set('budget_band')}>
            <option value="">—</option>{BANDS.budget.map((b) => <option key={b}>{b}</option>)}
          </select>
        </Field>
        <Field label={T.request.message}><textarea className="field" rows={3} value={f.message} onChange={set('message')} /></Field>
        <button className="btn-primary w-full" disabled={busy}>{busy ? <><Spinner /> {T.common.sending}</> : T.request.cta}</button>
      </form>
    </PageShell>
  )
}
