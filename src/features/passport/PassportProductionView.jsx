import {
  PassportHero, PersonaToggle, PassportFooter,
  DrawSection, PerformanceSection, ReadinessSection, ContextSection,
} from './passportKit.jsx'

// ── Passport · PRODUCTION VIEW — for a stage manager / technical producer
// deciding whether the night runs without friction. Priority order: READY-ON-
// THE-NIGHT binaries first (rider, regions, set length), then draw, then
// career proof. Same facts as every other face — only order and framing
// differ (CLAUDE.md firewall lives in passportKit, not here). §5.10 warmth
// layer applies via the shared sections; this file only re-orders them. ─────
export default function PassportProductionView({ artist, data, T, persona, onPersonaChange, photoOk, onPhotoError }) {
  return (
    <>
      <PassportHero artist={artist} tagline={T.passport.taglineProduction} photoOk={photoOk} onPhotoError={onPhotoError}>
        <PersonaToggle persona={persona} onChange={onPersonaChange} T={T} />
      </PassportHero>

      <main className="mx-auto max-w-[720px] px-5 sm:px-8">
        <ReadinessSection data={data} artist={artist} T={T} label={T.passport.productionReadiness} />
        <DrawSection data={data} T={T} label={T.passport.proofTitle} />
        <PerformanceSection data={data} T={T} label={T.passport.performance} />
        <ContextSection data={data} artist={artist} T={T} />
        <PassportFooter T={T} />
      </main>
    </>
  )
}
