# PILOT MEASUREMENT MAP — the friends-cohort test (owner directive, 12 Jul night)

_"The real test: bring my artist friends into the app, verify everything works, they actually use
the services — measure the required actions and identify the monetization signals, for ALL entity
types." This file maps every signal → its analytics event → wiring status → what it tells the CFRO.
All events persist to `analytics_event` (demo excluded automatically), each row carries WHO
(actor_user_id) and WHEN. Wired 12 Jul night @ ba2cb3a unless marked earlier._

## ARTIST (the cohort itself) — funnel + monetization signals
| Signal | Event | Status | Monetization meaning (CFRO) |
|---|---|---|---|
| Signed up | signup_completed / login | ✅ live earlier | cohort entry |
| Finished 2-screen onboarding | onboarding_completed | ✅ live earlier | activation |
| Opened the Radar | radar_opened | ✅ wired now | engagement — Growth-Advisor pull |
| Added evidence | evidence_added | ✅ wired now | invested effort = retention signal |
| Ran AI processing | gig_evidence_refresh_completed | ✅ wired now | value moment (found nodes) |
| Approved a claim | claim_confirmed | ✅ wired now | trust in the pipeline |
| **Published the Passport** | passport_published | ✅ wired now | **the publish moment — CFRO's future payment trigger; FREE in pilot** |
| Created a second Act | act_created | ✅ wired now | multi-Act appetite → Momentum-Pro signal |
| Switched Acts | act_switched | ✅ wired now | multi-Act usage depth |
| Sent a producer-confirm link | producer_confirmation_sent | ✅ wired now | trust-network activation |
| Producer replied | claim_confirmed (server) + notification | ✅ live earlier | confirm completion rate (Source-Confirmer North Star) |
| Created payment reference | payment_reference_created | ✅ live earlier | willingness-to-pay (voluntary in pilot) |

## BUYER (the friends' real buyers) — the Gate's first half
| Signal | Event | Status |
|---|---|---|
| Opened a Passport | passport_view | ✅ live earlier |
| Sent an availability request | availability_request_created | ✅ live earlier |
| **Professional reaction** | professional_reaction_submitted | ✅ live earlier — **THE GATE SIGNAL** |
| Artist replied to request | availability_request_responded | ✅ live (event canon) |

## MANAGER OFFICE / PRODUCTION / OPERATOR / ALL
| Entity | Signal | Event | Status |
|---|---|---|---|
| Manager/Production | switched workspace | workspace_switched | ✅ wired now |
| Manager | roster from grants used | (A6 UI — after 032) | 🟠 032 + UI batch |
| Production | request inbox used | (A7 UI — after 032) | 🟠 032 + UI batch |
| Operator | payment activated + WHO | entitlement_activated (+actor) | ✅ live earlier |
| All | share link created/opened | share_link_created / share_link_opened | 🟠 canon-listed, wiring in share UI batch |

## Still unwired (known, small): signup_started · onboarding_started · oauth_login · claim_published · share_link_* — next build push; none blocks the pilot.

## How the pilot reads results (CFRO lens)
Publish rate (built→published) = value proof · share→view rate = distribution proof ·
view→reaction rate = THE Gate metric · confirm completion rate = trust network health ·
act_created count = Momentum-Pro appetite · payment_reference_created = voluntary willingness-to-pay.
NO score is ever shown to anyone — these are internal counters for Maria + CFRO only.
