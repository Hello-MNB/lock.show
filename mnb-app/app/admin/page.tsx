"use client";

// Ops console — verification queue, safety queue, escrow board, immutable audit log.
// Every ops action writes to the audit log; no silent overrides.

import Link from "next/link";
import { useStore } from "@/lib/store";
import { ESCROW_STATE_HE, headTxns } from "@/lib/escrow";
import { SideTag, VerifiedBadge } from "@/components/ui";

export default function Admin() {
  const { db, adminVerify, adminResolvePause, escrowAction } = useStore();

  const pendingVerifications = db.profiles.filter((p) => p.verificationStatus === "pending");
  const flagged = db.messages.filter((m) => m.safetyFlag !== "green");
  const escrows = headTxns(db.txns);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-gold-soft">MNB Ops Console</h1>
          <p className="text-sm text-ink-muted">תור אימותים · בטיחות · נאמנות · יומן ביקורת</p>
        </div>
        <Link href="/" className="btn-ghost">
          יציאה
        </Link>
      </header>

      <section className="card p-5">
        <h2 className="font-display text-lg mb-3">אימותים ממתינים ({pendingVerifications.length})</h2>
        {pendingVerifications.length === 0 && <p className="text-sm text-ink-faint">אין בקשות ממתינות.</p>}
        <ul className="space-y-2">
          {pendingVerifications.map((p) => (
            <li key={p.id} className="flex items-center gap-3 text-sm">
              <span className="font-semibold">{p.displayAlias}</span>
              <SideTag side={p.side} />
              <VerifiedBadge status={p.verificationStatus} />
              <button className="btn-ghost ms-auto" onClick={() => adminVerify(p.id)}>
                ✓ אישור אימות
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="font-display text-lg mb-3">תור בטיחות ({flagged.length})</h2>
        {flagged.length === 0 && <p className="text-sm text-ink-faint">אין הודעות מסומנות.</p>}
        <ul className="space-y-3">
          {flagged.map((m) => (
            <li key={m.id} className="border border-night-line rounded-xl p-3 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className={m.safetyFlag === "red" ? "text-danger" : "text-warn"}>
                  {m.safetyFlag === "red" ? "⛔ אדום" : "⚠ צהוב"}
                </span>
                <span className="text-ink-faint">{new Date(m.createdAt).toLocaleString("he-IL")}</span>
                <span className="text-ink-faint">match: {m.matchId}</span>
              </div>
              <p className="text-ink-muted mb-2">״{m.body}״</p>
              {db.pausedMatches.includes(m.matchId) && (
                <div className="flex gap-2">
                  <button className="btn-ghost" onClick={() => adminResolvePause(m.matchId, true)}>
                    שחרור השהיה
                  </button>
                  <span className="text-xs text-danger self-center">השיחה מושהית</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="font-display text-lg mb-3">Goal Funds ({escrows.length})</h2>
        {escrows.length === 0 && <p className="text-sm text-ink-faint">אין קרנות פעילות.</p>}
        <ul className="space-y-2 text-sm">
          {escrows.map((t) => (
            <li key={t.id} className="flex items-center gap-3">
              <span className="font-semibold">₪{t.amount.toLocaleString()}</span>
              <span className="text-gold">{ESCROW_STATE_HE[t.state]}</span>
              <span className="text-ink-faint">match: {t.matchId}</span>
              {t.state === "disputed" && (
                <span className="ms-auto flex gap-2">
                  <button className="btn-ghost" onClick={() => escrowAction(t.id, "release")}>
                    שחרור
                  </button>
                  <button className="btn-ghost" onClick={() => escrowAction(t.id, "refund")}>
                    החזר
                  </button>
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="font-display text-lg mb-3">יומן ביקורת (append-only)</h2>
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="text-ink-faint text-right">
              <tr>
                <th className="py-1 pe-3">זמן</th>
                <th className="py-1 pe-3">גורם</th>
                <th className="py-1 pe-3">פעולה</th>
                <th className="py-1">ישות</th>
              </tr>
            </thead>
            <tbody>
              {[...db.audit].reverse().map((a) => (
                <tr key={a.id} className="border-t border-night-line/50 text-ink-muted">
                  <td className="py-1.5 pe-3 whitespace-nowrap">{new Date(a.createdAt).toLocaleTimeString("he-IL")}</td>
                  <td className="py-1.5 pe-3">{a.actor}</td>
                  <td className="py-1.5 pe-3">{a.action}</td>
                  <td className="py-1.5">{a.entity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
