import type { RuntimeRecord } from '../types/content'
import { getEvidenceLabel, getEvidenceLetterGrade } from '../../lib/evidence'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import { canonicalUrl } from './seo'
import { canRenderAffiliateLinks } from './affiliate'

export type CanonicalContentKind = 'herb' | 'compound'

const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*$/
const ENTITY_ID = /^ent_[a-z_]+_[0-9a-f]{12}$/

export type CanonicalRuntimeContentRecord = RuntimeRecord

export type RuntimeContentIssue = {
  source: string
  index?: number
  slug?: string
  issues: string[]
}

type ContractValidationIssue = {
  path: string[]
  message: string
}

type ContractParseResult =
  | { success: true; data: CanonicalRuntimeContentRecord }
  | { success: false; error: { issues: ContractValidationIssue[] } }

const STRING_FIELDS = [
  'name',
  'displayName',
  'compoundName',
  'canonicalCompoundName',
  'entityType',
  'entity_type',
  'scientificname',
  'scientificName',
  'latinName',
  'evidence_grade',
  'evidence_tier',
  'evidenceTier',
  'indexability_status',
  'robots',
  'runtime_export_decision',
  'profile_status',
  'summary_quality',
] as const

const STRING_OR_STRING_ARRAY_FIELDS = ['aliases', 'commonnames', 'commonNames'] as const
const BOOLEAN_OR_STRING_FIELDS = ['sitemap_included', 'monetization_allowed'] as const

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function validateRuntimeContentRecord(value: unknown): ContractParseResult {
  if (!isObjectRecord(value)) {
    return { success: false, error: { issues: [{ path: [], message: 'expected an object record' }] } }
  }

  const issues: ContractValidationIssue[] = []
  const slug = value.slug
  if (typeof slug !== 'string' || !SAFE_SLUG.test(slug)) {
    issues.push({ path: ['slug'], message: 'must be a lowercase URL-safe slug' })
  }

  // Canonical entity IDs are validated when present. Legacy non-canonical IDs
  // are retained during migration rather than turning an otherwise valid public
  // profile into a runtime 404.
  if (value.id !== undefined) {
    if (typeof value.id !== 'string') {
      issues.push({ path: ['id'], message: 'must be a string when present' })
    } else if (value.id.startsWith('ent_') && !ENTITY_ID.test(value.id)) {
      issues.push({ path: ['id'], message: 'malformed canonical entity ID' })
    }
  }

  for (const field of STRING_FIELDS) {
    const fieldValue = value[field]
    if (fieldValue !== undefined && fieldValue !== null && typeof fieldValue !== 'string') {
      issues.push({ path: [field], message: 'must be a string when present' })
    }
  }

  for (const field of STRING_OR_STRING_ARRAY_FIELDS) {
    const fieldValue = value[field]
    if (fieldValue === undefined || fieldValue === null) continue
    const valid = typeof fieldValue === 'string'
      || (Array.isArray(fieldValue) && fieldValue.every((item) => typeof item === 'string'))
    if (!valid) issues.push({ path: [field], message: 'must be a string or string array when present' })
  }

  for (const field of BOOLEAN_OR_STRING_FIELDS) {
    const fieldValue = value[field]
    if (fieldValue === undefined || fieldValue === null) continue
    if (typeof fieldValue !== 'boolean' && typeof fieldValue !== 'string') {
      issues.push({ path: [field], message: 'must be a boolean or string when present' })
    }
  }

  if (issues.length) return { success: false, error: { issues } }
  return { success: true, data: value as CanonicalRuntimeContentRecord }
}

/**
 * Runtime-facing content contract.
 *
 * The workbook/canonical store remains the source of truth. This dependency-free
 * parser is the boundary between generated JSON and application code: it checks
 * the identity/governance fields the UI relies on while deliberately passing
 * through legacy enrichment fields until their migrations are complete.
 *
 * The `safeParse` shape is intentionally tiny and local. It avoids adding a
 * runtime schema dependency solely for this boundary while keeping callers
 * explicit about success/failure.
 */
export const runtimeContentRecordSchema = {
  safeParse: validateRuntimeContentRecord,
}

function cleanString(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

function splitAliases(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(splitAliases)
  if (typeof value !== 'string') return []
  return value
    .split(/[|;,\n]/g)
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function uniqueCaseInsensitive(values: string[]): string[] {
  const seen = new Set<string>()
  const output: string[] = []
  for (const value of values) {
    const key = value.toLocaleLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    output.push(value)
  }
  return output
}

export function getCanonicalDisplayName(record: Record<string, unknown>): string {
  return (
    cleanString(record.displayName) ||
    cleanString(record.name) ||
    cleanString(record.compoundName) ||
    cleanString(record.canonicalCompoundName) ||
    cleanString(record.common) ||
    cleanString(record.slug)
  )
}

export function getCanonicalAliases(record: Record<string, unknown>): string[] {
  const canonicalName = getCanonicalDisplayName(record).toLocaleLowerCase()
  return uniqueCaseInsensitive([
    ...splitAliases(record.aliases),
    ...splitAliases(record.commonnames),
    ...splitAliases(record.commonNames),
    cleanString(record.scientificname),
    cleanString(record.scientificName),
    cleanString(record.latinName),
  ].filter(Boolean)).filter((alias) => alias.toLocaleLowerCase() !== canonicalName)
}

export function getCanonicalEntityPath(record: Record<string, unknown>, kind?: CanonicalContentKind): string {
  const slug = cleanString(record.slug)
  if (!SAFE_SLUG.test(slug)) return ''
  const explicitType = cleanString(record.entityType || record.entity_type).toLowerCase()
  const resolvedKind = kind || (explicitType === 'herb' ? 'herb' : explicitType === 'compound' ? 'compound' : undefined)
  if (!resolvedKind) return ''
  return `/${resolvedKind === 'herb' ? 'herbs' : 'compounds'}/${slug}/`
}

export function getCanonicalEntityUrl(record: Record<string, unknown>, kind?: CanonicalContentKind): string {
  const entityPath = getCanonicalEntityPath(record, kind)
  return entityPath ? canonicalUrl(entityPath) : ''
}

export function getCanonicalEvidenceLanguage(record: RuntimeRecord): string {
  return getEvidenceLabel(record)
}

export function getCanonicalEvidenceGrade(record: RuntimeRecord): string {
  return getEvidenceLetterGrade(record)
}

export type CanonicalCitation = {
  text: string
  href: string
  identifier: string
}

export function formatCanonicalCitation(source: unknown): CanonicalCitation {
  if (!source || typeof source !== 'object') return { text: '', href: '', identifier: '' }
  const row = source as Record<string, unknown>
  const title = cleanString(row.title)
  const authors = cleanString(row.authors || row.author || row.author_or_label)
  const journal = cleanString(row.journal)
  const year = cleanString(row.year)
  const pmid = cleanString(row.pmid).replace(/^PMID:\s*/i, '')
  const doi = cleanString(row.doi).replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '')
  const rawUrl = cleanString(row.url)

  const labelParts = [authors, title, journal, year].filter(Boolean)
  const identifier = pmid ? `PMID ${pmid}` : doi ? `DOI ${doi}` : ''
  if (identifier) labelParts.push(identifier)

  const href = pmid
    ? `https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(pmid)}/`
    : doi
      ? `https://doi.org/${doi}`
      : rawUrl

  return {
    text: labelParts.join('. '),
    href,
    identifier,
  }
}

export function getCanonicalContentPolicy(record: RuntimeRecord, kind?: CanonicalContentKind) {
  const visibility = getRuntimeVisibility(record)
  return {
    path: getCanonicalEntityPath(record, kind),
    url: getCanonicalEntityUrl(record, kind),
    evidenceLabel: getCanonicalEvidenceLanguage(record),
    evidenceGrade: getCanonicalEvidenceGrade(record),
    visibility,
    canMonetize: visibility.canMonetize && canRenderAffiliateLinks(record),
  }
}

/**
 * Validate + normalize one generated profile before application code sees it.
 * Invalid records return null (fail closed) rather than being cast to
 * RuntimeRecord. Unknown legacy fields are preserved by the parser.
 */
export function normalizeRuntimeContentRecord(
  value: unknown,
  kind?: CanonicalContentKind,
): CanonicalRuntimeContentRecord | null {
  const parsed = runtimeContentRecordSchema.safeParse(value)
  if (!parsed.success) return null

  const record = parsed.data
  const displayName = getCanonicalDisplayName(record)
  const aliases = getCanonicalAliases(record)
  const entityType = kind || (record.entityType === 'herb' || record.entityType === 'compound' ? record.entityType : undefined)

  return {
    ...record,
    ...(displayName ? { name: displayName, displayName } : {}),
    ...(aliases.length ? { aliases } : {}),
    ...(entityType ? { entityType } : {}),
  }
}

export function normalizeRuntimeContentRecords(
  value: unknown,
  kind?: CanonicalContentKind,
  source = 'runtime-json',
): { records: CanonicalRuntimeContentRecord[]; issues: RuntimeContentIssue[] } {
  if (!Array.isArray(value)) {
    return {
      records: [],
      issues: [{ source, issues: ['expected an array of runtime content records'] }],
    }
  }

  const records: CanonicalRuntimeContentRecord[] = []
  const issues: RuntimeContentIssue[] = []

  value.forEach((candidate, index) => {
    const parsed = runtimeContentRecordSchema.safeParse(candidate)
    if (!parsed.success) {
      const slug = candidate && typeof candidate === 'object'
        ? cleanString((candidate as Record<string, unknown>).slug)
        : ''
      issues.push({
        source,
        index,
        ...(slug ? { slug } : {}),
        issues: parsed.error.issues.map((issue) => `${issue.path.join('.') || 'record'}: ${issue.message}`),
      })
      return
    }

    const normalized = normalizeRuntimeContentRecord(parsed.data, kind)
    if (normalized) records.push(normalized)
  })

  return { records, issues }
}

export function isSafeContentSlug(value: string): boolean {
  return SAFE_SLUG.test(value)
}
