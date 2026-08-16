#!/usr/bin/env npx tsx
/** Canonical one-pass research-quality pipeline and unified roll-up. */

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { analyzeResearchQuality } from '../../lib/research-quality-analysis'
import { buildResearchGapQueue, structuralCoverageFailures } from '../../lib/research-quality-policy'
import { analyzeCrossProfileStudyLoad } from '../../lib/research-study-load'

const ROOT = process.cwd()
const REPORT_DIR = path.join(ROOT, 'ops', 'reports')
const REPORT_PATH = path.join(REPORT_DIR, 'research-quality.json')
const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx'

const externalChecks = [
  { id: 'citation-identities', label: 'Citation identity integrity', command: process.execPath, args: ['scripts/ci/validate-citation-identifiers.mjs'] },
  { id: 'coverage-topology', label: 'Research source integrity / topology metadata', command: NPX, args: ['tsx', 'scripts/ci/audit-source-integrity.ts'] },
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

const coreStarted = Date.now()
const analysis = analyzeResearchQuality(ROOT)
const structuralFailures = structuralCoverageFailures(analysis)
const researchGapQueue = buildResearchGapQueue(analysis)
const crossProfileStudyLoad = analyzeCrossProfileStudyLoad(analysis)
const systemicLoadBearingStudies = crossProfileStudyLoad.filter((study) => study.systemicLoadBearing)
const weakApprovedOutcomes = analysis.claimAnalyses.filter((claim) =>
  claim.outcomeClaim && ['unsupported', 'unclassified', 'narrative-only', 'indirect-only'].includes(claim.supportTier),
)
const unsupportedUnapprovedClaims = analysis.structuredClaimAnalyses.filter(
  (claim) => !claim.approved && claim.supportTier === 'unsupported',
)
const weakUnapprovedOutcomes = analysis.structuredClaimAnalyses.filter(
  (claim) => !claim.approved && claim.outcomeClaim && ['unsupported', 'unclassified', 'narrative-only', 'indirect-only'].includes(claim.supportTier),
)
const overDependentProfiles = analysis.profileAnalyses.filter((profile) => profile.overDependentOnSingleStudy)
const narrativeDominatedProfiles = analysis.profileAnalyses.filter((profile) => profile.narrativeDominatedVsPrimaryHuman)
const noPrimaryHumanProfiles = analysis.profileAnalyses.filter((profile) => profile.noPrimaryHuman)
const corePassed = structuralFailures.length === 0
const coreDurationMs = Date.now() - coreStarted

results.push({
  id: 'canonical-core',
  label: 'Canonical claim/profile research-quality analysis',
  passed: corePassed,
  exitCode: corePassed ? 0 : 1,
  durationMs: coreDurationMs,
  stdoutTail: `profiles=${analysis.profileAnalyses.length}; structuredClaims=${analysis.structuredClaimAnalyses.length}; approvedClaims=${analysis.claimAnalyses.length}; gaps=${researchGapQueue.length}; systemicStudies=${systemicLoadBearingStudies.length}`,
  stderrTail: structuralFailures.length ? `${structuralFailures.length} structurally invalid approved-claim evidence edge(s)` : '',
})
console.log(`${corePassed ? 'PASS' : 'FAIL'}  Canonical claim/profile research-quality analysis  (${coreDurationMs}ms)`)
if (!corePassed) failed = true

for (const check of externalChecks) {
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

const coreSummary = {
  profiles: analysis.profileAnalyses.length,
  structuredClaims: analysis.structuredClaimAnalyses.length,
  approvedClaims: analysis.claimAnalyses.length,
  structuralFailures: structuralFailures.length,
  weakApprovedOutcomeClaims: weakApprovedOutcomes.length,
  unsupportedUnapprovedStructuredClaims: unsupportedUnapprovedClaims.length,
  weakUnapprovedOutcomeClaims: weakUnapprovedOutcomes.length,
  overDependentProfiles: overDependentProfiles.length,
  narrativeDominatedProfiles: narrativeDominatedProfiles.length,
  profilesWithApprovedClaimsButNoPrimaryHumanStudy: noPrimaryHumanProfiles.length,
  profilesWithResearchGaps: researchGapQueue.length,
  canonicalStudiesSupportingApprovedClaims: crossProfileStudyLoad.length,
  systemicLoadBearingStudies: systemicLoadBearingStudies.length,
}

fs.mkdirSync(REPORT_DIR, { recursive: true })
fs.writeFileSync(REPORT_PATH, `${JSON.stringify({
  schemaVersion: 3,
  generatedAt: new Date().toISOString(),
  passed: !failed,
  source: {
    analysis: 'lib/research-quality-analysis.ts',
    policy: 'lib/research-quality-policy.ts',
    crossProfileStudyLoad: 'lib/research-study-load.ts',
  },
  coreSummary,
  structuralFailures,
  systemicLoadBearingStudies: systemicLoadBearingStudies.slice(0, 50),
  topCrossProfileStudyLoad: crossProfileStudyLoad.slice(0, 100),
  topResearchGaps: researchGapQueue.slice(0, 50),
  checks: results,
  sourceIntegritySummary: readSummary('source-integrity.json'),
  evidenceGradeSummary: readSummary('evidence-grade-consistency.json'),
  contentIntegritySummary: readSummary('content-integrity.json'),
}, null, 2)}\n`)

console.log(`\nCore: ${coreSummary.profiles} profiles · ${coreSummary.structuredClaims} structured claims · ${coreSummary.approvedClaims} approved`)
console.log(`Structural failures ${coreSummary.structuralFailures} · weak approved outcomes ${coreSummary.weakApprovedOutcomeClaims} · research-gap profiles ${coreSummary.profilesWithResearchGaps}`)
console.log(`Systemic load-bearing studies ${coreSummary.systemicLoadBearingStudies} of ${coreSummary.canonicalStudiesSupportingApprovedClaims} canonical studies supporting approved claims`)
console.log(`Roll-up report: ${path.relative(ROOT, REPORT_PATH)}`)
if (failed) {
  console.error('\n[research-quality] FAILED — one or more authoritative research checks failed.')
  process.exit(1)
}
console.log('\n[research-quality] PASS — canonical analysis/policy, source integrity, evidence grades, and structured integrity agree.')
