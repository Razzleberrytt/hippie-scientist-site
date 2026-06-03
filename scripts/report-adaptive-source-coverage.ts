import fs from 'node:fs'
import path from 'node:path'

type CompletionState = 'complete' | 'partial' | 'missing_critical' | 'blocked_manual_review'

type CompletionMetrics = {
  totalRequiredFields: number
  completedRequiredFields: number
  missingRequiredFields: string[]
  completionPercent: number
  completionState: CompletionState
  criticalMissingFields: string[]
  optionalFieldsCompleted: number
  topicCoverageCompleted: number
  topicCoverageTotal: number
}

type SourceIntakeTask = {
  intakeTaskId: string
  itemType: string
  entitySlug: string | null
  surfaceId: string | null
  topicType: string
  safetyCritical: boolean
  sourceGapType: string
  recommendedSourceClasses: string[]
  completion?: CompletionMetrics
  adaptiveRetryAttempts?: Array<{
    pass: string
    relaxedConstraints: string[]
    whyAllowed: string
    unresolvedRequiredFields: string[]
  }>
  unresolvedAfterRetries?: string[]
}

type SourceCandidate = Record<string, unknown> & {
  candidateSourceId: string
  intakeTaskId: string
  relatedTopicGaps?: string[]
}

type SourceRegistryRow = Record<string, unknown> & {
  sourceId: string
}

type AuthoringPack = Record<string, unknown> & {
  authoringPackId: string
  workpackId: string
  entityType: string
  entitySlug: string | null
  surfaceId: string | null
  allowedTopicTypes: string[]
  status: string
}

type Submission = Record<string, unknown> & {
  submissionId: string
  workpackId: string
  authoringPackId: string
  entityType: string
  entitySlug?: string
  surfaceId?: string
  topicType: string
  reviewStatus: string
}

type Workpack = {
  workpackId: string
  itemType: string
  entitySlug: string | null
  surfaceId: string | null
  requiredTopics: string[]
  missingTopics: string[]
}

type AdaptiveCoverageReport = {
  generatedAt: string
  deterministicModelVersion: string
  sources: Record<string, string>
  summary: {
    entityOrSurfaceCount: number
    manualReviewNeededCount: number
    retryImprovedCount: number
  }
  completionByObject: {
    sourceCandidates: Array<{ id: string; intakeTaskId: string; completion: CompletionMetrics }>
    sourceRegistryEntries: Array<{ id: string; completion: CompletionMetrics }>
    authoringPacks: Array<{ id: string; workpackId: string; completion: CompletionMetrics }>
    enrichmentSubmissions: Array<{ id: string; workpackId: string; completion: CompletionMetrics }>
    entityCoverage: Array<{ id: string; targetType: string; completion: CompletionMetrics; blockingCategories: string[] }>
  }
  retryEscalationByTarget: Array<{
    targetId: string
    intakeTaskId: string
    topicType: string
    improvedAfterRetry: boolean
    unresolvedCategories: string[]
    attempts: Array<{
      pass: string
      relaxedConstraints: string[]
      whyAllowed: string
      unresolvedRequiredFields: string[]
    }>
  }>
}

const ROOT = process.cwd()
const INPUTS = {
  intakeQueue: path.join(ROOT, 'ops', 'reports', 'source-intake-queue.json'),
  sourceCandidates: path.join(ROOT, 'ops', 'source-candidates.json'),
  sourceRegistry: path.join(ROOT, 'public', 'data', 'source-registry.json'),
  authoringPacks: path.join(ROOT, 'ops', 'reports', 'enrichment-authoring-packs.json'),
  submissions: path.join(ROOT, 'ops', 'enrichment-submissions.json'),
  workpacks: path.join(ROOT, 'ops', 'reports', 'enrichment-workpacks.json'),
}

const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'adaptive-source-coverage.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'adaptive-source-coverage.md')

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function buildCompletion(args: { required: string[]; critical: string[]; row: Record<string, unknown>; optional?: string[]; topicCoverage?: { completed: number; total: number } }): CompletionMetrics {
  const missingRequiredFields = args.required.filter(field => {
    const value = args.row[field]
    if (Array.isArray(value)) return value.length === 0
    return value === null || value === undefined || String(value).trim() === ''
  })
  const criticalMissingFields = args.critical.filter(field => missingRequiredFields.includes(field))
  const completedRequiredFields = args.required.length - missingRequiredFields.length
  const completionPercent = args.required.length === 0 ? 100 : Number(((completedRequiredFields / args.required.length) * 100).toFixed(2))
  const completionState: CompletionState =
    criticalMissingFields.length > 0
      ? 'missing_critical'
      : missingRequiredFields.length === 0
        ? 'complete'
        : 'partial'

  const optional = args.optional || []
  const optionalFieldsCompleted = optional.filter(field => {
    const value = args.row[field]
    if (Array.isArray(value)) return value.length > 0
    return value !== null && value !== undefined && String(value).trim() !== ''
  }).length

  return {
    totalRequiredFields: args.required.length,
    completedRequiredFields,
    missingRequiredFields,
    completionPercent,
    completionState,
    criticalMissingFields,
    optionalFieldsCompleted,
    topicCoverageCompleted: args.topicCoverage?.completed || 0,
    topicCoverageTotal: args.topicCoverage?.total || 0,
  }
}

function categoryForTopic(topic: string): string | null {
  if (topic === 'safety') return 'safety-critical'
  if (topic === 'evidence') return 'evidence-critical'
  if (topic === 'mechanism' || topic === 'constituent') return 'mechanism-critical'
  return null
}

function run() {
  const intake = readJson<{ tasks: SourceIntakeTask[] }>(INPUTS.intakeQueue)
  const sourceCandidates = readJson<SourceCandidate[]>(INPUTS.sourceCandidates)
  const sourceRegistry = readJson<SourceRegistryRow[]>(INPUTS.sourceRegistry)
  const authoringPacks = readJson<{ authoringPacks: AuthoringPack[] }>(INPUTS.authoringPacks)
  const submissions = readJson<Submission[]>(INPUTS.submissions)
  const workpacks = readJson<{ workpacks: Workpack[] }>(INPUTS.workpacks)

  const candidateCompletion = sourceCandidates
    .map(candidate => ({
      id: candidate.candidateSourceId,
      intakeTaskId: candidate.intakeTaskId,
      completion: buildCompletion({
        required: ['title', 'sourceType', 'sourceClass', 'evidenceClass', 'publicationStatus', 'proposedReliabilityTier', 'reviewStatus', 'active'],
        critical: ['sourceClass', 'evidenceClass', 'publicationStatus', 'reviewStatus'],
        optional: ['language', 'organization', 'citationText', 'studyDesign', 'reviewer', 'reviewedAt'],
        row: candidate,
        topicCoverage: { completed: Array.isArray(candidate.relatedTopicGaps) ? candidate.relatedTopicGaps.length : 0, total: 1 },
      }),
    }))
    .sort((a, b) => a.id.localeCompare(b.id))

  const registryCompletion = sourceRegistry
    .map(row => ({
      id: row.sourceId,
      completion: buildCompletion({
        required: ['sourceId', 'title', 'sourceType', 'sourceClass', 'evidenceClass', 'language', 'publicationStatus', 'reliabilityTier', 'reviewer', 'reviewedAt', 'active'],
        critical: ['sourceClass', 'evidenceClass', 'publicationStatus', 'reliabilityTier', 'reviewer', 'reviewedAt', 'active'],
        optional: ['organization', 'jurisdiction', 'doi', 'pmid', 'canonicalUrl', 'monographId', 'isbn'],
        row,
      }),
    }))
    .sort((a, b) => a.id.localeCompare(b.id))

  const authoringCompletion = authoringPacks.authoringPacks
    .map(pack => ({
      id: pack.authoringPackId,
      workpackId: pack.workpackId,
      completion: buildCompletion({
        required: ['authoringPackId', 'workpackId', 'sourceId', 'allowedTopicTypes', 'allowedClaimTypes', 'requiredEntryFields', 'requiredGovernanceChecks', 'status'],
        critical: ['sourceId', 'allowedTopicTypes', 'requiredEntryFields', 'requiredGovernanceChecks', 'status'],
        optional: ['entitySlug', 'surfaceId', 'notesForContractor'],
        row: pack,
        topicCoverage: { completed: pack.allowedTopicTypes.length, total: pack.allowedTopicTypes.length },
      }),
    }))
    .sort((a, b) => a.id.localeCompare(b.id))

  const submissionCompletion = submissions
    .map(submission => ({
      id: submission.submissionId,
      workpackId: submission.workpackId,
      completion: buildCompletion({
        required: ['submissionId', 'authoringPackId', 'workpackId', 'sourceId', 'topicType', 'claimType', 'evidenceClass', 'findingTextShort', 'findingTextNormalized', 'reviewStatus', 'active'],
        critical: ['sourceId', 'topicType', 'claimType', 'evidenceClass', 'findingTextNormalized', 'reviewStatus'],
        optional: ['reviewer', 'reviewedAt', 'editorialStatus', 'uncertaintyNote'],
        row: submission,
        topicCoverage: { completed: 1, total: 1 },
      }),
    }))
    .sort((a, b) => a.id.localeCompare(b.id))

  const targetRows = new Map<string, { targetType: string; requiredTopics: Set<string>; missingTopics: Set<string>; blockingCategories: Set<string> }>()
  for (const workpack of workpacks.workpacks) {
    const targetId = workpack.entitySlug || workpack.surfaceId || workpack.workpackId
    const key = `${workpack.itemType}:${targetId}`
    const bucket =
      targetRows.get(key) ||
      ({ targetType: workpack.itemType, requiredTopics: new Set<string>(), missingTopics: new Set<string>(), blockingCategories: new Set<string>() } as const)
    for (const topic of workpack.requiredTopics || []) bucket.requiredTopics.add(topic)
    for (const topic of workpack.missingTopics || []) {
      bucket.missingTopics.add(topic)
      const category = categoryForTopic(topic)
      if (category) bucket.blockingCategories.add(category)
    }
    targetRows.set(key, bucket)
  }

  const entityCoverage = Array.from(targetRows.entries())
    .map(([id, row]) => ({
      id,
      targetType: row.targetType,
      blockingCategories: Array.from(row.blockingCategories).sort(),
      completion: {
        totalRequiredFields: row.requiredTopics.size,
        completedRequiredFields: Math.max(row.requiredTopics.size - row.missingTopics.size, 0),
        missingRequiredFields: Array.from(row.missingTopics).sort(),
        completionPercent:
          row.requiredTopics.size === 0
            ? 100
            : Number((((row.requiredTopics.size - row.missingTopics.size) / row.requiredTopics.size) * 100).toFixed(2)),
        completionState:
          row.missingTopics.size === 0
            ? 'complete'
            : row.blockingCategories.size > 0
              ? 'missing_critical'
              : 'partial',
        criticalMissingFields: Array.from(row.missingTopics)
          .filter(topic => Boolean(categoryForTopic(topic)))
          .sort(),
        optionalFieldsCompleted: 0,
        topicCoverageCompleted: Math.max(row.requiredTopics.size - row.missingTopics.size, 0),
        topicCoverageTotal: row.requiredTopics.size,
      } satisfies CompletionMetrics,
    }))
    .sort((a, b) => a.id.localeCompare(b.id))

  const retryEscalationByTarget = intake.tasks
    .map(task => {
      const targetId = task.entitySlug || task.surfaceId || task.intakeTaskId
      const attempts = task.adaptiveRetryAttempts || []
      const improvedAfterRetry = attempts.some(attempt => attempt.pass !== 'pass_1_strict_high_confidence' && attempt.unresolvedRequiredFields.length === 0)
      return {
        targetId,
        intakeTaskId: task.intakeTaskId,
        topicType: task.topicType,
        improvedAfterRetry,
        unresolvedCategories: task.unresolvedAfterRetries || [],
        attempts: attempts.map(attempt => ({
          pass: attempt.pass,
          relaxedConstraints: attempt.relaxedConstraints,
          whyAllowed: attempt.whyAllowed,
          unresolvedRequiredFields: attempt.unresolvedRequiredFields,
        })),
      }
    })
    .sort((a, b) => a.intakeTaskId.localeCompare(b.intakeTaskId))

  const manualReviewNeededCount = retryEscalationByTarget.filter(row => row.unresolvedCategories.length > 0).length
  const retryImprovedCount = retryEscalationByTarget.filter(row => row.improvedAfterRetry).length

  const report: AdaptiveCoverageReport = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'adaptive-source-coverage-v1',
    sources: Object.fromEntries(Object.entries(INPUTS).map(([key, value]) => [key, path.relative(ROOT, value)])),
    summary: {
      entityOrSurfaceCount: entityCoverage.length,
      manualReviewNeededCount,
      retryImprovedCount,
    },
    completionByObject: {
      sourceCandidates: candidateCompletion,
      sourceRegistryEntries: registryCompletion,
      authoringPacks: authoringCompletion,
      enrichmentSubmissions: submissionCompletion,
      entityCoverage,
    },
    retryEscalationByTarget,
  }

  const lines: string[] = [
    '# Adaptive Source Coverage Report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Summary',
    `- entity/surface coverage rows: ${report.summary.entityOrSurfaceCount}`,
    `- retry-improved targets: ${report.summary.retryImprovedCount}`,
    `- unresolved manual-review targets: ${report.summary.manualReviewNeededCount}`,
    '',
    '## Completion snapshots',
    `- source candidates with missing critical fields: ${candidateCompletion.filter(row => row.completion.criticalMissingFields.length > 0).length}`,
    `- registry entries with missing critical fields: ${registryCompletion.filter(row => row.completion.criticalMissingFields.length > 0).length}`,
    `- authoring packs missing critical fields: ${authoringCompletion.filter(row => row.completion.criticalMissingFields.length > 0).length}`,
    `- submissions missing critical fields: ${submissionCompletion.filter(row => row.completion.criticalMissingFields.length > 0).length}`,
    '',
    '## Retry escalation outcomes (top 40)',
    '| intakeTaskId | target | topic | improved after retry | unresolved |',
    '| --- | --- | --- | --- | --- |',
  ]

  for (const row of retryEscalationByTarget.slice(0, 40)) {
    lines.push(
      `| ${row.intakeTaskId} | ${row.targetId} | ${row.topicType} | ${row.improvedAfterRetry ? 'yes' : 'no'} | ${row.unresolvedCategories.join(', ') || 'none'} |`,
    )
  }

  lines.push('', '## Governance notes', '- Retry escalation does not auto-approve source candidates; registry review and validation gates remain required.')
  lines.push('- Pass 4 explicitly marks unresolved tasks for manual review so missing fields never appear complete.')

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(OUTPUT_MD, `${lines.join('\n')}\n`, 'utf8')

  console.log(`Wrote ${path.relative(ROOT, OUTPUT_JSON)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_MD)}`)
}

run()
