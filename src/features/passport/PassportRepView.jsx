import { useRef } from 'react'
import {
  PassportHero, PersonaToggle, PassportFooter,
  DrawSection, PerformanceSection, ReadinessSection, ContextSection, ProofStory,
} from './passportKit.jsx'
import { EvidenceExplorer } from './EvidenceExplorer.jsx'

// ── Passport · REPRESENTATION VIEW — for an agency deciding whether to take
// this artist onto a roster. Priority order: their track record (career proof)
// and their audience come first; live-draw and readiness follow. Identical
// facts to the booking view — only order and section framing change. ──────────
// §8.7 PER-FACE CHAPTER MAP — Representation: Ch.1 Career proof (Performance)
// → Ch.2 Audience (Context) → Ch.3 Proof of draw → Ch.4 Readiness. Same order
// as before this change — only the pagination wrapper is new.
export default function PassportRepView({ artist, data, T, persona, onPersonaChange, photoOk, onPhotoError }) {
  const explorerRef = useRef(null)
  const chapters = [
    data.exp.length > 0 && { key: 'performance', label: T.passport.careerProof, node: <PerformanceSection data={data} T={T} label={T.passport.careerProof} /> },
    data.hasContext && { key: 'context', label: T.passport.audience, node: <ContextSection data={data} artist={artist} T={T} title={T.passport.audience} /> },
    data.hasDraw && { key: 'draw', label: T.passport.proofTitle, node: <DrawSection data={data} T={T} label={T.passport.proofTitle} /> },
    data.hasReadiness && { key: 'readiness', label: T.passport.readiness, node: <ReadinessSection data={data} artist={artist} T={T} /> },
  ].filter(Boolean)

  return (
    <>
      <PassportHero artist={artist} tagline={T.passport.taglineRep} photoOk={photoOk} onPhotoError={onPhotoError}>
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
