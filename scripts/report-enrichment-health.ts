import fs from 'node:fs'
import path from 'node:path'
import { SEO_COLLECTIONS } from '../src/data/seoCollections'
import { filterCompoundByCollection, filterHerbByCollection } from '../src/lib/collectionQuality'
import { buildGovernedCollectionSummary } from '../src/lib/collectionEnrichment'
import {
  buildEnrichmentRecommendations,
  type RecommendationSignalType,
} from '../src/lib/enrichmentRecommendations'
import { isPublishableGovernedEnrichment } from '../src/lib/governedResearch'
import type { ResearchEnrichment } from '../src/types/researchEnrichment'

type EntityType = 'herb' | 'compound'
type HealthState =
  | 'healthy'
  | 'partial'
  | 'stale'
  | 'blocked'
  | 'missing_governed_enrichment'
  | 'surface_out_of_sync'

type GovernedRow = {
  entityType: EntityType
  entitySlug: string
  researchEnrichment: ResearchEnrichment & {
    sourceRegistryIds?: string[]
  }
}

type SurfaceRecord = {
  surfaceType: 'entity_detail' | 'collection' | 'comparison' | 'browse_search' | 'linking'
  surfaceSlug: string
  entityType?: EntityType | 'mixed'
  enrichmentHealthState: HealthState
  blockedReasons: string[]
  outOfSyncSignals: string[]
  usageCount: number
  governedCoverageCount: number
  staleCoverageCount: number
}

type EntityHealthRecord = {
  entityType: EntityType
  entitySlug: string
  publicStatus: 'indexable' | 'non_indexable' | 'missing'
  enrichmentHealthState: Exclude<HealthState, 'surface_out_of_sync'>
  reviewedAt: string | null
  stale: boolean
  coverageByTopic: Record<string, boolean>
  blockedReasons: string[]
  missingTopics: string[]
  surfaceUsage: string[]
  outOfSyncSignals: string[]
  lastEvaluatedAt: string
}

const ROOT = process.cwd()
const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'enrichment-health.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'enrichment-health.md')
const STALE_DAYS = 180
const MS_PER_DAY = 24 * 60 * 60 * 1000

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8')) as T
}

function normalizeSlug(value: unknown) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function entityKey(entityType: EntityType, slug: string) {
  return `${entityType}:${normalizeSlug(slug)}`
}

function computeCoverage(enrichment: ResearchEnrichment | null | undefined) {
  if (!enrichment) {
    return {
      evidence: false,
      safety: false,
      mechanism: false,
      constituent: false,
      sourceRegistry: false,
    }
  }

  const sourceIds = Array.isArray((enrichment as GovernedRow['researchEnrichment']).sourceRegistryIds)
    ? ((enrichment as GovernedRow['researchEnrichment']).sourceRegistryIds as string[])
    : []

  return {
    evidence:
      enrichment.supportedUses.length > 0 ||
      enrichment.unsupportedOrUnclearUses.length > 0 ||
      Boolean(enrichment.pageEvidenceJudgment?.evidenceLabel),
    safety:
      enrichment.interactions.length > 0 ||
      enrichment.contraindications.length > 0 ||
      enrichment.adverseEffects.length > 0 ||
      (enrichment.safetyProfile?.summary?.total ?? 0) > 0,
    mechanism: enrichment.mechanisms.length > 0,
    constituent: enrichment.constituents.length > 0,
    sourceRegistry: sourceIds.length > 0,
  }
}

function staleInfo(reviewedAt: string | null) {
  if (!reviewedAt) return { stale: true, ageDays: null as number | null }
  const reviewedMs = Date.parse(reviewedAt)
  if (!Number.isFinite(reviewedMs)) return { stale: true, ageDays: null as number | null }
  const ageDays = Math.floor((Date.now() - reviewedMs) / MS_PER_DAY)
  return { stale: ageDays > STALE_DAYS, ageDays }
}

function classifyEntityHealth(args: {
  indexable: boolean
  enrichment: ResearchEnrichment | null
  coverage: ReturnType<typeof computeCoverage>
  stale: boolean
}): Exclude<HealthState, 'surface_out_of_sync'> {
  const { indexable, enrichment, coverage, stale } = args

  if (!enrichment) return 'missing_governed_enrichment'
  if (!isPublishableGovernedEnrichment(enrichment)) return 'blocked'
  if (stale) return 'stale'

  const hasCoverageGaps = Object.entries(coverage).some(([key, present]) => {
    if (key === 'sourceRegistry') return false
    return !present
  })

  if (hasCoverageGaps || !indexable) return 'partial'
  return 'healthy'
}

function summarizeCounts<T extends string>(rows: Array<{ enrichmentHealthState: T }>) {
  const counts: Record<string, number> = {}
  for (const row of rows) {
    counts[row.enrichmentHealthState] = (counts[row.enrichmentHealthState] || 0) + 1
  }
  return counts
}

function run() {
  const nowIso = new Date().toISOString()
  const sourceRegistry = readJson<Array<{ sourceId: string; active?: boolean }>>(
    'public/data/source-registry.json',
  )
  const sourceRegistryById = new Map(sourceRegistry.map(row => [row.sourceId, row]))

  const governedRows = readJson<GovernedRow[]>('public/data/enrichment-governed.json')
  const herbs = readJson<Array<Record<string, unknown>>>('public/data/herbs.json')
  const compounds = readJson<Array<Record<string, unknown>>>('public/data/compounds.json')
  const herbSummary = readJson<Array<Record<string, unknown>>>('public/data/herbs-summary.json')
  const compoundSummary = readJson<Array<Record<string, unknown>>>('public/data/compounds-summary.json')
  const indexableHerbs = readJson<Array<{ slug: string }>>('public/data/indexable-herbs.json')
  const indexableCompounds = readJson<Array<{ slug: string }>>('public/data/indexable-compounds.json')

  const governedByKey = new Map<string, GovernedRow>()
  for (const row of governedRows) governedByKey.set(entityKey(row.entityType, row.entitySlug), row)

  const indexableKeys = new Set<string>([
    ...indexableHerbs.map(row => entityKey('herb', row.slug)),
    ...indexableCompounds.map(row => entityKey('compound', row.slug)),
  ])

  const allEntityKeys = new Set<string>([
    ...indexableKeys,
    ...governedRows.map(row => entityKey(row.entityType, row.entitySlug)),
  ])

  const entitiesByType = {
    herb: new Set(herbs.map(row => normalizeSlug(row.slug))),
    compound: new Set(compounds.map(row => normalizeSlug(row.slug))),
  }

  const entitySurfaceUsage = new Map<string, Set<string>>()
  const entityOutOfSync = new Map<string, Set<string>>()

  const noteSurfaceUsage = (key: string, usage: string) => {
    const bucket = entitySurfaceUsage.get(key) ?? new Set<string>()
    bucket.add(usage)
    entitySurfaceUsage.set(key, bucket)
  }

  const noteOutOfSync = (key: string, signal: string) => {
    const bucket = entityOutOfSync.get(key) ?? new Set<string>()
    bucket.add(signal)
    entityOutOfSync.set(key, bucket)
  }

  for (const row of herbSummary) noteSurfaceUsage(entityKey('herb', String(row.slug || row.id || '')), 'browse:herbs-summary')
  for (const row of compoundSummary) {
    noteSurfaceUsage(entityKey('compound', String(row.slug || row.id || '')), 'browse:compounds-summary')
  }

  const entityRows: EntityHealthRecord[] = []

  for (const key of Array.from(allEntityKeys).sort()) {
    const [entityTypeRaw, slugRaw] = key.split(':')
    const entityType = entityTypeRaw as EntityType
    const slug = normalizeSlug(slugRaw)
    const existsInCatalog = entitiesByType[entityType].has(slug)
    const publicStatus: EntityHealthRecord['publicStatus'] = indexableKeys.has(key)
      ? 'indexable'
      : existsInCatalog
        ? 'non_indexable'
        : 'missing'

    const governed = governedByKey.get(key)
    const enrichment = governed?.researchEnrichment ?? null
    const coverage = computeCoverage(enrichment)
    const reviewedAt = enrichment?.lastReviewedAt || null
    const staleMeta = staleInfo(reviewedAt)

    const missingTopics = Object.entries(coverage)
      .filter(([topic, present]) => !present && topic !== 'sourceRegistry')
      .map(([topic]) => topic)

    const blockedReasons: string[] = []
    const outOfSyncSignals: string[] = []

    if (governed && !isPublishableGovernedEnrichment(governed.researchEnrichment)) {
      blockedReasons.push(
        `editorialStatus:${governed.researchEnrichment.editorialStatus}`,
        'editorialReadiness.publishable:false',
      )

      const hasClaimRefs = [
        ...governed.researchEnrichment.supportedUses,
        ...governed.researchEnrichment.unsupportedOrUnclearUses,
        ...governed.researchEnrichment.mechanisms,
        ...governed.researchEnrichment.constituents,
        ...governed.researchEnrichment.interactions,
        ...governed.researchEnrichment.contraindications,
        ...governed.researchEnrichment.adverseEffects,
      ].some(claim => Array.isArray(claim.sourceRefIds) && claim.sourceRefIds.length > 0)

      if (hasClaimRefs) {
        outOfSyncSignals.push('source_linked_claims_without_publishable_status')
      }
    }

    if (governed) {
      const sourceIds = governed.researchEnrichment.sourceRegistryIds || []
      const inactiveRefs = sourceIds.filter(sourceId => sourceRegistryById.get(sourceId)?.active === false)
      if (inactiveRefs.length > 0) {
        blockedReasons.push(`inactive_source_refs:${inactiveRefs.join(',')}`)
        outOfSyncSignals.push('inactive_or_deprecated_source_refs_still_referenced')
      }
    }

    const state = classifyEntityHealth({
      indexable: indexableKeys.has(key),
      enrichment,
      coverage,
      stale: staleMeta.stale,
    })

    if (indexableKeys.has(key) && state !== 'healthy') {
      outOfSyncSignals.push('indexable_entity_without_healthy_governed_enrichment')
    }

    for (const signal of outOfSyncSignals) noteOutOfSync(key, signal)

    entityRows.push({
      entityType,
      entitySlug: slug,
      publicStatus,
      enrichmentHealthState: state,
      reviewedAt,
      stale: staleMeta.stale,
      coverageByTopic: coverage,
      blockedReasons,
      missingTopics,
      surfaceUsage: Array.from(entitySurfaceUsage.get(key) || []).sort(),
      outOfSyncSignals: Array.from(new Set(outOfSyncSignals)).sort(),
      lastEvaluatedAt: nowIso,
    })
  }

  const entityByKey = new Map(entityRows.map(row => [entityKey(row.entityType, row.entitySlug), row]))

  const surfaceRows: SurfaceRecord[] = []

  const detailSurfaces = [
    {
      surfaceType: 'entity_detail' as const,
      entityType: 'herb' as const,
      slug: 'herb-pages',
      keys: indexableHerbs.map(row => entityKey('herb', row.slug)),
    },
    {
      surfaceType: 'entity_detail' as const,
      entityType: 'compound' as const,
      slug: 'compound-pages',
      keys: indexableCompounds.map(row => entityKey('compound', row.slug)),
    },
  ]

  for (const surface of detailSurfaces) {
    const rows = surface.keys.map(key => entityByKey.get(key)).filter(Boolean) as EntityHealthRecord[]
    const outOfSyncSignals = rows
      .filter(row => row.enrichmentHealthState !== 'healthy')
      .map(row => `${row.entityType}:${row.entitySlug}:${row.enrichmentHealthState}`)
      .sort()

    for (const key of surface.keys) noteSurfaceUsage(key, `detail:${surface.entityType}`)

    const staleCount = rows.filter(row => row.stale).length
    const governedCoverageCount = rows.filter(row => row.enrichmentHealthState !== 'missing_governed_enrichment').length
    const blockedReasons = rows.flatMap(row => row.blockedReasons).filter(Boolean)

    surfaceRows.push({
      surfaceType: surface.surfaceType,
      surfaceSlug: surface.slug,
      entityType: surface.entityType,
      enrichmentHealthState:
        outOfSyncSignals.length > 0 ? 'surface_out_of_sync' : rows.length > 0 ? 'healthy' : 'partial',
      blockedReasons: Array.from(new Set(blockedReasons)).sort(),
      outOfSyncSignals,
      usageCount: rows.length,
      governedCoverageCount,
      staleCoverageCount: staleCount,
    })
  }

  const browseSurfaces = [
    {
      surfaceSlug: 'browse-herbs-summary',
      entityType: 'herb' as const,
      rows: herbSummary,
    },
    {
      surfaceSlug: 'browse-compounds-summary',
      entityType: 'compound' as const,
      rows: compoundSummary,
    },
  ]

  for (const browse of browseSurfaces) {
    const missingSummary: string[] = []
    const mismatchedSummary: string[] = []
    let governedCoverageCount = 0
    let staleCoverageCount = 0

    for (const row of browse.rows) {
      const slug = normalizeSlug(row.slug || row.id)
      if (!slug) continue
      const key = entityKey(browse.entityType, slug)
      noteSurfaceUsage(key, browse.surfaceSlug)

      const entity = entityByKey.get(key)
      const summary = row.researchEnrichmentSummary as Record<string, unknown> | undefined
      const shouldExposeSummary = entity?.enrichmentHealthState === 'healthy' || entity?.enrichmentHealthState === 'partial' || entity?.enrichmentHealthState === 'stale'

      if (summary) {
        governedCoverageCount += 1
        if (entity?.stale) staleCoverageCount += 1
      }

      if (shouldExposeSummary && !summary) {
        missingSummary.push(`${browse.entityType}:${slug}`)
      }

      if (!shouldExposeSummary && summary) {
        mismatchedSummary.push(`${browse.entityType}:${slug}`)
      }
    }

    const outOfSyncSignals = [
      ...missingSummary.map(value => `missing_summary:${value}`),
      ...mismatchedSummary.map(value => `summary_leak:${value}`),
    ]

    surfaceRows.push({
      surfaceType: 'browse_search',
      surfaceSlug: browse.surfaceSlug,
      entityType: browse.entityType,
      enrichmentHealthState: outOfSyncSignals.length > 0 ? 'surface_out_of_sync' : 'healthy',
      blockedReasons: [],
      outOfSyncSignals,
      usageCount: browse.rows.length,
      governedCoverageCount,
      staleCoverageCount,
    })
  }

  for (const collection of SEO_COLLECTIONS) {
    if (collection.itemType === 'combo') {
      surfaceRows.push({
        surfaceType: 'collection',
        surfaceSlug: collection.slug,
        entityType: 'mixed',
        enrichmentHealthState: 'missing_governed_enrichment',
        blockedReasons: ['combo-collections-not-governed'],
        outOfSyncSignals: [],
        usageCount: 0,
        governedCoverageCount: 0,
        staleCoverageCount: 0,
      })
      continue
    }

    const entities =
      collection.itemType === 'herb'
        ? herbs
            .filter(herb => filterHerbByCollection(herb, collection.filters))
            .map(herb => ({
              entityType: 'herb' as const,
              entitySlug: normalizeSlug(herb.slug),
              entityName: String(herb.common || herb.scientific || herb.name || herb.slug || ''),
            }))
        : compounds
            .filter(compound => filterCompoundByCollection(compound, collection.filters))
            .map(compound => ({
              entityType: 'compound' as const,
              entitySlug: normalizeSlug(compound.slug),
              entityName: String(compound.name || compound.slug || ''),
            }))

    const summary = buildGovernedCollectionSummary(entities.filter(entity => entity.entitySlug))

    for (const entity of entities) {
      noteSurfaceUsage(entityKey(entity.entityType, entity.entitySlug), `collection:${collection.slug}`)
    }

    const outOfSyncSignals: string[] = []
    for (const entity of entities) {
      const key = entityKey(entity.entityType, entity.entitySlug)
      const health = entityByKey.get(key)
      if (health && health.enrichmentHealthState !== 'healthy') {
        outOfSyncSignals.push(`${key}:${health.enrichmentHealthState}`)
      }
    }

    surfaceRows.push({
      surfaceType: 'collection',
      surfaceSlug: collection.slug,
      entityType: collection.itemType,
      enrichmentHealthState:
        summary.governedReviewedCount === 0
          ? 'missing_governed_enrichment'
          : outOfSyncSignals.length > 0
            ? 'surface_out_of_sync'
            : summary.allowComparativeHighlights
              ? 'healthy'
              : 'partial',
      blockedReasons: summary.degradeReasons,
      outOfSyncSignals: outOfSyncSignals.sort(),
      usageCount: summary.includedCount,
      governedCoverageCount: summary.governedReviewedCount,
      staleCoverageCount: summary.governedEntities.filter(entity => staleInfo(entity.lastReviewedAt).stale)
        .length,
    })
  }

  const linkingSignals = new Set<RecommendationSignalType>()
  const linkingOutOfSync: string[] = []
  let linkingUsageCount = 0
  let linkingGovernedCoverageCount = 0

  for (const key of indexableKeys) {
    const [entityTypeRaw, slug] = key.split(':')
    const entityType = entityTypeRaw as EntityType
    const health = entityByKey.get(key)
    if (!health) continue

    noteSurfaceUsage(key, `linking:${entityType}`)
    const bundle = buildEnrichmentRecommendations(entityType, slug)
    const targetRows = [
      ...bundle.relatedHerbs,
      ...bundle.relatedCompounds,
      ...bundle.compareContrast,
      ...bundle.safetyNextSteps,
      ...bundle.mechanismNextSteps,
    ]

    if (targetRows.length > 0) linkingGovernedCoverageCount += 1
    linkingUsageCount += 1

    for (const signal of bundle.activeSignals) linkingSignals.add(signal)

    if (health.enrichmentHealthState === 'missing_governed_enrichment' && targetRows.length > 0) {
      linkingOutOfSync.push(`non_governed_source_leak:${key}`)
    }

    for (const target of targetRows) {
      const targetKey = entityKey(target.targetType, target.targetSlug)
      const targetHealth = entityByKey.get(targetKey)
      if (!targetHealth || targetHealth.enrichmentHealthState === 'missing_governed_enrichment') {
        linkingOutOfSync.push(`target_missing_governed:${key}->${targetKey}`)
      }
    }
  }

  surfaceRows.push({
    surfaceType: 'linking',
    surfaceSlug: 'related-recommendations',
    entityType: 'mixed',
    enrichmentHealthState: linkingOutOfSync.length > 0 ? 'surface_out_of_sync' : 'healthy',
    blockedReasons: [],
    outOfSyncSignals: [...Array.from(linkingSignals).sort(), ...linkingOutOfSync.sort()],
    usageCount: linkingUsageCount,
    governedCoverageCount: linkingGovernedCoverageCount,
    staleCoverageCount: 0,
  })

  const comparisonEntities = Array.from(indexableKeys)
    .map(key => {
      const [entityTypeRaw, slug] = key.split(':')
      return {
        entityType: entityTypeRaw as EntityType,
        entitySlug: slug,
        entityName: slug,
      }
    })
    .filter(entity => entity.entityType === 'herb')
    .slice(0, 3)

  const comparisonSummary = buildGovernedCollectionSummary(comparisonEntities)

  surfaceRows.push({
    surfaceType: 'comparison',
    surfaceSlug: 'compare-page-herb-selection',
    entityType: 'herb',
    enrichmentHealthState:
      comparisonSummary.governedReviewedCount === 0
        ? 'missing_governed_enrichment'
        : comparisonSummary.allowComparativeHighlights
          ? 'healthy'
          : 'partial',
    blockedReasons: comparisonSummary.degradeReasons,
    outOfSyncSignals: [],
    usageCount: comparisonSummary.includedCount,
    governedCoverageCount: comparisonSummary.governedReviewedCount,
    staleCoverageCount: comparisonSummary.governedEntities.filter(entity => staleInfo(entity.lastReviewedAt).stale)
      .length,
  })

  const refreshedEntityRows = entityRows.map(row => ({
    ...row,
    surfaceUsage: Array.from(entitySurfaceUsage.get(entityKey(row.entityType, row.entitySlug)) || []).sort(),
    outOfSyncSignals: Array.from(entityOutOfSync.get(entityKey(row.entityType, row.entitySlug)) || []).sort(),
  }))

  const report = {
    generatedAt: nowIso,
    policy: {
      staleDays: STALE_DAYS,
      publishableEditorialStatuses: ['approved', 'published'],
      requiredCoverageTopics: ['evidence', 'safety', 'mechanism', 'constituent'],
      governedArtifact: 'public/data/enrichment-governed.json',
    },
    summary: {
      entitiesEvaluated: refreshedEntityRows.length,
      surfacesEvaluated: surfaceRows.length,
      entityHealthCounts: summarizeCounts(refreshedEntityRows),
      surfaceHealthCounts: summarizeCounts(surfaceRows),
      publicIndexableEntities: Array.from(indexableKeys).length,
      indexableEntitiesWithoutHealthyState: refreshedEntityRows.filter(
        row => row.publicStatus === 'indexable' && row.enrichmentHealthState !== 'healthy',
      ).length,
      staleEntities: refreshedEntityRows.filter(row => row.stale).length,
      blockedEntities: refreshedEntityRows.filter(row => row.enrichmentHealthState === 'blocked').length,
      missingGovernedEntities: refreshedEntityRows.filter(
        row => row.enrichmentHealthState === 'missing_governed_enrichment',
      ).length,
    },
    entities: refreshedEntityRows,
    surfaces: surfaceRows,
  }

  const contractorSummary = [
    '# Enrichment Health Monitoring Report',
    '',
    `Generated: ${nowIso}`,
    '',
    '## Headline counts',
    `- Entities evaluated: ${report.summary.entitiesEvaluated}`,
    `- Surfaces evaluated: ${report.summary.surfacesEvaluated}`,
    `- Public indexable entities: ${report.summary.publicIndexableEntities}`,
    `- Indexable entities not healthy: ${report.summary.indexableEntitiesWithoutHealthyState}`,
    `- Stale entities (>${STALE_DAYS}d): ${report.summary.staleEntities}`,
    `- Blocked entities: ${report.summary.blockedEntities}`,
    `- Missing governed enrichment entities: ${report.summary.missingGovernedEntities}`,
    '',
    '## Entity health distribution',
    ...Object.entries(report.summary.entityHealthCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([state, count]) => `- ${state}: ${count}`),
    '',
    '## Surface health distribution',
    ...Object.entries(report.summary.surfaceHealthCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([state, count]) => `- ${state}: ${count}`),
    '',
    '## Priority drift/out-of-sync checks',
    ...surfaceRows
      .filter(surface => surface.enrichmentHealthState === 'surface_out_of_sync')
      .sort((a, b) => `${a.surfaceType}:${a.surfaceSlug}`.localeCompare(`${b.surfaceType}:${b.surfaceSlug}`))
      .map(
        surface =>
          `- ${surface.surfaceType}:${surface.surfaceSlug} -> ${surface.outOfSyncSignals.slice(0, 8).join('; ') || 'no explicit signal'}`,
      ),
    '',
    '## Blocked or stale indexable entities (top 20)',
    ...refreshedEntityRows
      .filter(
        row =>
          row.publicStatus === 'indexable' &&
          (row.enrichmentHealthState === 'blocked' ||
            row.enrichmentHealthState === 'stale' ||
            row.enrichmentHealthState === 'missing_governed_enrichment'),
      )
      .slice(0, 20)
      .map(
        row =>
          `- ${row.entityType}:${row.entitySlug} state=${row.enrichmentHealthState} reasons=${[...row.blockedReasons, ...row.outOfSyncSignals].join(',') || 'none'}`,
      ),
    '',
  ].join('\n')

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(OUTPUT_MD, contractorSummary, 'utf8')

  console.log(
    `[report-enrichment-health] wrote ${path.relative(ROOT, OUTPUT_JSON)} entities=${report.summary.entitiesEvaluated} surfaces=${report.summary.surfacesEvaluated}`,
  )
  console.log(`[report-enrichment-health] wrote ${path.relative(ROOT, OUTPUT_MD)}`)
}

run()
