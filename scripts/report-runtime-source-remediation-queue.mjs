#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import {
  classifyRuntimeSourceOrphan,
  rankRuntimeSourceRemediations,
  RUNTIME_SOURCE_REMEDIATION_STATES,
} from './lib/runtime-source-remediation-classifier.mjs'

const root = process.cwd()
const invariantReportPath = path.join(root, 'reports', 'production-content-invariants.json')
const candidatePath = path.join(root, 'ops', 'source-candidates.json')
const reconciliationPath = path.join(root, 'ops', 'source-candidate-promotion-reconciliations.json')
const outputJson = path.join(root, 'ops', 'reports', 'runtime-source-remediation-queue.json')
const outputMd = path.join(root, 'ops', 'reports', 'runtime-source-remediation-queue.md')

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function detailDir(kind) {
  const plural = path.join(root, 'public', 'data', kind === 'herb' ? 'herbs-detail' : 'compounds-detail')
  const singular = path.join(root, 'public', 'data', kind === 'herb' ? 'herb-detail' : 'compound-detail')
  return fs.existsSync(plural) ? plural : singular
}

function loadProfile(kind, slug) {
  const filePath = path.join(detailDir(kind), `${slug}.json`)
  return readJson(filePath, {}) || {}
}

function keyOf(row) {
  return `${row.kind}:${row.slug}:${row.sourceId}`
}

const invariantReport = readJson(invariantReportPath)
if (!invariantReport || !Array.isArray(invariantReport.runtimeRegistryOrphans)) {
  throw new Error(
    'reports/production-content-invariants.json must contain runtimeRegistryOrphans[]. Run the enhanced production-content invariant audit first.',
  )
}

const orphanRows = invariantReport.runtimeRegistryOrphans
const seen = new Set()
for (const orphan of orphanRows) {
  const key = keyOf(orphan)
  if (seen.has(key)) throw new Error(`Duplicate runtime registry orphan row: ${key}`)
  seen.add(key)
}

const candidates = readJson(candidatePath, []) || []
const reconciliations = readJson(reconciliationPath, []) || []
const classified = orphanRows.map(orphan => classifyRuntimeSourceOrphan(orphan, {
  profile: loadProfile(orphan.kind, orphan.slug),
  candidates,
  reconciliations,
}))

if (classified.length !== orphanRows.length) {
  throw new Error(`Classifier row-count mismatch: input=${orphanRows.length} output=${classified.length}`)
}

const ranked = rankRuntimeSourceRemediations(classified)
const rankedKeys = new Set(ranked.map(keyOf))
if (rankedKeys.size !== orphanRows.length || [...seen].some(key => !rankedKeys.has(key))) {
  throw new Error('Classifier did not preserve the exact orphan-row identity set.')
}

const byState = Object.fromEntries(RUNTIME_SOURCE_REMEDIATION_STATES.map(state => [state, 0]))
for (const row of ranked) byState[row.remediationState] = (byState[row.remediationState] || 0) + 1

const uniqueProfiles = new Set(ranked.map(row => `${row.kind}:${row.slug}`))
const uniqueSourceIds = new Set(ranked.map(row => row.sourceId))
const sourceFanout = new Map()
for (const row of ranked) sourceFanout.set(row.sourceId, (sourceFanout.get(row.sourceId) || 0) + 1)
const topFanout = [...sourceFanout.entries()]
  .map(([sourceId, fanout]) => ({ sourceId, fanout }))
  .sort((a, b) => b.fanout - a.fanout || a.sourceId.localeCompare(b.sourceId))
  .slice(0, 25)

const report = {
  generatedAt: new Date().toISOString(),
  deterministicModelVersion: 'runtime-source-remediation-v1',
  sources: {
    invariantReport: path.relative(root, invariantReportPath),
    sourceCandidates: path.relative(root, candidatePath),
    promotionReconciliations: fs.existsSync(reconciliationPath) ? path.relative(root, reconciliationPath) : null,
  },
  policy: {
    authority: 'public/data/source-registry.json remains the only authority for current registry membership.',
    classificationOnly: true,
    recoveryBoundary: 'recoverable_verified_identity means sufficient DOI/PMID metadata exists for governed external attestation; it does not restore or approve registry membership.',
    quarantineBoundary: 'contradictory DOI/PMID identity anchors are quarantined rather than guessed through.',
  },
  summary: {
    orphanRows: orphanRows.length,
    uniqueProfiles: uniqueProfiles.size,
    uniqueSourceIds: uniqueSourceIds.size,
    publishedRows: ranked.filter(row => row.published).length,
    safetyClaimRows: ranked.filter(row => row.safetyClaim).length,
    humanEvidenceClaimRows: ranked.filter(row => row.humanEvidenceClaim).length,
    byState,
  },
  topFanout,
  queue: ranked,
}

fs.mkdirSync(path.dirname(outputJson), { recursive: true })
fs.writeFileSync(outputJson, `${JSON.stringify(report, null, 2)}\n`)

const md = [
  '# Runtime Source Remediation Queue',
  '',
  `Generated: ${report.generatedAt}`,
  '',
  '## Summary',
  `- orphan rows: ${report.summary.orphanRows}`,
  `- unique affected profiles: ${report.summary.uniqueProfiles}`,
  `- unique orphan source IDs: ${report.summary.uniqueSourceIds}`,
  `- published rows: ${report.summary.publishedRows}`,
  `- safety-claim rows: ${report.summary.safetyClaimRows}`,
  `- human-evidence-claim rows: ${report.summary.humanEvidenceClaimRows}`,
  ...Object.entries(byState).map(([state, count]) => `- ${state}: ${count}`),
  '',
  '## Highest-priority rows',
  '| priority | kind | slug | sourceId | fanout | class | published | safety | human |',
  '| ---: | --- | --- | --- | ---: | --- | --- | --- | --- |',
  ...ranked.slice(0, 100).map(row => `| ${row.priorityScore} | ${row.kind} | ${row.slug} | ${row.sourceId} | ${row.sourceFanout} | ${row.remediationState} | ${row.published ? 'yes' : 'no'} | ${row.safetyClaim ? 'yes' : 'no'} | ${row.humanEvidenceClaim ? 'yes' : 'no'} |`),
  '',
  '## Highest-fanout orphan identities',
  '| sourceId | affected rows |',
  '| --- | ---: |',
  ...topFanout.map(row => `| ${row.sourceId} | ${row.fanout} |`),
  '',
  'Classification is informational only. No source registry entry, public claim, evidence grade, or indexability state is changed by this report.',
]
fs.writeFileSync(outputMd, `${md.join('\n')}\n`)

console.log(`[runtime-source-remediation] rows=${report.summary.orphanRows}; profiles=${report.summary.uniqueProfiles}; sourceIds=${report.summary.uniqueSourceIds}`)
for (const [state, count] of Object.entries(byState)) console.log(`[runtime-source-remediation] ${state}: ${count}`)
console.log(`[runtime-source-remediation] report: ${path.relative(root, outputJson)}`)
