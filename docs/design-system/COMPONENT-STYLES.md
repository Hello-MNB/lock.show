# COMPONENT-STYLES — generated registry (T-47 / W4-3, spec §5.8)

> **GENERATED FILE — DO NOT EDIT BY HAND.** Regenerate: `node scripts/generate-component-styles.mjs`
> Drift check (verify hook): `node scripts/generate-component-styles.mjs --check`
> Sources of truth: `src/index.css` (@layer components) · `src/components/ui.jsx` (exports) · `tailwind.config.js` (token names).

States covered = interaction states found in the source (`hover / focus / active / disabled / placeholder / motion`).
Token dependencies = tailwind tokens referenced (`color.* / shadow.* / font.*`); `hex #…` flags a hardcoded value for audit.

## 1. CSS primitives (`src/index.css` → `@layer components`)

| Primitive | Recipe (@apply) | Raw props | Token dependencies | States covered | Usage law |
|---|---|---|---|---|---|
| `.btn` | inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 font-bold text-sm transition active:scale-[0.99] active:translate-y-px disabled:opacity-50 disabled:pointer-events-none | min-height: 44px | — | active · disabled | §5.7 mobile tap target — survives px/py/text-size overrides |
| `.btn-ghost` | btn bg-surface2 text-ink border border-line2 hover:bg-raise | — | color.ink · color.line2 · color.raise · color.surface2 | hover | — |
| `.btn-primary` | btn font-extrabold shadow-glow | color: #12160A; background: linear-gradient(180deg, theme('colors.accent'), theme('colors.accent-deep')); :hover { filter: brightness(1.06) }; :hover { transform: translateY(-1px) } | color.accent · color.accent-deep · hex #12160A · shadow.glow | hover | lime gradient with DARK text — never light text on lime (contrast) |
| `.card` | rounded-xl2 bg-surface border border-line p-5 shadow-card | — | color.line · color.surface · shadow.card | — | — |
| `.chip` | inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-4 | position: relative; ::before { content: '' }; ::before { position: absolute }; ::before { left: 50% }; ::before { top: 50% }; ::before { width: max(100%, 44px) }; ::before { height: max(100%, 44px) }; ::before { transform: translate(-50%, -50%) } | — | — | status pills: small (≤24px tall), quiet tints (≤10% alpha), text does the work — color is punctuation, never a gauge, never a big fill |
| `.field` | w-full bg-surface2 border border-line2 text-ink placeholder:text-faint outline-none transition | border-radius: 11px; padding: 12px 14px; min-height: 44px; :focus { border-color: theme('colors.accent') }; :focus { box-shadow: 0 0 0 3px rgba(190, 226, 78, 0.15) } | color.accent · color.faint · color.ink · color.line2 · color.surface2 | focus · placeholder | input: surface2 bg, line2 border, 11px radius, 12/14 padding |
| `.label` | block font-bold text-muted mb-1.5 | font-size: 12.5px | color.muted | — | block label above the input — 12.5px, bold, muted |
| `.skeleton` | rounded-md | background: linear-gradient( 90deg, theme('colors.surface2') 25%, theme('colors.raise') 50%, theme('colors.surface2') 75% ); background-size: 200% 100%; animation: shimmer 1.6s linear infinite | color.raise · color.surface2 | motion | skeleton loading shimmer (prefer over spinners) |
| `.tap-target` | — | position: relative; ::before { content: '' }; ::before { position: absolute }; ::before { left: 50% }; ::before { top: 50% }; ::before { width: max(100%, 44px) }; ::before { height: max(100%, 44px) }; ::before { transform: translate(-50%, -50%) } | — | — | §5.7 mobile tap targets — the LOOK of small pills/links stays compact, but the invisible HIT AREA is raised to ≥44×44 via a centered ::before overlay. Applied automatically to any chip rendered as a button/link, and opt-in via .tap-target for other visually-small controls. |

## 2. UI components (`src/components/ui.jsx` exports)

| Component | Primitive/utility classes rendered | Token dependencies | States covered | Usage law (source comment) |
|---|---|---|---|---|
| `BandPill` | — | color.ink · color.line2 · color.muted · color.surface2 · font.mono | — | ── BandPill — a bounded range that reads human: numbers only WITH context words, e.g. <BandPill context="paid heads">180–300</BandPill> → "180–300 paid heads". Bordered mono capsule — NEVER a progress bar/gauge. |
| `BottomSheet` | .tap-target | color.bg · color.ink · color.line2 · color.muted · color.surface · shadow.card | hover | ── BottomSheet — mobile-first sheet (slides from the bottom in the thumb zone; centered card on desktop). Controlled: <BottomSheet open onClose title>…</BottomSheet>. PORTALED to <body>: an ancestor with backdrop-filter/transform (e.g. the shell header's backdrop-blur) creates a containing block that clamps fixed children — audit E4 found the workspace sheet trapped inside the 56px header, making switching impossible on mobile. The portal makes `fixed inset-0` mean the real viewport regardless of where the sheet is mounted. |
| `EmptyState` | .card | color.ink · color.line · color.muted · color.surface · font.display · shadow.card | — | ── EmptyState — never a grey box (mandate §2). With `image` it sells the dream: photo + display headline ("Your proof starts here") + next action. Back-compat: <EmptyState title action /> still renders the plain dark card. |
| `ErrorNote` | — | color.need · color.need-bg | — | — |
| `ErrorState` | .btn-ghost · .card | color.ink | hover | Load-failure state with an optional retry. Use in place of a silent empty list. |
| `Field` | .label | color.muted · color.need | — | — |
| `GpIcon` | — | — | — | ── CODEX icon sprite (public/assets/gigproof-icons.svg, 18 symbols) ───────── |
| `HeroImage` | .aura-gold · .veil-photo | color.surface | — | ── HeroImage / PhotoCard — photography is structural (mandate §2). Image + gradient veil + optional warm gold radial aura behind it; children overlay the veil at the bottom (text always readable). Gold = atmosphere, lime = action. <HeroImage src={photo} alt="…" className="h-56"><h2>…</h2></HeroImage> |
| `LanguageToggle` | .tap-target | color.ink · color.line · color.line2 · color.muted · font.mono | hover | Language toggle pill — place in any header. |
| `Loading` | .skeleton | — | motion | — |
| `MethodLabel` | — | color.accent · color.gold · font.mono | — | ── MethodLabel — trust jewelry, not debug metadata (mandate §3). Mono, uppercase, small and precise; gold border/text on transparent; producer-confirmed (strongest) in lime. <MethodLabel variant="lime">PRODUCER-CONFIRMED</MethodLabel> |
| `NextMove` | .btn-primary · .card | color.ink · color.muted · font.display · font.mono | hover | ── NextMove — the artist's ONE next move (mandate §3): what → why it matters → one action. Neutral surface (restraint: no tinted card, no aura) — the lime primary button IS the view's single accent moment. Renders `action` (any node) if given, else a primary button from cta/onAction. Use at most one per view. |
| `OrDivider` | — | color.line · color.muted | — | — |
| `PageShell` | .animate-fade-in | — | motion | — |
| `PhotoCard` | — | — | — | — |
| `PlatformMark` | — | color.muted · color.surface | — | — |
| `platformOf` | — | — | — | — |
| `reviewedDate` | — | — | — | ── reviewedDate — dates as humans say them: "Reviewed June 2026" (mandate §3). Returns '' for missing/invalid input so callers can render-or-skip. |
| `SocialAuthButtons` | — | color.ink · color.line2 · color.muted · color.raise · color.surface2 | disabled · hover | `demo` (DEMO build persona-picker mode, no real Supabase client): the buttons stay tappable — never inert — but explain via toast instead of attempting a real OAuth call (there is no supabase client to call in DEMO). This wins over `disabled` (the OAUTH_ENABLED-off "coming soon" state) so a demo build never silently no-ops a tap. |
| `SourceLabel` | — | — | — | Method label for a fact (the 6-label SSOT). Pass a claim's verification_status as `status` and (optionally) its `methodLabel` override (e.g. producer-confirmed). |
| `Spinner` | — | — | motion | — |
| `StateBadge` | .chip | — | — | Canonical state badge. <StateBadge state="found" /> — or pass children to override the verb ("6 gigs found"). Accepts canonical states AND legacy STATUS.* values, so existing call sites can migrate gradually. |
| `StatusChip` | — | — | — | Bounded status pill — the ONLY status vocabulary the firewall permits. Back-compat wrapper: keeps accepting the STATUS.* prop values used across the app, now rendered through the canonical 5-state vocabulary above. |
| `ToastProvider` | .animate-fade-in | color.accent · color.amber · color.ink · color.line2 · color.surface · shadow.card | motion | — |
| `useToast` | — | — | — | — |
| `Wordmark` | — | color.accent · color.bg · color.ink · font.display | — | — |

**Registry count:** 9 CSS primitives · 26 exported components — 35 rows total.
