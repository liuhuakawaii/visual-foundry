import { childrenPortraitPack } from './children-portrait'

export const presetPacks = [childrenPortraitPack]

export const allPresets = presetPacks.flatMap((pack) => pack.presets)
