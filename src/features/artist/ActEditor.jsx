import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { getMyArtist, upsertArtist } from '../../lib/db.js'
import { PageShell, Field, ErrorNote, Spinner } from '../../components/ui.jsx'
import { GENRES, MAX_ACT_GENRES } from '../../lib/constants.js'

// ── Act-Identity Editor (spec §8.6 / §17.A.10) — resolves D1: the artist's
// identity (stage_name / one_line / genre / city / photo) was set once at
// onboarding with no way to re-edit it. Every field is an inline-edit row that
// saves ONE field at a time (§17.A.10 field-level save), with the full state set:
// display → editing → saving → saved(+undo) → error. Firewall-safe: pure
// identity text, no score/rank/band anywhere on this surface.

// The editable identity fields, in reading order. All live on `artists` and are
// passport-ok (public), so each carries the "buyers see this" note.
const FIELDS = [
  { key: 'stage_name', max: 80 },
  { key: 'one_line', max: 120 },
  { key: 'genre', max: 60, type: 'genres' },
  { key: 'city', max: 60 },
  { key: 'photo_url', max: 400, type: 'url' },
]

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
  useEffect(() => { if (mode === 'editing') inputRef.current?.focus() }, [mode])

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
              {shown || f.empty}
            </p>
          )}

          {mode === 'editing' && (
            <div className="mt-2">
              <Field hint={hint}>
                {type === 'genres' ? (
                  <GenrePicker value={draft} onChange={setDraft} T={T} />
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
          <button type="button" className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-[0.07em] text-accent hover:underline" onClick={begin}>
            {f.edit}
          </button>
        )}
        {mode === 'saving' && <Spinner className="mt-1 shrink-0" />}
      </div>

      {mode === 'saved' && (
        <p className="mt-2 flex items-center gap-3 text-xs text-accent">
          <span>✓ {f.saved}</span>
          <button type="button" className="underline" onClick={undo}>{f.undo}</button>
        </p>
      )}
      {mode === 'error' && (
        <p className="mt-2 flex items-center gap-3 text-xs text-need">
          <span>{f.error}</span>
          <button type="button" className="underline" onClick={() => commit()}>{f.save}</button>
        </p>
      )}
    </div>
  )
}

export default function ActEditor() {
  const { user } = useAuth()
  const { T } = useLang()
  const f = T.actEditor
  const [artist, setArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadErr, setLoadErr] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const a = await getMyArtist(user.id)
        setArtist(a || {})
      } catch (e) { setLoadErr(e.message) }
      finally { setLoading(false) }
    })()
  }, [user.id])

  // Field-level save (§17.A.10). Persists ONE field, keeps the id, and updates
  // local state so the row reflects the saved value without a full reload.
  async function saveField(key, val) {
    const patch = { id: artist.id, created_by: user.id, [key]: val || null }
    const saved = await upsertArtist(patch)
    setArtist((cur) => ({ ...cur, ...saved, [key]: val || null }))
  }

  if (loading) return <PageShell><div className="mt-16 flex justify-center"><Spinner /></div></PageShell>

  return (
    <PageShell>
      <div className="mt-2">
        <Link to="/artist/home" className="font-mono text-[11px] uppercase tracking-[0.07em] text-muted hover:text-ink">← {f.backToRadar}</Link>
      </div>
      <h1 className="mt-4 font-display text-2xl text-ink">{f.title}</h1>
      <p className="mt-1 text-sm text-muted">{f.intro}</p>

      {loadErr && <div className="mt-4"><ErrorNote>{loadErr}</ErrorNote></div>}

      <div className="card mt-5">
        {FIELDS.map((fl) => (
          <InlineEditRow
            key={fl.key}
            fieldKey={fl.key}
            type={fl.type || 'text'}
            max={fl.max}
            value={artist?.[fl.key] || ''}
            onSave={saveField}
            T={T}
          />
        ))}
      </div>
    </PageShell>
  )
}
