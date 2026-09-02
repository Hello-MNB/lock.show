"use client";

// Wallet — Goal Fund escrow (Module 4). E-003 fund → E-006 held → E-007 dual-confirm → E-014 release.
// Append-only ledger rendered as a timeline. The user feels protection, not machinery.

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { TopBar } from "@/components/ui";
import { chainOf, commissionOf, headTxns, payoutOf, ESCROW_STATE_HE } from "@/lib/escrow";

const AMOUNTS = [500, 1000, 2000, 3500];

function WalletInner() {
  const { me, db, fundGoal, escrowAction, track } = useStore();
  const searchParams = useSearchParams();
  const preselectedMatch = searchParams.get("match");
  const [amount, setAmount] = useState<number>(1000);
  const [matchId, setMatchId] = useState<string>(preselectedMatch ?? "");

  if (!me) return null;

  const myMatches = db.matches.filter((m) => m.providerId === me.id || m.growthId === me.id);
  const heads = headTxns(db.txns).filter((t) => myMatches.some((m) => m.id === t.matchId));
  const openableMatches = myMatches.filter((m) => !heads.some((t) => t.matchId === m.id));

  function otherOf(mId: string) {
    const m = db.matches.find((x) => x.id === mId);
    if (!m) return null;
    return db.profiles.find((p) => p.id === (m.providerId === me!.id ? m.growthId : m.providerId)) ?? null;
  }

  return (
    <main className="max-w-md mx-auto">
      <TopBar title="ארנק · Goal Fund" />
      <div className="px-4 py-5 space-y-5">
        <div className="card p-4 text-sm text-ink-muted leading-relaxed">
          <p className="text-gold mb-1">▣ איך זה עובד</p>
          תקציב תמיכה מופקד לקרן מוגנת — לא עובר ישירות לאף אחד. הוא משוחרר רק כששני
          הצדדים מאשרים. אפשר לפתוח מחלוקת בכל שלב, וצוות MNB מכריע.
        </div>

        {me.side === "provider" && openableMatches.length > 0 && (
          <section className="card p-5 space-y-4">
            <h2 className="font-display text-lg text-gold-soft">פתיחת Goal Fund חדש</h2>
            <div>
              <p className="text-sm text-ink-muted mb-2">עבור מי?</p>
              <div className="flex flex-wrap gap-2">
                {openableMatches.map((m) => {
                  const other = otherOf(m.id);
                  return (
                    <button
                      key={m.id}
                      className={`chip ${matchId === m.id ? "border-gold text-gold" : ""}`}
                      onClick={() => setMatchId(m.id)}
                    >
                      {other?.displayAlias ?? m.id}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-sm text-ink-muted mb-2">סכום (₪)</p>
              <div className="flex flex-wrap gap-2">
                {AMOUNTS.map((a) => (
                  <button
                    key={a}
                    className={`chip ${amount === a ? "border-gold text-gold" : ""}`}
                    onClick={() => setAmount(a)}
                  >
                    ₪{a.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="btn-gold w-full"
              disabled={!matchId}
              onClick={() => {
                fundGoal(matchId, amount);
                track("goal_fund_funded", { amount });
                setMatchId("");
              }}
            >
              הפקדה מוגנת · ₪{amount.toLocaleString()}
            </button>
            <p className="text-[11px] text-ink-faint text-center">
              דמו — לא מתבצעת סליקה אמיתית. בגרסה החיה: ספק סליקה מאושר בלבד.
            </p>
          </section>
        )}

        {heads.length === 0 && (
          <div className="card p-6 text-center text-ink-muted">
            אין קרנות פעילות עדיין.
            {me.side === "growth" && " כשמישהו יפתח עבורך תקציב תמיכה — הוא יופיע כאן, מוגן."}
          </div>
        )}

        {heads.map((head) => {
          const other = otherOf(head.matchId);
          const chain = chainOf(db.txns, head);
          const meIsProvider = me.side === "provider";
          const iConfirmed = meIsProvider ? head.confirmedByProvider : head.confirmedByGrowth;
          return (
            <section key={head.id} className="card p-5 space-y-4 rise">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg">
                  Goal Fund · {other?.displayAlias ?? ""}
                </h3>
                <span className="text-xs border border-gold/40 text-gold rounded-full px-2.5 py-1">
                  {ESCROW_STATE_HE[head.state]}
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <p className="font-display text-3xl text-gold-soft">₪{head.amount.toLocaleString()}</p>
                <p className="text-xs text-ink-faint">
                  עמלת פלטפורמה {head.commissionPct}% (₪{commissionOf(head)}) · לשחרור: ₪{payoutOf(head).toLocaleString()}
                </p>
              </div>

              {/* Timeline — append-only chain rendered as the escrow story */}
              <ol className="border-r-2 border-night-line pr-4 space-y-2">
                {chain.map((t) => (
                  <li key={t.id} className="text-sm">
                    <span className="text-ink-muted">{new Date(t.createdAt).toLocaleString("he-IL")}</span>
                    <span className="mx-2 text-gold">·</span>
                    {t.note}
                  </li>
                ))}
              </ol>

              {(head.state === "held" || head.state === "dual_confirm") && (
                <div className="space-y-2">
                  {head.state === "held" && !iConfirmed && (
                    <button
                      className="btn-gold w-full"
                      onClick={() => escrowAction(head.id, meIsProvider ? "confirm_provider" : "confirm_growth")}
                    >
                      ✓ המפגש התקיים — אני מאשר/ת
                    </button>
                  )}
                  {head.state === "held" && iConfirmed && (
                    <p className="text-center text-sm text-ink-muted">האישור שלך נקלט · ממתינים לצד השני</p>
                  )}
                  {head.state === "held" && (
                    <button
                      className="w-full text-center text-sm text-ink-faint underline"
                      onClick={() => escrowAction(head.id, meIsProvider ? "confirm_growth" : "confirm_provider")}
                    >
                      (דמו: אישור הצד השני)
                    </button>
                  )}
                  {head.state === "dual_confirm" && (
                    <button className="btn-gold w-full" onClick={() => escrowAction(head.id, "release")}>
                      ▣ שחרור הקרן · ₪{payoutOf(head).toLocaleString()}
                    </button>
                  )}
                  <button
                    className="w-full border border-danger/40 text-danger rounded-full py-2.5 text-sm"
                    onClick={() => escrowAction(head.id, "dispute")}
                  >
                    פתיחת מחלוקת
                  </button>
                </div>
              )}

              {head.state === "disputed" && (
                <div className="flex gap-2">
                  <button className="btn-ghost flex-1" onClick={() => escrowAction(head.id, "release")}>
                    (Ops) שחרור
                  </button>
                  <button className="btn-ghost flex-1" onClick={() => escrowAction(head.id, "refund")}>
                    (Ops) החזר
                  </button>
                </div>
              )}

              {head.state === "released" && (
                <p className="text-center text-ok text-sm">✓ הקרן שוחררה · קבלה נשמרה ביומן</p>
              )}
              {head.state === "refunded" && (
                <p className="text-center text-ink-muted text-sm">הקרן הוחזרה למפקיד · נרשם ביומן</p>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}

export default function Wallet() {
  return (
    <Suspense fallback={null}>
      <WalletInner />
    </Suspense>
  );
}
