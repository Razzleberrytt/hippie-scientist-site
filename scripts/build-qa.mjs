#!/usr/bin/env node

/**
 * Build QA Pipeline
 *
 * Comprehensive validation and audit suite. Independent checks run with bounded
 * concurrency so this remains safe to run separately from deployment.
 */

import { spawn } from 'node:child_process'
import { performance } from 'node:perf_hooks'

const startTime = performance.now()

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

  // Runtime safety
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

const maxConcurrency = 8
const results = new Map()
const errors = []
let nextStepIndex = 0

console.log(`
╔════════════════════════════════════════════════╗
║           Build QA Pipeline (Parallel)         ║
║      Comprehensive Validation & Audits         ║
╚════════════════════════════════════════════════╝

Executing ${qaSteps.length} verification & audit steps with concurrency=${Math.min(maxConcurrency, qaSteps.length)}...
`)

function executeStep(cmd, index) {
  return new Promise((resolve) => {
    const args = cmd.split(' ').slice(1)
    const stepName = cmd.split('scripts/')[1]?.split('.mjs')[0] || cmd
    const stepStart = performance.now()
    const stderr = []
    let settled = false

    process.stdout.write(`⏱️  [${String(index + 1).padStart(2, ' ')}/${qaSteps.length}] ${stepName.substring(0, 40).padEnd(40)} ... `)

    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      stdio: ['ignore', 'ignore', 'pipe'],
    })

    child.stderr.on('data', chunk => stderr.push(chunk))

    const finish = (passed, code = 0, error = null) => {
      if (settled) return
      settled = true

      const stepDuration = performance.now() - stepStart
      results.set(stepName, { passed, duration: stepDuration })

      if (passed) {
        console.log(`✓ ${(stepDuration / 1000).toFixed(2)}s`)
      } else {
        console.log('✗ FAILED')
        errors.push({
          step: stepName,
          code,
          stderr: error?.message || Buffer.concat(stderr).toString(),
        })
      }
      resolve()
    }

    child.once('error', error => finish(false, -1, error))
    child.once('close', code => finish(code === 0, code ?? -1))
  })
}

async function runWorker() {
  while (nextStepIndex < qaSteps.length) {
    const index = nextStepIndex
    nextStepIndex += 1
    await executeStep(qaSteps[index], index)
  }
}

await Promise.all(
  Array.from(
    { length: Math.min(maxConcurrency, qaSteps.length) },
    () => runWorker(),
  ),
)

const totalDuration = performance.now() - startTime
const passed = [...results.values()].filter(result => result.passed).length
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
}

console.log(`
╔════════════════════════════════════════════════╗
║     ✗ ${failed} QA Checks Failed                       ║
╚════════════════════════════════════════════════╝

Failed checks:
${errors.map(error => `  - ${error.step}`).join('\n')}

Fix these issues before deployment.
`)
process.exit(1)
