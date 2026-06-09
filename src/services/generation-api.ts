import type {
  ApiResult,
  CreateBatchRequest,
  CreateBatchResponse,
  GenerateImageRequest,
  GenerateImageResponse,
} from '../types/generation'

export async function generateImage(
  request: GenerateImageRequest,
  signal?: AbortSignal,
): Promise<GenerateImageResponse> {
  const response = await fetch('/api/generations/image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    signal,
  })

  const payload = (await response.json()) as ApiResult<GenerateImageResponse>

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error || '图片生成失败。')
  }

  return payload.data
}

export async function createBatch(request: CreateBatchRequest): Promise<CreateBatchResponse> {
  const response = await fetch('/api/generations/batches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  const payload = (await response.json()) as ApiResult<CreateBatchResponse>

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error || '批次创建失败。')
  }

  return payload.data
}

export async function getBatch(batchId: string): Promise<CreateBatchResponse> {
  const response = await fetch(`/api/generations/batches/${batchId}`)
  const payload = (await response.json()) as ApiResult<CreateBatchResponse>

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error || '批次查询失败。')
  }

  return payload.data
}
