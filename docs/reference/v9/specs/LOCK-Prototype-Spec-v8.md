# LOCK — Prototype Spec

> **Changelog (latest): UI-explainer purge — audit of all literal captions (60+ chars, text-3) across 30 screens.** RULE APPLIED: trust/firewall/methodology captions are product value — KEEP; captions that explain how the UI works are design failures — CUT or the UI carries it. FIXED (6): Artist-advance "Tap an item…" deleted (obvious tap); Rep-onboarding duplicate teammate explainer deleted (short one kept); Radar lens prompt tightened to "Who are you about to face today?"; Rep-panel 3 tab explainers tightened to ≤8-word labels. VERIFIED: zero adjacent double-eyebrow stacks product-wide; remaining captions classified KEEP (firewall notes, provenance basis, pilot-economics, confirmer privacy — interpretation is the product).

> **Changelog (previous): Brand-design audit — full sweep, fixed, re-audited.** Per-screen grammar scan (30 blocks: H1 sizes · eyebrow tiers · dialog titles · grabbers · chips · CTAs). FIXED: (1) screen-title H1 normalized to 19px/800 — Admin "Signal cockpit" 18→19, notification headline 18→19 (Growth KPI numeral 18px lime kept — data, not heading); (2) 43 status pills normalized to canonical padding 2px 10px (was 5 variants); VERIFIED CONSISTENT: one grabber style product-wide, one dialog-title size (15px/800), two-tier eyebrow grammar (lime = section divider · grey mono = metadata label) applied consistently, lime CTAs within budget on every screen.

> **Changelog (previous): PRO defect sweep — audit→fix→re-audit.** Programmatic sweep of the whole template. FIXED: (1) color drift — 13 off-palette reds (#EF8B8B ×8, #E06A5A ×5) normalized to canonical danger #C94F3F; (2) 11 legacy purple-dark #100e1a surfaces (old-theme remnant) tokenized to var(--surface-2); (3) 18 clickable <div onClick> elements given role="button" (a11y); (4) 21 <input> fields raised to min-height:44px (touch DoD). VERIFIED CLEAN: semantic status hexes (#6FD99A success / #E28438 warning / #C94F3F danger / #F2C063 amber) are consistent constants; "204 buttons w/o min-height" were hole-styled ({{ }}) — styles live in logic and already carry heights.

> **Changelog (previous): Top-to-bottom container audit (Master Checklist M/L).** Programmatic text-to-visual scan of all 31 labeled screen blocks. (1) Worst prose-run — Slot-detail advance-request sheet: "Missing: X · Y" prose CONVERTED to a visual checklist (dashed-circle rows + MISSING mono chips). (2) Apparent worst offenders (Confirmer, onboardings, Signup) are bounded/choice screens whose glyphs render via holes — metric blind spot, visually acceptable. (3) Remaining long-prose runs are deliberate trust/interpretation captions — KEEP. (4) Roster/Opportunities/Passport already recomposed. Entity ruling: Artist 🟢 Rep 🟢 Production 🟢 Recipient 🟢 Confirmer 🟢 Admin 🟡 (D5 pending).

> **Changelog (previous): Master Checklist — system-layer pass (fix the shared layer, not per-screen patches).** Foundations-level fixes propagated product-wide: (1) **Readability floor** — no user-facing text below 9.5px: 36×8.5px and 45×9px raised. (2) **Radius scale normalized** to 3/6/10/12/14/16/22/999 — 17 strays mapped. Layer audit: 36 lime eyebrows (deliberate grammar), 104 lime CTAs / 47 screens (within one-per-decision-area), 475 bordered containers (border reduction = P1 per-archetype, not a blind sweep).

> **Changelog (previous): Human-Centered Re-Architecture — Wave 1 complete (all 5 P0 screens).** Opportunity Case + Buyer Passport recomposed (see below). **Lineup board:** added a NEXT-DECISION row directly under the lineup progress bar — "Next: the 01:00 peak slot — a best-fit candidate is waiting on your decision ›" navigates straight to Slot detail; new-event variant gets a static next-step line (send invite link / add slots). First viewport now = event card → progress → next decision → stage tabs. **Composer** verified already accordion-single (one section open at a time) — no change needed. **Roster** previously recomposed in the attention-merge wave. **Buyer Passport (all 6 recipient views):** full fact list + provenance behind a per-persona expander; STRONGEST PROOF + at-a-glance remain the focal Proof layer. Lineup: redundant coverage caption under stage tabs removed.

# LOCK — Prototype Specification v8

**Artifact:** `LOCK Prototype.dc.html` — single interactive prototype, **47 indexed screens/states** (display numbering: see the Screen Index Map, v8.4), mobile 390 in a phone frame.
**Language:** English only. Hebrew + RTL is Phase 2 and is not designed yet.
**Reference act:** Roy Sason / SHIDAPU (Goa · psytrance, Tel Aviv) with a second act, N.Söf, used to prove isolation.
**Date:** 28 July 2026 · last updated 9 August 2026

> **Numbering note.** Screen numbers inside Sections 4–5 and Part II are the ORIGINAL v8 preset ids (the 39-state index of 28 Jul). The live sidebar has since grown to 47 rows and renumbered; the authoritative display numbers are ONLY in the **Screen Index Map (v8.4)** below. When Maria says "screen N", resolve N against the map, never against Section 5.

---

## 0. How to read this document

- **Section 1–3** — what the product is, who uses it, and the two-surface rule that governs everything.
- **Section 4** — the end-to-end processes, in the order a real user meets them.
- **Section 5** — screen-by-screen contents: what each screen shows, its one job, its primary action, and what it must never show.
- **Section 6** — the design system as implemented.
- **Section 7** — the rules the product must not break.
- **Section 8** — priority: what is built, what is next, what is missing.
- **Section 9** — open decisions that need an owner, not an engineer.

Every screen number in this document matches the numbered index in the prototype's left sidebar.

---

## 1. Product definition

LOCK is a pre-booking intelligence product for live-music professionals. It does two different jobs on two deliberately different surfaces:

| Surface | Job | Mode | Main user | Outcome |
|---|---|---|---|---|
| **Radar** | Understand, collect, review, govern and improve the artist's professional information | Private working environment | Artist, and scoped collaborators | The artist knows what LOCK holds, corrects it, strengthens it, and decides what may go public |
| **Passport** | Present the artist persuasively to one specific recipient | External evaluation | Booker, producer, representative, private client | The recipient understands the artist quickly and performs one relevant commercial action |

**The rule that separates them:**

> Radar may say "here is what needs your attention."
> Passport must say "here is why this artist is relevant to you."

Consequences, enforced in the prototype:

- No readiness meter, completion percentage, gap list or coaching prompt appears inside Passport.
- Passport shows only: publication state, what is included in this recipient view, a non-intrusive integrity alert, and one route back to Radar.
- Radar holds everything: gaps, N/A, conflicts, candidates, private values, coverage percentages.

---

## 2. Entities and access

| Entity | Surface access | Notes |
|---|---|---|
| **Artist / act owner** | Full private Radar + Passport composer | Owns every decision about what becomes public |
| **Act member** (band, hybrid live) | Per-act permission | Confirms their own details; shows as `LISTED` until they do |
| **Manager / independent rep** | Scoped view of granted artists — never the artist's private Radar automatically | Personal identity; invoices sit with them |
| **Agency assistant / junior agent** | Same scoped view as the manager they work for | **The actual daily user of the roster surfaces.** Principals do not touch their own data. Design Roster and Inbox as a working desk for someone with forty open threads and no authority to decide — not as an executive dashboard |
| **Agency / label** | Organization workspace with teammates and roles | Registered name + company number required before invoicing |
| **Production / promoter** | Event workspace only. No Radar access | Club/festival = business branch; private event = simplified branch |
| **Booker / buyer** | One recipient-bound Passport view | Cannot switch recipient role |
| **Private / corporate client** | Same, in plain language | No industry jargon |
| **Source confirmer** | One bounded claim, no account | Cannot see anything else |
| **Operator / admin** | Operational queues under audit | Not the artist's notification centre |

**Permission inheritance rule:** a teammate invited by a manager inherits only what the artist granted the manager. Nothing more.

---

## 2b. Artist maturity — three levels, one product

Entity type says *what* someone is. Maturity says *what they are missing*. The prototype currently designs for one level and assumes the others.

| Level | Who | What they actually lack | What LOCK owes them | Built? |
|---|---|---|---|---|
| **Starting out** | No manager, no footprint, real talent. A first paid gig may not have happened yet. | Not information — **judgement**. What to charge, what a safe booking looks like, when to say no. Works for exposure because nobody told them not to. | A floor, not a dashboard: what a booking must include before you agree to it, and language to ask for it. | Partly — screen 22 handles "we found nothing"; nothing handles "I don't know what to ask for" |
| **Working independently** | Earns from the craft, books themselves, hits a time ceiling. | Time. 70% of the week goes to chasing, formatting and re-explaining. Data is scattered across five platforms. | Exactly what is built: one governed record, one recipient-bound link, one inbox. This is our primary user today. | Yes |
| **Represented** | Managed by an office with real budgets. | Speed. Municipal and corporate money arrives on shotef+60/90. | Roster operations, scoped access, one action per artist. Cash-flow financing is refused this phase (Open-Decisions D2/G1). | Roster yes · financing no |

**Design consequence.** The reference act (SHIDAPU) is level 2 with a 25-year history, so every screen was designed against a rich footprint. A level-1 artist meets the same screens with almost nothing in them. The gap is not empty states — those exist — it is that nobody tells a beginner what a fair booking looks like.

**What that is not.** It is not a price recommendation, and it is not a contract the platform enforces. It is a checklist an artist can read before saying yes: is the date fixed, is the format named, is the fee stated, who pays and when, who confirms. Refusing to guess a number and still making someone safer is the distinction.

## 2c. Language rules — what the artist reads

Category names are the most-read text in the product, so they are written as things a person would say, not as data-model labels. The canonical segment numbers (01–18) stay for engineering; the artist never reads the internal name.

| # | Internal group | What the artist reads |
|---|---|---|
| 01 | identity resolution | Your name and profiles |
| 02 | positioning | How you describe yourself |
| 03 | catalogue | Your music and releases |
| 04 | differentiation | What makes you different |
| 05 | streaming consumption | Where people listen |
| 06 | audience | Who follows you, and where |
| 07 | content | What you post |
| 08 | owned community / CRM | A channel you own |
| 09 | live footprint | Where you have played |
| 10 | event economics | Who turns up when you play |
| 11 | commercial offer | What you offer, and for how much |
| 12 | reputation | People who vouch for you |
| 13 | industry network | Who you work with |
| 14 | legal & rights | Paperwork a buyer will ask for |
| 15 | technical readiness | What you need on stage |
| 16 | team | Who works with you |
| 17 | monetization | How you earn |
| 18 | trajectory | Where your career is heading |

**Rules that follow from this.** No word appears on an artist-facing screen that the artist would not use out loud: no *entity resolution*, *CRM*, *monetization*, *governed*, *payload*, *derived*, *candidate*. The eight evidence methods are already written this way — "You told us", "Confirmed by the other side", "Observed by LOCK" — and the same standard applies everywhere. Internal vocabulary lives in the design-system gallery and in this document, which is where engineers read it.

## 3. The information model

### 3.1 Six planets, eighteen categories

Every fact belongs to one of 18 canonical segments, grouped into six planets. This grouping is canonical — the prototype was corrected to match it.

| Planet | Segments |
|---|---|
| **Identity** | 01 Identity & entity resolution · 02 Positioning & brand · 04 Creative quality & differentiation |
| **Music** (Your Sound) | 03 Catalog / repertoire · 05 Streaming consumption & discovery |
| **Audience** (Your Crowd) | 06 Audience & fanbase · 07 Social & content engine · 08 Owned community / CRM |
| **Live** (Your Stage) | 09 Live footprint & performance capability · 15 Technical & production readiness |
| **Proof** (Your Track Record) | 10 Ticketing, draw & event economics · 11 Booking market & commercial offer · 12 Reputation, trust & reliability · 13 Network & industry access · 18 Career trajectory & opportunity fit |
| **Pro Kit** (The Essentials) | 14 Business, legal & rights readiness · 16 Team, management & execution · 17 Monetization & commercial health |

Each segment has a stable icon key (`identity-linked`, `ticket-ledger`, `observed-trajectory`, …) and one LOCK-owned glyph. A platform logo is never a category icon.

### 3.2 The eight evidence methods

A fact may enter LOCK in exactly eight ways. Every category row and every source row states which one applies.

| Method | Shown as | Meaning |
|---|---|---|
| `candidate` | Possible match | Found publicly, confirmed by nobody |
| `connected` | Connected account | Read with permission from the platform itself |
| `declaration` | You told us | The artist's own statement |
| `document` | Document on file | Read from an uploaded file |
| `artist-confirmed` | You confirmed the source | A public page the artist reviewed and claimed |
| `counterparty` | Confirmed by the other side | A promoter, venue or label confirmed one bounded fact |
| `specialist` | Specialist-reviewed | Checked by a lawyer or accountant, in scope |
| `derived` | Observed by LOCK | Calculated from held records — never a prediction |

**Hard rule:** AI may search, cluster and propose. AI may never turn a public find into a confirmed fact. Silence is never confirmation.

### 3.3 Five visual layers that must stay separate

1. **Category icon** — the LOCK segment glyph.
2. **Platform logo** — where information came from. Means only "this source is Spotify."
3. **Source-type icon** — non-platform sources: document, contract, venue, label, settlement.
4. **Method badge** — how LOCK knows it.
5. **Workflow state** — possible match, needs review, stale, conflict.

A coloured platform logo must never read as "verified".

### 3.4 What may reach Passport

```
supported AND passport_eligible AND artist_approved AND fresh
AND recipient_allowed AND not_conflicted AND valid_for_active_act
```

---

## 4. End-to-end processes

### 4.1 Artist — first run

```
1  Sign in / create account            → screen 1
2  Choose what to do first             → screen 2
3  Act seed: name + one link           → screen 4   (STEP 1 OF 2)
4  Discovery runs                      → screen 5
5  2A · confirm each find              → screen 5   Yes, mine / Partly mine / Not sure yet / Not mine
6  2B · act type + genres              → screen 5   opens only when 2A is answered
   6b Members block                    → screen 5   only for Band/ensemble (F4) or Live-electronic (F5)
7  Radar                               → screen 6
```

Empty result path: screen 22 — "TELL US INSTEAD" with the same act-type and genre controls, plus manual source entry.

Gating: every CTA states what is missing ("Pick a genre to continue", "Enter your password") and is disabled until satisfied.

### 4.2 Artist — daily loop

```
Radar (6)
  ├─ Universe view    → planet → inspector (7/8) → category rows with method + state
  ├─ Shape view       → 6-axis spider, today vs 30 days ago, tap a vertex to open it
  └─ Scene view       → Benchmark | Peers | Moves
Coach panel           → one recommended next move, collapsible, sticky
Look again            → re-scan, shows only what is new since the last look
Add the night         → post-gig debrief
```

### 4.3 The post-gig cycle (the core flywheel)

```
Gig happens
→ trigger appears in Inbox and on Radar
→ STEP 1: pick what exists (poster / set video / settlement / photos)
→ STEP 2: ask one person to confirm one fact + choose visibility
→ Save
→ Receipt: what was added, what was sent, what changed in the recipient views
→ Your Stage advances; the trigger closes itself and moves to Done
```

The receipt is mandatory. A cycle that ends in a toast is not a cycle.

### 4.4 Publish and share

```
Passport composer (9)
  publication state + integrity alert + route back to Radar
  preview as recipient → 18
Share (10)
  choose recipient → "You are sharing: Booker view"
  set expiry (7 / 30 days / none)
  create link
  manage sent links: ACTIVE / EXPIRED / REVOKED, revoke or replace
```

### 4.5 Buyer journey

```
Shared link → Public Passport (18)
  context banner: "Shared with you as a booker — SHIDAPU chose what appears here"
  identity → media (play) → relevance → evidence by area → sticky CTA
Check availability (19)
  minimum contact + event context → receipt
Artist Inbox receives the enquiry with its context attached
```

Dead-link states (27): unpublished, revoked, expired, replaced — each privacy-safe, each with a permitted next step.

### 4.6 Source confirmer

```
Magic link → one claim (20)
  Confirm this detail / Correct one detail / This is not correct / This is not me / I can't confirm
  correction cannot be submitted empty
Terminal states: already answered (28) · wrong person (29)
```

No account, no marketing, one reminder.

### 4.7 Representation

```
Rep onboarding (12)   STEP 1 who you are: just me | a company
                      company → registered name + VAT
                      STEP 2 teammates: invite by email, role = Admin | Agent | View only
Roster (13)           grouped by workflow, not by score
Artist panel (14)     acts inside granted permission
Pending access (23/31) both sides of the lifecycle
```

**4.7.1 Representation as a revenue command center (strategy, Aug 5).** The rep's income depends on three daily jobs, ranked by proximity to revenue: **respond fast** to buyer enquiries (the money moment, time-decays), **keep proof fresh** (stale proof loses deals), **unblock consent/access**. The Roster is therefore a triage board, not a directory, ordered in revenue lanes:

```
Roster board — lanes, top to bottom:
  WAITING ON A REPLY   open buyer enquiries across ALL managed acts — the money surface.
                       Reply-on-behalf from the board (sheet), never leave to reply.
  NEEDS YOU NOW        next move / pending consent / getting stale (proof at risk or blocked)
  READY TO SHARE       settled acts, nothing to do — calm, below the fold
```

Every card carries exactly one verb (Reply · Refresh · Nudge · Share). Lime accent is reserved for the money action (reply/close); amber = decay; neutral = settled. The rep never had an aggregated enquiry surface before — enquiries lived only inside each artist's Inbox — so the WAITING ON A REPLY lane is the closed P0 gap: it makes the money moment reachable in one place with reply-on-behalf.

**4.7.2 Add an artist — recognition & invitation flow (spec, Aug 5).** A rep adds an act by name + one link. The system then resolves one of two paths, and consent always sits with the artist:

```
Rep enters: artist name + one link (or pastes a list)
   │
   ▼  system matches name/link against LOCK
   ├─ ALREADY ON LOCK ──► artist gets an in-app "X wants to represent you" request.
   │                       Rep card shows PENDING CONSENT until the artist approves scopes.
   └─ NOT ON LOCK ──────► rep gets a shareable invite link to send the artist.
                           Opening it = artist signs up + lands on the exact approve-scopes screen.
                           Rep card shows INVITE SENT until they join and approve.
```

Rules: the rep never gains access by adding — only the artist's approval opens anything; scopes (update · share · reply) are artist-approved per permission; a rep may withdraw a request and an artist may revoke access at any time (§ removal flow). **Wrong name / edit:** every parsed or entered artist is editable *before* creation — a row shows "Wrong name? Edit" that returns to the entry field; after creation a wrong entry is handled by the removal/withdraw flow, never a silent overwrite. Duplicate and "already yours" rows are flagged, not created twice.

**4.7.3 Roster tabs (proposal — UX spec).** Two viable structures for the Roster, to be chosen:
- **A · Lanes (current):** one scroll, three stacked lanes (Waiting on a reply → Needs you now → Ready to share). Best when the roster is small; everything visible at once.
- **B · Tabs:** segmented control at top — **All · Waiting (n) · Needs you (n) · Ready (n)** — each tab filters to one workflow, count badges on each. Best at scale (20+ acts) where a single scroll is too long. Tab bar uses the DS `tabBtn` (solid-lime active) with the same count-badge component as the Inbox/Notifications tabs. Default tab = Waiting (money first). The lane eyebrows become the empty-state headers inside each tab.
Recommendation: ship lanes now, switch to tabs when a roster crosses ~8 acts; the card design and grouping logic are identical, so the switch is presentation-only.

### 4.8 Production

```
Prod onboarding (15)  club night | festival / production office | private event
                      business → venue or company name + production team
                              team roles = Can confirm | Books only | View only
                      private → reply contact + who confirms and pays
Lineup (16)           slots, candidates
Add event (37)
Slot detail (17)      per-requirement event fit only — never a total score
```

### 4.9 Notifications — the Action Inbox

Four tabs: **Needs you · Updates · Later · Done**. The badge counts unresolved items only.

Priority is expressed in words, not codes:

| Class | Wording | Meaning |
|---|---|---|
| P0 | NEEDS YOU NOW | Consent, access or published-integrity risk |
| P1 | SOMEONE IS WAITING | A person or deadline is blocked on you |
| P2 | WORTH DOING SOON | Act soon; no interruption needed |
| P3 | JUST SO YOU KNOW | Insight, no obligation |

Card structure: **act → what happened → why it matters / who is waiting → real deadline only if one exists → one precise action**, plus Later and "Already handled".

Grouping: seven finds become one card, never seven notifications.

### 4.10 Admin — Signal Cockpit (INTERNAL, autonomous)

**Governing rule: the operator never does manual work.** Ingestion, extraction, identity matching and verification run end-to-end by AI. The cockpit is a set of **dashboards that report findings, failures and places to improve** — not a work queue. The only human touch is a rare one-tap decision on a low-confidence item the AI cannot decide alone. Subline reads: *"Findings from the automation — what it did, where it needs help, what to improve. You run nothing by hand."*

Five tabs:

| Tab | Job | Content |
|---|---|---|
| **Gate** | Is the validation loop moving? | Seven canonical counts as tappable rows, each opening the records behind it (Published→Passport, Reactions/Requests/Conversations→Inbox, Confirmations→confirmer, Blocked→Auto). A stalled-stage alert with six fields: entity · state · severity · reason · **Handled by: LOCK auto-agent** · **Auto-action taken** (never "Owner: Maria"). |
| **Auto** | What did the automation do? | "What the automation did": artifacts ingested, claims extracted by AI, identities auto-matched, auto-confirmed via source (all hands-free) + "AI flagged for a decision — N, one tap each" as the only exception + conflicts auto-held. Confirmations sub-queue as chips (pending/responded/declined/expired/off-platform). |
| **Signals** | Demand vs supply | Two columns for the current sample, evidence-coverage bar, two plain-language reads (e.g. the Publish→Share cliff). |
| **P&L** | Costs vs revenue | Three cards: Revenue ₪0 (pilot — not charging) · Cost/mo (auto-tallied) · Net (signal investment). "Where the money goes" bar breakdown (AI scans, infra, data/APIs, messaging). Unit economics: cost per active artist, per confirmed evidence, break-even at ₪29/mo. Read: costs scale with AI usage, not headcount. |
| **Privacy** | Amendment 13 ops (P0) | Consent, deletion, export, minimization, suspicious-access rows; logged view-as-user. |

**Never:** any composite score, sum or ranking of an artist; any row that asks the operator to produce, review or reconcile data by hand; any payer/entitlement dashboard while the pilot is not charging (one honest line on Gate instead).

All figures are illustrative pilot-scale placeholders wired to real queues — live telemetry swaps into the same arrays.

---

## 5. Screen inventory

Legend: **Job** = the single thing the user does here. **Never** = what must not appear.

### Entry & shell

| # | Screen | Contents | Primary action | Never |
|---|---|---|---|---|
| 1 | Login | Email + password with validation, show/hide, loading, error + reset path, Google, return-to banner | Continue | Silent failure, dead reset link |
| 2 | Intent | Three goal cards: build my artist profile / manage my artists / plan an event | Choose a starting point | Locking the account into one role |
| 3 | Workspace hub | Person, authorized workspaces, workspace type + role | Open workspace | DEMO labels, plan/billing language |
| 36 | Hub first-run note | Same, with the explanation that workspaces are isolated | Open workspace | — |
| 38 | Notifications | Action Inbox, four tabs, priority chips, receipts | The card's own action | Uncleanable badge, surveillance lines |

### Artist

| # | Screen | Contents | Primary action | Never |
|---|---|---|---|---|
| 4 | Onboarding | Act name + one link, privacy reassurance, step 1 of 2 | Find my profiles | Act type or genre here |
| 5 | Discovery | 2A decision cards (4 answers each), then 2B act type + genres, then members if F4/F5 | Enter your universe | Auto-accepting a find |
| 22 | Empty discovery | Manual source entry + the same act/genre block | Save this and open my Radar | Treating empty as failure |
| 6 | Radar | Act header, watch/rescan row, gig row, Universe / Shape / Scene, coach | Open the coached move | Score, rank, peer overlay in public |
| 7 | Planet inspector | Sources (max 4 + N more), method summary, freshness line, 18-segment rows with id + glyph + method + state, next action | Review this category | Platform logo as verification |
| 8 | Inspector — identity | Same component, identity planet | Review | — |
| 9 | Passport composer | Publication state, integrity alert, preview-as-recipient chips, sections, visibility toggles, evidence grouped by segment | Preview this view | Readiness %, gap coaching, "Artist Assets" bucket |
| 10 | Share | Recipient choice bound to the view, expiry, sent-link manager with revoke | Create share link | Message-only recipient change |
| 11 | Inbox | Enquiries / access / share activity. A live enquiry card states what the buyer gave and **what they did not** ("They did not say who they are, payment terms") | Open enquiry | Mixed jobs in one feed; reporting recipient viewing behaviour |
| 24 | Stale enquiry | Contextual actions: refresh & reshare, archive | Refresh & share | Red for stale |
| 25 | Save failed | Draft preserved, previous version still active | Try again | Losing work |
| 26 | Multi-act | Acts, create separate act | Switch / create | Copying evidence across acts |
| 30 | Account & access | Profile, contacts, pilot access, log out | Save changes | Pricing, plans |
| 32 | Second act | Radar for N.Söf | — | Cross-act leakage |

### Public / buyer

| # | Screen | Contents | Primary action | Never |
|---|---|---|---|---|
| 18 | Public Passport | Atmosphere band, identity band, context banner, media play card, evidence grouped by area, sticky CTA, method footnote | Check availability | Recipient switcher, gaps, internal metrics |
| 19 | Enquiry sheet | Event date + type, genre when relevant, **who is booking** (private / venue / company / public body), and for institutions: **budget commitment number** and **payment terms** (on the night / shotef 30-60-90), reply channel, receipt | Send to the artist — gated on event type + reply channel | Submitting without a reply destination; making institutional fields mandatory to ask a question |
| 27 | Unavailable link | Distinct safe states + permitted contact | Contact the artist | Leaking previous content |

### Confirmer

| # | Screen | Contents | Primary action | Never |
|---|---|---|---|---|
| 20 | One claim | The exact statement, five distinct responses, correction field gated | Confirm this detail | Account creation, blank correction |
| 28 | Already answered | Minimal reference + close | Close | Re-asking |
| 29 | Wrong person | Closed, distinct from "no longer authorized" | Close | Implying fault |

### Representation & production

| # | Screen | Contents |
|---|---|---|
| 12 | Rep onboarding | Two-step: identity (person/company) → teammates with roles |
| 13 | Roster | Grouped by workflow; "2 artists need you today" |
| 23 | Pending consent | Roster with the pending state in focus |
| 14 | Artist panel | Scoped actions with permission visible |
| 31 | Pending access | Both sides of the lifecycle |
| 15 | Prod onboarding | Kind → business (venue/company + team roles) or private (contact + payer) |
| 16 | Lineup | Event, slots, candidates |
| 37 | Add event | Event basics |
| 17 | Slot detail | Per-requirement event fit, request missing info |

### System

| # | Screen | Contents |
|---|---|---|
| 21 | Operations | Gate metrics, queues, system health |
| 33 | Deep links | Routing states (QA harness) |
| 34 | Reduced motion | Accessibility state (QA) |
| 35 | Keyboard | Accessibility state (QA) |
| 39 | Design system | Five layers, 38 numbered sections |

### Screen templates

Every one of the 39 states is one of six templates. A screen that fits none of them has not been designed yet.

| Template | States | Anatomy |
|---|---|---|
| **Entry** | 1–3, 36 | Centred column, no nav, one primary CTA |
| **Flow** | 4, 5, 12, 15, 22 | Stepper, progressive disclosure, CTA locked until answered |
| **Instrument** | 6, 13, 16, 21 | Context header, segmented views, collapsible coach, sticky CTA |
| **Record** | 7–9, 14, 17, 30 | Underline tabs, list rows, source drawers |
| **Recipient** | 18, 19, 27 | Media-led hero, context banner, one sticky CTA, no private data |
| **Terminal** | 20, 25, 28, 29 | Status disc, one sentence, one exit |

---

## 6. Design system as implemented

Screen 39 is the canonical gallery: five layers, 38 numbered sections.

### Layer 1 — Foundations
- **Type:** Manrope (UI) · Georgia (editorial headlines) · DM Mono (method and metadata only). Sizes 8 – 24, no one-off values.
- **Colour:** neutral foundation, one lime action accent, status set = confirmed `#6FD99A` · found `#F2C063` · developing `#46DCC2` · review `#E28438` · na `#9AA29B` · danger `#C94F3F`. Documented contrast pairs only.
- **Spacing:** even steps 2–26. **Radius:** 3 bar · 6 micro · 10 control · 12 inner · 14 card · 16–24 sheet/device · pill.
- **Elevation:** four levels; a shadow always means "this sits above".
- **Motion:** five named animations; reduced motion keeps the static end state.
- **Icons:** one stroke family, 24 grid, 1.6 stroke, currentColor. No emoji anywhere in product UI.

### Layer 2 — Atoms
LockButton (4 variants · 2 sizes 36/44 · 3 states) · LockChip (8 variants) · method labels · LockInput · toggles/checkbox/radio · avatars & badges · status discs · progress · skeleton.

### Layer 3 — Molecules
LockCard · one row recipe with four payloads · LockSheet · underline tabs **vs** segmented switch (with the rule for each) · stepper + locked step · context banner · one toast with two tints · navigation · image slots.

### Layer 4 — LOCK patterns
Planets · 18 category icons · 8 evidence methods · spider chart (private only) · benchmark row · decision card · media play card · source icons · event slots · link lifecycle · promo/empty · paper card.

### Layer 5 — Screen templates
Screen anatomy diagram + the state→template map above.

### Recipient privacy
LOCK does not report whether a shared link was opened or what was read. Link rows state delivery and expiry only. The signals we do surface are actions a recipient chose to take: an enquiry, a question, a document request.

### Enforced layout rules
- One lime primary CTA per screen. Nothing else is lime.
- Coach/guidance is one collapsible panel, never inline prose.
- Sticky CTA over scrolling content with a gradient scrim.
- 16px gutters, cards 14px radius, min target 36px (44px for primary).
- Bottom nav: max 3 destinations per role.
- Empty and terminal states: status disc + one sentence + one next step.
- An image slot is never placed under text and never narrower than ~120px; anything smaller is a plain avatar.

---

## 7. Prohibitions

### Product
No artist quality score · no rank · no percentile · no bookability number · no predicted demand · no named-artist overlay in public · no treating streaming as ticket draw · no auto-promotion of a public find into truth · no cross-act data transfer · no gap presented as personal failure · no N/A shown as weakness · no silent publication.

### Passport
No missing-information prompts · no improvement coaching · no unresolved conflict · no N/A placeholder · no source-free claim · no generic "Verified" · no recipient role switcher · no exact private value where a range is authorized.

### Comparison
No composite total · no leaderboard · no "you are behind X%" · no comparison of incomparable formats, periods or territories · no exposure of a peer's private data · no encouragement to copy music, look or words. Every peer states why it was suggested, what to learn, and what not to infer. Every peer is removable.

### Notifications
No fake urgency · no streaks · no guilt about incomplete information · no uncleanable badge · no "someone viewed your Passport again" · no marketing through operational channels · one reminder by default.

### Design
No emoji · no platform logo as a category icon or as proof · no colour as the only status carrier · no second tab pattern in one screen · no hard-coded hex outside the theme layer · no value off the documented scales.

---

## 8. Priority

### Built and working
Login with real validation and recovery · intent · workspace hub · artist onboarding with entity confirmation, act families F1–F6 and multi-genre · discovery with four answers and progressive disclosure · members block for F4/F5 · Radar with three views · spider chart · scene benchmark with cohort basis · Peer Lab · Opportunity Map · planet inspector with 18 segments, methods and freshness · Passport composer without coaching · recipient-bound share with expiry and revoke · public Passport, media-led · buyer enquiry · source confirmer with gated correction · rep onboarding with company and team roles · production onboarding with private/business fork · roster, artist panel, access lifecycle · lineup and slot detail · operations · Action Inbox with four tabs, priority classes and receipts · post-gig debrief with a state-changing receipt · design system, five layers.

### Next (P0 gaps)
1. **Category workspace** — a category is still a row inside a bottom sheet. It needs its own surface: Overview · Information · Sources · Conflicts · History · Passport use.
2. **Claim detail** — govern one bounded fact: confirm, correct, keep private, dispute, request confirmation, archive; original source always preserved.
3. **Source drawer** — full provenance: entity, URL or artifact, method, observed date, limitation, affected fields, replace/disconnect.
4. **Conflict resolution** — two values side by side with source and date; never averaged.
5. **Publish review** — an explicit publication step showing exactly what changes, what stays private, and which recipient views are affected.

### After that (P1)
Discovery centre with source families and background running · confirmation queue with batch review · changes & freshness surface · career trajectory · booking lens per opportunity type · reference library · shared-link activity · post-event closeout on the production side · team assignment across roster.

### Not started (P2)
Audience-to-live loop · utility invitations · governed data learning · territory intelligence · collaboration finder.

---

## 8b. Entity architecture — dev handoff contract (meta-fields)

Demo names in the prototype (SHIDAPU, Zion 604, Zamna, Maya/Yael/Noa…) are **seed data only**. Every screen binds to the fields below.

**Identity principle — one person, many hats:** `user{user_id, workspace_memberships[]}`. A role is a property of a **workspace membership**, never of the person — the same user can simultaneously be an artist (own Act), represent other artists (agency seat) and produce events (production seat). The hub/avatar is the single switch between hats; each workspace keeps its own nav, notifications scope, permissions and data isolation. Signup captures the *first* intent only and must never store it as a permanent identity.

### ARTIST
- Workspace: `workspace(type=act, act_id)` — one governed universe per Act; a user may hold N acts.
- Bottom nav: `radar` · `passport` · `inbox`.
- Top bar: `logo` · `notifications(scope=act_id)` · `avatar(user_id)` → hub: `act_switcher`, `account`.
- Core object: `claim` — `{claim_id, act_id, category, value, source_id, method, state: candidate|confirmed|stale|conflict, visibility, confirmed_at, freshness_days}`.
- Supporting objects: `source{source_id, kind: platform|link|file|counterparty, url, extracted_at, confidence}` — every claim points at one; `passport{act_id, version, state: draft|published|superseded|revoked, sections[], recipient_orderings{view→section_order}}` — what share_link resolves against.
- Screen KPI (never rendered): Radar = claim freshness/coverage; Inbox = first reply < 24h.

### REPRESENTATION
- Workspace: `workspace(type=agency, org_id)` — seats `role: owner|agent|assistant|viewer`.
- Bottom nav: `roster` · `opportunities` · `inbox`.
- Top bar: `notifications(scope=org_id)` · hub: `workspace_switcher`, `team_settings(org_id)`.
- Core object: `mandate` — `{mandate_id, act_id, org_id, scopes[], state: requested|granted|declined|revoked|expired, audit_log[]}`.
- Boundary rule (locked 6 Aug 2026): **Roster = mandate lifecycle (artist-facing)** · **Opportunities = `case{case_id, act_id, counterparty_id, stage, owner_seat, due, thread[], approval{draft_text, drafted_by, approved_by, state}, receipts[]}` (buyer/production-facing)** · **Inbox = `enquiry` pre-triage + consent items**. No object appears with actions on two surfaces — secondary surfaces link to the owning one.
- Screen KPI: Roster = share-readiness; Opportunities = money in motion, nothing waiting on the agency; Inbox = first reply < 24h.

### PRODUCTION
- Workspace: `workspace(type=production, org_id)` — roles `owner|booker|producer|viewer` as permission bundles.
- Bottom nav: `today` · `events`.
- Core objects: `event{event_id, days[], stages[]}` · `slot{slot_id, event_id, stage_id, day_index, time, state: open|shortlist|case|confirmed|advancing|done, candidate_ids[]}`.
- Supporting objects: `invite{invite_id, slot_id, act_id, state: sent|viewed|accepted|declined|expired, brief_snapshot}` — the artist-side invitation the slot sends; `advance{advance_id, slot_id, items[{item, owner: artist|rep|production, state, due}], ready_count}` — the readiness sheet (“7 of 12 ready”); the Booking Case is the **same `case` object** as Representation's, viewed from the counterparty side — one deal, two windows, never two records.
- Today = 4 lanes over due slot-work (`needs_you|waiting|coming_up|done`); Events = structure.
- **Event state machine (locked 6 Aug 2026):** `draft` (created, slots defined, nothing sent) → `casting` (≥1 invite out or open link shared) → `fully_set` (every slot confirmed) → `live` (≤ show week: advance & day-sheet surfaces activate) → `done` (read-only history; acts feed rebook suggestions). Cancellation of a confirmed slot moves the event back to `casting` and dual-fires bell + Today. Events home tabs map: Casting = `draft|casting`, Upcoming = `fully_set|live`, Past = `done`.
- **Money on the case:** `case.money{fee, fee_state: proposed|agreed, invoice_state: not_issued|issued|paid|overdue, terms}` — rendered as the MONEY band in the Booking Case; the rep side reads the same record (“34 days unpaid” = `overdue`).
- **Conflict guard:** slot creation warns on a same-stage same-time collision (prototype checks start times; production should check full time ranges + artist double-booking across events).
- **Surface contract (locked 6 Aug 2026):** **Today** = the action queue — cross-event, derived, nothing lives there (cards deep-link into cases/slots). **Events** = the structure you build — tabs `Casting` (lineup incomplete) / `Upcoming` (fully set) / `Past` (read-only history). **Inbox** = anything waiting on YOUR reply or decision — slot replies (threads) AND open-link applications (decision cards: review/pass). **Bell** = what merely happened (Passport improved, invite viewed, candidate declined, advance progress); ignoring a bell item costs nothing — ignoring an inbox item loses an opportunity or blocks a person. An update that demands action (a cancellation) fires BOTH a bell item and a Today card — the bell tells, Today assigns.
- Screen KPI: Today = nothing unhandled by doors; Lineup = every slot set before doors.

### EXTERNAL RECIPIENT (booker / private host)
- No workspace, no nav. `share_link{link_id, act_id, recipient_view, passport_version, expires, revoked}` — one link = one recipient view = one published version.
- Can create: `enquiry{enquiry_id, contact, event_context, channel, state: new|replied|stale|archived, created_via_link_id}`.

### SOURCE CONFIRMER
- `confirmation_request{request_id, claim_id, recipient_contact, state: open|answered|wrong_person|expired, answer: confirm|partly|incorrect|cannot_assess}` — accountless, one claim, terminal; only `confirm`/`partly` strengthen the claim.

### ADMIN (internal)
- `system_signal{gate, metric, threshold_state, queue_depth}` — read-only dashboards; no manual work surfaces.

### Cross-cutting objects (used by every entity)
- `seat{user_id, org_id|act_id, role, state: invited|active|removed}` — team membership everywhere.
- `notification{notif_id, scope: act_id|org_id, kind: action|update, ref_object, read, grouped_ids[]}` — the bell; always workspace-scoped.
- `receipt{receipt_id, action, actor_seat, object_ref, timestamp}` — every persisted on-behalf action writes one; surfaces as “View the receipt”.

### Cross-entity rules
1. Bottom nav = daily work only (2–3 tabs today; up to 5 allowed, key screen centered — adopted only where 4–5 real daily surfaces exist).
2. Top bar = identity & management (bell scoped to workspace, avatar → hub → Team & settings).
3. One core object per entity; screens are views over it.
4. KPIs live in this spec, never rendered in the UI.
5. Multi-role: any user may hold any mix of workspaces; switching hats never mixes data — notifications, inbox items and permissions are always scoped to the active workspace, and a rep/producer hat never sees another Act's private Radar without a granted mandate.

## 8c. Information architecture — artist-value → entity-view flow matrix (9 Aug 2026)

Principle: one governed artist record; every consumer re-ORDERS and re-FRAMES it — never averages it, never gets a second copy.

| Artist value (source of truth) | Artist private (Radar) | Rep (mandate-scoped) | Producer (slot/advance) | Booker / private host (Passport) |
|---|---|---|---|---|
| Identity (name, family/subtype, base) | Who-you-are record, editable | Roster card + panel header | Candidate header | Hero + BASED fact |
| Sound (genres, releases, catalogue) | Sound planet | Growth stats, pitch | fit chips (genre) | SOUND / RELEASES / CAREER SPAN facts |
| Live history (dated shows) | Stage planet, per-claim state | Growth (+dated shows) | BOOKED BEFORE + fit evidence | RECENT STAGES fact + Live tab |
| Audience / reach | Numbers planet (% allowed private) | listeners/followers deltas | crowd-proof fit chip | Numbers band (if shown) |
| Offer (formats, terms) | Offer toggles + fee visibility mode | case MONEY context | slot format match | SET FORMATS fact + offer band |
| Trust (vouches, confirmations) | Trust planet | — (read via Passport) | counterparty-confirmed labels | VOUCHED BY + proof cards |
| Team & contacts | Network planet | contact card on case | People container on slot | TEAM fact (booking contact) |
| Media | Passport composer media | pitch kit | candidate view | Media band |

**Transactional meta objects (cross-entity, single record each):** `enquiry` (contact, channel, event ctx, state) · `invite` (slot→artist, brief snapshot, state) · `case` (thread, approval, receipts — one record, rep+producer windows) · `mandate` (scopes, duration incl. no-expiry, audit) · `advance` (items w/ owner artist|rep|production) · `receipt` (every on-behalf action) · `confirmation_request` (one claim, terminal).

**Known IA gaps (open):**
1. **Technical pack has no artist-side source.** Producer surfaces (Will-it-fit checks, rider/stage-plot rows, advance) consume rider/inputs/power/changeover data, but no Radar category or Passport section lets the artist provide it. Decision needed: add a Technical record to Radar (7th surface or under Offer) feeding the producer view. P0 for the data model.
2. **Availability** — by design, answered per-invite (no standing artist calendar); optional Google Calendar hold is one-way. Documented, not a bug.
3. **Streaming %s** — shown to artist and mandate-holding rep only; recipient views get bands/labels, never percentiles. Enforced.


**Full register: `LOCK-Open-Decisions.md`** — sections A–I, covering blocking questions, parked proposals with verdicts, the fintech/underwriting proposals, the multi-vertical proposal, and the proposed KPI set. Summary below.

1. **Six planets or seven worlds.** The older Radar model names seven user-facing worlds; the atomic registry names six implementation planets, and some categories move between them. The prototype is built on six. Confirm or replace.
2. **Named-peer comparison.** One document states artist-vs-named-artist is prohibited under current canon; R-12 approves private comparison with selected artists in the same genre. The prototype follows R-12. If that is wrong, Peer Lab is removed in one edit.
3. **Registry B — field-level applicability per family.** Without it, all 18 categories are shown to every artist family. Which segments are required, conditional, or not applicable for F2–F6?
4. **SOURCE-BRANDS registry.** Roughly 30 platform marks are currently hand-drawn letter tiles. Real assets need `official_logo_asset`, `allowed_usage`, `verification_implication`, `evidence_ceiling` per brand before the design system can claim logo coverage.
5. **Hebrew.** Segment names, category labels and all microcopy in Hebrew, plus RTL layout — not mechanical mirroring.
6. ~~**Tracking consent.**~~ Resolved 28 Jul: all "opened twice" reporting removed from the product. Link rows show delivery and expiry only.
7. **Cohort data source.** Scene Benchmark shows `n=42` with a stated basis. Where does the cohort actually come from, and what is the minimum sample before a comparison may render?

---

## 10. Definition of done — the short version

A screen is done when:

- it has one job and one dominant action;
- every visible control works or is honestly disabled;
- every write returns a receipt that names what changed;
- every fact shows its method and date;
- every empty, partial, stale, conflicted and error state exists;
- nothing on it implies a judgement of the artist;
- it is reachable and completable by keyboard, with visible focus;
- it uses only components and values from the design system;
- a first-time user can complete it without anyone explaining it.


---

## 11. Change log

| Date | Change |
|---|---|
| 9 Aug 2026 | **Rhythm & a11y gap-closure**: 4 drifted section eyebrows (THE THREAD, FACTS ONLY, BOOKED BEFORE, PLANNED—NOT MEASURED) re-aligned from muted gray to the canonical accent divider grammar; Back-placement audit passed (top-left ‹ in headers, Back+Continue rows in steppers, contextual lens returns in Scene — all conform to Layout Registry); 3 icon-only back buttons gained aria-labels (rescan, rep panel, slot detail). |
| 9 Aug 2026 | **Wireframe & Layout Architecture audit**: canonical layout system defined — 11 archetypes (L1 ROOT · L2 WORKSPACE · L3 EDITOR · L4 REVIEW · L5 QUEUE · L6 FOCUS/CASE · L7 LIVE · L8 EXTERNAL · L9 UTILITY · L10 STEPPER · L11 OPS) with zone grammar A–F, persona grammar, placement rules, sticky budget, and 2 justified exceptions — registered in `LOCK-Layout-Registry.md`. P0 drift fixed: Opportunity case 7 wrapped stage-pills (read as filter chips) → single-line progress stepper (dots + "STAGE 2/7 · Qualifying"); duplicate stage word removed from the sticky meta strip. Growth & Composer re-orders from the execution wave mapped as L1/L3 corrections. |
| 9 Aug 2026 | **Execution wave (Final Directive)**: (1) **Composer B1-full** — sections re-composed as the recipient's PAGE: numbered 1–5 in mono-accent, each with a "how they read it" line ("Their first impression — leads the page" / "Why they can trust the record" / audience scale / bookable formats / "What the production team checks first"); eyebrow renamed "THE PAGE — TOP TO BOTTOM, AS THEY READ IT"; carets moved trailing. (2) **Growth first-viewport redesign** — NEXT SHOW hero (conclusion + action) now leads, 4-number strip follows, honesty line compressed to a 10px footnote under the numbers, QA thin-toggle dimmed to tooling opacity. (3) **Decision Pack D2–D7** written with APPROVE recommendations (Open-Decisions.md top). Verified at 390px. |
| 9 Aug 2026 | **Forensic wave 2 (H)**: Opportunity Case, Show Day, Login inspected at 390px — all pass PVQ; 2 fixes: needs-review chip prefix "!"→"●" (the "!" rendered as "I" at chip size), QA:NET switcher dimmed to opacity .25 + tooltip "Prototype QA" so tooling can't read as product UI. Recipient/Confirmer unchanged (green, re-verified prior wave). |
| 9 Aug 2026 | **Amendment H adopted (forensic design audit of the rendered UI) + first forensic wave**: 8 anchor screens screenshot-inspected at 390px (Radar, Category, Library, Composer, Roster, Pitch Kit, Growth, Admin gate). Verdict: anchors visually strong post-E; 4 defects found & fixed — **Radar content echo** (view-switcher caption removed on Universe, kept as orientation aid on Signals/Scene only); **chip casing** unified ("! NEEDS REVIEW"); **rep acting-line de-teched** ("Goa / psytrance live act · active mandate · every action signed & logged" — scope detail moved to Access tab, no dual-scope prose under the artist name); Library covers re-verified post-fix. A1 gate block re-challenged per §33: kept — three-signal truth reads professionally, "references · not money" ruled product language. QA probes green, zero console errors. |
| 9 Aug 2026 | **Amendment G adopted (Controlled Final Design Execution) + data-truth wave A1–A3 built & QA'd**: **A1 Gate truth block** — Admin gate leads with “THE GATE — ONE REACTS · ONE PAYS”: three DISTINCT signals (BUYER REACTION 12 · PAYMENT INTENT 2 “references · not money” · VERIFIED PAYMENT = NOT MEASURED YET) + standing rule line “Intent is never counted as payment — the gate closes only on a verified activation”. **A3 NOT MEASURED ≠ 0** — Signals tab gained a dashed PLANNED section (improvement cycles / republish / freshness resolution) each naming why it isn't measured; “Not measured is never shown as zero.” **A2 freshness** — Library covers carry neutral mono age (PUBLISHED · 4D AGO); warning language only where a real policy state exists (producer view: “newer stage setup exists — review impact”, matching the bridge cue). QA 3/3 green, zero console errors. Business-Fit ledger + Decision Cards D2/D3/D6 next. |
| 9 Aug 2026 | **Final Design Completion Wave — round 1** (per directive: design, don't audit): **Scene** — PAT-BASIS line on decision card ("Built from your confirmed record only — nothing here is guessed") + benchmark row honestly labeled "DEMO DATA — live scene benchmark lands when cohort sources connect" (D4 gate visible, no fiction). **Agency Inbox** — architecture-explaining paragraph deleted, replaced by a working link-row "Consent & mandates live in Roster ›" (routes to Roster/Access). **Production Growth** — WHAT CHANGED collapsed into a counted expander (WHAT CHANGED · 3 ›); above-fold 340→284 words, expand verified. **Login** — brand moment: larger wordmark, tagline "Your career, on the record.", subtle stage-light radial — no usability cost. **Composer** — composing-frame line reframes the job from form to representation ("You're composing the Booker view…"). QA 9/9 green, zero console errors. Freeze-Matrix worklist updated: 5 of 10 items closed/advanced. |
| 9 Aug 2026 | **D1 RULED & IMPLEMENTED** (Maria-approved policy): default = no implicit authority; 3 levels View/Draft/Send; scoped per action type; disclosed sender; expiry stops authority, history auditable. Built: consent chooser's Reply scope now carries a **level selector (Draft only / Send directly)** with honest subs ("sends directly — always signed 'Zion 604 for SHIDAPU'") + disclosure note "the buyer always sees who really sent it"; fees scope labeled "separate permission"; rep workspace acting-line shows per-scope grants ("update: draft · share: send"); case thread sender meta = "Sent by Yael · representing SHIDAPU · approved by Maya". Inbox routing now unblocked — D1 was the blocker. QA 6/6 green (consent perms, level selector, signed sub, disclosure, sender identity), zero console errors. D2–D6 open; order D2→D3→D6→D4→D5. |
| 9 Aug 2026 | **Top-Bar System canonicalized + Master Checklist adopted**: `LOCK-TopBar-System.md` — audit found ONE governed template + 4 intentional shells (5 canonical variants: AUTH / ONBOARD / RECIPIENT / CONFIRMER / LIVE), variant count before/after 5→5, no accidental drift; **no-echo fix**: Radar's bar crumb removed (its content header IS the act switcher — SHIDAPU no longer appears twice in the first viewport; Passport/Share/Inbox keep the crumb, verified). **Booking-case consequence chips** — production case thread now carries "Moves the deal" / "Date locked" chips (parity with rep case). **46-gate Master Checklist adopted** as binding QA frame → `LOCK-QA-Checklist-Status.md` scores the final gate: 8🟢 7🟡 1⚙, three-final-questions answered honestly (freeze = not yet, blocked on D1–D6 + eng contracts by design). QA green, zero console errors. |
| 9 Aug 2026 | **Visual pass — anchors 1+3 (Amendment E)**: **Category Workspace = professional picture** — Stage category opens with a media strip (16:9 latest-footage slot "LUNAR 604 · LIVE PA" + stage-plot slot "PLOT v3 · REFRESH") above the grouped facts; category-specific — identity shows no media. **Show Day = operational instrument** — NOW block leads with large mono clock (17:08) + "+12 MIN" drift; state statement moved to second line at 17px. Events home audit verdict: **KEEP** — cards already carry event identity (name·phase·date/venue·fill bar·next problem as one composition). QA 3/3 green, zero console errors. |
| 9 Aug 2026 | **Show-business visual pass — anchor builds wave 2**: Category Workspace gained a representative-media strip (16:10 lead shot “REPRESENTS THIS” + setup slot) directly under the conclusion — professional picture, not claim admin. Events home cards became event-identity cards: phase chip · meta (date·place·stages) · fill bar · **next operational problem in amber** (“Main Stage changeover still doesn’t fit”). Opportunity thread messages carry **consequence chips** (“New fee context” · “Production question” · “Affects fee range”) instead of analysis paragraphs. Recipient views gained the **“About this information” provenance drawer** (L3 trust layer): station-confirmed / promoter-confirmed / connected-platform / artist-declared — collapsed by default, human phrasing. QA 4/4 green, zero console errors. |
| 9 Aug 2026 | **Amendment E — Show-Business Information Design ruling adopted** ("no P0 design debt" retracted → visual/information-design debt acknowledged; text budget; card-not-default; 5 content layers; logo-removed + 30-50%-fewer-words acceptance questions; 4-anchor visual pass plan). First builds QA'd: **Passport Library → portfolio covers** (media tile + recipient eyebrow + show-business lead line — "BOOKER / Goa Trance Live Act · LIVE"); **Show Day weak-network truth banner** ("Connection interrupted · showing last confirmed state · 22:18 · Retry" + honest reconnect receipt "no duplicate actions were sent", QA toggle); **Handoff → booking package** (BOOKED eyebrow · SHIDAPU → Ozen Bar · date/venue/slot headline). 4/4 probes green, zero console errors. |
| 9 Aug 2026 | **Packages 2–4 buildable items shipped (Amendment D)**: **published-vs-newer bridge cue** — Stage category shows amber “Your Radar has newer information than your published Passport → Review impact” routing straight to Publish Review (A0 gap closed, professional language, no version mechanics). **Scan truth** — phase labels made honest (“public catalogues”, “ticket listings”, “matching what LOOKS like it belongs to you”) + standing line “everything lands in your private Radar as a possible match — nothing is confirmed without you”. **Composer chapters audit verdict: KEEP** — the one-open-at-a-time accordion already yields low mobile load; renaming 8 sections into 4 chapters would not reduce interactions (audit-before-change honored). **Pitch Kit media rail** — leads with a 16:10 lead-video slot (“LEAD WITH · 90-MIN LIVE” badge) + two press-photo slots before asset rows. **Persistent case context** — sticky mono strip on the Opportunity case (OCT 12 · stage · WHO HAS THE BALL) survives scrolling between brief/prepare/conversation. **Growth thin state** — “No trend yet — draws after your second recorded show” + QA toggle. QA: 6/6 probes green (bridge cue re-verified incl. route to Review), zero console errors. |
| 9 Aug 2026 | **Amendment D (Persona Work Optimization) adopted + first builds**: 3-layer information law (Meaning→Working detail→Provenance) · "design the situation, not the fields" · professional-language layer · 6 owner decisions (D1–D6) registered · 5-package execution plan. Built & QA'd: **Event-wide Advance** — Advance now has Whole event / per-act modes over one dataset ("7 items across 4 acts" grouped PERFORMANCE/MOVEMENT/PLACE/MATERIALS, tap drills to the act); Artist Inbox cleaned — Shares filter removed (share activity = Notifications awareness, inbox = who needs you); Opportunity case carries WhatsApp provenance chip ("Captured from WhatsApp · today 13:42 · original message kept"); Handoff acknowledgments became evidence semantics ("Sent 14:32 ✓" + quiet "you’ll see it here when they open it" — never a fake receipt); TECH CONFLICT → "WON’T FIT YET". All 5 probes green, zero console errors. |
| 9 Aug 2026 | **Index completed — every sub-view/sub-process addressable**: added Radar signals + scene views (6.x), inbox reply sheet, Roster artists/access tabs, Artist-workspace pitch-kit/passports/consent-sheet, Case handoff state, Slot peek, Advance materials, request-sent receipt, Admin exceptions — all with working presets and hierarchical numbering. QA: 15 new rows click-tested, all render their target state; zero console errors. Spec §5 register updated to match. |
| 9 Aug 2026 | **Artist-journey audit fixes + P1 completion**: `LOCK-Artist-Journey-Audit.md` written (8 required outputs; journey structurally sound post-splits, 5 in-screen refinements identified). Built: **PAT-VIS3 tri-state visibility** (● SHOWN / ◐ ON REQUEST / ○ HIDDEN) — fee guidance row in Composer now shows ON REQUEST visually. **Recipient Decision Policies formalized** — every view's POSITIONING block now leads with its decision question ("Will this act fill my floor?" / "Can we actually deliver this show?" / "Does this belong in my programme?" …) — one renderer, six policies. **Asset anatomy propagated to Pitch Kit** (version · owner · freshness · "v4 exists — ask before pitching"). **Event-state QA switcher on Advance** (Planning·Advancing·Pre-Live·Delayed·Complete — meter+countdown change per state). **`LOCK-DS-Registries.md` created**: 12 patterns (PAT-NEXT-MOVE…PAT-DEAD-LINK), 6 nav primitives, state-semantics table, 5 visualizations w/ a11y alternatives, radius normalization to 4 documented values. QA walk: all 7 probes green, zero console errors. |
| 9 Aug 2026 | **P1 effectiveness wave**: Prepare folded into the Opportunity Case as “WHAT THEY NEED — AND WHAT YOU CAN SHOW” (grouped professional questions with per-row actions — Ask for v4 / Ask Roy — and the “don’t manufacture the missing piece” rule; collapsible). Routine confirmed-slot tap now opens a **contextual slot-peek sheet** (time · act · state · one next item · Open slot / Done) — full Slot screen reserved for decide/compare, per compression ruling. **All-stage running-order rails**: Forest and Chill Dome now share Main’s time-rail anatomy (time gutter · rail line · status node dots; lime dot = open slot). **Passport Library rebuilt state-driven**: grouped LIVE NOW / IN PROGRESS / BUILD ANOTHER; card CTA per state (Preview+Update / Continue / Create); collapsible **Version history** with restore actions and receipts. **Index sub-flows added**: Who-you-are steps 6.1–6.4 (family → subtype → capabilities → receipt), New event 1·2·3 accordion steps as sub-rows — every multi-step process now individually addressable in the index. QA-walked: rails render on all stages, peek→full flow, Library groups + history, Prepare rows — green; zero console errors. |
| 9 Aug 2026 | **Gap-closure wave (all locked REDs)**: Category Workspace — planet inspector converted from bottom sheet to full-screen workspace with ‹ Back to Radar (index 7.1/7.2). Passport index rows renamed. REP Artist workspace — button grid replaced with local tabs Overview (story now · next move · opportunities pointer · access/remove) · Pitch Kit (“what you have available to represent” — 5 asset rows with freshness chips) · Passports (“what recipients see” — 4 per-recipient states). Opportunity Case — converted from 84% sheet to full workspace (‹ back header); lifecycle extended: Deal agreed → **Handoff** stage with full handoff block (act · engagement · agreed · tech source · people · open questions) → “Send to Production” with honest transmission copy (never claims receipt) + Export pack. Advance — tabs regrouped **Performance · Movement · Place · Materials**; Materials = Professional Asset pattern (version · owner · supersedes · stale “artist replaced v3 while you were advancing” = G4 stale-protection demo). Show Day — full LIVE takeover (pulsing dot · NOW/NEXT/ISSUES first · resolve action with receipt · ‹ exit); button renamed Enter/Exit Show Day. Dead link — 6 distinct states (unpublished/expired/revoked/replaced/withdrawn/wrong-recipient) each with its own recovery CTA + QA state switcher. Admin exceptions — 每 row expands to bounded resolution actions (quarantine merge / request review / keep separate / re-auth / route to artist / dismiss with reason), receipts filed. **Index rebuilt hierarchically** — sub-screens/states numbered under their parent (7 → 7.1, 7.2…), indented, mono numbering. |
| 9 Aug 2026 | **Phase 0A Navigation Integrity applied**: top bar carries workspace context (`LOCK / Zion 604 Agency` · `/ Zamna Productions` · `/ SHIDAPU` · `/ Operations`); Roster tabs merged to **Overview · Artists · Access** (attention signals live in Overview); Production bottom nav = **Growth · Events · Inbox**; PRO-GRO-001 Growth built (Pulse · Movement w/ Shows·Venues·Formats lenses · What changed w/ data-basis lines · Patterns & footprint); Events home lifecycle tabs renamed **In motion · Coming up · Done** with NEEDS YOUR HAND lead under In motion only; DS nav primitives split — `tabBtn` (NAV-LOCAL-TABS) · `filterChip` (NAV-FILTER, outlined) · `viewSwitch` (NAV-VIEW-SWITCHER, underline; Growth lenses use it); **universal Inbox grammar** — all three inboxes now share state nav `Needs reply · Waiting · Done` + persona filter chips (Artist: All·Booking·Access·Shares / Rep: All·Buyer·Artist·Access / Prod: All·Artist-Rep·Applications, with Waiting + Done lanes built). QA-walked: Growth zones+lens switch, Events tabs+needs-hand, Roster 3-tab+merged attention, top-bar context per workspace, all 3 inbox state/filter rows — all green. |
| 6–7 Aug 2026 | Production home rebuilt as the **Runway**: next-show hero (date tile + days-to-doors + coverage bar), "Cues — by deadline" (TODAY/TOMORROW chips), collapsed "Waiting on others", calendar-tile Runway list of every night ahead. Today = when-driven, Events = structure-driven, Inbox = people-driven. |
| 7 Aug 2026 | Agency Inbox got standard segmented tabs **Replies · Consent** (matches Artist and Production inboxes — one anatomy for all three). |
| 7 Aug 2026 | Avatar audit: every artist-photo placeholder normalized to one neutral 36px circle (17 instances); brand-gradient act-identity avatar remains a separate component. |
| 8 Aug 2026 | Demo dates made coherent: Forest Gathering Sep 5 = next show (30 days to doors); Klub Haoman moved to Sep 20; dependent strings aligned. |
| 9 Aug 2026 | **Music-only taxonomy**: Dancer/performer, VJ/Visual artist and Stand-up/spoken-word families removed from onboarding and the DS glyph row; 7 music families remain (DJ · Vocal · Instrumental · Band · Live-electronic · Creator · MC/Host). Unused glyphs deleted. |
| 9 Aug 2026 | **Localization plan locked**: LOCK-Localization-Matrix-HE.md holds the EN→HE vocabulary (entities, navs, objects, chips, CTAs, eyebrows). Decision: no bilingual development while design iterates — string-table prep per stabilized flow, then one concentrated HE+RTL pass per entity. 4 vocabulary items open for Maria (§7 of the matrix). |
| 28 Jul 2026 | Screen 19 gains buyer qualification: who is booking, budget commitment number and payment terms for institutional buyers, both optional. Send is gated on event type + reply channel. |
| 28 Jul 2026 | Live enquiries now reach the Inbox with what the buyer gave and what they omitted. |
| 28 Jul 2026 | All recipient view-tracking removed ("opened twice", OPENED 2× chip) — open decision B3 resolved by removal. |
| 28 Jul 2026 | Hebrew placeholder removed; product is English-only until Phase 2. |
| 28 Jul 2026 | Ticketing-platform APIs ruled out. Ticket evidence stays artist-uploaded exports plus counterparty confirmation. |
| 28 Jul 2026 | DS 5.1 states what lime *means*, not only how much of it: the one action that moves this person forward — never a status, never a second option. |
| 28 Jul 2026 | Post-gig receipt gains a keepable record line (`GIG-2026-0725-BLK · place · date · items · confirmation state · act`) with "Keep a copy". |
| 28 Jul 2026 | Buyer-qualification answers now survive navigation, so the artist's Inbox actually shows what the buyer gave and omitted. Event type and reply channel start empty — the form no longer answers for the buyer. |
| 28 Jul 2026 | Escrow, advance financing and float-yield models parked with open questions (Open-Decisions §G). Multi-vertical expansion parked as a design constraint, not a roadmap item (§H). Proposed KPI set assessed — five adopted, five rejected (§I). |
| 3–5 Aug 2026 | v8.3: index grew to 47 rows (notification inbox, bulk import, rep/production team steps, producer view, Lineup first-run, event header restyle, rebook + invite flows on the Lineup cockpit, booker-view proof reorder, scan counter de-quota, full source-logo mapping). Skin system kept; QA fixtures kept per owner. |
| 6 Aug 2026 | Screen 27 renamed "Passport — as a rep sees it". Rep Proof tab fixed: duplicate WHERE PEOPLE LISTEN removed, platform tiles rewritten platform-first. Screen Index Map bumped to v8.4 (read live from the sidebar). Passport viewer-matrix doc triaged: keep 3 tabs on mobile (not 5); CTA case-state progression, Trust & Details layer, field-level RADAR→Passport matrix logged as open gaps. |
| 6 Aug 2026 | Notifications made persona-scoped (rep desk / production / ops each get their own inbox items); bell now shows on Roster, Rep artist, Lineup and Slot screens. |
| 6 Aug 2026 | KPI lines removed from all screens (technical notes — spec only). Today desk merged 6→4 lanes (Needs you / Waiting / Coming up / Done); all tab rows unified on the DS segmented control. Roster/Opportunities boundary enforced: roster notes artist-facing only; artist panel links to Opportunities instead of duplicating the enquiry. Index regrouped per entity; §8b added — entity architecture as meta-fields (dev handoff contract). |
| 6 Aug 2026 | **Production Operating Model P0 built** (per `LOCK-Production-Operating-Model.md`; 4 new surfaces, 55 index entries): **① Today — Production Daily Desk** is the new Production home (bottom nav: Today · Events · Lineup · +New; hub lands on Today). Lanes: Needs a decision → At risk → Waiting on artist/rep → Confirmed but not ready → Next 48h → Recently done; fixed card anatomy (Event·Stage·Slot / artist / state chip / why-it-matters / waiting-on + deadline / ONE action) with deep links. **② Booking Case** bottom sheet — stage ladder (Enquiry→…→Confirmed), Hold block (+24h / two-tap Release, 22h expiry), terms versions (who pays · who signs), bounded approvals (Finance/Venue: approve·comment, no seats), cross-channel thread of receipts, case-aware CTA that walks Terms→Approvals→Confirmed (confirm permission-gated) and opens the Advance. **+ Log a call** popup: decision / next action / owner / deadline — files a receipt. **③ Artist Advance** — readiness meter (7 of 12), 4 mobile tabs (Overview open-items by owner+deadline · Show & tech · Travel & stay · Access & hosp); every field carries the 5 properties (value · source · owner · status current/stale/missing · updated-at); request-from-artist self-service sheet (copy link / WhatsApp + 48h auto-remind). **④ Show-day sheet** — Day view toggle on the Advance: schedule, contacts, what-changed, still-missing. Scope rule locked: WhatsApp/email/calendar/ticketing/accounting are integrated channels, never rebuilt. |
| 6 Aug 2026 | **Cross-entity correlation audit (REP ↔ Artist ↔ Production) — identity model locked and applied.** Found and fixed real business-logic collisions: (1) the rep workspace user is **Maya Levi (ML)** — as the artist's consent sheet already said — but the agency Team screen named the owner "Maria Sason" and the approval flow said "Maria"; the same "Maria Sason" was also the Production owner. Now one person per seat: REP = Maya Levi (Owner, approves) + Yael Berkovic (Agent, drafts); PRODUCTION = Dana Katz (Booker, the DK user) + Maria Sason (Owner, signs — matches the Booking Case "signs: Maria S"); the external buyer **Noa Berger** (booking manager, The Block) appears identically in the artist inbox, artist notifications, roster enquiry and rep panel. (2) The agency assistant was called "Noa" — colliding with buyer Noa Berger; renamed to Yael everywhere in the pipeline (drafts, thread receipts, authority table, contact ownership). (3) Forward/back flow fix: the roster enquiry's case link wrongly opened the unrelated Ozen Bar case — now routes to the Opportunities desk. (4) Field crossings verified: capture ₪9–12K = case "fee mentioned" = inside matrix range ₪8–14K = reply quote ₪10–14K; desk summary strip now reacts to the approval state. (5) Team "Leave workspace" note is now role-aware (Owner must transfer; a member can leave). Technical feasibility: every audited flow is standard CRUD + state machine + share-sheet capture — nothing requires exotic tech. Duplication sweep: no leftover name/logic duplicates. |
| 6 Aug 2026 | **REP audit — second pass (logic first, then screens).** Programmatic template↔logic sweep found 3 dead bindings and fixed them: (1) the Passport composer's four "what recipients see" visibility switches (media / live proof ×2 / assets) had no logic — rendered blank and did nothing; now real toggles with track+knob styling. (2) "Copy invite link" on the rep panel's pending-request block had no handler/icon — now copies with a receipt toast. (3) New event's "Last day" date field was unbound — multi-day events couldn't actually be set; now wired (the Day 1..N slot selector already read it). Added to the rep inbox: "A reply is waiting for your approval" (P1) deep-linking straight into the approval popup on the Opportunities desk. Visual pass over every REP screen confirmed: on-behalf context keeps the agency top bar on Passport edit, desk lanes/case ladder/approval→Waiting progression/capture/team/onboarding all render and flow correctly. Re-sweep: zero unbound holes, zero unbound event handlers across the whole prototype. |
| 6 Aug 2026 | **REP complete flow audit — findings & fixes.** (1) **On-behalf persona break (structural):** "Update Passport" / "Share Passport" from the rep panel jumped into the artist workspace — top bar flipped to the artist's avatar/bell and the bottom nav to Radar·Passport·Inbox, stranding the rep. Fixed with an on-behalf context: entering from the rep panel keeps the rep's avatar (ML), the agency-scoped bell and hub, and the rep bottom nav (Roster · Opportunities · Inbox, Roster active) on the Passport/Share screens; leaving via Roster, the hub, or an artist index entry clears it. (2) **Flow gap:** a roster enquiry could only be answered ad-hoc — no path into the Opportunity pipeline; enquiry cards now carry "Track it properly — open as an opportunity case ›". (3) **Markup hygiene:** removed two duplicated empty state blocks and one dead spacer div on the Roster screen. Verified clean: onboarding 3-step, roster tabs/import/pending-consent, panel access-state machine (pending/blocked/granted), Access & Consent sheet, Opportunity Prep, Opportunities desk lanes, case → approval → receipt loop, capture, contact card, offer matrix. |
| 6 Aug 2026 | **Index reordered by entity importance (owner ruling): Entry & signup → Artist (the venture's core entity) → Representation → Production (5 groups) → Booker → Source confirmation → Admin → Design system.** Audit run: all 58 index entries resolve to a working jump case (1–45), no orphan state keys, all Opportunities-desk template bindings present in logic. |
| 6 Aug 2026 | **REP P0 built — Opportunities pipeline (screens 44–45).** Adopted from the Rep Operating Model + Level-1 app map: (1) Rep bottom nav is now **Roster · Opportunities · Inbox** (Artist panel opens contextually from the roster; Access lives inside the panel; Inbox opens the rep-scoped notification inbox). (2) **Opportunities desk** — cross-roster lanes as tabs (Revenue / Approvals / Artist / External / At risk / Money), every card = artist + reason + state + waiting-on-whom + owner + deadline + one action. (3) **Opportunity Case** (SHIDAPU × Ozen Bar) — stage ladder New→Accepted, what's-on-the-table, contact row, who-may-do-what authority list, missing-before-a-quote with Ask receipts, cross-channel thread (WA/CALL/PASS). (4) **Approval-on-behalf** — Noa drafts → Maria sees the exact outgoing text → Approve & send / Edit / Decline → receipt lands in the thread and the lane card flips. (5) **Capture an enquiry** — pasted WhatsApp → confirm-each-line extraction → case + draft reply. (6) **Contact card** — facts only (booked ×2, paid in 34 days, prefers WhatsApp), explicit "LOCK never scores people". (7) **Offer matrix** — approved ranges by context with visibility levels; internal floors never shown. Production nav stays Today · Events per the owner ruling (the map's "Bookings·Inbox" logged as terminology to lock later). |
| 6 Aug 2026 | **Production architecture audit — fixes.** (1) Persona scoping: the new Production screens (Today desk, Artist Advance, Team-prod) showed the ARTIST's notification inbox, artist avatar (RS) and no workspace section in the top-bar hub — bell, avatar and hub are now production-scoped on every prod screen (rep Team screen likewise rep-scoped). (2) Flow gap: the deciding slot (Peak 01:00 · SHIDAPU) had no path to its live Booking Case — added "A deal is already moving — open the booking case ›" on the Booking-decision tab. (3) Flow gap: the confirmed slot's 4-item logistics list dead-ended while the full readiness lives in the Artist Advance (7 of 12) — added "Full readiness — the artist advance ›" link. Index reordered: Production is category 1, five groups (onboarding → daily work → book → deliver → management). |
| 6 Aug 2026 | **IA audit per entity — verified + locked.** One rule set for every workspace entity: **top bar** = identity & management (avatar → hub: workspaces, THIS WORKSPACE → Team & settings, account; bell = persona-scoped system notifications); **bottom nav** = daily work only, 2–3 items; **screen body** = no title that repeats the nav — a KPI/health line instead; **sub-screens** open forward from list items and return with ‹ back; **overlays** only for in-context actions (reply, share, confirm), never for whole surfaces. Per entity: ARTIST Radar·Passport·Inbox(requests) + bell; REP Roster·Opportunities·Inbox(46) + bell, on-behalf screens keep agency scope; PRODUCTION Today·Events + bell, sub-screens board→slot→case/advance, New event opens from Events; BOOKER/HOST guest or seated top-bar states, no workspace nav on shared links; SOURCE CONFIRMER isolated single-purpose screens, no nav; ADMIN cockpit via hub Operations. Verified live: screen 46 renders with correct scope, bell, and index entry (59 screens). |
| 6 Aug 2026 | **Logic audit — screen meaning + KPI per surface (owner ask).** Definitions locked: **Roster** = the relationship & consent layer (who we represent, access state, share-readiness); KPI = roster health — share-ready acts / consent pending, shown as a health line on the screen. **Opportunities** = the deal layer (pipeline of cases); KPI = money in motion — live revenue cases, open approvals, waiting-on-other-side, shown above the tabs. **Agency Inbox (new screen 46)** = dedicated triage desk, no longer the artist-inbox clone or the bell popup: incoming enquiries (Accept/Decline on behalf, moved OUT of Roster's old "Waiting" tab) + access & consent events, each routing to its surface; KPI = first reply within 24h. Roster tabs are now Needs you / Ready / All acts. System updates stay under the bell; the Inbox holds only work waiting on the agency. "Zion 604 Agency" label removed from the Opportunities screen (entity identity lives in the top-bar hub). **Production**: Today = execution desk, Day-KPI line (nothing unhandled by doors); Events = structure layer, KPI line (every slot set before doors); production's system inbox stays the prod-scoped bell. |
| 6 Aug 2026 | **Nav model corrected (owner ruling): bottom nav = daily work only; management lives in the top bar.** Team item removed from Production and Rep bottom navs (rep's Access restored; prod back to Events · Lineup · New event). Team & settings now opens from the top-bar avatar → workspace hub, under a context-aware "THIS WORKSPACE" section ("Team & settings — Zamna…" in Production, "— Zion 604 Agency" in Rep). |
| 6 Aug 2026 | **Team & settings added for workspaces** (screens 40/41): one surface, scoped per entity — Production (Zamna: Owner/Booker/Producer/View only) and Agency (Zion 604: Owner/Agent/Assistant/View only). Org card + edit; seated members with tap-to-open role editor and two-tap remove; Owner seat locked (transfer note); pending invites with resend/cancel and "no seat until they accept"; invite flow (email + role → pending + receipt); workspace notification toggles; guarded "Leave workspace" (Owner must transfer first). Entry: 4th bottom-nav item "Team" on both Production and Rep navs. Artists have no team — their settings remain Account & access (screen 5); their "people" = representation grants in Access & Consent. Production index de-duplicated (P-number prefixes removed — the sidebar already numbers rows). |
| 6 Aug 2026 | New event (P5) deepened per field audit + data-model doc: multi-day (first/last day, Day 1..N per slot), stages (add/remove + per-slot stage), doors/end times, indoor/outdoor setting, expected crowd, set length per slot, private budget range. Production index reordered by flow P1–P10. Draft-board slot label bug fixed (read a wrong key). Data-model triage logged in Open Decisions. |
| 6 Aug 2026 | **Production redesigned after full audit.** New hierarchy: Events home (upcoming with fill bars + past read-only) → Event board (back row "‹ All events", stage chips, timeline) → slot-aware Slot detail. Fixed: all slots previously opened a hardcoded "Peak time · 01:00"; confirmed slot now has its own screen with a **logistics checklist** (set time ✓, rider ✓, changeover TBC, gate list not sent) + "Send day-of details" — first cut of P7 (gap rank 10). Bottom nav corrected: Events · Lineup · New event (a detail screen is no longer a tab). New-event date field now binds. Index rows: prod-events, slot-confirmed added. |


## 2d. Comment-driven UX corrections (30 July 2026)

| Area | Was | Now |
|---|---|---|
| Source confirmation (20) | Five equal buttons | One primary + one secondary; the three negative answers sit behind one "Something else?" disclosure, worded plainly ("I wasn't there — I can't say") |
| Planet header (7·8) | Status dot + status chip + percentage in one 44px row | Chip only. The dot repeated the chip; the percentage measures coverage and belongs in Shape, not in a status row |
| Multi-line fields | Three divergent recipes, two carrying old-palette literals | Exactly two, both fully tokenised: **draft** (dashed = we suggested it) and **field** (solid = you write it). Documented in DS 2.4 |
| Radar views | Universe · Shape · Scene | Shape · Universe · Scene — Shape earns first position; Universe stays the default working view |
| Scene | Three sub-tabs nested inside a tab row | One comparison view, with two 44px depth entries: "What to do about it" and "See who is ahead of you, and on what", each with a single Back |
| Verification mark | Blue ✓ beside the artist name on every surface | Removed everywhere. LOCK verifies bounded claims, never people; trust is carried by the method label on the claim |
| Collapsed coach CTA | 21px text link | 44px control — it is the one action the Radar exists to drive |
| Genre selection | One flat list ending in "Other" | Act type first (F1–F6), then the genres that belong to that type, multi-select |

**Still open from the same review:** slot detail (17) needs the same restructure the planet sheet got · representation onboarding (12) lacks colour and hierarchy · notification cards carry three actions · recipient chips would read better with icons · the share promo card is unclear · direct WhatsApp send needs the Business API (recorded in Open-Decisions).

---

# Part II — Specification for the missing processes

Written 30 July 2026. Covers the ten gaps from `LOCK-Process-Status.md`. Each one states the job, the screen shape, the states, and the rule it must not break.

## II.1 · Category Workspace (gap rank 1)

**Job.** Maintain everything LOCK holds about one of the 18 areas. Today a category is a row inside a bottom sheet — too small to work in.

**Shape.** A full screen, reached from the planet sheet ("Open full view") and from any notification about that area. Header: area name, its segment number, one state chip. Four tabs, in this order:

| Tab | Contains |
|---|---|
| **Facts** | Every item LOCK holds, each with method, date, visibility, and an edit affordance |
| **Sources** | Every source feeding this area — method, date, freshness, review action |
| **Conflicts** | Only appears when two sources disagree. Never a badge on the tab when empty |
| **Sharing** | Which recipient views include this area, per view |

**States.** Full · thin (fewer than 2 facts) · nothing yet · has conflict · private-only.

**Rule.** No score, no percentage, no "complete" meter. The screen answers *what do we hold and is it right*, never *how good are you*.

## II.2 · Source Drawer (gap rank 2)

**Job.** Answer "where did this come from and can I trust it" without leaving the area.

**Shape.** A drawer over the Category Workspace, opened from any fact or source row. Fixed content, always in this order:

1. What it says — the claim in one line
2. Method — one of the eight, in the artist's words
3. Date — when read, when reviewed
4. Original — link or filename, opened in a new tab
5. Ceiling — what this source can and cannot prove ("a station broadcast confirms the set happened, not the size of the crowd")
6. Conflicts — named, if any
7. Actions — Confirm · Correct · Keep private · Ask the source · Remove

**Rule.** Every fact in the product must reach its drawer in one tap. A fact with no drawer is a fact with no provenance and may not be published.

## II.3 · Roster bulk import (gap rank 3)

**Job.** An office with twenty acts gets started in one sitting.

**Shape.** Four steps: paste or upload a list → we parse it into candidate acts → the manager confirms each act's name and one link → the acts are created, each empty, each isolated.

**States.** Nothing parsed · parsed with N candidates · duplicates found · partially confirmed · done.

**Rule.** No evidence is imported. Import creates the act and nothing else — the artist still owns and confirms their own information. A duplicate name is surfaced, never merged automatically.

## II.4 · Tiered offer matrix (gap rank 4)

**Job.** Set what is offered and for how much, once, per recipient type — so nobody negotiates against themselves.

**Shape.** Inside the "What you offer, and for how much" area. One row per recipient type (booker · production · private client · corporate), each with: formats, duration, fee range, territory, lead time, what is included.

**States.** Not set · set for some types · set for all · deliberately blank ("ask me").

**Rule.** Ranges only, never a single computed number, and never an automatic adjustment by recipient identity. The artist can always see exactly what a given recipient was shown.

## II.5 · Claim resolution as one flow (gap rank 5)

**Job.** Everything an artist can do about one claim, in one place.

**Shape.** Opened from the drawer or a notification. Five actions, always the same five, each with its consequence stated: **Confirm** (it becomes yours) · **Correct** (you supply the right detail) · **Keep private** (stays in Radar, never published) · **Dispute** (marked contested, not shown as fact) · **Ask the source** (sends one bounded question).

**Rule.** Every action produces an immediate receipt and, where safe, an undo. Nothing changes silently.

## II.6 · Publish review (gap rank 6)

**Job.** See exactly what changes before it becomes public.

**Shape.** A sheet before publishing. Two columns of plain sentences: **added** and **removed or changed**, compared with the version currently live. Footer: which recipient views are affected, and the CTA "Publish this version".

**States.** First publish (nothing to compare) · no changes since live · changes present · a change that needs review before it may go out.

**Rule.** Publishing is never one tap from an edit. The artist must have seen the diff.

## II.7 · Conflict resolution (gap rank 7)

**Job.** Two sources disagree; the artist decides.

**Shape.** Both versions side by side, each with its method and date. Three choices: **this one is right** · **both are true** (different periods) · **neither**. Until resolved the fact renders as contested and is excluded from every recipient view.

**Rule.** LOCK never picks a winner, not even when one source is "higher tier". A contested fact is never published.

## II.8 · Evidence add pipeline (gap rank 8)

**Job.** Turn a link or a file into a fact, with the artist in control at each step.

**Shape.** Add → detect type → show what we read from it → choose area and visibility → process → review the extracted facts and confirm or reject each.

**States.** Detecting · unsupported type · duplicate of an existing source · processing · failed with retry · ready for review.

**Rule.** Nothing extracted becomes a fact without an explicit confirm. Draft state survives a failure or a refresh.

## II.9 · Density follows the data (gap rank 9)

**Job.** A Radar with three facts must not look like a Radar with three hundred.

**Shape.** No modes and no tiers. Each surface derives its own density from what exists: areas with nothing show one invitation instead of an empty frame; Shape and Scene appear only once there is enough to compare; the coach speaks about the first fact rather than the next optimisation.

**Rule.** No level, no upgrade moment, nobody declared "mature". The same screens, the same controls, the same rights for every artist.

## II.10 · Production logistics (gap rank 10)

**Job.** After an artist is confirmed, the work that actually makes the show happen.

**Shape.** Per confirmed slot: arrival and soundcheck times, technical needs from the artist's own area 15, contact for the night, and what is still missing. Missing items are requests to a named person, not empty fields.

**Rule.** Nothing here is visible to other candidates for the same slot.

---

## Build sequence

| Wave | Contents | Blocked by |
|---|---|---|
| 1 | Category Workspace · Source Drawer · Claim resolution · Conflict resolution | Decisions A1–A3 |
| 2 | Publish review · Evidence add pipeline | Wave 1 |
| 3 | Roster bulk import · Tiered offer matrix | — (can start now) |
| 4 | Density follows data · Production logistics | Wave 1 |

Wave 3 is independent and is the cheapest real improvement available today.


## Removed from prototype, kept in spec (03 Aug 2026)
### "Before you say yes" safety checklist (was: AI scan / manual-entry empty state)
Removed from the scan screen per review — too much reading before first value. Preserved here for a future home (help center, first-booking moment, or a notification when the first enquiry arrives):
- Five things a booking should tell you: (1) Who pays, and when — name the payer and the term before you commit a date. (2) What exactly is booked — format, duration, set time. (3) What the venue provides — rig, monitors, backline. (4) Who confirms — one named person on the other side. (5) What happens if it cancels — date moves, deposit, or nothing.
- Closing line: LOCK will not guess your fee — nobody can price your work from the outside. What it can do is make sure the question was asked.
### Inspector recommendation box (was: planet inspector sheet)
The per-planet "suggestion" paragraph moved out of the sheet; its content is carried by the "Next best move" notification (n11). The sheet keeps one action button only.


## 4.12 Onboarding flows — dedicated paths per entity (Aug 5)

**Artist:** name + one link → full-height radar scan (24 real-logo sources) → "Is this you?" one match at a time (Yes/Not mine) → identity: family (multi-select, icons) → canonical subtype (single-select, B4-20.50 registry, "I'm not sure yet") → additional capabilities (multi) → genres → Enter your universe. Back at every step (bordered ‹ Back beside the accent Continue). Empty scan: add a source OR "build it yourself" → same identity flow.

**Representation — two dedicated paths (split screens, both indexed):**
- Step 1 · who you are: "Just me" (user glyph) vs "A company" (group glyph). Picking advances.
- Step 2 · Just me: HOW ARTISTS SEE YOU — professional name only; teammates deferred ("add any time from your workspace"). CTA: Start building my roster.
- Step 2 · Company: COMPANY DETAILS (registered name, VAT optional) + team invites with roles. CTA blocked-state copy: "Add your company name to continue".

**Production:** event-type cards with lime glyphs (club/festival/private), payer question for private events. Hover convention on all selection cards (lift 1px, accent border).

**Account safety:** changing email/WhatsApp opens a code-verification card (6-digit, sent to the CURRENT contact); change applies only after Verify; cancel restores.

**Navigation conventions:** accent fill = forward · bordered quiet = back/edit · underline = immediate undo. One accent CTA per view. Input focus = single lime border (native outline suppressed).


## 4.13 Passport Information Policy (adopted from Recipient-Relevance Matrix, Aug 5)

**Model adopted:** RADAR = governed information spine · Passport = recipient-specific decision surface. Six recipient families (Booker · Producer · Programmer · Rep · Private · Brand; municipalities inherit Programmer+Brand until decided). Six content categories (Overview · Media · Live · Audience · Offer · Details) + trust metadata always attached to significant claims.

**Three-level control (prototype status):**
- Level 1 · Category toggles — LIVE in composer (section switches).
- Level 2 · Recipient policy — LIVE partially: recipient-ordered views + per-view include rows in inspector; the Offer category now carries a three-state sensitivity control: **Shown / On request / Hidden** (default: On request — fees are request-only by the matrix). Booker view renders a "Commercial terms — shared on request" locked card in request mode.
- Level 3 · Item override — inspector per-fact actions (confirm/correct/hide per method).

**Sensitivity tiers to implement in build:** All-recipients / Role-adapted / Controlled / Request-only / Confirmed-booking-only / Transaction-only / Never-in-Passport (payment details).

**Hard exclusions honored (never in Passport):** gaps checklist, AI confidence, raw evidence, rejected claims, coaching, named-artist comparisons, scores/readiness %, unresolved conflicts, other recipients' actions.


---

# Update log — August 5, 2026 (v8.3)

## Scan & onboarding
- Full-height signature scan: dual logo marquees (24 real brand marks), rotating radar sweep, live counter, phase line, and a live findings feed (last 3 findings with status discs).
- Match review: one question at a time, Yes/Not mine only, receipts with Undo.
- Identity flow (canonical B4-20.50): family (multi-select, lime glyphs) → subtype per selected family (single-select + "I'm not sure yet"; F1-03 removed by owner decision) → capabilities (multi) → genres. One Continue per step, ‹ Back beside it. Empty scan routes into the same flow ("build it yourself").
- All three entity onboardings share one header anatomy (step chip + bar → bare accent glyph + title → subtitle). Rep and Production onboarding split into two indexed screens each, with dedicated paths (Just me vs Company; club/festival vs private).

## Radar
- Three views with purpose captions: Universe (spider, % approved, vs-scene), Signals (six rows: lime glyph · name — % · state word chip · state-aware hint · hover), Scene (recipient-lens pre-booking intelligence: 6 lenses with decision line, insight cards SUPPORTS THEM / MAY CAUSE HESITATION / HIDDEN VALUE, fix routes into Signals, Passport preview; cohort comparison behind a door).
- Planet inspector: header → conclusion → tabs (Facts default · Sources · Who sees it), no disclosure toggle, no top CTA. Facts carry per-method actions: connected (Refresh/Disconnect), declaration (Edit/Hide), artist-confirmed (Update/Hide), candidate (Confirm/Correct/Hide), counterparty (Ask again/Hide), document (Replace/Remove), derived (explain only). Inline Correct editor (Save/Cancel → "Your version"). Sources tab: rows with refresh/remove. Sharing rows toggle vis live.
- "Watching your public profiles / Scan again" card lives only on Universe.

## Passport
- Composer: multi-Passport switcher (Club & festival / Private events / International / ＋New); governed name edit (✎ → Who You Are); portrait Remove button; media = one image slot + video-from-source row; Offer category three-state control Shown / On request / Hidden (default On request); no recipient-preview chip row; PUBLIC/UNPUBLISHED pill via visPill with eye/lock glyph.
- Recipient views: final display only (no upload slots); glass "LOCK PASSPORT · VIEW" pill on the hero (58px top); category dividers (mediaLead / AT A GLANCE / PROOF / THE OFFER / FOR YOUR PRODUCTION); producer view: actionable production pack (View stage plot / Request rider), comparable-event cards with glyphs, WHO TO TALK TO contact card with WhatsApp + enquiry actions; booker request-only commercial card.
- Share sheet: recipient chips → expiry row → message → link-preview card → Copy/WhatsApp → Preview → sent-links list. Bound-view banner and explainer texts removed.

## Inbox & notifications
- Enquiry card: quote band (quotes only) → event block (accent calendar glyph, date · venue bold, glyph tags, full-width Google-Calendar tentative hold with held/release states) → selectable quick replies (✓ Available / Politely pass, purple selection state) → editable reply. Fields mirror the event vocabulary.
- Access request: permission-level rows the artist toggles inline (✓/○ discs), "Approve (n of 2)" adapts, mono footer "You stay the owner · every action is logged". ACCESS REQUEST chip = review amber; card frame = brand lime.
- Share-activity body plain-styled; stale banner removed (lives in notifications); WhatsApp delivery promise removed (open question logged).

## Design system
- Single sources: chipCss (state chips), visPill (PUBLIC/PRIVATE etc.), statusDisc(size), LockCard variants aligned to state palette, one canonical fallback per token (1,741 unified).
- Gallery: chips = ONE FAMILY, FIVE JOBS (A state / B state words + priority words / C identity pills incl. INTERNAL / D discs / E method labels); color = COLOR I brand core + COLOR II state; icon library two tiers (white product glyphs, lime artist-type glyphs) + full source-logo map (31 marks, 6 groups); toasts neutral surface + disc; per-glyph rule "one glyph one meaning per screen".
- Conventions: accent fill = forward · bordered quiet = back/edit · underline = undo; one accent CTA per view; container hover (lift + accent border); input focus = single lime border (18 fields wired); email fields inline error state.

## Open items headed into the next phase (per Maria)
- RADAR + all sub-screens refinement · notifications · Passport management screens · Passport recipient views.
- Open decisions: reply-channel bridging, municipal recipient family, registry F1-03 deprecation, audience-demographics tier for Brand, request-only reveal mechanics.


## Screen Index Map — canonical display numbers (v8.4, 6 Aug 2026)
Maria's instructions use THESE numbers (the sidebar's running count), never internal preset ids.

Entry & shell: 1 Login · 2 Signup/intent · 3 Workspace hub · 4 Hub first-run note · 5 Account & access
Artist: 6 Onboarding — start artist profile · 7 AI scan/first wow · 8 Scan — who you are · 9 Empty scan · 10 Radar universe · 11 Inspector — stage · 12 Inspector — identity · 13 Notifications · 14 Passport edit+preview · 15 Share Passport · 16 Inbox — enquiries/access/shares · 17 Stale enquiry · 18 Multi-Act switch / new Act · 19 Act switched (N.Söf) · 20 Save failed/retry
Representation: 21 Rep onboarding — who you are · 22 Rep onboarding — your company · 23 Rep onboarding — invite your team · 24 Roster universe · 25 Roster — pending consent · 26 Managing an artist — rep panel · 27 Passport — as a rep sees it · 28 Pending access — both sides
Production: 29 Prod onboarding — event type · 30 Prod onboarding — details · 31 Prod onboarding — invite your team · 32 Lineup — first run (no events) · 33 Lineup cockpit · 34 New event — brief & slots · 35 Event slot detail
Passport recipient views: 36 Producer view · 37 Booker view · 38 Private host view · 39 Booking request sheet · 40 Unpublished/dead link
Source confirmation: 41 Confirm/correct/decline · 42 Already answered · 43 Wrong person
Admin: 44 Admin cockpit
Design system: 45 Component gallery · 46 Deep-link routing · 47 Keyboard navigation

RULE: any index edit (add/remove/reorder) shifts every number after it — update this map in the same change.


### 4.12 Workspace × Role architecture (canon alignment, Aug 2026)

Three commercial workspace families only: **Artist · Representation · Production**. Booker is a ROLE, never an entity.

- Hierarchy: User → Workspace → operational objects (Act / Roster / Events→Slots).
- Production member roles: **Event owner** (confirms + pays) · **Booker** (selects artists, negotiates) · **Producer** (operational delivery: rider, schedule, changeover — no booking authority) · **View only**. Implemented in the Production invite-team step.
- A Booker without a seat = external recipient: views Passports and enquires freely, no subscription; managing events/slots requires a Production seat.
- Recipient views stay subscription-free (booker view, private host, corporate); Source confirmer stays accountless.

Open (decision register):
- Producer-facing Slot Detail ("can we deliver?" — rider, changeover, stage, crew) is NOT yet designed; current Slot Detail serves the booker question only ("should we book?" — event-fit).
- Pricing, plan names, seat limits — not canonically defined.


### 4.13 Production Role × Permission × Access Mode (canon, Aug 2026)

Seats are for recurring event/slot/decision work only.
- **Core seats:** Event Owner (approve budget, confirm booking, manage team) · Booker (select, contact, negotiate; confirm = conditional) · Producer (operational delivery; no fee/negotiation authority) · Production Manager / Technical Producer (conditional seat — rider/stage/changeover approval, can block a booking; distinct from Producer).
- **No-seat collaborators (bounded link, no account — Source-confirmer pattern):** technical specialist review (confirm / condition / can't support), finance approval, legal review, client/sponsor approver view, venue confirmation, safety review, post-confirmation liaison tasks. They never see fees or negotiations. Prototype: "Send one question to a specialist" in Slot Detail → Operational feasibility.
- **Permission ≠ role name:** role presets seed defaults; authority is per-permission (create event, define slots, shortlist, contact artist, negotiate fee, approve budget, confirm booking, approve technical feasibility, manage rider, manage team). Event Owner's "confirms + pays" decomposes into booking approval / contractual commitment / billing admin.
- Marketing/ticketing: guest access to approved public media only — advisory, never confirms a booking.


## 4.13 Passport content specification — components, sources, and the Radar → Passport bridge

**Principle: one governed store.** The recipient Passport renders ONLY what the composer's visibility
toggles allow (`vis.*`), drawn from the same Radar categories the artist maintains. No second truth:
if a fact is corrected in Radar, every Passport view updates. Private gaps, percentages, benchmarks
and internal recommendations NEVER cross the bridge.

### Radar category → Passport surface (per recipient)

| Radar category (private) | What crosses the bridge | Booker (37) | Producer (36) | Private host (38) | Rep view |
|---|---|---|---|---|---|
| Identity (family, subtype, genres) | fit line + positioning pitch | hero fit line: "Goa trance live act · 25+ years" | "Live hardware set · self-contained" | plain language: "turns any gathering into a real dance floor" | "Label head + active artist" |
| Stage (sets, venues, formats) | confirmed live proof + set formats | STRONGEST PROOF card (station-confirmed) | WHAT ARRIVES ON STAGE · rig, changeover, formats | GOOD TO KNOW facts, no jargon | trajectory + working history |
| Sound (releases, catalog) | tracks + platforms | TRACKS + WHERE PEOPLE LISTEN | secondary | "press play" media card | CATALOG DEPTH |
| Crowd (draw, audience) | AT A GLANCE numbers (approved only) | shown with method labels | shown | omitted (jargon-free) | shown |
| People (vouches, collaborators) | WHO VOUCHES quotes | shown | WHO TO TALK TO contacts | testimonials in plain language | working-history contacts |
| Offer (fees, terms) | three-state sensitivity: Shown / On request / Hidden | THE OFFER or "shared on request" | production pack terms | simple set options (Full live set / DJ set) | omitted |

**Never bridged:** completion %, scene benchmarks, peer comparisons, stale/conflict flags, unconfirmed
AI findings (candidates), internal next-move recommendations.

### Passport anatomy (all recipient views share this shell)

1. **Identity banner** — "LOCK PASSPORT · {VIEW}" pill, floating over hero. Names the recipient configuration; a public viewer cannot switch views.
2. **Hero** — artist photo (image-slot), name (26px/800), one-line fit tuned per recipient.
3. **Section tabs** (sticky, segmented): each tab is one screen-height of content, recipient-labelled:
   - Booker: **The act · Proof · Book**
   - Producer: **The act · Stage & rig · Book**
   - Private host: **About · Good to know · Enquire**
   - Rep: **The act · Proof · Book** (catalog-weighted)
4. **Tab 1 — The act**: POSITIONING card (one-paragraph pitch per recipient) + media player (HEAR THE ACT / WHAT THE ROOM HEARS). The wow, nothing else.
5. **Tab 2 — Proof**: STRONGEST PROOF card (source logo + method label + confirmation check) → proof cards → AT A GLANCE → TRACKS → WHO VOUCHES → WHERE PEOPLE LISTEN (platform logos). Producer variant: PRODUCTION FACTS rows (set formats, team, rig) with glyph icons.
6. **Tab 3 — Book**: offer state (dashed "shared on request" container or THE OFFER card) → contact / enquiry entry → sticky **Check availability** CTA (lime, one per view).
7. **Request sheet** — overlay; first/last name, contact, event context fields; sends to artist Inbox.

### Method labels & logos
Every externally-sourced claim carries its source logo (radiOzora, Spotify, Instagram…) and a
human method label ("confirmed by the station", "connected account", "artist-confirmed") — never a
bare number. Confirmation state shows as the green check disc; candidates never render publicly.

### Component inventory (recipient views)
identity-banner-pill · hero image-slot (circle) · fit-line · segmented tab bar (tabBtn) ·
positioning-card (lime eyebrow) · media-card + play rows · proof-card (green STRONGEST PROOF variant) ·
fact-row (glyph + label + value) · at-a-glance stat pair · vouch-quote card · platform-logo row ·
offer dashed-container / offer-card · sticky lime CTA · request bottom-sheet.
