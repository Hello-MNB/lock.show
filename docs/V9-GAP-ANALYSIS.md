# v9 ↔ CANON ↔ BUILT — Gap Analysis & Build Architecture
**9 Aug 2026 · sources:** v9 bundle `docs/reference/v9/` (hash-pinned, DESIGN_REVIEW) · canon `docs/LOCK-PRODUCT-SPECIFICATION.md` · built code `src/` + `supabase/migrations/`. Produced by 3 read-only comparison teams (Artist+Confirmer · Recipient+Admin+DS · Rep+Production). Companion: `docs/DATA-LAYER-GAP-MAP.md` (object-by-object schema plan).

## 0 · HEADLINE
v9 is the strongest control plane we have received: permanent screen IDs, an Information Object Registry, an Entity Projection Matrix, 5 non-negotiable IA rules, a 46-gate QA frame, and an honest list of the engineering contracts it owes us. **It is a design package sitting on top of an app whose Artist and Confirmer surfaces are real, whose Buyer surface is real-but-differently-shaped, and whose Rep/Production surfaces are read-only shells.** v9's own Flow Register marks REP 6/6 and PRODUCTION 7/8 "built" — that is *prototype*-built, not app-built.

**Where WE are ahead of v9** (do not regress these): Confirmer ceremony (4 answers + revoke + replay + 4 dead-link reads vs v9's terminal 3-answer) · Gate-signal honesty in the operator cockpit (per-tile source tags, intent≠paid, is_demo exclusion) · DS Layers 1–2 machine-drift-checked (9 primitives + 26 components generated and verified; v9 has no equivalent) · HE/RTL shipped at ~99% key parity (v9's localization roadmap is written as if nothing is built) · the honest 032-gap card in Production.

## 1 · THE TEN CONTRADICTIONS THAT GATE EVERYTHING (owner rulings needed)
Ranked by how much they block. These are NOT gaps — both sides made an opposite decision.

| # | Subject | v9 says | We say (canon + code) | Blocks |
|---|---|---|---|---|
| **C1** | **Recipient view switching** | Forbidden in 4 docs: one link = one view = one version; "a public viewer cannot switch views"; view-switcher = anti-pattern | Canon §8.7 L1019 MANDATES the persona toggle; shipped in `passportKit.jsx:724`, `?view=` switchable | ALL recipient work (6 policies, dead-link states, share service) |
| **C2** | **Artist-side Passport surface** | 5 artist passport screens (Library · Composer · Preview · Publish Review · Share) | Canon §8.4 L906 ruled NO artist-side passport surface; `PassportSelf.jsx` is a redirect by design | The single largest artist build (4 XL screens) |
| **C3** | **Where a claim is edited** | Inspector = preview only; editing moves to a full-screen Category Workbench (route) | T-90 build law (owner-ratified): actions open INLINE, never a page where a widget fits | The Workbench P0 |
| **C4** | **Radar insight ownership** | "Artist-private ONLY" (IA rule 5) | `radar_signal` is `organization_id NOT NULL`, rep-readable, rendered at `/agency/radar` | Rep radar feed legality; RLS design |
| **C5** | **Percentages to reps** | Streaming %s shown to "artist AND mandate-holding rep" | Owner ruling 9 Aug: artist-private may show all; **every other entity = bands only** | Rep surfaces; violates a ruling already made |
| **C6** | **Draw on buyer faces** | "AT A GLANCE **numbers**", "stat pair" | Canon §8.4 L936 + code (`BandPill`, `isBand`): **bands** on every buyer face | BOOKER/PRODUCER policies |
| **C7** | **Contact card on the producer view** | "WHO TO TALK TO" card with WhatsApp + direct enquiry on an anonymous page | Canon §8.8: all buyer→artist contact routes through the gated request form; no PII on a no-login page | PRODUCER policy |
| **C8** | **Confirmer model** | Terminal, 3 answers (docs also say 4 and 5 — v9-internal inconsistency) | 4 CHECK-constrained answers + revoke re-opens + replay + `cannot_assess` collides with our `not-assessable` verification word | Confirmer refinements |
| **C9** | **"Producer" collision** | Production *seat* name | Canon: Producer = the accountless Source-Confirmer; a migration was spent separating these | Production vocabulary, HE terms |
| **C10** | **Mandate vocabulary** | `requested·granted·declined·revoked·expired` + audit log | DB `pending·active·revoked·disputed` (027), canon copy uses a third set, no audit table, no `declined` | Access/authority work |

Plus two v9-INTERNAL contradictions to send back: Production home (Registry says Growth + Today REMOVED; the Production Operating Model still makes Today the home) · radius scale (its §5 proposes 4 values, its registry declares 8 FINAL).

## 2 · PER-ENTITY STATE (compressed)
| Entity | v9 screens | Our reality | Verdict |
|---|---|---|---|
| **Artist** | 15 IDs, 4 marked BUILD P0 | Radar BUILT (T-90 10-state law) · onboarding PARTIAL (no live scan feed — needs §9.10 scanner) · claim-edit exists but 3-surface where v9 wants 1 · passport chain = 1 step (boolean publish) vs v9's 6 | Strong core, missing the whole passport-authoring chain |
| **Confirmer** | 3 IDs, REFINE | BUILT and **ahead of v9** | Only semantic work (attestation statement + מאשר-מקור rename) |
| **Recipient** | 6 policies, one renderer | 4 faces, one evidence pool, shared kit — **architecture compatible**, refactor is S (lift chapters/CTA/labels into a policy map) | Blocked on C1, not on effort |
| **Admin** | 1 screen REFINE + exception lane | Ours stronger on gate honesty; missing identity-conflict/exception lane + "what automation did" projection | Small, mostly additive |
| **Representation** | 12 IDs (2 BUILD P0) | Roster cockpit with a known double-derivation defect, zero analytics, no Artist Workspace, no Case, no Handoff | Post-Gate |
| **Production** | 12 IDs (2 BUILD P0) | Read-only shells; events derived from `gigs`; 038 unapplied AND its slot enum (3 states) already behind v9's 6 | Post-Gate, gated on 038 |

## 3 · THE DATA SPINE (what actually blocks building)
Three findings dominate:
1. **`share_link` already exists** (024: version binding, expiry, revoke states) and has **ZERO writes in the entire codebase**. The link service is half-built. Missing: `token` column + `recipient_view` + a `/p/:token` resolver route. **This single migration + route unlocks policy binding, 3 of the 6 dead-link states, and the wrong-recipient state.**
2. **Thread does not exist and is load-bearing.** `availability_requests` is a flat record with a single `message` field. Case, Advance, Handoff, and all three inboxes project from Thread in v9. Nothing above it can be built correctly first.
3. **`role_assignment.authority_scope` (jsonb) exists with zero readers** — the permission-bundle slot for v9's ruled View/Draft/Send-Act authority ladder is already in the schema.

Missing objects entirely: Thread · Case · Offer matrix · Advance items · Handoff pack · Professional Asset + version store · Receipt · Disclosure/on-request.
Partial: Passport version (snapshot only — no version_no/state/policy; publish truth lives on `artists.published`) · Mandate (vocabulary + no audit) · Confirmation (no `expires_at`, correction text still homeless) · Claim (our 3 orthogonal axes vs v9's flat enum — **and v9's model omits `artist_approved`, our publish firewall gate; a dev implementing IA literally would delete it**).

## 4 · BUILD ARCHITECTURE (design-independent first)
**Principle: build downward, not sideways.** Objects → contracts → projections → screens. Design churn cannot invalidate a correct object.

**LAYER 0 · Data spine** (safe now — shape comes from the IA, not the screens)
0.1 Thread + message + participant, with per-workspace projection policy · 0.2 Passport version store (version_no · state · recipient_view · superseded_by; move publish truth off the boolean) · 0.3 Share-link service (token + recipient_view + endless expiry + revoke) · 0.4 Professional Asset + version store · 0.5 Receipt · 0.6 Mandate reconcile (states + audit table) · 0.7 Confirmation (`expires_at` + `correction_text`).

**LAYER 1 · Contracts** (the 7 v9 owes us, all backend): version store · link service · request/thread object · back+deep-link resume · show-day activation rule · handoff receipt · notification scoping.

**LAYER 2 · Firewall as physics** — projections enforced in RLS/column grants, not in components: artist-private (everything) vs other entities (bands+binaries+method labels), extending the existing column-REVOKE precedent (016/025) to Offer matrix and Case money.

**LAYER 3 · DS Layer 3** — the 13 professional components (we have 3, partial 2, absent 8). Build the absent ones as shared components BEFORE the screens that need them: Conflict · Visibility tri-state · Freshness chip · Authority · Waiting-On · Dependency · Handoff · Live Issue.

**LAYER 4 · Screens, per persona, in Gate order** — Confirmer (smallest, both sides GREEN) → Recipient (blocked only by C1) → Artist (the passport chain, blocked by C2/C3) → post-Gate: Rep → Production. This matches v9's own release stance: ship per-persona bounded packages, never all at once.

**Pre-Gate cheap wins on code we already own** (independent of every ruling): unify the two roster health derivations · wire Rep+Production analytics (both fire zero events today) · authority explainer ("X can approve this → ask X") instead of silently degrading · expiry chooser on artist approve (column exists, UI doesn't) · extend `test:fit` to the 6 agency/production routes.

## 5 · TEST PROCESS (extends our 22-check verify)
New gates, each mapping to a v9 structure so drift is mechanical, not editorial:
1. **`test:screen-registry`** — every route declares a v9 screen ID (`data-screen-id` in DOM); every ID in the registry maps to a route or is explicitly NOT-BUILT. Kills silent scope drift.
2. **`test:projection-matrix`** — for each object × persona, assert the rendered surface contains only what the matrix permits (extends the existing two-view firewall inspector to all six personas; the artist-private exemption is explicit).
3. **`test:object-states`** — every object's stored state set == its canon state set (extends canon-drift beyond events to entity state machines).
4. **`test:link-integrity`** — one link resolves to exactly one version + one policy; all 6 dead-link states reachable and distinct.
5. **`test:authority`** — no capability is reachable without an active in-scope mandate; expired mandate stops future authority, history remains readable.
6. **Per-screen state coverage** (already live as `test:states` for widgets) extended to the v9 screen contract: every screen declares its states; a missing state fails the build.
7. **Flow contracts** — the 18 v9 flows as end-to-end assertions (extends `test:nav`'s 35 journeys).
Existing gates that stay: fit · guardrails · canon-drift · analytics contract · SEO · hero · visual regression · embed integrity · i18n purity · DS drift.

## 6 · WHAT I NEED FROM THE OWNER (decision card)
C1–C10 above, in that order — C1, C2, C3 unblock the most. Plus: the 4 open v9 decisions that touch data (D2 on-request lifecycle · D3 handoff acceptance · D4 scene dataset · D6 close-out facts) and our pending migrations (034 · 040 · 041+).

---

# 7 · TASK SPECIFICATION — foundation build (design-independent)
**Owner word 9 Aug: "the design isn't final, but we can start advancing development — spec the tasks including test processes."**
Every task below is buildable while screens keep moving. Each carries the proof of *why* design churn cannot invalidate it, a definition of done, and its own test process. Migrations are AUTHORED by us and APPLIED by the owner (standing law); nothing here deploys without her word.

## WAVE A — closes known live debts on code we already own (no migration, no ruling, no design)
| ID | Task | Why it can't be invalidated by design | DoD | Test process |
|---|---|---|---|---|
| **T-100** | **Roster health unification** — one rule replaces `artistState()` + `rosterStatus()` so one artist can never show two different states | It is a defect: two derivations of one truth. Any design renders one state | Single exported rule; both surfaces consume it; no second derivation remains in `src/features/agency/` | New `test:one-truth` assertion: grep-level — no two functions may derive roster health; render assertion — same artist, same state on both surfaces |
| **T-101** | **Rep + Production analytics wiring** — both entities fire ZERO events today; the operator cockpit is blind to half the product | Events are contracts on actions, not screens; the canon event list already exists | Every existing rep/production action fires its canon event; no new event names invented (canon-gated) | Extend `test:analytics` (A5): every interactive element in agency/production maps to a canon event or is explicitly listed as intentionally-silent |
| **T-102** | **Authority explainer** — replace silent capability degradation with "X can approve this → ask X" | v9 Registry:86 and our own §8.10 both demand it; the sentence is data-driven, not layout | Every gated action names the authority holder instead of quietly changing label | `test:authority` (see T-110); plus an i18n assertion that no gated action renders a bare disabled state |
| **T-103** | **Mandate expiry chooser** — `artist_access.expires_at` exists (027) and is never written; artists can only grant endless access | The column exists; the control is one field. Canon §3.3 already promises scoped+revocable | Artist approve writes an expiry (incl. explicit "no end date"); expired mandates stop future authority; history stays readable | `test:authority` case: expired mandate → capability denied, history still readable |
| **T-104** | **Fit-gate extension** — add `/agency ×3`, `/production ×3` to `test:fit` | Viewport laws are design-agnostic | 6 routes in the recurring sweep, all-zeros at 360/1360 | The gate itself |

## WAVE B — the data spine (migrations authored 041+, owner applies; code behind flags)
Order is dependency-driven. Each migration is additive-only, paired with a `.down.sql`, and independently useful.
| ID | Task | Objects / shape | Why design-independent | DoD | Test process |
|---|---|---|---|---|---|
| **T-105** | **Confirmation completion** (smallest, closes a live debt) | `producer_confirmations` + `expires_at`, `correction_text` | The correction box is BUILT and its text is silently dropped today; expiry is computed server-side instead of stored | Correction persists and reaches the artist's review; expiry is a state, not arithmetic | `test:object-states` (confirmation) + an end-to-end: partly-right → text stored → visible to artist |
| **T-106** | **Share-link service** — the highest-leverage single step | `share_link` + `token` (unique) + `recipient_view`; nullable expiry = endless; `/p/:token` resolver | The table already exists with zero writes. One link = one version + one policy is an IA rule, not a layout | Links are minted, resolved, revoked, expired; policy binds at mint time | `test:link-integrity`: one link → exactly one version+policy; all 6 dead-link states reachable and distinct; revoked never resolves |
| **T-107** | **Passport version store** | `passport_versions` + `version_no`, `state` (draft·preview·review·published·superseded), `recipient_view`, `superseded_by`; publish truth moves off `artists.published` | v9, canon and our own T-89 all require versioned publishing; the diff *screen* can change, the version *object* cannot | Every publish creates an immutable version; superseding is explicit; the old boolean becomes derived | `test:object-states` (passport) + assertion: no two live versions per (act, recipient_view) |
| **T-108** | **Thread object** (the spine) | `thread` + `thread_message` + `thread_participant`; `availability_requests` becomes the thread's origin event; per-workspace read projections in RLS | Case, Advance, Handoff and all three inboxes project from Thread in v9. Nothing above it is correct without it | Existing buyer request flows unchanged in behavior but backed by Thread; rep projection gated on mandate scope | `test:projection-matrix` (thread row): each persona sees exactly its permitted projection; no copies exist |
| **T-109** | **Professional Asset + version store** | `act_asset` + `act_asset_version` (current·superseded) + `event_asset_reference` | v9 flags this as its own P0 data hole; the artist owning a canonical asset is an IA rule | Assets versioned; "newer exists" derivable; production never overwrites the artist's canonical asset | `test:object-states` (asset) + an assertion that no non-owner write path exists |

## WAVE C — the machine gates (pure additive; make drift mechanical, not editorial)
| ID | Gate | What it asserts | Why now |
|---|---|---|---|
| **T-110** | `test:authority` | No capability reachable without an active in-scope mandate; expiry stops future authority; history remains readable | Guards T-102/T-103 and every future rep feature |
| **T-111** | `test:object-states` | Every object's stored state set == its canon state set (extends canon-drift from events to entity state machines) | Catches the exact class of drift found in this analysis (3 mandate vocabularies, 3 slot enums) |
| **T-112** | `test:projection-matrix` | Per object × persona, the rendered surface contains only what the Entity Projection Matrix permits — with the artist-private exemption explicit (owner ruling 9 Aug) | Turns the firewall from prose into physics across all six personas |
| **T-113** | `test:link-integrity` | One link = one version = one policy; 6 dead-link states distinct; revoked/expired never resolve | Guards T-106 |
| **T-114** | `test:screen-registry` | Every route declares a v9 screen ID; every registry ID maps to a route or is explicitly NOT-BUILT | Kills silent scope drift once the design lands; needs `data-screen-id` from Claude Design |

## SEQUENCE
Wave A (now — no gates) → T-105 → T-106 → T-107 → T-108 → T-109, each with its Wave-C gate landing alongside. T-114 waits for `data-screen-id` in the design bundle.
**Blocked and NOT in this plan:** anything gated on C1–C10 (all screen work), the 4 open v9 decisions (D2/D3/D4/D6), payments, and the Rep/Production feature set (post-Gate).
