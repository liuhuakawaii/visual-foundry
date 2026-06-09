import { allPresets } from '../data/preset-packs'
import type { BatchGenerationSettings } from '../types/generation'

export const defaultGenerationSettings: BatchGenerationSettings = {
  mode: 'image-to-image',
  outputSize: '1024x1536',
  quality: 'high',
  outputFormat: 'png',
  itemsPerPreset: 1,
  concurrency: 1,
  provider: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-image-1.5',
    apiKey: '',
  },
}

export const defaultSelectedPresetIds = allPresets.slice(0, 4).map((preset) => preset.id)
