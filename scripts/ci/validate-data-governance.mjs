#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

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

function hasNonEmptyEvidence(value) {
  if (!value || typeof value !== 'object') return false

  for (const key of sourceKeys) {
    const child = value[key]
    if (Array.isArray(child) && child.length > 0) return true
    if (child && typeof child === 'object' && Object.keys(child).length > 0) return true
    if (typeof child === 'string' && child.trim()) return true
  }

  return false
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

function sourceCoverage(dirPath) {
  const files = listJsonFiles(dirPath)
  let withSources = 0
  const withoutSources = []

  for (const name of files) {
    const record = readJson(path.join(dirPath, name))
    if (hasNonEmptyEvidence(record)) {
      withSources += 1
    } else {
      withoutSources.push(name.replace(/\.json$/, ''))
    }
  }

  return {
    total: files.length,
    withSources,
    withoutSources: withoutSources.length,
    sampleWithoutSources: withoutSources.slice(0, 25),
  }
}

const herbCoverage = sourceCoverage(canonicalHerbDir)
const compoundCoverage = sourceCoverage(canonicalCompoundDir)

if (herbCoverage.total > 0 && herbCoverage.withSources === 0) {
  findings.push(issue('medium', 'HERBS_WITHOUT_RECORD_LEVEL_SOURCES', 'No canonical herb detail records expose direct source/evidence fields.', herbCoverage))
} else if (herbCoverage.withoutSources > 0) {
  findings.push(issue('medium', 'SOME_HERBS_WITHOUT_RECORD_LEVEL_SOURCES', 'Some canonical herb detail records lack direct source/evidence fields.', herbCoverage))
}

if (compoundCoverage.total > 0 && compoundCoverage.withSources === 0) {
  findings.push(issue('high', 'COMPOUNDS_WITHOUT_RECORD_LEVEL_SOURCES', 'No canonical compound detail records expose direct source/evidence fields.', compoundCoverage))
} else if (compoundCoverage.withoutSources > 0) {
  findings.push(issue('medium', 'SOME_COMPOUNDS_WITHOUT_RECORD_LEVEL_SOURCES', 'Some canonical compound detail records lack direct source/evidence fields.', compoundCoverage))
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

if (strict && findings.length > 0) {
  process.exit(1)
}
