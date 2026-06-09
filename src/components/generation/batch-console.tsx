import { CheckCircle, Key, Play, Prohibit, UploadSimple } from '@phosphor-icons/react'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/cn'
import type { PromptPreset } from '../../types/generation'
import { Button } from '../ui/button'

interface BatchConsoleProps {
  hasReference: boolean
  isRunning: boolean
  jobCount: number
  selectedPresets: PromptPreset[]
  usesTemporaryKey: boolean
  workflowError: string | null
  onCancel: () => void
  onStart: () => void
  onTogglePreset: (presetId: string) => void
}

export function BatchConsole({
  hasReference,
  isRunning,
  jobCount,
  selectedPresets,
  usesTemporaryKey,
  workflowError,
  onCancel,
  onStart,
  onTogglePreset,
}: BatchConsoleProps) {
  const { t } = useI18n()

  return (
    <section className="sticky top-3 z-20 rounded-md border border-stone-900/10 bg-white/90 p-4 shadow-[0_18px_46px_-34px_rgba(60,44,31,0.52)] backdrop-blur">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-stone-950">{t('production.title')}</h2>
            <StatusBadge
              active={hasReference}
              icon={hasReference ? <CheckCircle size={15} weight="duotone" /> : <UploadSimple size={15} />}
            >
              {hasReference ? t('production.referenceReady') : t('production.referenceMissing')}
            </StatusBadge>
            <StatusBadge active={usesTemporaryKey} icon={<Key size={15} weight="duotone" />}>
              {usesTemporaryKey ? t('production.apiOverride') : t('production.apiReady')}
            </StatusBadge>
          </div>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            {t('production.summary', {
              presetCount: selectedPresets.length,
              jobCount,
            })}
          </p>
          <p className="mt-1 text-xs leading-5 text-stone-500 md:hidden">{t('production.mobileHint')}</p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          {isRunning ? (
            <Button variant="danger" icon={<Prohibit size={17} />} onClick={onCancel}>
              {t('production.cancel')}
            </Button>
          ) : (
            <Button variant="primary" icon={<Play size={17} weight="fill" />} onClick={onStart}>
              {t('production.start')}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-stone-900/8 pt-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase text-stone-500">{t('production.selectedPresets')}</p>
          <span className="font-mono text-xs text-stone-400">{selectedPresets.length}</span>
        </div>
        {selectedPresets.length === 0 ? (
          <p className="rounded-md border border-dashed border-stone-900/12 bg-[#f9f7f3] px-3 py-2 text-xs leading-5 text-stone-500">
            {t('production.noSelectedPresets')}
          </p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {selectedPresets.map((preset) => (
              <button
                type="button"
                key={preset.id}
                aria-label={t('preset.removeSelected', { title: preset.title })}
                onClick={() => onTogglePreset(preset.id)}
                className="shrink-0 rounded-md border border-[#476653]/20 bg-[#eef4ef] px-3 py-2 text-left text-xs font-semibold text-[#385342] transition hover:border-[#476653]/40 hover:bg-[#e5eee7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#476653]"
              >
                {preset.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {workflowError ? (
        <p className="mt-3 rounded-md border border-rose-900/15 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {workflowError}
        </p>
      ) : null}
    </section>
  )
}

function StatusBadge({
  active,
  children,
  icon,
}: {
  active: boolean
  children: string
  icon: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center gap-1.5 rounded px-2 text-xs font-semibold',
        active ? 'bg-[#eef4ef] text-[#385342]' : 'bg-stone-100 text-stone-500',
      )}
    >
      {icon}
      {children}
    </span>
  )
}
