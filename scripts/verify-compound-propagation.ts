import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import governedArtifact from '../public/data/enrichment-governed.json'
import {
  buildEnrichmentRecommendations,
  type EnrichmentRecommendation,
} from '../src/lib/enrichmentRecommendations'
import {
  getPublishableGovernedEntries,
  isPublishableGovernedEnrichment,
} from '../src/lib/governedResearch'
import { buildGovernedCollectionSummary } from '../src/lib/collectionEnrichment'

const ROOT = process.cwd()
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'compound-propagation.json')
const GOVERNED_INPUT_PATH = path.join(
  ROOT,
  'public',
  'data',
  'enrichment-submissions-governed-input.jsonl',
)

type GovernedRow = {
  entityType: 'herb' | 'compound'
  entitySlug: string
  researchEnrichment: {
    editorialStatus?: string
    editorialReadiness?: { publishable?: boolean }
  }
}

function collectTargets(items: EnrichmentRecommendation[]) {
  return items.map(item => `${item.targetType}:${item.targetSlug}`)
}

function runGovernanceInfluenceCheck() {
  const publishableRows = getPublishableGovernedEntries()
  const publishableKeySet = new Set(
    publishableRows.map(row => `${row.entityType}:${row.entitySlug}`),
  )

  for (const row of publishableRows) {
    const bundle = buildEnrichmentRecommendations(row.entityType, row.entitySlug)
    const targets = [
      ...collectTargets(bundle.relatedHerbs),
      ...collectTargets(bundle.relatedCompounds),
      ...collectTargets(bundle.compareContrast),
      ...collectTargets(bundle.safetyNextSteps),
      ...collectTargets(bundle.mechanismNextSteps),
    ]

    for (const target of targets) {
      assert.ok(
        publishableKeySet.has(target),
        `Non-publishable recommendation leak detected for ${row.entityType}:${row.entitySlug} -> ${target}`,
      )
    }
  }
}

function runBlockedStatusIsolationCheck() {
  const blockedStatuses = new Set(['blocked', 'rejected', 'revision_requested'])
  const lines = fs
    .readFileSync(GOVERNED_INPUT_PATH, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => JSON.parse(line) as Record<string, unknown>)

  const blockedCompoundSlugs = new Set(
    lines
      .filter(row => row.entityType === 'compound')
      .filter(row => blockedStatuses.has(String(row.editorialStatus || '').toLowerCase()))
      .map(row => String(row.entitySlug || '').toLowerCase()),
  )

  if (blockedCompoundSlugs.size === 0) return

  const publishableRows = getPublishableGovernedEntries()
  for (const row of publishableRows) {
    const bundle = buildEnrichmentRecommendations(row.entityType, row.entitySlug)
    const targets = [
      ...collectTargets(bundle.relatedCompounds),
      ...collectTargets(bundle.safetyNextSteps),
      ...collectTargets(bundle.mechanismNextSteps),
    ]

    for (const target of targets) {
      const [, slug] = target.split(':')
      assert.equal(
        blockedCompoundSlugs.has(slug),
        false,
        `Blocked compound leaked into recommendations: ${target}`,
      )
    }
  }
}

function runGracefulDegradeChecks() {
  const missing = buildEnrichmentRecommendations('compound', 'missing-compound')
  assert.deepEqual(missing, {
    relatedHerbs: [],
    relatedCompounds: [],
    compareContrast: [],
    safetyNextSteps: [],
    mechanismNextSteps: [],
    activeSignals: [],
  })

  const sparse = buildGovernedCollectionSummary([
    {
      entityType: 'herb',
      entitySlug: 'missing-herb',
      entityName: 'Missing Herb',
    },
  ])

  assert.equal(sparse.allowComparativeHighlights, false)
  assert.ok(sparse.degradeReasons.includes('insufficient-governed-coverage'))
}

function runReportConsistencyCheck() {
  assert.ok(fs.existsSync(REPORT_PATH), 'Missing compound propagation report output.')
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8')) as Record<string, unknown>
  assert.equal(report.deterministicModelVersion, 'compound-propagation-v1')
  const governanceChecks = (report.governanceChecks || {}) as Record<string, unknown>
  const publishableCount = Number(governanceChecks.publishableGovernedEntityCount || 0)
  assert.equal(publishableCount, getPublishableGovernedEntries().length)
}

function runArtifactGovernanceSanity() {
  const rows = governedArtifact as GovernedRow[]
  for (const row of rows) {
    if (
      isPublishableGovernedEnrichment(
        (row as unknown as { researchEnrichment: unknown }).researchEnrichment as never,
      )
    ) {
      assert.ok(
        ['approved', 'published'].includes(String(row.researchEnrichment.editorialStatus || '')),
        `Unexpected publishable editorial status on ${row.entityType}:${row.entitySlug}`,
      )
    }
  }
}

function run() {
  runGovernanceInfluenceCheck()
  runBlockedStatusIsolationCheck()
  runGracefulDegradeChecks()
  runArtifactGovernanceSanity()
  runReportConsistencyCheck()

  console.log('[verify-compound-propagation] PASS')
  console.log(`[verify-compound-propagation] report=${path.relative(ROOT, REPORT_PATH)}`)
}

run()
