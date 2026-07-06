# GIGPROOF — ARTIST INTELLIGENCE MAP (map everything; decide radars later)
**Version:** v2.0 (FULL MAP) · **Date:** 1 July 2026 · **Owner:** Maria (R00) · **Architect:** R16
**Authority:** ★ B4 MASTER CANON v3.4 · B4-40.10 · B4-10.30 · B4-10.40. Integrates CODEX + GPT reviews.
**Principle (Maria):** Map EVERYTHING first. Radar count is a FILTER decided later, not now.
**Product law:** NOT an EPK/CRM/guarantee. NO score/percentile/rank/prediction — bands+method-labels only. Artist-vs-artist NEVER. N/A≠ZERO.

---

## THE ONE INSIGHT THAT FIXES EVERYTHING: 3 SEPARATE LAYERS
CODEX and GPT were both right about half. The error was calling everything a "widget." There are THREE layers:

```
LAYER 3 · NAVIGATION  →  what the artist SEES/clicks. Few, human, beautiful. (= radars & segments)
LAYER 2 · PROOF UNIT  →  the publishable subset that can cross to the Passport. Bounded claims only.
LAYER 1 · DATA FIELD  →  every atomic fact about the artist + source + date + confidence. Huge, hidden.
```

- **A radar is a FILTER on Layer 1.** "How many radars" = "how many navigation views we cut over the same data." Decide later.
- **Not every field is a Proof Unit.** Files, settings, freshness, internal outcomes = data/state, never published.
- **Certainty is metadata, not a category** — every field carries a label (below), not its own axis.

### CERTAINTY LABELS (every Layer-1 field carries exactly one) — from GPT, canon-aligned
`OBSERVED` (authoritative source) · `EXTRACTED` (AI from doc/page) · `CALCULATED` (formula on observed) · `INFERRED` (model, uncertain) · `HUMAN_REVIEWED` · `COUNTERPARTY_CONFIRMED` (producer/venue) · `SELF_REPORTED` · `STALE` · `CONFLICTED`
Plus metadata on every field: source · date · territory · visibility(passport-ok/mirror-only/internal) · freshness · method_label.

### FIREWALL LINE HELD (against GPT's two drifts)
- ❌ Cohort percentile / artist-vs-artist / "top X%" / market-prevalence → BANNED (CANON §2A, B4-10.30 §11/15). Market-Context view = "your pattern vs a reference pattern + coverage + WHY," never a rank.
- ❌ Scraping / Chartmetric / Social-Blade / public-web harvest as a data tier → BANNED (zero-party). Canon-legal path = discovery→artist-confirms→method-labeled. Aggregators may be *referenced by the artist*, never scraped by us.

---

## LAYER 1 — THE COMPLETE DATA MAP (18 segments; every field about the artist)
*Merged from GPT's 18-segment universe + B4-10.30/40 constructs + IL-scene signals. This is the ontology. Radars are filters over this.*

| # | Segment | What lives here (atomic fields) | Primary sources (canon-legal) | Mostly which layer-2/3? |
|---|---|---|---|---|
| 01 | Identity & Entity Resolution | stage/legal name, aliases, members, act type, languages, city, official URLs, platform IDs | artist account, official site | Nav: Identity · few Proof Units |
| 02 | Positioning & Brand | genre/microgenre, reference artists, value prop, bio, visual identity, differentiation | artist, EPK, site | Nav: Identity |
| 03 | Catalog & Releases | singles/EPs/albums, dates, credits, labels, collaborators, cadence, ownership | artist, distributor export, MusicBrainz(ref) | Nav: Identity/Music |
| 04 | Creative Quality & Differentiation | originality, sonic signature, DJ utility, live adaptability | artist audio, HUMAN_REVIEWED only | Nav: Identity · NOT a platform metric |
| 05 | Streaming & Discovery | streams, listeners, saves, playlist adds, geography (CONTEXT only) 🔒 | artist-authorized export | Nav: Audience · context strip, never draw |
| 06 | Audience & Fanbase | followers, segments, geography, local density, growth/decay (bands) | platform insights (artist-auth) | Nav: Audience |
| 07 | Social & Content Engine | posting freq, formats, reach, engagement, themes, hooks | artist-authorized insights | Nav: Audience |
| 08 | Owned Community & Direct Fans | email/SMS/WhatsApp opt-ins, CRM size (BAND, no member list) 🔒 | artist CRM (count only) | Nav: Audience/Draw · Proof Unit (band) |
| 09 | Live Footprint & Capability | past/upcoming shows, venues, festivals, headline/support, set duration, format | itinerary, public record, producer-vouch | Nav: Live · Proof Units |
| 10 | Ticketing, Draw & Event Economics | paid tickets, attendance, pre-sale velocity, sell-through, UTM sales, fee, door-vs-comp (BANDS) 🔒 | ticket export, settlement, producer confirm | Nav: Audience&Draw · HERO Proof Units |
| 11 | Booking Market & Commercial Offer | fee bands, event types, territories, availability, lead time, rider burden, inquiry→booking | booking record, contracts, artist | Nav: Business · some Proof Units |
| 12 | Reputation, Trust & Reliability | press, testimonials, producer feedback, punctuality, disputes, rebook rate | counterparty, press(ref), CRM notes | Nav: Trust · HUMAN/COUNTERPARTY only |
| 13 | Network & Industry Access | managers, agents, promoters, venues, collaborators, curators, relationship strength | credits, lineups, artist input | Nav: Trust · mostly internal |
| 14 | Business, Legal & Rights Readiness | entity, tax/invoicing, contracts, master ownership, splits, insurance, consents | artist uploads, advisors | Nav: Business · settings, not Proof Units |
| 15 | Technical & Production Readiness | rider, stage plot, input list, equipment, changeover, travel needs | artist, crew, venue | Nav: Readiness · binary Proof Units |
| 16 | Team, Management & Execution | roles, response time, release pipeline, calendar discipline, follow-through | CRM, artist | Nav: Business · mostly internal |
| 17 | Monetization & Commercial Health | revenue by stream (live/streaming/merch/etc), margins, repeat purchase, concentration | accounting, artist | Internal · rarely public |
| 18 | Trajectory, Opportunity Fit & Risk | 30/90/365 momentum (counts over time), cadence, geo expansion, opportunity fit, risk | DERIVED from 01–17 | Nav: Momentum + per-event Fit |

**IL-scene overlay (must be tagged inside the segments above, not lost):**
מוקדמות (pre-sale, seg10) · ראשים משלמים מול אורחים (door-vs-guestlist, seg10) · גרנטי/פיקס (fee bands, seg11) · רזידנט/ליין (residency, seg09) · חימום/כותרת (slot type, seg09) · עוסק מורשה + חשבונית דיגיטלית (seg14) · רפרנס (peer vouch, seg12) · כלכלת חברים relationship context (seg13) · אמרגן vs מפיק vs מנהל-אמן vs סוכנות (representation/authority, seg11+14).

**IL ticketing source reality (seg10 acquisition — field-verified, canon-legal = artist/producer export, NOT scrape):**
Selector (producer per-link export) · Go-out (inconsistent) · Eventer (verify) · קופות ת"א (artist-visible UTM) · PayBox (cash, none) · Gagarin (UTM unused). → Build ONE universal evidence importer, not 6 integrations.

---

## LAYER 2 — WHICH FIELDS BECOME PROOF UNITS (publishable bounded claims)
*Only these can cross to a Passport face. Everything else stays Radar-private or internal.*
Draw band · ticket contribution band · owned-community band · repeat/invited-back · fee/guarantee band · lineup frequency · pre-sale velocity · door-vs-guestlist · slot type · residency · track record · live video · set format · fiscal readiness · technical rider · peer reference (name-consented) · cross-border/touring evidence · press/reviews.
Everything in segments 04,13,16,17 + all settings/files/freshness/outcomes = NOT Proof Units.

---

## LAYER 3 — NAVIGATION (the filter question — DECIDE LATER)
*This is the ONLY open question. Same Layer-1 data, cut into views. Options on the table:*

**Option A — Two radars (CODEX):** Career 360° (7 worlds) + Market Context (reference pattern, no rank).
**Option B — One radar, 7 worlds** (simpler for Gate-1).
**Option C — More views later** (per persona: artist / אמרגן / מפיק each get a filtered cut).

The 7 candidate "worlds" (grouping of Layer-1 segments), whichever option wins:
1. Identity & Creative Offer (seg 01–04)
2. Audience & Draw (seg 05–08, 10)
3. Live & Performance (seg 09, 15)
4. Professional Readiness (seg 14, 15, 16)
5. Business & Representation (seg 11, authority)
6. Trust & Relationships (seg 12, 13)
7. Momentum & Territories (seg 18, cross-border)

**Kept OUT of any radar (per CODEX + domain rules):**
Opportunity Fit (per-event, in producer face) · Outcomes/Rejection/Attribution (private Learning Timeline) · Evidence freshness (metadata everywhere) · Authority permissions (account settings).

---

## WHAT'S DECIDED vs OPEN
DECIDED (canon-locked): the 3-layer model · 18-segment data map · certainty labels · firewall (no cohort rank, no scrape) · what is/isn't a Proof Unit · the 7 candidate worlds.
OPEN (Maria, later — it's a filter): how many radars (A/B/C) · which worlds are Gate-1-core · web-discovery build (counsel).

**Next Action** — Maria reviews the full map (Layers 1–3). The only decision now is directional: is the 3-layer model right? Radar COUNT stays open (filter, later).
**Missing Inputs** — none to see the map; for build: radar-count choice + Gate-1 worlds + counsel on discovery.
**Business Impact** — Everything is now mapped in one place: 18 data segments, what publishes, what navigates. Radar count becomes a cheap filter decision over a fixed data map — not a redesign. GPT's ontology depth is captured; its cohort+scrape drift is excluded. This is the single source the DB and every radar view read from.

---

## LAYER 0 — ARTIST TAXONOMY (the "smart radar" switch) — added v2.1
*Both GPT taxonomy docs adopted. This is the engine that makes one radar serve every artist type. Sits BELOW Layer 1: the taxonomy decides which Layer-1 fields are active for THIS artist.*

**Core principle:** ONE radar engine, not 70 products. An artist is described by axes; the axes switch fields on/off. No new database per type.

### The taxonomy axes (multi-select; an artist can be more than one)
| Axis | Answers | Example |
|---|---|---|
| Primary module (8) | what kind of act | DJ / Producer-DJ |
| Functional subtype | how they operate | wedding DJ, resident, festival, touring, session |
| Performance format | what's on stage | DJ set + live percussion |
| Commercial model | what makes revenue | ticket-led / service-led / catalog-led / collaboration-led |
| Genre / scene | market & audience (TAG, not a radar) | progressive house / psytrance |
| Booking context | where it's sold | clubs + festivals / weddings / municipal |
| Career config | how organized | independent / manager-led / agency roster |
| Opportunity role | slot filled | warm-up / support / headline |
| Maturity | career level | developing regional |
| Geography | valid market context | Israel, Tel Aviv |

### The 8 buildable modules (GPT): M1 DJ/Producer-DJ · M2 Solo Vocal · M3 Instrumentalist/Session · M4 Band/Ensemble · M5 Large Ensemble · M6 Live-Electronic/Hybrid · M7 Service/Event Act · M8 Creator/Non-Performing.
### 10 overlays (GPT): O1 Ticketed-Touring · O2 Festival · O3 Resident · O4 Content-First · O5 Original-Music · O6 Cover/Tribute · O7 Cultural · O8 International/Export · O9 Brand/Sponsorship · O10 Educational/Family.

### FIELD APPLICABILITY — the four states (GPT, canon-aligned)
Every Layer-1 field, per module, is one of: **Required · Conditional (activation rule) · Supporting · N/A.**

**★ THE RULE THAT MAKES IT FAIR (and firewall-clean):**
- **N/A ≠ ZERO** — identical to our domain law UNKNOWN ≠ ZERO. A wedding DJ with no Spotify, a session player with no ticket draw, a cover band with no original catalog = the field is REMOVED from their picture, never counted as a weakness or a gap. This is the whole point of the smart radar.
- **Taxonomy decides WHAT is relevant. It NEVER ranks the artist.** The tag "DJ לחתונה" changes which fields show (client-satisfaction, referral-conversion, repertoire-breadth appear; ticket-sell-through goes N/A) — it does NOT place the artist in any ranking.

**★ FIREWALL TRAP RE-FLAGGED (both GPT docs):** GPT again wrote "benchmark cohort / compare only with substitutable acts / metric weighting." REJECTED, same as the cohort drift before. Applicability ≠ comparison. We use taxonomy to pick relevant fields; we never compare the artist to a population. Service-act "equivalents" (inquiry→booking replaces sell-through) are fine as WHICH-FIELD swaps; they must never become a rank.

### Field-config schema (per atomic field — GPT, adopted for the registry)
`field_id · segment_id · artist_module · applicability(R/C/S/NA) · activation_rule · commercial_model · opportunity_types · accepted_sources · evidence_strength · freshness_window · gap_rule · next_action_rule · passport_eligibility`
(Note: GPT's `benchmark_cohort` field DROPPED — reintroduces ranking.)

### Primary/secondary rules (GPT, adopted)
Artist has 1 primary module + optional secondary + overlays + per-opportunity profile. A secondary module CANNOT inherit unsupported evidence from the primary. Module selection is editable (careers change).

---

## LAYER 1.5 — WEB ENRICHMENT: THE FOURTH DATA DOOR — added v2.1
*Corrects the earlier over-broad "no web" framing. Maria is right: enrichment is part of the job.*

Data may enter through FOUR doors (was three):
1. Official API · 2. Consented OAuth · 3. Artist-provided artifact · **4. Artist-confirmed discovery (NEW).**

**The one line that keeps it clean:** SURFACE, never PUBLISH-as-fact.
| We MAY | We may NEVER |
|---|---|
| Surface a web-found candidate for the artist to confirm/reject | Publish web data as fact without artist confirmation |
| Enrich an onboarded, consented artist | Cold-crawl non-onboarded strangers into a DB |
| Create real-world evidence (PR/placements) the artist then claims | Present scraped data as a verified claim |
| Let the artist point at an aggregator | Build the data spine on a platform-ToS violation |

Confirmed items enter method-labelled `SELF_CONFIRMED_FROM_WEB`. Trends/changes the artist wants to know about themselves = a legitimate Radar value (return hook). PR-seeded evidence the artist claims = a future business line, not a violation.
**GATE:** automated discovery engine runs per-artist, opt-in, POST-consent only; needs counsel sign-off on Amendment 13 (collection precedes confirmation) before build. Cold crawl of strangers stays banned.

---

## UPDATED DECIDED / OPEN (v2.1)
DECIDED (canon-aligned): 3-layer model + Layer-0 taxonomy engine · 18-segment data map · certainty labels · N/A≠ZERO applicability · 4th data door (artist-confirmed discovery) · firewall held (no cohort rank, no publish-scraped, no benchmark_cohort field) · 8 modules + 10 overlays · what is/isn't a Proof Unit · the 7 candidate worlds.
OPEN (Maria, later — filters/build): radar count (A/B/C) · which worlds + which module = Gate-1-core (SHIGAON = M1 DJ/Producer-DJ + psytrance + O1?) · counsel on discovery engine · canon edit for 4th door (command drafted).

**Next Action** — (1) Approve the one-line canon edit adding the 4th data door (command drafted for GPT). (2) Confirm direction: ONE radar engine + taxonomy switch (not 70 products). Then GPT builds `Artist Taxonomy Registry v1` starting with M1 DJ/Producer-DJ (SHIGAON's type).
**Missing Inputs** — SHIGAON's full taxonomy row (M1 + subtype + format + commercial model + genre + context + role) to make the registry concrete on the pilot; counsel on discovery.
**Business Impact** — This is the differentiator you named: no competitor has a type-aware radar that stays fair by construction (N/A≠ZERO) AND refuses to rank. Taxonomy makes onboarding feel bespoke per artist, kills false weaknesses, and lets GIGPROOF expand across the whole live-music ecosystem on ONE engine. The 4th data door turns enrichment (and future PR) into a growth loop the artist controls — legal because they confirm, firewall-clean because they author.
