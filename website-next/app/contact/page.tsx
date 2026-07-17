// Contact ג€” rebuilt per Codex exact rebuild brief ֲ§5.11 (2026-07-14).
// Hero "Want to see if LOCK fits your role?" ג€” role selector BEFORE the
// message (contact-lane.tsx), then the EXISTING form mechanics unchanged
// (components/waitlist-form.tsx ג†’ Supabase waitlist_signup; ?src attribution
// handled inside the form). Direct channels (WhatsApp / social) preserved.
// ALL copy lives in content/contact.ts ({ en, he }); renders EN for now.


import { APP_URL } from '@/lib/app-url'
import { SOCIAL, WHATSAPP_URL, WHATSAPP_DISPLAY } from '@/lib/social'
import { FinalCta } from '@/components/marketing/final-cta'
import { contactContent } from '@/content/contact'
import { buildPageMetadata } from '@/lib/seo'

import ContactLane from './contact-lane'

const t = contactContent.en

const SITE_URL = 'https://lock.show'

export const metadata = buildPageMetadata('contact')

export default function ContactPage() {
  return (
    <main>
      {/* ג”€ג”€ HERO ג€” calm text header; the page's lime moment is the form's
             submit button, so no lime CTA up here ג”€ג”€ */}
      <section
        className="mk-hero"
        style={{
          background:
            'radial-gradient(720px 480px at 85% 0%, rgba(200,240,77,0.07), transparent 60%), linear-gradient(160deg, var(--color-ink) 0%, var(--color-forest) 100%)',
          color: 'var(--color-paper)',
          paddingBottom: '64px',
        }}
      >
        <div className="mk-container--narrow" style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-stamp)',
              margin: '0 0 1.25rem',
            }}
          >
            {t.hero.eyebrow}
          </p>
          <h1
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 400,
              fontSize: 'clamp(2.1rem, 4.4vw, 3.3rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              color: 'var(--color-paper)',
              margin: '0 0 1.4rem',
            }}
          >
            {t.hero.h1}
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.1rem)',
              lineHeight: 1.7,
              color: 'rgba(243,245,239,0.7)',
              maxWidth: '560px',
              margin: '0 auto',
            }}
          >
            {t.hero.body}
          </p>
        </div>
      </section>

      {/* ג”€ג”€ FORM + INFO GRID ג”€ג”€ */}
      <section className="mk-section" style={{ background: 'var(--color-paper)', color: 'var(--color-ink)' }}>
        <div className="mk-container">
          <div
            className="contact-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
              gap: '48px',
              alignItems: 'start',
            }}
          >
            {/* FORM COLUMN ג€” role first, then the message */}
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.12em',
                  color: 'var(--color-tally-onlight)',
                  textTransform: 'uppercase',
                  marginBottom: '24px',
                }}
              >
                {t.form.heading}
              </p>
              <ContactLane />
            </div>

            {/* INFO COLUMN ג€” details + direct channels (mechanics preserved) */}
            <div className="m-flat" style={{ padding: '28px 24px', border: '1px solid rgba(10,13,11,0.08)', borderRadius: 'var(--radius-sm)' }}>
              <p
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.12em',
                  color: 'var(--color-tally-onlight)',
                  textTransform: 'uppercase',
                  marginBottom: '20px',
                }}
              >
                {t.detailsHeading}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {t.details.map((d) => (
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
                    <span
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.75rem',
                        letterSpacing: '0.08em',
                        color: 'var(--color-tally-onlight)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {d.label}
                    </span>
                    <span style={{ fontSize: '1rem', color: 'var(--color-ink)' }}>{d.value}</span>
                  </div>
                ))}
              </div>

              {/* Direct channels */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(10,13,11,0.08)' }}>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
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
                    WHATSAPP
                  </span>
                  <span dir="ltr" style={{ fontSize: '1rem', fontWeight: 700 }}>
                    {WHATSAPP_DISPLAY}
                  </span>
                </a>
                <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                  {SOCIAL.map(({ key, label, href }) => (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.75rem',
                        letterSpacing: '0.06em',
                        color: 'var(--color-tally-onlight)',
                        textDecoration: 'none',
                      }}
                    >
                      {label}
                    </a>
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
        </div>
      </section>

      {/* ג”€ג”€ FINAL CTA ג”€ג”€ */}
      <FinalCta
        title={t.finalCta.title}
        body={t.finalCta.body}
        primaryCta={{ label: t.finalCta.ctaLabel, href: `${APP_URL}/signup` }}
        secondaryLink={{ label: 'How it works', href: '/how-it-works' }}
      />
    </main>
  )
}
