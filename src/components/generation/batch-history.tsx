import { useI18n } from '../../i18n'
import { cn } from '../../lib/cn'
import { countJobsByStatus } from '../../lib/jobs'
import type { GenerationBatch, GenerationJob } from '../../types/generation'

interface BatchHistoryProps {
  batches: GenerationBatch[]
  jobs: GenerationJob[]
  currentBatchId: string | null
  onSelectBatch: (batchId: string) => void
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

export function BatchHistory({ batches, jobs, currentBatchId, onSelectBatch }: BatchHistoryProps) {
  const { t } = useI18n()

  return (
    <section className="rounded-md border border-stone-900/10 bg-[#f9f7f3] p-3">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-950">{t('history.title')}</h2>
          <p className="mt-1 text-xs leading-5 text-stone-500">{t('history.description')}</p>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="rounded-md border border-dashed border-stone-900/12 bg-[#f9f7f3] p-4 text-sm leading-6 text-stone-500">
          {t('history.empty')}
        </div>
      ) : (
        <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
          {batches.map((batch) => {
            const batchJobs = jobs.filter((job) => job.batchId === batch.id)
            const summary = countJobsByStatus(batchJobs)
            const isActive = batch.id === currentBatchId

            return (
              <button
                type="button"
                key={batch.id}
                onClick={() => onSelectBatch(batch.id)}
                className={cn(
                  'rounded-md border p-3 text-left transition active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#476653]',
                  isActive
                    ? 'border-[#476653]/35 bg-[#eef4ef]'
                    : 'border-stone-900/10 bg-white/72 hover:border-stone-900/20 hover:bg-white',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-950">{batch.title}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {t('history.batchMeta', {
                        status: t(`status.${batch.status}`),
                        time: formatTime(batch.createdAt),
                      })}
                    </p>
                  </div>
                  <span className="rounded bg-stone-100 px-2 py-1 font-mono text-[11px] text-stone-600">
                    {batchJobs.length}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-stone-500">
                  {t('history.summary', {
                    completed: summary.completed,
                    failed: summary.failed,
                    running: summary.running,
                  })}
                </p>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
