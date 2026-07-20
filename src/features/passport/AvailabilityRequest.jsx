import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getArtist, createRequest } from '../../lib/db.js'
import { DEMO } from '../../lib/demo.js'
import { logEvent, EVENTS } from '../../lib/analytics.js'
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
    // duplicate-submit guard — a second Enter/click while the first is still
    // in flight is a no-op, never a second request (idempotent feel).
    if (busy) return
    // inline validation — message next to the field, human explanation next
    // to it, input stays intact. Never a silently-disabled button.
    const nextFieldErr = {}
    if (!f.requester_name.trim()) nextFieldErr.requester_name = T.request.nameRequired
    if (f.event_date) {
      const today = new Date(); today.setHours(0, 0, 0, 0)
      if (new Date(f.event_date) < today) nextFieldErr.event_date = T.request.eventDatePast
    }
    if (Object.keys(nextFieldErr).length) {
      setFieldErr(nextFieldErr)
      return
    }
    setBusy(true); setError('')
    try {
      // G11 — PUBLIC server route first: it creates the request AND the artist's
      // notification server-side with the service role (the direct /api/notify
      // path is now owner/operator-only, so an anonymous booker could no longer
      // ring the artist's bell without this). Rate-limited + schema-validated.
      const payload = { artistId: id, ...f, event_date: f.event_date || null }
      let sent = false
      let refusal = null
      try {
        if (DEMO) throw new Error('demo') // demo fixtures only — never a live server call
        const res = await fetch('/api/availability-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const ct = res.headers.get('content-type') || ''
        if (ct.includes('application/json')) {
          const body = await res.json().catch(() => null)
          if (res.ok && body?.ok) sent = true
          else refusal = body?.error || 'server_error' // a live server REFUSED — surface, don't bypass
        }
        // non-JSON = static host answered for /api (offline embed) → fallback below
      } catch { /* server unreachable — fallback below */ }
      if (refusal) throw new Error(T.common.error)
      if (!sent) {
        // Offline-embed fallback: the direct insert still records the request
        // under RLS. Honesty note: without the server no cross-user notification
        // can be written (notifications RLS is user_id = auth.uid()) — the artist
        // sees the request in their Requests inbox, without a bell.
        await createRequest({ artist_id: id, ...f, event_date: f.event_date || null })
      }
      // GATE signal — a booking manager reacted to a real Passport.
      logEvent(EVENTS.REQUEST_SENT, { artist_id: id })
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
          <Link to={`/passport/${id}`} className="tap-target text-sm text-muted transition hover:text-ink">
            ← {T.common.back}
          </Link>
        </div>

        <h1 className="font-display text-[26px] font-bold leading-tight text-ink">{T.request.title(name)}</h1>
        <p className="mt-2 mb-6 text-sm leading-relaxed text-muted">{T.request.subtitle}</p>

        <form onSubmit={submit} noValidate
          className="rounded-[20px] border border-line bg-surface p-6 shadow-card">
          {error && (
            <p role="alert" className="mb-4 rounded-md bg-void-bg px-4 py-3 text-sm text-void">
              {error}
            </p>
          )}

          <Field label={T.request.name} hint={T.request.nameHint} error={fieldErr.requester_name}>
            <input className="field" value={f.requester_name} onChange={set('requester_name')}
              placeholder={T.request.namePlaceholder} autoComplete="name" />
          </Field>
          <Field label={T.request.org} hint={T.request.orgHint}>
            <input className="field" value={f.requester_org} onChange={set('requester_org')}
              placeholder={T.request.orgPlaceholder} autoComplete="organization" />
          </Field>
          <Field label={T.request.eventDate} hint={T.request.eventDateHint} error={fieldErr.event_date}>
            <input className="field" type="date" value={f.event_date} onChange={set('event_date')} />
          </Field>
          <Field label={T.request.location} hint={T.request.locationHint}>
            <input className="field" value={f.location} onChange={set('location')} placeholder={T.request.locationPlaceholder} />
          </Field>
          <Field label={T.request.capacity} hint={T.request.capacityHint}>
            <select className="field" value={f.capacity_band} onChange={set('capacity_band')}>
              <option value="">—</option>{BANDS.capacity.map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field label={T.request.budget} hint={T.request.budgetHint}>
            <select className="field" value={f.budget_band} onChange={set('budget_band')}>
              <option value="">—</option>{BANDS.budget.map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field label={T.request.message} hint={T.request.messageHint}>
            <textarea className="field" rows={3} value={f.message} onChange={set('message')}
              placeholder={T.request.messagePlaceholder} />
          </Field>

          <button className="btn-primary min-h-[48px] w-full shadow-[0_10px_26px_-10px_rgba(190,226,78,.6)]" disabled={busy}>
            {busy ? <><Spinner /> {T.common.sending}</> : T.request.cta}
          </button>
          <p className="mt-3 text-center text-[11px] text-faint">
            {T.request.noCommitment}
          </p>
        </form>
      </PageShell>
    </div>
  )
}
