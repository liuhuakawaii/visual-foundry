import type { GenerationBatch, GenerationJob } from '../types/generation'

interface ExportManifest {
  exportedAt: string
  batches: GenerationBatch[]
  jobs: Array<{
    id: string
    batchId: string
    presetId: string
    presetTitle: string
    status: GenerationJob['status']
    prompt: string
    revisedPrompt?: string
    imageUrl?: string
    error?: string
    retryCount: number
    reviewStatus?: GenerationJob['reviewStatus']
    durationMs?: number
    providerTraceId?: string
  }>
}

export function downloadJsonManifest(fileName: string, batches: GenerationBatch[], jobs: GenerationJob[]) {
  const manifest: ExportManifest = {
    exportedAt: new Date().toISOString(),
    batches,
    jobs: jobs.map((job) => ({
      id: job.id,
      batchId: job.batchId,
      presetId: job.presetId,
      presetTitle: job.presetTitle,
      status: job.status,
      prompt: job.prompt,
      revisedPrompt: job.revisedPrompt,
      imageUrl: job.imageUrl,
      error: job.error,
      retryCount: job.retryCount,
      reviewStatus: job.reviewStatus,
      durationMs: job.durationMs,
      providerTraceId: job.providerTraceId,
    })),
  }

  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
