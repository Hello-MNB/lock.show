# ENTITY GLOSSARY — the ONE vocabulary authority

_Owner finding (12 Jul): "יש ערבוב בין ישויות — המונחים אינם מקצועיים ולכן יש אי הבנה."
Verified in code: CORRECT. Codex ran the same audit in parallel → DS v1.5.6, then **v1.5.8
(demand-side correction — now governing)**. This file = Codex's DS table + Claude's code-reality
columns, reconciled. Every UI string, site page, doc, and DS component must use these terms.
Code identifiers (DB values, role enums) are FROZEN — renaming them is a data migration,
scheduled separately._

**⚠️ v1.5.8 correction (supersedes this file's first edition):** the buyer is NOT an אמרגן.
אמרגן = artist-side agent/office (matches code ruling BT-56–58, `constants.js:9-10`,
`UserTypeSelect.jsx:32-34`: "Mapping אמרגן → BOOKER was a critical domain inversion"). The
demand side is segmented — see §2b. The first edition of this file repeated the inversion in
the Booker row; corrected below.

## 1 · The verified mess (evidence, 12 Jul)

The word **"producer"** currently means THREE different things:

| Where | Identifier | What it actually means |
|---|---|---|
| `src/lib/constants.js:16` | `ROLES.PRODUCER = 'producer'` | the **accountless magic-link confirmer** — routes to `producerReceived` |
| migration 027 / `OrgContext.jsx:80` | `organization.workspace_type = 'producer'` | the **Production COMPANY workspace** (events + lineups + team) |
| site `/producers` page | "For Producers — 20 Seconds, No Account" | the confirmer again — but a reader can't know that |

The word **"booker"** is equally split:

| Where | Text | Collision |
|---|---|---|
| `he.js:99` signup | `'אני מזמין / מפיק אירוע'` | calls the booker a **מפיק** — the production workspace's word |
| `he.js:564` | `workspaceBooker: 'מרחב אמרגן'` | calls the booker workspace **אמרגן** — but the אמרגן office is the AGENCY entity |
| `en.js:99` signup | "I'm a booking manager / event organizer" | claims "booking manager" — but `en.js:101` agency claims "artist manager" too |
| `orgs.js:20` | `'booking_manager' → ROLES.BOOKER` | a solo booking manager lands in role `booker`, an office lands in `agency` — same profession, two identifiers |
| site `/bookers` | audience = booking managers (אמרגנים) | slug "bookers" · copy "booking managers" · app role `booker` — three spellings of one thing |

Structural cause (`demo.js:89`): a production company is stored as `functional_role: 'agency'`
+ `workspace_type: 'producer'` — production rides on the agency role family with a flag.
Navigation is correct (contract-tested) but the NAMES lie.

## 2 · Canonical terms — DS v1.5.6 ratified (Codex table + code mapping)

Core split (Codex, accepted): **Person/Account** = human login, never public artist identity ·
**Workspace** = operating context (data, billing, seats) — valid customer contexts: artist,
management-agency, event-production · **Role/Membership** = permission inside the active
workspace, not identity.

| Entity (v1.5.6 term) | Meaning | HE (owner to confirm) | Frozen code identifiers | Implementation warning |
|---|---|---|---|---|
| **Artist workspace** | Artist-controlled private growth/Radar context | אמן | role `artist`, workspace_type `artist` | artist feels supported, not inspected |
| **Act** | The bookable product/project inside the artist context | פרויקט אמנותי / אקט | `act_id` (multi-Act) | evidence + Passport scoped per Act, non-transferable |
| **Passport** | Artist-approved public professional context | פספורט | `passport_version.act_id` | public, recipient-safe, no private Radar gaps |
| **Manager office / Agency** | Roster-management workspace (solo OR team) | משרד אמרגנות | role `agency`, workspace_type `management` | membership ≠ ArtistAccess ≠ artist ownership |
| **ArtistAccess** | Scoped artist-granted access | הרשאת גישה מהאמן | 027 access grants | separate axis from org/team membership |
| **Production workspace** | Event-production operating context (solo OR team) | משרד הפקה (מפיק אירועים) | workspace_type `'producer'` ⚠️ legacy value | separate from Source Confirmer; never bare "producer" |
| **Source Confirmer** | Accountless one-claim confirmation task via bounded magic link | מפיק מאשר | role `producer` (fallback only, not in signup) | NO signup, NO dashboard, NO workspace shell — never build as a workspace |
| **Booker** | Recipient/buyer CONTEXT (usually reading a Passport link) — NEVER אמרגן | מזמין הופעות (segmented — see §2b) | role `booker` → `discover` screen-set | Passport review needs no viewer workspace by default |
| **Operator** | Internal system console | תפעול | role `operator` | not a customer workspace, no public signup |

## 2b · The demand side is SEGMENTED (DS v1.5.8 — never collapse into "show-business pros")

| Buyer context | HE (Maria to lock final taste) | Language register | Workspace? |
|---|---|---|---|
| Professional entertainment buyer (venue/club/festival/promoter/talent buyer) | מזמין הופעות / מנהל בוקינג / פרומוטר | booking/talent language OK | optional (booker screen-set) |
| Private event client (wedding couple, family event, private party) | לקוח פרטי / מזמין אירוע | simple, non-industry: style, fit, trust, availability | NO — Passport review/contact flow only |
| Corporate client (company/HR/office manager) | לקוח עסקי | reliability, fit, invoice/logistics | NO by default |
| Event planner (plans for a client) | מתכנן אירועים | coordination, style/fit, availability, vendors | optional |
| Event production (executes event/logistics/lineup) | מפיק אירוע / צוות הפקה / חברת הפקה | professional | YES — Production workspace (solo OR team) |

Six questions before touching any copy/route/component (DS v1.5.8 rule): artist-side representation?
professional buyer? private/non-industry client? event production? source confirmation only? does the
context need a workspace at all — or only a recipient/Passport-review flow?

**One flag back to Codex (Claude, 12 Jul):** the canon method label on live Passports is
**PRODUCER-CONFIRMED** (CLAUDE.md + A13 + shipped chips), and a *different* method is
**Source-linked**. "Source Confirmer" as the person's name sits close to "Source-linked" —
readers may merge them. Resolution to ratify: **Source Confirmer = the generic mechanism**
(a producer is today's source type); the chip vocabulary stays exactly canon
(Producer-confirmed / Source-linked / Evidence-supported / Self-declared) and is never
re-worded to "source-confirmed".

## 3 · Concrete fixes this unlocks (string-level, zero data risk — rel-07.13)

1. `he.js:99` booker signup label — demand-side wording without bare "מפיק" collision.
2. `he.js:564` `workspaceBooker: 'מרחב אמרגן'` — buyer workspace must NOT be called אמרגן (inversion).
2b. All artist-facing HE strings that call the Passport viewer "אמרגן" (he.js 111/161/213/464/505/508) → מזמין vocabulary; agency-team strings (589–669) keep אמרגן — there it is CORRECT (supply side).
3. `en.js:99` vs `en.js:101` — booker/agency signup labels both claim "manager"; separate per §2.
4. `en.js:579` / `he.js:562` `workspaceProducer` — Production workspace wording, not bare "producer".
5. Site `/producers` — one clarifying line: this page is the Source Confirmer flow (magic link,
   no account); the Production workspace is a different thing and gets its own site presence later.
6. Docs + roadmap + DS components — adopt §2 wording everywhere.

## 4 · Deeper renames (LATER — each is a governed migration, owner-approved)

- `workspace_type 'producer'` → `'production'` (027's own comment already flags this).
- Role enum names (`booker`/`agency`) → semantic names. Touches profiles.role CHECKs
  (001/003/021/027) — migration 033+, never casually.
- Site slug `/bookers` — keep (redirect cost); copy already says "booking managers".

## 5 · Rule going forward

Any new screen, doc, or DS component that introduces an entity word not in §2 is a blocked
review. Codex owns the DS naming table (v1.5.6 `#entity-hierarchy`); Claude keeps this file
bound to code reality; Maria owns the canonical HE column and any change to §2 terms.
Remaining risk after terminology (Codex verdict, accepted): FLOW QA — workspace creation,
switching, team growth, ArtistAccess, production/source boundaries proven in the real app
(Cowork C1–C2 + flow-gap P in rel-07.13).
