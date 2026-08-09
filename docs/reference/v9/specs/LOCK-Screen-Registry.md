# LOCK — Screen Registry v1.1 (SSOT)
Canonical screen identities. **IDs are permanent; sidebar numbers are display-only convenience.**
v1.1 (9 Aug): every record now also carries a **surface classification** — USER SURFACE / SUBVIEW / STATE / OVERLAY / TECHNICAL ROUTE — per the Compression Rules in LOCK-QA-Frame.md. Perceived product per persona: Artist Radar·Passport·Inbox · Rep Roster·Opportunities·Inbox · Production Growth·Events·Inbox · Recipient one editorial view · Confirmer one bounded confirmation · Admin Operations.
Key reclassifications: PRO-EVT-050 Show Day = MODE/STATE of the Event Workspace (not a tab) · REP-OPP-050 Handoff = STATE of the Opportunity (with transmission states Ready→Sent→Received→Opened) · ART-RAD-010 inspector = OVERLAY (preview only) · PRO-EVT-010/040 Line-up & Advance = SUBVIEWS of one Event Workspace · PRO-EVT-060 producer case = supporting detail, not a destination · Decision tab on REP-OPP-010 = contextual STATE block · recipient views = ONE renderer + six decision policies.

## Entity Experience Profiles (adopted 9 Aug 2026 — binding on every screen)
One Design System, five expression profiles. Every screen declares its profile; composition, density, motion, hierarchy and microcopy follow it — components stay shared.
- **Artist — Reflective Intelligence**: reflect→understand→improve · medium density · hero = conclusion/next move · universe/signal visuals · CTA verbs: Improve/Review · lime = next action.
- **Representation — Commercial Editorial**: scan→prioritise→move · medium-high density · hero = roster signal · portfolio-movement visuals · CTA verbs: Move/Prepare/Send · lime = commercial movement.
- **Production — Live Operations**: monitor→coordinate→resolve · high density when operational · hero = current production state · timeline/running-order/dependency visuals · CTA verbs: Resolve/Confirm · lime = live/unresolved.
- **Recipient — Curated Stage**: understand→evaluate→request · low-medium density · hero = artist/media + recipient relevance statement · editorial · one recipient CTA · lime = selective CTA. Each of the 6 views needs its own decision grammar (hero · relevance line · first media · vocabulary · CTA · depth), not just ordering.
- **Admin — Operational Governance**: dense, calm, exception-first, human microcopy over error codes.

**Screen Design Contract** (required header before any visual work): entity · workspace · screen ID · experience profile · archetype · canonical object · primary question · outcome · CTA · secondary actions · entry/exit routes · permissions · state machine · DS patterns · mobile+desktop layout.

**Wave 1 anchor screens**: ART-RAD-020 · ART-PAS-001/010/020/030 · REP-ROS-001 · REP-ROS-030 · REP-OPP-010(Prepare) · REP-OPP-050 · PRO-GRO-001 · PRO-EVT-001 · PRO-EVT-040 · PRO-EVT-050 · 6 external Passport anchors.

**DS Layer plan**: 1 Foundations · 2 Core components · 3 LOCK professional components (Evidence State, Source/Method, Freshness, Conflict, Visibility, Next Move, Offer, Stage Slot, Dependency, Waiting-On, Authority, Handoff, Live Issue) · 4 Entity patterns · 5 Expression profiles. DS stays 🔴 until Layers 3–5 exist.

Format per row: `ID · Name · Archetype · Canonical object · Primary question → Primary action · States built · Routing (entry → exit) · Ruling`
Rulings: KEEP · REFINE · SPLIT · MERGE · BUILD (locked decision) · REMOVE.

## ENTRY
- `SYS-ENT-001` Login · Process · session · "Who am I?" → Sign in · rich, error(copy only) · entry→hub/last-view · REFINE (real validation P2)
- `SYS-ENT-002` Signup intent · Decision · workspace_membership · "What do I do first?" → Pick intent · rich · login→onboarding per entity · KEEP
- `SYS-ENT-003` Workspace hub · Directory · workspace_membership · "Which hat?" → Switch workspace · rich, first-run note · avatar→any home · KEEP (first-run note = state, MERGE row)
- `SYS-ENT-004` Account & access · Settings · user · "How is my account set?" → Save · rich · hub→back · REFINE (split Profile/Security/Privacy)

## ARTIST
- `ART-ONB-001..003` Onboarding → scan → who-you-are · Wizard · act, claim(candidate) · "Start my universe" → Launch scan · rich, empty-scan `ART-ONB-004` · signup→radar · KEEP
- `ART-RAD-001` Radar Universe · Explore/Intelligence · claim-set per planet · "Where do I stand?" → Open planet/next move · rich, reduced-motion, a11y, act-switched · home · KEEP
- `ART-RAD-010` Planet inspector (sheet) · Detail-preview · claim · "What's here?" → open workbench · rich · radar→`ART-RAD-020` · REFINE (preview only)
- `ART-RAD-020` **Category Workbench · Workbench · claim+source · "Review/correct/strengthen this category" → Resolve the record · BUILD (P0 — replaces sheet editing; Overview·Information·Media·Sources)**
- `ART-RAD-030` Scene · Intelligence · signals · "What does the scene want?" → Review signal · rich · radar tab · KEEP
- `ART-PAS-001` **Passport Library · Collection · passport(versions) · "My views & their state?" → Open a view · BUILD (P0 split)**
- `ART-PAS-010` Composer · Workbench · passport(draft) · "Build this recipient's story" → Continue to preview · rich, 8 vis sections · library→preview · SPLIT (from current combined screen)
- `ART-PAS-020` Exact Preview · Preview · passport_view · "What will they see?" → Continue to publish · via composer · SPLIT
- `ART-PAS-030` **Publish Review · Decision · version diff · "What changes when I publish?" → Publish this version · BUILD (P0)**
- `ART-PAS-040` Share · Transaction+Receipt · share_link · "Send one view safely" → Copy/send link · rich, link manager, expiry · published only · KEEP
- `ART-INB-001` Inbox · Work Queue · enquiry/access/share refs · "Who waits on my decision?" → Route to owner · rich, stale · routes to canonical destinations · REFINE (object-routing audit P1)
- `ART-SYS-001..003` Multi-Act / switched / save-failed · Directory/State/Recovery · act · KEEP

## REPRESENTATION
- `REP-ONB-001..003` Onboarding (who/company/team) · Wizard · org, seats · KEEP
- `REP-ROS-001` **Roster Overview · Command+Intelligence · roster · "How is my roster moving & what needs me?" → Top signal CTA · BUILD (locked merge of Growth+Attention; tabs → Overview·Artists·Access)**
- `REP-ROS-010` Artists · Directory · act cards · "Find an act" → Open artist · rich, search, sticky add, import wizard · KEEP
- `REP-ROS-020` Access · Management · mandate · "Who may act, until when?" → Review mandate · active/pending/expiring/invite · KEEP
- `REP-ROS-030` **Artist Workspace · Detail · act (rep view) · "What's this act's story & my next move?" → Next move CTA · BUILD (P0: Overview·Pitch Kit·Passports·Access — replaces button grid)**
- `REP-ROS-040` Pending access (both sides) · Decision · mandate · perms+duration chooser · KEEP
- `REP-OPP-001` Opportunities · Pipeline · case · "What moves money to a decision?" → Open case · Active(stage chips)/Waiting/Closed · KEEP
- `REP-OPP-010` Case · Case Detail · case · "What stands between this and a decision?" → Next move · thread, approval, receipts · REFINE (add Brief·Prepare·Conversation·Decision tabs; Prepare = P1 signature)
- `REP-OPP-020` Capture enquiry · Process · enquiry→case · KEEP
- `REP-OPP-050` **Confirmed Handoff · Transaction+Receipt · handoff pack · "Hand it over cleanly" → Send to Production / Export · BUILD (P0 — ends pre-booking)**
- `REP-INB-001` Agency Inbox · Work Queue · refs · Needs reply/Waiting/Done · KEEP
- `REP-SET-001` Team & settings · Management · seats · KEEP

## PRODUCTION (locked IA: Growth · Events · Inbox)
- `PRO-GRO-001` **Growth · Intelligence · production patterns · "How is my production world moving?" → Explore a change · BUILD (P0 — Pulse·graph modes·What changed·footprint·formats·network·friction)**
- `PRO-EVT-001` Events home · Directory · event · "Which show needs work?" → Open event · tabs **In motion·Coming up·Done** (rename pending), Needs-your-hand lead · REFINE
- `PRO-EVT-010` Event board / Line-up · Timeline · slot · "Who plays when, what's moving?" → Open slot · running-order rail (Main; extend all stages P1) · REFINE
- `PRO-EVT-020` New event · Wizard · event · accordion Basics/Vibe/Night, multi-day+stages · KEEP
- `PRO-EVT-030` Slot deciding · Decision · slot+candidates · event-fit, compare, case pointer · KEEP
- `PRO-EVT-031` Slot confirmed · Detail · slot · Will-it-fit + logistics + owner · KEEP
- `PRO-EVT-040` Advance · Workbench · advance items+owners · KEEP
- `PRO-EVT-050` **Show Day · Live takeover · event(live) · "What's happening right now?" → Resolve live issue · BUILD (P0 — full-screen NOW/NEXT/ARRIVALS/STAGES/ISSUES/CONTACTS, not a sheet)**
- `PRO-EVT-060` Booking Case (producer window) · Case Detail · same case record as REP-OPP-010 · KEEP
- `PRO-INB-001` Inbox · Work Queue · Needs reply/Waiting/Done · KEEP
- `PRO-SET-001` Team & settings · Management · roles=permission bundles · KEEP
- `PRO-TDY-000` Today desk · — · — · **REMOVE as destination (locked #5)** — content → Growth/Events/Inbox/Show-Day

## EXTERNAL RECIPIENTS
- `EXT-PAS-BOOKER / PRODUCER / PRIVATE / REP / PROG / BRAND` · Editorial recipient views · passport_view(link) · "Is this act relevant to me?" → one recipient CTA · 🟡 pending recipient coverage matrix (order ≠ experience) · REFINE
- `EXT-REQ-001` Request sheet · Transaction+Receipt · enquiry · KEEP
- `EXT-ERR-001` Dead link · Exception · share_link states · REFINE (6 states: expired/revoked/replaced/unpublished/withdrawn/wrong-recipient)

## SOURCE CONFIRMATION
- `CNF-001..003` Confirm / answered / wrong-person · Decision+Receipt · confirmation_request · REFINE (claim → bounded attestation statements)

## ADMIN
- `ADM-001` Signal cockpit · Governance · system_signal, exceptions · REFINE (exception rows need resolution actions: quarantine-merge / request review / keep separate)

## DESIGN SYSTEM
- `DS-001` Component gallery · Reference · 🔴 until coverage audit (tokens, breakpoints, RTL, states, motion, a11y, content limits)

## Global audits still owed (gates before visual rounds)
Business-logic matrix (owner/permission/state machine per screen) · interaction audit (entry, back, deep-link, context preservation, resume, concurrency, stale protection) · authority semantics (assistant/agent/owner — explain, don't hide: "Dana can approve this → Ask Dana").
