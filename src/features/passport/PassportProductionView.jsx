import { useRef } from 'react'
import {
  PassportHero, PersonaToggle, PassportFooter,
  DrawSection, PerformanceSection, ReadinessSection, ContextSection, ProofStory,
} from './passportKit.jsx'
import { EvidenceExplorer } from './EvidenceExplorer.jsx'

// ── Passport · PRODUCTION VIEW — for a stage manager / technical producer
// deciding whether the night runs without friction. Priority order: READY-ON-
// THE-NIGHT binaries first (rider, regions, set length), then draw, then
// career proof. Same facts as every other face — only order and framing
// differ (CLAUDE.md firewall lives in passportKit, not here). §5.10 warmth
// layer applies via the shared sections; this file only re-orders them. ─────
// §8.7 PER-FACE CHAPTER MAP — Production: Ch.1 Show-day readiness → Ch.2
// Proof of draw → Ch.3 Performance → Ch.4 Context. Same order as before this
// change — only the pagination wrapper is new.
export default function PassportProductionView({ artist, data, T, persona, onPersonaChange, photoOk, onPhotoError }) {
  const explorerRef = useRef(null)
  const chapters = [
    data.hasReadiness && { key: 'readiness', label: T.passport.productionReadiness, node: <ReadinessSection data={data} artist={artist} T={T} label={T.passport.productionReadiness} /> },
    data.hasDraw && { key: 'draw', label: T.passport.proofTitle, node: <DrawSection data={data} T={T} label={T.passport.proofTitle} /> },
    data.exp.length > 0 && { key: 'performance', label: T.passport.performance, node: <PerformanceSection data={data} T={T} label={T.passport.performance} /> },
    data.hasContext && { key: 'context', label: T.passport.contextTitle, node: <ContextSection data={data} artist={artist} T={T} /> },
  ].filter(Boolean)

  return (
    <>
      <PassportHero artist={artist} tagline={T.passport.taglineProduction} photoOk={photoOk} onPhotoError={onPhotoError}>
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
