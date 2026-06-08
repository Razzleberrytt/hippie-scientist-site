import { cache } from './react-cache'
import { getCompounds, getHerbs } from '@/lib/runtime-data'

export type RuntimeRecord = Record<string, any>

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
