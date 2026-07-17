# AUDIT — Codex `LOCKSHOW_Design_System_CURRENT.html` (v1.4.2) — 2026-07-10

_Full read of the 162KB CURRENT artifact vs the three briefs (`CODEX-DESIGN-BRIEF`,
`CODEX-TOKEN-COMPLETION-MAP`, `CODEX-FUNCTIONAL-CONTRACTS`) + the CLAUDE.md firewall.
**This doc doubles as the correction list to hand back to Codex.**_

## Verdict in one line
Codex internalized LOCK's philosophy excellently (firewall, entity routing, surface split, voice) —
but v1.4.2 is a **governance/voice document, not a token system**: zero readable hex values, zero CSS
vars/Tailwind keys in the content. Its own audit table concedes "Tokens to code — Partial." The
implementation handoff (A13) still doesn't exist.

## What Codex GOT RIGHT (keep)
- **Firewall internalized**, verbatim rules ("no scores, ranks, percentages, guarantees"; "Never
  'verified' as a blanket claim"). "Confidence" (v1.4.2's theme) = emotional copy only — OK.
- **Signup/routing contract matches the functional table** (Artist/Agency/Booker self-signup; Producer
  magic-link, "never self-selects"; Operator internal).
- **Surface language exactly as affirmed:** "Paper does the work. Darkness carries atmosphere."
- **All four governed sections present** (Marketing / Application / Surface / Routing contracts).
- Proper versioning + per-entity atmosphere imagery (closes the imagery P1).

## What Codex MISUNDERSTOOD or must fix (hand back)
1. **Method-label drift (canon break).** Codex wrote "Producer-confirmed, source-linked,
   **artist-declared**, **not-assessable**". Canon: **Producer-confirmed / Source-linked /
   Evidence-supported / Self-declared**; "not-assessable" is an evidence *state*, not a method label.
2. **"Source confidence" loophole (firewall watch-item).** Radar spec says findings "show source
   confidence". Must be pinned to the bounded method labels — never a number/level/meter.
3. **Draw bands + binaries unspecified.** The firewall's *positive* component — the band pill + yes/no
   binary widget (the anti-score UI itself) — has **no component spec**. This is the core proof widget.
4. **Producer ≠ Production blur.** Entity/image lists merge Producer (claim-confirmer person) into
   "Production" (workspace). They are different entities.
5. **Hebrew vocabulary half-done.** Has "אמרגן ≠ מפיק" but not the booker term (מזמין/מפיק אירוע) —
   the original B6 collision is only half-resolved.
6. **Pricing ruling not encoded.** Spirit is right ("one commercial truth") but the 10-Jul values are
   absent: artists free in pilot · Founding Passport RANGE ₪149–249 (never fixed) · agency unpriced.

## Token scorecard (the 13 groups from CODEX-TOKEN-COMPLETION-MAP §A)
| # | Group | Verdict |
|---|---|---|
| A1 | Hebrew/RTL type layer | 🟡 PARTIAL — Heebo blessed for HE body/UI; **HE display face undecided**; no font tokens; RTL self-marked "Missing P0" |
| A2 | Per-surface variants | 🟡 PARTIAL — four surfaces + contrast matrix, but **no per-surface token values** |
| A3 | 5-state evidence tokens | 🔴 MISSING — different vocabulary, no found/good/dev/need/na triples |
| A4 | Method-label tokens | 🟡 PARTIAL — named (with drift), no color/weight tokens |
| A5 | Radius scale | 🟡 PARTIAL — values in prose, not named tokens |
| A6 | Spacing scale | 🟡 PARTIAL — prose only |
| A7 | Shadow/elevation | 🔴 MISSING |
| A8 | Motion + reduced-motion | 🟡 PARTIAL — ranges + rule, no tokens/named primitives |
| A9 | Semantic status set | 🟡 PARTIAL — amber/red governed; no success/info; no token set |
| A10 | Focus-ring/selection | 🔴 MISSING |
| A11 | `--line` hairline | 🔴 MISSING (exists only in the doc's own page CSS) |
| A12 | Brand-logo palette | 🔴 MISSING |
| A13 | **Tokens-to-code map** | 🔴 **MISSING — the critical one** ("Tailwind" appears 0 times) |
WCAG: 🟡 8-pair matrix proven; evidence states / method labels / overlay text / focus unproven.

## What CLAUDE still lacks (why the app re-ground can't start yet)
The **A13 tokens-to-code map**. Without `named token · hex · CSS var · Tailwind key · light+dark value ·
AA ratio`, I cannot kill the app's ~350 hardcoded colors or re-ground it. Dark-surface *values* and the
HE display face are also undecided.

## The ranked request list for Codex (next work order)
1. **A13 tokens-to-code map** — one table, every token: hex · CSS var · Tailwind key · light+dark · AA.
2. **A2 values** — `--text/--text-muted/--line/--accent-text` × the four surfaces, AA-proven.
3. **Finish A1** — decide the HE display face (bless/replace Frank Ruhl Libre); emit font tokens; RTL suite.
4. **A3+A4 in canon vocabulary** + the **draw band/binary component spec** (fixes #1–#3 above).
5. **Tokenize existing prose values** (A5/A6/A8) + emit A7/A9/A10/A11.
6. **A12 brand-logo palette.**
7. **Copy patches:** pricing ruling verbatim; booker Hebrew term; Producer as distinct entity;
   "source confidence" pinned to labels.
