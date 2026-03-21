import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import { useCompoundData } from '@/lib/compound-data'

function unique(list: string[]) {
  return Array.from(new Set(list.filter(Boolean)))
}

export default function CompoundDetail() {
  const { slug = '' } = useParams()
  const compounds = useCompoundData()
  const compound = compounds.find(item => item.slug === slug)

  if (!compound) {
    return (
      <main className='container mx-auto max-w-3xl px-4 py-10 text-white'>
        <p>Compound profile not found.</p>
      </main>
    )
  }

  const aggregatedEffects = unique(compound.effects)
  const aggregatedContraindications = unique(compound.contraindications)

  return (
    <main className='container mx-auto max-w-4xl px-4 py-8 text-white'>
      <Meta
        title={`${compound.name} | Compound Detail`}
        description={compound.description || `Detail page for ${compound.name}.`}
        path={`/compounds/${compound.slug}`}
      />
      <Link to='/compounds' className='btn-secondary inline-flex items-center rounded-full px-4'>
        ← Back to compounds
      </Link>

      <article className='ds-card-lg mt-4'>
        <h1 className='text-3xl font-semibold'>{compound.name}</h1>
        {compound.lastUpdated && (
          <p className='mt-2 text-xs text-emerald-100/85'>Last updated: {compound.lastUpdated}</p>
        )}

        {compound.herbs.length > 0 && (
          <section className='mt-6'>
            <h2 className='text-lg font-semibold'>Associated Herbs</h2>
            <div className='mt-3 flex flex-wrap gap-2'>
              {compound.herbs.map(herb => (
                <Link
                  key={herb}
                  to={`/herbs/${encodeURIComponent(herb.toLowerCase().replace(/\s+/g, '-'))}`}
                  className='ds-pill'
                >
                  {herb}
                </Link>
              ))}
            </div>
          </section>
        )}

        {aggregatedEffects.length > 0 && (
          <section className='mt-6'>
            <h2 className='text-lg font-semibold'>Aggregated Effects</h2>
            <ul className='mt-2 list-disc space-y-1 pl-5 text-white/85'>
              {aggregatedEffects.map(effect => (
                <li key={effect}>{effect}</li>
              ))}
            </ul>
          </section>
        )}

        {aggregatedContraindications.length > 0 && (
          <section className='mt-6'>
            <h2 className='text-lg font-semibold'>Aggregated Contraindications</h2>
            <ul className='mt-2 list-disc space-y-1 pl-5 text-white/85'>
              {aggregatedContraindications.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {compound.sources.length > 0 && (
          <section className='mt-6'>
            <h2 className='text-lg font-semibold'>Sources</h2>
            <ol className='mt-2 list-decimal space-y-1 pl-5 text-white/85'>
              {compound.sources.map(source => (
                <li key={source}>
                  {/^https?:\/\//i.test(source) ? (
                    <a href={source} target='_blank' rel='noreferrer' className='link'>
                      {source}
                    </a>
                  ) : (
                    source
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
      </article>
    </main>
  )
}
