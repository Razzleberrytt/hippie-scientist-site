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

type WaveCandidate = SourceCandidate & {
  relatedEntities: Array<{ entityType: 'herb' | 'compound'; entitySlug: string }>
  relatedTopicGaps: string[]
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
  accessDate?: string
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

type IntakeTask = {
  intakeTaskId: string
  itemType: string
  entitySlug: string | null
  topicType: string
  sourceGapType: string
  safetyCritical: boolean
  publishBlocking: boolean
  recommendedSourceClasses: string[]
}

type SourceIntakeQueueReport = {
  summary: { totalTasks: number }
  tasks: IntakeTask[]
}

type WaveTargetsReport = {
  targets: Array<{ entityType: 'herb' | 'compound'; entitySlug: string; highestPriorityMissingTopics: string[] }>
}

type WaveCandidatesReport = {
  candidates: WaveCandidate[]
}

const ROOT = process.cwd()
const SOURCE_CANDIDATES_PATH = path.join(ROOT, 'ops', 'source-candidates.json')
const SOURCE_REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const SOURCE_CANDIDATE_SCHEMA_PATH = path.join(ROOT, 'schemas', 'source-candidate.schema.json')
const INTAKE_PATH = path.join(ROOT, 'ops', 'reports', 'source-intake-queue.json')
const WAVE_ID = process.env.ENRICHMENT_WAVE_ID || 'wave-2'
const SAFE_WAVE_ID = WAVE_ID.replace(/[^a-z0-9-]+/gi, '-').toLowerCase()
const WAVE_TARGETS_PATH = process.env.ENRICHMENT_WAVE_TARGETS_PATH || path.join(ROOT, 'ops', 'reports', `source-${SAFE_WAVE_ID}-targets.json`)
const WAVE_CANDIDATES_PATH = process.env.ENRICHMENT_WAVE_CANDIDATES_PATH || path.join(ROOT, 'ops', 'reports', `source-${SAFE_WAVE_ID}-candidates.json`)
const OUTPUT_JSON = process.env.ENRICHMENT_WAVE_SOURCE_REVIEW_JSON_PATH || path.join(ROOT, 'ops', 'reports', `source-${SAFE_WAVE_ID}-review.json`)
const OUTPUT_MD = process.env.ENRICHMENT_WAVE_SOURCE_REVIEW_MD_PATH || path.join(ROOT, 'ops', 'reports', `source-${SAFE_WAVE_ID}-review.md`)

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
    const pathname = url.pathname.replace(/\/+$/g, '') || '/'
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

function toEntityKey(entityType: 'herb' | 'compound', entitySlug: string): string {
  return `${entityType}:${entitySlug}`
}

function run() {
  const candidateSchema = readJson(SOURCE_CANDIDATE_SCHEMA_PATH)
  const sourceCandidates = readJson<SourceCandidate[]>(SOURCE_CANDIDATES_PATH)
  const sourceRegistry = readJson<SourceRegistryRow[]>(SOURCE_REGISTRY_PATH)
  const intake = readJson<SourceIntakeQueueReport>(INTAKE_PATH)
  const waveTargets = readJson<WaveTargetsReport>(WAVE_TARGETS_PATH)
  const waveCandidatesReport = readJson<WaveCandidatesReport>(WAVE_CANDIDATES_PATH)

  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: true })
  addFormats(ajv)
  const validate = ajv.compile(candidateSchema)
  if (!validate(sourceCandidates)) {
    throw new Error(`Candidate queue schema validation failed: ${JSON.stringify(validate.errors ?? [], null, 2)}`)
  }

  const waveCandidateIds = new Set(waveCandidatesReport.candidates.map(candidate => candidate.candidateSourceId))
  const waveCandidates = sourceCandidates.filter(candidate => waveCandidateIds.has(candidate.candidateSourceId))

  const waveCandidateById = new Map(waveCandidatesReport.candidates.map(candidate => [candidate.candidateSourceId, candidate]))
  const intakeById = new Map(intake.tasks.map(task => [task.intakeTaskId, task]))
  const activeRegistry = sourceRegistry.filter(source => source.active)
  const activeByDoi = new Map(activeRegistry.filter(s => isNonEmpty(s.doi)).map(s => [s.doi!.toLowerCase(), s]))
  const activeByPmid = new Map(activeRegistry.filter(s => isNonEmpty(s.pmid)).map(s => [s.pmid!, s]))
  const activeByUrl = new Map(
    activeRegistry
      .map(source => [canonicalizeUrl(source.canonicalUrl), source] as const)
      .filter((entry): entry is [string, SourceRegistryRow] => isNonEmpty(entry[0])),
  )

  const takenSourceIds = new Set(sourceRegistry.map(row => row.sourceId))
  const nowIso = new Date().toISOString()
  const reviewDate = nowIso.slice(0, 10)

  const duplicateWithinWave = new Map<string, string>()
  const promotedRows: SourceRegistryRow[] = []
  const approvedCandidateIds = new Set<string>()
  const rejectedCandidateIds = new Set<string>()
  const duplicateCandidateIds = new Set<string>()
  const needsMetadataIds = new Set<string>()
  const promotedSourceIdsByEntity = new Map<string, string[]>()
  const sourceCountsByClass = new Map<string, number>()

  const decisionRows: Array<{
    candidateSourceId: string
    intakeTaskId: string
    reviewStatus: ReviewStatus
    outcomeCategory: OutcomeCategory
    reasons: string[]
    duplicateOfSourceId?: string
    promotedSourceId?: string
    entityKeys: string[]
  }> = []

  for (const candidate of waveCandidates) {
    const intakeTask = intakeById.get(candidate.intakeTaskId)
    const metadataIssues: string[] = []
    const lowValueFlags: string[] = []
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
      const existing = activeByDoi.get(candidate.doi.toLowerCase())
      if (existing) duplicateMatches.push({ sourceId: existing.sourceId, matchType: 'doi' })
      const key = `doi:${candidate.doi.toLowerCase()}`
      if (!duplicateMatches.length && duplicateWithinWave.has(key)) {
        duplicateMatches.push({ sourceId: duplicateWithinWave.get(key)!, matchType: 'doi' })
      } else {
        duplicateWithinWave.set(key, candidate.candidateSourceId)
      }
    }

    if (isNonEmpty(candidate.pmid)) {
      const existing = activeByPmid.get(candidate.pmid)
      if (existing) duplicateMatches.push({ sourceId: existing.sourceId, matchType: 'pmid' })
      const key = `pmid:${candidate.pmid}`
      if (!duplicateMatches.length && duplicateWithinWave.has(key)) {
        duplicateMatches.push({ sourceId: duplicateWithinWave.get(key)!, matchType: 'pmid' })
      } else {
        duplicateWithinWave.set(key, candidate.candidateSourceId)
      }
    }

    const normalizedUrl = canonicalizeUrl(candidate.canonicalUrl)
    if (normalizedUrl) {
      const existing = activeByUrl.get(normalizedUrl)
      if (existing) duplicateMatches.push({ sourceId: existing.sourceId, matchType: 'canonicalUrl' })
      const key = `url:${normalizedUrl}`
      if (!duplicateMatches.length && duplicateWithinWave.has(key)) {
        duplicateMatches.push({ sourceId: duplicateWithinWave.get(key)!, matchType: 'canonicalUrl' })
      } else {
        duplicateWithinWave.set(key, candidate.candidateSourceId)
      }
    }

    const wrongClassForGap = Boolean(
      intakeTask && intakeTask.recommendedSourceClasses.length > 0 && !intakeTask.recommendedSourceClasses.includes(candidate.sourceClass),
    )

    let reviewStatus: ReviewStatus = 'approved_for_registry'
    let outcomeCategory: OutcomeCategory = 'approved_new_source'
    const reasons: string[] = []
    let duplicateOfSourceId: string | undefined
    let promotedSourceId: string | undefined

    if (duplicateMatches.length > 0 || candidate.duplicateRisk === 'known-duplicate' || isNonEmpty(candidate.duplicateOfSourceId)) {
      reviewStatus = 'duplicate_of_existing'
      outcomeCategory = 'duplicate_of_existing'
      duplicateOfSourceId = candidate.duplicateOfSourceId || duplicateMatches[0]?.sourceId
      reasons.push(
        `Duplicate detected against ${
          duplicateMatches.map(match => `${match.sourceId}:${match.matchType}`).join(', ') || candidate.duplicateOfSourceId
        }.`,
      )
    } else if (metadataIssues.length > 0) {
      reviewStatus = 'needs_metadata'
      outcomeCategory = 'insufficient_metadata'
      reasons.push(...metadataIssues)
    } else if (wrongClassForGap) {
      reviewStatus = 'rejected'
      outcomeCategory = 'wrong_source_class_for_intended_gap'
      reasons.push(
        `sourceClass=${candidate.sourceClass} is not in intake recommendedSourceClasses=${
          intakeTask?.recommendedSourceClasses.join(', ') || 'none'
        } for safety/topic gap ${intakeTask?.topicType || 'unknown'}.`,
      )
    } else if (lowValueFlags.length > 0) {
      reviewStatus = 'rejected'
      outcomeCategory = 'low_value_non_qualifying'
      reasons.push(...lowValueFlags)
    } else {
      const sourceId = buildUniqueSourceId(sourceIdBase(candidate), takenSourceIds)
      promotedSourceId = sourceId
      approvedCandidateIds.add(candidate.candidateSourceId)
      sourceCountsByClass.set(candidate.sourceClass, (sourceCountsByClass.get(candidate.sourceClass) || 0) + 1)

      const waveCandidate = waveCandidateById.get(candidate.candidateSourceId)
      for (const rel of waveCandidate?.relatedEntities || []) {
        const key = toEntityKey(rel.entityType, rel.entitySlug)
        const list = promotedSourceIdsByEntity.get(key) || []
        list.push(sourceId)
        promotedSourceIdsByEntity.set(key, list)
      }

      promotedRows.push({
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
        accessDate: reviewDate,
        language: candidate.language || 'en',
        jurisdiction: candidate.jurisdiction,
        evidenceClass: candidate.evidenceClass,
        studyDesign: candidate.studyDesign,
        publicationStatus: candidate.publicationStatus,
        reliabilityTier: candidate.proposedReliabilityTier,
        reviewer: 'source-review-bot',
        reviewedAt: nowIso,
        notes: `Promoted via source-${SAFE_WAVE_ID} review. intakeTaskId=${candidate.intakeTaskId}; candidateSourceId=${candidate.candidateSourceId}.`,
        active: candidate.active,
      })
      reasons.push('Approved via governed wave-1 review checks and promoted to source registry.')
    }

    if (reviewStatus === 'rejected') rejectedCandidateIds.add(candidate.candidateSourceId)
    if (reviewStatus === 'duplicate_of_existing') duplicateCandidateIds.add(candidate.candidateSourceId)
    if (reviewStatus === 'needs_metadata') needsMetadataIds.add(candidate.candidateSourceId)

    const waveCandidate = waveCandidateById.get(candidate.candidateSourceId)
    decisionRows.push({
      candidateSourceId: candidate.candidateSourceId,
      intakeTaskId: candidate.intakeTaskId,
      reviewStatus,
      outcomeCategory,
      reasons,
      duplicateOfSourceId,
      promotedSourceId,
      entityKeys: (waveCandidate?.relatedEntities || []).map(entity => toEntityKey(entity.entityType, entity.entitySlug)),
    })
  }

  const updatedCandidates = sourceCandidates.map(candidate => {
    const decision = decisionRows.find(row => row.candidateSourceId === candidate.candidateSourceId)
    if (!decision) return candidate
    return {
      ...candidate,
      reviewStatus: decision.reviewStatus,
      reviewer: decision.reviewStatus === 'approved_for_registry' ? 'source-review-bot' : 'source-review-bot',
      reviewedAt: nowIso,
      duplicateOfSourceId: decision.duplicateOfSourceId,
      approvalNotes: decision.reviewStatus === 'approved_for_registry' ? decision.reasons.join(' ') : undefined,
      rejectionReasons:
        decision.reviewStatus === 'rejected' || decision.reviewStatus === 'needs_metadata'
          ? decision.reasons
          : decision.reviewStatus === 'duplicate_of_existing'
            ? [`Duplicate of ${decision.duplicateOfSourceId || 'existing source'}.`]
            : undefined,
    }
  })

  const mergedRegistry = [...sourceRegistry, ...promotedRows].sort((a, b) => a.sourceId.localeCompare(b.sourceId))
  fs.writeFileSync(SOURCE_CANDIDATES_PATH, `${JSON.stringify(updatedCandidates, null, 2)}\n`)
  fs.writeFileSync(SOURCE_REGISTRY_PATH, `${JSON.stringify(mergedRegistry, null, 2)}\n`)

  const selectedTargetKeys = new Set(waveTargets.targets.map(target => toEntityKey(target.entityType, target.entitySlug)))
  const coveredTopicsByEntity = new Map<string, Set<string>>()
  for (const row of decisionRows) {
    if (!row.promotedSourceId) continue
    const waveCandidate = waveCandidateById.get(row.candidateSourceId)
    if (!waveCandidate) continue
    for (const related of waveCandidate.relatedEntities) {
      const key = toEntityKey(related.entityType, related.entitySlug)
      const topics = coveredTopicsByEntity.get(key) || new Set<string>()
      for (const topic of waveCandidate.relatedTopicGaps) topics.add(topic)
      coveredTopicsByEntity.set(key, topics)
    }
  }

  const unresolvedByEntity = new Map<string, string[]>()
  const safetyUnresolvedByEntity = new Map<string, string[]>()
  const countsByEntity = new Map<string, number>()

  for (const row of decisionRows) {
    if (!row.promotedSourceId) continue
    for (const key of row.entityKeys) countsByEntity.set(key, (countsByEntity.get(key) || 0) + 1)
  }

  for (const task of intake.tasks) {
    if (!task.entitySlug) continue
    const entityType = task.itemType === 'compound_page' ? 'compound' : task.itemType === 'herb_page' ? 'herb' : null
    if (!entityType) continue
    const key = toEntityKey(entityType, task.entitySlug)
    if (!selectedTargetKeys.has(key)) continue

    const coveredTopics = coveredTopicsByEntity.get(key) || new Set<string>()
    if (!coveredTopics.has(task.topicType)) {
      const list = unresolvedByEntity.get(key) || []
      if (!list.includes(task.topicType)) list.push(task.topicType)
      unresolvedByEntity.set(key, list)

      if (task.safetyCritical || task.topicType === 'safety') {
        const safetyList = safetyUnresolvedByEntity.get(key) || []
        if (!safetyList.includes(task.topicType)) safetyList.push(task.topicType)
        safetyUnresolvedByEntity.set(key, safetyList)
      }
    }
  }

  const report = {
    generatedAt: nowIso,
    deterministicModelVersion: `source-${SAFE_WAVE_ID}-review-v1`,
    sources: {
      waveTargets: path.relative(ROOT, WAVE_TARGETS_PATH),
      waveCandidates: path.relative(ROOT, WAVE_CANDIDATES_PATH),
      intakeQueue: path.relative(ROOT, INTAKE_PATH),
      sourceCandidates: path.relative(ROOT, SOURCE_CANDIDATES_PATH),
      sourceRegistry: path.relative(ROOT, SOURCE_REGISTRY_PATH),
    },
    summary: {
      reviewedCandidateCount: waveCandidates.length,
      approvedCount: approvedCandidateIds.size,
      rejectedCount: rejectedCandidateIds.size,
      duplicateCount: duplicateCandidateIds.size,
      needsMetadataCount: needsMetadataIds.size,
      promotedCount: promotedRows.length,
      sourceCountsByClass: Object.fromEntries(Array.from(sourceCountsByClass.entries()).sort()),
      sourceCountsByEntity: Object.fromEntries(Array.from(countsByEntity.entries()).sort()),
    },
    candidateDecisions: decisionRows.sort((a, b) => a.candidateSourceId.localeCompare(b.candidateSourceId)),
    promotedSourceIdsByEntity: Object.fromEntries(
      Array.from(promotedSourceIdsByEntity.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, ids]) => [key, ids.sort()]),
    ),
    unresolvedHighPriorityGaps: Object.fromEntries(
      Array.from(unresolvedByEntity.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, topics]) => [key, topics.sort()]),
    ),
    unresolvedSafetyCriticalGaps: Object.fromEntries(
      Array.from(safetyUnresolvedByEntity.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, topics]) => [key, topics.sort()]),
    ),
  }

  const md: string[] = []
  md.push(`# Source ${WAVE_ID} Candidate Review and Registry Promotion`)
  md.push('')
  md.push(`Generated: ${report.generatedAt}`)
  md.push('')
  md.push('## Decision summary')
  md.push(`- Reviewed candidates: ${report.summary.reviewedCandidateCount}`)
  md.push(`- Approved for registry: ${report.summary.approvedCount}`)
  md.push(`- Rejected: ${report.summary.rejectedCount}`)
  md.push(`- Duplicate: ${report.summary.duplicateCount}`)
  md.push(`- Needs metadata: ${report.summary.needsMetadataCount}`)
  md.push(`- Promoted into source registry: ${report.summary.promotedCount}`)
  md.push('')
  md.push('## Candidate decision states')
  md.push('| candidateSourceId | reviewStatus | outcome | promotedSourceId | duplicateOfSourceId |')
  md.push('| --- | --- | --- | --- | --- |')
  for (const row of report.candidateDecisions) {
    md.push(
      `| ${row.candidateSourceId} | ${row.reviewStatus} | ${row.outcomeCategory} | ${row.promotedSourceId || '-'} | ${row.duplicateOfSourceId || '-'} |`,
    )
  }
  md.push('')
  md.push('## Source counts by class')
  for (const [sourceClass, count] of Object.entries(report.summary.sourceCountsByClass)) {
    md.push(`- ${sourceClass}: ${count}`)
  }
  md.push('')
  md.push('## Source counts by entity')
  for (const [entity, count] of Object.entries(report.summary.sourceCountsByEntity)) {
    md.push(`- ${entity}: ${count}`)
  }
  md.push('')
  md.push('## Unresolved high-priority source gaps after promotion')
  for (const [entity, topics] of Object.entries(report.unresolvedHighPriorityGaps)) {
    md.push(`- ${entity}: ${topics.length > 0 ? topics.join(', ') : 'none'}`)
  }
  md.push('')
  md.push('## Safety-critical unresolved gaps after promotion')
  const safetyEntries = Object.entries(report.unresolvedSafetyCriticalGaps)
  if (safetyEntries.length === 0) {
    md.push('- none')
  } else {
    for (const [entity, topics] of safetyEntries) {
      md.push(`- ${entity}: ${topics.join(', ')}`)
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(OUTPUT_MD, `${md.join('\n')}\n`)

  console.log(`Wrote ${path.relative(ROOT, OUTPUT_JSON)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_MD)}`)
  console.log(
    `[source-${SAFE_WAVE_ID}-review] reviewed=${report.summary.reviewedCandidateCount} approved=${report.summary.approvedCount} rejected=${report.summary.rejectedCount} duplicate=${report.summary.duplicateCount}`,
  )
}

run()
