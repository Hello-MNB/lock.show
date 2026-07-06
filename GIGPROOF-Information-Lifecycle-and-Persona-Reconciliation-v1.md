# GIGPROOF — Information Lifecycle & Persona Reconciliation
**Version:** 1.0 · **Date:** 2 Jul 2026 · **Owner:** Maria (R00) · **Architect:** Claude (R16)
**Status:** PROPOSAL — not canon until R00 approves and it is merged into the CANON doc via Cowork.
**Reads against:** CANON v1.3 · Screen-Spec-PerPersona v1.1 · App-Screen-Tree v1.1 · Localization Matrix v1.1 · Artist Taxonomy Registry v1.0
**Purpose:** (1) reconcile the uploaded "SSOT"-titled critique document against real canon — it is NOT SSOT, and this doc says exactly where it drifts. (2) Design the actual COLLECT → REFLECT → CONFIRM → RE-REFLECT information lifecycle for all three professional entities, at the field/screen level.

---

## 0. VERDICT ON THE UPLOADED CRITIQUE DOCUMENT

You flagged it correctly: the file titled "SOOT/SSOT" is not one. It is an external AI's reconstruction of GIGPROOF from partial context. This matters because it is a live instance of the exact failure mode already named in your own canon:

> **"Gemini/AI drift pattern:** Any AI working from a folder without the current CANON present will reconstruct the product from category defaults, reintroducing every hard firewall breach simultaneously."

Here is the evidence that this happened, item by item.

### 0.1 — Hard firewall violation (reject outright)

The critique's "Correct Radar architecture" proposes:

> *"Center: artist identity... Inner ring: 7 professional worlds. Outer ring: 18 intelligence segments... a radial evidence map."*

This is **structurally banned**. Localization Matrix §11 (locked, CANON v1.3):

> *"The following visual forms of 'radar' are PERMANENTLY BANNED from every surface (public and private): Radar chart (spider/web chart) · Polygon score chart · Radial scoring dial · Circular maturity meter · Any visual that plots multiple axes on a circular/polygon grid. Artist Radar communicates through linear bounded-status chips and a freshness column — never through a visual score shape."*

The critique also invents a **new 7-value color palette** (Green/Amber/Purple/Blue/Red-outline/Grey/Hidden) that is not the locked UI-STATE enum, and uses color as the primary signal — which directly violates the Component Library rule: *"Freshness Indicator... always includes date; never color-only."*

**Verdict: reject the radial map and the new color palette wholesale.** Nothing in §3–§4 of the critique's proposed architecture may be built. This is not a style note — it is the single most protected visual rule in the product, written specifically because a spider/radar chart is what every category-default AI reaches for first.

### 0.2 — Claims of "missing" personas that already exist

The critique states two "what Claude missed" findings that are **factually wrong against your own canon** — not new ideas, but evidence the author never saw `App-Screen-Tree-v1.md` or `Screen-Spec-PerPersona-v1.md`.

| Critique's claim | Reality in canon |
|---|---|
| *"Event Producer is absolutely a product persona... Claude incorrectly reduces the producer to a confirmation link."* | **Already exists**, separately from confirmation. App-Screen-Tree §2c: *"Producer / Event Producer (functional_role = producer)... `/passport/:id` — evaluates financial + audience risk."* This shares the B1/B2/B3 Passport-view components with role-scoped analytics (`actor_role_context = producer`). The confirmation task (P1, magic-link) is a **separate, narrower** surface for a different moment — a past claim getting confirmed — not the producer's full evaluation journey. Both already exist; the critique only found one of them. |
| *"Artist Manager is also a primary persona... This is not merely another Passport reader."* | **Already exists** as Persona 4 — the full Agency flow: AG1 roster, AG1b invite, AG2 requests, AG2b reaction activity, AG3 access management, AG4 per-artist detail, AG6 publication approvals, AG7 outcome capture, AG8 settings — 8+ screens, not "a Passport reader." |

**Verdict:** these are not gaps to fix. They are documentation-visibility gaps in the critique's own context window. Do not commission new persona architecture to solve a problem that doesn't exist — that would be real work spent patching a hallucinated hole.

### 0.3 — Claims that are technically true but already implemented

| Critique's claim | Reality |
|---|---|
| *"Collection cannot begin with 'What can you prove?'"* | Already sequenced this way. A4 (goal-first) → A5 (identity: who/what/where) → A6/A7 (evidence) comes **last**, not first. |
| *"The Radar is more than an evidence-status map"* | A9's Next Action Card already specifies: what → why → how → effort → evidence it creates → opportunity it unlocks. |
| *"The process should not be linear"* | Already true — A9 (Radar) and A14 (Passport preview) coexist and A16b (post-gig refresh) loops back into evidence capture, closing the loop. |

### 0.4 — The one idea in the critique that is genuinely new and worth evaluating

**Progressive reveal during onboarding** ("Instagram connected → visual identity appears… this progressive Passport preview is the emotional reward for providing information") is not currently speced anywhere in canon. It is a legitimate UX proposal, not a firewall issue *by itself* — but it is dangerous to implement carelessly, because A11's hard-block rule exists precisely to stop an under-evidenced artifact from looking public before it has earned that status. Section 3.4 below designs a firewall-safe version of it.

---

## 1. THE INFORMATION LIFECYCLE MODEL

This is the actual answer to your question: *"איך אוספים מידע ואיך משקפים מידע, מאשרים, ומשקפים שוב."* Four stages, same shape for every entity, different visibility rules per stage.

```
COLLECT  →  REFLECT  →  CONFIRM  →  RE-REFLECT  →  (loops back to COLLECT)
(raw data   (candidate,  (owner       (state updates
 enters)     not fact)    decides)     everywhere it
                                       has downstream
                                       visibility)
```

### 1.1 — Stage definitions, tied to real fields

| Stage | What happens | Who acts | Writes / reads | Existing screen(s) |
|---|---|---|---|---|
| **COLLECT** | Raw data enters through one of the 4 doors: API/OAuth · artist-provided artifact · web-discovery (opt-in) · counterparty confirmation | Artist, or system (with consent) | `evidence_artifact{...}` created, `certainty_default` = `OBSERVED` / `SELF_REPORTED` / `EXTRACTED` depending on door | A5 (social pull) · A6 (gig draw) · A7 (evidence capture) · P1 (counterparty) |
| **REFLECT** | The system shows what it found as a **candidate**, never a fact. This is the Smart Review Queue state. | Nobody yet — this is a passive display state | `claim{...}` drafted, `certainty_default` = `EXTRACTED` / `CALCULATED` / `INFERRED` / `SELF_CONFIRMED_FROM_WEB` | A8 (Claim Review — AI-extracted) · A9 (Mirror dimension cards, bounded state) |
| **CONFIRM** | The owner of the data takes an explicit action: confirm / correct / omit / dispute (artist) or yes / partial / no / wrong-person (counterparty) | Artist (A8) or Producer-confirmer (P1) | `claim.artist_approved = true`, `certainty_default` → `HUMAN_REVIEWED` or `COUNTERPARTY_CONFIRMED` | A8 review actions · A10 (publication selection + consent #2) · P1 (4-button response) |
| **RE-REFLECT** | The confirmed state propagates to every surface that has legitimate visibility into it — Mirror updates immediately, Passport updates only if `passport-ok` + artist-approved, Manager's roster view updates, freshness clock starts | System, automatically | `claim.visibility`, `passport_version.snapshot`, freshness window starts (`claim.expires_at`) | A9 (updated) · A11 (readiness) · A14 (preview) · A15 (public Passport) · AG1/AG4 (roster) |

When a claim's freshness window lapses, it re-enters as `STALE` or `CONFLICTED` — which is not a dead end, it's a **re-entry point into COLLECT** (A16b Gig Evidence Refresh, or a freshness-nudge email). This is the loop that makes the Radar "learn over time" — the one part of the critique's language that is accurate, and it is already built into A16b + the freshness enum. No new architecture needed there — just confirming the loop closes.

### 1.2 — Resolving the open certainty-chain decision

Your memory file flags an open decision: *"whether to build the full 10-value certainty enum now vs the current 4-value `verification_status`."* The Registry B `certainty_default` column (B10) already lists the full 10-value chain:

`OBSERVED · EXTRACTED · CALCULATED · INFERRED · HUMAN_REVIEWED · COUNTERPARTY_CONFIRMED · SELF_REPORTED · SELF_CONFIRMED_FROM_WEB · STALE · CONFLICTED`

**My recommendation, stated plainly:** build the full 10-value chain now, not the 4-value shortcut — because the lifecycle model above only works cleanly with it. The 4-value `verification_status` (`verified / supporting / self-reported / not-assessable`) is a **display-layer collapse** of the 10-value chain, not a replacement for it. Keep both: `certainty_default` is the machine-truth field driving the lifecycle state machine; `claim.verification_status` stays as the simplified label the 4-value enum already renders on-screen. One doesn't replace the other — the 10-value chain is the engine, the 4-value enum is the dashboard needle.

This is an architectural recommendation from me, not a canon change — it needs your sign-off since it touches Registry B and the migration sequence (see §5).

### 1.3 — UI-STATE reconciliation (locked vs critique's invented states)

The critique proposes an 8-state palette that overlaps but does not match your locked enum. Map, don't invent:

| Critique's invented state | Locked equivalent (Localization Matrix §4, Mirror-only) | Verdict |
|---|---|---|
| Green — "Supported and current" | `Fresh` (טרי) / `Strong` (חזק) | Use locked term |
| Amber — "Found for review" | New — not currently named. Closest existing concept: pre-`artist_approved` claim state. | **Gap — genuinely missing a label.** See §1.4. |
| Purple — "Artist input needed" | `Evidence missing` (חסר הוכחה) | Use locked term |
| Blue — "Supporting" | Registry B `applicability = S` (Supporting) — already a field-level concept, not a display state | Different layer, don't conflate |
| Red outline — "Conflicted" | `CONFLICTED` (certainty_default) — no Mirror-facing UI-STATE currently maps to it | **Gap — see §1.4.** |
| Grey — "Not started" | `Developing` (מתפתח) | Use locked term |
| Hidden — "N/A" | Registry B `applicability = N/A` — field removed from DOM entirely, not a visible state | Correct instinct, wrong layer — this isn't a *display state*, it's a *field-existence* decision made earlier in the pipeline |

### 1.4 — Two real gaps worth fixing (not from the critique's language, but from this analysis)

1. **No locked UI-STATE for "candidate awaiting artist review."** Today `Evidence missing` covers "nothing was found" and `Strong`/`Developing` cover post-review states — there is no chip for *"we found something, go look at it."* Propose adding `ממתין לאישור` / `Pending review` as a new Mirror-only UI-STATE, distinct from `Evidence missing`. This is a genuinely missing state, not a color swap.
2. **No locked UI-STATE for `CONFLICTED`.** Two sources disagree (e.g., self-declared community size vs. a producer-confirmed number). Propose `סתירת מקורות` / `Source conflict` as a new Mirror-only state, routed to the operator queue (`/ops/claim-review`) if unresolved after N days.

Both are small, additive changes to Localization Matrix §4 — not architecture changes. Flagging as R00-approval items in §5.

---

## 2. THE THREE ENTITIES — LIFECYCLE MAPPED TO REAL SCREENS

You asked for the collect/reflect/confirm/re-reflect loop "לכל 3 הישויות." Based on canon, the three journeys that actually carry distinct data lifecycles are **Artist**, **Artist Manager (Agency)**, and **Producer/Confirmer** — with the Booking Manager (אמרגן) and Venue Programmer sharing the same "professional evaluator" lifecycle as the Producer-as-evaluator case (they all consume, react to, and request against a Passport — they don't feed data in). I've kept Producer split into its two real functions below, since conflating them is exactly the critique's error.

### 2.1 — ARTIST (data originator — full four-stage loop)

| Stage | Screens | What actually happens |
|---|---|---|
| COLLECT | A5 (identity + social pull) · A6 (gig-scoped draw) · A7 (claim-first evidence capture) | Artist states a goal (A4) before any proof is requested. Social links are pulled as public-metadata-only (no scraping, no automated cron — artist-provided URL or explicit OAuth grant only, per Social OAuth section). Draw is always gig-scoped, never a global number. |
| REFLECT | A8 (Claim Review) · A9 (Mirror) | AI-extracted claims shown as candidates with source, method, and a plain-language limitation ("what this supports / does not establish"). A9 shows bounded dimension states, never a score. |
| CONFIRM | A8 actions (confirm / correct / omit / dispute) · A10 (publication selection + consent #2) | Two separate confirm actions, not one: confirming the *fact* (A8) is different from confirming the *fact may go public* (A10, its own consent). |
| RE-REFLECT | A9 (updates live) · A11 (readiness gate) · A14 (preview) · A15 (public Passport) · A16b (post-gig refresh re-enters COLLECT) | The loop closes at A16b — the highest-priority "recurring value" screen in the whole build, per your own screen tree annotation. Without it the Radar goes stale after Gate-1. |

### 2.2 — ARTIST MANAGER / AGENCY (aggregator — reflect + confirm on someone else's data, never originates it)

| Stage | Screens | What actually happens |
|---|---|---|
| COLLECT | AG1b (invite artist → `ArtistAccess`) | The agency does not collect evidence directly. It gains *scoped access* to an artist's own collection process. Ownership never transfers (canon rule, restated correctly). |
| REFLECT | AG1 (roster dashboard — bounded status per artist, no ranking) · AG4 (per-artist detail — evidence, Passport, requests, tasks) | This is where the critique's one legitimate point about the Manager needing more than "a Passport reader" is worth acting on — see §2.2a below, a concrete field proposal. |
| CONFIRM | AG6 (publication approvals — agency *prepares*, artist *approves*) | Agency can stage a publication choice, but cannot execute it. Final `artist_approved = true` stays with the artist, same rule as A10. |
| RE-REFLECT | AG2 (requests inbox — commercial intent only) · AG2b (reaction activity — saves/forwards/proof-requests, kept separate from AG2 to avoid polluting real bookings with soft signals) · AG7 (outcome capture) | Feeds "Roster Intelligence" (AG intelligence) — own-roster-only counts and bands, explicitly **not** cross-artist scoring. |

**2.2a — Concrete field proposal (the one real gap the critique surfaced for this persona):** AG4 currently reads evidence/Passport/requests/tasks but has no explicit "what's missing to pitch this artist" view. Proposal: add two Registry-B–style fields scoped to the Manager visibility layer only:

| Proposed field | Segment | Visibility | Notes |
|---|---|---|---|
| `roster_artist.missing_sales_assets[]` | Derived from existing gap_rule outputs across all R/C fields, filtered to `opportunity_types` relevant to open `AvailabilityRequest`s | agency-only | Not a new data source — a re-presentation of A9's existing gap data, scoped to the Manager's commercial lens |
| `roster_artist.pitch_angle_suggestion` | Derived from strongest 2–3 `passport-ok` claims + artist's stated goal | agency-only | Text suggestion, never a score. Same "one next action" discipline as A9's Next Action Card, just phrased for a seller instead of the artist |

Both are **read-time derivations of data that already exists** — no new collection door, no new consent, no firewall risk. This is the cheapest possible way to satisfy the critique's Manager complaint without adding scope.

### 2.3 — PRODUCER — split correctly into its two real functions

**2.3a — Producer as Confirmer (bounded task, no account, P1):**

| Stage | Screens | What actually happens |
|---|---|---|
| COLLECT | n/a | Confirmer does not submit evidence — they respond to a specific claim already collected from the artist |
| REFLECT | P1 (single claim shown, protective frame, brand recedes) | One claim, exact public wording, non-commitment footer required |
| CONFIRM | P1 (4-button response + `authority_type` + `name_visibility`) | Silence is never confirmation — operator override requires source + timestamp + declared authority, never inferred |
| RE-REFLECT | Claim's method label upgrades to `COUNTERPARTY_CONFIRMED`; propagates to A9 (artist sees it) and, if `passport-ok`, to A15 | Confirmer can revoke at any time; revocation is itself an event that re-triggers RE-REFLECT downward |

**2.3b — Producer as Evaluator/Buyer (full persona — App-Screen-Tree §2c, `functional_role = producer`):**

This is what the critique thinks is missing. It is not. It shares B1 (`/passport/:id`) → B2 (action ladder) → B3 (confirmation) with the Booking Manager and Venue Programmer, differentiated only by `actor_role_context` in analytics — so financial-risk reactions from a מפיק are never pooled with reputational-risk reactions from an אמרגן. No new screens needed; if anything is missing here it's an **analytics segmentation check**, not new UI: confirm that every `ProfessionalReaction` write actually stamps `actor_role_context` correctly across all three evaluator personas (booking_manager / producer / venue_programmer). That's a QA item, not a design item — see §5.

### 2.4 — Where the Booking Manager (אמרגן) fits

Not one of your "3 entities" by name, but structurally identical to Producer-as-Evaluator (§2.3b) — same B1→B2→B3 loop, same shared components, same `actor_role_context` discipline. Nothing new required here either. I'm calling this out explicitly so it doesn't get re-litigated as a fourth "missing persona" in a future review.

---

## 3. FIREWALL-SAFE VERSION OF "PROGRESSIVE REVEAL" (the one real new idea)

If you want to pursue the onboarding motivation mechanic, here is how to build it without breaking A11's readiness gate or the strength-only Passport rule.

**Rule:** the progressive preview lives entirely inside the Artist's own private session — it is never a public URL, never shareable, never indexed, and never bypasses A11.

| Element | Firewall-safe implementation |
|---|---|
| Trigger | Same moments the critique names: link connected, evidence uploaded, claim confirmed |
| Surface | A new **Mirror-side "Live Preview" panel** — not a new route, an embedded component inside A9 (Artist Radar), rendering the *same component* A14 uses, but explicitly watermarked "Draft — not shareable" |
| Data shown | Only `claim.artist_approved = true` claims — never raw candidates. This is the critical guardrail: showing an unconfirmed candidate in a "your Passport is growing" moment would be the same overclaim risk the readiness gate exists to prevent. |
| Publish gate | A11's hard-block (`supported_claims_count == 0` → publish disabled) is completely unaffected — the Live Preview is cosmetic motivation, not an alternate publish path |
| Method labels | Still rendered in full on the preview — no shortcut on the "claim · context · method-label · review-date" Proof Unit discipline, even in draft mode |

This gets you the dopamine loop the critique describes without ever letting an unearned artifact look real.

---

## 4. DATA GOVERNANCE — FULL FIELD LINEAGE (one table, the whole pipeline)

```
evidence_artifact (raw)
   │  source_type, checksum, consent, uploaded_at
   ▼
claim (candidate)
   │  certainty_default: OBSERVED/EXTRACTED/CALCULATED/INFERRED/SELF_REPORTED/SELF_CONFIRMED_FROM_WEB
   │  visibility: mirror-only (always, at this stage)
   ▼
claim (owner-confirmed)
   │  certainty_default → HUMAN_REVIEWED or COUNTERPARTY_CONFIRMED
   │  claim.artist_approved = true
   │  claim.verification_status (4-value display collapse): verified / supporting / self-reported / not-assessable
   ▼
claim (visibility-assigned)
   │  claim.visibility: mirror-only | passport-ok | internal
   │  only verified/supporting + artist_approved may become passport-ok
   ▼
passport_version.included_claims[]  (snapshot, immutable per version)
   │
   ▼
claim.expires_at reached → STALE or CONFLICTED
   │
   └──► re-enters COLLECT via A16b (Gig Evidence Refresh) or freshness-nudge email
```

Every arrow in this diagram already has a corresponding metafield in Registry B or the Screen-Spec — nothing here requires new tables, only the two new UI-STATE labels from §1.4 and the two derived Manager-facing fields from §2.2a.

---

## 5. OPEN DECISIONS — R00 SIGN-OFF NEEDED

| # | Decision | My recommendation | Why it needs you, not me |
|---|---|---|---|
| 1 | Radial evidence map / 7-color palette from the critique | **Reject outright.** Build nothing from Critique §3–§4. | It's a locked firewall rule, not a style preference — but you should be the one who formally closes this out, since it may resurface from a future AI review with the same drift pattern. |
| 2 | Full 10-value `certainty_default` chain vs current 4-value shortcut | **Build the 10-value chain now**, keep 4-value as its display collapse | Touches Registry B directly and the migration sequence — your existing open architectural decision, now with a concrete recommendation attached |
| 3 | Two new Mirror-only UI-STATEs: "Pending review" and "Source conflict" | **Add both** to Localization Matrix §4 | Any new locked term needs your term-status-register approval (§9 of the Matrix) |
| 4 | Two new Manager-facing derived fields (`missing_sales_assets[]`, `pitch_angle_suggestion`) | **Add both**, scoped agency-only, read-time derivation only | New Registry B rows need R00 approval per the registry's own governance rule |
| 5 | Progressive "Live Preview" panel inside A9 | **Build it**, watermarked, confirmed-claims-only, no new route | Adds scope to A9's build — worth confirming priority against A16b (which you've already flagged as the higher-value recurring loop) |
| 6 | QA check: `actor_role_context` correctly stamped across booking_manager / producer / venue_programmer on every `ProfessionalReaction` write | **Run this check before Gate-1** | Not a design decision — a build-verification item, flagging here so it doesn't get lost |

---

## 6. WHAT THIS DOES NOT CHANGE

To be explicit about scope discipline: nothing in this document proposes new personas, new top-level routes, or changes to the three-entity chain (Artist → Booker → Producer confirms) in your product memory. The Manager and Producer-evaluator "gaps" the critique raised are real screens that already exist in `App-Screen-Tree-v1.md`. This document's actual net-new surface area is: two UI-state labels, two derived read-only fields for the Manager view, one cosmetic preview panel, and a recommendation to build the certainty chain in full rather than the shortcut. Everything else here is a map of what you already have, corrected against a source that wasn't canon.

---

**Next Action** — Approve or amend the six items in §5. Once approved, this document merges into CANON (via Cowork) and Localization Matrix v1.2 gets the two new UI-STATE rows.
**Missing Inputs** — Confirmation on whether the Manager-facing derived fields (§2.2a) should live in Registry B as a new segment or as an agency-scoped view layer on top of existing segments (architecture question, not a data question — either works, but they imply different future maintenance cost).
**Business Impact** — This document prevents a real risk: without it, the next AI reviewer (or Claude Code, working from an incomplete folder) could rebuild the radar as a spider chart and "fix" two personas that were never broken — burning real build time patching hallucinated gaps while the one channel that actually drives recurring value (A16b) stays under-built. Canon-presence discipline just paid for itself.
