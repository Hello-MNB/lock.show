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
