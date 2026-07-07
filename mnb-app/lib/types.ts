// Canon data model — mirrors supabase/migrations/0001_init.sql (MASTER-AZ v2.3 §2).
// Field visibility classes: PUBLIC / RESTRICTED / MODEL_ONLY / PRIVATE_SELF.

export type Side = "provider" | "growth";

export type VerificationStatus = "unverified" | "pending" | "verified";

export type Visibility = "matches_only" | "open";

export interface Profile {
  id: string;
  side: Side;
  displayAlias: string;
  ageBand: string; // e.g. "25-29" — never exact age in public
  cityDisplay: string;
  professionCategory: string;
  goalsPrimary: string; // PUBLIC
  intentLevel: 1 | 2 | 3 | 4 | 5; // MODEL_ONLY — the #1 escrow predictor
  communicationStyle: "warm" | "direct" | "playful" | "reserved";
  pacing: "slow" | "steady" | "fast";
  visibilityMode: Visibility;
  premiumTier: "none" | "premium" | "elite";
  verificationStatus: VerificationStatus;
  trustSignals: string[]; // e.g. ["verified", "safe_conduct"]
  about: string;
  avatarHue: number; // demo avatars are generated, no real photos
  marketPack: "IL";
  createdAt: string;
}

export interface CompanionMemory {
  id: string;
  profileId: string;
  kind: "session" | "longterm";
  content: string;
  salience: number; // 0..1
  createdAt: string;
}

export type MatchState = "suggested" | "mutual" | "declined";

export interface Match {
  id: string;
  providerId: string;
  growthId: string;
  ariaScore: number; // 0..100, MODEL_ONLY — never shown as a grade, powers ordering only
  scoreBreakdown: { intent: number; lifestyle: number; comms: number; trust: number };
  whyMatchText: string; // the human-facing explanation — this IS what we show
  state: MatchState;
  createdAt: string;
}

export type SafetyFlag = "green" | "yellow" | "red";

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  safetyFlag: SafetyFlag;
  createdAt: string;
}

// Goal Fund escrow — APPEND-ONLY. A state change is a NEW row referencing the prior one.
export type EscrowState =
  | "held"
  | "dual_confirm"
  | "released"
  | "disputed"
  | "refunded";

export interface GoalFundTxn {
  id: string;
  matchId: string;
  providerId: string;
  amount: number;
  currency: "ILS";
  state: EscrowState;
  prevTxnId: string | null;
  commissionPct: number; // 10–15
  note: string;
  confirmedByProvider: boolean;
  confirmedByGrowth: boolean;
  createdAt: string;
}

export interface ConsentRecord {
  id: string;
  profileId: string;
  consentType: "terms" | "data_processing" | "visibility" | "escrow" | "marketing";
  grantedAt: string;
  revokedAt: string | null;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  entity: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  profileId: string;
  name: string;
  props: Record<string, unknown>;
  createdAt: string;
}

export interface OnboardingAnswers {
  side: Side;
  displayAlias: string;
  ageBand: string;
  cityDisplay: string;
  professionCategory: string;
  goalsPrimary: string;
  feeling: string;
  whatDidntWork: string;
  communicationStyle: Profile["communicationStyle"];
  pacing: Profile["pacing"];
  intentLevel: Profile["intentLevel"];
  visibilityMode: Visibility;
}
