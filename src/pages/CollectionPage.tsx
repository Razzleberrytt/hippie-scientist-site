import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import {
  SEO_COLLECTIONS,
  getCollectionBySlug,
  type SeoCollectionFilters,
} from '@/data/seoCollections'
import { useCompoundData } from '@/lib/compound-data'
import { useHerbData } from '@/lib/herb-data'
import type { ConfidenceLevel } from '@/utils/calculateConfidence'

type PrebuiltCombo = {
  id: string
  name: string
  items: string[]
  goal: 'relaxation' | 'focus' | 'sleep' | 'mood' | 'energy'
  description: string
}

function toTokens(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(item => String(item).toLowerCase())
  if (typeof value === 'string') return value.toLowerCase().split(/[;,|]/)
  return []
}

function toSearchBlob(fields: unknown[]): string {
  return fields
    .flatMap(field => toTokens(field))
    .map(token => token.trim())
    .filter(Boolean)
    .join(' ')
}

function matchesAny(blob: string, terms?: string[]) {
  if (!terms?.length) return true
  return terms.some(term => blob.includes(term.toLowerCase()))
}

function confidenceTone(level?: ConfidenceLevel) {
  if (level === 'high')
    return {
      label: 'High confidence',
      className: 'border-emerald-300/45 bg-emerald-500/12 text-emerald-100',
      note: 'Structured fields are more complete for this entry.',
    }
  if (level === 'medium')
    return {
      label: 'Medium confidence',
      className: 'border-amber-300/40 bg-amber-500/12 text-amber-100',
      note: 'Some key fields are present, but context is still partial.',
    }
  return {
    label: 'Low confidence',
    className: 'border-rose-300/45 bg-rose-500/12 text-rose-100',
    note: 'Use extra caution: this entry has limited structured detail.',
  }
}

function filterHerbByCollection(
  herb: Record<string, unknown>,
  filters: SeoCollectionFilters
): boolean {
  const effectBlob = toSearchBlob([herb.effects, herb.description])
  const mechanismBlob = toSearchBlob([herb.mechanism, herb.mechanismOfAction])
  const interactionBlob = toSearchBlob([herb.interactionTags, herb.interactions, herb.tags])

  const effectsMatch = matchesAny(effectBlob, filters.effectsAny)
  const mechanismMatch = matchesAny(mechanismBlob, filters.mechanismAny)
  const interactionMatch = matchesAny(interactionBlob, filters.interactionTagsAny)

  return effectsMatch && mechanismMatch && interactionMatch
}

function filterCompoundByCollection(
  compound: Record<string, unknown>,
  filters: SeoCollectionFilters
): boolean {
  const effectBlob = toSearchBlob([compound.effects, compound.description])
  const mechanismBlob = toSearchBlob([compound.mechanism])
  const interactionBlob = toSearchBlob([
    compound.interactionTags,
    compound.interactions,
    compound.category,
  ])

  const effectsMatch = matchesAny(effectBlob, filters.effectsAny)
  const mechanismMatch = matchesAny(mechanismBlob, filters.mechanismAny)
  const interactionMatch = matchesAny(interactionBlob, filters.interactionTagsAny)

  return effectsMatch && mechanismMatch && interactionMatch
}

function filterComboByCollection(combo: PrebuiltCombo, filters: SeoCollectionFilters): boolean {
  const goalMatch = !filters.comboGoalsAny?.length || filters.comboGoalsAny.includes(combo.goal)
  const nameMatch = matchesAny(combo.name.toLowerCase(), filters.comboNameAny)
  const descriptionMatch = matchesAny(combo.description.toLowerCase(), filters.comboDescriptionAny)
  return goalMatch && (nameMatch || descriptionMatch)
}

export default function CollectionPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const collection = getCollectionBySlug(slug)
  const herbs = useHerbData()
  const compounds = useCompoundData()
  const [combos, setCombos] = useState<PrebuiltCombo[]>([])

  useEffect(() => {
    let alive = true
    if (!collection || collection.itemType !== 'combo') return () => {}

    fetch('/data/prebuiltCombos.json', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('Failed to load combos')
        return response.json()
      })
      .then(payload => {
        if (!alive) return
        const rows = Array.isArray(payload) ? payload : []
        setCombos(rows as PrebuiltCombo[])
      })
      .catch(() => {
        if (!alive) return
        setCombos([])
      })

    return () => {
      alive = false
    }
  }, [collection])

  const herbMatches = useMemo(() => {
    if (!collection || collection.itemType !== 'herb') return []
    return herbs.filter(herb =>
      filterHerbByCollection(herb as Record<string, unknown>, collection.filters)
    )
  }, [collection, herbs])

  const compoundMatches = useMemo(() => {
    if (!collection || collection.itemType !== 'compound') return []
    return compounds.filter(compound =>
      filterCompoundByCollection(compound as Record<string, unknown>, collection.filters)
    )
  }, [collection, compounds])

  const comboMatches = useMemo(() => {
    if (!collection || collection.itemType !== 'combo') return []
    return combos.filter(combo => filterComboByCollection(combo, collection.filters))
  }, [collection, combos])

  const itemCount = herbMatches.length + compoundMatches.length + comboMatches.length
  const relatedCollections = (collection?.relatedSlugs || [])
    .map(itemSlug => SEO_COLLECTIONS.find(entry => entry.slug === itemSlug))
    .filter((entry): entry is (typeof SEO_COLLECTIONS)[number] => Boolean(entry))

  if (!collection) {
    return (
      <main className='container-page py-8 text-white/80'>
        <p>Collection not found.</p>
      </main>
    )
  }

  const pagePath = `/collections/${collection.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    description: collection.description,
    url: `https://thehippiescientist.net${pagePath}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        ...herbMatches.map((herb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: herb.common || herb.scientific || herb.name || herb.slug,
          url: `https://thehippiescientist.net/herbs/${herb.slug}`,
        })),
        ...compoundMatches.map((compound, index) => ({
          '@type': 'ListItem',
          position: herbMatches.length + index + 1,
          name: compound.name,
          url: `https://thehippiescientist.net/compounds/${compound.slug}`,
        })),
        ...comboMatches.map((combo, index) => ({
          '@type': 'ListItem',
          position: herbMatches.length + compoundMatches.length + index + 1,
          name: combo.name,
          url: `https://thehippiescientist.net/interactions`,
        })),
      ],
    },
  }

  return (
    <main className='container-page py-8'>
      <Meta
        title={`${collection.title} | The Hippie Scientist`}
        description={collection.description}
        path={pagePath}
        jsonLd={jsonLd}
        og={{
          title: `${collection.title} | The Hippie Scientist`,
          description: collection.description,
        }}
      />

      <header className='ds-card-lg'>
        <h1 className='text-3xl font-semibold text-white'>{collection.title}</h1>
        <p className='mt-3 max-w-3xl text-sm leading-7 text-white/80'>{collection.intro}</p>
        <p className='mt-3 text-xs text-white/65'>
          {itemCount} matching entries in this collection.
        </p>
      </header>

      <section className='mt-5 flex flex-wrap gap-2'>
        {collection.cta === 'interaction-checker' && (
          <Link to='/interactions' className='btn-primary'>
            Try in Interaction Checker
          </Link>
        )}
        {(collection.secondaryCta === 'stack-builder' || collection.cta === 'stack-builder') && (
          <Link to='/build' className='btn-secondary'>
            Build this into a stack
          </Link>
        )}
      </section>

      {collection.itemType === 'herb' && herbMatches.length > 0 && (
        <section className='mt-6 grid gap-3 sm:grid-cols-2'>
          {herbMatches.slice(0, 30).map(herb => {
            const tone = confidenceTone(herb.confidence)
            return (
              <article key={herb.slug} className='ds-card p-4'>
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <h2 className='text-sm font-semibold text-white'>
                    {herb.common || herb.scientific || herb.name || herb.slug}
                  </h2>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${tone.className}`}>
                    {tone.label}
                  </span>
                </div>
                <p className='mt-2 text-xs text-white/75'>
                  {herb.description ||
                    herb.effects?.slice(0, 2).join(' · ') ||
                    'See herb profile for details.'}
                </p>
                <p className='mt-2 text-[11px] text-white/55'>{tone.note}</p>
                <Link
                  to={`/herbs/${herb.slug}`}
                  className='mt-3 inline-flex text-xs text-emerald-200 hover:text-emerald-100'
                >
                  View herb details →
                </Link>
              </article>
            )
          })}
        </section>
      )}

      {collection.itemType === 'compound' && compoundMatches.length > 0 && (
        <section className='mt-6 grid gap-3 sm:grid-cols-2'>
          {compoundMatches.slice(0, 30).map(compound => {
            const tone = confidenceTone(compound.confidence)
            return (
              <article key={compound.id} className='ds-card p-4'>
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <h2 className='text-sm font-semibold text-white'>{compound.name}</h2>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${tone.className}`}>
                    {tone.label}
                  </span>
                </div>
                <p className='mt-2 text-xs text-white/75'>
                  {compound.description ||
                    compound.effects?.slice(0, 2).join(' · ') ||
                    'See compound profile for mechanism and safety details.'}
                </p>
                <p className='mt-2 text-[11px] text-white/55'>{tone.note}</p>
                <Link
                  to={`/compounds/${compound.slug}`}
                  className='mt-3 inline-flex text-xs text-emerald-200 hover:text-emerald-100'
                >
                  View compound details →
                </Link>
              </article>
            )
          })}
        </section>
      )}

      {collection.itemType === 'combo' && comboMatches.length > 0 && (
        <section className='mt-6 grid gap-3 sm:grid-cols-2'>
          {comboMatches.map(combo => (
            <article key={combo.id} className='ds-card p-4'>
              <div className='flex items-center justify-between gap-2'>
                <h2 className='text-sm font-semibold text-white'>{combo.name}</h2>
                <span className='rounded-full border border-cyan-300/40 bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-100'>
                  {combo.goal}
                </span>
              </div>
              <p className='mt-2 text-xs text-white/80'>{combo.description}</p>
              <p className='mt-2 text-xs text-white/65'>{combo.items.join(' + ')}</p>
              <div className='mt-3 flex flex-wrap gap-2'>
                <Link to='/interactions' className='btn-secondary text-xs'>
                  Test combo in checker
                </Link>
                <Link to='/build' className='btn-secondary text-xs'>
                  Send to stack builder
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}

      {itemCount === 0 && (
        <section className='mt-6 rounded-xl border border-amber-300/35 bg-amber-500/10 p-4 text-sm text-amber-100'>
          This collection currently has no qualifying entries from canonical data fields.
        </section>
      )}

      <section className='mt-8 grid gap-4 lg:grid-cols-2'>
        <div className='ds-card p-4'>
          <h2 className='text-sm font-semibold text-white'>Related collections</h2>
          <div className='mt-3 flex flex-wrap gap-2'>
            {relatedCollections.map(related => (
              <Link
                key={related.slug}
                to={`/collections/${related.slug}`}
                className='btn-secondary text-xs'
              >
                {related.title}
              </Link>
            ))}
          </div>
        </div>
        <div className='ds-card p-4'>
          <h2 className='text-sm font-semibold text-white'>Go deeper</h2>
          <p className='mt-2 text-xs text-white/70'>
            Use the interaction checker for overlap screening, then move to stack builder to
            structure your experiment plan.
          </p>
          <div className='mt-3 flex flex-wrap gap-2'>
            <Link to='/interactions' className='btn-secondary text-xs'>
              Open Interaction Checker
            </Link>
            <Link to='/build' className='btn-secondary text-xs'>
              Open Stack Builder
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
