import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import type { RuntimeRecord } from '@/src/types/content'

export type RuntimeComparisonIngredient = RuntimeRecord

export type RuntimeComparisonSideConfig = {
  label: string
  candidates: string[]
}

export type ResolvedRuntimeComparisonSide = {
  label: string
  record: RuntimeComparisonIngredient | null
  href: string | null
}

export function cleanComparisonValue(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
}

export function comparisonValueToText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return cleanComparisonValue(String(value))
  }

  if (Array.isArray(value)) {
    return value.map(comparisonValueToText).filter(Boolean).join('; ')
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, nested]) => {
        const text = comparisonValueToText(nested)
        return text ? `${key.replace(/[_-]+/g, ' ')}: ${text}` : ''
      })
      .filter(Boolean)
      .join('; ')
  }

  return ''
}

export function firstComparisonField(
  record: RuntimeComparisonIngredient | null,
  keys: string[],
): string {
  if (!record) return 'Not available in the canonical record.'

  for (const key of keys) {
    const value = comparisonValueToText(record[key])
    if (value) return value
  }

  return 'Not available in the canonical record.'
}

export function resolveRuntimeComparisonSide(
  config: RuntimeComparisonSideConfig,
  herbs: RuntimeRecord[],
  compounds: RuntimeRecord[],
): ResolvedRuntimeComparisonSide {
  const candidates = new Set(config.candidates.map(cleanComparisonValue).filter(Boolean))

  const herb = herbs.find((record) => {
    const slug = cleanComparisonValue(record.slug)
    return candidates.has(slug) && getRuntimeVisibility(record).canIndex
  })
  if (herb) {
    const slug = cleanComparisonValue(herb.slug)
    return { label: config.label, record: herb, href: `/herbs/${slug}/` }
  }

  const compound = compounds.find((record) => {
    const slug = cleanComparisonValue(record.slug)
    return candidates.has(slug) && getRuntimeVisibility(record).canIndex
  })
  if (compound) {
    const slug = cleanComparisonValue(compound.slug)
    return { label: config.label, record: compound, href: `/compounds/${slug}/` }
  }

  return { label: config.label, record: null, href: null }
}
