import type { Metadata } from 'next'
import Link from 'next/link'
import { DoorStamp } from '@/components/door-stamp'

export const metadata: Metadata = {
  alternates: { canonical: '/bookers' },
  title: 'For Booking Managers — Book With Context, Not Guesswork',
  description:
    'Your name is on the line every time you book an unfamiliar artist. Open their LOCK Passport and see checked, dated evidence in two minutes — free for booking managers, always. No account, no signup.',
  openGraph: {
    url: '/bookers',
    title: 'For Booking Managers | LOCK',
    description:
      'Book with context, not guesswork. Checked evidence in two minutes — free for booking managers, always.',
    type: 'website',
  },
}

const risks = [
  {
    num: '01',
    title: 'The dead dancefloor.',
    body: 'When a room stays empty, nobody blames the artist they’ve never heard of. They remember the אמרגן who put the name on the bill. That night follows you.',
  },
  {
    num: '02',
    title: 'The hype folder.',
    body: 'EPKs, follower counts, “sold out” stories. Everything looks enormous, and none of it answers the only question that matters: who actually shows up?',
  },
  {
    num: '03',
    title: 'No time to play detective.',
    body: 'New names land every week. You can’t give each one an evening of digging through Instagram — and you shouldn’t have to.',
  },
]

const passportFeatures = [
  {
    label: 'DRAW AS A BAND, NOT A BOAST',
    title: 'A range the evidence can actually carry.',
    body: 'Audience draw appears as a band — 60–100, 100–200 — not a flattering number someone typed into a bio. It’s a quieter claim, and that’s exactly why you can lean on it.',
  },
  {
    label: 'HOW IT WAS CHECKED',
    title: 'You always know what a claim is worth.',
    body: 'Confirmed by the producer who ran the night. Pulled from a ticket platform. Or the artist’s own word — clearly marked as such. Nothing hides behind polish; you weigh it yourself.',
  },
  {
    label: 'FRESH AND LOCAL',
    title: 'A packed room in 2023 isn’t a packed room now.',
    body: 'Every claim carries when it happened and where. You’re reading the artist who exists today, in the market you actually book — not a highlight reel from another life.',
  },
  {
    label: 'NO ACCOUNT, EVER',
    title: 'One link, two minutes, zero friction.',
    body: 'The artist sends a link. You open it in any browser — no app, no signup, nothing to install. LOCK is free for booking managers, always.',
  },
]

export default function BookersPage() {
  return (
    <main style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', fontFamily: 'var(--font-heebo)' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        style={{
          overflow: 'hidden',
          minHeight: 'min(92svh, 880px)',
          background: `linear-gradient(180deg, rgba(10,13,11,0.55) 0%, rgba(10,13,11,0.86) 55%, rgba(10,13,11,0.97) 100%), url('/lockshow-persona-manager-v1.webp') center/cover no-repeat`,
          color: 'var(--color-paper)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3.5rem)',
        }}
      >
        {/* Stamp watermarks */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-15px',
            right: '-55px',
            transform: 'rotate(-11deg)',
            color: 'var(--color-paper)',
            opacity: 0.07,
            pointerEvents: 'none',
          }}
        >
          <DoorStamp size={310} />
        </div>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '-20px',
            left: '-70px',
            transform: 'rotate(7deg)',
            color: 'var(--color-paper)',
            opacity: 0.03,
            pointerEvents: 'none',
          }}
        >
          <DoorStamp size={240} />
        </div>
        <div style={{ maxWidth: '640px', position: 'relative' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              color: 'var(--color-stamp)',
              textTransform: 'uppercase',
              marginBottom: '1.75rem',
            }}
          >
            FOR BOOKING MANAGERS · לאמרגנים
          </p>
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
            Book with context,
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-stamp)' }}>
              not guesswork.
            </em>
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-heebo), system-ui, sans-serif',
              fontSize: 'clamp(1rem, 1.8vw, 1.1rem)',
              lineHeight: 1.65,
              color: 'rgba(243,245,239,0.72)',
              maxWidth: '520px',
              marginBottom: '2.25rem',
            }}
          >
            An unfamiliar artist wants your stage. Before your name goes on
            that flyer, open their Passport and see what actually happened at
            their last shows — checked, dated, readable in two minutes.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link
              href="/passport/demo"
              style={{
                background: 'var(--color-stamp)',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-space-mono), monospace',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '0.95rem 1.75rem',
                textDecoration: 'none',
                borderRadius: '10px',
                display: 'inline-block',
              }}
            >
              SEE A SAMPLE PASSPORT →
            </Link>
            <Link
              href="/how-it-works"
              style={{
                border: '1px solid rgba(243,245,239,0.22)',
                color: 'var(--color-paper)',
                fontFamily: 'var(--font-space-mono), monospace',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '0.95rem 1.75rem',
                textDecoration: 'none',
                borderRadius: '10px',
                display: 'inline-block',
              }}
            >
              HOW IT WORKS
            </Link>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              color: 'rgba(243,245,239,0.7)',
              marginTop: '1.5rem',
            }}
          >
            FREE FOR BOOKING MANAGERS — ALWAYS. NO ACCOUNT, NO SIGNUP.
          </p>
        </div>
      </section>

      {/* ── THE RISK ─────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--color-paper)',
          padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
          borderBottom: '1px solid var(--color-mist)',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.75rem',
              color: 'var(--color-tally-onlight)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            THE NIGHT YOU&apos;RE PROTECTING
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              color: 'var(--color-ink)',
              marginBottom: '2.5rem',
            }}
          >
            An empty floor remembers your name, not theirs.
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1px',
              background: 'rgba(10,13,11,0.08)',
              border: '1px solid rgba(10,13,11,0.08)',
            }}
          >
            {risks.map((r) => (
              <div
                key={r.num}
                style={{ background: 'var(--color-paper)', padding: 'clamp(1.25rem, 3vw, 2rem)' }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-space-mono), monospace',
                    fontSize: '0.75rem',
                    color: 'var(--color-tally-onlight)',
                    opacity: 0.5,
                    display: 'block',
                    marginBottom: '0.75rem',
                  }}
                >
                  {r.num}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo), system-ui, sans-serif',
                    fontSize: '1.05rem',
                    color: 'var(--color-ink)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {r.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-heebo), system-ui, sans-serif',
                    fontSize: '1rem',
                    color: 'var(--color-tally-onlight)',
                    lineHeight: 1.6,
                  }}
                >
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVIDENCE ANCHOR IMAGE ────────────────────────── */}
      {/* TODO: swap for a lockshow-atmosphere-* scene if a better booker-desk shot arrives from Codex's Drive */}
      <section
        style={{
          background: 'var(--color-paper)',
          padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw) 0',
        }}
      >
        <figure style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(10,13,11,0.08)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/lockshow-evidence-review.webp"
              alt="A booking manager reading an artist's checked evidence before saying yes"
              style={{
                display: 'block',
                width: '100%',
                maxHeight: '440px',
                objectFit: 'cover',
              }}
            />
          </div>
          <figcaption
            style={{
              fontFamily: 'var(--font-heebo), system-ui, sans-serif',
              fontSize: '1rem',
              color: 'var(--color-tally-onlight)',
              lineHeight: 1.6,
              marginTop: '0.85rem',
              maxWidth: '640px',
            }}
          >
            Every claim is checked before it reaches you. You see what held up
            — and exactly how it was verified.
          </figcaption>
        </figure>
      </section>

      {/* ── WHAT YOU SEE IN THE PASSPORT ─────────────────── */}
      <section style={{ background: 'var(--color-paper)', padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.75rem',
              color: 'var(--color-tally-onlight)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            WHAT YOU OPEN
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              color: 'var(--color-ink)',
              marginBottom: '2.5rem',
            }}
          >
            One link. The whole story, checked.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {passportFeatures.map((f, i) => (
              <div
                key={i}
                style={{
                  padding: '1.75rem 0',
                  borderBottom: '1px solid var(--color-mist)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-space-mono), monospace',
                    fontSize: '0.75rem',
                    color: 'var(--color-stamp-onlight)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '0.4rem',
                  }}
                >
                  {f.label}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo), system-ui, sans-serif',
                    fontSize: '1.05rem',
                    color: 'var(--color-ink)',
                    marginBottom: '0.4rem',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-heebo), system-ui, sans-serif',
                    fontSize: '1rem',
                    color: 'var(--color-tally-onlight)',
                    lineHeight: 1.65,
                    maxWidth: '832px',
                  }}
                >
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT LOCK DOESN'T PROMISE ────────────────── */}
      <section style={{
        background: 'var(--color-night)',
        padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
        borderTop: '1px solid #2a342d',
        borderBottom: '1px solid #2a342d',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.75rem',
              color: 'var(--color-stamp)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            IMPORTANT TO KNOW
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              color: 'var(--color-paper)',
              marginBottom: '1rem',
            }}
          >
            LOCK makes no promises. That&apos;s the point.
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-heebo), system-ui, sans-serif',
              fontSize: '1rem',
              color: 'rgba(243,245,239,0.72)',
              lineHeight: 1.7,
              marginBottom: '2rem',
            }}
          >
            LOCK will never tell you an artist will fill your floor. No score,
            no ranking, no prediction — only what happened, how it was checked,
            and when. You read it in two minutes. The decision stays yours.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {[
              'NO SCORES',
              'NO RANKINGS',
              'NO PREDICTIONS',
              'NO GUARANTEES',
              'METHOD-LABELLED EVIDENCE ONLY',
            ].map((chip) => (
              <span
                key={chip}
                style={{
                  fontFamily: 'var(--font-space-mono), monospace',
                  fontSize: '0.75rem',
                  color: 'rgba(243,245,239,0.7)',
                  border: '1px solid rgba(243,245,239,0.12)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '10px',
                  letterSpacing: '0.06em',
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ background: 'var(--color-paper)', padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              color: 'var(--color-ink)',
              marginBottom: '1rem',
            }}
          >
            The next link you get deserves two minutes.
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-heebo), system-ui, sans-serif',
              fontSize: '1rem',
              color: 'var(--color-tally-onlight)',
              marginBottom: '2rem',
              lineHeight: 1.6,
            }}
          >
            Open it. See the room before you say yes. LOCK is free for booking
            managers — always. No signup, no account, no catch.
          </p>
          <Link
            href="/passport/demo"
            style={{
              background: 'var(--color-stamp)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              padding: '0.95rem 1.75rem',
              textDecoration: 'none',
              borderRadius: '10px',
              display: 'inline-block',
            }}
          >
            SEE A SAMPLE PASSPORT →
          </Link>
        </div>
      </section>

    </main>
  )
}
