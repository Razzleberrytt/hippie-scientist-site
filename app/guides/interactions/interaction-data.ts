import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { getUnifiedRuntimeRecords } from '@/src/lib/runtime-record-index'
import type { RuntimeRecord } from '@/src/types/content'

export type InteractionIngredient = RuntimeRecord & {
  interactions?: unknown
  safety?: unknown
  safety_confidence?: unknown
  evidence_grade?: unknown
}

export function cleanInteractionValue(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
}

function labelInteractionKey(value: string): string {
  return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function interactionValueToText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return cleanInteractionValue(String(value))
  }

  if (Array.isArray(value)) {
    return value.map(interactionValueToText).filter(Boolean).join('; ')
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, nested]) => {
        const text = interactionValueToText(nested)
        return text ? `${labelInteractionKey(key)}: ${text}` : ''
      })
      .filter(Boolean)
      .join('; ')
  }

  return ''
}

export function hasMeaningfulInteractions(record: InteractionIngredient): boolean {
  const text = interactionValueToText(record.interactions)
  if (!text) return false

  return !/^(none|none known|unknown|n\/?a|not available|no data|no known interactions?)\.?$/i.test(text)
}

export function selectIndexableInteractionIngredients(records: RuntimeRecord[]): InteractionIngredient[] {
  const bySlug = new Map<string, InteractionIngredient>()

  for (const record of records as InteractionIngredient[]) {
    if (!getRuntimeVisibility(record).canIndex) continue

    const slug = cleanInteractionValue(record.slug)
    if (!slug || !hasMeaningfulInteractions(record)) continue

    if (!bySlug.has(slug)) bySlug.set(slug, record)
  }

  return [...bySlug.values()]
}

export async function loadIndexableInteractionIngredients(): Promise<InteractionIngredient[]> {
  const { allRecords } = await getUnifiedRuntimeRecords()
  return selectIndexableInteractionIngredients(allRecords as RuntimeRecord[])
}
