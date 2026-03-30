import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import { Button } from '@/components/ui/Button'
import CtaVariantLayout from '@/components/cta/CtaVariantLayout'
import CuratedProductModule from '@/components/CuratedProductModule'
import { resolveCtaVariant } from '@/config/ctaExperiments'
import { SEO_COLLECTIONS, getCollectionBySlug, type SeoCollection } from '@/data/seoCollections'
import { useCompoundData } from '@/lib/compound-data'
import { useHerbData } from '@/lib/herb-data'
import { useSubmissionForm } from '@/hooks/useSubmissionForm'
import { trackCollectionEvent } from '@/lib/collectionTracking'
import { trackCollectionDetailClick, trackCtaSlotImpression } from '@/lib/contentJourneyTracking'
import type { ConfidenceLevel } from '@/utils/calculateConfidence'
import { type ComboGoal, type PrebuiltCombo } from '@/types/combos'
import { normalizeLookupToken } from '@/utils/normalizeToken'
import {
  auditCollectionForIndexing,
  filterComboByCollection,
  filterCompoundByCollection,
  filterHerbByCollection,
} from '@/lib/collectionQuality'
import { buildGovernedCollectionSummary } from '@/lib/collectionEnrichment'
import { getRenderableCuratedProducts } from '@/lib/curatedProducts'
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  formatMetaDescription,
  itemListJsonLd,
  SITE_URL,
} from '@/lib/seo'
import BreadcrumbTrail from '@/components/navigation/BreadcrumbTrail'

type CollectionHerb = ReturnType<typeof useHerbData>[number]
type CollectionCompound = ReturnType<typeof useCompoundData>[number]
type CollectionEntity = CollectionHerb | CollectionCompound

const EVIDENCE_DISTRIBUTION_LABELS: Record<string, string> = {
  stronger_human_support: 'stronger human support',
  limited_human_support: 'limited human support',
  observational_only: 'observational only',
  preclinical_only: 'preclinical only',
  traditional_use_only: 'traditional-use only',
  mixed_or_uncertain: 'mixed/uncertain',
  conflicting_evidence: 'conflicting evidence',
  insufficient_evidence: 'insufficient evidence',
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

function buildSeoDescription(collection: SeoCollection, topItems: CollectionEntity[]): string {
  const goal = toGoalLabel(collection)
  const focusLabel =
    collection.itemType === 'compound'
      ? 'compounds'
      : collection.itemType === 'combo'
        ? 'combinations'
        : 'herbs'
  const examples = topItems.slice(0, 2).map(item => getEntityName(item))
  const examplesText = examples.length ? ` Top picks include ${examples.join(' and ')}.` : ''
  return formatMetaDescription(
    `Compare ${focusLabel} for ${goal.toLowerCase()} with evidence-first notes, safety tradeoffs, and interaction-checker workflow.${examplesText} Educational reference only.`,
    `Compare ${focusLabel} for ${goal.toLowerCase()} with safety-first notes and interaction-checker guidance.`,
  )
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

const COLLECTION_REASON_LABELS: Record<string, string> = {
  'missing-editorial-brief': 'no editorial guide sections were provided',
  'missing-who-for': 'missing "who this is for" guidance',
  'missing-selection-rationale': 'selection rationale is too thin',
  'missing-tradeoffs': 'missing key tradeoff guidance',
  'missing-caution': 'missing caution or scope note',
  'missing-best-fit-items': 'missing best-fit guidance',
  'missing-alternatives': 'missing related alternatives',
  'missing-cta-guidance': 'missing clear next-step CTA guidance',
  'insufficient-matching-items': 'not enough matching entities to make the page useful',
  'missing-intro': 'intro text is too short',
  'missing-description': 'meta description is too short',
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
  const [leadHoneypot, setLeadHoneypot] = useState('')
  const [shareToast, setShareToast] = useState('')

  const {
    status: leadStatus,
    message: leadMessage,
    submit: submitLead,
    clearFeedback: clearLeadFeedback,
  } = useSubmissionForm({
    successMessage: 'Thanks — you will get practical safety and stack-tool updates.',
    buildPayload: (fields: { email: string }) => ({
      formType: 'lead-capture',
      email: fields.email,
      source: 'interaction-checker',
      context: 'collection-page',
      pagePath: `/collections/${slug}`,
    }),
    onSuccess: () => {
      setLeadCaptured(true)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`hs_collection_lead_captured:${slug}`, '1')
      }
      trackCollectionEvent('collection_lead_capture_submit', {
        slug: collection?.slug || slug,
        itemType: collection?.itemType || 'herb',
      })
    },
  })

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
      filterHerbByCollection(herb as Record<string, unknown>, collection.filters),
    )
  }, [collection, herbs])

  const compoundMatches = useMemo(() => {
    if (!collection || collection.itemType !== 'compound') return []
    return compounds.filter(compound =>
      filterCompoundByCollection(compound as Record<string, unknown>, collection.filters),
    )
  }, [collection, compounds])

  const comboMatches = useMemo(() => {
    if (!collection || collection.itemType !== 'combo') return []
    return combos.filter(combo => filterComboByCollection(combo, collection.filters))
  }, [collection, combos])

  const itemCount = herbMatches.length + compoundMatches.length + comboMatches.length
  const collectionQuality = useMemo(() => {
    if (!collection) return { approved: false, reasons: ['missing-collection'], minRequired: 0 }
    return auditCollectionForIndexing(collection, itemCount)
  }, [collection, itemCount])
  const editorial = collection?.editorial
  const qualityMessages = collectionQuality.reasons.map(
    reason => COLLECTION_REASON_LABELS[reason] || reason,
  )

  const topItems = useMemo(() => {
    if (collection?.itemType === 'herb') return herbMatches.slice(0, 3)
    if (collection?.itemType === 'compound') return compoundMatches.slice(0, 3)
    return []
  }, [collection?.itemType, herbMatches, compoundMatches])
  const governedCollectionSummary = useMemo(() => {
    if (!collection || collection.itemType === 'combo') return null
    const candidates =
      collection.itemType === 'herb'
        ? herbMatches.map(item => ({
            entityType: 'herb' as const,
            entitySlug: item.slug,
            entityName: item.common || item.scientific || item.name || item.slug,
          }))
        : compoundMatches.map(item => ({
            entityType: 'compound' as const,
            entitySlug: item.slug,
            entityName: item.name || item.slug,
          }))
    return buildGovernedCollectionSummary(candidates)
  }, [collection, herbMatches, compoundMatches])
  const ctaExperiment = useMemo(
    () =>
      resolveCtaVariant({
        pageType: 'collection_page',
        entityType: 'collection',
        entitySlug: collection?.slug || slug,
        cautionCount: 0,
      }),
    [collection?.slug, slug],
  )

  const collectionCuratedProducts = useMemo(() => {
    if (!collection || !topItems.length) return []
    const firstTopItem = topItems[0]
    if (collection.itemType === 'herb') {
      const herbItem = firstTopItem as CollectionHerb
      const confidence =
        herbItem.confidence === 'high' || herbItem.confidence === 'medium'
          ? herbItem.confidence
          : 'low'
      return getRenderableCuratedProducts({
        entityType: 'herb',
        entitySlug: herbItem.slug,
        confidence,
        sourceCount: Number(herbItem.sourceCount || 0),
      })
    }
    if (collection.itemType === 'compound') {
      const compoundItem = firstTopItem as CollectionCompound
      const confidence =
        compoundItem.confidence === 'high' || compoundItem.confidence === 'medium'
          ? compoundItem.confidence
          : 'low'
      return getRenderableCuratedProducts({
        entityType: 'compound',
        entitySlug: compoundItem.slug,
        confidence,
        sourceCount: Number(compoundItem.sourceCount || 0),
      })
    }
    return []
  }, [collection, topItems])

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
    [topItems],
  )
  const pageTitle = collection ? `${collection.title} Collection Guide` : 'Collections'
  const pageDescription = collection ? buildSeoDescription(collection, topItems) : ''

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
      pageType: 'collection_page',
      entitySlug: collection.slug,
      ctaType: cta === 'checker' ? 'tool' : cta === 'stack' ? 'builder' : 'tool',
      ctaPosition: 'collection_funnel',
      variantId: ctaExperiment.activeVariantId,
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
    item: CollectionEntity,
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
    const didSubmit = await submitLead({ email: leadEmail }, { honeypot: leadHoneypot })
    if (didSubmit) {
      setLeadEmail('')
      setLeadHoneypot('')
    }
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
  const schemaItems = [
    ...herbMatches.map(herb => ({
      name: herb.common || herb.scientific || herb.name || herb.slug,
      url: `/herbs/${herb.slug}`,
    })),
    ...compoundMatches.map(compound => ({
      name: compound.name,
      url: `/compounds/${compound.slug}`,
    })),
    ...comboMatches.map(combo => ({
      name: combo.name,
      url: '/interactions',
    })),
  ]
  const listSchemaId = `${SITE_URL}${pagePath}#items`
  const jsonLd = collectionQuality.approved
    ? [
        collectionPageJsonLd({
          title: collection.title,
          description: pageDescription,
          path: pagePath,
          itemListId: listSchemaId,
        }),
        itemListJsonLd({
          id: listSchemaId,
          name: `${collection.title} shortlist`,
          path: pagePath,
          items: schemaItems,
        }),
        breadcrumbJsonLd([
          { name: 'Home', url: SITE_URL },
          { name: 'Collections', url: `${SITE_URL}/collections` },
          { name: collection.title, url: `${SITE_URL}${pagePath}` },
        ]),
      ]
    : undefined

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
        noindex={!collectionQuality.approved}
      />

      <header className='ds-card-lg'>
        <BreadcrumbTrail
          items={[
            { label: 'Home', to: '/' },
            { label: 'Collections', to: '/collections' },
            { label: collection.title },
          ]}
        />
        <h1 className='text-3xl font-semibold text-white'>{collection.title}</h1>
        <p className='mt-3 max-w-3xl text-sm leading-7 text-white/80'>{collection.intro}</p>
        <p className='mt-3 text-xs text-white/65'>
          {itemCount} matching entries in this collection.
        </p>
        <section className='border-white/12 mt-4 rounded-xl border bg-emerald-500/10 p-3'>
          <h2 className='text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/95'>
            Quick strategy
          </h2>
          <div className='mt-2 grid gap-2 text-xs text-emerald-50/95 sm:grid-cols-3'>
            <p>
              <span className='font-semibold text-white'>1) Shortlist:</span> compare 2-3 entries
              from this page based on effect fit.
            </p>
            <p>
              <span className='font-semibold text-white'>2) Verify safety:</span> run the
              interaction checker before combining anything.
            </p>
            <p>
              <span className='font-semibold text-white'>3) Build conservatively:</span> move to
              stack builder only after reviewing cautions and overlap.
            </p>
          </div>
          <p className='mt-2 text-[11px] text-emerald-100/85'>
            Trust framing: this page is generated from canonical herb/compound records and editorial
            rules. Review methodology and references before making decisions.
          </p>
        </section>
        {!collectionQuality.approved ? (
          <p className='mt-2 text-xs text-amber-200/90'>
            This collection is available for browsing but excluded from indexing until it meets
            quality thresholds.
          </p>
        ) : null}
        {!collectionQuality.approved && qualityMessages.length > 0 ? (
          <ul className='mt-2 list-disc space-y-1 pl-5 text-xs text-amber-100/90'>
            {qualityMessages.map(reason => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : null}

        {editorial ? (
          <section className='border-white/12 mt-4 rounded-xl border bg-black/20 p-3'>
            <h2 className='text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200'>
              Editorial guide
            </h2>
            <dl className='mt-2 space-y-3 text-xs text-white/80'>
              <div>
                <dt className='font-semibold text-cyan-100'>Who this page is for</dt>
                <dd className='mt-1 leading-6'>{editorial.whoFor}</dd>
              </div>
              <div>
                <dt className='font-semibold text-cyan-100'>How items were selected</dt>
                <dd className='mt-1 leading-6'>{editorial.selectionRationale}</dd>
              </div>
              <div>
                <dt className='font-semibold text-cyan-100'>Key tradeoffs</dt>
                <dd className='mt-1'>
                  <ul className='list-disc space-y-1 pl-5'>
                    {editorial.keyTradeoffs.map(note => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className='font-semibold text-cyan-100'>Exclusions and cautions</dt>
                <dd className='mt-1'>
                  <ul className='list-disc space-y-1 pl-5'>
                    {editorial.cautions.map(note => (
                      <li key={note}>{note}</li>
                    ))}
                    {editorial.exclusions.map(note => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className='font-semibold text-cyan-100'>Best-fit use cases</dt>
                <dd className='mt-1'>
                  <ul className='list-disc space-y-1 pl-5'>
                    {editorial.bestFitItems.map(note => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className='font-semibold text-cyan-100'>Use this page effectively</dt>
                <dd className='mt-1 leading-6'>{editorial.ctaLabel}</dd>
              </div>
            </dl>
          </section>
        ) : null}

        {governedCollectionSummary ? (
          <section className='border-white/12 mt-4 rounded-xl border bg-indigo-500/10 p-3'>
            <h2 className='text-xs font-semibold uppercase tracking-[0.14em] text-indigo-100'>
              Governed enrichment overview (collection-level)
            </h2>
            <p className='mt-2 text-xs leading-6 text-indigo-50/90'>
              This summary only uses publish-approved governed enrichment. Items without approved
              enrichment are excluded from evidence/safety comparisons.
            </p>
            <div className='mt-3 grid gap-2 text-xs text-indigo-50/95 sm:grid-cols-2 lg:grid-cols-3'>
              <p>
                <span className='font-semibold text-white'>Enriched + reviewed:</span>{' '}
                {governedCollectionSummary.governedReviewedCount} of{' '}
                {governedCollectionSummary.includedCount}
              </p>
              <p>
                <span className='font-semibold text-white'>Safety/interactions present:</span>{' '}
                {governedCollectionSummary.safetySignalsPresentCount}
              </p>
              <p>
                <span className='font-semibold text-white'>Mechanism/constituent coverage:</span>{' '}
                {governedCollectionSummary.mechanismCoveragePresentCount}/
                {governedCollectionSummary.constituentCoveragePresentCount}
              </p>
              <p>
                <span className='font-semibold text-white'>Uncertainty/conflict flags:</span>{' '}
                {governedCollectionSummary.unresolvedConflictOrUncertaintyCount}
              </p>
              {governedCollectionSummary.lastReviewedAtMostRecent ? (
                <p>
                  <span className='font-semibold text-white'>Most recent review:</span>{' '}
                  {new Date(governedCollectionSummary.lastReviewedAtMostRecent).toLocaleDateString(
                    'en-US',
                    { year: 'numeric', month: 'short', day: 'numeric' },
                  )}
                </p>
              ) : (
                <p>
                  <span className='font-semibold text-white'>Most recent review:</span> no governed
                  review yet
                </p>
              )}
            </div>

            <div className='mt-3 flex flex-wrap gap-2 text-[11px]'>
              {Object.entries(governedCollectionSummary.evidenceLabelDistribution)
                .filter(([, count]) => count > 0)
                .map(([label, count]) => (
                  <span
                    key={label}
                    className='rounded-full border border-indigo-200/25 bg-black/20 px-2 py-1 text-indigo-50'
                  >
                    {count} {EVIDENCE_DISTRIBUTION_LABELS[label] || label}
                  </span>
                ))}
            </div>

            {governedCollectionSummary.allowComparativeHighlights ? (
              <ul className='mt-3 list-disc space-y-1 pl-5 text-xs text-indigo-50/95'>
                <li>
                  What the evidence looks like across this set: both stronger and limited human
                  evidence labels are represented.
                </li>
                <li>
                  Items with relatively stronger human support:{' '}
                  {governedCollectionSummary.strongerHumanSupportCount}.
                </li>
                <li>
                  Mainly traditional-use or preclinical labels:{' '}
                  {governedCollectionSummary.preclinicalOrTraditionalOnlyCount}.
                </li>
                <li>
                  Items needing extra caution/interaction review:{' '}
                  {governedCollectionSummary.safetySignalsPresentCount}.
                </li>
              </ul>
            ) : (
              <p className='mt-3 rounded-lg border border-indigo-200/25 bg-black/20 px-3 py-2 text-xs leading-6 text-indigo-50/95'>
                Comparative highlighting is intentionally limited for this collection because
                governed coverage is sparse or mostly weak/uncertain. Use this page for scoped
                discovery and run interaction checks item-by-item instead of treating it as a
                ranking.
              </p>
            )}
          </section>
        ) : null}

        <div className='mt-4 flex flex-wrap items-center gap-2'>
          <Link
            to={checkerHref}
            className='btn-primary text-xs'
            onClick={() => handleFunnelClick('checker')}
          >
            Start with Interaction Checker
          </Link>
          <Link
            to={stackHref}
            className='btn-secondary text-xs'
            onClick={() => handleFunnelClick('stack')}
          >
            Continue to Stack Builder
          </Link>
          <Button type='button' variant='secondary' onClick={handleCopyLink} className='text-xs'>
            Copy Link
          </Button>
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
        <div className='mt-3 flex flex-wrap gap-2'>
          <Link to='/methodology' className='inline-flex text-xs text-cyan-200 hover:text-cyan-100'>
            How this collection is scored →
          </Link>
          <Link to='/disclaimer' className='inline-flex text-xs text-cyan-200 hover:text-cyan-100'>
            Educational-use disclaimer →
          </Link>
        </div>
      </header>

      {quickValueItems.length > 0 && editorial && (
        <section className='mt-4 rounded-xl border border-cyan-300/25 bg-cyan-500/5 p-3'>
          <h2 className='text-sm font-semibold text-cyan-100'>
            Best-fit item examples for {toGoalLabel(collection).toLowerCase()}
          </h2>
          <p className='mt-1 text-xs text-white/70'>
            These are examples from the strongest matching entries in canonical data, not blanket
            recommendations.
          </p>
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

      <CtaVariantLayout
        variant={ctaExperiment.variant}
        onSlotImpression={(slot, position) => {
          const ctaType =
            slot === 'tool'
              ? 'tool'
              : slot === 'builder'
                ? 'builder'
                : slot === 'affiliate'
                  ? 'affiliate'
                  : null
          if (!ctaType) return
          trackCtaSlotImpression({
            sourceType: 'collection',
            source: collection.slug,
            placement: 'cta_experiment_slot',
            ctaMetadata: {
              pageType: 'collection_page',
              entitySlug: collection.slug,
              ctaType,
              ctaPosition: `position_${position}`,
              variantId: ctaExperiment.activeVariantId,
            },
          })
        }}
        slots={{
          tool: (
            <div className='rounded-lg border border-emerald-300/30 bg-emerald-500/10 p-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100'>
                Step 1: validate interactions now
              </p>
              <p className='mt-1 text-xs text-emerald-50/90'>
                Run the checker before you exit this page to reduce avoidable stack-risk.
              </p>
              <Link
                to={checkerHref}
                className='btn-primary mt-2 inline-flex text-xs'
                onClick={() => handleFunnelClick('checker')}
              >
                Check this collection in Interaction Checker
              </Link>
            </div>
          ),
          builder: (
            <div className='rounded-lg border border-cyan-300/25 bg-cyan-500/10 p-3'>
              <p className='text-xs text-white/75'>
                Step 2: move shortlisted items into stack builder.
              </p>
              <Link
                to={stackHref}
                className='btn-secondary mt-2 inline-flex text-xs'
                onClick={() => handleFunnelClick('stack')}
              >
                Continue to Stack Builder
              </Link>
              {featuredTokens.length ? (
                <Link
                  to={featuredComboHref}
                  className='btn-secondary ml-2 mt-2 inline-flex text-xs'
                  onClick={() => handleFunnelClick('combo')}
                >
                  Try a Popular Combo
                </Link>
              ) : null}
            </div>
          ),
          related: relatedCollections.length > 0 && (
            <div className='rounded-lg border border-white/10 bg-white/[0.02] p-3'>
              <p className='text-xs font-semibold text-white'>Compare adjacent collections next</p>
              <div className='mt-2 flex flex-wrap gap-2'>
                {relatedCollections.slice(0, 3).map(entry => (
                  <Link
                    key={`related-${entry.slug}`}
                    to={`/collections/${entry.slug}`}
                    className='btn-secondary text-xs'
                  >
                    {entry.title}
                  </Link>
                ))}
              </div>
            </div>
          ),
          affiliate:
            collectionCuratedProducts.length > 0 &&
            collection.itemType !== 'combo' &&
            topItems.length > 0 ? (
              <CuratedProductModule
                entityType={collection.itemType}
                entitySlug={topItems[0].slug}
                products={collectionCuratedProducts.slice(0, 1)}
                positionContext='collection_cta_variant_spotlight'
                pageType='collection_page'
                variantId={ctaExperiment.activeVariantId}
                ctaPosition='collection_affiliate_spotlight'
              />
            ) : null,
        }}
      />

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
                    onClick={() =>
                      trackCollectionDetailClick({
                        collectionSlug: collection.slug,
                        targetType: 'herb',
                        targetSlug: herb.slug,
                        placement: 'collection_item_card',
                      })
                    }
                  >
                    View herb details →
                  </Link>
                </div>
              </article>
            )
          })}
        </section>
      )}

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
                    onClick={() =>
                      trackCollectionDetailClick({
                        collectionSlug: collection.slug,
                        targetType: 'compound',
                        targetSlug: compound.slug,
                        placement: 'collection_item_card',
                      })
                    }
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
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() => {
                      handleFunnelClick('combo')
                      trackCollectionEvent('collection_combo_run', {
                        slug: collection.slug,
                        itemType: collection.itemType,
                        comboId: combo.id,
                      })
                      window.location.assign(buildInteractionsLink(comboTokens))
                    }}
                    className='mt-3 text-xs'
                  >
                    Run this combo
                  </Button>
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
              <label htmlFor='collection-lead-email' className='sr-only'>
                Email address
              </label>
              <input
                id='collection-lead-email'
                type='email'
                inputMode='email'
                autoComplete='email'
                value={leadEmail}
                onChange={event => {
                  setLeadEmail(event.target.value)
                  clearLeadFeedback()
                }}
                placeholder='you@example.com'
                required
                aria-describedby='collection-lead-status'
                className='w-full rounded-lg border border-white/20 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-cyan-200/45'
              />
              <input
                type='text'
                tabIndex={-1}
                autoComplete='off'
                value={leadHoneypot}
                onChange={event => setLeadHoneypot(event.target.value)}
                className='sr-only'
                aria-hidden='true'
              />
              <Button
                type='submit'
                variant='primary'
                disabled={leadStatus === 'pending'}
                className='whitespace-nowrap text-xs disabled:opacity-70'
              >
                {leadStatus === 'pending' ? 'Saving…' : 'Keep me updated'}
              </Button>
            </form>
          )}
          <p
            id='collection-lead-status'
            className={`mt-2 text-xs ${leadStatus === 'error' ? 'text-rose-200' : 'text-emerald-200'}`}
            role={leadStatus === 'error' ? 'alert' : 'status'}
            aria-live={leadStatus === 'error' ? 'assertive' : 'polite'}
          >
            {leadMessage}
          </p>
        </section>
      )}

      {itemCount === 0 && (
        <section className='mt-6 rounded-xl border border-amber-300/35 bg-amber-500/10 p-4 text-sm text-amber-100'>
          This collection currently has no qualifying entries from canonical data fields.
        </section>
      )}

      <section className='mt-8 grid gap-4 lg:grid-cols-2'>
        {editorial?.alternatives?.length ? (
          <div className='ds-card p-4'>
            <h2 className='text-sm font-semibold text-white'>Related alternatives</h2>
            <p className='mt-2 text-xs text-white/70'>
              Compare adjacent collections before finalizing your shortlist.
            </p>
            <div className='mt-3 flex flex-wrap gap-2'>
              {editorial.alternatives.map(option => (
                <Link key={option} to={`/collections/${option}`} className='btn-secondary text-xs'>
                  {SEO_COLLECTIONS.find(entry => entry.slug === option)?.title || option}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
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
    </main>
  )
}
