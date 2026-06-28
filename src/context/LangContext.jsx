import { createContext, useContext, useState, useEffect } from 'react'
import { T as he, BANDS as BANDS_he, PROFILE_ITEM_TYPES as TYPES_he } from '../lib/i18n/he.js'
import { T as en, BANDS as BANDS_en, PROFILE_ITEM_TYPES as TYPES_en } from '../lib/i18n/en.js'
import { setDemoLang } from '../lib/demo.js'

const dicts = { he: { T: he, BANDS: BANDS_he, TYPES: TYPES_he }, en: { T: en, BANDS: BANDS_en, TYPES: TYPES_en } }

// English is the PRIMARY/default locale (LTR). Hebrew is the secondary
// localization (RTL). `dir` + `lang` on <html> flip automatically per locale.
const LangCtx = createContext({ T: en, BANDS: BANDS_en, TYPES: TYPES_en, lang: 'en', setLang: () => {} })

function applyDir(lang) {
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('gigproof_lang')
    return saved === 'he' ? 'he' : 'en' // default → English
  })

  useEffect(() => { applyDir(lang) }, [lang])

  function setLang(l) {
    setLangState(l)
    localStorage.setItem('gigproof_lang', l)
  }

  const { T, BANDS, TYPES } = dicts[lang] || dicts.en
  setDemoLang(lang) // keep bilingual demo fixtures in the active language (no-op outside demo)

  return (
    <LangCtx.Provider value={{ T, BANDS, TYPES, lang, setLang }}>
      {children}
    </LangCtx.Provider>
  )
}

export const useLang = () => useContext(LangCtx)
