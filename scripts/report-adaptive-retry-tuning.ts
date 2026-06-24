import fs from 'node:fs'
import path from 'node:path'

type RetryAttempt = {
  pass: string
  relaxedConstraints: string[]
  matchedCandidateIds: string[]
  unresolvedRequiredFields: string[]
}

type SourceIntakeTask = {
  intakeTaskId: string
  itemType: string
  topicType: string
  sourceGapType: string
  adaptiveRetryAttempts: RetryAttempt[]
  unresolvedAfterRetries: string[]
}

type SourceIntakeQueueReport = {
  generatedAt: string
  deterministicModelVersion: string
  tasks: SourceIntakeTask[]
}

type CandidateAssessment = {
  candidateSourceId: string
  declaredReviewStatus: string
  derivedReviewStatus: string
  outcomeCategory: string
  metadataIssues: string[]
  duplicateMatches: Array<{ sourceId: string; matchType: string }>
}

type CandidateReviewReport = {
  generatedAt: string
  deterministicModelVersion: string
  assessments: CandidateAssessment[]
}

type CompletionMetrics = {
  missingRequiredFields: string[]
  criticalMissingFields: string[]
}

type AdaptiveCoverageReport = {
  generatedAt: string
  deterministicModelVersion: string
  completionByObject: {
    sourceCandidates: Array<{ id: string; intakeTaskId: string; completion: CompletionMetrics }>
    sourceRegistryEntries: Array<{ id: string; completion: CompletionMetrics }>
    authoringPacks: Array<{ id: string; workpackId: string; completion: CompletionMetrics }>
    enrichmentSubmissions: Array<{ id: string; workpackId: string; completion: CompletionMetrics }>
    entityCoverage: Array<{ id: string; targetType: string; completion: CompletionMetrics }>
  }
}

type StageAggregate = {
  retryStage: string
  attempts: number
  completionGain: number
  completionGainRate: number
  resolvedAtStageCount: number
  successRate: number
  duplicateRate: number
  metadataFailureRate: number
  manualReviewRate: number
  unresolvedCriticalFieldRate: number
  avgMatchedCandidates: number
  matchedCandidates: number
  unresolvedFieldCounts: Record<string, number>
  entityTypePatterns: Record<string, { attempts: number; successRate: number; manualReviewRate: number }>
  topicTypePatterns: Record<string, { attempts: number; successRate: number; manualReviewRate: number }>
  sourceGapPatterns: Record<string, { attempts: number; successRate: number; manualReviewRate: number }>
}

type RetryTuningReport = {
  generatedAt: string
  deterministicModelVersion: string
  sources: Record<string, string>
  summary: {
    totalTasks: number
    strongestStages: Array<{ retryStage: string; successRate: number; completionGainRate: number }>
    weakestStages: Array<{ retryStage: string; successRate: number; duplicateRate: number; metadataFailureRate: number }>
    hardestFieldCategories: Array<{ fieldCategory: string; unresolvedCount: number }>
  }
  deterministicOutcomeModel: {
    dimensions: string[]
    stageOutcomes: StageAggregate[]
    relaxedConstraintOutcomes: Array<{
      relaxedConstraint: string
      attempts: number
      successRate: number
      completionGainRate: number
      duplicateRate: number
      metadataFailureRate: number
      manualReviewRate: number
      avgMatchedCandidates: number
      classification: 'helpful' | 'noisy' | 'mixed'
    }>
    unresolvedFieldCategories: Array<{ fieldCategory: string; unresolvedCount: number }>
    completionMetricHotspots: Array<{ objectType: string; field: string; missingCount: number; criticalMissingCount: number }>
  }
  recommendations: Array<{
    action: 'keep_stage_as_is' | 'tighten_stage' | 'broaden_stage' | 'reorder_stages' | 'stop_earlier' | 'escalate_manual_review_sooner'
    appliesTo: string
    rationale: string
    trigger: string
  }>
}

const ROOT = process.cwd()
const INPUTS = {
  intakeQueue: path.join(ROOT, 'ops', 'reports', 'source-intake-queue.json'),
  candidateReview: path.join(ROOT, 'ops', 'reports', 'source-candidate-review.json'),
  adaptiveCoverage: path.join(ROOT, 'ops', 'reports', 'adaptive-source-coverage.json'),
  enrichmentWorkpacks: path.join(ROOT, 'ops', 'reports', 'enrichment-workpacks.json'),
  enrichmentBacklog: path.join(ROOT, 'ops', 'reports', 'enrichment-wave-target-proposals.json'),
}

const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'adaptive-retry-tuning.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'adaptive-retry-tuning.md')

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function sortedRecord<T>(input: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(input).sort(([a], [b]) => a.localeCompare(b)))
}

function categorizeField(field: string): string {
  if (field.includes('manual_review_required')) return 'manual_review'
  if (field.includes('primary_identifier') || field.includes('doi') || field.includes('pmid') || field.includes('canonicalUrl') || field.includes('isbn')) return 'identifier'
  if (field.includes('sourceClass') || field.includes('evidenceClass') || field.includes('studyDesign')) return 'classification'
  if (field.includes('title') || field.includes('citation') || field.includes('authors')) return 'bibliographic'
  if (field.includes('reviewStatus') || field.includes('reviewer') || field.includes('reviewedAt')) return 'review_metadata'
  return 'other'
}

function isDuplicate(assessment: CandidateAssessment | undefined): boolean {
  if (!assessment) return false
  return (
    assessment.outcomeCategory === 'duplicate_of_existing' ||
    assessment.declaredReviewStatus === 'duplicate_of_existing' ||
    assessment.derivedReviewStatus === 'duplicate_of_existing' ||
    assessment.duplicateMatches.length > 0
  )
}

function isMetadataFailure(assessment: CandidateAssessment | undefined): boolean {
  if (!assessment) return false
  return assessment.outcomeCategory === 'insufficient_metadata' || assessment.derivedReviewStatus === 'needs_metadata' || assessment.metadataIssues.length > 0
}

function buildCompletionHotspots(coverage: AdaptiveCoverageReport) {
  const buckets = new Map<string, { objectType: string; field: string; missingCount: number; criticalMissingCount: number }>()

  const consume = (objectType: string, rows: Array<{ completion: CompletionMetrics }>) => {
    for (const row of rows) {
      for (const field of row.completion.missingRequiredFields) {
        const key = `${objectType}:${field}`
        const entry = buckets.get(key) || { objectType, field, missingCount: 0, criticalMissingCount: 0 }
        entry.missingCount += 1
        if (row.completion.criticalMissingFields.includes(field)) entry.criticalMissingCount += 1
        buckets.set(key, entry)
      }
    }
  }

  consume('sourceCandidate', coverage.completionByObject.sourceCandidates)
  consume('sourceRegistryEntry', coverage.completionByObject.sourceRegistryEntries)
  consume('authoringPack', coverage.completionByObject.authoringPacks)
  consume('enrichmentSubmission', coverage.completionByObject.enrichmentSubmissions)
  consume('entityCoverage', coverage.completionByObject.entityCoverage)

  return Array.from(buckets.values())
    .sort((a, b) => b.criticalMissingCount - a.criticalMissingCount || b.missingCount - a.missingCount || a.field.localeCompare(b.field))
    .slice(0, 20)
}

function run() {
  const intake = readJson<SourceIntakeQueueReport>(INPUTS.intakeQueue)
  const candidateReview = readJson<CandidateReviewReport>(INPUTS.candidateReview)
  const adaptiveCoverage = readJson<AdaptiveCoverageReport>(INPUTS.adaptiveCoverage)

  const assessmentByCandidateId = new Map(candidateReview.assessments.map(row => [row.candidateSourceId, row]))
  const stageStats = new Map<
    string,
    {
      attempts: number
      gain: number
      resolvedAtStage: number
      matchedCandidates: number
      duplicateCandidates: number
      metadataFailures: number
      manualReviewCount: number
      unresolvedCriticalCount: number
      unresolvedFieldCounts: Record<string, number>
      byEntity: Record<string, { attempts: number; successes: number; manualReviews: number }>
      byTopic: Record<string, { attempts: number; successes: number; manualReviews: number }>
      byGap: Record<string, { attempts: number; successes: number; manualReviews: number }>
    }
  >()

  const constraintStats = new Map<
    string,
    {
      attempts: number
      gain: number
      successes: number
      matched: number
      duplicates: number
      metadataFailures: number
      manualReviews: number
    }
  >()

  const unresolvedFieldCategories: Record<string, number> = {}

  for (const task of intake.tasks) {
    let previousUnresolvedCount = Number.POSITIVE_INFINITY
    for (const [index, attempt] of task.adaptiveRetryAttempts.entries()) {
      const currentUnresolvedCount = attempt.unresolvedRequiredFields.length
      const gained = Math.max(previousUnresolvedCount - currentUnresolvedCount, 0)
      const resolved = currentUnresolvedCount === 0 && previousUnresolvedCount > 0
      const manualReview = attempt.unresolvedRequiredFields.includes('manual_review_required')
      const unresolvedCritical = attempt.unresolvedRequiredFields.length > 0

      const stage =
        stageStats.get(attempt.pass) || {
          attempts: 0,
          gain: 0,
          resolvedAtStage: 0,
          matchedCandidates: 0,
          duplicateCandidates: 0,
          metadataFailures: 0,
          manualReviewCount: 0,
          unresolvedCriticalCount: 0,
          unresolvedFieldCounts: {},
          byEntity: {},
          byTopic: {},
          byGap: {},
        }

      stage.attempts += 1
      stage.gain += Number.isFinite(gained) ? gained : 0
      stage.resolvedAtStage += resolved ? 1 : 0
      stage.matchedCandidates += attempt.matchedCandidateIds.length
      stage.manualReviewCount += manualReview ? 1 : 0
      stage.unresolvedCriticalCount += unresolvedCritical ? 1 : 0

      for (const field of attempt.unresolvedRequiredFields) {
        stage.unresolvedFieldCounts[field] = (stage.unresolvedFieldCounts[field] || 0) + 1
        const category = categorizeField(field)
        unresolvedFieldCategories[category] = (unresolvedFieldCategories[category] || 0) + 1
      }

      for (const candidateId of attempt.matchedCandidateIds) {
        const assessment = assessmentByCandidateId.get(candidateId)
        if (isDuplicate(assessment)) stage.duplicateCandidates += 1
        if (isMetadataFailure(assessment)) stage.metadataFailures += 1
      }

      const entityEntry = stage.byEntity[task.itemType] || { attempts: 0, successes: 0, manualReviews: 0 }
      entityEntry.attempts += 1
      entityEntry.successes += resolved ? 1 : 0
      entityEntry.manualReviews += manualReview ? 1 : 0
      stage.byEntity[task.itemType] = entityEntry

      const topicEntry = stage.byTopic[task.topicType] || { attempts: 0, successes: 0, manualReviews: 0 }
      topicEntry.attempts += 1
      topicEntry.successes += resolved ? 1 : 0
      topicEntry.manualReviews += manualReview ? 1 : 0
      stage.byTopic[task.topicType] = topicEntry

      const gapEntry = stage.byGap[task.sourceGapType] || { attempts: 0, successes: 0, manualReviews: 0 }
      gapEntry.attempts += 1
      gapEntry.successes += resolved ? 1 : 0
      gapEntry.manualReviews += manualReview ? 1 : 0
      stage.byGap[task.sourceGapType] = gapEntry

      stageStats.set(attempt.pass, stage)

      const constraints = attempt.relaxedConstraints.length > 0 ? attempt.relaxedConstraints : ['(none)']
      for (const relaxedConstraint of constraints) {
        const constraint =
          constraintStats.get(relaxedConstraint) || {
            attempts: 0,
            gain: 0,
            successes: 0,
            matched: 0,
            duplicates: 0,
            metadataFailures: 0,
            manualReviews: 0,
          }
        constraint.attempts += 1
        constraint.gain += Number.isFinite(gained) ? gained : 0
        constraint.successes += resolved ? 1 : 0
        constraint.matched += attempt.matchedCandidateIds.length
        constraint.manualReviews += manualReview ? 1 : 0
        for (const candidateId of attempt.matchedCandidateIds) {
          const assessment = assessmentByCandidateId.get(candidateId)
          if (isDuplicate(assessment)) constraint.duplicates += 1
          if (isMetadataFailure(assessment)) constraint.metadataFailures += 1
        }
        constraintStats.set(relaxedConstraint, constraint)
      }

      previousUnresolvedCount = currentUnresolvedCount
      if (index === task.adaptiveRetryAttempts.length - 1 && task.unresolvedAfterRetries.length > 0) {
        unresolvedFieldCategories.manual_review = (unresolvedFieldCategories.manual_review || 0) + 1
      }
    }
  }

  const stageOutcomes: StageAggregate[] = Array.from(stageStats.entries())
    .map(([retryStage, stats]) => {
      const matched = stats.matchedCandidates
      const toPattern = (record: Record<string, { attempts: number; successes: number; manualReviews: number }>) =>
        sortedRecord(
          Object.fromEntries(
            Object.entries(record).map(([key, row]) => [
              key,
              {
                attempts: row.attempts,
                successRate: Number((row.successes / row.attempts).toFixed(4)),
                manualReviewRate: Number((row.manualReviews / row.attempts).toFixed(4)),
              },
            ]),
          ),
        )

      return {
        retryStage,
        attempts: stats.attempts,
        completionGain: stats.gain,
        completionGainRate: Number((stats.gain / stats.attempts).toFixed(4)),
        resolvedAtStageCount: stats.resolvedAtStage,
        successRate: Number((stats.resolvedAtStage / stats.attempts).toFixed(4)),
        duplicateRate: Number((matched === 0 ? 0 : stats.duplicateCandidates / matched).toFixed(4)),
        metadataFailureRate: Number((matched === 0 ? 0 : stats.metadataFailures / matched).toFixed(4)),
        manualReviewRate: Number((stats.manualReviewCount / stats.attempts).toFixed(4)),
        unresolvedCriticalFieldRate: Number((stats.unresolvedCriticalCount / stats.attempts).toFixed(4)),
        avgMatchedCandidates: Number((stats.matchedCandidates / stats.attempts).toFixed(4)),
        matchedCandidates: stats.matchedCandidates,
        unresolvedFieldCounts: sortedRecord(stats.unresolvedFieldCounts),
        entityTypePatterns: toPattern(stats.byEntity),
        topicTypePatterns: toPattern(stats.byTopic),
        sourceGapPatterns: toPattern(stats.byGap),
      }
    })
    .sort((a, b) => a.retryStage.localeCompare(b.retryStage))

  const relaxedConstraintOutcomes = Array.from(constraintStats.entries())
    .map(([relaxedConstraint, stats]) => {
      const successRate = stats.successes / stats.attempts
      const duplicateRate = stats.matched === 0 ? 0 : stats.duplicates / stats.matched
      const metadataFailureRate = stats.matched === 0 ? 0 : stats.metadataFailures / stats.matched
      let classification: 'helpful' | 'noisy' | 'mixed' = 'mixed'
      if (successRate >= 0.2 && duplicateRate <= 0.35 && metadataFailureRate <= 0.35) classification = 'helpful'
      else if (successRate <= 0.05 && (duplicateRate >= 0.5 || metadataFailureRate >= 0.5)) classification = 'noisy'
      return {
        relaxedConstraint,
        attempts: stats.attempts,
        successRate: Number(successRate.toFixed(4)),
        completionGainRate: Number((stats.gain / stats.attempts).toFixed(4)),
        duplicateRate: Number(duplicateRate.toFixed(4)),
        metadataFailureRate: Number(metadataFailureRate.toFixed(4)),
        manualReviewRate: Number((stats.manualReviews / stats.attempts).toFixed(4)),
        avgMatchedCandidates: Number((stats.matched / stats.attempts).toFixed(4)),
        classification,
      }
    })
    .sort((a, b) => b.successRate - a.successRate || a.relaxedConstraint.localeCompare(b.relaxedConstraint))

  const unresolvedFieldCategoriesByCount = Object.entries(unresolvedFieldCategories)
    .map(([fieldCategory, unresolvedCount]) => ({ fieldCategory, unresolvedCount }))
    .sort((a, b) => b.unresolvedCount - a.unresolvedCount || a.fieldCategory.localeCompare(b.fieldCategory))

  const completionMetricHotspots = buildCompletionHotspots(adaptiveCoverage)

  const strongestStages = [...stageOutcomes]
    .sort((a, b) => b.successRate - a.successRate || b.completionGainRate - a.completionGainRate)
    .slice(0, 2)
    .map(row => ({ retryStage: row.retryStage, successRate: row.successRate, completionGainRate: row.completionGainRate }))

  const weakestStages = [...stageOutcomes]
    .sort((a, b) => a.successRate - b.successRate || b.duplicateRate - a.duplicateRate)
    .slice(0, 2)
    .map(row => ({ retryStage: row.retryStage, successRate: row.successRate, duplicateRate: row.duplicateRate, metadataFailureRate: row.metadataFailureRate }))

  const recommendations: RetryTuningReport['recommendations'] = []
  for (const stage of stageOutcomes) {
    if (stage.retryStage === 'pass_1_strict_high_confidence') {
      recommendations.push({
        action: 'keep_stage_as_is',
        appliesTo: stage.retryStage,
        rationale: 'Baseline strict pass is required to preserve deterministic high-confidence sourcing before relaxation.',
        trigger: 'Always run first for every intake task.',
      })
      continue
    }

    if (stage.successRate <= 0.05 && stage.manualReviewRate >= 0.8) {
      recommendations.push({
        action: 'stop_earlier',
        appliesTo: stage.retryStage,
        rationale: 'Stage rarely resolves fields and mostly routes to manual review; running it for all tasks adds queue latency.',
        trigger: 'Skip this stage when unresolved fields are only identifier + classification after prior stage.',
      })
      continue
    }

    if (stage.duplicateRate >= 0.45 || stage.metadataFailureRate >= 0.45) {
      recommendations.push({
        action: 'tighten_stage',
        appliesTo: stage.retryStage,
        rationale: 'Candidate yield is noisy, with high duplicate or metadata failure rates under current relaxed constraints.',
        trigger: 'Require at least one primary identifier before candidate acceptance in this stage.',
      })
      continue
    }

    if (stage.successRate >= 0.2 && stage.manualReviewRate <= 0.4) {
      recommendations.push({
        action: 'broaden_stage',
        appliesTo: stage.retryStage,
        rationale: 'Stage demonstrates meaningful completion gain with manageable noise and can absorb more targeted fallback classes.',
        trigger: 'Apply to mechanism/constituent gaps before broader stage execution.',
      })
    }
  }

  const manualReviewHeavyTopics = stageOutcomes
    .flatMap(stage => Object.entries(stage.topicTypePatterns).map(([topic, row]) => ({ topic, stage: stage.retryStage, manualReviewRate: row.manualReviewRate, attempts: row.attempts })))
    .filter(row => row.attempts >= 4 && row.manualReviewRate >= 0.75)

  for (const row of manualReviewHeavyTopics.slice(0, 3)) {
    recommendations.push({
      action: 'escalate_manual_review_sooner',
      appliesTo: `${row.stage}:${row.topic}`,
      rationale: 'Topic/stage combination is consistently unresolved and consumes retries with little deterministic gain.',
      trigger: `Escalate after previous stage when topicType=${row.topic} and unresolved critical fields persist.`,
    })
  }

  if (stageOutcomes.some(stage => stage.retryStage === 'pass_3_broader_approved_classes')) {
    recommendations.push({
      action: 'reorder_stages',
      appliesTo: 'pass_2_expand_high_quality_classes -> pass_3_broader_approved_classes',
      rationale: 'Run broader pass only for topics where pass_2 has non-trivial success to reduce low-value broad matching.',
      trigger: 'Gate pass_3 behind pass_2 topic-level success-rate threshold >= 0.10.',
    })
  }

  const report: RetryTuningReport = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'adaptive-retry-tuning-v1',
    sources: Object.fromEntries(Object.entries(INPUTS).map(([k, v]) => [k, path.relative(ROOT, v)])),
    summary: {
      totalTasks: intake.tasks.length,
      strongestStages,
      weakestStages,
      hardestFieldCategories: unresolvedFieldCategoriesByCount.slice(0, 6),
    },
    deterministicOutcomeModel: {
      dimensions: [
        'retryStage',
        'attempts',
        'completionGain',
        'duplicateRate',
        'metadataFailureRate',
        'manualReviewRate',
        'unresolvedCriticalFieldRate',
        'entityTypePatterns',
        'topicTypePatterns',
      ],
      stageOutcomes,
      relaxedConstraintOutcomes,
      unresolvedFieldCategories: unresolvedFieldCategoriesByCount,
      completionMetricHotspots,
    },
    recommendations,
  }

  const lines: string[] = [
    '# Adaptive Retry Tuning Report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Deterministic outcome dimensions',
    report.deterministicOutcomeModel.dimensions.map(row => `- ${row}`).join('\n'),
    '',
    '## Retry stage outcomes',
    '| retryStage | attempts | successRate | completionGainRate | duplicateRate | metadataFailureRate | manualReviewRate | unresolvedCriticalFieldRate |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ]

  for (const stage of report.deterministicOutcomeModel.stageOutcomes) {
    lines.push(
      `| ${stage.retryStage} | ${stage.attempts} | ${stage.successRate} | ${stage.completionGainRate} | ${stage.duplicateRate} | ${stage.metadataFailureRate} | ${stage.manualReviewRate} | ${stage.unresolvedCriticalFieldRate} |`,
    )
  }

  lines.push('', '## Relaxed constraint outcomes', '| relaxedConstraint | attempts | classification | successRate | duplicateRate | metadataFailureRate | manualReviewRate |', '| --- | ---: | --- | ---: | ---: | ---: | ---: |')
  for (const row of report.deterministicOutcomeModel.relaxedConstraintOutcomes) {
    lines.push(
      `| ${row.relaxedConstraint} | ${row.attempts} | ${row.classification} | ${row.successRate} | ${row.duplicateRate} | ${row.metadataFailureRate} | ${row.manualReviewRate} |`,
    )
  }

  lines.push('', '## Stubborn incomplete field categories', '| fieldCategory | unresolvedCount |', '| --- | ---: |')
  for (const row of report.summary.hardestFieldCategories) {
    lines.push(`| ${row.fieldCategory} | ${row.unresolvedCount} |`)
  }

  lines.push('', '## Recommendations', '| action | appliesTo | trigger | rationale |', '| --- | --- | --- | --- |')
  for (const rec of report.recommendations) {
    lines.push(`| ${rec.action} | ${rec.appliesTo} | ${rec.trigger} | ${rec.rationale} |`)
  }

  lines.push('', '## Governance guardrail', '- This report is analysis-only and does not modify source-review, submission-review, or publish-gating rules.')

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(OUTPUT_MD, `${lines.join('\n')}\n`, 'utf8')

  console.log(`Wrote ${path.relative(ROOT, OUTPUT_JSON)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_MD)}`)
}

run()
