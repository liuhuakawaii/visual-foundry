# Visual Foundry

Visual Foundry 是一个可扩展的批量视觉生成 Web 工作台。当前首个主题包是儿童写真，后续可以继续扩展商品图、头像、海报、视频生成或其他视觉生产流程。

## 当前能力

- 上传参考图并执行 image-to-image 生成
- 支持 text-to-image 模式
- 内置儿童写真主题包和 12 个高质量预设 prompt
- 支持自定义 prompt 叠加
- 支持身份保持约束开关
- 支持批量队列、并发数、失败重试和结果下载
- 支持配置 `baseUrl`、`apiKey`、`model`
- Cloudflare Workers + static assets 部署

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## Cloudflare 配置

生产环境建议使用 Cloudflare secret 保存 API Key：

```bash
wrangler secret put IMAGE_API_KEY
```

`wrangler.jsonc` 中默认配置：

```json
{
  "IMAGE_API_BASE_URL": "https://api.openai.com/v1",
  "IMAGE_MODEL": "gpt-image-1.5"
}
```

如果你的兼容服务只支持 `gpt-image-1`，可以在配置面板或 `wrangler.jsonc` 中修改模型。

## 部署

```bash
npm run deploy
```

## 扩展方式

- 新主题包：在 `src/data/preset-packs/` 新增 `PresetPack`，再从 `index.ts` 导出。
- 新生成模式：扩展 `GenerationMode`，并在 Worker provider adapter 中新增请求处理。
- 新模型服务：在 `worker/services/` 增加 provider adapter，不要把模型细节写进 React 组件。
- 持久化任务：后续建议接 Cloudflare D1 记录任务、R2 存图片、Queues 执行后台批量。
