'use client'

/**
 * Bilingual content for /privacy. Hebrew is verbatim from
 * docs/legal/PRIVACY-HE.md (v0.1 draft, pending counsel review — placeholders
 * like [אימייל] / [שם העוסק/החברה, ח.פ., כתובת] are kept visible on purpose).
 * English is a faithful, plain, professional translation — also a draft.
 *
 * Vocabulary note: section 3 mentions the Passport / Mirror pair; the Hebrew
 * keeps "Mirror" verbatim, the English translation says "the artist's
 * private view" instead, per the GIGPROOF vocabulary canon.
 */

import { LegalDocument, type LegalContent } from '@/components/legal-document'

const content: LegalContent = {
  he: {
    metaLabel: 'משפטי · מדיניות פרטיות',
    title: 'מדיניות פרטיות — GIGPROOF',
    versionLine: 'טיוטה לבדיקת עו״ד — אינה ייעוץ משפטי. גרסה 0.1 · 8.7.2026',
    taskNote: 'כפוף לחוק הגנת הפרטיות התשמ״א-1981 כולל תיקון 13 (בתוקף מ-14.8.2025). לאשר מול היועץ המשפטי לפני פרסום (משימה #23).',
    draftNotice: 'טיוטה בבדיקת יועץ משפטי — נוסח לא סופי',
    sections: [
      {
        heading: '1. מי אנחנו',
        paragraphs: [
          'GIGPROOF ("השירות", "אנחנו") — כלי הפחתת-סיכון טרום-הזמנה לאמרגנים, המסייע להעריך אמן לא-מוכר על בסיס ראיות מתויגות-שיטה. בעל השליטה במאגר: [שם העוסק/החברה, ח.פ., כתובת]. איש קשר לפרטיות: [[אימייל] / כתובת].',
        ],
      },
      {
        heading: '2. איזה מידע אנחנו אוספים',
        bullets: [
          '**מידע חשבון**: אימייל, שם, ומזהה התחברות (כולל בהתחברות דרך Google/Facebook — שם, אימייל, תמונת פרופיל).',
          '**ראיות שהמשתמש מעלה/מקשר** ("artifacts"): קישורים, קבצים, מספרים מוצהרים שהאמן/האמרגן מזין. נאסף רק לאחר **אישור סמכות-מקור** של המשתמש.',
          '**מידע גילוי ציבורי** (בהסכמה/אישור): תוצאות ממקורות ציבוריים (למשל YouTube/Spotify catalog) המוצגות לאישור/דחייה לפני שמירה.',
          '**מידע שימוש וניתוח**: דרך Google Analytics 4 (מזהה `G-ZX907M2NY8`) — עמודים, אירועים, מכשיר. נאסף **בכפוף להסכמת-קוקיז** (ר׳ סעיף 6).',
          '**מידע תשלום**: מעובד דרך ספק הסליקה (Bit) — איננו שומרים פרטי-כרטיס.',
        ],
      },
      {
        heading: '3. למה אנחנו משתמשים במידע (מטרות ובסיס חוקי)',
        paragraphs: [
          'לתפעול השירות והצגת הפספורט ותצוגת האמן הפרטית; לאימות ראיות; לחיובים והפקת קבלות; לשיפור ואבטחה; לעמידה בחובות-דין. הבסיס: ביצוע חוזה, הסכמה (אנליטיקס/שיווק), ואינטרס לגיטימי מאוזן.',
        ],
      },
      {
        heading: '4. שיתוף מידע',
        paragraphs: [
          'איננו מוכרים מידע אישי. שיתוף רק עם: ספקי-תשתית (Supabase-אחסון, Vercel-אירוח, Anthropic-עיבוד-AI, Google Analytics, Resend-מיילים) לפי הסכמי-עיבוד; ורשויות כנדרש בדין. ה-Passport הציבורי מציג **רק חוזקות מאומתות שהאמן אישר לפרסום** — לעולם לא מידע פרטי ללא אישור.',
        ],
      },
      {
        heading: '5. זכויותייך (תיקון 13)',
        paragraphs: [
          'זכות עיון, תיקון, מחיקה, והתנגדות לשימוש. פנייה ל-[אימייל]. נגיב תוך המועד הקבוע בחוק. ניתן להסיר הסכמה בכל עת.',
        ],
      },
      {
        heading: '6. קוקיז והסכמה',
        paragraphs: [
          'בכניסה מוצג באנר-הסכמה. אנליטיקס/מדידה נטענים **רק לאחר הסכמה** (Consent Mode v2). קוקיז-הכרחיים בלבד פועלים כברירת-מחדל.',
        ],
      },
      {
        heading: '7. שמירה ואבטחה',
        paragraphs: [
          'נשמור מידע כל עוד נחוץ למטרותיו/חובות-דין, ואז נמחק/ננטרל. אמצעי-אבטחה: הצפנה, RLS, בקרת-גישה, טוקנים מוצפנים.',
        ],
      },
      {
        heading: '8. העברות בין-לאומיות',
        paragraphs: [
          'חלק מהספקים מחוץ לישראל (ארה״ב/אירופה) — כפוף לתנאי-העברה מתאימים.',
        ],
      },
      {
        heading: '9. קטינים',
        paragraphs: [
          'השירות מיועד לבגירים (18+) בהקשר עסקי.',
        ],
      },
      {
        heading: '10. שינויים ויצירת קשר',
        paragraphs: [
          'נעדכן מדיניות זו ונפרסם תאריך. לשאלות: [אימייל/כתובת].',
        ],
      },
    ],
  },
  en: {
    metaLabel: 'LEGAL · PRIVACY POLICY',
    title: 'Privacy Policy — GIGPROOF',
    versionLine: 'Draft for legal review — not legal advice. v0.1 · 8 Jul 2026',
    taskNote: 'Subject to the Privacy Protection Law 5741-1981, including Amendment 13 (in effect from 14 Aug 2025). To be confirmed with legal counsel before publishing (task #23).',
    draftNotice: 'Draft under legal review — not final',
    sections: [
      {
        heading: '1. Who We Are',
        paragraphs: [
          'GIGPROOF ("the Service", "we") is a pre-booking risk-reduction tool for booking managers, helping them evaluate an unfamiliar artist based on method-labelled evidence. Database controller: [business/company name, registration no., address]. Privacy contact: [[אימייל] / address].',
        ],
      },
      {
        heading: '2. What Information We Collect',
        bullets: [
          '**Account information**: email, name, and login identifier (including via Google/Facebook sign-in — name, email, profile picture).',
          '**Evidence the user uploads or links** ("artifacts"): links, files, and self-declared figures entered by the artist/booking manager. Collected only after the user **confirms authority over the source**.',
          '**Publicly-discovered information** (with consent/approval): results from public sources (e.g. YouTube/Spotify catalogue) shown for approval or rejection before being saved.',
          '**Usage and analytics information**: via Google Analytics 4 (ID `G-ZX907M2NY8`) — pages, events, device. Collected **subject to cookie consent** (see section 6).',
          '**Payment information**: processed via the payment provider (Bit) — we do not store card details.',
        ],
      },
      {
        heading: '3. Why We Use the Information (Purposes and Legal Basis)',
        paragraphs: [
          'To operate the service and display the Passport / the artist\'s private view; to verify evidence; for billing and issuing receipts; for improvement and security; to comply with legal obligations. Legal basis: performance of a contract, consent (analytics/marketing), and a balanced legitimate interest.',
        ],
      },
      {
        heading: '4. Sharing Information',
        paragraphs: [
          'We do not sell personal information. Sharing occurs only with: infrastructure providers (Supabase — storage, Vercel — hosting, Anthropic — AI processing, Google Analytics, Resend — email) under processing agreements; and authorities as required by law. The public Passport shows **only verified strengths the artist has approved for publication** — never private information without approval.',
        ],
      },
      {
        heading: '5. Your Rights (Amendment 13)',
        paragraphs: [
          'The right to access, correct, delete, and object to use of your information. Contact [email]. We will respond within the statutory period. Consent may be withdrawn at any time.',
        ],
      },
      {
        heading: '6. Cookies and Consent',
        paragraphs: [
          'A consent banner is shown on entry. Analytics/measurement load **only after consent** (Consent Mode v2). Strictly necessary cookies operate by default.',
        ],
      },
      {
        heading: '7. Retention and Security',
        paragraphs: [
          'We retain information for as long as necessary for its purposes and legal obligations, and then delete or anonymise it. Security measures: encryption, RLS, access control, encrypted tokens.',
        ],
      },
      {
        heading: '8. International Transfers',
        paragraphs: [
          'Some providers are located outside Israel (US/Europe) — subject to appropriate transfer safeguards.',
        ],
      },
      {
        heading: '9. Minors',
        paragraphs: [
          'The service is intended for adults (18+) in a business context.',
        ],
      },
      {
        heading: '10. Changes and Contact',
        paragraphs: [
          'We will update this policy and publish the date. Questions: [email/address].',
        ],
      },
    ],
  },
}

export default function PrivacyContent() {
  return <LegalDocument content={content} />
}
