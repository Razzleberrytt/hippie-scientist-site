#!/usr/bin/env node

/**
 * Build Deploy Pipeline
 *
 * Streamlined build for production deployment to Cloudflare Pages
 * Includes ONLY essential steps needed for deployment.
 * Non-critical validation and audit steps are excluded.
 *
 * Usage: npm run build:deploy
 * Or: node scripts/build-deploy.mjs
 *
 * Steps executed in order:
 * 1. build-blog (blog post generation)
 * 2. build-runtime-from-workbook (data extraction)
 * 3. build-related-runtime-maps (relationship maps)
 * 4. build-runtime-summary-indexes (search indexes)
 * 5. build-route-manifest (route discovery)
 * 6. build-sitemap-manifest (SEO sitemap)
 * 7. build-export-batches (batch optimization)
 * 8. build-semantic-snapshots (snapshot generation)
 * 9. validate-data-next (data validation)
 * 10. build-production (next build)
 * 11. verify-generated-data (output verification)
 *
 * Time estimate: ~45-60s (instead of ~180s with full validation)
 * Savings: ~120s by deferring non-critical checks to npm run build:qa
 */

import { execSync } from 'child_process'
import { performance } from 'perf_hooks'
import { fileURLToPath } from 'url'
import path from 'path'
import { CacheManager } from './cache/build-cache-manager.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const cache = new CacheManager()
const startTime = performance.now()

const steps = [
  {
    name: 'build-blog',
    cmd: 'node scripts/build-blog.mjs',
    inputs: ['data/blog/**/*.md'],
    outputs: ['src/content/**/*', '.blog-cache'],
  },
  {
    name: 'build-runtime-from-workbook',
    cmd: 'node scripts/data/build-runtime-from-workbook.mjs --out public/data',
    inputs: ['data/**/*.xlsx', 'data/**/*.json'],
    outputs: ['public/data/**/*'],
  },
  {
    name: 'build-related-runtime-maps',
    cmd: 'node scripts/data/build-related-runtime-maps.mjs --data-dir=public/data',
    inputs: ['public/data/**/*'],
    outputs: ['public/data/related-maps.json'],
  },
  {
    name: 'build-runtime-summary-indexes',
    cmd: 'node scripts/data/build-runtime-summary-indexes.mjs --data-dir=public/data',
    inputs: ['public/data/**/*'],
    outputs: ['public/data/summary-indexes.json'],
  },
  {
    name: 'build-route-manifest',
    cmd: 'node scripts/data/build-route-manifest.mjs --data-dir=public/data',
    inputs: ['public/data/**/*', 'src/**/*.{ts,tsx}'],
    outputs: ['public/data/route-manifest.json'],
  },
  {
    name: 'build-sitemap-manifest',
    cmd: 'node scripts/data/build-sitemap-manifest.mjs --data-dir=public/data',
    inputs: ['public/data/**/*'],
    outputs: ['public/data/sitemap-manifest.json', 'public/sitemap.xml'],
  },
  {
    name: 'build-export-batches',
    cmd: 'node scripts/data/build-export-batches.mjs --data-dir=public/data',
    inputs: ['public/data/**/*'],
    outputs: ['public/data/export-batches/**/*'],
  },
  {
    name: 'build-semantic-snapshots',
    cmd: 'node scripts/data/build-semantic-snapshots.mjs --data-dir=public/data',
    inputs: ['public/data/**/*'],
    outputs: ['public/data/semantic-snapshots/**/*'],
  },
  {
    name: 'validate-data-next',
    cmd: 'node scripts/data/validate-data-next.mjs',
    inputs: ['public/data/**/*'],
  },
  {
    name: 'build-production',
    cmd: 'node scripts/build-production.mjs',
    inputs: ['src/**/*', 'public/data/**/*', 'pages/**/*', 'app/**/*'],
    outputs: ['out/**/*', '.next/**/*'],
  },
  {
    name: 'verify-generated-data',
    cmd: 'node scripts/data/verify-generated-data.mjs',
    inputs: ['public/data/**/*'],
  },
]

console.log(`
╔════════════════════════════════════════════════╗
║       Build Deploy Pipeline (Production)       ║
║              Deployment-Critical Only           ║
╚════════════════════════════════════════════════╝

Executing ${steps.length} essential build steps...
(Non-critical validation deferred to: npm run build:qa)
`)

let failed = false
const executed = []

for (const step of steps) {
  process.stdout.write(`⏱️  ${step.name.padEnd(35)} ... `)

  const stepStart = performance.now()

  try {
    // Check cache first
    const shouldSkip = !process.env.CLEAR_CACHE && process.env.USE_CACHE !== 'false'
    let skipped = false

    if (shouldSkip) {
      const cachedResult = await cache.shouldRunStep(step.name, step.inputs || [])
      if (!cachedResult) {
        console.log(`[CACHED] ${((performance.now() - stepStart) / 1000).toFixed(2)}s`)
        executed.push({ ...step, cached: true, duration: 0 })
        continue
      }
    }

    // Execute step
    execSync(step.cmd, {
      cwd: process.cwd(),
      stdio: 'inherit',
    })

    const stepDuration = performance.now() - stepStart

    // Cache the result
    if (step.outputs) {
      await cache.markStepComplete(step.name, step.outputs, step.inputs || [])
    }

    executed.push({ ...step, duration: stepDuration, cached: false })
    console.log(`✓ ${(stepDuration / 1000).toFixed(2)}s`)
  } catch (error) {
    executed.push({ ...step, failed: true })
    console.log(`✗ FAILED`)
    failed = true
    break
  }
}

if (!failed) {
  const totalDuration = performance.now() - startTime
  const cachedSteps = executed.filter(s => s.cached).length
  const executedSteps = executed.filter(s => !s.cached && !s.failed).length

  console.log(`
╔════════════════════════════════════════════════╗
║           ✓ Deploy Build Successful!           ║
╚════════════════════════════════════════════════╝

Summary:
  Total Time: ${(totalDuration / 1000).toFixed(2)}s
  Steps Executed: ${executedSteps}
  Steps Cached: ${cachedSteps}
  Total Steps: ${executed.length}

Next Steps:
  1. Verify output: npm run build:qa
  2. Deploy to Cloudflare Pages

Pro Tip: To clear build cache, run:
  npm run cache:clear
`)

  process.exit(0)
} else {
  console.log(`
╔════════════════════════════════════════════════╗
║     ✗ Deploy Build Failed                      ║
║     Check error above for details              ║
╚════════════════════════════════════════════════╝
`)
  process.exit(1)
}
