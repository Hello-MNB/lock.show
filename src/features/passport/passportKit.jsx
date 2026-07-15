import { Link } from 'react-router-dom'
import { Wordmark, LanguageToggle } from '../../components/ui.jsx'
import { PlatformLogo, detectPlatform } from '../../components/PlatformLogo.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { SOURCE_STATUS, methodLabelFor } from '../../lib/constants.js'

// ── passportKit — the SHARED, firewall-safe rendering + derivation layer for the
// public Passport. The two buyer personas (Booking view · Representation view)
// are separate files, but they MUST show identical evidence — same bands, same
// method labels, same "remove empty sections" law. That single source of truth
// lives here so a persona can only change ORDER, EMPHASIS and CTA — never the
// facts and never the firewall. NO score, NO gauge, ever. (CLAUDE.md firewall.)

export const isBand = (v = '') => /^[\d,.]+\s*[–-]\s*[\d,.]+/.test(String(v).trim())

// ── Proof primitives ────────────────────────────────────────────────────────
// Method label: mono uppercase, gold on transparent; producer-confirmed in lime.
export function MethodLabel({ status, methodLabel, expiresAt }) {
  const { T } = useLang()
  const key = methodLabelFor({ method_label: methodLabel, verification_status: status, expires_at: expiresAt })
  const lime = key === 'producer-confirmed'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-[3px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] ${
        lime ? 'border-accent/70 text-accent' : 'border-gold/50 text-gold'
      }`}
    >
      <span aria-hidden="true">{lime ? '★' : '✓'}</span>
      {T.methodLabel[key]}
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

// Proof Unit — LOCK's visual signature: claim 19px bold → context muted →
// footer [BandPill · MethodLabel · reviewed date]. Card, no gauge.
export function ProofUnit({ claim, context, band, status, methodLabel, reviewedAt, T }) {
  const reviewed = reviewedAt ? new Date(reviewedAt).toLocaleDateString('en-GB') : null
  const claimIsBand = isBand(claim)
  return (
    <article className="rounded-[18px] border border-line bg-surface p-5 shadow-card">
      {claimIsBand
        ? <p className="font-mono text-[26px] font-bold leading-tight tracking-[-0.01em] text-ink" aria-label={`Band: ${claim}`}>{claim}</p>
        : <p className="text-[19px] font-bold leading-snug text-ink">{claim}</p>}
      {context && context !== claim && <p className="mt-1 text-sm text-muted">{context}</p>}
      <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        {band && !claimIsBand && <BandPill value={band} />}
        <MethodLabel status={status} methodLabel={methodLabel} />
        {reviewed && (
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.08em] text-faint">
            {T.passport.reviewedShort(reviewed)}
          </span>
        )}
      </div>
    </article>
  )
}

export function PassportSection({ label, caption, children }) {
  return (
    <section className="mt-10">
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
    artist.sells_tickets != null && { value: artist.sells_tickets ? T.common.yes : T.common.no, ctx: T.passport.drawSellsTickets },
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

// Proof of draw — the hero evidence block (labels configurable per persona).
export function DrawSection({ data, T, label }) {
  if (!data.hasDraw) return null
  return (
    <PassportSection label={label || T.passport.proofTitle} caption={T.passport.drawCaption}>
      <div className="grid gap-3">
        {/* FIREWALL: the draw headline may ONLY be the buyer-safe wording, a band,
            or a band-SHAPED value. Raw `value` can carry an exact headcount
            ("Drew 450 people") — a claim with no safe form renders nothing here
            (flow-gap I: safety must not depend on the pipeline always filling
            public_wording/public_band). */}
        {data.drawClaims
          .map((c) => ({ c, safe: c.public_wording || c.public_band || (isBand(c.value) ? c.value : null) }))
          .filter(({ safe }) => safe)
          .map(({ c, safe }) => (
          <ProofUnit
            key={c.id}
            claim={safe}
            context={prettyType(c.claim_type)}
            band={bandOf(c)}
            status={c.verification_status}
            methodLabel={c.method_label}
            reviewedAt={c.verified_at}
            T={T}
          />
        ))}
        {data.drawBands.map((b, i) => (
          <ProofUnit key={`band-${i}`} claim={b.value} context={b.ctx} status="self-reported" T={T} />
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
          <div key={i.id} className="flex items-center justify-between gap-3 border-b border-line py-3.5 last:border-0">
            <span className="min-w-0 truncate text-[15px] text-ink">
              {i.title}
              {i.item_date ? <span className="text-faint"> · {i.item_date}</span> : null}
            </span>
            <MethodLabel status={i.source_status === SOURCE_STATUS.PUBLIC_VERIFIED ? 'supporting' : 'self-reported'} />
          </div>
        ))}
      </div>
    </PassportSection>
  )
}

export function ReadinessSection({ data, artist, T }) {
  if (!data.hasReadiness) return null
  return (
    <PassportSection label={T.passport.readiness}>
      <div className="flex flex-wrap gap-2">
        {artist.set_length && <ReadyChip>{T.passport.setLabel}: {artist.set_length}</ReadyChip>}
        {artist.regions && <ReadyChip>{T.passport.regionsLabel}: {artist.regions}</ReadyChip>}
        {artist.invoice_ready && <ReadyChip>{T.passport.invoiceLabel}</ReadyChip>}
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
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface2 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted transition hover:border-line2 hover:text-ink"
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

// ── Hero — full-bleed cinematic identity, shared by both personas. `tagline`
// and the persona toggle (`children`) are the only things a persona changes up
// top; proof never depends on the photo. ────────────────────────────────────
export function PassportHero({ artist, tagline, photoOk, onPhotoError, children }) {
  const { T } = useLang()
  const eyebrow = [artist.genre, artist.city].filter(Boolean).join(' · ')
  return (
    <header className="relative">
      {artist.photo_url && photoOk ? (
        <div className="relative h-[46vh] min-h-[340px] max-h-[540px] w-full overflow-hidden">
          <img
            src={artist.photo_url}
            alt={artist.stage_name}
            onError={onPhotoError}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,12,11,.25)_0%,rgba(11,12,11,.05)_30%,rgba(11,12,11,.62)_68%,rgba(11,12,11,1)_100%)]" />
        </div>
      ) : (
        <div className="relative h-[240px] w-full overflow-hidden bg-bg2">
          <div className="absolute inset-0 bg-[radial-gradient(90%_120%_at_50%_0%,rgba(242,192,99,.14)_0%,rgba(242,192,99,.04)_45%,rgba(11,12,11,0)_75%)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(11,12,11,0),rgba(11,12,11,1))]" />
        </div>
      )}

      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5 sm:px-8">
        <Wordmark />
        <LanguageToggle />
      </div>

      <div className="relative mx-auto -mt-28 max-w-[720px] px-5 sm:px-8">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
          {tagline || T.passport.eyebrow}
        </p>
        {eyebrow && (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{eyebrow}</p>
        )}
        <h1 className="mt-1 font-display text-[clamp(2.2rem,8vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.01em] text-ink">
          {artist.stage_name}
        </h1>
        {artist.one_line && (
          <p className="mt-3 max-w-[52ch] text-[17px] leading-relaxed text-muted">{artist.one_line}</p>
        )}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </header>
  )
}

// ── Persona toggle — self-selected by whoever opens the link (the passport is
// public, no login). Booking a show ⇄ Representing. ──────────────────────────
export function PersonaToggle({ persona, onChange, T }) {
  const opts = [
    ['booking', T.passport.personaBooking],
    ['rep', T.passport.personaRep],
  ]
  return (
    <div role="tablist" aria-label="Passport view" className="inline-flex rounded-full border border-line bg-surface p-1">
      {opts.map(([key, label]) => {
        const on = persona === key
        return (
          <button
            key={key} role="tab" aria-selected={on}
            onClick={() => onChange(key)}
            className={`min-h-[40px] rounded-full px-4 text-[13px] font-semibold transition ${
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

export function PassportFooter({ T }) {
  return (
    <footer className="mt-12 border-t border-line pt-5 pb-2">
      <p className="font-mono text-[9.5px] leading-relaxed tracking-[0.06em] text-faint">{T.passport.disclaimer}</p>
      <Link to="/" className="mt-3 inline-block font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-gold">
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
