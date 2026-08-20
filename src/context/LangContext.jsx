import { createContext, useContext, useState, useEffect } from 'react'
import { T as he, BANDS as BANDS_he, PROFILE_ITEM_TYPES as TYPES_he } from '../lib/i18n/he.js'
import { T as en, BANDS as BANDS_en, PROFILE_ITEM_TYPES as TYPES_en } from '../lib/i18n/en.js'
import { setDemoLang } from '../lib/demo.js'

// Build-in-English rule: new strings land in en.js only; he.js is a separate
// native-authored pass AFTER features are approved. Until that pass, Hebrew
// falls back to English per-key (deep merge) — a missing HE section must show
// English, never crash the screen.
function withEnFallback(heDict, enDict) {
  const out = { ...enDict, ...heDict }
  for (const k of Object.keys(enDict)) {
    if (
      heDict[k] && enDict[k] &&
      typeof heDict[k] === 'object' && typeof enDict[k] === 'object' &&
      !Array.isArray(heDict[k]) && !Array.isArray(enDict[k])
    ) {
      out[k] = withEnFallback(heDict[k], enDict[k])
    }
  }
  return out
}

const dicts = {
  he: { T: withEnFallback(he, en), BANDS: BANDS_he, TYPES: TYPES_he },
  en: { T: en, BANDS: BANDS_en, TYPES: TYPES_en },
}

// Israel is the first launch market, so a new session defaults to Hebrew/RTL.
// An explicit saved English choice remains durable across visits.
const LangCtx = createContext({ T: withEnFallback(he, en), BANDS: BANDS_he, TYPES: TYPES_he, lang: 'he', setLang: () => {} })

function applyDir(lang) {
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('gigproof_lang')
    return saved === 'en' ? 'en' : 'he' // first-launch default → Hebrew
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
