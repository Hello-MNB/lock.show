# OWNER PENDING — what only Maria can unblock

_Maintained by the build agent. Appears at the end of every reply (owner directive 17 Jul 2026).
Each item: what it is → what you do → what it unblocks. Sorted by impact._

## 🔴 Blocking the Gate (do these first)

| # | What | What you do (plain steps) | Unblocks |
|---|---|---|---|
| M-12 | **Rotate the Resend key** (hygiene) | The key was pasted in chat. After everything works: Resend → API Keys → Revoke → create new (send-only) → Vercel → lock-app → Environment Variables → edit `RESEND_API_KEY`. | closes the exposure |
| M-3 | **Re-test the live fixes** | Refresh any app page · open your Passport link fresh · does the home screen ever hang? · tap the small controls on your phone | Upgrades 8 live fixes to owner-witnessed |


## 🟡 Needed soon (not blocking today's build)

| # | What | What you do | Unblocks |
|---|---|---|---|
| M-4 | **Counsel review L-1…L-9 — IN PROGRESS, PARALLEL, NON-BLOCKING (R00 ruling 18 Jul)** | Counsel is reviewing; the published drafts + built Amendment-13 consent flow carry the beta meanwhile. The signed final rides in when counsel responds | Final legal polish — blocks nothing in Phase N and does not block real-artist beta onboarding |
| M-5 | **Witness walks** (rule 4) | When I hand you a one-page checklist per screen: look at it on your phone (390px) and desktop, tick the boxes | MOBILE/DESKTOP ✅ on every screen task |
| M-6 | **D3 ruling** | Decide: retire the `/producer` shell or fold it into Production | T-11 polish; nav cleanup |
| M-7 | **Codex artwork** | Ask Codex for the logo + venue-icon files | Final visual polish (§5.9) |
| M-8 | **Prices + pilot-pay flag** | Second-pass audit finding: the artist "I've paid" screen is deployed but FLAG-OFF in production — the Gate journey is dormant until you (a) set the pilot price (earlier rec: ₪179) and (b) say "turn on the pay screen". Annual % can wait for post-Gate | Makes the Gate walkable for real (J5) |
| M-15 | **GO for "site hygiene train"** | One word ("go") ships the NO-VISUAL-CHANGE fixes: dead advertised routes in llms.txt · footer/logo tap sizes · site security headers (T-41). Zero design risk; design changes wait for your M-13 taste-pick | Closes S0's factual bugs |
| M-14 | **ADR-1: ONE canonical app address** | Decide: `app.lock.show` (recommended — cleaner, already fully secured) or `lock.show/app`. One sentence; I write the formal decision record + redirect plan | Ends the dual-origin ambiguity the PM audit flagged |
| R-11 | **Display-language ruling** (from your 18 Jul ask) | Read `docs/UNIVERSE-GAP-REPORT.md` §4. Decide: (a) count-based progress vocabulary only (recommended — same expressiveness, zero risk), or (b) ALSO allow an **artist-private completion %** of the artist's own checklist (never quality, never buyer-facing, never comparative) — one word each | Unlocks the richer Radar progress displays; buyer-side stays absolute either way |
| M-17 | **Universe/registry rulings** (report §5–§6) | Three short calls: (1) ONE Registry-B schema (rec: F1.csv 15-col + 3 columns from the Sheet's B01–B24); (2) ONE certainty ladder (rec: 4-door for claim certainty, 10-value for extraction provenance); (3) the Sheet's 4 open R00 decisions (family build order · is F6 in scope · secondary family · radar_segments tab) | Unlocks the field-grain fill + the ≥038 taxonomy migration + registry-driven Radar |

## 🟢 Optional / whenever

| # | What | What you do |
|---|---|---|
| M-9 | Rename test domain off "gigproof" (`@lock.test`) | Say the word; purely cosmetic |
| M-10 | Canonical tagline + 2nd market | One sentence each |

_Resolved (kept for the record): ~~M-11 DNS records~~ ✅ owner installed at GoDaddy herself, domain verified in Resend 17 Jul · ~~payment-provider timing~~ ✅ owner ruling 17 Jul: real provider connects when development ends; pilot Gate-pay = manual Bit + operator activation (T-44) · ~~keys backup~~ ✅ all 13 keys in the Vercel encrypted vault (write-only), 17 Jul · ~~M-2 Resend key~~ ✅ stored in Vercel + test email delivered 17 Jul · ~~shydavid question~~ ✅ **FIRST REAL USER** (DJ, techno/trance) — events stay counted · ~~C-2 Supabase Pro~~ ✅ 16 Jul · ~~merge-to-main authorization for audit fixes~~ ✅ 17 Jul · ~~M-1 migration 037~~ ✅ applied+verified 17 Jul._
