import { Check, MagnifyingGlass } from '@phosphor-icons/react'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/cn'
import type { PromptPreset } from '../../types/generation'

interface PresetBrowserProps {
  presets: PromptPreset[]
  selectedPresetIds: string[]
  query: string
  onQueryChange: (query: string) => void
  onTogglePreset: (presetId: string) => void
}

export function PresetBrowser({
  presets,
  selectedPresetIds,
  query,
  onQueryChange,
  onTogglePreset,
}: PresetBrowserProps) {
  const { t } = useI18n()

  return (
    <section className="rounded-md border border-stone-900/10 bg-white/74 p-4 backdrop-blur">
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

      <div className="mb-3 flex min-h-10 items-center gap-2 rounded-md border border-stone-900/10 bg-[#f9f7f3] px-3 text-stone-500">
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

      <div className="grid max-h-[520px] gap-2 overflow-y-auto pr-1">
        {presets.map((preset) => {
          const isSelected = selectedPresetIds.includes(preset.id)

          return (
            <button
              type="button"
              key={preset.id}
              onClick={() => onTogglePreset(preset.id)}
              className={cn(
                'rounded-md border p-3 text-left transition active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#476653]',
                isSelected
                  ? 'border-[#476653]/35 bg-[#eef4ef] shadow-[inset_0_1px_0_rgba(255,255,255,0.64)]'
                  : 'border-stone-900/10 bg-white/62 hover:border-stone-900/20 hover:bg-white',
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
        })}
      </div>
    </section>
  )
}
