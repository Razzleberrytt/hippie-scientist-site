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

export function optionalComparisonField(
  record: RuntimeComparisonIngredient | null,
  keys: string[],
): string {
  if (!record) return ''

  for (const key of keys) {
    const value = comparisonValueToText(record[key])
    if (value) return value
  }

  return ''
}

export function firstComparisonField(
  record: RuntimeComparisonIngredient | null,
  keys: string[],
): string {
  return optionalComparisonField(record, keys) || 'Not available in the canonical record.'
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

/**
 * Whether both sides of a comparison resolve to a publishable record.
 *
 * `RuntimeEvidenceComparison` calls `notFound()` when either side is missing,
 * which is correct: the site should not build a comparison on a record it will
 * not publish. But the pages declare their metadata statically, so a page that
 * renders a 404 still shipped `index, follow` — and Next's not-found boundary
 * then added its own `noindex`, leaving two contradictory robots tags in one
 * document.
 *
 * Metadata can call this to tell the truth instead. Both sides use the same
 * resolver the renderer uses, so the answers cannot drift apart.
 */
export async function canRenderRuntimeComparison(
  left: RuntimeComparisonSideConfig,
  right: RuntimeComparisonSideConfig,
  loadRecords: () => Promise<{ herbs: unknown[]; compounds: unknown[] }>,
): Promise<boolean> {
  try {
    const { herbs, compounds } = await loadRecords()
    const herbRecords = herbs as RuntimeRecord[]
    const compoundRecords = compounds as RuntimeRecord[]
    return Boolean(
      resolveRuntimeComparisonSide(left, herbRecords, compoundRecords).record &&
        resolveRuntimeComparisonSide(right, herbRecords, compoundRecords).record,
    )
  } catch {
    // Indexation must fail closed: if availability cannot be determined, treat
    // the comparison as unavailable rather than advertising a page that may 404.
    return false
  }
}
