import type { PromptPreset } from '../types/generation'

interface BuildPromptOptions {
  preset: PromptPreset
  customPrompt?: string
  shouldPreserveIdentity: boolean
}

const qualityGuardrails = [
  'Photorealistic output, premium professional photography, natural anatomy, realistic skin texture, clean composition.',
  'Avoid text, logos, watermarks, collage layouts, and artificial overprocessing.',
]

export function buildPrompt({
  preset,
  customPrompt,
  shouldPreserveIdentity,
}: BuildPromptOptions): string {
  const sections = [
    shouldPreserveIdentity ? preset.identityGuidance : undefined,
    preset.prompt,
    customPrompt?.trim(),
    ...qualityGuardrails,
    `Negative constraints: ${preset.negativePrompt}`,
  ].filter(Boolean)

  return sections.join('\n\n')
}

export function getPromptPreview(preset: PromptPreset): string {
  return [preset.identityGuidance, preset.prompt].filter(Boolean).join(' ')
}
