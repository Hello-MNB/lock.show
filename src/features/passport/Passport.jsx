import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Wordmark, BottomSheet, PageShell } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { getPublicPassport, recordPassportView, recordProfessionalReaction } from '../../lib/db.js'
import { logEvent, EVENTS } from '../../lib/analytics.js'
import { deriveSections, PassportSkeleton } from './passportKit.jsx'
import PassportBookingView from './PassportBookingView.jsx'
import PassportRepView from './PassportRepView.jsx'

// ── A15 · The public Passport — the WEDGE (warm cinematic night) ─────────────
// Public, buyer-facing, no login. Reads LIVE via anon + RLS; the firewall is
// physical (published-gate + passport-ok RLS + 016/025 column grants).
// This file is the LOADER: it fetches, guards the load states, owns the persona
// (Booking ⇄ Representation) and the conversion sheet, and delegates the actual
// page to one of two persona views. Both views render IDENTICAL evidence via
// passportKit.deriveSections — a persona changes only ORDER and FRAMING, never
// a fact. RENDER LAW: a section with nothing verified is removed. Bands only,
// method labels always. NO score, NO gauge, ever.
// Re-exported here for backward-compat with any older imports.
export { MethodLabel, BandPill } from './passportKit.jsx'

export default function Passport() {
  const { T } = useLang()
  const { id } = useParams()
  const nav = useNavigate()
  const [sp, setSp] = useSearchParams()
  // persona is self-selected by whoever opens the link; ?view=rep deep-links the
  // representation framing (an artist can share that flavour to an agency).
  const persona = sp.get('view') === 'rep' ? 'rep' : 'booking'
  const setPersona = (p) => setSp((prev) => {
    const next = new URLSearchParams(prev)
    if (p === 'rep') next.set('view', 'rep'); else next.delete('view')
    return next
  }, { replace: true })

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
  // G7 — share_link_opened once per visit (ref guard: retries/re-renders never
  // double-log). Only when the URL carries the ?s=1 share marker the artist's
  // copied link appends — an organic open is a passport_view, not a share open.
  const shareOpenLogged = useRef(false)

  useEffect(() => {
    let alive = true
    setView('loading')
    setPhotoOk(true)
    ;(async () => {
      try {
        const data = await getPublicPassport(id)
        if (!alive) return
        if (!data.artist) { setView('notfound'); return }
        if (!data.artist.published) { setView('unpublished'); return }
        setArtist(data.artist)
        setItems(data.items ?? [])
        setClaims(data.claims ?? [])
        setView('ready')
        // Sample passport (demo-artist) is a canned payload — never measured,
        // so the GATE funnel only ever counts real published passports.
        if (id !== 'demo-artist') {
          recordPassportView(id) // measurement, never blocks
          logEvent(EVENTS.PASSPORT_VIEWED, { artist_id: id })
          // G7 — this visit arrived via a shared link (?s=1): log the share
          // open once, on a REAL successfully-loaded passport only.
          if (sp.get('s') === '1' && !shareOpenLogged.current) {
            shareOpenLogged.current = true
            logEvent(EVENTS.SHARE_LINK_OPENED, { artist_id: id })
          }
        }
      } catch {
        if (alive) setView('error')
      }
    })()
    return () => { alive = false }
  }, [id, attempt])

  if (view === 'loading') return <PassportSkeleton />
  if (view !== 'ready') {
    const copy = {
      notfound: {
        title: T.passport.notFound,
        body: T.passport.notFoundBody,
      },
      unpublished: {
        title: T.passport.unpublishedTitle,
        body: T.passport.unpublishedBody,
      },
      error: {
        title: T.passport.loadErrorTitle,
        body: T.passport.loadErrorBody,
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
              {T.common.tryAgain}
            </button>
          )}
        </div>
      </PageShell>
    )
  }

  const data = deriveSections(artist, items, claims, T)

  // action ladder — primary actions continue to the request form; the rest record only
  async function act(actionType, label, { toRequest = false } = {}) {
    if (busy) return
    setBusy(true)
    try {
      await recordProfessionalReaction(id, actionType)
      // GATE signal — a booking professional REACTED to a real Passport (canon
      // P0-5: a view is not a reaction; this is). Sample passport never measured.
      if (id !== 'demo-artist') logEvent(EVENTS.PROFESSIONAL_REACTION, { artist_id: id, action: actionType })
      if (toRequest) { setSheet(false); nav(`/passport/${id}/request`); return }
      setReceipt(label)
    } catch { setReceipt(label) } // reaction is best-effort for the visitor
    finally { setBusy(false) }
  }

  const ViewComp = persona === 'rep' ? PassportRepView : PassportBookingView
  const ctaLabel = persona === 'rep' ? T.passport.ctaRep : T.passport.checkAvailability

  return (
    <div className="min-h-full bg-bg pb-32">
      <ViewComp
        artist={artist}
        data={data}
        T={T}
        persona={persona}
        onPersonaChange={setPersona}
        photoOk={photoOk}
        onPhotoError={() => setPhotoOk(false)}
      />

      {/* ── sticky CTA bar — one dominant action + the no-guarantee line ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-line bg-bg/90 px-5 py-3 backdrop-blur"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-[720px] items-center gap-4">
          <p className="hidden flex-1 text-[11px] leading-snug text-faint sm:block">
            {T.authScene.disclaimer}
          </p>
          <button
            className="btn-primary min-h-[48px] flex-1 shadow-[0_10px_26px_-10px_rgba(190,226,78,.6)] sm:flex-none sm:px-8"
            onClick={() => { setReceipt(null); setSheet(true) }}
          >
            {ctaLabel}
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-faint sm:hidden">
          {T.authScene.disclaimer}
        </p>
      </div>

      {/* ── the professional action ladder — ONE sheet level (canon P0-6 / B2) ── */}
      <BottomSheet open={sheet} onClose={() => setSheet(false)} title={T.passport.sheetTitle}>
        {receipt ? (
          <p role="status" className="rounded-md bg-good-bg px-4 py-3 text-sm font-semibold text-good">
            ✓ {T.passport.receipt(receipt)}
          </p>
        ) : (
          <div>
            {/* PRIMARY — commercial intent → also creates an availability request */}
            <button className="btn-primary mb-2 w-full" disabled={busy}
              onClick={() => act('check_availability', T.passport.checkAvailability, { toRequest: true })}>
              {ctaLabel}
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
