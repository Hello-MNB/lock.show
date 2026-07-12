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
| 3b | Physical files INTO git: logo SVGs, lockshow-icons.svg, 4 atmosphere PNGs, OG exports | Owner/Codex → repo | 🔴 open — only blocker left on the design side |
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
