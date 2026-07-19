# ARTIST-UNIVERSE GAP REPORT — Radar coverage · Passport translation · display language
_T-53 · 18 Jul 2026 · owner-ordered research ("research the old docs + your docs, identify the gaps we didn't identify"). Sources: Drive canon (B4-20.50 Sheet 22 tabs · B4-35.50 v1.9 · The Universal Artist Passport [superseded] · CODEX value-engine handoff v1.6.13) + repo (docs/registry/F1.csv · radarUniverse.js · passportKit.jsx · ENTITY-STRUCTURE audit · RADAR-SOURCE-ARCHITECTURE · ARTIST-PROGRESSION-SPEC · A9 brief)._

## 0. Headline

**The artist universe is fully documented — and almost none of it is wired.** Three layers exist and do not talk to each other:

| Layer | Where | Scale | State |
|---|---|---|---|
| Taxonomy (9 axes) | Drive Sheet B4-20.50 (22 tabs) | 6 families · 55 subtypes · 18 segments × R/C/S/N-A grid · AR01–AR24 activation rules · 32 DJ spec. · 42 instruments · 64 genres · 35 market labels | CURRENT canon, L2 field-grain partially open |
| Field registry | **`docs/registry/F1.csv` (483 rows / 376 fields) + F2-F6-DELTAS.csv (337)** | 18 segments → 6 planets, per-field visibility + applicability + freshness + consent + method ceiling | **EXISTS IN-REPO** — contradicts the "Registry B empty" claim in TAXONOMY-REGISTRY-AUDIT + spec §16.A |
| App | `src/lib/radarUniverse.js` · `passportKit.jsx` | ~20 hand-built nodes; Passport renders ~12 field types | Hand-built DJ case (audit D4); registry-blind; DB has no `field_id` |

**Radar renders ≈5% of the documented universe. The public Passport renders ≈12 of 96 passport-eligible fields (~13%).** That is the mechanical reason the Passport reads as a "headcount output": the only rich wired content is draw bands + a community band.

## 1. Radar universe coverage — the planet-by-planet delta

The 6 planets CAN host the whole universe — F1.csv already maps all 18 segments onto them; no new planet is required. What is missing is depth (nodes) per planet:

| Planet | Built nodes today | Documented segments (fields) | Fully-unwired segments |
|---|---|---|---|
| identity | photo · one-line · genre · goal · fallback links (≈5) | Identity & Entity Resolution (31) · Positioning & Brand (21) · Creative Quality (14) = **66** | Positioning & Brand (logo/wordmark/palette/bios/press kit/brand story) · Creative Quality (signature sound, gateway clip, full-set video, show concept) |
| music | streaming links + 1 suggestion | Catalogue/Repertoire (17) · Streaming Consumption (13) = **30** | releases, labels/credits, ISRC, playlists, top-cities bands — all |
| live | video links · freq/lineup claims · track-record count | Live Footprint (14) · Technical & Production (30) = **44** | residency, repeat-booking/invited-back, stage plot, full tech pack, crew, changeover |
| audience | social links · community band · community claims | Fanbase (21) · Social/Content Engine (26) · Owned Community/CRM (17) = **64** | all per-platform presence/engagement bands · content engine · WhatsApp/Telegram/Discord/email bands · community→ticket evidence |
| prokit | set-length · regions · rider · invoice · WhatsApp (5) | Business/Legal/Rights (25) · Team/Management (33) · Monetization (28) = **86** | legal entity, agreements, insurance, team/authority map, fee/revenue bands |
| proof | claims + 3 draw bands + 1 suggestion | Ticketing/Draw (16) · Booking Market (22) · Reputation/Reviews (13) · Network (13) · Career History (22) = **86** | testimonials/references/reliability confirmations · industry relationships · career timelines/milestones · press timeline · booking-market fields |

Dimensions the owner named that are documented but node-less: press · awards/milestones · releases & labels · collaborations · structured video assets · testimonials · gear · brand/visual assets. **Documented nowhere at all: education/training** (the registry itself lacks it — a genuine taxonomy gap; only DF12 Workshop/Clinic exists as a delivery format).

**Old-canon Radar areas with no planet home (B4-35.50 A9):** bookable offer · opportunity pitch · progress/history (progress exists as milestones M1–M8 but not as a Radar area). Also: the 9-axis configuration (family + subtype + act-config + delivery + commercial model + booking context + opportunity role + genre + overlays) — the app captures **2 of 9 axes** (act.format + genre).

## 2. The UPGRADE engine (recommendations) — designed vs built

- **BUILT:** `pickNextAction()` — a rule-based single next action with a why-line; genre note appended. This is a good v0 and is now spec'd (§8.2/§8.3 two-jobs + coaching line, T-51).
- **DESIGNED, NOT BUILT (ENTITY-STRUCTURE PART 3):** three intelligence pillars — (a) multi-source SCAN (target, disclosed in-development), (b) scene-context COMPARISON as words/bands never rank, (c) evidence-linked RECOMMENDATIONS ("a booking manager can't verify your draw → add a ticket export → upgrades this claim"). Bounded output law exists (canon: ≤3 prioritized recommendations, ONE measurable next action).
- **The registry is the missing fuel:** Registry B rows carry `next_action_rule`, `gap_rule`, `activation_rule`, `freshness_window` per field — the recommendation engine the owner wants ("smart advice per component") is designed to be REGISTRY-DRIVEN, not hand-coded. Wiring F1.csv → radarUniverse → coaching layer IS the build.

## 3. Passport — why it reads as "headcount" and what the canon already prescribes

Diagnosis: `deriveSections()` produces only exp-items / links / draw-claims / draw-bands / readiness-chips / community-band. The four persona views re-order the SAME thin set. **~84 of 96 passport-eligible fields (F1.csv `visibility`) never reach the buyer** — entire absent classes: catalogue & releases · creative-quality clips (gateway live clip, full-set video) · positioning/brand assets · testimonials & published reviews · reliability confirmations · network/affiliations · career timeline & milestones · press.

The canon already contains the cure (never implemented):
1. **Proof Unit anatomy** (B4-35.50): claim + context + method label + reviewed date — the atomic Passport unit, not a bare band row.
2. **The 30-second proof story** (B4-35.50 A15 hierarchy): identity → attributed-draw Proof Units → track record → catalogue/credibility → audience context → booking readiness → supported references → one sticky CTA.
3. **The three lenses** (The Universal Artist Passport, superseded doc — structure valid, numbers rejected): same universe, per-viewer translation — artist sees coaching · manager sees leverage · buyer sees risk-relief. Our 4 faces exist but only re-order; the lens idea = per-viewer *language + selection*, not just order.
4. **Minimum credible-Passport gate** (A11): ≥2 supported Proof Units incl. ≥1 live-demand/commercial; identity+bio+media+streaming alone never publishable. Documented, unbuilt.
5. Unbuilt honesty furniture: no-guarantee footer route · incorrect-information report per Proof Unit · freshness badge · richer professional action sheet (save/forward/future-fit/request-specific-proof/not-fit).

**"We are not an EPK but we are something":** the canon's answer — an EPK is self-authored marketing; the Passport is a **method-labeled, artist-approved proof story derived from the Radar universe**. Same content classes as an EPK (music, video, bio, press, testimonials) — every item carrying provenance. The content classes are what's missing today, not the concept.

## 4. Display language — where the % ban is load-bearing vs over-castrating

What canon ALREADY allows (no change needed): bands · binaries · dates · freshness · counts of the artist's own items ("14 lineup listings", "N of 8 milestones", "we found 2 things here") · absolute observations at small N · operator product-event counts (and % of product events with a valid denominator).
What is banned everywhere: numbers that grade the PERSON — score, %, percentile, rank, prediction, peer comparison. Sheet law: "Allowed numbers: band ranges, single-claim counts, dates, freshness windows, and R/C/S/N-A only."

**The owner's instinct is half right — and the canon itself says so:** "6 of 8 confirmed" and "75%" carry identical information; one is allowed, one is banned. That IS terminology. The ban's real load-bearing wall is narrower than its blanket phrasing:

| Zone | Verdict | Basis |
|---|---|---|
| Buyer-facing person-numbers, comparisons, predictions | **ABSOLUTE — keep** | The moat. Every canon layer independently bans it (firewall §2.1, Sheet forbidden-storage, B4-35.50 trust rules, Codex DoD). Break it and LOCK becomes another scoring site. |
| Artist-private SELF-progress (own checklist, own confirmations) | **Expressiveness gap is real — solvable without %** | X-of-Y counts, discrete-step progress rings (labeled by count, not %), per-planet "2 waiting · 3 confirmed", named waypoints. Same richness, zero canon change. |
| Artist-private completion **%** ("Radar 80% complete") | **OWNER DECISION — R-11** | Currently rejected in three places (§2.9 coverage-%, Codex forbidden list "profile-completion percentage", Sheet banned `completion_%`). Rationale on record: %-framing reads as a grade, leaks via screenshots, normalizes the score frame. If the owner rules to allow it: artist-private only · self-progress only (own confirmed/total-applicable, N/A excluded) · never per-planet quality · never buyer-facing · never comparative — and §2.9, DS law, and the guardrail inspector get amended in lockstep. |
| Scene/context facts as numbers | Allowed as bands + method labels today | e.g. room capacities, price bands — facts about rooms/scenes, not grades of the person. |

**Recommendation:** solve the expressiveness with the middle row (count-based progress vocabulary — immediately, no ruling needed) and put R-11 to the owner as a clean yes/no on the artist-private % specifically. Never buyer-side.

## 5. Gaps in our own documentation (the "gaps we didn't identify")

1. **Registry B is NOT empty — and four schemas compete.** F1.csv (15 cols, in-repo, 376 fields) vs spec §16.A.5b (5 cols, written T-51 believing Registry B empty) vs Sheet B01–B24 (24 cols) vs the Sheet's 14-col sample header. One canonical schema must be ruled; recommendation: F1.csv's practical 15-col shape, extended with `next_action_rule`/`freshness_window`/`why_a_buyer_cares` from B01–B24, and §16.A.5b updated to point at it.
2. **Certainty vocabulary conflict (Sheet G4, still unresolved):** Claims-Schema ladder (COUNTERPARTY_CONFIRMED > ARTIFACT_SUPPORTED > OAUTH_VERIFIED > SELF_REPORTED > SELF_CONFIRMED_FROM_WEB) vs Registry-B 10-value provenance set vs DB `verification_status` (4 values). Needs one reconciliation ruling before field-grain fill.
3. **Brief↔workbook count drifts:** CM01–10 vs 12 · BC01–10 vs 24 · OR01–10 vs 18 · O1–10 vs 12 · AR01–11 vs 24 — the brief undercounts the workbook everywhere.
4. **Education/training absent from the entire universe model** (see §1).
5. **Segment-name drift:** Sheet #18 "Career Trajectory & Opportunity Fit" ↔ F1.csv "Observed Career History & Change"; Sheet #10 "…Event Economics" ↔ F1.csv "…Event Evidence".
6. **DB representation still zero** (audit D1 stands): no `field_id`, `claim_type` free text — the ≥038 taxonomy migration (§16.A.6.a) is the unlock for everything above.
7. Spec §8.2 planet/node table documents only the built nodes — it never cites F1.csv as the target node source; §8.4 never cites the A15 proof-story hierarchy or the minimum credible-Passport gate.

## 6. Proposed plan (pending owner rulings where marked)

- **P-A (no ruling needed): spec update** — §8.2 names F1.csv as the registry the planets must derive from (registry-driven nodes = the target; hand-built = the built); §8.4/§8.7 absorb Proof-Unit anatomy + 30-second proof-story hierarchy + minimum credible-Passport gate + the per-viewer lens principle; §16.A reconciles Registry B reality (schema unification proposal); count-based progress vocabulary added to §5.10.
- **P-B (owner): R-11 display-language ruling** — artist-private completion %: yes/no (see §4). If yes, lockstep amendments listed there.
- **P-C (owner): T-49 Passport brief** — this report + §3 is decision material; the owner said she will update what she wants; the proof-story + lenses direction awaits her taste ruling before design.
- **P-D (owner): Registry schema + certainty ladder rulings** (§5.1–5.2) + the 4 Sheet R00 decisions (family build order · F6 in scope? · secondary family? · radar_segments tab).
- **P-E (build, after P-A):** wire registry→Radar incrementally (planet by planet, F1 first), registry-driven coaching (`next_action_rule`), Passport content classes (releases/video/testimonials/press as Proof Units) — sequenced into waves after the ≥038 migration is authorized and applied.
