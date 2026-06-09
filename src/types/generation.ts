export type GenerationMode = 'text-to-image' | 'image-to-image'

export type OutputSize = '1024x1024' | '1024x1536' | '1536x1024'

export type OutputQuality = 'auto' | 'high' | 'medium' | 'low'

export type OutputFormat = 'png' | 'jpeg' | 'webp'

export type PresetCategory =
  | 'children-portrait'
  | 'product'
  | 'avatar'
  | 'campaign'
  | 'editorial'
  | 'custom'

export type BatchStatus = 'draft' | 'running' | 'completed' | 'partially_failed' | 'failed' | 'canceled'

export type ReviewStatus = 'unreviewed' | 'selected' | 'rejected'

export type ResultGalleryFilter = 'current' | 'all' | 'selected' | 'rejected' | GenerationStatus

export interface PromptPreset {
  id: string
  title: string
  category: PresetCategory
  description: string
  mode: GenerationMode
  tags: string[]
  prompt: string
  negativePrompt: string
  identityGuidance?: string
  recommendedSize: OutputSize
  recommendedQuality: OutputQuality
}

export interface PresetPack {
  id: string
  title: string
  description: string
  category: PresetCategory
  audience?: string
  recommendedInputs?: string[]
  qualityGuidelines?: string[]
  presets: PromptPreset[]
}

export interface RuntimeProviderConfig {
  baseUrl: string
  apiKey?: string
  model: string
}

export interface BatchGenerationSettings {
  mode: GenerationMode
  outputSize: OutputSize
  quality: OutputQuality
  outputFormat: OutputFormat
  itemsPerPreset: number
  concurrency: number
  provider: RuntimeProviderConfig
}

export interface UploadedReference {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
}

export type GenerationStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface GenerationBatch {
  id: string
  title: string
  status: BatchStatus
  mode: GenerationMode
  presetIds: string[]
  jobIds: string[]
  sourceReferenceId?: string
  createdAt: number
  startedAt?: number
  completedAt?: number
}

export interface GenerationJob {
  id: string
  batchId: string
  presetId: string
  presetTitle: string
  prompt: string
  status: GenerationStatus
  createdAt: number
  startedAt?: number
  completedAt?: number
  imageUrl?: string
  revisedPrompt?: string
  durationMs?: number
  retryCount: number
  sourceReferenceId?: string
  providerTraceId?: string
  reviewStatus?: ReviewStatus
  error?: string
}

export interface GenerateImageRequest {
  mode: GenerationMode
  batchId?: string
  jobId?: string
  prompt: string
  image?: {
    dataUrl: string
    fileName: string
  }
  size: OutputSize
  quality: OutputQuality
  outputFormat: OutputFormat
  provider?: Partial<RuntimeProviderConfig>
}

export interface GenerateImageResponse {
  imageUrl: string
  revisedPrompt?: string
  providerTraceId?: string
}

export interface BatchRequestJob {
  id: string
  presetId: string
  presetTitle: string
  prompt: string
}

export interface CreateBatchRequest {
  batch: {
    id: string
    title: string
    mode: GenerationMode
    sourceReferenceId?: string
  }
  jobs: BatchRequestJob[]
  settings: Omit<BatchGenerationSettings, 'provider'> & {
    provider?: Partial<RuntimeProviderConfig>
  }
}

export interface CreateBatchResponse {
  batchId: string
  status: BatchStatus
  acceptedJobs: number
}

export interface ApiResult<T> {
  success: boolean
  data?: T
  error?: string
}
