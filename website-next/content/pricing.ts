// Pricing → FREE PILOT content — EN from the Codex rebuild brief §5.7
// (2026-07-14), HE verbatim from the Codex HE copy pack
// (07_PRICING_FREE_PILOT_HE_COPY_20260714). Missing HE strings carry the
// TODO_HE marker — do not improvise Hebrew.
//
// Launch ruling (brief §5.7): FREE PILOT. NO pricing table, NO paid plan
// names, NO payment CTA, no "buy"/"subscribe"/"limited discount" language.

import { APP_URL } from '@/lib/app-url'
import {
  TODO_HE,
  type EntityCardContent,
  type FinalCtaContent,
  type HeroContent,
  type SectionHeadingContent,
} from './types'

export interface PricingContent {
  meta: { title: string; description: string }
  hero: HeroContent & { chips: string[] }
  entities: SectionHeadingContent & { cards: EntityCardContent[] }
  finalCta: FinalCtaContent
}

const SIGNUP = `${APP_URL}/signup`

const en: PricingContent = {
  meta: {
    title: 'Free Pilot — LOCK is free while we validate',
    description:
      'Free pilot. No plans yet. We are validating value with artists, buyers, managers and production offices — no prices, no payment, no commitment.',
  },
  hero: {
    eyebrow: 'Free pilot',
    h1: 'Free pilot. No plans yet.',
    body: 'We are validating value with artists, buyers, managers and production offices. No payment, no plans, no commitment — the goal is to learn what really helps before anything grows.',
    primaryCta: { label: 'Join free pilot', href: SIGNUP },
    secondaryCta: { label: 'See how it works', href: '/how-it-works' },
    trustLine: 'No prices. No paid plans. No scores — ever.',
    imageAlt:
      'LOCK brand cover — calm growth-intelligence atmosphere for the free pilot stage',
    chips: ['Radar', 'Passport', 'Free pilot'],
  },
  entities: {
    eyebrow: 'Who the pilot is for',
    title: 'Five doors in — all free right now.',
    body: 'Each lane joins the same pilot: real Passports, real reactions, zero payment language.',
    cards: [
      {
        icon: 'artist',
        audienceLabel: 'Artist',
        title: 'Build your first Passport',
        body: 'See what already exists around you and what is worth strengthening — before you send anything to a buyer.',
        cta: { label: 'For artists', href: '/artists' },
      },
      {
        icon: 'buyer',
        audienceLabel: 'Buyer',
        title: 'Open a Passport — no account',
        body: 'Understand quickly whether an artist fits your event. Works for professionals and private clients alike.',
        cta: { label: 'For bookers', href: '/bookers' },
      },
      {
        icon: 'manager',
        audienceLabel: 'Manager',
        title: 'Send your roster clearer',
        body: 'See how Passport and Radar can help every act on your roster arrive with context instead of scattered links.',
        cta: { label: 'For managers', href: '/managers' },
      },
      {
        icon: 'production',
        audienceLabel: 'Production',
        title: 'One place for artist context',
        body: 'Requests, answers and source context on the artists you are considering — living in one place, not in threads.',
        cta: { label: 'For production', href: '/production' },
      },
      {
        icon: 'source',
        audienceLabel: 'Source confirmer',
        title: 'Confirm one detail, done',
        body: 'A short link, no account, no ongoing role. You confirm what you actually know and get back to work.',
        cta: { label: 'Source confirmation', href: '/producers' },
      },
    ],
  },
  finalCta: {
    title: 'Join while it costs nothing but curiosity.',
    body: 'When pricing comes, it will be set with the people already inside — measured, not required.',
    primaryCta: { label: 'Join free pilot', href: SIGNUP },
    secondaryLink: { label: 'Talk to us', href: '/contact' },
  },
}

const he: PricingContent = {
  meta: {
    title: 'הפיילוט החינמי — LOCK',
    description:
      'בשלב ההשקה אנחנו בודקים ערך אמיתי עם אמנים, מזמיני הופעות, משרדי אמרגנות ומשרדי הפקה. אין תשלום, אין חבילות, ואין התחייבות.',
  },
  hero: {
    eyebrow: 'הפיילוט החינמי',
    h1: 'בפיילוט הראשון — LOCK בחינם.',
    body: 'בשלב ההשקה אנחנו בודקים ערך אמיתי עם אמנים, מזמיני הופעות, משרדי אמרגנות ומשרדי הפקה. אין תשלום, אין חבילות, ואין התחייבות. המטרה היא ללמוד מה באמת עוזר לפני שמרחיבים.',
    primaryCta: { label: 'להצטרף לפיילוט החינמי', href: SIGNUP },
    secondaryCta: { label: 'לראות איך זה עובד', href: '/how-it-works' },
    trustLine: TODO_HE,
    imageAlt: TODO_HE,
    chips: ['רדאר', 'פספורט', 'פיילוט חינמי'],
  },
  entities: {
    eyebrow: TODO_HE,
    title: TODO_HE,
    body: TODO_HE,
    cards: [
      {
        icon: 'artist',
        audienceLabel: 'לאמנים',
        title: TODO_HE,
        body: 'לבנות פספורט ראשון, להבין מה כבר קיים סביבך ומה כדאי לשפר לפני ששולחים למזמין.',
        cta: { label: 'לאמנים', href: '/artists' },
      },
      {
        icon: 'buyer',
        audienceLabel: 'למזמיני הופעות ואירועים',
        title: TODO_HE,
        body: 'לפתוח פספורט בלי חשבון ולהבין מהר אם האמן מתאים לאירוע.',
        cta: { label: 'למזמיני הופעות ואירועים', href: '/bookers' },
      },
      {
        icon: 'manager',
        audienceLabel: 'למשרדי אמרגנות ורוסטרים',
        title: TODO_HE,
        body: 'לבחון איך פספורט ורדאר יכולים לעזור לרוסטר להישלח ברור יותר.',
        cta: { label: 'לרשום עניין לרוסטר', href: '/managers' },
      },
      {
        icon: 'production',
        audienceLabel: TODO_HE,
        title: TODO_HE,
        body: 'לבדוק איך בקשות, תגובות והקשר על אמנים יכולים לחיות במקום אחד.',
        cta: { label: TODO_HE, href: '/production' },
      },
      {
        icon: 'source',
        audienceLabel: 'למאשרי-מקור',
        title: TODO_HE,
        body: 'לאשר נקודת מידע אחת בקישור קצר, בלי חשבון ובלי תפקיד מתמשך.',
        cta: { label: 'למאשרי-מקור', href: '/producers' },
      },
    ],
  },
  finalCta: {
    title: 'להתחיל בפיילוט החינמי',
    body: TODO_HE,
    primaryCta: { label: 'להצטרף לפיילוט החינמי', href: SIGNUP },
    secondaryLink: { label: 'לדבר איתנו', href: '/contact' },
  },
}

export const pricingContent: Record<'en' | 'he', PricingContent> = { en, he }
