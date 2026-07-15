// Producers / Source-Confirmer page content — EN from the Codex rebuild
// brief §5.4 (2026-07-14), HE verbatim from the Codex HE copy pack
// (04_PRODUCERS_SOURCE_CONFIRMER_HE_COPY_20260714).
// This page is NOT a production workspace — it is one-tap source
// confirmation by a מאשר-מקור: one link, one claim, no account.
// Missing HE strings carry the TODO_HE marker — do not improvise Hebrew.

import {
  TODO_HE,
  type CardContent,
  type FinalCtaContent,
  type HeroContent,
  type SectionHeadingContent,
} from './types'

export interface ProducersContent {
  meta: { title: string; description: string }
  hero: HeroContent
  /** Phone / WhatsApp confirmation-card mockup (CSS only, no real number). */
  phone: {
    appLabel: string
    sender: string
    message: string
    claim: {
      title: string
      rows: { label: string; value: string }[]
      question: string
    }
    actions: { confirm: string; correct: string; skip: string }
    footnote: string
  }
  /** §5.4 section 1 — what you see. */
  see: SectionHeadingContent & { cards: CardContent[] }
  /** §5.4 section 2 — what you can answer: confirm / correct / skip. */
  answer: SectionHeadingContent & {
    options: { icon: 'confirm' | 'review' | 'arrow'; label: string; body: string }[]
  }
  /** §5.4 section 3 — what does NOT happen. */
  not: SectionHeadingContent & {
    cards: CardContent[]
    closing: string
  }
  /** §5.4 section 4 — artist still controls publication. */
  control: SectionHeadingContent & { cards: CardContent[] }
  finalCta: FinalCtaContent
}

const EXAMPLE_ANCHOR = '#confirmation-example'

const en: ProducersContent = {
  meta: {
    title: 'For Source Confirmers — One Link. One Claim. No Account. | LOCK',
    description:
      'A source confirmer doesn’t open an account or manage anything. You see one claim from a night you actually ran, confirm or correct it, and get back to your day.',
  },
  hero: {
    eyebrow: 'Source confirmation',
    // Entity-model audit 2026-07-14: while the route stays /producers, the
    // visible H1 must carry the Source-confirmation label — verbatim.
    h1: 'Source confirmation — one link, one detail, no account.',
    body: 'A source confirmer doesn’t open an account or manage anything. You see one claim, confirm or correct it, and get back to your day.',
    primaryCta: { label: 'See confirmation example', href: EXAMPLE_ANCHOR },
    secondaryCta: { label: 'Learn how confirmation works', href: '/how-it-works' },
    trustLine: 'You were there. Say so.',
    // Alt kept free of production-office wording (audit: no production-company
    // reading anywhere on this page) — the image is scenery, nothing more.
    imageAlt: 'Darkened warehouse space — quiet backdrop for a single confirmation task',
  },
  phone: {
    appLabel: 'WhatsApp · link preview',
    sender: 'Maya Oren',
    message: 'Hey! Could you confirm one detail from the night at the warehouse? Takes 20 seconds, no account:',
    claim: {
      title: 'Confirm one claim',
      rows: [
        { label: 'Show', value: 'Fri 14 Mar 2026 · Tel Aviv' },
        { label: 'Venue', value: 'Warehouse club night' },
        { label: 'Room', value: 'Roughly full' },
      ],
      question: 'Does this match what you remember?',
    },
    actions: { confirm: 'Confirm', correct: 'Correct', skip: 'Skip' },
    footnote: 'Opens in your browser — no account, no download, no password.',
  },
  see: {
    eyebrow: 'What you see',
    title: 'One show, the way you remember it.',
    body: 'The date, the venue, roughly how full the room was.',
    cards: [
      {
        title: 'A link lands in your WhatsApp.',
        body: 'From an artist you actually booked, about a night you actually ran.',
      },
      {
        title: 'It opens in your browser.',
        body: 'No account, no download, no password.',
      },
      {
        title: 'One bounded claim.',
        body: 'A single detail from a single night — never a form, never a questionnaire.',
      },
    ],
  },
  answer: {
    eyebrow: 'What you can answer',
    title: 'Say what you saw.',
    body: 'Disagreeing is part of the deal — a correction or a skip is a good answer too.',
    options: [
      { icon: 'confirm', label: 'Confirm', body: 'Looks right? Confirm.' },
      { icon: 'review', label: 'Correct', body: 'Numbers feel off? Correct them.' },
      { icon: 'arrow', label: 'Skip', body: 'Honestly can’t tell? Skip it.' },
    ],
  },
  not: {
    eyebrow: 'What does not happen',
    title: 'And that really is it.',
    body: 'No follow-ups, no ongoing role, no inbox to manage.',
    cards: [
      {
        title: 'No account.',
        body: 'You never sign up, set a password or install anything.',
      },
      {
        title: 'No dashboard.',
        body: 'Nothing to check, nothing to maintain, nothing waiting for you.',
      },
      {
        title: 'No ongoing role.',
        body: 'One answer and you’re done — LOCK doesn’t come back with homework.',
      },
    ],
    // Entity-model audit 2026-07-14 — EN verbatim.
    closing: 'This is not a production workspace. It is one bounded source-confirmation flow.',
  },
  control: {
    eyebrow: 'The artist stays in control',
    title: 'Nothing goes public without the artist.',
    cards: [
      {
        title: 'You turn a story into a fact.',
        body: 'One confirmed detail gives a real night a source someone else can trust.',
      },
      {
        title: 'Your name, quoted exactly as given.',
        body: 'If your name appears, it appears the way you approved it — nothing more.',
      },
      {
        title: 'Disagreeing is part of the deal.',
        body: 'A correction or a non-confirmation is just as useful. The artist decides what happens next.',
      },
    ],
  },
  finalCta: {
    title: '20 seconds, no account.',
    body: 'You see one claim, answer once, and get back to your day.',
    primaryCta: { label: 'See confirmation example', href: EXAMPLE_ANCHOR },
    secondaryLink: { label: 'Learn how confirmation works', href: '/how-it-works' },
  },
}

const he: ProducersContent = {
  meta: {
    title: 'למאשרי-מקור — עשרים שניות, בלי חשבון | LOCK',
    description:
      'מאשר-מקור לא נדרש לפתוח חשבון או לנהל שום דבר. רק לראות נקודת מידע אחת, לאשר או לתקן אותה, ולחזור ליום שלו.',
  },
  hero: {
    eyebrow: 'למאשרי-מקור',
    h1: 'קיבלת קישור מאמן? אפשר לעזור לו במענה אחד.',
    body: 'מאשר-מקור לא נדרש לפתוח חשבון או לנהל שום דבר. רק לראות נקודת מידע אחת, לאשר או לתקן אותה, ולחזור ליום שלו.',
    primaryCta: { label: 'לראות אישור לדוגמה', href: EXAMPLE_ANCHOR },
    secondaryCta: { label: 'להבין איך האישור עובד', href: '/how-it-works' },
    trustLine: 'היית שם? אפשר לאשר נקודת מידע אחת.',
    imageAlt: TODO_HE,
  },
  phone: {
    appLabel: TODO_HE,
    sender: TODO_HE,
    message: TODO_HE,
    claim: {
      title: TODO_HE,
      rows: [
        { label: TODO_HE, value: TODO_HE },
        { label: TODO_HE, value: TODO_HE },
        { label: TODO_HE, value: TODO_HE },
      ],
      question: TODO_HE,
    },
    actions: { confirm: 'מאשרים', correct: 'מתקנים', skip: 'מדלגים' },
    footnote: 'זה נפתח בדפדפן — בלי חשבון, בלי הורדה, בלי סיסמה.',
  },
  see: {
    eyebrow: TODO_HE,
    title: 'אירוע אחד, כפי שאתה זוכר אותו',
    body: 'תאריך, מקום, ומה אפשר לומר בזהירות על מה שהיה בחדר.',
    cards: [
      {
        title: 'קישור מגיע אליך בוואטסאפ',
        body: 'מאמן שאתה מכיר, על ערב או הופעה שבאמת היית חלק מהם.',
      },
      {
        title: 'זה נפתח בדפדפן',
        body: 'בלי חשבון, בלי הורדה, בלי סיסמה.',
      },
      { title: TODO_HE, body: TODO_HE },
    ],
  },
  answer: {
    eyebrow: TODO_HE,
    title: 'אומרים רק מה שבאמת ראית',
    body: 'גם תיקון או אי-אישור הם תשובה טובה',
    options: [
      { icon: 'confirm', label: 'מאשרים', body: 'נראה נכון? מאשרים.' },
      { icon: 'review', label: 'מתקנים', body: 'משהו לא מדויק? מתקנים.' },
      { icon: 'arrow', label: 'מדלגים', body: 'לא בטוח? מדלגים.' },
    ],
  },
  not: {
    eyebrow: TODO_HE,
    title: 'וזה באמת הכול',
    body: 'אין תפקיד מתמשך, אין דאשבורד, אין תיבה לנהל.',
    cards: [
      { title: 'בלי חשבון', body: TODO_HE },
      { title: 'אין דאשבורד', body: TODO_HE },
      { title: 'אין תפקיד מתמשך', body: TODO_HE },
    ],
    // Entity-model audit 2026-07-14 — HE verbatim.
    closing: 'זה לא מרחב עבודה של משרד הפקה. זה תהליך קצר לאישור מקור אחד.',
  },
  control: {
    eyebrow: TODO_HE,
    title: 'שום דבר לא יוצא החוצה בלי בחירה של האמן',
    cards: [
      { title: 'אתה עוזר להפוך זיכרון לנקודת מידע ברורה', body: TODO_HE },
      { title: 'השם שלך מופיע בדיוק כפי שאישרת', body: TODO_HE },
      { title: 'גם תיקון או אי-אישור הם תשובה טובה', body: TODO_HE },
    ],
  },
  finalCta: {
    title: 'עשרים שניות, בלי חשבון',
    body: TODO_HE,
    primaryCta: { label: 'לראות אישור לדוגמה', href: EXAMPLE_ANCHOR },
    secondaryLink: { label: 'להבין איך האישור עובד', href: '/how-it-works' },
  },
}

export const producersContent: Record<'en' | 'he', ProducersContent> = { en, he }
