import fs from 'node:fs'
import path from 'node:path'

type EntityType = 'herb' | 'compound'
type SurfaceType = 'entity_detail' | 'collection' | 'comparison' | 'browse_search' | 'linking'
type HealthState =
  | 'healthy'
  | 'partial'
  | 'stale'
  | 'blocked'
  | 'missing_governed_enrichment'
  | 'surface_out_of_sync'

type PriorityLabel =
  | 'do_now'
  | 'next_wave'
  | 're_review_needed'
  | 'governance_fix_needed'
  | 'low_priority'
  | 'defer'

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
}

type SurfaceHealthRecord = {
  surfaceType: SurfaceType
  surfaceSlug: string
  entityType?: EntityType | 'mixed'
  enrichmentHealthState: HealthState
  blockedReasons: string[]
  outOfSyncSignals: string[]
  usageCount: number
  governedCoverageCount: number
  staleCoverageCount: number
}

type HealthReport = {
  generatedAt: string
  policy: {
    staleDays: number
    publishableEditorialStatuses: string[]
    requiredCoverageTopics: string[]
    governedArtifact: string
  }
  entities: EntityHealthRecord[]
  surfaces: SurfaceHealthRecord[]
}

type PublicationManifest = {
  entities?: {
    herbs?: Array<{ slug: string }>
    compounds?: Array<{ slug: string }>
  }
}

type SeoPriorityReport = {
  topHerbs?: Array<{ slug: string; score?: number }>
  topCompounds?: Array<{ slug: string; score?: number }>
  topCollections?: Array<{ slug: string; score?: number; why?: { indexable?: boolean } }>
}

type ConversionScoreRow = {
  entityType?: string
  slug?: string
  pageViews?: number
  status?: string
}

type ConversionScoreReport = {
  rows?: ConversionScoreRow[]
}

type AffiliateReadinessReport = {
  entries?: Array<{
    entityType?: string
    entitySlug?: string
    renderEligible?: boolean
    stale?: boolean
  }>
}

type BacklogItem = {
  itemType: 'entity' | 'surface'
  entityType?: EntityType
  entitySlug?: string
  surfaceType?: SurfaceType
  surfaceId?: string
  currentPublicStatus: string
  currentEnrichmentHealthState: HealthState | Exclude<HealthState, 'surface_out_of_sync'>
  priorityLabel: PriorityLabel
  recommendedAction: string
  missingTopics: string[]
  blockedReasons: string[]
  staleStatus: {
    stale: boolean
    reviewedAt: string | null
  }
  publicPriorityScore: number
  whyThisMattersNow: string
}

const ROOT = process.cwd()
const HEALTH_REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-health.json')
const PUBLICATION_MANIFEST_PATH = path.join(ROOT, 'public', 'data', 'publication-manifest.json')
const SEO_PRIORITY_PATH = path.join(ROOT, 'public', 'data', 'seo-priority-report.json')
const CONVERSION_SCORECARD_PATH = path.join(ROOT, 'ops', 'reports', 'conversion-scorecard.json')
const AFFILIATE_READINESS_PATH = path.join(ROOT, 'public', 'data', 'affiliate-recommendation-readiness.json')
const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'enrichment-backlog.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'enrichment-backlog.md')

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function maybeReadJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null
  return readJson<T>(filePath)
}

function entityKey(entityType: string, slug: string) {
  return `${entityType}:${String(slug || '').trim().toLowerCase()}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function buildPrioritySignals(args: {
  health: HealthReport
  publication: PublicationManifest
  seoPriority: SeoPriorityReport
  conversion: ConversionScoreReport | null
  affiliateReadiness: AffiliateReadinessReport | null
}) {
  const { health, publication, seoPriority, conversion, affiliateReadiness } = args

  const indexableManifest = new Set<string>([
    ...(publication.entities?.herbs || []).map(row => entityKey('herb', row.slug)),
    ...(publication.entities?.compounds || []).map(row => entityKey('compound', row.slug)),
  ])

  const seoScoreByEntity = new Map<string, number>()
  ;(seoPriority.topHerbs || []).forEach((row, index) => {
    seoScoreByEntity.set(entityKey('herb', row.slug), clamp(40 - index * 3, 5, 40))
  })
  ;(seoPriority.topCompounds || []).forEach((row, index) => {
    seoScoreByEntity.set(entityKey('compound', row.slug), clamp(40 - index * 3, 5, 40))
  })

  const conversionByEntity = new Map<string, ConversionScoreRow>()
  ;(conversion?.rows || []).forEach(row => {
    const entityType = row.entityType === 'herb' || row.entityType === 'compound' ? row.entityType : null
    const slug = String(row.slug || '').trim().toLowerCase()
    if (!entityType || !slug) return
    conversionByEntity.set(entityKey(entityType, slug), row)
  })

  const affiliateByEntity = new Map<string, { renderEligible: boolean; stale: boolean }>()
  ;(affiliateReadiness?.entries || []).forEach(row => {
    const entityType = row.entityType === 'herb' || row.entityType === 'compound' ? row.entityType : null
    const slug = String(row.entitySlug || '').trim().toLowerCase()
    if (!entityType || !slug) return
    affiliateByEntity.set(entityKey(entityType, slug), {
      renderEligible: row.renderEligible === true,
      stale: row.stale === true,
    })
  })

  const scoreEntity = (entity: EntityHealthRecord): number => {
    const key = entityKey(entity.entityType, entity.entitySlug)
    let score = 0

    if (entity.publicStatus === 'indexable') score += 50
    else if (entity.publicStatus === 'non_indexable') score += 12

    if (indexableManifest.has(key)) score += 10

    score += seoScoreByEntity.get(key) || 0

    if (entity.surfaceUsage.some(usage => usage.startsWith('collection:'))) score += 8
    if (entity.surfaceUsage.some(usage => usage.includes('browse'))) score += 6
    if (entity.surfaceUsage.some(usage => usage.startsWith('linking:'))) score += 6

    const conversionRow = conversionByEntity.get(key)
    if (conversionRow) {
      const pageViews = Number(conversionRow.pageViews || 0)
      score += clamp(Math.log10(pageViews + 1) * 7, 0, 20)
      if (conversionRow.status === 'strong performer') score += 12
      if (conversionRow.status === 'tool-first opportunity' || conversionRow.status === 'affiliate opportunity') {
        score += 9
      }
      if (conversionRow.status === 'trust-friction suspected') score += 5
    }

    const affiliateRow = affiliateByEntity.get(key)
    if (affiliateRow?.renderEligible) score += 5

    return Number(score.toFixed(2))
  }

  const scoreSurface = (surface: SurfaceHealthRecord): number => {
    let score = 0

    if (surface.surfaceType === 'browse_search') score += 45
    if (surface.surfaceType === 'collection') score += 36
    if (surface.surfaceType === 'linking') score += 34
    if (surface.surfaceType === 'comparison') score += 32
    if (surface.surfaceType === 'entity_detail') score += 24

    score += clamp(surface.usageCount * 0.9, 0, 24)
    score += clamp(surface.staleCoverageCount * 0.5, 0, 10)

    if (surface.enrichmentHealthState === 'surface_out_of_sync') score += 18
    if (surface.enrichmentHealthState === 'missing_governed_enrichment') score += 12
    if (surface.enrichmentHealthState === 'blocked') score += 12

    if (surface.blockedReasons.some(reason => reason.includes('insufficient-governed-coverage'))) score += 10

    return Number(score.toFixed(2))
  }

  return { scoreEntity, scoreSurface, seoPriority, affiliateByEntity }
}

function classifyEntityPriority(entity: EntityHealthRecord, priorityScore: number): PriorityLabel {
  const highValue = priorityScore >= 75
  const mediumValue = priorityScore >= 50

  if (entity.enrichmentHealthState === 'blocked') return 'governance_fix_needed'
  if (entity.stale) return 're_review_needed'

  if (entity.enrichmentHealthState === 'missing_governed_enrichment') {
    if (entity.publicStatus === 'indexable' && highValue) return 'do_now'
    if (entity.publicStatus === 'indexable' || mediumValue) return 'next_wave'
    return 'defer'
  }

  if (entity.enrichmentHealthState === 'partial') {
    if (entity.publicStatus === 'indexable' && entity.missingTopics.includes('safety')) return 'do_now'
    if (highValue || mediumValue) return 'next_wave'
    return 'low_priority'
  }

  if (entity.enrichmentHealthState === 'healthy') {
    return entity.publicStatus === 'indexable' ? 'low_priority' : 'defer'
  }

  return 'low_priority'
}

function classifySurfacePriority(surface: SurfaceHealthRecord, priorityScore: number): PriorityLabel {
  const highValue = priorityScore >= 80
  const mediumValue = priorityScore >= 55

  if (surface.enrichmentHealthState === 'blocked') return 'governance_fix_needed'
  if (surface.enrichmentHealthState === 'surface_out_of_sync') return highValue ? 'do_now' : 'next_wave'
  if (surface.staleCoverageCount > 0) return 're_review_needed'

  if (surface.enrichmentHealthState === 'missing_governed_enrichment') {
    if (highValue) return 'do_now'
    if (mediumValue) return 'next_wave'
    return 'defer'
  }

  if (surface.enrichmentHealthState === 'partial') {
    return mediumValue ? 'next_wave' : 'low_priority'
  }

  return 'low_priority'
}

function recommendEntityAction(entity: EntityHealthRecord, priorityLabel: PriorityLabel): string {
  if (priorityLabel === 'governance_fix_needed') {
    return 'Resolve editorial/governance blockers (publishability, source linkage, and inactive references) before new enrichment expansion.'
  }
  if (priorityLabel === 're_review_needed') {
    return 'Run a governed re-review pass, refresh evidence/safety checks, and update lastReviewedAt.'
  }
  if (entity.missingTopics.includes('safety')) {
    return 'Prioritize safety enrichment (interactions, contraindications, adverse effects) and evidence-linked cautions.'
  }
  if (entity.missingTopics.includes('evidence')) {
    return 'Backfill evidence grading and supported/unsupported use claims with source-linked provenance.'
  }
  if (entity.missingTopics.includes('mechanism') || entity.missingTopics.includes('constituent')) {
    return 'Backfill mechanism/constituent sections to support comparisons, linking, and collection summaries.'
  }
  if (priorityLabel === 'do_now' || priorityLabel === 'next_wave') {
    return 'Complete missing governed enrichment topics and rerun health/discovery/collection verification scripts.'
  }
  if (priorityLabel === 'defer') {
    return 'Defer until the entity is promoted into an indexable or campaign-priority surface.'
  }
  return 'No immediate action required beyond routine monitoring.'
}

function recommendSurfaceAction(surface: SurfaceHealthRecord, priorityLabel: PriorityLabel): string {
  if (priorityLabel === 'governance_fix_needed') {
    return 'Address governance checks blocking this surface and re-run surface verification before release.'
  }
  if (priorityLabel === 're_review_needed') {
    return 'Refresh stale governed entities feeding this surface and regenerate derived summaries.'
  }
  if (surface.enrichmentHealthState === 'surface_out_of_sync') {
    return 'Fix out-of-sync summary/linking payloads and rerun enrichment discovery/rendering verification.'
  }
  if (surface.enrichmentHealthState === 'missing_governed_enrichment') {
    return 'Backfill governed coverage for dependent entities before enabling this surface for enriched highlights.'
  }
  if (priorityLabel === 'defer') {
    return 'Keep deferred; no immediate customer-visible risk under current governance rules.'
  }
  return 'Monitor and refresh after next governed enrichment wave.'
}

function run() {
  const health = readJson<HealthReport>(HEALTH_REPORT_PATH)
  const publication = readJson<PublicationManifest>(PUBLICATION_MANIFEST_PATH)
  const seoPriority = readJson<SeoPriorityReport>(SEO_PRIORITY_PATH)
  const conversion = maybeReadJson<ConversionScoreReport>(CONVERSION_SCORECARD_PATH)
  const affiliateReadiness = maybeReadJson<AffiliateReadinessReport>(AFFILIATE_READINESS_PATH)

  const signals = buildPrioritySignals({ health, publication, seoPriority, conversion, affiliateReadiness })

  const entityItems: BacklogItem[] = health.entities.map(entity => {
    const publicPriorityScore = signals.scoreEntity(entity)
    const priorityLabel = classifyEntityPriority(entity, publicPriorityScore)
    const whyParts = [
      entity.publicStatus === 'indexable' ? 'public and indexable' : 'not currently indexable',
      `health state=${entity.enrichmentHealthState}`,
      entity.missingTopics.length ? `missing topics=${entity.missingTopics.join(',')}` : null,
      entity.stale ? 'stale review metadata' : null,
      entity.surfaceUsage.length ? `used by ${entity.surfaceUsage.length} surfaces` : null,
    ].filter(Boolean)

    return {
      itemType: 'entity',
      entityType: entity.entityType,
      entitySlug: entity.entitySlug,
      currentPublicStatus: entity.publicStatus,
      currentEnrichmentHealthState: entity.enrichmentHealthState,
      priorityLabel,
      recommendedAction: recommendEntityAction(entity, priorityLabel),
      missingTopics: entity.missingTopics,
      blockedReasons: Array.from(new Set([...entity.blockedReasons, ...entity.outOfSyncSignals])).sort(),
      staleStatus: {
        stale: entity.stale,
        reviewedAt: entity.reviewedAt,
      },
      publicPriorityScore,
      whyThisMattersNow: whyParts.join('; '),
    }
  })

  const surfaceItems: BacklogItem[] = health.surfaces.map(surface => {
    const publicPriorityScore = signals.scoreSurface(surface)
    const priorityLabel = classifySurfacePriority(surface, publicPriorityScore)
    const whyParts = [
      `surface type=${surface.surfaceType}`,
      `health state=${surface.enrichmentHealthState}`,
      `usage=${surface.usageCount}`,
      surface.blockedReasons.length ? `blocked=${surface.blockedReasons.join(',')}` : null,
      surface.staleCoverageCount > 0 ? `stale coverage count=${surface.staleCoverageCount}` : null,
    ].filter(Boolean)

    return {
      itemType: 'surface',
      surfaceType: surface.surfaceType,
      surfaceId: surface.surfaceSlug,
      currentPublicStatus: surface.surfaceType === 'collection' ? 'indexable_collection_surface' : 'public_surface',
      currentEnrichmentHealthState: surface.enrichmentHealthState,
      priorityLabel,
      recommendedAction: recommendSurfaceAction(surface, priorityLabel),
      missingTopics: [],
      blockedReasons: Array.from(new Set([...surface.blockedReasons, ...surface.outOfSyncSignals])).sort(),
      staleStatus: {
        stale: surface.staleCoverageCount > 0,
        reviewedAt: null,
      },
      publicPriorityScore,
      whyThisMattersNow: whyParts.join('; '),
    }
  })

  const allItems = [...entityItems, ...surfaceItems].sort((a, b) => {
    if (b.publicPriorityScore !== a.publicPriorityScore) return b.publicPriorityScore - a.publicPriorityScore
    const aKey = a.itemType === 'entity' ? `${a.entityType}:${a.entitySlug}` : `${a.surfaceType}:${a.surfaceId}`
    const bKey = b.itemType === 'entity' ? `${b.entityType}:${b.entitySlug}` : `${b.surfaceType}:${b.surfaceId}`
    return aKey.localeCompare(bKey)
  })

  const countsByPriority = allItems.reduce<Record<PriorityLabel, number>>(
    (acc, item) => {
      acc[item.priorityLabel] += 1
      return acc
    },
    {
      do_now: 0,
      next_wave: 0,
      re_review_needed: 0,
      governance_fix_needed: 0,
      low_priority: 0,
      defer: 0,
    },
  )

  const groupedViews = {
    highValuePublicMissingCriticalSafety: entityItems.filter(
      item =>
        item.currentPublicStatus === 'indexable' &&
        item.missingTopics.includes('safety') &&
        item.publicPriorityScore >= 70,
    ),
    highValuePublicNeedsEvidenceOrConflictReview: entityItems.filter(
      item =>
        item.currentPublicStatus === 'indexable' &&
        item.publicPriorityScore >= 65 &&
        (item.missingTopics.includes('evidence') ||
          item.blockedReasons.some(reason => reason.includes('conflict') || reason.includes('editorial'))),
    ),
    staleReviewedEntitiesNeedingRefresh: entityItems.filter(item => item.staleStatus.stale),
    collectionAndDiscoverySurfacesBlockedByGovernedGaps: surfaceItems.filter(
      item =>
        (item.surfaceType === 'collection' ||
          item.surfaceType === 'browse_search' ||
          item.surfaceType === 'comparison' ||
          item.surfaceType === 'linking') &&
        (item.currentEnrichmentHealthState === 'missing_governed_enrichment' ||
          item.currentEnrichmentHealthState === 'surface_out_of_sync' ||
          item.currentEnrichmentHealthState === 'partial'),
    ),
    lowPrioritySafeToDefer: allItems.filter(
      item => item.priorityLabel === 'defer' || item.priorityLabel === 'low_priority',
    ),
  }

  const nextWaveCandidates = entityItems
    .filter(item => item.priorityLabel === 'next_wave')
    .sort((a, b) => b.publicPriorityScore - a.publicPriorityScore)
    .slice(0, 15)

  const topImmediateActions = allItems
    .filter(item => item.priorityLabel === 'do_now' || item.priorityLabel === 'governance_fix_needed')
    .slice(0, 12)

  const biggestGovernanceBlockers = entityItems
    .filter(item => item.priorityLabel === 'governance_fix_needed')
    .sort((a, b) => b.publicPriorityScore - a.publicPriorityScore)
    .slice(0, 12)

  const report = {
    generatedAt: new Date().toISOString(),
    sources: {
      enrichmentHealth: path.relative(ROOT, HEALTH_REPORT_PATH),
      publicationManifest: path.relative(ROOT, PUBLICATION_MANIFEST_PATH),
      seoPriorityReport: path.relative(ROOT, SEO_PRIORITY_PATH),
      conversionScorecard: conversion ? path.relative(ROOT, CONVERSION_SCORECARD_PATH) : null,
      affiliateReadiness: affiliateReadiness ? path.relative(ROOT, AFFILIATE_READINESS_PATH) : null,
    },
    policy: {
      deterministicPriorityModel: true,
      labels: ['do_now', 'next_wave', 're_review_needed', 'governance_fix_needed', 'low_priority', 'defer'],
      scoringInputs: [
        'public/indexable status',
        'enrichment health state',
        'missing topic coverage',
        'stale review status',
        'blocked reasons',
        'surface dependency',
        'seo priority signals',
        'conversion/affiliate reports (when available)',
      ],
    },
    summary: {
      totalItems: allItems.length,
      totalEntityItems: entityItems.length,
      totalSurfaceItems: surfaceItems.length,
      countsByPriority,
      topImmediateActions,
      biggestGovernanceBlockers,
      bestNextBackfillWaveCandidates: nextWaveCandidates,
    },
    groupedViews,
    items: allItems,
  }

  const md = [
    '# Enrichment Operations Backlog',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Total items by priority bucket',
    ...Object.entries(countsByPriority).map(([label, count]) => `- ${label}: ${count}`),
    '',
    '## Top immediate actions',
    ...(topImmediateActions.length
      ? topImmediateActions.map(item => {
          const id = item.itemType === 'entity' ? `${item.entityType}:${item.entitySlug}` : `${item.surfaceType}:${item.surfaceId}`
          return `- ${id} -> ${item.priorityLabel} (score=${item.publicPriorityScore}) :: ${item.recommendedAction}`
        })
      : ['- none']),
    '',
    '## Biggest governance blockers',
    ...(biggestGovernanceBlockers.length
      ? biggestGovernanceBlockers.map(item => {
          const id = `${item.entityType}:${item.entitySlug}`
          const reasons = item.blockedReasons.join(', ') || 'none listed'
          return `- ${id} (score=${item.publicPriorityScore}) reasons=${reasons}`
        })
      : ['- none']),
    '',
    '## Best candidates for next backfill wave',
    ...(nextWaveCandidates.length
      ? nextWaveCandidates.map(item => {
          const id = `${item.entityType}:${item.entitySlug}`
          return `- ${id} (score=${item.publicPriorityScore}) missing=${item.missingTopics.join(',') || 'none'}`
        })
      : ['- none']),
    '',
    '## Grouped planning views',
    `- high-value public entities missing critical safety enrichment: ${groupedViews.highValuePublicMissingCriticalSafety.length}`,
    `- high-value public entities needing evidence/conflict review: ${groupedViews.highValuePublicNeedsEvidenceOrConflictReview.length}`,
    `- stale reviewed entities needing refresh: ${groupedViews.staleReviewedEntitiesNeedingRefresh.length}`,
    `- collections/discovery surfaces blocked by governed enrichment gaps: ${groupedViews.collectionAndDiscoverySurfacesBlockedByGovernedGaps.length}`,
    `- low-priority items safe to defer: ${groupedViews.lowPrioritySafeToDefer.length}`,
    '',
  ].join('\n')

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(OUTPUT_MD, md, 'utf8')

  console.log(
    `[report-enrichment-backlog] wrote ${path.relative(ROOT, OUTPUT_JSON)} items=${allItems.length} do_now=${countsByPriority.do_now} next_wave=${countsByPriority.next_wave}`,
  )
  console.log(`[report-enrichment-backlog] wrote ${path.relative(ROOT, OUTPUT_MD)}`)
}

run()
