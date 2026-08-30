import fs from 'node:fs'
import path from 'node:path'
import { shardOf } from './ids.mjs'
import { createCanonicalOwnerResolver, workpackIdForOwner } from './canonical-owner.mjs'

const TERMINAL_REVIEW_STATUSES = new Set(['rejected', 'deprecated_submission'])
const TERMINAL_PROMOTION_STATUSES = new Set(['promoted', 'not_promoted', 'quarantined'])

function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}

function listJson(root) {
  if (!fs.existsSync(root)) return []
  return fs.readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
    .map(entry => path.join(root, entry.name))
    .sort()
}

function findingTerminalState(submission, sidecar = null) {
  const promotionStatus = sidecar?.promotionStatus ?? submission?.promotionStatus ?? null
  const reviewStatus = sidecar?.reviewStatus ?? submission?.reviewStatus ?? null

  if (promotionStatus === 'promoted') return { terminal: true, outcome: 'promoted' }
  if (TERMINAL_PROMOTION_STATUSES.has(promotionStatus)) return { terminal: true, outcome: promotionStatus }
  if (submission?.active === false) return { terminal: true, outcome: 'inactive' }
  if (TERMINAL_REVIEW_STATUSES.has(reviewStatus)) return { terminal: true, outcome: reviewStatus }
  if (reviewStatus === 'approved_for_rollup') return { terminal: false, outcome: 'awaiting_promotion' }
  if (reviewStatus === 'ready_for_review') return { terminal: false, outcome: 'awaiting_review' }
  return { terminal: false, outcome: 'research_staged' }
}

function collectWorkpackLifecycle(root) {
  const lifecycle = new Map()
  const attestationDocument = readJson(path.join(root, 'ops', 'enrichment-semantic-attestations.json'), { entries: [] })
  const sidecarBySubmission = new Map((attestationDocument?.entries ?? []).map(entry => [entry.submissionId, entry]))

  const walk = dir => {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.isFile() && entry.name.endsWith('.json')) {
        const fragment = readJson(full)
        for (const submission of fragment?.submissions ?? []) {
          if (typeof submission?.workpackId !== 'string') continue
          const state = lifecycle.get(submission.workpackId) ?? {
            staged: true,
            findingCount: 0,
            terminalFindings: 0,
            promotedFindings: 0,
            pendingFindings: 0,
            outcomes: {},
          }
          const terminal = findingTerminalState(submission, sidecarBySubmission.get(submission.submissionId))
          state.findingCount += 1
          state.terminalFindings += terminal.terminal ? 1 : 0
          state.promotedFindings += terminal.outcome === 'promoted' ? 1 : 0
          state.pendingFindings += terminal.terminal ? 0 : 1
          state.outcomes[terminal.outcome] = (state.outcomes[terminal.outcome] ?? 0) + 1
          lifecycle.set(submission.workpackId, state)
        }
      }
    }
  }

  walk(path.join(root, 'ops', 'enrichment-submissions', 'sessions'))
  for (const state of lifecycle.values()) {
    state.completed = state.findingCount > 0 && state.pendingFindings === 0
    state.closureState = state.completed
      ? (state.promotedFindings > 0 ? 'terminal_with_promotion' : 'terminal_without_promotion')
      : 'closure_required'
  }
  return lifecycle
}

export function workpackIdFor(entityType, slug) {
  return workpackIdForOwner(entityType, slug)
}

export function scoreBootstrapCandidate(record) {
  const reasons = []
  let score = 0
  const sources = Array.isArray(record?.sources) ? record.sources : []
  const claimMap = Array.isArray(record?.claimMap) ? record.claimMap : []
  const declaredSourceCount = Number.isFinite(Number(record?.evidence?.sourceCount)) ? Number(record.evidence.sourceCount) : null
  const declaredClaimCount = Number.isFinite(Number(record?.evidence?.claimCount)) ? Number(record.evidence.claimCount) : null
  const sourceCount = declaredSourceCount ?? sources.length
  const claimCount = declaredClaimCount ?? claimMap.length
  const published = record?.indexability_status === 'PUBLISH' || record?.robots === 'index,follow'
  const summary = String(record?.summary ?? '')
  const indexabilityReasons = Array.isArray(record?.indexability_reasons) ? record.indexability_reasons : []
  const hasHumanTrialMetadata = sources.some(source =>
    /human|randomi[sz]ed|controlled trial|\brct\b/i.test(`${source?.studyClass ?? ''} ${source?.studyType ?? ''}`)
  )

  if (published) { score += 20; reasons.push('published') }
  if (sourceCount === 0) { score += published ? 35 : 20; reasons.push('zero-record-level-sources') }
  if (/Grade A|strong evidence/i.test(summary) && sourceCount === 0) {
    score += 30
    reasons.push('strong-framing-with-zero-sources')
  }
  if (/none of which measured an outcome in people|mechanism rather than demonstrated benefit/i.test(summary)) {
    score += 12
    reasons.push('human-outcome-gap')
  }
  if (/none of which measured an outcome in people/i.test(summary) && hasHumanTrialMetadata) {
    score += 25
    reasons.push('summary-human-evidence-contradiction')
  }
  if (declaredSourceCount !== null && declaredSourceCount !== sources.length) {
    score += 20
    reasons.push('source-count-drift')
  }
  if (declaredClaimCount !== null && declaredClaimCount !== claimMap.length) {
    score += 15
    reasons.push('claim-count-drift')
  }
  if (claimCount === 0) { score += 8; reasons.push('empty-claim-map') }
  if (published && sourceCount > 0 && claimCount === 0) {
    score += 8
    reasons.push('published-sources-without-claims')
  }
  if (record?.governance?.requiresHumanReview === true || record?.governance?.reviewStatus === 'needs_review') {
    score += 10
    reasons.push('needs-human-review')
  }
  if (indexabilityReasons.includes('missing_record_level_sources')) {
    score += 18
    reasons.push('missing-record-level-sources-gate')
  }
  if (indexabilityReasons.includes('summary-quality-missing')) {
    score += 5
    reasons.push('summary-quality-missing')
  }
  if (record?.indexability_status === 'NOINDEX') {
    score -= 5
    reasons.push('noindex-lower-public-exposure')
  }

  return {
    score,
    reasons: [...new Set(reasons)].sort(),
    sourceCount,
    claimCount,
    sourceArrayCount: sources.length,
    claimArrayCount: claimMap.length,
    published,
  }
}

export function buildSessionBootstrap({ root, sessionId, manifest }) {
  const session = (manifest.sessions ?? []).find(item => item.sessionId === sessionId)
  if (!session) throw new Error(`Unknown research session ${sessionId}`)
  if (session.enabled !== true) throw new Error(`Research session ${sessionId} is disabled`)
  const shardCount = manifest.shardCount ?? 8
  const lifecycle = collectWorkpackLifecycle(root)
  const ownerResolver = createCanonicalOwnerResolver({ root })
  const candidateByWorkpack = new Map()

  for (const [entityType, directory] of [
    ['herb', path.join(root, 'public', 'data', 'herbs-detail')],
    ['compound', path.join(root, 'public', 'data', 'compounds-detail')],
  ]) {
    for (const file of listJson(directory)) {
      const record = readJson(file)
      const slug = record?.slug ?? record?.id ?? path.basename(file, '.json')
      if (!slug) continue
      const submittedWorkpackId = workpackIdFor(entityType, slug)
      const resolved = ownerResolver.resolveWorkpack({
        workpackId: submittedWorkpackId,
        entityType,
        entitySlug: slug,
        slug,
      })
      const workpackId = resolved.workpackId
      const shard = shardOf(workpackId, shardCount)
      if (shard !== session.shard) continue
      const roi = scoreBootstrapCandidate(record)
      const workpackLifecycle = lifecycle.get(workpackId) ?? {
        staged: false,
        completed: false,
        closureState: 'research_required',
        findingCount: 0,
        terminalFindings: 0,
        promotedFindings: 0,
        pendingFindings: 0,
        outcomes: {},
      }
      const candidate = {
        workpackId,
        entityType: resolved.entityType,
        slug: resolved.slug,
        name: record?.name ?? resolved.slug,
        shard,
        sessionId,
        ...workpackLifecycle,
        ownerResolution: resolved.ownerResolution,
        ...roi,
      }
      const previous = candidateByWorkpack.get(workpackId)
      if (!previous || candidate.score > previous.score || (candidate.score === previous.score && submittedWorkpackId === workpackId)) {
        candidateByWorkpack.set(workpackId, candidate)
      }
    }
  }

  const candidates = [...candidateByWorkpack.values()]
  candidates.sort((a, b) =>
    Number(a.completed) - Number(b.completed) ||
    Number(b.staged) - Number(a.staged) ||
    b.score - a.score ||
    a.workpackId.localeCompare(b.workpackId)
  )

  const remaining = candidates.filter(item => !item.completed)
  const staged = candidates.filter(item => item.staged)
  const closureBacklog = candidates.filter(item => item.staged && !item.completed)
  const completed = candidates.filter(item => item.completed)
  return {
    modelVersion: 'research-session-bootstrap-v3',
    sessionId,
    workerId: session.workerId,
    shard: session.shard,
    shardCount,
    ownedWorkpacks: candidates.length,
    stagedWorkpacks: staged.length,
    completedWorkpacks: completed.length,
    closureBacklogWorkpacks: closureBacklog.length,
    unstartedWorkpacks: candidates.length - staged.length,
    remainingWorkpacks: remaining.length,
    next: remaining.slice(0, 25),
    candidates,
  }
}
