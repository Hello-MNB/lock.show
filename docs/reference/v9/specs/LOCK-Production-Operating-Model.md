# Production Operating Model — Event × Slot × Booking Case × Artist Advance

Design plan, 6 August 2026. Source: external Production-strategy assessment (triaged below) + Prototype Spec v8.4.
Status: **screen plan approved-pending-owner-review. Nothing here is built yet.**

## 1. Triage of the assessment

**Adopt now — design as P0 prototype surfaces:**
1. **Production Daily Desk** — Production home answers "what must my team move today", not "browse events".
2. **Canonical Booking Case** — one transaction spine per artist×slot: enquiry → availability → hold → terms → approvals → confirmed. Merges with our open "CTA case-state progression" decision.
3. **Artist Advance** — the confirmed→performed gap; the biggest missing value. Includes the 5-property field model (Value · Source · Owner · Status · Updated at).
4. **Feasibility block** on Slot detail — "Can we deliver?" (rider vs stage) next to "Should we book?".
5. **Availability & holds** — hold level, expiry, owner; lives inside the Booking Case + a Desk lane.
6. **Call-outcome receipt** — 15-second receipt (decision, next action, owner, deadline); the strategic principle "LOCK doesn't replace conversations, it stops them being the only source of truth" is adopted verbatim.
7. **Show-day artist sheet** — read-optimized mobile state of the Advance.

**Adopt later (P1):** conflict engine (already parked), artist-budget exposure, templates/cloning, announcement & approved-media workflow, cross-event artist history, post-event debrief → RADAR loop (design the closeout card now, the loop later).

**Integrate, never build (locked scope rule):** WhatsApp/email/calendar/Drive/e-sign/ticketing/accounting/PM tools/radios. LOCK owns status + latest version + owner + deadline; delivery happens on the user's channels.

**Rejected:** general team chat, full ERP ambitions, seat for every specialist (kept: seats for recurring work, bounded actions for specialists — already our canon).

## 2. Navigation (per owner ruling: bottom nav = daily work; management = top bar)

- **Bottom nav (Production):** `Today` (Daily Desk — the new home) · `Events` · `Lineup` · `+ New`
- **Top bar:** bell (action inbox) · avatar → hub → Team & settings. Unchanged.
- Drill-ins (no nav slots): Slot detail, Booking Case (sheet), Artist Advance (screen), Day sheet (state of Advance).
- Routing rule: every Desk card has ONE primary action that deep-links into the owning surface and returns (`return_to` contract).

## 3. Screens & sub-screens

### S1 · Production Daily Desk — "Today" (new screen)
- Header: date · workspace · counts strip (`3 decisions · 4 waiting · 1 at risk`).
- **Lanes** (collapsible, in this order): Needs a decision → At risk → Waiting on artist/rep → Confirmed but not ready → Next 48 hours → Recently done.
- **Card anatomy (fixed):** Event · Stage · Slot / Artist / state chip / one "why it matters" line / `waiting on X · due Y` / ONE primary action.
- Empty lane = hidden. Zero cards = "Nothing needs you today" + next scheduled item.

### S2 · Booking Case (bottom sheet, opens from Desk card or Slot candidate)
- Header: artist × event × slot + **stage ladder** chips (Enquiry → Availability → Hold → Terms → Approvals → Confirmed), current stage lit.
- **Hold block:** level (soft/first hold), expiry countdown, Extend / Release (confirm popup).
- **Terms block:** fee · payer · who-signs (named authority) · terms version rows (v2 replaces v1, dated).
- **Approvals:** bounded rows — Finance, Venue/Client — each `approve / comment / request alternative` (action popup). No seats for approvers.
- **Thread:** dated action receipts incl. channel chips (call · WhatsApp · email). `+ Log a call` opens the **call-outcome receipt popup**: decision / next action / owner / deadline — 4 fields, nothing else.
- Footer: case-aware CTA (Check availability → Send offer → Chase approval → Confirm booking), permission-gated at Confirm.

### S3 · Artist Advance (full screen, from confirmed slot / Desk)
- Header: artist · event · show-date countdown · **readiness meter** ("7 of 12 items in place").
- **4 mobile tabs** (10 doc tabs merged for 390px): `Overview` (open items by owner + deadline) · `Show & tech` (set time, soundcheck, changeover, rider + stage plot version rows) · `Travel & stay` (flights, ground, hotel) · `Access & hosp` (party list, credentials, guest list, dressing room, meals).
- **Every field row carries the 5 properties:** value · source chip (artist / rep / production) · owner · status dot (current / stale / missing) · updated-at. Tap → **field popup**: version history, mark current, replace, request update.
- **Request from artist** — self-service link sheet (copy link / WhatsApp, reuse invite-panel pattern) + auto-reminder toggle; sends become thread receipts.

### S4 · Show-day sheet (toggle state inside Advance: "Day view")
- Read-first: today's schedule (arrival → soundcheck → changeover → set), named production contact + TM phone, **What changed** log, missing items in red. No editing on this surface.

### S5 · Slot detail upgrade (existing screen)
- Deciding view gains **"Can we deliver?"**: 3 compare rows (power ✓ · monitors ⚠ 2 wedges short · changeover 15 min tight) + verdict chip `Feasible — with conditions` feeding the Booking Case.

### Popup/sheet inventory
call-outcome receipt · hold extend/release confirm · approval action (approve/comment/alternative) · field version history · request-from-artist link · reminder receipt toast · closeout debrief card (P1 stub in "Recently done").

## 4. Order of build
1. Daily Desk (nav change + screen) → 2. Booking Case sheet → 3. Artist Advance (+ day view) → 4. Slot feasibility block.

## 5. Field validation caveat
The assessment's evidence is global; Israeli WhatsApp/payment/procurement behavior needs 6–8 direct interviews (promoter, festival booker, producer, technical producer, liaison, venue rep, owner) before this model is treated as validated.
