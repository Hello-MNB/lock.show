// Goal Fund escrow state machine — APPEND-ONLY ledger.
// held → dual_confirm → released | disputed → refunded
// No peer-to-peer path exists anywhere. State changes create NEW rows referencing the prior row.

import type { EscrowState, GoalFundTxn } from "./types";

export const COMMISSION_PCT = 12;

const TRANSITIONS: Record<EscrowState, EscrowState[]> = {
  held: ["dual_confirm", "disputed", "refunded"],
  dual_confirm: ["released", "disputed"],
  released: [],
  disputed: ["refunded", "released"],
  refunded: [],
};

export function canTransition(from: EscrowState, to: EscrowState): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextTxn(
  prev: GoalFundTxn,
  to: EscrowState,
  patch: Partial<Pick<GoalFundTxn, "confirmedByProvider" | "confirmedByGrowth" | "note">> = {}
): GoalFundTxn {
  if (!canTransition(prev.state, to)) {
    throw new Error(`Illegal escrow transition ${prev.state} → ${to}`);
  }
  return {
    ...prev,
    ...patch,
    id: `gft_${Math.random().toString(36).slice(2, 10)}`,
    state: to,
    prevTxnId: prev.id,
    createdAt: new Date().toISOString(),
  };
}

export function openGoalFund(matchId: string, providerId: string, amount: number): GoalFundTxn {
  return {
    id: `gft_${Math.random().toString(36).slice(2, 10)}`,
    matchId,
    providerId,
    amount,
    currency: "ILS",
    state: "held",
    prevTxnId: null,
    commissionPct: COMMISSION_PCT,
    note: "Support Budget הופקד ומוחזק בנאמנות",
    confirmedByProvider: false,
    confirmedByGrowth: false,
    createdAt: new Date().toISOString(),
  };
}

export function commissionOf(txn: GoalFundTxn): number {
  return Math.round((txn.amount * txn.commissionPct) / 100);
}

export function payoutOf(txn: GoalFundTxn): number {
  return txn.amount - commissionOf(txn);
}

// The latest row per chain is the current state of that Goal Fund.
export function headTxns(all: GoalFundTxn[]): GoalFundTxn[] {
  const referenced = new Set(all.map((t) => t.prevTxnId).filter(Boolean));
  return all.filter((t) => !referenced.has(t.id));
}

export function chainOf(all: GoalFundTxn[], head: GoalFundTxn): GoalFundTxn[] {
  const byId = new Map(all.map((t) => [t.id, t]));
  const chain: GoalFundTxn[] = [head];
  let cur = head;
  while (cur.prevTxnId) {
    const prev = byId.get(cur.prevTxnId);
    if (!prev) break;
    chain.unshift(prev);
    cur = prev;
  }
  return chain;
}

export const ESCROW_STATE_HE: Record<EscrowState, string> = {
  held: "מוחזק בנאמנות",
  dual_confirm: "ממתין לאישור הדדי",
  released: "שוחרר",
  disputed: "במחלוקת",
  refunded: "הוחזר",
};
