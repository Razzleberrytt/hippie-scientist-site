import fs from 'node:fs'
import path from 'node:path'

type ItemType = 'herb_page' | 'compound_page' | 'collection_page' | 'comparison_page' | 'discovery_surface' | 'recommendation_surface'

type RetryAttempt = {
  pass: string
  relaxedConstraints: string[]
  matchedCandidateIds: string[]
  unresolvedRequiredFields: string[]
}

type IntakeTask = {
  intakeTaskId: string
  itemType: ItemType
  entitySlug: string | null
  surfaceId: string | null
  relatedWorkpackIds: string[]
  topicType: string
  sourceGapType: string
  safetyCritical: boolean
  publishBlocking: boolean
  requiredGovernanceChecksBeforeRegistryEntry: string[]
  minimumAcceptanceCriteria: string[]
  completion: {
    completionPercent: number
    missingRequiredFields: string[]
    criticalMissingFields: string[]
  }
  adaptiveRetryAttempts: RetryAttempt[]
  unresolvedAfterRetries: string[]
}

type IntakeReport = {
  generatedAt: string
  deterministicModelVersion: string
  tasks: IntakeTask[]
}

type CandidateAssessment = {
  candidateSourceId: string
  intakeTaskId: string
  outcomeCategory: string
  promotionBlockedReasons: string[]
  metadataIssues: string[]
  duplicateMatches: Array<{ sourceId: string; matchType: string }>
  wrongClassForGap: boolean
}

type CandidateReviewReport = {
  generatedAt: string
  assessments: CandidateAssessment[]
}

type Workpack = {
  workpackId: string
  itemType: ItemType
  entitySlug: string | null
  surfaceId: string | null
  reviewCycleState: string
  blockedReasons: string[]
}

type WorkpackReport = {
  generatedAt: string
  workpacks: Workpack[]
}

type WaveProposal = {
  proposalId: string
  entityType: string
  entitySlug: string
  rawPriorityScore: number
  priorityBucket: string
  rawRank: number
  scoringInputs?: {
    manualReviewNeeded?: boolean
    retryExhausted?: boolean
    blockerSeverity?: number
  }
}

type WaveProposalReport = {
  generatedAt: string
  proposals: WaveProposal[]
}

type PacketBucket =
  | 'metadata decision needed'
  | 'source class decision needed'
  | 'safety-critical review needed'
  | 'evidence framing decision needed'
  | 'manual source search needed'
  | 'governance override not allowed / must remain blocked'

type HumanDecisionType =
  | 'confirm_source_class_alignment'
  | 'supply_missing_metadata'
  | 'perform_manual_source_search'
  | 'adjudicate_evidence_framing'
  | 'safety_risk_adjudication'
  | 'accept_governance_block_and_replan'

type Criticality = {
  safety: 'critical' | 'non_critical'
  evidence: 'critical' | 'non_critical'
  mechanism: 'critical' | 'non_critical'
}

type FailureBundle = {
  duplicateFailuresEncountered: string[]
  metadataFailuresEncountered: string[]
  governanceFailuresEncountered: string[]
}

type ManualReviewPacket = {
  packetId: string
  packetBucket: PacketBucket
  bucketTags: PacketBucket[]
  itemType: ItemType
  intakeTaskId: string
  entitySlug: string | null
  workpackId: string | null
  missingRequiredFields: string[]
  criticalMissingFields: string[]
  retryStagesAttempted: string[]
  relaxationsApplied: string[]
  failuresEncountered: FailureBundle
  currentCompletionPercent: number
  whyAutomatedProgressStopped: string[]
  recommendedHumanDecisionTypes: HumanDecisionType[]
  safetyEvidenceMechanismCriticality: Criticality
  nextHumanAction: string
  priorityScore: number
  priorityTier: 'highest' | 'high' | 'medium'
}

type ManualReviewPacketReport = {
  generatedAt: string
  deterministicModelVersion: string
  sources: Record<string, string>
  packetDimensions: string[]
  summary: {
    totalPackets: number
    byBucket: Record<PacketBucket, number>
    topStopReasons: Array<{ reason: string; count: number }>
    highestPriorityPackets: Array<{ packetId: string; packetBucket: PacketBucket; priorityScore: number; nextHumanAction: string }>
  }
  buckets: Record<PacketBucket, ManualReviewPacket[]>
  packets: ManualReviewPacket[]
}

const ROOT = process.cwd()
const INPUTS = {
  intakeQueue: path.join(ROOT, 'ops', 'reports', 'source-intake-queue.json'),
  candidateReview: path.join(ROOT, 'ops', 'reports', 'source-candidate-review.json'),
  completionScorecards: path.join(ROOT, 'ops', 'reports', 'completion-scorecards.json'),
  enrichmentWorkpacks: path.join(ROOT, 'ops', 'reports', 'enrichment-workpacks.json'),
  waveTargetProposals: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-target-proposals.json'),
}
const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'manual-review-packets.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'manual-review-packets.md')

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function readOptionalJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null
  return readJson<T>(filePath)
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b))
}

function asEntityType(itemType: ItemType): string {
  if (itemType === 'herb_page') return 'herb'
  if (itemType === 'compound_page') return 'compound'
  return 'surface'
}

function buildPacketBucket(args: {
  governanceFailures: string[]
  metadataFailures: string[]
  sourceClassIssue: boolean
  sourceSearchNeeded: boolean
  evidenceFramingNeeded: boolean
  safetyCritical: boolean
}): { primary: PacketBucket; tags: PacketBucket[] } {
  const tags: PacketBucket[] = []
  if (args.governanceFailures.length > 0) tags.push('governance override not allowed / must remain blocked')
  if (args.safetyCritical) tags.push('safety-critical review needed')
  if (args.sourceClassIssue) tags.push('source class decision needed')
  if (args.metadataFailures.length > 0) tags.push('metadata decision needed')
  if (args.evidenceFramingNeeded) tags.push('evidence framing decision needed')
  if (args.sourceSearchNeeded) tags.push('manual source search needed')

  const primary =
    tags.find(tag => tag === 'governance override not allowed / must remain blocked') ||
    tags.find(tag => tag === 'safety-critical review needed') ||
    tags.find(tag => tag === 'source class decision needed') ||
    tags.find(tag => tag === 'metadata decision needed') ||
    tags.find(tag => tag === 'evidence framing decision needed') ||
    tags.find(tag => tag === 'manual source search needed') ||
    'manual source search needed'

  return { primary, tags: dedupe(tags) as PacketBucket[] }
}

function run() {
  const intake = readJson<IntakeReport>(INPUTS.intakeQueue)
  const candidateReview = readOptionalJson<CandidateReviewReport>(INPUTS.candidateReview)
  const workpacks = readOptionalJson<WorkpackReport>(INPUTS.enrichmentWorkpacks)
  const waveProposals = readOptionalJson<WaveProposalReport>(INPUTS.waveTargetProposals)

  const assessmentsByTask = new Map<string, CandidateAssessment[]>()
  for (const assessment of candidateReview?.assessments || []) {
    const rows = assessmentsByTask.get(assessment.intakeTaskId) || []
    rows.push(assessment)
    assessmentsByTask.set(assessment.intakeTaskId, rows)
  }

  const workpackById = new Map((workpacks?.workpacks || []).map(workpack => [workpack.workpackId, workpack]))
  const proposalByEntity = new Map((waveProposals?.proposals || []).map(proposal => [`${proposal.entityType}:${proposal.entitySlug}`, proposal]))

  const packets: ManualReviewPacket[] = []
  for (const task of intake.tasks) {
    if (!task.unresolvedAfterRetries || task.unresolvedAfterRetries.length === 0) continue

    const taskAssessments = assessmentsByTask.get(task.intakeTaskId) || []
    const matchedCandidateIds = dedupe(task.adaptiveRetryAttempts.flatMap(attempt => attempt.matchedCandidateIds || []))

    const metadataFailures = dedupe([
      ...task.unresolvedAfterRetries.filter(field => field.includes('title') || field.includes('primary_identifier') || field.includes('source_candidate.')),
      ...taskAssessments.flatMap(assessment => assessment.metadataIssues || []),
      ...task.completion.criticalMissingFields,
    ])
    const governanceFailures = dedupe([
      ...taskAssessments.flatMap(assessment => assessment.promotionBlockedReasons || []),
      ...taskAssessments.filter(assessment => assessment.wrongClassForGap).map(() => 'wrong_source_class_for_intended_gap'),
      ...task.relatedWorkpackIds.flatMap(id => workpackById.get(id)?.blockedReasons || []),
    ])
    const duplicateFailures = dedupe(
      taskAssessments.flatMap(assessment =>
        (assessment.duplicateMatches || []).map(match => `duplicate_match:${match.sourceId}:${match.matchType}`),
      ),
    )

    const sourceClassIssue =
      task.unresolvedAfterRetries.some(field => field.includes('sourceClass')) ||
      taskAssessments.some(assessment => assessment.wrongClassForGap || assessment.outcomeCategory === 'wrong_source_class_for_intended_gap')

    const sourceSearchNeeded = matchedCandidateIds.length === 0
    const evidenceFramingNeeded =
      task.topicType === 'evidence' || task.sourceGapType === 'traditional_or_preclinical_only' || task.sourceGapType === 'missing_modern_human_evidence'

    const retryStagesAttempted = dedupe(task.adaptiveRetryAttempts.map(attempt => attempt.pass))
    const relaxationsApplied = dedupe(task.adaptiveRetryAttempts.flatMap(attempt => attempt.relaxedConstraints || []))
    const unresolvedTrail = dedupe(task.adaptiveRetryAttempts.flatMap(attempt => attempt.unresolvedRequiredFields || []))

    const stopReasons = dedupe([
      ...task.unresolvedAfterRetries,
      ...unresolvedTrail,
      ...(sourceSearchNeeded ? ['no_candidates_matched_after_all_retry_stages'] : []),
      ...(governanceFailures.length > 0 ? ['governance_checks_prevent_auto_promotion'] : []),
      ...(metadataFailures.length > 0 ? ['required_metadata_still_missing_after_retries'] : []),
      ...(duplicateFailures.length > 0 ? ['duplicate_conflicts_prevent_auto_promotion'] : []),
    ])

    const decisionTypes: HumanDecisionType[] = []
    if (sourceClassIssue) decisionTypes.push('confirm_source_class_alignment')
    if (metadataFailures.length > 0) decisionTypes.push('supply_missing_metadata')
    if (sourceSearchNeeded) decisionTypes.push('perform_manual_source_search')
    if (evidenceFramingNeeded) decisionTypes.push('adjudicate_evidence_framing')
    if (task.safetyCritical || task.topicType === 'safety') decisionTypes.push('safety_risk_adjudication')
    if (governanceFailures.length > 0) decisionTypes.push('accept_governance_block_and_replan')

    const bucket = buildPacketBucket({
      governanceFailures,
      metadataFailures,
      sourceClassIssue,
      sourceSearchNeeded,
      evidenceFramingNeeded,
      safetyCritical: task.safetyCritical || task.topicType === 'safety',
    })

    const entityKey = `${asEntityType(task.itemType)}:${task.entitySlug || ''}`
    const proposal = proposalByEntity.get(entityKey)

    const priorityScore =
      (task.safetyCritical ? 100 : 0) +
      (task.publishBlocking ? 75 : 0) +
      (task.completion.criticalMissingFields.length * 15) +
      (task.unresolvedAfterRetries.includes('manual_review_required') ? 20 : 0) +
      Math.round((proposal?.rawPriorityScore || 0) / 10)

    const priorityTier: ManualReviewPacket['priorityTier'] = priorityScore >= 170 ? 'highest' : priorityScore >= 100 ? 'high' : 'medium'

    const packet: ManualReviewPacket = {
      packetId: `mrp_${task.intakeTaskId}`,
      packetBucket: bucket.primary,
      bucketTags: bucket.tags,
      itemType: task.itemType,
      intakeTaskId: task.intakeTaskId,
      entitySlug: task.entitySlug || task.surfaceId,
      workpackId: task.relatedWorkpackIds[0] || null,
      missingRequiredFields: dedupe([...task.completion.missingRequiredFields, ...task.unresolvedAfterRetries]),
      criticalMissingFields: dedupe(task.completion.criticalMissingFields),
      retryStagesAttempted,
      relaxationsApplied,
      failuresEncountered: {
        duplicateFailuresEncountered: duplicateFailures,
        metadataFailuresEncountered: metadataFailures,
        governanceFailuresEncountered: governanceFailures,
      },
      currentCompletionPercent: task.completion.completionPercent,
      whyAutomatedProgressStopped: stopReasons,
      recommendedHumanDecisionTypes: dedupe(decisionTypes) as HumanDecisionType[],
      safetyEvidenceMechanismCriticality: {
        safety: task.safetyCritical || task.topicType === 'safety' ? 'critical' : 'non_critical',
        evidence: task.topicType === 'evidence' ? 'critical' : 'non_critical',
        mechanism: task.topicType === 'mechanism' || task.topicType === 'constituent' ? 'critical' : 'non_critical',
      },
      nextHumanAction:
        bucket.primary === 'governance override not allowed / must remain blocked'
          ? 'Document governance blocker, keep item blocked, and request reviewer-led replan.'
          : bucket.primary === 'safety-critical review needed'
            ? 'Perform reviewer safety adjudication and decide if additional high-authority sources are required before promotion.'
            : bucket.primary === 'source class decision needed'
              ? 'Confirm or revise source-class strategy, then re-run intake with reviewer-approved class constraints.'
              : bucket.primary === 'metadata decision needed'
                ? 'Fill missing citation/identifier metadata and resubmit candidate for registry review.'
                : bucket.primary === 'evidence framing decision needed'
                  ? 'Set evidence framing and claim boundaries, then update workpack acceptance criteria.'
                  : 'Run targeted manual source search using recommended organizations and submit new candidates.',
      priorityScore,
      priorityTier,
    }

    packets.push(packet)
  }

  const sortedPackets = [...packets].sort(
    (a, b) =>
      b.priorityScore - a.priorityScore ||
      a.packetBucket.localeCompare(b.packetBucket) ||
      a.packetId.localeCompare(b.packetId),
  )

  const bucketOrder: PacketBucket[] = [
    'metadata decision needed',
    'source class decision needed',
    'safety-critical review needed',
    'evidence framing decision needed',
    'manual source search needed',
    'governance override not allowed / must remain blocked',
  ]

  const byBucket = Object.fromEntries(bucketOrder.map(bucket => [bucket, 0])) as Record<PacketBucket, number>
  for (const packet of sortedPackets) byBucket[packet.packetBucket] += 1

  const reasonCounts = new Map<string, number>()
  for (const packet of sortedPackets) {
    for (const reason of packet.whyAutomatedProgressStopped) {
      reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1)
    }
  }
  const topStopReasons = Array.from(reasonCounts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason))
    .slice(0, 10)

  const report: ManualReviewPacketReport = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'manual-review-packets-v1',
    sources: Object.fromEntries(Object.entries(INPUTS).map(([key, value]) => [key, path.relative(ROOT, value)])),
    packetDimensions: [
      'packetId',
      'itemType',
      'entitySlug|workpackId',
      'missingRequiredFields[]',
      'criticalMissingFields[]',
      'retryStagesAttempted[]',
      'relaxationsApplied[]',
      'failuresEncountered.duplicate|metadata|governance[]',
      'currentCompletionPercent',
      'whyAutomatedProgressStopped[]',
      'recommendedHumanDecisionTypes[]',
      'safetyEvidenceMechanismCriticality',
      'nextHumanAction',
      'priorityScore|priorityTier',
      'packetBucket|bucketTags[]',
    ],
    summary: {
      totalPackets: sortedPackets.length,
      byBucket,
      topStopReasons,
      highestPriorityPackets: sortedPackets.slice(0, 12).map(packet => ({
        packetId: packet.packetId,
        packetBucket: packet.packetBucket,
        priorityScore: packet.priorityScore,
        nextHumanAction: packet.nextHumanAction,
      })),
    },
    buckets: Object.fromEntries(bucketOrder.map(bucket => [bucket, sortedPackets.filter(packet => packet.packetBucket === bucket)])) as Record<
      PacketBucket,
      ManualReviewPacket[]
    >,
    packets: sortedPackets,
  }

  const lines: string[] = [
    '# Manual Review Packets for Unresolved Adaptive Retry Failures',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Summary',
    `- Packets created: ${report.summary.totalPackets}`,
    `- Highest priority tier count: ${report.packets.filter(packet => packet.priorityTier === 'highest').length}`,
    '',
    '## Bucket counts',
    '| bucket | packets |',
    '| --- | ---: |',
  ]

  for (const bucket of bucketOrder) {
    lines.push(`| ${bucket} | ${report.summary.byBucket[bucket]} |`)
  }

  lines.push('', '## Most common automated-stop reasons', '| reason | count |', '| --- | ---: |')
  for (const reason of report.summary.topStopReasons) {
    lines.push(`| ${reason.reason} | ${reason.count} |`)
  }

  lines.push('', '## Highest-priority packets', '| packetId | bucket | priorityScore | next human action |', '| --- | --- | ---: | --- |')
  for (const packet of report.summary.highestPriorityPackets.slice(0, 10)) {
    lines.push(`| ${packet.packetId} | ${packet.packetBucket} | ${packet.priorityScore} | ${packet.nextHumanAction} |`)
  }

  lines.push('', '## Contractor action checklist', '- Read packet `whyAutomatedProgressStopped` before taking action.', '- Perform only the listed `recommendedHumanDecisionTypes` for each packet.', '- Keep governance-blocked packets blocked unless a reviewer explicitly changes policy state.')

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(OUTPUT_MD, `${lines.join('\n')}\n`, 'utf8')

  console.log(`Wrote ${path.relative(ROOT, OUTPUT_JSON)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_MD)}`)
}

run()
