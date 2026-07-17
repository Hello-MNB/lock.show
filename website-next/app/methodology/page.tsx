import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  alternates: { canonical: '/methodology' },
  title: 'Methodology — How Evidence Is Verified',
  description: 'Every claim in a LOCK Passport carries a method label — the source and process by which it was verified. No bare numbers. No unattributed data.',
}

const methodLabels = [
  {
    label: 'PRODUCER-CONFIRMED',
    title: 'The producer ran the show.',
    body: 'The person who produced the event — took the financial risk, sold the tickets, managed the venue — confirmed the gig record through a bounded magic link. They saw the date and venue; they clicked confirm. This is the strongest method for live-draw claims.',
    strength: 'Strongest',
  },
  {
    label: 'TICKET EXPORT · REVIEWED',
    title: 'Ticket sales data, reviewed by a human.',
    body: 'The artist or their representative exported a sales report from the ticketing platform (Eventim, Tikaway, or similar). A LOCK operator reviewed the document against the stated claim, and the date of that review is stamped on the claim.',
    strength: 'Strong',
  },
  {
    label: 'PLATFORM DATA · REVIEWED',
    title: 'Streaming or platform data, operator-reviewed.',
    body: 'Used for catalogue and reach claims only — never for live draw. Streaming figures appear as secondary context on a Passport, never as audience-draw evidence. The platform, the metric, and the review date are all displayed.',
    strength: 'Contextual — not draw evidence',
  },
  {
    label: 'SELF-REPORTED',
    title: 'The artist said so — and we say so too.',
    body: 'The artist logged the gig, but no external party has confirmed it yet. It always lives on the private Artist Radar. If the artist chooses to publish it, it can appear on the public Passport — but only under the explicit SELF-REPORTED label, never dressed up as verified.',
    strength: 'Weakest — always labelled if published',
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
    body: 'LOCK generates a unique, bounded magic link for that gig. The artist sends it to the producer; the producer clicks, sees the record, and confirms. The method label upgrades to PRODUCER-CONFIRMED.',
  },
  {
    phase: 'METHOD-LABEL',
    title: 'The method is stamped.',
    body: 'The claim now carries its full label: what was verified, by whom, through which method, and when the review was completed. The label is not fine print — it is the claim.',
  },
  {
    phase: 'ARTIST APPROVES',
    title: 'The artist controls publication.',
    body: 'Nothing crosses to the public Passport without the artist\'s explicit approval. Every claim waits in the private Radar until the artist decides to publish it.',
  },
  {
    phase: 'PUBLISH',
    title: 'The claim appears on the Passport — if eligible.',
    body: 'Only claims that meet the firewall rules appear publicly: band range (not an exact figure), method visible, date stamped, artist-approved. A claim that fails any rule is left off the public surface entirely.',
  },
]

const firewallItems = [
  'Audience draw is always expressed as a band (e.g. 70–150) — never an exact count.',
  'Every public claim shows its method label. "Verified" never stands alone.',
  'Every claim shows a date and geographic area. Evidence from 2023 ≠ evidence from 2026.',
  'Self-reported data appears only with an explicit SELF-REPORTED label — never disguised as verified.',
  'Streaming figures appear as secondary context only — never as draw evidence.',
  'LOCK publishes no score, ranking, percentile, prediction, or guarantee.',
  'A domain with no supported, verified claim is removed from the Passport entirely — never shown as "developing" or "missing".',
]

export default function Methodology() {
  return (
    <main style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', fontFamily: 'var(--font-heebo)' }}>

      {/* ── HERO — compact full-bleed image header ──────────────────────── */}
      <section
        style={{
          overflow: 'hidden',
          minHeight: 'min(56svh, 560px)',
          background: `
            linear-gradient(180deg,
              rgba(10,13,11,0.55) 0%,
              rgba(10,13,11,0.88) 65%,
              rgba(10,13,11,0.98) 100%
            ),
            url('/lockshow-evidence-review.webp') center 25% / cover no-repeat
          `,
          color: 'var(--color-paper)',
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: 'clamp(2rem, 5vw, 3.5rem) max(24px, 4vw)',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', width: '100%' }}>
          <div style={{ maxWidth: '720px', position: 'relative' }}>
            <p style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              color: 'var(--color-stamp)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              METHODOLOGY · HOW CLAIMS ARE VERIFIED
            </p>
            <h1 style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              lineHeight: 1.02,
              letterSpacing: '-0.045em',
              color: 'var(--color-paper)',
              margin: '0 0 1.25rem',
            }}>
              The method
              <br />
              <em style={{ fontStyle: 'italic', color: 'var(--color-stamp)' }}>
                is the claim.
              </em>
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(243,245,239,0.72)', maxWidth: '540px', lineHeight: 1.65, margin: '0 0 1rem' }}>
              Every piece of evidence in a LOCK Passport carries a method label —
              the source and process by which it was verified. A number without
              a method is an assertion. A method-labelled claim is evidence.
            </p>
            <p style={{ fontSize: '1rem', color: 'rgba(243,245,239,0.7)', maxWidth: '540px', lineHeight: 1.65, margin: 0 }}>
              No bare numbers. No unattributed data. No scores.
            </p>
          </div>
        </div>
      </section>

      {/* ── METHOD LABELS — paper ────────────────────────────────────────── */}
      <section style={{
        background: 'var(--color-paper)',
        padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
      }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.14em',
            color: 'var(--color-tally-onlight)',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}>
            METHOD LABELS
          </p>
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            color: 'var(--color-ink)',
            marginBottom: 'clamp(2rem, 5vw, 3.5rem)',
            maxWidth: '600px',
          }}>
            Four labels, four different weights — always in plain sight.
          </h2>

          <div
            className="m-divide"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1px',
              background: 'var(--color-mist)',
            }}
          >
            {methodLabels.map((m, i) => (
              <div
                key={i}
                className="method-label-row m-flat"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(200px, 260px) 1fr',
                  gap: '32px',
                  padding: 'clamp(1.5rem, 3vw, 2rem)',
                  backgroundColor: '#ffffff',
                  alignItems: 'start',
                }}
              >
                <div>
                  <p style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    color: 'var(--color-stamp-onlight)',
                    backgroundColor: 'rgba(200,240,77,0.08)',
                    border: '1px solid rgba(200,240,77,0.2)',
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '12px',
                  }}>
                    {m.label}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.08em',
                    color: 'var(--color-tally-onlight)',
                    margin: 0,
                  }}>
                    WEIGHT: {m.strength}
                  </p>
                </div>
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--color-ink)',
                    marginBottom: '10px',
                  }}>
                    {m.title}
                  </h3>
                  <p style={{ fontSize: '1rem', color: 'var(--color-tally-onlight)', lineHeight: 1.65, margin: 0 }}>
                    {m.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .method-label-row { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ── CLAIM PIPELINE — dark band ───────────────────────────────────── */}
      <section style={{
        backgroundColor: 'var(--color-night)',
        color: '#fff',
        padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}>
            CLAIM PIPELINE
          </p>
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(1.75rem, 4vw, 2.4rem)',
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            color: 'var(--color-paper)',
            marginBottom: 'clamp(2.5rem, 5vw, 4rem)',
          }}>
            How a claim earns its place on a Passport.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {pipelineSteps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '24px',
                  paddingBottom: i < pipelineSteps.length - 1 ? '2.5rem' : '0',
                }}
              >
                {/* Connector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '36px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(200,240,77,0.3)',
                    border: '1px solid rgba(200,240,77,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.75rem',
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
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    color: 'var(--color-stamp)',
                    marginBottom: '6px',
                  }}>
                    {step.phase}
                  </p>
                  <h3 style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: '8px',
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: 0 }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FIREWALL RULES — paper ───────────────────────────────────────── */}
      <section style={{
        background: 'var(--color-paper)',
        padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
      }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ maxWidth: '720px' }}>
            <p style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              color: 'var(--color-tally-onlight)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              THE FIREWALL
            </p>
            <h2 style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: 'clamp(1.75rem, 4vw, 2.4rem)',
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              color: 'var(--color-ink)',
              marginBottom: '0.75rem',
            }}>
              What is always true about every public claim.
            </h2>
            <p style={{ color: 'var(--color-tally-onlight)', fontSize: '1rem', lineHeight: 1.65, marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
              These rules are not guidelines — they are structural. A claim
              that breaks any one of them is simply never published.
            </p>
          </div>

          <div
            className="m-divide"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1px',
              background: 'var(--color-mist)',
              maxWidth: '720px',
            }}
          >
            {firewallItems.map((item, i) => (
              <div
                key={i}
                className="m-flat"
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  padding: 'clamp(1rem, 2.5vw, 1.25rem) clamp(1.25rem, 3vw, 1.5rem)',
                  backgroundColor: '#ffffff',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--color-stamp-onlight)',
                  flexShrink: 0,
                  paddingTop: '3px',
                }}>
                  ✓
                </span>
                <p style={{ fontSize: '1rem', color: 'var(--color-ink)', lineHeight: 1.6, margin: 0 }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT WE DON'T DO — paper ─────────────────────────────────────── */}
      <section style={{
        background: 'var(--color-paper)',
        padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
        borderTop: '1px solid #dde3d9',
      }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            color: 'var(--color-ink)',
            marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
            maxWidth: '600px',
          }}>
            And what LOCK will never do.
          </h2>
          <div
            className="m-divide"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
            }}
          >
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
                className="m-flat"
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
                  paddingTop: '2px',
                }}>
                  ✗
                </span>
                <p style={{ fontSize: '1rem', color: 'var(--color-tally-onlight)', margin: 0, lineHeight: 1.5 }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA — dark ───────────────────────────────────────────── */}
      <section style={{
        backgroundColor: 'var(--color-night)',
        padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(1.9rem, 4.5vw, 3rem)',
            letterSpacing: '-0.045em',
            lineHeight: 1.0,
            color: 'var(--color-paper)',
            marginBottom: '1rem',
          }}>
            See it
            <em style={{ fontStyle: 'italic', color: 'var(--color-stamp)' }}> in practice.</em>
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(243,245,239,0.72)', marginBottom: '2.25rem', lineHeight: 1.7, maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
            The demo Passport shows a real claim pipeline — method labels,
            dates, bands, all visible.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/passport/demo"
              style={{
                display: 'inline-block',
                padding: '0.95rem 2rem',
                backgroundColor: 'var(--color-stamp)',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              SEE A SAMPLE PASSPORT →
            </Link>
            <Link
              href="/how-it-works"
              style={{
                display: 'inline-block',
                padding: '0.95rem 2rem',
                backgroundColor: 'transparent',
                color: 'var(--color-paper)',
                border: '1px solid rgba(243,245,239,0.22)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              HOW IT WORKS
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
