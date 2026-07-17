// Home page content — EN from the Codex rebuild brief §5.1 (2026-07-14),
// HE verbatim from the Codex HE copy pack (01_HOME_HE_COPY_20260714).
// Missing HE strings carry the TODO_HE marker — do not improvise Hebrew.

import { APP_URL } from '@/lib/app-url'
import {
  TODO_HE,
  type Cta,
  type CardContent,
  type EntityCardContent,
  type FinalCtaContent,
  type FlowStepContent,
  type HeroContent,
  type SectionHeadingContent,
} from './types'

export interface HomeContent {
  meta: { title: string; description: string }
  hero: HeroContent & {
    /** Product chips overlaid on the hero image card (brief §5.1). */
    chips: string[]
    /** Floating mini Radar card (brief §5.1 hero right). */
    radarCard: { label: string; rows: string[] }
    /** Floating Passport preview card (brief §5.1 hero right). */
    passportCard: {
      label: string
      name: string
      tag: string
      methodChip: string
      viewCta: Cta
    }
  }
  why: SectionHeadingContent & { cards: CardContent[] }
  loop: SectionHeadingContent & { steps: FlowStepContent[] }
  lanes: SectionHeadingContent & { cards: EntityCardContent[] }
  finalCta: FinalCtaContent
}

const SIGNUP = `${APP_URL}/signup`

const en: HomeContent = {
  meta: {
    title: 'LOCK — Turn the artist world around you into one booking-ready Passport',
    description:
      'LOCK helps artists organize links, shows, sources and context into a private Radar and a public Passport. No scores. No rankings. Artist controls what goes public.',
  },
  hero: {
    eyebrow: 'Pre-booking context',
    h1: 'Turn the artist world around you into one booking-ready Passport.',
    body: 'LOCK helps artists organize links, shows, sources and context into a private Radar and a public Passport.',
    primaryCta: { label: 'Join free pilot', href: SIGNUP },
    secondaryCta: { label: 'See Passport demo', href: '/passport/demo' },
    trustLine: 'No scores. No rankings. Artist controls what goes public.',
    imageAlt:
      'Artist career workspace — an artist reviewing their live history in a calm private space',
    chips: ['Radar', 'Passport', 'Source-linked', 'Free pilot'],
    radarCard: {
      label: 'Radar · Private',
      rows: ['Shows', 'Links', 'Sources'],
    },
    passportCard: {
      label: 'Passport · Public',
      name: 'Maya Oren',
      tag: 'Melodic techno · Tel Aviv',
      methodChip: 'SOURCE-LINKED',
      viewCta: { label: 'View demo', href: '/passport/demo' },
    },
  },
  why: {
    eyebrow: 'Why it exists',
    title: 'Booking still runs on scattered context.',
    cards: [
      {
        title: 'Artists repeat themselves.',
        body: 'The same story, rebuilt for every request — bio here, links there, screenshots somewhere else.',
      },
      {
        title: 'Buyers guess from scattered links.',
        body: 'A yes deserves more context than an Instagram grid and a half-updated EPK.',
      },
      {
        title: 'Managers and production chase context in WhatsApp.',
        body: 'Threads, voice notes and memories hold history that should be one clear page.',
      },
    ],
  },
  loop: {
    eyebrow: 'The LOCK loop',
    title: 'From first signal to shared Passport.',
    steps: [
      {
        verb: 'Add signal',
        body: 'Shows, rooms, crowds, links and sources — everything lands private in your Radar.',
        icon: 'add',
      },
      {
        verb: 'Radar organizes',
        body: 'LOCK sorts what you added and labels where every piece came from.',
        icon: 'radar',
      },
      {
        verb: 'Source can confirm',
        body: 'Someone who was there gets one short link and confirms a single detail — no account.',
        icon: 'source',
      },
      {
        verb: 'Artist approves',
        body: 'Nothing goes public until the artist says so.',
        icon: 'artist',
      },
      {
        verb: 'Passport is shared',
        body: 'One link that speaks for you before the first phone call.',
        icon: 'passport',
      },
    ],
  },
  lanes: {
    eyebrow: 'Choose your lane',
    title: 'One product. Five doors in.',
    body: 'Artist, manager, production, buyer, source confirmer — each lane sees only what it needs.',
    cards: [
      {
        icon: 'artist',
        audienceLabel: 'Artist',
        title: 'Your nights already tell the story',
        body: 'Turn the gigs you played into a Passport that opens the next room. Free during the pilot.',
        cta: { label: 'For artists', href: '/artists' },
      },
      {
        icon: 'manager',
        audienceLabel: 'Manager',
        title: 'Make every roster pitch easier to trust',
        body: 'One place to see where every act on your roster stands — and the next action for each.',
        cta: { label: 'For managers', href: '/managers' },
      },
      {
        icon: 'production',
        audienceLabel: 'Production',
        title: 'Build lineups with clearer artist context',
        body: 'Fit, reliability and source context — before the commitment, not after.',
        cta: { label: 'For production', href: '/production' },
      },
      {
        icon: 'buyer',
        audienceLabel: 'Buyer',
        title: 'Say yes with a clear head',
        body: 'Read an artist’s real history in two minutes — before your name goes on the line. Always free.',
        cta: { label: 'For bookers', href: '/bookers' },
      },
      {
        icon: 'source',
        audienceLabel: 'Source confirmer',
        title: 'You were there. Say so.',
        body: 'One tap confirms a night you ran — twenty seconds, no account, and an artist you believe in gets further.',
        cta: { label: 'Source confirmation', href: '/producers' },
      },
    ],
  },
  finalCta: {
    title: 'Turn what already happened into the next booking.',
    body: 'We are validating value with artists, buyers, managers and production offices — free during the pilot.',
    primaryCta: { label: 'Join free pilot', href: SIGNUP },
    secondaryLink: { label: 'How it works', href: '/how-it-works' },
  },
}

const he: HomeContent = {
  meta: {
    title: 'LOCK — להפוך את מה שכבר קרה להזמנה הבאה',
    description:
      'LOCK עוזרת להפוך הופעות, מקורות, לינקים ואנשים שהיו שם לפספורט קצר וברור שמזמין הופעות יכול להבין מהר. בלי ציון. בלי דירוג. האמן בוחר מה יוצא החוצה.',
  },
  hero: {
    eyebrow: 'הקשר ברור לפני שמתחילים לדבר על בוקינג',
    h1: 'LOCK — להפוך את מה שכבר קרה להזמנה הבאה',
    body: 'LOCK עוזרת להפוך הופעות, מקורות, לינקים ואנשים שהיו שם לפספורט קצר וברור שמזמין הופעות יכול להבין מהר.',
    primaryCta: { label: 'להצטרף לפיילוט', href: SIGNUP },
    secondaryCta: { label: 'לראות פספורט לדוגמה', href: '/passport/demo' },
    trustLine: 'בלי ציון. בלי דירוג. בלי לחשוף חולשות. האמן בוחר מה יוצא החוצה.',
    imageAlt: TODO_HE,
    chips: ['רדאר', 'פספורט', 'Source-linked', 'פיילוט חינמי'],
    radarCard: {
      label: 'רדאר · פרטי',
      rows: ['הופעות', 'לינקים', 'מקורות'],
    },
    passportCard: {
      label: 'פספורט · ציבורי',
      name: 'Maya Oren',
      tag: 'Melodic techno · Tel Aviv',
      methodChip: 'SOURCE-LINKED',
      viewCta: { label: 'לראות פספורט לדוגמה', href: '/passport/demo' },
    },
  },
  why: {
    eyebrow: TODO_HE,
    title: TODO_HE,
    cards: [
      { title: TODO_HE, body: TODO_HE },
      { title: TODO_HE, body: TODO_HE },
      { title: TODO_HE, body: TODO_HE },
    ],
  },
  loop: {
    eyebrow: TODO_HE,
    title: 'איך זה עובד',
    steps: [
      {
        verb: 'להוסיף את מה שכבר קרה',
        body: 'הופעות, חדרים, קהל, לינקים ומקורות — הכול נשאר פרטי עד שבוחרים מה להציג.',
        icon: 'add',
      },
      {
        verb: 'LOCK מסדרת ומסמנת את המקורות',
        body: 'שום דבר לא אמור לצאת החוצה בלי הקשר, תאריך, מקור והחלטה שלך.',
        icon: 'radar',
      },
      {
        verb: 'לחזק דרך אנשים שהיו שם',
        body: 'מאשר-מקור מקבל קישור קצר, רואה את הפרטים ומאשר רק את מה שהוא באמת יודע.',
        icon: 'source',
      },
      {
        verb: 'האמן בוחר מה יוצא החוצה.',
        body: TODO_HE,
        icon: 'artist',
      },
      {
        verb: 'לשלוח פספורט',
        body: 'לינק אחד שמסביר אותך לפני השיחה הראשונה.',
        icon: 'passport',
      },
    ],
  },
  lanes: {
    eyebrow: TODO_HE,
    title: TODO_HE,
    body: TODO_HE,
    cards: [
      {
        icon: 'artist',
        audienceLabel: 'לאמנים',
        title: 'הלילות שלך כבר מספרים סיפור',
        body: 'הופעות שכבר עשית יכולות להפוך לפספורט מקצועי שעוזר לפתוח את הדלת לשיחה הבאה. הפיילוט בחינם.',
        cta: { label: 'לאמנים', href: '/artists' },
      },
      {
        icon: 'manager',
        audienceLabel: 'אמרגן / מנהל אמנים',
        title: TODO_HE,
        body: TODO_HE,
        cta: { label: TODO_HE, href: '/managers' },
      },
      {
        icon: 'production',
        audienceLabel: TODO_HE,
        title: TODO_HE,
        body: TODO_HE,
        cta: { label: TODO_HE, href: '/production' },
      },
      {
        icon: 'buyer',
        audienceLabel: 'מזמין הופעות',
        title: 'להגיד כן עם יותר הקשר',
        body: 'להבין מי האמן, מה הסגנון שלו ומה כבר עומד מאחוריו — לפני שמתחייבים לשיחה, אירוע או הזמנה.',
        cta: { label: 'למזמיני הופעות ואירועים', href: '/bookers' },
      },
      {
        icon: 'source',
        audienceLabel: 'מאשר-מקור',
        title: 'היית שם? אפשר לעזור לאמן במענה אחד',
        body: 'קישור אחד, בלי חשבון ובלי התחברות. מאשרים נקודת מידע אחת ועוזרים לאמן להציג אותה נכון.',
        cta: { label: 'למאשרי-מקור', href: '/producers' },
      },
    ],
  },
  finalCta: {
    title: 'בונים פספורט שמסביר מי אתה כאמן — לפני שמבקשים ממך “עוד חומרים”.',
    body: TODO_HE,
    primaryCta: { label: 'להתחיל בפיילוט החינמי', href: SIGNUP },
    secondaryLink: { label: 'איך זה עובד', href: '/how-it-works' },
  },
}

export const homeContent: Record<'en' | 'he', HomeContent> = { en, he }
