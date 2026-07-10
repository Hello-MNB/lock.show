# LOCK — Functional Contracts for Codex to absorb into the DS

_Codex's audit asked the Claude app (the "functional authority") to hand over its entity/signup/routing
logic + image/empty-state reality so the DS v1.3 can absorb them. This doc is that handoff — authoritative,
sourced from `src/lib/navigation.js` (proven by `scripts/nav-contract.test.mjs`, 34 journeys ✅). It feeds
Codex's proposed **§4 Signup + Entity Routing Contract** and **§2 Application Experience Contract**. We
endorse Codex's four-section plan; §1 Marketing and §3 Surface Language are design-led, §2/§4 are governed
by the facts below._

## 1. Entity model (authoritative)
**Person → Workspace → Role.** One person, several workspaces, different roles; **subscriptions/entitlements
attach to the WORKSPACE, not the person.** A person may hold multiple Acts; evidence is **per-Act,
non-transferable**. Two products: **Radar** (private developmental intelligence) · **Passport** (controlled,
recipient-safe public proof).

## 2. §4 — Signup + Entity Routing Contract (exact)
Self-signup roles are chosen at `/select` ("what would you like to do first?"). Producer & Operator are
**never self-selected**.

| Entity | Self-signup? | Entry | Lands on | First-run |
|---|---|---|---|---|
| **Artist** | ✅ yes | /select → Artist | `/artist/home` (Radar) | `/onboarding` (2-step: name/location/genre) then Radar |
| **Agency / Representative** | ✅ yes | /select → Agency | `/agency` (Roster) | roster + first-run checklist |
| **Booker** | ✅ yes | /select → Booker | `/discover` | paste-a-Passport-link resolver |
| **Producer** | ❌ no | **magic link** `/confirm/:token` | confirmation ceremony (no account) | — |
| **Operator** | ❌ no | provisioned | `/admin` | — |
| **Production workspace** | ❌ not an ordinary role | `organization.workspace_type='producer'` | `/production` | team/events/requests |

**Routing laws (from `navigation.js`):** wrong-role deep links bounce to the person's own home (never a loop
or dead-end); role is the **active workspace's** derived role (switching workspace re-routes to the new
home); `homePathFor()` is the single source of truth. **Vocabulary (must be exact in copy):** _booker_ =
מזמין/מפיק אירוע (demand side, receives proof — **NOT** אמרגן); _agency_ = אמרגן/סוכנות (supply-side
manager, the payer); _producer_ = מפיק מאשר (claim-confirmer, magic-link only). Codex's audit flagged B6
blurs producer/booker — this table is the disambiguation.

## 3. §2 — Application Experience facts, per entity
For each: first screen, primary task, nav, current maturity (vs the Radar "smart growth surface" bar), and
the empty-state reality. The DS target is **"never an empty dashboard — show the emerging result + one
suggested input"** (Smart Onboarding spec).

| Entity | First screen | Primary task | Nav tabs | Maturity | Empty-state today |
|---|---|---|---|---|---|
| Artist | Radar (orbit universe) | build proof; one next-action | Radar·Passport·Requests·Account | 🟢 smart (the model) | Radar shows "needs" nodes ✓ |
| Agency | Roster universe | evaluate/represent; one priority per artist (no scores) | Roster·Radar·Requests·Account | 🟢 smart (next-action is one tab away in `/agency/radar` — should surface on home) | checklist ✓ |
| Booker | Paste-a-link hero | open a Passport | Passports·Account | 🔴 thin (resolver) | static explainer |
| Producer | Received passports | confirm one claim (via magic link) | Received·Account | 🔴 thin | promises an inbox with **no backend** — must reframe or wire |
| Production | Team/Events/Requests tabs | manage roster events | Team·Events·Requests·Account | 🟡 partial | Events/Requests empty tabs are inert |
| Operator | Console | moderate | Admin·Account | 🟡 partial (fits growth model least) | honest zeros |

**Image / empty-state reality (Codex asked):** the app's image brief supports imagery in empty states, but
the live empty states are **text-only** — no `<img>`/media. DS §2 should require each entity empty-state to
carry the DS "media" treatment (a scene or persona anchor) + one suggested input, per the growth-loop
patterns (Input→benefit / Discovery→confirmation / Gap→opportunity / Private→protected). Distinct entity
fallbacks required (artist / project / alias / manager-org / producer must not share one image).

## 4. §3 — Surface Language: we affirm Codex's split
**Light paper = everyday reading/work** (all task UI, forms, lists, admin). **Dark cinematic = media/proof
moments only** (Passport, Radar, hero/media). This matches DS v1.2.0's four surfaces (Paper canvas · White
card · Forest panel · Media overlay) and resolves the app-dark-vs-DS-light tension. Implementation depends
on the **tokens-to-code map** (`CODEX-TOKEN-COMPLETION-MAP.md` §A2/§A13).

## 5. Pricing — the contradiction Codex flagged (needs ONE owner truth)
Codex is right that "free for artists" vs paid plans is unresolved. The **code today** implements a **manual
Bit** model, no Stripe:
- **Artist:** a "Founding Passport" **entitlement** — artist pays via Bit (054-4555060) + reference → operator
  marks active. (Price copy is a range until the owner locks one; recommendation ₪179.)
- **Agency:** a Solo→Agency **plan upgrade** the operator approves — **captures no payment record** (settled
  outside the app).
- No receipts/invoices yet (legal gap before real money).
**Decision required from the owner:** one pricing truth across site + app (who pays, who's free, the number).
Until locked, the DS/site must not state a contradictory price. _This is an owner decision, not Codex's or
Claude's to invent._

## 6. Firewall (unchanged, absolute)
No score/rank/percentile/gauge; bands + binaries + method labels; audience as bands never raw counts; one
Passport, two views; streaming demoted. Any component implying a grade is wrong by definition.

---
**Status note:** Codex has produced `LOCKSHOW_Design_System_v1.2.1.html` (GIGPROOF→LOCK rebrand). Track the
line as **DS v1.2.0 (base) → v1.2.1 (rebrand, Codex) → v1.3 (target: +Hebrew layer, +4 governed sections,
+tokens-to-code map)**. When v1.3 + the tokens-to-code map land, Claude re-grounds the app to it.
