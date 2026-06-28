import { PageShell, Wordmark, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// Shown when Supabase keys are not yet in .env.local — so the app loads
// and explains the one setup step instead of crashing.
export default function SetupNotice() {
  const { T } = useLang()
  const steps = [T.setup.step1, T.setup.step2, T.setup.step3, T.setup.step4, T.setup.step5]
  return (
    <PageShell>
      <div className="text-center mb-6">
        <Wordmark className="justify-center mb-2" />
        <div className="flex justify-center mb-2"><LanguageToggle /></div>
        <p className="text-muted">{T.setup.lastStep}</p>
      </div>
      <div className="card space-y-4 text-sm leading-relaxed">
        <p className="text-soft font-bold">{T.setup.notConfigured}</p>
        <ol className="list-decimal ps-5 space-y-2 text-soft">
          {steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
        <p className="text-muted">{T.setup.afterKeys}</p>
      </div>
    </PageShell>
  )
}
