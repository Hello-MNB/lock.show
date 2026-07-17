# GIGPROOF — UX Gap Analysis: Prototype vs. Canon

> **⚠️ SUPERSEDED / HISTORICAL (12 Jul 2026).** This brief predates the LOCK rename and the
> entity-terminology correction. Where it labels the buyer persona "אמרגן" it is WRONG under
> the ratified model: אמרגן = artist-side agent/office; the buyer is מזמין הופעות (see
> docs/GLOSSARY.md v1.1 + docs/ENTITY-GLOSSARY.md). Kept for gap-history only — do not copy
> its vocabulary.

**Document type:** PM analysis brief for Codex  
**Source:** Prototype audit (`ProductPrototype.jsx` + `SmartOnboardingFlow.jsx`)  
**Canon refs:** B4-35.10, B4-35.20 (v2.4), B4-35.30 (v1.7), B4-35.60 (v1.8), CLAUDE.md  
**Date:** July 2026  
**Version:** v1.1 — Full audit pass. 12 additional gap categories added.  
**Status:** READY FOR CODEX BRIEFING  
**Rule:** Claude does not write code. This document is a brief for Codex.

---

## 1. EXECUTIVE SUMMARY

The prototype covers **26 of an estimated 71+ screens** across 5 personas. Agency and Trust Operator have **zero implemented screens** despite being fully mapped in `journeyGroups`. Three confirmed firewall violations exist in production code. Gamification is partially implemented but **18 identified moments** need specification and some cross the firewall. All route groups in B4-35.60 are currently **BLOCKED**.

**v1.1 audit additions:** 12 additional gap categories not covered in v1.0, including RLS requirements, visual regression set (14 snapshots), DiscoveryCandidateCard (§7A, 4 states), missing copy requirements (beta label + no-guarantee footer), VITE_DEMO flag, notification architecture, server-side publication validation, netlify.toml prohibition, Anthropic API stub, and band pill fix clarification for V-001.

---

## 2. SCREEN COVERAGE MAP

| Persona | Canon Journey Steps | Prototype Screens | Gap |
|---|---|---|---|
| Artist | 19 | 8 (`ArtistFlowScreen`) | **11 missing** |
| Booking Pro (אמרגן) | 13 | 6 (`BookerFlowScreen`) | **7 missing** |
| Producer / Source Confirmer (מפיק) | 10 | 6 (`ProducerFlowScreen`) — CONFLATED | **4 missing + role conflation** |
| Agency / Management | 14 | 0 — no component exists | **ALL 14 missing** |
| Trust Operator | 15 | 0 — no component exists | **ALL 15 missing** |
| **TOTAL** | **71** | **20 unique** | **≈51 missing** |

**Note:** Agency and Trust Operator UI is intentionally deferred to Full Beta per CLAUDE.md. However the schema must be Gate-1 ready.

**Open question for Maria — 6th persona:** B4-35.20 §3 lists "Venue programmer or artistic director" as a distinct role. B4-35.60 route 019 is labelled "venue-programmer experience." Is this a 6th persona with its own screen set, or is it subsumed under Booking Professional? Must be resolved before route 019 is specced.

---

## 3. GAMIFICATION INVENTORY — ALL 18 ELEMENTS

Gamification = progress-reinforcing interaction mechanics that do NOT cross into scoring/ranking.  
Canon firewall: "avoid gamified progress and competitive humiliation" (B4-35.10 §Brand Territory).  
**Rule:** Gamification is permitted as steppers, action states, discovery counts, freshness badges. Fill bars and completion percentages are PROHIBITED.

### 3A. ✅ COMPLIANT GAMIFICATION (keep + specify)

| # | Element | Location | Notes |
|---|---|---|---|
| 1 | **Numbered stepper** — `auth → intent → resolve → setup → ready` | `SmartOnboardingFlow` | Done/active/pending states. Compliant. |
| 2 | **Numbered role cards** — `01/02/03/04` with "Selected ✓" feedback | `SmartOnboardingFlow` | Strong identity anchor. Keep. |
| 3 | **"RECOMMENDED NEXT ACTION" hero card** — single prioritized next move | `ArtistFlowScreen/radar` | Core PM mechanic. Compliant — drives action without scoring. |
| 4 | **Signal rows** — BoundedStatusChip per evidence domain | `ArtistFlowScreen/radar` | Needs label fix (see violations). |
| 5 | **Evidence 3-option picker** — Upload / Ask source / Add manually | `ArtistFlowScreen/evidence` | Reduces cognitive load via scoped choices. |
| 6 | **Claim review action hierarchy** — Correct / Keep private / Omit / Approve | `ArtistFlowScreen/claims` | Ordered ranking reinforces correct path. |
| 7 | **Publication threshold checklist** — check/clock icons + NEXT BEST ACTION sidebar | `ArtistFlowScreen/readiness` | Reveals action sidebar on gap — compliant. |
| 8 | **Share Hub status chips** — Active / Untracked + expiry + "Opened once · no reaction yet" | `ArtistFlowScreen/share` | Creates professional anticipation without scoring. |
| 9 | **Request count badge** — "Two requests need your attention" | `ArtistFlowScreen/requests` | Urgency without ranking. |
| 10 | **Freshness badge** — "New evidence since your last review" | `BookerFlowScreen/saved` | Pull mechanic for returning Passport viewers. |
| 11 | **Outcome recording** — 5-button palette closing the professional decision loop | `BookerFlowScreen/outcome` | Explicitly avoids CRM conflation. Compliant. |
| 12 | **Authority picker** — 5 interactive role options for Source Confirmer | `ProducerFlowScreen/authority` | Single-purpose deliberate selection. |
| 13 | **Journey step counter** — "X / Y" header + numbered step rail | `JourneyLibrary` | Meta-navigation for the prototype explorer. |
| 14 | **Persona sidebar step-count badges** — `{group.steps.length}` per button | `JourneyLibrary` | Same as above. |
| 15 | **Website numbered proof points** — 01/02/03 | `ModernPublicWebsite` persona pages | Brand language, not product gamification. |
| 16 | **Methodology steps** — numbered 01–06 | `ModernPublicWebsite` | Same. |

### 3B. 🚨 FIREWALL-ADJACENT GAMIFICATION (must fix before ship)

| # | Element | Location | Violation |
|---|---|---|---|
| 17 | **`progress = 25 + filled * 18`** — percentage fill calculation | `EntryFlowV3` | If this feeds a fill bar: **PROHIBITED**. Investigate rendering context. Even if hidden, the pattern is unsafe. Replace with step count ("Step 2 of 5"). |
| 18 | **`Dimension` fill bar** — `<i style={{ width: \`${fill}%\` }} />` values 88/40/65/58 | `ProductPrototype` lines 240–255 | **CONFIRMED FIREWALL VIOLATION.** Completion-percentage fill bar. Must be removed. See V-001 for fix brief. |

---

## 4. CONFIRMED FIREWALL VIOLATIONS

These are production code violations against the absolute firewall (B4-35.30 §6, CLAUDE.md §THE FIREWALL).

### V-001 — Fill bar in `Dimension` component
**File:** `ProductPrototype.jsx` lines ~240–255  
**Code:** `<i style={{ width: \`${fill}%\` }} />` with values `fill=88`, `fill=40`, `fill=65`, `fill=58`  
**Canon:** "overall score, rank, percentile, probability; radar, spider, web, polygon, circular multi-axis or gauge scoring visual" — permanently prohibited on every surface.

**Fix brief for Codex — two different replacements depending on what the fill bar represents:**
- If the `Dimension` component represents an **evidence domain** (e.g., "Live demand" domain status): replace `<i>` fill bar with `BoundedStatusChip`. Allowed private states: Well supported · Partially supported · Evidence missing · Stale / needs refresh · Not assessable · Reviewed and current. Visual = chip, not bar.
- If the `Dimension` component represents a **draw claim** (e.g., audience/ticket data): replace with a **band pill** formatted as `50–150 · TICKET EXPORT · REVIEWED OCT 2025`. Never a gauge, never a fill bar, never a single number.

Codex must determine which case applies before choosing the replacement. The two replacement patterns are not interchangeable.

### V-002 — "Strong" / "Developing" status labels on Radar signal rows
**File:** `ProductPrototype.jsx`, `ArtistFlowScreen/radar`  
**Canon:** B4-35.20 §5: "Avoid standalone 'Strong' or 'Developing' because they can be misread as an artist judgment."  
**Allowed states:** Well supported · Partially supported · Evidence missing · Not assessable · Stale / needs refresh · Reviewed and current  
**Fix brief for Codex:** Replace "Strong" → "Well supported" (or "Partially supported" where appropriate). Replace "Developing" → "Partially supported." String-only changes — no layout change required.

### V-003 — `progress = 25 + filled * 18` in EntryFlowV3
**File:** `SmartOnboardingFlow.jsx` or `ProductPrototype.jsx` EntryFlowV3 section  
**Status:** Rendering context not yet confirmed. The calculation exists.  
**Canon:** Any number that grades the artist or measures completion as a percentage is prohibited.  
**Fix brief for Codex:** If this value feeds any visual width or percentage display, remove it. Replace with a stepper counter ("Step 2 of 5") using the existing numbered-stepper pattern from `SmartOnboardingFlow`.

### V-004 — Hardcoded artist format dropdown
**File:** `ProductPrototype.jsx`, artist identity setup  
**Code:** Dropdown options: "Live electronic / DJ set / Solo vocal / Band"  
**Canon:** CLAUDE.md Artist-Agnostic Law: "No table/column/enum/logic may assume a specific artist type, genre, or platform."  
**Fix brief for Codex:** Remove the hardcoded dropdown. Replace with a free-text field or taxonomy-driven dynamic list. The taxonomy is UNDER DISCOVERY — use an open text input for now.

### V-005 — Hebrew disabled in language switcher
**File:** `SmartOnboardingFlow.jsx`  
**Code:** Hebrew button rendered as disabled/grayed ("עברית · Soon")  
**Canon:** B4-35.20 §0A: "EN + HE in Phase 1." Hebrew is authored native-first, not disabled.  
**Fix brief for Codex:** Remove the "Soon" gate. Hebrew must be a functional locale in Phase 1. If the Translation Matrix is incomplete, block the locale at a feature-flag level in development only — never surface it as "Soon" to any user.

---

## 5. PER-PERSONA UX GAPS

### 5A. ARTIST PERSONA — 11 missing screens

**Critical missing (Gate-1 scope):**

| Missing Screen | Canon Ref | Notes |
|---|---|---|
| Manual payment / offer presentation | CLAUDE.md §STAGE & SCOPE #7 | OfferCard + PaymentState + EntitlementState (B4-35.30 §7.11) specified but absent |
| Evidence upload sub-flows | B4-35.30 §7.8 | 8+ states required: validation, upload, processing, delayed, failed, retry, withdrawn, replacement |
| "Ask source" sub-flow | B4-35.30 §7.8 | Sends confirmation request to Source Confirmer — triggers §7.9 ConfirmationTask flow |
| DiscoveryCandidateCard flow | B4-35.30 §7A | See §12 below — entire fourth-door discovery flow absent |
| Evidence processing / delay state | B4-35.30 §7.11 | Between "Submit for review" and claim appearing |
| Publication consent gate | B4-35.20 §7 | Must be contextual (at publish moment), not bundled into entry consent |
| Unpublish Bookability Passport | B4-35.20 §6 | Artist action locked in CTA hierarchy — not visible in prototype |
| Request detail + response | — | Requests inbox exists; expand-to-respond screen does not |
| Withdraw/revoke Share Hub link | — | Status chips show expiry, no revoke controls |
| Empty state (0 evidence) | B4-35.30 §4 | Every empty state must explain the next action |
| Stale evidence domain state | B4-35.30 §7.2 | BoundedStatusChip: "Stale / needs refresh" not shown |
| History / past Passport versions | B4-35.60 route 010 | JourneyGroups includes it, no prototype screen |

**Additional localization gap:**  
All artist copy is English only. Hebrew strings must be authored native-first and are not a translation of the English copy (B4-35.20 §1).

---

### 5B. BOOKING PROFESSIONAL (אמרגן) — 7 missing screens

| Missing Screen | Canon Ref | Notes |
|---|---|---|
| Authenticated entry for אמרגן | B4-35.60 route 016 | No login/signup flow for booking professional persona |
| Expand method detail (ProofUnit drawer) | B4-35.30 §7.1 | JourneyGroups step 3; no drawer/expand interaction |
| Event-context form before availability request | B4-35.20 §6 | Tapping "Check availability" must capture event + date before sending |
| "Forward to decision-maker" sub-screen | B4-35.20 §6 | Forward ≠ public endorsement; privacy boundary unresolved |
| "Request specific proof" sub-screen | B4-35.20 §6 | What proof? How is request framed to artist? |
| "Future fit" sub-screen | B4-35.20 §6 | No date/event context captured |
| IncorrectInformationReport flow | B4-35.30 §7.12 C14 | Booker finds incorrect claim — no report path exists. See §13. |
| Notification: evidence updated on saved Passport | — | Freshness badge exists; no alert trigger mechanism. See §15. |

**Key language rule for Codex:** אמרגן ≠ מפיק. Must never be structurally merged in any component, route, or data model. The booking professional's "Check availability" opens ProfessionalActionSheet; "Request price/details" is inside the sheet, never a second primary CTA on the Passport.

---

### 5C. PRODUCER / SOURCE CONFIRMER — CRITICAL ROLE CONFLATION

**B4-35.20 §3:** Source Confirmer = "a bounded statement-confirmation role, not a general endorsement role." Structurally different from Producer-as-buyer (event/financial risk).

**Current state:** `ProducerFlowScreen` merges both into one component. Two completely different entry points, different data written, different privacy implications.

**Fix brief for Codex:** Split `ProducerFlowScreen` into two separate components/routes:

**Path A — Source Confirmer (magic-link, no account)**
| Missing Screen | Notes |
|---|---|
| Magic-link landing page | No entry screen, no expired-link state, no wrong-person redirect |
| Orientation screen | "What is being asked, who, bounded scope" — jump to statement is too abrupt |
| Decline / Cannot assess / Wrong person paths | B4-35.20 §6: all 5 actions required. Only "Confirm" + authority picker shown. |
| Edit statement inline | "Partly correct — edit statement" action not implemented |
| Withdraw confirmation route | Receipt shows success but no "Correct later" or "Withdraw" |
| Email receipt to confirmer | Confirmer has no copy of their response |

**Path B — Producer-as-buyer (needs own workspace entry)**
| Missing Screen | Notes |
|---|---|
| Producer workspace entry/auth | No dedicated entry for Producer-as-buyer — currently identical to Source Confirmer |
| Request tracking for producer | No receipt or status after sending commercial request |

**Schema separation requirement:** `ConfirmationTask` (Source Confirmer's response to a specific claim) and `AvailabilityRequest` (a booking or commercial inquiry from a booking professional or producer) are **different schema objects** with different visibility, audit, and RLS rules. They must never share a table or be conflated at the component level.

---

### 5D. AGENCY / MANAGEMENT — ALL MISSING (intentional per Gate-1)

CLAUDE.md: "DO NOT build now: management/agency + event-producer workspaces." UI intentionally deferred. Schema must be Gate-1 ready.

**Schema requirements for Codex to confirm exist:**
- `workspace` table with `type` enum including `management`
- `workspace_member` with `role` column (owner/admin/member)
- `artist_access` table (agency → artist scope grant, requires artist approval)
- `invitation` table with all states: sent/accepted/declined/expired/revoked/suspended/disputed

**When Agency UI is built, critical items:**
- No rankings across roster artists — ever
- "Roster Intelligence" is the allowed interface descriptor (B4-35.20 §2)
- ArtistAccess scope requires explicit artist consent (not just agency invitation)
- PermissionStateBanner (§7.7) required for all 8 invitation states
- RoleContextSwitcher (C05) required: workspace identity must always be visible

---

### 5E. TRUST OPERATOR — ALL MISSING (intentional per Gate-1)

CLAUDE.md: Operator workspace deferred. However, **two items are Gate-1 scope**:

**IN GATE-1 SCOPE (must be built):**

1. **Concierge claim-processing UI** — CLAUDE.md §STAGE & SCOPE #8: explicitly in scope. Currently absent.  
   Brief for Codex: Minimal table view — artist name · claim submitted · evidence artifact · method label · action (Approve / Reject / Query artist). Uses `OperatorReasonDialog` (§7.13) for every action. Every operator write produces an `audit_event` row (actor, reason, prev→new). No silent overrides.

2. **Manual payment activation** — CLAUDE.md §STAGE & SCOPE #7: "Manual payment (Bit/transfer) → founder approves → entitlement." Absent.  
   Brief for Codex: Operator view of submitted payment + "Activate entitlement" button gated by `OperatorReasonDialog`. Server-side only — client cannot grant entitlement.

**Operator terms must never leak to public surfaces:**  
`verified heads`, `capacity-fill percentage`, `bookability score`, `SignalScore`, `internal confidence`, `OpsTriageRollup` — internal only (B4-35.20 §13).

---

## 6. ENCODING / DATA CORRUPTION ISSUES

Four confirmed mojibake instances found in prototype copy:

| Location | Corrupted text | Should be |
|---|---|---|
| `EntryFlowV3` language switcher | `׳¢׳'׳¨׳™׳×` | `עברית` |
| `ArtistFlowScreen/refresh` textarea | `"bounded commercial or audience signalג€¦"` | Ellipsis character (…) corrupted |
| `BookerFlowScreen/notes` textarea | `"internal decision-makerג€¦"` | Ellipsis character (…) corrupted |
| `ProducerFlowScreen/confirm` blockquote | `ג€Lior Noy was invited...ג€` | Opening/closing curly quotes corrupted |

**Fix brief for Codex:** Replace all `ג€`, `׳¢׳'׳¨׳™׳×` and similar sequences with correct Unicode characters. Set file encoding to UTF-8-BOM for all source files. Verify Hebrew strings render correctly in RTL context.

**Additional requirements:**
- Mixed-script user content (Hebrew + English in same field) must use bidirectional text isolation (`dir="auto"` or explicit `<bdi>` wrapping).
- Deep links must never switch role or workspace context silently (B4-35.30 §4). Navigating a Passport URL while authenticated as a different persona must reach a clear boundary state, not a silent role switch.

---

## 7. ONBOARDING ORPHANED STAGES

`SmartOnboardingFlow.jsx` has three unreachable stages:

| Stage | Code exists | Reachable | Notes |
|---|---|---|---|
| `connect` | ✅ | ❌ | No navigation leads here from `setup` |
| `reveal` | ✅ | ❌ | No navigation leads here |
| `review` | ✅ | ❌ | No navigation leads here |

**Fix brief for Codex:** Wire these stages into the navigation flow or remove them. If they represent future onboarding steps, gate them behind the `VITE_DEMO` flag until ready (see §17A).

---

## 8. MISSING SYSTEM STATES (global)

Canon B4-35.30 §4 and §10 require these states everywhere. None are shown in prototype:

| State | Required in |
|---|---|
| Loading (skeleton or spinner) | All data-fetching screens |
| Empty (0 items) | Request inbox, Saved Passports, evidence list, Share Hub |
| Error (network / server) | Submit evidence, Approve claim, Send request |
| Stale (evidence needs refresh) | Artist Radar signal rows |
| Forbidden (access denied) | Any authenticated route without correct role/workspace |
| Recovery (retry / correct) | Upload failure, submission failure |
| Partial (some data available) | Passport with fewer than 2 supported Proof Units |
| Media failure | Passport: media load failure must not block Proof Unit display |

**Media failure:** CLAUDE.md: "media failure cannot block proof." The `PassportRenderer` must degrade gracefully — if an image or video fails to load, the text claim + method label must still render.

**Brief for Codex:** Gate-1 minimum: implement empty and error states for Artist Radar home, evidence submission, claim approval, and Share Hub. Loading states are required on every async action.

---

## 9. CONSENT ARCHITECTURE GAP

Current prototype shows all 4 consents on a single entry screen.

**Canon B4-35.30 §7.6:** "Four separate consent purposes total. No bundle, pre-check, dark pattern or conditional ambiguity."

**Required consent timing:**
| Consent | When to show |
|---|---|
| Privacy processing | Entry (account creation) |
| Public publication | At the moment of publishing Passport — not before |
| Third-party evidence | When triggering "Ask source" flow only |
| Marketing (optional) | Entry — clearly optional, declining does not block |

**Brief for Codex:** Consent #2 and #3 must be contextual. Entry screen: Privacy processing + optional Marketing only. Publication consent: separate gate when artist taps "Publish Bookability Passport." Third-party evidence consent: appears only when triggering Source Confirmer request.

---

## 10. QA REGISTER STATUS REMINDER (B4-35.60)

All 21 route groups: **BLOCKED**  
All 15 critical components (C01–C15): **SPECIFIED / NOT REVIEWED / NOT VERIFIED / BLOCKED**  
Application design-release verdict: **BLOCKED**

Gate-1 build target routes:
- 001 account entry and recovery
- 002 role and context selection
- 003 consent and consent center
- 006 artist onboarding and identity
- 007 artist gig activity and evidence capture
- 008 artist Claim review
- 009 Artist Radar core and tasks
- 011 Passport readiness, selection and publication
- 012 Passport preview and public renderer
- 013 Share Hub and tagged-link state
- 014 artist request inbox and detail
- 017 Source confirmation role (split from route 016 producer)
- 020 operational workspace (concierge + payment only)

---

## 11. MISSING COPY REQUIREMENTS

### 11A. Beta label (B4-35.20 §9)
**Required copy:** "**Controlled beta / בטא מבוקרת**"  
**Current state:** Not confirmed present in prototype. Likely missing or ad hoc.  
**Brief for Codex:** Every authenticated screen in the beta period must display this label in a consistent, non-intrusive position (e.g., header badge). Use this string verbatim in both languages.

### 11B. No-guarantee footer (B4-35.20 §10)
**Required copy:** "Historical evidence and professional context only. GIGPROOF does not predict or guarantee a booking outcome."  
**Current state:** Not confirmed present on any Passport surface.  
**Brief for Codex:** This footer must appear on the public Passport surface, below the last Proof Unit and before the CTA section. Render in both EN and HE. This is product canon, not optional legal boilerplate.

---

## 12. MISSING COMPONENT: DiscoveryCandidateCard (B4-35.30 §7A)

**What it is:** When the Artist Radar surfaces web-found evidence candidates (Gate-1: via concierge/human-operated discovery), the artist sees a `DiscoveryCandidateCard` per candidate. The artist must explicitly confirm each before it becomes a claim. At Gate-1, discovery is concierge-gated, opt-in, post-consent only.

**4 required states:**
| State | Description |
|---|---|
| `pending` | Candidate surfaced — artist has not reviewed |
| `edited-pending` | Artist edited the proposed statement — awaiting final confirm |
| `confirmed` | Artist confirmed → flows into standard claim review pipeline |
| `rejected` | Artist dismissed — candidate removed, rejection logged |

**Current prototype state:** Zero implementation. No discovery flow, no candidate card, no confirm/reject interaction anywhere in `ProductPrototype.jsx`.

**Brief for Codex:** Build `DiscoveryCandidateCard` as a distinct component within the Artist Radar screen. Rules:
- Never auto-publishes an unconfirmed candidate
- Unconfirmed candidates are NOT counted as evidence
- Unconfirmed candidates are NOT visible outside the private Mirror surface
- Component appears in the Radar between the "Recommended Next Action" hero card and the signal rows — only when candidates exist
- Discovery flow requires a separate consent gate before any candidate is surfaced (third-party data consent)

---

## 13. MISSING COMPONENTS: FeedbackLauncher (C13) + IncorrectInformationReport (C14)

Both specified in B4-35.30 §7.12. Both absent from prototype.

### FeedbackLauncher (C13)
Persistent mechanism for authenticated users to flag issues or give feedback without leaving the current screen.  
**Brief for Codex:** Build as a persistent floating action (bottom-right corner). Opens a minimal modal — not a full-page view. Does not require navigation away. Available in both Artist and Booking Professional surfaces.

### IncorrectInformationReport (C14)
Flow for a Booking Professional who believes a claim is incorrect or misleading. Surfaces on the public Passport.  
**Brief for Codex:** Add a discreet "Report" affordance at Proof Unit level on the public Passport. Opens a bounded form: which claim, what the concern is, optional context. Report routes to Operator queue — NOT to artist directly, NOT visible on public Passport. Booking professionals cannot invalidate claims without operator review.

---

## 14. VISUAL REGRESSION REQUIREMENTS (B4-35.30 §10)

14 required visual regression snapshots must exist before any design-release decision. This is a hard gate per B4-35.60 v1.8.

| # | Snapshot type |
|---|---|
| 1 | 360px viewport · Hebrew (HE) · RTL layout |
| 2 | 360px viewport · English (EN) · LTR layout |
| 3 | Desktop 1280px+ · Hebrew (HE) · RTL layout |
| 4 | Desktop 1280px+ · English (EN) · LTR layout |
| 5 | Empty state (0 evidence, 0 claims) |
| 6 | Loading state (skeleton screens) |
| 7 | Partial state (some data, below publication threshold) |
| 8 | Error state (network failure) |
| 9 | Forbidden state (wrong role/workspace access attempt) |
| 10 | Stale state (evidence needs refresh) |
| 11 | Payment pending state |
| 12 | Payment confirmed / entitlement active state |
| 13 | Passport at minimum threshold (exactly 2 Proof Units, ≥1 live-demand) |
| 14 | Passport at 390px (WhatsApp link-preview context) |

**Current state:** No visual regression infrastructure exists in the prototype.

**Brief for Codex:** These snapshots are required before any PR touching Passport rendering, Radar layout, or consent screens can be merged.

---

## 15. NOTIFICATION ARCHITECTURE (cross-cutting)

Referenced across multiple persona gaps. This is a cross-cutting infrastructure concern affecting Gate-1 ship readiness.

**Missing notification triggers (Gate-1 minimum):**

| Event | Recipient | Current prototype state |
|---|---|---|
| New availability request received | Artist | Absent — request inbox exists, no alert trigger |
| Evidence updated on a saved Passport | Booking Professional | Absent — freshness badge exists on saved view, no push/email trigger |
| Source Confirmer responds (confirm/decline) | Artist | Absent |
| Claim approved by Operator (concierge review complete) | Artist | Absent |
| Passport share link expires or is revoked | Artist | Absent |

**Brief for Codex:** At Gate-1, notification delivery can be email-only (no push required). Use the email captured at account creation. Design the notification data model as delivery-method-agnostic so push can be added in Full Beta without schema change. Do not build an in-app notification bell at Gate-1 — email is sufficient.

---

## 16. SUPABASE RLS REQUIREMENTS

CLAUDE.md specifies these RLS rules absolutely. Not verified in current schema or prototype:

| Field / Action | Rule |
|---|---|
| `claim.value` | Never SELECT-able by public/buyer session |
| `gig.exact_count` | Never SELECT-able by public/buyer session |
| `claim.internal_confidence` | Never SELECT-able by public/buyer session |
| `artist.contact` | Never SELECT-able by non-operator |
| Public Passport session | May INSERT `professional_reaction` + `availability_request`; may SELECT only passport-ok, artist-approved claims of the viewed Passport |
| Every operator write | Must produce an `audit_event` row: actor · reason · prev→new value. No silent overrides. |

**Brief for Codex:** These RLS rules must be implemented and verified with a test suite before any real data goes live. A buyer-role JWT must not be able to query raw claim values, internal confidence scores, or artist contact data via any Supabase call. Test with a buyer-session JWT against each restricted field. Failure = hard security defect.

---

## 17. INFRASTRUCTURE REQUIREMENTS

### 17A. VITE_DEMO flag (BT-03)
**Backlog item BT-03:** Gate demo persona switcher behind `VITE_DEMO` env flag.  
**Current state:** `JourneyLibrary` and persona switcher visible in all environments.  
**Brief for Codex:** Wrap `JourneyLibrary` and any demo-mode persona switcher in `import.meta.env.VITE_DEMO` guard. Must not appear in production builds unless `VITE_DEMO=true` is set in the Vercel environment.

### 17B. netlify.toml prohibition
**CLAUDE.md:** "`netlify.toml` must NOT exist."  
**Brief for Codex:** Confirm `netlify.toml` is absent from repo root and all subdirectories. If found, delete it. Canonical deployment target is Vercel only.

### 17C. Anthropic API stub
**CLAUDE.md:** "AI claim-pipeline is concierge-processed BY HAND until volume justifies automation — do NOT build automated extraction yet; build the stub + human-review UI."  
**Current state:** No stub or human-review queue wiring exists.  
**Brief for Codex:** Build a stub endpoint that accepts claim submissions and routes them to the Operator concierge queue (§5E). Wire to the Anthropic API client but return a placeholder response in Gate-1 builds. Flag clearly in code: `// CONCIERGE-STUB: replace with automated pipeline post Gate-1`.

### 17D. Server-side publication validation
**CLAUDE.md:** "server-side publication validation required."  
**Current state:** Publication threshold checklist exists on client (`ArtistFlowScreen/readiness`) — no server-side gate.  
**Brief for Codex:** Passport publication must be validated server-side (Supabase Edge Function or equivalent) before the Passport becomes publicly accessible. Client-side checklist is UX guidance only. Server must independently verify: ≥2 supported Proof Units · ≥1 is live-demand or commercial-evidence · artist approval flag set · publication consent recorded. A client bypassing the checklist must still fail at the server gate.

---

## 18. CODEX PRIORITY BRIEF

### P0 — Fix now (firewall violations, encoding, infrastructure blockers)
1. Remove `Dimension` fill bar (V-001) — see §4 for two-path replacement brief (BoundedStatusChip vs. band pill)
2. Replace "Strong" / "Developing" status labels (V-002) — string-only changes
3. Investigate and fix `progress = 25 + filled * 18` (V-003)
4. Remove hardcoded artist format dropdown (V-004)
5. Fix all UTF-8 encoding issues (§6)
6. Add no-guarantee footer to Passport surface (§11B)
7. Wrap `JourneyLibrary` in `VITE_DEMO` guard (§17A)
8. Confirm `netlify.toml` does not exist (§17B)

### P1 — Gate-1 missing screens (cannot ship without)
9. Payment / offer presentation screen (OfferCard + PaymentState)
10. Manual payment activation in Operator UI (concierge queue)
11. Evidence upload sub-flows (8+ states per B4-35.30 §7.8)
12. Magic-link Source Confirmer entry + orientation screens
13. Decline / Cannot assess / Wrong person paths for Source Confirmer
14. Contextual consent gates (split entry consents into contextual triggers)
15. Concierge claim-processing UI — Gate-1 operator scope (§5E)
16. Server-side publication validation (§17D)
17. RLS implementation and test suite (§16)
18. Beta label "Controlled beta / בטא מבוקרת" on all authenticated screens (§11A)
19. Anthropic API stub + human-review queue wiring (§17C)

### P2 — UX completeness (needed for first booker reaction)
20. Authenticated entry for Booking Professional
21. Event-context form before availability request
22. ProofUnit expand/drawer interaction
23. Empty and error states (global — including media failure in PassportRenderer)
24. Hebrew locale activation (remove "Soon" gate — V-005)
25. Wire or remove orphaned SmartOnboarding stages (connect/reveal/review)
26. DiscoveryCandidateCard — 4 states (§12)
27. FeedbackLauncher — persistent floating affordance (§13)
28. IncorrectInformationReport — at Proof Unit level on Passport (§13)
29. Notification architecture — email delivery only at Gate-1 (§15)
30. Visual regression snapshot set — 14 required (§14) — gates any design-release PR

### P3 — Full Beta (schema-ready, UI deferred)
31. Agency/Management workspace UI
32. Trust Operator full workspace
33. Forward-to-decision-maker sub-screen
34. Request-specific-proof sub-screen
35. RoleContextSwitcher (C05) full implementation
36. Push notification delivery (post email baseline)
37. Venue programmer persona (pending Maria decision — see §2 open question)

---

*End of UX Gap Analysis — July 2026, v1.1*  
*Claude does not write code. This document is a brief for Codex.*  
*Re-generate from source audit when prototype changes.*
