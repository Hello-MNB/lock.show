# A13 — TOKEN VALUES (delivered by Codex, 10 Jul 2026) — the implementation handoff

_Source of truth: Drive `00_CURRENT/LOCKSHOW_Design_System_CURRENT.html#a13-token-values` + the handoff
file `03_AUDITS_AND_REFERENCES/LOCKSHOW_CLAUDE_HANDOFF_A13_TOKEN_VALUES_20260710.md`. Mirrored here
verbatim because this file drives the app mapping layer. Codex owns names+values+AA; Claude owns the code
binding (per CODEX-CLAUDE-SYNC §6 Q10). Need a new token? Request a DS extension — never invent locally._

## Approved contrast pairs (AA-proven)
| Pair | Background | Foreground | AA | Use | Rule |
|---|---|---|---|---|---|
| paper + forest | #F3F5EF | #18221A | 14.91 | Marketing paper, long reading, cards | Default light-surface text |
| white + forest | #FFFFFF | #18221A | 16.37 | White work cards | When paper contrast isn't enough |
| paper + slate | #F3F5EF | #687269 | 4.55 | Secondary body on light | Narrow AA — don't shrink critical text |
| forest + paper | #18221A | #F3F5EF | 14.91 | Trust panels, proof blocks | Serious/proof contexts |
| ink + paper | #0A0D0B | #F3F5EF | 17.78 | Cinematic sections | Generous text spacing |
| app bg + app text | #0B0C0B | #F3F0E8 | 17.21 | App dark canvas | Default app text pair |
| app surface + app text | #14181A | #F3F0E8 | 15.69 | App cards / Radar panels | Task surfaces |
| app surface + muted | #14181A | #98A19A | 6.72 | Secondary app text | Helper + metadata |
| lime + on-accent | #C8F04D | #12160A | 14.00 | Primary CTA | ONE lime primary moment per view |
| lime + forest | #C8F04D | #18221A | 12.50 | Lime badges/cards | Fallback; prefer on-accent in code |
| gold on app bg | #0B0C0B | #F2C063 | 11.66 | Found/source aura | Small accents only |
| teal on app bg | #0B0C0B | #46DCC2 | 11.46 | Developing state | Dots, chips, thin rings |
| amber on app bg | #0B0C0B | #E39A4B | 8.39 | Needs-you/review | Invitation to improve — never shame |
| danger on paper | #F3F5EF | #B23B2E | 5.37 | Error/destructive text | Sparingly, calm recovery copy |
| faint on app bg | #0B0C0B | #69716B | 3.90 | Decorative tertiary ONLY | **FAILURE RULE: never critical labels/validation/CTA** |

## Semantic tokens
| Semantic token | Value | Code alias | Surface | Rule |
|---|---|---|---|---|
| color.ink | #0A0D0B | DS ink | Marketing/deep text | Darkest ground + light-surface text anchor |
| color.forest | #18221A | forest/night panel | Website trust | Dense trust boundaries |
| color.paper | #F3F5EF | paper | Website | Marketing default canvas |
| color.app.bg | #0B0C0B | bg | App | Dark canvas — **app dark-first RATIFIED** |
| color.app.surface | #14181A | surface | App | Cards, Radar panels, Passport work surfaces |
| color.app.surface2 | #1B2022 | surface2 | App | Inputs, nested surfaces |
| color.app.raise | #232A2B | raise | App | Hover/elevation only |
| color.action.primary | #C8F04D | accent/lime/stamp | All | Primary action only; dark text required |
| color.text.app | #F3F0E8 | ink | App | Primary app text on dark |
| color.text.muted | #98A19A | muted | App | Secondary app copy |
| state.found | #F2C063 | gold/found | Radar | Found/source-backed, not confirmed |
| state.confirmed | #CBEE72 | good | Radar | Artist/source confirmed |
| state.developing | #46DCC2 | teal/dev | Radar | Developing but useful |
| state.needsReview | #E39A4B | amber/need | Radar | Needs artist review/correction |
| state.notAssessable | #9AA29B | na | Radar | Not enough context — never weakness |

## Method-label vocabulary (canon restored ✓)
Producer-confirmed · Source-linked · Evidence-supported · Self-declared.
Never expose raw DB/client states as user-facing labels.

## Answers to Codex's 5 open implementation questions
1. Materializing the screenshots: run the checkout command in the pointer file — it's additive, no branch
   switch; read-only `git show` also fine.
2. EN font: **Manrope EN UI/marketing, Heebo HE** (Codex + Claude aligned; owner may veto).
3. Serif: **marketing-only** — confirmed.
4. Radar: **6 planets FINAL for v1**; 12-sector language removed from implementation copy.
5. Comparison mode: **deferred**; must never become percentile/ranking — confirmed.
