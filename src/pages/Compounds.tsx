import { Link } from 'react-router-dom'
import Meta from '@/components/Meta'
import { useCompoundData } from '@/lib/compound-data'
import {
  computeConfidenceLevel,
  confidenceBadgeClass,
  extractPrimaryEffects,
} from '@/lib/dataTrust'

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
        {compounds.map(compound => {
          const confidence = computeConfidenceLevel({
            mechanism: compound.mechanism,
            effects: compound.effects,
            compounds: compound.herbs,
          })
          const primaryEffects = extractPrimaryEffects(compound.effects, 3)
          return (
            <article key={compound.id} className='ds-card-lg flex h-full flex-col'>
              <div className='flex flex-wrap items-start justify-between gap-2'>
                <h2 className='text-xl font-semibold'>{compound.name}</h2>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${confidenceBadgeClass(confidence)}`}
                >
                  {confidence}
                </span>
              </div>
              <p className='mt-2 line-clamp-4 flex-1 text-sm text-white/85'>
                {summarize(compound)}
              </p>
              {primaryEffects.length > 0 && (
                <div className='mt-3 flex flex-wrap gap-1.5'>
                  {primaryEffects.map(effect => (
                    <span
                      key={`${compound.id}-${effect}`}
                      className='rounded-full border border-violet-300/35 bg-violet-500/15 px-2.5 py-1 text-[11px] text-violet-100'
                    >
                      {effect}
                    </span>
                  ))}
                </div>
              )}
              {confidence === 'Low' && (
                <p className='mt-3 rounded-lg border border-amber-300/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-100'>
                  Data incomplete: mechanism/effects links are still sparse.
                </p>
              )}
              <p className='mt-3 text-xs text-white/80'>
                {compound.herbs.length} {compound.herbs.length === 1 ? 'herb' : 'herbs'} associated
              </p>
              <Link to={`/compounds/${compound.slug}`} className='btn-primary mt-4 w-fit'>
                View details
              </Link>
            </article>
          )
        })}
      </section>
    </main>
  )
}
