import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateClaim, updateAct, addProfileItem, addEvidence, processEvidence, listClaims, listActs, switchAct, createAct } from '../../lib/db.js'
import { logEvent, EVENTS } from '../../lib/analytics.js'
import { uploadFile } from '../../lib/storage.js'
import { BottomSheet, Spinner, GpIcon } from '../../components/ui.jsx'
import { PlatformLogo, detectPlatform } from '../../components/PlatformLogo.jsx'
import { MethodLabel } from './proofBits.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { methodLabelFor, VISIBILITY } from '../../lib/constants.js'
import { PLANETS, NODE, buildUniverse, deriveWorlds, bandFromCount, ownHistory } from '../../lib/radarUniverse.js'
import { primaryPlanets } from '../../lib/genreWeights.js'

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
  // R-2 (T-82) — locked is a sequencing hook, never shame styling: a quiet,
  // low-contrast ring, no warning/red register.
  locked: 'border-line/40',
}
// R-3 (T-82, §8.2 constellation threads) — one thread center↔planet, coloured
// by the SAME live-state vocabulary as RING above (amber/teal/lime/faint).
// Geometry is fixed by planet angle, identical for every artist — colour is a
// state only, it grades nothing.
// Token CLASSES, never literal hexes (§5.6) — the <line> strokes currentColor.
const THREAD_STROKE = {
  needs: 'text-amber',
  developing: 'text-teal',
  established: 'text-accent',
  locked: 'text-faint', // muted, not a warning color
}
// Bounded state chips — low-saturation tints (≤10% alpha), text does the work.
const NODE_CHIP = {
  [NODE.CONFIRMED]: { icon: '✓', c: 'bg-[rgba(190,226,78,0.10)] text-[#CBEE72]' },
  [NODE.FOUND]: { icon: '✦', c: 'bg-[rgba(242,192,99,0.10)] text-gold' },
  [NODE.REVIEW]: { icon: '?', c: 'bg-[rgba(227,154,75,0.10)] text-[#F0B478]' },
  [NODE.MISSING]: { icon: '+', c: 'bg-na-bg text-[#9AA29B]' },
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
// Localized via the radar.universe dictionary (S) — never a hardcoded string.
function destinationOf(claim, S) {
  const publicBound = claim?.visibility === VISIBILITY.PASSPORT_OK &&
    ['verified', 'supporting'].includes(claim?.verification_status)
  return publicBound ? S.destPassport : S.destPrivate
}

// ── Platform ring (META-FIELD LAW) — small nodes orbiting the universe, ONE
// per platform actually DETECTED in this Act's own data (a profile_items link
// or a claim's value/source_type), each showing the REAL row value — never an
// invented count/follower number. A platform with no data simply isn't
// rendered; the ring's one "+ connect" affordance (below) stands in for every
// not-yet-connected platform, instead of a per-platform empty state.
function derivePlatformNodes(items = [], claims = []) {
  const byKey = new Map()
  for (const it of items) {
    if (it.item_type !== 'link' || !it.public_url) continue
    const platform = detectPlatform(it.public_url)
    if (!platform || byKey.has(platform)) continue
    byKey.set(platform, { key: platform, platform, value: hostOf(it.public_url) || human(it.title) || platform })
  }
  for (const c of claims) {
    const platform = detectPlatform(c.value) || detectPlatform(c.source_type)
    if (!platform) continue
    const prev = byKey.get(platform)
    if (prev?.fromClaim) continue // first real claim wins — richer than a bare host
    // T-59 (owner firewall catch, 18 Jul): NEVER the claim VALUE on the ring —
    // a draw-band value is a band, and a band never floats as a naked number
    // on the face (§5.10). The ring shows only WHERE proof comes from: the
    // caption is the method label (provenance word), rendered via i18n at the
    // call site. The band itself lives in the planet panel, paired with its
    // method chip + room-fit line as spec'd.
    byKey.set(platform, { key: platform, platform, method: c.method_label || c.source_type, fromClaim: true })
  }
  return [...byKey.values()]
}

// ── Breakpoint gate (Tailwind md, 768px) — CTA law (§10.2 / §8.2): the md+
// next-move dock and the mobile next-step card are ONE logical CTA, so exactly
// ONE of them may exist per view. CSS show/hide left BOTH .btn-primary nodes in
// the DOM (T-31 residue); this hook lets each side render conditionally instead,
// guaranteeing a single lime primary at any width (dock XOR mobile card).
export function useFullStage() {
  const [full, setFull] = useState(() => window.matchMedia('(min-width: 768px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = (e) => setFull(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return full
}

// R-1 (T-82, §8.2 mobile "Radar Focus") — instant states, no transition, when
// the visitor has asked the OS for reduced motion. Same matchMedia pattern as
// useFullStage above.
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

// Shared planet position math (percent-of-stage) — ONE source of truth reused
// by the planet buttons AND the R-3 constellation-thread SVG layer, so the
// thread endpoints can never drift from the actual planet markers.
const PLANET_ORBIT_PCT = 41
function planetXY(angle, radius = PLANET_ORBIT_PCT) {
  const rad = (angle * Math.PI) / 180
  return { x: 50 + radius * Math.cos(rad), y: 50 + radius * Math.sin(rad) }
}

export default function RadarUniverse({ artist, act, items, claims, onClaimsChange, nextAction, onNextAction, onArtistChange, onActChange, onItemsRefresh, reviewSignal = 0, focusPlanet = null, focusSignal = 0 }) {
  const { T } = useLang()
  const S = T.radar.universe
  const nav = useNavigate()
  const fullStage = useFullStage() // md+ ⇒ this component owns the ONE next-move CTA
  const reduceMotion = usePrefersReducedMotion() // R-1 — instant states, no transition
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
  // Confirm bloom (Master-Class Pillar 1: "the moment of confirmation must feel
  // like progress being minted") — node ids currently mid-bloom (~400ms), then
  // cleared. A Set so a bulk confirm can bloom several rows at once.
  const [bloomIds, setBloomIds] = useState(() => new Set())
  function triggerBloom(ids) {
    const list = Array.isArray(ids) ? ids : [ids]
    setBloomIds((prev) => new Set([...prev, ...list]))
    setTimeout(() => {
      setBloomIds((prev) => { const next = new Set(prev); list.forEach((id) => next.delete(id)); return next })
    }, 420)
  }

  // R-1(c) — long-press method peek: a transient overlay reusing the EXACT
  // method-label wording already rendered elsewhere (never new information),
  // for a platform-ring tile or a source row. Auto-dismisses ~1.8s.
  const [peek, setPeek] = useState('')
  const peekRef = useRef(null)
  function showPeek(text) {
    if (!text) return
    clearTimeout(peekRef.current)
    setPeek(text)
    peekRef.current = setTimeout(() => setPeek(''), 1800)
  }
  // Long-press bookkeeping for the platform-ring tiles (list-rendered, so a
  // Map keyed by node key rather than one hook call per item — hooks cannot
  // live inside .map()). PlanetRow (a real component instance per row) uses
  // its own useRef instead — see below.
  const ringLongPress = useRef(new Map())
  function longPressHandlers(key, text) {
    if (!ringLongPress.current.has(key)) ringLongPress.current.set(key, { timer: null, fired: false })
    const st = ringLongPress.current.get(key)
    const start = () => { st.fired = false; clearTimeout(st.timer); st.timer = setTimeout(() => { st.fired = true; showPeek(text) }, 500) }
    const clear = () => clearTimeout(st.timer)
    const guardClick = (e) => { if (st.fired) { e.preventDefault(); e.stopPropagation(); st.fired = false } }
    return {
      onTouchStart: start, onTouchEnd: clear, onTouchMove: clear, onTouchCancel: clear,
      onMouseDown: start, onMouseUp: clear, onMouseLeave: clear,
      onClickCapture: guardClick, onContextMenu: (e) => e.preventDefault(),
    }
  }

  // R-1(b) — swipe left/right cycles the focused planet (only while one is
  // selected; the stage otherwise has no pan gesture). ~48px horizontal
  // threshold with a vertical-drift guard (|dy| < |dx|).
  const swipeStart = useRef(null)
  function onStageTouchStart(e) {
    if (!selected || !e.touches?.length) return
    swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  function onStageTouchEnd(e) {
    if (!selected || !swipeStart.current || !e.changedTouches?.length) return
    const dx = e.changedTouches[0].clientX - swipeStart.current.x
    const dy = e.changedTouches[0].clientY - swipeStart.current.y
    swipeStart.current = null
    if (Math.abs(dy) >= Math.abs(dx) || Math.abs(dx) < 48) return
    cyclePlanet(dx < 0 ? 1 : -1) // swipe left → next, swipe right → prev
  }
  function cyclePlanet(dir) {
    const idx = PLANETS.findIndex((p) => p.key === selected)
    if (idx === -1) return
    setSelected(PLANETS[(idx + dir + PLANETS.length) % PLANETS.length].key)
  }

  // ── Multi-Act switch — lives at the radar CENTER-STAR (Design Spec §MULTI-ACT).
  // One Person may hold several Acts (a psytrance Act + a techno Act…), each
  // with its OWN Passport and OWN evidence, per-Act non-transferable. Switching
  // swaps the whole universe (identity + nodes) — never merges two Acts'
  // evidence. `actOverride` is null while viewing the default (prop-driven)
  // Act; it holds the swapped-in identity/evidence once another Act is active.
  const [acts, setActs] = useState([])
  const [activeActId, setActiveActId] = useState(() => localStorage.getItem('gigproof_active_act') || artist.id)
  const [actSheet, setActSheet] = useState(false)
  const [actBusy, setActBusy] = useState(false)
  const [newActName, setNewActName] = useState('') // + New Act inline form (A3/N12)
  const [actOverride, setActOverride] = useState(null) // { artist, items, claims } for a non-default Act

  useEffect(() => {
    let cancelled = false
    listActs(artist.id).then((rows) => { if (!cancelled) setActs(rows || []) }).catch(() => {})
    return () => { cancelled = true }
  }, [artist.id])

  // Restore a persisted non-default Act once its record has loaded.
  useEffect(() => {
    const stored = localStorage.getItem('gigproof_active_act')
    if (stored && stored !== artist.id && acts.some((a) => a.id === stored) && !actOverride) {
      pickAct(stored)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acts])

  async function pickAct(id, actRow = null) {
    const alreadyActive = id === artist.id ? !actOverride : activeActId === id && !!actOverride
    if (alreadyActive) { setActSheet(false); return }
    if (actBusy) return
    setActBusy(true)
    try {
      if (id === artist.id) {
        setActOverride(null) // back to the default Act — the prop-driven data
      } else {
        const res = await switchAct(id)
        const a = actRow || acts.find((x) => x.id === id) || res.act || {}
        setActOverride({
          act: res.act || a,
          items: res.items || [],
          claims: res.claims || [],
          // The non-default Act's own identity fields (migration 020: act.stage_name/
          // genre/city/positioning/photo_url); draw/kit fields (bands, sells_tickets,
          // rider…) live only on `artists` today — honestly absent here rather than
          // carried over from the default Act (real-DB depth gap, documented).
          artist: {
            ...artist,
            stage_name: a.stage_name || artist.stage_name,
            genre: a.genre ?? null,
            city: a.city ?? null,
            one_line: a.positioning ?? null,
            photo_url: a.photo_url ?? null,
            lineup_frequency_band: null, sells_tickets: null, price_band: null,
            community_size_band: null, set_length: null, regions: null,
            rider_url: null, invoice_ready: null, whatsapp_number: null,
          },
        })
      }
      setActiveActId(id)
      localStorage.setItem('gigproof_active_act', id)
      logEvent(EVENTS.ACT_SWITCHED, { act_id: id }) // pilot signal (A10)
      setActSheet(false)
      setSelected(null)
      flash(S.actSwitch.switchedToast((actRow || acts.find((a) => a.id === id) || {}).stage_name || artist.stage_name))
    } finally {
      setActBusy(false)
    }
  }

  // D6 (T-72, §8.3 per-field DoD): a field save flashes WITH an undo action —
  // 7s window, same contract as the claim-confirm undo. Item-creating fills
  // (event/link) pass no undo (deleting an item is a different, heavier path).
  const [flashUndo, setFlashUndo] = useState(null)
  function flash(msg, undoFn = null) {
    clearTimeout(flashRef.current)
    setFlashMsg(msg); setFlashUndo(() => undoFn)
    flashRef.current = setTimeout(() => { setFlashMsg(''); setFlashUndo(null) }, undoFn ? 7000 : 3200)
  }

  // + New Act (rel-07.13 A3/N12) — creates an EMPTY second universe for the
  // same Person and switches straight into it (canon: evidence never transfers).
  async function createNewAct(e) {
    e?.preventDefault?.()
    const name = newActName.trim()
    if (!name || actBusy) return
    setActBusy(true)
    try {
      const row = await createAct(activeActId || artist.id, { stage_name: name })
      logEvent(EVENTS.ACT_CREATED, { act_id: row.id }) // pilot signal (A10)
      setActs((prev) => [...prev, row])
      setNewActName('')
      setActBusy(false)          // pickAct manages its own busy state
      await pickAct(row.id, row) // lands inside the new, honestly-empty universe
      flash(S.actSwitch.newActCreated(row.stage_name))
    } catch (err) {
      setActBusy(false)
      flash(err?.message === 'demo' ? S.actSwitch.newActDemo : (err?.message || T.common.error))
    }
  }

  // Everything below derives from the ACTIVE act's data — swapped wholesale,
  // never merged, when a non-default Act is selected.
  const effArtist = actOverride?.artist || artist
  const effItems = actOverride?.items || items
  const effClaims = actOverride?.claims || claims
  const effAct = actOverride?.act || act

  const uni = useMemo(() => buildUniverse({ artist: effArtist, act: effAct, items: effItems, claims: effClaims, T }), [effArtist, effAct, effItems, effClaims, T])

  // ── G2 genre emphasis (genreWeights) — ADDITIVE highlight ONLY. Primary
  // planets for the ACTIVE Act's genre family gain a quiet concentric ring, a
  // slight size lift and a method-safe wording label. Non-primary planets stay
  // FULL-OPACITY and fully interactive (DEPLOY-GAPS testability rule — no
  // dimming, no reordering). No genre/format signal → empty set → all equal.
  // FIREWALL: never a weight, number, rank or % — a ring + words, nothing else.
  // ── Scene rail (§8.2 top-center · owner directive 17 Jul): the artist's OWN
  // canon genres (Act-editor picker — same constants.GENRES vocabulary) become
  // a "Your standing in" control. Picking a scene re-weights the ★ emphasis by
  // feeding THAT genre alone through the ratified genreWeights engine — a
  // reading lens on the same evidence, never a data change, never a grade.
  const scenes = useMemo(
    () => String(effArtist?.genre || '').split(',').map((s) => s.trim()).filter(Boolean),
    [effArtist],
  )
  const [scene, setScene] = useState(null) // null = All (the full genre string)
  const sceneAct = useMemo(
    () => (scene ? { ...effAct, genre: scene } : effAct),
    [scene, effAct],
  )
  const sceneArtist = useMemo(
    () => (scene ? { ...effArtist, genre: scene } : effArtist),
    [scene, effArtist],
  )
  // T-60 (owner ruling 18 Jul): the ring + ★ mark ALL primary planets, but the
  // "Central in your genre" TEXT renders on the family's FIRST-priority planet
  // only — three identical labels read louder than guidance. The other primaries
  // keep the wording in their aria-label (accessibility unchanged).
  const genrePrimaryList = useMemo(() => primaryPlanets(sceneAct, sceneArtist), [sceneAct, sceneArtist])
  const genrePrimary = useMemo(() => new Set(genrePrimaryList), [genrePrimaryList])
  const genreLabelPlanet = genrePrimaryList[0] || null
  // N3 — the scene named in coaching lines: the picked scene chip, else the
  // artist's first declared scene. No declared scene → null → no coaching (G2).
  const coachScene = scene || scenes[0] || null
  // N4 — own-history frame (§5.10): the artist's own recent confirmations.
  const history = useMemo(() => ownHistory(effClaims), [effClaims])
  const worlds = useMemo(() => deriveWorlds({ artist: effArtist, items: effItems }), [effArtist, effItems])
  const evidenceRoute = `/evidence/${artist.id}`

  // The platform ring — real detected platforms + one trailing "+ connect" node.
  const platformNodes = useMemo(() => derivePlatformNodes(effItems, effClaims), [effItems, effClaims])
  const ringNodes = useMemo(() => [...platformNodes, { key: 'connect' }], [platformNodes])

  // Every found/review node across all planets — the radar's review mode.
  // A just-confirmed node stays in this list for its bloom duration (bloomIds)
  // even though its state has already flipped to CONFIRMED — otherwise the row
  // is removed from the panel in the SAME render that adds the bloom class, and
  // the "moment of confirmation" (Master-Class Pillar 1) is never seen.
  const needsNodes = useMemo(() => {
    const out = []
    for (const p of PLANETS) {
      for (const n of uni.planets[p.key].nodes) {
        if (n.state === NODE.FOUND || n.state === NODE.REVIEW || bloomIds.has(n.id)) out.push({ node: n, planet: p.key })
      }
    }
    return out
  }, [uni, bloomIds])
  const foundClaims = needsNodes.filter((x) => x.node.state === NODE.FOUND && x.node.claim)

  // The dashboard's Next-step card can open the review mode without leaving the radar.
  useEffect(() => { if (reviewSignal > 0) setReview(true) }, [reviewSignal])

  // …and it can open a SPECIFIC planet panel (deferred-field fills: "Add your
  // photo" → Identity planet) — same panel a tap on the planet opens.
  useEffect(() => {
    if (focusSignal > 0 && focusPlanet) { setReview(false); setSelected(focusPlanet) }
  }, [focusSignal, focusPlanet])

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
    { key: 'ready', label: S.filters.ready },
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

  // "New Act starts empty" honesty (canon: per-Act evidence is non-transferable) —
  // derived from the ACTIVE Act's own data, so switching to a fresh Act shows
  // its own empty/needs-you states, never the previous Act's content.
  const blossom = effClaims.length === 0 && effItems.filter((i) => i.item_type === 'link').length === 0

  async function confirm(node) {
    if (!node?.claim || confirming) return
    const c = node.claim
    setConfirming(node.id)
    try {
      await updateClaim(c.id, { artist_approved: true })
      onClaimsChange((prev) => prev.map((x) => x.id === c.id ? { ...x, artist_approved: true } : x))
      triggerBloom(node.id)
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
      triggerBloom(list.map((n) => n.id))
      flash(S.bulkConfirmed(list.length, destinationOf(list[0].claim, S)))
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
    artist: effArtist, onArtistChange, onActChange, onItemsRefresh, onClaimsChange,
    onPeek: showPeek, // R-1(c) — long-press method peek on a source row
  }

  // R-4 (T-82, §8.2 4-zone) — the right-rail inspector holds the ONE primary
  // CTA whenever it is showing one, so the floating next-move dock (below)
  // must not render a SECOND .btn-primary at the same time (CTA law).
  const railHoldsCTA = fullStage && !!sel && (
    (selected === 'prokit' && sel.state === 'locked') || batchable.length >= 2
  )

  return (
    // Viewport law (T-35/§10.2): inside the dashboard's fixed-height column this
    // panel FLEXES to the remaining height on md+ (min-h-0 + flex-1 instead of a
    // fixed min-h) — the universe square below derives its size from this height,
    // so the whole radar scales to fit rather than pushing the page past the fold.
    <div className="relative shrink-0 overflow-hidden rounded-3xl border border-line bg-bg2 p-4 sm:p-5 md:flex md:min-h-0 md:flex-1 md:flex-col md:justify-center md:p-8">
      {/* the ONE warm light — backstage lamp above the artist (gold budget: this + method labels).
          Full-stage (md+): the same aura, sized for a taller cinematic canvas. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 h-64 md:-top-16 md:h-[600px]"
        style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(242,192,99,0.12), transparent 70%)' }} />

      {/* Scene rail (§8.2 top-center) — shown only when the artist declared
          genres; picking one re-weights the ★ through genreWeights (additive
          emphasis only — never dims, never grades). */}
      {scenes.length > 0 && (
        <div className="relative z-10 mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 md:absolute md:end-8 md:top-8 md:mb-0 md:pb-0"
          role="tablist" aria-label={S.sceneLabel}>
          {/* V4 (owner witness-fix 20 Jul): the label WAS already rendering
              unconditionally at every width (no hidden/md: gate) — the defect
              was contrast, not visibility: text-faint measures ~3.8:1 on bg2,
              below the 4.5:1 AA floor, so it read as "unlabeled" at a glance
              exactly as the owner's walk flagged. text-muted (~7.2:1) fixes
              it while staying quieter than the chip labels beside it. */}
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">{S.sceneLabel}</span>
          {[null, ...scenes].map((g) => (
            <button key={g || 'all'} role="tab" aria-selected={scene === g} onClick={() => setScene(g)}
              className={`tap-target shrink-0 rounded-full border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                scene === g ? 'border-gold/60 bg-gold/10 text-gold' : 'border-transparent bg-surface2 text-muted hover:bg-raise'
              }`}>
              {g || S.sceneAll}
            </button>
          ))}
        </div>
      )}

      {/* N4 (T-65, §5.10) — the OWN-HISTORY line: additive, positive-only,
          the artist against their own past. Renders only when something new
          exists; never a %, never a comparison. Artist-private (N5 test). */}
      {history && (
        /* L1 fit law (HOW-TO-BUILD-A-TASK): bottom-END corner — the scene rail
           owns top-center/end and the next-move card owns bottom-START; this
           corner is free at every width (retro-run caught the top-end collision). */
        <p className="relative z-10 mb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-gold/80 md:absolute md:bottom-8 md:end-8 md:mb-0">
          {S.historyLine(history.n, history.since.toLocaleDateString(undefined, { month: 'long' }))}
        </p>
      )}

      {/* ONE control row: state lenses + worlds dropdown. Full-stage (md+): floats
          top-start over the universe, like the prototype's .rfilters strip. */}
      <div className="relative z-10 mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 md:absolute md:start-8 md:top-8 md:mb-0 md:w-auto md:pb-0" role="tablist" aria-label={S.filtersLabel}>
        {/* T-62: the lens rail carries a visible label, same pattern as the
            scene rail — an artist must be able to tell the two rows apart.
            V4 (owner witness-fix 20 Jul): same text-faint contrast defect as
            the scene rail label above (~3.8:1, below AA) — raised to
            text-muted (~7.2:1) so both rails are legible at a glance. */}
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">{S.filtersLabel}</span>
        {FILTERS.map((f) => (
          <button key={f.key} role="tab" aria-selected={filter === f.key} onClick={() => pickFilter(f.key)}
            className={`tap-target relative flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors ${
              filter === f.key ? 'border-line2 bg-line text-ink' : 'border-transparent bg-surface2 text-muted hover:bg-raise'
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
            className={`ms-auto min-h-[44px] shrink-0 appearance-none rounded-full border bg-surface2 px-3 py-1 font-mono text-[10px] outline-none md:min-h-0 ${
              world ? 'border-line2 text-ink' : 'border-line text-faint'
            }`}>
            <option value="">{S.allWorlds}</option>
            {worlds.map((w) => <option key={w} value={w}>{w.toUpperCase()}</option>)}
          </select>
        )}
      </div>

      {/* R-4 (T-82, §8.2 4-zone) — md+: the stage and the persistent right-rail
            inspector sit side by side. Nothing here changes when no planet is
            selected (the rail simply doesn't render) — no layout jump on load. */}
      <div className="relative md:flex md:min-h-0 md:flex-1 md:items-stretch md:gap-5">
      <div className="relative md:min-h-0 md:min-w-0 md:flex-1">
      {blossom ? (
        <div className="relative py-10 text-center">
          <CenterStar artist={effArtist} T={T} S={S} dim
            onOpenSwitch={() => (selected ? setSelected(null) : setActSheet(true))}
            onTagClick={() => setSelected('identity')} />
          <h3 className="font-display mt-5 text-xl font-bold text-ink">{S.blossomTitle}</h3>
          <p className="mx-auto mt-1.5 max-w-[300px] text-xs leading-relaxed text-muted">{S.blossomBody}</p>
          <button className="btn-primary mt-4 min-h-[44px] px-4 py-2.5 text-xs" onClick={() => nav(evidenceRoute)}>{S.blossomCta}</button>
        </div>
      ) : (
        /* ── THE UNIVERSE — always mounted, never reflows. Full-stage (md+):
              the same square grows to fill the taller canvas — orbit math is
              percentage-based so every node scales with it for free. ── */
        /* md+: HEIGHT-driven square (h-full + aspect-square ⇒ width follows the
              flexed panel height, capped at the original 620px) — orbit math is
              percentage-based so every node scales with it for free. */
        <div className="relative mx-auto aspect-square w-full max-w-[400px] md:h-full md:max-h-[620px] md:w-auto md:max-w-[min(620px,100%)]"
          onTouchStart={onStageTouchStart} onTouchEnd={onStageTouchEnd}>
          {/* thin orbit rings — the quiet geometry of the night. A third,
              outermost hairline (md+) carries the platform ring below. */}
          <div className="absolute inset-[9%] rounded-full border border-line" aria-hidden />
          <div className="absolute inset-[27%] rounded-full border border-line" aria-hidden />
          <div className="absolute inset-[4%] hidden rounded-full border border-line/60 md:block" aria-hidden />

          {/* R-3 (T-82, §8.2 constellation threads) — one thread center↔each
              planet, coloured by live state only; geometry is fixed by the
              SAME planet angle used for the markers below (planetXY) — it
              grades nothing. Behind the planets, above the orbit rings. */}
          <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <filter id="radarThreadGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.6" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {PLANETS.map((p) => {
              const { x, y } = planetXY(p.angle)
              const st = uni.planets[p.key].state
              return (
                <line key={p.key} x1="50" y1="50" x2={x} y2={y}
                  stroke="currentColor"
                  strokeWidth={1} vectorEffect="non-scaling-stroke"
                  opacity={st === 'locked' ? 0.12 : 0.32}
                  filter={st === 'established' ? 'url(#radarThreadGlow)' : undefined}
                  className={`${THREAD_STROKE[st] || THREAD_STROKE.developing}${reduceMotion ? '' : ' transition-opacity duration-500'}`} />
              )
            })}
          </svg>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <CenterStar artist={effArtist} T={T} S={S}
              onOpenSwitch={() => (selected ? setSelected(null) : setActSheet(true))}
              onTagClick={() => setSelected('identity')} />
          </div>
          {PLANETS.map((p) => {
            const info = uni.planets[p.key]
            const { x, y } = planetXY(p.angle)
            // R-1(a) — focus state: while a planet is selected, everything
            // else (incl. the platform ring below) fades to ~40%, never gone
            // (opacity only — pointer-events stay live). Without a selection,
            // the existing filter-driven dim still applies.
            const filterDimmed = !info.nodes.some(matchesFilter) && (filter !== 'all' || world)
            const isFocused = selected === p.key
            const dimmed = selected ? !isFocused : filterDimmed
            const opacityClass = dimmed ? (selected ? 'opacity-40' : 'opacity-25') : 'opacity-100'
            const complete = info.state === 'established' && info.foundCount === 0 &&
              !info.nodes.some((n) => n.state === NODE.MISSING)
            // G2 — genre-PRIMARY planet: additive ring + slight size + label.
            // Never touches other planets' opacity, order or interactivity.
            const primary = genrePrimary.has(p.key)
            return (
              <button key={p.key}
                onClick={() => setSelected(p.key)}
                style={{ left: `${x}%`, top: `${y}%` }}
                data-genre-primary={primary || undefined}
                className={`absolute -translate-x-1/2 -translate-y-1/2 text-center ${reduceMotion ? '' : 'transition-all duration-300'} ${opacityClass} ${isFocused ? 'scale-110' : ''}`}
                aria-label={`${S.planets[p.key]} — ${S.state[info.state]}${primary ? ` · ${S.genrePrimary}` : ''}${complete ? ` · ${S.complete}` : ''}`}>
                <span className={`relative mx-auto grid place-items-center rounded-full border bg-surface2 transition-transform hover:scale-105 ${
                  primary ? 'h-[60px] w-[60px] md:h-[68px] md:w-[68px]' : 'h-14 w-14 md:h-16 md:w-16'
                } ${RING[info.state]} ${info.foundCount > 0 ? 'shadow-[0_0_16px_rgba(242,192,99,0.14)]' : ''}`}>
                  {/* G2 genre-primary emphasis — a quiet SECOND concentric ring
                      (shape, not color-only) in the gold register; additive only */}
                  {primary && (
                    <span aria-hidden className="absolute -inset-1.5 rounded-full border border-gold/40 shadow-[0_0_14px_rgba(242,192,99,0.10)]" />
                  )}
                  <GpIcon id={p.icon} className={`h-6 w-6 text-ink/90 md:h-7 md:w-7 ${info.state === 'locked' ? 'opacity-50' : ''}`} />
                  {/* found — a small gold dot, not a badge shouting */}
                  {info.foundCount > 0 && (
                    <span aria-hidden className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-bg2" />
                  )}
                  {/* accomplishment — deliberately quiet: a small settled ✓ */}
                  {complete && (
                    <span aria-hidden className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-[rgba(190,226,78,0.10)] text-[8px] text-[#CBEE72] ring-1 ring-bg2">✓</span>
                  )}
                  {/* R-2 (T-82) — locked is a sequencing hook, never shame: a
                      small quiet lock mark, no red/warning register. */}
                  {info.state === 'locked' && (
                    <span aria-hidden className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-na-bg text-faint ring-1 ring-bg2">
                      <GpIcon id="gp-lock" className="h-2.5 w-2.5" />
                    </span>
                  )}
                </span>
                {/* V3 (owner witness-fix 20 Jul): text-faint measured ~3.8:1 on
                    bg2 — below the 4.5:1 AA floor for sub-9px text, reading as
                    "faint" exactly as the owner's walk flagged. text-ink/80
                    (~10.8:1) fixes contrast without a new color token. T-61
                    wrap law made explicit here too: line-clamp-2 + max-w
                    (was a bare w-20 with no clamp) so the longest label
                    ("AUDIENCE & COMMUNITY") gets a firm 2-line cap, never an
                    ellipsis mid-word — none of the six planet names actually
                    need a 3rd line at this width, so the clamp never fires. */}
                <span className="line-clamp-2 mt-1.5 block max-w-[80px] whitespace-normal break-words text-center font-mono text-[8px] uppercase leading-tight tracking-[0.08em] text-ink/80 md:text-[9px]">
                  {S.planets[p.key]}
                </span>
                {/* G2 — method-safe wording label; words only, never a weight.
                    T-60: text on the FIRST-priority planet only (ring+★ still
                    mark every primary; the rest keep the wording in aria). */}
                {primary && p.key === genreLabelPlanet && (
                  <span className="mt-0.5 block w-20 font-mono text-[7px] uppercase tracking-[0.08em] text-gold/75 leading-tight md:text-[8px]">
                    {S.genrePrimary}
                  </span>
                )}
              </button>
            )
          })}

          {/* R-1(c) — long-press method peek, transient overlay (auto-dismiss
              ~1.8s), reusing the exact wording already rendered elsewhere. */}
          {peek && (
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1 z-20 flex justify-center">
              <span className="rounded-full border border-gold/40 bg-surface/95 px-3 py-1 text-center font-mono text-[9px] uppercase tracking-[0.08em] text-gold shadow-card">
                {peek}
              </span>
            </div>
          )}

          {/* ── PLATFORM RING (META-FIELD LAW) — one small muted node per REAL
                detected platform (a profile_items link or a claim), showing the
                real row value; never an invented count. Sits just outside the
                category-planet orbit. The trailing node is always the single
                muted "+ connect" affordance, never a per-platform empty state. */}
          {ringNodes.map((pn, i) => {
            // Fixed slots exactly BETWEEN the 6 category-planet angles
            // (-90/-30/30/90/150/210), never on top of one, on a wider radius
            // just outside the planet orbit — a visually distinct outer ring.
            const SLOTS = [-60, 0, 60, 120, 180, 240]
            const angle = SLOTS[i % SLOTS.length]
            const rad = (angle * Math.PI) / 180
            const x = 50 + 47 * Math.cos(rad)
            const y = 50 + 47 * Math.sin(rad)
            const isConnect = pn.key === 'connect'
            return (
              <div key={pn.key} style={{ left: `${x}%`, top: `${y}%` }}
                className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 ${selected ? 'opacity-40' : 'opacity-100'} ${reduceMotion ? '' : 'transition-opacity duration-300'}`}>
                {isConnect ? (
                  <button type="button" onClick={goEvidence}
                    aria-label={S.platformConnectAria} title={S.platformConnectAria}
                    className="tap-target grid h-7 w-7 place-items-center rounded-full border border-dashed border-line2 bg-surface2 text-faint transition-colors hover:border-line2 hover:text-ink">
                    <span aria-hidden className="text-xs font-bold leading-none">+</span>
                  </button>
                ) : (() => {
                  // T-59: link nodes caption their host; claim nodes caption
                  // their METHOD LABEL (provenance word) — never the value.
                  const caption = pn.fromClaim ? (T.methodLabel?.[pn.method] || human(pn.method)) : pn.value
                  return (
                    // R-1(c) — long-press (touch ~500ms / mouse-down hold) peeks
                    // the same method-label caption already rendered below it.
                    <button type="button" aria-label={S.platformNodeAria(caption)} title={caption}
                      {...longPressHandlers(pn.key, caption)}
                      className="tap-target relative grid h-7 w-7 place-items-center rounded-full border border-gold/35 bg-surface2 text-ink/75 shadow-glow-gold">
                      <PlatformLogo name={pn.platform} size={16} />
                      <span aria-hidden className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-gold ring-2 ring-bg2" />
                    </button>
                  )
                })()}
                {!isConnect && (
                  /* T-61 (L-8 fit law): captions WRAP to two centered lines —
                     truncation on the flagship face is forbidden; the longest
                     method label ("PRODUCER-CONFIRMED") must read in full. */
                  <span className="line-clamp-2 block max-w-[96px] whitespace-normal break-words text-center font-mono text-[7px] uppercase leading-tight tracking-[0.06em] text-faint">
                    {pn.fromClaim ? (T.methodLabel?.[pn.method] || human(pn.method)) : pn.value}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
      </div>

      {/* R-4 (T-82, §8.2 4-zone "RIGHT · the persistent Planet Inspector") —
            md+ only, and only while a planet is selected (collapses back to
            nothing otherwise — no layout jump on the default/no-selection
            view, which renders byte-identical to before this task). Mobile
            keeps the BottomSheet below exactly as-is. Same panel content
            (PlanetPanelContent) as the sheet — no forked copy. */}
      {fullStage && sel && (
        <aside aria-label={S.planets[selected]} className="relative hidden shrink-0 flex-col rounded-2xl border border-line bg-surface2/60 p-4 md:flex md:w-[300px] md:min-h-0">
          <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
            <h2 className="font-display text-sm font-bold text-ink">{S.planets[selected]}</h2>
            <button type="button" onClick={() => setSelected(null)}
              className="tap-target shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted hover:text-ink">
              {S.backToUniverse}
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pe-0.5">
            <PlanetPanelContent
              selected={selected} sel={sel} S={S} T={T} coachScene={coachScene}
              batchable={batchable} bulkBusy={bulkBusy} onConfirmMany={confirmMany}
              panelNodes={panelNodes} rowProps={rowProps} confirming={confirming} bloomIds={bloomIds}
              confirmNode={confirm} onSaved={(undoFn) => flash(S.fill.savedInPlace, undoFn)}
              onGoLive={() => setSelected('live')} />
          </div>
        </aside>
      )}
      </div>

      {/* ── ONE next move — full-stage (md+) ONLY: floats bottom-start OVER
            the universe, like the prototype's .next card. Mobile keeps its
            separate card below the radar (ArtistDashboard), which renders only
            below md — the fullStage gate keeps exactly ONE .btn-primary in the
            DOM per view (CTA law §10.2/§8.2), never two hidden twins.
            R-4 — when the right rail is open AND holds a CTA (batch-confirm
            or the locked-prokit CTA), this dock hides entirely so exactly ONE
            .btn-primary ever renders (rail closed ⇒ dock returns). ── */}
      {fullStage && !blossom && nextAction && !railHoldsCTA && (
        <div className="relative z-10 hidden items-center justify-between gap-3 rounded-xl border border-gold/25 bg-surface/95 px-3 py-2.5 shadow-card backdrop-blur md:absolute md:bottom-8 md:start-8 md:flex md:w-[380px] md:max-w-[calc(100%-4rem)]">
          <div className="min-w-0">
            <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-faint">{T.radar.nextActionEyebrow}</p>
            <p className="truncate text-sm font-semibold text-ink">{nextAction.title}</p>
          </div>
          {(nextAction.to || nextAction.planet) && (
            <button className="btn-primary shrink-0 px-3 py-2 text-xs" onClick={() => onNextAction?.(nextAction)}>
              {T.common.continue}
            </button>
          )}
        </div>
      )}

      {/* named receipt + undo — dark green card, lime dot, says WHAT landed WHERE */}
      {undo && (
        <div role="status" tabIndex={0} onMouseEnter={pauseUndo} onMouseLeave={resumeUndo} onFocus={pauseUndo} onBlur={resumeUndo}
          className="fixed inset-x-4 bottom-4 z-[70] mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl border border-accent/25 bg-surface px-3.5 py-2.5 text-xs text-ink shadow-[0_24px_60px_-24px_rgba(0,0,0,0.75)]">
          <span className="flex min-w-0 items-center gap-2">
            <span aria-hidden className="mt-px h-2 w-2 shrink-0 rounded-full bg-accent" />
            <span className="min-w-0">
              <span className="block font-semibold">{S.addedTo(destinationOf(undo.claim, S))}</span>
              <span className="block truncate text-muted">“{undo.claim.value || human(undo.claim.claim_type)}”</span>
            </span>
          </span>
          <button className="tap-target shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-accent underline" onClick={undoConfirm}>
            {S.undo}
          </button>
        </div>
      )}

      {/* generic saved / bulk receipt */}
      {flashMsg && !undo && flashUndo && (
        <div className="fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-line2 bg-surface px-4 py-2 text-xs text-ink shadow-card" role="status">
          <span className="truncate">{flashMsg}</span>
          <button type="button" className="tap-target shrink-0 font-bold text-accent hover:underline"
            onClick={() => { const u = flashUndo; setFlashMsg(''); setFlashUndo(null); u?.() }}>
            {S.fill.undo}
          </button>
        </div>
      )}
      {flashMsg && !undo && !flashUndo && (
        <div role="status" className="fixed inset-x-4 bottom-4 z-[70] mx-auto flex max-w-md items-center gap-2 rounded-xl border border-accent/25 bg-surface px-3.5 py-2.5 text-xs font-semibold text-ink shadow-[0_24px_60px_-24px_rgba(0,0,0,0.75)]">
          <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-accent" />
          <span className="truncate">{flashMsg}</span>
        </div>
      )}

      {/* ── PLANET PANEL — drill-in. Confirm + honesty text INLINE per row.
            R-4: md+ owns the persistent right-rail (rendered above, beside
            the stage) instead — this BottomSheet is mobile-only so the panel
            never shows twice (and never doubles a .btn-primary). ── */}
      <BottomSheet open={!!selected && !fullStage} onClose={() => setSelected(null)} title={selected ? S.planets[selected] : ''}>
        {sel && (
          <div className="max-h-[65vh] overflow-y-auto pe-0.5">
            <PlanetPanelContent
              selected={selected} sel={sel} S={S} T={T} coachScene={coachScene}
              batchable={batchable} bulkBusy={bulkBusy} onConfirmMany={confirmMany}
              panelNodes={panelNodes} rowProps={rowProps} confirming={confirming} bloomIds={bloomIds}
              confirmNode={confirm} onSaved={(undoFn) => flash(S.fill.savedInPlace, undoFn)}
              onGoLive={() => setSelected('live')} />
          </div>
        )}
      </BottomSheet>

      {/* ── REVIEW MODE — the "Needs you" batch-confirm panel, inside the radar.
            Every row carries its full wording + source + honesty line. ── */}
      <BottomSheet open={review && !selected} onClose={() => setReview(false)} title={S.filters.needsYou}>
        <div className="max-h-[65vh] overflow-y-auto pe-0.5">
          {foundClaims.length >= 2 && (
            <button className="btn-primary mb-3 min-h-[44px] w-full py-2.5 text-xs" onClick={() => confirmMany(foundClaims.map((x) => x.node))} disabled={bulkBusy}
              aria-label={S.confirmAllCta(foundClaims.length)}>
              {bulkBusy ? <Spinner /> : S.confirmAllCta(foundClaims.length)}
            </button>
          )}
          <div className="space-y-2">
            {needsNodes.map(({ node: n, planet }) => (
              <PlanetRow key={`rv-${planet}-${n.id}`} node={n} planet={planet} {...rowProps}
                busy={confirming === n.id}
                bloom={bloomIds.has(n.id)}
                onConfirm={() => confirm(n)}
                onSaved={(undoFn) => flash(S.fill.savedInPlace, undoFn)} />
            ))}
            {needsNodes.length === 0 && (
              <p className="py-6 text-center text-xs text-muted">{S.nothingNeedsYou}</p>
            )}
          </div>
        </div>
      </BottomSheet>

      {/* ── ACT SWITCH — center-star only (Design Spec §MULTI-ACT). One Person,
            several Acts; picking one swaps the whole universe above — never a
            merge. A non-active Act with no evidence yet is shown honestly
            (radar's own empty/needs-you states render once it's selected). ── */}
      <BottomSheet open={actSheet} onClose={() => setActSheet(false)} title={S.actSwitch.title}>
        <div className="space-y-2">
          {acts.map((a) => {
            const isActive = a.id === activeActId
            return (
              <button key={a.id} type="button" onClick={() => pickAct(a.id)} disabled={actBusy}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition-colors disabled:opacity-60 ${
                  isActive ? 'border-line2 bg-surface2' : 'border-line bg-surface2 hover:bg-raise'
                }`}>
                {a.photo_url
                  ? <img src={a.photo_url} alt="" className="h-9 w-9 shrink-0 rounded-full border border-line2 object-cover" />
                  : <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line2 bg-surface font-display text-sm text-ink">{(a.stage_name || '★').slice(0, 1)}</span>}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{a.stage_name}</span>
                  {a.genre && <span className="chip mt-0.5 inline-flex bg-na-bg text-[10px] text-muted">{a.genre}</span>}
                </span>
                {isActive && <span className="chip shrink-0 bg-[rgba(190,226,78,0.10)] text-[10px] text-[#CBEE72]">✓ {S.actSwitch.active}</span>}
              </button>
            )
          })}
          {acts.length === 0 && <p className="py-4 text-center text-xs text-muted">—</p>}
        </div>
        <form onSubmit={createNewAct} className="mt-3 flex items-center gap-2">
          <input className="field flex-1" maxLength={60} value={newActName}
            placeholder={S.actSwitch.newActNamePh} aria-label={S.actSwitch.newActCta}
            onChange={(e) => setNewActName(e.target.value)} disabled={actBusy} />
          <button type="submit" disabled={actBusy || !newActName.trim()}
            className="btn btn-primary shrink-0 text-sm disabled:opacity-50">
            {S.actSwitch.newActCreate}
          </button>
        </form>
        <p className="mt-2 text-[11px] leading-relaxed text-faint">{S.actSwitch.newActHint}</p>
      </BottomSheet>
    </div>
  )
}

// ── R-4 (T-82, §8.2 4-zone) — the ONE planet-inspector body, shared verbatim
// between the mobile BottomSheet and the md+ persistent right rail so the two
// surfaces can never drift apart. R-2 locked-prokit panel lives here too, so
// both surfaces show the same "Not needed yet" chip + single CTA.
function PlanetPanelContent({ selected, sel, S, T, coachScene, batchable, bulkBusy, onConfirmMany, panelNodes, rowProps, confirming, bloomIds, confirmNode, onSaved, onGoLive }) {
  if (!sel) return null

  // R-2 — Professional Kit stays locked until the Act's live draw is backed;
  // a sequencing hook, never shame styling. ONE CTA, routes to the live planet.
  if (selected === 'prokit' && sel.state === 'locked') {
    return (
      <div className="py-6 text-center">
        <span className="chip mx-auto mb-3 inline-flex bg-na-bg text-[10px] text-muted">{S.state.locked}</span>
        <p className="mx-auto max-w-[260px] text-xs leading-relaxed text-muted">{S.lockedChip}</p>
        <button className="btn-primary mt-4 min-h-[44px] px-4 py-2.5 text-xs" onClick={onGoLive}>
          {S.lockedCta}
        </button>
      </div>
    )
  }

  return (
    <>
      {/* N3 (T-65, §8.3) — the COACHING LINE, Inspector Layer 1: names the
          artist's actual scene + why this dimension matters there. Scene-
          standard framing ONLY (a fact about the scene, never about peers);
          G2 — no genre signal → no line. Artist-private (N5 test). */}
      {coachScene && S.coach?.[selected] && (
        <p className="mb-3 text-xs leading-relaxed text-muted">
          <span className="font-semibold text-ink">{S.coachIn(coachScene)}</span>{' '}
          {S.coach[selected]}
        </p>
      )}
      {batchable.length >= 2 && (
        <button className="btn-primary mb-3 min-h-[44px] w-full py-2.5 text-xs" onClick={() => onConfirmMany(batchable)} disabled={bulkBusy}
          aria-label={S.confirmAllCta(batchable.length)}>
          {bulkBusy ? <Spinner /> : S.confirmAllCta(batchable.length)}
        </button>
      )}
      <div className="space-y-2">
        {panelNodes.map((n) => (
          <PlanetRow key={n.id} node={n} planet={selected} {...rowProps}
            busy={confirming === n.id}
            bloom={bloomIds.has(n.id)}
            onConfirm={() => confirmNode(n)}
            onSaved={onSaved} />
        ))}
        {panelNodes.length === 0 && (
          <p className="py-6 text-center font-mono text-[10px] text-muted">—</p>
        )}
      </div>
    </>
  )
}

// ── One source row inside a panel ─────────────────────────────────────────────
// EVIDENCE INTEGRITY: an actionable (found/review) claim row shows, BEFORE the
// button — (1) the exact claim wording, (2) the concrete source (method label +
// identifiable reference), (3) the honest proves / doesn't-prove line. The
// button names what it confirms. Non-claim rows keep the inline expander +
// in-place fill form. Never a second modal above the panel.
function PlanetRow({ node: n, planet, S, T, busy, bloom, onConfirm, onEvidence, artist, onArtistChange, onActChange, onItemsRefresh, onClaimsChange, onSaved, onPeek }) {
  const [open, setOpen] = useState(false)
  const chip = NODE_CHIP[n.state]
  const actionable = (n.state === NODE.FOUND || n.state === NODE.REVIEW) && !!n.claim
  const c = n.claim
  const methodKey = c ? methodLabelFor({ method_label: c.method_label, verification_status: c.verification_status, expires_at: c.expires_at }) : null
  const ref = sourceRef(n)
  const wording = c ? (c.value || human(c.claim_type)) : n.label

  // R-1(c) — long-press (~500ms touch / mouse-down hold) on this source row
  // peeks the SAME method-label text already rendered in the chip below —
  // no new information, just a quick-glance affordance. Must not also fire
  // the row's normal click (the confirm button), guarded via capture phase.
  const lpTimer = useRef(null)
  const lpFired = useRef(false)
  function lpStart() {
    if (!actionable) return
    lpFired.current = false
    clearTimeout(lpTimer.current)
    const text = T.methodLabel[methodKey] || human(methodKey)
    lpTimer.current = setTimeout(() => { lpFired.current = true; onPeek?.(text) }, 500)
  }
  function lpClear() { clearTimeout(lpTimer.current) }
  function lpGuardClick(e) { if (lpFired.current) { e.preventDefault(); e.stopPropagation(); lpFired.current = false } }
  const longPressRowProps = actionable ? {
    onTouchStart: lpStart, onTouchEnd: lpClear, onTouchMove: lpClear, onTouchCancel: lpClear,
    onMouseDown: lpStart, onMouseUp: lpClear, onMouseLeave: lpClear,
    onClickCapture: lpGuardClick, onContextMenu: (e) => e.preventDefault(),
  } : {}

  // Recognized platform first (link URL, or the claim's source_type / label —
  // covers non-link sources like a ticket export or a WhatsApp field); falls
  // back to the planet's own icon only when nothing is recognized.
  const platform = detectPlatform(n.url) || detectPlatform(c?.source_type) || detectPlatform(n.label)
  const icon = platform
    ? <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line bg-surface2 text-ink/80"><PlatformLogo name={platform} size={16} /></span>
    : <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-na-bg text-muted"><GpIcon id={PLANETS.find((p) => p.key === planet)?.icon || 'gp-source'} className="h-4 w-4" /></span>

  if (actionable) {
    return (
      <div {...longPressRowProps}
        className={`rounded-xl border border-line bg-surface2 px-3 py-3 transition ${busy ? 'opacity-60' : ''} ${bloom ? 'bloom-confirm' : ''}`}>
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
          className="mt-2.5 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-line2 bg-surface2 px-3 py-2 text-xs font-bold text-accent transition-colors hover:bg-raise disabled:opacity-50"
          onClick={onConfirm} disabled={busy}
          aria-label={S.confirmNamed(wording)}>
          {busy ? <Spinner /> : <><span aria-hidden>✓</span><span className="truncate">{S.confirmNamed(wording)}</span></>}
        </button>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border border-line bg-surface2 px-3 py-3 transition ${busy ? 'opacity-60' : ''} ${bloom ? 'bloom-confirm' : ''}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">{n.label}</span>
          <span className="block truncate text-[11px] text-muted">{n.sub}</span>
        </span>
        <span className={`chip shrink-0 text-[10px] ${chip.c}`}>{chip.icon}</span>
      </div>

      {/* N2 (T-65, §8.3 node law) — why a buyer cares, per field, from the
          registry (§16.A.5b). The buyer's reasoning next to the ask is what
          turns a form field into coaching. Artist-private only (N5 test). */}
      {n.why && S.why?.[n.why] && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-faint">{S.why[n.why]}</p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {n.state === NODE.MISSING && !n.fill && n.evidence && (
          <button className="min-h-[44px] rounded-lg border border-line2 bg-surface2 px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:bg-raise" onClick={onEvidence}>
            {S.fill.openEvidence}
          </button>
        )}
        <button
          className="min-h-[44px] rounded-lg border border-line2 bg-surface2 px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted transition-colors hover:bg-raise hover:text-ink"
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
              onActChange={onActChange}
              onItemsRefresh={onItemsRefresh}
              onClaimsChange={onClaimsChange}
              onDone={(undoFn) => { setOpen(false); onSaved(undoFn) }}
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
function MissingFill({ node, artist, S, onArtistChange, onActChange, onItemsRefresh, onClaimsChange, onDone }) {
  const { T, BANDS } = useLang() // band options + goal labels are localized
  const { kind, field, max, placeholder, set } = node.fill
  const [v, setV] = useState('')
  const [v2, setV2] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function run(fn, undoFn = null) {
    setBusy(true); setErr('')
    try { await fn(); onDone(undoFn) }
    catch (e) { setErr(e.message || T.common.error) }
    finally { setBusy(false) }
  }

  // D6 undo: restore the field's PREVIOUS value (usually empty — the node
  // returns to its invitation state). Firewall-neutral: a data restore only.
  const saveArtist = (patch) => {
    const prev = {}
    for (const k of Object.keys(patch)) prev[k] = artist[k] ?? null
    return run(async () => { await onArtistChange(patch) }, () => onArtistChange(prev))
  }

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

      {/* band — the deferred draw bands (firewall: a BAND is the only public
          form; chips reuse the old wizard's picker pattern, in place) */}
      {kind === 'band' && (
        <div className="flex flex-wrap gap-2">
          {(BANDS[set] || []).map((o) => (
            <button key={o} disabled={busy} onClick={() => saveArtist({ [field]: o })}
              className="chip min-h-[44px] border border-line2 bg-surface2 px-4 py-2 font-mono text-ink/85 transition-colors hover:border-line2">
              {o}
            </button>
          ))}
        </div>
      )}

      {/* yes/no — deferred booleans that carry information either way (e.g.
          sells own tickets); an honest "no" is a valid, saveable answer */}
      {kind === 'yesno' && (
        <div className="flex gap-2">
          {[[T.common.yes, true], [T.common.no, false]].map(([t, val]) => (
            <button key={t} disabled={busy} onClick={() => saveArtist({ [field]: val })}
              className="chip min-h-[44px] border border-line2 bg-surface2 px-5 py-2 font-mono text-ink/85 transition-colors hover:border-line2">
              {t}
            </button>
          ))}
        </div>
      )}

      {/* goal (Act-level, canon A4) — guidance only: prioritizes evidence
          paths, never changes what is true. "Not sure" is a valid answer. */}
      {kind === 'goal' && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(T.onboarding.goals).map(([g, label]) => (
            <button key={g} disabled={busy}
              onClick={() => run(async () => {
                if (onActChange) await onActChange({ artist_goal: g })
                else await updateAct(artist.id, { artist_goal: g })
              })}
              className="chip min-h-[44px] border border-line2 bg-surface2 px-3 py-2 text-sm font-semibold text-ink/85 transition-colors hover:border-line2">
              {label}
            </button>
          ))}
        </div>
      )}

      {(kind === 'text' || kind === 'url') && (
        <>
          <input className="field" dir={kind === 'url' ? 'ltr' : undefined} maxLength={max}
            placeholder={kind === 'url' ? S.fill.urlPlaceholder : (placeholder || node.label)}
            value={v} onChange={(e) => setV(e.target.value)} />
          {kind === 'url' && v.trim() && !/^https?:\/\//i.test(v.trim()) && (
            <p className="text-[11px] text-need" role="status">{S.fill.urlInvalid}</p>
          )}
          <button className="btn-ghost w-full" disabled={busy || !v.trim() || (kind === 'url' && !/^https?:\/\//i.test(v.trim()))} onClick={() => saveArtist({ [field]: v.trim() })}>
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
          {v !== '' && !(parseInt(v, 10) > 0) && (
            <p className="text-[11px] text-need" role="status">{S.fill.numberInvalid}</p>
          )}
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
          {v.trim() && !/^https?:\/\//i.test(v.trim()) && (
            <p className="text-[11px] text-need" role="status">{S.fill.urlInvalid}</p>
          )}
          <button className="btn-ghost w-full" disabled={busy || !/^https?:\/\//i.test(v.trim())}
            onClick={() => run(async () => {
              const value = v.trim()
              await addProfileItem({ artist_id: artist.id, item_type: 'link', title: 'link', public_url: value, visibility: 'passport-ok', source_status: 'artist-provided' })
              await onItemsRefresh?.()
              // Same source also becomes evidence → runs through the AI claim
              // pipeline right here so the resulting found/review node appears
              // in this same radar session, not only after a reload.
              try {
                await addEvidence({
                  artist_id: artist.id, evidence_type: 'link', source_type: 'public-profile',
                  value, public_url: value, claim_intent: 'consistent-frequency', source_owner_consent: true,
                })
                await processEvidence(artist.id)
                if (onClaimsChange) onClaimsChange(await listClaims(artist.id))
              } catch { /* evidence mirror is best-effort — the profile link itself is already saved */ }
            })}>
            {busy ? <Spinner /> : S.fill.save}
          </button>
        </>
      )}

      {err && <p className="text-xs text-need" role="alert">{err}</p>}
    </div>
  )
}

// The artist IS the center of the universe — photo first, in the one gold aura.
// The whole identity block is the Act-switch trigger (Design Spec §MULTI-ACT):
// tapping the stage name opens the Act-switch sheet; the active Act's genre
// renders as a small chip underneath, itself tappable → the Identity panel.
function CenterStar({ artist, T, S, dim, onOpenSwitch, onTagClick }) {
  return (
    <div className={`text-center transition-opacity ${dim ? 'opacity-50' : ''}`}>
      <button type="button" onClick={onOpenSwitch} aria-haspopup="dialog" aria-label={S?.actSwitch?.switchAria}
        className="tap-target mx-auto flex flex-col items-center rounded-2xl px-2 py-1 transition-opacity hover:opacity-90">
        {artist.photo_url
          ? <img src={artist.photo_url} alt="" className="glow-found mx-auto h-20 w-20 rounded-full border border-gold/70 object-cover shadow-[0_0_28px_rgba(242,192,99,0.25)] md:h-24 md:w-24" />
          : <span className="glow-found mx-auto grid h-20 w-20 place-items-center rounded-full border border-gold/70 bg-surface2 font-display text-xl text-ink shadow-[0_0_28px_rgba(242,192,99,0.18)] md:h-24 md:w-24 md:text-2xl">
              {(artist.stage_name || '★').slice(0, 1)}
            </span>}
        <span className="font-display mt-2 flex items-center gap-1 text-sm font-bold tracking-[-0.01em] text-ink">
          {artist.stage_name || T.radar.universe.you}
          <span aria-hidden className="text-[10px] text-faint">▾</span>
        </span>
      </button>
      {artist.genre && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onTagClick?.() }}
          aria-label={S?.actSwitch?.genreTagAria ? S.actSwitch.genreTagAria(artist.genre) : artist.genre}
          className="tap-target chip mt-1 bg-na-bg text-[10px] text-muted transition-colors hover:text-ink">
          {artist.genre}
        </button>
      )}
    </div>
  )
}
