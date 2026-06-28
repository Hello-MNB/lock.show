import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getMyArtist, upsertArtist, listProfileItems, addProfileItem, deleteProfileItem, publishPassport, hasConsent, recordConsentScope } from '../../lib/db.js'
import { SOURCE_STATUS } from '../../lib/constants.js'
import { uploadFile } from '../../lib/storage.js'
import { PageShell, Wordmark, Field, Spinner, ErrorNote, Loading } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

const STEPS = 6

function ProgressBar({ step }) {
  const { T } = useLang()
  return (
    <div className="mb-6">
      <div className="h-1.5 w-full rounded-full bg-line overflow-hidden">
        <div className="h-full bg-accent transition-all" style={{ width: `${(step / STEPS) * 100}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted">{T.onboarding.stepOf(step, STEPS)}</p>
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
      <div className="text-center mb-4"><Wordmark className="justify-center" /></div>
      <ProgressBar step={step} />
      <ErrorNote>{error}</ErrorNote>
      {toast && <p className="mb-3 text-sm text-ok">{toast}</p>}

      {step === 1 && <StepIdentity artist={artist} save={save} user={user} />}
      {step === 2 && <StepLinks artist={artist} items={items} refresh={refreshItems} />}
      {step === 3 && <StepDraw artist={artist} save={save} />}
      {step === 4 && <StepExperience artist={artist} items={items} refresh={refreshItems} />}
      {step === 5 && <StepReadiness artist={artist} save={save} user={user} />}
      {step === 6 && <StepReview artist={artist} items={items} save={save} nav={nav} />}

      <div className="sticky bottom-0 -mx-4 mt-6 flex items-center justify-between gap-3 border-t border-line bg-ink/95 px-4 py-3 backdrop-blur">
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

/* ── Step 1: identity ── */
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
      <h2 className="text-lg font-bold text-soft mb-4">{T.onboarding.step1Title}</h2>
      <Field label={T.onboarding.stageName}><input className="field" value={f.stage_name} onChange={set('stage_name')} /></Field>
      <Field label={T.onboarding.genre}><input className="field" value={f.genre} onChange={set('genre')} /></Field>
      <Field label={T.onboarding.city}><input className="field" value={f.city} onChange={set('city')} /></Field>
      <Field label={T.onboarding.oneLine}><input className="field" value={f.one_line} onChange={set('one_line')} placeholder={T.onboarding.oneLinePlaceholder} /></Field>
      <Field label={T.onboarding.photo} hint={T.onboarding.photoHint}>
        <input type="file" accept="image/*" onChange={onPhoto} className="text-sm text-muted mb-2" />
        {uploading && <Spinner />}
        <input className="field" dir="ltr" value={f.photo_url} onChange={set('photo_url')} placeholder="https://…" />
      </Field>
      {f.photo_url && <img src={f.photo_url} alt="" className="mt-2 h-40 w-full rounded-xl object-cover" />}
    </div>
  )
}

/* ── Step 2: links ── */
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
      <h2 className="text-lg font-bold text-soft mb-1">{T.onboarding.step2Title}</h2>
      <p className="text-sm text-muted mb-4">{T.onboarding.linkHelp}</p>
      <div className="flex gap-2 mb-4">
        <input className="field" dir="ltr" value={url} onChange={(e) => setUrl(e.target.value)}
          placeholder={T.onboarding.linkPlaceholder} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <button className="btn-primary" onClick={add} disabled={busy}>{T.common.add}</button>
      </div>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.id} className="flex items-center justify-between rounded-xl bg-surface px-3 py-2 text-sm">
            <span dir="ltr" className="truncate text-soft">{l.public_url}</span>
            <button className="text-muted hover:text-red-400" onClick={() => remove(l.id)}>{T.common.remove}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── Step 3: draw bands (firewall: bands/booleans only) ── */
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
      <h2 className="text-lg font-bold text-soft mb-1">{T.onboarding.step3Title}</h2>
      <p className="text-sm text-muted mb-4">{T.onboarding.drawHelp}</p>

      <BandPicker label={T.onboarding.freqBand} options={BANDS.frequency} value={f.lineup_frequency_band} onPick={(v) => pick('lineup_frequency_band', v)} />

      <Field label={T.onboarding.sellsTickets}>
        <div className="flex gap-2">
          {[[T.common.yes, true], [T.common.no, false]].map(([t, v]) => (
            <button key={t} onClick={() => pick('sells_tickets', v)}
              className={`chip min-h-[44px] px-5 py-2 ${f.sells_tickets === v ? 'bg-accent text-ink' : 'bg-surface text-soft'}`}>{t}</button>
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
            className={`chip min-h-[44px] px-4 py-2 ${value === o ? 'bg-accent text-ink' : 'bg-surface text-soft'}`}>{o}</button>
        ))}
      </div>
    </Field>
  )
}

/* ── Step 4: professional experience ── */
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
      <h2 className="text-lg font-bold text-soft mb-1">{T.onboarding.step4Title}</h2>
      <p className="text-sm text-muted mb-4">{T.onboarding.itemHelp}</p>
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
      <button className="btn-ghost w-full mb-4" onClick={add} disabled={busy}>{T.onboarding.addItem}</button>
      <ul className="space-y-2">
        {exp.map((i) => (
          <li key={i.id} className="flex items-center justify-between rounded-xl bg-surface px-3 py-2 text-sm">
            <span className="text-soft">{i.title}{i.item_date ? ` · ${i.item_date}` : ''}</span>
            <button className="text-muted hover:text-red-400" onClick={() => remove(i.id)}>{T.common.remove}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── Step 5: readiness ── */
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
      <h2 className="text-lg font-bold text-soft mb-4">{T.onboarding.step5Title}</h2>
      <Field label={T.onboarding.setLength}><input className="field" value={f.set_length} onChange={set('set_length')} placeholder={T.onboarding.setLengthPlaceholder} /></Field>
      <Field label={T.onboarding.regions}><input className="field" value={f.regions} onChange={set('regions')} placeholder={T.onboarding.regionsPlaceholder} /></Field>
      <label className="flex items-center gap-3 text-soft mb-4">
        <input type="checkbox" checked={f.invoice_ready} onChange={(e) => { const v = e.target.checked; setF((p) => ({ ...p, invoice_ready: v })); save({ ...f, invoice_ready: v }) }} />
        {T.onboarding.invoice}
      </label>
      <Field label={T.onboarding.rider}>
        <input type="file" onChange={onRider} className="text-sm text-muted" />
        {uploading && <Spinner />}
        {f.rider_url && <p className="mt-1 text-xs text-ok">{T.common.saved}</p>}
      </Field>
      <Field label={T.onboarding.whatsapp} hint={T.onboarding.whatsappHelp}>
        <input className="field" dir="ltr" type="tel" value={f.whatsapp_number} onChange={set('whatsapp_number')} placeholder="0523456789" />
      </Field>
    </div>
  )
}

/* ── Step 6: review + publish ── */
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
    <div className="card text-center">
      <h2 className="text-lg font-bold text-soft mb-2">{T.onboarding.step6Title}</h2>
      <p className="text-muted mb-4">{artist.stage_name || T.onboarding.theArtist} · {artist.genre} · {items.length} {T.onboarding.items}</p>
      {artist.photo_url && <img src={artist.photo_url} alt="" className="mx-auto mb-4 h-32 w-32 rounded-full object-cover" />}
      {needConsent ? (
        <div className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-start">
          <p className="font-bold text-soft mb-1">{T.consent.publishTitle}</p>
          <p className="text-sm text-muted mb-4">{T.consent.publishBody}</p>
          <div className="flex flex-col gap-2">
            <button className="btn-primary" onClick={agreeAndPublish} disabled={busy}>{busy ? <Spinner /> : T.consent.publishAgree}</button>
            <button className="btn-ghost" onClick={() => setNeedConsent(false)} disabled={busy}>{T.common.cancel}</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button className="btn-primary" onClick={publish} disabled={busy}>{busy ? <Spinner /> : T.onboarding.publish}</button>
          <button className="btn-ghost" onClick={() => nav('/artist/home')} disabled={busy}>{T.onboarding.backToEdit}</button>
        </div>
      )}
    </div>
  )
}
