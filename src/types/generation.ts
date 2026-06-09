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

export interface GenerationJob {
  id: string
  presetId: string
  presetTitle: string
  prompt: string
  status: GenerationStatus
  createdAt: number
  startedAt?: number
  completedAt?: number
  imageUrl?: string
  error?: string
}

export interface GenerateImageRequest {
  mode: GenerationMode
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
}

export interface ApiResult<T> {
  success: boolean
  data?: T
  error?: string
}
