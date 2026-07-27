# GSC HANDOFF — Google Search Console setup for lock.show (T-96 Phase 9 · owner console actions)

_For: Maria. Written 27 Jul 2026, step-⑥ of the locked T-96 execution order._
_What this is: everything that has to happen inside Google Search Console (Google's free tool that shows how Google sees, crawls, and indexes our pages — "GSC" from here on). None of it touches code; it is all done in your browser. I cannot see your Google account from here, so where Google's screens vary by account I say so instead of inventing a button name._

> **THE ONE HARD RULE (read before anything else)**
> **Do NOT click "Request indexing" on any page until I confirm the metadata/positioning deploy has shipped.** Requesting indexing today would ask Google to lock in the current pages — the wrong canonical host, the old positioning copy, and the schema we are about to remove. Set up the properties, look, record — but do not request indexing. I will tell you explicitly when that changes.

---

## 1. Create the three properties

A "property" in GSC is one lens on the site. We need three: one wide, two narrow.

### 1a. Domain property for `lock.show`

A **Domain property** covers every variation of the domain in one view — `lock.show`, `www.lock.show`, `app.lock.show`, `shop.lock.show`, http and https, all at once — so nothing we add later escapes measurement.

1. Go to https://search.google.com/search-console and sign in with the Google account that should own this (the same one that owns GA4, ideally).
2. Open the property picker (top-left dropdown) and choose **"Add property"**.
3. You'll see two boxes. Use the **left** one, labeled **Domain**. Type exactly: `lock.show` (no https, no www, no slash).
4. Click **Continue**. Google now asks you to verify ownership via a **DNS TXT record** — a small text note attached to the domain at the company where the domain is registered (for us: GoDaddy). Google shows you a value that looks like `google-site-verification=AbC123...`. **Copy it** (copy button next to it). Leave this tab open.

#### The GoDaddy TXT walk

5. In a new tab, go to https://www.godaddy.com and sign in to the account that holds `lock.show`.
6. Open your product/domain list (GoDaddy currently calls this **"My Products"** or the **Domains** portfolio page — the label shifts between redesigns; you want the page listing your domains).
7. Find `lock.show` and open its **DNS** management (the button may say **"DNS"**, **"Manage DNS"**, or be behind a "⋮" menu → "Manage DNS").
8. On the DNS records page click **"Add"** / **"Add New Record"** and fill in:
   - **Type:** `TXT`
   - **Name** (sometimes "Host"): `@`  (the `@` means "the domain itself")
   - **Value** (sometimes "TXT Value" / "Data"): paste the full `google-site-verification=...` string from step 4
   - **TTL:** leave the default (e.g. 1 hour / "Default")
9. **Save.** Do not delete or edit any existing record — you are only adding one new TXT line.
10. Back in the Search Console tab, click **Verify**. If it fails, wait 30–60 minutes and click Verify again — DNS changes take time to spread; this is normal, not an error. Keep the TXT record in place permanently (Google re-checks it).

### 1b. URL-prefix property for `https://www.lock.show/`

Why, when the Domain property already covers it: URL-prefix properties let us test and inspect at the level of one exact host — sitemap behavior, page-by-page indexing, and later settings apply cleanly per host ("directive-level testing"). The Domain property is the wide lens; these are the microscopes.

1. Property picker → **Add property** → this time use the **right** box, labeled **URL prefix**.
2. Enter exactly: `https://www.lock.show/`
3. Click Continue. Because the Domain property is already DNS-verified, Google will normally **auto-verify** this one instantly (it may say "Ownership auto verified"). If it asks for verification anyway, choose the **DNS / Domain name provider** method — it reuses the same TXT record; no new GoDaddy work.

### 1c. URL-prefix property for `https://app.lock.show/`

Repeat 1b with `https://app.lock.show/`. Same auto-verification expectation. This property is where we will later confirm the app pages are correctly **kept OUT** of Google (they are private product screens, not marketing pages).

---

## 2. Submit the sitemap — ⚠ WAIT-UNTIL flag

A sitemap is the machine-readable list of pages we ask Google to crawl. Ours will live at `https://www.lock.show/sitemap.xml`.

> **⚠ WAIT-UNTIL: do this only AFTER I confirm the "www-alignment" deploy is live.** Today the sitemap still lists the wrong host form (it points at `lock.show` addresses that redirect to `www.lock.show`); submitting it now feeds Google a list of redirects. I will message you "www deploy is live — submit the sitemap" when it's time.

When cleared:
1. Open the **`https://www.lock.show/`** URL-prefix property (not the Domain one — submitting under the exact host keeps the report clean).
2. Left menu → **Sitemaps**.
3. In "Add a new sitemap" type: `sitemap.xml` and click **Submit**.
4. Status should become **"Success"** within minutes to a day. "Couldn't fetch" right after submission sometimes clears on its own — recheck the next day before worrying.

---

## 3. Priority URL inspection — the record table

GSC's **URL Inspection** tool (the search bar at the very top of the property) shows exactly how Google sees one page. For each URL below, open the `https://www.lock.show/` property, paste the full URL into that top bar, press Enter, and copy what Google reports into the table. This is our before/after evidence — fill it once **now (pre-deploy)** and again **after** the deploy.

Inspect these six (all on `www.` — that is the confirmed canonical host, per owner ruling D2):

- `https://www.lock.show/`
- `https://www.lock.show/artists`
- `https://www.lock.show/radar`
- `https://www.lock.show/how-it-works`
- `https://www.lock.show/faq`
- `https://www.lock.show/pricing`

_(A seventh, `/resources`, joins this list later — the Resources section is gated by owner ruling D8 and doesn't exist yet.)_

Where each answer lives on the inspection screen (labels may vary slightly):
- **Crawl allowed?** and **Indexing allowed?** — inside the "Page indexing" / "Coverage" panel, rows named roughly "Crawl allowed" and "Indexing allowed".
- **User-declared canonical** — same panel; this is the address *our page says* is its official version.
- **Google-selected canonical** — same panel; the address *Google decided* is official. These two matching is the win condition.
- **Last crawl** — same panel, a date/time.
- **Rendered screenshot** — click **"View crawled page"** (or "Test live URL" → "View tested page") → **Screenshot** tab. Note simply whether the page renders correctly (yes/no + anything odd).
- **Page-indexing status** — the big verdict at the top ("URL is on Google", "URL is not on Google", "Excluded by 'noindex' tag", etc.). Copy it word for word.
- **Detected structured data** — any "Enhancements"/"Structured data" items listed under the result (e.g. "FAQ", "Breadcrumbs"), or "N/A" if none shown.

Fill this in (one row per URL, both passes):

| URL (www) | Pass (pre/post deploy) | Crawl allowed | Indexing allowed | User-declared canonical | Google-selected canonical | Last crawl | Rendered screenshot OK? | Page-indexing status (verbatim) | Detected structured data |
|---|---|---|---|---|---|---|---|---|---|
| `/` | pre | ☐ | ☐ | | | | ☐ | | |
| `/` | post | ☐ | ☐ | | | | ☐ | | |
| `/artists` | pre | ☐ | ☐ | | | | ☐ | | |
| `/artists` | post | ☐ | ☐ | | | | ☐ | | |
| `/radar` | pre | ☐ | ☐ | | | | ☐ | | |
| `/radar` | post | ☐ | ☐ | | | | ☐ | | |
| `/how-it-works` | pre | ☐ | ☐ | | | | ☐ | | |
| `/how-it-works` | post | ☐ | ☐ | | | | ☐ | | |
| `/faq` | pre | ☐ | ☐ | | | | ☐ | | |
| `/faq` | post | ☐ | ☐ | | | | ☐ | | |
| `/pricing` | pre | ☐ | ☐ | | | | ☐ | | |
| `/pricing` | post | ☐ | ☐ | | | | ☐ | | |

Reminder: inspecting is fine anytime; **"Request indexing" stays untouched** until I give the go (see the hard rule at the top).

---

## 4. What good looks like (expected results after our deploy)

Use this as the checklist for the **post** pass of the table:

1. **Every marketing URL is self-canonical on www** — for each of the six URLs, "User-declared canonical" AND "Google-selected canonical" both show the exact same `https://www.lock.show/...` address as the URL you inspected. No `lock.show` (without www) anywhere in either field.
2. **App pages are deliberately out** — inspecting anything under `https://app.lock.show/` (in the app property) reports **"Excluded by 'noindex' tag"** (Google's phrase for "the page told me not to index it — correctly"). That is success, not a problem: those are private product screens.
3. **Legal pages and the demo Passport also show "Excluded by 'noindex' tag"** — e.g. the privacy/terms pages and the demo profile. Deliberate, per owner rulings D5/D6 (legal text isn't final; the demo contains fictional content that must not appear in search).
4. **Sitemap report shows "Success" with 0 errors**, and its "discovered pages" count matches the number of marketing pages (currently the six above plus any others I confirm at deploy time — I'll give you the exact expected count with the "submit" go-ahead).

Anything that doesn't match this picture: screenshot it and send it to me — do not try to fix it in the console.

---

## 5. Link GSC to GA4 — ⚠ only after the D1 GA4 properties exist

This makes Google-search data (what people searched, what they clicked) appear inside our analytics. Do it **after** the two new GA4 properties from `docs/GA4-SETUP-HANDOFF.md` exist — link to **Property A ("LOCK — Platform Journey")**, never the Shop property.

1. Open GA4 (https://analytics.google.com) → gear icon **Admin** (bottom-left) → in the Property column, scroll to **Product links** → **Search Console links** (the menu item may be under "Product link management").
2. Click **Link** → **Choose accounts** → select the **`https://www.lock.show/`** URL-prefix property (GA4 links to one URL-prefix/Domain property; www is our canonical, so pick it. If only the Domain property is offered, that's fine — choose it).
3. Choose the web data stream when asked (Property A has exactly one — pick it), then **Review and submit**.
4. Data appears in GA4 under Reports → (Library may need enabling of the "Search Console" collection — if you don't see the reports, tell me rather than digging).

---

## 6. Hand-back — what to send me when done

- [ ] Confirmation the three properties exist and are verified (screenshot of the property picker is enough).
- [ ] The filled **pre-deploy** table from section 3.
- [ ] (Later, on my go) sitemap submission status + the **post-deploy** table.
- [ ] (Later, after D1) confirmation of the GSC↔GA4 link.
- [ ] Anything Google showed that isn't described in this document — screenshot, don't guess.

And once more, because it is the one action that can't be undone cheaply: **no "Request indexing" until I confirm the metadata/positioning changes are deployed.**
