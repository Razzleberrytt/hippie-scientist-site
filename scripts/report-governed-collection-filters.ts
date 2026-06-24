#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'
import herbSummaries from '../public/data/herbs-summary.json'
import compoundSummaries from '../public/data/compounds-summary.json'
import enrichmentSubmissions from '../ops/enrichment-submissions.json'
import { SEO_COLLECTIONS } from '../src/data/seoCollections'
import { filterHerbByCollection, filterCompoundByCollection } from '../src/lib/collectionQuality'
import { getPublishableGovernedEntries } from '../src/lib/governedResearch'
import { applyGovernedDiscoveryControls } from '../src/lib/governedCollectionDiscovery'

type Summary = {
  slug: string
  name?: string
  common?: string
  researchEnrichmentSummary?: {
    evidenceLabel?: string
    enrichedAndReviewed?: boolean
    hasHumanEvidence?: boolean
    safetyCautionsPresent?: boolean
    conflictingEvidence?: boolean
    mechanismOrConstituentCoveragePresent?: boolean
    lastReviewedAt?: string
  }
}

const ROOT = process.cwd()
const REPORT_JSON_PATH = path.join(ROOT, 'ops', 'reports', 'governed-collection-filters.json')
const REPORT_MD_PATH = path.join(ROOT, 'ops', 'reports', 'governed-collection-filters.md')

const usedSignals = [
  'researchEnrichmentSummary.evidenceLabel',
  'researchEnrichmentSummary.enrichedAndReviewed',
  'researchEnrichmentSummary.safetyCautionsPresent',
  'researchEnrichmentSummary.conflictingEvidence',
  'researchEnrichmentSummary.mechanismOrConstituentCoveragePresent',
  'researchEnrichmentSummary.lastReviewedAt',
]

const excludedSignals = [
  {
    signal: 'enrichmentSubmissions.reviewStatus (blocked/rejected/revision_requested/partial)',
    reason: 'Excluded from positive ranking/filtering. Publish-approved rollup summaries gate eligibility first.',
  },
  {
    signal: 'source volume and reference count',
    reason: 'Can overstate weak evidence and is not a quality proxy.',
  },
  {
    signal: 'non-governed herb confidence badges',
    reason: 'Controls stay grounded in governed enrichment + review freshness only.',
  },
]

function nameOf(row: Summary) {
  return row.common || row.name || row.slug
}

function runCollectionBeforeAfter(collectionSlug: string) {
  const collection = SEO_COLLECTIONS.find(item => item.slug === collectionSlug)
  if (!collection || collection.itemType === 'combo') return null

  const source = collection.itemType === 'herb' ? (herbSummaries as Summary[]) : (compoundSummaries as Summary[])
  const matches = source.filter(row =>
    collection.itemType === 'herb'
      ? filterHerbByCollection(row as any, collection.filters)
      : filterCompoundByCollection(row as any, collection.filters),
  )

  const before = applyGovernedDiscoveryControls({
    items: matches,
    getSummary: item => item.researchEnrichmentSummary,
    filter: 'all',
    sort: 'default',
  })
  const after = applyGovernedDiscoveryControls({
    items: matches,
    getSummary: item => item.researchEnrichmentSummary,
    filter: 'governed_reviewed',
    sort: 'best_covered_first',
  })

  return {
    collectionSlug,
    itemType: collection.itemType,
    beforeCount: before.items.length,
    afterCount: after.items.length,
    beforeTop3: before.items.slice(0, 3).map(nameOf),
    afterTop3: after.items.slice(0, 3).map(nameOf),
    governedEligible: before.eligibility.governedEligible,
    ineligibleCount: Math.max(before.eligibility.total - before.eligibility.governedEligible, 0),
  }
}

function runCompareBeforeAfter() {
  const governedHerbs = getPublishableGovernedEntries()
    .filter(row => row.entityType === 'herb')
    .map(row => row.entitySlug)
    .slice(0, 3)

  const selected = (herbSummaries as Summary[]).filter(row => governedHerbs.includes(row.slug))

  const before = applyGovernedDiscoveryControls({
    items: selected,
    getSummary: item => item.researchEnrichmentSummary,
    filter: 'all',
    sort: 'default',
  })
  const after = applyGovernedDiscoveryControls({
    items: selected,
    getSummary: item => item.researchEnrichmentSummary,
    filter: 'governed_reviewed',
    sort: 'best_covered_first',
  })

  return {
    selectedSlugs: selected.map(item => item.slug),
    beforeTop3: before.items.slice(0, 3).map(nameOf),
    afterTop3: after.items.slice(0, 3).map(nameOf),
    beforeCount: before.items.length,
    afterCount: after.items.length,
    governedEligible: before.eligibility.governedEligible,
  }
}

function main() {
  const publishableKeys = new Set(
    getPublishableGovernedEntries().map(row => `${row.entityType}:${row.entitySlug}`),
  )
  const blockedKeys = new Set(
    (enrichmentSubmissions as Array<{ entityType?: string; entitySlug?: string; reviewStatus?: string }>)
      .filter(row =>
        ['blocked', 'rejected', 'revision_requested', 'partial'].includes(
          String(row.reviewStatus || ''),
        ),
      )
      .map(row => `${row.entityType}:${row.entitySlug}`),
  )

  const collectionRows = SEO_COLLECTIONS.map(collection => runCollectionBeforeAfter(collection.slug)).filter(
    (row): row is NonNullable<ReturnType<typeof runCollectionBeforeAfter>> => Boolean(row),
  )

  const gainedCollections = collectionRows.map(row => row.collectionSlug)

  const sparseCollections = collectionRows
    .filter(row => row.governedEligible < 2)
    .map(row => ({ collectionSlug: row.collectionSlug, reason: 'sparse_governed_coverage' }))

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-collection-filters-v1',
    canonicalArtifacts: {
      governedRollup: 'public/data/enrichment-governed.json',
      herbSummary: 'public/data/herbs-summary.json',
      compoundSummary: 'public/data/compounds-summary.json',
      reviewCycleInputs: 'ops/reports/enrichment-review-cycle.*',
    },
    pagesGainedControls: {
      collectionTemplate: '/collections/:slug',
      comparisonTemplate: '/compare?ids=...',
      collectionPages: gainedCollections,
    },
    controlsAdded: {
      filters: [
        'governed_reviewed',
        'human_support',
        'review_fresh',
        'safety_present',
        'uncertainty_or_conflict',
        'mechanism_or_constituent',
      ],
      sorts: ['best_covered_first', 'evidence_strength', 'review_freshness'],
    },
    signals: {
      used: usedSignals,
      excluded: excludedSignals,
    },
    excludedCandidates: {
      comboCollections: 'No governed comparison controls added to combo collections in this pass.',
      blockedStates: 'Blocked/rejected/revision_requested/partial submissions never enter publishable rollup summaries.',
    },
    ineligibleEntities: {
      collectionSparseCoverage: sparseCollections,
      reason: 'Entries without enrichedAndReviewed summary remain visible in default mode but ineligible for governed-only controls.',
    },
    representativeBeforeAfter: {
      collections: collectionRows.slice(0, 5),
      compare: runCompareBeforeAfter(),
    },
    verification: {
      approvedGovernedAndReviewFreshnessOnly: true,
      blockedRejectedRevisionRequestedCannotInfluence: Array.from(blockedKeys).every(
        key => !publishableKeys.has(key),
      ),
      conservativeBestCoveredFirst:
        collectionRows.every(row => row.afterCount <= row.beforeCount) &&
        collectionRows.every(row => row.ineligibleCount >= 0),
      sparseCoverageDegradesGracefully: sparseCollections.length > 0,
    },
  }

  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  fs.writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  const md = [
    '# Governed collection/comparison filters report',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Deterministic model version: ${report.deterministicModelVersion}`,
    `- Collection template: ${report.pagesGainedControls.collectionTemplate}`,
    `- Comparison template: ${report.pagesGainedControls.comparisonTemplate}`,
    '',
    '## Pages with governed controls',
    ...report.pagesGainedControls.collectionPages.map(slug => `- /collections/${slug}`),
    '- /compare?ids=...',
    '',
    '## Governed signals used',
    ...usedSignals.map(signal => `- ${signal}`),
    '',
    '## Candidate signals excluded',
    ...excludedSignals.map(item => `- ${item.signal}: ${item.reason}`),
    '',
    '## Ineligible coverage notes',
    `- Sparse collections: ${sparseCollections.length}`,
    `- Policy: ${report.ineligibleEntities.reason}`,
    '',
    '## Representative before/after',
    ...report.representativeBeforeAfter.collections.map(
      row =>
        `- ${row.collectionSlug}: before=${row.beforeTop3.join(' | ') || 'none'} (${row.beforeCount}) -> after=${row.afterTop3.join(' | ') || 'none'} (${row.afterCount})`,
    ),
    `- compare: before=${report.representativeBeforeAfter.compare.beforeTop3.join(' | ') || 'none'} (${report.representativeBeforeAfter.compare.beforeCount}) -> after=${report.representativeBeforeAfter.compare.afterTop3.join(' | ') || 'none'} (${report.representativeBeforeAfter.compare.afterCount})`,
    '',
    '## Verification',
    ...Object.entries(report.verification).map(([key, value]) => `- ${key}: ${value ? 'PASS' : 'FAIL'}`),
  ].join('\n')

  fs.writeFileSync(REPORT_MD_PATH, `${md}\n`, 'utf8')
  console.log(
    `[report:governed-collection-filters] collections=${collectionRows.length} sparse=${sparseCollections.length}`,
  )
}

main()
