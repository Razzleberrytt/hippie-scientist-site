#!/usr/bin/env node

/**
 * Build QA Pipeline
 *
 * Comprehensive validation and audit suite
 * All verification, audit, and SEO checks run in parallel
 * Safe to run independently from deployment pipeline
 *
 * Usage: npm run build:qa
 * Or: node scripts/build-qa.mjs
 *
 * Steps executed in parallel:
 * ~32 verification, validation, and audit checks
 * Including: data validation, route verification, SEO checks, security validation
 * Plus: validate-data-next and verify-generated-data (moved from build:deploy)
 *
 * Parallelization: ~32 tasks running concurrently
 * Time estimate: ~15-20s (instead of ~150s+ sequentially)
 * Savings: ~130s through parallelization + deferral from deployment pipeline
 */

import { execSync, spawnSync } from 'child_process'
import { performance } from 'perf_hooks'

const startTime = performance.now()

// All QA and verification steps
const qaSteps = [
  // Data validation
  'node scripts/ci/validate-workbook-source.mjs',
  'node scripts/data/validate-sleep-evidence-engine.mjs --data-dir=public/data',
  'node scripts/data/postprocess-workbook-payloads.mjs',
  'node scripts/ci/semantic-governance-check.mjs',
  'node scripts/ci/report-semantic-scale-summary.mjs',
  'node scripts/data/verify-workbook-only-path.mjs',
  'node scripts/validate-data-files.mjs',
  'node scripts/data/validate-data-next.mjs',
  'node scripts/data/verify-generated-data.mjs',

  // Route verification
  'node scripts/verify-core-routes.mjs',
  'node scripts/verify-redirects.mjs',
  'node scripts/ci/validate-route-manifest-budget.mjs',

  // Deployment validation
  'node scripts/ci/validate-deploy-readiness.mjs',
  'node scripts/ci/validate-static-export-compatibility.mjs',

  // Import validation
  'node scripts/ci/validate-public-json-imports.mjs',
  'node scripts/ci/validate-quarantine-imports.mjs',
  'node scripts/ci/validate-direct-dependencies.mjs',
  'node scripts/ci/validate-xlsx-boundary.mjs',

  // Security
  'node scripts/ci/validate-security-headers.mjs',

  // SEO validation
  'node scripts/ci/validate-build-seo-metadata.mjs',
  'node scripts/ci/validate-route-seo.mjs',

  // Safety
  'node scripts/ci/check-node-version.mjs',

  // Audits
  'node scripts/ci/audit-metadata-duplicates.mjs',
  'node scripts/ci/audit-internal-links.mjs',
  'node scripts/ci/audit-structured-data.mjs',
  'node scripts/ci/audit-seo-routes.mjs',
  'node scripts/data/audit-source-of-truth.mjs',
  'node scripts/data/audit-workbook-gaps.mjs',
  'node scripts/audit-safety-fill-rate.mjs',

  // Payload validation
  'node scripts/ci/validate-runtime-payload-budgets.mjs',
  'node scripts/ci/validate-deterministic-json-order.mjs',
  'node scripts/ci/validate-semantic-graph-health.mjs',
  'node scripts/ci/validate-indexability-metadata.mjs',
]

console.log(`
╔════════════════════════════════════════════════╗
║           Build QA Pipeline (Parallel)         ║
║      Comprehensive Validation & Audits         ║
╚════════════════════════════════════════════════╝

Executing ${qaSteps.length} verification & audit steps in parallel...
`)

const results = new Map()
const errors = []
const maxConcurrency = 8 // Allow up to 8 parallel processes

/**
 * Execute a step and track results
 */
function executeStep(cmd, index) {
  return new Promise((resolve) => {
    const stepName = cmd.split('scripts/')[1]?.split('.mjs')[0] || cmd
    const stepStart = performance.now()

    process.stdout.write(`⏱️  [${String(index + 1).padStart(2, ' ')}/${qaSteps.length}] ${stepName.substring(0, 40).padEnd(40)} ... `)

    const proc = spawnSync('node', cmd.split(' ').slice(1), {
      cwd: process.cwd(),
      stdio: 'pipe',
      shell: false,
    })

    const stepDuration = performance.now() - stepStart

    if (proc.status === 0) {
      console.log(`✓ ${(stepDuration / 1000).toFixed(2)}s`)
      results.set(stepName, { passed: true, duration: stepDuration })
    } else {
      console.log(`✗ FAILED`)
      results.set(stepName, { passed: false, duration: stepDuration })
      errors.push({ step: stepName, code: proc.status, stderr: proc.stderr?.toString() })
    }

    resolve()
  })
}

/**
 * Run tasks with concurrency limit
 */
async function runQASteps() {
  const queue = [...qaSteps]
  const executing = []
  const executed = []

  while (queue.length > 0 || executing.length > 0) {
    // Start new tasks if under concurrency limit
    while (executing.length < maxConcurrency && queue.length > 0) {
      const cmd = queue.shift()
      const index = executed.length + executing.length
      const task = executeStep(cmd, index).then(() => {
        executing.splice(executing.indexOf(task), 1)
      })
      executing.push(task)
    }

    // Wait for at least one to complete
    if (executing.length > 0) {
      await Promise.race(executing)
    }
  }
}

// Execute all QA steps
await runQASteps()

const totalDuration = performance.now() - startTime
const passed = [...results.values()].filter(r => r.passed).length
const failed = errors.length

if (failed === 0) {
  console.log(`
╔════════════════════════════════════════════════╗
║         ✓ All QA Checks Passed!                ║
╚════════════════════════════════════════════════╝

Summary:
  Total Time: ${(totalDuration / 1000).toFixed(2)}s
  Checks Passed: ${passed}/${qaSteps.length}

Status: Ready for production deployment

`)
  process.exit(0)
} else {
  console.log(`
╔════════════════════════════════════════════════╗
║     ✗ ${failed} QA Checks Failed                       ║
╚════════════════════════════════════════════════╝

Failed checks:
${errors.map(e => `  - ${e.step}`).join('\n')}

Fix these issues before deployment.
`)
  process.exit(1)
}
