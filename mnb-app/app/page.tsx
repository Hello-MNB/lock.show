import Link from "next/link";

// Landing (self-marketing page). Compliance vocabulary only:
// mentorship / growth / protected Support Budget. No forbidden terms on any public surface.
export default function Landing() {
  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex-1 max-w-md mx-auto px-6 pt-16 pb-10 flex flex-col justify-center text-center">
        <p className="text-gold tracking-[0.35em] text-sm mb-4">MNB</p>
        <h1 className="font-display text-4xl leading-snug mb-4 text-ink">
          מקום שפוגש אותך.
          <br />
          <span className="text-gold-soft">מרגיש אותך. מלווה אותך.</span>
        </h1>
        <p className="text-ink-muted leading-relaxed mb-8">
          לא עוד אפליקציית היכרויות. מלווה אישית שבאמת מקשיבה, אנשים מאומתים בלבד,
          התאמה שמגיעה עם הסבר אמיתי — וכסף שמוגן בקרן עד ששני הצדדים מאשרים.
        </p>

        <div className="space-y-3 text-right mb-10">
          {[
            ["◈", "מלווה אישית", "שיחה, לא טופס. היא זוכרת אותך, שואלת, מתרגשת איתך — ומלווה אותך עד הדייט ואחריו."],
            ["✓", "אמון מובנה", "כל פרופיל עובר אימות. בלי פרופילים מזויפים, בלי משחקים."],
            ["▣", "קרן מוגנת (Goal Fund)", "תקציב תמיכה מוחזק בנאמנות ומשוחרר רק באישור הדדי. אף שקל לא עובר מיד ליד."],
          ].map(([icon, title, body]) => (
            <div key={title as string} className="card p-4 flex gap-3 items-start">
              <span className="text-gold text-xl">{icon}</span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-ink-muted leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <Link href="/onboarding" className="btn-gold text-center text-lg">
          בואו נכיר ✨
        </Link>
        <p className="text-xs text-ink-faint mt-4">
          הצטרפות בהזמנה · הפרטיות שלך מוגנת · גרסת הדגמה — ללא נתונים אמיתיים
        </p>
        <div className="gold-line my-8" />
        <Link href="/admin" className="text-xs text-ink-faint hover:text-ink-muted">
          כניסת צוות (Ops)
        </Link>
      </div>
    </main>
  );
}
