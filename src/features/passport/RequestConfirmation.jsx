import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { getArtist, getSharedWhatsApp } from '../../lib/db.js'
import { PageShell, Wordmark } from '../../components/ui.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { logEvent, EVENTS } from '../../lib/analytics.js'
import { appUrl } from '../../lib/appUrl.js'

function formatWaNumber(raw) {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('972')) return digits
  if (digits.startsWith('0')) return `972${digits.slice(1)}`
  return `972${digits}`
}

// ── Request sent — a warm landing, never a dead end. WhatsApp when the artist
// left a number; otherwise a clear "they'll get back to you" + the passport
// link to keep for the file. ────────────────────────────────────────────────
export default function RequestConfirmation() {
  const { T } = useLang()
  const { id } = useParams()
  const loc = useLocation()
  const [artist, setArtist] = useState(null)
  const [sharedWa, setSharedWa] = useState(null)
  const [settled, setSettled] = useState(false)
  const [copied, setCopied] = useState(false)

  // Artist fetch powers the name; the WhatsApp CTA comes from a SEPARATE gated
  // read (getSharedWhatsApp) that returns a number ONLY when the artist opted in
  // (Settings → personal details). Both are best-effort — the page still confirms
  // the sent request via router state, so swallow rather than break.
  useEffect(() => {
    let alive = true
    Promise.allSettled([
      getArtist(id).then((a) => { if (alive) setArtist(a) }),
      getSharedWhatsApp(id).then((wa) => { if (alive) setSharedWa(wa) }),
    ]).finally(() => { if (alive) setSettled(true) })
    return () => { alive = false }
  }, [id])

  const artistName = artist?.stage_name || loc.state?.artist_name || T.request.theArtist
  const requesterName = loc.state?.requester_name || ''
  const rawWa = sharedWa
  const waNumber = formatWaNumber(rawWa)
  const waMsg = encodeURIComponent(T.request.whatsappMsg(artistName, requesterName))
  const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : null
  const passportUrl = appUrl(`/passport/${id}`)

  function onWaClick() {
    logEvent(EVENTS.REQUEST_WHATSAPP_CLICK, { artist_id: id })
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(passportUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch { /* clipboard blocked — the visible URL below stays selectable */ }
  }

  return (
    <div className="min-h-full bg-bg">
      <PageShell max="max-w-sm">
        <Wordmark className="mb-10 justify-center" />

        <div className="animate-fade-in rounded-[20px] border border-line bg-surface p-7 text-center shadow-card">
          {/* lime checkmark — the one warm light */}
          <span aria-hidden="true"
            className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-accent text-2xl font-black text-[#12160A] shadow-[0_10px_26px_-10px_rgba(190,226,78,.6)]">
            ✓
          </span>
          <h1 className="font-display text-[24px] font-bold text-ink">{T.request.confirmTitle}</h1>
          <p className="mt-2 leading-relaxed text-muted">{T.request.confirmBody(artistName)}</p>

          {waUrl ? (
            <>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onWaClick}
                className="btn-primary mt-6 mb-2 flex w-full items-center justify-center gap-2 shadow-[0_10px_26px_-10px_rgba(190,226,78,.6)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {T.request.whatsappCta}
              </a>
              <p className="text-xs text-faint">{T.request.whatsappHint}</p>
            </>
          ) : settled ? (
            /* no WhatsApp on file — still not a dead end */
            <div className="mt-6 rounded-[14px] border border-line bg-surface2 p-4 text-left">
              <p className="text-sm leading-relaxed text-ink">
                {T.request.willGetBack(artistName)}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                {T.request.keepLinkHint}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span dir="ltr" className="min-w-0 flex-1 truncate rounded-md border border-line bg-bg2 px-3 py-2 font-mono text-[11px] text-muted">
                  {passportUrl}
                </span>
                <button onClick={copyLink}
                  className="btn-ghost shrink-0 px-4 py-2 text-xs">
                  {copied ? T.producer.copied : T.producer.copyLink}
                </button>
              </div>
            </div>
          ) : (
            /* still resolving the WhatsApp-opt-in lookup — a quiet skeleton,
               never a blank gap between the confirmation and its one next step */
            <div className="skeleton mt-6 h-11 w-full rounded-md" aria-hidden="true" />
          )}

          <Link to={`/passport/${id}`} className="tap-target mt-5 inline-block text-sm text-muted transition hover:text-ink">
            ← {T.request.backToPassport}
          </Link>
        </div>
      </PageShell>
    </div>
  )
}
