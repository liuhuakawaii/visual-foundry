import type { UploadedReference } from '../types/generation'

const maxReferenceSize = 8 * 1024 * 1024
const supportedReferenceTypes = ['image/png', 'image/jpeg', 'image/webp']

export function validateReferenceFile(file: File): string | null {
  if (!supportedReferenceTypes.includes(file.type)) {
    return '请上传 PNG、JPEG 或 WebP 图片。'
  }

  if (file.size > maxReferenceSize) {
    return '参考图不能超过 8MB。'
  }

  return null
}

export function readReferenceFile(file: File): Promise<UploadedReference> {
  return new Promise((resolve, reject) => {
    const validationError = validateReferenceFile(file)
    if (validationError) {
      reject(new Error(validationError))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('图片读取失败。'))
        return
      }

      resolve({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result,
      })
    }
    reader.onerror = () => reject(new Error('图片读取失败。'))
    reader.readAsDataURL(file)
  })
}

export function formatFileSize(size: number): string {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}
