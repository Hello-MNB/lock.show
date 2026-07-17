# OWNER PENDING — what only Maria can unblock

_Maintained by the build agent. Appears at the end of every reply (owner directive 17 Jul 2026).
Each item: what it is → what you do → what it unblocks. Sorted by impact._

## 🔴 Blocking the Gate (do these first)

| # | What | What you do (plain steps) | Unblocks |
|---|---|---|---|
| M-2 | **Resend — 2 final clicks** | Key received ✓ (send-only — good). Now: (a) my safety system needs YOUR word for the 2 remaining actions — reply **"send the test email"** (one email to your own inbox proving it works) and **"store the key in Vercel"** (so production can send); or do (b) yourself: Vercel → lock-app → Settings → Environment Variables → Add `RESEND_API_KEY` (Sensitive). ⚠️ The key was pasted in chat — after it's stored, rotate it in Resend (Revoke → new key → update Vercel). | Gate email (T-10/T-25) |
| M-3 | **Re-test the live fixes** | Refresh any app page · open your Passport link fresh · check "Sign in" in the site header · confirm the home screen no longer hangs (after next deploy) | Upgrades T-16 to owner-witnessed; closes your 4 findings |
| M-4 | **Counsel sign-off L-1…L-9** | Send `docs/legal/` drafts to your lawyer; return their fixes | Legal launch gate (T-24) |

## 🟡 Needed soon (not blocking today's build)

| # | What | What you do | Unblocks |
|---|---|---|---|
| M-5 | **Witness walks** (rule 4) | When I hand you a one-page checklist per screen: look at it on your phone (390px) and desktop, tick the boxes | MOBILE/DESKTOP ✅ on every screen task |
| M-6 | **D3 ruling** | Decide: retire the `/producer` shell or fold it into Production | T-11 polish; nav cleanup |
| M-7 | **Codex artwork** | Ask Codex for the logo + venue-icon files | Final visual polish (§5.9) |
| M-8 | **Prices + annual %** | One sentence when ready (free-pilot holds until the Gate) | Plan enforcement (post-Gate) |

## 🟢 Optional / whenever

| # | What | What you do |
|---|---|---|
| M-9 | Rename test domain off "gigproof" (`@lock.test`) | Say the word; purely cosmetic |
| M-10 | Canonical tagline + 2nd market | One sentence each |

## ❓ One small question for you (no rush)
The database cleanup found **3 events that stay counted as REAL**: a signup + onboarding + login on 11 Jul by `shydaviddjnattaly@gmail.com`. If that's a team member testing, tell me and I'll mark it as test activity; if it's a real early user — congratulations, they stay counted.

_Resolved (kept for the record): ~~C-2 Supabase Pro~~ ✅ 16 Jul · ~~merge-to-main authorization for audit fixes~~ ✅ 17 Jul · ~~M-1 migration 037~~ ✅ applied+verified 17 Jul._
