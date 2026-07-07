"use client";

// S-203 — mutual matches list. Each row leads to chat; why-match is always visible.

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Avatar, TopBar, VerifiedBadge } from "@/components/ui";

export default function Matches() {
  const { me, db } = useStore();
  if (!me) return null;

  const mine = db.matches.filter((m) => m.providerId === me.id || m.growthId === me.id);

  return (
    <main className="max-w-md mx-auto">
      <TopBar title="התאמות" />
      <div className="px-4 py-5 space-y-3">
        {mine.length === 0 && (
          <div className="card p-6 text-center text-ink-muted">
            עוד אין התאמות. עברי ל<Link href="/app/discover" className="text-gold">גילוי</Link> — חיכיתי להראות לך כמה אנשים 💛
          </div>
        )}
        {mine.map((m) => {
          const otherId = m.providerId === me.id ? m.growthId : m.providerId;
          const other = db.profiles.find((p) => p.id === otherId);
          if (!other) return null;
          const lastMsg = [...db.messages].reverse().find((x) => x.matchId === m.id);
          const paused = db.pausedMatches.includes(m.id);
          return (
            <Link key={m.id} href={`/app/chat/${m.id}`} className="card p-4 flex gap-3 items-center rise hover:border-gold/40 transition">
              <Avatar profile={other} size={56} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display text-lg">{other.displayAlias}</p>
                  <VerifiedBadge status={other.verificationStatus} />
                  {paused && <span className="text-xs text-danger border border-danger/40 rounded-full px-2 py-0.5">מושהה</span>}
                </div>
                <p className="text-sm text-ink-muted truncate">
                  {lastMsg ? lastMsg.body : m.whyMatchText}
                </p>
              </div>
              <span className="text-ink-faint">←</span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
