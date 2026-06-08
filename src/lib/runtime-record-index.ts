import { cache } from './react-cache'
import { getCompounds, getHerbs } from '@/lib/runtime-data'
import type { RuntimeRecord } from '@/types/content'

function attachEntityType(records: RuntimeRecord[], entityType: 'herb' | 'compound') {
  return records.map((record) => ({
    ...record,
    entityType,
  }))
}

export const getUnifiedRuntimeRecords = cache(async () => {
  const [herbs, compounds] = await Promise.all([
    getHerbs(),
    getCompounds(),
  ])

  const herbRecords = attachEntityType(herbs, 'herb')
  const compoundRecords = attachEntityType(compounds, 'compound')

  return {
    herbs,
    compounds,
    herbRecords,
    compoundRecords,
    allRecords: [
      ...herbRecords,
      ...compoundRecords,
    ],
  }
})
