import Link from 'next/link'

type ExploreItem = {
  href: string
  title: string
  description?: string
  category?: string
}

type Props = {
  title?: string
  items: ExploreItem[]
}

export default function ContinueExploring({
  title = 'Continue Exploring',
  items,
}: Props) {
  const safeItems = Array.from(
    new Map(
      items
        .filter(item => item?.href && item?.title)
        .slice(0, 8)
        .map(item => [item.href, item])
    ).values()
  )

  if (!safeItems.length) {
    return null
  }

  return (
    <section className='space-y-6'>
      <div className='space-y-2 max-w-3xl'>
        <p className='eyebrow-label'>Discovery Ecosystem</p>

        <h2 className='text-3xl font-semibold tracking-tight text-ink'>
          {title}
        </h2>
      </div>

      <div className='grid gap-5 lg:grid-cols-2'>
        {safeItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className='card-premium p-6 transition motion-safe:hover:-translate-y-0.5'
          >
            <div className='space-y-3'>
              <p className='eyebrow-label'>
                {item.category || 'Connected System'}
              </p>

              <h3 className='text-2xl font-semibold tracking-tight text-ink'>
                {item.title}
              </h3>

              {item.description ? (
                <p className='text-sm leading-7 text-muted'>
                  {item.description}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
