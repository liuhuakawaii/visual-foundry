import { ArrowClockwise, CheckCircle, CircleNotch, Clock, WarningCircle } from '@phosphor-icons/react'
import { useI18n } from '../../i18n'
import { countJobsByStatus } from '../../lib/jobs'
import type { GenerationBatch, GenerationJob } from '../../types/generation'
import { Button } from '../ui/button'

interface JobQueueProps {
  batch: GenerationBatch | null
  jobs: GenerationJob[]
  isRunning: boolean
  onRetryFailed: () => void
  onClear: () => void
}

function statusIcon(status: GenerationJob['status']) {
  if (status === 'completed') return <CheckCircle size={16} weight="duotone" className="text-[#476653]" />
  if (status === 'failed') return <WarningCircle size={16} weight="duotone" className="text-rose-700" />
  if (status === 'running') return <CircleNotch size={16} weight="duotone" className="animate-spin text-[#7c5f3f]" />
  return <Clock size={16} weight="duotone" className="text-stone-500" />
}

function formatDuration(durationMs: number | undefined) {
  if (!durationMs) {
    return null
  }

  return `${(durationMs / 1000).toFixed(1)}s`
}

export function JobQueue({ batch, jobs, isRunning, onRetryFailed, onClear }: JobQueueProps) {
  const { t } = useI18n()
  const summary = countJobsByStatus(jobs)

  return (
    <section className="rounded-md border border-stone-900/10 bg-[#f9f7f3] p-3">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-950">{t('queue.title')}</h2>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            {batch
              ? t('queue.batchDescription', {
                  title: batch.title,
                  status: t(`status.${batch.status}`),
                })
              : t('queue.description')}
          </p>
        </div>
        <Button variant="ghost" className="h-9 px-2" disabled={isRunning || jobs.length === 0} onClick={onClear}>
          {t('queue.clear')}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ['queued', t('queue.statQueued'), summary.queued],
          ['running', t('queue.statRunning'), summary.running],
          ['completed', t('queue.statCompleted'), summary.completed],
          ['failed', t('queue.statFailed'), summary.failed],
        ].map(([key, label, value]) => (
          <div key={key} className="rounded-md border border-stone-900/10 bg-white/72 p-2">
            <p className="text-[11px] text-stone-500">{label}</p>
            <p className="mt-1 font-mono text-lg font-semibold text-stone-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 max-h-[280px] overflow-y-auto pr-1">
        {jobs.length === 0 ? (
          <div className="grid min-h-32 place-items-center rounded-md border border-dashed border-stone-900/12 bg-[#f9f7f3] px-4 text-center">
            <p className="text-sm leading-6 text-stone-500">{t('queue.empty')}</p>
          </div>
        ) : (
            <div className="grid gap-2">
              {jobs.map((job) => (
              <div key={job.id} className="rounded-md border border-stone-900/10 bg-white/72 p-3">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">{statusIcon(job.status)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-stone-950">{job.presetTitle}</p>
                      <span className="shrink-0 font-mono text-[11px] text-stone-400">
                        {formatDuration(job.durationMs) || `r${job.retryCount}`}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">{job.error || job.prompt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="secondary"
        className="mt-4 w-full"
        icon={<ArrowClockwise size={17} />}
        disabled={isRunning || summary.failed === 0}
        onClick={onRetryFailed}
      >
        {t('queue.retryFailed')}
      </Button>
    </section>
  )
}
