// FAQ content — EN per the Codex rebuild brief §5.10 (2026-07-14), HE
// verbatim from the Codex HE copy pack (10_FAQ_HE_COPY_20260714). Missing HE
// strings carry the TODO_HE marker — do not improvise Hebrew.
//
// Brief §5.10: hero "Questions before you try LOCK?" — categories Artists /
// Buyers + private clients / Managers + production / Privacy + trust /
// Free pilot. The 8 required questions are all present (marked `required`).

import { APP_URL } from '@/lib/app-url'
import { TODO_HE, type Cta } from './types'

export interface FaqItemContent {
  q: string
  a: string
  /** One of the 8 questions the rebuild brief marks as required. */
  required?: boolean
}

export interface FaqCategoryContent {
  id: string
  label: string
  items: FaqItemContent[]
}

export interface FaqContent {
  meta: { title: string; description: string }
  hero: { eyebrow: string; h1: string; body: string }
  categories: FaqCategoryContent[]
  finalCta: {
    title: string
    primaryCta: Cta
    secondaryLink: Cta
  }
}

const SIGNUP = `${APP_URL}/signup`

const en: FaqContent = {
  meta: {
    title: 'FAQ — Questions before you try LOCK?',
    description:
      'What LOCK is, what a Passport shows, who controls publication, and why there is no score, rank or percentile — ever. Straight answers for artists, buyers, managers and private clients.',
  },
  hero: {
    eyebrow: 'FAQ',
    h1: 'Questions before you try LOCK?',
    body: 'Straight answers on trust, privacy, the free pilot and every lane in. If something is missing, the contact page reaches a human.',
  },
  categories: [
    {
      id: 'artists',
      label: 'Artists',
      items: [
        {
          q: 'What is LOCK?',
          a: 'LOCK is a system that helps artists organize existing professional context — shows, links, sources and media — into one clear Passport that can be sent before a booking conversation.',
          required: true,
        },
        {
          q: 'What is a Passport?',
          a: 'A Passport is a short public page that shows the artist, their style, relevant sources and what is useful to know before moving to a call or a booking. Every detail on it carries a method label, and the artist controls all of it.',
          required: true,
        },
        {
          q: 'What is the Radar?',
          a: 'The Radar is the artist’s private space: it is where sources get organized, where you see what is missing, and where you decide what is fit to show outward. Only the artist sees it.',
        },
      ],
    },
    {
      id: 'buyers',
      label: 'Buyers + private clients',
      items: [
        {
          q: 'Can private clients use it?',
          a: 'Yes. Planning a wedding, company night or private event? You do not need industry vocabulary to understand if an artist fits the room — a Passport is written to help a first-time buyer just as much as a professional.',
          required: true,
        },
        {
          q: 'Who is LOCK for?',
          a: 'Artists, manager offices, production offices, buyers of shows and events — and private clients who want to understand whether an artist fits their event.',
        },
      ],
    },
    {
      id: 'managers',
      label: 'Managers + production',
      items: [
        {
          q: 'Does LOCK replace a manager?',
          a: 'No. LOCK helps artists and manager offices present clearer context. It does not replace relationships, taste, negotiation or human work.',
          required: true,
        },
        {
          q: 'What is a Source Confirmer?',
          a: 'Someone who was there — the person who ran the night — and can confirm one detail through a short link, without opening an account and without taking an ongoing role.',
          required: true,
        },
      ],
    },
    {
      id: 'privacy',
      label: 'Privacy + trust',
      items: [
        {
          q: 'Is this a rating system?',
          a: 'No. There are no scores, no rankings, no percentiles and no public “quality grade”. Audience draw appears only as careful bands and yes/no facts, each with a method label showing how it was sourced. LOCK presents context — it never judges the artist.',
          required: true,
        },
        {
          q: 'Who controls what becomes public?',
          a: 'The artist. Anything found or added in the Radar stays private until the artist chooses what is fit to appear on the Passport.',
          required: true,
        },
      ],
    },
    {
      id: 'pilot',
      label: 'Free pilot',
      items: [
        {
          q: 'Is the pilot free?',
          a: 'Yes. During the pilot LOCK is free — there are no paid plans and no charges at launch.',
          required: true,
        },
      ],
    },
  ],
  finalCta: {
    title: 'Still have questions?',
    primaryCta: { label: 'Talk to us', href: '/contact' },
    secondaryLink: { label: 'Join the pilot', href: SIGNUP },
  },
}

const he: FaqContent = {
  meta: {
    title: TODO_HE,
    description: TODO_HE,
  },
  hero: {
    eyebrow: TODO_HE,
    h1: TODO_HE,
    body: TODO_HE,
  },
  categories: [
    {
      id: 'artists',
      label: TODO_HE,
      items: [
        {
          q: 'מה זה LOCK?',
          a: 'LOCK היא מערכת שעוזרת לאמנים לסדר מידע מקצועי קיים — הופעות, לינקים, מקורות ותכנים — לפספורט ברור שאפשר לשלוח לפני בוקינג.',
          required: true,
        },
        {
          q: 'מה זה פספורט?',
          a: 'פספורט הוא עמוד קצר שמציג את האמן, הסגנון שלו, מקורות רלוונטיים ומה מתאים לדעת לפני שמתקדמים לשיחה או הזמנה.',
          required: true,
        },
        {
          q: 'מה זה רדאר?',
          a: 'הרדאר הוא המרחב הפרטי של האמן: שם מסדרים מקורות, רואים מה חסר, ומחליטים מה מתאים להציג החוצה.',
        },
      ],
    },
    {
      id: 'buyers',
      label: TODO_HE,
      items: [
        {
          q: 'האם מזמין פרטי צריך להבין בתעשייה?',
          a: 'לא. פספורט אמור לעזור גם לזוג שמתכנן חתונה, לחברה שמפיקה אירוע או למי שמזמין אמן בפעם הראשונה.',
          required: true,
        },
        {
          q: 'למי זה מתאים?',
          a: 'לאמנים, משרדי אמרגנות, משרדי הפקה, מזמיני הופעות ואירועים, וגם לקוחות פרטיים שרוצים להבין אם אמן מתאים לאירוע.',
        },
      ],
    },
    {
      id: 'managers',
      label: TODO_HE,
      items: [
        {
          q: 'האם LOCK מחליפה אמרגן או מנהל אמן?',
          a: 'לא. LOCK עוזרת לאמן ולמשרד אמרגנות להציג הקשר ברור יותר. היא לא מחליפה קשרים, טעם, משא ומתן או עבודה אנושית.',
          required: true,
        },
        {
          q: 'מה זה מאשר-מקור?',
          a: 'אדם שהיה שם ויכול לאשר נקודת מידע אחת דרך קישור קצר, בלי לפתוח חשבון ובלי לקבל תפקיד מתמשך.',
          required: true,
        },
      ],
    },
    {
      id: 'privacy',
      label: TODO_HE,
      items: [
        {
          q: 'האם LOCK מדרגת אמנים?',
          a: 'לא. אין ציונים, אין דירוגים, אין אחוזונים ואין “הערכת איכות” ציבורית. LOCK מציגה הקשר ושיטות מקור, לא שופטת את האמן.',
          required: true,
        },
        {
          q: 'מי מחליט מה יוצא החוצה?',
          a: 'האמן. מידע שנמצא או נוסף ברדאר נשאר פרטי עד שהאמן בוחר מה מתאים להציג בפספורט.',
          required: true,
        },
      ],
    },
    {
      id: 'pilot',
      label: TODO_HE,
      items: [
        {
          q: 'זה בתשלום?',
          a: 'בשלב הפיילוט LOCK בחינם. אין חבילות תשלום ואין חיוב בהשקה.',
          required: true,
        },
      ],
    },
  ],
  finalCta: {
    title: 'יש עוד שאלה?',
    primaryCta: { label: 'דברו איתנו', href: '/contact' },
    secondaryLink: { label: 'להצטרף לפיילוט', href: SIGNUP },
  },
}

export const faqContent: Record<'en' | 'he', FaqContent> = { en, he }
