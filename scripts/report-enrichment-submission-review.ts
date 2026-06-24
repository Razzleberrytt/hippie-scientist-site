import fs from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { parseNormalizedInput, validateAndNormalizeEntries } from './enrichment/normalize-enrichment-lib.mjs'

type EntityType = 'herb' | 'compound' | 'surface'
type ReviewStatus =
  | 'draft_submission'
  | 'needs_validation_fix'
  | 'ready_for_review'
  | 'under_review'
  | 'approved_for_rollup'
  | 'revision_requested'
  | 'rejected'
  | 'deprecated_submission'

type SourceRegistryRow = {
  sourceId: string
  sourceClass: string
  evidenceClass: string
  publicationStatus: 'published' | 'preprint' | 'withdrawn' | 'superseded' | 'archived'
  active: boolean
  reviewer?: string
  reviewedAt?: string
}

type AuthoringPack = {
  authoringPackId: string
  workpackId: string
  entityType: EntityType
  entitySlug: string | null
  surfaceId: string | null
  sourceId: string
  allowedTopicTypes: string[]
  allowedClaimTypes: string[]
  blockedTopicTypes: string[]
  blockedFramingNotes: string[]
  status: 'ready_for_authoring' | 'blocked_source' | 'blocked_governance' | 'blocked_policy'
}

type Workpack = {
  workpackId: string
  requiredGovernanceChecks: string[]
  reviewerNeeded: boolean
  reviewCycleState: string
}

type Submission = {
  submissionId: string
  authoringPackId: string
  workpackId: string
  entityType: EntityType
  entitySlug?: string
  surfaceId?: string
  sourceId: string
  topicType: string
  claimType: string
  evidenceClass: string
  findingTextShort: string
  findingTextNormalized: string
  strengthLabel?: string
  populationContext?: string
  usageContext?: string
  safetyContext?: string
  mechanismContext?: string
  traditionalUseContext?: string
  uncertaintyNote?: string
  reviewer?: string
  reviewedAt?: string
  reviewStatus: ReviewStatus
  approvalNotes?: string
  revisionReasons?: string[]
  rejectedReasons?: string[]
  editorialStatus?: string
  active: boolean
}

type SubmissionAssessment = {
  submissionId: string
  entityType: EntityType
  targetId: string
  sourceId: string
  reviewStatus: ReviewStatus
  derivedOutcome:
    | 'promotable'
    | 'blocked_validation'
    | 'blocked_review_state'
    | 'blocked_duplicate'
    | 'blocked_governance'
    | 'blocked_safety_evidence'
  promotable: boolean
  promotionBlockedReasons: string[]
  warnings: string[]
  duplicateSignals: string[]
}

type ReviewReport = {
  generatedAt: string
  deterministicModelVersion: string
  paths: {
    submissions: string
    schema: string
    sourceRegistry: string
    authoringPacks: string
    workpacks: string
    canonicalGovernedInputPath: string
  }
  workflowStates: ReviewStatus[]
  promotionRules: string[]
  validationRules: string[]
  summary: {
    submissionCount: number
    promotableCount: number
    blockedCount: number
    byReviewStatus: Record<ReviewStatus, number>
    byDerivedOutcome: Record<SubmissionAssessment['derivedOutcome'], number>
  }
  assessments: SubmissionAssessment[]
  promotion: {
    canonicalGovernedInputPath: string
    promotedSubmissionIds: string[]
    blockedSubmissionIds: Array<{ submissionId: string; reasons: string[] }>
  }
}

const ROOT = process.cwd()
const SUBMISSIONS_PATH = path.join(ROOT, 'ops', 'enrichment-submissions.json')
const SUBMISSION_SCHEMA_PATH = path.join(ROOT, 'schemas', 'enrichment-submission.schema.json')
const SOURCE_REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const AUTHORING_PACKS_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-authoring-packs.json')
const WORKPACKS_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-workpacks.json')
const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'enrichment-submission-review.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'enrichment-submission-review.md')
const CANONICAL_PROMOTED_INPUT = path.join(ROOT, 'public', 'data', 'enrichment-submissions-governed-input.jsonl')

const SOURCE_CLASS_TO_EVIDENCE: Record<string, string> = {
  'randomized-human-trial': 'human-clinical',
  'non-randomized-human-study': 'human-clinical',
  'observational-human-evidence': 'human-observational',
  'systematic-review-meta-analysis': 'human-clinical',
  'preclinical-mechanistic-study': 'preclinical-mechanistic',
  'traditional-use-monograph': 'traditional-use',
  'regulatory-agency-monograph-guidance': 'regulatory-monograph',
  'reference-database-authority': 'regulatory-monograph',
}

const TOPIC_CLAIM_RULES: Record<string, Set<string>> = {
  supported_use: new Set(['efficacy_signal']),
  unsupported_or_unclear_use: new Set(['efficacy_null_or_mixed', 'evidence_conflict']),
  mechanism: new Set(['mechanistic_signal']),
  pathway: new Set(['mechanistic_signal']),
  receptor_activity: new Set(['mechanistic_signal']),
  enzyme_interaction: new Set(['mechanistic_signal']),
  transporter_interaction: new Set(['mechanistic_signal']),
  constituent: new Set(['constituent_profile']),
  constituent_relationship: new Set(['relationship_signal', 'constituent_profile']),
  herb_compound_link: new Set(['relationship_signal']),
  compound_origin_note: new Set(['origin_note', 'relationship_signal']),
  interaction: new Set(['safety_risk']),
  contraindication: new Set(['safety_risk']),
  adverse_effect: new Set(['safety_risk']),
  pregnancy_note: new Set(['population_note', 'safety_risk']),
  lactation_note: new Set(['population_note', 'safety_risk']),
  pediatric_note: new Set(['population_note', 'safety_risk']),
  geriatric_note: new Set(['population_note', 'safety_risk']),
  condition_caution: new Set(['safety_risk', 'population_note']),
  surgery_caution: new Set(['safety_risk', 'population_note']),
  medication_class_caution: new Set(['safety_risk']),
  dosage_context: new Set(['dosing_note', 'population_note']),
  population_specific_note: new Set(['population_note', 'safety_risk']),
  conflict_note: new Set(['evidence_conflict']),
  research_gap: new Set(['research_gap']),
}

const BLOCKED_FRAMING_PATTERNS = [
  /\b(cure|cures|cured)\b/iu,
  /\b(proven|proof)\b/iu,
  /\b(always safe|completely safe|safe for everyone)\b/iu,
  /\b(no side effects)\b/iu,
  /\b(guaranteed|guarantees)\b/iu,
]

const SAFETY_TOPICS = new Set([
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
])

const ALLOWED_APPROVAL_EDITORIAL = new Set(['approved', 'published'])
const BLOCKED_SOURCE_STATUSES = new Set(['withdrawn', 'superseded', 'archived'])

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function normalizeWhitespace(value: unknown): string {
  return String(value || '')
    .replace(/\s+/gu, ' ')
    .trim()
}

function normalizeComparableText(value: string): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gu, '')
}

function jaccardSimilarity(a: string, b: string): number {
  const tokensA = new Set(normalizeComparableText(a).split(' ').filter(Boolean))
  const tokensB = new Set(normalizeComparableText(b).split(' ').filter(Boolean))
  if (tokensA.size === 0 || tokensB.size === 0) return 0
  let intersect = 0
  for (const token of tokensA) if (tokensB.has(token)) intersect += 1
  const union = new Set([...tokensA, ...tokensB]).size
  return union === 0 ? 0 : intersect / union
}

function loadExistingNormalizedEntries() {
  const rows = parseNormalizedInput(path.join(ROOT, 'public', 'data', 'enrichment-normalized.jsonl')) as Array<{
    entityType: string
    entitySlug: string
    sourceId: string
    topicType: string
    claimType: string
    findingTextNormalized: string
  }>

  const set = new Set<string>()
  for (const row of rows) {
    set.add(
      [
        row.entityType,
        row.entitySlug,
        row.sourceId,
        row.topicType,
        row.claimType,
        normalizeComparableText(row.findingTextNormalized),
      ].join('|'),
    )
  }
  return set
}

function run() {
  const submissions = readJson<Submission[]>(SUBMISSIONS_PATH)
  const sourceRegistry = readJson<SourceRegistryRow[]>(SOURCE_REGISTRY_PATH)
  const authoringPackReport = readJson<{ authoringPacks: AuthoringPack[] }>(AUTHORING_PACKS_PATH)
  const workpackReport = readJson<{ workpacks: Workpack[] }>(WORKPACKS_PATH)
  const submissionSchema = readJson(SUBMISSION_SCHEMA_PATH)

  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: true })
  addFormats(ajv)
  const validate = ajv.compile(submissionSchema)
  if (!validate(submissions)) {
    throw new Error(`Submission schema validation failed: ${JSON.stringify(validate.errors ?? [])}`)
  }

  const sourceById = new Map(sourceRegistry.map(source => [source.sourceId, source]))
  const authoringPackById = new Map(authoringPackReport.authoringPacks.map(pack => [pack.authoringPackId, pack]))
  const workpackById = new Map(workpackReport.workpacks.map(workpack => [workpack.workpackId, workpack]))
  const byReviewStatus: Record<ReviewStatus, number> = {
    draft_submission: 0,
    needs_validation_fix: 0,
    ready_for_review: 0,
    under_review: 0,
    approved_for_rollup: 0,
    revision_requested: 0,
    rejected: 0,
    deprecated_submission: 0,
  }

  const byDerivedOutcome: Record<SubmissionAssessment['derivedOutcome'], number> = {
    promotable: 0,
    blocked_validation: 0,
    blocked_review_state: 0,
    blocked_duplicate: 0,
    blocked_governance: 0,
    blocked_safety_evidence: 0,
  }

  const assessments: SubmissionAssessment[] = []
  const normalizedRowsForValidation: Array<Record<string, unknown>> = []
  const submissionById = new Map<string, Submission>()

  for (const submission of submissions) {
    byReviewStatus[submission.reviewStatus] += 1
    submissionById.set(submission.submissionId, submission)

    normalizedRowsForValidation.push({
      enrichmentId: `enr_${submission.submissionId.replace(/^sub_/u, '')}`,
      entityType: submission.entityType === 'surface' ? 'herb' : submission.entityType,
      entitySlug: submission.entityType === 'surface' ? 'ashwagandha' : submission.entitySlug,
      sourceId: submission.sourceId,
      topicType: submission.topicType,
      claimType: submission.claimType,
      evidenceClass: submission.evidenceClass,
      findingTextShort: submission.findingTextShort,
      findingTextNormalized: submission.findingTextNormalized,
      reviewer: submission.reviewer ?? 'pending-review',
      reviewedAt: submission.reviewedAt ?? '2026-01-01T00:00:00.000Z',
      editorialStatus: submission.editorialStatus ?? 'draft',
      active: submission.active,
      ...(submission.uncertaintyNote ? { uncertaintyNote: submission.uncertaintyNote } : {}),
      ...(submission.strengthLabel ? { strengthLabel: submission.strengthLabel } : {}),
    })
  }

  const validationResult = validateAndNormalizeEntries(normalizedRowsForValidation, { includeNearDuplicateCheck: true })
  const normalizedValidationIssueBySubmission = new Map<string, string[]>()
  for (const issue of validationResult.issues) {
    const match = issue.match(/\[entry:(\d+):/u)
    if (!match) continue
    const index = Number(match[1])
    if (!Number.isFinite(index) || index < 0 || index >= submissions.length) continue
    const submission = submissions[index]
    const bucket = normalizedValidationIssueBySubmission.get(submission.submissionId) ?? []
    bucket.push(issue)
    normalizedValidationIssueBySubmission.set(submission.submissionId, bucket)
  }

  const duplicateKeyToSubmissionId = new Map<string, string>()
  const nearDupeBuckets = new Map<string, Array<{ submissionId: string; findingTextNormalized: string }>>()
  const existingNormalizedSet = loadExistingNormalizedEntries()

  const promotedRows: string[] = []
  const promotedSubmissionIds: string[] = []
  const blockedSubmissionIds: Array<{ submissionId: string; reasons: string[] }> = []

  for (const submission of submissions) {
    const warnings: string[] = []
    const blockedReasons: string[] = []
    const duplicateSignals: string[] = []

    const pack = authoringPackById.get(submission.authoringPackId)
    if (!pack) {
      blockedReasons.push('missing_authoring_pack')
    } else {
      if (pack.status !== 'ready_for_authoring') blockedReasons.push(`authoring_pack_status_${pack.status}`)
      if (pack.workpackId !== submission.workpackId) blockedReasons.push('workpack_mismatch_with_authoring_pack')
      if (pack.sourceId !== submission.sourceId) blockedReasons.push('source_mismatch_with_authoring_pack')
      if (!pack.allowedTopicTypes.includes(submission.topicType)) blockedReasons.push('topic_not_allowed_by_authoring_pack')
      if (!pack.allowedClaimTypes.includes(submission.claimType)) blockedReasons.push('claim_not_allowed_by_authoring_pack')
      if (pack.blockedTopicTypes.includes(submission.topicType)) blockedReasons.push('topic_blocked_by_authoring_pack')
      if (
        submission.entityType !== pack.entityType ||
        normalizeWhitespace(submission.entitySlug) !== normalizeWhitespace(pack.entitySlug) ||
        normalizeWhitespace(submission.surfaceId) !== normalizeWhitespace(pack.surfaceId)
      ) {
        blockedReasons.push('target_mismatch_with_authoring_pack')
      }
    }

    const workpack = workpackById.get(submission.workpackId)
    if (!workpack) {
      blockedReasons.push('missing_workpack')
    }

    const source = sourceById.get(submission.sourceId)
    if (!source) {
      blockedReasons.push('source_missing_from_registry')
    } else {
      if (source.active !== true) blockedReasons.push('source_not_active')
      if (!source.reviewer || !source.reviewedAt) blockedReasons.push('source_not_registry_approved')
      if (BLOCKED_SOURCE_STATUSES.has(source.publicationStatus)) {
        blockedReasons.push(`source_publication_status_${source.publicationStatus}`)
      }
      if (submission.evidenceClass !== source.evidenceClass) {
        blockedReasons.push('submission_source_evidence_class_mismatch')
      }
      const expectedEvidence = SOURCE_CLASS_TO_EVIDENCE[source.sourceClass]
      if (expectedEvidence && expectedEvidence !== submission.evidenceClass) {
        blockedReasons.push(`source_class_evidence_mismatch_expected_${expectedEvidence}`)
      }
    }

    const allowedClaims = TOPIC_CLAIM_RULES[submission.topicType]
    if (!allowedClaims) {
      blockedReasons.push(`unsupported_topic_type_${submission.topicType}`)
    } else if (!allowedClaims.has(submission.claimType)) {
      blockedReasons.push(`invalid_topic_claim_combo_${submission.topicType}_${submission.claimType}`)
    }

    if (submission.claimType === 'efficacy_signal' && submission.evidenceClass === 'preclinical-mechanistic') {
      blockedReasons.push('preclinical_efficacy_signal_not_approvable')
    }

    const blockedFramingFound = BLOCKED_FRAMING_PATTERNS.some(
      pattern => pattern.test(submission.findingTextShort) || pattern.test(submission.findingTextNormalized),
    )
    if (blockedFramingFound) blockedReasons.push('blocked_claim_framing_detected')

    const requiresReviewMetadata = new Set<ReviewStatus>([
      'under_review',
      'approved_for_rollup',
      'revision_requested',
      'rejected',
      'deprecated_submission',
    ]).has(submission.reviewStatus)

    if (requiresReviewMetadata) {
      if (!submission.reviewer) blockedReasons.push('missing_reviewer_for_review_stage')
      if (!submission.reviewedAt) blockedReasons.push('missing_reviewed_at_for_review_stage')
      if (!submission.editorialStatus) blockedReasons.push('missing_editorial_status_for_review_stage')
    }

    if (submission.reviewStatus === 'approved_for_rollup') {
      if (!ALLOWED_APPROVAL_EDITORIAL.has(submission.editorialStatus || '')) {
        blockedReasons.push('approved_for_rollup_requires_editorial_status_approved_or_published')
      }
      if (!submission.reviewer || !submission.reviewedAt) {
        blockedReasons.push('approved_for_rollup_requires_reviewer_and_reviewedAt')
      }
    }

    if (submission.reviewStatus === 'revision_requested' && (!submission.revisionReasons || submission.revisionReasons.length === 0)) {
      blockedReasons.push('revision_requested_requires_revisionReasons')
    }
    if (submission.reviewStatus === 'rejected' && (!submission.rejectedReasons || submission.rejectedReasons.length === 0)) {
      blockedReasons.push('rejected_requires_rejectedReasons')
    }

    const validationIssues = normalizedValidationIssueBySubmission.get(submission.submissionId) ?? []
    for (const issue of validationIssues) {
      if (issue.includes('duplicate claim') || issue.includes('near-duplicate claim')) {
        duplicateSignals.push(issue)
      } else {
        blockedReasons.push(`normalized_validation:${issue}`)
      }
    }

    const duplicateKey = [
      submission.entityType,
      submission.entitySlug ?? submission.surfaceId,
      submission.sourceId,
      submission.topicType,
      submission.claimType,
      normalizeComparableText(submission.findingTextNormalized),
    ].join('|')

    if (duplicateKeyToSubmissionId.has(duplicateKey)) {
      duplicateSignals.push(`exact_duplicate_submission_of:${duplicateKeyToSubmissionId.get(duplicateKey)}`)
    } else {
      duplicateKeyToSubmissionId.set(duplicateKey, submission.submissionId)
    }

    if (existingNormalizedSet.has(duplicateKey.replace(/^surface\|/u, 'herb|'))) {
      duplicateSignals.push('duplicate_of_existing_canonical_normalized_entry')
    }

    const nearBucketKey = [
      submission.entityType,
      submission.entitySlug ?? submission.surfaceId,
      submission.sourceId,
      submission.topicType,
      submission.claimType,
    ].join('|')
    const nearBucket = nearDupeBuckets.get(nearBucketKey) ?? []
    for (const prior of nearBucket) {
      const score = jaccardSimilarity(prior.findingTextNormalized, submission.findingTextNormalized)
      if (score >= 0.9) {
        duplicateSignals.push(`near_duplicate_of:${prior.submissionId}:similarity=${score.toFixed(2)}`)
        break
      }
    }
    nearBucket.push({ submissionId: submission.submissionId, findingTextNormalized: submission.findingTextNormalized })
    nearDupeBuckets.set(nearBucketKey, nearBucket)

    if (submission.reviewStatus !== 'approved_for_rollup' && submission.reviewStatus !== 'under_review') {
      warnings.push(`non_promotable_review_status_${submission.reviewStatus}`)
    }

    const hasSafetyEvidenceProblem =
      SAFETY_TOPICS.has(submission.topicType) &&
      submission.evidenceClass !== 'human-clinical' &&
      submission.evidenceClass !== 'regulatory-monograph' &&
      !submission.uncertaintyNote

    if (hasSafetyEvidenceProblem) {
      blockedReasons.push('safety_topic_requires_uncertainty_note_for_non_human_or_non_regulatory_evidence')
    }

    let derivedOutcome: SubmissionAssessment['derivedOutcome'] = 'promotable'
    if (duplicateSignals.length > 0) derivedOutcome = 'blocked_duplicate'
    if (blockedReasons.some(reason => reason.includes('source_') || reason.includes('authoring_pack') || reason.includes('workpack'))) {
      derivedOutcome = 'blocked_governance'
    }
    if (blockedReasons.some(reason => reason.includes('safety') || reason.includes('preclinical_efficacy'))) {
      derivedOutcome = 'blocked_safety_evidence'
    }
    if (blockedReasons.some(reason => reason.includes('missing_') || reason.includes('requires_'))) {
      derivedOutcome = 'blocked_review_state'
    }
    if (blockedReasons.some(reason => reason.startsWith('normalized_validation:') || reason.startsWith('invalid_topic_claim_combo'))) {
      derivedOutcome = 'blocked_validation'
    }

    const promotable =
      submission.reviewStatus === 'approved_for_rollup' &&
      blockedReasons.length === 0 &&
      duplicateSignals.length === 0 &&
      submission.active === true

    if (promotable) {
      promotedRows.push(
        JSON.stringify({
          enrichmentId: `enr_${submission.submissionId.replace(/^sub_/u, '')}`,
          entityType: submission.entityType,
          entitySlug: submission.entitySlug,
          sourceId: submission.sourceId,
          topicType: submission.topicType,
          claimType: submission.claimType,
          evidenceClass: submission.evidenceClass,
          findingTextShort: submission.findingTextShort,
          findingTextNormalized: submission.findingTextNormalized,
          ...(submission.strengthLabel ? { strengthLabel: submission.strengthLabel } : {}),
          ...(submission.populationContext ? { populationContext: submission.populationContext } : {}),
          ...(submission.usageContext ? { usageContext: submission.usageContext } : {}),
          ...(submission.safetyContext ? { safetyContext: submission.safetyContext } : {}),
          ...(submission.mechanismContext ? { mechanismContext: submission.mechanismContext } : {}),
          ...(submission.traditionalUseContext ? { traditionalUseContext: submission.traditionalUseContext } : {}),
          ...(submission.uncertaintyNote ? { uncertaintyNote: submission.uncertaintyNote } : {}),
          reviewer: submission.reviewer,
          reviewedAt: submission.reviewedAt,
          editorialStatus: submission.editorialStatus,
          active: true,
        }),
      )
      promotedSubmissionIds.push(submission.submissionId)
    } else {
      blockedSubmissionIds.push({ submissionId: submission.submissionId, reasons: [...blockedReasons, ...duplicateSignals] })
    }

    byDerivedOutcome[promotable ? 'promotable' : derivedOutcome] += 1

    assessments.push({
      submissionId: submission.submissionId,
      entityType: submission.entityType,
      targetId: submission.entitySlug ?? submission.surfaceId ?? 'unknown-target',
      sourceId: submission.sourceId,
      reviewStatus: submission.reviewStatus,
      derivedOutcome: promotable ? 'promotable' : derivedOutcome,
      promotable,
      promotionBlockedReasons: blockedReasons,
      warnings,
      duplicateSignals,
    })
  }

  const canonicalRows = promotedRows.sort((a, b) => a.localeCompare(b))
  fs.writeFileSync(CANONICAL_PROMOTED_INPUT, canonicalRows.join('\n') + (canonicalRows.length > 0 ? '\n' : ''), 'utf8')

  assessments.sort((a, b) => a.submissionId.localeCompare(b.submissionId))
  const report: ReviewReport = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'enrichment-submission-review-v1',
    paths: {
      submissions: path.relative(ROOT, SUBMISSIONS_PATH),
      schema: path.relative(ROOT, SUBMISSION_SCHEMA_PATH),
      sourceRegistry: path.relative(ROOT, SOURCE_REGISTRY_PATH),
      authoringPacks: path.relative(ROOT, AUTHORING_PACKS_PATH),
      workpacks: path.relative(ROOT, WORKPACKS_PATH),
      canonicalGovernedInputPath: path.relative(ROOT, CANONICAL_PROMOTED_INPUT),
    },
    workflowStates: [
      'draft_submission',
      'needs_validation_fix',
      'ready_for_review',
      'under_review',
      'approved_for_rollup',
      'revision_requested',
      'rejected',
      'deprecated_submission',
    ],
    validationRules: [
      'submission sourceId must exist in source registry and be active with reviewer/reviewedAt metadata.',
      'topicType, claimType, and evidenceClass are validated against deterministic compatibility rules.',
      'sourceClass to evidenceClass mapping must match the submission evidenceClass.',
      'blocked framing patterns (cure/proven/always-safe/no-side-effects/guaranteed) are rejected.',
      'normalized enrichment schema/domain validation is re-used for structural and evidence/safety constraints.',
      'exact and near-duplicate submissions are blocked before promotion, including duplicates of existing canonical normalized entries.',
      'safety topics using non-human or non-regulatory evidence must include uncertaintyNote.',
    ],
    promotionRules: [
      'Only approved_for_rollup submissions with active=true can be promoted.',
      'approved_for_rollup requires reviewer, reviewedAt, and editorialStatus in {approved,published}.',
      'Missing authoring pack/workpack references or mismatches block promotion.',
      'Blocked/deprecated/unapproved sources (inactive, withdrawn, superseded, archived, or missing registry review metadata) cannot be promoted.',
      'revision_requested, rejected, deprecated_submission, draft_submission, needs_validation_fix, and ready_for_review are never promoted.',
      'Rejected, duplicate, invalid, or governance-blocked submissions remain excluded from canonical governed inputs and downstream rollups.',
    ],
    summary: {
      submissionCount: submissions.length,
      promotableCount: promotedSubmissionIds.length,
      blockedCount: submissions.length - promotedSubmissionIds.length,
      byReviewStatus,
      byDerivedOutcome,
    },
    assessments,
    promotion: {
      canonicalGovernedInputPath: path.relative(ROOT, CANONICAL_PROMOTED_INPUT),
      promotedSubmissionIds: promotedSubmissionIds.sort(),
      blockedSubmissionIds,
    },
  }

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(report, null, 2) + '\n', 'utf8')

  const lines = [
    '# Enrichment Submission Review',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Submission input: \`${report.paths.submissions}\``,
    `- Canonical governed input after promotion: \`${report.paths.canonicalGovernedInputPath}\``,
    `- Promotable submissions: **${report.summary.promotableCount} / ${report.summary.submissionCount}**`,
    '',
    '## Review states',
    '',
    report.workflowStates.map(state => `- ${state}`).join('\n'),
    '',
    '## Promotion rules (deterministic)',
    '',
    report.promotionRules.map(rule => `- ${rule}`).join('\n'),
    '',
    '## Summary by outcome',
    '',
    `- promotable: ${report.summary.byDerivedOutcome.promotable}`,
    `- blocked_validation: ${report.summary.byDerivedOutcome.blocked_validation}`,
    `- blocked_review_state: ${report.summary.byDerivedOutcome.blocked_review_state}`,
    `- blocked_duplicate: ${report.summary.byDerivedOutcome.blocked_duplicate}`,
    `- blocked_governance: ${report.summary.byDerivedOutcome.blocked_governance}`,
    `- blocked_safety_evidence: ${report.summary.byDerivedOutcome.blocked_safety_evidence}`,
    '',
    '## Submission decisions',
    '',
    '| submissionId | reviewStatus | promotable | outcome | reasons |',
    '| --- | --- | --- | --- | --- |',
    ...report.assessments.map(assessment => {
      const reasons = [...assessment.promotionBlockedReasons, ...assessment.duplicateSignals].join('; ') || '-'
      return `| ${assessment.submissionId} | ${assessment.reviewStatus} | ${assessment.promotable ? 'yes' : 'no'} | ${assessment.derivedOutcome} | ${reasons} |`
    }),
    '',
  ]

  fs.writeFileSync(OUTPUT_MD, lines.join('\n'), 'utf8')

  console.log(
    `[report-enrichment-submission-review] PASS submissions=${report.summary.submissionCount} promotable=${report.summary.promotableCount} report=${path.relative(ROOT, OUTPUT_JSON)}`,
  )
}

run()
