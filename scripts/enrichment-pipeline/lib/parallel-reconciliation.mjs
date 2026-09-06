import fs from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { createCanonicalOwnerResolver } from './canonical-owner.mjs'
import { canonicalTargetKey, reconcilePersistedSubmissionOwner } from './fragment-owner-reconciliation.mjs'
import { rollupSourceEligibilityError } from '../../ci/enrichment-session-source-policy.mjs'

const REVIEW_STATUSES = new Set([
  'draft_submission',
  'needs_validation_fix',
  'ready_for_review',
  'under_review',
  'approved_for_rollup',
  'revision_requested',
  'rejected',
  'deprecated_submission',
])

const STAGING_ONLY_STATUSES = new Set([
  'draft_submission',
  'needs_validation_fix',
  'ready_for_review',
  'under_review',
  'revision_requested',
  'rejected',
  'deprecated_submission',
])

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function listJsonFiles(root) {
  if (!fs.existsSync(root)) return []
  const files = []
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name)
    if (entry.isDirectory()) files.push(...listJsonFiles(full))
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push(full)
  }
  return files.sort()
}

function normalizeComparable(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\s+/gu, ' ')
    .replace(/[^a-z0-9 ]/gu, '')
    .trim()
}

function rawTargetKey(submission) {
  return submission.entityType === 'surface'
    ? `surface:${submission.surfaceId ?? ''}`
    : `${submission.entityType}:${submission.entitySlug ?? ''}`
}

function findingFingerprint(submission, reconciliation) {
  return [
    reconciliation ? canonicalTargetKey(submission, reconciliation) : rawTargetKey(submission),
    submission.sourceId,
    submission.topicType,
    submission.claimType,
    normalizeComparable(submission.findingTextNormalized),
  ].join('|')
}

function makeBlocked(source, reasons) {
  return { ...source, reconciliation: { eligible: false, reasons: [...new Set(reasons)] } }
}

/**
 * Read-only, deterministic bridge from legacy + parallel enrichment submissions
 * into the existing review/assessment machinery.
 *
 * This module deliberately does not mutate either submission store and does not
 * change reviewStatus. It produces a single candidate stream plus explicit
 * blocked reasons and provenance so the existing reviewer remains authoritative.
 */
export function reconcileParallelSubmissions({ root = process.cwd() } = {}) {
  const manifest = readJson(path.join(root, 'ops', 'research-sessions', 'session-manifest.json'))
  const legacyPath = path.join(root, 'ops', 'enrichment-submissions.json')
  const sourceRegistryPath = path.join(root, 'public', 'data', 'source-registry.json')
  const submissionSchemaPath = path.join(root, 'schemas', 'enrichment-submission.schema.json')
  const fragmentSchemaPath = path.join(root, 'schemas', 'enrichment-session-fragment.schema.json')
  const fragmentRoot = path.join(root, 'ops', 'enrichment-submissions', 'sessions')

  const errors = []
  const blocked = []
  const candidates = []
  const seenIds = new Map()
  const seenFingerprints = new Map()
  const sourceRegistry = readJson(sourceRegistryPath)
  const sourceById = new Map(sourceRegistry.map(source => [source.sourceId, source]))
  const legacy = fs.existsSync(legacyPath) ? readJson(legacyPath) : []
  const submissionSchema = readJson(submissionSchemaPath)
  const fragmentSchema = readJson(fragmentSchemaPath)
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: true })
  addFormats(ajv)
  const validateSubmission = ajv.compile(submissionSchema)
  const validateFragment = ajv.compile(fragmentSchema)
  ajv.addSchema(submissionSchema)

  const sessionById = new Map((manifest.sessions ?? []).map(session => [session.sessionId, session]))
  const ownerResolver = createCanonicalOwnerResolver({ root })

  const addCandidate = ({ submission, provenance, sourceKind, reconciliation, preBlocked = [] }) => {
    const reasons = [...preBlocked]
    if (!REVIEW_STATUSES.has(submission.reviewStatus)) reasons.push('unknown_review_status')
    if (submission.active !== true) reasons.push('submission_inactive')

    const sourceError = rollupSourceEligibilityError(submission, sourceById)
    if (sourceError) reasons.push(sourceError)

    const fingerprint = findingFingerprint(submission, reconciliation)
    if (seenIds.has(submission.submissionId)) {
      reasons.push(`duplicate_submission_id:${seenIds.get(submission.submissionId)}`)
    }
    if (seenFingerprints.has(fingerprint)) {
      reasons.push(`duplicate_finding_fingerprint:${seenFingerprints.get(fingerprint)}`)
    }

    const record = {
      submission: structuredClone(submission),
      sourceKind,
      provenance: {
        sessionId: provenance.sessionId ?? null,
        shard: provenance.shard ?? null,
        fragmentPath: provenance.fragmentPath ?? null,
        batchId: provenance.batchId ?? null,
        submissionId: submission.submissionId,
        workpackId: submission.workpackId,
        sourceId: submission.sourceId,
        reviewDecision: submission.reviewStatus,
        promotionReceipt: null,
      },
      reconciliation: {
        canonicalWorkpackId: reconciliation?.canonical?.workpackId ?? submission.workpackId,
        findingFingerprint: fingerprint,
        stagingOnly: STAGING_ONLY_STATUSES.has(submission.reviewStatus),
        eligible: reasons.length === 0,
        reasons: [...new Set(reasons)],
      },
    }

    if (reasons.length) blocked.push(record)
    else candidates.push(record)

    if (!seenIds.has(submission.submissionId)) seenIds.set(submission.submissionId, `${sourceKind}:${provenance.fragmentPath ?? 'legacy'}`)
    if (!seenFingerprints.has(fingerprint)) seenFingerprints.set(fingerprint, `${sourceKind}:${submission.submissionId}`)
  }

  for (const submission of legacy) {
    if (!validateSubmission(submission)) {
      errors.push(`legacy submission ${submission?.submissionId ?? '<missing>'} schema: ${ajv.errorsText(validateSubmission.errors, { separator: '; ' })}`)
      continue
    }
    let reconciliation = null
    try {
      reconciliation = reconcilePersistedSubmissionOwner(submission, ownerResolver.resolveWorkpack)
    } catch {
      // Legacy records predate the parallel owner contract. Existing review logic
      // remains authoritative; preserve the raw legacy target when unresolved.
    }
    addCandidate({
      submission,
      provenance: {},
      sourceKind: 'legacy',
      reconciliation,
    })
  }

  for (const filePath of listJsonFiles(fragmentRoot)) {
    const fragmentPath = path.relative(root, filePath).replaceAll('\\', '/')
    const fragment = readJson(filePath)
    if (!validateFragment(fragment)) {
      blocked.push({
        sourceKind: 'parallel',
        provenance: { fragmentPath, sessionId: fragment?.sessionId ?? null, shard: fragment?.shard ?? null, batchId: fragment?.batchId ?? null },
        reconciliation: { eligible: false, reasons: [`fragment_schema:${ajv.errorsText(validateFragment.errors, { separator: '; ' })}`] },
      })
      continue
    }

    const session = sessionById.get(fragment.sessionId)
    const expectedDirectory = `ops/enrichment-submissions/sessions/session-${String(fragment.sessionId).toLowerCase()}/`
    const fragmentReasons = []
    if (!session) fragmentReasons.push(`unknown_session:${fragment.sessionId}`)
    else {
      if (session.enabled !== true) fragmentReasons.push(`disabled_session:${fragment.sessionId}`)
      if (fragment.shard !== session.shard) fragmentReasons.push(`foreign_shard:${fragment.shard}->${session.shard}`)
    }
    if (!fragmentPath.startsWith(expectedDirectory)) fragmentReasons.push(`foreign_fragment_directory:${expectedDirectory}`)

    for (const submission of fragment.submissions) {
      let reconciliation = null
      try {
        reconciliation = reconcilePersistedSubmissionOwner(submission, ownerResolver.resolveWorkpack)
      } catch (error) {
        fragmentReasons.push(`canonical_owner:${error.message}`)
      }

      const canonicalShard = reconciliation?.canonical?.workpackId
        ? ownerResolver.resolveWorkpack(reconciliation.canonical.workpackId)?.shard
        : null
      if (canonicalShard != null && session && canonicalShard !== session.shard) {
        fragmentReasons.push(`canonical_foreign_shard:${canonicalShard}->${session.shard}`)
      }

      addCandidate({
        submission,
        provenance: {
          sessionId: fragment.sessionId,
          shard: fragment.shard,
          fragmentPath,
          batchId: fragment.batchId,
        },
        sourceKind: 'parallel',
        reconciliation,
        preBlocked: fragmentReasons,
      })
    }
  }

  const parallelCount = blocked.filter(row => row.sourceKind === 'parallel').length + candidates.filter(row => row.sourceKind === 'parallel').length
  const legacyCount = blocked.filter(row => row.sourceKind === 'legacy').length + candidates.filter(row => row.sourceKind === 'legacy').length
  const eligibleParallel = candidates.filter(row => row.sourceKind === 'parallel').length
  const eligibleLegacy = candidates.filter(row => row.sourceKind === 'legacy').length

  return {
    version: 1,
    deterministicModelVersion: 'parallel-enrichment-reconciliation-v1',
    generatedAt: new Date().toISOString(),
    readOnly: true,
    inputs: {
      legacyPath: 'ops/enrichment-submissions.json',
      fragmentRoot: 'ops/enrichment-submissions/sessions',
      manifestPath: 'ops/research-sessions/session-manifest.json',
      sourceRegistryPath: 'public/data/source-registry.json',
    },
    summary: {
      legacyCount,
      parallelCount,
      candidateCount: candidates.length,
      blockedCount: blocked.length,
      eligibleLegacy,
      eligibleParallel,
      stagingOnlyCount: [...candidates, ...blocked].filter(row => row.reconciliation?.stagingOnly).length,
      errorCount: errors.length,
    },
    candidates,
    blocked,
    errors,
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = reconcileParallelSubmissions()
  const outputArg = process.argv.find(arg => arg.startsWith('--output='))
  const outputPath = outputArg?.slice('--output='.length) ?? 'ops/reports/enrichment-parallel-reconciliation.json'
  const absoluteOutput = path.resolve(process.cwd(), outputPath)
  fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true })
  fs.writeFileSync(absoluteOutput, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  console.log(`Parallel enrichment reconciliation: ${result.summary.candidateCount} eligible candidates, ${result.summary.blockedCount} blocked, ${result.summary.errorCount} structural errors.`)
  if (result.errors.length) process.exitCode = 1
}
