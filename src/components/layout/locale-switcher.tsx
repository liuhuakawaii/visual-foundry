import { cn } from '../../lib/cn'
import { supportedLocales, useI18n } from '../../i18n'
import type { Locale } from '../../i18n'

const localeLabelKey: Record<Locale, 'app.language.zh' | 'app.language.en'> = {
  'zh-CN': 'app.language.zh',
  'en-US': 'app.language.en',
}

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div aria-label={t('app.languageLabel')} className="flex rounded-md border border-stone-900/10 bg-[#f9f7f3] p-1">
      {supportedLocales.map((option) => (
        <button
          type="button"
          key={option}
          onClick={() => setLocale(option)}
          className={cn(
            'min-h-8 rounded px-2.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#476653]',
            locale === option ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500 hover:text-stone-900',
          )}
        >
          {t(localeLabelKey[option])}
        </button>
      ))}
    </div>
  )
}

