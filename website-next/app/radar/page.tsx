import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Artist Radar — Your Private Evidence Workspace | GIGPROOF',
  description: 'The Artist Radar is your private workspace. See every dimension of your professional profile, know what evidence you have and what\'s missing, and take one clear next action.',
}

const APP_URL = 'https://app.gigproof.co'

const dimensions = [
  {
    id: 'IDENTITY',
    title: 'Identity',
    body: 'Who you are — name, act, aliases, genre, geographic base. The foundation every other dimension builds on.',
  },
  {
    id: 'LIVE DRAW',
    title: 'Live Draw',
    body: 'Audience evidence from real events — producer-confirmed or document-reviewed. Always expressed as a band. Never exact. Never fabricated.',
  },
  {
    id: 'COMMUNITY',
    title: 'Community',
    body: 'Organic audience signals — social following, mailing list, press mentions. Secondary context, never draw evidence.',
  },
  {
    id: 'PERFORMANCE',
    title: 'Live Performance',
    body: 'Your track record — years active, venue types, geographic reach, notable events. Verified gigs, not self-description.',
  },
  {
    id: 'READINESS',
    title: 'Readiness',
    body: 'Practical booking factors — rider, tech spec, travel availability, agent or self-managed. Makes evaluation faster for booking managers.',
  },
  {
    id: 'FEE CONTEXT',
    title: 'Fee Context',
    body: 'A fee range, not an exact figure. Gives a booking manager a realistic frame for decision — never a committed price.',
  },
]

const evidenceStates = [
  {
    state: 'CONFIRMED',
    label: 'Producer-confirmed or operator-reviewed',
    desc: 'The strongest state. A third party has verified the claim via magic link or document review.',
    color: 'var(--color-stamp)',
  },
  {
    state: 'SUBMITTED',
    label: 'Awaiting operator review',
    desc: 'You\'ve submitted a document or sent a magic link. The claim is in the queue.',
    color: '#7A7A3A',
  },
  {
    state: 'PENDING',
    label: 'Logged, not yet verified',
    desc: 'You\'ve added the gig. No producer link sent yet. The next action is clear.',
    color: 'var(--color-tally)',
  },
  {
    state: 'ABSENT',
    label: 'No data for this dimension',
    desc: 'Nothing logged for this area. The Radar surfaces this so you can decide whether to act on it.',
    color: 'rgba(10,13,11,0.3)',
  },
]

const radarVsPassport = [
  { dimension: 'Audience', radar: 'Radar — exact estimate you logged', passport: 'Passport — band range only (e.g. 70–150)' },
  { dimension: 'Verification status', radar: 'Radar — all states, including pending', passport: 'Passport — confirmed only' },
  { dimension: 'Gaps', radar: 'Radar — what\'s missing, next action', passport: 'Passport — gaps are omitted entirely' },
  { dimension: 'Score / ranking', radar: 'Radar — never exists', passport: 'Passport — never exists' },
  { dimension: 'Who sees it', radar: 'Radar — artist only (private)', passport: 'Passport — anyone with the link' },
]

export default function Radar() {
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
            ARTIST RADAR · PRIVATE WORKSPACE
          </p>
          <h1 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: '0 0 20px',
          }}>
            Your professional profile — organized by evidence.
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-tally)', maxWidth: '540px', lineHeight: 1.6, margin: '0 0 16px' }}>
            The Artist Radar is the private workspace where you build, manage, and verify your professional evidence.
            It is visible only to you. Nothing leaves it without your explicit approval.
          </p>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
            color: 'var(--color-tally)',
            margin: 0,
          }}>
            NOT a chart. NOT a score. A navigation surface organized by dimension.
          </p>
        </div>
      </section>

      {/* WHAT IT IS */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--color-paper)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            alignItems: 'start',
          }}>
            <div>
              <p style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                color: 'var(--color-tally)',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}>
                WHAT THE RADAR DOES
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  'Shows your full professional profile organized by dimension',
                  'Displays the evidence state for each dimension — confirmed, pending, absent',
                  'Tells you the ONE next action that matters most right now',
                  'Generates verification magic links for producers to confirm gigs',
                  'Holds your data privately until you choose to publish',
                  'Lets you control exactly what reaches the public Passport',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.7rem',
                      color: 'var(--color-stamp)',
                      flexShrink: 0,
                      paddingTop: '2px',
                    }}>✓</span>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-ink)', margin: 0, lineHeight: 1.55 }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                color: 'var(--color-tally)',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}>
                WHAT IT IS NOT
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  'Not a chart — no polygon, no spider, no circular fill',
                  'Not a score — no number grades your profile',
                  'Not a ranking — no comparison against other artists',
                  'Not a social feed — nothing is visible to outsiders',
                  'Not passive — it surfaces the next action, you take it',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.7rem',
                      color: 'var(--color-void)',
                      flexShrink: 0,
                      paddingTop: '2px',
                    }}>✗</span>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-tally)', margin: 0, lineHeight: 1.55 }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIMENSIONS */}
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
            DIMENSIONS
          </p>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}>
            Six dimensions. One engine. Every artist type.
          </h2>
          <p style={{ color: 'var(--color-tally)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '48px', maxWidth: '560px' }}>
            The Radar adapts to you — not to a fixed genre or format. Dimensions that don&apos;t apply to your
            artist type are switched off. An absent field is not a gap.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}>
            {dimensions.map((d) => (
              <div
                key={d.id}
                style={{
                  padding: '24px',
                  border: '1px solid rgba(10,13,11,0.08)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(10,13,11,0.01)',
                }}
              >
                <p style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.12em',
                  color: 'var(--color-stamp)',
                  marginBottom: '10px',
                }}>
                  {d.id}
                </p>
                <h3 style={{
                  fontFamily: 'var(--font-archivo)',
                  fontSize: '1.05rem',
                  marginBottom: '10px',
                }}>
                  {d.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-tally)', lineHeight: 1.6, margin: 0 }}>
                  {d.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVIDENCE STATES — dark */}
      <section style={{ backgroundColor: 'var(--color-night)', color: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            EVIDENCE STATES
          </p>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}>
            Every dimension shows a state, not a score.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '48px', maxWidth: '520px' }}>
            The Radar doesn&apos;t grade you. It shows you where your evidence stands, and what to do next.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {evidenceStates.map((s) => (
              <div
                key={s.state}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(140px, 200px) 1fr',
                  gap: '24px',
                  padding: '20px 24px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 'var(--radius-sm)',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.12em',
                    color: s.color,
                    display: 'block',
                    marginBottom: '4px',
                  }}>
                    {s.state}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.06em',
                    color: 'rgba(255,255,255,0.35)',
                  }}>
                    {s.label}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.55, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RADAR VS PASSPORT */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'var(--color-tally)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            RADAR VS PASSPORT
          </p>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}>
            Same data. Two faces.
          </h2>
          <p style={{ color: 'var(--color-tally)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '40px', maxWidth: '520px' }}>
            The Radar and the Passport share the same underlying claims — but show very different things.
          </p>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'var(--font-heebo)',
              fontSize: '0.875rem',
            }}>
              <thead>
                <tr>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                    color: 'var(--color-tally)',
                    textTransform: 'uppercase',
                    borderBottom: '2px solid rgba(10,13,11,0.1)',
                    whiteSpace: 'nowrap',
                  }}>Dimension</th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                    color: 'var(--color-stamp)',
                    textTransform: 'uppercase',
                    borderBottom: '2px solid rgba(10,13,11,0.1)',
                    whiteSpace: 'nowrap',
                  }}>Artist Radar (private)</th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                    color: 'var(--color-tally)',
                    textTransform: 'uppercase',
                    borderBottom: '2px solid rgba(10,13,11,0.1)',
                    whiteSpace: 'nowrap',
                  }}>Passport (public)</th>
                </tr>
              </thead>
              <tbody>
                {radarVsPassport.map((row, i) => (
                  <tr
                    key={i}
                    style={{ backgroundColor: i % 2 === 0 ? 'rgba(10,13,11,0.02)' : 'transparent' }}
                  >
                    <td style={{
                      padding: '14px 16px',
                      color: 'var(--color-tally)',
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.7rem',
                      letterSpacing: '0.06em',
                      borderBottom: '1px solid rgba(10,13,11,0.06)',
                      whiteSpace: 'nowrap',
                    }}>{row.dimension}</td>
                    <td style={{
                      padding: '14px 16px',
                      color: 'var(--color-ink)',
                      lineHeight: 1.5,
                      borderBottom: '1px solid rgba(10,13,11,0.06)',
                    }}>{row.radar}</td>
                    <td style={{
                      padding: '14px 16px',
                      color: 'var(--color-tally)',
                      lineHeight: 1.5,
                      borderBottom: '1px solid rgba(10,13,11,0.06)',
                    }}>{row.passport}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        backgroundColor: 'var(--color-stamp)',
        color: 'var(--color-ink)',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'rgba(10,13,11,0.55)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            START BUILDING
          </p>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            letterSpacing: '-0.02em',
            marginBottom: '16px',
          }}>
            Build the Radar. Publish the Passport.
          </h2>
          <p style={{ color: 'rgba(10,13,11,0.65)', marginBottom: '36px', lineHeight: 1.6 }}>
            Your evidence, organized. Your career, legible.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={APP_URL}
              style={{
                display: 'inline-block',
                padding: '15px 32px',
                backgroundColor: '#fff',
                color: 'var(--color-stamp)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
              }}
            >
              BUILD YOUR PASSPORT →
            </a>
            <a
              href="/passport/demo"
              style={{
                display: 'inline-block',
                padding: '15px 32px',
                backgroundColor: 'transparent',
                color: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.4)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              SEE A PASSPORT
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
