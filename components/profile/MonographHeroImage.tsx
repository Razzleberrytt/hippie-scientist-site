import type { MonographImage } from '@/lib/monograph-images'

type MonographHeroImageProps = {
  image: MonographImage
  label: string
  eyebrow: string
}

export default function MonographHeroImage({ image, label, eyebrow }: MonographHeroImageProps) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] shadow-sm">
      <div
        role="img"
        aria-label={image.alt}
        className="aspect-[4/3] w-full bg-cover bg-center"
        style={{ backgroundImage: `url("${image.src}")` }}
      />
      <figcaption className="border-t border-brand-900/10 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-700">{eyebrow}</p>
        <p className="mt-1 text-sm font-semibold text-ink">{label}</p>
        {image.credit ? <p className="mt-1 text-[11px] text-muted">{image.credit}</p> : null}
      </figcaption>
    </figure>
  )
}
