import { cache } from './react-cache'
import { getCompounds, getHerbs } from './runtime-data'
import type { RuntimeRecord } from '../types/content'

function attachEntityType(records: RuntimeRecord[], entityType: 'herb' | 'compound') {
  return records.map((record) => ({
    ...record,
    entityType,
  }))
}

export function buildRuntimeSlugSets(herbs: RuntimeRecord[], compounds: RuntimeRecord[]) {
  return {
    herbSlugs: new Set(herbs.map((record) => record.slug)),
    compoundSlugs: new Set(compounds.map((record) => record.slug)),
  }
}

export const getUnifiedRuntimeRecords = cache(async () => {
  const [herbs, compounds] = await Promise.all([
    getHerbs(),
    getCompounds(),
  ])

  const herbRecords = attachEntityType(herbs, 'herb')
  const compoundRecords = attachEntityType(compounds, 'compound')
  const { herbSlugs, compoundSlugs } = buildRuntimeSlugSets(herbs, compounds)

  return {
    herbs,
    compounds,
    herbRecords,
    compoundRecords,
    herbSlugs,
    compoundSlugs,
    allRecords: [
      ...herbRecords,
      ...compoundRecords,
    ],
  }
})
