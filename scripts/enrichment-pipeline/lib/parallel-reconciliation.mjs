import fs from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { createCanonicalOwnerResolver } from './canonical-owner.mjs'
import { canonicalTargetKey, reconcilePersistedSubmissionOwner } from './fragment-owner-reconciliation.mjs'
import { shardOf } from './ids.mjs'
import { rollupSourceEligibilityError } from '../../ci/enrichment-session-source-policy.mjs'

const REVIEW_STATUSES = new Set(['draft_submission','needs_validation_fix','ready_for_review','under_review','approved_for_rollup','revision_requested','rejected','deprecated_submission'])
const STAGING_ONLY = new Set(['draft_submission','needs_validation_fix','ready_for_review','under_review','revision_requested','rejected','deprecated_submission'])
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'))

function files(root) {
  if (!fs.existsSync(root)) return []
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(root, entry.name)
    return entry.isDirectory() ? files(full) : entry.isFile() && entry.name.endsWith('.json') ? [full] : []
  }).sort()
}
function comparable(value) { return String(value ?? '').toLowerCase().replace(/\s+/gu, ' ').replace(/[^a-z0-9 ]/gu, '').trim() }
function targetKey(s) { return s.entityType === 'surface' ? `surface:${s.surfaceId ?? ''}` : `${s.entityType}:${s.entitySlug ?? ''}` }
function fingerprint(s, r) { return [r ? canonicalTargetKey(s, r) : targetKey(s), s.sourceId, s.topicType, s.claimType, comparable(s.findingTextNormalized)].join('|') }

/** Read-only bridge. It never edits legacy/parallel inputs or changes reviewStatus. */
export function reconcileParallelSubmissions({ root = process.cwd() } = {}) {
  const manifest = readJson(path.join(root, 'ops/research-sessions/session-manifest.json'))
  const legacy = fs.existsSync(path.join(root, 'ops/enrichment-submissions.json')) ? readJson(path.join(root, 'ops/enrichment-submissions.json')) : []
  const registry = readJson(path.join(root, 'public/data/source-registry.json'))
  const schema = readJson(path.join(root, 'schemas/enrichment-submission.schema.json'))
  const fragmentSchema = readJson(path.join(root, 'schemas/enrichment-session-fragment.schema.json'))
  const sessions = new Map((manifest.sessions ?? []).map(s => [s.sessionId, s]))
  const sources = new Map(registry.map(s => [s.sourceId, s]))
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: true }); addFormats(ajv); ajv.addSchema(schema)
  const validateSubmission = ajv.compile(schema); const validateFragment = ajv.compile(fragmentSchema)
  const resolver = createCanonicalOwnerResolver({ root })
  const candidates = [], blocked = [], errors = [], ids = new Map(), fps = new Map()

  function add(submission, sourceKind, provenance, reconciliation, preset = []) {
    const reasons = [...preset]
    if (!REVIEW_STATUSES.has(submission.reviewStatus)) reasons.push('unknown_review_status')
    if (submission.active !== true) reasons.push('submission_inactive')
    const sourceError = rollupSourceEligibilityError(submission, sources)
    if (sourceError) reasons.push(sourceError)
    const fp = fingerprint(submission, reconciliation)
    if (ids.has(submission.submissionId)) reasons.push(`duplicate_submission_id:${ids.get(submission.submissionId)}`)
    if (fps.has(fp)) reasons.push(`duplicate_finding_fingerprint:${fps.get(fp)}`)
    const record = {
      submission: structuredClone(submission), sourceKind,
      provenance: { sessionId: provenance.sessionId ?? null, shard: provenance.shard ?? null, fragmentPath: provenance.fragmentPath ?? null, batchId: provenance.batchId ?? null, submissionId: submission.submissionId, workpackId: submission.workpackId, sourceId: submission.sourceId, reviewDecision: submission.reviewStatus, promotionReceipt: null },
      reconciliation: { canonicalWorkpackId: reconciliation?.canonical?.workpackId ?? submission.workpackId, findingFingerprint: fp, stagingOnly: STAGING_ONLY.has(submission.reviewStatus), eligible: reasons.length === 0, reasons: [...new Set(reasons)] },
    }
    ;(reasons.length ? blocked : candidates).push(record)
    if (!ids.has(submission.submissionId)) ids.set(submission.submissionId, `${sourceKind}:${provenance.fragmentPath ?? 'legacy'}`)
    if (!fps.has(fp)) fps.set(fp, `${sourceKind}:${submission.submissionId}`)
  }

  for (const submission of legacy) {
    if (!validateSubmission(submission)) { errors.push(`legacy:${submission.submissionId ?? '<missing>'}:${ajv.errorsText(validateSubmission.errors)}`); continue }
    let r = null; try { r = reconcilePersistedSubmissionOwner(submission, resolver.resolveWorkpack) } catch { /* legacy fallback */ }
    add(submission, 'legacy', {}, r)
  }

  for (const filePath of files(path.join(root, 'ops/enrichment-submissions/sessions'))) {
    const fragmentPath = path.relative(root, filePath).replaceAll('\\', '/')
    const fragment = readJson(filePath)
    if (!validateFragment(fragment)) { blocked.push({ sourceKind:'parallel', provenance:{fragmentPath}, reconciliation:{eligible:false,reasons:[`fragment_schema:${ajv.errorsText(validateFragment.errors)}`]}}); continue }
    const session = sessions.get(fragment.sessionId)
    const fragmentReasons = []
    if (!session) fragmentReasons.push(`unknown_session:${fragment.sessionId}`)
    else {
      if (session.enabled !== true) fragmentReasons.push(`disabled_session:${fragment.sessionId}`)
      if (fragment.shard !== session.shard) fragmentReasons.push(`foreign_shard:${fragment.shard}->${session.shard}`)
    }
    const expected = `ops/enrichment-submissions/sessions/session-${fragment.sessionId.toLowerCase()}/`
    if (!fragmentPath.startsWith(expected)) fragmentReasons.push(`foreign_fragment_directory:${expected}`)
    for (const submission of fragment.submissions) {
      const reasons = [...fragmentReasons]
      let r = null
      try { r = reconcilePersistedSubmissionOwner(submission, resolver.resolveWorkpack) } catch (error) { reasons.push(`canonical_owner:${error.message}`) }
      if (r?.canonical?.workpackId && session && shardOf(r.canonical.workpackId, manifest.shardCount) !== session.shard) reasons.push(`canonical_foreign_shard:${shardOf(r.canonical.workpackId, manifest.shardCount)}->${session.shard}`)
      add(submission, 'parallel', { sessionId:fragment.sessionId, shard:fragment.shard, fragmentPath, batchId:fragment.batchId }, r, reasons)
    }
  }

  const all = [...candidates, ...blocked]
  return { version:1, deterministicModelVersion:'parallel-enrichment-reconciliation-v1', generatedAt:new Date().toISOString(), readOnly:true,
    inputs:{legacyPath:'ops/enrichment-submissions.json',fragmentRoot:'ops/enrichment-submissions/sessions',manifestPath:'ops/research-sessions/session-manifest.json',sourceRegistryPath:'public/data/source-registry.json'},
    summary:{legacyCount:all.filter(x=>x.sourceKind==='legacy').length,parallelCount:all.filter(x=>x.sourceKind==='parallel').length,candidateCount:candidates.length,blockedCount:blocked.length,eligibleLegacy:candidates.filter(x=>x.sourceKind==='legacy').length,eligibleParallel:candidates.filter(x=>x.sourceKind==='parallel').length,stagingOnlyCount:all.filter(x=>x.reconciliation?.stagingOnly).length,errorCount:errors.length},
    candidates, blocked, errors }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = reconcileParallelSubmissions()
  const arg = process.argv.find(x => x.startsWith('--output='))
  const output = path.resolve(process.cwd(), arg?.slice(9) ?? 'ops/reports/enrichment-parallel-reconciliation.json')
  fs.mkdirSync(path.dirname(output), { recursive:true }); fs.writeFileSync(output, `${JSON.stringify(result,null,2)}\n`)
  console.log(`Parallel reconciliation: ${result.summary.candidateCount} eligible, ${result.summary.blockedCount} blocked, ${result.summary.errorCount} structural errors.`)
  if (result.errors.length) process.exitCode = 1
}
