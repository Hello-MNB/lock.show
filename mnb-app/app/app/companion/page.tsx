"use client";

// The ongoing Companion — remembers you, celebrates milestones, coaches before the date,
// re-engages personally. Rule-based v1; /api/companion upgrades replies with Claude when a key is set.

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { TopBar } from "@/components/ui";

interface Turn {
  from: "companion" | "me";
  text: string;
}

const QUICK_ASKS = [
  "טיפים לדייט ראשון",
  "מה כדאי לכתוב לה?",
  "אני קצת לחוצה",
  "איך עובד ה-Goal Fund?",
];

function localCoach(question: string, name: string): string {
  if (/דייט|פגישה|להיפגש/.test(question))
    return `${name}, שלושה דברים שעובדים תמיד: מקום ציבורי ונעים שקל להגיע אליו · שאלה אחת טובה שהכנת מראש ("מה ריגש אותך השבוע?") · וסיום בזמן — עדיף להישאר עם טעם של עוד. ואני זמינה גם אחרי, לספר לי איך היה 💛`;
  if (/לכתוב|הודעה|פתיח/.test(question))
    return `הכי טוב לפתוח ממשהו אמיתי מהפרופיל או מ"למה הותאמתם". משפט אחד אישי + שאלה פתוחה. בלי "היי מה נשמע" — זה נבלע. רוצה שאנסח לך פתיח?`;
  if (/לחוצ|חושש|מפחד|מתרגש/.test(question))
    return `זה טבעי לגמרי, ואפילו סימן טוב — אכפת לך. תזכרי: הצד השני מאומת, השיחה מוגנת, ואת קובעת את הקצב. אם משהו מרגיש לא נכון — כפתור הבטיחות תמיד שם, ואני איתך.`;
  if (/goal|fund|קרן|כסף|תקציב/i.test(question))
    return `ה-Goal Fund הוא ההבטחה שלנו: תקציב תמיכה מופקד לקרן נאמנות — לא לאדם. הוא משוחרר רק כששני הצדדים מאשרים שהמפגש התקיים. אף שקל לא עובר מיד ליד, ואין תשלומים מחוץ למערכת.`;
  return `אני כאן בשבילך, ${name} 💛 אפשר לשאול אותי על התאמות, ניסוח הודעות, הכנה לדייט או על ההגנות שלך במערכת.`;
}

export default function Companion() {
  const { me, db, track } = useStore();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!me) return;
    const matches = db.matches.filter((m) => m.providerId === me.id || m.growthId === me.id).length;
    const opening =
      matches > 0
        ? `ברוכה השבה, ${me.displayAlias} 💛 יש לך ${matches} התאמות פעילות — ואני זוכרת מה חיפשת: ${me.goalsPrimary}. איך אפשר לעזור היום?`
        : `היי ${me.displayAlias} 💛 אני כאן איתך. עוד לא יצרת התאמות — רוצה שנעבור יחד על מי שבחרתי לך בגילוי?`;
    setTurns([{ from: "companion", text: me.side === "provider" ? opening.replace("ברוכה השבה", "ברוך שובך") : opening }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, typing]);

  async function ask(q: string) {
    if (!me) return;
    setTurns((t) => [...t, { from: "me", text: q }]);
    setTyping(true);
    track("companion_asked", { q });

    let reply: string | null = null;
    try {
      const res = await fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          profile: { alias: me.displayAlias, side: me.side, goals: me.goalsPrimary },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        reply = data.reply ?? null;
      }
    } catch {
      /* offline / no key — fall back to the local coach */
    }

    setTimeout(() => {
      setTurns((t) => [...t, { from: "companion", text: reply ?? localCoach(q, me.displayAlias) }]);
      setTyping(false);
    }, 500);
  }

  if (!me) return null;

  return (
    <main className="max-w-md mx-auto min-h-dvh flex flex-col">
      <TopBar title="המלווה שלך ◈" />
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 pb-44">
        {turns.map((t, i) => (
          <div key={i} className={`rise flex ${t.from === "me" ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed text-[15px] ${
                t.from === "companion"
                  ? "bg-night-raised border border-night-line rounded-tl-sm"
                  : "bg-gold/15 border border-gold/30 rounded-tr-sm"
              }`}
            >
              {t.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-end">
            <div className="bg-night-raised border border-night-line rounded-2xl px-4 py-3 text-ink-faint">…</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="fixed bottom-16 inset-x-0 bg-night-surface/95 backdrop-blur border-t border-night-line">
        <div className="max-w-md mx-auto p-3 space-y-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {QUICK_ASKS.map((q) => (
              <button key={q} className="chip whitespace-nowrap" onClick={() => ask(q)}>
                {q}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) {
                ask(input.trim());
                setInput("");
              }
            }}
          >
            <input
              className="flex-1 bg-night-raised border border-night-line rounded-full px-4 py-3 outline-none focus:border-gold text-[15px]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ספרו לי מה על הלב…"
            />
            <button className="btn-gold" type="submit" disabled={!input.trim() || typing}>
              שלח
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
