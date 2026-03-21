import { Link, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import Meta from '@/components/Meta'
import { decorateCompounds } from '@/lib/compounds'
import { normalizeScientificTags } from '@/lib/tags'
import { useHerbData } from '@/lib/herb-data'
import { slugify } from '@/lib/slug'
import { getDisplayName, recommendRelatedCompounds, recommendRelatedHerbs } from '@/lib/discovery'

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
      <main className='container mx-auto max-w-3xl px-4 py-10 text-white'>
        <section className='ds-card-lg'>
          <p className='text-xs uppercase tracking-[0.14em] text-white/60'>Not Found</p>
          <h1 className='mt-2 text-2xl font-semibold'>Compound profile not found</h1>
          <p className='mt-3 text-white/75'>
            We could not find that compound. Check the URL slug or return to the compound database.
          </p>
          <Link className='btn-primary mt-5 inline-flex' to='/compounds'>
            ← Back to compounds
          </Link>
        </section>
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

  const effects = splitNotes(compound.effectsSummary || compound.effects || '')
  const safety = splitNotes(compound.safety || compound.toxicity || '')
  const researchNotes = splitNotes(description)

  const relatedCompounds = recommendRelatedCompounds(
    compound,
    compounds.filter(c => c.slug !== compound.slug),
    5
  )
  const relatedHerbs = foundHerbs.length ? foundHerbs : recommendRelatedHerbs(compound, herbs, 5)

  return (
    <>
      <Meta
        title={`${title} — The Hippie Scientist`}
        description={description}
        path={`/compounds/${slug ?? ''}`}
        pageType='article'
      />
      <main className='container mx-auto max-w-4xl px-4 py-10 text-white'>
        <div className='mb-4'>
          <Link
            className='btn-secondary inline-flex items-center rounded-full px-4'
            to='/compounds'
          >
            ← Back to compounds
          </Link>
        </div>
        <article className='ds-card-lg ds-section ds-stack'>
          <header className='ds-stack'>
            <h1 className='text-4xl font-semibold text-white'>{title}</h1>
            {compound.scientific && compound.common && compound.common !== compound.scientific && (
              <p className='text-white/65'>{compound.scientific}</p>
            )}
          </header>

          <section className='ds-card mt-2'>
            <h2 className='text-white/72 text-sm font-semibold uppercase tracking-[0.14em]'>
              Quick Facts
            </h2>
            <dl className='mt-4 grid gap-3 text-sm lg:grid-cols-3'>
              <Fact label='Class' value={compound.compoundClasses?.[0] || 'Unclassified'} />
              <Fact label='Intensity' value={compound.intensityLabel || 'Unknown'} />
              <Fact label='Mechanism' value={mechanism || 'Mechanism not well characterized'} />
            </dl>
          </section>

          <Section title='Overview'>
            <p className='ds-text mt-3'>{description}</p>
          </Section>

          <Section title='Chemical Class'>
            <p className='text-white/82 mt-3 text-sm'>
              {compound.compoundClasses?.join(', ') || 'Unclassified'}
            </p>
          </Section>

          <Section title='Effects'>
            <ul className='text-white/82 mt-3 list-disc space-y-2 pl-5 text-sm leading-7'>
              {(effects.length ? effects : ['Effect profile varies by dose, matrix, and person.'])
                .slice(0, 5)
                .map(note => (
                  <li key={note}>{note}</li>
                ))}
            </ul>
          </Section>

          <Section title='Mechanism'>
            <p className='mt-3 text-sm leading-7 text-white/85'>
              {mechanism || 'Mechanistic evidence is currently limited.'}
            </p>
            {normalizedTags.length > 0 && (
              <div className='mt-3 flex flex-wrap gap-2'>
                {normalizedTags.slice(0, 6).map(tag => (
                  <Link
                    key={tag}
                    to={`/herbs?tag=${encodeURIComponent(tag)}`}
                    className='rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80'
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </Section>

          <Section title='Found In'>
            {foundHerbs.length ? (
              <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-white/80'>
                {foundHerbs.map(item => (
                  <li key={`found-${item.slug}`}>
                    <Link className='link text-[color:var(--accent)]' to={`/herbs/${item.slug}`}>
                      {getDisplayName(item)}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='mt-3 text-sm text-white/70'>
                Direct mappings are limited; explore source candidates in the{' '}
                <Link className='underline decoration-dotted underline-offset-2' to='/herbs'>
                  herb database
                </Link>
                .
              </p>
            )}
          </Section>

          <Section title='Safety'>
            <dl className='text-white/82 mt-3 space-y-3 text-sm'>
              <div>
                <dt className='font-semibold text-white'>Contraindications</dt>
                <dd className='mt-1'>
                  {(Array.isArray(compound.contraindications)
                    ? compound.contraindications.join('; ')
                    : compound.contraindications) || 'Not explicitly documented in this profile.'}
                </dd>
              </div>
              <div>
                <dt className='font-semibold text-white'>Reported side effects</dt>
                <dd className='mt-1'>
                  {compound.sideEffects ||
                    (safety.length ? safety.join('; ') : 'Side effect reporting is limited.')}
                </dd>
              </div>
              <div>
                <dt className='font-semibold text-white'>Risk level</dt>
                <dd className='mt-1'>{compound.intensityLabel || 'Unknown'}</dd>
              </div>
            </dl>
          </Section>

          <Section title='Research Notes'>
            <ul className='mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white/80'>
              {(researchNotes.length
                ? researchNotes
                : ['Associations in this profile are informational and not treatment claims.']
              )
                .slice(0, 5)
                .map(note => (
                  <li key={note}>{note}</li>
                ))}
            </ul>
          </Section>
        </article>

        {(relatedHerbs.length > 0 || relatedCompounds.length > 0) && (
          <section className='ds-card-lg ds-section'>
            <h2 className='text-lg font-semibold text-white'>Explore Next</h2>
            <div className='mt-4 grid gap-5 sm:grid-cols-2'>
              {relatedHerbs.length > 0 && (
                <div>
                  <h3 className='text-sm font-semibold uppercase tracking-wide text-white/70'>
                    Related Herbs
                  </h3>
                  <ul className='mt-2 space-y-2 text-sm text-white/80'>
                    {relatedHerbs.map(item => (
                      <li key={`herb-${item.slug}`}>
                        <Link
                          className='link text-[color:var(--accent)]'
                          to={`/herbs/${item.slug}`}
                        >
                          {getDisplayName(item)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {relatedCompounds.length > 0 && (
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
              )}
            </div>
          </section>
        )}
      </main>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='mt-6'>
      <h2 className='text-xl font-semibold text-white'>{title}</h2>
      {children}
    </section>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-xl border border-white/10 bg-white/5 px-3 py-2'>
      <dt className='text-[11px] font-semibold uppercase tracking-wide text-white/65'>{label}</dt>
      <dd className='mt-1 text-sm text-white/85'>{value}</dd>
    </div>
  )
}
