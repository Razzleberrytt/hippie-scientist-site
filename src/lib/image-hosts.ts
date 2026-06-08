const ALLOWED_IMAGE_HOST_SUFFIXES = [
  'media-amazon.com',
  'ssl-images-amazon.com',
  'images.amazon.com',
  'amazon.com',
]

export function isOptimizableRemoteImage(url: string): boolean {
  if (!url) return false
  if (url.startsWith('/')) return true
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return false
    return ALLOWED_IMAGE_HOST_SUFFIXES.some(
      suffix => parsed.hostname === suffix || parsed.hostname.endsWith(`.${suffix}`),
    )
  } catch {
    return false
  }
}