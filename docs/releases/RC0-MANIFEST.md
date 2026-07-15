# RC0 MANIFEST — rel-2026.07.13 (GPT audit trigger)

_Produced 13 Jul 2026 by Claude Code per SYNC §32 (RC discipline) + §33 (parallel-execution
governance). This is the document GPT audits adversarially before COWORK deploys the private
preview. Every claim below is bound to a SHA._

## 1. The frozen candidate

| Field | Value |
|---|---|
| RC | **RC0** |
| Frozen SHA | **2a2c955** (`release: RC0 FREEZE — PREVIEW-DEPLOYABLE declared`) |
| State | **PREVIEW-DEPLOYABLE** (ladder: PREVIEW-DEPLOYABLE → QA-READY → Q8-READY → PRODUCTION-READY) |
| Branch | `claude/b4-gigproof-discovery-e7749o`, head at manifest time **5a9a47c** |
| Train | rel-app-2026.07.13 + rel-site-2026.07.13 (one atomic train) |

## 2. Code-identity proof (head vs freeze)

Commits after 2a2c955: `7c78761` (email-scan rule) · `093e8a6` (SYNC §33) · `5a9a47c`
(Track-1 docs wave). **All three are docs-only** — `git diff --name-only 2a2c955..5a9a47c`
touches ONLY `docs/**` (7 files, 413 insertions, 23 deletions; zero files under `src/`,
`server/`, `website-next/`, `supabase/`, `scripts/`, `public/`).
⇒ **The buildable product at 5a9a47c is byte-identical to RC0 2a2c955.** Cowork may deploy
the preview from either ref; the tested-SHA record stays 2a2c955.

## 3. Verify status

`npm run verify` at 5a9a47c: **exit 0** (lint · i18n lint · registry+delta validators ·
canon-drift gate CANON===CHECK 29 events · act-isolation 17 checks · build). One pre-existing
informational warning (bundle chunk > 500 kB) — not a gate.

## 4. Gap register snapshot (authoritative: docs/releases/DEPLOY-GAPS.md)

- **G1–G8, G11, G12** CODE-COMPLETE (closure SHAs in the register) — G11/G12 include the
  12-fix security wave (`fbb3cec`): JWT + per-object ownership, CORS allowlist, closed notify
  enum + public availability-request route, truthful AI provenance, refusal-aware client,
  $-ledger ($25 warn/$50 stop), hashed-token draft 036 (NOT applied), rate/spend caps.
- **G13 / G15** real-DB proofs pending (QA-stage, on the preview with Cowork).
- **G14** code-complete caps in place; abuse-matrix verification rides QA.
- **G16** AUTHORED (docs/releases/G16-QA-ISOLATION-PLAN.md, amended per §33 with child-row
  cleanup graph: qa_run_id, dedicated QA account, FK-safe cleanup order, Gate-read exclusion).
  **Closure pending — governing rule holds: no preview URL distribution for WRITE-path testing
  until G11+G12+G16 are closed.** G11/G12 closed in code; G16 activates AT preview deploy.
- **G9, G10, G18–G22** QA-stage rows (attach to the preview SHA).
- **G17** OWNER-ACCEPTED (FREE PILOT — no payment CTA, N10 display-only, payments dormant).

## 5. Known-stale-by-design (not defects)

- Live production (app a874ab5 / site 6183e81) intentionally predates this train — including
  the Google-OAuth redirectTo fix, which exists on the candidate and dies at deploy.
- 036_token_hash.sql.DRAFT is deliberately unapplied (dual-read rollout plan).
- Migration 021 FROZEN; DB CHECK = app CANON = 29 events (034 in effect, Cowork-verified §29).

## 6. What GPT audits (its own trigger spec)

① Re-derive §2 (docs-only delta) independently at the pinned SHAs — no stale fetch.
② Attempt to refute the G1–G12 closure SHAs against the register's DODs.
③ Check this manifest's claims against DEPLOY-GAPS lifecycle states — flag any drift.
④ Verdict format: per-claim CONFIRMED/REFUTED + evidence line; sign GPT.

## 7. Next in the chain (per the per-agent work plan)

COWORK: correlate the failed-preview Vercel email → deploy private preview of 2a2c955 →
activate G16 → declare QA-READY → only then distribute URL + QA account. CODEX: Q4 18-screen
audit + native-HE pass on that preview. RC1 fix wave after findings (Passport hero ·
cookie-banner two-stage · admin recapture) → re-freeze RC1 per §32.

---
## ADDENDUM (14 Jul) — GPT ADVERSARIAL AUDIT OUTCOME: ACCEPTED IN FULL
GPT's audit CONFIRMED RC0 product-code identity (freeze→tip docs-only, independently re-derived)
and REFUTED parts of §4. Claude spot-verified the four key refutations in code — all real. This
addendum corrects the record; the body above is retained as the audited original:
- §4 corrections: G2 + G4 + G11 + G12 = BUILDING (not code-complete) — see the corrected register
  in DEPLOY-GAPS. G5 + G6 = VERIFICATION-PENDING. G11/G12 closure evidence = the CHAIN
  395d8ba→fbb3cec, not 395d8ba alone.
- Taxonomy fix: the $-ledger + rate/spend caps listed under G11/G12 belong to G14 (still
  BUILDING); hashed-token draft 036 belongs to G15 (still BUILDING).
- G16: the child-row protocol was adopted in SYNC §33 by reference but was MISSING from the
  physical plan file — now amended there (qa_run_id, dedicated QA account, FK-safe cleanup order,
  Gate-read exclusion proof). G16 remains OPEN; write-path distribution stays blocked.
- Release ruling adopted: private preview of pinned ref 2de06b7 MAY be created (visual-only,
  no write QA, no test-account distribution); QA-READY blocked until the corrective candidate
  (RC1) closes G2/G4/G11/G12 + G16 activates.
- GPT's proactive `test:release-governance` gate: ADOPTED as P1 (rides RC1 wave or immediately
  after).
