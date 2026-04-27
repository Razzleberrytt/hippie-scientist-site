import Link from 'next/link'

type RelatedLinkItem = {
  href: string
  title: string
  description: string
  eyebrow?: string
}

type RelatedLinksSectionProps = {
  eyebrow: string
  title: string
  items: RelatedLinkItem[]
}

export default function RelatedLinksSection({
  eyebrow,
  title,
  items,
}: RelatedLinksSectionProps) {
  if (items.length === 0) return null

  return (
    <section className='space-y-4'>
      <div>
        <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
          {eyebrow}
        </p>
        <h2 className='mt-2 text-3xl font-semibold'>{title}</h2>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className='group ds-card block transition hover:border-white/30 hover:bg-white/5'
          >
            <p className='text-xs font-medium uppercase tracking-[0.2em] text-white/50'>
              {item.eyebrow || 'Explore'}
            </p>

            <h3 className='mt-3 text-xl font-semibold'>{item.title}</h3>

            <p className='mt-3 text-sm leading-6 text-white/70'>
              {item.description}
            </p>

            <span className='mt-4 inline-flex text-sm font-medium text-blue-300 transition group-hover:translate-x-0.5'>
              Open →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
