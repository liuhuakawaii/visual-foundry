import { Play, Prohibit, Sparkle } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { JobQueue } from './components/generation/job-queue'
import { PresetBrowser } from './components/generation/preset-browser'
import { PromptComposer } from './components/generation/prompt-composer'
import { ReferenceUploader } from './components/generation/reference-uploader'
import { ResultGallery } from './components/generation/result-gallery'
import { SettingsPanel } from './components/generation/settings-panel'
import { AppShell } from './components/layout/app-shell'
import { Button } from './components/ui/button'
import { allPresets } from './data/preset-packs'
import { useBatchGeneration } from './hooks/useBatchGeneration'
import { createJobsFromPresets } from './lib/jobs'
import { buildPrompt } from './lib/prompt-builder'
import type {
  BatchGenerationSettings,
  GenerationJob,
  PromptPreset,
  UploadedReference,
} from './types/generation'

const initialSettings: BatchGenerationSettings = {
  mode: 'image-to-image',
  outputSize: '1024x1536',
  quality: 'high',
  outputFormat: 'png',
  itemsPerPreset: 1,
  concurrency: 1,
  provider: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-image-1.5',
    apiKey: '',
  },
}

const initialSelectedPresetIds = allPresets.slice(0, 4).map((preset) => preset.id)

function replaceJob(jobs: GenerationJob[], updatedJob: GenerationJob): GenerationJob[] {
  return jobs.map((job) => (job.id === updatedJob.id ? updatedJob : job))
}

function App() {
  const [settings, setSettings] = useState(initialSettings)
  const [reference, setReference] = useState<UploadedReference | null>(null)
  const [referenceError, setReferenceError] = useState<string | null>(null)
  const [selectedPresetIds, setSelectedPresetIds] = useState(initialSelectedPresetIds)
  const [presetQuery, setPresetQuery] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [preserveIdentity, setPreserveIdentity] = useState(true)
  const [jobs, setJobs] = useState<GenerationJob[]>([])
  const [workflowError, setWorkflowError] = useState<string | null>(null)
  const { isRunning, runBatch, abortBatch } = useBatchGeneration()

  const filteredPresets = useMemo(() => {
    const normalizedQuery = presetQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return allPresets
    }

    return allPresets.filter((preset) => {
      const searchableText = [preset.title, preset.description, ...preset.tags].join(' ').toLowerCase()
      return searchableText.includes(normalizedQuery)
    })
  }, [presetQuery])

  const selectedPresets = useMemo(
    () => allPresets.filter((preset) => selectedPresetIds.includes(preset.id)),
    [selectedPresetIds],
  )

  const activePreset = selectedPresets[0] || null
  const pendingJobsCount = selectedPresets.length * settings.itemsPerPreset

  function togglePreset(presetId: string) {
    setSelectedPresetIds((currentIds) =>
      currentIds.includes(presetId)
        ? currentIds.filter((currentId) => currentId !== presetId)
        : [...currentIds, presetId],
    )
  }

  async function startGeneration(presets: PromptPreset[]) {
    setWorkflowError(null)

    if (settings.mode === 'image-to-image' && !reference) {
      setWorkflowError('图生图模式需要先上传参考图。')
      return
    }

    if (presets.length === 0) {
      setWorkflowError('请至少选择一个主题预设。')
      return
    }

    const nextJobs = createJobsFromPresets(presets, settings.itemsPerPreset, (preset) =>
      buildPrompt({
        preset,
        customPrompt,
        shouldPreserveIdentity: preserveIdentity,
      }),
    )

    setJobs(nextJobs)
    await runBatch({
      jobs: nextJobs,
      settings,
      reference,
      onJobUpdate: (updatedJob) => {
        setJobs((currentJobs) => replaceJob(currentJobs, updatedJob))
      },
    })
  }

  async function retryFailedJobs() {
    const failedJobs = jobs.filter((job) => job.status === 'failed')

    if (failedJobs.length === 0) {
      return
    }

    const queuedJobs = failedJobs.map((job) => ({
      ...job,
      status: 'queued' as const,
      error: undefined,
      startedAt: undefined,
      completedAt: undefined,
    }))

    setJobs((currentJobs) =>
      currentJobs.map((job) => queuedJobs.find((queuedJob) => queuedJob.id === job.id) || job),
    )

    await runBatch({
      jobs: queuedJobs,
      settings,
      reference,
      onJobUpdate: (updatedJob) => {
        setJobs((currentJobs) => replaceJob(currentJobs, updatedJob))
      },
    })
  }

  return (
    <AppShell>
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[350px_minmax(0,1fr)_360px]">
        <aside className="grid content-start gap-4">
          <ReferenceUploader
            reference={reference}
            error={referenceError}
            onChange={setReference}
            onError={setReferenceError}
          />
          <SettingsPanel settings={settings} onChange={setSettings} />
        </aside>

        <section className="grid content-start gap-4">
          <div className="rounded-md border border-stone-900/10 bg-white/72 p-4 shadow-[0_24px_50px_-42px_rgba(60,44,31,0.58)] backdrop-blur">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-lg font-semibold text-stone-950">创作批次</h2>
                <p className="mt-1 text-sm leading-6 text-stone-500">
                  已选择 {selectedPresets.length} 个预设，准备生成 {pendingJobsCount} 张图。
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                {isRunning ? (
                  <Button variant="danger" icon={<Prohibit size={17} />} onClick={abortBatch}>
                    取消生成
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    icon={<Play size={17} weight="fill" />}
                    onClick={() => void startGeneration(selectedPresets)}
                  >
                    开始批量生成
                  </Button>
                )}
              </div>
            </div>
            {workflowError ? (
              <p className="mt-3 rounded-md border border-rose-900/15 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {workflowError}
              </p>
            ) : null}
          </div>

          <PromptComposer
            activePreset={activePreset}
            customPrompt={customPrompt}
            preserveIdentity={preserveIdentity}
            onCustomPromptChange={setCustomPrompt}
            onPreserveIdentityChange={setPreserveIdentity}
          />

          <ResultGallery jobs={jobs} />
        </section>

        <aside className="grid content-start gap-4">
          <PresetBrowser
            presets={filteredPresets}
            selectedPresetIds={selectedPresetIds}
            query={presetQuery}
            onQueryChange={setPresetQuery}
            onTogglePreset={togglePreset}
          />
          <JobQueue
            jobs={jobs}
            isRunning={isRunning}
            onRetryFailed={() => void retryFailedJobs()}
            onClear={() => setJobs([])}
          />
          <div className="rounded-md border border-[#476653]/20 bg-[#eef4ef] p-4 text-[#385342]">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Sparkle size={17} weight="duotone" />
              扩展方向
            </div>
            <p className="text-xs leading-5">
              主题包、生成模式和 provider 都已分层。下一步可以加商品图主题、R2 存储、D1 任务历史和 Cloudflare Queues 后台批量。
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  )
}

export default App
