import type { Metadata } from 'next'
import Link from 'next/link'

const APP_URL = 'https://app.gigproof.co'
const SITE_URL = 'https://gigproof.co'

export const metadata: Metadata = {
  title: 'GIGPROOF — Booking Proof for Independent Artists',
  description:
    'GIGPROOF turns live-performance evidence into a verified Bookability Passport — so booking managers can evaluate before they risk their reputation.',
  openGraph: {
    title: 'GIGPROOF — Booking Proof for Independent Artists',
    description:
      'Method-labelled performance evidence. Built for booking managers who need to verify before they risk their name.',
    type: 'website',
    url: `${SITE_URL}/`,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'GIGPROOF',
      description: 'Pre-booking proof platform for independent artists',
      inLanguage: ['en', 'he'],
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#org`,
      name: 'GIGPROOF',
      url: `${SITE_URL}/`,
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is a Bookability Passport?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "A Bookability Passport is a public, method-labelled profile showing only verified claims about an artist's live performance history. Every claim includes the evidence method and review date — so booking managers can evaluate without guessing.",
          },
        },
        {
          '@type': 'Question',
          name: 'Is GIGPROOF free for booking managers?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Booking managers (אמרגנים) view Bookability Passports at no cost. Artists pay to build and publish their proof profile.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is evidence verified?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Each claim carries a method label — TICKET EXPORT, PRODUCER-CONFIRMED, PLATFORM DATA, OPERATOR-REVIEWED, or SELF-REPORTED — alongside a review date. The label is always visible. Producers confirm individual claims via a bounded magic link; no account required.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does GIGPROOF not do?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'GIGPROOF does not score artists, produce rankings, predict bookings, or guarantee outcomes. There is no algorithm, no percentage, no gauge. Evidence is shown as-is, labelled by method.',
          },
        },
      ],
    },
  ],
}

// ─── Inline sub-components ─────────────────────────────────────────────────

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-space-mono)',
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: 'var(--color-stamp)',
        border: '1px solid var(--color-stamp)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.15rem 0.5rem',
        marginBottom: '0.75rem',
      }}
    >
      {children}
    </span>
  )
}

function MethodBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-space-mono)',
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: 'var(--color-stamp)',
        background: 'rgba(200,240,77,0.08)',
        border: '1px solid rgba(200,240,77,0.2)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.15rem 0.4rem',
      }}
    >
      {label}
    </span>
  )
}

function InlineProofUnit({
  claim,
  context,
  method,
  reviewed,
  isBand = false,
  note,
}: {
  claim: string
  context: string
  method: string
  reviewed: string
  isBand?: boolean
  note?: string
}) {
  return (
    <div
      style={{
        borderInlineStart: '2px solid var(--color-stamp)',
        paddingInlineStart: '1rem',
        marginBottom: '1.25rem',
      }}
    >
      <div
        style={{
          fontFamily: isBand ? 'var(--font-space-mono)' : 'var(--font-archivo)',
          fontSize: isBand ? '1.4rem' : '1.05rem',
          fontWeight: 700,
          color: 'var(--color-ink)',
          lineHeight: 1.2,
          marginBottom: '0.2rem',
        }}
      >
        {claim}
      </div>
      <div
        style={{
          fontSize: '0.85rem',
          color: 'var(--color-tally)',
          marginBottom: '0.4rem',
          lineHeight: 1.4,
        }}
      >
        {context}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <MethodBadge label={method} />
        <span
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.65rem',
            color: 'var(--color-tally)',
            letterSpacing: '0.06em',
          }}
        >
          {reviewed}
        </span>
      </div>
      {note && (
        <div
          style={{
            marginTop: '0.3rem',
            fontSize: '0.75rem',
            color: 'var(--color-tally)',
            fontStyle: 'italic',
          }}
        >
          {note}
        </div>
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--color-ink)',
            color: 'var(--color-paper)',
            padding: 'clamp(4rem, 10vw, 7rem) 1.25rem clamp(3rem, 7vw, 5rem)',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--color-stamp)',
                marginBottom: '1.5rem',
              }}
            >
              CLOSED BETA · TEL AVIV
            </p>

            <h1
              style={{
                fontFamily: 'var(--font-archivo)',
                fontSize: 'clamp(2.4rem, 7vw, 4.5rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: 'var(--color-paper)',
                marginBottom: '1.5rem',
              }}
            >
              Before a booking manager risks their name, they need proof.
            </h1>

            <p
              style={{
                fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)',
                lineHeight: 1.65,
                color: 'rgba(243,245,239,0.75)',
                maxWidth: '600px',
                margin: '0 auto 2.5rem',
              }}
            >
              GIGPROOF turns your live-performance evidence into a verified, method-labelled
              Bookability Passport — so booking managers can evaluate without guessing.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <a
                href={APP_URL}
                style={{
                  display: 'inline-block',
                  background: 'var(--color-stamp)',
                  color: 'var(--color-ink)',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '0.9rem 2rem',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                }}
              >
                BUILD YOUR PASSPORT →
              </a>
              <Link
                href="/passport/demo"
                style={{
                  display: 'inline-block',
                  background: 'transparent',
                  color: 'var(--color-paper)',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '0.9rem 2rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(243,245,239,0.3)',
                  textDecoration: 'none',
                }}
              >
                SEE A SAMPLE PASSPORT
              </Link>
            </div>
          </div>
        </section>

        {/* ── FIREWALL BANNER ──────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--color-paper)',
            borderBottom: '1px solid rgba(10,13,11,0.1)',
            padding: '0.85rem 1.25rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              color: 'var(--color-tally)',
            }}
          >
            NO SCORE · NO RANKING · NO PREDICTION · NO GUARANTEE — EVIDENCE, LABELLED BY METHOD
          </p>
        </section>

        {/* ── THREE ACTORS ─────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--color-paper)',
            padding: 'clamp(3rem, 7vw, 5rem) 1.25rem',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--color-stamp)',
                marginBottom: '0.5rem',
                textAlign: 'center',
              }}
            >
              THREE DISTINCT ROLES
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-archivo)',
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--color-ink)',
                marginBottom: '0.5rem',
                textAlign: 'center',
              }}
            >
              One platform, three different jobs
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--color-tally)',
                textAlign: 'center',
                marginBottom: '3rem',
                maxWidth: '560px',
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: 1.6,
              }}
            >
              Booking manager ≠ producer. These are distinct roles with distinct interests —
              and GIGPROOF keeps them separate at every level.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {/* ARTIST */}
              <div
                style={{
                  background: 'var(--color-paper)',
                  border: '1px solid rgba(10,13,11,0.1)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2rem',
                }}
              >
                <Tag>אמן · ARTIST</Tag>
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: 'var(--color-ink)',
                    marginBottom: '0.75rem',
                  }}
                >
                  Build your proof profile
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-tally)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                  Collect evidence, invite producers to confirm a single claim, and publish
                  a verified Passport that speaks for you before the first call.
                </p>
                <Link
                  href="/artists"
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--color-stamp)',
                    textDecoration: 'none',
                  }}
                >
                  FOR ARTISTS →
                </Link>
              </div>

              {/* BOOKING MANAGER */}
              <div
                style={{
                  background: 'var(--color-paper)',
                  border: '1px solid rgba(10,13,11,0.1)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2rem',
                }}
              >
                <Tag>אמרגן · BOOKING MANAGER</Tag>
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: 'var(--color-ink)',
                    marginBottom: '0.75rem',
                  }}
                >
                  Evaluate before you risk your name
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-tally)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                  Read a Bookability Passport in under two minutes. Every claim shows its
                  method and review date — no algorithm, no guesswork, no black box.
                  Viewing is always free.
                </p>
                <Link
                  href="/bookers"
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--color-stamp)',
                    textDecoration: 'none',
                  }}
                >
                  FOR BOOKING MANAGERS →
                </Link>
              </div>

              {/* PRODUCER */}
              <div
                style={{
                  background: 'var(--color-paper)',
                  border: '1px solid rgba(10,13,11,0.1)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2rem',
                }}
              >
                <Tag>מפיק · PRODUCER</Tag>
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: 'var(--color-ink)',
                    marginBottom: '0.75rem',
                  }}
                >
                  Confirm one claim, no account needed
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-tally)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                  Receive a bounded magic link, confirm a single claim you know
                  first-hand, and done. Your confirmation is method-labelled on
                  the Passport.
                </p>
                <Link
                  href="/producers"
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--color-stamp)',
                    textDecoration: 'none',
                  }}
                >
                  FOR PRODUCERS →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROOF UNIT DEMO ──────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--color-night)',
            padding: 'clamp(3rem, 7vw, 5rem) 1.25rem',
          }}
        >
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '3rem',
                alignItems: 'center',
              }}
            >
              {/* Left: explanation */}
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    color: 'var(--color-stamp)',
                    marginBottom: '0.75rem',
                  }}
                >
                  THE PROOF UNIT
                </p>
                <h2
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    color: 'var(--color-paper)',
                    marginBottom: '1rem',
                    lineHeight: 1.15,
                  }}
                >
                  Every claim shows how it was verified
                </h2>
                <p
                  style={{
                    fontSize: '1rem',
                    color: 'rgba(243,245,239,0.65)',
                    lineHeight: 1.7,
                    marginBottom: '1.5rem',
                  }}
                >
                  No bare numbers. No unexplained assertions. Every piece of evidence on
                  a Bookability Passport carries a method label and a review date —
                  so a booking manager can judge the strength of each claim, not just its value.
                </p>
                <Link
                  href="/methodology"
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--color-stamp)',
                    textDecoration: 'none',
                  }}
                >
                  READ THE METHODOLOGY →
                </Link>
              </div>

              {/* Right: live proof units */}
              <div
                style={{
                  background: 'rgba(243,245,239,0.04)',
                  border: '1px solid rgba(243,245,239,0.1)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2rem',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                    color: 'rgba(243,245,239,0.3)',
                    marginBottom: '1.5rem',
                  }}
                >
                  SAMPLE PROOF UNITS — FICTIONAL ARTIST
                </p>

                {/* BandPill proof unit */}
                <div
                  style={{
                    borderLeft: '2px solid var(--color-stamp)',
                    paddingLeft: '1rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--color-paper)',
                      marginBottom: '0.2rem',
                    }}
                  >
                    200–350
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(243,245,239,0.5)', marginBottom: '0.5rem' }}>
                    Headline audience draw, Zappa Club TLV, Feb 2025
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <MethodBadge label="TICKET EXPORT" />
                    <span
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.65rem',
                        color: 'rgba(243,245,239,0.35)',
                        letterSpacing: '0.06em',
                      }}
                    >
                      REVIEWED MAR 2025
                    </span>
                  </div>
                </div>

                {/* Performance proof unit */}
                <div
                  style={{
                    borderLeft: '2px solid var(--color-stamp)',
                    paddingLeft: '1rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-archivo)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--color-paper)',
                      marginBottom: '0.2rem',
                    }}
                  >
                    Self-managed touring since 2021
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(243,245,239,0.5)', marginBottom: '0.5rem' }}>
                    Full booking coordination, rider management, sound requirements
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <MethodBadge label="OPERATOR-REVIEWED" />
                    <span
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.65rem',
                        color: 'rgba(243,245,239,0.35)',
                        letterSpacing: '0.06em',
                      }}
                    >
                      REVIEWED JAN 2025
                    </span>
                  </div>
                </div>

                {/* Producer-confirmed proof unit */}
                <div
                  style={{
                    borderLeft: '2px solid var(--color-stamp)',
                    paddingLeft: '1rem',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--color-paper)',
                      marginBottom: '0.2rem',
                    }}
                  >
                    70–120
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(243,245,239,0.5)', marginBottom: '0.5rem' }}>
                    Capacity, Shapira Arts Hub, support slot, Dec 2024
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <MethodBadge label="PRODUCER-CONFIRMED" />
                    <span
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.65rem',
                        color: 'rgba(243,245,239,0.35)',
                        letterSpacing: '0.06em',
                      }}
                    >
                      REVIEWED DEC 2024
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--color-paper)',
            padding: 'clamp(3rem, 7vw, 5rem) 1.25rem',
          }}
        >
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--color-stamp)',
                marginBottom: '0.5rem',
                textAlign: 'center',
              }}
            >
              HOW IT WORKS
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-archivo)',
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--color-ink)',
                marginBottom: '3rem',
                textAlign: 'center',
              }}
            >
              From evidence to verified Passport
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                {
                  step: '01',
                  title: 'Log your evidence',
                  body: 'Add gig history, platform data, and professional context. Everything stays private in your Artist Radar until you choose to publish.',
                },
                {
                  step: '02',
                  title: 'Invite a producer to confirm',
                  body: 'Send a bounded magic link to a producer who was there. They confirm one claim — no account, no friction.',
                },
                {
                  step: '03',
                  title: 'Operator reviews and labels',
                  body: 'GIGPROOF reviews your evidence and applies the correct method label. No claim appears on your Passport without a label.',
                },
                {
                  step: '04',
                  title: 'Publish your Bookability Passport',
                  body: 'Your Passport shows verified strengths only. Share the link with a booking manager — they see exactly what was verified and how.',
                },
              ].map(({ step, title, body }, i, arr) => (
                <div
                  key={step}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '3rem 1fr',
                    gap: '1.25rem',
                    paddingBottom: i < arr.length - 1 ? '2.5rem' : '0',
                    position: 'relative',
                  }}
                >
                  {/* Step number + connector */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-stamp)',
                        background: 'rgba(200,240,77,0.08)',
                        border: '1px solid rgba(200,240,77,0.2)',
                        borderRadius: 'var(--radius-sm)',
                        width: '2.5rem',
                        height: '2.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {step}
                    </div>
                    {i < arr.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          width: '1px',
                          background: 'rgba(200,240,77,0.15)',
                          marginTop: '0.5rem',
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ paddingTop: '0.4rem' }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-archivo)',
                        fontSize: '1.1rem',
                        fontWeight: 900,
                        color: 'var(--color-ink)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      {title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.95rem',
                        color: 'var(--color-tally)',
                        lineHeight: 1.65,
                      }}
                    >
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link
                href="/how-it-works"
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--color-stamp)',
                  textDecoration: 'none',
                }}
              >
                SEE THE FULL WALKTHROUGH →
              </Link>
            </div>
          </div>
        </section>

        {/* ── TRUST STATEMENT ──────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--color-ink)',
            padding: 'clamp(3rem, 7vw, 5rem) 1.25rem',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--color-stamp)',
                marginBottom: '1.5rem',
              }}
            >
              THE DESIGN PRINCIPLE
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-archivo)',
                fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--color-paper)',
                lineHeight: 1.15,
                marginBottom: '1.5rem',
              }}
            >
              A booking manager&apos;s reputation is their livelihood. We treat it that way.
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'rgba(243,245,239,0.65)',
                lineHeight: 1.75,
                marginBottom: '2.5rem',
              }}
            >
              GIGPROOF has no algorithm that scores artists. No ranking. No &ldquo;top performers.&rdquo;
              No percentage telling a booker whether to say yes. We show evidence, labelled by
              how it was collected — and we let the booker decide.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1px',
                background: 'rgba(243,245,239,0.1)',
                border: '1px solid rgba(243,245,239,0.1)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                marginBottom: '2.5rem',
              }}
            >
              {['NO SCORE', 'NO RANKING', 'NO PREDICTION', 'NO GUARANTEE'].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: '1rem',
                    background: 'var(--color-ink)',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'rgba(243,245,239,0.45)',
                    textAlign: 'center',
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/methodology"
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--color-paper)',
                  border: '1px solid rgba(243,245,239,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 1.75rem',
                  textDecoration: 'none',
                }}
              >
                READ THE METHODOLOGY
              </Link>
              <Link
                href="/passport/demo"
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--color-paper)',
                  border: '1px solid rgba(243,245,239,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 1.75rem',
                  textDecoration: 'none',
                }}
              >
                SEE A SAMPLE PASSPORT
              </Link>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--color-stamp)',
            padding: 'clamp(3rem, 7vw, 5rem) 1.25rem',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: 'var(--font-archivo)',
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--color-ink)',
                marginBottom: '1rem',
                lineHeight: 1.15,
              }}
            >
              Ready to build your proof profile?
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'rgba(10,13,11,0.65)',
                marginBottom: '2rem',
                lineHeight: 1.65,
              }}
            >
              Closed beta — Israeli artists only. Early access is limited.
            </p>
            <a
              href={APP_URL}
              style={{
                display: 'inline-block',
                background: 'var(--color-ink)',
                color: 'var(--color-paper)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '1rem 2.5rem',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
              }}
            >
              REQUEST ACCESS →
            </a>
          </div>
        </section>
      </main>
    </>
  )
}
