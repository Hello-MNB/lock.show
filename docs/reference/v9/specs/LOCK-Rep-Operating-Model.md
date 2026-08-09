# Representation Operating Model — Roster × Artist × Opportunity × Relationship

Design triage, 6 August 2026. Source: external Representation-strategy assessment + Prototype Spec v8.4.
Status: **plan only — nothing built yet.** Sibling doc: `LOCK-Production-Operating-Model.md` (same method).

## 1. Triage of the assessment

**Adopt now — P0 prototype surfaces:**
1. **Opportunity Case** — the canonical object the Rep side is missing. Wider than a Booking Case: booking / festival / brand / media / collab / sync / private. Status ladder New → Qualifying → Waiting → Proposed → Approval → Accepted/Declined/Expired; one owner + real deadline; named missing info; becomes/links to a Booking Case once a concrete date-slot exists.
2. **Cross-roster Opportunities desk** — the rep equivalent of Production's "Today". Lanes: Revenue waiting → Approval required → Artist waiting → External waiting → Representation at risk → Money at risk. Same fixed card anatomy (artist / opportunity + reason / state / waiting on / owner / deadline / ONE action), lanes as tabs (per the Today pattern).
3. **Approval-on-behalf loop** — the assistant is the daily operator (already canon); complete the loop: assistant drafts → principal/artist reviews the EXACT outgoing text → approve / edit / decline → sent on the original channel → durable receipt. Granular scopes (reply ≠ quote ≠ negotiate ≠ confirm; confirm always restricted).
4. **Channel-to-record capture** — highest-leverage tactical feature: paste/share a WhatsApp enquiry → LOCK proposes artist, contact, org, date, territory, fee, missing questions → assistant confirms → Opportunity Case + draft reply + approval request. AI assists extraction only; never promises availability, quotes, negotiates, or messages externally on its own.
5. **Contact / relationship card** — factual relationship memory: identity, markets, languages, preferred channel, relationship owner, artist relevance, history receipts (`Booked twice · paid in 34 days · prefers WhatsApp · last spoke 12 Jul`), restrictions, next action. **Locked restriction: facts only — no trust scores, no covert behavioural scoring.**
6. **Tiered Offer Matrix** (already an open decision) — approved ranges by recipient type × event type × territory × format, each row with terms + a visibility rule (approved range / on request / named buyer only / agent-only). Internal minimums are never auto-exposed; "quote within range" is a permission.
7. **Artist-specific panel content** — verify/fix: every roster artist must resolve to its own panel data.

**Adopt later (P1):** territory/language/market workspace (Markets tab), availability & holds for booking agencies, asset eligibility layer (freshness/rights/approved-use — not storage), campaign coordination, payment/commission status, post-gig learning, roster-scale search & saved views, representation-model onboarding depth (co-management, territory rep, project mandates).

**Integrate, never build (scope rule, same as Production):** WhatsApp/email/phone (capture + receipts only), DISCO/music assets, Chartmetric/Soundcharts (pull signals into RADAR with method+timeframe), Bandsintown, Drive, accounting, e-signature, social publishing, general PM.

**Rejected:** relationship scores ("Trust: 72"), autonomous AI outreach, rebuilding a general sales CRM, executive vanity dashboard.

## 2. Navigation (owner ruling: bottom nav = daily work; management = top bar)

- **Bottom nav (Rep):** `Roster · Opportunities · Access` — Opportunities takes the middle slot; the Artist panel stays a drill-in from a roster row (as today). Access remains daily work (grants/requests). Team & settings stays in the top-bar hub.
- **Drill-ins:** Artist panel, Opportunity Case (sheet), Contact card (popup), Capture (sheet), Approval review (popup).

## 3. Screens & sub-screens

### R1 · Opportunities — cross-roster desk (new screen)
Header: workspace + counts strip (`3 revenue · 2 approvals · 1 at risk`). **Lane tabs** (Today pattern): Revenue · Approvals · Artist · External · At risk · Money. Fixed card anatomy, one primary action deep-linking to the Case / approval / panel. Sticky footer or header action: **+ Capture an enquiry**.

### R2 · Opportunity Case (bottom sheet)
- Header: artist × org/contact + **type chip** (Booking / Brand / Media / …) + territory.
- Stage ladder chips (New → … → Accepted).
- **Value & requirements** rows (fee range, dates, format, exclusivity).
- **Authority block:** who may reply / quote within range / negotiate / confirm (confirm greyed for assistants).
- **Missing info** list (named, with ask-buttons).
- **Thread** of receipts across channels + `+ Log a call` (reuse the Production receipt popup).
- Case-aware CTA: Qualify → Draft a reply → Send for approval → Mark accepted; a live booking gains "Open as Booking Case".

### R3 · Capture sheet ("+ Capture an enquiry")
Paste field (demo: pre-filled WhatsApp text) → **proposed structure** (artist, contact, org, date, territory, fee mentioned, 2 missing questions) each as a confirm-able chip row → "Create the case" → receipt + case opens with a draft reply queued for approval.

### R4 · Approval review (popup — principal side)
"SHIDAPU — reply to Ozen Bar" · the exact outgoing message in a quote block · scope line ("within the approved range · no availability promised") → **Approve & send / Edit first / Decline** → receipt filed to the case.

### R5 · Contact card (popup, from case or desk)
Identity + org, markets, languages, preferred channel, relationship owner, factual history receipts, restrictions, next action + owner + deadline. No scores anywhere.

### R6 · Offer Matrix (Artist panel section)
Table rows: context (Club · IL · DJ set / Corporate / Municipality / EU festival / Private) → range, terms, visibility chip. Footer note: "Internal floors are never shown externally · quoting within range is a permission."

## 4. Order of build
1. Opportunities desk + nav swap → 2. Opportunity Case sheet → 3. Capture sheet → 4. Approval popup → 5. Contact card → 6. Offer matrix section.

## 5. Validation caveat
Assessment is global; validate with the true daily users — two agency assistants, one principal, one live agent, one indie manager, one territory rep (Israeli terminology and WhatsApp practice specifically). Bulk-import status must be verified in the live prototype (docs conflict).
