import { cache } from './react-cache'
import { getCompoundSummaryIndex, getHerbSummaryIndex } from '@/lib/runtime-summary-indexes'

function buildSlugMap(records: any[]) {
  const bySlug = new Map<string, any>()

  for (const record of records) {
    const slug = typeof record?.slug === 'string'
      ? record.slug
      : ''

    if (!slug || bySlug.has(slug)) continue

    bySlug.set(slug, record)
  }

  return bySlug
}

export const getHerbMetadataMap = cache(async () => {
  const records = await getHerbSummaryIndex()
  return buildSlugMap(records)
})

export const getCompoundMetadataMap = cache(async () => {
  const records = await getCompoundSummaryIndex()
  return buildSlugMap(records)
})

export async function getHerbMetadataRecord(slug: string) {
  const map = await getHerbMetadataMap()
  return map.get(slug) || null
}

export async function getCompoundMetadataRecord(slug: string) {
  const map = await getCompoundMetadataMap()
  return map.get(slug) || null
}
