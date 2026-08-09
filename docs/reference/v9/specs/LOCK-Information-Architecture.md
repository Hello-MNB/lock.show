# LOCK — Information Architecture (canonical)

**DoD:** every displayed fact traces to a canonical object with owner, lineage, states, visibility and per-persona projection. The four non-negotiable questions (came from? / owns truth? / who sees, in what form? / what next?) are answered per object. Dev implements without inventing data meaning.

## 1 · Information Object Registry

| Object | Owner (truth) | Source | Raw/Derived | States | Versioned | Freshness | Visibility | Screens |
|---|---|---|---|---|---|---|---|---|
| Act | Artist | signup + scan confirm | Raw | active | no | — | all (identity only) | all |
| Claim (professional fact) | Artist (per Act) | AI scan / self-report / counterparty | Raw→Confirmed | candidate·confirmed·stale·conflict | yes | 90d review nudge | private until approved | Radar, Category |
| Source/Evidence | System | platform APIs, links, uploads | Raw | linked·processing·failed | yes | per-platform | provenance layer (L5) | Category, source drawer |
| Confirmation | Confirmer | magic-link response | Raw | open·answered·wrong-person·expired | no | one-shot | strengthens claim only | Confirmer, Radar |
| Radar insight / Next Move | System (derived) | claims + gaps | Derived+Interpreted | current·done | no | recomputed | Artist-private ONLY | Radar hero |
| Scene benchmark | **RESERVED — not a canonical object until D4** | ⚠ D4 — dataset undecided | Derived | n/a | — | — | Artist-private | Scene (SAMPLE state shown) |
| Passport (published view) | Artist | approved claims, recipient policy | Published | draft·preview·review·published·superseded | yes | age shown in Library | per-recipient-policy | Library, Composer, Review, Public |
| Share link | Artist | share flow | Raw | live·expired·revoked | binds one version+policy | expiry optional (incl. endless) | one link = one view | Share, dead-link states |
| Enquiry/Thread | canonical Thread | booking sheet / channels | Raw | needs-reply·waiting·done | no | staleness on event date | Artist + mandated Rep projections | Inbox(A), Inbox(Rep) |
| Mandate (rep authority) | Artist grants | access request flow | Raw | requested·granted·declined·revoked·expired | audit log | expiry incl. endless | artist decides unilaterally; rep sees grant only | Access screens |
| Opportunity Case | Representation | enquiry promotion | Raw+Derived verdict | active·waiting·decision·confirmed·closed | no | waiting-owner shown | rep-internal; artist sees approval asks | Opportunities, Case |
| Offer matrix (floors) | Representation | agency settings | Raw | — | no | — | NEVER to recipient (firewall) | Case |
| Event | Production | new-event flow | Raw | draft·upcoming·live·done | no | date-driven | production-internal; brief travels in invite link | Events, Lineup |
| Slot | Production (owns changeover) | lineup board | Raw | open·shortlist·case·confirmed·advancing·done | no | — | candidate artists see brief only | Lineup, Slot detail |
| Professional Asset (rider/plot) | Artist/Act | upload | Raw | current·superseded | yes ⚙ version store | "newer exists" flag to Production | event-scoped review refs | Advance, Category |
| Gate signal | Admin (read-only) | instrumentation | Derived | reaction / intent / verified-paid — never merged | no | not-measured ≠ 0 | admin only | Admin cockpit |
| Show outcome / learning | Production → System | close-out | Raw→Derived | ⚠ D6 — retention policy undecided | — | — | learning-relevant only returns to Radar/Growth | Growth |

## 2 · Lineage map (core family: professional fact)
`platform/source → AI extraction (candidate) → artist confirm/correct/hide → canonical Claim → [private] Radar insight → [approved+policy] Passport fact → share link (one view, one version) → recipient decision/enquiry → Thread → Case → confirmed booking → show outcome → learning-relevant facts refresh Claims` — ⚠ terminal arrow is UNGROUNDED until D6 is ruled: do not render the learning-loop-back on any artist-facing surface before then (silent-meaning-change risk, rule 5).
Transformation types at each arrow: extract → confirm → interpret (private) → redact+reorder (publish) → project (per recipient) → act → learn. **Meaning never changes silently; only representation and scope.**

## 3 · Entity Projection Matrix (key objects)

> **Freeze note:** rows for Rep/Production/Admin are specified but FROZEN for QA until those entities pass Gate-1 validation — correct and cheap to keep, not worth verification cycles yet.

| Object | Artist | Rep | Production | Recipient | Confirmer | Admin |
|---|---|---|---|---|---|---|
| Claim + gaps + % | Full, editable | summary via Panel (no private gaps) | n/a | NEVER | one bounded statement | counts only |
| Passport | compose/publish | draft per mandate scope | candidate view (event-fit, no scores) | published view only | n/a | n/a |
| Enquiry | full thread, reply | draft/send per mandate; sender identity always shown | booking context projection | own receipt | n/a | volume |
| Fee floors | sees own | full | n/a | "on request" at most (D2) | n/a | n/a |
| Rider/plot | owns current | pitch-kit ref | version-reviewed per event | "available on request" | n/a | n/a |
| Event brief | via invite link | via case | full | n/a | n/a | n/a |

## 4 · Gap register (open)
- **P0 (decision):** D2 on-request lifecycle · D3 handoff receipt object · D6 outcome retention · D4 scene dataset · D5 admin roles.
- **P0 (engineering ⚙):** version store · link service · request object (already contracted).
- **P1:** terminology registry (enquiry/request, act/artist usage is consistent in UI; registry section pending) · Scene alternative-experience when D4 data absent.
- **Verified clean:** no private→public leakage (buyer views render approved facts only); single edit-surface per object (no dual truth); thread is one canonical object with projections.

## 5 · Non-negotiable rules (bind dev)
1. A screen never becomes a second source of truth — it consumes projections.
2. Publish = redact + reorder, never mutate meaning.
3. One link = one recipient view = one version.
4. Intent ≠ payment; not-measured ≠ 0.
5. Interpretation (Radar) is Artist-private; only confirmed+approved facts travel outward.
