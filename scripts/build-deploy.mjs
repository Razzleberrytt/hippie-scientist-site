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
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import globPkg from 'glob'
import { CacheManager } from './cache/build-cache-manager.mjs'

const cache = new CacheManager()
const startTime = performance.now()

// ---------------------------------------------------------------------------
// Data-segment change detection.
//
// The workbook→JSON data segment is a pure function of its inputs: identical
// data inputs + pipeline scripts produce identical public/data outputs.
// Rebuilding it on every deploy (e.g. for a copy-only change like an About
// page edit) is pure waste, so when the inputs are unchanged the whole
// segment is skipped and the previously built public/data is reused instead.
//
// On GitHub Actions, public/data is restored from the build-intermediates
// cache; locally it persists between runs. The gate is conservative: any
// doubt (missing marker, missing outputs, hashing error) means "rebuild".
// Set CLEAR_CACHE=1 (or USE_CACHE=false) to force a full data rebuild.
// ---------------------------------------------------------------------------
const DATA_INPUT_GLOBS = [
  'data-sources/herb_monograph_master.xlsx',
  'data-sources/workbook-patches/**/*.json',
  'data-sources/runtime-enrichment/**/*',
  'data/**/*.xlsx',
  'data/canonical/**/*.json',
  'public/_redirects',
  'ops/cache/pubmed-metadata.json',
  'scripts/data/**/*',
  'scripts/workbook-source.mjs',
  'scripts/build-deploy.mjs',
  'scripts/cache/**/*.mjs',
  'config/*.mjs',
  'lib/**/*.mjs',
  'content/articles/**/*',
  'content/blog/**/*',
  'package.json',
  'package-lock.json',
  '.nvmrc',
]
// Steps that depend ONLY on data inputs (never on app/components/lib code).
// Everything else in the pipeline still runs on every build.
const DATA_SEGMENT_STEPS = new Set([
  'build-runtime-from-workbook',
  'normalize-evidence-grades',
  'postprocess-workbook-payloads',
  'apply-participant-counts',
  'quarantine-unverifiable-citations',
  'apply-governance-overlay',
  'build-related-runtime-maps',
  'apply-pubmed-metadata',
  'build-runtime-summary-indexes',
  // Detail indexability copies can drift independently in a restored warm cache.
  // Always run sync-detail-indexability before the divergence gate.
  // Search also reads content/learn frontmatter and MUST refresh on copy edits.
  // Never skip it based solely on workbook/data segment inputs.
])
const DATA_HASH_MARKER = path.join('.build-cache', 'data-segment-hash')

function hashDataInputs() {
  const files = []
  for (const pattern of DATA_INPUT_GLOBS) {
    try {
      files.push(...globPkg.sync(pattern, { absolute: true, nodir: true }))
    } catch {
      // A bad pattern must never silently green-light a skip.
      throw new Error(`data-gate: failed to glob inputs for pattern: ${pattern}`)
    }
  }
  files.sort()
  const hash = createHash('sha256')
  for (const file of files) {
    try {
      hash.update(path.relative(process.cwd(), file).replaceAll(path.sep, '/'))
      hash.update(fs.readFileSync(file))
    } catch {
      hash.update(`${file}:NOT_FOUND`)
    }
  }
  return hash.digest('hex').substring(0, 32)
}

function isDataSegmentFresh(dataInputHash) {
  try {
    if (!fs.existsSync(DATA_HASH_MARKER)) return false
    if (fs.readFileSync(DATA_HASH_MARKER, 'utf8').trim() !== dataInputHash) return false
    // Outputs must actually exist — a partial cache restore or fresh
    // checkout must never take the fast path.
    for (const relativePath of [
      'herbs.json',
      'compounds.json',
      'claims.json',
      'summary-indexes/herbs-summary.json',
      'summary-indexes/compounds-summary.json',
      'runtime-maps/related-profiles.json',
    ]) {
      if (!fs.existsSync(path.join('public', 'data', relativePath))) return false
    }
    return true
  } catch {
    return false
  }
}

let dataInputHash = null
let skipDataSegment = false
try {
  dataInputHash = hashDataInputs()
  const cacheBypassed = !!process.env.CLEAR_CACHE || process.env.USE_CACHE === 'false'
  skipDataSegment = !cacheBypassed && isDataSegmentFresh(dataInputHash)
} catch (error) {
  console.log(`[build-deploy] Data change detection unavailable (${error.message}); running full data segment.`)
}
if (skipDataSegment) {
  console.log('[build-deploy] Data inputs unchanged since last successful data build — skipping pure data segment.')
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
    inputs: ['content/articles/**/*.{md,mdx}', 'scripts/build-articles.mjs', 'scripts/lib/article-quality-gates.mjs', 'package-lock.json'],
    outputs: ['data/articles/articles.json'],
  },
  {
    name: 'build-article-social-images',
    cmd: 'node --trace-uncaught scripts/media/build-article-social-images.mjs',
    inputs: [
      'content/articles/**/*.{md,mdx}',
      'content/blog/**/*.{md,mdx}',
      'scripts/media/build-article-social-images.mjs',
      'lib/article-social.js',
      'package-lock.json',
    ],
    outputs: ['public/media/social/articles/**/*.jpg', 'public/media/social/articles/manifest.json'],
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
    inputs: ['public/data/herbs.json', 'public/data/compounds.json', 'public/data/guides/**/*.json', 'app/**/*.{ts,tsx}', 'scripts/data/build-route-manifest.mjs'],
    outputs: ['public/data/runtime-manifests/route-manifest.json', 'public/data/runtime-manifests/route-segment-groups.json'],
  },
  {
    name: 'build-internal-link-engine',
    cmd: 'npx tsx scripts/data/build-internal-link-engine.mjs --data-dir=public/data',
    inputs: ['public/data/herbs.json', 'public/data/compounds.json', 'public/data/runtime-manifests/route-manifest.json', 'app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'data/goals.ts', 'lib/runtime-visibility.ts', 'lib/deprecated-herb-canonicals.ts', 'lib/deprecated-compound-canonicals.ts', 'scripts/data/build-internal-link-engine.mjs'],
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
    // The ONLY sanitize pass. The old pre-index pass was removed: everything
    // served (pages, search index, sitemap) is derived from post-sanitize
    // data, so one pass after all generated artifacts are rebuilt is sufficient.
    // build-search-index runs after it so the shipped index can never contain
    // internal editorial text.
    name: 'sanitize-public-text-final',
    cmd: 'node scripts/data/sanitize-public-text.mjs --data-dir=public/data',
    inputs: ['public/data/**/*.json', 'scripts/data/sanitize-public-text.mjs', 'lib/editorial-leak.mjs'],
    outputs: ['public/data/**/*.json'],
    cacheable: false,
  },
  {
    name: 'build-search-index',
    cmd: 'node scripts/data/build-search-index.mjs --data-dir=public/data',
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
  // inject-content-depth-support is intentionally NOT in the pipeline.
  // It injected an identical "How to interpret X" block into every herb and
  // compound page, varying only ${pageName}/${summary}. That made ~307 profiles
  // near-duplicates of each other: mean pairwise 5-gram similarity reached 0.450
  // for /herbs/ and 0.274 for /compounds/, against 0.041 for hand-written
  // /articles/. Google declined to index 45% of herbs and 85% of compounds while
  // indexing 96-98% of editorial pages. Re-enabling it will re-flatten the corpus.
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
let responsiveImagesReady = false

for (const step of steps) {
  process.stdout.write(`⏱️  ${step.name.padEnd(38)} ... `)
  const stepStart = performance.now()

  try {
    // Coarse data-segment gate: skip pure data steps when data inputs are
    // unchanged (see DATA_SEGMENT_STEPS above). Conservative by construction.
    if (skipDataSegment && DATA_SEGMENT_STEPS.has(step.name)) {
      console.log(`[SKIP - data unchanged] ${((performance.now() - stepStart) / 1000).toFixed(2)}s`)
      executed.push({ ...step, duration: 0, cached: true, skippedData: true })
      continue
    }

    const shouldSkip = step.cacheable !== false && !process.env.CLEAR_CACHE && process.env.USE_CACHE !== 'false'

    if (shouldSkip) {
      const shouldRun = await cache.shouldRunStep(step.name, step.inputs || [], step.outputs || [])
      if (!shouldRun) {
        if (step.name === 'optimize-images') responsiveImagesReady = true
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
        ...(step.name === 'build-production' && responsiveImagesReady ? { RESPONSIVE_IMAGES_READY: '1' } : {}),
        NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --trace-uncaught`.trim(),
      },
    })

    if (step.name === 'optimize-images') responsiveImagesReady = true
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

// Record the data input hash so the next build can skip the data segment
// when nothing data-related changed. Written only on success; a failed build
// leaves the previous marker (if any) untouched.
if (!failed && !skipDataSegment && dataInputHash) {
  try {
    fs.mkdirSync(path.dirname(DATA_HASH_MARKER), { recursive: true })
    fs.writeFileSync(DATA_HASH_MARKER, dataInputHash + '\n')
  } catch {
    // Non-fatal: the next build will simply rebuild the data segment.
  }
}

console.log(`\n[build-deploy] PASS: ${executed.length} steps completed in ${totalSeconds}s.`)
