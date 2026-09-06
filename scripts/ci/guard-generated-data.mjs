#!/usr/bin/env node
/**
 * Guard generated public/data artifacts against direct edits without a
 * recognized source/build change.
 *
 * Governed enrichment has one narrow explicit source/output relationship:
 * - source: public/data/enrichment-normalized.jsonl
 * - source: public/data/source-registry.json
 * - generated: public/data/enrichment-governed.json
 *
 * Unrelated public/data outputs remain protected.
 */

import { execSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
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
      // ignore
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
      // ignore
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
      const match = line.match(/^\s*([AMDR?]+)\s+(.+)$/)
      if (!match) return
      const status = match[1].trim()
      const file = match[2]
      if (status.includes('M')) {
        const result = spawnSync('git', ['diff', '--quiet', '--', file], { cwd: REPO_ROOT })
        if (result.status === 0) return
      }
      files.add(file)
    })
  } catch {
    // ignore
  }

  return Array.from(files)
}

function hasPrefixInList(files, prefixes) {
  return files.some((file) => prefixes.some((prefix) => file === prefix || file.startsWith(prefix)))
}

export function classifyGeneratedDataGuard(changed, { governedOutputMatchesLedger = false } = {}) {
  const dataFiles = changed.filter(
    (file) =>
      file.startsWith('public/data/') &&
      (file.endsWith('.json') || file.endsWith('.json.gz')) &&
      !PIPELINE_GENERATED_FILES.has(file) &&
      !CANONICAL_PUBLIC_DATA_SOURCES.has(file)
  )

  const governedOutputs = dataFiles.filter((file) => GOVERNED_ENRICHMENT_OUTPUT_FILES.has(file))
  const ordinaryOutputs = dataFiles.filter((file) => !GOVERNED_ENRICHMENT_OUTPUT_FILES.has(file))
  const ordinarySourceTouched = hasPrefixInList(changed, SOURCE_PATHS)

  return {
    dataFiles,
    governedOutputs,
    ordinaryOutputs,
    blockedOrdinary: ordinaryOutputs.length > 0 && !ordinarySourceTouched,
    // The governed artifact is a pure function of the normalized ledger, so the
    // real invariant is equality with that rollup — not "some declared source
    // also changed". The old proxy let PR #5375 write 593 fabricated lines into
    // this output while satisfying the guard purely by touching
    // source-registry.json, publishing 5 entity rows with no ledger backing.
    // Equality blocks that and still permits a repair that converges the output.
    blockedGoverned: governedOutputs.length > 0 && !governedOutputMatchesLedger,
  }
}

const GOVERNED_OUTPUT_PATH = 'public/data/enrichment-governed.json'

/**
 * True only when the committed governed artifact is byte-equivalent to the rollup
 * recomputed from the canonical normalized ledger. Fails closed on any error so a
 * malformed ledger blocks rather than waves the output through.
 */
async function governedOutputMatchesLedger() {
  try {
    const lib = await import('../enrichment/normalize-enrichment-lib.mjs')
    const entries = lib.parseNormalizedInput(lib.INPUT_PATH_DEFAULT)
    const { normalizedEntries, issues, sourceById } = lib.validateAndNormalizeEntries(entries, {
      includeNearDuplicateCheck: true,
    })
    if (issues.length > 0) return false
    const expected = JSON.parse(JSON.stringify(lib.rollupToResearchEnrichment(normalizedEntries, sourceById)))
    const actual = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, GOVERNED_OUTPUT_PATH), 'utf8'))
    return JSON.stringify(actual) === JSON.stringify(expected)
  } catch {
    return false
  }
}

function selfTest() {
  const governed = classifyGeneratedDataGuard([
    'public/data/enrichment-normalized.jsonl',
    'public/data/source-registry.json',
    'public/data/enrichment-governed.json',
  ], { governedOutputMatchesLedger: true })
  if (governed.blockedGoverned || governed.blockedOrdinary) throw new Error('governed enrichment transaction must be allowed')

  // The #5375 shape: output edited, a declared source touched, but the result does
  // not match the ledger rollup. The old source-touched proxy allowed this.
  const fabricated = classifyGeneratedDataGuard([
    'public/data/source-registry.json',
    'public/data/enrichment-governed.json',
  ], { governedOutputMatchesLedger: false })
  if (!fabricated.blockedGoverned) throw new Error('governed output that does not match the ledger rollup must be blocked')

  // A repair that converges the output to the rollup is allowed with no source change.
  const repair = classifyGeneratedDataGuard(['public/data/enrichment-governed.json'], { governedOutputMatchesLedger: true })
  if (repair.blockedGoverned) throw new Error('governed output repair that matches the ledger rollup must be allowed')
  if (governed.dataFiles.length !== 1 || governed.dataFiles[0] !== 'public/data/enrichment-governed.json') {
    throw new Error('source registry must remain a canonical input')
  }

  const orphan = classifyGeneratedDataGuard(['public/data/enrichment-governed.json'], { governedOutputMatchesLedger: false })
  if (!orphan.blockedGoverned) throw new Error('orphan governed output edit must remain blocked')

  const unrelated = classifyGeneratedDataGuard([
    'public/data/enrichment-normalized.jsonl',
    'public/data/unrelated-generated.json',
  ], { governedOutputMatchesLedger: true })
  if (!unrelated.blockedOrdinary) throw new Error('governed source changes must not exempt unrelated outputs')

  console.log('[guard-generated-data] SELF-TEST PASS')
}

async function main() {
  selfTest()
  if (process.argv.includes('--self-test')) process.exit(0)

  const base = getBaseRef()
  const changed = getChangedFiles(base)
  const matchesLedger = changed.includes(GOVERNED_OUTPUT_PATH) ? await governedOutputMatchesLedger() : false
  const { dataFiles, governedOutputs, ordinaryOutputs, blockedOrdinary, blockedGoverned } =
    classifyGeneratedDataGuard(changed, { governedOutputMatchesLedger: matchesLedger })

  if (dataFiles.length === 0) {
    console.log('[guard-generated-data] No generated public/data JSON changes in this diff. OK.')
    process.exit(0)
  }

  if (blockedOrdinary || blockedGoverned) {
    const blockedFiles = [
      ...(blockedOrdinary ? ordinaryOutputs : []),
      ...(blockedGoverned ? governedOutputs : []),
    ]
    console.error('[guard-generated-data] BLOCKED: generated data changed without its recognized source/build change.')
    if (blockedGoverned) {
      console.error('  (governed enrichment output does not match the rollup recomputed from public/data/enrichment-normalized.jsonl;')
      console.error('   regenerate with `node scripts/enrichment/generate-governed-enrichment.mjs` instead of editing the artifact)')
    }
    blockedFiles.forEach((file) => console.error(`  - ${file}`))
    process.exit(1)
  }

  if (governedOutputs.length > 0) {
    console.log(`[guard-generated-data] ${governedOutputs.length} governed enrichment output file(s) changed and match the canonical ledger rollup. OK.`)
  }
  if (ordinaryOutputs.length > 0) {
    console.log(`[guard-generated-data] ${ordinaryOutputs.length} ordinary public/data file(s) changed, accompanied by source/build changes. OK.`)
  }
  process.exit(0)
}

const thisFile = path.resolve(fileURLToPath(import.meta.url))
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : null
if (invokedFile === thisFile) await main()
