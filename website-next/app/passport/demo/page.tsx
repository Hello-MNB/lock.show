import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/passport/demo' },
  title: 'Sample Passport — Verified Live Performance Evidence',
  description: 'A sample LOCK Bookability Passport. Method-labeled, producer-confirmed evidence. No score, no ranking — verified strengths only.',
}

import { APP_URL } from '@/lib/app-url'

// --- Demo data: fictional artist "Dana Lev" ---

const artist = {
  name: 'Dana Lev',
  nameHe: 'דנה לב',
  genre: 'Singer-songwriter · Indie',
  base: 'Tel Aviv',
  since: '2019',
}

interface ProofUnitData {
  claim: string
  context: string
  method: string
  reviewed: string
}

const drawUnits: ProofUnitData[] = [
  {
    claim: '200–350',
    context: 'Sold-out headline show · Barby, Tel Aviv',
    method: 'TICKET EXPORT · REVIEWED',
    reviewed: 'JAN 2025',
  },
  {
    claim: '70–120',
    context: 'Recurring Friday residency · Levontin 7, Tel Aviv',
    method: 'PRODUCER-CONFIRMED',
    reviewed: 'MAR 2025',
  },
  {
    claim: '400–600',
    context: 'Festival support slot · Meteor Festival, Galilee',
    method: 'PRODUCER-CONFIRMED',
    reviewed: 'AUG 2024',
  },
]

const performanceUnits: ProofUnitData[] = [
  {
    claim: '6 years active',
    context: 'Continuous live activity since 2019',
    method: 'OPERATOR-REVIEWED',
    reviewed: 'JAN 2025',
  },
  {
    claim: 'Clubs · Festivals · Private events',
    context: 'Tel Aviv · Haifa · Galilee · Jerusalem',
    method: 'OPERATOR-REVIEWED',
    reviewed: 'JAN 2025',
  },
]

const communityUnits: ProofUnitData[] = [
  {
    claim: '4,200 followers',
    context: 'Instagram @dana.lev.music — organic, no paid promotion',
    method: 'PLATFORM DATA · REVIEWED',
    reviewed: 'APR 2025',
  },
]

const readinessUnits: ProofUnitData[] = [
  {
    claim: 'Self-managed',
    context: 'No agency. Direct contact via Passport.',
    method: 'OPERATOR-REVIEWED',
    reviewed: 'JAN 2025',
  },
  {
    claim: 'Full tech spec available',
    context: 'Rider on request. PA + monitoring required.',
    method: 'OPERATOR-REVIEWED',
    reviewed: 'JAN 2025',
  },
]

// ---- Sub-components (inline, no imports needed) ----

function BandPill({ value }: { value: string }) {
  return (
    <span style={{
      fontFamily: 'var(--font-space-mono)',
      fontSize: '1.35rem',
      fontWeight: 700,
      color: 'var(--color-ink)',
      letterSpacing: '-0.01em',
    }}>
      {value}
    </span>
  )
}

function MethodLabel({ method, reviewed }: { method: string; reviewed: string }) {
  return (
    <p style={{
      fontFamily: 'var(--font-space-mono)',
      fontSize: '0.6rem',
      letterSpacing: '0.12em',
      color: 'var(--color-stamp-onlight)',
      margin: '0 0 4px',
      textTransform: 'uppercase',
    }}>
      {method} · REVIEWED {reviewed}
    </p>
  )
}

function ProofUnitBlock({ unit, isDrawUnit = false }: { unit: ProofUnitData; isDrawUnit?: boolean }) {
  return (
    <div style={{
      padding: '16px 0',
      borderBottom: '1px solid rgba(10,13,11,0.07)',
    }}>
      <MethodLabel method={unit.method} reviewed={unit.reviewed} />
      {isDrawUnit ? (
        <BandPill value={unit.claim} />
      ) : (
        <p style={{
          fontFamily: 'var(--font-heebo)',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'var(--color-ink)',
          margin: '2px 0 4px',
        }}>{unit.claim}</p>
      )}
      <p style={{
        fontFamily: 'var(--font-heebo)',
        fontSize: '0.85rem',
        color: 'var(--color-tally-onlight)',
        margin: 0,
        lineHeight: 1.5,
      }}>{unit.context}</p>
    </div>
  )
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div style={{ marginBottom: '4px' }}>
      <p style={{
        fontFamily: 'var(--font-space-mono)',
        fontSize: '0.65rem',
        letterSpacing: '0.14em',
        color: 'var(--color-tally-onlight)',
        margin: '0 0 4px',
        textTransform: 'uppercase',
      }}>{label}</p>
      <h2 style={{
        fontFamily: 'var(--font-archivo)',
        fontSize: '1.05rem',
        letterSpacing: '-0.01em',
        margin: 0,
        color: 'var(--color-ink)',
      }}>{title}</h2>
    </div>
  )
}

export default function PassportDemo() {
  return (
    <div style={{ backgroundColor: 'var(--color-night)', minHeight: '100vh' }}>

      {/* DEMO BANNER */}
      <div style={{
        backgroundColor: 'var(--color-stamp)',
        color: 'var(--color-ink)',
        textAlign: 'center',
        padding: '10px 16px',
        fontFamily: 'var(--font-space-mono)',
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
      }}>
        SAMPLE PASSPORT — FICTIONAL ARTIST FOR ILLUSTRATION ONLY
      </div>

      {/* PASSPORT DOCUMENT — floats as a card on wide viewports, full-bleed on mobile */}
      <div
        className="passport-doc"
        style={{
          backgroundColor: 'var(--color-paper)',
          maxWidth: '560px',
          margin: '0 auto',
        }}
      >

      {/* PASSPORT HEADER */}
      <div style={{
        borderBottom: '3px solid var(--color-ink)',
        padding: '32px 24px 24px',
        maxWidth: '480px',
        margin: '0 auto',
      }}>
        {/* LOCK stamp */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
        }}>
          <span style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.14em',
            color: 'var(--color-stamp-onlight)',
            textTransform: 'uppercase',
          }}>
            LOCK · BOOKABILITY PASSPORT
          </span>
        </div>

        {/* Artist identity */}
        <h1 style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontWeight: 400,
          fontSize: 'clamp(1.75rem, 6vw, 2.5rem)',
          letterSpacing: '-0.03em',
          margin: '0 0 4px',
          color: 'var(--color-ink)',
          lineHeight: 1,
        }}>{artist.name}</h1>
        <p style={{
          fontFamily: 'var(--font-heebo)',
          fontSize: '0.85rem',
          color: 'var(--color-tally-onlight)',
          margin: '4px 0 12px',
        }}>{artist.nameHe}</p>
        <p style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          color: 'var(--color-tally-onlight)',
          margin: 0,
        }}>
          {artist.genre} · {artist.base} · Active since {artist.since}
        </p>
      </div>

      {/* PASSPORT BODY */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* LIVE DRAW */}
        <div style={{ paddingTop: '28px', marginBottom: '24px' }}>
          <SectionHeader label="LIVE DRAW" title="Audience evidence from real events" />
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.08em',
            color: 'var(--color-tally-onlight)',
            margin: '6px 0 0',
          }}>
            FIGURES SHOWN AS BAND — NO EXACT HEADCOUNT
          </p>
          <div style={{ marginTop: '4px' }}>
            {drawUnits.map((u, i) => (
              <ProofUnitBlock key={i} unit={u} isDrawUnit />
            ))}
          </div>
        </div>

        {/* SEPARATOR */}
        <div style={{ height: '1px', backgroundColor: 'rgba(10,13,11,0.12)', margin: '4px 0 28px' }} />

        {/* LIVE PERFORMANCE */}
        <div style={{ marginBottom: '24px' }}>
          <SectionHeader label="PERFORMANCE" title="Track record" />
          <div style={{ marginTop: '12px' }}>
            {performanceUnits.map((u, i) => (
              <ProofUnitBlock key={i} unit={u} />
            ))}
          </div>
        </div>

        {/* SEPARATOR */}
        <div style={{ height: '1px', backgroundColor: 'rgba(10,13,11,0.12)', margin: '4px 0 28px' }} />

        {/* COMMUNITY — contextual only */}
        <div style={{ marginBottom: '24px' }}>
          <SectionHeader label="COMMUNITY" title="Audience signals" />
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.08em',
            color: 'var(--color-tally-onlight)',
            margin: '6px 0 0',
          }}>
            CONTEXTUAL — NOT DRAW EVIDENCE
          </p>
          <div style={{ marginTop: '4px' }}>
            {communityUnits.map((u, i) => (
              <ProofUnitBlock key={i} unit={u} />
            ))}
          </div>
        </div>

        {/* SEPARATOR */}
        <div style={{ height: '1px', backgroundColor: 'rgba(10,13,11,0.12)', margin: '4px 0 28px' }} />

        {/* READINESS */}
        <div style={{ marginBottom: '36px' }}>
          <SectionHeader label="READINESS" title="Booking details" />
          <div style={{ marginTop: '12px' }}>
            {readinessUnits.map((u, i) => (
              <ProofUnitBlock key={i} unit={u} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          marginTop: '40px',
          padding: '24px',
          backgroundColor: 'rgba(200,240,77,0.05)',
          border: '1px solid rgba(200,240,77,0.2)',
          borderRadius: 'var(--radius-sm)',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: 'var(--color-stamp-onlight)',
            margin: '0 0 8px',
          }}>
            READY TO BUILD YOURS?
          </p>
          <p style={{
            fontFamily: 'var(--font-heebo)',
            fontSize: '0.9rem',
            color: 'var(--color-tally-onlight)',
            margin: '0 0 16px',
            lineHeight: 1.5,
          }}>
            Build your own Passport. Get verified. Share with booking managers.
          </p>
          <a
            href={`${APP_URL}/signup?utm_source=site&utm_campaign=passport-demo`}
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              backgroundColor: 'var(--color-stamp)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-space-mono)',
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              textDecoration: 'none',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            BUILD YOUR PASSPORT →
          </a>
        </div>
      </div>
      </div>

      <style>{`
        @media (min-width: 700px) {
          .passport-doc {
            margin-top: 48px;
            margin-bottom: 64px;
            border-radius: 20px;
            box-shadow: 0 32px 80px -30px rgba(0,0,0,0.55);
            border: 1px solid rgba(10,13,11,0.08);
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  )
}
