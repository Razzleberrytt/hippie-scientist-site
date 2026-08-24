import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..')
const contractPath = path.join(here, 'contract.json')
const stateDir = path.join(repoRoot, 'ops', 'enrichment-governor')

export const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'))

const clamp = value => Math.max(0, Math.min(100, Number(value) || 0))
const nowIso = () => new Date().toISOString()
const normalizeText = value => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')

export function normalizeDoi(value) {
  return normalizeText(value)
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '')
    .replace(/^doi:\s*/, '')
    .replace(/[\s.]+$/, '')
}

export function normalizePmid(value) {
  return String(value ?? '').replace(/\D/g, '')
}

export function candidateFingerprint(candidate = {}) {
  const doi = normalizeDoi(candidate.doi)
  const pmid = normalizePmid(candidate.pmid)
  const canonicalUrl = normalizeText(candidate.canonicalUrl || candidate.url)
  const title = normalizeText(candidate.title)
  const identity = doi ? `doi:${doi}` : pmid ? `pmid:${pmid}` : canonicalUrl ? `url:${canonicalUrl}` : `title:${title}`
  return crypto.createHash('sha256').update(identity).digest('hex').slice(0, 24)
}

export function scoreOpportunity(input = {}) {
  const weights = contract.opportunityScore.weights
  const values = {
    evidenceGapSeverity: clamp(input.evidenceGapSeverity),
    pageImportance: clamp(input.pageImportance),
    evidenceQuality: clamp(input.evidenceQuality),
    freshness: clamp(input.freshness),
    safetyImportance: clamp(input.safetyImportance),
    userFacingAccuracyImpact: clamp(input.userFacingAccuracyImpact),
    implementationEffortInverse: clamp(100 - clamp(input.implementationEffort)),
    scientificMergeRiskInverse: clamp(100 - clamp(input.scientificMergeRisk)),
  }
  const score = Object.entries(weights).reduce((sum, [key, weight]) => sum + values[key] * weight, 0)
  return Math.round(score * 10) / 10
}

export function scoreBand(score) {
  const bands = contract.opportunityScore.bands
  if (score >= bands.critical) return 'critical'
  if (score >= bands.high) return 'high'
  if (score >= bands.medium) return 'medium'
  return 'low'
}

export function shouldDeepWork(opportunity = {}) {
  const override = contract.cheapScan.highPriorityOverride.includes(opportunity.kind)
  const score = Number.isFinite(opportunity.score) ? opportunity.score : scoreOpportunity(opportunity)
  return {
    score,
    band: scoreBand(score),
    deepWork: override || score >= contract.cheapScan.deepWorkThreshold,
    reason: override ? `override:${opportunity.kind}` : score >= contract.cheapScan.deepWorkThreshold ? 'score_threshold_met' : 'cheap_scan_only',
  }
}

export function classifyDifficulty(opportunity = {}) {
  const reasons = new Set(opportunity.reasons || [])
  for (const reason of contract.difficultyEscalation.hard) if (reasons.has(reason)) return 'hard'
  for (const reason of contract.difficultyEscalation.moderate) if (reasons.has(reason)) return 'moderate'
  return 'easy'
}

export function sourceDiversity(entries = []) {
  const sourceCounts = new Map()
  const classes = new Set()
  const claimTypes = new Set()
  for (const entry of entries) {
    if (entry.sourceId) sourceCounts.set(entry.sourceId, (sourceCounts.get(entry.sourceId) || 0) + 1)
    if (entry.evidenceClass) classes.add(entry.evidenceClass)
    if (entry.claimType) claimTypes.add(entry.claimType)
  }
  const total = [...sourceCounts.values()].reduce((a, b) => a + b, 0)
  const dominant = total ? Math.max(0, ...sourceCounts.values()) / total : 0
  const flags = []
  if (dominant >= contract.sourceDiversity.flagSingleSourceDominanceAtShare && total > 1) flags.push('single_source_dominance')
  if (contract.sourceDiversity.flagSingleEvidenceClassOnly && classes.size === 1 && entries.length > 1) flags.push('single_evidence_class_only')
  if (sourceCounts.size < contract.sourceDiversity.minIndependentSourceIdsForHighConfidenceCoverage) flags.push('low_source_independence')
  return { uniqueSources: sourceCounts.size, evidenceClasses: [...classes].sort(), claimTypes: [...claimTypes].sort(), dominantShare: Math.round(dominant * 1000) / 1000, flags }
}

function parseJsonl(file) {
  if (!fs.existsSync(file)) return []
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => JSON.parse(line))
}

function loadJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

export function buildClaimSourceGraph(entries = [], sourceRegistry = []) {
  const registry = new Map((sourceRegistry || []).map(source => [source.sourceId || source.id, source]))
  const nodes = { entities: {}, claims: {}, sources: {} }
  const edges = []
  for (const entry of entries) {
    const entityKey = `${entry.entityType}:${entry.entitySlug}`
    nodes.entities[entityKey] ||= { id: entityKey, entityType: entry.entityType, entitySlug: entry.entitySlug }
    nodes.claims[entry.enrichmentId] = {
      id: entry.enrichmentId,
      claimType: entry.claimType,
      evidenceClass: entry.evidenceClass,
      topicType: entry.topicType,
      active: entry.active,
      editorialStatus: entry.editorialStatus,
    }
    if (entry.sourceId) {
      nodes.sources[entry.sourceId] ||= { id: entry.sourceId, resolvedInRegistry: registry.has(entry.sourceId), ...(registry.get(entry.sourceId) || {}) }
      edges.push({ from: entityKey, to: entry.enrichmentId, type: 'has_claim' })
      edges.push({ from: entry.enrichmentId, to: entry.sourceId, type: 'supported_by' })
    }
  }
  return {
    generatedAt: nowIso(),
    counts: {
      entities: Object.keys(nodes.entities).length,
      claims: Object.keys(nodes.claims).length,
      sources: Object.keys(nodes.sources).length,
      unresolvedSources: Object.values(nodes.sources).filter(source => !source.resolvedInRegistry).length,
    },
    nodes,
    edges,
  }
}

function dimensionState(entityEntries, dimension) {
  const claimTypes = new Set(entityEntries.map(entry => entry.claimType))
  const topicTypes = new Set(entityEntries.map(entry => entry.topicType))
  const hasHuman = entityEntries.some(entry => entry.evidenceClass === 'human-clinical' || entry.evidenceClass === 'human-observational')
  if (dimension === 'human_efficacy_signal') return hasHuman && claimTypes.has('efficacy_signal')
  if (dimension === 'null_or_mixed_human_evidence') return hasHuman && claimTypes.has('efficacy_null_or_mixed')
  if (dimension === 'safety') return claimTypes.has('safety_risk') || [...topicTypes].some(t => /adverse|contraindication|caution|pregnancy|lactation|pediatric|older_adult/.test(t || ''))
  if (dimension === 'interactions') return [...topicTypes].some(t => /interaction|enzyme/.test(t || ''))
  if (dimension === 'dosage_context') return claimTypes.has('dosing_note') || topicTypes.has('dosage_context')
  if (dimension === 'mechanism') return claimTypes.has('mechanistic_signal')
  if (dimension === 'special_populations') return claimTypes.has('population_note')
  if (dimension === 'source_independence') return sourceDiversity(entityEntries).uniqueSources >= contract.sourceDiversity.minIndependentSourceIdsForHighConfidenceCoverage
  if (dimension === 'publication_integrity') return entityEntries.every(entry => !entry.publicationIntegrityConcern)
  if (dimension === 'source_freshness') return entityEntries.some(entry => {
    const year = Number(String(entry.reviewedAt || '').slice(0, 4))
    return Number.isFinite(year) && new Date().getUTCFullYear() - year <= 2
  })
  return false
}

export function buildCoverageHeatmap(entries = []) {
  const grouped = new Map()
  for (const entry of entries) {
    const key = `${entry.entityType}:${entry.entitySlug}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(entry)
  }
  const rows = []
  for (const [entity, entityEntries] of grouped) {
    const dimensions = Object.fromEntries(contract.coverageDimensions.map(dimension => [dimension, dimensionState(entityEntries, dimension)]))
    const covered = Object.values(dimensions).filter(Boolean).length
    const diversity = sourceDiversity(entityEntries)
    rows.push({
      entity,
      coverageScore: Math.round((covered / contract.coverageDimensions.length) * 100),
      dimensions,
      sourceDiversity: diversity,
      negativeEvidenceGap: !entityEntries.some(entry => contract.negativeEvidence.targetClaimTypes.includes(entry.claimType)),
    })
  }
  rows.sort((a, b) => a.coverageScore - b.coverageScore || a.entity.localeCompare(b.entity))
  return { generatedAt: nowIso(), dimensions: contract.coverageDimensions, rows }
}

export function evidenceDecayScore({ ageDays = 0, supportingSources = 0, contradictionCount = 0, integrityConcern = false, highImpact = false } = {}) {
  const age = Math.min(35, Math.max(0, ageDays) / 365 * 8)
  const supportPenalty = supportingSources >= 3 ? 0 : supportingSources === 2 ? 8 : supportingSources === 1 ? 18 : 30
  const contradiction = Math.min(30, contradictionCount * 10)
  const integrity = integrityConcern ? 40 : 0
  const impact = highImpact ? 10 : 0
  return clamp(Math.round((age + supportPenalty + contradiction + integrity + impact) * 10) / 10)
}

export function canAcquireLease(queue, request, now = Date.now()) {
  const leases = queue.leases || []
  const active = leases.filter(lease => Date.parse(lease.expiresAt) > now)
  const requestedFiles = new Set(request.files || [])
  const requestedEntities = new Set(request.entities || [])
  for (const lease of active) {
    if ((lease.files || []).some(file => requestedFiles.has(file))) return { ok: false, reason: `file_overlap:${lease.id}` }
    if ((lease.entities || []).some(entity => requestedEntities.has(entity))) return { ok: false, reason: `entity_overlap:${lease.id}` }
  }
  return { ok: true }
}

export function acquireLease(queue, request, now = Date.now()) {
  const check = canAcquireLease(queue, request, now)
  if (!check.ok) return { queue, acquired: false, reason: check.reason }
  const id = request.id || `lease_${crypto.randomUUID()}`
  const lease = {
    id,
    owner: request.owner || 'enrichment-agent',
    purpose: request.purpose || 'enrichment',
    files: [...new Set(request.files || [])].sort(),
    entities: [...new Set(request.entities || [])].sort(),
    acquiredAt: new Date(now).toISOString(),
    expiresAt: new Date(now + contract.coordination.leaseMinutes * 60_000).toISOString(),
  }
  return { queue: { ...queue, leases: [...(queue.leases || []).filter(l => Date.parse(l.expiresAt) > now), lease] }, acquired: true, lease }
}

export function quarantineDecision(record = {}, now = Date.now()) {
  const failures = Number(record.consecutiveFailures || 0)
  if (failures < contract.quarantine.failureThreshold) return { quarantined: false, reason: 'below_failure_threshold' }
  const last = Date.parse(record.lastFailureAt || 0)
  const releaseAt = last + contract.quarantine.cooldownHours * 3_600_000
  return { quarantined: now < releaseAt, reason: now < releaseAt ? 'cooldown_active' : 'cooldown_elapsed_requires_material_change', releaseAt: new Date(releaseAt).toISOString() }
}

export function architectureDriftCheck(root = repoRoot) {
  const required = [
    'data-sources/herb_monograph_master.xlsx',
    'scripts/enrichment-pipeline/cli.mjs',
    'scripts/enrichment-pipeline/contract/enrichment-contract.json',
    'scripts/enrichment-pipeline/contract/priority-config.json',
    'public/data/enrichment-normalized.jsonl',
    'schemas/normalized-enrichment-entry.schema.json',
  ]
  const missing = required.filter(relative => !fs.existsSync(path.join(root, relative)))
  const hashes = {}
  for (const relative of required.filter(relative => !missing.includes(relative))) {
    hashes[relative] = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex').slice(0, 16)
  }
  return { ok: missing.length === 0, missing, hashes }
}

export function runBenchmark() {
  const cases = []
  const a = candidateFingerprint({ doi: 'https://doi.org/10.1000/XYZ.1' })
  const b = candidateFingerprint({ doi: 'doi:10.1000/xyz.1' })
  cases.push({ name: 'doi_dedupe', pass: a === b })
  const p1 = candidateFingerprint({ pmid: 'PMID: 12345678' })
  const p2 = candidateFingerprint({ pmid: '12345678' })
  cases.push({ name: 'pmid_dedupe', pass: p1 === p2 })
  cases.push({ name: 'hard_formulation_conflict', pass: classifyDifficulty({ reasons: ['formulation_identity_conflict'] }) === 'hard' })
  cases.push({ name: 'safety_override_deep_work', pass: shouldDeepWork({ kind: 'safety', evidenceGapSeverity: 1 }).deepWork === true })
  const diversity = sourceDiversity([
    { sourceId: 's1', evidenceClass: 'human-clinical', claimType: 'efficacy_signal' },
    { sourceId: 's1', evidenceClass: 'human-clinical', claimType: 'efficacy_null_or_mixed' },
  ])
  cases.push({ name: 'single_source_dominance_flagged', pass: diversity.flags.includes('single_source_dominance') })
  const heatmap = buildCoverageHeatmap([
    { entityType: 'herb', entitySlug: 'fixture', sourceId: 's1', evidenceClass: 'human-clinical', claimType: 'efficacy_signal', topicType: 'supported_use', reviewedAt: nowIso() },
    { entityType: 'herb', entitySlug: 'fixture', sourceId: 's2', evidenceClass: 'human-clinical', claimType: 'efficacy_null_or_mixed', topicType: 'unsupported_or_unclear_use', reviewedAt: nowIso() },
    { entityType: 'herb', entitySlug: 'fixture', sourceId: 's3', evidenceClass: 'human-clinical', claimType: 'safety_risk', topicType: 'adverse_effect', reviewedAt: nowIso() },
  ])
  cases.push({ name: 'null_evidence_retained', pass: heatmap.rows[0].dimensions.null_or_mixed_human_evidence === true })
  cases.push({ name: 'safety_evidence_retained', pass: heatmap.rows[0].dimensions.safety === true })
  const lease1 = acquireLease({ leases: [] }, { id: 'a', files: ['x.json'], entities: ['herb:a'] }, 0)
  const lease2 = canAcquireLease(lease1.queue, { files: ['x.json'], entities: ['herb:b'] }, 1)
  cases.push({ name: 'overlapping_work_blocked', pass: lease2.ok === false })
  const result = { passed: cases.filter(c => c.pass).length, total: cases.length, cases }
  return { ...result, ok: result.passed === result.total }
}

function scanRepository({ write = false } = {}) {
  const entries = parseJsonl(path.join(repoRoot, 'public', 'data', 'enrichment-normalized.jsonl'))
  const sources = loadJson(path.join(repoRoot, 'public', 'data', 'source-registry.json'), [])
  const graph = buildClaimSourceGraph(entries, sources)
  const heatmap = buildCoverageHeatmap(entries)
  const drift = architectureDriftCheck(repoRoot)
  const benchmark = runBenchmark()
  const result = {
    generatedAt: nowIso(),
    entryCount: entries.length,
    graphSummary: graph.counts,
    lowestCoverage: heatmap.rows.slice(0, 15),
    architectureDrift: drift,
    benchmark,
  }
  if (write) {
    writeJson(path.join(stateDir, 'claim-source-graph.json'), graph)
    writeJson(path.join(stateDir, 'coverage-heatmap.json'), heatmap)
    writeJson(path.join(stateDir, 'architecture-fingerprint.json'), { generatedAt: nowIso(), ...drift })
  }
  return result
}

function verifyState() {
  const required = ['state.json', 'scoreboard.json', 'work-queue.json', 'quarantine.json', 'self-improvements.json', 'ledger.jsonl']
  const missing = required.filter(file => !fs.existsSync(path.join(stateDir, file)))
  return { ok: missing.length === 0, missing }
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const command = process.argv[2] || 'scan'
  const write = process.argv.includes('--write')
  if (command === 'benchmark') print(runBenchmark())
  else if (command === 'verify-state') print(verifyState())
  else if (command === 'scan' || command === 'daily') print(scanRepository({ write }))
  else {
    console.error('Usage: node scripts/enrichment-governor/governor.mjs [scan|daily|benchmark|verify-state] [--write]')
    process.exitCode = 2
  }
}
