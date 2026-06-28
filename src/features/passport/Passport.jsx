import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageShell, Wordmark, Loading, SourceLabel, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { SOURCE_STATUS } from '../../lib/constants.js'
import { DEMO, demoPassportPayload } from '../../lib/demo.js'

// Public, buyer-facing. Data comes from the server-enforced /api/passport/:id endpoint.
// Firewall is enforced server-side — no score, no exact head-count, no gaps, no private fields.
export default function Passport() {
  const { T } = useLang()
  const { id } = useParams()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [artist, setArtist] = useState(null)
  const [items, setItems] = useState([])
  const [claims, setClaims] = useState([])

  useEffect(() => {
    if (DEMO) {
      setArtist(demoPassportPayload.artist)
      setItems(demoPassportPayload.items)
      setClaims(demoPassportPayload.claims)
      setLoading(false)
      return
    }
    (async () => {
      try {
        const res = await fetch(`/api/passport/${id}`)
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(json.error || 'Not found')
        }
        const data = await res.json()
        setArtist(data.artist)
        setItems(data.items ?? [])
        setClaims(data.claims ?? [])
      } catch { /* artist stays null → shows not-found */ }
      finally { setLoading(false) }
    })()
  }, [id])

  if (loading) return <Loading />
  if (!artist || !artist.published) {
    return <PageShell><Wordmark className="mb-6" /><p className="text-muted">{T.passport.notFound}</p></PageShell>
  }

  const exp = items.filter((i) => !['link', 'draw_signal'].includes(i.item_type))
  const links = items.filter((i) => i.item_type === 'link')
  const hasDraw = artist.lineup_frequency_band || artist.sells_tickets != null || artist.price_band || artist.community_size_band

  // map a draw band to its method label using the strongest related claim
  const drawClaim = claims.find((c) => c.claim_type?.includes('draw') || c.claim_type?.includes('ticket') || c.claim_type?.includes('lineup'))
  const drawSrc = drawClaim?.verification_status || 'self-reported'
  const drawMethod = drawClaim?.method_label

  return (
    <div className="min-h-full pb-24">
      {/* HERO */}
      <div className="relative">
        {artist.photo_url
          ? <img src={artist.photo_url} alt="" className="h-72 w-full object-cover" />
          : <div className="h-72 w-full bg-gradient-to-b from-surface to-ink" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute bottom-0 right-0 left-0 p-5">
          <span className="chip bg-accent/20 text-accent mb-2">✓ {T.passport.chip}</span>
          <h1 className="text-3xl font-extrabold text-white">{artist.stage_name}</h1>
          <p className="text-soft">{artist.one_line || `${artist.genre} · ${artist.city}`}</p>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4">
        {/* ② PROOF OF DRAW — the HERO evidence block (UX §15.3: evidence-first).
            Bands + binaries only, each with its method label visible without tapping. */}
        <section className="mt-5">
          <h2 className="text-base font-bold text-soft mb-2">{T.passport.proofTitle}</h2>
          {hasDraw ? (
            <div className="space-y-2">
              {artist.lineup_frequency_band && (
                <DrawRow label={T.passport.drawFrequency} value={artist.lineup_frequency_band} src={drawSrc} methodLabel={drawMethod} />
              )}
              {artist.sells_tickets != null && (
                <DrawRow label={T.passport.drawSellsTickets} value={artist.sells_tickets ? T.common.yes : T.common.no} src={drawSrc} methodLabel={drawMethod} />
              )}
              {artist.price_band && (
                <DrawRow label={T.passport.drawPrice} value={artist.price_band} src="self-reported" />
              )}
              {artist.community_size_band && (
                <DrawRow label={T.passport.drawCommunity} value={artist.community_size_band} src="self-reported" />
              )}
            </div>
          ) : (
            <p className="text-muted text-sm">{T.passport.proofBuilding}</p>
          )}
        </section>

        {/* ③ supporting context — track record */}
        {exp.length > 0 && (
          <Section title={T.passport.trackRecord}>
            <ul className="space-y-2">
              {exp.map((i) => (
                <li key={i.id} className="flex items-center justify-between rounded-xl bg-card px-3 py-2">
                  <span className="text-soft text-sm">{i.title}{i.item_date ? ` · ${i.item_date}` : ''}</span>
                  <SourceLabel status={i.source_status === SOURCE_STATUS.PUBLIC_VERIFIED ? 'supporting' : 'self-reported'} />
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* supporting context — music / links */}
        {links.length > 0 && (
          <Section title={T.passport.music}>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.id}><a href={l.public_url} target="_blank" rel="noreferrer"
                  dir="ltr" className="text-accent break-all text-sm">{l.public_url}</a></li>
              ))}
            </ul>
          </Section>
        )}

        {/* ④ supporting context — readiness */}
        {(artist.set_length || artist.regions || artist.invoice_ready) && (
          <Section title={T.passport.readiness}>
            <div className="flex flex-wrap gap-2">
              {artist.genre && <span className="chip bg-card text-soft">{artist.genre}</span>}
              {artist.set_length && <span className="chip bg-card text-soft">{T.passport.setLabel}: {artist.set_length}</span>}
              {artist.regions && <span className="chip bg-card text-soft">{T.passport.regionsLabel}: {artist.regions}</span>}
              {artist.invoice_ready && <span className="chip bg-card text-soft">{T.passport.invoiceLabel}</span>}
            </div>
          </Section>
        )}

        {/* B2 action ladder — secondary rungs 2–6 (rung 1 = the sticky CTA) */}
        <ActionLadder artistId={id} T={T} />

        <p className="mt-6 text-center text-[11px] text-muted">{T.passport.firewall}</p>
        <div className="mt-4 text-center"><Link to="/" className="text-xs text-muted">GIGPROOF</Link></div>
      </div>

      {/* sticky single PRIMARY CTA (B2 rung 1) */}
      <div className="fixed bottom-0 right-0 left-0 z-20 border-t border-line bg-ink/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-xl flex items-center gap-3">
          <LanguageToggle />
          <button className="btn-primary flex-1" onClick={() => nav(`/passport/${id}/request`)}>{T.passport.cta}</button>
        </div>
      </div>
    </div>
  )
}

// B2 action ladder — the 5 secondary one-tap validation signals (rungs 2–6).
// Rung 1 (availability) is the primary sticky CTA → the B3 request form.
function ActionLadder({ artistId, T }) {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const rungs = [
    ['price_details', T.passport.rungPrice],
    ['future_fit', T.passport.rungFuture],
    ['needs_proof', T.passport.rungNeedsProof],
    ['not_this_event', T.passport.rungNotThis],
    ['forwarded', T.passport.rungForward],
  ]
  async function send(signal) {
    if (busy || sent) return
    setBusy(true)
    try {
      if (!DEMO) await fetch('/api/passport-signal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId, signal }),
      })
      setSent(true)
    } finally { setBusy(false) }
  }
  return (
    <section className="mt-6">
      <button className="text-sm text-muted hover:text-soft" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {T.passport.moreResponses} <span aria-hidden="true">{open ? '▲' : '▾'}</span>
      </button>
      {open && (sent ? (
        <p role="status" className="mt-2 text-sm text-ok"><span aria-hidden="true">✓</span> {T.passport.signalLogged}</p>
      ) : (
        <div className="mt-2 grid grid-cols-1 gap-2">
          {rungs.map(([sig, label]) => (
            <button key={sig} className="btn-ghost text-sm min-h-[44px]" onClick={() => send(sig)} disabled={busy}>{label}</button>
          ))}
        </div>
      ))}
    </section>
  )
}

function Section({ title, children }) {
  return (
    <section className="mt-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted mb-2">{title}</h2>
      {children}
    </section>
  )
}

function DrawRow({ label, value, src, methodLabel }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-card px-4 py-3">
      <div>
        <p className="text-soft font-bold">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
      <SourceLabel status={src} methodLabel={methodLabel} />
    </div>
  )
}
