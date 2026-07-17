# GAPS TO DEPLOY — rel-2026.07.13 (owner-readable; what is NOT done yet)
Owner order 13 Jul: finish these, then deploy. Each row = one gap, its DOD, its owner.
Everything else in the locked scope is BUILT and gate-green.

## GAP LIFECYCLE REGISTER (V1 — machine-readable states; SUPERSEDES the per-row Status column below)
States: OPEN → BUILDING → CODE-COMPLETE → VERIFICATION-PENDING → VERIFIED → OWNER-ACCEPTED.
Truth as of 13 Jul 2026 (branch `claude/b4-gigproof-discovery-e7749o`):

| Gap | State | Closure SHA / evidence |
|---|---|---|
| G1 | CODE-COMPLETE | 92e4abd |
| G2 | CODE-COMPLETE | RC1 wave (THIS COMMIT = RC1 FREEZE): additive ring/scale/label on genre-primary planets, guarded hasGenreSignal API, non-primary full-opacity, EN+HE, data-genre-primary test hook. Codex design review pending |
| G3 | CODE-COMPLETE | 7bc1bc6 — migration 035 APPLIED ✓ (Cowork-verified, SYNC §28); former live-block cleared |
| G4 | CODE-COMPLETE | RC1 wave: rosterNextAction.js 6-rung ladder from real state (requests/published/evidence-age-90d/kind), every destination artist-bound, scope-aware, RLS-unknown→view floor |
| G5 | VERIFICATION-PENDING | 00b75e6 built; GPT 14 Jul: arrow-inventory/footer/type-floor evidence not repeatable — proof rides preview QA |
| G6 | VERIFICATION-PENDING | 1c92208 built; GPT 14 Jul: purity lint can't catch EN-under-HE mixed values — rendered HE crawl + Codex native review required |
| G7 | CODE-COMPLETE | 7bc1bc6 |
| G8 | CODE-COMPLETE | 7bc1bc6 |
| G9 | OPEN | QA-stage (rides with the train; embed parity proof) |
| G10 | OPEN | QA-stage (attaches to the candidate SHA at PREVIEW-READY) |
| G11 | CODE-COMPLETE | chain 395d8ba→fbb3cec→RC1: scripts/test-security-denial.mjs (8 cases/25 assertions vs real server + mock Supabase) wired into verify. Cowork runtime denial re-proof on preview pending |
| G12 | CODE-COMPLETE | chain 395d8ba→fbb3cec→RC1: extraction_method='client_stub' stored truthfully (column unconstrained — verified, no migration); stub only on VITE_NO_API/embed-base/network-unreachable; non-JSON→retryable server_refused |
| G13 | BUILDING | — |
| G14 | BUILDING | — |
| G15 | BUILDING | — |
| G16 | OPEN | — |
| G17 | OWNER-ACCEPTED | free-pilot ruling (DOD §3 corrected; CFRO confirmed) |
| G18 | OPEN | — |
| G19 | OPEN | — |
| G20 | OPEN | split into G20a–G20d (see Wave-2 table) |
| G21 | OPEN | — |
| G22 | OPEN | — |

| # | Gap (critical screen/item) | What "done" means (DOD) | Owner | Status |
|---|---|---|---|---|
| G1 | **Radar milestone path (M1–M8)** — the artist sees WHERE he is on the journey | Path renders on artist home per Codex v1.6.13 (✓ done / ● current / ○ next; never %/level); mobile 360px + desktop; EN+HE | Claude | 🟠 building now |
| G2 | **Genre-emphasis planet treatment** — which planets matter most in his genre | Primary planets visually emphasized (guidance, never dimming/shaming); genre note integrated | Claude | 🟠 with G1 |
| G3 | **A2/N12 Add-workspace screen** — real workspace creation | Artist/agency/production workspace creatable from workspace switcher; role assignment correct | Claude | 🔴 next |
| G4 | **A5 Manager roster next-best-action** — one commercial action per artist | Roster card shows ONE next action per artist (request video / reply / refresh proof), from real state | Claude | 🔴 next |
| G5 | **S2 arrows · S3 footer · S4 waitlist type floor** — site polish contract | Per locked scope rows, DS-conformant | Claude | 🔴 next |
| G6 | **Localization P0 extraction (🚩 flag closure condition)** — no English under Hebrew on P0 routes | Confirmer ceremony, Booker home, Passport errors, availability request, artist requests, agency+admin fragments → real EN+HE keys; lint green | Claude | 🔴 next |
| G7 | **Share-link events wiring** (share_link_created/opened) | Events fire on real share actions; persist to DB (names already in CANON) | Claude | 🔴 next |
| G8 | **N10 entitlement visibility** — what plan a workspace is on (display only, no charging) | Visible in org settings; free pilot stated | Claude | 🔴 next |
| G9 | **Embed rebuild** (site /app parity) | Embed hash matches app build; parity proven | Claude + Cowork | 🔴 with train |
| G10 | **QA applicability matrix** (GPT req.) | Release-specific must-pass vs N/A vs not-instrumented table, attached to the candidate SHA | Claude | 🔴 with PREVIEW-READY |
Post-deploy (unchanged): admin Business cockpit (P0.5) → Growth-Loop screens + spec imports (P1).

## WAVE 2 — GPT launch-readiness audit (13 Jul) + Cowork QA-lens additions: ADOPTED with rulings
All claims CODE-VERIFIED by Claude (server/index.js:43 cors() unrestricted; :87 extraction_method
by key presence; service-role without per-object auth — real). Dispositions:
| # | Gap | Ruling | Priority |
|---|---|---|---|
| G11 | API auth: JWT validation + per-object ownership + CORS allowlist + error sanitization + denial tests | ADOPTED — launch blocker | P0 |
| G12 | Truthful AI provenance: extraction_method = ACTUAL path (anthropic / deterministic_fallback / client_stub / failed); failure → visible retry state, never mock-as-live | ADOPTED — firewall-class | P0 |
| G13 | Multi-Act isolation proof: the 6-step Act-A/Act-B test through evidence/claims/passport paths | ADOPTED — launch contract | P0 |
| G14 | Abuse controls: rate limits + schema/length caps + idempotency on public routes; AI-spend caps (max items/job, per-user daily, dedup by hash) | ADOPTED | P0 (AI+service routes) |
| G15 | Confirmer token lifecycle: hashed storage + expiry + replay rules + expired-link test | ADOPTED | P0 |
| G16 | Preview/prod data isolation: QA writes tagged+removable; test analytics excluded from Gate; environment recorded with SHA | ADOPTED — precondition to write-heavy QA | P0 |
| G17 | Payment posture RULING (Claude, per canon): **FREE PILOT** — no payment CTA, no Bit acceptance at launch, N10 display-only, payments admin dormant; Bit+Green Invoice activate post-Gate by owner word | RULED — DOD §3 corrected accordingly | P0 decision ✅ closed |
| G18 | Account recovery: password reset + signup email tested on real path; request-notification pilot workaround = documented Admin monitoring SLA | ADOPTED | P0 recovery / P1 alerts |
| G19 | Backup/restore + incident basics: pre-launch DB export, restore procedure, failed-processing visible, owner severity contact | ADOPTED | P0 basics / P1 monitoring |
| G20a | Legal/privacy (terms, privacy, accessibility statement — Maria+counsel) | ADOPTED — pass: counsel signs off the published legal pages with all placeholders (entity/ח.פ., city, coordinator) filled | P0 |
| G20b | Accessibility (Codex+Cowork) | ADOPTED — pass: keyboard-only + screen-reader path completes the P0 flows (signup → Passport → request) with no trap | P0/P1 |
| G20c | Browser/device matrix (Cowork) | ADOPTED — pass: P0 flows pass on iOS Safari + Android Chrome (real devices) at 360px | P0 |
| G20d | Performance budgets (Claude+Codex) | ADOPTED — pass: defined per-route budgets exist and the P0 routes meet them on the preview SHA (mobile) | P1 |
| G21 | Rollback REHEARSAL as its own must-pass row (Cowork addition, post-404 lesson) | ADOPTED | P0 |
| G22 | QA probes: manager access-request handshake UI + production outbound-booking path (exist in code/doc — prove on preview) | ADOPTED as QA rows | P0 QA |
Cost contract additions (GPT): monthly AI hard budget + alert threshold + retry cap counted (≤4
calls/item today) + manual-labor line — folded into LAUNCH-DOD §4 at next edit; CFRO defines the
budget numbers with Maria.

### Wave-2 ownership (GPT reconciliation — one owner + one verifier each)
G11 Claude→Cowork · G12 Claude→Cowork+GPT · G13 Claude→Cowork · G14 Claude→Cowork ·
G15 Claude→Cowork · G16 Claude+Cowork→GPT · G17 ✅ CLOSED (DOD §3 corrected this commit; CFRO confirmed) ·
G18 Claude→Cowork · G19 Cowork→Claude · G20 SPLIT: legal=Maria+counsel / accessibility=Codex+Cowork /
browsers=Cowork / perf=Claude+Codex · G21 Cowork→Claude · G22 Cowork→Claude.
GOVERNING RULE (GPT, adopted): no preview URL is distributed for WRITE-path testing until
G11 + G12 + G16 are closed. G16 also guarantees QA-data exclusion from pilot-signal counts (Cowork).
AI budget (CFRO v2.8, pending Maria's approval): $50/mo HARD cap · $25 alert · ~15 items/user/day ·
retry ≤4 · dedup-by-hash — Claude enforces in code under G14 once approved.

### Testability tightening (Cowork QA-chain audit, adopted)
G2 pass condition: non-primary planets stay FULL-OPACITY and fully interactive (emphasis = additive
highlight only). G3 adds: workspace switch must NOT silently transfer evidence/billing/ArtistAccess.
G5 concrete criteria: one arrow style sitewide · footer groups per DS v1.6.12 · waitlist form text
>= 16px mobile. Manager access-request handshake = already covered by G22 probe (exists in code:
agency card -> artist Settings approval).
### GOVERNANCE WAVE 3 (GPT version-management audit V1-V18, ADOPTED as pre-PREVIEW-READY doc gates)
Owner: Claude Code. One batch, rides before PREVIEW-READY: V1 gap lifecycle states + closure SHAs ·
V2 scope-to-gap traceability matrix · V3 scope contract RELEASE-SAFETY-LAYER section (G11-G22 bind) ·
V4 G20 split a-d · V5 scope item-count fix · V6 N10/A8 free-pilot wording · V7 migration-dependency
refresh · V8 QA two-stage wording · V9 Q8=Maria only (LAUNCH-DOD fixed this commit) · V10-V11
release-process/branching rewrite to full-train law · V12 VERSIONS refresh · V13 task-board
supersede · V14 SESSION-MEMORY first-read cleanup · V15 flows false-claim fix (DONE this commit) ·
V16 artifact metadata (v4 stamped this commit) · V17 Version Map body refresh · V18 tag wording.
CFRO v3.0 budget: delivered with web-verified prices; key flags adopted — Vercel Hobby is
NON-COMMERCIAL (Pro $20 = ToS requirement at first revenue) · Supabase Pro $25 before structural
migrations (backups). Claude spot-verified headline prices; full binding at Maria's budget approval.

---

# PRODUCT-WIDE SPEC-CONFORMANCE AUDIT (15 Jul 2026) — all screens + processes vs the complete spec

Owner directive: *"all screens and processes — audit, fix, report; list processes, map gaps, accomplish spec."*
Method: 5 independent domain auditors read the REAL `src/` code against `docs/LOCK-PRODUCT-SPECIFICATION.md`
(the assembled complete spec), each returning a gap map with `file:line` evidence. This section = the
consolidated map + the running fix report. STATE ∈ **BUILT** (matches spec) · **PARTIAL** (exists, diverges)
· **TARGET** (spec'd, honestly not built) · **MISSING** (no code). Priority P0 (blocks core loop / firewall)
· P1 (strong launch) · P2 (polish).

## Headline
The app is **substantially built** — most screens exist and are firewall-clean. The evidence firewall is
physically enforced (server allowlist + column grants + `buildSafePayload` + `internal_confidence` never
leaves the DB). The gaps cluster in: (a) a few firewall/correctness defects (now FIXED), (b) two artist
screens that are thin (Act-editor, Passport multi-view), (c) the platform's outer processes (email transport,
GA4 dual-emit, Hebrew wiring, governed taxonomy), and (d) two owner decisions (retire `/producer`; Resend).

## MASTER P0 TRACKER (10 P0s — 6 CLOSED this session)
| P0 | Domain | What | State |
|---|---|---|---|
| B3 | Buyer | Narrated firewall strip on public Passport footer (U33/§2.2 violation) | ✅ FIXED (b9514d1) |
| A6 | Auth | Consent write used pre-021 scope names the live CHECK rejects → onboarding consent silently failed | ✅ FIXED (b9514d1) |
| U10 | Auth | No real 404 — catch-all silently redirected, hiding broken links | ✅ FIXED (b9514d1) — warm NotFound |
| SW1/SW2 | Workspaces | Base booker/producer switching into agency/production workspace was dead-ended (role not re-derived) | ✅ FIXED (b9514d1) |
| S1 | Platform | Zero HTTP security headers (no CSP/HSTS); JWT in localStorage unmitigated | ✅ FIXED (b9514d1) — vercel.json headers |
| P7/D1 | Artist | Act-Identity Editor — the owner's reported broken screen | ✅ FIXED (6e969c5) — /artist/act/edit, inline-edit per field, visually verified |
| S6 | Artist | Passport self-view is a bare redirect — no multi-view / edit-vs-buyer-preview / publish widget (§8.4, Codex P0) | 🔴 OPEN — wave-2 build |
| S11 | Artist | No `/artist/access` and no `/artist/act/edit` routes; Account tab points to generic `/settings` | 🔴 OPEN — wave-2 (pairs with P7) |
| N2/N3 | Platform | Gate-critical availability-request → artist EMAIL does not exist; no email transport at all | 🟠 OWNER-BLOCKED — needs a Resend account + `RESEND_API_KEY` |
| D3 | Workspaces | Retire the `/producer` workspace shell (confirmer must live only at `/confirm/:token`) | 🟡 OWNER-DECISION — retire vs reclassify as Production |

## GAP MAP — by domain (actionable rows; BUILT-and-conformant screens summarized as counts)

### 1 · Artist journey — 3 BUILT / 8 PARTIAL / 1 TARGET / 2 MISSING
| id | screen/process | spec | STATE | gap | fix | pri |
|---|---|---|---|---|---|---|
| P7 | Act-Identity Editor (D1) | §8.6/§17.A.10 | MISSING | no edit surface for identity; confirmed Radar nodes not re-openable | build inline-edit screen `/artist/act/edit` + edit affordance on confirmed nodes | **P0** |
| S6 | Passport self-view | §8.4/§17.A.3 | TARGET | bare redirect to public read; no multi-view/edit-preview/publish widget | build 4-face switcher + owner-edit vs buyer-preview + publish/share | **P0** |
| S11 | routes/nav plumbing | §8.5/§8.6 | PARTIAL | no `/artist/access` or `/artist/act/edit`; Account→`/settings` | add both routes; repoint Account | P0/P1 |
| S3 | Radar Universe depth | §8.3/§17.A.2 | PARTIAL | no scene-lens control, no desktop right-rail inspector (bottom-sheet on all viewports), no orbit-logo widget, no constellation threads | add scene switch + ≥md right-rail + orbit logos + motion | P1 |
| S7 | Requests inbox | §17.A.4 | PARTIAL | works+firewall-clean; missing fit-line, "ask one question", "no contact shared" cue | add decision-widget features | P1 |
| P6 | Access "who can act for you" | §8.5 | PARTIAL | inbound grant mgmt lives in Settings; no dedicated screen, no artist-initiated invite | build `/artist/access` w/ invite + rep-card states | P1 |
| S1o | Onboarding 3-step narrative | §8.1 | PARTIAL | 2-field min-viable (owner order 8 Jul, honest); scan-anim/found-grid deferred | label TARGET; keep entry | P2 |
| S4 | ArtistReadiness (legacy) | §8.2 | PARTIAL | superseded by Radar; dead deep-link; internal 0-100 never rendered (firewall-safe) | retire or fold in | P2 |
| BUILT | ArtistDashboard/Radar host, ClaimReview, EvidenceCapture, proofBits, OfferPayment, evidence→AI→approve loop | | BUILT | — | — | — |
_Firewall: NO violations in artist surfaces (counts shown are the artist's own items, spec-permitted; no reaction count/%/score returns to the artist)._

### 2 · Buyer + Source-Confirmer — mostly BUILT (highest firewall risk domain)
| id | screen/process | spec | STATE | gap | fix | pri |
|---|---|---|---|---|---|---|
| B3 | Passport footer firewall strip | §2.2/U33 | ✅FIXED | narrated "NO SCORE·NO RANK…" strip | removed | ~~P0~~ |
| B6 | Proof-unit source-peek | §8.7/§17.A.6 | MISSING | no hover/tap provenance popover (a DoD item) | add card-rise peek to ProofUnit | P1 |
| S2c | Confirmer "partly right" inline correction | §8.9/§17.A.7 | PARTIAL | posts `partial` with no correction field | add inline correction textarea | P1 |
| S5c | `/producer` shell (D3) | §8.9 | PARTIAL | producer workspace shell still exists | retire per D3 (owner decision) | P1 |
| B7/B9 | reassurance microcopy · "bookability" fallback string | §8.7 | PARTIAL | missing "no login needed" line; fallback eyebrow says "BOOKABILITY" (never shown) | add line; rename fallback | P2 |
| G2r | request bands pre-set from Passport | §8.8 | PARTIAL | bands are app-global, not the passport's shown bands | pass passport bands | P2 |
| S3c/S4c | confirmer replay + legal expandable | §8.9 | MISSING/TARGET | no replay ghost; legal not in expandable | add both | P2 |
| P2r | producer received-passports | task | PARTIAL | honest stub, no data layer | build query or keep stub | P2 |
| BUILT | Public Passport loader, firewall-safe derivation (bands+method labels+remove-empty), booking/rep views, availability request + GATE event, receipt, `/confirm/:token` ceremony | | BUILT | — | — | — |
_Firewall: public Passport shows zero score/rank/%/gauge; reaction to artist is method-safe text only. Confirmed clean (post B3 fix)._

### 3 · Representation + Production + Admin — Rep/Admin BUILT, Production PARTIAL
| id | screen/process | spec | STATE | gap | fix | pri |
|---|---|---|---|---|---|---|
| SW1/SW2 | effective-role derivation | §7.2/§3 | ✅FIXED | booker/producer dead-end on switch | added to ORG_DERIVED_ROLES | ~~P0~~ |
| D3 | retire `/producer` shell | §8.9 | OPEN | routes still present; PRODUCER base role routed into it | remove routes + re-home (owner decision) | **P0** |
| PR1 | Production lineup board | §8.11/§17.A.9 | PARTIAL | slots display-only; no per-slot CTA, no Production-as-Buyer link | add slot CTA + open-Passport | P1 |
| PR2 | Production event/lineup CREATION | §8.11 | TARGET | honest view-only; but header "+New event/open slot" affordance entirely absent | add target-stub affordance | P1 |
| A1/A2/A3 | Admin Gate hero · pilot funnel · AI-cost/freshness/risk tiles | §8.12 | MISSING | ops console exists but not the §8.12 cockpit (Gate tiles, funnel, cost) | add Gate tile row + funnel + 3 tiles | P1 |
| R1 | Roster cards | §8.10 | PARTIAL | one action+band ✓; missing what-changed+why line; urgent cards not sorted first | add why-line; sort openReqs first | P1 |
| PR3 | Production default section | §7.2 | PARTIAL | defaults to Team; spec = Events | default to events; reorder tabs | P2 |
| P1i | Rep requests inbox forward/decline | §8.10 | PARTIAL | answer/close ✓; no forward/decline | add actions | P2 |
| BUILT | Rep roster grant rows, next-best-action engine, invite handshake, access-requests lifecycle, RadarFeed, Admin ops console (GDPR export/erasure/audit), workspace switcher | | BUILT | — | — | — |
_Firewall: no score/rank in roster/radar cards (counts are declared inbox/inventory, spec-permitted)._

### 4 · Auth + Org + utility — largely BUILT + polished
| id | screen/process | spec | STATE | gap | fix | pri |
|---|---|---|---|---|---|---|
| A6 | privacy consent scope | §15.2 | ✅FIXED | legacy scope names rejected by CHECK | canon `privacy-processing` | ~~P0~~ |
| U10 | 404 not-found | §17.B.10 | ✅FIXED | silent redirect | warm NotFound | ~~P0~~ |
| U11 | offline banner | §17.B.10 | MISSING | no `navigator.onLine` anywhere | add online/offline banner in AppShell | P1 |
| U3 | 30-day deletion SLA | §17.B.5/§15 | PARTIAL | records request; no server purge job — SLA is copy-only | add ops queue / cron purge | P1 |
| U5 | consent/cookie banner | §17.B.8 | PARTIAL | unequal button hierarchy; no Manage-prefs sheet; not re-openable from Account | equal-weight + Manage sheet + Account link | P1 |
| A3o | Google OAuth | §13.4 | PARTIAL | code correct; provider not enabled server-side; no cancel-note | enable provider; add note | P2 |
| U7 | notifications page | §17.B.9 | PARTIAL | dropdown only; no `/notifications` page | add route | P2 |
| O1/U9/U12 | invite decline · error copy · skeleton breadth | | PARTIAL | minor divergences | align | P2 |
| BUILT | Signup, Login, Forgot/Reset, role select, AuthProvider, invite→accept→scope→revoke, settings (name/WA/lang/marketing/delete), org members/roles/seats, org settings/transfer/delete, upgrade/billing (free-pilot), Consent Mode v2 default-denied, shell/nav, ErrorBoundary, skeleton pattern | | BUILT | — | — | — |

### 5 · Platform processes — firewall/analytics-canon BUILT; outer processes thin
| id | process | spec | STATE | gap | fix | pri |
|---|---|---|---|---|---|---|
| S1p | CSP/security headers (app) | §13.5 | ✅FIXED | zero headers | vercel.json CSP+HSTS+… | ~~P0~~ |
| N2 | availability-request → artist EMAIL (Gate-critical) | §14.6 | MISSING | bell only; artist gets no email | send via Resend in the route | **P0** |
| N3 | email transport (Resend/SMTP) | §14.6 | MISSING | none in repo; signup rides Supabase default | create Resend + transport util | **P0** |
| S2p | security headers (marketing site) | §13.5 | MISSING | static export ships no headers | add to website-next/vercel.json | P1 |
| M2 | GA4 dual-emit of the 29 events | §14.3 | MISSING | events never reach GA4 (pageviews only) → funnel invisible in GA | consent-gated gtag in logEvent | P1 |
| M3 | demo/test-account funnel exclusion | §14.4 | PARTIAL | DEMO excluded, but @gigproof.test/operator pollute live funnel; no is_demo col | add is_demo + exclude at insert/view | P1 (migration) |
| L2 | site body prose localization | §15.4 | PARTIAL | HE authored but pages hardcode `.en`; toggle switches chrome only | wire pages to `content[locale]` | P1 |
| L3 | Hebrew webfont | §15.4 | MISSING | `--font-heebo` loads Manrope (Latin); HE falls back to OS font | load real Hebrew webfont | P1 |
| N4 | org-invite email | §14.6 | MISSING | resendInvite is a no-op; UI toasts success | implement or disable button | P1 |
| T1/T2 | governed taxonomy + comedian/ceremony families | §16.A | MISSING | genre free-text; format enum can't reach non-music families | reference tables + FKs (migration) | P1 (migration) |
| L1 | app HE key coverage | §15.3 | PARTIAL | ~14% keys EN-fallback | native HE pass | P2 |
| BUILT | 29-event CANON (file=DB=app), event RLS, in-app notifications, buildSafePayload firewall, internal_confidence DB-only, snapshot firewall, server rate-limit/CORS | | BUILT | — | — | — |

## FIX REPORT — what happened this session
**Wave-1 (DONE, committed b9514d1, verify-green, pushed):** B3 firewall strip · A6 consent scope · U10 404 · SW1/SW2 effective-role · S1 app security headers. → **5 of 10 P0s closed.** (wave-2 added D1 → **6 of 10**.)

**Wave-2 (next, build — no owner input needed):** P7/D1 Act-Identity Editor + S11 routes · S6 Passport multi-view. These are the two thin artist screens; each is a focused build through the GO→AUDIT→FIX loop.

**Owner-blocked / owner-decision (can't close without you):**
- **N2/N3** Gate email — needs a **Resend account + `RESEND_API_KEY`** (I'll build the code path guarded on the env var so it activates the moment the key lands).
- **D3** retire `/producer` — a product decision: fully retire the shell, or reclassify those screens as Production. Affects where the producer persona lands.

**P1 backlog (strong-launch, after wave-2):** Radar depth (S3) · Production board CTAs (PR1/PR2) · Admin cockpit tiles (A1–A3) · offline banner (U11) · consent-banner equal-weight + Manage (U5) · deletion purge job (U3) · GA4 dual-emit (M2) · is_demo exclusion (M3) · site HE wiring + webfont (L2/L3) · governed taxonomy (T1/T2) · marketing-site headers (S2p).

---

# IMPLEMENTATION PLAN — build the spec 100%, NO DRIFT (16 Jul 2026)

Owner asked for a plan to implement `LOCK-PRODUCT-SPECIFICATION.md` (4,047 lines / §0–21) to 100% with zero drift. "No drift" = every line of code traces to a spec section, every change passes the mechanical firewall gate, nothing is built big-bang. This plan is the ordered execution layer over the spec; the live status register is the tables above.

## PART A — THE ANTI-DRIFT OPERATING SYSTEM (how we work, every time)
These 7 rules are the guardrails. Violating one *is* drift.
1. **The spec is the single source of truth.** §20 (AI/code-agent guardrails) is the executable contract; `CLAUDE.md` wins on any conflict.
2. **Atomic spec slices, never big-bang.** Never "build the Radar." Always "build §8.3 Planet Inspector bottom-sheet — component only, no DB." One slice = one PR = one spec section.
3. **Every slice ends with `npm run verify` GREEN** (nav-contract · act-isolation · canon-drift · security-denial · **i18n-purity firewall lint** · registry · deltas · build). The firewall check is mechanical, not human judgment — this is what makes "no firewall drift" enforceable.
4. **Design-critic pass on every user-facing change** — an independent grader scores the build against the exact spec section before merge (the no-Codex continuation model).
5. **Reproduce-before-claiming.** Every UI slice gets a Playwright screenshot/interaction proof. Never trust a self-report of "done."
6. **Canon-change process (§19.6).** Spec + code move in ONE lockstep PR; SHA = rollback anchor; the spec section number is in the commit message (traceability).
7. **Status ladder, no silent completion:** OPEN → BUILDING → CODE-COMPLETE → VERIFIED → OWNER-ACCEPTED (this file is the register).

## PART B — THE PHASED PLAN (ordered by the Gate + dependencies)

### Phase 0 — Unblock (mostly OWNER; I do what I can now)
Gate later phases. **OWNER must supply:** B-1 beachhead ICP · pilot price + annual % · gold/amber ruling · Supabase Pro (C-2, unblocks migrations 037+) · counsel session (L-1…L-9) · Resend key (Gate email) · Producer-shell ruling (D3) · canonical tagline · Codex logo/venue SVGs. **I do now (no owner input):** mirror §5.11 tokens into `tailwind.config.js`/`tokens.ts`; author migration 037 (`is_demo`) as a diff-first draft (owner applies); wire the 4 unwired analytics events.

### Phase 1 — Port the approved prototype into the real `src/` app (the core build)
The live app is the OLD dark build (`a874ab5`); the spec + prototype ③ are the target. Screen-by-screen, each an atomic slice + design-critic + Playwright:
1. **DS foundation** (✅ done) — §5.11 tokens into code (`tailwind.config.js` fontSize/radius + `tokens.ts` `type`) + §5.10 humanized-rendering renderer (`src/lib/humanize.js` pure fns + `scripts/test-humanize.mjs` 10/10). Verify-green.
2. **Artist canvas** (§7.7 one-canvas) — Radar (§8.2/§8.3/§17.A.2) · Passport multi-view **S6** (§8.4) · Requests (§8.13/§17.A.4) · Act-editor **D1** (✅ done) · Access (§8.5).
3. **Buyer** — public Passport (§8.7) + availability request/receipt (§8.8) — highest firewall care.
4. **Confirmer** — `/confirm/:token` refinements (§8.9).
5. **Representation / Production / Admin** — cockpit + board + Gate tiles (§8.10–8.12).
6. **Utility screens** — the 11 (§17.B): 404 (✅) · offline · consent-banner equal-weight · notifications page · etc.

### Phase 2 — Close the P0 build gaps
D2/D3 effective-role + producer-shell (needs your ruling) · Gate email (§14.6.5, needs Resend key) · is_demo exclusion (**migration 037 authored + verify-green** — owner applies when Supabase Pro/C-2 is enabled; the `.eq('is_demo', false)` read-model filter ships WITH the server change, not before) · firewall-strip already removed (✅) · consent scope already canon (✅).

### Phase 3 — Gate-readiness (the §21.7 non-negotiables)
artist_approved (✅) · is_demo · deep-link durability (✅, rides the deploy) · Gate email · rollback rehearsal · firewall clean (✅) → then **your Q8 walk** on the frozen SHA.

### Phase 4 — Gate pursuit
Concierge first-10 (§16.B.11, you) · instrument the funnel · drive to **1 reaction + 1 pay**.

### Phase 5 — Post-Gate (only after the Gate)
Monetization ON (flip plan enforcement, prices) · growth-loop instrumentation (§16.B.13) · Hebrew launch (§15.3) · scale hardening (§13.5.6 bots/rate-limit, BFF, §19.2 DR/observability) · international (§19.1).

## PART C — DIVISION OF LABOR
- **I build solo (no input):** all of Phase 1 code, migration drafts, event wiring, the humanized renderer, utility screens, verify-green + Playwright proof on each.
- **Needs an OWNER ruling before I build:** D3 producer-shell · monetization numbers · gold/amber · tagline · B-1 (shapes GTM, not the build).
- **OWED by others (non-blocking to most of Phase 1):** Codex logo/venue SVGs (art only — §5.11 defaulted the values) · counsel L-1…L-9 · Resend key.

## PART D — DEFINITION OF "100% DONE, NO DRIFT"
Every §0–21 requirement is either: **VERIFIED** in code (verify-green + design-critic + Playwright), or explicitly **OWNER-ACCEPTED as deferred** (a logged OPEN/OWED with an owner sign-off) — nothing silently skipped. The firewall lint passes on every commit. The Version Map artifact reflects live phase status. When every row here is VERIFIED or OWNER-ACCEPTED, the spec is 100% implemented.
