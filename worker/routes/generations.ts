import { Hono } from 'hono'
import { validateCreateBatchRequest, validateGenerateImageRequest } from '../../src/lib/generation-schema'
import type {
  ApiResult,
  CreateBatchResponse,
  GenerateImageResponse,
} from '../../src/types/generation'
import type { Env, ImageProviderConfig, WorkerGenerateImageRequest } from '../types'
import { ImageProviderError, generateImageWithProvider } from '../services/image-provider'

const generations = new Hono<{ Bindings: Env }>()

const inMemoryBatchStatuses = new Map<string, CreateBatchResponse>()

function resolveProviderConfig(c: { env: Env }, request: WorkerGenerateImageRequest): ImageProviderConfig {
  const baseUrl =
    request.provider?.baseUrl?.trim() ||
    c.env.IMAGE_API_BASE_URL ||
    'https://api.openai.com/v1'

  const apiKey = request.provider?.apiKey?.trim() || c.env.IMAGE_API_KEY
  const model = request.provider?.model?.trim() || c.env.IMAGE_MODEL || 'gpt-image-1.5'

  if (!apiKey) {
    throw new ImageProviderError(
      'Missing image generation API key. Configure IMAGE_API_KEY or pass a temporary key for this request.',
      'configuration',
      400,
    )
  }

  return {
    baseUrl,
    apiKey,
    model,
  }
}

function getErrorStatus(error: unknown): 400 | 401 | 403 | 408 | 413 | 415 | 429 | 502 | 504 {
  if (error instanceof ImageProviderError) {
    if (
      error.status === 400 ||
      error.status === 401 ||
      error.status === 403 ||
      error.status === 408 ||
      error.status === 413 ||
      error.status === 415 ||
      error.status === 429 ||
      error.status === 504
    ) {
      return error.status
    }

    return 502
  }

  return 400
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Image generation failed.'
}

generations.post('/image', async (c) => {
  try {
    const body = await c.req.json()
    const requestResult = validateGenerateImageRequest(body)

    if (!requestResult.success || !requestResult.data) {
      return c.json<ApiResult<GenerateImageResponse>>(
        {
          success: false,
          error: requestResult.error || 'Invalid image generation request.',
        },
        400,
      )
    }

    const providerConfig = resolveProviderConfig(c, requestResult.data)
    const result = await generateImageWithProvider(requestResult.data, providerConfig)

    return c.json<ApiResult<GenerateImageResponse>>({
      success: true,
      data: result,
    })
  } catch (error) {
    return c.json<ApiResult<GenerateImageResponse>>(
      {
        success: false,
        error: getErrorMessage(error),
      },
      getErrorStatus(error),
    )
  }
})

generations.post('/batches', async (c) => {
  const body = await c.req.json()
  const requestResult = validateCreateBatchRequest(body)

  if (!requestResult.success || !requestResult.data) {
    return c.json<ApiResult<CreateBatchResponse>>(
      {
        success: false,
        error: requestResult.error || 'Invalid batch request.',
      },
      400,
    )
  }

  const response: CreateBatchResponse = {
    batchId: requestResult.data.batch.id,
    status: 'draft',
    acceptedJobs: requestResult.data.jobs.length,
  }

  inMemoryBatchStatuses.set(response.batchId, response)

  return c.json<ApiResult<CreateBatchResponse>>({
    success: true,
    data: response,
  })
})

generations.get('/batches/:batchId', (c) => {
  const batchId = c.req.param('batchId')
  const batch = inMemoryBatchStatuses.get(batchId)

  if (!batch) {
    return c.json<ApiResult<CreateBatchResponse>>(
      {
        success: false,
        error: 'Batch status is not available in this runtime. Persist it with D1 in the next phase.',
      },
      404,
    )
  }

  return c.json<ApiResult<CreateBatchResponse>>({
    success: true,
    data: batch,
  })
})

generations.post('/batches/:batchId/retry-failed', (c) => {
  const batchId = c.req.param('batchId')
  const batch = inMemoryBatchStatuses.get(batchId)

  if (!batch) {
    return c.json<ApiResult<CreateBatchResponse>>(
      {
        success: false,
        error: 'Batch retry requires durable job storage. Add D1 and Queues before enabling server retries.',
      },
      404,
    )
  }

  const response: CreateBatchResponse = {
    ...batch,
    status: 'running',
  }
  inMemoryBatchStatuses.set(batchId, response)

  return c.json<ApiResult<CreateBatchResponse>>({
    success: true,
    data: response,
  })
})

generations.post('/batches/:batchId/cancel', (c) => {
  const batchId = c.req.param('batchId')
  const batch = inMemoryBatchStatuses.get(batchId)

  if (!batch) {
    return c.json<ApiResult<CreateBatchResponse>>(
      {
        success: false,
        error: 'Batch cancel requires durable job storage. Add D1 and Queues before enabling server cancellation.',
      },
      404,
    )
  }

  const response: CreateBatchResponse = {
    ...batch,
    status: 'canceled',
  }
  inMemoryBatchStatuses.set(batchId, response)

  return c.json<ApiResult<CreateBatchResponse>>({
    success: true,
    data: response,
  })
})

export default generations
