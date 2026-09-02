# MNB — My New Baby · MVP (Track 2 / CORE)

פלטפורמת היכרויות פרמיום מאומתת, escrow-first, עם מלווה אישית (AI Companion).
Mobile-first PWA · עברית RTL · לפי הקאנון: MASTER-AZ v2.3 + MNB-CLAUDE-CODE-BUILD-PACKAGE (2026-06-23).

> **מצב: DEMO / אלפא פנימית.** לפי Gate F — המערכת לא נפתחת לזרים לפני קבלה ראשונה בתשלום
> דרך escrow ידני. אין סליקה אמיתית, אין KYC אמיתי, ואין נתונים אמיתיים בקוד הזה.

## חמשת מודולי ה-MVP (וכלום מעבר)

| # | מודול | איפה בקוד |
|---|--------|-----------|
| 1 | Onboarding שיחתי + פרופיל | `app/onboarding` + `lib/companion.ts` |
| 2 | התאמות ARIA v1 (rule-based + "למה ההתאמה") | `lib/aria.ts` + `app/app/discover` |
| 3 | צ'אט + שער בטיחות (סריקת כפייה, השהיה, audit) | `app/app/chat/[id]` + `lib/safety.ts` |
| 4 | Goal Fund escrow (held→dual_confirm→released) | `lib/escrow.ts` + `app/app/wallet` |
| 5 | אימות זהות (stub ל-Sumsub) + תג מאומת | `app/app/profile` |
| + | Ops console (אימותים, בטיחות, נאמנות, יומן) | `app/admin` |
| + | Companion מתמשך (ליווי, אימון לדייט) | `app/app/companion` + `app/api/companion` |

## הרצה

```bash
npm install
npm run dev        # http://localhost:3000
```

- הדמו רץ כולו בדפדפן (localStorage) — אפס תלות בשרת. פרסונות דמו מגיבות בצ'אט.
- `ANTHROPIC_API_KEY` בסביבה ⇒ ה-Companion עונה עם Claude (עם system prompt בטיחותי). בלי מפתח — מאמן מקומי rule-based.

## חיבור Supabase (כשמוכנים)

`supabase/migrations/0001_init.sql` — הסכמה המלאה (8 טבלאות, RLS, ledger append-only).
שכבת הנתונים בדמו (`lib/store.tsx`) משקפת את הסכמה 1:1, כך שההחלפה היא שכבת-נתונים בלבד.

## עקרונות שאסור לשבור

- **אין P2P** — כסף עובר רק דרך ה-Goal Fund. שינוי מצב = שורה חדשה (append-only).
- **Compliance vocabulary בלבד** על כל משטח ציבורי — mentorship / צמיחה / תקציב תמיכה.
- **ציון ARIA הוא MODEL_ONLY** — ממיין את הפיד, לעולם לא מוצג כציון. מה שמוצג: "למה ההתאמה".
- **פרטיות כברירת מחדל** — טווח גיל בלבד, אזור בלבד, אווטאר גנרטיבי, matches-only.
- כל פעולת Ops נרשמת ב-audit log. אין override שקט.
