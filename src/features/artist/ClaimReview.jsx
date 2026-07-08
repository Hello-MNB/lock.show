import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getMyArtist, listClaims, updateClaimVisibility, updateClaim, deleteClaim, listProfileItems, updateItemVisibility, publishPassport } from '../../lib/db.js'
import { VISIBILITY, SOURCE_STATUS, methodLabelFor } from '../../lib/constants.js'
import { PageShell, Wordmark, Loading, EmptyState, ErrorState, Spinner } from '../../components/ui.jsx'
import { MethodLabel, BandPill } from './proofBits.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { logEvent, EVENTS } from '../../lib/analytics.js'
import { markPassportDirty, clearPassportDirty, isPassportDirty } from '../../lib/passportState.js'
import { DEMO } from '../../lib/demo.js'

// Honest receipt destination — only confirmed verified/supporting passport-ok
// claims actually reach the public Passport; everything else stays private.
function destinationOf(claim) {
  const publicBound = claim?.visibility === VISIBILITY.PASSPORT_OK &&
    ['verified', 'supporting'].includes(claim?.verification_status)
  return publicBound ? 'your Passport view' : 'your private record'
}

export default function ClaimReview() {
  const { T } = useLang()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [artist, setArtist] = useState(null)
  const [claims, setClaims] = useState([])
  const [items, setItems] = useState([])
  const [toggling, setToggling] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [republishing, setRepublishing] = useState(false)
  const [receipt, setReceipt] = useState('') // named confirmation receipt (evidence integrity)

  function flashReceipt(msg) {
    setReceipt(msg)
    setTimeout(() => setReceipt(''), 3400)
  }

  async function load() {
    setLoadError(false)
    try {
      const a = await getMyArtist(user.id)
      setArtist(a)
      if (a) {
        const [cs, is] = await Promise.all([listClaims(a.id), listProfileItems(a.id)])
        setClaims(cs)
        setItems(is)
        setDirty(isPassportDirty(a.id))
      }
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [user.id])

  // Publish eligibility (canon A10): ONLY verified/supporting claims that the
  // artist explicitly confirmed may cross to passport-ok. Self-reported and
  // not-assessable stay in the private view always.
  function canPublish(claim) {
    return claim.artist_approved === true && ['verified', 'supporting'].includes(claim.verification_status)
  }

  async function toggle(claim) {
    if (toggling) return
    const goingPublic = claim.visibility !== VISIBILITY.PASSPORT_OK
    if (goingPublic && !canPublish(claim)) return // UI disables this; guard anyway
    setToggling(claim.id)
    try {
      const next = goingPublic ? VISIBILITY.PASSPORT_OK : VISIBILITY.MIRROR_ONLY
      await updateClaimVisibility(claim.id, next)
      logEvent(EVENTS.CLAIM_VISIBILITY_CHANGED, { claim_id: claim.id, from: claim.visibility, to: next })
      setClaims((prev) => prev.map((c) => c.id === claim.id ? { ...c, visibility: next } : c))
      markPassportDirty(artist.id); setDirty(true)
    } finally { setToggling(null) }
  }

  // ── A8 review actions — the artist-approval gate ──
  async function approve(claim) {
    if (toggling) return
    setToggling(claim.id)
    try {
      await updateClaim(claim.id, { artist_approved: true })
      setClaims((prev) => prev.map((c) => c.id === claim.id ? { ...c, artist_approved: true } : c))
      // The receipt names what was confirmed and where it now appears.
      flashReceipt(`Added to ${destinationOf(claim)}: “${claim.public_wording || claim.value || human(claim.claim_type)}”`)
    } finally { setToggling(null) }
  }

  async function correctValue(claim, newValue) {
    if (toggling || !newValue || newValue === claim.value) return
    setToggling(claim.id)
    try {
      await updateClaim(claim.id, { value: newValue, verified_by: 'artist' })
      setClaims((prev) => prev.map((c) => c.id === claim.id ? { ...c, value: newValue, verified_by: 'artist' } : c))
      if (claim.visibility === VISIBILITY.PASSPORT_OK) { markPassportDirty(artist.id); setDirty(true) }
    } finally { setToggling(null) }
  }

  // Single tap — "It won't count against you — it just won't show."
  async function omit(claim) {
    if (toggling) return
    setToggling(claim.id)
    try {
      await deleteClaim(claim.id)
      setClaims((prev) => prev.filter((c) => c.id !== claim.id))
      if (claim.visibility === VISIBILITY.PASSPORT_OK) { markPassportDirty(artist.id); setDirty(true) }
    } finally { setToggling(null) }
  }

  async function flag(claim) {
    if (toggling) return
    setToggling(claim.id)
    try {
      // Wrong event / dispute → operator queue (status='disputed'); never publishable while flagged.
      await updateClaim(claim.id, { status: 'disputed', artist_approved: false, visibility: VISIBILITY.MIRROR_ONLY })
      setClaims((prev) => prev.map((c) => c.id === claim.id ? { ...c, status: 'disputed', artist_approved: false, visibility: VISIBILITY.MIRROR_ONLY } : c))
      if (claim.visibility === VISIBILITY.PASSPORT_OK) { markPassportDirty(artist.id); setDirty(true) }
    } finally { setToggling(null) }
  }

  async function toggleItem(item) {
    if (toggling) return
    setToggling(item.id)
    try {
      const next = item.visibility === VISIBILITY.PASSPORT_OK ? VISIBILITY.MIRROR_ONLY : VISIBILITY.PASSPORT_OK
      await updateItemVisibility(item.id, next)
      logEvent(EVENTS.CLAIM_VISIBILITY_CHANGED, { item_id: item.id, from: item.visibility, to: next })
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, visibility: next } : i))
      markPassportDirty(artist.id); setDirty(true)
    } finally { setToggling(null) }
  }

  async function republish() {
    if (republishing) return
    setRepublishing(true)
    try {
      await publishPassport(artist.id)
      clearPassportDirty(artist.id)
      setDirty(false)
    } finally { setRepublishing(false) }
  }

  if (loading) return <Loading />
  if (loadError) return (
    <PageShell>
      <Wordmark className="mb-6" />
      <ErrorState title={T.common.error} onRetry={() => { setLoading(true); load() }} />
    </PageShell>
  )
  if (!artist) return (
    <PageShell>
      <Wordmark className="mb-6" />
      <EmptyState title={T.dashboard.empty} action={<Link to="/onboarding" className="btn-primary">{T.common.continue}</Link>} />
    </PageShell>
  )

  // A8 triage: unreviewed first (nothing is publishable until confirmed), then
  // the confirmed sets, split by where they show.
  const pendingReview = claims.filter((c) => !c.artist_approved)
  const approved = claims.filter((c) => c.artist_approved)
  const passportOk = approved.filter((c) => c.visibility === VISIBILITY.PASSPORT_OK)
  const mirrorOnly = approved.filter((c) => c.visibility !== VISIBILITY.PASSPORT_OK)
  const hasDraw = artist.lineup_frequency_band || artist.sells_tickets != null || artist.price_band || artist.community_size_band
  const empty = claims.length === 0 && items.length === 0

  return (
    <PageShell>
      <div className="mb-6 flex items-center justify-between">
        <Wordmark />
        <Link to="/artist/home" className="text-sm text-muted transition-colors hover:text-ink">{T.common.back}</Link>
      </div>

      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h1 className="font-display text-2xl font-bold tracking-[-0.01em] text-ink">{T.claims.title}</h1>
        <span className="chip border border-line bg-surface2 text-xs text-muted">{T.common.aiAssistedBeta}</span>
        {DEMO && <span className="chip border border-line bg-surface2 text-xs text-muted">{T.demo.sampleData}</span>}
      </div>
      <p className="mb-4 text-sm text-muted">{T.claims.subtitle}</p>

      {/* Unpublished-changes banner — edits are private until re-published to the
          immutable public snapshot (so buyers never see silent mid-view changes). */}
      {artist.published && dirty && (
        <div className="card mb-4" role="status">
          <p className="flex items-center gap-2 font-bold text-ink">
            <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-amber" />
            {T.claims.applyTitle}
          </p>
          <p className="mb-3 mt-1 text-xs text-muted">{T.claims.applyBody}</p>
          <button className="btn-primary w-full" onClick={republish} disabled={republishing}>
            {republishing ? <Spinner /> : T.claims.applyCta}
          </button>
        </div>
      )}

      {/* Draw bands — firewall-safe, ALWAYS cross to the public Passport. Show the
          artist exactly what's exposed (transparency); editing is via the profile. */}
      {hasDraw && (
        <div className="card mb-4">
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{T.claims.drawTitle}</p>
          <div className="space-y-2">
            {artist.lineup_frequency_band && <DrawLine label={T.passport.drawFrequency} value={artist.lineup_frequency_band} T={T} />}
            {artist.sells_tickets != null && <DrawLine label={T.passport.drawSellsTickets} value={artist.sells_tickets ? T.common.yes : T.common.no} T={T} />}
            {artist.price_band && <DrawLine label={T.passport.drawPrice} value={artist.price_band} T={T} />}
            {artist.community_size_band && <DrawLine label={T.passport.drawCommunity} value={artist.community_size_band} T={T} />}
          </div>
          <p className="mt-2 text-xs text-muted">{T.claims.drawNote}</p>
          <Link to="/onboarding" className="mt-1 inline-flex min-h-[40px] items-center text-xs font-semibold text-muted underline decoration-white/20 hover:text-ink">{T.claims.drawEditHint}</Link>
        </div>
      )}

      {empty && (
        <div className="card py-8 text-center">
          <p className="text-muted">{T.claims.noClaimsYet}</p>
          <Link to={`/evidence/${artist.id}`} className="btn-primary mt-4 inline-block">{T.evidence.title}</Link>
        </div>
      )}

      {/* A8 · needs review — the artist-approval gate comes first */}
      {pendingReview.length > 0 && (
        <div className="mb-4">
          <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#F0B478]">{T.claims.needsReview} ({pendingReview.length})</p>
          <p className="mb-2 text-xs text-muted">{T.claims.needsReviewHint}</p>
          <div className="space-y-2">
            {pendingReview.map((c) => (
              <ClaimRow key={c.id} claim={c} onToggle={toggle} toggling={toggling} T={T}
                canPublish={canPublish(c)} onApprove={approve} onCorrect={correctValue} onOmit={omit} onFlag={flag} />
            ))}
          </div>
        </div>
      )}

      {/* Passport-ok claims */}
      {passportOk.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{T.claims.passportOk} ({passportOk.length})</p>
          <div className="space-y-2">
            {passportOk.map((c) => (
              <ClaimRow key={c.id} claim={c} onToggle={toggle} toggling={toggling} T={T}
                canPublish={canPublish(c)} onApprove={approve} onCorrect={correctValue} onOmit={omit} onFlag={flag} />
            ))}
          </div>
        </div>
      )}

      {/* Private (working-view) claims */}
      {mirrorOnly.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{T.claims.mirrorOnly} ({mirrorOnly.length})</p>
          <div className="space-y-2">
            {mirrorOnly.map((c) => (
              <ClaimRow key={c.id} claim={c} onToggle={toggle} toggling={toggling} T={T}
                canPublish={canPublish(c)} onApprove={approve} onCorrect={correctValue} onOmit={omit} onFlag={flag} />
            ))}
          </div>
        </div>
      )}

      {/* Track-record items — same Mirror↔Passport control as claims */}
      {items.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink/80">{T.claims.itemsTitle} ({items.length})</p>
          <div className="space-y-2">
            {items.map((i) => <ItemRow key={i.id} item={i} onToggle={toggleItem} toggling={toggling} T={T} />)}
          </div>
        </div>
      )}

      {!empty && (
        <Link to={`/passport/${artist.id}`} className="btn-ghost mt-4 block w-full text-center">
          {T.dashboard.viewPublic}
        </Link>
      )}

      {/* named receipt — says WHAT was confirmed and WHERE it now appears */}
      {receipt && (
        <div role="status" className="fixed inset-x-4 bottom-4 z-[70] mx-auto flex max-w-md items-center gap-2 rounded-xl border border-accent/25 bg-[#141B12] px-3.5 py-2.5 text-xs font-semibold text-ink shadow-[0_24px_60px_-24px_rgba(0,0,0,0.75)]">
          <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-accent" />
          <span className="truncate">{receipt}</span>
        </div>
      )}
    </PageShell>
  )
}

function DrawLine({ label, value, T }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-2 text-sm text-ink/90">
        <span className="truncate">{label}</span>
        <BandPill>{value}</BandPill>
      </span>
      <span className="chip shrink-0 bg-white/[0.05] text-muted text-xs">{T.claims.alwaysVisible}</span>
    </div>
  )
}

// Visibility as a chip — quiet when private, lime-tinted when on the Passport.
function VisibilityToggle({ isPassportOk, busy, onClick, T }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`chip min-h-[40px] shrink-0 px-3 py-1.5 text-xs font-bold transition ${
        isPassportOk
          ? 'bg-[rgba(190,226,78,0.10)] text-[#CBEE72] hover:bg-[rgba(190,226,78,0.15)]'
          : 'border border-white/15 bg-white/[0.04] text-muted hover:bg-white/[0.08]'
      }`}
    >
      {isPassportOk ? T.claims.passportOk : T.claims.mirrorOnly}
    </button>
  )
}

const human = (s) => String(s || '').replace(/[-_]/g, ' ')
const fmtDate = (d) => {
  if (!d) return ''
  const t = new Date(d)
  return Number.isNaN(t.getTime()) ? '' : t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ItemRow({ item, onToggle, toggling, T }) {
  const isPassportOk = item.visibility === VISIBILITY.PASSPORT_OK
  const busy = toggling === item.id
  const verified = item.source_status === SOURCE_STATUS.PUBLIC_VERIFIED
  return (
    <div className={`card transition ${busy ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <MethodLabel label={T.methodLabel[verified ? 'source-linked' : 'artist-declared'] || (verified ? 'source-linked' : 'self-reported')} />
            {item.item_date && <span className="font-mono text-[10px] text-faint">{fmtDate(item.item_date)}</span>}
          </div>
        </div>
        <VisibilityToggle isPassportOk={isPassportOk} busy={busy} onClick={() => onToggle(item)} T={T} />
      </div>
    </div>
  )
}

function ClaimRow({ claim, onToggle, toggling, T, canPublish, onApprove, onCorrect, onOmit, onFlag }) {
  const isPassportOk = claim.visibility === VISIBILITY.PASSPORT_OK
  const busy = toggling === claim.id
  const isConfirmed = claim.method_label === 'producer-confirmed'
  const isFlagged = claim.status === 'disputed'
  const needsReview = !claim.artist_approved
  const LS_KEY = `gp_confirm_${claim.id}`

  const [correcting, setCorrecting] = useState(false)
  const [correctVal, setCorrectVal] = useState(claim.value || '')
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  // Persist generated link across navigation; clear when confirmed.
  const [link, setLinkRaw] = useState(() => isConfirmed ? '' : (localStorage.getItem(LS_KEY) || ''))
  const [reqBusy, setReqBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [reqError, setReqError] = useState('')

  function setLink(val) {
    setLinkRaw(val)
    if (val) localStorage.setItem(LS_KEY, val)
    else localStorage.removeItem(LS_KEY)
  }

  useEffect(() => {
    if (isConfirmed) localStorage.removeItem(LS_KEY)
  }, [isConfirmed, LS_KEY])

  async function generate() {
    if (reqBusy) return
    setReqError('')
    if (DEMO) {
      setLink(`${window.location.origin}/confirm/demo-token-preview`)
      return
    }
    setReqBusy(true)
    try {
      const res = await fetch('/api/request-confirmation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: claim.id, producerContact: email || null }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.path) setLink(`${window.location.origin}${json.path}`)
      else setReqError(json.error || T.producer.serverOffline)
    } catch { setReqError(T.producer.serverOffline) } finally { setReqBusy(false) }
  }

  const hasPending = !isConfirmed && !!link

  // ── Proof-unit anatomy (evidence integrity): the EXACT claim wording as it
  //    will appear (bold) → the concrete source (method label + identifiable
  //    reference, e.g. "numbered event listings #4–#21") → honesty line —
  //    all BEFORE any confirm button. The method IS the message.
  const methodKey = methodLabelFor({ method_label: claim.method_label, verification_status: claim.verification_status, expires_at: claim.expires_at })
  const claimTitle = claim.public_wording || claim.value || human(claim.claim_type)
  const bandText = claim.public_wording && claim.value && claim.value !== claim.public_wording ? claim.value : null
  const sourceReference = claim.reason_code ? String(claim.reason_code) : human(claim.source_type)
  const reviewedOn = fmtDate(claim.reviewed_at || claim.updated_at || claim.created_at)

  return (
    <div className={`card transition ${busy ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* (1) the exact claim wording — what will appear, verbatim */}
          <p className="text-[19px] font-bold leading-snug text-ink">{claimTitle}</p>
          {/* context, muted — the claim's category */}
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">{human(claim.claim_type)}</p>
          {/* (2) footer row: band + method label + concrete source reference + reviewed date */}
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            {bandText && <BandPill>{bandText}</BandPill>}
            <MethodLabel label={T.methodLabel[methodKey] || human(methodKey)} confirmed={isConfirmed || methodKey === 'producer-confirmed'} />
            {sourceReference && <span className="font-mono text-[10px] text-faint">{sourceReference}</span>}
            {reviewedOn && <span className="font-mono text-[10px] text-faint">{T.radar.reviewedOn(reviewedOn)}</span>}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {claim.artist_approved && (
              <span className="chip bg-[rgba(190,226,78,0.10)] text-[#CBEE72] text-xs">✓ {T.claims.approvedChip}</span>
            )}
            {isFlagged && (
              <span className="chip bg-[rgba(227,154,75,0.10)] text-[#F0B478] text-xs">{T.claims.flaggedChip}</span>
            )}
            {hasPending && (
              <span className="chip bg-[rgba(70,220,194,0.10)] text-[#82E8D6] text-xs">{T.producer.pendingChip}</span>
            )}
          </div>
        </div>
        {/* the toggle only offers "go public" when the claim is confirmed AND verified/supporting */}
        <VisibilityToggle
          isPassportOk={isPassportOk}
          busy={busy || (!isPassportOk && !canPublish)}
          onClick={() => onToggle(claim)}
          T={T}
        />
      </div>

      {/* "what this supports / does not establish" — honesty text travels with the claim */}
      {claim.limitation_text && (
        <p className="mt-2 text-[11px] text-muted"><span className="font-semibold text-ink/70">{T.claims.limitationLabel}:</span> {claim.limitation_text}</p>
      )}

      {/* why can't this go public? */}
      {!isPassportOk && !canPublish && !isFlagged && (
        <p className="mt-2 text-[11px] text-muted">
          {needsReview ? T.claims.notApprovedHint : T.claims.selfReportedNoPassport}
        </p>
      )}

      {/* A8 review actions — single-tap; the confirm button NAMES what it confirms */}
      {needsReview && !isFlagged && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-white/[0.08] pt-3">
          <button
            className="flex min-w-0 flex-1 basis-full items-center justify-center gap-1.5 rounded-lg border border-line2 bg-white/[0.04] px-3 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-white/[0.08] disabled:opacity-50"
            onClick={() => onApprove(claim)} disabled={busy}
            aria-label={`${T.claims.approve}: ${claimTitle}`}>
            {busy ? <Spinner /> : <><span aria-hidden>✓</span><span className="truncate">{T.claims.approve}: “{claimTitle}”</span></>}
          </button>
          <button className="btn-ghost text-sm" onClick={() => setCorrecting((v) => !v)} disabled={busy}>{T.claims.correct}</button>
          <button className="btn-ghost text-sm" onClick={() => onFlag(claim)} disabled={busy}>{T.claims.flag}</button>
          <button className="btn-ghost text-sm text-[#F0B478]" onClick={() => onOmit(claim)} disabled={busy}>{T.claims.omit}</button>
        </div>
      )}
      {isFlagged && (
        <div className="mt-3 flex gap-2 border-t border-white/[0.08] pt-3">
          <button className="btn-ghost text-sm text-[#F0B478]" onClick={() => onOmit(claim)} disabled={busy}>{T.claims.omit}</button>
        </div>
      )}
      {correcting && needsReview && (
        <div className="mt-2 flex gap-2">
          <input className="field flex-1 text-sm" value={correctVal} onChange={(e) => setCorrectVal(e.target.value)} />
          <button className="btn-ghost text-sm" onClick={() => { onCorrect(claim, correctVal); setCorrecting(false) }} disabled={busy}>
            {T.claims.correctSave}
          </button>
        </div>
      )}

      {!isConfirmed && (
        <button className="mt-1 min-h-[40px] text-xs text-muted transition-colors hover:text-ink" onClick={() => setOpen((o) => !o)}>
          {T.producer.requestTitle}
        </button>
      )}
      {open && !isConfirmed && (
        <div className="mt-2 border-t border-white/[0.08] pt-2">
          {reqError && <p className="mb-2 text-xs text-[#F0B478]">{reqError}</p>}
          {link ? (
            <>
              <p className="mb-1 text-xs text-muted">{T.producer.linkReady}</p>
              <p className="break-all font-mono text-xs text-ink/90" dir="ltr">{link}</p>
              <div className="mt-2 flex gap-2">
                <button className="btn-ghost flex-1 text-xs" onClick={() => { navigator.clipboard?.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
                  {copied ? T.producer.copied : T.producer.copyLink}
                </button>
                <button className="px-2 text-xs text-muted hover:text-ink" onClick={() => setLink('')} aria-label="clear">×</button>
              </div>
            </>
          ) : (
            <>
              <p className="mb-2 text-xs text-muted">{T.producer.requestHelp}</p>
              <input className="field text-sm" type="email" dir="ltr" placeholder={T.producer.requestEmail}
                value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="btn-ghost mt-2 w-full text-sm" onClick={generate} disabled={reqBusy}>
                {reqBusy ? <Spinner /> : T.producer.requestCta}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
