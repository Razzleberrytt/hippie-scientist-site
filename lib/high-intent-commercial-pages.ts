import { text, unique } from '@/lib/display-utils'
import { buildProductRecommendationContext } from '@/lib/semantic-product-recommendations'

export type CommercialPageBlueprint = {
  slug: string
  title: string
  intent: 'forms' | 'stack' | 'compare' | 'beginner-guide' | 'buyer-guide'
  description: string
  safetyNote: string
  qualityCriteria: string[]
}

function slugify(value: unknown) {
  return text(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function title(value: unknown) {
  return text(value).replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function buildCommercialPageBlueprint(record: Record<string, unknown>): CommercialPageBlueprint {
  const context = buildProductRecommendationContext(record)
  const name = title(record?.displayName || record?.name || record?.slug)
  const slug = slugify(name)

  const intent: CommercialPageBlueprint['intent'] =
    /magnesium|omega|protein|creatine|mushroom|collagen/i.test(name)
      ? 'forms'
      : context.readiness === 'recommend'
        ? 'buyer-guide'
        : 'beginner-guide'

  return {
    slug: `best-${slug}`,
    title: intent === 'forms' ? `Best ${name} forms` : `Best ${name} buying guide`,
    intent,
    description: `Evidence-informed commercial guide for ${name}, focused on formulation quality, transparent labeling, safety context, and realistic expectations.`,
    safetyNote: context.readiness === 'avoid'
      ? 'Product recommendations should not be prioritized until safety context is reviewed.'
      : 'Product guidance is educational and should not replace medical advice.',
    qualityCriteria: unique(context.qualitySignals).slice(0, 6),
  }
}

export function buildCommercialPageBlueprints(records: Record<string, unknown>[] = [], limit = 24) {
  return records
    .map(buildCommercialPageBlueprint)
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, limit)
}
