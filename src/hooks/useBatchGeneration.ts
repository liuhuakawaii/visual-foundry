import { useRef, useState } from 'react'
import { generateImage } from '../services/generation-api'
import type {
  BatchGenerationSettings,
  GenerationJob,
  GenerateImageRequest,
  UploadedReference,
} from '../types/generation'

interface RunBatchOptions {
  jobs: GenerationJob[]
  settings: BatchGenerationSettings
  reference: UploadedReference | null
  onJobUpdate: (job: GenerationJob) => void
}

export function useBatchGeneration() {
  const [isRunning, setIsRunning] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  async function runBatch({ jobs, settings, reference, onJobUpdate }: RunBatchOptions) {
    const controller = new AbortController()
    abortControllerRef.current = controller
    setIsRunning(true)

    const finalJobs = new Map<string, GenerationJob>()
    const queue = [...jobs]
    const workerCount = Math.max(1, Math.min(settings.concurrency, 4, queue.length))

    try {
      await Promise.all(
        Array.from({ length: workerCount }, async () => {
          while (queue.length > 0 && !controller.signal.aborted) {
            const job = queue.shift()
            if (!job) {
              return
            }

            const runningJob: GenerationJob = {
              ...job,
              status: 'running',
              startedAt: Date.now(),
              error: undefined,
            }
            finalJobs.set(runningJob.id, runningJob)
            onJobUpdate(runningJob)

            const request: GenerateImageRequest = {
              mode: settings.mode,
              prompt: job.prompt,
              image:
                settings.mode === 'image-to-image' && reference
                  ? {
                      dataUrl: reference.dataUrl,
                      fileName: reference.name,
                    }
                  : undefined,
              size: settings.outputSize,
              quality: settings.quality,
              outputFormat: settings.outputFormat,
              provider: {
                baseUrl: settings.provider.baseUrl,
                apiKey: settings.provider.apiKey || undefined,
                model: settings.provider.model,
              },
            }

            try {
              const result = await generateImage(request, controller.signal)
              const completedJob: GenerationJob = {
                ...runningJob,
                status: 'completed',
                completedAt: Date.now(),
                imageUrl: result.imageUrl,
              }
              finalJobs.set(completedJob.id, completedJob)
              onJobUpdate(completedJob)
            } catch (error) {
              const failedJob: GenerationJob = {
                ...runningJob,
                status: 'failed',
                completedAt: Date.now(),
                error: error instanceof Error ? error.message : '生成失败。',
              }
              finalJobs.set(failedJob.id, failedJob)
              onJobUpdate(failedJob)
            }
          }
        }),
      )

      if (controller.signal.aborted) {
        for (const job of queue) {
          const failedJob: GenerationJob = {
            ...job,
            status: 'failed',
            completedAt: Date.now(),
            error: '生成已取消。',
          }
          finalJobs.set(failedJob.id, failedJob)
          onJobUpdate(failedJob)
        }
      }

      return jobs.map((job) => finalJobs.get(job.id) || job)
    } finally {
      setIsRunning(false)
      abortControllerRef.current = null
    }
  }

  function abortBatch() {
    abortControllerRef.current?.abort()
    setIsRunning(false)
  }

  return {
    isRunning,
    runBatch,
    abortBatch,
  }
}
