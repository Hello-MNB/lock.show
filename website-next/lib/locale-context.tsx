'use client'

/**
 * LOCK SHOW locale context — client-side only.
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
  useEffect,
  useCallback,
  useSyncExternalStore,
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

// ─── localStorage as an external store ─────────────────────────────────────
// The persisted locale lives OUTSIDE React, so it is READ with
// useSyncExternalStore instead of being mirrored into state by an effect
// (react-hooks/set-state-in-effect). Server and first-hydration renders use
// getServerSnapshot, which keeps the static export's EN baseline; React
// re-renders with the stored value immediately after hydration.
//
// `sessionLocale` is the in-memory override. Without it a visitor whose
// localStorage throws (private mode, storage disabled, sandboxed iframe)
// could not switch locale at all, because getSnapshot would keep reporting
// the default. It preserves the pre-repair behaviour: the toggle works for
// the session, it just does not survive a reload.
let sessionLocale: Locale | null = null

const listeners = new Set<() => void>()

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange)
  return () => {
    listeners.delete(onStoreChange)
  }
}

function getSnapshot(): Locale {
  if (sessionLocale !== null) return sessionLocale
  try {
    return localStorage.getItem(STORAGE_KEY) === 'he' ? 'he' : DEFAULT_LOCALE
  } catch {
    // localStorage unavailable — stay with default
    return DEFAULT_LOCALE
  }
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE
}

function writeLocale(l: Locale) {
  sessionLocale = l
  try {
    localStorage.setItem(STORAGE_KEY, l)
  } catch {
    // persistence unavailable — the session override above still applies
  }
  for (const listener of listeners) listener()
}

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
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // <html lang>/<html dir> is an external system, not React state — writing to
  // it from an effect is what effects are FOR. This runs on the hydration pass
  // too, which is what used to be done inline in the mount effect.
  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = isRTL(locale) ? 'rtl' : 'ltr'
  }, [locale])

  const setLocale = useCallback((l: Locale) => {
    writeLocale(l)
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
