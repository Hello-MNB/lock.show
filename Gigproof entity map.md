# GIGPROOF — ENTITY MAP (FULL MODEL · target locked · Gate-1 slice marked)
**Version:** v2.0 · **Date:** 2 July 2026 · **Owner:** Maria (R00) · **Architect:** R16
**Authority:** ★ START HERE + CLAUDE.md + 7 CURRENT canon docs · Monetization Arch (1S4DkoC…) · Intelligence Map v2.1 · Taxonomy Registry v1.0
**Drive:** update in place only → folder 1QyQtp-vVcqosKplB_zMmtWNweBH_PaS3 · never duplicate.

**WHAT THE APP IS:** Pre-booking proof / risk-reduction tool. Helps IL אמרגנים evaluate an unfamiliar artist via standardized, method-labeled evidence before they risk their name. Talent ≠ bookability. NOT an EPK, NOT a booking CRM, NOT a guarantee.
**FIREWALL (absolute):** NO score/percentile/rank/"bookability %"/prediction/gauge. Draw = bands + binaries + method labels only. Streaming = secondary context. Mirror (artist, private) = gaps; Passport (public, buyer) = verified strengths only. Artist-vs-artist NEVER. N/A≠ZERO.
**STAGE:** Pre-validation. Gate = 1 booking manager reacts to a real Passport AND one pays. No price/ICP locked until then.
**STACK:** React+Vite+Tailwind · Supabase (ref qexfndiyallwqhhzeerd) · Vercel · Anthropic (concierge-stubbed). Codebase C:\Users\user\GIGPROOF synced to Drive app\.
**AI:** claim-pipeline concierge-processed BY HAND until volume justifies automation (Anthropic stubbed).

**★ BUILD LAW:** This map is the LOCKED TARGET (so pricing + goals can be modeled against the whole surface). Only items tagged 🟢 GATE-1 get built now. Everything 🔵 FULL-BETA is schema-designed now, built after the Gate. Building FULL-BETA UI before the Gate = architecture ahead of evidence = forbidden.

---

## 1. ACCOUNT MODEL — person → workspace → role → subscription (CORRECTED)
**The correction (adopted):** subscription attaches to a WORKSPACE, not to a person and not to a "hat." One login, many workspaces, a role inside each, subscription per workspace, entitlement = plan × workspace × capability × permission. A multi-role person is never billed for merely holding another role — only for a workspace that uses paid capability.

```
Person (one login)                          🟢 GATE-1 (artist only)
├── Personal workspace                      🟢
├── Organization memberships                🔵 FULL-BETA
├── Role assignments (per workspace)        🟢 (artist) / 🔵 (others)
└── Access grants (artist_access)           🔵

Workspace  (the subscription-bearing unit)
├── Artist workspace                        🟢 GATE-1
├── Management / agency workspace           🔵 FULL-BETA
└── Event / producer workspace              🔵 FULL-BETA

Artist workspace
├── Act identities (1 person → many acts)   🟢  (SHIDAPU=16 aliases proves this)
├── Performance offers                      🟢
├── Evidence                                🟢
├── Radar (private Mirror)                  🟢
├── Passport (public)                       🟢
└── Opportunities                           🔵

Subscription → attached to workspace/roster/paid resource   🔵 (manual pay 🟢 for the 1 payer)
Entitlement  → plan × workspace × capability × permission
```

**Why workspace-based (concrete):** PERLMAN = DJ + co-producer. He has an *artist workspace* (may be paid) AND access to an *event/producer workspace* (free during validation). He pays only where a workspace uses paid capability — never twice for being two things. Noa Kirel's manager pays at the *North Star Management* workspace, not personally.

---

## 2. ALL ENTITIES

### 2A · PERSON, WORKSPACE, ROLE (the corrected actor model)
| Concept | Example | Build |
|---|---|---|
| Person (human, one login) | Roy Biton | 🟢 |
| Artist workspace | SHIGAON artist world | 🟢 |
| Management/agency workspace (org) | North Star Management | 🔵 |
| Event/producer workspace (org) | Night Tales Productions | 🔵 |
| Role inside a workspace | owner · artist_manager · booking_agent · roster_coordinator · viewer · producer | 🟢 owner / 🔵 rest |
| Act identity (belongs to artist workspace) | Maya Vale / SHIGAON | 🟢 |
| Performance offer (belongs to act) | Live PA / DJ set | 🟢 |

**★ Agency is NOT a role** — it is an organization/workspace TYPE. People hold roles *inside* it. (Corrected from v1.0.)

### 2B · HUMAN ROLES × RISK × PAYMENT × RADAR
| Role | HE | Risk carried | Pays? (hypothesis) | Radar / interface | Build |
|---|---|---|---|---|---|
| Artist | אמן | career/income | ✅ primary payer candidate | Artist Radar (private Mirror) | 🟢 |
| Booking Manager | אמרגן | reputation | ❌ free (demand engine) | Passport evaluation view | 🟢 (view) |
| Artist Manager | מנהל אמן | manages artist(s) | via mgmt workspace | dev view + roster intel | 🔵 |
| Booking Agent / Roster Coord | — | inside agency | via agency workspace | roster views | 🔵 |
| **Event Producer** | מפיק | money (נפילת ערב) | via producer workspace (later) | **full event-eval interface** | 🔵 |
| **Source Confirmer** | מאשר מקור | none (bounded task) | never charged | **NO interface — magic-link only** | 🟢 |
| Venue Programmer | מתכנן לוח | programmatic | ❌ | Passport eval (forwards) | 🔵 |
| Operator | אופרטור | system/trust | internal | ops console | 🟢 (minimal) |

**★ SOURCE-CONFIRMER vs EVENT-PRODUCER (corrected — these were wrongly merged in v1.0):**
- **Source Confirmer** = receives ONE narrow magic-link, confirms/corrects ONE claim, no account, outside all navigation. 🟢 GATE-1.
- **Event Producer** = a real workspace: evaluates artists, creates event contexts, saves shortlists, requests availability, manages decisions, event-specific Passport interpretation. 🔵 FULL-BETA.
- The same human (e.g. PERLMAN) can be BOTH across different moments — confirmer via link today, producer-workspace user later.

### 2C · DATA SPINE (non-human core entities)
| Entity | Holds | Key firewall fields | Build |
|---|---|---|---|
| `act` / `alias` | one bookable identity | 1 person → many acts | 🟢 |
| `evidence_artifact` | proof (4 doors) | source_type, checksum, consent | 🟢 |
| `claim` | publishable bounded unit | certainty, reviewed_at, visibility, passport_eligibility | 🟢 |
| `gig`/`event` | live footprint | audience_band, exact_count(mirror-only 🔒) | 🟢 |
| `relationship` | label/distributor/mgmt/booking | `type` enum (Noa Kirel: NEVER flatten) | 🟢 |
| `release` | catalogue item | role: original/remix/collab | 🟢 |
| `passport_version` | published snapshot (ONE truth, per-viewer interpretation) | — | 🟢 |
| `professional_reaction` | buyer action | action_type enum | 🟢 |
| `availability_request` | commercial intent only | bands only | 🟢 |
| `producer_confirmation` | one-claim confirm | authority_type, name_visibility | 🟢 |
| `consent_record` | contextual consents (Amendment 13) | scope enum | 🟢 |
| `workspace` | subscription-bearing unit | type, plan | 🟢 (artist) |
| `subscription` | plan on a workspace | workspace_id, plan | 🔵 (manual 🟢) |
| `entitlement` | plan × workspace × capability × permission | — | 🟢 (minimal) |
| `audit_event` | every operator write | actor, reason, delta | 🟢 |

---

## 3. CROSSINGS (who touches whom)
```
ARTIST(workspace) ─authors─▶ CLAIM ─publishes─▶ PASSPORT(one truth) ─viewed by─▶ BOOKING MGR / VENUE PROG / PRODUCER
   │                            ▲                     │                                    │
   └─owns─▶ ACT ──has──────────┘             PassportViewEvent                    ProfessionalReaction
                                                     │                                    │
SOURCE CONFIRMER ─magic-link─▶ ONE CLAIM (upgrades method label)              AvailabilityRequest (commercial only)
EVENT PRODUCER(workspace) ─evaluates─▶ PASSPORT + builds event context + shortlist   🔵
AGENCY(workspace) ─artist_access(scoped,revocable)─▶ ARTIST's Passport   🔵
OPERATOR ─audited actions─▶ any entity
PERSON ─switches WORKSPACE─▶ different nav/home/radar/passport-interpretation/subscription (NOT re-registration)
```
**BANNED crossings:** artist→artist compare · producer→rated (confirmer/producer is never a rated party) · any score on any surface · web-data→published-without-artist-confirm · cold-directory of non-onboarded artists (Amendment 13).

---

## 4. ONE INTELLIGENCE SPINE → CONTEXTUAL INTERFACES (not a radar per role)
One Passport truth layer; interpretation changes by viewing role. One data spine (Layer-1 map); each interface is a filter.
| Interface | Role | Shows | Build |
|---|---|---|---|
| Artist Radar (Mirror) | artist | private growth: evidence states + gaps + ONE next-action | 🟢 |
| Passport (public) | buyer | verified strengths only, method-labeled, per-viewer read | 🟢 |
| Manager view | manager | what's pitch-ready · commercial story · missing assets · roster intel | 🔵 |
| Producer event-view | producer | why this artist fits THIS event · supported evidence · what to request · who has booking authority | 🔵 |
| Ops console | operator | trust + admin + concierge claim-processing queue | 🟢 (minimal) |

**Radar views (all one spine):** Mirror · freshness lens · passport-readiness lens · confirmation queue (4th door) · opportunity lens (temp) 🟢 · roster proof-health · own-roster coverage-compare (matrix only, no totals/score) · shortlist coverage-compare (⚠️ Wave-B, coverage not score) 🔵.
**7 WORLDS (nav grouping):** Identity&Offer · Audience&Draw · Live&Performance · Professional Readiness · Business&Representation · Trust&Relationships · Momentum&Territories.

---

## 5. ONBOARDING (jobs, not roles · register once · workspace-based)
Adopted shape (corrected — single job-choice, not 7-role multi-select):
```
Register once (Google/Facebook/email — NO role asked first)     🟢
→ "What would you like to do first?" (JOBS):                    🟢 artist job only at Gate-1
     • Build my artist world      🟢
     • Manage artists             🔵
     • Evaluate artists for an event  🔵
     • Join via invitation        🔵
→ Resolve identity (claim/create) — claim ONLY a discovered-&-surfaced act, never a cold directory  🟢 ⚠️Amendment 13
→ Create first workspace (minimal fields)                       🟢 artist
→ First value (connect links → private Passport preview appears) 🟢
→ Contextual consent (NOT one giant screen — see §6)           🟢
→ Enter workspace home                                          🟢
→ Add other workspaces/roles later (workspace switcher)         🔵
→ Switch context without re-registering                         🔵
```
**★ Firewall note on "claim existing profile":** claiming works only for an act GIGPROOF discovered and surfaced for the artist to claim (4th-door: surface→confirm). NEVER a pre-built searchable directory of artists who haven't onboarded — that's the cold-database Amendment-13 risk.

---

## 6. CONTEXTUAL CONSENT (not one mega-screen — Amendment 13)
| Consent | Fires when | Build |
|---|---|---|
| Account terms | at registration | 🟢 |
| Data-connection consent | when connecting a source/OAuth | 🟢 |
| Publication consent (Mirror→Passport) | when sharing a Passport | 🟢 |
| Manager-access consent | when granting agency access | 🔵 |
| Counterparty-name consent | during confirmation | 🟢 |
| Marketing consent | separate, optional | 🟢 |
All BLOCKED for real data until counsel sign-off (SEC-01 + Amendment 13).

---

## 7. PAYMENT / ECONOMY (workspace-based · who-benefits pays)
**Model:** free supply + free demand = fuel; paid = verification/throughput above them. Subscription on the WORKSPACE. Multi-workspace person → ONE billing centre listing each workspace's plan; never charged for switching.

| Workspace | FREE | PAID hypothesis | PROHIBITED |
|---|---|---|---|
| Artist | Mirror basics, identity, limited evidence, basic Passport, receive requests, export/delete | Artist Growth / Pro: evidence-processing + supported Passport + freshness + confirm-workflow (₪ TBD — NOT locked till Gate) | pay-to-verify, status badge, pay-to-rank |
| Management/Agency | roster beta access | Roster / Manager Studio / Agency Scale: throughput + standardized evidence + shared inbox (LATER) | ownership transfer via payment |
| Event/Producer | free during validation | Producer Intelligence (LATER) | charging a confirmer |
| Buyer (booking mgr/venue) | Passport view, method inspection, availability request (free, no login) | (only if repeat demand proven) | paywall the reaction (it's the validation signal) |

**PAYER ROLES kept separate:** user · beneficiary · supply-owner · demand-buyer · economic-buyer · payer · account-owner · renewal-decider.
**Pilot:** manual payment (Bit/transfer → PaymentRecord → server Entitlement). No Stripe until 1 payer validated. 🟢

### Smart economy by DATA CATEGORY (who benefits → who pays)
| Data category | Benefits | Free/Paid | Why |
|---|---|---|---|
| Identity/positioning | artist (supply) | FREE | acquisition fuel |
| Evidence processing (claim pipeline) | artist | PAID | real cost + real value (concierge now) |
| Method labels/bands | buyer trust | FREE to view / PAID to generate | view=demand fuel |
| Draw / attributed sales | artist proof | PAID | highest-value proof unit |
| Freshness / refresh | artist recurring | PAID | the subscription hook |
| Producer confirmation | artist proof + corpus | FREE to confirmer / PAID workflow to artist | never charge confirmer |
| Community band (WhatsApp/TG) | artist proof (IL-key) | PAID | self-declared, method-labeled |
| Passport view / react | buyer | FREE | demand engine — never paywall |
| Roster standardization | agency | PAID (later) | throughput value |
| Discovery/enrichment (4th door) | artist self-knowledge + corpus | PAID (post-consent) | growth loop, artist-authored |

**Rules:** never charge both sides for the same basic request · never sell contact data · never paywall the buyer reaction.

---

## 8. GATE-1 BUILD SLICE (what actually gets built NOW)
The whole map above is the locked target for pricing/goals. Build ONLY this now:
1. Person + one artist workspace (schema = full model; UI = artist only) 🟢
2. Act/alias + evidence + claim (data spine) 🟢
3. Artist Radar (private Mirror): evidence states + ONE next-action 🟢
4. Passport (public): verified strengths only, method-labeled, WhatsApp-scannable 🟢
5. Source-confirmer magic-link (ONE claim, bounded) 🟢
6. Contextual consent (account + connection + publication + counterparty-name) 🟢
7. Manual payment → entitlement (the 1 payer) 🟢
8. Concierge claim-processing (by hand) + minimal ops queue 🟢

Deferred to FULL-BETA (schema-ready, not built): management/agency + event-producer workspaces, workspace switcher, billing centre, subscription families, roster/coverage-compare, opportunities, discovery engine (counsel-gated).

**Next Action** — Confirm the workspace model as the locked DB backbone; GPT builds the §2C spine + §1 person/workspace/role tables (full schema), UI scoped to §8 Gate-1 slice only. Design the DB so producer-workspace, agency-workspace, subscription-per-workspace exist as tables now (cheap) even though their UI waits.
**Missing Inputs** — Lock the artist-workspace plan names/capabilities (not prices — Gate decides prices). SHIGAON's real claims to seed the spine + Passport. Counsel on consent + discovery.
**Business Impact** — Corrected to a workspace-based model that fits real IL multi-role operators (PERLMAN artist+producer) without double-billing or duplicate accounts, and separates the bounded source-confirmer from the full event-producer — a real gap in v1.0. Full model is visible for pricing/goal-setting; build stays a tight Gate-1 slice. Schema-now/UI-later keeps you off the migration treadmill while honoring pre-validation discipline.
