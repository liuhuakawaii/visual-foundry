import assert from 'node:assert/strict'
import test from 'node:test'
import { createGenerationBatch, createJobsFromPresets, countJobsByStatus, resolveBatchStatus } from '../src/lib/jobs.ts'
import { buildPrompt } from '../src/lib/prompt-builder.ts'
import { validateCreateBatchRequest, validateGenerateImageRequest } from '../src/lib/generation-schema.ts'
import {
  createPersistableGenerationSettings,
  mergePersistedGenerationSettings,
} from '../src/lib/generation-settings-storage.ts'
import { defaultLocale, messages } from '../src/i18n/messages.ts'
import type { BatchGenerationSettings, PromptPreset } from '../src/types/generation.ts'

const preset: PromptPreset = {
  id: 'studio-portrait',
  title: 'Studio portrait',
  category: 'children-portrait',
  description: 'Soft studio portrait.',
  mode: 'image-to-image',
  tags: ['studio'],
  prompt: 'Create a soft studio portrait.',
  negativePrompt: 'text, watermark',
  identityGuidance: 'Preserve identity.',
  recommendedSize: '1024x1536',
  recommendedQuality: 'high',
}

const fallbackGenerationSettings: BatchGenerationSettings = {
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

test('buildPrompt combines identity, preset, custom text, guardrails, and negative prompt', () => {
  const prompt = buildPrompt({
    preset,
    customPrompt: 'Use soft window light.',
    shouldPreserveIdentity: true,
  })

  assert.match(prompt, /Preserve identity/)
  assert.match(prompt, /Create a soft studio portrait/)
  assert.match(prompt, /Use soft window light/)
  assert.match(prompt, /Negative constraints: text, watermark/)
})

test('createJobsFromPresets attaches batch metadata and status defaults', () => {
  const jobs = createJobsFromPresets([preset], 2, 'batch-1', 'reference-1', () => 'prompt')

  assert.equal(jobs.length, 2)
  assert.equal(jobs[0].batchId, 'batch-1')
  assert.equal(jobs[0].sourceReferenceId, 'reference-1')
  assert.equal(jobs[0].retryCount, 0)
  assert.equal(jobs[0].status, 'queued')
})

test('countJobsByStatus and resolveBatchStatus summarize mixed outcomes', () => {
  const jobs = createJobsFromPresets([preset], 2, 'batch-1', undefined, () => 'prompt')
  const completedJob = { ...jobs[0], status: 'completed' as const }
  const failedJob = { ...jobs[1], status: 'failed' as const }

  assert.deepEqual(countJobsByStatus([completedJob, failedJob]), {
    queued: 0,
    running: 0,
    completed: 1,
    failed: 1,
  })
  assert.equal(resolveBatchStatus([completedJob, failedJob]), 'partially_failed')
})

test('createGenerationBatch records preset and job links', () => {
  const jobs = createJobsFromPresets([preset], 1, 'batch-1', 'reference-1', () => 'prompt')
  const batch = createGenerationBatch([preset], jobs, 'image-to-image', 'reference-1')

  assert.equal(batch.id, 'batch-1')
  assert.equal(batch.mode, 'image-to-image')
  assert.deepEqual(batch.presetIds, ['studio-portrait'])
  assert.deepEqual(batch.jobIds, [jobs[0].id])
})

test('i18n defaults to zh-CN and keeps locale dictionaries aligned', () => {
  const zhKeys = Object.keys(messages['zh-CN']).sort()
  const enKeys = Object.keys(messages['en-US']).sort()

  assert.equal(defaultLocale, 'zh-CN')
  assert.deepEqual(enKeys, zhKeys)
  assert.equal(messages['zh-CN']['production.start'], '\u5f00\u59cb\u6279\u91cf\u751f\u6210')
})

test('validateGenerateImageRequest rejects missing reference image for image-to-image', () => {
  const result = validateGenerateImageRequest({
    mode: 'image-to-image',
    prompt: 'prompt',
    size: '1024x1024',
    quality: 'high',
    outputFormat: 'png',
  })

  assert.equal(result.success, false)
  assert.match(result.error || '', /reference image/i)
})

test('validateGenerateImageRequest accepts text-to-image request', () => {
  const result = validateGenerateImageRequest({
    mode: 'text-to-image',
    prompt: 'prompt',
    size: '1024x1024',
    quality: 'high',
    outputFormat: 'png',
    provider: {
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-image-1.5',
    },
  })

  assert.equal(result.success, true)
  assert.equal(result.data?.mode, 'text-to-image')
})

test('validateCreateBatchRequest accepts bounded batch metadata', () => {
  const result = validateCreateBatchRequest({
    batch: {
      id: 'batch-1',
      title: 'Batch',
      mode: 'text-to-image',
    },
    jobs: [
      {
        id: 'job-1',
        presetId: 'preset-1',
        presetTitle: 'Preset',
        prompt: 'prompt',
      },
    ],
    settings: {
      mode: 'text-to-image',
      outputSize: '1024x1024',
      quality: 'high',
      outputFormat: 'png',
      itemsPerPreset: 1,
      concurrency: 1,
      provider: {
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-image-1.5',
      },
    },
  })

  assert.equal(result.success, true)
  assert.equal(result.data?.jobs.length, 1)
})

test('generation settings persistence keeps provider model and strips API keys', () => {
  const persistedSettings = createPersistableGenerationSettings({
    ...fallbackGenerationSettings,
    provider: {
      baseUrl: 'https://api-cn.hi-code.cc/v1',
      model: 'gpt-image-2',
      apiKey: 'secret-key',
    },
  })

  assert.equal(persistedSettings.provider.baseUrl, 'https://api-cn.hi-code.cc/v1')
  assert.equal(persistedSettings.provider.model, 'gpt-image-2')
  assert.equal('apiKey' in persistedSettings.provider, false)

  const mergedSettings = mergePersistedGenerationSettings(
    {
      ...persistedSettings,
      provider: {
        ...persistedSettings.provider,
        apiKey: 'should-not-restore',
      },
    },
    fallbackGenerationSettings,
  )

  assert.equal(mergedSettings.provider.model, 'gpt-image-2')
  assert.equal(mergedSettings.provider.apiKey, '')
})
