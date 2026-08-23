#!/usr/bin/env node

/**
 * Production deployment pipeline for Cloudflare Pages.
 *
 * Critical invariant: the deploy must run the same governance stages that
 * determine indexability in the full data pipeline before it regenerates
 * summary indexes, route manifests, internal links, and the sitemap.
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
    // `next/image` resolves every local image through the custom loader to a
    // WebP variant produced here. The deploy never ran this step, so the
    // variants did not exist in CI or on Cloudflare and every image shipped as
    // its full-size original. It must run before `build-production` renders the
    // pages that reference them.
    name: 'optimize-images',
    cmd: 'node scripts/optimize-images.mjs',
    inputs: ['public/images/**/*.{jpg,jpeg,png,gif,avif,tiff,webp}', 'scripts/optimize-images.mjs'],
    outputs: ['public/images/optimized/**/*.webp', 'lib/generated/optimized-images.json'],
  },
  {
    name: 'build-runtime-from-workbook',
    cmd: 'node --trace-uncaught --enable-source-maps scripts/data/build-runtime-from-workbook.mjs --out public/data',
    inputs: ['data/**/*.xlsx', 'data/**/*.json', 'data-sources/**/*.xlsx', 'scripts/data/**/*.mjs'],
    outputs: ['public/data/**/*'],
  },
  {
    name: 'normalize-evidence-grades',
    cmd: 'npx tsx scripts/data/normalize-evidence-grades.ts --data-dir=public/data',
    inputs: [
      'public/data/herbs.json',
      'public/data/compounds.json',
      'public/data/claims.json',
      'public/data/herbs-detail/**/*.json',
      'public/data/compounds-detail/**/*.json',
      'scripts/data/normalize-evidence-grades.ts',
      'lib/evidence-grade.ts',
      'lib/evidence-rationale.ts',
      'lib/profile-summary.ts',
      'lib/study-class.ts',
    ],
    outputs: ['public/data/herbs.json', 'public/data/compounds.json', 'ops/reports/evidence-grade-migration.json'],
    cacheable: false,
  },

  // Keep production on the same canonical governance path as `data:build`.
  // Before this sequence existed here, deploys regenerated summary indexes from
  // raw workbook output and could collapse hundreds of publishable profiles to
  // roughly ninety while the full data pipeline still produced ~350.
  {
    name: 'validate-sleep-evidence-engine',
    cmd: 'node scripts/data/validate-sleep-evidence-engine.mjs --data-dir=public/data',
    inputs: ['public/data/**/*', 'scripts/data/validate-sleep-evidence-engine.mjs'],
    outputs: [],
    cacheable: false,
  },
  {
    name: 'postprocess-workbook-payloads',
    cmd: 'node scripts/data/postprocess-workbook-payloads.mjs',
    inputs: ['public/data/**/*', 'scripts/data/postprocess-workbook-payloads.mjs'],
    outputs: ['public/data/**/*'],
    cacheable: false,
  },
  {
    name: 'apply-participant-counts',
    cmd: 'node scripts/data/apply-participant-counts.mjs',
    inputs: ['public/data/**/*', 'scripts/data/apply-participant-counts.mjs'],
    outputs: ['public/data/**/*'],
    cacheable: false,
  },
  {
    name: 'quarantine-unverifiable-citations',
    cmd: 'node scripts/data/quarantine-unverifiable-citations.mjs --data-dir=public/data',
    inputs: ['public/data/**/*', 'scripts/data/quarantine-unverifiable-citations.mjs'],
    outputs: ['public/data/**/*'],
    cacheable: false,
  },
  {
    name: 'apply-governance-overlay',
    cmd: 'node scripts/data/apply-governance-overlay.mjs --data-dir=public/data',
    inputs: ['public/data/**/*', 'scripts/data/apply-governance-overlay.mjs'],
    outputs: ['public/data/**/*'],
    cacheable: false,
  },
  {
    name: 'sanitize-public-text-pre-index',
    cmd: 'node scripts/data/sanitize-public-text.mjs --data-dir=public/data',
    inputs: ['public/data/**/*.json', 'scripts/data/sanitize-public-text.mjs', 'lib/editorial-leak.mjs'],
    outputs: ['public/data/**/*.json'],
    cacheable: false,
  },
  {
    name: 'build-related-runtime-maps',
    cmd: 'node scripts/data/build-related-runtime-maps.mjs --data-dir=public/data',
    inputs: ['public/data/herbs.json', 'public/data/compounds.json', 'public/data/herbs-detail/**/*.json', 'public/data/compounds-detail/**/*.json', 'scripts/data/build-related-runtime-maps.mjs'],
    outputs: ['public/data/runtime-maps/related-profiles.json', 'public/data/runtime-maps/comparison-map.json', 'public/data/runtime-maps/comparison-recommendations.json', 'public/data/runtime-maps/entity-to-conditions.json', 'public/data/runtime-maps/stack-map.json'],
  },
  {
    name: 'apply-pubmed-metadata',
    cmd: 'npx tsx scripts/data/apply-pubmed-metadata.ts',
    inputs: [
      'ops/cache/pubmed-metadata.json',
      'public/data/herbs-detail/**/*.json',
      'public/data/compounds-detail/**/*.json',
      'scripts/data/apply-pubmed-metadata.ts',
    ],
    outputs: ['public/data/herbs-detail/**/*.json', 'public/data/compounds-detail/**/*.json'],
    cacheable: false,
  },
  {
    name: 'build-runtime-summary-indexes',
    cmd: 'node scripts/data/build-runtime-summary-indexes.mjs --data-dir=public/data',
    inputs: ['public/data/herbs.json', 'public/data/compounds.json', 'scripts/data/build-runtime-summary-indexes.mjs'],
    outputs: ['public/data/summary-indexes/herbs-summary.json', 'public/data/summary-indexes/compounds-summary.json', 'public/data/summary-indexes/search-index.json', 'public/data/summary-indexes/alphabetical-shards.json', 'public/data/summary-indexes/entity-shards.json', 'public/data/summary-indexes/alpha-entity-shards.json'],
  },
  {
    // Indexability was stored four times per profile and only two of the four
    // agreed. This copies the detail payloads' status/robots/sitemap triple
    // from the summary index — the copy `app/sitemap.ts` and the profile pages
    // actually read — instead of letting it be maintained separately. It
    // changes no governance decision, so the gate immediately below should
    // report zero divergence rather than a shrinking number.
    name: 'sync-detail-indexability',
    cmd: 'node scripts/data/sync-detail-indexability.mjs --data-dir=public/data',
    inputs: ['public/data/summary-indexes/herbs-summary.json', 'public/data/summary-indexes/compounds-summary.json', 'public/data/herbs-detail/**/*.json', 'public/data/compounds-detail/**/*.json', 'scripts/data/sync-detail-indexability.mjs'],
    outputs: ['public/data/herbs-detail/**/*.json', 'public/data/compounds-detail/**/*.json'],
    cacheable: false,
  },
  {
    name: 'validate-indexability-divergence',
    cmd: 'node scripts/ci/report-indexability-divergence.mjs --data-dir=public/data',
    inputs: ['public/data/summary-indexes/*.json', 'public/data/herbs-detail/**/*.json', 'public/data/compounds-detail/**/*.json', 'config/indexability-divergence-baseline.json', 'scripts/ci/report-indexability-divergence.mjs'],
    outputs: [],
    cacheable: false,
  },
  {
    name: 'validate-production-indexability-budget',
    cmd: 'node scripts/ci/validate-production-indexability-budget.mjs --data-dir=public/data',
    inputs: ['public/data/summary-indexes/herbs-summary.json', 'public/data/summary-indexes/compounds-summary.json', 'config/indexability-production-budget.json', 'scripts/ci/validate-production-indexability-budget.mjs'],
    outputs: [],
    cacheable: false,
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
    name: 'build-search-index',
    cmd: 'node scripts/data/build-search-index.mjs --data-dir=public/data',
    cacheable: false,
  },
  {
    // A final sanitation pass occurs after every generated artifact is rebuilt so
    // nothing downstream can reintroduce internal editorial text.
    name: 'sanitize-public-text-final',
    cmd: 'node scripts/data/sanitize-public-text.mjs --data-dir=public/data',
    inputs: ['public/data/**/*.json', 'scripts/data/sanitize-public-text.mjs', 'lib/editorial-leak.mjs'],
    outputs: ['public/data/**/*.json'],
    cacheable: false,
  },
  {
    name: 'validate-editorial-leaks',
    cmd: 'node scripts/ci/validate-editorial-leaks.mjs',
    inputs: ['public/data/**/*.json', 'scripts/ci/validate-editorial-leaks.mjs', 'lib/editorial-leak.mjs'],
    outputs: [],
    cacheable: false,
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
    name: 'repair-broken-canonicals',
    cmd: 'node scripts/seo/repair-broken-canonicals.mjs',
    inputs: ['out/**/*.html', 'scripts/seo/repair-broken-canonicals.mjs'],
    outputs: ['out/**/*.html'],
    cacheable: false,
  },
  {
    name: 'inject-content-depth-support',
    cmd: 'node scripts/seo/inject-content-depth-support.mjs',
    inputs: ['out/**/*.html', 'scripts/seo/inject-content-depth-support.mjs'],
    outputs: ['out/**/*.html'],
    cacheable: false,
  },
  {
    name: 'validate-structured-data-regressions',
    cmd: 'node scripts/ci/validate-structured-data-regressions.mjs',
    inputs: ['out/**/*.html', 'scripts/ci/validate-structured-data-regressions.mjs'],
    outputs: [],
    cacheable: false,
  },
  {
    name: 'apply-redirect-overrides',
    cmd: 'node scripts/seo/apply-redirect-overrides.mjs',
    inputs: ['out/_redirects', 'public/redirect-overrides/**/*', 'scripts/seo/apply-redirect-overrides.mjs'],
    outputs: ['out/_redirects'],
    cacheable: false,
  },
  {
    name: 'canonicalize-internal-redirect-links',
    cmd: 'node scripts/seo/canonicalize-internal-redirect-links.mjs',
    inputs: ['out/**/*.html', 'out/_redirects', 'scripts/seo/canonicalize-internal-redirect-links.mjs'],
    outputs: ['out/**/*.html'],
    cacheable: false,
  },
  {
    name: 'audit-internal-redirect-links',
    cmd: 'node scripts/ci/audit-internal-redirect-links.mjs',
    inputs: ['out/**/*.html', 'out/_redirects', 'scripts/ci/audit-internal-redirect-links.mjs'],
    outputs: [],
    cacheable: false,
  },
  {
    name: 'write-static-sitemap',
    cmd: 'node scripts/seo/write-static-sitemap.mjs',
    inputs: ['out/**/*.html', 'out/_redirects', 'scripts/seo/write-static-sitemap.mjs'],
    outputs: ['out/sitemap.xml'],
    cacheable: false,
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
║              Deployment-Critical Only          ║
╚════════════════════════════════════════════════╝

Executing ${steps.length} essential build steps...
(Non-critical validation deferred to: npm run build:qa)
`)

let failed = false
const executed = []

for (const step of steps) {
  process.stdout.write(`⏱️  ${step.name.padEnd(38)} ... `)
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
      if (!cachedResult && !outputsPresent) console.log('[CACHE OUTPUTS MISSING]')
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
