#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { resolveSourceClassAuthorization } from './lib/source-retry-authorization.mjs'

const ROOT = process.cwd()
const INTAKE_PATH = path.join(ROOT, 'ops', 'reports', 'source-intake-queue.json')
const SOURCE_CANDIDATES_PATH = path.join(ROOT, 'ops', 'source-candidates.json')
const WAVE_ID = process.env.ENRICHMENT_WAVE_ID || 'wave-2'
const SAFE_WAVE_ID = WAVE_ID.replace(/[^a-z0-9-]+/gi, '-').toLowerCase()
const WAVE_CANDIDATES_PATH = process.env.ENRICHMENT_WAVE_CANDIDATES_PATH || path.join(ROOT, 'ops', 'reports', `source-${SAFE_WAVE_ID}-candidates.json`)
const IDENTITY_REPORT_PATH = process.env.ENRICHMENT_WAVE_SOURCE_IDENTITY_PATH || path.join(ROOT, 'ops', 'reports', `source-${SAFE_WAVE_ID}-identity-attestation.json`)
const REVIEW_JSON_PATH = process.env.ENRICHMENT_WAVE_SOURCE_REVIEW_JSON_PATH || path.join(ROOT, 'ops', 'reports', `source-${SAFE_WAVE_ID}-review.json`)

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function broadenTaskForRecordedRetries(task) {
  const retryClasses = (task.adaptiveRetryAttempts || [])
    .filter(attempt => attempt.pass !== 'pass_4_stop_manual_review')
    .flatMap(attempt => attempt.allowedSourceClasses || [])
  return {
    ...task,
    recommendedSourceClasses: Array.from(new Set([...(task.recommendedSourceClasses || []), ...retryClasses])).sort(),
  }
}

const intakeSnapshot = fs.readFileSync(INTAKE_PATH, 'utf8')
const waveCandidatesSnapshot = fs.readFileSync(WAVE_CANDIDATES_PATH, 'utf8')
const originalIntake = JSON.parse(intakeSnapshot)
const initialByTask = new Map((originalIntake.tasks || []).map(task => [task.intakeTaskId, task]))
const broadenedIntake = {
  ...originalIntake,
  tasks: (originalIntake.tasks || []).map(broadenTaskForRecordedRetries),
}

// Source identity must be independently attested before the reviewer is allowed
// to see a candidate as promotion-eligible. This prevents metadata-shaped but
// fabricated PMID/DOI/title tuples from being self-certified into the registry.
execFileSync('node', ['scripts/validate-source-candidate-identities.mjs'], {
  cwd: ROOT,
  stdio: 'inherit',
  env: process.env,
})
const identityReport = readJson(IDENTITY_REPORT_PATH)
const eligibleIds = new Set(identityReport.eligibleCandidateIds || [])
const waveCandidates = JSON.parse(waveCandidatesSnapshot)
const filteredWaveCandidates = {
  ...waveCandidates,
  candidates: (waveCandidates.candidates || []).filter(candidate => eligibleIds.has(candidate.candidateSourceId)),
}

writeJson(INTAKE_PATH, broadenedIntake)
writeJson(WAVE_CANDIDATES_PATH, filteredWaveCandidates)
try {
  execFileSync('npx', ['tsx', 'scripts/report-source-wave-review.ts'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  })
} finally {
  fs.writeFileSync(INTAKE_PATH, intakeSnapshot, 'utf8')
  fs.writeFileSync(WAVE_CANDIDATES_PATH, waveCandidatesSnapshot, 'utf8')
}

if (fs.existsSync(REVIEW_JSON_PATH)) {
  const candidates = readJson(SOURCE_CANDIDATES_PATH)
  const classByCandidate = new Map(candidates.map(candidate => [candidate.candidateSourceId, candidate.sourceClass]))
  const review = readJson(REVIEW_JSON_PATH)
  review.candidateDecisions = (review.candidateDecisions || []).map(decision => {
    const task = initialByTask.get(decision.intakeTaskId)
    const sourceClass = classByCandidate.get(decision.candidateSourceId)
    const authorization = resolveSourceClassAuthorization(task, sourceClass)
    if (!authorization.authorized || authorization.source !== 'adaptive_retry') return decision
    return {
      ...decision,
      authorizedByRetryPass: authorization.pass,
      reasons: [
        ...(decision.reasons || []),
        `sourceClass=${sourceClass} explicitly authorized by recorded adaptive retry pass ${authorization.pass}.`,
      ],
    }
  })
  review.identityAttestation = {
    modelVersion: identityReport.modelVersion,
    reportPath: path.relative(ROOT, IDENTITY_REPORT_PATH),
    eligibleCandidateIds: identityReport.eligibleCandidateIds || [],
    blockedCandidates: identityReport.blockedCandidates || [],
  }
  review.retryAuthorizationPolicy = {
    modelVersion: 'recorded-retry-authorization-v1',
    rule: 'A broadened source class is review-eligible only when that class appears in an adaptiveRetryAttempts pass recorded on the exact intake task; pass_4_stop_manual_review never authorizes a source class.',
  }
  writeJson(REVIEW_JSON_PATH, review)
}
