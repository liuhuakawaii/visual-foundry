import { Circuitry, Sparkle } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { useI18n } from '../../i18n'
import { LocaleSwitcher } from './locale-switcher'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { t } = useI18n()

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#f7f8f5] text-stone-950">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,248,245,0.78)_42%,rgba(232,238,231,0.84)),radial-gradient(circle_at_8%_10%,rgba(71,102,83,0.12),transparent_28%),radial-gradient(circle_at_92%_12%,rgba(194,172,133,0.14),transparent_26%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(28,25,23,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(28,25,23,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1540px] flex-col px-3 py-3 sm:px-5 lg:px-6">
        <header className="mb-4 rounded-md border border-stone-900/10 bg-white/72 px-3 py-3 shadow-[0_24px_80px_-62px_rgba(45,39,31,0.45)] backdrop-blur-xl sm:px-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#27352c] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
                <Circuitry size={21} weight="duotone" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight text-stone-950 sm:text-2xl">
                    {t('app.title')}
                  </h1>
                  <span className="rounded bg-[#eef4ef] px-2 py-1 text-[11px] font-semibold text-[#385342]">
                    {t('app.badge')}
                  </span>
                </div>
                <p className="mt-1 max-w-3xl truncate text-xs leading-5 text-stone-500 sm:text-sm">
                  {t('app.description')}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center justify-between gap-3 rounded-md border border-stone-900/10 bg-[#f7f8f5] px-3 py-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase text-stone-500">{t('app.activePackLabel')}</p>
                  <p className="text-sm font-semibold text-stone-900">{t('app.activePackName')}</p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#476653] text-white">
                  <Sparkle size={17} weight="duotone" />
                </span>
              </div>
              <LocaleSwitcher />
            </div>
          </div>
        </header>
        {children}
      </div>
    </main>
  )
}
