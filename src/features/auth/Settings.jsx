import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import { upsertProfile, requestAccountDeletion, hasConsent, recordConsentScope, getMyArtist, saveArtistWhatsApp } from '../../lib/db.js'
import { listIncomingAccessRequests, respondToAccessRequest, revokeArtistAccess } from '../../lib/orgs.js'
import { ROLES } from '../../lib/constants.js'
import { Field, ErrorNote, LanguageToggle, BottomSheet, Spinner, useToast } from '../../components/ui.jsx'
import BuildStamp from '../../components/BuildStamp.jsx'
import { useLang } from '../../context/LangContext.jsx'
import { useOrg } from '../../context/OrgContext.jsx'
import ContextSwitcher from '../org/ContextSwitcher.jsx'
import { logEvent, EVENTS } from '../../lib/analytics.js'

// The exact 5 canon scope values (DB-STRUCTURE.md Layer 1).
const ALL_SCOPES = ['view', 'upload', 'edit', 'share', 'publish']
const scopeWord = (T, s) => T.access[`scope${s.charAt(0).toUpperCase()}${s.slice(1)}`] || s

// §10.4 per-field DoD ("invalid = human explanation") — a loose phone-shape
// check, not a strict E.164 parser: digits/spaces/dashes/parens, optional
// leading +, 7–15 digits total. Good enough to catch "obviously not a number"
// without rejecting a real WhatsApp number in an unfamiliar format.
const WA_SHAPE = /^\+?[\d\s\-()]{7,20}$/
const isValidWa = (v) => !v.trim() || (WA_SHAPE.test(v.trim()) && v.replace(/\D/g, '').length >= 7)

// ── Collapsible settings group (§10.2 owner no-scroll law, µ-task W3-2).
// The screen previously stacked every card open → +1521px page overflow @390.
// Each group is now an accordion card: header = a real <button> inside the <h2>
// (standard disclosure pattern — aria-expanded/aria-controls carry the state,
// so no extra i18n copy is needed), body mounts only while open. Nothing was
// removed — every control is re-housed one tap away.
function Section({ id, title, open, onToggle, tone = '', titleClass = 'text-ink', children }) {
  return (
    <section className={`card mb-3 p-0 ${tone}`}>
      <h2 className="m-0">
        <button type="button" aria-expanded={open} aria-controls={`settings-sect-${id}`}
          onClick={onToggle}
          className="flex min-h-[48px] w-full items-center justify-between gap-2 px-5 py-3 text-start">
          <span className={`truncate font-bold ${titleClass}`}>{title}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </h2>
      {open && <div id={`settings-sect-${id}`} className="px-5 pb-5">{children}</div>}
    </section>
  )
}

// ── Representation — "who wants access to me / who already has it"
// (REPRESENTATION-CANON §1.1/§1.5). Pending grants show ONLY the requesting
// org's identity + requested scope — nothing about the artist's own data is
// at stake here, since the artist hasn't approved anything yet.
function RepresentationSection({ T, toast }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [approveTarget, setApproveTarget] = useState(null)
  const [approveScope, setApproveScope] = useState({})

  async function load() {
    try { setRequests(await listIncomingAccessRequests()) } catch { setRequests([]) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function openApprove(r) {
    setApproveScope(Object.fromEntries(ALL_SCOPES.map((s) => [s, (r.scope || ['view']).includes(s)])))
    setApproveTarget(r)
  }

  async function confirmApprove() {
    if (!approveTarget) return
    setBusyId(approveTarget.id)
    try {
      const scope = ALL_SCOPES.filter((s) => approveScope[s])
      const res = await respondToAccessRequest(approveTarget.id, true, scope.length ? scope : ['view'])
      if (res?.ok === false) toast.show(T.representation.migrationNote, 'warn')
      setApproveTarget(null)
      await load()
    } finally { setBusyId(null) }
  }

  async function decline(r) {
    setBusyId(r.id)
    try {
      const res = await respondToAccessRequest(r.id, false)
      if (res?.ok === false) toast.show(T.representation.migrationNote, 'warn')
      await load()
    } finally { setBusyId(null) }
  }

  async function revoke(r) {
    if (!window.confirm(T.representation.revokeConfirm(r.organization_name))) return
    setBusyId(r.id)
    try {
      const res = await revokeArtistAccess(r.id)
      if (res?.ok === false) toast.show(T.representation.migrationNote, 'warn')
      await load()
    } finally { setBusyId(null) }
  }

  const pending = requests.filter((r) => r.status === 'pending')
  const active = requests.filter((r) => r.status === 'active')
  const revoked = requests.filter((r) => r.status === 'revoked' || r.status === 'disputed')

  // Body only — the collapsible card/heading around it is the Section wrapper
  // in Settings below (W3-2 re-housing; same content, same order).
  return (
    <div>
      <p className="mb-3 text-xs text-muted">{T.representation.subtitle}</p>
      {loading ? (
        <p className="text-xs text-muted">{T.common.loading}</p>
      ) : requests.length === 0 ? (
        <p className="text-xs text-muted">{T.representation.empty}</p>
      ) : (
        <div className="space-y-2">
          {[...pending, ...active, ...revoked].map((r) => (
            <div key={r.id} className="rounded-xl border border-line bg-surface2 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{r.organization_name}</p>
                  <p className="text-xs text-muted">
                    {r.status === 'pending' ? T.representation.wantsAccess(r.organization_name)
                      : r.status === 'active' ? T.representation.activeLabel
                        : T.representation.revokedLabel}
                  </p>
                </div>
                {r.status === 'pending' && (
                  <div className="flex shrink-0 gap-1">
                    <button className="chip border border-line bg-surface2 text-xs text-ink min-h-[36px] px-2"
                      onClick={() => openApprove(r)} disabled={busyId === r.id}>{T.representation.approve}</button>
                    <button className="chip border border-line bg-surface2 text-xs text-amber min-h-[36px] px-2"
                      onClick={() => decline(r)} disabled={busyId === r.id}>{busyId === r.id ? <Spinner /> : T.representation.decline}</button>
                  </div>
                )}
                {r.status === 'active' && (
                  <button className="chip border border-line bg-surface2 text-xs text-amber min-h-[36px] px-2"
                    onClick={() => revoke(r)} disabled={busyId === r.id}>{busyId === r.id ? <Spinner /> : T.representation.revoke}</button>
                )}
              </div>
              {r.status === 'active' && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {(r.scope || []).map((s) => (
                    <span key={s} className="chip border border-line text-[10px] text-ink">{scopeWord(T, s)}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <BottomSheet open={!!approveTarget} onClose={() => setApproveTarget(null)} title={T.representation.approveTitle}>
        <p className="mb-3 text-sm text-ink">{approveTarget && T.representation.wantsAccess(approveTarget.organization_name)}</p>
        <p className="mb-2 text-xs text-muted">{T.representation.approveScopeHint}</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {ALL_SCOPES.map((s) => (
            <label key={s} className="flex items-center gap-1.5 rounded-full border border-line bg-surface2 px-2.5 py-1 text-xs text-ink">
              <input type="checkbox" checked={!!approveScope[s]} onChange={(e) => setApproveScope({ ...approveScope, [s]: e.target.checked })} />
              {scopeWord(T, s)}
            </label>
          ))}
        </div>
        {approveScope.publish && <p className="mb-3 text-xs text-muted">{T.access.publishHint}</p>}
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={confirmApprove} disabled={busyId === approveTarget?.id}>
            {busyId === approveTarget?.id ? <Spinner /> : T.representation.approveCta}
          </button>
          <button className="btn-ghost" onClick={() => setApproveTarget(null)}>{T.common.cancel}</button>
        </div>
      </BottomSheet>
    </div>
  )
}

export default function Settings() {
  const { T, lang } = useLang()
  // baseRole = the static profile role (identity-level; only used for the
  // profiles.role write in saveProfile). role = the ACTIVE workspace's
  // effective role (ROUND 4) — used for anything nav/route-related below, so
  // this screen reflects whichever workspace is currently active.
  const { user, profile, role: baseRole, signOut, reloadProfile } = useAuth()
  const { activeOrg, isAgency, isOwner, role, isProducerWorkspace } = useOrg()
  const nav = useNavigate()
  const toast = useToast()
  const [name, setName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  // §10.4/§17.A.10 per-field DoD — "undo available" on every save. Holds the
  // PRE-save value for a few seconds after a successful save so the artist can
  // revert without hunting for the old value.
  const [nameUndo, setNameUndo] = useState(null)
  const nameUndoTimer = useRef(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  // W3-2 accordion state — which settings groups are expanded. Profile starts
  // open (the screen's one primary job); everything else is one tap away.
  const [openSections, setOpenSections] = useState({ profile: true })
  const toggleSection = (id) => setOpenSections((cur) => ({ ...cur, [id]: !cur[id] }))
  const [deleteSubmitted, setDeleteSubmitted] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  // Marketing consent (4th, optional purpose) — moved here per canon; privacy +
  // processing fire inline at onboarding, publication fires at publish time.
  const [marketing, setMarketing] = useState(false)
  const [marketingLoaded, setMarketingLoaded] = useState(false)
  const [marketingBusy, setMarketingBusy] = useState(false)

  // Artist personal details — WhatsApp number + the artist's own opt-in for
  // letting a booking manager reach them on WhatsApp after a request (owner
  // ruling: the artist decides; default off). Loaded only for an artist role.
  const isArtist = role === ROLES.ARTIST
  const [artistId, setArtistId] = useState(null)
  const [waNumber, setWaNumber] = useState('')
  const [waShare, setWaShare] = useState(false)
  const [waSaving, setWaSaving] = useState(false)
  const [waSaved, setWaSaved] = useState(false)
  const [waInvalid, setWaInvalid] = useState(false)
  // The last value actually PERSISTED (from load, or from a prior save) — the
  // undo target. Distinct from waNumber/waShare, which track the live,
  // not-yet-saved input; using those for the snapshot would "undo" to the
  // value that was just saved, not the one before it.
  const [waLastSaved, setWaLastSaved] = useState({ number: '', share: false })
  const [waUndo, setWaUndo] = useState(null) // { number, share } pre-save snapshot
  const waUndoTimer = useRef(null)

  // §14.1.2 event #settings_opened — fires ONCE per screen visit (not per
  // re-render: this used to be a bare call in the render body, so every
  // keystroke/toggle on this screen re-fired it into the local ring buffer).
  useEffect(() => {
    logEvent(EVENTS.SETTINGS_OPENED, { role })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Kept in sync so the two "did X actually change" effects below can read
  // the CURRENT role without listing it as a dependency — a workspace switch
  // changes `role` alone and must never masquerade as a consent or language
  // change (both effects would otherwise re-fire on every role change too).
  const roleRef = useRef(role)
  useEffect(() => { roleRef.current = role }, [role])

  // §14.1.2 event #6 `consent_withdrawn` / consent_granted trigger is named
  // "(settings)" in the canon table — this IS that trigger point. Skips the
  // initial load (hasConsent below only sets the starting value, not a change).
  const marketingFirstLoad = useRef(true)
  useEffect(() => {
    if (!marketingLoaded) return
    if (marketingFirstLoad.current) { marketingFirstLoad.current = false; return }
    logEvent(marketing ? EVENTS.CONSENT_ACCEPTED : EVENTS.CONSENT_WITHDRAWN, { role: roleRef.current, scope: 'marketing' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketing, marketingLoaded])

  // Dev-only breadcrumb (§14.1.2: `language_changed` is a local-ring event,
  // never persisted) — the language row's own DoD ("language change... applies
  // + confirms"); skips the initial mount so switching INTO this screen in the
  // artist's existing language doesn't log a false "change".
  const langFirstRender = useRef(true)
  useEffect(() => {
    if (langFirstRender.current) { langFirstRender.current = false; return }
    logEvent(EVENTS.LANGUAGE_CHANGED, { role: roleRef.current, lang })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  useEffect(() => {
    (async () => {
      try { setMarketing(await hasConsent(user.id, 'marketing')) } catch { /* default false */ }
      finally { setMarketingLoaded(true) }
    })()
  }, [user.id])

  useEffect(() => {
    if (!isArtist) return
    let alive = true
    getMyArtist(user.id).then((a) => {
      if (!alive || !a) return
      setArtistId(a.id)
      setWaNumber(a.whatsapp_number || '')
      setWaShare(!!a.whatsapp_share)
      setWaLastSaved({ number: a.whatsapp_number || '', share: !!a.whatsapp_share })
    }).catch(() => { /* no artist record yet — section still lets them save once created */ })
    return () => { alive = false }
  }, [isArtist, user.id])

  async function saveWhatsApp() {
    if (!artistId) { setError(T.settings.waNeedProfile); return }
    // §10.4 "invalid = human explanation" — checked before the round-trip,
    // inline under the field, never a silent reject.
    if (!isValidWa(waNumber)) { setWaInvalid(true); return }
    setWaInvalid(false)
    const prevSnapshot = waLastSaved // the value BEFORE this save, for undo
    setWaSaving(true); setError(''); setWaSaved(false)
    try {
      await saveArtistWhatsApp(artistId, { number: waNumber, share: waShare })
      setWaSaved(true)
      setWaLastSaved({ number: waNumber, share: waShare })
      setWaUndo(prevSnapshot)
      clearTimeout(waUndoTimer.current)
      waUndoTimer.current = setTimeout(() => { setWaSaved(false); setWaUndo(null) }, 4000)
    } catch (e) {
      setError(e.message || T.common.error)
    } finally { setWaSaving(false) }
  }

  // §10.4/§17.A.10 undo — restores the snapshot taken just BEFORE the last
  // successful save and re-saves it, so undo is itself a real, visible save.
  async function undoWhatsApp() {
    if (!waUndo || !artistId) return
    clearTimeout(waUndoTimer.current)
    const { number, share } = waUndo
    setWaSaving(true)
    try {
      await saveArtistWhatsApp(artistId, { number, share })
      setWaNumber(number)
      setWaShare(share)
      setWaLastSaved({ number, share })
    } catch (e) {
      setError(e.message || T.common.error)
    } finally {
      setWaSaving(false); setWaSaved(false); setWaUndo(null)
    }
  }

  async function toggleMarketing() {
    if (marketingBusy) return
    const next = !marketing
    setMarketingBusy(true)
    try {
      await recordConsentScope(user.id, 'marketing', { status: next ? 'accepted' : 'declined', marketing_opt_in: next })
      setMarketing(next)
    } catch (e) {
      setError(e.message || T.common.error)
    } finally {
      setMarketingBusy(false)
    }
  }

  async function saveProfile() {
    const prevName = profile?.full_name || '' // pre-save snapshot, for undo
    setSaving(true); setError(''); setSaved(false)
    try {
      await upsertProfile({ id: user.id, role: baseRole, full_name: name.trim() || null })
      await reloadProfile()
      setSaved(true)
      setNameUndo(prevName !== (name.trim() || '') ? prevName : null)
      clearTimeout(nameUndoTimer.current)
      nameUndoTimer.current = setTimeout(() => { setSaved(false); setNameUndo(null) }, 4000)
    } catch (e) {
      setError(e.message || T.common.error)
    } finally { setSaving(false) }
  }

  // §10.4/§17.A.10 undo — restores the account name to what it was just
  // before the last successful save, via a real save (not a silent local revert).
  async function undoName() {
    if (nameUndo == null) return
    clearTimeout(nameUndoTimer.current)
    setSaving(true)
    try {
      await upsertProfile({ id: user.id, role: baseRole, full_name: nameUndo || null })
      await reloadProfile()
      setName(nameUndo)
    } catch (e) {
      setError(e.message || T.common.error)
    } finally {
      setSaving(false); setSaved(false); setNameUndo(null)
    }
  }

  async function handleDeleteAccount() {
    setDeleteBusy(true)
    try {
      await requestAccountDeletion(user.id)
      logEvent(EVENTS.DELETE_ACCOUNT_REQUESTED, { user_id: user.id })
      setDeleteSubmitted(true)
      setShowDeleteConfirm(false)
      setTimeout(async () => { await signOut(); nav('/login') }, 4000)
    } catch (e) {
      setError(e.message || T.common.error)
    } finally { setDeleteBusy(false) }
  }

  async function handleSignOut() {
    await signOut()
    nav('/login')
  }

  return (
    // W3-2 (§10.2 owner no-scroll law): the screen is bounded to the viewport —
    // 100dvh minus the AppShell chrome (56px sticky header everywhere, +64px
    // bottom-nav padding under md). The title row stays fixed; the settings
    // groups live in ONE internal scroll area, folded into accordion Sections.
    <div className="flex h-[calc(100dvh-7.5rem)] flex-col overflow-hidden px-4 pt-4 sm:px-8 md:h-[calc(100dvh-3.5rem)] md:pt-6">
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col animate-fade-in">
        <div className="shrink-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-ink">{T.settings.title}</h1>
            <Link to={role === ROLES.ARTIST ? '/artist/home' : role === ROLES.AGENCY ? (isProducerWorkspace ? '/production' : '/agency') : '/'}
              className="flex min-h-[44px] items-center text-sm text-muted transition hover:text-ink">
              {T.common.back}
            </Link>
          </div>

          <ErrorNote>{error}</ErrorNote>
          {deleteSubmitted && (
            <div className="card mb-4 border-accent/30 bg-accent/10">
              <p className="text-sm text-accent">{T.settings.deleteSubmitted}</p>
            </div>
          )}
        </div>

        {/* §6 law 7 — a long ledger may scroll within a CONTAINED, NAMED region
            (never the outer page). role="region" + aria-label gives this
            internal scroller its own accessible name, matching the law's own
            wording rather than an unnamed generic scroll div. */}
        <div className="min-h-0 flex-1 overflow-y-auto pb-4" role="region" aria-label={T.settings.title}>

      {/* Profile */}
      <Section id="profile" title={T.settings.profile} open={!!openSections.profile} onToggle={() => toggleSection('profile')}>
        {/* T-A3 (§17.B.5 / §8.5-adjacent one-name law): this is the ACCOUNT
            (person-level) name — it never renders on any buyer-facing surface.
            What a buyer reads is the Act's own "Stage name" (§8.6, edited in
            Your Act above). The hint exists so that distinction is never
            re-confused on this screen again. */}
        <Field label={T.settings.displayName} hint={T.settings.displayNameHint}>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveProfile()} />
        </Field>
        <Field label={T.settings.email} hint={T.settings.emailReadOnly}>
          <input className="field opacity-60" value={user?.email || ''} readOnly />
        </Field>
        <button className="btn-primary w-full" onClick={saveProfile} disabled={saving}>
          {saving ? T.common.loading : saved ? T.settings.saved + ' ✓' : T.settings.save}
        </button>
        {/* §10.4/§17.A.10 — "undo available" on every save. */}
        {saved && nameUndo != null && (
          <p className="mt-2 flex items-center gap-3 text-xs text-accent">
            <span>✓ {T.settings.saved}</span>
            <button type="button" className="tap-target underline" onClick={undoName}>{T.settings.undo}</button>
          </p>
        )}
      </Section>

      {/* Act identity — link to the Act-Identity Editor (§8.6 / D1 fix,
          App.jsx /artist/act/edit). This link was promised in that route's
          own comment ("Reached from ... Settings") but never actually built
          here — this Section is the fix. Same collapsible-Section pattern as
          every other group on this screen; the CTA reuses existing i18n keys
          (T.actEditor.*) rather than adding new copy. */}
      {isArtist && (
        <Section id="act" title={T.actEditor.title} open={!!openSections.act} onToggle={() => toggleSection('act')}>
          <p className="mb-3 text-sm text-muted">{T.actEditor.intro}</p>
          <Link to="/artist/act/edit" className="btn-ghost w-full">{T.actEditor.edit}</Link>
        </Section>
      )}

      {/* Artist personal details — WhatsApp + the artist's own sharing opt-in.
          The number stays private; a booking manager only sees it after sending
          a request, and only if the artist opted in here (default off). */}
      {isArtist && (
        <Section id="whatsapp" title={T.settings.waTitle} open={!!openSections.whatsapp} onToggle={() => toggleSection('whatsapp')}>
          <p className="mb-3 text-sm text-muted">{T.settings.waIntro}</p>
          <Field label={T.settings.waNumber} hint={T.settings.waNumberHint} error={waInvalid ? T.settings.waInvalid : ''}>
            <input className="field" dir="ltr" inputMode="tel" autoComplete="tel"
              placeholder="+972 5X-XXX-XXXX"
              value={waNumber} onChange={(e) => { setWaNumber(e.target.value); if (waInvalid) setWaInvalid(false) }} />
          </Field>
          <label className="mt-1 flex cursor-pointer items-start gap-3">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-accent" checked={waShare}
              onChange={(e) => setWaShare(e.target.checked)} />
            <span className="text-sm text-ink">
              {T.settings.waShareLabel}
              <span className="mt-0.5 block text-xs text-muted">{T.settings.waShareHint}</span>
            </span>
          </label>
          <button className="btn-primary mt-4 w-full" onClick={saveWhatsApp} disabled={waSaving}>
            {waSaving ? T.common.loading : waSaved ? T.settings.saved + ' ✓' : T.settings.save}
          </button>
          {/* §10.4/§17.A.10 — "undo available" on every save. */}
          {waSaved && waUndo != null && (
            <p className="mt-2 flex items-center gap-3 text-xs text-accent">
              <span>✓ {T.settings.saved}</span>
              <button type="button" className="tap-target underline" onClick={undoWhatsApp}>{T.settings.undo}</button>
            </p>
          )}
        </Section>
      )}

      {/* Organization (org-first account model) */}
      <Section id="org" title={activeOrg?.name || (isAgency ? T.org.entityAgency : T.org.entitySolo)}
        open={!!openSections.org} onToggle={() => toggleSection('org')}>
        {/* ContextSwitcher can't nest inside the header button (no interactive
            nesting) — it opens the body's first row instead; also in the top bar. */}
        <div className="mb-3 flex justify-end"><ContextSwitcher /></div>
        <div className="flex flex-col gap-2">
          <Link to="/org/settings" className="btn-ghost">{T.org.settingsTitle}</Link>
          <Link to="/org/members" className="btn-ghost">{T.org.membersTitle}</Link>
          {!isAgency && <Link to="/org/upgrade" className="btn-ghost">{T.org.upgradeTitle}</Link>}
          {isOwner && <Link to="/org/billing" className="btn-ghost">{T.org.billingTitle}</Link>}
          {/* navigation, not this screen's action — secondary style so the
              profile Save stays the one lime CTA (DS: one dominant per screen) */}
          {isAgency && (
            <Link to={isProducerWorkspace ? '/production' : '/agency'} className="btn-ghost mt-1">
              {isProducerWorkspace ? T.production.title : T.agency.title}
            </Link>
          )}
        </div>
      </Section>

      {/* Representation — incoming/active artist_access grants (both directions
          of the consent handshake live here: artist approves/declines/revokes).
          Artist-facing only — an org with no artist of its own has nothing to show. */}
      {role === ROLES.ARTIST && (
        <Section id="representation" title={T.representation.title}
          open={!!openSections.representation} onToggle={() => toggleSection('representation')}>
          <RepresentationSection T={T} toast={toast} />
        </Section>
      )}

      {/* Language */}
      <Section id="language" title={T.settings.language} open={!!openSections.language} onToggle={() => toggleSection('language')}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink">{lang === 'he' ? T.settings.languageHe : T.settings.languageEn}</span>
          <LanguageToggle />
        </div>
      </Section>

      {/* Consents */}
      <Section id="consents" title={T.settings.consents} open={!!openSections.consents} onToggle={() => toggleSection('consents')}>
        <p className="mb-3 text-xs text-muted">{T.settings.consentsHint}</p>
        <div className="space-y-1.5 text-xs text-muted">
          <p><span className="text-accent" aria-hidden>✓</span> {T.settings.consentPrivacy} — {T.settings.accepted}</p>
          <p><span className="text-accent" aria-hidden>✓</span> {T.settings.consentProcessing} — {T.settings.accepted}</p>
          <p><span className="text-accent" aria-hidden>✓</span> {T.settings.consentEvidence} — {T.settings.accepted}</p>
        </div>

        {/* 4th purpose — optional, its own toggle, separate from the required pair */}
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{T.consent.marketingTitle}</p>
            <p className="text-xs text-muted">{T.consent.marketing}</p>
          </div>
          <button
            onClick={toggleMarketing}
            disabled={marketingBusy || !marketingLoaded}
            aria-pressed={marketing}
            className={`chip min-h-[40px] shrink-0 px-3 py-1.5 text-xs font-bold transition ${
              marketing ? 'bg-[rgba(190,226,78,0.10)] text-[#CBEE72]' : 'border border-white/15 bg-white/[0.04] text-muted'
            }`}>
            {marketingBusy ? T.common.loading : marketing ? T.common.yes : T.common.no}
          </button>
        </div>

        <p className="mt-3 text-[11px] italic text-faint">{T.settings.consentsContact}</p>
      </Section>

      {/* Sign out */}
      <button className="btn-ghost mb-3 w-full" onClick={handleSignOut}>
        {T.settings.logout}
      </button>

      {/* Delete account */}
      <Section id="danger" title={T.settings.dangerZone} titleClass="text-amber" tone="border-amber/30"
        open={!!openSections.danger} onToggle={() => toggleSection('danger')}>
        <p className="mb-3 text-xs text-muted">{T.settings.deleteWarning}</p>
        {!showDeleteConfirm ? (
          <button className="min-h-[44px] w-full rounded-xl border border-amber/40 bg-amber/10 py-2 text-sm text-amber transition hover:bg-amber/20"
            onClick={() => setShowDeleteConfirm(true)}>
            {T.settings.deleteBtn}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-bold text-amber">{T.settings.deleteSure}</p>
            <div className="flex gap-2">
              <button className="min-h-[44px] flex-1 rounded-xl border border-amber bg-amber py-2 text-sm font-bold text-bg transition hover:brightness-110"
                onClick={handleDeleteAccount} disabled={deleteBusy}>
                {deleteBusy ? T.common.loading : T.settings.deleteConfirm}
              </button>
              <button className="btn-ghost flex-1" onClick={() => setShowDeleteConfirm(false)}>
                {T.common.cancel}
              </button>
            </div>
          </div>
        )}
      </Section>

      <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-faint">
        <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{T.settings.betaBadge}</span>
        <span>LOCK v1</span>
      </div>
      {/* Build stamp (W-2#5) — Settings is reachable from every role/breakpoint
          (header link), so it's the one guaranteed mobile home for this too —
          the desktop sidebar stamp (AppShell.jsx) doesn't render on mobile. */}
      <BuildStamp className="mt-1 flex justify-center" />

        </div>
      </div>
    </div>
  )
}
