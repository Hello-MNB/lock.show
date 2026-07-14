// Bookers / Buyers page content — EN from the Codex rebuild brief §5.6
// (2026-07-14), HE verbatim from the Codex HE copy pack
// (06_BOOKERS_BUYERS_HE_COPY_20260714). Missing HE strings carry the
// TODO_HE marker — do not improvise Hebrew.
//
// Canon: buyer = מזמין הופעות (never אמרגן) · private clients are valid
// buyers (weddings, company nights) · no score/rank/percentile · draw as
// bands + method labels only · free pilot, no prices · no ticket-sales
// overemphasis (brief §5.6 Remove).

import {
  TODO_HE,
  type CardContent,
  type Cta,
  type FinalCtaContent,
  type HeroContent,
  type SectionHeadingContent,
} from './types'

export interface BookersContent {
  meta: { title: string; description: string }
  hero: HeroContent & {
    /** Product chips overlaid on the hero image card (brief §7 Bookers icon row: Fit · Style · Trust · Availability). */
    chips: string[]
    /** Floating Passport preview card on the hero image (brief §5.6 hero right). */
    passportCard: {
      label: string
      name: string
      tag: string
      methodChip: string
      viewCta: Cta
    }
  }
  /**
   * Hero-level audience band — entity-model audit 2026-07-14 "Bookers /
   * Buyers page, add above fold or first section", EN+HE verbatim: private
   * clients (wedding couples, company events) are visible at the top of the
   * page, not only in the dedicated private-clients section below.
   * Bilingual by design — both languages render directly under the hero.
   */
  audience: { en: string; he: string }
  /** Section 1 — three buyer fears (brief §5.6). */
  fears: SectionHeadingContent & { cards: CardContent[] }
  /** Section 2 — what the Passport answers (method-labelled rows). */
  answers: SectionHeadingContent & {
    items: { label: string; title: string; body: string }[]
  }
  /**
   * Section 3 — private-client explanation (brief §5.6: MUST include the
   * wedding/company-night copy EN+HE; warm register, no venue jargon).
   * `lead` is bilingual by design — both languages render on the page.
   */
  privateClients: {
    eyebrow: string
    title: string
    lead: { en: string; he: string }
    body: string
    /** Warm private-client quote from the HE pack ("Private-client tone"). */
    warmQuote: { en: string; he: string }
  }
  /** Section 4 — no-account CTA (brief §5.6). */
  finalCta: FinalCtaContent & { chips: string[] }
}

const en: BookersContent = {
  meta: {
    title: 'Understand the artist before you say yes | LOCK for bookers & buyers',
    description:
      'One Passport link shows who the artist is, what they bring and what stands behind it — for clubs, events, weddings and company nights. No account, no signup, no scores.',
  },
  hero: {
    eyebrow: 'For bookers & private clients',
    h1: 'Feel the artist before you say yes.',
    body: 'One Passport link helps you feel who the artist is, what kind of night they create, and what stands behind it — whether you are booking a club, festival, wedding or company event.',
    primaryCta: { label: 'View sample Passport', href: '/passport/demo' },
    secondaryCta: { label: 'How buyers use LOCK', href: '/how-it-works' },
    trustLine: 'No account. No signup. Free for booking people — always.',
    imageAlt:
      'Venue load-in before the doors open — the moment a booking decision becomes real',
    chips: ['Fit', 'Style', 'Trust', 'Availability'],
    passportCard: {
      label: 'Passport · Public',
      name: 'Shidapu',
      tag: 'Psytrance · Tel Aviv',
      methodChip: 'SOURCE-LINKED',
      viewCta: { label: 'Open sample', href: '/passport/demo' },
    },
  },
  // Entity-model audit 2026-07-14 — EN+HE verbatim, rendered under the hero.
  audience: {
    en: 'You do not have to be “in the industry” to use a Passport. If you are planning a wedding, company event, club night or festival slot, LOCK helps you understand artist fit before the first call.',
    he: 'לא צריך להיות איש תעשייה כדי להשתמש בפספורט. אם אתם מתכננים חתונה, אירוע חברה, ערב מועדון או שיבוץ לפסטיבל — LOCK עוזרת להבין התאמה לפני השיחה הראשונה.',
  },
  fears: {
    eyebrow: 'Three buyer fears',
    title: 'The moment you are protecting.',
    cards: [
      {
        title: 'The room that never lifts.',
        body: 'When the room never lifts, people remember who chose the name. A Passport helps you choose with more context.',
      },
      {
        title: 'The hype folder.',
        body: 'EPKs, follower counts, “sold out” stories — plenty of noise, and none of it answers what actually happens in the room.',
      },
      {
        title: 'No time to become a detective.',
        body: 'New names land every week. You can’t give each one an evening of digging — and you shouldn’t have to.',
      },
    ],
  },
  answers: {
    eyebrow: 'What the Passport answers',
    title: 'One link. A clearer feeling for fit.',
    items: [
      {
        label: 'Draw as a band, not a boast',
        title: 'A safer read, not an inflated boast.',
        body: 'Audience draw appears as a band — never an exact figure someone typed into a bio. A quieter claim, and that’s exactly why you can lean on it.',
      },
      {
        label: 'How it was checked',
        title: 'You know what you are looking at.',
        body: 'Source-linked, evidence-supported, or the artist’s own word — clearly marked as such. Every detail carries its method label, and you weigh it yourself.',
      },
      {
        label: 'Fresh and local',
        title: 'A packed room in 2023 isn’t a packed room now.',
        body: 'Every claim carries when it happened and where. You’re reading the artist who exists today, in the market you actually book.',
      },
      {
        label: 'No account, ever',
        title: 'One link, two minutes, zero friction.',
        body: 'The artist sends a link. You open it in any browser — no app, no signup, nothing to install. Free for booking people, always.',
      },
    ],
  },
  privateClients: {
    eyebrow: 'Private and company events too',
    title: 'You don’t need industry vocabulary.',
    // Brief §5.6 — verbatim EN+HE, both rendered on the page.
    lead: {
      en: 'Planning a wedding, company night or private event? You do not need industry vocabulary to understand if an artist fits the room.',
      he: 'מתכננים חתונה, ערב חברה או אירוע פרטי? לא צריך להיות איש תעשייה כדי להבין אם אמן מתאים לחדר.',
    },
    body: 'A Passport reads in plain language — who the artist is, what kind of night they create, and what stands behind it. A short, clear picture before you start the conversation.',
    warmQuote: {
      en: 'You don’t have to be in the industry to know if an artist fits your event. A Passport gives you a short, clear picture before the first conversation.',
      he: 'לא צריך להיות איש תעשייה כדי להבין אם אמן מתאים לאירוע שלך. פספורט נותן לך תמונה קצרה וברורה לפני שמתחילים שיחה.',
    },
  },
  finalCta: {
    title: 'Before you say yes, give yourself two calmer minutes.',
    body: 'Open a Passport in any browser — no account, no signup, no catch. The decision stays yours.',
    primaryCta: { label: 'View sample Passport', href: '/passport/demo' },
    secondaryLink: { label: 'Ask about an artist', href: '/contact' },
    chips: ['NO ACCOUNT', 'NO SIGNUP', 'NO SCORES', 'YOUR DECISION, ALWAYS'],
  },
}

const he: BookersContent = {
  meta: {
    title: 'למזמיני הופעות ואירועים — לבחור אמן עם יותר הקשר ופחות ניחושים | LOCK',
    description:
      'פספורט של LOCK עוזר למזמין הופעות או אירוע להבין מי האמן, איזה סגנון הוא מביא, מה עומד מאחוריו ומה מתאים לבדוק — בלי הרשמה ובלי שפה מקצועית מסובכת.',
  },
  hero: {
    eyebrow: 'למזמיני הופעות ואירועים',
    h1: 'לפני שמזמינים אמן, כדאי להבין את ההקשר.',
    body: 'פספורט של LOCK עוזר למזמין הופעות או אירוע להבין מי האמן, איזה סגנון הוא מביא, מה עומד מאחוריו ומה מתאים לבדוק — בלי הרשמה ובלי שפה מקצועית מסובכת.',
    primaryCta: { label: 'לראות פספורט לדוגמה', href: '/passport/demo' },
    secondaryCta: { label: 'איך מזמינים משתמשים ב-LOCK', href: '/how-it-works' },
    trustLine: TODO_HE,
    imageAlt: TODO_HE,
    chips: [TODO_HE, TODO_HE, TODO_HE, TODO_HE],
    passportCard: {
      label: 'פספורט · ציבורי',
      name: 'Shidapu',
      tag: 'Psytrance · Tel Aviv',
      methodChip: 'SOURCE-LINKED',
      viewCta: { label: 'לראות פספורט לדוגמה', href: '/passport/demo' },
    },
  },
  // Entity-model audit 2026-07-14 — EN+HE verbatim, rendered under the hero.
  audience: {
    en: 'You do not have to be “in the industry” to use a Passport. If you are planning a wedding, company event, club night or festival slot, LOCK helps you understand artist fit before the first call.',
    he: 'לא צריך להיות איש תעשייה כדי להשתמש בפספורט. אם אתם מתכננים חתונה, אירוע חברה, ערב מועדון או שיבוץ לפסטיבל — LOCK עוזרת להבין התאמה לפני השיחה הראשונה.',
  },
  fears: {
    eyebrow: TODO_HE,
    title: TODO_HE,
    cards: [
      {
        title: 'החשש מאירוע שלא עובד',
        body: 'כשחדר לא עובד, מי שנשאר עם ההחלטה הוא מי שבחר את השם.',
      },
      {
        title: 'תיקיית ההייפ',
        body: 'EPK, עוקבים, סיפורים על “סולד אאוט” — הרבה רעש, לא תמיד מספיק הקשר.',
      },
      {
        title: 'אין זמן להיות בלש',
        body: 'שמות חדשים מגיעים כל שבוע, ולא תמיד אפשר לחקור כל אחד לעומק.',
      },
    ],
  },
  answers: {
    eyebrow: TODO_HE,
    title: TODO_HE,
    items: [
      {
        label: 'הקשר בזהירות, לא מספר מנופח',
        title: 'מידע שמוצג בטווחים ובתוויות, רק כשהמקור מאפשר את זה.',
        body: TODO_HE,
      },
      {
        label: 'איך זה נבדק',
        title: 'תמיד רואים מאיפה המידע הגיע ומה רמת ההקשר שלו.',
        body: TODO_HE,
      },
      {
        label: 'עדכני ורלוונטי למקום',
        title: 'חדר מלא ב-2023 הוא לא בהכרח אותו דבר היום.',
        body: TODO_HE,
      },
      {
        label: 'בלי חשבון',
        title: 'לינק אחד, כמה דקות, בלי הרשמה ובלי התקנה.',
        body: TODO_HE,
      },
    ],
  },
  privateClients: {
    eyebrow: 'גם אירועים פרטיים וחברות',
    title: TODO_HE,
    lead: {
      en: 'Planning a wedding, company night or private event? You do not need industry vocabulary to understand if an artist fits the room.',
      he: 'מתכננים חתונה, ערב חברה או אירוע פרטי? לא צריך להיות איש תעשייה כדי להבין אם אמן מתאים לחדר.',
    },
    body: TODO_HE,
    warmQuote: {
      en: 'You don’t have to be in the industry to know if an artist fits your event. A Passport gives you a short, clear picture before the first conversation.',
      he: 'לא צריך להיות איש תעשייה כדי להבין אם אמן מתאים לאירוע שלך. פספורט נותן לך תמונה קצרה וברורה לפני שמתחילים שיחה.',
    },
  },
  finalCta: {
    title: TODO_HE,
    body: TODO_HE,
    primaryCta: { label: 'לראות פספורט לדוגמה', href: '/passport/demo' },
    secondaryLink: { label: 'לברר על אמן', href: '/contact' },
    chips: [TODO_HE, TODO_HE, TODO_HE, TODO_HE],
  },
}

export const bookersContent: Record<'en' | 'he', BookersContent> = { en, he }
