#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

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
    claims: claims.length,
    evidence_rows: evidence.length,
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

for (const patch of patches.slice(-10)) {
  const summary = summarize(patch)

  console.log(`Compound: ${summary.slug}`)
  console.log(`Evidence Rows: ${summary.evidence_rows}`)
  console.log(`Claims: ${summary.claims}`)
  console.log(`Validation: ${summary.validation_status}`)
  console.log(`Rejections: ${summary.rejections.join(', ') || 'none'}`)
  console.log(`Issues: ${summary.issues.join(', ') || 'none'}`)
  console.log('---')
}
