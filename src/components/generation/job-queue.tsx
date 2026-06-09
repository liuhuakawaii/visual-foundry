import { ArrowClockwise, CheckCircle, CircleNotch, Clock, WarningCircle } from '@phosphor-icons/react'
import { countJobsByStatus } from '../../lib/jobs'
import type { GenerationJob } from '../../types/generation'
import { Button } from '../ui/button'

interface JobQueueProps {
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

export function JobQueue({ jobs, isRunning, onRetryFailed, onClear }: JobQueueProps) {
  const summary = countJobsByStatus(jobs)

  return (
    <section className="rounded-md border border-stone-900/10 bg-white/72 p-4 shadow-[0_24px_50px_-42px_rgba(60,44,31,0.58)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-950">批量队列</h2>
          <p className="mt-1 text-xs leading-5 text-stone-500">当前先用前端队列小批量执行，后续可迁移到 Cloudflare Queues。</p>
        </div>
        <Button variant="ghost" className="h-9 px-2" disabled={isRunning || jobs.length === 0} onClick={onClear}>
          清空
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          ['queued', '等待', summary.queued],
          ['running', '生成中', summary.running],
          ['completed', '完成', summary.completed],
          ['failed', '失败', summary.failed],
        ].map(([key, label, value]) => (
          <div key={key} className="rounded-md border border-stone-900/10 bg-[#f9f7f3] p-2">
            <p className="text-[11px] text-stone-500">{label}</p>
            <p className="mt-1 font-mono text-lg font-semibold text-stone-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 max-h-[280px] overflow-y-auto pr-1">
        {jobs.length === 0 ? (
          <div className="grid min-h-32 place-items-center rounded-md border border-dashed border-stone-900/12 bg-[#f9f7f3] px-4 text-center">
            <p className="text-sm leading-6 text-stone-500">选择预设并开始生成后，任务会出现在这里。</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-md border border-stone-900/10 bg-white/62 p-3">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">{statusIcon(job.status)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-950">{job.presetTitle}</p>
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
        重试失败任务
      </Button>
    </section>
  )
}
