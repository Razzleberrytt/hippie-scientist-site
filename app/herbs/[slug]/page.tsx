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
      getEvidenceLabel(herb as unknown as RuntimeRecord)
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

  const herb = herbRaw as unknown as Herb
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
    getBatchedRuntimeRecords('related', [herb], allRecords, 8),
    getBatchedRuntimeRecords('comparison', [herb], allRecords, 8),
    getBatchedRuntimeRecords('stack', [herb], allRecords, 6),
    getEcosystemContinuityRecords(herb, allRecords, 6),
    getEntityConditionEntries(sourceRecordSlug),
    getRouteInternalLinkGroups(`/herbs/${normalizedSlug}`),
  ])

  const relatedCandidates = ((relatedBySlug[sourceRecordSlug] || []) as unknown as RuntimeRecord[])
    .filter((item: RuntimeRecord) => getRuntimeVisibility(item).canRender)

  const relatedHerbs = relatedCandidates
    .filter((item: RuntimeRecord) => herbSlugs.has(item.slug))
    .slice(0, 4)
    .map((item: RuntimeRecord) => ({ ...item, entityType: 'herb' as const }))

  const _relatedCompounds = relatedCandidates
    .filter((item: RuntimeRecord) => compoundSlugs.has(item.slug))
    .slice(0, 4)
    .map((item: RuntimeRecord) => ({ ...item, entityType: 'compound' as const }))

  const _visibleEcosystemContinuityRecords = (ecosystemContinuityRecords as unknown as RuntimeRecord[])
    .filter((item: RuntimeRecord) => getRuntimeVisibility(item).canRender)


  const comparisonRecords = ((comparisonBySlug[sourceRecordSlug] || []) as unknown as RuntimeRecord[])
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
  const pathwayDiagram = generatePathwayDiagram({ ...(herb as unknown as Record<string, unknown>), name: displayName })
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

  const faqSchema = faqPageJsonLd({
    pagePath: `/herbs/${normalizedSlug}/`,
    questions: [
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
    ].filter((entry) => isMeaningfulFaqAnswer(entry.answer)),
  })


  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 pb-28 pt-6">
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
            <EvidenceScoreBadge record={herb as unknown as RuntimeRecord} />
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
            <div className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted font-semibold">Best for</p>
              <p className="mt-1 text-sm text-ink">{topUses.slice(0, 3).join(', ')}</p>
            </div>
          )}
          {avoidIf.length > 0 && (
            <div className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900 font-semibold">Avoid / review if</p>
              <p className="mt-1 text-sm text-amber-900">{avoidIf.slice(0, 3).join(', ')}</p>
            </div>
          )}
        </div>
      </section>

      {normalizedSlug === 'ashwagandha' && <AshwagandhaStressClaim />}

      {expansion ? (
        <section className="card-premium p-4 sm:p-5 space-y-5">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-700">Expanded editorial review</p>
            <h2 className="text-lg font-bold text-ink">What this profile is built to answer</h2>
            <p className="text-sm leading-6 text-muted">{expansion.intent}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {expansion.methodology.map((item) => (
              <div key={item} className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-3 text-xs leading-5 text-muted">{item}</div>
            ))}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-[var(--surface-card)]">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="bg-brand-50/60 text-xs font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Use case</th>
                  <th className="px-4 py-3">Evidence</th>
                  <th className="px-4 py-3">Best fit</th>
                  <th className="px-4 py-3">Typical range</th>
                  <th className="px-4 py-3">Safety context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/5">
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
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-4">
              <h3 className="font-bold text-ink">Product and form choices</h3>
              <div className="mt-3 space-y-3">
                {expansion.comparisonRows.map((row) => (
                  <div key={row.scenario} className="border-t border-brand-900/10 pt-3 first:border-t-0 first:pt-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">{row.scenario}</p>
                    <p className="mt-1 text-sm font-semibold text-ink">{row.firstChoice}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{row.why}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-amber-900/10 bg-amber-50/70 p-4">
              <h3 className="font-bold text-amber-950">Safety checks</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-5 text-amber-900/90">
                {expansion.safetyNotes.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-4">
              <h3 className="font-bold text-ink">How to choose a product</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-5 text-muted">
                {expansion.buyerChecklist.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-4">
              <h3 className="font-bold text-ink">References</h3>
              <ul className="mt-3 space-y-2 text-xs leading-5">
                {expansion.references.map((ref) => (
                  <li key={ref.href}>
                    <a href={ref.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-800 hover:underline">{ref.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {/* Section 2: Safety */}
      <section id="safety" className="rounded-2xl bg-amber-50/70 border border-amber-900/10 border-l-4 border-amber-500/60 p-4 sm:p-5 space-y-3">
        <h2 className="text-lg font-bold text-ink">Safety &amp; Cautions</h2>
        <p className="text-sm leading-6 text-amber-900">{safetySummary}</p>
        {safetyGroups.length > 0 && (
          <div className="mt-4 grid gap-4 pt-3 border-t border-amber-900/10 sm:grid-cols-2">
            {safetyGroups.map(group => (
              <div key={group.title} className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 font-semibold">{group.title}</h3>
                <ul className="space-y-1 text-xs text-amber-900">
                  {group.items.map(item => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 3: Evidence Summary */}
      <section id="evidence-summary" className="card-premium scroll-mt-24 p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-bold text-ink">Evidence Summary</h2>
          <EvidenceScoreBadge record={herb as unknown as RuntimeRecord} size="sm" />
        </div>
        <ProfileEvidenceLens
          record={herb as unknown as RuntimeRecord}
          evidenceLevel={evidenceStrength}
          safetySummary={safetySummary}
          citationsCount={freshness.citationCount}
          limitations={evidenceLimitations}
        />

        {herb.evidence_design_match && herb.evidence_risk_of_bias && herb.evidence_consistency && (
          <EvidenceGradeRationale
            grade={herb.evidence_grade || 'C'}
            designMatch={herb.evidence_design_match as string}
            riskOfBias={herb.evidence_risk_of_bias as string}
            consistency={herb.evidence_consistency as string}
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

        <EvidenceGradeExplainer />
        <ShowMeTheStudies citations={citations} />
      </section>

      {/* Section 3b: Mechanism Pathway Diagram */}
      {pathwayDiagram && (
        <section className="card-premium p-4 sm:p-5 space-y-3">
          <h2 className="text-lg font-bold text-ink">How {displayName} Works</h2>
          <p className="text-xs text-muted leading-5">
            Simplified mechanism pathway based on preclinical and pharmacological evidence. Does not confirm clinical efficacy.
          </p>
          <PathwayDiagram data={pathwayDiagram} />
        </section>
      )}

      {/* Section 4: Mechanisms (Collapsible) */}
      {mechanisms.length > 0 && (
        <section id="mechanisms" className="card-premium p-4 sm:p-5">
          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between font-bold text-ink text-lg select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:rounded">
              <span>Mechanisms &amp; Biological Pathways</span>
              <span aria-hidden="true" className="text-brand-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-4 pt-4 border-t border-brand-900/10 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Preclinical pathways
                </span>
                <p className="text-xs text-muted">
                  Proposed mechanisms from in vitro and animal research; these do not confirm clinical outcomes in humans.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {mechanisms.map(m => (
                  <span key={m} className="chip-readable text-xs">{m}</span>
                ))}
              </div>
            </div>
          </details>
        </section>
      )}

      {/* Active compounds — internal links from the curated relationship map */}
      <HerbCompoundLinks herbSlug={herb.slug} herbName={displayName} />

      {goalLinks.length > 0 ? (
        <section className="rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-700">Goal guides</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {goalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-brand-900/10 bg-brand-50/50 px-3 py-1.5 text-xs font-semibold capitalize text-brand-800 hover:bg-brand-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {conditionLinks.length > 0 ? (
        <section className="rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-700">Condition guides</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {conditionLinks.slice(0, 5).map((link: RuntimeMapEntry) => (
              <Link
                key={link.slug}
                href={link.href || `/goals/${link.slug}`}
                className="rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-50"
              >
                {link.label || formatDisplayLabel(link.slug)}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <SeeAlsoCluster slug={normalizedSlug} kind="herb" limit={6} />

      <RelatedDiscoveryGroups
        title="Related research paths"
        groups={internalLinkGroups}
      />

      {/* Section 5: Compare Nearby + CTA */}
      <section id="compare" className="card-premium p-4 sm:p-5 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-ink">Compare &amp; Sourcing</h2>
          <p className="text-sm text-muted">Compare side-by-side tradeoffs or verify active marker guidelines.</p>
        </div>
        {!suppressAffiliate && <SourcingCta record={herb} displayName={displayName} />}

        {suppressAffiliate ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 space-y-3">
            <h3 className="text-lg font-bold text-red-950 flex items-center gap-2">
              <span role="img" aria-label="Warning">⚠️</span> Sourcing Options Disabled for Safety
            </h3>
            <p className="text-sm leading-relaxed text-red-900">
              Direct product recommendations and affiliate links are suppressed for this herb due to its high caution or needs-review safety classification.
            </p>
            <p className="text-xs text-red-800">
              Evaluate the safety checks, contraindications, and potential medication interactions below under clinician supervision before use.
            </p>
          </div>
        ) : revenueProducts ? (
          <div className="space-y-6">
            <RecommendationSection
              title={revenueProducts.title}
              description={`Affiliate recommendations for ${displayName}. Review safety, dose, and product quality before buying.`}
              products={revenueProducts.products}
            />
            <div className="rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-5 space-y-3 shadow-sm">
              <h4 className="text-sm font-bold text-ink uppercase tracking-wider">Product Form &amp; Quality Guidelines</h4>
              <p className="text-xs leading-relaxed text-muted">
                When sourcing {displayName}, verify the label for:
              </p>
              <ul className="list-disc pl-5 text-xs text-muted space-y-1">
                <li><strong>Standardized Extract:</strong> Confirm active content percentages on the supplement facts panel (e.g. standardized to specific marker compounds) rather than simple raw herb weights.</li>
                <li><strong>Third-Party Testing:</strong> Look for independent purity labels (USP, NSF, ConsumerLab, or Eurofins) to ensure the product is free from heavy metals, solvents, and contaminants.</li>
                <li><strong>Form Bioavailability:</strong> Ensure the form matches evidence-supported configurations (e.g. standardized active extracts like bacosides, withanolides, or curcuminoids) for optimal onset and digestion tolerance.</li>
              </ul>
            </div>
          </div>
        ) : null}

        <StackRecommendationSection
          productName={displayName}
          recommendations={stackRecommendations}
        />

        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          {relatedHerbLinks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-semibold">Compare herbs</h3>
              <div className="flex flex-col gap-2">
                {relatedHerbLinks.map(link => (
                  <Link key={link.href} href={link.href} className="text-sm font-semibold text-brand-800 hover:underline">{link.label}</Link>
                ))}
              </div>
            </div>
          )}
          {comparisonLinks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-semibold">Tradeoffs</h3>
              <div className="flex flex-col gap-2">
                {comparisonLinks.map(link => (
                  <Link key={link.href} href={link.href} className="text-sm font-semibold text-brand-800 hover:underline">Compare {link.label}</Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {!suppressAffiliate && revenueProducts ? (
        <RecommendedProduct
          slug={normalizedSlug}
          title={`Ready to try this? See top ${displayName} brands`}
          compact
        />
      ) : null}

      <Disclaimer className="border-amber-900/15 bg-amber-50/70 !text-amber-950 [&_p]:!text-amber-950 [&_a]:!text-brand-800 mt-6" />
      <AuthorCredentials />

      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between">
        <Link href="/herbs" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">
          ← Back to herbs library
        </Link>
        <Link href="/safety-checker" className="text-sm font-bold text-brand-800 hover:underline">
          Safety checker →
        </Link>
      </div>
    </div>
  )
}
