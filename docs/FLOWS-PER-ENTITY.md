# LOCK — FLOWS PER ENTITY (canon, from code truth)
Generated 13 Jul 2026 from `src/App.jsx` routes + feature code on branch `claude/b4-gigproof-discovery-e7749o`.
This is the owner-readable map of WHO goes through WHAT screens, per entity. Visual version:
Version Map artifact → "Flows" (and this file is the repo source of truth for it).
Firewall applies everywhere: no score/percentile/rank; bands + binaries + method labels only.

## Status legend
- 🟢 LIVE — on the production site/app today
- 🔵 BUILT — done on the release branch, ships with rel-07.13 (needs preview QA)
- 🟠 IN BUILD — my current batch
- ⏳ QUEUED — scheduled after preview

---

## 1) ARTIST (the core entity — NORTH STAR lane)
**Entry:** site (lock.show/artists) → Join beta → app signup `/signup` (role: Artist)
**Flow (the value ladder, M1→M8 milestones):**
1. `/signup` → `/select` (role) → `/onboarding` — light signup, consent inline at step 1 (no wall) 🔵
2. `/artist/home` — Dashboard: next-best-action card (proof → publish → share ladder, genre-emphasis note) 🔵
3. Radar (in dashboard) — 6 planets × 18 segments; genre weights internal; milestone path M1–M8 🟠 **← I am here**
   FIREWALL GRAMMAR (inline, binding): M1–M8 renders as a JOURNEY (✓ done / ● current / ○ next)
   — NEVER a % complete, level, progress bar toward a score, or count "X of 8". The milestone UI
   is next-action guidance; it triggers NO AI re-scan (pure UI over existing data).
4. `/evidence/:artistId` — Evidence capture → AI processing (EVIDENCE_UPLOADED/PROCESSED events) 🔵
   **AI STATUS (honest, GPT audit ruling):** what is LIVE = per-evidence claim extraction when the
   artist adds evidence. The canon's multi-source DEEP SCAN (≈$1, once at onboarding) + automatic
   incremental re-scans = **TARGET ARCHITECTURE, not yet built** (P2, post-preview). No business
   number may assume the deep-scan cost until it exists.
5. `/artist/claims` — AI claim review: approve / edit / send Source-Confirmer request 🔵
   (a PANEL reached from the Radar next-action card and notifications — not a nav destination;
   the route exists for deep links only)
6. `/artist/passport` — own Passport (Artist view = private, shows gaps) → publish (FREE in pilot) 🔵
7. `/passport/:id` — public Passport (Buyer view = verified strengths only; NO login needed) 🟢
8. `/artist/requests` — incoming availability requests from buyers 🔵
9. Multi-Act: act switcher + create new Act (evidence per-Act, non-transferable) 🔵
10. Access approvals — in Settings the artist sees a manager/agency's ACCESS REQUEST and
    approves/declines it (this is the artist side of the §2 handshake; grant ≠ ownership,
    revocable any time by either side) 🔵
**Payments: NONE in pilot — deliberate.** Publish is free; no payment step exists in the artist
flow (publish-wall ruled OUT by canon). N10 = entitlement *visibility* only (showing what plan
a workspace is on), not a charge. First real payment waits for Green Invoice + the Gate.
**Measured:** signup → onboarding → radar_opened → evidence → claim_confirmed → published → share → request.
**Post-M8 (GPT audit adoption, in current build):** after publish the next-action ladder must NOT
be a fixed "Share" forever — it derives from state: unreplied request → reply · stale evidence →
refresh proof · else share. The full Growth Loop (post-gig debrief, freshness engine, buyer-signal
themes) = P1 layer after preview, spec owned by GPT (CONTINUOUS-ARTIST-VALUE-SPEC).

## 2) ARTIST MANAGER / AGENCY (אמרגן — artist-side, NOT a buyer)
**Entry:** site `/managers` outreach page (?src batch token) → waitlist OR `/signup` (role: Agency)
**Flow:**
1. `/agency` — dashboard: roster (consented-roster card via roster-grants RPC, migration 032) 🔵
2. **ArtistAccess handshake (the consent flow):** agency sends an ACCESS REQUEST from its
   dashboard's access-requests card → the ARTIST approves in Settings (flow §1 step 10) →
   grant becomes ACTIVE → artist appears in the consented roster. Grant requires the artist's
   acceptance (REPRESENTATION-CANON §1.1); either side can revoke, effective immediately 🔵
3. `/agency/requests` — inbox of requests touching their artists 🔵
4. `/agency/radar` — radar feed over the roster 🔵
5. `/org/members` — team members (Booking agent role) 🟢
**Naming note (deliberate, not drift):** workspace type at signup = AGENCY (product entity);
waitlist marketing tag = artist_manager (audience label). They map 1:1.
**Measured:** managers_page waitlist_signup (role artist_manager + source recorded), workspace_switched.

## 3) PRODUCTION OFFICE (משרד הפקה)
**Entry:** site `/production` outreach page (?src batch token) → waitlist OR `/signup`
**Flow:**
1. `/production` — dashboard: events + requests (production-requests RPC, 032) 🔵
2. Request statuses: new / replied / closed chips 🔵
3. Source-Confirmer duties when asked to confirm artist claims → §5
**Outbound booking (clarification):** when a production office wants to BOOK an artist, it acts
AS A BUYER — it opens the artist's Passport link and sends an availability request exactly like
flow §4 (no separate outbound-request screen in this release; §3's dashboard shows the requests
it RECEIVES as an artist-side/confirmer party). Post-Gate we may add a native outbound screen.
**Measured:** production_page waitlist_signup (role production + source), request status flow.

## 4) BUYER / מזמין הופעות (pro promoter, planner, corporate, PRIVATE individual)
**Entry:** shared Passport link — `/passport/:id` — NO LOGIN, NO ACCOUNT (deliberate: zero friction) 🟢
**Flow:**
1. `/passport/:id` — Buyer view: verified strengths, bands + binaries + method labels 🟢
2. `/passport/:id/request` → `/passport/:id/sent` — availability request (name/event/date) 🔵
3. Optional signup (role: Booker) → `/discover` — Booker home = **a passport-link resolver**
   (paste the link/ID you received → opens the Passport). HONESTY NOTE (GPT audit): true "saved
   passports" / shortlist / notes do NOT exist yet — open discovery and saving are deliberately
   post-validation ⏳
**Measured:** passport_view, availability request sent (the GATE metric: a real buyer reacts).

## 5) SOURCE CONFIRMER (מאשר-מקור — venue/festival/production confirming a claim)
**Entry:** email/WhatsApp link from artist's claim → `/confirm/:token` — NO LOGIN 🔵
**Flow:** open link → see the specific claim → confirm / decline → done (one screen).
**Measured:** producer_confirmation_sent → producer_confirmation_received (evidence ceiling upgrade to 'verified').

## 6) SITE VISITOR (marketing site lock.show)
**Entry:** outreach message / social / search
**Flow:** audience page (`/artists` `/managers` `/production` `/bookers` `/producers` `/private-events`)
→ value copy → **BETA waitlist form** (role preset + source_page + ?src batch recorded) 🔵
Pricing page: UNPUBLISHED (redirects to /artists) 🔵.
**Measured:** waitlist_signup per role per source — the outreach funnel.

## 7) OPERATOR (Maria)
`/admin` — operator dashboard 🟢 · Supabase direct (migrations by your hand only) · release approvals.

---

## What ships in rel-07.13 vs later
- **rel-07.13 (preview → deploy):** everything marked 🔵 + the 🟠 Radar milestone-path/genre-emphasis batch.
- **⏳ after:** F4–F6 family registries wiring, GA4/GTM connector (parked), structural migrations 034+,
  Hebrew site, About page, open discovery.

## QA mapping (who verifies which flow on preview) — all SEVEN entity flows incl. Operator
- **Cowork (Q1–Q8):** flows 1–7 end-to-end in a real browser + waitlist counters + firewall watch-items
  + return-loop probes (reminders, event-date triggers, stale evidence, revoke, no auto-publish).
- **Codex (Q4):** design/DS conformance of flows 1, 4, 6 (its published checklist, SYNC).
- **CFRO:** business-case pass over flows 1, 4, 6 — monetization signal points (its validation pack).
- **GPT:** doc-vs-repo drift check of THIS file against the canon pack.
- **Maria (Q8):** owner pass — walk flow 1 (artist) + flow 4 (buyer) on the preview URL like a stranger.
