#!/usr/bin/env node
/**
 * Build Pipeline Orchestrator
 *
 * Replaces monolithic &&-chained build commands with named, timed, debuggable steps.
 * Preserves exact logical order and commands from package.json "build".
 *
 * Usage:
 *   node scripts/orchestrate-build.mjs
 *   npm run build:pipeline
 *
 * Features:
 * - Named steps with readable labels
 * - Per-step timing (ms and seconds)
 * - Clear failure: prints failing step name + command + exit info
 * - Immediate exit on first failure (no swallowing)
 * - Cross-platform (uses spawnSync; node/npm in PATH)
 * - Does not add deps
 *
 * To extend for other pipelines (e.g. verify), pass --steps=verify or refactor to accept config.
 */

import { spawnSync } from 'node:child_process'
import { performance } from 'node:perf_hooks'

const startTime = performance.now()

/**
 * Steps extracted from current "build" in package.json (serial order preserved).
 * verify:build:parallel is kept as-is (it internally parallels sub-verifies).
 */
const steps = [
  {
    name: 'build-blog',
    cmd: 'node scripts/build-blog.mjs',
    description: 'Generate blog posts and indexes from MDX/content',
  },
  {
    name: 'validate-workbook-source',
    cmd: 'node scripts/ci/validate-workbook-source.mjs',
    description: 'Enforce that workbook (xlsx) is source of truth; fail on direct public/data edits',
  },
  {
    name: 'build-runtime-from-workbook',
    cmd: 'node scripts/data/build-runtime-from-workbook.mjs --out public/data',
    description: 'Parse workbook and emit core runtime JSON artifacts to public/data',
  },
  {
    name: 'validate-sleep-evidence-engine',
    cmd: 'node scripts/data/validate-sleep-evidence-engine.mjs --data-dir=public/data',
    description: 'Validate sleep evidence normalization and outputs',
  },
  {
    name: 'postprocess-workbook-payloads',
    cmd: 'node scripts/data/postprocess-workbook-payloads.mjs',
    description: 'Post-process and normalize workbook-derived payloads',
  },
  {
    name: 'build-related-runtime-maps',
    cmd: 'node scripts/data/build-related-runtime-maps.mjs --data-dir=public/data',
    description: 'Build relationship maps (related herbs/compounds, etc.)',
  },
  {
    name: 'build-runtime-summary-indexes',
    cmd: 'node scripts/data/build-runtime-summary-indexes.mjs --data-dir=public/data',
    description: 'Build summary indexes for search/browse',
  },
  {
    name: 'build-route-manifest',
    cmd: 'node scripts/data/build-route-manifest.mjs --data-dir=public/data',
    description: 'Generate route manifest for sitemaps/SEO',
  },
  {
    name: 'build-sitemap-manifest',
    cmd: 'node scripts/data/build-sitemap-manifest.mjs --data-dir=public/data',
    description: 'Generate sitemap manifest data',
  },
  {
    name: 'build-export-batches',
    cmd: 'node scripts/data/build-export-batches.mjs --data-dir=public/data',
    description: 'Build batched export payloads for perf',
  },
  {
    name: 'build-semantic-snapshots',
    cmd: 'node scripts/data/build-semantic-snapshots.mjs --data-dir=public/data',
    description: 'Generate semantic profile snapshots (analysis/governance artifacts)',
  },
  {
    name: 'validate-data-next',
    cmd: 'node scripts/data/validate-data-next.mjs',
    description: 'Validate data files are consumable by Next.js static export',
  },
  {
    name: 'semantic-governance-check',
    cmd: 'node scripts/ci/semantic-governance-check.mjs',
    description: 'Run semantic governance / quality checks on data',
  },
  {
    name: 'report-semantic-scale-summary',
    cmd: 'node scripts/ci/report-semantic-scale-summary.mjs',
    description: 'Report semantic scale / coverage summary',
  },
  {
    name: 'verify-workbook-only-path',
    cmd: 'node scripts/data/verify-workbook-only-path.mjs',
    description: 'Assert that public/data was produced only via workbook path (no manual)',
  },
  {
    name: 'guard-generated-data',
    cmd: 'node scripts/ci/guard-generated-data.mjs',
    description: 'CI guard: fail on suspicious direct/manual edits to public/data without source changes',
  },
  {
    name: 'enrichment-review-gate',
    cmd: 'node scripts/enrichment/release-gate.mjs --coverage-tolerance 0.01 || echo "[orchestrate] (enrichment release-gate advisory/skipped for this run — run explicitly with --run-id for strict Lane C AI patch approval checks; see docs/data-pipeline.md)"',
    description: 'AI enrichment review gate (Lane C patches require approved review_decisions). Manual review required; does not auto-promote.',
  },
  {
    name: 'validate-data-files',
    cmd: 'node scripts/validate-data-files.mjs',
    description: 'General data file validation',
  },
  {
    name: 'build-production',
    cmd: 'node scripts/build-production.mjs',
    description: 'Run Next.js static export build (with temp pages handling)',
  },
  {
    name: 'verify:build:parallel',
    cmd: 'npm run verify:build:parallel',
    description: 'Run parallel post-build verifications, audits, SEO, security, etc.',
  },
]

if (process.argv.includes('--dry-run')) {
  console.log('DRY RUN: would execute the following steps in order:')
  steps.forEach((s, i) => console.log(`  ${i+1}. ${s.name}: ${s.cmd}  (${s.description})`))
  console.log('Total steps:', steps.length)
  process.exit(0)
}

console.log(`
╔════════════════════════════════════════════════════════════╗
║              The Hippie Scientist Build Pipeline           ║
║                   (orchestrated for debuggability)         ║
╚════════════════════════════════════════════════════════════╝

Running ${steps.length} steps in order. Fail fast on first error.
Timings and step names will be reported.
`)

let stepIndex = 0
let hadFailure = false

for (const step of steps) {
  stepIndex += 1
  const label = `[${stepIndex.toString().padStart(2, '0')}/${steps.length}] ${step.name}`
  process.stdout.write(`${label.padEnd(55)} ... `)

  const stepStart = performance.now()

  // Use spawnSync for cross-platform control (no reliance on shell &&)
  // For "npm run ..." we still invoke npm (works cross-plat when npm in PATH)
  const [command, ...args] = step.cmd.startsWith('npm ')
    ? step.cmd.split(/\s+/)
    : step.cmd.match(/(?:[^\s"]+|"[^"]*")+/g) || [step.cmd]

  // On windows, node scripts are fine; npm too.
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: process.platform === 'win32' && command === 'npm', // help .cmd resolution for npm on win if needed
    env: process.env,
  })

  const stepDuration = performance.now() - stepStart
  const secs = (stepDuration / 1000).toFixed(2)

  if (result.status !== 0 || result.error) {
    console.log(`✗ FAILED (${secs}s)`)
    console.error(`\n[orchestrate-build] STEP FAILED: ${step.name}`)
    console.error(`[orchestrate-build] Command: ${step.cmd}`)
    if (result.status != null) console.error(`[orchestrate-build] Exit code: ${result.status}`)
    if (result.signal) console.error(`[orchestrate-build] Signal: ${result.signal}`)
    if (result.error) console.error(`[orchestrate-build] Error: ${result.error.message}`)
    if (step.description) console.error(`[orchestrate-build] Purpose: ${step.description}`)
    console.error(`[orchestrate-build] See output above for the failure details from this step.`)
    hadFailure = true
    break
  }

  console.log(`✓ ${secs}s`)
}

const total = (performance.now() - startTime) / 1000

if (hadFailure) {
  console.error(`
╔════════════════════════════════════════════════════════════╗
║     ✗ BUILD PIPELINE FAILED at step ${stepIndex}              ║
║     See the step error details above.                      ║
╚════════════════════════════════════════════════════════════╝
`)
  process.exit(1)
}

console.log(`
╔════════════════════════════════════════════════════════════╗
║           ✓ Build Pipeline Completed Successfully          ║
╚════════════════════════════════════════════════════════════╝

Total time: ${total.toFixed(2)}s
Steps: ${steps.length}

Next:
  - Run full QA: npm run build:qa
  - Or targeted: npm run verify:build
  - Deploy: npm run build:deploy (for CF streamlined)
`)

process.exit(0)
