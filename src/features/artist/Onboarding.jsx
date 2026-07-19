import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getMyArtist, upsertArtist, addProfileItem, addEvidence, processEvidence, hasConsent } from '../../lib/db.js'
import { logEvent, EVENTS } from '../../lib/analytics.js'
import { SOURCE_STATUS } from '../../lib/constants.js'
import { PageShell, Field, Spinner, ErrorNote, Loading } from '../../components/ui.jsx'
import { PlatformLogo, detectPlatform } from '../../components/PlatformLogo.jsx'
import { useLang } from '../../context/LangContext.jsx'
import ConsentLegal, { recordPrivacyConsent } from '../auth/ConsentLegal.jsx'

// ── MINIMUM VIABLE ENTRY (owner order, 8 Jul) ────────────────────────────────
// "בשביל זה יש רדאר — לאסוף נתונים": onboarding stops collecting; the Radar
// collects. Two screens, four fields TOTAL:
//   1 · stage name (required) + city (optional) + inline privacy consent
//   2 · one strongest link (optional) → straight to the Radar
// Everything the old 7-step wizard asked for (goal, genre, photo, one-liner,
// more links, draw bands, experience, set length, regions, invoice, rider,
// WhatsApp, review/publish) is DEFERRED to the Radar's missing-node +
// next-step mechanics — each field has an in-place fill path there (see
// src/lib/radarUniverse.js buildUniverse). Publishing lives on the dashboard
// behind the same readiness gate as before (unchanged by this order).
// Writes are IDENTICAL to the old wizard: same upsertArtist patch shape, same
// recordPrivacyConsent scopes, same addProfileItem link shape, same
// evidence-mirror for a pasted source (a pasted source is evidence, not just
// a bookmark — the AI pipeline labels it and the Radar shows the result).

// T-58 (§8.1): 3 steps — basics → strongest link → the "here's what we found"
// reveal (the payoff moment). With no link given there is nothing found, so the
// flow honestly completes from step 2 (the reveal never invents findings).
const STEPS = 3

// Refresh mid-entry must resume, not restart — the step position (never the
// field data, which is saved server-side per-step) is mirrored to
// sessionStorage per-user so a reload lands back where the artist was.
function stepStorageKey(userId) { return `gigproof_onboarding_step_${userId}` }
function readSavedStep(userId) {
  const raw = Number(sessionStorage.getItem(stepStorageKey(userId)))
  return raw >= 1 && raw <= STEPS ? raw : 1
}

// Segmented progress — bounded position ("you are here"), never a completion %.
function ProgressSegments({ step }) {
  const { T } = useLang()
  return (
    <div className="mb-6">
      <div className="flex items-center gap-1" aria-hidden>
        {Array.from({ length: STEPS }, (_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i + 1 < step ? 'bg-line2' : i + 1 === step ? 'bg-accent' : 'bg-line'
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        {T.onboarding.stepOf(step, STEPS)} · <span className="text-ink/80">{T.onboarding.entryStepLabels[step - 1]}</span>
      </p>
    </div>
  )
}

export default function Onboarding() {
  const { T } = useLang()
  const { user } = useAuth()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(() => readSavedStep(user.id))
  const [artist, setArtist] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  // Contextual consent: privacy + processing fire HERE, inline, on screen 1 —
  // never as a /consent wall before first value. `consentAlready` covers
  // returning users (already recorded) so they never see it twice.
  const [consentAlready, setConsentAlready] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const [f, setF] = useState({ stage_name: '', city: '' })
  const [link, setLink] = useState('')

  useEffect(() => {
    (async () => {
      try {
        let a = await getMyArtist(user.id)
        if (!a) a = await upsertArtist({ created_by: user.id })
        setArtist(a)
        setF({ stage_name: a.stage_name || '', city: a.city || '' })
        try {
          // Canon scope is the single `privacy-processing` (migration 021 CHECK).
          setConsentAlready(await hasConsent(user.id, 'privacy-processing'))
        } catch { setConsentAlready(false) }
      } catch (e) { setError(e.message) } finally { setLoading(false) }
    })()
  }, [user.id])

  // Mirror step position so a mid-entry refresh resumes instead of restarting.
  useEffect(() => {
    sessionStorage.setItem(stepStorageKey(user.id), String(step))
  }, [user.id, step])

  // Screen 1 → 2: record consent (once) + save the two identity fields.
  async function continueEntry(e) {
    e?.preventDefault?.()
    if (!f.stage_name.trim()) return
    setSaving(true); setError('')
    try {
      if (!consentAlready) {
        await recordPrivacyConsent(user.id)
        setConsentAlready(true)
      }
      const updated = await upsertArtist({
        ...artist, id: artist.id, created_by: user.id,
        stage_name: f.stage_name.trim(), name: f.stage_name.trim(),
        city: f.city.trim() || null,
      })
      setArtist(updated)
      setStep(2)
    } catch (err) {
      setError(err.message || T.common.error)
    } finally { setSaving(false) }
  }

  // Screen 2 → the reveal (T-58). If a strongest link was pasted it is saved as
  // a profile link AND mirrored into the AI claim pipeline (fire-and-forget), so
  // the Radar's "we're scanning" moment lands with a real found-node, not a
  // promise. With a link saved, step 3 shows what was really captured; with no
  // link there is nothing found, so the flow completes honestly right here.
  async function startRadar(e) {
    e?.preventDefault?.()
    setSaving(true); setError('')
    try {
      const url = link.trim()
      if (/^https?:\/\//i.test(url)) {
        await addProfileItem({
          artist_id: artist.id, item_type: 'link', title: url,
          public_url: url, source_status: SOURCE_STATUS.PUBLIC_VERIFIED,
        })
        try {
          await addEvidence({
            artist_id: artist.id, evidence_type: 'link', source_type: 'public-profile',
            value: url, public_url: url, claim_intent: 'consistent-frequency', source_owner_consent: true,
          })
          processEvidence(artist.id).catch(() => { /* radar retries on next visit */ })
        } catch { /* evidence mirror is best-effort — the profile link itself is already saved */ }
        setSaving(false)
        setStep(3) // the payoff: show what was captured before landing on the Radar
        return
      }
      finish()
    } catch (err) {
      setError(err.message || T.common.error)
      setSaving(false)
    }
  }

  // Reveal → Radar (the completion path — one place, fired from step 2 no-link
  // or the step-3 CTA).
  function finish() {
    sessionStorage.removeItem(stepStorageKey(user.id))
    logEvent(EVENTS.ONBOARDING_COMPLETE)
    nav('/artist/home', { state: { fromEntry: true } })
  }

  if (loading) return <Loading />

  const linkGiven = /^https?:\/\//i.test(link.trim())
  const linkPlatform = linkGiven ? detectPlatform(link.trim()) : null

  return (
    <PageShell max="max-w-lg">
      <ProgressSegments step={step} />
      <ErrorNote>{error}</ErrorNote>

      {step === 1 && (
        <form onSubmit={continueEntry}>
          <div className="card">
            <h2 className="font-display mb-1 text-xl font-bold tracking-[-0.01em] text-ink">{T.onboarding.entryTitle}</h2>
            <p className="mb-4 text-xs text-muted">{T.onboarding.entryHint}</p>
            <Field label={T.onboarding.stageName}>
              <input className="field" value={f.stage_name} autoFocus
                onChange={(e) => setF({ ...f, stage_name: e.target.value })} />
            </Field>
            <Field label={`${T.onboarding.city} (${T.onboarding.entryOptional})`}>
              <input className="field" value={f.city}
                onChange={(e) => setF({ ...f, city: e.target.value })} />
            </Field>
          </div>
          {!consentAlready && (
            <div className="mt-3">
              <ConsentLegal checked={consentChecked} onChange={setConsentChecked} />
            </div>
          )}
          <div className="sticky bottom-0 -mx-4 mt-6 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur">
            <button type="submit" className="btn-primary w-full"
              disabled={saving || !f.stage_name.trim() || (!consentAlready && !consentChecked)}>
              {saving ? <Spinner /> : T.common.continue}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={startRadar}>
          <div className="card">
            <h2 className="font-display mb-1 text-xl font-bold tracking-[-0.01em] text-ink">{T.onboarding.entryLinkTitle}</h2>
            <p className="mb-4 text-xs text-muted">{T.onboarding.entryLinkHint}</p>
            <Field label={`${T.onboarding.linkPlaceholder} (${T.onboarding.entryOptional})`}>
              <input className="field" dir="ltr" value={link} inputMode="url"
                onChange={(e) => setLink(e.target.value)} placeholder="https://…" />
            </Field>
            {/* instant recognition, same beat as the Radar's setup chip — names
                the platform + shows its logo while typing, never silent */}
            {linkPlatform && (
              <p className="mb-3 -mt-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
                <PlatformLogo name={linkPlatform} size={15} className="text-gold" />
                {T.evidence.platformRecognized(linkPlatform.charAt(0).toUpperCase() + linkPlatform.slice(1))}
              </p>
            )}
            {/* the deferral promise — everything else is the Radar's job */}
            <p className="text-[11px] leading-relaxed text-faint">{T.onboarding.entryDeferNote}</p>
          </div>
          <div className="sticky bottom-0 -mx-4 mt-6 flex items-center justify-between gap-3 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur">
            <button type="button" className="btn-ghost" disabled={saving} onClick={() => setStep(1)}>
              {T.common.back}
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? <Spinner /> : linkGiven ? T.onboarding.entryStartScan : T.onboarding.entryStart}
            </button>
          </div>
        </form>
      )}

      {/* T-58 · Step 3 — the "here's what we found" reveal (§8.1). REAL data
          only: the link the artist just gave, shown as the ✦ found node it now
          is. Never an invented finding, never a fake tally (§2.8). */}
      {step === 3 && (
        <div>
          <div className="card">
            <h2 className="font-display mb-1 text-xl font-bold tracking-[-0.01em] text-ink">{T.onboarding.revealTitle}</h2>
            <p className="mb-4 text-xs text-muted">{T.onboarding.revealSub}</p>
            <div className="flex items-center gap-3 rounded-xl border border-gold/30 bg-surface2 px-3 py-2.5">
              {linkPlatform && <PlatformLogo name={linkPlatform} size={18} className="shrink-0 text-gold" />}
              <div className="min-w-0 flex-1">
                <p dir="ltr" className="truncate text-sm font-semibold text-ink">{link.trim()}</p>
                <p className="text-[11px] text-muted">{T.onboarding.revealRowSub}</p>
              </div>
              <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-gold">✦ {T.onboarding.revealFound}</span>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-faint">{T.onboarding.revealScope}</p>
          </div>
          <div className="sticky bottom-0 -mx-4 mt-6 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur">
            <button type="button" className="btn-primary w-full" onClick={finish}>
              {T.onboarding.revealCta}
            </button>
          </div>
        </div>
      )}
    </PageShell>
  )
}
