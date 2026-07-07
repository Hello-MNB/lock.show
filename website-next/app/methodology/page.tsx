import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Methodology — How Evidence Is Verified | GIGPROOF',
  description: 'Every claim in a GIGPROOF Passport carries a method label — the source and process by which it was verified. No bare numbers. No unattributed data.',
}

const APP_URL = 'https://app.gigproof.co'

const methodLabels = [
  {
    label: 'PRODUCER-CONFIRMED',
    title: 'The producer ran the show.',
    body: 'The person who produced the event — took financial risk, sold tickets, managed the venue — confirmed the gig record via a bounded magic link. They saw the date and venue; they clicked confirm. This is the strongest method for live-draw claims.',
    strength: 'Strongest',
  },
  {
    label: 'TICKET EXPORT · REVIEWED',
    title: 'Ticket sales data, reviewed by a human.',
    body: 'The artist or artist representative exported a sales report from the ticketing platform (Eventim, Tikaway, similar). A GIGPROOF operator reviewed the document against the stated claim. The date of review is stamped on the claim.',
    strength: 'Strong',
  },
  {
    label: 'PLATFORM DATA · REVIEWED',
    title: 'Streaming or platform data, operator-reviewed.',
    body: 'Used for catalogue and reach claims only — never for live-draw. Streaming figures appear as secondary context on a Passport, never as audience-draw evidence. The platform, the metric, and the review date are all displayed.',
    strength: 'Contextual — not draw evidence',
  },
  {
    label: 'SELF-REPORTED · UNVERIFIED',
    title: 'Artist stated; not yet confirmed by a third party.',
    body: 'The artist logged the gig but no external party has confirmed it. This appears on the private Artist Radar only. It never reaches the public Passport until a producer confirms or a document is reviewed.',
    strength: 'Mirror only — never public',
  },
]

const pipelineSteps = [
  {
    phase: 'DISCOVER',
    title: 'A gig is logged.',
    body: 'The artist adds a gig to their Artist Radar — date, venue, estimated audience. The claim enters the system as self-reported.',
  },
  {
    phase: 'CONFIRM',
    title: 'A producer verifies.',
    body: 'GIGPROOF generates a unique, bounded magic link for that gig. The artist sends it to the producer. The producer clicks, sees the record, and confirms. The method label upgrades to PRODUCER-CONFIRMED.',
  },
  {
    phase: 'METHOD-LABEL',
    title: 'The method is stamped.',
    body: 'The claim now carries its full label: what was verified, by whom, via which method, and when the review was completed. The label is not fine print — it is the claim.',
  },
  {
    phase: 'ARTIST APPROVES',
    title: 'Artist controls publication.',
    body: 'Nothing crosses to the public Passport without the artist\'s explicit approval. Every claim waits in the private Radar until the artist decides to publish it.',
  },
  {
    phase: 'PUBLISH',
    title: 'Claim appears on Passport — if eligible.',
    body: 'Only claims that meet the firewall rules appear publicly: band range (not exact figure), method visible, date stamped, artist-approved. Claims that fail any rule are omitted entirely from the public surface.',
  },
]

const firewallItems = [
  'Audience draw is always expressed as a band (e.g. 70–150) — never an exact count.',
  'Every public claim shows its method label. "Verified" never stands alone.',
  'Every claim shows a date and geographic area. Evidence from 2023 ≠ evidence from 2026.',
  'Self-reported and unverified claims never appear on the public Passport.',
  'Streaming figures appear as secondary context only — never as draw evidence.',
  'GIGPROOF publishes no score, ranking, percentile, prediction, or guarantee.',
  'A domain with no supported, verified claim is removed from the Passport entirely — never shown as "developing" or "missing".',
]

export default function Methodology() {
  return (
    <main style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', fontFamily: 'var(--font-heebo)' }}>

      {/* PAGE HEADER */}
      <section style={{ padding: '72px 24px 56px', borderBottom: '1px solid rgba(10,13,11,0.08)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'var(--color-stamp)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            METHODOLOGY · HOW CLAIMS ARE VERIFIED
          </p>
          <h1 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: '0 0 20px',
          }}>
            The method is the claim.
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-tally)', maxWidth: '540px', lineHeight: 1.6, margin: '0 0 20px' }}>
            Every piece of evidence in a GIGPROOF Passport carries a method label — the source and process by which it was verified.
            A number without a method is an assertion. A method-labelled claim is evidence.
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-tally)', maxWidth: '540px', lineHeight: 1.6, margin: 0 }}>
            No bare numbers. No unattributed data. No scores.
          </p>
        </div>
      </section>

      {/* METHOD LABELS */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'var(--color-tally)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            METHOD LABELS
          </p>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            letterSpacing: '-0.02em',
            marginBottom: '48px',
          }}>
            Four labels. Different weights.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {methodLabels.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(200px, 260px) 1fr',
                  gap: '32px',
                  padding: '32px 28px',
                  backgroundColor: i % 2 === 0 ? 'rgba(10,13,11,0.02)' : 'transparent',
                  border: '1px solid rgba(10,13,11,0.06)',
                  borderRadius: 'var(--radius-sm)',
                  alignItems: 'start',
                }}
              >
                <div>
                  <p style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                    color: 'var(--color-stamp)',
                    backgroundColor: 'rgba(200,240,77,0.08)',
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '12px',
                  }}>
                    {m.label}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    color: 'var(--color-tally)',
                    margin: 0,
                  }}>
                    WEIGHT: {m.strength}
                  </p>
                </div>
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: '1.05rem',
                    marginBottom: '10px',
                  }}>
                    {m.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-tally)', lineHeight: 1.65, margin: 0 }}>
                    {m.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLAIM PIPELINE — dark */}
      <section style={{
        backgroundColor: 'var(--color-night)',
        color: '#fff',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            CLAIM PIPELINE
          </p>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            letterSpacing: '-0.02em',
            marginBottom: '48px',
          }}>
            How a claim becomes Passport-eligible.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {pipelineSteps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '24px',
                  paddingBottom: i < pipelineSteps.length - 1 ? '40px' : '0',
                }}
              >
                {/* Connector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '32px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(200,240,77,0.3)',
                    border: '1px solid rgba(200,240,77,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.6rem',
                      color: 'var(--color-stamp)',
                      fontWeight: 700,
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <div style={{ width: '1px', flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: '8px' }} />
                  )}
                </div>
                <div style={{ paddingTop: '4px' }}>
                  <p style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.12em',
                    color: 'var(--color-stamp)',
                    marginBottom: '6px',
                  }}>
                    {step.phase}
                  </p>
                  <h3 style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: '1rem',
                    color: '#fff',
                    marginBottom: '8px',
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: 0 }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FIREWALL RULES */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--color-paper)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'var(--color-tally)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            THE FIREWALL
          </p>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
          }}>
            What is always true about every public claim.
          </h2>
          <p style={{ color: 'var(--color-tally)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '40px' }}>
            These rules are not guidelines. They are structural. A claim that violates any rule is never published.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {firewallItems.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  padding: '16px 20px',
                  backgroundColor: 'var(--color-paper)',
                  border: '1px solid rgba(10,13,11,0.08)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--color-stamp)',
                  flexShrink: 0,
                  paddingTop: '2px',
                }}>
                  ✓
                </span>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-ink)', lineHeight: 1.6, margin: 0 }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE DON'T DO */}
      <section style={{ padding: '64px 24px', borderTop: '1px solid rgba(10,13,11,0.08)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
            letterSpacing: '-0.02em',
            marginBottom: '24px',
          }}>
            What GIGPROOF does not do.
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}>
            {[
              'Predict future performance',
              'Guarantee a booking',
              'Score or rank artists',
              'Compare artists to each other',
              'Publish unconfirmed claims',
              'Store data before consent',
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  padding: '14px 16px',
                  border: '1px solid rgba(178,59,46,0.2)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(178,59,46,0.03)',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--color-void)',
                  flexShrink: 0,
                }}>
                  ✗
                </span>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-tally)', margin: 0, lineHeight: 1.5 }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}>
            See it in practice.
          </h2>
          <p style={{ color: 'var(--color-tally)', marginBottom: '32px', lineHeight: 1.6 }}>
            The demo Passport shows a real claim pipeline — method labels, dates, bands, all visible.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/passport/demo"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                backgroundColor: 'var(--color-stamp)',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
              }}
            >
              SEE A SAMPLE PASSPORT →
            </a>
            <a
              href="/how-it-works"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                backgroundColor: 'transparent',
                color: 'var(--color-ink)',
                border: '1px solid rgba(10,13,11,0.2)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              HOW IT WORKS
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
