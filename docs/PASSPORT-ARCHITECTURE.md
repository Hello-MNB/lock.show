# Passport architecture — two buyer personas, one set of facts

_Last updated: 2026-07-10. Owner: Maria. Status: shipped to the branch, pending deploy._

## Why two passports

The public Passport (`/passport/:id`) is the WEDGE — the buyer-facing surface the
whole validation gate runs through. Two different buyers open it:

| Buyer | What they're deciding | Cares about first |
|---|---|---|
| **Booking a show** (venue / event) | Put this artist on a specific date? | Can they **draw**? Are they **ready**? |
| **Representing** (agency) | Take this artist onto a roster? | **Career proof** + **audience** trajectory |

So the same evidence is shown in **two views** that differ only in **order and
framing** — never in the facts.

## Naming — why not "Producer / Agency"

The prototype called the first persona "Producer". But in the app model
**`producer` already means the claim-CONFIRMER** (the person who worked with the
artist and confirms one statement via magic link — `/producer/received`), which
is a *different entity* from the event booker. To avoid one word meaning two
things, the personas are labelled by **intent**:

- **Booking a show** (not "Producer")
- **Representing** (agency)

## File layout

```
src/features/passport/
  Passport.jsx            ← LOADER: fetch + load-states + persona + conversion sheet.
                            Delegates the page to one of the two views. Route stays /passport/:id.
  PassportBookingView.jsx ← Booking persona. Order: Draw → Performance → Readiness → Context.
  PassportRepView.jsx     ← Representation persona. Order: Career proof → Audience → Draw → Readiness.
  passportKit.jsx         ← SHARED: proof primitives (MethodLabel, BandPill, ProofUnit),
                            section blocks, PassportHero, PersonaToggle, and — critically —
                            deriveSections(): the ONE firewall-safe transform from live data.
```

**The firewall lives in `passportKit.deriveSections`, not in the views.** A
persona can reorder and relabel sections; it *cannot* reshape a fact. Every
section block returns `null` when it has nothing verified, so the public face
never renders "missing" (RENDER LAW). Bands only, method labels always, no
score, no gauge.

## Persona selection

- Self-selected by whoever opens the link (the passport is public, no login) via
  the toggle in the hero.
- Deep-linkable: `?view=rep` opens the representation framing directly, so an
  artist can share the rep-flavoured link to an agency. Default (no query) =
  booking view.

## Conversion

Both personas use the **same** availability-request flow and the same action
sheet (canon P0-6). Only the primary CTA label changes: **Check availability**
(booking) vs **Discuss representation** (rep). No new backend flow, no new
analytics vocabulary — `passport_view_event` and `professional_reaction` are
unchanged.

## What did NOT change

- Route `/passport/:id` (and `/request`, `/sent`) — unchanged.
- The artist's own preview (`PassportSelf` → redirects to `/passport/:id`) — now
  shows the same two-persona surface for free.
- RLS / column grants / analytics — untouched.
