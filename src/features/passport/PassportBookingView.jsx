import { useRef } from 'react'
import {
  PassportHero, PersonaToggle, PassportFooter,
  DrawSection, PerformanceSection, ReadinessSection, ContextSection, ProofStory,
} from './passportKit.jsx'
import { EvidenceExplorer } from './EvidenceExplorer.jsx'

// ── Passport · BOOKING VIEW — for a venue / event booker deciding whether to
// put this artist on a specific date. Priority order: can they DRAW and are
// they READY, first. Same facts as the representation view — only the order and
// framing differ (CLAUDE.md firewall lives in passportKit, not here). ─────────
// §8.7 PER-FACE CHAPTER MAP — Booking: Ch.1 Draw (Room Grammar hero) → Ch.2
// Performance → Ch.3 Readiness → Ch.4 Context. Identical order to before this
// change (T-77) — only the pagination wrapper (EvidenceExplorer) is new. Each
// entry is RENDER-LAW-filtered here (using the SAME `data.has*`/`data.exp`
// flags the old flat scroll relied on) so the rail's dot count is always the
// TRUE chapter count, never a ghost dot for a section with nothing to show.
export default function PassportBookingView({ artist, data, T, persona, onPersonaChange, photoOk, onPhotoError }) {
  const explorerRef = useRef(null)
  const chapters = [
    data.hasDraw && { key: 'draw', label: T.passport.proofTitle, node: <DrawSection data={data} T={T} label={T.passport.proofTitle} heroRoom /> },
    data.exp.length > 0 && { key: 'performance', label: T.passport.performance, node: <PerformanceSection data={data} T={T} label={T.passport.performance} /> },
    data.hasReadiness && { key: 'readiness', label: T.passport.readiness, node: <ReadinessSection data={data} artist={artist} T={T} /> },
    data.hasContext && { key: 'context', label: T.passport.contextTitle, node: <ContextSection data={data} artist={artist} T={T} /> },
  ].filter(Boolean)

  return (
    <>
      <PassportHero artist={artist} tagline={T.passport.taglineBooking} photoOk={photoOk} onPhotoError={onPhotoError}>
        <PersonaToggle persona={persona} onChange={onPersonaChange} T={T} />
      </PassportHero>

      <main className="mx-auto max-w-[720px] px-5 sm:px-8">
        <ProofStory artist={artist} data={data} T={T} onJumpToDraw={data.hasDraw ? () => explorerRef.current?.jumpToKey('draw') : undefined} />
        <EvidenceExplorer ref={explorerRef} chapters={chapters} />
        <PassportFooter T={T} />
      </main>
    </>
  )
}
