import { type ReactNode, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import InfoTooltip from '@/components/InfoTooltip'
import DataTrustPanel from '@/components/trust/DataTrustPanel'
import { countCautionSignals, inferContentFlags } from '@/lib/trust'
import { useHerbDataState, useHerbDetailState } from '@/lib/herb-data'
import { useCompoundDataState } from '@/lib/compound-data'
import { HerbDetailSkeleton } from '@/components/skeletons/DetailSkeletons'
import { pickNonEmptyKeys } from '@/lib/nonEmptyFields'
import { extractPrimaryEffects } from '@/utils/extractPrimaryEffects'
import { getHerbDataCompleteness } from '@/utils/getDataCompleteness'
import { sanitizeReadableText, splitClean, uniqueNormalizedList } from '@/lib/sanitize'
import { pushRecentlyViewed, useSavedItems } from '@/lib/growth'
import {
  breadcrumbJsonLd,
  buildGovernedMetaDescription,
  buildGovernedMetaTitle,
  faqPageJsonLd,
  formatMetaDescription,
  herbJsonLd,
  SITE_URL,
} from '@/lib/seo'
import CuratedProductModule from '@/components/CuratedProductModule'
import CtaVariantLayout from '@/components/cta/CtaVariantLayout'
import Collapse from '@/components/ui/Collapse'
import { SEO_COLLECTIONS } from '@/data/seoCollections'
import { filterHerbByCollection } from '@/lib/collectionQuality'
import StructuredDetailIntro from '@/components/detail/StructuredDetailIntro'
import GovernedResearchSections from '@/components/detail/GovernedResearchSections'
import GovernedReviewFreshnessPanel from '@/components/detail/GovernedReviewFreshnessPanel'
import EnrichmentRecommendationBlocks from '@/components/detail/EnrichmentRecommendationBlocks'
import GovernedQuickCompareBlock from '@/components/detail/GovernedQuickCompareBlock'
import PremiumDataSection from '@/components/detail/PremiumDataSection'
import HerbBuyerGuidanceSection from '@/components/detail/HerbBuyerGuidanceSection'
import HerbProductSection from '@/components/detail/HerbProductSection'
import { resolveCtaVariant } from '@/config/ctaExperiments'
import { getRenderableCuratedProducts } from '@/lib/curatedProducts'
import BreadcrumbTrail from '@/components/navigation/BreadcrumbTrail'
import { getGovernedResearchEnrichment } from '@/lib/governedResearch'
import { buildGovernedFaqSectionContent } from '@/lib/governedFaq'
import { buildGovernedRelatedQuestions } from '@/lib/governedRelatedQuestions'
import { buildEnrichmentRecommendations } from '@/lib/enrichmentRecommendations'
import { buildGovernedQuickCompareSection } from '@/lib/governedQuickCompare'
import { buildFallbackHerbIntro, buildGovernedDetailIntro } from '@/lib/governedIntro'
import { resolveGovernedCtaDecision } from '@/lib/governedCta'
import { buildGovernedReviewFreshness } from '@/lib/governedReviewFreshness'
import { getHerbRecommendation } from '@/lib/herbRecommendations'
import { getHerbProducts } from '@/lib/herbProducts'
import {
  trackDetailBuilderClick,
  trackCtaSlotImpression,
  trackDetailCheckerClick,
  trackDetailRelatedEntityClick,
} from '@/lib/contentJourneyTracking'
import { trackGovernedEvent } from '@/lib/governedAnalytics'
import type { AffiliateUseCaseAnchor } from '@/lib/affiliateClickTracking'

const ISSUE_TEMPLATE_URL =
  'https://github.com/Razzleberrytt/survive-99-evolved/issues/new?template=evidence-update.yml'

type SourceRef = { title: string; url: string; note?: string }

function toSources(value: unknown): SourceRef[] {
  if (!Array.isArray(value)) return []
  const unique = new Map<string, SourceRef>()
  value
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
    .forEach(item => {
      const key = `${item.url.trim().toLowerCase()}|${item.title.trim().toLowerCase()}`
      if (!unique.has(key)) unique.set(key, item)
    })
  return Array.from(unique.values())
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

function ListSection({ items, maxVisible = 8 }: { items: string[]; maxVisible?: number }) {
  const [expanded, setExpanded] = useState(false)
  if (!items.length) return null
  const cappedMax = Math.max(1, maxVisible)
  const visibleItems = expanded ? items : items.slice(0, cappedMax)
  const hasOverflow = items.length > cappedMax
  return (
    <>
      <ul className='list-disc space-y-1 pl-5'>
        {visibleItems.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {hasOverflow && (
        <button
          type='button'
          className='mt-2 text-xs font-medium text-emerald-200/90 hover:text-emerald-100'
          onClick={() => setExpanded(value => !value)}
        >
          {expanded ? 'Show less' : `Show ${items.length - cappedMax} more`}
        </button>
      )}
    </>
  )
}

type RelatedLinkItem = {
  label: string
  to: string
}

type UseCaseAnchor = {
  key: 'sleep' | 'anxiety' | 'focus'
  question: string
  guidance: string
  keywords: string[]
}

type UseCaseRelatedHerbLink = {
  leadIn: 'See also' | 'Compare with'
  label: string
  to: string
}

const USE_CASE_ANCHORS: UseCaseAnchor[] = [
  {
    key: 'sleep',
    question: 'Best for sleep?',
    guidance: 'Prioritize lower-friction evening formats and avoid stacking multiple sedating products.',
    keywords: ['sleep', 'bedtime', 'evening wind-down', 'wind-down', 'night'],
  },
  {
    key: 'anxiety',
    question: 'Best for anxiety?',
    guidance: 'Look for steadier daily formats first, then only adjust form if tolerability or routine fit is poor.',
    keywords: ['anxiety', 'calm', 'stress', 'tension', 'gentle support', 'relax'],
  },
  {
    key: 'focus',
    question: 'Best for focus?',
    guidance: 'Use labels and form consistency to compare options rather than relying on broad performance claims.',
    keywords: ['focus', 'clarity', 'cognitive', 'daytime', 'alertness', 'concentration'],
  },
]

function normalizeKey(value: string) {
  return value.trim().toLowerCase()
}

function matchesUseCaseTag(bestForTag: string, keywords: string[]) {
  const normalizedTag = normalizeKey(bestForTag)
  return keywords.some(keyword => normalizedTag.includes(normalizeKey(keyword)))
}

function buildInteractionsLink(tokens: string[]) {
  if (!tokens.length) return '/interactions'
  return `/interactions?items=${tokens.join(',')}`
}

function dedupeRelatedLinks(items: Array<RelatedLinkItem | null | undefined>) {
  const unique = new Map<string, RelatedLinkItem>()

  items.forEach(item => {
    if (!item?.label.trim() || !item.to.trim()) return
    const key = normalizeKey(item.to)
    if (!unique.has(key)) unique.set(key, item)
  })

  return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label))
}

function dedupeStrings(items: Array<string | null | undefined>) {
  const seen = new Set<string>()
  const values: string[] = []
  items.forEach(item => {
    const normalized = String(item || '').trim()
    if (!normalized) return
    const key = normalizeKey(normalized)
    if (seen.has(key)) return
    seen.add(key)
    values.push(normalized)
  })
  return values
}

function buildShortSummary(therapeuticUses: string[]) {
  const conciseUses = therapeuticUses
    .map(item => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 2)
  if (!conciseUses.length) return ''
  if (conciseUses.length === 1) return conciseUses[0]
  return `${conciseUses[0]}. ${conciseUses[1]}`
}

function getEvidenceBadgeTone(evidenceLevel: string) {
  const normalized = evidenceLevel.trim().toLowerCase()
  if (!normalized) return 'border-white/20 bg-white/6 text-white/75'
  if (normalized.includes('human')) return 'border-emerald-300/35 bg-emerald-500/12 text-emerald-100'
  if (normalized.includes('preclinical + limited human'))
    return 'border-amber-300/35 bg-amber-500/12 text-amber-100'
  return 'border-white/20 bg-white/6 text-white/75'
}

function getCompletenessLabel(completenessPct: number) {
  if (completenessPct >= 80) return 'Well-documented'
  if (completenessPct >= 50) return 'Partial data'
  return 'Limited data'
}

export default function HerbDetail() {
  const { slug = '' } = useParams()
  const { herb, isLoading } = useHerbDetailState(slug)
  const { herbs } = useHerbDataState()
  const { compounds } = useCompoundDataState()
  const { toggle, isSaved } = useSavedItems()
  const [activeUseCaseAnchor, setActiveUseCaseAnchor] = useState<AffiliateUseCaseAnchor | undefined>(
    undefined,
  )

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
  const effects = uniqueNormalizedList(Array.isArray(herb.effects) ? herb.effects : splitClean(herb.effects))
  const activeCompounds = uniqueNormalizedList(
    Array.isArray(herb.activeCompounds) ? herb.activeCompounds : splitClean(herb.activeCompounds),
  )
  const contraindications = uniqueNormalizedList(
    Array.isArray(herb.contraindications) ? herb.contraindications : splitClean(herb.contraindications),
  )
  const interactions = uniqueNormalizedList(
    Array.isArray(herb.interactions) ? herb.interactions : splitClean(herb.interactions),
  )
  const therapeuticUses = uniqueNormalizedList(
    Array.isArray(herb.therapeuticUses) ? herb.therapeuticUses : splitClean(herb.therapeuticUses),
  )
  const sideEffects = uniqueNormalizedList(
    Array.isArray(herb.sideeffects) ? herb.sideeffects : splitClean(herb.sideeffects),
  )
  const sources = toSources(herb.sources)
  const primaryEffects = extractPrimaryEffects(effects, 4)
  const compoundByName = new Map(compounds.map(compound => [normalizeKey(compound.name), compound]))
  const herbByKey = new Map<string, { label: string; slug: string }>()

  herbs.forEach(item => {
    const label = item.common || item.name || item.scientific || item.slug
    const candidates = [item.slug, item.common, item.name, item.scientific]
    candidates.forEach(candidate => {
      const value = String(candidate || '').trim()
      if (!value) return
      herbByKey.set(normalizeKey(value), { label, slug: item.slug })
    })
  })

  const linkedCompounds = activeCompounds.map(name => {
    const record = compoundByName.get(normalizeKey(name))
    return {
      name,
      slug: record?.slug || '',
      explanation: record?.mechanism || record?.description || '',
      whyItMatters: record?.effects?.slice(0, 2).join(' + ') || '',
    }
  })
  const premiumDetails = [
    { title: 'Identity', value: String(herb.identity || '').trim() },
    {
      title: 'Category / Use Context',
      value: String(herb.categoryUseContext || '').trim(),
    },
    { title: 'Evidence Level', value: String(herb.evidenceLevel || '').trim() },
  ]
  const premiumRelatedHerbs = (Array.isArray(herb.relatedEntities) ? herb.relatedEntities : []).map(
    entry => {
      const normalized = herbByKey.get(normalizeKey(entry))
      return normalized?.slug
        ? {
            label: normalized.label || entry,
            to: `/herbs/${encodeURIComponent(normalized.slug)}`,
          }
        : null
    },
  )
  const premiumRelatedCompounds = (
    Array.isArray(herb.relatedCompounds) ? herb.relatedCompounds : []
  ).map(entry => {
    const normalized = compoundByName.get(normalizeKey(entry))
    return normalized?.slug
      ? {
          label: normalized.name || entry,
          to: `/compounds/${encodeURIComponent(normalized.slug)}`,
        }
      : null
  })
  const relatedHerbLinks = dedupeRelatedLinks(premiumRelatedHerbs)
  const relatedCompoundLinks = dedupeRelatedLinks([
    ...premiumRelatedCompounds,
    ...linkedCompounds.map(compound =>
      compound.slug
        ? {
            label: compound.name,
            to: `/compounds/${encodeURIComponent(compound.slug)}`,
          }
        : null,
    ),
  ])
  const relationGroups = [
    {
      title: `Related Herbs (${relatedHerbLinks.length})`,
      items: relatedHerbLinks,
    },
    {
      title: `Related Compounds (${relatedCompoundLinks.length})`,
      items: relatedCompoundLinks,
    },
  ].filter(group => group.items.length > 0)

  const herbDisplayName = herb.commonName || herb.common || herb.name || herb.slug
  const primaryUse = String(therapeuticUses[0] || effects[0] || '').trim()
  const shortSummary = buildShortSummary(therapeuticUses)
  const herbMetaDescriptionSource = (
    herb.summary ||
    herb.description ||
    therapeuticUses[0] ||
    effects.slice(0, 2).join(', ')
  ).trim()
  const baseHerbMetaDescription = formatMetaDescription(
    herbMetaDescriptionSource,
    primaryUse
      ? `${herbDisplayName} herb guide for ${primaryUse.toLowerCase()} with effects, safety notes, and practical context.`
      : `${herbDisplayName} herb guide with effects, safety notes, and practical context.`,
  )
  const baseHerbMetaTitle = primaryUse
    ? `${herbDisplayName} for ${primaryUse} | Herb Benefits, Uses & Safety`
    : `${herbDisplayName} Herb Guide: Effects, Uses & Safety`

  // Scalar fields already cleaned by normalization
  const description = sanitizeReadableText(herb.description)
  const mechanism = sanitizeReadableText(herb.mechanism)
  const intensity = herb.intensity || ''
  const region = herb.region || ''
  const duration = sanitizeReadableText(herb.duration)
  const dosage = sanitizeReadableText(herb.dosage)
  const preparation = sanitizeReadableText(herb.preparation)
  const standardization = String(herb.standardization || '').trim()
  const legalStatus = herb.legalStatus || ''
  const qualityConcerns = sanitizeReadableText(herb.qualityConcerns)
  const herbClass = sanitizeReadableText(herb.class || herb.category)
  const evidenceLevel = String(herb.evidenceLevel || '').trim()
  const mechanismTags = Array.isArray(herb.mechanismTags)
    ? uniqueNormalizedList(splitClean(herb.mechanismTags))
    : []
  const pathwayTargets = Array.isArray(herb.pathwayTargets)
    ? uniqueNormalizedList(splitClean(herb.pathwayTargets))
    : []
  const compoundCount =
    typeof herb.compound_count === 'number' && Number.isFinite(herb.compound_count)
      ? herb.compound_count
      : null
  const completenessPct =
    typeof herb.completenessPct === 'number' && Number.isFinite(herb.completenessPct)
      ? herb.completenessPct
      : null
  const evidenceBadgeTone = getEvidenceBadgeTone(evidenceLevel)
  const completenessLabel = completenessPct === null ? '' : getCompletenessLabel(completenessPct)
  const lastUpdated = String((herb as Record<string, unknown>).lastUpdated || '').trim()
  const sourceCount = sources.length
  const cautionCount = countCautionSignals({
    contraindications,
    interactions,
    sideEffects,
  })
  const { hasInferredContent, hasFallbackContent } = inferContentFlags({
    description,
    mechanism,
    effects,
    therapeuticUses,
  })

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
    ['mechanism', 'effects', 'activeCompounds', 'contraindications', 'interactions', 'sources'],
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
    ],
  )
  const missingFieldCount = 6 - renderableKeys.length
  const shouldShowContributionCta = renderableKeys.length < 5
  const practicalInfo = [
    dosage ? `Dosage: ${dosage}` : '',
    duration ? `Duration: ${duration}` : '',
    preparation ? `Preparation: ${preparation}` : '',
    standardization ? `Often standardized to: ${standardization}` : '',
  ].filter(Boolean)
  const herbToken = encodeURIComponent(`herb:${herb.slug}`)
  const herbCheckerHref = buildInteractionsLink([herbToken])
  const relatedCollections = SEO_COLLECTIONS.filter(collection => collection.itemType === 'herb')
    .filter(collection =>
      filterHerbByCollection(herb as unknown as Record<string, unknown>, collection.filters),
    )
    .slice(0, 5)
  const introFacts = [
    sourceCount > 0
      ? `${sourceCount} source${sourceCount === 1 ? '' : 's'} listed`
      : 'sources pending',
    cautionCount > 0
      ? `${cautionCount} caution signal${cautionCount === 1 ? '' : 's'}`
      : 'no caution flags listed',
  ]
  const curatedProducts = getRenderableCuratedProducts({
    entityType: 'herb',
    entitySlug: herb.slug,
    confidence,
    sourceCount,
    useCaseAnchor: activeUseCaseAnchor,
  })
  const useCaseAnchors = USE_CASE_ANCHORS.map(anchor => {
    const matchedProducts = curatedProducts.filter(product =>
      product.bestFor.some(tag => matchesUseCaseTag(tag, anchor.keywords)),
    )
    const relatedHerbLinks: UseCaseRelatedHerbLink[] = herbs
      .filter(candidate => candidate.slug && candidate.slug !== herb.slug)
      .map(candidate => {
        const candidateProducts = getHerbProducts(candidate.slug)
        const matchedTagCount = candidateProducts.reduce((count, product) => {
          const hasMatch = product.attributes.some((tag: string) =>
            matchesUseCaseTag(tag, anchor.keywords),
          )
          return hasMatch ? count + 1 : count
        }, 0)
        const label = String(
          candidate.common || candidate.commonName || candidate.name || candidate.slug,
        ).trim()
        return {
          slug: candidate.slug,
          label,
          matchedTagCount,
        }
      })
      .filter(candidate => candidate.matchedTagCount > 0 && candidate.label)
      .sort(
        (a, b) => b.matchedTagCount - a.matchedTagCount || a.label.localeCompare(b.label),
      )
      .slice(0, 2)
      .map((candidate, index) => ({
        leadIn: index === 0 ? 'See also' : 'Compare with',
        label: candidate.label,
        to: `/herbs/${encodeURIComponent(candidate.slug)}`,
      }))

    return {
      ...anchor,
      matchedProducts,
      relatedHerbLinks,
      matchedTags: Array.from(
        new Set(
          matchedProducts.flatMap(product =>
            product.bestFor.filter(tag => matchesUseCaseTag(tag, anchor.keywords)),
          ),
        ),
      ),
    }
  }).filter(anchor => anchor.matchedProducts.length > 0)
  const ctaExperiment = resolveCtaVariant({
    pageType: 'herb_detail',
    entityType: 'herb',
    entitySlug: herb.slug,
    cautionCount,
  })
  const ctaVariantId = ctaExperiment.activeVariantId
  const governedResearch = getGovernedResearchEnrichment('herb', herb.slug)
  const governedCta = resolveGovernedCtaDecision({
    entityType: 'herb',
    entitySlug: herb.slug,
    cautionCount,
    confidence,
    sourceCount,
    relatedCollectionCount: relatedCollections.length,
    enrichment: governedResearch,
  })
  const governedFaq = governedResearch
    ? buildGovernedFaqSectionContent({
        entityType: 'herb',
        entityName: herbDisplayName,
        enrichment: governedResearch,
      })
    : null
  const governedRelatedQuestions =
    governedResearch && governedFaq
      ? buildGovernedRelatedQuestions({
          entityType: 'herb',
          entityName: herbDisplayName,
          enrichment: governedResearch,
          governedFaq,
          hasVisibleCompareSection: Boolean(linkedCompounds.length || relatedCollections.length),
        })
      : null
  const fallbackIntro = buildFallbackHerbIntro({
    herbDisplayName,
    description,
    mechanism,
    therapeuticUses,
    primaryEffects,
    confidence,
    sourceCount,
    cautionCount,
    contraindications,
    interactions,
    sideEffects,
    introFacts,
  })
  const governedIntro = buildGovernedDetailIntro({
    entityName: herbDisplayName,
    fallback: fallbackIntro,
    enrichment: governedResearch,
    sourceCount,
  })
  const governedReviewFreshness = buildGovernedReviewFreshness(governedResearch)
  const herbMetaTitle = buildGovernedMetaTitle(
    baseHerbMetaTitle,
    herbDisplayName,
    'Herb',
    herb.researchEnrichmentSummary,
  )
  const herbMetaDescription = buildGovernedMetaDescription(
    baseHerbMetaDescription,
    herb.researchEnrichmentSummary,
  )
  const pagePath = `/herbs/${herb.slug}`
  const breadcrumbId = `${SITE_URL}${pagePath}#breadcrumb`
  const enrichmentRecommendations = buildEnrichmentRecommendations('herb', herb.slug)
  const quickCompareSection = buildGovernedQuickCompareSection('herb', herb.slug)
  const herbRecommendation = getHerbRecommendation(herb.slug)
  const herbProducts = getHerbProducts(herb.slug)
  const whyPeopleChooseBullets = dedupeStrings([
    herb.categoryUseContext,
    herbRecommendation
      ? `Common buyer formats: ${herbRecommendation.recommendedForms.slice(0, 3).join(', ')}.`
      : null,
    herbRecommendation ? `Quality checks buyers use: ${herbRecommendation.preferredAttributes[0]}.` : null,
    relatedHerbLinks.length > 0
      ? `Related alternatives: ${relatedHerbLinks
          .slice(0, 3)
          .map(item => item.label)
          .join(', ')}.`
      : null,
  ]).slice(0, 4)
  const recommendationNames = {
    herb: new Map(herbs.map(item => [item.slug, item.common || item.name || item.slug])),
    compound: new Map(compounds.map(item => [item.slug, item.name || item.slug])),
  }

  return (
    <main className='container mx-auto max-w-5xl px-4 py-6 text-white sm:py-8'>
      <Meta
        title={herbMetaTitle}
        description={herbMetaDescription}
        path={pagePath}
        image={`/og/herb/${herb.slug}.png`}
        jsonLd={[
          herbJsonLd({
            name: herbDisplayName,
            slug: herb.slug,
            description: herbMetaDescription,
            latinName: herb.scientific || herb.latinName,
            breadcrumbId,
            governedSummary: herb.researchEnrichmentSummary,
          }),
          breadcrumbJsonLd(
            [
              { name: 'Home', url: SITE_URL },
              { name: 'Herbs', url: `${SITE_URL}/herbs` },
              { name: herbDisplayName, url: `${SITE_URL}${pagePath}` },
            ],
            { id: breadcrumbId },
          ),
          ...(governedFaq?.emitFaqSchema
            ? [
                faqPageJsonLd({
                  pagePath,
                  questions: governedFaq.faqItems.map(item => ({
                    question: item.question,
                    answer: item.answer,
                  })),
                }),
              ]
            : []),
        ].filter(Boolean)}
      />
      <BreadcrumbTrail
        items={[
          { label: 'Home', to: '/' },
          { label: 'Herbs', to: '/herbs' },
          { label: herbDisplayName },
        ]}
      />
      <div className='flex flex-wrap items-center gap-2'>
        <Link to='/herbs' className='btn-secondary inline-flex items-center'>
          ← Back to herbs
        </Link>
        <button
          type='button'
          className='inline-flex rounded-full border border-white/20 px-3 py-1 text-sm text-white/85 transition hover:border-white/35 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300'
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
      </div>

      <article className='ds-card-lg mt-4'>
        {/* Refactor: move highest-signal content to the very top for immediate scanning. */}
        <header>
          <div className='flex flex-col gap-2'>
            <div>
              <h1 className='text-3xl font-semibold leading-tight'>{herb.common || herb.name}</h1>
              {herb.scientific && (
                <p className='mt-1 text-sm italic text-white/55'>{herb.scientific}</p>
              )}
            </div>
          </div>
          {/* Primary effects are elevated directly under the name. */}
          {primaryEffects.length > 0 && (
            <div className='mt-3 flex flex-wrap gap-2'>
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
          {/* Keep summary concise above the fold; deep explanation is pushed lower. */}
          {(shortSummary || description) && (
            <p className='mt-4 max-w-3xl text-sm leading-relaxed text-white/80'>
              {shortSummary || description}
            </p>
          )}

          <div className='mt-3 flex flex-wrap gap-1.5'>
            {evidenceLevel && (
              <span className='inline-flex items-center gap-1.5 rounded-sm border border-emerald-400/35 bg-emerald-500/8 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-200'>
                <span aria-hidden='true'>✓</span> {evidenceLevel}
              </span>
            )}
            <span className='inline-flex items-center gap-1.5 rounded-sm border border-emerald-400/35 bg-emerald-500/8 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-200'>
              <span aria-hidden='true'>✓</span> {sourceCount} source{sourceCount === 1 ? '' : 's'}
            </span>
            {cautionCount > 0 && (
              <span className='inline-flex items-center gap-1.5 rounded-sm border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-200'>
                <span aria-hidden='true'>⚠</span> {cautionCount} caution signal{cautionCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <div className='mt-2'>
            <Link
              to={herbCheckerHref}
              className='btn-primary inline-flex text-xs'
              onClick={() =>
                trackDetailCheckerClick({
                  detailType: 'herb',
                  detailSlug: herb.slug,
                  placement: 'above_fold_primary_cta',
                })
              }
            >
              {governedCta.copy.toolButtonLabel}
            </Link>
          </div>
        </header>

        {/* Core content */}
        {description && description !== shortSummary && (
          <Section title='Overview'>
            {description}
          </Section>
        )}

        {isDataIncomplete && (
          <div className='bg-amber-500/8 mt-4 rounded-xl border border-amber-300/30 p-3 text-sm text-amber-100'>
            <p className='font-semibold'>Incomplete profile</p>
            <p className='mt-1 text-amber-50/80'>
              Key evidence fields are missing. Treat this as a draft — cross-check before making
              decisions.
            </p>
          </div>
        )}

        {/* Confidence explanations are now hidden by default to reduce initial clutter. */}
        <section className='border-white/8 mt-6 border-t pt-5'>
          <Collapse title='Confidence & data quality'>
            <div className='space-y-4'>
              <GovernedReviewFreshnessPanel
                decision={governedReviewFreshness}
                nextStepHref='#governed-safety-interactions'
                analyticsContext={{
                  pageType: 'herb_detail',
                  entityType: 'herb',
                  entitySlug: herb.slug,
                }}
              />
              <DataTrustPanel
                entity='herb'
                confidence={confidence}
                completeness={completeness}
                sourceCount={sourceCount}
                lastReviewed={lastUpdated}
                cautionCount={cautionCount}
                hasInferredContent={hasInferredContent}
                hasFallbackContent={hasFallbackContent}
              />
            </div>
          </Collapse>
        </section>

        <StructuredDetailIntro
          confidence={confidence}
          whatItIs={governedIntro.whatItIs}
          commonUse={governedIntro.commonUse}
          evidenceContext={governedIntro.evidenceContext}
          cautionNote={governedIntro.cautionNote}
          quickFacts={governedIntro.quickFacts}
          nextSteps={[
            { label: 'Check this herb in interactions', to: herbCheckerHref },
            {
              label: 'Review active compounds',
              to: '#key-active-compounds',
              variant: 'secondary',
            },
            { label: 'Add to stack builder', to: '/build', variant: 'secondary' },
          ]}
          onStepClick={step => {
            if (step.to.startsWith('/interactions')) {
              trackDetailCheckerClick({
                detailType: 'herb',
                detailSlug: herb.slug,
                placement: 'quick_intro_next_steps',
              })
            }
            if (step.to === '/build') {
              trackDetailBuilderClick({
                detailType: 'herb',
                detailSlug: herb.slug,
                placement: 'quick_intro_next_steps',
              })
            }
          }}
          analyticsContext={{
            pageType: 'herb_detail',
            entityType: 'herb',
            entitySlug: herb.slug,
            profile: governedIntro.decision.mode,
          }}
        />

        {intensity || evidenceLevel || completenessPct !== null ? (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <div className='flex flex-wrap gap-2'>
              {intensity && (
                <span className='bg-white/6 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80'>
                  {intensity}
                </span>
              )}
              {evidenceLevel && (
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${evidenceBadgeTone}`}
                >
                  Evidence: {evidenceLevel}
                </span>
              )}
              {completenessPct !== null && (
                <span className='rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-100'>
                  {completenessLabel} ({Math.round(completenessPct)}%)
                </span>
              )}
            </div>
          </section>
        ) : null}

        <CtaVariantLayout
          variant={ctaExperiment.variant}
          slotOrderOverride={governedCta.slotOrder}
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
              sourceType: 'detail',
              source: `herb:${herb.slug}`,
              placement: 'cta_experiment_slot',
              ctaMetadata: {
                pageType: 'herb_detail',
                entitySlug: herb.slug,
                ctaType,
                ctaPosition: `position_${position}`,
                variantId: ctaVariantId,
              },
            })
          }}
          slots={{
            tool: (
              <div className='rounded-lg border border-emerald-300/30 bg-emerald-500/10 p-3'>
                <p className='text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100'>
                  {governedCta.copy.toolTitle}
                </p>
                <p className='mt-1 text-xs text-white/75'>{governedCta.copy.toolBody}</p>
                <Link
                  to={herbCheckerHref}
                  className='btn-primary mt-2 inline-flex text-xs'
                  onClick={() =>
                    trackDetailCheckerClick({
                      detailType: 'herb',
                      detailSlug: herb.slug,
                      placement: 'cta_variant_tool',
                      ctaMetadata: {
                        pageType: 'herb_detail',
                        entitySlug: herb.slug,
                        ctaType: 'tool',
                        ctaPosition: 'detail_tool_checker',
                        variantId: ctaVariantId,
                      },
                    })
                  }
                >
                  {governedCta.copy.toolButtonLabel}
                </Link>
              </div>
            ),
            builder: (
              <div className='rounded-lg border border-cyan-300/25 bg-cyan-500/10 p-3'>
                <p className='text-xs text-white/75'>{governedCta.copy.builderBody}</p>
                <Link
                  to='/build'
                  className='btn-secondary mt-2 inline-flex text-xs'
                  onClick={() =>
                    trackDetailBuilderClick({
                      detailType: 'herb',
                      detailSlug: herb.slug,
                      placement: 'cta_variant_builder',
                      ctaMetadata: {
                        pageType: 'herb_detail',
                        entitySlug: herb.slug,
                        ctaType: 'builder',
                        ctaPosition: 'detail_stack_builder',
                        variantId: ctaVariantId,
                      },
                    })
                  }
                >
                  {governedCta.copy.builderButtonLabel}
                </Link>
              </div>
            ),
            related: relatedCollections.length > 0 && (
              <div className='rounded-lg border border-white/10 bg-white/[0.02] p-3'>
                <p className='text-xs font-semibold text-white'>{governedCta.copy.relatedTitle}</p>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {relatedCollections.slice(0, 3).map(collection => (
                    <Link
                      key={`cta-${collection.slug}`}
                      to={`/collections/${collection.slug}`}
                      className='btn-secondary text-xs'
                      onClick={() =>
                        trackGovernedEvent({
                          type: 'governed_cta_click',
                          eventAction: 'click',
                          pageType: 'herb_detail',
                          entityType: 'herb',
                          entitySlug: herb.slug,
                          surfaceId: 'detail_cta_related',
                          componentType: 'related_collection_cta',
                          item: collection.slug,
                          variantId: ctaVariantId,
                          reviewedStatus: 'reviewed',
                          freshnessState: 'not_applicable',
                        })
                      }
                    >
                      {collection.title}
                    </Link>
                  ))}
                </div>
              </div>
            ),
            affiliate: curatedProducts.length > 0 && (
              <CuratedProductModule
                entityType='herb'
                entitySlug={herb.slug}
                products={curatedProducts}
                positionContext='herb_detail_cta_variant'
                pageType='herb_detail'
                variantId={ctaVariantId}
                ctaPosition='detail_affiliate_module'
                preDisclosureGuidance={governedCta.copy.affiliateLeadIn}
                useCaseAnchor={activeUseCaseAnchor}
              />
            ),
          }}
        />

        {therapeuticUses.length > 0 && (
          <Section title='What it’s used for'>
            <ListSection items={therapeuticUses} maxVisible={6} />
          </Section>
        )}

        {contraindications.length > 0 && (
          <Section title='Who should be careful'>
            <ListSection items={contraindications} maxVisible={6} />
          </Section>
        )}

        {sideEffects.length > 0 && (
          <Section title='Possible side effects'>
            <ListSection items={sideEffects} maxVisible={6} />
          </Section>
        )}

        {qualityConcerns && (
          <div className='mt-4 rounded-xl border border-amber-300/35 bg-amber-500/12 p-3 text-sm text-amber-100'>
            <p className='font-semibold'>⚠ Quality concerns</p>
            <p className='mt-1 text-amber-50/90'>{qualityConcerns}</p>
          </div>
        )}

        <PremiumDataSection details={premiumDetails} />

        {relationGroups.length > 0 && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            {/* Related entities are grouped into a dedicated accordion for cleaner information hierarchy. */}
            <Collapse title='Related herbs & compounds'>
              <div className='space-y-4'>
                {relationGroups.map(group => (
                  <div key={group.title}>
                    <p className='text-xs font-semibold uppercase tracking-[0.14em] text-white/60'>
                      {group.title}
                    </p>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {group.items.map(item => (
                        <Link
                          key={`${group.title}-${item.to}`}
                          to={item.to}
                          className='ds-pill transition hover:border-white/30'
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Collapse>
          </section>
        )}

        {compoundCount !== null && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <p className='text-xs uppercase tracking-[0.16em] text-white/55'>Workbook coverage</p>
            <p className='mt-2 text-sm text-white/80'>
              Compound records linked: <span className='font-semibold text-white'>{compoundCount}</span>
            </p>
          </section>
        )}

        {(whyPeopleChooseBullets.length > 0 || useCaseAnchors.length > 0) && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <div className='rounded-2xl border border-white/12 bg-white/[0.03] p-4'>
              <h2 className='text-xs font-semibold uppercase tracking-[0.18em] text-white/55'>
                Why it matters and how to choose
              </h2>
              {whyPeopleChooseBullets.length > 0 && (
                <ul className='mt-3 list-disc space-y-1.5 pl-5 text-sm text-white/85'>
                  {whyPeopleChooseBullets.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {useCaseAnchors.length > 0 && (
                <div className='mt-4 space-y-2'>
                  {useCaseAnchors.map(anchor => (
                    <article
                      key={anchor.key}
                      className='rounded-xl border border-white/12 bg-white/[0.02] p-3 text-sm text-white/85'
                      onClick={() => setActiveUseCaseAnchor(anchor.key)}
                    >
                      <p className='text-sm font-semibold text-white'>{anchor.question}</p>
                      <p className='mt-1 text-xs text-white/70'>{anchor.guidance}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {herbRecommendation && <HerbBuyerGuidanceSection recommendation={herbRecommendation} />}
        {herbProducts.length > 0 && (
          <HerbProductSection
            herbSlug={herb.slug}
            products={herbProducts}
            useCaseAnchor={activeUseCaseAnchor}
          />
        )}

        {herbClass && <Section title='Class'>{herbClass}</Section>}

        {mechanism && (
          <Section title='Mechanism of Action'>
            <div className='space-y-3'>
              <p>{mechanism}</p>
              {mechanismTags.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {mechanismTags.map(tag => (
                    <span key={tag} className='ds-pill'>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Section>
        )}

        {pathwayTargets.length > 0 && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <Collapse title='Biological Pathways'>
              <div className='flex flex-wrap gap-2 text-sm text-white/85'>
                {pathwayTargets.map(target => (
                  <span key={target} className='ds-pill'>
                    {target}
                  </span>
                ))}
              </div>
            </Collapse>
          </section>
        )}

        {linkedCompounds.length > 0 && (
          <section id='key-active-compounds' className='border-white/8 mt-6 border-t pt-5'>
            <Collapse title='Key Active Compounds'>
              <div className='space-y-3 text-sm leading-relaxed text-white/85'>
                <div className='flex flex-wrap gap-2'>
                  {linkedCompounds.map(compound =>
                    compound.slug ? (
                      <Link
                        key={compound.name}
                        to={`/compounds/${encodeURIComponent(compound.slug)}`}
                        className='ds-pill transition hover:border-white/30'
                        onClick={() =>
                          trackDetailRelatedEntityClick({
                            detailType: 'herb',
                            detailSlug: herb.slug,
                            targetType: 'compound',
                            targetSlug: compound.slug,
                            placement: 'key_active_compounds',
                          })
                        }
                      >
                        {compound.name}
                      </Link>
                    ) : (
                      <span key={compound.name} className='ds-pill'>
                        {compound.name}
                      </span>
                    ),
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

        <section id='governed-compare-links'>
          <GovernedQuickCompareBlock
            section={quickCompareSection}
            analyticsContext={{
              pageType: 'herb_detail',
              entityType: 'herb',
              entitySlug: herb.slug,
              evidenceLabel: governedResearch?.pageEvidenceJudgment?.evidenceLabel,
              safetySignalPresent: cautionCount > 0,
            }}
          />
          <EnrichmentRecommendationBlocks
            bundle={enrichmentRecommendations}
            names={recommendationNames}
            onRecommendationClick={(item, placement) =>
              trackDetailRelatedEntityClick({
                detailType: 'herb',
                detailSlug: herb.slug,
                targetType: item.targetType,
                targetSlug: item.targetSlug,
                placement,
              })
            }
          />
        </section>

        {relatedCollections.length > 0 && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <Collapse title='Explore Related Goal Collections'>
              <div className='space-y-2 text-sm text-white/85'>
                <p className='text-xs text-white/65'>
                  Use these goal pages to compare alternatives with similar effect and interaction
                  signatures.
                </p>
                <div className='flex flex-wrap gap-2'>
                  {relatedCollections.map(collection => (
                    <Link
                      key={collection.slug}
                      to={`/collections/${collection.slug}`}
                      className='btn-secondary text-xs'
                      onClick={() =>
                        trackDetailRelatedEntityClick({
                          detailType: 'herb',
                          detailSlug: herb.slug,
                          targetType: 'collection',
                          targetSlug: collection.slug,
                          placement: 'related_collections',
                        })
                      }
                    >
                      {collection.title}
                    </Link>
                  ))}
                </div>
              </div>
            </Collapse>
          </section>
        )}

        {effects.length > 0 && (
          <Section title='Effects'>
            <ListSection items={effects} maxVisible={6} />
          </Section>
        )}

        {interactions.length > 0 && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <Collapse title='Drug interactions'>
              <div className='text-sm leading-relaxed text-white/85'>
                <ListSection items={interactions} maxVisible={6} />
              </div>
            </Collapse>
          </section>
        )}

        {/* Practical info — merged for faster scanning */}
        {practicalInfo.length > 0 && (
          <Section title='How to use'>
            <ListSection items={practicalInfo} />
          </Section>
        )}
        {region && <Section title='Region'>{region}</Section>}
        {legalStatus && <Section title='Legal Status'>{legalStatus}</Section>}

        {(sources.length > 0 || (governedResearch && governedFaq && governedRelatedQuestions)) && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            {/* Research bundle moved to bottom to avoid overload above the fold. */}
            <Collapse title='Research'>
              <div className='space-y-4'>
                {governedResearch && governedFaq && governedRelatedQuestions && (
                  <GovernedResearchSections
                    enrichment={governedResearch}
                    governedFaq={governedFaq}
                    relatedQuestions={governedRelatedQuestions}
                    analyticsContext={{
                      pageType: 'herb_detail',
                      entityType: 'herb',
                      entitySlug: herb.slug,
                    }}
                  />
                )}
                {sources.length > 0 && (
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
                )}
              </div>
            </Collapse>
          </section>
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
