import type { Metadata } from 'next'
import { localeAlternates, OG_DEFAULT_IMAGE, OG_DEFAULT_ALT } from '@/lib/site'
import Link from 'next/link'

import { APP_URL } from '@/lib/app-url'
import { conversionHref } from '@/lib/conversion'
import { Hero } from '@/components/hero'

export const metadata: Metadata = {
  alternates: localeAlternates('/'),
  title: 'LOCK — Build the Proof That Books You',
  description:
    'Turn the nights you played into a Passport a booking manager can trust — every claim checked, dated, and signed by the night it happened.',
  openGraph: {
    title: 'LOCK — Build the Proof That Books You',
    description:
      'The rooms you filled become a Passport a booking manager can trust before the first call. Every claim shows how it was checked and when.',
    type: 'website',
    // Relative — resolved against metadataBase (lib/site.ts www origin), same
    // convention as every other page. The old absolute apex URL here was the
    // one mixed og:url on the site.
    url: '/',
    // Re-stated deliberately: declaring a page-level openGraph block REPLACES the
    // the layout images rather than merging with them, so omitting this ships a page
    // with no og:image.
    images: [
      {
        url: OG_DEFAULT_IMAGE,
        width: 1200,
        height: 630,
        alt: OG_DEFAULT_ALT,
        type: 'image/png',
      },
    ],
  },
}

// NO page-level JSON-LD here. The homepage's FAQPage block was REMOVED
// (T-96 step ③ / C5, owner-ruled): its questions had no visible Q&A
// counterpart in the page body — invisible FAQ markup violates Google's
// structured-data policy and is a manual-action risk. The visible-content
// FAQPage blocks on /faq and /pricing remain. Do not re-add a FAQPage here
// unless the homepage actually renders those questions as visible text
// (scripts/test-seo-contract.mjs enforces this — C5 flag is now true).

// ─── Inline icon helper ────────────────────────────────────────────────────
// Paths sourced from gigproof-icons.svg (Codex design system)
const ICON_PATHS: Record<string, string> = {
  artist:   '<circle cx="12" cy="8" r="3"/><path d="M5.5 20c.7-4 2.8-6 6.5-6s5.8 2 6.5 6"/><path d="M19 4v7M16.5 6.5 19 4l2.5 2.5"/>',
  manager:  '<circle cx="8" cy="8" r="2.5"/><circle cx="17" cy="9" r="2"/><path d="M3.5 19c.5-3.4 2-5.2 4.5-5.2s4 1.8 4.5 5.2M13.5 18c.4-2.7 1.6-4.1 3.5-4.1s3.1 1.4 3.5 4.1"/><path d="M12 5.5 14.5 3 17 5.5"/>',
  producer: '<path d="M4 5h16v11H4zM8 20h8M12 16v4"/><path d="m8 12 3-3 2.5 2 3-3"/>',
  approved: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 8"/>',
  arrow:    '<path d="M4 12h15M14 7l5 5-5 5"/>',
  lock:     '<path d="M6 10h12v11H6zM8.5 10V7.5a3.5 3.5 0 0 1 7 0V10"/><circle cx="12" cy="15" r="1.2"/>',
  passport: '<path d="M5 3h14v18H5z"/><circle cx="12" cy="10" r="3"/><path d="M8 17c.7-2 2-3 4-3s3.3 1 4 3"/>',
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

// ─── Shared sub-components ─────────────────────────────────────────────────

function RoleTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-space-mono)',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: 'var(--color-ink)',
        background: 'rgba(200,240,77,0.14)',
        border: '1px solid rgba(200,240,77,0.4)',
        borderRadius: '10px',
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
        fontSize: '0.75rem',
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

// ─── Page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <main>
        {/* ── HERO — feature variant (T-97 hero system: styles/hero.css) ── */}
        <Hero
          variant="feature"
          align="center"
          style={{
            background: `
              linear-gradient(100deg,
                rgba(10,13,11,0.95) 0%,
                rgba(10,13,11,0.82) 30%,
                rgba(10,13,11,0.4)  62%,
                rgba(10,13,11,0.62) 100%
              ),
              url('/lockshow-hero-live.webp') center 35%/cover no-repeat
            `,
            color: 'var(--color-paper)',
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
              right: '-140px',
              bottom: '-220px',
              background: 'rgba(200,240,77,0.12)',
              filter: 'blur(75px)',
              pointerEvents: 'none',
            }}
          />
          {/* Secondary top-left glow */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              left: '-80px',
              top: '-60px',
              background: 'rgba(200,240,77,0.05)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
            }}
          />

          {/* Hero grid */}
          <div
            className="hero-grid"
            style={{
              maxWidth: '1100px',
              margin: '0 auto',
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.1fr) minmax(min(300px, 100%), 0.7fr)',
              gap: 'clamp(2rem, 6vw, 5rem)',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {/* ── LEFT: hero copy ── */}
            <div>
              {/* Pulsing badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: 'var(--hero-gap-eyebrow)',
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
                  Closed Beta · Tel Aviv
                </span>
              </div>

              {/* Headline */}
              <h1
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: 'clamp(2.4rem, 5.5vw, 4.25rem)',
                  fontWeight: 400,
                  lineHeight: 0.96,
                  letterSpacing: '-0.055em',
                  color: 'var(--color-paper)',
                  marginBottom: 'var(--hero-gap-h1)',
                }}
              >
                Build the proof
                <br />
                <em
                  style={{
                    fontStyle: 'italic',
                    color: 'var(--color-stamp)',
                  }}
                >
                  that books you.
                </em>
              </h1>

              {/* Sub */}
              <p
                style={{
                  fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                  lineHeight: 1.7,
                  color: 'rgba(243,245,239,0.68)',
                  maxWidth: 'var(--hero-desc-max-w)',
                  marginBottom: 'var(--hero-gap-desc)',
                }}
              >
                The rooms you filled, the nights that sold out — LOCK turns them
                into a Passport a booking manager can trust before the first call.
              </p>

              {/* CTAs */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  marginBottom: '2rem',
                }}
              >
                <a
                  href={`${conversionHref({ page: 'home', placement: 'hero' })}`}
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
                    padding: '0.95rem 1.75rem',
                    borderRadius: '10px',
                    textDecoration: 'none',
                  }}
                >
                  BUILD YOUR PASSPORT
                  <Icon id="arrow" size={16} color="var(--color-ink)" />
                </a>
                <Link
                  href="/passport/demo"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'transparent',
                    color: 'var(--color-paper)',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    padding: '0.95rem 1.75rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(243,245,239,0.25)',
                    textDecoration: 'none',
                  }}
                >
                  SEE A SAMPLE
                </Link>
              </div>

              {/* Confidence row */}
              <div
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { icon: 'approved', text: 'Real nights, checked' },
                  { icon: 'lock',     text: 'You control what’s public' },
                  { icon: 'approved', text: 'Free for artists in the pilot' },
                ].map(({ icon, text }) => (
                  <div
                    key={text}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Icon id={icon} size={15} color="rgba(200,240,77,0.7)" />
                    <span
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.75rem',
                        letterSpacing: '0.04em',
                        color: 'rgba(243,245,239,0.6)',
                      }}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Bookability Passport preview card ── */}
            <div
              className="hero-passport-card"
              style={{
                background: 'rgba(10,13,11,0.62)',
                border: '1px solid rgba(243,245,239,0.14)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 24px 60px -20px rgba(0,0,0,0.75)',
              }}
            >
              {/* Passport header */}
              <div
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.58rem',
                  letterSpacing: '0.14em',
                  color: 'var(--color-stamp)',
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                }}
              >
                LOCK · BOOKABILITY PASSPORT
              </div>

              {/* Artist identity */}
              <div
                style={{
                  fontFamily: 'var(--font-archivo)',
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  color: 'var(--color-paper)',
                  marginBottom: '0.2rem',
                }}
              >
                Maya Vale
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(243,245,239,0.55)',
                  marginBottom: '1.25rem',
                  textTransform: 'uppercase',
                }}
              >
                Underground Techno · Tel Aviv
              </div>

              {/* Audience draw */}
              <div
                style={{
                  borderTop: '1px solid rgba(243,245,239,0.08)',
                  paddingTop: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.55rem',
                    letterSpacing: '0.12em',
                    color: 'rgba(243,245,239,0.55)',
                    marginBottom: '0.4rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Audience Draw
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    color: 'var(--color-paper)',
                    marginBottom: '0.5rem',
                  }}
                >
                  <bdi dir="ltr">200–350</bdi>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <MethodBadge label="TICKET EXPORT" />
                  <span
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.58rem',
                      color: 'rgba(243,245,239,0.28)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    REVIEWED JAN 2026
                  </span>
                </div>
              </div>

              {/* Gig claim */}
              <div
                style={{
                  borderTop: '1px solid rgba(243,245,239,0.08)',
                  paddingTop: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.55rem',
                    letterSpacing: '0.12em',
                    color: 'rgba(243,245,239,0.55)',
                    marginBottom: '0.4rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Gig History
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--color-paper)',
                    marginBottom: '0.2rem',
                  }}
                >
                  Club Vela, Tel Aviv — headline
                </div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'rgba(243,245,239,0.4)',
                    marginBottom: '0.5rem',
                  }}
                >
                  May 2025 · sold out
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <MethodBadge label="PRODUCER-CONFIRMED" />
                  <span
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.58rem',
                      color: 'rgba(243,245,239,0.28)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    REVIEWED MAY 2025
                  </span>
                </div>
              </div>

              {/* Card footer */}
              <div
                style={{
                  borderTop: '1px solid rgba(243,245,239,0.06)',
                  paddingTop: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-heebo)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.02em',
                    color: 'rgba(243,245,239,0.55)',
                  }}
                >
                  Sample — a fictional artist
                </span>
                <Link
                  href="/passport/demo"
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.08em',
                    color: 'var(--color-stamp)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  VIEW FULL
                  <Icon id="arrow" size={12} color="var(--color-stamp)" />
                </Link>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes gp-pulse {
              0%, 100% { opacity: 1; box-shadow: 0 0 8px #c8f04d; }
              50%       { opacity: 0.55; box-shadow: 0 0 20px #c8f04d; }
            }
            .pulse-dot { animation: gp-pulse 2.4s ease-in-out infinite; }

            @media (max-width: 720px) {
              .hero-grid { grid-template-columns: 1fr !important; }
              .hero-passport-card { display: none !important; }
            }
          `}</style>
        </Hero>

        {/* ── FIREWALL BANNER ──────────────────────────────────────────── */}
        {/* container-contrast law: white strip between dark hero and paper
            actors band — no two adjacent containers share a tone */}
        <section
          style={{
            background: '#ffffff',
            borderBottom: '1px solid rgba(10,13,11,0.1)',
            padding: '0.85rem max(24px, 4vw)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: 'var(--color-tally-onlight)',
            }}
          >
            WHAT HAPPENED, WHO CHECKED IT, WHEN — NOTHING ELSE.
          </p>
        </section>

        {/* ── THREE ACTORS ─────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--color-paper)',
            padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--color-tally-onlight)',
                marginBottom: '0.5rem',
                textAlign: 'center',
                textTransform: 'uppercase',
              }}
            >
              Who It’s For
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
              Three people make a night happen
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--color-tally-onlight)',
                textAlign: 'center',
                marginBottom: '3rem',
                maxWidth: '560px',
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: 1.6,
              }}
            >
              The artist on stage, the booking manager on the line, the producer
              who ran the room — LOCK gives each of you your own door in.
            </p>

            <div
              className="m-divide"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
                gap: 'clamp(1rem, 2vw, 1.5rem)',
              }}
            >
              {[
                {
                  image: '/lockshow-persona-artist-v1.webp',
                  tag: 'ARTIST',
                  title: 'Your nights already tell the story',
                  body: 'Turn the gigs you played into a Passport that opens the next room. Free during the pilot.',
                  href: '/artists',
                  cta: 'FOR ARTISTS',
                },
                {
                  image: '/lockshow-persona-manager-v1.webp',
                  tag: 'BOOKING MANAGER',
                  title: 'Say yes with a clear head',
                  body: 'Read an artist’s real history in two minutes — before your name goes on the line. Always free.',
                  href: '/bookers',
                  cta: 'FOR BOOKING MANAGERS',
                },
                {
                  image: '/lockshow-persona-producer-v1.webp',
                  tag: 'PRODUCER',
                  title: 'You were there. Say so.',
                  body: 'One tap confirms a night you ran — twenty seconds, no account, and an artist you believe in gets further.',
                  href: '/producers',
                  cta: 'FOR PRODUCERS',
                },
              ].map(({ image, tag, title, body, href, cta }) => (
                <div
                  key={href}
                  className="m-flat"
                  style={{
                    background: 'var(--color-paper)',
                    border: '1px solid rgba(10,13,11,0.1)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Persona thumb */}
                  <div
                    aria-hidden="true"
                    style={{
                      height: '150px',
                      background: `linear-gradient(180deg, rgba(10,13,11,0) 55%, rgba(10,13,11,0.35) 100%), url('${image}') center 30%/cover no-repeat`,
                    }}
                  />
                  <div className="m-flat" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div>
                      <RoleTag>{tag}</RoleTag>
                    </div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-archivo)',
                        fontSize: '1.2rem',
                        fontWeight: 900,
                        color: 'var(--color-ink)',
                        marginBottom: '0.75rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {title}
                    </h3>
                    <p style={{ fontSize: '1rem', color: 'var(--color-tally-onlight)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                      {body}
                    </p>
                    <Link
                      href={href}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        color: 'var(--color-ink)',
                        textDecoration: 'none',
                        minHeight: '44px',
                        padding: '0.75rem 0',
                        marginBottom: '-0.75rem',
                        marginTop: 'auto',
                      }}
                    >
                      {cta}
                      <Icon id="arrow" size={14} color="var(--color-ink)" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROOF UNIT DEMO ──────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--color-night)',
            padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
            borderTop: '1px solid #2a342d',
            borderBottom: '1px solid #2a342d',
          }}
        >
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
                gap: 'clamp(1.5rem, 4vw, 3rem)',
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
                    textTransform: 'uppercase',
                  }}
                >
                  What A Claim Looks Like
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
                  Every claim shows how it was checked
                </h2>
                <p
                  style={{
                    fontSize: '1rem',
                    color: 'rgba(243,245,239,0.65)',
                    lineHeight: 1.7,
                    marginBottom: '1.5rem',
                  }}
                >
                  Every claim says who checked it — right there on the card.
                </p>
                <Link
                  href="/methodology"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--color-paper)',
                    textDecoration: 'none',
                    minHeight: '44px',
                    padding: '0.75rem 0',
                  }}
                >
                  READ THE METHODOLOGY
                  <Icon id="arrow" size={14} color="var(--color-paper)" />
                </Link>
              </div>

              {/* Right: live proof units */}
              <div
                style={{
                  background: 'rgba(243,245,239,0.04)',
                  border: '1px solid rgba(243,245,239,0.1)',
                  borderRadius: '16px',
                  padding: 'clamp(1.25rem, 3vw, 2rem)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    color: 'rgba(243,245,239,0.55)',
                    marginBottom: '1.5rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Sample Claims — Fictional Artist &amp; Venues
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
                    <bdi dir="ltr">200–350</bdi>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(243,245,239,0.5)', marginBottom: '0.5rem' }}>
                    Headline audience draw, Club Vela, Tel Aviv, Feb 2025
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <MethodBadge label="TICKET EXPORT" />
                    <span
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.75rem',
                        color: 'rgba(243,245,239,0.55)',
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
                        fontSize: '0.75rem',
                        color: 'rgba(243,245,239,0.55)',
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
                    <bdi dir="ltr">70–120</bdi>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(243,245,239,0.5)', marginBottom: '0.5rem' }}>
                    Capacity, The Attic Stage, support slot, Dec 2024
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <MethodBadge label="PRODUCER-CONFIRMED" />
                    <span
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.75rem',
                        color: 'rgba(243,245,239,0.55)',
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
        {/* TODO(assets): when lockshow-atmosphere-* scenes land from Codex's
            Drive, add one as a full-width atmosphere band above this section. */}
        <section
          style={{
            background: 'var(--color-paper)',
            padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
          }}
        >
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <p
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--color-tally-onlight)',
                marginBottom: '0.5rem',
                textAlign: 'center',
                textTransform: 'uppercase',
              }}
            >
              How It Works
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
              Add. Confirm. Check. Share.
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                {
                  step: '01',
                  title: 'Add your nights',
                  body: 'Gigs, crowds, rooms. Everything stays private until you say otherwise.',
                },
                {
                  step: '02',
                  title: 'Get them confirmed',
                  body: 'A producer who was there taps one link. Twenty seconds, no account.',
                },
                {
                  step: '03',
                  title: 'We check everything',
                  body: 'Nothing reaches your Passport until it has actually been checked.',
                },
                {
                  step: '04',
                  title: 'Share your Passport',
                  body: 'One link that speaks for you before the first phone call.',
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
                        color: 'var(--color-ink)',
                        background: 'rgba(10,13,11,0.06)',
                        border: '1px solid rgba(10,13,11,0.1)',
                        borderRadius: '10px',
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
                          background: 'rgba(10,13,11,0.1)',
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
                        fontSize: '1rem',
                        color: 'var(--color-tally-onlight)',
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--color-ink)',
                  textDecoration: 'none',
                  minHeight: '44px',
                  padding: '0.75rem 0',
                }}
              >
                SEE THE FULL WALKTHROUGH
                <Icon id="arrow" size={14} color="var(--color-ink)" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── TRUST STATEMENT ──────────────────────────────────────────── */}
        {/* T-97.1 dark-adjacency law: night here, ink on the final CTA below —
            the dark tail of the page rotates night → ink → night(footer) so
            no two adjacent dark containers share a tone */}
        <section
          style={{
            background: 'var(--color-night)',
            padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
            textAlign: 'center',
            borderTop: '1px solid rgba(243,245,239,0.1)',
            borderBottom: '1px solid rgba(243,245,239,0.1)',
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
                textTransform: 'uppercase',
              }}
            >
              The Design Principle
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
              No algorithm scores artists here. No number whispers yes or no.
              We show what happened and how it was checked — the decision stays yours.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/passport/demo"
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  background: 'var(--color-stamp)',
                  color: 'var(--color-ink)',
                  borderRadius: '10px',
                  padding: '0.95rem 1.75rem',
                  textDecoration: 'none',
                }}
              >
                SEE A SAMPLE PASSPORT
              </Link>
              <Link
                href="/methodology"
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--color-paper)',
                  border: '1px solid var(--ghost-border-on-dark)',
                  borderRadius: '10px',
                  padding: '0.95rem 1.75rem',
                  textDecoration: 'none',
                }}
              >
                READ THE METHODOLOGY
              </Link>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
        {/* container-contrast law (dark side, T-97.1): ink after the night
            trust band and before the night footer — adjacent dark containers
            must not share the same tone */}
        <section
          style={{
            background: 'var(--color-ink)',
            padding: 'clamp(3rem, 8vw, 6rem) max(24px, 4vw)',
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
                color: 'var(--color-paper)',
                marginBottom: '1rem',
                lineHeight: 1.15,
              }}
            >
              The next room is waiting.
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'rgba(243,245,239,0.6)',
                marginBottom: '2rem',
                lineHeight: 1.65,
              }}
            >
              Closed beta — Israeli artists only, free while we build this together.
            </p>
            <a
              href={`${conversionHref({ page: 'home', placement: 'final' })}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-stamp)',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '1rem 2.5rem',
                borderRadius: '10px',
                textDecoration: 'none',
              }}
            >
              REQUEST ACCESS
              <Icon id="arrow" size={16} color="var(--color-ink)" />
            </a>
          </div>
        </section>
      </main>
    </>
  )
}
