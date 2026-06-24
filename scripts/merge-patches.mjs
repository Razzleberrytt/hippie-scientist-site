#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const patchRoot = path.join(repoRoot, 'agent', 'patches')
const outDir = path.join(repoRoot, 'ops', 'agent-review')
const jsonOut = path.join(outDir, 'approved-patches.json')
const csvOut = path.join(outDir, 'approved-patches.csv')

function parseArgs(argv) {
  const args = {
    slug: '',
    all: false,
  }

  for (const arg of argv) {
    if (arg === '--all') args.all = true
    if (arg.startsWith('--slug=')) args.slug = arg.slice('--slug='.length).trim()
  }

  return args
}

function walk(dir) {
  if (!fs.existsSync(dir)) return []

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) return walk(fullPath)
    return fullPath.endsWith('.json') ? [fullPath] : []
  })
}

function loadPatches() {
  return walk(patchRoot).flatMap(file => {
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
      return parsed && typeof parsed === 'object'
        ? [{ ...parsed, _source_file: path.relative(repoRoot, file) }]
        : []
    } catch {
      return []
    }
  })
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function extractClaims(patch) {
  return asArray(patch.claims)
    .map(claim => {
      if (typeof claim === 'string') return claim
      return claim?.claim || claim?.text || JSON.stringify(claim)
    })
    .filter(Boolean)
}

function extractPubMedStudies(patch) {
  return [
    ...asArray(patch.pubmedStudies),
    ...asArray(patch.pubmed_studies),
    ...asArray(patch.pubmed?.studies),
    ...asArray(patch.discovery_metadata?.pubmed?.studies),
  ]
}

function extractClinicalTrials(patch) {
  return [
    ...asArray(patch.clinicalTrials),
    ...asArray(patch.clinical_trials),
    ...asArray(patch.clinicaltrials?.trials),
    ...asArray(patch.discovery_metadata?.clinicalTrials?.trials),
  ]
}

function normalizePatch(patch) {
  const scoring = patch.scoring || patch.score || {}
  const evidence = asArray(patch.evidence)
  const entries = asArray(patch.entries)

  return {
    slug: patch.slug || patch.compound_slug || '',
    source_agent: patch.source_agent || '',
    patch_type: patch.patch_type || '',
    patch_id: patch.patch_id || '',
    source_file: patch._source_file || '',
    confidence_score: patch.confidence_score ?? scoring.confidence_score ?? '',
    evidence_strength: patch.evidence_strength ?? scoring.evidence_strength ?? '',
    claims: extractClaims(patch),
    clinicalTrials: extractClinicalTrials(patch),
    pubmedStudies: extractPubMedStudies(patch),
    evidence_count: evidence.length || entries.length,
    rejection_reasons: asArray(patch.validation?.rejection_reasons || patch.rejection_reasons),
    review_status: 'selected_for_review',
    reviewed_at: new Date().toISOString(),
  }
}

function csvCell(value) {
  const text = Array.isArray(value) ? JSON.stringify(value) : String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

function toCsv(rows) {
  const headers = [
    'slug',
    'source_agent',
    'patch_type',
    'patch_id',
    'confidence_score',
    'evidence_strength',
    'claims',
    'clinicalTrials',
    'pubmedStudies',
    'evidence_count',
    'rejection_reasons',
    'review_status',
    'reviewed_at',
    'source_file',
  ]

  return [
    headers.join(','),
    ...rows.map(row => headers.map(header => csvCell(row[header])).join(',')),
  ].join('\n')
}

function summarize(rows) {
  const bySlug = new Map()

  for (const row of rows) {
    const slug = row.slug || 'unknown'
    const current = bySlug.get(slug) || {
      slug,
      patches: 0,
      claims: 0,
      evidence: 0,
      trials: 0,
      pubmed: 0,
      rejections: new Set(),
      strengths: new Set(),
    }

    current.patches += 1
    current.claims += row.claims.length
    current.evidence += Number(row.evidence_count || 0)
    current.trials += row.clinicalTrials.length
    current.pubmed += row.pubmedStudies.length
    row.rejection_reasons.forEach(reason => current.rejections.add(reason))
    if (row.evidence_strength) current.strengths.add(row.evidence_strength)

    bySlug.set(slug, current)
  }

  return [...bySlug.values()]
}

const args = parseArgs(process.argv.slice(2))

if (!args.all && !args.slug) {
  console.error('Usage: node scripts/merge-patches.mjs --slug=<compound-slug> OR --all')
  process.exit(1)
}

const patches = loadPatches().map(normalizePatch)
const selected = args.all ? patches : patches.filter(patch => patch.slug === args.slug)

console.log('\n=== Agent Patch Review Export ===\n')

if (!selected.length) {
  console.log(`No patches found for ${args.all ? 'all compounds' : args.slug}.`)
  process.exit(0)
}

for (const item of summarize(selected)) {
  console.log(`Compound: ${item.slug}`)
  console.log(`Patches: ${item.patches}`)
  console.log(`Claims: ${item.claims}`)
  console.log(`Evidence rows: ${item.evidence}`)
  console.log(`ClinicalTrials metadata: ${item.trials}`)
  console.log(`PubMed metadata: ${item.pubmed}`)
  console.log(`Evidence strengths: ${[...item.strengths].join(', ') || 'none'}`)
  console.log(`Rejections: ${[...item.rejections].join(', ') || 'none'}`)
  console.log('---')
}

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(jsonOut, `${JSON.stringify(selected, null, 2)}\n`)
fs.writeFileSync(csvOut, `${toCsv(selected)}\n`)

console.log(`Exported ${selected.length} selected patches for review.`)
console.log(`JSON: ${path.relative(repoRoot, jsonOut)}`)
console.log(`CSV: ${path.relative(repoRoot, csvOut)}`)
console.log('Workbook untouched. public/data untouched.')
