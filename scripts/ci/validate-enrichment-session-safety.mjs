#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { createCanonicalOwnerResolver } from '../enrichment-pipeline/lib/canonical-owner.mjs'
import {
  canonicalTargetKey,
  historicalReconciliationKey,
  reconcilePersistedSubmissionOwner,
} from '../enrichment-pipeline/lib/fragment-owner-reconciliation.mjs'
import { shardOf } from '../enrichment-pipeline/lib/ids.mjs'
import { rollupSourceEligibilityError } from './enrichment-session-source-policy.mjs'

const ROOT = process.cwd()
const MANIFEST_PATH = path.join(ROOT, 'ops', 'research-sessions', 'session-manifest.json')
const HISTORICAL_RECONCILIATIONS_PATH = path.join(ROOT, 'ops', 'research-sessions', 'historical-owner-reconciliations.json')
const LEGACY_PATH = path.join(ROOT, 'ops', 'enrichment-submissions.json')
const FRAGMENT_ROOT = path.join(ROOT, 'ops', 'enrichment-submissions', 'sessions')
const SOURCE_REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const SUBMISSION_SCHEMA_PATH = path.join(ROOT, 'schemas', 'enrichment-submission.schema.json')
const FRAGMENT_SCHEMA_PATH = path.join(ROOT, 'schemas', 'enrichment-session-fragment.schema.json')
const HISTORICAL_DISPOSITIONS = new Set(['historical_foreign_owner', 'historical_unresolved_owner'])

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function listJsonFiles(root) {
  if (!fs.existsSync(root)) return []
  const output = []
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name)
    if (entry.isDirectory()) output.push(...listJsonFiles(full))
    else if (entry.isFile() && entry.name.endsWith('.json')) output.push(full)
  }
  return output.sort()
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

function fail(errors) {
  console.error(`Parallel enrichment session validation failed (${errors.length} error${errors.length === 1 ? '' : 's'}):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
}

function buildHistoricalReconciliationIndex(document, errors) {
  const index = new Map()
  const expectedKeys = new Set()
  if (document?.version !== 1) errors.push('historical-owner-reconciliations.json version must equal 1')
  if (!Array.isArray(document?.entries)) {
    errors.push('historical-owner-reconciliations.json entries must be an array')
    return { index, expectedKeys }
  }

  for (const [entryIndex, entry] of document.entries.entries()) {
    const label = `historical-owner-reconciliations.json entries[${entryIndex}]`
    if (typeof entry?.fragmentPath !== 'string' || !entry.fragmentPath.startsWith('ops/enrichment-submissions/sessions/')) {
      errors.push(`${label} fragmentPath must point under ops/enrichment-submissions/sessions/`)
    }
    if (!Array.isArray(entry?.submissionIds) || entry.submissionIds.length === 0) {
      errors.push(`${label} submissionIds must be a non-empty array`)
      continue
    }
    if (!HISTORICAL_DISPOSITIONS.has(entry.disposition)) {
      errors.push(`${label} disposition must be historical_foreign_owner or historical_unresolved_owner`)
    }
    if (entry.disposition === 'historical_foreign_owner' && !entry.canonical?.workpackId) {
      errors.push(`${label} historical_foreign_owner requires canonical workpack metadata`)
    }
    if (entry.disposition === 'historical_unresolved_owner' && entry.canonical != null) {
      errors.push(`${label} historical_unresolved_owner must keep canonical as null until ownership is resolved`)
    }
    for (const submissionId of entry.submissionIds) {
      const key = historicalReconciliationKey(entry.fragmentPath, submissionId)
      if (index.has(key)) errors.push(`${label} duplicates baseline key ${key}`)
      index.set(key, entry)
      expectedKeys.add(key)
    }
  }
  return { index, expectedKeys }
}

function submittedBaselineMatches(entry, { fragmentPath, fragment, submission }) {
  return (
    entry?.fragmentPath === fragmentPath &&
    entry?.historicalSessionId === fragment.sessionId &&
    entry?.historicalShard === fragment.shard &&
    entry?.submitted?.workpackId === submission.workpackId &&
    entry?.submitted?.entityType === submission.entityType &&
    entry?.submitted?.entitySlug === submission.entitySlug
  )
}

function historicalForeignBaselineMatches(entry, context) {
  const { reconciliation, canonicalShard } = context
  return (
    submittedBaselineMatches(entry, context) &&
    entry?.canonical?.workpackId === reconciliation.canonical.workpackId &&
    entry?.canonical?.entityType === reconciliation.canonical.entityType &&
    entry?.canonical?.entitySlug === reconciliation.canonical.slug &&
    entry?.canonical?.shard === canonicalShard &&
    entry?.disposition === 'historical_foreign_owner'
  )
}

function historicalUnresolvedBaselineMatches(entry, context) {
  return (
    submittedBaselineMatches(entry, context) &&
    entry?.canonical == null &&
    entry?.disposition === 'historical_unresolved_owner' &&
    /unknown_canonical_owner/u.test(context.resolutionError?.message ?? '')
  )
}

const errors = []
const manifest = readJson(MANIFEST_PATH)
const historicalDocument = fs.existsSync(HISTORICAL_RECONCILIATIONS_PATH)
  ? readJson(HISTORICAL_RECONCILIATIONS_PATH)
  : { version: 1, entries: [] }
const { index: historicalBySubmission, expectedKeys: expectedHistoricalKeys } = buildHistoricalReconciliationIndex(
  historicalDocument,
  errors,
)
const usedHistoricalKeys = new Set()
const reconciledHistoricalRows = []
const ownerResolver = createCanonicalOwnerResolver({ root: ROOT })

if (manifest.manifestVersion !== 1) errors.push('session-manifest.json manifestVersion must equal 1')
if (!Number.isInteger(manifest.shardCount) || manifest.shardCount < 1) {
  errors.push('session-manifest.json shardCount must be a positive integer')
}
if (!Array.isArray(manifest.sessions) || manifest.sessions.length === 0) {
  errors.push('session-manifest.json must define at least one session')
}

const sessionById = new Map()
const shardOwners = new Map()
for (const session of manifest.sessions ?? []) {
  if (!/^[A-Z]$/u.test(session.sessionId ?? '')) errors.push(`invalid sessionId ${JSON.stringify(session.sessionId)}`)
  if (sessionById.has(session.sessionId)) errors.push(`duplicate sessionId ${session.sessionId}`)
  sessionById.set(session.sessionId, session)

  if (!Number.isInteger(session.shard) || session.shard < 0 || session.shard >= manifest.shardCount) {
    errors.push(`session ${session.sessionId} has invalid shard ${session.shard}`)
  }
  if (shardOwners.has(session.shard)) {
    errors.push(`shard ${session.shard} is assigned to both ${shardOwners.get(session.shard)} and ${session.sessionId}`)
  }
  shardOwners.set(session.shard, session.sessionId)
}

const submissionSchema = readJson(SUBMISSION_SCHEMA_PATH)
const fragmentSchema = readJson(FRAGMENT_SCHEMA_PATH)
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: true })
addFormats(ajv)
ajv.addSchema(submissionSchema)
const validateFragment = ajv.compile(fragmentSchema)

const legacy = fs.existsSync(LEGACY_PATH) ? readJson(LEGACY_PATH) : []
if (!Array.isArray(legacy)) errors.push('ops/enrichment-submissions.json must remain an array')

const sourceRegistry = fs.existsSync(SOURCE_REGISTRY_PATH) ? readJson(SOURCE_REGISTRY_PATH) : []
if (!Array.isArray(sourceRegistry)) errors.push('public/data/source-registry.json must remain an array')
const sourceById = new Map(
  (Array.isArray(sourceRegistry) ? sourceRegistry : [])
    .filter(source => typeof source?.sourceId === 'string')
    .map(source => [source.sourceId, source]),
)

const knownSubmissionIds = new Map()
const knownFingerprints = new Map()
for (const submission of Array.isArray(legacy) ? legacy : []) {
  if (knownSubmissionIds.has(submission.submissionId)) {
    errors.push(`legacy duplicate submissionId ${submission.submissionId}`)
  } else {
    knownSubmissionIds.set(submission.submissionId, 'legacy')
  }

  let reconciliation = null
  try {
    reconciliation = reconcilePersistedSubmissionOwner(submission, ownerResolver.resolveWorkpack)
  } catch {
    // Legacy submissions predate the sharded fragment contract. Preserve their
    // raw target if current canonical profile authority cannot resolve them;
    // #4537 owns full legacy+parallel promotion reconciliation.
  }
  const fingerprint = findingFingerprint(submission, reconciliation)
  if (!knownFingerprints.has(fingerprint)) knownFingerprints.set(fingerprint, `legacy:${submission.submissionId}`)
}

let fragmentCount = 0
let parallelSubmissionCount = 0
for (const filePath of listJsonFiles(FRAGMENT_ROOT)) {
  fragmentCount += 1
  const relative = path.relative(ROOT, filePath).replaceAll('\\', '/')
  const fragment = readJson(filePath)

  if (!validateFragment(fragment)) {
    errors.push(`${relative} schema: ${ajv.errorsText(validateFragment.errors, { separator: '; ' })}`)
    continue
  }

  const session = sessionById.get(fragment.sessionId)
  if (!session) {
    errors.push(`${relative} references unknown session ${fragment.sessionId}`)
    continue
  }
  if (session.enabled !== true) errors.push(`${relative} references disabled session ${fragment.sessionId}`)
  if (fragment.shard !== session.shard) {
    errors.push(`${relative} declares shard ${fragment.shard}; session ${fragment.sessionId} owns shard ${session.shard}`)
  }

  const expectedDirectory = `ops/enrichment-submissions/sessions/session-${fragment.sessionId.toLowerCase()}/`
  if (!relative.startsWith(expectedDirectory)) {
    errors.push(`${relative} must live under ${expectedDirectory}`)
  }

  const workpacksSeen = new Set()
  for (const submission of fragment.submissions) {
    parallelSubmissionCount += 1
    const baselineKey = historicalReconciliationKey(relative, submission.submissionId)
    const baseline = historicalBySubmission.get(baselineKey)

    let reconciliation = null
    let resolutionError = null
    try {
      reconciliation = reconcilePersistedSubmissionOwner(submission, ownerResolver.resolveWorkpack)
    } catch (error) {
      resolutionError = error
    }

    let historicalMismatchAllowed = false
    let historicalUnresolvedAllowed = false

    if (!reconciliation) {
      if (baseline && historicalUnresolvedBaselineMatches(baseline, {
        fragmentPath: relative,
        fragment,
        submission,
        resolutionError,
      })) {
        historicalUnresolvedAllowed = true
        usedHistoricalKeys.add(baselineKey)
        if (submission.reviewStatus === 'approved_for_rollup') {
          errors.push(
            `${relative} submission ${submission.submissionId} has unresolved historical owner and cannot be approved_for_rollup`,
          )
        }
        reconciledHistoricalRows.push({
          disposition: 'historical_unresolved_owner',
          fragmentPath: relative,
          submissionId: submission.submissionId,
          submittedWorkpackId: submission.workpackId,
          canonicalWorkpackId: null,
          historicalShard: session.shard,
          canonicalShard: null,
          via: ['unresolved-current-canonical-owner'],
        })
      } else {
        errors.push(
          `${relative} submission ${submission.submissionId} canonical owner: ${resolutionError?.message ?? 'resolution failed'}`,
        )
      }
    }

    const effectiveWorkpackId = reconciliation?.canonical?.workpackId ?? submission.workpackId
    workpacksSeen.add(effectiveWorkpackId)
    const assignedShard = shardOf(effectiveWorkpackId, manifest.shardCount)

    if (reconciliation?.changed) {
      if (!baseline) {
        errors.push(
          `${relative} submission ${submission.submissionId} has unaccounted canonical-owner drift: ` +
            `${submission.workpackId}/${submission.entityType}:${submission.entitySlug} -> ` +
            `${reconciliation.canonical.workpackId}/${reconciliation.canonical.entityType}:${reconciliation.canonical.slug}`,
        )
      } else if (!historicalForeignBaselineMatches(baseline, {
        fragmentPath: relative,
        fragment,
        submission,
        reconciliation,
        canonicalShard: assignedShard,
      })) {
        errors.push(`${relative} submission ${submission.submissionId} no longer matches its historical owner reconciliation baseline`)
      } else {
        historicalMismatchAllowed = true
        usedHistoricalKeys.add(baselineKey)
        reconciledHistoricalRows.push({
          disposition: 'historical_foreign_owner',
          fragmentPath: relative,
          submissionId: submission.submissionId,
          submittedWorkpackId: submission.workpackId,
          canonicalWorkpackId: reconciliation.canonical.workpackId,
          historicalShard: session.shard,
          canonicalShard: assignedShard,
          via: [...new Set(reconciliation.via.map(step => step.authority).filter(Boolean))],
        })
      }
    }

    if (assignedShard !== session.shard && !historicalMismatchAllowed && !historicalUnresolvedAllowed) {
      errors.push(
        `${relative} submission ${submission.submissionId} canonicalizes to ${effectiveWorkpackId}, assigned to shard ${assignedShard}, not session ${fragment.sessionId} shard ${session.shard}`,
      )
    }

    const sourceEligibilityError = rollupSourceEligibilityError(submission, sourceById)
    if (sourceEligibilityError) {
      errors.push(`${relative} submission ${submission.submissionId} cannot be approved_for_rollup: ${sourceEligibilityError}`)
    }

    const previousIdOwner = knownSubmissionIds.get(submission.submissionId)
    if (previousIdOwner) {
      errors.push(`${relative} reuses submissionId ${submission.submissionId} already owned by ${previousIdOwner}`)
    } else {
      knownSubmissionIds.set(submission.submissionId, relative)
    }

    const fingerprint = findingFingerprint(submission, reconciliation)
    const previousFindingOwner = knownFingerprints.get(fingerprint)
    if (previousFindingOwner) {
      errors.push(
        `${relative} submission ${submission.submissionId} duplicates an existing finding (${previousFindingOwner}) for the same canonical target/source/topic/claim/text`,
      )
    } else {
      knownFingerprints.set(fingerprint, `${relative}:${submission.submissionId}`)
    }
  }

  if (workpacksSeen.size === 0) errors.push(`${relative} contains no workpacks`)
}

for (const baselineKey of expectedHistoricalKeys) {
  if (!usedHistoricalKeys.has(baselineKey)) {
    errors.push(`historical owner reconciliation baseline is stale or unused: ${baselineKey}`)
  }
}

if (errors.length) {
  fail(errors)
} else {
  console.log('Parallel enrichment session coordination is safe.')
  console.log(`  sessions: ${sessionById.size}`)
  console.log(`  shards: ${manifest.shardCount}`)
  console.log(`  source registry entries: ${sourceById.size}`)
  console.log(`  fragment files: ${fragmentCount}`)
  console.log(`  parallel submissions: ${parallelSubmissionCount}`)
  console.log(`  legacy submissions checked: ${Array.isArray(legacy) ? legacy.length : 0}`)
  console.log(`  historical owner reconciliations: ${reconciledHistoricalRows.length}`)
  for (const row of reconciledHistoricalRows) {
    if (row.disposition === 'historical_unresolved_owner') {
      console.log(
        `    ${row.fragmentPath}:${row.submissionId} ${row.submittedWorkpackId} -> unresolved ` +
          `(historical shard ${row.historicalShard}; promotion blocked)`,
      )
      continue
    }
    console.log(
      `    ${row.fragmentPath}:${row.submissionId} ${row.submittedWorkpackId} -> ${row.canonicalWorkpackId} ` +
        `(historical shard ${row.historicalShard}; canonical shard ${row.canonicalShard}; via ${row.via.join(', ') || 'canonical owner'})`,
    )
  }
}
