export interface DataUrlFile {
  bytes: Uint8Array
  mimeType: string
}

export function parseDataUrl(dataUrl: string): DataUrlFile {
  const match = dataUrl.match(/^data:(?<mimeType>[^;]+);base64,(?<payload>.+)$/)
  if (!match?.groups) {
    throw new Error('Invalid image data URL.')
  }

  const binary = atob(match.groups.payload)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return {
    bytes,
    mimeType: match.groups.mimeType,
  }
}

export function imageResponseToDataUrl(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64}`
}
