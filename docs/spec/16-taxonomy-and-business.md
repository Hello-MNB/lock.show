# 16. Taxonomy & Business

_Section 16 of the LOCK Master Product Specification. Standalone, grounded in the repo._
_Author lens: product strategy + data-taxonomy design. Status date: 15 Jul 2026._

> **Reading rules inherited from the master spec (§0.2):** the firewall (CLAUDE.md) is absolute
> and overrides everything; the glossary (§4 / `docs/GLOSSARY.md`) is binding; code identifiers are
> frozen (renames are governed migrations); **BUILT is never presented as TARGET**; unresolved items
> are marked **OPEN** (owner ruling) or **OWED** (a deliverable another party must supply).
>
> **Firewall reminder for this whole section:** nothing here may become a score, percentile, rank,
> "bookability %", prediction, or gauge. Genre weightings are INTERNAL prioritization only
> (`src/lib/genreWeights.js` header: "never rendered as a number, score, rank, percentage, genre
> leaderboard, public badge, or buyer-facing weakness"). Draw is shown only as bands + binaries with
> method labels. Streaming is secondary context.

---

## 0. Why this section exists

Today **genre and format are free text.** Verified in code and DB:
- `src/lib/genreWeights.js` resolves a family from `act.format` plus a *temporary* text heuristic
  (`FESTIVAL_HINT = /festival|psytrance|trance|rave/i`), explicitly accepted "until a controlled
  `scene_family` field ships with migration 034."
- `src/lib/radarUniverse.js` splits `artist.genre` on `/[\/,·]+/` — i.e. it parses a free-text string.
- `docs/TAXONOMY-REGISTRY-AUDIT.md` (8 Jul) confirmed: **"app genre tags are free text"**, the DB has
  **no `field_id`**, `claims.claim_type` is free text, and the real taxonomy (6 families · 55 subtypes ·
  32 DJ specializations · 42 instruments · 121 legacy labels) lives **only in a Google Sheet**, with
  Registry B empty. It flagged **migration 029 (bilingual reference tables)** as the fix, later
  re-scoped alongside the `scene_family` field at **migration 034**.

**This section is the reference registry the product needs** — the bounded, bilingual tables a
migration would create so that genre, format, venue/region, method/status, and source all stop being
free text and start being governed enums with EN + HE labels. Part A is the taxonomy. Part B captures
the documented business model and clearly flags what still needs the owner.

**Migration note:** the migration head is already past 029 (VERSIONS.md: applied 032/033/034/035; 021
FROZEN). The historical "029" label from the taxonomy audit is superseded — **these reference tables
should be authored as a NEW migration (036+), diffed against existing tables first (CLAUDE.md rule),
never recreating existing tables.** Wherever this section says "migration 029" it means "the bilingual
reference-table migration, now 036+."

---

# PART A — TAXONOMY

Each taxonomy below is presented as the reference table a migration would create: `id` (stable code /
enum value) · `EN` (locked English label) · `HE` (Hebrew label) · `notes`. Codes are `lower-kebab`
and are the frozen identifiers; labels are display-only and localize.

> **HE labels are OPEN for owner/Codex taste-ratification.** Per the standing HE-ruling rule
> (`docs/GLOSSARY.md`, SESSION-MEMORY), Maria owns the canonical Hebrew column and terms are never
> invented. The HE labels in the genre and venue tables below are *proposed seeds* — professional
> defaults for the owner to confirm or correct, not canon until she signs them.

---

## 16.A.1 Genre / scene taxonomy

Two layers, deliberately separated (the taxonomy audit's G4/D4 finding: don't collapse a rich scene
list into the coarse family used for planet weighting):

- **Layer 1 — Scene (`genre_scene`):** the music-scene the artist actually names (melodic techno,
  afro house, psytrance…). This is the free-text field today; the table below is what closes the gap.
- **Layer 2 — Family (`genre_family`):** the 8 bounded families in `genreWeights.js:GENRE_FAMILIES`
  that drive Radar planet emphasis. Every scene maps to exactly one family. Family is *also* derivable
  format-first (see §16.A.2), so scene→family is an override/refinement, not the only path.

### 16.A.1.a — `genre_family` reference table (drives planet weighting — from `genreWeights.js`)

The six planets are: **identity · music · live · audience · prokit · proof** (`radarUniverse.js:PLANETS`).
"Primary" planets are where the family's evidence carries the most booking weight; they order
next-action guidance and planet emphasis **only** — never a public number.

| id (`genre_family`) | EN | HE (proposed) | Primary planets | Secondary planets | Notes |
|---|---|---|---|---|---|
| `dj-club` | Club DJ | תקליטן מועדונים | live · audience · prokit | proof · identity | Default IL DJ family; from `act.format='dj-set'` w/o festival hint |
| `dj-festival` | Festival DJ | תקליטן פסטיבלים | music · live · proof | audience · identity | `dj-set` + festival/psytrance/trance/rave text hint |
| `open-format` | Open-format / events DJ | תקליטן אופן-פורמט | prokit · live · proof | audience · identity | `act.format='open-format'` |
| `live-band` | Live band | הרכב חי / להקה | live · prokit · proof | audience · identity | `act.format='band'` or `'duo'` |
| `original-artist` | Original artist / vocalist | אמן מקורי / זמר-ית | music · identity · live | proof · audience | `act.format='vocalist'` |
| `live-electronic` | Live electronic act | סט אלקטרוני חי | music · live · identity | prokit · proof | `act.format='live-set'` |
| `comedian-host` | Comedian / host / MC | סטנדאפיסט / מנחה | live · identity · prokit | proof · audience | Not yet reachable from a `format` value — see gap note |
| `corporate-ceremony` | Corporate / ceremony act | אמן אירועים / טקסים | prokit · proof · live | identity · music | Not yet reachable from a `format` value — see gap note |

> **Firewall:** the "primary/secondary" columns are the internal emphasis order
> (`planetEmphasisOrder`, `isPrimaryPlanet`). They render as *guidance wording* only —
> i18n key `radar.genreFocus` ("A useful place to focus in your genre: …") and `genrePrimary`
> ("Central in your genre"). Never a weight, count, or leaderboard.
>
> **G2 guard (built):** when an act declares **no** genre/format signal, `hasGenreSignal` returns
> false and **no** planet is emphasized — every planet renders equal. A missing genre must never
> produce a guessed emphasis. The reference table must preserve this: a scene row is applied only
> when the artist actually selected it.

### 16.A.1.b — `genre_scene` reference table (the scene registry — NEW, closes the free-text gap)

Seed set below covers the electronic + IL demand the product serves today (the demo persona DJ PERLMAN
is multi-genre: psytrance Act + techno Act). It is **extensible** — the migration should allow adding
scenes without code changes. This is a *starter registry*, not the full 55-subtype sheet; the full
family-by-family fill (F1 first) is the OWED task from the taxonomy audit.

| id (`genre_scene`) | EN | HE (proposed) | → `genre_family` | Notes |
|---|---|---|---|---|
| `melodic-techno` | Melodic techno | מלודי טכנו | `dj-club` | |
| `techno` | Techno | טכנו | `dj-club` | |
| `progressive-house` | Progressive house | פרוגרסיב האוס | `dj-club` | |
| `afro-house` | Afro house | אפרו האוס | `dj-club` | |
| `house` | House | האוס | `dj-club` | |
| `deep-house` | Deep house | דיפ האוס | `dj-club` | |
| `tech-house` | Tech house | טק האוס | `dj-club` | |
| `minimal` | Minimal / deep tech | מינימל | `dj-club` | |
| `psytrance` | Psytrance | פסייטראנס | `dj-festival` | Festival family via hint |
| `progressive-psy` | Progressive psy | פרוגרסיב פסיי | `dj-festival` | |
| `trance` | Trance | טראנס | `dj-festival` | |
| `hard-techno` | Hard techno / rave | הארד טכנו | `dj-festival` | Rave hint |
| `open-format-events` | Open-format events | אופן פורמט אירועים | `open-format` | Weddings/corporate DJ sets |
| `mainstream-pop` | Mainstream / pop set | מיינסטרים / פופ | `open-format` | |
| `hip-hop` | Hip-hop / R&B | היפ-הופ | `open-format` | |
| `live-band-cover` | Cover / party band | הרכב אירועים | `live-band` | |
| `live-band-original` | Original band | להקה מקורית | `live-band` | |
| `singer-songwriter` | Singer-songwriter | זמר-ית / יוצר-ת | `original-artist` | |
| `vocalist-feature` | Vocalist / featured singer | זמר-ית אורח-ת | `original-artist` | |
| `live-electronic-act` | Live electronic act | לייב אלקטרוני | `live-electronic` | Hardware/DAW live set |
| `comedy-standup` | Stand-up / comedy | סטנדאפ | `comedian-host` | Needs a `format` path — see gap |
| `mc-host` | MC / event host | מנחה אירועים | `comedian-host` | |
| `ceremony-act` | Ceremony / corporate act | אמן טקסים / אירועים | `corporate-ceremony` | |

> **Proposed columns for `genre_scene`:** `id` (PK, kebab code) · `en_label` · `he_label` ·
> `family_id` (FK → `genre_family.id`) · `sort_order` · `active` (bool). The Radar reads
> `scene → family → primary planets`; the free-text `artist.genre` / `act.genre` migrates to a
> nullable FK, with the old string retained during transition.

**Gap flagged:** two families (`comedian-host`, `corporate-ceremony`) exist in `GENRE_FAMILIES` but
have **no** `act.format` value that resolves to them in `familyFor()` — they are only reachable once a
scene→family override or the planned `scene_family` field (migration 034) is wired. Until then a
comedian/ceremony act falls to the IL default (`dj-club`). This is an existing product gap, documented,
not introduced here.

---

## 16.A.2 Act-type / performance-format taxonomy

The bounded `act.format` enum — the CHECK constraint referenced in `genreWeights.js` and the switch in
`familyFor()`. This is **format-LED and deterministic at the first level** (the design principle: format
decides family; genre text only refines the DJ split).

| id (`act.format`) | EN | HE (proposed) | → default `genre_family` | Notes |
|---|---|---|---|---|
| `dj-set` | DJ set | סט תקליטן | `dj-club` (→ `dj-festival` on festival/psy text) | The one family split refined by genre text |
| `live-set` | Live electronic set | סט חי אלקטרוני | `live-electronic` | Hardware/live performance, not a mix |
| `band` | Band | הרכב / להקה | `live-band` | Full band |
| `duo` | Duo | דואו | `live-band` | Treated as live-band |
| `open-format` | Open-format DJ | תקליטן אופן-פורמט | `open-format` | Events/weddings/corporate |
| `vocalist` | Vocalist | זמר-ית | `original-artist` | Singer / featured vocalist |
| `other` | Other | אחר | IL default (`dj-club`) | Catch-all; no guessed emphasis under G2 if no genre text |

> **Entity note (§3 / ENTITY-GLOSSARY):** `format` is a property of the **Act**, not the Person. One
> artist may hold several Acts, each with its own format, genre, evidence, and Passport
> (`passport_version.act_id` binds to an Act). Evidence is per-Act and non-transferable.
>
> **Proposed reference table `act_format`:** `id` · `en_label` · `he_label` · `default_family_id` ·
> `sort_order` · `active`. Replaces the inline CHECK with an FK, keeping the enum values frozen.

---

## 16.A.3 Venue / room-type + region taxonomy

Used by Requests / Production / readiness (`prokit` planet fields `regions`, `set_length`). Today
`artist.regions` is free text with the placeholder "Center, North" (`i18n/en.js`). Three bounded
tables proposed.

### 16.A.3.a — `il_region` (Israeli regions)

| id (`il_region`) | EN | HE (proposed) | Notes |
|---|---|---|---|
| `center` | Center | מרכז | Gush Dan / Tel Aviv metro — the default in placeholder copy |
| `tel-aviv` | Tel Aviv | תל אביב | Optional finer grain within Center |
| `sharon` | Sharon | השרון | |
| `jerusalem` | Jerusalem area | ירושלים והסביבה | |
| `north` | North | צפון | Haifa, Galilee, Krayot |
| `south` | South | דרום | Be'er Sheva, Eilat, periphery |
| `lowlands` | Shfela / Lowlands | שפלה | Optional |
| `nationwide` | Nationwide | כל הארץ | "Travels anywhere" |

> Multi-select (an artist plays several regions). Proposed as a join table `act_region` (per-Act, since
> touring reach can differ between Acts).

### 16.A.3.b — `venue_type` (performance context / room type)

| id (`venue_type`) | EN | HE (proposed) | Aligns with `radarUniverse` world | Notes |
|---|---|---|---|---|
| `club` | Club | מועדון | `club` (`/club\|קלאב\|מועדון/`) | Nightclub |
| `festival` | Festival | פסטיבל | `festival` (`/festival\|פסטיבל\|stage/`) | Outdoor / stage |
| `bar-lounge` | Bar / lounge | בר / לאונג' | `club` | Smaller room |
| `wedding` | Wedding | חתונה | `weddings` (`/wedding\|חתונ\|private/`) | Private event |
| `private-event` | Private event | אירוע פרטי | `weddings` | Family / party |
| `corporate` | Corporate event | אירוע חברה | `weddings` (corporate pattern) | Company / conference |
| `theater-hall` | Theater / hall | אולם / תיאטרון | — | Seated venue |
| `arena` | Arena / large venue | אולם גדול / ארנה | — | Rare pre-Gate |

> These align with the **content-world tags** already in `radarUniverse.js:CONTEXT_WORLDS`
> (`club` / `festival` / `weddings`) — the classifier regexes there are the working seed; this table
> formalizes them into a governed enum. Worlds remain a *filter axis*, never a rank
> ("where do I stand" = evidence coverage per world, not a position).

### 16.A.3.c — `room_size_band` (capacity band — describes the ROOM, not the artist)

| id (`room_size_band`) | EN | HE (proposed) | Notes |
|---|---|---|---|
| `xs` | Under 150 | עד 150 | Bar / intimate |
| `s` | 150–400 | 150–400 | Small club |
| `m` | 400–800 | 400–800 | Mid club |
| `l` | 800–2,000 | 800–2,000 | Large club / small festival stage |
| `xl` | 2,000+ | 2,000+ | Festival / arena |

> **Firewall:** capacity bands describe the *room*, a context fact — they are **not** a measure of the
> artist. They must never be aggregated or presented as an artist-level draw score. Draw itself stays
> bands + binaries with method labels (§16.A.4).

---

## 16.A.4 Method-label + status vocabularies

These are already bounded enums in `src/lib/constants.js` — restated here as the closed taxonomies they
are. **These are canon and MUST NOT be extended without a firewall review.**

### 16.A.4.a — `method_label` (the 6 public "how verified" labels — `constants.js:METHOD_LABELS`)

| id (`method_label`) | EN (public chip) | HE (`docs/GLOSSARY.md`) | Strength | Notes |
|---|---|---|---|---|
| `producer-confirmed` | PRODUCER-CONFIRMED | מאושר ע"י מפיק | strongest | Set by server when a Source Confirmer vouches a specific claim |
| `evidence-supported` | Evidence-supported | נתמך בראיה/מסמך/מקור | strong | Maps from `verification_status='verified'` |
| `source-linked` | Source-linked | — (kept EN as universal tag) | medium | Maps from `verification_status='supporting'` |
| `artist-declared` | Self-declared | מדווח ע"י האמן | base | Maps from `verification_status='self-reported'` |
| `unable-to-verify` | Unable to verify | לא ניתן לאמת | n/a | Maps from `verification_status='not-assessable'` — N/A ≠ weakness |
| `stale` | Needs refresh | דורש רענון | time state | Auto-set when a claim passes `expires_at` |

> **Canon guard (ENTITY-GLOSSARY §2d):** the headline chip vocabulary is exactly
> **Producer-confirmed / Source-linked / Evidence-supported / Self-declared** and is **never** reworded
> to "source-confirmed" (which would blur into the *Source Confirmer* person). Method labels are kept in
> English inside Hebrew text by deliberate universal-tag design (GLOSSARY).

### 16.A.4.b — `verification_status` (claim provenance — `constants.js:VERIFICATION_STATUS`)

| id | EN | HE | Publishable to public Passport? |
|---|---|---|---|
| `verified` | Verified | מאומת (context-bound; never generic) | ✅ yes |
| `supporting` | Supporting | נתמך | ✅ yes |
| `self-reported` | Self-reported | מדווח ע"י האמן | ❌ no |
| `not-assessable` | Not assessable | לא ניתן להעריך | ❌ no |

> `PUBLISHABLE_STATUSES = [verified, supporting]` — the firewall gate on what may reach a public
> Passport. HE for "verified" is context-bound: the glossary forbids the generic **מאומת** standing
> alone.

### 16.A.4.c — `status` (the bounded readiness vocabulary — `constants.js:STATUS`)

| id | EN | HE (`constants.js` comment) | Notes |
|---|---|---|---|
| `strong` | Strong | חזק | |
| `developing` | Developing | מתפתח | |
| `missing` | Missing proof | חסר-הוכחה | An invitation, not a failure |
| `notAssessable` | Not assessable | לא-ניתן-להעריך | N/A ≠ zero |

### 16.A.4.d — Radar node states (`radarUniverse.js:NODE`)

| id | Glyph | EN | Notes |
|---|---|---|---|
| `confirmed` | ✓ | Confirmed | Artist-approved / connected |
| `found` | ✦ | Found | Discovered, awaiting confirm |
| `review` | ? | In review | Disputed |
| `missing` | + | Missing | A fillable invitation |

> **Firewall:** node states are *bounded states only, never numbers that grade the artist*
> (`radarUniverse.js` header). Planet rollup is `developing / established / needs` — also a state, never
> a count shown publicly (`foundCount` is working-only).

### 16.A.4.e — Supporting bounded enums (also in `constants.js`, for completeness)

| Enum | Values | Purpose |
|---|---|---|
| `visibility` | `passport-ok` · `mirror-only` · `internal` | What surface a claim/item may appear on |
| `source_status` | `public-verified` · `artist-provided` | Provenance of a profile item |
| Community band (`bandFromCount`) | `<250` · `250–500` · `500–1,000` · `1,000–2,500` · `2,500–5,000` · `5,000+` | Audience size shown ONLY as a band; the integer stays working-only (firewall) |
| Draw fields | `sells_tickets` (yes/no) · `price_band` · `lineup_frequency_band` | Draw as bands + binaries only |

> **Vocabulary drift note:** `mirror-only` remains a live CHECK value the app still writes, but canon
> retired "Mirror" (one Passport, shown in views). Migration 021 (which would drop it) is **FROZEN** —
> do not apply without app lockstep (SESSION-MEMORY). The reference-table migration must respect this.

---

## 16.A.5 Source / platform taxonomy

The platforms LOCK reads. Planet routing is from `radarUniverse.js:linkPlanet()`; "what it signals" is
firewall-safe (a footprint that can be checked against its source — never a score). The honesty lines
are the canon `PROVES` map (`radarUniverse.js:PROVES`, shown verbatim at the confirm moment).

| id (`source_platform`) | EN | HE (proposed) | → planet | What it signals (firewall-safe) | Israeli? |
|---|---|---|---|---|---|
| `spotify` | Spotify | ספוטיפיי | `music` | Public music footprint; secondary context — never a draw claim | |
| `soundcloud` | SoundCloud | סאונדקלאוד | `music` | Public catalogue / mixes footprint | |
| `bandcamp` | Bandcamp | בנדקמפ | `music` | Releases / catalogue footprint | |
| `apple-music` | Apple Music | אפל מיוזיק | `music` | Music footprint | |
| `deezer` | Deezer | דיזר | `music` | Music footprint | |
| `beatport` | Beatport | ביטפורט | `identity` / `music` | Release/label presence in electronic scene | |
| `youtube` | YouTube | יוטיוב | `live` | Live/set footage — performance footprint | |
| `vimeo` | Vimeo | וימאו | `live` | Performance footage | |
| `resident-advisor` | Resident Advisor | רזידנט אדוויזר | `identity` | Scene presence / event history (electronic) | |
| `instagram` | Instagram | אינסטגרם | `audience` | Public community footprint (shown as a band) | |
| `tiktok` | TikTok | טיקטוק | `audience` | Community footprint (band) | |
| `facebook` | Facebook | פייסבוק | `audience` | Community / events footprint | |
| `twitter-x` | X (Twitter) | X (טוויטר) | `audience` | Community footprint | |
| `telegram` | Telegram | טלגרם | `audience` | Community channel | |
| `eventer` | Eventer | אוונטר | `proof` | IL ticketing — ticket export / settlement = real sourced draw | ✅ |
| `tickchak` | Tickchak | טיקצ'אק | `proof` | IL ticketing — ticket export / settlement | ✅ |
| `go-out` | Go-Out | גו-אאוט | `proof` | IL events/ticketing — event history / ticket export | ✅ |

> **Firewall guards baked into the model:**
> - Streaming (`music` planet) is **secondary context** by canon — a footprint that "does not establish
>   local ticket demand" (`PROVES['public-profile'].notProves`). It never becomes a draw claim.
> - Audience platforms surface a **band**, never a follower count (`bandFromCount`).
> - Ticketing platforms (Eventer / Tickchak / Go-Out) feed the **`proof`** planet via the
>   evidence+consent flow — a ticket export "proves real, sourced draw" but "does not establish the
>   crowd came specifically for you" (`PROVES['ticket-export']`). This honesty line ships verbatim.
>
> **Proposed table `source_platform`:** `id` · `en_label` · `he_label` · `planet_key` ·
> `signal_note_key` (i18n key, not raw text) · `is_israeli` (bool) · `source_type` (FK → the
> `PROVES`/`source_type` set: `ticket-export`, `settlement`, `producer-vouch`, `public-profile`,
> `screenshot`, `self-band`, `self-reported`) · `active`. The `signal_note` must be an i18n key so the
> firewall-safe wording is localized, never hardcoded.

---

## 16.A.6 Migration & implementation note (Part A summary)

All six taxonomies above should land as **bilingual DB reference tables** in one migration
(historically called "029 bilingual reference tables"; author now as **036+**, diff-first). Proposed set:

| Table | Replaces (free text today) | Keyed by |
|---|---|---|
| `genre_family` | `genreWeights.js` inline object | code |
| `genre_scene` | `artist.genre` / `act.genre` free text | code → family FK |
| `act_format` | `act.format` inline CHECK | code |
| `il_region` + `act_region` | `artist.regions` free text | code |
| `venue_type` | `radarUniverse.CONTEXT_WORLDS` regexes | code |
| `room_size_band` | (none — new) | code |
| `source_platform` | `linkPlanet()` regex routing | code → planet + source_type |
| method/status enums | `constants.js` (already bounded) | keep as CHECK or promote to lookup |

Common column shape: `id` (PK) · `en_label` · `he_label` · `sort_order` · `active`, plus the mapping
FKs noted per table. **Rules:** frozen code identifiers stay frozen (§0.2 rule 5); every user-facing
label resolves through i18n keys, never hardcoded; the G2 guard (no signal → no emphasis) must survive
the migration; `mirror-only` is not dropped while 021 is FROZEN.

---

# PART B — BUSINESS

> Everything documented is captured with its source. Everything **not** yet decided is marked **OPEN
> (owner)**. Per the standing rule, no business numbers are invented — they are framed and flagged.

---

## 16.B.6 Product goals / objectives

### 16.B.6.a — Purpose (documented, canon)

LOCK is a **pre-booking proof / risk-reduction tool** (CLAUDE.md, CFO-BRIEF §1). Its documented purpose
has two sides:

1. **Supply side — help artists build a provable professional identity.** "Talent ≠ bookability."
   The artist assembles standardized, method-labeled evidence into a Passport, per Act.
2. **Demand side — help Israeli buyers evaluate an unfamiliar artist and reduce booking risk.**
   Booking managers, promoters, event producers, planners, and private/corporate clients
   (מזמיני הופעות) can check an unfamiliar artist against method-labeled evidence "before they risk
   their name."

It is explicitly **NOT** an EPK, **NOT** a booking CRM, **NOT** a guarantee, and carries **NO** score /
rank / prediction (CLAUDE.md firewall).

### 16.B.6.b — Goals framework (targets OPEN)

No numeric goals are documented. Clean framework below; **all targets are OPEN for the owner to set** —
and by canon none may be a public score, only internal counters (PILOT-MEASUREMENT-MAP: "internal
counters for Maria + CFRO only").

| Goal dimension | Documented signal / event (built) | Metric shape | Target |
|---|---|---|---|
| Artist activation | `onboarding_completed` | Signups → onboarding-complete rate | **OPEN (owner)** |
| Value delivered | `passport_published` | Built → published rate ("value proof") | **OPEN (owner)** |
| Distribution | `share_link_created` → `passport_view` | Share → view rate ("distribution proof") | **OPEN (owner)** |
| **The Gate metric** | `passport_view` → `professional_reaction_submitted` | View → reaction rate | **OPEN (owner)** |
| Trust network | `producer_confirmation_sent` → `claim_confirmed` | Confirm completion rate | **OPEN (owner)** |
| Multi-Act appetite | `act_created` | Count / artist | **OPEN (owner)** |
| Willingness to pay | `payment_reference_created` | Voluntary-pay count | **OPEN (owner)** |

> These events are **built and wired** (PILOT-MEASUREMENT-MAP, 12 Jul). What's missing is the owner's
> numeric bar for each — deliberately, because no ICP or price is locked pre-Gate.

---

## 16.B.7 The Gate

**The single validation gate (north star):**
> **One real booking manager reacts to a real Passport AND one pays.** (CLAUDE.md · CFO-BRIEF §2)

### Why it's the north star
LOCK is at **pre-validation** stage (CLAUDE.md: STAGE). The entire product thesis — that buyers will
trust method-labeled evidence enough to act, and that someone will pay for the proof layer — is unproven
until both halves fire once on a *real* Passport (not the demo). Everything before the Gate is
instrumentation and readiness; nothing about pricing or ICP is treated as known.

### How it's measured (built)
Both halves are live analytics events on `analytics_event` (demo excluded; each row carries actor +
timestamp):

| Gate half | Event | Status |
|---|---|---|
| A buyer **reacts** to a real Passport | `professional_reaction_submitted` | ✅ live — **the Gate signal** (PILOT-MEASUREMENT-MAP) |
| Someone **pays** | `entitlement_activated` (operator activation, records WHO) | ✅ live |

### What unlocks after the Gate
Per canon (CLAUDE.md, CFO-BRIEF §2–3): **monetisation is measured, not required, and no price / no ICP
is locked until the Gate.** Passing it unlocks the decisions currently frozen:
- Fixed pilot **price** (recommendation on file: ₪179; range ₪149–249 — OPEN until Gate).
- The **ICP** (which demand-side segment pays first).
- Turning on payment surfaces (the `PAYMENTS_ENABLED` flag, dormant today).

---

## 16.B.8 Business model

### Shape — two-sided
Supply side (artists + their artist-side representation) and Israeli demand side (buyers). The
**workspace carries the subscription, not the person** (GLOSSARY, CFO-BRIEF §3).

### Documented rulings (Monetization — APPROVED, SESSION-MEMORY)
- **No booking commission — ever.** (canon)
- **Each entity pays its own plan;** the artist always owns/pays his portable evidence-truth layer;
  the office pays the roster layer; a **Billing Sponsor** mechanism exists.
- **Buyer is free forever** — no account needed to read a Passport (`/passport/:id` is outside auth
  guards).
- **Source Confirmer never pays, never signs up** (accountless magic link).
- **Free pilot now** — no price locked pre-Gate; `PAYMENTS_ENABLED` flag keeps all payment surfaces
  dormant (`constants.js`, canon G17).

### Plans (concept — pricing OPEN)

| Payer entity | Plan | Current ruling | Price |
|---|---|---|---|
| Artist workspace (holds Acts) | **Passport** (free) → **Momentum** | Free in pilot | **OPEN** — if asked, ₪149–249 range only; pilot rec ₪179; never a fixed public price pre-Gate |
| Manager office / אמרגן (artist-side, solo or team) | **Roster** | Deliberately UNPRICED — payer candidate post-validation | **OPEN (owner)** |
| Event-production workspace | — | Not priced; events + lineups context | **OPEN (owner)** |
| Buyer / booking manager (incl. private clients) | — | **FREE FOREVER** (canon) | ₪0 |
| Source Confirmer | — | Never pays | ₪0 |

### Money mechanics as built today (CFO-BRIEF §4)
- Payment: **Bit → 054-4555060**, reference code **GP-XXXX**, **manual operator activation** in the
  admin console (each activation records WHO — actor on the event).
- An **entitlements** table drives access; activation fires the Gate's "paid" signal
  (`entitlement_activated`).
- **Known legal gap (P1 before real money): no receipts/invoices** — Green Invoice signup pending
  (deferred by owner until first payment intent).
- **Agency-side payments currently capture NO financial record** (flagged in the financial review).

### Firewall constraint on the model
"Money never buys a better story · no score to sell" is **live site canon** (CFO-BRIEF §1). Any
monetization surface must survive: the firewall (no score to sell), free-forever buyer, and
no-commission. Money may unlock *capacity* (more Acts, roster seats, distribution), never *a better
verdict*.

---

## 16.B.9 Business case (honest, pre-Gate — no invented traction)

### The problem
- **Talent ≠ bookability.** A great set doesn't tell a buyer the artist will show up, draw, and not
  burn the buyer's name.
- **Proof is scattered** across Spotify, Instagram, ticketing exports, WhatsApp screenshots — no
  standardized, checkable form.
- **The buyer carries reputational risk.** Booking an unfamiliar artist puts the buyer's own name on
  the line; today they decide on vibes, favors, or inflated EPKs.

### The wedge
**Israeli pre-booking proof.** A narrow, concrete beachhead: the Israeli demand side (מזמיני הופעות)
evaluating an unfamiliar artist, in Hebrew and English, with local ticketing sources (Eventer,
Tickchak, Go-Out) as first-class evidence. Not a global directory; a trust-check at the exact moment a
booking decision is being made.

### Why now
- The demand side has no standardized way to check an artist that isn't self-promotion.
- Method-labeled evidence + a locale-aware scan (target) is newly cheap enough to attempt at ~$1/artist
  (TARGET — see §16.B.10; not yet built, must not be priced on).
- The IL scene is small and networked enough that one real reaction + one payment is a meaningful,
  reachable Gate.

### The moat
- **Method-labeled evidence** — a bounded, honest vocabulary (Producer-confirmed / Source-linked /
  Evidence-supported / Self-declared) that competitors' EPKs and CRMs structurally can't match without
  abandoning hype.
- **The Radar / Passport asymmetry** — one Passport shown in two views: the Artist view (private) shows
  gaps and invitations; the Buyer view (public) shows verified strengths only. The artist is *supported,
  not inspected*; the buyer sees *only what's checkable*.
- **Per-Act, non-transferable evidence** — a structural integrity property (a new Act starts empty)
  that makes the proof hard to game.
- **The firewall as a brand** — "no score to sell" is a credibility position, not just a rule.

### Risks (honest)
| Risk | Note |
|---|---|
| Demand-side cold start | Buyers must trust an unfamiliar format; the Gate is precisely the test of this |
| Two-sided chicken-and-egg | Artists need buyers to read Passports; buyers need artists worth reading |
| The scan is TARGET, not built | The ~$1 deep scan and locale-aware auto-discovery are unbuilt; the business case cannot lean on them yet (§16.B.10) |
| Legal/receipts gap | No invoices/receipts before real money (P1); counsel items open |
| Free-tier ceilings | Supabase pause / Vercel deploy caps can bite pre-Pro (§16.B.10) |
| No traction claimed | Pre-validation by definition — there is **no** invented traction in this section |

---

## 16.B.10 Unit economics / cost

### AI claim-extraction cost model
- **BUILT:** per-evidence AI claim extraction — the pipeline labels claims per evidence item, no
  concierge / by-hand step (CLAUDE.md; CFO-BRIEF §5). Anthropic API is active; on credit exhaustion it
  falls back to mock (ACCOUNTS-LIMITS-REGISTRY).
- **TARGET (not built — do not price on it):** a multi-source **deep scan once at onboarding, target
  cost ≈ $1/artist**, plus cheap automatic incremental re-scans. CLAUDE.md is explicit: this is
  **TARGET ARCHITECTURE, not yet built; no business case may price or assume it until implementation
  and measured cost are verified.**
- **Provider fallback** may use a cheaper tier with narrower extraction, but must **preserve the
  evidence firewall and disclose the narrower scope** (CLAUDE.md).

> **Honesty firewall (§0.2 rule 4):** any unit-economics model that assumes the $1 deep scan is
> TARGET-based and must be labeled so. The only BUILT cost today is per-evidence extraction at
> pay-as-you-go, magnitude unmeasured at scale.

### Free-tier constraints (ACCOUNTS-LIMITS-REGISTRY, 12 Jul)

| Service | Plan | Constraint that can bite | Upgrade trigger |
|---|---|---|---|
| **Vercel** (both projects) | Hobby (free) | 100 deploys/day (hit once); previews build on every push | Disable previews (mitigation); Pro if needed |
| **Supabase** | Free | 500MB DB · 1GB storage · 50K MAU · **project pauses after ~7 days inactivity** | **Pro $25/mo** — trigger = first real users / pre-pilot backups (OPEN, owner) |
| **Anthropic API** | Pay-as-you-go | Credit runs out silently → falls back to mock | Billing alert; balance currently unknown |
| **Google Cloud** | Free | OAuth "Testing" mode caps 100 test users | Publish to production |
| **Resend** (email) | Not yet created | Free 3K/mo, 100/day when created | Owner signup pending |
| **GoDaddy** (lock.show) | Paid domain | Annual renewal — losing it loses everything | Confirm auto-renew |
| **GA4 / Search Console** | Free | None material pre-launch | — |

### Budget snapshot (ACCOUNTS-LIMITS-REGISTRY)
Domain ~₪5/mo amortized · everything else ₪0 (free tiers) · Anthropic usage-based
(**~$1/artist onboarding is the TARGET deep-scan figure, not a measured current cost**). First real
spend decisions arrive with the pilot: **Supabase Pro $25/mo** (OPEN — owner), Resend stays free-tier.

---

## 16.C — Items needing the owner's decision (consolidated OPEN list)

Everything this section could not close because it requires Maria's ruling:

**Taxonomy (Part A)**
1. **HE labels** for `genre_scene`, `genre_family`, `act_format`, `il_region`, `venue_type` — the
   proposed Hebrew is a *seed*; Maria owns the canonical HE column (GLOSSARY rule). **OPEN.**
2. **Scope of the genre-scene registry** — approve the seed set or commission the full family-by-family
   fill (55 subtypes / 32 DJ specializations from the Google Sheet; Registry B is empty). **OPEN / OWED.**
3. **`comedian-host` / `corporate-ceremony` reachability** — these families have no `act.format` path;
   decide whether to add formats or wait for the `scene_family` field (migration 034). **OPEN.**
4. **Migration authorization** for the bilingual reference tables (author as 036+, diff-first; respect
   FROZEN 021 / `mirror-only`). **OPEN (migration approval is owner's per CLAUDE.md).**
5. **Hebrew word for "Act"** — de-facto live term is אקט; formal taste-ratification still pending
   (SESSION-MEMORY pending list). **OPEN.**

**Business (Part B)**
6. **Numeric goal targets** for every metric in §16.B.6.b (activation, publish, share→view, the Gate
   rate, confirm completion, act_created, willingness-to-pay). **OPEN.**
7. **Fixed pilot price** — recommendation ₪179 (range ₪149–249); locked only after the Gate. **OPEN.**
8. **ICP** — which demand-side segment monetizes first; unlocked by the Gate. **OPEN.**
9. **Manager-office (Roster) and Production pricing** — deliberately unpriced. **OPEN.**
10. **Supabase Pro $25/mo timing** — pre-pilot backups vs wait. **OPEN.**
11. **Green Invoice / receipts** — priority relative to first real payments (P1 legal gap; currently
    deferred by owner). **OPEN.**
12. **Agency-side financial record** — no payment trail captured today; decide whether to close before
    monetizing the office layer. **OPEN.**
13. **Token rotation** (Anthropic / Tavily, low urgency) — infra hygiene, owner action. **OPEN.**

---

_End of §16. Sources: `CLAUDE.md` · `docs/SESSION-MEMORY.md` · `docs/CFO-BRIEF.md` ·
`docs/ENTITY-GLOSSARY.md` · `docs/GLOSSARY.md` · `docs/TAXONOMY-REGISTRY-AUDIT.md` ·
`docs/ACCOUNTS-LIMITS-REGISTRY.md` · `docs/PILOT-MEASUREMENT-MAP.md` · `docs/VERSIONS.md` ·
`src/lib/genreWeights.js` · `src/lib/radarUniverse.js` · `src/lib/constants.js` ·
`src/lib/i18n/en.js`._
