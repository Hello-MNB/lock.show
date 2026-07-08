# LOCALIZATION MATRIX — GIGPROOF

**Version 1.0 · 8 Jul 2026 · Owner: Localization**

## Owner's law (governs everything below)

- English and Hebrew content must EACH be complete and professional on their own — HE is not
  "EN with some Hebrew sprinkled in," and EN must not regress to service HE.
- Content is NEVER mixed within a single rendered screen/page. A user in HE mode must see 100%
  Hebrew, not Hebrew shell + English leftovers.
- **Launch language is HEBREW.** Anything not fully translated and reviewed blocks launch —
  key-coverage in a JSON file is necessary but not sufficient; untranslated scaffold text does
  not count as "done."
- This matrix must stay current: any PR that adds/changes strings, prose, or legal docs must
  update this file's numbers in the same change.

## How these numbers were produced

Measured directly, not estimated:
1. `src/lib/i18n/en.js` vs `src/lib/i18n/he.js` — Node script recursively walked both exported
   `T` objects (plus `BANDS`, `PROFILE_ITEM_TYPES`) and diffed leaf keys.
2. `npm run lint:i18n` (`scripts/i18n-purity.mjs`) run and its output recorded verbatim.
3. `website-next/messages/en.json` vs `he.json` — same recursive leaf-key diff, plus a scan for
   HE values that are byte-identical to their EN counterpart (signal of untranslated/placeholder
   copy).
4. `website-next/lib/locale-context.tsx` and `website-next/components/nav.tsx` read directly.
5. `website-next/app/**/page.tsx` grepped for any `useLocale`/`messages.` usage to determine
   whether a given page is wired into the locale system at all.
6. `docs/legal/*.md` and `website-next/app/*` directory listing for terms/privacy/accessibility.
7. `src/lib/demo.js` scanned for its `L(en, he)` bilingual-getter pattern.
8. Repo-wide search for email-sending code/templates.

No i18n/message/content files were modified. No git commands were run.

---

## MATRIX TABLE

| Surface | EN status | HE status | Coverage % (measured) | Gap detail | Priority for HE launch |
|---|---|---|---|---|---|
| App UI strings (`src/lib/i18n/en.js`/`he.js`, key `T`) | Complete — 733 leaf keys, all top-level sections present | Present but incomplete — 581 of 733 leaf keys exist | **79.26%** (581/733 leaves; 0 missing top-level sections) | 152 leaf keys missing, concentrated in `radar` (97 missing — `radar.universe.*`, `radar.nextActions.*`, `radar.dimensions.*`), `evidence` (25 — intent-capture strings), `claims` (13 — review/approve/correct/flag flow), `onboarding` (11 — goal-picker copy), plus small counts in `dashboard`, `consent`, `signup`, `readiness`, `status`. Missing HE keys **silently fall back to English** via `LangContext`'s deep-merge — this produces mixed-language screens in HE mode, which the owner's law explicitly forbids. `BANDS` (5/5) and `PROFILE_ITEM_TYPES` (6/6) are fully translated. **Separately, a functional bug**: both `en.js` and `he.js` declare the object key `consent:` **twice** in the `T` literal (lines 2 and 383 in en.js; 2 and 368 in he.js). JS object-literal semantics mean the second declaration silently overwrites the first, so `T.consent.ariaLabel` / `.message` / `.privacyLink` (used by `src/components/ConsentBanner.jsx` — the cookie banner) are `undefined` in **both languages**, not just HE. This is a shipped-app defect, independent of translation coverage. | **HIGH** — RadarUniverse (the app's core "next action" screen) is the least-translated surface; a HE user hits English mid-flow constantly. The duplicate-`consent`-key bug should be fixed regardless of language. |
| App hardcoded-string lint (`npm run lint:i18n`) | N/A (lint targets non-`T`-sourced UI strings) | N/A | **3 violations, all baseline-accepted** | All 3 are in `src/lib/radarUniverse.js` lines 84–86 — regex *matchers* (`/club\|קלאב\|מועדון.../i` etc.) used to classify free-text, not rendered UI copy. Script output: `✗ 3 violation(s) · demo.js bilingual-fixture lines (data): 48`. Matches the CLAUDE.md-noted baseline exactly; no new hardcoded-string debt found. | LOW — no action; keep the 3 as accepted baseline, re-check on future radarUniverse.js edits. |
| Site UI strings (`website-next/messages/en.json`/`he.json`) | Complete — 74 leaf keys across `nav, footer, home, passport, methodology, common, consent` | Key-complete but flagged as **scaffold** | **100%** key coverage (74/74), but **not launch-ready** | `he.json` carries an explicit `"_note": "SCAFFOLD ONLY — requires native Hebrew editor review before shipping. Authored for structure; not production-ready."` So 100% coverage ≠ 100% quality by the file's own admission. 13 leaf values are byte-identical between EN and HE (e.g. `home.actors.artist.tag`, all 5 `methodLabels.*`) — these appear to be **intentional** fixed bilingual tags / standardized method-label vocabulary (e.g. `"TICKET EXPORT"`, `"אמן · ARTIST"`), not translation misses, but should be confirmed by a native editor, not assumed. | HIGH — the only site content in the locale system at all; still needs the native-editor pass before it can be called professional HE. |
| Site page prose (`website-next/app/**/page.tsx`) | Complete — 9 of 11 page routes are fully hardcoded English React/JSX with **no** locale wiring | **Effectively 0%** — no HE path exists | **~18%** of pages locale-wired (2 of 11: `home` + `methodology`; `passport`/`passport/demo` partially via shared nav/footer/consent only) | Grepped every `app/*/page.tsx` for `useLocale`/`messages.`: **`bookers` (464 lines), `artists` (904 lines), `producers` (449 lines), `contact` (215 lines), `how-it-works` (396 lines), `pricing` (430 lines), `faq` (278 lines), `radar` (513 lines)` — 8 pages, ~3,650 lines of JSX — have zero locale integration.** They are not merely untranslated; they are not even represented as keys in `messages/*.json`, so there is nothing to translate yet — content would need to be extracted into the message files first. | **CRITICAL / HIGHEST** — this is the single largest blocker to a Hebrew launch of the marketing site. Most of the site's actual sales/explainer copy has no Hebrew path whatsoever, despite the Nav exposing a working locale toggle (`components/nav.tsx` → `LocaleToggle`) that a visitor can click on any of these pages today and get no change. |
| Legal — Terms | HE only — no EN counterpart exists | `docs/legal/TERMS-HE.md` (v0.1, marked "טיוטה לבדיקת עו״ד — אינה ייעוץ משפטי", pending legal counsel task #23) | **0% bilingual** (HE-only by design so far) | No EN version anywhere in the repo. No page yet under `website-next/app/terms/` — directory does not exist. (Owner flagged this route may be in flight from another agent in parallel; confirmed absent as of this run.) | MEDIUM for HE launch itself (HE text exists in draft), but blocks the site page and blocks any future EN audience; also still pending legal-counsel sign-off, so not launch-ready even in HE. |
| Legal — Privacy | HE only — no EN counterpart exists | `docs/legal/PRIVACY-HE.md` (v0.1, same "pending legal counsel" caveat, task #23) | **0% bilingual** | Same as Terms: no EN version, no `website-next/app/privacy/` route yet. | MEDIUM — HE draft exists but unapproved by counsel; site route missing. |
| Legal — Accessibility | HE only — no EN counterpart exists | `docs/legal/ACCESSIBILITY-HE.md` (v0.1, references ת״י 5568/WCAG 2.0 AA, task #27, explicitly "to update after real accessibility pass") | **0% bilingual** | No EN version, no `website-next/app/accessibility/` route yet. Content itself says the accessibility work it describes hasn't been verified yet (placeholder bullet list). | LOW-MEDIUM — furthest from ready of the three legal docs (depends on an unfinished accessibility pass), but not solely a localization gap. |
| Consent banner (app) | `src/lib/i18n/en.js` — see bug above | `src/lib/i18n/he.js` — see bug above | **Broken in both languages** (not a translation gap) | Both `T.consent` blocks exist and are individually well-formed and fully bilingual, but the **duplicate object key** means the cookie-banner fields (`ariaLabel/message/privacyLink/accept/decline`) are shadowed by the later, unrelated "Consent & Privacy" form block and evaluate to `undefined` at runtime in `ConsentBanner.jsx`. | **CRITICAL (bug, not translation)** — fix by renaming one of the two blocks (e.g. `consent` → `cookieConsent` for the banner) in both `en.js` and `he.js` and updating `ConsentBanner.jsx`'s `T.consent` reference. |
| Consent banner (site) | `website-next/messages/en.json` → `consent.*` | `website-next/messages/he.json` → `consent.*` | **100%** key coverage, no duplicate-key bug found here (JSON, not JS object literal, so no shadowing risk) | `website-next/components/consent-banner.tsx` reads `messages.consent` correctly; values look complete on both sides. Still subject to the site-wide "_note: scaffold" caveat. | LOW — structurally sound; needs the same native-editor QA pass as the rest of `he.json`. |
| Demo fixtures (`src/lib/demo.js`) | Complete | Complete | **100%** (50 of 50 `L(en, he)` bilingual-getter call sites have a non-empty HE argument) | No empty-string or missing HE arguments found in any `L(...)` call. File's own header comment claims language-purity-by-construction (EN mode renders only EN getters, HE mode only HE getters, brand names stay Latin in both) — spot-checked against the code and holds up (e.g. flagship fixture "Shai Perlman"/"שי פרלמן", "Underground Techno"/"טכנו אנדרגראונד"). | LOW — this surface is a model for how the rest of the app should work; no action needed. |
| Transactional emails | Unknown / not in repo | Unknown / not in repo | **N/A — no templates found in repo** | Repo-wide search for email-sending code/templates (`sendEmail`, `nodemailer`, `resend`, `sendgrid`, `postmark`, `*.html` mail templates, `supabase/**/templates`) found nothing — the one `resend` hit was `resendInvite()` in `src/lib/orgs.js`, an unrelated invite-resend function, not an email provider. `supabase/` only contains `migrations/`. Transactional email (signup confirmation, password reset, invites) is almost certainly running on **Supabase Auth's default EN-only templates**, configured in the Supabase dashboard, not version-controlled here. | MEDIUM — cannot be measured from this repo; needs a direct check of the Supabase project's Auth → Email Templates config, and then a decision on whether HE transactional email is in scope for launch. |
| docs/canon (internal working docs) | Mixed EN/HE by design | Mixed EN/HE by design | **Exempt from the law** | Per owner directive, internal canon/working docs (`docs/canon/*.md`, `docs/WEBSITE-BUILD-CANON.md`, etc.) are explicitly out of scope for the "no mixing" rule — they are working documents, not user-facing product surfaces. Confirmed several canon docs (e.g. `B4-35.20-Localization-Standard.md`, `B4-35.20-Product-Language-Localization.md`) contain Hebrew content mixed with English headers/structure, consistent with this exemption. | N/A — no gap to report; documenting the exemption so it isn't mistakenly flagged in a future pass. |

---

## TOP GAPS — sorted by what blocks the HEBREW LAUNCH

1. **Site marketing pages have no Hebrew path at all (CRITICAL).** 8 of 11 `website-next/app/**/page.tsx` routes (`bookers`, `artists`, `producers`, `contact`, `how-it-works`, `pricing`, `faq`, `radar` — ~3,650 lines of hardcoded JSX) are not wired into `messages/*.json` or `useLocale` in any way. The Nav's locale toggle is live and clickable on every one of these pages but does nothing for their content. This is the largest single piece of work standing between the site and a real Hebrew launch — it requires extracting this prose into the message files before it can even be translated.

2. **App consent banner is functionally broken in both languages (CRITICAL bug, not a translation gap).** `src/lib/i18n/en.js` and `he.js` each declare the `consent:` key twice inside the `T` object; the second declaration (the "Consent & Privacy" form) silently overwrites the first (the cookie-banner strings), so `ConsentBanner.jsx` renders `undefined` for `ariaLabel`, `message`, `privacyLink`, `accept`, and `decline`. Fix is small (rename one key, e.g. `cookieConsent`, and update the one consumer) but should happen before any further language work on this file, since it affects EN too.

3. **App UI is 79.26% HE-covered, with the core Radar/next-action screen worst-covered.** 152 of 733 `T` leaf keys are missing from `he.js`, and 97 of those are in `radar` (`radar.universe.*`, `radar.nextActions.*`, `radar.dimensions.*`). Because `LangContext` deep-merges HE over EN, these show up as silent English fragments inside an otherwise-Hebrew screen — exactly the mixed-language failure mode the owner's law forbids. `evidence` (25 missing) and `claims` (13 missing) are the next-largest gaps, both in core artist flows.

4. **Legal pages (Terms/Privacy/Accessibility) exist only as unapproved Hebrew drafts, with no site route and no EN counterpart.** All three live only as `docs/legal/*-HE.md`, each explicitly marked pending legal-counsel review (Terms/Privacy: task #23; Accessibility: task #27, also pending an actual accessibility pass). `website-next/app/terms/`, `/privacy/`, `/accessibility/` do not exist yet (may be in flight by another agent — confirmed absent as of this measurement). These block launch on two axes at once: legal sign-off and site wiring.

5. **`website-next/messages/he.json` is explicitly self-flagged as scaffold** (`_note: "SCAFFOLD ONLY — requires native Hebrew editor review before shipping"`), despite 100% key-parity with `en.json`. Coverage-by-key-count is not the same as launch-ready Hebrew; the file itself says so. Do not report the site's "100%" UI-string coverage as done without this caveat.

6. **Transactional email is un-auditable from the repo** and is almost certainly Supabase Auth's default EN-only templates. Needs a direct look at the Supabase dashboard (not the codebase) to confirm, and a decision on whether it's in scope for the HE launch gate.

---

## Measured numbers (for quick reference)

- App UI (`T` object): **733 EN leaf keys**, **581 exist in HE**, **152 missing**, **79.26% coverage**, **0 missing top-level sections**.
- App hardcoded-string lint: **3 violations**, all accepted baseline in `src/lib/radarUniverse.js` (regex matchers).
- Site UI (`messages/*.json`): **74 EN leaf keys**, **74 in HE**, **0 missing**, **100% key coverage** — but HE explicitly marked scaffold/unreviewed, and 13 values are EN/HE-identical (likely intentional fixed vocabulary, unconfirmed).
- Site page prose: **2 of 11** page routes wired to the locale system (`home`, `methodology`; `passport` partially via shared chrome) — **~18%**; the other 8 (~3,650 lines) are hardcoded EN-only with no HE path.
- Legal docs: **3 of 3** (Terms/Privacy/Accessibility) are HE-only drafts pending legal counsel; **0 EN counterparts**; **0 site routes** exist yet.
- Demo fixtures: **50 of 50** `L(en, he)` call sites fully bilingual — **100%**.
- Consent banner (app): key coverage moot — **broken by a duplicate-key bug** in both languages.
- Consent banner (site): **100%** key coverage, structurally sound, same scaffold caveat as rest of site.
- Transactional email: **not present in repo** — likely Supabase default, EN-only, unverified.
