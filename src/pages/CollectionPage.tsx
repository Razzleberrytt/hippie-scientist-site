import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import {
  SEO_COLLECTIONS,
  getCollectionBySlug,
  type SeoCollection,
  type SeoCollectionFilters,
} from '@/data/seoCollections'
import { useCompoundData } from '@/lib/compound-data'
import { useHerbData } from '@/lib/herb-data'
import { submitLeadCapture } from '@/lib/leadCapture'
import { trackCollectionEvent } from '@/lib/collectionTracking'
import type { ConfidenceLevel } from '@/utils/calculateConfidence'
import { type ComboGoal, type PrebuiltCombo } from '@/types/combos'
import { normalizeLookupToken } from '@/utils/normalizeToken'

type CollectionHerb = ReturnType<typeof useHerbData>[number]
type CollectionCompound = ReturnType<typeof useCompoundData>[number]
type CollectionEntity = CollectionHerb | CollectionCompound

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

function inferGoalFromCollection(collection: SeoCollection): ComboGoal | null {
  const source = `${collection.slug} ${collection.title}`.toLowerCase()
  if (source.includes('relax')) return 'relaxation'
  if (source.includes('sleep')) return 'sleep'
  if (source.includes('focus')) return 'focus'
  if (source.includes('mood')) return 'mood'
  if (source.includes('energy')) return 'energy'
  return null
}

function getEntityName(item: CollectionEntity): string {
  return 'common' in item
    ? item.common || item.scientific || item.name || item.slug
    : item.name || item.slug
}

function buildInteractionsLink(tokens: string[]): string {
  if (!tokens.length) return '/interactions'
  return `/interactions?items=${tokens.join(',')}`
}

function toGoalLabel(collection: SeoCollection): string {
  return collection.title
    .replace(/^Herbs for\s*/i, '')
    .replace(/^Compounds for\s*/i, '')
    .trim()
}

function buildSeoDescription(collection: SeoCollection): string {
  const goal = toGoalLabel(collection)
  return `Compare herbs for ${goal.toLowerCase()}, spot interaction risks fast, and build a safer stack in minutes.`
}

function summarizeItemValue(item: CollectionEntity): string {
  const rawEffects = 'common' in item ? item.effects : item.effects
  if (Array.isArray(rawEffects) && rawEffects.length > 0) {
    return rawEffects[0]
  }

  const description = 'common' in item ? item.description : item.description
  if (typeof description === 'string') {
    const [first] = description.split(/[.;]/)
    if (first?.trim()) return first.trim()
  }

  return 'general wellness support'
}

function CollectionFunnelCta({
  title,
  description,
  checkerHref,
  stackHref,
  comboHref,
  onCheckerClick,
  onStackClick,
  onComboClick,
}: {
  title: string
  description: string
  checkerHref: string
  stackHref: string
  comboHref?: string
  onCheckerClick: () => void
  onStackClick: () => void
  onComboClick: () => void
}) {
  return (
    <section className='sticky top-16 z-20 rounded-xl border border-cyan-300/30 bg-slate-950/90 p-3 backdrop-blur md:top-20 md:p-4'>
      <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
        <div>
          <h2 className='text-sm font-semibold text-white'>{title}</h2>
          <p className='text-xs text-white/70'>{description}</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Link to={checkerHref} onClick={onCheckerClick} className='btn-primary text-xs'>
            Check interactions for this category
          </Link>
          <Link to={stackHref} onClick={onStackClick} className='btn-secondary text-xs'>
            Build a stack from these items
          </Link>
          {comboHref ? (
            <Link to={comboHref} onClick={onComboClick} className='btn-secondary text-xs'>
              Try a popular combo
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default function CollectionPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const location = useLocation()
  const collection = getCollectionBySlug(slug)
  const herbs = useHerbData()
  const compounds = useCompoundData()
  const [combos, setCombos] = useState<PrebuiltCombo[]>([])
  const [showLeadCapture, setShowLeadCapture] = useState(false)
  const [leadCaptured, setLeadCaptured] = useState(false)
  const [leadEmail, setLeadEmail] = useState('')
  const [leadStatus, setLeadStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [leadMessage, setLeadMessage] = useState('')
  const [shareToast, setShareToast] = useState('')

  useEffect(() => {
    let alive = true

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
  }, [])

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

  const topItems = useMemo(() => {
    if (collection?.itemType === 'herb') return herbMatches.slice(0, 3)
    if (collection?.itemType === 'compound') return compoundMatches.slice(0, 3)
    return []
  }, [collection?.itemType, herbMatches, compoundMatches])

  const lookupByLabel = useMemo(() => {
    const map = new Map<string, string>()

    herbs.forEach(herb => {
      const token = encodeURIComponent(`herb:${herb.slug}`)
      ;[herb.slug, herb.common, herb.scientific, herb.name].forEach(label => {
        if (!label) return
        map.set(normalizeLookupToken(String(label)), token)
      })
    })

    compounds.forEach(compound => {
      const token = encodeURIComponent(`compound:${compound.slug}`)
      ;[compound.slug, compound.name].forEach(label => {
        if (!label) return
        map.set(normalizeLookupToken(String(label)), token)
      })
    })

    return map
  }, [compounds, herbs])

  const relatedCollections = (collection?.relatedSlugs || [])
    .map(itemSlug => SEO_COLLECTIONS.find(entry => entry.slug === itemSlug))
    .filter((entry): entry is (typeof SEO_COLLECTIONS)[number] => Boolean(entry))

  const relevantGoal = useMemo(() => {
    if (!collection) return null
    return inferGoalFromCollection(collection)
  }, [collection])

  const relatedGoalCombos = useMemo(() => {
    if (!relevantGoal || !combos.length) return []
    return combos.filter(combo => combo.goal === relevantGoal).slice(0, 4)
  }, [combos, relevantGoal])

  const featuredCombo = useMemo(() => {
    if (comboMatches.length > 0) return comboMatches[0]
    if (relatedGoalCombos.length > 0) return relatedGoalCombos[0]
    return null
  }, [comboMatches, relatedGoalCombos])

  const featuredTokens = useMemo(() => {
    if (!featuredCombo) return []
    const resolved = featuredCombo.items
      .map(item => lookupByLabel.get(normalizeLookupToken(item)))
      .filter((token): token is string => Boolean(token))
    return Array.from(new Set(resolved)).slice(0, 3)
  }, [featuredCombo, lookupByLabel])

  const primaryTokens = useMemo(() => {
    if (topItems.length) {
      return topItems.map(item => {
        const id = 'common' in item ? `herb:${item.slug}` : `compound:${item.slug}`
        return encodeURIComponent(id)
      })
    }
    return featuredTokens
  }, [featuredTokens, topItems])

  const checkerHref = buildInteractionsLink(primaryTokens)
  const stackHref = buildInteractionsLink(primaryTokens)
  const featuredComboHref = buildInteractionsLink(featuredTokens)
  const peopleAlsoExplore = useMemo(() => {
    if (!collection) return []
    return SEO_COLLECTIONS.filter(entry => entry.slug !== collection.slug)
      .filter(entry => entry.itemType === collection.itemType || entry.itemType === 'herb')
      .slice(0, 6)
  }, [collection])
  const quickValueItems = useMemo(
    () =>
      topItems.map(item => ({
        name: getEntityName(item),
        value: summarizeItemValue(item),
        slug: item.slug,
      })),
    [topItems]
  )
  const pageTitle = collection
    ? `Best Herbs for ${toGoalLabel(collection)} (Interactions + Stack Builder)`
    : 'Best Herbs Collections'
  const pageDescription = collection ? buildSeoDescription(collection) : ''

  useEffect(() => {
    if (!shareToast) return
    const timer = window.setTimeout(() => setShareToast(''), 2200)
    return () => window.clearTimeout(timer)
  }, [shareToast])

  useEffect(() => {
    if (!collection) return
    trackCollectionEvent('collection_page_view', {
      slug: collection.slug,
      itemType: collection.itemType,
      matchCount: itemCount,
    })
  }, [collection, itemCount])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(`hs_collection_lead_captured:${slug}`) === '1') {
      setLeadCaptured(true)
      return
    }

    const onScroll = () => {
      const max = Math.max(document.body.scrollHeight - window.innerHeight, 1)
      const ratio = window.scrollY / max
      if (ratio > 0.55) setShowLeadCapture(true)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [slug])

  if (!collection) {
    return (
      <main className='container-page py-8 text-white/80'>
        <p>Collection not found.</p>
      </main>
    )
  }

  const handleFunnelClick = (cta: 'checker' | 'stack' | 'combo') => {
    setShowLeadCapture(true)

    trackCollectionEvent('collection_cta_click', {
      slug: collection.slug,
      itemType: collection.itemType,
      cta,
    })

    if (cta === 'combo') {
      trackCollectionEvent('collection_combo_run', {
        slug: collection.slug,
        itemType: collection.itemType,
        comboId: featuredCombo?.id || 'unknown',
      })
    }
  }

  const onItemAction = (
    action: 'collection_item_add_to_checker' | 'collection_item_add_to_stack',
    item: CollectionEntity
  ) => {
    setShowLeadCapture(true)
    trackCollectionEvent(action, {
      slug: collection.slug,
      itemType: collection.itemType,
      itemSlug: item.slug,
      itemName: getEntityName(item),
    })
  }

  const submitCollectionLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLeadStatus('loading')
    setLeadMessage('')

    const result = await submitLeadCapture({
      email: leadEmail,
      source: 'interaction-checker',
      context: 'collection-page',
    })

    if (!result.ok) {
      setLeadStatus('error')
      setLeadMessage(result.message || 'Please check your email and try again.')
      return
    }

    setLeadStatus('success')
    setLeadCaptured(true)
    setLeadMessage('Thanks — you will get practical safety and stack-tool updates.')
    setLeadEmail('')
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`hs_collection_lead_captured:${slug}`, '1')
    }
    trackCollectionEvent('collection_lead_capture_submit', {
      slug: collection.slug,
      itemType: collection.itemType,
    })
  }

  const getShareUrl = () => {
    if (typeof window !== 'undefined') return window.location.href
    return `https://thehippiescientist.net${location.pathname}${location.search}`
  }

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl()
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setShareToast('Link copied')
        return
      }
    } catch {
      // no-op fallback below
    }
    setShareToast('Copy failed — copy URL from address bar')
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
          url: 'https://thehippiescientist.net/interactions',
        })),
      ],
    },
  }

  return (
    <main className='container-page py-8'>
      <Meta
        title={pageTitle}
        description={pageDescription}
        path={pagePath}
        jsonLd={jsonLd}
        image='/og/default.png'
        og={{
          title: pageTitle,
          description: pageDescription,
          image: '/og/default.png',
        }}
      />

      <header className='ds-card-lg'>
        <h1 className='text-3xl font-semibold text-white'>{collection.title}</h1>
        <p className='mt-3 max-w-3xl text-sm leading-7 text-white/80'>{collection.intro}</p>
        <p className='mt-3 text-xs text-white/65'>
          {itemCount} matching entries in this collection.
        </p>

        <div className='border-white/12 mt-4 rounded-xl border bg-black/20 p-3'>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200'>
            Why this page exists
          </p>
          <p className='mt-1 text-xs leading-6 text-white/75'>
            This collection is generated from real herb/compound records to speed up discovery, but
            decisions should still be validated item-by-item in the interaction checker and stack
            flow.
          </p>
        </div>

        <div className='mt-4 flex flex-wrap items-center gap-2'>
          <button type='button' onClick={handleCopyLink} className='btn-secondary text-xs'>
            Copy Link
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${pageTitle} — ${pageDescription}`)}&url=${encodeURIComponent(getShareUrl())}`}
            target='_blank'
            rel='noreferrer'
            className='btn-secondary text-xs'
          >
            Share (Twitter)
          </a>
          <a
            href={`https://www.reddit.com/submit?url=${encodeURIComponent(getShareUrl())}&title=${encodeURIComponent(pageTitle)}`}
            target='_blank'
            rel='noreferrer'
            className='btn-secondary text-xs'
          >
            Share (Reddit)
          </a>
          {shareToast ? (
            <span className='rounded-full border border-emerald-300/35 bg-emerald-500/15 px-2 py-1 text-[11px] text-emerald-100'>
              {shareToast}
            </span>
          ) : null}
        </div>
      </header>

      {quickValueItems.length > 0 && (
        <section className='mt-4 rounded-xl border border-cyan-300/25 bg-cyan-500/5 p-3'>
          <h2 className='text-sm font-semibold text-cyan-100'>
            Top 3 herbs people use for {toGoalLabel(collection).toLowerCase()}:
          </h2>
          <div className='mt-3 grid gap-2 sm:grid-cols-3'>
            {quickValueItems.slice(0, 3).map((item, index) => (
              <article
                key={item.slug}
                className='rounded-lg border border-cyan-200/20 bg-slate-900/60 p-2 text-xs'
              >
                <p className='text-cyan-100'>
                  {index + 1}. {item.name}
                </p>
                <p className='mt-1 text-white/70'>→ {item.value}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className='mt-4'>
        <CollectionFunnelCta
          title='Move from browsing to action'
          description='Open the checker with relevant items prefilled, then continue to stack + export.'
          checkerHref={checkerHref}
          stackHref={stackHref}
          comboHref={featuredTokens.length ? featuredComboHref : undefined}
          onCheckerClick={() => handleFunnelClick('checker')}
          onStackClick={() => handleFunnelClick('stack')}
          onComboClick={() => handleFunnelClick('combo')}
        />
      </section>

      {topItems.length > 0 && (
        <section className='mt-4 rounded-xl border border-white/10 bg-black/20 p-3'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <h2 className='text-sm font-semibold text-white'>Top items from this page</h2>
            <Link
              to={checkerHref}
              className='btn-secondary text-xs'
              onClick={() => handleFunnelClick('checker')}
            >
              Check top {collection.title.toLowerCase()}
            </Link>
          </div>
          <div className='mt-3 flex flex-wrap gap-2'>
            {topItems.map(item => {
              const itemId =
                collection.itemType === 'herb' ? `herb:${item.slug}` : `compound:${item.slug}`
              const href = buildInteractionsLink([encodeURIComponent(itemId)])

              return (
                <Link
                  key={item.slug}
                  to={href}
                  onClick={() =>
                    onItemAction('collection_item_add_to_checker', item as CollectionEntity)
                  }
                  className='bg-emerald-500/12 rounded-full border border-emerald-300/35 px-3 py-1 text-xs text-emerald-100 hover:bg-emerald-500/20'
                >
                  {getEntityName(item as CollectionEntity)}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {collection.itemType === 'herb' && herbMatches.length > 0 && (
        <section className='mt-6 grid gap-3 sm:grid-cols-2'>
          {herbMatches.slice(0, 30).map(herb => {
            const tone = confidenceTone(herb.confidence)
            const token = encodeURIComponent(`herb:${herb.slug}`)
            const itemHref = buildInteractionsLink([token])

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
                    (Array.isArray(herb.effects)
                      ? herb.effects.slice(0, 2).join(' · ')
                      : herb.effects) ||
                    'See herb profile for details.'}
                </p>
                <p className='mt-2 text-[11px] text-white/55'>{tone.note}</p>
                <div className='mt-3 flex flex-wrap gap-2'>
                  <Link
                    to={itemHref}
                    onClick={() => onItemAction('collection_item_add_to_checker', herb)}
                    className='btn-secondary text-xs'
                  >
                    Add to checker
                  </Link>
                  <Link
                    to={itemHref}
                    onClick={() => onItemAction('collection_item_add_to_stack', herb)}
                    className='btn-secondary text-xs'
                  >
                    Add to stack
                  </Link>
                  <Link
                    to={`/herbs/${herb.slug}`}
                    className='inline-flex items-center text-xs text-emerald-200 hover:text-emerald-100'
                  >
                    View herb details →
                  </Link>
                </div>
              </article>
            )
          })}
        </section>
      )}

      <section className='mt-5'>
        <CollectionFunnelCta
          title='Ready to check this set?'
          description='Run the interaction checker now, then continue into stack export.'
          checkerHref={checkerHref}
          stackHref={stackHref}
          comboHref={featuredTokens.length ? featuredComboHref : undefined}
          onCheckerClick={() => handleFunnelClick('checker')}
          onStackClick={() => handleFunnelClick('stack')}
          onComboClick={() => handleFunnelClick('combo')}
        />
      </section>

      {collection.itemType === 'compound' && compoundMatches.length > 0 && (
        <section className='mt-6 grid gap-3 sm:grid-cols-2'>
          {compoundMatches.slice(0, 30).map(compound => {
            const tone = confidenceTone(compound.confidence)
            const token = encodeURIComponent(`compound:${compound.slug}`)
            const itemHref = buildInteractionsLink([token])

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
                <div className='mt-3 flex flex-wrap gap-2'>
                  <Link
                    to={itemHref}
                    onClick={() => onItemAction('collection_item_add_to_checker', compound)}
                    className='btn-secondary text-xs'
                  >
                    Add to checker
                  </Link>
                  <Link
                    to={itemHref}
                    onClick={() => onItemAction('collection_item_add_to_stack', compound)}
                    className='btn-secondary text-xs'
                  >
                    Add to stack
                  </Link>
                  <Link
                    to={`/compounds/${compound.slug}`}
                    className='inline-flex items-center text-xs text-emerald-200 hover:text-emerald-100'
                  >
                    View compound details →
                  </Link>
                </div>
              </article>
            )
          })}
        </section>
      )}

      {collection.itemType === 'combo' && comboMatches.length > 0 && (
        <section className='mt-6 grid gap-3 sm:grid-cols-2'>
          {comboMatches.map(combo => {
            const comboTokens = combo.items
              .map(item => lookupByLabel.get(normalizeLookupToken(item)))
              .filter((token): token is string => Boolean(token))
              .slice(0, 3)
            const comboHref = buildInteractionsLink(comboTokens)

            return (
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
                  <Link
                    to={comboHref}
                    className='btn-secondary text-xs'
                    onClick={() => {
                      handleFunnelClick('combo')
                      trackCollectionEvent('collection_combo_run', {
                        slug: collection.slug,
                        itemType: collection.itemType,
                        comboId: combo.id,
                      })
                    }}
                  >
                    Run this combo
                  </Link>
                </div>
              </article>
            )
          })}
        </section>
      )}

      {relatedGoalCombos.length > 0 && collection.itemType !== 'combo' && (
        <section className='mt-8'>
          <h2 className='text-base font-semibold text-white'>Related prebuilt combos</h2>
          <p className='mt-1 text-xs text-white/65'>
            Goal-matched combos from canonical prebuilt data. Open one in checker with one tap.
          </p>
          <div className='mt-3 grid gap-3 sm:grid-cols-2'>
            {relatedGoalCombos.map(combo => {
              const comboTokens = combo.items
                .map(item => lookupByLabel.get(normalizeLookupToken(item)))
                .filter((token): token is string => Boolean(token))
                .slice(0, 3)

              if (!comboTokens.length) return null

              return (
                <article key={combo.id} className='ds-card p-4'>
                  <div className='flex items-center justify-between gap-2'>
                    <h3 className='text-sm font-semibold text-white'>{combo.name}</h3>
                    <span className='rounded-full border border-cyan-300/40 bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-100'>
                      {combo.goal}
                    </span>
                  </div>
                  <p className='mt-2 text-xs text-white/75'>{combo.description}</p>
                  <button
                    type='button'
                    onClick={() => {
                      handleFunnelClick('combo')
                      trackCollectionEvent('collection_combo_run', {
                        slug: collection.slug,
                        itemType: collection.itemType,
                        comboId: combo.id,
                      })
                      window.location.assign(buildInteractionsLink(comboTokens))
                    }}
                    className='btn-secondary mt-3 text-xs'
                  >
                    Run this combo
                  </button>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {(showLeadCapture || leadCaptured) && (
        <section className='border-white/12 mt-8 rounded-xl border bg-black/25 p-4'>
          <h2 className='text-sm font-semibold text-white'>
            Want deeper stack tools and safety updates?
          </h2>
          <p className='mt-1 text-xs text-white/70'>
            Get notified as interaction coverage improves and export workflows become more robust.
          </p>
          {leadCaptured ? (
            <p className='mt-3 text-xs text-emerald-200'>
              You are on the updates list for this collection. Thanks.
            </p>
          ) : (
            <form onSubmit={submitCollectionLead} className='mt-3 flex flex-col gap-2 sm:flex-row'>
              <input
                type='email'
                inputMode='email'
                autoComplete='email'
                value={leadEmail}
                onChange={event => setLeadEmail(event.target.value)}
                placeholder='you@example.com'
                required
                className='w-full rounded-lg border border-white/20 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-cyan-200/45'
              />
              <button
                type='submit'
                disabled={leadStatus === 'loading'}
                className='btn-primary whitespace-nowrap text-xs disabled:opacity-70'
              >
                {leadStatus === 'loading' ? 'Saving…' : 'Keep me updated'}
              </button>
            </form>
          )}
          {leadStatus === 'error' && <p className='mt-2 text-xs text-rose-200'>{leadMessage}</p>}
          {leadStatus === 'success' && (
            <p className='mt-2 text-xs text-emerald-200'>{leadMessage}</p>
          )}
        </section>
      )}

      {itemCount === 0 && (
        <section className='mt-6 rounded-xl border border-amber-300/35 bg-amber-500/10 p-4 text-sm text-amber-100'>
          This collection currently has no qualifying entries from canonical data fields.
        </section>
      )}

      <section className='mt-8 grid gap-4 lg:grid-cols-2'>
        {relatedCollections.length > 0 && (
          <div className='ds-card p-4'>
            <h2 className='text-sm font-semibold text-white'>Related goals</h2>
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
        )}
        {peopleAlsoExplore.length > 0 && (
          <div className='ds-card p-4'>
            <h2 className='text-sm font-semibold text-white'>People also explore</h2>
            <div className='mt-3 flex flex-wrap gap-2'>
              {peopleAlsoExplore.map(related => (
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
        )}
        <div className='ds-card p-4'>
          <h2 className='text-sm font-semibold text-white'>Next steps</h2>
          <p className='mt-2 text-xs text-white/70'>
            Move from discovery to decision support: run the interaction checker, then continue into
            stack planning and export.
          </p>
          <div className='mt-3 flex flex-wrap gap-2'>
            <Link
              to={checkerHref}
              className='btn-secondary text-xs'
              onClick={() => handleFunnelClick('checker')}
            >
              Open Interaction Checker
            </Link>
            <Link
              to={stackHref}
              className='btn-secondary text-xs'
              onClick={() => handleFunnelClick('stack')}
            >
              Open Stack + Export Flow
            </Link>
            <Link to='/build' className='btn-secondary text-xs'>
              Open Guided Stack Builder
            </Link>
          </div>
        </div>
      </section>

      <section className='mt-8 rounded-xl border border-fuchsia-300/30 bg-fuchsia-500/10 p-4'>
        <h2 className='text-base font-semibold text-fuchsia-100'>
          Have you tried any of these together?
        </h2>
        <p className='mt-1 text-sm text-white/80'>
          Most people miss interactions — check your stack here.
        </p>
        <Link
          to={checkerHref}
          className='btn-primary mt-3 text-xs'
          onClick={() => handleFunnelClick('checker')}
        >
          Check your stack
        </Link>
      </section>
    </main>
  )
}
