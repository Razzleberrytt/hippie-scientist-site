#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { severityLevel } from '../agent/lib/qa-severity.js'

const repoRoot = process.cwd()
const patchRoot = path.join(repoRoot, 'agent', 'patches')

function walk(dir) {
  if (!fs.existsSync(dir)) return []

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      return walk(full)
    }

    return full.endsWith('.json') ? [full] : []
  })
}

function loadPatches() {
  return walk(patchRoot).flatMap(file => {
    try {
      return [JSON.parse(fs.readFileSync(file, 'utf8'))]
    } catch {
      return []
    }
  })
}

function summarize(patch) {
  const evidence = Array.isArray(patch.evidence) ? patch.evidence : []
  const claims = Array.isArray(patch.claims) ? patch.claims : []
  const rejections = patch?.validation?.rejection_reasons || []
  const metadataSources = patch?.metadata_sources || []
  const confidenceNotes = patch?.confidence_notes || []
  const reviewFlags = patch?.review_flags || []
  const seoAssets = patch?.seo_assets || {}

  const issues = []

  if (evidence.some(row => !row?.pmid_or_source)) {
    issues.push('missing_sources')
  }

  if (
    claims.some(claim =>
      /cure|guaranteed|proven|miracle/i.test(JSON.stringify(claim))
    )
  ) {
    issues.push('overconfident_language')
  }

  const duplicateCheck = new Set()

  for (const row of evidence) {
    const key = row?.pmid_or_source || JSON.stringify(row)

    if (duplicateCheck.has(key)) {
      issues.push('duplicate_evidence')
      break
    }

    duplicateCheck.add(key)
  }

  return {
    slug: patch.slug,
    research_depth: patch.research_depth || 'unknown',
    claims: claims.length,
    evidence_rows: evidence.length,
    metadata_sources: metadataSources.length,
    enrichment_assets: Object.keys(seoAssets).length,
    uncertainty_flags: confidenceNotes.length,
    conflicting_evidence_flags: reviewFlags.length,
    validation_status: patch?.validation?.validation_status || 'unknown',
    rejections,
    issues,
  }
}

const patches = loadPatches()

console.log('\n=== Hippie Scientist Patch Review ===\n')

if (patches.length === 0) {
  console.log('No patches found.')
  process.exit(0)
}

for (const patch of patches.slice(-20)) {
  const summary = summarize(patch)

  console.log(`Compound: ${summary.slug}`)
  console.log(`Research Depth: ${summary.research_depth}`)
  console.log(`Evidence Rows: ${summary.evidence_rows}`)
  console.log(`Claims: ${summary.claims}`)
  console.log(`Metadata Sources: ${summary.metadata_sources}`)
  console.log(`SEO Assets: ${summary.enrichment_assets}`)
  console.log(`Uncertainty Flags: ${summary.uncertainty_flags}`)
  console.log(`Conflict Flags: ${summary.conflicting_evidence_flags}`)
  console.log(`Validation: ${summary.validation_status}`)
  console.log(`Rejections: ${summary.rejections.join(', ') || 'none'}`)

  const issueSummary = summary.issues.map(issue => ({
    issue,
    severity: severityLevel(issue),
  }))

  console.log(`Issues: ${JSON.stringify(issueSummary) || 'none'}`)
  console.log('---')
}
