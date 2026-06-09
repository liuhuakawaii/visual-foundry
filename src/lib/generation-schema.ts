import type {
  BatchGenerationSettings,
  BatchRequestJob,
  CreateBatchRequest,
  GenerateImageRequest,
  GenerationMode,
  OutputFormat,
  OutputQuality,
  OutputSize,
} from '../types/generation'

const generationModes: GenerationMode[] = ['text-to-image', 'image-to-image']
const outputSizes: OutputSize[] = ['1024x1024', '1024x1536', '1536x1024']
const outputQualities: OutputQuality[] = ['auto', 'high', 'medium', 'low']
const outputFormats: OutputFormat[] = ['png', 'jpeg', 'webp']

const maxPromptLength = 8_000
const maxProviderFieldLength = 500
const maxBatchJobs = 32

export interface ValidationResult<T> {
  success: boolean
  data?: T
  error?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string'
}

function isOneOf<TValue extends string>(value: unknown, options: readonly TValue[]): value is TValue {
  return typeof value === 'string' && options.includes(value as TValue)
}

function isSafePositiveInteger(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && Number(value) >= min && Number(value) <= max
}

function validateProvider(provider: unknown) {
  if (provider === undefined) {
    return { success: true as const, data: undefined }
  }

  if (!isRecord(provider)) {
    return { success: false as const, error: 'Provider config must be an object.' }
  }

  const { baseUrl, apiKey, model } = provider

  for (const [fieldName, value] of [
    ['baseUrl', baseUrl],
    ['apiKey', apiKey],
    ['model', model],
  ] as const) {
    if (!isOptionalString(value)) {
      return { success: false as const, error: `${fieldName} must be a string.` }
    }

    if (typeof value === 'string' && value.length > maxProviderFieldLength) {
      return { success: false as const, error: `${fieldName} is too long.` }
    }
  }

  return {
    success: true as const,
    data: {
      baseUrl: typeof baseUrl === 'string' ? baseUrl.trim() : undefined,
      apiKey: typeof apiKey === 'string' ? apiKey.trim() : undefined,
      model: typeof model === 'string' ? model.trim() : undefined,
    },
  }
}

function validateGenerationSettings(value: unknown): ValidationResult<BatchGenerationSettings> {
  if (!isRecord(value)) {
    return { success: false, error: 'Generation settings must be an object.' }
  }

  if (!isOneOf(value.mode, generationModes)) {
    return { success: false, error: 'Unsupported generation mode.' }
  }

  if (!isOneOf(value.outputSize, outputSizes)) {
    return { success: false, error: 'Unsupported output size.' }
  }

  if (!isOneOf(value.quality, outputQualities)) {
    return { success: false, error: 'Unsupported output quality.' }
  }

  if (!isOneOf(value.outputFormat, outputFormats)) {
    return { success: false, error: 'Unsupported output format.' }
  }

  if (!isSafePositiveInteger(value.itemsPerPreset, 1, 4)) {
    return { success: false, error: 'Items per preset must be between 1 and 4.' }
  }

  if (!isSafePositiveInteger(value.concurrency, 1, 4)) {
    return { success: false, error: 'Concurrency must be between 1 and 4.' }
  }

  const providerResult = validateProvider(value.provider)
  if (!providerResult.success) {
    return { success: false, error: providerResult.error }
  }

  return {
    success: true,
    data: {
      mode: value.mode,
      outputSize: value.outputSize,
      quality: value.quality,
      outputFormat: value.outputFormat,
      itemsPerPreset: value.itemsPerPreset,
      concurrency: value.concurrency,
      provider: {
        baseUrl: providerResult.data?.baseUrl || '',
        apiKey: providerResult.data?.apiKey,
        model: providerResult.data?.model || '',
      },
    },
  }
}

export function validateGenerateImageRequest(value: unknown): ValidationResult<GenerateImageRequest> {
  if (!isRecord(value)) {
    return { success: false, error: 'Request body must be an object.' }
  }

  if (!isOneOf(value.mode, generationModes)) {
    return { success: false, error: 'Unsupported generation mode.' }
  }

  if (!isNonEmptyString(value.prompt)) {
    return { success: false, error: 'Prompt is required.' }
  }

  if (value.prompt.length > maxPromptLength) {
    return { success: false, error: 'Prompt is too long.' }
  }

  if (!isOneOf(value.size, outputSizes)) {
    return { success: false, error: 'Unsupported output size.' }
  }

  if (!isOneOf(value.quality, outputQualities)) {
    return { success: false, error: 'Unsupported output quality.' }
  }

  if (!isOneOf(value.outputFormat, outputFormats)) {
    return { success: false, error: 'Unsupported output format.' }
  }

  if (value.mode === 'image-to-image') {
    if (!isRecord(value.image)) {
      return { success: false, error: 'Image-to-image mode requires a reference image.' }
    }

    if (!isNonEmptyString(value.image.dataUrl) || !isNonEmptyString(value.image.fileName)) {
      return { success: false, error: 'Reference image data is incomplete.' }
    }
  }

  const providerResult = validateProvider(value.provider)
  if (!providerResult.success) {
    return { success: false, error: providerResult.error }
  }

  return {
    success: true,
    data: {
      mode: value.mode,
      batchId: typeof value.batchId === 'string' ? value.batchId : undefined,
      jobId: typeof value.jobId === 'string' ? value.jobId : undefined,
      prompt: value.prompt.trim(),
      image:
        value.mode === 'image-to-image' && isRecord(value.image)
          ? {
              dataUrl: String(value.image.dataUrl),
              fileName: String(value.image.fileName),
            }
          : undefined,
      size: value.size,
      quality: value.quality,
      outputFormat: value.outputFormat,
      provider: providerResult.data,
    },
  }
}

function parseBatchJob(value: unknown): BatchRequestJob | null {
  if (!isRecord(value)) {
    return null
  }

  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.presetId) ||
    !isNonEmptyString(value.presetTitle) ||
    !isNonEmptyString(value.prompt)
  ) {
    return null
  }

  return {
    id: value.id.trim(),
    presetId: value.presetId.trim(),
    presetTitle: value.presetTitle.trim(),
    prompt: value.prompt.trim(),
  }
}

export function validateCreateBatchRequest(value: unknown): ValidationResult<CreateBatchRequest> {
  if (!isRecord(value) || !isRecord(value.batch)) {
    return { success: false, error: 'Batch request must include a batch object.' }
  }

  if (!isNonEmptyString(value.batch.id) || !isNonEmptyString(value.batch.title)) {
    return { success: false, error: 'Batch id and title are required.' }
  }

  if (!isOneOf(value.batch.mode, generationModes)) {
    return { success: false, error: 'Unsupported batch generation mode.' }
  }

  if (!Array.isArray(value.jobs) || value.jobs.length === 0 || value.jobs.length > maxBatchJobs) {
    return { success: false, error: `Batch must include between 1 and ${maxBatchJobs} jobs.` }
  }

  const settingsResult = validateGenerationSettings(value.settings)
  if (!settingsResult.success || !settingsResult.data) {
    return { success: false, error: settingsResult.error }
  }

  const jobs = value.jobs.map(parseBatchJob)
  if (jobs.some((job) => job === null)) {
    return { success: false, error: 'Every batch job must include id, presetId, presetTitle, and prompt.' }
  }

  return {
    success: true,
    data: {
      batch: {
        id: value.batch.id.trim(),
        title: value.batch.title.trim(),
        mode: value.batch.mode,
        sourceReferenceId:
          typeof value.batch.sourceReferenceId === 'string' ? value.batch.sourceReferenceId.trim() : undefined,
      },
      jobs: jobs as BatchRequestJob[],
      settings: settingsResult.data,
    },
  }
}
