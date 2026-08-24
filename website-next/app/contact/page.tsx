import type { Metadata } from 'next'
import { CheckCircle2, Clock3, Facebook, Instagram, Languages, Linkedin, Mail, MapPin } from 'lucide-react'
import WaitlistForm from '../../components/waitlist-form'
import { APP_URL } from '@/lib/app-url'
import { EMAILS, SOCIAL } from '@/lib/social'

export const metadata: Metadata = {
  alternates: { canonical: '/contact' },
  title: 'Contact — Get in Touch',
  description: 'Contact LOCK SHOW about RADAR, PASSPORT, pilot access, partnerships, or product feedback.',
}

const lookingFor = [
  'Artists ready to build a private RADAR from their own sources',
  'Professional teams who need a clear, permissioned PASSPORT',
  'Partners who can improve source quality and data continuity',
  'Direct product feedback — what is clear and what still needs work',
]

const contactDetails = [
  { label: 'Location', value: 'Tel Aviv, Israel', icon: MapPin },
  { label: 'Stage', value: 'Pilot 2026', icon: Clock3 },
  { label: 'Languages', value: 'Hebrew · English', icon: Languages },
]

const SOCIAL_ICONS = { instagram: Instagram, facebook: Facebook, linkedin: Linkedin }

export default function Contact() {
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
            CONTACT · LOCK SHOW
          </p>
          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            margin: '0 0 20px',
          }}>
            Let&apos;s make the next signal useful.
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-tally-onlight)', maxWidth: '500px', lineHeight: 1.6, margin: 0 }}>
            Tell us where you are in the journey: building your RADAR, preparing a PASSPORT, or reviewing a shared one.
          </p>
          </div>
        </div>
      </section>

      {/* CONTACT GRID */}
      <section style={{ padding: '64px 24px 80px' }}>
        <div
          className="contact-grid"
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: '48px',
            alignItems: 'start',
          }}
        >

          {/* FORM COLUMN */}
          <div>
            <p style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              color: 'var(--color-tally-onlight)',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}>
              SEND A MESSAGE
            </p>

            {/* First-party waitlist capture — writes to waitlist_signup
                (migration 026; write-only for the public, operator-only read).
                No Formspree, no third parties — matching the promise below. */}
            <WaitlistForm />
          </div>

          {/* INFO COLUMN */}
          <div className="m-divide" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Contact details */}
            <div className="m-flat" style={{
              padding: '28px 24px',
              border: '1px solid rgba(10,13,11,0.08)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <p style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--color-tally-onlight)',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}>
                CONTACT INFO
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {contactDetails.map((d) => {
                  const Icon = d.icon
                  return (
                  <div
                    key={d.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: '12px',
                      borderBottom: '1px solid rgba(10,13,11,0.06)',
                    }}
                  >
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      color: 'var(--color-tally-onlight)',
                      textTransform: 'uppercase',
                    }}>
                      <Icon size={16} aria-hidden="true" /> {d.label}
                    </span>
                    <span style={{ fontSize: '1rem', color: 'var(--color-ink)' }}>
                      {d.value}
                    </span>
                  </div>
                  )
                })}
              </div>

              {/* Direct channels */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(10,13,11,0.08)' }}>
                <a
                  href={`mailto:${EMAILS.hello}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: 'var(--color-night)',
                    color: 'var(--color-paper)',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    marginBottom: '14px',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Mail size={17} aria-hidden="true" /> EMAIL</span>
                  </span>
                  <span dir="ltr" style={{ fontSize: '0.92rem', fontWeight: 700 }}>{EMAILS.hello}</span>
                </a>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {SOCIAL.map(({ key, label, href }) => {
                    const Icon = SOCIAL_ICONS[key]
                    return (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        padding: '10px 12px',
                        border: '1px solid rgba(10,13,11,0.12)',
                        borderRadius: '10px',
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.75rem',
                        letterSpacing: '0.06em',
                        color: 'var(--color-tally-onlight)',
                        textDecoration: 'none',
                      }}
                    >
                      <Icon size={16} aria-hidden="true" />
                      {label}
                    </a>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* What we're looking for */}
            <div className="m-flat" style={{
              padding: '28px 24px',
              border: '1px solid rgba(200,240,77,0.2)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(200,240,77,0.03)',
            }}>
              <p style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--color-stamp-onlight)',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}>
                WHAT WE&apos;RE LOOKING FOR
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lookingFor.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <CheckCircle2 size={17} color="var(--color-stamp-onlight)" aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '1rem', color: 'var(--color-tally-onlight)', margin: 0, lineHeight: 1.5 }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .contact-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* CTA BAND */}
      <section style={{
        backgroundColor: 'var(--color-night)',
        color: 'var(--color-paper)',
        padding: '56px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}>
            Ready to start with your own data?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '28px', fontSize: '1rem', lineHeight: 1.6 }}>
            Open a private RADAR. Nothing becomes public until you approve a PASSPORT.
          </p>
          <a
            href={`${APP_URL}/signup?utm_source=site&utm_campaign=contact`}
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: 'transparent',
              color: 'var(--color-paper)',
              border: '1px solid rgba(243,245,239,0.35)',
              fontFamily: 'var(--font-space-mono)',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textDecoration: 'none',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            START YOUR RADAR →
          </a>
        </div>
      </section>

    </main>
  )
}
