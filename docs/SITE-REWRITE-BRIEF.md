# SITE REWRITE BRIEF — marketing-grade, per-page (owner directive 10 Jul)

**The order:** "It's a MARKETING site, not a technical site. Rewrite everything. Professional wireframe
per page, heroes with images, atmosphere images inside pages, fix contrast, remove technical texts,
enter the sentiment of the relevant customer."

## Voice (Codex DS v1.4.2 brand-voice law — binding)
- ✅ "Shape your story for the rooms you want to enter." · "Start with one link. Radar helps you build
  from there." · "Book with context, not guesswork." · "Private career intelligence first.
  Artist-approved profile later."
- ❌ "Prepare proof" · "Get evaluated" · "Score your artist profile" · "Bookers evaluate the artist".
- Artist-facing copy builds CONFIDENCE and opportunity — never audit-pressure. Booker-facing copy sells
  calm certainty before a risky yes. Show-business energy, Israeli nightlife sentiment, zero corporate.

## Wireframe contract (every page)
1. **Full-bleed hero** (already implemented): entity label (mono, small) → emotional serif headline
   (2 lines max) → ONE-sentence benefit → ONE lime CTA (+ optional ghost secondary) → one trust cue.
   Image: persona/atmosphere webp, gradient veil for AA contrast.
2. **Paper body** — white cards on paper; every section: one job, one heading, ≤3 support lines.
   Image or visual anchor in at least one mid-page section (persona webp / sample passport card).
3. **Dark closing CTA** — short, emotional, one button.
4. Body ≥16px (1rem); labels ≥12px; on-light text uses --color-tally-onlight / ink; on-dark ≥ AA pairs.

## De-tech rules
- Kill from marketing pages: "method-labeled" repetition (once per page max, as a trust cue),
  "RLS/schema/API/migration"-class words, long methodology explanations (link to /methodology instead),
  process numbering that reads like documentation. FAQ/JSON-LD may keep precise wording.
- FIREWALL stays absolute: no scores/ranks/percentiles/guarantees; audience only as bands in samples.
- Pricing truth: artists FREE during the pilot; Founding Passport shown as range ₪149–249 only if
  mentioned; booking managers always free; NO other numbers.

## Assets (in /public — use these)
lockshow-hero-live.webp (concert crowd) · lockshow-persona-artist-v1.webp ·
lockshow-persona-manager-v1.webp · lockshow-persona-producer-v1.webp · lockshow-evidence-review.webp.
(4 more lockshow-atmosphere-* scenes arrive from Codex's Drive later — leave TODO comments where they slot.)

## Hard constraints
- Next.js static export; inline-style TSX pattern as-is; KEEP metadata/JSON-LD blocks (may edit text
  inside them to match new copy); keep all internal links/routes; page must build (`npm run build`).
- Hebrew terms when naming roles: booking manager (אמרגן) etc. — keep the disambiguation.
