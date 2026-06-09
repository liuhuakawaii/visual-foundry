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

type ProviderErrorCode = 'configuration' | 'rate_limited' | 'provider_failed' | 'invalid_image' | 'timeout'

interface ParsedProviderBody {
  payload: OpenAIImageResponse | null
  rawText: string
}

export class ImageProviderError extends Error {
  code: ProviderErrorCode
  status: number

  constructor(message: string, code: ProviderErrorCode, status = 502) {
    super(message)
    this.name = 'ImageProviderError'
    this.code = code
    this.status = status
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

function compactProviderText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, 180)
}

async function parseProviderBody(response: Response): Promise<ParsedProviderBody> {
  const rawText = await response.text()

  if (!rawText.trim()) {
    return {
      payload: null,
      rawText,
    }
  }

  try {
    return {
      payload: JSON.parse(rawText) as OpenAIImageResponse,
      rawText,
    }
  } catch {
    return {
      payload: null,
      rawText,
    }
  }
}

function getProviderErrorMessage(payload: OpenAIImageResponse | null): string | undefined {
  const message = payload?.error?.message?.trim()
  return message || undefined
}

function createInvalidProviderResponseMessage(response: Response, rawText: string): string {
  const contentType = response.headers.get('content-type')
  const contentTypeSuffix = contentType ? ` (${contentType})` : ''
  const bodySnippet = compactProviderText(rawText)

  if (bodySnippet) {
    return `Image provider returned a non-JSON response${contentTypeSuffix}: ${bodySnippet}`
  }

  return `Image provider returned an empty response${contentTypeSuffix}.`
}

async function parseProviderResponse(
  response: Response,
  outputFormat: WorkerGenerateImageRequest['outputFormat'],
): Promise<WorkerGenerateImageResponse> {
  const { payload, rawText } = await parseProviderBody(response)
  const providerErrorMessage = getProviderErrorMessage(payload)
  const invalidResponseMessage = payload ? undefined : createInvalidProviderResponseMessage(response, rawText)

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new ImageProviderError(
        providerErrorMessage || invalidResponseMessage || 'Image provider rejected the configured credentials.',
        'configuration',
        response.status,
      )
    }

    if (response.status === 408 || response.status === 504) {
      throw new ImageProviderError(
        providerErrorMessage || invalidResponseMessage || 'Image provider timed out.',
        'timeout',
        response.status,
      )
    }

    if (response.status === 413 || response.status === 415) {
      throw new ImageProviderError(
        providerErrorMessage || invalidResponseMessage || 'Image provider rejected the reference image.',
        'invalid_image',
        response.status,
      )
    }

    if (response.status === 429) {
      throw new ImageProviderError(
        providerErrorMessage || invalidResponseMessage || 'Image provider rate limit reached.',
        'rate_limited',
        response.status,
      )
    }

    throw new ImageProviderError(
      providerErrorMessage || invalidResponseMessage || `Image provider failed with HTTP ${response.status}.`,
      'provider_failed',
      response.status,
    )
  }

  if (!payload) {
    throw new ImageProviderError(
      invalidResponseMessage || 'Image provider returned an unreadable response.',
      'provider_failed',
    )
  }

  const firstImage = payload.data?.[0]
  if (!firstImage) {
    throw new Error('Image provider returned no image.')
  }

  if (firstImage.b64_json) {
    return {
      imageUrl: imageResponseToDataUrl(firstImage.b64_json, outputMimeTypeByFormat[outputFormat]),
      revisedPrompt: firstImage.revised_prompt,
      providerTraceId: response.headers.get('x-request-id') || undefined,
    }
  }

  if (firstImage.url) {
    return {
      imageUrl: firstImage.url,
      revisedPrompt: firstImage.revised_prompt,
      providerTraceId: response.headers.get('x-request-id') || undefined,
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
      throw new ImageProviderError('Image-to-image generation requires a reference image.', 'invalid_image', 400)
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
