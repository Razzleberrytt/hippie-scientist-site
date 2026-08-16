#!/usr/bin/env npx tsx
/** Canonical research-quality pipeline and unified roll-up. */

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const REPORT_DIR = path.join(ROOT, 'ops', 'reports')
const REPORT_PATH = path.join(REPORT_DIR, 'research-quality.json')
const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx'

const checks = [
  { id: 'citation-identities', label: 'Citation identity integrity', command: process.execPath, args: ['scripts/ci/validate-citation-identifiers.mjs'] },
  { id: 'coverage-topology', label: 'Research coverage topology', command: NPX, args: ['tsx', 'scripts/ci/audit-source-integrity.ts'] },
  { id: 'coverage-structure', label: 'Approved claim evidence edges', command: NPX, args: ['tsx', 'scripts/ci/validate-research-coverage.ts'] },
  { id: 'claim-strength', label: 'Claim-level evidence strength', command: NPX, args: ['tsx', 'scripts/ci/audit-claim-evidence-strength.ts'] },
  { id: 'gap-priority', label: 'Prioritized research-gap queue', command: NPX, args: ['tsx', 'scripts/ci/build-research-gap-priorities.ts'] },
  { id: 'evidence-grades', label: 'Evidence grade consistency', command: NPX, args: ['tsx', 'scripts/ci/validate-evidence-grade-consistency.ts'] },
  { id: 'content-integrity', label: 'Structured content integrity', command: process.execPath, args: ['scripts/ci/audit-content-integrity.mjs'] },
] as const

type CheckResult = { id: string; label: string; passed: boolean; exitCode: number; durationMs: number; stdoutTail: string; stderrTail: string }

function tail(value: string, maxLines = 24): string {
  return value.split(/\r?\n/).filter(Boolean).slice(-maxLines).join('\n')
}

function readSummary(fileName: string): unknown {
  const file = path.join(REPORT_DIR, fileName)
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')).summary ?? null
  } catch {
    return null
  }
}

const results: CheckResult[] = []
let failed = false

console.log('\nCanonical research-quality pipeline')
console.log('='.repeat(76))

for (const check of checks) {
  const started = Date.now()
  const run = spawnSync(check.command, check.args, { cwd: ROOT, encoding: 'utf8', env: process.env })
  const exitCode = run.status ?? 1
  const passed = exitCode === 0
  const durationMs = Date.now() - started
  const stdout = String(run.stdout ?? '')
  const stderr = String(run.stderr ?? '')

  results.push({ id: check.id, label: check.label, passed, exitCode, durationMs, stdoutTail: tail(stdout), stderrTail: tail(stderr) })
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${check.label}  (${durationMs}ms)`)

  if (!passed) {
    failed = true
    const detail = tail(stderr || stdout, 10)
    if (detail) console.error(detail)
  }
}

fs.mkdirSync(REPORT_DIR, { recursive: true })
fs.writeFileSync(REPORT_PATH, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  passed: !failed,
  checks: results,
  topologySummary: readSummary('source-integrity.json'),
  claimStrengthSummary: readSummary('claim-evidence-strength.json'),
  researchGapSummary: readSummary('research-gaps.json'),
}, null, 2)}\n`)

console.log(`\nRoll-up report: ${path.relative(ROOT, REPORT_PATH)}`)
if (failed) {
  console.error('\n[research-quality] FAILED — one or more authoritative research checks failed.')
  process.exit(1)
}
console.log('\n[research-quality] PASS — identity, topology, claim strength, gap priority, evidence edges, grades, and structured integrity agree.')
