import { type ReactNode, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import InfoTooltip from '@/components/InfoTooltip'
import DataTrustPanel from '@/components/trust/DataTrustPanel'
import { useHerbDataState } from '@/lib/herb-data'
import { useCompoundDataState } from '@/lib/compound-data'
import { HerbDetailSkeleton } from '@/components/skeletons/DetailSkeletons'
import { pickNonEmptyKeys } from '@/lib/nonEmptyFields'
import { extractPrimaryEffects } from '@/utils/extractPrimaryEffects'
import { getHerbDataCompleteness } from '@/utils/getDataCompleteness'
import { splitClean } from '@/lib/sanitize'
import { pushRecentlyViewed, useSavedItems } from '@/lib/growth'
import { breadcrumbJsonLd, herbJsonLd, SITE_URL } from '@/lib/seo'
import RecommendedProducts from '@/components/RecommendedProducts'
import Collapse from '@/components/ui/Collapse'

const ISSUE_TEMPLATE_URL =
  'https://github.com/Razzleberrytt/survive-99-evolved/issues/new?template=evidence-update.yml'

type SourceRef = { title: string; url: string; note?: string }

function toSources(value: unknown): SourceRef[] {
  if (!Array.isArray(value)) return []
  return value
    .map(item => {
      if (typeof item === 'string') {
        const t = item.trim()
        return t ? { title: t, url: t } : null
      }
      if (!item || typeof item !== 'object') return null
      const source = item as Record<string, unknown>
      const title = String(source.title || source.url || '').trim()
      const url = String(source.url || '').trim()
      if (!title && !url) return null
      const note = String(source.note || '').trim()
      return { title: title || url, url: url || title, note: note || undefined }
    })
    .filter((item): item is SourceRef => Boolean(item))
}

// Only renders if children is a non-empty string, non-empty array, or explicit ReactNode
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

function TagList({
  items,
  variant = 'default',
}: {
  items: string[]
  variant?: 'default' | 'warning' | 'accent'
}) {
  if (!items.length) return null
  const cls =
    variant === 'warning'
      ? 'rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-rose-100'
      : variant === 'accent'
        ? 'rounded-full border border-violet-300/35 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-100'
        : 'ds-pill'
  return (
    <div className='flex flex-wrap gap-2'>
      {items.map(item => (
        <span key={item} className={cls}>
          {variant === 'warning' && (
            <span aria-hidden='true' className='mr-1'>
              ⚠
            </span>
          )}
          {item}
        </span>
      ))}
    </div>
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

function normalizeKey(value: string) {
  return value.trim().toLowerCase()
}

export default function HerbDetail() {
  const { slug = '' } = useParams()
  const { herbs, isLoading } = useHerbDataState()
  const { compounds } = useCompoundDataState()
  const { toggle, isSaved } = useSavedItems()
  const herb = herbs.find(item => item.slug === slug)

  useEffect(() => {
    if (!herb?.slug) return
    pushRecentlyViewed({
      type: 'herb',
      slug: herb.slug,
      title: herb.common || herb.name || herb.slug,
      href: `/herbs/${herb.slug}`,
    })
  }, [herb?.slug, herb?.common, herb?.name])

  if (isLoading) {
    return <HerbDetailSkeleton />
  }

  if (!herb) {
    return (
      <main className='container mx-auto max-w-3xl px-4 py-10 text-white'>
        <p className='text-white/60'>Herb profile not found.</p>
        <Link to='/herbs' className='btn-secondary mt-4 inline-flex'>
          ← Back to herbs
        </Link>
      </main>
    )
  }

  // All list fields are already cleaned arrays from herb-data.ts
  const effects = Array.isArray(herb.effects) ? herb.effects : splitClean(herb.effects)
  const activeCompounds = Array.isArray(herb.activeCompounds)
    ? herb.activeCompounds
    : splitClean(herb.activeCompounds)
  const contraindications = Array.isArray(herb.contraindications)
    ? herb.contraindications
    : splitClean(herb.contraindications)
  const interactions = Array.isArray(herb.interactions)
    ? herb.interactions
    : splitClean(herb.interactions)
  const therapeuticUses = Array.isArray(herb.therapeuticUses)
    ? herb.therapeuticUses
    : splitClean(herb.therapeuticUses)
  const sideEffects = Array.isArray(herb.sideeffects)
    ? herb.sideeffects
    : splitClean(herb.sideeffects)
  const sources = toSources(herb.sources)
  const primaryEffects = extractPrimaryEffects(effects, 4)
  const compoundByName = new Map(compounds.map(compound => [normalizeKey(compound.name), compound]))
  const linkedCompounds = activeCompounds.map(name => {
    const record = compoundByName.get(normalizeKey(name))
    return {
      name,
      slug: record?.slug || '',
      explanation: record?.mechanism || record?.description || '',
      whyItMatters: record?.effects?.slice(0, 2).join(' + ') || '',
    }
  })

  const herbDisplayName = herb.commonName || herb.common || herb.name || herb.slug
  const herbMetaDescriptionSource = (
    herb.summary ||
    herb.description ||
    therapeuticUses[0] ||
    effects.slice(0, 2).join(', ')
  ).trim()
  const herbMetaDescription =
    herbMetaDescriptionSource.slice(0, 155) ||
    `${herbDisplayName} herb profile with effects, safety notes, and practical context.`
  const herbMetaTitle = `${herbDisplayName} — Uses, Effects & Safety | The Hippie Scientist`

  const compoundKeys = new Set(activeCompounds.map(normalizeKey))
  const relatedHerbs = herbs
    .filter(other => other.slug !== herb.slug)
    .map(other => {
      const otherCompounds = Array.isArray(other.activeCompounds) ? other.activeCompounds : []
      const sharedCompounds = otherCompounds.filter(item => compoundKeys.has(normalizeKey(item)))
      return {
        slug: String(other.slug || ''),
        name: String(other.common || other.name || other.slug),
        sharedCompounds,
      }
    })
    .filter(item => item.slug && item.sharedCompounds.length > 0)
    .sort((a, b) => b.sharedCompounds.length - a.sharedCompounds.length)
    .slice(0, 4)

  // Scalar fields already cleaned by normalization
  const description = herb.description || ''
  const mechanism = herb.mechanism || ''
  const intensity = herb.intensity || ''
  const region = herb.region || ''
  const duration = herb.duration || ''
  const dosage = herb.dosage || ''
  const preparation = herb.preparation || ''
  const legalStatus = herb.legalStatus || ''
  const herbClass = String(herb.class || herb.category || '')
  const lastUpdated = String((herb as Record<string, unknown>).lastUpdated || '').trim()

  const confidence =
    herb.confidence === 'high' || herb.confidence === 'medium' ? herb.confidence : 'low'

  const completeness = getHerbDataCompleteness({
    mechanism,
    effects,
    activeCompounds,
    contraindications,
  })

  const keyFields = pickNonEmptyKeys(
    { mechanism, effects, activeCompounds, contraindications, interactions, sources },
    ['mechanism', 'effects', 'activeCompounds', 'contraindications', 'interactions', 'sources']
  )
  const isDataIncomplete = keyFields.length < 3

  const renderableKeys = pickNonEmptyKeys(
    { herbClass, activeCompounds, therapeuticUses, contraindications, interactions, legalStatus },
    [
      'herbClass',
      'activeCompounds',
      'therapeuticUses',
      'contraindications',
      'interactions',
      'legalStatus',
    ]
  )
  const missingFieldCount = 6 - renderableKeys.length
  const shouldShowContributionCta = renderableKeys.length < 5

  return (
    <main className='container mx-auto max-w-4xl px-4 py-8 text-white'>
      <Meta
        title={herbMetaTitle}
        description={herbMetaDescription}
        path={`/herbs/${herb.slug}`}
        image={`/og/herb/${herb.slug}.png`}
        jsonLd={[
          herbJsonLd({
            name: herbDisplayName,
            slug: herb.slug,
            description: herbMetaDescription,
            latinName: herb.scientific || herb.latinName,
          }),
          breadcrumbJsonLd([
            { name: 'Home', url: SITE_URL },
            { name: 'Herbs', url: `${SITE_URL}/herbs` },
            { name: herbDisplayName, url: `${SITE_URL}/herbs/${herb.slug}` },
          ]),
        ]}
      />
      <Link to='/herbs' className='btn-secondary inline-flex items-center'>
        ← Back to herbs
      </Link>
      <button
        type='button'
        className='ml-2 inline-flex rounded-full border border-white/20 px-3 py-1 text-sm text-white/85'
        onClick={() =>
          toggle({
            type: 'herb',
            slug: herb.slug,
            title: herb.common || herb.name || herb.slug,
            href: `/herbs/${herb.slug}`,
            note: description,
          })
        }
      >
        {isSaved('herb', herb.slug) ? '★ Favorited' : '☆ Favorite'}
      </button>

      <article className='ds-card-lg mt-4'>
        {/* Header */}
        <header>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <h1 className='text-3xl font-semibold leading-tight'>{herb.common || herb.name}</h1>
              {herb.scientific && (
                <p className='mt-1 text-sm italic text-white/55'>{herb.scientific}</p>
              )}
            </div>
            {intensity && (
              <span className='bg-white/6 mt-1 shrink-0 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80'>
                {intensity}
              </span>
            )}
          </div>

          <DataTrustPanel entity='herb' confidence={confidence} completeness={completeness} />

          {isDataIncomplete && (
            <div className='bg-amber-500/8 mt-4 rounded-xl border border-amber-300/30 p-3 text-sm text-amber-100'>
              <p className='font-semibold'>Incomplete profile</p>
              <p className='mt-1 text-amber-50/80'>
                Key evidence fields are missing. Treat this as a draft — cross-check before making
                decisions.
              </p>
            </div>
          )}
        </header>

        {/* Primary effects pills — high-signal summary */}
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

        {/* Core content */}
        {description && <Section title='Overview'>{description}</Section>}

        {herbClass && <Section title='Class'>{herbClass}</Section>}

        {mechanism && <Section title='Mechanism of Action'>{mechanism}</Section>}

        {linkedCompounds.length > 0 && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <Collapse title='Key Active Compounds'>
              <div className='space-y-3 text-sm leading-relaxed text-white/85'>
                <div className='flex flex-wrap gap-2'>
                  {linkedCompounds.map(compound =>
                    compound.slug ? (
                      <Link
                        key={compound.name}
                        to={`/compounds/${encodeURIComponent(compound.slug)}`}
                        className='ds-pill transition hover:border-white/30'
                      >
                        {compound.name}
                      </Link>
                    ) : (
                      <span key={compound.name} className='ds-pill'>
                        {compound.name}
                      </span>
                    )
                  )}
                </div>
                <div className='space-y-2 text-white/75'>
                  {linkedCompounds.slice(0, 3).map(compound => (
                    <p key={`${compound.name}-summary`}>
                      <span className='font-semibold text-white'>{compound.name}:</span>{' '}
                      {compound.explanation || 'Mechanism summary is still being expanded.'}{' '}
                      {compound.whyItMatters ? `Why it matters: ${compound.whyItMatters}.` : ''}
                    </p>
                  ))}
                </div>
              </div>
            </Collapse>
          </section>
        )}

        {relatedHerbs.length > 0 && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <Collapse title='Related Herbs via Shared Compounds'>
              <div className='space-y-2 text-sm leading-relaxed text-white/85'>
                {relatedHerbs.map(other => (
                  <p key={other.slug}>
                    <Link className='link' to={`/herbs/${encodeURIComponent(other.slug)}`}>
                      {other.name}
                    </Link>{' '}
                    shares {other.sharedCompounds.join(', ')}.
                  </p>
                ))}
              </div>
            </Collapse>
          </section>
        )}

        {effects.length > 0 && (
          <Section title='Effects'>
            <ListSection items={effects} />
          </Section>
        )}

        {therapeuticUses.length > 0 && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <Collapse title='Traditional & Therapeutic Use'>
              <div className='text-sm leading-relaxed text-white/85'>
                <ListSection items={therapeuticUses} />
              </div>
            </Collapse>
          </section>
        )}

        {/* Safety — always prominent if present */}
        {contraindications.length > 0 && (
          <Section title='Contraindications'>
            <TagList items={contraindications} variant='warning' />
          </Section>
        )}

        {(interactions.length > 0 || sideEffects.length > 0) && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <Collapse title='Additional Safety Notes'>
              <div className='space-y-4 text-sm leading-relaxed text-white/85'>
                {interactions.length > 0 && (
                  <div>
                    <h3 className='mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55'>
                      Drug Interactions
                    </h3>
                    <ListSection items={interactions} />
                  </div>
                )}
                {sideEffects.length > 0 && (
                  <div>
                    <h3 className='mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55'>
                      Side Effects
                    </h3>
                    <ListSection items={sideEffects} />
                  </div>
                )}
              </div>
            </Collapse>
          </section>
        )}

        {/* Practical info — only render if value exists */}
        {dosage && <Section title='Dosage'>{dosage}</Section>}
        {duration && <Section title='Duration'>{duration}</Section>}
        {preparation && <Section title='Preparation'>{preparation}</Section>}
        <section className='border-white/8 mt-6 border-t pt-5'>
          <Collapse title='Product Recommendations'>
            <div className='text-sm leading-relaxed text-white/85'>
              <RecommendedProducts herb={herb} showTitle={false} />
            </div>
          </Collapse>
        </section>
        {region && <Section title='Region'>{region}</Section>}
        {legalStatus && <Section title='Legal Status'>{legalStatus}</Section>}

        {/* Sources */}
        {sources.length > 0 && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <Collapse title='References'>
              <ol className='list-decimal space-y-1 pl-5 text-sm leading-relaxed text-white/85'>
                {sources.map((source, index) => (
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

        {lastUpdated && (
          <Section title='Last Updated'>
            <span className='text-white/50'>{lastUpdated}</span>
          </Section>
        )}

        {/* Contribute CTA — only when data is thin */}
        {shouldShowContributionCta && (
          <div className='bg-cyan-300/8 mt-8 rounded-2xl border border-cyan-300/30 p-4 text-sm text-cyan-50'>
            <p className='font-semibold'>Help improve this entry</p>
            <p className='mt-1 text-cyan-100/80'>
              Submit a source or correction to strengthen mechanism, safety, or reference quality.
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

        {/* Data completeness footer */}
        <div className='bg-white/3 mt-6 flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-white/50'>
          <span aria-hidden='true'>ℹ</span>
          {missingFieldCount > 0
            ? `${missingFieldCount} core evidence field${missingFieldCount !== 1 ? 's' : ''} still incomplete.`
            : 'All core evidence fields present for this profile.'}
          <InfoTooltip text='Values with published studies should be cross-checked against the Sources section.' />
        </div>
      </article>
    </main>
  )
}
