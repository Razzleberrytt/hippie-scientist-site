#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { hasResolvableEvidence } from '../data/evidence-receipts.mjs'

const repoRoot = process.cwd()
const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')
const dataDirArg = process.argv.find((arg) => arg.startsWith('--data-dir='))
const dataDir = path.resolve(repoRoot, dataDirArg ? dataDirArg.split('=')[1] : 'public/data')

const restrictedSlugs = new Set([
  '5-meo-dmt',
  '7-hydroxymitragynine',
  'amanita-muscaria',
  'dmt',
  'harmaline',
  'ibogaine',
  'ketamine',
  'kratom',
  'mescaline',
  'mitragynine',
  'psilocybin',
  'salvinorin-a',
])

const governanceKeys = [
  'governance',
  'legal_status',
  'legalStatus',
  'controlled_substance',
  'controlledSubstance',
  'controlled_status',
  'controlledStatus',
  'regulatory_status',
  'regulatoryStatus',
  'doNotMonetize',
  'do_not_monetize',
  'monetizationAllowed',
  'indexingAllowed',
  'recommendationAllowed',
  'requiresHumanReview',
]

const sourceKeys = [
  'sources',
  'references',
  'citations',
  'evidence',
  'studies',
  'sourceIds',
  'source_ids',
  'pmids',
  'pubmedIds',
]

function exists(p) {
  return fs.existsSync(p)
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    return { __parseError: error.message }
  }
}

const sourceRegistry = readJson(path.join(dataDir, 'source-registry.json'))
const activeRegistrySourceIds = new Set(
  Array.isArray(sourceRegistry)
    ? sourceRegistry
      .filter((source) => source?.active !== false)
      .map((source) => String(source?.sourceId || source?.id || '').trim())
      .filter(Boolean)
    : [],
)

function listJsonFiles(dirPath) {
  if (!exists(dirPath)) return []
  return fs
    .readdirSync(dirPath)
    .filter((name) => name.endsWith('.json'))
    .sort()
}

function hasAnyKeyDeep(value, keys) {
  if (!value || typeof value !== 'object') return false
  if (Array.isArray(value)) return value.some((item) => hasAnyKeyDeep(item, keys))
  return Object.entries(value).some(([key, child]) => keys.includes(key) || hasAnyKeyDeep(child, keys))
}

// Generated counts summarize evidence; they never establish it. Opaque source IDs
// must resolve to a materialized local source or an active registry source, while
// PMID/DOI/HTTPS identifiers are self-resolving receipts.
function hasNonEmptyEvidence(value) {
  return hasResolvableEvidence(value, { registrySourceIds: activeRegistrySourceIds })
}

function countFromReport(report, key) {
  if (!report || report.__parseError) return undefined
  if (typeof report?.counts?.[key] === 'number') return report.counts[key]
  if (typeof report?.[key] === 'number') return report[key]
  return undefined
}

function issue(severity, code, message, details = {}) {
  return { severity, code, message, details }
}

const findings = []

const dirs = {
  herbDetail: path.join(dataDir, 'herb-detail'),
  herbsDetail: path.join(dataDir, 'herbs-detail'),
  compoundDetail: path.join(dataDir, 'compound-detail'),
  compoundsDetail: path.join(dataDir, 'compounds-detail'),
}

const fileCounts = Object.fromEntries(
  Object.entries(dirs).map(([key, dirPath]) => [key, listJsonFiles(dirPath).length]),
)

if (exists(dirs.herbDetail) && exists(dirs.herbsDetail)) {
  findings.push(issue(
    'high',
    'DUPLICATE_HERB_DETAIL_DIRECTORIES',
    'Both herb-detail and herbs-detail exist. Pick one canonical source of truth.',
    { herbDetail: fileCounts.herbDetail, herbsDetail: fileCounts.herbsDetail },
  ))
}

if (exists(dirs.compoundDetail) && exists(dirs.compoundsDetail)) {
  findings.push(issue(
    'high',
    'DUPLICATE_COMPOUND_DETAIL_DIRECTORIES',
    'Both compound-detail and compounds-detail exist. Pick one canonical source of truth.',
    { compoundDetail: fileCounts.compoundDetail, compoundsDetail: fileCounts.compoundsDetail },
  ))
}

const buildReportPath = path.join(dataDir, 'build-report.json')
const buildInfoPath = path.join(dataDir, '_meta', 'build-info.json')
const buildReport = exists(buildReportPath) ? readJson(buildReportPath) : null
const buildInfo = exists(buildInfoPath) ? readJson(buildInfoPath) : null

const reportedCounts = {
  buildReportHerbs: countFromReport(buildReport, 'herbs'),
  buildReportCompounds: countFromReport(buildReport, 'compounds'),
  buildInfoHerbs: countFromReport(buildInfo, 'herbs'),
  buildInfoCompounds: countFromReport(buildInfo, 'compounds'),
  buildInfoHerbDetails: countFromReport(buildInfo, 'herbDetails'),
  buildInfoCompoundDetails: countFromReport(buildInfo, 'compoundDetails'),
}

const herbReportedValues = [reportedCounts.buildReportHerbs, reportedCounts.buildInfoHerbs, reportedCounts.buildInfoHerbDetails]
  .filter((value) => typeof value === 'number')
const compoundReportedValues = [reportedCounts.buildReportCompounds, reportedCounts.buildInfoCompounds, reportedCounts.buildInfoCompoundDetails]
  .filter((value) => typeof value === 'number')

if (new Set(herbReportedValues).size > 1 || new Set(compoundReportedValues).size > 1) {
  findings.push(issue(
    'high',
    'BUILD_MANIFEST_COUNT_DRIFT',
    'Generated metadata reports inconsistent herb/compound counts.',
    reportedCounts,
  ))
}

const canonicalCompoundDir = exists(dirs.compoundsDetail) ? dirs.compoundsDetail : dirs.compoundDetail
const canonicalHerbDir = exists(dirs.herbsDetail) ? dirs.herbsDetail : dirs.herbDetail

const restrictedFindings = []
for (const name of listJsonFiles(canonicalCompoundDir)) {
  const slug = name.replace(/\.json$/, '')
  if (!restrictedSlugs.has(slug)) continue
  const filePath = path.join(canonicalCompoundDir, name)
  const record = readJson(filePath)
  if (!hasAnyKeyDeep(record, governanceKeys)) {
    restrictedFindings.push(slug)
  }
}

if (restrictedFindings.length > 0) {
  findings.push(issue(
    'critical',
    'RESTRICTED_COMPOUNDS_WITHOUT_GOVERNANCE',
    'Restricted/high-risk compound records need explicit governance metadata before indexation or monetization.',
    { slugs: restrictedFindings },
  ))
}

// A record is treated as indexable when governance explicitly allows it, falling back to
// the legacy indexability fields for records that predate the governance overlay.
function isIndexableRecord(record) {
  if (record?.governance && typeof record.governance.indexingAllowed === 'boolean') {
    return record.governance.indexingAllowed
  }
  if (String(record?.indexability_status || '').toUpperCase() === 'PUBLISH') return true
  return record?.sitemap_included === true
}

// Governance invariant: every INDEXABLE profile must be source-backed. Non-indexable
// records (needs_review / noindex reference pages) are allowed to lack record-level
// sources — they are not exposed to search and carry requiresHumanReview.
function sourceCoverage(dirPath) {
  const files = listJsonFiles(dirPath)
  let withSources = 0
  let indexable = 0
  const indexableWithoutSources = []

  for (const name of files) {
    const record = readJson(path.join(dirPath, name))
    const sourced = hasNonEmptyEvidence(record)
    if (sourced) withSources += 1
    if (isIndexableRecord(record)) {
      indexable += 1
      if (!sourced) indexableWithoutSources.push(name.replace(/\.json$/, ''))
    }
  }

  return {
    total: files.length,
    withSources,
    withoutSources: files.length - withSources,
    indexable,
    indexableWithoutSources: indexableWithoutSources.length,
    sampleIndexableWithoutSources: indexableWithoutSources.slice(0, 25),
  }
}

const herbCoverage = sourceCoverage(canonicalHerbDir)
const compoundCoverage = sourceCoverage(canonicalCompoundDir)

if (herbCoverage.indexableWithoutSources > 0) {
  findings.push(issue('high', 'INDEXABLE_HERBS_WITHOUT_SOURCES', 'Indexable herb profiles must be source-backed. Add sources or mark them non-indexable (needs_review).', herbCoverage))
}

if (compoundCoverage.indexableWithoutSources > 0) {
  findings.push(issue('warning', 'INDEXABLE_COMPOUNDS_WITHOUT_SOURCES', 'Indexable compound profiles should be source-backed once compound-source ingestion is available. Diagnostic only for now.', compoundCoverage))
}

const summary = {
  ok: findings.length === 0,
  strict,
  dataDir: path.relative(repoRoot, dataDir),
  fileCounts,
  reportedCounts,
  sourceCoverage: {
    herbs: herbCoverage,
    compounds: compoundCoverage,
  },
  findings,
}

if (jsonOut) {
  console.log(JSON.stringify(summary, null, 2))
} else {
  console.log(`Data governance audit: ${findings.length === 0 ? 'PASS' : `${findings.length} finding(s)`}`)
  for (const finding of findings) {
    console.log(`\n[${finding.severity.toUpperCase()}] ${finding.code}`)
    console.log(finding.message)
    if (Object.keys(finding.details).length > 0) {
      console.log(JSON.stringify(finding.details, null, 2))
    }
  }
  console.log('\nRun with --json for machine-readable output. Run with --strict to fail on findings.')
}

const blockingFindings = findings.filter((finding) => ['critical', 'high'].includes(finding.severity))

if (strict && blockingFindings.length > 0) {
  process.exit(1)
}
