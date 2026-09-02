"use client";

// S-201 — curated discovery. A short, high-quality ranked set (quality over volume,
// not swipe sprawl). Every card carries "why this fits" — explainable matching.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { rankCandidates } from "@/lib/aria";
import { useStore } from "@/lib/store";
import { Avatar, TopBar, VerifiedBadge } from "@/components/ui";

export default function Discover() {
  const { me, db, like, track } = useStore();
  const router = useRouter();
  const [celebrating, setCelebrating] = useState<string | null>(null);

  const ranked = useMemo(() => {
    if (!me) return [];
    return rankCandidates(me, db.profiles)
      .filter((r) => !db.liked.includes(r.profile.id))
      .slice(0, 5); // curated set — quality over volume
  }, [me, db.profiles, db.liked]);

  if (!me) return null;

  function onLike(profileId: string, alias: string) {
    const match = like(profileId);
    track("like_sent", { to: profileId });
    if (match) {
      setCelebrating(alias);
      setTimeout(() => {
        setCelebrating(null);
        router.push("/app/matches");
      }, 1500);
    }
  }

  return (
    <main className="max-w-md mx-auto">
      <TopBar title="גילוי" />
      <div className="px-4 py-5 space-y-4">
        <p className="text-sm text-ink-muted leading-relaxed">
          {me.displayAlias}, בחרתי עבורך מספר קטן של אנשים שבאמת יכולים להתאים — לא אינסוף
          פרופילים. לכל אחד יש סיבה.
        </p>

        {ranked.length === 0 && (
          <div className="card p-6 text-center text-ink-muted">
            אין כרגע התאמות חדשות. המלווה שלך תעדכן אותך ברגע שמישהו מתאים יצטרף 💛
          </div>
        )}

        {ranked.map(({ profile, why }) => (
          <article key={profile.id} className="card p-5 rise">
            <div className="flex items-start gap-4">
              <Avatar profile={profile} size={64} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display text-xl">{profile.displayAlias}</h2>
                  <span className="text-ink-faint text-sm">{profile.ageBand}</span>
                  <VerifiedBadge status={profile.verificationStatus} />
                </div>
                <p className="text-sm text-ink-muted">
                  {profile.professionCategory} · {profile.cityDisplay}
                </p>
              </div>
            </div>

            <p className="mt-3 text-[15px] leading-relaxed">{profile.about}</p>

            <div className="mt-3 bg-gold/8 border border-gold/25 rounded-xl px-3 py-2.5">
              <p className="text-xs text-gold mb-0.5">למה חשבתי עליכם ◈</p>
              <p className="text-sm text-ink leading-relaxed">{why}</p>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="btn-gold flex-1" onClick={() => onLike(profile.id, profile.displayAlias)}>
                ♡ מעניין אותי
              </button>
              <button className="btn-ghost" onClick={() => track("pass", { on: profile.id })}>
                לא הפעם
              </button>
            </div>
          </article>
        ))}
      </div>

      {celebrating && (
        <div className="fixed inset-0 z-50 bg-night/85 backdrop-blur flex items-center justify-center">
          <div className="pop text-center px-8">
            <p className="text-4xl mb-3">✨</p>
            <p className="font-display text-2xl text-gold-soft mb-1">יש התאמה!</p>
            <p className="text-ink-muted">{celebrating} גם סקרנית לגביך. פותחת לכם שיחה…</p>
          </div>
        </div>
      )}
    </main>
  );
}
