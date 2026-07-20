import {
  PassportHero, PersonaToggle, PassportFooter,
  DrawSection, PerformanceSection, ReadinessSection, ContextSection, ProofStory,
} from './passportKit.jsx'

// ── Passport · PRIVATE & CORPORATE VIEW — for a private host or corporate
// event planner (מזמין פרטי/עסקי) with no scene background. Same facts, same
// firewall, as every other face — but a warm NON-INDUSTRY register: "Comfortable
// for 100–300 guests" instead of a band caption, "Turnkey booking" instead of
// itemized rider/regions/invoice jargon. Never a different fact — only words a
// non-industry buyer would actually use. Leads with the ready-to-book cluster
// (does this just work for my event?), then room fit, then where they've
// played, then a light presence strip last. ─────────────────────────────────
export default function PassportPrivateView({ artist, data, T, persona, onPersonaChange, photoOk, onPhotoError }) {
  return (
    <>
      <PassportHero artist={artist} tagline={T.passport.taglinePrivate} photoOk={photoOk} onPhotoError={onPhotoError}>
        <PersonaToggle persona={persona} onChange={onPersonaChange} T={T} />
      </PassportHero>

      <main className="mx-auto max-w-[720px] px-5 sm:px-8">
        <ProofStory artist={artist} data={data} T={T} />
        <ReadinessSection data={data} artist={artist} T={T} label={T.passport.privateReadiness} variant="private" />
        <DrawSection data={data} T={T} label={T.passport.privateProofTitle} contextLines={T.passport.drawContextPrivate} />
        <PerformanceSection data={data} T={T} label={T.passport.privatePerformance} />
        <ContextSection data={data} artist={artist} T={T} title={T.passport.privateContextTitle} />
        <PassportFooter T={T} />
      </main>
    </>
  )
}
