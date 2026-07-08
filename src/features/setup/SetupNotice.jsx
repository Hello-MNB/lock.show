import { PageShell, Wordmark, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// Shown when Supabase keys are not yet in .env.local — so the app loads
// and explains the one setup step instead of crashing.
export default function SetupNotice() {
  const { T } = useLang()
  const steps = [T.setup.step1, T.setup.step2, T.setup.step3, T.setup.step4, T.setup.step5]
  return (
    <PageShell max="max-w-md">
      <div className="mb-7 text-center">
        <Wordmark className="mb-4 justify-center" />
        <div className="mb-3 flex justify-center"><LanguageToggle /></div>
        <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">Almost there</p>
        <p className="text-muted">{T.setup.lastStep}</p>
      </div>
      <div className="card text-sm leading-relaxed">
        <p className="mb-4 font-bold text-ink">{T.setup.notConfigured}</p>
        <ol className="mb-4 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface2 font-mono text-[11px] font-semibold text-gold" aria-hidden>
                {i + 1}
              </span>
              <span className="text-ink">{s}</span>
            </li>
          ))}
        </ol>
        <p className="border-t border-line pt-3 text-muted">{T.setup.afterKeys}</p>
      </div>
    </PageShell>
  )
}
