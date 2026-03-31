import fs from 'node:fs'
import path from 'node:path'

type Submission = {
  submissionId: string
  entityType: 'herb' | 'compound' | 'surface'
  entitySlug?: string
  topicType: string
  evidenceClass: string
  reviewStatus:
    | 'draft_submission'
    | 'needs_validation_fix'
    | 'ready_for_review'
    | 'under_review'
    | 'approved_for_rollup'
    | 'revision_requested'
    | 'rejected'
    | 'deprecated_submission'
}

type Assessment = {
  submissionId: string
  promotable: boolean
  derivedOutcome: string
}

type SubmissionReviewReport = {
  assessments: Assessment[]
}

type WaveTarget = {
  entityType: 'herb' | 'compound'
  entitySlug: string
  highestPriorityMissingTopics: string[]
  criticality: string[]
}

type WaveTargetReport = {
  targets: WaveTarget[]
}

const ROOT = process.cwd()
const SUBMISSIONS_PATH = path.join(ROOT, 'ops', 'enrichment-submissions.json')
const SUBMISSION_REVIEW_REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-submission-review.json')
const SOURCE_WAVE_TARGETS_PATH = path.join(ROOT, 'ops', 'reports', 'source-wave-2-targets.json')
const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'enrichment-wave-2-authoring.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'enrichment-wave-2-authoring.md')

const WAVE_PREFIX = 'sub_wave2-'

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function key(entityType: string, entitySlug: string) {
  return `${entityType}:${entitySlug}`
}

function run() {
  const submissions = readJson<Submission[]>(SUBMISSIONS_PATH)
  const reviewReport = readJson<SubmissionReviewReport>(SUBMISSION_REVIEW_REPORT_PATH)
  const targetsReport = readJson<WaveTargetReport>(SOURCE_WAVE_TARGETS_PATH)

  const waveSubmissions = submissions
    .filter(submission => submission.submissionId.startsWith(WAVE_PREFIX))
    .sort((a, b) => a.submissionId.localeCompare(b.submissionId))

  const reviewBySubmission = new Map(reviewReport.assessments.map(assessment => [assessment.submissionId, assessment]))

  const countsByEntity = new Map<string, number>()
  const countsByTopic = new Map<string, number>()
  const countsByEvidenceClass = new Map<string, number>()
  const countsByReviewStatus = new Map<string, number>()

  const approvedByEntity = new Map<string, Submission[]>()

  for (const submission of waveSubmissions) {
    const entitySlug = submission.entitySlug || 'unknown'
    const entityKey = key(submission.entityType, entitySlug)

    countsByEntity.set(entityKey, (countsByEntity.get(entityKey) || 0) + 1)
    countsByTopic.set(submission.topicType, (countsByTopic.get(submission.topicType) || 0) + 1)
    countsByEvidenceClass.set(submission.evidenceClass, (countsByEvidenceClass.get(submission.evidenceClass) || 0) + 1)
    countsByReviewStatus.set(submission.reviewStatus, (countsByReviewStatus.get(submission.reviewStatus) || 0) + 1)

    if (submission.reviewStatus === 'approved_for_rollup') {
      const bucket = approvedByEntity.get(entityKey) || []
      bucket.push(submission)
      approvedByEntity.set(entityKey, bucket)
    }
  }

  const promotion = {
    approved: 0,
    revisionRequested: 0,
    rejected: 0,
    promoted: 0,
    blocked: 0,
  }

  for (const submission of waveSubmissions) {
    if (submission.reviewStatus === 'approved_for_rollup') promotion.approved += 1
    if (submission.reviewStatus === 'revision_requested') promotion.revisionRequested += 1
    if (submission.reviewStatus === 'rejected') promotion.rejected += 1

    const assessment = reviewBySubmission.get(submission.submissionId)
    if (!assessment) continue
    if (assessment.promotable) promotion.promoted += 1
    else promotion.blocked += 1
  }

  const unresolvedCriticalGaps = targetsReport.targets
    .map(target => {
      const entityKey = key(target.entityType, target.entitySlug)
      const approved = approvedByEntity.get(entityKey) || []
      const covered = new Set<string>()

      for (const row of approved) {
        if (['supported_use', 'unsupported_or_unclear_use', 'conflict_note'].includes(row.topicType)) covered.add('evidence')
        if (
          [
            'interaction',
            'contraindication',
            'adverse_effect',
            'pregnancy_note',
            'lactation_note',
            'pediatric_note',
            'geriatric_note',
            'condition_caution',
            'surgery_caution',
            'medication_class_caution',
          ].includes(row.topicType)
        ) {
          covered.add('safety')
        }
        if (['mechanism', 'pathway', 'receptor_activity', 'enzyme_interaction', 'transporter_interaction'].includes(row.topicType)) {
          covered.add('mechanism')
        }
        if (['constituent', 'constituent_relationship', 'herb_compound_link', 'compound_origin_note'].includes(row.topicType)) {
          covered.add('constituent')
        }
      }

      const unresolved = target.highestPriorityMissingTopics.filter(topic => !covered.has(topic))
      return {
        entityType: target.entityType,
        entitySlug: target.entitySlug,
        criticality: target.criticality,
        unresolvedCriticalTopics: unresolved,
        stillBlockedFromStrongCoverage: unresolved.length > 0,
      }
    })
    .sort((a, b) => key(a.entityType, a.entitySlug).localeCompare(key(b.entityType, b.entitySlug)))

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'enrichment-wave-2-authoring-v1',
    paths: {
      submissions: path.relative(ROOT, SUBMISSIONS_PATH),
      submissionReview: path.relative(ROOT, SUBMISSION_REVIEW_REPORT_PATH),
      sourceWaveTargets: path.relative(ROOT, SOURCE_WAVE_TARGETS_PATH),
    },
    entitiesEnriched: Array.from(new Set(waveSubmissions.map(row => key(row.entityType, row.entitySlug || 'unknown')))).sort(),
    entryCounts: {
      byEntity: Object.fromEntries(Array.from(countsByEntity.entries()).sort((a, b) => a[0].localeCompare(b[0]))),
      byTopicType: Object.fromEntries(Array.from(countsByTopic.entries()).sort((a, b) => a[0].localeCompare(b[0]))),
      byEvidenceClass: Object.fromEntries(Array.from(countsByEvidenceClass.entries()).sort((a, b) => a[0].localeCompare(b[0]))),
      byReviewStatus: Object.fromEntries(Array.from(countsByReviewStatus.entries()).sort((a, b) => a[0].localeCompare(b[0]))),
    },
    submissionOutcomes: promotion,
    unresolvedCriticalGaps,
  }

  const md: string[] = [
    '# Enrichment Wave 2 Authoring',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Entities enriched in this wave',
    ...report.entitiesEnriched.map(entity => `- ${entity}`),
    '',
    '## Entry counts by entity',
  ]

  for (const [entity, count] of Object.entries(report.entryCounts.byEntity)) {
    md.push(`- ${entity}: ${count}`)
  }

  md.push('', '## Entry counts by topic type')
  for (const [topic, count] of Object.entries(report.entryCounts.byTopicType)) {
    md.push(`- ${topic}: ${count}`)
  }

  md.push('', '## Entry counts by evidence class')
  for (const [evidenceClass, count] of Object.entries(report.entryCounts.byEvidenceClass)) {
    md.push(`- ${evidenceClass}: ${count}`)
  }

  md.push('', '## Submission outcomes', `- approved_for_rollup: ${promotion.approved}`)
  md.push(`- revision_requested: ${promotion.revisionRequested}`)
  md.push(`- rejected: ${promotion.rejected}`)
  md.push(`- promoted_to_canonical_input: ${promotion.promoted}`)
  md.push(`- blocked_from_promotion: ${promotion.blocked}`)

  md.push('', '## Unresolved critical gaps')
  for (const row of unresolvedCriticalGaps) {
    md.push(
      `- ${row.entityType}:${row.entitySlug} -> unresolved: ${row.unresolvedCriticalTopics.join(', ') || 'none'}; stillBlockedFromStrongCoverage=${row.stillBlockedFromStrongCoverage}`,
    )
  }

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(OUTPUT_MD, `${md.join('\n')}\n`)

  console.log(`Wrote ${path.relative(ROOT, OUTPUT_JSON)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_MD)}`)
  console.log(`[report-enrichment-wave-2-authoring] submissions=${waveSubmissions.length} promoted=${promotion.promoted}`)
}

run()
