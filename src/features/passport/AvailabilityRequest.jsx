import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getArtist, createRequest } from '../../lib/db.js'
import { PageShell, Wordmark, Field, Spinner, Loading } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// ── The availability request — one clean form, one dominant action. Errors
// (validation or server) NEVER clear what the booking manager typed. ─────────
export default function AvailabilityRequest() {
  const { T, BANDS } = useLang()
  const { id } = useParams()
  const nav = useNavigate()
  const [artist, setArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fieldErr, setFieldErr] = useState({})
  const [f, setF] = useState({
    requester_name: '', requester_org: '', event_date: '', location: '',
    capacity_band: '', budget_band: '', message: '',
  })
  const set = (k) => (e) => {
    setF({ ...f, [k]: e.target.value })
    if (fieldErr[k]) setFieldErr({ ...fieldErr, [k]: '' }) // clear the note, never the input
  }

  // Artist lookup is decorative here (name in the title) — the form itself only
  // needs the route id, so a fetch failure degrades to the generic name, never a
  // stuck spinner or a dead end for the booking manager.
  useEffect(() => {
    let alive = true
    getArtist(id)
      .then((a) => { if (alive) setArtist(a) })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [id])

  async function submit(e) {
    e.preventDefault()
    // inline validation — message next to the field, input stays intact
    if (!f.requester_name.trim()) {
      setFieldErr({ requester_name: 'Add your name so the artist knows who is asking.' })
      return
    }
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
    <div className="min-h-full bg-bg">
      <PageShell max="max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Wordmark />
          <Link to={`/passport/${id}`} className="text-sm text-muted transition hover:text-ink">
            ← {T.common.back}
          </Link>
        </div>

        <h1 className="font-display text-[26px] font-bold leading-tight text-ink">{T.request.title(name)}</h1>
        <p className="mt-2 mb-6 text-sm leading-relaxed text-muted">{T.request.subtitle}</p>

        <form onSubmit={submit} noValidate
          className="rounded-[20px] border border-line bg-surface p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,.75)]">
          {error && (
            <p role="alert" className="mb-4 rounded-md bg-[rgba(227,154,75,.15)] px-4 py-3 text-sm text-[#F0B478]">
              {error}
            </p>
          )}

          <Field label={T.request.name} error={fieldErr.requester_name}>
            <input className="field" value={f.requester_name} onChange={set('requester_name')}
              placeholder="Your full name" autoComplete="name" />
          </Field>
          <Field label={T.request.org}>
            <input className="field" value={f.requester_org} onChange={set('requester_org')}
              placeholder="Venue, agency or production" autoComplete="organization" />
          </Field>
          <Field label={T.request.eventDate}>
            <input className="field" type="date" value={f.event_date} onChange={set('event_date')} />
          </Field>
          <Field label={T.request.location}>
            <input className="field" value={f.location} onChange={set('location')} placeholder="City / venue" />
          </Field>
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
          <Field label={T.request.message}>
            <textarea className="field" rows={3} value={f.message} onChange={set('message')}
              placeholder="Anything the artist should know about the event" />
          </Field>

          <button className="btn-primary min-h-[48px] w-full shadow-[0_10px_26px_-10px_rgba(190,226,78,.6)]" disabled={busy}>
            {busy ? <><Spinner /> {T.common.sending}</> : T.request.cta}
          </button>
          <p className="mt-3 text-center text-[11px] text-faint">
            No commitment — this only asks the artist about the date.
          </p>
        </form>
      </PageShell>
    </div>
  )
}
