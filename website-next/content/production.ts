// Production page content — EN from the Codex rebuild brief §5.5 (2026-07-14),
// HE verbatim from the Codex HE copy pack (05_PRODUCTION_HE_COPY_20260714).
// Audience: production office / event production team — NOT the source
// confirmer (that is /producers). Firewall: "under review" = reading context,
// never a ranking implication; no score/rank/percentile language anywhere.
// Missing HE strings carry the TODO_HE marker — do not improvise Hebrew.

import { APP_URL } from '@/lib/app-url'
import type { IconId } from '@/components/marketing/icons'
import {
  TODO_HE,
  type CardContent,
  type FinalCtaContent,
  type HeroContent,
  type SectionHeadingContent,
} from './types'

export type RequestStatus = 'sent' | 'answered' | 'closed'

export interface ProductionContent {
  meta: { title: string; description: string }
  hero: HeroContent & {
    /** Event-lineup overlay card on the hero image (brief §5.5 Add).
     *  Wording stays method-safe: review = reading context, never a rank. */
    eventCard: {
      label: string
      event: string
      slot: string
      review: string
      footnote: string
    }
  }
  /** §5.5 section 1 — before commitment: fit / reliability / source context. */
  before: SectionHeadingContent & {
    cards: CardContent[]
    /** "Read an artist’s method-labeled Passport before you lock the slot." */
    note: string
  }
  /** §5.5 section 2 — requests inbox with sent / answered / closed chips. */
  inbox: SectionHeadingContent & {
    note: string
    panelLabel: string
    statusLabels: Record<RequestStatus, string>
    rows: { artist: string; request: string; status: RequestStatus }[]
  }
  /** §5.5 section 3 — lineup workspace: team + events + artists. */
  workspace: SectionHeadingContent & {
    /** Brief §5.5 Remove: no default screen that opens only on "Team". */
    note: string
    /**
     * Entity-model audit 2026-07-14 "Production page, add", EN+HE verbatim:
     * freelancer / crew / company are the same Production family at
     * different scale — the workspace grows, the entity stays Production.
     */
    scaleNote: string
    cards: { icon: IconId; title: string; body: string }[]
  }
  finalCta: FinalCtaContent
}

const SIGNUP = `${APP_URL}/signup`

const en: ProductionContent = {
  meta: {
    title: 'For Production Teams — Build Lineups With Clearer Artist Context | LOCK',
    description:
      'LOCK gives production teams a clearer read on fit, availability and source-backed context before the lineup becomes a promise. Join the production beta.',
  },
  hero: {
    // Entity-model audit: freelancer / crew / company — one Production family.
    eyebrow: 'For production teams — freelancer, crew or company',
    h1: 'Build the lineup without booking in the dark.',
    body: 'LOCK gives production teams a clearer read on fit, availability and source-backed context before the lineup becomes a promise.',
    primaryCta: { label: 'Join production beta', href: SIGNUP },
    secondaryCta: { label: 'Register production interest', href: '/contact' },
    trustLine: '',
    imageAlt:
      'Production warehouse — an event team preparing a stage build before doors',
    eventCard: {
      label: 'Lineup · Event view',
      event: 'Event: Friday night',
      slot: 'Slot open',
      review: '3 artists under review',
      footnote: 'Review = reading context. No order, no rank.',
    },
  },
  before: {
    eyebrow: 'Before commitment',
    title: 'Know what you are putting on stage before you commit.',
    body: 'Every slot is a promise to the audience, the client and the name on the production.',
    cards: [
      {
        title: 'Fit for the room.',
        body: 'Genre, set style and the kind of night the artist actually creates — before the slot is locked.',
      },
      {
        title: 'Reliability you can read.',
        body: 'Past shows, source-backed history and availability cues shown plainly — never as a score.',
      },
      {
        title: 'Source-backed claims, not popularity guesses.',
        body: 'Every claim carries how it was sourced, so your team knows what it can lean on.',
      },
    ],
    note: 'Read an artist’s method-labeled Passport before you lock the slot.',
  },
  inbox: {
    eyebrow: 'Requests inbox',
    title: 'Requests and replies in one place.',
    body: 'Availability requests your office sends, and the artists’ replies, live in one inbox.',
    note: 'No more digging through old messages while the production clock is already running.',
    panelLabel: 'Requests · This month',
    statusLabels: { sent: 'Sent', answered: 'Answered', closed: 'Closed' },
    rows: [
      { artist: 'Maya Oren', request: 'Availability · Fri 24 Apr', status: 'answered' },
      { artist: 'Asaf Levi', request: 'Availability · Sat 2 May', status: 'sent' },
      { artist: 'Noa Peled', request: 'Hold confirmed · Fri 24 Apr', status: 'closed' },
    ],
  },
  workspace: {
    eyebrow: 'Lineup workspace',
    title: 'One place for the lineup, the requests and the artist context.',
    body: 'Everyone on the production works from the same lineup, the same requests and the same artist context.',
    note: 'Events first — the workspace opens on the lineup, not on team admin.',
    // Entity-model audit 2026-07-14 — EN verbatim.
    scaleNote:
      'Built for a freelance production lead, a crew or a formal production company. The workspace grows with the team; the entity stays Production.',
    cards: [
      {
        icon: 'production',
        title: 'Events',
        body: 'Every event with its slots, holds and open questions — the lineup is the home screen.',
      },
      {
        icon: 'artist',
        title: 'Artists',
        body: 'Every artist under consideration, with their Passport context one tap away.',
      },
      {
        icon: 'manager',
        title: 'Team',
        body: 'Your office in one place, so nobody re-asks what a colleague already knows.',
      },
    ],
  },
  finalCta: {
    title: 'Protect the next lineup with context your team can actually use.',
    body: 'The production workspace is in closed beta for teams who want fewer blind spots before commitment.',
    primaryCta: { label: 'Join production beta', href: SIGNUP },
    secondaryLink: { label: 'See Passport example', href: '/passport/demo' },
  },
}

const he: ProductionContent = {
  meta: {
    title: 'למשרדי הפקה — לבנות ליינאפים עם יותר הקשר ופחות ניחושים | LOCK',
    description:
      'LOCK עוזרת למשרד הפקה להבין התאמה, זמינות, מקורות וסימני אמון סביב אמנים — כדי לבנות ליינאפ עם פחות ניחושים ופחות פיזור בין הודעות.',
  },
  hero: {
    eyebrow: 'למשרדי הפקה',
    h1: 'ליינאפ טוב מתחיל לפני הסגירה — כשההקשר ברור.',
    body: 'LOCK עוזרת למשרד הפקה להבין התאמה, זמינות, מקורות וסימני אמון סביב אמנים — כדי לבנות ליינאפ עם פחות ניחושים ופחות פיזור בין הודעות.',
    primaryCta: { label: 'להצטרף לבטא למשרדי הפקה', href: SIGNUP },
    secondaryCta: { label: 'לרשום עניין למשרד הפקה', href: '/contact' },
    trustLine: TODO_HE,
    imageAlt: TODO_HE,
    eventCard: {
      label: TODO_HE,
      event: TODO_HE,
      slot: TODO_HE,
      review: TODO_HE,
      footnote: TODO_HE,
    },
  },
  before: {
    eyebrow: TODO_HE,
    title: 'הקשר על האמן לפני שמתחייבים',
    body: 'כל שיבוץ בליינאפ הוא הבטחה לקהל ולשם של ההפקה.',
    cards: [
      { title: TODO_HE, body: TODO_HE },
      { title: TODO_HE, body: TODO_HE },
      {
        title: 'הקשר ממקורות, לא ניחוש לפי הייפ',
        body: 'כל נקודת מידע בפספורט מגיעה עם שיטת מקור ותאריך בדיקה.',
      },
    ],
    note: 'לפני שסוגרים אמן, אפשר לפתוח פספורט שמסביר מה ידוע, מאיפה זה מגיע ומה מתאים לבדוק.',
  },
  inbox: {
    eyebrow: TODO_HE,
    title: 'בקשות ותשובות במקום אחד',
    body: 'בקשות זמינות שהמשרד שולח ותשובות מאמנים מרוכזות במקום אחד, עם סטטוס ברור.',
    note: 'פחות חפירות בוואטסאפ לפני אירוע.',
    panelLabel: TODO_HE,
    statusLabels: { sent: TODO_HE, answered: TODO_HE, closed: TODO_HE },
    rows: [
      { artist: TODO_HE, request: TODO_HE, status: 'answered' },
      { artist: TODO_HE, request: TODO_HE, status: 'sent' },
      { artist: TODO_HE, request: TODO_HE, status: 'closed' },
    ],
  },
  workspace: {
    eyebrow: TODO_HE,
    title: TODO_HE,
    body: TODO_HE,
    note: TODO_HE,
    // Entity-model audit 2026-07-14 — HE verbatim.
    scaleNote: 'מתאים למפיק עצמאי, לצוות הפקה או לחברת הפקה. המרחב גדל עם הצוות; הישות נשארת הפקה.',
    cards: [
      { icon: 'production', title: TODO_HE, body: TODO_HE },
      { icon: 'artist', title: TODO_HE, body: TODO_HE },
      { icon: 'manager', title: TODO_HE, body: TODO_HE },
    ],
  },
  finalCta: {
    title: TODO_HE,
    body: 'מרחב ההפקה נמצא בבטא סגורה.',
    primaryCta: { label: 'להצטרף לבטא למשרדי הפקה', href: SIGNUP },
    secondaryLink: { label: 'לראות פספורט לדוגמה', href: '/passport/demo' },
  },
}

export const productionContent: Record<'en' | 'he', ProductionContent> = { en, he }
