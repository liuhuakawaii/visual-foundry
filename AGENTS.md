# AGENTS.md

This project is an extensible batch visual production workspace. The current first preset pack is children portraits, but core architecture must not be tied to one theme, one model, or one generation mode.

## Product Positioning

- Product name: Visual Foundry.
- Deployment target: Cloudflare Workers + static assets.
- Frontend stack: React, Vite, TypeScript, TailwindCSS.
- API stack: Hono on Cloudflare Workers.
- First-screen requirement: the app must remain an operable production workspace, not a marketing landing page.

## Architecture Rules

- Theme content belongs in `src/data/preset-packs/` and extends `PresetPack`.
- Generation modes use the `GenerationMode` abstraction.
- Model/provider calls belong in `worker/services/`; provider details must not leak into React components.
- Prompt assembly belongs in `src/lib/prompt-builder.ts`; presets describe production intent and constraints.
- Runtime request validation belongs in shared schema utilities under `src/lib/`.
- User-facing UI copy belongs in `src/i18n/messages.ts`; default locale is `zh-CN`.
- Batch/job workflow state should stay outside `App.tsx`; keep `App.tsx` as page composition.
- API keys default to Cloudflare secrets. Temporary user-supplied keys may only be used for the current request and must not be persisted in frontend storage.

## Current Persistence Boundary

- Frontend batch history is session-scoped.
- Worker batch endpoints currently provide API contracts and in-memory status only.
- Durable storage is the next backend phase: D1 for batch/job records, R2 for image assets, and Cloudflare Queues for background execution.

## Development Requirements

- Do not use `any` or `as any`.
- Keep components single-purpose and avoid giant component files.
- Prefer TailwindCSS and existing UI primitives.
- Run `npm run lint`, `npm test`, and `npm run build` after meaningful changes.
- For frontend changes, verify desktop and mobile layouts in a browser when practical.
