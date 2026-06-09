import { Hono } from 'hono'
import type { Env, WorkerGenerateImageRequest } from '../types'
import { generateImageWithProvider } from '../services/image-provider'

const generations = new Hono<{ Bindings: Env }>()

function resolveProviderConfig(c: { env: Env }, request: WorkerGenerateImageRequest) {
  const baseUrl =
    request.provider?.baseUrl?.trim() ||
    c.env.IMAGE_API_BASE_URL ||
    'https://api.openai.com/v1'

  const apiKey = request.provider?.apiKey?.trim() || c.env.IMAGE_API_KEY
  const model = request.provider?.model?.trim() || c.env.IMAGE_MODEL || 'gpt-image-1.5'

  if (!apiKey) {
    throw new Error('缺少图片生成 API Key。请在 Cloudflare secret 中设置 IMAGE_API_KEY，或在本次请求配置中临时填写。')
  }

  return {
    baseUrl,
    apiKey,
    model,
  }
}

generations.post('/image', async (c) => {
  try {
    const request = (await c.req.json()) as WorkerGenerateImageRequest
    const providerConfig = resolveProviderConfig(c, request)
    const result = await generateImageWithProvider(request, providerConfig)

    return c.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '图片生成失败。',
      },
      400,
    )
  }
})

export default generations
