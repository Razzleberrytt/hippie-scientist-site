import fs from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

type ReviewStatus =
  | 'draft_candidate'
  | 'needs_metadata'
  | 'under_review'
  | 'approved_for_registry'
  | 'rejected'
  | 'duplicate_of_existing'
  | 'deprecated_candidate'

type OutcomeCategory =
  | 'approved_new_source'
  | 'duplicate_of_existing'
  | 'insufficient_metadata'
  | 'low_value_non_qualifying'
  | 'wrong_source_class_for_intended_gap'

type SourceIntakeTask = {
  intakeTaskId: string
  recommendedSourceClasses: string[]
  acquisitionTier: string
  topicType: string
  sourceGapType: string
  safetyCritical: boolean
  publishBlocking: boolean
  requiredGovernanceChecksBeforeRegistryEntry: string[]
}

type SourceIntakeQueueReport = {
  generatedAt: string
  deterministicModelVersion: string
  summary: {
    totalTasks: number
  }
  tasks: SourceIntakeTask[]
}

type SourceRegistryRow = {
  sourceId: string
  title: string
  shortTitle?: string
  sourceType: string
  sourceClass: string
  organization?: string
  authors?: string[]
  publicationYear?: number
  citationText?: string
  doi?: string
  pmid?: string
  monographId?: string
  isbn?: string
  canonicalUrl?: string
  language: string
  jurisdiction?: string
  evidenceClass: string
  studyDesign?: string
  publicationStatus: string
  reliabilityTier: string
  reviewer: string
  reviewedAt: string
  notes?: string
  active: boolean
}

type SourceCandidate = {
  candidateSourceId: string
  intakeTaskId: string
  title: string
  shortTitle?: string
  sourceType: string
  sourceClass: string
  organization?: string
  authors?: string[]
  publicationYear?: number
  citationText?: string
  doi?: string
  pmid?: string
  canonicalUrl?: string
  monographId?: string
  isbn?: string
  language?: string
  jurisdiction?: string
  evidenceClass: string
  studyDesign?: string
  publicationStatus: string
  proposedReliabilityTier: string
  duplicateRisk: 'low' | 'moderate' | 'high' | 'known-duplicate'
  duplicateOfSourceId?: string
  reviewer?: string
  reviewedAt?: string
  reviewStatus: ReviewStatus
  approvalNotes?: string
  rejectionReasons?: string[]
  active: boolean
}

type CandidateAssessment = {
  candidateSourceId: string
  intakeTaskId: string
  declaredReviewStatus: ReviewStatus
  derivedReviewStatus: ReviewStatus
  outcomeCategory: OutcomeCategory
  promotable: boolean
  promotionBlockedReasons: string[]
  metadataIssues: string[]
  duplicateMatches: Array<{ sourceId: string; matchType: 'doi' | 'pmid' | 'canonicalUrl' }>
  wrongClassForGap: boolean
  lowValueFlags: string[]
  proposedRegistrySourceId?: string
}

type CandidateReviewReport = {
  generatedAt: string
  deterministicModelVersion: string
  sources: {
    intakeQueue: string
    sourceRegistry: string
    candidateQueue: string
    candidateSchema: string
  }
  workflowStates: ReviewStatus[]
  intakeToRegistryRequirements: string[]
  summary: {
    intakeTasksTotal: number
    candidateCount: number
    promotableCount: number
    promotedPreviewCount: number
    byDeclaredStatus: Record<ReviewStatus, number>
    byDerivedStatus: Record<ReviewStatus, number>
    byOutcomeCategory: Record<OutcomeCategory, number>
  }
  assessments: CandidateAssessment[]
  promotionPreview: {
    registryInsertions: SourceRegistryRow[]
    blockedCandidates: Array<{ candidateSourceId: string; reasons: string[] }>
  }
}

const ROOT = process.cwd()
const INTAKE_PATH = path.join(ROOT, 'ops', 'reports', 'source-intake-queue.json')
const REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const CANDIDATE_PATH = path.join(ROOT, 'ops', 'source-candidates.json')
const CANDIDATE_SCHEMA_PATH = path.join(ROOT, 'schemas', 'source-candidate.schema.json')
const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'source-candidate-review.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'source-candidate-review.md')

const CLASS_RULES: Record<
  string,
  { evidenceClass: string; allowedTypes: Set<string>; pmidApplicable: boolean; preferredStudyDesigns: string[] }
> = {
  'randomized-human-trial': {
    evidenceClass: 'human-clinical',
    allowedTypes: new Set(['journal-article', 'clinical-trial-registry']),
    pmidApplicable: true,
    preferredStudyDesigns: ['randomized-controlled-trial'],
  },
  'non-randomized-human-study': {
    evidenceClass: 'human-clinical',
    allowedTypes: new Set(['journal-article']),
    pmidApplicable: true,
    preferredStudyDesigns: ['non-randomized-trial', 'cohort'],
  },
  'observational-human-evidence': {
    evidenceClass: 'human-observational',
    allowedTypes: new Set(['journal-article', 'systematic-review']),
    pmidApplicable: true,
    preferredStudyDesigns: ['cohort', 'case-control', 'cross-sectional'],
  },
  'systematic-review-meta-analysis': {
    evidenceClass: 'human-clinical',
    allowedTypes: new Set(['systematic-review', 'meta-analysis', 'journal-article']),
    pmidApplicable: true,
    preferredStudyDesigns: ['systematic-review', 'meta-analysis'],
  },
  'preclinical-mechanistic-study': {
    evidenceClass: 'preclinical-mechanistic',
    allowedTypes: new Set(['journal-article']),
    pmidApplicable: true,
    preferredStudyDesigns: ['in-vitro', 'in-vivo-animal'],
  },
  'traditional-use-monograph': {
    evidenceClass: 'traditional-use',
    allowedTypes: new Set(['monograph', 'book']),
    pmidApplicable: false,
    preferredStudyDesigns: ['narrative-monograph'],
  },
  'regulatory-agency-monograph-guidance': {
    evidenceClass: 'regulatory-monograph',
    allowedTypes: new Set(['regulatory-guidance', 'monograph']),
    pmidApplicable: false,
    preferredStudyDesigns: ['regulatory-guidance'],
  },
  'reference-database-authority': {
    evidenceClass: 'regulatory-monograph',
    allowedTypes: new Set(['reference-database']),
    pmidApplicable: false,
    preferredStudyDesigns: ['database-reference'],
  },
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function isNonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function canonicalizeUrl(raw: string | undefined): string | null {
  if (!isNonEmpty(raw)) return null
  try {
    const url = new URL(raw)
    const pathname = url.pathname.replace(/\/+$/, '') || '/'
    return `${url.protocol}//${url.hostname.toLowerCase()}${pathname}${url.search}`
  } catch {
    return null
  }
}

function sourceIdBase(candidate: SourceCandidate): string {
  if (isNonEmpty(candidate.doi)) return `src_doi-${slugify(candidate.doi)}`
  if (isNonEmpty(candidate.pmid)) return `src_pmid-${candidate.pmid}`
  const canonicalUrl = canonicalizeUrl(candidate.canonicalUrl)
  if (canonicalUrl) return `src_url-${slugify(canonicalUrl)}`
  if (isNonEmpty(candidate.monographId)) return `src_mono-${slugify(candidate.monographId)}`
  const year = Number.isInteger(candidate.publicationYear) ? `-${candidate.publicationYear}` : ''
  return `src_title-${slugify(candidate.title)}${year}`
}

function buildUniqueSourceId(base: string, taken: Set<string>): string {
  if (!taken.has(base)) {
    taken.add(base)
    return base
  }

  let suffix = 2
  while (taken.has(`${base}-${suffix}`)) suffix += 1
  const unique = `${base}-${suffix}`
  taken.add(unique)
  return unique
}

function pushIfMissing(issues: string[], condition: boolean, message: string) {
  if (!condition) issues.push(message)
}

function run() {
  const intake = readJson<SourceIntakeQueueReport>(INTAKE_PATH)
  const registry = readJson<SourceRegistryRow[]>(REGISTRY_PATH)
  const candidates = fs.existsSync(CANDIDATE_PATH) ? readJson<SourceCandidate[]>(CANDIDATE_PATH) : []
  const candidateSchema = readJson(CANDIDATE_SCHEMA_PATH)

  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: true })
  addFormats(ajv)
  const validate = ajv.compile(candidateSchema)
  if (!validate(candidates)) {
    const errors = JSON.stringify(validate.errors ?? [], null, 2)
    throw new Error(`Candidate queue schema validation failed: ${errors}`)
  }

  const intakeById = new Map(intake.tasks.map(task => [task.intakeTaskId, task]))
  const activeRegistry = registry.filter(source => source.active)
  const activeByDoi = new Map(activeRegistry.filter(s => isNonEmpty(s.doi)).map(s => [s.doi!.toLowerCase(), s]))
  const activeByPmid = new Map(activeRegistry.filter(s => isNonEmpty(s.pmid)).map(s => [s.pmid!, s]))
  const activeByUrl = new Map(
    activeRegistry
      .map(source => [canonicalizeUrl(source.canonicalUrl), source] as const)
      .filter((entry): entry is [string, SourceRegistryRow] => isNonEmpty(entry[0])),
  )

  const byDeclaredStatus: Record<ReviewStatus, number> = {
    draft_candidate: 0,
    needs_metadata: 0,
    under_review: 0,
    approved_for_registry: 0,
    rejected: 0,
    duplicate_of_existing: 0,
    deprecated_candidate: 0,
  }

  const byDerivedStatus: Record<ReviewStatus, number> = {
    draft_candidate: 0,
    needs_metadata: 0,
    under_review: 0,
    approved_for_registry: 0,
    rejected: 0,
    duplicate_of_existing: 0,
    deprecated_candidate: 0,
  }

  const byOutcomeCategory: Record<OutcomeCategory, number> = {
    approved_new_source: 0,
    duplicate_of_existing: 0,
    insufficient_metadata: 0,
    low_value_non_qualifying: 0,
    wrong_source_class_for_intended_gap: 0,
  }

  const assessments: CandidateAssessment[] = []
  const insertions: SourceRegistryRow[] = []
  const blocked: Array<{ candidateSourceId: string; reasons: string[] }> = []

  const takenSourceIds = new Set(registry.map(row => row.sourceId))

  for (const candidate of candidates) {
    byDeclaredStatus[candidate.reviewStatus] += 1
    const intakeTask = intakeById.get(candidate.intakeTaskId)

    const metadataIssues: string[] = []
    const lowValueFlags: string[] = []
    const promotionBlockedReasons: string[] = []
    const duplicateMatches: Array<{ sourceId: string; matchType: 'doi' | 'pmid' | 'canonicalUrl' }> = []

    const classRule = CLASS_RULES[candidate.sourceClass]
    if (!intakeTask) metadataIssues.push(`intakeTaskId=${candidate.intakeTaskId} not found in source-intake queue.`)

    if (!classRule) {
      metadataIssues.push(`No sourceClass governance rule exists for sourceClass=${candidate.sourceClass}.`)
    } else {
      pushIfMissing(
        metadataIssues,
        candidate.evidenceClass === classRule.evidenceClass,
        `evidenceClass must be ${classRule.evidenceClass} for sourceClass=${candidate.sourceClass}.`,
      )
      pushIfMissing(
        metadataIssues,
        classRule.allowedTypes.has(candidate.sourceType),
        `sourceType=${candidate.sourceType} is not allowed for sourceClass=${candidate.sourceClass}.`,
      )
      if (!classRule.pmidApplicable && isNonEmpty(candidate.pmid)) {
        metadataIssues.push(`pmid must be omitted for sourceClass=${candidate.sourceClass}.`)
      }

      if (isNonEmpty(candidate.studyDesign) && classRule.preferredStudyDesigns.length > 0) {
        pushIfMissing(
          metadataIssues,
          classRule.preferredStudyDesigns.includes(candidate.studyDesign),
          `studyDesign=${candidate.studyDesign} is inconsistent with sourceClass=${candidate.sourceClass}.`,
        )
      }
    }

    const hasAnchor = isNonEmpty(candidate.doi) || isNonEmpty(candidate.pmid) || isNonEmpty(candidate.canonicalUrl)
    pushIfMissing(
      metadataIssues,
      hasAnchor || isNonEmpty(candidate.monographId) || isNonEmpty(candidate.isbn),
      'Candidate requires at least one citation anchor: doi, pmid, canonicalUrl, monographId, or isbn.',
    )

    const monographLike =
      candidate.sourceClass === 'traditional-use-monograph' || candidate.sourceClass === 'regulatory-agency-monograph-guidance'
    if (monographLike) {
      pushIfMissing(metadataIssues, isNonEmpty(candidate.organization), 'organization is required for monograph/regulatory candidates.')
      pushIfMissing(
        metadataIssues,
        isNonEmpty(candidate.monographId) || isNonEmpty(candidate.isbn),
        'monograph/regulatory candidate requires monographId or isbn.',
      )
      pushIfMissing(
        metadataIssues,
        Number.isInteger(candidate.publicationYear),
        'publicationYear is required for monograph/regulatory candidates.',
      )
    }

    if (candidate.publicationStatus === 'withdrawn' || candidate.publicationStatus === 'superseded') {
      lowValueFlags.push(`publicationStatus=${candidate.publicationStatus}`)
    }

    if (candidate.proposedReliabilityTier === 'tier-d') {
      lowValueFlags.push('proposedReliabilityTier=tier-d')
    }

    if (isNonEmpty(candidate.doi)) {
      const match = activeByDoi.get(candidate.doi.toLowerCase())
      if (match) duplicateMatches.push({ sourceId: match.sourceId, matchType: 'doi' })
    }
    if (isNonEmpty(candidate.pmid)) {
      const match = activeByPmid.get(candidate.pmid)
      if (match) duplicateMatches.push({ sourceId: match.sourceId, matchType: 'pmid' })
    }
    const normalizedUrl = canonicalizeUrl(candidate.canonicalUrl)
    if (normalizedUrl) {
      const match = activeByUrl.get(normalizedUrl)
      if (match) duplicateMatches.push({ sourceId: match.sourceId, matchType: 'canonicalUrl' })
    }

    const wrongClassForGap = Boolean(
      intakeTask && intakeTask.recommendedSourceClasses.length > 0 && !intakeTask.recommendedSourceClasses.includes(candidate.sourceClass),
    )

    let outcomeCategory: OutcomeCategory = 'approved_new_source'
    if (duplicateMatches.length > 0 || candidate.duplicateRisk === 'known-duplicate' || isNonEmpty(candidate.duplicateOfSourceId)) {
      outcomeCategory = 'duplicate_of_existing'
    } else if (metadataIssues.length > 0) {
      outcomeCategory = 'insufficient_metadata'
    } else if (wrongClassForGap) {
      outcomeCategory = 'wrong_source_class_for_intended_gap'
    } else if (lowValueFlags.length > 0) {
      outcomeCategory = 'low_value_non_qualifying'
    }

    const reviewEvidenceReady = isNonEmpty(candidate.reviewer) && isNonEmpty(candidate.reviewedAt)
    let derivedReviewStatus: ReviewStatus
    if (candidate.reviewStatus === 'deprecated_candidate') {
      derivedReviewStatus = 'deprecated_candidate'
    } else if (outcomeCategory === 'duplicate_of_existing') {
      derivedReviewStatus = 'duplicate_of_existing'
    } else if (candidate.reviewStatus === 'rejected' || outcomeCategory === 'low_value_non_qualifying') {
      derivedReviewStatus = 'rejected'
    } else if (metadataIssues.length > 0) {
      derivedReviewStatus = 'needs_metadata'
    } else if (!reviewEvidenceReady) {
      derivedReviewStatus = 'under_review'
    } else {
      derivedReviewStatus = 'approved_for_registry'
    }

    const disallowedStatuses = new Set<ReviewStatus>(['rejected', 'duplicate_of_existing', 'deprecated_candidate', 'needs_metadata'])
    const promotable = !disallowedStatuses.has(derivedReviewStatus)

    if (derivedReviewStatus !== candidate.reviewStatus) {
      promotionBlockedReasons.push(
        `Declared status ${candidate.reviewStatus} does not match derived deterministic status ${derivedReviewStatus}.`,
      )
    }

    if (!promotable) {
      promotionBlockedReasons.push(`Candidates in state ${derivedReviewStatus} cannot be promoted.`)
    }

    if (wrongClassForGap) {
      promotionBlockedReasons.push('Candidate sourceClass does not match recommended source classes for this intake task.')
    }

    if (metadataIssues.length > 0) {
      for (const issue of metadataIssues) promotionBlockedReasons.push(issue)
    }

    if (duplicateMatches.length > 0) {
      promotionBlockedReasons.push(
        `Duplicate matches existing active source(s): ${duplicateMatches.map(match => `${match.sourceId}:${match.matchType}`).join(', ')}.`,
      )
    }

    if (lowValueFlags.length > 0) {
      promotionBlockedReasons.push(`Low-value signal(s): ${lowValueFlags.join(', ')}.`)
    }

    let proposedRegistrySourceId: string | undefined
    if (promotable && promotionBlockedReasons.length === 0) {
      const sourceId = buildUniqueSourceId(sourceIdBase(candidate), takenSourceIds)
      proposedRegistrySourceId = sourceId
      insertions.push({
        sourceId,
        title: candidate.title,
        shortTitle: candidate.shortTitle,
        sourceType: candidate.sourceType,
        sourceClass: candidate.sourceClass,
        organization: candidate.organization,
        authors: candidate.authors,
        publicationYear: candidate.publicationYear,
        citationText: candidate.citationText,
        doi: candidate.doi,
        pmid: candidate.pmid,
        monographId: candidate.monographId,
        isbn: candidate.isbn,
        canonicalUrl: candidate.canonicalUrl,
        language: candidate.language || 'en',
        jurisdiction: candidate.jurisdiction,
        evidenceClass: candidate.evidenceClass,
        studyDesign: candidate.studyDesign,
        publicationStatus: candidate.publicationStatus,
        reliabilityTier: candidate.proposedReliabilityTier,
        reviewer: candidate.reviewer || 'unassigned-reviewer',
        reviewedAt: candidate.reviewedAt || new Date(0).toISOString(),
        notes:
          `Promoted from source-candidate review. intakeTaskId=${candidate.intakeTaskId}; candidateSourceId=${candidate.candidateSourceId}.` +
          (isNonEmpty(candidate.approvalNotes) ? ` approvalNotes=${candidate.approvalNotes}` : ''),
        active: candidate.active,
      })
    } else {
      blocked.push({ candidateSourceId: candidate.candidateSourceId, reasons: promotionBlockedReasons })
    }

    byDerivedStatus[derivedReviewStatus] += 1
    byOutcomeCategory[outcomeCategory] += 1

    assessments.push({
      candidateSourceId: candidate.candidateSourceId,
      intakeTaskId: candidate.intakeTaskId,
      declaredReviewStatus: candidate.reviewStatus,
      derivedReviewStatus,
      outcomeCategory,
      promotable,
      promotionBlockedReasons,
      metadataIssues,
      duplicateMatches,
      wrongClassForGap,
      lowValueFlags,
      proposedRegistrySourceId,
    })
  }

  assessments.sort((a, b) => a.candidateSourceId.localeCompare(b.candidateSourceId))

  const report: CandidateReviewReport = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'source-candidate-review-v1',
    sources: {
      intakeQueue: path.relative(ROOT, INTAKE_PATH),
      sourceRegistry: path.relative(ROOT, REGISTRY_PATH),
      candidateQueue: path.relative(ROOT, CANDIDATE_PATH),
      candidateSchema: path.relative(ROOT, CANDIDATE_SCHEMA_PATH),
    },
    workflowStates: [
      'draft_candidate',
      'needs_metadata',
      'under_review',
      'approved_for_registry',
      'rejected',
      'duplicate_of_existing',
      'deprecated_candidate',
    ],
    intakeToRegistryRequirements: [
      'Candidate must map to a valid intakeTaskId from ops/reports/source-intake-queue.json.',
      'Candidate metadata must pass source-candidate schema + deterministic class/evidence/sourceType consistency checks.',
      'Candidate must provide valid citation anchors appropriate to source class (doi/pmid/url or monograph-specific fields).',
      'Duplicate detection is run against active registry sources using DOI/PMID/canonical URL matching.',
      'Candidates in rejected, duplicate_of_existing, needs_metadata, or deprecated_candidate states are not promotable.',
      'Promotion preview creates stable sourceIds and writes intakeTaskId/candidateSourceId traceability into notes.',
    ],
    summary: {
      intakeTasksTotal: intake.summary.totalTasks,
      candidateCount: candidates.length,
      promotableCount: assessments.filter(item => item.promotable && item.promotionBlockedReasons.length === 0).length,
      promotedPreviewCount: insertions.length,
      byDeclaredStatus,
      byDerivedStatus,
      byOutcomeCategory,
    },
    assessments,
    promotionPreview: {
      registryInsertions: insertions,
      blockedCandidates: blocked,
    },
  }

  const md: string[] = [
    '# Source Candidate Review + Registry Promotion',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Workflow states',
    ...report.workflowStates.map(state => `- ${state}`),
    '',
    '## Summary',
    `- intakeTasksTotal: ${report.summary.intakeTasksTotal}`,
    `- candidateCount: ${report.summary.candidateCount}`,
    `- promotableCount: ${report.summary.promotableCount}`,
    `- promotedPreviewCount: ${report.summary.promotedPreviewCount}`,
    '',
    '## Outcome handling',
    '- approved_new_source: candidate is metadata-complete, non-duplicate, class-consistent, and review-complete.',
    '- duplicate_of_existing: candidate collides with existing active source identifier(s) and cannot be promoted.',
    '- insufficient_metadata: candidate is missing required metadata/anchors for deterministic governance checks.',
    '- low_value_non_qualifying: candidate is weak (withdrawn/superseded/tier-d) and should be rejected.',
    '- wrong_source_class_for_intended_gap: candidate class does not satisfy intake task gap recommendation.',
    '',
    '## Intake-to-registry requirements',
    ...report.intakeToRegistryRequirements.map(rule => `- ${rule}`),
    '',
    '## Candidate decisions',
    '| candidateSourceId | intakeTaskId | declared | derived | outcome | promotable | proposed sourceId |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  ]

  for (const assessment of report.assessments.slice(0, 100)) {
    md.push(
      `| ${assessment.candidateSourceId} | ${assessment.intakeTaskId} | ${assessment.declaredReviewStatus} | ${assessment.derivedReviewStatus} | ${assessment.outcomeCategory} | ${assessment.promotable ? 'yes' : 'no'} | ${assessment.proposedRegistrySourceId || '-'} |`,
    )
  }

  if (report.assessments.length === 0) {
    md.push('| - | - | - | - | - | - | - |')
  }

  md.push('', '## Promotion preview', '', `- registry insertions: ${report.promotionPreview.registryInsertions.length}`)
  md.push(`- blocked candidates: ${report.promotionPreview.blockedCandidates.length}`)

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(OUTPUT_MD, `${md.join('\n')}\n`)

  console.log(`Wrote ${path.relative(ROOT, OUTPUT_JSON)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_MD)}`)
  console.log(
    `Candidates=${report.summary.candidateCount} promotable=${report.summary.promotableCount} previewInsertions=${report.summary.promotedPreviewCount}`,
  )
}

run()
