'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { translations, Locale } from './translations'

type LangContextType = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: typeof translations[Locale]
}

const LangContext = createContext<LangContextType | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en')
  const t = translations[locale]
  return (
    <LangContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be inside LangProvider')
  return ctx
}