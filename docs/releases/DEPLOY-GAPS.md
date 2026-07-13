# GAPS TO DEPLOY — rel-2026.07.13 (owner-readable; what is NOT done yet)
Owner order 13 Jul: finish these, then deploy. Each row = one gap, its DOD, its owner.
Everything else in the locked scope is BUILT and gate-green.

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
| G20 | Legal/privacy/accessibility + browser matrix (iOS Safari, Android Chrome, keyboard/SR path) + perf budget | ADOPTED — owner+counsel items surfaced on her board | P0/P1 mixed |
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
