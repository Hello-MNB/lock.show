'use client'

/**
 * LOCK locale context — client-side only.
 *
 * Static export (`output: 'export'`) means no server-side locale detection.
 * Strategy:
 *   - Server HTML always renders EN (SEO baseline).
 *   - Locale toggle is client-side; persisted to localStorage.
 *   - HE strings are scaffold — not shipped until native-editor pass.
 *
 * Usage:
 *   const { locale, messages, setLocale, dir } = useLocale()
 *   messages.nav.artists  // string in current locale
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Locale, Messages } from './i18n'
import { isRTL, DEFAULT_LOCALE } from './i18n'
import enMessages from '../messages/en.json'
import heMessages from '../messages/he.json'

// Pre-load both locales at build time (static export — no dynamic fetch)
const MESSAGE_MAP: Record<Locale, Messages> = {
  en: enMessages as Messages,
  he: heMessages as Messages,
}

const STORAGE_KEY = 'gp_locale'

// ─── Context ───────────────────────────────────────────────────────────────

interface LocaleContextValue {
  locale: Locale
  messages: Messages
  dir: 'ltr' | 'rtl'
  setLocale: (l: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  messages: MESSAGE_MAP[DEFAULT_LOCALE],
  dir: 'ltr',
  setLocale: () => {},
})

// ─── Provider ──────────────────────────────────────────────────────────────

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  // Hydrate from localStorage on mount (no SSR mismatch — default is always 'en')
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'he') {
        setLocaleState('he')
        document.documentElement.lang = 'he'
        document.documentElement.dir = 'rtl'
      }
    } catch {
      // localStorage unavailable — stay with default
    }
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {}
    document.documentElement.lang = l
    document.documentElement.dir = isRTL(l) ? 'rtl' : 'ltr'
  }, [])

  const value: LocaleContextValue = {
    locale,
    messages: MESSAGE_MAP[locale],
    dir: isRTL(locale) ? 'rtl' : 'ltr',
    setLocale,
  }

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext)
}
