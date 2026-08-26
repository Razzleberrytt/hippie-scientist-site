import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

import { cleanProductionBuildArtifacts } from './lib/clean-next-build-artifacts.mjs'

const pagesPath = path.join(process.cwd(), 'src/pages')
const tempPagesPath = path.join(process.cwd(), 'src/pages-temp')

let pagesMoved = false
let exitCode = 0

// Clean stale build/export artifacts while preserving .next/cache. The cache is
// safe incremental state restored by CI; deleting it here would turn the cache
// action into pure transfer/storage overhead. Everything else remains clean so
// stale output cannot masquerade as a successful production build.
cleanProductionBuildArtifacts()

function validateResponsiveImageContract() {
  console.log('[build] Validating responsive image production contract...')
  execSync('node scripts/ci/validate-responsive-image-contract.mjs', {
    stdio: 'inherit',
    env: process.env,
  })
}

try {
  // `data:build` intentionally applies PubMed metadata a second time after the
  // derived/search artifacts are generated, then re-quarantines invalid or
  // misattributed citations and sanitizes the affected public text. A direct
  // deployment build must converge on that same final citation state before
  // publication invariants run; otherwise CI and Cloudflare can disagree about
  // which profiles are safe to index.
  console.log('[build] Finalizing production citation integrity...')
  execSync('npx tsx scripts/data/apply-pubmed-metadata.ts', {
    stdio: 'inherit',
    env: process.env,
  })
  execSync('node scripts/data/quarantine-unverifiable-citations.mjs --data-dir=public/data', {
    stdio: 'inherit',
    env: process.env,
  })
  execSync('node scripts/data/sanitize-public-text.mjs --data-dir=public/data', {
    stdio: 'inherit',
    env: process.env,
  })

  // Publication invariants are deployment-critical. Before evaluating them,
  // project explicit claim/source provenance into the classifier surface so a
  // real linked human/safety/dose source is not rejected merely because its
  // paper title omits a classification keyword. Unsupported numeric dosage is
  // suppressed from the public runtime instead of deindexing an otherwise
  // grounded profile.
  console.log('[build] Preparing production evidence provenance...')
  execSync('node scripts/data/prepare-production-evidence-provenance.mjs --data-dir=public/data', {
    stdio: 'inherit',
    env: process.env,
  })

  // The workbook/runtime build may preserve weak records for internal research,
  // but immediately before Next renders production HTML we scrub internal
  // language and force any remaining invariant-breaking public profile to
  // NEEDS_REVIEW/noindex. If demotions occur, derived route/search/sitemap data
  // is rebuilt from the governed state.
  console.log('[build] Enforcing production content invariants...')
  execSync('node scripts/data/enforce-production-content-invariants.mjs --data-dir=public/data --refresh-derived', {
    stdio: 'inherit',
    env: process.env,
  })
  execSync('node scripts/ci/validate-production-content-invariants.mjs --data-dir=public/data', {
    stdio: 'inherit',
    env: process.env,
  })

  // This check must run AFTER final invariant enforcement. Running it only
  // earlier in build:deploy allowed the corpus to pass at ~350 indexable
  // profiles and then silently collapse to ~82 immediately before rendering.
  execSync('node scripts/ci/validate-production-indexability-budget.mjs --data-dir=public/data', {
    stdio: 'inherit',
    env: process.env,
  })

  if (fs.existsSync(pagesPath)) {
    console.log('[build] Temporarily moving src/pages to avoid Next.js routing conflicts...')
    fs.renameSync(pagesPath, tempPagesPath)
    pagesMoved = true
  }

  // `build:deploy` already warms this cacheable generator, but build-production
  // is also invoked directly by profiling/orchestration paths. Keep the actual
  // production-render boundary self-sufficient: fresh variants are a fast no-op,
  // while missing/stale variants are regenerated before Next emits image URLs.
  console.log('[build] Ensuring responsive image variants...')
  execSync('node scripts/optimize-images.mjs', {
    stdio: 'inherit',
    env: process.env,
  })

  console.log('[build] Running next build...')
  execSync('npx next build', {
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096', NEXT_TELEMETRY_DISABLED: '1' },
  })

  // Do not treat optimizer + loader wiring as sufficient proof. Inspect the
  // actual exported herb/compound HTML and the copied files so a future loader,
  // `sizes`, orchestration, or static-export change cannot silently reconnect
  // production to full-size originals or nonexistent generated assets.
  validateResponsiveImageContract()

  // Some legacy guide templates still emit raw JSON-LD instead of the shared
  // serializer. Normalize every exported JSON-LD payload at the deployment
  // boundary so first-party Person/Organization entities always resolve to the
  // canonical IDs without weakening schema truthfulness checks.
  console.log('[build] Normalizing static schema identities...')
  execSync('npx tsx scripts/seo/normalize-static-schema-identities.ts', {
    stdio: 'inherit',
    env: process.env,
  })

  // The source-data gate proves structured invariants. This second gate proves
  // the user/crawler-visible HTML did not reintroduce placeholders, version
  // labels, debug strings or other internal-development language in templates.
  console.log('[build] Auditing production-visible language...')
  execSync('node scripts/ci/audit-production-visible-language.mjs', {
    stdio: 'inherit',
    env: process.env,
  })
} catch (error) {
  // Next.js 15 static export on Windows occasionally throws an ENOENT when it tries to
  // rename .next/export/500.html -> .next/server/pages/500.html after a successful page
  // generation pass (all 1250+ pages exported).  The out/ directory is fully populated
  // at this point so the export itself succeeded.  We catch only that specific race and
  // treat the build as passing; all other errors still fail the pipeline.
  const isKnown500Rename =
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'ENOENT' &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.includes('500.html')

  // Also detect when the error is wrapped inside a child_process exec error whose
  // stderr / stdout contains the ENOENT rename message.
  const execMsg = error && typeof error === 'object' && 'stderr' in error
    ? String(error.stderr)
    : ''
  const isKnown500RenameExec =
    execMsg.includes('500.html') && execMsg.includes('ENOENT')

  const outExists = fs.existsSync(path.join(process.cwd(), 'out', 'index.html'))

  if ((isKnown500Rename || isKnown500RenameExec) && outExists) {
    console.warn(
      '[build] WARNING: Next.js threw a known Windows rename error for 500.html, but the ' +
      'out/ directory was populated successfully. Verifying the responsive image contract before accepting the export.',
    )
    try {
      validateResponsiveImageContract()
    } catch (validationError) {
      console.error('[build] Responsive image validation failed after recovered export:', validationError)
      exitCode = 1
    }
  } else {
    console.error('[build] Build failed:', error)
    exitCode = 1
  }
} finally {
  if (pagesMoved && fs.existsSync(tempPagesPath)) {
    console.log('[build] Restoring src/pages...')
    fs.renameSync(tempPagesPath, pagesPath)
  }
  if (exitCode !== 0) {
    process.exit(exitCode)
  }
}
