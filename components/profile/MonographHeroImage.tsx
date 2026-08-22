import Image from 'next/image'
import type { MonographImage } from '@/lib/monograph-images'
import { getStaticImageSrcSet } from '@/lib/static-image-variants'

type MonographHeroImageProps = {
  image: MonographImage
  label: string
  eyebrow: string
}

const HERO_SIZES = '(min-width: 1024px) 32rem, (min-width: 640px) 50vw, 100vw'
const HERO_CLASS = 'aspect-[16/10] w-full object-cover object-center sm:aspect-[4/3]'

export default function MonographHeroImage({ image }: MonographHeroImageProps) {
  const optimizedSrcSet = process.env.STATIC_RESPONSIVE_IMAGES === '1'
    ? getStaticImageSrcSet(image.src)
    : null

  return (
    <figure className="overflow-hidden rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] shadow-sm">
      {optimizedSrcSet ? (
        <picture>
          <source type="image/webp" srcSet={optimizedSrcSet} sizes={HERO_SIZES} />
          <img
            src={image.src}
            alt={image.alt}
            width={800}
            height={600}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className={HERO_CLASS}
          />
        </picture>
      ) : (
        <Image
          src={image.src}
          alt={image.alt}
          width={800}
          height={600}
          priority
          sizes={HERO_SIZES}
          className={HERO_CLASS}
        />
      )}
      {image.credit ? (
        <figcaption className="border-t border-brand-900/10 px-3 py-2 text-[11px] leading-4 text-muted">
          {image.credit}
        </figcaption>
      ) : null}
    </figure>
  )
}
