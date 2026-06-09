import assert from 'node:assert/strict'
import test from 'node:test'

test('worker health endpoint returns service status', async () => {
  const app = (await import('../dist/visual_foundry/index.js')).default
  const response = await app.fetch(new Request('https://visual-foundry.test/api/health'))
  const payload = await response.json()

  assert.equal(response.status, 200)
  assert.equal(payload.success, true)
  assert.equal(payload.data.status, 'ok')
})

test('worker image endpoint rejects missing key before provider fetch', async () => {
  const app = (await import('../dist/visual_foundry/index.js')).default
  const response = await app.fetch(
    new Request('https://visual-foundry.test/api/generations/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'text-to-image',
        prompt: 'Create a studio image.',
        size: '1024x1024',
        quality: 'high',
        outputFormat: 'png',
      }),
    }),
    {
      ASSETS: {} as Fetcher,
    },
  )
  const payload = await response.json()

  assert.equal(response.status, 400)
  assert.equal(payload.success, false)
  assert.match(payload.error, /API key/i)
})

test('worker image endpoint validates image-to-image reference requirement', async () => {
  const app = (await import('../dist/visual_foundry/index.js')).default
  const response = await app.fetch(
    new Request('https://visual-foundry.test/api/generations/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'image-to-image',
        prompt: 'Create a studio image.',
        size: '1024x1024',
        quality: 'high',
        outputFormat: 'png',
        provider: {
          apiKey: 'test-key',
        },
      }),
    }),
    {
      ASSETS: {} as Fetcher,
    },
  )
  const payload = await response.json()

  assert.equal(response.status, 400)
  assert.equal(payload.success, false)
  assert.match(payload.error, /reference image/i)
})

test('worker image endpoint reports provider HTML errors as JSON', async () => {
  const app = (await import('../dist/visual_foundry/index.js')).default
  const originalFetch = globalThis.fetch

  globalThis.fetch = async () =>
    new Response('<html><h1>provider html failure</h1></html>', {
      status: 400,
      headers: {
        'Content-Type': 'text/html',
      },
    })

  try {
    const response = await app.fetch(
      new Request('https://visual-foundry.test/api/generations/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'text-to-image',
          prompt: 'Create a studio image.',
          size: '1024x1024',
          quality: 'high',
          outputFormat: 'png',
          provider: {
            apiKey: 'test-key',
          },
        }),
      }),
      {
        ASSETS: {} as Fetcher,
      },
    )
    const payload = await response.json()

    assert.equal(response.status, 400)
    assert.equal(payload.success, false)
    assert.match(payload.error, /non-JSON response/i)
    assert.match(payload.error, /provider html failure/i)
    assert.doesNotMatch(payload.error, /Unexpected token/i)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('worker batch endpoint accepts batch contract and exposes lookup', async () => {
  const app = (await import('../dist/visual_foundry/index.js')).default
  const createResponse = await app.fetch(
    new Request('https://visual-foundry.test/api/generations/batches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        batch: {
          id: 'batch-test',
          title: 'Batch test',
          mode: 'text-to-image',
        },
        jobs: [
          {
            id: 'job-test',
            presetId: 'preset-test',
            presetTitle: 'Preset test',
            prompt: 'prompt',
          },
        ],
        settings: {
          mode: 'text-to-image',
          outputSize: '1024x1024',
          quality: 'high',
          outputFormat: 'png',
          itemsPerPreset: 1,
          concurrency: 1,
          provider: {
            baseUrl: 'https://api.openai.com/v1',
            model: 'gpt-image-1.5',
          },
        },
      }),
    }),
  )
  const createPayload = await createResponse.json()
  const lookupResponse = await app.fetch(
    new Request('https://visual-foundry.test/api/generations/batches/batch-test'),
  )
  const lookupPayload = await lookupResponse.json()

  assert.equal(createResponse.status, 200)
  assert.equal(createPayload.data.acceptedJobs, 1)
  assert.equal(lookupResponse.status, 200)
  assert.equal(lookupPayload.data.batchId, 'batch-test')
})
