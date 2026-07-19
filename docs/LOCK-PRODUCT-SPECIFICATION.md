# LOCK — PRODUCT SPECIFICATION

**The single source of truth for building the LOCK product.**
_Status: consolidated master spec (complete) · Written 15 Jul 2026, scaling-review pass 16 Jul, **Radar-universe / taxonomy pass 17 Jul** (owner R00 order: §8.2 two-jobs + 8-family emphasis · §8.3 coaching lines · §16.A Registry B + WhatsApp-group source + migration structure · §18 OWED/OPEN incl. R-10), **universe-coverage pass 18 Jul (T-54, from `docs/UNIVERSE-GAP-REPORT.md`: §8.2 registry-driven nodes target · §5.10 count-based progress vocabulary · §8.7 Proof-Unit/proof-story/content-classes target · §16.A.5b Registry-B reality [F1.csv] · §18.2 R-11 + M-17)**, **measurement audit 18 Jul (T-55: §21.1 per-family status · §14.1.5 what-fires · §14.1.4 GA4 evidence-surface scope-out · §8.12 built-vs-pending tiles)** · Firewall-safe · Repo doc (shareable — contains no credentials or secrets) · §§1–11 = product/design law · §§13–17 = deep build spec (engineering · measurement · legal/localization · taxonomy/business · interactivity/utility-screens) · §16.B.11–16 = strategy (GTM · monetization · growth · risk · trust&safety) · §18 = open rulings (priority-tiered) · §19 = scaling & future-readiness (reserved, post-Gate)._

> This document is written so that a developer or a fresh AI session could build the entire LOCK product from it alone, with no other context. It synthesizes and reconciles the full canon doc set (see §0.3 Sources). Where the interactive prototype and the newest design law differ from an older doc, **the prototype + the newest doc win** and the reconciliation is noted inline.
>
> **The behavioral ground-truth is the interactive prototype** (`scratchpad/lock-full-prototype.html`, published as artifact `1c9b0030`). The prototype *shows* how every screen behaves; **this document is the written law**. When in doubt about an interaction nuance, open the prototype; when in doubt about a rule, obey this document.

---

## 0. Table of Contents

- **0. Front matter** — 0.1 How to read · 0.2 Reconciliation rules · 0.3 Sources
- **1. Overview & Product Definition** — what LOCK is / is NOT; the pre-booking-proof thesis; the guiding sentence
- **2. The Firewall (absolute rules)**
- **3. Entity Model** — Person→Membership→Role→Workspace; Acts; ArtistAccess; the 6 actor families; demand-side segmentation; entity universe map; what is instantiated today
- **4. Canon Glossary** — every term, EN + HE
- **5. Design System** — palette/tokens; 3-tier token control layer; "dark is atmosphere not camouflage"; type/spacing/radius; CTA hierarchy; 44px; motion; the widget kit + full state sets; **§5.10 humanized rendering (warmth over the firewall); §5.11 self-contained DS defaults (no Codex dependency — type scale, radius, CTA paddings all DEFINED)**
- **6. Global UX Laws**
- **7. Navigation & Shell** — identity hub; per-entity nav; real-app rule; mobile bottom-nav
- **8. Per-Screen Specification** — THE CORE (Onboarding · Artist Radar + full Inspector · Passport · Requests · Access · Buyer/Public Passport · Source-Confirmer · Representation · Production · Admin · shared screens)
- **9. AI / Scan Intelligence** — built vs target; discovery step; locale-awareness; provider fallback
- **10. QA / Acceptance** — mobile-first, desktop, per-field DoD, contrast, firewall scan
- **11. Current State & Living References**
- **13. Engineering & Architecture** — system surfaces & trust boundaries; the real DB schema (migrations 001–037); API/RPC contracts; the `buildSafePayload` claim-safe contract; auth/sessions; RLS + server-enforced firewall; DB ops / deploy / rollback; Q8 production-readiness gate
- **14. Measurement, Payments & Notifications** — the 29-event analytics canon; measurement architecture; demo/test exclusion; the Gate measurement; free-pilot payments; transactional-email catalog
- **15. Legal, Consent & Localization** — legal docs & status; Amendment-13/GDPR consent framework; Consent Mode v2; `consent_records`; localization architecture + RTL rules; the delivered Hebrew string set; legal placeholders (L-1…L-9) + HE ratification list (H-1…H-7)
- **16. Taxonomy & Business** — taxonomies (EN·HE); goals; the Gate; business model; business case; unit economics; **GTM approach; monetization roadmap (plans-by-customer · monthly/annual-discounted billing · smart-upsell architecture); growth loops; risk register; trust & safety / IP; post-Gate roadmap**; owner-decision list
- **17. Interactivity, Motion Depth & Utility Screens** — the motion system (easing tokens + duration ladder + reduced-motion contract); per-screen interactivity depth (Radar + Inspector deepest); the inline-edit widget; the 11 missing utility screens (signup/login/reset/invite/settings/org/billing/consent/notifications/404/skeleton)
- **18. Open Decisions** — owner rulings still pending (priority-tiered: pre-Gate / post-Gate / reserved)
- **19. Scaling & Future-Readiness (RESERVED)** — international expansion · data/ops at scale · billing/finance · high-volume surfaces · ecosystem/moat · canon-change & release process · SEO/AEO/GEO · platformization/domain-template engine (all post-Gate; named, not gold-plated)
- **20. Implementation notes for AI / code agents** — the executable negative-constraint guardrails (firewall · DB/migrations · state · localization · atomic spec slices) so Claude Code / Cursor build without drift
- **21. The Signal Engine** — pre-booking intelligence layer: signal taxonomy (8 families) · signal→action decision system · next-best-action engine · per-persona signal journeys · the AI intelligence layer (firewall-bound) · data-quality/provenance policy · launch- & scale-readiness matrix

### 0.1 How to read
Sections 1–7 are the laws every screen inherits. Section 8 is the buildable **screen** core: each screen carries PURPOSE · DESKTOP layout · MOBILE layout · COMPONENTS · STATES · INTERACTIONS · EXACT MICROCOPY · FIREWALL notes · DEFINITION OF DONE, and is buildable from its sub-spec alone. Sections 9–11 are the intelligence layer, acceptance, and current state. **Sections 13–17 are the deep build spec** — §13 Engineering & Architecture (the real DB schema, API/RPC contracts, auth, RLS, deploy/rollback, Q8), §14 Measurement/Payments/Notifications, §15 Legal/Consent/Localization (incl. the delivered Hebrew string set), §16 Taxonomy & Business, and §17 Interactivity/Motion depth + the 11 utility screens that §8 did not cover. Section 18 is the unresolved owner rulings. A developer can build the product from §§1–17; §18 lists what still needs an owner decision.

### 0.2 Reconciliation rules (applied throughout)
1. **Prototype + newest doc win** over older docs on any conflict.
2. **The firewall (CLAUDE.md) is absolute** and overrides everything, including design convenience.
3. **The glossary is binding**; any term not in §4 is a blocked review.
4. **Honesty firewall:** never present TARGET architecture as BUILT. Per-evidence AI claim extraction is BUILT; multi-source deep scan + locale-aware auto-discovery is TARGET.
5. **Code identifiers are frozen** — DB enum values (`workspace_type='producer'`, roles `booker`/`agency`/`producer`) keep legacy names; renaming them is a governed migration, never a casual edit. UI copy uses the canon terms regardless of the frozen identifier beneath.
6. Items that are unresolved are marked **OWED** (a deliverable another party must supply) or **OPEN** (an owner ruling) so they are never mistaken for settled.

### 0.3 Sources consolidated
CLAUDE.md (product definition + firewall) · `docs/architecture/ENTITY-STRUCTURE-AND-SMART-SCREENS-AUDIT.md` PARTS 1–10 (richest source) · `docs/SESSION-MEMORY.md` (entity model, standing rules, U1–U34 register, test-logins pointer) · `docs/ENTITY-GLOSSARY.md` + `docs/GLOSSARY.md` (canon terms) · `docs/design-system/A13-TOKEN-VALUES.md` + `COMPONENT-STATE-TOKENS.md` + `DS-v1.2.0-DIGEST-AND-ALIGNMENT.md` · `docs/VERSIONS.md` · `docs/team/TEST-LOGINS.md` (pointer only) · the living prototype `scratchpad/lock-full-prototype.html` (artifact `1c9b0030`).

### 0.4 Status legend (read this before treating any item as final)
Every claim in this spec carries one of these states — **never mistake a provisional item for a shipped requirement**:
| Tag | Means | How to treat it |
|---|---|---|
| **BUILT** / ✅ | verified in code today | safe to rely on; cite the file |
| **TARGET** | designed, **not built** (honesty firewall §2.8) | build to it; never present as live to a user |
| **OWED** | a deliverable another party must supply (Codex asset, counsel copy) — but scale values now have interim defaults (§5.11) | unblocked where a default exists; else waits |
| **OPEN** | an owner ruling (price, ICP, gold/amber, tagline) | do not invent; surface to owner |
| **PROPOSED** | reconstructed/suggested, awaiting owner ratification (e.g. the Q8 walk) | not binding until ratified |
| **REJECTED** | a firewall-blocked idea logged so it can't return (§2.9) | never implement |
The consolidated live register of what's BUILT vs OPEN/OWED is `docs/releases/DEPLOY-GAPS.md`; §18 is the owner-ruling list (priority-tiered, §18.0).

---

## 1. Overview & Product Definition

### 1.1 What LOCK is
LOCK is a **pre-booking proof / risk-reduction tool**. It does two jobs for two sides of the same market:

- **For artists (supply side):** it helps an artist build a **provable professional identity** — standardized, method-labeled evidence of who they are and what they can do — assembled largely from what already exists publicly, and confirmed by the artist one tap at a time.
- **For Israeli demand-side buyers:** it lets **booking managers, promoters, event producers, planners, and private/corporate clients** (מזמיני הופעות) evaluate an **unfamiliar** artist through standardized, method-labeled evidence **before they risk their own name** on the booking.

The core insight: **talent ≠ bookability.** A buyer's real question is not "is this artist good?" but "can I put my name on this night without a nasty surprise?" LOCK answers that with checkable evidence, not with hype and not with a score.

### 1.2 What LOCK is NOT
- **NOT an EPK** (electronic press kit / promo reel). LOCK shows verifiable proof, not marketing assets.
- **NOT a booking CRM.** It does not manage deals, contracts, calendars, or pipelines.
- **NOT a guarantee.** It reduces risk by making trust *inspectable*; it never promises an outcome.
- **NOT a scoring/ranking engine.** See §2, the Firewall — this is the product's defining constraint.
- **NOT a cold directory / talent marketplace.** No cold discovery of artists who never opted in; evidence surfaces only for artists who confirm it.

### 1.3 The pre-booking-proof thesis
A booking manager risks their reputation every time they book an unfamiliar act. LOCK converts an artist's scattered public footprint (lineup listings, streaming catalogue, RA bookings, ticketed nights, press, producer word-of-mouth) into a **single Passport of method-labeled strengths** the buyer can check in under a minute — draw shown as **bands**, readiness as **binaries**, each carrying **how we know it**. The artist controls exactly what is public. The buyer never sees a number they must trust blindly; they see evidence they can open and verify.

**Post-Gate international readiness (thesis, not a build):** Israel is the deliberate **beachhead**, not the ceiling. The architecture is kept locale-aware by design (discovery in the market's own languages §9.2, per-market taxonomies §16.A, surface-aware links §13.4) so that expansion — next language, local sources, currency/tax, per-jurisdiction privacy — is a *configuration and content* effort, not a re-architecture. The full framework is reserved in **§19.1**; it is named here so the beachhead is never mistaken for the boundary.

### 1.4 The guiding sentence (the north star for EVERY screen)
> **"LOCK found something real. Here's what it means. Here's the one thing to do next."**

Never "here are many panels of evidence and internal states." Every screen leads with what the system already found or can do, explains why it matters in human language, and offers **one** clear next action. This sentence is the acceptance test for any screen's information architecture.

### 1.5 One Passport, shown in views
There is exactly **one** Passport per Act. It is shown in **views**, never duplicated into separate documents:
- **Artist view (private — the Radar):** shows gaps as invitations, private/working items, what still needs the artist. This is the artist's developmental intelligence.
- **Buyer view (public — the Passport):** shows **verified strengths only**, in each buyer's language. Never reveals a gap.

The retired term "Mirror / המראה" must never reappear — it is one Passport, shown in views.

### 1.6 Stage & the Gate
LOCK is **pre-validation**. The success **Gate** is deliberately small and binary: **one booking manager reacts to a real Passport AND one pays.** Monetisation is *measured, not required*; no price or ICP is locked until the Gate is reached. (Analytics events that measure the Gate: `availability_request_created` for the reaction; `entitlement_activated` for the verified payment — see §9 and §8.12 Admin.)

---

## 2. The Firewall (absolute rules)

The firewall is the product's identity. It is **absolute** and overrides design convenience, growth tactics, and every other consideration.

### 2.1 The evidence firewall
**NO** score · **NO** percentile · **NO** rank · **NO** "bookability %" · **NO** prediction · **NO** gauge · **NO** headcount · **NO** peer-leaderboard · **NO** position/placement number — **ever**, on any surface, for any entity.

Draw and standing are shown **ONLY** as:
- **Bands** (e.g. "300–800", "2,500–5,000", "Regular", "₪8,000–20,000") — never an exact figure.
- **Binaries** (e.g. "Invoice-ready · Yes", "Rider on file", "Set 90–120 min") — ready or not shown.
- **Method labels** (how we know it — see §4.4).

State is shown as one of four **bounded words** — **Ready · Developing · Needs you · Locked** (Radar); "Not needed yet" for a locked planet — plus four bounded node marks (**✓ ✦ ? +**) and colour. `N/A ≠ weakness`. Nothing goes public until the artist confirms it.

### 2.2 The firewall is ENFORCED BY DESIGN, never NARRATED (U33 — strengthened rule)
There is **no score/rank component in the codebase to begin with.** The firewall must **not** be described to the user on screen. The "No score · No ranking · No prediction · No guarantee · Bands · Binaries · Method labels" strip is **FORBIDDEN** on any app or Passport screen — it is technical narration.
> **Reconciliation note:** the prototype's Buyer/Public Passport (`buyer/passport`) still renders a `.fwstrip` footer ("No score · No ranking · No prediction · No guarantee · Bands · Binaries · Method labels"). This is a **known leftover that violates U33 and must be removed** in the build. The newest rule (U33) wins over the prototype here. The public Passport communicates its honesty through the *shape* of the evidence (bands + binaries + method labels), never through a printed disclaimer.

### 2.3 Streaming = secondary context
Streaming/online-reach figures are **secondary context**, never the headline and never a proxy for live draw. "Live-room proof matters more than follower count." Music/catalogue proves range, not draw.

### 2.4 Per-Act evidence is non-transferable
Evidence and the Passport are scoped **per Act** via `act_id`. A new Act starts **empty**. Switching Acts swaps the whole universe; evidence never merges across Acts. `passport_version.act_id` binds a Passport to an **Act**, not to a Person.

### 2.5 Reaction insight back to the artist = method-safe text ONLY
When a buyer's reaction returns to the artist, it is expressed as **method-safe text only — never a count, %, or score.** This is the single most fragile spot; any "buyers reacted" surface must be guarded. (Example allowed: "A booking manager checked your date." Forbidden: "3 buyers viewed you", "72% match".)

### 2.6 Method labels describe provenance, never quality
The four method labels describe *how strong the basis is* (provenance), never *how good the artist is*. They are the mechanism that lets draw be shown honestly as bands + binaries.

**Future-proofing rule (as intelligence deepens):** any NEW provenance method — including future ML/AI-derived signals — may be added **only via owner + counsel review**, must describe *how a fact was established* (not *how good the artist is*), and **must never imply a quality score, ranking, or prediction.** The label set is a trust vocabulary, not a scoring surface; deepening the AI must never dilute this. New labels join the canon (§4.4) or they do not ship.

### 2.7 Genre/scene emphasis is guidance, never grading
Scene emphasis ("buyers in your scene look here first") is a **ring + words only** — never a weight, number, rank, %, genre-leaderboard, public badge, or buyer-facing weakness. With **no genre/scene signal → no emphasis at all** (every planet equal; never a guessed weight).

### 2.8 Honesty firewall (built vs target)
Never present TARGET architecture as BUILT. Per-evidence Anthropic claim extraction is BUILT; the multi-source deep scan + locale-aware auto-discovery is TARGET. Copy may show the *intended* discovery experience as vision, but method labels stay honest (found vs confirmed) and any "wider automatic scan" is disclosed as "in development."

### 2.9 Rejected ideas (firewall-blocked — logged so they never creep back)
External reviews keep proposing well-intentioned features that quietly re-introduce a score, a grade, or a judgment. They are recorded here as **REJECTED** with the safe alternative, so a future contributor doesn't re-add them:
| Proposed | Why it's blocked | Safe alternative (if any) |
|---|---|---|
| **"Pre-Booking Scorecard" / "coverage % per planet vs genre norms"** (even "internal only") | a coverage % is a score; internal scores leak and normalise the framing | the existing genre-lens **ring + words** guidance (§2.7) — "buyers in your scene look here first," never a % |
| **"Bookability Verified by LOCK" badge / embeddable widget** | asserts a *quality/bookability status* — the exact claim the firewall forbids ("talent ≠ bookability") | a **provenance** badge only: "Evidence on LOCK · method-verified" — never "bookability verified" |
| **Rejection-reason feedback shown to the artist** ("buyers are rejecting you for X", counts of rejections) | a reaction returning to the artist as a count/judgment violates §2.5 **and** "gaps are invitations, not penalties" (§6.8) | at most **method-safe, aggregate, opt-in text** with no count and no per-buyer attribution — and only if it never reads as a verdict; default = do not build |
| **JSON-LD / structured data with a `score`, `rank`, or `bookabilityScore` field** | machine-readable scores are still scores — worse, they're scrapable | structured data may emit **bands + binaries + method labels only** (§19.7), never a numeric grade |
| **OG share card / dwell-time signal that shows a per-person number** | a shared card or analytics tile that renders a count/score about a person breaks the firewall on the most viral surface | OG card = name · genre · **draw band** · method label (no counts); dwell-time stays an **internal, aggregate** metric never surfaced per-person to the artist |
| **Replace bands with a ranked "Capacity Archetype" ladder + amend §2.1** (Intimate→Club→Hall→Arena as tiers) | an ordered tier ladder *is* a rank; amending §2.1 breaks the absolute firewall | keep the band as stored truth; render **warm venue-context wording over it** (§5.10) — describes room fit, never ranks; §2.1 unchanged |
| **Negative readiness states on the buyer face** ("❌ Not Ready · docs required") | shows a gap to a buyer — violates "no gap on a buyer face" (§8.7) | positive capabilities only buyer-side ("✓ Turnkey"); negatives live only on the artist's private Radar as warm invitations |
**The rule behind all five:** a number about a *person* is never allowed on any surface (public, internal-shown, or machine-readable). Numbers about *product events* (funnel counts for the operator) are fine. When a reviewer's idea is exciting, check it against this line first.

---

## 3. Entity Model

### 3.1 The spine: Person → Membership → Role → Workspace
- **Person / Account** — the human login. One human. Never the public artist identity. A person never re-registers to switch context.
- **Workspace (Organization)** — the operating context that bears **data, billing, and seats**. The tenant. `organization.plan ∈ ('solo','agency','agency_plus')`. Valid customer workspace types: **artist · management (agency) · producer (production)**.
- **Membership** — a Person joins a Workspace via `organization_membership` with `org_role ∈ ('owner','admin','member')`.
- **Role** — permission inside the active workspace, carried by `role_assignment.functional_role ∈ ('booker','agency','artist_manager','artist','operator','producer')` + an `authority_scope` JSON. Role is permission, **not identity**. Multi-role stacking (one Person = manager + booking-agent) is legal in schema (two `role_assignment` rows) but has **no UI today** (gap E4).
- **Active context** — `active_role_context` holds the live workspace/role.
- **Subscription** — a row on the workspace carrying `seats_included` / `seats_used`.

**Solo → team → company is one shape upgraded:** a solo workspace is an org with one owner-member; a company is the same org upgraded (plan) with seats filled. Only **Artist, Manager office, and Production** are workspaces that can grow solo→team→company.

### 3.2 Acts (multi-Act)
One artist (Person) may hold several **Acts** — e.g. a psytrance Act and a techno Act — each its own universe with its own Passport and its own evidence, **non-transferable**. The solo/team/company axis lives on **(a)** the Act's performing form (`act.format ∈ dj-set/live-set/duo/band/open-format/vocalist/comedian-host/ceremony-act/other`) and **(b)** workspace seats — **never** on the Person (the Person is always one human). Multi-Act is a *within-Person* fan-out, orthogonal to solo/team. Act switch = the Radar center-star; switching swaps the whole universe.

### 3.3 ArtistAccess (scoped, revocable, artist-approves)
A **separate axis** from org/team membership. An artist grants a manager/representative scoped access (`artist_access` grants, migrations 027/032). Properties: **consent-based · scoped · revocable by either side · artist-approves · NEVER implies ownership.** UI copy must never say "grant" in ownership language; the artist surface is "Who can act for you" (§8.5). Scopes seen in the prototype: **see** ("See my Passport") · **reply** ("Reply to date requests for me") · **manage** ("Help keep my Passport up to date").

### 3.4 The six workspace/actor families
| # | Family | Workspace? | Forms | Notes |
|---|---|---|---|---|
| 1 | **Artist / Act** | YES (type `artist`) | SOLO (built) · TEAM band/collective (schema via `act.format`) · COMPANY (schema-latent) | holds Acts; per-Act evidence + Passport. Person is always one human. |
| 2 | **Representation** (Manager office / Agency — אמרגן, **artist-side**) | YES (type `management`, role `agency`) | SOLO (plan `solo`) · TEAM (plan `agency`) · COMPANY (plan `agency_plus`) | roster + ArtistAccess. Membership ≠ ArtistAccess ≠ ownership. |
| 3 | **Production** (משרד הפקה) | YES (type `producer` — legacy value) | SOLO freelancer · TEAM crew · COMPANY | events + lineups + team. To *book* an artist, Production acts as a Buyer. |
| 4 | **Buyer** (מזמין הופעות — **demand side**) | **NO** workspace by default | segmented (see §3.5) | public Passport review needs **no login**; a signed-in pro booker gets a thin `/discover` home. |
| 5 | **Source-Confirmer** (מאשר-מקור) | **NO** workspace — accountless | individual only | confirms exactly ONE claim via a bounded magic link. NO signup, NO dashboard, NO workspace shell. |
| 6 | **Admin / Operator** (תפעול) | internal console, not a customer workspace | internal LOCK team only | `/admin` cockpit; `is_operator()` gives cross-tenant read via RLS. Never in public signup. |

### 3.5 Demand-side segmentation (never collapsed into "show-business pros")
| Buyer context | HE | Language register | Workspace? |
|---|---|---|---|
| Professional entertainment buyer (venue/club/festival/promoter/talent buyer) | מזמין הופעות / מנהל בוקינג / פרומוטר | booking/talent language OK | optional (booker screen-set) |
| Private event client (wedding couple, family/party) | לקוח פרטי / מזמין אירוע | simple, non-industry: style, fit, trust, availability | **NO** — Passport review/contact only |
| Corporate client (company/HR/office manager) | לקוח עסקי | reliability, fit, invoice/logistics | NO by default |
| Event planner (plans for a client) | מתכנן אירועים | coordination, style/fit, availability, vendors | optional |
| Event production (executes event/logistics/lineup) | מפיק אירוע / צוות הפקה / חברת הפקה | professional | **YES** — Production workspace |

**Absolute:** the buyer is **NEVER an אמרגן**. אמרגן = artist-side agent/office (the AGENCY entity). The v1.0 inversion (buyer ≡ אמרגן) is corrected everywhere.

**Six questions before any entity copy/route/component:** artist-side representation? · professional buyer? · private/non-industry client? · event production? · source-confirmation only? · does it need a workspace at all — or only a recipient/Passport-review flow?

### 3.6 Individual vs Team matrix
| Entity | Individual/Team | Workspace? | Boundary |
|---|---|---|---|
| Person/Account | individual only | no (the login) | account identity ≠ public artist identity |
| Artist | individual (one entity, many Acts) | yes | "supported, not inspected" |
| Act | belongs to one artist | no (inside artist ws) | evidence per-Act, never transfers |
| Manager office (אמרגן) | individual OR team/company | yes (seats/invites) | membership ≠ artist ownership |
| Production | individual OR team/company | yes | ≠ Source Confirmer; not a roster owner |
| Buyer | private individual OR business | **no** by default | public Passport review needs NO login |
| Source Confirmer | individual, accountless | no (magic-link task) | no signup/dashboard/endorsement |
| Operator | internal only | internal console | never in public signup |

### 3.7 The entity universe map — done / partial / absent (the critical modeling rule)
The full fine-grained entity universe (the "64-entity" catalogue: every Person/Workspace/Role/Act/Passport/ArtistAccess/buyer-segment/confirmer/operator permutation) is maintained in the canonical **ENTITIES artifact** (`f702abc5`, "structure + screens + intelligence + target"). This spec captures the **modeling rule** and the instantiation status; the fine-grained enumeration lives in that artifact and must stay in sync with it.

**The critical modeling rule:** solo-vs-team-vs-company is **NOT** a separate entity — it is the **same workspace** grown via seats (and, for the Artist, via `act.format`). There is no `entity_form` column today (gap E3): solo-vs-team is *derived* from member count, never declared. Multi-Act is a within-Person fan-out, not a new Person. ArtistAccess is a relationship/grant, never an entity that owns anything.

**Instantiation status (built / partial / absent):**
- **Built end-to-end:** Artist solo (onboarding → radar → passport → requests); multi-Act create/switch; Representation roster + ArtistAccess request/revoke + members/invites; Public Passport + availability request + receipt; Source-Confirmer at `/confirm/:token`; Admin console (~90%).
- **Partial:** Production (Team + Events render real data; Requests degrades honestly without migration 032; **no** event/lineup creation UI); artist edit (the D1 hole — confirmed radar nodes render with no edit form).
- **Absent / schema-latent:** artist team/company invite UI; explicit `entity_form`; multi-role stacking UI (E4); in-place solo→team upgrade flow (E6); buyer team/organization (post-Gate, E5); industry-comparison peer bands (RAD5).

### 3.8 The two named modeling defects to respect in any build
- **D1 (P0):** Artist identity is set-once with no edit surface — the owner's reported broken screen. The fix is the **Act-Identity Editor** (`/artist/act/edit`, §8.4/§8.6) with field-level save. Confirmed radar nodes must get an "edit" affordance.
- **D3 (P0):** the Source-Confirmer must **never** be a workspace shell. Any `/producer` + `/producer/received` logged-in shell is the D3 violation to **retire**; the confirmer lives ONLY at `/confirm/:token`.

---

## 4. Canon Glossary

Binding for every UI string, page, doc, and DS component. A surface that violates this glossary is a **blocked review**. Method labels stay **English inside Hebrew text** (deliberate universal-tag design).

### 4.1 Product concepts
| Concept | EN (locked) | HE (locked) | Forbidden |
|---|---|---|---|
| The product | **LOCK** (always uppercase; domain lock.show) | LOCK | GIGPROOF (old name) |
| Public buyer view | the **Passport** (Bookability Passport) | פספורט / הפספורט הציבורי | דרכון (any form); "Booking/Artist Passport" in HE |
| Artist private view | the artist's private view (the **Radar**) | האזור הפרטי של האמן (הרדאר) | Mirror / המראה (retired) |
| Evidence display | method-labeled evidence; **bands + binaries with method labels** | ראיות מתויגות-שיטה | any score/percentile/rank/gauge/prediction |
| Proof unit | Proof Unit | יחידת הוכחה | — |

#### 4.1a Milestone waypoints (G-8, 18 Jul — canon terminology from the built i18n; HE **ratify: R00**)
The artist journey's eight waypoint NAMES are canon terms (the codes `M1–M8` are internal only and never render):
| # | EN (locked) | HE (built — ratify: R00) |
|---|---|---|
| M1 | Arrived | הגעת |
| M2 | First light | אור ראשון |
| M3 | Radar alive | הרדאר חי |
| M4 | Focused | ממוקד |
| M5 | Backed | מגובה |
| M6 | Published | הפספורט בחוץ |
| M7 | In the market | נראה בשוק |
| M8 | Answered | תגובה ראשונה |
State words: done · "you are here" · ahead (הושלם · אתה כאן · בהמשך). Lighting conditions + render law: §8.2. Firewall: names + own step states only — no %, no grade, no comparison.

### 4.2 Personas / entities
| Persona | EN | HE | Notes |
|---|---|---|---|
| Artist | artist | אמן | one entity even with many Acts/genres |
| **Act** | Act | **אקט** (de-facto live term; formal taste-ratification pending — never invent a third term) | bookable product/project inside the artist context; evidence per-Act |
| Artist-side agent/office | manager office / agency | **אמרגן / משרד אמרגנות** | **supply side. NOT a buyer.** |
| Professional entertainment buyer | booking manager (not "booker" in new copy) | מזמין הופעות / מנהל בוקינג / פרומוטר | venue, club, festival, promoter, talent buyer |
| Private event client | private client / event host | לקוח פרטי / מזמין אירוע | wedding couple, family event — simple non-industry language |
| Corporate client | corporate client | לקוח עסקי | reliability, fit, invoice/logistics |
| Event planner | event planner | מתכנן אירועים | coordination, style/fit, availability |
| Event production (workspace) | production office / team | מפיק אירוע / צוות הפקה / חברת הפקה | solo OR team; executes event/lineup |
| **Source Confirmer** | source confirmer (a **capability**, not a role — magic link, no account) | **מאשר-מקור** (RATIFIED as the only UI term; "מפיק מאשר" = historical alias, docs only) | no signup, no dashboard, no workspace shell; not every source is a producer |
| Booker (code context) | recipient/buyer context (discover screen-set) | מזמין הופעות | may be a private individual; Passport review needs no login |
| Operator | operator | אופרטור / תפעול | internal console; no public signup |
| Passport | Passport (per Act/version) | פספורט | verified strengths + method labels only |
| ArtistAccess | artist-granted access | הרשאת גישה מהאמן | scoped, revocable; never ownership |

**Forbidden blur:** buyer ≡ אמרגן · booker signup labeled מפיק · private clients in industry jargon · Source Confirmer built/described as a workspace.

### 4.3 Structural terms
| Term | Meaning |
|---|---|
| Person → Workspace → Role | one login; the workspace bears the subscription; role is per-assignment. "Agency" is an org PLAN, not a person's role. |
| Plans | Passport (free) · Momentum (artist) · Roster (manager). Buyer free forever. No booking commission ever. |
| Four data doors | official API · consented OAuth · artist artifact · artist-confirmed discovery (surface, never publish; no cold directories) |

### 4.4 Method labels (the trust vocabulary — canon, strongest → weakest)
The **only** provenance vocabulary. Never expose raw DB/client states as user-facing labels. Never re-word to "source-confirmed."

| Method label | HE | Meaning |
|---|---|---|
| **Producer-confirmed** | מאושר ע"י מפיק | a counterparty acknowledged **this specific claim** (strongest; covers this claim only, not a general endorsement) |
| **Source-linked** | — | a public footprint that can be checked against its live source |
| **Evidence-supported** | נתמך בראיה/מסמך/מקור | a captured record supporting the claim (authenticity limited without a live source) |
| **Self-declared** (a.k.a. Artist-declared / Self-reported) | מדווח ע"י האמן | the artist's own statement, shown as a band; strengthen with a source |

Additional universal tags seen in glossary/marketing copy: TICKET EXPORT · PLATFORM DATA · OPERATOR-REVIEWED. In the Radar Inspector, the raw "Source-linked" label is de-technicalised into a human line ("from your Instagram" / "from …") but the **canon vocabulary stays intact on the Passport**.

### 4.5 Voice law
Professional restraint; evidence-grade; show-business warmth without hype. NO emoji in UI/legal copy. No exclamation-mark salesiness. "Check, don't trust." EN and HE each fully professional — **never mixed in one view** (LANGUAGE LAW). Firewall words only: "needs your touch" / "ready to support" / "private for now" / "can become public when you approve" — never score/rank/weak/missing.

**Dual-tone register (same firewall, two audiences).** The voice bends by *who is reading*, never breaking restraint:
- **To the artist — the Coach:** empowering, transparent, scene-native. "Let's build your proof." "See yourself the way serious bookers see you — and strengthen what matters." "You don't start from zero — we found your footprint; you decide what becomes proof."
- **To the buyer — the Auditor:** clinical, risk-aware, authoritative. "Check the evidence." "Your real proof, in the buyer's language. No hype — facts they can check."
- **Candidate taglines (owner picks one; all firewall-safe):** "Check, don't trust." · "Don't book a vibe — book a proof." · "Evidence over promises." *(Avoid any tagline that asserts a **quality** verdict — e.g. "bookability verified" — per §2.9.)* **OPEN (owner):** the canonical tagline.

---

## 5. Design System

**Authority note:** the current DS authority is **Codex v1.6.25** (Drive, `00_CURRENT/LOCKSHOW_Design_System_CURRENT.html`) — **not in this repo**. The repo holds A13 token values, the component-state control file, and the v1.2.0 digest. This section is buildable from the in-repo tokens; exact values still OWED by Codex are flagged in §5.9.

### 5.1 The single governing rule: "Dark is atmosphere, not camouflage"
Everyday UI = **LIGHT / paper cards.** Dark is reserved for the **Radar universe** and the **Passport hero** (DS-sanctioned media/editorial surfaces) — never as a default ground. Dark sections **force** most cards/containers to readable paper/light cards unless the container is explicitly the Radar-universe. This resolves the #1 historical gap (theme inversion) and the owner's "dark-on-dark isn't sales-y." In the prototype, the Radar stage and Passport hero are dark "islands" (`.dark-island`) inside an otherwise light everyday UI.

### 5.2 Brand palette (A13 — the ONLY canonical colours)
| Token | Hex | Role |
|---|---|---|
| `--ink` / `color.ink` | `#090D0A`–`#0A0D0B` | near-black; darkest ground + light-surface text anchor |
| `--forest` / `color.forest` | `#17221A`–`#18221A` | forest panels & trust boundaries |
| **`--lime` / `color.action.primary`** | **`#C8F04D`** | **THE single action/brand accent** (dark text required on it) |
| `--paper` | `#F3F5EF` | paper canvas / reading ground (everyday-UI ground) |
| `--mist` | `#DDE3D9` | mist |
| `--slate` | `#687269` | secondary copy only |

The brand is **dark/forest canvas + a single lime accent.** There is **NO orange in the confirmed brand.**

### 5.3 App dark surfaces (A13, for the Radar/Passport islands)
| Token | Hex | Surface |
|---|---|---|
| `color.app.bg` | `#0B0C0B` | dark canvas (Radar/Passport only) |
| `color.app.surface` | `#14181A` | cards, Radar panels, Passport work surfaces |
| `color.app.surface2` | `#1B2022` | inputs, nested surfaces |
| `color.app.raise` | `#232A2B` | hover / elevation only |
| `color.text.app` | `#F3F0E8` | primary app text on dark |
| `color.text.muted` | `#98A19A` | secondary app copy |

### 5.4 Radar STATE colours (A13 `state.*` — provenance/scan states)
| State token | Hex | Meaning · rule |
|---|---|---|
| `state.confirmed` | `#CBEE72` | artist/source confirmed (Ready) |
| `state.developing` | `#46DCC2` (teal) | developing but useful |
| `state.found` | `#F2C063` (gold) | found/source-backed, **not** confirmed — **"small accents only"** |
| `state.needsReview` | `#E39A4B` (amber) | needs artist review/correction — "invitation to improve, never shame" |
| `state.notAssessable` | `#9AA29B` | not enough context — **never** weakness |

> **OPEN ruling (gold/amber):** whether to keep `state.found` gold + `state.needsReview` amber as small accents (A13's position) or retire them to lime+neutral (owner's earlier lean). The prototype currently renders the "Needs you"/"Found" states in **neutral mist** as an interim (pending the ruling). Do not treat gold/amber as settled until the owner rules (§18).

### 5.5 Approved AA contrast pairs (use these; never invent a pair)
Body text target: **AA minimum ≥ 4.5:1; prefer 7:1.** Key pairs from A13:
| Pair | BG | FG | Ratio | Use |
|---|---|---|---|---|
| paper + forest | `#F3F5EF` | `#18221A` | 14.91 | default light-surface text |
| white + forest | `#FFFFFF` | `#18221A` | 16.37 | white work cards |
| ink + paper | `#0A0D0B` | `#F3F5EF` | 17.78 | cinematic sections |
| app bg + app text | `#0B0C0B` | `#F3F0E8` | 17.21 | default app dark text |
| app surface + app text | `#14181A` | `#F3F0E8` | 15.69 | task surfaces |
| app surface + muted | `#14181A` | `#98A19A` | 6.72 | helper + metadata |
| lime + on-accent | `#C8F04D` | `#12160A` | 14.00 | primary CTA (ONE per view) |
| danger on paper | `#F3F5EF` | `#B23B2E` | 5.37 | error/destructive text |
| **faint on app bg** | `#0B0C0B` | `#69716B` | 3.90 | **FAILURE RULE: decorative tertiary ONLY — never critical labels/validation/CTA** |

### 5.6 The 3-tier token control layer (the code-binding surface)
Change a value in ONE place and every component follows. Codex owns names + values + AA; the code binding (this layer) is owned in-repo (`COMPONENT-STATE-TOKENS.md`). Components read **Tier 2/3**, never Tier 1 directly, and **never hardcode a colour.**
- **Tier 1 — BRAND (raw palette):** `--brand-ink #090D0A · --brand-forest #17221A · --brand-lime #C8F04D · --brand-paper #F3F5EF · --brand-mist #DDE3D9 · --brand-slate #687269 · --brand-teal #46DCC2 · --brand-gold #F2C063 · --brand-amber #E39A4B`.
- **Tier 2 — SEMANTIC (roles):** `--canvas · --surface-1..4 · --text · --text-muted · --text-faint · --accent · --on-accent (#12160A) · --border / --border-strong`. The theme flip (dark ↔ paper) is a Tier-2 remap, not a component rewrite.
- **Tier 3 — STATE vocabulary (the ONLY status colours):** `--state-ready (lime) · --state-dev (teal) · --state-attention (amber/interim mist) · --state-found (gold/interim mist) · --state-locked (faint) · --state-na (#9AA29B)`. Plus PROVENANCE tokens: `--prov-confirmed (lime fill) · --prov-evidence (lime outline) · --prov-source (neutral outline) · --prov-declared (faint outline)`.
- **How to restyle:** globally = edit Tier 1/2; pointwise = edit the component→state map row; a DS update = re-map Tier 1/2/3 to new values here, verify AA against §5.5, components inherit.

### 5.7 Type, spacing, radius, tap-target, motion
- **Type (reconciled to the fonts actually loaded, `index.html`):** Display/headings **Frank Ruhl Libre** (400/700/900) · Body/UI **Heebo** (400–800; covers EN **and** HE, so no font-swap RTL↔LTR) · Labels/meta/dates **IBM Plex Mono** (400/600, uppercase chips). *(The marketing site uses **Manrope**; "Georgia/DM Mono" in older drafts was the historical DS v1.2.0 — superseded.)* **Body never below 16px**; metadata never carries meaning alone. The **exact px/weight scale is now DEFINED in §5.11** (interim defaults — no longer blocked on Codex).
- **Radius:** controls 9–10px · cards 12–18px · hero 20px · mobile sheets 22px top.
- **Spacing:** 4px base. **Grid:** 12-col / 1440 desktop · 4-col + bottom-nav mobile.
- **Icons:** 1.8px stroke, currentColor, 16 dense / 20 standard / 24 feature / 32 empty; critical actions carry a text label.
- **Tap target:** **44px minimum** for every interactive element.
- **CTA hierarchy:** ONE dominant primary (lime) + ≤2 quiet secondaries per view. Lime is reserved for **action/confirmed only**, never to encode magnitude. Secondary = neutral/ghost. **Exact CTA state spec (primary/secondary/ghost) + 44px paddings OWED (§5.9).**
- **Motion:** subtle, alive, calm. Radar has `starglow` (~4.5s star breath), `sweep` (~9s conic — explicitly **NOT a gauge**, points at nothing), `sonar` ring, twinkling starfield, desktop parallax, constellation energy-flow inward on confirmed dimensions. **All motion disabled under `prefers-reduced-motion`.**

### 5.8 The widget kit (build once, reuse) + full state sets
LOCK is **interactive workspaces made of smart widgets, not pages.** Every widget must implement the full state set: **default · hover · selected · loading · empty · success · error · disabled/not-yet · mobile-collapsed · mobile-expanded.**

| Widget | Purpose | Key fields |
|---|---|---|
| **Radar canvas** | the interactive universe | center star · 6 planets · constellation threads · orbit rings · platform ring · scene lens |
| **Planet Inspector / focus card** | drill-in per dimension | name · state · 3 layers (Meaning / Found-proof / Next-action) · source-logo ring · one CTA + quiet secondary · public/private chip |
| **Source Logo Ring** | provenance chips | logos only when relevant; method label on tap; neutral icon if generic |
| **Smart Action / Next-move strip** | the one next-best action | title · why now · what happens next · primary CTA · optional secondary · privacy state |
| **Proof review / inline edit widget** | confirm/edit a claim in place | type · immediate validation · visible save · undo · loading · error |
| **Passport preview card** | how a buyer will read a proof | claim · context · band/binary · method chip · reviewed date |
| **Request decision card** | a buyer's availability request | who · what · date · fit summary · missing-info · safety cue · one primary + secondaries |
| **Roster action card** | one artist on a roster | Passport readiness · what changed · why · one next action · ArtistAccess state |
| **Lineup slot card** | one slot on an event | set-time · state (open/requested/confirmed) · suggested act + fit reason · one CTA |
| **Public proof card** | buyer-readable evidence | buyer-language claim · band/binary · method label · reviewed date |
| **One-statement Confirmer** | the accountless magic-link task | statement · asker · what-confirming-means / what-does-NOT · 3 large choices |
| **Gate metric tile** | admin | metric · source event · timeframe · demo-excluded badge |
| **Workspace switcher** | identity hub | human labels; ✓ on current; account actions |

### 5.9 Values still OWED by Codex (v1.6.25 / the Drive DS)
> **⚠️ NO LONGER A BLOCKER (16 Jul):** every *scale* value below now has a **hard interim DEFAULT in §5.11** — type scale, radius, CTA paddings, spacing, elevation, light-card tokens. Build against §5.11; do **not** wait for Codex and do **not** guess. Only the **logo/venue-logo assets** and the **gold/amber ruling** remain genuinely owed, and neither blocks a code value. This list is kept as the "refine later" wishlist, not a dependency.

These are flagged so they are not mistaken for settled; build with the §5.11 / A13 interim values until Codex supplies:
1. **Exact type-scale numbers** (H1/H2/card/body px + weight, desktop + mobile).
2. **App LIGHT-card token values** (paper/white card bg, border, text, muted on light beyond A13 core hexes) + the precise "Radar-universe" dark-boundary definition.
3. **CTA hierarchy spec** (primary/secondary/ghost states) + the 44px rule's paddings.
4. **The logo master SVG** (`lockshow-symbol-spotlight-lens-v2-master-lime.svg`) — the prototype uses a geometry stand-in (padlock/keyhole/spotlight-lens mark).
5. **Real venue logos** (Barby, The Block, Sunset) for the evidence cards.
6. **The gold/amber ruling** — keep `state.found`/`state.needsReview` as small accents (A13) or retire to lime+neutral (owner lean). See §5.4 / §18.
7. The full dark-app semantic scale + status set + elevation shadows + the `forest-2/chrome-bg/rail-bg` chrome tints proposed in the nav consolidation (all tints/opacities of existing hues — Codex to confirm/rename).

---

### 5.10 Humanized rendering of bounded data (the warmth layer over the firewall)
The recurring UX critique: a raw band ("300–800") or a binary ("invoice_ready · yes") reads like a spreadsheet, not show-business. The fix is a **rendering layer, not a firewall change** — **the DB still stores bounded bands + binaries (the firewall is unchanged, §2.1 is NOT amended); the UI renders warm human language over that truth.** The band remains the honest value beneath.

**Draw band → venue-context narrative (never a ranked ladder).**
| Stored band | Human line (render) |
|---|---|
| ~≤150 | "Fills intimate rooms & lounges" |
| ~150–500 | "Regularly fills mid-size clubs" (band shown: 150–500) |
| ~500–1,000 | "Moves large-hall crowds" |
| ~1,000+ | "Plays festival-scale stages" |
Rules: the human line **describes room fit, never ranks the artist**; always pair with the band (kept visible) + a method label; **the tiers are NOT an ordered "better→worse" ladder** — a lounge act is not "lower" than a festival act, just a different room. *(This is why §2.1 stays as-is: the moment these become a ranked ladder or replace the band, they are a rank — forbidden.)*

**Binary → positive capability (negatives NEVER shown buyer-side).**
- true → an active, warm trait: `✓ Issues formal tax invoices` · `✓ Stage-ready technical rider on file`. A cluster of trues can read as **"Turnkey · booking-ready."**
- false/missing → **absent from the buyer Passport entirely** (gaps are never shown to a buyer, §8.7). "Admin needed / Not ready" states may appear **only on the artist's private Radar**, and there only as a warm invitation ("Unlock Turnkey — buyers book faster when docs are on file"), never a red "Not Ready" verdict.

**Method label → canon chip + human sub-text.** Keep the English canon chip (the moat, §4.4); add a one-line human explainer on the buyer face / on source-peek: `★ Producer-confirmed` → *"verified by an industry peer who worked with them — this claim only."* (Source-peek detail = §8.7 B6 / §17.A.6.)

**Status words → warm invitations** (already the voice law §4.5/§6.8): "ready to support" / "growing" / "needs your touch" — never "weak/missing/not assessable." **Dates → "Fresh proof · July 2026"** / "added this month," not "Reviewed 12/05/2026." **Milestones** render as named waypoints ("First light" … "Ready for market"), **never `M1–M8`** on screen (§8.2).

**Two visual-grammar rules (adopted from review):**
1. **Lime discipline** — solid lime = an actionable **button only**. A *confirmed status* uses a **lime outline / lime text**, never a solid-lime fill, so a buyer/artist never taps a status chip thinking it's a CTA. (Protects law 3's one-CTA clarity.)
2. **Private vs public border** — private/draft items render with a **dashed border**, public items with a **solid** border — a global, wordless signal reinforcing "always show private/public" (law 6).

**Progress vocabulary (count-based — the richer artist-private progress language, 18 Jul).** The owner's finding: bounded words alone make progress displays feel castrated. The fix inside current canon — the artist's OWN progress may render with **counts of their own items**, which are already allowed (the "N of 8 milestones" precedent, §8.2):
- **X-of-Y counts** — "6 of 8 confirmed", "3 of 5 planets ready", "2 items waiting for you here".
- **Discrete-step progress rings/bars** — a ring that fills by *steps* (one step per confirmed item), labeled with the count ("6 of 8"), NEVER labeled or stored as a percentage.
- **Per-planet tallies** in the Inspector — "confirmed 4 · found 2 · to add 3" (the artist's own items on their private Radar).
- Named waypoints (M-names) + the count-up, as already specified.
Rules: artist-private surfaces only; denominators exclude N/A fields (N/A ≠ gap, §16.A.5b); never comparative, never a quality read, never buyer-facing. **A completion *percentage* remains rejected (§2.9) unless the owner rules R-11 (§18.2) to allow the artist-private variant — this vocabulary needs no such ruling.**

**Firewall guardrails on this whole layer:** no ranked ladder; no numeric grade; no negative state on a buyer face; the band/binary stays the stored truth; every human line pairs with provenance. Warmth is a **wording + visual** change, never a data change.

### 5.11 Self-contained DS defaults — the repo does NOT depend on Codex's Drive
The audit's top drift point: values marked "OWED by Codex (Drive)" (§5.9) are unreachable by an AI agent or a new dev → they guess → CSS debt. **Resolution: every owed *scale* value now has a hard interim DEFAULT below.** The **palette, surfaces, states, and AA-proven contrast pairs are already in-repo and authoritative** (`tailwind.config.js` + `docs/design-system/A13-TOKEN-VALUES.md`, mapped in §5.2–5.5) — nothing there is owed. What was owed was only the *scale*, defined here. **Rule for builders: use these values; never guess. If Codex later ships v1.6.25, remap Tier-1/2 in the 3-tier layer (§5.6) and every component follows — the app is never blocked.**

**Type scale (interim — fonts per §5.7).** px · weight · line-height:
| Role | Font | Size (mobile→desktop) | Weight | LH |
|---|---|---|---|---|
| Display / hero | Frank Ruhl Libre | `clamp(38px, 8vw, 72px)` | 900 | 1.05 |
| H1 (screen title) | Frank Ruhl Libre | 26 → 30 | 700 | 1.15 |
| H2 (section) | Frank Ruhl Libre | 20 → 22 | 700 | 1.2 |
| H3 / card title | Heebo | 17 → 18 | 600 | 1.25 |
| Body | Heebo | **16** (floor) | 400 | 1.5 |
| Secondary | Heebo | 14 | 400 | 1.45 |
| Chip / eyebrow / method label | IBM Plex Mono | 11 | 600 | 1.2 · uppercase · +0.06em |
| Micro / date | IBM Plex Mono | 12 | 500 | 1.3 |

**Spacing — 4px base:** `4 · 8 · 12 · 16 · 24 · 32 · 44 · 64`. Card padding 16 (mobile) → 20–24 (desktop). Section gap 24 → 32.
**Radius:** input **8** · button **10** (or pill `full` for chips) · card **12** · panel **16** · hero **20** · mobile sheet **22** (top corners).
**Elevation:** light card `0 1px 2px rgba(0,0,0,.06), 0 6px 16px rgba(0,0,0,.05)` · raised/sheet `0 12px 32px rgba(0,0,0,.12)` · dark island uses **border (`line`) + inner glow**, not a drop shadow.
**CTA spec (interim, satisfies the 44px law):**
| Variant | Box | Fill | Text |
|---|---|---|---|
| **Primary** | padding `12px 20px` · min-height **44** · radius 10 | **solid lime** `#C8F04D`, text `on-accent #12160A` | Heebo 15/600 |
| **Secondary (ghost)** | same box | transparent + `1px border line-2` | text `ink`/`muted` |
| **Text / tertiary** | inline, no box, 44px hit-area | none | `accent` text, underline on hover |
Solid-lime is **buttons only** (a confirmed *status* uses lime **outline/text** — §5.10). One primary per view (law 3).
**Light-card token (task surfaces):** bg `ds-card #FFFFFF` · border `1px ds-mist #DDE3D9` · radius 12 · padding 16–20 · text `ds-forest #18221A`.
**Motion tokens:** the 5 easings + duration ladder + reduced-motion contract are DEFINED in §17.0 (derived from the prototype) — also no longer owed.

**Still genuinely OWED (assets, not blockers):** the **master logo SVG** and **real venue logos** (Barby/Block/Sunset) — until delivered, use the existing wordmark component + neutral text placeholders; and the **gold/amber ruling** (§5.4, interim = neutral mist). These are asset/owner items; no *code value* is blocked by them.

_Optional hardening: mirror this scale into `tailwind.config.js` (`fontSize`/`spacing`/`borderRadius`/`boxShadow` keys) + `src/tokens.ts` so the values live in code, not just the spec — a clean atomic slice (§20)._

---

## 6. Global UX Laws (apply to every screen)

1. **One screen = one job = one next action.** Never "many panels of evidence and internal states."
2. **Mobile-first: mobile is the DEFAULT.** Desktop uses the extra space for **overview / context / comparison** (inspector panels, side rails); mobile is for **action** (bottom sheets, one widget per view). Design mobile Radar **separately** from desktop, not as a shrink.
3. **One primary CTA on screen at a time** + ≤2 quiet secondaries. Never duplicate CTAs (the inspector CTA and a bottom dock must never both be primary — see §8.3).
4. **No technical / internal architecture language.** FORBIDDEN: a "Navigation" label, a "Career Workspace" eyebrow, "genre-primary", raw DB/client states, decorative hero/atmosphere images that don't contribute. Images are **entity content only** (artist photo, platform/venue logos), never decoration. If nav isn't self-evident, the design failed.
5. **Immediate feedback on every action** (typing, saving, confirming, undo).
6. **Always show private/public** — the user always knows what is theirs alone vs what a buyer can see.
7. **One-viewport per primary workflow** — every primary screen fits one viewport height with **no page scroll** where feasible (a hard target for Radar/Onboarding/Passport hero; long ledgers may scroll within a contained region).
8. **Warm tone, never judging.** Gaps are invitations, never penalties. N/A is never a weakness.
9. **Every proof explains "why this matters."**
10. **The firewall is enforced by design, never narrated** (§2.2).
11. **Value before effort** — the user sees value grow after every useful contribution (Input→benefit; Discovery→confirmation; Gap→opportunity; Private→protected).
12. **Interactive under load** — every primary screen stays responsive as data grows. The Radar is the core experience and must not degrade: **target < 1.2s first-interaction on a mid-tier mobile device with ~200 evidence items across the six planets** (virtualise/aggregate beyond that; never render hundreds of live nodes). A "many-Acts / many-evidence" state is a design case, not an afterthought (see §19.4 high-volume Radar). This is a guardrail, not yet a measured result — flagged for a QA performance budget (§10).
13. **One canvas per workspace — screen-count ceiling.** Each entity role has **at most ~3 primary screens** (an overview canvas · a deep-work surface · settings). Every secondary action happens **in place** — inspector, bottom sheet, inline-edit widget, side panel — **never a new full page**. Every process must have a **1-screen happy path**. This is the "widget-workspace" direction the prototype already sets (Radar-as-canvas, inline-edit §17.A.10, bottom sheets §17.A.2); §7.7 states the per-entity target. *(Target/direction — some consolidations are P2 refactors; validate each in the prototype before collapsing, never merge if it hides a distinct job.)*

---

## 7. Navigation & Shell

### 7.1 Identity chrome: exactly TWO elements
The chrome is **brand lockup (top-left)** + **one unified hub (top-right)** = account + workspace switch. Everything else (a separate top-left workspace switcher, a rail persona card, a person-name eyebrow, a duplicated breadcrumb) was removed. The center crumb (if shown) carries only the section name in calm sans, and is hidden ≤640px.

### 7.2 The unified top-right hub (≤2-step workspace switch)
Click avatar (**step 1**) → ONE dropdown menu containing, in order:
1. **Identity header** — avatar/initials · name · role · "{Workspace} workspace".
2. **Switch workspace** group — all workspaces the user has, each row = icon/avatar + label + sub-label, with a **✓ on the current one** (`role=menuitemradio` + `aria-checked`). Click a row = **step 2** → switched. Never deeper than 1–2.
3. **Account actions** — (Artist only: "Who can act for you") · Edit profile · Account settings · Restart demo (demo only) · Sign out. In public/confirm modes the danger action is **"Exit preview"** instead of Sign out.

The hub **renders in EVERY mode** (app / public / confirm) so no persona is ever trapped. A11y: `aria-haspopup/expanded/controls`; Escape closes + returns focus; roving arrow-key nav; on mobile the hub is avatar-only, pinned right, menu fits in-viewport.

### 7.3 Per-entity context nav
Each workspace has its own small context nav (desktop = one nav only, top bar OR rail — never both; mobile = bottom nav). Prototype nav sets (labels + badges):
- **Artist:** Radar · Passport · Requests (badge 2). Default = Radar.
- **Representation:** Roster · Requests (badge 2) · Radar · Team. Default = Roster.
- **Production:** Events (badge 3) · Requests (badge 4) · Workspace. Default = Events.
- **Buyer (public mode):** Passport · Availability. Default = Passport.
- **Source-Confirmer (confirm mode):** Confirm only. Default = Confirm.
- **Admin:** Home · Requests / SLA (badge 3) · Provenance · Risk (badge 2). Default = Home.

Codex's human-label refinement (target): My Artist / My Roster / My Lineups / View as Buyer / Confirm a Detail / Admin.

### 7.4 The real-app rule (vs demo mode)
In the **real app**, a user sees **ONLY the roles/workspaces they actually have** — never all six. The all-six switcher is a **demo/prototype** convenience. If a demo must show all entity views, it must carry a **visible "Demo switcher — shows all entity views" label**. On mobile, the entity switch lives under "Me" (the hub), not always in view.

### 7.5 Mobile bottom-nav
On ≤640px, per-entity nav becomes a bottom nav (`.botnav`): the same nav items as icons + labels + badges, current item active. Radar adds a bottom-sheet inspector and a bottom action dock (§8.3). Bottom sheets and gestures (swipe between planets, pull-down to close) are the mobile interaction idiom — never a new page per tap.

### 7.6 Deep-link & share schema (virality-critical)
The Passport is the growth engine (§16.B.13) — its links must be exact, shareable, and never dead-ended. The canonical public routes (no login, no AppShell):

| Link | Route | Notes |
|---|---|---|
| Public Passport | `/passport/:id` | buyer-facing; `?view=rep` swaps to the representation face; `?s=1` = a shared/tracked open |
| Availability request | `/passport/:id/request` → `/passport/:id/sent` | the Gate action + receipt |
| Source-Confirmer | `/confirm/:token` | accountless magic link; single card, no shell |
| Org invite | `/invite/:token` | accept flow |

**Rules:** (a) all redirect targets are **surface-aware** (`BASE_URL` → `/` standalone vs `/app/` embed, §13.4) so a shared link never bounces to the wrong deployment; (b) a bad/expired link resolves to the **warm 404** (§17.B.10), never a silent redirect; (c) share links carry **no PII** in the URL; (d) **OWED:** OpenGraph/preview meta on `/passport/:id` (so a shared link unfurls richly in WhatsApp/Telegram) and true **universal/app links** are a post-embed enhancement.

### 7.7 Screen-count discipline — the one-canvas-per-workspace target (law 13)
The direction: **each workspace is one primary canvas**, with everything else folded into tabs / inspectors / sheets rather than separate routes. This is a **target** (some are P2 refactors); it is stated so the build converges instead of sprouting pages. Routes stay valid as deep-links even where the UI folds them into one canvas.

| Entity | Today (routes) | Target canvas | Folds via |
|---|---|---|---|
| **Artist** | radar · passport · requests · access · account · act/edit · evidence | **Radar canvas** (+ a Settings surface) | Passport/Requests as tabs on the canvas; **act-edit + access + evidence** as inspector/inline-edit (§17.A.10) — the D1 editor already opens inline; Account/Access fold into Settings or the hub |
| **Representation** | roster · reqs · radar · team | **Roster cockpit** | Requests/Team/Radar as tabs or a side panel; one action per artist card; a mini-Radar for the selected artist |
| **Production** | events · reqs · workspace | **Events board** | Requests + workspace settings as a side panel; slot create/confirm as bottom sheets, never new pages |
| **Buyer** | passport · request | **Public Passport** | the availability request as an in-page sheet + receipt |

**Guardrails (so consolidation helps, not hurts):** never merge two genuinely distinct *jobs* onto one canvas just to cut a route; keep **one primary CTA at a time** (law 3) even inside a tabbed canvas; a tab is not a screen — the canvas keeps a single "what's next." The reviewer's ~67% route-reduction figure is an *estimate of direction*, not a target to hit blindly. **Priority:** Artist first (highest-traffic; D1/inline pieces already exist), then Representation/Production as their depth is built.

#### 7.7.a — THE ENTITY→SCREEN MAP (T-67, 18 Jul — the binding one-view of every entity's screen system)

Each entity: its ONE main canvas · the interactive ENGINE that canvas runs · every secondary screen with its nav path in AND back (§10.6 no-dead-end) · the signals it must fire (§21.1/§14.1.5). Build tasks cite this row + the screen's §8/§17.B section; a screen not on this map is a flagged ruling, never an invention.

| Entity (§3.4) | Main canvas | The interactive ENGINE | Secondary screens (path in → back) | Nav shell (§7.1–7.5) | Signals (§21.1) |
|---|---|---|---|---|---|
| **ARTIST** | Radar canvas `/artist/home` (§8.2) | **Radar + Planet Inspector** (§8.2/§8.3): planets → panel → confirm/fill → coaching (N2–N4) | Passport preview §8.4 (nav tab → back via nav) · Requests §8.13 (tab) · Access §8.5 (hub → back) · Act editor §8.6 (Radar EDIT → inline, returns in place) · Evidence §8.13 (planet panel → back to Radar) · Onboarding §8.1 (entry-only → lands Radar) | chrome §7.1 · hub §7.2 · nav Radar·Passport·Requests (§7.3) · bottom-nav §7.5 | Identity+Intent+Trust (build events) · Retention (`login`/restore) — §14.1.5 FIRING |
| **REPRESENTATION** | Roster cockpit `/representation/roster` (§8.10) | **Roster action cards**: per-artist what-changed · why · ONE bound action | Requests inbox `/reqs` · Roster Radar `/radar` · Team `/team` (all §8.10 — nav tabs → back via nav) | nav Roster·Requests·Radar·Team (§7.3) | Relationship (grants — ⚠ NOT-WIRED §21.1) + Conversion (request handling) |
| **PRODUCTION** | Events board `/production/events` (§8.11) | **Lineup-slot board**: time-ordered slots, one CTA per slot; books via Buyer path | Requests `/reqs` · Workspace `/workspace` (§8.11, tabs → back) · Passport (Buyer mode) §8.7 → back via history | nav Events·Requests·Workspace (§7.3) | Conversion (`availability_request_created` as buyer) |
| **BUYER (public)** | Public Passport `/passport/:id` (§8.7) — no login, no shell | **Persona toggle + proof cards + ONE sticky CTA** → availability request §8.8 (in-page → receipt → back to Passport) | Signed-in `/discover` (§8.13 — ⚠ THIN, flagged) | public mode: Passport·Availability (§7.3); deep-links §7.6 | Conversion (`passport_view`+`return_visit` · reaction · request) — FIRING |
| **SOURCE-CONFIRMER** | `/confirm/:token` single card (§8.9) — accountless | **One-minute confirm ceremony**: yes / partial / no / wrong-person | none by design (no shell; exit = done screen) | confirm mode §7.3 | Trust (`claim_confirmed` server-side) — FIRING |
| **OPERATOR** | Admin cockpit `/admin` (§8.12) | **Gate + Retention tiles + queues** (payments · claims · consents · audit) | anchor-scrolled sections in one page (§8.12) → sticky section nav | internal only | reads ALL families; fires none |
| **UTILITY (cross-entity)** | — | — | signup/login/reset §17.B.1–3 · invite §17.B.4 · settings §17.B.5 · org/team §17.B.6 · billing §17.B.7 · consent §17.B.8 · notifications §17.B.9 · 404/error §17.B.10 · skeletons §17.B.11 | per §17.B each carries its own entry/exit | Identity (auth events) + Retention (§14.1.5) |

**FLAGGED THIN (owner ruling before build — not invented here):** (1) **Representation secondaries** — `/reqs`·`/radar`·`/team` are one-liners in §8.10; the recovered AG1–AG4 canon (B4-35.50: invitation/grant states · request statuses · team capability matrix) is the natural fill — needs owner adoption before deepening; (2) **Production creation flows** — event/slot creation UI is TARGET (§8.11 note), states exist only as names; (3) **Buyer signed-in home `/discover`** — one line in §8.13; (4) **Roster mini-Radar** (`/representation/radar`) — named, never spec'd. Each is a queue task on ruling, per HOW-TO-BUILD-A-TASK.

---

## 8. Per-Screen Specification (THE CORE)

Each screen is buildable from its sub-spec alone. Routes shown are the prototype/target routes.

---

### 8.1 Onboarding (`/onboarding`) — the discover→confirm narrative (BUILT 3-step as of 18 Jul, T-58 — reveal ships the REAL-data version; the animated multi-source scan moment stays TARGET)

> **T-58 provenance note (18 Jul):** step 3 "Here's what we found" is now BUILT in its honest form —
> it reveals the artist's actually-captured link as a ✦ found signal with the §2.8 honest-scope line
> ("a wider multi-source auto-scan is in development"), never an invented tally. The full animated
> Step-2 scan + multi-source found-grid below remains the TARGET experience, unlocked by the real
> deep-scan (§9). With no link given, the flow completes from step 2 — a reveal never fabricates.

**PURPOSE.** Turn a cold artist into a live Passport-in-progress with the least possible effort: the artist gives only the basics; LOCK discovers the public footprint; the artist confirms. "You don't build from scratch — you approve what we found." Warm conversion copy, never technical. EN + HE, locale-aware.

**DESKTOP & MOBILE layout.** A centered full-screen overlay card (`.overlay > .ob`), one job per step, 3 step-dots at top. No page scroll. Identical structure on mobile (single-column card). Language switcher **removed** (U1) — EN-only in the prototype; HE strings retained as data for the localisation pass.

**COMPONENTS.** Brand lockup (spotlight-lens mark) · step-dots · fieldset (Step 1) · locale/market pill + animated source-scan grid + scan bar + cycling caption (Step 2) · found-grid rows with source logos + "✦ Found" chips + tally (Step 3) · one primary CTA + a quiet "explore a sample first" escape hatch.

**STATES (per step).**
- **Step 1 · The basics** — two fields: Artist/Act name, One main link. Primary disabled until both present (helper: "Add your name and one link to start.").
- **Step 2 · Discovering** — an animated scan: source logos (`instagram · eventer · spotify · goout · residentadvisor · tickchak · soundcloud · tiktok` — a mix of **local Israeli** + **global** sources) light one-by-one; a market pill shows "Your market · Israel" + "Hebrew · English · Russian"; a caption cycles through scan lines (~900ms) then auto-advances (~3.2s) to Step 3. Honest scope footer.
- **Step 3 · Confirm** — a found-grid of the 5 sources with what was found on each; a tally line; primary CTA into the Radar. This step never publishes anything.

**INTERACTIONS.** Step 1 → `obNext` (captures name/link) → Step 2 auto-runs the scan → Step 3. "Open my Radar & confirm" (`obToRadar`) closes onboarding, sets `welcomed=true` and `discovered=true`, navigates to `artist/radar`. Explore hatches jump to the Radar with a sample.

**EXACT MICROCOPY (EN).**
- S1 eyebrow "Step 1 of 3 · The basics" · h "Let's start your Passport" · sub "Your name and one link is all we need — we find the rest of your public footprint." · fields "Artist / Act name" (ph "e.g. NOYA VOLK"), "One main link" (ph "Instagram, Spotify or your website") · helper "One link is enough to start. We look across your **public footprint** — the same sources a booking manager checks — never anything private, and nothing is published until you confirm it." · CTA "Find my footprint →" · escape "I'll explore a sample first".
- S2 eyebrow "Step 2 of 3 · Discovering" · h "Finding your footprint…" · sub "Searching the sources booking managers check — in **Hebrew, English and Russian**, where your audience is. We read only what's public — nothing is published, nothing is decided. You'll confirm every finding yourself." · market "Your market · Israel" / "Hebrew · English · Russian" · captions ["Reading your Instagram lineup listings…","Checking Eventer & Go-Out event pages…","Matching your Spotify catalogue…","Searching in Hebrew, English & Russian…","Looking across Resident Advisor & Tickchak…","Reading your public footprint across Israel…"] · footer "We look across your public footprint in your market. A wider multi-source auto-scan is in development — today we start from the link you gave."
- S3 eyebrow "Step 3 of 3 · Confirm" · h "Here's what we found" · sub "We found your footprint across **5 sources**. From here it's simple: confirm what's really yours. You don't build from scratch — you approve what we found." · rows [Instagram "14 lineup listings + your community band" · Spotify "Streaming catalogue — 3 releases" · RA "Booked on 6 RA event pages" · SoundCloud "12 mixes & DJ sets" · TikTok "Engaged following, consistent"] · tally "8 findings · each labeled how we know it · nothing public until you confirm" · CTA "Open my Radar & confirm →" · escape "I'll explore first".
- **HE** equivalents are defined verbatim in the prototype `OBT.he` (e.g. S1 h "בוא נתחיל את הפספורט שלך"; canon terms פספורט / אקט; "מאשר-מקור" where relevant) and are the localisation source of record.

**FIREWALL.** The scan is disclosed as "your public footprint" + "a wider multi-source auto-scan is in development" (honesty firewall). No score/tally-as-grade — the "8 findings" count is a count of the artist's own found items, each method-labeled, "nothing public until you confirm."

**DEFINITION OF DONE.** Two-field Step 1 with disabled-until-valid CTA; animated locale-aware Step 2 that auto-advances and respects `prefers-reduced-motion`; Step 3 found-grid that lands the artist on the Radar with found (✦) items waiting; EN + HE strings externalized (no hardcoded copy); one viewport, no page scroll; escape hatch present.

---

### 8.2 Artist Radar (`/artist/radar`) — the central interactive engine

**PURPOSE.** The artist's private, living picture of their own professional proof — six dimensions a booking manager weighs — where LOCK shows what it *found* on public sources and the artist *confirms* what's really theirs, one tap at a time. It is where evidence is reviewed and confirmed; it is **not** a dashboard, and buyers never see it. Two readings for every component: **Artist read** = "what's strong, what still needs me, what to do next" (gaps are invitations); **Buyer relevance** = the same signal, once confirmed + method-labeled, becomes a checkable strength on the public Passport.

**THE TWO JOBS (owner R00, 16 Jul — canon).** "The Radar's purpose is to COLLECT information — with AI scanners and bots — about the artist's UNIVERSE, and to help the artist IMPROVE that universe. The startup's meaning is PRE-BOOKING." The Radar therefore has **two jobs, both first-class**, and a Radar build that delivers only the first has failed the spec:
1. **COLLECT** — discover the artist's public universe (scanners + the artist's own additions) and let the artist confirm what's really theirs.
2. **UPGRADE** — actively help the artist *improve* that universe: every planet state produces guidance (the coaching line §8.3, the next-best-move dock, the fill widgets) that names the one thing worth strengthening and why a buyer cares. **A Radar that only collects is a form. A form is not the product.**

**The loop (the screen's core mechanic, running continuously):**
`scan → ✦ found → artist confirms ✓ → LOCK advises what to strengthen → artist adds it → scan again`
Each pass around the loop makes the universe more provable; the loop never ends, it only slows as planets reach Ready. Every stage is already specified: scan = §9 (honesty per §2.8 below) · ✦ found = node states · confirm = the Inspector §8.3 · advise = coaching line + next-best-step engine · add = inline fill widgets · re-scan = incremental re-scan (TARGET, §9).

**DESKTOP layout — the 4-zone canvas** (`.radar-work`):
- **TOP-CENTER · scene lens** (`.rwscene`) — a segmented control ("Your standing in" + Melodic / Progressive / Afro / All). It **never overlays the act card**.
- **LEFT · Act identity + privacy + lens** (`identityCol`) — round photo, "Your Act", stage name; a privacy line ("Private to you — nothing is public until you approve it." / when published: "Some strengths are public on your Passport — you approved them."); a "Show" lens rail (All · Needs my review · Ready to publish).
- **CENTER · the dark universe island** (`.radar-stage.dark-island`) — starfield · sweep · sonar · orbit rings · constellation threads · center star (avatar + name + scene chip) · the six planets.
- **RIGHT · the persistent Planet Inspector** (`inspectorPanel`) — holds the single primary CTA whenever visible (always on desktop). Full spec in §8.3.
- **BOTTOM · next-best-move dock** (`radarDock`) — shown **only** when the inspector is NOT holding the CTA (i.e. mobile overview). Guarantees exactly ONE primary lime CTA on screen at any moment.

**MOBILE layout / gestures — "Radar Focus" (designed separately).** Top = Act + scene; center = zoomable Radar; bottom = one-action dock. Tap a planet → it zooms/focuses in place (others fade to ~40%, never gone) and source logos orbit it; tap a logo → a small proof card; **swipe left/right → next/prev planet** (`cyclePlanet`); **pull-down / grab-handle → close** the bottom-sheet inspector; tap center → overview; long-press a logo → method label. No new page per tap, no long drawers, no endless stacks. The inspector renders as a bottom-sheet (`.rwinsp.insp-panel` with `.insp-grab`) and only holds the CTA when the sheet is open; otherwise the bottom dock carries the next-best move.

**COMPONENTS & the six proof-dimension planets.** Fixed orbit (angles −90/−30/30/90/150/210). Each planet's nodes are derived at render time from the Act's real fields + evidence — nothing stored, nothing scored.

| Planet | Meaning (artist / buyer) | Nodes | Genre-primary in scenes |
|---|---|---|---|
| **Identity & Story** | who you are / the first thing they read | stage name, one-line positioning, genre, press photo, Act goal, identity links | — |
| **Music & Catalogue** | a live checkable catalogue / hear the sound | Spotify/SoundCloud/Bandcamp/Apple links; releases; mixes & sets | prog |
| **Live Show** | you draw a real crowd (bands, never headcount) | lineup-frequency band, track-record events, RA bookings, ticket/settlement export (strongest draw proof) | techno · prog · afro |
| **Audience & Community** | a room you can fill (a band, not a follower count) | owned-community band, engaged-following consistency, social links | techno · prog · afro |
| **Professional Kit** | book you without friction (binaries + bands) | set length, regions, technical rider, invoice-ready, contact | techno |
| **Career Proof** | third-party proof that outranks a self-claim | producer-confirmed rebookings, press mentions, draw claims, "ask a producer to confirm" | afro |

**EIGHT RADARS — one geometry, family-derived emphasis (the family→planet model).** The six planets and their fixed orbit are identical for every artist — but there is not one Radar, **there are EIGHT: same six planets, different emphasis per `genre_family`** (`genreWeights.js:GENRE_FAMILIES`, reference table §16.A.1.a). The family decides which planets carry the ★/gold-ring emphasis, the order the next-best-step engine walks candidates, and the scene named in the coaching line (§8.3). The full model, verbatim from code:

| `genre_family` | PRIMARY planets (emphasis + ★) | SECONDARY | The buyer logic behind it |
|---|---|---|---|
| `dj-club` | live · audience · prokit | proof · identity | a club booker asks: crowd, room, frictionless night |
| `dj-festival` | music · live · proof | audience · identity | a festival curator asks: sound, stage history, third-party proof |
| `open-format` | prokit · live · proof | audience · identity | an events buyer asks: reliability, range, references |
| `live-band` | live · prokit · proof | audience · identity | a band is booked on show + logistics + references |
| `original-artist` | music · identity · live | proof · audience | an original act leads with the music and the story |
| `live-electronic` | music · live · identity | prokit · proof | a live act leads with the sound and the performance |
| `comedian-host` | live · identity · prokit | proof · audience | a host is booked on stage presence + persona + reliability |
| `corporate-ceremony` | prokit · proof · live | identity · music | a corporate buyer asks: zero surprises, references, delivery |

**Family-derived, all four:** planet **emphasis order** (`planetEmphasisOrder`) · the **★ / gold ring** (`isPrimaryPlanet`) · the **next-best-step** candidate order · the **coaching line** wording (§8.3). Family resolution is format-led (`familyFor()`: `act.format` decides; genre text only refines the DJ split — the `FESTIVAL_HINT` heuristic is TEMPORARY until the `genre_scene` FK ships, §16.A.1.b/§16.A.6). **FIREWALL (§2.7):** this is INTERNAL prioritization only — it renders exclusively as the i18n guidance wording `radar.genreFocus` ("A useful place to focus in your genre: …") and `genrePrimary` ("Central in your genre"), never a weight, number, rank, %, leaderboard, or buyer-facing weakness. **The G2 guard stays absolute:** no genre/format signal → no family → no emphasis at all — every planet renders equal; a missing genre never produces a guessed emphasis.

**Planet states (bounded rollup — never a count on the face):** **Needs you** (something found is waiting to confirm, OR still empty) · **Developing** (some confirmed, gaps remain) · **Ready** (confirmed, no gaps) · **Locked / "Not needed yet"** (Professional Kit stays locked until Live Show is backed — a sequencing hook, not a judgement). Node marks: ✓ (settled) · ✦ (found dot) · ? / + . Each planet also shows its **plain-language state word** under it (Ready · Developing · Needs you · Not needed yet). Genre-primary planets carry a second gold ring + a ★ and a topline; additive only (non-primary planets keep full opacity/interactivity/order).

**Supporting components:**
- **Constellation threads** — one thread center↔each planet, coloured by live state (amber=Needs you, teal=Developing, lime=Ready, faint=Locked); confirmed threads glow and flow energy inward (growth made visible). Firewall: colour is a state only; geometry is fixed by planet angle, identical for every artist — it grades nothing.
- **Platform ring** ("Where your proof comes from") — one tile per platform **actually detected in this Act's data**; connected = full colour + lime dot, not-yet = greyed + one "+ connect". Per-source hover meaning in plain language (Instagram = "your lineup listings & community", Spotify = "your streaming catalogue", Eventer/Tickchak/Go-Out = your Israeli ticketed events / ticket sales / event listings, etc.). Caption stays honest: "5 sources connected · buyers check these to verify you. A wider automatic scan is in development." META-FIELD LAW: never an invented count/follower number.
- **Milestone journey M1–M8 (G-8 backfill from the build, 18 Jul — ratify: R00).** The full ladder as BUILT (`ArtistDashboard.jsx:MilestoneStrip`; names = §4.1a canon, EN+HE from i18n):
  | # | Waypoint (EN · HE) | Lights when (the real state) |
  |---|---|---|
  | M1 | Arrived · הגעת | always (the artist exists) |
  | M2 | First light · אור ראשון | first evidence item exists |
  | M3 | Radar alive · הרדאר חי | the claim pipeline produced its first claim |
  | M4 | Focused · ממוקד | photo + ≥1 link + ≥3 track-record items |
  | M5 | Backed · מגובה | ≥1 claim verified/supporting |
  | M6 | Published · הפספורט בחוץ | public Passport live (`artist.published`) |
  | M7 | In the market · נראה בשוק | published AND (a share link created OR any buyer request arrived) — reachable without M8 |
  | M8 | Answered · תגובה ראשונה | a real availability request exists |
  **Render:** one horizontally-scrollable row on mobile (bounded internal panel, §10.2 viewport law), wrapping on md+; dot states done (filled) / current (ringed, "you are here") / ahead (hollow), each with an accessible state label. **Firewall (restated as law):** named waypoints + the artist's OWN step states only — never a %, never a bar-as-grade, never a peer comparison; `M1–M8` codes never appear on screen (§5.10).
- **The own-history line (G-9 backfill from the build, 18 Jul — ratify: R00).** "Since {month}: N new confirmations" (`ownHistory()`, §5.10 own-history frame). **Slot:** desktop (md+) = the stage's **bottom-end corner** — the four stage corners each own ONE tenant: scene rail top-center/end · lens rail top-start · next-move card bottom-start · history line bottom-end (the D3 collision law: one tenant per corner, asserted by the L1 overlap check); mobile = an in-flow mono line above the control row, never absolute. **Data:** the artist's OWN confirmed claims in the last ~60 days (`reviewed_at/updated_at`), additive and positive-only — renders nothing when nothing is new. **Firewall:** an own-history count, never a rate, never versus anyone (§2.9); count-based per §5.10 (a % stays behind R-11).
- **Mobile scene rail (G-10 backfill from the build, 18 Jul — ratify: R00; §6 law 2 — designed, not shrunk).** At ≤ md the scene rail leaves the stage and becomes an **in-flow, horizontally-scrollable chip row** above the universe (visible label "Your standing in", then All + one chip per declared scene), `overflow-x-auto`, every chip a ≥44px touch target (`.tap-target`), no wrap, no absolute positioning — which is WHY the D3 collision cannot occur on mobile: nothing floats over the stage at ≤ md; the stage's corner-tenant system is a desktop-only geometry. Scene pick behavior identical to desktop (a reading lens, never a data change, §2.7/G2).
- **Lenses** (the "Show" rail): **All · Needs my review · Ready to publish** — a focus filter that dims off-lens planets to ~22% (reversible), never removes them. "Needs my review" is the review entry.

**INTERACTIONS.** Scene switch (`pickScene`) re-weights which planets carry the ★ (a reading lens on the SAME evidence — never a data change). Lens/filter (`pickFilter`) dims/highlights. Tap a planet (`openPlanet`) selects it → inspector + orbiting source logos. `nextStep` from the bottom dock jumps to the computed next-best action's planet/target. The **next-best-step engine** computes ONE action from real planet state (priority: a genre-primary planet in Needs-you with found items → any planet with found items → a locked planet's unlock → all-lit → publish → else add the missing proof), each carrying a `why` line; firewall-safe (action + reason only).

**EXACT MICROCOPY (samples).** Scene "Your standing in" · lens "All / Needs my review / Ready to publish" · privacy "Private to you — nothing is public until you approve it." · dock eyebrow "Your next move" · sample dock title "Confirm your live-draw proof" + why "One tap turns what we found into a strength on your Passport. Nothing goes public until you say so." + CTA "Continue →". State words: Ready · Developing · Needs you · Not needed yet.

**REGISTRY-DRIVEN NODES (TARGET — the universe-coverage law, 18 Jul).** The planets' node lists above are the BUILT state: ~20 hand-derived nodes (audit D4: "hand-built for the DJ case"). The TARGET is that **every planet derives its nodes from the field registry `docs/registry/F1.csv`** (483 rows · 376 fields · all 18 evidence segments mapped to the 6 planets, per-field `visibility`, `applicability`, freshness, consent, method ceiling; family deltas in `F2-F6-DELTAS.csv`). Rules: (1) the 18 segments render as **node groups inside their planet** (e.g. proof carries Ticketing/Draw · Booking Market · Reputation · Network · Career History as labeled clusters) — no seventh planet; (2) a field appears only when applicable for the artist's family (R/C; **N/A = never shown, never asked, never counted** — §16.A.5b); (3) the registry's `next_action_rule`/`gap_rule` columns feed the coaching layer (§8.3) so recommendations are registry-driven, not hand-coded; (4) content classes the registry adds that the buyer-visible universe must eventually reach: releases & labels · press · testimonials & reliability confirmations · career timeline & milestones · collaborations · brand/visual assets · structured video (gateway clip / full-set) · owned-community channels beyond one band. Wiring order and the ≥038 migration are owner-authorized builds (§16.A.6.a); until wired, this paragraph is TARGET and the hand-built nodes are the honest BUILT state.

**SCANNER HONESTY (§2.8 applied to this screen).** The COLLECT job must never overstate what the scanner is. **BUILT today:** per-evidence Anthropic claim extraction — the artist supplies an item, LOCK extracts and method-labels claims from it. **TARGET (not built):** the multi-source deep scan at onboarding (≈$1 target cost) + cheap automatic incremental re-scans that keep the universe fresh without the artist asking. Wherever the Radar shows or implies scanning (the platform ring caption, the found-tally, empty-scan states), the honest-scope line ships verbatim: **"A wider multi-source auto-scan is in development."** Copy may present the intended discovery experience as vision, but a ✦ found item always states how it was actually found, and no surface claims automatic scanning that did not run. No business case may price or assume the target scan until it is implemented and its cost measured (CLAUDE.md).

**FIREWALL.** Bands + binaries + method labels only. No score/rank/%/gauge/headcount/leaderboard. The sweep is thematic, not a gauge. Scene ★ is guidance, never grading; no signal → no emphasis. The found count appears only inside panel copy ("we found 2 things here"), never as a grading badge on the face.

**DEFINITION OF DONE.** 4-zone desktop; separate mobile Radar-Focus with swipe/pull-down; exactly one primary CTA at all times (inspector XOR dock); six planets with bounded state + state word + node marks; constellation + platform ring reading real (detected-only) data; scene lens that re-weights ★ without changing data; lenses that dim not remove; all motion under `prefers-reduced-motion`; no h-scroll at 390 and 1360; zero score/rank/%/gauge anywhere.

---

### 8.3 The Planet Inspector (the full spec)

**PURPOSE.** On planet select, a SHORT 3-layer action widget that answers the guiding sentence for that one dimension: what it means, what LOCK found, the one thing to do next. It is **not** a long drawer.

**Scene switch behavior.** The scene lens sits top-center and re-weights the ★ across planets; it never overlays the act card and never changes the underlying evidence.

**Planet states surfaced in the inspector:** Found (✦, waiting) · Needs-you · Ready · Private · Published (public on Passport) · Locked / Not-needed-yet. The status chip reads one of: **"Still private"** (default — "Still private. It only helps your Passport after you approve it.") · **"Ready on your Passport"** (public — "This proof is ready. Want to see how a buyer will read it?") · **"Not needed yet"** (locked — "This isn't needed yet — it opens once your live draw is backed.").

**The 3 layers** (desktop right-rail; mobile bottom-sheet):
1. **Layer 1 · Meaning — the COACHING LINE (the UPGRADE job's voice, full spec below)** — one short, scene-aware line: "In {Scene}, {why this dimension matters}." (e.g. "In Melodic Techno, live-room proof matters more than follower count.")

   **The coaching line (owner R00 — canonical example, verbatim):**
   > *"In techno, your Instagram CONTENT matters more than your follower count. Your reels are where a booker decides. Worth strengthening."*

   **Rules (all binding):**
   - **Names the scene** — the artist's actual declared scene ("In techno…"), never a generic "in your genre". No scene signal → no coaching line (G2, §2.7) — the layer falls back to the neutral dimension meaning.
   - **ONE thing** — a single concrete item worth strengthening, never a list, never a second clause of homework.
   - **Says why a buyer cares** — the line carries the buyer's reasoning ("your reels are where a booker decides"), sourced from the node's `why_a_buyer_cares` key (below / §16.A.5b).
   - **Warm, coach voice** (§4.5 / §6.8) — an invitation ("Worth strengthening"), never "weak / missing / behind".
   - **Derived, never stored** — computed at render time from Registry B applicability (§16.A.5b) + the planet's live state + the family emphasis (§8.2). It is wording over existing bounded state; no coaching text, rating, or judgment is ever persisted.
   - **Renders in Inspector Layer 1** — this extends the existing Meaning layer; it is NOT a new surface, panel, or notification.

   **Firewall pair (the line every builder checks against §2.1):**
   - ✅ ALLOWED — *"In techno, content carries more weight than follower count."* (a fact about the scene)
   - ❌ FORBIDDEN — *"Your content is better than most techno acts."* (a peer comparison — a rank in words)
   A coaching line may state what the scene weighs; it may never state where the artist stands relative to anyone else.
2. **Layer 2 · Found proof** — a brief human summary of what LOCK found ("LOCK found fourteen lineup listings under your name and six Resident Advisor bookings.") + the **source-logo ring** (each row = source mark + a **human source line**: **"from your Instagram"** for own accounts, **"from …"** for third-party listings — the raw "Source-linked" label is de-technicalised here while the Passport keeps canon vocabulary) + a per-row tag (Confirmed / Found / Needs you) + the status chip.
3. **Layer 3 · Next action** — the **single primary CTA** + an optional quiet secondary. CTA is computed: if found items exist → "Review your {dimension}" (`confirmTop`) with a secondary "Not mine / later" (`dismissTop`); if locked → "Confirm your live draw first"; if public-ready → "Preview on Passport"; if only empty → the add-source label ("Add a ticket export", etc.); else "Preview on Passport".

**Every node carries `why_a_buyer_cares` (per-field, i18n key — the UPGRADE job at node level).** Each evidence field in Registry B (§16.A.5b) declares a `why_a_buyer_cares` i18n key; the Inspector surfaces it on the node's row/peek so the artist always sees the buyer's reasoning next to the ask — this is what turns a form field into coaching. Examples of the register: WhatsApp group → *"a private room the artist owns and can activate — demand that does not depend on the venue's marketing"* · ticket export → *"the only proof of paid demand"* · technical rider → *"why the night doesn't break"*. Always an i18n key (localizes, never hardcoded), always about **why the buyer cares** — never about how the artist compares.

**Source-logo ring / orbit behavior.** On select, source logos **orbit the selected planet in place** (percent geometry, fanned inward toward the star, ~84° spread, emerging with a stagger unless reduced-motion). Confirmed logos carry a ✓; a confirm "blooms" at the planet centre with a small celebration (`justLockLogo`). Tap/long-press a logo → its method + human source line. Locked Kit shows no orbiting evidence.

**Found-row content law.** Every found row shows, BEFORE the confirm button: (1) the exact claim wording, (2) the concrete source (method label + identifiable reference, e.g. "instagram.com · listings #3–#16"), (3) the honest proves / doesn't-prove line. The button names what it confirms.

**Confirm → destination honesty.** A confirm turns ✦ found → ✓ confirmed on one tap. Only **verified/supporting + passport-ok** claims reach the public Passport; everything else stays private and **says so**. The receipt names *what* landed *where* ("Added to your Passport" vs "Saved privately") with a **7s undo**. A "this isn't me" reject (`dismissTop`) is **recorded, not deleted** (name-ambiguity honesty). Nothing is `artist_approved=true` until confirmed.

**Inline edit widgets (per-field DoD — the D1 fix).** Every missing/editable proof opens an **inline mini-widget in the smart panel** — NOT a new page. Per-field Definition of Done: **empty = friendly helper · typing = active border · invalid = human explanation · saved = visible confirmation · undo · loading · error-retry.** Confirmed radar nodes must expose an "edit" affordance that re-opens the fill widget pre-filled. Every field is QA'd with: empty · typing · long value · Hebrew · URL · invalid.

**MOBILE.** The inspector is a bottom-sheet with a grab handle; it holds the CTA only when open; a scrim + `closeSheet` + pull-down close it; swipe cycles planets.

**FIREWALL.** No score/rank/%/gauge; no "missing/weakness" language. Status is one of the bounded chips. The de-technicalised source line never leaks a raw DB state.

**DEFINITION OF DONE.** 3-layer inspector (Meaning/Found-proof/Next-action); orbiting source logos with method-on-tap; found rows carry exact wording + concrete source + proves/doesn't-prove before the button; one primary CTA + one quiet secondary; confirm bloom + named receipt + 7s undo; reject records, doesn't delete; inline edit widget with the full per-field DoD; mobile bottom-sheet with swipe + pull-down; reduced-motion respected.

---

### 8.4 Artist Passport (`/artist/passport`) — multi-view, edit vs buyer-preview

**PURPOSE.** The artist previews **exactly** what a buyer sees — the proof a booking manager reads before putting their name on the night — in each buyer's language, and controls publish/share. (In the real app, `/artist/passport` redirects to the public `/passport/:id` so the artist previews the true Buyer view.)

**DESKTOP & MOBILE layout.** Page head with H1 "Passport" + a purpose line + the **unified view-switcher chip** (U34). Below: the standing row (Draft/Live), the dark hero island, the "what this viewer cares about" line, the public-frame reassurance, the view eyebrow, the evidence ledger (lead + support proof cards), a ready row, and a private-gaps bar. Single column; the hero is a `.dark-island`, everything else is light.

**The multi-view / faces (U22).** ONE evidence pool, **four reads**, re-ordered per face — never four documents. Views: **Booker · Representation (manager) · Production · Private & corporate.** Each face declares what that viewer cares about + a lead proof + support proofs:
- **Booker** — "A booker asks one thing: will they fill the room and show up like a pro?" lead = draw ("300–800"), support = rebook, sells-tickets.
- **Representation** — "A manager weighs the trajectory: is this real enough to put on my roster?" lead = performance history, support = lineup frequency, confirmed draw.
- **Production** — "Production needs zero surprises on the night — set, region, paperwork." lead = the ready-on-the-night binaries, support = set position, rider.
- **Private & corporate** — "A private or corporate host asks: is this a safe, name-worthy booking?" lead = recognisable stages, support = invoice-ready, confirmed draw. Language is warm, non-industry.

**The unified view-switcher (U34).** The **same dropdown-chip pattern as the Radar scene switch**, placed in the **page header** (a shared component/CSS, never in-card tabs). Chip label: "**Viewing as: {view} ▾**". Popover header "Show this Passport as", radio rows (Booker · Representation · Production · Private & corporate) with a check on active, note "Each buyer weighs different proof first."

**COMPONENTS.** View-switcher chip · standing row · dark hero (photo + veil + "LOCK · Verified" seal + name + one-line positioning + source logos) · "what {noun} sees" cares line · public-frame line · view eyebrow · evidence ledger of proof cards (each: source logo · big band OR claim · context · method chip · "Reviewed {date}") · ready row of lime binary chips · private-gaps bar.

**Edit vs buyer-preview split (target, Codex P0).** The Passport screen must clearly separate **owner-edit** (what the artist controls/publishes) from **buyer-preview** (the exact public read). Edits happen via the Radar's inline widgets / the Act-Identity Editor (§8.6), not by typing into the public preview. A **publish/share widget** is new work.

**De-technicalised provenance (U23).** Remove technical badges ("✓ Buyer view public", "✓ Verified professional profile", "✓ 2 published"). Provenance is shown via the method chips + the "LOCK · Verified" seal (a brand lens emblem, not a bare checkmark), never a technical status row.

**STATES.**
- **Draft** — standing "Draft — only you can see this" + a "Publish Passport" primary. Private-gaps bar visible to the artist only.
- **Live/published** — standing "Live for buyers · refreshed {date}"; inspector/radar reflect public-ready.
- **Per-view** — the ledger re-orders per selected face.
- **Gaps bar** — collapsed ("＋ 1 private item to add · only you") / expanded (explains the item; "Gaps never appear on a buyer's Passport — adding one builds strength, it never removes a penalty." + an "Add it" ghost).

**INTERACTIONS.** `toggleView` opens the popover; `pickView` switches face; `publish` publishes; `toggleGaps` expands the private item; `goEvidence` opens the add flow; the CTA on a ready view is "Preview on Passport".

**EXACT MICROCOPY.** Purpose line: "This is the proof a booking manager reads before they put their name on your night — your real strengths, in each buyer's language, never a demo reel." · public-frame: "This is your public Passport — **exactly what {noun} sees.** Nothing here reveals a gap." · draft: "Draft — only you can see this" + "Publish Passport" · live: "Live for buyers · refreshed 12 May".

**FIREWALL.** Verified strengths only; draw as bands, readiness as binaries, each with a method chip; no gap ever shown on a buyer face; **no firewall strip / no narration** (U33 — remove the `.fwstrip`, §2.2); no score/rank.

**DEFINITION OF DONE.** Four faces from one evidence pool; unified header view-switcher (shared with Radar scene switch); purpose line present; draft/live standing with publish; de-technicalised provenance (method chips + seal, no technical badges); gaps bar artist-only; owner-edit vs buyer-preview visibly separated; no firewall strip; light surface with a single dark hero island; one viewport for the hero.

---

### 8.5 Artist Access — "Who can act for you" (`/artist/access`) (U31)

**PURPOSE.** Surface the ArtistAccess grant in the artist UI: the artist grants a trusted manager/representative scoped, revocable help with bookings — **never** handing over the account, **never** ownership.

**DESKTOP & MOBILE layout.** Page head: H1 "Who can act for you" + subtitle + an "Invite someone" primary. Below: a list of representative cards (or an empty state). Single column.

**COMPONENTS.** Rep card (`repCard`): name · org · state pill · scope pills · actions. Scope labels: **See my Passport** (`see`) · **Reply to date requests for me** (`reply`) · **Help keep my Passport up to date** (`manage`).

**STATES.**
- **Active** — "Active · {since}"; actions "Change what they can do" + "End access".
- **Pending** — "Invited — waiting for them to accept"; action "Resend invite".
- **Ended** — "Access ended"; "No longer has access", no actions.
- **Empty** — "No one has access yet. Invite a manager you trust to help handle date requests."

**INTERACTIONS.** `accessInvite` (invite) · `accessResend` · `accessEdit` (change scopes) · `accessRevoke` (end access). Reachable from the account hub ("Who can act for you") and from the Account screen.

**EXACT MICROCOPY.** Subtitle: "People you've allowed to help with bookings. This never hands over your account — you decide what they can do, and you can end it anytime."

**FIREWALL / entity law.** Never "grant"/ownership language toward the artist; access is consent-based, scoped, revocable by either side.

**DEFINITION OF DONE.** Invite/active/pending/ended/empty states; scope pills reflecting real scopes; revoke + edit + resend; reachable from hub + account; no ownership language.

---

### 8.6 Artist Account / Act-Identity Editor (`/artist/account`, target `/artist/act/edit`) — resolves D1

**PURPOSE.** The artist edits the facts a booking manager reads first, per active Act, with field-level save — the missing edit surface (D1, the owner's reported broken screen).

**LAYOUT.** Page head: eyebrow "◆ Identity & Story · Act" + H1 "Your Act & identity" + Act chips (current Act + "＋ Second act"). Subtitle. An identity grid of editable rows. A "Who can act for you" card linking to §8.5.

**COMPONENTS.** `idRow` per field: **Stage name** (serif display) · **City** · **One-line positioning** (textarea, 120-char, live counter) · **Genre**. Each row: label · value display OR inline input · a "Public on Passport" chip · Edit/Save/Cancel.

**STATES / per-field DoD.** Display (value + Edit) · Editing (active input + "● Editing" dirty chip + Cancel + "Save — right here") · Saved ("✓ Saved" chip). Live char-count on the textarea. Prefilled from the Act. Field-level save (each row independent); ≤3 clicks from the Radar; per active Act.

**EXACT MICROCOPY.** Subtitle: "These are the facts a booking manager reads first. Edit and save each on its own — nothing publishes until your Passport is refreshed." · helper "Your genre also lights the planets that matter most in your world. Draw fields save as bands only." · access card "Who can act for you" + "Let a manager you trust help with date requests — you decide what they can do, and you can end it anytime."

**FIREWALL.** Draw fields save as **bands only**. "What becomes public" chip on each field; nothing publishes until the Passport is refreshed.

**DEFINITION OF DONE.** Inline-editable stage_name · city · genre · `act.format` · positioning · photo · links; field-level save with dirty/saved/error; live "what becomes public" chip; prefilled; per active Act; ≤3 clicks from the Radar; confirmed radar nodes re-open this pre-filled.

---

### 8.7 Buyer / Public Passport (`/passport/:id`) — the 60-second decision page

**PURPOSE.** THE product surface for the buyer. A recipient-safe, **no-login** page that answers **fit · trust · readiness · availability** in the first viewport, in the buyer's language, and offers one action: check the date. This is the Gate-critical buyer surface.

**DESKTOP & MOBILE layout.** A full page (`.pp`): dark hero island (photo + veil + LOCK wordmark) → id block (eyebrow "LOCK · FOR YOUR EVENT" · genre/active-since line · name · one-line positioning · persona toggle · "No login needed" reassurance) → body sections (proof-of-draw / career-proof grid · performance track · booking-readiness binaries · the CTA) → footer. Mobile: single column, sticky availability CTA.

**COMPONENTS.** Persona toggle (**Booking a show** / **Representing**) that changes copy + CTA · proof cards (big band OR claim + context + method label + reviewed date) · performance track rows (each source-linked) · readiness chips (binaries only) · primary CTA + sub-line.

**Non-pro language (target — broaden beyond "booker").** The buyer surface must read for **all** demand segments (private/corporate/planner), not only pros. Evidence is phrased buyer-readable ("Can this artist carry a room?" not "Proof of draw"). Booking-vs-representing changes the copy and the CTA. The private/corporate register is warm and non-industry.

**The private/corporate register — concrete vocabulary (D9, closes a real blind-spot).** A corporate HR planner or a wedding couple does **not** know what "Club Headliner" or "Resident Advisor" means; they care about *professionalism, fit, and logistics*. Same evidence pool (§5.10), re-worded per face:
| Club/pro face says | Private/corporate face says |
|---|---|
| "Club Headliner · fills 300–800" | "Comfortable for **100–300 guests**" |
| "★ Producer-confirmed" | "**Venue-verified** professional" |
| "Invoice-ready · rider on file" | "**Turnkey booking** · issues invoices, insured, own sound" |
| "Melodic techno · RA-listed" | "**Lounge → high-energy** range · reads the room" |
The switch is **vocabulary + emphasis only**, never different facts (firewall). The private/corporate warm register is **OWED** (D9) until this flow is built.

**Cold-start empty-state framing (prevents new-artist churn).** A brand-new Act with zero `producer-confirmed` claims must **not** read as "empty/weak/unverified" to a buyer or feel hopeless to the artist. Instead, **elevate evidence-supported signals** (public footprint via §9.8/§9.9 Door 2) into a warm **"Rising / building momentum"** framing — "Verified footprint" rather than "Unverified." The artist is *starting*, not *failing* (voice law §4.5; gaps-are-invitations §6.8). On the artist's Radar, empty nodes show as **soft ghost/skeleton nodes** (§17.B.11) — "where your proof will live," an exciting build-up, never a dead canvas.

**STATES.** Persona = booking (section title "Proof of draw"; CTA "Check availability for your date") · persona = rep (title "Career proof"; CTA "Discuss representation"). Hover a proof-unit → a source peek (where-it-comes-from + what-the-label-means).

**EXACT MICROCOPY.** eyebrow "LOCK · FOR YOUR EVENT" · reassurance "**No login needed.** This is the public Passport — read it, then check the date." "Under a minute" · draw cap "Figures shown as band — no exact headcount" · readiness cap "Binaries only — ready or not shown" · CTA sub "No commitment — this only asks the artist about the date." · sample proofs: "300–800 · Headline draw · own-name nights, Tel Aviv · ★ Producer-confirmed · Reviewed 12/05/2026"; "Sells tickets to their own name · Yes · Evidence-supported"; "Lineup frequency · Regular · Source-linked"; "Price / guarantee band · ₪8,000–20,000 · Artist-declared".

**FIREWALL.** Verified strengths only; draw as bands, readiness as binaries, each with a method label; no gap; no score/rank/prediction. **Remove the `.fwstrip` footer** (U33 — the prototype's leftover strip is a violation; §2.2). Peer bands are **not** shown buyer-side unless method-safe and requested.

**UNIVERSE TRANSLATION (TARGET — the owner's 18 Jul ruling frame + old-canon recovery; awaiting the T-49 taste brief before design).** The owner's diagnosis stands as law: *the Passport must translate the Radar universe — everything confirmed and improved — to other people; today it reads as a headcount output because only draw bands + a community band are wired.* The recovered canon (B4-35.50 A15/A11 + the lens structure of the superseded Universal-Passport vision — structure adopted, its scores/predictions remain REJECTED §2.9):
1. **Proof Unit anatomy (atomic law):** every Passport item = **claim + context + method label + reviewed date** — never a bare number/band row. (§8.7's proof cards already carry this; it becomes the rule for ALL content classes below.)
2. **The 30-second proof story (section hierarchy):** identity → attributed-draw Proof Units → track record → **catalogue & releases** → **audience context** → **booking/admin readiness** → **supported references (testimonials · reliability confirmations · press)** → one sticky CTA. Sections render only when supported content exists (RENDER LAW) — an empty class disappears, it never shows as a gap.
3. **Content classes to wire** (all documented passport-eligible in `docs/registry/F1.csv`; ~84 of 96 eligible fields unreached today): releases & label credits · gateway live clip / full-set video · press & career milestones · testimonials & published reviews · reliability confirmations (rebook / invited-back) · industry affiliations · brand assets (press photo set) — each as method-labeled Proof Units, never as self-authored EPK prose. **This is the not-an-EPK answer: same content classes, provenance on every item.**
4. **Per-viewer lenses:** the four faces (U22) upgrade from re-ORDERING to per-viewer **selection + language** — the buyer face leads with risk-relief ("carries a room, shows up like a pro"), the representation face with trajectory, private/corporate with warm non-industry safety. Same evidence pool, translated — never four documents.
5. **Minimum credible-Passport gate (publish law):** publishable only with ≥2 supported Proof Units, at least one live-demand/commercial; identity + bio + media + streaming context alone are never publishable. Server-enforced at publish.
6. **Interactivity depth (buyer side):** the professional action set widens beyond one request — check availability · request price/details (commercial) · save privately · forward to decision-maker · future fit · request specific proof (diagnostic) · not-fit (close) — every action a recorded ProfessionalReaction, only commercial actions create an availability request; plus per-Proof-Unit source-peek, incorrect-information report, and a no-guarantee route. Reaction-to-artist stays method-safe text (§2.5).

**DEFINITION OF DONE.** First viewport answers fit·trust·readiness·availability; no-login; persona toggle changes copy + CTA; source-peek on proof units; sticky/compact availability CTA; non-pro readable; no firewall strip; no score/rank.

---

### 8.8 Availability request + receipt (`/passport/:id/request` → `/sent`) — the Gate action

**PURPOSE.** The buyer asks the artist about a date — **THE Gate reaction event** (`availability_request_created`). Deliberately short; no commitment.

**LAYOUT.** A focused form page (LOCK wordmark + back link): H1 "Availability check — {name}" + sub + form → primary "Send request". On submit → a receipt page.

**COMPONENTS.** Fields: Full name (required) · Organization/company · Event date · Location · **Expected audience (range — a select, pre-set to Passport bands)** · **Budget (range — a select)** · Message. Bands are pre-set from what the Passport showed — the buyer **never types an exact headcount or fee**.

**STATES.** Form (default) · Sent → receipt card ("✓ Request sent", "{artist} will get back to you soon.", a keep-box with the passport URL + Copy, and a back-link to the passport).

**EXACT MICROCOPY.** sub "Fill in the details and the artist will get back to you. No commitment." · CTA sub "Bands are pre-set to what the Passport showed — you never type an exact headcount or fee." · receipt "SABLE will get back to you soon. Thank you, Dana." + "Keep the passport link for your file — the evidence stays available there." + "Copy".

**FIREWALL.** Audience & budget are **ranges/bands via selects**, never free-typed exact numbers.

**DEFINITION OF DONE.** Required-name validation; band selects pre-set from the Passport; submit → receipt with copyable passport link + back link; fires the Gate reaction event; no exact-number entry.

---

### 8.9 Source-Confirmer (`/confirm/:token`) — warm one-minute confirmation

**PURPOSE.** An **accountless** person confirms exactly ONE claim via a bounded magic link — the mechanism that upgrades a claim to **Producer-confirmed**. The entire correct surface is `/confirm/:token`: no nav, no switch, no home, no dashboard. **NEVER a workspace shell** (D3 — retire any `/producer` shell).

**LAYOUT.** A single centered card (`.confirmer-wrap`): eyebrow "One-statement confirmation · מאשר-מקור" → H1 "{Asker} asked you to confirm one statement." → reassurance → asker chip → the **statement card** (the exact one claim + context + a two-column "what confirming means / what does NOT happen") → three large choices → a closing reassurance.

**COMPONENTS.** Asker chip (initials + name + Act/genre + "is asking") · claim card (◆ "The statement you're confirming" + the quoted statement + context line) · the pos/neg two-column explainer · three choice buttons · done state.

**STATES.**
- **Ask** — three choices: **"Yes — this is accurate"** (primary; "Confirm exactly as written · adds PRODUCER-CONFIRMED") · **"Partly right — needs a fix"** ("Confirm most of it, note what to correct" — inline correction) · **"No — this isn't accurate"** (warn; "Records a decline · it won't show as confirmed").
- **Done** — "Recorded — thank you", "Your confirmation now appears on this one statement of {artist}'s Passport as **PRODUCER-CONFIRMED**. You're done — nothing else is needed." + chips "✓ Producer-confirmed" · "Revocable anytime" + a "Replay this link" ghost.

**INTERACTIONS.** `cfConfirm` (Yes / Partly) · `cfDecline` (No) · `cfReset` (replay). Name-visibility control + legal detail live in an expandable "What happens after I answer?" (target).

**EXACT MICROCOPY.** "No account needed. Your reply applies to this statement only — you won't be signed up for anything." · pos column "You verify this one statement is accurate. / It gets the **PRODUCER-CONFIRMED** label." · neg column "No account, no ongoing role. / Never a score or rating. / {artist} controls publishing. / Revocable anytime." · closing "This confirmation refers to the specific statement above only — never an endorsement, never a score." · target tagline "One detail. One answer. No account."

**FIREWALL.** Confirms this one statement only — never an endorsement, never a score/rating. Adds only the canon **Producer-confirmed** label. Revocable anytime; the artist controls publishing.

**DEFINITION OF DONE.** Single `/confirm/:token` surface (no workspace shell); the exact one statement shown with context; three warm choices incl. inline "partly" correction; done state with revoke route; no login, no nav, one decision; legal moved to an expandable.

---

### 8.10 Representation — Roster cockpit (`/representation/roster` + `/reqs` · `/radar` · `/team`)

**PURPOSE.** A roster **cockpit** (not a CRM table): "who needs help today", each act a card with what changed · why · one action bound to that artist. Access is a grant the artist can revoke — never ownership.

**LAYOUT.** Page head: eyebrow "Artist-Manager lens · {n} acts" + H1 "Roster" + "＋ Invite artist". Subtitle. A stack of artist action cards (urgent ones flagged).

**COMPONENTS (roster action card).** Avatar · artist + Act tag (e.g. "Psytrance act") · owner + city + "Public passport live" · consent chip · a **found/what-changed line** with a `why` ("LOCK verified a new press mention from Time Out Tel Aviv." + why "Fresh third-party proof strengthens the public passport — buyers trust an outlet over a self-claim.") · a strip of method/band chips · the ArtistAccess grant scopes (view/upload/publish) · **one** next-action button (Publish update / Answer request).

**STATES.** Default card · **urgent** card (a buyer is waiting — "A buyer is **waiting on you** — Barby Club asked about a Feb date." + why "An unanswered availability request beats everything else on the roster. Answer it first.") · action-taken (chip "✓ Update published" / "✓ Availability sent"). Filters (target): urgent / ready / needs-approval.

**Other Representation screens.** `/reqs` = Requests inbox (availability requests routed to acts; answer/forward/decline, logged as grants) · `/radar` = combined Roster Radar across consented acts · `/team` = seats/roles/scopes ("Access to an artist is a grant the artist can revoke — never ownership").

**FIREWALL / entity law.** No roster **rank**; never-rank-roster pattern. Reaction insight = method-safe text only. No CRM tables. ArtistAccess = grant, revocable, never ownership.

**DEFINITION OF DONE.** Each row = one artist-bound card (what changed · why · one action); urgent state; publish/answer actions mutate the row; consent + scope shown; no rank; no ownership language.

---

### 8.11 Production — Lineup board (`/production/events` + `/reqs` · `/workspace`)

**PURPOSE.** An event/lineup **board** (not rows): each event holds lineup slots; fill a slot by requesting availability or confirming a known act. To *book*, Production acts as a Buyer (opens a Passport → availability request).

**LAYOUT.** Page head: eyebrow "{Company} · משרד הפקה" + H1 "Events" + "＋ New event / open slot". Subtitle. Event cards, each with a header (name · date) and **timeline slots top-to-bottom by set time**.

**COMPONENTS (lineup slot card).** Slot label + set-time (e.g. "Closing set · 01:00–02:30") · slot state · one CTA per slot · suggested-act cards with a fit reason (target).

**STATES (per slot).** **Open** ("Open slot · needs an act" → "Confirm for this slot") · **Requested** ("SABLE · availability requested" → chip "Awaiting reply") · **Confirmed** (chip "✓ Confirmed · {act}"). New-event created → a Draft card ("New event created" + "add a date and open your first lineup slot"). NOTE: event/lineup **creation** UI is target (currently view-only in the real app).

**Other Production screens.** `/reqs` = requests you sent to artists + replies (confirm a slot the moment an artist says yes) · `/workspace` = team/seats/event access ("Production reads Passports; it never owns an artist's evidence").

**EXACT MICROCOPY.** subtitle "Every event holds lineup slots. Fill a slot by requesting availability or confirming an act you already know." · workspace "Production reads Passports; it never owns an artist's evidence."

**FIREWALL / entity law.** Production never owns an artist's evidence; it reads Passports. No score/rank of acts; suggested acts carry a fit *reason*, never a rank.

**DEFINITION OF DONE.** Event board with time-ordered slots; open/requested/confirmed slot states; create-event/open-slot action; one CTA per slot; Production-as-Buyer path to a Passport; no ownership of evidence.

---

### 8.12 Admin / Operator cockpit (`/admin`)

**PURPOSE.** An internal operational **cockpit** (not a pale dashboard): the Gate as hero metric, a visual funnel, AI-cost with budget, publish freshness, risk — with every metric's **source event · timeframe · demo-excluded** made explicit. Internal LOCK team only; never in public signup.

**LAYOUT.** Page head: eyebrow "Pilot cockpit · friends-cohort test" + H1 "Business overview" + a "LIVE" chip. A "Gate" row of 3 tiles → a Gate-condition line → a two-column grid (funnel · AI-cost ledger + more).

**COMPONENTS.** **Gate tiles** (reaction / intent / verified-pay, each with the exact source event) · **pilot funnel** (signup → onboarded → radar_opened → evidence_added → claim_confirmed → passport_published → share_link_created → availability_request; counts only, with a fill bar) · **AI cost ledger** (Anthropic extraction, spend vs hard cap, runs/30d) · publish-freshness · risk tile. Every number carries "from a bounded operator read-model · demo activity excluded · through {date}".

**STATES.** Gate met (reaction ✓ + verified pay ✓) vs not. Intent (`payment_reference_created`) is willingness-to-pay, **never** counted as revenue.

**EXACT MICROCOPY.** subtitle "Every number from a bounded operator read-model · demo activity excluded · through 14 Jul 2026." · Gate line "✓ **Gate condition reached:** one booking manager reacted to a real Passport AND one paid. Intent (2) is willingness-to-pay, never counted as revenue." · Gate tiles: "reaction · availability_request_created · qualified buyer" / "intent · payment_reference_created · NOT a payment" / "verified pay · entitlement_activated · by Maria".

**FIREWALL.** Funnel = the user's OWN product milestones (counts of events), never a grade of any artist. Demo-excluded badge consistent. Intent ≠ revenue.

**DEFINITION OF DONE.** Gate hero tiles with exact source events; visual funnel (counts only) with source/timeframe/demo-excluded stated; AI-cost with budget-left/alert; publish freshness (stale vs unpublished); risk tile; internal-only.

**BUILT-vs-PENDING per tile (audit T-55 · 18 Jul 2026 — updated in place):**
| Cockpit element | Status | Source events |
|---|---|---|
| Gate tiles ×5 (views · reactions · requests · intent · verified-pay) | ✅ **BUILT, live source events**, demo-excluded (T-52 filter) | all FIRING except intent (dormant behind the pay flag, M-8 — fires on flip) |
| **Retention tiles ×2** (returning accounts · repeat Passport opens) | ✅ **BUILT (T-55, owner priority)** — `fetchRetention()`, demo-excluded, own load/error/retry | `login` (incl. `session-restore`) · `passport_view` + `return_visit` — FIRING |
| Stat counts (artists · published · requests · claims) | ✅ BUILT | table reads (inventories, not demand metrics) |
| Pilot funnel bar (signup → … → availability_request) | ⏳ PENDING build — its source events mostly FIRE already (§14.1.5); wiring only | canon events |
| AI-cost ledger · publish-freshness · risk tile | ⏳ PENDING build | server refresh-quota data exists; tiles not rendered |

---

### 8.13 Shared / supporting screens
- **Evidence capture (`/artist/evidence`).** A guided add flow reached from the Radar: pick a claim → paste a public link → honest "AI is labeling your evidence" (skeleton) → the extracted claim returns as a **found node** with its method label + concrete source + proves/doesn't-prove → "Confirm & add to Radar". Target: proactivity inversion — "Connect — we'll pull it" leads; manual = SELF-REPORTED fallback. Honest note: "LOCK labels the sources you add, one at a time. A wider multi-source scan is in development." FIREWALL: nothing publishes until confirmed; pulled media is checked against its source, never re-hosted as a claim.
- **Claim review** — approve/edit/route extracted claims; primary per-card action = "send to a מאשר-מקור to upgrade to Producer-confirmed." (Reachable as a Radar review panel; do not leave orphaned in nav — D6.)
- **Booker home (`/discover`)** — a signed-in professional buyer's thin home: a link-resolver + explainer + one action + a sample-passport escape hatch. (Buyers otherwise need no login.)
- **Auth / redirectors** — login, signup (auto-confirm with a signInWithPassword fallback), reset/forgot, invite-accept (`/invite/:token`). Deep-link `state.from` must be honored on login.

---

## 9. AI / Scan Intelligence

Three intelligence pillars render method-safe on the Radar. **Honesty firewall (§2.8) governs this whole section.**

### 9.1 Pillar (a) — SCAN (what LOCK found)
- **BUILT:** per-evidence Anthropic claim extraction (`server/index.js` → `processor.labelWithMethod`). One artifact at a time → a **bounded status** (verified / supporting / self-reported / not-assessable) + claim_type + value + reason. Firewall enforced twice: the system prompt prohibits score/percentile/rank/exact-count; a `#sanitize()` step forces the bounded status. A deterministic stub fallback keeps a batch alive without an API key. The Radar's ✦found nodes render this pipeline's output.
- **TARGET (not built — zero external-integration code today):** a **multi-source deep scan at onboarding**. Flow: consent (`thirdparty-evidence`) → Claude generates **8–12 locale-aware queries** → **Tavily** search+extract → `claude-opus-4-8` extracts candidate claims per source with `same_person_confidence` + source + date + proves/doesn't-prove → dedup → appears as ✦found → the artist confirms (or "this isn't me" → recorded, not deleted). Cost target ≈ **$1/scan** (~$0.15–0.25 measured range in the spec). **Incremental re-scans** on-demand or ≤monthly (`last_discovery_scan_at`). Needs migration 028+ (`source_type='discovered'`, `person.full_name_<locale>`, `artist.country/languages`), a `POST /api/discovery-scan/:actId` endpoint + a Vercel-Cron chunked worker writing `processing_job`. **Gated on:** counsel sign-off + a real Anthropic key + **operator hand-QA before user-facing.** Honest coverage: ~50–60% of public findings auto-discoverable; ~15–20% (legal structure, management, label) never.

### 9.2 Locale-aware discovery (owner directive — NOT hardcoded HE/EN)
Discovery adapts to the artist's **country and the languages spoken there** (detect from locale/input, or ask once). Query generation + name transliterations run in that market's languages: **Israel = Hebrew + English + Russian**; Germany = German + English; France = French + English; default = English + the country's primary language(s). The **platform set is locale-aware**: Israel → Eventer · Tickchak · Go-Out · local promoters, **plus** the global set (Spotify · Instagram · Resident Advisor · SoundCloud · Bandcamp · YouTube); other markets → their local ticketing/listing platforms + the global set. (The onboarding scan animation in §8.1 shows exactly this Israel mix.)

### 9.3 Pillar (b) — INDUSTRY COMPARISON (method-safe context)
- **BUILT:** genre-emphasis guidance — `genreWeights.js` marks which planets "matter most in your genre" as an **additive ring + words only** ("★ buyers in your scene look here first"), firewall-clean (never a number/rank/%/leaderboard/badge). This is genre-normative guidance, not a peer comparison.
- **TARGET (RAD5, roadmap):** true peer/industry **bands** ("what does a techno DJ at your stage usually show?") as **bands + method labels only, never a rank/percentile.** Nothing compares an artist to a peer cohort today; firewall-review required before any cohort context renders, and **never buyer-side** unless method-safe and requested.

### 9.4 Pillar (c) — RECOMMENDATIONS (reasoned next-best-action)
- **BUILT:** the rule-based next-best-action engine (`pickNextAction` / `nextBestStep`) derives ONE clearest move from real state, each carrying a `why`; the milestone journey M1–M8 frames progress (no %, no bar-as-grade).
- **TARGET:** reasoned, evidence-linked recommendations that cite the scan + comparison ("*found a Selector listing — confirm it to fill your Proof planet, which buyers in techno weigh first*"). Partly reachable by extending the built engine.

### 9.5 Provider fallback + firewall preservation
A provider fallback may use a **cheaper tier with narrower extraction**, but it **must preserve the evidence firewall** (bounded status, no score/rank/count) and **disclose the narrower scope**. No business case may price or assume the deep scan until implementation and measured cost are verified.

### 9.6 Render principle for all three pillars (method-safe)
scan result = a **found card** (source + proves/doesn't-prove + confirm/reject); comparison = a **muted mono caption of bands + method labels**; recommendation = the **one lime next-action card** citing the finding. **No gauge, no cohort number, no rank — ever.** Reaction insight back to the artist = method-safe text only.

### 9.7 Intelligence at scale (cost & honesty controls — TARGET, honest)
AI cost is the biggest variable expense post-Gate (§16.B.10). The controls below are **TARGET architecture** (not built) and must not be priced on until measured:
- **Cost monitoring + spend caps** — per-artist and global budget caps with alerting (a basic server spend cap exists today, §13.5.4; a real cost-monitoring view is OWED).
- **Caching + dedup-by-hash** — never re-extract identical evidence; cache scan results; incremental re-scans only on change (the "cheap automatic re-scan" target, CLAUDE.md).
- **Model versioning + provider fallback** — pin the extraction model; a cheaper fallback tier is allowed **only if it preserves the firewall and discloses the narrower scope** (§9.5).
- **Human-review queue** — a low-confidence or disputed extraction routes to an operator (the ops console exists; the queue is OWED).
- **Firewall at volume** — none of the above may introduce a score/rank/cohort number; scale changes cost, never the firewall.

_Honesty: the deep multi-source scan itself is TARGET (§16.B.10); these scale controls are the operational layer around it, equally unbuilt. Full high-volume engineering (sharding, replicas, DR) is reserved in §19.2._

### 9.8 Smart-link parsing — instant value on paste (solves the cold-start)
The cold-start risk (§16.B.14 R2): an artist pastes a link and the extraction finds little, and onboarding stalls. Fix — on paste, immediately surface **metadata** so a "found" node appears at once:
- Instagram → handle + bio + recent captions (potential gig mentions); follower count **as a BAND only, never exact**.
- Spotify → monthly-listeners **band** + top cities (touring-readiness hint).
- YouTube/SoundCloud → title/description + upload cadence.
**Firewall (non-negotiable):** every number surfaces as a **band**, never an exact figure, never a score; a metadata hit is a **`found` node the artist must confirm**, never an auto-verified claim. This is fast metadata, not the deep scan — labeled honestly ("found on your public Instagram — confirm it's you"). TARGET (not built); the honest wedge that makes onboarding feel alive without over-claiming.

### 9.9 The four data doors (provenance model → method labels)
Every piece of evidence enters through exactly one **door**, and the door determines the method label the buyer sees — this makes provenance explicit and is the anti-gaming backbone (§16.B.15):
| Door | Example | Trust | Friction | Buyer-facing label |
|---|---|---|---|---|
| **1 · Consented API** | Spotify, SoundCloud (OAuth) | high | medium | "read via {platform} (your connected account)" |
| **2 · Public footprint** | RA, Instagram (public, consent-gated scan §15.2) | medium | low | "found on your public {platform}" |
| **3 · User upload** | ticket export, settlement sheet, contract PDF | high | high | "you provided this" |
| **4 · Human vouch** | Source-Confirmer (venue/promoter) | highest | medium | "confirmed by {role}" — the golden standard |
**Rule:** the UI names the door, not just "source-linked" — "confirmed by the venue" ≠ "found on public Instagram." Door 2 (public scraping) carries the highest legal load and only fires under the public-footprint consent scope (§15.2). Doors map 1:1 to the canon method labels (§4.4); no new label vocabulary. *(Door 1 OAuth ingestion + Door-3 mobile-camera capture are TARGET; Door 4 is BUILT; Door 2 is the consent-gated scan, partly TARGET.)*

---

## 10. QA / Acceptance

### 10.1 Firewall scan (blocking — run on every screen)
Grep/scan the rendered UI and copy for any of: score · percentile · rank · % as a grade · gauge · prediction · exact headcount · follower count · leaderboard · position/placement number · a firewall-narration strip. **Any hit blocks release.** Confirm draw shows only as bands, readiness only as binaries, and every proof carries a canon method label. Confirm reaction-to-artist copy is method-safe text only.

### 10.2 Mobile-first checklist (390px)
One job per view; bottom nav present; Radar = separate Radar-Focus (zoom, swipe between planets, pull-down to close, logo ring, one-action drawer); bottom sheets not new pages; exactly one primary CTA; no horizontal scroll; hub reachable (avatar-only) in every mode; 44px tap targets; primary workflows fit one viewport.

### 10.3 Desktop checklist (1360px)
4-zone Radar canvas + inspector rail; one nav only (not top + rail); no duplicated titles; identity chrome = 2 elements (brand + hub); ≤2-step workspace switch; one primary CTA; inspector holds the CTA (dock hidden); no horizontal scroll; 0 console/page errors.

### 10.4 Per-field DoD (every editable/inline field)
empty = friendly helper · typing = active border · invalid = human explanation · saved = visible confirmation · undo available · loading state · error-retry. QA each field with: empty · typing · long value · **Hebrew** · URL · invalid. Confirmed radar nodes expose an edit affordance that re-opens the field pre-filled.

### 10.5 Contrast (WCAG 2.2 AA — P0)
Body text ≥ **4.5:1** minimum; **prefer 7:1**. Use only the approved AA pairs (§5.5); never place critical labels/validation/CTA on the `faint on app bg` pair (3.90, decorative only). Fix black-on-black input fields; token the text-field area. RTL/LTR both native (HE + EN; Russian + German next); i18n keys complete, no hardcoded strings, per-key fallback.

### 10.6 Flow / continuity checklist
New-user registration → onboarding → radar reachable; existing-user login honors deep-link `state.from`; the user can always return (no dead-ends); workspace create/switch never lands in a silent dead-end (D2); every primary workflow has a forward AND a backward path.

### 10.7 Motion / a11y
All motion respects `prefers-reduced-motion`; menu a11y (haspopup/expanded/controls, Escape returns focus, roving arrow keys); the sweep/starglow/sonar are decorative only.

---

## 11. Current State & Living References

### 11.1 What is live per surface (from `docs/VERSIONS.md`, mid-Jul 2026)
- **App (app.lock.show):** live at `a874ab5` (rel-2026.07.10, incl. the firewall hotfix) — the **OLD dark build**; it does **not** yet reflect the prototype. The next app step is to implement the approved prototype into the real React app (`src/`) as an RC, then Q8, then production.
- **Site (lock.show):** live at the Codex homepage narrative rebuild (DS v1.6.25); homepage done, inner pages pending the same architecture pass. Site is served by manual alias-promote from a Codex feature branch (governance note: not yet from `main`).
- **Embed (lock.show/app):** mirrors the app release; every app release must rebuild the embed (`build:embed`) or the two surfaces skew.
- **DB:** applied through **037** (`is_demo`, owner-applied + verified 17 Jul; 036 stays `.DRAFT`); migration 021 is FROZEN (do not apply). Diff before creating ≥038; never recreate existing tables.

### 11.2 The prototype is the behavioral ground-truth
The interactive prototype (`scratchpad/lock-full-prototype.html`, artifact **`1c9b0030`**) is COMPLETE and owner-approved-in-iteration: engaging Radar + signal spec, consolidated ≤2-step nav hub + branding, discover→confirm planet drill-in, the Radar Inspector, onboarding narrative EN+HE locale-aware, multi-view Passport, Requests, Access, the unified switcher, and the light theme with dark Radar/Passport islands. **It is the behavioral ground-truth; this document is the written law.** When a nuance is ambiguous here, open the prototype.

### 11.3 The three canonical artifacts (the only ones to maintain)
1. **VERSION MAP** — `a65d12d9-a66d-442c-9077-306eb05fddd6`.
2. **ENTITIES / FLOWS** (structure + screens + intelligence + target) — `f702abc5-beb4-41a6-9f60-a2f8d239b6c6` (holds the fine-grained entity universe map).
3. **FULL APP PROTOTYPE** (6 entities / 24 screens, nav, full flow, DB-map, real branding) — `1c9b0030-9b25-4e1a-87ee-5d18823a661b`.

### 11.4 Test logins
The five QA/demo accounts (one per entity type, `@gigproof.test`) are documented in **`docs/team/TEST-LOGINS.md`** and seeded by `scripts/seed.mjs`. **Do not paste the password into this or any shareable surface** — see that file. Login at `www.lock.show/app/login`.

### 11.5 Stack
React + Vite + Tailwind + Supabase (ref `qexfndiyallwqhhzeerd`) + Vercel + Anthropic API. Analytics: GA4 `G-ZX907M2NY8` (consent-gated, Consent Mode v2, defaults denied). Payment: Bit + reference code, manual activation. Canonical codebase: GitHub Hello-MNB/lock.show (source of truth); Drive = DS + collaboration only. Not-yet-active (describe as conditional): Resend, Google/Facebook OAuth (created, not enabled), Tavily discovery (key verified, build pending, counsel-gated).

---

---

## 13. Engineering & Architecture

**Product:** LOCK (repo codename GIGPROOF / B4). Pre-booking proof & risk-reduction tool.
**Scope of this section:** the *as-built* engineering reality — surfaces, data model, server
contracts, auth, security/firewall enforcement, DB-ops/deploy, and the Q8 production gate.
**Grounding rule:** every claim below is traced to a file in the repo (cited inline). Anything
genuinely not yet built is marked **OWED** (a deliverable) or **OPEN** (an unresolved decision).
No secrets, keys, or credentials appear here.

> **The Firewall (governing constraint for the whole stack).** No score / percentile / rank /
> "bookability %" / prediction / gauge is ever computed, stored, or returned. Draw is expressed
> ONLY as **bands** + **binaries** with **method labels**. This is enforced at three physical
> layers — RLS row gates, per-column `GRANT`s to the `anon` role, and explicit column lists in
> server/client read paths — so a score column *could not* surface even if one were mistakenly
> added. Streaming is secondary context only.

---

### 13.1 System architecture

#### 13.1.1 Surfaces

LOCK ships as three deployment surfaces over **one** React SPA codebase plus a Next.js marketing
site:

| Surface | Domain | Tech | Serves |
|---|---|---|---|
| **Marketing site** (`website-next/`) | `lock.show`, `www.lock.show` | Next.js `output: 'export'` (static) | Public marketing, waitlist capture, SEO pages |
| **App SPA** (`src/`) | `app.lock.show` | React 18 + Vite + Tailwind, React Router | The product (artist / buyer / agency / production / producer / operator workspaces) |
| **Embed** | `www.lock.show/app/*` | The SAME Vite SPA, built `--mode embed`, committed as a static bundle under `website-next/public/app/` | Same-origin embedded copy of the app |

The **embed is a second physical copy** of the SPA bundle committed into the marketing repo. This is
a known version-skew class (two bundles for one app): the standalone serves `index-*.js` from its own
build; the embed serves a separately-committed `public/app/assets/index-*.js`. Mitigation is a
CI embed-sync gate (**OWED**, see `docs/architecture/P1-REFRESH-LOGOUT-ROOTCAUSE.md` Fix C and
`BRANCHING-MODEL.md` hard-gate 2 "every app release rebuilds the embed").

#### 13.1.2 Stack & runtime topology

- **Client:** React + Vite + Tailwind; routing in `src/App.jsx` (React Router). State via context
  (`AuthProvider`, `OrgContext`).
- **Data plane:** Supabase (Postgres + Auth + Storage + RLS), project ref `qexfndiyallwqhhzeerd`.
  The browser talks to Supabase **directly** with the public **anon** key (`src/lib/supabase.js`).
- **API server:** a single Express app (`server/index.js`) holding the Anthropic key and the
  Supabase **service-role** key. Runs on port 8787 locally; on Vercel it is imported by
  `api/index.js` as a serverless function (the exact same Express `app` export).
- **AI:** Anthropic API via `src/lib/ai` (`createClaimProcessor`); default model
  `claude-opus-4-8` (`server/index.js:34`). Stub processor when no key is set.
- **Hosting:** Vercel (both projects). Marketing static-export; app SPA with a catch-all rewrite.

#### 13.1.3 Request flow (where the logic lives)

There are **two** live data paths, by design, because the pilot must run even with **no server**:

1. **Direct-to-Supabase (primary, no-server path).** The SPA reads/writes Postgres directly under
   RLS using the anon (or the logged-in user's) JWT. Publishing, passport reads, evidence rows,
   claims review, org/roster RPCs all work this way (`src/lib/db.js`, `src/lib/orgs.js`). A build
   flag `NO_API_DEPLOY` (`src/lib/db.js`) makes the client the processor when there is no `/api`.
2. **Via the Express server (privileged path).** Used when a task **requires** the service role or
   the Anthropic key: AI claim extraction, cross-user notification writes, anonymous-buyer request
   creation, producer magic-link confirmation, and the immutable publish snapshot. See §13.3.

**Logic placement:**

| Concern | Client (SPA) | Server (Express) | Database (Postgres) |
|---|---|---|---|
| Routing / role gates | ✅ `App.jsx` + `navigation.js` | — | — |
| Firewall column selection | ✅ explicit `.select()` lists | ✅ `buildSafePayload` explicit lists | ✅ RLS + per-column anon `GRANT`s |
| Tenant isolation | — | service role (bypasses RLS — must self-enforce) | ✅ RLS via `current_org_ids()` / `can_access_artist()` |
| AI claim extraction | stub fallback only | ✅ `/api/process-evidence` | claims rows |
| Draw materialization (Radar) | canonical rules `src/lib/radar.js` | — | `recompute_radar_for_org()` + triggers (subset R1/R2/R4/R7) |
| Abuse controls / spend caps | — | ✅ in-memory + analytics ledger | — |

#### 13.1.4 Trust boundaries

- **Anon browser ↔ Postgres:** the anon key is public and shippable. The boundary is **RLS row
  policies + per-column `GRANT`s** (migrations 016/025). The DB *is* the firewall on this path.
- **Authenticated browser ↔ Postgres:** the user's JWT widens RLS to their own/org rows; the buyer
  "public passport" view must therefore **re-filter explicitly** (see the `artist_approved` gate,
  §13.5) because RLS shows an owner *all* their own rows.
- **Browser ↔ Express:** CORS allowlist + `requireAuth` (Bearer JWT verified against Supabase) +
  ownership gate (`requireArtistOwner`). Public-by-design routes (health, public passport GET,
  passport-signal, availability-request, tokened producer confirm) skip auth intentionally.
- **Express ↔ Postgres:** the **service role bypasses RLS entirely** — the server is inside the
  trust boundary and must enforce every gate in code. This is the single highest-risk surface
  (§13.5.3).

---

### 13.2 Data model — the real DB schema

Source of truth: `supabase/migrations/001…037` (036 = `.DRAFT`), and the consolidated
`supabase/apply_to_supabase.sql`. Postgres schema `public`. All tables carry RLS.

#### 13.2.1 Migration map

| # | File | What it does | State |
|---|---|---|---|
| 001 | `initial_schema` | Core: profiles, artists, profile_items, evidence_artifacts, claims, availability_requests, consent_records, passport_versions + RLS + storage buckets | applied |
| 002 | `add_whatsapp_and_notifications` | `artists.whatsapp_number`; `notifications` table (`notif_self` RLS) | applied |
| 003 | `operator_admin` | `operator` role; `is_operator()`; platform oversight read + targeted moderation update | applied |
| 004 | `producer_role` | adds `producer` to `profiles.role` CHECK | applied |
| 005 | `producer_confirmations` | `claims.method_label`; `producer_confirmations` table (magic-link, server-mediated) | applied |
| 006 | `passport_signals` | `passport_signals` table (B2 action-ladder rungs, anon insert) | applied |
| 007 | `entitlements` | `entitlements` table (manual founding-passport payment; pending→active by operator) | applied |
| 008 | `org_first_model` | Org tenancy spine: person, organization, organization_membership, role_assignment, active_role_context, artist_access, subscription, gigs, draw_signals; `organization_id` on domain tables; RLS spine helpers (`current_org_ids`, `has_org_role`, `can_access_artist`, `is_comember`) | applied |
| 009 | `org_bootstrap` | SECURITY DEFINER RPCs: `bootstrap_personal_org`, seats/invites (resolves signup chicken-and-egg) | applied |
| 010 | `radar` | `radar_signal` materialized store; `recompute_radar_for_org()`; feeding triggers | applied |
| 011 | `audit_operator` | `audit_log` table; operator right-to-erasure delete on artists | applied |
| 012 | `agency_upgrade` | `approve_agency_upgrade()` (Solo→Agency on the same org) + operator read | applied |
| 013 | `invite_info` | `invite_info()` RPC — safe invite display fields for the accept screen | applied |
| 014 | `artist_org_autoset` | BEFORE-INSERT trigger fills `artists.owner_organization_id` from active org | applied |
| 015 | `live_fixes` | Fix `artists_org` INSERT…RETURNING (42501), trigger 014, invite token `gen_random_uuid()` | applied |
| 016 | `firewall_column_security` | **Physical firewall:** `REVOKE SELECT` from anon, re-`GRANT` buyer-safe columns only on artists/profile_items/claims | applied |
| 017 | `owner_publish_snapshot` | `pv_owner_insert` — owner writes their own passport snapshot under RLS (no service role needed to publish) | applied |
| 018 | `professional_reaction` | professional_reaction, reaction_reason, opportunity + producer_confirmations enrichment | **failed & rolled back** (bad `opp_org_all` policy referenced non-existent `org_memberships.user_id`) |
| 019 | `repair_professional_reaction` | Re-applies everything 018 lost, policy defect fixed, FK guarded | applied (supersedes 018) |
| 020 | `acts_spine` | **Multi-Act foundation:** `act` table; `act_id` threaded through 11 child tables; backfill (`act.id = artists.id`); transition triggers | applied |
| **021** | `vocabulary_and_consent` | Renames `mirror-only`→`working-only`, `booker`→`booking_manager`, adds `venue_programmer`, 4 canonical consent scopes | **⛔ FROZEN — NOT APPLIED** (would break the running app; see 13.2.5) |
| 022 | `claim_evidence_depth` | claims public-display fields + **`artist_approved` gate (default false)** + status lifecycle; evidence Amendment-13 fields; `processing_job` table | applied |
| 023 | `gig_depth` | gig-scoped draw bands + closeout fields; `exact_count` (working-only) | applied |
| 024 | `measurement_and_share` | share_link, passport_view_event, analytics_event (event-name CHECK — the **analytics head**) | applied |
| 025 | `firewall_grants` | Extends 016 to new tables/columns (gigs, act, share_link, analytics_event, passport_view_event) | applied |
| 026 | `waitlist` | `waitlist_signup` (public insert, operator-only read) | applied |
| 027 | `workspace_types_and_access_scopes` | `organization.workspace_type`; artist_access scope[]/territory/expiry/consent + lifecycle; `can_access_artist()` honors scope+expiry; access-handshake RPCs | applied (was owner-approval-gated; 030 later fixes recursion it introduced, confirming it is live) |
| 028 | `discovery_analytics_plans` | `discovered` evidence source; bilingual name fields; M1 funnel events; `organization.plan_flags` jsonb | applied (owner-approval-gated in header) |
| 029 | `artist_whatsapp_share` | `artists.whatsapp_share`; `get_shared_whatsapp()` gated exposure | applied |
| 030 | `fix_artists_rls_recursion` | Breaks artists↔artist_access mutual-RLS loop via SECURITY DEFINER `owns_artist()` | applied |
| 031 | `passport_approval_gate` | **Adds `and artist_approved = true` to `claims_public_read`** (firewall breach fix) | applied |
| 032 | `roster_and_production_rpcs` | `list_roster_grants()`, `list_production_requests()` (read-only RPCs) | applied ✓ verified |
| 033 | `waitlist_outreach_roles` | Widens `waitlist_signup.role` CHECK (manager/production outreach) | applied |
| **034** | `event_canon_unpublish` | **analytics_event CHECK = app CANON exactly: 29 event names** (file=DB=app, reconciled) | applied ✓ (**the analytics CHECK head**) |
| 035 | `create_workspace` | `create_workspace()` RPC (second/additional workspace) | applied ✓ |
| 036 | `token_hash.sql.DRAFT` | Hashed producer-token storage (G15-4) — dual-read rollout plan | **DRAFT — deliberately not runnable** (`.DRAFT` suffix; `token` still plaintext, migration 005) |
| **037** | `analytics_is_demo` | `is_demo boolean` on `analytics_event` + conservative backfill (seed `@gigproof.test` actors + operator rows; anonymous public views stay real) + partial index for the operator read path (§14.3.2) | **applied ✓ 17 Jul** (owner-applied, backfill verified: 43 demo / 3 real; paired `.down.sql`) |

**Live migration head (per `docs/VERSIONS.md`):** **037** (applied 17 Jul). 021 is permanently
skipped/frozen; 036 is a draft (out of sequence by design). Every migration file has a paired
`NNN_*.down.sql` from 019 onward. Migrations ship **alone**, applied+verified before dependent
code (`BRANCHING-MODEL.md` hard-gate 4).

> **Diff before authoring ≥038** — do not recreate existing tables. Structural renames (e.g.
> workspace_type `producer`→`production`, folding 021's vocabulary) are gated on Supabase Pro
> backups being ON before any destructive change (`rel-2026.07.13-PLAN.md` §4b item 4).

#### 13.2.2 Table catalog — core evidence spine

**`artists`** (001; the transition anchor — child rows still hang here while the app migrates to
act-first reads)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `created_by` | uuid → `auth.users` | owner (ownership gate) |
| `stage_name`, `name`, `genre`, `city`, `photo_url`, `one_line`, `regions`, `set_length` | text | buyer-safe identity |
| `invoice_ready` | boolean | |
| `rider_url` | text | **private** (not anon-granted) |
| `whatsapp_number` | text (002) | **private**; exposed only via `get_shared_whatsapp()` |
| `whatsapp_share` | boolean (029) | artist opt-in |
| `music_links` | jsonb | |
| `lineup_frequency_band`, `price_band`, `community_size_band` | text | **BANDS only** (firewall) |
| `sells_tickets` | boolean | binary |
| `published` | boolean default false | the publish/firewall gate |
| `owner_organization_id`, `organization_id` | uuid → organization (008) | tenancy |
| `stage_name_he`, `name_he` | text (028) | bilingual search |

**`profile_items`** (001) — track record. `item_type` CHECK: `event · lineup · collab · release ·
residency · self_produced_event · link · draw_signal`. `source_status` CHECK: `public-verified ·
artist-provided`. `visibility` CHECK: `passport-ok · mirror-only` (001; 021 would rename to
`working-only` but is frozen). `act_id` (020).

**`evidence_artifacts`** (001) — artist-supplied proof (files go to Storage, not through the API).
`evidence_type` CHECK: `file · link · band`. `source_type` CHECK: `ticket-export · settlement ·
screenshot · public-profile · producer-vouch · self-band · self-reported · discovered` (028).
`status` CHECK: `submitted · processed · error`. Depth fields (022): `claim_intent`,
`source_owner_consent`, `checksum`, `retention_policy`, `platform`, `pii_scrubbed`. Discovery
provenance (028): `discovery_source_url`, `discovery_query`, `same_person_state`
(`unreviewed · artist-confirmed · artist-dismissed`). `act_id` (020).

**`claims`** (001; output of AI processing — the firewall-critical table)

| Column | Type | CHECK / notes |
|---|---|---|
| `id` | uuid PK | |
| `artist_id` | uuid → artists | |
| `act_id` | uuid → act (020) | |
| `evidence_id` | uuid → evidence_artifacts (set null) | |
| `claim_type`, `value` | text | `value` = exact working text |
| `verification_status` | text default `self-reported` | `verified · supporting · self-reported · not-assessable` |
| `verified_by` | text default `system` | `system · artist` |
| `verified_at`, `expires_at` | timestamptz | `expires_at` drives auto-**stale**; **never** sent to public |
| `visibility` | text default `mirror-only` | `passport-ok · mirror-only · internal` |
| `method_label` | text (005) | `producer-confirmed` (strongest) / `stale` / null |
| `extraction_method`, `model_version` | text | provenance (truthful): `anthropic · deterministic_fallback · mock · client_stub` |
| `internal_confidence` | numeric | **DB-only — NEVER returned to any client (a score → firewall)** |
| `reason_code` | text | |
| `public_band` | text (022) | **the only public draw form** (band string) |
| `public_wording`, `limitation_text` | text (022) | exact public text + "what this does/does not establish" |
| **`artist_approved`** | boolean default false (022) | **the publish gate — nothing reaches any view without this** |
| `source_timestamp` | timestamptz (022) | |
| `status` | text default `submitted` (022) | `submitted · processed · source-supported · published · self-reported · not-assessable · stale · disputed` |

**`passport_versions`** (001) — **immutable** buyer-safe snapshots (insert-only; never updated).
`snapshot` jsonb MUST NOT contain score/percentile/exact-count/internal_confidence. `act_id` (020).

**`availability_requests`** (001) — buyer reaction. `status` CHECK: `new · replied · closed`.
Bands only (`capacity_band`, `budget_band`). `act_id` (020).

**`consent_records`** (001) — legal basis. `status`: `accepted · declined · withdrawn`. `scope`
CHECK (post-021 target = `privacy-processing · public-publication · thirdparty-evidence · marketing
· account-deletion`) — but 021 is frozen, so the **live** scope vocabulary is the pre-021 set plus
`scope_legacy` staging is not yet present. **OPEN:** live consent-scope vocabulary is whatever 001
defined until 021 (or a re-authored equivalent) lands.

#### 13.2.3 Table catalog — org tenancy (008/027)

| Table | Key columns | CHECK / enum values |
|---|---|---|
| `person` | `id` → auth.users, `email`, `display_name` | 1:1 with auth user |
| `organization` | `id`, `name`, `slug` unique, `plan`, `created_by`, `workspace_type` (027), `plan_flags` jsonb (028) | `plan`: `solo · agency · agency_plus`; `workspace_type`: `artist · management · producer` |
| `organization_membership` | `organization_id`, `person_id` (null until invite accepted), `org_role`, `status`, `invite_token` unique | `org_role`: `owner · admin · member`; `status`: `active · invited · suspended`; unique(org, person) |
| `role_assignment` | `organization_id`, `person_id`, `functional_role`, `authority_scope` jsonb | `functional_role` (post-027 CHECK): `artist · booking_manager · artist_manager · producer · venue_programmer · operator · booking_agent · roster_coordinator · viewer` **+ tolerated legacy** `booker · agency` |
| `active_role_context` | `person_id` PK, `active_organization_id` | which workspace is active |
| `artist_access` | `organization_id`, `artist_id`, `access_level`, `scope[]` (027), `territory`, `expires_at`, `consent_at`, `status` | `access_level`: `manage · view`; `scope ⊆ {view,upload,edit,share,publish}`; `status` (027): `pending · active · revoked · disputed`; unique(org, artist) |
| `subscription` | `organization_id` unique, `plan`, `seats_included`, `seats_used`, `status` | `status`: `active · trialing · past_due · canceled` |

#### 13.2.4 Table catalog — domain, measurement, ops

| Table | Migration | Key columns / enums (firewall-relevant) |
|---|---|---|
| `gigs` | 008/023 | `status`: `lead·hold·confirmed·settled·canceled`; `role_at_event`: `headliner·support·lineup-member`; `audience_band`: `<50·50-150·150-300·300-600·600+·unknown`; `band_means`: `sold·scanned·attended·attributed-via-link`; **`exact_count` int — working-only, never anon-granted**; closeout: `attendance_band`, `settlement_band`, `closeout_status` (`pending·completed·skipped`), `ticket_attribution_confirmed`, `repeat_booking_signal` |
| `draw_signals` | 008 | `signal_type`: `lineup-frequency·sells-tickets·price-band·community-size`; `band_value` (band only), `method_label` |
| `radar_signal` | 010 | `rule_id`: `R1…R8`; `status`: `strong·developing·missing·notAssessable`; `action_type`: `refresh-evidence·request-evidence·respond·publish·promote·review`; `evidence_basis` (ref, not a number); unique(org, artist, rule) |
| `act` | 020 | `person_id`, `stage_name`, `genre`, `city`, `positioning` (≤120), `format` (`dj-set·live-set·duo·band·open-format·vocalist·comedian-host·ceremony-act·other`), `artist_goal` enum; **`contact` internal-only**, **`community_count_declared` int working-only**; `is_default` |
| `producer_confirmations` | 005/019 | `token` unique (plaintext — see 036 DRAFT), `response`: `yes·partial·no·wrong_person`, `revoked`, `responded_at`; enrichment (019): `authority_type` (`producer·venue_rep·ticketing_admin·organizer·other`), `name_visibility` (`public·initials·anonymous`), `identity_verified`, `conflict_of_interest`, `offline_confirmation_source` (`phone·message·in_person`) |
| `professional_reaction` | 018/019 | `action_type`: `check_availability·request_price·save·forward·future_fit·request_proof·not_fit`; `reaction_status`: `recorded·retracted`; `idempotency_key` unique |
| `reaction_reason` | 018/019 | `reason_type` enum; `free_text` **INTERNAL ONLY** |
| `opportunity` | 018/019 | `status`: `open·filled·cancelled·expired`; `capacity_band`/`budget_band` (bands only) |
| `processing_job` | 022 | `status`: `queued·running·completed·failed`; `model_version`, `ruleset_version` (server-written only) |
| `share_link` | 024 | `tracking_disclosed` (must be true before send), `status`: `active·expired·revoked`, `act_id` |
| `passport_view_event` | 024 | anon insert **only against a published artist**; a view is NOT a reaction (must never merge) |
| `analytics_event` | 024/028/034 | `event_name` CHECK = **29 canonical events** (034); append-only, operator-read only; `properties` jsonb (no PII) |
| `notifications` | 002 | `user_id` self-RLS; cross-user writes go through the server service role |
| `entitlements` | 007 | `status`: `pending·active·cancelled`; operator activates |
| `audit_log` | 011 | operator-only; destructive actions write a row first |
| `waitlist_signup` | 026/033 | public insert, operator read only; `role`: `artist·booking_manager·artist_manager·production·producer·other` |

**analytics_event CHECK (034 — the analytics head), 29 names:** `passport_view`,
`professional_reaction_submitted`, `availability_request_created`, `producer_confirmation_sent`,
`producer_confirmation_received`, `claim_published`, `passport_published`, `entitlement_activated`,
`gig_evidence_refresh_completed`, `passport_unpublished`, `share_link_created`, `share_link_opened`,
`consent_granted`, `consent_withdrawn`, `account_deleted`, `signup_started`, `signup_completed`,
`login`, `oauth_login`, `onboarding_started`, `onboarding_completed`, `radar_opened`,
`evidence_added`, `claim_confirmed`, `act_created`, `act_switched`, `workspace_switched`,
`payment_reference_created`, `availability_request_responded`. File=DB=app is a maintained
invariant (drift found twice by hand; 034 is generated from `src/lib/analytics.js` CANON).

#### 13.2.5 Multi-Act `act_id` threading (020)

Canon: one **Person** may hold several **Acts** (e.g. a psytrance Act + a techno Act), each with its
own Passport and its own **non-transferable** evidence; a new Act starts empty. Migration 020:

1. Creates `public.act` (`person_id` FK — bound to a Person, not conflated with the legacy artist).
2. Backfills exactly one default Act per existing artist reusing the **same id**
   (`act.id = artists.id`), so every existing child row maps 1:1 trivially.
3. Adds `act_id` to **11** child tables (claims, evidence_artifacts, profile_items, gigs,
   passport_versions, availability_requests, producer_confirmations, professional_reaction,
   draw_signals, radar_signal, entitlements) + `share_link` (024), backfilled from `artist_id`.
4. Installs **transition triggers** so the current app keeps working untouched: a new `artists`
   row auto-creates its default Act (`act_from_artist`); a new child row auto-fills `act_id` from
   `artist_id` (`set_act_from_artist_id`). The app can migrate to act-first reads screen by screen.

**Binding rule (canon):** a Passport binds to an Act via `passport_version.act_id`, not to a Person.
Public reads are still served off `artists` under the 016/025 column grants; the `act` public-read
policy (025 `act_public_read`) and act-first passport cutover are the transition target.

---

### 13.3 API / server contracts

Base: `server/index.js` (Express). Body limit 100 KB; every string field ≤ 2000 chars
(`MAX_FIELD_CHARS`); CORS allowlist; per-IP rate limit on **all** routes (§13.5.4). Auth via
`Authorization: Bearer <supabase access_token>` verified by `requireAuth` → `req.userId`.

#### 13.3.1 Endpoint catalog

| Method / path | Auth | Request | Response (success) | Purpose |
|---|---|---|---|---|
| `GET /api/health` | none | — | `{ ok, supabase, ai: 'configured'|'mock', model }` | Liveness; "configured" = key present, not that any call succeeded |
| `POST /api/process-evidence` | Bearer + artist owner | `{ artistId }` | `{ processed, deduped, ai: 'mock'|'degraded'|'live', methods, claims[], budget_alert }` | AI-label submitted evidence → write claims (§13.3.3) |
| `POST /api/publish/:artistId` | Bearer + owner | — | `{ ok, published:true }` | Write immutable buyer-safe snapshot + set `published` |
| `GET /api/passport/:artistId` | none | — | snapshot jsonb `{ artist, items[], claims[] }` | Serve immutable snapshot; live `published` flag re-gates |
| `POST /api/passport-signal` | none | `{ artistId, signal, sessionId? }` | `{ ok }` or `{ ok, deduped:true }` | Buyer one-tap signal; `signal ∈ price_details·future_fit·needs_proof·not_this_event·forwarded`; 24h idempotency via hashed session key |
| `POST /api/availability-request` | none | closed field list incl. `artistId`, `requester_name`, bands | `{ ok, request }` | Anonymous buyer request; server-authored notification body |
| `POST /api/notify` | Bearer | `{ artistId, type, body, link }` | `{ ok }` | Notification writer; caller must **own** the artist or be **operator**; `type ∈ request_received·confirmation_received·system` |
| `POST /api/request-confirmation` | Bearer + owner | `{ claimId, producerContact? }` | `{ token, path:'/confirm/<token>' }` | Mint a producer magic-link token |
| `GET /api/confirm/:token` | none (token) | — | `{ claimText, artistName, response, revoked, responded }` | Producer opens link (safe fields only) |
| `POST /api/confirm/:token` | none (token) | `{ response }` or `{ revoke:true }` | `{ ok, response }` / `{ ok, revoked:true }` / `{…already_recorded:true}` | Producer replies/revokes; `response ∈ yes·partial·no·wrong_person`; only `yes` earns `producer-confirmed` |

Error envelope is uniformly `{ error: '<code>' }` with codes: `auth_required` (401), `forbidden`
(403), `rate_limited` / `daily_limit_reached` / `monthly_budget_reached` (429), `too_many_items` /
`field_too_long` (400), `link_expired` (410), `server_error` (500).

#### 13.3.2 Postgres RPCs (SECURITY DEFINER, called directly from the SPA)

These run privileged inside the DB to break the RLS chicken-and-egg / recursion, then gate on
`current_org_ids()` / `has_org_role()` / ownership internally:

| RPC | Migration | Purpose |
|---|---|---|
| `bootstrap_personal_org(name, functional_role, email?, display_name?)` | 009/021 | Create the signup solo org (person + org + owner membership + role + subscription + active context) |
| `create_workspace(name, workspace_type, functional_role)` | 035 | Create an **additional** workspace (empty; nothing copied — G3 boundary) |
| `invite_member(...)`, `accept_invite(token)`, `invite_info(token)` | 009/013/021 | Team invites + safe invite-display lookup |
| `approve_agency_upgrade(org, seats)` | 012 | Solo→Agency on the same org (operator-gated) |
| `request_artist_access(org, artist, scope[], territory?)` | 027 | Agency/production requests a scoped, revocable grant |
| `list_incoming_access_requests()` | 027 | Artist-side "who wants access to me" (safe join) |
| `respond_to_access_request(id, approve, scope?)` | 027 | Artist approves/declines (optionally narrows scope) |
| `revoke_artist_access(id)` | 027 | Either side revokes an active grant |
| `list_roster_grants()` | 032 | Manager roster from consented active grants |
| `list_production_requests()` | 032 | Production outbound-request inbox with reply status |
| `get_shared_whatsapp(artistId)` | 029 | Returns the WhatsApp number ONLY if published AND opted in |
| `recompute_radar_for_org(org)` | 010 | Deterministic Radar materialization (R1/R2/R4/R7 subset) |

#### 13.3.3 The claim-safe payload contract (`buildSafePayload`) — the physical firewall

`server/index.js` `buildSafePayload(artistId)` (used both to write the publish snapshot and as the
live fallback in `GET /api/passport/:artistId`). This is the **contract that guarantees private gaps
and unreviewed claims never leak** to a buyer. Because the server uses the **service role**, which
**bypasses RLS**, every gate must be re-stated explicitly in the query — RLS does not protect this
path.

The contract, exactly:

- **artists** — an **explicit column allowlist**: `id, stage_name, name, genre, city, photo_url,
  one_line, regions, set_length, invoice_ready, music_links, lineup_frequency_band, sells_tickets,
  price_band, community_size_band`. (No `internal_confidence`, `rider_url`, `whatsapp_number`,
  `created_by` — none could appear even if present.)
- **profile_items** — allowlist `id, item_type, title, detail, item_date, public_url,
  source_status`, filtered `visibility = 'passport-ok'`.
- **claims** — allowlist `id, claim_type, value, source_type, verification_status, reason_code,
  method_label, expires_at`, filtered by **all four** gates:
  1. `visibility = 'passport-ok'`
  2. `verification_status IN ('verified','supporting')` (`PUBLISHABLE_STATUSES`)
  3. **`artist_approved = true`** (the 031/022 gate — this is the line that stops auto-labeled,
     never-reviewed claims from going public; the admin client would otherwise ignore RLS)
  4. `artist_is_published` is enforced by the caller (`GET /api/passport` checks live `published`)
- **Stale computed server-side, timestamp stripped:** for each claim, if `method_label ≠
  producer-confirmed` and `expires_at < now`, the label becomes `stale`; then **`expires_at` is
  deleted from the object**. Raw timestamps never leave the server — only the bounded label does.

The client no-server path mirrors this exactly (`src/lib/db.js` `getPublicPassport` /
`buildPassportSnapshot`): the anon branch relies on the DB (016 column grants exclude `visibility`
so it can't even be referenced), and the **authenticated** branch re-filters
`passport-ok + publishable + artist_approved` explicitly, because an owner's RLS shows all their
own rows. **One Passport, identical for every viewer class.**

---

### 13.4 Auth & sessions

#### 13.4.1 Client configuration

`src/lib/supabase.js` creates the client with `persistSession: true`, `autoRefreshToken: true`,
`flowType: 'pkce'`, `detectSessionInUrl: true`. PKCE + `detectSessionInUrl` are required so Google's
`?code=` redirect can be exchanged (without them the user bounced back to login — the bug Maria hit
9 Jul). Session lives in **localStorage** (see §13.5.5 for the XSS consideration).

#### 13.4.2 Flows

| Flow | Mechanism | Notes |
|---|---|---|
| Email signup / login | Supabase Auth email+password; `/signup`, `/login` | On signup the app calls `bootstrap_personal_org` |
| Google OAuth | PKCE redirect; `OAUTH_ENABLED` default ON since 8 Jul (`VITE_OAUTH_ENABLED=0` kill-switch) | Google provider enabled in Supabase dashboard |
| Facebook OAuth | `OAUTH_FACEBOOK_ENABLED` default **OFF** | Provider NOT enabled in Supabase; a visible button produced a raw error, so it is flag-gated |
| Email confirm | Supabase email link; SMTP (Resend) delivery is QA item Q3 | Delivery is a Cowork/owner setup step |
| Forgot / reset password | `/forgot-password` → `/reset-password` (`ForgotPassword.jsx`, `ResetPassword.jsx`) | Standard Supabase recovery |
| Org invite | `organization_membership.invite_token` (unique, minted by `invite_member`); `/invite/:token` → `AcceptInvite`; `invite_info(token)` shows safe fields; `accept_invite(token)` verifies email match then activates | **Expiry: OPEN/OWED** — invite tokens have no explicit TTL in the schema (unlike producer tokens) |
| Producer confirm | `/confirm/:token` (producer magic link); minted by `POST /api/request-confirmation` | **Expiry 14 days** (`CONFIRM_TOKEN_TTL_DAYS`); a row with no `created_at` is treated as **expired** (fail-closed); token stored **plaintext** today (036 DRAFT hashes it) |

#### 13.4.3 Session/role model

- **Auth identity** = Supabase user (`useAuth()` / `AuthProvider`). Profile role via `getProfile`.
- **Effective role** = the **active workspace's** derived role from `useOrg()` (`OrgContext`), NOT
  the static profile role — so a workspace switch actually re-gates the UI. Route guards
  (`RequireRole`, `RequireAgency`, `RequireProduction`) and `RoleHome` all delegate to the pure
  functions in `src/lib/navigation.js` (`homePathFor`, `requireRoleRedirect`, etc.), which are
  exhaustively verified by `scripts/nav-contract.test.mjs` (34 journeys) on every build.
- **Producer** is never a self-selected signup role (`SIGNUP_ROLES = artist·booker·agency`); it is
  an accountless magic-link task.

#### 13.4.4 Refresh-logout root cause + fix (folded from `P1-REFRESH-LOGOUT-ROOTCAUSE.md`)

**Symptom (14 Jul):** logged in, edited artist details, pressed refresh, ejected from the app.

**Verdict:** **NOT an auth/session bug.** The session/auth code (`AuthProvider.jsx`,
`supabase.js`, `main.jsx`) is **byte-identical** across the embed, standalone, and HEAD. The boot
logic correctly `await`s `getSession()` + `loadProfile` before clearing `loading`. None of it runs
on the failing reload.

**Actual mechanism:** an **SPA deep-link routing gap on static hosting**. A hard reload of a client
route issues a real GET for that exact path. With Next `output: 'export'` (no server rewrites) and a
`vercel.json` that had only `cleanUrls`, only paths with a **physical file** existed
(`/app/`, `/app/login`, `/app/signup` were hand-created shells). Every other route
(`/app/settings`, `/app/artist/*`, `/app/onboarding`, …) returned **404** and served the marketing
404 page — the app bundle never booted to read the intact localStorage session. Confirmed by live
HTTP: `/app/` → 200 (app), `/app/settings` → 404 (Next marketing). The standalone had the same gap
(root `vercel.json` also lacked rewrites).

**Fix (both now applied in the repo):**
- **Embed** — `website-next/vercel.json` adds `rewrites: [{ source: '/app/:path*', destination:
  '/app/index.html' }]`. (Vercel rewrites run **after** the filesystem check, so real files/assets
  still serve directly; only 404-ing deep routes fall through to the SPA shell.)
- **Standalone** — root `vercel.json` adds `rewrites: [{ source: '/((?!assets/|_next/).*)',
  destination: '/index.html' }]`.
- **Durable target (OWED):** collapse to a single canonical bundle (redirect `www.lock.show/app/*`
  to the standalone) **or** add a CI embed-sync hash gate so the embed can never silently go stale.

---

### 13.5 Security & firewall server-enforcement

#### 13.5.1 RLS policy catalog (per table: who reads / who writes)

Helper functions (all `SECURITY DEFINER`, so they don't recurse through RLS): `owns_artist(a)`
(030, org-owner check without self-selecting artists), `can_access_artist(a)` (008/027 — owning org
OR active, unexpired, `view`-scoped `artist_access`), `current_org_ids()`, `has_org_role(org,
roles[])`, `is_operator()` (003), `artist_is_published(a)`.

| Table | Public / anon | Authenticated user / org | Operator |
|---|---|---|---|
| `profiles` | — | self all (`profiles_self`) | read all |
| `artists` | SELECT if `published` (`artists_public_read`); **column-restricted** by 016 | org access `can_access_artist` (`artists_org`); INSERT check `owner_organization_id ∈ current_org_ids` | read / update / delete (moderation, erasure) |
| `profile_items` | SELECT `passport-ok` of published (col-restricted 016) | org (`items_org`) | read |
| `evidence_artifacts` | **none** (private) | org (`evidence_org`) | read |
| `claims` | SELECT `passport-ok` + publishable + **`artist_approved`** + published (`claims_public_read`, 031); columns restricted 016/025 | org (`claims_org`) | read + update |
| `availability_requests` | INSERT if `artist_is_published` (`req_public_insert`) | org read/update | read/update |
| `passport_versions` | SELECT if published (`pv_public_read`); **owner INSERT** (`pv_owner_insert`, 017) | org read | — |
| `passport_signals` | INSERT if published; no read | owner read | read |
| `producer_confirmations` | **none** (all writes server/service-role) | org read | read |
| `professional_reaction` | **INSERT open** (`with check (true)`) | org read | read |
| `reaction_reason` | INSERT open | org read (via reaction join) | read |
| `passport_view_event` | INSERT **only against a published artist** (stricter than reactions) | org read | read |
| `analytics_event` | **INSERT open** (append-only) | — | **read only** |
| `share_link` | no anon read (025) | org all | read |
| `person / organization / membership / role_assignment / artist_access / subscription` | — | member read; owner/admin write; artist-side access-request read/respond (027/030) | selective read (012) |
| `gigs / draw_signals / radar_signal / opportunity / act` | anon read of buyer-safe columns where published (025); else none | org tenant scope | read |
| `entitlements` | — | owner read + insert own pending | read + activate |
| `notifications` | — | self only (`notif_self`) | — |
| `waitlist_signup` | **INSERT open**; no read (revoked from anon) | — | read only |
| `audit_log` / `processing_job` | — | processing_job: org read only | operator all |

#### 13.5.2 The `artist_approved` firewall gate (the load-bearing rule)

A claim is born `visibility='passport-ok'` the instant it is auto-labeled verified/supporting —
**before** the artist reviews it. `artist_approved` defaults **false** (022) and is the intended
publish gate ("Nothing publishes without you"; canon: "zero claims publish without review"). The
breach (found 10 Jul) was that `claims_public_read` filtered on visibility+status+published but NOT
`artist_approved`, so publishing exposed every unreviewed auto-claim. **Enforced in all four read
paths** (must stay in lockstep — this is the single most important firewall invariant):

1. RLS `claims_public_read` — `and artist_approved = true` (migration 031).
2. Server `buildSafePayload` — `.eq('artist_approved', true)` (service role bypasses RLS).
3. Client `getPublicPassport` authenticated branch — `.eq('artist_approved', true)`.
4. Client `buildPassportSnapshot` — `.eq('artist_approved', true)`.

#### 13.5.3 Service-role bypass risk

The Express server holds the **service-role** key, which **bypasses RLS**. Consequences that are
actively managed in `server/index.js`:

- Every read that could leak private data (`buildSafePayload`) re-states the RLS filters explicitly.
- Every mutation gate is re-checked in code: `requireAuth` (JWT), `requireArtistOwner`
  (`artists.created_by === req.userId`), operator check for cross-user notifications.
- Cross-user writes that RLS would forbid (notifications to another user's bell) are **only**
  reachable via server routes with server-authored bodies (`/api/availability-request` writes the
  notification body itself; `/api/notify` restricts `type` to a closed enum and requires ownership
  or operator).
- **Residual risk (OPEN):** any new server read path that forgets a firewall filter leaks with no
  RLS backstop. Mitigation target = a shared safe-select helper + a server-payload firewall test in
  CI (**OWED**; `scripts/test-security-denial.mjs` exists for denial cases — G11).

#### 13.5.4 Rate limits & AI spend caps (actual values in `server/index.js`)

| Control | Value (env-tunable) | Enforcement |
|---|---|---|
| Per-IP rate limit | `RATE_LIMIT_PER_MIN = 30` / trailing 60s | in-memory sliding window, ALL routes → 429 `rate_limited` |
| Items per job | `MAX_ITEMS_PER_JOB = 15` | reject batch → 400 `too_many_items` |
| Items per user / day | `MAX_ITEMS_PER_USER_DAY = 15` | in-memory per-user/UTC-day → 429 `daily_limit_reached` |
| Monthly AI budget (hard) | `MONTHLY_BUDGET_USD = 50` | estimate from `analytics_event` count × `COST_PER_ITEM_USD (0.02)` → 429 `monthly_budget_reached` |
| Budget alert | `BUDGET_ALERT_AT_USD = 25` | warn + `budget_alert:true` in response |
| Producer-token TTL | `CONFIRM_TOKEN_TTL_DAYS = 14` | 410 `link_expired` |
| Body / field caps | JSON ≤ 100 KB; string field ≤ 2000 chars | 400 `field_too_long` |
| CORS allowlist | `app.lock.show`, `lock.show`, `www.lock.show`, `localhost:5173` (env `ALLOWED_ORIGINS`) | non-allowlisted origin → no CORS headers |

**Honesty caveats (as documented in code):** the in-memory counters reset on serverless-instance
restart (accepted pilot bound, not a persistence guarantee); the monthly ledger is an **estimate**
(row count × flat per-item cost, not token accounting — real per-token accounting is **OWED**, P1);
the budget check **fails open** on a ledger-query error (an analytics hiccup must not brick the
artist loop — the in-memory daily caps still bound damage). AI budget policy is CFRO v2.8, pending
owner approval.

#### 13.5.5 CSP / security headers, and the localStorage-session XSS risk

- **App security headers: BUILT** (`vercel.json` `headers`, 15 Jul). The app now ships:
  - **Content-Security-Policy:** `default-src 'self'; base-uri 'self'; object-src 'none';
    frame-ancestors 'self' https://lock.show https://www.lock.show; script-src 'self' 'unsafe-inline'
    https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'
    https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self'
    data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co
    https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com;
    form-action 'self'; frame-src 'self'; manifest-src 'self'; worker-src 'self' blob:;
    upgrade-insecure-requests`. `frame-ancestors` (not `X-Frame-Options DENY`) is used so the
    `lock.show/app` embed keeps working while still blocking foreign clickjacking.
  - **Strict-Transport-Security** `max-age=31536000; includeSubDomains; preload` ·
    **X-Content-Type-Options** `nosniff` · **Referrer-Policy** `strict-origin-when-cross-origin` ·
    **Permissions-Policy** `camera=(), microphone=(), geolocation=(), interest-cohort=()`.
  - **Follow-ups (OWED):** (a) `script-src` keeps `'unsafe-inline'` for the inline gtag consent
    bootstrap — tighten to a **nonce/hash** in a later pass; (b) the **marketing site**
    (`website-next/vercel.json`) still ships no headers (S2p) — mirror this set there (static export
    can't use `next.config` `headers()`).
- **localStorage session (XSS) — OPEN.** The Supabase session (JWT) is stored in `localStorage`
  (`persistSession:true`), which is readable by any injected script. The CSP above is now the first
  line of defence; the durable upgrade is still a **BFF** (backend-for-frontend) keeping tokens in
  httpOnly cookies and proxying Supabase. Recommended before wider launch; not built.

#### 13.5.6 Public-surface abuse: bot protection + durable rate-limiting (OWED)
The **public, anonymous** write surfaces — `POST /api/availability-request` (`/passport/:id/request`) and the Source-Confirmer at `/confirm/:token` — will be scraped/spammed once shared.
- **Bot protection — OWED (grep: 0 captcha refs).** Add **Cloudflare Turnstile / hCaptcha** on the availability-request and confirm forms. Firewall-safe (a challenge token, no scoring). High priority before the Passport is shared widely; not built today.
- **Rate-limit durability — OWED.** The current limiter is an **in-memory sliding window** (`server/index.js:75`), which is **per-instance and resets on Vercel serverless cold starts** — so it under-protects at the edge. Upgrade public endpoints to a shared store (**Upstash Redis / Vercel Edge Config**) for durable, cross-instance limits. The in-memory limiter is an acceptable pilot floor, not a launch answer.

---

### 13.6 DB ops / environments / deploy / rollback

#### 13.6.1 Environments

| Env | Data plane | API | Notes |
|---|---|---|---|
| Local dev | Supabase (shared project) or DEMO fixtures | `node server/index.js` @ :8787 (`concurrently -k` with Vite) | `DEMO` mode short-circuits db.js to fixtures; `NO_API_DEPLOY` makes the client the processor |
| Preview | isolated preview (one-time hook; previews OFF globally for quota) | Vercel serverless | Write-path URLs distributed only after G11+G12+G16 close (QA isolation) |
| Production | Supabase `qexfndiyallwqhhzeerd` | Vercel serverless (`api/index.js`) | `app.lock.show` (app) + `lock.show` (site) |

There is **one** Supabase project (no separate staging DB). Migration safety therefore leans on
additive-only + idempotent files and the frozen-021 rule rather than a throwaway staging database.

#### 13.6.2 Branching, deploy train, alias-promote

- **Trunk-based:** `main` = production; short-lived `claude/<task>` work branches
  (`BRANCHING-MODEL.md`). **Current train law (rel-2026.07.13):** ONE full release train —
  canon-lock → candidate SHA → isolated preview → Q1–Q7 → owner Q8 → atomic merge → live smoke →
  tag + rollback anchor. Small frequent trunk releases resume post-launch.
- **Verify gate (`npm run verify`, Q1):** nav-contract test (34 journeys) + i18n language purity +
  real build + demo build + `next build` + `scripts/test-security-denial.mjs`. A red gate never
  ships (`RELEASE-PROCESS.md`).
- **Deploy:** `app.lock.show` auto-builds from `main`; the marketing site is triggered by its
  **deploy hook** (auto-deploy unreliable — documented workaround). Both `vercel.json` files carry
  a smart `ignoreCommand` build-skip (diff-gated) and the SPA-fallback rewrites (§13.4.4).
- **Alias-promote:** site releases are alias-promoted to the live domain (e.g. rel-site-2026.07.15-3
  → SHA `9a18249` alias-promoted, rollback anchor `6f01e56` per `VERSIONS.md`).
- **Per-track versioning:** app `rel-app-YYYY.MM.DD[-n]`, site `rel-site-YYYY.MM.DD[-n]`, embed
  mirrors app, DS = Codex semver, DB = migration head N. Every release records the DS version it
  implements.

#### 13.6.3 Rollback anchors & backups

- **SHA is the authoritative rollback anchor** (git tags are LOCAL-ONLY — the integration cannot
  push tags, 403). Every deploy records its SHA (+ prior SHA) in `docs/DEPLOY-LOG.md` and
  `docs/VERSIONS.md`; Vercel retains every past deployment, so rollback = re-point production to the
  previous deployment or reset `main` to the previous SHA and redeploy.
- **Rollback rehearsal** is itself a must-pass launch row (G21, post-404 lesson).
- **Backups: OWED/OPEN.** Structural (destructive) migrations are gated on **Supabase Pro backups
  ON** (owner, ~$25/mo) — backups are the prerequisite for any structural migration (021 fold,
  workspace_type rename), NOT for additive ones like 032/035.

#### 13.6.4 Migration runbook

1. Author `NNN_name.sql` + `NNN_name.down.sql`; **diff against 001–035 first** — never recreate an
   existing table (idempotent `if not exists` / `drop policy if exists` throughout).
2. Additive + idempotent unless backups are ON. Firewall check: no score/percentile/rank/head-count
   column; bands + method labels only.
3. Apply to the single Supabase project (SQL editor) **before** the code that depends on it; verify.
4. Keep 021 **frozen** until its lockstep code change (constants.js/db.js/orgs.js vocabulary) ships
   in the same wave — otherwise every AI-pipeline claim insert fails `claims_visibility_check` and
   the labeling loop silently stops writing.
5. Record the new head in `VERSIONS.md`; update analytics CANON in lockstep if event names change
   (file=DB=app).

---

### 13.7 Q8 — the production-readiness gate (definition)

"Q8" is referenced across the spec as the pre-production gate but is under-defined. Reconstructing
from `docs/releases/rel-2026.07.13-PLAN.md §4` and `docs/VERSIONS.md`:

#### 13.7.1 What is actually documented (the Q1–Q8 lanes)

QA runs in **two stages; the version is invalid until all pass.** **Stage 1** (Q1–Q7) runs on the
**immutable candidate SHA on the isolated preview** — never against production. **Stage 2** is live
smoke + **Q8 = Maria's owner acceptance walk** (sole assignee, no delegate).

| # | Lane | Owner | Evidence |
|---|---|---|---|
| Q1 | Pre-deploy gate: `npm run verify` (nav 34 · i18n purity · build · demo) + `next build` | Claude | CI output in release doc |
| Q2 | Live fingerprints: served JS/pages contain this release's markers; **embed hash matches app** | Claude | fingerprint list + hashes in DEPLOY-LOG |
| Q3 | Real-browser flows: signup (email + Google), artist journey, booker link open, workspace switch, producer magic link | Cowork | screenshots + pass/fail table |
| Q4 | Mobile pass: 360px screenshots (Radar, roster, Passport, recipient flow) | Claude (Playwright demo) + Cowork (real devices) | PNGs |
| Q5 | **Firewall scan on live surfaces:** no score/%/rank/gauge; bands + binaries + method labels only | Claude | grep + visual check |
| Q6 | **Terminology scan:** 0 forbidden terms; buyer never rendered as אמרגן | Claude | scan output |
| Q7 | Version governance: VERSIONS + DEPLOY-LOG + roadmap updated; ledger row added | Claude | Cowork cross-audit |
| **Q8** | **Owner approval walk** → ledger flips to "approved" (Stage 2 production acceptance) | **Maria ONLY** | her word, recorded |

Q8-READY (the pre-condition for Maria's walk) = all lanes green on **one frozen SHA**: Cowork Q1–Q7
EN/HE + Codex Q4 + GPT delta audit + CFRO final-RC check. Rollback rule: any Q1–Q6 failure on live →
immediate redeploy of the previous SHA, fix on branch, re-run from Q1.

#### 13.7.2 The Q8 owner walk — an 8-point production-readiness checklist (**PROPOSED**)

The lanes above define *who runs what*, but the **content** of Maria's Q8 walk — the concrete things
she personally confirms before saying the word — is not enumerated anywhere. The following 8-point
walk is **PROPOSED**, consistent with the firewall, the launch DoDs (`LAUNCH-DOD-2026.07.13.md`),
and the two-stage protocol. It is run by the owner on the **exact promoted SHA**, after Stage-1
Q1–Q7 are green:

1. **Firewall, seen with her own eyes.** Open a real published Passport as an anonymous buyer: no
   score / percentile / rank / gauge / "%" anywhere; draw appears only as bands + binaries + method
   labels; streaming is secondary. (Backs Q5 at the human layer.)
2. **"Nothing publishes without you."** Confirm an auto-labeled, un-reviewed claim is **invisible**
   on the public Passport until the artist approves it (`artist_approved` gate) — the single most
   important product promise.
3. **Two-view integrity.** The Artist (private) view shows gaps; the Buyer (public) view shows
   verified strengths only. The same Passport, no private gap or `mirror-only`/working-only item
   leaking into the buyer view.
4. **Terminology & language.** Hebrew buyer copy never renders the buyer as אמרגן (buyer = מזמין
   הופעות / booking manager); no forbidden score vocabulary; EN/HE parity on the P0 screens.
5. **The core loop end-to-end, live.** Artist signup → add evidence → claim labeled/reviewed →
   publish → buyer opens the link → sends an availability request → artist's bell rings. On real
   devices at 360px (backs Q3/Q4). Includes a producer magic-link confirmation upgrading a claim to
   `producer-confirmed`.
6. **Multi-Act non-transfer.** A second Act starts **empty**; evidence from Act A never appears on
   Act B's Passport; workspace/Act switch re-gates correctly and copies nothing (G3 boundary).
7. **Deep-link durability & rollback readiness.** Hard-refresh a deep app route (e.g.
   `/app/settings`) → the SPA boots, session survives, no 404 eject (the P1 fix). The prior SHA is
   recorded as the rollback anchor and a rollback rehearsal has passed (G21).
8. **Governance & legal complete.** VERSIONS + DEPLOY-LOG + roadmap updated (Q7); AI spend caps
   active; legal/privacy/accessibility pages signed off (G20a–c); pilot QA data excluded from Gate
   signal counts (G16). Only then does the ledger column flip to **approved**.

**Gate outcome:** Q8 pass = the owner's recorded word. It is the boundary between "Q8-READY" (all
lanes green on a frozen SHA) and "PRODUCTION-READY" (atomic merge + deploy + live smoke + rollback
anchor). The product-stage Gate itself (business milestone) remains: **one booking manager reacts to
a real Passport AND one pays** — measured, not required, pre-launch.

---

### 13.8 Open items & owed deliverables (consolidated)

| Ref | Type | Item |
|---|---|---|
| 13.1.1 / 13.4.4 | OWED | CI embed-sync hash gate (or single-canonical-bundle redirect) to kill embed/standalone skew |
| 13.2.1 | OPEN | ≥038 authoring: fold 021 vocabulary + workspace_type rename — gated on Pro backups (Pro ✅ 16 Jul; still needs its own sequenced rollout) |
| 13.2.2 | OPEN | Live consent-scope vocabulary is the pre-021 set until 021 (or equivalent) lands |
| 13.4.2 | OWED | Org invite-token expiry (producer tokens have a 14-day TTL; invite tokens do not) |
| 13.4.2 / 13.5.5 | OWED | Producer token hashing (036 is a DRAFT; tokens are plaintext today) |
| 13.5.3 | OWED | Shared safe-select helper + CI server-payload firewall test (no RLS backstop on the service-role path) |
| 13.5.4 | OWED | Real per-token AI cost accounting (current monthly ledger is an estimate); persistent rate/daily counters |
| 13.5.5 | BUILT (app) / OWED | App CSP + HSTS + nosniff + Referrer/Permissions-Policy SHIPPED (vercel.json, 15 Jul). OWED: marketing-site headers (S2p), nonce-hardening of the gtag inline script, and the BFF/httpOnly-cookie upgrade to remove the localStorage-XSS session-theft class |
| 13.6.3 | OWED | Supabase Pro backups ON (prerequisite for structural migrations) |
| 13.7.2 | PROPOSED | The 8-point Q8 owner-walk content (lanes are defined; the walk's checklist is not) |

*Ambiguities flagged for the owner:* (a) migrations 027/028 carried "requires owner approval before
applying" headers — they are treated here as **applied** because 030 fixes a recursion bug that only
027 introduces and 031 depends on 022's `artist_approved`, but the live head recorded in VERSIONS is
stated as 035 without an explicit 027/028 "applied ✓" mark; confirm. (b) The `docs/canon/
B4-40.10-Technical-Spec.md` and `docs/CODEX-FUNCTIONAL-CONTRACTS.md` files exist in the tree but this
section was grounded directly in the migrations + source, which are the authoritative build; if
those canon docs assert a different value, code wins per the firewall/lockstep rules and the delta
should be reconciled.

---

## 14. Measurement, Payments & Notifications

_Master-spec section 14. Grounded in the live repo (migrations 001–035, `src/lib/*`, `server/index.js`) as of 2026-07-15. Where the spec describes a target that is not yet built, it is marked **OWED** (must be built) or **OPEN** (a decision not yet locked). Everything not so marked is verified in code._

### 14.0 Scope and firewall posture

This section covers three tightly-coupled systems:

1. **Measurement** — the first-party product-analytics canon (`analytics_event`), its GA4 counterpart, and the read models the owner/advisor use to read the pilot.
2. **Payments** — the dormant, free-pilot payment model (Bit + manual reconciliation) and what turns on after the Gate.
3. **Notifications** — the in-app bell (built) and the transactional-email catalog (mostly OWED).

**Firewall (absolute, applies to every subsystem here).** No score, percentile, rank, "bookability %", prediction, or gauge is ever computed, stored, or emitted — not to the artist, not to the buyer, and **not to GA4**. Analytics may count **product events** (how many passports were published, how many reactions arrived); it may never store or transmit a **number _about a person_** (draw, followers, fee, a derived quality score). This is enforced in code: `src/lib/analytics.js` header — _"`properties` carries ids/roles/context only — NEVER a score, percentage, rank, or count-about-an-artist."_ Reaction-insight that returns to the artist is method-safe bounded text only (see §14.6), never a count/%/score. No third-party pixel sits on or near any evidence surface.

---

### 14.1 Analytics event canon

The canon is a **single source of truth expressed three times**, kept byte-identical by hand (drift was found twice, hence the discipline):

| Layer | Location | Role |
|---|---|---|
| App CANON | `src/lib/analytics.js` → `const CANON` | The generator. Only names in this Set persist to the DB. |
| DB CHECK | `analytics_event.event_name` CHECK | The gate. A name absent from the CHECK fails the insert (harmlessly → localStorage only). |
| Migration of record | `034_event_canon_unpublish.sql` | The applied CHECK; header: _"the analytics event CHECK now equals the app CANON exactly (29 events)."_ |

#### 14.1.1 The CHECK reconciliation — 28 vs 29 (current true count = **29**)

There are two constraint generations in the migration history, and they differ by exactly one event:

| Migration | Events in CHECK | Note |
|---|---|---|
| `024_measurement_and_share.sql` | 14 | Original taxonomy. `analytics_event` table created here. |
| `028_discovery_analytics_plans.sql` | **28** | Adds the 14 M1-funnel events. **Omits `passport_unpublished`.** |
| `034_event_canon_unpublish.sql` | **29** | Widens the CHECK to add `passport_unpublished`, reconciling DB = app CANON. **This is the applied, current constraint.** |

**The "28 vs 29" is a real, resolved drift, not an ambiguity.** Before 034, the app CANON already contained `passport_unpublished` (making 29 in code) while the DB CHECK allowed only 28 — so `passport_unpublished` inserts failed the CHECK and fell back to localStorage-only (documented inline at `analytics.js:29` and in `ADMIN-PANEL-SPEC.md §E.3`). Migration 034 closed the gap. **Current true count = 29** in all three layers.

> **Verify-on-apply (OWED check):** 034 is written "AS APPLIED, reconciled by Cowork+owner 13 Jul." Confirm against the live DB that 034 is actually applied before relying on `passport_unpublished` persisting; until confirmed, current-unpublished state is read from `artists.published = false` and republish cadence from repeated `passport_published` (per `ADMIN-PANEL-SPEC.md §E.3`).

#### 14.1.2 The full event canon (29 persisted events)

Legend — **Sink**: `DB` = in CANON, persists to `analytics_event`; **Key?**: ✅ = a milestone that is also a GA4 key event / Gate proof (see §14.2, §14.4). Trigger boundary = the exact moment `logEvent()` fires.

| # | Event name | Fires when (trigger boundary) | Subject / entity | Key? |
|---|---|---|---|---|
| 1 | `signup_started` | Signup form begins (OWED — see wiring note) | Person (anon) | |
| 2 | `signup_completed` | Supabase `signUp()` returns success | Person | ✅ |
| 3 | `login` | `signInWithPassword()` success | Person | ✅ |
| 4 | `oauth_login` | OAuth (Google) callback resolves a session | Person | |
| 5 | `consent_granted` | Consent banner "accept" | Person | |
| 6 | `consent_withdrawn` | Consent withdrawn (settings) | Person | |
| 7 | `onboarding_started` | Onboarding step 1 opens (OWED) | Artist | |
| 8 | `onboarding_completed` | 2-screen onboarding finished | Artist | ✅ |
| 9 | `radar_opened` | Artist opens the Radar | Artist | |
| 10 | `evidence_added` | An evidence artifact is submitted | Artist evidence | |
| 11 | `gig_evidence_refresh_completed` | AI claim pipeline finishes a run | Artist evidence | |
| 12 | `claim_confirmed` | Artist approves an extracted claim | Claim | |
| 13 | `claim_published` | A claim reaches `passport-ok` on a public Passport | Claim | |
| 14 | `passport_published` | Artist publishes the Passport (`artists.published=true`) | Passport version | ✅ |
| 15 | `passport_unpublished` | Artist unpublishes (staleness/republish cadence signal) | Passport version | |
| 16 | `act_created` | A second/subsequent Act is created | Act | |
| 17 | `act_switched` | Active Act is switched | Act | |
| 18 | `workspace_switched` | Active workspace (org) is switched | Membership | |
| 19 | `share_link_created` | Artist copies/creates a tagged share link | Share link | |
| 20 | `share_link_opened` | A public Passport is reached via a `?s=1` link (once per visit) | Share link | |
| 21 | `passport_view` | A published Passport is **opened** (NOT a reaction — P0-5) | Passport version | |
| 22 | `availability_request_created` | Booking manager submits the availability-request form | Availability request | ✅ **Gate ½** |
| 23 | `availability_request_responded` | Artist replies to a request | Availability request | |
| 24 | `professional_reaction_submitted` | A qualified buyer submits a professional reaction | Professional reaction | ✅ **Gate signal** |
| 25 | `producer_confirmation_sent` | Artist mints a producer-confirm magic link | Producer confirmation | |
| 26 | `producer_confirmation_received` | Producer answers the confirm link | Producer confirmation | |
| 27 | `payment_reference_created` | Artist marks "I've paid" → creates a Bit reference | Entitlement (intent) | ✅ **pay-intent** |
| 28 | `entitlement_activated` | Operator activates a paid entitlement | Entitlement (verified) | ✅ **Gate ½ (pay)** |
| 29 | `account_deleted` | Account deletion completes | Person | |

**Dev-only events (NOT persisted — absent from CANON, localStorage-ring only):** `onboarding_step`, `claim_visibility_changed`, `request_whatsapp_click`, `settings_opened`, `delete_account_requested`, `language_changed` (`analytics.js:104–109`). These are dev-inspection breadcrumbs; adding any to the DB requires widening the CHECK (a new migration) **and** the CANON Set, in lockstep.

**Wiring status (re-verified in code 16 Jul).** Most events are live. **Genuinely unwired = FOUR:** `signup_started`, `onboarding_started`, `oauth_login`, `claim_published` — 0 emit sites in `src/`/`server/`. **Correction:** `share_link_created` (`ArtistDashboard.jsx:184`) and `share_link_opened` (`Passport.jsx:75`) **ARE wired** — an earlier list (and an external audit) called them unwired; verified they fire. None of the four blocks the pilot; each is **OWED** in the next build push. Treat unwired events as "instrumented-not-firing": a zero count means "not yet wired," not "did not happen" (§14.2 declared≠measured).

#### 14.1.3 Two sinks (both best-effort — analytics must NEVER break a user action)

`logEvent(name, props)` writes to two sinks, each wrapped so a failure is swallowed:

1. **localStorage ring buffer** (`gigproof_events`, max 100) — dev/offline inspection, always on.
2. **`public.analytics_event`** — only if `!DEMO && supabase && CANON.has(name)`. Direct client insert (RLS `ae_any_insert` allows anon + authenticated INSERT) so it works on `app.lock.show` **and** the static `lock.show/app` embed with no server dependency. Operator-only SELECT (`ae_operator_read`); no UPDATE/DELETE path (append-only).

`analytics_event` columns (024): `id, event_name, session_id, actor_user_id, actor_role, passport_version_id, act_id, properties (jsonb), created_at`. The client currently writes `event_name, actor_user_id, actor_role (props.role), properties`. **`session_id`, `passport_version_id`, `act_id` are schema-present but not populated by the current client writer** (`analytics.js:58–63`) — **OWED** if per-Passport / per-Act / anonymous-session funnels are needed.

#### 14.1.4 GA4-vs-Supabase split (the governing rule)

| | **Supabase `analytics_event`** | **GA4 (property 544738110 / `G-ZX907M2NY8`)** |
|---|---|---|
| Role | **Product truth** — the full 29-event funnel, the Gate, all owner/CFRO reads | **Bounded acquisition milestones only** (~5–6, see §14.2) |
| Firewall scope | Internal counts allowed (operator surface); never a per-person score | Even stricter: only coarse milestone counts, **no PII, no per-person number, no score** |
| Consent | First-party, append-only, RLS-gated | Consent Mode v2, gtag injected **only on grant** (`ConsentBanner.jsx`) |
| Retention | Owned, indefinite (product record) | Google's default GA4 windows |
| Read path | Bounded read models (`admin_business_overview` RPC, SECURITY DEFINER + operator check) — client never free-queries raw analytics | Google Analytics UI / GSC |

**Rule:** the business is measured from Supabase; GA4 exists to attribute _acquisition_ (which channel produced signups) and nothing more. The two are never reconciled row-for-row — they answer different questions.

**Evidence-surface scope-out (owner ruling 18 Jul, audit T-55 — BUILT):** GA4 never loads while the
viewer is on an evidence surface — `/passport/*`, `/confirm/*`, or evidence routes. Both consent
banners guard the load (`ConsentBanner.jsx` app-side; `consent-banner.tsx` site-side for the
404-bounce moment, riding the M-15 train): consent is still recorded, the pixel simply waits for a
non-evidence route. No third-party pixel touches a Passport, confirm ceremony, or evidence screen.

#### 14.1.5 What actually fires (measurement status — audit T-55 · 18 Jul 2026)

The funnel as it MEASURES today (per §2.8 this corrects any implication that all 29 events flow):

| Stage | Status |
|---|---|
| Site | GA4 page views only, consent-gated (defaults denied). No custom site events. |
| Site→app bridge | **FIRING (wired T-55)** — first-touch `utm_*` + referrer + landing path (+ `?s=1` share marker) captured once per browser at app open (`captureFirstTouch()`, first-party localStorage), attached to `signup_completed`. |
| App entry | `signup_completed` · `login` · `onboarding_completed` FIRING (live rows verified). Unwired canon names: `signup_started`, `oauth_login`, `onboarding_started`, `consent_granted/withdrawn`. |
| Build | FIRING: `evidence_added` · `claim_confirmed` · `gig_evidence_refresh_completed` · `passport_published/unpublished` · `act_created/switched` · `workspace_switched` · `producer_confirmation_sent`. Unwired: `claim_published`, `producer_confirmation_received` (server writes `claim_confirmed` on producer-yes — naming mismatch, recorded). |
| Distribution | `share_link_created` / `share_link_opened` FIRING; share→signup join now computable via first-touch attribution. |
| The Gate | `passport_view` (+ first-party `return_visit` marker) · `professional_reaction_submitted` · `availability_request_created` — **FIRING**. |
| Payment | `payment_reference_created` WIRED-BUT-DORMANT (behind `VITE_PAYMENTS_ENABLED`, OFF by owner ruling until M-8 pricing; fires the moment the flag flips) · `entitlement_activated` WIRED live (operator activate) · `availability_request_responded` unwired. |
| Retention | **FIRING (wired T-55 — the owner's named gap)**: restored sessions emit `login {via:'session-restore', returning:true}` once per tab-session (first-party seen-marker); manual logins carry `returning`; repeat buyer opens carry `return_visit`. Operator read model: `fetchRetention()` → §8.12 retention tiles (returning accounts = distinct real accounts on >1 calendar day · repeat Passport opens). `account_deleted` unwired. |

_Demo integrity: demo builds persist nothing; live operator reads filter `is_demo=false` (037 + T-52)._

---

### 14.2 Measurement architecture

#### 14.2.1 One GA4 property, segmented by `surface`

There is **one** GA4 property (544738110), one measurement ID **`G-ZX907M2NY8`**, wired at page level on **both** surfaces — the marketing site (`website-next` `layout.tsx` default) and the app (`index.html`) — with Consent Mode v2 defaults-denied, gtag injected only after consent grant, `localStorage gigproof_consent`, 12-month re-ask (`CONSENT-BANNER-SPEC`, `SESSION-MEMORY`).

Because it is **one stream for two surfaces**, every hit must be segmentable by a **`surface`** dimension so `lock.show` (marketing) and `app.lock.show` (product) never blur. The dimension set:

| Custom dimension | Values | Purpose |
|---|---|---|
| `surface` | `site` \| `app` | Separate marketing from product (mandatory — one property, two surfaces) |
| `route_name` | route path/name | Which screen (not a raw URL with ids) |
| `actor_role` | `artist` \| `booker` \| `agency` \| `producer` \| `operator` \| `anon` | Funnel-by-role (never pooled into a person score) |
| `auth_state` | `anon` \| `authed` | Pre- vs post-login |
| `environment` | `production` \| `preview` | Exclude preview/QA traffic |

> **Status: these five GA4 custom dimensions are OWED.** The current wiring is page-level GA4 with Consent Mode; there is **no event-level `gtag()` dual-emit in `src/`** (grep confirms none). Registering the custom dimensions in GA4 admin and emitting them is a build task.

#### 14.2.2 Dual-emit of the bounded milestones

A small, fixed set of milestones is emitted to **both** sinks — to Supabase (full fidelity) and, in coarse form, to GA4 (acquisition attribution). GA4 receives **only** these:

| Milestone (GA4 key event) | Supabase canon event | Emit to GA4? |
|---|---|---|
| `sign_up` | `signup_completed` | ✅ |
| `login` | `login` | ✅ |
| `onboarding_complete` | `onboarding_completed` | ✅ |
| `passport_publish` | `passport_published` | ✅ |
| `availability_request` | `availability_request_created` | ✅ |
| `purchase` | `entitlement_activated` | **Only when payments are live** (§14.5) — omitted during the free pilot |

That is 5 during the pilot, 6 post-Gate. Each GA4 payload carries **only** `surface/route_name/actor_role/auth_state/environment` — never an id, name, email, or any per-person number. **Status: the dual-emit layer is OWED** (Supabase side of these events is largely live per §14.1.2; the GA4 mirror is not yet wired).

#### 14.2.3 Search Console (GSC)

Google Search Console is linked as a **domain property** with a submitted sitemap (14 URLs) — `CONNECTIONS-REGISTRY`. GSC covers organic acquisition on the marketing surface; it is not a product-analytics source and never touches evidence surfaces. Link GSC ↔ GA4 so query/landing-page data joins acquisition milestones.

#### 14.2.4 "Declared ≠ measured" honesty

Every metric surface must distinguish three states and never collapse them:

- **Measured** — the event is wired and firing; the count is real.
- **Declared-not-instrumented** — the event exists in canon but its writer is not yet wired (§14.1.2 unwired list, or P1 metrics like improvement-cycles/gig-debriefs). Render as **"not instrumented yet," never as `0`** (`ADMIN-PANEL-SPEC §E.6`).
- **Excluded** — demo/seed data filtered out (§14.3).

The read-model contract (`admin_business_overview(window_key, entity_filter)`, `ADMIN-PANEL-SPEC §E.7`) discloses on every response: generated-at / data-through timestamps, vocabulary version, the missing-instrumentation list, demo-exclusion status, and per-metric unit/denominator/source/limitation. Funnels are split **per entity** (artist / manager / buyer / production / confirmer / site) — no single mixed funnel, no cross-unit conversion rates (`§E.4`).

---

### 14.3 Demo / test-data exclusion

Two distinct populations must be kept out of business metrics; they are excluded by **two different mechanisms**, and only the first is fully solved today.

#### 14.3.1 DEMO-mode builds — fully excluded (verified)

`export const DEMO = import.meta.env.VITE_DEMO === '1'` (`src/lib/demo.js`). The analytics writer short-circuits before any DB insert: `persist()` returns immediately if `DEMO` is true (`analytics.js:55`). **A demo build (`vite build --mode demo`) never writes a single `analytics_event` row.** Demo fixtures (PERLMAN et al., `demo@lock.test`) therefore cannot pollute metrics — they exist only in-memory. This is airtight.

#### 14.3.2 Seed / `@gigproof.test` accounts — **excluded via `is_demo` (BUILT — 037 applied 17 Jul + Gate-tile read filter 18 Jul)**

The 5 seed personas (`artist@`, `booker@`, `producer@`, `agency@`, `operator@gigproof.test`, password `Gigproof!2026`, `scripts/seed.mjs`) are **real Supabase auth users on the live DB**. When they act, `DEMO` is false, so their events **do persist** to `analytics_event`. The three-part design is now delivered:

1. ✅ **BUILT — migration 037** (`is_demo boolean not null default false` on `analytics_event`; owner-applied + verified 17 Jul): conservative backfill marked seed/`@gigproof.test` actors + operator-role rows as demo (verified 43 demo / 3 real); anonymous public passport views deliberately stay `is_demo=false` — a real anonymous view IS real demand context. Partial index serves the operator read path.
2. ✅ **BUILT — Gate-tile read filter** (`gateCounts.js` adds `.eq('is_demo', false)`; 18 Jul): the operator Gate tiles count **outside activity only**, and the section note discloses the exclusion ("Seed and test-account activity is excluded from these counts", EN+HE).
3. **Remaining delta (small, honest):** the disclosure today is a **section-level note** over the Gate tiles, not the per-tile "demo-excluded" badge `ADMIN-PANEL-SPEC` sketched; and non-Gate admin numbers (artists/requests/claims lists) count rows, not analytics events — they are inventories, not demand metrics, and carry no exclusion claim. Per-tile badges remain a polish item, not a Gate blocker.

New demo actors must be created through the seed script (so backfill/convention marks them) — an ad-hoc test account created outside `scripts/seed.mjs` would count as real until marked.

---

### 14.4 The Gate measurement

**The Gate (canon):** _1 booking manager reacts to a real Passport **AND** 1 pays._ Monetisation is **measured, not required**; no price/ICP is locked until the Gate is met (CLAUDE.md, `PILOT-MEASUREMENT-MAP`).

#### 14.4.1 The exact events that prove each half

The admin Gate tile renders **three columns** — reaction, pay-intent, verified-pay — and must never present intent as payment (`ADMIN-PANEL-SPEC §E.5`):

| Gate half | Proving event(s) | Source of truth | What it means |
|---|---|---|---|
| **A booking manager reacts to a real Passport** | `professional_reaction_submitted` (the Gate signal) — with `availability_request_created` as the concrete buyer action | `analytics_event` + `professional_reaction` table (018) + `availability_requests` | A qualified buyer took a professional action on a **published, real** Passport. `passport_view` alone is explicitly **NOT** a reaction (P0-5, 024 header). |
| **One pays** | **Intent:** `payment_reference_created` → **Verified:** `entitlement_activated` | `analytics_event` + `entitlements` table (007) | Only `entitlement_activated` (operator-verified) counts as **paid**. `payment_reference_created` is willingness-to-pay **intent**, shown in its own column, never merged into the paid count. |

`availability_request_created` fires from `AvailabilityRequest.jsx:81` after a successful submit; `payment_reference_created` from `OfferPayment.jsx:52` after `createEntitlement`; `entitlement_activated` when the operator flips an entitlement to `active` (007 RLS: only `is_operator()` may UPDATE).

#### 14.4.2 How a REAL reaction is distinguished from a demo/seed one

Layered defenses, strongest first:

1. **Published-artist gate (server + RLS).** `POST /api/availability-request` rejects any request unless `artists.published = true` (`server/index.js:609–613`); `passport_view_event` anon-insert RLS also requires a published artist (024). A reaction can only attach to a real, published Passport.
2. **View ≠ reaction (P0-5).** The two are separate tables/events and must never be merged; a Gate half requires the reaction event, not a view.
3. **Demo build emits nothing** (§14.3.1) — a demo reaction never reaches the DB.
4. **Seed exclusion (✅ BUILT, §14.3.2).** The `is_demo` flag (037, applied 17 Jul) + the Gate-tile read filter (`gateCounts.js`, 18 Jul) exclude seed/`@gigproof.test`/operator activity — the Gate tiles now count outside activity only. Residual operator diligence: before *declaring* the Gate met, still eyeball that the reacting party is a genuinely unknown outside buyer (the flag guards known seed actors; it cannot classify a teammate's personal account created outside the seed script).

> **Gate honesty rule:** the Gate is declared met **only** when a `professional_reaction_submitted` / `availability_request_created` from a non-demo, non-seed buyer coincides with an `entitlement_activated` — both surviving §14.3 exclusion. Intent (`payment_reference_created`) never satisfies the pay half.

---

### 14.5 Payments

#### 14.5.1 Free pilot — payments DORMANT (verified)

Canon G17: **no payment CTA or screen at launch.** The flag:

```
export const PAYMENTS_ENABLED = import.meta.env?.VITE_PAYMENTS_ENABLED === '1'   // constants.js:30
```

`PAYMENTS_ENABLED` gates **both** the route and the CTAs — "not linked from nav" was explicitly rejected as an unsafe boundary (GPT A5 / Codex P0). In `App.jsx:175` the `/artist/offer` route renders `OfferPayment` **only** when the flag is on, otherwise `<Navigate to="/artist/home" replace />`. With the flag off (pilot default), the payment surface is unreachable, not merely unlinked.

#### 14.5.2 The dormant model — Bit + manual reconciliation (built, gated off)

When the flag is on, `OfferPayment.jsx` implements a fully manual, no-Stripe flow (migration 007 `entitlements`):

| Step | Actor | Mechanism | Event / state |
|---|---|---|---|
| 1. See offer | Artist | `/artist/offer` (Founding Passport). Price = existing range copy, **not locked** | — |
| 2. Pay | Artist | **Bit** to operator number `054-4555060` (shown in-app, not a secret), with a deterministic reference `GP-<first4 of artist id, uppercased>` added to the transfer note | — |
| 3. "I've paid" | Artist | `markPaid()` → `createEntitlement(artistId, userId, "GP-XXXX · ₪<amt> · Bit")` | `entitlement.status = 'pending'` · **`payment_reference_created`** (pay-intent) |
| 4. Reconcile | Operator | Matches the `GP-XXXX` reference in the Bit app; activates in `/admin` (007 RLS: operator-only UPDATE) | `entitlement.status = 'active'` · **`entitlement_activated`** (+ actor) |
| 5. Confirmation | Artist | Screen reflects `pending` → `active`, shows the date the confirmation was received + calm "operator will activate you" note; the artist is **never stuck** | — |

The reference code (`GP-` + 4 chars) is the manual join key between the artist's Bit note and the operator's reconciliation — there is no payment-provider webhook, by design.

#### 14.5.3 Receipts / invoices / ledger — gaps (OWED)

| Capability | Status |
|---|---|
| Automatic receipt to the payer | **OWED** — none. `amount_note` is a free-text string, not an invoice. |
| Tax invoice (Israeli חשבונית) | **OWED / OPEN** — not modeled; commercial launch will require it (needs entity/ח.פ., postal address — still placeholder per `SESSION-MEMORY`). |
| Payment ledger / reconciliation log | Partial — `entitlements` rows + operator `audit` (011) record activation + actor; there is no double-entry ledger or Bit-statement reconciliation view. **OWED** for post-Gate. |
| Refund / cancellation flow | Partial — `entitlements.status` supports `cancelled` (007 CHECK) but no UI/flow. **OWED.** |
| Price | **OPEN** — deliberately unlocked until the Gate (CLAUDE.md: "no price/ICP locked until then"). `OfferPayment` uses range copy. |

#### 14.5.4 What turns on post-Gate

After the Gate (1 reaction + 1 pay, §14.4), the owner may: flip `VITE_PAYMENTS_ENABLED=1` (surfacing `/artist/offer` and CTAs), lock a price, add the `purchase` GA4 milestone (§14.2.2), and prioritise the receipts/invoice/ledger OWED items. Plan gating already has a home: `organization.plan_flags jsonb` (028) — app reads, operator writes, **never rendered as a score/level to buyers** (028 comment). No provider (Stripe/etc.) is assumed; the Bit-manual model is the current committed path until a business case justifies otherwise.

---

### 14.6 Notifications and email

Two channels: the **in-app bell** (built) and **transactional email** (mostly OWED). They are independent — the bell does not depend on email.

#### 14.6.1 In-app bell — built (`src/lib/notifications.js`, migration 002 `notifications`)

- Table `notifications(user_id, type, body, link, read, created_at)`; RLS `notif_self` → a session lists/marks-read **only its own** rows.
- **Writing for another user** goes through the service-role server route, never the client. Two writers:
  - `POST /api/notify` (`server/index.js:555`) — caller must **own the target artist** OR be `operator`; closed type enum `request_received | confirmation_received | system`.
  - `POST /api/availability-request` (`:588`) — **public** (bookers have no login); creates the request **and** the artist's bell notification server-side, with a **server-authored body** (`en.notifications.newRequest(name)`) so anonymous free text can never be injected into someone's bell.
- **Firewall:** `body` is bounded text from `T.notifications.*` templates (`i18n/en.js:648`: `newRequest`, `passportPublished`, `confirmationArrived`) — never a raw score/%/count.
- **Offline-embed limitation (honest):** on the static `lock.show/app` embed with no server, an availability request still records via direct RLS insert, but **no cross-user bell can be written** (RLS is `user_id = auth.uid()`) — the artist sees the request in their inbox, without a bell ping (`AvailabilityRequest.jsx:73–79`).

#### 14.6.2 Transactional email catalog (mostly OWED)

**Auth emails today are sent by Supabase Auth (GoTrue) built-in templates, not by an app-side provider.** The app only sets the redirect target:

| Email | Trigger | Delivery today | Redirect / token | Status |
|---|---|---|---|---|
| **Signup confirmation** | `supabase.auth.signUp()` (`AuthProvider.jsx:111`) | Supabase Auth built-in | `emailRedirectTo = origin + BASE_URL` (surface-aware: `/` app vs `/app/` embed) | Live via GoTrue; branding/FROM = **OWED** (Resend) |
| **Magic-link — password reset** | `resetPasswordForEmail()` (`ForgotPassword.jsx:25`) | Supabase Auth built-in | `redirectTo = origin + BASE_URL + reset-password` → `/reset-password` route | Live via GoTrue |
| **Magic-link — producer confirm** | `POST /api/request-confirmation` mints a token → artist sends the link **manually** (like `wa.me`) | **No email** — link is handed off by the artist | `/confirm/:token` (`ProducerConfirm.jsx`) | By design manual; optional auto-email = OWED |
| **Org invite** | `inviteMember()` → `/invite/:token` (`AcceptInvite.jsx`) | **Not sent** — `resendInvite()` is a no-op stub: _"email provider is Phase-2"_ (`orgs.js:212`) | `/invite/:token` | **OWED** (email provider) |
| **Availability-request notification to the artist (the Gate reaction)** | `POST /api/availability-request` (`server/index.js:619`) | **In-app bell only** — no email | link `/artist/requests` | **Email OWED — see below** |

**The critical one — how the artist learns a buyer reacted.** This is the artist-facing half of the Gate signal, and today it is delivered **only as an in-app bell**. If the artist is not in the app, they do not learn a booking manager reacted until they next open it. For a pre-booking trust tool whose entire Gate hinges on a buyer reaction reaching the artist, an **email (and/or WhatsApp) notification on `request_received` is OWED and high-priority.** The server already has the trigger point (`:619`), the recipient (`artists.created_by`), and a server-authored bounded body — it needs an email transport. Firewall holds: the email body must stay method-safe bounded text, never a count/score about the buyer or the reaction.

#### 14.6.3 Resend — planned, not active (OWED)

**Resend is the chosen provider for transactional/auth email but is not wired** (`SESSION-MEMORY` P1-11; `COSTS.md`: _"Resend for auth emails (free tier)"_). Target FROM address `notifications@lock.show` (the `notifications` inbox already exists on the domain, alongside `hello/privacy/support/...`). Until Resend is wired: signup-confirm and password-reset ride Supabase Auth's default sender; org invites are **not emailed at all** (stub); the availability-request email does **not exist**.

#### 14.6.4 Magic-link delivery / expiry rules

| Link | Generator | Expiry / single-use |
|---|---|---|
| Signup confirm & password-reset (GoTrue) | Supabase Auth | Governed by Supabase Auth token TTL (GoTrue default; configurable in the Auth dashboard) — **OWED: document the exact TTL once confirmed in the dashboard.** |
| Producer-confirm | `randomUUID()` token in `producer_confirmations` (`server/index.js:650`) | Token persists on the row; **no explicit expiry/rotation in schema — OWED** if time-boxing is required. Revoke clears the confirmed label. |
| Org invite | token on the invited membership row | Persists until accepted/cancelled; `cancelInvite` removes the row. No TTL — **OWED** if invites should expire. |

All redirect targets are **surface-aware** (`BASE_URL` → `/` standalone vs `/app/` embed) so a link never bounces to the wrong deployment (`AuthProvider.jsx:107`, `ForgotPassword.jsx:20`).

#### 14.6.5 Email template bodies (authored — implement verbatim when Resend is wired)

FROM `LOCK <notifications@lock.show>`. Plain, warm, one action each. **Firewall:** no count/score/rank
about a person or a reaction anywhere — the availability-request email says *that* a buyer asked, never
*how many*. All bodies bilingual; send in the recipient's stored language, default Hebrew for `.co.il`
signups. `{name}`, `{link}` are the only interpolations; no free buyer text is ever inserted.

| Key | Subject (EN · HE) | Body (EN) | Body (HE) | CTA → |
|---|---|---|---|---|
| `email.request` (the Gate email, high-pri) | "Someone asked about your date" · "מישהו שאל על התאריך שלך" | "Hi {name} — a booking manager just asked about your availability through your LOCK Passport. It's a question, not a booking or a hold. Open your Requests to see it and reply." | "היי {name} — מזמין הופעות בדיוק שאל על הזמינות שלך דרך הפספורט שלך ב-LOCK. זו שאלה, לא הזמנה ולא שריון. פתח את הבקשות שלך כדי לראות ולהשיב." | "See the request" / "לצפייה בבקשה" → `/artist/requests` |
| `email.confirmSignup` | "Confirm your email" · "אישור כתובת המייל" | "Welcome to LOCK, {name}. Confirm your email to start building your Passport." | "ברוך הבא ל-LOCK, {name}. אשר את כתובת המייל שלך כדי להתחיל לבנות את הפספורט." | "Confirm email" / "אישור מייל" → confirm link |
| `email.reset` | "Reset your password" · "איפוס סיסמה" | "We got a request to reset your LOCK password. If it was you, use the link below — it expires soon. If not, ignore this email." | "קיבלנו בקשה לאיפוס הסיסמה שלך ב-LOCK. אם זה היה אתה, השתמש בקישור שלמטה — הוא יפוג בקרוב. אם לא, התעלם מהמייל." | "Reset password" / "איפוס סיסמה" → reset link |
| `email.invite` | "{org} invited you to LOCK" · "{org} הזמינו אותך ל-LOCK" | "{org} invited you to join their workspace on LOCK. You choose what you share and can revoke access any time." | "{org} הזמינו אותך להצטרף למרחב העבודה שלהם ב-LOCK. אתה מחליט מה לשתף ויכול לבטל גישה בכל עת." | "Accept invite" / "לקבלת ההזמנה" → `/invite/:token` |
| `email.confirmed` | "Your detail was confirmed" · "פרט אומת" | "Good news, {name} — a source confirmed a detail on your Passport. It now shows a confirmed method label." | "חדשות טובות, {name} — מקור אישר פרט בפספורט שלך. הוא מוצג כעת עם תווית שיטה 'מאומת'." | "See your Passport" / "לפספורט שלך" → `/artist/passport` |

_Transport still OWED (Resend key). The **spec is complete** — these bodies are implementation-ready; wiring is the only remaining step (§14.6.3)._

---

### 14.7 OWED / OPEN register (build-from checklist)

| Ref | Item | Type | Priority |
|---|---|---|---|
| 14.1.1 | Confirm migration 034 is APPLIED on the live DB (unblocks `passport_unpublished` persistence) | OWED (verify) | High |
| 14.1.2 | Wire the **four** remaining events: `signup_started`, `onboarding_started`, `oauth_login`, `claim_published` (share_link_created/opened verified already wired 16 Jul) | OWED | Med |
| 14.1.3 | Populate `session_id` / `passport_version_id` / `act_id` on the client writer (per-Passport/Act/anon funnels) | OWED | Med |
| 14.2.1 | Register + emit GA4 custom dimensions `surface/route_name/actor_role/auth_state/environment` | OWED | High |
| 14.2.2 | Build the GA4 dual-emit layer for the 5 pilot milestones (`gtag()` on grant) | OWED | High |
| 14.3.2 | ~~Add `is_demo` to `analytics_event` + read-model exclusion~~ ✅ **BUILT** (037 applied 17 Jul; Gate-tile filter + disclosure note 18 Jul). Remaining polish: per-tile "demo-excluded" badge | ✅ done (badge = polish) | was High (Gate integrity) — closed |
| 14.4.2 | ~~Seed/`@gigproof.test` exclusion before the Gate can be declared "genuine outside buyer"~~ ✅ **BUILT** (same delivery; §14.4 rule 4 keeps the operator eyeball) | ✅ done | was High — closed |
| 14.5.3 | Receipts, tax invoice (חשבונית), payment ledger/reconciliation view, refund flow | OWED | Post-Gate |
| 14.5.3 | Price / ICP | OPEN | Locked only after Gate |
| 14.6.2 | **Availability-request email/WhatsApp to the artist on `request_received`** (Gate reaction reaches the artist off-app) | OWED | High |
| 14.6.3 | Wire Resend (FROM `notifications@lock.show`); org-invite emails currently not sent (stub) | OWED | Med-High |
| 14.6.4 | Document GoTrue token TTLs; decide producer-confirm & invite token expiry/rotation | OWED / OPEN | Med |
| 14.5.4 | Add `purchase` GA4 milestone + flip `VITE_PAYMENTS_ENABLED` when payments go live | OPEN | Post-Gate |

---

_Sources of record: `src/lib/analytics.js`, `src/lib/constants.js`, `src/lib/demo.js`, `src/lib/notifications.js`, `src/features/artist/OfferPayment.jsx`, `src/features/passport/AvailabilityRequest.jsx`, `src/features/auth/{AuthProvider,ForgotPassword}.jsx`, `src/App.jsx`, `server/index.js`; migrations 002, 007, 018, 024, 028, 034; `docs/PILOT-MEASUREMENT-MAP.md`, `docs/ADMIN-PANEL-SPEC.md`, `docs/SESSION-MEMORY.md`, `docs/CONNECTIONS-REGISTRY.md`, `docs/COSTS.md`._

---

## 15. Legal, Consent & Localization

**Master-spec section 15 · LOCK (lock.show) · Israeli market, bilingual EN + HE**
**Status: consolidating draft — grounded in the repo as of 15 Jul 2026. Legal copy is DRAFT pending counsel (task #23); HE microcopy below is the piece the rest of the spec DEFERS and is delivered here.**

> **Firewall (governs this whole section).** No score / percentile / rank / "bookability %" / prediction / gauge anywhere — including in legal, consent, or localized copy. Draw is shown ONLY as bands + binaries with method labels. Streaming is secondary context. Reaction insight back to the artist is method-safe text only, never a count/%/score. Every string in §15.4 was checked against this rule.

---

### 15.0 Scope & sources

This section specifies three things and delivers a fourth:

1. **Legal** — the documents LOCK must publish, their real content and status, and the data-handling model behind the consent-gated public-footprint scan.
2. **Consent** — the consent UX and the record model that proves it.
3. **Localization architecture** — the EN + HE, Israeli-first i18n system, its RTL rules, and the font ruling.
4. **The delivered Hebrew string set** — canon HE microcopy for the key screens as EN→HE tables (the deferred piece).

**Grounded in (repo paths, all under repo root):**

| Area | Source of truth in repo |
|---|---|
| Legal copy (live pages) | `website-next/app/terms/terms-content.tsx` · `website-next/app/privacy/privacy-content.tsx` · `website-next/app/accessibility/accessibility-content.tsx` |
| Legal drafts (source) | `docs/legal/TERMS-HE.md` · `docs/legal/PRIVACY-HE.md` · `docs/legal/ACCESSIBILITY-HE.md` · `docs/legal/CONSENT-BANNER-SPEC.md` |
| Consent UX (app) | `src/features/auth/ConsentLegal.jsx` · `src/components/ConsentBanner.jsx` |
| Consent record model | `supabase/migrations/001_initial_schema.sql` (table) · `021_vocabulary_and_consent.sql` (scope canon) · `src/lib/db.js` (`recordConsent*`, `hasConsent`, `getConsents`, `requestAccountDeletion`) |
| i18n string tables | `src/lib/i18n/en.js` · `src/lib/i18n/he.js` (app) · `website-next/messages/en.json` · `he.json` (site) |
| Localization status | `docs/LOCALIZATION-MATRIX.md` |
| HE canon vocabulary | `docs/GLOSSARY.md` · `docs/ENTITY-GLOSSARY.md` |
| Session/legal state | `docs/SESSION-MEMORY.md` |

---

### 15.1 LEGAL

#### 15.1.1 Required documents & status

LOCK publishes three legal documents, each as a bilingual page (HE source + faithful EN translation) rendered by the shared `LegalDocument` component from a typed `LegalContent` object.

| Document | Route | Repo content file | Version / status | Blocking gap |
|---|---|---|---|---|
| **Terms of Use** (תנאי שימוש) | `/terms` | `website-next/app/terms/terms-content.tsx` | v0.1 · 8 Jul 2026 · **DRAFT for counsel** (task #23) | jurisdiction city `[עיר]`, refund/cancellation policy `[to be completed]`; HE source uses retired word "Mirror" (canon-flag) |
| **Privacy Policy** (מדיניות פרטיות) | `/privacy` | `website-next/app/privacy/privacy-content.tsx` | v0.2-corrected · 8 Jul 2026 · **DRAFT for counsel** (task #23) | controller legal name, business/ח.פ. number, postal address, phone |
| **Accessibility Statement** (הצהרת נגישות) | `/accessibility` | `website-next/app/accessibility/accessibility-content.tsx` | v0.1 · 8 Jul 2026 · **DRAFT** (task #27) | coordinator name + phone, last-updated date, real remediation-pass results; furthest from ready |

Each page renders a persistent **draft notice** ("טיוטה בבדיקת יועץ משפטי — נוסח לא סופי" / "Draft under legal review — not final"). This banner MUST remain until counsel signs off; removing it is a counsel-gated action, not an engineering one.

**Vocabulary firewall on legal copy.** The Terms HE source still contains the retired word **"Mirror" / המראה** for the artist's private view. Canon retired it (one Passport, shown in views; the private view is **האזור הפרטי / הרדאר**). The EN translation already substitutes "the artist's private view"; the **HE Terms source must be re-aligned before publication** (GLOSSARY.md row: Mirror/המראה is forbidden). Privacy v0.2 is already aligned (uses פספורט / האזור הפרטי הרדאר; "מראה" does not appear) — this is why it is v0.2-corrected.

#### 15.1.2 Regulatory framework

LOCK operates from Israel, serves Israeli demand-side buyers, and uses infrastructure that stores data outside Israel (Supabase, Vercel, Anthropic — all US-region). Two regimes therefore apply simultaneously:

- **Israeli Privacy Protection Law 5741-1981, including Amendment 13** (בתוקף מ-14.8.2025 / in effect from 14 Aug 2025). The Privacy Policy explicitly names it and dates it. Amendment 13 obligations reflected in the drafts and code:
  - A named **database controller** (בעל השליטה במאגר המידע) who determines purposes and means — §1 of the Privacy Policy (placeholder for the legal entity).
  - Data-subject rights: access, correction, deletion/closure, withdrawal of optional consent, marketing opt-out (§13).
  - Purpose limitation and a stated lawful basis per purpose (§6).
  - Breach handling per the incident-response duty (§12).
  - The **30-business-day deletion SLA** surfaced to the user in Settings (`settings.deleteWarning`: "כל הנתונים יימחקו תוך 30 ימי עסקים לפי תיקון 13").
- **GDPR** — for any EU visitor (the marketing site is world-reachable). Reflected via:
  - Consent Mode v2 with **default = denied** before any analytics fires (see §15.2.1).
  - Cross-border transfer disclosure (§10 of the Privacy Policy) with "appropriate measures … agreements, undertakings or other safeguards."
  - The same access/rectification/erasure/withdrawal rights, which GDPR and Amendment 13 largely align on.

> **DPO / representative — OPEN.** Neither draft appoints a Data Protection Officer or an Israeli/EU representative. Whether Amendment 13 or GDPR Art. 27/37 requires one for LOCK's scale is a **counsel question** — listed OPEN in §15.1.6.

#### 15.1.3 Data handling — the consent-gated public-footprint scan

The product's distinctive data operation is the **deep public-footprint scan**: at onboarding the artist gives a name + one strong link, and LOCK reads the artist's *own public footprint* to surface candidate evidence, which the artist then confirms. This is the **TARGET architecture** (multi-source deep scan once at onboarding, ≈$1 target cost, cheap incremental re-scans) — **not yet built**, and per CLAUDE.md no business case may price or assume it until measured. §15 specifies its legal envelope so the build is compliant by construction.

**Governing principles (already stated in Privacy §4, §7):**

- The scan reads **the artist's own public footprint only**, in the context the artist provided ("from a public source you referred us to"). The Privacy Policy explicitly disclaims systematic third-party scraping: *"The Service is not intended to perform systematic scraping, continuous monitoring, or covert collection of information about artists."*
- **Nothing is published automatically.** Scanned material becomes candidate claims shown to the artist for review, correction, or removal *before any publication* (Privacy §7; consent copy "nothing reaches your Passport — or even your private view — without your explicit confirmation").
- **Server-side AI, minimized payload.** Evidence is routed through LOCK's servers to Anthropic, not browser→provider; only the minimum needed for labeling is sent; no excess third-party PII is forwarded (Privacy §7).

**What is collected (Privacy §3.1–3.7):**

| Category | Examples | Notes |
|---|---|---|
| Account & identity | name, stage name, email, phone (optional), hashed password/login id, role, org | required minimum to operate an account |
| Professional info | genre, region, bio, media links, lineups, experience, **draw as bands**, community size stored as a **working-only integer** (`community_count_declared`), **shown publicly only as a band** | firewall: ranges/bands, never exact draw numbers on the public surface |
| Evidence & documents | public links, screenshots, ticket/settlement exports, pro documents | user warrants authority; excess third-party PII must not be uploaded; LOCK may redact/reject |
| Claims & processing outputs | extracted data points, source, **method label**, verification date, status, version history, **consent records** | method labels are canon (see §15.4) |
| Availability requests | requester name, org, event type/date/location, capacity/budget **band**, message | demand-side inbound |
| Technical/security | IP, device/OS/browser, login times, pages, security events, necessary cookies | |
| Payment (pilot) | payer name, amount, date, reference, invoice details (via Bit / transfer) | no payment credentials stored |

**Lawful basis by purpose (Privacy §6 + Amendment-13 mapping):**

| Purpose | Basis |
|---|---|
| Open/operate account, deliver the service | performance of the service the user requested |
| Build the private Radar; organize/label evidence | consent (`privacy-processing` scope) |
| Read the artist's public footprint for candidate evidence | **explicit per-connection consent** (`thirdparty-evidence` scope) — see §15.2.2 |
| Publish the public Passport | **separate explicit consent** (`public-publication` scope) |
| Payments, invoices, accounting | legal/accounting obligation |
| Security, abuse prevention, fault handling | legitimate operation of the service |
| Marketing messages | **separate optional consent** (`marketing` scope), withdrawable anytime |

#### 15.1.4 Retention & deletion

Retention rule (Privacy §11): keep data only as long as needed for its purpose; then delete, anonymize, or restrict. Specifics already committed:

- Account data — while the account is active.
- Evidence/content — while the user keeps using it.
- Published Passports + versions — retained to manage publication and document user actions.
- Availability requests — for handling, documentation, service improvement.
- **Consent, security, and audit records — retained longer, to demonstrate legal compliance** (this is why deletion is not a raw `DELETE` of everything — see below).
- Payment/accounting documents — for legally required periods.
- Backups — purged on backup/operational cycles.

**Account deletion → data (the user-facing SLA):** Settings exposes "Request data deletion" with the copy *"This action is irreversible. All your data is deleted within 30 business days, as Israeli privacy law requires"* (`settings.deleteWarning` / `.deleteSubmitted`). The flow is a **request that is recorded, not an instant purge**: `requestAccountDeletion(userId)` writes a `consent_records` row with `scope='account-deletion'`, `status='withdrawn'` (see §15.2.3) — an auditable withdrawal event — and the operator console runs the actual cascade delete via `adminDeleteArtist(artistId, reason)`, which **writes an audit row before the cascade** (firewall/due-process) and requires a mandatory reason. Operator-side deletion is surfaced in the admin console (`admin.deleteData`, `admin.deleteAuditNote`: "Irreversible — this will be written to the audit log").

> **Retention-period values — OWED.** The policy commits to "legally required periods" and "as long as necessary" but does **not** yet state concrete durations (e.g. accounting = 7 years per Israeli tax law; audit/consent logs = N years). Counsel must fill exact numbers; until then the drafts stay qualitative on purpose.

> **Data portability / export (Amendment-13 & GDPR "right to access").** An **operator-side export exists** today — `adminExportArtist(id)` (OP12, `AdminDashboard.jsx:130/277`) generates a subject's data archive on request. A **self-serve user-facing export** (a "Download my data" button in Settings → JSON/ZIP of `claims`, `evidence`, `consent_records` for the `person_id`) is **OWED** — the right-to-access is currently satisfied by an operator action, not self-service. Add the self-serve endpoint before wider/paid launch. Firewall-safe (the export must exclude `internal_confidence` and any exact-count column, exactly like `buildSafePayload`).

#### 15.1.5 Consent record model (legal view)

The `consent_records` table (defined in `001_initial_schema.sql`, scope canon set by `021_vocabulary_and_consent.sql`) is the legal proof-of-consent store. Full field/behavior detail is in §15.2.3; legally the salient points are:

- Every consent, withdrawal, and deletion request is an **append-only timestamped row** tied to the auth user (`subject_id`), never an in-place flag flip — so the history is provable.
- Row-Level Security (`consent_self`) means a subject sees only their own records; the operator console reads them for compliance oversight (`admin.consentsTitle` / `getAllConsents` limited to 200 latest).
- The four Amendment-13 canonical scopes are enforced by a DB `CHECK` constraint (see §15.2.3) so an out-of-canon scope cannot be written.

#### 15.1.6 OPEN placeholders — need owner + counsel

These are the live `[…]` placeholders in the published legal pages, plus structural counsel questions. **All block final publication.** (Cross-referenced from `SESSION-MEMORY.md` "Legal/compliance set" and "Official channels".)

| # | Placeholder / question | Where | Owner action |
|---|---|---|---|
| L-1 | **Controller legal name** (שם העוסק/החברה) | Privacy §1, §19 | owner provides registered entity name |
| L-2 | **Business / ח.פ. number** | Privacy §1 | owner provides |
| L-3 | **Postal address** (כתובת למשלוח דואר) | Privacy §1, §19 | owner provides |
| L-4 | **Jurisdiction city** `[עיר]` for courts | Terms §9 | owner + counsel |
| L-5 | **Refund / cancellation policy** `[to be completed]` | Terms §5 | owner + counsel (gated on pilot-price decision) |
| L-6 | **Accessibility coordinator** — name + phone + last-updated date | Accessibility §"contact" | owner appoints; real remediation pass (task #27) |
| L-7 | **DPO / representative** — required? | not present in drafts | counsel ruling (Amendment 13 / GDPR Art. 27/37) |
| L-8 | **Concrete retention periods** | Privacy §11 | counsel provides durations |
| L-9 | **Terms "Mirror"→private-view re-alignment** in HE source | Terms HE §1 | copy fix before counsel sign-off (canon) |

Known contact inboxes already wired (do not need counsel, per SESSION-MEMORY "Official channels"): `privacy@lock.show`, `legal@lock.show`, `support@lock.show` (accessibility), `hello@lock.show`. Phone/WhatsApp `+972544555060`.

---

### 15.2 CONSENT

LOCK uses **two independent consent surfaces** that must not be confused:

1. a **cookie/analytics consent banner** (site + app), and
2. **four in-product consent scopes** captured in context and stored in `consent_records`.

Canon rule (from `ConsentLegal.jsx` and consent copy): **nothing is ever bundled.** Each scope is asked at the moment it becomes relevant, never as one upfront wall.

#### 15.2.1 Cookie / analytics banner — Consent Mode v2

**Ruling: Consent Mode v2, BASIC implementation, default = denied.** GA4 (`G-ZX907M2NY8`) does **not** load until the user grants; on grant, `analytics_storage` flips to `granted` and the GA4 script is injected (basic model — the tag is withheld entirely pre-consent, rather than the advanced model where cookieless pings are sent while denied). Rationale: the pilot has no ad pixels and no need for pre-consent modeling; basic is the privacy-maximizing and simplest-to-defend choice, and matches the shipped code.

Grounded in `src/components/ConsentBanner.jsx` and `docs/legal/CONSENT-BANNER-SPEC.md`:

- **Default denied on first paint** (spec): `ad_storage/analytics_storage/ad_user_data/ad_personalization = 'denied'`, `wait_for_update: 500`, before any GA call.
- Bottom banner, keyboard-accessible (`role="dialog"`, `aria-label`), **direction-aware** (`dir = lang==='he' ? 'rtl' : 'ltr'`), links to `/privacy`.
- **Accept** → `gtag('consent','update',{ analytics_storage:'granted' })` → inject GA4 → `config` with `anonymize_ip: true`. **Decline** → stays denied, GA4 never loads.
- **Persistence & re-ask:** choice stored in `localStorage` key `gigproof_consent` as `{value, at}`; **re-ask after 12 months** (`MAX_AGE_MS = 365d`; spec allows 6–12) or on policy change. A "שנה העדפות / change preferences" control lives in the footer (site: `consent.preferences`).
- **Acceptance criteria (spec):** zero GA network calls before consent; reject path sends zero analytics; RTL/Hebrew correct; WCAG AA; do not bundle marketing/ad pixels unless/until paid ads exist.

> **🐛 SHIPPED DEFECT (app banner) — carry into the build board.** `LOCALIZATION-MATRIX.md` flagged that `en.js`/`he.js` historically declared the `consent:` key **twice**, so the banner strings were shadowed to `undefined`. The current tables were since split into a distinct **`cookieConsent`** block (`en.js`/`he.js` lines 2–9) which `ConsentBanner.jsx` must read — **but the component still references `T.cookieConsent`** (it does, line 52: `const t = T.cookieConsent`), so this is resolved *if and only if* the component points at `cookieConsent`, not `consent`. Verified resolved in the current `ConsentBanner.jsx`. Keep the two blocks distinct: `cookieConsent` = the analytics banner; `consent` = the in-product scope copy.

#### 15.2.2 In-product consent — the four scopes, captured in context

Per `ConsentLegal.jsx`, all four scopes write through the **same** `recordConsentScope` path but fire at four different moments:

| Scope (canon value) | Fires where | Required? | Copy anchor (key) |
|---|---|---|---|
| `privacy-processing` | **inline checkbox on onboarding step 1** (never a full-screen wall before first value) — combines privacy-policy + data-processing | required to proceed | `consent.inlineTitle` / `consent.inlineAgree` |
| `thirdparty-evidence` | **at connect** — when the artist adds/authorizes a public source in EvidenceCapture | required to scan that source | `consent.evidenceTitle` / `consent.evidence` / `consent.evidenceGateCta` |
| `public-publication` | **at publish** — before the Passport goes live (onboarding step 7 / ArtistDashboard / ClaimReview) | required to publish only | `consent.publishTitle` / `consent.publishBody` / `consent.publishAgree` |
| `marketing` | **Settings toggle**, optional | never required | `consent.marketingTitle` / `consent.marketing` |

**Per-connection consent for the scan is the load-bearing promise.** Each scanned source is authorized individually, with the plain-language contract: *"we read only your public footprint; nothing is published until you confirm."* The evidence-capture copy already carries this (EN `evidence.authorityNote`: "By adding evidence you confirm you have authority over this source"; `evidence.communityPII`: never upload member lists — Israeli privacy law forbids it; we store the count only). The consent scope copy carries it too (`consent.evidence`: "collection and storage of evidence from public sources I authorize (links, ticket exports, documents)").

**Firewall in consent copy.** Privacy §7's consent-relevant clause is reproduced verbatim as product law: automated processing — deterministic or AI — *"does not, and will never, constitute a booking decision, score, ranking, percentile, prediction, or guarantee of any kind."*

#### 15.2.3 `consent_records` — table & fields

Defined in `supabase/migrations/001_initial_schema.sql`; scope canon in `021_vocabulary_and_consent.sql`; accessed via `src/lib/db.js`.

```
consent_records
  id                uuid  PK  default gen_random_uuid()
  subject_id        uuid  NOT NULL  → auth.users(id) ON DELETE CASCADE
  scope             text  NOT NULL   -- CHECK (see below)
  version           text  NOT NULL   -- policy/consent version string
  status            text  NOT NULL  default 'accepted'
                          CHECK (status in ('accepted','declined','withdrawn'))
  marketing_opt_in  boolean         default false
  timestamp         timestamptz NOT NULL default now()
RLS: consent_self — subject sees only their own rows
```

**Scope CHECK constraint (canon, migration 021):**
`scope in ('privacy-processing','public-publication','thirdparty-evidence','marketing','account-deletion')`

Migration 021 also **migrated legacy scope values** into canon and stashed originals in `scope_legacy`:
`privacy-policy`,`data-processing` → `privacy-processing` · `public-publish` → `public-publication` · `evidence-storage` → `thirdparty-evidence`.

**Access functions (`db.js`):**

- `recordConsent(rec)` — raw insert (full row).
- `recordConsentScope(userId, scope, extra)` — inserts `{subject_id, scope, version:'v3-inline-gates', status:'accepted', ...extra}`.
- `hasConsent(userId, scope)` — true if an `accepted` row exists.
- `getConsents(userId)` / `latestConsent(userId)` — history, newest first.
- `requestAccountDeletion(userId)` — inserts `{scope:'account-deletion', version:'v1', status:'withdrawn'}`.

> **⚠ CONSENT-SCOPE — reconciled to §13.2's ledger (021 FROZEN, NOT applied).** The **live** `consent_records` has **no scope CHECK** — migration 001 defines `scope text not null` with *no* constraint, and migration 021 (which would *add* `check (scope in ('privacy-processing',…))`) is **frozen / not applied** (§13.2.1). So today the live DB accepts **any** scope string; neither the legacy pair nor the canon value is rejected. **Applied fix (16 Jul):** `recordPrivacyConsent` now writes the single **canon `privacy-processing`** (and the read path matches) — chosen because it is **forward-compatible** (already correct for when 021 or a re-authored canon-scope constraint lands) and internally consistent (write = read). *(Note: existing rows written under the old `privacy-policy`/`data-processing` names — if any pre-Gate — won't match a `hasConsent('privacy-processing')` read and would re-prompt; acceptable pre-Gate, or add a one-time backfill when the canon constraint is applied.)* Separately: `version` strings differ across call sites (`v3-inline-gates` vs `v1` vs `(v2)`) — pick one versioning scheme and record the policy version actually shown.

#### 15.2.4 Withdrawal

- **Optional consents** (marketing) — withdrawable anytime: unsubscribe link in every marketing message + Settings toggle (Privacy §15; `settings.consents`). Withdrawal never affects service/transactional messages.
- **Publication** — the artist can unpublish the Passport at any time (`consent.publishBody`: "I can unpublish at any time"). Caveat disclosed (Privacy §8): copies already saved/forwarded by third parties cannot be recalled.
- **Third-party evidence / representation grants** — artist-granted access is revocable (`representation.revoke`, `access.*` scopes; "a grant, never ownership").
- **Account/data deletion** — the withdrawal-of-everything path in §15.1.4.

---

### 15.3 LOCALIZATION ARCHITECTURE

#### 15.3.1 Principles (owner law — `LOCALIZATION-MATRIX.md`, `SESSION-MEMORY.md`)

- **Launch language is HEBREW.** EN and HE must **each** be complete and professional on their own — HE is not "EN with Hebrew sprinkled in," and EN must not regress to service-Hebrew.
- **Never mixed within a rendered screen.** A user in HE mode sees 100% Hebrew — no English leftovers. (Missing HE keys currently deep-merge to English, which produces exactly the forbidden mixed screen — see gaps below.)
- **Built for language scaling.** i18n keys complete, **no hardcoded strings**, RTL/LTR both native, per-key fallback. EN + HE now (both first-class); Russian + German next.
- **Firewall/method-label vocabulary is identical in both languages** per `GLOSSARY.md`.

#### 15.3.2 The key system (no hardcoded strings)

Two parallel i18n systems, by surface:

| Surface | System | Shape | Consumer |
|---|---|---|---|
| **App** (`src/`) | `src/lib/i18n/en.js` + `he.js` exporting `T` (+ `BANDS`, `PROFILE_ITEM_TYPES`) | nested JS object; leaf values are strings **or functions** for interpolation (e.g. `stepOf: (s,total) => …`, `confirmBody: (email) => …`) | `LangContext` provides `{ T, lang }`; components read `T.section.key`; **`LangContext` deep-merges HE over EN** so a missing HE leaf silently falls back to EN |
| **Site** (`website-next/`) | `messages/en.json` + `he.json` | flat-ish JSON namespaces (`nav, footer, home, passport, methodology, common, consent`) | `lib/locale-context.tsx`; `components/nav.tsx` `LocaleToggle` |
| **Demo fixtures** | `src/lib/demo.js` | `L(en, he)` bilingual getter per datum | language purity by construction |

Enforcement: `npm run lint:i18n` (`scripts/i18n-purity.mjs`) fails the build on hardcoded UI strings. Current baseline = **3 accepted violations**, all regex *matchers* in `src/lib/radarUniverse.js` (classifier patterns, not rendered copy) — marked `i18n-allow`, not real debt.

#### 15.3.3 Current matrix status (measured — `LOCALIZATION-MATRIX.md` v1.1)

| Surface | Coverage | Blocking gap for HE launch |
|---|---|---|
| **App `T`** | **~83.6%** (858 EN leaf keys · ~141 missing in HE, latest measure) | Core **Radar/universe** screens least translated (`radar.universe.*`, `radar.nextActions.*`, `radar.dimensions.*`), plus `evidence.*` intent-capture, `claims.*` review/approve, `onboarding.*` goal copy. Missing keys fall back to EN → mixed screens (forbidden). |
| **Site `messages/*.json`** | **100% key parity**, but `he.json` self-flagged `SCAFFOLD ONLY — requires native Hebrew editor review`; ~13 EN-identical values (mostly intentional fixed method-label tags) | needs a **native-editor QA pass**; key-parity ≠ launch-ready |
| **Site page prose** (`app/**/page.tsx`) | **~0% / ~18% of routes wired** | **STRUCTURAL / highest blocker:** 8 of 11 routes (`bookers, artists, producers, contact, how-it-works, pricing, faq, radar` — ~3,650 lines) are hardcoded English JSX with **no locale wiring at all** — nothing to translate until the prose is externalized into `messages/*.json`. The nav locale toggle is live on these pages but does nothing to their body. |
| **Legal pages** | bilingual HE+EN present | draft, counsel-gated (§15.1) |
| **Transactional email** | **un-auditable from repo** | almost certainly Supabase Auth default EN-only templates (dashboard-configured, not versioned); decide if HE transactional email is in the launch gate |

**Bottom line:** the **app** is one focused translation pass (~141 keys, Radar-first) from coverage; the **marketing site body** needs a structural externalization step before it can be Hebrew at all. Both need a native-editor professional-HE review; key-coverage is necessary, not sufficient.

#### 15.3.4 RTL rules

**Direction is derived from language, not hardcoded.** The pattern in `ConsentBanner.jsx` is canonical: `const dir = lang === 'he' ? 'rtl' : 'ltr'` and `dir={dir}` on the root of any directionally-sensitive block; the document root should carry `dir="rtl"` in HE mode.

Rules for the build:

- **Layout mirroring.** In HE (RTL) the whole page mirrors: reading order right→left, nav rail and back-arrows flip side, drop-shadows/gutters mirror. Use **logical CSS properties** (`margin-inline-start/end`, `padding-inline-*`, `inset-inline-*`, `text-align: start/end`) and Tailwind logical utilities (`ms-*/me-*`, `ps-*/pe-*` — already used, e.g. `ConsentLegal.jsx` `ms-2`) rather than physical `left/right`, so a single tree serves both directions.
- **What mirrors vs what does not.** *Mirror:* text blocks, form fields + labels, nav/menus, list bullets, progress/stepper order, chevrons/back-arrows, sheet slide-in side. *Do NOT mirror:* the LOCK wordmark/logo, brand-Latin names (artist/stage names stay Latin in both languages — see demo.js rule), media (photos/video), **method-label chips** (kept in English inside Hebrew text by design — see §15.4), and directional media controls that map to time.
- **Numbers, dates, direction handling.** Digits are Western Arabic numerals in both languages (bands like `₪2,000–5,000`, `50–150`, `60–90 דק׳` are identical strings in `he.js`/`en.js`). Currency symbol `₪` precedes the number in both. **Bidi isolation:** any string that mixes RTL Hebrew with LTR runs (URLs, emails, `@handles`, phone `+972…`, Latin brand names, method-label chips) must be wrapped so the LTR run does not visually scramble the Hebrew — use `dir="auto"`/`<bdi>` or Unicode isolates on interpolated values. This is especially important for the function-valued keys that interpolate names/links (e.g. `askedToConfirm(name)`, `whatsappMsg(...)`, `reviewedShort(d)`).
- **Icons/affordances.** Directional glyphs in strings must flip: HE uses `←`/`→` deliberately (e.g. `production.manageTeam: 'ניהול צוות ←'` vs EN `'Manage team →'`; `evidence.changeIntent: '← Different claim'`). Keep these as translated per-language strings, not shared, so the arrow points the right way.
- **Consent banner & legal pages** already set `dir` per language and must keep doing so; the `LegalDocument` component renders each language block in its own direction.

#### 15.3.5 Font ruling (the DS is silent on Hebrew — resolved here)

**Finding.** Two different font stacks ship, and they disagree on Hebrew:

- **App (`src/`, `tailwind.config.js` + `index.html`)** — **already Hebrew-capable.** Display = **Frank Ruhl Libre** (Hebrew + Latin serif) → Georgia → serif; Body/UI = **Heebo** (covers Hebrew) → system-ui → sans; Mono = IBM Plex Mono. All three loaded from Google Fonts. This stack renders Hebrew in the brand voice.
- **Marketing site (`website-next/app/layout.tsx`)** — **NOT Hebrew-capable.** It loads **Manrope** (Latin-only) via `next/font/google` into a CSS variable **misleadingly named `--font-heebo`**, with `fontFamily: 'var(--font-heebo), Manrope, system-ui, sans-serif'`. There is **no actual Hebrew font in the site stack** — Hebrew would fall back to the OS system font, breaking brand consistency. The design-system reference (Manrope body / Georgia display) is silent on Hebrew because it was authored Latin-first.

**Ruling (binding for the HE launch):**

1. **The app stack is correct — keep it.** Frank Ruhl Libre (display) + Heebo (body) is the canonical **Hebrew-capable** pairing and matches the DS intent (editorial serif display + clean sans body) while covering Hebrew.
2. **The marketing site must adopt the same Hebrew-capable stack before HE launch.** Load **Heebo** for body (replacing/co-loading with Manrope) and **Frank Ruhl Libre** for display, and **rename the `--font-heebo` variable to reflect what it actually loads** (today it loads Manrope, not Heebo — a latent trap). Do not ship Hebrew site copy on a Manrope-only stack.
3. **The DS must state a Hebrew stack explicitly.** The design system is silent on Hebrew; this section fills the gap: **display = Frank Ruhl Libre; body/UI = Heebo; both must be loaded wherever Hebrew renders.** Georgia/Manrope remain the Latin fallbacks only. (Flag to Codex/DS owner as a DS gap; the app is already compliant, the site is not.)
4. Weights already loaded (app): Frank Ruhl Libre 400/700/900, Heebo 400/500/600/700/800 — sufficient for HE headings and UI.

---

### 15.4 THE DELIVERED HEBREW STRING SET

This is the piece the rest of the master spec **defers**; it is delivered here. Strings below are drawn from the shipped `src/lib/i18n/he.js` where they exist (marked **✓ shipped**), and provided as **strong drafts** where a key is missing or where a screen needs ratified microcopy (**◐ PENDING owner taste**). All were checked against the firewall and against the canon HE vocabulary.

#### 15.4.0 Canon HE vocabulary (binding — `GLOSSARY.md`, `ENTITY-GLOSSARY.md`)

| Concept | HE canon term | Forbidden / note |
|---|---|---|
| Public buyer view | **פספורט** / הפספורט הציבורי | never **דרכון** (any form) |
| Artist private view | **האזור הפרטי (הרדאר)** | never **מראה / Mirror** (retired) |
| The bookable project | **אקט** (de-facto live term) | formal taste-ratification still pending; never invent a third term (not מופע/פרויקט in UI) |
| Source Confirmer | **מאשר-מקור** (only UI term) | "מפיק מאשר" = historical alias, docs only |
| Professional buyer | **מזמין הופעות** / מנהל בוקינג / פרומוטר | booking language OK for pros |
| Artist-side agent/office | **אמרגן / משרד אמרגנות** | **buyer is NEVER an אמרגן** (supply side only) |
| Private event client | **לקוח פרטי / מזמין אירוע** | warm, non-industry register; never venue jargon |
| Method labels | **kept in English inside HE text** by design | do NOT translate the chip tags |

**Method-label chips (universal tags — rendered in EN inside HE; HE gloss for reference only):**

| Chip (rendered) | HE gloss (`he.methodLabel`, for tooltips/reference) |
|---|---|
| PRODUCER-CONFIRMED | אושר ע"י מפיק |
| Evidence-supported | נתמך בראיות |
| Source-linked | מקושר למקור |
| Self-declared / Artist-declared | הצהרת האמן |
| Unable to verify | לא ניתן לאמת |
| Stale | לא עודכן לאחרונה |

#### 15.4.1 Onboarding (`onboarding.*`) — ✓ shipped

| Key | EN | HE |
|---|---|---|
| entryTitle | Your name on the flyer | השם שלך על הפלייר |
| entryHint | Two quick questions and your Radar takes over… | שתי שאלות קצרות — ומכאן הרדאר לוקח פיקוד ואוסף איתך את כל השאר, בקצב שלך. |
| entryLinkTitle | Your strongest link | הקישור החזק שלך |
| entryLinkHint | One link that shows you best — Instagram or SoundCloud. The Radar scans it… | קישור אחד שמציג אותך הכי טוב — אינסטגרם או סאונדקלאוד. הרדאר סורק אותו ומתחיל לבנות את ההוכחות שלך. |
| entryDeferNote | Photo, gigs, numbers… nothing else is asked now. | תמונה, הופעות, מספרים, שאר הקישורים — לא שואלים עכשיו. הרדאר יציף כל אחד מהם כצעד שקט הבא, כשזה רלוונטי. |
| entryStartScan | Scan it — open my Radar | סרוק — ופתח את הרדאר שלי |
| goalTitle | What are you trying to achieve? | מה אתה מנסה להשיג? |
| goalWhy | Your goal decides which evidence we prioritize — it never changes what is true. | המטרה קובעת אילו ראיות נקדם קודם — היא לעולם לא משנה מה נכון. |
| stepOf(s,total) | Step {s} of {total} | שלב {s} מתוך {total} |

*Consent inline (fires here):* `consent.inlineTitle` = **פרטיות ושימוש בנתונים** ; `consent.inlineAgree` = *אני מסכים למדיניות הפרטיות של LOCK ולעיבוד המידע שסיפקתי לצורך בניית הפרופיל שלי.* ✓ shipped.

#### 15.4.2 Radar inspector / universe (`radar.*`)

Mixed status — the North-Star next-actions and act-switch are ✓ shipped in HE; several `universe.*` leaves fall back to EN and are delivered here as **◐ PENDING** drafts to close the mixed-language gap.

| Key | EN | HE | Status |
|---|---|---|---|
| scanKickoff | Your Radar is live — strengths appear first; anything that needs you waits quietly below. | הרדאר שלך פועל — חוזקות מופיעות קודם; מה שצריך אותך מחכה בשקט למטה. | ✓ shipped |
| genrePrimary | Central in your genre | מרכזי בז'אנר שלך | ✓ shipped |
| nextActions.publish.title | Publish your Passport | פרסם את הפספורט שלך | ✓ shipped |
| nextActions.share.title | Share your Passport with a buyer | שתף את הפספורט עם מזמין הופעות | ✓ shipped |
| nextActions.replyRequest.title | A buyer is waiting — reply to the request | מזמין ממתין — ענה לבקשה | ✓ shipped |
| nextActions.refreshProof.why | Your newest evidence is over 90 days old… | הראיה החדשה ביותר שלך בת יותר מ-90 יום. ראיה טרייה מהופעה אחרונה שומרת את הדרכון עדכני. | ✓ shipped *(note: uses "הדרכון" — should read "הפספורט"; **fix — דרכון is forbidden**)* |
| dimensions.identity / liveDraw / trackRecord / community / readiness | Identity / Live draw / Track record / Community / Booking readiness | זהות / משיכה חיה / קורות מסלול / קהילה / מוכנות להזמנה | ◐ PENDING (EN-fallback today) |
| universe.planets.identity…proof | Identity & Story / Music & Catalogue / Live Show / Audience & Community / Professional Kit / Career Proof | זהות וסיפור / מוזיקה וקטלוג / הופעה חיה / קהל וקהילה / ערכת מקצוען / הוכחת קריירה | ◐ PENDING (EN-fallback today) |
| universe.whatItProves / whatItDoesNotProve | What it proves / What it does NOT prove | מה זה מוכיח / מה זה **לא** מוכיח | ◐ PENDING |
| universe.nothingNeedsYou | Nothing needs you right now. | אין כרגע שום דבר שדורש אותך. | ✓ shipped |
| actSwitch.newActHint | New act starts empty — evidence never transfers between acts | אקט חדש מתחיל ריק — ראיות לא עוברות בין אקטים | ✓ shipped |

> **Fix flagged:** `radar.nextActions.refreshProof.why` (he.js) contains **הדרכון** — replace with **הפספורט** (canon; דרכון forbidden). This is the one live firewall/vocabulary slip found in the shipped HE.

#### 15.4.3 Passport — buyer-facing (`passport.*`)

> **⚠ THREE ROWS RETIRED (U33/U23 — removed 16 Jul, see §18 + §2.2/§8.4).** `passport.chip` ("Verified professional profile" — a technical badge, U23), `passport.firewall`, and `passport.disclaimer` (the narrated firewall strip, U33) were **deleted from `PassportFooter` / the i18n bundle** — the firewall is enforced by the *shape* of the evidence, never printed. They are struck through below so no localizer re-introduces them. The remaining rows (per-section band/binary clarifiers) are shipped and correct.

| Key | EN | HE |
|---|---|---|
| ~~chip~~ RETIRED | ~~Verified professional profile~~ | ~~פרופיל מקצועי מאומת~~ |
| ~~firewall~~ RETIRED | ~~LOCK presents verified professional facts… No promises or predictions.~~ | ~~(removed — U33)~~ |
| ~~disclaimer~~ RETIRED | ~~THIS PASSPORT SHOWS VERIFIED STRENGTHS ONLY. NO SCORE · NO RANKING…~~ | ~~(removed — U33 narrated firewall strip)~~ |
| drawCaption ✓ | FIGURES SHOWN AS BAND — NO EXACT HEADCOUNT | מוצג כטווח — ללא ספירת ראשים מדויקת |
| checkAvailability ✓ | Check availability | בדיקת זמינות |
| communityCaption ✓ | CONTEXTUAL — NOT DRAW EVIDENCE | הקשר בלבד — לא ראיית משיכה |
| readinessCaption ✓ | BINARIES ONLY — READY OR NOT SHOWN | בינארי בלבד — מוכן, או לא מוצג |
| reviewedShort(d) ✓ | REVIEWED {d} | נבדק {d} |

#### 15.4.4 Requests / availability (`request.*`, `agency.*`) — ✓ shipped

| Key | EN | HE |
|---|---|---|
| request.title(name) | Availability check — {name} | בדיקת זמינות — {name} |
| request.subtitle | Fill in the details and the artist will get back to you. No commitment. | ממלאים פרטים, והאמן יחזור אליך. בלי התחייבות. |
| request.capacity | Expected audience (range) | קהל צפוי (טווח) |
| request.budget | Budget (range) | תקציב (טווח) |
| request.noCommitment | No commitment — this only asks the artist about the date. | ללא התחייבות — זו רק שאלה לאמן לגבי התאריך. |
| request.confirmBody(name) | {name} will get back to you soon. Thank you. | {name} יחזור אליך בקרוב. תודה. |
| agency.requestsEmptyHint | No requests yet. Share a published Passport link — availability requests land here. | אין בקשות עדיין. שתף קישור לפספורט מפורסם — בקשות זמינות נוחתות כאן. |

#### 15.4.5 Source-Confirmer (`producer.*`) — ✓ shipped (accountless one-claim flow)

Canon: this person is a **מאשר-מקור**; the `producer.*` namespace is the shipped code home for the one-tap confirmation ceremony. The confirmation is about ONE statement and never becomes a score.

| Key | EN | HE |
|---|---|---|
| oneStatementEyebrow | One-statement confirmation | אישור של הצהרה אחת |
| askedToConfirm(name) | {name} asked you to confirm one statement. | {name} מבקש ממך לאשר הצהרה אחת. |
| noAccountNote | No account needed. Your reply applies to this statement only. | בלי חשבון ובלי הרשמה. התשובה שלך חלה על ההצהרה הזאת בלבד. |
| confirmYes | Yes — this is accurate | כן — זה מדויק |
| confirmPartial | Partly right — needs a fix | נכון חלקית — צריך תיקון |
| confirmNo | No — this isn't accurate | לא — זה לא מדויק |
| confirmWrongPerson | I'm not the right person for this | אני לא האדם המתאים לזה |
| footnote | This confirmation refers to the specific statement above only — it is not a general endorsement and never becomes a score. | האישור הזה מתייחס אך ורק להצהרה הספציפית שלמעלה — הוא אינו המלצה כללית ולעולם אינו הופך לציון. השם שלך מוצג כפי שתבחר. |

> **◐ PENDING (terminology):** the UI-visible eyebrow/labels for this flow should surface **מאשר-מקור** where the role is named to the artist (e.g. request-to-confirm screens), even though the code namespace is `producer`. Current strings say "מפיק"; owner-ratify the swap to **מאשר-מקור** in artist-facing copy (`producer.requestTitle` → *בקש ממאשר-מקור לאשר* as a draft).

#### 15.4.6 Buyer / discover (`booker.*`) — ✓ shipped

| Key | EN | HE |
|---|---|---|
| booker.eyebrow | Booking manager | מזמין הופעות |
| booker.whatIsTitle | What is a LOCK passport? | מה זה פספורט LOCK? |
| booker.whatIsBody | A standardized evidence page an artist shares before you book them. Every claim carries its verification method and review date… never a score. | עמוד ראיות אחיד שאמן משתף איתך לפני שאתה סוגר אותו. כל טענה נושאת את שיטת האימות ותאריך הבדיקה שלה, ומשיכת קהל מוצגת כטווח — לעולם לא מספר מדויק, לעולם לא ציון. |
| booker.whatIsPoints[1] | Method-labeled claims — you see how each fact was verified | טענות עם תווית שיטה — רואים בדיוק איך כל עובדה אומתה |
| booker.whatIsPoints[2] | Draw as bands and binaries — no rankings, no predictions | משיכה כטווחים ובינאריים — בלי דירוגים, בלי ניבויים |

> **◐ PENDING (private-client register):** for the **private buyer** (wedding couple / private event — `לקוח פרטי`), the demand-side canon requires a **warmer, non-industry** variant of buyer copy — not "מזמין הופעות" venue jargon. No such register exists in `he.js` yet. Draft opener for owner taste: *"מזמינים אמן להופעה?"* / body avoiding booking jargon (style, fit, trust, availability). This is a **new string set OWED** once the private-buyer flow is built.

#### 15.4.7 Settings — deletion & consent (`settings.*`) — ✓ shipped

| Key | EN | HE |
|---|---|---|
| deleteWarning | This action is irreversible. All your data is deleted within 30 business days, as Israeli privacy law requires. | פעולה זו בלתי הפיכה. כל הנתונים יימחקו תוך 30 ימי עסקים לפי תיקון 13. |
| deleteSubmitted | Your data deletion request has been received. We will send a confirmation email and delete all data within 30 business days. | בקשת מחיקת הנתונים שלך התקבלה. אנו נשלח אישור לאימייל ונמחק את כל הנתונים תוך 30 ימי עסקים. |
| consentsContact | For full management contact: privacy@lock.show (DRAFT) | לניהול מלא צור קשר: privacy@lock.show (DRAFT) |

#### 15.4.8 Cookie banner (`cookieConsent.*`) — ✓ shipped

| Key | EN | HE |
|---|---|---|
| ariaLabel | Cookie consent | הסכמה לקובצי Cookie |
| message | We use analytics cookies to understand how the product is used. Essential cookies always work; measurement runs only with your consent. | אנחנו משתמשים בקובצי Cookie למדידה כדי להבין איך המוצר משמש אתכם. קובצי Cookie חיוניים פועלים תמיד; מדידה פועלת רק בהסכמתכם. |
| accept / decline | Accept / Decline | אישור / דחייה |
| privacyLink | Privacy Policy | מדיניות פרטיות |

#### 15.4.9 HE strings needing owner ratification (summary)

| # | Item | Draft / issue |
|---|---|---|
| H-1 | **`radar…refreshProof.why`** uses **הדרכון** | change to **הפספורט** (canon; firewall/vocabulary fix) — engineering fix, not taste |
| H-2 | **Radar `universe.*` / `dimensions.*` HE** | ~missing leaves fall back to EN (mixed screen); drafts in §15.4.2 need native-editor + owner sign-off |
| H-3 | **Source-Confirmer artist-facing labels** | swap visible "מפיק" → **מאשר-מקור** in artist copy; §15.4.5 draft — owner taste |
| H-4 | **Private-buyer (`לקוח פרטי`) register** | new warm, non-jargon string set OWED once the flow exists; §15.4.6 draft opener |
| H-5 | **`אקט` formal ratification** | de-facto live; owner taste-ratification pending (non-blocking) |
| H-6 | **Terms HE "Mirror"→private-view** | align HE legal source to canon before publication (L-9) |
| H-7 | **Site `he.json` scaffold** | native-editor QA pass; ~13 EN-identical values confirmed intentional or fixed |

---

### 15.5 Buildable-from checklist (what §15 hands the implementer)

- [ ] Legal: fill L-1…L-9 (owner + counsel); keep draft banners until sign-off; re-align Terms HE "Mirror".
- [ ] Consent banner: Consent Mode v2 **basic, default denied**; verify zero GA calls pre-consent; keep `cookieConsent` block distinct from `consent`.
- [ ] Consent scopes: fire the four scopes in-context (never bundled); **fix write path to emit canon scope `privacy-processing`** (not legacy `privacy-policy`/`data-processing`); unify `version` scheme.
- [ ] `consent_records`: enforce scope CHECK (canon 5 values); append-only; RLS `consent_self`; deletion writes audit row before cascade.
- [ ] Localization: translate ~141 app keys (Radar-first) to professional HE; externalize 8 site routes' prose into `messages/*.json` before any site HE; native-editor QA on `he.json`.
- [ ] RTL: `dir` from language everywhere; logical CSS props; bidi-isolate interpolated LTR runs; keep method-label chips EN.
- [ ] **Fonts: adopt Heebo (body) + Frank Ruhl Libre (display) on the marketing site; rename the mislabeled `--font-heebo` (loads Manrope); add a Hebrew stack to the DS.**
- [ ] Deliver §15.4 HE strings; resolve H-1…H-7 with owner.

---

*End of §15. Firewall re-verified across all copy in this section: no score / % / rank / prediction / gauge; draw only as bands + binaries with method labels; method-label chips kept in English by design.*

---

## 16. Taxonomy & Business

_Section 16 of the LOCK Master Product Specification. Standalone, grounded in the repo._
_Author lens: product strategy + data-taxonomy design. Status date: 15 Jul 2026._

> **Reading rules inherited from the master spec (§0.2):** the firewall (CLAUDE.md) is absolute
> and overrides everything; the glossary (§4 / `docs/GLOSSARY.md`) is binding; code identifiers are
> frozen (renames are governed migrations); **BUILT is never presented as TARGET**; unresolved items
> are marked **OPEN** (owner ruling) or **OWED** (a deliverable another party must supply).
>
> **Firewall reminder for this whole section:** nothing here may become a score, percentile, rank,
> "bookability %", prediction, or gauge. Genre weightings are INTERNAL prioritization only
> (`src/lib/genreWeights.js` header: "never rendered as a number, score, rank, percentage, genre
> leaderboard, public badge, or buyer-facing weakness"). Draw is shown only as bands + binaries with
> method labels. Streaming is secondary context.

---

### 0. Why this section exists

Today **genre and format are free text.** Verified in code and DB:
- `src/lib/genreWeights.js` resolves a family from `act.format` plus a *temporary* text heuristic
  (`FESTIVAL_HINT = /festival|psytrance|trance|rave/i`), explicitly accepted "until a controlled
  `scene_family` field ships with migration 034."
- `src/lib/radarUniverse.js` splits `artist.genre` on `/[\/,·]+/` — i.e. it parses a free-text string.
- `docs/TAXONOMY-REGISTRY-AUDIT.md` (8 Jul) confirmed: **"app genre tags are free text"**, the DB has
  **no `field_id`**, `claims.claim_type` is free text, and the real taxonomy (6 families · 55 subtypes ·
  32 DJ specializations · 42 instruments · 121 legacy labels) lives **only in a Google Sheet**, with
  Registry B empty. It flagged **migration 029 (bilingual reference tables)** as the fix, later
  re-scoped alongside the `scene_family` field at **migration 034**.

**This section is the reference registry the product needs** — the bounded, bilingual tables a
migration would create so that genre, format, venue/region, method/status, and source all stop being
free text and start being governed enums with EN + HE labels. Part A is the taxonomy. Part B captures
the documented business model and clearly flags what still needs the owner.

**Migration note (updated 17 Jul):** the migration head is already past 029 (VERSIONS.md; 021 FROZEN;
**037 `is_demo` applied 17 Jul; 036 stays `.DRAFT`** with its own rollout). The historical "029" label
from the taxonomy audit is superseded — **these reference tables should be authored as a NEW migration
(next free number ≥038), diffed against existing tables first (CLAUDE.md rule), never recreating
existing tables.** Wherever this section says "migration 029" or "036+" it means "the bilingual
reference-table migration, structure specified in §16.A.6.a."

---

### PART A — TAXONOMY

Each taxonomy below is presented as the reference table a migration would create: `id` (stable code /
enum value) · `EN` (locked English label) · `HE` (Hebrew label) · `notes`. Codes are `lower-kebab`
and are the frozen identifiers; labels are display-only and localize.

> **HE labels are OPEN for owner/Codex taste-ratification.** Per the standing HE-ruling rule
> (`docs/GLOSSARY.md`, SESSION-MEMORY), Maria owns the canonical Hebrew column and terms are never
> invented. The HE labels in the genre and venue tables below are *proposed seeds* — professional
> defaults for the owner to confirm or correct, not canon until she signs them.

---

### 16.A.1 Genre / scene taxonomy

Two layers, deliberately separated (the taxonomy audit's G4/D4 finding: don't collapse a rich scene
list into the coarse family used for planet weighting):

- **Layer 1 — Scene (`genre_scene`):** the music-scene the artist actually names (melodic techno,
  afro house, psytrance…). This is the free-text field today; the table below is what closes the gap.
- **Layer 2 — Family (`genre_family`):** the 8 bounded families in `genreWeights.js:GENRE_FAMILIES`
  that drive Radar planet emphasis. Every scene maps to exactly one family. Family is *also* derivable
  format-first (see §16.A.2), so scene→family is an override/refinement, not the only path.

#### 16.A.1.a — `genre_family` reference table (drives planet weighting — from `genreWeights.js`)

The six planets are: **identity · music · live · audience · prokit · proof** (`radarUniverse.js:PLANETS`).
"Primary" planets are where the family's evidence carries the most booking weight; they order
next-action guidance and planet emphasis **only** — never a public number.

| id (`genre_family`) | EN | HE (proposed) | Primary planets | Secondary planets | Notes |
|---|---|---|---|---|---|
| `dj-club` | Club DJ | תקליטן מועדונים | live · audience · prokit | proof · identity | Default IL DJ family; from `act.format='dj-set'` w/o festival hint |
| `dj-festival` | Festival DJ | תקליטן פסטיבלים | music · live · proof | audience · identity | `dj-set` + festival/psytrance/trance/rave text hint |
| `open-format` | Open-format / events DJ | תקליטן אופן-פורמט | prokit · live · proof | audience · identity | `act.format='open-format'` |
| `live-band` | Live band | הרכב חי / להקה | live · prokit · proof | audience · identity | `act.format='band'` or `'duo'` |
| `original-artist` | Original artist / vocalist | אמן מקורי / זמר-ית | music · identity · live | proof · audience | `act.format='vocalist'` |
| `live-electronic` | Live electronic act | סט אלקטרוני חי | music · live · identity | prokit · proof | `act.format='live-set'` |
| `comedian-host` | Comedian / host / MC | סטנדאפיסט / מנחה | live · identity · prokit | proof · audience | Reachable via `act.format='comedian-host'` (§16.A.2) |
| `corporate-ceremony` | Corporate / ceremony act | אמן אירועים / טקסים | prokit · proof · live | identity · music | Reachable via `act.format='ceremony-act'` (§16.A.2) |

> **Firewall:** the "primary/secondary" columns are the internal emphasis order
> (`planetEmphasisOrder`, `isPrimaryPlanet`). They render as *guidance wording* only —
> i18n key `radar.genreFocus` ("A useful place to focus in your genre: …") and `genrePrimary`
> ("Central in your genre"). Never a weight, count, or leaderboard.
>
> **G2 guard (built):** when an act declares **no** genre/format signal, `hasGenreSignal` returns
> false and **no** planet is emphasized — every planet renders equal. A missing genre must never
> produce a guessed emphasis. The reference table must preserve this: a scene row is applied only
> when the artist actually selected it.

#### 16.A.1.b — `genre_scene` reference table (the scene registry — NEW, closes the free-text gap)

Seed set below covers the electronic + IL demand the product serves today (the demo persona DJ PERLMAN
is multi-genre: psytrance Act + techno Act). It is **extensible** — the migration should allow adding
scenes without code changes. This is a *starter registry*, not the full 55-subtype sheet; the full
family-by-family fill (F1 first) is the OWED task from the taxonomy audit.

| id (`genre_scene`) | EN | HE (proposed) | → `genre_family` | Notes |
|---|---|---|---|---|
| `melodic-techno` | Melodic techno | מלודי טכנו | `dj-club` | |
| `techno` | Techno | טכנו | `dj-club` | |
| `progressive-house` | Progressive house | פרוגרסיב האוס | `dj-club` | |
| `afro-house` | Afro house | אפרו האוס | `dj-club` | |
| `house` | House | האוס | `dj-club` | |
| `deep-house` | Deep house | דיפ האוס | `dj-club` | |
| `tech-house` | Tech house | טק האוס | `dj-club` | |
| `minimal` | Minimal / deep tech | מינימל | `dj-club` | |
| `psytrance` | Psytrance | פסייטראנס | `dj-festival` | Festival family via hint |
| `progressive-psy` | Progressive psy | פרוגרסיב פסיי | `dj-festival` | |
| `trance` | Trance | טראנס | `dj-festival` | |
| `hard-techno` | Hard techno / rave | הארד טכנו | `dj-festival` | Rave hint |
| `open-format-events` | Open-format events | אופן פורמט אירועים | `open-format` | Weddings/corporate DJ sets |
| `mainstream-pop` | Mainstream / pop set | מיינסטרים / פופ | `open-format` | |
| `hip-hop` | Hip-hop / R&B | היפ-הופ | `open-format` | |
| `live-band-cover` | Cover / party band | הרכב אירועים | `live-band` | |
| `live-band-original` | Original band | להקה מקורית | `live-band` | |
| `singer-songwriter` | Singer-songwriter | זמר-ית / יוצר-ת | `original-artist` | |
| `vocalist-feature` | Vocalist / featured singer | זמר-ית אורח-ת | `original-artist` | |
| `live-electronic-act` | Live electronic act | לייב אלקטרוני | `live-electronic` | Hardware/DAW live set |
| `comedy-standup` | Stand-up / comedy | סטנדאפ | `comedian-host` | via `act.format='comedian-host'` |
| `mc-host` | MC / event host | מנחה אירועים | `comedian-host` | |
| `ceremony-act` | Ceremony / corporate act | אמן טקסים / אירועים | `corporate-ceremony` | |

> **Proposed columns for `genre_scene`:** `id` (PK, kebab code) · `en_label` · `he_label` ·
> `family_id` (FK → `genre_family.id`) · `sort_order` · `active` (bool). The Radar reads
> `scene → family → primary planets`; the free-text `artist.genre` / `act.genre` migrates to a
> nullable FK, with the old string retained during transition.

**Gap RESOLVED (spec-side):** the two families (`comedian-host`, `corporate-ceremony`) now have
dedicated `act.format` values (`comedian-host`, `ceremony-act` — §16.A.2) that resolve to them
deterministically in `familyFor()`, so a comedian/ceremony act no longer falls to the IL DJ default.
**Remaining to implement:** (1) widen the `act.format` CHECK via a diff-first migration; (2) extend
`familyFor()` with the two new cases; (3) owner ratifies the HE labels (T-1). The taxonomy itself is
now complete and internally consistent.

---

### 16.A.2 Act-type / performance-format taxonomy

The bounded `act.format` enum — the CHECK constraint referenced in `genreWeights.js` and the switch in
`familyFor()`. This is **format-LED and deterministic at the first level** (the design principle: format
decides family; genre text only refines the DJ split).

| id (`act.format`) | EN | HE (proposed) | → default `genre_family` | Notes |
|---|---|---|---|---|
| `dj-set` | DJ set | סט תקליטן | `dj-club` (→ `dj-festival` on festival/psy text) | The one family split refined by genre text |
| `live-set` | Live electronic set | סט חי אלקטרוני | `live-electronic` | Hardware/live performance, not a mix |
| `band` | Band | הרכב / להקה | `live-band` | Full band |
| `duo` | Duo | דואו | `live-band` | Treated as live-band |
| `open-format` | Open-format DJ | תקליטן אופן-פורמט | `open-format` | Events/weddings/corporate |
| `vocalist` | Vocalist | זמר-ית | `original-artist` | Singer / featured vocalist |
| `comedian-host` | Comedian / MC / host | סטנדאפיסט / מנחה | `comedian-host` | **NEW (closes T-2):** makes the `comedian-host` family reachable from a format value, not only via the IL default |
| `ceremony-act` | Ceremony / corporate act | אמן טקסים / אירועים | `corporate-ceremony` | **NEW (closes T-2):** makes the `corporate-ceremony` family reachable from a format value |
| `other` | Other | אחר | IL default (`dj-club`) | Catch-all; no guessed emphasis under G2 if no genre text |

> **T-2 resolution (spec-side):** adding `comedian-host` and `ceremony-act` to the `act.format` enum
> makes both non-music families reachable deterministically in `familyFor()` — the gap flagged in
> §16.A.1.a is closed in the spec. **Two follow-ups remain:** (1) the CHECK-constraint widening is a
> migration to author diff-first (do not recreate the enum); (2) the HE labels stay **proposed** until
> owner ratification (T-1). Method labels for these families follow the same canon (§4.4) — a comedian's
> "confirmed by the venue" reads identically to a DJ's; no new label vocabulary is introduced.

> **Entity note (§3 / ENTITY-GLOSSARY):** `format` is a property of the **Act**, not the Person. One
> artist may hold several Acts, each with its own format, genre, evidence, and Passport
> (`passport_version.act_id` binds to an Act). Evidence is per-Act and non-transferable.
>
> **Proposed reference table `act_format`:** `id` · `en_label` · `he_label` · `default_family_id` ·
> `sort_order` · `active`. Replaces the inline CHECK with an FK, keeping the enum values frozen.

---

### 16.A.3 Venue / room-type + region taxonomy

Used by Requests / Production / readiness (`prokit` planet fields `regions`, `set_length`). Today
`artist.regions` is free text with the placeholder "Center, North" (`i18n/en.js`). Three bounded
tables proposed.

#### 16.A.3.a — `il_region` (Israeli regions)

| id (`il_region`) | EN | HE (proposed) | Notes |
|---|---|---|---|
| `center` | Center | מרכז | Gush Dan / Tel Aviv metro — the default in placeholder copy |
| `tel-aviv` | Tel Aviv | תל אביב | Optional finer grain within Center |
| `sharon` | Sharon | השרון | |
| `jerusalem` | Jerusalem area | ירושלים והסביבה | |
| `north` | North | צפון | Haifa, Galilee, Krayot |
| `south` | South | דרום | Be'er Sheva, Eilat, periphery |
| `lowlands` | Shfela / Lowlands | שפלה | Optional |
| `nationwide` | Nationwide | כל הארץ | "Travels anywhere" |

> Multi-select (an artist plays several regions). Proposed as a join table `act_region` (per-Act, since
> touring reach can differ between Acts).

#### 16.A.3.b — `venue_type` (performance context / room type)

| id (`venue_type`) | EN | HE (proposed) | Aligns with `radarUniverse` world | Notes |
|---|---|---|---|---|
| `club` | Club | מועדון | `club` (`/club\|קלאב\|מועדון/`) | Nightclub |
| `festival` | Festival | פסטיבל | `festival` (`/festival\|פסטיבל\|stage/`) | Outdoor / stage |
| `bar-lounge` | Bar / lounge | בר / לאונג' | `club` | Smaller room |
| `wedding` | Wedding | חתונה | `weddings` (`/wedding\|חתונ\|private/`) | Private event |
| `private-event` | Private event | אירוע פרטי | `weddings` | Family / party |
| `corporate` | Corporate event | אירוע חברה | `weddings` (corporate pattern) | Company / conference |
| `theater-hall` | Theater / hall | אולם / תיאטרון | — | Seated venue |
| `arena` | Arena / large venue | אולם גדול / ארנה | — | Rare pre-Gate |

> These align with the **content-world tags** already in `radarUniverse.js:CONTEXT_WORLDS`
> (`club` / `festival` / `weddings`) — the classifier regexes there are the working seed; this table
> formalizes them into a governed enum. Worlds remain a *filter axis*, never a rank
> ("where do I stand" = evidence coverage per world, not a position).

#### 16.A.3.c — `room_size_band` (capacity band — describes the ROOM, not the artist)

| id (`room_size_band`) | EN | HE (proposed) | Notes |
|---|---|---|---|
| `xs` | Under 150 | עד 150 | Bar / intimate |
| `s` | 150–400 | 150–400 | Small club |
| `m` | 400–800 | 400–800 | Mid club |
| `l` | 800–2,000 | 800–2,000 | Large club / small festival stage |
| `xl` | 2,000+ | 2,000+ | Festival / arena |

> **Firewall:** capacity bands describe the *room*, a context fact — they are **not** a measure of the
> artist. They must never be aggregated or presented as an artist-level draw score. Draw itself stays
> bands + binaries with method labels (§16.A.4).

---

### 16.A.4 Method-label + status vocabularies

These are already bounded enums in `src/lib/constants.js` — restated here as the closed taxonomies they
are. **These are canon and MUST NOT be extended without a firewall review.**

#### 16.A.4.a — `method_label` (the 6 public "how verified" labels — `constants.js:METHOD_LABELS`)

| id (`method_label`) | EN (public chip) | HE (`docs/GLOSSARY.md`) | Strength | Notes |
|---|---|---|---|---|
| `producer-confirmed` | PRODUCER-CONFIRMED | מאושר ע"י מפיק | strongest | Set by server when a Source Confirmer vouches a specific claim |
| `evidence-supported` | Evidence-supported | נתמך בראיה/מסמך/מקור | strong | Maps from `verification_status='verified'` |
| `source-linked` | Source-linked | — (kept EN as universal tag) | medium | Maps from `verification_status='supporting'` |
| `artist-declared` | Self-declared | מדווח ע"י האמן | base | Maps from `verification_status='self-reported'` |
| `unable-to-verify` | Unable to verify | לא ניתן לאמת | n/a | Maps from `verification_status='not-assessable'` — N/A ≠ weakness |
| `stale` | Needs refresh | דורש רענון | time state | Auto-set when a claim passes `expires_at` |

> **Canon guard (ENTITY-GLOSSARY §2d):** the headline chip vocabulary is exactly
> **Producer-confirmed / Source-linked / Evidence-supported / Self-declared** and is **never** reworded
> to "source-confirmed" (which would blur into the *Source Confirmer* person). Method labels are kept in
> English inside Hebrew text by deliberate universal-tag design (GLOSSARY).

#### 16.A.4.b — `verification_status` (claim provenance — `constants.js:VERIFICATION_STATUS`)

| id | EN | HE | Publishable to public Passport? |
|---|---|---|---|
| `verified` | Verified | מאומת (context-bound; never generic) | ✅ yes |
| `supporting` | Supporting | נתמך | ✅ yes |
| `self-reported` | Self-reported | מדווח ע"י האמן | ❌ no |
| `not-assessable` | Not assessable | לא ניתן להעריך | ❌ no |

> `PUBLISHABLE_STATUSES = [verified, supporting]` — the firewall gate on what may reach a public
> Passport. HE for "verified" is context-bound: the glossary forbids the generic **מאומת** standing
> alone.

#### 16.A.4.c — `status` (the bounded readiness vocabulary — `constants.js:STATUS`)

| id | EN | HE (`constants.js` comment) | Notes |
|---|---|---|---|
| `strong` | Strong | חזק | |
| `developing` | Developing | מתפתח | |
| `missing` | Missing proof | חסר-הוכחה | An invitation, not a failure |
| `notAssessable` | Not assessable | לא-ניתן-להעריך | N/A ≠ zero |

#### 16.A.4.d — Radar node states (`radarUniverse.js:NODE`)

| id | Glyph | EN | Notes |
|---|---|---|---|
| `confirmed` | ✓ | Confirmed | Artist-approved / connected |
| `found` | ✦ | Found | Discovered, awaiting confirm |
| `review` | ? | In review | Disputed |
| `missing` | + | Missing | A fillable invitation |

> **Firewall:** node states are *bounded states only, never numbers that grade the artist*
> (`radarUniverse.js` header). Planet rollup is `developing / established / needs` — also a state, never
> a count shown publicly (`foundCount` is working-only).

#### 16.A.4.e — Supporting bounded enums (also in `constants.js`, for completeness)

| Enum | Values | Purpose |
|---|---|---|
| `visibility` | `passport-ok` · `mirror-only` · `internal` | What surface a claim/item may appear on |
| `source_status` | `public-verified` · `artist-provided` | Provenance of a profile item |
| Community band (`bandFromCount`) | `<250` · `250–500` · `500–1,000` · `1,000–2,500` · `2,500–5,000` · `5,000+` | Audience size shown ONLY as a band; the integer stays working-only (firewall) |
| Draw fields | `sells_tickets` (yes/no) · `price_band` · `lineup_frequency_band` | Draw as bands + binaries only |

> **Vocabulary drift note:** `mirror-only` remains a live CHECK value the app still writes, but canon
> retired "Mirror" (one Passport, shown in views). Migration 021 (which would drop it) is **FROZEN** —
> do not apply without app lockstep (SESSION-MEMORY). The reference-table migration must respect this.

---

### 16.A.5 Source / platform taxonomy

The platforms LOCK reads. Planet routing is from `radarUniverse.js:linkPlanet()`; "what it signals" is
firewall-safe (a footprint that can be checked against its source — never a score). The honesty lines
are the canon `PROVES` map (`radarUniverse.js:PROVES`, shown verbatim at the confirm moment).

| id (`source_platform`) | EN | HE (proposed) | → planet | What it signals (firewall-safe) | Israeli? |
|---|---|---|---|---|---|
| `spotify` | Spotify | ספוטיפיי | `music` | Public music footprint; secondary context — never a draw claim | |
| `soundcloud` | SoundCloud | סאונדקלאוד | `music` | Public catalogue / mixes footprint | |
| `bandcamp` | Bandcamp | בנדקמפ | `music` | Releases / catalogue footprint | |
| `apple-music` | Apple Music | אפל מיוזיק | `music` | Music footprint | |
| `deezer` | Deezer | דיזר | `music` | Music footprint | |
| `beatport` | Beatport | ביטפורט | `identity` / `music` | Release/label presence in electronic scene | |
| `youtube` | YouTube | יוטיוב | `live` | Live/set footage — performance footprint | |
| `vimeo` | Vimeo | וימאו | `live` | Performance footage | |
| `resident-advisor` | Resident Advisor | רזידנט אדוויזר | `identity` | Scene presence / event history (electronic) | |
| `instagram` | Instagram | אינסטגרם | `audience` | Public community footprint (shown as a band) | |
| `tiktok` | TikTok | טיקטוק | `audience` | Community footprint (band) | |
| `facebook` | Facebook | פייסבוק | `audience` | Community / events footprint | |
| `twitter-x` | X (Twitter) | X (טוויטר) | `audience` | Community footprint | |
| `telegram` | Telegram | טלגרם | `audience` | Community channel | |
| `whatsapp-group` | WhatsApp group | קבוצת וואטסאפ | `audience` | A private room the artist owns and can activate — demand that does not depend on the venue's marketing | ✅ |
| `eventer` | Eventer | אוונטר | `proof` | IL ticketing — ticket export / settlement = real sourced draw | ✅ |
| `tickchak` | Tickchak | טיקצ'אק | `proof` | IL ticketing — ticket export / settlement | ✅ |
| `go-out` | Go-Out | גו-אאוט | `proof` | IL events/ticketing — event history / ticket export | ✅ |

> **`whatsapp-group` (NEW, 17 Jul — owner R00):** the deliberately Israeli-first audience source — a
> WhatsApp group the artist owns is *activatable demand independent of the venue's marketing*, which is
> exactly what an Israeli buyer weighs. Firewall handling is identical to every audience source: the
> group size surfaces **only as a BAND via `bandFromCount`** (the integer stays working-only, never
> shown); provenance is `source_type='self-band'` (artist-declared band) or `'self-reported'`, whose
> canon `PROVES` honesty lines ship verbatim — *"Your own declaration, shown as a band"* / *"Nothing
> beyond your declaration — strengthen with a source"* (`radarUniverse.js:PROVES`). Never a member
> count, never upgraded provenance without a real source.
>
> **Firewall guards baked into the model:**
> - Streaming (`music` planet) is **secondary context** by canon — a footprint that "does not establish
>   local ticket demand" (`PROVES['public-profile'].notProves`). It never becomes a draw claim.
> - Audience platforms surface a **band**, never a follower count (`bandFromCount`).
> - Ticketing platforms (Eventer / Tickchak / Go-Out) feed the **`proof`** planet via the
>   evidence+consent flow — a ticket export "proves real, sourced draw" but "does not establish the
>   crowd came specifically for you" (`PROVES['ticket-export']`). This honesty line ships verbatim.
>
> **Proposed table `source_platform`:** `id` · `en_label` · `he_label` · `planet_key` ·
> `signal_note_key` (i18n key, not raw text) · `is_israeli` (bool) · `source_type` (FK → the
> `PROVES`/`source_type` set: `ticket-export`, `settlement`, `producer-vouch`, `public-profile`,
> `screenshot`, `self-band`, `self-reported`) · `active`. The `signal_note` must be an i18n key so the
> firewall-safe wording is localized, never hardcoded.

---

### 16.A.5b Registry B — the field-applicability registry (NEW, 17 Jul — fills the empty "Registry B" contract)

**What it is.** The registry that answers, per evidence field × per genre family: *does this field apply,
and why does a buyer care?* Registry B is what makes the eight-family Radar (§8.2) and the coaching
line (§8.3) **data-driven instead of hand-coded** — `radarUniverse.js` today hand-builds the DJ case
(audit D4); when Registry B is wired, the same code reads applicability instead.

> **REALITY CORRECTION (18 Jul, T-53 research):** the 8-Jul audit's "Registry B tab is empty" is
> **stale** — a field-grain registry EXISTS in-repo: **`docs/registry/F1.csv`** (483 rows · 376 fields ·
> 18 segments → 6 planets · per-field visibility/applicability/freshness/consent) + `F2-F6-DELTAS.csv`
> (337 family deltas). What remains true: the **DB** still has no representation (no `field_id`,
> free-text `claim_type` — the ≥038 migration, §16.A.6.a). **Four schema variants now compete** (F1.csv
> 15-col · the Sheet's B01–B24 24-col · its 14-col sample header · this section's 5-col conceptual
> core) — unification is owner ruling **M-17** (§18.2). Recommendation on record: F1.csv's 15 columns
> as the working base + `next_action_rule` · `freshness gap_rule` · `why_a_buyer_cares` adopted from
> B01–B24; this section's 5 columns remain the conceptual contract every variant must express.

**Schema (the five columns, canon):**

| Column | Type / values | Meaning |
|---|---|---|
| `field_id` | PK, `lower-kebab` code (e.g. `ticket_export`, `technical_rider`, `whatsapp_group`) | the frozen evidence-field identifier — the end of free-text `claim_type` |
| `genre_family` | FK → `genre_family.id` (§16.A.1.a) | one row per field × family |
| `applicability` | **`R` / `C` / `O` / `N`** — Required / Common / Optional / Not-applicable | how this family's buyers weigh the field |
| `planet_key` | one of `identity · music · live · audience · prokit · proof` | which planet the field's node lives on |
| `why_a_buyer_cares` | **i18n key** (never raw text) | the buyer's reasoning, surfaced on the node + in the coaching line (§8.3) |

**THE `N` RULE (binding):** `N` = **never shown, never asked, never counted as a gap.** A field marked
`N` for the artist's family simply does not exist on their Radar — it is not a greyed row, not a
"not applicable" chip, not a private gap. (An `instruments` ask on a club DJ's Radar is noise; noise
erodes the coach's credibility.)

**Worked examples (the seed rows — the register the full fill follows):**

| `field_id` | Applicability by family | Why a buyer cares (register of the i18n value) |
|---|---|---|
| `instruments` | `live-band`: **C** · `dj-club`: **N** | a band's instrumentation shapes the booking; a club DJ is never asked |
| `technical_rider` | `live-band`: **R** · `corporate-ceremony`: **R** · `dj-club`: **C** | why the night doesn't break |
| `ticket_export` | **every family: R** | the only proof of paid demand |
| `beatport_presence` | `dj-festival`: **C** · `corporate-ceremony`: **N** | scene presence where the scene checks it; meaningless to a corporate buyer |
| `set_length_range` | `dj-club`: **C** · `original-artist`: **O** | a club programs by slot; an original act is booked for the show |

**Rules:** the full family-by-family fill is **OWED from the Google Sheet / owner R00** (§18) — structure
proceeds now, content lands when the sheet fill is ratified; every `why_a_buyer_cares` value is an i18n
key (EN + HE, HE proposed until owner signs); applicability describes **what buyers in that family weigh —
never how a specific artist performs** (it is per-family metadata, not per-artist data; nothing here
scores anyone); the G2 guard inherits — no family signal → no applicability read → the neutral all-equal
Radar.

---

### 16.A.6 Migration & implementation note (Part A summary)

All six taxonomies above should land as **bilingual DB reference tables** in one migration
(historically called "029 bilingual reference tables"; author now as the **next free number ≥038**,
diff-first — full structure in §16.A.6.a). Proposed set:

| Table | Replaces (free text today) | Keyed by |
|---|---|---|
| `genre_family` | `genreWeights.js` inline object | code |
| `genre_scene` | `artist.genre` / `act.genre` free text | code → family FK |
| `act_format` | `act.format` inline CHECK | code |
| `il_region` + `act_region` | `artist.regions` free text | code |
| `venue_type` | `radarUniverse.CONTEXT_WORLDS` regexes | code |
| `room_size_band` | (none — new) | code |
| `source_platform` | `linkPlanet()` regex routing | code → planet + source_type |
| `registry_b` (field applicability, §16.A.5b) | `claims.claim_type` free text + hand-coded `radarUniverse.js` field lists | (`field_id`, `genre_family`) composite |
| method/status enums | `constants.js` (already bounded) | keep as CHECK or promote to lookup |

Common column shape: `id` (PK) · `en_label` · `he_label` · `sort_order` · `active`, plus the mapping
FKs noted per table. **Rules:** frozen code identifiers stay frozen (§0.2 rule 5); every user-facing
label resolves through i18n keys, never hardcoded; the G2 guard (no signal → no emphasis) must survive
the migration; `mirror-only` is not dropped while 021 is FROZEN.

#### 16.A.6.a — The taxonomy migration STRUCTURE (specified 17 Jul — **spec only: this migration is NOT authored and NOT run by this task**)

The concrete shape the migration set takes when authorized. Migration head is past 035 (037 applied
17 Jul; 036 stays `.DRAFT` with its own dual-read rollout) — so the taxonomy set is **authored as the
next free number ≥038, diff-first against migrations 001–037 (CLAUDE.md rule), never recreating an
existing table**, additive-only (no `DROP` in an UP migration — §20 inspector 3 enforces this).

**Step 1 — reference tables (all NEW; nothing exists yet — audit D1 confirmed zero taxonomy representation in the DB):**
- `genre_family` — `id` PK · `en_label` · `he_label` · `sort_order` · `active` · the primary/secondary planet arrays (or a child `family_planet` table: `family_id` FK · `planet_key` · `tier ('primary'|'secondary')` · `rank`). Seed = the 8 rows of §16.A.1.a (mirrors `genreWeights.js`).
- `genre_scene` — `id` PK · `en_label` · `he_label` · `family_id` FK→`genre_family` · `sort_order` · `active`. Seed = §16.A.1.b; extensible without code changes.
- `act_format` — `id` PK · `en_label` · `he_label` · `default_family_id` FK→`genre_family` · `sort_order` · `active`. Seed = §16.A.2 (9 values; includes `comedian-host`, `ceremony-act` — the CHECK-widening rides here).
- `il_region` · `venue_type` · `room_size_band` — common shape, seeds §16.A.3.
- `source_platform` — §16.A.5 shape incl. `planet_key` · `signal_note_key` (i18n key) · `is_israeli` · `source_type` · `active`. Seed includes `whatsapp-group`.
- `evidence_field` — `field_id` PK · `en_label` · `he_label` · `planet_key` · `active` (the field registry that ends free-text `claim_type`).
- `registry_b` — `field_id` FK→`evidence_field` · `genre_family` FK→`genre_family` · `applicability CHECK (applicability IN ('R','C','O','N'))` · `why_buyer_cares_key` (i18n key) · PK (`field_id`,`genre_family`) — §16.A.5b.

**Step 2 — wiring columns on EXISTING tables (additive, nullable, dual-read):**
- `act`: add nullable `scene_id` FK→`genre_scene` (+ keep free-text `genre` during transition; code reads FK-first, falls back to text) · `format` stays, its CHECK widened or FK'd to `act_format`.
- `artist`: `regions` free text → join table `act_region` (`act_id` · `region_id`), old string retained during transition.
- `claims`: add nullable `field_id` FK→`evidence_field`; `claim_type` free text retained until backfill completes.

**Step 3 — seeds vs OWED content:** the migration ships with the spec's seed rows only. The **full
Registry B fill + the full scene/subtype/instrument lists (6 families · 55 subtypes · 32 DJ
specializations · 42 instruments · 121 legacy labels) are OWED from the Google Sheet via owner R00**
(§18) — the structure lands first and empty-but-governed beats full-but-free-text; content arrives as
data inserts, not schema changes.

**Rollout rules:** paired `.down.sql` per migration · dual-read in code (FK-first, free-text fallback)
until backfill is verified · `familyFor()`'s `FESTIVAL_HINT` heuristic retires only after `scene_id`
is live and backfilled · G2 guard proven unchanged in the same PR (`test:guardrails` + Radar
conformance) · owner applies via SQL editor as always — **the build agent never touches the live DB.**

---

### PART B — BUSINESS

> Everything documented is captured with its source. Everything **not** yet decided is marked **OPEN
> (owner)**. Per the standing rule, no business numbers are invented — they are framed and flagged.

---

### 16.B.6 Product goals / objectives

#### 16.B.6.a — Purpose (documented, canon)

LOCK is a **pre-booking proof / risk-reduction tool** (CLAUDE.md, CFO-BRIEF §1). Its documented purpose
has two sides:

1. **Supply side — help artists build a provable professional identity.** "Talent ≠ bookability."
   The artist assembles standardized, method-labeled evidence into a Passport, per Act.
2. **Demand side — help Israeli buyers evaluate an unfamiliar artist and reduce booking risk.**
   Booking managers, promoters, event producers, planners, and private/corporate clients
   (מזמיני הופעות) can check an unfamiliar artist against method-labeled evidence "before they risk
   their name."

It is explicitly **NOT** an EPK, **NOT** a booking CRM, **NOT** a guarantee, and carries **NO** score /
rank / prediction (CLAUDE.md firewall).

#### 16.B.6.b — Goals framework (targets OPEN)

No numeric goals are documented. Clean framework below; **all targets are OPEN for the owner to set** —
and by canon none may be a public score, only internal counters (PILOT-MEASUREMENT-MAP: "internal
counters for Maria + CFRO only").

| Goal dimension | Documented signal / event (built) | Metric shape | Target |
|---|---|---|---|
| Artist activation | `onboarding_completed` | Signups → onboarding-complete rate | **OPEN (owner)** |
| Value delivered | `passport_published` | Built → published rate ("value proof") | **OPEN (owner)** |
| Distribution | `share_link_created` → `passport_view` | Share → view rate ("distribution proof") | **OPEN (owner)** |
| **The Gate metric** | `passport_view` → `professional_reaction_submitted` | View → reaction rate | **OPEN (owner)** |
| Trust network | `producer_confirmation_sent` → `claim_confirmed` | Confirm completion rate | **OPEN (owner)** |
| Multi-Act appetite | `act_created` | Count / artist | **OPEN (owner)** |
| Willingness to pay | `payment_reference_created` | Voluntary-pay count | **OPEN (owner)** |

> These events are **built and wired** (PILOT-MEASUREMENT-MAP, 12 Jul). What's missing is the owner's
> numeric bar for each — deliberately, because no ICP or price is locked pre-Gate.

---

### 16.B.7 The Gate

**The single validation gate (north star):**
> **One real booking manager reacts to a real Passport AND one pays.** (CLAUDE.md · CFO-BRIEF §2)

#### Why it's the north star
LOCK is at **pre-validation** stage (CLAUDE.md: STAGE). The entire product thesis — that buyers will
trust method-labeled evidence enough to act, and that someone will pay for the proof layer — is unproven
until both halves fire once on a *real* Passport (not the demo). Everything before the Gate is
instrumentation and readiness; nothing about pricing or ICP is treated as known.

#### How it's measured (built)
Both halves are live analytics events on `analytics_event` (demo excluded; each row carries actor +
timestamp):

| Gate half | Event | Status |
|---|---|---|
| A buyer **reacts** to a real Passport | `professional_reaction_submitted` | ✅ live — **the Gate signal** (PILOT-MEASUREMENT-MAP) |
| Someone **pays** | `entitlement_activated` (operator activation, records WHO) | ✅ live |

#### What unlocks after the Gate
Per canon (CLAUDE.md, CFO-BRIEF §2–3): **monetisation is measured, not required, and no price / no ICP
is locked until the Gate.** Passing it unlocks the decisions currently frozen:
- Fixed pilot **price** (recommendation on file: ₪179; range ₪149–249 — OPEN until Gate).
- The **ICP** (which demand-side segment pays first).
- Turning on payment surfaces (the `PAYMENTS_ENABLED` flag, dormant today).

---

### 16.B.8 Business model

#### Shape — two-sided
Supply side (artists + their artist-side representation) and Israeli demand side (buyers). The
**workspace carries the subscription, not the person** (GLOSSARY, CFO-BRIEF §3).

#### Documented rulings (Monetization — APPROVED, SESSION-MEMORY)
- **No booking commission — ever.** (canon)
- **Each entity pays its own plan;** the artist always owns/pays his portable evidence-truth layer;
  the office pays the roster layer; a **Billing Sponsor** mechanism exists.
- **Buyer is free forever** — no account needed to read a Passport (`/passport/:id` is outside auth
  guards).
- **Source Confirmer never pays, never signs up** (accountless magic link).
- **Free pilot now** — no price locked pre-Gate; `PAYMENTS_ENABLED` flag keeps all payment surfaces
  dormant (`constants.js`, canon G17).

#### Plans (concept — pricing OPEN)

| Payer entity | Plan | Current ruling | Price |
|---|---|---|---|
| Artist workspace (holds Acts) | **Passport** (free) → **Momentum** | Free in pilot | **OPEN** — if asked, ₪149–249 range only; pilot rec ₪179; never a fixed public price pre-Gate |
| Manager office / אמרגן (artist-side, solo or team) | **Roster** | Deliberately UNPRICED — payer candidate post-validation | **OPEN (owner)** |
| Event-production workspace | — | Not priced; events + lineups context | **OPEN (owner)** |
| Buyer / booking manager (incl. private clients) | — | **FREE FOREVER** (canon) | ₪0 |
| Source Confirmer | — | Never pays | ₪0 |

#### Money mechanics as built today (CFO-BRIEF §4)
- Payment: **Bit → 054-4555060**, reference code **GP-XXXX**, **manual operator activation** in the
  admin console (each activation records WHO — actor on the event).
- An **entitlements** table drives access; activation fires the Gate's "paid" signal
  (`entitlement_activated`).
- **Known legal gap (P1 before real money): no receipts/invoices** — Green Invoice signup pending
  (deferred by owner until first payment intent).
- **Agency-side payments currently capture NO financial record** (flagged in the financial review).

#### Firewall constraint on the model
"Money never buys a better story · no score to sell" is **live site canon** (CFO-BRIEF §1). Any
monetization surface must survive: the firewall (no score to sell), free-forever buyer, and
no-commission. Money may unlock *capacity* (more Acts, roster seats, distribution), never *a better
verdict*.

---

### 16.B.9 Business case (honest, pre-Gate — no invented traction)

#### The problem
- **Talent ≠ bookability.** A great set doesn't tell a buyer the artist will show up, draw, and not
  burn the buyer's name.
- **Proof is scattered** across Spotify, Instagram, ticketing exports, WhatsApp screenshots — no
  standardized, checkable form.
- **The buyer carries reputational risk.** Booking an unfamiliar artist puts the buyer's own name on
  the line; today they decide on vibes, favors, or inflated EPKs.

#### The wedge
**Israeli pre-booking proof.** A narrow, concrete beachhead: the Israeli demand side (מזמיני הופעות)
evaluating an unfamiliar artist, in Hebrew and English, with local ticketing sources (Eventer,
Tickchak, Go-Out) as first-class evidence. Not a global directory; a trust-check at the exact moment a
booking decision is being made.

#### Why now
- The demand side has no standardized way to check an artist that isn't self-promotion.
- Method-labeled evidence + a locale-aware scan (target) is newly cheap enough to attempt at ~$1/artist
  (TARGET — see §16.B.10; not yet built, must not be priced on).
- The IL scene is small and networked enough that one real reaction + one payment is a meaningful,
  reachable Gate.

#### The moat
- **Method-labeled evidence** — a bounded, honest vocabulary (Producer-confirmed / Source-linked /
  Evidence-supported / Self-declared) that competitors' EPKs and CRMs structurally can't match without
  abandoning hype.
- **The Radar / Passport asymmetry** — one Passport shown in two views: the Artist view (private) shows
  gaps and invitations; the Buyer view (public) shows verified strengths only. The artist is *supported,
  not inspected*; the buyer sees *only what's checkable*.
- **Per-Act, non-transferable evidence** — a structural integrity property (a new Act starts empty)
  that makes the proof hard to game.
- **The firewall as a brand** — "no score to sell" is a credibility position, not just a rule.

#### Risks (honest)
| Risk | Note |
|---|---|
| Demand-side cold start | Buyers must trust an unfamiliar format; the Gate is precisely the test of this |
| Two-sided chicken-and-egg | Artists need buyers to read Passports; buyers need artists worth reading |
| The scan is TARGET, not built | The ~$1 deep scan and locale-aware auto-discovery are unbuilt; the business case cannot lean on them yet (§16.B.10) |
| Legal/receipts gap | No invoices/receipts before real money (P1); counsel items open |
| Free-tier ceilings | Supabase pause / Vercel deploy caps can bite pre-Pro (§16.B.10) |
| No traction claimed | Pre-validation by definition — there is **no** invented traction in this section |

---

### 16.B.10 Unit economics / cost

#### AI claim-extraction cost model
- **BUILT:** per-evidence AI claim extraction — the pipeline labels claims per evidence item, no
  concierge / by-hand step (CLAUDE.md; CFO-BRIEF §5). Anthropic API is active; on credit exhaustion it
  falls back to mock (ACCOUNTS-LIMITS-REGISTRY).
- **TARGET (not built — do not price on it):** a multi-source **deep scan once at onboarding, target
  cost ≈ $1/artist**, plus cheap automatic incremental re-scans. CLAUDE.md is explicit: this is
  **TARGET ARCHITECTURE, not yet built; no business case may price or assume it until implementation
  and measured cost are verified.**
- **Provider fallback** may use a cheaper tier with narrower extraction, but must **preserve the
  evidence firewall and disclose the narrower scope** (CLAUDE.md).

> **Honesty firewall (§0.2 rule 4):** any unit-economics model that assumes the $1 deep scan is
> TARGET-based and must be labeled so. The only BUILT cost today is per-evidence extraction at
> pay-as-you-go, magnitude unmeasured at scale.

#### Free-tier constraints (ACCOUNTS-LIMITS-REGISTRY, 12 Jul)

| Service | Plan | Constraint that can bite | Upgrade trigger |
|---|---|---|---|
| **Vercel** (both projects) | Hobby (free) | 100 deploys/day (hit once); previews build on every push | Disable previews (mitigation); Pro if needed |
| **Supabase** | Free | 500MB DB · 1GB storage · 50K MAU · **project pauses after ~7 days inactivity** | **Pro $25/mo** — trigger = first real users / pre-pilot backups (OPEN, owner) |
| **Anthropic API** | Pay-as-you-go | Credit runs out silently → falls back to mock | Billing alert; balance currently unknown |
| **Google Cloud** | Free | OAuth "Testing" mode caps 100 test users | Publish to production |
| **Resend** (email) | Not yet created | Free 3K/mo, 100/day when created | Owner signup pending |
| **GoDaddy** (lock.show) | Paid domain | Annual renewal — losing it loses everything | Confirm auto-renew |
| **GA4 / Search Console** | Free | None material pre-launch | — |

#### Budget snapshot (ACCOUNTS-LIMITS-REGISTRY)
Domain ~₪5/mo amortized · everything else ₪0 (free tiers) · Anthropic usage-based
(**~$1/artist onboarding is the TARGET deep-scan figure, not a measured current cost**). First real
spend decisions arrive with the pilot: **Supabase Pro $25/mo** (OPEN — owner), Resend stays free-tier.

---

### 16.B.11 Go-to-market (GTM) approach

_Added 15 Jul (owner: "identify gaps — is GTM included?"). Pre-validation stage: this is a **hypothesis to test**, not a locked plan. Every ICP/channel/number is **OPEN** until the Gate produces evidence. No invented traction._

**Positioning (the wedge).** LOCK sells *risk reduction to the demand side*: "check an unfamiliar artist in 60 seconds, on method-labeled evidence, before you put your name on the booking." To the artist it sells *provable bookability*: "prove you're a safe booking before they have to trust a stranger." The firewall (no score/hype) **is** the positioning — it is the credible alternative to inflated EPKs and follower vanity.

**The cold-start problem (two-sided).** LOCK needs artists with real Passports *and* buyers who react. Solving both at once is the hard part. **Chosen wedge: artist-led supply.** The artist is the motivated party (they want the booking), so they do the distribution — they build a Passport and **send it to the exact buyer they already want to reach**. The buyer therefore arrives *warm* (an artist they were already considering), not cold. This sidesteps paid buyer acquisition entirely for the first cohort.

**First-10-buyers playbook (concierge).** (1) Hand-pick artists who **already have a specific buyer in mind** (a promoter they're chasing). (2) Help them build a real Passport (onboarding). (3) Instrument the buyer's reaction (`availability_request_created`) and, on a real reaction, the willingness-to-pay conversation. (4) Learn per case: did the buyer find it useful? would they pay? which evidence mattered? This is manual, unscalable, and correct at this stage — the goal is the Gate, not volume.

**Channel hypotheses (to validate, ranked by fit — none proven):**
| # | Channel | Why it fits LOCK | First test |
|---|---|---|---|
| 1 | **Artist-led (the Passport IS the channel)** | zero CAC; the artist targets the exact buyer; buyer arrives warm | the first-10 playbook above |
| 2 | **Scene communities** (Telegram/WhatsApp groups, genre scenes) | Israeli electronic/live scenes are tight, group-native | seed a few artists in one scene, watch referral |
| 3 | **Direct outreach to booking managers / promoters** | the buyer whose reaction defines the Gate | warm intros first, then cold |
| 4 | **Venue / promoter partnerships via the Source-Confirmer** | confirmers are real buyer-side contacts touching LOCK already | measure confirmer → curiosity → signup |
| 5 | **Ticketing-platform / festival partnerships** (e.g. Eventer, Tickchak, festival organisers) | buyer-side aggregators; a co-branded embedded Passport reaches many bookers at once | one pilot embed conversation post-Gate |
| 6 | **Content / SEO** (marketing site) | long-tail "how to check an artist before booking" | already live; low priority pre-Gate |

**Concrete IL seeds (hypotheses, not commitments):** scene channels — Tel Aviv techno / Psytrance-IL / Afro-House communities (Telegram/WhatsApp, seed 2–3 artists each, never spam); venues as Source-Confirmers — the named venues already in the DS (Barby · The Block · Sunset, §5.9) are natural first confirmers, each a buyer-side exposure; ticketing — Eventer / Tickchak as post-Gate embed partners.

**Illustrative phased funnel (targets are directional, all OPEN):** Phase 0 concierge — ~10 artists → ~5 published → ~10 shares → ~3 views → **1 reaction target**; Phase 1 — instrument willingness-to-pay → **1 payment = Gate**; Phase 2 — scale the artist-led loop + venue/ticketing partnerships. Numbers are placeholders to shape the funnel, **not forecasts**.

**Post-Gate B2B sales plays (hypotheses, added from review):**
- **"Mandate LOCK" (demand-led supply):** pitch the booking directors of the top ~20 IL venues — *"stop reading 50 messy EPKs a week; ask artists to submit a LOCK Passport — it's free for you and shows verified draw instantly."* If a venue *requires* a Passport, supply-side adoption follows for free. The strongest post-Gate lever.
- **Source-Confirmer → Roster conversion (B2B2C):** the confirmer's Done state (a real venue/promoter who just touched the product) carries a soft CTA — *"Want your artists to look this verified? Build a Roster on LOCK."* Turns the confirmation loop into a supply-side funnel.
- **Retention triggers (via the email transport, §14.6):** stale-evidence re-engagement — *"Your Eventer draw evidence is expiring; re-sync to keep it fresh"* (about the artist's **own** data, firewall-safe); upgrade-intent recovery — an artist who hits an upsell trigger but doesn't create a payment reference gets a follow-up.

> **Firewall catch (REJECTED, logged §2.9-adjacent):** a proposed "a buyer viewed your Passport 3× — email them" nudge **surfaces a buyer view-count to the artist**, which violates §2.5 (reaction-to-artist = method-safe text, never a count). Rejected. The only artist-facing buyer signal remains the method-safe availability-request text.

**Leading indicators (operator-internal only, never per-person to a user):** Time-to-First-Confirmed-Claim · Claim-to-Confirm ratio · Source-Confirmer acceptance rate · **Passport-view→availability-request conversion** (the core PMF metric) · stale-Passport rate · the behavioural sequence that precedes an upgrade. These live on the operator dashboard (§8.12) as **product-event** aggregates — firewall-safe; never rendered as a score about a person.

**OPEN (owner):** the beachhead ICP (ties to **B-1** — which buyer segment leads Gate 1; reviewer's sharpened candidate = *Israeli electronic/club/festival bookers + mid-tier representation offices who book unfamiliar acts*), rough TAM, channel priority + any budget, launch timing, and whether to run the pilot in one scene or across several.

### 16.B.12 Monetization roadmap (post-Gate)

_Principle (CLAUDE.md STAGE): monetisation is **measured, not required**; **no price or ICP is locked until the Gate.** This section fixes the **structure**; every number stays **OPEN.**_

**The ladder (structure fixed, prices OPEN).**
| Plan | Who pays | What it is | Gates (feature hypotheses) | Price |
|---|---|---|---|---|
| **Passport** | artist | **free forever** | build one Act's Passport, per-evidence claim extraction, public buyer view, availability requests | **₪0** |
| **Momentum** | artist | paid upgrade | deeper/more evidence, momentum insights, (target) multi-source scan, more Acts | **OPEN** (placeholder ₪179, unproven) |
| **Roster** | manager / agency | paid upgrade | multi-artist roster, team seats, roster radar, org tools | **OPEN** |
| **Buyer** | booking manager / promoter / private / corporate | **free forever** | view Passports, send availability requests | **₪0 — never charged** |

**Two load-bearing rules (trust, not revenue-max):** (1) **the demand side never pays to view** — charging buyers would kill the adoption LOCK depends on. (2) **No booking commission, ever** (§16.B.8) — LOCK is a *proof tool*, not a marketplace taking a cut; a take-rate would compromise its neutrality and the firewall's credibility. Monetization is **subscription only** (artist/manager side).

**Feature-gating truth (honest):** `plan_flags` exist (migration 028, live) but **enforcement is display-only today** (P1-7) — no plan actually blocks a feature yet. The gating column above is the *intended* map, to wire **after** the price decision.

**Expansion revenue (structure):** seats (Roster grows by team seats) · multi-Act (one artist, several paid Acts) · the built-in **booker→agency upgrade path** (§3, same account grows into Roster) · manager brings a whole roster (supply + seats).

**Pricing method:** willingness-to-pay is **measured at the Gate** (the real pay signal), not guessed a priori. Post-Gate, test monthly vs annual, trial length, and the Momentum/Roster boundary against real conversion.

**The freemium fence (build the architecture now; the price stays OPEN).** Even pre-Gate, *what sits behind the paywall* should be fixed so the gating code and the cost model line up — the **AI auto-scan is the margin-critical fence** (it carries the ~$1 target cost, §16.B.10, so it must sit on the paid side):
| | Free (Passport) | Paid (Momentum) |
|---|---|---|
| Acts | 1 | unlimited |
| Evidence | manual paste/upload | **+ AI auto-scan** (the cost feature) |
| Source-Confirmations | a few (e.g. 3) | unlimited |
| Staleness alerts · priority support | — | ✓ |
**Profitability guardrail:** subscription revenue must exceed (AI + server cost) per paid artist; if auto-scan cost runs hot, gate it behind a **scan-credit** allowance rather than unlimited. Numbers OPEN; the *fence line* (manual = free, auto-scan = paid) is the architecture to build now.

**OPEN (owner):** every price, the Momentum/Roster feature boundaries, the exact free confirmation/credit allowances, annual vs monthly, trial length, and when to flip enforcement from display-only to real.

#### 16.B.12.a Plans by customer type (the full matrix — structure fixed, prices OPEN)
Each demand/supply actor gets a plan tuned to *their* job. **The buyer side never pays** (adoption depends on it); revenue is artist + representation + production only.
| Customer | Plan | Core value | Paid unlocks | Price |
|---|---|---|---|---|
| **Artist** | **Passport** (free) | 1 Act · manual evidence · public Passport · a few Source-Confirmations · availability requests | — | ₪0 |
| **Artist** | **Momentum** (paid) | everything free, deeper | unlimited Acts · **AI auto-scan** (the cost feature) · unlimited confirmations · staleness alerts · priority support | OPEN |
| **Representation** | **Roster** (paid) | manage many artists as consented grants | team **seats** · roster radar · bulk next-actions · org tools | OPEN (per-seat or tiered) |
| **Production company** | **Lineups** (paid, post-Gate) | events + slots + confirm flows | team seats · event/lineup creation · production requests | OPEN |
| **Buyer** (booker/promoter/private/corporate) | **free forever** | view Passports · send availability requests | — | **₪0 · never charged · no commission** |

#### 16.B.12.b Billing cadence — monthly & annual (annual is the discounted default)
Offer **two cadences** on every paid plan; **annual is billed once at a discount** vs 12× monthly (the "discounted monthly" the owner asked for):
- **Monthly** — full flexibility, higher effective rate, cancel anytime.
- **Annual (recommended)** — one charge, priced as **~10 months for 12** (≈2 months free / ~15–20% off the monthly run-rate — **exact discount OPEN**). Surfaced as "save {X}% · billed yearly." Improves retention + cash flow + LTV.
- **Mechanics:** `entitlements` already drives access (§14.5); add a `billing_cycle ∈ monthly|annual` + `renews_at` when payments turn on. Free-pilot today = no charge (`PAYMENTS_ENABLED=0`); the cadence UI ships **dormant** behind the flag. **All prices + the exact annual discount are OPEN** (locked only post-Gate with real willingness-to-pay).

#### 16.B.12.c Smart-upsell architecture (contextual, firewall-safe, never a nag)
Upsell is triggered by **the user hitting a real limit or a real desire** — a product prompt at the moment of value, never a score and never a dark pattern:
| Trigger (moment of intent) | Upsell prompt | → Plan |
|---|---|---|
| Tries to add a **2nd Act** | "Hold more than one Act with Momentum." | Momentum |
| Wants the **auto-scan** (vs manual paste) | "Let LOCK find your footprint automatically." | Momentum |
| Runs out of **free confirmations** | "Unlimited source-confirmations on Momentum." | Momentum |
| Evidence goes **stale** (`expires_at`) | "Keep your Passport fresh — auto staleness alerts." | Momentum |
| Manager invites past **free seats** | "Add your whole roster — seats on Roster." | Roster |
| Booker upgrades to run a **roster** | the built-in booker→agency path (§3) | Roster |
**Rules:** the prompt appears **in-context at the limit**, not as interruptive modals; it states the *benefit*, never pressure; a firewall check applies — an upsell may reference **product capability** ("unlimited Acts"), never a **number about the person** ("your score would rise"). Expansion revenue = seats · multi-Act · org growth (§16.B.12). The gating is **display-only today** (`plan_flags`, 028) — these prompts render but nothing is charged pre-Gate.

**OPEN (owner):** all prices, the annual discount %, per-seat vs tiered Roster, trial length, and which upsell triggers to turn on first.

### 16.B.13 Growth loops (the engine behind "Growth System")

_The product is a pre-booking **Growth System**; this is the loop model. All loops are **hypotheses** — the share mechanics are BUILT, the loop **measurement is OWED** (nothing here is proven yet). Firewall: every loop metric is a **product-event count, never a per-person score.**_

**Loop 1 — Artist-led viral loop (the primary engine).**
`Artist builds Passport → shares the public link (built: `?s=1`, WhatsApp share, migration 029) → buyer views with no login → buyer reacts (Gate) AND is exposed to LOCK → buyer starts asking OTHER artists for their LOCK Passport → those artists sign up to make one.` The buyer becomes a **distribution channel for artist signups** — that is the viral coefficient. Loop metric (to instrument): *rate at which a viewed Passport produces a new artist signup.*

**Loop 2 — Source-Confirmer exposure loop.** `Artist requests a venue/promoter to confirm a detail → confirmer opens the magic link (built: `/confirm/:token`) → a real buyer-side contact touches LOCK → curiosity → signup / brand exposure.` Loop metric: *confirmer → return-visit / signup rate.*

**Loop 3 — Representation supply-injection loop.** `A manager on Roster onboards their whole roster → N artists arrive at once (built: ArtistAccess grants, migration 027).` Not viral but a **supply multiplier**.

**Loop 4 — Multi-Act within-person expansion.** `One artist, several Acts, each its own Passport (built: `act` spine, migration 020)` — deepens engagement + expansion revenue without new-user acquisition.

**What's honest here:** the *mechanics* of all four loops exist in code (share link, confirmer, grants, Acts). **None of the loops is instrumented or proven** — no funnel measures "share → new signup" yet (ties to §14 GA4 dual-emit + is_demo OWED). Building that measurement is the prerequisite to claiming any growth loop works. **Do not present these loops as validated.**

**OPEN (owner):** which loop to instrument and push first (recommendation: Loop 1, since it needs no new supply).

### 16.B.14 Risk & assumptions register + validation experiments

_The riskiest-assumption-first list. Qualitative L/I (pre-data). Each risk carries the experiment that would de-risk it._

| # | Risk / assumption | L·I | Validation experiment | Mitigation |
|---|---|---|---|---|
| R1 | **Buyers won't react** to a Passport (the core Gate bet) | H·H | first-10 concierge playbook (§16.B.11); watch `availability_request_created` | make the buyer view a genuine 60-sec decision (§8.7) |
| R2 | **Artists won't complete** a Passport (activation) | M·H | onboarding→`onboarding_completed` rate; the D1 editor now lets them finish/edit | reduce fields; the one-viewport onboarding |
| R3 | **The firewall (no score) feels less useful** than a number | M·H | buyer comprehension test — do they trust bands+method labels? | lead with method labels + the confirmer human anchor |
| R4 | **Evidence gaming / fakes** erode trust | M·H | see §16.B.15 anti-gaming | provenance labels + Source-Confirmer + artist-approval gate |
| R5 | **Two-sided cold start** never ignites | M·H | artist-led wedge removes buyer-acq; measure warm-buyer arrival | Loop 1 first |
| R6 | **Israeli market too small** without i18n expansion | M·M | measure pilot density in one scene first | locale-aware discovery is TARGET (§9.2) |
| R7 | **Legal / Amendment-13** exposure | M·H | counsel review (L-1…L-9); consent model built | consent-gated scan, RLS, deletion SLA |
| R8 | **Deep-scan cost** (~$1) unproven at scale | M·M | measure real per-artist cost before pricing on it | per-evidence extraction is the only BUILT cost |
| R9 | **Codex / DS dependency** (v1.6.25 values off-repo) | M·M | design-critic loop replaces Codex feedback | build in current app style; re-theme later |
| R10 | **Single-founder bandwidth** | M·M | this build/audit cadence; delegate to agents | prioritize the Gate ruthlessly |

**Riskiest assumption to test first: R1** — everything else is moot if a real buyer won't react to a real Passport.

### 16.B.15 Trust & safety · anti-gaming · IP & content rights

**Anti-gaming — the design already resists it.** LOCK cannot be gamed for a *higher score* because **there is no score** (the firewall). What a bad actor could try is **fabricated evidence**. Defenses, built vs needed:
- **BUILT:** the method-label hierarchy (confirmed > evidence > declared) means a self-declared claim is *labeled* self-declared — inflation is visible, not hidden; the **artist-approval gate** (every claim the artist approves); **rate limits + spend caps** (server); the **Source-Confirmer** as the external human trust anchor (a venue/promoter vouches).
- **NEEDED (OWED):** detection of fabricated links / evidence (basic URL/asset validation); a **dispute / flag path** — a buyer or confirmer flags a claim → operator reviews in the ops console (which exists). **Concrete mechanic (adopted from review):** a flagged **method-labeled** claim can **auto-downgrade toward `self-declared`** pending review (e.g. ≥N independent flags on a "confirmed" claim reverts its label to declared until re-verified) — this defends the trust of the *labels* without deleting the artist's content, and stays firewall-safe (it changes provenance, never a score). **Formal takedown flow OPEN.** **Impersonation** handling (someone building a Passport for an artist they're not) — identity verification is light today (**OPEN**; the confirmer + evidence provenance are the current mitigations).

**IP & content rights (needs counsel — ties to §15.1 L-placeholders).** Uploaded evidence (photos, links, media) requires: the artist **warrants they hold the rights**; LOCK stores + displays **on the artist's behalf** (a license to display, not ownership); **takedown on request**; **no resale** of artist data; clear handling of third-party evidence (a venue's photo). These are **ToS clauses to author with counsel** — currently absent from the drafts (a real gap, flagged).

**OPEN (owner + counsel):** the dispute/takedown flow, identity-verification bar, and the IP/content-rights ToS clauses.

### 16.B.16 Post-Gate roadmap / phasing

_Ties the business to the release ladder (`VERSIONS.md`, `DEPLOY-GAPS.md`). Q8 (§13.7) is the gate between Phase 0 and production._

- **Phase 0 — pre-validation (now):** finish the spec (done), harden the app (P0 waves), get a **real Passport in front of a real buyer**. Success = the Gate is *reachable*.
- **Phase 1 — the Gate:** one booking manager reacts **and** one pays; instrument willingness-to-pay. Success = §16.B.7 met.
- **Phase 2 — monetization on:** flip plan enforcement from display-only to real; set prices from Gate evidence; (counsel-gated) turn on the target deep-scan.
- **Phase 3 — growth + depth:** instrument the growth loops (§16.B.13); finish Representation/Production depth; Hebrew launch.
- **Phase 4 — expansion:** locale-aware discovery beyond HE/EN; new buyer segments (§3.5).

**OPEN (owner):** the phase-gate criteria beyond the Gate, and whether Phases 2–3 run in parallel.

---

### 16.C — Items needing the owner's decision (consolidated OPEN list)

Everything this section could not close because it requires Maria's ruling:

**Taxonomy (Part A)**
1. **HE labels** for `genre_scene`, `genre_family`, `act_format`, `il_region`, `venue_type` — the
   proposed Hebrew is a *seed*; Maria owns the canonical HE column (GLOSSARY rule). **OPEN.**
2. **Scope of the genre-scene registry** — approve the seed set or commission the full family-by-family
   fill (55 subtypes / 32 DJ specializations from the Google Sheet; Registry B is empty). **OPEN / OWED.**
3. **`comedian-host` / `corporate-ceremony` reachability** — RESOLVED in the spec: `act.format` now
   carries `comedian-host` + `ceremony-act` (§16.A.2), which resolve deterministically to both families.
   Remaining to implement: the CHECK-widening migration (≥038, diff-first — §16.A.6.a) + `familyFor()` cases +
   **owner ratification of the HE labels (T-1)**. **OPEN only on the HE-label ratification.**
4. **Migration authorization** for the bilingual reference tables (author as ≥038, diff-first — §16.A.6.a; respect
   FROZEN 021 / `mirror-only`). **OPEN (migration approval is owner's per CLAUDE.md).**
5. **Hebrew word for "Act"** — de-facto live term is אקט; formal taste-ratification still pending
   (SESSION-MEMORY pending list). **OPEN.**

**Business (Part B)**
6. **Numeric goal targets** for every metric in §16.B.6.b (activation, publish, share→view, the Gate
   rate, confirm completion, act_created, willingness-to-pay). **OPEN.**
7. **Fixed pilot price** — recommendation ₪179 (range ₪149–249); locked only after the Gate. **OPEN.**
8. **ICP** — which demand-side segment monetizes first; unlocked by the Gate. **OPEN.**
9. **Manager-office (Roster) and Production pricing** — deliberately unpriced. **OPEN.**
10. **Supabase Pro $25/mo timing** — pre-pilot backups vs wait. **OPEN.**
11. **Green Invoice / receipts** — priority relative to first real payments (P1 legal gap; currently
    deferred by owner). **OPEN.**
12. **Agency-side financial record** — no payment trail captured today; decide whether to close before
    monetizing the office layer. **OPEN.**
13. **Token rotation** (Anthropic / Tavily, low urgency) — infra hygiene, owner action. **OPEN.**

---

_End of §16. Sources: `CLAUDE.md` · `docs/SESSION-MEMORY.md` · `docs/CFO-BRIEF.md` ·
`docs/ENTITY-GLOSSARY.md` · `docs/GLOSSARY.md` · `docs/TAXONOMY-REGISTRY-AUDIT.md` ·
`docs/ACCOUNTS-LIMITS-REGISTRY.md` · `docs/PILOT-MEASUREMENT-MAP.md` · `docs/VERSIONS.md` ·
`src/lib/genreWeights.js` · `src/lib/radarUniverse.js` · `src/lib/constants.js` ·
`src/lib/i18n/en.js`._

---

## 17. Interactivity, Motion Depth & Utility Screens

_Codex role — senior interaction designer. Becomes §17 of the LOCK master spec._
_Grounded in the behavioral ground-truth prototype (`scratchpad/lock-full-prototype.html`), the Radar signal spec (`ENTITY-STRUCTURE-AND-SMART-SCREENS-AUDIT.md` PART 5), the widget kit + per-screen law (same audit doc, PART 9 · PART 10), and `LOCK-PRODUCT-SPECIFICATION.md` §8. §8 defines *what each screen is and holds*; **this section defines how it moves, responds, and feels** — the interaction layer §8 defers to "see the prototype." It does not repeat §8; it deepens it._

**How to read this file.** Every motion value, easing, duration, and gesture threshold in PART A is **lifted from the real prototype** (path:line where load-bearing) — a developer can build the feel without opening the HTML. PART B specs the utility screens the prototype never drew. Markers: **`OWED`** = an exact DS v1.6.25 value that lives only on Drive (`00_CURRENT/LOCKSHOW_Design_System_CURRENT.html`) and must be filled by Codex; **`OPEN`** = a product/owner decision not yet made. Neither blocks building the interaction — they refine the finish.

---

### 17.0 · The motion system (build these tokens once, reference everywhere)

The prototype uses a **small, disciplined easing vocabulary**. Do not introduce new curves per component — bind these five tokens and reuse them. This is the single control point for the app's "feel."

#### 17.0.1 · Easing tokens

| Token | Curve | Personality | Used by |
|---|---|---|---|
| `--ease-orbit` | `cubic-bezier(.2,.8,.25,1)` | The signature LOCK ease — fast out, long settle. Confident, "instrument-grade." | Orbit logos, inspector slide-in, source-card rise, mobile sheet transform (proto :63) |
| `--ease-ui` | `cubic-bezier(.2,.7,.3,1)` | The standard UI ease — quick, neutral, unfussy. | Screen change, planet focus/recede (uni transform), sheet slide-up, rail (proto :209,300,982) |
| `--ease-bloom` | `cubic-bezier(.2,.9,.3,1)` | The reward ease — snappy entry, soft landing. | Confirm bloom, celebrate card, hero card, `cardpop` (proto :920,931,1017) |
| `--ease-fill` | `cubic-bezier(.3,.8,.3,1)` | Slow, deliberate growth. | Milestone journey fill bar (proto :878) |
| `--ease-overshoot` | `cubic-bezier(.2,1.4,.4,1)` | Playful overshoot past 1.0 — used **once**, for the seal mint. | `sealpop` on the "Verified" seal (proto :933). Do not reuse elsewhere. |

> `OWED` — Codex to confirm these five against DS v1.6.25 named motion tokens (the prototype names only `--ease-orbit`; the other four are inferred from repeated inline curves and should be promoted to named tokens).

#### 17.0.2 · Duration ladder (the only durations allowed)

| Band | Duration | Meaning | Examples (proto) |
|---|---|---|---|
| **Micro** | 140–200ms | Hover, press, chip toggle, tooltip, node hover | `.navitem .14s` · `.rf .16s` · `.pnode transform .2s` · tooltip `.18s` |
| **Transition** | 260–300ms | Enter/exit of a panel, planet focus/recede, sheet, scene fade | inspector `inspIn .26s` · `.uni transform .3s` · scrim `.22s` · sheet `.28s` |
| **Emerge** | 300–460ms | Staggered arrival — orbit logos, satellites, cards | `satEmerge .3s` · `orbit-emerge .46s` · `card-rise .26s` |
| **Reward** | 500–700ms | Confirm bloom, lock-in, celebrate, seal | `cardpop .5s` · `logo-lock .6s` · `sealpop .7s` · `bloom .42s` |
| **Fill / slow** | 1000ms | Milestone fill, count-up settle | `jfill width 1s` |
| **Ambient** | 1.8–9s loop | Living background — never triggered, always breathing | `sweep 9s` · `starglow 4.5s` · `sonar 5s` · `pfloat 6s` · `fdpulse 2s` |

**Rule:** an *interaction* (something the user triggered) uses Micro→Reward. An *ambient* loop is décor and is the **first thing killed** under reduced-motion. Never animate an interaction slower than 700ms — it stops feeling like a response.

#### 17.0.3 · `prefers-reduced-motion` — the global contract

The prototype's reduced-motion block (proto :409–411) kills every **ambient loop** and every **transform-based idle**, but **keeps opacity fades** so the UI still reads as responsive. Build the same three-tier rule everywhere:

| Tier | Full motion | Reduced motion |
|---|---|---|
| **Ambient loops** (sweep, sonar, starfield, starglow, pfloat, fdpulse, twinkle, logo-invite, jglow/jpulse, shimmer, scanbar) | play, infinite | **`animation:none`** — frozen at rest state |
| **Interaction transforms** (planet focus scale, orbit emerge, sheet slide, bloom, lock-in) | full transform + duration | **collapse to an instant opacity swap** — the element still appears/updates, but does not travel or scale |
| **State feedback** (fade-in of overlays, color change on confirm, toast) | fade `.18–.3s` | **keep** — a 180ms opacity fade is safe and preserves "something happened" |

Every `@keyframes` that moves geometry needs a reduced-motion sibling that only changes opacity. Every JS-triggered effect (`bloomAt`, confetti) must early-return on `reducedMotion()` (proto :1487,1497,2590) and instead flip straight to the success state.

#### 17.0.4 · The gold budget (motion-relevant)

Lime `#C8F04D` is reserved for **action + confirmed** and is the *only* color allowed to bloom, glow, or pulse on success. Gold `#F2C063` (`state.found`) may pulse **only** as the quiet "found, waiting" invitation (`fdpulse`, `logo-invite`, `foundpulse`) — a slow 2–2.8s breath, never a hard flash. Amber `#E39A4B` (`state.needsReview`) never animates — a static invitation, never shame. `OPEN` — owner leans toward retiring gold/amber for lime+neutral (§7.0/§8.2 of the audit); if retired, the found-state breath becomes a neutral `--mist` pulse (already the `fdpulse` shadow color, proto :321), no motion change required.

---

### PART A — INTERACTIVITY & MOTION DEPTH (per screen)

Each screen below is specified as **buildable interaction rules**: every interactive element as `trigger → immediate feedback (<100ms) → result state`; a **motion table**; a **gesture table** (mobile); and a **state-transition map**. The universal law (§6 Global UX Laws) holds on every screen: **one screen, one job, one next action; exactly one primary lime CTA on screen at any instant; immediate feedback on every action; warm, firewall-safe microcopy.**

The universal interaction primitives (reused on all screens):

- **Press feedback (all buttons/tappables):** on `:active`, scale to `.97` + shadow tighten over ~120ms `--ease-ui`; release springs back. Tap target ≥ 44px (§5.7). Never a button with no press state.
- **Toast / save confirm:** a small pill rises from bottom (mobile) or lower-right (desktop), `pop .5s --ease-bloom`, holds ~2.4s, fades. Carries an **undo** where the action is reversible (7s window on Passport-affecting confirms — §8.3).
- **Skeleton loading:** `shimmer 1.4s linear infinite` on a `--surface2→--raise` gradient (proto :626). Reduced-motion → static `--surface2` block, no shimmer.
- **Overlay/scrim entry:** `fade .18–.3s ease` + `backdrop-filter: blur(3–6px)` (proto :338,841). Scrim tap = dismiss (except where a decision is required).

---

### 17.A.1 · Onboarding (`/onboarding`) — the discover→confirm narrative in motion

§8.1 defines the 3 steps and copy. The **motion is the message**: Step 2 must *feel* like a machine reading the artist's public life, so that Step 3's findings feel *earned, not typed*.

#### Interaction model
| Element | Trigger | Immediate feedback (<100ms) | Result state |
|---|---|---|---|
| Name / link fields | focus | border lifts to `--accent`, label rises | active input; primary stays disabled until **both** non-empty (helper: "Add your name and one link to start.") |
| Primary "Find my footprint →" | tap (enabled) | press-scale `.97` | advances to Step 2; scan auto-runs |
| Source tiles (Step 2) | none (auto) | tiles light **one-by-one**, greyscale→color | see motion table; auto-advances ~3.2s |
| Scan bar | none (auto) | a lime sweep runs left→right, looping | `scanbar 1.15s linear infinite` (proto :1120) |
| Caption line | none (auto) | cycles the scan lines ~900ms each | 6 lines then Step 3 |
| Found rows (Step 3) | none (arrival) | rows stagger in, "✦ Found" chip pops per source | static found-grid; nothing is confirmed here |
| "Open my Radar & confirm →" | tap | press-scale | closes overlay (`fade` out), lands on Radar with ✦ items waiting |
| "I'll explore a sample first" | tap | quiet underline | Radar with sample data |

#### Motion table
| Moment | Property | Duration · easing | Reduced-motion |
|---|---|---|---|
| Step→step swap | opacity+translateY | `slidein .28s --ease-ui` (proto :209) | opacity only |
| Source tile light-up | greyscale(1)→0, opacity .38→1, scale .88→1 | `.45s cubic-bezier(.2,.8,.3,1)` staggered ~180ms each (proto :1111) | tiles appear lit instantly, no stagger |
| "✦ Found" chip on tile | scale .4→1, opacity 0→1 | `.3s` (proto :1115) | appears at rest |
| Scan bar | translateX loop | `scanbar 1.15s linear ∞` | **frozen** (hidden) — show a static "Reading…" label instead |
| Step-dot fill | width/color | `.3s` (proto :1089) | color swap only |
| Overlay in/out | opacity + blur | `fade .2s` | keep (fade is safe) |

**Firewall.** The tally ("8 findings") is a count of the artist's *own* found items, each method-labeled; never a grade. The animation discloses scope honestly ("a wider multi-source auto-scan is in development"). No score/gauge ever animates.

**Mobile.** Identical single-column card. Scan tiles wrap to a 4-col grid; the caption + scan bar sit below. No gestures required — this is a linear, auto-advancing narrative. One primary CTA, full-width, pinned to the card bottom.

**DoD (motion).** Step 2 auto-advances and is fully legible with motion off (static "Reading your public footprint…" + a determinate "5 of 5 sources" text). Tiles stagger only with motion on. No page scroll at 390 and 1360.

---

### 17.A.2 · Artist Radar + Inspector — the central interactive engine

This is the deepest interaction surface in the product. §8.2/§8.3 define the 4-zone canvas, the six planets, and the 3-layer inspector. Below is the **complete motion + gesture + state model** — the "orbit widget" the owner asked to be explained (U32).

#### 17.A.2.a · The living background (ambient, always breathing)

Six loops run continuously on the dark universe island; all six are in the reduced-motion kill-list (proto :410).

| Layer | Animation | Meaning (never a gauge) |
|---|---|---|
| Radar sweep | `sweep 9s linear ∞`, conic wedge, radial mask (proto :306) | "we continuously watch your public footprint." Points at nothing, measures nothing. |
| Sonar | `sonar 5s ease-out ∞`, ring 14%→94% (proto :391) | the star "pinging" outward — alive, scanning |
| Starfield | `twinkle 5s ease-in-out ∞` (proto :386) | depth |
| Center star | `starglow 4.5s ease-in-out ∞`, lime shadow 24px↔40px (proto :357) | the artist's proof "breathing" — the one gold/lime aura |
| Planet bob | `pfloat 6s ease-in-out ∞`, ±2.5px (proto :310) | planets feel afloat, not pinned |
| Found dot | `fdpulse 2s ease-in-out ∞` (proto :321) | "something here is waiting for you" |

Constellation threads (`.constel line`, proto :398) transition `stroke .4s, opacity .4s` when a planet's state changes; **Ready/Developing threads flow energy inward** via `flowLit`/`flowDev` (dash-offset march, proto :403–404) — growth made visible. Reduced-motion freezes the flow (`.cl-lit,.cl-dev animation:none`) but keeps the state color.

#### 17.A.2.b · Planet focus / recede — the core gesture

**Trigger:** tap a planet (`openPlanet`). **Immediate feedback (<100ms):** the tapped planet's `.pnode` lifts (transform+shadow `.2s`); the whole universe reflows.

| Effect | Property | Duration · easing |
|---|---|---|
| Universe subtle zoom toward selection | `.uni` transform | `.3s --ease-ui` (proto :300) |
| **Non-selected planets recede** | opacity→~40% (desktop) / dim to ~22% off-lens, `filter` | `.3s` opacity+filter (proto :308) — **fade, never removed** |
| Selected planet node emphasis | box-shadow/border | `.2s` |
| Source logos **orbit-emerge** around the planet | scale .2→1, opacity 0→1, fanned inward (~84° spread) toward the star | `orbit-emerge .46s --ease-orbit both`, **staggered** per logo (proto :576) |
| Inspector slides in (desktop right rail) | translateX 14px→0, opacity .3→1 | `inspIn .26s --ease-orbit` (proto :443) |
| Proof card rises under planet (mobile "focus card") | translateY 8px→0, scale .96→1 | `card-rise .26s --ease-orbit` (proto :594) |

**Recede rule (firewall + design):** off-focus planets fade but **stay interactive and full-order** — dimming is a focus aid, reversible, never a judgement and never a reorder. Tapping the center star or the scrim returns all planets to 100%.

#### 17.A.2.c · The orbit-logo widget (the heart of U32)

On planet select, its evidence sources become **logos orbiting the planet**. Each logo is a live control.

| Logo state | Visual | Motion | Trigger → result |
|---|---|---|---|
| **Found (waiting)** | gold ring | `logo-invite 2s ease-in-out ∞` (proto :577) — slow breath | tap → opens the found-row (exact wording + concrete source + proves/doesn't-prove) in the inspector |
| **Confirmed** | lime ✓ | static, settled | tap → shows method label + human source line; long-press → method detail |
| **Emerging** | — | `orbit-emerge .46s --ease-orbit` staggered | arrival on planet select |
| **Locking in** (confirm) | lime bloom | `logo-lock .6s --ease-orbit` — scale 1→1.18→1, 30px lime flash (proto :586) | the "minting a moment" — see 17.A.2.e |
| **Dismissed ("not me")** | fades out | `orbit-dismiss` — opacity→0, scale→.4 (proto :588) | recorded, **not deleted** (name-ambiguity honesty) |

The orbit ring itself can slowly rotate (`orbit-spin`/`orbit-spin-rev`, proto :565–566) as pure décor; reduced-motion stops it. A **scrim** (`orbit-scrim`, `fade .2s`, proto :553) sits behind the orbiting set on mobile so the focused planet reads as modal; tap-scrim = recede.

#### 17.A.2.d · The 3-layer inspector (desktop rail · mobile sheet)

Content per §8.3 (Meaning / Found proof / Next action). Motion:

- **Desktop:** persistent right rail, always visible, always holds the single primary CTA. On planet change it re-renders with `inspIn .26s --ease-orbit` (or `slidein-r .26s --ease-ui`, proto :341). It never leaves.
- **Mobile:** a **bottom-sheet** (`.rwinsp`, `.psheet`). Closed = translated off-screen (`translateY(calc(100% + 240px))`, proto :543). Open = `slidein-up .26s --ease-ui` (proto :982) / transform `.28s --ease-orbit`. A **grab handle** (`.insp-grab`) sits at the top. The scrim (`.rwscrim`, opacity `.22s`, proto :548) darkens behind.
- **The one-CTA guarantee:** `holdsCTA = !mobileMQ() || sheetOpen` (proto :1955). Desktop inspector always holds the CTA; on mobile the inspector holds it **only when the sheet is open**, otherwise the **bottom dock** (`radarDock`) carries the next-best move. Net: exactly one primary lime CTA on screen at every instant (proto :1972–1973).

#### 17.A.2.e · Confirm → lock-in bloom (the reward moment)

The single most important micro-interaction in the app. **Trigger:** tap "Review your {dimension}" → confirm a found row (`confirmTop`).

| Stage | Effect | Motion |
|---|---|---|
| 1 · button press | scale `.97` | 120ms `--ease-ui` |
| 2 · node flips ✦→✓ | `litpop` — scale .6→1.18→1, 34px lime shadow bloom (proto :326) | ~500ms `--ease-bloom` |
| 3 · orbit logo locks | `logo-lock .6s --ease-orbit` (proto :586) | overlaps stage 2 |
| 4 · bloom burst at planet center | `bloomAt(x,y)` → a lime radial scales .2→26, fades (proto :916, :1497) | `bloom .42s --ease-bloom`; **early-returns on reduced-motion** |
| 5 · optional celebrate | confetti `fall` + `celebrate-card pop .5s` (proto :913,931) | reserved for milestone-crossing confirms only, not every tap |
| 6 · named receipt toast | "**Added to your Passport**" _or_ "**Saved privately**" + **7s undo** | `pop .5s --ease-bloom`; honest destination (only verified/supporting + passport-ok reach the Passport — §8.3) |
| 7 · thread relights | the planet's constellation thread → lime, energy flows inward (`flowLit`) | `stroke .4s` |

Reduced-motion path: node swaps ✦→✓ instantly (opacity), no bloom, no confetti; the receipt toast still fades in (feedback preserved).

#### 17.A.2.f · Scene lens & filter lens

| Element | Trigger | Feedback | Result |
|---|---|---|---|
| Scene segmented control (Melodic/Progressive/Afro/All) | tap segment (`pickScene`) | active pill raises, `.14s` (proto :426) | re-weights which planets carry the **★ genre-primary ring** — a *reading lens on the same evidence*, **never a data change**. Threads/planets keep values; only the ★ moves. |
| Show-lens (All · Needs my review · Ready to publish) | tap (`pickFilter`) | pill raises `.16s` (proto :296) | off-lens planets dim to ~22% `.3s` (reversible); "Needs my review" opens the batch-confirm entry |

The scene control sits **top-center and never overlays the act card** (proto :417 grid area `scene`). ★ additive only — non-primary planets keep full opacity/interactivity/order.

#### 17.A.2.g · Gesture table (mobile "Radar Focus")

Real handler at proto :1940–1947.

| Gesture | Threshold (from prototype) | Action |
|---|---|---|
| **Tap planet** | — | focus in place, logos orbit, sheet available |
| **Tap orbit logo** | — | small proof card |
| **Long-press logo** | ~500ms `OWED` (prototype uses tap→method; long-press is the §8.3/PART10 target) | method label detail |
| **Swipe left / right** on universe or inspector | `\|dx\| > 48px` **and** `\|dx\| > \|dy\| × 1.4` (proto :1945) | `cyclePlanet(±1)` — next/prev planet, universe reflows |
| **Pull-down / grab-handle drag** on sheet | drag past handle | `closeSheet` — sheet slides out `.28s`, planets return to 100% |
| **Tap scrim** | — | `closeSheet` |
| **Tap center star** | — | overview (deselect all) |

`OWED` — the sheet **drag-follow** (finger tracks the sheet 1:1 before the release threshold) is a target refinement; the prototype animates open/closed but does not finger-track. Spec: while dragging, `translateY` follows touch delta; release past ~30% height or with downward velocity → close, else snap back `.28s --ease-orbit`.

#### State-transition map (Radar planet)
| State | Face | Thread | Trigger in → | Motion |
|---|---|---|---|---|
| **Needs you** | amber ring, ✦ found-dot pulsing | amber | found item exists / empty | `fdpulse` on dot |
| **Developing** | teal ring | teal, flowing | some confirmed, gaps remain | `flowDev` |
| **Ready** | lime, ✓ | lime, glowing+flowing | all confirmed, no gaps | `flowLit` |
| **Locked / Not needed yet** | faint, no orbit evidence | faint | Kit before Live backed | static; warm copy "opens once your live draw is backed" |
| selected | node lifts, logos orbit | — | tap | focus motion (17.A.2.b) |
| confirming | ✦→✓ bloom | relights | confirm | lock-in (17.A.2.e) |
| dismissed | logo fades | unchanged | "not me" | `orbit-dismiss`, recorded not deleted |

**DoD (Radar motion).** Six ambient loops present and all in the reduced-motion kill-list; planet focus fades others to 40% (never removes); orbit logos emerge staggered + lock-in blooms; exactly one primary CTA (inspector XOR dock) at all times; swipe cycles at the 48px/1.4 threshold; pull-down/scrim close; scene ★ re-weights without changing data; zero score/rank/%/gauge; no h-scroll at 390/1360.

---

### 17.A.3 · Passport (artist multi-view · edit vs buyer-preview)

§8.4. Light surface, a single dark hero island. The interaction job: **switch faces cheaply, preview the true public read, publish/share.**

#### Interaction model
| Element | Trigger | Feedback | Result |
|---|---|---|---|
| **View-switcher chip** ("Viewing as: {view} ▾") | tap (`toggleView`) | chip depresses, popover fades in `fade .18s` | popover "Show this Passport as" + radio rows (Booker/Representation/Production/Private) with ✓ on active |
| View row | tap (`pickView`) | ✓ moves | **ledger re-orders per face** — proof cards restack; the "what {noun} sees" line + lead proof swap |
| Gaps bar (artist-only) | tap (`toggleGaps`) | chevron rotates `.3s` | expands the private item + "Add it" ghost |
| "Publish Passport" (draft) | tap (`publish`) | press-scale; **seal mint** | standing → "Live for buyers · refreshed {date}"; the "LOCK · Verified" seal does `sealpop .7s --ease-overshoot` (proto :933) — the one overshoot in the app |
| Proof card | hover (desktop) | lifts `.18s` | source-peek affordance (mirrors Buyer, 17.A.6) |
| "Preview on Passport" | tap | — | jumps to the true public read |

#### Motion table
| Moment | Duration · easing | Reduced-motion |
|---|---|---|
| Face switch (ledger re-order) | cards fade+restack `.26s --ease-ui` | instant restack, opacity only |
| Popover open | `fade .18s` | keep |
| Gaps expand | height/chevron `.3s` | keep (no travel — height only) |
| Publish → seal mint | `sealpop .7s --ease-overshoot` + `spin` (proto :924) | seal appears at rest, no spin |
| Hero island | static dark; no per-load animation (atmos band removed app-wide, U29) | — |

**Firewall.** Verified strengths only; draw = bands, readiness = binaries, each with a method chip. No gap on any buyer face. **No firewall strip / no narration** (U33) — enforced by the absence of any score/rank component, never announced. De-technicalised provenance (method chips + seal, not "✓ 2 published" badges, U23).

**Mobile.** View-switcher chip in the page header (not in-card tabs). Popover becomes a bottom-sheet (`slidein-up .26s`). Single column; hero island first-viewport. One primary CTA (Publish, or Preview).

**DoD.** Four faces from one pool re-order on switch; header view-switcher shared with the Radar scene-switch pattern; publish → seal mint (overshoot, motion-off safe); gaps bar artist-only; no firewall strip.

---

### 17.A.4 · Requests (artist inbox → decision cockpit)

§8.13 / §10.4. Each request is a **decision widget**, not a list row: one-sentence fit summary, missing-info, safety cue, three actions.

#### Interaction model
| Element | Trigger | Feedback | Result |
|---|---|---|---|
| Request card | tap / expand | details slide open `.26s --ease-ui` | shows event, date, LOCK's one-sentence fit line, "no contact shared yet" safety cue, missing-info flags |
| **"Say I may be available"** (primary) | tap | press-scale; toast | reply logged; card → "✓ Availability sent" chip; **this is the Gate reaction path** |
| "Ask one question" | tap | inline field opens | a bounded question back to the buyer |
| "Not for me" | tap | card collapses, muted | declined, logged |
| Swipe (mobile) | swipe right = available / left = not-for-me | card slides with finger | `OWED` threshold — reuse Radar's `\|dx\|>48 & \|dx\|>\|dy\|×1.4`; require a confirm tap for a booking-affecting swipe (no accidental send) |

#### State-transition map
| State | Visual | Motion |
|---|---|---|
| new | lime dot, raised | subtle `foundpulse 2.8s` (proto :1011) — "needs you" |
| opened | expanded details | slide `.26s` |
| replied | "✓ Availability sent" | `cardpop .5s --ease-bloom` |
| asked | "Awaiting reply" chip | static |
| declined | muted, collapsed | fade |
| empty | "No requests yet — when a buyer checks your date, it lands here." | — |

**Firewall.** The reaction insight that later returns to the artist is **method-safe text only, never a count/%/score** (CLAUDE.md — the most fragile spot). A request never shows a "match score"; fit is a one-sentence human reason.

**DoD.** Cards carry fit-line + missing-info + safety cue; three actions; new-state pulse; reply mutates the card in place; swipe requires confirm; zero score.

---

### 17.A.5 · Access — "Who can act for you" (`/artist/access`)

§8.5. A calm consent surface. Motion is minimal by design — trust, not spectacle.

| Element | Trigger | Feedback | Result |
|---|---|---|---|
| "Invite someone" | tap (`accessInvite`) | sheet/dialog `slidein-up .26s` | invite form (name + scope checkboxes) |
| Scope toggle | tap | checkbox fills `.16s`, lime | scope added; live "what they'll be able to do" line updates |
| "End access" | tap (`accessRevoke`) | confirm dialog | card → "Access ended", actions removed |
| "Resend invite" | tap (`accessResend`) | toast "Invite resent" | pending card unchanged |

State map: **Active** (since date) · **Pending** (waiting) · **Ended** (no actions) · **Empty** (invite prompt). No score, no rank. Entity law: never "grant/ownership" language toward the artist — consent-based, scoped, revocable by either side.

**DoD.** Invite/active/pending/ended/empty; scope toggles update the live description; revoke behind a confirm; no ownership language.

---

### 17.A.6 · Buyer / Public Passport (`/passport/:id`) — the 60-second decision, in motion

§8.7. **No login.** The interaction job: answer fit·trust·readiness·availability in the first viewport, and make trust **inspectable** via the source-peek.

#### Interaction model
| Element | Trigger | Feedback | Result |
|---|---|---|---|
| Persona toggle (Booking a show / Representing) | tap | segment slides `.16s` | copy + section titles + CTA swap (draw↔career; "Check availability"↔"Discuss representation") |
| **Proof-unit source-peek** | hover (desktop) / tap (mobile) | a small peek card rises `card-rise .26s --ease-orbit` | shows **where it comes from** + **what the method label means** — trust made inspectable |
| Sticky availability CTA | scroll | stays pinned (mobile) | tap → availability request (§8.8) |
| "Send to partner" | tap | copy-link toast | shareable URL copied |

#### Motion table
| Moment | Duration · easing | Reduced-motion |
|---|---|---|
| Persona swap | `.16s` segment + `.2s` content cross-fade | opacity only |
| Source-peek in/out | `card-rise .26s --ease-orbit` / fade out `.18s` | fade only |
| Sticky CTA | no animation, position:sticky | — |
| Hero | static dark island (no atmos animation) | — |

**Firewall.** Verified strengths only; draw = bands, readiness = binaries, each method-labeled. No gap, no score/rank/prediction. **Remove the leftover `.fwstrip` footer** (U33). Peer bands never shown buyer-side unless method-safe and requested. The source-peek explains provenance, never quality.

**Mobile.** Single column; sticky compact availability CTA; source-peek is tap (not hover). Non-pro register for private/corporate (warm, non-industry).

**DoD.** First viewport answers the four questions; persona swap changes copy+CTA; source-peek on every proof unit; sticky CTA; no firewall strip; no login.

---

### 17.A.7 · Source-Confirmer (`/confirm/:token`) — warm one-minute confirmation

§8.9. **Accountless**, one statement, one decision. The entire surface is one centered card — **no nav, no shell** (retire `/producer`, D3). Motion = warmth, not gamification.

#### Interaction model
| Element | Trigger | Feedback | Result |
|---|---|---|---|
| "Yes — this is accurate" (primary) | tap (`cfConfirm`) | press-scale; **quiet lime settle** (no confetti — this is someone else's reward, keep it dignified) | Done state: "Recorded — thank you" + the statement now carries **Producer-confirmed** |
| "Partly right — needs a fix" | tap | inline correction field opens `.26s` | confirms most + notes the correction |
| "No — this isn't accurate" | tap (`cfDecline`) | warn-tint press | records a decline (won't show as confirmed) |
| "What happens after I answer?" | tap | expandable opens `.3s` | legal + name-visibility detail (moved out of the primary flow) |
| "Replay this link" | tap (`cfReset`) | — | back to Ask |

State map: **Ask** (three large choices) → **Done** (receipt + "Revocable anytime" + replay). Motion is restrained: the Done state fades in (`fade .3s`); the "Producer-confirmed" chip may do a single gentle `cardpop`, no bloom-burst. Reduced-motion → instant.

**Firewall.** This one statement only — never an endorsement, never a score/rating. Adds only the canon **Producer-confirmed** label. Revocable; the artist controls publishing.

**DoD.** Single card, no shell; three warm choices incl. inline "partly"; Done receipt with revoke route; legal in an expandable; motion restrained + motion-off safe.

---

### 17.A.8 · Representation — Roster cockpit

§8.10. A **cockpit of artist-bound action cards** ("who needs help today"), never a CRM table.

| Element | Trigger | Feedback | Result |
|---|---|---|---|
| Roster action card | tap | expands `.26s` | what-changed line + why + method/band chips + ArtistAccess scopes |
| **Urgent card** (a buyer is waiting) | arrival | `foundpulse 2.8s` + amber flag | "A buyer is waiting on you…" — always sorts first |
| "Publish update" / "Answer request" (one per card) | tap | press-scale; toast | row → "✓ Update published" / "✓ Availability sent" (`cardpop .5s`) |
| Filter (urgent / ready / needs-approval) | tap | pill raises `.16s` | list re-filters, cards fade-restack `.26s` |
| "Invite artist" | tap | sheet | invite by ArtistAccess (consent, not ownership) |

**Firewall / entity law.** **No roster rank** (never-rank-roster). Reaction insight = method-safe text only. No CRM tables. ArtistAccess = a grant the artist can revoke — never ownership language. **DoD.** Each row = one artist-bound card (what changed · why · one action); urgent state pulses+sorts first; action mutates the row; consent+scope shown; no rank.

---

### 17.A.9 · Production — Lineup board

§8.11. An event/lineup **board** of time-ordered slots, not rows. Booking = acting as a Buyer (open a Passport → availability request).

| Element | Trigger | Feedback | Result |
|---|---|---|---|
| Event card | tap | expands to timeline | slots top-to-bottom by set-time |
| **Slot chip** (Open/Requested/Confirmed) | tap | press-scale | Open → "Confirm for this slot" opens a Passport/act picker |
| "＋ New event / open slot" | tap | sheet `slidein-up .26s` | Draft event card created (`cardpop`) |
| Suggested-act card | tap | — | fit *reason* (never a rank) + open its Passport |
| Slot confirm | tap | slot → "✓ Confirmed · {act}" | `cardpop .5s --ease-bloom` |

State map (per slot): **Open** ("needs an act") · **Requested** ("Awaiting reply") · **Confirmed** ("✓ {act}"). Note: event/lineup **creation** UI is target (view-only in the real app today). **Firewall.** Production never owns an artist's evidence — it reads Passports; suggested acts carry a fit *reason*, never a rank/score. **DoD.** Time-ordered slots; open/requested/confirmed states; create-event/open-slot; one CTA per slot; Production-as-Buyer path; no evidence ownership.

---

### 17.A.10 · The inline-edit widget (full spec — the D1 fix, reused everywhere)

The single most reused interactive primitive after the button. It opens **in place** (never a new page), on the Radar inspector (§8.3), the Act-Identity Editor (§8.6), and Account (17.B.5). Per §10.4 every field is QA'd with: **empty · typing · long value · Hebrew · URL · invalid.**

#### The seven states (per field)
| State | Visual | Motion | Copy example |
|---|---|---|---|
| **Display** | value + "Edit" affordance | — | value shown; "Edit" ghost |
| **Open in place** | field replaces value, focus, caret | field grows in `.16s`, border → `--accent` | placeholder / current value prefilled |
| **Typing** | active border, live validation | border stays lime; counter ticks (textarea) | live char-count "82 / 120" |
| **Valid / dirty** | "● Editing" chip + Save + Cancel | chip fades in `.18s` | "Save — right here" |
| **Saving** | button → spinner, field locks | `shimmer` on the row `.16s` | "Saving…" |
| **Saved** | "✓ Saved" chip, value returns to display | `cardpop .5s --ease-bloom` on the row | "✓ Saved" (auto-fades ~2.4s) |
| **Error** | red hairline + human message + Retry | field shakes once (2px, 120ms) — **skipped on reduced-motion** | "That link doesn't look right — paste the full address (https://…). [Retry]" |

#### Per-field behavior
| Field | Validation | Empty helper | Invalid message |
|---|---|---|---|
| Stage name | non-empty | "Your Act's name — what a buyer reads first." | "Add a name so buyers know who they're booking." |
| City | non-empty | "Where you're based." | — |
| One-line positioning | ≤120 chars, live counter | "One line on what you do." | "Keep it to one line — {n} left." |
| Genre | from set / free | "Your scene — it also lights the planets that matter most." | — |
| Link / URL | URL shape, `dir=ltr` | "Paste a public link." | "That link doesn't look right — paste the full address." |
| Draw fields | **band select only** | — | (never free-typed — firewall) |

**Interaction law.** Field-level save (each row independent); **undo** on save (a quiet "Undo" in the saved toast); confirmed radar nodes expose an "edit" affordance that **re-opens the fill widget pre-filled**; a "what becomes public" chip on each field; nothing publishes until the Passport is refreshed. **Firewall.** Draw saves as bands only; no score/rank field can exist. **DoD (per field):** empty=friendly helper · typing=active border+live validation · invalid=human explanation · saved=visible confirmation+undo · loading · error-retry · Hebrew/RTL + long-value + URL cases all pass.

---

### PART B — THE MISSING UTILITY SCREENS

These are the screens the prototype never drew — the plumbing that a real product needs and that §8 does not cover. **All utility screens are LIGHT / paper theme** (dark is reserved for Radar/Passport atmosphere only — DS v1.6.23 "dark is atmosphere, not camouflage"). **Mobile = bottom-sheets, one primary CTA, 44px targets.** Language is human — **no internal terms** (no "org", "role_assignment", "entitlement" on screen). Each is spec'd like §8: **PURPOSE · DESKTOP · MOBILE · COMPONENTS · STATES · INTERACTIONS · MICROCOPY (EN + HE where derivable) · FIREWALL · DoD.**

Shared tokens (light): paper `#F3F5EF` · white card `#FFFFFF` · forest panel `#18221A` · ink text `#0A0D0B` · slate muted `#687269` · lime CTA `#C8F04D` · mist border `#DDE3D9`. `OWED` — exact card border/elevation, radius scale (`--r`, `--r2`), light-card muted/faint, and CTA primary/secondary/ghost paddings + the 44px rule's exact values live only in DS v1.6.25 (Drive) — fill from `LOCKSHOW_Design_System_CURRENT.html`.

---

### 17.B.1 · Signup

**PURPOSE.** Create an account with the least friction, then hand off to the right onboarding (artist → §8.1; buyer needs no account). One decision: email or Google.

**DESKTOP.** Centered light card (max ~420px) on paper. Brand lockup · H1 "Create your account" · Google button (full-width, secondary) · "or" divider · email + password fields · primary "Create account" · legal microcopy · footer "Already have an account? Log in".
**MOBILE.** Same card full-bleed with 16px gutters; primary CTA pinned; Google button first (thumb-reachable). No bottom-sheet needed (this is a full page).

**COMPONENTS.** Brand lockup · Google OAuth button (with G mark) · email field · password field (show/hide toggle) · primary CTA · inline error region · legal line.

**STATES.** default · field-focus (lime border) · password-too-short (inline helper) · email-taken ("That email already has an account — log in instead" + link) · submitting (CTA → spinner, `shimmer` on card) · success (→ onboarding) · OAuth-cancelled (return to default, quiet note) · offline (see 17.B.10).

**INTERACTIONS.** Google → OAuth popup/redirect → on return, route by role (`state.from` honored). Email → validate → create → route. Enter submits. Password show/hide toggles.

**MICROCOPY (EN / HE).** H1 "Create your account" / "פתיחת חשבון" · Google "Continue with Google" / "המשך עם Google" · email "Email" / "אימייל" · password "Password" / "סיסמה" · helper "At least 8 characters." / "לפחות 8 תווים." · CTA "Create account" / "יצירת חשבון" · legal "By continuing you agree to our Terms and Privacy Policy." / "בהמשך אתה מאשר את תנאי השימוש ומדיניות הפרטיות." · footer "Already have an account? **Log in**" / "כבר יש לך חשבון? **התחברות**".

**FIREWALL.** Neutral — no evidence surface. Do not pre-collect anything that implies a score.
**DoD.** Email + Google paths; validation states; email-taken → login link; `state.from` deep-link honored; light theme; one primary CTA; keyboard-submittable; HE strings externalized.

---

### 17.B.2 · Login (email + Google OAuth)

**PURPOSE.** Return an existing user to where they were. One job, two paths.

**DESKTOP / MOBILE.** Mirror of Signup: brand · H1 "Log in" · Google button · email + password · "Forgot password?" link · primary "Log in" · footer "New here? Create an account".

**COMPONENTS.** Google button · email · password (show/hide) · forgot-password link · primary CTA · inline error.

**STATES.** default · focus · wrong-credentials ("Email or password doesn't match. Try again or reset your password.") · submitting · success (→ `state.from` or role home) · OAuth-cancelled · rate-limited ("Too many attempts — wait a moment and try again.") · offline.

**INTERACTIONS.** Enter submits; Google OAuth; "Forgot password?" → 17.B.3; on success honor deep-link `state.from` (§8.13).

**MICROCOPY (EN / HE).** H1 "Log in" / "התחברות" · "Forgot password?" / "שכחת סיסמה?" · error "Email or password doesn't match." / "האימייל או הסיסמה לא תואמים." · CTA "Log in" / "התחברות" · footer "New here? **Create an account**" / "חדש כאן? **פתיחת חשבון**".

**FIREWALL.** Neutral. **DoD.** Both paths; wrong-credential + rate-limit states; forgot-password link; deep-link honored; light theme; one CTA.

---

### 17.B.3 · Forgot / Reset password

**PURPOSE.** Recover access safely in two steps: request a link → set a new password.

**DESKTOP / MOBILE.** Step 1 (request): H1 "Reset your password" · email field · primary "Send reset link" · "Back to login". Step 2 (from email link): H1 "Set a new password" · new password + confirm · primary "Save new password".

**COMPONENTS.** email field · CTA · confirmation panel · (step 2) two password fields with match validation · show/hide.

**STATES.** request-default · submitting · **sent** ("Check your email — we sent a reset link to {email}. It expires in 60 minutes." — always shown even if the email doesn't exist, to avoid account enumeration) · link-expired ("This link has expired — request a new one.") · step2-default · passwords-mismatch · saving · success (→ login) · offline.

**INTERACTIONS.** Send → always show the neutral "sent" panel (enumeration-safe). Step 2 validates match + length, saves, routes to login with a success toast.

**MICROCOPY (EN / HE).** "Reset your password" / "איפוס סיסמה" · CTA "Send reset link" / "שליחת קישור לאיפוס" · sent "Check your email — we sent a reset link to {email}." / "בדוק את האימייל — שלחנו קישור לאיפוס אל {email}." · expired "This link has expired — request a new one." / "הקישור פג תוקף — בקש קישור חדש." · step2 "Set a new password" / "בחר סיסמה חדשה" · mismatch "The two passwords don't match." / "הסיסמאות אינן תואמות." · CTA "Save new password" / "שמירת סיסמה חדשה".

**FIREWALL.** Neutral; enumeration-safe (never reveal whether an email exists). **DoD.** Two steps; enumeration-safe "sent"; expired-link state; match+length validation; success → login; light theme.

---

### 17.B.4 · Invite → Accept (org / team)

**PURPOSE.** A person clicks an invite link (`/invite/:token`) and joins a workspace with a role — the team-formation moment. Human language only ("Maya invited you to join {Workspace}"), never "role_assignment".

**DESKTOP / MOBILE.** Centered card: inviter avatar + "**{Inviter}** invited you to join **{Workspace}**" · a one-line "what you'll be able to do" (role in plain words) · primary "Accept & join" · secondary "Not now". If not signed in → first create/log in (17.B.1/2), then land back here (token preserved).

**COMPONENTS.** inviter chip · workspace name · plain-role line · Accept CTA · decline ghost · expired/used panel.

**STATES.** valid (accept) · **needs-auth** (prompt to sign in first, token held) · accepting (spinner) · **accepted** (→ that workspace home with a welcome toast) · **expired** ("This invite has expired — ask {Inviter} to send a new one.") · **already-used** ("This invite was already used.") · **wrong-account** ("This invite is for {email}. You're signed in as {other} — switch accounts?").

**INTERACTIONS.** Accept → join, route to workspace, toast "You've joined {Workspace}". Decline → neutral confirmation. Auth-gate preserves `:token` through signup/login.

**MICROCOPY (EN / HE).** "**{Inviter}** invited you to join **{Workspace}**" / "**{Inviter}** הזמין אותך להצטרף ל-**{Workspace}**" · role line "You'll be able to {help with bookings / manage the roster / …}." / "תוכל {לעזור עם הזמנות / לנהל את הרוסטר / …}." · CTA "Accept & join" / "אישור והצטרפות" · decline "Not now" / "לא עכשיו" · expired "This invite has expired — ask {Inviter} to send a new one." / "ההזמנה פגה — בקש מ-{Inviter} הזמנה חדשה."

**FIREWALL.** Neutral; no ranking of members. Role shown in plain capability words, never internal enum. **DoD.** Valid/expired/used/wrong-account/needs-auth states; token survives auth; accept routes to workspace + toast; plain-language role; light theme.

---

### 17.B.5 · Account Settings (person-level)

**PURPOSE.** The person (not the Act, not the workspace) edits their own basics and controls their account. Reachable from the top-right hub (§7.2). `OPEN` — owner U26: whether this is a full screen or folds into the hub; spec here as a screen with the hub linking in.

**DESKTOP.** Light page, single column of setting rows (reuse the inline-edit widget, 17.A.10): **Name** · **WhatsApp** · **Language** (EN/HE select — this is where language lives, removed from every workflow per U1) · **Marketing preferences** (toggle) · a divider · **Danger zone**: "Delete account".
**MOBILE.** Same rows full-width; "Delete account" opens a bottom-sheet confirm.

**COMPONENTS.** inline-edit rows (name, WhatsApp) · language select · marketing toggle · delete-account row + confirm sheet · save toasts.

**STATES.** per-row (display/editing/saving/saved/error — 17.A.10) · marketing toggle (on/off, saves immediately with a toast) · language change (applies + confirms; RTL flips for HE) · **delete confirm** (bottom-sheet: "This removes your account and your Acts' evidence. This can't be undone." + type-to-confirm or explicit "Delete my account" + "Cancel") · deleting · deleted (→ signed-out marketing page).

**INTERACTIONS.** Inline field save; toggle saves live; language switch re-renders (RTL for HE); delete → confirm sheet → hard confirm → sign out.

**MICROCOPY (EN / HE).** H1 "Account" / "חשבון" · "Name" / "שם" · "WhatsApp" / "וואטסאפ" · "Language" / "שפה" · marketing "Send me product updates and tips" / "שלחו לי עדכונים וטיפים על המוצר" · delete "Delete account" / "מחיקת חשבון" · confirm "This removes your account and your Acts' evidence. This can't be undone." / "פעולה זו מוחקת את החשבון ואת הראיות של האקטים שלך. אי אפשר לבטל." · CTA "Delete my account" / "מחק את החשבון שלי".

**FIREWALL.** Neutral. Marketing prefs are opt-in-honest (see 17.B.8). **DoD.** Editable name/WhatsApp/language/marketing with inline-edit DoD; language RTL flip; delete behind a hard confirm → sign-out; light theme; HE strings.

---

### 17.B.6 · Org / Team management (members, roles, seats)

**PURPOSE.** A workspace owner/admin manages who's on the team, their role, and seats — human language, no CRM feel. (This is `/org/members` today — §8.10 `/team`.)

**DESKTOP.** Light page: H1 "{Workspace} team" · seat line ("3 of 5 seats used") · "Invite teammate" primary · a **members list** (avatar · name · role chip · status) · per-member menu (change role, remove). 
**MOBILE.** Members as stacked cards; invite as a bottom-sheet; per-member actions in a sheet.

**COMPONENTS.** seat meter (used/total, **plain text — not a graded bar**) · invite CTA · member row (avatar, name, role chip, status: active/invited) · role picker (plain words) · remove-member confirm.

**STATES.** default list · invite-sheet (email + role) · pending member ("Invited — waiting to accept") · seats-full ("All seats are used — upgrade to add more" → 17.B.7) · changing-role (saving/saved) · remove-confirm · empty (owner-only, "Invite your first teammate").

**INTERACTIONS.** Invite → creates `/invite/:token` (17.B.4) → toast. Change role → saves inline. Remove → confirm → row fades. Seats-full → routes to Billing.

**MICROCOPY (EN / HE).** H1 "{Workspace} team" / "צוות {Workspace}" · seats "3 of 5 seats used" / "3 מתוך 5 מושבים בשימוש" · CTA "Invite teammate" / "הזמנת חבר צוות" · pending "Invited — waiting to accept" / "הוזמן — ממתין לאישור" · full "All seats are used — upgrade to add more." / "כל המושבים בשימוש — שדרג כדי להוסיף." · remove "Remove {name} from the team?" / "להסיר את {name} מהצוות?".

**FIREWALL.** No member **rank/leaderboard**. Roles in plain capability language. Seat count is a plain fact, never a grade. **DoD.** Members list with role chips + status; invite → token flow; inline role change; seats used/total; seats-full → upgrade; remove-confirm; light theme.

---

### 17.B.7 · Billing / Plan / Upgrade (free-pilot state)

**PURPOSE.** Show the current plan, let a workspace upgrade / add seats. **STAGE-honest:** LOCK is pre-validation — monetisation is **measured, not required**; the founding cohort is a **free pilot**. No price/ICP is locked until the Gate. So the default state is a clean "You're on the founding pilot," not a hard paywall.

**DESKTOP.** Light page: current-plan card ("Founding pilot · free during the pilot") · a plan picker (cards: Solo / Team / Company) with plain feature lists + seat counts · "Request upgrade" primary (`OPEN` — whether upgrade is self-serve checkout or an operator-approved request; today it's a request → admin approves, §8.12). Seat add-on row.
**MOBILE.** Plan cards stack; picker as a sheet; one primary CTA.

**COMPONENTS.** current-plan card · plan cards (name · what you get · seats · price-or-"free during pilot") · seat stepper · "Request upgrade" CTA · pilot badge.

**STATES.** **pilot-free** (default — "You're on the founding pilot. It's free while we build with you.") · comparing plans · upgrade-requested ("Request sent — we'll set this up with you.") · seats-add-requested · (post-Gate, `OPEN`) paid/active · payment-needed.

**INTERACTIONS.** Pick plan → highlight + feature diff. "Request upgrade" → logs request → admin cockpit (§8.12) → toast. Seat stepper adjusts requested seats.

**MICROCOPY (EN / HE).** pilot "You're on the **founding pilot** — free while we build with you." / "אתה בפיילוט המייסדים — חינם בזמן שאנחנו בונים יחד." · CTA "Request upgrade" / "בקשת שדרוג" · requested "Request sent — we'll set this up with you." / "הבקשה נשלחה — נסדר את זה יחד." · note "No card needed during the pilot." / "אין צורך בכרטיס אשראי בזמן הפיילוט."

**FIREWALL / honesty.** Do **not** price or assume the deep-scan cost (target architecture, unmeasured — CLAUDE.md). Intent (a request) is **never** shown as revenue (§8.12). Free-pilot is the honest default. **DoD.** Pilot-free default; plan picker with plain features + seats; upgrade = request → admin (or `OPEN` checkout); "no card during pilot"; light theme; no cost claims about unbuilt scan.

---

### 17.B.8 · Consent / cookie banner

**PURPOSE.** Honest, minimal consent — the app's firewall/honesty ethos extends to privacy. Not a dark-pattern wall.

**DESKTOP.** A slim bottom bar (not a full-screen blocker) on paper: one line + "Accept" (primary) + "Only essentials" (equal-weight secondary) + "Manage" link. 
**MOBILE.** A bottom-sheet with the same three choices; **"Accept" and "Only essentials" are visually equal** (no tricked hierarchy).

**COMPONENTS.** message line · Accept · Only-essentials · Manage (opens a small preferences sheet with toggles: essential [locked on], analytics, marketing).

**STATES.** shown (first visit) · manage-open (toggles) · saved (bar dismisses, `fade`) · already-consented (never shown again).

**INTERACTIONS.** Accept / Only-essentials both dismiss + persist. Manage → toggle sheet → Save. Choice persists; re-openable from Account.

**MICROCOPY (EN / HE).** "We use only what's needed to run LOCK, plus optional analytics to improve it. You choose." / "אנחנו משתמשים רק במה שנדרש להפעלת LOCK, ובנוסף אנליטיקה אופציונלית לשיפור. אתה בוחר." · "Accept" / "אישור" · "Only essentials" / "רק החיוני" · "Manage" / "ניהול".

**FIREWALL.** Honest, symmetric choices (no dark patterns). Analytics here are the product-funnel events (§8.12) — never a grade of the user. **DoD.** Non-blocking bar/sheet; equal-weight accept/essentials; manage toggles with essentials locked; persists; re-openable; light theme.

---

### 17.B.9 · Notifications inbox (incl. the availability-request reaction)

**PURPOSE.** One place for what's happened — the most important item being the **availability-request reaction** (the Gate signal) and confirmations. Method-safe throughout.

**DESKTOP.** Bell in the top chrome → a dropdown panel (recent) + a full `/notifications` page. Light. List of notification rows grouped by day: icon · human line · timestamp · optional inline action.
**MOBILE.** Bell → full-screen list; or a bottom-sheet for the recent few. Pull-to-refresh.

**COMPONENTS.** notification row (icon · text · time · unread dot) · inline action (e.g. "Reply" on a request) · mark-all-read · empty state · day groupings.

**STATES.** unread (lime dot, subtly raised) · read (muted) · **availability-request** ("A buyer asked about your date — {event}, {date}." → "Reply" → Requests, 17.A.4) · **confirmation** ("{Name} confirmed a statement on your Passport." — method-safe, **no count/score**) · **published/reaction** (method-safe text only) · empty ("Nothing yet — this is where buyer interest and confirmations land."). loading (skeleton) · offline.

**INTERACTIONS.** Open row → routes to the source screen. Inline "Reply" → Requests. Mark-all-read. New arrival while open → row slides in `slidein .28s` + unread pulse (`foundpulse`), reduced-motion → appears at rest.

**MICROCOPY (EN / HE).** availability "A buyer asked about your date — {event}, {date}." / "מזמין שאל לגבי התאריך שלך — {event}, {date}." · action "Reply" / "מענה" · confirmation "{Name} confirmed a statement on your Passport." / "{Name} אישר הצהרה בפספורט שלך." · empty "Nothing yet — buyer interest and confirmations land here." / "עדיין אין כלום — כאן ינחתו התעניינות של מזמינים ואישורים." · mark-all "Mark all read" / "סמן הכל כנקרא".

**FIREWALL (critical).** The reaction insight returning to the artist is **method-safe text only — never a count, %, or score** (CLAUDE.md — the most fragile spot). "A buyer asked about your date," never "3 buyers viewed / 80% interest." No leaderboard of who reacted. **DoD.** Grouped inbox; unread/read; availability-request row with inline reply; confirmation rows method-safe; empty/loading/offline; new-arrival motion (reduced-motion safe); **zero count/score in any reaction line.**

---

### 17.B.10 · 404 / global error / offline

**PURPOSE.** Keep a lost or broken moment warm, honest, and recoverable — one clear way back. Never a technical stack trace on screen (U8).

**DESKTOP / MOBILE.** Centered light card: a calm mark, a short human line, one primary CTA ("Back to home" / retry), one quiet secondary. Same layout for all three; copy differs.

**COMPONENTS.** illustration/mark (brand, subtle) · headline · one-line explanation · primary CTA · secondary link.

**STATES.**
- **404** — "This page moved or never existed." · primary "Back to my home" · secondary "Go to my Passport".
- **Global error (500 / crash boundary)** — "Something broke on our side — not your fault." · primary "Try again" (re-mount) · secondary "Back to home". No stack trace, no error code on screen (log it silently).
- **Offline** — a slim top banner (not a takeover): "You're offline — we'll reconnect automatically." Actions that need the network disable with a tooltip; queued where safe. On reconnect, banner turns "Back online" and fades.

**INTERACTIONS.** Retry re-attempts the failed route/action. Offline banner auto-updates on `online`/`offline` events; disabled CTAs show "Reconnecting…" not a dead click.

**MICROCOPY (EN / HE).** 404 "This page moved or never existed." / "הדף הזה עבר או לא היה קיים." · error "Something broke on our side — not your fault." / "משהו נשבר אצלנו — לא באשמתך." · offline "You're offline — we'll reconnect automatically." / "אתה במצב לא מקוון — נתחבר מחדש אוטומטית." · back "Back to my home" / "חזרה לדף הבית".

**FIREWALL.** Neutral; no technical content on screen (U8). **DoD.** Warm 404/500/offline; one primary recovery CTA each; offline as a non-blocking banner with auto-reconnect + disabled-not-dead actions; no stack trace/error code on screen; light theme.

---

### 17.B.11 · Loading / skeleton states pattern (the app-wide rule)

**PURPOSE.** One consistent loading language so nothing ever looks frozen or blank. This is a **pattern**, applied on every screen, not a screen.

**THE PATTERN.**
- **Skeletons, not spinners, for content.** A loading list/card renders its shape as `--surface2→--raise` gradient blocks with `shimmer 1.4s linear infinite` (proto :626), matching the real layout's boxes (proto :2003 shows the evidence-capture skeleton). Reduced-motion → static `--surface2` blocks, **no shimmer**.
- **Spinners only for a single in-flight action** (a button mid-submit): the button label → a small spinner, button stays sized (no layout shift).
- **Optimistic where safe.** Confirms, toggles, and saves apply immediately and reconcile — the UI never waits on the round-trip for a reversible action (undo covers the rare failure).
- **The honest-AI loading line.** Anywhere the extraction runs, show the honest state, never a fake progress bar: "AI is labeling your evidence" + "Every claim waits for your confirmation." (proto :2000–2001). A pulse dot (`.pulsedot`), not a percentage.
- **Timing:** if a load resolves under ~200ms, **don't** show a skeleton (avoids a flash); show it only past ~200ms. Keep skeletons for max ~10s, then fall to an error/retry state (17.B.10).

**MOTION table.**
| Element | Animation | Reduced-motion |
|---|---|---|
| Skeleton block | `shimmer 1.4s linear ∞` | static block |
| In-flight button | inline spinner | static "Saving…" text |
| AI-labeling line | `.pulsedot` breath | static dot |
| Content arrival | `fade .18s` / `slidein .28s` | fade only |

**MICROCOPY (EN / HE).** AI "AI is labeling your evidence." / "ה-AI מסמן את הראיות שלך." · sub "Every claim waits for your confirmation." / "כל טענה ממתינה לאישור שלך." · generic "Loading…" / "טוען…".

**FIREWALL.** No fake progress bar that implies a measured %; the AI line is honest and method-safe. **DoD.** Skeleton (shape-matched, shimmer, reduced-motion static) for content; spinner only for single actions; optimistic reversible actions; honest AI line (no % bar); ≥200ms threshold before showing; ~10s → error fallback.

---

### 17.C · Cross-cutting acceptance (applies to every screen above)

1. **One primary lime CTA on screen at any instant** — enforced structurally (Radar's `holdsCTA`; utility screens have a single primary).
2. **Immediate feedback (<100ms) on every interactive element** — press-scale, focus border, or optimistic apply. No dead clicks.
3. **`prefers-reduced-motion` has a defined equivalent for every animation** — ambient loops off, interaction transforms collapse to opacity, feedback fades kept (17.0.3).
4. **Firewall by design, never narrated** — no score/rank/%/gauge/headcount/leaderboard component exists; reaction-to-artist is method-safe text only; no firewall strip.
5. **Light theme for all utility screens; dark only for Radar/Passport atmosphere.**
6. **Human language only** — no internal terms on screen (org/role/entitlement/enum).
7. **Mobile = bottom-sheets + gestures, never a new page per tap; 44px targets; no horizontal scroll at 390.**
8. **Motion tokens reused, not re-invented** — the five easings + the duration ladder are the only vocabulary.

---

### 17.D · Provenance & open items (what I could / couldn't derive)

**Derived from the prototype (ground-truth, path:line cited above):** every easing, duration, keyframe, and the swipe threshold in PART A. The five-token easing system, the duration ladder, and the reduced-motion three-tier contract are generalisations of the prototype's repeated inline values — faithful, but promoted to named tokens (flagged `OWED` for Codex to confirm as DS v1.6.25 named motion tokens).

**Could NOT be derived — carried as `OWED` (need DS v1.6.25 from Drive):** exact light-card border/elevation/radius scale, CTA primary/secondary/ghost paddings, the 44px rule's exact hit-area values, named motion tokens, and the master logo SVG. The prototype is dark-themed and the utility screens (PART B) are new — their exact light-token values are not in the repo (only the A13 core hexes are).

**Could NOT be derived — carried as `OPEN` (product/owner decisions):** (a) gold/amber retire-vs-keep (§7.0 — affects only the found-state pulse color, not the motion); (b) Account as a full screen vs folded into the hub (U26); (c) Billing upgrade = self-serve checkout vs operator-approved request (today it's a request); (d) post-Gate paid billing states (no price/ICP locked pre-Gate — CLAUDE.md STAGE); (e) the sheet **drag-follow** (finger-tracking) refinement — the prototype animates open/closed but does not 1:1 track the finger; spec'd as a target in 17.A.2.g; (f) long-press-logo → method (prototype uses tap→method; long-press is the ENTITY-STRUCTURE audit PART 10 target).

**Not built, spec'd honestly (per CLAUDE.md honesty firewall):** the deep multi-source discovery scan animation in Onboarding (17.A.1) shows the intended experience (vision) with honest method-labels ("a wider auto-scan is in development"); event/lineup **creation** in Production (17.A.9) is target, view-only today.

---

## 18. Open Decisions (owner rulings still pending)

Marked so they are never mistaken for settled. **OPEN** = an owner ruling; **OWED** = a deliverable another party must supply.

### 18.0 Priority tiers (execution focus)
The full lists below, grouped by when they must be resolved so effort stays on the Gate:

- **① PRE-GATE MUST-HAVES** (block a real buyer reaching a real Passport, or block trust): legal package L-1…L-9 + Terms/Privacy/Accessibility publish · the Gate availability→artist **email** (N2/N3) · **D1** Act-editor (done ✅) + **S6** Passport multi-view + **D2/D3** effective-role/producer-shell · consent-scope bug (done ✅) · app security headers (done ✅) · **B-1** beachhead entity/ICP ruling · pilot **price** (needed only at the pay-moment of the Gate).
- **② POST-GATE** (turn on once the Gate is proven): self-serve billing + receipts/invoices/tax (§14.5, §19.3) · plan-enforcement flip + monetization numbers (G-2) · GA4 dual-emit + growth-loop instrumentation (§16.B.13, G-3; is_demo ✅ done 17–18 Jul) · target deep-scan + intelligence-at-scale controls (§9.7) · Hebrew launch (~141-key pass + site prose).
- **③ NICE-TO-HAVE / RESERVED** (do not build pre-Gate — see §19): international-expansion framework · agency-group hierarchy (E5) · white-label/partner themes · sharding/replicas/DR · high-volume Radar mode · competitive-moat doc · full LTV/CAC model.

_Everything in the tables below carries its own tier implicitly via this grouping; when in doubt, ask "does this block the Gate?" — if no, it is ② or ③._


| # | Item | Type | Notes |
|---|---|---|---|
| B-1 | **Canonical entity ruling** — 3 workspaces; role + authority layers; Manager ≠ Booking-Agent; which buyer types serve Gate 1 | OPEN (owner) | awaits approval; the demand-side segmentation (§3.5) is the working model. |
| — | **Pilot price** | OPEN (owner) | recommendation ₪179; no price/ICP locked until the Gate. |
| — | **Hebrew "Act" ratification** | OPEN (owner taste) | de-facto live term = **אקט** (proceeds); formal ratification vs מופע/פרויקט pending; never invent a third term. |
| — | **`state.found` gold / `state.needsReview` amber ruling** | OPEN (owner/Codex) | keep gold+amber as small accents (A13) or retire to lime+neutral; prototype interim = neutral mist. Affects §5.4. |
| — | **Theme ground** | RESOLVED → build | DS v1.6.23/25 "dark is atmosphere, not camouflage" resolves it: everyday UI = light/paper, dark only for Radar/Passport. Re-ground remaining dark surfaces. |
| — | **Canonical origin app (app.lock.show)** | OPEN | the real app is still the old dark build; the approved prototype must be ported to `src/` as the canonical app. |
| — | **Codex v1.6.25 owed values** | OWED (Codex) | the seven items in §5.9: type-scale px+weights · light-card token values + Radar-universe boundary · CTA hierarchy + 44px paddings · logo master SVG · real venue logos (Barby/The Block/Sunset) · gold/amber ruling · full dark-app semantic scale + shadows + chrome tints. |
| — | **Firewall strip removal (U33)** | ✅ DONE in app (15 Jul) | the narrated strip was removed from `PassportFooter` (`passportKit.jsx`); the dead `passport.disclaimer` i18n key was deleted 16 Jul. The **prototype HTML** still carries the leftover `.fwstrip` — cosmetic, prototype-only, not the shipped app. |
| — | **Discovery Engine go-live** | OPEN (gated) | counsel sign-off + real Anthropic key + operator hand-QA before the target scan is user-facing; do not market as built. |
| — | **Buyer register segmentation UI (D9)** | build task (P2) | private/corporate/planner warm-copy paths. |
| — | **Production event/lineup creation** | build task | currently view-only; add create-event / open-slot / confirm-slot. |
| — | **Retire Source-Confirmer workspace shell (D3)** + fix create dead-end (D2) | build task (P0) | confirmer lives only at `/confirm/:token`; recompute effective role so a base-role producer/booker isn't dead-ended. |

### 18.1 New owner-level rulings surfaced by §§13–17

Assembling the deep build spec surfaced additional decisions that only the owner (some with counsel) can settle. The technical **OWED** items live in each section's own register — §13.8 (engineering), §14.7 (measurement/payments), §15.1 (legal placeholders L-1…L-9) + §15.4 (Hebrew ratification H-1…H-7), §16.C (taxonomy/business), §17.D (motion/utility OWED+OPEN). The owner-decision subset is consolidated here:

| # | Item | Type | Notes / where |
|---|---|---|---|
| L-1…L-9 | **Legal placeholders** — controller legal name · business ח.פ. number · postal address · jurisdiction city · refund policy · accessibility-coordinator name/phone/date · DPO/EU-representative question · concrete retention periods · Terms-HE "Mirror" re-alignment | OPEN (owner + counsel) | blocks Terms/Privacy/Accessibility publication. Full table in §15.1. |
| — | **Consent Mode v2 scope** | RESOLVED → build | ruling recorded: **basic, default = denied** before any analytics fires (§15.2). Listed here so the ruling is visible, not re-opened. |
| T-1 | **Genre-family HE labels** — comedian-host & corporate-ceremony (MC/עורך אירוע) are now in the taxonomy (§16.A.1/§16.A.2, reachable from `act.format`); their **Hebrew labels are proposed, pending owner ratification** | OPEN (owner taxonomy) | families are first-class in the spec; ratify HE wording + authorize the CHECK-widening migration (≥038, §16.A.6.a). |
| — | **027/028 applied-state confirmation** | OPEN (owner confirm) | VERSIONS records head 035 but no explicit "027/028 applied ✓"; 030/031 imply they are live. One-line confirmation requested (§13.2). |
| B-2 | **Billing model** — self-serve checkout vs operator-approved upgrade request | OPEN (owner) | today it is an operator-approved request; no price/ICP locked pre-Gate (§17.B.7). |
| G-1 | **Beachhead ICP + GTM** — which buyer segment leads Gate 1; channel priority; launch scope (one scene vs many) | OPEN (owner) | frameworks in §16.B.11; ties to B-1. |
| G-2 | **Monetization numbers** — all prices, Momentum/Roster feature boundaries, monthly vs annual, trial length, when to flip enforcement | OPEN (owner) | ladder structure fixed in §16.B.12; numbers deferred to Gate evidence. |
| G-3 | **Growth-loop to instrument first** (rec: Loop 1, artist-led) | OPEN (owner) | loops in §16.B.13; measurement OWED (ties to GA4 dual-emit §14). |
| G-4 | **Trust & safety rulings** — dispute/takedown flow, identity-verification bar, IP/content-rights ToS clauses (counsel) | OPEN (owner + counsel) | §16.B.15; IP clauses currently absent from legal drafts. |

### 18.2 Radar-universe / taxonomy pass records (17 Jul — owner R00 order)

| # | Item | Type | Notes / where |
|---|---|---|---|
| — | **Taxonomy Sheet content** — the full Registry B fill + full scene/subtype lists (6 families · 55 subtypes · 32 DJ specializations · 42 instruments · 121 legacy labels) live only in the Google Sheet | **OWED (owner R00)** | The **structure may proceed without it** — §16.A.5b schema + §16.A.6.a migration structure are specified; content lands later as data inserts, never schema changes. |
| — | **HE labels across all §16.A tables + Registry B `why_a_buyer_cares` HE values** | OPEN (owner) | Every HE label in §16.A (incl. `whatsapp-group` = קבוצת וואטסאפ) is a **proposed seed only — R00 owns Hebrew**; nothing is canon until she signs it. |
| R-10 | **Does "asset value" language require a method label?** — when the Radar/coaching layer describes something the artist owns as an asset (e.g. the WhatsApp group as "a private room the artist owns and can activate") | OPEN (owner) — **R16 reads YES** | Working read until ruled: any asset-value statement surfaces as a **band + method label** per §5.10 (warm wording over bounded, provenance-labeled truth — e.g. band via `bandFromCount` + `Self-declared`), never an unlabeled asset claim. If the ruling lands NO, only the label placement changes — never toward a number. |
| R-11 | **Artist-private completion % — allow or keep rejected?** (owner 18 Jul: "the % restriction is too sweeping — it castrates displays; it can be a matter of terminology") | OPEN (owner) | The count-based progress vocabulary (§5.10) ships regardless — same expressiveness, no ruling needed. R-11 decides ONLY: may the artist's own private checklist ALSO render as a % ("80% of applicable items confirmed")? If YES: artist-private only · self-progress only (N/A excluded) · never per-planet quality · never buyer-facing · never comparative — and §2.9, the Codex DS forbidden list, and the §20 inspector are amended in lockstep. Buyer-facing person-numbers/comparisons stay ABSOLUTE either way (§2.1 untouched). |
| M-17 | **Universe/registry rulings** — (a) ONE Registry-B schema (rec in §16.A.5b); (b) ONE certainty ladder (Claims-Schema 4-door for claim certainty vs the 10-value extraction-provenance set — rec: both, as two different fields); (c) the Sheet's 4 open R00 decisions (family build order · is F6 in scope pre-Gate · does "secondary family" exist · promote radar_segments to a governed tab) | OPEN (owner) | Unlocks the field-grain fill, the ≥038 taxonomy migration (§16.A.6.a) and registry-driven Radar (§8.2 TARGET). Full analysis: `docs/UNIVERSE-GAP-REPORT.md` §5–6. |
| — | **Education/training absent from the entire universe model** (Sheet + F1.csv both lack it; only DF12 Workshop/Clinic exists as a delivery format) | OPEN (owner taxonomy) | Decide whether artist education/training joins the taxonomy (likely Identity or Creative Quality segment) — flagged by T-53; do not invent placement. |

**Two engineering bugs found while grounding (build-fix, NOT owner decisions — flagged for the board):**
1. ✅ **FIXED (15 Jul, wave-1) — rationale corrected 16 Jul:** `ConsentLegal.jsx` `recordPrivacyConsent` wrote the pre-021 legacy scope names. The live DB has **no scope CHECK** (021 FROZEN, §13.2.1), so those writes were **not** actually rejected — but the code now writes the canon `privacy-processing` (write + read paths) as the **forward-compatible** choice for when the canon-scope constraint lands (§15.2.3, §13.2).
2. The marketing site (`website-next/app/layout.tsx`) loads **Manrope into a CSS variable misleadingly named `--font-heebo`** — there is no actual Hebrew webfont in the site stack, so Hebrew falls back to the OS font. The app stack (Frank Ruhl Libre + Heebo) is Hebrew-capable; the site must adopt a real Hebrew stack and the DS must state it (§15.3). **STILL OPEN.**

---

## 19. Scaling & Future-Readiness (RESERVED — post-Gate; do NOT build pre-Gate)

_Added 16 Jul from an external scaling review. **STAGE discipline (CLAUDE.md):** LOCK is pre-validation — the correct move is to **reserve** these so they are acknowledged and named, **without gold-plating them before the Gate proves the business.** Nothing here is a pre-Gate build; each is a stub with the trigger that should unlock it. Every number stays OPEN._

### 19.1 International expansion framework (trigger: Gate proven in Israel)
Israel is the beachhead; the model must not hard-code it. Reserved dimensions: **language** (locale-aware discovery already a directive, §9.2 — extend the string system beyond HE/EN), **sources** (per-market platform/venue taxonomies, §16.A), **currency + tax** (per-country billing entities), **legal** (per-jurisdiction privacy regimes beyond Amendment-13/GDPR), and **method-label locale** (labels must read natively). Cross-ref §1.3 (post-Gate international readiness), §16.B.16 Phase 4. **OPEN:** which market is second.

#### 19.1.a Localization readiness matrix (reserved — add a language only when a beachhead ICP justifies the legal/content work)
Discipline: **technical cost is low (strings + discovery queries); the real cost is content + legal per jurisdiction.** Cap at ~4–5 active languages through v1–v2. Order below is a *recommendation grounded in electronic/club/festival infrastructure* — not a commitment; each market needs its own Gate.

| Language | Phase (post-IL-Gate) | Why (scene infra) | Key sources to add | Legal trigger | Priority |
|---|---|---|---|---|---|
| **Hebrew** | live | home market | RA, local venues, IL streaming | Amendment-13 (done) | ✅ core |
| **English** | live | international default | RA, global platforms | GDPR (site) | ✅ core |
| **Russian** | live-ish | large IL immigrant + pro buyer segment | — (shares IL sources) | covered by IL | ✅ present |
| **German** | Phase 2 | Berlin/EU electronic capital | RA-DE, local venue registries | GDPR (DE specifics) | high |
| **French** | Phase 2 | Paris/Lyon scene, festivals | RA-FR, local platforms | GDPR (FR) | high |
| **Spanish** | Phase 3 | Spain + LatAm (Ibiza pull), high volume | per-country platforms; ES ≠ LatAm | GDPR (ES) + LatAm regimes | medium-high |
| **Dutch** | Phase 3 | Amsterdam/ADE — small but elite | RA-NL | GDPR (NL) | medium |
| **Portuguese** | Phase 3+ | Brazil (huge) + Lisbon; BR-PT ≠ EU-PT | per-country | LGPD (Brazil) | medium |
| **Italian** | Phase 3+ | Milan/Rome club + festival | RA-IT | GDPR (IT) | medium |

**Deliberately NOT queued:** Arabic (different market, not the electronic-club buyer today), CJK (wholly separate strategy). **Rule:** a language ships only when (a) a real beachhead ICP exists in that market, (b) local sources + venue taxonomy are seeded, and (c) the jurisdiction's privacy/legal is cleared. **OPEN (owner):** the second market and the phase order.

### 19.2 Data & ops at scale (trigger: sustained load / paid tier)
Reserved: read-replicas + query-cost monitoring; a partitioning/sharding plan **only if** table sizes demand it (unlikely pre-Gate); **backup/DR plan** (ties to the Supabase Pro decision, C-2); monitoring + alerting + on-call; and an **expanded production-readiness checklist** layered on Q8 (§13.7) — monitoring, alerting, rollback playbooks (rollback anchor = SHA is already the practice). Also: a **Technical-Debt register** (embed version-skew §13.1, service-role bypass §13.5.3, plaintext producer tokens migration 036-DRAFT) with owners — recommended as a living doc in `docs/`, not spec body.

### 19.3 Billing & finance at scale (trigger: post-Gate monetization ON)
Reserved: self-serve checkout, receipts/invoices (Green Invoice deferred), tax handling, dunning/failed-payment, churn + cohort reporting, and a **financial-model skeleton** (CAC · LTV · contribution margin · payback) with **all inputs OPEN** until Gate data exists. Today: manual Bit + reference-code activation (§14.5), correct for the pilot. Cross-ref §16.B.12.

### 19.4 High-volume product surfaces (trigger: real rosters / heavy Acts)
Reserved: a **"Roster at scale" variant** for Representation (50+ artists — filtering, saved views, bulk next-actions; current roster assumes a handful); a **high-volume Radar mode** (virtualise/aggregate beyond ~200 evidence items per §6 law 12); **admin bulk actions + reporting views** (the §8.12 cockpit expanded). All must preserve the firewall and the one-screen-one-action law at volume.

### 19.5 Ecosystem, partnerships & defensibility (trigger: post-Gate growth)
Reserved: **partnership/channel play** (festivals, ticketing platforms, management software, venues embedding Passports — needs the "Partner Theme"/white-label variant: token remap + logo injection, structurally ready via the 3-tier tokens §5.6); **competitive moat** (the firewall + method-verified evidence + the Source-Confirmer human anchor + per-Act non-transferable evidence are the defensibility thesis vs EPKs/CRMs — write the explicit moat doc when a competitor forces it). **OPEN:** partner strategy, white-label pricing.

**Patent candidates (RESERVED — NOT legal advice; evaluate with an IL/PCT IP attorney before any disclosure).** Three mechanisms multiple reviews flagged as potentially defensible utility-patent territory. Logged so the option is preserved; **do not act without counsel**, and note software-patent bars are high:
1. **Verification without composite scoring** — ingesting disparate public/private signals, assigning discrete provenance **method labels**, and rendering **bands + binaries** to a third party *while deliberately suppressing any composite score/rank*. The suppression is the novel step.
2. **Asymmetric role-based rendering of one verified record** — a single DB record renders two materially different UIs/registers (private Radar shows gaps as invitations; public Passport shows verified strengths only, gaps hidden) from the same state, gated by `artist_approved` + RLS — no data duplication.
3. **Consent-gated, revocable access delegation** — the `ArtistAccess` grant: time-bound, scope-limited, mutually revocable delegation letting a third party act for a primary entity without transferring data ownership or credentials.
**OPEN (owner):** whether to spend on provisional filings pre-Gate (recommendation: defer to post-Gate unless a competitor or investor forces the timing — patents are slow and costly, and the *brand+network* moat is the near-term defence).

### 19.6 Canon-change & release process (maintainability as the team grows)
How a spec/canon change is proposed → reviewed → merged: (1) a change is a **PR against `Hello-MNB/lock.show`** touching the spec + code together (lockstep, §0.2 rule 5); (2) the PR must pass the **`npm run verify` suite** (nav-contract · act-isolation · canon-drift · security-denial · **i18n-purity firewall lint** · registry · deltas · build) — the firewall check is mechanical, not a human judgment call; (3) a **design-critic pass** for any user-facing change (the no-Codex continuation model); (4) deploy via the **named release train** with the **SHA as rollback anchor** (`VERSIONS.md`, `DEPLOY-LOG.md`); (5) Q8 owner-walk before production (§13.7). This keeps canon changes safe and reviewable as the team scales. _(Reserved enhancement: a PR template that surfaces the firewall checklist inline.)_

### 19.7 SEO / AEO / GEO & structured data (RESERVED — post-Gate; firewall-constrained)
The public Passport is a distribution surface; search engines and AI agents should be able to read it — **within the firewall.** Reserved:
- **SEO** — programmatic landing pages (e.g. "techno DJs in Tel Aviv"), sitemap, per-Passport meta; the Passport page is the landing page.
- **OG / share preview (highest-leverage, ties §7.6)** — a **dynamic preview card** on `/passport/:id` so a WhatsApp/Telegram share unfurls richly. Card content: **name · genre · draw BAND · a method label** — **no counts, no score** (see §2.9). This is the single most valuable growth-adjacent build; OG meta is OWED.
- **AEO / GEO (AI-search)** — when a promoter asks an LLM "find a reliable techno DJ in Berlin," the answer needs structured data. Emit **JSON-LD** on public Passports built on standard `MusicGroup`/`Event` types, exposing **only firewall-safe fields**: `name`, `genre`, `drawBand` (a band string, never an exact number), `readinessBinaries` (booleans), `verificationMethod` (a method label). **Explicitly forbidden:** any `score`, `rank`, `rating`, or `bookabilityScore` field (§2.9). Done right, LOCK becomes a **method-labeled evidence source** for booking research — a genuine moat — without ever shipping a machine-readable grade.

**Firewall note:** this section is the highest-risk for firewall drift (machine-readable = easy to add a hidden number). The constraint is absolute: structured data carries bands + binaries + method labels, never a numeric grade about a person. **OPEN (owner):** whether to invest here pre- or post-scale (recommendation: OG card early — it powers Loop 1 virality; full JSON-LD post-Gate).

### 19.8 Platformization & ops maturity (RESERVED — post-Gate; several are do-NOT-build-pre-Gate)
Surfaced by a technical/AI-readiness review. Reserved so they're named, not built prematurely:
- **DR & backup runbook** (→ ops doc `docs/ops/`, not spec body) — RPO/RTO, Supabase point-in-time-recovery steps, seed-restore. **Trigger:** Supabase Pro (C-2) enabled — PITR needs it. Currently no DR runbook exists.
- **Feature-flag system** — beyond the env flags today (`PAYMENTS_ENABLED`, `OAUTH_ENABLED`): a lightweight config-table/LaunchDarkly gate for gradual rollout of the deep-scan and new Radar dimensions without risking the Gate. Reserved.
- **Public API / webhooks** — for Door-1 integrations (e.g. a ticketing platform pushing draw data): signed webhooks, API-key issuance, per-partner rate limits (§9.9). Post-Gate; pairs with the ticketing-partnership channel (§16.B.11).
- **Performance CI** — automate the §6 law-12 budget: a Lighthouse-CI / Playwright performance trace in `npm run verify` asserting the Radar interaction budget. Today the budget is a rule with **no automated test — OWED**.
- **Domain-template engine (the big one — deliberately DEFERRED).** A reviewer proposed abstracting the Radar planets, taxonomies, and method labels into per-industry **domain templates** (catering, corporate events, weddings, speakers/comedians), so "music" becomes the first installed template and an Act becomes a generic "service offering." **This is architecturally elegant and a real long-term platform play — and it is exactly the kind of pre-Gate gold-plating the STAGE rule forbids.** Abstracting the entire domain model before one buyer has reacted in *music/Israel* is premature. **Reserved as the post-Gate platform thesis; do NOT build pre-Gate.** The existing multi-Act + 3-tier-token + relational-taxonomy design keeps this *possible later* without a rewrite — which is the correct amount of readiness now. **OPEN (owner):** whether LOCK's post-Gate vision is "the music standard" or "the professional-bookability platform." (Note: the non-music genre families comedian-host/ceremony, §16.A.2, are a *small* step in this direction already — within music-adjacent live events, not a full platform pivot.)

---

## 20. Implementation notes for AI / code agents (the executable guardrails)

An AI coding agent (Claude Code / Cursor) suffers context-window dilution — it can forget the firewall while building the Radar. These are **negative constraints** (what NOT to do), designed so a slice can be built in isolation without drift. They restate, in checklist form, rules already binding elsewhere (`CLAUDE.md`, §0.2, §2, §13). If a request violates one, **refuse and explain** rather than comply.

**A · The firewall (never violate).**
- NEVER create a DB column, API response field, or UI element holding a **score / rank / percentage / rating / exact headcount / prediction** about a person. Draw = **bands** only; readiness = **binaries** only (§2, §2.9).
- NEVER surface a reaction to the artist as a **count/number** — method-safe **text** only (§2.5).
- NEVER emit a numeric grade in **structured data / JSON-LD** either (§19.7). A number about a *person* is banned on every surface — public, internal-shown, or machine-readable. Numbers about *product events* (operator funnel) are fine.
- NEVER use the retired word **"Mirror" / "המראה"** — use "Radar" / "האזור הפרטי" (§4).

**B · Database & migrations (never violate).**
- NEVER `DROP TABLE` / `DROP COLUMN` in a migration; migrations are additive and **diff-first** (check 001–036 before authoring 037+). Use `IF [NOT] EXISTS`.
- NEVER alter the `analytics_event` CHECK without updating `src/lib/analytics.js` **in the same PR** (canon-drift test enforces this).
- NEVER expose `internal_confidence` or any exact-count column to the **`anon`** role (§13.5; column grants + `buildSafePayload`).
- Frozen enums stay frozen: `workspace_type='producer'`, roles `booker`/`agency`/`producer`; renames are governed migrations, never casual edits (§0.2 rule 5). Migration **021 is FROZEN**.

**C · Architecture & state.**
- The Radar is a **client-side derivation** of DB state — NEVER persist Radar states in the DB.
- Evidence is scoped by **`act_id`** — NEVER join claims across Acts without explicit isolation (act-isolation test).
- The **`service_role`** key bypasses RLS — NEVER write a server read without re-stating the `buildSafePayload` filters (§13.5.2).
- Auth session persistence + the SPA deep-link rewrite are already solved (§13.4.4 + `vercel.json`) — a "refresh resets the app" symptom is a **deployment/config** matter, not new code.

**D · Localization.**
- NEVER hardcode HE/EN strings in JSX — always `T.section.key` (`src/lib/i18n/`); i18n-purity lint blocks mixed-language values.
- Method-label chips render in **English even inside Hebrew UI** (by design, §15.4).

**E · How to drive the agent (atomic spec slices, not "build the app").**
- Good: *"Read §13.2 + §16.A.6.a. Write migration 038 creating the `genre_scene` reference table with a down-migration. Do not touch the frontend."*
- Good: *"Read §8.3 + §17.A.2. Build the Planet Inspector bottom-sheet with the confirm-bloom motion. Do not wire the DB yet."*
- Good: *"Read §5.10. Add the humanized draw-band renderer: input a stored band, output the venue-context line + kept band + method chip. Pure function + unit test; no ranked ladder."*
- Good: *"Read §17.A.2.e only. Implement the `bloom .42s` confirm animation on an existing node; reduced-motion → instant opacity. No other changes."*
- Bad: *"Build the Radar."* (too broad → drift).
- Every slice ends with `npm run verify` green (nav · isolation · canon · security · i18n-purity · registry · deltas · build) — the mechanical firewall gate (§19.6).

_This appendix is the spec-side mirror of `CLAUDE.md`; if the two ever diverge, `CLAUDE.md` wins (it is the binding repo instruction)._

---

## 21. The Signal Engine (pre-booking intelligence layer)

Multiple reviews converged on one frame: LOCK is not a *page* system, it is a *signal* system — every action is a measurable signal that either unlocks a workflow, triggers a method-safe insight, or feeds a growth loop, and Gate 1 is the first validated milestone, not the ceiling. This section formalises that layer.

> **THE LOAD-BEARING FIREWALL RULE FOR THIS ENTIRE SECTION.** A "signal" is **internal, event-derived data.** It MAY (a) drive a **method-safe user action/prompt**, or (b) feed an **operator-internal metric**. It may **NEVER** be rendered as a score / rank / percentage / count **about a person** on **any** surface — public, artist-facing, or "internal-shown-to-a-user." "Confidence" and "readiness" are **DB-only** pipeline values (`internal_confidence`, §13.5) that never reach a screen. The signal engine makes the product smarter; it never makes it a scoreboard. Every row below inherits this rule.

### 21.1 Signal taxonomy (8 families, derived from the 29-event canon §14.1)
| Family | Captures | Example source events | Firewall note |
|---|---|---|---|
| **Identity** | who the Act is, profile completeness | `onboarding_completed`, `evidence_added` | drives the artist's own gaps (invitations), never a completeness % |
| **Intent** | active building / distribution intent | `evidence_added`, `share_link_created` | triggers scan + upsell prompts (capability, not score) |
| **Trust** | provenance strength gained | `claim_confirmed`, `producer_confirmation_received` | raises the **method label**, never a numeric trust score |
| **Readiness** | booking-ops binaries | invoice/rider binaries | shown as binaries/"Turnkey", never a readiness % |
| **Relationship** | consented grants & delegation | `invite_member`, ArtistAccess grants (027) | powers Roster; never a network-influence number |
| **Conversion (the Gate)** | real demand + payment | `availability_request_created`, `entitlement_activated` | the Gate; the reaction returns to the artist as **method-safe text only** (§2.5) |
| **Retention** | freshness / re-engagement | staleness (`expires_at`), re-login | drives re-sync invitations about the artist's **own** data |
| **Growth** | viral distribution | `share_link_created` → `share_link_opened` → `signup_completed` | operator K-factor metric; never surfaced per-person |

**Measurement status per family (audit T-55 · 18 Jul 2026 — honest BUILT-vs-TARGET per §2.8; updated in place, no side document):**
| Family | Status today |
|---|---|
| Identity | **FIRING** — `signup_completed` (now with first-touch attribution) · `login` · `onboarding_completed` · `evidence_added` persist live. Edges still unwired: `signup_started`, `oauth_login`, `onboarding_started`, `consent_granted/withdrawn` (canon names, no call site). |
| Intent | **FIRING** — `evidence_added`, `share_link_created`. |
| Trust | **FIRING** — `claim_confirmed` (client + server on producer-yes), `producer_confirmation_sent`. ⚠️ `producer_confirmation_received` never fires — the server writes `claim_confirmed` on that path instead (vocabulary mismatch, recorded; reconcile at the next canon migration). |
| Readiness | Measured from data fields (binaries), not events — by design; nothing to fire. |
| Relationship | **NOT-WIRED** — no analytics event exists for ArtistAccess grants; `invite_member` (named in the table above) is not in the 29-event canon. Wiring requires a canon-widening migration — owner-gated. |
| Conversion (Gate) | **FIRING** — `passport_view` (now with the first-party `return_visit` marker) · `professional_reaction_submitted` (server-authored, deduped) · `availability_request_created` · `entitlement_activated` (operator control, live-capable). `payment_reference_created` is **WIRED-BUT-DORMANT**: fully functional behind `VITE_PAYMENTS_ENABLED`, which stays OFF by owner ruling (18 Jul) until the pricing decision (M-8) — it fires the moment the flag flips, no further build needed. `availability_request_responded` — unwired. |
| Retention | **FIRING (wired 18 Jul, T-55 — was the owner's named gap)** — restored sessions now emit `login {via:'session-restore', returning:true}` once per tab-session via a first-party seen-marker; manual logins carry `via:'password', returning`; `passport_view` carries `return_visit` for repeat buyer opens. Operator read: §8.12 retention tiles. Staleness re-sync (`expires_at`-driven prompts) remains data-driven, not yet an event. |
| Growth | **FIRING + now linkable** — `share_link_created` → `share_link_opened` → `signup_completed`: signup now carries first-touch attribution (utm_* · referrer · landing path · `shared` marker), so the share→signup join is computable first-party. K-factor read model itself still TARGET. |

**Site + bridge status (same audit):** site GA4 = consent-gated page views only, zero custom events; the site→app bridge is **FIRING** (first-touch utm/referrer/landing captured once per browser at app open, attached to `signup_completed`). **GA4 is scoped OUT of evidence surfaces** (owner ruling 18 Jul): it never loads while the viewer is on `/passport/*`, `/confirm/*`, or evidence routes — app and site banners both guard (§14.1.4).

### 21.2 Signal → action decision system (signal · threshold · action · downstream)
The rule that keeps this firewall-safe: an action derived from a signal is **either** an operator-internal metric **or** a method-safe user prompt — never a number about a person shown to a person.
| Signal | Threshold | Action (method-safe) | Downstream |
|---|---|---|---|
| Buyer attention (`passport_view`) | any | **operator dashboard only** — NOT told to the artist as a count (§2.9 rejection) | outreach prioritisation (operator) |
| Evidence stale (`expires_at` passed) | 1 item | re-sync **invitation** about the artist's own data (§16.B.11) | keeps Passport fresh |
| Gate reaction (`availability_request_created`) | 1 | **Gate email to the artist** (§14.6.5) + operator flag | the Gate; concierge follow-up |
| Upsell intent (2nd Act / auto-scan / seats) | 1 | contextual upsell prompt (capability) (§16.B.12.c) | conversion |
| Low claim-confirm rate (internal) | operator threshold | improve the extraction prompt | AI quality (operator) |

### 21.3 Next-best-action (NBA) engine
**BUILT (partial):** one primary next action per screen, computed from signal state — `pickNextAction` (Artist, §8.2), `rosterNextAction` (Rep, §8.10). Always **method-safe** ("Review your live draw", "Reply to a request"), never "your score is low." **TARGET:** AI-suggested NBA + personalised follow-up prompts — firewall-bound (a suggestion references a capability or a step, never a person-number).

### 21.4 Per-persona signal journeys (captured → appears → who sees → what changes → next action)
| Persona | Captured | Appears | Who sees | Changes | Next action |
|---|---|---|---|---|---|
| **Artist** | pastes/【confirms evidence | Radar node (found→confirmed) | artist only (private) | method label + gaps | "Review / confirm" |
| **Buyer** | opens Passport, sends request | receipt + (to artist) method-safe text | buyer; artist gets text-only | Gate conversion signal | "Check availability" |
| **Manager** | roster grant + request | Roster cockpit | manager (scoped) | one action per artist | roster next-best-action |
| **Confirmer** | opens magic link, confirms | `/confirm/:token` done state | confirmer (accountless) | claim → producer-confirmed | (optional) "Build a Roster" |
| **Operator** | all product events | Admin cockpit (§8.12) | operator only | Gate tiles + funnel | manual concierge follow-up |

### 21.5 The AI intelligence layer (BUILT vs TARGET — every line firewall-bound)
- **BUILT:** per-evidence claim **extraction + method labeling** (the only built intelligence — protect it).
- **TARGET (each firewall-bound):** NBA suggestions · personalised follow-up prompts · buyer-response **summarisation** (method-safe) · **staleness** detection · **gap** detection (artist-private invitations) · growth-loop recommendations (operator) · automated dispute moderation → auto-downgrade to self-declared (§16.B.15).
- **Internal-only (NEVER rendered):** `internal_confidence` and any "readiness" value — DB-only pipeline signals (§13.5, §2). The AI may **never** output a score/rank/% about a person on any surface. This is the single line that separates LOCK from every EPK-with-a-score.

### 21.6 Data-quality & provenance policy
- Every claim carries a **method label** (the 4 data doors §9.9) **+ a date**; provenance is explicit.
- `internal_confidence` is **DB-only**, never returned to any client (§13.5.5 / §2).
- **Staleness:** `expires_at` → a **"stale" binary** buyer-side (firewall-safe), a **re-sync invitation** artist-side; `buildSafePayload` strips `expires_at` and emits only the "stale" label.
- **Dispute** → auto-downgrade toward `self-declared` pending review (§16.B.15) — changes provenance, never a score.
- **No claim reaches the public Passport without `artist_approved`** (the load-bearing gate, §13.5.2).

### 21.7 Launch-readiness matrix + scale-readiness checklist
The single "does it pass in practice, not just on paper?" view. Live truth in `docs/releases/DEPLOY-GAPS.md`; this is the consolidated matrix.
**Launch-critical non-negotiables (Gate 1):**
| # | Non-negotiable | State |
|---|---|---|
| 1 | `artist_approved` firewall on every read path | ✅ BUILT (§13.5.2) |
| 2 | Demo/seed exclusion from Gate metrics (`is_demo`) | ✅ BUILT (037 applied 17 Jul + Gate-tile filter 18 Jul, §14.3.2) |
| 3 | Deep-link reload durability (no reset on refresh) | ✅ fix in `vercel.json` (§13.4.4) — rides the candidate deploy |
| 4 | Off-app Gate email to the artist | ⚠️ OWED (Resend key, §14.6.5) |
| 5 | Rollback anchor verified (SHA) | ✅ practice (§13.6); rehearse before Q8 |
| 6 | Firewall clean (0 leaks) | ✅ re-verified this document |
**Scale-readiness (before wider rollout):** durable rate-limit (Upstash, §13.5.6) · bot protection (Turnstile, §13.5.6) · session BFF/httpOnly (§13.5.5) · performance CI for the Radar budget (§19.8) · embed-sync CI gate (§13.1) · production observability/alerting (§19.2). All **OWED**, none blocks Gate 1, each blocks broad launch.

_The signal engine is what turns LOCK from a static profile tool into a compounding pre-booking **intelligence** system — while the firewall guarantees it never becomes the scoreboard it exists to replace._

---

_Firewall re-verified across this document: no score/rank/%/gauge/prediction introduced on any screen; state stays the four bounded words + four node marks + the four canon method labels; reaction-to-artist stays method-safe text; built vs target kept honest throughout._

_End of LOCK Product Specification._
