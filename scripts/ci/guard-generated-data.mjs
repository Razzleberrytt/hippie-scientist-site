#!/usr/bin/env node
/**
 * Advisory check for direct edits to generated public/data artifacts.
 *
 * This is a preflight/CI notice. Direct edits to public/data and to the
 * workbook are allowed; if public/data/*.json files were hand-edited without
 * touching a recognized source/build path, it prints a notice suggesting the
 * workbook/build route.
 *
 * Conservative / safe:
 * - Legitimate committed changes produced by running the build scripts are
 *   allowed *if* the PR/commit also touches at least one recognized source/build file.
 * - In CI, this guard only inspects committed diffs. It intentionally ignores
 *   working-tree dirt because `check:full` runs after build steps that regenerate
 *   public/data artifacts.
 * - Locally, working-tree checks remain enabled by default so manual edits can
 *   be caught before commit.
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
 * Exit 0 = no suspicious direct data edits detected
 */

import { execSync, spawnSync } from 'node:child_process'
import process from 'node:process'

const REPO_ROOT = process.cwd()
const IS_CI = String(process.env.CI || '').toLowerCase() === 'true' || Boolean(process.env.GITHUB_ACTIONS)
const INCLUDE_WORKTREE = !IS_CI || String(process.env.GUARD_GENERATED_DATA_INCLUDE_WORKTREE || '').toLowerCase() === 'true'

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
  // Data hygiene / dupe cleanup (per validation-report + plan; allows reviewed applies of issues.csv via scripts/cleanup.js without false "suspicious" )
  'docs/internal/issues.csv',
  'scripts/cleanup.js',
  'src/types/',
  'src/lib/',
  'lib/',
  'app/',
]

function getBaseRef() {
  // In GitHub Actions PR: GITHUB_BASE_REF
  if (process.env.GITHUB_BASE_REF) {
    const baseBranch = process.env.GITHUB_BASE_REF
    const baseRef = `origin/${baseBranch}`
    try {
      execSync(`git rev-parse --verify ${baseRef}`, { stdio: 'ignore' })
    } catch {
      if (/^[A-Za-z0-9._/-]+$/.test(baseBranch)) {
        spawnSync('git', ['fetch', '--no-tags', '--depth=1', 'origin', `+refs/heads/${baseBranch}:refs/remotes/origin/${baseBranch}`], {
          cwd: REPO_ROOT,
          stdio: 'ignore',
        })
      }
    }
    return baseRef
  }
  // In other CI or local: try origin/main, fallback to HEAD~1
  try {
    execSync('git rev-parse --verify origin/main', { stdio: 'ignore' })
    return 'origin/main'
  } catch {
    spawnSync('git', ['fetch', '--no-tags', '--depth=1', 'origin', '+refs/heads/main:refs/remotes/origin/main'], {
      cwd: REPO_ROOT,
      stdio: 'ignore',
    })
    try {
      execSync('git rev-parse --verify origin/main', { stdio: 'ignore' })
      return 'origin/main'
    } catch {
      // Fall through to local history fallback.
    }
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
      const out = execSync(`git diff --name-only --diff-filter=ACMR ${base} HEAD`, {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
      out.split('\n').map((s) => s.trim()).filter(Boolean).forEach(f => files.add(f))
    } catch {
      // Fall through to local-history fallback.
    }
  }
  if (files.size === 0) {
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

  if (!INCLUDE_WORKTREE) {
    return Array.from(files)
  }

  try {
    // Local working tree (uncommitted manual edits, new files, etc.) — catches
    // direct edits before commit. Disabled in CI because this guard runs after
    // build steps that legitimately regenerate public/data outputs.
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

// Files the build pipeline regenerates on every run (commit hash, link maps, etc.).
// These are always "dirty" after a build so they must never trigger the guard.
const PIPELINE_GENERATED_FILES = new Set([
  'public/data/_meta/build-info.json',
  'public/data/runtime-maps/internal-link-map.json',
  'public/data/runtime-maps/topic-clusters.json',
])

function main() {
  const base = getBaseRef()
  const changed = getChangedFiles(base)

  const dataFiles = changed.filter(
    (f) =>
      f.startsWith('public/data/') &&
      (f.endsWith('.json') || f.endsWith('.json.gz')) &&
      !PIPELINE_GENERATED_FILES.has(f)
  )

  if (dataFiles.length === 0) {
    console.log('[guard-generated-data] No public/data JSON changes in this diff. OK.')
    process.exit(0)
  }

  const sourceTouched = hasPrefixInList(changed, SOURCE_PATHS)

  if (!sourceTouched) {
    console.warn('╔════════════════════════════════════════════════════════════════╗')
    console.warn('║  NOTICE: public/data edited without a source/build change      ║')
    console.warn('╚════════════════════════════════════════════════════════════════╝')
    console.warn('')
    console.warn('public/data JSON files were modified directly in this change:')
    console.warn('')
    dataFiles.slice(0, 10).forEach((f) => console.warn(`  - ${f}`))
    if (dataFiles.length > 10) console.warn(`  ... and ${dataFiles.length - 10} more`)
    console.warn('')
    console.warn('Direct edits to generated data and to the workbook are allowed.')
    console.warn('If this edit should instead flow through the build, prefer:')
    console.warn('  1. Edit data-sources/herb_monograph_master.xlsx (source of truth), OR')
    console.warn('  2. Edit the build scripts under scripts/data/, THEN')
    console.warn('  3. Run npm run data:build to regenerate outputs.')
    console.warn('')
    console.error('[guard-generated-data] BLOCKED: direct edit to generated data detected without accompanying source/build changes.')
    process.exit(1)
  }

  console.log(`[guard-generated-data] ${dataFiles.length} public/data file(s) changed, accompanied by source/build changes. OK.`)
  process.exit(0)
}

main()
