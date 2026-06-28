import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { PageShell, Wordmark, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'

// Producer (מפיק) home. The producer's real action is the no-login magic-link
// claim confirmation (P1, /confirm/:token). This logged-in landing explains the role.
export default function ProducerHome() {
  const { T } = useLang()
  const { signOut } = useAuth()
  const nav = useNavigate()
  return (
    <PageShell max="max-w-md">
      <div className="flex items-center justify-between mb-6">
        <Wordmark />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button className="text-sm text-muted hover:text-soft" onClick={() => { signOut(); nav('/login') }}>{T.settings.logout}</button>
        </div>
      </div>
      <h1 className="text-xl font-bold text-soft mb-2">{T.producer.homeTitle}</h1>
      <p className="text-sm text-muted mb-4">{T.producer.homeBody}</p>
      <div className="card">
        <p className="font-bold text-soft mb-3">{T.producer.homeHow}</p>
        <ol className="list-decimal ps-5 space-y-2 text-sm text-soft">
          <li>{T.producer.homeStep1}</li>
          <li>{T.producer.homeStep2}</li>
          <li>{T.producer.homeStep3}</li>
        </ol>
      </div>
    </PageShell>
  )
}
