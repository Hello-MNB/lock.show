import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/radar' },
  title: 'Artist Radar — Your Private Evidence Workspace',
  description: 'Your private workspace to see what proof you have, what\'s missing, and exactly what to do next — visible only to you, never public.',
}

import { APP_URL } from '@/lib/app-url'

const dimensions = [
  {
    id: 'IDENTITY',
    title: 'Identity',
    body: 'Who you are — name, act, aliases, genre, geographic base. The foundation every other dimension builds on.',
  },
  {
    id: 'LIVE DRAW',
    title: 'Live Draw',
    body: 'Audience evidence from real events — confirmed by the producer who ran the night, or backed by documents. Always shown as an honest range.',
  },
  {
    id: 'COMMUNITY',
    title: 'Community',
    body: 'Organic audience signals — social following, mailing list, press mentions. Secondary context, never draw evidence.',
  },
  {
    id: 'PERFORMANCE',
    title: 'Live Performance',
    body: 'Your track record — years active, venue types, geographic reach, notable events. Real gigs that stand up to a second look.',
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
    label: 'Producer-confirmed or document-backed',
    desc: 'The strongest state. Someone who was there — or the paperwork itself — has backed the claim up.',
    color: 'var(--color-stamp)',
  },
  {
    state: 'SUBMITTED',
    label: 'In review',
    desc: 'You\'ve submitted a document or sent a confirmation link. The claim is in the queue.',
    color: 'rgba(200,240,77,0.75)',
  },
  {
    state: 'PENDING',
    label: 'Logged, not yet confirmed',
    desc: 'You\'ve added the gig. No producer link sent yet. The next step is clear.',
    color: 'var(--color-tally)',
  },
  {
    state: 'ABSENT',
    label: 'Nothing here yet',
    desc: 'Nothing logged for this area. The Radar surfaces this so you can decide whether it\'s worth your time.',
    color: 'rgba(255,255,255,0.6)',
  },
]

const radarVsPassport = [
  { dimension: 'Audience', radar: 'Radar — the exact estimate you logged', passport: 'Passport — band range only (e.g. 70–150)' },
  { dimension: 'Verification status', radar: 'Radar — all states, including pending', passport: 'Passport — confirmed claims, or self-reported when explicitly labelled' },
  { dimension: 'Gaps', radar: 'Radar — what\'s missing, and your next step', passport: 'Passport — gaps simply don\'t appear' },
  { dimension: 'Scores & rankings', radar: 'Radar — none, by design', passport: 'Passport — none, by design' },
  { dimension: 'Who sees it', radar: 'Radar — you alone (private)', passport: 'Passport — anyone with the link' },
]

export default function Radar() {
  return (
    <main style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', fontFamily: 'var(--font-heebo)' }}>

      {/* PAGE HEADER */}
      <section style={{ padding: '72px 24px 56px', borderBottom: '1px solid rgba(10,13,11,0.08)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ maxWidth: '720px' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            color: 'var(--color-stamp-onlight)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            ARTIST RADAR · PRIVATE WORKSPACE
          </p>
          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            margin: '0 0 20px',
          }}>
            See what you&apos;ve got. Build what&apos;s next.
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-tally-onlight)', maxWidth: '540px', lineHeight: 1.6, margin: '0 0 16px' }}>
            The Radar is where you build and check your evidence before anyone
            else sees it. Nothing leaves it without your OK.
          </p>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            color: 'var(--color-tally-onlight)',
            margin: 0,
          }}>
            One clear list of what you have and what to do next — no charts, no grades.
          </p>
          </div>
        </div>
      </section>

      {/* WHAT IT IS */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--color-paper)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            alignItems: 'start',
          }}>
            <div>
              <p style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--color-tally-onlight)',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}>
                WHAT THE RADAR DOES
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  'Shows your whole professional story, area by area',
                  'Shows where each area stands — confirmed, pending, or still open',
                  'Points to the one next step that matters most right now',
                  'Creates the one-time links producers use to confirm your shows',
                  'Holds everything privately until you choose to publish',
                  'Puts you in control of exactly what reaches the public Passport',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--color-stamp-onlight)',
                      flexShrink: 0,
                      paddingTop: '2px',
                    }}>✓</span>
                    <p style={{ fontSize: '1rem', color: 'var(--color-ink)', margin: 0, lineHeight: 1.55 }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--color-tally-onlight)',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}>
                BUILT TO PROTECT YOU
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  'Private by default — outsiders never see your workspace',
                  'Plain words instead of grades — each area simply shows where it stands',
                  'Your story on your own terms — no comparison to any other artist',
                  'Every publish needs your explicit OK, claim by claim',
                  'Your pace — the Radar points to the next step, you decide when',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--color-stamp-onlight)',
                      flexShrink: 0,
                      paddingTop: '2px',
                    }}>✓</span>
                    <p style={{ fontSize: '1rem', color: 'var(--color-tally-onlight)', margin: 0, lineHeight: 1.55 }}>
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
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            color: 'var(--color-tally-onlight)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            WHAT&apos;S INSIDE
          </p>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}>
            Six areas. Everything a booking manager wants to know.
          </h2>
          <p style={{ color: 'var(--color-tally-onlight)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '48px', maxWidth: '560px' }}>
            The Radar adapts to your act, not to a fixed genre or format. If a category
            doesn&apos;t apply to you, it&apos;s simply switched off — that&apos;s not a gap in your evidence.
          </p>

          <div className="m-divide" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}>
            {dimensions.map((d) => (
              <div
                key={d.id}
                className="m-flat"
                style={{
                  padding: '24px',
                  border: '1px solid rgba(10,13,11,0.08)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(10,13,11,0.01)',
                }}
              >
                <p style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.12em',
                  color: 'var(--color-stamp-onlight)',
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
                <p style={{ fontSize: '1rem', color: 'var(--color-tally-onlight)', lineHeight: 1.6, margin: 0 }}>
                  {d.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ATMOSPHERE BAND — artist persona under a dark veil ── */}
      {/* TODO: swap in a lockshow-atmosphere-* scene here if a stronger fit
          arrives when Codex's 4 new atmosphere assets land in /public. */}
      <section
        style={{
          background: `
            linear-gradient(180deg,
              rgba(10,13,11,0.60) 0%,
              rgba(10,13,11,0.55) 45%,
              rgba(10,13,11,0.85) 100%
            ),
            url('/lockshow-persona-artist-v1.webp') center 28% / cover no-repeat
          `,
          minHeight: 'min(46svh, 440px)',
          display: 'flex',
          alignItems: 'flex-end',
          padding: 'clamp(2.5rem, 6vw, 4rem) 24px',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', width: '100%' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.14em',
            color: 'var(--color-stamp)',
            textTransform: 'uppercase',
            marginBottom: '14px',
          }}>
            YOUR WORK, IN ORDER
          </p>
          <p style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--color-paper)',
            maxWidth: '560px',
            margin: 0,
          }}>
            Walk into the conversation already knowing your story holds up.
          </p>
        </div>
      </section>

      {/* EVIDENCE STATES — dark */}
      <section style={{ backgroundColor: 'var(--color-night)', color: 'var(--color-paper)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.6)',
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
            Every area shows where it stands.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '48px', maxWidth: '520px' }}>
            Clear states instead of grades — and the next step for each one.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {evidenceStates.map((s) => (
              <div
                key={s.state}
                className="evidence-state-row"
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
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    color: s.color,
                    display: 'block',
                    marginBottom: '4px',
                  }}>
                    {s.state}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.06em',
                    color: 'rgba(255,255,255,0.6)',
                  }}>
                    {s.label}
                  </span>
                </div>
                <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.55, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 480px) {
            .evidence-state-row { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* RADAR VS PASSPORT */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            color: 'var(--color-tally-onlight)',
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
          <p style={{ color: 'var(--color-tally-onlight)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '40px', maxWidth: '520px' }}>
            The Radar and the Passport share the same underlying claims — but show very different things.
          </p>

          {/* Table — scrolls horizontally on narrow screens; the hint below
              only renders under 640px (see .table-swipe-hint in globals.css) */}
          <p className="table-swipe-hint">Swipe to compare →</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              minWidth: '520px',
              borderCollapse: 'collapse',
              fontFamily: 'var(--font-heebo)',
              fontSize: '1rem',
            }}>
              <thead>
                <tr>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    color: 'var(--color-tally-onlight)',
                    textTransform: 'uppercase',
                    borderBottom: '2px solid rgba(10,13,11,0.1)',
                    whiteSpace: 'nowrap',
                  }}>Dimension</th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    color: 'var(--color-stamp-onlight)',
                    textTransform: 'uppercase',
                    borderBottom: '2px solid rgba(10,13,11,0.1)',
                    whiteSpace: 'nowrap',
                  }}>Artist Radar (private)</th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    color: 'var(--color-tally-onlight)',
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
                      color: 'var(--color-tally-onlight)',
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.75rem',
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
                      color: 'var(--color-tally-onlight)',
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
        backgroundColor: 'var(--color-ink)',
        color: 'var(--color-paper)',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            color: 'var(--color-stamp)',
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
          <p style={{ color: 'rgba(243,245,239,0.6)', marginBottom: '36px', lineHeight: 1.6 }}>
            Your evidence, organized. Your career, legible.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={`${APP_URL}/signup`}
              style={{
                display: 'inline-block',
                padding: '15px 32px',
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
              BUILD YOUR PASSPORT →
            </a>
            <a
              href="/passport/demo"
              style={{
                display: 'inline-block',
                padding: '15px 32px',
                backgroundColor: 'transparent',
                color: 'rgba(243,245,239,0.7)',
                border: '1px solid rgba(243,245,239,0.25)',
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
