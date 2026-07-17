// Artists page content — EN from the Codex rebuild brief §5.2 (2026-07-14),
// HE verbatim from the Codex HE copy pack (02_ARTISTS_HE_COPY_20260714).
// Psychology: supported, not evaluated. Never "prove yourself".
// Missing HE strings carry the TODO_HE marker — do not improvise Hebrew.

import { APP_URL } from '@/lib/app-url'
import {
  TODO_HE,
  type CardContent,
  type FinalCtaContent,
  type FlowStepContent,
  type HeroContent,
  type SectionHeadingContent,
} from './types'

export interface ArtistsContent {
  meta: { title: string; description: string }
  hero: HeroContent & {
    /** "Artist controls publication" badge (brief §5.2 Add). */
    badge: { methodLabel: string; explanation: string }
    /** "Start with one link" micro-step (brief §5.2 Add). */
    microStep: string
    /** Floating Radar overlay card on the hero image. */
    radarCard: { label: string; rows: string[] }
  }
  /** Visual mini-flow: One link → Radar → Passport → Share. */
  miniFlow: { eyebrow: string; chips: string[] }
  tension: SectionHeadingContent & { cards: CardContent[] }
  products: {
    eyebrow: string
    title: string
    radar: { label: string; title: string; body: string; features: string[] }
    passport: {
      label: string
      title: string
      body: string
      features: string[]
      methodChips: string[]
    }
  }
  flow: SectionHeadingContent & { steps: FlowStepContent[] }
  finalCta: FinalCtaContent
}

const SIGNUP = `${APP_URL}/signup`

const en: ArtistsContent = {
  meta: {
    title: 'Stop rebuilding your story from scattered links | LOCK for Artists',
    description:
      'LOCK helps you turn shows, links, media and source context into a Passport you can proudly send before booking. No scores. No rankings. You control what goes public.',
  },
  hero: {
    // Entity-model audit 2026-07-14: solo / band / collective — an Act can be
    // a person or a group; each Act carries its own Passport.
    eyebrow: 'For artists — solo, band or collective',
    h1: 'Stop rebuilding your story from scattered links.',
    body: 'LOCK helps you turn shows, links, media and source context into a Passport you can proudly send before booking. Your Act can be a solo project, a band or a collective — each Act carries its own Passport.',
    primaryCta: { label: 'Start free in the pilot', href: SIGNUP },
    secondaryCta: { label: 'See sample Passport', href: '/passport/demo' },
    trustLine: 'No scores. No rankings. Artist controls what goes public.',
    imageAlt:
      'Artist career workspace — an artist shaping their own story in a calm private space',
    badge: {
      methodLabel: 'Artist controls publication',
      explanation: 'Nothing goes public until you approve it — your Radar stays private.',
    },
    microStep: 'Start with one link',
    radarCard: {
      label: 'Radar · Private',
      rows: ['Shows', 'Links', 'Sources'],
    },
  },
  miniFlow: {
    eyebrow: 'One link in, one Passport out',
    chips: ['One link', 'Radar', 'Passport', 'Share'],
  },
  tension: {
    eyebrow: 'You know this feeling',
    title: 'Your story deserves better than scattered links.',
    cards: [
      {
        title: 'The manager loved your mix. Then — silence.',
        body: 'A link shows you exist. It says nothing about what happens when you’re actually in the room.',
      },
      {
        title: 'Forty real nights, invisible to every room you haven’t played.',
        body: 'Your live history lives in WhatsApp threads and other people’s memories.',
      },
      {
        title: 'They’ve stopped believing EPKs. You can’t blame them.',
        body: 'A polished bio is your word for it. The rooms you want next need someone else’s word too.',
      },
    ],
  },
  products: {
    eyebrow: 'What you get',
    title: 'A private Radar. A public Passport. You decide what moves between them.',
    radar: {
      label: 'Private',
      title: 'Your private Radar',
      body: 'Everything you add stays yours — organized, dated and labelled, visible only to you.',
      features: [
        'Every night you’ve played, gathered in one place',
        'A clear picture of what to build next — no guesswork',
        'One-tap links to bring a source in to confirm a detail',
        'Private by default. Nothing moves without your OK',
      ],
    },
    passport: {
      label: 'Public',
      title: 'Your public Passport',
      body: 'Only what you approved — method-labelled, dated, and readable in two minutes before the call.',
      features: [
        'Only what you chose to publish — with how it was checked, in plain sight',
        'Every detail carries its source and date, so it reads fresh',
        'One link that works for clubs, events and private clients alike',
        'Always free for booking people to open',
      ],
      methodChips: ['Source-linked', 'Evidence-supported', 'Artist-declared'],
    },
  },
  flow: {
    eyebrow: 'How it works',
    title: 'Four steps. You stay in control of every one.',
    steps: [
      {
        verb: 'Log it.',
        body: 'Your gigs, your numbers, your story — private in your Radar until you say otherwise.',
        icon: 'add',
      },
      {
        verb: 'Invite.',
        body: 'One WhatsApp message to the producer who ran your night. They confirm it in a tap.',
        icon: 'source',
      },
      {
        verb: 'We check.',
        body: 'Every claim gets a proper look before it goes anywhere near your Passport.',
        icon: 'review',
      },
      {
        verb: 'Share.',
        body: 'One link, sent before the call. Your best nights, standing on their own.',
        icon: 'share',
      },
    ],
  },
  finalCta: {
    title: 'Your sets fill rooms. Now fill the calendar.',
    body: 'Free during the pilot — and your Passport is always yours.',
    primaryCta: { label: 'Build my first Passport', href: SIGNUP },
    secondaryLink: { label: 'See sample Passport', href: '/passport/demo' },
  },
}

const he: ArtistsContent = {
  meta: {
    title: 'הופעות, לינקים ומקורות — מסודרים לפספורט שאפשר לשלוח לפני בוקינג | LOCK',
    description:
      'LOCK עוזרת לך להבין מה כבר קיים סביבך כאמן, מה כדאי לשפר, ומה מתאים להראות החוצה. בלי ציונים, בלי דירוגים, ובלי להפוך את הקריירה שלך לטבלה.',
  },
  hero: {
    eyebrow: 'לאמנים',
    h1: 'הופעות, לינקים ומקורות — מסודרים לפספורט שאפשר לשלוח לפני בוקינג.',
    body: 'LOCK עוזרת לך להבין מה כבר קיים סביבך כאמן, מה כדאי לשפר, ומה מתאים להראות החוצה. בלי ציונים, בלי דירוגים, ובלי להפוך את הקריירה שלך לטבלה.',
    primaryCta: { label: 'להתחיל בפיילוט החינמי', href: SIGNUP },
    secondaryCta: { label: 'לראות פספורט לדוגמה', href: '/passport/demo' },
    trustLine: 'בלי ציון. בלי דירוג. בלי לחשוף חולשות. האמן בוחר מה יוצא החוצה.',
    imageAlt: TODO_HE,
    badge: {
      methodLabel: 'האמן בוחר מה יוצא החוצה.',
      explanation: TODO_HE,
    },
    microStep: TODO_HE,
    radarCard: {
      label: 'רדאר · פרטי',
      rows: ['הופעות', 'לינקים', 'מקורות'],
    },
  },
  miniFlow: {
    eyebrow: TODO_HE,
    chips: ['לינק אחד', 'רדאר', 'פספורט', 'לשלוח פספורט'],
  },
  tension: {
    eyebrow: TODO_HE,
    title: TODO_HE,
    cards: [
      {
        title: 'מישהו אהב את המיקס שלך. ואז זה נעלם בשיחה.',
        body: 'לינק מראה שאתה קיים. הוא לא תמיד מסביר מה קורה כשאתה באמת בתוך החדר.',
      },
      {
        title: 'עשרות הופעות אמיתיות, ועדיין כמעט בלתי נראות למקומות שעוד לא מכירים אותך.',
        body: 'הרבה מהקריירה שלך חיה בוואטסאפ, בזיכרונות של אנשים ובלינקים מפוזרים.',
      },
      {
        title: 'אנשים כבר לא מאמינים לכל EPK נוצץ. אפשר להבין אותם.',
        body: 'ביוגרפיה יפה היא התחלה. אבל לפעמים צריך גם הקשר, מקור ומישהו שהיה שם.',
      },
    ],
  },
  products: {
    eyebrow: TODO_HE,
    title: TODO_HE,
    radar: {
      label: TODO_HE,
      title: TODO_HE,
      body: 'הופעות, לינקים, תיעוד, קהל וסיפור מקצועי — נשארים ברדאר הפרטי עד שבוחרים מה להציג.',
      features: [TODO_HE, TODO_HE, TODO_HE, TODO_HE],
    },
    passport: {
      label: TODO_HE,
      title: TODO_HE,
      body: 'לינק אחד לפני השיחה — שמציג אותך בצורה ברורה, מקצועית ובטוחה יותר.',
      features: [TODO_HE, TODO_HE, TODO_HE, TODO_HE],
      methodChips: ['Source-linked', 'Evidence-supported', 'Artist-declared'],
    },
  },
  flow: {
    eyebrow: 'איך זה עובד',
    title: TODO_HE,
    steps: [
      {
        verb: 'מוסיפים אותות קיימים',
        body: 'הופעות, לינקים, תיעוד, קהל וסיפור מקצועי — נשארים ברדאר הפרטי עד שבוחרים מה להציג.',
        icon: 'add',
      },
      {
        verb: 'מבקשים חיזוק ממקור',
        body: 'שולחים קישור קצר למי שהיה שם ויכול לאשר נקודת מידע אחת.',
        icon: 'source',
      },
      {
        verb: 'מסדרים ומסמנים',
        body: 'כל פרט מקבל הקשר לפני שהוא מתקרב לפספורט הציבורי.',
        icon: 'review',
      },
      {
        verb: 'שולחים פספורט',
        body: 'לינק אחד לפני השיחה — שמציג אותך בצורה ברורה, מקצועית ובטוחה יותר.',
        icon: 'share',
      },
    ],
  },
  finalCta: {
    title: 'הסטים שלך כבר מזיזים חדרים. עכשיו צריך שיבינו את זה מהר יותר.',
    body: TODO_HE,
    primaryCta: { label: 'לבנות פספורט ראשון', href: SIGNUP },
    secondaryLink: { label: 'לראות פספורט לדוגמה', href: '/passport/demo' },
  },
}

export const artistsContent: Record<'en' | 'he', ArtistsContent> = { en, he }
