# Consent Banner + GA4 Consent Mode v2 — Spec for Claude Code
**v0.1 · 8.7.2026 · LOCK (#25)**

## Why
Amendment 13 (IL) + any EU visitor require consent before non-essential analytics. GA4 must not fire until the user consents. GA measurement ID: `G-ZX907M2NY8`.

## Behavior
1. On first visit, before any GA4 call, set Consent Mode v2 defaults to **denied**:
   ```js
   gtag('consent', 'default', {
     ad_storage: 'denied', analytics_storage: 'denied',
     ad_user_data: 'denied', ad_personalization: 'denied',
     wait_for_update: 500
   });
   ```
2. Show a bottom banner (HE, RTL): קבל / דחה / העדפות. Essential cookies only run regardless.
3. On **Accept** → `gtag('consent','update',{ analytics_storage:'granted' })` then load GA4. On **Reject** → keep denied, do not load GA4.
4. Persist choice (localStorage `gigproof_consent`), re-ask only after 6–12 months or on policy change.
5. Link to Privacy Policy (#24). Provide a "שנה העדפות" control in footer.

## Acceptance criteria
- No GA network call fires before consent (verify in Network tab).
- Reject path sends zero analytics.
- Works RTL/Hebrew; keyboard-accessible; meets WCAG AA (ties to #27).

## Notes
- Keep the banner text plain (canon: no hype). Do NOT bundle marketing/ad pixels unless/until paid ads exist.
- Load order: consent defaults → banner → (on grant) gtag config `G-ZX907M2NY8`.
