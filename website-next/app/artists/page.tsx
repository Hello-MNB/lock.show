import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  alternates: { canonical: '/artists' },
  title: 'Your Sets Fill Rooms. Now Fill the Calendar.',
  description:
    'The nights you already played can open the rooms you want next. LOCK turns your real gig history into one link a booking manager can trust — built by you, published only when you say so.',
  openGraph: {
    url: '/artists',
    title: 'For Artists | LOCK',
    description:
      'Your talent is real. LOCK makes it visible — one link that carries your best nights into rooms you haven\'t played yet.',
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
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: 'var(--color-stamp-onlight)',
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
    title: 'The manager loved your mix. Then — silence.',
    body: 'A link shows you exist. It says nothing about what happens when you\'re actually in the room — the part you\'re best at.',
  },
  {
    title: 'Forty real nights, invisible to every room you haven\'t played.',
    body: 'Your live history lives in WhatsApp threads and other people\'s memories. It deserves better than that. So do you.',
  },
  {
    title: 'They\'ve stopped believing EPKs. You can\'t blame them.',
    body: 'A polished bio is your word for it. The rooms you want next need someone else\'s word too — and you\'ve already earned it.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Log it.',
    body: 'Your gigs, your numbers, your story — private in your Radar until you say otherwise.',
  },
  {
    num: '02',
    title: 'Invite.',
    body: 'One WhatsApp message to the producer who ran your night. They confirm it in a tap.',
  },
  {
    num: '03',
    title: 'We check.',
    body: 'Every claim gets a proper look before it goes anywhere near your Passport.',
  },
  {
    num: '04',
    title: 'Share.',
    body: 'One link, sent before the call. Your best nights, standing on their own.',
  },
]

const radarFeatures = [
  'Every night you\'ve played, gathered in one place',
  'A clear picture of what to build next — no guesswork',
  'One-tap links to bring a producer in to confirm a show',
  'Private by default. Nothing moves without your OK',
]

const passportFeatures = [
  'Only what\'s been checked — with how it was checked, in plain sight',
  'Your crowd shown as an honest range, e.g. 200–350 — never a made-up exact number',
  'Every night dated, so it reads fresh, not recycled',
  'Always free for booking managers to open — no wall between you and the yes',
]

export default function ArtistsPage() {
  return (
    <main>
      {/* ── HERO — floating dark card ──────────────────────────────────── */}
      <section
        className="persona-hero-artist"
        style={{
                    overflow: 'hidden',
          minHeight: 'min(92svh, 880px)',
          background: `
            linear-gradient(180deg,
              rgba(10,13,11,0.55) 0%,
              rgba(10,13,11,0.86) 55%,
              rgba(10,13,11,0.97) 100%
            ),
            url('/lockshow-persona-artist-v1.webp') center/cover no-repeat
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
                fontSize: '0.75rem',
                letterSpacing: '0.14em',
                color: 'var(--color-stamp)',
                textTransform: 'uppercase',
              }}
            >
              For Artists
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
            Your sets fill rooms.
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-stamp)' }}>
              Now fill the calendar.
            </em>
          </h1>

          {/* Sub */}
          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.05rem)',
              lineHeight: 1.65,
              color: 'rgba(243,245,239,0.72)',
              maxWidth: '520px',
              marginBottom: '2.25rem',
            }}
          >
            The nights you&apos;ve already played can open the rooms you
            haven&apos;t. LOCK turns your real gig history into one link a
            booking manager can trust — and it starts tonight.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href={`${APP_URL}/signup?role=artist`}
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
                padding: '0.95rem 1.75rem',
                borderRadius: '10px',
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
                padding: '0.95rem 1.75rem',
                borderRadius: '10px',
                textDecoration: 'none',
              }}
            >
              SEE A SAMPLE
            </Link>
          </div>

          {/* Trust cue */}
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              color: 'rgba(243,245,239,0.7)',
              marginTop: '1.5rem',
            }}
          >
            FREE FOR ISRAELI ARTISTS DURING THE PILOT · REAL NIGHTS, CHECKED
          </p>
        </div>

        <style>{`
          @keyframes gp-pulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 8px #c8f04d; }
            50%       { opacity: 0.55; box-shadow: 0 0 20px #c8f04d; }
          }
          .pulse-dot { animation: gp-pulse 2.4s ease-in-out infinite; }
        `}</style>
      </section>

      {/* ── PAIN SECTION — paper surface (DS surface contract: paper does the
             work; dark regions shorten — this was a full dark band) ── */}
      <section
        style={{
          background: 'var(--color-paper)',
          padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
          borderTop: '1px solid #dde3d9',
          borderBottom: '1px solid #dde3d9',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              color: 'var(--color-tally-onlight)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            SOUND FAMILIAR?
          </p>
          <h2
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 400,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              color: 'var(--color-ink)',
              marginBottom: 'clamp(2rem, 5vw, 3.5rem)',
              maxWidth: '600px',
            }}
          >
            It was never your sound.
            It&apos;s that the right rooms can&apos;t see you yet.
          </h2>

          <div
            className="m-divide"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1px',
              background: 'var(--color-mist)',
            }}
          >
            {painPoints.map((p, i) => (
              <div
                key={i}
                className="m-flat"
                style={{
                  background: '#ffffff',
                  padding: 'clamp(1.25rem, 3vw, 2rem)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    color: 'var(--color-tally-onlight)',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                  }}
                >
                  0{i + 1}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                    fontWeight: 700,
                    color: 'var(--color-ink)',
                    marginBottom: '0.75rem',
                    lineHeight: 1.3,
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontSize: '1rem',
                    color: 'var(--color-tally-onlight)',
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
          padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              color: 'var(--color-tally-onlight)',
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
            Your story, in your hands.
          </h2>

          <div
            className="m-divide"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'clamp(1rem, 2vw, 1.5rem)',
            }}
          >
            {/* Artist Radar */}
            <div
              className="m-flat"
              style={{
                border: '1px solid rgba(10,13,11,0.1)',
                borderRadius: '16px',
                padding: 'clamp(1.25rem, 3vw, 2rem)',
                background: 'var(--color-paper)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
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
                  fontSize: '0.75rem',
                  letterSpacing: '0.12em',
                  color: 'var(--color-tally-onlight)',
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
                  fontSize: '1rem',
                  color: 'var(--color-tally-onlight)',
                  lineHeight: 1.65,
                  marginBottom: '1.5rem',
                }}
              >
                Your backstage. Every night you&apos;ve played in one place,
                and a clear next move — start with one link, and build from
                there. Nobody sees it until you decide they should.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {radarFeatures.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Icon id="approved" size={14} color="rgba(10,13,11,0.35)" />
                    <span style={{ fontSize: '1rem', color: 'var(--color-tally-onlight)', lineHeight: 1.5 }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bookability Passport */}
            <div
              className="m-flat"
              style={{
                border: '1px solid rgba(10,13,11,0.1)',
                borderRadius: '16px',
                padding: 'clamp(1.25rem, 3vw, 2rem)',
                background: 'var(--color-paper)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
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
                  fontSize: '0.75rem',
                  letterSpacing: '0.12em',
                  color: 'var(--color-tally-onlight)',
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
                  fontSize: '1rem',
                  color: 'var(--color-tally-onlight)',
                  lineHeight: 1.65,
                  marginBottom: '1.5rem',
                }}
              >
                Your front of house. The one link you send before the call —
                your strongest nights, checked and dated, speaking for you in
                rooms you haven&apos;t entered yet. Your story, exactly as it
                happened.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {passportFeatures.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Icon id="approved" size={14} color="rgba(10,13,11,0.35)" />
                    <span style={{ fontSize: '1rem', color: 'var(--color-tally-onlight)', lineHeight: 1.5 }}>
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
              borderRadius: '16px',
              padding: 'clamp(1.25rem, 3vw, 2rem)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                color: 'var(--color-tally-onlight)',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              Straight from a Passport — fictional artist
            </p>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--color-tally-onlight)',
                lineHeight: 1.6,
                marginBottom: '1.25rem',
                maxWidth: '560px',
              }}
            >
              This is your night, the way a booking manager sees it: what
              happened, who vouched, and when. No spin required.
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
                  detail: 'Booked it herself, Dec 2024',
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
                      fontSize: '0.75rem',
                      letterSpacing: '0.1em',
                      color: 'var(--color-tally-onlight)',
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
                      color: 'var(--color-tally-onlight)',
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
                        fontSize: '0.75rem',
                        color: 'var(--color-tally-onlight)',
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

      {/* ── HOW IT WORKS — paper surface (DS: dark shortens) ── */}
      <section
        style={{
          background: 'var(--color-paper)',
          padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
          borderTop: '1px solid #dde3d9',
          borderBottom: '1px solid #dde3d9',
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              color: 'var(--color-stamp-onlight)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            HOW IT WORKS
          </p>
          <h2
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(1.75rem, 4vw, 2.4rem)',
              fontWeight: 400,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              color: 'var(--color-ink)',
              marginBottom: 'clamp(2.5rem, 5vw, 4rem)',
            }}
          >
            Four moves. One link. Rooms open.
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
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--color-ink)',
                      background: 'var(--color-stamp)',
                      border: '1px solid rgba(10,13,11,0.1)',
                      borderRadius: '10px',
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
                        background: 'var(--color-mist)',
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
                      color: 'var(--color-ink)',
                      marginBottom: '0.4rem',
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '1rem',
                      color: 'var(--color-tally-onlight)',
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
              fontSize: '1rem',
              color: 'var(--color-tally-onlight)',
              marginTop: '2.5rem',
              lineHeight: 1.6,
            }}
          >
            Two different people, by the way: the producer who ran your night
            confirms it — the booking manager simply reads the result.
          </p>
        </div>
      </section>

      {/* ── CLOSING CTA — live-crowd atmosphere under a dark veil ───────── */}
      {/* TODO: swap in a lockshow-atmosphere-* scene here when Codex's 4 new
          atmosphere assets land in /public. */}
      <section
        style={{
          background: `
            linear-gradient(180deg,
              rgba(10,13,11,0.92) 0%,
              rgba(10,13,11,0.82) 45%,
              rgba(10,13,11,0.94) 100%
            ),
            url('/lockshow-hero-live.webp') center/cover no-repeat
          `,
          padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
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
            The next room
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-stamp)' }}>
              is already waiting.
            </em>
          </h2>
          <p
            style={{
              fontSize: '1rem',
              color: 'rgba(243,245,239,0.72)',
              lineHeight: 1.7,
              maxWidth: '400px',
              margin: '0 auto 2.5rem',
            }}
          >
            Early access, Israeli artists first. Free to build, free to
            publish during the pilot — and always free for booking managers
            to open. Start with one link tonight.
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
              href={`${APP_URL}/signup?role=artist`}
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
                borderRadius: '10px',
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
                borderRadius: '10px',
                textDecoration: 'none',
              }}
            >
              SEE A SAMPLE
            </Link>
          </div>
        </div>
      </section>

      {/* ── "NOT YOU?" LANE — cross-entity transition (SITE-NAVIGATION-SPEC law 5) ── */}
      <section
        style={{
          background: 'var(--color-paper)',
          borderTop: '1px solid #dde3d9',
          padding: '2rem max(24px, 4vw)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--color-tally-onlight)',
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          Booking talent instead?{' '}
          <Link
            href="/bookers"
            style={{
              color: 'var(--color-ink)',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
            }}
          >
            For booking managers
          </Link>
          {' '}· Running productions?{' '}
          <Link
            href="/producers"
            style={{
              color: 'var(--color-ink)',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
            }}
          >
            For producers
          </Link>
        </p>
      </section>
    </main>
  )
}
