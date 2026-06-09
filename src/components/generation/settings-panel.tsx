import { CaretDown } from '@phosphor-icons/react'
import { useState } from 'react'
import type {
  BatchGenerationSettings,
  GenerationMode,
  OutputFormat,
  OutputQuality,
  OutputSize,
} from '../../types/generation'
import { useI18n } from '../../i18n'
import { Field } from '../ui/field'
import { SegmentedControl } from '../ui/segmented-control'

interface SettingsPanelProps {
  settings: BatchGenerationSettings
  onChange: (settings: BatchGenerationSettings) => void
}

const sizeOptions: OutputSize[] = ['1024x1024', '1024x1536', '1536x1024']
const qualityOptions: OutputQuality[] = ['auto', 'high', 'medium', 'low']
const formatOptions: OutputFormat[] = ['png', 'jpeg', 'webp']

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    return min
  }

  return Math.max(min, Math.min(max, value))
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const { t } = useI18n()
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const modeOptions: Array<{ label: string; value: GenerationMode }> = [
    { label: t('settings.mode.imageToImage'), value: 'image-to-image' },
    { label: t('settings.mode.textToImage'), value: 'text-to-image' },
  ]

  return (
    <section className="rounded-md border border-stone-900/10 bg-white/74 p-4 backdrop-blur">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-stone-950">{t('settings.title')}</h2>
        <p className="mt-1 text-xs leading-5 text-stone-500">
          {t('settings.description')}
        </p>
      </div>

      <div className="grid gap-4">
        <Field label={t('settings.mode')} helper={t('settings.modeHelper')}>
          <SegmentedControl
            value={settings.mode}
            options={modeOptions}
            onChange={(mode) => onChange({ ...settings, mode })}
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t('settings.size')}>
            <select
              value={settings.outputSize}
              onChange={(event) => onChange({ ...settings, outputSize: event.target.value as OutputSize })}
              className="h-10 rounded-md border border-stone-900/10 bg-[#f9f7f3] px-3 text-sm text-stone-900 outline-none focus:border-[#476653]"
            >
              {sizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('settings.quality')}>
            <select
              value={settings.quality}
              onChange={(event) => onChange({ ...settings, quality: event.target.value as OutputQuality })}
              className="h-10 rounded-md border border-stone-900/10 bg-[#f9f7f3] px-3 text-sm text-stone-900 outline-none focus:border-[#476653]"
            >
              {qualityOptions.map((quality) => (
                <option key={quality} value={quality}>
                  {quality}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('settings.format')}>
            <select
              value={settings.outputFormat}
              onChange={(event) => onChange({ ...settings, outputFormat: event.target.value as OutputFormat })}
              className="h-10 rounded-md border border-stone-900/10 bg-[#f9f7f3] px-3 text-sm text-stone-900 outline-none focus:border-[#476653]"
            >
              {formatOptions.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('settings.itemsPerPreset')}>
            <input
              type="number"
              min={1}
              max={4}
              value={settings.itemsPerPreset}
              onChange={(event) =>
                onChange({
                  ...settings,
                  itemsPerPreset: clampNumber(Number(event.target.value), 1, 4),
                })
              }
              className="h-10 rounded-md border border-stone-900/10 bg-[#f9f7f3] px-3 text-sm text-stone-900 outline-none focus:border-[#476653]"
            />
          </Field>
          <Field label={t('settings.concurrency')}>
            <input
              type="number"
              min={1}
              max={4}
              value={settings.concurrency}
              onChange={(event) =>
                onChange({
                  ...settings,
                  concurrency: clampNumber(Number(event.target.value), 1, 4),
                })
              }
              className="h-10 rounded-md border border-stone-900/10 bg-[#f9f7f3] px-3 text-sm text-stone-900 outline-none focus:border-[#476653]"
            />
          </Field>
        </div>

        <div className="rounded-md border border-stone-900/10 bg-[#f9f7f3]">
          <button
            type="button"
            onClick={() => setIsAdvancedOpen((isOpen) => !isOpen)}
            className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#476653]"
            aria-expanded={isAdvancedOpen}
          >
            <span>
              <span className="block text-sm font-semibold text-stone-900">{t('settings.advancedToggle')}</span>
              <span className="mt-1 block text-xs leading-5 text-stone-500">
                {t('settings.advancedDescription')}
              </span>
            </span>
            <CaretDown
              size={17}
              className={isAdvancedOpen ? 'rotate-180 text-[#476653] transition' : 'text-stone-500 transition'}
            />
          </button>

          {isAdvancedOpen ? (
            <div className="grid gap-4 border-t border-stone-900/10 p-3">
              <Field label={t('settings.providerBaseUrl')}>
                <input
                  value={settings.provider.baseUrl}
                  onChange={(event) =>
                    onChange({
                      ...settings,
                      provider: { ...settings.provider, baseUrl: event.target.value },
                    })
                  }
                  className="h-10 rounded-md border border-stone-900/10 bg-white px-3 text-sm text-stone-900 outline-none focus:border-[#476653]"
                />
              </Field>
              <Field label={t('settings.model')}>
                <input
                  value={settings.provider.model}
                  onChange={(event) =>
                    onChange({
                      ...settings,
                      provider: { ...settings.provider, model: event.target.value },
                    })
                  }
                  className="h-10 rounded-md border border-stone-900/10 bg-white px-3 text-sm text-stone-900 outline-none focus:border-[#476653]"
                />
              </Field>
              <Field label={t('settings.temporaryApiKey')} helper={t('settings.temporaryApiKeyHelper')}>
                <input
                  type="password"
                  value={settings.provider.apiKey || ''}
                  onChange={(event) =>
                    onChange({
                      ...settings,
                      provider: { ...settings.provider, apiKey: event.target.value },
                    })
                  }
                  placeholder="sk-..."
                  className="h-10 rounded-md border border-stone-900/10 bg-white px-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#476653]"
                />
              </Field>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
