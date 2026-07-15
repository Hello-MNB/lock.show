// Site chrome strings — header nav + footer (Codex rebuild brief §4, 2026-07-14).
// { en, he } per the wave-1/2 content-module pattern (content/types.ts): NO
// hardcoded copy in chrome components; every nav/footer label lives here.
//
// HE sources, in priority order:
//   1. Brief §4 verbatim — header CTA "להצטרף לפיילוט", footer micro-copy.
//   2. Governed terms already in the repo — messages/he.json (אמנים, מזמיני
//      הופעות, איך זה עובד, מתודולוגיה, כניסה, תפריט, legal labels),
//      content/production.ts ("למשרדי הפקה" → משרדי הפקה),
//      content/artists.ts ("רדאר"), he.json ctaDemo ("פספורט לדוגמה").
//      Managers nav HE = משרדי אמרגנות per the Codex entity-model ruling
//      (CODEX_ENTITY_MODEL_AND_SITE_MESSAGING_AUDIT_20260714, recommended
//      Hebrew nav) — replaces the earlier מנהלי אמנים derivation.
//   3. TODO_HE — never an improvised translation.
//
// The producers page (/producers, source-confirmation education) is NOT in
// the brief §4 nav or footer columns, so it carries no chrome link; it stays
// reachable from page content (home "Choose your lane" + pricing lanes, both
// already labeled "Source confirmation" / למאשרי-מקור). If a chrome link is
// ever restored, its label is "Source confirmation" (EN) — derived from the
// governed מאשר-מקור term in content/producers.ts.
//
// Pricing: no paid-plan destination anywhere in chrome (/pricing redirects,
// vercel.json). Canon: פספורט · FREE PILOT (no payment wording) · no
// score/rank language · buyer = מזמין הופעות (never אמרגן).
//
// Column headings + tagline render as EN mono brand labels in BOTH locales —
// existing chrome behavior (like CONNECT / LEGAL today), not missing HE.

import type { Locale } from '@/content/types'

export interface ChromeLink {
  href: string
  label: string
}

export interface FooterColumn {
  heading: string
  links: ChromeLink[]
}

export interface ChromeContent {
  nav: {
    /** Header links, exact order per brief §4. */
    links: ChromeLink[]
    /** Header CTA label — href stays `${APP_URL}/signup` (component mechanics). */
    cta: string
    login: string
    openMenu: string
    closeMenu: string
  }
  footer: {
    /** Mono brand line under the wordmark. */
    tagline: string
    /** Footer CTA label — href stays `${APP_URL}/signup`. */
    cta: string
    /** Exactly 4 link columns: Product · Trust · Company · Legal (brief §4). */
    columns: FooterColumn[]
    /** Cookie-preferences button label (rendered in the Legal column). */
    consentPrefs: string
    /** CONNECT block heading (social links come from lib/social.ts — single source). */
    connectHeading: string
    /** Footer micro-copy — brief §4 EXACT wording, both locales. */
    microCopy: string
    copyright: string
  }
}

const en: ChromeContent = {
  nav: {
    links: [
      { href: '/artists',       label: 'Artists' },
      { href: '/managers',      label: 'Reps' },
      { href: '/production',    label: 'Production' },
      { href: '/bookers',       label: 'Buyers' },
      { href: '/how-it-works',  label: 'How it works' },
    ],
    cta: 'Join pilot',
    login: 'Log in',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
  footer: {
    tagline: 'ARTIST CONTEXT · BOOKING CLARITY · TEL AVIV',
    cta: 'JOIN PILOT →',
    columns: [
      {
        heading: 'PRODUCT',
        links: [
          { href: '/artists',       label: 'Artists' },
          { href: '/managers',      label: 'Representation' },
          { href: '/production',    label: 'Production teams' },
          { href: '/bookers',       label: 'Bookers & clients' },
          { href: '/passport/demo', label: 'Passport demo' },
          { href: '/radar',         label: 'Radar' },
        ],
      },
      {
        heading: 'TRUST',
        links: [
          { href: '/how-it-works', label: 'How it works' },
          { href: '/methodology',  label: 'Methodology' },
          { href: '/faq',          label: 'FAQ' },
        ],
      },
      {
        heading: 'COMPANY',
        links: [
          { href: '/contact',       label: 'Contact' },
          { href: '/accessibility', label: 'Accessibility' },
        ],
      },
      {
        heading: 'LEGAL',
        links: [
          { href: '/terms',   label: 'Terms' },
          { href: '/privacy', label: 'Privacy' },
        ],
      },
    ],
    consentPrefs: 'Cookie preferences',
    connectHeading: 'CONNECT',
    microCopy:
      'LOCK helps artists and booking people turn scattered context into a clearer first conversation.',
    copyright: '© 2026 LOCK · CLOSED BETA · TEL AVIV, ISRAEL',
  },
}

const he: ChromeContent = {
  nav: {
    links: [
      { href: '/artists',       label: 'אמנים' },
      { href: '/managers',      label: 'נציגות' },
      { href: '/production',    label: 'הפקה' },
      { href: '/bookers',       label: 'מזמינים' },
      { href: '/how-it-works',  label: 'איך זה עובד' },
    ],
    cta: 'להצטרף לפיילוט',
    login: 'כניסה',
    openMenu: 'פתח תפריט',
    closeMenu: 'סגור תפריט',
  },
  footer: {
    // EN mono brand label in both locales (existing chrome behavior).
    tagline: 'ARTIST CONTEXT · BOOKING CLARITY · TEL AVIV',
    cta: 'להצטרף לפיילוט',
    columns: [
      {
        heading: 'PRODUCT',
        links: [
          { href: '/artists',       label: 'אמנים' },
          { href: '/managers',      label: 'משרדי אמרגנות' },
          { href: '/production',    label: 'משרדי הפקה' },
          { href: '/bookers',       label: 'מזמיני הופעות' },
          { href: '/passport/demo', label: 'פספורט לדוגמה' },
          { href: '/radar',         label: 'רדאר' },
        ],
      },
      {
        heading: 'TRUST',
        links: [
          { href: '/how-it-works', label: 'איך זה עובד' },
          { href: '/methodology',  label: 'מתודולוגיה' },
          // "FAQ" is used as-is in the governed HE copy (no HE term in the pack).
          { href: '/faq',          label: 'FAQ' },
        ],
      },
      {
        heading: 'COMPANY',
        links: [
          { href: '/contact',       label: 'צור קשר' },
          { href: '/accessibility', label: 'נגישות' },
        ],
      },
      {
        heading: 'LEGAL',
        links: [
          { href: '/terms',   label: 'תנאי שימוש' },
          { href: '/privacy', label: 'פרטיות' },
        ],
      },
    ],
    consentPrefs: 'שינוי העדפות Cookie',
    connectHeading: 'CONNECT',
    microCopy:
      'LOCK עוזרת לאמנים ולמזמינים להפוך הקשר מפוזר לשיחה ראשונה ברורה יותר.',
    copyright: '© 2026 LOCK · בטא סגורה · תל אביב, ישראל',
  },
}

export const chromeContent: Record<Locale, ChromeContent> = { en, he }
