# LOCK — Prototype Registry & Version Management

Single source of truth for **which prototype is current**, its version, and where it lives. A missing or
stale prototype makes design partners (Codex) and engineers guess — so every prototype is versioned,
pointed-to, and archived here, mirroring the governance of the `BRANDING AND DESIGN SYSTEM` Drive folder.

> **Rule for handing work to Codex / anyone:** always link the **`00_CURRENT`** prototype (or its live
> artifact URL) + the current DS — never a scratch file or a superseded version. If a current prototype is
> missing for a surface, that gap is a task, not a green light to improvise.

## AUTHORITY RULE (control-plane repair, 21 Jul 2026 · `ratify:R00`)
Prototypes are **design-intent snapshots**, never automatic build authority. Statuses: `DESIGN_REVIEW` (informs screen TARGETs only) → `ACCEPTED_FOR_IMPLEMENTATION` (owner word; may guide build) → `SUPERSEDED`. Canon, permissions, entity rules and data contracts always override prototype behavior. A bundle = ALL its files (hash-pinned); a partial bundle is not the reviewed design.

## Current design bundle — LOCK Prototype **v9** (`DESIGN_REVIEW` — registered 9 Aug 2026, hash-pinned)
Owner delivered v9 as a full design package (prototype + 16 SSOT specs + 3 handoff docs). Status per the authority rule above: **DESIGN_REVIEW** — informs TARGETs and the build plan; becomes `ACCEPTED_FOR_IMPLEMENTATION` only on the owner's word, per screen or per wave. Owner frame (9 Aug): *"the BETA is canonical — a working application for all needs, not a prototype."* Canon/permissions/data contracts still override prototype behavior; conflicts are recorded, never silently resolved.

Location: `docs/reference/v9/` — 22 files, sha256 (first 16):

| File | sha256 |
|---|---|
| `LOCK_Prototype_v9_standalone.html` | 20f34e352722bce6 |
| `README-REVIEW.md` | d235fbfb1a121938 |
| `handoff/HANDOFF-1-Product-Spec.md` | ce1e86d8b50d1dae |
| `handoff/HANDOFF-2-Design-System.md` | 2a91dc1fcf432e38 |
| `handoff/HANDOFF-3-Decisions-Contracts-QA.md` | f481fb6033cc38c3 |
| `handoff/README.md` | 26c08e13234bba0e |
| `specs/LOCK-Artist-Bridge-Contract.md` | 54d6219af408bf62 |
| `specs/LOCK-DS-Registries.md` | 0deaf7cc08f6b2ee |
| `specs/LOCK-Entity-Blueprints.md` | de822e03de4d46d5 |
| `specs/LOCK-Execution-Contract.md` | 64436e92eb40b185 |
| `specs/LOCK-Flow-Register.md` | 1f250a484b517302 |
| `specs/LOCK-Freeze-Matrix.md` | 37b2130536abb6d7 |
| `specs/LOCK-Information-Architecture.md` | 5b3cb8c1e7ca44f6 |
| `specs/LOCK-Layout-Registry.md` | ebf2049073c96c97 |
| `specs/LOCK-Localization-Matrix-HE.md` | b345863348e776b2 |
| `specs/LOCK-Open-Decisions.md` | 62700410db937266 |
| `specs/LOCK-Production-Operating-Model.md` | 96e3fa5ba9a19f83 |
| `specs/LOCK-Prototype-Spec-v8.md` | 7f4823f7585c8715 |
| `specs/LOCK-QA-Checklist-Status.md` | 44efa46a3dd06874 |
| `specs/LOCK-Rep-Operating-Model.md` | 178539c55d8bf46c |
| `specs/LOCK-Screen-Registry.md` | 26a9167b39e549c9 |
| `specs/LOCK-TopBar-System.md` | 27be617d36149428 |

v9 structural anchors: 32 indexed screens with **permanent IDs** (`ART-*`/`REP-*`/`PRO-*`/`EXT-*`/`CNF-*`/`ADM-*`) · 5 entity **experience profiles** · an **Information Object Registry** (owner/lineage/states/visibility per object) · an **Entity Projection Matrix** · 5 non-negotiable IA rules · a 5-layer DS plan (DS 🔴 until layers 3-5 exist) · surface classification (USER SURFACE / SUBVIEW / STATE / OVERLAY / TECHNICAL ROUTE).

## Prior design bundle — LOCK Prototype v7 (`DESIGN_REVIEW` — NOT accepted; owner: "not yet good enough, design + per-screen spec")

| File | Role | sha256 (16) |
|---|---|---|
| `docs/reference/LOCK_Prototype_v7_standalone.html` | interaction + hierarchy intent (39 presets ≈ 21 base surfaces) | `5fcd2d72eefdcf69` |
| `docs/reference/LOCK_DESIGN_SYSTEM_THEME.v8.css` | prototype SKIN — extract semantic rules only, never port selectors (894 `!important`, 431 `nth-child`) | `46bea50efe6b8053` |
| `docs/reference/LOCK_UX_COPY_PATCH.v8.1.js` | copy/emotional-tone source — harvest strings into i18n keys, never port runtime DOM-patching | `8d060c21272a8511` |
| `docs/reference/LOCK_Prototype_v7_Audit.md` | v7 defect audit (inert buttons, permission/entity defects, a11y gaps) — the reasons v7 is NOT accepted | `d1a5812008aa0847` |

KNOWN v7 DEFECTS (never port): persona-switch disclosure failure · `repGranted` treats declined as granted · cross-artist roster contamination · event form discards inputs · confirmation rejection can look successful · **persona name "SHIDAPU"×20 / "Roy Sason"×8 — canonical is Maya Vale (rename on any promotion, per the T-89 promoted-reference name law)**.

## Prior prototypes (`00_CURRENT/` — SUPERSEDED as authority by the v7 bundle above; kept as references)

| Prototype | Surface / entity | Ver | Status | Source (repo) | Live artifact URL |
|---|---|---|---|---|---|
| **Radar** | Artist home (growth surface) | v4 | superseded (built: see Map below) | `00_CURRENT/radar-v4.html` | https://claude.ai/code/artifact/9664a4b9-c11d-4e81-ba34-96ac80d542c7 |
| **Passport** | Public buyer view (2 personas) | v3 | superseded (built: see Map below) | `00_CURRENT/passport-v3.html` | https://claude.ai/code/artifact/04bb4782-df3a-4205-bb49-99b46cca5e75 |
| **Version Roadmap** | Planning (users × releases) | v1 | ✅ current | `00_CURRENT/version-roadmap-v1.html` | https://claude.ai/code/artifact/a65d12d9-a66d-442c-9077-306eb05fddd6 |
| **Flow Map** | Whole-app architecture + gaps | v1 | ✅ current | `00_CURRENT/flow-map-v1.html` | _re-publish from source_ |
| **Release Guide** | How a version ships | v1 | ✅ current | `00_CURRENT/release-guide-v1.html` | _re-publish from source_ |

## Archived (`04_VERSIONS/`)
| Prototype | Ver | Superseded by | Note |
|---|---|---|---|
| GIGPROOF Desktop | v0-final | Radar v4 + Passport v3 | Pre-development (Jul 8), pre-LOCK rename, dark cinematic full-desktop mock. Kept for reference only. |

## External prototypes (governed elsewhere — do not duplicate)
| Prototype | Home | Owner |
|---|---|---|
| Design System v1.2.0 (→ LOCK v1.3 in progress) | Drive `BRANDING AND DESIGN SYSTEM/00_CURRENT` (+ repo `docs/design-system/`) | Codex |
| Public Website | live `lock.show` + repo `website-next/` | Codex + Claude |
| Web App | live `app.lock.show` + repo `src/` | Claude |
| Codex "Screens By Codex" set | Drive `Screens By Codex/` | Codex |

## Version-management convention
1. **Naming:** `name-vN.html` (e.g. `passport-v3.html`). Bump N on any change a viewer would notice.
2. **Current pointer:** the live version lives in `00_CURRENT/`; `VERSION.json` records the current N + its
   artifact URL per prototype. Only ONE current version per prototype.
3. **Archive, never overwrite:** before replacing, move the old file to `04_VERSIONS/` (keep its N). History
   is immutable.
4. **Changelog:** every bump gets a line in `CHANGELOG.md` (what changed + why).
5. **Publish + record:** when an HTML is published to a claude.ai artifact, record the URL here and in
   `VERSION.json`. Re-publishing the same source keeps the same URL.
6. **Definition of "current":** builds cleanly, matches the latest owner-approved direction, and obeys the
   firewall (no scores/ranks/raw counts). A prototype that fails any of these is not `00_CURRENT`.

## Map to the build
Radar v4 → `src/features/artist/ArtistDashboard.jsx` · Passport v3 → `src/features/passport/` (shipped
rel-2026.07.10) · Flow Map → `docs/UX-JOURNEY-AUDIT-2026-07-10.md` · Roadmap → `docs/releases/`.
