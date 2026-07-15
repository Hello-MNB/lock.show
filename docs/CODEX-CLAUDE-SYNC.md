# CODEX ⇄ CLAUDE — Synchronization Protocol (the ONE management layer)

_Owner directive (10 Jul): both agents must speak from the same management documents, stay synchronized,
and stay goal-focused. This file is the index — which document is authoritative for what, what each side
owes the other, and the live status of cross-team asks. **Both agents read this first; Maria arbitrates.**_

## 1. Document authority map (who rules what)

| Domain | Authoritative document | Owner |
|---|---|---|
| Product canon + FIREWALL | `CLAUDE.md` (repo root) | Maria (fixed) |
| **Visual quality / design law** | Drive `00_CURRENT/LOCKSHOW_Design_System_CURRENT.html` | **Codex** |
| Entities, signup/routing, pricing ruling | `docs/CODEX-FUNCTIONAL-CONTRACTS.md` | **Claude** (from live code, nav-contract-tested) |
| **Entity vocabulary (canonical terms)** | `docs/ENTITY-GLOSSARY.md` = DS v1.5.6 `#entity-hierarchy` + code mapping | **Codex** names (DS) · **Claude** code-binding · **Maria** HE terms |
| Token backlog (what the DS still owes) | `docs/CODEX-TOKEN-COMPLETION-MAP.md` + `docs/CODEX-DS-v1.4.2-AUDIT.md` (work order, 7 ranked asks) | Claude audits → Codex delivers |
| Approved visual directions (prototypes) | `docs/prototypes/REGISTRY.md` (`00_CURRENT/`: radar-v4, passport-v3) | Claude curates, Maria approves |
| **Live app reality (what screens actually look like)** | `docs/design-system/current-screens/*.png` + `docs/CODEX-RADAR-VISUAL-SPEC.md` | Claude captures |
| Release state / task board | `docs/TASK-STATUS-BOARD.md`, `docs/releases/` | Claude |

Conflict rule: **canon (CLAUDE.md) > functional contracts > DS > prototypes.** A DS rule may not contradict
the firewall or the routing table; a prototype may not contradict the DS once v1.5 lands.

## 2. The handshake (who owes whom)

**Codex → Claude (so Claude can implement without inventing):**
1. 🔴 **A13 tokens-to-code map** — named token · hex · CSS var · Tailwind key · light+dark value · AA
   ratio. THE blocking deliverable for the app re-ground.
2. 🔴 Per-surface token VALUES (Paper / White card / Forest / Media overlay).
3. 🟡 Hebrew display face decision + font tokens; 5-state + method-label tokens in **canon vocabulary**
   (Producer-confirmed / Source-linked / Evidence-supported / Self-declared); draw band+binary component
   spec. (Full list: `CODEX-DS-v1.4.2-AUDIT.md` §ranked asks.)

**Claude → Codex (so Codex designs from reality, not imagination):**
1. ✅ Functional contracts (routing table, vocabulary, pricing ruling).
2. ✅ Token drift audit + work order.
3. 🔄 **Real screenshots of the live app** (Radar desktop+mobile, desktop sidebar, mobile bottom-nav,
   entity switcher, agency roster, public Passport) → `docs/design-system/current-screens/` + the Radar
   visual spec (`CODEX-RADAR-VISUAL-SPEC.md`). _Delivered 10 Jul._
4. Ongoing: an audit of each Codex DS release within a day, appended to this repo.

## 3. Claude ACCEPTS Codex's "Token and data alignment · Claude handoff" rules
Confirmed, verbatim intent: DS is the authority for visual quality · Claude does not invent UI styling ·
every screen maps to DS tokens · DB/client states are translated into UX language · Radar never becomes a
score/gauge/rank UI · every implemented view declares **entity, role, act, privacy state, next action** ·
only governed `lockshow-*` assets, exceptions documented.
**Reciprocal condition:** these rules are executable only once the A13 values exist. Until then the app's
current tokens stay frozen (no new invented styling), and the re-ground starts the day A13 lands.

## 4. Live cross-team status

| # | Ask | Direction | Status |
|---|---|---|---|
| 1 | A13 tokens-to-code map | Codex → Claude | ✅ DELIVERED 10 Jul (`docs/design-system/A13-TOKEN-VALUES.md`) — mapping layer UNBLOCKED |
| 2 | Per-surface token values | Codex → Claude | ✅ delivered inside A13 (app dark-first ratified; marketing paper) |
| 3 | Build-blocker specs (band/binary, Radar states, motion/radius/spacing, HE token, OG contract) | Codex → Claude | 🟠 now v1.6.2 (+Artist-lane N1–N12 DOD with per-screen Claude/Cowork proof columns) — **Claude independent audit PENDING before binding** |
| 3b | Physical files INTO git | Owner/Codex → repo | 🟢 MOSTLY CLOSED 12 Jul night: OG exports ✅ (8dde17e) · logo/icon SVGs ✅ (2c66d24, byte-faithful from 02_ASSETS, firewall-clean). REMAINING: 4 atmosphere PNGs + social cover are 1.4–1.9MB each — too large for the MCP transfer path; **Cowork commits them from its local clone** (one copy+commit), or Codex exports web-weight webp (≤150KB) to Drive for me to carry |
| 3c | DB-state inventory (states vs actions) + post-implementation screenshots | Claude → Codex | 🟡 Claude owes |
| 4 | Live-app screenshots + Radar visual spec | Claude → Codex | ✅ delivered (`current-screens/` ×12 + `CODEX-RADAR-VISUAL-SPEC.md`) |
| 5 | v1.4.2 audit (what Codex misread / still owes) | Claude → Codex | ✅ delivered (`CODEX-DS-v1.4.2-AUDIT.md`) |
| 6 | Functional contracts | Claude → Codex | ✅ delivered |

## 5. Working rhythm
Codex releases a DS version → Claude audits within a day → updates §4 → Maria hands the delta back to
Codex. Claude ships app code → the affected screenshots in `current-screens/` are re-captured → Codex
reviews visually. Small loops, both sides always reading THIS file first.

## 6. Answers to Codex's 10 handoff questions (10 Jul, "typography-qa" release)

1. **Replace app tokens or mapping layer first?** → **Mapping layer first.** I alias the DS token names
   onto the existing Tailwind keys, migrate screens batch-by-batch, then delete the legacy aliases.
   Zero-breakage path; re-ground starts the day values arrive.
2. **App dark-first vs site paper?** → Already ruled (Surface Language Contract, owner-affirmed):
   **paper for task surfaces** (settings, requests, forms, onboarding), **dark only for media/proof
   moments** (Radar universe, Passport hero). The app migrates task surfaces to paper.
3. **EN app UI font?** → Recommend **split by LANGUAGE, not surface**: Manrope for EN UI, Heebo for HE
   (one `--font-ui` token resolving per locale). Codex specifies; Maria tastes.
4. **Frank Ruhl Libre in app headings?** → Recommend **editorial serif = marketing/display only**; app
   headings use the UI stack. The HE display face decision is still Codex's open item (A1).
5. **Radar sectors: 6 planets/18 nodes or 12-sector?** → **6 planets / 18 nodes is the LIVE,
   owner-approved model** (see radar-v4 prototype + screenshots). The 12-sector wheel is a legacy
   prototype. Keep 6; revisit post-validation.
6. **First onboarding input?** → Live truth (owner order, 8 Jul): **stage name + ONE strongest link**
   (2 screens, 4 fields). Multi-link paste = a later upgrade loop, not v1.
7. **Comparison mode in v1?** → **Defer.** ⚠️ Firewall watch: "compare to field/genre norms" must never
   render as percentile/position — if ever built, bounded qualitative bands with method labels only.
   Owner call before any build.
8. **Which image assets to copy into the app repo?** → The 4 `lockshow-atmosphere-*` entity scenes +
   `lockshow-icons.svg`; copied when the re-ground batch that uses them starts.
9. **Old `gigproof-*` docs in the repo?** → Quarantined to `docs/design-system/archive/` (kept for
   history, never referenced by new work).
10. **Who owns the final token-to-code map?** → **Split: Codex owns token names + hex values + AA proof
    (design law); Claude owns the code binding (CSS vars / Tailwind keys) and keeps the map file in the
    repo, versioned.** One file, two columns of ownership.

**The one still-blocking gap in the handoff:** Codex's §7 mapping table has token NAMES on both sides but
still **no hex values, no light+dark pairs, no AA ratios**. That values-table (A13) remains ask #1. The §8
state list is accepted — Claude will supply the authoritative DB-state inventory (states vs actions
separated) as the next Claude→Codex deliverable.

## 7. Responsibility map (owner question, 12 Jul — recorded verbatim intent)
UX/UI + journey DESIGN = Codex (DS). Journey/switching IMPLEMENTATION + code-proof = Claude (nav contract).
Real-browser QA = Cowork (C1, pending). Approval = Maria only. No single end-to-end UX owner — split model,
Claude integrates. Open spec-vs-reality hole owned by Claude for rel-07.13: "Add workspace" no-op
(switching exists, creating a 2nd workspace from the UI does not — flow-gap P).

## 8. Codex proofread (12 Jul) — verdicts
- DS v1.5.5 accepted as current; Claude audit will target v1.5.5. ✓ _(superseded same day by v1.5.6 — audit targets v1.5.6.)_
- Booker/Operator switching: Codex CORRECT — only Artist/Manager/Production are workspace-derived (ORG_DERIVED_ROLES); uniform switching = target. Map fixed.
- Migration alarm: RESOLVED — origin/main has 030+031; Codex clone was stale. Standing rule: git pull before reading the repo.
- Release evidence: app a874ab5+eafcd4e (bundle index-BsilpHPv.js, 5 fingerprints) · site 917ef57 · embed index-Ck72SQdv.js — in DEPLOY-LOG.
- Cowork "Version Governance Audit" task: ACCEPTED as C6 (live vs repo heads, fingerprints, approval evidence).

## 9. Entity terminology reconciliation (12 Jul, owner-triggered) — DS v1.5.6
- Owner flagged entity-term mixing; Claude's code audit CONFIRMED (3 meanings of "producer", split "booker" — evidence in `docs/ENTITY-GLOSSARY.md` §1).
- Codex v1.5.6 `#entity-hierarchy` table ACCEPTED, incl. **Source Confirmer** = accountless bounded magic-link task — NOT a role, NOT a workspace. Claude will never build it a workspace shell (code already agrees: `ROLES.PRODUCER` is a fallback, absent from signup).
- **One flag back to Codex:** "Source Confirmer" (person) vs canon method label "Source-linked" (different method) — proximity risk. Ruling to ratify in DS: Source Confirmer = mechanism name only; chip vocabulary stays exactly canon (Producer-confirmed / Source-linked / Evidence-supported / Self-declared), never "source-confirmed".
- HE canonical column = Maria's decision (proposal in glossary §2).
- String-level fixes (6, zero data risk) folded into rel-07.13; enum/DB renames = migration 033+ governed, not now.

## 10. DS v1.5.8 demand-side correction (12 Jul, Codex handoff) — PROCESSED, verdicts
- **Codex CORRECT, and the code already agreed:** BT-56–58 ruling in `constants.js:9-10` / `UserTypeSelect.jsx:32-34` — אמרגן = supply-side talent agent; mapping אמרגן→BOOKER was "a critical domain inversion". The inversion had survived in: `docs/GLOSSARY.md` v1.0 line "Buyer = אמרגן" (now v1.1, corrected), old CLAUDE.md gloss (corrected), 8 he.js buyer strings (fixed → מזמין vocabulary), 7 en.js agency-team strings that called agents "Booking manager" (fixed → "booking agent"), site faq "(amargan)" + two (אמרגנים) glosses + llms.txt + messages/en.json (Hebrew-in-EN purity violation) + messages/he.json scaffold. ALL fixed 12 Jul, both builds green.
- Demand-side segmentation table adopted (glossary §2b): pro buyer / private client / corporate / planner / production — register per audience; private clients get NO workspace, only Passport review/contact.
- Bonus catch from the sweep: 3 live UI strings + 1 comment used forbidden דרכונים → fixed (repo now 0 hits).
- Claude's earlier ENTITY-GLOSSARY first edition repeated the inversion in its Booker row — self-corrected, marked superseded.
- Agency-side strings that correctly use אמרגן (roster team) KEPT.
- HE final taste (מזמין הופעות vs מנהל בוקינג etc. per context) = Maria.

## 11. DS v1.6.0 handoff (12 Jul) — Claude verdicts on the 5 "old wording" issues
| Codex claim | Verdict | Evidence |
|---|---|---|
| GLOSSARY.md still "Buyer = אמרגן" | **STALE CLONE** — fixed in v1.1 same day | commit a3fc01d; rule remains: git pull before scanning |
| he.js workspaceBooker 'מרחב אמרגן' | **STALE CLONE** — already 'מרחב מזמין הופעות' | a3fc01d |
| "להעריך אמנים" evaluation language | **REAL → FIXED** — jobBooker (both languages) → context/clarity wording; artist-facing readiness emptyTitle → "build your professional picture". Canon band-state 'לא-ניתן-להעריך' (not-assessable) KEPT — it is a method label, not judgment voice | this commit |
| SIGNUP_ROLES includes PRODUCER | **REAL → FIXED** — removed (constant was consumed nowhere; Source Confirmer ≠ signup) | this commit |
| Private clients not represented | **ACCEPTED as plan item** — /bookers one-line acknowledgment + FAQ in rel-07.13; full private-client page = post-validation (canon Gate audience = professional buyer) | rel-2026.07.13-PLAN §1 |
Also adopted: per-entity DOD structure into the release plan; QA/QC protocol (Q1–Q8) now binding — a version is not valid until it passes.

## 12. Cowork entity-table + localizer handoff (12 Jul) — Claude verification verdicts
- Entity table: **VERIFIED against code, merged** into ENTITY-GLOSSARY §2c (single source kept — no competing glossary). ⭐ Booker-as-private-individual insight adopted (wedding couple = מזמין הופעות; warm register in buyer copy).
- "Public Passport review needs no login": **TRUE** — `/passport/:id` route sits outside all RequireRole guards; anon reads gated only by claims_public_read RLS (artist_approved).
- מאשר-מקור recommendation: **matches EXISTING canon** — GLOSSARY locked "Source Confirmer = מאשר-מקור" on 8 Jul (v1.0). So this is a confirm-and-retire-alias ruling, not a new term (ENTITY-GLOSSARY §2d #1).
- Act HE: correctly flagged as the still-open ruling (never invent — canon rule).
- Release-train strategy: **ADOPTED** as rel-2026.07.13-PLAN §4b (preview-first, additive-032-now, backups-before-033+, atomic go-live, rollback SHAs). One correction applied: previews are OFF globally (quota) — the preview lane needs a one-time hook/enable by Cowork, not a routine push.
- Supabase Pro backups: prerequisite for STRUCTURAL migrations (033+), not for additive 032 — sequencing recorded; $ decision = Maria.

## 13. TASK-HANDOFF PROTOCOL (owner directive, 12 Jul — BINDING for Claude/Cowork/Chat/Codex)
Every task passed between agents MUST contain: (1) **full self-contained text** — never shorthand
that assumes the reader saw another conversation; (2) **explicit source-of-truth references** (repo
path and, for Codex, the Drive path) so all agents loop on the SAME truth; (3) the reasoning (why),
not only the what — "Codex cannot act without comprehensive, reasoned information."
Until repo and Drive truth are fully mirrored: repo docs are canonical for entities/vocabulary/
releases (`docs/GLOSSARY.md`, `docs/ENTITY-GLOSSARY.md`, `docs/VERSIONS.md`,
`docs/releases/rel-2026.07.13-PLAN.md`, this file); Drive `00_CURRENT` is canonical for the DS.
**Roles:** Cowork = technology/execution tasks + manages the project GPT (keeps the overall
project archive updated with every canon change). Codex = design law, needs full briefs. Claude =
implementation/code-proof + keeps repo docs current. Maria = arbiter; relays between Drive and repo
where an agent can't reach.

## 14. DS v1.6.1 ownership map (12 Jul) — RATIFIED, one language for all agents
Codex's v1.6.1 workstream table ACCEPTED — it matches §13 exactly: Codex = brand/DS/UX/UI law
(evidence: DS + changelog + source map) · Claude = development in the repo (evidence: diffs,
tests, screenshots, deploy fingerprints) · Cowork = technical/API/flow QA (evidence: logs,
browser proof, QA report) + Drive/GPT operations (file hygiene, version notes) · Maria = release
approval, owner pass only. Status corrections on its remaining-gaps table (against repo truth):
- "App Hebrew/i18n terminology cleanup P0" → **already BUILT** on the branch (commits a3fc01d +
  f98bb41), awaiting Maria's Hebrew nod + the release train — it is a deploy-pending item, not
  an open build item.
- "Real app screenshots after token binding P0" → accepted, = existing Claude obligation (§4 3c),
  runs after the A13/v1.6.1 binding batch.
- "OG/social export path" ruling per §6 Q10 split: **Codex produces the export files, Claude
  commits them into the repo** (website-next/public) and wires metadata.
All other rows accepted as assigned. These tasks are now on the roadmap task tables (v20).

## 15b. NORTH STAR rel-07.13 (owner, 12 Jul) — read by ALL agents
**ALL ARTIST SCREENS, perfect interactive flow each** (12-screen set + flow DOD: SCOPE-rel-2026.07.13 §APP).
Artist lane FIRST; other entities after. Codex: artist-screen DS DODs + states specs are the priority
briefs. Cowork: Q3/Q4 QA weights the artist journey end-to-end. Entity architecture verified ready for
growth; structural debts (033+ renames) scheduled, not blocking.

## 25. GPT SPEC PACK DELIVERED + ADMIN PANEL SPEC + 🚩 LOCALIZATION PARITY (13 Jul)
- **GPT's 7-spec pack: DELIVERED** — team-readable Google Doc verified in Canon Mirror
  (1trfj1Vsod…); machine-readable ZIP (sha256 ae528e56…, 14 files) blocked by the known
  connector boundary — SAME transport pattern as F2–F6: Maria downloads GPT's ZIP → uploads to
  the mirror WHEN I start the P1 import (not needed before preview; the Doc + report carry the
  content). Import + reconciliation = my P1 task; Post-Gig data model = PROPOSAL ONLY, I review
  against existing migrations before any DDL.
- **GPT proactive-audit corrections ACCEPTED:** ① 90-day act-global freshness = bounded shortcut;
  P1 replaces it with FIELD-LEVEL freshness from registry freshness_rule ② artist-home progression
  state gets a BOUNDED read model (RPC/view), never raw analytics in the client ③ request
  recurrence states (awaiting-buyer, price, deadline, follow-up, closed-reason, gig-debrief) = P1
  with the Growth Loop.
- **🚩 LOCALIZATION PARITY FLAG — OPEN (owner rule: raised, not released).** Verified real
  (e.g. BookerHome:20 hardcoded English error). EN-first authoring + HE fallback ≠ HE completion.
  Owners per GPT: Claude Code = literal extraction to i18n keys on all P0 routes + parity gate;
  Codex = native-quality HE review; Cowork = real-browser EN/HE + RTL proof; GPT = inventory (49
  rows delivered). **My build batch now includes the P0-route literal extraction BEFORE
  PREVIEW-READY** (Source Confirmer ceremony, Booker home, public Passport errors, availability
  request, artist requests, agency + admin fragments). Closure = GPT's 6 conditions.
- **CLAUDE.md amendment: GPT's controlled text SUPERSEDES my draft** (it adds fallback-disclosure
  language). Sitting with Maria — her file, her paste.
- **ADMIN PANEL SPEC written (docs/ADMIN-PANEL-SPEC.md)** — owner order: the business view for
  Maria + Eran. Live ops queues documented; P0.5 Business Overview (funnel, outreach attribution,
  Gate tile, publish freshness, acts, health) via ONE bounded admin read model; P1 = GPT's ten
  operator queues landing WITH their automations. Access per ADVISOR-ACCESS-eran runbook.

## 24. GPT CONTINUOUS-VALUE AUDIT (13 Jul) — verdicts + rulings, P0 corrections executed
GPT's product audit (Growth Loop / per-entity pains / AI agents). **Every factual claim
code-verified TRUE:** post-M8 ended in fixed Share (ArtistDashboard:49) · BookerHome = paste-a-
link resolver, NO saved passports · multi-source Deep Scan NOT built · rel-PLAN still described
a Pricing page that SCOPE S8 unpublished. Honest audit, accepted with gratitude.
**RULINGS (Claude Code, release governor):**
- **Deep Scan = TARGET ARCHITECTURE ruling (GPT's option 1).** What is LIVE: per-evidence claim
  extraction. The canon's "$1 deep scan once at onboarding + cheap incremental" = the target,
  building P2 post-preview. Documented in FLOWS-PER-ENTITY §1; CFRO economics must price the
  CURRENT per-evidence pipeline separately from the PLANNED deep scan (no business number may
  assume an unbuilt process). CLAUDE.md canon text itself = owner's to amend; flagged to Maria.
- **Post-M8 derivation BUILT NOW (not just documented):** pickNextAction after publish now
  derives from state — open buyer request → REPLY (beats everything) · newest evidence older
  than 90 days → REFRESH PROOF (freshness = time state, never quality) · else share. New i18n
  actions replyRequest/refreshProof EN+HE. The FULL Growth Loop (gig debrief, freshness engine,
  buyer-signal themes, opportunity prep) = P1 after preview — vision ADOPTED as roadmap.
- **P0 doc corrections executed:** saved-passports overclaim fixed (honest resolver description)
  · deep-scan status inline · /artist/claims = panel note · "7 entity flows" · rel-PLAN pricing
  rows superseded by S8 · CFRO pack correction (see below).
- **GPT's 7 follow-up specs APPROVED** (CONTINUOUS-ARTIST-VALUE-SPEC, pain→feature matrix, AI
  agent governance, event/automation registry, post-gig data model — NO DB changes without my
  migration review, flow-correction memo = already executed here, retention-measurement spec).
  Boundaries: specs land in canon mirror; firewall rules 1–4 for agents ratified verbatim.
- **North-Star metric adopted:** "Active Acts completing a verified improvement cycle within
  30 days" — measures the PRODUCT's recurring value, never rates an artist. Retention events
  = P1 with GPT's spec.
- **Team batches ratified as GPT proposed** (Codex: 5 loop screens + AI-suggestion states ·
  Cowork: return-loop probes added to Q3 · CFRO: recurring-value willingness-to-pay split).

## 23. PRE-DEPLOY VERIFICATION MEGA-BATCH (13 Jul, owner order: "check the processes Claude built")
Owner-visible surfaces created: `docs/FLOWS-PER-ENTITY.md` (repo canon, from code truth) + the
Flows-per-Entity artifact + CFRO-VALIDATION-PACK (canon mirror, 1VntX6XSrOCxhXeBQCM5XoAKEK3oiGXNJ).
Each AI CHECKS Claude Code's work — not its own (independent verification, release rule applies):
- **COWORK (on preview):** execute Q1–Q8 against the 6 entity flows in FLOWS-PER-ENTITY.md
  literally — every numbered step, real browser; verify the 9 pilot analytics events actually
  write rows (analytics_event) incl. waitlist role/source/?src attribution; the 2 firewall
  watch-items; RPC gap-states (roster grants / production requests) on an empty org.
- **CODEX (its published Q4 list):** + one addition — cross-check the Flows artifact vs its DS
  user journeys; flag any screen the flow map claims that the DS doesn't cover (or vice versa).
- **GPT (next sentinel run):** drift-check FLOWS-PER-ENTITY.md + SCOPE-rel-2026.07.13 + canon
  pack against each other; flag contradictions; classify the flow doc into the canon set.
- **CFRO (CLAUDE CHAT):** validation pack v1 delivered to the canon mirror — 5 checks
  (signal points per lane, pricing posture, unit-economics sanity, v2.3-hypothesis→signal map,
  firewall-as-business-asset), verdict format defined; acts on the preview URL.
- **MARIA (Q8):** owner pass = walk Artist flow + Buyer flow on the preview like a stranger.
Nothing above releases a task on the checker's word — evidence comes back through Maria or me.

### §23b. AUDIT ROUND 1 RESULTS (13 Jul) — three audits received, every finding code-verified
**CFRO v2.4 (VALIDATED WITH NOTES — GO for preview).** Its 2 "missing signals" verified against code:
- `second_act_created` → **ALREADY EXISTS** as ACT_CREATED (RadarUniverse.jsx:197, A10); second
  act = count>1 per person. CFRO finding corrected with evidence.
- Republish/staleness → PASSPORT_PUBLISHED fires on EVERY publish incl. republish (cadence
  derivable from timestamps); the real gap was silent UNPUBLISH → **FIXED NOW**:
  `PASSPORT_UNPUBLISHED` event added (analytics.js + ArtistDashboard togglePublish). Both CFRO
  recurring-revenue hypotheses now have collecting signals BEFORE launch. ✅
- Scan-cost check confirmed: milestone path = pure UI over existing data, zero AI re-scans.
- Green Invoice = launch-day precondition for "one pays" — already on the owner board.
**Codex flow audit (adopted):** ① status language now 4-state everywhere: BUILT → PREVIEW-TESTED
→ Q4-PASSED → OWNER-APPROVED (a "built" claim is never a "safe" claim) ② my PREVIEW-READY
declaration will INCLUDE the proof pack it listed (Radar desktop+mobile, Passport buyer view,
/bookers 3-audience copy, /managers, /production, /producers, waitlist attribution, 360px) —
no proof pack, no declaration ③ buyer-segmentation copy + manager next-action value = Codex Q4
gates, my implementation.
**Cowork spec audit (4 gaps — all real, all CLOSED in FLOWS-PER-ENTITY.md same hour):**
① ArtistAccess handshake was missing from the DOC (code has it: agency access-requests card →
artist approves in Settings → grant active; orgs.js + Settings.jsx) — added as Manager §2 step 2
+ Artist step 10. ② Production outbound booking clarified: production BOOKS AS A BUYER via the
Passport link (no native outbound screen this release). ③ Payments-in-pilot now explicit: NONE,
deliberate; N10 = entitlement visibility only. ④ Milestone firewall grammar now INLINE in the
flow doc (journey ✓/●/○ — never %/level/count-of-8). Minor: AGENCY workspace vs artist_manager
marketing tag documented as deliberate 1:1 mapping.

## 22. F1 REGISTRY IMPORTED (13 Jul) — verdicts, one 🚩FLAG, next steps
- **GPT's delivery: EXCELLENT and verified** — 483 rows imported byte-exact (sha256 23069dba…,
  size 134,773 = Drive metadata; stats match its report exactly: 376 unique fields, 18/18
  segments, source-type distribution identical). The 107 shared field_ids = multi-source
  cardinality BY DESIGN (57 multi-source fields), not duplication.
- **My validator caught what GPT's QC missed:** 28 ticketing rows used 'artist-owned ticket
  export' instead of the governed 'artist-owned account export' channel. Wording drift only
  (intent preserved) — normalized on import, documented here. GPT: note for F2–F6.
- **`npm run validate:registry` now exists and is INSIDE `npm run verify`** — header order,
  closed enums, snake_case ids, duplicate field×source, field-name consistency, firewall-surface
  language, ticketing hierarchy. GPT's audit is now a permanent release gate (its rec #2 ✅).
- **Rulings on GPT's recommendations:** SOURCE-BRANDS.csv dictionary = ACCEPTED (next registry
  task) · derived-source semantics = OPTION A ruled (keep 4 display types; system-derived records
  are internal artifacts — document it in README before 034) · F2–F6 as controlled deltas =
  ACCEPTED · connector-feasibility file = ACCEPTED, post-launch.
- ✅ **FLAG RESOLVED (13 Jul): logo_asset ID FORMAT MISMATCH — closed with evidence.** Codex
  v1.6.15 ruled the **2-part `namespace:slug` format governs** and delivered the machine-readable
  map (29 brands, 7 columns, Drive id 1oPuKYNADdxHgc7bNbXi4CzAOSw5qMHVO). Reconciled mechanically
  via `scripts/reconcile-logos.mjs`: **134 pending rows → governed Codex IDs** (account variants
  share the parent logo: Spotify for Artists→codex:spotify etc.) · **138 unmapped rows →
  `generic:none`** (explicit no-logo state, text badge per Codex law) · governed IDs untouched.
  `npm run validate:registry` → ✓ REGISTRY VALID, 483 rows · 376 unique fields. Map stored
  verbatim as `docs/registry/SOURCE-BRANDS.csv` (the repo dictionary GPT proposed).
  **Two follow-ups for Codex:** ① its map spells 'Tichak' — registry uses the correct 'Tickchak';
  normalized on import, fix the map at source. ② 138 brands are outside the 29-brand map (mostly
  entity/document/declared sources now on generic:none) — extend the map only where a real
  platform logo exists; generic:none is a valid permanent state for the rest.
- ✅ **BOTH CODEX FOLLOW-UPS CLOSED (13 Jul, Codex v1.6.16 — verified with evidence, not on its
  word):** ① Tickchak fixed at source — v1.6.16 map fetched from Drive (7,222 bytes), zero
  'Tichak' occurrences; imported verbatim over `docs/registry/SOURCE-BRANDS.csv` (byte-identical
  to Drive). ② generic:none ruled valid/permanent where a logo would mislead (its review doc).
  **18 source-badge SVGs imported byte-faithful from Drive 02_ASSETS** (17 codex-* + 1
  generic-ticket-export) into `website-next/public/brand/source-logos/` — every file's byte size
  matches Drive metadata exactly; firewall-QC pass (LOCK-style badges: initials tile + name +
  "SOURCE BADGE · category"; explicitly NOT official platform logos — display identity only,
  never partnership/verification/trust weight). **Handoff correction for Codex:** its "mirrored
  into repo" claim = the LOCAL clone on the owner's machine, which never reaches GitHub without
  a push — the governed transfer path stays Drive 02_ASSETS → Claude imports byte-verified
  (SYNC §14 law). No harm done; files carried by Claude Code this time.
- **Cowork sync corrections adopted (13 Jul):** ① GCP service-account/GA4/GTM connector =
  PARKED to post-launch marketing phase (owner decision; `lock-analyst` account created and
  waiting) — dropped from the active Cowork queue, it is NOT preview-blocking. ② Canon-Mirror
  hygiene routed WHOLLY to GPT (Cowork can add but not delete on Drive; split ownership = an
  incoherent half-mirror). GPT already executed the full pass same day — F2–F6 lineage copy
  verified in the mirror at exactly 149,586 bytes (byte-count match vs repo import), dead stub
  deleted, 2 legacy GIGPROOF docs classified ⛔ SUPERSEDED and archived out of the active root.
  Drift-sentinel note accepted: Canon Pack (d2aa382) is behind repo head — Claude Code refreshes
  it after the current canon-changing train (not before; avoids churn).
- ✅ **FLAG RESOLVED (13 Jul, same day): F2–F6 TRANSPORT — owner relayed the file directly.**
  Maria uploaded GPT's package to this session; imported byte-faithful as
  `docs/registry/F2-F6-DELTAS.csv` (337 records, sha256 76f6668b…, 149,586 bytes). **Import QC —
  GPT's own QC held 100%:** 0 referential-integrity failures (all 66 overrides target real F1
  ids; all 76 additions collision-free, snake_case; all 100 activation rules resolve), enums
  closed, distributions match its report exactly (90/66/76/100/5 by record type; F2:55 F3:56
  F4:63 F5:70 F6:88). New gate `npm run validate:deltas` INSIDE `npm run verify` implements all
  four GPT recommendations: delta-schema validation · referential integrity vs F1 · musical-score
  allowlist (`score_or_chart_reading_capability`, `score_and_parts_delivery` = sheet-music
  notation, NOT grading — grading vocabulary stays forbidden) · stable-segment-key ruling
  documented in registry README §F2–F6. **One stale governance row superseded:** the delta file's
  `blocked_by_open_flag` row (don't resolve logo IDs) predates Codex v1.6.15 — the logo flag is
  resolved, so generation applies SOURCE-BRANDS.csv. GPT: no rework needed; noted for F-next.
  **Remaining step (queued, P1, not preview-blocking):** mechanical family-registry generation
  in GPT's recorded order F4 → F2 → F5 → F3 → F6; only `canonical` + `ready_for_claude` records
  auto-apply — the 142 proposal-status records get a review pass first. Canon-Mirror lineage
  copy still owed (GPT or Cowork drops the same file in "05 — CANON MIRROR" for Drive-side truth).

## 21. RADAR PROGRESSION + SOURCE ARCHITECTURE (13 Jul, owner order) — MEGA-BATCHES
Owner: bigger task batches per agent (progress was too incremental). New governed docs:
`docs/ARTIST-PROGRESSION-SPEC.md` (8 milestones M1–M8, value-per-stage, firewall-safe milestone
grammar) + `docs/RADAR-SOURCE-ARCHITECTURE.md` (18-segment architecture VERIFIED against live
code; 4 source display types adopted; internal weight model; F1-first registry build order).
DB head = 033 (owner-applied; outreach funnel recording live at DB level). DS = v1.6.12
(existing-page conversion deltas received — implementation in my site batch).
**CODEX MEGA-BATCH:** ① milestone-path UI element (8 milestones, states ✓/current/upcoming, mobile+desktop placement per spec §3) ② genre-emphasis planet treatment ("matters most in your genre" — guidance, never dimming/shaming) ③ source-node iconography: the 4 display types + `logo_asset` names for every F1 platform (Spotify…Go-out list) ④ S9 existing-page deltas already delivered — I implement ⑤ Q4 on preview.
**GPT MEGA-BATCH:** fill/audit the F1 Atomic Field Registry rows from the Drive research (schema from me) + docs classification + mirror hygiene.
**COWORK MEGA-BATCH:** unchanged queue (preview→Q3/Q4→counters incl. waitlist funnel) + verify F1 registry consistency once landed.
**CFRO:** sanity-check the internal weight model against the value ladder (no action before preview).

## 20. OWNER RADAR SPEC (12 Jul night) + beta-signup pivot — the current batch definitions
**Radar (N3) owner spec:** the Radar shows the artist WHO they are · relative to their GENRE ·
WHERE to focus · the VALUE of each planet — **planets have different weights per genre**. Firewall
translation: genre weights = which PROOF matters most for this artist's genre (focus guidance +
planet emphasis + weighted next-actions) — NEVER a score/percentile/comparison to genre peers.
**Codex batch ask (ONE block):** ① the genre→planet-weight table (per genre family: which of the
6 planets carries most booking weight, with one-line "why" per planet — extends v1.6.7
Growth-Advisor law) ② S9 full-site content+design pass — goal: BETA SIGNUPS (owner's marketing
test; every page maximally effective; outreach-ready: she will send text+join-link per audience)
③ content for TWO NEW outreach landing pages: /managers (משרד אמרגנות audience) + /production
(production offices) — the current /producers page is the Source-Confirmer flow, NOT these
audiences ④ Q4 review when preview lands. **Claude implements all of it + waitlist wiring.**
**Signup recording (verified in repo):** `waitlist_signup` table (026) already records role +
source_page, anon-insert; form component exists. Claude adds per-page role-preset + outreach
`?src=` attribution; role-check widening (artist_manager/production values) = small additive
migration for the Cowork batch.

## 19. CFRO v2.3 + Codex v1.6.7 processed (12 Jul night) — Claude Code verdicts
**CFRO v2.3: HIGH QUALITY, ADOPTED AS ADVISORY MAP** — canon-aware (all ₪ marked HYPOTHESIS, Option A,
Green-Invoice-before-payment, no-score-to-sell honored), honest verified-vs-hypothesis ledger.
**One REAL canon conflict caught (both CFRO and Codex missed it):** the proposed Free-tier
"cannot publish" wall CONTRADICTS the live pilot ruling — **artists are free in the pilot INCLUDING
publish** (CODEX-FUNCTIONAL-CONTRACTS pricing ruling). The publish-wall is a POST-GATE shape only.
**Ruling: no publish-wall is built in rel-07.13.** The Gate's "pays" half is measured via the
existing voluntary Bit flow, not forced by a wall.
**Answers to CFRO's 3 blockers:** Q1 — the auth-gated pricing ruling says exactly: artists FREE in
pilot; ₪149–249 range only if asked; never a fixed public price; agency Roster deliberately unpriced
(its ₪199 fits the range; every recurring tier = new proposal, post-Gate). Q2 — N10 is NOT a
fixed-price screen: Bit reference + operator-set manual activation, so 3-cohort price testing is
operationally possible post-Gate with zero build change. Q3 — canon pack file =
"LOCK-CANON-PACK — 2026-07-12 @ d2aa382.md" in 05 — CANON MIRROR (refresh due after the train).
**Codex v1.6.7 (Radar = Growth Advisor): ADOPTED** — gives N3's next-action widget its product
meaning; firewall-checked (next-actions, never grades). Codex's gated-roadmap feedback matches the
locked scope; its "prices configurable, never hard-coded" instruction accepted for N10.
**Open to Maria (from CFRO):** Q8 — who is the first REAL payer if the pilot cohort is free
("SHIGAON" mentioned — name unknown to repo docs; clarify). Q4–Q7 = post-Gate design questions.

## 18. NEW ENTITY REGISTERED (owner, 12 Jul night): CLAUDE CHAT — CFO / Monetization Strategy
- **Lane:** business model, pricing/tracks strategy, monetization feedback, cost governance opinion.
  Advises; **decides nothing** — every monetization decision remains Maria's, and pricing/economy
  changes enter a train only via a scope row with her word.
- **Access reality:** CLAUDE CHAT cannot read the private repo. Its truth sources: the Drive canon
  mirror (`B4 - lock.show/05 — CANON MIRROR/`) — now including `CFO-BRIEF` — plus owner-pasted
  briefs and the owner-shared artifacts. Handoff protocol §13 applies fully: any task to/from it
  carries complete self-contained text + source references.
- **Canon boundaries binding its recommendations:** firewall (no score/rank ever, "no score to
  sell"); monetisation measured, not required, until the Gate; no price/ICP locked until then;
  buyer free forever; no booking commission ever; artists free in pilot (range ₪149–249 only if
  asked; agency unpriced) — the pricing ruling in CODEX-FUNCTIONAL-CONTRACTS.
- **First expected inputs:** the pricing fork (A = own train rel-07.14 after tracks decided /
  B = fold into current train) · professional-tracks economy design inside canon · receipts/
  invoices priority (legal gap before real money) · Supabase Pro ($25/mo) opinion.

## 17. DS v1.6.6 app-imagery boundary (12 Jul night, Codex) — ACCEPTED + mapping layer started
- Codex's boundary RATIFIED: Claude builds flows/state/analytics/rendering pipelines — never invents
  imagery; app content images = user media or named DS assets; new image need → stop and ask Codex.
  This matches how the OG bank was done (import + render, zero design invention). DS now v1.6.6.
- **A9 step 1 SHIPPED to branch (commit b5f19b7):** discovery — the app's dark tokens are ALREADY
  byte-identical to the audit-verified DS values (bg #0B0C0B · surface #14181A · accent #C8F04D ·
  found #F2C063). Added the missing PAPER task-surface family additively (`ds-paper/card/forest/ink/
  mist/slate`, AA 14.91) in tailwind.config.js + tokens.ts — zero screens changed (zero-breakage
  aliasing per §6 Q1). Batch migration of task surfaces to paper = next A9 steps.
- Cowork's pricing-fork flag CONFIRMED from the repo side: "pricing changes" is in the site scope's
  OUT list — the new professional-tracks/economy direction needs Maria's A-or-B (recommendation:
  Option A — own train rel-07.14, after tracks are decided; firewall watch: "money never buys a
  better story" is canon).

## 16. DS v1.6.3 INDEPENDENT AUDIT (12 Jul night, Claude) — verdict: **BIND WITH FIXES**
Read in full from Drive (263,236 bytes, nothing truncated). PASS: version governance (v1.6.3 current) ·
Artist-lane N1–N12 with per-screen proof columns · color tokens have hex + light/dark + AA ratios
(e.g. paper #F3F5EF / forest #18221A = 14.91 · app.bg #0B0C0B / app.text #F3F0E8 = 17.21 ·
action.primary #C8F04D) · no contradictions with repo facts.
**Codex fixes required (re-requested until owner relays done — owner rule 12 Jul):**
1. 🔴 Draw-band demo shows a numeric "62% coverage" + filled bar — a PERCENTAGE on a trust widget,
   firewall violation inside the DS itself. Remove/relabel to a band.
2. 🔴 Demo chip "Producer-linked" — non-canonical; must be "Producer-confirmed".
3. 🟠 Entity-table Source-Confirmer row still recommends "מפיק מאשר" — contradicts the file's own
   canon-lock note; Recommended HE = מאשר-מקור only.
4. 🟠 "Unable to verify" appears as a fifth chip label in one voice rule — it is a band STATE
   (לא-ניתן-להעריך), not a method chip; chips stay exactly 4.
5. 🟡 Stale "DS v1.6.2 tokens" note in artist-lane section; "buyer workspace need proof" phrase
   (buyers are recipients, never workspaces).
**Claude corrections to the audit itself:** the flag on state.confirmed #CBEE72 (green) is a FALSE
POSITIVE — "no green-on-trust" is the evidence-governance rule (no ✅ without evidence), not a color
ban; the lime state colors are live and fine. **Binding decision:** color/surface token mapping may
START now (values verified); font tokens (font.display/ui/mono/rtl) have NO values yet — blocked on
Codex; the 5 fixes above must land before the binding batch is declared DS-true.

**✅ CLOSED (12 Jul night): ALL 5 FIXES VERIFIED FIXED in DS v1.6.5** — independent re-read of the
full file (265,710 bytes) confirmed: "62%" zero occurrences · "Producer-linked" zero · Source-Confirmer
Recommended HE = מאשר-מקור with the docs-only alias note · "Unable to verify" explicitly documented as
a band/recovery state, not a fifth chip · no stale v1.6.2 refs · no "buyer workspace". Closed on
Claude's own verification evidence per the owner's task-release rule (not on Codex's word alone).
Remaining Codex asks: font token VALUES · atmospheric image bank · physical assets already flowing
(6 SVG export templates → repo import in progress).

## 15e. OWNER CANON-LOCK APPROVED (12 Jul evening, "מאשרת") + Codex handoff verdicts
- ✅ מאשר-מקור ratified as the ONLY Source-Confirmer UI term (מפיק מאשר = docs-only alias).
- ✅ Terminology wave (buyer ≠ אמרגן) APPROVED → A1/S1 cleared for the train (deploy law still: rides the train, no partial deploy).
- Act HE: discovered ALREADY LIVE as **אקט** (he.js:710-715) — N12 proceeds with אקט; formal taste-ratification on the pending list, non-blocking.
- **`/agencies` 404 (Codex finding): verified NOT a break** — zero references in site code/nav/sitemap/llms.txt; the route never existed. Ruling: no agencies page in the pilot (Gate ICP = artist/buyer/producer); Manager-office audience is answered on /pricing. Post-validation backlog candidate. Codex was right to flag rather than assume.
- Codex handoff table accepted; its "visual production next, not more DS theory" recommendation ENDORSED (second time) — imagery + OG bank is Codex's lane now.

## 15d. Owner verification round (12 Jul evening) — Radar + AI-scan truths (code-verified)
- **Codex v1.6.2 ACCEPTED** — Artist-lane DOD now IN the DS (right move: Claude builds from governed DS, not roadmap prose). My independent audit now targets v1.6.2; binding still gated on it.
- **Radar (N3) verified in code** (`RadarUniverse.jsx`, 860 lines, Playwright-smoked): ALREADY interactive — planet panel, in-radar "Needs you" batch review, status+world filters, confirm with named receipt + UNDO, bloom animation, multi-Act sheet. Gaps to "critical/comfortable/effective": DS v1.6.2 token binding · 360px ergonomics pass · next-action integration · radar-v4 momentum visual (approved prototype) — all inside N3.
- **AI scan pipeline verified END-TO-END (the friendly path exists):** 2-screen onboarding (stage name + ONE link) → link auto-mirrored into evidence (`Onboarding.jsx:123-141`) → fire-and-forget `processEvidence` → server AnthropicClaimProcessor (real API; own retry/backoff; firewall-sanitized to 4 bounded statuses; deterministic stub fallback per canon) → Radar's "scanning" moment lands with a REAL found node.
- **Honest AI gaps (recorded, not hidden):** (a) the canon "deep scan once ≈$1" (multi-source expansion from the one link) is NOT built — Tavily discovery is key-verified but counsel-gated; (b) no automatic incremental re-scan — labeling runs per evidence batch, user/onboarding-triggered. Deep-scan = post-counsel build; incremental trigger = backlog candidate.
Verified live via Drive API: root clean (only ★ MASTER CANON + the 2 disclosed Google-native GIGPROOF
docs) · `_ARCHIVE/2026-07-12 — CONSOLIDATION/TOP LEVEL LEGACY` holds 22 files, ALL correctly prefixed
"⛔ SUPERSEDED 2026-07-12" (10 re-dated + 12 newly moved — every claimed filename present) · no deletions.
ONE slip: GPT's Drive comments cite DS v1.6.0 as design authority — current is **v1.6.1** (comment-only,
low risk; next GPT pass should cite "the version in VERSION.json" instead of a number).
Open per GPT's own DOD: the 2 native Docs need a classify-or-archive decision (Cowork Docs audit).

## 15. ONE PLACE OF TRUTH + daily sync (owner directive, 12 Jul)
**Architecture (ratified):** the GitHub repo is the ONE truth for code/docs/versions/vocabulary.
Claude reads it natively; Cowork + Codex scan the local clone (LAW: `git pull` before every scan);
the Drive is truth ONLY for the DS (`00_CURRENT`) + collaboration/design materials.
**The GPT bridge:** GPT sees only Drive → a read-only mirror now exists:
Drive `B4 - lock.show/05 — CANON MIRROR (READ-ONLY · repo is truth)/LOCK-CANON-PACK — <date> @ <sha>.md`
(seeded by Claude 12 Jul @ d2aa382 via Drive API). Edits made in the mirror are ignored by definition.
**Sync duties:**
- Claude: refresh the canon pack after every canon-changing release (Claude's Drive access is
  create-only — each refresh is a new dated file; Cowork deletes superseded ones + the dead stub
  "LOCK-CANON-PACK.md").
- Cowork: daily "LOCK Morning Sync" (owner to give the word — 08:00): Drive drift + live-sites check
  + the one blocking decision; deletes stale mirror files.
- GPT (daily, READ-ONLY — never moves files): Drive drift sentinel + mirror freshness (SYNCED date
  older than 48h → 🟡 "mirror stale, ping Cowork"). Heavy file hygiene = weekly batch, on approval.

## 26. CODEX MARKETING FOCUS (owner order, 13 Jul)
Owner: alongside Q4, Codex focuses on MARKETING — site conversion + outreach material kits for
inviting FIRST USERS to register for the app. Deliverables (Drive, per its versioning):
① Per-audience outreach message kits — artists / artist managers (משרדי אמרגנות) / production
offices: short WhatsApp/DM text HE-first (+EN), 2–3 variants each, warm and professional, each
ending with its join link + ?src batch token (convention live: lock.show/artists?src=<batch> ·
/managers?src=<batch> · /production?src=<batch> — every signup records role+page+batch, 026/033).
② Social captions + which existing OG/social asset pairs with each message (assets already in
repo). ③ Any missing visual for the first-users push (its brief lane). ④ Firewall language law
applies to marketing too: proof/confidence vocabulary — never score/rank/"we evaluate artists".
Maria sends the messages personally — kits must be paste-ready. Claude verifies links+tokens work
on the live site before she sends anything (part of the release train).

## 27. CFRO OWNS BUDGET + P&L + SWOT (owner order, 13 Jul)
Owner needs: FULL budget BY GROWTH STAGE, expense clarity, per-subscription notes — what each
tier includes (free ceiling → next price → alternatives) — plus P&L and SWOT. CFRO = responsible.
Deliverable spec: ① Budget table per service (Supabase free→Pro$25→Team$599: ceilings incl.
NO-BACKUPS on free · Vercel Hobby free→Pro$20: build/bandwidth caps · Anthropic API usage: cents/
evidence now, $50 cap proposal, deep-scan future line · Resend free 3k emails→$20 · domain ·
Green Invoice fees when active · alternatives column per service) ② Growth stages: pilot(friends)
→ post-Gate(first payments) → growth(100+ artists) — costs + revenue per stage ③ P&L per stage
(free pilot = pure burn + owner-hours line it already modeled) ④ SWOT — venture-level, honest.
Claude Code verifies every price/ceiling claim against provider truth before it binds. Owner
audit order: EVERYTHING gets audited incl. version management — GPT audits the G-register + train
integrity; each member re-runs their role audit per standing rules.

## 28. OWNER APPROVALS (13 Jul): AI budget $50 hard / $25 alert — APPROVED. 035 applied ✓ (Cowork-verified). 034 = supabase/migrations/034_event_canon_unpublish.sql — ADDITIVE ONLY (widens the analytics event-name CHECK to allow 'passport_unpublished'; no tables/structure; Free-tier safe; NOT the structural one — structural renames have no number yet and wait for Supabase Pro). Cowork may guide Maria to apply it as-is.

## 29. ROUND: GPT REOPENERS ADOPTED + CODEX FULL-SITE PROOFING ORDER (owner, 13 Jul)
- GPT adversarial audit: G11-G15 → BUILDING (accepted in full — notify-route authorization gap,
  anonymous-buyer notification regression, safeParse mislabeling, client fallback swallowing
  401/403/429, no $-ledger, plaintext tokens). Fix agent launched; registered states corrected.
  Honest count: 8 CODE-COMPLETE (G1-G8) + 1 OWNER-ACCEPTED (G17), rest building/open.
- Cowork DB reconciliation: CHECK = app CANON = 29 events, verified. 034 repo file regenerated
  FROM analytics.js (this commit). Its systemic ask ACCEPTED: canon-vs-DB drift gate = queued
  into verify chain with the fix wave.
- CODEX NEW OWNER ORDER: 100% FULL SITE PROOFING — design, navigation, contents, localization,
  messages; CLICK EVERY BUTTON and view every content on lock.show; report per page: issue →
  severity → fix. Its M7/M8 + Hebrew-polish findings: ACCEPTED into the fix wave (M7 will derive
  from persisted share_link_created once queryable; interim = share-state honesty).
- CFRO signal-integrity audit: PASS recorded (zero monetization signals lost).

## 30. OWNER ORDER (13 Jul): PSYCHOLOGY-DOD PER ENTITY PER SCREEN
Binding: a DOD exists for EVERY entity and EVERY screen, grounded in that entity's PSYCHOLOGY —
what matters to them, what show business we operate in (nightlife/events Israel: speed, status,
trust, vibe; artists = pride+fear of being judged; buyers = risk to their name; managers = roster
momentum; production = zero-surprise lineups), and how each screen must LOOK and FEEL for that
person. Requirements: high-level interactive screens · MINIMUM CLICKS per task (count them in the
DOD — target <=3 for core actions) · full responsive adaptation. OWNER: Codex authors the
per-entity psychology-DOD pack (its DS lane, extends v1.6.20 role-DOD); Claude binds each DOD to
its screen in the traceability matrix and enforces at proof-pack; Cowork measures actual click
counts per task on preview; CFRO checks the psychology maps to the money-moment per entity.

## 31. OWNER ORDER (13 Jul): FULL USER-FLOW CHECK + DESIGN SPRINT. Every user flow tested end-to-end (all 7 entities, forward+back, both languages — Cowork executes on demo/preview, polish agent pre-clears in code). DESIGN SPRINT: Codex leads — psychology-DODs (§30) + full-page evidence → per-screen redesign deltas in ONE sprint pack (mobile-first, minimum-clicks, one-CTA law); Claude implements the deltas as sprint batches with screenshot proof after each; Maria tastes on the demo link/preview. Sprint scope = artist lane first, then manager/production/buyer surfaces.

## 32. RELEASE-CANDIDATE DISCIPLINE (GPT corrections ADOPTED, 13 Jul) + RC0 FREEZE
State names binding: PREVIEW-DEPLOYABLE → QA-READY (G16 active, write-tests may begin) →
Q8-READY (all lanes green on ONE frozen SHA) → PRODUCTION-READY (Maria approved THAT SHA).
Sequence: private preview FIRST → G16 tagging/exclusion/cleanup ACTIVE + SHA/env recorded →
only then the URL+test account go to Maria/testers for write flows. Every fix wave = new RC
(RC0→RC1→…); regression on affected paths + GPT delta audit per RC; Q8 runs ONLY on the final
deploy SHA. Cowork binds every proof to its tested SHA. Codex repeats Q4 on materially changed
screens. CFRO validates on the FINAL candidate. GPT-SKILLS transported to Canon Mirror
(1h3wb5YqJGSZCYxIiwYuEdQy8o256P1TN) — import to docs/team/ rides RC1 (flagged, not dropped).
Codex one-pager + Growth Op seed-pack: delivered, pending my canon verification (my #6).
THIS COMMIT = RC0 FREEZE.

## 33. PARALLEL-EXECUTION GOVERNANCE (GPT audit ADOPTED, 13 Jul): Track D (admin cockpit) = post-launch branch, NEVER RC1 (locked scope rules) · Track E split fix-vs-enhancement (only DOD items enter RC1) · reserved-file manifest per agent (package.json, App.jsx, i18n files, migrations, release docs = single-owner per wave) · PARALLEL-WORK-LOCK.md per wave · migration numbers reserved by Claude only · G16 closure needs child-row cleanup graph (qa_run_id + dedicated QA account + FK-safe cleanup + Gate-read exclusion proof) — plan amended by reference · accurate phrasing: "G1-G12 implementation wave complete; G13/G15 real-DB pending; G16 authored, closure pending". CORRECTION to Growth Op: share_link_created/opened ARE wired (G7, commit 7bc1bc6) — its flag was stale; funnel step not blind on RC0.

## 34. RC0 ANCHOR RECORD (14 Jul — ends the "which SHA do I deploy?" ambiguity; Cowork-requested)
FACT CHECK of Cowork's morning read: `2a2c955` IS pushed — it is an ancestor of the remote tip,
verified 14 Jul: `git ls-remote` → branch tip **f7464f2**; `git merge-base --is-ancestor 2a2c955
origin/claude/b4-gigproof-discovery-e7749o` → TRUE. Cowork's inference ("no 2a2c955 build ⇒ not
pushed") has a false premise: **Vercel builds branch TIPS at push events, never ancestor commits
individually** — there will never be a deployment labeled 2a2c955 now that the tip has moved past
it. The `a965ad5` preview Cowork saw = an old stop-hook snapshot build; previews are OFF for this
project (VERSIONS.md infra row), so newer pushes did not auto-build. Nothing is missing.
**DEPLOY RULE FOR COWORK (binding):** deploy the CURRENT BRANCH TIP from the Vercel dashboard
(Create Deployment / Redeploy from `claude/b4-gigproof-discovery-e7749o`). Before deploying, run
the equivalence check: `git diff --name-only 2a2c955..<tip>` must touch ONLY `docs/**`. As of this
section every commit after the freeze is docs-only (7c78761 · 093e8a6 · 5a9a47c · f7464f2 · this
one) ⇒ the tip's PRODUCT CODE is byte-identical to RC0. Record in the proof: tested-SHA=2a2c955 ·
deployed-ref=<tip SHA from Vercel's deployment screen> · equivalence=docs-only diff (RC0-MANIFEST
§2). This satisfies GPT's bind-to-SHA rule — GPT re-derives the same diff independently.
**STANDING RULE (all future RCs):** every RC freeze records ① frozen SHA ② remote tip at anchor
time ③ the docs-only equivalence check ④ the preview URL once deployed (Cowork appends it HERE).
If any post-freeze commit touches non-docs paths → the freeze is void, re-freeze at the new SHA.
Git tags remain LOCAL-ONLY (remote tag push 403) — SHA is the anchor, not the tag.
Production hooks (VERCEL_DEPLOY_HOOK_APP/SITE) are NOT preview tools — they build MAIN to
PRODUCTION; do not fire them for this step.

## 35. OWNER RULINGS (14 Jul): LAUNCH = BILINGUAL + BATCH MODE RE-ACTIVATED
① **LAUNCH DEFINITION:** the Israel launch = site AND activity in TWO LANGUAGES, together. The
Hebrew marketing site is IN launch scope — the wave immediately after the rel-2026.07.13 train
deploys. Current-train scope unchanged ("OUT: Hebrew site" bound that train only). No growth /
visitor-bringing activity before the bilingual site is live. Recorded in LAUNCH-DOD §2.
② **BATCH MODE (owner: "נחזור לעבוד במקבצים"):** yesterday's Codex relay did not happen — tasks
return to consolidated per-agent BATCHES, one block per agent per round, delivered in-chat for
Maria to paste. Standing batching rule (SESSION-MEMORY) re-affirmed as the ACTIVE transport;
task-release rule unchanged (nothing closes on word alone).
③ HE-site work split: Claude = website-next i18n externalization + RTL (code rides AFTER the
preview snapshot — keeps §34 freeze equivalence; lands with/after RC1) · Codex = native-HE page
copy per page, starts NOW from the live EN site + DS v1.6.20 (no code dependency) · Cowork =
bilingual QA on preview.

## 36. DEPLOY-HEALTH (14 Jul): Cowork inbox-sweep verdict ACCEPTED + standing duty
Cowork verified live production directly: lock.show serves full canon-correct landing;
app.lock.show serves login — NOTHING LIVE BROKEN. Alert triage accepted: gigproof-website Jul-9
failures = launch-night history (resolved at rename) · lock-site 2-day failures = PREVIEW noise
(docs-only commits + build-skip config + branch-preview misfire), production untouched. Matches
Claude's email-scan findings (§ email-scan rule, commit 7c78761).
ADOPTED: ① deploy-health = standing item in Cowork's Morning Sync (both projects' build status +
alert inbox; report "real vs noise" plainly) — complements Claude's email-scan rule. ② The
preview-skip config fix = SAME pass as the RC0 preview work, single owner Cowork; per standing
constraint, Vercel project-config changes need Maria's explicit word — requested in-chat 14 Jul.
③ OPEN VERIFICATION (Cowork, blocking): the new app deployment "BZ42…" — identify WHAT ref it
built and WHICH environment (preview vs production). If it is a branch-tip preview → that IS
step-0: verify deployed SHA == branch tip, run docs-only equivalence vs 2a2c955, continue §34
chain (private → G16 → QA-READY). If it is a production rebuild of main → harmless (old code
rebuilt), say so and proceed to the intended preview deploy. Do not label anything RC0 until the
SHA is confirmed.

## 37. GPT RC0 AUDIT — ACCEPTED IN FULL (14 Jul) + CORRECTIVE WAVE LAUNCHED
Claude spot-verified all four key refutations in code before accepting (G16 file: 0 child-row
mentions · db.js:308 stores 'mock' while reporting 'client-stub' · verify has no denial suite ·
planetEmphasisOrder unused in planet rendering) — ALL REAL. Corrections applied (docs-only, this
commit): register G2/G4/G11/G12→BUILDING + G5/G6→VERIFICATION-PENDING + SHA-chain fix · G16 plan
physically amended (qa_run_id · dedicated QA account · FK-safe child cleanup order · Gate-read
exclusion proof) · LAUNCH-DOD §3 migrations truth · VERSIONS promotion ladder = §32 states with
Q8 BEFORE production · manifest addendum. test:release-governance gate ADOPTED (P1).
DEPLOY RULE AMENDMENT (supersedes §34's "current tip" wording): Cowork deploys the PINNED ref
**2de06b7** (= the stale BZ42 preview — redeploy it after the build-skip config fix; do NOT chase
the moving tip, the corrective code wave is about to move it). Preview = VISUAL-ONLY (Codex may
inspect; no write QA, no test accounts) until RC1 + G16 close per GPT's release ruling.
CORRECTIVE CODE WAVE (voids freeze by design → re-freeze as RC1): Agent-G2 additive planet
emphasis (reserved: radar components + ArtistDashboard.jsx + genreWeights.js) · Agent-G4 roster
read-model + artist-bound action (reserved: src/features/agency/*) · Agent-SEC G11 denial suite +
G12 client_stub truthfulness + capability-gated stub (reserved: server/index.js, src/lib/db.js,
src/lib/ai/*, scripts/test-security-denial.mjs, package.json). Site rebuild per Codex's exact
brief (verified: assets ✓ in repo, 11-page HE pack ✓ in Drive, canon-clean) = next slot after an
agent frees (§33 cap 3); artist-types Drive assets still need repo copy (Cowork or Claude).

## 38. RC1 FREEZE (14 Jul) — GPT corrective batch CLOSED in code; re-audit trigger fires
THIS COMMIT = RC1 FREEZE (app corrective candidate; supersedes RC0 per §32 re-freeze law).
Closed this wave, each independently verified by Claude before acceptance: G2 (additive planet
emphasis, guarded, EN+HE) · G4 (artist-bound roster ladder, scope-aware, RLS-safe floors) ·
G11 (executable denial suite — 8 cases/25 assertions — now a permanent verify gate) · G12
(truthful client_stub provenance; non-JSON = retryable failure, never fake claims; column
unconstrained so NO migration). Register updated. `npm run verify` exit 0 on the frozen tree
(nav 34 · isolation 17 · canon 29 · security 25 · i18n · registry · deltas · builds).
NOT in RC1 (working tree only, own wave): site-rebuild wave 1 (website-next/**, Codex-brief
Home+Artists+shared system) — lands as the site train (RC2-era), per §35/§37.
GPT TRIGGER: re-audit THIS frozen SHA per its §7 spec (G2/G4/G11/G12 + physical G16 amendment +
governance corrections bd2af10). COWORK: preview ruling per §37 unchanged — deploy PINNED
2de06b7 visual-only now, or supersede to pin THIS RC1 SHA once GPT re-audit passes (RC1 is the
QA-READY candidate). Remaining to QA-READY: GPT re-audit green → preview of RC1 → G16 tagged
cycle → G13/G15 real-DB proofs.

## 39. SITE-REBUILD WAVE 1 LANDED (14 Jul) — shared system + Home + Artists per Codex exact brief
Independently audited by Claude before acceptance (security sweep: no external URLs/scripts/
secrets; the one dangerouslySetInnerHTML = static file-local SVG constants — safe; firewall/
lexicon grep clean; site build re-run: exit 0, 21 routes exported, new hero copy + correct asset
verified in output HTML). Delivered: components/marketing/* (Hero, EntityCard, FlowStep,
TrustBadge, FinalCTA, Section, meaning-only icons) + styles/marketing.css (brief §3 tokens) +
Home §5.1 + Artists §5.2 rebuilt. COPY ARCHITECTURE: zero hardcoded strings — content/home.ts +
content/artists.ts export {en, he}; Codex HE pack wired VERBATIM (~65%: heroes, CTAs, trust
lines, loop steps, lane cards, tension cards, 4-step flow, final CTAs); 39 TODO_HE markers =
strings the pack doesn't cover (agent correctly did NOT improvise Hebrew).
→ CODEX BATCH ITEM: supply HE for the 39 TODO_HE strings (grep TODO_HE in website-next/content/
after pull; mostly: home "Why it exists" section, manager/production lane cards, product-card
titles/features, section eyebrows, image alts). → NEXT WAVES (brief steps 4-10): Passport demo ·
Bookers · Managers/Production · Methodology/FAQ · nav/footer relabel (incl. Pricing→Free Pilot,
Producers→Source confirmation) · HE locale wiring + RTL · screenshot pass. Site train = its own
RC; RC1 (439c38c) remains the pinned app QA candidate.

## 40. SITE-REBUILD WAVE 2 COMPLETE (14 Jul) — ALL 11 MARKETING PAGES REBUILT per Codex exact brief
W2A Passport demo §6 + Bookers §5.6 (Shidapu assets imported to repo: artist-types/ hero+profile;
demo = presence-first, bands+method labels, zero counts — old '4,200 followers' removed; private-
client HE verbatim) · W2B Managers §5.3 + Source-confirmation §5.4 + Production §5.5 (אמרגן only
on managers page; 'under review' card carries method-safe footnote) · W2C Free-Pilot §5.7 (pricing
table/paid names/payment CTA REMOVED — grep-proven) + How-It-Works §5.8 (6-step stepper) +
Methodology §5.9 (governed chips, no chart-like visuals) + FAQ §5.10 (all 8 required Qs; JSON-LD
FAQPage from same content) + Contact §5.11 (role selector BEFORE message; existing waitlist
mechanics preserved; ?src attribution was already built-in; role tokens map to the 033 CHECK —
no schema change). All independently verified by Claude: build exit 0 (21/21 routes), firewall/
price/lexicon sweeps clean.
→ CODEX BATCH (one consolidated item): ① ~250 TODO_HE strings across 13 content modules (grep
TODO_HE in website-next/content/) ② its pack typo מאושר על ידי מקות→מקור corrected by Claude —
confirm ③ component-system gaps for a wave-3 polish: Hero background-image mode · MockPanel ·
StatusChip · icon ids (document/person/declared/inbox/event/lineup) ④ design-QA the 11 rebuilt
pages on the preview once live. → WAVE 3 (launched): nav/footer per brief §4 (nav = Artists ·
Managers · Production · Bookers · How it works · Passport demo; CTA Join free pilot; Pricing
relabeled Free Pilot; Producers→Source confirmation; 4-column footer + micro-copy). HE locale
wiring + RTL + full screenshot pass follow as the closing wave.

## 41. SITE WAVE 3 (chrome) VERIFIED + /pricing REDIRECT REMOVED + BUILD-SKIP ROOT CAUSE FOUND (14 Jul)
W3 verified: nav = Artists·Managers·Production·Bookers·How it works·Passport demo + Join-free-
pilot CTA (dark/outline in header — page-hero lime keeps the one-lime law; footer lime own
viewport); footer = Product/Trust/Company/Legal 4 columns + brief micro-copy EN+HE; chrome.ts
100% HE (0 TODO_HE); no Pricing/GET-STARTED remnants in built HTML (grep-proven, 5 routes).
Claude follow-ups: ① false-alarm resolved — 'missing' pricing/passport-demo pages = flat-file
export layout (pricing.html), both verified with correct content; ② REMOVED the stale
vercel.json redirect /pricing→/artists (predates the Free-Pilot page; would have orphaned it —
old inbound links now land on pilot truth); ③ 🚨 ROOT-CAUSE FINDING for Cowork: website-next/
vercel.json ignoreCommand = `git diff --quiet HEAD^ HEAD -- .` — compares ONLY the LAST commit,
so any push ending in a docs-only commit skips the site build even when earlier commits changed
the site. This is (at least part of) the canceled/'Stale' preview mystery. FIX RIDES MARIA'S
PENDING CONFIG APPROVAL (same scope): proposed repo-side fix = compare against the last DEPLOYED
SHA (Vercel provides VERCEL_GIT_PREVIOUS_SHA) or simply drop ignoreCommand on the site project
during the QA period. Claude holds the edit until the owner word lands.
REMAINING SITE WAVES: HE locale wiring + RTL → full screenshot pass → Codex TODO_HE batch
(~250 strings) + design QA on preview.

## 42. REBUILT-SITE PROOF PACK (14 Jul) — 24 full-page screenshots, all sanity asserts green
docs/design-system/current-screens/2026-07-14-rebuild/ — 12 routes × desktop 1440 + mobile 390.
Asserts: hero H1s match content modules · no template leaks/TODO_HE visible · nav has Passport
demo everywhere · every background/img decodes (Shidapu hero 1672x941 painted). Known capture
artifact: fixed consent bar prints mid-page in full-page PNGs (not a live-page issue).
→ POLISH QUEUE (wave 4, Claude + Codex design call): P1 home desktop hero — floating Passport
card clips the image-card chip row ('...CE-LINKED' half-hidden) · P1 /pricing hero — social-cover
webp crops to a near-black rectangle (needs a different asset or treatment; Codex to assign) ·
P2 4+1 orphan-card layout in the five-lanes grids (home + pricing) · P2 methodology source-logo
chips illegible at 1440 + page reads as monotonous card stack · P3 home-mobile hero low-impact.

## 43. CODEX LIVE-SITE VERIFICATION RECONCILED (14 Jul) — live findings VALID; candidate claim STALE
Codex's live verdict ACCEPTED for what it measured: PRODUCTION (old 10-12 Jul deploys) is not
launch-ready — that is exactly why the rebuild train exists; nothing deployed today. Two of its
live findings forwarded to Cowork's deploy-health lane: 🚨 verify live /managers + /production
(Codex saw 404 — conflicts with the 12 Jul "10/10 inner pages 200" record; could be a real live
regression, cleanUrls edge, or check error — needs a fresh live read).
Its candidate-branch row ("still needs rebuild implementation") is STALE-FETCH — refuted by
pushed evidence at b169265: waves 1-3 complete (SYNC §§39-42): shared marketing components BUILT
(components/marketing/: hero, entity-card, flow-step, trust-badge, final-cta, section, icons) ·
image map wired incl. Shidapu assets in-repo · Home/Artists/Passport-demo/Bookers/Managers/
Production/Source-confirmation ALL rebuilt · Pricing = Free-Pilot page + removed from nav ·
24-screenshot proof pack in docs/design-system/current-screens/2026-07-14-rebuild/. Codex's own
items 1-5+7(EN) are DONE on the candidate; item 6 (HE wiring+RTL) = next wave; item 7(HE shots)
after it; item 8 (Q4) after preview. PINNED-SHA RULE now applies to Codex too (as GPT adopted):
verify the candidate at a named SHA (b169265+), never from memory/stale clone.
Creative correction ADOPTED as wave-4 north star: emotional, image-led, interactive — "Private
Radar for the artist + public Passport for booking context." Wave-4 polish agent launched (home
hero card-clip fix · methodology logo legibility · 4+1 orphan grid). Pricing-hero asset choice =
CODEX assignment (its §42 batch item).

## 44. WAVE-4 POLISH CLOSED + DIRECT-PUBLISH CAPABILITY ANSWER + SITE-OWNERSHIP RULING REQUEST (14 Jul)
W4 verified (agent re-shot v2 PNGs, Claude accepted): home hero chips fully readable (fix also
cured latent /bookers overlap) · pricing hero = duotone interim (Codex assigns final asset) ·
5-card grids now intentional 3+2 · methodology logos legible 44px+labels · home-mobile hero
impact raised. v2 shots in current-screens/2026-07-14-rebuild/*-v2.png.
DIRECT-PUBLISH (owner question "לעבוד ישירות ולפרסם ללא Cowork — אפשרי?"): YES —
① TODAY already: production deploy hooks in .env.local (POST → builds main→production; proven
9-10 Jul autonomous releases). ② VERIFIED TODAY: api.vercel.com is REACHABLE from Claude's
environment (403 was Vercel's missing-token error, not the proxy). With a VERCEL_TOKEN from
Maria (vercel.com → Account Settings → Tokens → create, scope: the two projects; paste into
.env.local as VERCEL_TOKEN=, never in chat) Claude can VIA API without any browser: create
branch/preview deployments, read build logs + deployment lists (ends stale-fetch debates),
manage Deployment Protection (private previews), promote to production. Cowork's browser lane
then = live-site verification from outside + dashboard-only edge cases + DB ops. RELEASE LADDER
UNCHANGED: capability ≠ permission — Q8 before production promotion stands (VERSIONS ladder).
SITE MANAGEMENT TO CODEX? (owner question) Claude's recommendation: NO transfer — keep the
split that produced today's 11-page rebuild-in-a-day: CODEX = design law, copy, HE, briefs,
design QA (authority unchanged, its briefs are binding specs) · CLAUDE = code, build gates,
verify chain, publish (with token: previews minutes after every Codex brief). Codex's runtime
has no repo-push or Vercel lane (constitution: Drive-only delivery) — transferring "management"
would ADD a handoff, not remove one. The bottleneck was publish access; the token removes it.
Owner decides.

## 45. OWNER DESIGN RULING (14 Jul): NO FRAMES-INSIDE-FRAMES — BINDING
Maria on the rebuilt hero shots: "אני לא אוהבת כזה, פריימים בתוך פריימים, זה לא נראה לי טוב."
Binding visual law effective immediately: avoid nested card-in-card compositions — specifically
the hero pattern (rounded image card + floating rounded mini-cards layered on it + chip boxes)
reads as frames-in-frames. Direction: flatter, more integrated imagery (full-bleed / soft-masked
image, content over or beside it, minimal chrome), fewer rounded boxes per viewport.
→ CODEX: revise the brief §8 hero spec + DS accordingly (owner taste overrides the floating-card
wireframe); propose the corrected hero language in its next DS delta.
→ CLAUDE: interim flattened hero variant NOW for owner taste-test (hero.tsx + marketing.css only,
backward-compatible), re-shot for her review before rolling across pages.

## 46. OWNER RULING (14 Jul): CLAUDE CODE TAKES INFRASTRUCTURE OWNERSHIP — ASSETS MANAGED WITHOUT COWORK
Maria: "אני מאשרת לך לנהל את הנכסים ללא COWORK. תתחבר לכל התשתיות כדי שתוכל לקחת OWNERSHIP."
EXECUTED IMMEDIATELY under this authorization (repo-side, was held pending config approval —
this ruling grants it): ① website-next/vercel.json — ignoreCommand REMOVED (site builds every
push during QA; ends the canceled/'Stale' preview failures + the failure emails) ② root
vercel.json (app) — ignoreCommand replaced with range-aware fail-open version (compares
VERCEL_GIT_PREVIOUS_SHA..HEAD, not just the last commit; builds when in doubt).
CONNECTIVITY VERIFIED TODAY: api.vercel.com reachable ✓ · api.supabase.com reachable ✓ — both
need only tokens. → MARIA (one-time, ~4 minutes, via the ENVIRONMENT settings of the Claude
Code session — env-vars section — NOT chat): ① VERCEL_TOKEN (vercel.com → Account Settings →
Tokens → create) → unlocks: previews on demand, deployment lists/logs (no more stale-fetch
debates), Deployment Protection, promote — full deploy ownership. ② SUPABASE_ACCESS_TOKEN
(supabase.com/dashboard/account/tokens) → unlocks: migrations/queries/DB proofs (G13/G15/G16
cycle) without relaying SQL through Cowork/Maria.
ORG DELTA: Cowork lane narrows to = outside-in LIVE verification (sandbox can't reach live
sites) · browser-only dashboard edge cases · Drive/GPT ops · break-it QA. DB migrations move to
Claude once the Supabase token lands (migration numbers already Claude-reserved, §33). RELEASE
LADDER UNCHANGED (Q8 before production). Secrets rule unchanged: tokens go in environment
settings / .env.local, NEVER chat.

## 47. CODEX VISUAL-ARCHITECTURE CORRECTION — ADOPTED AS WAVE 6 (14 Jul; Drive doc fetched+read in full)
North star: "Backstage intelligence for the artist economy" — not SaaS/docs/proof-police. Owner's
no-frames ruling (§45) and this correction agree; flat-hero agent in flight = Pattern A first cut.
ADOPTED SPEC (from CODEX_SITE_VISUAL_ARCHITECTURE_CORRECTION_20260714.md):
• TOKENS: --color-amber-stage #D7A84A · --color-ember #9A5A2E · --color-smoke #202820 ·
  --color-mist #DDE4D7 · --color-source-blue #6EA6A3 · gradients stage/radar/paper-fade/nightlife
  · shadow-cinematic-card · glow-signal-soft (lime 10-18%) · glow-stage-warm (amber 10-16%).
  LAW: lime = action/live signal ONLY; amber/ember = atmosphere.
• IMAGE PATTERNS: A cinematic bleed (Home/Artists/Passport demo; no border, mask/gradient, max
  ONE floating badge) · B editorial strip (3-4 unequal media frames, mono captions) · C product/
  decision card (Methodology/Free Pilot/Contact).
• HEROES: CinematicHero / ProductCompositionHero / TrustLabHero — never one framed hero everywhere.
• FREE PILOT: ProductComposition hero — central lime "Free pilot" tile + 5 entity chips orbiting +
  line "No payment · No scores · Artist controls publication"; NO photo. Dark featured artist
  card; amber micro-accent on buyer card; 3+2 grid.
• METHODOLOGY = TRUST LAB: source-ecosystem band (bigger dark logo cards + source type), category
  colors platform=source-blue/document=amber/person=lime/artist-declared=smoke; FirewallCard for
  "what never becomes public"; method-label cards = icon+label+plain sentence+example.
• CARDS: SignalCard/PaperDecisionCard/EditorialCard/MediaTile/FirewallCard — vary by purpose.
• CHIPS: action=lime · source=source-blue/dark outline · method=amber/lime · neutral=smoke/mist.
• PER-PAGE ACCENT rhythm table (home lime+amber · artists lime+stage-amber · managers lime+
  source-blue · production amber+smoke · bookers amber+paper · source-conf lime+source-blue ·
  methodology source-blue+amber · free-pilot lime+mist+amber).
• P0 also: cookie banner must never block review screenshots · HE = RTL LAYOUT-aware (hero text
  right/image left, CTA right, longer lines, no tiny mono uppercase in Hebrew).
• CODEX VISUAL DOD captured — it approves visual direction only when its 8 conditions hold.
SEQUENCE: flat-hero lands → Maria taste-test → WAVE 6 agents (6a tokens+FreePilot composition+
TrustLab · 6b card/chip variants+per-page accents · 6c cookie-banner screenshot fix) → re-shoot
all → Codex visual DOD check → HE RTL wave uses the same layout-aware rules.

## 48. INFRASTRUCTURE OWNERSHIP LIVE (14 Jul) — tokens received, root causes killed, previews unblocked
Tokens: Maria delivered VERCEL_TOKEN + SUPABASE_ACCESS_TOKEN (pasted in chat → 🚩 ROTATION
pending-item added, same as the old Anthropic/Tavily keys; stored in gitignored .env.local).
VERIFIED: Vercel API = Maria's account, lock-app prj_ANv5… + lock-site prj_dUHn…; Supabase API =
LOCK qexfndiyallwqhhzeerd ACTIVE_HEALTHY. Claude now reads deployment lists/logs directly — the
stale-fetch/who-built-what debates are over.
ROOT CAUSES (found via API in minutes): ① lock-site DASHBOARD setting commandForIgnoringBuildStep
= "skip everything non-production" — the TRUE reason every site preview was CANCELED (repo-file
fix alone couldn't help; dashboard overrides). CLEARED via PATCH → site previews now build.
② lock-app ERROR deployments = Claude's §46 ignoreCommand: VERCEL_GIT_PREVIOUS_SHA absent from
Vercel's shallow clone → git exit 128 → Vercel treats non-0/1 as deployment ERROR. FIXED:
normalized to exit only 0 (skip) or 1 (build); any git failure → build (fail-open).
EQUIVALENCE: app product code at tip == RC1 439c38c (git diff empty over src/server/supabase/
scripts/package.json) — an app preview from the tip IS the RC1 candidate; recorded per §34 rule.
Next push triggers both previews; URLs will be read from the API and distributed per rules
(site = visual, shareable to Maria/Codex; app = VISUAL-ONLY until G16, no write QA).

## 49. 🎉 PREVIEWS LIVE (14 Jul) — first successful preview builds of the train; URLs bound per §34
Deployed ref b806e33 (branch tip), both READY, both PRIVATE (Vercel SSO wall on all previews —
302-verified; satisfies the private-preview law; Maria views logged-in to Vercel; share-links for
non-account reviewers via dashboard Share when needed):
• SITE (the full 11-page rebuild + flat hero): https://lock-site-5nm1q397z-error4ik.vercel.app
• APP: https://lock-7uhzpu2hv-error4ik.vercel.app — product code byte-identical to RC1 439c38c
  (§48 equivalence) ⇒ this IS the RC1 candidate preview. VISUAL-ONLY until G16 activates: no
  write-flows, no test accounts distributed (GPT release ruling; unchanged).
Next: Maria browses the site preview (real thing, beats screenshots) → taste verdict → wave 6.
QA chain: G16 tagged cycle (Claude now holds Supabase API for it) → QA-READY on RC1+.

## 50. W5 ENTITY-MESSAGING CLOSED (14 Jul) — Codex audit corrections live in candidate; verified
All 7 corrections spot-verified by Claude + build green: Managers=Representation framing (hero
"For managers, booking agents and artist-side teams" + representation section EN+HE verbatim) ·
Bookers private-client band at hero level (wedding/company-event copy EN+HE) · Production
freelancer/crew/company scale note · Artists solo/band/collective Act framing (EN-only, no HE
improvised) · Contact = entity-family labels (tokens untouched = 033 CHECK) · chrome HE nav
Managers → משרדי אמרגנות · Producers residuals killed ("not a production workspace" closing).
+27 TODO_HE closed on passport-demo from Codex's QA doc (19 remain there; other files' HE rides
the he-site-copy pack). Agent double-fetched Drive docs (base64+plain) to guarantee verbatim
Hebrew — caught 2 transcription errors; adopt as standing practice for HE imports.
Push of this commit refreshes both previews automatically (§48 infra).

## 51. 🚀 SITE DEPLOYED TO PRODUCTION (14 Jul, owner order "הגרסה באוויר ישנה — עדכן") + STANDING RULES
DEPLOY RECORD: rel-site-2026.07.14 · SHA **5890621** · deployment dpl_BphgsZD5vzRRVTGMcHSWUKycKEkJ
· aliases www.lock.show + lock.show · deployed via Vercel API from the branch (lock-site ONLY —
app.lock.show untouched, Q8 still gates the app train; owner order supersedes the atomic-train
coupling for the site surface). ROLLBACK ANCHOR: previous production dpl_3mrHo21CZnwsab3k7NGbZ3z67v3p
(SHA 6183e81) — instant re-promote via API if needed. Ships: 11-page rebuild + flat hero (owner
no-frames ruling) + W5 entity messaging + free-pilot page + new chrome + committed embed at /app
(bundle carries exchangeCodeForSession/redirectTo — the Google-loop fix surface for
www.lock.show/app/signup; interactive round-trip verification = Maria's one Google test).
OWNER STANDING RULES (14 Jul): ① Claude Code spawns agents under itself for EVERYTHING Claude
Code can do ② PRODUCTION-QA AGENT runs on EVERY production round (round 1 launched: live-route
sweep, fingerprints, embed/OAuth evidence, live screenshots → docs/design-system/current-screens/
2026-07-14-LIVE/) ③ live-status transparency: Version Map artifact = the live board.
NOTE: sandbox CAN now reach www.lock.show (HTTP 200) — live verification is in-house; Cowork's
outside-in check remains as redundancy, not dependency.

## 52. COST-BOUNDARIES MAP + DEPLOY-TRAIN LAW (owner order 14 Jul)
docs/COSTS-BOUNDARIES-2026.07.14.md = the single free-vs-paid map (CFRO-aligned; CFRO owns
updates). Owner-flagged waste CONFIRMED by measurement: 50+ deployments today (26 app/24 site)
vs Vercel Hobby 100/day. FIXED: site smart-skip restored (range-aware, website-next-only,
fail-open; API train-deploys bypass it by design). LAW: production = named trains only
(SITE-TRAIN-2 target 16 Jul: wave-6+HE/RTL one deploy · APP-TRAIN target 16-17 Jul: post-Q8 one
deploy), each train = Production-QA agent round; branch pushes batched. Paid triggers ahead of
us, in order: Supabase Pro $25 (pre-launch, backups — pending owner) → Vercel Pro $20 (at first
revenue, ToS) → Resend $20 (if >100 auth emails/day). Nothing else changes cost at launch.

## 53. PRODUCTION-QA ROUND 1: GREEN (14 Jul, live www.lock.show @ 5890621)
14/14 routes 200 — **the /managers + /production 404s from Codex's live audit are GONE** (that
question closes; they were old-production artifacts). New-version fingerprints on all sampled
pages · old hero absent · zero price language on /pricing · footer/robots/sitemap correct ·
zero console errors/mixed content. EMBED: /app/signup + /app/login serve bundle index-Dhjy-W_p.js
containing signInWithOAuth redirectTo pinned to current origin + exchangeCodeForSession — the
Google-loop fix is WHAT PRODUCTION SERVES; final interactive proof = Maria's one Google click.
Live screenshots: docs/design-system/current-screens/2026-07-14-LIVE/. Minor notes (no blockers):
preload-tuning nit (7 warnings) · one scroll-reveal card blank in headless mobile capture only
(text in HTML; one real-phone glance recommended) — both queued to wave-6 polish.

## 54. WAVE-6 VISUAL UPGRADE on branch (14 Jul) — Codex mobile-first spec; NOT deployed (named-train law)
Verified by Claude: build 0 · zero horizontal overflow 360/390/430 all 7 pages · mobile nav sheet
clean+sticky CTA · free-pilot = product composition (no photo). Tokens (amber-stage/ember/smoke/
source-blue + gradients/glows) · mobile nav sheet + accordion footer · card variants (Signal/
Editorial/MediaTile/Firewall/Chip) w/ hover-focus-active · per-page accent rhythm · Free-Pilot
orbit · Methodology trust-lab. 18 shots: docs/design-system/current-screens/2026-07-14-wave6/.
GATES to SITE-TRAIN-2 production: ① Maria taste ② Codex mobile-screenshot approval (its DOD) →
one named deploy + Production-QA round. HE RTL wave runs in parallel. Not in scope: HE RTL, OG
images, broader interior card swaps.

## 55. TEST USERS SEEDED + ARCHITECTURE CONSENSUS (14 Jul)
TEST USERS (service_role key from Maria, gitignored → 🚩 ROTATION pending; node blocked by proxy so
used GoTrue admin API via curl): all 5 @gigproof.test now exist, password Gigproof!2026, email-
confirmed: artist@ (rich data) · agency@ (rich data) · booker@ (role set) · producer@ (role set) ·
operator@ (role set). In Version Map "🔑 Test Users" tab.
DELETION (owner "delete all except @gigproof.test") — HELD for owner sign-off per CTO standard
(never auto-delete). Non-test accounts: garmel.maria@ + error4ik@ = MARIA's real (NEVER delete) ·
gigproof.e2e.1782660887628@ = E2E bot (safe delete) · shydaviddjnattaly@ = looks like a REAL
person/tester (confirm before delete — may hold real data). Only delete on explicit per-email word.
ARCHITECTURE CONSENSUS (GPT audit + Codex audit + my 2 agents ALL AGREE — strong signal):
CANONICAL RULING (recommend Maria approve): THREE customer workspace families = Artist ·
Representation · Production. Buyer + Source-Confirmer = non-workspace contexts by default.
Operator = internal. All other ecosystem roles = scoped role assignments/access grants, NOT
workspaces. Role+authority (Act/territory/category/action/dates) assigned INSIDE workspaces, NOT
as permanent profiles.role. P0 architecture fixes agreed by both audits: A1 role-derivation from
any membership + restrict workspace creation (fixes D2 buyer dead-end) · A4/D3 retire /producer +
/producer/received (accountless /confirm/:token only) · A5 remove/flag /artist/offer (free-pilot
contradiction) · A3 Production signup path (marketed, unreachable) · A6/D1 Artist/Act Identity
Editor (write-once today) · SPA rewrites deploy+verify · deep-route reload smoke test. Consolidations:
readiness→Radar · agency/radar→Roster · production event-first · settings+org/*→Settings Hub ·
Representation = 1 workspace, role-adapted modules (Manager vs Booking-Agent = roles not screens).
Consolidated per-entity PLAN artifact building (entity-optimization-plan.html).

## 56. PER-ENTITY OPTIMIZATION PLAN published (14 Jul) — artifact ddb50504
Consolidated PLAN artifact from all 4 audits: https://claude.ai/code/artifact/ddb50504-8da0-4991-a650-8740a923774a
8 tabs (6 entities + Cross-cutting P0 + Canonical Model), 42 priority rows (~33 distinct), 9
distinct P0 initiatives (SPA fallback · embed skew · session-boot states · reload smoke test ·
Artist/Act Identity Editor · role-from-membership+restrict-creation · retire /producer shell ·
remove/flag payment route · Production signup path). Source mirrored to
docs/prototypes/00_CURRENT/entity-optimization-plan.html. Canonical ruling flagged PENDING MARIA.
This is the app fix-wave backlog once Maria approves the ruling; P0s ride the app train pre-Q8.

## 57. PAYMENT SCREEN GATED OFF + CODEX ACCESS GRANT (14 Jul)
P0 (GPT A5 / Codex): /artist/offer payment route now behind PAYMENTS_ENABLED flag (default OFF,
free-pilot canon G17). Route redirects to /artist/home when off; both dashboard payment links
suppressed; "Free during the pilot." shown instead. verify green. Reversible via VITE_PAYMENTS_
ENABLED=1 post-Gate. (First executed P0 from the consensus plan — ruling-independent, no risk.)
CODEX ACCESS GRANT (owner order): Codex gets WRITE website-next/** (site design/update, own Claude
Code session on repo, branch codex/site) + app QA (preview URL + test logins). Boundaries: app
src/server/supabase/migrations/secrets = Claude only (collision-safe per §33; firewall/security
single-owner); production deploy = named train, owner-gated. Steps in docs/team/CODEX-ACCESS-GRANT.md.
Merge flow: Codex codex/site (site only) → Claude merges + deploys train after Codex approval +
owner taste. Owner may widen to full dev if she chooses; keep migrations+security single-owner.
