# GIGPROOF — Architecture Rules (scalable + design-swappable)
PM: R16. Goal: clean architecture that grows, and a design layer we can REPLACE later without rewriting logic. Read alongside CLAUDE.md.

## NON-NEGOTIABLE PRINCIPLES
1. **TypeScript, strict.** No `any` in domain code. Typed DB models + typed env.
2. **Layered, feature-organized — never Supabase calls scattered in components:**
   - `/src/lib/db/` — the ONLY place that talks to Supabase. A typed data-access layer; the rest of the app imports functions from here.
   - `/src/lib/ai/` — the claim-processing engine behind an INTERFACE (`AiClaimProcessor`). Ship a deterministic **stub** now; the real Anthropic implementation drops in later with zero callers changed.
   - `/src/features/*` — artist, evidence, claims, mirror, passport, requests. Each feature owns its logic + screens.
   - `/src/components/ui/` — design-system primitives (Button, Card, Chip, StatusBadge, Field…).
3. **★ DESIGN IS A SWAPPABLE LAYER.** All visuals come from **design tokens** (`src/tokens.ts` → Tailwind theme) + the `/components/ui` library. Screens COMPOSE these primitives. A future redesign = change tokens + ui components ONLY — feature logic must not contain hard-coded colors/spacing/one-off styles.
4. **Firewall enforced SERVER-SIDE:**
   - RLS policies on every table.
   - `/api/passport/:id` returns ONLY published, approved, passport-ok fields. The endpoint physically cannot return a score, percentile, exact head-count, gaps, rejections, or private values. UI hiding alone is not acceptable.
5. **Scale by design:** stateless frontend (Vercel) + Postgres (Supabase). Public Passport reads a `passport_versions` snapshot (cacheable, immutable).
6. **Migrations versioned** in `/supabase/migrations/`. No manual schema drift; every change is a numbered migration.
7. **Config via env only.** No secrets in code or git.

## DEFINITION OF "GOOD ARCHITECTURE" (PM checks these)
- Can we swap the entire visual design by editing tokens + `/components/ui`, with zero changes to `/features` logic? → must be YES.
- Is every Supabase call inside `/src/lib/db/`? → must be YES.
- Is the AI engine behind one interface with a stub + a clear seam for the real model? → must be YES.
- Does `/api/passport/:id` physically refuse to return score/exact-count/gaps? → must be YES.
- Are there migrations (not hand-edited tables)? → must be YES.

## FILE MAP (current, after refactor)
```
src/
  features/
    auth/          AuthProvider, Login, Signup, ForgotPassword, ResetPassword, UserTypeSelect, ConsentLegal
    artist/        ArtistDashboard, ArtistReadiness, Onboarding
    evidence/      EvidenceCapture
    passport/      Passport (uses /api/passport/:id), AvailabilityRequest, RequestConfirmation
    agency/        AgencyDashboard, AgencyRequestsInbox
    booker/        BookerHome
    setup/         SetupNotice
  lib/
    db/            index.ts (typed repository layer, ONLY Supabase callers)
    ai/            interface.ts · stub.ts · anthropic.ts · index.ts
    i18n/          he.js · en.js
    storage.js
    supabase.js
  components/
    ui.jsx         (design-system primitives; import from tokens.ts)
  context/
    LangContext.jsx
  tokens.ts        (single source of visual truth)
  types.ts         (domain types: Artist, Claim, ProfileItem, EvidenceArtifact…)
  App.jsx
  main.jsx
server/
  index.js         (Express: /api/health · /api/process-evidence · /api/passport/:id)
supabase/
  migrations/
    001_initial_schema.sql
  schema.sql       (source of truth; each change = new migration)
```
