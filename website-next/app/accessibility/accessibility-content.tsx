'use client'

/**
 * Bilingual content for /accessibility. Hebrew is verbatim from
 * docs/legal/ACCESSIBILITY-HE.md (v0.1 draft — placeholders like [שם] /
 * [___] are kept visible on purpose). English is a faithful, plain,
 * professional translation — also a draft.
 */

import { LegalDocument, type LegalContent } from '@/components/legal-document'

const content: LegalContent = {
  he: {
    metaLabel: 'משפטי · נגישות',
    title: 'הצהרת נגישות — LOCK',
    versionLine: 'טיוטה · גרסה 0.1 · 8.7.2026',
    taskNote: 'לפי חוק שוויון זכויות לאנשים עם מוגבלות ותקנותיו + ת״י 5568 (מבוסס WCAG 2.0) ברמה AA. לעדכן לאחר מעבר-הנגשה בפועל (משימה #27).',
    draftNotice: 'טיוטה בבדיקת יועץ משפטי — נוסח לא סופי',
    sections: [
      {
        heading: 'המחויבות שלנו',
        paragraphs: [
          'LOCK פועל להנגיש את השירות לכלל המשתמשים, לרבות אנשים עם מוגבלות, בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג-2013, ולתקן הישראלי ת״י 5568 ברמה AA.',
        ],
      },
      {
        heading: 'מה הונגש (לעדכן לאחר בדיקה)',
        bullets: [
          'ניווט מקלדת',
          'ניגודיות-צבע',
          'טקסט חלופי לתמונות',
          'מבנה-כותרות סמנטי',
          'תמיכה בקוראי-מסך',
          'גדלי-מגע נגישים',
          'RTL תקין לעברית',
        ],
      },
      {
        heading: 'מגבלות ידועות',
        paragraphs: [
          '[לרשום עמודים/רכיבים שטרם הונגשו במלואם, אם יש.]',
        ],
      },
      {
        heading: 'דרכי פנייה בנושא נגישות',
        paragraphs: [
          'רכז/ת הנגישות: [שם]',
          'אימייל: support@lock.show',
          'נשתדל לתת מענה בהקדם. תאריך עדכון אחרון: [___].',
        ],
      },
    ],
  },
  en: {
    metaLabel: 'LEGAL · ACCESSIBILITY',
    title: 'Accessibility Statement — LOCK',
    versionLine: 'Draft · v0.1 · 8 Jul 2026',
    taskNote: 'Per the Equal Rights for Persons with Disabilities Law and its regulations, plus Israeli Standard SI 5568 (based on WCAG 2.0), Level AA. To be updated after the accessibility remediation pass is complete (task #27).',
    draftNotice: 'Draft under legal review — not final',
    sections: [
      {
        heading: 'Our Commitment',
        paragraphs: [
          'LOCK is working to make the service accessible to all users, including people with disabilities, in accordance with the Equal Rights for Persons with Disabilities Regulations (Service Accessibility Adjustments), 5773-2013, and Israeli Standard SI 5568, Level AA.',
        ],
      },
      {
        heading: 'What Has Been Made Accessible (to be updated after testing)',
        bullets: [
          'Keyboard navigation',
          'Colour contrast',
          'Alt text for images',
          'Semantic heading structure',
          'Screen-reader support',
          'Accessible touch-target sizes',
          'Correct RTL rendering for Hebrew',
        ],
      },
      {
        heading: 'Known Limitations',
        paragraphs: [
          '[List pages/components not yet fully accessible, if any.]',
        ],
      },
      {
        heading: 'Accessibility Contact',
        paragraphs: [
          'Accessibility coordinator: [name]',
          'Email: support@lock.show · Phone: [___]',
          'We aim to respond as soon as possible. Last updated: [___].',
        ],
      },
    ],
  },
}

export default function AccessibilityContent() {
  return <LegalDocument content={content} />
}
