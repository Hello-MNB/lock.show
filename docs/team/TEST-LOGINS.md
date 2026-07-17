# TEST LOGINS — the demo accounts (permanent reference)

**Owner asked this be permanent so it never gets lost (15 Jul).** These are the QA/demo login accounts,
one per entity type. They are seeded by **`scripts/seed.mjs`** (the canonical source — re-run it to
recreate or reset any account), and verified live in Supabase (`qexfndiyallwqhhzeerd`, all 5 confirmed).

> These are DEMO accounts on a throwaway `@gigproof.test` domain with a shared QA password — low
> sensitivity. Keep them in the repo/here, but do NOT paste them into a **shareable** surface
> (the Version Map artifact is shareable → never put credentials there).

## Where to log in
The app login: **www.lock.show/app/login** (or app.lock.show/login). Same password for all five.

## The five accounts — password for all: `Gigproof!2026`
| Entity | Email | Name | Lands on |
|---|---|---|---|
| **Artist** | `artist@gigproof.test` | נועה לוי | Artist Radar / Passport / Requests |
| **Representation / Agency** | `agency@gigproof.test` | אורן מזרחי | Roster (grown org, 5 seats) |
| **Buyer / Booker** | `booker@gigproof.test` | תמר אברהם | Discover / buyer flow |
| **Production / Producer** | `producer@gigproof.test` | דנה כהן | Production workspace / confirm |
| **Operator / Admin** | `operator@gigproof.test` | מאיה אופרטור | Admin cockpit |

## To reset / recreate
Run `node scripts/seed.mjs` (needs `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`). It is idempotent:
it creates missing users and resets the password + re-seeds the demo artist, roster, claims, and
passport snapshot. Password lives in `scripts/seed.mjs` (`const PASSWORD`).

## Status
Verified 15 Jul: all 5 exist in Supabase auth, email-confirmed. Live against the current app build.
