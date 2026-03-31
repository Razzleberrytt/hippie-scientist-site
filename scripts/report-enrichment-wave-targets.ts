import fs from 'node:fs'
import path from 'node:path'

type EntityType = 'herb' | 'compound'

type Workpack = {
  itemType: 'herb_page' | 'compound_page' | string
  entitySlug: string | null
  publicStatus: string
  enrichmentHealthState: string
  reviewCycleState: string
  operationalBucket: string
  recommendedAction: string
  missingTopics: string[]
  staleTopics: string[]
  blockedReasons: string[]
  publicPriorityScore: number
  notesForContractor: string
}

type SourceGapItem = {
  itemType: string
  entitySlug: string | null
  topicType: string
  sourceGapType: string
  safetyCritical: boolean
  publishBlocking: boolean
  relatedWorkpackIds: string[]
  bucket: string
}

type IntakeTask = {
  itemType: string
  entitySlug: string | null
  topicType: string
  acquisitionTier: string
  safetyCritical: boolean
  publishBlocking: boolean
  duplicateRiskNotes?: string
}

type PriorWaveTarget = { entityType: EntityType; entitySlug: string }

type WaveBlocker = {
  entityType: EntityType
  entitySlug: string
  blockerClasses: string[]
  endedAtDeltaZeroWhy?: string
}

type SourceReviewDecision = {
  entityKeys?: string[]
  reviewStatus: string
  outcomeCategory: string
}

type RollupCriticalGap = {
  entityType: EntityType
  entitySlug: string
  unresolvedCriticalTopics: string[]
}

type Proposal = {
  proposalId: string
  waveSuggestionId: string
  entityType: EntityType
  entitySlug: string
  publicStatus: string
  currentGovernedCoverageState: string
  priorityScore: number
  priorityBucket: 'critical' | 'high' | 'medium' | 'low'
  carryoverFromWaveIds: string[]
  criticalGapTypes: string[]
  missingTopics: string[]
  stale: boolean
  blockerSignals: string[]
  surfaceDependencySignals: string[]
  promotableSourceLikelihood: 'high' | 'medium' | 'low' | 'unknown'
  recommendedWaveAction: string
  whySelected: string
  excludedReason: string | null
  reviewerOverrideAllowed: boolean
  notes: string[]
}

const ROOT = process.cwd()

const INPUTS = {
  workpacks: path.join(ROOT, 'ops', 'reports', 'enrichment-workpacks.json'),
  sourceGaps: path.join(ROOT, 'ops', 'reports', 'source-gaps.json'),
  sourceIntake: path.join(ROOT, 'ops', 'reports', 'source-intake-queue.json'),
  wave2Review: path.join(ROOT, 'ops', 'reports', 'source-wave-2-review.json'),
  wave2Blockers: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-2-blockers.json'),
  wave2Rollup: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-2-rollup.json'),
  wave1Targets: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-1-targets.json'),
  wave2Targets: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-2-targets.json'),
  wave2bTargets: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-2b-targets.json'),
  publicationManifest: path.join(ROOT, 'public', 'data', 'publication-manifest.json'),
}

const OUTPUTS = {
  proposalJson: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-target-proposals.json'),
  proposalMd: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-target-proposals.md'),
  targetsNext: path.join(ROOT, 'ops', 'targets', 'enrichment-wave-next.json'),
  targetsCarryover: path.join(ROOT, 'ops', 'targets', 'enrichment-wave-carryover.json'),
  targetsSafety: path.join(ROOT, 'ops', 'targets', 'enrichment-wave-safety.json'),
  targetsMechanism: path.join(ROOT, 'ops', 'targets', 'enrichment-wave-mechanism.json'),
}

const MODEL_VERSION = 'enrichment-wave-target-proposals-v1'
const RECOMMENDED_TARGET_SIZE = 8

function normalizeSlug(value: string | null | undefined) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function entityKey(entityType: EntityType, entitySlug: string) {
  return `${entityType}:${normalizeSlug(entitySlug)}`
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function waveTargetsFrom(payload: { targets?: PriorWaveTarget[]; entities?: PriorWaveTarget[] }): PriorWaveTarget[] {
  if (Array.isArray(payload.targets)) return payload.targets
  if (Array.isArray(payload.entities)) return payload.entities
  return []
}

function ensureExists(filePath: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required proposal input is missing: ${path.relative(ROOT, filePath)}`)
  }
}

function writeJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function priorityBucket(score: number): Proposal['priorityBucket'] {
  if (score >= 140) return 'critical'
  if (score >= 105) return 'high'
  if (score >= 70) return 'medium'
  return 'low'
}

function classifyPromotableLikelihood(args: { promoted: number; duplicate: number; total: number }): Proposal['promotableSourceLikelihood'] {
  if (args.total === 0) return 'unknown'
  if (args.promoted > 0 && args.duplicate === 0) return 'high'
  if (args.promoted > 0) return 'medium'
  if (args.duplicate > 0) return 'low'
  return 'unknown'
}

function topicToCriticalGapType(topic: string): string | null {
  if (topic === 'safety') return 'safety-critical'
  if (topic === 'evidence') return 'evidence-critical'
  if (topic === 'mechanism') return 'mechanism-critical'
  return null
}

function run() {
  Object.values(INPUTS).forEach(ensureExists)

  const workpacks = readJson<{ workpacks: Workpack[] }>(INPUTS.workpacks)
  const sourceGaps = readJson<{ gapItems: SourceGapItem[] }>(INPUTS.sourceGaps)
  const sourceIntake = readJson<{ tasks: IntakeTask[] }>(INPUTS.sourceIntake)
  const wave2Review = readJson<{ candidateDecisions: SourceReviewDecision[] }>(INPUTS.wave2Review)
  const wave2Blockers = readJson<{ blockersByTarget: WaveBlocker[] }>(INPUTS.wave2Blockers)
  const wave2Rollup = readJson<{ unresolvedCriticalGaps: RollupCriticalGap[] }>(INPUTS.wave2Rollup)
  const wave1Targets = waveTargetsFrom(readJson<{ targets?: PriorWaveTarget[]; entities?: PriorWaveTarget[] }>(INPUTS.wave1Targets))
  const wave2Targets = waveTargetsFrom(readJson<{ targets?: PriorWaveTarget[]; entities?: PriorWaveTarget[] }>(INPUTS.wave2Targets))
  const wave2bTargets = waveTargetsFrom(readJson<{ targets?: PriorWaveTarget[]; entities?: PriorWaveTarget[] }>(INPUTS.wave2bTargets))
  const publicationManifest = readJson<{
    entities?: { herbs?: Array<{ slug: string }>; compounds?: Array<{ slug: string }> }
  }>(INPUTS.publicationManifest)

  const indexableKeys = new Set<string>([
    ...(publicationManifest.entities?.herbs || []).map(row => entityKey('herb', row.slug)),
    ...(publicationManifest.entities?.compounds || []).map(row => entityKey('compound', row.slug)),
  ])

  const carryoverByEntity = new Map<string, string[]>()
  for (const [waveId, payload] of [
    ['wave-1', wave1Targets],
    ['wave-2', wave2Targets],
    ['wave-2b', wave2bTargets],
  ] as const) {
    for (const target of payload) {
      const key = entityKey(target.entityType, target.entitySlug)
      const bucket = carryoverByEntity.get(key) || []
      bucket.push(waveId)
      carryoverByEntity.set(key, bucket)
    }
  }

  const sourceGapsByEntity = new Map<string, SourceGapItem[]>()
  for (const item of sourceGaps.gapItems) {
    if (!item.entitySlug) continue
    const entityType: EntityType = item.itemType === 'compound_page' ? 'compound' : 'herb'
    const key = entityKey(entityType, item.entitySlug)
    const bucket = sourceGapsByEntity.get(key) || []
    bucket.push(item)
    sourceGapsByEntity.set(key, bucket)
  }

  const intakeByEntity = new Map<string, IntakeTask[]>()
  for (const task of sourceIntake.tasks) {
    if (!task.entitySlug) continue
    const entityType: EntityType = task.itemType === 'compound_page' ? 'compound' : 'herb'
    const key = entityKey(entityType, task.entitySlug)
    const bucket = intakeByEntity.get(key) || []
    bucket.push(task)
    intakeByEntity.set(key, bucket)
  }

  const blockersByEntity = new Map<string, WaveBlocker>()
  for (const blocker of wave2Blockers.blockersByTarget) {
    blockersByEntity.set(entityKey(blocker.entityType, blocker.entitySlug), blocker)
  }

  const rollupByEntity = new Map<string, RollupCriticalGap>()
  for (const gap of wave2Rollup.unresolvedCriticalGaps || []) {
    rollupByEntity.set(entityKey(gap.entityType, gap.entitySlug), gap)
  }

  const reviewStatsByEntity = new Map<string, { promoted: number; duplicate: number; total: number }>()
  for (const decision of wave2Review.candidateDecisions) {
    const keys = Array.isArray(decision.entityKeys) ? decision.entityKeys : []
    for (const key of keys) {
      const bucket = reviewStatsByEntity.get(key) || { promoted: 0, duplicate: 0, total: 0 }
      bucket.total += 1
      if (decision.reviewStatus === 'approved_and_promoted') bucket.promoted += 1
      if (decision.outcomeCategory === 'duplicate_of_existing') bucket.duplicate += 1
      reviewStatsByEntity.set(key, bucket)
    }
  }

  const candidateWorkpacks = workpacks.workpacks.filter(
    row => (row.itemType === 'herb_page' || row.itemType === 'compound_page') && row.entitySlug,
  )

  const proposals: Proposal[] = candidateWorkpacks.map(row => {
    const entityType: EntityType = row.itemType === 'compound_page' ? 'compound' : 'herb'
    const entitySlug = normalizeSlug(row.entitySlug)
    const key = entityKey(entityType, entitySlug)

    const missingTopics = Array.from(new Set(row.missingTopics || [])).sort()
    const gapItems = sourceGapsByEntity.get(key) || []
    const intakeTasks = intakeByEntity.get(key) || []
    const unresolvedRollup = rollupByEntity.get(key)
    const unresolvedTopics = Array.from(
      new Set([...(unresolvedRollup?.unresolvedCriticalTopics || []), ...missingTopics]),
    )

    const criticalGapTypes = Array.from(
      new Set(unresolvedTopics.map(topicToCriticalGapType).filter((value): value is string => Boolean(value))),
    ).sort()

    const carryoverFromWaveIds = (carryoverByEntity.get(key) || []).sort()
    const priorBlocker = blockersByEntity.get(key)
    const reviewStats = reviewStatsByEntity.get(key) || { promoted: 0, duplicate: 0, total: 0 }
    const stale = (row.staleTopics || []).length > 0 || /review_due|blocked_pending_review|depublish_or_hide/.test(row.reviewCycleState)

    const blockerSignals = Array.from(
      new Set([
        ...(row.blockedReasons || []),
        ...(priorBlocker?.blockerClasses || []),
        priorBlocker?.endedAtDeltaZeroWhy || '',
      ].filter(Boolean)),
    )

    const surfaceDependencySignals = Array.from(
      new Set([
        row.publicStatus.startsWith('indexable') ? 'indexable-public-surface' : 'non-indexable-surface',
        gapItems.some(item => item.publishBlocking) ? 'publish-blocking-surface-impact' : '',
        indexableKeys.has(key) ? 'publication-manifest-indexable' : '',
      ].filter(Boolean)),
    )

    let score = 0
    if (row.publicStatus === 'indexable') score += 55
    else if (row.publicStatus.includes('indexable')) score += 40
    else score += 12

    score += Math.min(50, Math.round((row.publicPriorityScore || 0) * 0.45))
    score += Math.min(24, carryoverFromWaveIds.length * 8)

    if (unresolvedTopics.includes('safety')) score += 28
    if (unresolvedTopics.includes('evidence')) score += 20
    if (unresolvedTopics.includes('mechanism')) score += 18
    if (unresolvedTopics.includes('constituent')) score += 8

    if (stale) score += 12
    if (row.operationalBucket === 'governance_fix') score += 18
    if (gapItems.some(item => item.publishBlocking)) score += 14
    if (gapItems.some(item => item.safetyCritical)) score += 16
    if (intakeTasks.some(task => task.acquisitionTier === 'must_have_publish_blocking')) score += 10
    if (blockerSignals.length > 0) score += Math.min(18, blockerSignals.length * 3)

    const promotableSourceLikelihood = classifyPromotableLikelihood(reviewStats)
    if (promotableSourceLikelihood === 'high') score += 8
    if (promotableSourceLikelihood === 'medium') score += 4

    const waveSuggestionId = carryoverFromWaveIds.length ? 'carryover-rescue' : 'new-entity-priority'
    const prioritizedTopics = ['safety', 'evidence', 'mechanism', 'constituent'].filter(topic => unresolvedTopics.includes(topic))

    return {
      proposalId: `proposal_${entityType}_${entitySlug}`,
      waveSuggestionId,
      entityType,
      entitySlug,
      publicStatus: row.publicStatus,
      currentGovernedCoverageState: row.enrichmentHealthState,
      priorityScore: Number(score.toFixed(2)),
      priorityBucket: priorityBucket(score),
      carryoverFromWaveIds,
      criticalGapTypes,
      missingTopics,
      stale,
      blockerSignals,
      surfaceDependencySignals,
      promotableSourceLikelihood,
      recommendedWaveAction: row.recommendedAction,
      whySelected: [
        `${row.publicStatus} entity with priority score ${row.publicPriorityScore}.`,
        prioritizedTopics.length
          ? `Critical gaps: ${prioritizedTopics.join(', ')}.`
          : 'No critical safety/evidence/mechanism gaps currently open.',
        carryoverFromWaveIds.length ? `Carryover from ${carryoverFromWaveIds.join(', ')}.` : 'Not present in prior wave target files.',
      ].join(' '),
      excludedReason: null,
      reviewerOverrideAllowed: true,
      notes: [
        `workpack bucket=${row.operationalBucket}`,
        `reviewCycleState=${row.reviewCycleState}`,
        `promotableSourceLikelihood=${promotableSourceLikelihood}`,
        `sourceGapCount=${gapItems.length}`,
        `intakeTaskCount=${intakeTasks.length}`,
      ],
    }
  })

  proposals.sort((a, b) => b.priorityScore - a.priorityScore || a.entityType.localeCompare(b.entityType) || a.entitySlug.localeCompare(b.entitySlug))

  const recommended = proposals.slice(0, RECOMMENDED_TARGET_SIZE)
  const carryoverOnly = proposals.filter(row => row.carryoverFromWaveIds.length > 0).slice(0, RECOMMENDED_TARGET_SIZE)
  const safetyPriority = proposals.filter(row => row.criticalGapTypes.includes('safety-critical')).slice(0, RECOMMENDED_TARGET_SIZE)
  const mechanismPriority = proposals.filter(row => row.criticalGapTypes.includes('mechanism-critical')).slice(0, RECOMMENDED_TARGET_SIZE)
  const newEntityOnly = proposals.filter(row => row.carryoverFromWaveIds.length === 0).slice(0, RECOMMENDED_TARGET_SIZE)

  const selectionSets = {
    recommended: new Set(recommended.map(row => row.proposalId)),
    carryover: new Set(carryoverOnly.map(row => row.proposalId)),
    safety: new Set(safetyPriority.map(row => row.proposalId)),
    mechanism: new Set(mechanismPriority.map(row => row.proposalId)),
    newEntityOnly: new Set(newEntityOnly.map(row => row.proposalId)),
  }

  for (const proposal of proposals) {
    if (!selectionSets.recommended.has(proposal.proposalId)) {
      proposal.excludedReason = 'Not in top compact recommended set after deterministic rank ordering.'
    }
  }

  const generatedAt = new Date().toISOString()
  const scoringRules = {
    deterministicModelVersion: MODEL_VERSION,
    recommendedTargetSize: RECOMMENDED_TARGET_SIZE,
    scoreWeights: {
      publicStatus: { indexable: 55, otherIndexable: 40, nonIndexable: 12 },
      publicPriorityScoreScaled: 'min(50, round(publicPriorityScore * 0.45))',
      carryoverBoost: '8 points per prior wave target inclusion, max 24',
      criticalGapBoost: { safety: 28, evidence: 20, mechanism: 18, constituent: 8 },
      staleOrReviewDue: 12,
      governanceFixBucket: 18,
      publishBlockingGap: 14,
      safetyCriticalGap: 16,
      blockerSignals: '3 points per signal, max 18',
      promotableSourceLikelihood: { high: 8, medium: 4, low_or_unknown: 0 },
    },
    compactSelectionPolicy: {
      recommended: `top ${RECOMMENDED_TARGET_SIZE} by priorityScore`,
      carryover: `top ${RECOMMENDED_TARGET_SIZE} with carryoverFromWaveIds.length > 0`,
      safety: `top ${RECOMMENDED_TARGET_SIZE} with safety-critical gaps`,
      mechanism: `top ${RECOMMENDED_TARGET_SIZE} with mechanism-critical gaps`,
      newEntityOnly: `top ${RECOMMENDED_TARGET_SIZE} with no prior wave carryover`,
    },
  }

  const payload = {
    generatedAt,
    deterministicModelVersion: MODEL_VERSION,
    inputsUsed: Object.values(INPUTS).map(filePath => path.relative(ROOT, filePath)),
    selectionRules: scoringRules,
    summary: {
      totalCandidates: proposals.length,
      recommendedCount: recommended.length,
      carryoverCount: carryoverOnly.length,
      safetyPriorityCount: safetyPriority.length,
      mechanismPriorityCount: mechanismPriority.length,
      newEntityOnlyCount: newEntityOnly.length,
    },
    proposals,
    recommendationSets: {
      recommended: recommended.map(row => row.proposalId),
      carryover: carryoverOnly.map(row => row.proposalId),
      safety: safetyPriority.map(row => row.proposalId),
      mechanism: mechanismPriority.map(row => row.proposalId),
      newEntityOnly: newEntityOnly.map(row => row.proposalId),
    },
  }

  const runnerTargetFrom = (mode: string, selected: Proposal[]) => ({
    generatedAt,
    deterministicModelVersion: MODEL_VERSION,
    selectionPolicy: {
      mode,
      sourceProposalReport: path.relative(ROOT, OUTPUTS.proposalJson),
      notes: 'Deterministic proposal-generated target artifact. Human edits are expected before wave execution.',
    },
    targets: selected.map(row => ({
      entityType: row.entityType,
      entitySlug: row.entitySlug,
      waveStatus: row.carryoverFromWaveIds.length ? 'carryover' : 'new-entity',
      selectionWhy: row.whySelected,
      highestPriorityMissingTopics: row.missingTopics,
      criticality: row.criticalGapTypes,
      currentGovernedCoverageStatus: row.currentGovernedCoverageState,
    })),
  })

  writeJson(OUTPUTS.proposalJson, payload)
  writeJson(OUTPUTS.targetsNext, runnerTargetFrom('next-wave-recommended', recommended))
  writeJson(OUTPUTS.targetsCarryover, runnerTargetFrom('carryover-rescue', carryoverOnly))
  writeJson(OUTPUTS.targetsSafety, runnerTargetFrom('safety-priority', safetyPriority))
  writeJson(OUTPUTS.targetsMechanism, runnerTargetFrom('mechanism-priority', mechanismPriority))

  const mdLines = [
    '# Enrichment Wave Target Proposals',
    '',
    `- Generated at: ${generatedAt}`,
    `- Deterministic model version: ${MODEL_VERSION}`,
    `- Candidates ranked: ${proposals.length}`,
    `- Recommended compact set: ${recommended.length}`,
    '',
    '## Inputs used',
    ...Object.values(INPUTS).map(filePath => `- \`${path.relative(ROOT, filePath)}\``),
    '',
    '## Deterministic scoring rules',
    '- Public/indexable status and workpack public priority are the base score.',
    '- Critical gaps boost score in this order: safety > evidence > mechanism > constituent.',
    '- Stale/review-due states and governance-fix buckets increase score.',
    '- Publish-blocking/safety-critical source gaps and prior blocker signals increase score.',
    '- Prior carryover and promotable-source likelihood adjust score with explicit weights.',
    '',
    '## Recommended next-wave targets',
    '| Rank | Entity | Score | Priority | Gap types | Carryover |',
    '| --- | --- | ---: | --- | --- | --- |',
    ...recommended.map((row, index) => {
      const carryover = row.carryoverFromWaveIds.length ? row.carryoverFromWaveIds.join(', ') : 'new'
      return `| ${index + 1} | ${row.entityType}:${row.entitySlug} | ${row.priorityScore} | ${row.priorityBucket} | ${row.criticalGapTypes.join(', ') || 'none'} | ${carryover} |`
    }),
    '',
    '## Output artifacts',
    `- \`${path.relative(ROOT, OUTPUTS.proposalJson)}\`: full ranked proposal model with explicit excluded reasons.`,
    `- \`${path.relative(ROOT, OUTPUTS.targetsNext)}\`: compact recommended runner-ready target list.`,
    `- \`${path.relative(ROOT, OUTPUTS.targetsCarryover)}\`: carryover rescue wave target list.`,
    `- \`${path.relative(ROOT, OUTPUTS.targetsSafety)}\`: safety-priority runner-ready target list.`,
    `- \`${path.relative(ROOT, OUTPUTS.targetsMechanism)}\`: mechanism-priority runner-ready target list.`,
    '',
    '## Verification notes',
    '- Every selected target appears in the ranked proposal output and in runner target format.',
    '- Excluded items keep explicit excludedReason values in the proposal JSON.',
    '- Stale/review-due and blocker signals are incorporated into the deterministic score components.',
  ]
  fs.mkdirSync(path.dirname(OUTPUTS.proposalMd), { recursive: true })
  fs.writeFileSync(OUTPUTS.proposalMd, `${mdLines.join('\n')}\n`, 'utf8')

  console.log(`Wrote ${path.relative(ROOT, OUTPUTS.proposalJson)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUTS.proposalMd)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUTS.targetsNext)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUTS.targetsCarryover)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUTS.targetsSafety)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUTS.targetsMechanism)}`)
}

run()
