# §15 — LEGAL, CONSENT & LOCALIZATION

**Master-spec section 15 · LOCK (lock.show) · Israeli market, bilingual EN + HE**
**Status: consolidating draft — grounded in the repo as of 15 Jul 2026. Legal copy is DRAFT pending counsel (task #23); HE microcopy below is the piece the rest of the spec DEFERS and is delivered here.**

> **Firewall (governs this whole section).** No score / percentile / rank / "bookability %" / prediction / gauge anywhere — including in legal, consent, or localized copy. Draw is shown ONLY as bands + binaries with method labels. Streaming is secondary context. Reaction insight back to the artist is method-safe text only, never a count/%/score. Every string in §15.4 was checked against this rule.

---

## 15.0 Scope & sources

This section specifies three things and delivers a fourth:

1. **Legal** — the documents LOCK must publish, their real content and status, and the data-handling model behind the consent-gated public-footprint scan.
2. **Consent** — the consent UX and the record model that proves it.
3. **Localization architecture** — the EN + HE, Israeli-first i18n system, its RTL rules, and the font ruling.
4. **The delivered Hebrew string set** — canon HE microcopy for the key screens as EN→HE tables (the deferred piece).

**Grounded in (repo paths, all under repo root):**

| Area | Source of truth in repo |
|---|---|
| Legal copy (live pages) | `website-next/app/terms/terms-content.tsx` · `website-next/app/privacy/privacy-content.tsx` · `website-next/app/accessibility/accessibility-content.tsx` |
| Legal drafts (source) | `docs/legal/TERMS-HE.md` · `docs/legal/PRIVACY-HE.md` · `docs/legal/ACCESSIBILITY-HE.md` · `docs/legal/CONSENT-BANNER-SPEC.md` |
| Consent UX (app) | `src/features/auth/ConsentLegal.jsx` · `src/components/ConsentBanner.jsx` |
| Consent record model | `supabase/migrations/001_initial_schema.sql` (table) · `021_vocabulary_and_consent.sql` (scope canon) · `src/lib/db.js` (`recordConsent*`, `hasConsent`, `getConsents`, `requestAccountDeletion`) |
| i18n string tables | `src/lib/i18n/en.js` · `src/lib/i18n/he.js` (app) · `website-next/messages/en.json` · `he.json` (site) |
| Localization status | `docs/LOCALIZATION-MATRIX.md` |
| HE canon vocabulary | `docs/GLOSSARY.md` · `docs/ENTITY-GLOSSARY.md` |
| Session/legal state | `docs/SESSION-MEMORY.md` |

---

## 15.1 LEGAL

### 15.1.1 Required documents & status

LOCK publishes three legal documents, each as a bilingual page (HE source + faithful EN translation) rendered by the shared `LegalDocument` component from a typed `LegalContent` object.

| Document | Route | Repo content file | Version / status | Blocking gap |
|---|---|---|---|---|
| **Terms of Use** (תנאי שימוש) | `/terms` | `website-next/app/terms/terms-content.tsx` | v0.1 · 8 Jul 2026 · **DRAFT for counsel** (task #23) | jurisdiction city `[עיר]`, refund/cancellation policy `[to be completed]`; HE source uses retired word "Mirror" (canon-flag) |
| **Privacy Policy** (מדיניות פרטיות) | `/privacy` | `website-next/app/privacy/privacy-content.tsx` | v0.2-corrected · 8 Jul 2026 · **DRAFT for counsel** (task #23) | controller legal name, business/ח.פ. number, postal address, phone |
| **Accessibility Statement** (הצהרת נגישות) | `/accessibility` | `website-next/app/accessibility/accessibility-content.tsx` | v0.1 · 8 Jul 2026 · **DRAFT** (task #27) | coordinator name + phone, last-updated date, real remediation-pass results; furthest from ready |

Each page renders a persistent **draft notice** ("טיוטה בבדיקת יועץ משפטי — נוסח לא סופי" / "Draft under legal review — not final"). This banner MUST remain until counsel signs off; removing it is a counsel-gated action, not an engineering one.

**Vocabulary firewall on legal copy.** The Terms HE source still contains the retired word **"Mirror" / המראה** for the artist's private view. Canon retired it (one Passport, shown in views; the private view is **האזור הפרטי / הרדאר**). The EN translation already substitutes "the artist's private view"; the **HE Terms source must be re-aligned before publication** (GLOSSARY.md row: Mirror/המראה is forbidden). Privacy v0.2 is already aligned (uses פספורט / האזור הפרטי הרדאר; "מראה" does not appear) — this is why it is v0.2-corrected.

### 15.1.2 Regulatory framework

LOCK operates from Israel, serves Israeli demand-side buyers, and uses infrastructure that stores data outside Israel (Supabase, Vercel, Anthropic — all US-region). Two regimes therefore apply simultaneously:

- **Israeli Privacy Protection Law 5741-1981, including Amendment 13** (בתוקף מ-14.8.2025 / in effect from 14 Aug 2025). The Privacy Policy explicitly names it and dates it. Amendment 13 obligations reflected in the drafts and code:
  - A named **database controller** (בעל השליטה במאגר המידע) who determines purposes and means — §1 of the Privacy Policy (placeholder for the legal entity).
  - Data-subject rights: access, correction, deletion/closure, withdrawal of optional consent, marketing opt-out (§13).
  - Purpose limitation and a stated lawful basis per purpose (§6).
  - Breach handling per the incident-response duty (§12).
  - The **30-business-day deletion SLA** surfaced to the user in Settings (`settings.deleteWarning`: "כל הנתונים יימחקו תוך 30 ימי עסקים לפי תיקון 13").
- **GDPR** — for any EU visitor (the marketing site is world-reachable). Reflected via:
  - Consent Mode v2 with **default = denied** before any analytics fires (see §15.2.1).
  - Cross-border transfer disclosure (§10 of the Privacy Policy) with "appropriate measures … agreements, undertakings or other safeguards."
  - The same access/rectification/erasure/withdrawal rights, which GDPR and Amendment 13 largely align on.

> **DPO / representative — OPEN.** Neither draft appoints a Data Protection Officer or an Israeli/EU representative. Whether Amendment 13 or GDPR Art. 27/37 requires one for LOCK's scale is a **counsel question** — listed OPEN in §15.1.6.

### 15.1.3 Data handling — the consent-gated public-footprint scan

The product's distinctive data operation is the **deep public-footprint scan**: at onboarding the artist gives a name + one strong link, and LOCK reads the artist's *own public footprint* to surface candidate evidence, which the artist then confirms. This is the **TARGET architecture** (multi-source deep scan once at onboarding, ≈$1 target cost, cheap incremental re-scans) — **not yet built**, and per CLAUDE.md no business case may price or assume it until measured. §15 specifies its legal envelope so the build is compliant by construction.

**Governing principles (already stated in Privacy §4, §7):**

- The scan reads **the artist's own public footprint only**, in the context the artist provided ("from a public source you referred us to"). The Privacy Policy explicitly disclaims systematic third-party scraping: *"The Service is not intended to perform systematic scraping, continuous monitoring, or covert collection of information about artists."*
- **Nothing is published automatically.** Scanned material becomes candidate claims shown to the artist for review, correction, or removal *before any publication* (Privacy §7; consent copy "nothing reaches your Passport — or even your private view — without your explicit confirmation").
- **Server-side AI, minimized payload.** Evidence is routed through LOCK's servers to Anthropic, not browser→provider; only the minimum needed for labeling is sent; no excess third-party PII is forwarded (Privacy §7).

**What is collected (Privacy §3.1–3.7):**

| Category | Examples | Notes |
|---|---|---|
| Account & identity | name, stage name, email, phone (optional), hashed password/login id, role, org | required minimum to operate an account |
| Professional info | genre, region, bio, media links, lineups, experience, **draw as bands**, community size **as a count only** | firewall: ranges/bands, never exact draw numbers on the public surface |
| Evidence & documents | public links, screenshots, ticket/settlement exports, pro documents | user warrants authority; excess third-party PII must not be uploaded; LOCK may redact/reject |
| Claims & processing outputs | extracted data points, source, **method label**, verification date, status, version history, **consent records** | method labels are canon (see §15.4) |
| Availability requests | requester name, org, event type/date/location, capacity/budget **band**, message | demand-side inbound |
| Technical/security | IP, device/OS/browser, login times, pages, security events, necessary cookies | |
| Payment (pilot) | payer name, amount, date, reference, invoice details (via Bit / transfer) | no payment credentials stored |

**Lawful basis by purpose (Privacy §6 + Amendment-13 mapping):**

| Purpose | Basis |
|---|---|
| Open/operate account, deliver the service | performance of the service the user requested |
| Build the private Radar; organize/label evidence | consent (`privacy-processing` scope) |
| Read the artist's public footprint for candidate evidence | **explicit per-connection consent** (`thirdparty-evidence` scope) — see §15.2.2 |
| Publish the public Passport | **separate explicit consent** (`public-publication` scope) |
| Payments, invoices, accounting | legal/accounting obligation |
| Security, abuse prevention, fault handling | legitimate operation of the service |
| Marketing messages | **separate optional consent** (`marketing` scope), withdrawable anytime |

### 15.1.4 Retention & deletion

Retention rule (Privacy §11): keep data only as long as needed for its purpose; then delete, anonymize, or restrict. Specifics already committed:

- Account data — while the account is active.
- Evidence/content — while the user keeps using it.
- Published Passports + versions — retained to manage publication and document user actions.
- Availability requests — for handling, documentation, service improvement.
- **Consent, security, and audit records — retained longer, to demonstrate legal compliance** (this is why deletion is not a raw `DELETE` of everything — see below).
- Payment/accounting documents — for legally required periods.
- Backups — purged on backup/operational cycles.

**Account deletion → data (the user-facing SLA):** Settings exposes "Request data deletion" with the copy *"This action is irreversible. All your data is deleted within 30 business days, as Israeli privacy law requires"* (`settings.deleteWarning` / `.deleteSubmitted`). The flow is a **request that is recorded, not an instant purge**: `requestAccountDeletion(userId)` writes a `consent_records` row with `scope='account-deletion'`, `status='withdrawn'` (see §15.2.3) — an auditable withdrawal event — and the operator console runs the actual cascade delete via `adminDeleteArtist(artistId, reason)`, which **writes an audit row before the cascade** (firewall/due-process) and requires a mandatory reason. Operator-side deletion is surfaced in the admin console (`admin.deleteData`, `admin.deleteAuditNote`: "Irreversible — this will be written to the audit log").

> **Retention-period values — OWED.** The policy commits to "legally required periods" and "as long as necessary" but does **not** yet state concrete durations (e.g. accounting = 7 years per Israeli tax law; audit/consent logs = N years). Counsel must fill exact numbers; until then the drafts stay qualitative on purpose.

### 15.1.5 Consent record model (legal view)

The `consent_records` table (defined in `001_initial_schema.sql`, scope canon set by `021_vocabulary_and_consent.sql`) is the legal proof-of-consent store. Full field/behavior detail is in §15.2.3; legally the salient points are:

- Every consent, withdrawal, and deletion request is an **append-only timestamped row** tied to the auth user (`subject_id`), never an in-place flag flip — so the history is provable.
- Row-Level Security (`consent_self`) means a subject sees only their own records; the operator console reads them for compliance oversight (`admin.consentsTitle` / `getAllConsents` limited to 200 latest).
- The four Amendment-13 canonical scopes are enforced by a DB `CHECK` constraint (see §15.2.3) so an out-of-canon scope cannot be written.

### 15.1.6 OPEN placeholders — need owner + counsel

These are the live `[…]` placeholders in the published legal pages, plus structural counsel questions. **All block final publication.** (Cross-referenced from `SESSION-MEMORY.md` "Legal/compliance set" and "Official channels".)

| # | Placeholder / question | Where | Owner action |
|---|---|---|---|
| L-1 | **Controller legal name** (שם העוסק/החברה) | Privacy §1, §19 | owner provides registered entity name |
| L-2 | **Business / ח.פ. number** | Privacy §1 | owner provides |
| L-3 | **Postal address** (כתובת למשלוח דואר) | Privacy §1, §19 | owner provides |
| L-4 | **Jurisdiction city** `[עיר]` for courts | Terms §9 | owner + counsel |
| L-5 | **Refund / cancellation policy** `[to be completed]` | Terms §5 | owner + counsel (gated on pilot-price decision) |
| L-6 | **Accessibility coordinator** — name + phone + last-updated date | Accessibility §"contact" | owner appoints; real remediation pass (task #27) |
| L-7 | **DPO / representative** — required? | not present in drafts | counsel ruling (Amendment 13 / GDPR Art. 27/37) |
| L-8 | **Concrete retention periods** | Privacy §11 | counsel provides durations |
| L-9 | **Terms "Mirror"→private-view re-alignment** in HE source | Terms HE §1 | copy fix before counsel sign-off (canon) |

Known contact inboxes already wired (do not need counsel, per SESSION-MEMORY "Official channels"): `privacy@lock.show`, `legal@lock.show`, `support@lock.show` (accessibility), `hello@lock.show`. Phone/WhatsApp `+972544555060`.

---

## 15.2 CONSENT

LOCK uses **two independent consent surfaces** that must not be confused:

1. a **cookie/analytics consent banner** (site + app), and
2. **four in-product consent scopes** captured in context and stored in `consent_records`.

Canon rule (from `ConsentLegal.jsx` and consent copy): **nothing is ever bundled.** Each scope is asked at the moment it becomes relevant, never as one upfront wall.

### 15.2.1 Cookie / analytics banner — Consent Mode v2

**Ruling: Consent Mode v2, BASIC implementation, default = denied.** GA4 (`G-ZX907M2NY8`) does **not** load until the user grants; on grant, `analytics_storage` flips to `granted` and the GA4 script is injected (basic model — the tag is withheld entirely pre-consent, rather than the advanced model where cookieless pings are sent while denied). Rationale: the pilot has no ad pixels and no need for pre-consent modeling; basic is the privacy-maximizing and simplest-to-defend choice, and matches the shipped code.

Grounded in `src/components/ConsentBanner.jsx` and `docs/legal/CONSENT-BANNER-SPEC.md`:

- **Default denied on first paint** (spec): `ad_storage/analytics_storage/ad_user_data/ad_personalization = 'denied'`, `wait_for_update: 500`, before any GA call.
- Bottom banner, keyboard-accessible (`role="dialog"`, `aria-label`), **direction-aware** (`dir = lang==='he' ? 'rtl' : 'ltr'`), links to `/privacy`.
- **Accept** → `gtag('consent','update',{ analytics_storage:'granted' })` → inject GA4 → `config` with `anonymize_ip: true`. **Decline** → stays denied, GA4 never loads.
- **Persistence & re-ask:** choice stored in `localStorage` key `gigproof_consent` as `{value, at}`; **re-ask after 12 months** (`MAX_AGE_MS = 365d`; spec allows 6–12) or on policy change. A "שנה העדפות / change preferences" control lives in the footer (site: `consent.preferences`).
- **Acceptance criteria (spec):** zero GA network calls before consent; reject path sends zero analytics; RTL/Hebrew correct; WCAG AA; do not bundle marketing/ad pixels unless/until paid ads exist.

> **🐛 SHIPPED DEFECT (app banner) — carry into the build board.** `LOCALIZATION-MATRIX.md` flagged that `en.js`/`he.js` historically declared the `consent:` key **twice**, so the banner strings were shadowed to `undefined`. The current tables were since split into a distinct **`cookieConsent`** block (`en.js`/`he.js` lines 2–9) which `ConsentBanner.jsx` must read — **but the component still references `T.cookieConsent`** (it does, line 52: `const t = T.cookieConsent`), so this is resolved *if and only if* the component points at `cookieConsent`, not `consent`. Verified resolved in the current `ConsentBanner.jsx`. Keep the two blocks distinct: `cookieConsent` = the analytics banner; `consent` = the in-product scope copy.

### 15.2.2 In-product consent — the four scopes, captured in context

Per `ConsentLegal.jsx`, all four scopes write through the **same** `recordConsentScope` path but fire at four different moments:

| Scope (canon value) | Fires where | Required? | Copy anchor (key) |
|---|---|---|---|
| `privacy-processing` | **inline checkbox on onboarding step 1** (never a full-screen wall before first value) — combines privacy-policy + data-processing | required to proceed | `consent.inlineTitle` / `consent.inlineAgree` |
| `thirdparty-evidence` | **at connect** — when the artist adds/authorizes a public source in EvidenceCapture | required to scan that source | `consent.evidenceTitle` / `consent.evidence` / `consent.evidenceGateCta` |
| `public-publication` | **at publish** — before the Passport goes live (onboarding step 7 / ArtistDashboard / ClaimReview) | required to publish only | `consent.publishTitle` / `consent.publishBody` / `consent.publishAgree` |
| `marketing` | **Settings toggle**, optional | never required | `consent.marketingTitle` / `consent.marketing` |

**Per-connection consent for the scan is the load-bearing promise.** Each scanned source is authorized individually, with the plain-language contract: *"we read only your public footprint; nothing is published until you confirm."* The evidence-capture copy already carries this (EN `evidence.authorityNote`: "By adding evidence you confirm you have authority over this source"; `evidence.communityPII`: never upload member lists — Israeli privacy law forbids it; we store the count only). The consent scope copy carries it too (`consent.evidence`: "collection and storage of evidence from public sources I authorize (links, ticket exports, documents)").

**Firewall in consent copy.** Privacy §7's consent-relevant clause is reproduced verbatim as product law: automated processing — deterministic or AI — *"does not, and will never, constitute a booking decision, score, ranking, percentile, prediction, or guarantee of any kind."*

### 15.2.3 `consent_records` — table & fields

Defined in `supabase/migrations/001_initial_schema.sql`; scope canon in `021_vocabulary_and_consent.sql`; accessed via `src/lib/db.js`.

```
consent_records
  id                uuid  PK  default gen_random_uuid()
  subject_id        uuid  NOT NULL  → auth.users(id) ON DELETE CASCADE
  scope             text  NOT NULL   -- CHECK (see below)
  version           text  NOT NULL   -- policy/consent version string
  status            text  NOT NULL  default 'accepted'
                          CHECK (status in ('accepted','declined','withdrawn'))
  marketing_opt_in  boolean         default false
  timestamp         timestamptz NOT NULL default now()
RLS: consent_self — subject sees only their own rows
```

**Scope CHECK constraint (canon, migration 021):**
`scope in ('privacy-processing','public-publication','thirdparty-evidence','marketing','account-deletion')`

Migration 021 also **migrated legacy scope values** into canon and stashed originals in `scope_legacy`:
`privacy-policy`,`data-processing` → `privacy-processing` · `public-publish` → `public-publication` · `evidence-storage` → `thirdparty-evidence`.

**Access functions (`db.js`):**

- `recordConsent(rec)` — raw insert (full row).
- `recordConsentScope(userId, scope, extra)` — inserts `{subject_id, scope, version:'v3-inline-gates', status:'accepted', ...extra}`.
- `hasConsent(userId, scope)` — true if an `accepted` row exists.
- `getConsents(userId)` / `latestConsent(userId)` — history, newest first.
- `requestAccountDeletion(userId)` — inserts `{scope:'account-deletion', version:'v1', status:'withdrawn'}`.

> **⚠ CONSISTENCY GAP (engineering, not legal) — OWED.** `ConsentLegal.jsx`'s `recordPrivacyConsent` still calls `recordConsentScope(userId, 'privacy-policy')` and `'data-processing'` — the **pre-021 legacy scope names** — while the DB CHECK now only accepts the canonical `privacy-processing`. Under the current constraint these inserts would be rejected (or need the legacy-mapping path). The write path must be updated to emit `privacy-processing` (and the other three canon scopes). Flag for the build board; it does not change the legal design, only the string the code writes. Likewise `version` strings differ across call sites (`v3-inline-gates` vs `v1` vs settings-list `(v2)` labels) — pick one versioning scheme and record the policy version that was actually shown.

### 15.2.4 Withdrawal

- **Optional consents** (marketing) — withdrawable anytime: unsubscribe link in every marketing message + Settings toggle (Privacy §15; `settings.consents`). Withdrawal never affects service/transactional messages.
- **Publication** — the artist can unpublish the Passport at any time (`consent.publishBody`: "I can unpublish at any time"). Caveat disclosed (Privacy §8): copies already saved/forwarded by third parties cannot be recalled.
- **Third-party evidence / representation grants** — artist-granted access is revocable (`representation.revoke`, `access.*` scopes; "a grant, never ownership").
- **Account/data deletion** — the withdrawal-of-everything path in §15.1.4.

---

## 15.3 LOCALIZATION ARCHITECTURE

### 15.3.1 Principles (owner law — `LOCALIZATION-MATRIX.md`, `SESSION-MEMORY.md`)

- **Launch language is HEBREW.** EN and HE must **each** be complete and professional on their own — HE is not "EN with Hebrew sprinkled in," and EN must not regress to service-Hebrew.
- **Never mixed within a rendered screen.** A user in HE mode sees 100% Hebrew — no English leftovers. (Missing HE keys currently deep-merge to English, which produces exactly the forbidden mixed screen — see gaps below.)
- **Built for language scaling.** i18n keys complete, **no hardcoded strings**, RTL/LTR both native, per-key fallback. EN + HE now (both first-class); Russian + German next.
- **Firewall/method-label vocabulary is identical in both languages** per `GLOSSARY.md`.

### 15.3.2 The key system (no hardcoded strings)

Two parallel i18n systems, by surface:

| Surface | System | Shape | Consumer |
|---|---|---|---|
| **App** (`src/`) | `src/lib/i18n/en.js` + `he.js` exporting `T` (+ `BANDS`, `PROFILE_ITEM_TYPES`) | nested JS object; leaf values are strings **or functions** for interpolation (e.g. `stepOf: (s,total) => …`, `confirmBody: (email) => …`) | `LangContext` provides `{ T, lang }`; components read `T.section.key`; **`LangContext` deep-merges HE over EN** so a missing HE leaf silently falls back to EN |
| **Site** (`website-next/`) | `messages/en.json` + `he.json` | flat-ish JSON namespaces (`nav, footer, home, passport, methodology, common, consent`) | `lib/locale-context.tsx`; `components/nav.tsx` `LocaleToggle` |
| **Demo fixtures** | `src/lib/demo.js` | `L(en, he)` bilingual getter per datum | language purity by construction |

Enforcement: `npm run lint:i18n` (`scripts/i18n-purity.mjs`) fails the build on hardcoded UI strings. Current baseline = **3 accepted violations**, all regex *matchers* in `src/lib/radarUniverse.js` (classifier patterns, not rendered copy) — marked `i18n-allow`, not real debt.

### 15.3.3 Current matrix status (measured — `LOCALIZATION-MATRIX.md` v1.1)

| Surface | Coverage | Blocking gap for HE launch |
|---|---|---|
| **App `T`** | **~83.6%** (858 EN leaf keys · ~141 missing in HE, latest measure) | Core **Radar/universe** screens least translated (`radar.universe.*`, `radar.nextActions.*`, `radar.dimensions.*`), plus `evidence.*` intent-capture, `claims.*` review/approve, `onboarding.*` goal copy. Missing keys fall back to EN → mixed screens (forbidden). |
| **Site `messages/*.json`** | **100% key parity**, but `he.json` self-flagged `SCAFFOLD ONLY — requires native Hebrew editor review`; ~13 EN-identical values (mostly intentional fixed method-label tags) | needs a **native-editor QA pass**; key-parity ≠ launch-ready |
| **Site page prose** (`app/**/page.tsx`) | **~0% / ~18% of routes wired** | **STRUCTURAL / highest blocker:** 8 of 11 routes (`bookers, artists, producers, contact, how-it-works, pricing, faq, radar` — ~3,650 lines) are hardcoded English JSX with **no locale wiring at all** — nothing to translate until the prose is externalized into `messages/*.json`. The nav locale toggle is live on these pages but does nothing to their body. |
| **Legal pages** | bilingual HE+EN present | draft, counsel-gated (§15.1) |
| **Transactional email** | **un-auditable from repo** | almost certainly Supabase Auth default EN-only templates (dashboard-configured, not versioned); decide if HE transactional email is in the launch gate |

**Bottom line:** the **app** is one focused translation pass (~141 keys, Radar-first) from coverage; the **marketing site body** needs a structural externalization step before it can be Hebrew at all. Both need a native-editor professional-HE review; key-coverage is necessary, not sufficient.

### 15.3.4 RTL rules

**Direction is derived from language, not hardcoded.** The pattern in `ConsentBanner.jsx` is canonical: `const dir = lang === 'he' ? 'rtl' : 'ltr'` and `dir={dir}` on the root of any directionally-sensitive block; the document root should carry `dir="rtl"` in HE mode.

Rules for the build:

- **Layout mirroring.** In HE (RTL) the whole page mirrors: reading order right→left, nav rail and back-arrows flip side, drop-shadows/gutters mirror. Use **logical CSS properties** (`margin-inline-start/end`, `padding-inline-*`, `inset-inline-*`, `text-align: start/end`) and Tailwind logical utilities (`ms-*/me-*`, `ps-*/pe-*` — already used, e.g. `ConsentLegal.jsx` `ms-2`) rather than physical `left/right`, so a single tree serves both directions.
- **What mirrors vs what does not.** *Mirror:* text blocks, form fields + labels, nav/menus, list bullets, progress/stepper order, chevrons/back-arrows, sheet slide-in side. *Do NOT mirror:* the LOCK wordmark/logo, brand-Latin names (artist/stage names stay Latin in both languages — see demo.js rule), media (photos/video), **method-label chips** (kept in English inside Hebrew text by design — see §15.4), and directional media controls that map to time.
- **Numbers, dates, direction handling.** Digits are Western Arabic numerals in both languages (bands like `₪2,000–5,000`, `50–150`, `60–90 דק׳` are identical strings in `he.js`/`en.js`). Currency symbol `₪` precedes the number in both. **Bidi isolation:** any string that mixes RTL Hebrew with LTR runs (URLs, emails, `@handles`, phone `+972…`, Latin brand names, method-label chips) must be wrapped so the LTR run does not visually scramble the Hebrew — use `dir="auto"`/`<bdi>` or Unicode isolates on interpolated values. This is especially important for the function-valued keys that interpolate names/links (e.g. `askedToConfirm(name)`, `whatsappMsg(...)`, `reviewedShort(d)`).
- **Icons/affordances.** Directional glyphs in strings must flip: HE uses `←`/`→` deliberately (e.g. `production.manageTeam: 'ניהול צוות ←'` vs EN `'Manage team →'`; `evidence.changeIntent: '← Different claim'`). Keep these as translated per-language strings, not shared, so the arrow points the right way.
- **Consent banner & legal pages** already set `dir` per language and must keep doing so; the `LegalDocument` component renders each language block in its own direction.

### 15.3.5 Font ruling (the DS is silent on Hebrew — resolved here)

**Finding.** Two different font stacks ship, and they disagree on Hebrew:

- **App (`src/`, `tailwind.config.js` + `index.html`)** — **already Hebrew-capable.** Display = **Frank Ruhl Libre** (Hebrew + Latin serif) → Georgia → serif; Body/UI = **Heebo** (covers Hebrew) → system-ui → sans; Mono = IBM Plex Mono. All three loaded from Google Fonts. This stack renders Hebrew in the brand voice.
- **Marketing site (`website-next/app/layout.tsx`)** — **NOT Hebrew-capable.** It loads **Manrope** (Latin-only) via `next/font/google` into a CSS variable **misleadingly named `--font-heebo`**, with `fontFamily: 'var(--font-heebo), Manrope, system-ui, sans-serif'`. There is **no actual Hebrew font in the site stack** — Hebrew would fall back to the OS system font, breaking brand consistency. The design-system reference (Manrope body / Georgia display) is silent on Hebrew because it was authored Latin-first.

**Ruling (binding for the HE launch):**

1. **The app stack is correct — keep it.** Frank Ruhl Libre (display) + Heebo (body) is the canonical **Hebrew-capable** pairing and matches the DS intent (editorial serif display + clean sans body) while covering Hebrew.
2. **The marketing site must adopt the same Hebrew-capable stack before HE launch.** Load **Heebo** for body (replacing/co-loading with Manrope) and **Frank Ruhl Libre** for display, and **rename the `--font-heebo` variable to reflect what it actually loads** (today it loads Manrope, not Heebo — a latent trap). Do not ship Hebrew site copy on a Manrope-only stack.
3. **The DS must state a Hebrew stack explicitly.** The design system is silent on Hebrew; this section fills the gap: **display = Frank Ruhl Libre; body/UI = Heebo; both must be loaded wherever Hebrew renders.** Georgia/Manrope remain the Latin fallbacks only. (Flag to Codex/DS owner as a DS gap; the app is already compliant, the site is not.)
4. Weights already loaded (app): Frank Ruhl Libre 400/700/900, Heebo 400/500/600/700/800 — sufficient for HE headings and UI.

---

## 15.4 THE DELIVERED HEBREW STRING SET

This is the piece the rest of the master spec **defers**; it is delivered here. Strings below are drawn from the shipped `src/lib/i18n/he.js` where they exist (marked **✓ shipped**), and provided as **strong drafts** where a key is missing or where a screen needs ratified microcopy (**◐ PENDING owner taste**). All were checked against the firewall and against the canon HE vocabulary.

### 15.4.0 Canon HE vocabulary (binding — `GLOSSARY.md`, `ENTITY-GLOSSARY.md`)

| Concept | HE canon term | Forbidden / note |
|---|---|---|
| Public buyer view | **פספורט** / הפספורט הציבורי | never **דרכון** (any form) |
| Artist private view | **האזור הפרטי (הרדאר)** | never **מראה / Mirror** (retired) |
| The bookable project | **אקט** (de-facto live term) | formal taste-ratification still pending; never invent a third term (not מופע/פרויקט in UI) |
| Source Confirmer | **מאשר-מקור** (only UI term) | "מפיק מאשר" = historical alias, docs only |
| Professional buyer | **מזמין הופעות** / מנהל בוקינג / פרומוטר | booking language OK for pros |
| Artist-side agent/office | **אמרגן / משרד אמרגנות** | **buyer is NEVER an אמרגן** (supply side only) |
| Private event client | **לקוח פרטי / מזמין אירוע** | warm, non-industry register; never venue jargon |
| Method labels | **kept in English inside HE text** by design | do NOT translate the chip tags |

**Method-label chips (universal tags — rendered in EN inside HE; HE gloss for reference only):**

| Chip (rendered) | HE gloss (`he.methodLabel`, for tooltips/reference) |
|---|---|
| PRODUCER-CONFIRMED | אושר ע"י מפיק |
| Evidence-supported | נתמך בראיות |
| Source-linked | מקושר למקור |
| Self-declared / Artist-declared | הצהרת האמן |
| Unable to verify | לא ניתן לאמת |
| Stale | לא עודכן לאחרונה |

### 15.4.1 Onboarding (`onboarding.*`) — ✓ shipped

| Key | EN | HE |
|---|---|---|
| entryTitle | Your name on the flyer | השם שלך על הפלייר |
| entryHint | Two quick questions and your Radar takes over… | שתי שאלות קצרות — ומכאן הרדאר לוקח פיקוד ואוסף איתך את כל השאר, בקצב שלך. |
| entryLinkTitle | Your strongest link | הקישור החזק שלך |
| entryLinkHint | One link that shows you best — Instagram or SoundCloud. The Radar scans it… | קישור אחד שמציג אותך הכי טוב — אינסטגרם או סאונדקלאוד. הרדאר סורק אותו ומתחיל לבנות את ההוכחות שלך. |
| entryDeferNote | Photo, gigs, numbers… nothing else is asked now. | תמונה, הופעות, מספרים, שאר הקישורים — לא שואלים עכשיו. הרדאר יציף כל אחד מהם כצעד שקט הבא, כשזה רלוונטי. |
| entryStartScan | Scan it — open my Radar | סרוק — ופתח את הרדאר שלי |
| goalTitle | What are you trying to achieve? | מה אתה מנסה להשיג? |
| goalWhy | Your goal decides which evidence we prioritize — it never changes what is true. | המטרה קובעת אילו ראיות נקדם קודם — היא לעולם לא משנה מה נכון. |
| stepOf(s,total) | Step {s} of {total} | שלב {s} מתוך {total} |

*Consent inline (fires here):* `consent.inlineTitle` = **פרטיות ושימוש בנתונים** ; `consent.inlineAgree` = *אני מסכים למדיניות הפרטיות של LOCK ולעיבוד המידע שסיפקתי לצורך בניית הפרופיל שלי.* ✓ shipped.

### 15.4.2 Radar inspector / universe (`radar.*`)

Mixed status — the North-Star next-actions and act-switch are ✓ shipped in HE; several `universe.*` leaves fall back to EN and are delivered here as **◐ PENDING** drafts to close the mixed-language gap.

| Key | EN | HE | Status |
|---|---|---|---|
| scanKickoff | Your Radar is live — strengths appear first; anything that needs you waits quietly below. | הרדאר שלך פועל — חוזקות מופיעות קודם; מה שצריך אותך מחכה בשקט למטה. | ✓ shipped |
| genrePrimary | Central in your genre | מרכזי בז'אנר שלך | ✓ shipped |
| nextActions.publish.title | Publish your Passport | פרסם את הפספורט שלך | ✓ shipped |
| nextActions.share.title | Share your Passport with a buyer | שתף את הפספורט עם מזמין הופעות | ✓ shipped |
| nextActions.replyRequest.title | A buyer is waiting — reply to the request | מזמין ממתין — ענה לבקשה | ✓ shipped |
| nextActions.refreshProof.why | Your newest evidence is over 90 days old… | הראיה החדשה ביותר שלך בת יותר מ-90 יום. ראיה טרייה מהופעה אחרונה שומרת את הדרכון עדכני. | ✓ shipped *(note: uses "הדרכון" — should read "הפספורט"; **fix — דרכון is forbidden**)* |
| dimensions.identity / liveDraw / trackRecord / community / readiness | Identity / Live draw / Track record / Community / Booking readiness | זהות / משיכה חיה / קורות מסלול / קהילה / מוכנות להזמנה | ◐ PENDING (EN-fallback today) |
| universe.planets.identity…proof | Identity & Story / Music & Catalogue / Live Show / Audience & Community / Professional Kit / Career Proof | זהות וסיפור / מוזיקה וקטלוג / הופעה חיה / קהל וקהילה / ערכת מקצוען / הוכחת קריירה | ◐ PENDING (EN-fallback today) |
| universe.whatItProves / whatItDoesNotProve | What it proves / What it does NOT prove | מה זה מוכיח / מה זה **לא** מוכיח | ◐ PENDING |
| universe.nothingNeedsYou | Nothing needs you right now. | אין כרגע שום דבר שדורש אותך. | ✓ shipped |
| actSwitch.newActHint | New act starts empty — evidence never transfers between acts | אקט חדש מתחיל ריק — ראיות לא עוברות בין אקטים | ✓ shipped |

> **Fix flagged:** `radar.nextActions.refreshProof.why` (he.js) contains **הדרכון** — replace with **הפספורט** (canon; דרכון forbidden). This is the one live firewall/vocabulary slip found in the shipped HE.

### 15.4.3 Passport — buyer-facing (`passport.*`) — ✓ shipped

| Key | EN | HE |
|---|---|---|
| chip | Verified professional profile | פרופיל מקצועי מאומת |
| firewall | LOCK presents verified professional facts by source. No promises or predictions. | LOCK מציג עובדות מקצועיות מאומתות לפי מקור. ללא הבטחות וללא ניבויים. |
| drawCaption | FIGURES SHOWN AS BAND — NO EXACT HEADCOUNT | מוצג כטווח — ללא ספירת ראשים מדויקת |
| disclaimer | THIS PASSPORT SHOWS VERIFIED STRENGTHS ONLY. NO SCORE · NO RANKING · NO PREDICTION · NO GUARANTEE… | הפספורט מציג חוזקות מאומתות בלבד. ללא ציון · ללא דירוג · ללא ניבוי · ללא הבטחה. כל טענה נושאת את שיטת האימות והתאריך שלה. משיכת קהל מוצגת כטווח — לעולם לא מספר מדויק. |
| checkAvailability | Check availability | בדיקת זמינות |
| communityCaption | CONTEXTUAL — NOT DRAW EVIDENCE | הקשר בלבד — לא ראיית משיכה |
| readinessCaption | BINARIES ONLY — READY OR NOT SHOWN | בינארי בלבד — מוכן, או לא מוצג |
| reviewedShort(d) | REVIEWED {d} | נבדק {d} |

### 15.4.4 Requests / availability (`request.*`, `agency.*`) — ✓ shipped

| Key | EN | HE |
|---|---|---|
| request.title(name) | Availability check — {name} | בדיקת זמינות — {name} |
| request.subtitle | Fill in the details and the artist will get back to you. No commitment. | ממלאים פרטים, והאמן יחזור אליך. בלי התחייבות. |
| request.capacity | Expected audience (range) | קהל צפוי (טווח) |
| request.budget | Budget (range) | תקציב (טווח) |
| request.noCommitment | No commitment — this only asks the artist about the date. | ללא התחייבות — זו רק שאלה לאמן לגבי התאריך. |
| request.confirmBody(name) | {name} will get back to you soon. Thank you. | {name} יחזור אליך בקרוב. תודה. |
| agency.requestsEmptyHint | No requests yet. Share a published Passport link — availability requests land here. | אין בקשות עדיין. שתף קישור לפספורט מפורסם — בקשות זמינות נוחתות כאן. |

### 15.4.5 Source-Confirmer (`producer.*`) — ✓ shipped (accountless one-claim flow)

Canon: this person is a **מאשר-מקור**; the `producer.*` namespace is the shipped code home for the one-tap confirmation ceremony. The confirmation is about ONE statement and never becomes a score.

| Key | EN | HE |
|---|---|---|
| oneStatementEyebrow | One-statement confirmation | אישור של הצהרה אחת |
| askedToConfirm(name) | {name} asked you to confirm one statement. | {name} מבקש ממך לאשר הצהרה אחת. |
| noAccountNote | No account needed. Your reply applies to this statement only. | בלי חשבון ובלי הרשמה. התשובה שלך חלה על ההצהרה הזאת בלבד. |
| confirmYes | Yes — this is accurate | כן — זה מדויק |
| confirmPartial | Partly right — needs a fix | נכון חלקית — צריך תיקון |
| confirmNo | No — this isn't accurate | לא — זה לא מדויק |
| confirmWrongPerson | I'm not the right person for this | אני לא האדם המתאים לזה |
| footnote | This confirmation refers to the specific statement above only — it is not a general endorsement and never becomes a score. | האישור הזה מתייחס אך ורק להצהרה הספציפית שלמעלה — הוא אינו המלצה כללית ולעולם אינו הופך לציון. השם שלך מוצג כפי שתבחר. |

> **◐ PENDING (terminology):** the UI-visible eyebrow/labels for this flow should surface **מאשר-מקור** where the role is named to the artist (e.g. request-to-confirm screens), even though the code namespace is `producer`. Current strings say "מפיק"; owner-ratify the swap to **מאשר-מקור** in artist-facing copy (`producer.requestTitle` → *בקש ממאשר-מקור לאשר* as a draft).

### 15.4.6 Buyer / discover (`booker.*`) — ✓ shipped

| Key | EN | HE |
|---|---|---|
| booker.eyebrow | Booking manager | מזמין הופעות |
| booker.whatIsTitle | What is a LOCK passport? | מה זה פספורט LOCK? |
| booker.whatIsBody | A standardized evidence page an artist shares before you book them. Every claim carries its verification method and review date… never a score. | עמוד ראיות אחיד שאמן משתף איתך לפני שאתה סוגר אותו. כל טענה נושאת את שיטת האימות ותאריך הבדיקה שלה, ומשיכת קהל מוצגת כטווח — לעולם לא מספר מדויק, לעולם לא ציון. |
| booker.whatIsPoints[1] | Method-labeled claims — you see how each fact was verified | טענות עם תווית שיטה — רואים בדיוק איך כל עובדה אומתה |
| booker.whatIsPoints[2] | Draw as bands and binaries — no rankings, no predictions | משיכה כטווחים ובינאריים — בלי דירוגים, בלי ניבויים |

> **◐ PENDING (private-client register):** for the **private buyer** (wedding couple / private event — `לקוח פרטי`), the demand-side canon requires a **warmer, non-industry** variant of buyer copy — not "מזמין הופעות" venue jargon. No such register exists in `he.js` yet. Draft opener for owner taste: *"מזמינים אמן להופעה?"* / body avoiding booking jargon (style, fit, trust, availability). This is a **new string set OWED** once the private-buyer flow is built.

### 15.4.7 Settings — deletion & consent (`settings.*`) — ✓ shipped

| Key | EN | HE |
|---|---|---|
| deleteWarning | This action is irreversible. All your data is deleted within 30 business days, as Israeli privacy law requires. | פעולה זו בלתי הפיכה. כל הנתונים יימחקו תוך 30 ימי עסקים לפי תיקון 13. |
| deleteSubmitted | Your data deletion request has been received. We will send a confirmation email and delete all data within 30 business days. | בקשת מחיקת הנתונים שלך התקבלה. אנו נשלח אישור לאימייל ונמחק את כל הנתונים תוך 30 ימי עסקים. |
| consentsContact | For full management contact: privacy@lock.show (DRAFT) | לניהול מלא צור קשר: privacy@lock.show (DRAFT) |

### 15.4.8 Cookie banner (`cookieConsent.*`) — ✓ shipped

| Key | EN | HE |
|---|---|---|
| ariaLabel | Cookie consent | הסכמה לקובצי Cookie |
| message | We use analytics cookies to understand how the product is used. Essential cookies always work; measurement runs only with your consent. | אנחנו משתמשים בקובצי Cookie למדידה כדי להבין איך המוצר משמש אתכם. קובצי Cookie חיוניים פועלים תמיד; מדידה פועלת רק בהסכמתכם. |
| accept / decline | Accept / Decline | אישור / דחייה |
| privacyLink | Privacy Policy | מדיניות פרטיות |

### 15.4.9 HE strings needing owner ratification (summary)

| # | Item | Draft / issue |
|---|---|---|
| H-1 | **`radar…refreshProof.why`** uses **הדרכון** | change to **הפספורט** (canon; firewall/vocabulary fix) — engineering fix, not taste |
| H-2 | **Radar `universe.*` / `dimensions.*` HE** | ~missing leaves fall back to EN (mixed screen); drafts in §15.4.2 need native-editor + owner sign-off |
| H-3 | **Source-Confirmer artist-facing labels** | swap visible "מפיק" → **מאשר-מקור** in artist copy; §15.4.5 draft — owner taste |
| H-4 | **Private-buyer (`לקוח פרטי`) register** | new warm, non-jargon string set OWED once the flow exists; §15.4.6 draft opener |
| H-5 | **`אקט` formal ratification** | de-facto live; owner taste-ratification pending (non-blocking) |
| H-6 | **Terms HE "Mirror"→private-view** | align HE legal source to canon before publication (L-9) |
| H-7 | **Site `he.json` scaffold** | native-editor QA pass; ~13 EN-identical values confirmed intentional or fixed |

---

## 15.5 Buildable-from checklist (what §15 hands the implementer)

- [ ] Legal: fill L-1…L-9 (owner + counsel); keep draft banners until sign-off; re-align Terms HE "Mirror".
- [ ] Consent banner: Consent Mode v2 **basic, default denied**; verify zero GA calls pre-consent; keep `cookieConsent` block distinct from `consent`.
- [ ] Consent scopes: fire the four scopes in-context (never bundled); **fix write path to emit canon scope `privacy-processing`** (not legacy `privacy-policy`/`data-processing`); unify `version` scheme.
- [ ] `consent_records`: enforce scope CHECK (canon 5 values); append-only; RLS `consent_self`; deletion writes audit row before cascade.
- [ ] Localization: translate ~141 app keys (Radar-first) to professional HE; externalize 8 site routes' prose into `messages/*.json` before any site HE; native-editor QA on `he.json`.
- [ ] RTL: `dir` from language everywhere; logical CSS props; bidi-isolate interpolated LTR runs; keep method-label chips EN.
- [ ] **Fonts: adopt Heebo (body) + Frank Ruhl Libre (display) on the marketing site; rename the mislabeled `--font-heebo` (loads Manrope); add a Hebrew stack to the DS.**
- [ ] Deliver §15.4 HE strings; resolve H-1…H-7 with owner.

---

*End of §15. Firewall re-verified across all copy in this section: no score / % / rank / prediction / gauge; draw only as bands + binaries with method labels; method-label chips kept in English by design.*
