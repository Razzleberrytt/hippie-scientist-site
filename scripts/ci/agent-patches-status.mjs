#!/usr/bin/env node
/**
 * Agent Patches Status Dashboard
 *
 * Quick overview of patch status, validation, and next steps.
 *
 * Usage:
 *   node scripts/ci/agent-patches-status.mjs
 *   npm run status:agent-patches
 */

import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const patchRoot = path.join(repoRoot, 'agent', 'patches')
const reviewRoot = path.join(repoRoot, 'ops', 'agent-review')

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

function getPatchStats() {
  const patches = walk(patchRoot)
  const stats = {
    total: patches.length,
    byType: {},
    byAgent: {},
    byDate: {},
    validationErrors: [],
  }

  for (const file of patches) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'))

      // By type
      const type = data.patch_type || 'unknown'
      stats.byType[type] = (stats.byType[type] || 0) + 1

      // By agent
      const agent = data.source_agent || 'unknown'
      stats.byAgent[agent] = (stats.byAgent[agent] || 0) + 1

      // By date
      const date = data.created_at?.split('T')[0] || 'unknown'
      stats.byDate[date] = (stats.byDate[date] || 0) + 1
    } catch (err) {
      stats.validationErrors.push({
        file: path.relative(repoRoot, file),
        error: err.message,
      })
    }
  }

  return stats
}

function getReviewStatus() {
  const json = path.join(reviewRoot, 'approved-patches.json')
  if (!fs.existsSync(json)) {
    return { reviewed: 0, exists: false }
  }

  try {
    const data = JSON.parse(fs.readFileSync(json, 'utf8'))
    return {
      reviewed: Array.isArray(data) ? data.length : 0,
      exists: true,
      timestamp: fs.statSync(json).mtime,
    }
  } catch {
    return { reviewed: 0, exists: false, error: 'Failed to parse' }
  }
}

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
}

const bright = (text) => `${colors.bright}${text}${colors.reset}`
const green = (text) => `${colors.green}${text}${colors.reset}`
const yellow = (text) => `${colors.yellow}${text}${colors.reset}`
const red = (text) => `${colors.red}${text}${colors.reset}`
const cyan = (text) => `${colors.cyan}${text}${colors.reset}`

console.log(`\n${bright('=== Agent Patches Status ===')}\n`)

const stats = getPatchStats()
const review = getReviewStatus()

// Summary
console.log(`${bright('Patches Found:')} ${stats.total}`)

if (stats.total === 0) {
  console.log(`${yellow('ℹ No patches detected. Agent not yet run or patches directory empty.')}\n`)
  process.exit(0)
}

// By type
console.log(`\n${bright('By Type:')}`)
for (const [type, count] of Object.entries(stats.byType).sort()) {
  console.log(`  ${type}: ${count}`)
}

// By agent
console.log(`\n${bright('By Agent:')}`)
for (const [agent, count] of Object.entries(stats.byAgent).sort()) {
  console.log(`  ${agent}: ${count}`)
}

// Date range
const dates = Object.keys(stats.byDate).sort()
if (dates.length > 0) {
  console.log(`\n${bright('Date Range:')}`)
  console.log(`  ${dates[0]} to ${dates[dates.length - 1]}`)
}

// Validation
if (stats.validationErrors.length > 0) {
  console.log(`\n${red('⚠ Validation Errors:')}`)
  for (const err of stats.validationErrors) {
    console.log(`  ${err.file}: ${err.error}`)
  }
  console.log(`\n${red('Fix with:')} npm run validate:agent-patches`)
} else {
  console.log(`\n${green('✓ All patches valid')}`)
}

// Review status
console.log(`\n${bright('Review Status:')}`)
if (review.exists) {
  console.log(`  Reviewed patches: ${review.reviewed}`)
  console.log(`  Last review: ${review.timestamp?.toISOString() || 'unknown'}`)
} else {
  console.log(`  ${yellow('No review artifacts found')}`)
  console.log(`  ${cyan('Run:')} npm run agent:review`)
}

// Next steps
console.log(`\n${bright('Next Steps:')}`)

if (stats.validationErrors.length > 0) {
  console.log(`  1. ${red('Fix validation errors')}`)
  console.log(`     npm run validate:agent-patches`)
} else {
  console.log(`  1. ${green('✓ Validation passed')}`)
}

if (!review.exists) {
  console.log(`  2. Review patches`)
  console.log(`     npm run agent:review`)
} else {
  console.log(`  2. ${green('✓ Review generated')}`)
  console.log(`     Check: ops/agent-review/approved-patches.csv`)
}

console.log(`  3. Apply approved patches to workbook`)
console.log(`     See: ${cyan('docs/agent-integration-guide.md')}`)

console.log(`\n${bright('Helpful Commands:')}`)
console.log(`  npm run validate:agent-patches    # Validate patch structure`)
console.log(`  npm run agent:review              # Generate review artifacts`)
console.log(`  npm run report:pending-patches    # Summary of pending patches`)
console.log(`  npm run check:full                # Full validation pipeline`)

console.log()
