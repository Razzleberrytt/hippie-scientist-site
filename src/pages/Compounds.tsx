import { Link } from 'react-router-dom'
import Meta from '@/components/Meta'
import { useCompoundData } from '@/lib/compound-data'

function summarize(compound: { description: string; effects: string[] }) {
  if (compound.description) return compound.description
  if (compound.effects.length) return compound.effects.slice(0, 2).join(' · ')
  return 'Mechanism and effects are still being researched.'
}

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
        <p className='mt-3 max-w-3xl text-white/80'>
          Browse active compounds with effect summaries, linked herb counts, contraindications, and
          source transparency.
        </p>
      </header>

      <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {compounds.map(compound => (
          <article key={compound.id} className='ds-card-lg flex h-full flex-col'>
            <h2 className='text-xl font-semibold'>{compound.name}</h2>
            <p className='mt-2 line-clamp-4 flex-1 text-sm text-white/85'>{summarize(compound)}</p>
            <p className='mt-3 text-xs text-white/80'>
              {compound.herbs.length} {compound.herbs.length === 1 ? 'herb' : 'herbs'} associated
            </p>
            <Link to={`/compounds/${compound.slug}`} className='btn-primary mt-4 w-fit'>
              View details
            </Link>
          </article>
        ))}
      </section>
    </main>
  )
}
