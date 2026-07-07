// ARIA v1 — rule-based weighted matching (MASTER-AZ: intent 30 / lifestyle 25 / comms 25 / trust+privacy 20).
// The numeric score is MODEL_ONLY: it orders the feed, it is never rendered as a grade.
// What the user sees is whyMatchText — a plain, warm explanation.

import type { Match, Profile } from "./types";

const WEIGHTS = { intent: 30, lifestyle: 25, comms: 25, trust: 20 } as const;

function intentAffinity(a: Profile, b: Profile): number {
  // Intent alignment is the #1 escrow predictor (Truth-Lite). Closer levels = stronger.
  const gap = Math.abs(a.intentLevel - b.intentLevel);
  return Math.max(0, 1 - gap / 4);
}

function lifestyleAffinity(a: Profile, b: Profile): number {
  let score = 0;
  if (a.cityDisplay === b.cityDisplay) score += 0.6;
  else score += 0.25; // different city is friction, not a blocker
  if (a.pacing === b.pacing) score += 0.4;
  else if (
    (a.pacing === "steady" && b.pacing !== a.pacing) ||
    (b.pacing === "steady" && a.pacing !== b.pacing)
  )
    score += 0.25; // steady bridges slow/fast
  return Math.min(1, score);
}

const COMMS_BRIDGE: Record<string, string[]> = {
  warm: ["warm", "playful", "reserved"],
  direct: ["direct", "reserved"],
  playful: ["playful", "warm"],
  reserved: ["reserved", "warm", "direct"],
};

function commsAffinity(a: Profile, b: Profile): number {
  if (a.communicationStyle === b.communicationStyle) return 1;
  return COMMS_BRIDGE[a.communicationStyle]?.includes(b.communicationStyle) ? 0.7 : 0.35;
}

function trustAffinity(a: Profile, b: Profile): number {
  let score = 0;
  if (a.verificationStatus === "verified") score += 0.5;
  if (b.verificationStatus === "verified") score += 0.5;
  return score;
}

const STYLE_HE: Record<Profile["communicationStyle"], string> = {
  warm: "חמה ומכילה",
  direct: "ישירה ובגובה העיניים",
  playful: "קלילה ומשועשעת",
  reserved: "שקטה ומדודה",
};

const PACING_HE: Record<Profile["pacing"], string> = {
  slow: "בקצב רגוע",
  steady: "צעד אחר צעד",
  fast: "בלי למרוח",
};

export function buildWhyMatch(viewer: Profile, other: Profile, parts: Match["scoreBreakdown"]): string {
  const reasons: string[] = [];
  if (parts.intent >= WEIGHTS.intent * 0.7)
    reasons.push("שניכם מחפשים את אותו סוג של קשר — זה הבסיס הכי חזק שיש");
  if (viewer.cityDisplay === other.cityDisplay) reasons.push(`שניכם באזור ${other.cityDisplay}`);
  if (parts.comms >= WEIGHTS.comms * 0.7)
    reasons.push(`סגנון התקשורת שלה — ${STYLE_HE[other.communicationStyle]} — מתחבר לשלך`);
  if (other.verificationStatus === "verified") reasons.push("הפרופיל שלה מאומת");
  if (viewer.pacing === other.pacing) reasons.push(`שניכם אוהבים להתקדם ${PACING_HE[other.pacing]}`);
  if (reasons.length === 0) reasons.push("יש כאן נקודת פתיחה מעניינת — שווה שיחה אחת");
  return reasons.slice(0, 3).join(" · ");
}

export function scorePair(a: Profile, b: Profile): { score: number; breakdown: Match["scoreBreakdown"] } {
  const breakdown = {
    intent: Math.round(intentAffinity(a, b) * WEIGHTS.intent),
    lifestyle: Math.round(lifestyleAffinity(a, b) * WEIGHTS.lifestyle),
    comms: Math.round(commsAffinity(a, b) * WEIGHTS.comms),
    trust: Math.round(trustAffinity(a, b) * WEIGHTS.trust),
  };
  const score = breakdown.intent + breakdown.lifestyle + breakdown.comms + breakdown.trust;
  return { score, breakdown };
}

export function rankCandidates(viewer: Profile, pool: Profile[]): Array<{
  profile: Profile;
  score: number;
  breakdown: Match["scoreBreakdown"];
  why: string;
}> {
  const otherSide = viewer.side === "provider" ? "growth" : "provider";
  return pool
    .filter((p) => p.side === otherSide && p.id !== viewer.id)
    .map((p) => {
      const { score, breakdown } = scorePair(viewer, p);
      return { profile: p, score, breakdown, why: buildWhyMatch(viewer, p, breakdown) };
    })
    .sort((x, y) => y.score - x.score);
}
