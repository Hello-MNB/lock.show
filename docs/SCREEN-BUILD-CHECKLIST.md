# SCREEN-BUILD CHECKLIST — every screen passes this before it is witness-ready
_T-67 (owner order 18 Jul). Project-fit, not generic. Companion to docs/HOW-TO-BUILD-A-TASK.md (the ladder) and spec §7.7.a (the entity→screen map). A screen task cites its map row + §8/§17.B section, then runs THIS list top to bottom and reports the numbers. The owner's witness confirms TASTE; everything below is the builder's guarantee._

## 1 · NAVIGATION (§7 · §10.6)
- [ ] Reachable from its entity's MAIN canvas in ≤ 3 steps (map row §7.7.a)
- [ ] Forward AND backward path walked — no dead end; Escape/back returns where expected
- [ ] Deep-link honored where the map says (§7.6): surface-aware `BASE_URL`, bad/expired link → warm 404, no PII in URL
- [ ] Correct shell: 2-element identity chrome (§7.1) · hub renders in this mode (§7.2) · the entity's context nav with correct default (§7.3) · bottom-nav on ≤640px (§7.5)

## 2 · MAIN-SCREEN INTERACTIVITY (entity home screens only — §7.7.a "ENGINE" column)
- [ ] The entity's ONE engine works end-to-end (Artist = Radar+Inspector §8.2/8.3 · Representation = roster action cards §8.10 · Production = slot board §8.11 · Buyer = persona toggle + proof cards + sticky CTA §8.7 · Confirmer = the ceremony §8.9 · Operator = tiles+queues §8.12)
- [ ] Exactly ONE primary (lime) CTA visible at any moment (§6 law 3; Radar: inspector XOR dock §8.2)
- [ ] Secondary content opens as bottom-sheet / inline / tab where the spec says — never a new page per tap (§7.5, §8.3)

## 3 · CONTENT / LEXICON (§4 · §6)
- [ ] Every term = §4 canon, EN + HE both (no invented terms; אמרגן never = buyer; method labels exactly §4.4)
- [ ] No technical/internal language on user surfaces (§6 law 4); warm invitations, never verdicts (§4.5/§6.8)
- [ ] The RIGHT view for the entity: artist surfaces = whole truth + coaching; buyer surfaces = strengths only, gaps/coaching **absent from the DOM**; NEITHER ranks a person (two-view law, inspector #6)
- [ ] Strings fit their containers with the LONGEST EN and HE value (L-8 fit law)

## 4 · FIT (L1 — the layer that stops phone defects)
- [ ] Rendered at **360px AND 1360px**; programmatic assertions run (`scripts/test-fit.mjs` for demo-reachable screens; the same assertions manually on live-shaped screens)
- [ ] Report the numbers: `truncated: N · overlaps: N · h-scroll: yes/no · taps<44 (excl .tap-target): N · primary CTAs: N`
- [ ] ALL zero / none / exactly-1 — anything else = the micro-task is NOT done

## 5 · INTERACTION STATES (§10.4 / §8.3 per-field DoD)
- [ ] Every editable field through its 7 states: empty · typing · invalid · saved · undo · loading · error-retry
- [ ] Probed with: empty · long value · Hebrew · URL · invalid
- [ ] Confirmed items re-open pre-filled (edit affordance); interrupted input resumes, never restarts

## 6 · A11Y (§10.5 / §10.7)
- [ ] Contrast ≥ 4.5:1 on text (tokens from §5 are pre-cleared; new pairings measured)
- [ ] `prefers-reduced-motion` respected on every animation this screen adds
- [ ] Keyboard: full completion possible; visible focus; menus/sheets close on Escape and return focus
- [ ] Screen-reader names on icon-only controls; status conveyed as text, not color alone

## 7 · FIREWALL (§2 — absolute)
- [ ] No score / rank / % / headcount / prediction / gauge about a person — any surface, any payload
- [ ] **Every band carries its method label** (T-59, permanent — a band never floats naked)
- [ ] Reaction reaching the artist = method-safe TEXT only (§2.5)
- [ ] Improvement framing = scene-standard OR own-history only — never "relative to others" (§2.9)
- [ ] `npm run verify` guardrail inspectors 1–6 green

## 8 · SIGNALS (§21.1 · §14.1.5)
- [ ] The screen fires its family's canon events (map row, §7.7.a last column) and they persist (`analytics_event`, is_demo honest)
- [ ] The events reach the operator surface where §8.12 lists them
- [ ] **A screen is not done if its signals are silent** — a canon-listed event with no call site = a FAIL, logged (an intentionally event-less screen cites the canon showing none is required)

## 9 · SELF-VERIFY (docs/HOW-TO-BUILD-A-TASK.md)
- [ ] L0–L5 run, results reported with numbers
- [ ] The rendered screen described in plain language AS IF WITNESSING IT AS THE OWNER — "would I flag this?" If yes as owner, it's a fail as builder
- [ ] Only then: status → witness batch. MOBILE/DESKTOP go green ONLY after the owner looks (rule 4)
