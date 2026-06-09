import type { BatchStatus, GenerationBatch, GenerationJob, PromptPreset } from '../types/generation'

export function createJobsFromPresets(
  presets: PromptPreset[],
  itemsPerPreset: number,
  batchId: string,
  sourceReferenceId: string | undefined,
  getPrompt: (preset: PromptPreset) => string,
): GenerationJob[] {
  return presets.flatMap((preset) =>
    Array.from({ length: itemsPerPreset }, () => ({
      id: crypto.randomUUID(),
      batchId,
      presetId: preset.id,
      presetTitle: preset.title,
      prompt: getPrompt(preset),
      status: 'queued' as const,
      createdAt: Date.now(),
      retryCount: 0,
      sourceReferenceId,
    })),
  )
}

export function countJobsByStatus(jobs: GenerationJob[]) {
  return jobs.reduce(
    (summary, job) => {
      summary[job.status] += 1
      return summary
    },
    {
      queued: 0,
      running: 0,
      completed: 0,
      failed: 0,
    },
  )
}

export function createGenerationBatch(
  presets: PromptPreset[],
  jobs: GenerationJob[],
  mode: GenerationBatch['mode'],
  sourceReferenceId?: string,
): GenerationBatch {
  return {
    id: jobs[0]?.batchId || crypto.randomUUID(),
    title: createBatchTitle(presets),
    status: 'draft',
    mode,
    presetIds: presets.map((preset) => preset.id),
    jobIds: jobs.map((job) => job.id),
    sourceReferenceId,
    createdAt: Date.now(),
  }
}

export function resolveBatchStatus(jobs: GenerationJob[], isCanceled = false): BatchStatus {
  if (isCanceled) {
    return 'canceled'
  }

  if (jobs.length === 0) {
    return 'draft'
  }

  if (jobs.some((job) => job.status === 'running' || job.status === 'queued')) {
    return 'running'
  }

  const summary = countJobsByStatus(jobs)

  if (summary.completed > 0 && summary.failed > 0) {
    return 'partially_failed'
  }

  if (summary.completed === jobs.length) {
    return 'completed'
  }

  return 'failed'
}

export function createBatchTitle(presets: PromptPreset[]): string {
  if (presets.length === 0) {
    return '未命名批次'
  }

  const [firstPreset] = presets
  return presets.length === 1 ? firstPreset.title : `${firstPreset.title} 等 ${presets.length} 个预设`
}

export function replaceJob(jobs: GenerationJob[], updatedJob: GenerationJob[]): GenerationJob[]
export function replaceJob(jobs: GenerationJob[], updatedJob: GenerationJob): GenerationJob[]
export function replaceJob(
  jobs: GenerationJob[],
  updatedJob: GenerationJob | GenerationJob[],
): GenerationJob[] {
  const updatedJobs = Array.isArray(updatedJob) ? updatedJob : [updatedJob]
  const updatedJobById = new Map(updatedJobs.map((job) => [job.id, job]))

  return jobs.map((job) => updatedJobById.get(job.id) || job)
}

export function resetFailedJobs(jobs: GenerationJob[]): GenerationJob[] {
  return jobs
    .filter((job) => job.status === 'failed')
    .map((job) => ({
      ...job,
      status: 'queued' as const,
      error: undefined,
      startedAt: undefined,
      completedAt: undefined,
      durationMs: undefined,
      retryCount: job.retryCount + 1,
    }))
}

export function getJobsForBatch(jobs: GenerationJob[], batchId: string | null): GenerationJob[] {
  if (!batchId) {
    return []
  }

  return jobs.filter((job) => job.batchId === batchId)
}
