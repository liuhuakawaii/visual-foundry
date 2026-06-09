# Visual Foundry

Visual Foundry is an extensible batch visual production workspace. The first preset pack focuses on children portraits, but the architecture is intentionally not coupled to one theme, model, or generation mode.

## Current Capabilities

- Chinese UI by default with a lightweight typed i18n layer and English toggle.
- Reference-image upload for image-to-image generation.
- Text-to-image generation mode.
- Preset pack model for reusable production themes.
- Prompt composition with preset constraints and custom add-ons.
- Identity-preservation guidance toggle.
- Batch jobs with concurrency, cancellation, failed-job retry, session history, and metadata export.
- Runtime request validation shared by the frontend and Worker.
- Cloudflare Workers + static assets deployment.
- Batch-semantic Worker API for future D1, R2, and Queues migration.

## Local Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm test
npm run build
```

`npm test` builds the Worker/client bundle first, then uses the Node test runner to cover prompt building, job creation, request schema validation, and Worker API behavior.

## Cloudflare Configuration

Production should store provider credentials as Cloudflare secrets:

```bash
wrangler secret put IMAGE_API_KEY
wrangler secret put IMAGE_API_BASE_URL
wrangler secret put IMAGE_MODEL
```

`IMAGE_API_BASE_URL` defaults to `https://api.openai.com/v1`.
`IMAGE_MODEL` defaults to `gpt-image-1.5`; use `gpt-image-1` if a compatible provider does not support the newer model.

Temporary API keys entered in the UI are sent only with the current request and are not persisted by the frontend.

## API Shape

- `POST /api/generations/image`: synchronous single-image generation used by the current frontend runner.
- `POST /api/generations/batches`: validates and registers batch metadata for the current runtime.
- `GET /api/generations/batches/:batchId`: reads in-memory batch status.
- `POST /api/generations/batches/:batchId/retry-failed`: contract placeholder for durable retry.
- `POST /api/generations/batches/:batchId/cancel`: contract placeholder for durable cancellation.

The batch endpoints are intentionally shaped for the next backend step: D1 for batch/job records, R2 for source and result assets, and Cloudflare Queues for durable execution.

## Extension Points

- UI copy: add keys to `src/i18n/messages.ts`; keep `zh-CN` and `en-US` dictionaries aligned.
- New preset pack: add a `PresetPack` under `src/data/preset-packs/` and export it from `index.ts`.
- New generation mode: extend `GenerationMode`, request schema validation, UI settings, and provider adapter behavior.
- New provider: add a provider adapter under `worker/services/`; do not put provider details in React components.
- Durable production workflow: add D1, R2, and Queues behind the existing batch-semantic API.
