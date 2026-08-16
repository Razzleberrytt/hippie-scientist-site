#!/usr/bin/env npx tsx
/**
 * Canonical research-quality pipeline.
 *
 * This is the single entry point for research/data integrity. Narrow validators
 * remain deliberately small implementation details; this orchestrator defines
 * their authoritative order and emits one roll-up report.
 */

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const REPORT_DIR = path.join(ROOT, 'ops', 'reports')
const REPORT_PATH = path.join(REPORT_DIR, 'research-quality.json')

const checks = [
  {
    id: 'citation-identities',
    label: 'Citation identity integrity',
    command: process.execPath,
    args: ['scripts/ci/validate-citation-identifiers.mjs'],
  },
  {
    id: 'coverage-topology',
    label: 'Research coverage topology',
    command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
    args: ['tsx', 'scripts/ci/audit-source-integrity.ts'],
  },
  {
    id: 'coverage-structure',
    label: 'Approved claim evidence edges',
    command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
    args: ['tsx', 'scripts/ci/validate-research-coverage.ts'],
  },
  {
    id: 'evidence-grades',
    label: 'Evidence grade consistency',
    command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
    args: ['tsx', 'scripts/ci/validate-evidence-grade-consistency.ts'],
  },
  {
    id: 'content-integrity',
    label: 'Structured content integrity',
    command: process.execPath,
    args: ['scripts/ci/audit-content-integrity.mjs'],
  },
] as const

type CheckResult = {
  id: string
  label: string
  passed: boolean
  exitCode: number
  durationMs: number
  stdoutTail: string
  stderrTail: string
}

function tail(value: string, maxLines = 24): string {
  return value.split(/\r?\n/).filter(Boolean).slice(-maxLines).join('\n')
}

const results: CheckResult[] = []
let failed = false

console.log('\nCanonical research-quality pipeline')
console.log('='.repeat(76))

for (const check of checks) {
  const started = Date.now()
  const run = spawnSync(check.command, check.args, {
    cwd: ROOT,
    encoding: 'utf8',
    env: process.env,
  })
  const exitCode = run.status ?? 1
  const passed = exitCode === 0
  const durationMs = Date.now() - started
  const stdout = String(run.stdout ?? '')
  const stderr = String(run.stderr ?? '')

  results.push({
    id: check.id,
    label: check.label,
    passed,
    exitCode,
    durationMs,
    stdoutTail: tail(stdout),
    stderrTail: tail(stderr),
  })

  console.log(`${passed ? 'PASS' : 'FAIL'}  ${check.label}  (${durationMs}ms)`)
  if (!passed) {
    failed = true
    const detail = tail(stderr || stdout, 10)
    if (detail) console.error(detail)
  }
}

const sourceIntegrityPath = path.join(REPORT_DIR, 'source-integrity.json')
let topologySummary: unknown = null
if (fs.existsSync(sourceIntegrityPath)) {
  try {
    topologySummary = JSON.parse(fs.readFileSync(sourceIntegrityPath, 'utf8')).summary ?? null
  } catch {
    topologySummary = null
  }
}

fs.mkdirSync(REPORT_DIR, { recursive: true })
fs.writeFileSync(
  REPORT_PATH,
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    passed: !failed,
    checks: results,
    topologySummary,
  }, null, 2)}\n`,
)

console.log(`\nRoll-up report: ${path.relative(ROOT, REPORT_PATH)}`)
if (failed) {
  console.error('\n[research-quality] FAILED — one or more authoritative research checks failed.')
  process.exit(1)
}
console.log('\n[research-quality] PASS — citation identity, coverage topology, evidence edges, grades, and structured integrity agree.')
