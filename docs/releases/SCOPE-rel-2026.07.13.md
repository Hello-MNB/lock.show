# LOCKED SCOPE — next SITE version + next APP version (rel-*.2026.07.13)

_Owner order 12 Jul: "לבנות SCOPE ברור לגרסה הבאה של אתר וגם לגרסה הבאה של האפליקציה."
This is the scope CONTRACT. Anything not listed under IN is OUT — adding an item mid-train
requires Maria's word and a new row in this file. Detail per item: rel-2026.07.13-PLAN.md.
QA/QC: protocol Q1–Q8 (plan §4) — the version is not valid until it passes._

## SITE — rel-site-2026.07.13 · SCOPE

**Goal (one sentence):** vocabulary-true, polished marketing site where every demand-side
audience (including private clients) understands LOCK without industry jargon.

**IN (7 items, closed list):**
| # | Item | Where |
|---|---|---|
| S1 | Terminology wave live: buyer ≠ אמרגן glosses gone, FAQ distinction, llms.txt corrected, EN purity (already built on branch) | faq, layout, page, llms.txt, messages |
| S2 | Arrow unification (one arrow style sitewide) | global components |
| S3 | Footer regrouping | footer |
| S4 | Waitlist form type floor (readability minimum) | waitlist form |
| S5 | ONE private/corporate acknowledgment line, warm register, no venue jargon | /bookers |
| S6 | ONE clarifying line: this flow = Source Confirmer (magic link, no account) ≠ production company | /producers |
| S7 | OG/social exports committed + metadata wired — ONLY IF Codex delivers files in time; otherwise moves to next train without blocking | public/ + metadata |

**OUT (explicit):** Hebrew site · About page · private-client dedicated page · new imagery
beyond delivered files · How-it-works/Methodology restructure · pricing changes · any new page.

**DOD:** next build green · EN purity scan 0 Hebrew glyphs · terminology scan 0 inversions ·
Q1–Q8 pass on preview then live · owner pass.

## APP — rel-app-2026.07.13 · SCOPE

**Goal (one sentence):** every entity can actually operate its context (create workspace, work
its home screen, run its core flow) in DS-true, vocabulary-true, mobile-first screens.

**IN (10 items, closed list):**
| # | Item | Entity · screens |
|---|---|---|
| A1 | Terminology + voice wave live (built: 8 HE + 7 EN strings, signup labels, SIGNUP_ROLES fix, evaluation-language softening) | all · signup, switcher, settings, publish, readiness |
| A2 | "Add workspace" made REAL — create 2nd workspace from switcher (artist/management/production only) | all · switcher + create screen |
| A3 | + New Act | artist · switcher + /artist/home |
| A4 | Producer-confirm request wired to real magic link | artist · /artist/passport → server link |
| A5 | Next-best-action widget on roster home | manager office · /agency |
| A6 | Roster from consented grants (ArtistAccess) | manager office · /agency — needs migration 032 |
| A7 | Requests inbox with real data | production · /production — needs migration 032 |
| A8 | activated_by audit trail on payment activation | operator · /admin |
| A9 | DS v1.6.1/A13 token binding, mobile-first re-ground batch-by-batch + real screenshots back to Codex | all screens — GATED on Claude's DS audit |
| A10 | Remaining funnel events (11) + embed rebuild (parity rule) | all |

**OUT (explicit):** DB/enum renames (workspace_type 'producer'→'production' = migration 033+,
after Supabase Pro backups) · artist reply-channel · open booker discovery · comparison mode ·
Radar v5 emotional layer · receipts/invoices · Hebrew-completion pass (141 keys) · any new
entity screen not listed.

**Dependencies:** Maria — canon-lock trio (מאשר-מקור · Act HE · wave-A nod) BLOCKS A1 deploy ·
Cowork — one-time preview hook, apply 032 (blocks A6/A7), Q3–Q5 lanes · Codex — nothing blocks
the app scope; imagery/OG are site-S7 only.

**DOD:** `npm run verify` green (nav 34 · i18n purity · build · demo) · migration 032 applied +
regression · Q1–Q8 on preview then live (incl. 360px mobile pass on Radar/roster/Passport/
recipient) · embed hash parity · owner pass.
