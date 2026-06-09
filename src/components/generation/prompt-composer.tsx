import { ClipboardText } from '@phosphor-icons/react'
import type { PromptPreset } from '../../types/generation'
import { getPromptPreview } from '../../lib/prompt-builder'
import { Field } from '../ui/field'

interface PromptComposerProps {
  activePreset: PromptPreset | null
  customPrompt: string
  preserveIdentity: boolean
  onCustomPromptChange: (prompt: string) => void
  onPreserveIdentityChange: (preserveIdentity: boolean) => void
}

export function PromptComposer({
  activePreset,
  customPrompt,
  preserveIdentity,
  onCustomPromptChange,
  onPreserveIdentityChange,
}: PromptComposerProps) {
  return (
    <section className="rounded-md border border-stone-900/10 bg-white/72 p-4 shadow-[0_24px_50px_-42px_rgba(60,44,31,0.58)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-950">Prompt 组合器</h2>
          <p className="mt-1 text-xs leading-5 text-stone-500">预设负责稳定质量，自定义内容负责方向差异。</p>
        </div>
        <ClipboardText size={21} className="text-[#476653]" weight="duotone" />
      </div>

      <div className="grid gap-4">
        <label className="flex items-start gap-3 rounded-md border border-stone-900/10 bg-[#f9f7f3] p-3">
          <input
            type="checkbox"
            checked={preserveIdentity}
            onChange={(event) => onPreserveIdentityChange(event.target.checked)}
            className="mt-1 h-4 w-4 accent-[#476653]"
          />
          <span>
            <span className="block text-sm font-semibold text-stone-900">强身份保持约束</span>
            <span className="mt-1 block text-xs leading-5 text-stone-500">
              保持脸型、五官、肤色、发际线和年龄特征，只调整场景、姿势、服装和轻微表情。
            </span>
          </span>
        </label>

        <Field label="自定义补充 Prompt" helper="例如：加入浅蓝色羊毛毯、妈妈手部入镜、眼神看向窗外。">
          <textarea
            value={customPrompt}
            onChange={(event) => onCustomPromptChange(event.target.value)}
            rows={5}
            className="resize-none rounded-md border border-stone-900/10 bg-[#f9f7f3] px-3 py-2 text-sm leading-6 text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#476653]"
            placeholder="写下这批图片希望额外变化的方向..."
          />
        </Field>

        <div className="rounded-md border border-stone-900/10 bg-stone-950 p-3 text-stone-100">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase text-stone-400">Preset Preview</p>
            <p className="text-xs text-stone-500">{activePreset?.title || '未选择预设'}</p>
          </div>
          <p className="max-h-44 overflow-y-auto text-xs leading-5 text-stone-300">
            {activePreset ? getPromptPreview(activePreset) : '选择一个主题预设后，这里会显示核心 prompt 预览。'}
          </p>
        </div>
      </div>
    </section>
  )
}
