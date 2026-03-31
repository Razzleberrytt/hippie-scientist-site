#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  parseNormalizedInput,
  rollupToResearchEnrichment,
  validateAndNormalizeEntries,
  writeJson,
} from './enrichment/normalize-enrichment-lib.mjs'

const ROOT = process.cwd()
const WAVE_PREFIX = 'sub_wave1-'

const PATHS = {
  submissions: path.join(ROOT, 'ops', 'enrichment-submissions.json'),
  submissionReview: path.join(ROOT, 'ops', 'reports', 'enrichment-submission-review.json'),
  waveTargets: path.join(ROOT, 'ops', 'reports', 'source-wave-1-targets.json'),
  canonicalGovernedInput: path.join(ROOT, 'public', 'data', 'enrichment-submissions-governed-input.jsonl'),
  governedArtifact: path.join(ROOT, 'public', 'data', 'enrichment-governed.json'),
  herbSummary: path.join(ROOT, 'public', 'data', 'herbs-summary.json'),
  compoundSummary: path.join(ROOT, 'public', 'data', 'compounds-summary.json'),
  linkingSummary: path.join(ROOT, 'ops', 'reports', 'enrichment-linking-summary.json'),
  discoverySummary: path.join(ROOT, 'ops', 'reports', 'enrichment-discovery-summary.json'),
  collectionsSummary: path.join(ROOT, 'ops', 'reports', 'enrichment-collections-summary.json'),
  reportJson: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-1-rollup.json'),
  reportMd: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-1-rollup.md'),
}

const CLAIM_FIELDS = [
  'supportedUses',
  'unsupportedOrUnclearUses',
  'mechanisms',
  'constituents',
  'interactions',
  'contraindications',
  'adverseEffects',
  'dosageContextNotes',
  'populationSpecificNotes',
  'conflictNotes',
  'researchGaps',
]

const TOPIC_GROUPS = {
  evidence: ['supportedUses', 'unsupportedOrUnclearUses', 'conflictNotes', 'researchGaps'],
  safety: ['interactions', 'contraindications', 'adverseEffects', 'populationSpecificNotes', 'dosageContextNotes'],
  mechanism: ['mechanisms'],
  constituent: ['constituents'],
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function runCommand(cmd, args) {
  execFileSync(cmd, args, { stdio: 'inherit', cwd: ROOT })
}

function isPublishable(enrichment) {
  return (
    enrichment?.editorialReadiness?.publishable === true &&
    (enrichment?.editorialStatus === 'approved' || enrichment?.editorialStatus === 'published')
  )
}

function summarizeRow(row) {
  const enrichment = row?.researchEnrichment || {}
  const byField = {}
  const evidenceClassDistribution = {}
  let governedEntriesIncluded = 0

  for (const field of CLAIM_FIELDS) {
    const claims = Array.isArray(enrichment[field]) ? enrichment[field] : []
    byField[field] = claims.length
    governedEntriesIncluded += claims.length
    for (const claim of claims) {
      const evidenceClass = String(claim?.evidenceClass || '').trim()
      if (!evidenceClass) continue
      evidenceClassDistribution[evidenceClass] = (evidenceClassDistribution[evidenceClass] || 0) + 1
    }
  }

  const topicCoverage = {
    evidence: TOPIC_GROUPS.evidence.reduce((sum, field) => sum + (byField[field] || 0), 0),
    safety: TOPIC_GROUPS.safety.reduce((sum, field) => sum + (byField[field] || 0), 0),
    mechanism: TOPIC_GROUPS.mechanism.reduce((sum, field) => sum + (byField[field] || 0), 0),
    constituent: TOPIC_GROUPS.constituent.reduce((sum, field) => sum + (byField[field] || 0), 0),
  }

  return {
    publishable: isPublishable(enrichment),
    governedEntriesIncluded,
    topicCoverage,
    evidenceClassDistribution,
    evidenceLabel: enrichment?.pageEvidenceJudgment?.evidenceLabel || 'insufficient_evidence',
    lastReviewedAt: enrichment?.lastReviewedAt || null,
  }
}

function buildEntitySnapshot(rowsByEntity, targets) {
  return targets.map(target => {
    const key = `${target.entityType}:${target.entitySlug}`
    const row = rowsByEntity.get(key)
    return {
      entityType: target.entityType,
      entitySlug: target.entitySlug,
      summary: row ? summarizeRow(row) : summarizeRow({}),
      hasGovernedRow: Boolean(row),
      highestPriorityMissingTopics: target.highestPriorityMissingTopics,
      criticality: target.criticality,
    }
  })
}

function buildRowsByEntity(rows) {
  return new Map(
    rows.map(row => [`${row.entityType}:${slugify(row.entitySlug)}`, row]),
  )
}

function readSummarySurfaceFlags(filePath, entityType) {
  const rows = readJson(filePath)
  const map = new Map()
  for (const row of rows) {
    const slug = slugify(row.slug || row.id)
    const hasSummary = Boolean(row.researchEnrichmentSummary)
    map.set(`${entityType}:${slug}`, {
      browseSearchSummary: hasSummary,
      herbCompoundDetail: hasSummary,
    })
  }
  return map
}

function readLinkingEligibility() {
  if (!fs.existsSync(PATHS.linkingSummary)) return new Set()
  const report = readJson(PATHS.linkingSummary)
  const herb = report?.pageTypes?.herb_detail?.eligibleEntities || []
  const compound = report?.pageTypes?.compound_detail?.eligibleEntities || []
  return new Set([
    ...herb.map(slug => `herb:${slugify(slug)}`),
    ...compound.map(slug => `compound:${slugify(slug)}`),
  ])
}

function readCollectionCoverageSet() {
  if (!fs.existsSync(PATHS.collectionsSummary)) return new Set()
  const report = readJson(PATHS.collectionsSummary)
  const included = new Set()
  for (const row of report?.collections || []) {
    if ((row?.governedReviewedCount || 0) <= 0) continue
    for (const entity of row?.includedEntities || []) {
      const entityType = slugify(entity?.entityType)
      const entitySlug = slugify(entity?.entitySlug)
      if (!entityType || !entitySlug) continue
      included.add(`${entityType}:${entitySlug}`)
    }
  }
  return included
}

function summarizeSurfaces(targets, herbSurfaceMap, compoundSurfaceMap, linkingSet, collectionSet) {
  const list = []
  for (const target of targets) {
    const key = `${target.entityType}:${target.entitySlug}`
    const summaryMap = target.entityType === 'herb' ? herbSurfaceMap : compoundSurfaceMap
    const base = summaryMap.get(key) || { browseSearchSummary: false, herbCompoundDetail: false }
    list.push({
      entityType: target.entityType,
      entitySlug: target.entitySlug,
      herbOrCompoundDetail: base.herbCompoundDetail,
      browseSearchSummary: base.browseSearchSummary,
      relatedRecommendations: linkingSet.has(key),
      collectionComparisonSignals: collectionSet.has(key),
    })
  }
  return list
}

function mapByKey(list) {
  return new Map(list.map(row => [`${row.entityType}:${row.entitySlug}`, row]))
}

function runDeterministicRefresh() {
  runCommand('npm', ['run', 'report:enrichment-wave-1-authoring'])

  const promotedEntries = parseNormalizedInput(PATHS.canonicalGovernedInput)
  const { normalizedEntries, issues, sourceById } = validateAndNormalizeEntries(promotedEntries, {
    includeNearDuplicateCheck: true,
  })
  if (issues.length > 0) {
    throw new Error(`Governed rollup validation failed with ${issues.length} issues.`)
  }

  const governedRollup = rollupToResearchEnrichment(normalizedEntries, sourceById)
  writeJson(PATHS.governedArtifact, governedRollup)

  runCommand('node', ['scripts/generate-entity-payloads.mjs'])
  runCommand('npm', ['run', 'report:enrichment-collections'])
  runCommand('npm', ['run', 'verify:governed-enrichment-rendering'])
  runCommand('npm', ['run', 'verify:enrichment-discovery'])
  runCommand('npm', ['run', 'verify:enrichment-linking'])
  runCommand('npm', ['run', 'verify:enrichment-collections'])

  return { promotedEntries, governedRollup }
}

function verifyGovernanceIsolation(promotedEntries, submissions) {
  const promotedSubmissionIds = new Set(
    promotedEntries.map(row => String(row?.enrichmentId || '').replace(/^enr_/u, 'sub_')),
  )

  const blockedStatuses = new Set(['draft_submission', 'ready_for_review', 'revision_requested', 'rejected', 'deprecated_submission'])

  for (const submission of submissions) {
    const isPromoted = promotedSubmissionIds.has(submission.submissionId)
    if (isPromoted) {
      assert.equal(
        submission.reviewStatus,
        'approved_for_rollup',
        `Promoted submission must be approved_for_rollup: ${submission.submissionId}`,
      )
      assert.equal(submission.active, true, `Promoted submission must be active: ${submission.submissionId}`)
      assert.ok(
        submission.editorialStatus === 'approved' || submission.editorialStatus === 'published',
        `Promoted submission must be approved/published: ${submission.submissionId}`,
      )
    }

    if (blockedStatuses.has(submission.reviewStatus) || submission.active === false) {
      assert.equal(isPromoted, false, `Blocked submission leaked into promoted input: ${submission.submissionId}`)
    }
  }

  const waveBlocked = submissions.filter(
    submission => submission.submissionId.startsWith(WAVE_PREFIX) && submission.reviewStatus !== 'approved_for_rollup',
  )

  for (const submission of waveBlocked) {
    assert.equal(
      promotedSubmissionIds.has(submission.submissionId),
      false,
      `Non-approved wave-1 submission leaked: ${submission.submissionId}`,
    )
  }
}

function run() {
  const submissions = readJson(PATHS.submissions)
  const targets = readJson(PATHS.waveTargets).targets.map(target => ({
    ...target,
    entitySlug: slugify(target.entitySlug),
  }))

  const beforeRows = readJson(PATHS.governedArtifact)
  const beforeRowsByEntity = buildRowsByEntity(beforeRows)

  const beforeHerbSurface = readSummarySurfaceFlags(PATHS.herbSummary, 'herb')
  const beforeCompoundSurface = readSummarySurfaceFlags(PATHS.compoundSummary, 'compound')
  const beforeLinkingSet = readLinkingEligibility()
  const beforeCollectionSet = readCollectionCoverageSet()

  const beforeEntitySnapshot = buildEntitySnapshot(beforeRowsByEntity, targets)
  const beforeSurfaces = summarizeSurfaces(
    targets,
    beforeHerbSurface,
    beforeCompoundSurface,
    beforeLinkingSet,
    beforeCollectionSet,
  )

  const { promotedEntries, governedRollup } = runDeterministicRefresh()
  verifyGovernanceIsolation(promotedEntries, submissions)

  const afterRowsByEntity = buildRowsByEntity(governedRollup)
  const afterHerbSurface = readSummarySurfaceFlags(PATHS.herbSummary, 'herb')
  const afterCompoundSurface = readSummarySurfaceFlags(PATHS.compoundSummary, 'compound')
  const afterLinkingSet = readLinkingEligibility()
  const afterCollectionSet = readCollectionCoverageSet()

  const afterEntitySnapshot = buildEntitySnapshot(afterRowsByEntity, targets)
  const afterSurfaces = summarizeSurfaces(
    targets,
    afterHerbSurface,
    afterCompoundSurface,
    afterLinkingSet,
    afterCollectionSet,
  )

  const beforeByKey = mapByKey(beforeEntitySnapshot)
  const afterByKey = mapByKey(afterEntitySnapshot)
  const beforeSurfaceByKey = mapByKey(beforeSurfaces)
  const afterSurfaceByKey = mapByKey(afterSurfaces)

  const entityDeltas = targets.map(target => {
    const key = `${target.entityType}:${target.entitySlug}`
    const before = beforeByKey.get(key)
    const after = afterByKey.get(key)
    const beforeSurface = beforeSurfaceByKey.get(key)
    const afterSurface = afterSurfaceByKey.get(key)

    return {
      entityType: target.entityType,
      entitySlug: target.entitySlug,
      governedEntriesIncluded: {
        before: before.summary.governedEntriesIncluded,
        after: after.summary.governedEntriesIncluded,
        delta: after.summary.governedEntriesIncluded - before.summary.governedEntriesIncluded,
      },
      topicCoverage: {
        before: before.summary.topicCoverage,
        after: after.summary.topicCoverage,
      },
      evidenceClassDistribution: {
        before: before.summary.evidenceClassDistribution,
        after: after.summary.evidenceClassDistribution,
      },
      surfaces: {
        before: beforeSurface,
        after: afterSurface,
      },
      unresolvedCriticalTopics: target.highestPriorityMissingTopics.filter(
        topic => (after.summary.topicCoverage[topic] || 0) === 0,
      ),
    }
  })

  const unresolvedCriticalGaps = entityDeltas
    .filter(row => row.unresolvedCriticalTopics.length > 0)
    .map(row => ({
      entityType: row.entityType,
      entitySlug: row.entitySlug,
      unresolvedCriticalTopics: row.unresolvedCriticalTopics,
    }))

  const waveSubmissions = submissions.filter(sub => sub.submissionId.startsWith(WAVE_PREFIX))

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'enrichment-wave-1-rollup-v1',
    paths: {
      canonicalGovernedInputPath: path.relative(ROOT, PATHS.canonicalGovernedInput),
      refreshedGovernedArtifactPath: path.relative(ROOT, PATHS.governedArtifact),
      refreshedHerbSummaryPath: path.relative(ROOT, PATHS.herbSummary),
      refreshedCompoundSummaryPath: path.relative(ROOT, PATHS.compoundSummary),
      linkingSummaryPath: path.relative(ROOT, PATHS.linkingSummary),
      discoverySummaryPath: path.relative(ROOT, PATHS.discoverySummary),
      collectionsSummaryPath: path.relative(ROOT, PATHS.collectionsSummary),
    },
    promotionGuards: {
      waveSubmissionCount: waveSubmissions.length,
      waveApprovedForRollup: waveSubmissions.filter(sub => sub.reviewStatus === 'approved_for_rollup').length,
      waveNonApprovedExcluded: waveSubmissions.filter(sub => sub.reviewStatus !== 'approved_for_rollup').map(sub => sub.submissionId).sort(),
      promotedInputCount: promotedEntries.length,
    },
    beforeAfterByWaveTarget: entityDeltas,
    publicSurfaceRefreshCoverage: {
      herbDetailPages: entityDeltas.filter(row => row.entityType === 'herb').map(row => ({
        entitySlug: row.entitySlug,
        before: row.surfaces.before.herbOrCompoundDetail,
        after: row.surfaces.after.herbOrCompoundDetail,
      })),
      compoundDetailPages: entityDeltas.filter(row => row.entityType === 'compound').map(row => ({
        entitySlug: row.entitySlug,
        before: row.surfaces.before.herbOrCompoundDetail,
        after: row.surfaces.after.herbOrCompoundDetail,
      })),
      browseSearchDiscovery: entityDeltas.map(row => ({
        entityType: row.entityType,
        entitySlug: row.entitySlug,
        before: row.surfaces.before.browseSearchSummary,
        after: row.surfaces.after.browseSearchSummary,
      })),
      relatedRecommendations: entityDeltas.map(row => ({
        entityType: row.entityType,
        entitySlug: row.entitySlug,
        before: row.surfaces.before.relatedRecommendations,
        after: row.surfaces.after.relatedRecommendations,
      })),
      collectionComparisonSummaries: entityDeltas.map(row => ({
        entityType: row.entityType,
        entitySlug: row.entitySlug,
        before: row.surfaces.before.collectionComparisonSignals,
        after: row.surfaces.after.collectionComparisonSignals,
      })),
    },
    unresolvedCriticalGaps,
  }

  writeJson(PATHS.reportJson, report)

  const md = [
    '# Enrichment Wave-1 Governed Rollup & Public Refresh',
    '',
    `Generated: ${report.generatedAt}`,
    `Canonical governed input: \`${report.paths.canonicalGovernedInputPath}\``,
    `Refreshed governed artifact: \`${report.paths.refreshedGovernedArtifactPath}\``,
    '',
    '## Promotion guardrails',
    `- Wave submissions: ${report.promotionGuards.waveSubmissionCount}`,
    `- Wave approved_for_rollup: ${report.promotionGuards.waveApprovedForRollup}`,
    `- Wave non-approved excluded: ${report.promotionGuards.waveNonApprovedExcluded.length}`,
    `- Promoted canonical input entries: ${report.promotionGuards.promotedInputCount}`,
    '',
    '## Before/after by wave target',
    '',
    '| Entity | Entries before | Entries after | Evidence before/after | Safety before/after | Mechanism before/after | Constituent before/after |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...entityDeltas.map(row =>
      `| ${row.entityType}:${row.entitySlug} | ${row.governedEntriesIncluded.before} | ${row.governedEntriesIncluded.after} | ${row.topicCoverage.before.evidence}/${row.topicCoverage.after.evidence} | ${row.topicCoverage.before.safety}/${row.topicCoverage.after.safety} | ${row.topicCoverage.before.mechanism}/${row.topicCoverage.after.mechanism} | ${row.topicCoverage.before.constituent}/${row.topicCoverage.after.constituent} |`,
    ),
    '',
    '## Public surfaces refreshed',
    '',
    '| Entity | Detail page | Browse/search summary | Related/recommendations | Collection/comparison |',
    '| --- | --- | --- | --- | --- |',
    ...entityDeltas.map(row =>
      `| ${row.entityType}:${row.entitySlug} | ${row.surfaces.before.herbOrCompoundDetail} -> ${row.surfaces.after.herbOrCompoundDetail} | ${row.surfaces.before.browseSearchSummary} -> ${row.surfaces.after.browseSearchSummary} | ${row.surfaces.before.relatedRecommendations} -> ${row.surfaces.after.relatedRecommendations} | ${row.surfaces.before.collectionComparisonSignals} -> ${row.surfaces.after.collectionComparisonSignals} |`,
    ),
    '',
    '## Unresolved critical gaps',
    ...(unresolvedCriticalGaps.length === 0
      ? ['- None.']
      : unresolvedCriticalGaps.map(
          row => `- ${row.entityType}:${row.entitySlug} -> ${row.unresolvedCriticalTopics.join(', ')}`,
        )),
    '',
  ]

  fs.mkdirSync(path.dirname(PATHS.reportMd), { recursive: true })
  fs.writeFileSync(PATHS.reportMd, `${md.join('\n')}\n`, 'utf8')

  console.log(`[report-enrichment-wave-1-rollup] PASS targets=${targets.length} promoted=${promotedEntries.length}`)
  console.log(`[report-enrichment-wave-1-rollup] report=${path.relative(ROOT, PATHS.reportJson)}`)
}

run()
