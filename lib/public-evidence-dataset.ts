import { extractCitationsFromRecord } from '@/lib/citations'
import { getEvidenceLetterGrade } from '@/lib/evidence'
import {
  evidenceStudyId,
  isHumanEvidenceClass,
  isHumanTrialClass,
  normalizeEvidenceConfidence,
  normalizeEvidenceRelationship,
  normalizeEvidenceStudyClass,
  parseSampleSize,
  summarizeEvidenceStudies,
  type EvidenceConfidence,
  type EvidenceRelationship,
  type EvidenceStudyClass,
  type EvidenceStudyRecord,
} from '@/lib/evidence-study'
import { buildResearchQualitySnapshot } from '@/lib/research-quality-snapshot'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import {
  getCompoundBySlug,
  getCompounds,
  getHerbBySlug,
  getHerbs,
} from '@/src/lib/runtime-data'
import type { RuntimeRecord } from '@/src/types/content'

export const PUBLIC_EVIDENCE_DATASET_VERSION = '2026.08.16'
export const PUBLIC_EVIDENCE_DATASET_TITLE = 'The Hippie Scientist Public Evidence Dataset 2026'

export type PublicEvidenceIngredient = {
  slug: string
  name: string
  type: 'herb' | 'compound'
  path: string
  evidenceGrade: string
  category: string
  safetyCaution: boolean
}

export type PublicStudyRelationship = {
  ingredientSlug: string
  ingredientName: string
  ingredientType: 'herb' | 'compound'
  ingredientPath: string
  evidenceGrade: string
  relationship: EvidenceRelationship
  outcome?: string
}

export type PublicStudyEntity = {
  id: string
  title: string
  authors?: string
  journal?: string
  year?: number | string
  pmid?: string
  doi?: string
  url?: string
  studyType?: string
  evidenceClass: EvidenceStudyClass
  sampleSize?: number | string
  dose?: string
  duration?: string
  population?: string
  outcome?: string
  result?: string
  limitation?: string
  confidence: EvidenceConfidence
  statisticalConsistency?: string
  extractName?: string
  conditions: string[]
  safetyOutcome?: string
  relationships: PublicStudyRelationship[]
  relationshipSummary: EvidenceRelationship
}

export type EvidenceCategorySummary = {
  category: string
  totalIngredients: number
  strongOrModerate: number
  preliminaryOrInsufficient: number
  unassigned: number
  humanStudies: number
  humanTrials: number
}

export type PublicEvidenceReportMetrics = {
  ingredientCount: number
  studyCount: number
  humanStudyCount: number
  humanTrialCount: number
  approximateParticipants: number
  participantCountCoverage: number
  strongOrModerateIngredients: number
  preliminaryOrInsufficientIngredients: number
  unassignedIngredients: number
  ingredientsWithSafetyCautions: number
  explicitlyFlaggedClaimOverreach: number
  supportingRelationships: number
  mixedRelationships: number
  contradictingRelationships: number
  noClearEffectRelationships: number
  disagreementStudyCount: number
  /** Null for synthetic/pure builders that do not execute canonical topology. */
  underlyingStudyMetricsSource: 'canonical-research-topology' | null
  /** Unique site-wide publication identities across every canonical research profile. */
  globalInventoryPublicationCount: number | null
  /** Site-wide evidence units remaining after explicitly proven registry/lineage dependence is collapsed. */
  globalInventoryUnderlyingStudyCount: number | null
  globalCollapsedInventoryPublicationCount: number | null
  /** Unique site-wide primary-human publication identities. */
  globalPrimaryHumanPublicationCount: number | null
  /** Primary-human evidence units remaining after explicitly proven dependence collapse; unresolved lineage is not assumed independent. */
  globalPrimaryHumanUnderlyingStudyCount: number | null
  globalCollapsedPrimaryHumanPublicationCount: number | null
  /** Claim-level coverage of explicit registry or non-registry lineage used to assess publication independence. */
  independenceMultiStudyApprovedClaims: number | null
  independenceFullyResolvedClaims: number | null
  independenceUnresolvedClaims: number | null
  highConfidenceIndependenceUnresolvedClaims: number | null
  meanIndependenceCoverage: number | null
  gradeDistribution: Array<{ grade: string; count: number; pct: number }>
  categories: EvidenceCategorySummary[]
}

export type PublicEvidenceDataset = {
  schemaVersion: 1
  datasetVersion: string
  title: string
  generatedFrom: 'current indexable runtime records'
  methodologyPath: '/info/editorial-policy/'
  citationExplorerPath: '/learn/citation-explorer/'
  citationText: string
  ingredients: PublicEvidenceIngredient[]
  studies: PublicStudyEntity[]
  metrics: PublicEvidenceReportMetrics
}

type EntityRecord = {
  record: RuntimeRecord
  type: 'herb' | 'compound'
}

function cleanString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(item => cleanString(item)).filter(Boolean)
  const text = cleanString(value)
  if (!text) return []
  return text.split(/[|;,]/).map(item => item.trim()).filter(Boolean)
}

function canIndexRecord(record: RuntimeRecord): boolean {
  try {
    return Boolean(record.slug && getRuntimeVisibility(record).canIndex)
  } catch {
    return false
  }
}

function entityName(record: RuntimeRecord): string {
  return (
    cleanString(record.displayName) ||
    cleanString(record.name) ||
    cleanString(record.common) ||
    cleanString(record.scientific) ||
    cleanString(record.slug)
  )
}

function entityCategory(record: RuntimeRecord): string {
  return cleanString(record.category_label || record.category || record.class || record.compoundClass) || 'Uncategorized'
}

function hasSafetyCaution(record: RuntimeRecord): boolean {
  const text = [
    ...cleanList(record.safety_flags),
    ...cleanList(record.safetyNotes),
    ...cleanList(record.safety_notes),
    ...cleanList(record.contraindications),
    ...cleanList(record.interactions),
    cleanString(record.safetyLevel),
    cleanString(record.safety_level),
  ].join(' ').toLowerCase()

  return /\b(avoid(?:ance)?|contraindicat(?:e|ed|es|ion|ions)?|caution(?:s|ary)?|interactions?|pregnan(?:t|cy)|breastfeed(?:ing)?|liver|kidney|bleed(?:ing)?|sedat(?:e|ed|ion|ive)?|stimul(?:ant|ation)?|risks?|toxic(?:ity)?|monitor(?:ing)?)\b/.test(text)
}

function hasExplicitClaimOverreachFlag(record: RuntimeRecord): boolean {
  const fields = [
    record.claim_overreach,
    record.claimOverreach,
    record.evidence_language_violation,
    record.evidenceLanguageViolation,
    record.marketing_claim_exceeds_evidence,
    record.marketingClaimExceedsEvidence,
  ]
  return fields.some(value => value === true || /^(true|yes|flagged|overreach)$/i.test(cleanString(value)))
}

function aggregateRelationship(relationships: PublicStudyRelationship[]): EvidenceRelationship {
  const values = new Set(relationships.map(item => item.relationship))
  if (values.has('supports') && (values.has('contradicts') || values.has('no_clear_effect'))) return 'mixed'
  if (values.has('contradicts') && values.has('mixed')) return 'mixed'
  if (values.has('mixed')) return 'mixed'
  if (values.has('contradicts')) return 'contradicts'
  if (values.has('supports')) return 'supports'
  if (values.has('no_clear_effect')) return 'no_clear_effect'
  return 'background'
}

function toStudyRecord(study: PublicStudyEntity): EvidenceStudyRecord {
  return {
    id: study.id,
    title: study.title,
    authors: study.authors,
    journal: study.journal,
    year: study.year,
    pmid: study.pmid,
    doi: study.doi,
    url: study.url,
    studyType: study.studyType,
    evidenceClass: study.evidenceClass,
    sampleSize: study.sampleSize,
    dose: study.dose,
    duration: study.duration,
    population: study.population,
    outcome: study.outcome,
    result: study.result,
    limitation: study.limitation,
    relationship: study.relationshipSummary,
    confidence: study.confidence,
    statisticalConsistency: study.statisticalConsistency,
    extractName: study.extractName,
    conditions: study.conditions,
    safetyOutcome: study.safetyOutcome,
  }
}

function mergeStudyField<T>(current: T | undefined, incoming: T | undefined): T | undefined {
  if (current !== undefined && current !== null && String(current).trim() !== '') return current
  return incoming
}

export function buildPublicEvidenceDatasetFromRecords(entities: EntityRecord[]): PublicEvidenceDataset {
  const ingredients: PublicEvidenceIngredient[] = []
  const studiesById = new Map<string, PublicStudyEntity>()
  const gradeCounts = new Map<string, number>()
  const categoryMap = new Map<string, EvidenceCategorySummary>()
  let explicitlyFlaggedClaimOverreach = 0

  for (const { record, type } of entities) {
    if (!canIndexRecord(record)) continue

    const name = entityName(record)
    const evidenceGrade = getEvidenceLetterGrade(record)
    const category = entityCategory(record)
    const safetyCaution = hasSafetyCaution(record)
    const path = `/${type === 'herb' ? 'herbs' : 'compounds'}/${record.slug}/`

    ingredients.push({ slug: record.slug, name, type, path, evidenceGrade, category, safetyCaution })
    gradeCounts.set(evidenceGrade, (gradeCounts.get(evidenceGrade) || 0) + 1)
    if (hasExplicitClaimOverreachFlag(record)) explicitlyFlaggedClaimOverreach += 1

    const categorySummary = categoryMap.get(category) || {
      category,
      totalIngredients: 0,
      strongOrModerate: 0,
      preliminaryOrInsufficient: 0,
      unassigned: 0,
      humanStudies: 0,
      humanTrials: 0,
    }
    categorySummary.totalIngredients += 1
    if (evidenceGrade === 'A' || evidenceGrade === 'B') categorySummary.strongOrModerate += 1
    if (evidenceGrade === 'C' || evidenceGrade === 'D' || evidenceGrade === 'Avoid/Insufficient') {
      categorySummary.preliminaryOrInsufficient += 1
    }
    if (evidenceGrade === 'Unassigned') categorySummary.unassigned += 1

    const citations = extractCitationsFromRecord(record)
    for (const citation of citations) {
      const evidenceClass = citation.evidenceClass || normalizeEvidenceStudyClass(citation.studyType)
      const relationship = normalizeEvidenceRelationship(citation.relationship)
      const id = citation.id || evidenceStudyId(citation)
      const conditions = [...new Set([...(citation.conditions || [])].map(item => item.trim()).filter(Boolean))]
      const relationshipRecord: PublicStudyRelationship = {
        ingredientSlug: record.slug,
        ingredientName: name,
        ingredientType: type,
        ingredientPath: path,
        evidenceGrade,
        relationship,
        outcome: citation.outcome,
      }

      const existing = studiesById.get(id)
      if (!existing) {
        studiesById.set(id, {
          id,
          title: citation.title || id,
          authors: citation.authors,
          journal: citation.journal,
          year: citation.year,
          pmid: citation.pmid,
          doi: citation.doi,
          url: citation.url,
          studyType: citation.studyType,
          evidenceClass,
          sampleSize: citation.sampleSize,
          dose: citation.dose,
          duration: citation.duration,
          population: citation.population,
          outcome: citation.outcome,
          result: citation.result,
          limitation: citation.limitation,
          confidence: normalizeEvidenceConfidence(citation.confidence),
          statisticalConsistency: citation.statisticalConsistency,
          extractName: citation.extractName,
          conditions,
          safetyOutcome: citation.safetyOutcome,
          relationships: [relationshipRecord],
          relationshipSummary: relationship,
        })
      } else {
        existing.authors = mergeStudyField(existing.authors, citation.authors)
        existing.journal = mergeStudyField(existing.journal, citation.journal)
        existing.year = mergeStudyField(existing.year, citation.year)
        existing.pmid = mergeStudyField(existing.pmid, citation.pmid)
        existing.doi = mergeStudyField(existing.doi, citation.doi)
        existing.url = mergeStudyField(existing.url, citation.url)
        existing.studyType = mergeStudyField(existing.studyType, citation.studyType)
        existing.sampleSize = mergeStudyField(existing.sampleSize, citation.sampleSize)
        existing.dose = mergeStudyField(existing.dose, citation.dose)
        existing.duration = mergeStudyField(existing.duration, citation.duration)
        existing.population = mergeStudyField(existing.population, citation.population)
        existing.outcome = mergeStudyField(existing.outcome, citation.outcome)
        existing.result = mergeStudyField(existing.result, citation.result)
        existing.limitation = mergeStudyField(existing.limitation, citation.limitation)
        existing.statisticalConsistency = mergeStudyField(existing.statisticalConsistency, citation.statisticalConsistency)
        existing.extractName = mergeStudyField(existing.extractName, citation.extractName)
        existing.safetyOutcome = mergeStudyField(existing.safetyOutcome, citation.safetyOutcome)
        existing.conditions = [...new Set([...existing.conditions, ...conditions])]
        if (!existing.relationships.some(item =>
          item.ingredientSlug === relationshipRecord.ingredientSlug &&
          item.relationship === relationshipRecord.relationship &&
          item.outcome === relationshipRecord.outcome,
        )) {
          existing.relationships.push(relationshipRecord)
        }
        existing.relationshipSummary = aggregateRelationship(existing.relationships)
      }

      if (isHumanEvidenceClass(evidenceClass)) categorySummary.humanStudies += 1
      if (isHumanTrialClass(evidenceClass)) categorySummary.humanTrials += 1
    }

    categoryMap.set(category, categorySummary)
  }

  const studies = [...studiesById.values()].sort((a, b) => {
    const yearDiff = Number(b.year || 0) - Number(a.year || 0)
    if (yearDiff !== 0) return yearDiff
    return a.title.localeCompare(b.title)
  })
  const studyMetrics = summarizeEvidenceStudies(studies.map(toStudyRecord))

  let supportingRelationships = 0
  let mixedRelationships = 0
  let contradictingRelationships = 0
  let noClearEffectRelationships = 0
  for (const study of studies) {
    for (const relationship of study.relationships) {
      if (relationship.relationship === 'supports') supportingRelationships += 1
      else if (relationship.relationship === 'mixed') mixedRelationships += 1
      else if (relationship.relationship === 'contradicts') contradictingRelationships += 1
      else if (relationship.relationship === 'no_clear_effect') noClearEffectRelationships += 1
    }
  }

  const gradeOrder = ['A', 'B', 'C', 'D', 'Avoid/Insufficient', 'Unassigned']
  const gradeDistribution = gradeOrder.map(grade => {
    const count = gradeCounts.get(grade) || 0
    return {
      grade,
      count,
      pct: ingredients.length ? (count / ingredients.length) * 100 : 0,
    }
  })
  const distributedIngredientCount = gradeDistribution.reduce((sum, bucket) => sum + bucket.count, 0)
  if (distributedIngredientCount !== ingredients.length) {
    throw new Error(`[public-evidence-dataset] grade distribution covers ${distributedIngredientCount}/${ingredients.length} ingredients`)
  }

  const categories = [...categoryMap.values()]
    .sort((a, b) => {
      const aRate = a.totalIngredients ? a.strongOrModerate / a.totalIngredients : 0
      const bRate = b.totalIngredients ? b.strongOrModerate / b.totalIngredients : 0
      return bRate - aRate || b.humanTrials - a.humanTrials || a.category.localeCompare(b.category)
    })

  for (const category of categories) {
    const categorized = category.strongOrModerate + category.preliminaryOrInsufficient + category.unassigned
    if (categorized !== category.totalIngredients) {
      throw new Error(`[public-evidence-dataset] ${category.category} grade buckets cover ${categorized}/${category.totalIngredients} ingredients`)
    }
  }

  const metrics: PublicEvidenceReportMetrics = {
    ingredientCount: ingredients.length,
    studyCount: studies.length,
    humanStudyCount: studyMetrics.humanStudies,
    humanTrialCount: studyMetrics.humanTrials,
    approximateParticipants: studyMetrics.approximateParticipants,
    participantCountCoverage: studyMetrics.studiesWithParticipantCounts,
    strongOrModerateIngredients: ingredients.filter(item => item.evidenceGrade === 'A' || item.evidenceGrade === 'B').length,
    preliminaryOrInsufficientIngredients: ingredients.filter(item => item.evidenceGrade === 'C' || item.evidenceGrade === 'D' || item.evidenceGrade === 'Avoid/Insufficient').length,
    unassignedIngredients: ingredients.filter(item => item.evidenceGrade === 'Unassigned').length,
    ingredientsWithSafetyCautions: ingredients.filter(item => item.safetyCaution).length,
    explicitlyFlaggedClaimOverreach,
    supportingRelationships,
    mixedRelationships,
    contradictingRelationships,
    noClearEffectRelationships,
    disagreementStudyCount: studies.filter(study => study.relationshipSummary === 'mixed').length,
    underlyingStudyMetricsSource: null,
    globalInventoryPublicationCount: null,
    globalInventoryUnderlyingStudyCount: null,
    globalCollapsedInventoryPublicationCount: null,
    globalPrimaryHumanPublicationCount: null,
    globalPrimaryHumanUnderlyingStudyCount: null,
    globalCollapsedPrimaryHumanPublicationCount: null,
    independenceMultiStudyApprovedClaims: null,
    independenceFullyResolvedClaims: null,
    independenceUnresolvedClaims: null,
    highConfidenceIndependenceUnresolvedClaims: null,
    meanIndependenceCoverage: null,
    gradeDistribution,
    categories,
  }

  return {
    schemaVersion: 1,
    datasetVersion: PUBLIC_EVIDENCE_DATASET_VERSION,
    title: PUBLIC_EVIDENCE_DATASET_TITLE,
    generatedFrom: 'current indexable runtime records',
    methodologyPath: '/info/editorial-policy/',
    citationExplorerPath: '/learn/citation-explorer/',
    citationText: `The Hippie Scientist. ${PUBLIC_EVIDENCE_DATASET_TITLE}. Version ${PUBLIC_EVIDENCE_DATASET_VERSION}. https://thehippiescientist.net/evidence/evidence-report/`,
    ingredients: ingredients.sort((a, b) => a.name.localeCompare(b.name)),
    studies,
    metrics,
  }
}

async function hydrateIndexableRecords(summary: RuntimeRecord[], type: 'herb' | 'compound'): Promise<EntityRecord[]> {
  const indexable = summary.filter(canIndexRecord)
  const hydrated: EntityRecord[] = []
  const chunkSize = 32

  for (let index = 0; index < indexable.length; index += chunkSize) {
    const chunk = indexable.slice(index, index + chunkSize)
    const detailed = await Promise.all(chunk.map(record =>
      type === 'herb' ? getHerbBySlug(record.slug) : getCompoundBySlug(record.slug),
    ))
    for (let offset = 0; offset < chunk.length; offset += 1) {
      const record = detailed[offset] || chunk[offset]
      if (record && canIndexRecord(record)) hydrated.push({ record, type })
    }
  }

  return hydrated
}

export async function getPublicEvidenceDataset(): Promise<PublicEvidenceDataset> {
  const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])
  const [herbRecords, compoundRecords] = await Promise.all([
    hydrateIndexableRecords(herbs, 'herb'),
    hydrateIndexableRecords(compounds, 'compound'),
  ])
  const dataset = buildPublicEvidenceDatasetFromRecords([...herbRecords, ...compoundRecords])
  const topology = buildResearchQualitySnapshot(process.cwd()).topology
  const independence = topology.underlyingStudyIndependence.summary
  const coverage = topology.evidenceIndependenceCoverage.summary

  return {
    ...dataset,
    metrics: {
      ...dataset.metrics,
      underlyingStudyMetricsSource: 'canonical-research-topology',
      globalInventoryPublicationCount: independence.globalInventoryPublicationCount,
      globalInventoryUnderlyingStudyCount: independence.globalInventoryUnderlyingStudyCount,
      globalCollapsedInventoryPublicationCount: independence.globalCollapsedInventoryPublicationCount,
      globalPrimaryHumanPublicationCount: independence.globalPrimaryHumanPublicationCount,
      globalPrimaryHumanUnderlyingStudyCount: independence.globalPrimaryHumanUnderlyingStudyCount,
      globalCollapsedPrimaryHumanPublicationCount: independence.globalCollapsedPrimaryHumanPublicationCount,
      independenceMultiStudyApprovedClaims: coverage.multiStudyApprovedClaims,
      independenceFullyResolvedClaims: coverage.fullyResolvedClaims,
      independenceUnresolvedClaims: coverage.unresolvedClaims,
      highConfidenceIndependenceUnresolvedClaims: coverage.highConfidenceUnresolvedClaims,
      meanIndependenceCoverage: coverage.meanCombinedCoverage,
    },
  }
}

function csvEscape(value: unknown): string {
  const text = value == null ? '' : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function publicEvidenceDatasetToCsv(dataset: PublicEvidenceDataset): string {
  const headers = [
    'study_id', 'title', 'authors', 'journal', 'year', 'pmid', 'doi', 'study_class', 'sample_size',
    'dose', 'duration', 'population', 'outcome', 'result', 'limitation', 'relationship_summary',
    'conditions', 'safety_outcome', 'ingredient_slugs', 'ingredient_names', 'ingredient_grades',
  ]

  const rows = dataset.studies.map(study => [
    study.id,
    study.title,
    study.authors,
    study.journal,
    study.year,
    study.pmid,
    study.doi,
    study.evidenceClass,
    parseSampleSize(study.sampleSize) ?? study.sampleSize,
    study.dose,
    study.duration,
    study.population,
    study.outcome,
    study.result,
    study.limitation,
    study.relationshipSummary,
    study.conditions.join('|'),
    study.safetyOutcome,
    study.relationships.map(item => item.ingredientSlug).join('|'),
    study.relationships.map(item => item.ingredientName).join('|'),
    study.relationships.map(item => item.evidenceGrade).join('|'),
  ].map(csvEscape).join(','))

  return `${headers.join(',')}\n${rows.join('\n')}\n`
}
