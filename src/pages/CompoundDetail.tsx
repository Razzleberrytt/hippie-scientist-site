import { type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import DataTrustPanel from '@/components/trust/DataTrustPanel'
import { useCompoundDataState } from '@/lib/compound-data'
import { useHerbDataState } from '@/lib/herb-data'
import { pickNonEmptyKeys } from '@/lib/nonEmptyFields'
import { calculateCompoundConfidence } from '@/utils/calculateConfidence'
import { getCompoundDataCompleteness } from '@/utils/getDataCompleteness'
import { extractPrimaryEffects } from '@/utils/extractPrimaryEffects'
import { CompoundDetailSkeleton } from '@/components/skeletons/DetailSkeletons'
import { mapRelatedHerbsForCompound } from '@/lib/compoundHerbRelations'
import RelatedHerbCard from '@/components/RelatedHerbCard'
import Collapse from '@/components/ui/Collapse'

const ISSUE_TEMPLATE_URL =
  'https://github.com/Razzleberrytt/survive-99-evolved/issues/new?template=evidence-update.yml'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='border-white/8 mt-6 border-t pt-5'>
      <h2 className='mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50'>
        {title}
      </h2>
      <div className='text-sm leading-relaxed text-white/85'>{children}</div>
    </section>
  )
}

function ListSection({ items }: { items: string[] }) {
  if (!items.length) return null
  return (
    <ul className='list-disc space-y-1 pl-5'>
      {items.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export default function CompoundDetail() {
  const { slug = '' } = useParams()
  const { compounds, isLoading: isCompoundLoading } = useCompoundDataState()
  const { herbs, isLoading: isHerbLoading } = useHerbDataState()
  const compound = compounds.find(item => item.slug === slug)

  if (isCompoundLoading || isHerbLoading) {
    return <CompoundDetailSkeleton />
  }

  if (!compound) {
    return (
      <main className='container mx-auto max-w-3xl px-4 py-10 text-white'>
        <p className='text-white/60'>Compound profile not found.</p>
        <Link to='/compounds' className='btn-secondary mt-4 inline-flex'>
          ← Back to compounds
        </Link>
      </main>
    )
  }

  const linkedHerbs = mapRelatedHerbsForCompound(compound, herbs)

  const whyItMatters = compound.effects.slice(0, 2).join(' + ')
  const doesText = compound.mechanism || compound.description

  const confidence =
    compound.confidence ??
    calculateCompoundConfidence({
      mechanism: compound.mechanism,
      effects: compound.effects,
      compounds: compound.herbs,
    })

  const completeness = getCompoundDataCompleteness({
    mechanism: compound.mechanism,
    effects: compound.effects,
    contraindications: compound.contraindications,
    interactions: compound.interactions,
    herbs: compound.herbs,
  })

  const primaryEffects = extractPrimaryEffects(compound.effects, 4)

  const keyFields = pickNonEmptyKeys(
    {
      mechanism: compound.mechanism,
      effects: compound.effects,
      contraindications: compound.contraindications,
      herbs: compound.herbs,
    },
    ['mechanism', 'effects', 'contraindications', 'herbs']
  )
  const shouldShowContributionCta = keyFields.length < 3

  // Derive a display class — category only if it's meaningful
  const displayClass =
    compound.className || (compound.category !== 'Uncategorized' ? compound.category : '')

  return (
    <main className='container mx-auto max-w-4xl px-4 py-8 text-white'>
      <Meta
        title={`${compound.name} | The Hippie Scientist`}
        description={compound.description || `Compound profile for ${compound.name}.`}
        path={`/compounds/${compound.slug}`}
      />
      <Link to='/compounds' className='btn-secondary inline-flex items-center'>
        ← Back to compounds
      </Link>

      <article className='ds-card-lg mt-4'>
        {/* Header */}
        <header>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <h1 className='text-3xl font-semibold leading-tight'>{compound.name}</h1>
            {displayClass && (
              <span className='bg-white/6 mt-1 shrink-0 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80'>
                {displayClass}
              </span>
            )}
          </div>
          <DataTrustPanel entity='compound' confidence={confidence} completeness={completeness} />
        </header>

        {/* Primary effects pills */}
        {primaryEffects.length > 0 && (
          <div className='mt-5 flex flex-wrap gap-2'>
            {primaryEffects.map(effect => (
              <span
                key={effect}
                className='rounded-full border border-violet-300/35 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-100'
              >
                {effect}
              </span>
            ))}
          </div>
        )}

        {/* Core fields — only render when value is present */}
        {compound.description && <Section title='Overview'>{compound.description}</Section>}

        {(doesText || whyItMatters) && (
          <Section title='Why This Compound Matters'>
            <div className='space-y-2'>
              {doesText && (
                <p>
                  <span className='font-semibold text-white'>What it does:</span> {doesText}
                </p>
              )}
              {whyItMatters && (
                <p>
                  <span className='font-semibold text-white'>Why it matters:</span> This helps
                  explain why {compound.name} is discussed in herbal profiles for{' '}
                  {linkedHerbs.length > 0 ? `${linkedHerbs.length} herb(s)` : 'multiple herbs'}.
                  Commonly tracked outcomes include {whyItMatters}.
                </p>
              )}
            </div>
          </Section>
        )}

        {compound.mechanism && <Section title='Mechanism of Action'>{compound.mechanism}</Section>}

        {compound.effects.length > 0 && (
          <Section title='Effects'>
            <ListSection items={compound.effects} />
          </Section>
        )}

        {compound.therapeuticUses.length > 0 && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <Collapse title='Traditional & Therapeutic Use'>
              <div className='text-sm leading-relaxed text-white/85'>
                <ListSection items={compound.therapeuticUses} />
              </div>
            </Collapse>
          </section>
        )}

        {/* Safety */}
        {(compound.contraindications.length > 0 ||
          compound.interactions.length > 0 ||
          compound.sideEffects.length > 0) && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <Collapse title='Safety Notes'>
              <div className='space-y-4 text-sm leading-relaxed text-white/85'>
                {compound.contraindications.length > 0 && (
                  <div>
                    <h3 className='mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55'>
                      Contraindications
                    </h3>
                    <ul className='space-y-2'>
                      {compound.contraindications.map(item => (
                        <li
                          key={item}
                          className='rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-rose-100'
                        >
                          <span aria-hidden='true' className='mr-1'>
                            ⚠
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {compound.interactions.length > 0 && (
                  <div>
                    <h3 className='mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55'>
                      Drug Interactions
                    </h3>
                    <ListSection items={compound.interactions} />
                  </div>
                )}
                {compound.sideEffects.length > 0 && (
                  <div>
                    <h3 className='mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55'>
                      Side Effects
                    </h3>
                    <ListSection items={compound.sideEffects} />
                  </div>
                )}
              </div>
            </Collapse>
          </section>
        )}

        {/* Associated herbs */}
        <section className='border-white/8 mt-6 border-t pt-5'>
          <Collapse title='Related Herbs'>
            <div className='text-sm leading-relaxed text-white/85'>
              {linkedHerbs.length > 0 ? (
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  {linkedHerbs.map(herb => (
                    <RelatedHerbCard key={herb.slug} herb={herb} />
                  ))}
                </div>
              ) : (
                <div className='rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-5 text-sm text-white/65'>
                  No related herb profiles found yet for this compound.
                </div>
              )}
            </div>
          </Collapse>
        </section>

        {/* Practical info */}
        {compound.dosage && <Section title='Dosage'>{compound.dosage}</Section>}
        {compound.duration && <Section title='Duration'>{compound.duration}</Section>}

        {/* Sources */}
        {compound.sources.length > 0 && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <Collapse title='References'>
              <ol className='list-decimal space-y-1 pl-5 text-sm leading-relaxed text-white/85'>
                {compound.sources.map((source, index) => (
                  <li key={`${source.url}-${index}`}>
                    {/^https?:\/\//i.test(source.url) ? (
                      <a href={source.url} target='_blank' rel='noreferrer' className='link'>
                        {source.title}
                      </a>
                    ) : (
                      source.title
                    )}
                    {source.note && <span className='ml-2 text-white/55'>— {source.note}</span>}
                  </li>
                ))}
              </ol>
            </Collapse>
          </section>
        )}

        {compound.lastUpdated && (
          <Section title='Last Updated'>
            <span className='text-white/50'>{compound.lastUpdated}</span>
          </Section>
        )}

        {shouldShowContributionCta && (
          <div className='bg-cyan-300/8 mt-8 rounded-2xl border border-cyan-300/30 p-4 text-sm text-cyan-50'>
            <p className='font-semibold'>Help improve this entry</p>
            <p className='mt-1 text-cyan-100/80'>
              This compound is missing key evidence fields. Submit a source or correction to
              strengthen this profile.
            </p>
            <div className='mt-3 flex flex-wrap gap-2'>
              <Link to='/contribute' className='btn-secondary'>
                Contribute data
              </Link>
              <a href={ISSUE_TEMPLATE_URL} target='_blank' rel='noreferrer' className='btn-primary'>
                Submit a source
              </a>
            </div>
          </div>
        )}
      </article>
    </main>
  )
}
