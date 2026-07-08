import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateClaim, updateAct, addProfileItem } from '../../lib/db.js'
import { uploadFile } from '../../lib/storage.js'
import { BottomSheet, Spinner, GpIcon, PlatformMark, platformOf } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { PLANETS, NODE, buildUniverse, deriveWorlds, bandFromCount } from '../../lib/radarUniverse.js'

// ── The Radar Universe — "Live Intelligence" (warm cinematic night) ──────────
// Full-canvas dark universe. The artist's PHOTO is the center (gold aura, serif
// name); 6 planets orbit on thin rings with bounded state colors
// (accent = established · teal = developing · amber = needs you).
// FLATTENED: tapping a planet opens ONE panel — every source row carries an
// inline one-tap Confirm and an inline "what does it prove?" expander. There is
// never a second modal above the panel.
// FIREWALL: no numbers, no fills, no position, no peer comparison. Ever.

const RING = {
  established: 'border-accent/70',
  developing: 'border-teal/60',
  needs: 'border-amber/70',
}
const NODE_CHIP = {
  [NODE.CONFIRMED]: { icon: '✓', c: 'bg-[rgba(190,226,78,0.12)] text-[#CBEE72]' },
  [NODE.FOUND]: { icon: '✦', c: 'bg-accent text-[#12160A]' },
  [NODE.REVIEW]: { icon: '?', c: 'bg-[rgba(227,154,75,0.15)] text-[#F0B478]' },
  [NODE.MISSING]: { icon: '+', c: 'bg-white/[0.06] text-[#9AA29B]' },
}

export default function RadarUniverse({ artist, items, claims, onClaimsChange, nextAction, onNextAction, onArtistChange, onItemsRefresh }) {
  const { T } = useLang()
  const S = T.radar.universe
  const nav = useNavigate()
  const [selected, setSelected] = useState(null)       // planet key → opens the ONE panel
  const [filter, setFilter] = useState('needsYou')
  const [world, setWorld] = useState(null)             // world tag filter (null = all)
  const [confirming, setConfirming] = useState(null)   // node id mid-confirm
  const [bulkBusy, setBulkBusy] = useState(false)
  const [undo, setUndo] = useState(null)
  const [savedFlash, setSavedFlash] = useState(false)
  const undoRef = useRef(null)
  const flashRef = useRef(null)

  function flashSaved() {
    clearTimeout(flashRef.current)
    setSavedFlash(true)
    flashRef.current = setTimeout(() => setSavedFlash(false), 2500)
  }

  const uni = useMemo(() => buildUniverse({ artist, items, claims, T }), [artist, items, claims, T])
  const worlds = useMemo(() => deriveWorlds({ artist, items }), [artist, items])
  const evidenceRoute = `/evidence/${artist.id}`

  // lock body scroll while the planet panel is open (mobile flawlessness)
  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selected])

  // Three calm lenses: All · Needs you · Ready (bounded words, never counts)
  const FILTERS = [
    { key: 'all', label: S.filters.all },
    { key: 'needsYou', label: S.filters.needsYou },
    { key: 'ready', label: 'Ready' },
  ]
  const matchesFilter = (n) =>
    (filter === 'all' ? true :
      filter === 'needsYou' ? (n.state === NODE.FOUND || n.state === NODE.REVIEW || n.state === NODE.MISSING) :
      n.state === NODE.CONFIRMED) &&
    (!world || (n.worlds || []).includes(world))

  const blossom = claims.length === 0 && items.filter((i) => i.item_type === 'link').length === 0

  async function confirm(node) {
    if (!node?.claim || confirming) return
    const c = node.claim
    setConfirming(node.id)
    try {
      await updateClaim(c.id, { artist_approved: true })
      onClaimsChange((prev) => prev.map((x) => x.id === c.id ? { ...x, artist_approved: true } : x))
      clearTimeout(undoRef.current)
      setUndo({ claim: c })
      undoRef.current = setTimeout(() => setUndo(null), 6000)
    } finally { setConfirming(null) }
  }
  async function undoConfirm() {
    if (!undo) return
    clearTimeout(undoRef.current)
    await updateClaim(undo.claim.id, { artist_approved: false })
    onClaimsChange((prev) => prev.map((x) => x.id === undo.claim.id ? { ...x, artist_approved: false } : x))
    setUndo(null)
  }
  const pauseUndo = () => clearTimeout(undoRef.current)
  const resumeUndo = () => { if (undo) undoRef.current = setTimeout(() => setUndo(null), 3000) }

  const sel = selected ? uni.planets[selected] : null
  const batchable = sel ? sel.nodes.filter((n) => n.state === NODE.FOUND && n.claim) : []

  // Confirm every found signal in this planet — inline, no extra sheet.
  async function confirmAll() {
    if (!batchable.length || bulkBusy) return
    setBulkBusy(true)
    try {
      for (const n of batchable) await updateClaim(n.claim.id, { artist_approved: true })
      const ids = new Set(batchable.map((n) => n.claim.id))
      onClaimsChange((prev) => prev.map((x) => ids.has(x.id) ? { ...x, artist_approved: true } : x))
      flashSaved()
    } finally { setBulkBusy(false) }
  }

  function goEvidence() {
    setSelected(null)
    nav(evidenceRoute)
  }

  // The panel shows the planet's FULL picture — actionable first.
  const STATE_ORDER = { [NODE.FOUND]: 0, [NODE.REVIEW]: 1, [NODE.MISSING]: 2, [NODE.CONFIRMED]: 3 }
  const panelNodes = sel ? [...sel.nodes].sort((a, b) => STATE_ORDER[a.state] - STATE_ORDER[b.state]) : []

  return (
    <div className="relative mb-5 overflow-hidden rounded-3xl border border-white/[0.06] bg-bg2 p-4 sm:p-5">
      {/* one warm light — the backstage lamp above the universe */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 h-64"
        style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(242,192,99,0.16), transparent 70%)' }} />

      {/* ONE control row: state lenses + worlds dropdown */}
      <div className="relative mb-3 flex items-center gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="radar filters">
        {FILTERS.map((f) => (
          <button key={f.key} role="tab" aria-selected={filter === f.key} onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors ${
              filter === f.key ? 'bg-accent text-[#12160A]' : 'bg-white/5 text-muted hover:bg-white/10'
            }`}>
            {f.label}
          </button>
        ))}
        {worlds.length > 0 && (
          <select
            value={world || ''}
            onChange={(e) => setWorld(e.target.value || null)}
            aria-label={S.worldsHint}
            className={`ms-auto shrink-0 appearance-none rounded-full border bg-surface2 px-3 py-1 font-mono text-[10px] outline-none ${
              world ? 'border-accent text-accent' : 'border-white/15 text-faint'
            }`}>
            <option value="">{S.allWorlds}</option>
            {worlds.map((w) => <option key={w} value={w}>{w.toUpperCase()}</option>)}
          </select>
        )}
      </div>

      {blossom ? (
        <div className="relative py-10 text-center">
          <CenterStar artist={artist} T={T} dim />
          <h3 className="font-display mt-5 text-xl font-bold text-ink">{S.blossomTitle}</h3>
          <p className="mx-auto mt-1.5 max-w-[300px] text-xs leading-relaxed text-muted">{S.blossomBody}</p>
          <button className="btn-primary mt-4 text-xs px-4 py-2.5" onClick={() => nav(evidenceRoute)}>{S.blossomCta}</button>
        </div>
      ) : (
        /* ── THE UNIVERSE — always mounted, never reflows ── */
        <div className="relative mx-auto aspect-square max-w-[400px]">
          {/* thin orbit rings — white/8%, the quiet geometry of the night */}
          <div className="absolute inset-[9%] rounded-full border border-white/[0.08]" aria-hidden />
          <div className="absolute inset-[27%] rounded-full border border-white/[0.05]" aria-hidden />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <CenterStar artist={artist} T={T} />
          </div>
          {PLANETS.map((p) => {
            const info = uni.planets[p.key]
            const rad = (p.angle * Math.PI) / 180
            const x = 50 + 41 * Math.cos(rad)
            const y = 50 + 41 * Math.sin(rad)
            const dimmed = !info.nodes.some(matchesFilter) && (filter !== 'all' || world)
            const complete = info.state === 'established' && info.foundCount === 0 &&
              !info.nodes.some((n) => n.state === NODE.MISSING)
            return (
              <button key={p.key}
                onClick={() => setSelected(p.key)}
                style={{ left: `${x}%`, top: `${y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-300 ${dimmed ? 'opacity-25' : 'opacity-100'}`}
                aria-label={`${S.planets[p.key]} — ${S.state[info.state]}${complete ? ` · ${S.complete}` : ''}`}>
                <span className={`relative mx-auto grid h-14 w-14 place-items-center rounded-full border-2 bg-surface2 transition-transform hover:scale-105 ${RING[info.state]} ${info.foundCount > 0 ? 'shadow-[0_0_20px_rgba(190,226,78,0.25)]' : ''}`}>
                  <GpIcon id={p.icon} className="h-6 w-6 text-ink" />
                  {info.foundCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-accent font-mono text-[9px] font-bold text-[#12160A]">✦</span>
                  )}
                  {/* accomplishment — deliberately quiet: a small settled ✓, no glow, no animation */}
                  {complete && (
                    <span aria-hidden className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-[rgba(190,226,78,0.18)] text-[8px] text-[#CBEE72] ring-1 ring-bg2">✓</span>
                  )}
                </span>
                <span className="mt-1.5 block w-20 font-mono text-[8px] uppercase tracking-[0.08em] text-faint leading-tight">
                  {S.planets[p.key]}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── ONE next move — folded INTO the canvas (1-screen mobile) ── */}
      {!blossom && nextAction && (
        <div className="relative mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
          <div className="min-w-0">
            <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-faint">{T.radar.nextActionEyebrow}</p>
            <p className="truncate text-sm font-semibold text-ink">{nextAction.title}</p>
          </div>
          {nextAction.to && (
            <button className="btn-primary shrink-0 px-3 py-2 text-xs" onClick={() => onNextAction?.(nextAction)}>
              {T.common.continue}
            </button>
          )}
        </div>
      )}

      {/* undo toast — floats above everything, dark green card + lime dot */}
      {undo && (
        <div role="status" tabIndex={0} onMouseEnter={pauseUndo} onMouseLeave={resumeUndo} onFocus={pauseUndo} onBlur={resumeUndo}
          className="fixed inset-x-4 bottom-4 z-[70] mx-auto flex max-w-sm items-center justify-between gap-3 rounded-xl border border-accent/30 bg-[#141B12] px-3.5 py-2.5 text-xs font-semibold text-ink shadow-[0_24px_60px_-24px_rgba(0,0,0,0.75)]">
          <span className="flex min-w-0 items-center gap-2">
            <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-accent" />
            <span className="truncate">{S.confirmedToast}</span>
          </span>
          <button className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-accent underline" onClick={undoConfirm}>
            {S.undo}
          </button>
        </div>
      )}

      {/* saved-in-place flash */}
      {savedFlash && (
        <div role="status" className="fixed inset-x-4 bottom-4 z-[70] mx-auto flex max-w-sm items-center gap-2 rounded-xl border border-accent/30 bg-[#141B12] px-3.5 py-2.5 text-xs font-semibold text-ink shadow-[0_24px_60px_-24px_rgba(0,0,0,0.75)]">
          <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
          {S.fill.savedInPlace}
        </div>
      )}

      {/* ── THE ONE PANEL — planet drill-in. Confirm + "what does it prove?"
            live INLINE on every row. No second modal, ever. ── */}
      <BottomSheet open={!!selected} onClose={() => setSelected(null)} title={selected ? S.planets[selected] : ''}>
        {sel && (
          <div className="max-h-[65vh] overflow-y-auto pe-0.5">
            {batchable.length >= 2 && (
              <button className="btn-primary mb-3 w-full py-2.5 text-xs" onClick={confirmAll} disabled={bulkBusy}>
                {bulkBusy ? <Spinner /> : <>✦ {S.reviewAll(batchable.length)}</>}
              </button>
            )}
            <div className="space-y-2">
              {panelNodes.map((n) => (
                <PlanetRow key={n.id} node={n} planet={selected} S={S}
                  busy={confirming === n.id}
                  onConfirm={() => confirm(n)}
                  onEvidence={goEvidence}
                  artist={artist}
                  onArtistChange={onArtistChange}
                  onItemsRefresh={onItemsRefresh}
                  onSaved={flashSaved} />
              ))}
              {panelNodes.length === 0 && (
                <p className="py-6 text-center font-mono text-[10px] text-muted">—</p>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}

// ── One source row inside the planet panel ────────────────────────────────────
// Row = source · state chip · inline one-tap Confirm · inline "what does it
// prove?" expander. A missing-but-fillable node expands its tiny form RIGHT
// HERE — the panel never opens anything above itself.
function PlanetRow({ node: n, planet, S, busy, onConfirm, onEvidence, artist, onArtistChange, onItemsRefresh, onSaved }) {
  const [open, setOpen] = useState(false)
  const chip = NODE_CHIP[n.state]
  const actionable = n.state === NODE.FOUND || n.state === NODE.REVIEW

  return (
    <div className={`rounded-xl border border-white/[0.08] bg-surface2 px-3 py-3 transition ${busy ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        {n.url
          ? <PlatformMark platform={platformOf(n.url)} />
          : <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.06] text-muted"><GpIcon id={PLANETS.find((p) => p.key === planet)?.icon || 'gp-source'} className="h-4 w-4" /></span>}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">{n.label}</span>
          <span className="block truncate text-[11px] text-muted">{n.sub}</span>
        </span>
        <span className={`chip shrink-0 text-[10px] ${chip.c}`}>{chip.icon}</span>
      </div>

      {/* inline action line — one tap, right here */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {actionable && (
          <button className="btn-primary px-3 py-1.5 text-xs" onClick={onConfirm} disabled={busy}>
            {busy ? <Spinner /> : <>✦ {S.confirmCta}</>}
          </button>
        )}
        {n.state === NODE.MISSING && !n.fill && n.evidence && (
          <button className="btn-primary px-3 py-1.5 text-xs" onClick={onEvidence}>{S.fill.openEvidence}</button>
        )}
        <button
          className="min-h-[36px] font-mono text-[10px] uppercase tracking-[0.08em] text-gold/80 hover:text-gold"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}>
          {S.whatItProves} {open ? '▴' : '▾'}
        </button>
      </div>

      {/* inline expander — honesty text + (for fillable gaps) the form itself */}
      {open && (
        <div className="mt-2 border-t border-white/[0.08] pt-2">
          <p className="label">{S.whatItProves}</p>
          <p className="mb-2 text-sm text-ink/90">{n.proves}</p>
          <p className="label">{S.whatItDoesNotProve}</p>
          <p className="mb-2 text-sm text-muted">{n.notProves}</p>
          {n.state === NODE.MISSING && n.fill && (
            <MissingFill
              node={n} artist={artist} S={S}
              onArtistChange={onArtistChange}
              onItemsRefresh={onItemsRefresh}
              onDone={() => { setOpen(false); onSaved() }}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ── MissingFill — the in-place fill form inside the row expander ─────────────
// One node = one tiny form. Saving updates the data and the node flips to ✓
// without ever leaving the panel. (Ticket exports stay in the evidence flow —
// they carry the third-party consent gate.)
function MissingFill({ node, artist, S, onArtistChange, onItemsRefresh, onDone }) {
  const { kind, field, max, placeholder } = node.fill
  const [v, setV] = useState('')
  const [v2, setV2] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function run(fn) {
    setBusy(true); setErr('')
    try { await fn(); onDone() }
    catch (e) { setErr(e.message || 'error') }
    finally { setBusy(false) }
  }

  const saveArtist = (patch) => run(async () => { await onArtistChange(patch) })

  async function onPhotoFile(e) {
    const file = e.target.files?.[0]; if (!file) return
    run(async () => {
      const { url } = await uploadFile('public-media', artist.created_by || artist.id, file)
      await onArtistChange({ photo_url: url })
    })
  }

  return (
    <div className="space-y-2">
      {kind === 'boolean' && (
        <button className="btn-primary w-full" disabled={busy} onClick={() => saveArtist({ [field]: true })}>
          {busy ? <Spinner /> : S.fill.invoiceYes}
        </button>
      )}

      {(kind === 'text' || kind === 'url') && (
        <>
          <input className="field" dir={kind === 'url' ? 'ltr' : undefined} maxLength={max}
            placeholder={kind === 'url' ? S.fill.urlPlaceholder : (placeholder || node.label)}
            value={v} onChange={(e) => setV(e.target.value)} />
          <button className="btn-primary w-full" disabled={busy || !v.trim()} onClick={() => saveArtist({ [field]: v.trim() })}>
            {busy ? <Spinner /> : S.fill.save}
          </button>
        </>
      )}

      {kind === 'photo' && (
        <>
          <input type="file" accept="image/*" onChange={onPhotoFile} className="text-sm text-muted" />
          <p className="text-[11px] text-muted">{S.fill.photoOr}</p>
          <input className="field" dir="ltr" placeholder={S.fill.urlPlaceholder} value={v} onChange={(e) => setV(e.target.value)} />
          {v.trim() && (
            <button className="btn-primary w-full" disabled={busy} onClick={() => saveArtist({ photo_url: v.trim() })}>
              {busy ? <Spinner /> : S.fill.save}
            </button>
          )}
        </>
      )}

      {kind === 'number' && (
        <>
          <input className="field" type="number" min="1" inputMode="numeric"
            placeholder={S.fill.numberPlaceholder} value={v} onChange={(e) => setV(e.target.value)} />
          <button className="btn-primary w-full" disabled={busy || !(parseInt(v, 10) > 0)}
            onClick={() => run(async () => {
              const n = parseInt(v, 10)
              await updateAct(artist.id, { community_count_declared: n }) // integer stays working-only
              await onArtistChange({ community_size_band: bandFromCount(n) }) // only the band goes anywhere
            })}>
            {busy ? <Spinner /> : S.fill.save}
          </button>
        </>
      )}

      {kind === 'event' && (
        <>
          <input className="field" placeholder={S.fill.eventTitle} value={v} onChange={(e) => setV(e.target.value)} />
          <input className="field" type="date" aria-label={S.fill.eventDate} value={v2} onChange={(e) => setV2(e.target.value)} />
          <button className="btn-primary w-full" disabled={busy || !v.trim()}
            onClick={() => run(async () => {
              await addProfileItem({ artist_id: artist.id, item_type: 'event', title: v.trim(), item_date: v2 || null, visibility: 'passport-ok', source_status: 'artist-provided' })
              await onItemsRefresh?.()
            })}>
            {busy ? <Spinner /> : S.fill.save}
          </button>
        </>
      )}

      {kind === 'link' && (
        <>
          <input className="field" dir="ltr" placeholder={S.fill.urlPlaceholder} value={v} onChange={(e) => setV(e.target.value)} />
          <button className="btn-primary w-full" disabled={busy || !/^https?:\/\//i.test(v.trim())}
            onClick={() => run(async () => {
              await addProfileItem({ artist_id: artist.id, item_type: 'link', title: 'link', public_url: v.trim(), visibility: 'passport-ok', source_status: 'artist-provided' })
              await onItemsRefresh?.()
            })}>
            {busy ? <Spinner /> : S.fill.save}
          </button>
        </>
      )}

      {err && <p className="text-xs text-amber" role="alert">{err}</p>}
    </div>
  )
}

function CenterStar({ artist, T, dim }) {
  // The artist IS the center of the universe — photo first, in a warm gold aura.
  return (
    <div className={`text-center transition-opacity ${dim ? 'opacity-50' : ''}`}>
      {artist.photo_url
        ? <img src={artist.photo_url} alt="" className="mx-auto h-20 w-20 rounded-full border-2 border-gold object-cover shadow-[0_0_34px_rgba(242,192,99,0.35)]" />
        : <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-gold bg-surface2 font-display text-xl text-ink shadow-[0_0_34px_rgba(242,192,99,0.25)]">
            {(artist.stage_name || '★').slice(0, 1)}
          </span>}
      <span className="font-display mt-2 block text-sm font-bold tracking-[-0.01em] text-ink">
        {artist.stage_name || T.radar.universe.you}
      </span>
    </div>
  )
}
