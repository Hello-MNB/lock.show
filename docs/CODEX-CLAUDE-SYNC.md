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
| 3 | Build-blocker specs (band/binary, Radar states, motion/radius/spacing, HE token, OG contract) | Codex → Claude | 🟠 now v1.5.8 (demand-side segmentation; buyer ≠ אמרגן) — **Claude independent audit PENDING before binding** |
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
