# UX JOURNEY + DESIGN AUDIT — 2026-07-10

Pre-release experience audit (owner-requested, before promoting rel-2026.07.10). Three lenses:
(1) register/login → first-screen correctness, (2) is each entity's home a "smart growth surface"
like the artist Radar, (3) design-token fidelity to Design System v1.2.0. Read-only; no fixes applied.

---

## LENS 1 — Journey: does each person land on the right first screen, with something to do?

**Verdict: 3 clear · 2 confusing · 1 clear-for-purpose.**

| Entity | New register → lands | First screen (empty state) | Verdict |
|---|---|---|---|
| **Artist** | /select → Artist → /onboarding → **/artist/home** (Radar) | Live Radar with ONE prioritized next-action card | ✅ Clear (best) |
| **Booker** | /select → Booker → **/discover** | Paste-a-passport-link hero, one action, sample fallback | ✅ Clear |
| **Agency** | /select → Agency → **/agency** | Roster universe + first-run checklist + "Add artist" CTA | ✅ Clear |
| **Producer** | **no signup path** (magic-link only) → /producer/received | "Nothing here yet" — inbox has **no backend**, never fills | ⚠️ Confusing |
| **Production** | **no signup path** (workspace_type set out-of-band) → /production | Team tab has a CTA; Events/Requests empty tabs are inert | ⚠️ Confusing |
| **Operator** | **no signup path** (provisioned) → /admin | Dense console, honest all-zeros day one; no CTA by design | ✅ Clear-for-purpose |

**Root cause of both "confusing":** entities that exist as routes but have neither a signup path nor a
working data feed behind their headline feature. Note these are the **non-self-serve** entities — the
release's real audiences (Artist, Agency, Booker self-serve; Producer via magic-link `/confirm/:token`,
which IS clean) all land well. No loops, no crashes; auth guards bounce wrong-role deep links to the
correct home.

**Journey gaps to fix (sequenced, not release-blocking):**
- Producer's real experience is the **magic link**, not `/producer/received` — either wire a real
  received-passports list or reframe that screen so it doesn't promise an inbox it can't fill.
- Production Events/Requests empty states need a next action (Requests has no data path yet — see flow-gap H).
- No self-serve path for Producer/Production is **by design** today; revisit if we want them to self-register.

---

## LENS 2 — Are the entity homes "smart growth surfaces" like the Radar?

**The bar (what makes the artist Radar smart):** derives a **state summary** from real data, shows
**momentum/progress**, surfaces **ONE next-best-action** with a why + deep link, and the growth loop
happens **inside the widget**. Ranked worst→best by gap:

| Rank | Entity home | Maturity | Gap to a Radar-class landing widget |
|---|---|---|---|
| 1 | **Producer** /producer/received | 🔴 Thin | Everything — no state fetched, advertises its own emptiness |
| 2 | **Booker** /discover | 🔴 Thin | No memory (viewed/saved), no next move beyond "open a link". Thin by design (discovery deferred) |
| 3 | **Production** /production | 🟡 Partial | Real tabbed data, but no orienting widget, no next-best-action, no momentum |
| 4 | **Operator** /admin | 🟡 Partial | Mature moderation console; a *monitoring* surface, not a *growth* one (fits Radar model least by nature) |
| 5 | **Agency** /agency | 🟢 Smart | The true peer to the Radar (roster universe + state rings + checklist). BUT its next-action engine (`RadarFeed`) is split into the separate `/agency/radar` tab, not on the home |

**So only Artist and Agency clear the bar.** To realize the owner's "every entity lands on a super-smart
widget it grows from" vision:
- **Agency (quick win):** surface the `RadarFeed` next-best-action ON the /agency home, not one tab away.
- **Booker:** give it memory — a "passports you've opened / shortlisted" surface + a next move.
- **Production:** add an orienting summary + next-action above the tabs.
- **Producer:** the magic-link flow is the product; the logged-in home needs a real received-passports feed or a reframe.
- **Operator:** leave as a console (growth model doesn't fit oversight) — optionally a "needs-attention" summary at top.

---

## LENS 3 — Navigation + entity transitions

**Clean.** Tab sets match every home (`getNavTabs` ↔ `homePathFor`); `switchOrg()` → `/` → `RoleHome`
re-routes to the new workspace's home; SideNav/BottomNav recompute the tab set + active highlight on
switch (no stale-highlight trap); role gates delegate to the pure `navigation.js` contract so wrong-role
deep links bounce, never loop. Minor flags: Agency's intelligence is split off the home (above);
`/producer` (ProducerHome) is an orphan route with no nav affordance; the Booker "Passports" tab implies
discovery it doesn't have (deferred by design); a DEMO-only org-mismatch edge in AgencyDashboard.

---

## LENS 4 — Design tokens: is the app faithful to Design System v1.2.0?

**🔴 No. THE APP IS DARK; the SITE (and the DS) are LIGHT paper. They are two different visual products.**

| Token | DS v1.2.0 (target) | APP renders | SITE renders |
|---|---|---|---|
| Canvas | `#f3f5ef` paper (LIGHT) | `#0B0C0B` **dark** | `#f3f5ef` ✓ |
| Ink | `#0a0d0b` near-black | `#F3F0E8` cream (**inverted**) | `#0a0d0b` ✓ |
| Accent | `#C8F04D` lime (only) | `#C8F04D` ✓ **but also** invents gold `#F2C063`, teal, amber | `#c8f04d` ✓ |
| Forest | `#18221a` | `#14181A` (wrong hex) | `#18221a` ✓ |
| Mist | `#dde3d9` solid | `rgba(255,255,255,.08)` white-alpha | `#dde3d9` ✓ |
| Display font | Georgia | **Frank Ruhl Libre** | Georgia ✓ |
| Body font | Manrope | **Heebo** | Manrope ✓ |
| Mono | DM Mono | **IBM Plex Mono** | DM Mono ✓ |

The app keeps the DS token *names* (`paper`, `forest`, `mist`) but **remaps them onto the dark palette**
(config: "LEGACY ALIASES"). ~350 hardcoded hex literals across 37 feature files bypass tokens entirely
(e.g. `text-[#12160A]`, `text-[#CBEE72]`, `bg-[rgba(190,226,78,.10)]`). **Only the lime hue is common to
DS, site, and app.** This is the concrete reason "the app and site don't look precise."

---

## THE DECISION THIS AUDIT FORCES

There are **two endorsed design languages** in play and they contradict each other:
- **Design System v1.2.0** (the "special document" / SSOT) + the **live marketing site** = **LIGHT paper**.
- **The live app** + **the Radar/Passport prototypes the owner praised** = **DARK cinematic**.

Aligning "app and site" cannot proceed until we pick the single target. This is an owner call (visual
direction). Options and trade-offs are put to the owner separately. Nothing in the *functional* release
(rel-2026.07.10) depends on it — the app works; it just doesn't yet match the site.

---

## RELEASE RECOMMENDATION
rel-2026.07.10 is **functionally releasable** (journey clean for all self-serve + magic-link audiences;
nav sound; firewall fixed). The **design-token alignment is a separate, larger initiative** (DS "Step 2")
that should be *decided* now and *scheduled* as its own batch — not stuffed into this release.
