import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getMyArtist, upsertArtist, getMyAct, updateAct, listProfileItems, listClaims, publishPassport, unpublishArtist, hasConsent, recordConsentScope, getEntitlement } from '../../lib/db.js'
import { PageShell, Loading, EmptyState, ErrorState, BottomSheet, useToast } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { isPassportDirty, clearPassportDirty, markPassportDirty } from '../../lib/passportState.js'
import { logEvent, EVENTS } from '../../lib/analytics.js'
import RadarUniverse from './RadarUniverse.jsx'

// ── A9 Artist Radar (canon LF-A1, linear) ────────────────────────────────────
// Bounded dimension states + ONE next action. FIREWALL: rule-based states only —
// no score, no %, no fill bars; a gap renders as an invitation, never a failure.

// ONE prioritized action — a coach's single clearest move, never a list of ten.
// Deep links go to the SPECIFIC surface: claims → claim review (a radar panel),
// evidence-shaped work → evidence capture, deferred identity fields (photo) →
// the radar's own Identity planet fill (the shortened onboarding no longer
// collects them — a wizard restart is never the answer).
function pickNextAction(artist, items, claims, T) {
  const A = T.radar.nextActions
  const links = items.filter((i) => i.item_type === 'link')
  const exp = items.filter((i) => i.item_type !== 'link')
  const pending = claims.filter((c) => !c.artist_approved)
  const supported = claims.filter((c) => ['verified', 'supporting'].includes(c.verification_status))
  const evidenceRoute = `/evidence/${artist.id}`

  if (pending.length > 0) return { ...A.reviewClaims, to: '/artist/claims' }
  if (supported.length === 0) return { ...A.draw, to: evidenceRoute }
  if (!artist.photo_url) return { ...A.photo, planet: 'identity' } // deferred field → radar fill, in place
  if (links.length === 0) return { ...A.links, to: evidenceRoute }
  if (exp.length < 3) return { ...A.experience, to: evidenceRoute }
  if (!artist.lineup_frequency_band) return { ...A.bands, planet: 'proof' } // deferred band → radar fill
  // North-Star chain (rel-07.13 N3): the ladder never dead-ends at "done" —
  // once proof exists it drives publish → share → a real buyer reaction (the
  // Gate's first half). Pilot ruling: publishing is FREE — never a wall here.
  if (!artist.published) return { ...A.publish, to: '/artist/passport' }
  return { ...A.share, to: '/artist/passport' }
}

export default function ArtistDashboard() {
  const { T } = useLang()
  const { user } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [artist, setArtist] = useState(null)
  const [act, setAct] = useState(null)
  const [items, setItems] = useState([])
  const [claims, setClaims] = useState([])
  const [ent, setEnt] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [pubError, setPubError] = useState('')
  const [loadError, setLoadError] = useState(false)
  const [needPubConsent, setNeedPubConsent] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [pubSheet, setPubSheet] = useState(false)
  // IA: claim review is a MODE of the Radar — incrementing this opens the
  // radar's "Needs you" review panel in place (no navigation).
  const [reviewSignal, setReviewSignal] = useState(0)
  // Deferred-field next actions open a SPECIFIC planet panel in place.
  const [focusPlanet, setFocusPlanet] = useState(null)
  const [focusSignal, setFocusSignal] = useState(0)
  const arrivalShown = useRef(false)
  const radarLogged = useRef(false) // RADAR_OPENED once per visit (pilot signal A10)

  async function load() {
    setLoadError(false)
    try {
      const a = await getMyArtist(user.id)
      setArtist(a)
      if (a) {
        try { setAct(await getMyAct(a.id)) } catch { setAct(null) }
        setItems(await listProfileItems(a.id))
        setClaims(await listClaims(a.id))
        setEnt(await getEntitlement(a.id))
        setDirty(isPassportDirty(a.id))
        if (!radarLogged.current) { radarLogged.current = true; logEvent(EVENTS.RADAR_OPENED, { artist_id: a.id }) } // pilot signal
      }
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [user.id])

  // Landing here straight from the shortened entry — the "we're scanning /
  // here's what needs you" moment (one quiet toast, once per arrival).
  useEffect(() => {
    if (loading || !loc.state?.fromEntry || arrivalShown.current) return
    arrivalShown.current = true
    toast.show(T.radar.scanKickoff)
    window.history.replaceState({}, '') // don't re-fire on refresh
  }, [loading, loc.state])

  // in-place fill from the Universe writes through here (no screen swaps)
  async function saveArtist(patch) {
    const updated = await upsertArtist({ ...artist, ...patch, id: artist.id, created_by: artist.created_by })
    setArtist(updated)
    if (updated.published) { markPassportDirty(updated.id); setDirty(true) }
    return updated
  }
  // Act-level fills (goal) — same in-place pattern, different table.
  async function saveAct(patch) {
    const updated = await updateAct(artist.id, patch)
    setAct((prev) => ({ ...(prev || { id: artist.id }), ...(updated || patch) }))
    return updated
  }
  async function refreshItems() { setItems(await listProfileItems(artist.id)) }

  // A11 readiness HARD-BLOCK (canon): publish is DISABLED at zero supported
  // claims — an empty public Passport must be impossible, not discouraged.
  const supportedCount = claims.filter((c) =>
    ['verified', 'supporting'].includes(c.verification_status) && c.artist_approved).length
  const canPublish = supportedCount > 0

  async function togglePublish() {
    if (publishing) return
    setPubError('')
    if (!artist.published && !canPublish) { setPubError(T.dashboard.readinessBlock); return }
    if (artist.published) {
      setPublishing(true)
      try {
        const updated = await unpublishArtist(artist)
        setArtist(updated)
      } catch (e) {
        setPubError(T.dashboard.publishError)
      } finally {
        setPublishing(false)
      }
      return
    }
    // Publishing on: require public-publish consent first (once).
    setPublishing(true)
    const ok = await hasConsent(user.id, 'public-publish')
    setPublishing(false)
    if (!ok) { setNeedPubConsent(true); return }
    await doPublish()
  }

  async function doPublish() {
    setPublishing(true)
    try {
      await publishPassport(artist.id) // server writes the immutable snapshot
      setArtist({ ...artist, published: true })
      clearPassportDirty(artist.id); setDirty(false)
      logEvent(EVENTS.PASSPORT_PUBLISHED, { artist_id: artist.id }) // pilot signal — the North-Star chain's publish step
    } catch (e) {
      setPubError(T.dashboard.publishError)
    } finally {
      setPublishing(false)
    }
  }

  async function agreeAndPublish() {
    try { await recordConsentScope(user.id, 'public-publish') } catch { /* non-blocking */ }
    setNeedPubConsent(false)
    await doPublish()
  }

  // Re-snapshot so visibility/claim edits reach the public Passport.
  async function refreshPublic() {
    if (publishing) return
    setPubError('')
    setPublishing(true)
    try {
      await publishPassport(artist.id)
      clearPassportDirty(artist.id); setDirty(false)
    } catch (e) {
      setPubError(T.dashboard.publishError)
    } finally {
      setPublishing(false)
    }
  }

  if (loading) return <Loading />
  if (loadError) return <PageShell><ErrorState title={T.common.error} onRetry={() => { setLoading(true); load() }} /></PageShell>
  if (!artist || !artist.stage_name) {
    return (
      <PageShell>
        <EmptyState title={T.dashboard.empty}
          action={<Link to="/onboarding" className="btn-primary">{T.common.continue}</Link>} />
      </PageShell>
    )
  }

  const nextAction = pickNextAction(artist, items, claims, T)

  // IA correction: claim review is NOT a destination — it opens as a panel
  // inside the Radar. Deferred-field actions (photo, bands) open their planet
  // panel in place. Evidence capture keeps its route for compatibility but is
  // reached contextually (from the radar or from this next-step card).
  function runNextAction(a) {
    if (a?.planet) { setFocusPlanet(a.planet); setFocusSignal((s) => s + 1); return }
    if (!a?.to) return
    if (a.to === '/artist/claims') { setReviewSignal((s) => s + 1); return }
    nav(a.to)
  }

  const quickLinks = [
    { to: '/artist/readiness', label: T.dashboard.readiness },
    { to: '/artist/offer', label: T.offer.getPassport },
  ]

  return (
    <PageShell max="max-w-xl md:max-w-[1360px]">
      <h1 className="font-display mb-0.5 text-2xl font-bold tracking-[-0.01em] text-ink">{T.radar.artistTitle}</h1>
      <p className="mb-4 text-xs text-muted">{T.radar.artistSubtitle}</p>

      {/* ── THE UNIVERSE — the Radar IS evidence collection; review/confirm
            open as panels inside it (reviewSignal). Full-stage (md+): owns
            the main content area's height; the next-step card floats INSIDE
            it (see RadarUniverse) instead of stacking below. ── */}
      <RadarUniverse artist={artist} act={act} items={items} claims={claims} onClaimsChange={setClaims}
        onArtistChange={saveArtist} onActChange={saveAct} onItemsRefresh={refreshItems}
        reviewSignal={reviewSignal} focusPlanet={focusPlanet} focusSignal={focusSignal}
        nextAction={nextAction} onNextAction={runNextAction} />

      {/* ── ONE dominant next step — the coach's single clearest move. Mobile
            only: on the full-stage (md+) this same card floats over the
            universe itself (RadarUniverse's internal next-action overlay). ── */}
      <div className="mb-4 rounded-2xl border border-line bg-surface p-5 shadow-card md:hidden">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{T.radar.nextActionEyebrow}</p>
        <p className="font-display text-lg font-bold tracking-[-0.01em] text-ink">{nextAction.title}</p>
        {nextAction.why && <p className="mt-1 text-xs leading-relaxed text-muted">{nextAction.why}</p>}
        {nextAction.time != null && (
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-faint">{T.radar.timeHint(nextAction.time)}</p>
        )}
        {(nextAction.to || nextAction.planet) && (
          <button className="btn-primary mt-3 w-full sm:w-auto" onClick={() => runNextAction(nextAction)}>
            {T.common.continue}
          </button>
        )}
      </div>

      {/* quick links — private readiness + the offer; evidence/claims live in the Radar */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        {quickLinks.map((q) => (
          <Link key={q.to} to={q.to}
            className="flex min-h-[44px] items-center justify-between rounded-xl border border-line bg-surface2 px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-line2">
            <span className="truncate">{q.label}</span>
            <span aria-hidden className="text-faint">→</span>
          </Link>
        ))}
      </div>

      {/* passport state — ONE line; controls live in a sheet, not on the screen */}
      <button
        onClick={() => setPubSheet(true)}
        className="mb-3 flex w-full items-center justify-between rounded-xl border border-line bg-surface px-3 py-2.5 text-start transition-colors hover:border-line2">
        <span className="text-xs text-muted">
          <span className={`me-2 inline-block h-2 w-2 rounded-full align-middle ${artist.published ? 'bg-accent' : 'bg-faint'}`} aria-hidden />
          <span className="font-semibold text-ink">{artist.published ? T.dashboard.statusActive : T.dashboard.statusOff}</span>
          {dirty && <span className="ms-2 font-semibold text-need">{T.dashboard.unpublishedBadge}</span>}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">{T.dashboard.managePassport} ▸</span>
      </button>

      <BottomSheet open={pubSheet} onClose={() => setPubSheet(false)} title={T.dashboard.managePassport}>
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink">{artist.published ? T.dashboard.publishOn : T.dashboard.publishOff}</span>
          <button onClick={togglePublish} disabled={publishing || (!artist.published && !canPublish)}
            className={`chip min-h-[40px] px-4 py-2 transition ${publishing || (!artist.published && !canPublish) ? 'opacity-60' : ''} ${artist.published ? 'bg-good-bg text-good' : 'bg-na-bg text-muted'}`}>
            {publishing ? T.dashboard.publishing : artist.published ? T.dashboard.statusActive : T.dashboard.statusOff}
          </button>
        </div>
        {needPubConsent && (
          <div className="mt-3 rounded-xl border border-line2 bg-surface2 p-3 text-start">
            <p className="mb-1 font-bold text-ink">{T.consent.publishTitle}</p>
            <p className="mb-3 text-xs text-muted">{T.consent.publishBody}</p>
            <div className="flex gap-2">
              <button className="btn-primary flex-1" onClick={agreeAndPublish} disabled={publishing}>{T.consent.publishAgree}</button>
              <button className="btn-ghost" onClick={() => setNeedPubConsent(false)} disabled={publishing}>{T.common.cancel}</button>
            </div>
          </div>
        )}
        {artist.published && (
          <>
            {dirty
              ? <p className="mt-3 text-xs font-bold text-need">{T.dashboard.unpublishedBadge}</p>
              : <p className="mt-3 text-xs text-muted">{T.dashboard.publishedHint}</p>}
            <button onClick={refreshPublic} disabled={publishing}
              className={`mt-2 w-full text-sm ${dirty ? 'btn-primary' : 'btn-ghost'}`}>
              {T.dashboard.refreshPublic}
            </button>
          </>
        )}
        {pubError && <p className="mt-2 text-xs text-need">{pubError}</p>}
        {/* commercial state folded here — a line, never a wall; no emoji */}
        <p className="mt-3 border-t border-line pt-2 text-xs text-muted">
          {ent?.status === 'active'
            ? <>{T.offer.activeTitle}</>
            : ent?.status === 'pending'
              ? <>{T.offer.pendingTitle}</>
              : <Link to="/artist/offer" className="font-semibold text-ink/80 underline decoration-line2 hover:text-ink">{T.offer.getPassport} · {T.offer.price}</Link>}
          {artist.published && (
            <Link to={`/passport/${artist.id}`} className="ms-3 font-semibold text-ink/80 underline decoration-line2 hover:text-ink">{T.dashboard.viewPublic} →</Link>
          )}
        </p>
      </div>
      </BottomSheet>

      <p className="mt-6 text-center text-[11px] text-muted">{T.radar.privacyNote}</p>
    </PageShell>
  )

}
