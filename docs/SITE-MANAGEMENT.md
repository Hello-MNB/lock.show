# LOCK — SITE MANAGEMENT (marketing site, professional operations)

_Owner-ordered 17 Jul 2026 ("document site management professionally, including version management"). Maintained by the build agent (Team S/G). The register (docs/TASK-REGISTER.md) holds the tasks; this file holds the site's operating truths._

## 1. Version log (the site's single source of version truth)

| Version | State | Git anchor | Notes |
|---|---|---|---|
| **v-approved-0717** | **LIVE** | `9c492fa` (site content = `6183e81` + Sign-in/rescue/rewrites/embed keepers) | The last owner-approved site. Restored 17 Jul after the cargo regression. |
| wave-6 experiment | PRESERVED, not live | `bec3adb`…`1dcd40e` | The "many rounds" redesign — branch-only, never taste-approved. NOT lost: S1 mines it for salvageable parts. |
| v-next (T-37) | IN PROGRAM | — | Built through the S0→S8 pipeline below; ships only on owner taste-approval (rule 12). |

**Owner note (17 Jul): "the current version is not the latest that existed" — correct and intentional.** Live = the last *approved* version. The newer experiment is preserved in git and feeds the rebuild program; nothing was lost.

## 2. Deployment truths (never re-learn)
- Production builds ONLY from `main`; the site project is `lock-site` (`prj_dUHnMaaTeg1ZeyyvEP93kVjOigCZ`); deploy hooks build the work branch as PREVIEWS — that is how taste-previews are made.
- The site is a Next.js **static export**; `vercel.json` rewrites work; `next.config` rewrites do NOT (export mode).
- `website-next/public/app/**` is the APP EMBED (Team E territory, legitimate merge cargo). Everything else under `website-next/**` is SITE (Team S territory, rule 12: taste-gate BEFORE production, never merge-cargo).
- **The restore trap:** `git checkout <old> -- dir` does NOT delete newer-only files → mixed-tree type errors (hit twice on 17 Jul). Exact-state restore = `git rm -rqf dir && git checkout <old> -- dir`, then re-apply keepers.
- Rollback: exact-state restore to the last version-log anchor, keep the keepers (rescue 404, rewrites, embed), push main; a failed Vercel build leaves the previous deploy live (safe).

## 3. Ship pipeline for ANY site change (rule 12)
1. Build on the work branch (Team S territory only).
2. Preview deployment (deploy hook) → owner gets the preview URL.
3. **Owner taste-approval** (L8 first, not last).
4. Team D verification (links · lexicon · mobile-first · brand criteria below).
5. Cherry-merge to `main` as a named train (`site/train-*` in the commit subject) → production → Team E live smoke → version-log entry here.

## 4. Brand & quality bar (owner criteria, 17 Jul — every site ship is checked against these)
- **Marketing, not technical:** every message human and benefit-led; no system tour; no internal vocabulary (§6 law 4).
- **One audience per container** — never mixed (artist copy ≠ booker copy ≠ manager copy).
- **Lime discipline:** the lime accent appears ONLY where action/attention is intended (CTA, key highlight) — never as wallpaper (§5 restraint law).
- **Font hierarchy:** one type system, uniform per level (display/h1/h2/body/micro) across all pages — from the Codex DS absorbed into `docs/design-system/` (A13 tokens are canon; the repo, not Drive, is the working source).
- **Uniform content width:** one full-screen container grid across the whole site — no page-to-page width drift.
- **Mobile-first:** designed at 390px first; no horizontal scroll; hero legible; images weighted for phones.
- **Images:** every major section carries a real, on-brand image (no dark empty containers).
- **Everything works:** internal links · signup/login entries into the app · legal pages — zero dead ends.

## 5. Codex DS absorption (owner: "take Codex's DS to you")
Canonical DS inputs now owned in-repo: `docs/design-system/A13-TOKEN-VALUES.md` · `COMPONENT-STATE-TOKENS.md` · DS digests · `docs/CODEX-DESIGN-BRIEF.md` · `docs/CODEX-TOKEN-COMPLETION-MAP.md` · §5.11 of the spec (self-contained defaults). Team S builds ONLY from these + the spec — no Drive dependency. Gaps still OWED by Codex: logo/venue SVGs (M-7).

## 6. Housekeeping register
- `website/` (legacy static HTML site) — superseded by `website-next/`; S0-infra audits references, then archive-move (owner-visible, no silent deletion).
- Root `dist/` = build output (gitignored, ephemeral).
- Vercel hygiene: 13 keys in encrypted store (17 Jul) · lock-site + lock-app projects · S0-infra audits settings (prod branch, smart-skip, domains) and reports gaps.
