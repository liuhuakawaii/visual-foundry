import type {
  CreateBatchRequest,
  CreateBatchResponse,
  GenerateImageRequest,
  GenerateImageResponse,
} from '../src/types/generation'

export interface Env {
  ASSETS: Fetcher
  IMAGE_API_BASE_URL?: string
  IMAGE_API_KEY?: string
  IMAGE_MODEL?: string
}

export interface ImageProviderConfig {
  baseUrl: string
  apiKey: string
  model: string
}

export type WorkerGenerateImageRequest = GenerateImageRequest
export type WorkerGenerateImageResponse = GenerateImageResponse
export type WorkerCreateBatchRequest = CreateBatchRequest
export type WorkerCreateBatchResponse = CreateBatchResponse
