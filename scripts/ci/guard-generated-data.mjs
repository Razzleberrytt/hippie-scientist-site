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
 * - Governed enrichment has an explicit source/output boundary: the normalized
 *   ledger and source registry are source inputs, while enrichment-governed.json
 *   is generated. That narrow relationship is recognized without exempting
 *   unrelated public/data artifacts.
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
 *   node scripts/ci/guard-generated-data.mjs --self-test
 *   npm run guard:generated-data
 *
 * Exit 0 = no suspicious direct data edits detected
 */

import { execSync, spawnSync } from 'node:child_process'
import process from 'node:process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = process.cwd()
const IS_CI = String(process.env.CI || '').toLowerCase() === 'true' || Boolean(process.env.GITHUB_ACTIONS)
const INCLUDE_WORKTREE = !IS_CI || String(process.env.GUARD_GENERATED_DATA_INCLUDE_WORKTREE || '').toLowerCase() === 'true'

const SOURCE_PATHS = [
  'data/canonical/',
  'data-sources/',
  'scripts/data/',
  'scripts/build-blog.mjs',
  'scripts/build-production.mjs',
  'scripts/validate-data-files.mjs',
  'scripts/ci/validate-workbook-source.mjs',
  'scripts/ci/guard-generated-data.mjs',
  'scripts/ci/semantic-governance-check.mjs',
  'scripts/ci/report-semantic-scale-summary.mjs',
  'package.json',
  'lib/navigation-config.ts',
  'lib/decision-primitives.ts',
  'lib/safety-enum.ts',
  'docs/internal/issues.csv',
  'scripts/cleanup.js',
  'src/types/',
  'src/lib/',
  'lib/',
  'app/',
]

const CANONICAL_PUBLIC_DATA_SOURCES = new Set([
  'public/data/source-registry.json',
])

const GOVERNED_ENRICHMENT_SOURCE_FILES = new Set([
  'public/data/enrichment-normalized.jsonl',
  'public/data/source-registry.json',
])

const GOVERNED_ENRICHMENT_OUTPUT_FILES = new Set([
  'public/data/enrichment-governed.json',
])

function getBaseRef() {
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
      return 'HEAD~1'
    }
  }
}

function getChangedFiles(base) {
  const files = new Set()
  try {
    let diffTarget = base
    try {
      const headSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
      const baseSha = execSync(`git rev-parse ${base}`, { encoding: 'utf8' }).trim()
      if (headSha === baseSha) diffTarget = 'HEAD~1'
    } catch {
      // Ignore if rev-parse fails.
    }
    const out = execSync(`git diff --name-only --diff-filter=ACMR ${diffTarget}...HEAD`, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    out.split('\n').map((s) => s.trim()).filter(Boolean).forEach(f => files.add(f))
  } catch {
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

  if (!INCLUDE_WORKTREE) return Array.from(files)

  try {
    const statusOut = execSync('git status --porcelain --untracked-files=all', {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    statusOut.split('\n').map((s) => s.trim()).filter(Boolean).forEach(line => {
      const m = line.match(/^\s*([AMDR?]+)\s+(.+)$/)
      if (m) {
        const status = m[1].trim()
        const file = m[2]
        if (status.includes('M')) {
          const res = spawnSync('git', ['diff', '--quiet', '--', file], { cwd: REPO_ROOT })
          if (res.status === 0) return
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

const PIPELINE_GENERATED_FILES = new Set([
  'public/data/_meta/build-info.json',
  'public/data/runtime-maps/internal-link-map.json',
  'public/data/runtime-maps/topic-clusters.json',
])

export function classifyGeneratedDataGuard(changed) {
  const dataFiles = changed.filter(
    (f) =>
      f.startsWith('public/data/') &&
      (f.endsWith('.json') || f.endsWith('.json.gz')) &&
      !PIPELINE_GENERATED_FILES.has(f) &&
      !CANONICAL_PUBLIC_DATA_SOURCES.has(f)
  )

  const governedOutputs = dataFiles.filter((f) => GOVERNED_ENRICHMENT_OUTPUT_FILES.has(f))
  const ordinaryOutputs = dataFiles.filter((f) => !GOVERNED_ENRICHMENT_OUTPUT_FILES.has(f))
  const ordinarySourceTouched = hasPrefixInList(changed, SOURCE_PATHS)
  const governedSourceTouched = changed.some((f) => GOVERNED_ENRICHMENT_SOURCE_FILES.has(f))

  return {
    dataFiles,
    governedOutputs,
    ordinaryOutputs,
    blockedOrdinary: ordinaryOutputs.length > 0 && !ordinarySourceTouched,
    blockedGoverned: governedOutputs.length > 0 && !governedSourceTouched,
  }
}

function selfTest() {
  const governed = classifyGeneratedDataGuard([
    'public/data/enrichment-normalized.jsonl',
    'public/data/source-registry.json',
    'public/data/enrichment-governed.json',
  ])
  if (governed.blockedGoverned || governed.blockedOrdinary) {
    throw new Error('governed enrichment source-to-output transaction must be allowed')
  }
  if (governed.dataFiles.length !== 1 || governed.dataFiles[0] !== 'public/data/enrichment-governed.json') {
    throw new Error('source registry must remain a canonical input, not a generated output')
  }

  const orphan = classifyGeneratedDataGuard(['public/data/enrichment-governed.json'])
  if (!orphan.blockedGoverned) {
    throw new Error('orphan governed output edit must remain blocked')
  }

  const unrelated = classifyGeneratedDataGuard([
    'public/data/enrichment-normalized.jsonl',
    'public/data/unrelated-generated.json',
  ])
  if (!unrelated.blockedOrdinary) {
    throw new Error('governed source changes must not exempt unrelated generated outputs')
  }

  console.log('[guard-generated-data] SELF-TEST PASS')
}

function main() {
  selfTest()
  if (process.argv.includes('--self-test')) process.exit(0)

  const base = getBaseRef()
  const changed = getChangedFiles(base)
  const classification = classifyGeneratedDataGuard(changed)
  const { dataFiles, governedOutputs, ordinaryOutputs, blockedOrdinary, blockedGoverned } = classification

  if (dataFiles.length === 0) {
    console.log('[guard-generated-data] No generated public/data JSON changes in this diff. OK.')
    process.exit(0)
  }

  if (blockedOrdinary || blockedGoverned) {
    console.warn('╔════════════════════════════════════════════════════════════════╗')
    console.warn('║  NOTICE: public/data edited without a source/build change      ║')
    console.warn('╚════════════════════════════════════════════════════════════════╝')
    console.warn('')
    console.warn('Generated public/data JSON files were modified without their recognized source path:')
    console.warn('')
    const blockedFiles = [
      ...(blockedOrdinary ? ordinaryOutputs : []),
      ...(blockedGoverned ? governedOutputs : []),
    ]
    blockedFiles.slice(0, 10).forEach((f) => console.warn(`  - ${f}`))
    if (blockedFiles.length > 10) console.warn(`  ... and ${blockedFiles.length - 10} more`)
    console.warn('')
    if (blockedGoverned) {
      console.warn('For governed enrichment output, change the normalized ledger and/or source registry, then regenerate enrichment-governed.json with the canonical generator.')
    }
    if (blockedOrdinary) {
      console.warn('For ordinary generated data, prefer the workbook or recognized build-source path and regenerate outputs.')
    }
    console.warn('')
    console.error('[guard-generated-data] BLOCKED: generated data changed without its recognized source/build change.')
    process.exit(1)
  }

  if (governedOutputs.length > 0) {
    console.log(`[guard-generated-data] ${governedOutputs.length} governed enrichment output file(s) changed with canonical governed source input(s). OK.`)
  }
  if (ordinaryOutputs.length > 0) {
    console.log(`[guard-generated-data] ${ordinaryOutputs.length} ordinary public/data file(s) changed, accompanied by source/build changes. OK.`)
  }
  process.exit(0)
}

const thisFile = path.resolve(fileURLToPath(import.meta.url))
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : null
if (invokedFile === thisFile) main()
