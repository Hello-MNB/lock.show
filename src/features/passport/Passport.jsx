import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Wordmark, LanguageToggle, BottomSheet, PageShell, PlatformMark, platformOf } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { SOURCE_STATUS, methodLabelFor } from '../../lib/constants.js'
import { getPublicPassport, recordPassportView, recordProfessionalReaction } from '../../lib/db.js'

// ── A15 · The public Passport — the WEDGE (warm cinematic night) ─────────────
// Public, buyer-facing, no login. Reads LIVE via anon + RLS; the firewall is
// physical (published-gate + passport-ok RLS + 016/025 column grants).
// RENDER LAW: a section with nothing verified is REMOVED from the DOM — the
// public face never shows "missing", "building" or any gap. Bands only, method
// labels always, streaming demoted to context. NO score, NO gauge, ever.
// Opening the page writes passport_view_event; ONLY an explicit action writes
// professional_reaction (canon P0-5 — a view is not a reaction).

const isBand = (v = '') => /^[\d,.]+\s*[–-]\s*[\d,.]+/.test(String(v).trim())

// ── Local proof primitives (fallback until ui.jsx exports MethodLabel/BandPill;
//    same contract — swap to the shared export once Foundation lands it) ──────
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
      className="inline-flex items-center rounded-full border border-white/25 bg-surface2 px-3 py-[3px] font-mono text-[13px] font-semibold tracking-[-0.01em] text-ink"
    >
      {value}
    </span>
  )
}

export default function Passport() {
  const { T } = useLang()
  const { id } = useParams()
  const nav = useNavigate()
  // 'loading' | 'ready' | 'unpublished' | 'notfound' | 'error'
  const [view, setView] = useState('loading')
  const [attempt, setAttempt] = useState(0)
  const [artist, setArtist] = useState(null)
  const [items, setItems] = useState([])
  const [claims, setClaims] = useState([])
  const [photoOk, setPhotoOk] = useState(true)
  const [sheet, setSheet] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    setView('loading')
    setPhotoOk(true)
    ;(async () => {
      try {
        const data = await getPublicPassport(id)
        if (!alive) return
        if (!data.artist) { setView('notfound'); return }          // RLS hid it or no such id
        if (!data.artist.published) { setView('unpublished'); return } // owner sees own draft
        setArtist(data.artist)
        setItems(data.items ?? [])
        setClaims(data.claims ?? [])
        setView('ready')
        recordPassportView(id) // measurement, never blocks
      } catch {
        if (alive) setView('error') // network/server — distinct from not-found
      }
    })()
    return () => { alive = false }
  }, [id, attempt])

  if (view === 'loading') return <PassportSkeleton />
  if (view !== 'ready') {
    const copy = {
      notfound: {
        title: T.passport.notFound,
        body: 'Check the link you received — passport links are exact. If it was shared with you, ask the sender for a fresh one.',
      },
      unpublished: {
        title: "This passport isn't published",
        body: 'The artist has taken it offline for now. Ask them for a fresh link when it goes live again.',
      },
      error: {
        title: "Couldn't load this passport",
        body: 'Connection issue on our side or yours — your link is probably fine.',
      },
    }[view]
    return (
      <PageShell max="max-w-md">
        <Wordmark className="mb-8" />
        <div className="rounded-[20px] border border-line bg-surface p-6">
          <h1 className="font-display text-xl font-bold text-ink">{copy.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{copy.body}</p>
          {view === 'error' && (
            <button className="btn-primary mt-5" onClick={() => setAttempt((a) => a + 1)}>
              Try again
            </button>
          )}
        </div>
      </PageShell>
    )
  }

  const exp = items.filter((i) => !['link', 'draw_signal'].includes(i.item_type))
  const links = items.filter((i) => i.item_type === 'link')

  // draw evidence: passport-ok claims (strongest first: producer-confirmed → verified → supporting)
  const order = { 'producer-confirmed': 0 }
  const vOrder = { verified: 1, supporting: 2 }
  const drawClaims = [...claims].sort((a, b) =>
    (order[a.method_label] ?? vOrder[a.verification_status] ?? 3) - (order[b.method_label] ?? vOrder[b.verification_status] ?? 3))
  const drawBands = [
    artist.lineup_frequency_band && { value: artist.lineup_frequency_band, ctx: T.passport.drawFrequency },
    artist.sells_tickets != null && { value: artist.sells_tickets ? T.common.yes : T.common.no, ctx: T.passport.drawSellsTickets },
    artist.price_band && { value: artist.price_band, ctx: T.passport.drawPrice },
  ].filter(Boolean)
  const hasDraw = drawClaims.length > 0 || drawBands.length > 0
  const hasReadiness = artist.set_length || artist.regions || artist.invoice_ready
  const hasContext = links.length > 0 || artist.community_size_band

  // action ladder — primary actions continue to the request form; the rest record only
  async function act(actionType, label, { toRequest = false } = {}) {
    if (busy) return
    setBusy(true)
    try {
      await recordProfessionalReaction(id, actionType)
      if (toRequest) { setSheet(false); nav(`/passport/${id}/request`); return }
      setReceipt(label)
    } catch { setReceipt(label) } // reaction is best-effort for the visitor
    finally { setBusy(false) }
  }

  const eyebrow = [artist.genre, artist.city].filter(Boolean).join(' · ')

  return (
    <div className="min-h-full bg-bg pb-32">

      {/* ── ① HERO — full-bleed cinematic identity; proof never depends on it ── */}
      <header className="relative">
        {artist.photo_url && photoOk ? (
          <div className="relative h-[46vh] min-h-[340px] max-h-[540px] w-full overflow-hidden">
            <img
              src={artist.photo_url}
              alt={artist.stage_name}
              onError={() => setPhotoOk(false)}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
            {/* gradient veil — photo dissolves into the page, one warm light */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,12,11,.25)_0%,rgba(11,12,11,.05)_30%,rgba(11,12,11,.62)_68%,#0B0C0B_100%)]" />
          </div>
        ) : (
          /* elegant dark hero without a photo — warm gold aura, never a blank */
          <div className="relative h-[240px] w-full overflow-hidden bg-bg2">
            <div className="absolute inset-0 bg-[radial-gradient(90%_120%_at_50%_0%,rgba(242,192,99,.14)_0%,rgba(242,192,99,.04)_45%,rgba(11,12,11,0)_75%)]" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(11,12,11,0),#0B0C0B)]" />
          </div>
        )}

        {/* top bar over the hero */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5 sm:px-8">
          <Wordmark />
          <LanguageToggle />
        </div>

        {/* identity block anchored to the veil */}
        <div className="relative mx-auto -mt-28 max-w-[720px] px-5 sm:px-8">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
            {T.passport.eyebrow}
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
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-5 sm:px-8">

        {/* ── ② PROOF OF DRAW ★ the hero evidence block ── */}
        {hasDraw && (
          <PassportSection label={T.passport.proofTitle} caption={T.passport.drawCaption}>
            <div className="grid gap-3">
              {drawClaims.map((c) => (
                <ProofUnit
                  key={c.id}
                  claim={c.public_wording || c.public_band || c.value}
                  context={prettyType(c.claim_type)}
                  band={bandOf(c)}
                  status={c.verification_status}
                  methodLabel={c.method_label}
                  reviewedAt={c.verified_at}
                  T={T}
                />
              ))}
              {drawBands.map((b, i) => (
                <ProofUnit key={`band-${i}`} claim={b.value} context={b.ctx} status="self-reported" T={T} />
              ))}
            </div>
          </PassportSection>
        )}

        {/* ── ③ PERFORMANCE — track record ── */}
        {exp.length > 0 && (
          <PassportSection label={T.passport.performance}>
            <div className="rounded-[18px] border border-line bg-surface px-5">
              {exp.map((i) => (
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
        )}

        {/* ── ④ READINESS — binaries; absent = omitted, never "missing" ── */}
        {hasReadiness && (
          <PassportSection label={T.passport.readiness}>
            <div className="flex flex-wrap gap-2">
              {artist.set_length && <ReadyChip>{T.passport.setLabel}: {artist.set_length}</ReadyChip>}
              {artist.regions && <ReadyChip>{T.passport.regionsLabel}: {artist.regions}</ReadyChip>}
              {artist.invoice_ready && <ReadyChip>{T.passport.invoiceLabel}</ReadyChip>}
            </div>
          </PassportSection>
        )}

        {/* ── ⑤ CONTEXT STRIP — streaming/social/community, explicitly secondary.
               Dashed border = "this is not the evidence" (firewall §streaming) ── */}
        {hasContext && (
          <section className="mt-10 rounded-[18px] border border-dashed border-white/15 p-5">
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
              Context — not a draw metric
            </p>
            {artist.community_size_band && (
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <span className="text-sm text-muted">{T.passport.drawCommunity}</span>
                <BandPill value={artist.community_size_band} />
                <MethodLabel status="self-reported" />
              </div>
            )}
            {links.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {links.map((l) => (
                  <a
                    key={l.id} href={l.public_url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface2 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted transition hover:border-white/25 hover:text-ink"
                  >
                    <PlatformMark platform={platformOf(l.public_url)} size="h-5 w-5" />
                    {hostOf(l.public_url)} ↗
                  </a>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── FOOTER — the standing disclaimer ── */}
        <footer className="mt-12 border-t border-line pt-5 pb-2">
          <p className="font-mono text-[9.5px] leading-relaxed tracking-[0.06em] text-faint">{T.passport.disclaimer}</p>
          <Link to="/" className="mt-3 inline-block font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-gold">
            GIGPROOF · gigproof.co
          </Link>
        </footer>
      </main>

      {/* ── sticky CTA bar — one dominant action + the no-guarantee line ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-line bg-bg/90 px-5 py-3 backdrop-blur"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-[720px] items-center gap-4">
          <p className="hidden flex-1 text-[11px] leading-snug text-faint sm:block">
            GIGPROOF shows evidence only — not a guarantee.
          </p>
          <button
            className="btn-primary min-h-[48px] flex-1 shadow-[0_10px_26px_-10px_rgba(190,226,78,.6)] sm:flex-none sm:px-8"
            onClick={() => { setReceipt(null); setSheet(true) }}
          >
            {T.passport.checkAvailability}
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-faint sm:hidden">
          GIGPROOF shows evidence only — not a guarantee.
        </p>
      </div>

      {/* ── the professional action ladder — ONE sheet level (canon P0-6 / B2) ── */}
      <BottomSheet open={sheet} onClose={() => setSheet(false)} title={T.passport.sheetTitle}>
        {receipt ? (
          <p role="status" className="rounded-md bg-[rgba(190,226,78,.12)] px-4 py-3 text-sm font-semibold text-[#CBEE72]">
            ✓ {T.passport.receipt(receipt)}
          </p>
        ) : (
          <div>
            {/* PRIMARY — commercial intent → also creates an availability request */}
            <button className="btn-primary mb-2 w-full" disabled={busy}
              onClick={() => act('check_availability', T.passport.checkAvailability, { toRequest: true })}>
              {T.passport.checkAvailability}
            </button>
            <button className="btn-ghost mb-4 w-full" disabled={busy}
              onClick={() => act('request_price', T.passport.rungPrice, { toRequest: true })}>
              {T.passport.rungPrice}
            </button>

            {/* SECONDARY — keep it in play */}
            <p className="label border-t border-line pt-3">{T.passport.sheetOther}</p>
            <div className="mt-1 grid grid-cols-1 gap-1.5">
              {[
                ['save', T.passport.rungSave],
                ['forward', T.passport.rungForward],
                ['future_fit', T.passport.rungFuture],
              ].map(([a, label]) => (
                <button key={a} className="btn-ghost min-h-[44px] text-sm" disabled={busy} onClick={() => act(a, label)}>
                  {label}
                </button>
              ))}
            </div>

            {/* DIAGNOSTIC — honest signal back to the artist (method-safe text only) */}
            <div className="mt-2 grid grid-cols-1 gap-1.5 border-t border-line pt-2">
              {[
                ['request_proof', T.passport.rungNeedsProof],
                ['not_fit', T.passport.rungNotThis],
              ].map(([a, label]) => (
                <button key={a} disabled={busy} onClick={() => act(a, label)}
                  className="min-h-[44px] rounded-md text-sm text-muted transition hover:bg-surface2 hover:text-ink disabled:opacity-50">
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}

// ── Proof Unit — GIGPROOF's visual signature (spec): claim 19px bold → context
// muted → footer [BandPill · MethodLabel · reviewed date mono]. Card, no gauge. ──
function ProofUnit({ claim, context, band, status, methodLabel, reviewedAt, T }) {
  const reviewed = reviewedAt ? new Date(reviewedAt).toLocaleDateString('en-GB') : null
  const claimIsBand = isBand(claim)
  return (
    <article className="rounded-[18px] border border-line bg-surface p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,.75)]">
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

function PassportSection({ label, caption, children }) {
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

// ── Skeleton — cinematic loading, no spinner (spec: skeletons over spinners) ──
function PassportSkeleton() {
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

// band value of a claim, if any — public_band wins, else a band-shaped value
function bandOf(c) {
  if (c.public_band && isBand(c.public_band)) return c.public_band
  if (isBand(c.value)) return c.value
  return null
}

const prettyType = (t = '') => t.replace(/[-_]/g, ' ')

const hostOf = (url = '') => {
  // brand name when we know the platform ("open.spotify.com" must read SPOTIFY,
  // not OPEN); otherwise the full hostname — never a bare subdomain
  const p = platformOf(url)
  if (p) return p === 'apple' ? 'apple music' : p
  try { return new URL(url).hostname.replace('www.', '') } catch { return url.slice(0, 18) }
}
