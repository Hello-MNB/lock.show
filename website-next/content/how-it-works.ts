// How It Works content — EN from the Codex rebuild brief §5.8 (2026-07-14),
// HE verbatim from the Codex HE copy pack (08_HOW_IT_WORKS_HE_COPY_20260714).
// Missing HE strings carry the TODO_HE marker — do not improvise Hebrew.
//
// Brief §5.8: hero "Start with one link. End with a Passport you control." —
// 6-step flow (artist adds link → Radar organizes → source can confirm →
// artist approves → Passport shared → buyer reacts), horizontal stepper on
// desktop / vertical cards on mobile, tiny entity icons, career-workspace
// image, procedural detail cut above the fold.

import { APP_URL } from '@/lib/app-url'
import {
  TODO_HE,
  type FinalCtaContent,
  type FlowStepContent,
  type HeroContent,
  type SectionHeadingContent,
} from './types'
import type { IconId } from '@/components/marketing/icons'

export interface RoleCardContent {
  icon: IconId
  label: string
  body: string
}

export interface HowItWorksContent {
  meta: { title: string; description: string }
  hero: HeroContent & { chips: string[] }
  flow: SectionHeadingContent & { steps: FlowStepContent[] }
  roles: SectionHeadingContent & { cards: RoleCardContent[] }
  finalCta: FinalCtaContent
}

const SIGNUP = `${APP_URL}/signup`

const en: HowItWorksContent = {
  meta: {
    title: 'How It Works — Start with one link. End with a Passport you control.',
    description:
      'LOCK does not ask you to build everything from scratch. One link in, a clear Passport out — organized in a private Radar, confirmed by people who were there, published only on your approval.',
  },
  hero: {
    eyebrow: 'How it works',
    h1: 'Start with one link. End with a Passport you control.',
    body: 'LOCK does not ask you to build everything from scratch. It helps organize what already exists around you, checks what fits, and lets you choose what to show whoever is considering booking you.',
    primaryCta: { label: 'Start free', href: SIGNUP },
    secondaryCta: { label: 'See sample Passport', href: '/passport/demo' },
    trustLine: '',
    imageAlt:
      'Artist career workspace — an artist organizing their live history in a calm private space',
    chips: ['One link in', 'Radar', 'Passport out'],
  },
  flow: {
    eyebrow: 'The flow',
    title: 'Six steps — most of them are one tap.',
    steps: [
      {
        verb: 'Artist adds a link',
        body: 'A show, a source, a piece of media — date, venue, whatever context already exists.',
        icon: 'add',
      },
      {
        verb: 'Radar organizes',
        body: 'Everything lands private in your Radar, sorted and labelled by where it came from.',
        icon: 'radar',
      },
      {
        verb: 'Source can confirm',
        body: 'Send one short link to whoever was there. They confirm or correct in seconds — no account, no password.',
        icon: 'source',
      },
      {
        verb: 'Artist approves',
        body: 'Nothing leaves your Radar without your say-so. You choose what goes public.',
        icon: 'artist',
      },
      {
        verb: 'Passport is shared',
        body: 'One link with your strongest nights, sources and a clear professional story — sent before the call.',
        icon: 'passport',
      },
      {
        verb: 'Booker reacts',
        body: 'A professional booker or private client opens it in a browser, gets short context — and if the fit feels right, a better conversation starts.',
        icon: 'buyer',
      },
    ],
  },
  roles: {
    eyebrow: 'Who is involved',
    title: 'Three people. One clear page.',
    cards: [
      {
        icon: 'artist',
        label: 'Artist',
        body: 'That is you. You add shows, links and existing sources, and choose what fits to show outward.',
      },
      {
        icon: 'source',
        label: 'Source confirmer',
        body: 'Someone who was there and can confirm one detail — one short link, twenty seconds, no account.',
      },
      {
        icon: 'buyer',
        label: 'Booker / private client',
        body: 'They open a Passport in a browser and get short context before moving forward — no signup, no wall.',
      },
    ],
  },
  finalCta: {
    title: 'One link in. A Passport you control out.',
    body: 'Free during the pilot — for artists, bookers, private clients, representation and production teams.',
    primaryCta: { label: 'Start free', href: SIGNUP },
    secondaryLink: { label: 'See sample Passport', href: '/passport/demo' },
  },
}

const he: HowItWorksContent = {
  meta: {
    title: 'איך זה עובד — מהופעה לפספורט שאפשר לשלוח',
    description:
      'LOCK לא מבקשת ממך לבנות הכול מאפס. היא עוזרת לסדר את מה שכבר קיים סביבך, לבדוק מה מתאים, ולבחור מה להציג למי ששוקל להזמין אותך.',
  },
  hero: {
    eyebrow: 'איך זה עובד',
    h1: 'מתחילים מלינק אחד. מסיימים עם פספורט שאפשר לשלוח.',
    body: 'LOCK לא מבקשת ממך לבנות הכול מאפס. היא עוזרת לסדר את מה שכבר קיים סביבך, לבדוק מה מתאים, ולבחור מה להציג למי ששוקל להזמין אותך.',
    primaryCta: { label: 'להתחיל בחינם', href: SIGNUP },
    secondaryCta: { label: 'לראות פספורט לדוגמה', href: '/passport/demo' },
    trustLine: TODO_HE,
    imageAlt: TODO_HE,
    chips: ['רדאר', 'פספורט', 'פיילוט חינמי'],
  },
  flow: {
    eyebrow: TODO_HE,
    title: TODO_HE,
    steps: [
      {
        verb: 'מוסיפים הופעה או מקור',
        body: 'תאריך, מקום, לינק, תיעוד או פרט רלוונטי אחר.',
        icon: 'add',
      },
      {
        verb: TODO_HE,
        body: TODO_HE,
        icon: 'radar',
      },
      {
        verb: 'שולחים למאשר-מקור קישור קצר',
        body: 'שולחים בוואטסאפ למי שהיה שם ויכול לאשר. בלי חשבון ובלי סיסמה.',
        icon: 'source',
      },
      {
        verb: 'אתה בוחר מה יוצא החוצה',
        body: 'שום דבר לא יוצא מהרדאר הפרטי בלי החלטה שלך.',
        icon: 'artist',
      },
      {
        verb: 'שולחים פספורט לפני השיחה',
        body: 'לינק אחד שמציג הקשר, מקורות וסיפור מקצועי ברור.',
        icon: 'passport',
      },
      {
        verb: 'ואם יש התאמה — מתחילים שיחה טובה יותר',
        body: 'הוא פותח פספורט בדפדפן ומקבל הקשר קצר לפני שהוא מתקדם.',
        icon: 'buyer',
      },
    ],
  },
  roles: {
    eyebrow: TODO_HE,
    title: TODO_HE,
    cards: [
      {
        icon: 'artist',
        label: 'האמן',
        body: 'זה אתה. מוסיפים הופעות, לינקים ומקורות קיימים, ובוחרים מה מתאים להראות החוצה.',
      },
      {
        icon: 'source',
        label: 'מאשר-מקור',
        body: 'מי שהיה שם ויכול לאשר נקודת מידע אחת.',
      },
      {
        icon: 'buyer',
        label: 'מזמין הופעות או אירוע',
        body: 'הוא פותח פספורט בדפדפן ומקבל הקשר קצר לפני שהוא מתקדם.',
      },
    ],
  },
  finalCta: {
    title: TODO_HE,
    body: TODO_HE,
    primaryCta: { label: 'להתחיל בחינם', href: SIGNUP },
    secondaryLink: { label: 'לראות פספורט לדוגמה', href: '/passport/demo' },
  },
}

export const howItWorksContent: Record<'en' | 'he', HowItWorksContent> = { en, he }
