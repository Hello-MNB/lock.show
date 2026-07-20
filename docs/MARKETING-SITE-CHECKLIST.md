# MARKETING-SITE CHECKLIST — every website-next page passes this before it is witness-ready
_T-84 spec-first pass (20 Jul — ratify: R00). Companion to docs/SCREEN-BUILD-CHECKLIST.md (that one
is for app/entity screens; this one is for `website-next/app/**/page.tsx` marketing pages). A page
task cites its row in docs/SITE-NAVIGATION-SPEC.md §2 (the entity map), then runs this list top to
bottom. Standing checklist — updated in place, never re-created (HOW-TO-BUILD Part 8 doc rule)._

## 1 · THE DOOR (5-second test — the owner's success formula)
- [ ] The RIGHT visitor (named in SITE-NAVIGATION-SPEC §2) can identify "this is for me" from H1 + sub alone, above the fold, zero scrolling
- [ ] Exactly ONE dominant CTA voice per page; if multiple actor cards exist (Home only), each card carries its OWN CTA to its OWN entity page — never one CTA serving two doors
- [ ] The page's ONE proof-of-success action is stated (what "this page worked" means — /artists = signup click · /bookers /producers = passport-demo open · reference pages = no conversion expected, say so)

## 2 · GLOSSARY & ENTITY PURITY (CLAUDE.md · spec §4 — a violating surface is a blocked review)
- [ ] Buyer/booking-manager in Hebrew = **מזמיני הופעות** — NEVER אמרגן
- [ ] אמרגן appears ONLY for the artist-side agent/office (Representation) — scan every EN and HE string (incl. transliterations like "amargan") for the inversion
- [ ] מפיק (producer/Confirmer) and the buyer are never merged in copy or UI
- [ ] No invented Hebrew — HE strings come only from `messages/he.json`, never authored ad hoc in a page component

## 3 · FIREWALL (CLAUDE.md · spec §2 — absolute)
- [ ] No score / percentile / rank / "bookability %" / prediction / gauge anywhere in copy, metadata, or JSON-LD
- [ ] Draw shown ONLY as bands + binaries, a method label alongside every claim shown
- [ ] Streaming/community signals labeled contextual — never draw evidence
- [ ] If the two views are referenced: gaps are ARTIST-ONLY — never implied buyer-visible

## 4 · CTA & SITE→APP BRIDGE (the attribution law, SITE-REWRITE-BRIEF)
- [ ] Every CTA to `$APP_URL` carries `utm_source=site&utm_campaign=<page-slug>`
- [ ] 2+ CTAs to one destination on a page → each carries a distinct `utm_content`
- [ ] App-bound params (e.g. `?role=artist`) are captured by analytics OR their exclusion is documented — never silently dropped
- [ ] "Not you?" lane present on every single-audience page (SITE-NAVIGATION-SPEC law 5), linking to sibling entity pages, not Home

## 5 · EN/HE STATUS (explicit, never assumed)
- [ ] State plainly: does this page's BODY respond to the locale toggle, or only Nav/Footer? EN-only body → the page claims no HE anywhere (no HE meta, no hreflang) until `messages/he.json` backs every string
- [ ] If HE is claimed: `dir="rtl"` renders correctly, Heebo applies, no LTR-only property bugs

## 6 · SEO / METADATA
- [ ] `title` carries NO brand suffix (layout template adds " | LOCK")
- [ ] `openGraph.url` = this page's own canonical path
- [ ] FAQPage JSON-LD mirrors ONLY the Q&As visibly rendered on THIS page

## 7 · DS / BRAND (docs/SITE-MANAGEMENT.md §4 · WEBSITE-DESIGN-SYSTEM.md)
- [ ] Container-contrast law: no tone-on-tone stacking; dark/light rhythm visible
- [ ] Lime = the one dominant action only, never wallpaper
- [ ] Mobile-first: no h-scroll at 390px; hero legible; imagery weighted for phone

## 8 · SELF-VERIFY (HOW-TO-BUILD Parts 2–3)
- [ ] Rendered page described in plain language AS IF WITNESSING AS THE OWNER — "does the right visitor know their door in 5 seconds?" Unsure = fail
- [ ] Only then → the witness batch. MOBILE/DESKTOP green only after the owner looks.
