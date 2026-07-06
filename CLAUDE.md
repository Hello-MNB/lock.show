# CLAUDE.md — GIGPROOF build guide for Claude Code
*Read this fully before any task. Under 200 lines by design — it loads every session.*
*Authority: subordinate to ★ START HERE + the 7 CURRENT canon docs. On any conflict, canon wins; ask, don't guess.*

---

## WHAT THE APP IS
Pre-booking proof / risk-reduction tool. Helps Israeli booking managers (אמרגנים) evaluate an unfamiliar artist via standardized, method-labeled evidence before they risk their name. **Talent ≠ bookability.** NOT an EPK, NOT a booking CRM, NOT a guarantee, NOT a marketplace.

Three actors: **אמן** (artist — builds proof, the payer candidate) · **אמרגן** (booking manager — evaluates, reputation risk, free) · **מפיק** (producer — confirms one claim, money risk). אמרגן ≠ מפיק — never merge them, in code or analytics.

Two surfaces, one truth: **Mirror** (artist-private) shows gaps + next action · **Passport** (public, buyer-facing) shows verified strengths ONLY. Same claims, different face.

---

## THE FIREWALL — ABSOLUTE (this is the product; violating it kills it)
NEVER build, in any surface, public or private:
- ❌ score · percentile · rank · rating · "bookability %" · grade · gauge · progress-ring · prediction · probability · booking-forecast
- ❌ artist-vs-artist comparison · cohort · benchmark · "top X%" · "you vs segment"
- ❌ exact public head-count or fee (bands only) · radar/spider/polygon chart
- ❌ any number that grades the artist

ALWAYS:
- ✅ Draw = **band pill** (`50–150`) + method label + reviewed date. Never a gauge, never a fill bar.
- ✅ Every claim renders as a **Proof Unit**: `claim · context · method-label · reviewed-date` as ONE block. Never a bare number.
- ✅ Method label always visible (`TICKET EXPORT · REVIEWED OCT 2025`) — it's the product, not fine print. "Verified" never stands alone.
- ✅ **Omit, don't show weakness** — a domain with no supported claim is REMOVED from the public DOM. Never "developing"/"missing" on a Passport.
- ✅ **N/A ≠ ZERO** — a field irrelevant to the artist's type is removed, never counted as a gap.
- ✅ Streaming = secondary context strip only, never a draw signal.

If a task seems to require a forbidden element, STOP and ask. Do not improvise a "compliant score."

## FIREWALL AT SCHEMA LEVEL
These columns must NEVER exist: `score`, `rating`, `percentile`, `rank`, `bookability_pct`, `fill_value`, `completion_pct`, `benchmark_cohort`, `comparison_population`, `weight_numeric`. Their absence = the firewall. Every `claim` carries: `certainty · method_label · reviewed_at · visibility · passport_eligibility`.

---

## STACK
React + Vite + Tailwind · Supabase (ref `qexfndiyallwqhhzeerd`, Postgres + RLS) · Vercel · Anthropic API **stubbed** (AI claim-pipeline is concierge-processed BY HAND until volume justifies automation — do NOT build automated extraction yet; build the stub + human-review UI).
Canonical codebase: `C:\Users\user\GIGPROOF` (local) → GitHub → Vercel. `netlify.toml` must NOT exist.
Mobile-first, always. The Passport must pass the WhatsApp 390px test.

## SOURCE OF TRUTH
★ START HERE + this CLAUDE.md + the 7 CURRENT canon docs (folder 35: B4-35.00 through 35.60) + tech spec B4-40.10. Build ONLY from these. NEVER from older HTML prototypes, score-era docs, or Base44-era screens. If unsure which doc governs, check B4-35.00 (the authority index) or ask.

## DRIVE RULE
Read canon from Drive folder `1QyQtp-vVcqosKplB_zMmtWNweBH_PaS3`. UPDATE files, never DUPLICATE. Claude Code does NOT write to Drive — it works in the repo. Drive writes happen via GPT/Cowork only.

---

## STAGE & SCOPE — BUILD ONLY THE GATE-1 SLICE
**Pre-validation.** Gate = one אמרגן reacts to a real Passport AND one artist pays. No price/ICP locked until then.
Build ONLY these (the trust loop that reaches the first booker):
1. Person + one artist workspace (schema = full model; UI = artist only)
2. Act/alias + evidence + claim (the data spine)
3. Artist Radar (Mirror): evidence states + ONE next-action (NO aggregate score)
4. Public Passport: verified strengths, method-labeled, WhatsApp-scannable, renders from live claims
5. Source-confirmer magic-link (ONE claim, bounded, no account)
6. Contextual consent (account · data-connection · publication · counterparty-name)
7. Manual payment (Bit/transfer → founder approves → entitlement) — NO Stripe
8. Concierge claim-processing UI + minimal ops queue

**DO NOT build now** (schema-ready, UI deferred to FULL-BETA): management/agency + event-producer workspaces, workspace switcher, billing centre, subscription families, roster/coverage-compare, opportunities, automated discovery engine (counsel-gated).

## ACCOUNT MODEL (build the schema, not the full UI)
person (one login) → workspace (artist/management/producer) → role inside workspace → subscription attaches to the WORKSPACE. Agency = workspace TYPE, not a role. Source-confirmer (bounded magic-link) ≠ event-producer (full workspace). At Gate-1, build only the artist workspace UI; keep other workspace tables in schema.

## ARTIST-AGNOSTIC LAW
No table/column/enum/logic may assume a specific artist type, genre, or platform (no assuming Spotify, ticket draw, catalogue, or DJ format). Artist type is expressed ONLY via taxonomy + field_applicability (switches fields on/off, N/A≠ZERO). The Radar serves ANY artist on one engine. Hardcoded type-specific logic = defect.

## THE RADAR IS AN ACTIVE TOOL
The Artist Radar discovers information about the artist (surfaces web-found candidates), it is not only a passive form. Path: discover → SURFACE candidate → artist confirms → method-label → claim. NEVER publish web data as fact without artist confirmation. At Gate-1 discovery is concierge (human-run), opt-in, post-consent only.

---

## LOCALIZATION
UI ships EN + HE (Phase 1), RU + DE (Phase 2). Full scene-native localization, NOT translation. HE authored native-first, not derived from EN (EN = dev/string-key baseline only). אמרגן ≠ מפיק preserved in every string. Use a `string_key → translation` table so RU/DE add without schema change. RU/DE = scaffold, not shipped until native-editor pass.

## CONSENT (Amendment 13 — HARD BLOCKER)
No real PII/evidence stored before consent. Consents are SEPARATE + contextual, never one bundled pre-checked screen: account terms · data-connection · public-publication (Mirror→Passport) · counterparty-name · marketing (optional). Real-data launch BLOCKED until counsel sign-off + SEC-01 (Drive folder Restricted).

## RLS / PRIVACY (non-negotiable)
- `claim.value`, `gig.exact_count`, `claim.internal_confidence` → never SELECT-able by public/buyer session.
- `artist.contact` → never SELECT-able by non-operator.
- Public passport session → INSERT professional_reaction + availability_request; SELECT only passport-ok claims of the viewed passport.
- Every operator write → `audit_event` (actor, reason, prev→new). No silent overrides.

---

## HOW TO WORK (token discipline + safety)
- **Plan Mode (Shift+Tab) before any big change.** Get plan approved before writing code.
- One screen / one migration per session, then `/clear`. Short scoped sessions — no giant accumulating contexts.
- Single agent — NO parallel agent teams (7x token burn).
- Sonnet default; Opus only for schema, firewall-enforcement, and Passport render logic.
- Migrations: write from Gate-1 tables only, in build order (account spine → artist truth → proof engine → publication → buyer actions → confirmation → consent/ops).
- "Live but unverified" is forbidden — every build step needs environment-verification evidence.
- When unsure, STOP and ask. Never improvise around the firewall or invent brand/pricing/taxonomy values (those are OPEN — R00 only).
