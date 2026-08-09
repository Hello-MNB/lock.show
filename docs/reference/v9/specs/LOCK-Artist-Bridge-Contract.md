# LOCK.SHOW — Artist Bridge & Readiness Contracts (A0·A1·A3·A5·A6·A7 · 9 Aug 2026)
Adopted per the revised Artist-vertical directive. Labels: ✅ VERIFIED · 📜 SOURCE-DERIVED · 📋 SPECIFIED NOT BUILT · ⚙ ENGINEERING REVIEW REQUIRED · ❓ UNKNOWN · 🟨 DECISION REQUIRED (Maria)

## A0 · RADAR → PASSPORT Information Bridge (representative trace: "radiOzora Lunar 604 live set")
| # | Stage | Canonical state | User sees | Artist action | Next state | Source/freshness | Permission | Eng |
|---|---|---|---|---|---|---|---|---|
| 1 | Discovery | claim `candidate` | scan feed row "radiOzora set found" | none yet | candidate | radiOzora · scan date | private | ✅ |
| 2 | Radar rep. | candidate chip in Stage category | "possible match — confirm it's yours" | Confirm / Correct / Not mine | confirmed \| corrected \| hidden | method label + date | private | ✅ |
| 3 | Interpretation | `derived` rows | quiet method label "Built from your confirmed facts" | inspect (A4 cue) | — | derivation | private | ✅ |
| 4 | Private state | confirmed claim | PRIVATE pill on Radar | none | — | — | artist-only | ✅ |
| 5 | Passport eligibility | confirmed + non-conflicted + fresh | appears in Composer section (Live) | section switch ●/◐/○ | eligible→selected | inherits | artist | ✅ UI · storage ⚙ |
| 6 | Composer use | selected in draft vN+1 | media row in HEAR THE ACT | reorder/hide | draft | — | artist | ✅ |
| 7 | Exact Preview | draft render | real recipient renderer | continue/back | previewed | — | artist | ✅ |
| 8 | Publish Review | diff vs live vN | "NEW — live footage leads the booker view" | Publish | published vN+1 | immutable version | artist | ✅ UI · version store ⚙ |
| 9 | Published | live version | recipient sees it; Radar unchanged | — | — | — | per policy | ✅ |
**Bridge verdict:** every transition has a user-visible representation without object terminology ✅. Gaps: eligibility rule surfacing when a fact goes stale AFTER publish (nudge exists; per-fact "published vs newer" cue 📋).

## A1 · On-request lifecycle — export + proposal
**Exists today ✅:** fee = tri-state pill ◐ ON REQUEST in Composer; recipient sees "available on request" text; nothing requestable end-to-end.
**Proposed UX (📋, storage/notify ⚙):** recipient taps "Request fee guidance" → bounded request object {field, recipient, view, ts} → artist Inbox kind `disclosure` (Needs reply) → artist Approve-for-this-recipient / Decline politely / Make always-shown → recipient link updates with reveal or polite decline; receipt both sides; auto-expire 14d → recovery "ask again". Authority: artist-only decision; rep may draft per 🟨 A3 card. **Rule kept:** PAT-VIS3 stays a truthful indicator now; no fake request button until object exists — recipient CTA marked ⚙.

## A3 · Reply-authority decision card 🟨 (blocks 2 of 6 inbox routes)
Scenarios to rule on — pick per row: artist-only / rep-drafts-artist-sends / rep-sends-as-agency / rep-sends-as-artist(disclosed):
1. No representative → artist replies (only option) ✅ built.
2. Active full mandate, booking scope → ? (recommend: rep-sends-as-agency, sender shown "Zion 604 for SHIDAPU")
3. Limited mandate (territory/scope outside enquiry) → ? (recommend: artist-only + rep sees read-only)
4. Draft-only authority (assistant seat) → drafts require approval ✅ pattern exists (approve modal)
5. Send authority (agent seat) → per mandate scope
6. Mandate expired/revoked mid-thread → thread locks for rep, artist notified (recommend)
7. Sender identity shown to buyer → always disclosed ("via Zion 604") — recommend non-negotiable.
**DoD:** Maria returns one choice per row; routes 5–6 of Inbox then build in one pass.

## A5 · First Viewport Contracts (390px · validated 320/360/430 by inspection)
| Anchor | Persistent shell | Context | Conclusion/meaning | Primary action | Deliberately below fold |
|---|---|---|---|---|---|
| Onboarding | top bar | LOCK + step | "least you can share to see the magic" | Continue | context fields |
| Scan | top bar | act name | phase label + live find feed | (auto) | source rows |
| Radar | bar+nav | act header + PRIVATE | conclusion sentence | Next Move Go › | universe, views |
| Category WS | back header | category + state chip | category conclusion | blocking decision (if any) | groups, sources |
| Library | bar+nav | "Your professional views" | LIVE NOW group | Preview (first card) | history, links |
| Composer | back header | recipient + LIVE/DRAFT chip | hero preview card | first section | later sections, footer CTA visible via sticky |
| Exact Preview | recipient bar + banner | EXACT PREVIEW — WHO | the render itself | Continue to review | rest of render |
| Publish Review | back header | title | first diff row | Publish (after scroll ≤1) | metadata |
| Share | back header | bound view name | "link opens that view only" | Copy link | history |
| Inbox | bar+nav | state tabs | first Needs-reply card | card's one action | filters wrap, Done |
All verified at 390 ✅; 320 line-wrap risk only on Composer hero (accepted, text-wrap pretty).

## A6 · Responsive chip-collection rule (replaces fixed ≤8)
Rule: chip collections wrap to max 3 lines at current width; beyond that render "+N more" expander; semantic grouping (families → their subtypes) takes precedence over count. Applied to subtype picker 📋 (currently ≤2 lines at 390 with real data — no expander triggered; rule registered in DS Registries §1 as PAT-CHIP-OVERFLOW).

## A7 · Experience vs Implementation readiness
| Capability | Experience | Implementation |
|---|---|---|
| Version history + restore | ✅ designed | ⚙ version store |
| On-request lifecycle | 📋 proposed (A1) | ⚙ request object + notify |
| Share bind/expiry/revoke | ✅ designed | ⚙ link service |
| Deep links + permission states | ◐ demo screen | ⚙ router + auth |
| Inbox routing 6/6 | 4 ✅ · 2 🟨 (A3 card) | ⚙ thread projections |
| Multi-Act identity isolation | ✅ demoed | ⚙ act_id scoping tests |

## Remaining product decisions: A3 card 🟨 · secondary artist family storage 🟨 · Show-Day activation ⚙.
## Claude Code questions: version store · request/disclosure object · link service · router/back · thread projection · act_id isolation tests.
