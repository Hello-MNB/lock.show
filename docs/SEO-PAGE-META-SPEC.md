# SEO Page Meta Spec — website-next (lock.show)

Owner: SEO/AEO/GEO infrastructure audit, 2026-07-08 (GIGPROOF → LOCK rebrand, domain move to lock.show).

Scope: the 9 page files excluded from the infrastructure audit because a separate agent is
rewriting their body copy at the same time:

```
app/page.tsx
app/artists/page.tsx
app/bookers/page.tsx
app/producers/page.tsx
app/how-it-works/page.tsx
app/pricing/page.tsx
app/faq/page.tsx
app/radar/page.tsx
app/contact/page.tsx
```

This document is the target the independent auditor checks the copy agent's final metadata
against. Numbers in brackets are character counts (title target ≤60, description target ≤155).

## CRITICAL — read before writing any page's `metadata.title`

`app/layout.tsx` sets `title: { template: '%s | LOCK', default: '...' }`. Next.js applies that
template to every route **except** the page co-located with the layout that defines it (the
homepage happens to dodge it for that reason — that is not something to rely on for other
routes). Concretely: **do not put `| LOCK` (or any brand suffix) inside a child page's own
`title` string** — the template already appends it. Five in-scope pages had this exact bug
(confirmed by inspecting the built HTML) and have been fixed as part of this audit:
`methodology`, `passport/demo`, `privacy`, `terms`, `accessibility` all previously rendered
`... | LOCK | LOCK`. As of this audit, **the same bug is still live** on 5 of the 9 excluded
pages below (verified in `.next/server/app/*.html` after a clean build):

| Page | Rendered `<title>` before fix (still live — file excluded from this audit) |
|---|---|
| `/artists` | `Prove You Draw a Crowd — Before the Call | LOCK | LOCK` |
| `/how-it-works` | `How It Works — From Gig to Verified Evidence | LOCK | LOCK` |
| `/pricing` | `Pricing — Free to Publish, Plans for More | LOCK | LOCK` |
| `/radar` | `Artist Radar — Your Private Evidence Workspace | LOCK | LOCK` |
| `/contact` | `Contact — Get in Touch | LOCK | LOCK` |

`/bookers`, `/producers`, `/faq`, and `/` (home) do not have the bug today only because their
current strings happen not to end in `| LOCK`. **The fix for the copy agent is simple: write the
title string with no trailing brand suffix at all** (e.g. `'Prove You Draw a Crowd — Before the
Call'`, not `'... | LOCK'`). The template supplies ` | LOCK` automatically. This is the single
highest-priority correction in this spec — until it lands, five public page titles are broken in
every search result and browser tab.

## Per-page spec

### `/` — Homepage (`app/page.tsx`)
- **Title** (no brand suffix in the string): `LOCK — Proof a Booking Manager Can Actually Check` [49]
- **Meta description**: `Turn your gig history into evidence a booking manager can verify before they risk their name. No scores, no rankings — just checked claims.` [143]
- **OG title**: same as title, or a slightly punchier variant, e.g. `LOCK — Proof Before Booking` [28]
- **OG description**: `Every claim shows how it was checked and when. Built for booking managers who need to verify before they risk their name.` [123]
- **Canonical**: `https://lock.show/`
- **JSON-LD — action required**: `app/page.tsx` currently defines its own `@graph` with a second `WebSite` (`@id: #website`, same fragment as layout's — OK) and a second `Organization` using `@id: #org` (layout uses `#organization` — **mismatched fragment, creates a duplicate/ambiguous Organization entity** in the graph) plus its own `url` values with an inconsistent trailing slash (`https://lock.show/` vs layout's `https://lock.show`). **Fix**: drop the page-level `WebSite`/`Organization` nodes entirely (layout already emits them site-wide) and keep only the `FAQPage` node on this page. If the FAQPage node stays on the homepage (it currently holds 4 Q&As used in an on-page accordion), that's fine — homepage `FAQPage` schema for genuinely-rendered on-page Q&A is valid — just stop re-declaring `WebSite`/`Organization` here.

### `/artists` — `app/artists/page.tsx`
- **Title**: `Prove You Draw a Crowd — Before the Call` [42] (drop the trailing `| LOCK`)
- **Meta description**: `You played the gig. Now put proof in front of the booking manager before they call you — not a link or a bio, evidence they can check.` [137]
- **OG title**: `For Artists | LOCK` [19]
- **OG description**: `You played a great set. Now prove it — in a way a booking manager can trust.` [78]
- **Canonical**: `https://lock.show/artists`
- **JSON-LD**: none page-specific needed; rely on the site-wide Organization/WebSite graph in layout.

### `/bookers` — `app/bookers/page.tsx`
- **Title**: `For Booking Managers — Evaluate Before You Commit` [50] (already correct, no template bug — keep as-is)
- **Meta description**: `An artist sends you a link. See exactly how each claim was checked — no account, no signup, free for booking managers, always.` [128]
- **OG title**: `For Booking Managers | LOCK` [28]
- **OG description**: `Your reputation is on the line. Evaluate before you commit.` [60]
- **Canonical**: `https://lock.show/bookers`
- **JSON-LD**: none page-specific needed.

### `/producers` — `app/producers/page.tsx`
- **Title**: `For Producers — Verify One Show in 30 Seconds` [46] (already correct, no template bug — keep as-is)
- **Meta description**: `An artist sends you a link about one show. Confirm it in 30 seconds — no account, no signup, nothing else asked of you.` [119]
- **OG title**: `For Producers | LOCK` [21]
- **OG description**: `You confirm what happened. We make sure that confirmation means something.` [76]
- **Canonical**: `https://lock.show/producers`
- **JSON-LD**: none page-specific needed.

### `/how-it-works` — `app/how-it-works/page.tsx`
- **Title**: `How It Works — From Gig to Verified Evidence` [45] (drop the trailing `| LOCK`)
- **Meta description**: `See exactly how a gig becomes evidence a booking manager can trust — three people, three steps, no signup required to view.` [123]
- **OG title**: `How It Works | LOCK` [20]
- **OG description**: same as meta description or a short variant.
- **Canonical**: `https://lock.show/how-it-works`
- **JSON-LD**: consider `HowTo` schema only if the 7 steps are stable copy (Log evidence → Invite producer → Operator reviews → Publish). Optional, not required for launch — flag as a follow-up, not a blocker.

### `/pricing` — `app/pricing/page.tsx`
- **Title**: `Pricing — Free to Publish, Plans for More` [42] (drop the trailing `| LOCK`)
- **Meta description**: `Publishing your Passport is always free. Paid plans keep your proof current and give management offices one view across a roster.` [131]
- **OG title**: `Pricing | LOCK` [14]
- **OG description**: same as meta description.
- **Canonical**: `https://lock.show/pricing`
- **JSON-LD**: do **not** add `Offer`/`Product` schema with hard prices here — no price/ICP is locked per canon (CLAUDE.md STAGE section). The site-wide `SoftwareApplication` node in layout already carries a `$0` Offer scoped to the booking-manager free tier; leave per-artist pricing out of schema until it's locked.

### `/faq` — `app/faq/page.tsx`
- **Title**: `FAQ — What LOCK Does (and Doesn't) Promise` [42] (already correct, no template bug — keep as-is)
- **Meta description**: `Straight answers on how verification works, what a Passport shows, and why there's no score, rank, or guarantee — ever.` [117]
- **OG title**: `FAQ | LOCK` [10]
- **OG description**: same as meta description.
- **Canonical**: `https://lock.show/faq`
- **JSON-LD — follow-up item**: add a page-level `FAQPage` schema on `/faq` itself once its Q&A copy is finalized by the copy agent, built from the *actual* rendered questions/answers on that page (not the 4-question set currently embedded on the homepage — that set is homepage-specific and already covered above). Do not duplicate the homepage's `FAQPage` questions here or vice versa; each `FAQPage` node should mirror only the Q&As visibly rendered on its own page, so the answer text always matches what a user (and a search snippet) actually sees.

### `/radar` — `app/radar/page.tsx`
- **Title**: `Artist Radar — Your Private Evidence Workspace` [48] (drop the trailing `| LOCK`)
- **Meta description**: `Your private workspace to see what proof you have, what's missing, and exactly what to do next — visible only to you, never public.` [133]
- **OG title**: `Artist Radar | LOCK` [20]
- **OG description**: same as meta description.
- **Canonical**: `https://lock.show/radar`
- **JSON-LD**: none page-specific needed.

### `/contact` — `app/contact/page.tsx`
- **Title**: `Contact — Get in Touch` [23] (drop the trailing `| LOCK`)
- **Meta description**: `LOCK is in closed beta. We want to hear from artists, booking managers, and producers — questions, feedback, and collaboration welcome.` [136]
- **OG title**: `Contact | LOCK` [15]
- **OG description**: same as meta description.
- **Canonical**: `https://lock.show/contact`
- **JSON-LD**: none page-specific needed; a `ContactPage` type is optional and low-value here — skip.

## Cross-cutting notes for the copy agent

1. **Never write the brand suffix into a page's `title` string.** See the CRITICAL section above.
2. **Every page needs an explicit `openGraph.url`** pointing at its own canonical path (only the
   homepage currently sets this). Without it, crawlers may infer the wrong canonical OG URL.
3. **Firewall compliance in copy and schema**: no score/percentile/rank/"bookability %"/gauge
   language anywhere, including meta descriptions and any JSON-LD `description` fields. All 9
   current drafts already comply — keep it that way.
4. **Keep `he`/`אמרגן`/`אמן` terms where already present** (Hebrew market signal) but do not
   invent a `/he` URL or hreflang alternate — confirmed no such route exists (see
   `lib/locale-context.tsx`: locale switching is client-side/localStorage only, not a route).
