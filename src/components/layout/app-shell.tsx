import { Sparkle, SquaresFour } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { useI18n } from '../../i18n'
import { LocaleSwitcher } from './locale-switcher'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { t } = useI18n()

  return (
    <main className="min-h-[100dvh] bg-[#f6f3ee] text-stone-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(213,179,135,0.28),transparent_28%),radial-gradient(circle_at_86%_10%,rgba(124,151,137,0.18),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(246,243,238,0.92))]" />
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1440px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col justify-between gap-4 border-b border-stone-900/10 pb-4 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-stone-900/10 bg-white/64 px-3 py-1.5 text-xs font-medium text-stone-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur">
              <SquaresFour size={15} weight="duotone" />
              {t('app.badge')}
            </div>
            <h1 className="max-w-4xl text-3xl font-semibold leading-tight tracking-normal text-stone-950 sm:text-4xl lg:text-5xl">
              {t('app.title')}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
              {t('app.description')}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 rounded-md border border-stone-900/10 bg-white/70 px-3 py-3 shadow-[0_18px_42px_-30px_rgba(60,44,31,0.42)] backdrop-blur sm:flex-row sm:items-center sm:justify-between lg:w-auto">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase text-stone-500">{t('app.activePackLabel')}</p>
                <p className="text-sm font-semibold text-stone-900">{t('app.activePackName')}</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#476653] text-white">
                <Sparkle size={18} weight="duotone" />
              </span>
            </div>
            <LocaleSwitcher />
          </div>
        </header>
        {children}
      </div>
    </main>
  )
}
