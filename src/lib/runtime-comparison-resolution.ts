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

function resolveComparisonSide(
  config: RuntimeComparisonSideConfig,
  herbs: RuntimeRecord[],
  compounds: RuntimeRecord[],
  visibility: 'render' | 'index',
): ResolvedRuntimeComparisonSide {
  const candidates = new Set(config.candidates.map(cleanComparisonValue).filter(Boolean))
  const isEligible = (record: RuntimeRecord) => {
    const state = getRuntimeVisibility(record)
    return visibility === 'render' ? state.canRender : state.canIndex
  }

  const herb = herbs.find((record) => {
    const slug = cleanComparisonValue(record.slug)
    return candidates.has(slug) && isEligible(record)
  })
  if (herb) {
    const slug = cleanComparisonValue(herb.slug)
    return { label: config.label, record: herb, href: `/herbs/${slug}/` }
  }

  const compound = compounds.find((record) => {
    const slug = cleanComparisonValue(record.slug)
    return candidates.has(slug) && isEligible(record)
  })
  if (compound) {
    const slug = cleanComparisonValue(compound.slug)
    return { label: config.label, record: compound, href: `/compounds/${slug}/` }
  }

  return { label: config.label, record: null, href: null }
}

/**
 * Resolve a side for page rendering.
 *
 * Rendering and indexability are intentionally separate concerns. A record that
 * is temporarily NOINDEX/NEEDS_REVIEW can still be safe to render as supporting
 * context, while treating `canIndex` as an existence check turns governance
 * demotions into hard 404s for otherwise valid comparison URLs.
 */
export function resolveRuntimeComparisonSide(
  config: RuntimeComparisonSideConfig,
  herbs: RuntimeRecord[],
  compounds: RuntimeRecord[],
): ResolvedRuntimeComparisonSide {
  return resolveComparisonSide(config, herbs, compounds, 'render')
}

/**
 * Whether both sides are eligible for an indexable comparison page.
 *
 * Existing metadata and sitemap callers use this function as their publication
 * gate. Keep it stricter than the renderer: a comparison may continue to exist
 * when one ingredient is review-gated, but it must not be advertised for
 * indexing until both ingredients pass runtime indexability governance.
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
      resolveComparisonSide(left, herbRecords, compoundRecords, 'index').record &&
        resolveComparisonSide(right, herbRecords, compoundRecords, 'index').record,
    )
  } catch {
    // Indexation must fail closed: if eligibility cannot be determined, do not
    // advertise the comparison as indexable.
    return false
  }
}
