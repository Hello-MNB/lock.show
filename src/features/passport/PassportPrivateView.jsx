import { useRef } from 'react'
import {
  PassportHero, PersonaToggle, PassportFooter,
  DrawSection, PerformanceSection, ReadinessSection, ContextSection, ProofStory,
} from './passportKit.jsx'
import { EvidenceExplorer } from './EvidenceExplorer.jsx'

// ── Passport · PRIVATE & CORPORATE VIEW — for a private host or corporate
// event planner (מזמין פרטי/עסקי) with no scene background. Same facts, same
// firewall, as every other face — but a warm NON-INDUSTRY register: "Comfortable
// for 100–300 guests" instead of a band caption, "Turnkey booking" instead of
// itemized rider/regions/invoice jargon. Never a different fact — only words a
// non-industry buyer would actually use. Leads with the ready-to-book cluster
// (does this just work for my event?), then room fit, then where they've
// played, then a light presence strip last. ─────────────────────────────────
// §8.7 PER-FACE CHAPTER MAP — Private & corporate: Ch.1 Turnkey/private
// readiness → Ch.2 Proof of draw (private register) → Ch.3 Performance
// (private) → Ch.4 Context (private). Same order as before this change —
// only the pagination wrapper is new. Rail label uses the STATIC
// `privateReadiness` key even on the render where ReadinessSection's own
// in-content heading swaps to the dynamic "Turnkey booking" cluster title
// (all-3-true) — the rail is navigation chrome, not the section's own H2, so
// it stays on the stable chapter name (a scoping note, not a fact change).
export default function PassportPrivateView({ artist, data, T, persona, onPersonaChange, photoOk, onPhotoError }) {
  const explorerRef = useRef(null)
  const chapters = [
    data.hasReadiness && {
      key: 'readiness',
      label: T.passport.privateReadiness,
      node: <ReadinessSection data={data} artist={artist} T={T} label={T.passport.privateReadiness} variant="private" />,
    },
    data.hasDraw && {
      key: 'draw',
      label: T.passport.privateProofTitle,
      node: <DrawSection data={data} T={T} label={T.passport.privateProofTitle} contextLines={T.passport.drawContextPrivate} />,
    },
    data.exp.length > 0 && {
      key: 'performance',
      label: T.passport.privatePerformance,
      node: <PerformanceSection data={data} T={T} label={T.passport.privatePerformance} />,
    },
    data.hasContext && {
      key: 'context',
      label: T.passport.privateContextTitle,
      node: <ContextSection data={data} artist={artist} T={T} title={T.passport.privateContextTitle} />,
    },
  ].filter(Boolean)

  return (
    <>
      <PassportHero artist={artist} tagline={T.passport.taglinePrivate} photoOk={photoOk} onPhotoError={onPhotoError}>
        <PersonaToggle persona={persona} onChange={onPersonaChange} T={T} />
      </PassportHero>

      <main className="mx-auto max-w-[720px] px-5 sm:px-8">
        <ProofStory
          artist={artist} data={data} T={T} contextLines={T.passport.drawContextPrivate}
          onJumpToDraw={data.hasDraw ? () => explorerRef.current?.jumpToKey('draw') : undefined}
        />
        <EvidenceExplorer ref={explorerRef} chapters={chapters} />
        <PassportFooter T={T} />
      </main>
    </>
  )
}
