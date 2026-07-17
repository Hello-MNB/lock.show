# Design System v1.2.0 — digest + app-alignment plan

Source of truth: `docs/design-system/DESIGN-SYSTEM-v1.2.0.html` (byte-identical to the Drive
`BRANDING AND DESIGN SYSTEM/00_CURRENT/GIGPROOF_Design_System_v1.2.0.html`). This digest also folds in
the Drive **Smart Onboarding UX/UI Spec v1.0**, the **Visual Audit (2026-07-04)**, and the **3-Artifact
Audit (2026-07-03)** so the build has one grounded reference. Read this before any design-alignment work.

> **Headline:** the DS we already own is professional and comprehensive. It is a **LIGHT paper-grounded
> system that explicitly sanctions dark "media/editorial" surfaces** — so the cinematic Radar/Passport look
> is *inside* the system, on media surfaces, not a separate direction. The real work is (1) elevate the DS
> (LOCK rebrand + a Hebrew type layer + close the a11y/RTL/motion gates it flags on itself), and (2) make
> the **app conform** — today the app is dark-grounded and off-token.

## A. The tokens (exact, with the DS's own contrast ratios)
| Token | Hex | Role | Contrast note |
|---|---|---|---|
| `--paper` | `#f3f5ef` | page canvas / reading ground (DEFAULT app context) | — |
| `--ink` | `#0a0d0b` | primary text | Paper-on-Ink 17.78:1 AAA |
| `--forest` | `#18221a` | panels & navigation | Paper-on-Forest 14.91:1 AAA |
| `--lime` | `#C8F04D` | the single primary action | Ink-on-Lime 14.90:1 AAA |
| `--slate/--muted` | `#687269` / `#6c776e` | secondary copy only | 4.55:1 AA |
| amber | `#d3912f` | attention (never for copy on it) | white-on-amber FAILS |
| risk red | `#c84e45` | destructive | white-on-red 4.53 AA |
| hairlines | `#d4dbd2` (light) / `#344037` (dark) | dividers | — |

**Four button/surface contexts (this is the light↔dark contract):** **Paper canvas** `#f3f5ef` (default) ·
**White card** `#fff` · **Forest panel** `#18221a` ("lime is the single dominant action; no dark primary on
dark") · **Media overlay** (image + `#07100b` gradient, "≥70% ink protection beneath labels"). Rule:
*"Large dark editorial regions may alternate with paper workspaces; paper dominates long-form tasks."*

**Type:** Display/headings **Georgia serif** (clamp 44–78px, tight tracking) · Body/UI **Manrope** ·
Labels/meta/dates **DM Mono** (8–9px, 700, uppercase). Body **never below 16px**; metadata never carries
meaning alone. **Radius:** controls 9–10px · cards 12–18px · hero 20px · mobile sheets 22px top.
**Spacing:** 4px base. **Grid:** 12-col/1440 desktop · 4-col + bottom-nav mobile. **Icons:** 1.8px stroke,
currentColor, 16 dense/20 standard/24 feature/32 empty; critical actions carry a text label. **34 component
state rows** across buttons/fields/chips/cards (selection ≠ confirmation).

## B. Smart Onboarding spec — the "super-smart widget" north star
**Object model (Product Law):** Person → Workspace → Role. Subscriptions attach to the **workspace**, not
the person. Radar = private developmental intelligence; Passport = controlled professional communication.
**Value-before-effort:** *"the user sees value grow after every useful contribution."*

**8-step spine:** 1 Account → 2 First Job (four **result** cards: build my artist world / manage artists /
evaluate artists / continue from an invite) → 3 Workspace Resolution (create/claim/join/invite) → 4 Role
setup → 5 Connect (sources, each states what it improves; consent per-connection) → 6 **First Value**
(emerging Passport with **3 interpretation tabs: My Growth / Manager / Producer View**) → 7 Confirm
(Confirm / Partly correct / Not mine / N-A) → 8 Ready (role-specific home).

**The landing = a growth widget, never an empty dashboard.** *"No data yet → show the emerging result and
one valuable input."* Growth-loop patterns to build into every entity home:
- **Input → benefit** ("Add a live clip to make your show tangible to producers")
- **Discovery → confirmation** ("We found this Instagram. Is it yours?")
- **Gap → opportunity** (a missing item framed as opportunity, not failure)
- **Private → protected** (WhatsApp community → an audience *signal*, members never exposed)

**Per-entity homes:** Artist → **Growth Home** · Manager/Agency → **Roster Home** (one priority per artist,
no scores) · Producer → **Evaluation Workspace** (shortlist/compare/request-proof; private numbers become
approved ranges). *"Never send all personas to one generic dashboard."*

## C. Open release gates the audits flag (apply to app too)
- **Accessibility WCAG 2.2 AA — P0** (not yet run) · **RTL/Localization — P0** (stress-suite exists, live test pending)
- Motion tokens + reduced-motion equivalents · tokens-to-code parity ("flag drift") · change governance
- **Replace externally-hosted public-figure portraits before release**; formalize distinct entity states
  (artist/project/alias/manager-org/producer must not share one fallback)

## D. App-alignment gaps (ranked by impact)
1. **Theme inversion — biggest.** App is dark-ground (`bg #0B0C0B`, `ink #F3F0E8`) and *remaps DS light
   names onto dark* (`paper→#0B0C0B`). DS is paper-ground; dark is only for media/editorial/nav. Only lime
   matches. → Re-ground everyday UI to paper; keep dark for Passport/Radar/media surfaces (DS-sanctioned).
2. **Fonts diverge — needs a decision.** App = Frank Ruhl Libre + Heebo + IBM Plex (Hebrew-first, for the
   Israeli אמרגנים). DS = Georgia + Manrope + DM Mono (English; the DS is **silent on Hebrew**). → Keep a
   Hebrew-capable stack and **extend the DS with an official Hebrew type layer** rather than forcing
   Georgia/Manrope onto Hebrew users. This is the DS's one genuine weakness, not the app's mistake.
3. **Onboarding reduced** (2 steps vs the 8-step spine) — a deliberate owner call ("that's what the Radar is
   for"); the spec's First-Value "emerging Passport" moment is deferred to the Radar.
4. **Smart-widget loop only partial** — adopt the Input→benefit / Discovery→confirmation / Gap→opportunity
   patterns on each entity home.
5. Control radius 12px vs DS 9–10px (minor) · open a11y/RTL/motion gates.

## Recommended direction (reconcile — it's what the DS already says)
**One system:** paper-ground everyday UI + dark for the proof/media surfaces (Passport, Radar). Adopt DS
tokens, spacing, radius, and the 34-state component contract. **Extend** the DS with a LOCK rebrand and an
official Hebrew type layer (keep Heebo/Frank-Ruhl-class faces). Then re-ground the app screen-by-screen.
Close the P0 gates (WCAG, RTL) as part of it. This keeps the cinematic moments you liked, matches the site,
and finally makes app + site one product.
