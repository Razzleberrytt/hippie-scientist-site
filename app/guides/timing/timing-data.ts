import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { getUnifiedRuntimeRecords } from '@/src/lib/runtime-record-index'
import type { RuntimeRecord } from '@/src/types/content'

export type RuntimeIngredient = RuntimeRecord & {
  best_taken?: unknown
  bioavailability_notes?: unknown
  evidence_grade?: unknown
  evidence_level?: unknown
}

export function cleanTimingValue(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
}

export function getTiming(record: RuntimeIngredient): string {
  return cleanTimingValue(record.best_taken)
}

export function selectIndexableTimingIngredients(records: RuntimeRecord[]): RuntimeIngredient[] {
  const bySlug = new Map<string, RuntimeIngredient>()

  for (const record of records as RuntimeIngredient[]) {
    if (!getRuntimeVisibility(record).canIndex) continue

    const slug = cleanTimingValue(record.slug)
    const timing = getTiming(record)
    if (!slug || !timing) continue

    if (!bySlug.has(slug)) bySlug.set(slug, record)
  }

  return [...bySlug.values()]
}

export async function loadIndexableTimingIngredients(): Promise<RuntimeIngredient[]> {
  const { herbs, compounds } = await getUnifiedRuntimeRecords()
  return selectIndexableTimingIngredients([
    ...(herbs as RuntimeRecord[]),
    ...(compounds as RuntimeRecord[]),
  ])
}
