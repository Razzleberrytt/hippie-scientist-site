import type { PublicEvidenceDataset } from '@/lib/public-evidence-dataset'

const PRECLINICAL_CLASSES = new Set(['mechanistic', 'animal', 'in_vitro'])
const HUMAN_CLASSES = new Set([
  'meta_analysis',
  'systematic_review',
  'randomized_controlled_trial',
  'controlled_trial',
  'observational',
  'case_report',
])

export type CategoryEvidenceMix = {
  category: string
  evidenceRelationships: number
  humanRelationships: number
  preclinicalRelationships: number
  otherRelationships: number
  preclinicalShare: number
  humanShare: number
}

export function summarizeCategoryEvidenceMix(dataset: PublicEvidenceDataset): CategoryEvidenceMix[] {
  const categoryBySlug = new Map(dataset.ingredients.map(ingredient => [ingredient.slug, ingredient.category]))
  const buckets = new Map<string, Omit<CategoryEvidenceMix, 'preclinicalShare' | 'humanShare'>>()

  for (const study of dataset.studies) {
    for (const relationship of study.relationships) {
      const category = categoryBySlug.get(relationship.ingredientSlug) || 'Uncategorized'
      const bucket = buckets.get(category) || {
        category,
        evidenceRelationships: 0,
        humanRelationships: 0,
        preclinicalRelationships: 0,
        otherRelationships: 0,
      }

      bucket.evidenceRelationships += 1
      if (PRECLINICAL_CLASSES.has(study.evidenceClass)) bucket.preclinicalRelationships += 1
      else if (HUMAN_CLASSES.has(study.evidenceClass)) bucket.humanRelationships += 1
      else bucket.otherRelationships += 1
      buckets.set(category, bucket)
    }
  }

  return [...buckets.values()]
    .map(bucket => ({
      ...bucket,
      preclinicalShare: bucket.evidenceRelationships
        ? bucket.preclinicalRelationships / bucket.evidenceRelationships
        : 0,
      humanShare: bucket.evidenceRelationships
        ? bucket.humanRelationships / bucket.evidenceRelationships
        : 0,
    }))
    .sort((a, b) =>
      b.preclinicalShare - a.preclinicalShare ||
      b.preclinicalRelationships - a.preclinicalRelationships ||
      a.category.localeCompare(b.category),
    )
}
