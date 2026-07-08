import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusChip } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { STATUS } from '../../lib/constants.js'
import { deriveWorlds } from '../../lib/radarUniverse.js'

// ── The Agency Radar Universe — the manager's HOME (canon AG1, firewall-safe) ─
// The roster IS the manager's universe: each artist a world orbiting the center.
// Rings show bounded STATE (workflow: needs-you / established / developing) and
// the ✦ badge counts CANDIDATES WAITING (an inbox count, never a grade).
// Worlds dropdown filters by genre/content-world — evidence coverage per world,
// NEVER a ranking, NEVER a cross-artist comparison. MOBILE FIRST.

// Ring colors = spec state tokens: amber (needs-you) · lime (established) ·
// teal (developing) · quiet line (no evidence yet). Categorical, never a gauge.
const RING = {
  needs: 'border-amber',
  established: 'border-accent',
  developing: 'border-teal',
  missing: 'border-line',
}

function artistState(a, claims) {
  const own = claims.filter((c) => c.artist_id === a.id)
  const pending = own.filter((c) => !c.artist_approved).length
  if (pending > 0) return { key: 'needs', pending }
  if (own.some((c) => c.artist_approved && ['verified', 'supporting'].includes(c.verification_status))) return { key: 'established', pending: 0 }
  const signals = [a.lineup_frequency_band, a.sells_tickets != null, a.price_band, a.photo_url].filter(Boolean).length
  return { key: signals >= 1 ? 'developing' : 'missing', pending: 0 }
}

const chipStatus = { needs: STATUS.DEVELOPING, established: STATUS.STRONG, developing: STATUS.DEVELOPING, missing: STATUS.MISSING }

export default function AgencyRadarUniverse({ artists, claims }) {
  const { T } = useLang()
  const S = T.radar.universe
  const [world, setWorld] = useState(null)
  const [selected, setSelected] = useState(null) // artist object → overlay

  const worlds = useMemo(() => {
    const all = artists.flatMap((a) => deriveWorlds({ artist: a, items: [] }))
    return [...new Set(all)]
  }, [artists])

  const inWorld = (a) => !world || deriveWorlds({ artist: a, items: [] }).includes(world)
  const shown = artists.slice(0, 10) // orbit stays readable; full roster in the list below
  const overflow = artists.length - shown.length

  return (
    <div className="relative mb-5 overflow-hidden rounded-xl bg-surface p-4">
      {/* worlds dropdown — "where is my roster relative to each world" as COVERAGE */}
      {worlds.length > 0 && (
        <div className="mb-2 flex justify-end">
          <select
            value={world || ''}
            onChange={(e) => setWorld(e.target.value || null)}
            aria-label={S.worldsHint}
            className={`appearance-none rounded-full border bg-surface px-3 py-1 font-mono text-[10px] outline-none ${
              world ? 'border-accent text-accent' : 'border-line text-faint'
            }`}>
            <option value="">{S.allWorlds}</option>
            {worlds.map((w) => <option key={w} value={w}>{w.toUpperCase()}</option>)}
          </select>
        </div>
      )}

      {artists.length === 0 ? (
        <div className="py-10 text-center">
          <h3 className="font-display text-lg text-ink">{S.rosterEmptyTitle}</h3>
          <p className="mx-auto mt-1 max-w-[300px] text-xs leading-relaxed text-muted">{S.rosterEmptyBody}</p>
        </div>
      ) : (
        <div className="relative mx-auto aspect-square max-w-[400px]">
          <div className="absolute inset-[9%] rounded-full border border-line" aria-hidden />
          {/* center — the roster */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-line bg-surface2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
              {shown.length}
            </span>
            <span className="mt-1.5 block font-mono text-[9px] uppercase tracking-[0.1em] text-faint">{S.rosterCenter}</span>
          </div>
          {/* the artists — each a world */}
          {shown.map((a, i) => {
            const st = artistState(a, claims)
            const dimmed = !inWorld(a)
            const angle = -90 + i * (360 / shown.length)
            const rad = (angle * Math.PI) / 180
            const x = 50 + 41 * Math.cos(rad)
            const y = 50 + 41 * Math.sin(rad)
            return (
              <button key={a.id}
                onClick={() => setSelected(a)}
                style={{ left: `${x}%`, top: `${y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-300 ${dimmed ? 'opacity-25' : 'opacity-100'}`}
                aria-label={`${a.stage_name} — ${st.key}`}>
                <span className={`relative mx-auto grid h-14 w-14 place-items-center overflow-visible rounded-full border-2 bg-surface2 transition-transform hover:scale-105 ${RING[st.key]} ${st.pending > 0 ? 'shadow-[0_0_18px_rgba(190,226,78,0.25)]' : ''}`}>
                  {a.photo_url
                    ? <img src={a.photo_url} alt="" className="h-full w-full rounded-full object-cover" />
                    : <span className="font-display text-base text-ink">{(a.stage_name || '?').slice(0, 1)}</span>}
                  {st.pending > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 font-mono text-[9px] font-bold text-[#12160A]">✦{st.pending}</span>
                  )}
                </span>
                <span className="mt-1.5 block w-20 truncate font-mono text-[8px] uppercase tracking-[0.06em] text-muted">
                  {a.stage_name}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* orbit truncation is honest: the rest of the roster is one hop below */}
      {overflow > 0 && (
        <div className="mt-2 flex justify-center">
          <a href="#roster"
            className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted transition hover:border-accent hover:text-accent">
            +{overflow} more — full roster below
          </a>
        </div>
      )}

      {/* ── ARTIST OVERLAY — a screen above the universe, nothing jumps ── */}
      {selected && (
        <div className="fixed inset-0 z-40 flex flex-col bg-bg animate-fade-in" role="dialog" aria-modal="true" aria-label={selected.stage_name}>
          <div className="flex items-center justify-between border-b border-line px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <button className="min-h-[44px] font-mono text-[11px] uppercase tracking-[0.1em] text-muted hover:text-ink" onClick={() => setSelected(null)}>
              {S.backToUniverse}
            </button>
            <span className="font-display text-base text-ink">{selected.stage_name}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="mb-4 flex items-center gap-4">
              {selected.photo_url
                ? <img src={selected.photo_url} alt="" className="h-16 w-16 rounded-full object-cover" />
                : <span className="grid h-16 w-16 place-items-center rounded-full bg-surface font-display text-lg text-ink">{(selected.stage_name || '?').slice(0, 1)}</span>}
              <div className="min-w-0">
                <p className="font-display text-lg text-ink">{selected.stage_name}</p>
                <p className="text-xs text-muted">{[selected.genre, selected.city].filter(Boolean).join(' · ')}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {deriveWorlds({ artist: selected, items: [] }).map((w) => (
                    <span key={w} className="rounded-full border border-line px-2 py-0.5 font-mono text-[9px] uppercase text-muted">{w}</span>
                  ))}
                </div>
              </div>
            </div>

            {(() => {
              const st = artistState(selected, claims)
              return (
                <div className="space-y-2">
                  <div className="card flex items-center justify-between py-3">
                    <span className="text-sm font-semibold text-ink">{T.radar.evidencePicture}</span>
                    <StatusChip status={chipStatus[st.key]} />
                  </div>
                  {st.pending > 0 && (
                    <div className="card flex items-center justify-between border-accent py-3">
                      <span className="text-sm text-ink">{S.toReview(st.pending)}</span>
                      <span className="font-mono text-[9px] uppercase text-muted">{S.filters.needsYou}</span>
                    </div>
                  )}
                  {selected.published
                    ? <Link to={`/passport/${selected.id}`} className="btn-primary block w-full text-center">{S.viewPassport}</Link>
                    : <p className="py-2 text-center text-xs text-muted">{S.notPublished}</p>}
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
