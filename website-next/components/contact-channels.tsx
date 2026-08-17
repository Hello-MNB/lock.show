'use client'

/**
 * CONTACT CHANNELS — WhatsApp + email + social, icon-first.
 *
 * THE PHONE NUMBER IS NEVER RENDERED AS TEXT. It previously appeared as
 * "+972 54-455-5060" in the page body, which is trivially harvested by the
 * scrapers that feed spam and voice-phishing lists. The number still reaches
 * WhatsApp — it lives in the wa.me href, which is a link target rather than
 * readable page text — so a human loses nothing and a text scraper gets nothing.
 * The E.164 form is also kept out of JSON-LD for the same reason.
 */
import { useState } from 'react'
import { useLocale } from '../lib/locale-context'
import { t } from '../content/copy-matrix'
import { SOCIAL, WHATSAPP_URL, EMAILS } from '../lib/social'
import { GLYPH } from './channel-icons'

function Channel({ href, label, aria, glyph, primary = false }:
  { href: string; label: string; aria: string; glyph: keyof typeof GLYPH; primary?: boolean }) {
  const [hover, setHover] = useState(false)
  const Icon = GLYPH[glyph]
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer" aria-label={aria}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)} onBlur={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        minHeight: 48, padding: '12px 16px', borderRadius: 'var(--radius-sm)',
        textDecoration: 'none', boxSizing: 'border-box',
        backgroundColor: primary ? (hover ? 'var(--color-stamp)' : 'var(--color-night)') : (hover ? 'rgba(10,13,11,0.05)' : 'transparent'),
        color: primary ? (hover ? 'var(--color-ink)' : 'var(--color-paper)') : 'var(--color-ink)',
        border: primary ? 'none' : '1px solid rgba(10,13,11,0.12)',
        // Hover/focus are the SAME state, so keyboard users get the identical
        // affordance a mouse user gets.
        transition: 'background-color 140ms ease, color 140ms ease, transform 140ms ease',
        transform: hover ? 'translateY(-1px)' : 'none',
      }}
    >
      <Icon size={22} />
      <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.78rem', letterSpacing: '0.06em', fontWeight: 700 }}>
        {label}
      </span>
    </a>
  )
}

export function ContactChannels() {
  const { locale, dir } = useLocale()
  const PLATFORM: Record<string, string> = { instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn' }
  return (
    <section dir={dir} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-tally-onlight)', margin: 0 }}>
        {t('contact.channels.block.h2', locale)}
      </h2>

      <Channel primary glyph="whatsapp" href={WHATSAPP_URL}
               label={t('contact.channels.whatsapp.cta', locale)}
               aria={t('contact.channels.whatsapp.aria', locale)} />

      <Channel glyph="email" href={`mailto:${EMAILS.hello}`}
               label={t('contact.channels.email.cta', locale)}
               aria={t('contact.channels.email.cta', locale)} />

      <h3 style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-tally-onlight)', margin: '10px 0 0' }}>
        {t('contact.channels.social.h3', locale)}
      </h3>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {SOCIAL.map(({ key, label, href }) => (
          <Channel key={key} glyph={key as keyof typeof GLYPH} href={href} label={label}
                   aria={t('contact.channels.social.aria', locale, { platform: PLATFORM[key] ?? label })} />
        ))}
      </div>
    </section>
  )
}
