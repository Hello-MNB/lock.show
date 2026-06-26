import { PageShell, Wordmark } from '../../components/ui.jsx'

// Shown when Supabase keys are not yet in .env.local — so the app loads
// and explains the one setup step instead of crashing.
export default function SetupNotice() {
  return (
    <PageShell>
      <div className="text-center mb-6">
        <Wordmark className="justify-center mb-2" />
        <p className="text-muted">צעד הגדרה אחרון לפני שהאפליקציה רצה</p>
      </div>
      <div className="card space-y-4 text-sm leading-relaxed">
        <p className="text-soft font-bold">חיבור למסד הנתונים (Supabase) עדיין לא הוגדר.</p>
        <ol className="list-decimal pr-5 space-y-2 text-soft">
          <li>פתח פרויקט חינמי ב־<span className="text-accent">supabase.com</span> → New project.</li>
          <li>Project Settings → API → העתק את <code className="text-accent">Project URL</code> ואת <code className="text-accent">anon key</code>.</li>
          <li>הרץ את <code className="text-accent">app/supabase/schema.sql</code> ב־SQL Editor (פעם אחת).</li>
          <li>צור קובץ <code className="text-accent">.env.local</code> בתיקיית <code>app</code> לפי <code>.env.local.example</code>, והדבק את הערכים.</li>
          <li>הרץ מחדש <code className="text-accent">npm run dev</code>.</li>
        </ol>
        <p className="text-muted">
          ברגע שתוסיף את המפתחות — מסך זה ייעלם והאפליקציה תעבוד מלא.
        </p>
      </div>
    </PageShell>
  )
}
