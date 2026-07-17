import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  alternates: { canonical: '/producers' },
  title: 'For Producers — 20 Seconds, No Account',
  description:
    'An artist you booked is asking one small favor: confirm what happened at one show. One tap, no account, nothing else ever asked of you.',
  openGraph: {
    url: '/producers',
    title: 'For Producers | LOCK',
    description: 'You were there that night. Twenty seconds of your word turns one good show into something an artist can build on.',
    type: 'website',
  },
}

const steps = [
  'A WhatsApp lands: “hey — got 20 seconds?”',
  'You tap the link. It opens right in your browser.',
  'One show. The date, the venue, the crowd you remember.',
  'You confirm — or correct what’s off. Your call.',
  'Back to your production. We never chase you again.',
]

const whyItMatters = [
  {
    title: 'You turn a story into a fact',
    body: 'The artist can say the room was full. When the producer who ran the night says it, someone about to risk their name on a booking can actually believe it. That is the whole difference — and it takes you one tap.',
  },
  {
    title: 'Your name, quoted exactly as given',
    body: 'Your confirmation appears as what it is — “Confirmed by the producer who ran the show,” with your name and venue. It is never inflated, never anonymous, never turned into a number.',
  },
  {
    title: 'Disagreeing is part of the deal',
    body: 'If the estimate feels generous, say so. If you honestly can’t judge the draw from where you stood, skip it. Your yes only means something because you were free to say no.',
  },
  {
    title: 'Nothing goes public without the artist',
    body: 'You confirm; the artist decides what gets shown. And if you ever change your mind, you can withdraw your confirmation — your word stays yours.',
  },
]

const ICON_PATHS: Record<string, string> = {
  link:    '<path d="M8 12h8M13 9l3 3-3 3"/><path d="M10 5H5v14h5M14 5h5v14h-5"/>',
  clip:    '<path d="M5 5h14v16H5zM8 3v4M16 3v4M5 9h14"/><path d="m9 15 2 2 4-4"/>',
  check:   '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 8"/>',
  lock:    '<path d="M6 10h12v11H6zM8.5 10V7.5a3.5 3.5 0 0 1 7 0V10"/><circle cx="12" cy="15" r="1.2"/>',
}

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] }}
    />
  )
}

export default function ProducersPage() {
  return (
    <main style={{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', fontFamily: 'var(--font-heebo)' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        style={{
                    overflow: 'hidden',
          minHeight: 'min(92svh, 880px)',
          background: `linear-gradient(180deg, rgba(10,13,11,0.55) 0%, rgba(10,13,11,0.86) 55%, rgba(10,13,11,0.97) 100%), url('/lockshow-persona-producer-v1.webp') center/cover no-repeat`,
          color: 'var(--color-paper)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3.5rem)',
        }}
      >
        <div style={{ maxWidth: '640px', position: 'relative' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              color: 'rgba(243,245,239,0.72)',
              textTransform: 'uppercase',
              marginBottom: '1.75rem',
            }}
          >
            FOR PRODUCERS
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
            You know what happened that night.
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-stamp)' }}>
              Twenty seconds to say so.
            </em>
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-heebo), system-ui, sans-serif',
              fontSize: 'clamp(1rem, 1.8vw, 1.1rem)',
              lineHeight: 1.65,
              color: 'rgba(243,245,239,0.78)',
              maxWidth: '520px',
              marginBottom: '2.25rem',
            }}
          >
            An artist you booked is asking a small favor between professionals: open one link,
            glance at one show, tap confirm — or correct it. No account, no app, nothing else
            ever asked of you.
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
              SEE WHAT YOUR WORD BUILDS →
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
        </div>
      </section>

      {/* ── THE FAVOR ────────────────────────────────────── */}
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
            THE FAVOR
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              color: 'var(--color-ink)',
              marginBottom: '2rem',
            }}
          >
            One show. One tap. Done.
          </h2>

          <div
            className="m-divide"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1px',
              background: 'rgba(10,13,11,0.08)',
              border: '1px solid rgba(10,13,11,0.08)',
              marginBottom: '3rem',
            }}
          >
            {[
              {
                icon: 'link',
                title: 'A link lands in your WhatsApp',
                body: 'From an artist you actually booked, about a night you actually ran. It opens in your browser — no account, no download, no password.',
              },
              {
                icon: 'clip',
                title: 'One show, the way you remember it',
                body: 'The date, the venue, roughly how full the room was. You were standing in it — one look is all it takes.',
              },
              {
                icon: 'check',
                title: 'Say what you saw',
                body: 'Looks right? Confirm. Numbers feel off? Correct them. Honestly can’t tell? Skip it. Every answer is a fair one.',
              },
              {
                icon: 'lock',
                title: 'And that really is it',
                body: 'No follow-ups, no ongoing role, no inbox to manage. Change your mind later? You can withdraw your confirmation any time.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="m-flat"
                style={{ background: 'var(--color-paper)', padding: 'clamp(1.25rem, 3vw, 2rem)' }}
              >
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(200,240,77,0.1)',
                  color: 'var(--color-stamp-onlight)',
                  marginBottom: '0.875rem',
                }}>
                  <Icon name={item.icon} size={18} />
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo), system-ui, sans-serif',
                    fontSize: '1rem',
                    color: 'var(--color-ink)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-heebo), system-ui, sans-serif',
                    fontSize: '1rem',
                    color: 'var(--color-tally-onlight)',
                    lineHeight: 1.6,
                  }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          {/* Entity firewall callout — CRITICAL per CLAUDE.md */}
          <div
            style={{
              border: '1px solid rgba(200,240,77,0.2)',
              background: 'rgba(200,240,77,0.04)',
              padding: 'clamp(1.25rem, 3vw, 2rem)',
              borderRadius: '16px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-space-mono), monospace',
                fontSize: '0.75rem',
                color: 'var(--color-stamp-onlight)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              PRODUCER ≠ BOOKING MANAGER
            </p>
            <p
              style={{
                fontFamily: 'var(--font-heebo), system-ui, sans-serif',
                fontSize: '1rem',
                color: 'var(--color-tally-onlight)',
                lineHeight: 1.6,
              }}
            >
              You&apos;re the <strong style={{ color: 'var(--color-ink)' }}>producer</strong> who
              ran that night and can vouch for it — the <strong style={{ color: 'var(--color-ink)' }}>booking
              manager</strong> is the one deciding on the next one, and LOCK never mixes the two.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHY YOUR WORD MATTERS ────────────────────────── */}
      <section
        style={{
          background: 'var(--color-paper)',
          padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
          borderTop: '1px solid var(--color-mist)',
          borderBottom: '1px solid var(--color-mist)',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
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
            WHY YOUR WORD MATTERS
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-archivo), system-ui, sans-serif',
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              color: 'var(--color-ink)',
              marginBottom: '1.5rem',
            }}
          >
            In this scene, your name carries weight.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {whyItMatters.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '1.5rem 0',
                  borderBottom: '1px solid var(--color-mist)',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-archivo), system-ui, sans-serif',
                    fontSize: '1rem',
                    color: 'var(--color-ink)',
                    marginBottom: '0.4rem',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-heebo), system-ui, sans-serif',
                    fontSize: '1rem',
                    color: 'var(--color-tally-onlight)',
                    lineHeight: 1.65,
                  }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TWENTY SECONDS, START TO FINISH ──────────────── */}
      <section style={{ background: 'var(--color-paper)', padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div
            style={{
              background: 'var(--color-night)',
              padding: 'clamp(1.25rem, 3vw, 2rem)',
              borderRadius: '16px',
              marginBottom: '2rem',
              textAlign: 'left',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-space-mono), monospace',
                fontSize: '0.75rem',
                color: 'var(--color-stamp)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              TWENTY SECONDS, START TO FINISH
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {steps.map((step) => (
                <p
                  key={step}
                  style={{
                    fontFamily: 'var(--font-space-mono), monospace',
                    fontSize: '0.85rem',
                    color: 'rgba(243,245,239,0.78)',
                    letterSpacing: '0.02em',
                    lineHeight: 1.5,
                  }}
                >
                  {step}
                </p>
              ))}
            </div>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-heebo), system-ui, sans-serif',
              fontSize: '1rem',
              color: 'var(--color-tally-onlight)',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            Curious where those twenty seconds end up? Your name sits right on the show
            you confirmed — nowhere else.
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
            SEE THE SAMPLE PASSPORT →
          </Link>
        </div>
      </section>

    </main>
  )
}
