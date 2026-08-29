import Image from 'next/image'
import type { MonographImage } from '@/lib/monograph-images'

type MonographHeroImageProps = {
  image: MonographImage
  label: string
  eyebrow: string
}

export default function MonographHeroImage({ image }: MonographHeroImageProps) {
  return (
    <figure className="overflow-hidden rounded-[var(--hs-radius)] border border-[color:var(--hs-hairline)] bg-[var(--surface-card)]">
      {/* A wide band on phones: the monograph visual is supporting context, and
          a 16:10 block cost most of a screen before the evidence started. */}
      <Image
        src={image.src}
        alt={image.alt}
        width={800}
        height={600}
        priority
        sizes="(min-width: 1024px) 32rem, (min-width: 640px) 50vw, 100vw"
        className="aspect-[2/1] w-full object-cover object-center sm:aspect-[4/3]"
      />
      {image.credit ? (
        <figcaption className="border-t border-[color:var(--hs-hairline)] px-3 py-1.5 text-[11px] leading-4 text-muted">
          {image.credit}
        </figcaption>
      ) : null}
    </figure>
  )
}
