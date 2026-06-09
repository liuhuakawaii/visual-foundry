import { useEffect, useMemo, useReducer } from 'react'
import { allPresets } from '../data/preset-packs'
import { defaultGenerationSettings, defaultSelectedPresetIds } from '../lib/generation-defaults'
import {
  createGenerationBatch,
  createJobsFromPresets,
  getJobsForBatch,
  replaceJob,
  resetFailedJobs,
  resolveBatchStatus,
} from '../lib/jobs'
import { buildPrompt } from '../lib/prompt-builder'
import { createBatch } from '../services/generation-api'
import type {
  BatchGenerationSettings,
  GenerationBatch,
  GenerationJob,
  PromptPreset,
  ResultGalleryFilter,
  UploadedReference,
} from '../types/generation'
import { useBatchGeneration } from './useBatchGeneration'

interface WorkspaceState {
  settings: BatchGenerationSettings
  reference: UploadedReference | null
  referenceError: string | null
  selectedPresetIds: string[]
  presetQuery: string
  customPrompt: string
  preserveIdentity: boolean
  jobs: GenerationJob[]
  batches: GenerationBatch[]
  currentBatchId: string | null
  resultFilter: ResultGalleryFilter
  workflowError: string | null
}

type WorkspaceAction =
  | { type: 'settingsChanged'; settings: BatchGenerationSettings }
  | { type: 'referenceChanged'; reference: UploadedReference | null }
  | { type: 'referenceErrorChanged'; error: string | null }
  | { type: 'presetToggled'; presetId: string }
  | { type: 'presetQueryChanged'; query: string }
  | { type: 'customPromptChanged'; prompt: string }
  | { type: 'preserveIdentityChanged'; preserveIdentity: boolean }
  | { type: 'resultFilterChanged'; filter: ResultGalleryFilter }
  | { type: 'currentBatchChanged'; batchId: string }
  | { type: 'workflowErrorChanged'; error: string | null }
  | { type: 'jobReviewChanged'; jobId: string; reviewStatus: GenerationJob['reviewStatus'] }
  | { type: 'batchStarted'; batch: GenerationBatch; jobs: GenerationJob[] }
  | { type: 'jobUpdated'; job: GenerationJob }
  | { type: 'jobsRequeued'; jobs: GenerationJob[] }
  | { type: 'batchFinished'; batchId: string; canceled?: boolean }
  | { type: 'jobsCleared' }

const sessionHistoryKey = 'visual-foundry:generation-history:v1'

function readSessionHistory(): Pick<WorkspaceState, 'batches' | 'jobs'> {
  if (typeof window === 'undefined') {
    return { batches: [], jobs: [] }
  }

  try {
    const rawHistory = window.sessionStorage.getItem(sessionHistoryKey)
    if (!rawHistory) {
      return { batches: [], jobs: [] }
    }

    const history = JSON.parse(rawHistory) as Partial<Pick<WorkspaceState, 'batches' | 'jobs'>>
    return {
      batches: Array.isArray(history.batches) ? history.batches : [],
      jobs: Array.isArray(history.jobs) ? history.jobs : [],
    }
  } catch {
    return { batches: [], jobs: [] }
  }
}

function createInitialState(): WorkspaceState {
  const history = readSessionHistory()

  return {
    settings: defaultGenerationSettings,
    reference: null,
    referenceError: null,
    selectedPresetIds: defaultSelectedPresetIds,
    presetQuery: '',
    customPrompt: '',
    preserveIdentity: true,
    jobs: history.jobs,
    batches: history.batches,
    currentBatchId: history.batches[0]?.id || null,
    resultFilter: history.batches.length > 0 ? 'current' : 'all',
    workflowError: null,
  }
}

function persistSessionHistory(batches: GenerationBatch[], jobs: GenerationJob[]) {
  try {
    window.sessionStorage.setItem(
      sessionHistoryKey,
      JSON.stringify({
        batches: batches.slice(0, 12),
        jobs: jobs.slice(0, 256),
      }),
    )
  } catch {
    // Session history is a convenience layer; generation should keep working if storage is full.
  }
}

function updateBatch(
  batches: GenerationBatch[],
  batchId: string,
  getNextBatch: (batch: GenerationBatch) => GenerationBatch,
): GenerationBatch[] {
  return batches.map((batch) => (batch.id === batchId ? getNextBatch(batch) : batch))
}

function reducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  if (action.type === 'settingsChanged') {
    return { ...state, settings: action.settings, workflowError: null }
  }

  if (action.type === 'referenceChanged') {
    return { ...state, reference: action.reference, referenceError: null, workflowError: null }
  }

  if (action.type === 'referenceErrorChanged') {
    return { ...state, referenceError: action.error }
  }

  if (action.type === 'presetToggled') {
    const selectedPresetIds = state.selectedPresetIds.includes(action.presetId)
      ? state.selectedPresetIds.filter((presetId) => presetId !== action.presetId)
      : [...state.selectedPresetIds, action.presetId]

    return { ...state, selectedPresetIds, workflowError: null }
  }

  if (action.type === 'presetQueryChanged') {
    return { ...state, presetQuery: action.query }
  }

  if (action.type === 'customPromptChanged') {
    return { ...state, customPrompt: action.prompt }
  }

  if (action.type === 'preserveIdentityChanged') {
    return { ...state, preserveIdentity: action.preserveIdentity }
  }

  if (action.type === 'resultFilterChanged') {
    return { ...state, resultFilter: action.filter }
  }

  if (action.type === 'currentBatchChanged') {
    return { ...state, currentBatchId: action.batchId, resultFilter: 'current' }
  }

  if (action.type === 'workflowErrorChanged') {
    return { ...state, workflowError: action.error }
  }

  if (action.type === 'jobReviewChanged') {
    return {
      ...state,
      jobs: state.jobs.map((job) =>
        job.id === action.jobId ? { ...job, reviewStatus: action.reviewStatus } : job,
      ),
    }
  }

  if (action.type === 'batchStarted') {
    return {
      ...state,
      jobs: [...action.jobs, ...state.jobs],
      batches: [{ ...action.batch, status: 'running', startedAt: Date.now() }, ...state.batches],
      currentBatchId: action.batch.id,
      resultFilter: 'current',
      workflowError: null,
    }
  }

  if (action.type === 'jobUpdated') {
    return { ...state, jobs: replaceJob(state.jobs, action.job) }
  }

  if (action.type === 'jobsRequeued') {
    return {
      ...state,
      jobs: replaceJob(state.jobs, action.jobs),
      batches: updateBatch(state.batches, action.jobs[0]?.batchId || '', (batch) => ({
        ...batch,
        status: 'running',
        completedAt: undefined,
      })),
    }
  }

  if (action.type === 'batchFinished') {
    const batchJobs = getJobsForBatch(state.jobs, action.batchId)

    return {
      ...state,
      batches: updateBatch(state.batches, action.batchId, (batch) => ({
        ...batch,
        status: resolveBatchStatus(batchJobs, action.canceled),
        completedAt: Date.now(),
      })),
    }
  }

  if (action.type === 'jobsCleared') {
    return {
      ...state,
      jobs: [],
      batches: [],
      currentBatchId: null,
      resultFilter: 'all',
      workflowError: null,
    }
  }

  return state
}

function findSelectedPresets(selectedPresetIds: string[]): PromptPreset[] {
  return allPresets.filter((preset) => selectedPresetIds.includes(preset.id))
}

function getFilteredPresets(query: string): PromptPreset[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return allPresets
  }

  return allPresets.filter((preset) => {
    const searchableText = [preset.title, preset.description, ...preset.tags].join(' ').toLowerCase()
    return searchableText.includes(normalizedQuery)
  })
}

export function useGenerationWorkspace() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const { isRunning, runBatch, abortBatch } = useBatchGeneration()

  const filteredPresets = useMemo(() => getFilteredPresets(state.presetQuery), [state.presetQuery])
  const selectedPresets = useMemo(
    () => findSelectedPresets(state.selectedPresetIds),
    [state.selectedPresetIds],
  )
  const currentBatchJobs = useMemo(
    () => getJobsForBatch(state.jobs, state.currentBatchId),
    [state.currentBatchId, state.jobs],
  )
  const activePreset = selectedPresets[0] || null
  const pendingJobsCount = selectedPresets.length * state.settings.itemsPerPreset

  useEffect(() => {
    persistSessionHistory(state.batches, state.jobs)
  }, [state.batches, state.jobs])

  async function startGeneration() {
    if (state.settings.mode === 'image-to-image' && !state.reference) {
      dispatch({ type: 'workflowErrorChanged', error: 'Reference image is required for image-to-image mode.' })
      return
    }

    if (selectedPresets.length === 0) {
      dispatch({ type: 'workflowErrorChanged', error: 'Select at least one preset before generating.' })
      return
    }

    const batchId = crypto.randomUUID()
    const nextJobs = createJobsFromPresets(
      selectedPresets,
      state.settings.itemsPerPreset,
      batchId,
      state.reference?.id,
      (preset) =>
        buildPrompt({
          preset,
          customPrompt: state.customPrompt,
          shouldPreserveIdentity: state.preserveIdentity,
        }),
    )
    const nextBatch = createGenerationBatch(
      selectedPresets,
      nextJobs,
      state.settings.mode,
      state.reference?.id,
    )

    dispatch({ type: 'batchStarted', batch: nextBatch, jobs: nextJobs })

    try {
      await createBatch({
        batch: {
          id: nextBatch.id,
          title: nextBatch.title,
          mode: nextBatch.mode,
          sourceReferenceId: nextBatch.sourceReferenceId,
        },
        jobs: nextJobs.map((job) => ({
          id: job.id,
          presetId: job.presetId,
          presetTitle: job.presetTitle,
          prompt: job.prompt,
        })),
        settings: state.settings,
      })
    } catch (error) {
      dispatch({
        type: 'workflowErrorChanged',
        error: error instanceof Error ? error.message : 'Batch registration failed.',
      })
    }

    await runBatch({
      jobs: nextJobs,
      settings: state.settings,
      reference: state.reference,
      onJobUpdate: (job) => dispatch({ type: 'jobUpdated', job }),
    })

    dispatch({ type: 'batchFinished', batchId })
  }

  async function retryFailedJobs() {
    const failedJobs = currentBatchJobs.filter((job) => job.status === 'failed')

    if (failedJobs.length === 0) {
      return
    }

    const queuedJobs = resetFailedJobs(failedJobs)
    dispatch({ type: 'jobsRequeued', jobs: queuedJobs })

    await runBatch({
      jobs: queuedJobs,
      settings: state.settings,
      reference: state.reference,
      onJobUpdate: (job) => dispatch({ type: 'jobUpdated', job }),
    })

    dispatch({ type: 'batchFinished', batchId: queuedJobs[0].batchId })
  }

  async function retryJob(jobId: string) {
    const failedJob = state.jobs.find((job) => job.id === jobId && job.status === 'failed')

    if (!failedJob) {
      return
    }

    const [queuedJob] = resetFailedJobs([failedJob])
    dispatch({ type: 'jobsRequeued', jobs: [queuedJob] })

    await runBatch({
      jobs: [queuedJob],
      settings: state.settings,
      reference: state.reference,
      onJobUpdate: (job) => dispatch({ type: 'jobUpdated', job }),
    })

    dispatch({ type: 'batchFinished', batchId: queuedJob.batchId })
  }

  function cancelGeneration() {
    abortBatch()

    if (state.currentBatchId) {
      dispatch({ type: 'batchFinished', batchId: state.currentBatchId, canceled: true })
    }
  }

  return {
    ...state,
    activePreset,
    currentBatchJobs,
    filteredPresets,
    isRunning,
    pendingJobsCount,
    selectedPresets,
    setSettings: (settings: BatchGenerationSettings) => dispatch({ type: 'settingsChanged', settings }),
    setReference: (reference: UploadedReference | null) => dispatch({ type: 'referenceChanged', reference }),
    setReferenceError: (error: string | null) => dispatch({ type: 'referenceErrorChanged', error }),
    setPresetQuery: (query: string) => dispatch({ type: 'presetQueryChanged', query }),
    setCustomPrompt: (prompt: string) => dispatch({ type: 'customPromptChanged', prompt }),
    setPreserveIdentity: (preserveIdentity: boolean) =>
      dispatch({ type: 'preserveIdentityChanged', preserveIdentity }),
    setResultFilter: (filter: ResultGalleryFilter) => dispatch({ type: 'resultFilterChanged', filter }),
    setCurrentBatchId: (batchId: string) => dispatch({ type: 'currentBatchChanged', batchId }),
    togglePreset: (presetId: string) => dispatch({ type: 'presetToggled', presetId }),
    setJobReviewStatus: (jobId: string, reviewStatus: GenerationJob['reviewStatus']) =>
      dispatch({ type: 'jobReviewChanged', jobId, reviewStatus }),
    startGeneration,
    retryFailedJobs,
    retryJob,
    cancelGeneration,
    clearJobs: () => dispatch({ type: 'jobsCleared' }),
  }
}
