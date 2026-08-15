import { z } from 'zod'
import type { RuntimeRecord } from '../types/content'
import { getEvidenceLabel, getEvidenceLetterGrade } from '../../lib/evidence'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import { canonicalUrl } from './seo'
import { canRenderAffiliateLinks } from './affiliate'

export type CanonicalContentKind = 'herb' | 'compound'

const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*$/
const ENTITY_ID = /^ent_[a-z_]+_[0-9a-f]{12}$/

const stringOrStringArray = z.union([z.string(), z.array(z.string())]).optional()

/**
 * Runtime-facing content contract.
 *
 * The workbook/canonical store remains the source of truth. This schema is the
 * boundary between generated JSON and application code: it validates the
 * identity/governance fields the UI depends on while deliberately passing
 * through legacy enrichment fields until their migrations are complete.
 */
export const runtimeContentRecordSchema = z.object({
  slug: z.string().regex(SAFE_SLUG),
  id: z.string().regex(ENTITY_ID).optional(),
  name: z.string().optional(),
  displayName: z.string().optional(),
  compoundName: z.string().optional(),
  canonicalCompoundName: z.string().optional(),
  entityType: z.string().optional(),
  entity_type: z.string().optional(),
  aliases: stringOrStringArray,
  commonnames: stringOrStringArray,
  commonNames: stringOrStringArray,
  scientificname: z.string().optional(),
  scientificName: z.string().optional(),
  latinName: z.string().optional(),
  evidence_grade: z.string().optional(),
  evidence_tier: z.string().optional(),
  evidenceTier: z.string().optional(),
  indexability_status: z.string().optional(),
  robots: z.string().optional(),
  sitemap_included: z.union([z.boolean(), z.string()]).optional(),
  runtime_export_decision: z.string().optional(),
  profile_status: z.string().optional(),
  summary_quality: z.string().optional(),
  monetization_allowed: z.union([z.boolean(), z.string()]).optional(),
}).passthrough()

export type CanonicalRuntimeContentRecord = z.infer<typeof runtimeContentRecordSchema> & RuntimeRecord

export type RuntimeContentIssue = {
  source: string
  index?: number
  slug?: string
  issues: string[]
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
 * RuntimeRecord. Unknown legacy fields are preserved by the passthrough schema.
 */
export function normalizeRuntimeContentRecord(
  value: unknown,
  kind?: CanonicalContentKind,
): CanonicalRuntimeContentRecord | null {
  const parsed = runtimeContentRecordSchema.safeParse(value)
  if (!parsed.success) return null

  const record = parsed.data as CanonicalRuntimeContentRecord
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
