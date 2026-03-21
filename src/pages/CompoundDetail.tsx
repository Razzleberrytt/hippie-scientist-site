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

function splitList(input: string) {
  return input
    .split(/\n|;|•|,/g)
    .map(part => part.trim())
    .filter(Boolean)
}

function inferEvidenceLevel(description: string, mechanism: string) {
  const corpus = `${description} ${mechanism}`.toLowerCase()
  if (/meta-analysis|systematic review|human trial|clinical trial|double-blind|rct/.test(corpus)) {
    return 'Well-studied'
  }
  if (/human|clinical/.test(corpus)) return 'Limited human data'
  if (mechanism || /animal|cell|in vitro|preclinical|receptor/.test(corpus)) return 'Preclinical'
  return 'Traditional'
}

function inferEffectBuckets(input: string) {
  const parts = splitNotes(input)
  const mental = parts.filter(item =>
    /mood|focus|calm|sleep|cognition|anxiety|awareness/i.test(item)
  )
  const physical = parts.filter(item =>
    /pain|energy|inflammation|heart|muscle|immune|body|digest/i.test(item)
  )
  const subjective = parts.filter(item =>
    /subjective|sensory|dream|perception|experiential|ritual/i.test(item)
  )

  return {
    mental: mental.length
      ? mental
      : ['Mental effects vary by dose, preparation method, and physiology.'],
    physical: physical.length
      ? physical
      : ['Physical effects vary by dose, preparation method, and physiology.'],
    subjective: subjective.length
      ? subjective
      : ['Subjective effects vary by setting and individual response.'],
  }
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
  const evidenceLevel = inferEvidenceLevel(description, mechanism)
  const effectBuckets = inferEffectBuckets(compound.effects || description)
  const primaryEffects = [
    ...effectBuckets.mental,
    ...effectBuckets.physical,
    ...effectBuckets.subjective,
  ].slice(0, 3)
  const riskLevel =
    compound.intensityLevel === 'strong'
      ? 'Higher'
      : compound.intensityLevel === 'moderate'
        ? 'Moderate'
        : 'Lower'
  const fallbackHerbs = herbs.slice(0, 3).map(item => ({
    name: item.common || item.scientific || item.slug || 'Herb',
    slug: item.slug,
  }))
  const visibleRelatedHerbs = foundHerbs.length ? foundHerbs.slice(0, 3) : fallbackHerbs
  const contraindicationItems = splitList(String((compound as any).contraindications || ''))
  const sideEffectItems = splitList(
    String((compound as any).sideeffects || (compound as any).sideEffects || '')
  )

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
            <div className='mt-4 grid grid-cols-2 gap-3 text-sm leading-7 lg:grid-cols-3'>
              <p className='text-white/80'>
                <strong className='text-white'>Class:</strong> <span>{compoundClass}</span>
              </p>
              {mechanism && (
                <p className='text-white/80'>
                  <strong className='text-white'>Mechanism:</strong> <span>{mechanism}</span>
                </p>
              )}
              <p className='text-white/80'>
                <strong className='text-white'>Primary effects:</strong>{' '}
                <span>
                  {primaryEffects.join(', ') ||
                    normalizedTags.slice(0, 3).join(', ') ||
                    'Context-dependent'}
                </span>
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

          {mechanism && (
            <section className='mt-8'>
              <h2 className='ds-subheading'>Mechanism of Action</h2>
              <p className='ds-text-muted mt-4'>{mechanism}</p>
            </section>
          )}

          <section className='mt-8'>
            <h2 className='ds-subheading'>Effects</h2>
            <div className='mt-4 grid gap-4 sm:grid-cols-3'>
              <div>
                <h3 className='text-sm font-semibold text-white/90'>Mental</h3>
                <ul className='mt-2 list-disc space-y-1 pl-5 text-sm text-white/80'>
                  {effectBuckets.mental.map(item => (
                    <li key={`mental-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className='text-sm font-semibold text-white/90'>Physical</h3>
                <ul className='mt-2 list-disc space-y-1 pl-5 text-sm text-white/80'>
                  {effectBuckets.physical.map(item => (
                    <li key={`physical-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className='text-sm font-semibold text-white/90'>Subjective / Experiential</h3>
                <ul className='mt-2 list-disc space-y-1 pl-5 text-sm text-white/80'>
                  {effectBuckets.subjective.map(item => (
                    <li key={`subjective-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className='mt-4 rounded-xl border border-white/10 bg-white/5 p-4'>
              <h3 className='text-sm font-semibold text-white/90'>Context & Variability</h3>
              <p className='mt-2 text-sm leading-7 text-white/80'>
                Effects vary by dose, preparation method, and individual physiology.
              </p>
            </div>
          </section>

          <section className='mt-8'>
            <h2 className='ds-subheading'>Safety & Contraindications</h2>
            <div className='mt-4 space-y-3 text-sm text-white/80'>
              {contraindicationItems.length > 0 && (
                <div>
                  <p>
                    <strong>Contraindications:</strong>
                  </p>
                  <ul className='mt-1 list-disc space-y-1 pl-5'>
                    {contraindicationItems.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p>
                <strong>Reported side effects:</strong>{' '}
                {sideEffectItems.join(', ') || 'Not consistently reported.'}
              </p>
              <p>
                <strong>Risk level:</strong> {riskLevel}. {safety}
              </p>
            </div>
          </section>

          <section className='mt-8'>
            <h2 className='ds-subheading'>Research Notes</h2>
            <p className='mt-4 text-sm text-white/80'>
              <strong>Evidence Level:</strong>{' '}
              <span className='rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-xs'>
                {evidenceLevel}
              </span>
            </p>
            <ul className='text-white/78 mt-3 list-disc space-y-2 pl-5 text-sm leading-7'>
              {splitNotes(description)
                .slice(0, 3)
                .map(note => (
                  <li key={note}>{note}</li>
                ))}
              <li>Associations in this profile are informational and not treatment claims.</li>
            </ul>
            {foundHerbs.length > 0 && (
              <details className='mt-4 rounded-xl border border-white/10 bg-white/5 p-4'>
                <summary className='cursor-pointer text-sm font-semibold text-white/90'>
                  Read more / Deep dive
                </summary>
                <h3 className='mt-3 text-sm font-semibold text-white/90'>Found in (herbs)</h3>
                <ul className='mt-2 list-disc space-y-1 pl-5 text-sm text-white/80'>
                  {foundHerbs.map(entry => (
                    <li key={entry.name}>
                      {entry.slug ? (
                        <Link
                          className='link text-[color:var(--accent)]'
                          to={`/herb/${entry.slug}`}
                        >
                          {entry.name}
                        </Link>
                      ) : (
                        entry.name
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            )}
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
                {visibleRelatedHerbs.length ? (
                  visibleRelatedHerbs.map(item => (
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
