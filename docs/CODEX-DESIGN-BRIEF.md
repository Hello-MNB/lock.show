# LOCK — Design Brief for Codex · upgrade the Site + Design System

_Give this to Codex verbatim. It is self-contained. Attach the assets listed in §8._

## 1. What LOCK is
A **pre-booking proof / risk-reduction tool** (formerly GIGPROOF, now LOCK — domains **lock.show** site,
**app.lock.show** app). Artists build a provable professional identity; **Israeli booking managers
(אמרגנים)** evaluate an unfamiliar artist through standardized, **method-labeled evidence** before they
risk their name. It is **NOT an EPK, NOT a booking CRM, NOT a guarantee.** The feeling: calm, editorial,
evidence-first, show-business credibility without hype.

## 2. THE ABSOLUTE FIREWALL — the design must obey this (non-negotiable)
- **NO score, percentile, rank, "bookability %", prediction, gauge, or star-rating anywhere.** Ever.
- Audience/draw is shown **only as bands + yes/no binaries, each with a method label** (Producer-confirmed
  / Source-linked / Evidence-supported / Self-declared) — **never a raw follower count or exact headcount.**
- **One Passport, two views:** Artist view (private) shows gaps; Buyer view (public) shows verified
  strengths only. No silent movement from private data to public communication.
- Streaming/social = **secondary context**, visually demoted, never the evidence.
This constraint IS the visual language: we sell **evidence, not metrics**. Any component that implies a
grade or ranking is wrong by definition.

## 3. Audience & language
- Primary users: **Israeli booking managers (אמרגנים) + artists** → **Hebrew-first, RTL**, plus English
  (and later RU/DE). Design and type must be **first-class in Hebrew RTL**, not an afterthought.

## 4. Entity / product model (drives the layouts)
**Person → Workspace → Role.** One person, several workspaces, different roles; **subscriptions attach to
the workspace, not the person.** Roles: **Artist** (builds proof) · **Agency/Representative** (אמרגן — the
payer, manages a roster) · **Booker** (event/venue, receives proof) · **Producer** (confirms one claim via
magic link) · **Operator** (admin). Two products inside: **Radar** (private developmental intelligence) and
**Passport** (controlled, recipient-safe professional communication).

## 5. Where we are today (starting point — the problem to fix)
- **Design System v1.2.0** (you built it) is strong: a **light "paper" system** (`#f3f5ef` canvas,
  `#0a0d0b` ink, `#18221a` forest panels, **`#C8F04D` lime** as the single action) that **explicitly allows
  dark "media/editorial/overlay" surfaces**; Georgia (display) + Manrope (body) + DM Mono (labels); tokens
  with WCAG ratios; a 34-row component-state contract; Radar/Passport specs.
- **The marketing site (lock.show) follows the DS** (light paper). Good.
- **The app (app.lock.show) does NOT.** It ships a **dark** theme, remaps the DS light token names onto dark
  values, uses **different fonts** (Frank Ruhl Libre / Heebo / IBM Plex — Hebrew-first) and **invented
  accents** (gold, teal, amber), with ~350 hardcoded colors. **App and site look like two different
  products.** Only the lime hue is shared.

## 6. What we want you to upgrade
### A) Elevate the Design System → **LOCK v1.3**
1. **Rebrand GIGPROOF → LOCK** throughout (name, marks, file names, examples).
2. **Add an official Hebrew / RTL type layer.** The DS is currently English-only (Georgia/Manrope). Specify
   Hebrew-first faces that pair with the system (the app already uses Heebo + Frank Ruhl Libre for Hebrew
   coverage — either bless these or propose better bilingual pairings). Define the EN and HE stacks, RTL
   mirroring, punctuation, and 30% text-expansion tolerance.
3. **Make the light-ground / dark-media contract explicit and per-surface**, so an engineer can re-ground
   the app to **paper for everyday UI** while keeping **dark for the proof/media surfaces (Passport, Radar,
   hero/media)**. Name each surface context and its allowed contrast pairs.
4. **Close the P0/P1 gates your own audits flagged:** full **WCAG 2.2 AA** contrast proof for every pair;
   complete **RTL/localization spec**; **motion tokens + reduced-motion** equivalents; **change governance**.
5. **Ship a tokens-to-code map** — named token → CSS variable / Tailwind key, 1:1 — so the app can implement
   the DS exactly and we can kill the ~350 hardcoded colors. This is the single most useful artifact for us.
6. **Define the "smart landing widget" per entity** (from the Smart Onboarding spec): **Artist → Growth
   Home, Agency → Roster Home, Producer → Evaluation Workspace**, each built on **value-before-effort**
   ("never an empty dashboard — show the emerging result + one suggested input") and the growth-loop
   patterns: **Input→benefit · Discovery→confirmation · Gap→opportunity · Private→protected.** No scores.
7. **Formalize distinct entity states** (artist / project / alias / manager-org / producer must not share one
   fallback) and **replace any externally-hosted public-figure portraits** with licensed or neutral media.

### B) Upgrade the Site (lock.show)
- Apply the LOCK rebrand + Hebrew/RTL; keep it aligned to the upgraded DS; close the site audit items
  (SEO/GEO/AEO metadata + schema, legal/consent surfaces, WCAG audit, native Hebrew localization).

## 7. Deliverables + acceptance criteria
1. **LOCK Design System v1.3** (single HTML artifact, same governed structure as v1.2.0) containing: token
   table (named token · hex · CSS var · WCAG ratio), **EN + HE type layers**, the 34-state component
   contract, responsive desktop/mobile/RTL contract, **motion tokens**, and the **per-entity smart-home
   patterns**.
2. A **tokens-to-code map** (named token → CSS var / Tailwind) — implementation-ready.
3. **Accessibility (WCAG 2.2 AA) + RTL** specs completed.
4. Updated **site** reflecting all of the above.
- Acceptance: every screen/component names its **entity, image role, icon semantics, primary action, and
  privacy state**; no component implies a score/rank; Hebrew RTL is first-class; contrast pairs all pass AA.

## 8. What to hand Codex (attach these)
- The Drive folder **`BRANDING AND DESIGN SYSTEM`** (00_CURRENT DS v1.2.0, the **Smart Onboarding UX/UI
  Spec v1.0**, the Visual Audit 2026-07-04, the 3-Artifact Audit, and 02_ASSETS brand/media).
- Live references: **lock.show** (on-DS) and **app.lock.show** (off-DS — the thing to reconcile toward).
- This brief (§1–§7) — especially **§2 the firewall** and **§3 Hebrew-first**.
- Our engineering audits (optional, for grounding): `docs/UX-JOURNEY-AUDIT-2026-07-10.md` and
  `docs/design-system/DS-v1.2.0-DIGEST-AND-ALIGNMENT.md`.

> One line to lead with: _"Elevate our existing GIGPROOF Design System v1.2.0 into **LOCK v1.3** — same
> quality bar, now rebranded, Hebrew-RTL first-class, WCAG-AA proven, with a tokens-to-code map — and bring
> the site with it. Obey the firewall: no scores, ranks, or raw counts, ever."_
