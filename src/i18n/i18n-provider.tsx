import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { I18nContext } from './i18n-context'
import type { MessageValues } from './i18n-context'
import { defaultLocale, isLocale, messages } from './messages'
import type { Locale, MessageKey } from './messages'

const localeStorageKey = 'visual-foundry:locale'

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale
  }

  const storedLocale = window.localStorage.getItem(localeStorageKey)
  return storedLocale && isLocale(storedLocale) ? storedLocale : defaultLocale
}

function formatMessage(template: string, values: MessageValues = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key]
    return value === undefined ? match : String(value)
  })
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale)
    window.localStorage.setItem(localeStorageKey, nextLocale)
  }, [])

  const t = useCallback(
    (key: MessageKey, values?: MessageValues) => formatMessage(messages[locale][key], values),
    [locale],
  )

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
