import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useLang } from '../../context/LangContext.jsx'
import { explorerCopy } from './passportKit.jsx'

// ── THE INTERACTIVE EVIDENCE EXPLORER (§8.7, owner verdict 21 Jul: "The
// PASSPORT is still TECHNICAL... designed INTERACTIVE and INTERESTING...
// Everything in ONE screen height as interactive screens.") ─────────────────
// Replaces the old flat Draw → Performance → Readiness → Context scroll with
// chaptered one-viewport panes. This file is ONLY the pagination wrapper —
// no fact, no per-face order, and no evidence-component change lives here.
// The four section components (DrawSection/PerformanceSection/
// ReadinessSection/ContextSection in passportKit.jsx) are unchanged; the
// CALLER (each PassportXView.jsx) builds the `chapters` array already
// RENDER-LAW-filtered, so this component never has to guess which sections
// are real — the rail's dot count is always the TRUE chapter count, never a
// ghost/disabled dot for a section RENDER LAW removed (§8.7 FIREWALL).
//
// Gestures: swipe reuses the Radar's established "swipe between planets"
// idiom verbatim (RadarUniverse.jsx onStageTouchStart/onStageTouchEnd — same
// 48px horizontal threshold + |dy|<|dx| vertical-drift guard) so the product
// keeps ONE gesture vocabulary product-wide, never a second one (§7.5).
//
// Persona-switch reset (§8.7 rule 8): switching persona swaps `ViewComp` in
// Passport.jsx to a DIFFERENT component function, so React unmounts this
// whole subtree and remounts it fresh on the new face — the `index` state
// below starts back at 0 for free, no extra wiring needed. A buyer is never
// left "on chapter 3" silently facing different content underneath — an
// honesty guardrail per the spec, not merely a UX nicety.
//
// Motion: the chapter frame uses the EXISTING `animate-fade-in` utility
// (tailwind.config.js — 220ms, already < the §5.11/§17.0 300ms ceiling) —
// already wired to collapse to an instant swap under prefers-reduced-motion
// globally (src/index.css). No new keyframe, no new motion token.

const HINT_KEY = 'lock_passport_explorer_hint_shown'
function hintAlreadyShown() {
  try { return sessionStorage.getItem(HINT_KEY) === '1' } catch { return false }
}
function markHintShown() {
  try { sessionStorage.setItem(HINT_KEY, '1') } catch { /* private-mode storage — degrades to "shows once more"; never throws */ }
}

export const EvidenceExplorer = forwardRef(function EvidenceExplorer({ chapters }, ref) {
  const { T, lang } = useLang()
  const copy = explorerCopy(T, lang)
  const total = chapters.length
  const [index, setIndex] = useState(0)
  const [hintVisible, setHintVisible] = useState(() => !hintAlreadyShown())
  const swipeStart = useRef(null)

  // §8.7 item 5 — "a first-open hint shown once per session on chapter 1's
  // first render, auto-dismissed on any interaction or after ~2.5s, never
  // re-shown" — sessionStorage (not component state) so it survives a
  // persona-switch remount within the SAME visit.
  useEffect(() => {
    if (!hintVisible) return undefined
    const t = setTimeout(dismissHint, 2500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hintVisible])

  useImperativeHandle(ref, () => ({
    // §8.7 item 4 — the 3-beat proof story (a sibling ABOVE this component,
    // itself never paginated) jumps straight to a chapter by key.
    jumpToKey(key) {
      const i = chapters.findIndex((c) => c.key === key)
      if (i >= 0) go(i)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [chapters, index])

  function dismissHint() {
    if (!hintVisible) return
    setHintVisible(false)
    markHintShown()
  }

  function go(next) {
    dismissHint()
    const clamped = Math.max(0, Math.min(total - 1, next))
    if (clamped === index) return
    setIndex(clamped)
  }

  function onTouchStart(e) {
    if (!e.touches?.length) return
    swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  function onTouchEnd(e) {
    if (!swipeStart.current || !e.changedTouches?.length) return
    const dx = e.changedTouches[0].clientX - swipeStart.current.x
    const dy = e.changedTouches[0].clientY - swipeStart.current.y
    swipeStart.current = null
    if (Math.abs(dy) >= Math.abs(dx) || Math.abs(dx) < 48) return
    go(index + (dx < 0 ? 1 : -1)) // swipe left → next, swipe right → prev
  }
  function onKeyDown(e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1) }
    else if (e.key === 'Home') { e.preventDefault(); go(0) }
    else if (e.key === 'End') { e.preventDefault(); go(total - 1) }
  }

  if (!total) return null
  const current = chapters[index]

  return (
    <div className="mt-6 sm:mt-8 md:mt-7">
      {/* Chapter rail (§8.7 item 1) — dots + current label, reusing
          PersonaToggle's pill/segmented visual grammar. Tap only — the rail
          never responds to swipe (swipe is the frame's gesture, #2 below),
          so the two never collide. overflow-x-auto (not wrap), same idiom as
          PersonaToggle on narrow phones. */}
      <div
        role="tablist"
        aria-label={copy.railLabel}
        className="flex max-w-full gap-1.5 overflow-x-auto pb-1"
      >
        {chapters.map((c, i) => {
          const on = i === index
          return (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={on}
              aria-label={copy.jumpTo(c.label)}
              onClick={() => go(i)}
              className={`tap-target min-h-[36px] shrink-0 rounded-full border px-3 text-[12px] font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-accent/60 ${
                on ? 'border-accent text-accent' : 'border-line text-muted hover:text-ink'
              }`}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      {/* §8.7 item 7 — aria-live announces every chapter change (name +
          position); this is the buyer's OWN navigation position, never a
          score/count about the artist (§8.7 FIREWALL). */}
      <p aria-live="polite" className="sr-only">
        {copy.liveAnnounce(current.label, index + 1, total)}
      </p>

      {/* Chapter frame (§8.7 item 5) — one pane rendered at a time. */}
      <div
        key={current.key}
        tabIndex={-1}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onKeyDown={onKeyDown}
        className="mt-3 animate-fade-in outline-none"
      >
        {current.node}
        {hintVisible && index === 0 && (
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-faint sm:hidden" aria-hidden="true">
            {copy.swipeHint}
          </p>
        )}
      </div>

      {/* Next/Prev (§8.7 item 2) — an explicit affordance so a first-time
          buyer never needs to discover a hidden swipe. */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => go(index - 1)}
          className="tap-target min-h-[44px] shrink-0 rounded-full border border-line px-4 text-[13px] font-semibold text-muted outline-none transition hover:text-ink focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-30"
        >
          ← {copy.prev(chapters[index - 1]?.label || '')}
        </button>
        {index < total - 1 ? (
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="tap-target min-h-[44px] rounded-full border border-line2 bg-surface2 px-5 text-[13px] font-semibold text-ink outline-none transition hover:border-accent/50 focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            {copy.next(chapters[index + 1]?.label || '')} →
          </button>
        ) : (
          <p className="flex-1 text-end text-[12px] italic text-faint">{copy.end}</p>
        )}
      </div>
    </div>
  )
})
