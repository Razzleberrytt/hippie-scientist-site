#!/usr/bin/env node
/**
 * CI Validation: Agent Patch Integrity and Readiness
 *
 * Validates that all patches in agent/patches/ are properly formed and ready
 * for review/application. This runs in CI to catch malformed patches early.
 *
 * Exit codes:
 *   0: All patches valid, or no patches found
 *   1: One or more patches have validation errors
 *
 * Usage:
 *   node scripts/ci/validate-agent-patches.mjs
 *   npm run validate:agent-patches
 */

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

function validatePatch(file, patch) {
  const errors = []

  // Required fields
  if (!patch.patch_id || typeof patch.patch_id !== 'string') {
    errors.push('Missing or invalid patch_id')
  }

  if (!patch.slug || typeof patch.slug !== 'string') {
    errors.push('Missing or invalid slug')
  }

  if (!patch.source_agent || typeof patch.source_agent !== 'string') {
    errors.push('Missing or invalid source_agent')
  }

  if (!patch.patch_type || typeof patch.patch_type !== 'string') {
    errors.push(`Missing or invalid patch_type (expected one of: evidence, enrichment, affiliate)`)
  } else if (!['evidence', 'enrichment', 'affiliate'].includes(patch.patch_type)) {
    errors.push(`Invalid patch_type: ${patch.patch_type}`)
  }

  if (!patch.created_at || typeof patch.created_at !== 'string') {
    errors.push('Missing or invalid created_at timestamp')
  }

  // Schema version
  if (!patch.schema_version) {
    errors.push('Missing schema_version')
  }

  // Evidence patches must have evidence array
  if (patch.patch_type === 'evidence') {
    if (!Array.isArray(patch.evidence)) {
      errors.push('Evidence patch missing evidence array')
    }
  }

  // Enrichment patches should have enrichment content
  if (patch.patch_type === 'enrichment') {
    if (!patch.enrichment || typeof patch.enrichment !== 'object') {
      errors.push('Enrichment patch missing enrichment object')
    }
  }

  // SEO assets should be present
  if (patch.seo_assets && typeof patch.seo_assets !== 'object') {
    errors.push('Invalid seo_assets format')
  }

  // Metadata sources should be an array
  if (patch.metadata_sources && !Array.isArray(patch.metadata_sources)) {
    errors.push('metadata_sources must be an array')
  }

  // Review flags should be an array
  if (patch.review_flags && !Array.isArray(patch.review_flags)) {
    errors.push('review_flags must be an array')
  }

  return errors
}

const patches = walk(patchRoot)
const results = {
  total: patches.length,
  valid: 0,
  invalid: 0,
  errors: [],
}

console.log('\n=== Agent Patch Validation ===\n')

if (patches.length === 0) {
  console.log('No patches found in agent/patches/. This is OK.')
  process.exit(0)
}

for (const file of patches) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    const errors = validatePatch(file, data)

    if (errors.length > 0) {
      results.invalid += 1
      results.errors.push({
        file: path.relative(repoRoot, file),
        slug: data.slug || 'unknown',
        errors,
      })
    } else {
      results.valid += 1
    }
  } catch (err) {
    results.invalid += 1
    results.errors.push({
      file: path.relative(repoRoot, file),
      errors: [`Failed to parse JSON: ${err.message}`],
    })
  }
}

console.log(`Total patches: ${results.total}`)
console.log(`Valid: ${results.valid}`)
console.log(`Invalid: ${results.invalid}`)

if (results.errors.length > 0) {
  console.log('\n=== Errors ===\n')
  for (const error of results.errors) {
    console.log(`File: ${error.file}`)
    if (error.slug) console.log(`Slug: ${error.slug}`)
    for (const msg of error.errors) {
      console.log(`  - ${msg}`)
    }
    console.log()
  }
  process.exit(1)
}

console.log('\nAll patches are valid.')
process.exit(0)
