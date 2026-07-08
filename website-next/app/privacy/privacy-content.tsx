'use client'

/**
 * Bilingual content for /privacy. Hebrew is verbatim from
 * docs/legal/PRIVACY-HE.md (v0.2-מתוקנת — corrected against the product
 * glossary and factual accuracy; see the CHANGELOG section at the bottom of
 * that file for the full list of corrections vs. the R00 base draft).
 * English is a faithful, plain, professional translation — also a draft,
 * not final legal copy.
 *
 * Vocabulary note: canon uses "Passport" for the public buyer-facing view,
 * and "the artist's private view (the Radar)" for the private view — never
 * "Mirror," never "performance passport." The Hebrew source uses פספורט /
 * האזור הפרטי (הרדאר) accordingly; "מראה" (Mirror) does not appear.
 */

import { LegalDocument, type LegalContent } from '@/components/legal-document'

const content: LegalContent = {
  he: {
    metaLabel: 'משפטי · מדיניות פרטיות',
    title: 'מדיניות פרטיות — GIGPROOF',
    versionLine: 'טיוטה לבדיקת עו״ד — אינה ייעוץ משפטי. גרסה 0.2-מתוקנת · 8.7.2026',
    taskNote: 'טיוטה זמנית בבדיקת יועץ משפטי — נוסח לא סופי (משימה #23). כפוף לחוק הגנת הפרטיות התשמ״א-1981 כולל תיקון 13 (בתוקף מ-14.8.2025). לאשר מול היועץ המשפטי לפני פרסום.',
    draftNotice: 'טיוטה בבדיקת יועץ משפטי — נוסח לא סופי',
    sections: [
      {
        heading: '1. מי מפעיל את השירות',
        paragraphs: [
          'השירות מופעל על ידי:',
        ],
        bullets: [
          '**שם משפטי מלא:** [שם העוסק/החברה]',
          '**מספר עוסק/ח.פ.:** [מספר]',
          '**כתובת:** [כתובת מלאה]',
          '**דוא"ל לפניות פרטיות:** [כתובת דוא"ל ייעודית]',
        ],
      },
      {
        heading: '',
        paragraphs: [
          '[שם העוסק/החברה] הוא **בעל השליטה במאגר המידע**, כלומר הגורם הקובע לאילו מטרות וכיצד יעובד המידע האישי במסגרת השירות.',
        ],
      },
      {
        heading: '2. מהו השירות',
        paragraphs: [
          'השירות הוא כלי טרום־הזמנה להפחתת סיכון בתעשיית המוזיקה החיה. הוא מאפשר לאמנים, לנציגיהם ולגורמים מקצועיים להעלות, לארגן ולבחון מידע וראיות מקצועיות, ליצור תצוגה פרטית, ולהפיק **פספורט ציבורי** הכולל רק מידע שהאמן בחר ואישר לפרסום.',
          'השירות אינו מבטיח הזמנות, הופעות, הכנסה, התאמה לאירוע או החלטה מסחרית כלשהי.',
        ],
      },
      {
        heading: '3.1 מידע חשבון וזיהוי',
        bullets: [
          'שם ושם במה;',
          'כתובת דוא"ל;',
          'מספר טלפון, אם נמסר;',
          'סיסמה מוצפנת או מזהה התחברות;',
          'תפקיד בשירות, כגון אמן, נציג, אמרגן, מפיק או חבר צוות;',
          'שם ארגון והשתייכות לארגון;',
          'תמונת פרופיל ופרטי חשבון בסיסיים, אם בעתיד תופעל התחברות באמצעות ספק חיצוני ובהסכמתך.',
        ],
      },
      {
        heading: '3.2 מידע מקצועי על האמן',
        bullets: [
          'שם במה, תחום מוזיקלי, אזור פעילות וביוגרפיה;',
          'תמונות, סרטונים וקישורים למוזיקה או לפרופילים מקצועיים;',
          'הופעות, ליין־אפים, ניסיון מקצועי ומידע טכני;',
          'טווחי קהל, פעילות כרטיסים, טווחי תשלום או נתונים מקצועיים אחרים;',
          'מידע על קהילה, פעילות עצמאית, אירועים והצעה מסחרית.',
        ],
      },
      {
        heading: '3.3 ראיות ומסמכים',
        paragraphs: [
          'המשתמש רשאי להעלות או לקשר ראיות, כגון:',
        ],
        bullets: [
          'קישורים ציבוריים;',
          'צילומי מסך;',
          'יצוא ממערכת כרטיסים;',
          'דפי התחשבנות;',
          'מסמכים מקצועיים;',
          'טווחים או נתונים שהמשתמש מצהיר עליהם;',
          'אישורים או תשובות של מפיקים וגורמים מקצועיים.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'בעת העלאת מידע, המשתמש נדרש לאשר כי הוא רשאי למסור אותו וכי המידע אינו כולל מידע אישי עודף על אנשים אחרים.',
          'אין להעלות רשימות לקוחות, מספרי זהות, פרטי תשלום, מידע רפואי, מידע על קטינים או מידע אישי שאינו נחוץ לצורך בחינת הראיה.',
          'אנו רשאים להסיר, לצמצם, להשחיר או לדחות מסמך הכולל מידע עודף או מידע של צד שלישי שאינו נחוץ למטרת השירות.',
        ],
      },
      {
        heading: '3.4 טענות, תוויות ותוצרי עיבוד',
        paragraphs: [
          'אנו עשויים לשמור:',
        ],
        bullets: [
          'נקודות מידע שחולצו מראיות;',
          'מקור הראיה;',
          'שיטת הבדיקה;',
          'תאריך הבדיקה או העדכון;',
          'סטטוס כגון נתמך, דווח עצמי או אושר בידי מפיק;',
          'תיקונים ואישורים שבוצעו על ידי המשתמש;',
          'בחירת המשתמש אילו פריטים יישארו פרטיים ואילו יפורסמו;',
          'גרסאות קודמות של הפספורט;',
          'רישומי הסכמה ופעולות מערכת.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'מידע פנימי, הערכות פנימיות, פערים ומידע שלא אושר לפרסום לא יוצגו בפספורט הציבורי.',
        ],
      },
      {
        heading: '3.5 בקשות זמינות ותגובות מקצועיות',
        paragraphs: [
          'כאשר אדם שולח בקשת זמינות או תגובה דרך השירות, אנו עשויים לאסוף:',
        ],
        bullets: [
          'שם ופרטי קשר;',
          'שם הארגון;',
          'סוג האירוע;',
          'מועד ומיקום האירוע;',
          'טווח קיבולת או תקציב;',
          'תוכן ההודעה;',
          'סטטוס הבקשה;',
          'תגובות, אישורים או ביטולים של גורם מקצועי.',
        ],
      },
      {
        heading: '3.6 מידע טכני ואבטחתי',
        paragraphs: [
          'אנו עשויים לאסוף באופן אוטומטי:',
        ],
        bullets: [
          'כתובת IP;',
          'סוג מכשיר, מערכת הפעלה ודפדפן;',
          'זמני כניסה ופעולות במערכת;',
          'כתובות עמודים שנצפו;',
          'אירועי אבטחה, ניסיונות התחברות ושגיאות;',
          'מזהים טכניים וקובצי Cookie הכרחיים.',
        ],
      },
      {
        heading: '3.7 מידע תשלום',
        paragraphs: [
          'בפיילוט, תשלומים עשויים להתבצע באמצעות Bit, העברה בנקאית או אמצעי תשלום חיצוני אחר.',
          'איננו מבקשים ואיננו שומרים סיסמאות, קודים סודיים או פרטי גישה לחשבון התשלום. לצורכי התאמה חשבונאית, קבלה ושירות לקוחות אנו עשויים לשמור את שם המשלם, הסכום, תאריך התשלום, אסמכתה ופרטי חשבונית.',
        ],
      },
      {
        heading: '4. כיצד המידע נאסף',
        paragraphs: [
          'המידע עשוי להתקבל:',
        ],
        bullets: [
          'ישירות ממך;',
          'מאדם או מארגון המורשה לפעול מטעמך;',
          'מקבצים ומקישורים שהעלית;',
          'מתגובות ובקשות שנשלחו דרך השירות;',
          'ממקור ציבורי שאליו הפנית אותנו;',
          'מחיבור לחשבון חיצוני, רק אם אפשרות זו תופעל ואתה תאשר אותה;',
          'באופן אוטומטי בעת השימוש באתר או באפליקציה.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'השירות אינו מיועד לבצע סריקה שיטתית, מעקב מתמשך או איסוף חשאי של מידע על אמנים. מידע ממקור ציבורי נבחן בהקשר שהמשתמש מסר, ואינו מפורסם אוטומטית ללא בדיקה ואישור.',
        ],
      },
      {
        heading: '5. האם חובה למסור מידע',
        paragraphs: [
          'אלא אם נאמר אחרת, אין חובה חוקית למסור לנו מידע אישי.',
          'עם זאת, פרטים מסוימים, כגון כתובת דוא"ל ופרטי התחברות, נדרשים לצורך פתיחת חשבון ותפעולו. ללא פרטים אלה לא נוכל לספק את השירות.',
          'העלאת ראיות, מסמכים ומידע מקצועי היא בחירה של המשתמש. הימנעות מהעלאת מידע מסוים עשויה להגביל את היכולת להציג או לבסס טענות מקצועיות.',
          'פרסום הפספורט הוא אופציונלי ודורש אישור נפרד ומפורש. ניתן להשתמש באזור הפרטי של השירות בלי לפרסם פספורט ציבורי.',
          'הסכמה לקבלת מסרים שיווקיים היא אופציונלית ואינה תנאי לקבלת השירות.',
        ],
      },
      {
        heading: '6. מטרות השימוש במידע',
        paragraphs: [
          'אנו עשויים להשתמש במידע לצורך:',
        ],
        bullets: [
          'פתיחת חשבון, זיהוי משתמשים וניהול הרשאות;',
          'אספקת השירות והתאמתו לתפקיד המשתמש;',
          'יצירת האזור הפרטי של האמן (הרדאר);',
          'ארגון, סיווג ובדיקת ראיות מקצועיות;',
          'הצגת מידע למשתמש לצורך תיקון, אישור או הסרה;',
          'יצירת פספורט ציבורי, רק לאחר אישור מפורש לפרסום;',
          'העברת בקשות זמינות ותגובות בין המשתמשים הרלוונטיים;',
          'ניהול תשלומים, חשבוניות ורישומים חשבונאיים;',
          'אבטחת השירות, מניעת שימוש לרעה וטיפול בתקלות;',
          'שיפור ביצועים, חוויית משתמש ופונקציונליות;',
          'עמידה בדרישות חוקיות, חשבונאיות ורגולטוריות;',
          'משלוח מסרים שיווקיים, רק לאחר קבלת הסכמה נפרדת וככל שנדרשת.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'המידע יעובד בהתאם להסכמתך, לבקשתך לקבל את השירות, לצורך מילוי חובה חוקית או מכוח סמכות אחרת המותרת לפי דין, לפי העניין.',
        ],
      },
      {
        heading: '7. עיבוד באמצעות כללים אוטומטיים ובינה מלאכותית',
        paragraphs: [
          'השירות משתמש בכללים אוטומטיים וכן בספק בינה מלאכותית חיצוני (Anthropic) כדי לסייע בארגון, בסיווג ובתיוג של ראיות מקצועיות שהועלו על ידי המשתמש.',
          'העיבוד באמצעות בינה מלאכותית מתבצע בצד השרת (server-side): הראיות אינן נשלחות ישירות מהדפדפן של המשתמש אל הספק החיצוני, אלא מועברות דרך שרתי השירות, המצמצמים את המידע הנשלח למינימום הנדרש לצורך התיוג בלבד.',
          'בהתאם לכך:',
        ],
        bullets: [
          'אנו מצמצמים את המידע המועבר לספק הבינה המלאכותית למינימום הנדרש לצורך התיוג וההערכה של הראיה;',
          'איננו מעבירים מידע אישי עודף של צדדים שלישיים לספק הבינה המלאכותית;',
          'תוצרי העיבוד (למשל תוויות, סיווגים או הצעות ניסוח) מוצגים למשתמש לבדיקה, תיקון או הסרה טרם כל פרסום;',
          '**עיבוד אוטומטי — בין אם מבוסס לוגיקה דטרמיניסטית ובין אם מבוסס בינה מלאכותית — אינו מהווה ולא ייחשב לעולם כהחלטת הזמנה, ציון, דירוג, אחוזון, חיזוי או הבטחה מכל סוג.** הגורם המקצועי המקבל את המידע הוא האחראי הבלעדי להחלטתו.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'אם נרחיב את השימוש בספקי בינה מלאכותית נוספים או נשנה את היקף העיבוד באופן מהותי, נעדכן מדיניות זו או נציג הודעה מתאימה מראש.',
        ],
      },
      {
        heading: '8. האזור הפרטי והפספורט הציבורי',
        paragraphs: [
          'האזור הפרטי (הרדאר) עשוי לכלול חוזקות, פערים, מסמכים, נתונים והמלצות שאינם מוצגים לציבור.',
          'הפספורט הציבורי יכלול רק מידע שהמשתמש: (1) ראה; (2) בחר; (3) אישר לפרסום באופן מפורש.',
          'הפספורט הציבורי לא יכלול מידע פנימי, פרטי קשר שלא אושרו, מספרים מדויקים שהוגדרו כפרטיים, הערכות פנימיות או מידע שלא אושר לפרסום.',
          'יש להביא בחשבון שעמוד ציבורי עשוי:',
        ],
        bullets: [
          'להיות נגיש לכל אדם שקיבל את הקישור;',
          'להיות מועבר לאחרים;',
          'להיות מצולם או מועתק;',
          'להישמר בזיכרון מטמון;',
          'להופיע במנועי חיפוש, אם לא הוגדר אחרת מבחינה טכנית.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'ניתן לבקש להפסיק את פרסום הפספורט או להסיר ממנו מידע. עם זאת, אין באפשרותנו למחוק עותקים שכבר נשמרו או הופצו באופן עצמאי על ידי צדדים שלישיים.',
        ],
      },
      {
        heading: '9. שיתוף מידע',
        paragraphs: [
          'איננו מוכרים או משכירים מידע אישי. אנו עשויים למסור מידע רק במידה הנדרשת לגורמים הבאים.',
          'ספקי תשתית פעילים בפיילוט:',
        ],
        bullets: [
          '**Supabase** — בסיס נתונים, אימות משתמשים, הרשאות ואחסון קבצים;',
          '**Vercel** — אירוח האתר, מסירת התוכן ורישומים טכניים הנוצרים במסגרת האירוח;',
          '**Anthropic** — עיבוד AI לתיוג ראיות, בצד השרת;',
          '**Google Analytics 4** — רק אם כלי המדידה הופעל ולאחר קבלת הסכמה מתאימה לקובצי מדידה;',
          '**ספקי תשלום וחשבוניות** — לצורך עיבוד תשלום, הפקת קבלה והתאמה חשבונאית.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'גורמים נוספים:',
        ],
        bullets: [
          'יועצים משפטיים, רואי חשבון וספקים מקצועיים, במידה הנדרשת למתן שירותיהם;',
          'גורם עסקי רלוונטי כאשר המשתמש ביקש לשלוח אליו בקשה או מידע;',
          'רשויות מוסמכות, בתי משפט או גורמי אכיפה, כאשר קיימת חובה חוקית;',
          'רוכש, משקיע או גורם אחר במסגרת שינוי מבני בעסק, בכפוף לשמירת מטרות השימוש והגנה על המידע.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'שירותי Resend, Google/Facebook OAuth או ספקים דומים אינם משמשים לעיבוד מידע אמיתי במסגרת הפיילוט, אלא לאחר הפעלתם בפועל ועדכון הגילוי המתאים.',
        ],
      },
      {
        heading: '10. העברת מידע מחוץ לישראל',
        paragraphs: [
          'חלק מספקי התשתית עשויים לאחסן או לעבד מידע מחוץ לישראל.',
          'כאשר מידע מועבר מחוץ לישראל, נפעל בהתאם להוראות הדין החלות וננקוט אמצעים מתאימים להגנה על המידע, לרבות הסכמים, התחייבויות או אמצעי הגנה אחרים, לפי הצורך.',
        ],
      },
      {
        heading: '11. שמירת מידע',
        paragraphs: [
          'נשמור מידע רק כל עוד הוא דרוש למטרה שלשמה נאסף, לצורך תפעול השירות, אבטחתו, טיפול במחלוקות או עמידה בחובה חוקית. בין היתר:',
        ],
        bullets: [
          'מידע חשבון יישמר כל עוד החשבון פעיל;',
          'ראיות ותכנים יישמרו כל עוד המשתמש מבקש להשתמש בהם במסגרת השירות;',
          'פספורטים שפורסמו וגרסאותיהם יישמרו לצורך ניהול הפרסום ותיעוד פעולות המשתמש;',
          'בקשות זמינות ותגובות יישמרו לצורך טיפול בבקשה, תיעוד ושיפור השירות;',
          'רישומי הסכמה, אבטחה וביקורת עשויים להישמר לתקופה ארוכה יותר לצורך הוכחת עמידה בדרישות הדין;',
          'מסמכי תשלום וחשבונאות יישמרו בהתאם לתקופות הנדרשות לפי דין;',
          'עותקי גיבוי יימחקו בהתאם למחזורי הגיבוי והתפעול של המערכות.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'כאשר המידע אינו נחוץ עוד, נפעל למחיקתו, להתממתו או להגבלת השימוש בו, בכפוף לחובות חוקיות ולהגבלות טכניות סבירות.',
        ],
      },
      {
        heading: '12. אבטחת מידע',
        paragraphs: [
          'אנו נוקטים אמצעים ארגוניים וטכנולוגיים שנועדו לצמצם את הסיכון לגישה בלתי מורשית, שימוש לרעה, שינוי, אובדן או חשיפה של מידע. האמצעים עשויים לכלול:',
        ],
        bullets: [
          'בקרת הרשאות וגישה לפי תפקיד;',
          'הפרדה בין מידע פרטי לבין מידע ציבורי;',
          'Row Level Security במאגר הנתונים;',
          'הצפנת תקשורת;',
          'ניהול הרשאות לפי עקרון הצורך לדעת;',
          'תיעוד פעולות ואירועי אבטחה;',
          'גיבויים ועדכוני אבטחה;',
          'בדיקות הרשאה והפרדה בין ארגונים ומשתמשים.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'אין מערכת חסינה לחלוטין. אם יתגלה אירוע אבטחה מהותי, נפעל בהתאם לחובות החלות ולתוכנית הטיפול באירועי אבטחה.',
        ],
      },
      {
        heading: '13. הזכויות שלך',
        paragraphs: [
          'בכפוף לדין, ניתן לפנות אלינו כדי:',
        ],
        bullets: [
          'לעיין במידע האישי המוחזק עליך;',
          'לבקש לתקן מידע שגוי, חלקי, לא ברור או לא מעודכן;',
          'לבקש לסגור את החשבון;',
          'לבקש למחוק מידע, ככל שאין חובה חוקית או צורך מוצדק להמשיך לשמור אותו;',
          'להסיר או לבטל פרסום של פספורט;',
          'לבטל הסכמה לעיבוד אופציונלי;',
          'להסיר את עצמך מרשימות שיווק;',
          'לקבל מידע נוסף על אופן עיבוד המידע.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'הזכות למחיקת חשבון או מידע ניתנת כחלק ממדיניות השירות ובכפוף לדין. ייתכנו מקרים שבהם נידרש לשמור מידע מסוים, למשל לצורכי חשבונאות, אבטחה, הגנה משפטית או מילוי חובה חוקית.',
          'לצורך הגנה על פרטיותך, אנו רשאים לבקש פרטים סבירים לאימות הזהות לפני טיפול בבקשה.',
          'פניות יישלחו אל: **[כתובת דוא"ל לפרטיות]**.',
        ],
      },
      {
        heading: '14. קובצי Cookie וכלי מדידה',
        paragraphs: [
          'השירות עשוי להשתמש בקובצי Cookie או בטכנולוגיות דומות.',
          '**קובצי Cookie הכרחיים** — נדרשים לצורך התחברות לחשבון, שמירת סשן, אבטחה, ניהול שפה והעדפות, ותפעול בסיסי של השירות. קבצים אלה עשויים לפעול גם ללא הסכמה, ככל שהם נחוצים להפעלת השירות.',
          '**קובצי מדידה ואנליטיקה** — Google Analytics 4 או כלי מדידה דומים יופעלו רק לאחר קבלת הסכמה, ככל שנדרשת (Consent Mode v2, ברירת מחדל חסומה). כלי המדידה עשויים לאסוף מידע על עמודים שנצפו, פעולות באתר, סוג מכשיר, דפדפן ומאפייני שימוש.',
          'ניתן לסרב לקובצי מדידה או לבטל הסכמה דרך באנר הקוקיז או הגדרות הפרטיות. סירוב למדידה לא ימנע שימוש בפונקציות המרכזיות של השירות.',
        ],
      },
      {
        heading: '15. מסרים שיווקיים',
        paragraphs: [
          'נשלח מסרים שיווקיים רק לאחר קבלת הסכמה נפרדת, ככל שנדרשת לפי דין.',
          'ניתן להסיר את ההסכמה בכל עת באמצעות קישור ההסרה בהודעה או בפנייה אלינו. הסרה מרשימת שיווק לא תשפיע על הודעות שירותיות הנדרשות לתפעול החשבון, אבטחה, תשלום או טיפול בבקשה.',
        ],
      },
      {
        heading: '16. קטינים',
        paragraphs: [
          'השירות מיועד לשימוש עסקי ומקצועי של בני 18 ומעלה.',
          'איננו מבקשים ביודעין מידע אישי ישירות מקטינים. אם יתברר לנו שנאסף מידע מקטין ללא אישור מתאים, נפעל למחיקתו או להגבלת השימוש בו.',
        ],
      },
      {
        heading: '17. אתרים ושירותים חיצוניים',
        paragraphs: [
          'השירות עשוי לכלול קישורים לאתרים, פלטפורמות מוזיקה, רשתות חברתיות או שירותים חיצוניים.',
          'השימוש בשירותים אלה כפוף למדיניות הפרטיות שלהם, ואין לנו שליטה על האופן שבו הם אוספים או מעבדים מידע לאחר שהמשתמש עבר אליהם.',
        ],
      },
      {
        heading: '18. שינויים במדיניות',
        paragraphs: [
          'אנו רשאים לעדכן מדיניות זו מעת לעת עקב שינוי בשירות, בספקים, בטכנולוגיה או בדרישות הדין.',
          'תאריך העדכון יופיע בראש המדיניות. במקרה של שינוי מהותי נפרסם הודעה בולטת בשירות או נמסור הודעה באמצעי קשר מתאים.',
        ],
      },
      {
        heading: '19. יצירת קשר',
        paragraphs: [
          'לשאלות, בקשות או תלונות בנושא פרטיות:',
        ],
        bullets: [
          '**שם בעל השליטה:** [שם משפטי]',
          '**דוא"ל:** [כתובת דוא"ל לפרטיות]',
          '**כתובת:** [כתובת למשלוח דואר]',
          '**טלפון, אם רלוונטי:** [מספר]',
        ],
      },
    ],
  },
  en: {
    metaLabel: 'LEGAL · PRIVACY POLICY',
    title: 'Privacy Policy — GIGPROOF',
    versionLine: 'Draft for legal review — not legal advice. v0.2-corrected · 8 Jul 2026',
    taskNote: 'Temporary draft under legal counsel review — not final wording (task #23). Subject to the Privacy Protection Law 5741-1981, including Amendment 13 (in effect from 14 Aug 2025). To be confirmed with legal counsel before publishing.',
    draftNotice: 'Draft under legal review — not final',
    sections: [
      {
        heading: '1. Who Operates the Service',
        paragraphs: [
          'The Service is operated by:',
        ],
        bullets: [
          '**Full legal name:** [business/company name]',
          '**Business registration / company number:** [number]',
          '**Address:** [full address]',
          '**Privacy contact email:** [dedicated email address]',
        ],
      },
      {
        heading: '',
        paragraphs: [
          '[Business/company name] is the **database controller** — the party that determines the purposes and means of processing personal information within the Service.',
        ],
      },
      {
        heading: '2. What the Service Is',
        paragraphs: [
          'The Service is a pre-booking risk-reduction tool for the live music industry. It lets artists, their representatives, and professional stakeholders upload, organize, and review professional information and evidence, build a private view, and produce a **public Passport** containing only the information the artist has chosen and approved for publication.',
          'The Service does not guarantee bookings, performances, income, event fit, or any commercial decision.',
        ],
      },
      {
        heading: '3.1 Account and Identification Information',
        bullets: [
          'Name and stage name;',
          'Email address;',
          'Phone number, if provided;',
          'Encrypted password or login identifier;',
          'Role within the Service, such as artist, representative, booking manager, producer, or team member;',
          'Organization name and affiliation;',
          'Profile picture and basic account details, if sign-in via an external provider is enabled in the future and with your consent.',
        ],
      },
      {
        heading: '3.2 Professional Information About the Artist',
        bullets: [
          'Stage name, musical genre, region of activity, and biography;',
          'Photos, videos, and links to music or professional profiles;',
          'Performances, lineups, professional experience, and technical information;',
          'Audience ranges, ticketing activity, fee ranges, or other professional data;',
          'Information about community, independent activity, events, and commercial offering.',
        ],
      },
      {
        heading: '3.3 Evidence and Documents',
        paragraphs: [
          'The user may upload or link evidence, such as:',
        ],
        bullets: [
          'Public links;',
          'Screenshots;',
          'Exports from ticketing systems;',
          'Settlement pages;',
          'Professional documents;',
          'Ranges or figures the user declares;',
          'Confirmations or responses from producers and professional stakeholders.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'When uploading information, the user is required to confirm they are authorized to provide it and that it does not include excess personal information about other people.',
          'Client lists, ID numbers, payment details, medical information, information about minors, or personal information not necessary for reviewing the evidence must not be uploaded.',
          'We may remove, redact, black out, or reject a document that contains excess information or third-party information not necessary for the purpose of the Service.',
        ],
      },
      {
        heading: '3.4 Claims, Labels, and Processing Outputs',
        paragraphs: [
          'We may retain:',
        ],
        bullets: [
          'Data points extracted from evidence;',
          'The source of the evidence;',
          'The verification method;',
          'The date of verification or update;',
          'A status such as supported, self-reported, or confirmed by a producer;',
          'Corrections and approvals made by the user;',
          "The user's choice of which items remain private and which are published;",
          'Previous versions of the Passport;',
          'Consent records and system actions.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'Internal information, internal assessments, gaps, and information not approved for publication will not be shown on the public Passport.',
        ],
      },
      {
        heading: '3.5 Availability Requests and Professional Responses',
        paragraphs: [
          'When someone sends an availability request or a response through the Service, we may collect:',
        ],
        bullets: [
          'Name and contact details;',
          "The organization's name;",
          'Event type;',
          'Event date and location;',
          'Capacity range or budget;',
          'Message content;',
          'Request status;',
          'Responses, approvals, or cancellations from a professional stakeholder.',
        ],
      },
      {
        heading: '3.6 Technical and Security Information',
        paragraphs: [
          'We may automatically collect:',
        ],
        bullets: [
          'IP address;',
          'Device type, operating system, and browser;',
          'Login times and system actions;',
          'Pages viewed;',
          'Security events, login attempts, and errors;',
          'Technical identifiers and necessary cookies.',
        ],
      },
      {
        heading: '3.7 Payment Information',
        paragraphs: [
          'During the pilot, payments may be made via Bit, bank transfer, or another external payment method.',
          "We do not request or store passwords, secret codes, or access details for the payment account. For accounting reconciliation, receipts, and customer service, we may retain the payer's name, amount, payment date, reference, and invoice details.",
        ],
      },
      {
        heading: '4. How Information Is Collected',
        paragraphs: [
          'Information may be received:',
        ],
        bullets: [
          'Directly from you;',
          'From a person or organization authorized to act on your behalf;',
          'From files and links you uploaded;',
          'From responses and requests sent through the Service;',
          'From a public source you referred us to;',
          'From connecting to an external account, only if that option is enabled and you approve it;',
          'Automatically while using the website or application.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'The Service is not intended to perform systematic scraping, continuous monitoring, or covert collection of information about artists. Information from a public source is reviewed in the context the user provided and is not published automatically without review and approval.',
        ],
      },
      {
        heading: '5. Is Providing Information Mandatory',
        paragraphs: [
          'Unless stated otherwise, there is no legal obligation to provide us with personal information.',
          "That said, certain details, such as an email address and login details, are required to open and operate an account. Without these details we cannot provide the Service.",
          'Uploading evidence, documents, and professional information is the user\'s choice. Declining to upload certain information may limit the ability to present or substantiate professional claims.',
          'Publishing the Passport is optional and requires separate, explicit approval. The private area of the Service can be used without publishing a public Passport.',
          'Consent to receive marketing messages is optional and is not a condition for receiving the Service.',
        ],
      },
      {
        heading: '6. Purposes of Using the Information',
        paragraphs: [
          'We may use the information to:',
        ],
        bullets: [
          'Open accounts, identify users, and manage permissions;',
          "Provide the Service and tailor it to the user's role;",
          "Build the artist's private view (the Radar);",
          'Organize, classify, and review professional evidence;',
          'Present information to the user for correction, approval, or removal;',
          'Create a public Passport, only after explicit approval to publish;',
          'Convey availability requests and responses between the relevant users;',
          'Manage payments, invoices, and accounting records;',
          'Secure the Service, prevent abuse, and handle faults;',
          'Improve performance, user experience, and functionality;',
          'Comply with legal, accounting, and regulatory requirements;',
          'Send marketing messages, only after obtaining separate consent and to the extent required.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'Information will be processed in accordance with your consent, your request to receive the Service, the need to fulfil a legal obligation, or another basis permitted by law, as applicable.',
        ],
      },
      {
        heading: '7. Processing via Automated Rules and Artificial Intelligence',
        paragraphs: [
          'The Service uses automated rules as well as an external artificial-intelligence provider (Anthropic) to help organize, classify, and label professional evidence uploaded by the user.',
          'AI-based processing takes place server-side: evidence is not sent directly from the user\'s browser to the external provider, but is routed through the Service\'s servers, which minimize the information sent to what the labeling requires.',
          'Accordingly:',
        ],
        bullets: [
          'We minimize the information transferred to the AI provider to what is necessary for labeling and assessing the evidence;',
          "We do not transfer excess personal information about third parties to the AI provider;",
          'Processing outputs (e.g. labels, classifications, or suggested wording) are shown to the user for review, correction, or removal before any publication;',
          '**Automated processing — whether based on deterministic logic or on artificial intelligence — does not, and will never, constitute a booking decision, score, ranking, percentile, prediction, or guarantee of any kind.** The professional stakeholder receiving the information is solely responsible for their decision.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'If we expand the use of additional AI providers or materially change the scope of processing, we will update this policy or present an appropriate notice in advance.',
        ],
      },
      {
        heading: '8. The Private Area and the Public Passport',
        paragraphs: [
          'The private area (the Radar) may include strengths, gaps, documents, data, and recommendations that are not shown publicly.',
          'The public Passport will include only information the user has: (1) seen; (2) selected; (3) explicitly approved for publication.',
          'The public Passport will not include internal information, unapproved contact details, exact figures designated as private, internal assessments, or information not approved for publication.',
          'Bear in mind that a public page may:',
        ],
        bullets: [
          'Be accessible to anyone who received the link;',
          'Be forwarded to others;',
          'Be screenshotted or copied;',
          'Be retained in cache memory;',
          'Appear in search engines, unless configured otherwise on a technical level.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'You may request to stop publishing the Passport or to remove information from it. However, we are unable to delete copies already saved or independently distributed by third parties.',
        ],
      },
      {
        heading: '9. Sharing Information',
        paragraphs: [
          'We do not sell or rent personal information. We may disclose information only to the extent required, to the following parties.',
          'Infrastructure providers active in the pilot:',
        ],
        bullets: [
          '**Supabase** — database, user authentication, permissions, and file storage;',
          '**Vercel** — website hosting, content delivery, and technical logs generated as part of hosting;',
          '**Anthropic** — AI processing for labeling evidence, server-side;',
          '**Google Analytics 4** — only if the measurement tool is enabled and after obtaining appropriate consent for measurement cookies;',
          '**Payment and invoicing providers** — for payment processing, receipt issuance, and accounting reconciliation.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'Additional parties:',
        ],
        bullets: [
          'Legal advisors, accountants, and professional service providers, to the extent required to provide their services;',
          'A relevant business party when the user has requested that we send them a request or information;',
          'Competent authorities, courts, or enforcement bodies, where a legal obligation exists;',
          'A buyer, investor, or other party in the context of a corporate structural change, subject to preserving the purposes of use and protecting the information.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'Resend, Google/Facebook OAuth, or similar providers are not used to process real information during the pilot, until they are actually activated and the corresponding disclosure is updated.',
        ],
      },
      {
        heading: '10. Transfer of Information Outside Israel',
        paragraphs: [
          'Some infrastructure providers may store or process information outside Israel.',
          'When information is transferred outside Israel, we will act in accordance with applicable legal provisions and take appropriate measures to protect the information, including agreements, undertakings, or other safeguards, as needed.',
        ],
      },
      {
        heading: '11. Data Retention',
        paragraphs: [
          'We will retain information only for as long as necessary for the purpose for which it was collected, for operating and securing the Service, handling disputes, or complying with a legal obligation. Among other things:',
        ],
        bullets: [
          'Account information will be retained as long as the account is active;',
          'Evidence and content will be retained as long as the user wishes to use them within the Service;',
          'Published Passports and their versions will be retained to manage publication and document user actions;',
          'Availability requests and responses will be retained to handle the request, for documentation, and to improve the Service;',
          'Consent, security, and audit records may be retained for a longer period to demonstrate compliance with legal requirements;',
          'Payment and accounting documents will be retained in accordance with legally required periods;',
          'Backup copies will be deleted in accordance with the backup and operational cycles of the systems.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'When information is no longer needed, we will act to delete it, anonymize it, or restrict its use, subject to legal obligations and reasonable technical limitations.',
        ],
      },
      {
        heading: '12. Information Security',
        paragraphs: [
          'We employ organizational and technological measures designed to reduce the risk of unauthorized access, misuse, alteration, loss, or exposure of information. Measures may include:',
        ],
        bullets: [
          'Role-based access and permission control;',
          'Separation between private and public information;',
          'Row Level Security in the database;',
          'Encryption of communications;',
          'Permission management on a need-to-know basis;',
          'Logging of actions and security events;',
          'Backups and security updates;',
          'Permission checks and separation between organizations and users.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'No system is completely immune. If a material security incident is discovered, we will act in accordance with applicable obligations and the incident-response plan.',
        ],
      },
      {
        heading: '13. Your Rights',
        paragraphs: [
          'Subject to law, you may contact us to:',
        ],
        bullets: [
          'Review the personal information held about you;',
          'Request correction of information that is incorrect, incomplete, unclear, or outdated;',
          'Request to close the account;',
          'Request deletion of information, to the extent there is no legal obligation or justified need to continue retaining it;',
          "Remove or cancel publication of a Passport;",
          'Withdraw consent to optional processing;',
          'Remove yourself from marketing lists;',
          'Receive additional information about how information is processed.',
        ],
      },
      {
        heading: '',
        paragraphs: [
          'The right to delete an account or information is provided as part of the Service policy and subject to law. There may be cases where we are required to retain certain information, for example for accounting, security, legal defense, or compliance purposes.',
          'To protect your privacy, we may request reasonable details to verify identity before handling a request.',
          'Requests should be sent to: **[privacy email address]**.',
        ],
      },
      {
        heading: '14. Cookies and Measurement Tools',
        paragraphs: [
          'The Service may use cookies or similar technologies.',
          '**Strictly necessary cookies** — required for account login, session persistence, security, language and preference management, and basic operation of the Service. These may operate even without consent, to the extent necessary to run the Service.',
          '**Measurement and analytics cookies** — Google Analytics 4 or similar measurement tools will be activated only after obtaining consent, to the extent required (Consent Mode v2, default denied). The measurement tool may collect information about pages viewed, on-site actions, device type, browser, and usage characteristics.',
          'You may decline measurement cookies or withdraw consent via the cookie banner or privacy settings. Declining measurement will not prevent use of the core functions of the Service.',
        ],
      },
      {
        heading: '15. Marketing Messages',
        paragraphs: [
          'We will send marketing messages only after obtaining separate consent, to the extent required by law.',
          'Consent may be withdrawn at any time via the unsubscribe link in a message or by contacting us. Removal from a marketing list will not affect service messages required for account operation, security, payment, or handling a request.',
        ],
      },
      {
        heading: '16. Minors',
        paragraphs: [
          'The Service is intended for business and professional use by persons aged 18 and over.',
          'We do not knowingly request personal information directly from minors. If we become aware that information about a minor was collected without appropriate approval, we will act to delete it or restrict its use.',
        ],
      },
      {
        heading: '17. Third-Party Websites and Services',
        paragraphs: [
          'The Service may include links to websites, music platforms, social networks, or external services.',
          'Use of these services is subject to their own privacy policies, and we have no control over how they collect or process information once a user has moved on to them.',
        ],
      },
      {
        heading: '18. Changes to This Policy',
        paragraphs: [
          'We may update this policy from time to time due to a change in the Service, providers, technology, or legal requirements.',
          'The update date will appear at the top of the policy. In the event of a material change, we will publish a prominent notice within the Service or provide notice through an appropriate means of contact.',
        ],
      },
      {
        heading: '19. Contact',
        paragraphs: [
          'For questions, requests, or complaints regarding privacy:',
        ],
        bullets: [
          '**Controller name:** [legal name]',
          '**Email:** [privacy email address]',
          '**Address:** [postal address]',
          '**Phone, if applicable:** [number]',
        ],
      },
    ],
  },
}

export default function PrivacyContent() {
  return <LegalDocument content={content} />
}
