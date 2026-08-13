import { cache } from './react-cache'
import { getCompoundSummaryIndex, getHerbSummaryIndex } from './runtime-summary-indexes'
import type { RuntimeRecord } from '../types/content'

const META_TITLE_MAX = 60
const META_DESCRIPTION_MIN = 110
const META_DESCRIPTION_MAX = 160

function cleanText(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function displayName(record: RuntimeRecord): string {
  const raw = cleanText(record.displayName || record.name || record.slug)
  return raw.replace(/\s*\([^)]*\)\s*$/, '').trim() || raw
}

function compactTitle(value: string, fallback: string): string {
  const cleaned = cleanText(value)
  if (cleaned && cleaned.length <= META_TITLE_MAX) return cleaned
  if (fallback.length <= META_TITLE_MAX) return fallback

  const cutoff = fallback.slice(0, META_TITLE_MAX - 1)
  const lastBreak = cutoff.lastIndexOf(' ')
  return `${(lastBreak > 30 ? cutoff.slice(0, lastBreak) : cutoff).trim()}…`
}

function compactDescription(value: string): string {
  if (value.length <= META_DESCRIPTION_MAX) return value
  const cutoff = value.slice(0, META_DESCRIPTION_MAX - 1)
  const lastBreak = Math.max(cutoff.lastIndexOf(' '), cutoff.lastIndexOf(','), cutoff.lastIndexOf(';'))
  return `${(lastBreak > 100 ? cutoff.slice(0, lastBreak) : cutoff).trim()}…`
}

function generatedDescription(name: string, type: 'herb' | 'compound'): string {
  const subject = type === 'herb' ? 'herb profile' : 'compound profile'
  return `${name} ${subject} with evidence context, key research topics, source notes, safety context, and references presented in an evidence-first format.`
}

function optimizeMetadataRecord(record: RuntimeRecord, type: 'herb' | 'compound'): RuntimeRecord {
  const name = displayName(record)
  const rawTitle = cleanText(record.meta_title || record.metaTitle)
  const titleFallback = type === 'herb'
    ? `${name} Benefits, Dosage & Safety`
    : `${name}: Effects, Dose & Safety`
  const metaTitle = compactTitle(rawTitle, titleFallback)

  const rawDescription = cleanText(record.meta_description || record.metaDescription || record.description)
  const richerDescription = rawDescription.length >= META_DESCRIPTION_MIN
    ? rawDescription
    : generatedDescription(name, type)
  const metaDescription = compactDescription(richerDescription)

  return {
    ...record,
    meta_title: metaTitle,
    meta_description: metaDescription,
  } as RuntimeRecord
}

function buildSlugMap(records: RuntimeRecord[], type: 'herb' | 'compound') {
  const bySlug = new Map<string, RuntimeRecord>()

  for (const record of records) {
    const slug = typeof record?.slug === 'string'
      ? record.slug
      : ''

    if (!slug || bySlug.has(slug)) continue

    bySlug.set(slug, optimizeMetadataRecord(record, type))
  }

  return bySlug
}

export const getHerbMetadataMap = cache(async () => {
  const records = await getHerbSummaryIndex()
  return buildSlugMap(records, 'herb')
})

export const getCompoundMetadataMap = cache(async () => {
  const records = await getCompoundSummaryIndex()
  return buildSlugMap(records, 'compound')
})

export async function getHerbMetadataRecord(slug: string): Promise<RuntimeRecord | null> {
  const map = await getHerbMetadataMap()
  return map.get(slug) || null
}

export async function getCompoundMetadataRecord(slug: string): Promise<RuntimeRecord | null> {
  const map = await getCompoundMetadataMap()
  return map.get(slug) || null
}
