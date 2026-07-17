# OWNER PENDING — what only Maria can unblock

_Maintained by the build agent. Appears at the end of every reply (owner directive 17 Jul 2026).
Each item: what it is → what you do → what it unblocks. Sorted by impact._

## 🔴 Blocking the Gate (do these first)

| # | What | What you do (plain steps) | Unblocks |
|---|---|---|---|
| M-11 | **Install 3 DNS records at GoDaddy** (last email step — records received ✓) | Your DNS lives at GoDaddy, which I can't touch yet. EITHER (a) authorize the GoDaddy connection: claude.ai → Settings → Connectors → GoDaddy → Connect — then say "install the DNS records" and I do the rest; OR (b) 3 minutes yourself: GoDaddy → My Products → lock.show → DNS → Add New Record, three times: ① Type TXT · Name `resend._domainkey` · Value = the long `p=MIGf…` text from Resend ② Type MX · Name `send` · Value `feedback-smtp.ap-northeast-1.amazonses.com` · Priority 10 ③ Type TXT · Name `send` · Value `v=spf1 include:amazonses.com ~all`. Then Resend → Domains → lock.show → Verify. Tell me and I'll confirm from the outside. | Real Gate emails to artists (T-25) |
| M-12 | **Rotate the Resend key** (hygiene) | The key was pasted in chat. After everything works: Resend → API Keys → Revoke → create new (send-only) → Vercel → lock-app → Environment Variables → edit `RESEND_API_KEY`. | closes the exposure |
| M-3 | **Re-test the live fixes** | Refresh any app page · open your Passport link fresh · check "Sign in" in the site header · confirm the home screen no longer hangs (after next deploy) | Upgrades T-16 to owner-witnessed; closes your 4 findings |
| M-4 | **Counsel sign-off L-1…L-9** | Send `docs/legal/` drafts to your lawyer; return their fixes | Legal launch gate (T-24) |

## 🟡 Needed soon (not blocking today's build)

| # | What | What you do | Unblocks |
|---|---|---|---|
| M-5 | **Witness walks** (rule 4) | When I hand you a one-page checklist per screen: look at it on your phone (390px) and desktop, tick the boxes | MOBILE/DESKTOP ✅ on every screen task |
| M-6 | **D3 ruling** | Decide: retire the `/producer` shell or fold it into Production | T-11 polish; nav cleanup |
| M-7 | **Codex artwork** | Ask Codex for the logo + venue-icon files | Final visual polish (§5.9) |
| M-8 | **Prices + annual %** | One sentence when ready (free-pilot holds until the Gate) | Plan enforcement (post-Gate) |
| M-15 | **GO for "site hygiene train"** | One word ("go") ships the NO-VISUAL-CHANGE fixes: dead advertised routes in llms.txt · footer/logo tap sizes · site security headers (T-41). Zero design risk; design changes wait for your M-13 taste-pick | Closes S0's factual bugs |
| M-14 | **ADR-1: ONE canonical app address** | Decide: `app.lock.show` (recommended — cleaner, already fully secured) or `lock.show/app`. One sentence; I write the formal decision record + redirect plan | Ends the dual-origin ambiguity the PM audit flagged |

## 🟢 Optional / whenever

| # | What | What you do |
|---|---|---|
| M-9 | Rename test domain off "gigproof" (`@lock.test`) | Say the word; purely cosmetic |
| M-10 | Canonical tagline + 2nd market | One sentence each |

_Resolved (kept for the record): ~~payment-provider timing~~ ✅ owner ruling 17 Jul: real provider connects when development ends; pilot Gate-pay = manual Bit + operator activation (T-44) · ~~keys backup~~ ✅ all 13 keys in the Vercel encrypted vault (write-only), 17 Jul · ~~M-2 Resend key~~ ✅ stored in Vercel + test email delivered 17 Jul · ~~shydavid question~~ ✅ **FIRST REAL USER** (DJ, techno/trance) — events stay counted · ~~C-2 Supabase Pro~~ ✅ 16 Jul · ~~merge-to-main authorization for audit fixes~~ ✅ 17 Jul · ~~M-1 migration 037~~ ✅ applied+verified 17 Jul._
