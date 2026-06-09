import type {
  ImageProviderConfig,
  WorkerGenerateImageRequest,
  WorkerGenerateImageResponse,
} from '../types'
import { imageResponseToDataUrl, parseDataUrl } from '../lib/data-url'

interface OpenAIImageResponse {
  data?: Array<{
    b64_json?: string
    url?: string
    revised_prompt?: string
  }>
  error?: {
    message?: string
  }
}

const outputMimeTypeByFormat: Record<WorkerGenerateImageRequest['outputFormat'], string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

function resolveEndpoint(baseUrl: string, mode: WorkerGenerateImageRequest['mode']): string {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
  const path = mode === 'image-to-image' ? '/images/edits' : '/images/generations'
  return `${normalizedBaseUrl}${path}`
}

function appendOptionalFields(
  formData: FormData,
  request: WorkerGenerateImageRequest,
  model: string,
) {
  formData.set('model', model)
  formData.set('prompt', request.prompt)
  formData.set('size', request.size)
  formData.set('quality', request.quality)
  formData.set('output_format', request.outputFormat)
}

function createJsonPayload(request: WorkerGenerateImageRequest, model: string) {
  return {
    model,
    prompt: request.prompt,
    size: request.size,
    quality: request.quality,
    output_format: request.outputFormat,
  }
}

async function parseProviderResponse(
  response: Response,
  outputFormat: WorkerGenerateImageRequest['outputFormat'],
): Promise<WorkerGenerateImageResponse> {
  const payload = (await response.json()) as OpenAIImageResponse

  if (!response.ok) {
    throw new Error(payload.error?.message || `Image provider failed with HTTP ${response.status}.`)
  }

  const firstImage = payload.data?.[0]
  if (!firstImage) {
    throw new Error('Image provider returned no image.')
  }

  if (firstImage.b64_json) {
    return {
      imageUrl: imageResponseToDataUrl(firstImage.b64_json, outputMimeTypeByFormat[outputFormat]),
      revisedPrompt: firstImage.revised_prompt,
    }
  }

  if (firstImage.url) {
    return {
      imageUrl: firstImage.url,
      revisedPrompt: firstImage.revised_prompt,
    }
  }

  throw new Error('Image provider response did not include b64_json or url.')
}

export async function generateImageWithProvider(
  request: WorkerGenerateImageRequest,
  config: ImageProviderConfig,
): Promise<WorkerGenerateImageResponse> {
  const endpoint = resolveEndpoint(config.baseUrl, request.mode)

  if (request.mode === 'image-to-image') {
    if (!request.image) {
      throw new Error('Image-to-image generation requires a reference image.')
    }

    const referenceFile = parseDataUrl(request.image.dataUrl)
    const formData = new FormData()
    appendOptionalFields(formData, request, config.model)
    formData.set(
      'image',
      new Blob([referenceFile.bytes], { type: referenceFile.mimeType }),
      request.image.fileName,
    )

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: formData,
    })

    return parseProviderResponse(response, request.outputFormat)
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createJsonPayload(request, config.model)),
  })

  return parseProviderResponse(response, request.outputFormat)
}
