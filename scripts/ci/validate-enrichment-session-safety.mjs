#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { shardOf } from '../enrichment-pipeline/lib/ids.mjs'
import { rollupSourceEligibilityError } from './enrichment-session-source-policy.mjs'

const ROOT = process.cwd()
const MANIFEST_PATH = path.join(ROOT, 'ops', 'research-sessions', 'session-manifest.json')
const LEGACY_PATH = path.join(ROOT, 'ops', 'enrichment-submissions.json')
const FRAGMENT_ROOT = path.join(ROOT, 'ops', 'enrichment-submissions', 'sessions')
const SOURCE_REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const SUBMISSION_SCHEMA_PATH = path.join(ROOT, 'schemas', 'enrichment-submission.schema.json')
const FRAGMENT_SCHEMA_PATH = path.join(ROOT, 'schemas', 'enrichment-session-fragment.schema.json')

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

function targetKey(submission) {
  return submission.entityType === 'surface'
    ? `surface:${submission.surfaceId ?? ''}`
    : `${submission.entityType}:${submission.entitySlug ?? ''}`
}

function findingFingerprint(submission) {
  return [
    targetKey(submission),
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

const errors = []
const manifest = readJson(MANIFEST_PATH)

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
  const fingerprint = findingFingerprint(submission)
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
    workpacksSeen.add(submission.workpackId)

    const assignedShard = shardOf(submission.workpackId, manifest.shardCount)
    if (assignedShard !== session.shard) {
      errors.push(
        `${relative} submission ${submission.submissionId} uses ${submission.workpackId}, assigned to shard ${assignedShard}, not session ${fragment.sessionId} shard ${session.shard}`,
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

    const fingerprint = findingFingerprint(submission)
    const previousFindingOwner = knownFingerprints.get(fingerprint)
    if (previousFindingOwner) {
      errors.push(
        `${relative} submission ${submission.submissionId} duplicates an existing finding (${previousFindingOwner}) for the same target/source/topic/claim/text`,
      )
    } else {
      knownFingerprints.set(fingerprint, `${relative}:${submission.submissionId}`)
    }
  }

  if (workpacksSeen.size === 0) errors.push(`${relative} contains no workpacks`)
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
}
