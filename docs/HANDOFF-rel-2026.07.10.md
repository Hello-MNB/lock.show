# HANDOFF — rel-2026.07.10 (for Maria @ computer / Cowork)

**Branch:** `claude/b4-gigproof-discovery-e7749o` · **Gate:** ✅ green (nav 34/34 · i18n purity · build · demo build) · **All code pushed.**

## The ONLY thing that needs a human right now: apply two migrations

Open Supabase → **SQL Editor** → run these **one at a time**, in order. After each, tell me and I'll verify the matching flow.

### 1) Migration 030 — fixes onboarding + agency radar (RLS recursion)
Paste the contents of `supabase/migrations/030_fix_artists_rls_recursion.sql`. In short it creates `owns_artist()` and rewrites two `artist_access` policies to stop the infinite recursion. **Verify after:** onboarding completes, `/agency/radar` loads.

### 2) Migration 031 — closes the firewall breach (unreviewed claims going public)
Paste the contents of `supabase/migrations/031_passport_approval_gate.sql`. It adds `and artist_approved = true` to `claims_public_read`. **Verify after:** a published passport shows only claims the artist approved.

> Both are short, additive, and reversible. Do 030 first (it's the onboarding blocker), then 031.
> If you'd rather I run them: paste me the Supabase **DB connection string** (Settings → Database → Connection string, pooled `postgres://…`) and I'll apply + verify both myself.

## What I do the moment the migrations are in
1. Fire the deploy hooks (app + site) — my step, no dashboard needed.
2. **Browser-verify the live flows myself** (Playwright in this env): signup → onboarding → Radar → publish → passport (both persona views) · booker paste-link · agency radar. You are not the tester.
3. Report back with what actually works; only then do we promote + tag `rel-2026.07.10`.

## What is NOT in this release (documented, sequenced)
The other 22 flow-gaps (`docs/FLOW-GAP-AUDIT-2026-07-10.md`) — batched into R2 (analytics events) and R3 (agency roster-from-grants, artist reply channel, create-Act, production requests inbox). None block R1.

## Owner decisions still open (not blocking R1)
- Price (₪179?) · Hebrew term for "Act" · promote-to-main go/no-go · R3 product choices · **the financial-system gaps below.**

---

## FINANCIAL SYSTEM — what the admin panel actually has (you asked)

**Short answer:** there IS a payment system, on BOTH sides, but it's a **manual reconciliation model** — no Stripe, no card capture, no automated invoicing. Right for pre-validation (measure willingness-to-pay), not a real billing operation yet.

### Artist side — "Founding Passport" (the built-out one)
- Artist pays by **Bit** to `054-4555060` with a reference code (`GP-xxxx`), enters the amount, taps "I've paid" → an **entitlement** row is created `status=pending` with an `amount_note` (ref · ₪amount · Bit). `OfferPayment.jsx` + `entitlements` table (migration 007).
- Operator sees it in **Admin → Payments**, matches the reference against her Bit app, taps **"Mark active"** → `status=active` + the artist gets a "payment activated" notification. `AdminDashboard.jsx` L94-112.

### Manager / agency side — plan upgrade (thinner)
- An org requests **Solo → Agency**; it shows in **Admin → Upgrades**; operator taps **Approve** → RPC flips plan + seats. `Billing.jsx` ("Manual — no Stripe; billing settled manually with the operator"), `orgs.js` `approveUpgrade`.
- **Gap:** the agency side captures **no amount / no payment record at all** — unlike the artist side it stores no `amount_note`, so there is **no financial trail on the manager side**. Money (if any) is settled entirely outside the system.

### What the financial system does NOT have (gaps — for after the Gate)
| Gap | Severity | Note |
|---|---|---|
| No **receipt / invoice** (חשבונית) generation | **P1 (legal)** | Israel requires a receipt the moment real money changes hands. Green Invoice was deferred — becomes required at first real payment (counsel item). |
| No agency-side **payment record** (`amount_note`) | P1 | Manager-side has no financial trail; can't reconcile agency money in-app. |
| No **revenue view / ledger** in admin | P2 | Admin shows pending *queues*, not totals collected / per-side breakdown / MRR. |
| `adminActivateEntitlement` doesn't set **`activated_by`** | P2 | Column exists (007) but isn't written — minor audit-trail gap. |
| No refunds / recurring / dunning | P2 | Out of scope pre-launch; fine. |

**Bottom line:** for the pre-validation Gate ("1 manager reacts AND one pays"), the manual model is enough — you can take a Bit payment and mark it active today. But **before real money flows you need the receipt/invoice path (legal)**, and the **agency side needs a payment record** so it's not money with no trail.
