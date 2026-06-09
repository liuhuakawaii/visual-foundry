# AGENTS.md

本项目是一个可扩展的批量视觉生成 Web 工作台。当前首个主题包是儿童写真，但核心架构不得绑定到单一主题、单一模型或单一生成模式。

## 项目定位

- 产品名：Visual Foundry
- 当前部署目标：Cloudflare Workers + static assets
- 当前前端栈：React、Vite、TypeScript、TailwindCSS
- 当前 API 栈：Hono on Cloudflare Workers

## 架构约定

- 主题内容放在 `src/data/preset-packs/`，通过 `PresetPack` 扩展。
- 生成模式使用 `GenerationMode` 抽象，当前支持 `text-to-image` 与 `image-to-image`。
- 模型调用放在 `worker/services/`，不得把 provider 细节散落到组件里。
- Prompt 拼装放在 `src/lib/prompt-builder.ts`，预设只描述业务意图。
- API Key 默认使用 Cloudflare secret，不写入前端本地存储。
- 用户临时传入的 key 只能用于当次请求。

## 开发要求

- 不使用 `any` 或 `as any`。
- 组件文件保持单一职责，避免巨型组件。
- UI 首屏必须是可操作工作台，不做营销落地页。
- 前端任务完成后需要运行构建，并尽量做浏览器桌面和移动端验证。

## Cloudflare 配置

生产环境建议设置：

```bash
wrangler secret put IMAGE_API_KEY
wrangler secret put IMAGE_API_BASE_URL
wrangler secret put IMAGE_MODEL
```

`IMAGE_API_BASE_URL` 默认可使用 `https://api.openai.com/v1`，也可以配置为兼容 OpenAI Images API 的服务地址。`IMAGE_MODEL` 默认使用 `gpt-image-1.5`，如兼容服务暂不支持，可改为 `gpt-image-1`。
