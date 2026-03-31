import fs from 'node:fs'
import path from 'node:path'

type EntityType = 'herb' | 'compound'
type PriorityBucket = 'critical' | 'high' | 'medium' | 'low'
type CriticalGapType = 'safety-critical' | 'evidence-critical' | 'mechanism-critical'

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
  itemType: string
  entitySlug: string | null
  topicType: string
  acquisitionTier: string
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
}

type BalancingProfile = {
  id: string
  description: string
  targetSize: number
  minByType: Partial<Record<EntityType, number>>
  maxByType: Partial<Record<EntityType, number>>
  typeAdjustment: Partial<Record<EntityType, number>>
  topicAdjustment: Partial<Record<CriticalGapType, number>>
  carryoverBlockedBoost: number
  staleBoost: number
  safetyOverride: { minRawScore: number; slots: number }
  carryoverRescue: { minSlots: number; entityType: EntityType }
}

type ProfileDecision = {
  profileId: string
  proposalId: string
  rawRank: number
  rawPriorityScore: number
  balancingAdjustment: number
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
}

const OUTPUTS = {
  proposalJson: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-target-proposals.json'),
  proposalMd: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-target-proposals.md'),
  balancingJson: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-target-balancing.json'),
  balancingMd: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-target-balancing.md'),
  profileTargetsDir: path.join(ROOT, 'ops', 'targets'),
}

const MODEL_VERSION = 'enrichment-wave-target-proposals-v2-balancing'

const BALANCING_PROFILES: Record<string, BalancingProfile> = {
  'mixed-balanced': {
    id: 'mixed-balanced',
    description: 'Evenly balance herb/compound representation while preserving safety and stale carryover pressure.',
    targetSize: 8,
    minByType: { herb: 3, compound: 3 },
    maxByType: { herb: 5, compound: 5 },
    typeAdjustment: { herb: 0, compound: 4 },
    topicAdjustment: { 'safety-critical': 12, 'evidence-critical': 6, 'mechanism-critical': 4 },
    carryoverBlockedBoost: 9,
    staleBoost: 4,
    safetyOverride: { minRawScore: 90, slots: 2 },
    carryoverRescue: { minSlots: 2, entityType: 'compound' },
  },
  'herb-heavy': {
    id: 'herb-heavy',
    description: 'Favor herb throughput while preserving guaranteed compound slots and safety overrides.',
    targetSize: 8,
    minByType: { herb: 5, compound: 2 },
    maxByType: { herb: 7, compound: 3 },
    typeAdjustment: { herb: 7, compound: -2 },
    topicAdjustment: { 'safety-critical': 10, 'evidence-critical': 6, 'mechanism-critical': 3 },
    carryoverBlockedBoost: 8,
    staleBoost: 3,
    safetyOverride: { minRawScore: 88, slots: 2 },
    carryoverRescue: { minSlots: 1, entityType: 'compound' },
  },
  'compound-heavy': {
    id: 'compound-heavy',
    description: 'Favor compounds while preserving guaranteed herb slots and safety overrides.',
    targetSize: 8,
    minByType: { herb: 2, compound: 5 },
    maxByType: { herb: 3, compound: 7 },
    typeAdjustment: { herb: -2, compound: 8 },
    topicAdjustment: { 'safety-critical': 10, 'evidence-critical': 5, 'mechanism-critical': 5 },
    carryoverBlockedBoost: 11,
    staleBoost: 4,
    safetyOverride: { minRawScore: 88, slots: 2 },
    carryoverRescue: { minSlots: 2, entityType: 'compound' },
  },
  'safety-priority-mixed': {
    id: 'safety-priority-mixed',
    description: 'Mixed entity distribution with explicit safety critical escalation.',
    targetSize: 8,
    minByType: { herb: 3, compound: 3 },
    maxByType: { herb: 5, compound: 5 },
    typeAdjustment: { herb: 0, compound: 3 },
    topicAdjustment: { 'safety-critical': 16, 'evidence-critical': 4, 'mechanism-critical': 3 },
    carryoverBlockedBoost: 9,
    staleBoost: 4,
    safetyOverride: { minRawScore: 84, slots: 3 },
    carryoverRescue: { minSlots: 1, entityType: 'compound' },
  },
  'carryover-rescue-mixed': {
    id: 'carryover-rescue-mixed',
    description: 'Mixed distribution that reserves slots for stale/blocked carryover entities, especially compounds.',
    targetSize: 8,
    minByType: { herb: 3, compound: 3 },
    maxByType: { herb: 5, compound: 5 },
    typeAdjustment: { herb: 0, compound: 4 },
    topicAdjustment: { 'safety-critical': 10, 'evidence-critical': 5, 'mechanism-critical': 3 },
    carryoverBlockedBoost: 14,
    staleBoost: 6,
    safetyOverride: { minRawScore: 88, slots: 2 },
    carryoverRescue: { minSlots: 3, entityType: 'compound' },
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
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required proposal input is missing: ${path.relative(ROOT, filePath)}`)
  }
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

function parseArgs(argv: string[]) {
  const parsed = { profile: 'mixed-balanced' }
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

function scoreAdjustment(profile: BalancingProfile, proposal: Proposal): { adjustment: number; reasons: string[] } {
  let adjustment = 0
  const reasons: string[] = []

  const typeAdjust = profile.typeAdjustment[proposal.entityType] || 0
  if (typeAdjust !== 0) {
    adjustment += typeAdjust
    reasons.push(`type:${proposal.entityType}:${typeAdjust > 0 ? '+' : ''}${typeAdjust}`)
  }

  for (const topic of proposal.criticalGapTypes) {
    const topicAdjust = profile.topicAdjustment[topic] || 0
    if (topicAdjust !== 0) {
      adjustment += topicAdjust
      reasons.push(`topic:${topic}:${topicAdjust > 0 ? '+' : ''}${topicAdjust}`)
    }
  }

  const carryoverBlocked = proposal.carryoverFromWaveIds.length > 0 && proposal.blockerSignals.length > 0
  if (carryoverBlocked) {
    adjustment += profile.carryoverBlockedBoost
    reasons.push(`carryover-blocked:+${profile.carryoverBlockedBoost}`)
  }

  if (proposal.stale) {
    adjustment += profile.staleBoost
    reasons.push(`stale:+${profile.staleBoost}`)
  }

  return { adjustment, reasons }
}

function applyBalancingProfile(profile: BalancingProfile, proposals: Proposal[]) {
  const rawTop = new Set(proposals.slice(0, profile.targetSize).map(row => row.proposalId))
  const byId = new Map(proposals.map(row => [row.proposalId, row]))
  const adjustments = new Map<string, { adjustment: number; reasons: string[] }>()

  for (const proposal of proposals) {
    adjustments.set(proposal.proposalId, scoreAdjustment(profile, proposal))
  }

  const selected: Proposal[] = []
  const selectedSet = new Set<string>()
  const selectedReason = new Map<string, string[]>()
  const selectedCountByType: Record<EntityType, number> = { herb: 0, compound: 0 }

  const canSelect = (proposal: Proposal, allowOverflowForSafety = false) => {
    if (selectedSet.has(proposal.proposalId)) return false
    if (selected.length >= profile.targetSize) return false
    const maxForType = profile.maxByType[proposal.entityType]
    if (!allowOverflowForSafety && typeof maxForType === 'number' && selectedCountByType[proposal.entityType] >= maxForType) {
      return false
    }
    return true
  }

  const select = (proposal: Proposal, reason: string, allowOverflowForSafety = false) => {
    if (!canSelect(proposal, allowOverflowForSafety)) return false
    selected.push(proposal)
    selectedSet.add(proposal.proposalId)
    selectedCountByType[proposal.entityType] += 1
    const bucket = selectedReason.get(proposal.proposalId) || []
    bucket.push(reason)
    selectedReason.set(proposal.proposalId, bucket)
    return true
  }

  for (const proposal of proposals) {
    if (selected.length >= profile.targetSize) break
    if (!proposal.criticalGapTypes.includes('safety-critical')) continue
    if (proposal.rawPriorityScore < profile.safetyOverride.minRawScore) continue
    if (
      selected.filter(row => selectedReason.get(row.proposalId)?.includes('safety-override')).length >= profile.safetyOverride.slots
    ) {
      break
    }
    select(proposal, 'safety-override', true)
  }

  const carryoverCandidates = proposals.filter(
    row =>
      row.entityType === profile.carryoverRescue.entityType &&
      row.carryoverFromWaveIds.length > 0 &&
      (row.blockerSignals.length > 0 || row.stale),
  )

  for (const proposal of carryoverCandidates) {
    if (selected.length >= profile.targetSize) break
    const currentlySelectedOfType = selected.filter(row => row.entityType === profile.carryoverRescue.entityType).length
    if (currentlySelectedOfType >= profile.carryoverRescue.minSlots) break
    select(proposal, 'carryover-rescue-floor')
  }

  for (const entityType of ['herb', 'compound'] as const) {
    const minForType = profile.minByType[entityType] || 0
    if (minForType <= 0) continue
    for (const proposal of proposals) {
      if (selected.length >= profile.targetSize) break
      if (proposal.entityType !== entityType) continue
      if (selectedCountByType[entityType] >= minForType) break
      select(proposal, `type-min-floor:${entityType}`)
    }
  }

  const adjustedRank = proposals
    .map(row => {
      const entry = adjustments.get(row.proposalId) || { adjustment: 0, reasons: [] }
      return {
        proposal: row,
        finalPriorityScore: Number((row.rawPriorityScore + entry.adjustment).toFixed(2)),
        adjustment: entry.adjustment,
      }
    })
    .sort(
      (a, b) =>
        b.finalPriorityScore - a.finalPriorityScore ||
        a.proposal.rawRank - b.proposal.rawRank ||
        a.proposal.proposalId.localeCompare(b.proposal.proposalId),
    )

  for (const row of adjustedRank) {
    if (selected.length >= profile.targetSize) break
    select(row.proposal, 'adjusted-score-rank')
  }

  const decisions: ProfileDecision[] = proposals.map(proposal => {
    const adjust = adjustments.get(proposal.proposalId) || { adjustment: 0, reasons: [] }
    const finalPriorityScore = Number((proposal.rawPriorityScore + adjust.adjustment).toFixed(2))
    const selectedIdx = selected.findIndex(row => row.proposalId === proposal.proposalId)
    const selectedBecause = selectedReason.get(proposal.proposalId) || []

    let exclusionReason: string | null = null
    if (selectedIdx === -1) {
      const maxForType = profile.maxByType[proposal.entityType]
      if (rawTop.has(proposal.proposalId)) {
        exclusionReason = 'Excluded by balancing policy after raw-score top set selection.'
      } else if (typeof maxForType === 'number' && selectedCountByType[proposal.entityType] >= maxForType) {
        exclusionReason = `Type max quota reached for ${proposal.entityType} under profile ${profile.id}.`
      } else {
        exclusionReason = 'Below final adjusted-score cutoff after balancing policy application.'
      }
    }

    return {
      profileId: profile.id,
      proposalId: proposal.proposalId,
      rawRank: proposal.rawRank,
      rawPriorityScore: proposal.rawPriorityScore,
      balancingAdjustment: adjust.adjustment,
      finalPriorityScore,
      selected: selectedIdx !== -1,
      selectionOrder: selectedIdx === -1 ? null : selectedIdx + 1,
      selectedBecause: [...selectedBecause, ...adjust.reasons],
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
      safetyCriticalCount: selected.filter(row => row.criticalGapTypes.includes('safety-critical')).length,
      carryoverCount: selected.filter(row => row.carryoverFromWaveIds.length > 0).length,
    },
  }
}

function run() {
  const args = parseArgs(process.argv.slice(2))
  if (args.profile === 'help') {
    console.log(usage())
    return
  }
  if (!BALANCING_PROFILES[args.profile]) {
    throw new Error(`Unknown --profile '${args.profile}'.\n${usage()}`)
  }

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

      const criticalGapTypes = Array.from(
        new Set(unresolvedTopics.map(topicToCriticalGapType).filter((value): value is CriticalGapType => Boolean(value))),
      ).sort() as CriticalGapType[]

      const carryoverFromWaveIds = (carryoverByEntity.get(key) || []).sort()
      const priorBlocker = blockersByEntity.get(key)
      const reviewStats = reviewStatsByEntity.get(key) || { promoted: 0, duplicate: 0, total: 0 }
      const stale =
        (row.staleTopics || []).length > 0 || /review_due|blocked_pending_review|depublish_or_hide/.test(row.reviewCycleState)

      const blockerSignals = Array.from(
        new Set(
          [...(row.blockedReasons || []), ...(priorBlocker?.blockerClasses || []), priorBlocker?.endedAtDeltaZeroWhy || ''].filter(
            Boolean,
          ),
        ),
      )

      const surfaceDependencySignals = Array.from(
        new Set(
          [
            row.publicStatus.startsWith('indexable') ? 'indexable-public-surface' : 'non-indexable-surface',
            gapItems.some(item => item.publishBlocking) ? 'publish-blocking-surface-impact' : '',
            indexableKeys.has(key) ? 'publication-manifest-indexable' : '',
          ].filter(Boolean),
        ),
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
        whySelected: [
          `${row.publicStatus} entity with priority score ${row.publicPriorityScore}.`,
          prioritizedTopics.length
            ? `Critical gaps: ${prioritizedTopics.join(', ')}.`
            : 'No critical safety/evidence/mechanism gaps currently open.',
          carryoverFromWaveIds.length
            ? `Carryover from ${carryoverFromWaveIds.join(', ')}.`
            : 'Not present in prior wave target files.',
        ].join(' '),
        notes: [
          `workpack bucket=${row.operationalBucket}`,
          `reviewCycleState=${row.reviewCycleState}`,
          `promotableSourceLikelihood=${promotableSourceLikelihood}`,
          `sourceGapCount=${gapItems.length}`,
          `intakeTaskCount=${intakeTasks.length}`,
        ],
        rawRank: 0,
      }
    })

  proposalsUnranked.sort(
    (a, b) => b.rawPriorityScore - a.rawPriorityScore || a.entityType.localeCompare(b.entityType) || a.entitySlug.localeCompare(b.entitySlug),
  )
  const proposals = proposalsUnranked.map((row, index) => ({ ...row, rawRank: index + 1 }))

  const profileResults = Object.values(BALANCING_PROFILES).map(profile => applyBalancingProfile(profile, proposals))
  const selectedProfileResult = profileResults.find(row => row.profile.id === args.profile)
  if (!selectedProfileResult) throw new Error(`Selected profile result missing: ${args.profile}`)

  const generatedAt = new Date().toISOString()

  const proposalPayload = {
    generatedAt,
    deterministicModelVersion: MODEL_VERSION,
    selectedProfileId: args.profile,
    inputsUsed: Object.values(INPUTS).map(filePath => path.relative(ROOT, filePath)),
    summary: {
      totalCandidates: proposals.length,
      rawTopSetComposition: {
        herb: proposals.slice(0, selectedProfileResult.profile.targetSize).filter(row => row.entityType === 'herb').length,
        compound: proposals.slice(0, selectedProfileResult.profile.targetSize).filter(row => row.entityType === 'compound').length,
      },
      selectedProfileComposition: selectedProfileResult.composition,
    },
    proposals,
    selectedProfileDecisions: selectedProfileResult.decisions,
  }

  const balancingPayload = {
    generatedAt,
    deterministicModelVersion: MODEL_VERSION,
    balancingProfiles: BALANCING_PROFILES,
    selectedProfileId: args.profile,
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

  const runnerTargetFrom = (profileId: string, selected: ReturnType<typeof applyBalancingProfile>['selectedTargets']) => ({
    generatedAt,
    deterministicModelVersion: MODEL_VERSION,
    selectionPolicy: {
      mode: `balancing-profile:${profileId}`,
      sourceProposalReport: path.relative(ROOT, OUTPUTS.proposalJson),
      sourceBalancingReport: path.relative(ROOT, OUTPUTS.balancingJson),
      notes: 'Deterministic balancing-profile target artifact. Human edits are expected before wave execution.',
    },
    targets: selected,
  })

  for (const result of profileResults) {
    const outputPath = path.join(OUTPUTS.profileTargetsDir, `enrichment-wave-${result.profile.id}.json`)
    writeJson(outputPath, runnerTargetFrom(result.profile.id, result.selectedTargets))
  }

  writeJson(OUTPUTS.proposalJson, proposalPayload)
  writeJson(OUTPUTS.balancingJson, balancingPayload)

  const mdLines = [
    '# Enrichment Wave Target Proposals (Balanced)',
    '',
    `- Generated at: ${generatedAt}`,
    `- Deterministic model version: ${MODEL_VERSION}`,
    `- Selected profile: ${args.profile}`,
    `- Candidate count: ${proposals.length}`,
    '',
    '## Raw-score concentration audit',
    `- Raw top-${selectedProfileResult.profile.targetSize} composition: herbs=${proposalPayload.summary.rawTopSetComposition.herb}, compounds=${proposalPayload.summary.rawTopSetComposition.compound}.`,
    '- Over-concentration is addressed by deterministic profile constraints and score adjustments (not by replacing base scoring).',
    '',
    '## Selected profile composition',
    `- ${args.profile}: total=${selectedProfileResult.composition.total}, herbs=${selectedProfileResult.composition.byType.herb}, compounds=${selectedProfileResult.composition.byType.compound}, safetyCritical=${selectedProfileResult.composition.safetyCriticalCount}, carryover=${selectedProfileResult.composition.carryoverCount}`,
    '',
    '## Selected profile target list',
    '| Order | Entity | Raw score | Adjustment | Final score | Inclusion basis |',
    '| ---: | --- | ---: | ---: | ---: | --- |',
    ...selectedProfileResult.decisions
      .filter(row => row.selected)
      .sort((a, b) => (a.selectionOrder || 999) - (b.selectionOrder || 999))
      .map(row => {
        const proposal = proposals.find(item => item.proposalId === row.proposalId)
        const entity = `${proposal?.entityType}:${proposal?.entitySlug}`
        return `| ${row.selectionOrder} | ${entity} | ${row.rawPriorityScore} | ${row.balancingAdjustment} | ${row.finalPriorityScore} | ${row.selectedBecause.join(', ') || 'adjusted-score-rank'} |`
      }),
    '',
    '## High-scoring exclusions caused by balancing',
    '| Entity | Raw rank | Raw score | Final score | Exclusion reason |',
    '| --- | ---: | ---: | ---: | --- |',
    ...selectedProfileResult.decisions
      .filter(row => !row.selected && row.rawRank <= selectedProfileResult.profile.targetSize)
      .map(row => {
        const proposal = proposals.find(item => item.proposalId === row.proposalId)
        return `| ${proposal?.entityType}:${proposal?.entitySlug} | ${row.rawRank} | ${row.rawPriorityScore} | ${row.finalPriorityScore} | ${row.exclusionReason || 'n/a'} |`
      }),
    '',
    '## Generated runner-ready target artifacts',
    ...profileResults.map(result => `- \`ops/targets/enrichment-wave-${result.profile.id}.json\``),
  ]

  fs.mkdirSync(path.dirname(OUTPUTS.proposalMd), { recursive: true })
  fs.writeFileSync(OUTPUTS.proposalMd, `${mdLines.join('\n')}\n`, 'utf8')

  const balancingMd = [
    '# Enrichment Wave Target Balancing Profiles',
    '',
    `- Generated at: ${generatedAt}`,
    `- Deterministic model version: ${MODEL_VERSION}`,
    '',
    '## Profile composition summary',
    '| Profile | Description | Total | Herbs | Compounds | Safety-critical | Carryover |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: |',
    ...profileResults.map(result => {
      const c = result.composition
      return `| ${result.profile.id} | ${result.profile.description} | ${c.total} | ${c.byType.herb} | ${c.byType.compound} | ${c.safetyCriticalCount} | ${c.carryoverCount} |`
    }),
    '',
    '## Verification checkpoints',
    '- Raw vs final scores are available in `ops/reports/enrichment-wave-target-balancing.json` (per-profile decisions).',
    '- Exclusion reasons are explicit for omitted high-scoring entities.',
    '- Safety overrides and carryover-rescue floors are deterministic and profile-configured.',
  ]
  fs.writeFileSync(OUTPUTS.balancingMd, `${balancingMd.join('\n')}\n`, 'utf8')

  console.log(`Wrote ${path.relative(ROOT, OUTPUTS.proposalJson)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUTS.proposalMd)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUTS.balancingJson)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUTS.balancingMd)}`)
  for (const result of profileResults) {
    console.log(`Wrote ${path.relative(ROOT, path.join(OUTPUTS.profileTargetsDir, `enrichment-wave-${result.profile.id}.json`))}`)
  }
}

run()
