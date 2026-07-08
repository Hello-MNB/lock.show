'use client'

/**
 * Bilingual content for /terms. Hebrew is verbatim from docs/legal/TERMS-HE.md
 * (v0.1 draft, pending counsel review — placeholders like [עיר] / [אימייל]
 * are kept visible on purpose). English is a faithful, plain, professional
 * translation — also a draft, not final legal copy.
 *
 * Vocabulary note: the Hebrew source uses "Mirror" for the artist's private
 * view; that word is kept verbatim in the Hebrew (it's a legal draft, flagged
 * elsewhere), but the English translation below says "the artist's private
 * view" instead, per the GIGPROOF vocabulary canon.
 */

import { LegalDocument, type LegalContent } from '@/components/legal-document'

const content: LegalContent = {
  he: {
    metaLabel: 'משפטי · תנאי שימוש',
    title: 'תנאי שימוש — GIGPROOF',
    versionLine: 'טיוטה לבדיקת עו״ד — אינה ייעוץ משפטי. גרסה 0.1 · 8.7.2026',
    taskNote: 'לאשר מול היועץ המשפטי לפני פרסום (משימה #23).',
    draftNotice: 'טיוטה בבדיקת יועץ משפטי — נוסח לא סופי',
    sections: [
      {
        heading: '1. השירות',
        paragraphs: [
          'GIGPROOF מספק תצוגת-ראיות מתויגת-שיטה לגבי אמנים ("פספורט" ציבורי לקונה; תצוגת אמן פרטית), לצורך הפחתת-סיכון בהחלטות הזמנה.',
        ],
      },
      {
        heading: '2. הבהרה מהותית — חשוב — אין ציון, אין דירוג, אין הבטחה',
        paragraphs: [
          '**GIGPROOF אינו מספק ציון/אחוז/דירוג/חיזוי של "היתכנות-הזמנה".** המידע מוצג כ**ראיות מתויגות בלבד** (bands + binaries עם תוויות-שיטה). GIGPROOF **אינו מבטיח** ביצועי-אמן, מכירות-כרטיסים, נוכחות-קהל או תוצאה עסקית כלשהי. ההחלטה וההסתמכות — על אחריות המשתמש בלבד. "check, don\'t trust".',
        ],
      },
      {
        heading: '3. חשבון ושימוש הוגן',
        paragraphs: [
          'עליך לספק מידע נכון, לשמור על סודיות פרטי-הכניסה, ולהשתמש בשירות כדין. אסור: העלאת מידע כוזב/מפר-זכויות, גריפה, שימוש לרעה, או הצגת ראיות ללא סמכות-מקור.',
        ],
      },
      {
        heading: '4. תוכן משתמש וראיות',
        paragraphs: [
          'אתה מצהיר שיש לך סמכות על כל ראיה שאתה מעלה/מקשר. אתה מעניק לנו רישיון מוגבל להציג ולעבד ראיות לצורך השירות. פרסום ב-Passport מחייב **אישור מפורש שלך**.',
        ],
      },
      {
        heading: '5. תשלומים',
        paragraphs: [
          'מנויים/עמלות כמפורט במסך-התמחור, בתשלום דרך Bit. קבלות מונפקות (Green Invoice). מדיניות ביטול/החזר: [להשלים].',
        ],
      },
      {
        heading: '6. קניין רוחני',
        paragraphs: [
          'כל הזכויות בשירות, בעיצוב ובקאנון שמורות ל-GIGPROOF.',
        ],
      },
      {
        heading: '7. היעדר-אחריות והגבלת-חבות',
        paragraphs: [
          'השירות ניתן "AS-IS". בכפוף לדין, איננו אחראים לנזק עקיף/תוצאתי, ואחריותנו הכוללת מוגבלת לסכום ששולם ב-12 החודשים שקדמו.',
        ],
      },
      {
        heading: '8. סיום',
        paragraphs: [
          'נוכל להשעות/לסיים חשבון בהפרת-תנאים.',
        ],
      },
      {
        heading: '9. דין וסמכות שיפוט',
        paragraphs: [
          'דיני מדינת ישראל; סמכות ייחודית לבתי-המשפט ב[עיר].',
        ],
      },
      {
        heading: '10. שינויים ויצירת קשר',
        paragraphs: [
          'נעדכן תנאים אלה ונפרסם תאריך. יצירת קשר: [אימייל].',
        ],
      },
    ],
  },
  en: {
    metaLabel: 'LEGAL · TERMS OF USE',
    title: 'Terms of Use — GIGPROOF',
    versionLine: 'Draft for legal review — not legal advice. v0.1 · 8 Jul 2026',
    taskNote: 'To be confirmed with legal counsel before publishing (task #23).',
    draftNotice: 'Draft under legal review — not final',
    sections: [
      {
        heading: '1. The Service',
        paragraphs: [
          'GIGPROOF provides method-labelled evidence about artists — a public "Passport" for buyers and the artist\'s private view — for the purpose of reducing risk in booking decisions.',
        ],
      },
      {
        heading: '2. Material Clarification — No Score, No Ranking, No Guarantee',
        paragraphs: [
          '**GIGPROOF does not provide a score, percentage, ranking, or prediction of "bookability."** Information is presented only as **labelled evidence** (bands and binaries with method labels). GIGPROOF **does not guarantee** artist performance, ticket sales, audience attendance, or any business outcome. Reliance on the information, and any decision made from it, is the user\'s sole responsibility. "Check, don\'t trust."',
        ],
      },
      {
        heading: '3. Account and Fair Use',
        paragraphs: [
          'You must provide accurate information, keep your login credentials confidential, and use the service lawfully. Prohibited: uploading false or rights-infringing information, scraping, misuse, or presenting evidence without the underlying source authority.',
        ],
      },
      {
        heading: '4. User Content and Evidence',
        paragraphs: [
          'You represent that you hold authority over any evidence you upload or link. You grant us a limited licence to display and process evidence for the purposes of the service. Publication on the Passport requires **your explicit approval**.',
        ],
      },
      {
        heading: '5. Payments',
        paragraphs: [
          'Subscriptions/fees as set out on the pricing screen, paid via Bit. Receipts are issued (Green Invoice). Cancellation/refund policy: [to be completed].',
        ],
      },
      {
        heading: '6. Intellectual Property',
        paragraphs: [
          'All rights in the service, its design, and its canon are reserved to GIGPROOF.',
        ],
      },
      {
        heading: '7. Disclaimer and Limitation of Liability',
        paragraphs: [
          'The service is provided "AS IS." Subject to applicable law, we are not liable for indirect or consequential damages, and our total liability is limited to the amount paid in the preceding 12 months.',
        ],
      },
      {
        heading: '8. Termination',
        paragraphs: [
          'We may suspend or terminate an account for breach of these terms.',
        ],
      },
      {
        heading: '9. Governing Law and Jurisdiction',
        paragraphs: [
          'The laws of the State of Israel apply; exclusive jurisdiction lies with the courts of [city].',
        ],
      },
      {
        heading: '10. Changes and Contact',
        paragraphs: [
          'We may update these terms and will publish the date of the update. Contact: [email].',
        ],
      },
    ],
  },
}

export default function TermsContent() {
  return <LegalDocument content={content} />
}
