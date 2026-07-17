# LOCK — ASSET REGISTRY (the ONE reliable source for every visual asset)

_Owner directive 17 Jul: "a reliable source for logo / icons / platform logos / artist universe." Rule: a component NEVER inlines a new asset — it imports from the sources below. New asset = new row here FIRST. States: `canon` · `interim (Codex OWED)` · `demo-only`._

| Asset class | The ONE source | State | Notes |
|---|---|---|---|
| **LOCK logo / wordmark (app)** | `src/components/ui.jsx` → `Wordmark` component (line ~372) | interim (Codex OWED, M-7) | Text-based wordmark today; when Codex delivers the SVG it replaces the INTERNALS of `Wordmark` only — call-sites never change |
| **LOCK logo (site)** | `website-next/components/nav.tsx` logo block | interim (Codex OWED, M-7) | Same replacement rule |
| **Platform logos** (Instagram, Spotify, SoundCloud, Eventer, Tickchak, Go-Out…) | `src/components/PlatformLogo.jsx` (+ `detectPlatform()` — the ONLY url→platform mapper) | canon | 26 inline SVG elements; adding a platform = ONE edit here, everywhere updates |
| **Universe / Radar icons** (planets, states, node marks) | `src/components/ui.jsx` → `GpIcon` sprite + `src/lib/radarUniverse.js` → `PLANETS` (ids, angles) + `public/assets/gigproof-icons.svg` | canon | Icon ids are frozen identifiers (§0.2 rule 5) |
| **State/status visual vocabulary** | `src/tokens.ts` → `status` map (✦ Found · ✓ Confirmed · ◌ Developing · + Needs-you · ○ N/A) | canon | ONE color + ONE icon + ONE verb per state — everywhere |
| **PWA / favicons** | `public/` (favicon-32, icon-192, icon-512, apple-touch, maskable) | canon | Site copies live in `website-next/public/` — regenerate BOTH when the logo lands |
| **Demo persona photos** | `public/assets/` (maya-vale-profile-v2.png, demo-artist-techno.jpg, persona webps) | demo-only | Never referenced from real user flows; embed build copies to the site origin |
| **Site marketing photography** | `website-next/public/` per-page | canon (approved-site set) | New imagery ships only via rule-12 taste trains |
| **Venue-logo set** | — DOES NOT EXIST — | Codex OWED (M-7) | When delivered: lives in `public/assets/venues/` + a `VenueLogo.jsx` mapper, same pattern as PlatformLogo |

**The hermetic law:** an asset that isn't in this table doesn't get committed. The DS-drift inspector (T-46) adds a check: any `<img src>` / inline `<svg>` in a component that bypasses these sources = build failure.
