import { useLang } from '../../context/LangContext.jsx'

// ── P-5 · THE HERO: ROOM GRAMMAR (concept 3 — ratified §5.10 spec block,
// built verbatim, no deviation) ─────────────────────────────────────────────
// "The four canonical bands may render as four room silhouettes side-by-side
// — Lounge · Club · Hall · Festival stage — with the artist's room lit by a
// stage-light cone; the band value + its method chip sit on/under the light;
// the §5.10 human line leads beneath."
//
// Rules implemented:
// (1) Side-by-side, equal footprint, fixed venue-type order — DIFFERENT
//     ROOMS, never a size-progression / stacked bar / left-to-right growth.
//     Every room shares the same container size + stroke weight; unlit rooms
//     get equal visual weight (quiet outlines — rooms, not failures; no
//     grey-to-shame, no red).
// (2) One room lit — the caller's stored band lights exactly its room. The
//     light carries the truth: band value + method chip adjacent. The
//     picture IS the band; it adds no information the band doesn't hold.
// (3) Canonical bands only, honesty on fallback — the caller (DrawSection)
//     gates this component to fire ONLY for a confirmed, passport-ok draw
//     claim whose band is an EXACT canonical capacity band. A free-form band
//     never reaches here — this component itself refuses to guess (returns
//     null) if handed a band it can't place exactly.
// (4) Buyer-facing draw presentation only (rendered inside DrawSection).
// (5) A11y = the band + method label in words, never "bigger/better/level":
//     unlit rooms are decorative (aria-hidden) since they carry no data; the
//     lit room's BandPill/MethodLabel already speak the words in full.
// (6) The room is the same stored band drawn as a picture — not a number
//     about a person, not a peer comparison, not a ladder.
//
// The 4 canonical bands are BANDS.capacity (src/lib/i18n/{en,he}.js) — the
// SAME array src/lib/humanize.js's humanizeDrawBand and passportKit's
// DrawSection already key the room-fit sentence off. Room order is index-
// aligned to that array (Up to 100 → Lounge · 100–300 → Club · 300–800 →
// Hall · 800+ → Festival stage).
const ROOMS = [
  { key: 'lounge', Shape: RoomLounge, name: (T) => T.passport.roomLounge || 'Lounge' },
  { key: 'club', Shape: RoomClub, name: (T) => T.passport.roomClub || 'Club' },
  { key: 'hall', Shape: RoomHall, name: (T) => T.passport.roomHall || 'Hall' },
  { key: 'festival', Shape: RoomFestival, name: (T) => T.passport.roomFestival || 'Festival stage' },
]

// `badge` — the caller (passportKit.DrawSection) renders the lit room's
// BandPill + MethodLabel and passes them in as a node. RoomGrammar stays a
// standalone presentational component with no import back onto passportKit
// (that module already imports RoomGrammar — a same-direction sibling import
// would be circular), so it never re-derives or reshapes the band/method
// fact itself; it only places the caller's own accessible markup on/under
// the light (rule 2 — "the light carries the truth").
export function RoomGrammar({ band, contextLine, badge, T }) {
  const { BANDS } = useLang()
  const idx = BANDS.capacity.indexOf(band)
  if (idx < 0) return null // honesty on fallback — never a guessed nearest room

  return (
    <article className="rounded-[18px] border border-line bg-surface p-5 shadow-card">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ROOMS.map((room, i) => {
          const lit = i === idx
          return (
            <div key={room.key} className="flex flex-col items-center gap-2" aria-hidden={lit ? undefined : 'true'}>
              <div
                className={`relative flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border ${
                  lit ? 'border-accent/50 bg-bg2' : 'border-line2'
                }`}
              >
                {lit && (
                  <svg className="absolute inset-0 h-full w-full text-accent" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="room-grammar-light" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polygon points="50,0 14,100 86,100" fill="url(#room-grammar-light)" />
                  </svg>
                )}
                <room.Shape className={`relative h-14 w-14 ${lit ? 'text-accent' : 'text-line2'}`} />
              </div>
              <span className={`font-mono text-[9.5px] uppercase tracking-[0.1em] ${lit ? 'text-ink' : 'text-faint'}`}>
                {room.name(T)}
              </span>
              {lit && badge && (
                <div className="flex flex-col items-center gap-1.5">
                  {badge}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {contextLine && (
        <p className="mt-4 border-t border-line pt-3 font-display text-[17px] font-bold leading-snug text-ink">
          {contextLine}
        </p>
      )}
    </article>
  )
}

// ── Room silhouettes — simple, elegant line-art, equal stroke weight/
// complexity, currentColor only (no fills except the light-cone gradient
// above, no external assets). Distinct ROOM shapes, never a size ladder. ────
function RoomLounge({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 72 Q22 56 36 56 L64 56 Q78 56 78 72 L78 84 L22 84 Z" />
      <circle cx="50" cy="30" r="9" />
      <path d="M50 39 L50 56" />
    </svg>
  )
}

function RoomClub({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="28" y="52" width="44" height="22" rx="3" />
      <circle cx="36" cy="63" r="9" />
      <circle cx="64" cy="63" r="9" />
      <path d="M22 84 L78 84" />
    </svg>
  )
}

function RoomHall({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M24 86 V46 Q24 18 50 18 Q76 18 76 46 V86" />
      <path d="M24 86 L76 86" />
      <path d="M36 86 V58 M50 86 V58 M64 86 V58" />
    </svg>
  )
}

function RoomFestival({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 86 L14 54 L50 22 L86 54 L86 86" />
      <path d="M14 86 L86 86" />
      <path d="M50 22 L50 86" />
    </svg>
  )
}
