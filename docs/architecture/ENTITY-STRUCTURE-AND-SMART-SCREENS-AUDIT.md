# ENTITY STRUCTURE · SMART-SCREEN · AI/SCAN INTELLIGENCE — AUDIT
_Auditor: LOCK entity + smart-screen research auditor. Branch `claude/b4-gigproof-discovery-e7749o`. Date 2026-07-14._
_Grounded in real files (path:line) + the canon scan/intelligence specs. Docs-only audit — no source touched._

**Sources read:** `docs/architecture/ENTITY-NAV-UX-AUDIT.md` · `docs/ENTITY-MODEL-GAP-AUDIT-2026.07.14.md` (E1–E8) · `docs/architecture/INTERACTIVE-SCREENS-BUILD-PLAN.md` · `docs/architecture/TECH-UPGRADE-PLAN.md` · `docs/ENTITY-GLOSSARY.md` (DS v1.5.8) · scratchpad `DISCOVERY-ENGINE-SPEC.md` · `DATA-SOURCES-MAP.md` · `HOOKS-RETENTION-SPEC.md` · `SCREEN-EFFECTIVENESS.md` · CLAUDE.md · code: `src/features/artist/RadarUniverse.jsx` + `ArtistDashboard.jsx` · `src/lib/ai/anthropic.js` · `src/lib/genreWeights.js` · `server/index.js` · `src/features/org/ContextSwitcher.jsx` · `supabase/migrations/008_org_first_model.sql`.

**The two firewalls this audit obeys.** (1) Evidence firewall (CLAUDE.md): NO score / percentile / rank / bookability-% / gauge / prediction; draw = bands + binaries + method labels only; reaction insight back to the artist = method-safe text only. (2) Honesty firewall (CLAUDE.md): per-evidence Anthropic claim extraction is **BUILT**; multi-source deep scan at onboarding + incremental re-scans are **TARGET ARCHITECTURE** — this audit never presents target as built.

---

## PART 1 · PER-ENTITY STRUCTURE AUDIT (solo / team / company · nav · management · built vs gap)

**The org-first spine (all customer workspaces ride it).** `008_org_first_model.sql` makes the **`organization`** the tenant (`plan in ('solo','agency','agency_plus')`, `008:20-27`); a Person joins via **`organization_membership`** (`org_role in ('owner','admin','member')`, `008:29-41`); function is carried by **`role_assignment`** (`functional_role in ('booker','agency','artist_manager','artist','operator','producer')` + `authority_scope jsonb`, `008:43-50`); the live context is **`active_role_context`** (`008:52-56`); a `subscription` row carries `seats_included/seats_used` (`008:69-78`). This is the correct shape for solo→team→company: **solo = an org with one owner-member; company = the same org upgraded + seats filled**. Creation is real (`ContextSwitcher.jsx:6,74 → orgs.createWorkspace`), mapping the three customer types `['artist','agency','production']` (`ContextSwitcher.jsx:25`) onto migration-027 DB values `artist / management / producer`.

> **Cross-cutting structural gaps** (from E-gap audit, apply to every customer family): **E3** — no explicit `entity_form` (person/team/company) column; solo-vs-team is *derived* from member count, never declared. **E4** — multi-role stacking (one Person = manager + booking-agent) is legal in schema (two `role_assignment` rows) but **no UI creates or shows it**. **E6** — the individual→team→company *upgrade moment* isn't a flow; `ContextSwitcher` only offers *create-new*, never "upgrade this workspace". **D2** — a base role outside `ORG_DERIVED_ROLES=[ARTIST,AGENCY]` (`OrgContext.jsx:28`) that creates a workspace lands in a silent dead-end.

### 1.1 · Artist / Act — **SOLO / TEAM / COMPANY** (all three)
- **Forms:** **SOLO** = solo artist/DJ (the built default). **TEAM** = band / duo / collective — supported at the *Act* level (`act.format` CHECK includes `dj-set/live-set/duo/band/open-format/vocalist/other`, driving `familyFor()` in `genreWeights.js:27-44`; site copy already says "solo/band/collective", E8). **COMPANY** = an artist operating with a backing team/assistant/label — reachable in principle via `organization_membership` seats, but with no artist-team invite UI.
- **The Person is always one human** (glossary §2c: "Artist — individual, ONE entity even with many genres/Acts; genres = attributes, not entities"). The solo/team/company axis therefore lives on **(a) the Act's performing form** (`act.format`) and **(b) workspace seats**, never on the Person. Multi-Act (a psytrance Act + a techno Act) is a *within-Person* fan-out, orthogonal to solo/team.
- **NAVIGATION:** workspace switch via `ContextSwitcher` (top-right, every breakpoint → `switchOrg` → `RoleHome` → `homePathFor`); **Act** switch via the radar **center-star** BottomSheet (`RadarUniverse.jsx:591-623`, `pickAct`/`createNewAct`) — switching swaps the whole universe, never merges evidence (`RadarUniverse.jsx:141-182`, canon per-Act non-transferable).
- **MANAGEMENT (members/roles/authority):** owner-member only in practice. Seats exist in schema (`organization_membership`, `subscription.seats_included`) but there is **no artist-side "add a bandmate / assistant" UI** — team/company is schema-latent, not surfaced.
- **BUILT:** solo artist end-to-end (onboarding → radar → passport → requests); multi-Act create/switch. **GAP:** **D1** identity is set-once (no edit surface — the owner's reported broken screen); no team/company invite UI; `entity_form` derived not declared (E3); Act management thin (create/switch only, no rename/delete/per-Act passport overview — D8).

### 1.2 · Representation (Manager office / Agency — אמרגן, artist-side) — **SOLO / TEAM / COMPANY**
- **Forms:** **SOLO** = a solo booking manager (`orgs.js:20 'booking_manager' → ROLES.BOOKER`, plan `solo`). **TEAM** = an agency with booking-agent seats (plan `agency`). **COMPANY** = a full artist-management company (plan `agency_plus`). Glossary §2c confirms "Manager office — individual OR team/company; membership ≠ artist ownership".
- **NAVIGATION:** `/agency` (Roster) · `/agency/radar` (demand feed) · `/agency/requests` (inbox) + shared `/org/*`. Workspace switch via `ContextSwitcher`.
- **MANAGEMENT:** real — `/org/members` (seats + invites, `/invite/:token` accept), `role_assignment` write gated `owner/admin` (`008:209-212`). Roster is a **separate axis** from team membership: `artist_access` grants (`008:58-67`, migration 032) — an ArtistAccess grant is consent-based and revocable by either side, and never implies ownership.
- **BUILT:** roster + ArtistAccess request/revoke, radar feed, requests inbox, members/invites, upgrade-request, light billing — all read real data (~80%, nav-audit §5). **GAP:** **E4** no manager-vs-booking-agent role UI (the two sit in one undifferentiated `agency` role family); **E6** upgrade is create-new only, never in-place "add teammate = upgrade".

### 1.3 · Production (משרד הפקה — `workspace_type='producer'`) — **SOLO / TEAM / COMPANY**
- **Forms:** **SOLO** = a freelance event producer. **TEAM** = a production crew. **COMPANY** = a production company (events + lineups + team). All three are one workspace type that grows via seats. Glossary §2b/§2c: "Event production — individual OR team/company; ≠ Source Confirmer; not a roster owner".
- **NAVIGATION:** one component, three tabs via `useLocation` — `/production` (Team) · `/production/events` · `/production/requests` (`ProductionDashboard.jsx:33-37,214-235`). Gated by `RequireProduction` on `workspace_type='producer'` so it never falls through to the agency roster.
- **MANAGEMENT:** team roster reads real org data (`ProductionDashboard.jsx:57-158`); seats/invites via shared `/org/members`.
- **To BOOK an artist, Production acts as a Buyer** (opens a Passport link → availability request) — there is no separate outbound-booking screen, by design.
- **BUILT (read):** Team + Events render real data; Requests degrades to an honest "not wired yet" without migration 032 (`ProductionDashboard.jsx:163-179`). **GAP:** no event/lineup **creation** UI, no slot-booking action; **D2** a base-role producer who creates this workspace can't reach it (producer ∉ `ORG_DERIVED_ROLES`).

### 1.4 · Buyer (מזמין הופעות — demand side) — **NO WORKSPACE by default**
- **Forms:** segmented, NOT אמרגן (glossary §2b): professional buyer (venue/club/festival/promoter/talent buyer) · private client (wedding couple, family/party) · corporate client · event planner. **Solo/team/company does not apply** — the buyer needs **no workspace**: the public Passport (`/passport/:id`) + availability-request flow is their entire surface, and it needs **no login** (verified: route is outside all auth guards). A signed-in professional booker gets one thin private home (`/discover` = link-resolver + explainer, `BookerHome.jsx:16-51`).
- **NAVIGATION:** public — shared link → `/passport/:id` → `/passport/:id/request` → `/sent`. Signed-in — `/discover`.
- **MANAGEMENT:** none (no members, no roles, no seats). A festival committee / venue *organization* is correctly **post-Gate** (E5 — buyer team unmodeled, out of scope for pilot).
- **BUILT:** public Passport (live) + request + receipt; `/discover` for its scope. **GAP:** **D9** single generic register — no private/corporate/planner warm-copy path ("מזמינים אמן להופעה?"). Copy/IA slice, not a launch blocker.

### 1.5 · Source-Confirmer (מאשר-מקור) — **INDIVIDUAL, accountless, NO WORKSPACE**
- **Forms:** individual only; **never a workspace** (glossary §2/§2c, `ENTITY-GLOSSARY.md:55,83`: "accountless magic-link task — NO signup, NO dashboard, NO workspace shell — never build as a workspace"). Confirms exactly ONE claim via a bounded magic link.
- **NAVIGATION:** the entire correct surface is `/confirm/:token`. No nav, no switch, no home.
- **MANAGEMENT:** none.
- **BUILT:** `ProducerConfirm` at `/confirm/:token` (Yes/Partly/No/Not-me) — complete and correct, the real value. **GAP:** **D3** mis-modeled — `/producer` + `/producer/received` exist as a logged-in workspace shell inside AppShell (`ProducerHome.jsx:19` literally renders "Producer workspace"), colliding with the Production *company* workspace; **D4** `/producer` orphan route; **D5** `ProducerReceivedPassports` is a functional stub (no data fetch); **D7** hardcoded English, bypasses i18n. **Fix: retire the workspace shell.**

### 1.6 · Admin / Operator (תפעול) — internal console, not a customer workspace
- **Forms:** internal LOCK team only; never in public signup (`role='operator'`, granted by runbook). No solo/team/company axis.
- **NAVIGATION / MANAGEMENT:** single `/admin` console (`AdminDashboard`): publish, entitlement activation, consents, export, delete, audit, upgrade approval (`AdminDashboard.jsx:3-9`). `is_operator()` gives cross-tenant read via RLS.
- **BUILT:** ~90% (light billing aside). **GAP:** advisor (read-only) separation needed before any second grant; business cockpit (Gate tile, per-entity funnels) is a next-version add.

**Structure verdicts (one line each):**
- **Artist/Act** → SOLO ✅built · TEAM (band/collective) schema-supported via `act.format`, no team-invite UI 🟡 · COMPANY schema-latent 🔴 · **D1 edit gap is the P0.**
- **Representation** → SOLO/TEAM/COMPANY all schema-real (plan solo/agency/agency_plus) ✅; **E4 role-stacking + E6 in-place upgrade** have no UI 🟡.
- **Production** → SOLO(freelancer)/TEAM(crew)/COMPANY all one workspace_type ✅ read-only; **no event/lineup creation, D2 reachability** 🔴.
- **Buyer** → **no workspace** (correct); segmented registers; buyer-team = post-Gate (E5). Single-register copy gap D9 🟡.
- **Source-Confirmer** → **no workspace** (accountless); the built workspace shell is the D3 violation to retire 🔴.
- **Admin** → internal single console, no scaling axis ✅.

---

## PART 2 · SMART / INTERACTIVE SCREEN AUDIT (content map · interaction process · ✅smart / 🟡partial / 🔴dumb)

_Grade rubric (from `SCREEN-EFFECTIVENESS.md` §Method): ✅smart = **PROACTIVE** (leads with what the system already found/can do; the human approves; the screen updates as you touch it). 🟡partial = **REACTIVE** (responds to explicit action with a state change) but on a core surface that canon says should reach proactive. 🔴dumb = static form/list/wall, or a stub._

### Artist / Act
| Screen (route) | Content map | Interaction process (arrival → next) | Grade |
|---|---|---|---|
| **Onboarding** `/onboarding` | stage_name + city + exactly one link; inline consent (`Onboarding.jsx:75,104-113`) | Arrive → one field group → paste one link → "→ Radar". `upsertArtist` writes identity **once**. | 🟡 minimal-by-design; **canon wants ≤2 cards where the claim morphs into the workspace + scan kickoff** (Build-Plan #2, SCREEN-EFF R1) |
| **Radar** `/artist/home` | `ArtistDashboard`→`RadarUniverse`: 6 planets/18 segments, platform ring (real detected platforms only), milestone journey M1–M8, genre-emphasis rings, ONE next-action card, Act center-star | Arrive → radar renders active Act's universe → "Needs you" lens opens found (✦) items as an in-place review panel → tap a planet → confirm rows (each shows exact wording + concrete source + proves/doesn't-prove **before** the button) → confirm bloom → named receipt says what landed where | ✅ **smart** for confirm/collect; 🟡 for **edit** — confirmed nodes render "in place" with **no form** (`RadarUniverse.jsx:156-166,713`), so a set value can't be corrected (**D1**) |
| **Evidence Capture** `/evidence/:artistId` | upload / paste-link / declare → per-evidence AI claim extraction (`server/index.js:213`) | Arrive → pick path → submit → honest "AI running" → extracted claims return as found nodes | 🟡 REACTIVE, form-first; **canon wants proactivity inversion**: "Connect — we'll pull it" first, manual = labeled SELF-REPORTED fallback (SCREEN-EFF R7). Should become a guided drawer *from* the Radar (Build-Plan Wave 2) |
| **Claim Review** `/artist/claims` | approve / edit / route extracted claims; send-to-Source-Confirmer | Opened as a radar **panel** (reviewSignal) — list of claim cards, per-card approve/edit/send | 🟡 partial; **D6** orphaned from nav with a dangling `quickLinks` chip (`ArtistDashboard.jsx:313-315`) |
| **Readiness** `/artist/readiness` | readiness breakdown (bands/binaries, no score) | Read-only; no primary action | 🔴 static + **D6** orphaned |
| **Passport (self)** `/artist/passport` | redirect to public `/passport/:id` (`PassportSelf.jsx:28-29`) | Redirect → artist previews exactly the Buyer view | ✅ (the target it lands on is smart — see Buyer) |
| **Requests** `/artist/requests` | incoming availability requests — **THE Gate metric** | List → per-request reply / close | 🟡 REACTIVE; canon wants the save-reaction to *propose* the strongest follow-up (ticket export) |
| **Offer / payment** `/artist/offer` | founding-Passport manual pay (Bit), measured-not-required | Explainer → single "mark paid" | 🟡 REACTIVE (right level — a deliberate single decision) |
| **Settings** `/settings` | edits `full_name`, WhatsApp, marketing opt-in, ArtistAccess approve/decline | Field edits + flat `saved` boolean | 🔴 dumb form + **D1** (closest thing to "edit artist" but omits Act identity — stage_name/genre/bio live on `act` with no form) |

### Representation / Agency
| Screen | Content map | Interaction | Grade |
|---|---|---|---|
| **Roster** `/agency` | consented roster + ArtistAccess request/revoke (`AgencyDashboard.jsx:33-108`); active grants only | Roster list → per-artist request-access / revoke / open; empty = "request access to your first artist" | 🟡 REACTIVE; **canon wants each row = one artist-bound guided next-action card** (what changed · why · action — Build-Plan #4) |
| **Radar feed** `/agency/radar` | firewall-safe demand signals across roster (method-labeled, never ranked) | Signal list → open signal | 🟡 REACTIVE; rank-risk to audit (never-rank roster pattern) |
| **Requests inbox** `/agency/requests` | availability requests touching agency artists | Rows w/ status → open/reply | 🟡 REACTIVE |
| **Members** `/org/members` | seats + invites, role set | List → invite → set role; `/invite/:token` accept | ✅ complete for its job (E4/E6 depth absent) |
| **Org settings / Upgrade / Billing** `/org/*` | workspace profile · plan-upgrade request · billing summary | Edit→save · request-upgrade · read-only | ✅ / ✅ / 🟡 (light) |

### Buyer / מזמין הופעות
| Screen | Content map | Interaction | Grade |
|---|---|---|---|
| **Public Passport** `/passport/:id` | **THE product**: recipient-safe Buyer view — verified strengths only, draw as bands+binaries+method labels, persona toggle booking/rep (`Passport.jsx:30,134`) | Arrive (no login) → 30-sec scan (hero+2 proofs+CTA) → toggle persona → proof-unit hover = source peek (where-it-comes-from + what-the-label-means) → one "request availability" CTA | ✅ **smart** (PROACTIVE — source peek makes trust inspectable; measured fold) |
| **Availability request** `/passport/:id/request` | name / event / date — **THE Gate action** | Short form → submit → lands in artist inbox | 🟡 REACTIVE (receipt exists; deliberately short) |
| **Request sent** `/passport/:id/sent` | receipt + optional "save this passport" | Confirmation copy | 🟡 REACTIVE (right level) |
| **Booker home** `/discover` | link-resolver + explainer, one action, sample-passport escape hatch | Paste/open a Passport link | 🟡 partial + **D9** single register |

### Production
| Screen | Content map | Interaction | Grade |
|---|---|---|---|
| **Team** `/production` | production team roster (real org data) | Member list → open member | 🟡 REACTIVE (read); **canon wants Events-first entry, not Team** (Build-Plan #5) |
| **Events** `/production/events` | events the production runs (real data) | Event list → open; **no create/edit UI** | 🔴 view-only — no event/lineup **creation** |
| **Requests** `/production/requests` | production-touching requests; tri-state null/empty/honest-gap on migration 032 | Rows w/ status | 🟡 honest-gap |

### Source-Confirmer
| Screen | Content map | Interaction | Grade |
|---|---|---|---|
| **Confirm claim** `/confirm/:token` | the exact ONE claim text, nothing else; confirmation upgrades evidence to method-labeled "verified" | Read one claim → Yes/Partly/No/Not-me → done. No login, no nav, one decision | ✅ **smart** (PROACTIVE — name-visibility control, inline "partly" correction, receipt with revoke route) |
| **Producer home** `/producer` | "Producer workspace" landing that should not exist | links to "received" | 🔴 **D3/D4/D7** mis-modeled + orphan + hardcoded English — **retire** |
| **Received passports** `/producer/received` | "Passports shared with you" | link-resolver stub; admits no data fetch | 🔴 **D5** stub — wire or drop |

### Admin
| Screen | Content map | Interaction | Grade |
|---|---|---|---|
| **Ops console** `/admin` | Payments · Upgrades · Artists · Requests · Claims · Consents · Audit; publish/activate/export/approve/delete | Dense multi-section console (intentional) | ✅ complete; REACTIVE-by-design (operator) |

**Smart-screen tally (customer + confirmer + admin surfaces, excluding pure redirectors/auth):**
- ✅ **smart (PROACTIVE):** 4 — Radar (collect/confirm mode), Public Passport, Confirm-claim, Admin console. (Passport-self inherits Public Passport.)
- 🟡 **partial (REACTIVE, wants proactive):** ~13 — Onboarding, Evidence Capture, Claim Review, Requests, Offer, Roster, Radar-feed, Agency-requests, Availability-request, Request-sent, Booker-home, Production-Team, Production-Requests.
- 🔴 **dumb / static / stub:** 6 — Settings, Readiness, Production-Events (view-only), Producer-home, Producer-received, (Radar **edit** mode counts here as the D1 hole inside an otherwise-smart screen).

Headline: **the Gate-critical surfaces (Radar collect, Public Passport, Confirm) are already smart; the drag is (a) the artist edit hole (D1), (b) the two mis-modeled confirmer screens (D3/D5), and (c) production create-nothing.**

---

## PART 3 · THE AI / SCAN INTELLIGENCE LAYER (owner emphasis: "AI/SCAN inside the Radar, industry comparison, reasoned recommendations")

**The honest built-vs-target split (this is the crux of the owner's ask).**

| Intelligence pillar | BUILT today | TARGET (spec'd, not built) |
|---|---|---|
| **(a) SCAN — what LOCK found** | **Per-evidence Anthropic claim extraction** — `server/index.js:213-337` calls `processor.labelWithMethod(ev)` (`anthropic.js:71`), one artifact at a time, returning a bounded status (`verified/supporting/self-reported/not-assessable`), claim_type, value, reason. Firewall enforced twice: the `SYSTEM` prompt prohibits score/percentile/rank/exact-count (`anthropic.js:18-26`) and `#sanitize()` forces the bounded status (`anthropic.js:117-123`). Deterministic stub fallback keeps a batch alive without an API key. The radar's ✦**found** nodes render *this* pipeline's output. | **Multi-source deep scan at onboarding** (`DISCOVERY-ENGINE-SPEC.md`): consent (`thirdparty-evidence`) → Claude generates 8–12 queries (HE/EN transliterations + genre/city/platform) → **Tavily** search+extract → `claude-opus-4-8` extracts candidate claims per source with `same_person_confidence` + source + date + proves/doesn't-prove → dedup → appears as ✦found → artist confirms. Cost ~$0.15–0.25/scan (within the $1 budget). **Incremental re-scans** (`last_discovery_scan_at`, on-demand or ≤monthly). **Status: not one line of external-integration code exists** (`DATA-SOURCES-MAP.md`: 100% is door-3 artist-pasted); `processing_job` table is live with **zero writes**. Needs migration 028+ (`source_type='discovered'`, `person.full_name_he/en`), a `POST /api/discovery-scan/:actId` endpoint + Vercel-Cron chunked worker. Honest coverage vs the Perlman hand-profile: ~50–60% of public findings auto-discoverable, ~15–20% (legal structure, management, label) never. |
| **(b) INDUSTRY COMPARISON — method-safe context vs peers** | **Genre-emphasis guidance** — `genreWeights.js` `primaryPlanets()`/`isPrimaryPlanet()` marks which planets "matter most in your genre" as an **additive ring + words only** (`RadarUniverse.jsx:226,412-446`), and `ArtistDashboard.jsx:296-300,337` renders a one-line "these planets buyers weigh in your genre" note. This is *genre-normative guidance*, firewall-clean: `genreWeights.js:3-4` — "never a number, score, rank, percentage, genre leaderboard, public badge, or buyer-facing weakness." | **True peer/industry bands** — "what does a techno DJ at your stage usually show?" as **bands + method labels only, never a rank/percentile** (RAD5 roadmap, `HOOKS-RETENTION-SPEC.md` A.2 "guidance vs genre norms — method-safe", flagged "roadmap"). Nothing compares an artist to a peer cohort today. |
| **(c) RECOMMENDATIONS — reasoned "improve X → gives you Y"** | **The next-best-action engine** — `pickNextAction()` (`ArtistDashboard.jsx:36-60`) is a rule-based coach that derives ONE clearest move from real state (review claims → add draw evidence → photo → links → experience → bands → publish → reply to a waiting buyer → refresh stale proof → share), each carrying a `why` line; `withGenreNote()` (`:26-30`) appends the genre-matters note when the action targets a primary planet. The **milestone journey M1–M8** (`ArtistDashboard.jsx:66-108`) is the named-waypoint progress frame (no %, no bar). | **Reasoned, evidence-linked recommendations** — "*because a booking manager can't verify your draw, add a ticket export → it upgrades this claim to producer-confirmed*", tied to the scan's findings and to peer bands. Deeper "what it gives you" reasoning beyond the current one-line `why`. Partly reachable by extending the built engine; fully reasoned form = target. |

**Per-screen intelligence map (where the three pillars should render, method-safe):**

- **Radar `/artist/home` (the primary intelligence surface).**
  - *Scan:* today = ✦found nodes from per-evidence extraction. Target render = an **onboarding "your universe blooms" moment** — deep-scan candidates arrive as ✦found across planets, each a confirm row (exact wording + `same_person_confidence`-gated source + proves/doesn't-prove) reusing the *existing* confirm component; a "this isn't me" reject (same component, inverted) for name-ambiguity, recorded not deleted. **Never publish-as-fact** — everything stays `artist_approved=false` until confirmed.
  - *Industry comparison:* today = genre-emphasis ring + one-line note. Target render = per-planet **band context** ("artists in your genre usually show a ticket export here") as a muted mono caption under the planet panel — **bands + method labels, no cohort number, no rank.**
  - *Recommendations:* today = the one next-action card + `why`. Target render = the card cites the scan/comparison ("*found a Selector listing — confirm it to fill your Proof planet, which buyers in techno weigh first*").
- **Evidence Capture `/evidence/:artistId`.** *Scan:* the built extraction runs here. Target = "Connect — we'll pull it" leads (door-1/2 integrations, `DATA-SOURCES-MAP.md` priority order: universal ticket-import → Instagram OAuth → SoundCloud oEmbed), manual = SELF-REPORTED fallback. *Recommendation:* label the pulled result's method honestly at capture.
- **Claim Review `/artist/claims`.** *Scan:* shows extracted claims + reason. *Recommendation:* "send to a מאשר-מקור to upgrade to producer-confirmed" is the reasoned next step already implied — surface it as the primary per-card action.
- **Public Passport `/passport/:id` (buyer intelligence).** *Scan:* renders only confirmed, artist-approved, verified/supporting claims (the scan's *output*, never its raw candidates). *Comparison:* **no peer bands buyer-side** unless method-safe and requested — the buyer sees this artist's own bands + method labels only. *Recommendation:* n/a (buyer surface).
- **Agency Roster `/agency`.** *Scan:* per-artist freshness/needs state. *Recommendation:* each row = "what changed · why · the one action" (request evidence from artist → mutates row to "Requested — on X's radar"). Never a roster rank.
- **Requests / reaction insight.** *Recommendation:* reaction returning to the artist = **method-safe text only, never a count/%/score** (CLAUDE.md firewall — the single most fragile spot; guard it in any scan-driven "buyers reacted" surface).

**Concrete render principle for all three pillars:** scan result = a **found card** (source + proves/doesn't-prove + confirm/reject); comparison = a **muted mono caption of bands + method labels**; recommendation = the **one lime next-action card** citing the finding. No gauge, no cohort number, no rank — ever.

---

## PART 4 · PRIORITIZED GAPS (folding into the interactive-screens build plan)

**P0 — before/at Gate (ruling-independent screens are buildable now, Build-Plan §GATES).**
- **P0-1 · Artist Act-Identity Editor** (`/artist/act/edit`, opened from the Identity planet) — resolves **D1**. Inline-editable stage_name · city · genre · `act.format` · positioning · photo · links; field-level save + dirty/saved/error; live "what becomes public" chip; prefilled; per active Act; ≤3 clicks from the radar. Give confirmed radar nodes an "edit" affordance that re-opens `MissingFill` pre-filled (`RadarUniverse.jsx:713`). *This is the owner's reported broken screen.* (Build-Plan #1, TECH-PLAN P0-5.)
- **P0-2 · Retire the Source-Confirmer workspace shell** — resolves **D3/D4/D7**. Remove `/producer` + `/producer/received` from AppShell/nav; confirmer lives only at `/confirm/:token`. (Build-Plan #6.)
- **P0-3 · Fix the cross-entity create dead-end** — resolves **D2**. Either recompute effective role from any matching membership or gate `NEW_WORKSPACE_TYPES` by base role (`ContextSwitcher.jsx:25`, `OrgContext.jsx:28,86-88`).

**P1 — fast follow.**
- **P1-1 · Evidence Capture as a guided drawer from the Radar** with proactivity inversion ("Connect — we'll pull it" first). (SCREEN-EFF R7, Build-Plan Wave 2.)
- **P1-2 · Agency roster guided-action cards** (row = what-changed · why · one action). (Build-Plan #4.)
- **P1-3 · Production event-first entry + create-event/open-slot** interactive; fix Production reachability at onboarding. (Build-Plan #5.)
- **P1-4 · Representation role modules** — Manager vs Booking-Agent views inside ONE workspace (E4), and "add teammate = upgrade" trigger (E6). (Build-Plan Wave 2.)
- **P1-5 · Resolve Readiness/ClaimReview nav status** (D6) — fully absorb into the radar or restore to nav; kill the dangling `quickLinks` chip.
- **P1-6 · Discovery Engine Phase A (target scan, gated on counsel + real Anthropic key)** — migration 028+, `POST /api/discovery-scan/:actId` + Cron worker writing `processing_job`, Tavily + opus extraction, appears as ✦found, **operator hand-QA before user-facing**. Do NOT market as built until measured. (DISCOVERY-ENGINE-SPEC Phase A.)

**P2 — post-Gate.**
- **P2-1 · Explicit `entity_form` (person/team/company)** column + solo→team→company upgrade flow (E3/E6); artist team-invite UI.
- **P2-2 · Full Act management** (rename/archive/versions, per-Act passport overview — D8).
- **P2-3 · Industry-comparison bands** (RAD5) — bands + method labels only, firewall-reviewed before any cohort context renders.
- **P2-4 · Buyer register segmentation UI** (D9 — private/corporate/planner copy paths); territory/period authority editor; Production slot depth; RTL flip.

---
_File: `docs/architecture/ENTITY-STRUCTURE-AND-SMART-SCREENS-AUDIT.md`_

## PART 3b · DISCOVERY STEP + LOCALE-AWARE INTELLIGENCE SPEC (owner directive 14 Jul — "רשום")
THE FLOW STEP (must exist in onboarding, prototype P-12 + real app target):
1. BASIC ONBOARDING — artist gives minimal input: act/artist name + 1 main link (+ optional genre/city).
2. **DISCOVERY AGENT ACTIVATES** (after basics, with consent `thirdparty-evidence`) — searches the
   artist's WHOLE public universe: accounts + info across platforms/sources.
3. FINDINGS → ✦found nodes on the Radar → artist CONFIRMS (he approves, does not build from scratch).
4. Confirmed → method-labeled (Source-linked / Producer-confirmed); LOCK then helps (Passport, bookings).

LOCALE-AWARE (owner's core addition — NOT hardcoded HE/EN):
- Discovery adapts to the artist's COUNTRY and the LANGUAGES SPOKEN THERE. Detect country from the
  artist's locale/input (or ask once).
- Query generation + name transliterations run in that market's languages. E.g. Israel = Hebrew +
  English + Russian; Germany = German + English; France = French + English; etc. Default = English +
  the country's primary language(s).
- Platform set is locale-aware too: Israel → Eventer · Tickchak · Go-Out · local promoters, plus
  global (Spotify · Instagram · Resident Advisor · SoundCloud · Bandcamp · YouTube). Other markets →
  their local ticketing/listing platforms + the global set.
- Claude generates 8–12 queries per the detected locale (transliterations, genre, city, venue,
  platform) → Tavily search+extract → opus extraction with same_person_confidence + source + date +
  proves/doesn't-prove → dedup → ✦found → confirm. Incremental re-scans on-demand / ≤monthly.
STATUS (honest per CLAUDE.md): TARGET ARCHITECTURE — per-evidence AI extraction is BUILT; the deep
multi-source auto-discovery + locale-awareness is NOT built (zero external-integration code today).
Cost target ≈$1/scan (Tavily + opus). Gated on counsel sign-off + real Anthropic key + operator
hand-QA before user-facing. Needs migration (source_type='discovered', person.full_name_<locale>,
artist.country/languages) + POST /api/discovery-scan/:actId + Cron worker. Prototype MAY show the
intended experience (vision), method-labels stay honest (found vs confirmed). Source spec:
DISCOVERY-ENGINE-SPEC (Drive/scratchpad) — persist to repo when the build is scheduled.

---

## PART 5 · RADAR COMPONENT & SIGNAL SPEC — the durable spec (owner directive: "document the Radar's signals & components"; also the reference for the ENGAGING redesign)
_Numbered PART 5 to avoid clashing with the existing "PART 4 · PRIORITIZED GAPS" above; this IS the "Radar component & signal spec" the owner asked to be documented._
_Grounded in `src/features/artist/RadarUniverse.jsx`, `src/lib/radarUniverse.js`, `src/lib/genreWeights.js`, `src/lib/analytics.js` (M1–M8), and the redesigned prototype Radar (`scratchpad/lock-full-prototype.html`)._

**What the Radar IS (one sentence).** The artist's private, living picture of their own professional proof — six dimensions a booking manager weighs — where LOCK shows what it *found* on public sources and the artist *confirms* what's really theirs, one tap at a time. Buyers never see the Radar; they see only the Passport (verified strengths). The Radar is where evidence is reviewed and confirmed — it is not a separate "dashboard".

**Two readings for every component.** *Artist read* = "what's strong, what still needs me, what to do next" (gaps are invitations, never penalties). *Buyer relevance* = the same signal, once confirmed and method-labelled, becomes a checkable strength on the public Passport. The Radar itself is never buyer-facing.

**FIREWALL (applies to EVERY row below, no exceptions).** Bands + binaries + method labels only. NEVER a score, percentile, rank, "bookability %", prediction, gauge, headcount, peer-leaderboard, or position. State is shown as one of four bounded words (Ready · Developing · Needs you · Locked) + four bounded node marks (✓ ✦ ? +) + a colour. N/A ≠ weakness. Nothing goes public until the artist confirms it.

---

### 5.1 · CENTER STAR — the artist (and the multi-Act switch)
- **MEANING.** *Artist:* "this universe is mine — this Act." The gravitational centre everything else orbits. *Buyer:* the identity + genre a booking manager reads first. **MULTI-ACT:** one Person may hold several Acts (a psytrance Act + a techno Act…); each Act is its own universe with its own evidence — **non-transferable**. Tapping the name opens the Act switch; switching swaps the *whole* Radar, never merges two Acts.
- **VISUAL.** A round artist photo (or the stage-name initial) inside the one warm gold aura, name below, a small genre chip under it, a ▾ affordance signalling the Act switch. It is the only element carrying the gold "backstage-lamp" glow (gold budget = center aura + method labels).
- **STATES.** Default Act (prop-driven) · a switched-in non-default Act · empty/"blossom" Act (a brand-new Act, honestly empty). The genre chip is tappable → opens the Identity dimension.
- **HOW PRESENTED (engaging + safe).** Redesign adds a slow **`starglow`** breath (~4.5s) so the star feels alive; confirmed dimensions **flow energy inward** along their constellation thread (see 5.7) — the star visibly "gathers" the artist's proof. No number ever sits on the star.

### 5.2 · THE SIX PROOF-DIMENSION PLANETS
Six planets on a fixed orbit (angles −90/−30/30/90/150/210 in code, `radarUniverse.js:9-16`). Each planet = one dimension a buyer weighs; the signals ("nodes") that live under it are derived at render time from the Act's real `artist` fields + `profile_items` + `claims` — nothing stored, nothing scored.

| Planet | MEANING — artist / buyer | Signals that live under it (nodes) | Icon |
|---|---|---|---|
| **Identity & Story** | Who you are and how you position — *artist:* your first impression; *buyer:* the first thing they read. | Stage name, one-line positioning, genre, press photo, Act goal (guidance only). Public profile links whose home is identity. | person glyph |
| **Music & Catalogue** | A live, checkable catalogue on public platforms — *source-linked, not self-described.* | Spotify / SoundCloud / Bandcamp / Apple catalogue links; releases; mixes & DJ sets. | equalizer bars |
| **Live Show** | Proof you perform consistently and draw a real crowd — *shown as bands, never a headcount.* | Lineup-frequency band, track-record events, RA/event-page bookings, ticket/settlement export (the single strongest draw proof). | stage/venue glyph |
| **Audience & Community** | The audience you own and can bring to a room — *a band, not an exact follower number.* | Owned-community **band** (integer stays working-only; only the band is public), engaged-following consistency, social links. | people glyph |
| **Professional Kit** | The practical facts a buyer needs to book you without friction — *binaries + bands.* | Set length, regions, technical rider, invoice-ready (yes/no), WhatsApp/contact. | flightcase glyph |
| **Career Proof** | Third-party proof that outranks any self-claim — *the trust a buyer leans on.* | Producer-confirmed rebookings, press mentions, draw claims (frequency / tickets / vouch / settlement), "ask a producer to confirm". | star/seal glyph |

- **VISUAL.** A 54–68px circle: neutral surface, thin state ring, the dimension's line-glyph, name label, and (redesign) a plain-language **state word** directly beneath (see 5.6). Genre-primary planets carry a second gold ring + a ★ (see 5.3).
- **STATES (planet rollup, bounded — never a count on the face).** **Ready** (has confirmed proof, no gaps, nothing waiting) · **Developing** (some confirmed, gaps remain) · **Needs you** (something found is waiting for your confirm, OR the dimension is still empty) · **Locked** (Professional Kit stays locked until the Live Show is backed — a deliberate sequencing hook, not a judgement). A small ✦ found-dot and a settled ✓ can sit on the face.
- **HOW PRESENTED.** Tap any planet → the drill-in panel (5.10). The face never shows how many findings — only the bounded state; the *number* of found items appears only inside the panel copy ("we found 2 things here"), never as a badge that grades.

### 5.3 · GENRE-PRIMARY RINGS ( ★ )
- **MEANING.** *Artist:* "in your genre, buyers look at these dimensions first — put your energy here." *Buyer:* n/a (guidance is artist-side only). Derived from `genreWeights.js` (`primaryPlanets()`): e.g. **dj-club → Live · Audience · Kit**, **dj-festival → Music · Live · Career Proof**, **original-artist → Music · Identity · Live**. Guard: **no genre/format signal → no emphasis at all** (every planet renders equal — never a guessed emphasis).
- **VISUAL.** An *additive* second concentric ring in the gold register + a ★ prefix on the planet label + a topline caption ("★ Buyers in your genre look here first · Live · Audience · Kit"). Additive ONLY — non-primary planets keep full opacity, full interactivity, same order (no dimming, no reordering).
- **STATES.** On (genre signal present) / Off (none).
- **FIREWALL.** A ring + words — **never a weight, number, rank, %, genre-leaderboard, public badge, or buyer-facing weakness** (`genreWeights.js:3-4`).

### 5.4 · FOUND DOTS ✦ (discovered — to confirm)
- **MEANING.** *Artist:* "LOCK found this on a public source; confirm if it's really you — nothing is public until you do." *Buyer:* never sees a ✦ (found ≠ published). This is the DISCOVER→CONFIRM spine: the artist **approves what was found**, they don't build from scratch.
- **VISUAL.** A small gold dot on the planet face (`fdpulse` breathing ring) + a gold "✦ Found" chip on the row inside the panel; a quiet gold dot also sits on the "Needs you" lens.
- **STATES.** Found (waiting) → Confirmed (✓, on one tap) → or dismissed "not me" (recorded, not deleted — for name-ambiguity honesty).
- **HOW PRESENTED.** Every found row shows, BEFORE the confirm button: (1) the exact claim wording, (2) the concrete source (method label + identifiable reference, e.g. "instagram.com · listings #3–#16"), (3) the honest proves / doesn't-prove line. The button names what it confirms. A confirm "blooms" (Master-Class "minting a moment") + a small celebration.

### 5.5 · CONFIRMED ✓ (method-labelled, settled)
- **MEANING.** *Artist:* "this is mine, backed, and can go on my Passport." *Buyer:* the same fact, method-labelled, is what they read as a verified strength.
- **VISUAL.** A settled lime ✓ chip; on the planet face a small ✓ when a dimension is fully confirmed with no gaps (Ready). Confirmed nodes carry their method label (5.11).
- **STATES.** Confirmed & Passport-bound (verified/supporting + passport-ok visibility) → lands on the public Passport; Confirmed but private → stays working-only. The receipt names *what* landed *where* ("Added to your Passport" vs "Saved privately") with a 7s undo.
- **HOW PRESENTED.** Honest destination every time — only verified/supporting + passport-ok claims actually reach the Passport; everything else stays private and says so.

### 5.6 · PER-PLANET STATE WORD (redesign — "meaning at a glance")
- **MEANING.** The single most important read: without tapping, the artist sees each dimension's status in plain words. Replaces "colour-only" state (which was unreadable at a glance — a driver of the "boring / unclear" complaint).
- **VISUAL.** One bounded word under each planet, colour-coded: **Ready** (lime) · **Developing** (teal) · **Needs you** (amber) · **Locked** (faint). Mono, tiny, calm.
- **FIREWALL.** These four words are bounded bands/binaries — the ONLY status vocabulary. Never a %, count, or rank.

### 5.7 · THE CONSTELLATION + ORBIT + RADAR SWEEP (living intelligence)
- **ORBIT RINGS.** Thin concentric hairlines — the quiet geometry of the night; pure structure, no meaning attached.
- **RADAR SWEEP.** A slow rotating conic wedge (`sweep`, ~9s) — the "we are continuously watching your public footprint" cue. Thematic only; **explicitly NOT a gauge** (it points at nothing, measures nothing).
- **CONSTELLATION THREADS (redesign).** A thread runs from every dimension into the artist star, coloured by that dimension's live state: **amber** = Needs you, **teal** (gently flowing) = Developing, **lime** (flowing, glowing) = Ready, **faint** = Locked. *Meaning:* the six dimensions are ONE connected system feeding the artist's proof — and as dimensions get confirmed, their thread lights and **flows energy inward**, so growth is something you can literally see. **FIREWALL:** the thread's colour is a state only — its length/position/thickness grade nothing (geometry is fixed by planet angle, identical for every artist).
- **SONAR + STARFIELD (redesign).** A slow ring breathing out from the star (`sonar`) + a faint twinkling starfield give depth and the "alive, scanning" feel. Parallax tilts the whole universe toward the pointer on desktop. All motion is disabled under `prefers-reduced-motion`.

### 5.8 · THE PLATFORM RING (where your proof comes from)
- **MEANING.** *Artist:* "these are the public sources LOCK reads — the same ones a booking manager would check." *Buyer:* the provenance behind each verified strength. **META-FIELD LAW:** one node per platform actually detected in *this Act's own data*; each shows the real row value — **never an invented count/follower number**. A platform with no data simply isn't shown; one "+ connect" affordance stands in for every not-yet-connected source.
- **PER-PLATFORM MEANING (hover copy, plain language).** Instagram = *your lineup listings & community* · Spotify = *your streaming catalogue* · SoundCloud = *your mixes & DJ sets* · YouTube = *your live video & sets* · Resident Advisor = *your club & festival bookings* · Bandcamp = *your releases* · TikTok = *your engaged following* · **Eventer / Tickchak / Go-Out = your Israeli ticketed events / ticket sales / event listings** (locale-aware — the local sources an Israeli buyer actually checks).
- **VISUAL.** Small source-logo tiles; connected = full colour + a lime dot; not-yet = greyed. Caption stays honest: "buyers check these to verify you · a wider automatic scan is in development".
- **STATES.** Connected (real data) · not-connected (greyed, invites) · "+ connect".

### 5.9 · MILESTONE JOURNEY M1–M8 (the growth track)
- **MEANING.** *Artist:* the named waypoints of building a Passport — a felt journey, not a progress bar. *Buyer:* n/a. The eight waypoints (prototype naming): **Arrived → First light → Radar alive → Focused → Backed → Published → In market → Answered.** These map to the measurable funnel in `analytics.js` (signup → onboarding → radar_opened → evidence_added → claim_confirmed → passport_published → share_link_created → availability_request/reaction) — the same events that measure the Gate (a booking manager reacts AND one pays).
- **VISUAL.** A horizontal track of named dots with a filling line; done = lime ✓, current = glowing pulse, next = quiet outline. A "N of 8 milestones" count-up.
- **STATES.** Per-step done / current / next.
- **FIREWALL.** Named waypoints + a step count of the artist's *own* journey — **no %, no score, no peer comparison.** (Counting a user's own product milestones is allowed; grading the artist is not.)

### 5.10 · LENSES — All · Needs you · Ready
- **MEANING.** Three calm ways to read the same universe. *All* = everything. **Needs you** = what's waiting on the artist (found items to confirm + gaps to fill) — this lens IS the review entry: it opens the batch-confirm panel inside the Radar. **Ready** = what's already confirmed/strong ("show me what a buyer would see"). Plus an optional **worlds** filter (techno · trance · weddings · festivals…) — a pure subset, zero judgement.
- **VISUAL.** Three rounded mono pills; the active one is raised; a quiet gold dot sits on "Needs you" when items are waiting. Off-lens planets dim to ~22% (a focus aid, reversible) — never removed.
- **STATES.** Active lens · found-waiting dot on/off.
- **HOW PRESENTED.** Selecting a lens re-reads the universe instantly; the drill-in and review panels live *inside* the Radar surface — nothing is a separate destination.

### 5.11 · METHOD LABELS (how we know it)
- **MEANING.** The trust vocabulary on every confirmed fact — *artist:* "here's how strong this proof is"; *buyer:* the exact basis they can lean on. Four bounded labels, strongest to weakest:
  - **Producer-confirmed** — a counterparty acknowledged this specific claim (strongest; covers this claim only, not a general endorsement).
  - **Source-linked** — a public footprint that can be checked against its live source.
  - **Evidence-supported** — a captured record supporting the claim (authenticity limited without a live source).
  - **Self-declared** — the artist's own statement, shown as a band; strengthen with a source.
- **VISUAL.** A small mono chip; Producer-confirmed carries a subtle emphasis. Always paired with the concrete source reference (host / listing range / "Spotify for Artists"), never a bare "a link".
- **STATES.** One label per node; can upgrade (e.g. Self-declared → Producer-confirmed when a producer confirms).
- **FIREWALL.** Labels describe *provenance*, never *quality*. They are the mechanism that lets draw be shown honestly as bands + binaries.

---

**Redesign changes made to the prototype Radar (`scratchpad/lock-full-prototype.html`) using this spec — for the record.**
1. **Constellation threads** center↔planet, state-coloured, with lime/teal energy flowing inward on confirmed/developing dimensions → growth made visible.
2. **Per-planet plain-language state word** (Ready/Developing/Needs you/Locked) → meaning at a glance, replacing colour-only status.
3. **Depth + life:** twinkling starfield, breathing `sonar` ring, `starglow` on the center star, glow on confirmed/developing planet faces; parallax retained; all motion respects `prefers-reduced-motion`.
4. **Genre emphasis made plain:** "★ Buyers in your genre look here first · …" topline + a ★ on each genre-primary planet.
5. **Platform ring copy rewritten to plain language** with per-source meaning on hover ("Your Spotify · your streaming catalogue").
6. **Copy de-jargoned:** "Tap any planet to see what it means and confirm what's yours. No score, no rank — only bands and how-we-know-it labels" (was terser/colder); found-banner and platform caption reworded to warm, plain English.
_Firewall re-verified across all six: no score/rank/%/gauge introduced; state stays the four bounded words + four node marks + method labels._

## PART 6 · NAVIGATION & BRANDING CONSOLIDATION (owner-annotated Radar callouts 1–6; P-15)
_Owner directive: the identity chrome was SCATTERED — five competing identity elements. "Workspace-switching should live under the top-right user; simple + accessible; NEVER more than 1–2 steps." Plus: improve branding/design. Implemented in prototype ③; verified Playwright 1360+390 (0 console/page errors, no h-scroll)._

### 6.1 · Identity chrome: 5 elements → 2
Before (scatter): (1) LOCK wordmark, (2) top-left WORKSPACE switcher, (3) top-right account, (4) bottom-left rail persona card, (5) "NAME · CAREER WORKSPACE" screen eyebrow.
After: **TWO** — brand lockup (top-left) + **one unified hub** (top-right = account + workspace switch).
- **Removed:** top-left `#wsBtn`/`.ws`/`.brand-sep`, the rail `.ctx` persona card, and the person-name from the atmos caption (now the workspace context only, e.g. "Career workspace"). Rail label simplified to "Navigation"; center crumb simplified to the section name only.

### 6.2 · The unified top-right hub (the ≤2-step switch)
Click avatar (**step 1**) → one menu: identity header ("{Workspace} workspace") · **Switch workspace** group (all 6 workspaces, ✓ on current) · account actions (Edit profile · Account settings · Restart demo · Sign out). Click any workspace row = **step 2** → switched. Never deeper than 1–2.
- **Renders in EVERY mode** (fix): Buyer/Confirmer previously escaped only via the top-left switcher; the hub now shows in public/confirm modes too (identity + switch list + Exit preview) so no persona is trapped.
- **A11y:** `#acctBtn` aria-haspopup/aria-expanded/aria-controls; rows `role=menuitemradio` + `aria-checked` inside `role=group`; Escape closes + returns focus; roving arrow-key nav.
- **Mobile:** avatar-only hub pinned right (`.chrome-right{margin-left:auto}` — the center crumb is hidden ≤640px, so it can no longer act as the spacer); menu fits in-viewport (measured L=58…R=378 at 390px). Source-Confirmer switch-row icon swapped check→shield to avoid echoing the current-workspace ✓.

### 6.3 · Branding/visual polish
Emblem+wordmark lockup (padlock/keyhole mark); forest-tinted chrome + darker forest rail (bar floats above rail); wired the type/spacing/radius token scales at the named spots; unified mono-label tracking and restricted mono to wordmark/eyebrows/method chips (crumb demoted to calm sans); `.acct-btn` radius matched to the switch-row idiom (killed the lone pill); lighter floating menu elevation; neutral hovers with lime reserved for action/confirmed only.

### 6.4 · Proposed DS tokens — PENDING CODEX CONFIRMATION (flagged inline `/* proposed — confirm with Codex DS */`)
`--forest-2 #1C2A20` · `--chrome-bg #0C1510` · `--rail-bg #0A120D` · `--gold-soft` · `--gold-line` · `--blue-soft` · `--shadow-1` · `--shadow-2` · `--divider`. All are tints/opacities of colours already in use — no new hue. Codex to confirm/rename against the canonical DS (only 8 tokens confirmed today).

_Firewall: structure/colour/type only — no score/rank/%/gauge introduced; gold/amber stay provenance, lime never encodes magnitude._

## PART 7 · UX/UI REDESIGN BATCH — owner directive 14 Jul (annotated prototype; "document everything, per responsible party, no shortcuts, I don't repeat myself")
_Binding source of truth for the prototype redesign. Every item tracked with an ID, a responsible party, and status. Owner is studying the other entities in parallel; this is the autonomous work order._

### 7.0 · BRAND PALETTE — the answer to "what are the brand colours / where did the orange come from / is a token missing?"
**Confirmed brand palette (Codex DS core — the ONLY canonical colours):**
- `--ink #090D0A` (near-black) · `--forest #17221A` · **`--lime #C8F04D` = the ONE action/brand accent** · `--paper #F3F5EF` · `--mist #DDE3D9` · `--slate #687269`.
- **The brand is: dark/forest canvas + a single lime accent.** There is NO orange in the confirmed brand.
- **The "orange" = `--gold #F2C063` (+ `--amber-stage #D7A84A`).** These are labelled "DS ext" — i.e. Claude/Codex ADDITIONS for method/provenance chips and scan states, **NOT confirmed brand colours.** Owner is right to question them. → **DECISION (owner/Codex): remove the gold/amber and express provenance with lime (confirmed) + neutrals only, OR formally adopt gold into the DS.** Recommendation: REMOVE — keep the palette lime-on-dark; "confirmed vs not-yet" reads as lime vs neutral, no third hue.
- **MISSING FROM DS (gaps — Codex to confirm/author, do NOT invent silently):** the full dark-app semantic scale (`surface/surface2/raise`, `text/muted/faint`), status set (`good/need/na`), `teal`, elevation shadows, `forest-2/chrome-bg/rail-bg`, and the in/out ruling on `gold/amber-stage/source-blue`. Until confirmed these stay flagged `/* proposed — confirm with Codex DS */`.
- **Token architecture (owner ask U10):** the prototype must be self-contained (artifact), so tokens live in ONE `:root` layer that is the single control point for global restyle; component styles reference tokens only (no hardcoded colours). The real app mirrors this in a separate CSS/token file.

### 7.1 · Requests — per responsible party
**CLAUDE CODE (prototype now → app later):**
| ID | Request | Screen | Status |
|---|---|---|---|
| U1 | **Remove the language (EN/HE) switcher from EVERY screen** — "not the place." | onboarding + all | 🔴 |
| U2 | Improve font readability + **contrast**; fix black-on-black text inputs; token the text-field area. | onboarding + global | 🔴 |
| U3 | Onboarding **step 1**: improve design + hierarchy. (Steps 2 & 3 = OK, leave.) | onboarding | 🔴 |
| U4 | **Every screen fits ONE viewport height — NO scroll.** | all | 🔴 |
| U5 | Everything interactive/smart · gamification · **minimum clicks to the final result.** | all | 🔴 |
| U6 | **ONE navigation in desktop** (top bar OR left rail — pick the friendlier). Currently BOTH → the title shows twice (topbar "Radar" + page "CAREER WORKSPACE / Artist Radar"). | shell | 🔴 |
| U7 | **Logo is wrong — always base it on DS assets.** (Not an invented emblem.) | shell | 🔴 |
| U8 | **No technical content on the app — only UX/UI + microcopy.** Remove technical visibility everywhere. | all | 🔴 |
| U13 | Radar is **too long + not clear**; components don't contribute/aren't effective → trim to only what earns its place. | radar | 🔴 |
| U14 | **Remove the scan banner** "We scanned your public footprint. We found 8 things…" — the discovery phase is DONE; it no longer contributes. | radar | 🔴 |
| U15 | Remove **"★ Buyers in your genre look here first · Live · Audience · Kit"** — it's technical, not marketing. (HERO has a subtitle slot that can carry real marketing microcopy instead.) | radar | 🔴 |
| U16 | Radar gamification must drive the **NEXT BEST STEP**, not send the user to "another area" (that repeats content = a failed radar). Model: *Recommended next action → "Add proof of your draw" → "Supports how professionals understand your live demand — not just your online reach" → Continue →*. | radar | 🔴 |
| U17 | Radar must **fit SHOW BUSINESS** at a design level — currently too technical/unfitting → upgrade the craft. | radar | 🔴 |
| U18 | Fix dark-on-dark **container contrast** + the stray orange per DS. | radar + global | 🔴 |
| U19 | Confirmation sheets are **unclear because they lack PERSONAL content** — the artist can't tell what "truth" he's confirming. Add the real personal detail being confirmed. | confirmation | 🔴 |
| U20 | Confirmation **design is poor/technical** — rebuild as professional components (atmosphere, branding, readability, style), not technical text. | confirmation | 🔴 |
| U21 | **Add a line under the Passport** explaining its purpose + why it matters. | passport | 🔴 |
| U22 | **Multiple Passport views (2+ "faces")** — the artist sees his value PER ENTITY (how a manager / booker / production / buyer reads it); add a top line per view explaining what that viewer cares about. | passport | 🔴 |
| U23 | Remove technical badges (**"✓ Buyer view public", "✓ Verified professional profile", "✓ 2 published"**) → design a different, non-technical method (search DS; if absent → gaps). | passport | 🔴 |
| U24 | Passport is **dark-on-dark, not sales-y** → upgrade the whole surface; unified DS. | passport | 🔴 |
| U25 | Passport = the artist's **universe** but reads as a **technical list** → give it human hierarchy, design, and **logos**. | passport | 🔴 |
| U26 | **Account: is a dedicated screen even needed?** There's Account in the top menu AND a screen. Decide: keep with a real spec, or fold its content (it overlaps Radar) and drop the screen. | account | 🔴 |
| U27 | **Multi-genre:** an artist has several musical styles. Onboarding may overlap, but provide a **FILTER** to view his standing in a different musical scene. Clear professional UX/UI. | radar/filter | 🔴 |
| U11 | **Always use the defined canon terms** (glossary) across all copy. | all | 🔴 (standing) |
| U12 | Document all requests; execute with a **professional design team**; don't revisit. | meta | ✅ documented / 🔴 executing |

**CODEX (DS / brand):** U7 supply the correct DS logo asset · U9 confirm brand palette + the gold/amber/source-blue in-or-out ruling · U10 confirm the token layer mirrors DS · U23 provide/confirm a DS pattern for "verified/published/public" that isn't a technical checkmark badge · fill the MISSING-FROM-DS gaps in §7.0.

**OWNER decisions needed:** U6 (which single nav — Claude recommends, owner confirms) · U9 (gold in/out — recommend OUT) · U26 (Account screen keep/fold — recommend FOLD into the top-right hub).

## PART 7 · §7.0 CORRECTION + DS SOURCE-OF-TRUTH FINDING (14 Jul — owner pointed to the repo DS files)
_Owner pointed to docs/design-system/A13-TOKEN-VALUES.md + DS-v1.2.0-DIGEST-AND-ALIGNMENT.md and two Drive files named `GIGPROOF_Design_System.html` / `GIGPROOF_Look_And_Feel_Kit.html`. Findings:_

**1. CORRECTION — the "orange" IS a DS token (I was wrong earlier).** A13-TOKEN-VALUES.md (Codex handoff, in-repo) defines it: **`state.found #F2C063` (gold) = "found/source-backed, NOT confirmed" · rule "small accents only"**; `state.needsReview #E39A4B` (amber) = "needs review — invitation to improve, never shame"; `state.confirmed #CBEE72`; `state.developing #46DCC2` (teal); `state.notAssessable #9AA29B`. So the gold/amber were NOT invented — they are official DS Radar STATE colours. My earlier "non-DS addition, remove it" was based on the prototype's incomplete comment, not A13. **The real defect is OVER-USE** (gold on scan banner + method chips + found dots at once) vs the DS rule "small accents only." Decision belongs to owner/Codex: keep `state.found` as a small found-accent, or override to lime+neutral (which would need a Codex DS change since it contradicts A13).

**2. These repo DS files are NOT the latest.** They are the **v1.2.0 base (10 Jul)**. Current DS authority per SESSION-MEMORY + repo refs = **Codex Drive DS v1.6.20** (progression v1.4.2 → v1.5.8 → v1.6.6/6.9/6.11 → v1.6.20). v1.6.20 lives ONLY on Drive (`00_CURRENT/LOCKSHOW_Design_System_CURRENT.html`) — NOT in this repo. So we cannot build fully DS-faithful without it.

**3. The GIGPROOF-named Drive files are STALE.** `GIGPROOF_Design_System.html` + `GIGPROOF_Look_And_Feel_Kit.html` use the pre-8-Jul name (GIGPROOF → LOCK). The archive even holds `GIGPROOF-DESIGN-SYSTEM-v1.2.0-BASE.html`. The current file should be `LOCKSHOW_Design_System_CURRENT.html` (v1.6.20). → Owner/Codex: those GIGPROOF files are old; use the CURRENT LOCK v1.6.20 file.

**4. MISSING COMPONENTS in the repo DS copy.** A13 = colour/state tokens + AA contrast pairs + method labels. DIGEST = type/radius/spacing rules + the 8-step onboarding spine + per-entity home patterns + it references **"34 component state rows across buttons/fields/chips/cards."** But the actual **component library (the 34-state visual specs), the LOGO asset, and everything v1.3→v1.6.20 added are NOT in the repo** — they're in the Drive HTML. So U7 (logo) + the component patterns can't be pulled from repo; need the Drive v1.6.20 file imported.

**5. BIG DS FINDING — THEME INVERSION (validates the owner's "dark-on-dark isn't sales-y").** The DIGEST headline: the DS is a **LIGHT, paper-grounded system that SANCTIONS dark "media/editorial" surfaces** — i.e. cinematic dark Radar/Passport is *inside* the system, but **everyday UI should be PAPER (light)**, dark reserved for Passport/Radar/media. The DIGEST names "theme inversion" as the **#1 app-alignment gap**: our app/prototype is ALL dark and remaps DS light names onto dark. → This is exactly why Passport reads "dark-on-dark, not marketable" (U24). **DECISION (owner — visual direction is owner's call): re-ground everyday UI (shell, onboarding, confirmation, account) to PAPER, keep dark only for the Passport hero + Radar universe (DS-sanctioned media surfaces)?** Recommend YES — it resolves U24 at the root and finally matches the site.

**Impact on the running P-16 implementer:** its structural work (one-nav, one-viewport, personal confirmation, multi-view Passport, de-technical, token LAYER) is theme-agnostic and stands. Only the GROUND (dark→paper) and the gold ruling are token-level flips to apply AFTER the owner decides (2) and (5). Awaiting owner ruling before flipping the ground.
