import { Link } from 'react-router-dom'
import { Wordmark, LanguageToggle } from '../../components/ui.jsx'
import { PlatformLogo, detectPlatform } from '../../components/PlatformLogo.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { SOURCE_STATUS, METHOD_LABELS, methodLabelFor } from '../../lib/constants.js'
import { humanizeDrawBand, humanizeBinary, humanizeReviewDate } from '../../lib/humanize.js'
import { RoomGrammar } from './RoomGrammar.jsx'

// ── passportKit — the SHARED, firewall-safe rendering + derivation layer for the
// public Passport. The two buyer personas (Booking view · Representation view)
// are separate files, but they MUST show identical evidence — same bands, same
// method labels, same "remove empty sections" law. That single source of truth
// lives here so a persona can only change ORDER, EMPHASIS and CTA — never the
// facts and never the firewall. NO score, NO gauge, ever. (CLAUDE.md firewall.)

export const isBand = (v = '') => /^[\d,.]+\s*[–-]\s*[\d,.]+/.test(String(v).trim())

// ── Proof primitives ────────────────────────────────────────────────────────
// Method label: mono uppercase, gold on transparent; producer-confirmed in lime.
// §5.10 warmth layer: a one-line human sub-text peeks in on hover/focus (mouse
// hover AND keyboard focus AND a tap on touch, via :focus-within) — the canon
// mono chip never changes, this is a PEEK, not a rewrite of the chip itself.
export function MethodLabel({ status, methodLabel, expiresAt }) {
  const { T } = useLang()
  const key = methodLabelFor({ method_label: methodLabel, verification_status: status, expires_at: expiresAt })
  const lime = key === 'producer-confirmed'
  const hint = T.methodLabelHint?.[key]
  return (
    <span className="group/method tap-target relative inline-flex">
      <span
        tabIndex={hint ? 0 : undefined}
        title={hint || undefined}
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-[3px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] outline-none ${
          lime ? 'border-accent/70 text-accent' : 'border-gold/50 text-gold'
        }`}
      >
        <span aria-hidden="true">{lime ? '★' : '✓'}</span>
        {T.methodLabel[key]}
      </span>
      {hint && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 w-max max-w-[220px] -translate-x-1/2 rounded-md border border-line2 bg-surface2 px-2.5 py-1.5 text-[11px] font-normal normal-case leading-snug tracking-normal text-muted opacity-0 shadow-card transition group-hover/method:opacity-100 group-focus-within/method:opacity-100"
        >
          {hint}
        </span>
      )}
    </span>
  )
}

// BandPill — bordered mono capsule. Text only. NO fill. NO gauge. Ever.
export function BandPill({ value }) {
  return (
    <span
      aria-label={`Band: ${value}`}
      className="inline-flex items-center rounded-full border border-line2 bg-surface2 px-3 py-[3px] font-mono text-[13px] font-semibold tracking-[-0.01em] text-ink"
    >
      {value}
    </span>
  )
}

// ── P-3 provenance-forward source line — derives a HUMAN source-identity
// sentence from a claim's real source_type/method_label fields (never a new
// data source; see src/types.ts Claim.source_type + demo.js for the real
// values this switches on: 'ticket-export' | 'settlement' | 'screenshot' |
// 'public-profile' | 'producer-vouch' | 'self-band' | 'self-reported' |
// null). Four display buckets per spec §5.10: branded-platform / document /
// entity / declared. A brand is named ONLY when detectPlatform recognizes it
// from the claim's own value/source_type text (same detector RadarUniverse
// already uses at derivePlatformNodes) — never guessed.
const PLATFORM_NAMES = { // i18n-allow — brand proper nouns, shown as-is in both locales (matches PlatformLogo's own untranslated names)
  spotify: 'Spotify', soundcloud: 'SoundCloud', instagram: 'Instagram', facebook: 'Facebook',
  youtube: 'YouTube', tiktok: 'TikTok', whatsapp: 'WhatsApp', telegram: 'Telegram',
  applemusic: 'Apple Music', beatport: 'Beatport', bandcamp: 'Bandcamp',
}

function sourceKindOf({ source_type, method_label } = {}) {
  if (method_label === METHOD_LABELS.PRODUCER_CONFIRMED || source_type === 'producer-vouch') return 'entity'
  if (['ticket-export', 'settlement', 'screenshot'].includes(source_type)) return 'document'
  if (source_type === 'public-profile') return 'branded-platform'
  return 'declared' // self-band · self-reported · no source_type (artist-level draw bands)
}

// The source ICON identifies the source only (never a strength signal — the
// method chip carries that). detectPlatform already resolves 'ticket-export'
// → the ticket mark and 'producer-vouch' → the venue mark, and falls back to
// its own generic link glyph (inline SVG, never fetched) when nothing
// matches — that fallback IS this rule's "text-badge fallback".
function sourceIconOf({ source_type, value } = {}) {
  return detectPlatform(value) || detectPlatform(source_type) || null
}

function sourceLineFor(c, T) {
  const kind = sourceKindOf(c)
  if (kind === 'entity') return T.passport.sourceEntity || 'Producer-confirmed by an industry peer'
  if (kind === 'document') {
    const byType = {
      'ticket-export': T.passport.sourceTicketExport || 'From an uploaded ticket export',
      settlement: T.passport.sourceSettlement || 'From a settlement record',
      screenshot: T.passport.sourceScreenshot || 'From an uploaded document',
    }
    return byType[c.source_type] || (T.passport.sourceScreenshot || 'From an uploaded document')
  }
  if (kind === 'branded-platform') {
    const platform = sourceIconOf(c)
    const name = platform && PLATFORM_NAMES[platform]
    return name
      ? (T.passport.sourceBrandedPlatform ? T.passport.sourceBrandedPlatform(name) : `From their ${name}`)
      : (T.passport.sourceProfile || 'From their public profile')
  }
  return T.passport.sourceDeclared || 'Artist-declared'
}

// Proof Unit — LOCK's visual signature. §5.10 provenance-forward order (P-3):
// source identity (human line + method chip) LEADS → claim text (contextLine
// warm-lead when present, per P-1) → band/value + reviewed date, quiet mono,
// last. §5.10 warmth layer: when `contextLine` is given (a room-fit sentence
// for a draw band, e.g. "Moves large-hall crowds"), it becomes the headline
// claim in display type and the raw band drops to a still-visible BandPill
// in the footer — the band is never hidden, only no longer the loudest thing
// on the card. Dates render as "Fresh proof · July 2026" (recent, quiet lime
// chip) or "Verified · July 2026" (older, neutral), never a raw dd/mm/yyyy
// stamp and never red/warning styling for a stale claim (P-4).
export function ProofUnit({ claim, context, band, status, methodLabel, reviewedAt, T, contextLine, sourceType, sourceValue }) {
  const { lang } = useLang()
  const claimIsBand = isBand(claim)
  const reviewed = humanizeReviewDate(reviewedAt, { lang })
  // Defensive fallback to the bare month/year: keeps this card from throwing
  // if T.passport.dateFresh/dateVerified haven't landed in i18n yet (new keys
  // — see B1-a report). Once added, the warm phrasing is what actually shows.
  const reviewedLabel = reviewed && (
    reviewed.isFresh
      ? (T.passport.dateFresh ? T.passport.dateFresh(reviewed.monthYear) : reviewed.monthYear)
      : (T.passport.dateVerified ? T.passport.dateVerified(reviewed.monthYear) : reviewed.monthYear)
  )
  const srcInfo = { source_type: sourceType ?? null, value: sourceValue ?? null, method_label: methodLabel }
  return (
    // V1 (owner witness-fix 20 Jul, §6 law 7): trimmed padding/gaps on mobile
    // only — at 360×780 the first card's bottom edge dipped ~25px into the
    // sticky CTA bar's zone (measured: CTA bar top=686px, card bottom=711px)
    // after the hero/strip compression above; this alone recovers the
    // difference so the whole first proof card clears the CTA bar. md+
    // keeps the original p-5/mb-3/mt-3.5/pt-3 rhythm unchanged.
    <article className="rounded-[18px] border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="mb-2 flex flex-wrap items-center gap-2 sm:mb-3">
        <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line2 text-muted">
          <PlatformLogo name={sourceIconOf(srcInfo)} size={14} />
        </span>
        <span className="text-[12.5px] font-medium text-muted">{sourceLineFor(srcInfo, T)}</span>
        <span className="ml-auto"><MethodLabel status={status} methodLabel={methodLabel} /></span>
      </div>
      {contextLine
        ? <p className="font-display text-[19px] font-bold leading-snug text-ink">{contextLine}</p>
        : claimIsBand
          ? <p className="font-mono text-[26px] font-bold leading-tight tracking-[-0.01em] text-ink" aria-label={`Band: ${claim}`}>{claim}</p>
          : <p className="text-[19px] font-bold leading-snug text-ink">{claim}</p>}
      {context && context !== claim && <p className="mt-1 text-sm text-muted">{context}</p>}
      <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-line pt-2.5 font-mono sm:mt-3.5 sm:pt-3">
        {band && (!claimIsBand || contextLine) && <BandPill value={band} />}
        {reviewedLabel && (
          <span className={`ml-auto rounded-full px-2 py-[2px] text-[10px] ${reviewed.isFresh ? 'border border-accent/30 bg-good-bg text-good' : 'text-faint'}`}>
            {reviewedLabel}
          </span>
        )}
      </div>
    </article>
  )
}

export function PassportSection({ label, caption, children }) {
  return (
    // V1 (owner witness-fix 20 Jul, §6 law 7 Passport fold): mt-10 (40px) on
    // EVERY section compounds against the mobile fold — trimmed on mobile/
    // tablet only (md+ keeps the original 40px rhythm unchanged) as part of
    // the hero-fold compression; this is spacing only, no section is removed
    // or reordered.
    <section className="mt-6 sm:mt-8 md:mt-7">
      <h2 className="font-display text-[22px] font-bold text-ink">{label}</h2>
      {caption && (
        <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-faint">{caption}</p>
      )}
      <div className="mt-3.5">{children}</div>
    </section>
  )
}

function ReadyChip({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] font-semibold text-ink">
      <span aria-hidden="true" className="text-accent">✓</span>
      {children}
    </span>
  )
}

// ── Derivation — the ONE firewall-safe transform from live data to sections.
// Both personas call this; neither can reshape a fact. Mirrors the original
// single-view Passport exactly (bands only, streaming demoted to context).
export function deriveSections(artist, items, claims, T) {
  const exp = items.filter((i) => !['link', 'draw_signal'].includes(i.item_type))
  const links = items.filter((i) => i.item_type === 'link')

  // draw claims strongest-first: producer-confirmed → verified → supporting
  const order = { 'producer-confirmed': 0 }
  const vOrder = { verified: 1, supporting: 2 }
  const drawClaims = [...claims].sort((a, b) =>
    (order[a.method_label] ?? vOrder[a.verification_status] ?? 3) - (order[b.method_label] ?? vOrder[b.verification_status] ?? 3))
  const drawBands = [
    artist.lineup_frequency_band && { value: artist.lineup_frequency_band, ctx: T.passport.drawFrequency },
    // Binary → positive capability only (§5.10 / two-view law): a buyer sees
    // "Sells tickets" when true; sells_tickets === false is a gap and must
    // stay ABSENT from the buyer-facing DOM, never rendered as "No".
    artist.sells_tickets === true && { value: T.common.yes, ctx: T.passport.drawSellsTickets },
    artist.price_band && { value: artist.price_band, ctx: T.passport.drawPrice },
  ].filter(Boolean)

  return {
    exp,
    links,
    drawClaims,
    drawBands,
    hasDraw: drawClaims.length > 0 || drawBands.length > 0,
    hasReadiness: !!(artist.set_length || artist.regions || artist.invoice_ready),
    hasContext: links.length > 0 || !!artist.community_size_band,
  }
}

// ── Section blocks — each returns null when it has nothing verified, so the
// public face never renders "missing" (RENDER LAW). Personas order these. ─────

// Pure list-builder factored out of DrawSection so the P-2 proof-story strip
// can read the same "first/strongest draw proof" WITHOUT duplicating the
// firewall-sensitive safe-extraction logic (flow-gap I: a claim with no safe
// public form must render nothing, in the ledger OR the strip). Order:
// claims (already strongest-first from deriveSections) then artist-level
// draw bands. `fromClaim` marks a claims-table row — used by the P-5 Room
// Grammar hero gate, which may only fire for an actual confirmed draw claim,
// never a raw self-reported artist band.
export function drawProofUnits(data, T, BANDS, contextLines) {
  const lines = contextLines || T.passport.drawContext
  const fromClaims = data.drawClaims
    // FIREWALL: the draw headline may ONLY be the buyer-safe wording, a band,
    // or a band-SHAPED value. Raw `value` can carry an exact headcount
    // ("Drew 450 people") — a claim with no safe form renders nothing here
    // (flow-gap I: safety must not depend on the pipeline always filling
    // public_wording/public_band).
    .map((c) => ({ c, safe: c.public_wording || c.public_band || (isBand(c.value) ? c.value : null) }))
    .filter(({ safe }) => safe)
    .map(({ c, safe }) => {
      const band = bandOf(c)
      return {
        key: c.id,
        claim: safe,
        context: prettyType(c.claim_type),
        band,
        contextLine: humanizeDrawBand(band, BANDS.capacity, lines),
        status: c.verification_status,
        methodLabel: c.method_label,
        reviewedAt: c.verified_at,
        sourceType: c.source_type,
        sourceValue: c.value,
        fromClaim: true,
      }
    })
  const fromBands = data.drawBands.map((b, i) => {
    // Only surface the raw band as a separate pill when a human line has
    // actually replaced it as the headline — otherwise it stays the
    // headline itself, unchanged from the non-warm rendering.
    const contextLine = humanizeDrawBand(b.value, BANDS.capacity, lines)
    return {
      key: `band-${i}`,
      claim: b.value,
      context: b.ctx,
      band: contextLine ? b.value : undefined,
      contextLine,
      status: 'self-reported',
      methodLabel: undefined,
      reviewedAt: undefined,
      sourceType: null,
      sourceValue: null,
      fromClaim: false,
    }
  })
  return [...fromClaims, ...fromBands]
}

// Proof of draw — the hero evidence block (labels configurable per persona).
// §5.10 warmth layer: `contextLines` (defaults to T.passport.drawContext, the
// industry room-fit register) lets a persona swap in an alternate register —
// e.g. the Private & corporate face passes T.passport.drawContextPrivate
// ("Comfortable for 100–300 guests") — WITHOUT touching a single fact: the
// underlying band is looked up unchanged, only the sentence over it differs.
// `heroRoom` (P-5, Booking face only — see PassportBookingView) lets the
// FIRST draw proof unit render as the Room Grammar hero picture instead of a
// standard card, but ONLY when that first unit is an actual confirmed draw
// claim carrying one of the four canonical capacity bands verbatim — a
// free-form band (or no claims at all) always falls back to the standard
// unit, never a guessed nearest room (§5.10 honesty-on-fallback).
export function DrawSection({ data, T, label, contextLines, heroRoom = false }) {
  const { BANDS } = useLang()
  if (!data.hasDraw) return null
  const units = drawProofUnits(data, T, BANDS, contextLines)
  const first = units[0]
  const showRoomGrammar = heroRoom && !!first?.fromClaim && BANDS.capacity.includes(first.band)
  const rest = showRoomGrammar ? units.slice(1) : units
  return (
    <PassportSection label={label || T.passport.proofTitle} caption={T.passport.drawCaption}>
      <div className="grid gap-3">
        {showRoomGrammar && (
          <RoomGrammar
            band={first.band}
            contextLine={first.contextLine}
            badge={
              <>
                <BandPill value={first.band} />
                <MethodLabel status={first.status} methodLabel={first.methodLabel} />
              </>
            }
            T={T}
          />
        )}
        {rest.map((u) => (
          <ProofUnit
            key={u.key}
            claim={u.claim}
            context={u.context}
            band={u.band}
            contextLine={u.contextLine}
            status={u.status}
            methodLabel={u.methodLabel}
            reviewedAt={u.reviewedAt}
            sourceType={u.sourceType}
            sourceValue={u.sourceValue}
            T={T}
          />
        ))}
      </div>
    </PassportSection>
  )
}

// Performance / track record (booking calls it "Performance", rep "Career proof").
export function PerformanceSection({ data, T, label }) {
  if (data.exp.length === 0) return null
  return (
    <PassportSection label={label || T.passport.performance}>
      <div className="rounded-[18px] border border-line bg-surface px-5">
        {data.exp.map((i) => (
          // Narrow screens stack to two lines — title WRAPS (venue lives inside it,
          // so it must never clip) and the date drops to a mono micro line. Buyers
          // must always see WHEN and WHERE. ≥sm keeps the original one-line row.
          <div key={i.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-b border-line py-3.5 last:border-0 sm:flex-nowrap">
            <span className="min-w-0 basis-full text-[15px] text-ink sm:basis-auto sm:truncate">
              {i.title}
              {i.item_date ? <span className="hidden text-faint sm:inline"> · {i.item_date}</span> : null}
            </span>
            {i.item_date && (
              <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-faint sm:hidden">{i.item_date}</span>
            )}
            <MethodLabel status={i.source_status === SOURCE_STATUS.PUBLIC_VERIFIED ? 'supporting' : 'self-reported'} />
          </div>
        ))}
      </div>
    </PassportSection>
  )
}

// §5.10 warmth layer: `variant="private"` swaps the three chips to a
// NON-industry register ("60–90 min performance" / "Available in Center,
// North" / "Invoicing handled") — same three facts, different words for a
// buyer with no scene background. When all three land true for that variant,
// the whole section relabels to the spec's own example, "Turnkey booking"
// (spec §5.10: "a cluster of trues can read as Turnkey · booking-ready").
export function ReadinessSection({ data, artist, T, label, variant = 'industry' }) {
  if (!data.hasReadiness) return null
  const isPrivate = variant === 'private'
  const invoiceLabel = humanizeBinary(artist.invoice_ready, isPrivate ? T.passport.privateInvoiceLabel : T.passport.invoiceLabel)
  const turnkey = isPrivate && artist.set_length && artist.regions && artist.invoice_ready
  return (
    <PassportSection label={turnkey ? T.passport.readinessTurnkey : (label || T.passport.readiness)}>
      <div className="flex flex-wrap gap-2">
        {artist.set_length && (
          <ReadyChip>{isPrivate ? T.passport.privateSetLabel(artist.set_length) : `${T.passport.setLabel}: ${artist.set_length}`}</ReadyChip>
        )}
        {artist.regions && (
          <ReadyChip>{isPrivate ? T.passport.privateRegionsLabel(artist.regions) : `${T.passport.regionsLabel}: ${artist.regions}`}</ReadyChip>
        )}
        {invoiceLabel && <ReadyChip>{invoiceLabel}</ReadyChip>}
      </div>
    </PassportSection>
  )
}

// Context strip — streaming/social/community, explicitly secondary. Dashed
// border = "this is not the evidence" (firewall §streaming). Rep view labels
// it "Audience", booking view "Context" — SAME data, never a raw count.
export function ContextSection({ data, artist, T, title }) {
  if (!data.hasContext) return null
  return (
    <section className="mt-10 rounded-[18px] border border-dashed border-line2 p-5">
      <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
        {title || T.passport.contextTitle}
      </p>
      {artist.community_size_band && (
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className="text-sm text-muted">{T.passport.drawCommunity}</span>
          <BandPill value={artist.community_size_band} />
          <MethodLabel status="self-reported" />
        </div>
      )}
      {data.links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {data.links.map((l) => (
            <a
              key={l.id} href={l.public_url} target="_blank" rel="noreferrer"
              className="tap-target inline-flex items-center gap-1.5 rounded-full border border-line bg-surface2 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted transition hover:border-line2 hover:text-ink"
            >
              <PlatformLogo name={detectPlatform(l.public_url)} size={16} />
              {hostOf(l.public_url)} ↗
            </a>
          ))}
        </div>
      )}
    </section>
  )
}

// ── P-2 · The 30-second proof story (spec §8.7) — a compact, fixed-order
// 3-beat strip ABOVE the evidence ledger, shared by all four faces. It reuses
// facts already derived above — it invents nothing and reorders nothing: (1)
// who they are — the hero's own name + one-line positioning; (2) what's
// proven — the strongest draw proof unit (drawProofUnits[0], same firewall-
// safe extraction the ledger itself uses); (3) who vouches — the strongest
// producer-confirmed claim, ONLY when one is actually on file (RENDER LAW —
// never an empty promise). Order is fixed 1→2→3, never a ranking.
export function ProofStory({ artist, data, T, contextLines }) {
  const { BANDS } = useLang()
  const lead = drawProofUnits(data, T, BANDS, contextLines)[0]
  const vouchClaim = data.drawClaims[0]?.method_label === METHOD_LABELS.PRODUCER_CONFIRMED ? data.drawClaims[0] : null
  const vouchSafe = vouchClaim && (vouchClaim.public_wording || vouchClaim.public_band || (isBand(vouchClaim.value) ? vouchClaim.value : null))
  const positioning = artist.one_line || [artist.genre, artist.city].filter(Boolean).join(' · ')
  if (!lead && !vouchSafe && !positioning) return null
  // V1 (owner witness-fix 20 Jul, §6 law 7 Passport fold): at 360×780 the
  // full 3-beat list alone measured ~225px — with the hero above it, the
  // FIRST proof unit (the very next thing after this strip) landed ~75px
  // below the fold. Below `sm` this collapses to ONE compact line carrying
  // beats 01+02 (who + what's proven — the identity + strongest proof, the
  // load-bearing half of the story); beat 03 (who vouches) is never lost —
  // the same producer-confirmed claim still leads the ledger right below.
  // Nothing is removed, reordered or reworded — same derived values, same
  // method label text, just laid out on one line instead of three.
  const leadMethodKey = lead ? methodLabelFor({ method_label: lead.methodLabel, verification_status: lead.status }) : null
  return (
    <section className="mt-4 rounded-[18px] border border-line bg-surface2/60 px-4 py-3 sm:mt-6 sm:px-5 sm:py-4 md:mt-5 md:py-3.5">
      {/* compact single-line spine — mobile only */}
      <p className="text-[13px] leading-snug text-ink sm:hidden">
        <span className="font-display font-semibold">{artist.stage_name}</span>
        {positioning && <span className="text-muted"> — {positioning}</span>}
        {lead && (
          <>
            <span className="text-faint"> · </span>
            <span className="font-semibold">{lead.contextLine || lead.claim}</span>
            {leadMethodKey && <span className="ms-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-gold">{T.methodLabel[leadMethodKey]}</span>}
          </>
        )}
      </p>
      <ol className="hidden space-y-3 sm:block">
        <li className="flex items-start gap-3">
          <span aria-hidden="true" className="mt-0.5 font-mono text-[10px] text-faint">01</span>
          <div className="min-w-0">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-faint">{T.passport.storyWho || 'Who they are'}</p>
            <p className="mt-0.5 font-display text-[15px] font-semibold leading-snug text-ink">
              {artist.stage_name}{positioning ? ` — ${positioning}` : ''}
            </p>
          </div>
        </li>
        {lead && (
          <li className="flex items-start gap-3 border-t border-line pt-3">
            <span aria-hidden="true" className="mt-0.5 font-mono text-[10px] text-faint">02</span>
            <div className="min-w-0">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-faint">{T.passport.storyProven || "What's proven"}</p>
              <p className="mt-0.5 text-[15px] font-semibold leading-snug text-ink">{lead.contextLine || lead.claim}</p>
              <div className="mt-1.5"><MethodLabel status={lead.status} methodLabel={lead.methodLabel} /></div>
            </div>
          </li>
        )}
        {vouchSafe && (
          <li className="flex items-start gap-3 border-t border-line pt-3">
            <span aria-hidden="true" className="mt-0.5 font-mono text-[10px] text-faint">03</span>
            <div className="min-w-0">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-faint">{T.passport.storyVouches || 'Who vouches'}</p>
              <p className="mt-0.5 text-[15px] font-semibold leading-snug text-ink">{vouchSafe}</p>
              <div className="mt-1.5"><MethodLabel status={vouchClaim.verification_status} methodLabel={vouchClaim.method_label} /></div>
            </div>
          </li>
        )}
      </ol>
    </section>
  )
}

// ── Hero — full-bleed cinematic identity, shared by both personas. `tagline`
// and the persona toggle (`children`) are the only things a persona changes up
// top; proof never depends on the photo. ────────────────────────────────────
export function PassportHero({ artist, tagline, photoOk, onPhotoError, children }) {
  const { T } = useLang()
  // Nav-law (§10.6, no dead ends): /passport/:id is deliberately shell-less for
  // an anonymous buyer arriving via a shared link — no back link needed there.
  // But the SAME route is also how a logged-in artist/agency/production user
  // previews their own public Passport (ArtistDashboard "view public", the
  // artist nav "Passport" tab via PassportSelf, etc.) — and once here they lost
  // AppShell's nav chrome with no way back. Show a small "back" pill ONLY when
  // a session exists; RoleHome ("/") already resolves to the right workspace
  // for any role, same pattern the org/* screens use.
  const { user } = useAuth() || {}
  const eyebrow = [artist.genre, artist.city].filter(Boolean).join(' · ')
  return (
    <header className="relative">
      {/* V1 (owner witness-fix 20 Jul, §6 law 7 Passport fold): measured at
          360×780 the hero ran ~492px tall before this change, and the FIRST
          proof unit in DrawSection landed at ~854px — ~74px below the fold
          just from the hero+strip alone. The image band + overlap are
          compressed on mobile/tablet ONLY (md+ keeps the original 46vh/-mt-28
          cinematic sizing unchanged) — same photo, same gradient, just a
          shorter band so identity + the first proof card can share one
          screen. */}
      {artist.photo_url && photoOk ? (
        <div className="relative h-[32vh] min-h-[210px] max-h-[380px] w-full overflow-hidden sm:h-[38vh] sm:min-h-[290px] sm:max-h-[460px] md:h-[32vh] md:min-h-[250px] md:max-h-[400px]">
          <img
            src={artist.photo_url}
            alt={artist.stage_name}
            onError={onPhotoError}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,12,11,.25)_0%,rgba(11,12,11,.05)_30%,rgba(11,12,11,.62)_68%,rgba(11,12,11,1)_100%)]" />
        </div>
      ) : (
        <div className="relative h-[200px] w-full overflow-hidden bg-bg2 sm:h-[220px] md:h-[240px]">
          <div className="absolute inset-0 bg-[radial-gradient(90%_120%_at_50%_0%,rgba(242,192,99,.14)_0%,rgba(242,192,99,.04)_45%,rgba(11,12,11,0)_75%)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(11,12,11,0),rgba(11,12,11,1))]" />
        </div>
      )}

      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-4 sm:px-8 sm:pt-5">
        <Wordmark />
        <div className="flex items-center gap-2">
          {user && (
            <Link
              to="/"
              className="tap-target text-xs font-mono font-semibold text-muted border border-line rounded-full px-3 py-1 hover:text-ink hover:border-line2 transition"
            >
              ← {T.common.back}
            </Link>
          )}
          <LanguageToggle />
        </div>
      </div>

      <div className="relative mx-auto -mt-20 max-w-[720px] px-5 sm:-mt-24 sm:px-8 md:-mt-32">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
          {tagline || T.passport.eyebrow}
        </p>
        {eyebrow && (
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted sm:mt-2">{eyebrow}</p>
        )}
        <h1 className="mt-1 font-display text-[clamp(1.9rem,8vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.01em] text-ink">
          {artist.stage_name}
        </h1>
        {artist.one_line && (
          <p className="mt-2 line-clamp-2 max-w-[52ch] text-[14px] leading-snug text-muted sm:mt-3 sm:text-[15px] sm:leading-relaxed md:text-[17px]">{artist.one_line}</p>
        )}
        {children && <div className="mt-3 sm:mt-4 md:mt-5">{children}</div>}
      </div>
    </header>
  )
}

// ── Persona toggle — self-selected by whoever opens the link (the passport is
// public, no login). §8.4 · four faces, ONE switcher chip pattern, ONE evidence
// pool: Booking a show ⇄ Representing ⇄ Production ⇄ Private & corporate — a
// face only re-orders and re-languages the SAME facts, never a different one.
// overflow-x-auto (not wrap) keeps the single-pill segmented-control look on
// narrow phones instead of breaking it onto two rows.
export function PersonaToggle({ persona, onChange, T }) {
  const opts = [
    ['booking', T.passport.personaBooking],
    ['rep', T.passport.personaRep],
    ['production', T.passport.personaProduction],
    ['private', T.passport.personaPrivate],
  ]
  return (
    <div
      role="tablist" aria-label="Passport view"
      className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1"
    >
      {opts.map(([key, label]) => {
        const on = persona === key
        return (
          <button
            key={key} role="tab" aria-selected={on}
            onClick={() => onChange(key)}
            className={`tap-target min-h-[40px] shrink-0 rounded-full px-4 text-[13px] font-semibold transition ${
              on ? 'bg-accent text-ink shadow-[0_6px_18px_-8px_rgba(190,226,78,.7)]' : 'text-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export function PassportFooter() {
  // U33 / spec §2.2: the firewall is ENFORCED BY DESIGN, never NARRATED. The old
  // "NO SCORE · NO RANKING · NO PREDICTION · NO GUARANTEE" strip narrated it — removed.
  // Honesty is shown by the shape of the evidence (bands, method labels, remove-empty), not printed.
  return (
    <footer className="mt-12 border-t border-line pt-5 pb-2">
      <Link to="/" className="tap-target inline-block font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-gold">
        LOCK · lock.show
      </Link>
    </footer>
  )
}

// ── Skeleton — cinematic loading, no spinner (spec: skeletons over spinners) ──
export function PassportSkeleton() {
  return (
    <div className="min-h-full animate-pulse bg-bg" aria-busy="true" aria-label="Loading passport">
      <div className="h-[38vh] min-h-[280px] w-full bg-bg2" />
      <div className="mx-auto max-w-[720px] px-5 sm:px-8">
        <div className="-mt-16 h-3 w-40 rounded bg-surface2" />
        <div className="mt-4 h-10 w-2/3 rounded-lg bg-surface2" />
        <div className="mt-3 h-4 w-1/2 rounded bg-surface" />
        <div className="mt-10 h-5 w-36 rounded bg-surface" />
        <div className="mt-4 grid gap-3">
          <div className="h-28 rounded-[18px] bg-surface" />
          <div className="h-28 rounded-[18px] bg-surface" />
        </div>
      </div>
    </div>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────
export function bandOf(c) {
  if (c.public_band && isBand(c.public_band)) return c.public_band
  if (isBand(c.value)) return c.value
  return null
}

export const prettyType = (t = '') => t.replace(/[-_]/g, ' ')

export const hostOf = (url = '') => {
  const p = detectPlatform(url)
  if (p) return p === 'applemusic' ? 'apple music' : p
  try { return new URL(url).hostname.replace('www.', '') } catch { return url.slice(0, 18) }
}
