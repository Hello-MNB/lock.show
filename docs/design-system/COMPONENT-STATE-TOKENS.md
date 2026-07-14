# COMPONENT + STATE TOKENS — the code-binding control surface (owner-requested 14 Jul)

**Purpose (owner directive):** "manage a file of component design + STATES so we can change design
pointwise AND globally." This is that file. It is the SINGLE control surface: change a value here (and the
matching `:root` token in the prototype) and every component that references it updates at once.

**Ownership split (per A13-TOKEN-VALUES.md / SYNC §6 Q10):** **Codex owns names + values + AA contrast.**
**Claude owns the code binding** — this file. When Codex ships a DS update (current authority = Drive
**v1.6.20**, not yet in-repo), we re-map values HERE in one place; components never hardcode colour.

> STATUS 14 Jul: theme-ground (dark vs paper) and the gold `state.found` ruling are DEFERRED to the owner's
> pending DS update. This file is structured so that ruling is a token flip, not a component rewrite. Values
> below reflect the current interim (dark app); the RIGHT column names what changes when the DS lands.

---

## TIER 1 — BRAND (raw palette · the only literal colours)
| Token | Interim value | DS source / note |
|---|---|---|
| `--brand-ink` | `#090D0A` | DS core · near-black |
| `--brand-forest` | `#17221A` | DS core · forest |
| `--brand-lime` | `#C8F04D` | DS core · THE single action colour |
| `--brand-paper` | `#F3F5EF` | DS core · paper (⚠ becomes everyday-UI ground IF owner picks paper-ground) |
| `--brand-mist` | `#DDE3D9` | DS core · mist |
| `--brand-slate` | `#687269` | DS core · slate |
| `--brand-teal` | `#46DCC2` | DS `state.developing` (A13) |
| `--brand-gold` | `#F2C063` | DS `state.found` (A13) — "small accents only". HELD pending owner DS ruling |
| `--brand-amber` | `#E39A4B` | DS `state.needsReview` (A13) — "invite to improve, never shame" |

## TIER 2 — SEMANTIC (roles; components read THESE, never Tier 1 directly)
| Semantic | Interim (dark) | Flips to (IF paper-ground) | Role |
|---|---|---|---|
| `--canvas` | `#0A0F0C` | `--brand-paper` | app background |
| `--surface-1` | `#0E1512` | white card | chrome / rail |
| `--surface-2` | `#161D18` | white/paper card | default container |
| `--surface-3` | `#1F2822` | paper inset | fields, nested rows |
| `--surface-4` | `#28322B` | paper hover | hover / raise |
| `--text` | `#F3F5EF` | `--brand-ink` | primary text |
| `--text-muted` | `#AEB6AE` | `--brand-slate` | secondary |
| `--text-faint` | `#7C847D` | slate-tint | tertiary/caption (NEVER critical labels — A13 failure rule) |
| `--accent` | `--brand-lime` | `--brand-lime` | primary action (unchanged either theme) |
| `--on-accent` | `#12160A` | `#12160A` | text on lime (AA 14:1) |
| `--border` / `--border-strong` | white α.10 / α.17 | ink α.10 / α.17 | container edges |

## TIER 3 — STATE VOCABULARY (the ONLY status colours — firewall: bands/binaries, never score)
| State token | Interim | DS name (A13) | Meaning · rule |
|---|---|---|---|
| `--state-ready` | `--brand-lime` | state.confirmed `#CBEE72` | Ready / confirmed |
| `--state-dev` | `--brand-teal` | state.developing | Developing but useful |
| `--state-attention` | `--brand-mist` (interim) | state.needsReview `#E39A4B` (amber) | "Needs you" — invite, never shame. ⚠ interim uses neutral mist pending gold/amber ruling |
| `--state-found` | `--brand-mist` (interim) | state.found `#F2C063` (gold) | Found, not yet confirmed. ⚠ interim neutral; restore to gold if owner keeps DS state.found |
| `--state-locked` | `--text-faint` | — | Locked (gated) |
| `--state-na` | `#9AA29B` | state.notAssessable | Not enough context — never weakness |

## PROVENANCE (method labels — replaces the technical checkmark rows, U23)
| Token | Interim | Method label it serves |
|---|---|---|
| `--prov-confirmed` (lime fill) | lime | **Producer-confirmed** |
| `--prov-evidence` (lime outline) | lime α | **Evidence-supported** |
| `--prov-source` (neutral outline) | mist/neutral | **Source-linked** |
| `--prov-declared` (faint outline) | faint | **Artist-declared / Self-declared** |
> Canon labels (A13, never expose raw DB states): Producer-confirmed · Source-linked · Evidence-supported · Self-declared.

---

## COMPONENT → STATE TOKEN MAP (change a component pointwise here)
| Component | default | hover | active/selected | confirmed | found/pending | locked | focus |
|---|---|---|---|---|---|---|---|
| **Button primary** (`.btn-primary/.src-confirm/.ob-cta`) | `--accent` bg / `--on-accent` | `--accent-deep` | pressed | — | — | `--text-faint` bg | `--focus` |
| **Field** (`.field`) | `--field-bg`/`--field-text`/`--field-border` | — | — | — | — | disabled dim | `--field-border-focus` + `--focus` |
| **Nav item** (`.navitem`) | `--text-muted` | `--surface` bg | lime left-bar + `--text` | — | — | — | `--focus` |
| **Planet node** (`.pnode`) | `--border` ring | spotlight | — | `--state-ready` | `--state-found` dot | `--state-locked` | — |
| **Method chip** (`.method`) | `--prov-source` | — | — | `--prov-confirmed` | — | — | — |
| **Passport standing** (`.standing`) | `--text-muted` | — | — | `.live` lime dot | — | `.draft` faint dot | — |
| **Src card** (`.src-card`) | `--surface-3`/`--border` | `--border-strong` | — | `--prov-confirmed-*` | `.found` neutral ring | — | — |
| **Chip** (`.chip`) | `.na` neutral | — | — | `.ready` lime | `.found` `--state-found` | — | — |

## HOW TO RESTYLE
- **Globally** (whole app tone): edit a **Tier 1/Tier 2** token → every component follows. E.g. owner picks
  paper-ground → flip the Tier-2 "flips to" column; components untouched.
- **Pointwise** (one component): edit its row in the COMPONENT→STATE map (a Tier-3/component alias), leaving
  the rest of the app unchanged.
- **A DS update from Codex:** re-map Tier-1/Tier-2/Tier-3 values to the new v1.6.20 numbers HERE; verify AA
  against A13's contrast-pair table; components inherit automatically.

## OPEN (pending owner DS update — do not flip until then)
1. Theme ground — dark (interim) vs **paper everyday UI + dark Passport/Radar** (DS-recommended).
2. `state.found`/`state.needsReview` gold+amber — restore per DS (A13) vs keep neutral (owner's earlier lean).
3. Import Codex v1.6.20 (logo asset + 34 component-state rows) when his folder reorg lands → reconcile this file to it.
