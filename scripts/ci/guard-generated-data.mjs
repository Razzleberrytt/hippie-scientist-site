#!/usr/bin/env node
/**
 * Advisory check for direct edits to generated public/data artifacts.
 *
 * Governed enrichment has an explicit source/output boundary: the normalized
 * ledger and source registry are source inputs, while enrichment-governed.json
 * is generated. That narrow relationship is recognized without exempting
 * unrelated public/data artifacts.
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

// Exact governed-enrichment input/output classification. The source registry is
// a canonical enrichment input even though it lives under public/data.
const CANONICAL_PUBLIC_DATA_SOURCES = new Set(['public/data/source-registry.json'])
const GOVERNED_ENRICHMENT_SOURCE_FILES = new Set([
  'public/data/enrichment-normalized.jsonl',
  'public/data/source-registry.json',
])
const GOVERNED_ENRICHMENT_OUTPUT_FILES = new Set(['public/data/enrichment-governed.json'])

const PIPELINE_GENERATED_FILES = new Set([
  'public/data/_meta/build-info.json',
  'public/data/runtime-maps/internal-link-map.json',
  'public/data/runtime-maps/topic-clusters.json',
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
  const { dataFiles, governedOutputs, ordinaryOutputs, blockedOrdinary, blockedGoverned } = classifyGeneratedDataGuard(changed)

  if (dataFiles.length === 0) {
    console.log('[guard-generated-data] No generated public/data JSON changes in this diff. OK.')
    process.exit(0)
  }

  if (blockedOrdinary || blockedGoverned) {
    console.warn('Generated public/data JSON files were modified without their recognized source path:')
    const blockedFiles = [
      ...(blockedOrdinary ? ordinaryOutputs : []),
      ...(blockedGoverned ? governedOutputs : []),
    ]
    blockedFiles.forEach((f) => console.warn(`  - ${f}`))
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
