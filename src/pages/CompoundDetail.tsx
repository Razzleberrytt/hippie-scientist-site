import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import { decorateCompounds } from '@/lib/compounds'
import { normalizeScientificTags } from '@/lib/tags'
import { useHerbData } from '@/lib/herb-data'
import { slugify } from '@/lib/slug'
import {
  EXPLORE_EFFECTS,
  getDisplayName,
  recommendRelatedCompounds,
  recommendRelatedHerbs,
} from '@/lib/discovery'

const compounds = decorateCompounds()

type Param = {
  slug?: string
}

function splitNotes(input: string) {
  return input
    .split(/\n|;|\.|•/g)
    .map(part => part.trim())
    .filter(Boolean)
}

export default function CompoundDetail() {
  const { slug } = useParams<Param>()
  const compound = compounds.find(entry => entry.slug === slug)
  const herbs = useHerbData()

  if (!compound) {
    return (
      <main className='container mx-auto max-w-3xl px-4 py-10 text-white/70'>
        <p>Compound not found.</p>
        <p className='mt-4'>
          <Link className='underline' to='/compounds'>
            ← Back to compounds
          </Link>
        </p>
      </main>
    )
  }

  const title = compound.common || compound.scientific || compound.name || 'Compound'
  const description = compound.description || compound.effects || 'Compound profile'
  const mechanism = compound.benefits || compound.effects || ''
  const foundIn = Array.isArray(compound.compounds) ? compound.compounds : []
  const normalizedTags = normalizeScientificTags([
    ...(compound.tags || []),
    ...(compound.pharmCategories || []),
    ...(compound.compoundClasses || []),
  ])

  const foundHerbs = foundIn
    .map(name => {
      const herbMatch = herbs.find(item => {
        const a = (item.common || item.scientific || item.slug || '').toLowerCase()
        return a === name.toLowerCase() || slugify(a) === slugify(name)
      })
      return herbMatch
    })
    .filter(Boolean)

  const relatedCompounds = recommendRelatedCompounds(
    compound,
    compounds.filter(c => c.slug !== compound.slug),
    5
  )
  const relatedHerbs = foundHerbs.length ? foundHerbs : recommendRelatedHerbs(compound, herbs, 5)
  const fallbackHerbs = herbs.slice(0, 4)
  const visibleRelatedHerbs = relatedHerbs.length ? relatedHerbs : fallbackHerbs
  const discoveryStrip = [...visibleRelatedHerbs.slice(0, 3), ...fallbackHerbs.slice(0, 2)]

  return (
    <>
      <Meta
        title={`${title} — The Hippie Scientist`}
        description={description}
        path={`/compounds/${slug ?? ''}`}
        pageType='article'
      />
      <main className='container mx-auto max-w-4xl px-4 py-10 text-white'>
        <article className='ds-card-lg ds-section ds-stack'>
          <header className='ds-stack'>
            <h1 className='text-4xl font-semibold text-white'>{title}</h1>
            {compound.scientific && compound.common && compound.common !== compound.scientific && (
              <p className='text-white/65'>{compound.scientific}</p>
            )}
            {normalizedTags.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {normalizedTags.map(tag => (
                  <Link
                    key={tag}
                    to={`/herbs?tag=${encodeURIComponent(tag)}`}
                    className='rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80 hover:border-white/35'
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </header>

          <section className='ds-card mt-6'>
            <h2 className='text-white/72 text-sm font-semibold uppercase tracking-[0.14em]'>
              Quick Facts
            </h2>
            <div className='mt-4 grid grid-cols-2 gap-3 text-sm leading-7 lg:grid-cols-3'>
              <p className='text-white/80'>
                <strong className='text-white'>Class:</strong>{' '}
                <span>{compound.compoundClasses?.[0] || 'Unclassified'}</span>
              </p>
              {mechanism && (
                <p className='text-white/80'>
                  <strong className='text-white'>Mechanism:</strong> <span>{mechanism}</span>
                </p>
              )}
              <p className='text-white/80'>
                <strong className='text-white'>Intensity:</strong>{' '}
                <span>{compound.intensityLabel || 'Unknown'}</span>
              </p>
            </div>
          </section>

          <section className='mt-8'>
            <h2 className='ds-subheading'>Overview</h2>
            <p className='ds-text mt-4'>{description}</p>
          </section>

          <section className='mt-8'>
            <h2 className='text-xl font-semibold text-white'>Explore by Effect</h2>
            <div className='mt-3 flex flex-wrap gap-2'>
              {EXPLORE_EFFECTS.map(effect => (
                <Link
                  key={effect}
                  to={`/herbs?effect=${encodeURIComponent(effect)}`}
                  className='rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-100'
                >
                  {effect}
                </Link>
              ))}
            </div>
          </section>

          <section className='mt-8'>
            <h2 className='ds-subheading'>Research Notes</h2>
            <ul className='text-white/78 mt-3 list-disc space-y-2 pl-5 text-sm leading-7'>
              {splitNotes(description)
                .slice(0, 3)
                .map(note => (
                  <li key={note}>{note}</li>
                ))}
              <li>Associations in this profile are informational and not treatment claims.</li>
            </ul>
          </section>
        </article>

        <section className='ds-card-lg ds-section'>
          <h2 className='text-lg font-semibold text-white'>Explore Next</h2>
          <div className='mt-4 grid gap-5 sm:grid-cols-2'>
            <div>
              <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
                Related Herbs
              </h3>
              <ul className='mt-2 space-y-2 text-sm text-white/80'>
                {visibleRelatedHerbs.map(item => (
                  <li key={`herb-${item.slug}`}>
                    <Link className='link text-[color:var(--accent)]' to={`/herb/${item.slug}`}>
                      {getDisplayName(item)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
                Related Compounds
              </h3>
              <ul className='mt-2 space-y-2 text-sm text-white/80'>
                {(relatedCompounds.length ? relatedCompounds : compounds.slice(0, 4)).map(item => (
                  <li key={item.slug}>
                    <Link
                      className='link text-[color:var(--accent)]'
                      to={`/compounds/${item.slug}`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {discoveryStrip.length > 0 && (
          <section className='ds-card-lg ds-section'>
            <h2 className='text-lg font-semibold text-white'>You might also explore</h2>
            <div className='no-scrollbar mt-4 flex snap-x gap-3 overflow-x-auto pb-1'>
              {discoveryStrip.slice(0, 5).map(item => (
                <Link
                  key={`discover-${item.slug}`}
                  to={`/herb/${item.slug}`}
                  className='min-w-[210px] snap-start rounded-xl border border-white/10 bg-white/5 p-4'
                >
                  <p className='text-xs uppercase tracking-wide text-white/55'>Herb</p>
                  <p className='mt-1 font-semibold text-white'>{getDisplayName(item)}</p>
                  <p className='mt-1 line-clamp-2 text-sm text-white/70'>
                    {item.effectsSummary ||
                      item.effects ||
                      item.description ||
                      'Explore this profile'}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className='mt-8 text-white/70'>
          <Link className='underline' to='/compounds'>
            ← Back to compounds
          </Link>
        </p>
      </main>
    </>
  )
}
