# FLOW-GAP AUDIT — every entity — 2026-07-10

**Purpose:** the release-gate map of every flow gap across every entity, found by a full read of each
entity's real screens + data wiring. Prepared for the version update in progress (rel-2026.07.10).
**Severity:** P0 = blocks launch · P1 = needed for a strong launch · P2 = polish.
**Method:** four parallel audits (Artist · Buyer-side · Agency/Prod/Org · Cross-cutting), each reading
the entity's screens and tracing every data call in `db.js`/`orgs.js`/`server` to real vs stub.

> **Headline:** No architecture is broken. The single biggest blocker is **migration 030 not applied** —
> it silently kills every cross-org read (agency radar, roster grants, production events) with a Postgres
> `42P17` recursion that the `isPreMigration027` soft-catch does **not** even recognise. Everything else
> is data-wiring holes and un-emitted analytics, not skeleton faults.

---

## SUMMARY TABLE

| Entity cluster | P0 | P1 | P2 | Total |
|---|---|---|---|---|
| Artist | 1 (✅ fixed) | 3 | 3 | 7 |
| Buyer-side (Booker · Producer · Public Passport) | 0 | 1 | 3 | 4 |
| Agency / Production / Org / Switcher | 1 | 4 | 4 | 9 |
| Cross-cutting (Operator · Auth · Notifications · Analytics · Routing) | 0 | 2 | 2 | 4 |
| **TOTAL** | **2 (1 fixed)** | **10** | **12** | **24** |

---

## P0 — LAUNCH BLOCKERS

**A0. ✅ FIXED IN THIS RELEASE — Unreviewed AI claims published to the public Passport (firewall breach).**
A claim was born `visibility='passport-ok'` the instant it was auto-labeled verified/supporting
(`db.js` processEvidence / `server` process-evidence), *before* the artist reviewed it. `artist_approved`
(the intended publish gate, default false) was **never checked** by `claims_public_read` RLS,
`getPublicPassport`, `buildPassportSnapshot`, or the server's service-role `buildSafePayload` — so once an
artist published, every auto-labeled claim they never reviewed went public. The artist's own dashboard hid
them (`ClaimReview` checks `artist_approved`); the public face did not. Contradicts canon "zero claims
publish without review" and the in-app promise "Nothing publishes without you."
_Fixed:_ added `and artist_approved = true` to the row gate on all four surfaces — **migration 031**
(anon RLS) + `db.js` (authenticated + snapshot) + `server/index.js` (service-role). Verified in code;
build green. **Migration 031 must be applied to the live DB for the anon path.**

**A. `/agency/radar` is dead on the live DB** — `getRadarInputs` reads granted `artists` rows via the
non-owner access path; with **030 unapplied** it hits the artists↔artist_access recursion (`42P17`), and
the function has no soft-catch → RadarFeed renders its error state. _Fix:_ **apply migration 030**
(the real fix); interim, catch `42P17` in `getRadarInputs` and show a "radar needs migration 030" notice.
`src/features/agency/RadarFeed.jsx` + `orgs.js:302`.

> Note: the same 030 recursion also degrades roster grants, outgoing access requests, and production
> events (listed as P1/P2 below because those screens have a silent-empty catch; radar does not).

---

## P1 — NEEDED FOR A STRONG LAUNCH

**B. Sample-passport link is broken in production** — the "See a sample passport" escape hatch (and the
same pattern in Login) links to `/passport/demo-artist`, but `artists.id` is a `uuid`; outside DEMO mode
`getPublicPassport` throws Postgres `22P02` and the booker lands on the generic error screen — their only
no-link path is dead. _Fix:_ special-case `demo-artist` to a canned payload, or point at a real seeded
published passport UUID. `BookerHome.jsx:56`, `Login.jsx:65`.

**C. Two GATE analytics events never emitted** — `professional_reaction_submitted` and
`entitlement_activated` (the two events the whole pre-validation Gate exists to measure) are in
CANON/EVENTS but never passed to `logEvent`; the reaction writes only to its table and activation only
fires a notification. _Fix:_ add `logEvent(EVENTS.PROFESSIONAL_REACTION,…)` after
`recordProfessionalReaction` and `logEvent(EVENTS.ENTITLEMENT_ACTIVATED,…)` in admin `activate()`.
`Passport.jsx:110`, `AdminDashboard.jsx:98`.

**D. 11 M1 funnel events defined but emitted nowhere** — `signup_started`, `oauth_login`,
`consent_granted/withdrawn`, `onboarding_started`, `radar_opened`, `evidence_added`, `claim_confirmed`,
`act_created`, `act_switched`, `workspace_switched`, `availability_request_responded` — funnel is
measurable only at the 6 points already wired. _Fix:_ emit each at its success point. `analytics.js:69-90`.

**E. Agency roster ignores consented grants** — roster + inbox are built from `created_by === userId`
(ownership); active `artist_access` grants (the canon representation model) populate only the small
AccessRequestsCard, so a grant-only agency sees an empty roster/inbox. _Fix:_ merge active grants (via a
SECURITY DEFINER roster RPC) into the roster/inbox source. `AgencyDashboard.jsx`.

**F. Outgoing access-requests card silently vanishes** — `listOutgoingAccessRequests` cross-joins
`artist_access→artists`; its `42P17` is not matched by `isPreMigration027`, so it throws and the inner
`catch { setAccessRequests([]) }` empties the whole Representation/consent section with no error shown.
_Fix:_ add `42P17` handling (or a DEFINER RPC) + surface a needs-migration state. `AgencyDashboard.jsx`,
`orgs.js:220,248`.

**G. Accept-invite doesn't refresh the workspace list** — `accept()` navigates home but never calls
`OrgContext.reload()`; for an already-logged-in invitee the newly joined org is absent from the switcher
until a manual full refresh. _Fix:_ call `useOrg().reload()` (+ `switchOrg` to the new org) on accept.
`AcceptInvite.jsx`.

**H. Production requests inbox has no data path** — `listOrgConfirmRequests` unconditionally returns
`null` on live (DEMO-only), so `/production/requests` permanently shows "not wired yet"; no
`list_incoming_confirmation_requests` RLS/RPC exists. _Fix:_ ship that DEFINER RPC (mirror
`list_incoming_access_requests`) and wire it. `ProductionDashboard.jsx`, `orgs.js:375`.

---

## P2 — POLISH

**I. Draw headline can leak an exact count (firewall-risk)** — `DrawSection`'s headline is
`public_wording || public_band || value`; if a draw claim has neither public field, it falls back to raw
`value`, which can contain "Drew 450 people", bypassing bands-only. Safety currently depends entirely on
the pipeline always filling a public field. _Fix:_ drop the raw-`value` fallback in the draw headline;
show method-safe text when both public fields are absent. `passportKit.jsx` `DrawSection`.

**J. Producer "received passports" is permanently empty** — screen promises shared passports appear
here, but there's no data-layer fetch for passports shared with a producer (only the manual paste box
works). _Fix:_ add a `list producer's shared passports` fn, or keep honest-empty as an explicit launch call.
`ProducerReceivedPassports.jsx`.

**K. Producer confirmation fires no notification / no analytics** — a producer confirming a claim via
magic link never calls `createNotification`, so the artist's bell stays silent, and `claim_confirmed` is
never logged. _Fix:_ in ProducerConfirm success, `createNotification({type:'claim_confirmed',…})` (+ emit
the event). `ProducerConfirm.jsx`.

**L. "Link expired" state is unreachable** — client shows "expired" only on HTTP 410/"expir" body, but
the server returns 404 for missing tokens and does no expiry check, so the expired branch is dead and the
"short-lived on purpose" promise is unenforced. _Fix:_ add server-side expiry → 410 (or align copy).
`ProducerConfirm.jsx:47-54` vs `server/index.js:307-327`.

**M. Production events error on external artists** — `listOrgGigs` joins `artist:artist_id`; a lineup
slot on an artist the org doesn't own takes the non-owner RLS path → same `42P17` → EventsSection error
(owner-created gigs still load). _Fix:_ apply 030, or route gig-artist name through a DEFINER lookup.
`ProductionDashboard.jsx`, `orgs.js:337`.

**N. "Resend invite" lies** — `resendInvite` is a no-op on live (email is Phase-2) but the UI fires a
"invite resent" success toast unconditionally. _Fix:_ implement resend, or disable with a "coming soon"
state. `Members.jsx:81`, `orgs.js:169`.

**O. Agency "own" add-mode mints ownership (firewall/model-risk)** — the "own" tab's `addArtist` creates
a manager-OWNED `artists` row, contradicting the represent-via-consented-grants canon; labeled "legacy
placeholder" but still live and selectable. _Fix:_ hide/remove "own" mode; default + restrict to "invite".
`AgencyDashboard.jsx:207`.

**P. "Add workspace" adds nothing** — `addWorkspaceRoute(role)` returns the current role's existing home;
there is no create-a-new-org route, so "Add workspace" just re-navigates to where the user already is.
_Fix:_ add a real workspace-creation route (`/org/new` → `bootstrapOrg`) and point the link at it.
`ContextSwitcher.jsx`.

**Q. Production requests tab (honest-empty)** — duplicate of **H** from the cross-cutting angle; same root
(no read path for a production org to list addressed confirmation requests). Tracked as **H**.

---

## FIX SEQUENCING (recommended)

1. **Apply migration 030** — one owner action; clears the P0 and three of the P1/P2 recursion symptoms (A, E-partial, F, M).
2. **Harden the soft-catch** — add `42P17` to `isPreMigration027` so any residual cross-org read degrades gracefully instead of throwing (F).
3. **Fix the sample-passport link** (B) and the **draw-headline firewall fallback** (I) — tiny, high-value, ship with this release.
4. **Wire the two GATE events** (C) — the measurement the stage exists for; small.
5. Batch the rest (D, E, G, H, J-P) into the next builds by priority.

---

## ARTIST ENTITY — full gap list

**P0**
- **A0 (✅ FIXED this release)** — Unreviewed AI claims reached the public Passport; approval gate not
  enforced. See P0 section above. Files: `db.js` L286/L411/L433, `server/index.js` L86/L135,
  RLS `claims_public_read`. Fix shipped: migration 031 + read-path filters.

**P1**
- **R1 · Artist cannot respond to an availability request (dead-end).** The buyer request form collects no
  requester email/phone (`AvailabilityRequest.jsx` L20-23: only name/org/date/location/bands/message), and
  `ArtistRequests.jsx` L104-120 offers only `updateRequestStatus(id,'replied'|'closed')` — private flags that
  reach no one. The "respond" step has no outbound channel to the booker. _Fix:_ add a requester contact
  field to the request form and surface it in ArtistRequests as a `mailto:`/`wa.me` reply.
- **R2 · Multi-Act is unusable — no way to create a second Act (missing-screen).** `db.js` L93-145 has
  `getMyAct/updateAct/listActs/switchAct` but **no `createAct`**; the Act-switch sheet (`RadarUniverse.jsx`
  L540-563) only lists existing acts. The default Act is auto-created by a DB trigger, so a Person is locked
  to one Act — contradicts the multi-Act canon. _Fix:_ add `createAct(personId,{…})` + a "+ New Act" button
  that creates then switches.
- **R3 · AI pipeline silently degrades to a deterministic MOCK on a function-less deploy (stub).**
  `processEvidence` (`db.js` L298-309) falls back to `StubClaimProcessor` (`model_version:'mock-v1'`); the
  real Anthropic path runs only if the server is deployed with `ANTHROPIC_API_KEY`+`SUPABASE_SERVICE_ROLE_KEY`.
  A static deploy shows mock labels behind "AI is labeling your evidence" — contradicts the "fully automated
  best model" claim. _Fix:_ ship the serverless functions with keys on the release deploy (and/or gate the
  "AI" copy when running the stub).

**P2**
- **R4 · `new_request` notification deep-links the artist to an agency-only route (broken-transition).**
  `AvailabilityRequest.jsx` L55-60 hardcodes `link:'/agency/requests'`; a `ROLES.ARTIST` user is bounced by
  `RequireAgency` to home. Their real inbox is `/artist/requests`. _Fix:_ set the link to `/artist/requests`
  (or role-resolve it).
- **R5 · EvidenceCapture "producer-confirm" intent is a placeholder (stub).** `EvidenceCapture.jsx` L321-329
  only calls `addLink('producer-vouch')` — stores the typed contact as self-reported link evidence; it never
  generates the tokened magic-link (that lives only in `ClaimReview` via `/api/request-confirmation`), so this
  route dead-ends as a stored string. _Fix:_ wire the intent to the existing `/api/request-confirmation` flow,
  or remove the intent until built.
- **R6 · Producer-confirmation generation has no static-deploy fallback (broken-transition).** `ClaimReview`
  `generate()` L373-390 posts to `/api/request-confirmation` with no fallback; on a function-less deploy it
  dead-ends with a generic error. _Fix:_ document/require the server for this feature, or show a clearer
  "confirmation requires the operator server" state.

**Artist: 7 gaps (1 P0 ✅ fixed, 3 P1, 3 P2).**

---

## APPENDIX — full P0/P1/P2 index by ID

- **P0:** A0 (✅ fixed, firewall), A (agency radar / migration 030).
- **P1:** B (sample link), C (2 GATE events), D (11 funnel events), E (agency roster grants), F (outgoing
  access requests), G (accept-invite reload), H (production requests inbox), R1 (artist reply channel),
  R2 (create Act), R3 (AI mock on static deploy).
- **P2:** I (draw headline fallback), J (producer received-passports empty), K (producer confirm no
  notification), L (link-expired unreachable), M (production events external artist), N (resend-invite lies),
  O (agency "own" mints ownership), P ("add workspace" no-op), R4 (artist request notif link), R5 (producer-
  confirm placeholder), R6 (confirmation no static fallback).
