#!/usr/bin/env node
/**
 * Guard against manual/direct edits to generated public/data artifacts.
 *
 * This is a preflight/CI check. It fails the pipeline if public/data/*.json
 * files appear to have been hand-edited in a change without touching the
 * corresponding source-of-truth (workbook) or the data build scripts.
 *
 * Conservative / safe:
 * - Legitimate changes produced by running the build scripts are allowed
 *   *if* the PR/commit also touches at least one recognized source/build file.
 * - Does not inspect content diffs (would be fragile); only presence of changes.
 * - Does not block changes that touch BOTH data outputs AND build sources.
 *
 * Limitations (documented):
 * - Relies on git diff vs base (origin/main or CI merge-base). Shallow clones
 *   or force-pushes may affect detection.
 * - Reformats or trivial json changes without source touch will be flagged
 *   (intentional - encourages running the build instead of hand edits).
 * - If a build script change affects output in a way that doesn't touch the
 *   "recognized source" list, it may false-positive (add the script path below).
 * - Not a substitute for `validate-workbook-source` or `verify-workbook-only-path`.
 * - Extended to support docs/internal/issues.csv + scripts/cleanup.js for controlled
 *   dupe hygiene (dry-run review + --reviewed --apply only; see validation-report.md).
 *
 * Usage (in CI or locally before commit/PR):
 *   node scripts/ci/guard-generated-data.mjs
 *   npm run guard:generated-data
 *
 * In CI (GitHub Actions example):
 *   - name: Guard generated data
 *     run: node scripts/ci/guard-generated-data.mjs
 *     # runs on pull_request / push to main
 *
 * Exit 0 = OK (no suspicious direct edits)
 * Exit 1 = Suspicious manual edit detected
 */

import { execSync, spawnSync } from 'node:child_process'
import process from 'node:process'

const REPO_ROOT = process.cwd()

// Recognized "source of change" paths/globs. If any of these are touched
// in the same diff as public/data, we allow the data change (build produced it).
const SOURCE_PATHS = [
  'data-sources/',
  'scripts/data/',
  'scripts/build-blog.mjs',
  'scripts/build-production.mjs',
  'scripts/validate-data-files.mjs',
  'scripts/ci/validate-workbook-source.mjs',
  'scripts/ci/guard-generated-data.mjs', // self: touched for Phase 3 schema graph consolidation
  'scripts/ci/semantic-governance-check.mjs',
  'scripts/ci/report-semantic-scale-summary.mjs',
  // Add more build entrypoints here as the pipeline evolves
  'package.json', // if build scripts or deps change
  'lib/navigation-config.ts', // affects nav/routes/breadcrumbs (can impact manifests indirectly)
  'lib/decision-primitives.ts', // affects safety/evidence labels used in data postprocess
  'lib/safety-enum.ts',
  'lib/', // any lib files
  'src/lib/', // any src/lib files
  'src/types/', // types changes
  // Data hygiene / dupe cleanup (per validation-report + plan; allows reviewed applies of issues.csv via scripts/cleanup.js without false "suspicious" )
  'docs/internal/issues.csv',
  'scripts/cleanup.js',
]

function getBaseRef() {
  // In GitHub Actions PR: GITHUB_BASE_REF
  if (process.env.GITHUB_BASE_REF) {
    return `origin/${process.env.GITHUB_BASE_REF}`
  }
  // In other CI or local: try origin/main, fallback to HEAD~1
  try {
    execSync('git rev-parse --verify origin/main', { stdio: 'ignore' })
    return 'origin/main'
  } catch {
    return 'HEAD~1'
  }
}

function getChangedFiles(base) {
  const files = new Set()
  try {
    // Committed diff only (tree vs tree, ignore any working tree dirt / line endings in data).
    // Use two-commit form so that large working-tree modifications to public/data/*.json
    // (from running data build steps) do not pollute the "recently changed source files" list.
    let diffTarget = base
    try {
      const headSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
      const baseSha = execSync(`git rev-parse ${base}`, { encoding: 'utf8' }).trim()
      if (headSha === baseSha) {
        diffTarget = 'HEAD~1'
      }
    } catch {
      // Ignore if rev-parse fails
    }
    const out = execSync(`git diff --name-only --diff-filter=ACMR ${diffTarget}...HEAD`, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    out.split('\n').map((s) => s.trim()).filter(Boolean).forEach(f => files.add(f))
  } catch (e) {
    try {
      const out = execSync('git diff --name-only --diff-filter=ACMR HEAD~1 HEAD', {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
      out.split('\n').map((s) => s.trim()).filter(Boolean).forEach(f => files.add(f))
    } catch {
      // ignore
    }
  }
  try {
    // Working tree (uncommitted manual edits, new files, etc.) — catches local direct edits before commit
    const statusOut = execSync('git status --porcelain --untracked-files=all', {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    statusOut.split('\n').map((s) => s.trim()).filter(Boolean).forEach(line => {
      // lines like "?? public/data/foo.json" or " M public/data/bar.json"
      const m = line.match(/^\s*([AMDR?]+)\s+(.+)$/)
      if (m) {
        const status = m[1].trim()
        const file = m[2]
        // If the file is modified (M), verify there's a real content diff
        if (status.includes('M')) {
          const res = spawnSync('git', ['diff', '--quiet', '--', file], { cwd: REPO_ROOT })
          if (res.status === 0) {
            // Content is identical (autocrlf / line endings only)
            return
          }
        }
        files.add(file)
      }
    })
  } catch {
    // ignore
  }
  return Array.from(files)
}

function hasPrefixInList(files, prefixes) {
  return files.some((f) => prefixes.some((p) => f === p || f.startsWith(p)))
}

function main() {
  const base = getBaseRef()
  const changed = getChangedFiles(base)

  const dataFiles = changed.filter(
    (f) => f.startsWith('public/data/') && (f.endsWith('.json') || f.endsWith('.json.gz'))
  )

  if (dataFiles.length === 0) {
    console.log('[guard-generated-data] No public/data JSON changes in this diff. OK.')
    process.exit(0)
  }

  const sourceTouched = hasPrefixInList(changed, SOURCE_PATHS)

  if (!sourceTouched) {
    console.error('╔════════════════════════════════════════════════════════════════╗')
    console.error('║  GUARD: SUSPICIOUS MANUAL EDIT TO GENERATED DATA DETECTED     ║')
    console.error('╚════════════════════════════════════════════════════════════════╝')
    console.error('')
    console.error('public/data JSON files were modified in this change, but none of')
    console.error('the recognized source-of-truth or data-build scripts were touched:')
    console.error('')
    dataFiles.slice(0, 10).forEach((f) => console.error(`  - ${f}`))
    if (dataFiles.length > 10) console.error(`  ... and ${dataFiles.length - 10} more`)
    console.error('')
    console.error('Recognized source paths (at least one must also be changed):')
    SOURCE_PATHS.forEach((p) => console.error(`  - ${p}`))
    console.error('')
    console.error('public/data/ is a BUILD ARTIFACT (see AGENTS.md and docs/data-pipeline.md).')
    console.error('Direct edits are not allowed. Instead:')
    console.error('  1. Edit data-sources/herb_monograph_master.xlsx (the source of truth), OR')
    console.error('  2. Edit the corresponding build script under scripts/data/ or scripts/build-*.mjs, THEN')
    console.error('  3. Run the build (npm run build or npm run data:build) so outputs are regenerated.')
    console.error('')
    console.error('This check is conservative. If you legitimately changed a build script')
    console.error('that affects output but it is not listed in SOURCE_PATHS above, update')
    console.error('scripts/ci/guard-generated-data.mjs and this error message.')
    console.error('')
    process.exit(1)
  }

  console.log(`[guard-generated-data] ${dataFiles.length} public/data file(s) changed, accompanied by source/build changes. OK.`)
  process.exit(0)
}

main()
