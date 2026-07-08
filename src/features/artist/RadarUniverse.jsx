import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateClaim, updateAct, addProfileItem } from '../../lib/db.js'
import { uploadFile } from '../../lib/storage.js'
import { BottomSheet, Spinner, GpIcon, PlatformMark, platformOf } from '../../components/ui.jsx'
import { MethodLabel } from './proofBits.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { methodLabelFor, VISIBILITY } from '../../lib/constants.js'
import { PLANETS, NODE, buildUniverse, deriveWorlds, bandFromCount } from '../../lib/radarUniverse.js'

// ── The Radar Universe — "Live Intelligence" (warm cinematic night) ──────────
// The Radar IS evidence collection (IA correction): claim review / batch
// confirm live INSIDE this surface as panels — found-nodes and the "Needs you"
// lens open them; nothing here is a separate destination.
// RESTRAINT (owner round 2): neutral surfaces dominate; status colors appear
// only on dots, chips and thin rings (tint alpha ≤10%); gold = method labels +
// the ONE center aura; a single lime primary per view.
// EVIDENCE INTEGRITY (owner round 3): no abstract confirms — every confirm row
// shows the exact claim wording, its concrete source, and the honest
// proves/doesn't-prove line BEFORE the button; the button and the receipt name
// what was confirmed.
// FIREWALL: no numbers, no fills, no position, no peer comparison. Ever.

// Thin state rings — color is punctuation, not paragraph.
const RING = {
  established: 'border-accent/50',
  developing: 'border-teal/50',
  needs: 'border-amber/60',
}
// Bounded state chips — low-saturation tints (≤10% alpha), text does the work.
const NODE_CHIP = {
  [NODE.CONFIRMED]: { icon: '✓', c: 'bg-[rgba(190,226,78,0.10)] text-[#CBEE72]' },
  [NODE.FOUND]: { icon: '✦', c: 'bg-[rgba(242,192,99,0.10)] text-gold' },
  [NODE.REVIEW]: { icon: '?', c: 'bg-[rgba(227,154,75,0.10)] text-[#F0B478]' },
  [NODE.MISSING]: { icon: '+', c: 'bg-white/[0.05] text-[#9AA29B]' },
}

const hostOf = (u = '') => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' } }
const human = (s) => String(s || '').replace(/[-_]/g, ' ')

// The concrete, identifiable source reference for a claim — never just "a link".
// e.g. "numbered event listings #4–#21" (Selector), "IG bios + GO-OUT organizer listing".
function sourceRef(node) {
  const c = node.claim
  if (c?.reason_code) return String(c.reason_code)
  if (node.url) return hostOf(node.url)
  if (c?.source_type) return human(c.source_type)
  return ''
}

// Honest receipt destination: only verified/supporting + passport-ok claims
// actually reach the public Passport; everything else stays private.
function destinationOf(claim) {
  const publicBound = claim?.visibility === VISIBILITY.PASSPORT_OK &&
    ['verified', 'supporting'].includes(claim?.verification_status)
  return publicBound ? 'your Passport view' : 'your private record'
}

export default function RadarUniverse({ artist, items, claims, onClaimsChange, nextAction, onNextAction, onArtistChange, onItemsRefresh, reviewSignal = 0 }) {
  const { T } = useLang()
  const S = T.radar.universe
  const nav = useNavigate()
  const [selected, setSelected] = useState(null)       // planet key → opens the ONE panel
  const [review, setReview] = useState(false)          // "Needs you" batch-review mode (inside the radar)
  const [filter, setFilter] = useState('needsYou')
  const [world, setWorld] = useState(null)             // world tag filter (null = all)
  const [confirming, setConfirming] = useState(null)   // node id mid-confirm
  const [bulkBusy, setBulkBusy] = useState(false)
  const [undo, setUndo] = useState(null)               // { claim } → named receipt + undo
  const [flashMsg, setFlashMsg] = useState('')
  const undoRef = useRef(null)
  const flashRef = useRef(null)

  function flash(msg) {
    clearTimeout(flashRef.current)
    setFlashMsg(msg)
    flashRef.current = setTimeout(() => setFlashMsg(''), 3200)
  }

  const uni = useMemo(() => buildUniverse({ artist, items, claims, T }), [artist, items, claims, T])
  const worlds = useMemo(() => deriveWorlds({ artist, items }), [artist, items])
  const evidenceRoute = `/evidence/${artist.id}`

  // Every found/review node across all planets — the radar's review mode.
  const needsNodes = useMemo(() => {
    const out = []
    for (const p of PLANETS) {
      for (const n of uni.planets[p.key].nodes) {
        if (n.state === NODE.FOUND || n.state === NODE.REVIEW) out.push({ node: n, planet: p.key })
      }
    }
    return out
  }, [uni])
  const foundClaims = needsNodes.filter((x) => x.node.state === NODE.FOUND && x.node.claim)

  // The dashboard's Next-step card can open the review mode without leaving the radar.
  useEffect(() => { if (reviewSignal > 0) setReview(true) }, [reviewSignal])

  // lock body scroll while a panel is open (mobile flawlessness)
  useEffect(() => {
    const open = !!selected || review
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selected, review])

  // Three calm lenses: All · Needs you · Ready (bounded words)
  const FILTERS = [
    { key: 'all', label: S.filters.all },
    { key: 'needsYou', label: S.filters.needsYou, dot: foundClaims.length > 0 },
    { key: 'ready', label: 'Ready' },
  ]
  const matchesFilter = (n) =>
    (filter === 'all' ? true :
      filter === 'needsYou' ? (n.state === NODE.FOUND || n.state === NODE.REVIEW || n.state === NODE.MISSING) :
      n.state === NODE.CONFIRMED) &&
    (!world || (n.worlds || []).includes(world))

  function pickFilter(key) {
    setFilter(key)
    // The "Needs you" lens IS the review entry — found items open as a panel here.
    if (key === 'needsYou' && foundClaims.length > 0) setReview(true)
  }

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
      undoRef.current = setTimeout(() => setUndo(null), 7000)
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

  // Confirm a set of found claims — each row is fully shown above the button.
  async function confirmMany(nodesToConfirm) {
    const list = nodesToConfirm.filter((n) => n.claim)
    if (!list.length || bulkBusy) return
    setBulkBusy(true)
    try {
      for (const n of list) await updateClaim(n.claim.id, { artist_approved: true })
      const ids = new Set(list.map((n) => n.claim.id))
      onClaimsChange((prev) => prev.map((x) => ids.has(x.id) ? { ...x, artist_approved: true } : x))
      flash(`${list.length} claims confirmed — each added to ${destinationOf(list[0].claim)}`)
    } finally { setBulkBusy(false) }
  }

  function goEvidence() {
    setSelected(null); setReview(false)
    nav(evidenceRoute)
  }

  // Panels show the FULL picture — actionable first.
  const STATE_ORDER = { [NODE.FOUND]: 0, [NODE.REVIEW]: 1, [NODE.MISSING]: 2, [NODE.CONFIRMED]: 3 }
  const panelNodes = sel ? [...sel.nodes].sort((a, b) => STATE_ORDER[a.state] - STATE_ORDER[b.state]) : []

  const rowProps = {
    S, T,
    onEvidence: goEvidence,
    artist, onArtistChange, onItemsRefresh,
  }

  return (
    <div className="relative mb-5 overflow-hidden rounded-3xl border border-line bg-bg2 p-4 sm:p-5">
      {/* the ONE warm light — backstage lamp above the artist (gold budget: this + method labels) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 h-64"
        style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(242,192,99,0.12), transparent 70%)' }} />

      {/* ONE control row: state lenses + worlds dropdown */}
      <div className="relative mb-3 flex items-center gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="radar filters">
        {FILTERS.map((f) => (
          <button key={f.key} role="tab" aria-selected={filter === f.key} onClick={() => pickFilter(f.key)}
            className={`relative flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors ${
              filter === f.key ? 'border-line2 bg-white/[0.08] text-ink' : 'border-transparent bg-white/[0.04] text-muted hover:bg-white/[0.07]'
            }`}>
            {f.label}
            {/* found-items live here — a quiet gold dot on the Needs-you lens */}
            {f.dot && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold" />}
          </button>
        ))}
        {worlds.length > 0 && (
          <select
            value={world || ''}
            onChange={(e) => setWorld(e.target.value || null)}
            aria-label={S.worldsHint}
            className={`ms-auto shrink-0 appearance-none rounded-full border bg-surface2 px-3 py-1 font-mono text-[10px] outline-none ${
              world ? 'border-line2 text-ink' : 'border-line text-faint'
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
          <button className="btn-primary mt-4 px-4 py-2.5 text-xs" onClick={() => nav(evidenceRoute)}>{S.blossomCta}</button>
        </div>
      ) : (
        /* ── THE UNIVERSE — always mounted, never reflows ── */
        <div className="relative mx-auto aspect-square max-w-[400px]">
          {/* thin orbit rings — the quiet geometry of the night */}
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
                <span className={`relative mx-auto grid h-14 w-14 place-items-center rounded-full border bg-surface2 transition-transform hover:scale-105 ${RING[info.state]} ${info.foundCount > 0 ? 'shadow-[0_0_16px_rgba(242,192,99,0.14)]' : ''}`}>
                  <GpIcon id={p.icon} className="h-6 w-6 text-ink/90" />
                  {/* found — a small gold dot, not a badge shouting */}
                  {info.foundCount > 0 && (
                    <span aria-hidden className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-bg2" />
                  )}
                  {/* accomplishment — deliberately quiet: a small settled ✓ */}
                  {complete && (
                    <span aria-hidden className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-[rgba(190,226,78,0.10)] text-[8px] text-[#CBEE72] ring-1 ring-bg2">✓</span>
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
        <div className="relative mt-3 flex items-center justify-between gap-3 rounded-xl border border-line bg-white/[0.03] px-3 py-2.5">
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

      {/* named receipt + undo — dark green card, lime dot, says WHAT landed WHERE */}
      {undo && (
        <div role="status" tabIndex={0} onMouseEnter={pauseUndo} onMouseLeave={resumeUndo} onFocus={pauseUndo} onBlur={resumeUndo}
          className="fixed inset-x-4 bottom-4 z-[70] mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl border border-accent/25 bg-[#141B12] px-3.5 py-2.5 text-xs text-ink shadow-[0_24px_60px_-24px_rgba(0,0,0,0.75)]">
          <span className="flex min-w-0 items-center gap-2">
            <span aria-hidden className="mt-px h-2 w-2 shrink-0 rounded-full bg-accent" />
            <span className="min-w-0">
              <span className="block font-semibold">Added to {destinationOf(undo.claim)}:</span>
              <span className="block truncate text-muted">“{undo.claim.value || human(undo.claim.claim_type)}”</span>
            </span>
          </span>
          <button className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-accent underline" onClick={undoConfirm}>
            {S.undo}
          </button>
        </div>
      )}

      {/* generic saved / bulk receipt */}
      {flashMsg && !undo && (
        <div role="status" className="fixed inset-x-4 bottom-4 z-[70] mx-auto flex max-w-md items-center gap-2 rounded-xl border border-accent/25 bg-[#141B12] px-3.5 py-2.5 text-xs font-semibold text-ink shadow-[0_24px_60px_-24px_rgba(0,0,0,0.75)]">
          <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-accent" />
          <span className="truncate">{flashMsg}</span>
        </div>
      )}

      {/* ── PLANET PANEL — drill-in. Confirm + honesty text INLINE per row. ── */}
      <BottomSheet open={!!selected} onClose={() => setSelected(null)} title={selected ? S.planets[selected] : ''}>
        {sel && (
          <div className="max-h-[65vh] overflow-y-auto pe-0.5">
            {batchable.length >= 2 && (
              <button className="btn-primary mb-3 w-full py-2.5 text-xs" onClick={() => confirmMany(batchable)} disabled={bulkBusy}
                aria-label={`Confirm all ${batchable.length} found claims shown below`}>
                {bulkBusy ? <Spinner /> : `Confirm all ${batchable.length} below`}
              </button>
            )}
            <div className="space-y-2">
              {panelNodes.map((n) => (
                <PlanetRow key={n.id} node={n} planet={selected} {...rowProps}
                  busy={confirming === n.id}
                  onConfirm={() => confirm(n)}
                  onSaved={() => flash(S.fill.savedInPlace)} />
              ))}
              {panelNodes.length === 0 && (
                <p className="py-6 text-center font-mono text-[10px] text-muted">—</p>
              )}
            </div>
          </div>
        )}
      </BottomSheet>

      {/* ── REVIEW MODE — the "Needs you" batch-confirm panel, inside the radar.
            Every row carries its full wording + source + honesty line. ── */}
      <BottomSheet open={review && !selected} onClose={() => setReview(false)} title={S.filters.needsYou}>
        <div className="max-h-[65vh] overflow-y-auto pe-0.5">
          {foundClaims.length >= 2 && (
            <button className="btn-primary mb-3 w-full py-2.5 text-xs" onClick={() => confirmMany(foundClaims.map((x) => x.node))} disabled={bulkBusy}
              aria-label={`Confirm all ${foundClaims.length} found claims shown below`}>
              {bulkBusy ? <Spinner /> : `Confirm all ${foundClaims.length} below`}
            </button>
          )}
          <div className="space-y-2">
            {needsNodes.map(({ node: n, planet }) => (
              <PlanetRow key={`rv-${planet}-${n.id}`} node={n} planet={planet} {...rowProps}
                busy={confirming === n.id}
                onConfirm={() => confirm(n)}
                onSaved={() => flash(S.fill.savedInPlace)} />
            ))}
            {needsNodes.length === 0 && (
              <p className="py-6 text-center text-xs text-muted">Nothing needs you right now.</p>
            )}
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}

// ── One source row inside a panel ─────────────────────────────────────────────
// EVIDENCE INTEGRITY: an actionable (found/review) claim row shows, BEFORE the
// button — (1) the exact claim wording, (2) the concrete source (method label +
// identifiable reference), (3) the honest proves / doesn't-prove line. The
// button names what it confirms. Non-claim rows keep the inline expander +
// in-place fill form. Never a second modal above the panel.
function PlanetRow({ node: n, planet, S, T, busy, onConfirm, onEvidence, artist, onArtistChange, onItemsRefresh, onSaved }) {
  const [open, setOpen] = useState(false)
  const chip = NODE_CHIP[n.state]
  const actionable = (n.state === NODE.FOUND || n.state === NODE.REVIEW) && !!n.claim
  const c = n.claim
  const methodKey = c ? methodLabelFor({ method_label: c.method_label, verification_status: c.verification_status, expires_at: c.expires_at }) : null
  const ref = sourceRef(n)
  const wording = c ? (c.value || human(c.claim_type)) : n.label

  const icon = n.url
    ? <PlatformMark platform={platformOf(n.url)} />
    : <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.05] text-muted"><GpIcon id={PLANETS.find((p) => p.key === planet)?.icon || 'gp-source'} className="h-4 w-4" /></span>

  if (actionable) {
    return (
      <div className={`rounded-xl border border-line bg-surface2 px-3 py-3 transition ${busy ? 'opacity-60' : ''}`}>
        <div className="flex items-start gap-3">
          {icon}
          <div className="min-w-0 flex-1">
            {/* (1) the exact claim wording — full, never truncated at the confirm moment */}
            <p className="text-sm font-semibold leading-snug text-ink">“{wording}”</p>
            {/* (2) the concrete source — method label + identifiable reference */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <MethodLabel label={T.methodLabel[methodKey] || human(methodKey)} confirmed={methodKey === 'producer-confirmed'} />
              {ref && <span className="font-mono text-[10px] text-faint">{ref}</span>}
            </div>
            {/* (3) honesty, before the button — what it proves and what it doesn't */}
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              <span className="text-ink/75">{n.proves}</span> {n.notProves}
            </p>
          </div>
          <span className={`chip shrink-0 text-[10px] ${chip.c}`}>{chip.icon}</span>
        </div>
        <button
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line2 bg-white/[0.04] px-3 py-2 text-xs font-bold text-accent transition-colors hover:bg-white/[0.08] disabled:opacity-50"
          onClick={onConfirm} disabled={busy}
          aria-label={`Confirm: ${wording}`}>
          {busy ? <Spinner /> : <><span aria-hidden>✓</span><span className="truncate">Confirm: “{wording}”</span></>}
        </button>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border border-line bg-surface2 px-3 py-3 transition ${busy ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">{n.label}</span>
          <span className="block truncate text-[11px] text-muted">{n.sub}</span>
        </span>
        <span className={`chip shrink-0 text-[10px] ${chip.c}`}>{chip.icon}</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {n.state === NODE.MISSING && !n.fill && n.evidence && (
          <button className="rounded-lg border border-line2 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:bg-white/[0.08]" onClick={onEvidence}>
            {S.fill.openEvidence}
          </button>
        )}
        <button
          className="min-h-[36px] font-mono text-[10px] uppercase tracking-[0.08em] text-muted transition-colors hover:text-ink"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}>
          {n.state === NODE.MISSING && n.fill ? S.addCta : S.whatItProves} {open ? '▴' : '▾'}
        </button>
      </div>

      {/* inline expander — honesty text + (for fillable gaps) the form itself */}
      {open && (
        <div className="mt-2 border-t border-line pt-2">
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
        <button className="btn-ghost w-full" disabled={busy} onClick={() => saveArtist({ [field]: true })}>
          {busy ? <Spinner /> : S.fill.invoiceYes}
        </button>
      )}

      {(kind === 'text' || kind === 'url') && (
        <>
          <input className="field" dir={kind === 'url' ? 'ltr' : undefined} maxLength={max}
            placeholder={kind === 'url' ? S.fill.urlPlaceholder : (placeholder || node.label)}
            value={v} onChange={(e) => setV(e.target.value)} />
          <button className="btn-ghost w-full" disabled={busy || !v.trim()} onClick={() => saveArtist({ [field]: v.trim() })}>
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
            <button className="btn-ghost w-full" disabled={busy} onClick={() => saveArtist({ photo_url: v.trim() })}>
              {busy ? <Spinner /> : S.fill.save}
            </button>
          )}
        </>
      )}

      {kind === 'number' && (
        <>
          <input className="field" type="number" min="1" inputMode="numeric"
            placeholder={S.fill.numberPlaceholder} value={v} onChange={(e) => setV(e.target.value)} />
          <button className="btn-ghost w-full" disabled={busy || !(parseInt(v, 10) > 0)}
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
          <button className="btn-ghost w-full" disabled={busy || !v.trim()}
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
          <button className="btn-ghost w-full" disabled={busy || !/^https?:\/\//i.test(v.trim())}
            onClick={() => run(async () => {
              await addProfileItem({ artist_id: artist.id, item_type: 'link', title: 'link', public_url: v.trim(), visibility: 'passport-ok', source_status: 'artist-provided' })
              await onItemsRefresh?.()
            })}>
            {busy ? <Spinner /> : S.fill.save}
          </button>
        </>
      )}

      {err && <p className="text-xs text-need" role="alert">{err}</p>}
    </div>
  )
}

function CenterStar({ artist, T, dim }) {
  // The artist IS the center of the universe — photo first, in the one gold aura.
  return (
    <div className={`text-center transition-opacity ${dim ? 'opacity-50' : ''}`}>
      {artist.photo_url
        ? <img src={artist.photo_url} alt="" className="mx-auto h-20 w-20 rounded-full border border-gold/70 object-cover shadow-[0_0_28px_rgba(242,192,99,0.25)]" />
        : <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-gold/70 bg-surface2 font-display text-xl text-ink shadow-[0_0_28px_rgba(242,192,99,0.18)]">
            {(artist.stage_name || '★').slice(0, 1)}
          </span>}
      <span className="font-display mt-2 block text-sm font-bold tracking-[-0.01em] text-ink">
        {artist.stage_name || T.radar.universe.you}
      </span>
    </div>
  )
}
