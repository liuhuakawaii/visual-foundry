import type { GenerationJob, PromptPreset } from '../types/generation'

export function createJobsFromPresets(
  presets: PromptPreset[],
  itemsPerPreset: number,
  getPrompt: (preset: PromptPreset) => string,
): GenerationJob[] {
  return presets.flatMap((preset) =>
    Array.from({ length: itemsPerPreset }, () => ({
      id: crypto.randomUUID(),
      presetId: preset.id,
      presetTitle: preset.title,
      prompt: getPrompt(preset),
      status: 'queued' as const,
      createdAt: Date.now(),
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
