import Image from 'next/image'
import type { MonographImage } from '@/lib/monograph-images'

type MonographHeroImageProps = {
  image: MonographImage
  label: string
  eyebrow: string
}

export default function MonographHeroImage({ image }: MonographHeroImageProps) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] shadow-sm">
      <Image
        src={image.src}
        alt={image.alt}
        width={800}
        height={600}
        priority
        sizes="(min-width: 1024px) 32rem, (min-width: 640px) 50vw, 100vw"
        className="aspect-[16/10] w-full object-cover object-center sm:aspect-[4/3]"
      />
      {image.credit ? (
        <figcaption className="border-t border-brand-900/10 px-3 py-2 text-[11px] leading-4 text-muted">
          {image.credit}
        </figcaption>
      ) : null}
    </figure>
  )
}
