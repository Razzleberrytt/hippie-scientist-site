interface ResponsiveImageOptions {
  widths?: number[]
  sizes?: string
}

export function getResponsiveImageProps(
  src: string | null | undefined,
  options: ResponsiveImageOptions = {},
): { src: string; srcSet?: string; sizes?: string; loading: 'lazy'; decoding: 'async' } | null {
  if (!src || typeof src !== 'string') return null
  const trimmed = src.trim()
  if (!trimmed) return null
  const widths = (options.widths ?? []).filter(width => Number.isFinite(width) && width > 0)
  const srcSet = widths.length > 0 ? widths.map(width => `${trimmed} ${width}w`).join(', ') : undefined
  return {
    src: trimmed,
    srcSet,
    sizes: options.sizes,
    loading: 'lazy',
    decoding: 'async',
  }
}
