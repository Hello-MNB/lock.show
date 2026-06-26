import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageShell, Wordmark, Loading, SourceLabel, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

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

  // map a draw band to a quiet source label using the strongest related claim
  const drawClaim = claims.find((c) => c.claim_type?.includes('draw') || c.claim_type?.includes('ticket'))
  const drawSrc = drawClaim?.verification_status || 'self-reported'

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
        {/* CTA above the fold */}
        <button className="btn-primary w-full mt-4" onClick={() => nav(`/passport/${id}/request`)}>
          {T.passport.cta}
        </button>

        {/* music / links */}
        {links.length > 0 && (
          <Section title="מוזיקה">
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.id}><a href={l.public_url} target="_blank" rel="noreferrer"
                  dir="ltr" className="text-accent break-all text-sm">{l.public_url}</a></li>
              ))}
            </ul>
          </Section>
        )}

        {/* ② PROOF OF DRAW — hero block, bands only */}
        <Section title={T.passport.proofTitle}>
          {hasDraw ? (
            <div className="space-y-2">
              {artist.lineup_frequency_band && (
                <DrawRow label="תדירות בליינאפים" value={artist.lineup_frequency_band} src={drawSrc} />
              )}
              {artist.sells_tickets != null && (
                <DrawRow label="מוכר כרטיסים" value={artist.sells_tickets ? 'כן' : 'לא'} src={drawSrc} />
              )}
              {artist.price_band && (
                <DrawRow label="בנד מחיר / גרנטי" value={artist.price_band} src="self-reported" />
              )}
              {artist.community_size_band && (
                <DrawRow label="קהילה בבעלותו" value={artist.community_size_band} src="self-reported" />
              )}
            </div>
          ) : (
            <p className="text-muted text-sm">{T.passport.proofBuilding}</p>
          )}
        </Section>

        {/* ③ track record */}
        {exp.length > 0 && (
          <Section title={T.passport.trackRecord}>
            <ul className="space-y-2">
              {exp.map((i) => (
                <li key={i.id} className="flex items-center justify-between rounded-xl bg-card px-3 py-2">
                  <span className="text-soft text-sm">{i.title}{i.item_date ? ` · ${i.item_date}` : ''}</span>
                  <SourceLabel status={i.source_status === 'public-verified' ? 'verified' : 'self-reported'} />
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ④ readiness */}
        {(artist.set_length || artist.regions || artist.invoice_ready) && (
          <Section title={T.passport.readiness}>
            <div className="flex flex-wrap gap-2">
              {artist.genre && <span className="chip bg-card text-soft">{artist.genre}</span>}
              {artist.set_length && <span className="chip bg-card text-soft">סט: {artist.set_length}</span>}
              {artist.regions && <span className="chip bg-card text-soft">אזורים: {artist.regions}</span>}
              {artist.invoice_ready && <span className="chip bg-card text-soft">חשבונית ✓</span>}
            </div>
          </Section>
        )}

        <p className="mt-6 text-center text-[11px] text-muted">{T.passport.firewall}</p>
        <div className="mt-4 text-center"><Link to="/" className="text-xs text-muted">GIGPROOF</Link></div>
      </div>

      {/* sticky CTA */}
      <div className="fixed bottom-0 right-0 left-0 z-20 border-t border-line bg-ink/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-xl flex items-center gap-3">
          <LanguageToggle />
          <button className="btn-primary flex-1" onClick={() => nav(`/passport/${id}/request`)}>{T.passport.cta}</button>
        </div>
      </div>
    </div>
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

function DrawRow({ label, value, src }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-card px-4 py-3">
      <div>
        <p className="text-soft font-bold">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
      <SourceLabel status={src} />
    </div>
  )
}
