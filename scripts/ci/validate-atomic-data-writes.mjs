#!/usr/bin/env node
/**
 * Recurrence check for the Windows build-wrapper failure.
 *
 * `npm run build` rewrites the same generated JSON under `public/data` across
 * eight consecutive pipeline stages. A stage that opens those files for
 * truncating write can lose to a scanner handle held from the previous stage,
 * which Windows reports as `UNKNOWN: unknown error, open '...'` and which took
 * the build wrapper down intermittently.
 *
 * The fix routes every such write through `scripts/lib/atomic-json.mjs`, which
 * writes a sibling temp file and renames over the target. That only stays true
 * if new pipeline stages keep doing it, so this gate fails when a script in the
 * build's data pipeline writes into the data directory with a raw
 * `fs.writeFileSync`.
 *
 * Scope is deliberately narrow: only the scripts the deploy pipeline actually
 * runs against `public/data`. One-off reporters, agent tooling, and scripts
 * that write elsewhere are not the source of the race and are not policed here.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

/**
 * Scripts run by `scripts/build-deploy.mjs` that write into `public/data`.
 * Keep this in step with the `steps` array there when stages are added.
 */
const GOVERNED_SCRIPTS = [
  'scripts/data/normalize-evidence-grades.ts',
  'scripts/data/postprocess-workbook-payloads.mjs',
  'scripts/data/apply-participant-counts.mjs',
  'scripts/data/quarantine-unverifiable-citations.mjs',
  'scripts/data/apply-governance-overlay.mjs',
  'scripts/data/sanitize-public-text.mjs',
  'scripts/data/apply-pubmed-metadata.ts',
  'scripts/data/sync-detail-indexability.mjs',
  'scripts/data/generate-freshness-metadata.mjs',
]

const HELPER = 'scripts/lib/atomic-json.mjs'

// `fs.writeFileSync(...)` or a destructured bare `writeFileSync(...)` call.
// The import specifier itself (`import { writeFileSync } from 'node:fs'`) is
// matched too, since importing it into a governed script is the thing we are
// trying to prevent.
const RAW_WRITE = /(^|[^.\w])(fs\.)?writeFileSync\s*\(/

const problems = []

if (!fs.existsSync(path.join(repoRoot, HELPER))) {
  console.error(`[atomic-data-writes] missing shared helper: ${HELPER}`)
  process.exit(1)
}

for (const relative of GOVERNED_SCRIPTS) {
  const absolute = path.join(repoRoot, relative)
  if (!fs.existsSync(absolute)) {
    problems.push({
      file: relative,
      line: 0,
      text: 'listed in GOVERNED_SCRIPTS but no longer exists — update this validator',
    })
    continue
  }

  const source = fs.readFileSync(absolute, 'utf8')

  if (!source.includes('atomic-json.mjs')) {
    problems.push({
      file: relative,
      line: 0,
      text: `does not import ${HELPER}`,
    })
  }

  source.split(/\r?\n/).forEach((line, index) => {
    const withoutComment = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '')
    if (RAW_WRITE.test(withoutComment)) {
      problems.push({ file: relative, line: index + 1, text: line.trim() })
    }
  })
}

if (problems.length > 0) {
  console.error('\n[atomic-data-writes] FAIL — raw synchronous writes in the data pipeline\n')
  for (const problem of problems) {
    const where = problem.line > 0 ? `${problem.file}:${problem.line}` : problem.file
    console.error(`  ${where}\n    ${problem.text}`)
  }
  console.error(
    `\n  These stages rewrite the same files back to back. Opening a generated JSON` +
      `\n  file for truncating write can lose to a scanner handle held by the previous` +
      `\n  stage, which surfaces on Windows as "UNKNOWN: unknown error, open '...'".` +
      `\n\n  Use writeFileAtomic / writeJsonAtomic from ${HELPER} instead.\n`
  )
  process.exit(1)
}

console.log(
  `[atomic-data-writes] PASS — ${GOVERNED_SCRIPTS.length} pipeline stages write generated data atomically`
)
