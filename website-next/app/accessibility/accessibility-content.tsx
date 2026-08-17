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
    title: 'הצהרת נגישות — LOCK SHOW',
    versionLine: 'טיוטה · גרסה 0.1 · 8.7.2026',
    // taskNote (internal dev note) REMOVED from the visible page, following the
    // precedent already set on /terms. It published an internal task reference
    // ("task #27") on a LIVE public legal page — verified on www.lock.show — which is
    // the same class of defect as the "Languages: Hebrew · English" spec line the
    // owner struck from /contact: internal notes are not public copy. The
    // draft-review banner below stays, and the legal body is unchanged: the
    // statute references remain in the document text where they carry meaning.

    draftNotice: 'טיוטה בבדיקת יועץ משפטי — נוסח לא סופי',
    sections: [
      {
        heading: 'המחויבות שלנו',
        paragraphs: [
          'LOCK SHOW פועל להנגיש את השירות לכלל המשתמשים, לרבות אנשים עם מוגבלות, בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג-2013, ולתקן הישראלי ת״י 5568 ברמה AA.',
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
          'אימייל: support@lock.show · טלפון: [___]',
          'נשתדל לתת מענה בהקדם. תאריך עדכון אחרון: [___].',
        ],
      },
    ],
  },
  en: {
    metaLabel: 'LEGAL · ACCESSIBILITY',
    title: 'Accessibility Statement — LOCK SHOW',
    versionLine: 'Draft · v0.1 · 8 Jul 2026',
    draftNotice: 'Draft under legal review — not final',
    sections: [
      {
        heading: 'Our Commitment',
        paragraphs: [
          'LOCK SHOW is working to make the service accessible to all users, including people with disabilities, in accordance with the Equal Rights for Persons with Disabilities Regulations (Service Accessibility Adjustments), 5773-2013, and Israeli Standard SI 5568, Level AA.',
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
