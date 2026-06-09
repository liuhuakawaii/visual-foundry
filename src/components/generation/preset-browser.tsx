import { Check, MagnifyingGlass, Sparkle } from '@phosphor-icons/react'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/cn'
import type { PresetPack, PromptPreset, WorkflowTemplate } from '../../types/generation'

interface PresetBrowserProps {
  activePackId: string
  activeTag: string | null
  activeWorkflowTemplateId: string
  availableTags: string[]
  packs: PresetPack[]
  presets: PromptPreset[]
  selectedPresetIds: string[]
  query: string
  workflowTemplates: WorkflowTemplate[]
  onPackChange: (packId: string) => void
  onQueryChange: (query: string) => void
  onTagChange: (tag: string | null) => void
  onTogglePreset: (presetId: string) => void
  onWorkflowTemplateChange: (templateId: string) => void
}

export function PresetBrowser({
  activePackId,
  activeTag,
  activeWorkflowTemplateId,
  availableTags,
  packs,
  presets,
  selectedPresetIds,
  query,
  workflowTemplates,
  onPackChange,
  onQueryChange,
  onTagChange,
  onTogglePreset,
  onWorkflowTemplateChange,
}: PresetBrowserProps) {
  const { t } = useI18n()
  const activePack = packs.find((pack) => pack.id === activePackId)

  return (
    <section className="rounded-md border border-stone-900/10 bg-white/76 p-3 shadow-[0_18px_58px_-50px_rgba(45,39,31,0.42)] backdrop-blur-xl">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-950">{t('preset.title')}</h2>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            {t('preset.description')}
          </p>
        </div>
        <span className="rounded bg-[#e6eee8] px-2 py-1 text-xs font-semibold text-[#385342]">
          {t('preset.selected', { count: selectedPresetIds.length })}
        </span>
      </div>

      <div className="mb-3 grid gap-2">
        <p className="text-xs font-semibold uppercase text-stone-500">{t('preset.packSection')}</p>
        <div className="grid grid-cols-2 gap-2">
          {packs.map((pack) => {
            const isActive = pack.id === activePackId
            const isAvailable = pack.availability !== 'planned'

            return (
              <button
                type="button"
                key={pack.id}
                onClick={() => onPackChange(pack.id)}
                className={cn(
                  'rounded-md border p-2 text-left transition duration-300 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#476653]',
                  isActive
                    ? 'border-[#476653]/35 bg-[#eef4ef] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]'
                    : 'border-stone-900/10 bg-[#f7f8f5] hover:bg-white',
                )}
              >
                <span className="block truncate text-xs font-semibold text-stone-950">{pack.title}</span>
                <span className={cn('mt-1 block text-[11px]', isAvailable ? 'text-[#385342]' : 'text-stone-400')}>
                  {isAvailable ? t('preset.packAvailable') : t('preset.packPlanned')}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-3 rounded-md border border-stone-900/10 bg-[#f7f8f5] p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-stone-500">
          <Sparkle size={15} weight="duotone" />
          {t('preset.workflowSection')}
        </div>
        <div className="grid gap-2">
          {workflowTemplates.map((template) => {
            const isActive = template.id === activeWorkflowTemplateId

            return (
              <button
                type="button"
                key={template.id}
                onClick={() => onWorkflowTemplateChange(template.id)}
                className={cn(
                  'rounded-md border px-3 py-2 text-left transition duration-300 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#476653]',
                  isActive ? 'border-[#476653]/35 bg-white text-stone-950' : 'border-transparent text-stone-600 hover:bg-white/70',
                )}
              >
                <span className="block text-xs font-semibold">{template.title}</span>
                <span className="mt-1 block truncate text-[11px] leading-4 text-stone-500">{template.expectedOutput}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-3 flex min-h-10 items-center gap-2 rounded-md border border-stone-900/10 bg-[#f7f8f5] px-3 text-stone-500">
        <MagnifyingGlass size={17} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t('preset.searchPlaceholder')}
          className="h-10 w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
        />
      </div>

      <div className="mb-3 rounded-md border border-dashed border-[#476653]/22 bg-[#eef4ef]/70 px-3 py-2">
        <p className="text-xs font-semibold text-[#385342]">{t('preset.selectedTrayTitle')}</p>
        <p className="mt-1 text-xs leading-5 text-[#385342]/75">
          {selectedPresetIds.length > 0
            ? t('preset.selected', { count: selectedPresetIds.length })
            : t('preset.selectedTrayEmpty')}
        </p>
      </div>

      {availableTags.length > 0 ? (
        <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => onTagChange(null)}
            className={cn(
              'shrink-0 rounded px-2 py-1 text-[11px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#476653]',
              activeTag === null ? 'bg-[#476653] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
            )}
          >
            {t('preset.tagAll')}
          </button>
          {availableTags.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => onTagChange(tag)}
              className={cn(
                'shrink-0 rounded px-2 py-1 text-[11px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#476653]',
                activeTag === tag ? 'bg-[#476653] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid max-h-[480px] gap-2 overflow-y-auto pr-1 2xl:max-h-[560px]">
        {activePack?.availability === 'planned' ? (
          <div className="rounded-md border border-dashed border-stone-900/12 bg-[#f9f7f3] p-4 text-sm leading-6 text-stone-500">
            {t('preset.plannedEmpty')}
          </div>
        ) : presets.length === 0 ? (
          <div className="rounded-md border border-dashed border-stone-900/12 bg-[#f9f7f3] p-4 text-sm leading-6 text-stone-500">
            {t('preset.noResults')}
          </div>
        ) : (
          presets.map((preset) => {
          const isSelected = selectedPresetIds.includes(preset.id)

          return (
            <button
              type="button"
              key={preset.id}
              onClick={() => onTogglePreset(preset.id)}
              className={cn(
                'rounded-md border p-3 text-left transition duration-300 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#476653]',
                isSelected
                  ? 'border-[#476653]/35 bg-[#eef4ef] shadow-[inset_0_1px_0_rgba(255,255,255,0.64)]'
                  : 'border-stone-900/10 bg-[#fbfcf9] hover:border-stone-900/20 hover:bg-white',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-stone-950">{preset.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-stone-500">{preset.description}</p>
                </div>
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                    isSelected ? 'border-[#476653] bg-[#476653] text-white' : 'border-stone-300 text-transparent',
                  )}
                >
                  <Check size={13} weight="bold" />
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {preset.tags.map((tag) => (
                  <span key={tag} className="rounded bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-600">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          )
          })
        )}
      </div>
    </section>
  )
}
