"use client";

// S-003 → S-101 → S-107: conversational onboarding with the Companion.
// A dialogue, not a form. Consent is contextual and explicit before profile creation.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDING_SCRIPT, stepPromptFor, FIRST_WIN_HE } from "@/lib/companion";
import { useStore } from "@/lib/store";
import type { OnboardingAnswers, Side } from "@/lib/types";

interface Bubble {
  from: "companion" | "me";
  text: string;
}

export default function Onboarding() {
  const router = useRouter();
  const { completeOnboarding, track, me } = useStore();
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [stepIdx, setStepIdx] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentData, setConsentData] = useState(false);
  const [finished, setFinished] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const step = ONBOARDING_SCRIPT[stepIdx];

  useEffect(() => {
    if (me && !finished) router.replace("/app/discover");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Companion "types" each prompt for a human feel.
  useEffect(() => {
    if (!step) return;
    setTyping(true);
    const t = setTimeout(() => {
      setBubbles((b) => [...b, { from: "companion", text: stepPromptFor(step, answers, answers.side as Side) }]);
      setTyping(false);
    }, 650);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [bubbles, typing]);

  function advance(raw: string, label?: string) {
    if (!step) return;
    if (step.field) {
      const value = step.parse ? step.parse(raw) : raw;
      setAnswers((a) => ({ ...a, [step.field as string]: value }));
    }
    if (step.kind !== "info") setBubbles((b) => [...b, { from: "me", text: label ?? raw }]);
    setStepIdx((i) => i + 1);
    setInput("");
  }

  function finish() {
    const a = answers as OnboardingAnswers;
    completeOnboarding(a, ["terms", "data_processing", "visibility"]);
    track("onboarding_completed", { side: a.side });
    setFinished(true);
    setTimeout(() => router.push("/app/discover"), 1600);
  }

  const isDone = step?.id === "done";
  const consentsOk = consentTerms && consentData;

  return (
    <main className="min-h-dvh flex flex-col max-w-md mx-auto">
      <header className="sticky top-0 z-30 bg-night/90 backdrop-blur border-b border-night-line px-4 h-14 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">◈</div>
        <div>
          <p className="font-display text-gold-soft leading-tight">המלווה שלך</p>
          <p className="text-[11px] text-ink-faint leading-tight">{typing ? "מקלידה…" : "כאן איתך"}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 pb-40">
        {bubbles.map((b, i) => (
          <div key={i} className={`rise flex ${b.from === "me" ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed text-[15px] ${
                b.from === "companion"
                  ? "bg-night-raised border border-night-line rounded-tl-sm"
                  : "bg-gold/15 border border-gold/30 rounded-tr-sm"
              }`}
            >
              {b.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-end">
            <div className="bg-night-raised border border-night-line rounded-2xl px-4 py-3 text-ink-faint">…</div>
          </div>
        )}
        {finished && (
          <div className="pop text-center py-6">
            <p className="text-2xl">🎉</p>
            <p className="text-gold-soft font-display text-lg">{FIRST_WIN_HE}</p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {!finished && step && !typing && (
        <div className="fixed bottom-0 inset-x-0 bg-night-surface/95 backdrop-blur border-t border-night-line">
          <div className="max-w-md mx-auto p-4 space-y-3">
            {step.kind === "info" && !isDone && (
              <button className="btn-gold w-full" onClick={() => advance("")}>
                יאללה, מתחילים
              </button>
            )}

            {isDone && (
              <div className="space-y-3">
                <label className="flex items-start gap-2 text-sm text-ink-muted">
                  <input type="checkbox" className="mt-1 accent-[#C9A75B]" checked={consentTerms} onChange={(e) => setConsentTerms(e.target.checked)} />
                  אני מאשר/ת את תנאי השימוש וכללי הקהילה
                </label>
                <label className="flex items-start gap-2 text-sm text-ink-muted">
                  <input type="checkbox" className="mt-1 accent-[#C9A75B]" checked={consentData} onChange={(e) => setConsentData(e.target.checked)} />
                  אני מסכים/ה שהמערכת תשתמש בתשובות שלי לצורך התאמה בלבד
                </label>
                <button className="btn-gold w-full" disabled={!consentsOk} onClick={finish}>
                  צרו לי פרופיל ✨
                </button>
              </div>
            )}

            {step.kind === "chips" && (
              <div className="flex flex-wrap gap-2 justify-center">
                {step.options?.(answers).map((o) => (
                  <button key={o.value} className="chip" onClick={() => advance(o.value, o.label)}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}

            {step.kind === "text" && (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (input.trim()) advance(input.trim());
                }}
              >
                <input
                  className="flex-1 bg-night-raised border border-night-line rounded-full px-4 py-3 outline-none focus:border-gold text-[15px]"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="כתבו כאן…"
                  autoFocus
                />
                <button className="btn-gold" type="submit" disabled={!input.trim()}>
                  שלח
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
