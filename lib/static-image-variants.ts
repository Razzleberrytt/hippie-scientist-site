export const STATIC_IMAGE_WIDTHS = [400, 800, 1200] as const

const LOCAL_RASTER_IMAGE_RE = /^\/images\/(?!optimized\/)(.+)\.(?:jpe?g|png|gif|avif|tiff?|webp)$/i

export type StaticImageVariant = {
  width: (typeof STATIC_IMAGE_WIDTHS)[number]
  src: string
}

export function getStaticImageVariants(src: string): StaticImageVariant[] {
  const match = src.match(LOCAL_RASTER_IMAGE_RE)
  if (!match) return []

  const relativeBase = match[1]
  return STATIC_IMAGE_WIDTHS.map((width) => ({
    width,
    src: `/images/optimized/${relativeBase}-${width}w.webp`,
  }))
}

export function getStaticImageSrcSet(src: string): string | null {
  const variants = getStaticImageVariants(src)
  if (!variants.length) return null
  return variants.map((variant) => `${variant.src} ${variant.width}w`).join(', ')
}
