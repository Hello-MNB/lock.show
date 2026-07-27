# GA4 SETUP HANDOFF — the D1 dependency card (owner console actions)

_For: Maria. Written 27 Jul 2026, step-⑥ of the locked T-96 execution order. This is the console-setup handoff your ruling D1 asked for: you create two Google Analytics properties, send me back two Measurement IDs, and only then does any analytics code change. I cannot see your Google Analytics account from here — where Google's screens differ by account or version, I say "the screen may name this X or Y" instead of inventing a label._

**What GA4 is, in one line:** Google Analytics 4 — Google's free measurement tool; a **property** is one reporting container, a **data stream** is one tagged source feeding it, and a **Measurement ID** (looks like `G-XXXXXXXXXX`) is the public key the website uses to send events to that stream.

**The plan in one line:** Property A measures the whole LOCK platform journey (marketing site + app, one stream); Property B measures the Shopify shop, through Shopify's own integration; the current shared ID `G-ZX907M2NY8` is retired from this role once both new IDs are in my hands.

---

## PROPERTY A — "LOCK — Platform Journey"

### A1. Create the property

1. Go to https://analytics.google.com and sign in with the account that should own LOCK analytics long-term.
2. Click the gear icon **Admin** (bottom-left).
3. Click **"+ Create"** → **Property** (older screens: a **"Create Property"** button at the top of the Property column).
4. Property name: exactly `LOCK — Platform Journey`.
5. Reporting time zone: **Israel (GMT+2/+3)**. Currency: your call — **ILS** matches the market; **USD** matches the app's pricing display. Pick one and note which (this only affects how revenue is displayed, not what's collected).
6. Answer the business-details questions however you like (they only tune Google's suggested reports), click through, and when asked to choose a platform pick **Web**.

### A2. Create ONE web data stream (this is the important part)

One production stream covering **both** `www.lock.show` and `app.lock.show`. Not two streams.

Honest technical note on why one stream is correct even though there are two hostnames: a GA4 web stream is keyed to the **tag** (the Measurement ID in the page code), not to the hostname — every page that carries the ID reports into the stream regardless of host. The stream's "Website URL" field is essentially a label. What actually matters is the **cross-domain settings** (step 4 below): without them, a visitor hopping from `www.lock.show` to `app.lock.show` can be counted as two separate visitors with two sessions; with both domains listed, the session survives the hop and we see one continuous journey — which is the entire point of Property A.

1. In the stream-creation screen (it appears right after A1; or Admin → Data streams → **Add stream** → **Web**):
   - **Website URL:** `https://www.lock.show`
   - **Stream name:** `LOCK production — www + app`
2. Create the stream. The stream detail screen now shows the **Measurement ID** (`G-…`, top-right area). This is the ID I need back.
3. On the stream detail screen open **"Configure tag settings"** (may appear as a link/button near the bottom; the follow-on screen may be titled "Google tag" → "Settings").
4. Choose **"Configure your domains"** and add BOTH:
   - `www.lock.show`
   - `app.lock.show`
   Save. (This is the cross-domain list from the note above.)
5. If you'd prefer per-host clarity in reports anyway: you don't need a second stream for that. Our code will send a parameter named **`surface`** on every event, with exactly one of four values — `marketing` (the www site), `auth` (sign-in/sign-up screens), `app` (the logged-in product), `public_profile` (public artist profile pages). Filtering any report by `surface` gives you the per-host/per-area split with none of the session-breaking downsides of separate streams. (For it to be filterable it will be registered as a custom dimension — I'll handle that with the code cutover, or walk you through the two clicks then.)

### A3. Enhanced measurement — recommended settings

Still on the stream detail screen, find **"Enhanced measurement"** (a toggle with a gear next to it). Leave the master toggle **ON**, then open the gear and set:

| Sub-toggle | Set to | Why |
|---|---|---|
| Page views | ON | Core. |
| Scrolls | ON | Free depth signal on marketing pages. |
| Outbound clicks | ON | Shows which external links people leave through. |
| Site search | OFF | The site has no internal search — leaving it on invites junk. |
| Form interactions | **OFF** | Our forms include auth and evidence-adjacent flows; we send our own deliberate events instead of Google auto-guessing form activity. |
| Video engagement | OFF | No embedded YouTube today; turn on if that changes. |
| File downloads | ON | Harmless, occasionally useful. |

### A4. Internal-traffic / developer filter

Goal: our own visits (localhost, preview deployments, and `@gigproof.test` test accounts) must not pollute production numbers. Honest note on mechanism: GA4's built-in "internal traffic" rule works by **IP address**, which is weak for us — home/mobile IPs change, and Vercel preview URLs aren't IP-distinguishable. So the real protection is in code, not the console:

- our code sends an **`environment`** parameter (production vs preview/dev) on every event,
- dev traffic is separated via GA4's **DebugView**, and
- **staging/preview builds never receive the production Measurement ID at all** (they get no ID or a throwaway one).

What you still do in the console (belt-and-suspenders, 2 minutes):
1. Stream detail screen → **Configure tag settings** → **"Define internal traffic"** → **Create** → add the office/home IP(s) you regularly work from (whatever `https://www.whatismyip.com` shows you), rule name e.g. `LOCK internal`. Save.
2. Admin → Property column → **Data filters**: you should see a filter named `Internal Traffic` in **Testing** state. Leave it in Testing for the first two weeks (so we can verify it catches only us), then switch to **Active**. If the screen names differ, tell me what you see rather than guessing.

### A5. Key events — mark AFTER events start flowing (not now)

"Key events" (the screen may still say **"Conversions"** in places — same thing) can only be marked once an event has actually arrived. So this step waits until the code cutover ships and real data flows. Then: Admin → Property column → **Key events** (or Events → toggle "Mark as key event") and mark exactly these seven:

1. `sign_up`
2. `onboarding_complete`
3. `professional_profile_publish`
4. `generate_lead`
5. `booking_request_submit`
6. `availability_request`
7. `purchase`

**Explicitly NOT `login`** — logging in is not a business outcome, and the current app inflates it further by firing `login` on passive session restore (a known defect, C17, fixed at cutover). If a screen suggests marking `login`, decline.

### A6. What to send back to me (Property A)

> **"Property A Measurement ID: G-XXXXXXXXXX"** — from the stream detail screen (step A2.2).
> Plus: which currency you picked, and confirmation both domains are listed in the cross-domain settings.

---

## PROPERTY B — "LOCK — Shop"

### B1. CHECK FIRST — does Shopify already have GA4 connected?

Do not create anything until this check is done. Shopify connects to Google Analytics through its **"Google & YouTube"** sales-channel app, and if that link already exists, creating a second property or adding manual tags would double-count everything.

1. Shopify admin (the store's `…myshopify.com/admin`) → **Settings** → **Apps and sales channels** (the label may be just "Apps").
2. Look for **"Google & YouTube"** (older installs may show "Google" or "Google channel").
3. **If it's installed:** open it and look for its Google Analytics section (the app may show it under "Settings" or on its overview page — it shows which GA4 property is linked, by name and/or `G-` ID).
   - **Write down which property it's linked to** and send me that.
   - **DO NOT create a duplicate property.**
   - **DO NOT add any manual GA4 tags/pixels for page_view, checkout, or purchase anywhere in Shopify** (not in theme code, not in "custom pixels", not in checkout settings). Per your own ruling: Shopify's integration **owns** those events; anything added by hand double-fires them.
4. **If it's NOT installed (or installed but not linked to any GA4 property):** proceed to B2.

### B2. Create "LOCK — Shop" (only if B1 found no existing link)

1. In GA4: Admin → **"+ Create"** → **Property**, name exactly `LOCK — Shop`, same time zone; currency should match the store's selling currency.
2. Platform: **Web**. Website URL: the shop's public address (the `shop.lock.show` / storefront domain — use whatever the store actually serves at). Stream name: `LOCK Shop — Shopify`.
3. Now connect it **via Shopify, not by pasting code**: Shopify admin → Apps → install/open **Google & YouTube** → sign in with the same Google account → when it asks for a Google Analytics property, select **LOCK — Shop** → approve. Shopify then places its own tag and sends page_view/checkout/purchase itself.
4. Add nothing manually on top (same rule as B1.3).

### B3. What to send back to me (Property B)

> **"Property B Measurement ID: G-XXXXXXXXXX"** (from the LOCK — Shop stream detail screen, or as shown in the Shopify Google & YouTube app)
> **+ one sentence: was the Shopify↔GA4 integration pre-existing (and if so, linked to which property), or did you create it now?**

---

## HARD RULES (binding, from ruling D1 — restated so nothing drifts)

1. **No production Measurement-ID substitution in code until BOTH IDs are returned.** The codebase keeps its current wiring untouched until "Property A Measurement ID" and "Property B Measurement ID + pre-existing-or-not" are both in my hands.
2. **The current mixed `G-ZX907M2NY8` is NOT the final architecture.** Today it blends the marketing site, the embedded app mirror, and the standalone app into one stream (baseline finding C15). It keeps working until cutover, but nothing new is built on it.
3. **Shop events must never reach Property A.** The shop reports only through Property B via Shopify's own integration; no shop page may ever carry Property A's ID, and no manual commerce events are added anywhere.

---

## APPENDIX — where the old ID lives today (cutover scope, so nothing is hidden)

The retiring ID `G-ZX907M2NY8` (GA4 property 544738110, stream "LOCK App") is wired at exactly three points:

| # | File : line | What it is | Cutover action (mine, later) |
|---|---|---|---|
| 1 | `website-next/app/layout.tsx:25` — `const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-ZX907M2NY8'` | Marketing site (Next.js). Env-overridable; the old ID is the fallback default. | Point default/env at **Property A**'s ID. |
| 2 | `src/components/ConsentBanner.jsx:5` — `const GA_ID = 'G-ZX907M2NY8'` | The app (Vite SPA at app.lock.show). **Hardcoded, no env override** (baseline finding C16). | Replace with env-driven **Property A** ID + staging gets no production ID. |
| 3 | `website-next/public/app/assets/index-B0moPvgL.js` | The committed **built copy** of the app embedded at lock.show/app — the old ID is baked into this compiled bundle (it's the build output of #2). | Rebuilt and recommitted as part of the same cutover, or it keeps sending under the old ID. |

(The ID also appears in several docs — `CONNECTIONS-REGISTRY`, `CONSENT-BANNER-SPEC`, spec §14, `GLOSSARY`, `COSTS`, etc. Those are documentation references, not wiring; they get updated in the cutover changelog entry, not before.)

Everything on both surfaces stays **consent-gated** exactly as today (Consent Mode v2, defaults denied, banner grant required, evidence-surface no-pixel rule intact) — the cutover changes which property receives events, never whether consent is required.

---

## Hand-back checklist

- [ ] Property A created · one stream · both domains in cross-domain settings · enhanced-measurement toggles per A3 · internal-IP rule created
- [ ] **Property A Measurement ID sent to me**
- [ ] Shopify checked FIRST (B1) · outcome noted
- [ ] Property B linked via Shopify's Google & YouTube channel (created only if none pre-existed)
- [ ] **Property B Measurement ID + pre-existing-or-not sent to me**
- [ ] Nothing manual added in Shopify · no code changed anywhere (that part is mine, and only after both IDs arrive)
