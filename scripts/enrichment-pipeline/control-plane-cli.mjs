#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { shardOf } from './lib/ids.mjs'
import { createCanonicalOwnerResolver } from './lib/canonical-owner.mjs'
import { evaluateRuntimeSourceRegistryReferences } from '../lib/runtime-source-registry-audit.mjs'
import {
  admissionDecision, computeSessionYield, fanoutCandidates, prioritizeSubmissions,
  promotionBlockerDisposition, promotionDecision, scheduleShard, scoreOrphan,
} from './lib/control-plane.mjs'

const ROOT = process.cwd()
const FRAGMENT_ROOT = path.join(ROOT, 'ops', 'enrichment-submissions', 'sessions')
const SOURCE_REGISTRY = path.join(ROOT, 'public', 'data', 'source-registry.json')
const MANIFEST = path.join(ROOT, 'ops', 'research-sessions', 'session-manifest.json')
const ATTESTATIONS = path.join(ROOT, 'ops', 'enrichment-semantic-attestations.json')
const IDENTITY_QUARANTINE = path.join(ROOT, 'ops', 'source-identity-quarantine.json')
const OUTPUT = path.join(ROOT, 'artifacts', 'enrichment-control-plane.json')
const PROMOTION_QUEUE = path.join(ROOT, 'artifacts', 'enrichment-promotion-queue.json')
const ADJUDICATION_QUEUE = path.join(ROOT, 'artifacts', 'enrichment-automated-adjudication-queue.json')
const ORPHAN_QUEUE = path.join(ROOT, 'artifacts', 'enrichment-orphan-repair-queue.json')

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}
function listJson(root) {
  if (!fs.existsSync(root)) return []
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(root, entry.name)
    return entry.isDirectory() ? listJson(full) : entry.name.endsWith('.json') ? [full] : []
  }).sort()
}
function asRecords(value) {
  if (Array.isArray(value)) return value
  for (const key of ['items', 'records', 'herbs', 'compounds', 'data']) if (Array.isArray(value?.[key])) return value[key]
  return []
}
function safetyMentionsSource(record, sourceId) {
  const visit = (value, key = '') => {
    if (value == null) return false
    if (typeof value === 'string') return /safety|interaction|contraindication|adverse|pregnan|lactat|pediatric|surgery/i.test(key) && value.includes(sourceId)
    if (Array.isArray(value)) return value.some(item => visit(item, key))
    if (typeof value === 'object') return Object.entries(value).some(([childKey, child]) => visit(child, `${key}.${childKey}`))
    return false
  }
  return visit(record)
}

const attestationDocument = readJson(ATTESTATIONS, { entries: [] })
const attestationBySubmission = new Map((attestationDocument.entries ?? []).map(entry => [entry.submissionId, entry]))
const quarantineDocument = readJson(IDENTITY_QUARANTINE, { entries: [] })
const quarantinedSourceIds = new Set((quarantineDocument.entries ?? []).flatMap(entry => [entry.sourceId, entry.candidateSourceId]).filter(Boolean))

function loadSubmissions() {
  return listJson(FRAGMENT_ROOT).flatMap(file => {
    const fragment = readJson(file, null)
    return (fragment?.submissions ?? []).map(submission => {
      const sidecar = attestationBySubmission.get(submission.submissionId)
      return {
        ...submission,
        semanticAttestation: sidecar?.attestation ?? submission.semanticAttestation,
        sourceIdentityStatus: quarantinedSourceIds.has(submission.sourceId)
          ? 'mismatch'
          : sidecar?.sourceIdentityStatus ?? 'verified',
        promotionStatus: sidecar?.promotionStatus ?? submission.promotionStatus,
        sessionId: fragment.sessionId,
        shard: fragment.shard,
      }
    })
  })
}

const command = process.argv[2] ?? 'report'
const submissions = loadSubmissions()
const sources = readJson(SOURCE_REGISTRY, [])
const sourceById = new Map(sources.map(source => [source.sourceId, source]))
const submissionById = new Map(submissions.map(submission => [submission.submissionId, submission]))
const manifest = readJson(MANIFEST, { shardCount: 8, sessions: [] })

function promotionDecisions() {
  return submissions.map(submission => {
    const source = sourceById.get(submission.sourceId)
    const effectiveSource = source && submission.sourceIdentityStatus === 'mismatch'
      ? { ...source, identityAttestation: { status: 'mismatch' } }
      : source
    const decision = promotionDecision(submission, effectiveSource)
    return { submissionId: submission.submissionId, ...decision, ...promotionBlockerDisposition(decision) }
  })
}

function adjudicationKinds(decision) {
  const status = decision.adjudication?.status
  if (status === 'pending_source_admission') return ['source_admission']
  if (status === 'pending_semantic_adjudication') return ['semantic_attestation']
  if (status === 'pending_evidence_receipt') return ['semantic_evidence_receipt', 'scientific_editorial_adjudication']
  return ['scientific_editorial_adjudication']
}

function buildAutomatedAdjudicationQueue(decisions = promotionDecisions()) {
  return decisions
    .filter(decision => decision.automatedAdjudicationPending)
    .map(decision => {
      const submission = submissionById.get(decision.submissionId) ?? {}
      return {
        submissionId: decision.submissionId,
        sessionId: submission.sessionId ?? null,
        shard: submission.shard ?? null,
        workpackId: submission.workpackId ?? null,
        sourceId: submission.sourceId ?? null,
        entityType: submission.entityType ?? null,
        entitySlug: submission.entitySlug ?? null,
        surfaceId: submission.surfaceId ?? null,
        topicType: submission.topicType ?? null,
        claimType: submission.claimType ?? null,
        evidenceClass: submission.evidenceClass ?? null,
        route: decision.route,
        semantic: decision.semantic,
        adjudicationStatus: decision.adjudication?.status ?? null,
        adjudicationKinds: adjudicationKinds(decision),
        blockerReasons: decision.adjudicationReasons,
        evidenceDebtReasons: decision.adjudication?.reasons ?? [],
        canContinueResearch: decision.canContinueResearch,
        requiredChecks: [
          'bibliographic_identity',
          'entity_intervention_identity',
          'preparation_formulation_species_route',
          'population',
          'endpoint',
          'conclusion_direction_including_null_mixed',
          'study_design_source_class_reliability',
          'publication_integrity',
          'claim_boundary_overclaim_risk',
        ],
        evidenceReceiptRequirements: {
          reviewer: 'enrichment-adjudicator',
          confidence: 'high_or_numeric_gte_0.85',
          reviewedAt: 'valid_iso_datetime',
          axes: ['entity','preparation','population','endpoint','conclusion'],
          matchedAxisRequires: ['reason_min_12_chars','evidenceRefs_nonempty'],
          notApplicableAxisRequires: ['reason_min_12_chars'],
        },
        unresolvedPolicy: 'bounded_second_pass_then_quarantine_never_ask_owner_to_judge_science',
      }
    })
    .sort((a,b) => String(a.workpackId ?? '').localeCompare(String(b.workpackId ?? '')) || a.submissionId.localeCompare(b.submissionId))
}

function buildOrphanQueue() {
  const raw = []
  for (const [kind, filename] of [['herb', 'herbs.json'], ['compound', 'compounds.json']]) {
    for (const record of asRecords(readJson(path.join(ROOT, 'public', 'data', filename), []))) {
      for (const issue of evaluateRuntimeSourceRegistryReferences(record, kind, sources)) {
        raw.push({
          ...issue,
          published: true,
          safetyRelevant: safetyMentionsSource(record, issue.sourceId),
          humanEvidence: false,
          trafficScore: 0,
        })
      }
    }
  }
  const fanout = new Map()
  for (const item of raw) fanout.set(item.sourceId, (fanout.get(item.sourceId) ?? 0) + 1)
  return raw.map(item => ({ ...item, fanoutCount: fanout.get(item.sourceId), roi: scoreOrphan({ ...item, fanoutCount: fanout.get(item.sourceId) }) }))
    .sort((a,b) => b.roi.score - a.roi.score || a.sourceId.localeCompare(b.sourceId) || a.slug.localeCompare(b.slug))
}

if (command === 'report' || command === 'validate') {
  const promotion = promotionDecisions()
  const adjudicationQueue = buildAutomatedAdjudicationQueue(promotion)
  const prioritized = prioritizeSubmissions(submissions)
  const generatedAt = new Date().toISOString()
  const report = {
    generatedAt, modelVersion: 'enrichment-control-plane-v2',
    summary: computeSessionYield(submissions),
    routes: Object.groupBy
      ? Object.groupBy(prioritized, item => item.route)
      : prioritized.reduce((acc, item) => ((acc[item.route] ??= []).push(item), acc), {}),
    promotion: {
      eligible: promotion.filter(item => item.eligible).length,
      blocked: promotion.filter(item => !item.eligible).length,
      automatedAdjudicationPending: promotion.filter(item => item.automatedAdjudicationPending).length,
      hardBlocked: promotion.filter(item => item.hardBlocked).length,
      decisions: promotion,
    },
    automatedAdjudication: { queued: adjudicationQueue.length },
    semanticAttestations: {
      total: attestationBySubmission.size,
      coveredSubmissions: submissions.filter(s => s.semanticAttestation).length,
      missing: submissions.filter(s => !s.semanticAttestation).map(s => s.submissionId).sort(),
    },
    identityQuarantine: [...quarantinedSourceIds].sort(),
    sessions: Object.fromEntries((manifest.sessions ?? []).map(session => [session.sessionId, computeSessionYield(submissions.filter(s => s.sessionId === session.sessionId))])),
    fanout: sources.flatMap(source => fanoutCandidates(source, submissions).map(candidate => ({ sourceId: source.sourceId, ...candidate, requiresSemanticAttestation: true }))),
    orphanRepair: { queued: buildOrphanQueue().length },
  }
  if (command === 'validate') {
    const unsafe = promotion.filter(item => item.eligible && (item.semantic !== 'verified' || item.route === 'source_quarantine'))
    const ids = (attestationDocument.entries ?? []).map(entry => entry.submissionId)
    const duplicateAttestations = ids.filter((id, index, all) => all.indexOf(id) !== index)
    const unknownAttestations = [...attestationBySubmission.keys()].filter(id => !submissions.some(s => s.submissionId === id))
    const errors = []
    if (unsafe.length) errors.push({ unsafePromotion: unsafe })
    if (duplicateAttestations.length) errors.push({ duplicateAttestations: [...new Set(duplicateAttestations)] })
    if (unknownAttestations.length) errors.push({ unknownAttestations })
    if (errors.length) { console.error(JSON.stringify({ errors }, null, 2)); process.exitCode = 1 }
    else console.log('Enrichment control-plane invariants are safe.')
  } else {
    writeJson(OUTPUT, report)
    writeJson(ADJUDICATION_QUEUE, {
      modelVersion: 'enrichment-automated-adjudication-queue-v1',
      generatedAt,
      count: adjudicationQueue.length,
      queue: adjudicationQueue,
    })
    console.log(JSON.stringify(report.summary, null, 2))
    console.log(`automated adjudication queued: ${adjudicationQueue.length}`)
    console.log(`report: ${path.relative(ROOT, OUTPUT)}`)
    console.log(`adjudication queue: ${path.relative(ROOT, ADJUDICATION_QUEUE)}`)
  }
} else if (command === 'rollup') {
  const decisions = promotionDecisions()
  const admission = admissionDecision({
    queuedRuns: Number(process.env.ENRICHMENT_QUEUED_RUNS ?? 0),
    inProgressRuns: Number(process.env.ENRICHMENT_IN_PROGRESS_RUNS ?? 0),
    openEnrichmentPrs: Number(process.env.ENRICHMENT_OPEN_PRS ?? 0),
  })
  const eligibleIds = new Set(decisions.filter(item => item.eligible).map(item => item.submissionId))
  const selected = prioritizeSubmissions(submissions).filter(item => eligibleIds.has(item.submissionId)).slice(0, admission.maxNewPromotions)
  const queue = {
    modelVersion: 'enrichment-promotion-queue-v1', generatedAt: new Date().toISOString(), admission,
    eligibleTotal: eligibleIds.size, selectedCount: selected.length,
    selected: selected.map(item => ({ submissionId: item.submissionId, route: item.route, sourceId: item.sourceId, workpackId: item.workpackId, entityType: item.entityType, entitySlug: item.entitySlug, surfaceId: item.surfaceId, claimType: item.claimType, topicType: item.topicType })),
  }
  writeJson(PROMOTION_QUEUE, queue)
  console.log(JSON.stringify(queue, null, 2))
} else if (command === 'repair-orphans') {
  const queue = buildOrphanQueue()
  writeJson(ORPHAN_QUEUE, { modelVersion: 'enrichment-orphan-repair-queue-v1', generatedAt: new Date().toISOString(), count: queue.length, queue })
  console.log(`orphan repairs queued: ${queue.length}`)
  console.log(`queue: ${path.relative(ROOT, ORPHAN_QUEUE)}`)
} else if (command === 'admission') {
  const queuedRuns = Number(process.env.ENRICHMENT_QUEUED_RUNS ?? 0)
  const inProgressRuns = Number(process.env.ENRICHMENT_IN_PROGRESS_RUNS ?? 0)
  const openEnrichmentPrs = Number(process.env.ENRICHMENT_OPEN_PRS ?? 0)
  console.log(JSON.stringify(admissionDecision({ queuedRuns, inProgressRuns, openEnrichmentPrs }), null, 2))
} else if (command === 'schedule') {
  const input = readJson(process.argv[3] ? path.resolve(process.argv[3]) : '', [])
  const shard = Number(process.argv[4] ?? 0)
  const ownerResolver = createCanonicalOwnerResolver({ root: ROOT })
  console.log(JSON.stringify(scheduleShard(input, shard, manifest.shardCount ?? 8, shardOf, ownerResolver.resolveWorkpack), null, 2))
} else if (command === 'orphans') {
  const input = readJson(process.argv[3] ? path.resolve(process.argv[3]) : '', [])
  const ranked = input.map(item => ({ ...item, roi: scoreOrphan(item) })).sort((a,b) => b.roi.score - a.roi.score || String(a.sourceId ?? '').localeCompare(String(b.sourceId ?? '')))
  console.log(JSON.stringify(ranked, null, 2))
} else {
  console.error('Usage: control-plane-cli.mjs [report|validate|rollup|repair-orphans|admission|schedule <json> <shard>|orphans <json>]')
  process.exitCode = 2
}
