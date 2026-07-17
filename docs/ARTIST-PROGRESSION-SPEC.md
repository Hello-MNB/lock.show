# ARTIST PROGRESSION SPEC — the smart journey (owner order, 13 Jul)

_"Maximum value to the artist: what to improve, where to focus, how — a smart progression where
the artist knows the value of every stage." Verified against live code; every stage maps to an
EXISTING mechanism + a measured event. FIREWALL: progression is expressed as MILESTONES and
next-actions — never a %, progress bar toward a score, level number, or rank._

## 1 · The 8 milestones (each = a felt value moment, not a metric)

| # | Milestone | The artist's value ("what I got") | Trigger (measured event) | Exists today? |
|---|---|---|---|---|
| M1 | **Arrived** | "I'm in — 2 screens and my universe exists" | onboarding_completed | ✅ live |
| M2 | **First light** | "LOCK found something REAL about me" (scan lands a found-node) | evidence_added + processed (onboarding link) | ✅ live |
| M3 | **Radar alive** | "I see WHO I am — my strengths first, gaps waiting quietly" | radar_opened + first claim_confirmed | ✅ live |
| M4 | **Focused** | "I know exactly what to do NEXT, and why it matters in MY genre" | next-action interactions (genre-weighted) | 🟠 ladder live; genre weighting = this batch |
| M5 | **Backed** | "Someone who was there confirmed my story" (Self-declared → Producer-confirmed) | producer_confirmation_sent → received | ✅ live |
| M6 | **Published** | "I have ONE link a stranger can trust" | passport_published | ✅ live (free in pilot) |
| M7 | **In the market** | "My proof is in front of real buyers" | share_link_created → passport_view | 🟠 share events this batch |
| M8 | **Answered** | "A real buyer responded to ME" — the Gate moment | professional_reaction_submitted | ✅ live |

Cycle: after M8 the loop re-enters at M4 ("your proof aged / new gig → new focus") — the
Growth-Advisor recurrence (Codex v1.6.7; the future Momentum value, CFRO-aligned).

## 2 · How progression is SHOWN (firewall-safe UI grammar)
- A **milestone path** (8 named moments, each ✓/current/quiet-upcoming) — bounded states, no %.
- The current milestone always pairs with ONE next-action (the existing ladder) + a one-line
  "why this matters in your genre" (weight table, DS v1.6.11 — guidance wording only).
- Planet emphasis: the artist's genre-primary planets render with stronger presence + a
  "matters most in your genre" tag; NEVER dimming/shaming the others.
- Value preview: each upcoming milestone shows its value sentence (column 3 above) — the artist
  always knows what the next stage GIVES them.
- **Codex designs the milestone-path element + genre-emphasis treatment (batched ask).**

## 3 · Where it lives
Artist home (N3): milestone path sits with the next-action card (mobile: above it; desktop:
in the radar's overlay frame). PassportSelf: M6–M8 sub-states near publish/share. No new route.

## 4 · Derivation (implementation note)
`deriveMilestone(artist, items, claims, events?)` — pure client derivation from data already
loaded on the home screen (claims states, published flag, share/view/reaction presence comes
from existing tables via the requests/notifications the artist already sees; no new schema).
Genre weighting: map artist.genre → genre family → planet weights (DS v1.6.11 table, shipped as
a code constant with the DS version noted) → orders next-action candidates + planet emphasis.
