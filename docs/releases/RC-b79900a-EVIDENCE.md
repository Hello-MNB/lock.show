# RC EVIDENCE PACKAGE — b79900a (T-97 + T-97.1 visual wave)

Compiled 2026-07-27 on branch `claude/b4-gigproof-discovery-e7749o` at
`b79900ab4f20bdf809851a689301dd6d9786c8ff` (working tree clean).
Evidence-only document — no implementation, no redesign, no baseline changes
were made while compiling it. **Nothing has been deployed.**

Token legend (from `website-next/app/globals.css`):
`paper` #f3f5ef · `ink` #0a0d0b · `night`/`forest` #18221a · `mist` #dde3d9 ·
`stamp` (lime) #c8f04d · seam hairline #2a342d (rgb 42,52,45).
Section sequences below are the rendered post-fix order at 1440×900 from the
T-97.1 audit (`t971/audit.json`, rendered from the static export of this tree),
cross-read against the source of every `app/*/page.tsx`.

---

## 1 · ADJACENCY MATRIX — all 15 routes

Justification pattern for every dark|dark boundary that remains:
**rotation pair** (the two adjacent dark containers use *different* dark tokens,
ink vs night vs veiled photo) **+ seam** (a structural 1px hairline marks the
boundary — footer `borderTop: 1px solid #2a342d` site-wide; radar section seam).

### 1.1 `/` home — `app/page.tsx` — CHANGED (3 hunks + footer seam)

| # | Section (source comment) | Surface token | Card token (where relevant) |
|---|---|---|---|
| 1 | HERO — `<Hero variant="feature">` | full-bleed photo + ink-tint gradient `rgba(10,13,11,.95→.82…)` (dark) | Passport preview card `rgba(10,13,11,0.62)` glass |
| 2 | FIREWALL BANNER | white `#ffffff`, hairline bottom `rgba(10,13,11,0.1)` | — |
| 3 | THREE ACTORS ("Who It's For") | paper | persona cards paper w/ photo thumbs |
| 4 | PROOF UNIT DEMO ("What A Claim Looks Like") | night, hairlines t/b #2a342d | proof-unit cards `rgba(243,245,239,0.04)` |
| 5 | HOW IT WORKS | paper | — |
| 6 | TRUST STATEMENT ("The Design Principle") | **night** (was ink), hairlines t/b `rgba(243,245,239,0.1)` | lime CTA `stamp` + ghost CTA border `rgba(243,245,239,0.3)` |
| 7 | FINAL CTA ("The next room is waiting.") | **ink** (was night) | lime CTA `stamp` |
| 8 | footer — `components/footer.tsx` | night + **new seam** `#2a342d` | newsletter card `rgba(255,255,255,0.03)` |

- Pre-fix finding: FINAL CTA (night) sat directly on the footer (night) — same
  tone, invisible boundary; the dark tail read as one undifferentiated slab.
- Post-fix result: dark tail rotates **night(6) → ink(7) → night(footer)**; no
  two adjacent dark containers share a tone; footer seam added.
- Changed: yes — §6 ink→night, §7 night→ink, footer seam.
- Remaining dark adjacencies: §4 night is flanked by paper (no dark pair).
  §6 night | §7 ink = rotation pair + §6's own bottom hairline `rgba(243,245,239,0.1)`.
  §7 ink | footer night = rotation pair + seam #2a342d. Hero(photo) | §2 white = light boundary, n/a.

### 1.2 `/artists` — `app/artists/page.tsx` — NOT CHANGED (footer seam only)

| # | Section | Surface token | Card token |
|---|---|---|---|
| 1 | HERO — `<Hero variant="feature">` | photo + `rgba(10,13,11,0.55→0.97)` veil (dark) | — |
| 2 | PAIN ("SOUND FAMILIAR?") | paper, mist hairlines t/b | cards white `#ffffff` on mist rail |
| 3 | TWO TOOLS ("WHAT YOU GET") | white | tool cards paper, chips `rgba(10,13,11,0.05)`; sample proof unit |
| 4 | HOW IT WORKS | paper, mist hairlines | step chips `rgba(10,13,11,0.06)` |
| 5 | CLOSING CTA ("CLOSED BETA · ISRAEL") | live-crowd photo under dark veil | lime CTA `stamp` |
| 6 | footer | night + **new seam** | — |

- Pre-fix finding: none on-page; §5 (dark image) met the night footer with no
  structural boundary.
- Post-fix result: unchanged sections; footer seam now marks the §5|footer edge.
- Remaining dark adjacency: §5 photo-veil | footer flat night = rotation pair
  (textured photo vs flat night — distinct surfaces) + seam #2a342d.

### 1.3 `/bookers` — `app/bookers/page.tsx` — NOT CHANGED (footer seam only)

| # | Section | Surface token | Card token |
|---|---|---|---|
| 1 | HERO — `<Hero variant="feature">` | photo + ink veil (dark) | lime CTA `stamp` |
| 2 | THE RISK ("THE NIGHT YOU'RE PROTECTING") | paper, mist hairline b | card paper inside `rgba(10,13,11,0.08)` frame |
| 3 | EVIDENCE ANCHOR IMAGE | white | photo block |
| 4 | WHAT YOU SEE IN THE PASSPORT ("WHAT YOU OPEN") | paper | — |
| 5 | WHAT LOCK DOESN'T PROMISE ("IMPORTANT TO KNOW") | night, hairlines t/b #2a342d | — |
| 6 | CTA ("The next link you get deserves two minutes.") | paper | lime CTA `stamp` |
| 7 | footer | night + **new seam** | — |

- Pre/post: no dark|dark pair exists (§5 night is flanked by paper; footer is
  preceded by paper §6). Footer seam is defensive only. No remaining dark adjacency.

### 1.4 `/producers` — `app/producers/page.tsx` — NOT CHANGED (footer seam only)

| # | Section | Surface token | Card token |
|---|---|---|---|
| 1 | HERO — `<Hero variant="feature">` | photo + ink veil (dark) | — |
| 2 | THE FAVOR | paper | card paper in `rgba(10,13,11,0.08)` frame; firewall callout `rgba(200,240,77,0.04)` |
| 3 | WHY YOUR WORD MATTERS | white, mist hairlines t/b | night mini-panel inside |
| 4 | TWENTY SECONDS, START TO FINISH | paper | lime CTA `stamp` |
| 5 | footer | night + **new seam** | — |

- Pre/post: footer preceded by paper — no dark adjacency; seam defensive only.

### 1.5 `/how-it-works` — `app/how-it-works/page.tsx` — NOT CHANGED (footer seam only)

| # | Section | Surface token | Card token |
|---|---|---|---|
| 1 | HERO — `<Hero variant="standard">` | photo + veil (dark) | — |
| 2 | THREE PLAYERS | paper, mist hairline b | cards white; note chip `rgba(200,240,77,0.08)` |
| 3 | STEP BY STEP | white | timeline markers `stamp` / mist |
| 4 | GROUND RULES | paper, mist hairline t | white rule cards |
| 5 | CLOSING CTA ("Your first night takes two minutes to log.") | photo under dark veil | lime CTA `stamp` |
| 6 | footer | night + **new seam** | — |

- Remaining dark adjacency: §5 photo-veil | footer night = rotation pair
  (photo vs flat night) + seam #2a342d.

### 1.6 `/methodology` — `app/methodology/page.tsx` — CHANGED (1 hunk + footer seam)

| # | Section | Surface token | Card token |
|---|---|---|---|
| 1 | HERO — `<Hero variant="standard">` | photo + veil (dark) | — |
| 2 | METHOD LABELS | paper | label cards |
| 3 | CLAIM PIPELINE ("HOW A CLAIM GETS THERE") | night | pipeline steps |
| 4 | FIREWALL RULES ("THE GROUND RULES") | paper | — |
| 5 | WHAT WE DON'T DO ("And what LOCK will never do.") | white, mist hairline t | — |
| 6 | CLOSING CTA ("See it in practice.") | **ink** (was night) | lime CTA `stamp` + ghost border `rgba(243,245,239,0.22)` |
| 7 | footer | night + **new seam** | — |

- Pre-fix finding: §6 (night) on footer (night) — same tone, no boundary.
- Post-fix result: §6 → ink; tail reads white → ink → night.
- Remaining dark adjacencies: §3 night flanked by paper (no pair).
  §6 ink | footer night = rotation pair + seam #2a342d.

### 1.7 `/pricing` — `app/pricing/page.tsx` — CHANGED (1 hunk + footer seam)

| # | Section | Surface token | Card token |
|---|---|---|---|
| 1 | HERO — `<Hero variant="primary">` | photo + veil (dark) | — |
| 2 | THE FOUR ANSWERS | paper | answer cards |
| 3 | NOT FOR SALE ("THE ONE PERMANENT PROMISE") | night | — |
| 4 | AFTER THE PILOT | paper, mist hairline b | — |
| 5 | PRICING FAQ | white | — |
| 6 | DARK CLOSING CTA ("The pilot is open. The price is your time.") | **ink** (was night) | lime CTA `stamp` |
| 7 | footer | night + **new seam** | — |

- Pre-fix finding: §6 (night) on footer (night) — same tone.
- Post-fix result: §6 → ink.
- Remaining dark adjacencies: §3 night flanked by paper (no pair).
  §6 ink | footer night = rotation pair + seam #2a342d.

### 1.8 `/faq` — `app/faq/page.tsx` — CHANGED (1 hunk + footer seam)

| # | Section | Surface token | Card token |
|---|---|---|---|
| 1 | PAGE HEADER — `<Hero variant="compact">` | paper (transparent over main paper), hairline b `rgba(10,13,11,0.08)` | — |
| 2 | FAQ SECTIONS ("WHAT IT IS" …) | white | accordion rows |
| 3 | STILL HAVE QUESTIONS? | **ink** (was night) | lime CTA `stamp` + ghost border `rgba(255,255,255,0.2)` |
| 4 | footer | night + **new seam** | — |

- Pre-fix finding: §3 (night) on footer (night) — same tone.
- Post-fix result: §3 → ink.
- Remaining dark adjacency: §3 ink | footer night = rotation pair + seam #2a342d.

### 1.9 `/contact` — `app/contact/page.tsx` — CHANGED (1 hunk + footer seam)

| # | Section | Surface token | Card token |
|---|---|---|---|
| 1 | PAGE HEADER — `<Hero variant="compact">` | paper, hairline b `rgba(10,13,11,0.08)` | — |
| 2 | CONTACT GRID ("SEND A MESSAGE") | white | waitlist form; info column |
| 3 | CTA BAND ("Ready to start without waiting?") | **ink** (was night) | ghost CTA border `rgba(243,245,239,0.35)` |
| 4 | footer | night + **new seam** | — |

- Pre-fix finding: §3 (night) on footer (night) — same tone.
- Post-fix result: §3 → ink.
- Remaining dark adjacency: §3 ink | footer night = rotation pair + seam #2a342d.

### 1.10 `/radar` — `app/radar/page.tsx` — CHANGED (1 hunk: section seam + footer seam)

| # | Section | Surface token | Card token |
|---|---|---|---|
| 1 | PAGE HEADER — `<Hero variant="standard">` | paper, hairline b `rgba(10,13,11,0.08)` | — |
| 2 | WHAT IT IS ("WHAT THE RADAR DOES") | white | — |
| 3 | DIMENSIONS ("WHAT'S INSIDE") | paper (main bg) | dimension cards |
| 4 | ATMOSPHERE BAND ("YOUR WORK, IN ORDER") | photo under dark veil, ends in near-ink | — |
| 5 | EVIDENCE STATES ("WHERE THINGS STAND") | night + **new seam top** `#2a342d` | state rows |
| 6 | RADAR VS PASSPORT | paper | comparison table (h-scroll on narrow) |
| 7 | CTA ("START BUILDING") | ink (pre-existing — NOT changed in b79900a) | lime CTA `stamp` |
| 8 | footer | night + **new seam** | — |

- Pre-fix finding: §4's veil ends near-ink and bled invisibly into the flat
  night of §5 — no structural boundary where the photo stops.
- Post-fix result: `borderTop: 1px solid #2a342d` on §5 marks the seam.
- Remaining dark adjacencies: §4 photo | §5 night = rotation pair (photo vs
  flat night) + the new seam. §7 ink | footer night = rotation pair + footer seam.
  §5 night | §6 paper = light boundary, n/a.

### 1.11 `/passport/demo` — `app/passport/demo/page.tsx` — NOT CHANGED (footer seam only)

| # | Section | Surface token | Card token |
|---|---|---|---|
| 1 | DEMO BANNER | `stamp` #c8f04d strip (fictional-sample disclosure) | — |
| 2 | PASSPORT DOCUMENT ("Maya Vale") | paper doc-card, hairlines `rgba(10,13,11,0.08)` | passport card on paper |
| 3 | footer | night + **new seam** | — |

- Pre/post: footer preceded by paper — no dark adjacency; seam defensive only.

### 1.12–1.14 `/privacy` · `/terms` · `/accessibility` — `components/legal-document.tsx` — NOT CHANGED (footer seam only)

| # | Section | Surface token | Card token |
|---|---|---|---|
| 1 | PAGE HEADER — `<Hero variant="compact" legal>` | paper, hairline b `rgba(10,13,11,0.08)` | — |
| 2 | DRAFT NOTICE | paper | amber card `rgba(217,119,6,0.07)` border `rgba(217,119,6,0.28)` |
| 3 | numbered prose sections | paper | — |
| 4 | footer | night + **new seam** | — |

- Pre/post: no dark adjacency; seam defensive only. (Same structure ×3 routes.)

### 1.15 `/404` — `app/not-found.tsx` — NOT CHANGED (footer seam only)

| # | Section | Surface token | Card token |
|---|---|---|---|
| 1 | `<main>` (404 · "This page moved on.") | transparent over body bg = **night** (globals.css body) | — |
| 2 | footer | night + **new seam** | — |

- Pre-fix finding: night main on night footer — same tone, invisible boundary
  (called out in the footer.tsx seam comment: "image CTA bands, 404, ink CTAs").
- Post-fix result: seam #2a342d separates them.
- Remaining dark adjacency: main night | footer night = **same token pair; the
  justification is the seam alone** — this is the one boundary carried entirely
  by the structural hairline, which is exactly what the site-wide footer seam
  exists for.

**Matrix summary:** 6 routes changed (home, pricing, methodology, faq, contact,
radar) + footer seam affecting all 15. 9 routes had no on-page change. After
the fix no two adjacent dark containers share a tone anywhere except 404 main |
footer (both night), where the seam carries the boundary.

---

## 2 · AFFECTED-ROUTE EVIDENCE INDEX

24 screenshots copied to `docs/releases/rc-b79900a-shots/` from the T-97.1
render sets (`t971/before` = tree at 8d10df5 pre-fix, rendered 20:21 UTC;
`t971/after` = tree at b79900a, rendered 20:26 UTC; static export, 1440×900 and
390×844, consent denied, animations frozen).

| Route | 1440 before | 1440 after | 390 before | 390 after |
|---|---|---|---|---|
| home | `home-1440-before-b79900a.png` | `home-1440-after-b79900a.png` | `home-390-before-b79900a.png` | `home-390-after-b79900a.png` |
| pricing | `pricing-1440-before-b79900a.png` | `pricing-1440-after-b79900a.png` | `pricing-390-before-b79900a.png` | `pricing-390-after-b79900a.png` |
| methodology | `methodology-1440-before-b79900a.png` | `methodology-1440-after-b79900a.png` | `methodology-390-before-b79900a.png` | `methodology-390-after-b79900a.png` |
| faq | `faq-1440-before-b79900a.png` | `faq-1440-after-b79900a.png` | `faq-390-before-b79900a.png` | `faq-390-after-b79900a.png` |
| contact | `contact-1440-before-b79900a.png` | `contact-1440-after-b79900a.png` | `contact-390-before-b79900a.png` | `contact-390-after-b79900a.png` |
| radar | `radar-1440-before-b79900a.png` | `radar-1440-after-b79900a.png` | `radar-390-before-b79900a.png` | `radar-390-after-b79900a.png` |

Plus 4 hero-history shots for §7 Option C:
`radar-1440-t97phase1-before-hero.png`, `radar-1440-t97phase2-after-hero.png`,
`terms-1440-t97phase1-before-hero.png`, `terms-1440-t97phase2-after-hero.png`
(from the T-97 phase-1 audit set rendered 18:49 UTC and the post-phase-2 set
rendered 19:25 UTC).

---

## 3 · CONTRAST TABLE — changed surfaces

Method: ratios computed with the WCAG 2.x relative-luminance formula from the
design tokens and the exact rgba() values in source, alpha-composited over
their actual backgrounds — identical to measuring the rendered flat-color
pixels (verified: the audit's rendered rgb values match the tokens exactly).
Thresholds: **4.5** normal text · **3.0** large text (≥24px / ≥18.66px bold)
and UI components/graphical objects (WCAG 1.4.11).

**The 6.71:1 figure, verified:** it is the home FINAL-CTA secondary line
("Closed beta — Israeli artists only…") — paper at 60% opacity,
`rgba(243,245,239,0.6)`, composited over the ink band #0a0d0b → rendered pixel
rgb(150,152,148) → **6.71:1** against ink (float-precision compositing gives
6.72:1; the integer-rounded rendered pixel gives exactly 6.71:1). Pre-fix the
same line sat on night and measured 6.19:1 — the swap to ink *raised* it.

| Element | fg | bg | Ratio | Threshold | Verdict |
|---|---|---|---|---|---|
| CTA-band h2 (home/pricing/faq/contact/methodology) | paper #f3f5ef | ink | 17.78:1 | 3.0 (large) | PASS |
| Home final-CTA secondary line | paper @0.60 → rgb(150,152,148) | ink | 6.71:1 | 4.5 | PASS |
| contact/faq secondary line | white @0.65 | ink | 8.41:1 | 4.5 | PASS |
| pricing/methodology secondary line | paper @0.72 | ink | 9.34:1 | 4.5 | PASS |
| methodology em accent / CTA eyebrows | stamp #c8f04d | ink | 14.90:1 | 4.5 | PASS |
| Home trust-band h2 | paper | night | 14.91:1 | 3.0 (large) | PASS |
| Home trust-band secondary line | paper @0.65 | night | 7.02:1 | 4.5 | PASS |
| Home trust-band eyebrow | stamp | night | 12.50:1 | 4.5 | PASS |
| **Lime CTA normal** (text on button) | ink | stamp #c8f04d | 14.90:1 | 4.5 | PASS |
| **Lime CTA hover** (`a:hover { filter: brightness(1.14) }` — brightens fg+bg together) | ink×1.14 | stamp×1.14 | 17.23:1 | 4.5 | PASS |
| **Lime CTA active** (brightness 0.97) | ink×0.97 | stamp×0.97 | 14.01:1 | 4.5 | PASS |
| **Lime CTA focus** (`:focus-visible` 2px stamp ring, offset 2) vs ink band | stamp | ink | 14.90:1 | 3.0 (UI) | PASS |
| Lime CTA focus ring vs night band | stamp | night | 12.50:1 | 3.0 (UI) | PASS |
| Lime button (as bg block) vs ink band | stamp | ink | 14.90:1 | 3.0 (UI) | PASS |
| Ghost CTA text (contact, methodology, home trust) | paper | ink / night | 17.78 / 14.91:1 | 4.5 | PASS |
| Ghost CTA text (faq secondary) | white @0.70 | ink | 9.65:1 | 4.5 | PASS |
| Ghost CTA **border**, contact | paper @0.35 | ink | **2.98:1** | 3.0 (UI) | **BELOW — 2.98 < 3.0** |
| Ghost CTA **border**, home trust | paper @0.30 | night | **2.57:1** | 3.0 (UI) | **BELOW** |
| Ghost CTA **border**, methodology | paper @0.22 | ink | **1.86:1** | 3.0 (UI) | **BELOW** |
| Ghost CTA **border**, faq | white @0.20 | ink | **1.79:1** | 3.0 (UI) | **BELOW** |
| Footer body text | white @0.70 | night | 8.61:1 | 4.5 | PASS |
| Footer links | paper @0.70 | night | 7.92:1 | 4.5 | PASS |
| Footer column headings | paper @0.55 | night | 5.42:1 | 4.5 | PASS |
| Footer seam hairline | #2a342d | night | 1.27:1 | none (decorative separator) | n/a — stated |
| Radar section seam | #2a342d | night | 1.27:1 | none (decorative separator) | n/a — stated |
| Seam vs ink CTA above it | #2a342d | ink | 1.51:1 | none (decorative) | n/a — stated |
| Home trust-band hairlines | paper @0.10 | night | 1.33:1 | none (decorative) | n/a — stated |
| Band-to-band tone step (the rotation itself) | ink | night | 1.19:1 | none (adjacent surfaces, not text/UI) | n/a — stated |

**Stated, not hidden:** the four ghost-button *borders* measure below the 3.0
non-text threshold (2.98 / 2.57 / 1.86 / 1.79). These borders are pre-existing
styling (not introduced or altered by b79900a — the recolor to ink slightly
*raised* three of them vs their old night background). Under WCAG 1.4.11 the
component is identified by its text label, which passes at 9.65–17.78:1, and
by the 12.5–14.9:1 focus ring; the low-contrast border is a supplementary
decoration. If the owner wants strict 1.4.11 border conformance, raising the
four border alphas to ≥0.42 on ink / ≥0.47 on night is a follow-up item — it
is NOT part of this RC. The seams and hairlines (1.27–1.51:1) are decorative
separators with no conformance threshold; they are listed for completeness.
The 620-line "6.71:1" question is answered above. No text or interactive
element on any changed surface falls below its AA threshold in any state
(normal / hover / active / focus).

---

## 4 · EXACT CHANGE LIST — `git show b79900a --stat`

```
 website-next/app/contact/page.tsx                  |   4 +++-
 website-next/app/faq/page.tsx                      |   4 +++-
 website-next/app/methodology/page.tsx              |   4 +++-
 website-next/app/page.tsx                          |  12 ++++++++----
 website-next/app/pricing/page.tsx                  |   4 +++-
 website-next/app/radar/page.tsx                    |   5 ++++-
 website-next/components/footer.tsx                 |   4 ++++
 website-next/visual-baseline/*.png                 |  28 binary files re-seeded
 35 files changed, 28 insertions(+), 9 deletions(-)
```

Per-file hunk → remediation-item mapping (wording resolved):

**Remediation item A — "token swaps": the night↔ink section-bg swaps across
5 page files, of which the home trust swap is the counter-rotation.** Six
`var(--color-night)`/`var(--color-ink)` value swaps in 7 hunks across 5 files:

| File | Hunk (post-image line) | Change |
|---|---|---|
| `app/contact/page.tsx` | @@ -238 (CTA BAND) | `night` → `ink` + law comment |
| `app/faq/page.tsx` | @@ -242 (STILL HAVE QUESTIONS?) | `night` → `ink` + law comment |
| `app/methodology/page.tsx` | @@ -472 (CLOSING CTA) | `night` → `ink` + law comment |
| `app/pricing/page.tsx` | @@ -626 (DARK CLOSING CTA) | `night` → `ink` + law comment |
| `app/page.tsx` | @@ -1090 (TRUST STATEMENT) | **`ink` → `night`** — the home trust swap; makes the home tail rotate night → ink → night(footer) |
| `app/page.tsx` | @@ -1177 (FINAL CTA) | `night` → `ink` + comment rewrite |

**Remediation item B — "hairline": structural seam `borderTop: 1px solid
#2a342d`, exactly two places:**

| File | Hunk | Change |
|---|---|---|
| `components/footer.tsx` | @@ -94 | `borderTop: '1px solid #2a342d'` on the footer element, site-wide (all 15 routes) + comment naming the covered cases (image CTA bands, 404, ink CTAs) |
| `app/radar/page.tsx` | @@ -325 (EVIDENCE STATES) | `borderTop: '1px solid #2a342d'` on the night panel below the atmosphere image band + comment |

**Remediation item C — baseline re-seed (once, attributed):** all 28
`visual-baseline/*.png` regenerated because A and B change rendered pixels on
every route (footer seam adds 1px of page height site-wide). Attribution in §5.

Nothing else is in the commit. No copy, layout, spacing, component, script,
config, or content changes.

---

## 5 · BASELINE INTEGRITY

**Baseline history** (`git log -- website-next/visual-baseline/`) — exactly two
commits ever:

| Commit | Timestamp (UTC) | Event |
|---|---|---|
| `bf68452` | 2026-07-27 19:33:48 | initial seed — 28 baselines committed with the T-97 phase-2 Hero system + `test:visual` gate |
| `b79900a` | 2026-07-27 20:31:38 | the ONE re-seed, in the same commit as the T-97.1 source fix |

**Pre-reseed failing diff — honest reconstruction.** The literal console
output of the failing `test:visual` run (after the T-97.1 source edits, before
the re-seed, i.e. between 19:46 and 20:30 UTC) was **not saved**; all three
saved verify logs (19:31 phase-2, 19:46 at 8d10df5, 20:30 at b79900a) show
`VISUAL REGRESSION: 28 screenshot(s) match` — they bracket the failing run but
do not contain it. What does exist in the scratchpad: `t97-baseline-diff/`
(30 full-page diff overlays + 6 `small-diff-*` crops, timestamped 19:42–19:43
UTC — after the bf68452 seed, *before* the T-97.1 edits). Their geometry
matches the bf68452 baselines exactly (e.g. diff-home-1440 = 1440×4823); they
are the T-97.1 agent's pre-fix analysis overlays against the freshly committed
baselines, not the failing test run. So: the failing run's console text is not
reconstructable; the failing run's *content* is fully reconstructable, because
it is by definition the delta between the bf68452 baselines and the b79900a
baselines — recomputed now, pixel-exact (pixelmatch, threshold 0, shift-aware:
a pixel counts as changed only if it matches in neither top-aligned nor
bottom-aligned position):

| Baseline | ΔH px | Changed px | % of image | Attribution |
|---|---|---|---|---|
| home-1440 | +1 | 1,277,341 | 18.388% | trust band ink→night + final CTA night→ink recolors (rows 3246–4161) + footer seam |
| home-390 | +1 | 294,588 | 10.998% | same two band recolors + seam |
| pricing-1440 | +1 | 634,483 | 8.623% | closing-CTA recolor (rows 3997–4447) + seam |
| pricing-390 | +1 | 124,565 | 4.375% | closing-CTA recolor + seam |
| methodology-1440 | +1 | 558,960 | 7.517% | closing-CTA recolor (rows 4104–4579) + seam |
| methodology-390 | +1 | 132,939 | 4.496% | closing-CTA recolor + seam |
| faq-1440 | +1 | 418,481 | 8.507% | closing-CTA recolor + seam (+AA noise rows near nav) |
| faq-390 | +1 | 135,475 | 7.168% | closing-CTA recolor + seam |
| contact-1440 | +1 | 394,955 | 12.962% | CTA-band recolor (rows 1179–1531) + seam |
| contact-390 | +1 | 112,501 | 7.170% | CTA-band recolor + seam |
| radar-1440 | +2 | 80,152 | 1.150% | new section seam + footer seam (2 inserted hairline rows shift content; recolor = none, radar CTA was already ink) |
| radar-390 | +2 | 53,438 | 1.730% | same two seams |
| artists-1440 | +1 | 1,440 | 0.021% | **exactly one full-width row: the footer seam** |
| bookers-1440 | +1 | 1,440 | 0.022% | footer seam row only |
| how-it-works-1440 | +1 | 1,440 | 0.023% | footer seam row only |
| passport-demo-1440 / -390 | +1 | 1,440 / 390 | 0.039 / 0.027% | footer seam row only |
| privacy-1440 / -390 | +1 | 1,440 / 390 | 0.009 / 0.006% | footer seam row only |
| terms-1440 / -390 | +1 | 1,440 / 390 | 0.039 / 0.023% | footer seam row only |
| accessibility-1440 | +1 | 1,470 | 0.052% | footer seam + 8 rows of hairline anti-aliasing noise |
| accessibility-390 | +1 | 889 | 0.068% | footer seam + ≤19 sparse AA rows |
| artists-390 / bookers-390 / how-it-works-390 | +1 | 889 / 889 / 919 | 0.033–0.039% | footer seam + sparse AA rows near the nav hairline (~row 24) |
| producers-1440 / -390 | +1 | 3,276 / 424 | 0.057 / 0.019% | footer seam + sparse AA rows |

**Post-reseed pass:** `verify.log` 2026-07-27 20:30 UTC (the run recorded in
the b79900a commit message) — `✓ VISUAL REGRESSION: 28 screenshot(s) match the
committed baselines (≤1% pixel drift)` inside a full 22/22-green chain; and
re-proven fresh at this SHA in §6 below.

**No-unexplained-pixels statement:** every pixel that differs between the
bf68452 and b79900a baselines is accounted for by exactly three causes:
(1) the six night↔ink band recolors on the 6 affected routes, (2) the two 1px
structural seams (footer site-wide → every page exactly +1px tall; radar +2px),
(3) sub-0.07%-of-image anti-aliasing noise on hairline edges between the two
render passes on 8 of the 28 shots — the known nondeterminism the ≤1% gate
exists to absorb. On the 9 unaffected routes at 1440 the delta is literally
the single inserted seam row. There are no unexplained pixels.

---

## 6 · RC INTEGRITY

**Commit range** — `git log --oneline 045ffc2..b79900a` — 17 commits:

```
b79900a T-97.1: dark-adjacency rhythm fix — tail rotation night<->ink on 5 closing-CTA bands, footer seam site-wide, radar section seam; WCAG-AA verified; baselines re-seeded once (attributed); verify 22/22
8d10df5 T-97 item 2: fictional-sample disclosure on OG share assets
3f606d8 T-97 close record in register
bf68452 T-97 phase 2: shared Hero system (4 token variants, 13 pages migrated, radar/terms outliers normalized) + P0/P1 fix wave (16 grid overflow fixes @320, 44px tap targets site-wide, compact consent banner, landmarks, glossary footer heading) + test:hero + test:visual with committed baselines; verify 22/22 green
7d0a60d T-97 phase 1 leftover: og-default.png re-rendered with fictional venue (D5 treatment)
3d133e4 T-96 architecture corrections: no www<->app cross-domain GA4 (subdomains, one ID G-ZX907M2NY8 verify-not-replace), existing sc-domain GSC property (no duplication), Shopify property = open decision; handoff docs corrected in place; Drive-research reconciliation gate added before repositioning deploy
b46c016 T-97: visual/responsive audit registered — deploy blocked, homepage venue ruling, D12 deferred; phase-1 audit dispatching
fb3c0d4 SEO-CHANGELOG entry 3: steps 2-3 evidence record
4cfdac0 T-96 steps 2-3 COMPLETE: www canonical alignment (D2) + indexation-risk fixes (D4/D5/D6/D7) — lib/site.ts single host source, keywords meta removed, schema fixes (logo/app-url/offers-truth), invisible homepage FAQPage deleted, X-Robots-Tag + 30 shell metas noindex /app, robots Disallow inverted (noindex must be crawlable), legal+demo noindexed and out of sitemap (14->10 URLs), demo de-fictionalized to Maya Vale with invented venues + visible sample label, llms.txt purged and truthful, ROUTE_POLICY route-class tests; verify 19/19 green
26d78df WIP: checkpoint — T-96 steps 2-3 team edits in flight (www alignment + indexation fixes)
5a80f11 T-96 step 6: GSC + GA4 console handoff docs (D1 dependency card) + INDEX rows
14c73df T-96: owner rulings D1-D12 recorded in SEO-CHANGELOG entry 2 + register; execution order locked
5217c6b SEO-CHANGELOG entry 1: regression harness landed
dc1ec6e T-96 step 1: SEO+analytics regression harness — test:seo (307L, host-agnostic canonical/sitemap/robots/JSON-LD contract), test:analytics (CANON<=CHECK, EVENTS discipline, firewall prop-key scan), test:sitenav wired, CI verify workflow (full 19-check chain, Node 20/22); verify 19/19 green
ece1110 T-96 Phase-0 baseline landed in docs/SEO-CHANGELOG.md (deliverable 14): 30 contradictions, 12 owner decisions, locked execution order
5fcf7d2 T-96: SEO/AEO/analytics rebuild accepted — phase-0 discovery dispatched, marketing repositioning recorded as owner-ruled, phased execution plan registered
1167d5d T-95: P0 embed fix + audit round-2 shipped (rel-site-2026.07.21-2); new test:embed gate (16-check verify); LESSONS entry; register + deploy-log records
```

**Verify RE-RUN at THIS SHA (fresh, for this evidence package):** working tree
clean at b79900a; `npx next build` in website-next (exit 0, out/ rebuilt
20:38 UTC), then root `npm run verify` — **exit 0, full chain green**
(log: scratchpad `verify-rc-b79900a.log`, 2026-07-27 20:39 UTC). All gates:
NAV 35/35 · G13 act-isolation 17/17 · canon-drift · ANALYTICS · security-denial
(all 8 families) · GUARDRAILS 6/6 · DS-DRIFT 65 pairs · WIDGET-STATES 6×10 ·
EMBED-INTEGRITY · SEO S0–S8 · SITE NAV laws 1–3 · **HERO CONTRACT 13 pages** ·
**VISUAL REGRESSION 28/28 vs committed baselines** · component-styles ·
LANGUAGE-PURE · REGISTRY 483 rows · DELTAS 337 · event-registry · build ·
build:demo · FIT. Tail of the fresh log, verbatim:

```
  · [MOBILE-360 confirm] truncated: 0 · overlaps: 0 · h-scroll: none · primary CTAs: 1
  · [DESKTOP-1360 login] truncated: 0 · overlaps: 0 · h-scroll: none · primary CTAs: 0
  · [DESKTOP-1360 radar] truncated: 0 · overlaps: 0 · h-scroll: none · primary CTAs: 1
  · [DESKTOP-1360 radar-panel] truncated: 0 · overlaps: 0 · h-scroll: none · primary CTAs: 1
  · [DESKTOP-1360 onboarding] truncated: 0 · overlaps: 0 · h-scroll: none · primary CTAs: 1
  · [DESKTOP-1360 confirm] truncated: 0 · overlaps: 0 · h-scroll: none · primary CTAs: 1
✓ FIT: all screens fit at 360px and 1360px — no truncation, no overlap, no h-scroll, one primary CTA.
VERIFY_EXIT=0
```

Count note, stated plainly: the register records this chain as "22/22"; the
`package.json` verify chain enumerates 21 steps, and the 22nd item in that
count is the website-next `next build` the chain depends on (run first here,
exit 0). Both were green in this re-run.

**Inclusions:** T-96 (SEO/canonical/indexation + harness), T-97 (visual audit
phases 1+2: Hero system, P0/P1/P2 fix wave, fictional venues, test:hero +
test:visual), T-97.1 (dark-adjacency fix, this commit).

**Exclusions, each verified:**
- **App train:** the embed application was NOT rebuilt or retrained in this
  range. One commit touches `website-next/public/app` — `4cfdac0`, which adds
  exactly 3 lines (`<meta name="robots" content="noindex, nofollow">` + a
  2-line comment) to each of the 30 shell `index.html` files per owner ruling
  D4; **zero** JS/CSS/asset bundle files changed
  (`git diff --name-only 045ffc2..b79900a -- website-next/public/app` = 30
  index.html only), and `test:embed` (EMBED-INTEGRITY: conflict-free,
  single-bundle per route) passes at b79900a.
- **No migrations 034/040:** no file under `supabase/` in the range
  (`git diff --name-only 045ffc2..b79900a` contains no `src/`, `api/`,
  `server/`, or `supabase/` paths at all — 103 files, all in `website-next/`,
  `docs/`, `scripts/`, `.github/`, root configs).
- **No payment:** no payment surface or flag touched (same file-list proof).
- **No repositioning:** marketing repositioning copy is explicitly gated
  behind the Drive-research reconciliation gate recorded in `3d133e4`; no
  positioning copy changes in the range.

**Rollback:** the currently-live release is `045ffc2`
(rel-site-2026.07.21-2, deployed by alias-promotion of Vercel build
`lock-site-56kewvuw7-error4ik.vercel.app` — see docs/DEPLOY-LOG.md). Rollback
after any future deploy of this RC = re-alias
`lock-site-56kewvuw7-error4ik.vercel.app` → `www.lock.show` + `lock.show`.
No DNS change, no rebuild, instant.

---

## 7 · HERO OPTION TABLE

Context: the historical one-grammar hero canon is
`docs/WEBSITE-DESIGN-SYSTEM.md` §"Contained hero contract (v52 — one hero
grammar for every page)": `--hero-height: 620px` contained stage. T-97
replaced it in practice with the 4-variant token system
(`styles/hero.css` + `components/hero.tsx`, enforced by `test:hero`).
Measured hero data (T-97 measurement JSONs, @1440×900, fold = 900px):

| Route | height before→after | hero-CTA bottom before→after |
|---|---|---|
| home | 828 → 828 | 623.9 → 623.9 (unchanged, well above fold) |
| artists | 828 → 828 | 779 → **763** (improved clearance) |
| bookers | 828 → 828 | 787 → **763** (improved) |
| producers | 828 → 828 | 829 → **805** (improved) |
| pricing | 702 → 702 | 661 → 661 (unchanged) |
| radar | 379.9 → **504** (outlier normalized to standard) | n/a (no hero CTA) |
| terms | 224 → **292** (outlier normalized to compact) | n/a |
| how-it-works / methodology | 504 → 504 | n/a |
| faq / contact | 291.3 → 292 | n/a |
| privacy / accessibility | 299.3 → 299.3 | n/a |

| | **Option A — ratify the 4-variant system (RECOMMENDED)** | Option B — revert to the 620px one-grammar canon | Option C — taste-pass on radar + terms only |
|---|---|---|---|
| What it is | Accept `styles/hero.css` 4 variants (feature / primary / standard / compact) as the hero canon | Reinstate WEBSITE-DESIGN-SYSTEM.md v52 contained 620px stage on every page | Owner reviews only the 2 materially-changed routes (radar 380→504, terms 224→292); rest ratified implicitly |
| Routes affected | **0 code changes** — all 13 hero pages already render it (13/13 pass test:hero) | **all 13 routes change**; zero routes render 620px today (measured heights: 828/702/504/292/299 — none is 620) | 2 routes re-examined; 0–2 change |
| Historical canon | 620-canon marked **superseded** in WEBSITE-DESIGN-SYSTEM.md | 620-canon restored as law | 620-canon superseded (as A) |
| Fold / conversion | Per the T-97 remediation data above: hero-CTA clearances **improved (artists 779→763, bookers 787→763, producers 829→805) or unchanged (home 623.9, pricing 661)**; compact-fold rule keeps H1+CTA above the consent banner at 320×568 | Biggest migration in the set; fold implications **unknown — would need a full re-audit** (620px contained stage reflows every hero CTA and every fold measurement) | Fold neutral outside radar/terms |
| Accessibility | **Neutral** — T-97 a11y items (landmarks 15/15, 44px targets, focus ring) are orthogonal to variant choice and already green | Unknown until re-audit; would re-open the P0/P1 wave surface | Neutral |
| Test/baseline impact | None — current 28 baselines + test:hero + test:visual already encode it | All 28 baselines re-seed + hero contract rewrite + new audit round | ≤4 baselines if changes made |
| Evidence shots | The current committed baselines ARE the Option-A state: `website-next/visual-baseline/*.png` (28) + §2 before/after set | No shots exist of any route at 620px (would have to be produced) | `rc-b79900a-shots/radar-1440-t97phase1-before-hero.png` vs `radar-1440-t97phase2-after-hero.png`; `terms-1440-t97phase1-before-hero.png` vs `terms-1440-t97phase2-after-hero.png` |

**RECOMMENDATION: A.** It is the only option with zero migration cost, zero
unknowns, measured fold improvement, and the full test harness already
enforcing it; C is a cheap owner-taste addendum on top of A if wanted; B pays
the largest cost to reach a state no route currently renders and no evidence
covers.

---

## 8 · LEGAL CONTAINMENT — proven from the built output

Built output rebuilt fresh at this SHA for this package
(`npx next build`, exit 0, `out/` written 2026-07-27 20:38 UTC — same tree
as b79900a, `git status` clean).

**Mechanism statement (exact):** legal pages (`/privacy`, `/terms`,
`/accessibility`) are SITE pages, not `/app` pages — the `vercel.json`
`X-Robots-Tag: noindex, nofollow` header applies only to
`"source": "/app/:path*"` and does NOT cover them. Their containment
mechanisms are meta-level and sitemap-level, both verified in `out/`:

1. **Meta noindex in built HTML** — each of `out/privacy.html`,
   `out/terms.html`, `out/accessibility.html` contains
   `<meta name="robots" content="noindex, nofollow"/>` (from the per-page
   `robots: { index: false, follow: false }` metadata, owner ruling D6).
   `out/404.html` additionally carries `<meta name="robots" content="noindex"/>`.
2. **Absent from `out/sitemap.xml`** — the built sitemap contains exactly 10
   URLs: `https://www.lock.show/` + `/artists` `/bookers` `/producers`
   `/how-it-works` `/methodology` `/pricing` `/radar` `/faq` `/contact`.
   No privacy, no terms, no accessibility, no /app, no /passport/demo.
3. **Visible draft banner** — rendered in the built HTML of all three pages
   (amber notice card in `components/legal-document.tsx`), quoted from
   `out/privacy.html`: **"Draft under legal review — not final"** (1 occurrence
   per built page; the Hebrew variant "טיוטה בבדיקת יועץ משפטי — נוסח לא סופי"
   ships in the client bundle and renders on the language toggle — it is not
   in the static EN-default HTML, stated for accuracy).
4. **`/app` note** — the `vercel.json` header block
   (`X-Robots-Tag: noindex, nofollow` on `/app/:path*`) plus the 30 shell
   `<meta name="robots" content="noindex, nofollow">` tags from `4cfdac0`
   contain the app surface; robots.txt keeps `/app` crawlable so the noindex
   directives can be seen (D4 — "noindex must be crawlable").
   `test:seo` S8 asserts all of this and is green in the §6 re-run
   ("4/4 noindex-class routes carry noindex … 30/30 app shells carry meta
   noindex").

---

## Evidence gaps (stated honestly)

1. The console output of the single failing `test:visual` run that preceded
   the baseline re-seed was not saved; its content is reconstructed
   pixel-exactly in §5 from the two committed baseline generations, which is a
   stronger artifact than the lost log, but the log itself does not exist.
2. `t97-baseline-diff/` overlays predate the T-97.1 source edits (19:42–43
   UTC) — they document the phase-2 delta against the fresh baselines, and are
   labeled as such here, not as the failing-run output.
3. Contrast ratios are computed from tokens + exact rgba compositing (flat
   colors — mathematically identical to rendered-pixel measurement, and the
   audit's rendered rgb values confirm the tokens); no separate
   screen-sampling pass was run on hover/active states, whose values follow
   deterministically from the site-wide `filter: brightness()` rule.
4. Hebrew draft-banner text is verified in source and client bundle, not in
   the static EN-default HTML (item 3 in §8).
5. The four ghost-button borders below 3.0:1 (§3) are pre-existing and
   unchanged by this RC — flagged for an owner decision, not silently passed.
