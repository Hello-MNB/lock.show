"use client";

// S-402 — chat with real-time safety scan (Module 3) + Goal Fund entry point (Module 4).
// Safety is always one tap away. Red flag = hard pause (ops review). Yellow = protective nudge.
// The demo persona replies through the same store path so the loop is walkable end-to-end.

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Avatar, VerifiedBadge } from "@/components/ui";
import { SAFETY_NUDGE_HE } from "@/lib/safety";
import { headTxns, ESCROW_STATE_HE } from "@/lib/escrow";

const PERSONA_REPLIES = [
  "היי 🙂 שמחה שכתבת. קראתי את הפרופיל שלך וסיקרנת אותי",
  "מסכימה לגמרי. מה הביא אותך לכאן דווקא?",
  "אהבתי את הכנות הזאת. אני מעריכה אנשים שיודעים מה הם רוצים",
  "נשמע לי טוב 🙂 איפה נוח לך להיפגש?",
  "מחכה כבר. תודה שאתה עושה את זה בקצב נעים",
];

export default function Chat() {
  const params = useParams<{ id: string }>();
  const matchId = params.id;
  const { me, db, sendMessage, adminResolvePause } = useStore();
  const [input, setInput] = useState("");
  const [nudge, setNudge] = useState<string | null>(null);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [replyQueued, setReplyQueued] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const match = db.matches.find((m) => m.id === matchId);
  const otherId = match ? (match.providerId === me?.id ? match.growthId : match.providerId) : null;
  const other = db.profiles.find((p) => p.id === otherId) ?? null;
  const msgs = db.messages.filter((m) => m.matchId === matchId);
  const paused = db.pausedMatches.includes(matchId);
  const fund = headTxns(db.txns).find((t) => t.matchId === matchId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length, nudge]);

  // Demo persona replies after the user's message lands, via the same scanned store path.
  useEffect(() => {
    if (!replyQueued || paused || !other) return;
    const t = setTimeout(() => {
      const replyIdx = Math.min(
        msgs.filter((m) => m.senderId === other.id).length,
        PERSONA_REPLIES.length - 1
      );
      sendMessage(matchId, PERSONA_REPLIES[replyIdx], other.id);
      setReplyQueued(false);
    }, 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replyQueued]);

  if (!me || !match || !other) {
    return (
      <main className="max-w-md mx-auto p-8 text-center text-ink-muted">
        השיחה לא נמצאה. <Link href="/app/matches" className="text-gold">חזרה להתאמות</Link>
      </main>
    );
  }

  function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || paused) return;
    const { flag } = sendMessage(matchId, input.trim());
    if (flag !== "green") setNudge(SAFETY_NUDGE_HE[flag]);
    else setReplyQueued(true);
    setInput("");
  }

  return (
    <main className="max-w-md mx-auto min-h-dvh flex flex-col">
      <header className="sticky top-0 z-30 bg-night/90 backdrop-blur border-b border-night-line px-4 h-16 flex items-center gap-3">
        <Link href="/app/matches" className="text-ink-muted text-xl">→</Link>
        <Avatar profile={other} size={40} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display">{other.displayAlias}</p>
            <VerifiedBadge status={other.verificationStatus} />
          </div>
          <p className="text-[11px] text-ink-faint truncate">{match.whyMatchText}</p>
        </div>
        <button onClick={() => setSafetyOpen(true)} className="text-xl" title="בטיחות" aria-label="בטיחות">
          🛟
        </button>
      </header>

      {fund && (
        <Link href="/app/wallet" className="bg-gold/10 border-b border-gold/25 px-4 py-2 text-sm flex items-center gap-2">
          <span>▣</span>
          <span className="text-gold">
            Goal Fund פעיל · ₪{fund.amount} · {ESCROW_STATE_HE[fund.state]}
          </span>
          <span className="ms-auto text-ink-faint">לניהול ←</span>
        </Link>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 pb-36">
        {msgs.length === 0 && (
          <div className="card p-4 text-sm text-ink-muted leading-relaxed">
            ◈ טיפ מהמלווה: תתחילו ממה שסיקרן אתכם בהתאמה. למשל — {match.whyMatchText.split("·")[0]}
          </div>
        )}
        {msgs.map((m) => {
          const mine = m.senderId === me.id;
          return (
            <div key={m.id} className={`rise flex ${mine ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed text-[15px] ${
                  mine
                    ? "bg-gold/15 border border-gold/30 rounded-tr-sm"
                    : "bg-night-raised border border-night-line rounded-tl-sm"
                } ${m.safetyFlag === "yellow" ? "border-warn/60" : ""} ${m.safetyFlag === "red" ? "border-danger/70" : ""}`}
              >
                {m.body}
                {m.safetyFlag === "yellow" && <p className="text-[11px] text-warn mt-1">⚠ סומן לבדיקה</p>}
                {m.safetyFlag === "red" && <p className="text-[11px] text-danger mt-1">⛔ הודעה זו הושהתה</p>}
              </div>
            </div>
          );
        })}
        {nudge && (
          <div className="pop bg-night-raised border border-warn/50 rounded-xl p-4 text-sm leading-relaxed">
            <p className="text-warn mb-1">◈ המלווה שלך</p>
            {nudge}
            <button className="block mt-2 text-gold text-sm" onClick={() => setNudge(null)}>
              הבנתי, תודה
            </button>
          </div>
        )}
        {paused && (
          <div className="bg-danger/10 border border-danger/40 rounded-xl p-4 text-sm leading-relaxed text-center">
            <p className="text-danger font-semibold mb-1">השיחה מושהית לבטיחותך</p>
            צוות MNB בודק את השיחה. אפשר לפנות אלינו מכל מסך דרך כפתור הבטיחות.
            <button className="block mx-auto mt-2 text-ink-faint text-xs underline" onClick={() => adminResolvePause(matchId, true)}>
              (דמו: שחרור השהיה כאילו Ops אישר)
            </button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-night-surface/95 backdrop-blur border-t border-night-line">
        <div className="max-w-md mx-auto p-3 space-y-2">
          {me.side === "provider" && !fund && (
            <Link
              href={`/app/wallet?match=${matchId}`}
              className="block text-center text-sm text-gold border border-gold/40 rounded-full py-2 hover:bg-gold/10 transition"
            >
              ▣ פתח Goal Fund — תקציב תמיכה מוגן עד אישור הדדי
            </Link>
          )}
          <form className="flex gap-2" onSubmit={onSend}>
            <input
              className="flex-1 bg-night-raised border border-night-line rounded-full px-4 py-3 outline-none focus:border-gold text-[15px] disabled:opacity-40"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={paused ? "השיחה מושהית" : "כתבו הודעה…"}
              disabled={paused}
            />
            <button className="btn-gold" type="submit" disabled={!input.trim() || paused}>
              שלח
            </button>
          </form>
        </div>
      </div>

      {safetyOpen && (
        <div className="fixed inset-0 z-50 bg-night/85 backdrop-blur flex items-end" onClick={() => setSafetyOpen(false)}>
          <div
            className="w-full max-w-md mx-auto bg-night-surface border-t border-night-line rounded-t-3xl p-6 pop"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl text-gold-soft mb-3">🛟 הבטיחות שלך קודמת לכול</h2>
            <ul className="space-y-3 text-sm text-ink-muted leading-relaxed">
              <li>• כל שיחה נסרקת בזמן אמת. לחץ, איומים או ניסיון להוציא כסף מחוץ למערכת — נעצרים.</li>
              <li>• כסף עובר רק דרך ה-Goal Fund: מוחזק בנאמנות, משוחרר רק כששני הצדדים מאשרים.</li>
              <li>• אפשר להשהות שיחה, לדווח או לחסום — בלי שהצד השני יידע.</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <button className="btn-ghost flex-1" onClick={() => setSafetyOpen(false)}>
                סגור
              </button>
              <button
                className="border border-danger/50 text-danger rounded-full px-5 py-2.5 flex-1"
                onClick={() => {
                  adminResolvePause(matchId, false);
                  setSafetyOpen(false);
                }}
              >
                דיווח לצוות
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
