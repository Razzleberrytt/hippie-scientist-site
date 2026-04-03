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
import { splitClean } from '@/lib/sanitize'
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
  const herbMetaDescriptionSource = (
    herb.summary ||
    herb.description ||
    therapeuticUses[0] ||
    effects.slice(0, 2).join(', ')
  ).trim()
  const baseHerbMetaDescription = formatMetaDescription(
    herbMetaDescriptionSource,
    `${herbDisplayName} herb guide with effects, safety notes, and practical context.`,
  )
  const baseHerbMetaTitle = `${herbDisplayName} Herb Guide: Effects, Uses & Safety`

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
          const hasMatch = product.bestFor.some(tag => matchesUseCaseTag(tag, anchor.keywords))
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
    herbProducts.length > 0
      ? `Product options shown: ${herbProducts.length} format${herbProducts.length === 1 ? '' : 's'} for side-by-side comparison.`
      : null,
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
    <main className='container mx-auto max-w-4xl px-4 py-8 text-white'>
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

          {isDataIncomplete && (
            <div className='bg-amber-500/8 mt-4 rounded-xl border border-amber-300/30 p-3 text-sm text-amber-100'>
              <p className='font-semibold'>Incomplete profile</p>
              <p className='mt-1 text-amber-50/80'>
                Key evidence fields are missing. Treat this as a draft — cross-check before making
                decisions.
              </p>
            </div>
          )}

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
          <GovernedReviewFreshnessPanel
            decision={governedReviewFreshness}
            nextStepHref='#governed-safety-interactions'
            analyticsContext={{
              pageType: 'herb_detail',
              entityType: 'herb',
              entitySlug: herb.slug,
            }}
          />

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
                  <p className='text-xs font-semibold text-white'>
                    {governedCta.copy.relatedTitle}
                  </p>
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

        <PremiumDataSection
          details={premiumDetails}
          relationGroups={relationGroups}
        />

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

        {/* Core content */}
        {description && (
          <Section title='Overview'>
            {confidence === 'low' ? (
              <p className='mb-2 rounded-lg border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-amber-100'>
                Evidence context: this overview is low-confidence and may rely on limited or
                indirect data.
              </p>
            ) : null}
            {description}
          </Section>
        )}

        {whyPeopleChooseBullets.length > 0 && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <div className='rounded-2xl border border-white/12 bg-white/[0.03] p-4'>
              <h2 className='text-xs font-semibold uppercase tracking-[0.18em] text-white/55'>
                Why people choose this herb
              </h2>
              <ul className='mt-3 list-disc space-y-1.5 pl-5 text-sm text-white/85'>
                {whyPeopleChooseBullets.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {useCaseAnchors.length > 0 && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <h2 className='mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/50'>
              Use Case Anchors
            </h2>
            <div className='space-y-3'>
              {useCaseAnchors.map(anchor => (
                <article
                  key={anchor.key}
                  className='rounded-lg border border-white/15 bg-white/[0.02] p-3 text-sm text-white/85'
                  onClick={() => setActiveUseCaseAnchor(anchor.key)}
                >
                  <p className='text-sm font-semibold text-white'>{anchor.question}</p>
                  <p className='mt-1 text-xs text-white/70'>{anchor.guidance}</p>
                  <p className='mt-2 text-xs text-white/70'>
                    Matching tags: {anchor.matchedTags.join(' · ')}
                  </p>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {anchor.matchedProducts.slice(0, 2).map(product => (
                      <span
                        key={`${anchor.key}-${product.productId}`}
                        className='rounded-full border border-emerald-300/35 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-100'
                      >
                        {product.productTitle}
                      </span>
                    ))}
                  </div>
                  {anchor.relatedHerbLinks.length > 0 && (
                    <p className='mt-2 text-xs text-white/75'>
                      {anchor.relatedHerbLinks.map(link => (
                        <span key={`${anchor.key}-${link.to}`} className='mr-4 inline-block'>
                          {link.leadIn}:{' '}
                          <Link to={link.to} className='text-violet-200 underline-offset-2 hover:underline'>
                            {link.label}
                          </Link>
                        </span>
                      ))}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {herbClass && <Section title='Class'>{herbClass}</Section>}

        {mechanism && <Section title='Mechanism of Action'>{mechanism}</Section>}

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
        {herbRecommendation && <HerbBuyerGuidanceSection recommendation={herbRecommendation} />}
        {herbProducts.length > 0 && (
          <HerbProductSection
            herbSlug={herb.slug}
            products={herbProducts}
            useCaseAnchor={activeUseCaseAnchor}
          />
        )}
      </article>
    </main>
  )
}
