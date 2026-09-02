// The Companion — the heart of MNB. Conversational onboarding (S-101 → S-107):
// greets, asks how you feel, what you want, what hasn't worked — a dialogue, not a form.
// Rule-based script v1; each step captures a governed profile field silently.
// The /api/companion route can upgrade replies with Claude when ANTHROPIC_API_KEY is set.

import type { OnboardingAnswers, Side } from "./types";

export interface CompanionStep {
  id: keyof OnboardingAnswers | "welcome" | "done";
  prompt: (a: Partial<OnboardingAnswers>) => string;
  kind: "chips" | "text" | "info";
  options?: (a: Partial<OnboardingAnswers>) => { value: string; label: string }[];
  field?: keyof OnboardingAnswers;
  parse?: (raw: string) => unknown;
}

const AGE_BANDS_GROWTH = ["19-24", "25-29", "30-34", "35-38"];
const AGE_BANDS_PROVIDER = ["28-34", "35-44", "45-54", "55-65"];
const CITIES = ["תל אביב", "ירושלים", "חיפה", "באר שבע", "השרון", "המרכז", "הצפון", "הדרום"];

export const ONBOARDING_SCRIPT: CompanionStep[] = [
  {
    id: "welcome",
    kind: "info",
    prompt: () =>
      "היי, נעים להכיר 💛 אני המלווה האישית שלך ב-MNB. אין כאן טפסים — רק שיחה. כל מה שתספרי לי נשאר בינינו, ומשמש רק כדי למצוא לך התאמה אמיתית. מוכנים להתחיל?",
  },
  {
    id: "side",
    kind: "chips",
    field: "side",
    prompt: () => "קודם כול — איך היית רוצה להצטרף?",
    options: () => [
      { value: "growth", label: "אני כאן כדי לצמוח ולהכיר (Growth)" },
      { value: "provider", label: "אני כאן כדי להעניק ולהכיר (Provider)" },
    ],
  },
  {
    id: "displayAlias",
    kind: "text",
    field: "displayAlias",
    prompt: () => "איך תרצי שיקראו לך כאן? שם פרטי או כינוי — בלי שם משפחה. הפרטיות שלך קודמת לכול.",
  },
  {
    id: "feeling",
    kind: "chips",
    field: "feeling",
    prompt: (a) => `${a.displayAlias || ""}, לפני הכול — איך את מרגישה עם עולם ההיכרויות כרגע?`,
    options: () => [
      { value: "tired", label: "עייפה מאפליקציות" },
      { value: "hopeful", label: "אופטימית וסקרנית" },
      { value: "cautious", label: "זהירה, נכוותי בעבר" },
      { value: "excited", label: "מתרגשת להתחיל" },
    ],
  },
  {
    id: "whatDidntWork",
    kind: "text",
    field: "whatDidntWork",
    prompt: () =>
      "אני שומעת אותך. ספרי לי במשפט — מה לא עבד לך עד היום? (זה עוזר לי לא לחזור על אותן טעויות)",
  },
  {
    id: "goalsPrimary",
    kind: "chips",
    field: "goalsPrimary",
    prompt: () => "ומה הלב שלך מחפש עכשיו?",
    options: () => [
      { value: "קשר משמעותי עם ליווי וצמיחה", label: "קשר משמעותי עם ליווי וצמיחה" },
      { value: "חיבור איכותי בלי משחקים", label: "חיבור איכותי בלי משחקים" },
      { value: "מנטורות ותמיכה אמיתית", label: "מנטורות ותמיכה אמיתית" },
      { value: "להכיר לאט ולראות לאן זה הולך", label: "להכיר לאט ולראות לאן זה הולך" },
    ],
  },
  {
    id: "intentLevel",
    kind: "chips",
    field: "intentLevel",
    parse: (raw) => Number(raw) as OnboardingAnswers["intentLevel"],
    prompt: () => "עד כמה את רצינית לגבי קשר מחייב כרגע? (אין תשובה נכונה — רק תשובה כנה)",
    options: () => [
      { value: "2", label: "בודקת את המים" },
      { value: "3", label: "פתוחה לראות" },
      { value: "4", label: "רצינית" },
      { value: "5", label: "מאוד רצינית" },
    ],
  },
  {
    id: "ageBand",
    kind: "chips",
    field: "ageBand",
    prompt: () => "באיזה טווח גילאים את? (מציגים תמיד טווח, אף פעם לא גיל מדויק)",
    options: (a) =>
      (a.side === "provider" ? AGE_BANDS_PROVIDER : AGE_BANDS_GROWTH).map((b) => ({
        value: b,
        label: b,
      })),
  },
  {
    id: "cityDisplay",
    kind: "chips",
    field: "cityDisplay",
    prompt: () => "ובאיזה אזור נוח לך להיפגש?",
    options: () => CITIES.map((c) => ({ value: c, label: c })),
  },
  {
    id: "professionCategory",
    kind: "text",
    field: "professionCategory",
    prompt: () => "במה את עוסקת? מספיק תחום כללי — למשל ״סטודנטית״, ״הייטק״, ״טיפול״.",
  },
  {
    id: "communicationStyle",
    kind: "chips",
    field: "communicationStyle",
    prompt: () => "איך היית מתארת את סגנון התקשורת שלך?",
    options: () => [
      { value: "warm", label: "חמה ומכילה" },
      { value: "direct", label: "ישירה" },
      { value: "playful", label: "קלילה ומשועשעת" },
      { value: "reserved", label: "שקטה ומדודה" },
    ],
  },
  {
    id: "pacing",
    kind: "chips",
    field: "pacing",
    prompt: () => "ובאיזה קצב נוח לך שדברים יתקדמו?",
    options: () => [
      { value: "slow", label: "לאט ובנחת" },
      { value: "steady", label: "צעד אחר צעד" },
      { value: "fast", label: "כשזה מרגיש נכון — קדימה" },
    ],
  },
  {
    id: "visibilityMode",
    kind: "chips",
    field: "visibilityMode",
    prompt: () =>
      "אחרון ובטח הכי חשוב — פרטיות. מי יוכל לראות את הפרופיל שלך? אפשר לשנות בכל רגע.",
    options: () => [
      { value: "matches_only", label: "רק התאמות שאושרו (דיסקרטי)" },
      { value: "open", label: "חברים מאומתים במערכת" },
    ],
  },
  {
    id: "done",
    kind: "info",
    prompt: (a) =>
      `${a.displayAlias}, את מוכנה ✨ הכנתי לך פרופיל ששומר על הפרטיות שלך, ואני כבר מסתכלת מי יכול להתאים לך באמת. דבר אחד ממני: כאן אף אחד לא ממהר, כסף עובר רק דרך קרן מוגנת, ואני איתך בכל שלב — גם לפני הדייט הראשון.`,
  },
];

// Provider-voice adjustments are minimal for MVP: same script, neutral phrasing where needed.
export function stepPromptFor(step: CompanionStep, answers: Partial<OnboardingAnswers>, side?: Side): string {
  let text = step.prompt(answers);
  if (side === "provider") {
    // Light masculine/neutral re-phrasing for the demo. Full native copy pass comes with the string table.
    text = text
      .replace(/מרגישה/g, "מרגיש")
      .replace(/עייפה/g, "עייף")
      .replace(/אופטימית וסקרנית/g, "אופטימי וסקרן")
      .replace(/זהירה, נכוותי/g, "זהיר, נכוויתי")
      .replace(/מתרגשת/g, "מתרגש")
      .replace(/ספרי/g, "ספר")
      .replace(/את עוסקת/g, "אתה עוסק")
      .replace(/היית מתארת/g, "היית מתאר")
      .replace(/חמה ומכילה/g, "חם ומכיל")
      .replace(/ישירה/g, "ישיר")
      .replace(/שקטה ומדודה/g, "שקט ומדוד")
      .replace(/רצינית/g, "רציני")
      .replace(/בודקת/g, "בודק")
      .replace(/פתוחה/g, "פתוח")
      .replace(/תרצי/g, "תרצה")
      .replace(/שתספרי/g, "שתספר")
      .replace(/את מוכנה/g, "אתה מוכן")
      .replace(/מסתכלת/g, "מסתכל")
      .replace(/שומעת/g, "שומע");
  }
  return text;
}

export const FIRST_WIN_HE = "🎉 הפרופיל שלך מוכן — הצעד הראשון מאחוריך";
