import {
  PassportHero, PersonaToggle, PassportFooter,
  DrawSection, PerformanceSection, ReadinessSection, ContextSection,
} from './passportKit.jsx'

// ── Passport · BOOKING VIEW — for a venue / event booker deciding whether to
// put this artist on a specific date. Priority order: can they DRAW and are
// they READY, first. Same facts as the representation view — only the order and
// framing differ (CLAUDE.md firewall lives in passportKit, not here). ─────────
export default function PassportBookingView({ artist, data, T, persona, onPersonaChange, photoOk, onPhotoError }) {
  return (
    <>
      <PassportHero artist={artist} tagline={T.passport.taglineBooking} photoOk={photoOk} onPhotoError={onPhotoError}>
        <PersonaToggle persona={persona} onChange={onPersonaChange} T={T} />
      </PassportHero>

      <main className="mx-auto max-w-[720px] px-5 sm:px-8">
        <DrawSection data={data} T={T} label={T.passport.proofTitle} />
        <PerformanceSection data={data} T={T} label={T.passport.performance} />
        <ReadinessSection data={data} artist={artist} T={T} />
        <ContextSection data={data} artist={artist} T={T} />
        <PassportFooter T={T} />
      </main>
    </>
  )
}
