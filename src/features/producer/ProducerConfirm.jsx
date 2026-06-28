import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageShell, Wordmark, Loading, ErrorState, LanguageToggle } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { DEMO, demoConfirm } from '../../lib/demo.js'

// P1 — Producer (מפיק) claim confirmation. No login; opened from a magic link.
// Server-mediated (service role). A yes/partial reply upgrades the claim's
// method_label to 'producer-confirmed'; revoke clears it.
export default function ProducerConfirm() {
  const { T } = useLang()
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    if (DEMO) { setData({ ...demoConfirm }); setLoading(false); return }
    setLoading(true); setError(false)
    try {
      const res = await fetch(`/api/confirm/${token}`)
      if (!res.ok) throw new Error('invalid')
      setData(await res.json())
    } catch { setError(true) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [token])

  async function send(body) {
    if (busy) return
    if (DEMO) {
      setData((d) => ({ ...d, response: body.revoke ? d.response : body.response, revoked: !!body.revoke, responded: !body.revoke }))
      return
    }
    setBusy(true)
    try {
      const res = await fetch(`/api/confirm/${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('failed')
      await load()
    } catch { setError(true) } finally { setBusy(false) }
  }

  if (loading) return <Loading />
  if (error || !data) return (
    <PageShell max="max-w-sm"><Wordmark className="justify-center mb-6" />
      <ErrorState title={T.producer.invalidLink} /></PageShell>
  )

  const P = T.producer
  const answers = [['yes', P.answerYes], ['partial', P.answerPartial], ['no', P.answerNo], ['wrong_person', P.answerWrong]]
  const labelFor = { yes: P.answerYes, partial: P.answerPartial, no: P.answerNo, wrong_person: P.answerWrong }
  const answered = data.responded && !data.revoked

  return (
    <PageShell max="max-w-sm">
      <div className="flex items-center justify-between mb-6">
        <Wordmark /><LanguageToggle />
      </div>
      <h1 className="text-xl font-bold text-soft mb-2">{P.confirmTitle}</h1>
      <div className="card">
        <p className="text-soft mb-4">{P.confirmQuestion(data.claimText, data.artistName)}</p>
        {answered ? (
          <>
            <p className="text-sm text-muted">{P.yourReply}: <span className="text-soft font-bold">{labelFor[data.response]}</span></p>
            {(data.response === 'yes' || data.response === 'partial') && (
              <button className="btn-ghost w-full mt-3" onClick={() => send({ revoke: true })} disabled={busy}>{P.revoke}</button>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {answers.map(([val, label]) => (
              <button key={val} className="btn-ghost min-h-[44px]" onClick={() => send({ response: val })} disabled={busy}>{label}</button>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
