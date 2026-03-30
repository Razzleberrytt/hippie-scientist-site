import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import governedArtifact from '../public/data/enrichment-governed.json'
import {
  buildEnrichmentRecommendations,
  buildEnrichmentRecommendationsFromRows,
  type GovernedRecommendationRow,
} from '../src/lib/enrichmentRecommendations'
import {
  getPublishableGovernedEntries,
  isPublishableGovernedEnrichment,
} from '../src/lib/governedResearch'
import type { ResearchEnrichment } from '../src/types/researchEnrichment'

const ROOT = process.cwd()
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-linking-summary.json')

type GovernedRow = {
  entityType: 'herb' | 'compound'
  entitySlug: string
  researchEnrichment: ResearchEnrichment
}

function runDeterminismChecks(rows: GovernedRecommendationRow[]) {
  for (const row of rows) {
    const first = buildEnrichmentRecommendations(row.entityType, row.entitySlug)
    const second = buildEnrichmentRecommendations(row.entityType, row.entitySlug)
    assert.deepEqual(
      first,
      second,
      `Recommendation output is non-deterministic for ${row.entityType}:${row.entitySlug}`,
    )
  }
}

function runGovernanceIsolationCheck() {
  const publishableSource: GovernedRecommendationRow = {
    entityType: 'herb',
    entitySlug: 'governed-source',
    researchEnrichment: {
      evidenceSummary: 'governed',
      evidenceTier: 'tier-2-moderate',
      evidenceClassesPresent: ['human-clinical'],
      supportedUses: [
        {
          claim: 'Supports anxiety symptom outcomes in adults.',
          evidenceClass: 'human-clinical',
          sourceRefIds: ['src1'],
        },
      ],
      unsupportedOrUnclearUses: [],
      mechanisms: [],
      constituents: [],
      interactions: [],
      contraindications: [],
      adverseEffects: [],
      dosageContextNotes: [],
      populationSpecificNotes: [],
      conflictNotes: [],
      researchGaps: [],
      topicEvidenceJudgments: {},
      pageEvidenceJudgment: {
        evidenceLabel: 'limited_human_support',
        grading: {
          evidenceClass: ['human-clinical'],
          studyDesignWeight: 0.7,
          humanRelevance: 'direct-human',
          directnessToClaim: 'direct',
          replicationDepth: 0.5,
          sourceReliabilityTier: 'tier-b',
          recencyWeight: 0.5,
          editorialConfidence: 'medium',
          conflictState: 'none',
          confidenceIndex: 0.6,
        },
        conflictNotes: [],
        uncertaintyNotes: [],
        toneGuidance: 'Use measured language.',
      },
      editorialReadiness: {
        publishable: true,
        hasConflictOrWeakEvidence: false,
        conflictLabelingPresent: true,
        weakEvidenceClaimsLabeled: true,
      },
      sourceRefs: [],
      lastReviewedAt: '2026-03-30T00:00:00.000Z',
      reviewedBy: 'ops-editor',
      editorialStatus: 'approved',
    },
  }

  const blockedCompetitor: GovernedRecommendationRow = {
    entityType: 'compound',
    entitySlug: 'blocked-competitor',
    researchEnrichment: {
      ...publishableSource.researchEnrichment,
      editorialReadiness: {
        publishable: false,
        hasConflictOrWeakEvidence: true,
        conflictLabelingPresent: true,
        weakEvidenceClaimsLabeled: true,
      },
      editorialStatus: 'blocked',
    },
  }

  const eligibleCompetitor: GovernedRecommendationRow = {
    entityType: 'compound',
    entitySlug: 'eligible-competitor',
    researchEnrichment: {
      ...publishableSource.researchEnrichment,
      supportedUses: [
        {
          claim: 'Shows anxiety context evidence in reviewed datasets.',
          evidenceClass: 'human-clinical',
          sourceRefIds: ['src2'],
        },
      ],
      editorialStatus: 'published',
    },
  }

  const onlyPublishableRows = [publishableSource, eligibleCompetitor]
  const withBlockedRows = [publishableSource, eligibleCompetitor, blockedCompetitor]

  const publishableResult = buildEnrichmentRecommendationsFromRows(
    publishableSource,
    onlyPublishableRows,
  )
  const blockedLeakResult = buildEnrichmentRecommendationsFromRows(
    publishableSource,
    withBlockedRows,
  )

  assert.ok(
    publishableResult.relatedCompounds.some(item => item.targetSlug === 'eligible-competitor'),
    'Expected publishable competitor recommendation not found.',
  )
  assert.ok(
    blockedLeakResult.relatedCompounds.some(item => item.targetSlug === 'blocked-competitor'),
    'Fixture sanity check failed: blocked competitor should appear if filtering is bypassed.',
  )

  const productionRows = getPublishableGovernedEntries()
  for (const row of productionRows) {
    const bundle = buildEnrichmentRecommendations(row.entityType, row.entitySlug)
    const allTargets = [
      ...bundle.relatedHerbs,
      ...bundle.relatedCompounds,
      ...bundle.compareContrast,
      ...bundle.safetyNextSteps,
      ...bundle.mechanismNextSteps,
    ]
    for (const target of allTargets) {
      const governed = productionRows.find(
        candidate =>
          candidate.entityType === target.targetType && candidate.entitySlug === target.targetSlug,
      )
      assert.ok(
        governed,
        `Recommendation leaked non-governed target ${target.targetType}:${target.targetSlug}.`,
      )
      assert.equal(
        isPublishableGovernedEnrichment(governed?.researchEnrichment),
        true,
        `Recommendation leaked blocked/unreviewed target ${target.targetType}:${target.targetSlug}.`,
      )
    }
  }
}

function runSparseCoverageCheck() {
  const none = buildEnrichmentRecommendations('herb', 'non-existent-slug')
  assert.deepEqual(none, {
    relatedHerbs: [],
    relatedCompounds: [],
    compareContrast: [],
    safetyNextSteps: [],
    mechanismNextSteps: [],
    activeSignals: [],
  })
}

function writeSummaryReport() {
  const allRows = governedArtifact as GovernedRow[]
  const publishableRows = getPublishableGovernedEntries()
  const publishableKeys = new Set(publishableRows.map(row => `${row.entityType}:${row.entitySlug}`))

  const activeSignalsByType = {
    herb_detail: new Set<string>(),
    compound_detail: new Set<string>(),
  }

  const eligibleByPageType = {
    herb_detail: [] as string[],
    compound_detail: [] as string[],
  }

  for (const row of publishableRows) {
    const pageType = row.entityType === 'herb' ? 'herb_detail' : 'compound_detail'
    eligibleByPageType[pageType].push(row.entitySlug)
    const bundle = buildEnrichmentRecommendations(row.entityType, row.entitySlug)
    for (const signal of bundle.activeSignals) {
      activeSignalsByType[pageType].add(signal)
    }
  }

  const ineligibleEntities = allRows
    .filter(row => !publishableKeys.has(`${row.entityType}:${row.entitySlug}`))
    .map(row => ({
      entityType: row.entityType,
      entitySlug: row.entitySlug,
      reason: row.researchEnrichment.editorialReadiness?.publishable
        ? 'not_selected_for_governed_index'
        : 'insufficient_governed_enrichment_or_not_publishable',
      editorialStatus: row.researchEnrichment.editorialStatus,
    }))
    .sort((a, b) =>
      `${a.entityType}:${a.entitySlug}`.localeCompare(`${b.entityType}:${b.entitySlug}`),
    )

  const report = {
    generatedAt: new Date().toISOString(),
    pageTypes: {
      herb_detail: {
        enrichmentAwareRecommendations: true,
        activeSignalTypes: Array.from(activeSignalsByType.herb_detail).sort(),
        eligibleEntities: eligibleByPageType.herb_detail.sort(),
      },
      compound_detail: {
        enrichmentAwareRecommendations: true,
        activeSignalTypes: Array.from(activeSignalsByType.compound_detail).sort(),
        eligibleEntities: eligibleByPageType.compound_detail.sort(),
      },
    },
    ineligibleEntities,
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
}

function run() {
  const publishableRows = getPublishableGovernedEntries()
  assert.ok(
    publishableRows.length > 0,
    'Expected at least one publishable governed entity for linking checks.',
  )

  runDeterminismChecks(publishableRows)
  runGovernanceIsolationCheck()
  runSparseCoverageCheck()
  writeSummaryReport()

  console.log(`[verify-enrichment-linking] PASS publishable=${publishableRows.length}`)
  console.log(`[verify-enrichment-linking] report=${path.relative(ROOT, REPORT_PATH)}`)
}

run()
