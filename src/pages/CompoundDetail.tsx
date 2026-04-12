import { type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import DataTrustPanel from '@/components/trust/DataTrustPanel'
import { useCompoundDataState, useCompoundDetailState } from '@/lib/compound-data'
import { useHerbDataState } from '@/lib/herb-data'
import { splitClean } from '@/lib/sanitize'
import { pickNonEmptyKeys } from '@/lib/nonEmptyFields'
import { calculateCompoundConfidence } from '@/utils/calculateConfidence'
import { getCompoundDataCompleteness } from '@/utils/getDataCompleteness'
import { extractPrimaryEffects } from '@/utils/extractPrimaryEffects'
import { CompoundDetailSkeleton } from '@/components/skeletons/DetailSkeletons'
import { mapRelatedHerbsForCompound } from '@/lib/compoundHerbRelations'
import HerbCard from '@/components/HerbCard'
import Collapse from '@/components/ui/Collapse'
import {
  breadcrumbJsonLd,
  buildGovernedMetaDescription,
  buildGovernedMetaTitle,
  compoundJsonLd,
  faqPageJsonLd,
  formatMetaDescription,
  SITE_URL,
} from '@/lib/seo'
import { countCautionSignals, inferContentFlags } from '@/lib/trust'
import { SEO_COLLECTIONS } from '@/data/seoCollections'
import { filterCompoundByCollection } from '@/lib/collectionQuality'
import StructuredDetailIntro from '@/components/detail/StructuredDetailIntro'
import GovernedResearchSections from '@/components/detail/GovernedResearchSections'
import GovernedReviewFreshnessPanel from '@/components/detail/GovernedReviewFreshnessPanel'
import EnrichmentRecommendationBlocks from '@/components/detail/EnrichmentRecommendationBlocks'
import GovernedQuickCompareBlock from '@/components/detail/GovernedQuickCompareBlock'
import PremiumDataSection from '@/components/detail/PremiumDataSection'
import CuratedProductModule from '@/components/CuratedProductModule'
import CtaVariantLayout from '@/components/cta/CtaVariantLayout'
import { resolveCtaVariant } from '@/config/ctaExperiments'
import { getRenderableCuratedProducts } from '@/lib/curatedProducts'
import BreadcrumbTrail from '@/components/navigation/BreadcrumbTrail'
import { getGovernedResearchEnrichment } from '@/lib/governedResearch'
import { buildGovernedFaqSectionContent } from '@/lib/governedFaq'
import { buildGovernedRelatedQuestions } from '@/lib/governedRelatedQuestions'
import { buildEnrichmentRecommendations } from '@/lib/enrichmentRecommendations'
import { buildGovernedQuickCompareSection } from '@/lib/governedQuickCompare'
import { buildFallbackCompoundIntro, buildGovernedDetailIntro } from '@/lib/governedIntro'
import { resolveGovernedCtaDecision } from '@/lib/governedCta'
import { buildGovernedReviewFreshness } from '@/lib/governedReviewFreshness'
import {
  trackDetailBuilderClick,
  trackCtaSlotImpression,
  trackDetailCheckerClick,
  trackDetailRelatedEntityClick,
} from '@/lib/contentJourneyTracking'
import { trackGovernedEvent } from '@/lib/governedAnalytics'

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

type RelatedLinkItem = {
  label: string
  to: string
}

function buildInteractionsLink(tokens: string[]) {
  if (!tokens.length) return '/interactions'
  return `/interactions?items=${tokens.join(',')}`
}

function normalizeKey(value: string) {
  return value.trim().toLowerCase()
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


function normalizeTextValue(value: unknown): string {
  return String(value || '').trim()
}

function splitPipeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(item => normalizeTextValue(item)).filter(Boolean)
  }
  return normalizeTextValue(value)
    .split('|')
    .map(item => item.trim())
    .filter(Boolean)
}

function toTitleCase(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

function buildSourceLabel(rawUrl: string, fallbackTitle: string) {
  const title = normalizeTextValue(fallbackTitle)
  const genericTitle = !title || /^(source|link|reference|article|study)$/i.test(title)
  try {
    const domain = new URL(rawUrl).hostname.replace(/^www\./i, '')
    return genericTitle ? domain : title
  } catch {
    return title || rawUrl
  }
}

export default function CompoundDetail() {
  const { slug = '' } = useParams()
  const { compounds, isLoading: isCompoundsLoading } = useCompoundDataState()
  const slugNeedle = normalizeKey(slug)
  const detailLookupSlug =
    compounds.find(item => {
      const record = item as unknown as Record<string, unknown>
      const candidates = [
        item.slug,
        item.id,
        normalizeTextValue(record.canonicalCompoundId),
      ]
      return candidates.some(candidate => normalizeKey(String(candidate || '')) === slugNeedle)
    })?.slug || slug
  const { compound, isLoading: isCompoundLoading } = useCompoundDetailState(detailLookupSlug)
  const { herbs, isLoading: isHerbLoading } = useHerbDataState()

  if (isCompoundLoading || isCompoundsLoading || isHerbLoading) {
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

  const compoundRecord = compound as unknown as Record<string, unknown>
  const name =
    normalizeTextValue(compoundRecord.compoundName) ||
    normalizeTextValue(compoundRecord.name) ||
    normalizeTextValue(compoundRecord.id) ||
    'Unknown compound'
  const evidence = normalizeTextValue(compoundRecord.evidence)
  const pharmacokinetics = normalizeTextValue(compoundRecord.pharmacokinetics)
  const pathwayTargets = splitClean(compoundRecord.pathwayTargets)
  const workbookSources = splitPipeList(compoundRecord.sourceUrls)
  const relatedHerbSlugs = splitClean(compoundRecord.relatedHerbSlugs)
  const drugInteractions = normalizeTextValue(compoundRecord.drugInteractions)
  const uniqueDrugInteractionItems = Array.from(
    new Map(
      [...compound.interactions, ...(drugInteractions ? [drugInteractions] : [])]
        .map(item => normalizeTextValue(item))
        .filter(Boolean)
        .map(item => [normalizeKey(item), item]),
    ).values(),
  )

  const linkedHerbs = mapRelatedHerbsForCompound(compound, herbs)
  const herbByKey = new Map<string, { label: string; slug: string }>()
  const compoundByKey = new Map<string, { label: string; slug: string }>()

  herbs.forEach(item => {
    const label = item.common || item.name || item.scientific || item.slug
    ;[item.slug, item.common, item.name, item.scientific].forEach(candidate => {
      const value = String(candidate || '').trim()
      if (!value) return
      herbByKey.set(normalizeKey(value), { label, slug: item.slug })
    })
  })

  compounds.forEach(item => {
    const label = item.name || item.slug
    ;[item.slug, item.name].forEach(candidate => {
      const value = String(candidate || '').trim()
      if (!value) return
      compoundByKey.set(normalizeKey(value), { label, slug: item.slug })
    })
  })

  const whyItMatters = compound.effects.slice(0, 2).join(' + ')
  const doesText = compound.mechanism || compound.description
  const premiumDetails = [
    { title: 'Identity', value: compound.identity },
    {
      title: 'Category / Use Context',
      value: compound.categoryUseContext,
    },
    { title: 'Evidence Level', value: compound.evidenceLevel },
  ]
  const premiumHerbEntries =
    compound.linkedHerbs.length > 0 ? compound.linkedHerbs : compound.relatedEntities
  const premiumRelatedHerbs = premiumHerbEntries.map(entry => {
    const normalized = herbByKey.get(normalizeKey(entry))
    return normalized?.slug
      ? {
          label: normalized.label || entry.replace(/-/g, ' '),
          to: `/herbs/${encodeURIComponent(normalized.slug)}`,
        }
      : null
  })
  const premiumRelatedCompounds = compound.relatedCompounds.map(entry => {
    const normalized = compoundByKey.get(normalizeKey(entry))
    return normalized?.slug
      ? {
          label: normalized.label || entry,
          to: `/compounds/${encodeURIComponent(normalized.slug)}`,
        }
      : null
  })
  const linkedHerbCards = linkedHerbs.filter(herb => herb.slug && herbByKey.has(normalizeKey(herb.slug)))
  const foundInHerbLinks = dedupeRelatedLinks([
    ...linkedHerbCards.map(herb => ({
      label: herb.name,
      to: `/herbs/${encodeURIComponent(herb.slug)}`,
    })),
    ...premiumRelatedHerbs,
    ...relatedHerbSlugs.map(entry => {
      const normalized = herbByKey.get(normalizeKey(entry))
      const resolvedSlug = normalized?.slug || entry
      return {
        label: normalized?.label || toTitleCase(entry),
        to: `/herbs/${encodeURIComponent(resolvedSlug)}`,
      }
    }),
  ])
  const relatedCompoundLinks = dedupeRelatedLinks(premiumRelatedCompounds)
  const relationGroups = [
    {
      title: `Found In Herbs (${foundInHerbLinks.length})`,
      items: foundInHerbLinks,
    },
    {
      title: `Related Compounds (${relatedCompoundLinks.length})`,
      items: relatedCompoundLinks,
    },
  ].filter(group => group.items.length > 0)

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

  const sourceCount = compound.sources.length
  const cautionCount = countCautionSignals({
    contraindications: compound.contraindications,
    interactions: compound.interactions,
    sideEffects: compound.sideEffects,
  })
  const { hasInferredContent, hasFallbackContent } = inferContentFlags({
    description: compound.description,
    mechanism: compound.mechanism,
    effects: compound.effects,
    therapeuticUses: compound.therapeuticUses,
  })

  const keyFields = pickNonEmptyKeys(
    {
      mechanism: compound.mechanism,
      effects: compound.effects,
      contraindications: compound.contraindications,
      herbs: compound.herbs,
    },
    ['mechanism', 'effects', 'contraindications', 'herbs'],
  )
  const shouldShowContributionCta = keyFields.length < 3
  const compoundToken = encodeURIComponent(`compound:${compound.slug}`)
  const compoundCheckerHref = buildInteractionsLink([compoundToken])
  const relatedCollections = SEO_COLLECTIONS.filter(
    collection => collection.itemType === 'compound',
  )
    .filter(collection =>
      filterCompoundByCollection(
        compound as unknown as Record<string, unknown>,
        collection.filters,
      ),
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
    entityType: 'compound',
    entitySlug: compound.slug,
    confidence,
    sourceCount,
  })
  const ctaExperiment = resolveCtaVariant({
    pageType: 'compound_detail',
    entityType: 'compound',
    entitySlug: compound.slug,
    cautionCount,
  })
  const ctaVariantId = ctaExperiment.activeVariantId
  const governedResearch = getGovernedResearchEnrichment('compound', compound.slug)
  const governedCta = resolveGovernedCtaDecision({
    entityType: 'compound',
    entitySlug: compound.slug,
    cautionCount,
    confidence,
    sourceCount,
    relatedCollectionCount: relatedCollections.length,
    enrichment: governedResearch,
  })
  const governedFaq = governedResearch
    ? buildGovernedFaqSectionContent({
        entityType: 'compound',
        entityName: name,
        enrichment: governedResearch,
      })
    : null
  const governedRelatedQuestions =
    governedResearch && governedFaq
      ? buildGovernedRelatedQuestions({
          entityType: 'compound',
          entityName: name,
          enrichment: governedResearch,
          governedFaq,
          hasVisibleCompareSection: Boolean(foundInHerbLinks.length || relatedCollections.length),
        })
      : null
  const fallbackIntro = buildFallbackCompoundIntro({
    compoundName: name,
    description: compound.description,
    mechanism: compound.mechanism,
    therapeuticUses: compound.therapeuticUses,
    primaryEffects,
    linkedHerbCount: linkedHerbs.length,
    confidence,
    sourceCount,
    cautionCount,
    contraindications: compound.contraindications,
    interactions: compound.interactions,
    sideEffects: compound.sideEffects,
    introFacts,
  })
  const governedIntro = buildGovernedDetailIntro({
    entityName: name,
    fallback: fallbackIntro,
    enrichment: governedResearch,
    sourceCount,
  })
  const governedReviewFreshness = buildGovernedReviewFreshness(governedResearch)
  const topSummary =
    governedIntro.whatItIs || governedIntro.commonUse || compound.description || compound.mechanism
  const enrichmentRecommendations = buildEnrichmentRecommendations('compound', compound.slug)
  const quickCompareSection = buildGovernedQuickCompareSection('compound', compound.slug)
  const recommendationNames = {
    herb: new Map(herbs.map(item => [item.slug, item.common || item.name || item.slug])),
    compound: new Map(compounds.map(item => [item.slug, item.name || item.slug])),
  }

  // Derive a display class — category only if it's meaningful
  const displayClass =
    compound.className || (compound.category !== 'Uncategorized' ? compound.category : '')
  const compoundEffectsMetaText = Array.isArray(compound.effects)
    ? compound.effects.join(', ').slice(0, 155)
    : ''
  const compoundDescriptionSource = (
    compound.description ||
    compound.mechanism ||
    compoundEffectsMetaText
  ).trim()
  const baseCompoundMetaDescription = formatMetaDescription(
    compoundDescriptionSource,
    `${name} compound guide with pharmacology, effects, and safety notes.`,
  )
  const baseCompoundMetaTitle = `${name} Compound Guide: Mechanism, Effects & Safety`
  const compoundMetaTitle = buildGovernedMetaTitle(
    baseCompoundMetaTitle,
    name,
    'Compound',
    compound.researchEnrichmentSummary,
  )
  const compoundMetaDescription = buildGovernedMetaDescription(
    baseCompoundMetaDescription,
    compound.researchEnrichmentSummary,
  )
  const pagePath = `/compounds/${compound.slug}`
  const breadcrumbId = `${SITE_URL}${pagePath}#breadcrumb`

  return (
    <main className='container mx-auto max-w-4xl px-4 py-8 text-white'>
      <Meta
        title={compoundMetaTitle}
        description={compoundMetaDescription}
        path={pagePath}
        jsonLd={[
          compoundJsonLd({
            name,
            slug: compound.slug,
            description: compoundMetaDescription,
            category: compound.category,
            breadcrumbId,
            governedSummary: compound.researchEnrichmentSummary,
          }),
          breadcrumbJsonLd(
            [
              { name: 'Home', url: SITE_URL },
              { name: 'Compounds', url: `${SITE_URL}/compounds` },
              { name, url: `${SITE_URL}${pagePath}` },
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
          { label: 'Compounds', to: '/compounds' },
          { label: name },
        ]}
      />
      <Link to='/compounds' className='btn-secondary inline-flex items-center'>
        ← Back to compounds
      </Link>

      <article className='ds-card-lg mt-4'>
        {/* Header */}
        <header>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <h1 className='text-3xl font-semibold leading-tight'>{name}</h1>
            {displayClass && (
              <span className='bg-white/6 mt-1 shrink-0 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80'>
                {displayClass}
              </span>
            )}
          </div>
          {(confidence || evidence) && (
            <div className='mt-3 flex flex-wrap gap-2'>
              {confidence && <span className='ds-pill'>Confidence: {confidence}</span>}
              {evidence && <span className='ds-pill'>Evidence: {evidence}</span>}
            </div>
          )}
          {topSummary && <p className='mt-4 text-sm leading-relaxed text-white/80'>{topSummary}</p>}
          <Link
            to={compoundCheckerHref}
            className='btn-primary mt-4 inline-flex'
            onClick={() =>
              trackDetailCheckerClick({
                detailType: 'compound',
                detailSlug: compound.slug,
                placement: 'top_summary_primary_cta',
              })
            }
          >
            Check this compound in interactions
          </Link>
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

        <PremiumDataSection
          details={premiumDetails}
          relationGroups={relationGroups}
        />

        {/* Core fields — only render when value is present */}
        {compound.description && (
          <Section title='Overview'>
            {confidence === 'low' ? (
              <p className='mb-2 rounded-lg border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-amber-100'>
                Evidence context: this overview is low-confidence and may include inferred or sparse
                findings.
              </p>
            ) : null}
            {compound.description}
          </Section>
        )}

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
                  explain why {name} is discussed in herbal profiles for{' '}
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


        {pharmacokinetics && <Section title='Pharmacokinetics'>{pharmacokinetics}</Section>}

        {pathwayTargets.length > 0 && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <Collapse title='Pathway Targets'>
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
          compound.sideEffects.length > 0 ||
          uniqueDrugInteractionItems.length > 0) && (
          <section id='governed-safety-interactions' className='border-white/8 mt-6 border-t pt-5'>
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
                {uniqueDrugInteractionItems.length > 0 && (
                  <div>
                    <h3 className='mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55'>
                      Drug Interactions
                    </h3>
                    <ListSection items={uniqueDrugInteractionItems} />
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

        {/* Found in */}
        {foundInHerbLinks.length > 0 && (
          <section id='related-herbs' className='border-white/8 mt-6 border-t pt-5'>
            <Collapse title={`Found In (${foundInHerbLinks.length})`}>
              <div className='space-y-4 text-sm leading-relaxed text-white/85'>
                {linkedHerbCards.length > 0 && (
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    {linkedHerbCards.map(herb => (
                      <HerbCard
                        key={herb.slug}
                        name={herb.name}
                        summary={herb.descriptor || 'Learn more about this herb and its potential uses.'}
                        tags={extractPrimaryEffects(herb.effects, 2)}
                        detailUrl={`/herbs/${encodeURIComponent(herb.slug)}`}
                      />
                    ))}
                  </div>
                )}
                <div>
                  <h3 className='mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55'>
                    Quick Links
                  </h3>
                  <div className='flex flex-wrap gap-2.5'>
                    {foundInHerbLinks.map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className='inline-flex items-center rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-xs font-medium tracking-[0.01em] text-white/86 transition duration-200 hover:border-white/24 hover:bg-white/[0.085] hover:text-white'
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </Collapse>
          </section>
        )}

        {relatedCollections.length > 0 && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <Collapse title='Compare in Related Collections'>
              <div className='space-y-2 text-sm text-white/85'>
                <p className='text-xs text-white/65'>
                  Jump to these collection pages to compare adjacent compounds for similar goals.
                </p>
                <div className='flex flex-wrap gap-2'>
                  {relatedCollections.map(collection => (
                    <Link
                      key={collection.slug}
                      to={`/collections/${collection.slug}`}
                      className='btn-secondary text-xs'
                      onClick={() =>
                        trackDetailRelatedEntityClick({
                          detailType: 'compound',
                          detailSlug: compound.slug,
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

        {governedResearch && governedFaq && governedRelatedQuestions && (
          <GovernedResearchSections
            enrichment={governedResearch}
            governedFaq={governedFaq}
            relatedQuestions={governedRelatedQuestions}
            analyticsContext={{
              pageType: 'compound_detail',
              entityType: 'compound',
              entitySlug: compound.slug,
            }}
          />
        )}

        <DataTrustPanel
          entity='compound'
          confidence={confidence}
          completeness={completeness}
          sourceCount={sourceCount}
          lastReviewed={compound.lastUpdated}
          cautionCount={cautionCount}
          hasInferredContent={hasInferredContent}
          hasFallbackContent={hasFallbackContent}
        />
        <GovernedReviewFreshnessPanel
          decision={governedReviewFreshness}
          nextStepHref='#governed-safety-interactions'
          analyticsContext={{
            pageType: 'compound_detail',
            entityType: 'compound',
            entitySlug: compound.slug,
          }}
        />
        <StructuredDetailIntro
          confidence={confidence}
          whatItIs={governedIntro.whatItIs}
          commonUse={governedIntro.commonUse}
          evidenceContext={governedIntro.evidenceContext}
          cautionNote={governedIntro.cautionNote}
          quickFacts={governedIntro.quickFacts}
          nextSteps={[
            { label: 'Check this compound in interactions', to: compoundCheckerHref },
            ...(foundInHerbLinks.length > 0
              ? [{ label: 'Review related herbs', to: '#related-herbs', variant: 'secondary' as const }]
              : []),
            { label: 'Continue to stack builder', to: '/build', variant: 'secondary' as const },
          ]}
          onStepClick={step => {
            if (step.to.startsWith('/interactions')) {
              trackDetailCheckerClick({
                detailType: 'compound',
                detailSlug: compound.slug,
                placement: 'quick_intro_next_steps',
              })
            }
            if (step.to === '/build') {
              trackDetailBuilderClick({
                detailType: 'compound',
                detailSlug: compound.slug,
                placement: 'quick_intro_next_steps',
              })
            }
          }}
          analyticsContext={{
            pageType: 'compound_detail',
            entityType: 'compound',
            entitySlug: compound.slug,
            profile: governedIntro.decision.mode,
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
              source: `compound:${compound.slug}`,
              placement: 'cta_experiment_slot',
              ctaMetadata: {
                pageType: 'compound_detail',
                entitySlug: compound.slug,
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
                  to={compoundCheckerHref}
                  className='btn-primary mt-2 inline-flex text-xs'
                  onClick={() =>
                    trackDetailCheckerClick({
                      detailType: 'compound',
                      detailSlug: compound.slug,
                      placement: 'cta_variant_tool',
                      ctaMetadata: {
                        pageType: 'compound_detail',
                        entitySlug: compound.slug,
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
                      detailType: 'compound',
                      detailSlug: compound.slug,
                      placement: 'cta_variant_builder',
                      ctaMetadata: {
                        pageType: 'compound_detail',
                        entitySlug: compound.slug,
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
                          pageType: 'compound_detail',
                          entityType: 'compound',
                          entitySlug: compound.slug,
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
                entityType='compound'
                entitySlug={compound.slug}
                products={curatedProducts}
                positionContext='compound_detail_cta_variant'
                pageType='compound_detail'
                variantId={ctaVariantId}
                ctaPosition='detail_affiliate_module'
                preDisclosureGuidance={governedCta.copy.affiliateLeadIn}
              />
            ),
          }}
        />

        <section id='governed-compare-links'>
          <GovernedQuickCompareBlock
            section={quickCompareSection}
            analyticsContext={{
              pageType: 'compound_detail',
              entityType: 'compound',
              entitySlug: compound.slug,
              evidenceLabel: governedResearch?.pageEvidenceJudgment?.evidenceLabel,
              safetySignalPresent: cautionCount > 0,
            }}
          />
          <EnrichmentRecommendationBlocks
            bundle={enrichmentRecommendations}
            names={recommendationNames}
            onRecommendationClick={(item, placement) =>
              trackDetailRelatedEntityClick({
                detailType: 'compound',
                detailSlug: compound.slug,
                targetType: item.targetType,
                targetSlug: item.targetSlug,
                placement,
              })
            }
          />
        </section>

        {/* Practical info */}
        {compound.dosage && <Section title='Dosage'>{compound.dosage}</Section>}
        {compound.duration && <Section title='Duration'>{compound.duration}</Section>}
        {/* Sources */}
        {(compound.sources.length > 0 || workbookSources.length > 0) && (
          <section className='border-white/8 mt-6 border-t pt-5'>
            <Collapse title='Sources'>
              <ol className='list-decimal space-y-1 pl-5 text-sm leading-relaxed text-white/85'>
                {compound.sources.map((source, index) => (
                  <li key={`${source.url}-${index}`}>
                    {/^https?:\/\//i.test(source.url) ? (
                      <a href={source.url} target='_blank' rel='noreferrer' className='link'>
                        {buildSourceLabel(source.url, source.title)}
                      </a>
                    ) : (
                      source.title
                    )}
                    {source.note && <span className='ml-2 text-white/55'>— {source.note}</span>}
                  </li>
                ))}
                {workbookSources.map(sourceUrl => (
                  <li key={`workbook-${sourceUrl}`}>
                    <a href={sourceUrl} target='_blank' rel='noreferrer' className='link'>
                      {buildSourceLabel(sourceUrl, '')}
                    </a>
                  </li>
                ))}
              </ol>
            </Collapse>
          </section>
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
