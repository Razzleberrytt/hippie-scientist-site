import Link from 'next/link'

type ComparisonSystem = {
  href: string
  title: string
  description?: string
}

type Props = {
  title?: string
  systems: ComparisonSystem[]
}

export default function RelatedComparisonSystems({
  title = 'Related Comparison Systems',
  systems,
}: Props) {
  const safeSystems = Array.from(
    new Map(
      systems
        .filter(system => system?.href && system?.title)
        .slice(0, 6)
        .map(system => [system.href, system])
    ).values()
  )

  if (!safeSystems.length) {
    return null
  }

  return (
    <section className='space-y-6'>
      <div className='space-y-2 max-w-3xl'>
        <p className='eyebrow-label'>Comparison Ecosystem</p>

        <h2 className='text-3xl font-semibold tracking-tight text-ink'>
          {title}
        </h2>
      </div>

      <div className='grid gap-5 lg:grid-cols-2'>
        {safeSystems.map(system => (
          <Link
            key={system.href}
            href={system.href}
            className='card-premium p-6 transition hover:-translate-y-0.5'
          >
            <div className='space-y-3'>
              <p className='eyebrow-label'>Connected Comparison</p>

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
