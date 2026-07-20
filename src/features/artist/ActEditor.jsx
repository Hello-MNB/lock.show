import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { getMyArtist, upsertArtist, getMyAct, updateAct, listActs, createAct } from '../../lib/db.js'
import { PageShell, Field, ErrorNote, Spinner } from '../../components/ui.jsx'
import { GENRES, MAX_ACT_GENRES } from '../../lib/constants.js'

// ── Act-Identity Editor (spec §8.6 / §17.A.10) — resolves D1: the artist's
// identity (stage_name / one_line / genre / city / photo) was set once at
// onboarding with no way to re-edit it. Every field is an inline-edit row that
// saves ONE field at a time (§17.A.10 field-level save), with the full state set:
// display → editing → saving → saved(+undo) → error. Firewall-safe: pure
// identity text, no score/rank/band anywhere on this surface.
//
// MULTI-ACT (T-A5, 20 Jul, §MULTI-ACT/§8.6): the spec's Act chips row (current
// Act + "＋ Second act") was built at the Radar's center-star (RadarUniverse.jsx)
// but never here, even though §8.6 explicitly calls for it on THIS screen too.
// Added below, reusing the exact same data calls (listActs/createAct) and the
// SAME localStorage key (`gigproof_active_act`) the Radar reads, so picking an
// Act here and picking one on the Radar stay the ONE shared selection — never
// two disagreeing "current Act" states. A non-default Act has no `artists` row
// (real-DB depth gap, documented in db.js/switchAct) — its identity fields live
// on `act.*` only (one_line → act.positioning) — see identityValue/saveField.

// The editable identity fields, in reading order. stage_name/one_line/genre/
// city/photo_url are passport-ok (public) on both the default Act (artists row,
// mirrored to act.* on save — db.js upsertArtist) and a non-default Act (act.*
// directly). `format` lives ONLY on `act.*` — never on `artists` — regardless
// of which Act is active (genreWeights.js familyFor's bounded vocabulary).
const FIELDS = [
  { key: 'stage_name', max: 80 },
  { key: 'one_line', max: 120, type: 'textarea' },
  { key: 'genre', max: 60, type: 'genres' },
  { key: 'format', type: 'format' },
  { key: 'city', max: 60 },
  { key: 'photo_url', max: 400, type: 'url' },
]

const FORMAT_VALUES = ['dj-set', 'live-set', 'duo', 'band', 'open-format', 'vocalist', 'other']

// ── Genre chip picker (owner directive 17 Jul: dropdown, not free text, and the
// SAME vocabulary as the Radar scene rail — constants.GENRES feeds both).
// Stored comma-joined on artists.genre (existing text column). Up to
// MAX_ACT_GENRES picks, first pick = the primary scene. A legacy free-text
// value that isn't in the canon list is preserved as its own removable chip —
// never silently discarded.
function GenrePicker({ value, onChange, T }) {
  const f = T.actEditor
  const chosen = value ? value.split(',').map((s) => s.trim()).filter(Boolean) : []
  const isOn = (g) => chosen.some((c) => c.toLowerCase() === g.toLowerCase())
  const custom = chosen.filter((c) => !GENRES.some((g) => g.toLowerCase() === c.toLowerCase()))
  function toggle(g) {
    const next = isOn(g)
      ? chosen.filter((c) => c.toLowerCase() !== g.toLowerCase())
      : chosen.length < MAX_ACT_GENRES ? [...chosen, g] : chosen
    onChange(next.join(', '))
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={f.fields.genre}>
        {GENRES.map((g) => (
          <button key={g} type="button" onClick={() => toggle(g)} aria-pressed={isOn(g)}
            disabled={!isOn(g) && chosen.length >= MAX_ACT_GENRES}
            className={`min-h-[44px] rounded-full border px-4 font-mono text-[11px] transition-colors ${
              isOn(g)
                ? 'border-accent/60 bg-accent/12 font-bold text-accent'
                : 'border-line2 bg-surface2 text-ink/85 hover:bg-raise disabled:opacity-40'
            }`}>
            {isOn(g) && '✓ '}{g}
          </button>
        ))}
        {custom.map((c) => (
          <button key={c} type="button" onClick={() => toggle(c)} aria-pressed
            className="min-h-[44px] rounded-full border border-gold/50 bg-gold/10 px-4 font-mono text-[11px] font-bold text-gold">
            ✓ {c}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted">
        {chosen.length >= MAX_ACT_GENRES ? f.genreMax : f.genrePickHint}
      </p>
    </div>
  )
}

// ── Format picker (single-select chips, same visual grammar as GenrePicker) —
// bounded vocabulary genreWeights.familyFor reads (§8.2 family table). No
// signal → no chip lit → the G2 guard already used by the Radar's ★ emphasis
// stays untouched (an unset format never invents a guessed family).
function FormatPicker({ value, onChange, T }) {
  const f = T.actEditor
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={f.fields.format}>
      {FORMAT_VALUES.map((v) => (
        <button key={v} type="button" role="radio" aria-checked={value === v}
          onClick={() => onChange(value === v ? '' : v)}
          className={`min-h-[44px] rounded-full border px-4 font-mono text-[11px] transition-colors ${
            value === v
              ? 'border-accent/60 bg-accent/12 font-bold text-accent'
              : 'border-line2 bg-surface2 text-ink/85 hover:bg-raise'
          }`}>
          {value === v && '✓ '}{f.formatOptions[v]}
        </button>
      ))}
    </div>
  )
}

function InlineEditRow({ fieldKey, type = 'text', max, value, onSave, T }) {
  const f = T.actEditor
  const label = f.fields[fieldKey]
  const hint = f.fields[`${fieldKey}Hint`]
  const [mode, setMode] = useState('display') // display | editing | saving | saved | error
  const [draft, setDraft] = useState(value || '')
  const [prev, setPrev] = useState(value || '')  // for undo
  const inputRef = useRef(null)
  const savedTimer = useRef(null)

  useEffect(() => () => clearTimeout(savedTimer.current), [])
  useEffect(() => { if (mode === 'editing' && (type === 'text' || type === 'url' || type === 'textarea')) inputRef.current?.focus() }, [mode, type])
  // The active Act can change out from under an open row (chip switch) — reset
  // to the freshly-loaded value rather than silently keep editing stale text.
  useEffect(() => { if (mode === 'display') { setDraft(value || ''); setPrev(value || '') } }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  function begin() { setDraft(value || ''); setPrev(value || ''); setMode('editing') }
  function cancel() { setDraft(value || ''); setMode('display') }

  async function commit(next) {
    const clean = (next ?? draft).trim()
    if (clean === (value || '').trim()) { setMode('display'); return }
    setMode('saving')
    try {
      await onSave(fieldKey, clean)
      setMode('saved')
      clearTimeout(savedTimer.current)
      savedTimer.current = setTimeout(() => setMode('display'), 3500)
    } catch {
      setMode('error')
    }
  }

  async function undo() {
    setMode('saving')
    try { await onSave(fieldKey, prev); setMode('display') }
    catch { setMode('error') }
  }

  const shown = value?.trim() ? value : null
  const formatShown = type === 'format' && shown ? (f.formatOptions[shown] || shown) : shown

  return (
    <div className="border-b border-line py-4 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-ink">{label}</span>
            <span className="rounded-full bg-accent/12 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.07em] text-accent">{f.publicNote}</span>
          </div>

          {mode !== 'editing' && (
            <p className={`mt-1 break-words text-sm ${shown ? 'text-ink' : 'italic text-faint'}`}>
              {formatShown || f.empty}
            </p>
          )}

          {mode === 'editing' && (
            <div className="mt-2">
              <Field hint={hint}>
                {type === 'genres' ? (
                  <GenrePicker value={draft} onChange={setDraft} T={T} />
                ) : type === 'format' ? (
                  <FormatPicker value={draft} onChange={setDraft} T={T} />
                ) : type === 'textarea' ? (
                  <>
                    <textarea
                      ref={inputRef}
                      maxLength={max}
                      rows={2}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Escape') cancel() }}
                      className="field w-full resize-none"
                    />
                    {/* live char counter (§8.6 DoD: "120-char, live counter") */}
                    <p className={`mt-1 text-end font-mono text-[10px] ${draft.length >= max ? 'text-amber' : 'text-faint'}`}>
                      {draft.length}/{max}
                    </p>
                  </>
                ) : (
                  <input
                    ref={inputRef}
                    type={type}
                    maxLength={max}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel() }}
                    dir={type === 'url' ? 'ltr' : undefined}
                    className="field w-full"
                  />
                )}
              </Field>
              <div className="mt-2 flex gap-2">
                <button type="button" className="btn-primary" onClick={() => commit()}>{f.save}</button>
                <button type="button" className="btn-ghost" onClick={cancel}>{f.cancel}</button>
              </div>
            </div>
          )}
        </div>

        {mode === 'display' && (
          <button type="button" className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center font-mono text-[11px] font-bold uppercase tracking-[0.07em] text-accent hover:underline" onClick={begin}>
            {f.edit}
          </button>
        )}
        {mode === 'saving' && <Spinner className="mt-1 shrink-0" />}
      </div>

      {mode === 'saved' && (
        <p className="mt-2 flex items-center gap-3 text-xs text-accent">
          <span>✓ {f.saved}</span>
          <button type="button" className="tap-target underline" onClick={undo}>{f.undo}</button>
        </p>
      )}
      {mode === 'error' && (
        <p className="mt-2 flex items-center gap-3 text-xs text-need">
          <span>{f.error}</span>
          <button type="button" className="tap-target underline" onClick={() => commit()}>{f.save}</button>
        </p>
      )}
    </div>
  )
}

// Identity fields shared by the artists row and the Act row — mirrors db.js's
// own ACT_IDENTITY_FIELDS map (kept local: this screen must read/write it in
// BOTH directions, db.js's copy only ever writes artists → act one-way).
const ACT_IDENTITY_COLS = { stage_name: 'stage_name', city: 'city', photo_url: 'photo_url', genre: 'genre', one_line: 'positioning' }

// ── Act chips row (§8.6 "Act chips (current Act + '＋ Second act')") — the
// SAME switch/create mechanics as the Radar's center-star (RadarUniverse.jsx),
// deliberately NOT re-implemented as a fork: same localStorage key, same
// listActs/createAct calls, so the "current Act" here and on the Radar are
// ALWAYS the one shared selection, never two independent memories of it.
function ActChips({ acts, activeActId, onPick, T, busy }) {
  const f = T.actEditor
  const S = T.radar.actSwitch
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [err, setErr] = useState('')

  async function submit(e) {
    e?.preventDefault?.()
    const clean = name.trim()
    if (!clean) return
    setErr('')
    try {
      await onPick.create(clean)
      setName('')
      setAdding(false)
    } catch (e2) {
      setErr(e2?.message === 'demo' ? S.newActDemo : (e2?.message || T.common.error))
    }
  }

  return (
    <div className="mb-4">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">{f.actsLabel}</p>
      <div className="flex flex-wrap items-center gap-2">
        {acts.map((a) => (
          <button key={a.id} type="button" onClick={() => onPick.switch(a.id, a)} disabled={busy}
            aria-pressed={activeActId === a.id}
            className={`tap-target rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-semibold transition-colors ${
              activeActId === a.id
                ? 'border-accent/60 bg-accent/12 text-accent'
                : 'border-line2 bg-surface2 text-ink/85 hover:bg-raise'
            }`}>
            {activeActId === a.id && '✓ '}{a.stage_name || f.untitledAct}
          </button>
        ))}
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} disabled={busy}
            className="tap-target rounded-full border border-dashed border-line2 px-3.5 py-1.5 font-mono text-[11px] font-semibold text-muted hover:border-accent/50 hover:text-accent">
            {S.newActCta}
          </button>
        )}
      </div>
      {adding && (
        <form onSubmit={submit} className="mt-2 flex flex-wrap items-center gap-2">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
            placeholder={S.newActNamePh} className="field min-w-[200px] flex-1" />
          <button type="submit" className="btn-primary min-h-[40px] px-3 py-1.5 text-xs" disabled={!name.trim() || busy}>{S.newActCreate}</button>
          <button type="button" className="btn-ghost min-h-[40px] px-3 py-1.5 text-xs" onClick={() => { setAdding(false); setErr('') }}>{T.common.cancel}</button>
          <p className="w-full text-[11px] text-muted">{err || S.newActHint}</p>
        </form>
      )}
    </div>
  )
}

export default function ActEditor() {
  const { user } = useAuth()
  const { T } = useLang()
  const f = T.actEditor
  const [artist, setArtist] = useState(null)
  const [act, setAct] = useState(null)
  const [acts, setActs] = useState([])
  const [activeActId, setActiveActId] = useState(null)
  const [actBusy, setActBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadErr, setLoadErr] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const a = await getMyArtist(user.id)
        setArtist(a || {})
        const initial = localStorage.getItem('gigproof_active_act') || a?.id
        setActiveActId(initial)
        const [rows, actRow] = await Promise.all([
          a?.id ? listActs(a.id) : Promise.resolve([]),
          initial ? getMyAct(initial) : Promise.resolve(null),
        ])
        setActs(rows || [])
        setAct(actRow)
      } catch (e) { setLoadErr(e.message) }
      finally { setLoading(false) }
    })()
  }, [user.id])

  const isDefaultAct = activeActId === artist?.id

  // Reads: the DEFAULT Act's identity is canonical on `artists` (existing
  // behaviour, unchanged); a NON-default Act's identity lives on `act.*` only
  // (real-DB depth gap, documented in db.js/switchAct — draw/kit fields stay
  // honestly absent for it, out of scope for this identity-only screen).
  function identityValue(key) {
    if (key === 'format') return act?.format || ''
    if (isDefaultAct) return artist?.[key] || ''
    const col = ACT_IDENTITY_COLS[key]
    return act?.[col] ?? ''
  }

  // Field-level save (§17.A.10). Persists ONE field, keeps the id, and updates
  // local state so the row reflects the saved value without a full reload.
  async function saveField(key, val) {
    if (key === 'format') {
      const saved = await updateAct(activeActId, { format: val || null })
      setAct((cur) => ({ ...cur, ...saved }))
      return
    }
    if (isDefaultAct) {
      const patch = { id: artist.id, created_by: user.id, [key]: val || null }
      const saved = await upsertArtist(patch)
      setArtist((cur) => ({ ...cur, ...saved, [key]: val || null }))
      // upsertArtist mirrors identity → the act row server-side (db.js T-63a);
      // mirror the SAME patch locally so a following format-tab read (which
      // hits `act` directly) doesn't show stale identity text.
      const col = ACT_IDENTITY_COLS[key]
      if (col) setAct((cur) => (cur ? { ...cur, [col]: val || null } : cur))
    } else {
      const col = ACT_IDENTITY_COLS[key]
      const saved = await updateAct(activeActId, { [col]: val || null })
      setAct((cur) => ({ ...cur, ...saved }))
      setActs((cur) => cur.map((a) => (a.id === activeActId ? { ...a, [col]: val || null } : a)))
    }
  }

  async function switchAct(id, actRow) {
    if (id === activeActId || actBusy) return
    setActBusy(true)
    try {
      const row = actRow || acts.find((a) => a.id === id) || await getMyAct(id)
      setAct(row)
      setActiveActId(id)
      localStorage.setItem('gigproof_active_act', id)
    } finally {
      setActBusy(false)
    }
  }

  async function createNewAct(name) {
    if (actBusy) return
    setActBusy(true)
    try {
      const row = await createAct(activeActId || artist.id, { stage_name: name })
      setActs((prev) => [...prev, row])
      await switchAct(row.id, row)
    } finally {
      setActBusy(false)
    }
  }

  if (loading) return <PageShell><div className="mt-16 flex justify-center"><Spinner /></div></PageShell>

  return (
    // W3-2 (§10.2 owner no-scroll law): bounded to the viewport — 100dvh minus
    // the AppShell chrome (56px sticky header, +64px bottom-nav padding under
    // md). Back link + title stay fixed; the field rows (which grow while
    // editing — genre chips, hints) scroll inside ONE internal area instead of
    // overflowing the page (W2 measured +94px @390).
    <div className="flex h-[calc(100dvh-7.5rem)] flex-col overflow-hidden px-4 pt-3 sm:px-8 md:h-[calc(100dvh-3.5rem)] md:pt-5">
      <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col animate-fade-in">
        <div className="shrink-0">
          <Link to="/artist/home" className="inline-flex min-h-[44px] items-center font-mono text-[11px] uppercase tracking-[0.07em] text-muted hover:text-ink">← {f.backToRadar}</Link>
          <h1 className="mt-1 font-display text-2xl text-ink">{f.title}</h1>
          <p className="mt-1 text-sm text-muted">{f.intro}</p>
          {loadErr && <div className="mt-4"><ErrorNote>{loadErr}</ErrorNote></div>}
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pb-4">
          {acts.length > 0 && (
            <ActChips acts={acts} activeActId={activeActId} busy={actBusy} T={T}
              onPick={{ switch: switchAct, create: createNewAct }} />
          )}

          <div className="card">
            {FIELDS.map((fl) => (
              <InlineEditRow
                key={`${activeActId}:${fl.key}`}
                fieldKey={fl.key}
                type={fl.type || 'text'}
                max={fl.max}
                value={identityValue(fl.key)}
                onSave={saveField}
                T={T}
              />
            ))}
          </div>

          {/* "Who can act for you" card (§8.6 layout) — links to the dedicated
              §8.5 Access screen rather than duplicating its content here. */}
          <Link to="/artist/access" className="card mt-4 block transition hover:bg-raise">
            <p className="text-sm font-semibold text-ink">{f.accessCardTitle}</p>
            <p className="mt-1 text-xs text-muted">{f.accessCardBody}</p>
            <p className="mt-2 font-mono text-[11px] font-bold uppercase tracking-[0.07em] text-accent">{f.accessCardCta} →</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
