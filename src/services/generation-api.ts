import type {
  ApiResult,
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
