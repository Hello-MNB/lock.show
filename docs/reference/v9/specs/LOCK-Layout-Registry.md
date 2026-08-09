# LOCK.SHOW — Layout Architecture Registry

Canonical screen archetypes. Every user-facing screen maps to one Layout ID; unmapped compositions are design debt. Derived from the full wireframe audit (9 Aug 2026) of the live prototype at 390px.

## Zone grammar (shared)
A CONTEXT (top bar / object header) · B MEANING (headline conclusion) · C ACTION (primary CTA) · D WORKING (main content) · E SUPPORTING (detail, collapsed by default) · F PROVENANCE (mono metadata, always last/smallest).

## Archetypes

| ID | Name | Anatomy (top→bottom) | CTA rule | Bottom nav | Used by |
|---|---|---|---|---|---|
| L1 | ROOT/HOME | B headline conclusion → C hero action card → D sections w/ eyebrow dividers → E expanders | Inside hero card | visible | Radar, Roster overview, Growth, Events home, Inboxes |
| L2 | WORKSPACE | A object header (+state chip) → local tabs (LocalTabs) → D per-tab | Contextual per tab, bottom of zone | visible | Category, Artist workspace, Event workspace, Account |
| L3 | EDITOR | Framing line ("you're composing X") → identity/hero editable → numbered sections 1–N with read-lines → sticky publish path | Full-width accent at flow end | visible | Composer, New event (accordion 1·2·3) |
| L4 | REVIEW | Diff groups (New/Updated/No longer shown/Visibility) → consequence note → C full-width accent → back link | Full-width accent | visible | Publish review, approve-on-behalf, consent sheets |
| L5 | QUEUE | State tabs (Needs reply·Waiting·Done) → filter chips → rows w/ consequence chips | Per-row | visible | All inboxes, requests, notifications |
| L6 | FOCUS/CASE | Object header → sticky meta strip (date·owner) → progress stepper (dots + STAGE n/N + name) → requirement matrix → conversation → decision | One dominant per state | visible | Opportunity case, Slot detail, Handoff |
| L7 | LIVE TAKEOVER | LIVE banner (pulse dot) → NOW clock card → NEXT → ISSUES (owner+fix+CTA) → arrivals/stages/contacts | Per-issue resolve | hidden | Show Day |
| L8 | EXTERNAL | Hero media full-bleed → relevance line → recipient-ordered sections → one sticky commercial CTA | Single sticky | none (recipient shell) | 6 Passport views, dead-link states |
| L9 | UTILITY/TERMINAL | Centered glyph → statement → 1–3 large tappable choices → receipt | Large tap cards | none | Confirmer, terminal states, errors |
| L10 | STEPPER | Step context ("Step 2 · you can edit later") → selection grid w/ glyphs → Back+Continue row (one line) | Continue right, Back left | hidden during onboarding | Artist/Rep/Prod onboarding |
| L11 | OPS DASHBOARD | Exception lane first → gate truth block (3-col) → signal tiles ("not measured yet" honest) → audit | Per-exception resolve | internal only | Admin (pending D5 compression) |

## Persona grammar
- ARTIST: L1 meaning-first, medium density, media-aware (reflective intelligence).
- REP: L1/L5/L6 attention-first, high scan density, avatar-led (commercial editorial).
- PRODUCTION: L1/L7 NOW/NEXT temporal, densest when show-critical (live operations).
- RECIPIENT: L8 only — no app chrome (curated stage).
- CONFIRMER: L9 only. ADMIN: L11.

## Canonical placements
- Eyebrow dividers: 10px/800/.14em accent + hairline — the ONLY section divider.
- Local tabs: directly under object header, never mid-page. Filter chips: under state tabs, horizontal scroll.
- Back: top-left "‹" in the object header, never a bottom button (except L10 Back+Continue row).
- Sticky elements budget: top bar + (one of: local tabs / meta strip / CTA) + bottom nav — never two mid-stickies.
- QA tooling: opacity .25 + title tooltip, mono 8-9px.

## Justified exceptions
- Radar spider chart (L1 with viz hero) — signature surface.
- Line-up stage lanes (L2 tab with timeline zone) — programme, not list.

## Drift log (fixed 9 Aug 2026)
- Opportunity case: 7 wrapped stage pills (read as filters) → L6 progress stepper (dots + STAGE 2/7 + name); stage word removed from meta strip (echo).
- Growth: stats-above-hero → L1 order (hero conclusion first).
- Composer: unnumbered accordion rows → L3 numbered page sections.
