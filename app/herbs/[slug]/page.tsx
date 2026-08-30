import type { Metadata } from 'next'
import Link from 'next/link'
import { CircleCheck } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import type { Herb, RuntimeRecord } from '../../../types/content'
import { getHerbBySlug } from '../../../lib/runtime-data'
import { getHerbMetadataRecord } from '../../../lib/runtime-metadata-cache'
import { getUnifiedRuntimeRecords } from '../../../lib/runtime-record-index'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { normalizeSlug } from '@/lib/slug-utils'
import { getRuntimeVisibility } from '../../../lib/runtime-visibility'
import { getBatchedRuntimeRecords } from '@/lib/related-runtime'
import { getEntityConditionEntries, getRouteInternalLinkGroups, type RuntimeMapEntry } from '../../../lib/runtime-related-maps'
import { getEcosystemContinuityRecords } from '@/lib/ecosystem-continuity'
import { faqPageJsonLd, generateDetailMetadata, isMeaningfulFaqAnswer, shouldIndexRoute, SITE_URL } from '../../../lib/seo'
import { withRedirectSourceMetadata } from '@/lib/redirect-source-metadata'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import HerbSchemaGenerator from '../../../components/herb-profile/SchemaGenerator'
import HerbCompoundLinks from '@/components/seo/HerbCompoundLinks'
import ProfileTOC from '@/components/ui/ProfileTOC'
import { getInteractionEdges, getSlugEntityTypeMap } from '../../../lib/runtime-data'
import { InteractionWarnings } from '../../../components/InteractionWarnings'
import { getClusterSeeAlso, buildProfileSchemaGraphWithCluster } from '@/lib/cluster-linking'
import SeeAlsoCluster from '@/components/SeeAlsoCluster'
import { getGoalsForEntity } from '../../../lib/goal-hub-links'
import LastUpdatedBadge from '../../../components/editorial/LastUpdatedBadge'
import { getProfileFreshness } from '@/lib/freshness'
import ScrollEngagementPrompt from '../../../components/monetization/ScrollEngagementPrompt'
import { getValidComparisonSlug } from '@/lib/comparison-utils'
import { getSafetySensitivity, getSafetyLabels, getSafetyClassifications } from '@/lib/safety-classification'
import { getEvidenceLabel } from '@/lib/evidence'
import { getDosePresentation, hasStatedDose } from '@/lib/dose-presentation'
import {
  deriveEvidenceLimitations,
  deriveResearchFocusAreas,
} from '@/lib/research-intelligence'
import { SourcingCta } from '../../../components/sourcing/SourcingCta'
import AuthorCredentials from '@/components/AuthorCredentials'
import Disclaimer from '../../../components/Disclaimer'
import EvidenceScoreBadge from '@/components/ui/EvidenceScoreBadge'
import SafetyCautionLevel, { safetyFactorsForRecord } from '@/components/ui/SafetyCautionLevel'
import ProfileSafetyLine from '@/components/ui/ProfileSafetyLine'
import EvidenceBackingNote from '@/components/ui/EvidenceBackingNote'
import ProfileEvidenceLens from '@/components/ui/ProfileEvidenceLens'
import ProfileDecisionPanel from '@/components/editorial/ProfileDecisionPanel'
import { buildProfileDecision } from '@/lib/profile-decision'
import EvidenceGradeExplainer from '@/components/ui/EvidenceGradeExplainer'
import ShowMeTheStudies from '@/components/ui/ShowMeTheStudies'
import RelatedDiscoveryGroups from '@/components/ui/RelatedDiscoveryGroups'
import EvidenceGradeRationale from '@/components/education/EvidenceGradeRationale'
import TrialDesignInsight from '@/components/education/TrialDesignInsight'
import { extractCitationsFromRecord } from '@/lib/citations'
import RecommendationSection from '../../../components/RecommendationSection'
import StackRecommendationSection from '../../../components/StackRecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import { getStackRecommendations } from '../../../lib/recommendation-engine'
import { AshwagandhaStressClaim } from './AshwagandhaStressClaim'
import { isRestrictedRecord } from '../../../lib/restricted-ingredients'
import PathwayDiagram from '@/components/PathwayDiagram'
import { generatePathwayDiagram } from '@/lib/generate-pathway'
import { herbProfileExpansions } from '@/lib/curated-expansions'
import MonographHeroImage from '@/components/profile/MonographHeroImage'
import { getMonographImage, toAbsoluteImageUrl } from '@/lib/monograph-images'


type PageProps = {
  params: Promise<{ slug: string }>
}

import { getHerbSummaryIndex } from '../../../lib/runtime-summary-indexes'
import { DEPRECATED_HERB_CANONICALS } from '@/lib/deprecated-herb-canonicals'
import EmailCapture from '../../../components/EmailCapture'

const HERB_CANONICAL_SOURCE_ALIASES: Record<string, string> = {
  'lions-mane': 'hericium-erinaceus',
  passionflower: 'passiflora-incarnata',
  kava: 'piper-methysticum',
  'ashwagandha-withania-somnifera': 'ashwagandha',
}

const HERB_META_DESCRIPTION_OVERRIDES: Record<string, string> = {
  'ashwagandha-withania-somnifera':
    'Ashwagandha alias page for Withania somnifera with canonical safety, dosage, and evidence context pointing to the primary Ashwagandha profile.',
  'milk-thistle':
    'Milk thistle herb profile covering seed-focused use, liver-support context, antioxidant mechanisms, dosage, and safety considerations.',
  'silybum-marianum':
    'Silybum marianum herb profile covering silymarin antioxidant mechanisms, hepatocyte support context, dosage, and safety considerations.',
}

function withMetadataDescriptionOverride(metadata: Metadata, description?: string): Metadata {
  if (!description) return metadata

  return {
    ...metadata,
    description,
    ...(metadata.openGraph ? { openGraph: { ...metadata.openGraph, description } } : {}),
    ...(metadata.twitter ? { twitter: { ...metadata.twitter, description } } : {}),
  }
}

export async function generateStaticParams() {
  const herbs = await getHerbSummaryIndex()

  const dynamicParams = herbs
    .filter((herb: RuntimeRecord) => getRuntimeVisibility(herb).canRender)
    .filter((herb: RuntimeRecord) => !DEPRECATED_HERB_CANONICALS[normalizeSlug(herb.slug)])
    .map((herb: RuntimeRecord) => ({ slug: herb.slug }))

  const totalParams = [
    ...dynamicParams,
    ...Object.keys(HERB_CANONICAL_SOURCE_ALIASES).map((slug) => ({ slug })),
  ]

  return totalParams
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const normalizedSlug = normalizeSlug(slug)
  const canonicalSlug = DEPRECATED_HERB_CANONICALS[normalizedSlug] || normalizedSlug
  const sourceSlug = HERB_CANONICAL_SOURCE_ALIASES[canonicalSlug] || canonicalSlug
  const herb = await getHerbMetadataRecord(sourceSlug)

  if (!herb) {
    return {
      title: 'Herb Not Found',
      robots: { index: false, follow: true },
    }
  }

  // If the slug is a HERB_CANONICAL_SOURCE_ALIASES key, the canonical URL is the
  // data source slug (e.g. ashwagandha-withania-somnifera → ashwagandha).
  const aliasCanonicalSlug = HERB_CANONICAL_SOURCE_ALIASES[canonicalSlug] ? sourceSlug : null

  const descriptionOverride =
    HERB_META_DESCRIPTION_OVERRIDES[normalizedSlug] || HERB_META_DESCRIPTION_OVERRIDES[canonicalSlug]
  const metadata = withMetadataDescriptionOverride(
    generateDetailMetadata({ ...herb, slug: aliasCanonicalSlug ?? canonicalSlug }, 'herb'),
    descriptionOverride,
  )

  if (canonicalSlug !== normalizedSlug) {
    const indexDecision = shouldIndexRoute(`/herbs/${canonicalSlug}`, { ...herb, slug: canonicalSlug })
    // indexDecision is computed for the canonical target, not for the alias URL
    // being served, so a redirected alias could still say index. Correct that.
    return withRedirectSourceMetadata(
      {
        ...metadata,
        alternates: { canonical: `${SITE_URL}/herbs/${canonicalSlug}/` },
        robots: { index: indexDecision.index, follow: true },
      },
      `/herbs/${normalizedSlug}/`,
    )
  }

  if (aliasCanonicalSlug) {
    const indexDecision = shouldIndexRoute(`/herbs/${aliasCanonicalSlug}`, { ...herb, slug: aliasCanonicalSlug })
    // indexDecision is computed for the canonical target, not for the alias URL
    // being served, so a redirected alias could still say index. Correct that.
    return withRedirectSourceMetadata(
      {
        ...metadata,
        alternates: { canonical: `${SITE_URL}/herbs/${aliasCanonicalSlug}/` },
        robots: { index: indexDecision.index, follow: true },
      },
      `/herbs/${normalizedSlug}/`,
    )
  }

  // A built page at a redirected URL must not present itself as canonical.
  return withRedirectSourceMetadata(metadata, `/herbs/${normalizedSlug}/`)
}

function getEffects(herb: Herb) {
  return unique([
    ...list(herb.primary_effects),
    ...list(herb.effects),
    ...list(herb.primaryActions),
  ])
    .filter(isClean)
    .slice(0, 6)
}


const WEAK_PATTERN = /research[-\s]?pending|placeholder|unknown|not specified|not available|insufficient|needs review|minimal/i

function cleanItems(value: unknown, limit = 8) {
  const values = Array.isArray(value) ? value.flatMap(item => list(item)) : list(value)

  return unique(
    values
      .map(formatDisplayLabel)
      .filter(item => item && isClean(item) && !WEAK_PATTERN.test(item)),
  ).slice(0, limit)
}

function cleanText(value: unknown) {
  const formatted = text(value)
  if (!formatted || !isClean(formatted) || WEAK_PATTERN.test(formatted)) return ''
  return formatted
}

function firstSentences(value: string, limit = 2) {
  const sentences = value.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(sentence => sentence.trim()).filter(Boolean) || []
  return sentences.slice(0, limit).join(' ')
}

function getCommonName(herbName: string): string {
  if (!herbName) return ''
  return herbName.replace(/\s*\([^)]*\)\s*$/, '').trim()
}

function getHerbDisplayName(herb: Herb, fallbackSlug: string): string {
  return (
    formatDisplayLabel(herb.displayName) ||
    formatDisplayLabel(getCommonName(herb.name || '')) ||
    formatDisplayLabel(fallbackSlug) ||
    'Herb profile'
  )
}

function getPlainEnglishSummary(herb: Herb) {
  const summary = cleanSummary(herb.summary || herb.description || '', 'herb')
  return firstSentences(summary, 1) || `${formatDisplayLabel(herb.name || herb.slug)} profile with safety, use, and evidence context.`
}

function getEvidenceStrength(herb: Herb): string {
  return formatDisplayLabel(
    (herb.evidenceLevel as string) ||
      (herb.evidence_tier as string) ||
      (herb.evidenceTier as string) ||
      (herb.evidence_grade as string) ||
      getEvidenceLabel(herb as RuntimeRecord)
  )
}

function getSafetySummary(herb: Herb) {
  const labels = getSafetyLabels(herb, 3)
  const notes = cleanText(herb.safetyNotes || herb.safety_notes || herb.safety)
  const contraindications = cleanItems(herb.contraindications, 3)
  const interactions = cleanItems(herb.interactions, 3)

  if (notes) return firstSentences(notes, 2)
  if (contraindications.length) return `Review before use if any apply: ${contraindications.join(', ').replace(/[.!?]+$/, '')}.`
  if (interactions.length) return `Interaction watchouts include ${interactions.join(', ')}.`
  if (labels.length) return `Safety flags: ${labels.join(', ')}.`
  return 'Review personal medications, pregnancy status, chronic conditions, and clinician guidance before use.'
}


function getAvoidIf(herb: Herb) {
  return cleanItems([
    herb.avoid_if,
    herb.avoidIf,
    herb.who_should_skip,
    herb.whoShouldSkip,
    herb.contraindications,
    herb.interactions,
    herb.avoid,
  ], 5)
}

function getSafetyTone(summary: string, avoidIf: string[], sensitivity: string) {
  if (/low|standard|minimal/i.test(sensitivity)) return 'Standard caution'
  const highCaution = /avoid|contraindicat|pregnancy|breastfeeding|liver|kidney|bleed|sedative|interaction|medication/i
  if (avoidIf.length || highCaution.test(summary)) return 'Use extra caution'
  return 'Standard caution'
}

function getTopUses(herb: Herb) {
  const terms = unique([...getEffects(herb), ...getTraditionalUses(herb), ...deriveResearchFocusAreas({ profile: herb })])
  const selected: string[] = []

  for (const term of terms) {
    const key = term.toLowerCase().replace(/\b(resilience|support|health|function|quality)\b/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
    if (!key) continue
    const isDuplicate = selected.some((existing) => {
      const existingKey = existing.toLowerCase().replace(/\b(resilience|support|health|function|quality)\b/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
      return existingKey === key || existingKey.includes(key) || key.includes(existingKey)
    })
    if (!isDuplicate) selected.push(term)
    if (selected.length >= 8) break
  }

  return selected
}

function getSafetyDetailGroups(herb: Herb) {
  const safetyNotes = cleanText(herb.safetyNotes || herb.safety_notes || herb.safety)
  const interactions = cleanItems(herb.interactions, 10)

  // Prefer explicit pregnancy-specific fields; fall back to contraindications only for
  // items not already shown in the interactions list to avoid verbatim duplication.
  const pregnancySpecific = cleanItems(
    herb.pregnancy_cautions || herb.pregnancy_contraindications || herb.contraindications_pregnancy,
    10,
  )
  const interactionSet = new Set(interactions.map((s: string) => s.toLowerCase()))
  const contraindicationsRaw = cleanItems(herb.contraindications || herb.avoid, 10)
  const pregnancyItems = pregnancySpecific.length > 0
    ? pregnancySpecific
    : contraindicationsRaw.filter((s: string) => !interactionSet.has(s.toLowerCase()))

  const cautions = cleanItems(herb.cautions || herb.warnings || ((herb.safety as unknown) as { cautionSignals?: string[] })?.cautionSignals, 10)
  const classifications = getSafetyClassifications(herb, 8)
  const labels = getSafetyLabels(herb, 8)

  return [
    { title: 'Medication interactions', items: interactions },
    { title: 'Pregnancy, breastfeeding, and contraindications', items: pregnancyItems },
    { title: 'Chronic-condition and sensitivity cautions', items: cautions },
    { title: 'Safety classifications', items: classifications.map((item) => `${item.label}: ${item.description}`) },
    { title: 'Full safety note', items: safetyNotes ? [safetyNotes] : [] },
    { title: 'Safety labels', items: labels },
  ].filter(group => group.items.length > 0)
}

function getTimeline(herb: Herb) {
  return cleanText(herb.time_to_effect || herb.onset || herb.timeline || herb.minimum_effective_dose)
}

function getDosingSummary(herb: Herb) {
  return cleanText(herb.dosing || herb.dose || herb.dosage || herb.doseInfo || herb.minimum_effective_dose)
}

function getMechanisms(herb: Herb) {
  return cleanItems([herb.mechanisms, herb.primary_mechanisms, herb.pathways], 16)
}

function getTraditionalUses(herb: Herb) {
  return cleanItems(herb.traditionalUses || herb.traditional_uses, 10)
}

function getRelatedLinks(records: RuntimeRecord[], entityType: 'herb' | 'compound', limit = 4) {
  return records
    .filter(record => record?.slug)
    .map(record => ({
      label: formatDisplayLabel(record.name || record.title || record.slug),
      href: `/${entityType === 'herb' ? 'herbs' : 'compounds'}/${record.slug}`,
    }))
    .filter(item => item.label)
    .slice(0, limit)
}

function shouldSuppressAffiliate(record: Herb): boolean {
  if (!record) return false
  if (isRestrictedRecord(record)) return true
  const safetyText = String(record.safety || record.safetyNotes || record.safety_level || record.safety_rating || '').toLowerCase()
  return safetyText.includes('high caution') || safetyText.includes('needs-review') || safetyText.includes('needs review') || safetyText.includes('severe')
}

export default async function HerbDetailPage({ params }: PageProps) {
  const { slug } = await params
  const normalizedSlug = normalizeSlug(slug)
  const canonicalSlug = DEPRECATED_HERB_CANONICALS[normalizedSlug]
  if (canonicalSlug) {
    redirect(`/herbs/${canonicalSlug}/`)
  }

  const sourceSlug = HERB_CANONICAL_SOURCE_ALIASES[normalizedSlug] || normalizedSlug
  const herbRaw = await getHerbBySlug(sourceSlug)

  const [interactionEdgesMap, slugTypeMap] = await Promise.all([
    getInteractionEdges(),
    getSlugEntityTypeMap(),
  ])
  const interactionEdges = interactionEdgesMap[sourceSlug] ?? []

  if (!herbRaw || !getRuntimeVisibility(herbRaw).canRender) {
    notFound()
  }

  const herbRecord = herbRaw
  const herb = herbRecord as Herb
  const freshness = getProfileFreshness(sourceSlug)

  if (slug !== normalizedSlug) {
    redirect(`/herbs/${normalizedSlug}/`)
  }

  const suppressAffiliate = shouldSuppressAffiliate(herb)

  const {
    herbs,
    compounds,
    allRecords,
  } = await getUnifiedRuntimeRecords()

  const herbSlugs = new Set(herbs.map((item: RuntimeRecord) => item.slug))
  const compoundSlugs = new Set(compounds.map((item: RuntimeRecord) => item.slug))
  const sourceRecordSlug = herb.slug

  const [
    relatedBySlug,
    comparisonBySlug,
    _stackBySlug,
    ecosystemContinuityRecords,
    conditionLinks,
    internalLinkGroups,
  ] = await Promise.all([
    getBatchedRuntimeRecords('related', [herbRecord], allRecords, 8),
    getBatchedRuntimeRecords('comparison', [herbRecord], allRecords, 8),
    getBatchedRuntimeRecords('stack', [herbRecord], allRecords, 6),
    getEcosystemContinuityRecords(herbRecord, allRecords, 6),
    getEntityConditionEntries(sourceRecordSlug),
    getRouteInternalLinkGroups(`/herbs/${normalizedSlug}`),
  ])

  const relatedCandidates = (relatedBySlug[sourceRecordSlug] || [])
    .filter((item: RuntimeRecord) => getRuntimeVisibility(item).canRender)

  const relatedHerbs = relatedCandidates
    .filter((item: RuntimeRecord) => herbSlugs.has(item.slug))
    .slice(0, 4)
    .map((item: RuntimeRecord) => ({ ...item, entityType: 'herb' as const }))

  const _relatedCompounds = relatedCandidates
    .filter((item: RuntimeRecord) => compoundSlugs.has(item.slug))
    .slice(0, 4)
    .map((item: RuntimeRecord) => ({ ...item, entityType: 'compound' as const }))

  const _visibleEcosystemContinuityRecords = ecosystemContinuityRecords
    .filter((item: RuntimeRecord) => getRuntimeVisibility(item).canRender)


  const comparisonRecords = (comparisonBySlug[sourceRecordSlug] || [])
    .filter((item: RuntimeRecord) => getRuntimeVisibility(item).canRender)
    .slice(0, 8)

  const summary = cleanSummary(herb.summary || herb.description || '', 'herb')
  const displayName = getHerbDisplayName(herb, normalizedSlug)
  const botanicalName = cleanText(herb.latin_name || herb.botanical_name || herb.scientific_name)
  const briefSummary = getPlainEnglishSummary(herb)
  const evidenceStrength = getEvidenceStrength(herb)
  const safetySummary = getSafetySummary(herb)
  const safetySensitivity = getSafetySensitivity(herb)
  const safetyGroups = getSafetyDetailGroups(herb)
  const avoidIf = getAvoidIf(herb)
  const timeline = getTimeline(herb)
  const dosingSummary = getDosingSummary(herb)
  // The workbook's dose column doubles as a product-form column, so a raw value
  // may be a regimen, a package description, or an explicit refusal to state
  // one. Present each honestly rather than labelling all three "Dose guidance".
  const dosePresentation = getDosePresentation(dosingSummary)
  const mechanisms = getMechanisms(herb)
  const evidenceLimitations = deriveEvidenceLimitations({ profile: herb })
  const topUses = getTopUses(herb)
  const profileDecision = buildProfileDecision(herbRecord as Record<string, unknown>, 'herb')
  const safetyTone = getSafetyTone(safetySummary, avoidIf, safetySensitivity)
  const safetyFactors = safetyFactorsForRecord(herb as unknown as Record<string, unknown>)
  const relatedHerbLinks = getRelatedLinks(relatedHerbs, 'herb')
  const revenueProducts = getRevenueProductSet(normalizedSlug)
  const stackRecommendations = getStackRecommendations(normalizedSlug, 3)
  const citations = extractCitationsFromRecord(herb)
  const pathwayDiagram = generatePathwayDiagram({ ...herb, name: displayName })
  const expansion = herbProfileExpansions[normalizedSlug]
  const heroImage = getMonographImage('herb', normalizedSlug, herb as Record<string, unknown>)
  const absoluteHeroImage = toAbsoluteImageUrl(heroImage.src, SITE_URL)

  const goalLinks = getGoalsForEntity(normalizedSlug)


  const comparisonLinks = comparisonRecords
    .filter((record: RuntimeRecord) => record?.slug)
    .map((record: RuntimeRecord) => {
      const compSlug = getValidComparisonSlug(sourceRecordSlug, record.slug)
      if (!compSlug) return null
      return {
        label: formatDisplayLabel(record.name || record.title || record.slug),
        href: `/guides/compare/${compSlug}`,
      }
    })
    .filter((item): item is { label: string; href: string } => item !== null)
    .slice(0, 4)

  const breadcrumbId = `${SITE_URL}/herbs/${normalizedSlug}/#breadcrumb`
  const clusterSeeAlso = getClusterSeeAlso(normalizedSlug, 'herb', 8)
  const schemaGraph = buildProfileSchemaGraphWithCluster({
    kind: 'herb',
    slug: normalizedSlug,
    herb: {
      name: displayName,
      slug: normalizedSlug,
      description: summary,
      latinName: botanicalName || undefined,
      evidenceGrade: getEvidenceStrength(herb),
      safetyNotes: (herb.safetyNotes || herb.safety_notes || herb.safety || undefined) ?? undefined,
      primaryEffects: getEffects(herb),
      breadcrumbId,
    },
    breadcrumbs: [
      { name: 'Herbs', url: `${SITE_URL}/herbs/` },
      { name: displayName, url: `${SITE_URL}/herbs/${normalizedSlug}/` },
    ],
    workbookRecord: { ...herb, slug: normalizedSlug } as Record<string, unknown>,
    seeAlsoEntries: clusterSeeAlso,
    reviewedAt: freshness.lastReviewed,
    modifiedAt: freshness.lastReviewed,
    citationCount: freshness.citationCount,
  })

  const faqCandidates = [
    {
      question: `What is ${displayName} used for?`,
      answer: cleanText(herb.clinicalUse || herb.clinical_use || summary) || briefSummary,
    },
    {
      question: `Is ${displayName} safe?`,
      answer:
        cleanText(
          herb.safetyProfile ||
            herb.safety_profile ||
            herb.safetyNotes ||
            herb.safety_notes ||
            herb.safety,
        ) || safetySummary,
    },
    // Only claim to answer the dose question when the field actually states an
    // amount; a product form or a placeholder would otherwise be published as
    // an FAQ answer and reused verbatim by AI answer engines.
    ...(hasStatedDose(dosingSummary)
      ? [{ question: `What is the dose of ${displayName}?`, answer: dosingSummary }]
      : []),
  ].filter((entry) => isMeaningfulFaqAnswer(entry.answer))

  // Suppress FAQPage schema when fewer than 2 substantive Q&As exist;
  // Google requires ≥2 for rich results and a 1-Q block can't earn them.
  const faqSchema = faqCandidates.length >= 2
    ? faqPageJsonLd({ pagePath: `/herbs/${normalizedSlug}/`, questions: faqCandidates })
    : null

  const tocItems = [
    { id: 'overview', label: 'Overview' },
    ...(expansion ? [{ id: 'editorial-review', label: 'Editorial review' }] : []),
    { id: 'safety', label: 'Safety' },
    ...(interactionEdges.length > 0 ? [{ id: 'interactions', label: 'Interactions' }] : []),
    { id: 'evidence', label: 'Evidence' },
    ...(dosingSummary || timeline ? [{ id: 'dosing', label: 'Dosing & timing' }] : []),
    ...(pathwayDiagram ? [{ id: 'pathway', label: 'Pathway' }] : []),
    ...(mechanisms.length > 0 ? [{ id: 'mechanisms', label: 'Mechanisms' }] : []),
    { id: 'compounds', label: 'Compounds' },
    ...(goalLinks.length > 0 ? [{ id: 'goals', label: 'Goal guides' }] : []),
    ...(conditionLinks.length > 0 ? [{ id: 'conditions', label: 'Condition guides' }] : []),
    { id: 'related', label: 'Related paths' },
    { id: 'compare', label: 'Compare & sourcing' },
  ]


  return (
    <div className="mx-auto max-w-4xl lg:max-w-6xl space-y-4 px-4 pb-12 pt-5 sm:space-y-5">
      <ScrollEngagementPrompt storageKey={`herb-prompt-${normalizedSlug}`} />
      <SchemaGraphScript graph={schemaGraph} />
      <HerbSchemaGenerator
        name={displayName}
        slug={normalizedSlug}
        description={briefSummary}
        url={`${SITE_URL}/herbs/${normalizedSlug}/`}
        image={absoluteHeroImage}
        dateReviewed={freshness.lastReviewed}
        evidenceGrade={evidenceStrength || undefined}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}

      <div className="flex gap-8 items-start">
        <div className="flex-1 min-w-0 space-y-4 sm:space-y-5">
      {/* Title Header — includes the quick-stat strip so the essentials fit in one screen */}
      <div id="overview" className="hs-masthead hero-shell scroll-mt-24 rounded-[1.25rem] border border-brand-900/10 p-5 shadow-sm sm:p-6">
        <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="hs-label">Herb Profile</p>
              <h1 className="font-semibold tracking-tight text-ink">
                {displayName}
              </h1>
              {botanicalName ? <p className="text-sm italic text-muted">{botanicalName}</p> : null}
            </div>
            <p className="text-[0.95rem] leading-7 text-muted">{briefSummary}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <LastUpdatedBadge date={freshness.lastReviewed} citationCount={freshness.citationCount} />
              <EvidenceScoreBadge record={herbRecord} />
            </div>

            {/* Safety Summary — one line; full detail lives in the Safety section below.
                Shared with compound profiles so both routes lead with the same
                safety hierarchy. */}
            <ProfileSafetyLine tone={safetyTone} summary={safetySummary} />

            {/* Quick stats — hairline definition rows rather than a grid of small
                bordered cards, so the essentials stay scannable on a phone. */}
            <dl className="hs-defs">
              <div>
                <dt>Evidence</dt>
                <dd>
                  {evidenceStrength || 'Mixed or uncertain'}
                  {/* Where the recorded studies do not demonstrate the grade, say
                      so here rather than only inside the collapsed study-design
                      block, which most of these records do not render at all. */}
                  <EvidenceBackingNote
                    backed={herb.evidence_grade_backed as boolean | null | undefined}
                    gap={herb.evidence_grade_backing_gap as string | null | undefined}
                  />
                </dd>
              </div>
              <div>
                <dt>Typical onset</dt>
                <dd>{timeline || 'Varies by prep'}</dd>
              </div>
              <div>
                <dt>Safety rating</dt>
                <dd>{formatDisplayLabel(safetySensitivity)} caution</dd>
              </div>
              {topUses.length > 0 && (
                <div>
                  <dt>Best for</dt>
                  <dd className="flex items-baseline gap-1.5">
                    <CircleCheck aria-hidden="true" className="h-4 w-4 shrink-0 translate-y-0.5 text-emerald-700 dark:text-emerald-200" strokeWidth={1.75} />
                    <span>{topUses.slice(0, 4).join(', ')}</span>
                  </dd>
                </div>
              )}
              {avoidIf.length > 0 && (
                <div className="hs-defs--caution">
                  <dt>Avoid / review if</dt>
                  <dd>{avoidIf.slice(0, 3).join(', ')}</dd>
                </div>
              )}
            </dl>
          </div>

          <MonographHeroImage image={heroImage} label={displayName} eyebrow="Monograph visual" />
        </header>
      </div>

      {/* Decision surface — verdict (when curated) + intent-based routing.
          Rendered by the shared ProfileDecisionPanel so all profiles benefit. */}
      <ProfileDecisionPanel decision={profileDecision} name={displayName} />

      <ProfileTOC items={tocItems} variant="mobile" />

      {normalizedSlug === 'ashwagandha' && (
        <details className="hs-disclosure">
          <summary>
            <span>Evidence deep dive: the stress claim</span>
            <span aria-hidden="true" className="hs-disclosure__marker">▼</span>
          </summary>
          <div>
            <AshwagandhaStressClaim />
          </div>
        </details>
      )}

      {expansion ? (
        <details id="editorial-review" className="hs-disclosure scroll-mt-24">
          <summary>
            <span>Expanded editorial review</span>
            <span aria-hidden="true" className="hs-disclosure__marker">▼</span>
          </summary>
            <div className="space-y-5">
          <div className="space-y-1.5">
            <h3 className="font-semibold text-ink">What this profile is built to answer</h3>
            <p className="text-sm leading-6 text-muted">{expansion.intent}</p>
          </div>
          <ul className="hs-linklist hs-linklist--split list-none">
            {expansion.methodology.map((item) => (
              <li key={item} className="border-b border-[color:var(--hs-hairline)] py-2 text-xs leading-5 text-muted">{item}</li>
            ))}
          </ul>
          <div className="overflow-x-auto rounded-[var(--profile-radius)] border border-[color:var(--hs-hairline)]">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="text-xs font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Use case</th>
                  <th className="px-4 py-3">Evidence</th>
                  <th className="px-4 py-3">Best fit</th>
                  <th className="px-4 py-3">Typical range</th>
                  <th className="px-4 py-3">Safety context</th>
                </tr>
              </thead>
              <tbody>
                {expansion.evidenceRows.map((row) => (
                  <tr key={row.name}>
                    <td className="px-4 py-3 font-semibold text-ink">{row.name}</td>
                    <td className="px-4 py-3 text-muted">{row.tier}</td>
                    <td className="px-4 py-3 text-muted">{row.bestFor}</td>
                    <td className="px-4 py-3 text-muted">{row.dose}</td>
                    <td className="px-4 py-3 text-muted">{row.safety}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="font-semibold text-ink">Product and form choices</h3>
              <dl className="hs-defs mt-2">
                {expansion.comparisonRows.map((row) => (
                  <div key={row.scenario}>
                    <dt>{row.scenario}</dt>
                    <dd>
                      {row.firstChoice}
                      <span className="hs-defs__note">{row.why}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="hs-panel hs-panel--caution">
              <h3 className="font-semibold text-ink">Safety checks</h3>
              <ul className="list-disc space-y-1.5 pl-5 text-xs leading-5 text-muted">
                {expansion.safetyNotes.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="font-semibold text-ink">How to choose a product</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-5 text-muted">
                {expansion.buyerChecklist.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink">References</h3>
              <ul className="hs-linklist mt-2">
                {expansion.references.map((ref) => (
                  <li key={ref.href}>
                    <a href={ref.href} target="_blank" rel="noopener noreferrer">
                      <span>{ref.label}</span>
                      <span aria-hidden="true" className="hs-linklist__arrow">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
            </div>
        </details>
      ) : null}

      {/* Section 2: Safety — the one section that keeps a hard frame at every
          width, because enclosure is meaningful here. */}
      <section id="safety" className="hs-panel hs-panel--caution scroll-mt-24">
        <div className="space-y-2">
          <p className="hs-label">Safety</p>
          <h2 className="font-semibold text-ink">Safety &amp; Cautions</h2>
          <p className="text-sm leading-6 text-muted">{safetySummary}</p>
        </div>

        <SafetyCautionLevel level={safetySensitivity} factors={safetyFactors} />

        {safetyGroups.length > 0 && (
          <details className="hs-disclosure">
            <summary>
              <span>Detailed safety fields</span>
              <span aria-hidden="true" className="hs-disclosure__marker">▼</span>
            </summary>
            <div className="grid gap-4 sm:grid-cols-2">
              {safetyGroups.map(group => (
                <div key={group.title} className="space-y-1">
                  <h3 className="hs-label">{group.title}</h3>
                  <ul className="list-disc space-y-1 pl-4 text-xs leading-5 text-muted">
                    {group.items.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        )}
      </section>

      {interactionEdges.length > 0 && (
        <div id="interactions" className="scroll-mt-24">
          <InteractionWarnings edges={interactionEdges} slugTypeMap={slugTypeMap} />
        </div>
      )}

      {/* Section 3: Evidence Summary — the visual hero of the profile. */}
      <section id="evidence" className="card-premium hs-keep-frame scroll-mt-24 p-4 sm:p-5 space-y-3.5">
        <div className="space-y-1">
          <p className="hs-label">Evidence</p>
          <h2 className="font-semibold text-ink">Evidence Summary</h2>
        </div>
        <ProfileEvidenceLens
          record={herbRecord}
          evidenceLevel={evidenceStrength}
          safetySummary={safetySummary}
          citationsCount={freshness.citationCount}
          limitations={evidenceLimitations}
        />

        {(herb.evidence_design_match && herb.evidence_risk_of_bias) || herb.trial_design_insight ? (
          <details className="hs-disclosure">
            <summary>
              <span>Study design details</span>
              <span aria-hidden="true" className="hs-disclosure__marker">▼</span>
            </summary>
            <div className="space-y-4">
        {/* `grade` is passed raw and normalized inside the component. There is
            deliberately no `|| 'C'` fallback: defaulting asserted a
            Limited-Evidence grade the record never carried. */}
        {herb.evidence_design_match && herb.evidence_risk_of_bias && (
          <EvidenceGradeRationale
            grade={(herb.evidence_grade as string) || ''}
            designMatch={herb.evidence_design_match as string}
            riskOfBias={herb.evidence_risk_of_bias as string}
            /* Consistency is only derivable where enough studies are on record.
               Saying so beats hiding the whole card: 163 profiles can show
               design and bias against the 27 that can also show agreement. */
            consistency={(herb.evidence_consistency as string) || 'Not assessed'}
          >
            {(herb.evidence_rationale || herb.evidence_summary || herb.summary || '') as string}
          </EvidenceGradeRationale>
        )}

        {herb.trial_design_insight && (
          <TrialDesignInsight
            designType={(herb.trial_design_insight as string).includes('RCT') ? 'RCT' : 'Human Trial'}
            title={`${displayName} Study Design Insight`}
          >
            {herb.trial_design_insight as string}
          </TrialDesignInsight>
        )}
            </div>
          </details>
        ) : null}

        <EvidenceGradeExplainer />
        <ShowMeTheStudies citations={citations} />
      </section>

      {(dosingSummary || timeline) ? (
        <section id="dosing" className="card-premium scroll-mt-24 p-4 sm:p-5">
          <h2 className="font-semibold text-ink">Dosing &amp; Timing</h2>
          <dl className="hs-defs mt-3">
            {dosePresentation.dose ? (
              <div>
                <dt>Dose guidance</dt>
                <dd>{dosePresentation.dose}</dd>
              </div>
            ) : null}
            {dosePresentation.form ? (
              <div>
                <dt>Common form</dt>
                <dd>{dosePresentation.form}</dd>
              </div>
            ) : null}
            {dosePresentation.note ? (
              <div>
                <dt>No standardized dose</dt>
                <dd className="text-[color:var(--hs-body)]">{dosePresentation.note}</dd>
              </div>
            ) : null}
            {timeline ? (
              <div>
                <dt>Timing / onset</dt>
                <dd>{timeline}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {/* Section 3b: Mechanism Pathway Diagram */}
      {pathwayDiagram && (
        <details id="pathway" className="hs-disclosure scroll-mt-24">
          <summary>
            <span>How {displayName} works</span>
            <span aria-hidden="true" className="hs-disclosure__marker">▼</span>
          </summary>
          <div className="space-y-3">
            <p className="text-xs text-muted leading-5">
              Simplified mechanism pathway based on preclinical and pharmacological evidence. Does not confirm clinical efficacy.
            </p>
            <PathwayDiagram data={pathwayDiagram} />
          </div>
        </details>
      )}

      {/* Section 4: Mechanisms (Collapsible) */}
      {mechanisms.length > 0 && (
        <details id="mechanisms" className="hs-disclosure scroll-mt-24">
          <summary>
            <span>Mechanisms &amp; biological pathways</span>
            <span aria-hidden="true" className="hs-disclosure__marker">▼</span>
          </summary>
          <div className="space-y-3">
            <p className="text-xs leading-5 text-muted">
              <span className="font-semibold text-ink">Preclinical pathways.</span>{' '}
              Proposed mechanisms from in vitro and animal research; these do not confirm clinical outcomes in humans.
            </p>
            <ul className="hs-chips">
              {mechanisms.map(m => (
                <li key={m}><span className="hs-chip">{m}</span></li>
              ))}
            </ul>
          </div>
        </details>
      )}

      {/* Active compounds — internal links from the curated relationship map */}
      <div id="compounds" className="scroll-mt-24"><HerbCompoundLinks herbSlug={herb.slug} herbName={displayName} /></div>

      {goalLinks.length > 0 || conditionLinks.length > 0 ? (
        <section id="goals" className="card-premium scroll-mt-24 p-4 sm:p-5">
          <h2 className="font-semibold text-ink">Guides that use {displayName}</h2>
          {goalLinks.length > 0 ? (
            <div className="mt-3">
              <p className="hs-label">Goal guides</p>
              <ul className="hs-chips mt-2">
                {goalLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hs-chip capitalize">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {conditionLinks.length > 0 ? (
            <div id="conditions" className="mt-4 scroll-mt-24">
              <p className="hs-label">Condition guides</p>
              <ul className="hs-chips mt-2">
                {conditionLinks.slice(0, 5).map((link: RuntimeMapEntry) => (
                  <li key={link.slug}>
                    <Link href={link.href || '/guides/'} className="hs-chip">
                      {link.label || formatDisplayLabel(link.slug)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      <section id="related" className="scroll-mt-24 space-y-4">
        <SeeAlsoCluster slug={normalizedSlug} kind="herb" limit={6} />

        <RelatedDiscoveryGroups
          title="Related research paths"
          groups={internalLinkGroups}
        />
      </section>

      {/* Section 5: Compare Nearby + CTA */}
      <section id="compare" className="card-premium p-4 sm:p-5 space-y-4">
        <div className="space-y-1">
          <h2 className="font-semibold text-ink">Compare &amp; Sourcing</h2>
          <p className="hs-sec__intro">Compare side-by-side tradeoffs or verify active marker guidelines.</p>
        </div>
        {!suppressAffiliate && <SourcingCta record={herb} displayName={displayName} />}

        {suppressAffiliate ? (
          <div className="hs-panel border-l-[3px] border-l-[color:var(--accent-danger)]">
            <h3 className="font-semibold text-ink">Sourcing options disabled for safety</h3>
            <p className="text-sm leading-6 text-muted">
              Direct product recommendations and affiliate links are suppressed for this herb due to its high caution or needs-review safety classification.
            </p>
            <p className="text-xs leading-5 text-muted">
              Evaluate the safety checks, contraindications, and potential medication interactions above under clinician supervision before use.
            </p>
          </div>
        ) : revenueProducts ? (
          <div className="space-y-4">
            <RecommendationSection
              title={revenueProducts.title}
              description={`Affiliate recommendations for ${displayName}. Review safety, dose, and product quality before buying.`}
              products={revenueProducts.products}
            />
            <details className="hs-disclosure">
              <summary>
                <span>Product form &amp; quality guidelines</span>
                <span aria-hidden="true" className="hs-disclosure__marker">▼</span>
              </summary>
              <div>
                <p className="text-xs leading-relaxed text-muted">
                  When sourcing {displayName}, verify the label for:
                </p>
                <ul className="mt-2 list-disc pl-5 text-xs text-muted space-y-1">
                  <li><strong>Standardized extract:</strong> Confirm active content percentages on the supplement facts panel (e.g. standardized to specific marker compounds) rather than simple raw herb weights.</li>
                  <li><strong>Third-party testing:</strong> Look for independent purity labels (USP, NSF, ConsumerLab, or Eurofins) to ensure the product is free from heavy metals, solvents, and contaminants.</li>
                  <li><strong>Form bioavailability:</strong> Ensure the form matches evidence-supported configurations (e.g. standardized active extracts like bacosides, withanolides, or curcuminoids) for optimal onset and digestion tolerance.</li>
                </ul>
              </div>
            </details>
          </div>
        ) : null}

        <StackRecommendationSection
          productName={displayName}
          recommendations={stackRecommendations}
        />

        {relatedHerbLinks.length > 0 || comparisonLinks.length > 0 ? (
          <div>
            <p className="hs-label">Continue comparing</p>
            <ul className="hs-linklist hs-linklist--split mt-2">
              {relatedHerbLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span>{link.label}</span>
                    <span aria-hidden="true" className="hs-linklist__arrow">→</span>
                  </Link>
                </li>
              ))}
              {comparisonLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span>Compare {link.label}</span>
                    <span aria-hidden="true" className="hs-linklist__arrow">↔</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {/* The component already carries the amber caution treatment; overriding
          its colours per route is what produced several near-identical warm
          surfaces on one page. */}
      <Disclaimer className="mt-4" />
      <AuthorCredentials />

      <EmailCapture
        headline={`Get the ${displayName} research notes`}
        description="Evidence summaries, dosing context, and safety updates for this herb — straight to your inbox."
        ctaLabel="Send me the evidence"
        location={`herb-${normalizedSlug}`}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--hs-hairline)] pt-4">
        <Link href="/herbs/" className="button-secondary inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-semibold">
          ← Back to herbs library
        </Link>
        <Link href="/safety-checker/" className="inline-flex min-h-11 items-center text-sm font-semibold text-[color:var(--tone-ink)] underline-offset-4 hover:underline">
          Safety checker →
        </Link>
      </div>
        </div>
        <ProfileTOC items={tocItems} variant="desktop" />
      </div>
    </div>
  )
}
