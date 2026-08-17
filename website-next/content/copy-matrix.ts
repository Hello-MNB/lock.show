/**
 * SITE COPY MATRIX — one row per string, all locales side by side.
 *
 * WHY THIS EXISTS (owner brief, 17 Aug 2026): copy must be updatable in several
 * languages SIMULTANEOUSLY, ordered professionally by page → section →
 * component → element, so a marketing edit is one row and never a hunt through
 * JSX. The old shape could not do that: 77 keys in messages/*.json of which only
 * 25 were ever read, while ~446 user-visible strings sat hardcoded in
 * components. Editing a headline meant editing a component.
 *
 * RULES THIS FILE ENFORCES BY SHAPE
 *  1. Every row carries EVERY locale. A missing translation is a type error,
 *     not a silent English fallback in a Hebrew page.
 *  2. `element` is the typographic role (h1/h2/eyebrow/body/cta/label/…), so
 *     hierarchy is data. A designer can read the page structure from this file.
 *  3. `voice: 'marketing'` is the default and 'utility' must be declared. It is
 *     a standing reminder that this is public copy, not UI plumbing text.
 *  4. `note` records the marketing INTENT so a future editor changes the words
 *     without losing the job the line does.
 *  5. `claim` links any line that asserts a capability to a CLAIM-ID. Rows with
 *     a claim cannot be edited casually — see docs/OWNER-PENDING CLAIM-REGISTRY.
 *
 * HOW TO ADD A LANGUAGE: add the code to LOCALES and TypeScript will list every
 * row that still needs it. No component changes.
 */

export const LOCALES = ['en', 'he'] as const
export type CopyLocale = (typeof LOCALES)[number]

export const RTL_LOCALES: CopyLocale[] = ['he']

/** Typographic / functional role. Ordered by visual hierarchy. */
export type CopyElement =
  | 'meta-title' | 'meta-description'
  | 'eyebrow' | 'h1' | 'h2' | 'h3'
  | 'lead' | 'body' | 'caption'
  | 'cta' | 'label' | 'placeholder' | 'option' | 'help' | 'success' | 'error'
  | 'aria' | 'alt'

export interface CopyRow {
  /** Stable id: page.section.component.element — never renamed, only retired. */
  id: string
  page: string
  section: string
  component: string
  element: CopyElement
  /** Marketing by default; 'utility' must be declared deliberately. */
  voice?: 'marketing' | 'utility'
  /** What job this line does. Change the words, keep the job. */
  note?: string
  /** Set when the line asserts a capability, outcome or price. */
  claim?: string
  /** Every locale, side by side. Adding a locale surfaces every gap at once. */
  t: Record<CopyLocale, string>
}

export const COPY: CopyRow[] = [
  // ── CONTACT · HEADER ──────────────────────────────────────────────────────
  { id: 'contact.header.hero.eyebrow', page: 'contact', section: 'header', component: 'Hero', element: 'eyebrow',
    note: 'Sets a human, open tone before the form. Not a claim.',
    t: { en: 'CONTACT · GET IN TOUCH', he: 'צור קשר · דברו איתנו' } },
  { id: 'contact.header.hero.h1', page: 'contact', section: 'header', component: 'Hero', element: 'h1',
    note: 'Invitation, not a support desk. Keep it short enough not to wrap past two lines at 390px.',
    t: { en: 'Questions? Ideas? Collaboration?', he: 'שאלות? רעיונות? שיתוף פעולה?' } },
  { id: 'contact.header.hero.lead', page: 'contact', section: 'header', component: 'Hero', element: 'lead',
    note: 'Promises a reply and names who we want to hear from. No capability claim.',
    t: { en: 'LOCK SHOW is in closed beta. We always want to hear from artists, booking managers, and producers.',
         he: 'LOCK SHOW נמצאת בבטא סגורה. נשמח תמיד לשמוע מאמנים, ממזמיני הופעות וממפיקים.' } },

  // ── CONTACT · CHANNELS ────────────────────────────────────────────────────
  { id: 'contact.channels.block.h2', page: 'contact', section: 'channels', component: 'ChannelList', element: 'h2',
    t: { en: 'Reach us directly', he: 'ליצירת קשר ישירה' } },
  { id: 'contact.channels.whatsapp.cta', page: 'contact', section: 'channels', component: 'ChannelList', element: 'cta',
    note: 'Label only — the phone NUMBER is deliberately never rendered as text.',
    t: { en: 'Message us on WhatsApp', he: 'שלחו הודעה בוואטסאפ' } },
  { id: 'contact.channels.whatsapp.aria', page: 'contact', section: 'channels', component: 'ChannelList', element: 'aria',
    voice: 'utility',
    t: { en: 'Open a WhatsApp conversation with LOCK SHOW', he: 'פתיחת שיחת וואטסאפ עם LOCK SHOW' } },
  { id: 'contact.channels.email.cta', page: 'contact', section: 'channels', component: 'ChannelList', element: 'cta',
    t: { en: 'Email us', he: 'שלחו אימייל' } },
  { id: 'contact.channels.social.h3', page: 'contact', section: 'channels', component: 'SocialLinks', element: 'h3',
    t: { en: 'Follow the work', he: 'עקבו אחרינו' } },
  { id: 'contact.channels.social.aria', page: 'contact', section: 'channels', component: 'SocialLinks', element: 'aria',
    voice: 'utility', note: '{platform} is substituted at render.',
    t: { en: 'LOCK SHOW on {platform} — opens in a new tab', he: 'LOCK SHOW ב{platform} — נפתח בלשונית חדשה' } },

  // ── CONTACT · FORM ────────────────────────────────────────────────────────
  { id: 'contact.form.block.h2', page: 'contact', section: 'form', component: 'ContactForm', element: 'h2',
    t: { en: 'SEND A MESSAGE', he: 'שליחת הודעה' } },
  { id: 'contact.form.block.lead', page: 'contact', section: 'form', component: 'ContactForm', element: 'lead',
    note: 'NEW copy — no live counterpart. Rendered under the SEND A MESSAGE heading.',
    t: { en: 'A few details help us route it to the right person.', he: 'כמה פרטים יעזרו לנו להעביר את הפנייה לאדם הנכון.' } },
  { id: 'contact.form.subject.label', page: 'contact', section: 'form', component: 'ContactForm', element: 'label',
    note: 'Owner request 17 Aug: a subject field, placed FIRST so the rest of the form reads in context.',
    t: { en: 'What is this about?', he: 'במה מדובר?' } },
  { id: 'contact.form.role.label', page: 'contact', section: 'form', component: 'ContactForm', element: 'label',
    t: { en: 'How do you work in live entertainment?', he: 'איך אתם עובדים בתעשיית ההופעות?' } },
  { id: 'contact.form.name.label', page: 'contact', section: 'form', component: 'ContactForm', element: 'label',
    t: { en: 'Name', he: 'שם' } },
  { id: 'contact.form.email.label', page: 'contact', section: 'form', component: 'ContactForm', element: 'label',
    t: { en: 'Email address', he: 'כתובת אימייל' } },
  { id: 'contact.form.message.label', page: 'contact', section: 'form', component: 'ContactForm', element: 'label',
    t: { en: 'Your message', he: 'ההודעה שלכם' } },
  { id: 'contact.form.message.placeholder', page: 'contact', section: 'form', component: 'ContactForm', element: 'placeholder',
    t: { en: 'What would you like us to know?', he: 'מה תרצו שנדע?' } },
  { id: 'contact.form.submit.cta', page: 'contact', section: 'form', component: 'ContactForm', element: 'cta',
    t: { en: 'SEND MESSAGE', he: 'שליחת הודעה' } },
  { id: 'contact.form.sending.cta', page: 'contact', section: 'form', component: 'ContactForm', element: 'cta',
    voice: 'utility', t: { en: 'SENDING…', he: 'שולח…' } },
  { id: 'contact.form.required.help', page: 'contact', section: 'form', component: 'ContactForm', element: 'help',
    voice: 'utility', t: { en: 'required', he: 'שדה חובה' } },
  { id: 'contact.form.optional.help', page: 'contact', section: 'form', component: 'ContactForm', element: 'help',
    voice: 'utility', t: { en: 'optional', he: 'לא חובה' } },
  { id: 'contact.form.success.success', page: 'contact', section: 'form', component: 'ContactForm', element: 'success',
    t: { en: 'Thanks — your message reached us.', he: 'תודה — ההודעה הגיעה אלינו.' } },
  { id: 'contact.form.successBody.body', page: 'contact', section: 'form', component: 'ContactForm', element: 'body',
    note: 'Reply-time expectation. Keep it a range, never a guarantee.',
    t: { en: 'We usually reply within one or two business days.', he: 'בדרך כלל נחזור אליכם תוך יום או יומיים עסקים.' } },
  { id: 'contact.form.duplicate.success', page: 'contact', section: 'form', component: 'ContactForm', element: 'success',
    t: { en: 'We already have your message.', he: 'ההודעה שלכם כבר אצלנו.' } },
  { id: 'contact.form.error.error', page: 'contact', section: 'form', component: 'ContactForm', element: 'error',
    t: { en: 'Something went wrong — your text is still here, please try again.',
         he: 'משהו השתבש — הטקסט שלכם נשמר, נסו שוב.' } },
  { id: 'contact.form.privacy.help', page: 'contact', section: 'form', component: 'ContactForm', element: 'help',
    note: 'Point-of-collection privacy link. {link} is substituted at render.',
    t: { en: 'We use your details only to reply. See our {link}.', he: 'נשתמש בפרטים רק כדי להשיב. ראו את {link} שלנו.' } },
  { id: 'contact.form.privacyLink.label', page: 'contact', section: 'form', component: 'ContactForm', element: 'label',
    t: { en: 'privacy policy', he: 'מדיניות הפרטיות' } },
]

// ── SUBJECT + ROLE VOCABULARIES ────────────────────────────────────────────
// Owner request 17 Aug: add collaboration, media and other relevant roles.
// Kept as data, not JSX, so a new option is one row in every language.

export interface OptionRow { value: string; t: Record<CopyLocale, string> }

export const CONTACT_SUBJECTS: OptionRow[] = [
  { value: 'join_beta',     t: { en: 'Joining the beta',            he: 'הצטרפות לבטא' } },
  { value: 'collaboration', t: { en: 'Collaboration or partnership', he: 'שיתוף פעולה או שותפות' } },
  { value: 'media',         t: { en: 'Media, press or podcast',      he: 'תקשורת, עיתונות או פודקאסט' } },
  { value: 'demo',          t: { en: 'A walkthrough or demo',        he: 'הדגמה או סיור במוצר' } },
  { value: 'support',       t: { en: 'Help with something',          he: 'עזרה בנושא כלשהו' } },
  { value: 'feedback',      t: { en: 'Feedback on the product',      he: 'משוב על המוצר' } },
  { value: 'other',         t: { en: 'Something else',               he: 'משהו אחר' } },
]

export const CONTACT_ROLES: OptionRow[] = [
  { value: 'artist',                  t: { en: 'Artist',                          he: 'אמן/אמנית' } },
  { value: 'representative_agency',   t: { en: 'Artist representative / agency',   he: 'ייצוג אמן / סוכנות' } },
  { value: 'producer_promoter',       t: { en: 'Producer / promoter',              he: 'מפיק / מפיץ' } },
  { value: 'programmer_booker_buyer', t: { en: 'Programmer / booker / buyer',      he: 'מתכנת / מזמין הופעות' } },
  { value: 'venue',                   t: { en: 'Venue',                            he: 'מועדון / אולם' } },
  { value: 'media_press',             t: { en: 'Media / press',                    he: 'תקשורת / עיתונות' } },
  { value: 'partner',                 t: { en: 'Partner / collaborator',           he: 'שותף / משתף פעולה' } },
  { value: 'service_supplier',        t: { en: 'Service or production supplier',    he: 'ספק שירות או הפקה' } },
  { value: 'other',                   t: { en: 'Other',                            he: 'אחר' } },
]

// ── LOOKUP ────────────────────────────────────────────────────────────────
const INDEX: Record<string, CopyRow> = Object.fromEntries(COPY.map((r) => [r.id, r]))

/** Resolve one row. Throws in development on an unknown id — a silent empty
 *  string is how a blank headline reaches production. */
export function t(id: string, locale: CopyLocale, vars?: Record<string, string>): string {
  const row = INDEX[id]
  if (!row) {
    if (process.env.NODE_ENV !== 'production') throw new Error(`copy-matrix: unknown id "${id}"`)
    return ''
  }
  let s = row.t[locale] ?? row.t.en
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v)
  return s
}

export function optionLabel(rows: OptionRow[], value: string, locale: CopyLocale): string {
  return rows.find((r) => r.value === value)?.t[locale] ?? value
}

/** Editorial view: rows grouped page → section → component, in hierarchy order.
 *  This is what makes the file reviewable as a document rather than a blob. */
export function matrixByPage(page: string): CopyRow[] {
  const order: CopyElement[] = ['meta-title','meta-description','eyebrow','h1','h2','h3','lead','body','caption','cta','label','placeholder','option','help','success','error','aria','alt']
  return COPY.filter((r) => r.page === page).sort((a, b) =>
    a.section.localeCompare(b.section) || a.component.localeCompare(b.component) ||
    order.indexOf(a.element) - order.indexOf(b.element))
}
