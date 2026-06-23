import Link from 'next/link'

type RelatedSystem = {
  href: string
  title: string
  description?: string
}

type Props = {
  title?: string
  systems: RelatedSystem[]
}

export default function RelatedEducationSystems({
  title = 'Continue Exploring',
  systems,
}: Props) {
  const uniqueSystems = Array.from(
    new Map(
      systems
        .filter(system => system?.href && system?.title)
        .slice(0, 6)
        .map(system => [system.href, system])
    ).values()
  )

  if (!uniqueSystems.length) {
    return null
  }

  return (
    <section className='space-y-5'>
      <div className='space-y-2'>
        <p className='eyebrow-label'>Related Educational Systems</p>
        <h2 className='text-3xl font-semibold tracking-tight text-ink'>{title}</h2>
      </div>

      <div className='grid gap-5 lg:grid-cols-2'>
        {uniqueSystems.map(system => (
          <Link
            key={system.href}
            href={system.href}
            className='card-premium p-6 transition motion-safe:hover:-translate-y-0.5'
          >
            <div className='space-y-3'>
              <p className='eyebrow-label'>Connected System</p>

              <h3 className='text-2xl font-semibold tracking-tight text-ink'>
                {system.title}
              </h3>

              {system.description ? (
                <p className='text-sm leading-7 text-[#46574d]'>
                  {system.description}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
