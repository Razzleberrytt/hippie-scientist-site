import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import { decorateCompounds } from '@/lib/compounds'
import { normalizeScientificTags } from '@/lib/tags'
import { useHerbData } from '@/lib/herb-data'
import { slugify } from '@/lib/slug'

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
  const foundIn = Array.isArray(compound.compounds) ? compound.compounds : []
  const compoundClass = compound.compoundClasses?.[0] || 'Unclassified'
  const safety =
    compound.intensityLevel === 'strong'
      ? 'Higher caution profile; intensity-dependent risk.'
      : compound.intensityLevel === 'moderate'
        ? 'Moderate caution profile; context and dose matter.'
        : 'Lower-intensity profile in most reports; individual response varies.'
  const normalizedTags = normalizeScientificTags([
    ...(compound.tags || []),
    ...(compound.pharmCategories || []),
    ...(compound.compoundClasses || []),
  ])

  const foundHerbs = foundIn.map(name => {
    const herbMatch = herbs.find(item => {
      const a = (item.common || item.scientific || item.slug || '').toLowerCase()
      return a === name.toLowerCase() || slugify(a) === slugify(name)
    })
    return { name, slug: herbMatch?.slug }
  })

  const relatedCompounds = compounds
    .filter(entry => entry.slug !== compound.slug)
    .filter(
      entry =>
        entry.compoundClasses?.some(c => c === compoundClass) ||
        entry.pharmCategories?.some(c => c === compound.pharmCategories?.[0])
    )
    .slice(0, 3)

  const relatedArticles = [
    ...new Set(
      normalizeScientificTags(compound.tags || []).map(
        tag => `/blog?tag=${encodeURIComponent(tag)}`
      )
    ),
  ].slice(0, 3)

  return (
    <>
      <Meta
        title={`${title} — The Hippie Scientist`}
        description={description}
        path={`/compounds/${slug ?? ''}`}
        pageType='article'
      />
      <main className='container mx-auto max-w-3xl px-4 py-10 text-white'>
        <article className='ds-card-lg ds-section ds-stack'>
          <header className='ds-stack'>
            <h1 className='text-4xl font-semibold text-white'>{title}</h1>
            {compound.scientific && compound.common && compound.common !== compound.scientific && (
              <p className='text-white/65'>{compound.scientific}</p>
            )}
          </header>

          <section className='ds-card mt-8'>
            <h2 className='text-white/72 text-sm font-semibold uppercase tracking-[0.14em]'>
              Quick Facts
            </h2>
            <div className='mt-4 grid gap-3 text-sm leading-7 sm:grid-cols-2'>
              <p className='text-white/80'>
                <strong className='text-white'>Type:</strong> <span>{compoundClass}</span>
              </p>
              <p className='text-white/80'>
                <strong className='text-white'>Primary effects:</strong>{' '}
                <span>{normalizedTags.slice(0, 3).join(', ') || 'Context-dependent'}</span>
              </p>
              <p className='text-white/80'>
                <strong className='text-white'>Intensity:</strong>{' '}
                <span>{compound.intensityLabel || 'Unknown'}</span>
              </p>
              <p className='text-white/80'>
                <strong className='text-white'>Safety level:</strong> <span>{safety}</span>
              </p>
            </div>
          </section>

          <section className='mt-8'>
            <h2 className='ds-subheading'>Overview</h2>
            <p className='ds-text mt-4'>{description}</p>
          </section>

          <section className='mt-8'>
            <h2 className='ds-subheading'>Chemical Class</h2>
            <p className='ds-text-muted mt-4'>{compoundClass}</p>
          </section>

          <section className='mt-8'>
            <h2 className='ds-subheading'>Effects</h2>
            <p className='ds-text-muted mt-4'>
              {compound.effects ||
                'Effect profile is associated with receptor activity and dosage context.'}
            </p>
          </section>

          <section className='mt-8'>
            <h2 className='ds-subheading'>Mechanism</h2>
            <p className='ds-text-muted mt-4'>
              {compound.benefits ||
                'Mechanistic evidence is still developing; current models are preliminary.'}
            </p>
          </section>

          <section className='mt-8'>
            <h2 className='ds-subheading'>Found In (Herbs)</h2>
            {foundHerbs.length > 0 ? (
              <ul className='text-white/78 mt-4 list-disc space-y-2 pl-5 text-sm leading-7'>
                {foundHerbs.map(entry => (
                  <li key={entry.name}>
                    {entry.slug ? (
                      <Link className='link text-[color:var(--accent)]' to={`/herb/${entry.slug}`}>
                        {entry.name}
                      </Link>
                    ) : (
                      entry.name
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className='ds-text-muted mt-4'>
                This area will expand as more relationships are mapped.
              </p>
            )}
          </section>

          <section className='mt-8'>
            <h2 className='ds-subheading'>Research Notes</h2>
            <ul className='text-white/78 mt-4 list-disc space-y-2 pl-5 text-sm leading-7'>
              {splitNotes(description)
                .slice(0, 3)
                .map(note => (
                  <li key={note}>{note}</li>
                ))}
              <li>Associations in this profile are informational and not treatment claims.</li>
            </ul>
          </section>

          <section className='mt-8'>
            <h2 className='ds-subheading'>Safety</h2>
            <p className='ds-text-muted mt-4'>
              {safety} Monitor interactions, extraction strength, and individual sensitivity.
            </p>
          </section>
        </article>

        <section className='ds-card-lg ds-section'>
          <h2 className='text-lg font-semibold text-white'>Explore Next</h2>
          <div className='mt-4 grid gap-5 sm:grid-cols-3'>
            <div>
              <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
                Related Herbs
              </h3>
              <ul className='mt-2 space-y-2 text-sm text-white/80'>
                {foundHerbs.length ? (
                  foundHerbs.slice(0, 3).map(item => (
                    <li key={`herb-${item.name}`}>
                      {item.slug ? (
                        <Link className='link text-[color:var(--accent)]' to={`/herb/${item.slug}`}>
                          {item.name}
                        </Link>
                      ) : (
                        item.name
                      )}
                    </li>
                  ))
                ) : (
                  <li className='text-white/60'>
                    This area will expand as more relationships are mapped.
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
                Related Compounds
              </h3>
              <ul className='mt-2 space-y-2 text-sm text-white/80'>
                {relatedCompounds.map(item => (
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
            <div>
              <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
                Related Articles
              </h3>
              <ul className='mt-2 space-y-2 text-sm text-white/80'>
                {relatedArticles.length ? (
                  relatedArticles.map(link => (
                    <li key={link}>
                      <a className='link text-[color:var(--accent)]' href={link}>
                        Research Digest
                      </a>
                    </li>
                  ))
                ) : (
                  <li className='text-white/60'>Browse blog for linked topics.</li>
                )}
              </ul>
            </div>
          </div>
        </section>

        <p className='mt-8 text-white/70'>
          <Link className='underline' to='/compounds'>
            ← Back to compounds
          </Link>
        </p>
      </main>
    </>
  )
}
