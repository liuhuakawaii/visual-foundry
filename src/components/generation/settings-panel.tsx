import type {
  BatchGenerationSettings,
  GenerationMode,
  OutputFormat,
  OutputQuality,
  OutputSize,
} from '../../types/generation'
import { Field } from '../ui/field'
import { SegmentedControl } from '../ui/segmented-control'

interface SettingsPanelProps {
  settings: BatchGenerationSettings
  onChange: (settings: BatchGenerationSettings) => void
}

const modeOptions: Array<{ label: string; value: GenerationMode }> = [
  { label: '图生图', value: 'image-to-image' },
  { label: '文生图', value: 'text-to-image' },
]

const sizeOptions: OutputSize[] = ['1024x1024', '1024x1536', '1536x1024']
const qualityOptions: OutputQuality[] = ['auto', 'high', 'medium', 'low']
const formatOptions: OutputFormat[] = ['png', 'jpeg', 'webp']

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  return (
    <section className="rounded-md border border-stone-900/10 bg-white/72 p-4 shadow-[0_24px_50px_-42px_rgba(60,44,31,0.58)] backdrop-blur">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-stone-950">生成配置</h2>
        <p className="mt-1 text-xs leading-5 text-stone-500">baseUrl、key 和模型都可覆盖，默认读取 Cloudflare secret。</p>
      </div>

      <div className="grid gap-4">
        <Field label="生成模式" helper="后续可扩展视频、局部重绘、参考图组等模式。">
          <SegmentedControl
            value={settings.mode}
            options={modeOptions}
            onChange={(mode) => onChange({ ...settings, mode })}
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="尺寸">
            <select
              value={settings.outputSize}
              onChange={(event) => onChange({ ...settings, outputSize: event.target.value as OutputSize })}
              className="h-10 rounded-md border border-stone-900/10 bg-[#f9f7f3] px-3 text-sm text-stone-900 outline-none focus:border-[#476653]"
            >
              {sizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </Field>
          <Field label="质量">
            <select
              value={settings.quality}
              onChange={(event) => onChange({ ...settings, quality: event.target.value as OutputQuality })}
              className="h-10 rounded-md border border-stone-900/10 bg-[#f9f7f3] px-3 text-sm text-stone-900 outline-none focus:border-[#476653]"
            >
              {qualityOptions.map((quality) => (
                <option key={quality} value={quality}>
                  {quality}
                </option>
              ))}
            </select>
          </Field>
          <Field label="格式">
            <select
              value={settings.outputFormat}
              onChange={(event) => onChange({ ...settings, outputFormat: event.target.value as OutputFormat })}
              className="h-10 rounded-md border border-stone-900/10 bg-[#f9f7f3] px-3 text-sm text-stone-900 outline-none focus:border-[#476653]"
            >
              {formatOptions.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </Field>
          <Field label="每个预设数量">
            <input
              type="number"
              min={1}
              max={4}
              value={settings.itemsPerPreset}
              onChange={(event) =>
                onChange({
                  ...settings,
                  itemsPerPreset: Number(event.target.value),
                })
              }
              className="h-10 rounded-md border border-stone-900/10 bg-[#f9f7f3] px-3 text-sm text-stone-900 outline-none focus:border-[#476653]"
            />
          </Field>
          <Field label="并发数">
            <input
              type="number"
              min={1}
              max={4}
              value={settings.concurrency}
              onChange={(event) =>
                onChange({
                  ...settings,
                  concurrency: Number(event.target.value),
                })
              }
              className="h-10 rounded-md border border-stone-900/10 bg-[#f9f7f3] px-3 text-sm text-stone-900 outline-none focus:border-[#476653]"
            />
          </Field>
        </div>

        <Field label="Provider Base URL">
          <input
            value={settings.provider.baseUrl}
            onChange={(event) =>
              onChange({
                ...settings,
                provider: { ...settings.provider, baseUrl: event.target.value },
              })
            }
            className="h-10 rounded-md border border-stone-900/10 bg-[#f9f7f3] px-3 text-sm text-stone-900 outline-none focus:border-[#476653]"
          />
        </Field>
        <Field label="Model">
          <input
            value={settings.provider.model}
            onChange={(event) =>
              onChange({
                ...settings,
                provider: { ...settings.provider, model: event.target.value },
              })
            }
            className="h-10 rounded-md border border-stone-900/10 bg-[#f9f7f3] px-3 text-sm text-stone-900 outline-none focus:border-[#476653]"
          />
        </Field>
        <Field label="临时 API Key" helper="留空时使用 Cloudflare secret。填写后只随本次请求发送到 Worker。">
          <input
            type="password"
            value={settings.provider.apiKey || ''}
            onChange={(event) =>
              onChange({
                ...settings,
                provider: { ...settings.provider, apiKey: event.target.value },
              })
            }
            placeholder="sk-..."
            className="h-10 rounded-md border border-stone-900/10 bg-[#f9f7f3] px-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#476653]"
          />
        </Field>
      </div>
    </section>
  )
}
