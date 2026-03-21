import { Link } from 'react-router-dom'
import Meta from '@/components/Meta'
import { useCompoundData } from '@/lib/compound-data'

export default function CompoundsPage() {
  const compounds = useCompoundData()

  return (
    <main className='container mx-auto max-w-6xl px-4 py-8 text-white'>
      <Meta
        title='Compound Reference | The Hippie Scientist'
        description='Explore active compounds, associated herbs, and safety context.'
        path='/compounds'
      />
      <header className='ds-card-lg mb-6'>
        <h1 className='text-3xl font-semibold sm:text-4xl'>Compounds</h1>
        <p className='mt-3 text-white/75'>
          Browse active compounds with effect summaries, herb counts, and detailed safety context.
        </p>
      </header>

      <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {compounds.map(compound => (
          <article key={compound.id} className='ds-card-lg flex h-full flex-col'>
            <h2 className='text-xl font-semibold'>{compound.name}</h2>
            <p className='mt-2 flex-1 text-sm text-white/80'>
              {compound.effects[0] || compound.description || 'Mechanism and effects under review.'}
            </p>
            <p className='mt-3 text-xs text-white/65'>{compound.herbs.length} herbs listed</p>
            <Link to={`/compounds/${compound.slug}`} className='btn-primary mt-4 w-fit'>
              View details
            </Link>
          </article>
        ))}
      </section>
    </main>
  )
}
