import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Herb, RuntimeRecord } from '../../../src/types/content'
import { getHerbBySlug } from '../../../src/lib/runtime-data'
import { getHerbMetadataRecord } from '../../../src/lib/runtime-metadata-cache'
import { getUnifiedRuntimeRecords } from '../../../src/lib/runtime-record-index'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { normalizeSlug } from '@/lib/slug-utils'
import { getRuntimeVisibility } from '../../../lib/runtime-visibility'
import { getBatchedRuntimeRecords } from '@/lib/related-runtime'
import { getEntityConditionEntries, getRouteInternalLinkGroups, type RuntimeMapEntry } from '../../../src/lib/runtime-related-maps'
import { getEcosystemContinuityRecords } from '@/lib/ecosystem-continuity'
import { faqPageJsonLd, generateDetailMetadata, isMeaningfulFaqAnswer, shouldIndexRoute, SITE_URL } from '../../../src/lib/seo'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import HerbSchemaGenerator from '../../../src/components/herb-profile/SchemaGenerator'
import HerbCompoundLinks from '@/components/seo/HerbCompoundLinks'
import ProfileTOC from '@/components/ui/ProfileTOC'
import { getClusterSeeAlso, buildProfileSchemaGraphWithCluster } from '@/lib/cluster-linking'
import SeeAlsoCluster from '@/components/SeeAlsoCluster'
import { getGoalsForEntity } from '../../../src/lib/goal-hub-links'
import LastUpdatedBadge from '../../../src/components/editorial/LastUpdatedBadge'
import { getProfileFreshness } from '@/lib/freshness'
import ScrollEngagementPrompt from '../../../src/components/monetization/ScrollEngagementPrompt'
import { getValidComparisonSlug } from '@/lib/comparison-utils'
import { getSafetySensitivity, getSafetyLabels, getSafetyClassifications } from '@/lib/safety-classification'
import { getEvidenceLabel } from '@/lib/evidence'
import {
  deriveEvidenceLimitations,
  deriveResearchFocusAreas,
} from '@/lib/research-intelligence'
import { SourcingCta } from '../../../src/components/sourcing/SourcingCta'
import AuthorCredentials from '@/components/AuthorCredentials'
import Disclaimer from '../../../src/components/Disclaimer'
import EvidenceScoreBadge from '@/components/ui/EvidenceScoreBadge'
import ProfileEvidenceLens from '@/components/ui/ProfileEvidenceLens'
import EvidenceGradeExplainer from '@/components/ui/EvidenceGradeExplainer'
import ShowMeTheStudies from '@/components/ui/ShowMeTheStudies'
import RelatedDiscoveryGroups from '@/components/ui/RelatedDiscoveryGroups'
import EvidenceGradeRationale from '@/components/education/EvidenceGradeRationale'
import TrialDesignInsight from '@/components/education/TrialDesignInsight'
import { extractCitationsFromRecord } from '@/lib/citations'
import RecommendationSection from '../../../components/RecommendationSection'
import StackRecommendationSection from '../../../components/StackRecommendationSection'
import RecommendedProduct from '@/components/RecommendedProduct'
import { getRevenueProductSet } from '@/config/revenue-products'
import { getStackRecommendations } from '../../../src/lib/recommendation-engine'
import { AshwagandhaStressClaim } from './AshwagandhaStressClaim'
import { isRestrictedRecord } from '../../../src/lib/restricted-ingredients'
import PathwayDiagram from '@/components/PathwayDiagram'
import { generatePathwayDiagram } from '@/lib/generate-pathway'
import { herbProfileExpansions } from '@/lib/curated-expansions'


type PageProps = {
  params: Promise<{ slug: string }>
}

import { getHerbSummaryIndex } from '../../../src/lib/runtime-summary-indexes'
import { DEPRECATED_HERB_CANONICALS } from '@/lib/deprecated-herb-canonicals'

const HERB_CANONICAL_SOURCE_ALIASES: Record<string, string> = {
  'lions-mane': 'hericium-erinaceus',
  passionflower: 'passiflora-incarnata',
  kava: 'piper-methysticum',
  'ashwagandha-withania-somnifera': 'ashwagandha',
}

export async function generateStaticParams() {
  const herbs = await getHerbSummaryIndex()

  const dynamicParams = herbs
    .filter((herb: RuntimeRecord) => getRuntimeVisibility(herb).canRender)
    .filter((herb: RuntimeRecord) => !DEPRECATED_HERB_CANONICALS[normalizeSlug(herb.slug)])
    .map((herb: RuntimeRecord) => ({ slug: herb.slug }))

  const legacyRedirectParams = Object.keys(DEPRECATED_HERB_CANONICALS).map((slug) => ({ slug }))

  const totalParams = [
    ...dynamicParams,
    ...legacyRedirectParams,
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
    }
  }

  // If the slug is a HERB_CANONICAL_SOURCE_ALIASES key, the canonical URL is the
  // data source slug (e.g. ashwagandha-withania-somnifera → ashwagandha).
  const aliasCanonicalSlug = HERB_CANONICAL_SOURCE_ALIASES[canonicalSlug] ? sourceSlug : null

  const metadata = generateDetailMetadata({ ...herb, slug: aliasCanonicalSlug ?? canonicalSlug }, 'herb')

  if (canonicalSlug !== normalizedSlug) {
    const indexDecision = shouldIndexRoute(`/herbs/${canonicalSlug}`, { ...herb, slug: canonicalSlug })
    return {
      ...metadata,
      alternates: { canonical: `${SITE_URL}/herbs/${canonicalSlug}/` },
      robots: { index: indexDecision.index, follow: true },
    }
  }

  if (aliasCanonicalSlug) {
    const indexDecision = shouldIndexRoute(`/herbs/${aliasCanonicalSlug}`, { ...herb, slug: aliasCanonicalSlug })
    return {
      ...metadata,
      alternates: { canonical: `${SITE_URL}/herbs/${aliasCanonicalSlug}/` },
      robots: { index: indexDecision.index, follow: true },
    }
  }

  return metadata
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
  if (contraindications.length) return `Review before use if any apply: ${contraindications.join(', ')}.`
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
  const mechanisms = getMechanisms(herb)
  const evidenceLimitations = deriveEvidenceLimitations({ profile: herb })
  const topUses = getTopUses(herb)
  const safetyTone = getSafetyTone(safetySummary, avoidIf, safetySensitivity)
  const relatedHerbLinks = getRelatedLinks(relatedHerbs, 'herb')
  const revenueProducts = getRevenueProductSet(normalizedSlug)
  const stackRecommendations = getStackRecommendations(normalizedSlug, 3)
  const citations = extractCitationsFromRecord(herb)
  const pathwayDiagram = generatePathwayDiagram({ ...herb, name: displayName })
  const expansion = herbProfileExpansions[normalizedSlug]

  const goalLinks = getGoalsForEntity(normalizedSlug)

  const comparisonLinks = comparisonRecords
    .filter((record: RuntimeRecord) => record?.slug)
    .map((record: RuntimeRecord) => {
      const compSlug = getValidComparisonSlug(sourceRecordSlug, record.slug)
      if (!compSlug) return null
      return {
        label: formatDisplayLabel(record.name || record.title || record.slug),
        href: `/compare/${compSlug}`,
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
    {
      question: `What is the dose of ${displayName}?`,
      answer:
        cleanText(herb.dosing || herb.dose || herb.dosage || herb.doseInfo || '') ||
        'See dosing guidelines and product labeling.',
    },
  ].filter((entry) => isMeaningfulFaqAnswer(entry.answer))

  // Suppress FAQPage schema when fewer than 2 substantive Q&As exist;
  // Google requires ≥2 for rich results and a 1-Q block can't earn them.
  const faqSchema = faqCandidates.length >= 2
    ? faqPageJsonLd({ pagePath: `/herbs/${normalizedSlug}/`, questions: faqCandidates })
    : null


  return (
    <div className="mx-auto max-w-4xl lg:max-w-6xl space-y-10 px-4 pb-28 pt-6">
      <ScrollEngagementPrompt storageKey={`herb-prompt-${normalizedSlug}`} />
      <SchemaGraphScript graph={schemaGraph} />
      <HerbSchemaGenerator
        name={displayName}
        slug={normalizedSlug}
        description={briefSummary}
        url={`${SITE_URL}/herbs/${normalizedSlug}/`}
        image={`${SITE_URL}/og-default.jpg`}
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
        <div className="flex-1 min-w-0 space-y-10">
          {/* Header Breadcrumb - use only common name, not scientific name */}
      <nav className="flex items-center gap-2 text-xs text-muted">
        <Link href="/herbs" className="transition hover:text-ink">Herbs</Link>
        <span>/</span>
        <span className="text-ink font-medium">{displayName}</span>
      </nav>

      {/* Title Header */}
      <div className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 sm:p-10 shadow-sm">
        <header className="space-y-3">
          <div className="space-y-1">
            <p className="eyebrow-label">Herb Profile</p>
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {displayName}
            </h1>
            {botanicalName ? <p className="text-sm italic text-muted">{botanicalName}</p> : null}
          </div>
          <p className="text-base leading-7 text-[#46574d]">{briefSummary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <LastUpdatedBadge date={freshness.lastReviewed} citationCount={freshness.citationCount} />
            <EvidenceScoreBadge record={herbRecord} />
          </div>
        </header>
      </div>

      {/* Jump navigation — lets keyboard and screen-reader users reach sections directly */}
      <nav aria-label="Jump to profile sections" className="flex flex-wrap gap-2">
        {[
          { label: 'Quick Stats', href: '#quick-stats' },
          { label: 'Safety', href: '#safety' },
          { label: 'Evidence', href: '#evidence' },
          ...(mechanisms.length > 0 ? [{ label: 'Mechanisms', href: '#mechanisms' }] : []),
          { label: 'Compare', href: '#compare' },
        ].map(({ label, href }) => (
          <a
            key={href}
            href={href}
            className="rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-3 py-1.5 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-50"
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Section 1: Quick Stats */}
      <section id="quick-stats" className="hero-shell rounded-2xl border border-brand-900/10 p-5 sm:p-6 space-y-4">
        <h2 className="text-lg font-bold text-ink">Quick Stats</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Evidence level</p>
            <p className="mt-1 text-sm font-semibold text-ink">{evidenceStrength || 'Mixed or uncertain'}</p>
          </div>
          <div className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Typical onset</p>
            <p className="mt-1 text-sm font-semibold text-ink">{timeline || 'Varies by prep'}</p>
          </div>
          <div className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Safety rating</p>
            <p className="mt-1 text-sm font-semibold text-ink">{safetyTone}: {formatDisplayLabel(safetySensitivity)} caution</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {topUses.length > 0 && (
            <div className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-4">
              <h3 className="text-sm font-bold text-ink">Best-fit contexts</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {topUses.slice(0, 6).map((use) => (
                  <li key={use} className="rounded-full border border-brand-900/10 bg-white px-3 py-1 text-xs font-semibold text-brand-800">
                    {use}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {mechanisms.length > 0 && (
            <div className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-4">
              <h3 className="text-sm font-bold text-ink">Likely mechanisms</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#46574d]">
                {mechanisms.slice(0, 4).map((mechanism) => <li key={mechanism}>• {mechanism}</li>)}
              </ul>
            </div>
          )}
        </div>
      </section>

      <div className="rounded-2xl border border-brand-900/10 bg-white/80 p-4 shadow-sm">
        <AuthorCredentials className="bg-transparent p-0 shadow-none" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ProfileEvidenceLens record={herbRecord} />
        <EvidenceGradeExplainer record={herbRecord} />
        <ShowMeTheStudies citations={citations} />
      </div>

      {/* Section 2: Safety */}
      <section id="safety" className="rounded-2xl border border-amber-700/15 bg-amber-50/70 p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Safety first</p>
            <h2 className="text-xl font-bold text-ink">Who should slow down or skip it?</h2>
          </div>
          <span className="rounded-full border border-amber-700/20 bg-white px-3 py-1 text-xs font-bold text-amber-900">
            {safetyTone}
          </span>
        </div>
        <p className="text-sm leading-6 text-[#5b4a2c]">{safetySummary}</p>
        {avoidIf.length > 0 ? (
          <div className="rounded-xl border border-amber-700/15 bg-white/80 p-4">
            <h3 className="text-sm font-bold text-ink">Avoid or review first if</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {avoidIf.map((item) => (
                <li key={item} className="rounded-lg bg-amber-50 px-3 py-2 text-sm leading-6 text-[#5b4a2c]">{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {safetyGroups.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {safetyGroups.slice(0, 4).map((group) => (
              <div key={group.title} className="rounded-xl border border-amber-700/10 bg-white/80 p-4">
                <h3 className="text-sm font-bold text-ink">{group.title}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[#5b4a2c]">
                  {group.items.slice(0, 5).map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* Section 3: Evidence */}
      <section id="evidence" className="hero-shell rounded-2xl border border-brand-900/10 p-5 sm:p-6 space-y-5">
        <div>
          <p className="eyebrow-label">Evidence snapshot</p>
          <h2 className="text-xl font-bold text-ink">How confident should you be?</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Evidence strength</p>
            <p className="mt-2 text-lg font-bold text-ink">{evidenceStrength || 'Mixed or uncertain'}</p>
            <p className="mt-2 text-sm leading-6 text-[#46574d]">{evidenceLimitations || 'Evidence quality varies by outcome, dose, preparation, and population studied.'}</p>
          </div>
          <div className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Practical read</p>
            <p className="mt-2 text-sm leading-6 text-[#46574d]">{briefSummary}</p>
          </div>
        </div>
        <EvidenceGradeRationale record={herbRecord} />
        <TrialDesignInsight record={herbRecord} />
      </section>

      {pathwayDiagram ? (
        <section className="hero-shell rounded-2xl border border-brand-900/10 p-5 sm:p-6 space-y-4">
          <div>
            <p className="eyebrow-label">Mechanism map</p>
            <h2 className="text-xl font-bold text-ink">How {displayName} may work</h2>
          </div>
          <PathwayDiagram diagram={pathwayDiagram} />
        </section>
      ) : null}

      {expansion ? (
        <section className="hero-shell rounded-2xl border border-brand-900/10 p-5 sm:p-6 space-y-5">
          <div>
            <p className="eyebrow-label">Practical guide</p>
            <h2 className="text-xl font-bold text-ink">How people usually think about {displayName}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-4">
              <h3 className="text-sm font-bold text-ink">Works best when</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#46574d]">
                {expansion.worksBestWhen.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
            <div className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-4">
              <h3 className="text-sm font-bold text-ink">Usually not ideal when</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#46574d]">
                {expansion.notIdealWhen.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          </div>
          <div className="rounded-xl border border-brand-900/10 bg-white/80 p-4">
            <h3 className="text-sm font-bold text-ink">Quality and dosing notes</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <p className="text-sm leading-6 text-[#46574d]">{expansion.qualityNote}</p>
              <p className="text-sm leading-6 text-[#46574d]">{expansion.dosingNote}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section id="compare" className="hero-shell rounded-2xl border border-brand-900/10 p-5 sm:p-6 space-y-4">
        <div>
          <p className="eyebrow-label">Compare before choosing</p>
          <h2 className="text-xl font-bold text-ink">Related options to compare</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {comparisonLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-4 text-sm font-semibold text-brand-800 hover:bg-brand-50">
              {link.label}
            </Link>
          ))}
          {comparisonLinks.length === 0 ? <p className="text-sm text-muted">No direct comparison page is ready yet.</p> : null}
        </div>
      </section>

      {conditionLinks.length > 0 || goalLinks.length > 0 ? (
        <section className="rounded-2xl border border-brand-900/10 bg-white/80 p-5 sm:p-6 space-y-4 shadow-sm">
          <div>
            <p className="eyebrow-label">Discovery paths</p>
            <h2 className="text-xl font-bold text-ink">Explore by goal or use-case</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {goalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-4 text-sm font-semibold text-brand-800 hover:bg-brand-50">
                {link.label}
              </Link>
            ))}
            {conditionLinks.slice(0, 4).map((link: RuntimeMapEntry) => (
              <Link key={link.href} href={link.href} className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-4 text-sm font-semibold text-brand-800 hover:bg-brand-50">
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {internalLinkGroups.length > 0 ? (
        <RelatedDiscoveryGroups groups={internalLinkGroups} heading="Keep exploring" />
      ) : null}

      <SeeAlsoCluster title={`More like ${displayName}`} entries={clusterSeeAlso} />
      <HerbCompoundLinks herb={herbRecord} />

      <section className="rounded-2xl border border-brand-900/10 bg-white/80 p-5 sm:p-6 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-ink">Related herb profiles</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {relatedHerbLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-4 text-sm font-semibold text-brand-800 hover:bg-brand-50">
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <SourcingCta ingredientName={displayName} />
      <Disclaimer />

      {!suppressAffiliate && revenueProducts.length > 0 ? (
        <RecommendationSection title={`Recommended ${displayName} options`} products={revenueProducts} />
      ) : null}
      {!suppressAffiliate && stackRecommendations.length > 0 ? (
        <StackRecommendationSection title="Stack ideas" recommendations={stackRecommendations} />
      ) : null}
      {!suppressAffiliate ? <RecommendedProduct slug={normalizedSlug} /> : null}
        </div>
        <aside className="hidden lg:block w-64 sticky top-24">
          <ProfileTOC />
        </aside>
      </div>
    </div>
  )
}
