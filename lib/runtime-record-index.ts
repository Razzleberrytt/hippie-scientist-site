import { cache } from './react-cache'
import { getCompounds, getHerbs } from './runtime-data'
import type { RuntimeRecord } from '../types/content'

function attachEntityType(records: RuntimeRecord[], entityType: 'herb' | 'compound') {
  return records.map((record) => ({
    ...record,
    entityType,
  }))
}

export function buildFirstRuntimeRecordSlugIndex(records: RuntimeRecord[]) {
  const bySlug = new Map<string, RuntimeRecord>()

  for (const record of records) {
    const slug = typeof record?.slug === 'string' ? record.slug : ''
    if (!slug || bySlug.has(slug)) continue
    bySlug.set(slug, record)
  }

  return bySlug
}

export const getUnifiedRuntimeRecords = cache(async () => {
  const [herbs, compounds] = await Promise.all([
    getHerbs(),
    getCompounds(),
  ])

  const herbRecords = attachEntityType(herbs, 'herb')
  const compoundRecords = attachEntityType(compounds, 'compound')
  const herbBySlug = buildFirstRuntimeRecordSlugIndex(herbs)
  const compoundBySlug = buildFirstRuntimeRecordSlugIndex(compounds)

  return {
    herbs,
    compounds,
    herbRecords,
    compoundRecords,
    herbBySlug,
    compoundBySlug,
    herbSlugs: new Set(herbBySlug.keys()),
    compoundSlugs: new Set(compoundBySlug.keys()),
    allRecords: [
      ...herbRecords,
      ...compoundRecords,
    ],
  }
})
