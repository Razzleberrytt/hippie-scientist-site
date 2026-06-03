import { formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { safeLower, safeSlug } from '@/lib/search-safe'

export type EcosystemFieldSet = {
  topicClusters: string[]
  ecosystemTags: string[]
  pathwayCompanions: string[]
  comparisonCandidates: string[]
  synergyRelationships: string[]
  semanticNeighbors: string[]
  ecosystemAnchors: string[]
  relatedTopics: string[]
  pathwayEcosystems: string[]
  mechanismEcosystems: string[]
  authoritySupernode: boolean
  authoritySignals: string[]
}

const AUTHORITY_NAMES = new Set([
  'ashwagandha',
  'berberine',
  'curcumin',
  'egcg',
  'nac',
  'n-acetylcysteine',
  'resveratrol',
])

function cleanList(value: unknown, limit = 12) {
  return unique(list(value)
    .map(formatDisplayLabel)
    .filter((item) => item && isClean(item)))
    .slice(0, limit)
}

function cleanSlugList(value: unknown, limit = 12) {
  return unique(list(value)
    .map((item) => safeSlug(item))
    .filter(Boolean))
    .slice(0, limit)
}

function flag(value: unknown) {
  const normalized = safeLower(value)
  return ['true', 'yes', '1', 'supernode', 'anchor'].some((token) => normalized.includes(token))
}

function score(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export function normalizeEcosystemFields(record: any): EcosystemFieldSet {
  const slug = safeSlug(record?.slug || record?.name)
  const authorityStatus = text(record?.authority_supernode || record?.evidence_authority_status || record?.authority_status)
  const authorityScore = score(record?.authority_score)
  const authoritySupernode =
    flag(authorityStatus) ||
    authorityScore >= 80 ||
    AUTHORITY_NAMES.has(slug)

  return {
    topicClusters: cleanList([
      ...list(record?.topic_clusters),
      ...list(record?.clusters),
      ...list(record?.compound_cluster),
      ...list(record?.herb_internal_link_cluster),
      ...list(record?.internal_link_cluster),
    ]),
    ecosystemTags: cleanList([
      ...list(record?.ecosystem_tags),
      ...list(record?.functional_categories),
      ...list(record?.tags),
      ...list(record?.keywords),
    ]),
    pathwayCompanions: cleanList([
      ...list(record?.pathway_companions),
      ...list(record?.pathways),
      ...list(record?.pathways_v2),
      ...list(record?.pathway_bucket),
    ]),
    comparisonCandidates: cleanSlugList(record?.comparison_candidates || record?.comparison_group, 8),
    synergyRelationships: cleanList([
      ...list(record?.synergy_relationships),
      ...list(record?.synergies),
      ...list(record?.stacking_notes),
    ], 8),
    semanticNeighbors: cleanSlugList([
      ...list(record?.semantic_neighbors),
      ...list(record?.related_compounds),
      ...list(record?.related_herbs),
      ...list(record?.relatedEntities),
    ], 10),
    ecosystemAnchors: cleanList([
      ...list(record?.ecosystem_anchors),
      ...list(record?.authority_anchor),
      ...list(record?.internal_link_cluster),
      ...list(record?.herb_internal_link_cluster),
    ], 8),
    relatedTopics: cleanList([
      ...list(record?.related_topics),
      ...list(record?.conditions),
      ...list(record?.primary_effects),
      ...list(record?.effects),
    ], 10),
    pathwayEcosystems: cleanList([
      ...list(record?.pathway_ecosystems),
      ...list(record?.metabolism_pathways),
      ...list(record?.pathways_v2),
      ...list(record?.pathways),
    ], 10),
    mechanismEcosystems: cleanList([
      ...list(record?.mechanism_ecosystems),
      ...list(record?.mechanism_targets),
      ...list(record?.mechanisms),
      ...list(record?.mechanism),
    ], 10),
    authoritySupernode,
    authoritySignals: cleanList([
      authoritySupernode ? 'Authority anchor' : '',
      authorityStatus,
      authorityScore ? `Authority score ${authorityScore}` : '',
      ...list(record?.ecosystem_anchors),
    ], 6),
  }
}

export function collectEcosystemSignals(record: any) {
  const fields = normalizeEcosystemFields(record)

  return unique([
    ...fields.topicClusters,
    ...fields.ecosystemTags,
    ...fields.pathwayCompanions,
    ...fields.relatedTopics,
    ...fields.pathwayEcosystems,
    ...fields.mechanismEcosystems,
    ...fields.ecosystemAnchors,
  ].map((item) => safeLower(item)).filter(Boolean))
}

export function getAuthorityAnchorRecords(records: any[], limit = 6) {
  return records
    .map((record) => ({ record, fields: normalizeEcosystemFields(record) }))
    .filter(({ record, fields }) => safeSlug(record?.slug) && fields.authoritySupernode)
    .sort((a, b) => score(b.record?.authority_score) - score(a.record?.authority_score))
    .slice(0, limit)
    .map(({ record, fields }) => ({ ...record, ecosystemFields: fields }))
}

export function getSemanticRelationshipRecords(record: any, records: any[], limit = 6) {
  const sourceSlug = safeSlug(record?.slug)
  const sourceSignals = new Set(collectEcosystemSignals(record))
  const explicit = new Set(normalizeEcosystemFields(record).semanticNeighbors)

  if (!sourceSignals.size && !explicit.size) return []

  return records
    .filter((candidate) => {
      const slug = safeSlug(candidate?.slug)
      return slug && slug !== sourceSlug
    })
    .map((candidate) => {
      const slug = safeSlug(candidate?.slug)
      const candidateSignals = collectEcosystemSignals(candidate)
      const overlap = candidateSignals.filter((signal) => sourceSignals.has(signal))
      const explicitMatch = explicit.has(slug)
      const authorityBoost = normalizeEcosystemFields(candidate).authoritySupernode ? 1 : 0
      const relationshipScore = overlap.length * 2 + (explicitMatch ? 5 : 0) + authorityBoost

      return {
        ...candidate,
        relatedOverlap: overlap.map(formatDisplayLabel).filter(Boolean).slice(0, 4),
        relatedScore: relationshipScore,
        relationshipReason: explicitMatch ? 'Workbook semantic neighbor' : 'Shared ecosystem signals',
      }
    })
    .filter((candidate) => candidate.relatedScore > 1)
    .sort((a, b) => b.relatedScore - a.relatedScore || safeLower(a?.name).localeCompare(safeLower(b?.name)))
    .slice(0, limit)
}

export function getComparisonTargets(record: any, records: any[], limit = 4) {
  const fields = normalizeEcosystemFields(record)
  const candidateSlugs = new Set(fields.comparisonCandidates)

  return records
    .filter((candidate) => candidateSlugs.has(safeSlug(candidate?.slug || candidate?.name)))
    .slice(0, limit)
    .map((candidate) => ({
      ...candidate,
      comparisonFrame: 'Commonly compared in the workbook ecosystem; review evidence and safety side by side.',
    }))
}
