import {
  PassportHero, PersonaToggle, PassportFooter,
  DrawSection, PerformanceSection, ReadinessSection, ContextSection, ProofStory,
} from './passportKit.jsx'

// ── Passport · REPRESENTATION VIEW — for an agency deciding whether to take
// this artist onto a roster. Priority order: their track record (career proof)
// and their audience come first; live-draw and readiness follow. Identical
// facts to the booking view — only order and section framing change. ──────────
export default function PassportRepView({ artist, data, T, persona, onPersonaChange, photoOk, onPhotoError }) {
  return (
    <>
      <PassportHero artist={artist} tagline={T.passport.taglineRep} photoOk={photoOk} onPhotoError={onPhotoError}>
        <PersonaToggle persona={persona} onChange={onPersonaChange} T={T} />
      </PassportHero>

      <main className="mx-auto max-w-[720px] px-5 sm:px-8">
        <ProofStory artist={artist} data={data} T={T} />
        <PerformanceSection data={data} T={T} label={T.passport.careerProof} />
        <ContextSection data={data} artist={artist} T={T} title={T.passport.audience} />
        <DrawSection data={data} T={T} label={T.passport.proofTitle} />
        <ReadinessSection data={data} artist={artist} T={T} />
        <PassportFooter T={T} />
      </main>
    </>
  )
}
