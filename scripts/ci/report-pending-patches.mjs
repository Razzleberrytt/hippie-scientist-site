#!/usr/bin/env node
/**
 * CI Report: Pending Agent Patches
 *
 * Detects and reports patches that exist but have not yet been reviewed or applied.
 * This helps track agent enrichment work that needs human review.
 *
 * Exit codes:
 *   0: All OK (no patches, or patches reported)
 *   1: Error running the check
 *
 * Usage:
 *   node scripts/ci/report-pending-patches.mjs
 *   npm run report:pending-patches
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

function loadPatches() {
  return walk(patchRoot).flatMap(file => {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'))
      return [{ ...data, _file: path.relative(repoRoot, file) }]
    } catch {
      return []
    }
  })
}

const patches = loadPatches()

console.log('\n=== Pending Agent Patches Report ===\n')

if (patches.length === 0) {
  console.log('No pending patches found.')
  process.exit(0)
}

// Group by date and slug
const byDate = new Map()
const bySlug = new Map()

for (const patch of patches) {
  const date = patch.created_at?.split('T')[0] || 'unknown-date'
  const slug = patch.slug || 'unknown-slug'

  if (!byDate.has(date)) {
    byDate.set(date, [])
  }
  byDate.get(date).push(patch)

  if (!bySlug.has(slug)) {
    bySlug.set(slug, [])
  }
  bySlug.get(slug).push(patch)
}

console.log(`Total patches: ${patches.length}`)
console.log(`Date range: ${[...byDate.keys()].sort().join(' to ')}`)
console.log(`Unique compounds: ${bySlug.size}\n`)

console.log('=== By Compound ===\n')
for (const [slug, slugPatches] of [...bySlug.entries()].sort()) {
  const agents = new Set(slugPatches.map(p => p.source_agent || 'unknown'))
  const types = new Set(slugPatches.map(p => p.patch_type || 'unknown'))

  console.log(`${slug}`)
  console.log(`  Patches: ${slugPatches.length}`)
  console.log(`  Agents: ${[...agents].sort().join(', ')}`)
  console.log(`  Types: ${[...types].sort().join(', ')}`)
  console.log(`  Latest: ${slugPatches[slugPatches.length - 1].created_at || 'unknown'}`)
  console.log()
}

console.log('=== By Date ===\n')
for (const [date, datePatches] of [...byDate.entries()].sort()) {
  const slugs = new Set(datePatches.map(p => p.slug || 'unknown'))
  console.log(`${date}: ${datePatches.length} patches across ${slugs.size} compounds`)
}

console.log('\n=== Next Steps ===')
console.log('1. Review patches: npm run agent:review')
console.log('2. Merge approved patches: npm run agent:merge (when implemented)')
console.log('3. Or manually apply patches via workbook edits')
console.log()

process.exit(0)
