import type {
  BatchGenerationSettings,
  GenerationMode,
  OutputFormat,
  OutputQuality,
  OutputSize,
} from '../types/generation'

type PersistedGenerationSettings = Omit<BatchGenerationSettings, 'provider'> & {
  provider: Pick<BatchGenerationSettings['provider'], 'baseUrl' | 'model'>
}

const persistedSettingsKey = 'visual-foundry:generation-settings:v1'
const generationModes: GenerationMode[] = ['text-to-image', 'image-to-image']
const outputSizes: OutputSize[] = ['1024x1024', '1024x1536', '1536x1024']
const outputQualities: OutputQuality[] = ['auto', 'high', 'medium', 'low']
const outputFormats: OutputFormat[] = ['png', 'jpeg', 'webp']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isOneOf<TValue extends string>(value: unknown, options: readonly TValue[]): value is TValue {
  return typeof value === 'string' && options.includes(value as TValue)
}

function isBoundedInteger(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && Number(value) >= min && Number(value) <= max
}

function readString(value: unknown, fallback: string) {
  return typeof value === 'string' ? value.trim() : fallback
}

export function createPersistableGenerationSettings(
  settings: BatchGenerationSettings,
): PersistedGenerationSettings {
  return {
    mode: settings.mode,
    outputSize: settings.outputSize,
    quality: settings.quality,
    outputFormat: settings.outputFormat,
    itemsPerPreset: settings.itemsPerPreset,
    concurrency: settings.concurrency,
    provider: {
      baseUrl: settings.provider.baseUrl.trim(),
      model: settings.provider.model.trim(),
    },
  }
}

export function mergePersistedGenerationSettings(
  value: unknown,
  fallbackSettings: BatchGenerationSettings,
): BatchGenerationSettings {
  if (!isRecord(value)) {
    return { ...fallbackSettings, provider: { ...fallbackSettings.provider, apiKey: '' } }
  }

  const provider = isRecord(value.provider) ? value.provider : {}

  return {
    mode: isOneOf(value.mode, generationModes) ? value.mode : fallbackSettings.mode,
    outputSize: isOneOf(value.outputSize, outputSizes) ? value.outputSize : fallbackSettings.outputSize,
    quality: isOneOf(value.quality, outputQualities) ? value.quality : fallbackSettings.quality,
    outputFormat: isOneOf(value.outputFormat, outputFormats)
      ? value.outputFormat
      : fallbackSettings.outputFormat,
    itemsPerPreset: isBoundedInteger(value.itemsPerPreset, 1, 4)
      ? value.itemsPerPreset
      : fallbackSettings.itemsPerPreset,
    concurrency: isBoundedInteger(value.concurrency, 1, 4)
      ? value.concurrency
      : fallbackSettings.concurrency,
    provider: {
      baseUrl: readString(provider.baseUrl, fallbackSettings.provider.baseUrl),
      model: readString(provider.model, fallbackSettings.provider.model),
      apiKey: '',
    },
  }
}

export function readPersistedGenerationSettings(
  fallbackSettings: BatchGenerationSettings,
): BatchGenerationSettings {
  if (typeof window === 'undefined') {
    return mergePersistedGenerationSettings(undefined, fallbackSettings)
  }

  try {
    const rawSettings = window.localStorage.getItem(persistedSettingsKey)
    return mergePersistedGenerationSettings(rawSettings ? JSON.parse(rawSettings) : undefined, fallbackSettings)
  } catch {
    return mergePersistedGenerationSettings(undefined, fallbackSettings)
  }
}

export function persistGenerationSettings(settings: BatchGenerationSettings) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      persistedSettingsKey,
      JSON.stringify(createPersistableGenerationSettings(settings)),
    )
  } catch {
    // Settings persistence is a convenience layer; generation should continue if storage is unavailable.
  }
}
