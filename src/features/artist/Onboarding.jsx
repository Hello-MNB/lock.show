import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getMyArtist, upsertArtist, getMyAct, updateAct, listProfileItems, addProfileItem, deleteProfileItem, publishPassport, hasConsent, recordConsentScope } from '../../lib/db.js'
import { SOURCE_STATUS } from '../../lib/constants.js'
import { uploadFile } from '../../lib/storage.js'
import { PageShell, Wordmark, Field, Spinner, ErrorNote, Loading } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

const STEPS = 7

// One label per step — the header now names EXACTLY what the current card asks,
// so the step number and the step content can never drift apart again.
// (English-first; purely presentational.)
const STEP_LABELS = ['Goal', 'Identity', 'Links', 'Draw', 'Experience', 'Readiness', 'Review']

// Segmented progress — bounded position ("you are here"), never a completion
// percentage. Past segments settle warm; the current one glows lime.
function ProgressSegments({ step }) {
  const { T } = useLang()
  return (
    <div className="mb-6">
      <div className="flex items-center gap-1" aria-hidden>
        {Array.from({ length: STEPS }, (_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i + 1 < step ? 'bg-white/25' : i + 1 === step ? 'bg-accent' : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        {T.onboarding.stepOf(step, STEPS)} · <span className="text-ink/80">{STEP_LABELS[step - 1]}</span>
      </p>
    </div>
  )
}

export default function Onboarding() {
  const { T } = useLang()
  const { user } = useAuth()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [artist, setArtist] = useState(null)
  const [act, setAct] = useState(null)
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    (async () => {
      try {
        let a = await getMyArtist(user.id)
        if (!a) a = await upsertArtist({ created_by: user.id })
        setArtist(a)
        // Default Act shares the artist id (020 transition model) — goal/format live there.
        try { setAct(await getMyAct(a.id)) } catch { setAct(null) }
        setItems(await listProfileItems(a.id))
      } catch (e) { setError(e.message) } finally { setLoading(false) }
    })()
  }, [user.id])

  function flash(msg) { setToast(msg); setTimeout(() => setToast(''), 1500) }

  async function save(patch) {
    setSaving(true); setError('')
    try {
      const updated = await upsertArtist({ ...artist, ...patch, id: artist.id, created_by: user.id })
      setArtist(updated)
      flash(T.common.saved)
      return true
    } catch (e) { setError(e.message); return false } finally { setSaving(false) }
  }

  async function refreshItems() { setItems(await listProfileItems(artist.id)) }

  if (loading) return <Loading />

  return (
    <PageShell max="max-w-lg">
      <div className="mb-4 text-center"><Wordmark className="justify-center" /></div>
      <ProgressSegments step={step} />
      <ErrorNote>{error}</ErrorNote>
      {toast && (
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink" role="status">
          <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />{toast}
        </p>
      )}

      {step === 1 && <StepGoal act={act} setAct={setAct} artistId={artist.id} flash={flash} setError={setError} />}
      {step === 2 && <StepIdentity artist={artist} save={save} user={user} />}
      {step === 3 && <StepLinks artist={artist} items={items} refresh={refreshItems} />}
      {step === 4 && <StepDraw artist={artist} save={save} />}
      {step === 5 && <StepExperience artist={artist} items={items} refresh={refreshItems} />}
      {step === 6 && <StepReadiness artist={artist} save={save} user={user} />}
      {step === 7 && <StepReview artist={artist} items={items} save={save} nav={nav} />}

      <div className="sticky bottom-0 -mx-4 mt-6 flex items-center justify-between gap-3 border-t border-white/[0.08] bg-bg/95 px-4 py-3 backdrop-blur">
        <button className="btn-ghost" disabled={step === 1 || saving} onClick={() => setStep((s) => s - 1)}>
          {T.common.back}
        </button>
        {step < STEPS ? (
          <button className="btn-primary flex-1" disabled={saving} onClick={() => setStep((s) => s + 1)}>
            {saving ? <Spinner /> : T.common.continue}
          </button>
        ) : null}
      </div>
    </PageShell>
  )
}

/* ── Step 1: goal-first (canon A4) — the goal drives which evidence is
      prioritized; it never changes what is true. Saves on pick. ── */
function StepGoal({ act, setAct, artistId, flash, setError }) {
  const { T } = useLang()
  const goals = ['more-shows', 'new-venues', 'support-slots', 'out-of-town', 'raise-fee', 'prove-community', 'external-bookings', 'not-sure']
  const current = act?.artist_goal || null

  async function pick(g) {
    setError('')
    const prev = act
    setAct({ ...(act || { id: artistId }), artist_goal: g }) // optimistic
    try {
      const updated = await updateAct(artistId, { artist_goal: g })
      setAct(updated)
      flash(T.common.saved)
    } catch (e) { setAct(prev); setError(e.message) }
  }

  return (
    <div className="card">
      <h2 className="font-display mb-1 text-xl font-bold tracking-[-0.01em] text-ink">{T.onboarding.goalTitle}</h2>
      <p className="mb-4 text-xs text-muted">{T.onboarding.goalWhy}</p>
      {/* goal cards — a warm grid, one tap each */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        {goals.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => pick(g)}
            aria-pressed={current === g}
            className={`flex min-h-[56px] items-center gap-2 rounded-xl border bg-surface2 px-3 py-3 text-start text-sm font-semibold transition-colors ${
              current === g
                ? 'border-accent/70 text-ink'
                : 'border-line text-ink/85 hover:border-line2'
            }`}
          >
            {/* selection = a thin lime ring + a small dot; never a tinted fill */}
            <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${current === g ? 'bg-accent' : 'bg-white/15'}`} />
            {T.onboarding.goals[g]}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted">{T.onboarding.goalNotSureHint}</p>
    </div>
  )
}

/* ── Step 2: identity ── */
function StepIdentity({ artist, save, user }) {
  const { T } = useLang()
  const [f, setF] = useState({
    stage_name: artist.stage_name || '', genre: artist.genre || '',
    city: artist.city || '', one_line: artist.one_line || '', photo_url: artist.photo_url || '',
  })
  const [uploading, setUploading] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function onPhoto(e) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadFile('public-media', user.id, file)
      setF((p) => ({ ...p, photo_url: url }))
    } catch { /* fall back to URL paste */ } finally { setUploading(false) }
  }

  return (
    <div className="card" onBlur={() => save({ ...f, name: f.stage_name })}>
      <h2 className="font-display mb-1 text-xl font-bold tracking-[-0.01em] text-ink">{T.onboarding.step1Title}</h2>
      <p className="mb-4 text-xs text-muted">The human behind the calendar — this is what a booking manager meets first.</p>
      <Field label={T.onboarding.stageName}><input className="field" value={f.stage_name} onChange={set('stage_name')} /></Field>
      <Field label={T.onboarding.genre}><input className="field" value={f.genre} onChange={set('genre')} /></Field>
      <Field label={T.onboarding.city}><input className="field" value={f.city} onChange={set('city')} /></Field>
      <Field label={T.onboarding.oneLine}><input className="field" value={f.one_line} onChange={set('one_line')} placeholder={T.onboarding.oneLinePlaceholder} /></Field>
      <Field label={T.onboarding.photo} hint={T.onboarding.photoHint}>
        <input type="file" accept="image/*" onChange={onPhoto} className="mb-2 text-sm text-muted" />
        {uploading && <Spinner />}
        <input className="field" dir="ltr" value={f.photo_url} onChange={set('photo_url')} placeholder="https://…" />
      </Field>
      {f.photo_url && (
        <img src={f.photo_url} alt="" className="mt-2 h-40 w-full rounded-xl border border-line object-cover" />
      )}
    </div>
  )
}

/* ── Step 3: links — source-connect cards ── */
function StepLinks({ artist, items, refresh }) {
  const { T } = useLang()
  const links = items.filter((i) => i.item_type === 'link')
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)

  async function add() {
    if (!url.trim()) return
    setBusy(true)
    await addProfileItem({ artist_id: artist.id, item_type: 'link', title: url.trim(), public_url: url.trim(), source_status: SOURCE_STATUS.PUBLIC_VERIFIED })
    setUrl(''); await refresh(); setBusy(false)
  }
  async function remove(id) { await deleteProfileItem(id); await refresh() }

  return (
    <div className="card">
      <h2 className="font-display mb-1 text-xl font-bold tracking-[-0.01em] text-ink">{T.onboarding.step2Title}</h2>
      <p className="mb-4 text-sm text-muted">{T.onboarding.linkHelp}</p>
      <div className="mb-3 rounded-xl border border-white/[0.08] bg-surface2 p-3">
        <p className="label">{T.onboarding.linkPlaceholder}</p>
        <div className="flex gap-2">
          <input className="field" dir="ltr" value={url} onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…" onKeyDown={(e) => e.key === 'Enter' && add()} />
          <button className="btn-primary shrink-0" onClick={add} disabled={busy}>{T.common.add}</button>
        </div>
      </div>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-surface2 px-3 py-2.5 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
              <span dir="ltr" className="truncate text-ink/90">{l.public_url}</span>
            </span>
            <button className="shrink-0 text-muted transition-colors hover:text-ink" onClick={() => remove(l.id)}>{T.common.remove}</button>
          </li>
        ))}
      </ul>
      {links.length === 0 && (
        <p className="mt-1 text-[11px] text-faint">Instagram, SoundCloud, YouTube — each connected source strengthens what can be checked.</p>
      )}
    </div>
  )
}

/* ── Step 4: draw bands (firewall: bands/booleans only) ── */
function StepDraw({ artist, save }) {
  const { T, BANDS } = useLang()
  const [f, setF] = useState({
    lineup_frequency_band: artist.lineup_frequency_band || '',
    sells_tickets: artist.sells_tickets ?? null,
    price_band: artist.price_band || '',
    community_size_band: artist.community_size_band || '',
  })
  function pick(k, v) { const next = { ...f, [k]: v }; setF(next); save(next) }

  return (
    <div className="card">
      <h2 className="font-display mb-1 text-xl font-bold tracking-[-0.01em] text-ink">{T.onboarding.step3Title}</h2>
      <p className="mb-4 text-sm text-muted">{T.onboarding.drawHelp}</p>

      <BandPicker label={T.onboarding.freqBand} options={BANDS.frequency} value={f.lineup_frequency_band} onPick={(v) => pick('lineup_frequency_band', v)} />

      <Field label={T.onboarding.sellsTickets}>
        <div className="flex gap-2">
          {[[T.common.yes, true], [T.common.no, false]].map(([t, v]) => (
            <button key={t} onClick={() => pick('sells_tickets', v)}
              className={`chip min-h-[44px] border px-5 py-2 font-mono transition-colors ${f.sells_tickets === v ? 'border-accent/70 bg-surface2 font-bold text-ink' : 'border-white/15 bg-surface2 text-ink/85 hover:border-line2'}`}>{t}</button>
          ))}
        </div>
      </Field>

      <BandPicker label={T.onboarding.priceBand} options={BANDS.price} value={f.price_band} onPick={(v) => pick('price_band', v)} />
      <BandPicker label={T.onboarding.communityBand} options={BANDS.community} value={f.community_size_band} onPick={(v) => pick('community_size_band', v)} />
    </div>
  )
}

function BandPicker({ label, options, value, onPick }) {
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} onClick={() => onPick(o)}
            className={`chip min-h-[44px] border px-4 py-2 font-mono transition-colors ${value === o ? 'border-accent/70 bg-surface2 font-bold text-ink' : 'border-white/15 bg-surface2 text-ink/85 hover:border-line2'}`}>{o}</button>
        ))}
      </div>
    </Field>
  )
}

/* ── Step 5: professional experience ── */
function StepExperience({ artist, items, refresh }) {
  const { T, TYPES: PROFILE_ITEM_TYPES } = useLang()
  const exp = items.filter((i) => !['link'].includes(i.item_type))
  const [f, setF] = useState({ item_type: 'event', title: '', item_date: '', public_url: '' })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function add() {
    if (!f.title.trim()) return
    setBusy(true)
    await addProfileItem({
      artist_id: artist.id, item_type: f.item_type, title: f.title.trim(),
      item_date: f.item_date || null, public_url: f.public_url || null,
      source_status: f.public_url ? SOURCE_STATUS.PUBLIC_VERIFIED : SOURCE_STATUS.ARTIST_PROVIDED,
    })
    setF({ item_type: f.item_type, title: '', item_date: '', public_url: '' })
    await refresh(); setBusy(false)
  }
  async function remove(id) { await deleteProfileItem(id); await refresh() }

  return (
    <div className="card">
      <h2 className="font-display mb-1 text-xl font-bold tracking-[-0.01em] text-ink">{T.onboarding.step4Title}</h2>
      <p className="mb-4 text-sm text-muted">{T.onboarding.itemHelp}</p>
      <Field label={T.onboarding.itemType}>
        <select className="field" value={f.item_type} onChange={set('item_type')}>
          {PROFILE_ITEM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </Field>
      <Field label={T.onboarding.itemTitle}><input className="field" value={f.title} onChange={set('title')} placeholder={T.onboarding.itemTitlePlaceholder} /></Field>
      <Field label={T.onboarding.itemDate}><input className="field" type="date" value={f.item_date} onChange={set('item_date')} /></Field>
      <Field label={T.onboarding.itemUrl} hint={T.onboarding.itemUrlHint}>
        <input className="field" dir="ltr" value={f.public_url} onChange={set('public_url')} placeholder="https://…" />
      </Field>
      <button className="btn-ghost mb-4 w-full" onClick={add} disabled={busy}>{T.onboarding.addItem}</button>
      <ul className="space-y-2">
        {exp.map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-surface2 px-3 py-2.5 text-sm">
            <span className="min-w-0 truncate text-ink/90">
              {i.title}
              {i.item_date && <span className="ms-2 font-mono text-[10px] text-faint">{i.item_date}</span>}
            </span>
            <button className="shrink-0 text-muted transition-colors hover:text-ink" onClick={() => remove(i.id)}>{T.common.remove}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── Step 6: readiness ── */
function StepReadiness({ artist, save, user }) {
  const { T } = useLang()
  const [f, setF] = useState({
    set_length: artist.set_length || '', regions: artist.regions || '',
    invoice_ready: artist.invoice_ready || false, rider_url: artist.rider_url || '',
    whatsapp_number: artist.whatsapp_number || '',
  })
  const [uploading, setUploading] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function onRider(e) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try { const { url } = await uploadFile('public-media', user.id, file); setF((p) => ({ ...p, rider_url: url })) }
    catch { /* ignore */ } finally { setUploading(false) }
  }

  return (
    <div className="card" onBlur={() => save(f)}>
      <h2 className="font-display mb-4 text-xl font-bold tracking-[-0.01em] text-ink">{T.onboarding.step5Title}</h2>
      <Field label={T.onboarding.setLength}><input className="field" value={f.set_length} onChange={set('set_length')} placeholder={T.onboarding.setLengthPlaceholder} /></Field>
      <Field label={T.onboarding.regions}><input className="field" value={f.regions} onChange={set('regions')} placeholder={T.onboarding.regionsPlaceholder} /></Field>
      <label className="mb-4 flex min-h-[44px] items-center gap-3 rounded-xl border border-white/[0.08] bg-surface2 px-3 py-2.5 text-sm text-ink/90">
        <input type="checkbox" className="accent-[#BEE24E]" checked={f.invoice_ready} onChange={(e) => { const v = e.target.checked; setF((p) => ({ ...p, invoice_ready: v })); save({ ...f, invoice_ready: v }) }} />
        {T.onboarding.invoice}
      </label>
      <Field label={T.onboarding.rider}>
        <input type="file" onChange={onRider} className="text-sm text-muted" />
        {uploading && <Spinner />}
        {f.rider_url && <p className="mt-1 text-xs text-accent">✓ {T.common.saved}</p>}
      </Field>
      <Field label={T.onboarding.whatsapp} hint={T.onboarding.whatsappHelp}>
        <input className="field" dir="ltr" type="tel" value={f.whatsapp_number} onChange={set('whatsapp_number')} placeholder="0523456789" />
      </Field>
    </div>
  )
}

/* ── Step 7: review + publish ── */
function StepReview({ artist, items, save, nav }) {
  const { T } = useLang()
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [needConsent, setNeedConsent] = useState(false)

  async function doPublish() {
    setBusy(true)
    await save({ published: true })
    // Build the immutable public snapshot (server, service-role). Best-effort:
    // if the AI/API server isn't configured yet, publishing still succeeds and
    // the passport falls back to a live build once the server key is added.
    try { await publishPassport(artist.id) } catch { /* snapshot deferred */ }
    nav(`/passport/${artist.id}`)
  }

  // Publish gate: require public-publish consent before going live (once).
  async function publish() {
    setBusy(true)
    const ok = await hasConsent(user.id, 'public-publish')
    setBusy(false)
    if (!ok) { setNeedConsent(true); return }
    await doPublish()
  }

  async function agreeAndPublish() {
    setBusy(true)
    try { await recordConsentScope(user.id, 'public-publish') } catch { /* non-blocking */ }
    setNeedConsent(false)
    await doPublish()
  }

  return (
    <div className="card relative overflow-hidden text-center">
      {/* the warm light lands on the finished Passport */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-16 h-44"
        style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(242,192,99,0.14), transparent 70%)' }} />
      <h2 className="font-display relative mb-2 text-xl font-bold tracking-[-0.01em] text-ink">{T.onboarding.step6Title}</h2>
      <p className="relative mb-4 text-muted">{artist.stage_name || T.onboarding.theArtist} · {artist.genre} · {items.length} {T.onboarding.items}</p>
      {artist.photo_url && (
        <img src={artist.photo_url} alt="" className="relative mx-auto mb-4 h-32 w-32 rounded-full border border-gold/70 object-cover shadow-[0_0_28px_rgba(242,192,99,0.22)]" />
      )}
      {needConsent ? (
        <div className="relative rounded-xl border border-line2 bg-surface2 p-4 text-start">
          <p className="mb-1 font-bold text-ink">{T.consent.publishTitle}</p>
          <p className="mb-4 text-sm text-muted">{T.consent.publishBody}</p>
          <div className="flex flex-col gap-2">
            <button className="btn-primary" onClick={agreeAndPublish} disabled={busy}>{busy ? <Spinner /> : T.consent.publishAgree}</button>
            <button className="btn-ghost" onClick={() => setNeedConsent(false)} disabled={busy}>{T.common.cancel}</button>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col gap-3">
          <button className="btn-primary" onClick={publish} disabled={busy}>{busy ? <Spinner /> : T.onboarding.publish}</button>
          <button className="btn-ghost" onClick={() => nav('/artist/home')} disabled={busy}>{T.onboarding.backToEdit}</button>
        </div>
      )}
    </div>
  )
}
