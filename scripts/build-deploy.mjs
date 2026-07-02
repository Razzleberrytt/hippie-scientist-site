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
 * 1. validate-article-quality (article quality gates)
 * 2. build-blog (blog post generation)
 * 3. build-articles (long-form article generation)
 * 4. build-runtime-from-workbook (data extraction)
 * 5. build-related-runtime-maps (relationship maps)
 * 6. build-runtime-summary-indexes (search indexes)
 * 7. build-route-manifest (route discovery)
 * 8. build-internal-link-engine (semantic internal links)
 * 9. build-sitemap-manifest (SEO sitemap)
 * 10. build-export-batches (batch optimization)
 * 11. build-semantic-snapshots (snapshot generation)
 * 12. build-production (next build)
 * 13. validate-sitemap-static (prove /sitemap.xml is real XML, not HTML)
 * 14. repair-static-blog-h1s (legacy static blog heading repair)
 * 15. build-pagefind (static search index)
 *
 * Time estimate: cold builds are dominated by Next static export and Pagefind;
 * warm builds skip cacheable generation steps when inputs and outputs match.
 * Savings come from deferring non-critical checks to npm run build:qa and
 * reusing unchanged generated artifacts.
 */

import { execSync } from 'child_process'
import { performance } from 'perf_hooks'
import { fileURLToPath } from 'url'
import path from 'path'
import globPkg from 'glob'
import { CacheManager } from './cache/build-cache-manager.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const cache = new CacheManager()
const startTime = performance.now()

function outputPatternsPresent(patterns = []) {
  for (const pattern of patterns) {
    const matches = globPkg.sync(path.join(process.cwd(), pattern), { absolute: true, nodir: false })
    if (matches.length === 0) return false
  }
  return true
}

const steps = [
  {
    name: 'validate-article-quality',
    cmd: 'node scripts/ci/validate-article-quality.mjs',
    inputs: ['content/blog/**/*.{md,mdx}', 'content/articles/**/*.{md,mdx}', 'scripts/ci/validate-article-quality.mjs', 'scripts/lib/article-quality-gates.mjs'],
    outputs: [],
    cacheable: false,
  },
  {
    name: 'build-blog',
    cmd: 'node --trace-uncaught scripts/build-blog.mjs',
    inputs: ['content/blog/**/*.{md,mdx}', 'scripts/build-blog.mjs'],
    outputs: ['data/blog/posts.json'],
    cacheable: false,
  },
  {
    name: 'build-articles',
    cmd: 'node --trace-uncaught scripts/build-articles.mjs',
    inputs: ['content/articles/**/*.{md,mdx}', 'scripts/build-articles.mjs', 'scripts/lib/article-quality-gates.mjs'],
    outputs: ['data/articles/articles.json'],
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
    inputs: ['public/data/herbs.json', 'public/data/compounds.json', 'public/data/herbs-detail/**/*.json', 'public/data/compounds-detail/**/*.json', 'scripts/data/build-related-runtime-maps.mjs'],
    outputs: ['public/data/runtime-maps/related-profiles.json', 'public/data/runtime-maps/comparison-map.json', 'public/data/runtime-maps/comparison-recommendations.json', 'public/data/runtime-maps/entity-to-conditions.json', 'public/data/runtime-maps/stack-map.json'],
  },
  {
    name: 'build-runtime-summary-indexes',
    cmd: 'node scripts/data/build-runtime-summary-indexes.mjs --data-dir=public/data',
    inputs: ['public/data/herbs.json', 'public/data/compounds.json', 'scripts/data/build-runtime-summary-indexes.mjs'],
    outputs: ['public/data/summary-indexes/herbs-summary.json', 'public/data/summary-indexes/compounds-summary.json', 'public/data/summary-indexes/search-index.json', 'public/data/summary-indexes/alphabetical-shards.json', 'public/data/summary-indexes/entity-shards.json', 'public/data/summary-indexes/alpha-entity-shards.json'],
  },
  {
    name: 'build-route-manifest',
    cmd: 'node scripts/data/build-route-manifest.mjs --data-dir=public/data',
    inputs: ['public/data/herbs.json', 'public/data/compounds.json', 'public/data/guides/**/*.json', 'app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}', 'scripts/data/build-route-manifest.mjs'],
    outputs: ['public/data/runtime-manifests/route-manifest.json', 'public/data/runtime-manifests/route-segment-groups.json'],
  },
  {
    name: 'build-internal-link-engine',
    cmd: 'node scripts/data/build-internal-link-engine.mjs --data-dir=public/data',
    inputs: ['public/data/herbs.json', 'public/data/compounds.json', 'public/data/runtime-manifests/route-manifest.json', 'app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'data/goals.ts', 'scripts/data/build-internal-link-engine.mjs'],
    outputs: ['public/data/runtime-maps/internal-link-map.json', 'public/data/runtime-maps/topic-clusters.json', 'docs/internal-link-map.md', 'docs/topic-clusters.md', 'docs/pages-needing-links.md'],
  },
  {
    name: 'build-sitemap-manifest',
    cmd: 'node scripts/data/build-sitemap-manifest.mjs --data-dir=public/data',
    inputs: ['public/data/runtime-manifests/route-manifest.json', 'scripts/data/build-sitemap-manifest.mjs'],
    outputs: ['public/data/runtime-manifests/sitemap-chunk-manifest.json'],
  },
  {
    name: 'build-export-batches',
    cmd: 'node scripts/data/build-export-batches.mjs --data-dir=public/data',
    inputs: ['public/data/runtime-manifests/route-manifest.json', 'scripts/data/build-export-batches.mjs'],
    outputs: ['public/data/runtime-manifests/export-batch-manifest.json'],
  },
  {
    name: 'build-semantic-snapshots',
    cmd: 'node scripts/data/build-semantic-snapshots.mjs --data-dir=public/data',
    inputs: ['public/data/herbs.json', 'public/data/compounds.json', 'public/data/runtime-maps/related-profiles.json', 'scripts/data/build-semantic-snapshots.mjs'],
    outputs: ['public/data/runtime-snapshots/profile-semantic-snapshots.json'],
  },
  {
    name: 'build-production',
    cmd: 'node scripts/build-production.mjs',
    inputs: [
      'app/**/*',
      'components/**/*',
      'src/**/*',
      'lib/**/*',
      'styles/**/*',
      'public/data/**/*',
      'data/**/*.{ts,json}',
      'next.config.*',
      'postcss.config.*',
      'tailwind.config.*',
      'package.json',
    ],
    outputs: ['out/**/*', '.next/**/*'],
  },
  {
    name: 'validate-sitemap-static',
    cmd: 'node scripts/ci/validate-sitemap.mjs --require-built',
    inputs: ['out/sitemap.xml', 'scripts/ci/validate-sitemap.mjs'],
    outputs: [],
    cacheable: false,
  },
  {
    name: 'repair-static-blog-h1s',
    cmd: 'node scripts/ci/repair-static-blog-h1s.mjs',
    inputs: ['out/blog/**/*', 'scripts/ci/repair-static-blog-h1s.mjs'],
    outputs: ['out/blog/**/*'],
    cacheable: false,
  },
  {
    name: 'build-pagefind',
    cmd: 'node node_modules/pagefind/lib/runner/bin.cjs --site out --output-path out/pagefind',
    inputs: ['out/**/*.html', 'package.json', 'package-lock.json'],
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
      const outputsPresent = outputPatternsPresent(step.outputs || [])
      if (!cachedResult && outputsPresent) {
        console.log(`[CACHED] ${((performance.now() - stepStart) / 1000).toFixed(2)}s`)
        executed.push({ ...step, cached: true, duration: 0 })
        continue
      }
      if (!cachedResult && !outputsPresent) {
        console.log('[CACHE OUTPUTS MISSING]')
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

const totalSeconds = ((performance.now() - startTime) / 1000).toFixed(2)

if (failed) {
  console.error(`\n[build-deploy] FAILED after ${totalSeconds}s. Deployment should not continue.`)
  process.exit(1)
}

console.log(`\n[build-deploy] PASS: ${executed.length} steps completed in ${totalSeconds}s.`)
