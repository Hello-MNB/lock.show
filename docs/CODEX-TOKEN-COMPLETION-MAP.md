# LOCK — Token Completion Map for Codex

_Companion to `CODEX-DESIGN-BRIEF.md`. This is the precise "which tokens are missing" answer, from reading
the real token files: site `website-next/app/globals.css` (+ `styles/design-system.css`) and app
`src/tokens.ts` + `tailwind.config.js`. Split: §A shared (add to the DS), §B site, §C app._

## The core finding
The DS v1.2.0 nails the **foundation** (core colors with WCAG ratios, Georgia/Manrope/DM Mono, radius +
spacing intent, 34 component states). But **both surfaces independently invented whole token GROUPS the DS
never defined** — so they drifted apart. The fix is to **promote those groups into the DS as first-class
tokens (with light + dark + RTL variants) and emit a tokens-to-code map**, so site and app implement one
system. Hardcoding is NOT the main problem (app ≈59 hex/15 files, most are brand-logo colors; site ≈39).

**The two surfaces today:**
- **Site** = DS-aligned **LIGHT** CSS `@theme` vars (`--color-paper/ink/forest/mist/slate/stamp`), even has
  AA on-light variants (`--color-tally-onlight`, `--color-stamp-onlight`). Good, but token set is shallow.
- **App** = **DARK**, different names (`bg/surface/ink`), lime matches, but adds `gold/teal/amber` + a rich
  **5-state evidence vocabulary** (found/good/dev/need/na, fg+bg) the DS has no tokens for; remaps DS light
  names onto dark ("LEGACY ALIASES"). Fonts differ (Frank Ruhl Libre/Heebo/IBM Plex).

---

## §A — Token GROUPS missing from the DS (add these; both surfaces need them)

1. **Hebrew / RTL type layer** — DS is English-only (Georgia/Manrope/DM Mono). Both surfaces already run
   Hebrew (Heebo). Define paired tokens: `--font-display-en` / `--font-display-he`, `--font-body-en/he`,
   `--font-mono`, + RTL mirroring + 30% expansion rule. Pick canonical HE faces (bless Heebo + a real HE
   serif, or propose better bilingual pairings). **Highest priority — it's the DS's one true gap.**

2. **Per-surface contextual variants (the light-ground / dark-media contract, as tokens).** A token's value
   must change by surface. Define, for each of the four surfaces (Paper canvas · White card · Forest panel ·
   Media overlay): `--text`, `--text-muted`, `--line`, `--accent-text` — with **AA-proven pairs**. The site
   already needed this (invented `-onlight` variants); the DS must systematize it so the app can re-ground.

3. **The 5-state EVIDENCE vocabulary as tokens (firewall-central, currently DS-less).** found ✦ · confirmed
   ✓ · developing ◌ · needs-you + · not-assessable ○ — each a `{fg, bg-tint, icon}` triple, in **light AND
   dark**. These bounded states ARE LOCK's anti-score UI; the app invented them, the DS must own them.

4. **Method-label tokens.** Producer-confirmed (lime) · Source-linked · Evidence-supported · Self-declared —
   define the color/weight/treatment per label (app currently uses "gold" ad-hoc). Light + dark.

5. **Radius scale (named).** DS prose says controls 9–10 / cards 12–18 / hero 20 / sheet 22; site has only
   `--radius:10px`; app has button 12 / card 20 (drifted). Emit `--radius-control|input|card|hero|sheet|pill`.

6. **Spacing scale (named).** DS describes a 4px base but neither surface has spacing tokens (app has ad-hoc
   `cardPad/pagePad/chipPad`). Emit `--space-1…N` + section/component spacing tokens, responsive.

7. **Elevation / shadow tokens.** App has `card/glow/glow-gold`; site has none; DS defines none. Emit
   `--shadow-card`, `--shadow-glow` (lime CTA), `--shadow-found` — light + dark.

8. **Motion tokens (audit-flagged P1).** Define `--motion-fast/base`, `--easing`, + **reduced-motion**
   equivalents, and name the state-motion primitives (found-glow, confirm-bloom, gold-aura, shimmer, fade-in).

9. **Semantic status set (distinct from the accent).** Site has only `--color-void` (error); app has amber +
   void. Define `--success/--warning/--danger/--info` on light + dark, **each with AA proof** (note: DS amber
   fails white-on-amber → amber is background-only, never text).

10. **Focus-ring + selection tokens.** Site defines a lime focus ring + selection; promote to
    `--focus-ring`, `--selection-bg` in the DS (a11y P0).

11. **Logical border/hairline token.** One token, two values: `--line` = mist `#dde3d9` on light,
    `rgba(255,255,255,.08)` on dark. (App and site currently hardcode each side.)

12. **Brand-logo reference palette (documented, not themeable).** Catalogue the platform brand hexes
    (Spotify `#1DB954`, Facebook `#1877F2`, Instagram `#E1306C`, YouTube `#FF0000`, SoundCloud `#FF5500`,
    Apple Music `#FA243C`, Google set…) so those *legitimate* non-token hexes are governed, not "drift".

13. **The tokens-to-code map (deliverable).** Every named token → CSS var + Tailwind key, 1:1. This is what
    lets the app and site implement the DS identically and lets us delete invented values.

---

## §B — SITE (lock.show) — what to complete
Already on the DS light system. Add the shallow-set gaps: **radius scale** (has only `--radius`),
**spacing scale**, **shadow/elevation**, **motion tokens**, the **5-state evidence + method-label tokens**
(passport/evidence surfaces need them), and the **full semantic status set** (has only `void`). Reconcile
fonts: site uses **Space Mono** (not DM Mono) and **Heebo** for body — ratify or switch to the DS canonical
EN+HE stacks. Systematize the ad-hoc `-onlight` AA variants into the §A2 per-surface model.

## §C — APP (app.lock.show) — what to complete
Needs the **entire light-surface token set** (Paper canvas / White card / Forest panel / Media overlay) it
doesn't have today — it's dark-only and remaps DS light names onto dark. Then: adopt the §A2 per-surface
contextual variants + `-onlight` AA variants; **align radius** (button 12→control 9–10, card 20→12–18);
**promote its invented-but-needed tokens INTO the DS** (the 5-state vocabulary, method-labels, gold-aura,
shadows) so they become governed with light variants rather than app-local; align fonts to the §A1 EN+HE
decision; replace the ~15–20 real hardcoded token values (`#12160A`, `#CBEE72`, `#0A0D0B`, `#9AA29B`,
`#F0B478`) with tokens (keep the brand-logo hexes per §A12).

---

## Priority order for Codex
1. **§A1 Hebrew/RTL type layer** — the real gap, blocks Hebrew launch.
2. **§A2 per-surface contextual variants** + **§A13 tokens-to-code map** — the mechanism that unifies app & site.
3. **§A3 5-state + §A4 method-label tokens (light+dark)** — LOCK's firewall UI, must be governed.
4. **§A5–A11** radius/spacing/shadow/motion/status/focus/border scales — the missing depth.
5. **§B / §C** surface reconciliation once the tokens exist.
