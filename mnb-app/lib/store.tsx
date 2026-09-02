"use client";

// Demo data layer: React context + localStorage persistence.
// Mirrors the Supabase schema 1:1 (see supabase/migrations/0001_init.sql) so swapping
// this provider for Supabase queries is a data-layer change only, not a UI rewrite.

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type {
  AuditEvent,
  AnalyticsEvent,
  ConsentRecord,
  GoalFundTxn,
  Match,
  Message,
  OnboardingAnswers,
  Profile,
  SafetyFlag,
} from "./types";
import { SEED_PROFILES } from "./seed";
import { buildWhyMatch, scorePair } from "./aria";
import { nextTxn, openGoalFund } from "./escrow";
import { scanMessage } from "./safety";

const STORAGE_KEY = "mnb-demo-v1";

interface DB {
  meId: string | null;
  profiles: Profile[];
  matches: Match[];
  messages: Message[];
  txns: GoalFundTxn[];
  consents: ConsentRecord[];
  audit: AuditEvent[];
  events: AnalyticsEvent[];
  pausedMatches: string[]; // safety hard-pause
  liked: string[]; // profile ids the current user liked
}

const EMPTY: DB = {
  meId: null,
  profiles: SEED_PROFILES,
  matches: [],
  messages: [],
  txns: [],
  consents: [],
  audit: [],
  events: [],
  pausedMatches: [],
  liked: [],
};

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

interface StoreApi {
  db: DB;
  me: Profile | null;
  completeOnboarding: (answers: OnboardingAnswers, consents: ConsentRecord["consentType"][]) => Profile;
  like: (profileId: string) => Match | null;
  sendMessage: (matchId: string, body: string, senderId?: string) => { message: Message; flag: SafetyFlag };
  fundGoal: (matchId: string, amount: number) => GoalFundTxn;
  escrowAction: (
    headId: string,
    action: "confirm_provider" | "confirm_growth" | "release" | "dispute" | "refund"
  ) => void;
  requestVerification: () => void;
  adminVerify: (profileId: string) => void;
  adminResolvePause: (matchId: string, resume: boolean) => void;
  track: (name: string, props?: Record<string, unknown>) => void;
  resetDemo: () => void;
  signOut: () => void;
}

const StoreCtx = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDb({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      /* corrupted local state falls back to seed */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db, hydrated]);

  const api = useMemo<StoreApi>(() => {
    const audit = (actor: string, action: string, entity: string, payload: Record<string, unknown> = {}) => ({
      id: uid("aud"),
      actor,
      action,
      entity,
      payload,
      createdAt: new Date().toISOString(),
    });

    return {
      db,
      me: db.profiles.find((p) => p.id === db.meId) ?? null,

      completeOnboarding(answers, consentTypes) {
        const profile: Profile = {
          id: uid("me"),
          side: answers.side,
          displayAlias: answers.displayAlias,
          ageBand: answers.ageBand,
          cityDisplay: answers.cityDisplay,
          professionCategory: answers.professionCategory,
          goalsPrimary: answers.goalsPrimary,
          intentLevel: answers.intentLevel,
          communicationStyle: answers.communicationStyle,
          pacing: answers.pacing,
          visibilityMode: answers.visibilityMode,
          premiumTier: "none",
          verificationStatus: "unverified",
          trustSignals: [],
          about: answers.whatDidntWork ? `מה שחשוב לי: ${answers.goalsPrimary}` : answers.goalsPrimary,
          avatarHue: Math.floor(Math.random() * 360),
          marketPack: "IL",
          createdAt: new Date().toISOString(),
        };
        const consents: ConsentRecord[] = consentTypes.map((t) => ({
          id: uid("cns"),
          profileId: profile.id,
          consentType: t,
          grantedAt: new Date().toISOString(),
          revokedAt: null,
        }));
        setDb((d) => ({
          ...d,
          meId: profile.id,
          profiles: [...d.profiles, profile],
          consents: [...d.consents, ...consents],
          events: [
            ...d.events,
            { id: uid("evt"), profileId: profile.id, name: "activation_onboarded", props: {}, createdAt: new Date().toISOString() },
          ],
          audit: [...d.audit, audit(profile.id, "profile_created", `profile:${profile.id}`)],
        }));
        return profile;
      },

      like(profileId) {
        const me = db.profiles.find((p) => p.id === db.meId);
        const other = db.profiles.find((p) => p.id === profileId);
        if (!me || !other) return null;
        const { score, breakdown } = scorePair(me, other);
        const match: Match = {
          id: uid("mtc"),
          providerId: me.side === "provider" ? me.id : other.id,
          growthId: me.side === "growth" ? me.id : other.id,
          ariaScore: score,
          scoreBreakdown: breakdown,
          whyMatchText: buildWhyMatch(me, other, breakdown),
          // Demo: seed personas accept a like immediately so the full loop is walkable.
          state: "mutual",
          createdAt: new Date().toISOString(),
        };
        setDb((d) => ({
          ...d,
          liked: [...d.liked, profileId],
          matches: [...d.matches, match],
          events: [
            ...d.events,
            { id: uid("evt"), profileId: me.id, name: "match_mutual", props: { matchId: match.id }, createdAt: new Date().toISOString() },
          ],
          audit: [...d.audit, audit(me.id, "match_created", `match:${match.id}`, { ariaScore: score })],
        }));
        return match;
      },

      sendMessage(matchId, body, senderId) {
        const me = db.profiles.find((p) => p.id === db.meId);
        const flag = scanMessage(body);
        const message: Message = {
          id: uid("msg"),
          matchId,
          senderId: senderId ?? me?.id ?? "unknown",
          body,
          safetyFlag: flag,
          createdAt: new Date().toISOString(),
        };
        setDb((d) => {
          const paused = flag === "red" && !d.pausedMatches.includes(matchId);
          return {
            ...d,
            messages: [...d.messages, message],
            pausedMatches: paused ? [...d.pausedMatches, matchId] : d.pausedMatches,
            audit:
              flag === "green"
                ? d.audit
                : [...d.audit, audit("safety-engine", `safety_flag_${flag}`, `match:${matchId}`, { messageId: message.id })],
          };
        });
        return { message, flag };
      },

      fundGoal(matchId, amount) {
        const txn = openGoalFund(matchId, db.matches.find((m) => m.id === matchId)?.providerId ?? "", amount);
        setDb((d) => ({
          ...d,
          txns: [...d.txns, txn],
          audit: [...d.audit, audit(d.meId ?? "unknown", "goal_fund_held", `txn:${txn.id}`, { amount })],
          events: [
            ...d.events,
            { id: uid("evt"), profileId: d.meId ?? "", name: "goal_fund_opened", props: { amount }, createdAt: new Date().toISOString() },
          ],
        }));
        return txn;
      },

      escrowAction(headId, action) {
        setDb((d) => {
          const head = d.txns.find((t) => t.id === headId);
          if (!head) return d;
          let updated: GoalFundTxn | null = null;
          if (action === "confirm_provider" || action === "confirm_growth") {
            const confirmedByProvider = head.confirmedByProvider || action === "confirm_provider";
            const confirmedByGrowth = head.confirmedByGrowth || action === "confirm_growth";
            const both = confirmedByProvider && confirmedByGrowth;
            updated = nextTxn(head, both ? "dual_confirm" : head.state === "held" ? "held" : head.state, {
              confirmedByProvider,
              confirmedByGrowth,
              note: both ? "אישור הדדי התקבל" : "אישור צד אחד התקבל",
            });
            // Staying in the same state still appends a row — the ledger records the confirmation.
            if (!both) updated = { ...updated, state: head.state };
          } else if (action === "release") {
            updated = nextTxn(head, "released", { note: "הקרן שוחררה בניכוי עמלה" });
          } else if (action === "dispute") {
            updated = nextTxn(head, "disputed", { note: "נפתחה מחלוקת — צוות MNB בודק" });
          } else if (action === "refund") {
            updated = nextTxn(head, "refunded", { note: "הקרן הוחזרה למפקיד" });
          }
          if (!updated) return d;
          return {
            ...d,
            txns: [...d.txns, updated],
            audit: [...d.audit, audit(d.meId ?? "ops", `escrow_${action}`, `txn:${updated.id}`, { prev: head.id })],
          };
        });
      },

      requestVerification() {
        setDb((d) => ({
          ...d,
          profiles: d.profiles.map((p) => (p.id === d.meId ? { ...p, verificationStatus: "pending" } : p)),
          audit: [...d.audit, audit(d.meId ?? "unknown", "verification_requested", `profile:${d.meId}`)],
        }));
      },

      adminVerify(profileId) {
        setDb((d) => ({
          ...d,
          profiles: d.profiles.map((p) =>
            p.id === profileId
              ? { ...p, verificationStatus: "verified", trustSignals: Array.from(new Set([...p.trustSignals, "verified"])) }
              : p
          ),
          audit: [...d.audit, audit("ops", "verification_approved", `profile:${profileId}`)],
        }));
      },

      adminResolvePause(matchId, resume) {
        setDb((d) => ({
          ...d,
          pausedMatches: resume ? d.pausedMatches.filter((m) => m !== matchId) : d.pausedMatches,
          audit: [...d.audit, audit("ops", resume ? "safety_pause_lifted" : "safety_pause_kept", `match:${matchId}`)],
        }));
      },

      track(name, props = {}) {
        setDb((d) => ({
          ...d,
          events: [...d.events, { id: uid("evt"), profileId: d.meId ?? "", name, props, createdAt: new Date().toISOString() }],
        }));
      },

      resetDemo() {
        localStorage.removeItem(STORAGE_KEY);
        setDb(EMPTY);
      },

      signOut() {
        setDb((d) => ({ ...d, meId: null }));
      },
    };
  }, [db]);

  if (!hydrated) return null;
  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
