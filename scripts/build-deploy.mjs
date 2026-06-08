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
 * 9. build-production (next build)
 * 10. build-pagefind (static search index)
 *
 * Time estimate: ~40-55s (instead of ~180s with full validation)
 * Savings: ~125s by deferring non-critical checks to npm run build:qa
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
    cmd: 'node --trace-uncaught scripts/build-blog.mjs',
    inputs: ['content/blog/**/*.{md,mdx}', 'scripts/build-blog.mjs'],
    outputs: ['data/blog/posts.json'],
    cacheable: false,
  },
  {
    name: 'build-runtime-from-workbook',
    cmd: 'node --trace-uncaught --enable-source-maps scripts/data/build-runtime-from-workbook.mjs --out public/data',
    inputs: ['data/**/*.xlsx', 'data/**/*.json', 'data-sources/**/*.xlsx', 'scripts/data/**/*.mjs'],
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
    name: 'build-production',
    cmd: 'node scripts/build-production.mjs',
    inputs: ['src/**/*', 'public/data/**/*', 'pages/**/*', 'app/**/*'],
    outputs: ['out/**/*', '.next/**/*'],
  },
  {
    name: 'build-pagefind',
    cmd: 'npm run build:pagefind',
    inputs: ['out/**/*'],
    outputs: ['out/pagefind/**/*'],
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
    const shouldSkip = step.cacheable !== false && !process.env.CLEAR_CACHE && process.env.USE_CACHE !== 'false'

    if (shouldSkip) {
      const cachedResult = await cache.shouldRunStep(step.name, step.inputs || [])
      if (!cachedResult) {
        console.log(`[CACHED] ${((performance.now() - stepStart) / 1000).toFixed(2)}s`)
        executed.push({ ...step, cached: true, duration: 0 })
        continue
      }
    }

    execSync(step.cmd, {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --trace-uncaught`.trim(),
      },
    })

    const stepDuration = performance.now() - stepStart

    if (step.outputs && step.cacheable !== false) {
      await cache.markStepComplete(step.name, step.outputs, step.inputs || [])
    }

    executed.push({ ...step, duration: stepDuration, cached: false })
    console.log(`✓ ${(stepDuration / 1000).toFixed(2)}s`)
  } catch (error) {
    executed.push({ ...step, failed: true })
    console.log('✗ FAILED')
    console.error(`\n[build-deploy] Step failed: ${step.name}`)
    console.error(`[build-deploy] Command: ${step.cmd}`)
    if (error?.status !== undefined) console.error(`[build-deploy] Exit code: ${error.status}`)
    if (error?.signal) console.error(`[build-deploy] Signal: ${error.signal}`)
    if (error?.message) console.error(`[build-deploy] Error: ${error.message}`)
    if (error?.stack) console.error(`[build-deploy] Wrapper stack:\n${error.stack}`)
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
}

console.log(`
╔════════════════════════════════════════════════╗
║     ✗ Deploy Build Failed                      ║
║     Check error above for details              ║
╚════════════════════════════════════════════════╝
`)

process.exit(1)
