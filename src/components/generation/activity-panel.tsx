import { ClockCounterClockwise } from '@phosphor-icons/react'
import { useI18n } from '../../i18n'
import type { GenerationBatch, GenerationJob } from '../../types/generation'
import { BatchHistory } from './batch-history'
import { JobQueue } from './job-queue'

interface ActivityPanelProps {
  batch: GenerationBatch | null
  batches: GenerationBatch[]
  currentBatchId: string | null
  isRunning: boolean
  jobs: GenerationJob[]
  queueJobs: GenerationJob[]
  onClear: () => void
  onRetryFailed: () => void
  onSelectBatch: (batchId: string) => void
}

export function ActivityPanel({
  batch,
  batches,
  currentBatchId,
  isRunning,
  jobs,
  queueJobs,
  onClear,
  onRetryFailed,
  onSelectBatch,
}: ActivityPanelProps) {
  const { t } = useI18n()

  return (
    <section className="rounded-md border border-stone-900/10 bg-white/74 p-4 backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-950">{t('activity.title')}</h2>
          <p className="mt-1 text-xs leading-5 text-stone-500">{t('activity.description')}</p>
        </div>
        <ClockCounterClockwise size={21} weight="duotone" className="text-[#476653]" />
      </div>

      <div className="grid gap-3">
        <JobQueue
          batch={batch}
          jobs={queueJobs}
          isRunning={isRunning}
          onRetryFailed={onRetryFailed}
          onClear={onClear}
        />
        <BatchHistory
          batches={batches}
          jobs={jobs}
          currentBatchId={currentBatchId}
          onSelectBatch={onSelectBatch}
        />
      </div>
    </section>
  )
}
