// Contact content — EN per the Codex rebuild brief §5.11 (2026-07-14), HE
// verbatim from the Codex HE copy pack (11_CONTACT_HE_COPY_20260714). Missing
// HE strings carry the TODO_HE marker — do not improvise Hebrew.
//
// Brief §5.11: hero "Want to see if LOCK fits your role?" — role selector
// BEFORE the message. Submission mechanics stay EXACTLY the existing ones:
// components/waitlist-form.tsx → Supabase waitlist_signup (migration 026/033).
// The role selector feeds WaitlistForm's supported `presetRole` prop, so each
// value below MUST be one of the DB CHECK tokens (033):
//   artist · booking_manager · artist_manager · production · producer · other
// `?src=` attribution is already handled inside WaitlistForm (source_page).

import { TODO_HE } from './types'

/** waitlist_signup.role CHECK tokens (migration 033) — do not invent values. */
export type WaitlistRole =
  | 'artist'
  | 'booking_manager'
  | 'artist_manager'
  | 'production'
  | 'producer'
  | 'other'

export interface ContactRoleContent {
  /** Value posted as waitlist_signup.role via WaitlistForm presetRole. */
  value: WaitlistRole
  label: string
}

export interface ContactContent {
  meta: { title: string; description: string }
  hero: { eyebrow: string; h1: string; body: string }
  form: {
    heading: string
    rolePrompt: string
    roles: ContactRoleContent[]
    /** Shown until a role is picked (role comes BEFORE the message). */
    pickRoleHint: string
    submitLabel: string
    helper: string
  }
  detailsHeading: string
  details: { label: string; value: string }[]
  finalCta: {
    title: string
    body: string
    ctaLabel: string
  }
}

const en: ContactContent = {
  meta: {
    title: 'Contact — Want to see if LOCK fits your role?',
    description:
      'We are working with artists, representation teams, production teams, bookers and private clients in a free pilot. Tell us who you are and what you are trying to solve — we come back with the next step.',
  },
  hero: {
    eyebrow: 'Contact',
    h1: 'Want to see if LOCK fits your role?',
    body: 'We are working now with artists, representation teams, production teams, bookers and private clients in a free pilot. Tell us who you are and what you are trying to solve, and we will come back with the next step.',
  },
  form: {
    heading: 'Send a message',
    rolePrompt: 'Who are you in relation to LOCK?',
    // Entity-family labels per the Codex entity-model ruling (2026-07-14).
    // LABELS ONLY — the submitted role values stay the migration-033 CHECK
    // tokens exactly as mapped below; never invent or rename a token.
    roles: [
      { value: 'artist', label: 'Artist or Act' },
      { value: 'artist_manager', label: 'Representation (manager/booking agent/agency)' },
      { value: 'production', label: 'Production (freelancer/crew/company)' },
      { value: 'booking_manager', label: 'Performance buyer (professional or private event)' },
      { value: 'producer', label: 'Source confirmer' },
      { value: 'other', label: 'Other' },
    ],
    pickRoleHint: 'Pick your role first — the short form opens right after.',
    submitLabel: 'SEND MESSAGE →',
    helper: 'A sentence or two is enough.',
  },
  detailsHeading: 'Contact info',
  details: [
    { label: 'Stage', value: 'Closed Beta 2026' },
    { label: 'Location', value: 'Tel Aviv, Israel' },
    { label: 'Languages', value: 'Hebrew · English' },
  ],
  finalCta: {
    title: 'Ready to start without waiting?',
    body: 'Registration is open — free for artists during the pilot.',
    ctaLabel: 'Join pilot',
  },
}

const he: ContactContent = {
  meta: {
    title: 'יצירת קשר',
    description:
      'אנחנו עובדים עכשיו עם אמנים, משרדי אמרגנות, משרדי הפקה ומזמיני הופעות בפיילוט חינמי. כתבו לנו מי אתם ומה אתם מנסים לפתור, ונחזור עם הצעד הבא.',
  },
  hero: {
    eyebrow: 'יצירת קשר',
    h1: 'רוצים לבדוק אם LOCK מתאים לכם?',
    body: 'אנחנו עובדים עכשיו עם אמנים, משרדי אמרגנות, משרדי הפקה ומזמיני הופעות בפיילוט חינמי. כתבו לנו מי אתם ומה אתם מנסים לפתור, ונחזור עם הצעד הבא.',
  },
  form: {
    heading: 'דברו איתנו',
    rolePrompt: 'מי אתה ביחס ל-LOCK?',
    roles: [
      { value: 'artist', label: 'אני אמן ורוצה לבנות פספורט ראשון' },
      { value: 'artist_manager', label: 'אני מנהל אמנים או רוסטר' },
      { value: 'production', label: 'אני ממשרד הפקה או מפיק אירועים' },
      { value: 'booking_manager', label: 'אני מזמין הופעות או אירוע פרטי' },
      { value: 'producer', label: 'קיבלתי קישור כמאשר-מקור' },
      { value: 'other', label: 'משהו אחר' },
    ],
    pickRoleHint: TODO_HE,
    submitLabel: 'לשלוח הודעה',
    helper: 'משפט או שניים מספיקים',
  },
  detailsHeading: TODO_HE,
  details: [
    { label: TODO_HE, value: 'בטא סגורה · 2026' },
    { label: 'מיקום', value: 'תל אביב, ישראל' },
    { label: 'שפות', value: 'עברית · אנגלית' },
  ],
  finalCta: {
    title: TODO_HE,
    body: TODO_HE,
    ctaLabel: 'להצטרף לפיילוט החינמי',
  },
}

export const contactContent: Record<'en' | 'he', ContactContent> = { en, he }
