import fs from 'node:fs'
import path from 'node:path'

type EntityType = 'herb' | 'compound'
type PriorityBucket = 'critical' | 'high' | 'medium' | 'low'
type CriticalGapType = 'safety-critical' | 'evidence-critical' | 'mechanism-critical'
type ProposalClass =
  | 'high-value-highly-actionable'
  | 'high-value-but-badly-blocked'
  | 'low-value-but-easy'
  | 'carryover-rescue-candidate'
  | 'manual-review-first-candidate'

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
}

type SourceGapItem = {
  itemType: string
  entitySlug: string | null
  topicType: string
  safetyCritical: boolean
  publishBlocking: boolean
}

type IntakeTask = {
  intakeTaskId: string
  itemType: string
  entitySlug: string | null
  topicType: string
  acquisitionTier: string
  adaptiveRetryAttempts?: Array<{ unresolvedRequiredFields?: string[] }>
  unresolvedAfterRetries?: string[]
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

type CompletionScorecard = {
  itemType: string
  itemId: string
  entitySlug: string | null
  completionPercent: number
  criticalMissingFields: string[]
  blockingCategory: string
  retryAttempts: number
  manualReviewNeeded: boolean
  readyState: string
  blockerDetails: string[]
}

type Proposal = {
  proposalId: string
  waveSuggestionId: string
  entityType: EntityType
  entitySlug: string
  publicStatus: string
  currentGovernedCoverageState: string
  rawPriorityScore: number
  priorityBucket: PriorityBucket
  carryoverFromWaveIds: string[]
  criticalGapTypes: CriticalGapType[]
  missingTopics: string[]
  stale: boolean
  blockerSignals: string[]
  surfaceDependencySignals: string[]
  promotableSourceLikelihood: 'high' | 'medium' | 'low' | 'unknown'
  recommendedWaveAction: string
  whySelected: string
  notes: string[]
  rawRank: number
  scoringInputs: {
    completionPercent: number
    criticalMissingFieldCount: number
    blockerSeverity: number
    retryExhausted: boolean
    manualReviewNeeded: boolean
    readyForNextStage: boolean
  }
  actionable: boolean
  nearCompleteHighValue: boolean
  proposalClass: ProposalClass
}

type BalancingProfile = {
  id: string
  description: string
  targetSize: number
  minByType: Partial<Record<EntityType, number>>
  maxByType: Partial<Record<EntityType, number>>
  weights: {
    completionMultiplier: number
    blockerPenaltyMultiplier: number
    actionabilityBoost: number
    nearCompleteBoost: number
    carryoverRescueBoost: number
    manualReviewPenalty: number
    retryExhaustionPenalty: number
    severeBlockerBoost: number
  }
  severeBlockerVisibilitySlots: number
}

type ProfileDecision = {
  profileId: string
  proposalId: string
  rawRank: number
  rawPriorityScore: number
  completionBlockerAdjustments: {
    completionAdjustment: number
    blockerAdjustment: number
    actionabilityAdjustment: number
    carryoverAdjustment: number
    totalAdjustment: number
    reasons: string[]
  }
  finalPriorityScore: number
  selected: boolean
  selectionOrder: number | null
  selectedBecause: string[]
  exclusionReason: string | null
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
  completionScorecards: path.join(ROOT, 'ops', 'reports', 'completion-scorecards.json'),
}

const OUTPUTS = {
  proposalJson: path.join(ROOT, 'ops', 'reports', 'completion-aware-wave-targets.json'),
  proposalMd: path.join(ROOT, 'ops', 'reports', 'completion-aware-wave-targets.md'),
  legacyProposalJson: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-target-proposals.json'),
  legacyBalancingJson: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-target-balancing.json'),
  profileTargetsDir: path.join(ROOT, 'ops', 'targets'),
}

const MODEL_VERSION = 'completion-aware-wave-targets-v1'
const PROPOSAL_CLASSES: ProposalClass[] = [
  'high-value-highly-actionable',
  'high-value-but-badly-blocked',
  'low-value-but-easy',
  'carryover-rescue-candidate',
  'manual-review-first-candidate',
]

const BALANCING_PROFILES: Record<string, BalancingProfile> = {
  'actionability-priority': {
    id: 'actionability-priority',
    description: 'Favor high-value entities with strong actionability and near-complete momentum.',
    targetSize: 8,
    minByType: { herb: 3, compound: 3 },
    maxByType: { herb: 5, compound: 5 },
    weights: {
      completionMultiplier: 0.48,
      blockerPenaltyMultiplier: 0.35,
      actionabilityBoost: 18,
      nearCompleteBoost: 16,
      carryoverRescueBoost: 6,
      manualReviewPenalty: 14,
      retryExhaustionPenalty: 12,
      severeBlockerBoost: 2,
    },
    severeBlockerVisibilitySlots: 1,
  },
  'blocker-rescue': {
    id: 'blocker-rescue',
    description: 'Escalate high-value entities with severe blockers for manual/governance rescue.',
    targetSize: 8,
    minByType: { herb: 3, compound: 3 },
    maxByType: { herb: 5, compound: 5 },
    weights: {
      completionMultiplier: 0.2,
      blockerPenaltyMultiplier: -0.28,
      actionabilityBoost: 4,
      nearCompleteBoost: 6,
      carryoverRescueBoost: 18,
      manualReviewPenalty: -10,
      retryExhaustionPenalty: -8,
      severeBlockerBoost: 18,
    },
    severeBlockerVisibilitySlots: 4,
  },
  'balanced-completion': {
    id: 'balanced-completion',
    description: 'Blend value and actionability while reserving visibility for severe blockers and carryover rescue.',
    targetSize: 8,
    minByType: { herb: 3, compound: 3 },
    maxByType: { herb: 5, compound: 5 },
    weights: {
      completionMultiplier: 0.34,
      blockerPenaltyMultiplier: 0.15,
      actionabilityBoost: 10,
      nearCompleteBoost: 12,
      carryoverRescueBoost: 10,
      manualReviewPenalty: 4,
      retryExhaustionPenalty: 3,
      severeBlockerBoost: 8,
    },
    severeBlockerVisibilitySlots: 2,
  },
}

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
  if (!fs.existsSync(filePath)) throw new Error(`Required proposal input is missing: ${path.relative(ROOT, filePath)}`)
}

function writeJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function priorityBucket(score: number): PriorityBucket {
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

function topicToCriticalGapType(topic: string): CriticalGapType | null {
  if (topic === 'safety') return 'safety-critical'
  if (topic === 'evidence') return 'evidence-critical'
  if (topic === 'mechanism') return 'mechanism-critical'
  return null
}

function blockerCategoryBase(category: string) {
  if (category === 'blocked_by_safety_critical_missing_fields') return 38
  if (category === 'blocked_by_evidence_critical_missing_fields') return 32
  if (category === 'blocked_by_mechanism_critical_missing_fields') return 28
  if (category === 'blocked_by_governance') return 34
  if (category === 'blocked_by_review_state') return 26
  if (category === 'blocked_by_source_scarcity') return 30
  if (category === 'blocked_by_metadata') return 22
  return 0
}

function parseArgs(argv: string[]) {
  const parsed = { profile: 'balanced-completion' }
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--profile') {
      parsed.profile = String(argv[i + 1] || '').trim()
      i += 1
      continue
    }
    if (token === '--help' || token === '-h') {
      parsed.profile = 'help'
      continue
    }
    throw new Error(`Unknown argument: ${token}`)
  }
  return parsed
}

function usage() {
  return [
    'Usage: tsx scripts/report-enrichment-wave-targets.ts [--profile <profile-id>]',
    '',
    `Profiles: ${Object.keys(BALANCING_PROFILES).join(', ')}`,
  ].join('\n')
}

function scoreAdjustment(profile: BalancingProfile, proposal: Proposal) {
  const reasons: string[] = []
  const completionAdjustment = Number(((proposal.scoringInputs.completionPercent - 50) * profile.weights.completionMultiplier).toFixed(2))
  let blockerAdjustment = Number((-proposal.scoringInputs.blockerSeverity * profile.weights.blockerPenaltyMultiplier).toFixed(2))
  let actionabilityAdjustment = proposal.actionable ? profile.weights.actionabilityBoost : -Math.abs(profile.weights.actionabilityBoost / 2)
  const carryoverAdjustment = proposal.carryoverFromWaveIds.length > 0 ? profile.weights.carryoverRescueBoost : 0

  if (proposal.nearCompleteHighValue) actionabilityAdjustment += profile.weights.nearCompleteBoost
  if (proposal.scoringInputs.manualReviewNeeded) actionabilityAdjustment -= profile.weights.manualReviewPenalty
  if (proposal.scoringInputs.retryExhausted) actionabilityAdjustment -= profile.weights.retryExhaustionPenalty
  if (proposal.scoringInputs.blockerSeverity >= 70) blockerAdjustment += profile.weights.severeBlockerBoost

  reasons.push(`completion:${completionAdjustment >= 0 ? '+' : ''}${completionAdjustment}`)
  reasons.push(`blocker:${blockerAdjustment >= 0 ? '+' : ''}${blockerAdjustment}`)
  reasons.push(`actionability:${actionabilityAdjustment >= 0 ? '+' : ''}${Number(actionabilityAdjustment.toFixed(2))}`)
  if (carryoverAdjustment !== 0) reasons.push(`carryover:${carryoverAdjustment >= 0 ? '+' : ''}${carryoverAdjustment}`)

  const totalAdjustment = Number((completionAdjustment + blockerAdjustment + actionabilityAdjustment + carryoverAdjustment).toFixed(2))
  return {
    completionAdjustment,
    blockerAdjustment,
    actionabilityAdjustment: Number(actionabilityAdjustment.toFixed(2)),
    carryoverAdjustment,
    totalAdjustment,
    reasons,
  }
}

function applyBalancingProfile(profile: BalancingProfile, proposals: Proposal[]) {
  const adjustments = new Map<string, ReturnType<typeof scoreAdjustment>>()
  for (const proposal of proposals) adjustments.set(proposal.proposalId, scoreAdjustment(profile, proposal))

  const adjusted = proposals
    .map(proposal => {
      const adjustment = adjustments.get(proposal.proposalId)!
      return {
        proposal,
        adjustment,
        finalPriorityScore: Number((proposal.rawPriorityScore + adjustment.totalAdjustment).toFixed(2)),
      }
    })
    .sort((a, b) => b.finalPriorityScore - a.finalPriorityScore || a.proposal.rawRank - b.proposal.rawRank)

  const selected: Proposal[] = []
  const selectedSet = new Set<string>()
  const selectedReason = new Map<string, string[]>()
  const selectedCountByType: Record<EntityType, number> = { herb: 0, compound: 0 }

  const canSelect = (proposal: Proposal, allowOverflow = false) => {
    if (selectedSet.has(proposal.proposalId)) return false
    if (selected.length >= profile.targetSize) return false
    const maxByType = profile.maxByType[proposal.entityType]
    if (!allowOverflow && typeof maxByType === 'number' && selectedCountByType[proposal.entityType] >= maxByType) return false
    return true
  }

  const select = (proposal: Proposal, reason: string, allowOverflow = false) => {
    if (!canSelect(proposal, allowOverflow)) return false
    selected.push(proposal)
    selectedSet.add(proposal.proposalId)
    selectedCountByType[proposal.entityType] += 1
    selectedReason.set(proposal.proposalId, [...(selectedReason.get(proposal.proposalId) || []), reason])
    return true
  }

  const severeCandidates = adjusted.filter(row => row.proposal.scoringInputs.blockerSeverity >= 70)
  for (const row of severeCandidates) {
    if (selected.length >= profile.targetSize) break
    const severeSelected = selected.filter(item => item.scoringInputs.blockerSeverity >= 70).length
    if (severeSelected >= profile.severeBlockerVisibilitySlots) break
    select(row.proposal, 'severe-blocker-visibility', true)
  }

  for (const entityType of ['herb', 'compound'] as const) {
    const min = profile.minByType[entityType] || 0
    if (min <= 0) continue
    for (const row of adjusted) {
      if (selected.length >= profile.targetSize) break
      if (row.proposal.entityType !== entityType) continue
      if (selectedCountByType[entityType] >= min) break
      select(row.proposal, `type-min-floor:${entityType}`)
    }
  }

  for (const row of adjusted) {
    if (selected.length >= profile.targetSize) break
    select(row.proposal, 'adjusted-score-rank')
  }

  const decisions: ProfileDecision[] = proposals.map(proposal => {
    const adjustment = adjustments.get(proposal.proposalId)!
    const finalPriorityScore = Number((proposal.rawPriorityScore + adjustment.totalAdjustment).toFixed(2))
    const selectedIdx = selected.findIndex(row => row.proposalId === proposal.proposalId)
    const selectedBecause = selectedReason.get(proposal.proposalId) || []

    let exclusionReason: string | null = null
    if (selectedIdx === -1) {
      const highValue = proposal.rawPriorityScore >= 130
      if (highValue && !proposal.actionable) {
        exclusionReason =
          proposal.scoringInputs.blockerSeverity >= 70
            ? 'High-value entity omitted from this profile due to severe blocker severity and low actionability.'
            : 'High-value entity omitted from this profile due to low actionability/manual-review burden.'
      } else {
        exclusionReason = 'Below adjusted-score cutoff after deterministic completion/blocker balancing.'
      }
    }

    return {
      profileId: profile.id,
      proposalId: proposal.proposalId,
      rawRank: proposal.rawRank,
      rawPriorityScore: proposal.rawPriorityScore,
      completionBlockerAdjustments: adjustment,
      finalPriorityScore,
      selected: selectedIdx !== -1,
      selectionOrder: selectedIdx === -1 ? null : selectedIdx + 1,
      selectedBecause: [...selectedBecause, ...adjustment.reasons],
      exclusionReason,
    }
  })

  const selectedTargets = selected.map(row => ({
    entityType: row.entityType,
    entitySlug: row.entitySlug,
    waveStatus: row.carryoverFromWaveIds.length ? 'carryover' : 'new-entity',
    selectionWhy: row.whySelected,
    highestPriorityMissingTopics: row.missingTopics,
    criticality: row.criticalGapTypes,
    currentGovernedCoverageStatus: row.currentGovernedCoverageState,
    proposalClass: row.proposalClass,
    completionPercent: row.scoringInputs.completionPercent,
    blockerSeverity: row.scoringInputs.blockerSeverity,
  }))

  return {
    profile,
    decisions,
    selectedTargets,
    composition: {
      total: selected.length,
      byType: {
        herb: selected.filter(row => row.entityType === 'herb').length,
        compound: selected.filter(row => row.entityType === 'compound').length,
      },
      severeBlockerCount: selected.filter(row => row.scoringInputs.blockerSeverity >= 70).length,
      carryoverCount: selected.filter(row => row.carryoverFromWaveIds.length > 0).length,
      nearCompleteCount: selected.filter(row => row.nearCompleteHighValue).length,
    },
  }
}

function run() {
  const args = parseArgs(process.argv.slice(2))
  if (args.profile === 'help') return void console.log(usage())
  if (!BALANCING_PROFILES[args.profile]) throw new Error(`Unknown --profile '${args.profile}'.\n${usage()}`)

  Object.values(INPUTS).forEach(ensureExists)

  const workpacks = readJson<{ workpacks: Workpack[] }>(INPUTS.workpacks)
  const sourceGaps = readJson<{ gapItems: SourceGapItem[] }>(INPUTS.sourceGaps)
  const sourceIntake = readJson<{ tasks: IntakeTask[] }>(INPUTS.sourceIntake)
  const wave2Review = readJson<{ candidateDecisions: SourceReviewDecision[] }>(INPUTS.wave2Review)
  const wave2Blockers = readJson<{ blockersByTarget: WaveBlocker[] }>(INPUTS.wave2Blockers)
  const wave2Rollup = readJson<{ unresolvedCriticalGaps: RollupCriticalGap[] }>(INPUTS.wave2Rollup)
  const completionScorecards = readJson<{ scorecards: CompletionScorecard[] }>(INPUTS.completionScorecards)
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
      carryoverByEntity.set(key, [...(carryoverByEntity.get(key) || []), waveId])
    }
  }

  const sourceGapsByEntity = new Map<string, SourceGapItem[]>()
  for (const item of sourceGaps.gapItems) {
    if (!item.entitySlug) continue
    const entityType: EntityType = item.itemType === 'compound_page' ? 'compound' : 'herb'
    const key = entityKey(entityType, item.entitySlug)
    sourceGapsByEntity.set(key, [...(sourceGapsByEntity.get(key) || []), item])
  }

  const intakeByEntity = new Map<string, IntakeTask[]>()
  for (const task of sourceIntake.tasks) {
    if (!task.entitySlug) continue
    const entityType: EntityType = task.itemType === 'compound_page' ? 'compound' : task.itemType === 'herb_page' ? 'herb' : 'herb'
    const key = entityKey(entityType, task.entitySlug)
    intakeByEntity.set(key, [...(intakeByEntity.get(key) || []), task])
  }

  const blockersByEntity = new Map<string, WaveBlocker>()
  for (const blocker of wave2Blockers.blockersByTarget) blockersByEntity.set(entityKey(blocker.entityType, blocker.entitySlug), blocker)

  const rollupByEntity = new Map<string, RollupCriticalGap>()
  for (const gap of wave2Rollup.unresolvedCriticalGaps || []) rollupByEntity.set(entityKey(gap.entityType, gap.entitySlug), gap)

  const reviewStatsByEntity = new Map<string, { promoted: number; duplicate: number; total: number }>()
  for (const decision of wave2Review.candidateDecisions) {
    for (const key of Array.isArray(decision.entityKeys) ? decision.entityKeys : []) {
      const bucket = reviewStatsByEntity.get(key) || { promoted: 0, duplicate: 0, total: 0 }
      bucket.total += 1
      if (decision.reviewStatus === 'approved_and_promoted') bucket.promoted += 1
      if (decision.outcomeCategory === 'duplicate_of_existing') bucket.duplicate += 1
      reviewStatsByEntity.set(key, bucket)
    }
  }

  const completionByEntity = new Map<string, CompletionScorecard>()
  for (const score of completionScorecards.scorecards) {
    const match = score.itemId.match(/^(herb_page|compound_page):(.*)$/)
    if (!match) continue
    const entityType: EntityType = match[1] === 'compound_page' ? 'compound' : 'herb'
    const slug = normalizeSlug(match[2])
    completionByEntity.set(entityKey(entityType, slug), score)
  }

  const proposalsUnranked: Proposal[] = workpacks.workpacks
    .filter(row => (row.itemType === 'herb_page' || row.itemType === 'compound_page') && row.entitySlug)
    .map(row => {
      const entityType: EntityType = row.itemType === 'compound_page' ? 'compound' : 'herb'
      const entitySlug = normalizeSlug(row.entitySlug)
      const key = entityKey(entityType, entitySlug)

      const missingTopics = Array.from(new Set(row.missingTopics || [])).sort()
      const gapItems = sourceGapsByEntity.get(key) || []
      const intakeTasks = intakeByEntity.get(key) || []
      const unresolvedRollup = rollupByEntity.get(key)
      const unresolvedTopics = Array.from(new Set([...(unresolvedRollup?.unresolvedCriticalTopics || []), ...missingTopics]))
      const criticalGapTypes = Array.from(new Set(unresolvedTopics.map(topicToCriticalGapType).filter(Boolean))).sort() as CriticalGapType[]
      const carryoverFromWaveIds = (carryoverByEntity.get(key) || []).sort()
      const priorBlocker = blockersByEntity.get(key)
      const reviewStats = reviewStatsByEntity.get(key) || { promoted: 0, duplicate: 0, total: 0 }
      const stale = (row.staleTopics || []).length > 0 || /review_due|blocked_pending_review|depublish_or_hide/.test(row.reviewCycleState)

      const blockerSignals = Array.from(
        new Set([...(row.blockedReasons || []), ...(priorBlocker?.blockerClasses || []), priorBlocker?.endedAtDeltaZeroWhy || ''].filter(Boolean)),
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

      const completion = completionByEntity.get(key)
      const completionPercent = Number((completion?.completionPercent || 0).toFixed(2))
      const criticalMissingFieldCount = completion?.criticalMissingFields?.length || missingTopics.length
      const manualReviewNeeded = Boolean(completion?.manualReviewNeeded)
      const readyForNextStage = completion?.readyState === 'ready_for_next_stage'
      const retryExhausted = intakeTasks.some(task => (task.unresolvedAfterRetries || []).length > 0)
      const blockerSeverity = Math.min(
        95,
        blockerCategoryBase(completion?.blockingCategory || 'none') +
          criticalMissingFieldCount * 4 +
          (manualReviewNeeded ? 6 : 0) +
          (retryExhausted ? 6 : 0) +
          Math.min(8, blockerSignals.length * 1.5),
      )

      const promotableSourceLikelihood = classifyPromotableLikelihood(reviewStats)
      if (promotableSourceLikelihood === 'high') score += 8
      if (promotableSourceLikelihood === 'medium') score += 4

      const actionable = readyForNextStage || (completionPercent >= 55 && blockerSeverity <= 60 && !retryExhausted)
      const nearCompleteHighValue = completionPercent >= 80 && score >= 120 && criticalMissingFieldCount <= 1

      let proposalClass: ProposalClass = 'low-value-but-easy'
      if (score >= 130 && actionable) proposalClass = 'high-value-highly-actionable'
      else if (score >= 130 && !actionable) proposalClass = 'high-value-but-badly-blocked'
      else if (carryoverFromWaveIds.length > 0 && (retryExhausted || blockerSeverity >= 70 || stale))
        proposalClass = 'carryover-rescue-candidate'
      else if (manualReviewNeeded && retryExhausted && completionPercent < 50) proposalClass = 'manual-review-first-candidate'

      const waveSuggestionId = carryoverFromWaveIds.length ? 'carryover-rescue' : 'new-entity-priority'

      return {
        proposalId: `proposal_${entityType}_${entitySlug}`,
        waveSuggestionId,
        entityType,
        entitySlug,
        publicStatus: row.publicStatus,
        currentGovernedCoverageState: row.enrichmentHealthState,
        rawPriorityScore: Number(score.toFixed(2)),
        priorityBucket: priorityBucket(score),
        carryoverFromWaveIds,
        criticalGapTypes,
        missingTopics,
        stale,
        blockerSignals,
        surfaceDependencySignals,
        promotableSourceLikelihood,
        recommendedWaveAction: row.recommendedAction,
        whySelected: `${row.publicStatus} entity with completion=${completionPercent}%, blockerSeverity=${blockerSeverity}, class=${proposalClass}.`,
        notes: [
          `workpack bucket=${row.operationalBucket}`,
          `reviewCycleState=${row.reviewCycleState}`,
          `promotableSourceLikelihood=${promotableSourceLikelihood}`,
        ],
        rawRank: 0,
        scoringInputs: {
          completionPercent,
          criticalMissingFieldCount,
          blockerSeverity: Number(blockerSeverity.toFixed(2)),
          retryExhausted,
          manualReviewNeeded,
          readyForNextStage,
        },
        actionable,
        nearCompleteHighValue,
        proposalClass,
      }
    })

  proposalsUnranked.sort((a, b) => b.rawPriorityScore - a.rawPriorityScore || a.entityType.localeCompare(b.entityType) || a.entitySlug.localeCompare(b.entitySlug))
  const proposals = proposalsUnranked.map((row, index) => ({ ...row, rawRank: index + 1 }))

  const profileResults = Object.values(BALANCING_PROFILES).map(profile => applyBalancingProfile(profile, proposals))
  const selectedProfileResult = profileResults.find(row => row.profile.id === args.profile)
  if (!selectedProfileResult) throw new Error(`Selected profile result missing: ${args.profile}`)

  const generatedAt = new Date().toISOString()
  const payload = {
    generatedAt,
    deterministicModelVersion: MODEL_VERSION,
    selectedProfileId: args.profile,
    inputsUsed: Object.values(INPUTS).map(filePath => path.relative(ROOT, filePath)),
    summary: {
      totalCandidates: proposals.length,
      byProposalClass: Object.fromEntries(PROPOSAL_CLASSES.map(kind => [kind, proposals.filter(row => row.proposalClass === kind).length])),
      selectedProfileComposition: selectedProfileResult.composition,
    },
    proposals,
    profileResults: profileResults.map(result => ({
      profileId: result.profile.id,
      description: result.profile.description,
      composition: result.composition,
      selectedProposalIds: result.decisions
        .filter(row => row.selected)
        .sort((a, b) => (a.selectionOrder || 999) - (b.selectionOrder || 999))
        .map(row => row.proposalId),
      decisions: result.decisions,
    })),
  }

  const targetNameByProfile: Record<string, string> = {
    'actionability-priority': 'enrichment-wave-actionability.json',
    'blocker-rescue': 'enrichment-wave-blocker-rescue.json',
    'balanced-completion': 'enrichment-wave-balanced-completion.json',
  }

  for (const result of profileResults) {
    const outputPath = path.join(OUTPUTS.profileTargetsDir, targetNameByProfile[result.profile.id])
    writeJson(outputPath, {
      generatedAt,
      deterministicModelVersion: MODEL_VERSION,
      selectionPolicy: {
        mode: `completion-aware-profile:${result.profile.id}`,
        sourceProposalReport: path.relative(ROOT, OUTPUTS.proposalJson),
        notes: 'Deterministic completion/blocker-aware target artifact for governed enrichment wave runner input.',
      },
      targets: result.selectedTargets,
    })
  }

  writeJson(OUTPUTS.proposalJson, payload)
  writeJson(OUTPUTS.legacyProposalJson, payload)
  writeJson(OUTPUTS.legacyBalancingJson, {
    generatedAt,
    deterministicModelVersion: MODEL_VERSION,
    selectedProfileId: args.profile,
    balancingProfiles: BALANCING_PROFILES,
    profileResults: payload.profileResults,
  })

  const md = [
    '# Completion-Aware Enrichment Wave Targets',
    '',
    `- Generated at: ${generatedAt}`,
    `- Deterministic model version: ${MODEL_VERSION}`,
    `- Selected profile: ${args.profile}`,
    '',
    '## Scoring inputs (deterministic)',
    '- completionPercent',
    '- criticalMissingFieldCount',
    '- blockerSeverity',
    '- retryExhausted',
    '- manualReviewNeeded',
    '- readyForNextStage',
    '',
    '## Selected profile decisions',
    '| Order | Entity | Raw | Completion adj | Blocker adj | Actionability adj | Final | Outcome |',
    '| ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |',
    ...selectedProfileResult.decisions
      .sort((a, b) => (a.selectionOrder || 999) - (b.selectionOrder || 999) || a.rawRank - b.rawRank)
      .slice(0, 16)
      .map(row => {
        const proposal = proposals.find(p => p.proposalId === row.proposalId)
        return `| ${row.selectionOrder || '-'} | ${proposal?.entityType}:${proposal?.entitySlug} | ${row.rawPriorityScore} | ${row.completionBlockerAdjustments.completionAdjustment} | ${row.completionBlockerAdjustments.blockerAdjustment} | ${row.completionBlockerAdjustments.actionabilityAdjustment} | ${row.finalPriorityScore} | ${row.selected ? 'selected' : row.exclusionReason || 'excluded'} |`
      }),
    '',
    '## High-value exclusions',
    ...selectedProfileResult.decisions
      .filter(row => !row.selected && row.rawPriorityScore >= 130)
      .slice(0, 10)
      .map(row => {
        const proposal = proposals.find(p => p.proposalId === row.proposalId)
        return `- ${proposal?.entityType}:${proposal?.entitySlug} (raw=${row.rawPriorityScore}, final=${row.finalPriorityScore}) -> ${row.exclusionReason}`
      }),
    '',
    '## Runner-ready target artifacts',
    '- `ops/targets/enrichment-wave-actionability.json`',
    '- `ops/targets/enrichment-wave-blocker-rescue.json`',
    '- `ops/targets/enrichment-wave-balanced-completion.json`',
  ]

  fs.writeFileSync(OUTPUTS.proposalMd, `${md.join('\n')}\n`, 'utf8')

  console.log(`Wrote ${path.relative(ROOT, OUTPUTS.proposalJson)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUTS.proposalMd)}`)
  console.log('Wrote ops/targets/enrichment-wave-actionability.json')
  console.log('Wrote ops/targets/enrichment-wave-blocker-rescue.json')
  console.log('Wrote ops/targets/enrichment-wave-balanced-completion.json')
}

run()
