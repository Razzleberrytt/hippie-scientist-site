import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { getUnifiedRuntimeRecords } from '@/src/lib/runtime-record-index'
import type { RuntimeRecord } from '@/src/types/content'

export type FormIngredient = RuntimeRecord & {
  forms?: unknown
  available_forms?: unknown
  bioavailability_notes?: unknown
  dosage?: unknown
  typical_dosage?: unknown
}

export function cleanFormValue(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
}

export function formValueToText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return cleanFormValue(String(value))
  }

  if (Array.isArray(value)) {
    return value.map(formValueToText).filter(Boolean).join('; ')
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, nested]) => {
        const text = formValueToText(nested)
        return text ? `${key.replace(/[_-]+/g, ' ')}: ${text}` : ''
      })
      .filter(Boolean)
      .join('; ')
  }

  return ''
}

export function toFormItems(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(formValueToText).filter(Boolean)

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, nested]) => {
        const detail = formValueToText(nested)
        return detail ? `${key.replace(/[_-]+/g, ' ')}: ${detail}` : key.replace(/[_-]+/g, ' ')
      })
      .filter(Boolean)
  }

  const text = formValueToText(value)
  if (!text) return []

  const split = text.split(/\s*[;|]\s*/).map((item) => item.trim()).filter(Boolean)
  return split.length >= 2 ? split : []
}

export function getForms(record: FormIngredient): string[] {
  const primary = toFormItems(record.forms)
  const fallback = toFormItems(record.available_forms)
  return [...new Set([...primary, ...fallback])]
}

export function selectIndexableFormIngredients(records: RuntimeRecord[]): FormIngredient[] {
  const bySlug = new Map<string, FormIngredient>()

  for (const record of records as FormIngredient[]) {
    if (!getRuntimeVisibility(record).canIndex) continue

    const slug = cleanFormValue(record.slug)
    if (!slug || getForms(record).length < 2) continue

    if (!bySlug.has(slug)) bySlug.set(slug, record)
  }

  return [...bySlug.values()]
}

export async function loadIndexableFormIngredients(): Promise<FormIngredient[]> {
  const { allRecords } = await getUnifiedRuntimeRecords()
  return selectIndexableFormIngredients(allRecords as RuntimeRecord[])
}
