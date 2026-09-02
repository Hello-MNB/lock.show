"use client";

// Profile — self view + verification (Module 5) + privacy controls. N/A fields are omitted, never "missing".

import { useStore } from "@/lib/store";
import { Avatar, SideTag, TopBar, VerifiedBadge } from "@/components/ui";

export default function ProfilePage() {
  const { me, requestVerification, resetDemo, signOut, db } = useStore();
  if (!me) return null;

  const milestones = [
    { label: "פרופיל נוצר", done: true },
    { label: "התאמה ראשונה", done: db.matches.some((m) => m.providerId === me.id || m.growthId === me.id) },
    { label: "שיחה ראשונה", done: db.messages.some((m) => m.senderId === me.id) },
    {
      label: "Goal Fund ראשון",
      done: db.txns.some((t) => db.matches.some((m) => m.id === t.matchId && (m.providerId === me.id || m.growthId === me.id))),
    },
  ];

  return (
    <main className="max-w-md mx-auto">
      <TopBar title="הפרופיל שלי" />
      <div className="px-4 py-5 space-y-5">
        <section className="card p-5 flex items-center gap-4">
          <Avatar profile={me} size={72} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-2xl">{me.displayAlias}</h2>
              <SideTag side={me.side} />
            </div>
            <p className="text-sm text-ink-muted">
              {me.ageBand} · {me.cityDisplay} · {me.professionCategory}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <VerifiedBadge status={me.verificationStatus} />
              {me.trustSignals.includes("safe_conduct") && (
                <span className="text-xs text-ok border border-ok/40 rounded-full px-2 py-0.5">התנהלות בטוחה</span>
              )}
            </div>
          </div>
        </section>

        {me.verificationStatus === "unverified" && (
          <section className="card p-5">
            <h3 className="font-display text-lg text-gold-soft mb-1">אימות זהות</h3>
            <p className="text-sm text-ink-muted leading-relaxed mb-3">
              אימות (גיל + זהות) הוא מה שהופך את MNB למקום בטוח. התג ✓ מעלה משמעותית את איכות
              ההתאמות שלך. התהליך דיסקרטי — רק התג מוצג, לעולם לא המסמכים.
            </p>
            <button className="btn-gold w-full" onClick={requestVerification}>
              התחלת אימות (2 דקות)
            </button>
          </section>
        )}
        {me.verificationStatus === "pending" && (
          <section className="card p-5 text-center text-ink-muted text-sm">
            האימות שלך בבדיקה · בגרסה החיה: ספק KYC מאושר (Sumsub) בדיוק ברגע הצורך
          </section>
        )}

        <section className="card p-5">
          <h3 className="font-display text-lg text-gold-soft mb-3">הדרך שלך</h3>
          <ul className="space-y-2">
            {milestones.map((m) => (
              <li key={m.label} className="flex items-center gap-2 text-sm">
                <span className={m.done ? "text-ok" : "text-ink-faint"}>{m.done ? "✓" : "○"}</span>
                <span className={m.done ? "" : "text-ink-muted"}>{m.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <h3 className="font-display text-lg text-gold-soft mb-2">פרטיות</h3>
          <p className="text-sm text-ink-muted leading-relaxed">
            מצב נראות: {me.visibilityMode === "matches_only" ? "דיסקרטי — רק התאמות שאושרו רואות אותך" : "פתוח לחברים מאומתים"}.
            גיל מוצג כטווח בלבד. מיקום ברמת אזור. אפשר לבקש ייצוא או מחיקה של כל המידע שלך בכל רגע.
          </p>
        </section>

        <div className="flex gap-2">
          <button className="btn-ghost flex-1" onClick={signOut}>
            התנתקות
          </button>
          <button className="btn-ghost flex-1" onClick={resetDemo}>
            איפוס הדמו
          </button>
        </div>
      </div>
    </main>
  );
}
