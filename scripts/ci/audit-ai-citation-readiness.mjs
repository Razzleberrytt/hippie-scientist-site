#!/usr/bin/env node
/**
 * Canonical AI-search / citation-readiness orchestrator.
 *
 * Unique responsibility retained here: comparison-page grounding structure.
 * All general answer-engine, research-topology, entity-completeness, and claim-
 * integrity checks delegate to their authoritative implementations.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const COMPARE_DIR = path.join(ROOT, 'app', 'guides', 'compare')
const HERBS_DATA = path.join(ROOT, 'public', 'data', 'herbs.json')
const COMPOUNDS_DATA = path.join(ROOT, 'public', 'data', 'compounds.json')
const strict = process.argv.includes('--strict')
const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx'

const REQUIRED_MELATONIN_HEADINGS = [
  'Melatonin vs magnesium: quick answer',
  'Magnesium glycinate vs melatonin: the core difference',
  'Can you take magnesium and melatonin together?',
  'Side effects: melatonin vs magnesium',
  'Which is better for staying asleep?',
]

function readComparePages(dir = COMPARE_DIR, prefix = '') {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory() || /^\[/.test(entry.name)) return []
    const childDir = path.join(dir, entry.name)
    const pageFile = path.join(childDir, 'page.tsx')
    const slug = prefix ? `${prefix}/${entry.name}` : entry.name
    return [
      ...(existsSync(pageFile) ? [{ slug, file: pageFile }] : []),
      ...readComparePages(childDir, slug),
    ]
  })
}

function hasCanonicalComparePath(source, slug) {
  const canonicalPath = `/guides/compare/${slug}/`
  const canonicalNoSlash = `/guides/compare/${slug}`
  return source.includes(canonicalPath) || source.includes(canonicalNoSlash)
}

function hasNoncanonicalCompareLink(source) {
  return /href=(?:{)?["'`]\/compare(?:\/|["'`])/.test(source)
    || /url:\s*["'`]https:\/\/thehippiescientist\.net\/compare(?:\/|["'`])/.test(source)
}

function isNoindexPage(source) {
  return /robots:\s*{[^}]*index:\s*false/.test(source)
}

function auditComparisonPage({ slug, file }) {
  const source = readFileSync(file, 'utf8')
  const findings = []
  if (isNoindexPage(source)) return { slug, file: path.relative(ROOT, file), findings }

  if (!hasCanonicalComparePath(source, slug)) findings.push('missing explicit /guides/compare/* canonical path')
  if (!/<h1[\s>]/.test(source)) findings.push('missing visible H1')
  if (!/CitationReadySummary|Quick answer|quick answer/i.test(source)) findings.push('missing quick-answer/citation summary signal')
  if (!/References|CompareCitations|ShowMeTheStudies/.test(source)) findings.push('missing visible references/citations surface')
  if (!/AuthorityJsonLd|CompareSchema|JsonLd|SchemaGraphScript/.test(source)) findings.push('missing JSON-LD/schema component')
  if (!/\/info\/methodology|\/info\/disclaimer|\/safety-checker|\/info\/dosing/.test(source)) {
    findings.push('missing methodology/disclaimer/safety/dosing support link')
  }
  if (!/\/guides\/compare\//.test(source)) findings.push('missing canonical internal link to /guides/compare/')
  if (hasNoncanonicalCompareLink(source)) findings.push('contains noncanonical /compare link; prefer /guides/compare/')
  if (/AggregateRating|['"]@type['"]\s*:\s*['"]Review['"]/.test(source)) {
    findings.push('contains rating/review schema term; verify visible, real provenance')
  }

  if (slug === 'melatonin-vs-magnesium') {
    for (const heading of REQUIRED_MELATONIN_HEADINGS) {
      if (!source.includes(heading)) findings.push(`missing grounding-query heading: ${heading}`)
    }
  }

  return { slug, file: path.relative(ROOT, file), findings }
}

function runCheck({ id, label, command, args, optional = false, enabled = true }) {
  if (!enabled) {
    console.log(`SKIP  ${label}`)
    return { id, label, status: 'skipped', exitCode: 0 }
  }
  const run = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit', env: process.env })
  const exitCode = run.status ?? 1
  if (exitCode === 0) {
    console.log(`PASS  ${label}`)
    return { id, label, status: 'passed', exitCode }
  }
  if (optional) {
    console.log(`WARN  ${label} exited ${exitCode}`)
    return { id, label, status: 'warning', exitCode }
  }
  console.error(`FAIL  ${label} exited ${exitCode}`)
  return { id, label, status: 'failed', exitCode }
}

console.log('\nCanonical AI-search quality audit')
console.log('='.repeat(72))

const comparisonResults = readComparePages().map(auditComparisonPage)
const comparisonFindings = comparisonResults.filter((result) => result.findings.length > 0)
console.log(`[ai-search] comparison pages=${comparisonResults.length} withFindings=${comparisonFindings.length}`)
for (const result of comparisonFindings.slice(0, 100)) {
  console.log(`WARN  /guides/compare/${result.slug}/ (${result.file})`)
  for (const finding of result.findings) console.log(`  - ${finding}`)
}
if (comparisonFindings.length > 100) console.log(`[ai-search] ${comparisonFindings.length - 100} additional comparison findings omitted`)

const strictArg = strict ? ['--strict'] : []
const checks = [
  runCheck({
    id: 'answer-engine',
    label: 'Answer-engine discovery, extraction, profile semantics, and anti-patterns',
    command: process.execPath,
    args: ['scripts/ci/audit-ai-answer-engine-readiness.mjs', ...strictArg],
  }),
  runCheck({
    id: 'citation-topology',
    label: 'Canonical research + AI citation-readiness topology',
    command: NPX,
    args: ['tsx', 'scripts/ci/audit-ai-citation-topology.ts', ...strictArg],
  }),
  runCheck({
    id: 'claim-integrity',
    label: 'Extractable claim/evidence consistency',
    command: process.execPath,
    args: ['scripts/ci/audit-ai-claim-integrity.mjs', ...strictArg],
  }),
  runCheck({
    id: 'entity-completeness',
    label: 'AI entity identity, claims, citations, relationships, safety, and freshness',
    command: process.execPath,
    args: ['scripts/ci/audit-ai-entity-completeness.mjs'],
    enabled: existsSync(HERBS_DATA) && existsSync(COMPOUNDS_DATA),
  }),
]

const hardFailures = checks.filter((check) => check.status === 'failed')
const comparisonFailure = strict && comparisonFindings.length > 0

console.log('\n[ai-search] summary')
console.log(`  comparison findings: ${comparisonFindings.length}${strict ? ' (strict)' : ' (advisory)'}`)
for (const check of checks) console.log(`  ${check.id}: ${check.status}`)

if (hardFailures.length || comparisonFailure) {
  console.error('[ai-search] FAILED')
  process.exit(1)
}

console.log('[ai-search] PASS — canonical AI-search checks completed without hard failures.')
