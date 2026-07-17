// Methodology content — EN from the Codex rebuild brief §5.9 (2026-07-14),
// HE verbatim from the Codex HE copy pack (09_METHODOLOGY_HE_COPY_20260714).
// Missing HE strings carry the TODO_HE marker — do not improvise Hebrew.
//
// Brief §5.9: trust page — calm, not over-technical. Sections: method labels →
// source types → what never becomes public → firewall rules. Governed chips
// stay in English in both locales (HE pack index ruling: "Source-linked /
// Evidence-supported / Artist-declared as governed chips unless localized
// separately"). NO visual that resembles a scoring chart.

import { APP_URL } from '@/lib/app-url'
import {
  TODO_HE,
  type FinalCtaContent,
  type SectionHeadingContent,
} from './types'

export type SourceKind = 'platform' | 'document' | 'person' | 'declared'

export interface MethodLabelContent {
  /** Governed chip — English in both locales. */
  chip: string
  title: string
  body: string
}

export interface SourceTypeContent {
  kind: SourceKind
  label: string
  body: string
}

export interface MethodologyContent {
  meta: { title: string; description: string }
  hero: {
    eyebrow: string
    h1: string
    body: string
    /** Governed method chips shown under the hero (English in both locales). */
    chips: string[]
  }
  methodLabels: SectionHeadingContent & { items: MethodLabelContent[] }
  sourceTypes: SectionHeadingContent & {
    items: SourceTypeContent[]
    logosLabel: string
  }
  neverPublic: SectionHeadingContent & { items: { title: string; body: string }[] }
  firewall: SectionHeadingContent & { rules: { title: string; body: string }[] }
  finalCta: FinalCtaContent
}

const SIGNUP = `${APP_URL}/signup`

// Governed chips — identical in both locales by ruling.
const GOVERNED_CHIPS = [
  'Source-linked',
  'Evidence-supported',
  'Artist-declared',
  'Producer-confirmed',
]

const en: MethodologyContent = {
  meta: {
    title: 'Methodology — Not every source means the same thing. LOCK shows the method.',
    description:
      'A good Passport explains where each detail came from, when it was checked, and what it can carefully support. Method labels, source types, and the firewall rules — no scores, ever.',
  },
  hero: {
    eyebrow: 'Methodology',
    h1: 'Not every source means the same thing. LOCK shows the method.',
    body: 'A good Passport does not need to inflate anything. It explains where each detail came from, when it was checked, and what can carefully be understood from it.',
    chips: GOVERNED_CHIPS,
  },
  methodLabels: {
    eyebrow: 'Method labels',
    title: 'Every important detail carries its method.',
    body: 'The label sits next to the detail — so a reader always knows how it was sourced, without guessing.',
    items: [
      {
        chip: 'Source-linked',
        title: 'Linked to a live platform source.',
        body: 'The detail links to platform or streaming data, checked as context only. The platform and the link are shown — never presented as audience-draw evidence.',
      },
      {
        chip: 'Evidence-supported',
        title: 'A document supports it.',
        body: 'Ticketing exports and similar records, reviewed by a person before the detail stands. The review is what earns the label.',
      },
      {
        chip: 'Artist-declared',
        title: 'The artist said so — and we say so.',
        body: 'Declared details are always labelled as declared. They are never dressed up as verified.',
      },
      {
        chip: 'Producer-confirmed',
        title: 'Someone who was there confirmed it.',
        body: 'A source confirmer who ran the night confirmed the detail through one short link — no account, no ongoing role.',
      },
    ],
  },
  sourceTypes: {
    eyebrow: 'Source types',
    title: 'Four kinds of sources — read differently on purpose.',
    items: [
      {
        kind: 'platform',
        label: 'Platform',
        body: 'Streaming and social platforms — SoundCloud, Instagram and similar. Context about style and reach, secondary by design.',
      },
      {
        kind: 'document',
        label: 'Document',
        body: 'Ticketing exports and reports — Eventer, Tickchak, GO-OUT and similar — reviewed before they support anything.',
      },
      {
        kind: 'person',
        label: 'Person',
        body: 'A source confirmer who was there and can confirm one detail through a short link.',
      },
      {
        kind: 'declared',
        label: 'Artist-declared',
        body: 'The artist’s own account of a night — always labelled as such.',
      },
    ],
    logosLabel: 'Sources LOCK reads today',
  },
  neverPublic: {
    eyebrow: 'What never becomes public',
    title: 'Some things stay inside — always.',
    items: [
      {
        title: 'Exact audience numbers',
        body: 'Draw is shown carefully, in bands, when relevant — never as an exact figure that fakes precision.',
      },
      {
        title: 'The private Radar',
        body: 'Drafts, gaps and unripe details live only in the artist’s private space. Omission is the policy — not a placeholder.',
      },
      {
        title: 'Weakness language',
        body: 'No gap, “missing” marker or weakness indicator ever appears on a public Passport.',
      },
      {
        title: 'Contact details',
        body: 'An interested buyer sends a request through the Passport — contact information is never exposed.',
      },
    ],
  },
  firewall: {
    eyebrow: 'Firewall rules',
    title: 'The rules that hold everything above.',
    rules: [
      {
        title: 'No exact public draw numbers',
        body: 'Audience appears carefully and in bands when relevant — not as an exact number that manufactures an illusion.',
      },
      {
        title: 'No scores, no rankings',
        body: 'LOCK does not rate artists and gives no scores — no percentiles, no predictions, no gauges.',
      },
      {
        title: 'Method always visible',
        body: 'Next to every important detail appears the method of its source.',
      },
      {
        title: 'Artist approval',
        body: 'The artist chooses what is fit to show outward.',
      },
      {
        title: 'Private stays private',
        body: 'Private or unripe information is never meant to reach a public Passport.',
      },
    ],
  },
  finalCta: {
    title: 'See the method working on a real page.',
    primaryCta: { label: 'View sample Passport', href: '/passport/demo' },
    secondaryLink: { label: 'See how it works', href: '/how-it-works' },
  },
}

const he: MethodologyContent = {
  meta: {
    title: 'איך LOCK מסמנת מקורות ומידע',
    description:
      'פספורט טוב לא צריך לנפח מידע. הוא צריך להסביר מאיפה המידע הגיע, מתי הוא נבדק, ומה אפשר להבין ממנו בזהירות.',
  },
  hero: {
    eyebrow: TODO_HE,
    h1: 'לא כל מקור אומר אותו דבר — ולכן LOCK מסמנת אותו בגלוי.',
    body: 'פספורט טוב לא צריך לנפח מידע. הוא צריך להסביר מאיפה המידע הגיע, מתי הוא נבדק, ומה אפשר להבין ממנו בזהירות.',
    chips: GOVERNED_CHIPS,
  },
  methodLabels: {
    eyebrow: TODO_HE,
    title: TODO_HE,
    body: TODO_HE,
    items: [
      {
        chip: 'Source-linked',
        title: 'מידע מפלטפורמה · נבדק',
        body: 'מידע מפלטפורמה שנבדק כהקשר בלבד.',
      },
      {
        chip: 'Evidence-supported',
        title: 'דוח כרטיסים · נבדק',
        body: 'נתוני כרטיסים שנבדקו על ידי אדם.',
      },
      {
        chip: 'Artist-declared',
        title: 'הצהרת אמן',
        body: 'האמן הצהיר — ואנחנו מסמנים שזה מקור המידע.',
      },
      {
        chip: 'Producer-confirmed',
        title: 'מאושר על ידי מקור', // pack typo מקות→מקור corrected (obvious typo in the pack's own canonical term מאשר-מקור; flagged to Codex, SYNC §40)
        body: 'מאשר-מקור שהיה שם אישר את הפרט.',
      },
    ],
  },
  sourceTypes: {
    eyebrow: TODO_HE,
    title: TODO_HE,
    items: [
      { kind: 'platform', label: TODO_HE, body: TODO_HE },
      { kind: 'document', label: TODO_HE, body: TODO_HE },
      { kind: 'person', label: 'מאשר-מקור', body: 'מי שהיה שם ויכול לאשר נקודת מידע אחת.' },
      { kind: 'declared', label: 'הצהרת אמן', body: 'האמן הצהיר — ואנחנו מסמנים שזה מקור המידע.' },
    ],
    logosLabel: TODO_HE,
  },
  neverPublic: {
    eyebrow: TODO_HE,
    title: TODO_HE,
    items: [
      {
        title: TODO_HE,
        body: 'קהל מוצג בזהירות ובטווחים כשזה רלוונטי — לא כמספר מדויק שמייצר אשליה.',
      },
      {
        title: TODO_HE,
        body: 'מידע פרטי או לא בשל לא אמור להגיע לפספורט ציבורי.',
      },
      { title: TODO_HE, body: TODO_HE },
      { title: TODO_HE, body: TODO_HE },
    ],
  },
  firewall: {
    eyebrow: TODO_HE,
    title: TODO_HE,
    rules: [
      {
        title: TODO_HE,
        body: 'קהל מוצג בזהירות ובטווחים כשזה רלוונטי — לא כמספר מדויק שמייצר אשליה.',
      },
      { title: TODO_HE, body: 'LOCK לא מדרגת אמנים ולא נותנת ציונים.' },
      { title: TODO_HE, body: 'ליד כל פרט חשוב מופיעה שיטת המקור שלו.' },
      { title: TODO_HE, body: 'האמן בוחר מה מתאים להציג החוצה.' },
      { title: TODO_HE, body: 'מידע פרטי או לא בשל לא אמור להגיע לפספורט ציבורי.' },
    ],
  },
  finalCta: {
    title: TODO_HE,
    primaryCta: { label: 'לראות פספורט לדוגמה', href: '/passport/demo' },
    secondaryLink: { label: 'לראות איך זה עובד', href: '/how-it-works' },
  },
}

export const methodologyContent: Record<'en' | 'he', MethodologyContent> = { en, he }
