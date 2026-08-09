# LOCK — Open Decisions & Parked Proposals

## CFRO monetization doc v3.5 — adopt/reject audit (Aug 2026)
**Already aligned (verified in prototype):** no product pricing anywhere (all ₪ figures are deal/fee context — fee ranges, event budgets, admin costs); Gate tile separates reaction / payment-intent / verified payment ("intent never counted as payment"); free-pilot posture (Revenue ₪0 · "pilot — not charging"); planned metrics render "not measured yet", never zeros; Radar-as-Growth-Advisor = our Next Move loop.
**Adopted now:** break-even line labeled as hypothesis at a test price; owner-hours added to admin P&L (the doc's honest-cost point); multi-Act artists counter added to supply funnel (the Pro-intent signal).
**Rejected with reason:**
- "No score/percentage in ANY view" — conflicts with the owner ruling that the artist may see % privately. Our firewall stands: private yes, public never.
- Concrete prices (₪179 / ₪39 / ₪199 / ₪249…) — the doc itself withdraws them to PLACEHOLDER; no pricing surface exists in the product and none will be added pre-Gate.
- Plans/upgrade screens (Momentum / Roster / Pro walls) — product decision parked until Gate closes; prototype measures signals only.
- Event-planner as a 6th recipient view — planner needs are covered by the programmer/booker orderings; revisit only if a real planner enquiry pattern emerges.
- Billing Sponsor mechanics, Vercel/Supabase tier timing, AI $ caps — engineering/ops decisions, out of prototype scope; recorded here for the build team.


## Gap-closure wave (9 Aug) — DONE
- **DS Gallery refreshed:** new §1.8 RADIUS SCALE card (8 ruled values with role names, "no other values" law) + thin-state rule card in §4.8 (early record reads honest — "Early record — building", "Nothing confirmed here yet", CTA stays live). Iconography renumbered to 1.9.
- **Pitch Kit media rail:** verified already built (lead-video 16:10 + 2 press slots + asset rows) — gap was stale in the register.
- **Remaining by design:** style-hover coverage = desktop phase; real platform logos = rights decision (Maria); D2–D7 decision-gated.


## Category framing — RULED (9 Aug)
LOCK is **pre-booking intelligence** (the buyer's risk instrument before commitment), NOT an EPK/promotion tool. Product-language law: buyer-facing surfaces say *evidence / proof / confirmed / method*, never *promo / showcase / impress*. "Pitch" remains legitimate ONLY inside Rep workspace vocabulary (a rep's job is pitching); it never describes the Passport itself. Prototype swept: "promo card" → "proof card" (share flow ×2 + DS gallery), buyer share message now ends "Not a pitch — proof." Photo-rights label "usage: event promo only" kept (it's a rights term, not framing).


## GTM readiness — product-side items only (9 Aug)
- **Signal ledger in Admin cockpit:** the 8-row money-signal map (share_link_created → passport_view → professional_reaction → availability_request → entitlement_activated · producer_confirmation · gig_evidence_refresh · waitlist_signup) — cockpit already surfaces the 3-gate funnel; verify all 8 rows are readable in one lane before Phase 1. 
- **Invoicing path (Green Invoice):** outside prototype scope — engineering unblock for entitlement_activated. Owner: Maria/eng.
- **Recipient Passport as GTM asset:** stripped in the recomposition wave (provenance behind drawer, one CTA) — matches the GTM requirement.


## ⚡ DECISION PACK — D2–D7 (one approval closes all)

Each item: question → recommended rule → impact. Reply "APPROVED" to accept all, or name exceptions.

**D2 · On-request disclosure** — Q: who approves a recipient's request for hidden info (fee, tech pack)?
RECOMMENDATION: APPROVE — Requests go to the Act's inbox; the ARTIST approves (or a rep seat with an explicit `disclose` scope). Approval is per-request, expires with the share link, and is logged. Opens: recipient CTA "Request fee guidance", disclosure lifecycle chips.

**D3 · Handoff receipt** — Q: what happens on the Production side when a rep sends a booking handoff?
RECOMMENDATION: APPROVE — Handoff creates a DRAFT EVENT SLOT attachment in the receiving Production workspace (or attaches to an existing event the producer picks). Producer confirms → slot state `confirmed`; nothing auto-publishes. Opens: PRO receive screen, REP "sent" receipt state.

**D6 · Close-out facts** — Q: which facts persist after a show ends?
RECOMMENDATION: APPROVE — Persist only counterparty-confirmable facts: performed (Y/N), date, stage, set length, changeover-as-delivered. No ratings, no internal notes leaving the workspace. Feeds: artist's confirmed record + Production Growth patterns.

**D4 · Scene benchmark** — Q: can Scene show cohort comparisons?
RECOMMENDATION: APPROVE AS GATED — Keep benchmark row visibly marked "DEMO DATA — lands when cohort sources connect" until a real dataset exists; comparisons limited to same family+territory cohorts, never a rank/score.

**D5 · Admin jobs** — Q: who operates Admin and what does it compress to?
RECOMMENDATION: APPROVE — Single operator persona (you). IA compresses to Operations (exceptions queue + gate truth) with everything else as inspectable views, not destinations.

**D7 · Private percentages** — Q: does the artist keep seeing % completeness privately?
RECOMMENDATION: APPROVE — Yes, private-only (your standing rule); firewall stays: no % on any recipient surface. Closes the CFRO conflict permanently.

---


## CFRO cross-check (9 Aug 2026) — monetization vs prototype
- **ADOPTED as constraints:** G17 free pilot (no pricing UI anywhere — prototype already complies) · no commission · demand side free forever · Confirmer never pays · per-workspace (never per-artist) agency pricing · "measure before charge".
- **D7 🟨 FIREWALL vs ARTIST %:** CFRO firewall says "no score/percentile in any view"; Maria earlier ruled private artist-facing % allowed. Needs one ruling: private Radar % = allowed (recommended — firewall protects BUYER-facing surfaces), or remove % everywhere.
- **D8 🟨 Billing Sponsor:** agency pays artist's layer without owning it — future consent-sheet note ("sponsored by Zion 604 — you stay the owner"). Post-Gate; parked.
- **Prototype gaps to build (cheap, honest, no pricing exposed):** (a) Admin Gate tile → 3 columns: reaction / payment intent / verified payment — intent never conflated; (b) Library covers get freshness meta ("published 12d ago") — feeds the staleness→republish loop CFRO must measure; (c) second-act intent — flow exists (New Act), mark as signal in spec.

## LOCKED — Architecture decisions (9 Aug 2026, per Maria's regrade ruling)
These seven are binding before any further screen implementation:
1. **Stable Screen Registry** — canonical IDs (`ART-RAD-001`, `REP-OPP-020`, `PRO-EVT-050`…) replace sequential numbers as SSOT identity; display numbers remain a sidebar convenience only. Every screen record carries: entity · destination · archetype · canonical object · owner · states · routing.
2. **Roster home merge** — Growth + Attention collapse into one `REP-ROS-001 Overview` (hero → Needs attention → Growth modes → What changed → Artists preview). Roster tabs become **Overview · Artists · Access**.
3. **Passport split** — five jobs, five surfaces: Library → Composer → Exact Preview → Publish Review (diff vs live) → Published (immutable) → Share. Current combined screen is RED until split.
4. **Confirmed Handoff** — new P0 screen ending pre-booking: act · engagement · agreed terms · technical source · people · open questions → Send to Production / Export. No finance beyond agreed context.
5. **Production Today removed as destination** — IA is **Growth · Events · Inbox**. Today's content redistributes: patterns/pressure→Growth · needs-your-hand→Events/In-motion · waiting→Inbox · live→Show-Day takeover.
6. **Production Growth content model** — Pulse (4 counts) · Growth graph (Shows·Artists·Venues·Formats·Partners) · What changed · Footprint · Format mix · Network · Recurring friction. RED until built.
7. **Object ownership** — Notification (awareness) ≠ Inbox (decision queue) ≠ Thread (conversation) ≠ Case (deal record). Inbox routes to canonical destinations; it owns nothing. Every action has exactly one owning screen.

Regrade accepted: RED items = Category Workbench (Radar sheet editing) · Passport split · REP Artist Workspace · Confirmed Handoff · Production Growth/Today · Show-Day takeover · Design System (until coverage audit). External Passports downgraded to 🟡 pending recipient coverage matrix; dead-link needs 6 states; confirmer moves claim→bounded attestation; admin exceptions need resolution actions (quarantine merge / request review / keep separate).

---

Working file. Nothing here is built. Each item is either **waiting on an owner decision** or **parked with a verdict**.
Last updated: 6 August 2026

**PARKED (6 Aug 2026): Role-enforced UI per Production seat.** The prototype renders every Production screen as Owner; Booker/Producer/Viewer seats should see reduced surfaces (Viewer read-only, Producer feasibility-only on Slot detail). Permission bundles are specced (§8b) — the reduced renderings are deliberate v-next work, not a gap in the model.

## Passport viewer matrix (canon check, 5–6 Aug 2026)
Confirmed in prototype: 4 view families (Booking / Production / Representation / Private-Corporate), owner preview, no recipient role-switching, recipient-bound CTA, guest vs. seated top bar, source-confirmer isolation.
Open gaps to design later:
- Shared-link binding: recipient_id + expiry + revoke manager (specced §4.7, no screens yet)
- Corporate / sponsor **Approval mode** (approve · comment · request alternative)
- Production **Technical / Venue modes** (rider, stage plot, curfew fit)
- Admin **Passport audit view** (version, recipient policy, publication history)
- CTA **case-state progression** (Request availability → Start enquiry → Continue terms)
- **Trust & Details layer** per recipient view (sources, freshness, limitations as a section, not only inline labels)
- **RADAR field × family × tab × visibility matrix** at field level (spec §4.13 is the seed)
Decision taken (6 Aug): keep **3 tabs** per recipient view on mobile, not 5 — same content, merged (fit+evidence · readiness+trust); five tabs fragment a 390px screen.

## Production strategy assessment — triage (6 Aug 2026)
Full screen plan in `LOCK-Production-Operating-Model.md`. Adopt now: Production Daily Desk (new "Today" home), canonical Booking Case (absorbs the CTA-progression gap), Artist Advance + 5-property field model, slot feasibility block, availability/holds, call-outcome receipts, show-day sheet. Adopt later: budget exposure, templates/cloning, media workflow, debrief→RADAR loop. Locked scope rule: integrate WhatsApp/email/calendar/files/e-sign/ticketing/accounting — never rebuild them. Rejected: team chat, ERP scope. Caveat: needs Israeli field validation (6–8 interviews).

## Navigation & routing proposal — triage (6 Aug 2026, external doc)
Reviewed the "Entry Router / four shells / Focus Mode" architecture proposal. Verdict per item:
**Adopt — direct user benefit, design next:**
- **PASSPORT Focus Mode**: any Passport view (guest or seated) hides the global bottom nav and shows one case-aware action dock. Prototype already does this for guests; formalize for seated entries too.
- **Case-aware CTA progression** (Check availability → Continue enquiry → View enquiry → Continue conversation) — merges with the CTA-progression gap above; the doc's §14 table is the seed.
- **Guest Booking Case continuation**: enquiry receipt → durable guest thread (reference no. + magic link + status + conversation). Today the flow dies at the receipt. Signup offered only *after* submission.
- **`return_to` contract**: back always returns to exact slot/candidate/tab/scroll, incl. after login mid-link. Cheap to state, huge felt quality.
- **"Open in workspace" rule**: a logged-in user opening an external Passport link sees the same bound view; internal data only after explicitly choosing Open in workspace.
- **"Where are you considering this artist?" sheet** for a seated booker opening a Passport with no event context (pick slot / new event / general enquiry).
**Adopt in principle, later:** Production bottom nav evolving to Events · Bookings · Inbox once Booking Cases exist (today: Events · Lineup · New event); private-host aliases (My Event / Artists / Messages) over the same objects.

## Event data model proposal — triage (6 Aug 2026, external doc)
Reviewed the "Event → Day → Venue → Stage → Slot → Assignment" field registry.
**Adopted in prototype today (New event / P5):** multi-day (first/last day → Day 1..N per slot), stages (add/remove, per-slot assignment), doors/end times, indoor/outdoor setting, expected crowd, set length per slot, private artist-budget range. §18 minimum-viable rule already held (only the name is required).
**Adopt as canon, design later:**
- The **six operational objects** (Event · Event Day · Venue · Performance Area/Stage · Slot · Artist Assignment) as the spec's data spine — Slot as a *demand brief*, artists linked via assignment records, never artist_1/2/3.
- **slot_status + candidate_status ladders** (Empty → Sourcing → … → Confirmed → Announced; Suggested → … → Confirmed, with named closure reasons) — feeds the deciding-slot screen and CTA progression.
- **Conflict engine** warnings (artist overlap, changeover vs. available time, curfew, budget overrun, hold expiry) — highest-value later item.
- **Scale presets** (private event → club night → multi-day festival): same objects, different defaults; "Quick slots / timeline / bulk grid" generation methods.
- Separate authorities: approver ≠ signatory ≠ payer.
- Public lineup ≠ operational schedule (billing tiers, embargo waves, time_visibility).
**Rejected / parked:** the full 8-step creation wizard and ~300-field registry at prototype scale (progressive accordion + conditional fields instead); ticketing module; permits/compliance module; Performance-Area taxonomy beyond "stage" (park until a real non-stage case).

**Rejected / already resolved:** six recipient families (canon = 4 + modes); wizard-style splitting of the Passport composer into 8 numbered screens as-is (direction agreed — decompose edit+preview — exact split TBD); doc's claim that rendered HTML was missing (it exists; implementation-level fixes are being made directly).

---

## A. Waiting on Maria — blocking design work

| # | Question | Why it blocks | Status |
|---|---|---|---|
| A1 | **Six planets or seven worlds?** The older Radar model names seven user-facing worlds; the atomic registry names six planets, and some categories sit in different groups in each. | Radar navigation and all 18 category placements depend on it. Prototype is built on six. | Open |
| A2 | **Registry B — segment applicability per artist family.** Which of the 18 segments are required / conditional / not applicable for F1–F6? | Today every artist sees all 18. A vocalist is shown "Technical & production readiness" with the same weight as a hybrid live act. | Open |
| A3 | **Is R-12 the live ruling on named-peer comparison?** One document forbids artist-vs-named-artist; R-12 approves it privately. | Peer Lab is built on R-12. One edit removes it. | Open |

These three change what a Category Workspace contains, so they gate the next P0 build.

---

## B. Waiting on Maria — needed before this reads as a real product

| # | Question | Note |
|---|---|---|
| B1 | **Platform logo assets.** ~30 brands are hand-drawn letter tiles (S4A, EV, TC, GO). Need real SVGs plus, per brand: allowed usage, and what the source can and cannot prove. | Design system cannot claim logo coverage until then. |
| B2 | **Cohort source for Scene Benchmark.** Where does `n=42` actually come from, and what is the minimum sample before a comparison may render? | Currently illustrative. |
| B3 | **"Opened twice" on the shared-link manager.** Behavioural tracking with no consent basis. | Either define consent + instrumentation, or remove. It is the only line in the product that watches a recipient. |

---

## C. Waiting on Maria — decide before Phase 2

| # | Question |
|---|---|
| C1 | **Hebrew.** Segment names, category labels, all microcopy, and RTL as a designed layout — not a mirror. |
| C2 | **Who owns a band member's evidence when they leave?** Stays with the act, leaves with them, or freezes? |
| C3 | **What happens to a dormant act?** After ~6 months of no activity, does the Passport keep serving as current, mark itself stale, or stop opening? It serves forever today. |

---

## D. Resolved

| # | Decision | Date |
|---|---|---|
| D1 | **Ticketing-platform APIs — dropped.** Israeli ticketing platforms are unlikely to allow connection and would not all approve. Ticket evidence stays artist-uploaded exports plus counterparty confirmation. Revisit only if a platform approaches us. | 28 Jul 2026 |
| D2 | **Escrow / holding customer money — refused for this phase.** Turns LOCK into a payments entity: licensing, trust accounting, refunds, disputes, cancellation liability. Also displaying "€8,500 in fan pledges" to a booker substitutes a number for professional judgement, which Section 7 forbids. | 28 Jul 2026 |
| D3 | **Geographic demand data belongs to segment 06 Audience & fanbase (Your Crowd)**, not Live. Stage is where you played; Crowd is where the audience is. Unserved demand is by definition a place with audience and no show. | 28 Jul 2026 |
| D4 | **Discovery confirmation cards stay in onboarding.** A proposal to move them into the Action Inbox would leave the artist arriving at a Radar full of unconfirmed finds, making every downstream claim a guess. If load is the problem the answer is family-level batch confirm ("all four Spotify-family finds are mine"), not deferral. | 28 Jul 2026 |

---

## E. Parked proposals — commercial layer (Israeli market)

From the management-network audit. Verdicts are mine; all are reversible.

### Adopt — no payment exposure

| # | Proposal | Why it is worth building | Where it lives |
|---|---|---|---|
| E1 | **Agency roster seed / bulk import.** A manager uploads a roster or links an agency catalogue; the system extracts and groups it into separate acts under one workspace. | Real adoption friction. An office with 20 acts will not hand-onboard them one at a time. Isolation rules already exist, so the acts stay separate. | Screen 3 + rep onboarding (12) |
| E2 | **Tiered offer matrix.** Price *ranges* and terms per recipient type: corporate / private / municipality / club. The manager sets the boundary once; the recipient view renders only its own tier. | This is segment 11 (Booking market & commercial offer) doing its actual job. Prevents the manager negotiating against themselves. No money moves. | Screen 9 composer, rendered in 18 |
| E3 | **Budget commitment number (מספר התחייבות תקציבית).** An optional institutional field on the enquiry for municipal and public buyers. | Verification without holding funds — the strongest idea in the document. A commitment number is checkable, and its absence is itself a signal. | Screen 19 |
| E4 | **Payment terms as a declared field** (immediate / shotef 30 / 60 / 90). Stated by the buyer, visible to the artist before they reply. | Israeli late payment is a real risk. Naming the terms early costs nothing and changes which enquiries an artist prioritises. | Screen 19 → Inbox card |
| E5 | **Buyer intent qualification.** Fields that adapt to event type; the artist's Inbox card shows what the buyer did and did not give ("First contact, no organisation named" vs "Third enquiry from this venue"). | We verify every artist claim and accept the buyer on trust. This is the asymmetry. | Screen 19 + 11/38 |

### Adopt with a hard constraint

| # | Proposal | Constraint |
|---|---|---|
| E6 | **Live Market Pull / demand signal.** Where is there audience and no show. | Must be built from **real registrations and real published budgets only** — people who asked to be told, tenders that are actually open. "We detect 400 high-intent fans willing to pledge €25" is a prediction and violates Section 7. Correct form: "412 people asked to be told when you play Berlin — 38 of them since your last look." Data source does not exist yet; would start curated/manual. |
| E7 | **Municipal & corporate budget tracker** (וועדי עובדים, periphery municipalities, regional festivals). | Genuinely valuable and genuinely absent from every competitor. But it is a *data acquisition* project, not a screen. Needs a source and a refresh owner before any UI. |

### Refuse — with reasons

| # | Proposal | Why not |
|---|---|---|
| E8 | **Credit-card pre-authorisation / deposit holds on the enquiry.** | Same payments wall as D2. Also kills the top of the funnel: a booker checking a date will not authorise a card to ask a question. |
| E9 | **Binding framework agreement required to submit an enquiry ("Lock This Date").** | A legal contract cannot be a form field. An enquiry is not a booking, and making it one removes the low-commitment first contact that most bookings actually start from. |
| E10 | **"Direct-bid gating" to prevent off-platform deals.** | This is platform-lock reasoning applied to a relationship market. In Israeli live music the manager *is* the relationship. If the link blocks a phone call, the manager stops sending the link. Our defensibility is that the Passport is the fastest way to be understood — not that it is the only way to be reached. |
| E11 | **Automated pricing that adjusts by recipient identity without the artist seeing it.** | Ranges per tier: yes (E2). Silent automatic price changes: no. The artist must always be able to see what a given recipient was shown. |

---

## F. Notes to carry forward

- Every commercial addition must still obey Section 7: no predicted demand, no bookability index, no composite score. A financial figure is not exempt from that rule just because it is money.
- Financial and commitment states must use existing chip variants (`developing` for pending, `confirmed` for settled, `review` for overdue). No new colours, no promotional visual treatments.
- Fan-level registries and individual names stay inside Radar. The Passport renders aggregate ranges only.
- Two follow-ups offered by the audit and not taken up yet: a manager user-journey story ("close a municipal show in five minutes"), and the legal/regulatory definition of an automated collection engine. The second is moot while D2 stands.


---

## G. Radical proposals — parked with a question mark

A fintech/underwriting model was proposed on top of LOCK: institutional advance financing, escrow float and yield, and an enterprise risk-data feed. Recorded here in full because the reasoning is worth revisiting later — none of it is designed, and each carries an open question that must be answered before it could be.

### G1 · Institutional advance financing — "we pay the artist 80% now"

The logic is real: municipalities and corporate welfare funds pay on shotef+90, so artists finance the gap themselves. LOCK holds verified booking evidence, so LOCK could advance against a confirmed booking and take a 5–8% fee.

**Open questions:**
- Does LOCK want to be a lender? That is a licensed activity, with capital requirements, collection, and default risk on our balance sheet — not a product feature.
- Who bears the loss when the municipality does not pay, or the show is cancelled? If it is us, we are an underwriter. If it is the artist, we have sold them expensive debt.
- **This is the load-bearing conflict:** advancing money requires pricing the *probability* an act performs and gets paid. That is a bookability score with money attached. Section 7 forbids the score; it does not stop forbidding it because the output is a loan.
- Would a manager accept LOCK holding financial risk on their artist, or does that make us a competitor to their own cash-flow arrangements?

### G2 · Escrow float and liquidity yield — the "Starbucks balance" model

Hold fan pledges and buyer deposits, earn yield on the float while capital sits unsettled.

**Open questions:**
- Holding client funds is regulated activity, and yield on client money is a separate question again. Which entity, which licence, which jurisdiction?
- What happens on cancellation — the least glamorous and most common event in live music?
- Does the artist know their fans' money is generating return for us? If the answer is uncomfortable to publish, that is the answer.
- Float only becomes material at very large volume. What is the smallest version of this that is worth the regulatory cost, and is that version still interesting?

### G3 · Enterprise risk and insurance data feed

Package anonymised, aggregated market structure and sell it to insurers, venue investors and festival backers.

**Open questions:**
- This one does not require us to touch money, which makes it the most plausible of the three. But it inverts who we serve: the artist becomes the data source and the institution becomes the customer. Do we want that?
- The artists confirmed their evidence to get booked, not to be aggregated and sold. What consent basis makes this legitimate, and would we be comfortable stating it plainly on the onboarding screen?
- The proposal describes "predictive regional supply-and-demand matrices." Prediction sold to an insurer is still prediction. Either it is descriptive market structure, or it is the forbidden thing wearing an enterprise price tag.
- Is there any volume of this data that is genuinely proprietary before we have thousands of active acts?

### G4 · Interface consequences that were proposed with it

| Proposal | Question |
|---|---|
| "Available Instant Advance" vertex on the Radar | A credit offer next to the artist's own coverage data. Does a lending product belong on the surface whose entire promise is that it does not judge you? |
| Cryptographic pledge terminal replacing the Passport CTA | An enquiry becomes a binding financial instrument. Same objection as E9: the low-commitment first contact is where most bookings start. |
| Cash-flow timeline on P0/P1 inbox cards | "Municipality of Haifa submitted 120,000₪ — LOCK pre-approved 96,000₪." Genuinely the sharpest version of the idea, and the fastest route to manager adoption. Also the moment we become a creditor to our own user. |

### G5 · The strategic question underneath all three

The proposal's premise is that transaction volume in music is too small to reach a large outcome, so the business must become financial infrastructure.

**The question to answer first:** is that true for us, or is it true for a booking marketplace? LOCK's asset is not transaction flow — it is governed, method-labelled, artist-consented professional evidence in a market that currently has none. Before adding a balance sheet, it is worth asking what that evidence is worth to the people who already pay for bad versions of it: agencies, festivals, export offices, and the artists themselves.

**Also unanswered from the same document:** whether to build a pilot on a third-party banking API (Stripe Treasury or an Israeli institutional credit partner), and whether to design the "Instant Advance" inbox card for the pitch. Both are moot while D2 stands — but the card is a cheap way to test the reaction of two managers before anything is committed.


---

## H. Multi-vertical / horizontal-infrastructure proposal — parked

The proposal: treat music as one vertical module on a horizontal platform, then activate keynote speakers, tattoo artists, chefs and consultants on the same core, with a global fintech layer underneath.

### What is genuinely true in it

The **mechanics** are vertical-agnostic, and that is a real observation worth keeping:

- the eight evidence methods do not care what the fact is about;
- the bounded magic-link confirmation works for a convention-centre coordinator exactly as it works for a club promoter;
- "one recipient-bound view per link" is not a music idea;
- "a gig with no record is a gig a booker cannot see" is true of any engagement.

If LOCK is ever ported, that layer ports.

### Where the argument breaks

**The 18 segments are the product, and they are music.** Your Sound, technical rider, lineup slot, streaming consumption, ticketing draw — these are not configuration, they are the domain knowledge that makes the Radar worth opening. A keynote speaker has no set format and no stage plot. Swapping the segment set is not "activating a module"; it is building a second product on a shared runtime. The claim "without rewriting a single line of core code" is where the proposal stops being true.

**Depth is the moat, not breadth.** The reason an Israeli manager would use this is that it knows what a Goa act needs to be booked in this market. Generalising to four verticals before one works removes exactly that.

### Open questions if this is ever revisited

1. What is the smallest evidence set shared by all verticals, and is it interesting on its own? (My read: identity, media, references, availability — thin, and already served by generic tools.)
2. Which vertical has the same three properties as music — relationship-driven, evidence-poor, buyer needs to de-risk a stranger? Keynote speaking probably; tattoo probably not, because the portfolio *is* the evidence and Instagram already carries it.
3. Would the second vertical share a cohort model, or does Scene Benchmark have to be rebuilt per domain?
4. Would one brand carry both, or does each vertical need its own?

### The fintech layer under it

Same open questions as Section G. Adding cross-border currency, multi-jurisdiction compliance and receivables factoring multiplies the regulatory surface by the number of verticals **and** the number of countries. Not a v9 topic.

### Their two questions, answered

- **Global currency & compliance router** — no. It designs the plumbing for a business decision that has not been made (D2), in markets we have no user in.
- **Vertical asset configurator on screen 9** — worth an hour as a *thought experiment*, not as a build. If switching a profile from music to corporate talent with one click looks plausible, it is because the mock has hidden the segment problem above. That is the useful test: try it, and the answer to question 1 falls out.

### Recommendation

Keep the horizontal architecture as a **design constraint**, not a roadmap item: keep segment definitions in a registry rather than hard-coded, keep methods domain-neutral, keep the confirmation flow generic. That costs nothing now and leaves the door open. Do not build a second vertical before one act, one manager and one production company are using the first one weekly.


---

## I. Proposed KPI set — assessment

A metrics framework was proposed for an investor pitch. Recorded with verdicts, because a metric that gets adopted becomes a design instruction.

### Adopt — these measure whether the product works

| Metric | Why it is the right one | Note on the proposed target |
|---|---|---|
| **Factual integrity rate** — share of facts on a published Passport carried by a high-tier method (connected / counterparty / document) rather than `candidate`. | This is the product's whole claim in one number. If candidates leak into public views, we are a rumour aggregator with nice typography. | The proposed >90% is a reasonable ambition. Do not set it as a *gate*, or the artist gets punished for having a thin history — the honest version is "no candidate is ever published", which is absolute and already enforced. |
| **Magic-link confirmation rate within 48h** — share of counterparties who answer a one-claim request. | Directly measures whether the confirmation flow is actually frictionless. If it is low, the flow is wrong, not the promoter. | >85% within 48h is optimistic for club promoters. Measure it, do not promise it. |
| **Zero cross-act leakage** | Not a KPI — a pass/fail invariant. Belongs in the test suite, not the dashboard. | Keep as a release gate. |
| **Share-to-enquiry conversion** — links sent that produce a qualified enquiry. | The one honest measure of whether the Passport does its job. Better than any view count. | "Qualified" must mean the enquiry passed the screen-19 gate. Otherwise it counts noise. |
| **Independent-to-managed ratio** — organic acts arriving because top acts are visible here. | Good instinct, and it is the cheapest growth signal we have. | The 20:1 target is invented. Measure the ratio; do not commit to it. |

### Reject as designed

| Metric | Problem |
|---|---|
| **Advance acceptance rate >60%** | Measures how many managers take credit from us. That is a lending KPI, and optimising it means pushing debt at users. See D2 / G1. |
| **Treasury float volume · $25M+** | An explicit target to hold as much customer money as possible, as long as possible. It is a KPI that rewards *delay* — the opposite of the artist getting paid. |
| **Default rate <0.5% "because underwriting relies on pristine Radar data"** | This is the load-bearing sentence in the whole document, and it is the thing we forbade. Underwriting at 0.5% default requires scoring the probability an act performs and gets paid. That is a bookability index with money attached, and Section 7 does not stop applying because the output is a loan. |
| **Cross-vertical migration <60 days** | Sets a deadline for the thing Section H concluded should not be done yet. A target like this creates pressure to ship a shallow second vertical. |
| **"Cryptographic proof" baseline** | We do not have cryptographic proof and do not need it. We have named methods with dates, which is stronger because a human can read it. Do not put a word in a pitch that the product cannot back. |

### What is missing from the proposed set

None of the proposed metrics measures whether an artist got **better off**. The North Star already agreed is:

> **Active acts completing a verified improvement cycle within 30 days.**

Supporting measures that belong on the same dashboard and are absent above:

- gig-to-evidence conversion (share of gigs that end in confirmed evidence or an explicit "nothing to add");
- time from enquiry received to artist reply;
- integrity issues resolved before a recipient saw them;
- suggested move → completed move;
- repeat-cycle acts (the only real retention number).

### Their two questions, answered

- **"Algorithmic rule for who qualifies for an instant advance based on their data score"** — this is the forbidden object stated plainly. There is no version of it that is not a bookability score. Not to be designed.
- **"Escrow float projection slide"** — projects revenue from holding customer money. Same objection.

If a pitch is needed, the stronger story is not float and factoring. It is: *this is the only place where a live-music claim carries its method, its date and the name of whoever confirmed it — and the artist owns the decision to publish it.* That is defensible, legal, and true today.


---

## J. Go-to-market proposal — assessment

### Adopt — and it changes who we design for

**J1 · The daily user is the assistant, not the principal.** The strongest observation in the document: elite managers do not touch their own data — junior booking agents and admins do, and they are the ones drowning in WhatsApp threads, missing riders and unanswered enquiries. Design consequence: the Roster and Inbox are not executive dashboards, they are a working desk for someone with 40 open threads and no authority to decide. That is a different brief from "give the manager visibility", and it is closer to what is already built. Worth writing into the spec as the primary daily persona for Track-2 surfaces.

**J2 · The shared link is a status object.** An artist sharing a lock.show link is making a claim about how they operate. That is a real reason the Public Passport must look expensive — not vanity, positioning. Already true of the design; worth stating so it does not get value-engineered away later.

**J3 · Invite-only launch.** Reasonable for a first cohort — it controls quality of early data and makes the first users feel chosen. The physical black box with a cryptographic key is theatre with a cost and no signal; a personal invitation from someone they respect does the same work for nothing.

### Refuse

**J4 · Bureaucratic lock-in as the moat.** "Bypassing the platform becomes a bureaucratic nightmare, forcing 100% of transactions through your software." This is coercion described as strategy. It also requires becoming a tax and invoicing clearing house — the payments wall again (D2). A moat built on making exit painful loses the moment anyone offers a less painful option. Our defensibility is that the evidence is governed and portable, not that the user is trapped.

**J5 · Automated force majeure underwriting / "Security Shield Protocol".** Freezing escrow, rescheduling events and issuing fan micro-credits automatically during a regional escalation. We would be acting as an insurer without being one, and automating financial decisions during a crisis is exactly when a bug becomes a lawsuit. The humane version of this idea needs no money: when an event is cancelled, help both sides record what happened so the evidence survives and the next booking is not started from zero.

**J6 · The framing.** "100% execution success", "unbreakable monopoly", "absolute market dominance". The document contains no condition under which the plan would be judged wrong. Every proposal is a win. That is the tell — a plan without a kill-line cannot be tested, only defended.

### What is missing

No cheap falsifiable test. The whole document is positioning; none of it would change based on what two real users do next week. The test that matters:

> Two agency assistants use the Roster and Inbox on a real roster for two weeks. Measure one thing: did they stop re-explaining the same artist by hand? If they go back to WhatsApp and PDFs, the product is wrong and no amount of status framing fixes it.

### Their two questions, answered

- **Investor brief synthesising dual-track + fintech** — no. It would sell the underwriting model we refused (D2, G1) and the two-mode architecture rejected as two products. A brief written now would commit us in writing to the parts we decided against.
- **Beta workflow with five independent artists** — yes, and it is the right next move. Cheapest useful version: each artist completes onboarding alone, unaided, while someone watches silently. Record only where they hesitate and what they ask out loud. Do not demo. Do not explain. The first question they ask is the screen that is wrong.


---

## K. Today's proposals, filtered by one question

**Decision (Maria, 28 Jul): no investors.** The business earns by helping people do their work. That changes the filter on everything proposed today, so every item was re-read against a single test:

> Does a real person, doing a real job, end their day better off because this exists?

Anything that only makes the company look more valuable to a third party fails, however clever.

### Passed — and already built today

| What | Who it helps | How |
|---|---|---|
| Buyer qualification on the enquiry | Artist | Stops answering enquiries that were never real. The Inbox card names what the buyer gave **and omitted**. |
| Budget commitment number · payment terms | Artist | Knows before replying whether the money exists and when it arrives. Verification without holding a shekel. |
| "Before you say yes" — five questions | Beginner | The only thing on any screen that protects someone with no experience. No price guess, no contract: the questions nobody says out loud. |
| Post-gig debrief + keepable record | Artist, manager | A gig stops evaporating. One filable line a manager can archive. |
| Lime means "the one action that moves you forward" | Everyone | The accent stops being decoration and becomes a promise. |
| Assistant as the daily user | Agency staff | Roster and Inbox designed as a working desk, not an executive view. |

### Passed — worth building next, in this order

1. **Density follows the data, not a tier.** A Radar with three facts should not look like a Radar with three hundred. No modes, no upgrade moment, no one declared "mature". This is the honest half of the dual-track idea.
2. **Roster bulk import.** An office with twenty acts will not hand-onboard them. Pure friction removal, no new concepts.
3. **Tiered offer matrix.** Price ranges and terms per recipient type, set once. This is segment 11 finally doing its job, and it is what stops a manager negotiating against themselves.
4. **Category workspace** (already the standing P0 gap). Blocked on decisions A1–A3.

### Failed the test — and why, in one line each

| Proposal | Who it actually served |
|---|---|
| Escrow float and yield on held funds | The balance sheet. It rewards *delay* in paying the artist. |
| Instant advance financing | The lender. Also requires scoring the odds an artist performs — the forbidden index with money attached. |
| Enterprise risk data feed to insurers | The insurer. Inverts who we serve: the artist becomes the raw material. |
| Multi-vertical expansion now | The valuation story. Depth in one market is the moat; breadth removes it. |
| Dual-track Rookie/Elite modes | Nobody. Two products to maintain, and the beginner gets *less* control and more automation forced on them. |
| Bureaucratic lock-in | Retention metrics. A moat made of painful exit fails the moment exit gets easier. |
| Force majeure underwriting | The pitch. Automating money decisions during a crisis is when a bug becomes a lawsuit. |
| KPI targets: float volume, advance acceptance, default rate | Investors. They instruct the product to push debt and hold money longer. |
| "Cryptographic proof", "insured by LOCK", "100% success" | Nobody. Claims the product cannot back. |
| Fan scarcity queue, referral jumping | Engagement charts. Manipulation, and we have no fan surface. |
| Physical black boxes with access keys | Theatre with a cost and no signal. |

### The one thing worth measuring instead of all of it

> Did the artist get a booking they would not otherwise have got — or avoid a bad one?

Everything above is a proxy. That is the thing.

### The test that is now the next real step

Five artists complete onboarding alone, unaided, while someone watches in silence. Two agency assistants use Roster and Inbox on a live roster for two weeks. One measure each: where they hesitate, and whether they stopped re-explaining artists by hand. Both are cheap, and both can fail — which is what makes them worth doing.


---

## L. New open questions (30 July 2026)

| # | Question | Why it matters |
|---|---|---|
| L1 | **Direct WhatsApp send** — the reply flow says "Replies go back to the channel Noa wrote from (WhatsApp)". Sending from the app requires WhatsApp Business API approval, a registered number and template approval for anything proactive. | Either we integrate and pay for it, or replies happen in LOCK's own messaging and the copy must stop promising WhatsApp. |
| L2 | **Verified-badge removal is now a rule** — no blanket verification mark on any surface. Confirm this is the intended standing rule and not a temporary fix. | It is the difference between "LOCK verifies claims" and "LOCK vouches for people". |
| L3 | **Percentages** — coverage % now appears only in Shape and on the planet tiles, not in status rows. Confirm that is the boundary you want. | Keeps status (what needs you) separate from growth (how far you have come). |


## DEC-TAX — Subtype F1-03 removed by owner (2026-08-04)
Maria removed "Selector / Curator" (F1-03) from the DJ subtype menu — judged not relevant for the target market. Registry B4-20.50 v1.1 still lists it; registry owner should either deprecate F1-03 or record a market-scope exception.


## OPEN-Q — Reply channel bridging (2026-08-05)
Inbox reply promises delivery back to the enquirer's original channel (e.g. WhatsApp). Technical feasibility unconfirmed: WhatsApp Business API session rules limit business-initiated messages (24h window / template messages). Decide: (a) reply-in-LOCK + notification via approved template, (b) open WhatsApp with prefilled text on the artist's device, or (c) reply lives in LOCK only with a shareable link. UI currently makes no channel promise.


## DEC-PPR — Municipal/public-sector Passport policy (2026-08-05)
Matrix leaves municipalities inheriting Programmer+Brand policy. Decide whether public bodies need a dedicated recipient family (procurement docs, budget-commitment fields, Hebrew-first).


## Adopted from LOCKSHOW-UX-UI-AUDIT-v8.3 (Aug 5) — triage record
ADOPTED NOW: booker view reorder (proof before At-a-glance metrics) · scan counter de-quota ("N SOURCES CHECKED", no /total) · full source-logo mapping (added Mixcloud, 1001Tracklists, Resident Advisor, Bandsintown, Apple Music public, Twitch, Shazam, Eventbrite, ACUM; new DJ CULTURE & LIVE group).
AGREED — NEXT PHASE (matches Maria's declared plan): Category Workspace replacing dense inspector sheets · Passport Library→Composer→Preview→Publish split · Inbox list→detail · notification centre = awareness+route only · Scene single recipient selector · Add-Event multi-step form · touch-target sweep to 44px effective hit areas.
GATED (blocked until policy): Scene Benchmark cohort methodology (n=42 illustrative) · Peer Lab named-peer comparison · Corporate/Brand audience-demographics tier · municipal recipient family.
REJECTED / NOT NOW: dropping the skin system (owner explicitly wants swappable skins; will lock ONE default app theme instead) · removing QA states from the index (owner asked to keep two QA fixtures listed) · desktop-first admin rebuild (mobile summary acceptable this phase).


## CFRO v3.5 cross-check (09 Aug 2026)
Verdict: prototype already embodies the CFRO rulings — no structural change needed.
- G17 free pilot: no payment CTA / no pricing anywhere in the app. CONFIRMED (plans removed earlier by owner ruling).
- §E5 Gate tile: 3 distinct columns (reaction / intent "references · not money" / verified = NOT MEASURED YET) + "intent is never counted as payment" footnote. BUILT (A1).
- §E6 not-instrumented ≠ 0: plannedReads renders "Republish after gig — needs version store", "Improvement cycles / 30d" as NOT MEASURED YET. BUILT (A3).
- second_act signal: "Multi-Act artists" row live in Gate Signals supply column.
- Publish freshness: "Published / Stale > 90d" live; "republished last 30d" stays in NOT MEASURED until the version store exists (honest per A3).
- Parked (not design): pilot price ₪179 internal-only; Billing Sponsor mechanism; Roster/Production pricing post-Gate; event-planner recipient register post-validation.
