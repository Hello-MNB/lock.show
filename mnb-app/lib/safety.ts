// Real-time coercion / risk scan for chat (Module 3).
// Rule-based v1: green / yellow / red. Red triggers a hard safety pause; yellow a soft nudge.
// Every flag is written to the audit log. Replaceable by a model-based scanner later —
// the interface (scanMessage) stays the same.

import type { SafetyFlag } from "./types";

// Hebrew + English patterns. Yellow = pressure / off-platform payment hints.
// Red = explicit coercion, threats, or attempts to move money outside the Goal Fund.
const YELLOW_PATTERNS: RegExp[] = [
  /מספר\s*טלפון|תני\s*מספר|וואטסאפ|whatsapp/i,
  /ביט\s|paybox|העברה\s*בנקאית|מזומן/i,
  /כתובת\s*שלך|איפה\s*את\s*גרה/i,
  /תמונות?\s*(אישיות|פרטיות)|תשלחי\s*תמונה/i,
  /cash|venmo|paypal|bank\s*transfer/i,
];

const RED_PATTERNS: RegExp[] = [
  /חייבת|אין\s*לך\s*ברירה|תתחרטי|אני\s*יודע\s*איפה/i,
  /בלי\s*(האפליקציה|המערכת|האתר)\s*(נשלם|אשלם|תקבלי)/i,
  /תשלום\s*ישיר\s*בלעדיהם|נעקוף\s*את/i,
  /threat|or\s*else|you\s*must|no\s*choice/i,
];

export function scanMessage(body: string): SafetyFlag {
  if (RED_PATTERNS.some((p) => p.test(body))) return "red";
  if (YELLOW_PATTERNS.some((p) => p.test(body))) return "yellow";
  return "green";
}

export const SAFETY_NUDGE_HE: Record<Exclude<SafetyFlag, "green">, string> = {
  yellow:
    "שמנו לב שהשיחה נוגעת בפרטים אישיים או בתשלום מחוץ למערכת. ה-Goal Fund קיים כדי להגן על שניכם — כסף שעובר דרכו מוגן עד אישור הדדי.",
  red: "השיחה הושהתה לבטיחותך. צוות MNB קיבל התראה ויבדוק את השיחה. את לא חייבת להמשיך — ואנחנו כאן.",
};
