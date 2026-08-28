#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { evaluateCorpus, recordIsPublished } from '../lib/production-content-invariants.mjs'
import { evaluateRuntimeSourceRegistryReferences, ORPHANED_CANONICAL_SOURCE_REFERENCE } from '../lib/runtime-source-registry-audit.mjs'
import { buildRuntimeSourceRemediationQueue } from '../lib/runtime-source-remediation-classifier.mjs'

const root = process.cwd()
const dataDir = path.resolve(root, process.argv.find((arg) => arg.startsWith('--data-dir='))?.slice(11) || 'public/data')
const reportPath = path.join(root, 'reports/production-content-invariants.json')
const remediationReportPath = path.join(root, 'reports/runtime-source-remediation-queue.json')

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return {} }
}
function detailDir(kind) {
  const plural = path.join(dataDir, kind === 'herb' ? 'herbs-detail' : 'compounds-detail')
  const singular = path.join(dataDir, kind === 'herb' ? 'herb-detail' : 'compound-detail')
  return fs.existsSync(plural) ? plural : singular
}
function entriesFor(kind) {
  const dir = detailDir(kind)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort().map((name) => ({ kind, record: readJson(path.join(dir, name)) }))
}

const entries = [...entriesFor('herb'), ...entriesFor('compound')]
const sourceRegistryRaw = readJson(path.join(dataDir, 'source-registry.json'))
const sourceRegistry = Array.isArray(sourceRegistryRaw) ? sourceRegistryRaw : []
const issues = [
  ...evaluateCorpus(entries),
  ...entries.flatMap(({ kind, record }) => evaluateRuntimeSourceRegistryReferences(record, kind, sourceRegistry)),
]
const publishedKeys = new Set(entries.filter(({ record }) => recordIsPublished(record)).map(({ kind, record }) => `${kind}:${record.slug}`))

const alwaysBlocking = new Set([
  'UNRESOLVED_CITATION_REFERENCE',
  'INVALID_CITATION_DESTINATION',
  'PRODUCTION_PLACEHOLDER',
  'DUPLICATE_CANONICAL_ENTITY',
  'MALFORMED_SCIENTIFIC_NAME',
  'INTERNAL_DEVELOPMENT_LANGUAGE',
])
const publicationBlocking = new Set([
  'A_GRADE_CRITERIA',
  'HUMAN_CLAIM_WITHOUT_HUMAN_SOURCE',
  'SAFETY_CLAIM_WITHOUT_SAFETY_SOURCE',
  'DOSE_STATEMENT_WITHOUT_DOSE_SOURCE',
])

const blocking = issues.filter((finding) => {
  if (!finding.blocking) return false
  if (alwaysBlocking.has(finding.code)) return true
  return publicationBlocking.has(finding.code) && publishedKeys.has(`${finding.kind}:${finding.slug}`)
})
const counts = {}
for (const finding of issues) counts[finding.code] = (counts[finding.code] || 0) + 1

const runtimeRegistryOrphans = issues
  .filter((finding) => finding.code === ORPHANED_CANONICAL_SOURCE_REFERENCE)
  .map((finding) => ({
    kind: finding.kind,
    slug: finding.slug,
    sourceId: finding.sourceId,
    url: finding.url,
  }))
  .sort((a, b) =>
    String(a.kind).localeCompare(String(b.kind)) ||
    String(a.slug).localeCompare(String(b.slug)) ||
    String(a.sourceId).localeCompare(String(b.sourceId)),
  )

const sourceCandidatesRaw = readJson(path.join(root, 'ops/source-candidates.json'))
const promotionReconciliationsRaw = readJson(path.join(root, 'ops/source-candidate-promotion-reconciliations.json'))
const remediationQueue = buildRuntimeSourceRemediationQueue({
  orphanRows: runtimeRegistryOrphans,
  entries,
  sourceCandidates: Array.isArray(sourceCandidatesRaw) ? sourceCandidatesRaw : [],
  promotionReconciliations: Array.isArray(promotionReconciliationsRaw) ? promotionReconciliationsRaw : [],
})

const report = {
  generatedAt: new Date().toISOString(),
  profilesScanned: entries.length,
  publishedProfiles: publishedKeys.size,
  sourceRegistryEntries: sourceRegistry.length,
  findings: issues.length,
  blockingFindings: blocking.length,
  counts,
  runtimeRegistryOrphans,
  runtimeRegistryRemediation: {
    orphanRows: remediationQueue.orphanRows,
    uniqueAffectedProfiles: remediationQueue.uniqueAffectedProfiles,
    uniqueOrphanSourceIds: remediationQueue.uniqueOrphanSourceIds,
    publishedRows: remediationQueue.publishedRows,
    safetyRelevantRows: remediationQueue.safetyRelevantRows,
    humanEvidenceRelevantRows: remediationQueue.humanEvidenceRelevantRows,
    countsByClass: remediationQueue.countsByClass,
  },
  blocking,
  policy: {
    publishedClaims: 'A-grade, human-evidence, safety and dose claims must be backed by the required evidence class before indexation.',
    corpusIntegrity: 'Broken source references, malformed citation destinations, placeholders, duplicate canonical IDs, malformed scientific names and internal-development language are forbidden in the generated profile corpus.',
    runtimeRegistryIntegrity: 'Canonical-looking runtime source references are inventoried against the source registry. Missing registry identities are reported non-blocking until the legacy baseline is reconciled.',
    runtimeRegistryRemediation: 'Orphan remediation classification is informational only. It prioritizes governed recovery work and never creates registry authority or changes public claims/indexability by itself.',
  },
}
fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
fs.writeFileSync(remediationReportPath, `${JSON.stringify({ generatedAt: report.generatedAt, ...remediationQueue }, null, 2)}\n`)

console.log(`[production-content-invariants] profiles=${report.profilesScanned}; published=${report.publishedProfiles}; registry=${report.sourceRegistryEntries}; findings=${report.findings}; blocking=${report.blockingFindings}`)
for (const [code, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`[production-content-invariants] ${code}: ${count}`)
console.log(`[production-content-invariants] runtime registry orphan inventory: ${report.runtimeRegistryOrphans.length}`)
console.log(`[production-content-invariants] remediation classes: ${Object.entries(remediationQueue.countsByClass).map(([state, count]) => `${state}=${count}`).join(', ')}`)
console.log(`[production-content-invariants] report: ${path.relative(root, reportPath)}`)
console.log(`[production-content-invariants] remediation queue: ${path.relative(root, remediationReportPath)}`)

if (blocking.length) {
  console.error(`\n[production-content-invariants] FAILED — ${blocking.length} blocking invariant violation(s)`)
  for (const finding of blocking.slice(0, 80)) console.error(`[production-content-invariants] ${finding.url || `${finding.kind}:${finding.slug}`} · ${finding.code} · ${finding.detail}`)
  process.exit(1)
}
console.log('[production-content-invariants] PASS')