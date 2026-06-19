import Image from 'next/image'
import { getSemanticFallbackImage } from '../lib/image-fallbacks'

type SemanticImageProps = {
  slug?: string
  category?: string
  alt?: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export default function SemanticImage({
  slug,
  category,
  alt,
  width = 320,
  height = 220,
  className = '',
  priority = false,
}: SemanticImageProps) {
  const image = getSemanticFallbackImage(slug, category)

  return (
    <div className={`relative overflow-hidden rounded-[1.5rem] border border-brand-900/10 bg-paper-50 ${className}`}>
      <Image
        src={image.src}
        alt={alt || image.alt}
        width={width}
        height={height}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        className="h-full w-full object-cover transition duration-500"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
    </div>
  )
}
