# ENTITY-ARCHITECTURE · INTER-ENTITY NAVIGATION · UX/UI AUDIT
_Auditor: LOCK Entity-Architecture + UX/UI Navigation. Branch `claude/b4-gigproof-discovery-e7749o`. Date 2026-07-14._
_Reference model: GPT 6-family / 3-layer (Artist·Representation·Buyer·Production·Contributor-Confirmer·Platform). Cross-refs: `docs/ENTITY-MODEL-GAP-AUDIT-2026.07.14.md` (E1–E8), `docs/ENTITY-GLOSSARY.md` (DS v1.5.8)._
_Everything below is grounded in real files (path:line). Docs-only audit — no source touched._

---

## 0 · METHOD + WHAT WAS READ
Router `src/App.jsx` (all `<Route>`s + the 4 gate components) · nav contract `src/lib/navigation.js` · workspace context `src/context/OrgContext.jsx` · switcher `src/features/org/ContextSwitcher.jsx` · nav shells `src/components/layout/{AppShell,SideNav,BottomNav,navItems}.jsx` · every screen in `src/features/*`. The radar node model that drives artist editing lives in `src/lib/radarUniverse.js`.

**Headline:** the *routing skeleton* is genuinely good — one nav-contract source of truth (`navigation.js`), contract-tested, org-derived effective role, no infinite loops. The defects are (a) **one missing screen class** (artist profile *edit*), (b) **one broken cross-entity path** (non-artist/agency base role → newly created workspace), and (c) **one mis-modeled entity** (Source Confirmer built as a logged-in workspace, against the glossary). These match the owner's report: "ניווט בין ישויות" friction + an incomplete artist-edit screen.

---

## 1 · SCREEN INVENTORY (every route → entity → purpose → status)

### Public / no-shell (outside AppShell — `App.jsx:128-141`)
| Route | Entity family | Screen | Purpose | Key actions | Status |
|---|---|---|---|---|---|
| `/login` | Platform | `auth/Login` | Email sign-in (+ demo persona chooser in DEMO) | sign in | ✅ complete |
| `/signup` | Platform | `auth/Signup` | Create account | sign up | ✅ |
| `/forgot-password` | Platform | `auth/ForgotPassword` | Request reset | send link | ✅ |
| `/reset-password` | Platform | `auth/ResetPassword` | Set new password | save | ✅ |
| `/select` | Platform→role | `auth/UserTypeSelect` | "What would you like to do first?" → artist/agency/booker (`UserTypeSelect.jsx:38-51`) | pick role → `selectRoute()` | ✅ |
| `/passport/:id` | **Buyer** (public) | `passport/Passport` | The product: recipient-safe public Passport, persona toggle booking/rep (`Passport.jsx:30,134`) | request availability, switch view | ✅ |
| `/passport/:id/request` | Buyer | `passport/AvailabilityRequest` | Buyer asks availability | submit request | ✅ |
| `/passport/:id/sent` | Buyer | `passport/RequestConfirmation` | Post-request receipt | — | ✅ |
| `/confirm/:token` | **Contributor-Confirmer** | `producer/ProducerConfirm` | Accountless one-claim magic-link confirm | Yes/Partly/No/Not-me | ✅ complete (the real confirmer flow) |
| `/invite/:token` | Platform/Representation | `org/AcceptInvite` | Accept org membership | accept | ✅ |

### Authenticated / inside AppShell (`App.jsx:144-198`)
| Route | Entity | Screen | Purpose | Key actions | Status |
|---|---|---|---|---|---|
| `/` | — | `RoleHome` (redirector) | Sends to effective-role home (`homePathFor`) | redirect | ✅ |
| `/settings` | Platform (universal) | `auth/Settings` | Account + artist personal opt-ins | edit prefs | ✅ |
| `/org/settings` | Representation/Prod | `org/OrgSettings` | Workspace profile | edit | ✅ |
| `/org/members` | Representation/Prod | `org/Members` | Seats + invites | invite/role | ✅ |
| `/org/upgrade` | Representation | `org/UpgradePlan` | Request plan upgrade | request | ✅ |
| `/org/billing` | Representation | `org/Billing` | Billing summary | — | ✅ (light) |
| `/onboarding` | **Artist** | `artist/Onboarding` | First-run: stage_name + city + one link ONLY (`Onboarding.jsx:75,104-113`) | save → radar | ✅ (but see D1) |
| `/artist/home` | Artist | `artist/ArtistDashboard`→`RadarUniverse` | The Radar: evidence collection + inline field fills | fill/confirm/switch Act | ✅ core, ⚠️ edit gap (D1) |
| `/artist/readiness` | Artist | `artist/ArtistReadiness` | Readiness detail | — | ⚠️ **orphaned from nav** (D6) |
| `/artist/claims` | Artist | `artist/ClaimReview` | Claim review panel | approve claims | ⚠️ panel/deep-link only (D6) |
| `/artist/passport` | Artist | `artist/PassportSelf` | Redirect to own `/passport/:id` (`PassportSelf.jsx:28-29`) | redirect | ✅ |
| `/artist/requests` | Artist | `artist/ArtistRequests` | Incoming availability requests | reply/close | ✅ |
| `/artist/offer` | Artist | `artist/OfferPayment` | Founding-Passport manual pay (Bit) | mark paid | ✅ |
| `/evidence/:artistId` | Artist | `evidence/EvidenceCapture` | Add evidence → AI claim pipeline | upload/submit | ✅ |
| `/agency` | **Representation** | `agency/AgencyDashboard` | Roster + ArtistAccess grants | request/revoke access | ✅ |
| `/agency/requests` | Representation | `agency/AgencyRequestsInbox` | Requests inbox | status | ✅ |
| `/agency/radar` | Representation | `agency/RadarFeed` | Firewall-safe demand signals | open signal | ✅ |
| `/production`,`/production/events`,`/production/requests` | **Production** | `production/ProductionDashboard` (one comp, 3 tabs via `useLocation`, `ProductionDashboard.jsx:33-37,214-235`) | Team · Events · Requests | view roster/events | ✅ read; ⚠️ requests honest-gap on migration 032 (`:163-179`) |
| `/admin` | Platform (Operator) | `admin/AdminDashboard` | Ops console | publish/activate/export | ✅ |
| `/discover` | **Buyer** (booker) | `booker/BookerHome` | Resolve a Passport link | open link | ✅ but scope-limited (D9) |
| `/producer` | Contributor-Confirmer | `producer/ProducerHome` | "Producer workspace" landing | link to received | ⚠️ **orphan route + mis-modeled** (D3,D4,D7) |
| `/producer/received` | Contributor-Confirmer | `producer/ProducerReceivedPassports` | "Passports shared with you" | resolve link | ⚠️ **functional stub** — no data fetch (D5) |
| `*` | — | → `/` | Catch-all | redirect | ✅ |

**Screen count per entity (distinct screen components):**
Artist **9** (Onboarding, Dashboard/Radar, Readiness, ClaimReview, PassportSelf, Requests, OfferPayment, EvidenceCapture, + shared Passport) · Representation/Agency **3** (+ shared org 5) · Buyer **1 private** (BookerHome) + **3 public** passport screens · Production **1** (3 tabs) · Contributor-Confirmer **3** (Confirm real; Home + Received weak) · Platform/Operator **1** admin + **~9** auth/org shared.

---

## 2 · INTER-ENTITY NAVIGATION AUDIT (severity-ordered)

**How a Person moves between workspaces:** `ContextSwitcher` (top-right, every breakpoint — `AppShell.jsx:34-39`) → `switchOrg(orgId)` persists locally + `nav('/')` → `RoleHome` re-routes via `homePathFor()` (`OrgContext.jsx:65-71`, `navigation.js:36-48`). The nav shells (`SideNav.jsx:10`, `BottomNav.jsx:9`) read `useOrg().role` — the **org-derived effective role** — so a switch genuinely swaps the whole tab set. This part is correct and is the model's strongest point.

### 🔴 D2 (HIGH) — Non-artist/agency base role cannot reach a workspace it just created (dead-end)
`OrgContext.ORG_DERIVED_ROLES = [ARTIST, AGENCY]` only (`OrgContext.jsx:28`); the effective role is recomputed from the active workspace **only** for those two base roles (`OrgContext.jsx:86-88`). But `ContextSwitcher` offers creation of `artist / agency / production` to **everyone** (`ContextSwitcher.jsx:25,143-151`). So a **booker** (or producer/operator) who taps "+ New workspace → artist":
1. `createWorkspace` runs, `switchOrg` sets it active and navigates to `/`;
2. `RoleHome` reads `role` which is still `'booker'` (booker ∉ ORG_DERIVED_ROLES) → sends them back to `/discover`;
3. every `RequireRole role={ARTIST}` gate (`App.jsx:158-174`) bounces them off the new workspace's screens.
**Result: the created workspace is unreachable — a silent dead-end with no error and no back-path.** Fix: either recompute effective role for all base roles that hold a matching membership, or restrict `NEW_WORKSPACE_TYPES` by base role.

### 🔴 D3 (HIGH) — Source Confirmer modeled as a logged-in workspace (violates the glossary)
`ENTITY-GLOSSARY.md:55,83` is explicit: Source Confirmer = accountless magic-link task, "**NO signup, NO dashboard, NO workspace shell — never build as a workspace.**" Yet `ProducerHome.jsx:19` renders the literal string **"Producer workspace"**, and `/producer` + `/producer/received` live **inside AppShell** with their own nav tabs (`navItems.jsx:33-36`). This is the exact entity-mixing the owner flagged ("ערבוב בין ישויות"): the ROLES.PRODUCER magic-link confirmer is dressed up as a persistent workspace, colliding with the Production **company** workspace (`workspace_type='producer'`, glossary §1). Fix: retire `/producer`+`/producer/received` as a workspace shell; the confirmer's only surface should be `/confirm/:token`.

### 🟠 D4 (MEDIUM) — `/producer` is an orphan route
`homePathFor(PRODUCER) → producerReceived` (`navigation.js:44`) and the producer tab set is `received + account` only (`navItems.jsx:33-36`). Nothing ever lands a user on `/producer` (`ProducerHome`) and it is in no nav — a dead route reachable only by manual URL. (Compounds D3.)

### 🟠 D6 (MEDIUM) — Artist Readiness & ClaimReview orphaned from nav, with an inconsistent back-path
Nav was intentionally trimmed to Radar·Passport·Requests·Account (`navItems.jsx:12-17`); `/artist/readiness` and `/artist/claims` are "deep-link only" (`App.jsx:160-166`). But `ArtistDashboard.jsx:312-315` still renders a `quickLinks` chip to `/artist/readiness` — a half-surviving back-path. Either fully absorb Readiness into the radar surface (as the comments claim) or keep it in nav; today it is neither.

### 🟢 D-ok — Wrong-role bounces are handled cleanly
`RequireRole` sends a wrong-role user to `/` (`App.jsx:62-71`), which `RoleHome` re-routes to their *own* home — no dead-end, no loop. `RequireAgency`/`RequireProduction` correctly distinguish a production workspace (`workspace_type='producer'`) from a roster agency (`navigation.js:75-90`), so a production org never falls through to the roster screen. This is solid.

---

## 3 · SCREEN-DEFINITION / PURPOSE GAPS (per entity)

### Artist — the owner's artist-edit finding (D1) 🔴 HIGH
There is **no artist profile edit screen**. Two concrete holes:
- **Core identity is set-once and never editable.** `stage_name` and `city` are written only in `Onboarding.jsx:104-113` (`upsertArtist`). After onboarding there is no field, no route, no form to change them. `Settings.jsx` edits WhatsApp + opt-ins, not artist identity.
- **The radar "fill" system is ADD-ONLY, not edit.** Every editable attribute (photo, positioning/`one_line`, genre, set_length, regions, rider, bands, community…) is a radar node. `radarUniverse.js:156-166` renders a field that is already set as `NODE.CONFIRMED` with sub `S.inPlace` and **no form**; only a *missing* field gets a `MissingFill` form (`RadarUniverse.jsx:713-722, 733-889`). So once a value exists the artist **cannot correct a typo or change a photo/genre/positioning** anywhere in the app. This is almost certainly the "incomplete artist-edit screen" reported.
**Fix (P0):** an Identity/Act edit panel — the `identity` planet tap already exists (`RadarUniverse.jsx:382,400 → setSelected('identity')`); give confirmed nodes an "edit" affordance that re-opens the fill form pre-filled, and add stage_name/city to the identity field set (`radarUniverse.js:156`).
- **Act management is thin:** create/switch only, via a BottomSheet inside the radar (`RadarUniverse.jsx:591-622`); no rename/delete/per-Act passport overview. (E1/multi-Act depth.)

### Representation / Agency — ~complete for pilot
Roster, ArtistAccess request/revoke (`AgencyDashboard.jsx:33-108`), radar feed, requests inbox all read real data. Gaps are the **structural E-gaps**, not screens: **E4** (multi-role stacking — manager+booking-agent — has no UI: `docs/ENTITY-MODEL-GAP-AUDIT:17`) and **E6** (individual→team→company *upgrade* moment — `ContextSwitcher` only offers *create-new*, never an upgrade of the current workspace: `ContextSwitcher.jsx:69-90`, matches E6 "workspace exists, upgrade moment doesn't").

### Buyer / Booker — correct scope but single-register (D9) 🟢/🟡
`BookerHome` is a link-resolver + explainer with one primary action (`BookerHome.jsx:16-51`) — open discovery is deferred by design (correct pre-Gate). Gap vs **glossary DS v1.5.8 §2b**: the demand side is segmented (professional buyer / private client / corporate / planner) but the UI has one generic booker surface and one register; the private/non-industry warm register ("מזמינים אמן להופעה?") has no path. Not a launch blocker (private buyers need no workspace, glossary §2c) but a copy/IA gap. **E5** (buyer team unmodeled) is correctly out of scope.

### Production — read-only, honest gaps
Team + Events render real org data (`ProductionDashboard.jsx:57-158`); Requests degrades to an honest "not wired yet" if migration 032 is absent (`:163-179`, `orgs.js:444`). Missing for a complete flow: **no event/lineup creation UI** (the workspace can view events but not create/edit them here) and no slot-booking action.

### Source Confirmer — one real screen, two weak ones
`ProducerConfirm` (the magic-link task) is complete and correct. `ProducerHome` + `ProducerReceivedPassports` should not exist as a workspace (D3); additionally **D5**: `ProducerReceivedPassports` has **no received-passports data fetch** — its own header admits "There is no received-passports fetch in the data layer yet" — it is a link-resolver stub that promises content that never arrives. **D7:** `ProducerHome.jsx:11-56` is **hardcoded English**, bypassing i18n entirely — breaks Hebrew and the glossary's terminology governance.

### Operator / Admin — complete
`AdminDashboard` covers publish, entitlement activation, consents, export, delete, audit, upgrade approval (`AdminDashboard.jsx:3-9`). Firewall-respecting. No notable screen gap.

---

## 4 · UX/UI ISSUES (high-level, per entity)

- **One-primary-action:** Booker ✅, Onboarding ✅, Offer ✅. Artist Radar deliberately dense (evidence surface) but funnels to one "next action" card (`ArtistDashboard.jsx:339-348`) — good. Admin is intentionally dense (operator).
- **Minimum-clicks (≤3 for core actions):** Buyer open-passport = 1 ✅. Artist add-a-field = tap planet → expand → fill ≈ 3 ✅. Artist **edit** an existing field = **impossible** ❌ (D1). Booker→own-workspace after mistaken create = **∞ / dead-end** ❌ (D2).
- **Empty / loading / error states:** strong and consistent — `Loading`/`ErrorState`/`EmptyState`/honest-gap states everywhere (`ProductionDashboard` null-vs-empty-vs-gap tri-state `:163-188`; `ProducerReceived` honest note; `BookerHome` sample-passport escape hatch `:52-59`). This is a clear strength.
- **Mobile:** BottomNav + safe-area inset (`BottomNav.jsx:37`), 44px tap targets (`RadarUniverse` chips `min-h-[44px]`), radar has separate mobile/desktop next-action cards (`ArtistDashboard.jsx:342`, `RadarUniverse.jsx:497-509`). Good.
- **Consistency defect:** `ProducerHome` hardcoded English (D7) is the one screen off the i18n system — visible inconsistency and a governance breach.
- **RTL:** shell uses logical props (`ps-`/`border-e`, `AppShell.jsx:27,34`) — RTL-ready structurally, not yet flipped.

---

## 5 · PER-ENTITY COMPLETENESS (estimate + basis)
| Entity | % | Basis |
|---|---|---|
| Artist | **80%** | All 9 screens exist and read real data; −20 for the missing edit surface (D1, set-once identity + add-only fills) and thin Act management. |
| Representation / Agency | **80%** | Roster/access/radar/requests all real; −20 for E4 (multi-role UI) + E6 (upgrade flow) — structural, post-Gate. |
| Buyer / Booker | **70%** (pilot-scoped) | Public passport 100%; private BookerHome 100% for its scope; −30 for single-register vs DS v1.5.8 segmentation (D9). Open discovery correctly deferred. |
| Production | **65%** | Team/Events real, Requests honest-gap; −35 for no event/lineup **creation** and 032 dependency. |
| Contributor-Confirmer | **60%** | `ProducerConfirm` (the actual value) is 100%; the two logged-in screens are mis-modeled (D3), orphaned (D4), stubbed (D5), un-i18n'd (D7) → drag the family down. |
| Operator / Platform | **90%** | Admin + auth/org shared screens complete; −10 for light Billing. |

---

## 6 · PRIORITIZED FIX LIST

### P0 — before/at launch
- **D1 · Artist edit surface.** Add an Identity/Act edit panel: (a) let confirmed radar nodes re-open their `MissingFill` form pre-filled (`radarUniverse.js:164-166` + `RadarUniverse.jsx:733`); (b) add `stage_name` + `city` to the identity field set so post-onboarding identity is editable. _This is the owner's reported broken screen._
- **D2 · Cross-entity dead-end.** Stop non-artist/agency base roles from creating unreachable workspaces: either add them to `ORG_DERIVED_ROLES` / recompute effective role from any matching membership (`OrgContext.jsx:28,86-88`), or gate `NEW_WORKSPACE_TYPES` by base role (`ContextSwitcher.jsx:25`).
- **D3 · Source-Confirmer un-workspace.** Remove `/producer` + `/producer/received` from AppShell/nav; the confirmer lives only at `/confirm/:token`. Aligns code with `ENTITY-GLOSSARY.md:55,83`.

### P1 — fast follow
- **D4** retire the orphan `/producer` route (folds into D3).
- **D5** either wire a real received-passports fetch or drop the screen (`ProducerReceivedPassports`).
- **D6** resolve Readiness/ClaimReview nav status — fully absorb into radar or restore to nav; fix the dangling `quickLinks` (`ArtistDashboard.jsx:312-315`).
- **D7** move `ProducerHome` strings into i18n (or delete with D3).
- **E4/E6** (agency): "roles in this workspace" panel + "add teammate = upgrade" trigger — flagged in the E-gap audit as the two high-signal early app-backlog items.

### P2 — post-Gate
- **D8** Act-management screen (list/rename/delete/per-Act passport) — E1/E2 depth.
- **D9** Buyer register segmentation UI (DS v1.5.8 §2b private/corporate/planner copy paths).
- Production event/lineup **creation** UI; RTL flip; per-Act authority on grants (E2 jsonb).

---

## 7 · CROSS-REFERENCE TO E1–E8 (GPT model)
- **E1** role taxonomy coarse → surfaces as the Source-Confirmer/Production naming collision (D3) and no multi-role UI.
- **E2** no Act/territory on grants → agency roster is per-artist not per-Act; no per-Act passport routing (D8).
- **E3** entity-form (person/team/company) implicit → tied to E6 upgrade gap.
- **E4** multi-role invisible → **no UI at all** (P1).
- **E5** buyer team unmodeled → correctly out of scope; D9 is the copy-register slice, not the team slice.
- **E6** rep upgrade path → `ContextSwitcher` is create-new only, never upgrade (P1).
- **E7** contributors/specialists → correctly absent (by design).
- **E8** site copy → out of app scope (marketing waves).
**Verdict, echoing the E-gap audit:** the architecture is the right org-first shape; the launch-blocking work is UX completeness (D1–D3), not schema.

_File: `docs/architecture/ENTITY-NAV-UX-AUDIT.md`_
