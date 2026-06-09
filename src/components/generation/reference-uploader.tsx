import { ImageSquare, UploadSimple, X } from '@phosphor-icons/react'
import type { ChangeEvent } from 'react'
import { useI18n } from '../../i18n'
import { formatFileSize, readReferenceFile } from '../../lib/file'
import type { UploadedReference } from '../../types/generation'
import { Button } from '../ui/button'

interface ReferenceUploaderProps {
  reference: UploadedReference | null
  error: string | null
  onChange: (reference: UploadedReference | null) => void
  onError: (error: string | null) => void
}

export function ReferenceUploader({
  reference,
  error,
  onChange,
  onError,
}: ReferenceUploaderProps) {
  const { t } = useI18n()

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    try {
      const nextReference = await readReferenceFile(file)
      onChange(nextReference)
      onError(null)
    } catch (readError) {
      onError(readError instanceof Error ? readError.message : t('error.imageReadFailed'))
    }
  }

  return (
    <section className="rounded-md border border-stone-900/10 bg-white/72 p-4 shadow-[0_24px_50px_-42px_rgba(60,44,31,0.58)] backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-950">{t('reference.title')}</h2>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            {t('reference.description')}
          </p>
        </div>
        {reference ? (
          <Button variant="ghost" className="h-9 px-2" aria-label={t('reference.remove')} onClick={() => onChange(null)}>
            <X size={17} />
          </Button>
        ) : null}
      </div>

      <label className="group grid cursor-pointer place-items-center rounded-md border border-dashed border-stone-900/16 bg-[#f9f7f3] p-3 transition hover:border-[#476653]/45 hover:bg-white">
        <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleFileChange} />
        {reference ? (
          <div className="w-full">
            <div className="overflow-hidden rounded-md border border-stone-900/10 bg-stone-100">
              <img src={reference.dataUrl} alt={t('reference.previewAlt')} className="aspect-[4/5] w-full object-cover" />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-stone-500">
              <span className="truncate">{reference.name}</span>
              <span>{formatFileSize(reference.size)}</span>
            </div>
          </div>
        ) : (
          <div className="flex min-h-52 flex-col items-center justify-center text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-white text-[#476653] shadow-[0_18px_42px_-32px_rgba(60,44,31,0.48)]">
              <ImageSquare size={24} weight="duotone" />
            </span>
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              <UploadSimple size={17} />
              {t('reference.uploadCta')}
            </div>
            <p className="mt-2 max-w-xs text-xs leading-5 text-stone-500">
              {t('reference.uploadHint')}
            </p>
          </div>
        )}
      </label>
      {error ? <p className="mt-2 text-xs leading-5 text-rose-700">{error}</p> : null}
    </section>
  )
}
