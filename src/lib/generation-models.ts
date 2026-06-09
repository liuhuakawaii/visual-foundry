export interface GptImageModelOption {
  id: string
  label: string
}

export const gptImageModelOptions: GptImageModelOption[] = [
  { id: 'gpt-image-1.5', label: 'gpt-image-1.5' },
  { id: 'gpt-image-1', label: 'gpt-image-1' },
  { id: 'gpt-image-1-mini', label: 'gpt-image-1-mini' },
]

export function isKnownGptImageModel(model: string) {
  return gptImageModelOptions.some((option) => option.id === model)
}
