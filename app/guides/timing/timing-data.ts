import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { getUnifiedRuntimeRecords } from '@/src/lib/runtime-record-index'
import type { RuntimeRecord } from '@/src/types/content'

export type RuntimeIngredient = RuntimeRecord & {
  best_taken?: unknown
  bioavailability_notes?: unknown
  evidence_grade?: unknown
  evidence_level?: unknown
}

const DAYPART_PATTERN = /\b(?:morning|afternoon|evening|night|nighttime|bedtime|before bed|daytime|earlier in the day|later in the day|a\.m\.|p\.m\.)/i
const FOOD_PATTERN = /\b(?:food|meal|meals|with fat|empty stomach|fasted|fasting|with breakfast|with dinner|with lunch|fat-containing|dietary fat)\b/i

export function cleanTimingValue(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
}

export function getTiming(record: RuntimeIngredient): string {
  return cleanTimingValue(record.best_taken)
}

export function hasDaypartTiming(record: RuntimeIngredient): boolean {
  return DAYPART_PATTERN.test(getTiming(record))
}

export function getFoodTimingGuidance(record: RuntimeIngredient): string {
  const candidates = [
    getTiming(record),
    cleanTimingValue(record.bioavailability_notes),
  ]
  return candidates.find((value) => FOOD_PATTERN.test(value)) || ''
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

export function selectDaypartTimingIngredients(records: RuntimeRecord[]): RuntimeIngredient[] {
  return selectIndexableTimingIngredients(records).filter(hasDaypartTiming)
}

export function selectFoodTimingIngredients(records: RuntimeRecord[]): RuntimeIngredient[] {
  return selectIndexableTimingIngredients(records).filter((record) => Boolean(getFoodTimingGuidance(record)))
}

export async function loadIndexableTimingIngredients(): Promise<RuntimeIngredient[]> {
  const { allRecords } = await getUnifiedRuntimeRecords()
  return selectIndexableTimingIngredients(allRecords as RuntimeRecord[])
}

export async function loadDaypartTimingIngredients(): Promise<RuntimeIngredient[]> {
  return (await loadIndexableTimingIngredients()).filter(hasDaypartTiming)
}

export async function loadFoodTimingIngredients(): Promise<RuntimeIngredient[]> {
  return (await loadIndexableTimingIngredients()).filter((record) => Boolean(getFoodTimingGuidance(record)))
}
