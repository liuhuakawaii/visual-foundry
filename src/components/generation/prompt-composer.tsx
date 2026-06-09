import { ClipboardText } from '@phosphor-icons/react'
import { useI18n } from '../../i18n'
import { getPromptPreview } from '../../lib/prompt-builder'
import type { PromptPreset } from '../../types/generation'
import { Field } from '../ui/field'

interface PromptComposerProps {
  activePreset: PromptPreset | null
  customPrompt: string
  preserveIdentity: boolean
  onCustomPromptChange: (prompt: string) => void
  onPreserveIdentityChange: (preserveIdentity: boolean) => void
}

export function PromptComposer({
  activePreset,
  customPrompt,
  preserveIdentity,
  onCustomPromptChange,
  onPreserveIdentityChange,
}: PromptComposerProps) {
  const { t } = useI18n()

  return (
    <section className="rounded-md border border-stone-900/10 bg-white/72 p-4 shadow-[0_24px_50px_-42px_rgba(60,44,31,0.58)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-950">{t('prompt.title')}</h2>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            {t('prompt.description')}
          </p>
        </div>
        <ClipboardText size={21} className="text-[#476653]" weight="duotone" />
      </div>

      <div className="grid gap-4">
        <label className="flex items-start gap-3 rounded-md border border-stone-900/10 bg-[#f9f7f3] p-3">
          <input
            type="checkbox"
            checked={preserveIdentity}
            onChange={(event) => onPreserveIdentityChange(event.target.checked)}
            className="mt-1 h-4 w-4 accent-[#476653]"
          />
          <span>
            <span className="block text-sm font-semibold text-stone-900">{t('prompt.identityTitle')}</span>
            <span className="mt-1 block text-xs leading-5 text-stone-500">
              {t('prompt.identityDescription')}
            </span>
          </span>
        </label>

        <Field label={t('prompt.customLabel')} helper={t('prompt.customHelper')}>
          <textarea
            value={customPrompt}
            onChange={(event) => onCustomPromptChange(event.target.value)}
            rows={5}
            className="resize-none rounded-md border border-stone-900/10 bg-[#f9f7f3] px-3 py-2 text-sm leading-6 text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#476653]"
            placeholder={t('prompt.customPlaceholder')}
          />
        </Field>

        <div className="rounded-md border border-stone-900/10 bg-stone-950 p-3 text-stone-100">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase text-stone-400">{t('prompt.previewLabel')}</p>
            <p className="text-xs text-stone-500">{activePreset?.title || t('prompt.noPreset')}</p>
          </div>
          <p className="max-h-44 overflow-y-auto text-xs leading-5 text-stone-300">
            {activePreset ? getPromptPreview(activePreset) : t('prompt.emptyPreview')}
          </p>
        </div>
      </div>
    </section>
  )
}
