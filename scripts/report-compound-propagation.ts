import fs from 'node:fs'
import path from 'node:path'
import governedArtifact from '../public/data/enrichment-governed.json'
import sourceRegistry from '../public/data/source-registry.json'
import compoundWaveReport from '../ops/reports/compound-enrichment-wave.json'
import herbs from '../public/data/herbs.json'
import { SEO_COLLECTIONS } from '../src/data/seoCollections'
import { filterHerbByCollection } from '../src/lib/collectionQuality'
import {
  buildEnrichmentRecommendationsFromRows,
  buildEnrichmentRecommendationsFromRowsLegacy,
  type GovernedRecommendationRow,
} from '../src/lib/enrichmentRecommendations'
import {
  getPublishableGovernedEntries,
  isPublishableGovernedEnrichment,
} from '../src/lib/governedResearch'

type GovernedRow = GovernedRecommendationRow

type SurfaceDelta = {
  entityType: 'herb' | 'compound'
  entitySlug: string
  gainedRelatedCompounds: string[]
  gainedRelatedHerbs: string[]
  gainedSafetyNextSteps: string[]
  gainedMechanismNextSteps: string[]
}

const ROOT = process.cwd()
const OUT_JSON = path.join(ROOT, 'ops', 'reports', 'compound-propagation.json')
const OUT_MD = path.join(ROOT, 'ops', 'reports', 'compound-propagation.md')
const ENRICHMENT_HEALTH_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-health.json')
const ENRICHMENT_BACKLOG_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-backlog.json')
const GOVERNED_INPUT_PATH = path.join(
  ROOT,
  'public',
  'data',
  'enrichment-submissions-governed-input.jsonl',
)

function keyOf(item: { targetType: 'herb' | 'compound'; targetSlug: string }) {
  return `${item.targetType}:${item.targetSlug}`
}

function parseInputStatuses() {
  const lines = fs
    .readFileSync(GOVERNED_INPUT_PATH, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  const rows = lines.map(line => JSON.parse(line) as Record<string, unknown>)
  const bySlug = new Map<string, Set<string>>()

  for (const row of rows) {
    if (row.entityType !== 'compound') continue
    const slug = String(row.entitySlug || '')
      .trim()
      .toLowerCase()
    if (!slug) continue
    const status = String(row.editorialStatus || 'unknown')
      .trim()
      .toLowerCase()
    const bucket = bySlug.get(slug) ?? new Set<string>()
    bucket.add(status)
    bySlug.set(slug, bucket)
  }

  return bySlug
}

function readJsonIfPresent(filePath: string): Record<string, unknown> | null {
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>
}

function run() {
  const allRows = (governedArtifact as GovernedRow[]).slice().sort((a, b) => {
    const aKey = `${a.entityType}:${a.entitySlug}`
    const bKey = `${b.entityType}:${b.entitySlug}`
    return aKey.localeCompare(bKey)
  })
  const publishableRows = getPublishableGovernedEntries()
  const publishableByKey = new Set(
    publishableRows.map(row => `${row.entityType}:${row.entitySlug}`),
  )

  const sourceRegistryIds = new Set(
    (sourceRegistry as Array<{ sourceId?: string }>)
      .map(row => String(row.sourceId || ''))
      .filter(Boolean),
  )

  const compoundInputStatuses = parseInputStatuses()

  const recommendationSurfaceDeltas: SurfaceDelta[] = []

  for (const source of publishableRows) {
    const legacy = buildEnrichmentRecommendationsFromRowsLegacy(source, publishableRows)
    const current = buildEnrichmentRecommendationsFromRows(source, publishableRows)

    const legacySet = new Set(
      [
        ...legacy.relatedHerbs,
        ...legacy.relatedCompounds,
        ...legacy.safetyNextSteps,
        ...legacy.mechanismNextSteps,
      ].map(keyOf),
    )

    const gainedRelatedCompounds = current.relatedCompounds
      .filter(item => !legacySet.has(keyOf(item)) && item.targetType === 'compound')
      .map(item => item.targetSlug)
      .sort()
    const gainedRelatedHerbs = current.relatedHerbs
      .filter(item => !legacySet.has(keyOf(item)) && item.targetType === 'herb')
      .map(item => item.targetSlug)
      .sort()
    const gainedSafetyNextSteps = current.safetyNextSteps
      .filter(item => !legacySet.has(keyOf(item)))
      .map(item => `${item.targetType}:${item.targetSlug}`)
      .sort()
    const gainedMechanismNextSteps = current.mechanismNextSteps
      .filter(item => !legacySet.has(keyOf(item)))
      .map(item => `${item.targetType}:${item.targetSlug}`)
      .sort()

    if (
      gainedRelatedCompounds.length ||
      gainedRelatedHerbs.length ||
      gainedSafetyNextSteps.length ||
      gainedMechanismNextSteps.length
    ) {
      recommendationSurfaceDeltas.push({
        entityType: source.entityType,
        entitySlug: source.entitySlug,
        gainedRelatedCompounds,
        gainedRelatedHerbs,
        gainedSafetyNextSteps,
        gainedMechanismNextSteps,
      })
    }
  }

  const collectionDeltas = SEO_COLLECTIONS.filter(collection => collection.itemType === 'herb').map(
    collection => {
      const matches = (herbs as Array<Record<string, unknown>>).filter(herb =>
        filterHerbByCollection(herb, collection.filters),
      )
      const governedHerbSlugs = matches
        .map(row => String(row.slug || '').toLowerCase())
        .filter(slug => publishableByKey.has(`herb:${slug}`))

      const legacyCompounds = new Set<string>()
      const currentCompounds = new Set<string>()

      for (const herbSlug of governedHerbSlugs) {
        const source = publishableRows.find(
          row => row.entityType === 'herb' && row.entitySlug === herbSlug,
        )
        if (!source) continue
        const legacy = buildEnrichmentRecommendationsFromRowsLegacy(source, publishableRows)
        const current = buildEnrichmentRecommendationsFromRows(source, publishableRows)
        for (const item of legacy.relatedCompounds) legacyCompounds.add(item.targetSlug)
        for (const item of [
          ...current.relatedCompounds,
          ...current.safetyNextSteps,
          ...current.mechanismNextSteps,
        ]) {
          if (item.targetType === 'compound') currentCompounds.add(item.targetSlug)
        }
      }

      return {
        collectionSlug: collection.slug,
        governedHerbCount: governedHerbSlugs.length,
        relatedGovernedCompoundsBefore: Array.from(legacyCompounds).sort(),
        relatedGovernedCompoundsAfter: Array.from(currentCompounds).sort(),
      }
    },
  )

  const changedCollections = collectionDeltas
    .filter(
      row =>
        row.relatedGovernedCompoundsBefore.join(',') !==
        row.relatedGovernedCompoundsAfter.join(','),
    )
    .sort((a, b) => a.collectionSlug.localeCompare(b.collectionSlug))

  const excludedCandidates = allRows
    .filter(row => row.entityType === 'compound')
    .map(row => {
      const statusSet = compoundInputStatuses.get(row.entitySlug) ?? new Set<string>()
      const statuses = Array.from(statusSet).sort()
      const reasons: string[] = []
      if (!isPublishableGovernedEnrichment(row.researchEnrichment)) {
        reasons.push('not_publishable_for_public_surfaces')
      }
      if (statuses.some(status => ['blocked', 'revision_requested', 'rejected'].includes(status))) {
        reasons.push('blocked_or_rejected_by_governance')
      }
      if (!row.researchEnrichment.relatedEntities?.length) {
        reasons.push('no_explicit_governed_related_entity_links')
      }
      if (
        row.researchEnrichment.mechanisms.length === 0 &&
        row.researchEnrichment.constituents.length === 0 &&
        row.researchEnrichment.interactions.length === 0 &&
        row.researchEnrichment.contraindications.length === 0
      ) {
        reasons.push('no_publish-safe_mechanism_constituent_or_safety_signals')
      }
      return {
        entitySlug: row.entitySlug,
        editorialStatus: row.researchEnrichment.editorialStatus,
        publishable: Boolean(row.researchEnrichment.editorialReadiness?.publishable),
        statuses,
        reasons,
      }
    })
    .sort((a, b) => a.entitySlug.localeCompare(b.entitySlug))

  const herbsWithGains = recommendationSurfaceDeltas
    .filter(row => row.entityType === 'herb' && row.gainedRelatedCompounds.length > 0)
    .map(row => row.entitySlug)
    .sort()

  const compoundsWithGains = recommendationSurfaceDeltas
    .filter(row => row.entityType === 'compound' && row.gainedRelatedHerbs.length > 0)
    .map(row => row.entitySlug)
    .sort()

  const waveDeltas = (compoundWaveReport as Record<string, unknown>)
    .governedCoverageDeltasByCompound as Array<Record<string, unknown>>
  const positiveWaveCompounds = waveDeltas
    .filter(row => Number((row.governedEntriesIncluded as { delta?: number })?.delta || 0) > 0)
    .map(row => String(row.entitySlug || '').toLowerCase())
    .sort()

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'compound-propagation-v1',
    canonicalInputs: {
      compoundWaveResults: 'ops/reports/compound-enrichment-wave.json',
      canonicalSourceRegistry: 'public/data/source-registry.json',
      canonicalGovernedInput: 'public/data/enrichment-submissions-governed-input.jsonl',
      canonicalGovernedArtifact: 'public/data/enrichment-governed.json',
      enrichmentHealth: 'ops/reports/enrichment-health.json',
      enrichmentBacklog: 'ops/reports/enrichment-backlog.json',
    },
    governanceChecks: {
      sourceRegistryCount: sourceRegistryIds.size,
      publishableGovernedEntityCount: publishableRows.length,
      publishableGovernedCompoundCount: publishableRows.filter(row => row.entityType === 'compound')
        .length,
      blockedOrRejectedStatusesDetected: excludedCandidates.filter(candidate =>
        candidate.reasons.includes('blocked_or_rejected_by_governance'),
      ).length,
    },
    beforeAfter: {
      recommendationSurfaceDeltas,
      collectionDeltas: changedCollections,
      herbsWithNewGovernedCompoundLinks: herbsWithGains,
      compoundsWithNewGovernedHerbLinks: compoundsWithGains,
    },
    waveContext: {
      positiveCoverageDeltaCompounds: positiveWaveCompounds,
      enrichmentHealthSummary: readJsonIfPresent(ENRICHMENT_HEALTH_PATH)?.summary || null,
      enrichmentBacklogSummary: readJsonIfPresent(ENRICHMENT_BACKLOG_PATH)?.summary || null,
    },
    excludedRelationshipCandidates: excludedCandidates,
  }

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true })
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  const md = [
    '# Compound Propagation Report',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Deterministic model version: ${report.deterministicModelVersion}`,
    '',
    '## Canonical inputs',
    ...Object.entries(report.canonicalInputs).map(([label, value]) => `- ${label}: ${value}`),
    '',
    '## Governance checks',
    `- publishable governed entities: ${report.governanceChecks.publishableGovernedEntityCount}`,
    `- publishable governed compounds: ${report.governanceChecks.publishableGovernedCompoundCount}`,
    `- blocked/rejected status compounds detected: ${report.governanceChecks.blockedOrRejectedStatusesDetected}`,
    '',
    '## Recommendation surface deltas',
    '| entity | gained related compounds | gained related herbs | gained safety next steps | gained mechanism next steps |',
    '| --- | --- | --- | --- | --- |',
    ...(report.beforeAfter.recommendationSurfaceDeltas.length
      ? report.beforeAfter.recommendationSurfaceDeltas.map(
          row =>
            `| ${row.entityType}:${row.entitySlug} | ${row.gainedRelatedCompounds.join(', ') || 'none'} | ${row.gainedRelatedHerbs.join(', ') || 'none'} | ${row.gainedSafetyNextSteps.join(', ') || 'none'} | ${row.gainedMechanismNextSteps.join(', ') || 'none'} |`,
        )
      : ['| none | none | none | none | none |']),
    '',
    '## Collection/comparison deltas',
    '| collection | governed herb count | related governed compounds before | related governed compounds after |',
    '| --- | ---: | --- | --- |',
    ...(report.beforeAfter.collectionDeltas.length
      ? report.beforeAfter.collectionDeltas.map(
          row =>
            `| ${row.collectionSlug} | ${row.governedHerbCount} | ${row.relatedGovernedCompoundsBefore.join(', ') || 'none'} | ${row.relatedGovernedCompoundsAfter.join(', ') || 'none'} |`,
        )
      : ['| none | 0 | none | none |']),
    '',
    '## Excluded compound relationship candidates',
    '| compound | editorial status | publishable | exclusion reasons |',
    '| --- | --- | --- | --- |',
    ...report.excludedRelationshipCandidates.map(
      row =>
        `| ${row.entitySlug} | ${row.editorialStatus} | ${row.publishable} | ${row.reasons.join(', ') || 'none'} |`,
    ),
    '',
  ]

  fs.writeFileSync(OUT_MD, `${md.join('\n')}\n`, 'utf8')
  console.log(`Wrote ${path.relative(ROOT, OUT_JSON)}`)
  console.log(`Wrote ${path.relative(ROOT, OUT_MD)}`)
}

run()
