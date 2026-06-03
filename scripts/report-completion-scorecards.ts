import fs from 'node:fs'
import path from 'node:path'

type CompletionMetrics = {
  totalRequiredFields: number
  completedRequiredFields: number
  completionPercent: number
  missingRequiredFields: string[]
  criticalMissingFields: string[]
}

type ScorecardItemType =
  | 'entity'
  | 'source_candidate'
  | 'source_registry_entry'
  | 'authoring_pack'
  | 'enrichment_submission'
  | 'workpack'

type BlockingCategory =
  | 'none'
  | 'blocked_by_metadata'
  | 'blocked_by_source_scarcity'
  | 'blocked_by_safety_critical_missing_fields'
  | 'blocked_by_evidence_critical_missing_fields'
  | 'blocked_by_mechanism_critical_missing_fields'
  | 'blocked_by_governance'
  | 'blocked_by_review_state'

type ReadyState = 'ready_for_next_stage' | 'manual_review_needed' | 'blocked' | 'in_progress'

type Scorecard = {
  itemType: ScorecardItemType
  itemId: string
  entitySlug: string | null
  workpackId: string | null
  intakeTaskId: string | null
  totalRequiredFields: number
  completedRequiredFields: number
  completionPercent: number
  missingRequiredFields: string[]
  criticalMissingFields: string[]
  blockingCategory: BlockingCategory
  retryAttempts: number
  manualReviewNeeded: boolean
  safetyCritical: boolean
  evidenceCritical: boolean
  mechanismCritical: boolean
  readyState: ReadyState
  blockerDetails: string[]
}

type AdaptiveCoverageReport = {
  completionByObject: {
    sourceCandidates: Array<{ id: string; intakeTaskId: string; completion: CompletionMetrics }>
    sourceRegistryEntries: Array<{ id: string; completion: CompletionMetrics }>
    authoringPacks: Array<{ id: string; workpackId: string; completion: CompletionMetrics }>
    enrichmentSubmissions: Array<{ id: string; workpackId: string; completion: CompletionMetrics }>
    entityCoverage: Array<{ id: string; targetType: string; completion: CompletionMetrics; blockingCategories: string[] }>
  }
}

type IntakeTask = {
  intakeTaskId: string
  itemType: string
  entitySlug: string | null
  surfaceId: string | null
  relatedWorkpackIds: string[]
  topicType: string
  sourceGapType: string
  safetyCritical: boolean
  adaptiveRetryAttempts: Array<{ matchedCandidateIds?: string[]; unresolvedRequiredFields: string[] }>
  unresolvedAfterRetries: string[]
}

type IntakeReport = { tasks: IntakeTask[] }

type CandidateAssessment = {
  candidateSourceId: string
  intakeTaskId: string
  outcomeCategory: string
  promotionBlockedReasons: string[]
  metadataIssues: string[]
}

type CandidateReviewReport = { assessments: CandidateAssessment[] }

type AuthoringPack = { authoringPackId: string; status: string; entitySlug: string | null; surfaceId: string | null }
type AuthoringReport = { authoringPacks: AuthoringPack[] }

type SubmissionAssessment = {
  submissionId: string
  derivedOutcome: string
  promotionBlockedReasons: string[]
  warnings: string[]
}

type SubmissionReviewReport = { assessments: SubmissionAssessment[] }

type Workpack = {
  workpackId: string
  itemType: string
  entitySlug: string | null
  surfaceId: string | null
  requiredTopics: string[]
  missingTopics: string[]
  blockedReasons: string[]
  availableSourceIds: string[]
  reviewCycleState: string
}

type WorkpackReport = { workpacks: Workpack[] }

type ScorecardReport = {
  generatedAt: string
  deterministicModelVersion: string
  sources: Record<string, string>
  dimensions: string[]
  summary: {
    totalItems: number
    byItemType: Record<string, number>
    byReadyState: Record<string, number>
    byBlockingCategory: Record<string, number>
    topCompletionItems: Array<{ itemType: ScorecardItemType; itemId: string; completionPercent: number; readyState: ReadyState }>
    mostBlockedItems: Array<{ itemType: ScorecardItemType; itemId: string; blockingCategory: BlockingCategory; blockerDetails: string[] }>
    blockerHotspots: Array<{ blockingCategory: BlockingCategory; count: number }>
  }
  groupedBuckets: {
    nearlyComplete: Scorecard[]
    blockedByMetadata: Scorecard[]
    blockedBySourceScarcity: Scorecard[]
    blockedBySafetyCriticalMissingFields: Scorecard[]
    blockedByEvidenceCriticalMissingFields: Scorecard[]
    manualReviewNeeded: Scorecard[]
    readyForNextStage: Scorecard[]
  }
  scorecards: Scorecard[]
}

const ROOT = process.cwd()
const INPUTS = {
  adaptiveCoverage: path.join(ROOT, 'ops', 'reports', 'adaptive-source-coverage.json'),
  adaptiveRetry: path.join(ROOT, 'ops', 'reports', 'adaptive-retry-tuning.json'),
  intake: path.join(ROOT, 'ops', 'reports', 'source-intake-queue.json'),
  candidateReview: path.join(ROOT, 'ops', 'reports', 'source-candidate-review.json'),
  authoringPacks: path.join(ROOT, 'ops', 'reports', 'enrichment-authoring-packs.json'),
  submissionReview: path.join(ROOT, 'ops', 'reports', 'enrichment-submission-review.json'),
  workpacks: path.join(ROOT, 'ops', 'reports', 'enrichment-workpacks.json'),
}

const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'completion-scorecards.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'completion-scorecards.md')

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function readOptionalJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null
  return readJson<T>(filePath)
}

function makeCounts(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {})
}

function inferReadyState(scorecard: Scorecard): ReadyState {
  if (scorecard.manualReviewNeeded) return 'manual_review_needed'
  if (scorecard.blockingCategory !== 'none') return 'blocked'
  if (scorecard.completionPercent >= 100) return 'ready_for_next_stage'
  return 'in_progress'
}

function isSourceScarcity(task: IntakeTask): boolean {
  const attempts = task.adaptiveRetryAttempts || []
  const matched = attempts.reduce((sum, row) => sum + (row.matchedCandidateIds?.length || 0), 0)
  return matched === 0 && task.unresolvedAfterRetries.length > 0
}

function run() {
  const adaptiveCoverage = readJson<AdaptiveCoverageReport>(INPUTS.adaptiveCoverage)
  const intake = readJson<IntakeReport>(INPUTS.intake)
  const candidateReview = readOptionalJson<CandidateReviewReport>(INPUTS.candidateReview)
  const authoring = readJson<AuthoringReport>(INPUTS.authoringPacks)
  const submissionReview = readOptionalJson<SubmissionReviewReport>(INPUTS.submissionReview)
  const workpacks = readJson<WorkpackReport>(INPUTS.workpacks)

  const taskById = new Map(intake.tasks.map(task => [task.intakeTaskId, task]))
  const tasksByEntityOrSurface = new Map<string, IntakeTask[]>()
  for (const task of intake.tasks) {
    const key = `${task.itemType}:${task.entitySlug || task.surfaceId || ''}`
    const rows = tasksByEntityOrSurface.get(key) || []
    rows.push(task)
    tasksByEntityOrSurface.set(key, rows)
  }

  const candidateAssessmentById = new Map((candidateReview?.assessments || []).map(row => [row.candidateSourceId, row]))
  const authoringById = new Map(authoring.authoringPacks.map(row => [row.authoringPackId, row]))
  const submissionAssessmentById = new Map((submissionReview?.assessments || []).map(row => [row.submissionId, row]))
  const scorecards: Scorecard[] = []

  for (const row of adaptiveCoverage.completionByObject.sourceCandidates) {
    const task = taskById.get(row.intakeTaskId)
    const assessment = candidateAssessmentById.get(row.id)
    const manualReviewNeeded = Boolean(task?.unresolvedAfterRetries.includes('manual_review_required'))
    const metadataBlocked = (assessment?.metadataIssues.length || 0) > 0 || row.completion.criticalMissingFields.length > 0
    const blockerDetails = [
      ...(assessment?.metadataIssues || []),
      ...(assessment?.promotionBlockedReasons || []),
      ...(task?.unresolvedAfterRetries || []),
    ]
    const scorecard: Scorecard = {
      itemType: 'source_candidate',
      itemId: row.id,
      entitySlug: task?.entitySlug || null,
      workpackId: task?.relatedWorkpackIds?.[0] || null,
      intakeTaskId: row.intakeTaskId,
      totalRequiredFields: row.completion.totalRequiredFields,
      completedRequiredFields: row.completion.completedRequiredFields,
      completionPercent: row.completion.completionPercent,
      missingRequiredFields: row.completion.missingRequiredFields,
      criticalMissingFields: row.completion.criticalMissingFields,
      blockingCategory: manualReviewNeeded
        ? 'blocked_by_source_scarcity'
        : metadataBlocked
          ? 'blocked_by_metadata'
          : assessment?.outcomeCategory === 'wrong_source_class_for_intended_gap'
            ? 'blocked_by_governance'
            : 'none',
      retryAttempts: task?.adaptiveRetryAttempts.length || 0,
      manualReviewNeeded,
      safetyCritical: Boolean(task?.safetyCritical),
      evidenceCritical: task?.topicType === 'evidence',
      mechanismCritical: task?.topicType === 'mechanism' || task?.topicType === 'constituent',
      readyState: 'in_progress',
      blockerDetails: Array.from(new Set(blockerDetails)).sort(),
    }
    scorecard.readyState = inferReadyState(scorecard)
    scorecards.push(scorecard)
  }

  for (const row of adaptiveCoverage.completionByObject.sourceRegistryEntries) {
    const metadataBlocked = row.completion.criticalMissingFields.length > 0
    const scorecard: Scorecard = {
      itemType: 'source_registry_entry',
      itemId: row.id,
      entitySlug: null,
      workpackId: null,
      intakeTaskId: null,
      totalRequiredFields: row.completion.totalRequiredFields,
      completedRequiredFields: row.completion.completedRequiredFields,
      completionPercent: row.completion.completionPercent,
      missingRequiredFields: row.completion.missingRequiredFields,
      criticalMissingFields: row.completion.criticalMissingFields,
      blockingCategory: metadataBlocked ? 'blocked_by_metadata' : 'none',
      retryAttempts: 0,
      manualReviewNeeded: false,
      safetyCritical: false,
      evidenceCritical: false,
      mechanismCritical: false,
      readyState: 'in_progress',
      blockerDetails: metadataBlocked ? row.completion.criticalMissingFields : [],
    }
    scorecard.readyState = inferReadyState(scorecard)
    scorecards.push(scorecard)
  }

  for (const row of adaptiveCoverage.completionByObject.authoringPacks) {
    const pack = authoringById.get(row.id)
    const scorecard: Scorecard = {
      itemType: 'authoring_pack',
      itemId: row.id,
      entitySlug: pack?.entitySlug || pack?.surfaceId || null,
      workpackId: row.workpackId,
      intakeTaskId: null,
      totalRequiredFields: row.completion.totalRequiredFields,
      completedRequiredFields: row.completion.completedRequiredFields,
      completionPercent: row.completion.completionPercent,
      missingRequiredFields: row.completion.missingRequiredFields,
      criticalMissingFields: row.completion.criticalMissingFields,
      blockingCategory:
        pack?.status === 'blocked_source'
          ? 'blocked_by_source_scarcity'
          : pack?.status === 'blocked_governance' || pack?.status === 'blocked_policy'
            ? 'blocked_by_governance'
            : row.completion.criticalMissingFields.length > 0
              ? 'blocked_by_metadata'
              : 'none',
      retryAttempts: 0,
      manualReviewNeeded: false,
      safetyCritical: false,
      evidenceCritical: false,
      mechanismCritical: false,
      readyState: 'in_progress',
      blockerDetails: pack?.status?.startsWith('blocked_') ? [pack.status] : [],
    }
    scorecard.readyState = inferReadyState(scorecard)
    scorecards.push(scorecard)
  }

  for (const row of adaptiveCoverage.completionByObject.enrichmentSubmissions) {
    const assessment = submissionAssessmentById.get(row.id)
    const blockerDetails = [...(assessment?.promotionBlockedReasons || []), ...(assessment?.warnings || [])]
    const scorecard: Scorecard = {
      itemType: 'enrichment_submission',
      itemId: row.id,
      entitySlug: null,
      workpackId: row.workpackId,
      intakeTaskId: null,
      totalRequiredFields: row.completion.totalRequiredFields,
      completedRequiredFields: row.completion.completedRequiredFields,
      completionPercent: row.completion.completionPercent,
      missingRequiredFields: row.completion.missingRequiredFields,
      criticalMissingFields: row.completion.criticalMissingFields,
      blockingCategory:
        assessment?.derivedOutcome === 'blocked_review_state'
          ? 'blocked_by_review_state'
          : assessment?.derivedOutcome === 'blocked_governance' || assessment?.derivedOutcome === 'blocked_safety_evidence'
            ? 'blocked_by_governance'
            : row.completion.criticalMissingFields.length > 0
              ? 'blocked_by_metadata'
              : 'none',
      retryAttempts: 0,
      manualReviewNeeded: false,
      safetyCritical: row.completion.criticalMissingFields.some(field => field.includes('safety')),
      evidenceCritical: row.completion.criticalMissingFields.some(field => field.includes('evidence')),
      mechanismCritical: row.completion.criticalMissingFields.some(field => field.includes('mechanism')),
      readyState: 'in_progress',
      blockerDetails: Array.from(new Set(blockerDetails)).sort(),
    }
    scorecard.readyState = inferReadyState(scorecard)
    scorecards.push(scorecard)
  }

  for (const row of adaptiveCoverage.completionByObject.entityCoverage) {
    const tasks = tasksByEntityOrSurface.get(row.id) || []
    const manualReviewNeeded = tasks.some(task => task.unresolvedAfterRetries.includes('manual_review_required'))
    const sourceScarcity = tasks.some(task => isSourceScarcity(task))
    const safetyCritical = row.completion.criticalMissingFields.includes('safety')
    const evidenceCritical = row.completion.criticalMissingFields.includes('evidence')
    const mechanismCritical = row.completion.criticalMissingFields.includes('mechanism') || row.completion.criticalMissingFields.includes('constituent')

    let blockingCategory: BlockingCategory = 'none'
    if (safetyCritical) blockingCategory = 'blocked_by_safety_critical_missing_fields'
    else if (evidenceCritical) blockingCategory = 'blocked_by_evidence_critical_missing_fields'
    else if (mechanismCritical) blockingCategory = 'blocked_by_mechanism_critical_missing_fields'
    else if (sourceScarcity) blockingCategory = 'blocked_by_source_scarcity'
    else if (row.completion.criticalMissingFields.length > 0) blockingCategory = 'blocked_by_metadata'

    const blockerDetails = [
      ...row.completion.criticalMissingFields.map(field => `missing_topic:${field}`),
      ...tasks.flatMap(task => task.unresolvedAfterRetries.map(field => `${task.intakeTaskId}:${field}`)),
    ]

    const scorecard: Scorecard = {
      itemType: 'entity',
      itemId: row.id,
      entitySlug: row.id.split(':').slice(1).join(':') || null,
      workpackId: null,
      intakeTaskId: null,
      totalRequiredFields: row.completion.totalRequiredFields,
      completedRequiredFields: row.completion.completedRequiredFields,
      completionPercent: row.completion.completionPercent,
      missingRequiredFields: row.completion.missingRequiredFields,
      criticalMissingFields: row.completion.criticalMissingFields,
      blockingCategory,
      retryAttempts: tasks.reduce((sum, task) => sum + task.adaptiveRetryAttempts.length, 0),
      manualReviewNeeded,
      safetyCritical,
      evidenceCritical,
      mechanismCritical,
      readyState: 'in_progress',
      blockerDetails: Array.from(new Set(blockerDetails)).sort(),
    }
    scorecard.readyState = inferReadyState(scorecard)
    scorecards.push(scorecard)
  }

  for (const row of workpacks.workpacks) {
    const totalRequired = row.requiredTopics.length
    const completedRequired = Math.max(totalRequired - row.missingTopics.length, 0)
    const completionPercent = totalRequired === 0 ? 100 : Number(((completedRequired / totalRequired) * 100).toFixed(2))
    const safetyCritical = row.missingTopics.includes('safety')
    const evidenceCritical = row.missingTopics.includes('evidence')
    const mechanismCritical = row.missingTopics.includes('mechanism') || row.missingTopics.includes('constituent')

    let blockingCategory: BlockingCategory = 'none'
    if (safetyCritical) blockingCategory = 'blocked_by_safety_critical_missing_fields'
    else if (evidenceCritical) blockingCategory = 'blocked_by_evidence_critical_missing_fields'
    else if (mechanismCritical) blockingCategory = 'blocked_by_mechanism_critical_missing_fields'
    else if (row.availableSourceIds.length === 0) blockingCategory = 'blocked_by_source_scarcity'
    else if (row.blockedReasons.length > 0) blockingCategory = 'blocked_by_governance'

    const scorecard: Scorecard = {
      itemType: 'workpack',
      itemId: row.workpackId,
      entitySlug: row.entitySlug || row.surfaceId,
      workpackId: row.workpackId,
      intakeTaskId: null,
      totalRequiredFields: totalRequired,
      completedRequiredFields: completedRequired,
      completionPercent,
      missingRequiredFields: row.missingTopics,
      criticalMissingFields: row.missingTopics.filter(topic => ['safety', 'evidence', 'mechanism', 'constituent'].includes(topic)),
      blockingCategory,
      retryAttempts: intake.tasks
        .filter(task => task.relatedWorkpackIds.includes(row.workpackId))
        .reduce((sum, task) => sum + task.adaptiveRetryAttempts.length, 0),
      manualReviewNeeded: intake.tasks.some(
        task => task.relatedWorkpackIds.includes(row.workpackId) && task.unresolvedAfterRetries.includes('manual_review_required'),
      ),
      safetyCritical,
      evidenceCritical,
      mechanismCritical,
      readyState: 'in_progress',
      blockerDetails: [...row.blockedReasons, ...row.missingTopics.map(topic => `missing_topic:${topic}`)],
    }
    scorecard.readyState = inferReadyState(scorecard)
    scorecards.push(scorecard)
  }

  const sorted = [...scorecards].sort((a, b) => b.completionPercent - a.completionPercent || a.itemType.localeCompare(b.itemType) || a.itemId.localeCompare(b.itemId))
  const byItemType = makeCounts(scorecards.map(row => row.itemType))
  const byReadyState = makeCounts(scorecards.map(row => row.readyState))
  const byBlockingCategory = makeCounts(scorecards.map(row => row.blockingCategory))

  const report: ScorecardReport = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'completion-scorecards-v1',
    sources: Object.fromEntries(Object.entries(INPUTS).map(([key, value]) => [key, path.relative(ROOT, value)])),
    dimensions: [
      'itemType',
      'entitySlug|workpackId|intakeTaskId',
      'totalRequiredFields',
      'completedRequiredFields',
      'completionPercent',
      'criticalMissingFields',
      'blockingCategory',
      'retryAttempts',
      'manualReviewNeeded',
      'safetyCritical',
      'evidenceCritical',
      'mechanismCritical',
      'readyState',
    ],
    summary: {
      totalItems: scorecards.length,
      byItemType,
      byReadyState,
      byBlockingCategory,
      topCompletionItems: sorted.slice(0, 12).map(row => ({
        itemType: row.itemType,
        itemId: row.itemId,
        completionPercent: row.completionPercent,
        readyState: row.readyState,
      })),
      mostBlockedItems: [...scorecards]
        .sort((a, b) => b.criticalMissingFields.length - a.criticalMissingFields.length || b.blockerDetails.length - a.blockerDetails.length)
        .slice(0, 12)
        .map(row => ({
          itemType: row.itemType,
          itemId: row.itemId,
          blockingCategory: row.blockingCategory,
          blockerDetails: row.blockerDetails.slice(0, 5),
        })),
      blockerHotspots: Object.entries(byBlockingCategory)
        .map(([blockingCategory, count]) => ({ blockingCategory: blockingCategory as BlockingCategory, count }))
        .sort((a, b) => b.count - a.count),
    },
    groupedBuckets: {
      nearlyComplete: scorecards
        .filter(row => row.completionPercent >= 85 && row.completionPercent < 100 && !row.manualReviewNeeded)
        .sort((a, b) => b.completionPercent - a.completionPercent),
      blockedByMetadata: scorecards.filter(row => row.blockingCategory === 'blocked_by_metadata'),
      blockedBySourceScarcity: scorecards.filter(row => row.blockingCategory === 'blocked_by_source_scarcity'),
      blockedBySafetyCriticalMissingFields: scorecards.filter(row => row.blockingCategory === 'blocked_by_safety_critical_missing_fields'),
      blockedByEvidenceCriticalMissingFields: scorecards.filter(row => row.blockingCategory === 'blocked_by_evidence_critical_missing_fields'),
      manualReviewNeeded: scorecards.filter(row => row.manualReviewNeeded),
      readyForNextStage: scorecards.filter(row => row.readyState === 'ready_for_next_stage'),
    },
    scorecards,
  }

  const lines: string[] = [
    '# Completion & Blocker Scorecards',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Scope',
    `- Total scorecards: ${report.summary.totalItems}`,
    `- Item types: ${Object.entries(report.summary.byItemType)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ')}`,
    '',
    '## Highest-completion items',
    '| itemType | itemId | completionPercent | readyState |',
    '| --- | --- | ---: | --- |',
  ]

  for (const row of report.summary.topCompletionItems.slice(0, 10)) {
    lines.push(`| ${row.itemType} | ${row.itemId} | ${row.completionPercent.toFixed(2)} | ${row.readyState} |`)
  }

  lines.push('', '## Most blocked items', '| itemType | itemId | blockingCategory | blocker details |', '| --- | --- | --- | --- |')
  for (const row of report.summary.mostBlockedItems.slice(0, 10)) {
    lines.push(`| ${row.itemType} | ${row.itemId} | ${row.blockingCategory} | ${row.blockerDetails.join('; ') || 'n/a'} |`)
  }

  lines.push('', '## Blocker hotspots', '| blocker category | count |', '| --- | ---: |')
  for (const row of report.summary.blockerHotspots) {
    lines.push(`| ${row.blockingCategory} | ${row.count} |`)
  }

  lines.push(
    '',
    '## Practical buckets',
    `- nearly complete: ${report.groupedBuckets.nearlyComplete.length}`,
    `- blocked by metadata: ${report.groupedBuckets.blockedByMetadata.length}`,
    `- blocked by source scarcity: ${report.groupedBuckets.blockedBySourceScarcity.length}`,
    `- blocked by safety-critical missing fields: ${report.groupedBuckets.blockedBySafetyCriticalMissingFields.length}`,
    `- blocked by evidence-critical missing fields: ${report.groupedBuckets.blockedByEvidenceCriticalMissingFields.length}`,
    `- manual review needed: ${report.groupedBuckets.manualReviewNeeded.length}`,
    `- ready for next stage: ${report.groupedBuckets.readyForNextStage.length}`,
  )

  lines.push('', '## Where progress is stalling hardest', '| blocker category | count |', '| --- | ---: |')
  for (const row of report.summary.blockerHotspots.slice(0, 5)) {
    lines.push(`| ${row.blockingCategory} | ${row.count} |`)
  }

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(OUTPUT_MD, `${lines.join('\n')}\n`, 'utf8')

  console.log(`Wrote ${path.relative(ROOT, OUTPUT_JSON)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_MD)}`)
}

run()
