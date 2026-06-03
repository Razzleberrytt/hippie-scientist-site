#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const WAVE_ID = process.env.COMPOUND_WAVE_ID || 'compound-wave-1'
const SAFE_WAVE_ID = WAVE_ID.replace(/[^a-z0-9-]+/gi, '-').toLowerCase()
const SUBMISSION_PREFIX = `sub_${SAFE_WAVE_ID.replace(/-/g, '')}-`

const PATHS = {
  targets: path.join(ROOT, 'ops', 'reports', 'compound-enrichment-wave-targets.json'),
  sourceReview: path.join(ROOT, 'ops', 'reports', `source-${SAFE_WAVE_ID}-review.json`),
  submissionReview: path.join(ROOT, 'ops', 'reports', 'enrichment-submission-review.json'),
  submissions: path.join(ROOT, 'ops', 'enrichment-submissions.json'),
  rollup: path.join(ROOT, 'ops', 'reports', `enrichment-${SAFE_WAVE_ID}-rollup.json`),
  outputJson: path.join(ROOT, 'ops', 'reports', 'compound-enrichment-wave.json'),
  outputMd: path.join(ROOT, 'ops', 'reports', 'compound-enrichment-wave.md'),
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function run() {
  const targets = readJson(PATHS.targets)
  const sourceReview = readJson(PATHS.sourceReview)
  const submissionReview = readJson(PATHS.submissionReview)
  const submissions = readJson(PATHS.submissions)
  const rollup = readJson(PATHS.rollup)

  const targetByKey = new Map(targets.targets.map(target => [`${target.entityType}:${target.entitySlug}`, target]))

  const approvedSourcesByEntity = sourceReview.promotedSourceIdsByEntity || {}
  const approvedSourceCounts = Object.entries(approvedSourcesByEntity)
    .filter(([key]) => targetByKey.has(key))
    .map(([key, ids]) => {
      const [entityType, entitySlug] = key.split(':')
      return { entityType, entitySlug, approvedNewSourceCount: ids.length, sourceIds: ids }
    })

  const promotableSubmissionIds = new Set(
    submissionReview.assessments
      .filter(row => row.submissionId.startsWith(SUBMISSION_PREFIX) && row.promotable)
      .map(row => row.submissionId),
  )

  const approvedEntries = submissions.filter(
    row => row.submissionId.startsWith(SUBMISSION_PREFIX) && row.reviewStatus === 'approved_for_rollup' && promotableSubmissionIds.has(row.submissionId),
  )

  const approvedEntriesByEntity = new Map()
  for (const row of approvedEntries) {
    const key = `${row.entityType}:${row.entitySlug}`
    if (!approvedEntriesByEntity.has(key)) approvedEntriesByEntity.set(key, [])
    approvedEntriesByEntity.get(key).push(row)
  }

  const approvedEntryCounts = Array.from(targetByKey.values()).map(target => {
    const key = `${target.entityType}:${target.entitySlug}`
    const rows = approvedEntriesByEntity.get(key) || []
    const byTopic = {}
    const byEvidenceClass = {}
    for (const row of rows) {
      byTopic[row.topicType] = (byTopic[row.topicType] || 0) + 1
      byEvidenceClass[row.evidenceClass] = (byEvidenceClass[row.evidenceClass] || 0) + 1
    }
    return {
      entityType: target.entityType,
      entitySlug: target.entitySlug,
      approvedNewEnrichmentEntryCount: rows.length,
      byTopic,
      byEvidenceClass,
    }
  })

  const coverageDeltas = rollup.beforeAfterByWaveTarget
    .filter(row => targetByKey.has(`${row.entityType}:${row.entitySlug}`))
    .map(row => ({
      entityType: row.entityType,
      entitySlug: row.entitySlug,
      governedEntriesIncluded: row.governedEntriesIncluded,
      topicCoverage: row.topicCoverage,
      evidenceClassDistribution: row.evidenceClassDistribution,
    }))

  const surfaceGains = rollup.beforeAfterByWaveTarget
    .filter(row => targetByKey.has(`${row.entityType}:${row.entitySlug}`))
    .map(row => {
      const before = row.surfaces.before
      const after = row.surfaces.after
      return {
        entityType: row.entityType,
        entitySlug: row.entitySlug,
        gainedSurfaces: {
          herbOrCompoundDetail: !before.herbOrCompoundDetail && after.herbOrCompoundDetail,
          browseSearchSummary: !before.browseSearchSummary && after.browseSearchSummary,
          relatedRecommendations: !before.relatedRecommendations && after.relatedRecommendations,
          collectionComparisonSignals: !before.collectionComparisonSignals && after.collectionComparisonSignals,
        },
      }
    })

  const unresolved = rollup.unresolvedCriticalGaps.filter(row => targetByKey.has(`${row.entityType}:${row.entitySlug}`))

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'compound-enrichment-wave-report-v1',
    wave: { waveId: WAVE_ID, submissionPrefix: SUBMISSION_PREFIX },
    paths: Object.fromEntries(Object.entries(PATHS).map(([k, v]) => [k, path.relative(ROOT, v)])),
    selectedCompoundTargets: targets.targets,
    approvedNewSourceCountByCompound: approvedSourceCounts,
    approvedNewEnrichmentEntryCountByCompound: approvedEntryCounts,
    governedCoverageDeltasByCompound: coverageDeltas,
    strengthenedPublicSurfacesByCompound: surfaceGains,
    unresolvedCriticalGapsAfterWave: unresolved,
    summary: {
      selectedTargetCount: targets.targets.length,
      approvedSourceTotal: approvedSourceCounts.reduce((sum, row) => sum + row.approvedNewSourceCount, 0),
      approvedEnrichmentEntryTotal: approvedEntryCounts.reduce((sum, row) => sum + row.approvedNewEnrichmentEntryCount, 0),
      compoundsWithPositiveGovernedDelta: coverageDeltas.filter(row => Number(row.governedEntriesIncluded.delta || 0) > 0).map(row => row.entitySlug),
    },
  }

  writeJson(PATHS.outputJson, report)

  const md = [
    '# Compound Enrichment Wave Report',
    '',
    `- Wave ID: ${WAVE_ID}`,
    `- Generated at: ${report.generatedAt}`,
    `- Deterministic model version: ${report.deterministicModelVersion}`,
    '',
    '## Selected compound targets',
    '| compound | why selected | highest-priority missing topics | criticality | current governed coverage |',
    '| --- | --- | --- | --- | --- |',
    ...targets.targets.map(
      row => `| ${row.entitySlug} | ${row.selectionWhy} | ${(row.highestPriorityMissingTopics || []).join(', ')} | ${(row.criticality || []).join(', ')} | ${row.currentGovernedCoverageStatus} |`,
    ),
    '',
    '## Approved new source count by compound',
    '| compound | approvedNewSourceCount | sourceIds |',
    '| --- | ---: | --- |',
    ...approvedSourceCounts.map(row => `| ${row.entitySlug} | ${row.approvedNewSourceCount} | ${row.sourceIds.join(', ')} |`),
    '',
    '## Approved new enrichment entry count by compound',
    '| compound | approvedNewEnrichmentEntryCount | byTopic | byEvidenceClass |',
    '| --- | ---: | --- | --- |',
    ...approvedEntryCounts.map(
      row => `| ${row.entitySlug} | ${row.approvedNewEnrichmentEntryCount} | ${Object.entries(row.byTopic)
        .map(([topic, count]) => `${topic}:${count}`)
        .join(', ') || 'none'} | ${Object.entries(row.byEvidenceClass)
        .map(([klass, count]) => `${klass}:${count}`)
        .join(', ') || 'none'} |`,
    ),
    '',
    '## Governed coverage deltas',
    '| compound | before | after | delta | topicCoverageAfter (evidence/safety/mechanism/constituent) |',
    '| --- | ---: | ---: | ---: | --- |',
    ...coverageDeltas.map(
      row => `| ${row.entitySlug} | ${row.governedEntriesIncluded.before} | ${row.governedEntriesIncluded.after} | ${row.governedEntriesIncluded.delta} | ${row.topicCoverage.after.evidence}/${row.topicCoverage.after.safety}/${row.topicCoverage.after.mechanism}/${row.topicCoverage.after.constituent} |`,
    ),
    '',
    '## Unresolved critical gaps after wave',
    ...unresolved.map(row => `- ${row.entitySlug}: ${(row.unresolvedCriticalTopics || []).join(', ')}`),
  ]

  fs.writeFileSync(PATHS.outputMd, `${md.join('\n')}\n`, 'utf8')

  console.log(`Wrote ${path.relative(ROOT, PATHS.outputJson)}`)
  console.log(`Wrote ${path.relative(ROOT, PATHS.outputMd)}`)
}

run()
