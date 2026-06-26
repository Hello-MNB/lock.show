import { createContext, useContext, useState, useEffect } from 'react'
import { T as he, BANDS as BANDS_he, PROFILE_ITEM_TYPES as TYPES_he } from '../lib/i18n/he.js'
import { T as en, BANDS as BANDS_en, PROFILE_ITEM_TYPES as TYPES_en } from '../lib/i18n/en.js'

const dicts = { he: { T: he, BANDS: BANDS_he, TYPES: TYPES_he }, en: { T: en, BANDS: BANDS_en, TYPES: TYPES_en } }

const LangCtx = createContext({ T: he, BANDS: BANDS_he, TYPES: TYPES_he, lang: 'he', setLang: () => {} })

function applyDir(lang) {
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl'
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('gigproof_lang')
    return saved === 'en' ? 'en' : 'he'
  })

  useEffect(() => { applyDir(lang) }, [lang])

  function setLang(l) {
    setLangState(l)
    localStorage.setItem('gigproof_lang', l)
  }

  const { T, BANDS, TYPES } = dicts[lang] || dicts.he

  return (
    <LangCtx.Provider value={{ T, BANDS, TYPES, lang, setLang }}>
      {children}
    </LangCtx.Provider>
  )
}

export const useLang = () => useContext(LangCtx)
export const useT = () => useContext(LangCtx).T
