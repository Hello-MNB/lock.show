import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'For Artists — Build Verifiable Live-Performance Proof | GIGPROOF',
  description:
    'GIGPROOF gives independent artists method-labelled evidence that booking managers can actually trust — not a link, not a bio. Build your Bookability Passport.',
  openGraph: {
    title: 'For Artists | GIGPROOF',
    description:
      'You played a great set. Now prove it — in a way a booking manager can trust.',
    type: 'website',
  },
}

import { APP_URL } from '@/lib/app-url'

const ICON_PATHS: Record<string, string> = {
  arrow:
    '<path d="M4 12h15M14 7l5 5-5 5"/>',
  approved:
    '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 8"/>',
  radar:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 3v9l6.5-6.5M12 12l5 3"/>',
  passport:
    '<path d="M5 3h14v18H5z"/><circle cx="12" cy="10" r="3"/><path d="M8 17c.7-2 2-3 4-3s3.3 1 4 3"/>',
}

function Icon({
  id,
  size = 18,
  color = 'currentColor',
}: {
  id: string
  size?: number
  color?: string
}) {
  const paths = ICON_PATHS[id] ?? ''
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'inline-block', flexShrink: 0, verticalAlign: 'middle' }}
      dangerouslySetInnerHTML={{ __html: paths }}
    />
  )
}

function MethodBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-space-mono)',
        fontSize: '0.6rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: 'var(--color-stamp)',
        background: 'rgba(200,240,77,0.08)',
        border: '1px solid rgba(200,240,77,0.2)',
        borderRadius: '2px',
        padding: '0.15rem 0.4rem',
      }}
    >
      {label}
    </span>
  )
}

const painPoints = [
  {
    title: 'The manager loved your mix. Then nothing.',
    body: "You have no way to prove you draw a crowd. A Spotify link shows you exist — it says nothing about what happens when you're in the room.",
  },
  {
    title: "You've played 40 gigs. Nobody outside your network knows.",
    body: 'Your live record lives in WhatsApp threads and memory. It\'s invisible to every booking manager who hasn\'t personally seen you play.',
  },
  {
    title: 'An EPK is a sales pitch. They know it too.',
    body: "Experienced booking managers have seen enough polished bios to stop trusting them. They need something with a third party's name on it.",
  },
]

const steps = [
  {
    num: '01',
    title: 'Log your evidence',
    body: 'Add your gig history, platform data, and professional context. Everything stays private in your Artist Radar until you\'re ready.',
  },
  {
    num: '02',
    title: 'Send the producer a link',
    body: 'One WhatsApp message. They confirm a single claim they know first-hand — no account, no ongoing access.',
  },
  {
    num: '03',
    title: 'Operator reviews and labels',
    body: 'We review the evidence and apply the exact method label. No claim appears on your Passport without one.',
  },
  {
    num: '04',
    title: 'Publish your Passport',
    body: 'One link. Send it before the call. The booking manager sees exactly what was verified — and how.',
  },
]

const radarFeatures = [
  'Gig log with verification status',
  'Evidence gap indicators',
  'Producer invite flow',
  'Privacy controls — nothing public without your OK',
]

const passportFeatures = [
  'Method-labelled claims only',
  'Audience draw as a band (e.g., 200–350)',
  'Each claim shows its review date',
  'Free for booking managers to view',
]

export default function ArtistsPage() {
  return (
    <main>
      {/* ── HERO — floating dark card ──────────────────────────────────── */}
      <section
        style={{
          margin: '28px max(24px, 4vw) 0',
          border: '1px solid #2a362c',
          borderRadius: '20px',
          overflow: 'hidden',
          minHeight: '620px',
          background: `
            linear-gradient(180deg,
              rgba(10,13,11,0.55) 0%,
              rgba(10,13,11,0.86) 55%,
              rgba(10,13,11,0.97) 100%
            ),
            url('/gigproof-persona-artist-v1.webp') center/cover no-repeat
          `,
          color: 'var(--color-paper)',
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: 'clamp(2.5rem, 5vw, 4.5rem)',
        }}
      >
        {/* Lime ambient glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '480px',
            height: '480px',
            borderRadius: '50%',
            right: '-120px',
            bottom: '-180px',
            background: 'rgba(200,240,77,0.1)',
            filter: 'blur(72px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '640px', position: 'relative' }}>
          {/* Eyebrow with pulsing dot */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1.75rem',
            }}
          >
            <span
              className="pulse-dot"
              style={{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--color-stamp)',
                boxShadow: '0 0 10px var(--color-stamp)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.14em',
                color: 'var(--color-stamp)',
                textTransform: 'uppercase',
              }}
            >
              For Artists · לאמנים
            </span>
          </div>

          {/* H1 — Georgia serif, Codex standard */}
          <h1
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 400,
              lineHeight: 0.96,
              letterSpacing: '-0.055em',
              color: 'var(--color-paper)',
              marginBottom: '1.5rem',
            }}
          >
            You played a great set.
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-stamp)' }}>
              Nobody booked you.
            </em>
          </h1>

          {/* Sub */}
          <p
            style={{
              fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)',
              lineHeight: 1.65,
              color: 'rgba(243,245,239,0.62)',
              maxWidth: '520px',
              marginBottom: '2.25rem',
            }}
          >
            You managed your own rider. Built your audience from scratch. And
            when it matters most — a booking manager you&apos;ve never met,
            deciding your next six months — all you can send is a link.
            GIGPROOF changes that.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href={`${APP_URL}/signup`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-stamp)',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '0.9rem 1.75rem',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
              }}
            >
              BUILD YOUR PASSPORT
              <Icon id="arrow" size={15} color="var(--color-ink)" />
            </a>
            <Link
              href="/passport/demo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(243,245,239,0.22)',
                color: 'var(--color-paper)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '0.9rem 1.75rem',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
              }}
            >
              SEE A SAMPLE
            </Link>
          </div>
        </div>

        <style>{`
          @keyframes gp-pulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 8px #c8f04d; }
            50%       { opacity: 0.55; box-shadow: 0 0 20px #c8f04d; }
          }
          .pulse-dot { animation: gp-pulse 2.4s ease-in-out infinite; }
        `}</style>
      </section>

      {/* ── PAIN SECTION ──────────────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--color-night)',
          padding: 'clamp(3.5rem, 7vw, 5.5rem) max(24px, 4vw)',
          borderTop: '1px solid #2a342d',
          borderBottom: '1px solid #2a342d',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.65rem',
              letterSpacing: '0.14em',
              color: 'var(--color-tally)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            THE PROBLEM
          </p>
          <h2
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 400,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              color: 'var(--color-paper)',
              marginBottom: 'clamp(2rem, 5vw, 3.5rem)',
              maxWidth: '600px',
            }}
          >
            Every artist hits the same wall.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1px',
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            {painPoints.map((p, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--color-night)',
                  padding: 'clamp(1.5rem, 3vw, 2.25rem)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.55rem',
                    letterSpacing: '0.12em',
                    color: 'rgba(243,245,239,0.2)',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                  }}
                >
                  0{i + 1}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                    fontWeight: 700,
                    color: 'var(--color-paper)',
                    marginBottom: '0.75rem',
                    lineHeight: 1.3,
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'rgba(243,245,239,0.55)',
                    lineHeight: 1.65,
                  }}
                >
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TWO TOOLS ─────────────────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--color-paper)',
          padding: 'clamp(3.5rem, 7vw, 5.5rem) max(24px, 4vw)',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.65rem',
              letterSpacing: '0.14em',
              color: 'var(--color-tally)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            WHAT YOU GET
          </p>
          <h2
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 400,
              letterSpacing: '-0.04em',
              color: 'var(--color-ink)',
              marginBottom: 'clamp(2rem, 5vw, 3.5rem)',
            }}
          >
            Your proof. Your control.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Artist Radar */}
            <div
              style={{
                border: '1px solid rgba(10,13,11,0.1)',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(1.75rem, 3vw, 2.5rem)',
                background: 'var(--color-paper)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(10,13,11,0.05)',
                  border: '1px solid rgba(10,13,11,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Icon id="radar" size={20} color="var(--color-ink)" />
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                  color: 'var(--color-tally)',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                PRIVATE · Only you see this
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-archivo)',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  color: 'var(--color-ink)',
                  marginBottom: '0.75rem',
                }}
              >
                Artist Radar
              </h3>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--color-tally)',
                  lineHeight: 1.65,
                  marginBottom: '1.5rem',
                }}
              >
                Your private workspace — see what evidence you have, what&apos;s
                missing, and the single highest-value next action. A growth
                tool. Never exposed publicly.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {radarFeatures.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Icon id="approved" size={14} color="rgba(10,13,11,0.35)" />
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-tally)', lineHeight: 1.4 }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bookability Passport */}
            <div
              style={{
                border: '1px solid rgba(10,13,11,0.1)',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(1.75rem, 3vw, 2.5rem)',
                background: 'var(--color-paper)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(10,13,11,0.05)',
                  border: '1px solid rgba(10,13,11,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Icon id="passport" size={20} color="var(--color-ink)" />
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                  color: 'var(--color-tally)',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                PUBLIC · With your explicit approval
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-archivo)',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  color: 'var(--color-ink)',
                  marginBottom: '0.75rem',
                }}
              >
                Bookability Passport
              </h3>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--color-tally)',
                  lineHeight: 1.65,
                  marginBottom: '1.5rem',
                }}
              >
                The view a booking manager sees — verified claims only, each
                with a method label and review date. Nothing appears without
                your approval. No scores. No rankings.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {passportFeatures.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Icon id="approved" size={14} color="rgba(10,13,11,0.35)" />
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-tally)', lineHeight: 1.4 }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sample proof unit — shows how claims display */}
          <div
            style={{
              marginTop: '2.5rem',
              border: '1px solid rgba(10,13,11,0.08)',
              borderRadius: 'var(--radius-lg)',
              padding: 'clamp(1.5rem, 3vw, 2rem)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
                color: 'var(--color-tally)',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
              }}
            >
              Sample claim from a Passport — fictional artist
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1px',
                background: 'rgba(10,13,11,0.06)',
              }}
            >
              {[
                {
                  label: 'Audience Draw',
                  value: '200–350',
                  detail: 'Headline slot, Zappa Club TLV, Feb 2025',
                  badge: 'TICKET EXPORT',
                  date: 'REVIEWED MAR 2025',
                },
                {
                  label: 'Gig',
                  value: 'Barby — support slot',
                  detail: 'Self-managed booking, Dec 2024',
                  badge: 'PRODUCER-CONFIRMED',
                  date: 'REVIEWED DEC 2024',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: 'var(--color-paper)',
                    padding: '1.25rem 1.5rem',
                    borderLeft: '2px solid var(--color-stamp)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.55rem',
                      letterSpacing: '0.1em',
                      color: 'var(--color-tally)',
                      textTransform: 'uppercase',
                      marginBottom: '0.35rem',
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--color-ink)',
                      marginBottom: '0.2rem',
                    }}
                  >
                    {item.value}
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--color-tally)',
                      marginBottom: '0.6rem',
                    }}
                  >
                    {item.detail}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <MethodBadge label={item.badge} />
                    <span
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.58rem',
                        color: 'var(--color-tally)',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW VERIFICATION WORKS ────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--color-night)',
          padding: 'clamp(3.5rem, 7vw, 5.5rem) max(24px, 4vw)',
          borderTop: '1px solid #2a342d',
          borderBottom: '1px solid #2a342d',
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.65rem',
              letterSpacing: '0.14em',
              color: 'var(--color-stamp)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            HOW VERIFICATION WORKS
          </p>
          <h2
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(1.75rem, 4vw, 2.4rem)',
              fontWeight: 400,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              color: 'var(--color-paper)',
              marginBottom: 'clamp(2.5rem, 5vw, 4rem)',
            }}
          >
            From your first gig log to a booking manager&apos;s trust.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {steps.map((s, i, arr) => (
              <div
                key={s.num}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '44px 1fr',
                  gap: '1.25rem',
                  paddingBottom: i < arr.length - 1 ? '2rem' : '0',
                }}
              >
                {/* Step indicator + connector */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: 'var(--color-stamp)',
                      background: 'rgba(200,240,77,0.08)',
                      border: '1px solid rgba(200,240,77,0.2)',
                      borderRadius: 'var(--radius-sm)',
                      width: '44px',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {s.num}
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
                <div style={{ paddingTop: '0.5rem' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-archivo)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--color-paper)',
                      marginBottom: '0.4rem',
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: 'rgba(243,245,239,0.55)',
                      lineHeight: 1.65,
                    }}
                  >
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.62rem',
              letterSpacing: '0.06em',
              color: 'rgba(243,245,239,0.25)',
              marginTop: '2.5rem',
              lineHeight: 1.6,
            }}
          >
            The producer (מפיק) confirms one claim via a bounded magic link —
            no account, no ongoing access. אמרגן ≠ מפיק — they are distinct roles.
          </p>
        </div>
      </section>

      {/* ── CLOSING CTA ───────────────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--color-ink)',
          padding: 'clamp(4rem, 9vw, 7rem) max(24px, 4vw)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.65rem',
              letterSpacing: '0.14em',
              color: 'var(--color-stamp)',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            CLOSED BETA · ISRAEL
          </p>
          <h2
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 400,
              letterSpacing: '-0.055em',
              lineHeight: 0.96,
              color: 'var(--color-paper)',
              marginBottom: '1.75rem',
            }}
          >
            Build the career
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-stamp)' }}>
              behind the spotlight.
            </em>
          </h2>
          <p
            style={{
              fontSize: '1rem',
              color: 'rgba(243,245,239,0.52)',
              lineHeight: 1.7,
              maxWidth: '400px',
              margin: '0 auto 2.5rem',
            }}
          >
            Early access is limited. Israeli artists only.
            Artists pay — booking managers are always free.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a
              href={`${APP_URL}/signup`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-stamp)',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '0.95rem 2rem',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
              }}
            >
              BUILD YOUR PASSPORT
              <Icon id="arrow" size={15} color="var(--color-ink)" />
            </a>
            <Link
              href="/passport/demo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(243,245,239,0.22)',
                color: 'var(--color-paper)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '0.95rem 2rem',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
              }}
            >
              SEE A SAMPLE
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
