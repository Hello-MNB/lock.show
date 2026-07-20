import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
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

// R-3 (T-82, §8.2 constellation threads) — the ambient thread colours, one
// per live state (amber/teal/lime/faint). Geometry is fixed by planet angle,
// identical for every artist — colour is a state only, it grades nothing.
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

// ── Shelf-card state chips (§8.2 RADAR FACE RULING #2) — the SAME AA-approved
// good/dev/need/na pairs used everywhere else on the face (§5.5), never a
// bespoke hex, so the shelf reads as one system with the Inspector/dock.
const SHELF_CHIP = {
  established: 'bg-good-bg text-good',
  developing: 'bg-dev-bg text-dev',
  needs: 'bg-need-bg text-need',
  locked: 'bg-na-bg text-faint',
}
const SHELF_DOT = { established: 'bg-good', developing: 'bg-dev', needs: 'bg-need', locked: 'bg-faint' }

// ── THE 10-STATE PROOF-WIDGET MACHINE (T-90 build law · spec §5.8 full state
// set) — every one of the six shelf cards IS a widget and renders exclusively
// through this machine. The canon set, exactly ten, machine-checked by
// scripts/test-widget-states.mjs (a missing state FAILS the build):
//   8 CONTENT states (what the widget's data is doing right now):
//     empty · loading · found · needs-user · ready · error · not-mine · saved
//   2 DISPLAY states (how the widget is currently laid out — T-90 names both
//     widths; on desktop "mobile-expanded" is the inline right-rail grow):
//     mobile-collapsed · mobile-expanded
// FIREWALL: every line below is a bounded state word or a count of the
// artist's OWN items (§5.10 progress vocabulary) — never a %, never a rank.
export const WIDGET_STATES = Object.freeze({
  EMPTY: 'empty',
  LOADING: 'loading',
  FOUND: 'found',
  NEEDS_USER: 'needs-user',
  READY: 'ready',
  ERROR: 'error',
  NOT_MINE: 'not-mine',
  SAVED: 'saved',
  MOBILE_COLLAPSED: 'mobile-collapsed',
  MOBILE_EXPANDED: 'mobile-expanded',
})

// Own-item counts for one planet — the §5.10 "N of 8" precedent, artist-private.
export function widgetCounts(info) {
  const ns = info.nodes
  const confirmed = ns.filter((n) => n.state === NODE.CONFIRMED).length
  const found = ns.filter((n) => n.state === NODE.FOUND).length
  const review = ns.filter((n) => n.state === NODE.REVIEW).length
  const disputed = ns.filter((n) => n.state === NODE.REVIEW && n.claim?.status === 'disputed').length
  const missing = ns.filter((n) => n.state === NODE.MISSING).length
  return { confirmed, found, review, disputed, missing, open: missing + (review - disputed) }
}

// The derivation: live planet data + this widget's transient flags → ONE of
// the 8 content states. Rule-based only — nothing stored, nothing scored.
export function deriveWidgetState(info, { busy = false, error = false, saved = false } = {}) {
  if (error) return WIDGET_STATES.ERROR       // a save/confirm here failed — invite a retry
  if (busy) return WIDGET_STATES.LOADING      // a confirm/save is in flight right now
  if (saved) return WIDGET_STATES.SAVED       // just landed — brief named receipt window
  const c = widgetCounts(info)
  if (info.state === 'locked') return WIDGET_STATES.EMPTY // "Not needed yet" — the quiet empty variant
  if (c.found > 0) return WIDGET_STATES.FOUND // ✦ LOCK found something — waiting for the artist
  if (c.disputed > 0 && c.confirmed === 0) return WIDGET_STATES.NOT_MINE // flagged "not mine" — recorded, never deleted
  if (c.confirmed === 0 && c.review === 0) return WIDGET_STATES.EMPTY // only invitations here so far
  if (c.open === 0 && c.confirmed > 0) return WIDGET_STATES.READY // confirmed, no gaps
  return WIDGET_STATES.NEEDS_USER             // partly confirmed — gaps remain as invitations
}

// ── The render map — ONE entry per canon state, no state renders outside it.
// Content entries return the card's one honest sentence (+ tone); the two
// display entries return the widget's whole surface (collapsed card / the
// expanded in-place body shared by the mobile sheet AND the desktop rail).
const WIDGET_RENDER = {
  [WIDGET_STATES.EMPTY]: ({ info, S }) => ({
    line: info.state === 'locked' ? S.lockedChip : S.widget.emptyLine, cls: 'text-muted' }),
  [WIDGET_STATES.LOADING]: ({ S }) => ({ line: S.widget.loadingLine, cls: 'text-muted', spin: true }),
  [WIDGET_STATES.FOUND]: ({ info, S }) => ({ line: S.shelf.needsLine(info.foundCount), cls: 'text-gold' }),
  [WIDGET_STATES.NEEDS_USER]: ({ counts, S }) => ({ line: S.shelf.developingLine(counts.confirmed, counts.open), cls: 'text-muted' }),
  [WIDGET_STATES.READY]: ({ counts, S }) => ({ line: S.shelf.readyLine(counts.confirmed), cls: 'text-muted' }),
  [WIDGET_STATES.ERROR]: ({ S }) => ({ line: S.widget.errorLine, cls: 'text-need' }),
  [WIDGET_STATES.NOT_MINE]: ({ S }) => ({ line: S.widget.notMineLine, cls: 'text-faint' }),
  [WIDGET_STATES.SAVED]: ({ S }) => ({ line: S.widget.savedLine, cls: 'text-good' }),
  [WIDGET_STATES.MOBILE_COLLAPSED]: (ctx) => <ProofWidgetCard {...ctx} />,
  [WIDGET_STATES.MOBILE_EXPANDED]: (ctx) => <ProofWidgetExpanded {...ctx} />,
}
export function renderWidgetState(state, ctx) {
  const r = WIDGET_RENDER[state]
  return r ? r(ctx) : null
}

// ── Ambient atmosphere (§8.2 RADAR FACE RULING #3, owner design-sprint pick
// 21 Jul) — "The radial visual survives as FAINT ATMOSPHERE ONLY behind the
// coach card: ambient, non-interactive, never the navigation." A simplified
// rendering of the SAME geometry (orbit rings + the R-3 state-coloured
// threads, planetXY-derived so it can never drift from the real planet
// angles) at low opacity — no planet icons, no captions, no tap targets.
// The R-3 constellation-thread layer — the ONE inline SVG literal this file
// carries (asset-law budget: allowlisted for exactly one), shared by the
// ambient atmosphere AND the full-universe view so the two can never drift.
function ThreadLayer({ uni, lockedOpacity = 0.12, opacity = 0.4 }) {
  return (
    <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {PLANETS.map((p) => {
        const { x, y } = planetXY(p.angle)
        const st = uni.planets[p.key].state
        return (
          <line key={p.key} x1="50" y1="50" x2={x} y2={y} stroke="currentColor" strokeWidth={1}
            vectorEffect="non-scaling-stroke" opacity={st === 'locked' ? lockedOpacity : opacity}
            className={THREAD_STROKE[st] || THREAD_STROKE.developing} />
        )
      })}
    </svg>
  )
}

function AmbientUniverse({ uni }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.14]">
      <div className="relative aspect-square w-[150%] max-w-[820px] shrink-0 sm:w-[115%]">
        <div className="absolute inset-[9%] rounded-full border border-line" />
        <div className="absolute inset-[27%] rounded-full border border-line" />
        <ThreadLayer uni={uni} />
      </div>
    </div>
  )
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
  // ── T-90 widget-machine transient flags, per planet key: a failed save
  // (error state, cleared on reopen), a just-landed save (saved state, ~2.4s
  // named-receipt window). Node ids are `${planet}-…`, so the planet of any
  // node is recoverable without threading a prop through every call site.
  const planetOfNode = (n) => String(n?.id || '').split('-')[0]
  const [wErr, setWErr] = useState(() => ({}))
  const [wSaved, setWSaved] = useState(() => ({}))
  const savedTimers = useRef({})
  useEffect(() => () => Object.values(savedTimers.current).forEach(clearTimeout), [])
  function markSaved(planet) {
    if (!planet) return
    setWErr((e) => (e[planet] ? { ...e, [planet]: false } : e))
    setWSaved((s) => ({ ...s, [planet]: true }))
    clearTimeout(savedTimers.current[planet])
    savedTimers.current[planet] = setTimeout(() => setWSaved((s) => ({ ...s, [planet]: false })), 2400)
  }
  function markError(planet) { if (planet) setWErr((e) => ({ ...e, [planet]: true })) }
  // ── T-90 RADAR RULING B — the full radial universe opens on an explicit
  // tap (secondary affordance, never the primary CTA); the ambient radial
  // behind Home stays faint + non-interactive (§8.2 ruling #3).
  const [universeOpen, setUniverseOpen] = useState(false)
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

  // ── THE RADAR FACE RULING (§8.2, owner design-sprint pick 21 Jul) — the coach
  // card's headline is the §8.3 Layer-1 coaching voice, scene-aware, aimed at
  // whichever planet the next-best-action actually targets (falling back to
  // the family's own first-priority planet when the NBA has none) — the SAME
  // coachIn()+coach[] sentence the Inspector already renders, never new prose.
  const coachTargetPlanet = nextAction?.planet || genreLabelPlanet || null

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

  // lock body scroll while a panel (or the full universe view) is open
  useEffect(() => {
    const open = !!selected || review || universeOpen
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selected, review, universeOpen])

  // T-90 widget machine — opening a widget clears its error flag (the retry
  // invitation was taken; the panel's own rows carry live state from here).
  useEffect(() => {
    if (selected && wErr[selected]) setWErr((e) => ({ ...e, [selected]: false }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

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
      markSaved(planetOfNode(node)) // T-90 widget machine — the saved state's receipt window
      clearTimeout(undoRef.current)
      setUndo({ claim: c })
      undoRef.current = setTimeout(() => setUndo(null), 7000)
    } catch {
      // T-90 widget machine — the widget itself turns to its error state
      // (a warm retry invitation on the card), never a silent unhandled throw.
      markError(planetOfNode(node))
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
  // T-90 widget machine — which widget is mid-work right now (loading state):
  // a single confirm carries its planet in the node id; a bulk confirm always
  // runs on the currently-open widget.
  const busyPlanet = confirming ? String(confirming).split('-')[0] : bulkBusy ? selected : null
  // T-90 RULING C — the quiet progress count: the artist's OWN ready rooms.
  const readyRooms = PLANETS.filter((p) => uni.planets[p.key].state === 'established').length

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
      markSaved(planetOfNode(list[0])) // T-90 widget machine — saved receipt on the touched widget
      flash(S.bulkConfirmed(list.length, destinationOf(list[0].claim, S)))
    } catch {
      markError(planetOfNode(list[0])) // T-90 widget machine — error state, warm retry on the card
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

  // §8.2 RADAR FACE RULING — law 3 (§6): exactly ONE primary CTA at a time.
  // The Inspector (desktop rail OR mobile sheet — same PlanetPanelContent
  // either way) holds its OWN .btn-primary whenever it shows a batch-confirm
  // or the locked-prokit CTA; whenever it does, the coach card below cedes
  // its CTA (keeping only its headline/next-move text visible). No longer
  // width-gated (T-9x cleanup): the same rule now holds on mobile too, where
  // the coach card and the sheet can otherwise both be on screen at once.
  const panelHoldsCTA = !!sel && (
    (selected === 'prokit' && sel.state === 'locked') || batchable.length >= 2
  )

  return (
    // §8.2 RADAR FACE RULING (owner design-sprint pick, 21 Jul — ratify: R00) —
    // ONE warm coach card owns the screen's center of gravity; the radial
    // survives only as faint atmosphere behind it; the six dimensions become a
    // calm shelf below. Viewport law (§6 law 7) unchanged: md+ still FLEXES to
    // the dashboard's remaining height. Mobile needs a DEFINITE height (not
    // just a max-height cap) for the shelf's flex-1/overflow-y-auto below to
    // resolve at all — a max-height-only box sizes to its content and leaves
    // flex-grow nothing to distribute, collapsing the shelf to 0px. A real
    // height forces the shelf — a "long ledger" (§6 law 7 exception) — to
    // scroll WITHIN this panel instead of ever pushing the page itself.
    <div className="relative flex h-[70vh] shrink-0 flex-col overflow-hidden rounded-3xl border border-line bg-bg2 p-3 sm:p-5 md:h-auto md:min-h-0 md:flex-1 md:p-6">
      {/* the ONE warm light — backstage lamp above the artist (gold budget: this + method labels). */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 h-64 md:-top-16 md:h-[600px]"
        style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(242,192,99,0.12), transparent 70%)' }} />

      {/* R-4 (T-82, §8.2 4-zone) — md+: the coach/shelf column and the
            persistent right-rail inspector sit side by side. Nothing here
            changes when no planet is selected (the rail simply doesn't
            render) — no layout jump on load. */}
      <div className="relative flex min-h-0 flex-1 flex-col md:flex-row md:items-stretch md:gap-5">
      <div className="relative flex min-h-0 flex-1 flex-col md:min-w-0"
        onTouchStart={onStageTouchStart} onTouchEnd={onStageTouchEnd}>

        {/* THE RADAR FACE RULING #3 — the radial universe demoted to faint,
              non-interactive atmosphere behind everything below (never the
              navigation — tapping it does nothing; the shelf is the tap
              surface now). */}
        <AmbientUniverse uni={uni} />

        {/* R-1(c) — long-press method peek, transient overlay (auto-dismiss
            ~1.8s), reusing the exact wording already rendered elsewhere. */}
        {peek && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1 z-20 flex justify-center">
            <span className="rounded-full border border-gold/40 bg-surface/95 px-3 py-1 text-center font-mono text-[9px] uppercase tracking-[0.08em] text-gold shadow-card">
              {peek}
            </span>
          </div>
        )}

      {blossom ? (
        <div className="relative z-10 py-6 text-center">
          <CenterStar artist={effArtist} T={T} S={S} dim
            onOpenSwitch={() => (selected ? setSelected(null) : setActSheet(true))}
            onTagClick={() => setSelected('identity')} />
          <h3 className="font-display mt-5 text-xl font-bold text-ink">{S.blossomTitle}</h3>
          <p className="mx-auto mt-1.5 max-w-[300px] text-xs leading-relaxed text-muted">{S.blossomBody}</p>
          <button className="btn-primary mt-4 min-h-[44px] px-4 py-2.5 text-xs" onClick={() => nav(evidenceRoute)}>{S.blossomCta}</button>
        </div>
      ) : (
        <>
          {/* Identity — the Act-switch trigger (Design Spec §MULTI-ACT), now a
              small top-of-card row (chrome minimal, ruling point 4) instead of
              the old center-of-universe star. */}
          <div className="relative z-10 mb-1 flex shrink-0 items-center justify-between gap-2">
            <button type="button" onClick={() => (selected ? setSelected(null) : setActSheet(true))}
              aria-haspopup="dialog" aria-label={S?.actSwitch?.switchAria}
              className="tap-target -m-1 flex min-w-0 items-center gap-2.5 rounded-xl p-1 text-start transition-opacity hover:opacity-90">
              {effArtist.photo_url
                ? <img src={effArtist.photo_url} alt="" className="h-8 w-8 shrink-0 rounded-full border border-gold/60 object-cover" />
                : <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/60 bg-surface2 font-display text-xs text-ink">{(effArtist.stage_name || '★').slice(0, 1)}</span>}
              <span className="min-w-0">
                <span className="font-display flex items-center gap-1 text-sm font-bold text-ink">
                  {effArtist.stage_name || S.you}
                  <span aria-hidden className="text-[10px] text-faint">▾</span>
                </span>
                {/* L1 fit law: WRAPS, never truncates — the universe entry now
                    shares this row, so a long genre must fold, not clip. */}
                {effArtist.genre && <span className="block text-[11px] leading-snug text-muted">{effArtist.genre}</span>}
              </span>
            </button>
            {/* T-90 RADAR RULING B — the explicit "Open Radar universe" entry:
                a quiet secondary (mono ghost, never .btn-primary — the coach
                card below keeps the screen's ONE primary, §6 law 3). */}
            <button type="button" onClick={() => setUniverseOpen(true)}
              aria-haspopup="dialog"
              className="tap-target flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted transition-colors hover:border-line2 hover:text-ink">
              <span aria-hidden className="grid h-3.5 w-3.5 place-items-center">
                <span className="block h-3 w-3 rounded-full border border-current opacity-80" />
              </span>
              {S.openUniverse}
            </button>
          </div>
          {/* N4 (T-65, §5.10) — the own-history line: additive, positive-only,
              the artist against their own past; renders only when something
              new exists. */}
          {history && (
            <p className="relative z-10 mb-2 shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-gold/80">
              {S.historyLine(history.n, history.since.toLocaleDateString(undefined, { month: 'long' }))}
            </p>
          )}

          {/* ONE quiet control row (ruling point 4 — "fold into one quiet
              control if it clutters"): the scene lens and the state lens now
              share a single horizontally-scrollable row instead of two
              absolutely-positioned rails, so nothing floats over the
              Inspector (the old corner-collision fix is no longer needed). */}
          <div className="relative z-10 mb-2 flex shrink-0 items-center gap-1.5 overflow-x-auto pb-1 md:mb-3" role="tablist" aria-label={S.filtersLabel}>
            {scenes.length > 0 && (
              <>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">{S.sceneLabel}</span>
                {[null, ...scenes].map((g) => (
                  <button key={g || 'all'} role="tab" aria-selected={scene === g} onClick={() => setScene(g)}
                    className={`tap-target shrink-0 rounded-full border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                      scene === g ? 'border-gold/60 bg-gold/10 text-gold' : 'border-transparent bg-surface2 text-muted hover:bg-raise'
                    }`}>
                    {g || S.sceneAll}
                  </button>
                ))}
                <span aria-hidden className="mx-1 h-4 w-px shrink-0 bg-line" />
              </>
            )}
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

          {/* ── THE RADAR FACE RULING #1 — ONE warm coach card owns the
                screen's center of gravity: the scene-aware coaching headline
                (§8.3 Layer-1 voice) + the single next move with its reason +
                time (the SAME pickNextAction/withGenreNote data). This ONE
                card replaces both the old floating md+ dock AND
                ArtistDashboard's separate mobile next-step card — one coach,
                one CTA, every width (panelHoldsCTA below keeps the CTA count
                at exactly one, §6 law 3). ── */}
          {nextAction && (
            <div className="relative z-10 mx-auto mb-2 w-full max-w-xl shrink-0 rounded-2xl border border-line2 bg-surface2/70 px-4 py-2.5 text-center shadow-card sm:mb-2.5 sm:px-7 sm:py-3">
              <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-gold sm:mb-2">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold" />
                {T.radar.coachEyebrow}
              </span>
              {/* §8.3 Layer-1 voice, reused verbatim: names the artist's real
                  scene + why this dimension matters there; no scene signal →
                  the neutral fallback (G2 guard — identical rule to the
                  Inspector's own coaching line, §8.3). Mobile sizes are one
                  notch tighter so the shelf below keeps real height (§6 law 2:
                  mobile designed, never shrunk — the copy never clips). */}
              <p className="font-display mx-auto max-w-lg text-[15px] font-bold leading-snug text-ink sm:text-lg">
                {coachScene && coachTargetPlanet && S.coach?.[coachTargetPlanet]
                  ? <>{S.coachIn(coachScene)} {S.coach[coachTargetPlanet]}</>
                  : T.radar.nextMove}
              </p>
              <p className="mx-auto mt-1 max-w-md text-[13px] font-semibold text-ink/90 sm:mt-1.5 sm:text-sm">{nextAction.title}</p>
              {nextAction.why && (
                <p className="mx-auto mt-1 max-w-md text-[11px] leading-relaxed text-muted sm:text-[12px]">
                  {nextAction.why}
                  {nextAction.time != null && <span className="text-faint"> {T.radar.timeHint(nextAction.time)}</span>}
                </p>
              )}
              {!panelHoldsCTA && (nextAction.to || nextAction.planet) && (
                <button className="btn-primary mt-2 px-6 py-2 text-sm sm:mt-2.5" onClick={() => onNextAction?.(nextAction)}>
                  {T.common.continue}
                </button>
              )}
            </div>
          )}

          {/* ── T-90 RADAR RULING C — the quiet progress widget: a count of
                the artist's OWN ready rooms + six discrete dots (§5.10 count
                vocabulary — steps, never a bar-as-gauge, never a %). ── */}
          <div className="relative z-10 mb-1 flex shrink-0 items-center justify-center gap-2 md:mb-1.5"
            aria-label={S.progress.roomsAria(readyRooms, PLANETS.length)}>
            <span aria-hidden className="flex items-center gap-1">
              {PLANETS.map((p) => (
                <span key={p.key} className={`h-1.5 w-1.5 rounded-full ${
                  uni.planets[p.key].state === 'established' ? 'bg-accent' : 'border border-line2'}`} />
              ))}
            </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-faint">
              {S.progress.rooms(readyRooms, PLANETS.length)}
            </p>
          </div>

          {/* ── THE RADAR FACE RULING #2 + T-90 — the calm shelf is six true
                WIDGETS, each rendered ONLY through the 10-state machine
                (deriveWidgetState → renderWidgetState; the collapsed card is
                the machine's mobile-collapsed path). Tap a widget → INLINE
                expand (mobile bottom-sheet / desktop rail — the machine's
                mobile-expanded path), never a route. A long shelf scrolls
                WITHIN this bounded region (§6 law 7), never the page. ── */}
          {/* Mobile = a literal horizontal SHELF (§8.2 ruling #2 wording; the
              milestone-strip precedent for a bounded, h-scrollable internal
              panel) so all six widgets stay visible+tappable below the coach
              card in one viewport; md+ = the grid inside a contained-scroll
              region as before. */}
          <div className="relative z-10 min-h-0 flex-1 overflow-x-auto overflow-y-hidden pb-1 pe-0.5 md:overflow-y-auto md:overflow-x-visible md:pb-0">
            {/* Rail open (md+) → fewer, wider columns; the extra rows scroll
                inside this bounded region (§6 law 7 contained-scroll). */}
            <div className={`flex items-stretch gap-1.5 md:grid md:gap-2 ${fullStage && sel ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-6'}`}>
              {PLANETS.map((p) => {
                const info = uni.planets[p.key]
                const counts = widgetCounts(info)
                const contentState = deriveWidgetState(info, {
                  busy: busyPlanet === p.key, error: !!wErr[p.key], saved: !!wSaved[p.key],
                })
                return (
                  <Fragment key={p.key}>
                    {renderWidgetState(WIDGET_STATES.MOBILE_COLLAPSED, {
                      p, info, S,
                      body: renderWidgetState(contentState, { info, counts, S }),
                      primary: genrePrimary.has(p.key),
                      isSelected: selected === p.key,
                      dimmed: !info.nodes.some(matchesFilter) && (filter !== 'all' || world),
                      onOpen: () => setSelected(p.key),
                    })}
                  </Fragment>
                )
              })}
            </div>
          </div>
        </>
      )}
      </div>

      {/* R-4 (T-82, §8.2 4-zone "RIGHT · the persistent Planet Inspector") —
            md+ only, and only while a planet is selected (collapses back to
            nothing otherwise — no layout jump on the default/no-selection
            view). Mobile keeps the BottomSheet below exactly as-is. Same
            panel content (PlanetPanelContent) as the sheet — no forked copy. */}
      {fullStage && sel && (
        <aside aria-label={S.shelf.names[selected]} className="relative hidden shrink-0 flex-col rounded-2xl border border-line bg-surface2/60 px-4 pb-4 pt-4 md:flex md:w-[300px] md:min-h-0">
          <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
            {/* T-90 — the expanded widget carries the SAME plain name the
                artist tapped on the shelf (one vocabulary, never a technical
                rename mid-gesture). */}
            <h2 className="font-display text-sm font-bold text-ink">{S.shelf.names[selected]}</h2>
            <button type="button" onClick={() => setSelected(null)}
              className="tap-target shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted hover:text-ink">
              {S.backToUniverse}
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pe-0.5">
            {/* T-90 — the machine's mobile-expanded path IS the desktop inline
                grow too (§5.8: one expanded body, two widths, never forked). */}
            {renderWidgetState(WIDGET_STATES.MOBILE_EXPANDED, {
              selected, sel, S, T, coachScene,
              batchable, bulkBusy, onConfirmMany: confirmMany,
              panelNodes, rowProps, confirming, bloomIds,
              confirmNode: confirm,
              onSaved: (undoFn) => { markSaved(selected); flash(S.fill.savedInPlace, undoFn) },
              onGoLive: () => setSelected('live'),
            })}
          </div>
        </aside>
      )}
      </div>

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
      <BottomSheet open={!!selected && !fullStage} onClose={() => setSelected(null)} title={selected ? S.shelf.names[selected] : ''}>
        {sel && (
          <div className="max-h-[65vh] overflow-y-auto pe-0.5">
            {/* T-90 — the machine's mobile-expanded path, in the reused
                BottomSheet (never a route, never a forked panel copy). */}
            {renderWidgetState(WIDGET_STATES.MOBILE_EXPANDED, {
              selected, sel, S, T, coachScene,
              batchable, bulkBusy, onConfirmMany: confirmMany,
              panelNodes, rowProps, confirming, bloomIds,
              confirmNode: confirm,
              onSaved: (undoFn) => { markSaved(selected); flash(S.fill.savedInPlace, undoFn) },
              onGoLive: () => setSelected('live'),
            })}
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
                onSaved={(undoFn) => { markSaved(planet); flash(S.fill.savedInPlace, undoFn) }} />
            ))}
            {needsNodes.length === 0 && (
              <p className="py-6 text-center text-xs text-muted">{S.nothingNeedsYou}</p>
            )}
          </div>
        </div>
      </BottomSheet>

      {/* ── T-90 RADAR RULING B — the full Radar universe (the radial/planet
            world), opened ONLY by the explicit header tap. Same geometry as
            the ambient layer (planetXY — the two can never drift), full
            opacity, rooms tappable: tapping one closes this view and opens
            that widget's expanded body in place. Kept reachable, not
            redesigned in this step (step 2 of the T-90 build order). ── */}
      {universeOpen && (
        <div role="dialog" aria-modal="true" aria-label={S.universeTitle}
          className="fixed inset-0 z-[95] flex flex-col overflow-hidden bg-bg p-4 sm:p-6">
          <div className="flex shrink-0 items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-ink">{S.universeTitle}</h2>
              <p className="mt-0.5 text-xs text-muted">{S.universeHint}</p>
            </div>
            <button type="button" onClick={() => setUniverseOpen(false)} aria-label={S.closeUniverse}
              className="tap-target px-2 text-2xl leading-none text-muted hover:text-ink">×</button>
          </div>
          <div className="relative min-h-0 flex-1">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative aspect-square w-full" style={{ maxWidth: 'min(560px, 72vh)' }}>
                <div aria-hidden className="absolute inset-[9%] rounded-full border border-line" />
                <div aria-hidden className="absolute inset-[27%] rounded-full border border-line" />
                <ThreadLayer uni={uni} lockedOpacity={0.2} opacity={0.55} />
                {/* center star — the Act itself (stage_name only, one-name law) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  {effArtist.photo_url
                    ? <img src={effArtist.photo_url} alt="" className="mx-auto h-14 w-14 rounded-full border border-gold/60 object-cover" />
                    : <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/60 bg-surface2 font-display text-lg text-ink">{(effArtist.stage_name || '★').slice(0, 1)}</span>}
                  <p className="font-display mt-1.5 text-sm font-bold text-ink">{effArtist.stage_name || S.you}</p>
                </div>
                {PLANETS.map((p) => {
                  const { x, y } = planetXY(p.angle)
                  const info = uni.planets[p.key]
                  const primary = genrePrimary.has(p.key)
                  return (
                    <button key={p.key} type="button"
                      onClick={() => { setUniverseOpen(false); setSelected(p.key) }}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      aria-label={`${S.shelf.names[p.key]} — ${S.state[info.state]}${primary ? ` · ${S.genrePrimary}` : ''}`}
                      className="tap-target absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
                      <span className={`grid h-11 w-11 place-items-center rounded-full border bg-surface ${primary ? 'border-gold/50' : 'border-line2'} ${info.state === 'locked' ? 'opacity-60' : ''}`}>
                        <GpIcon id={p.icon} className="h-5 w-5 text-ink/80" />
                      </span>
                      <span className="flex items-center gap-1 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.06em] text-muted">
                        <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${SHELF_DOT[info.state]}`} />
                        {S.shelf.names[p.key]}{primary && <span aria-hidden className="text-gold"> ★</span>}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

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

// ── T-90 · the widget's COLLAPSED surface (the machine's mobile-collapsed
// path — on desktop the same card is the shelf's resting face). One icon, the
// plain room name, ONE honest sentence (from the current content state's
// render entry), the bounded state chip. Tap → inline expand, never a route.
function ProofWidgetCard({ p, info, S, body, primary, isSelected, dimmed, onOpen }) {
  return (
    <button type="button" onClick={onOpen} aria-expanded={isSelected}
      aria-label={`${S.shelf.names[p.key]} — ${S.state[info.state]}${primary ? ` · ${S.genrePrimary}` : ''}`}
      className={`flex w-[176px] shrink-0 flex-col items-start gap-1 rounded-2xl border bg-surface px-3 py-1.5 text-start transition-opacity md:w-auto md:shrink md:px-3.5 md:py-2 ${
        dimmed ? 'opacity-40' : 'opacity-100'} ${isSelected ? 'border-line2 ring-1 ring-gold/30' : 'border-line'}`}>
      <span className="flex items-center gap-1.5">
        <span aria-hidden className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border border-line bg-surface2 ${info.state === 'locked' ? 'opacity-60' : ''}`}>
          <GpIcon id={p.icon} className="h-3 w-3 text-ink/80" />
        </span>
        <span className="font-display whitespace-nowrap text-[13px] font-bold leading-tight text-ink">{S.shelf.names[p.key]}</span>
        {primary && <span aria-hidden className="text-[10px] text-gold">★</span>}
      </span>
      <span className="min-w-0">
        <span className={`block text-[11px] leading-snug md:text-xs ${body?.cls || 'text-muted'}`}>
          {body?.spin && <Spinner className="me-1.5 !h-3 !w-3 align-[-2px]" />}
          {body?.line}
        </span>
        <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold md:text-[11px] ${SHELF_CHIP[info.state]}`}>
          <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${SHELF_DOT[info.state]}`} />
          {S.state[info.state]}
        </span>
      </span>
    </button>
  )
}

// ── T-90 · the widget's EXPANDED surface (the machine's mobile-expanded path;
// on desktop the identical body grows inline in the right rail). It IS the
// §8.3 Inspector content — one shared body, never a forked copy.
function ProofWidgetExpanded(props) {
  return <PlanetPanelContent {...props} />
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
          G2 — no genre signal → no line. Artist-private (N5 test).
          T-9x (owner verdict 21 Jul): the coach's voice LEADS the panel — a
          contained card + body-size text, ahead of the technical chrome
          (chips/labels) below it, not a quiet caption easy to miss. */}
      {coachScene && S.coach?.[selected] && (
        <p className="mb-3 rounded-xl border border-line bg-surface2/70 px-3 py-2.5 text-sm leading-relaxed text-ink/90">
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
          turns a form field into coaching. Artist-private only (N5 test).
          T-9x (owner verdict 21 Jul): this is the coaching voice, not fine
          print — reads at the same weight as the label above it, not faded
          into the chrome. */}
      {n.why && S.why?.[n.why] && (
        <p className="mt-1.5 text-xs leading-relaxed text-ink/70">{S.why[n.why]}</p>
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
