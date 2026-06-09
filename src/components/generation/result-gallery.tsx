import {
  ArrowClockwise,
  CheckCircle,
  ClipboardText,
  DownloadSimple,
  Export,
  ImageBroken,
  ImagesSquare,
  Info,
  XCircle,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { useI18n } from '../../i18n'
import { cn } from '../../lib/cn'
import { downloadJsonManifest } from '../../lib/export'
import type { GenerationBatch, GenerationJob, ResultGalleryFilter, ReviewStatus } from '../../types/generation'
import { Button } from '../ui/button'

interface ResultGalleryProps {
  batches: GenerationBatch[]
  currentBatchId: string | null
  filter: ResultGalleryFilter
  jobs: GenerationJob[]
  onFilterChange: (filter: ResultGalleryFilter) => void
  onRetryJob: (jobId: string) => void
  onReviewStatusChange: (jobId: string, reviewStatus: ReviewStatus | undefined) => void
}

function downloadImage(url: string, fileName: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function getVisibleJobs(jobs: GenerationJob[], filter: ResultGalleryFilter, currentBatchId: string | null) {
  if (filter === 'current') {
    return currentBatchId ? jobs.filter((job) => job.batchId === currentBatchId) : []
  }

  if (filter === 'all') {
    return jobs
  }

  if (filter === 'selected' || filter === 'rejected') {
    return jobs.filter((job) => job.reviewStatus === filter)
  }

  return jobs.filter((job) => job.status === filter)
}

export function ResultGallery({
  batches,
  currentBatchId,
  filter,
  jobs,
  onFilterChange,
  onRetryJob,
  onReviewStatusChange,
}: ResultGalleryProps) {
  const { t } = useI18n()
  const filterOptions: Array<{ label: string; value: ResultGalleryFilter }> = [
    { label: t('gallery.filter.current'), value: 'current' },
    { label: t('gallery.filter.all'), value: 'all' },
    { label: t('gallery.filter.selected'), value: 'selected' },
    { label: t('gallery.filter.rejected'), value: 'rejected' },
    { label: t('gallery.filter.completed'), value: 'completed' },
    { label: t('gallery.filter.failed'), value: 'failed' },
  ]
  const visibleJobs = getVisibleJobs(jobs, filter, currentBatchId)
  const completedJobs = visibleJobs.filter((job) => job.status === 'completed' && job.imageUrl)
  const failedJobs = visibleJobs.filter((job) => job.status === 'failed')
  const hasVisibleResults = completedJobs.length > 0 || failedJobs.length > 0

  return (
    <section className="rounded-md border border-stone-900/10 bg-white/84 p-4 shadow-[0_24px_58px_-44px_rgba(60,44,31,0.48)] backdrop-blur">
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h2 className="text-base font-semibold text-stone-950">{t('gallery.title')}</h2>
          <p className="mt-1 text-xs leading-5 text-stone-500">{t('gallery.description')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-stone-900/10 bg-[#f9f7f3] p-1">
            {filterOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => onFilterChange(option.value)}
                className={cn(
                  'min-h-8 rounded px-2.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#476653]',
                  filter === option.value ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500 hover:text-stone-900',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            className="h-10 px-3"
            icon={<Export size={17} />}
            disabled={visibleJobs.length === 0}
            onClick={() => downloadJsonManifest('visual-foundry-manifest.json', batches, visibleJobs)}
          >
            {t('gallery.export')}
          </Button>
          <span className="hidden h-9 w-9 items-center justify-center rounded-md bg-[#f0e4d0] text-[#7c5f3f] sm:flex">
            <ImagesSquare size={19} weight="duotone" />
          </span>
        </div>
      </div>

      {!hasVisibleResults ? (
        <div className="grid min-h-[360px] place-items-center rounded-md border border-dashed border-stone-900/12 bg-[#f9f7f3] px-6 text-center">
          <div>
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-white text-[#476653]">
              <ImagesSquare size={24} weight="duotone" />
            </span>
            <p className="text-sm font-semibold text-stone-900">{t('gallery.emptyTitle')}</p>
            <p className="mt-2 max-w-sm text-xs leading-5 text-stone-500">{t('gallery.emptyDescription')}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {completedJobs.map((job) => (
            <CompletedResultCard
              key={job.id}
              job={job}
              onDownload={() => downloadImage(job.imageUrl || '', `${job.presetTitle}-${job.id}.png`)}
              onReviewStatusChange={onReviewStatusChange}
            />
          ))}
          {failedJobs.map((job) => (
            <article key={job.id} className="rounded-md border border-rose-900/15 bg-rose-50 p-3">
              <div className="flex items-center gap-2 text-rose-800">
                <ImageBroken size={18} weight="duotone" />
                <p className="text-sm font-semibold">{job.presetTitle}</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-rose-700">{job.error || t('error.generationFailed')}</p>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-rose-800/75">{job.prompt}</p>
              <Button
                variant="danger"
                className="mt-3 w-full"
                icon={<ArrowClockwise size={17} />}
                onClick={() => onRetryJob(job.id)}
              >
                {t('gallery.retrySingle')}
              </Button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function CompletedResultCard({
  job,
  onDownload,
  onReviewStatusChange,
}: {
  job: GenerationJob
  onDownload: () => void
  onReviewStatusChange: (jobId: string, reviewStatus: ReviewStatus | undefined) => void
}) {
  const { t } = useI18n()
  const [isMetadataOpen, setIsMetadataOpen] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'failed'>('idle')
  const isSelected = job.reviewStatus === 'selected'
  const isRejected = job.reviewStatus === 'rejected'

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(job.revisedPrompt || job.prompt)
      setCopyState('done')
      window.setTimeout(() => setCopyState('idle'), 1600)
    } catch {
      setCopyState('failed')
      window.setTimeout(() => setCopyState('idle'), 1600)
    }
  }

  return (
    <article
      className={cn(
        'overflow-hidden rounded-md border bg-white transition',
        isSelected && 'border-[#476653]/45 ring-2 ring-[#476653]/12',
        isRejected && 'border-stone-900/10 opacity-72',
        !isSelected && !isRejected && 'border-stone-900/10',
      )}
    >
      <div className="relative">
        <img
          src={job.imageUrl}
          alt={t('gallery.generatedAlt', { title: job.presetTitle })}
          className="aspect-[4/5] w-full object-cover"
        />
        {job.reviewStatus ? (
          <span
            className={cn(
              'absolute left-2 top-2 rounded px-2 py-1 text-xs font-semibold',
              isSelected ? 'bg-[#476653] text-white' : 'bg-stone-950/72 text-white',
            )}
          >
            {isSelected ? t('gallery.review.selected') : t('gallery.review.rejected')}
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-stone-950">{job.presetTitle}</p>
        <p className="mt-1 text-xs text-stone-500">
          {t('gallery.retryMeta', {
            retryCount: job.retryCount,
            duration: job.durationMs ? `${(job.durationMs / 1000).toFixed(1)}s` : t('gallery.durationPending'),
          })}
        </p>
        {job.revisedPrompt ? (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone-500">{job.revisedPrompt}</p>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            variant={isSelected ? 'primary' : 'secondary'}
            className="px-2"
            icon={<CheckCircle size={17} />}
            onClick={() => onReviewStatusChange(job.id, isSelected ? undefined : 'selected')}
          >
            {t('gallery.review.select')}
          </Button>
          <Button
            variant={isRejected ? 'danger' : 'secondary'}
            className="px-2"
            icon={<XCircle size={17} />}
            onClick={() => onReviewStatusChange(job.id, isRejected ? undefined : 'rejected')}
          >
            {t('gallery.review.reject')}
          </Button>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2">
          <Button className="px-2" icon={<DownloadSimple size={17} />} onClick={onDownload}>
            {t('gallery.download')}
          </Button>
          <Button variant="secondary" className="px-2" icon={<ClipboardText size={17} />} onClick={() => void copyPrompt()}>
            {copyState === 'done' ? t('gallery.copyDone') : t('gallery.copyPrompt')}
          </Button>
          <Button
            variant="secondary"
            className="px-2"
            icon={<Info size={17} />}
            onClick={() => setIsMetadataOpen((isOpen) => !isOpen)}
          >
            {t('gallery.metadata')}
          </Button>
        </div>

        {copyState === 'failed' ? (
          <p className="mt-2 text-xs leading-5 text-rose-700">{t('gallery.copyFailed')}</p>
        ) : null}

        {isMetadataOpen ? (
          <dl className="mt-3 grid gap-2 rounded-md border border-stone-900/10 bg-[#f9f7f3] p-3 text-xs">
            <MetadataRow label={t('gallery.meta.jobId')} value={job.id} />
            <MetadataRow label={t('gallery.meta.batchId')} value={job.batchId} />
            <MetadataRow label={t('gallery.meta.providerTraceId')} value={job.providerTraceId || '-'} />
            <MetadataRow label={t('gallery.meta.prompt')} value={job.revisedPrompt || job.prompt} multiline />
          </dl>
        ) : null}
      </div>
    </article>
  )
}

function MetadataRow({
  label,
  multiline = false,
  value,
}: {
  label: string
  multiline?: boolean
  value: string
}) {
  return (
    <div className={multiline ? 'grid gap-1' : 'grid grid-cols-[88px_minmax(0,1fr)] gap-2'}>
      <dt className="font-semibold text-stone-500">{label}</dt>
      <dd className={cn('break-all text-stone-700', multiline && 'max-h-28 overflow-y-auto leading-5')}>
        {value}
      </dd>
    </div>
  )
}
