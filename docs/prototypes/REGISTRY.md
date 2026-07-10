# LOCK — Prototype Registry & Version Management

Single source of truth for **which prototype is current**, its version, and where it lives. A missing or
stale prototype makes design partners (Codex) and engineers guess — so every prototype is versioned,
pointed-to, and archived here, mirroring the governance of the `BRANDING AND DESIGN SYSTEM` Drive folder.

> **Rule for handing work to Codex / anyone:** always link the **`00_CURRENT`** prototype (or its live
> artifact URL) + the current DS — never a scratch file or a superseded version. If a current prototype is
> missing for a surface, that gap is a task, not a green light to improvise.

## Current prototypes (`00_CURRENT/`)

| Prototype | Surface / entity | Ver | Status | Source (repo) | Live artifact URL |
|---|---|---|---|---|---|
| **Radar** | Artist home (growth surface) | v4 | ✅ current | `00_CURRENT/radar-v4.html` | https://claude.ai/code/artifact/9664a4b9-c11d-4e81-ba34-96ac80d542c7 |
| **Passport** | Public buyer view (2 personas) | v3 | ✅ current | `00_CURRENT/passport-v3.html` | https://claude.ai/code/artifact/04bb4782-df3a-4205-bb49-99b46cca5e75 |
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
