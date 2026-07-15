// Passport demo content — rebuilt per Codex rebuild brief §6 (2026-07-14).
// The demo SELLS ARTIST PRESENCE FIRST, then trust context. Emphasis order:
// identity → genre/event fit → media/atmosphere → trust context → evidence
// rows — NOT the reverse.
//
// Sample artist: Shidapu (Roy Sason) — imagery copied from Drive into
// public/brand/artist-types/. All figures are demo data for illustration.
//
// Firewall (absolute): the demo shows BANDS + BINARIES with method labels
// ONLY — never a count, percentile, score, rank or prediction.
// HE strings come verbatim from the Codex HE copy pack where covered;
// everything else carries TODO_HE — never improvised Hebrew.

import { TODO_HE, type Cta } from './types'

export interface PassportDemoContent {
  meta: { title: string; description: string }
  /** Top sample-disclaimer banner. */
  banner: string
  hero: {
    /** Scene tag, e.g. "PSYTRANCE · TEL AVIV" (brief §6 hero left). */
    sceneTag: string
    name: string
    /** 1-line positioning. */
    positioning: string
    genrePills: string[]
    /** One-line fit statement (mobile wireframe, brief §6). */
    fitLine: string
    primaryCta: Cta // Check availability
    secondaryCta: Cta // Share Passport
    imageAlt: string
    portraitAlt: string
  }
  /** Radar universe strip — 6 source icons, trust context (brief §6). */
  radarStrip: {
    eyebrow: string
    caption: string
    sources: { label: string; kind: 'ticketing' | 'social' | 'audio' }[]
  }
  /** Media tiles 3–6 (performance, crowd, setup, social/source). */
  media: {
    eyebrow: string
    note: string
    tiles: { src: string; alt: string; label: string }[]
  }
  /** Strongest signals — 3–5 cards ONLY (brief §6). */
  signals: {
    eyebrow: string
    title: string
    note: string
    cards: { method: string; reviewed: string; claim: string; context: string }[]
  }
  /** Method-labels explanation. */
  method: {
    eyebrow: string
    title: string
    body: string
    items: { chip: string; explanation: string }[]
  }
  /** Footer / firewall disclaimer. */
  footer: { disclaimer: string; brand: string }
  /** Build-your-own band under the Passport. */
  build: { label: string; body: string; cta: Cta }
}

const en: PassportDemoContent = {
  meta: {
    title: 'Shidapu — Sample Passport | LOCK',
    description:
      'A sample LOCK Passport. Artist presence first, then method-labelled trust context. Draw shown as bands — no score, no ranking, no prediction.',
  },
  banner: 'SAMPLE PASSPORT — DEMO DATA FOR ILLUSTRATION ONLY',
  hero: {
    sceneTag: 'PSYTRANCE · TEL AVIV',
    name: 'Shidapu',
    positioning:
      'Goa-rooted psytrance live act — dancefloors from Tel Aviv club nights to open-air festival stages.',
    genrePills: ['Psytrance', 'Goa trance', 'Live electronic', 'Clubs', 'Festivals'],
    fitLine: 'Fits club nights, festival stages and open-air events that want a driving, melodic peak-time set.',
    primaryCta: { label: 'Check availability', href: '/contact' },
    // In a live Passport this copies the public link — the demo links to itself.
    secondaryCta: { label: 'Share Passport', href: '/passport/demo' },
    imageAlt: 'Shidapu performing — open-air psytrance stage at golden hour',
    portraitAlt: 'Shidapu — Roy Sason, official artist portrait',
  },
  radarStrip: {
    eyebrow: 'Radar universe',
    caption:
      'The private Radar gathered this Passport from the artist’s source universe. Every public detail below carries its method label.',
    sources: [
      { label: 'Eventer export', kind: 'ticketing' },
      { label: 'Tickchak export', kind: 'ticketing' },
      { label: 'Ticketmaster IL export', kind: 'ticketing' },
      { label: 'Go-Out export', kind: 'ticketing' },
      { label: 'Instagram profile', kind: 'social' },
      { label: 'SoundCloud profile', kind: 'audio' },
    ],
  },
  media: {
    eyebrow: 'On stage',
    note: 'Demo imagery — a real Passport shows only artist-approved photo and video.',
    tiles: [
      {
        src: '/brand/artist-types/lockshow-artist-shidapu-goa-atmosphere-hero-v1.webp',
        alt: 'Open-air psytrance stage — crowd at golden hour',
        label: 'Performance',
      },
      {
        src: '/brand/artist-types/lockshow-artist-shidapu-roy-sason-profile-official-v1.jpg',
        alt: 'Shidapu — Roy Sason, official portrait',
        label: 'Portrait',
      },
      {
        src: '/brand/lockshow-atmosphere-artist-career-workspace-v1.webp',
        alt: 'Studio and career workspace atmosphere',
        label: 'Studio',
      },
      {
        src: '/brand/lockshow-atmosphere-booker-context-venue-loadin-v1.webp',
        alt: 'Venue load-in before doors',
        label: 'Setup',
      },
    ],
  },
  signals: {
    eyebrow: 'Strongest signals',
    title: 'What stands behind the name',
    note: 'DRAW SHOWN AS A BAND — NEVER AN EXACT FIGURE',
    cards: [
      {
        method: 'SOURCE-CONFIRMED',
        reviewed: 'JUN 2026',
        claim: 'Draw band: 200–400',
        context: 'Headline club night · Tel Aviv — confirmed by the promoter who ran the night.',
      },
      {
        method: 'SOURCE-LINKED',
        reviewed: 'MAY 2026',
        claim: 'Rebooked by the same promoter',
        context: 'Returning festival slot across seasons — listing linked from the ticketing source.',
      },
      {
        method: 'EVIDENCE-SUPPORTED',
        reviewed: 'APR 2026',
        claim: 'Full tech rider available',
        context: 'Stage and monitoring spec on request — live-set hardware, self-contained.',
      },
      {
        method: 'ARTIST-DECLARED',
        reviewed: 'JUN 2026',
        claim: 'Plays club sets and festival stages',
        context: 'Set formats declared by the artist — club night, open-air, festival peak-time.',
      },
    ],
  },
  method: {
    eyebrow: 'How to read this page',
    title: 'Every detail tells you how it was checked.',
    body: 'A Passport never shows a score, a rank or a prediction. Each line carries a method label — so you always know what a claim is worth, and the decision stays yours.',
    items: [
      {
        chip: 'Source-linked',
        explanation: 'Linked directly from a public platform or listing — you can follow it.',
      },
      {
        chip: 'Evidence-supported',
        explanation: 'Backed by a document or record reviewed before publication.',
      },
      {
        chip: 'Source-confirmed',
        explanation: 'Confirmed by a person who ran or hosted the night — one tap, no account.',
      },
      {
        chip: 'Artist-declared',
        explanation: 'The artist’s own word — clearly marked as such, never dressed up.',
      },
    ],
  },
  footer: {
    disclaimer:
      'THIS PASSPORT SHOWS APPROVED CONTEXT ONLY. NO SCORE · NO RANKING · NO PREDICTION · NO GUARANTEE. AUDIENCE DRAW APPEARS AS A BAND — NEVER AN EXACT FIGURE. EVERY CLAIM CARRIES ITS METHOD LABEL AND DATE.',
    brand: 'LOCK · lock.show',
  },
  build: {
    label: 'READY TO BUILD YOURS?',
    body: 'Turn your own nights into a Passport like this one — free during the pilot, and you control what goes public.',
    cta: { label: 'Build your Passport', href: '/artists' },
  },
}

// HE fills below are VERBATIM from CODEX_CANDIDATE_B169265_DESIGN_QA_HE_TODO
// _20260714 §9 ("Passport demo HE copy additions"); strings §9 does not cover
// keep the TODO_HE marker. Method-label chips stay EN — governed chips, and §9
// itself keeps them EN (Source-linked → Source-linked etc.).
const he: PassportDemoContent = {
  meta: {
    // Composed from §9/§10 verbatim terms only: "פספורט לדוגמה" (Passport
    // demo) + the sample-banner and firewall sentences.
    title: 'Shidapu — פספורט לדוגמה | LOCK',
    description:
      'פספורט לדוגמה — נתוני דמו להמחשה בלבד. קהל מוצג כטווח — אף פעם לא כמספר מדויק. פספורט לא מציג ציון, דירוג או תחזית.',
  },
  banner: 'פספורט לדוגמה — נתוני דמו להמחשה בלבד',
  hero: {
    sceneTag: 'פסייטראנס · תל אביב',
    name: 'Shidapu',
    positioning: 'אקט פסייטראנס עם שורשי גואה — ממועדונים בתל אביב ועד במות פתוחות ופסטיבלים.',
    genrePills: ['Psytrance', 'Goa trance', 'Live electronic', 'Clubs', 'Festivals'],
    fitLine: TODO_HE,
    primaryCta: { label: 'לבדוק זמינות', href: '/contact' },
    secondaryCta: { label: 'לשתף פספורט', href: '/passport/demo' },
    imageAlt: TODO_HE,
    portraitAlt: TODO_HE,
  },
  radarStrip: {
    eyebrow: TODO_HE,
    // §9 verbatim — the two caption sentences, in the EN caption's order.
    caption:
      'הרדאר הפרטי אסף את הפספורט הזה מתוך עולם המקורות של האמן. כל פרט ציבורי כאן מגיע עם תווית מקור.',
    sources: [
      { label: 'Eventer export', kind: 'ticketing' },
      { label: 'Tickchak export', kind: 'ticketing' },
      { label: 'Ticketmaster IL export', kind: 'ticketing' },
      { label: 'Go-Out export', kind: 'ticketing' },
      { label: 'Instagram profile', kind: 'social' },
      { label: 'SoundCloud profile', kind: 'audio' },
    ],
  },
  media: {
    eyebrow: 'על הבמה',
    note: TODO_HE,
    tiles: [
      {
        src: '/brand/artist-types/lockshow-artist-shidapu-goa-atmosphere-hero-v1.webp',
        alt: TODO_HE,
        label: 'הופעה',
      },
      {
        src: '/brand/artist-types/lockshow-artist-shidapu-roy-sason-profile-official-v1.jpg',
        alt: TODO_HE,
        label: 'פרופיל',
      },
      {
        src: '/brand/lockshow-atmosphere-artist-career-workspace-v1.webp',
        alt: TODO_HE,
        label: 'סטודיו',
      },
      {
        src: '/brand/lockshow-atmosphere-booker-context-venue-loadin-v1.webp',
        alt: TODO_HE,
        label: 'סטאפ',
      },
    ],
  },
  signals: {
    eyebrow: 'האותות החזקים ביותר',
    title: 'מה עומד מאחורי השם',
    note: 'קהל מוצג כטווח — אף פעם לא כמספר מדויק',
    // Method chips are governed EN chips (HE pack: keep unless localized separately).
    cards: [
      {
        method: 'SOURCE-CONFIRMED',
        reviewed: 'JUN 2026',
        claim: 'טווח קהל: 200–400',
        context: 'ערב מועדון מרכזי · תל אביב — אושר על ידי מי שהפיק את הערב.',
      },
      {
        method: 'SOURCE-LINKED',
        reviewed: 'MAY 2026',
        claim: 'הוזמן שוב על ידי אותו מקור',
        context: 'שיבוץ חוזר בפסטיבל לאורך עונות — עם מקור מקושר.',
      },
      {
        method: 'EVIDENCE-SUPPORTED',
        reviewed: 'APR 2026',
        claim: 'ריידר טכני מלא זמין',
        context: 'מפרט במה ומוניטורינג לפי בקשה — סט לייב עם ציוד עצמאי.',
      },
      {
        method: 'ARTIST-DECLARED',
        reviewed: 'JUN 2026',
        claim: 'מתאים לסטים במועדונים ולבמות פסטיבל',
        context: 'פורמטים שהאמן הצהיר עליהם — מועדון, אופן-אייר ופיק-טיים בפסטיבל.',
      },
    ],
  },
  method: {
    eyebrow: 'איך לקרוא את העמוד הזה',
    title: 'כל פרט מסביר איך הוא נבדק.',
    // §9 covers the firewall sentence; the per-chip explanations stay TODO_HE.
    body: 'פספורט לא מציג ציון, דירוג או תחזית.',
    items: [
      { chip: 'Source-linked', explanation: TODO_HE },
      { chip: 'Evidence-supported', explanation: TODO_HE },
      { chip: 'Source-confirmed', explanation: TODO_HE },
      { chip: 'Artist-declared', explanation: TODO_HE },
    ],
  },
  footer: {
    disclaimer: TODO_HE,
    brand: 'LOCK · lock.show',
  },
  build: {
    label: 'רוצה לבנות פספורט משלך?',
    body: TODO_HE,
    // §9 verbatim "Build your Passport" → לבנות פספורט (supersedes the earlier
    // borrowed artists-pack CTA לבנות פספורט ראשון on this page only).
    cta: { label: 'לבנות פספורט', href: '/artists' },
  },
}

export const passportDemoContent: Record<'en' | 'he', PassportDemoContent> = { en, he }
