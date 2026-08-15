export type EditorialReviewKind = 'evidence' | 'safety' | 'factual' | 'external'

export type EditorialReviewRecord = {
  id: string
  pagePath: string
  reviewedAt: string
  kind: EditorialReviewKind
  reviewerName: string
  reviewerRole?: string
  qualifications?: string
  evidenceSearchDate?: string
  summary?: string
}

export type PublicCorrectionRecord = {
  id: string
  pagePath: string
  publishedAt: string
  summary: string
  before?: string
  after?: string
  reason: string
  sources?: string[]
  supersedes?: string
}

export type EditorialFreshness = {
  lastReviewed: string
  evidenceSearchDate: string
  factualUpdatedAt: string
  templateUpdatedAt: string
  citationCount: number
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/

export function isValidEditorialDate(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const clean = value.trim()
  if (!clean || (!DATE_ONLY.test(clean) && !ISO_DATE_TIME.test(clean))) return false
  return !Number.isNaN(Date.parse(clean))
}

function firstDate(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key]
    if (isValidEditorialDate(value)) return value.trim()
  }
  return ''
}

/**
 * Editorial review dates are intentionally fail-closed.
 * Generic updated/build timestamps are NOT accepted as evidence that a human
 * review happened. This prevents deployments and data transforms from
 * masquerading as scientific review events.
 */
export function getRecordedEditorialReviewDate(record: Record<string, unknown>): string {
  return firstDate(record, [
    'editorial_reviewed_at',
    'editorialReviewedAt',
    'evidence_reviewed_at',
    'evidenceReviewedAt',
    'last_reviewed',
    'lastReviewed',
    'reviewed_at',
    'reviewedAt',
  ])
}

export function getRecordedEvidenceSearchDate(record: Record<string, unknown>): string {
  return firstDate(record, [
    'last_evidence_search_date',
    'lastEvidenceSearchDate',
    'evidence_search_date',
    'evidenceSearchDate',
    'literature_search_date',
    'literatureSearchDate',
  ])
}

/**
 * A factual update is a content/data event, not a template or deployment event.
 * Generic updatedAt is deliberately excluded because its semantics vary across
 * legacy sources.
 */
export function getRecordedFactualUpdateDate(record: Record<string, unknown>): string {
  return firstDate(record, [
    'factual_updated_at',
    'factualUpdatedAt',
    'content_updated_at',
    'contentUpdatedAt',
    'data_updated_at',
    'dataUpdatedAt',
  ])
}

export function getRecordedTemplateUpdateDate(record: Record<string, unknown>): string {
  return firstDate(record, [
    'template_updated_at',
    'templateUpdatedAt',
    'build_updated_at',
    'buildUpdatedAt',
  ])
}

export function normalizeEditorialFreshness(
  record: Record<string, unknown>,
  citationCount = 0,
): EditorialFreshness {
  return {
    lastReviewed: getRecordedEditorialReviewDate(record),
    evidenceSearchDate: getRecordedEvidenceSearchDate(record),
    factualUpdatedAt: getRecordedFactualUpdateDate(record),
    templateUpdatedAt: getRecordedTemplateUpdateDate(record),
    citationCount: Number.isFinite(citationCount) && citationCount > 0 ? Math.floor(citationCount) : 0,
  }
}

export function validateReviewRecord(record: EditorialReviewRecord): string[] {
  const errors: string[] = []
  if (!record.id.trim()) errors.push('Review record is missing id.')
  if (!record.pagePath.startsWith('/')) errors.push(`${record.id}: pagePath must be site-relative.`)
  if (!isValidEditorialDate(record.reviewedAt)) errors.push(`${record.id}: reviewedAt is invalid.`)
  if (!record.reviewerName.trim()) errors.push(`${record.id}: reviewerName is required.`)
  if (record.kind === 'external' && !record.qualifications?.trim()) {
    errors.push(`${record.id}: external review cannot be presented without qualifications.`)
  }
  if (record.evidenceSearchDate && !isValidEditorialDate(record.evidenceSearchDate)) {
    errors.push(`${record.id}: evidenceSearchDate is invalid.`)
  }
  return errors
}

export function validateCorrectionRecord(record: PublicCorrectionRecord): string[] {
  const errors: string[] = []
  if (!record.id.trim()) errors.push('Correction record is missing id.')
  if (!record.pagePath.startsWith('/')) errors.push(`${record.id}: pagePath must be site-relative.`)
  if (!isValidEditorialDate(record.publishedAt)) errors.push(`${record.id}: publishedAt is invalid.`)
  if (!record.summary.trim()) errors.push(`${record.id}: summary is required.`)
  if (!record.reason.trim()) errors.push(`${record.id}: reason is required.`)
  return errors
}

export function latestReviewForPage(
  reviews: EditorialReviewRecord[],
  pagePath: string,
): EditorialReviewRecord | undefined {
  return reviews
    .filter(review => review.pagePath === pagePath)
    .sort((a, b) => Date.parse(b.reviewedAt) - Date.parse(a.reviewedAt))[0]
}

export function correctionsForPage(
  corrections: PublicCorrectionRecord[],
  pagePath: string,
): PublicCorrectionRecord[] {
  return corrections
    .filter(correction => correction.pagePath === pagePath)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
}
