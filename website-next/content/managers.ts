// Managers page content — EN from the Codex rebuild brief §5.3 (2026-07-14),
// HE verbatim from the Codex HE copy pack (03_MANAGERS_HE_COPY_20260714),
// broadened to the Representation family per the Codex entity-model ruling
// (CODEX_ENTITY_MODEL_AND_SITE_MESSAGING_AUDIT_20260714): the nav label stays
// "Representation", and the page speaks to managers, booking agents and artist-side
// teams — individual rep, small team and agency are the same Representation
// family at different scale (see `representation` section, audit verbatim).
// Audience: the artist-side אמרגן / משרד אמרגנות — that term is CORRECT here
// (and ONLY here). Never the buyer (מזמין הופעות).
// Psychology: roster leverage — next actions, never a grade.
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

export interface ManagersContent {
  meta: { title: string; description: string }
  hero: HeroContent & {
    /** Floating roster mini-card on the hero image (brief §5.3 hero right). */
    rosterCard: {
      label: string
      rows: { name: string; status: string }[]
    }
  }
  /** §5.3 section 1 — roster pain: scattered links, uneven readiness, follow-up gaps. */
  pain: SectionHeadingContent & { cards: CardContent[] }
  /** §5.3 section 2 — roster cockpit: artist cards with ONE next action. */
  cockpit: SectionHeadingContent & {
    /** "You always know which act is ready to pitch…" */
    note: string
    actionLabel: string
    readyLabel: string
    cards: { name: string; tag: string; ready: boolean; action: string }[]
  }
  /** §5.3 section 3 — ArtistAccess: grant, not ownership (+ small diagram). */
  access: SectionHeadingContent & {
    diagram: { title: string; body: string; icon: IconId }[]
    trustCard: { methodLabel: string; explanation: string }
  }
  /**
   * Representation-family section — entity-model audit 2026-07-14 "Required
   * site copy additions / Managers page", EN+HE verbatim: one representation
   * workspace for an individual rep, a booking agent, a small team or a full
   * agency; roles are separate from the organization.
   */
  representation: { title: string; body: string }
  /** §5.3 section 4 — one reaction inbox. */
  inbox: SectionHeadingContent & {
    panelLabel: string
    rows: { artist: string; reaction: string; when: string }[]
  }
  finalCta: FinalCtaContent
}

const SIGNUP = `${APP_URL}/signup`

const en: ManagersContent = {
  meta: {
    title: 'For Representation, Booking Agents & Artist-Side Teams — Make Every Roster Pitch Easier to Trust | LOCK',
    description:
      'LOCK helps artist-side representation turn scattered artist context into a clear Passport bookers and clients can trust before the first serious call. Grant, not ownership. Join the representation beta.',
  },
  hero: {
    eyebrow: 'For representation, booking agents and artist-side teams',
    h1: 'Make every artist on your roster easier to believe in.',
    body: 'LOCK helps artist-side representation turn scattered artist context into a clear Passport bookers and clients can trust before the first serious call.',
    primaryCta: { label: 'Join representation beta', href: SIGNUP },
    secondaryCta: { label: 'Register roster interest', href: '/contact' },
    trustLine: '',
    imageAlt:
      'Agency roster room — a manager reviewing roster context in a calm office',
    rosterCard: {
      label: 'Roster · Next actions',
      rows: [
        { name: 'Maya Oren', status: 'Ready to pitch' },
        { name: 'Asaf Levi', status: 'One next action' },
        { name: 'Noa Peled', status: 'One next action' },
      ],
    },
  },
  pain: {
    eyebrow: 'The pressure behind every pitch',
    title: 'Your roster has momentum. The story around it is still scattered.',
    cards: [
      {
        title: 'Scattered links.',
        body: 'Every pitch starts with hunting — a bio in one folder, clips in another chat, the real context in someone’s memory.',
      },
      {
        title: 'Uneven readiness.',
        body: 'Some acts are one detail away from a stronger pitch. Some are ready now. The office needs to see the difference fast.',
      },
      {
        title: 'Booker follow-up gaps.',
        body: 'A booker or private client reacts, asks a question, forwards the link — and the moment gets lost inside five different threads.',
      },
    ],
  },
  cockpit: {
    eyebrow: 'Roster cockpit',
    title: 'Roster clarity without ranking artists.',
    body: 'See what would make each artist easier to pitch next — as one clear action, never as a grade.',
    note: 'You always know which act is ready to pitch and what would make the next one ready.',
    actionLabel: 'Next action',
    readyLabel: 'Ready to pitch',
    cards: [
      {
        name: 'Maya Oren',
        tag: 'Melodic techno · Tel Aviv',
        ready: true,
        action: 'Passport ready — share it before Friday’s call.',
      },
      {
        name: 'Asaf Levi',
        tag: 'Live electronic',
        ready: false,
        action: 'Invite the producer of the 12 Jun club night to confirm it.',
      },
      {
        name: 'Noa Peled',
        tag: 'Open-format DJ',
        ready: false,
        action: 'Approve two media tiles for the public Passport.',
      },
    ],
  },
  access: {
    eyebrow: 'ArtistAccess',
    title: 'ArtistAccess — a consented grant, not ownership.',
    body: 'Artists grant your office scoped access to their Passport. The identity stays theirs; your team gets a cleaner way to open doors.',
    diagram: [
      {
        title: 'Artist owns identity',
        body: 'The Passport, the evidence and the final say stay with the artist.',
        icon: 'artist',
      },
      {
        title: 'Manager gets scoped access',
        body: 'Your office pitches with the Passport through a visible, revocable grant.',
        icon: 'manager',
      },
      {
        title: 'Booker sees Passport',
        body: 'One clean, method-labelled page with a trust card — never a grade.',
        icon: 'buyer',
      },
    ],
    trustCard: {
      methodLabel: 'Grant, not ownership',
      explanation: 'Every grant is visible, revocable and honest.',
    },
  },
  // Entity-model audit 2026-07-14 — EN verbatim.
  representation: {
    title: 'One representation workspace, whether you are one trusted person or a full agency.',
    body: 'LOCK separates the organization from the roles inside it: manager, booking agent, coordinator, territory contact or admin. One person can hold several roles; a larger office can split them safely.',
  },
  inbox: {
    eyebrow: 'One inbox',
    title: 'One inbox for Passport reactions.',
    body: 'Every buyer reaction to a roster artist’s Passport lands in one place.',
    panelLabel: 'Reactions · Roster',
    rows: [
      {
        artist: 'Maya Oren',
        reaction: 'A booking manager opened the Passport and asked about April availability.',
        when: 'Today',
      },
      {
        artist: 'Asaf Levi',
        reaction: 'An event producer viewed the Passport ahead of a Friday-night slot.',
        when: 'Yesterday',
      },
      {
        artist: 'Noa Peled',
        reaction: 'A private client asked for a call after reading the Passport.',
        when: 'This week',
      },
    ],
  },
  finalCta: {
    title: 'Give your roster a cleaner way into the next room.',
    body: 'The manager workspace is in closed beta for teams who want every pitch to feel sharper, calmer and easier to trust.',
    primaryCta: { label: 'Join manager beta', href: SIGNUP },
    secondaryLink: { label: 'See how artists use LOCK', href: '/artists' },
  },
}

const he: ManagersContent = {
  meta: {
    title: 'למנהלי אמנים ומשרדי אמרגנות — להפוך כל פנייה של רוסטר לברורה יותר | LOCK',
    description:
      'LOCK עוזרת למשרד אמרגנות להבין איזה אמן מוכן לפנייה, מה חסר כדי לחזק את הבא, ואיך לשלוח פספורט שמזמין הופעות יכול להבין מהר.',
  },
  hero: {
    // Representation family — the three terms are the audit's "Recommended HE"
    // list verbatim (מנהלי אמנים · נציגי אמן · משרדי אמרגנות), joined as a list.
    eyebrow: 'למנהלי אמנים, נציגי אמן ומשרדי אמרגנות',
    h1: 'רוסטר חזק צריך יותר מלינקים. הוא צריך הקשר שאפשר לשלוח.',
    body: 'LOCK עוזרת למשרד אמרגנות להבין איזה אמן מוכן לפנייה, מה חסר כדי לחזק את הבא, ואיך לשלוח פספורט שמזמין הופעות יכול להבין מהר.',
    primaryCta: { label: 'להצטרף לבטא למשרדי אמרגנות', href: SIGNUP },
    secondaryCta: { label: 'לרשום עניין לרוסטר', href: '/contact' },
    trustLine: 'להציג כל אמן ברוסטר עם יותר הקשר ופחות ניחושים',
    imageAlt: TODO_HE,
    rosterCard: {
      label: TODO_HE,
      rows: [
        { name: TODO_HE, status: TODO_HE },
        { name: TODO_HE, status: TODO_HE },
        { name: TODO_HE, status: TODO_HE },
      ],
    },
  },
  pain: {
    eyebrow: TODO_HE,
    title: TODO_HE,
    cards: [
      { title: TODO_HE, body: TODO_HE },
      { title: TODO_HE, body: TODO_HE },
      { title: TODO_HE, body: TODO_HE },
    ],
  },
  cockpit: {
    eyebrow: TODO_HE,
    title: 'מוכנות רוסטר בלי דירוגים',
    body: 'לראות מה יעזור לכל אמן ברוסטר להתקדם — כפעולות הבאות, לא כציון.',
    note: 'להבין איזה אקט מוכן לשליחה, ומה חסר כדי להפוך את הבא למוכן יותר.',
    actionLabel: TODO_HE,
    readyLabel: TODO_HE,
    cards: [
      { name: TODO_HE, tag: TODO_HE, ready: true, action: TODO_HE },
      { name: TODO_HE, tag: TODO_HE, ready: false, action: TODO_HE },
      { name: TODO_HE, tag: TODO_HE, ready: false, action: TODO_HE },
    ],
  },
  access: {
    eyebrow: 'ArtistAccess',
    title: 'ArtistAccess — הרשאה בהסכמה, לא בעלות',
    body: 'האמן נותן למשרד גישה מוגדרת לפספורט שלו. הזהות נשארת של האמן; יכולת ההצגה המקצועית מתחזקת אצלכם.',
    diagram: [
      { title: TODO_HE, body: TODO_HE, icon: 'artist' },
      { title: TODO_HE, body: TODO_HE, icon: 'manager' },
      { title: TODO_HE, body: TODO_HE, icon: 'buyer' },
    ],
    trustCard: {
      methodLabel: 'הרשאה בהסכמה, לא בעלות',
      explanation: 'כל הרשאה גלויה, ניתנת לביטול וברורה לשני הצדדים.',
    },
  },
  // Entity-model audit 2026-07-14 — HE verbatim.
  representation: {
    title: 'מרחב ייצוג אחד — בין אם זה אדם אחד שמלווה אמן ובין אם זה משרד אמרגנות מלא.',
    body: 'LOCK מפרידה בין הארגון לבין התפקידים שבתוכו: מנהל אמן, בוקינג, רכז רוסטר, איש קשר טריטוריאלי או אדמין. באדם אחד יכולים להיות כמה תפקידים; במשרד גדול אפשר לחלק אותם בצורה מסודרת.',
  },
  inbox: {
    eyebrow: TODO_HE,
    title: 'מקום אחד לתגובות על פספורטים',
    body: 'כל תגובה ממזמין הופעות לפספורט של אמן ברוסטר מגיעה למקום אחד.',
    panelLabel: TODO_HE,
    rows: [
      { artist: TODO_HE, reaction: TODO_HE, when: TODO_HE },
      { artist: TODO_HE, reaction: TODO_HE, when: TODO_HE },
      { artist: TODO_HE, reaction: TODO_HE, when: TODO_HE },
    ],
  },
  finalCta: {
    title: TODO_HE,
    body: 'מרחב מנהלי האמנים נמצא בבטא סגורה.',
    primaryCta: { label: 'להצטרף לבטא למשרדי אמרגנות', href: SIGNUP },
    secondaryLink: { label: 'לראות איך זה עובד לאמנים', href: '/artists' },
  },
}

export const managersContent: Record<'en' | 'he', ManagersContent> = { en, he }
