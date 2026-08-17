import type { PublicEvidenceDataset } from '@/lib/public-evidence-dataset'

const PRECLINICAL_CLASSES = new Set(['mechanistic', 'animal', 'in_vitro'])
const PRIMARY_HUMAN_CLASSES = new Set([
  'randomized_controlled_trial',
  'controlled_trial',
  'observational',
  'case_report',
])
const SYNTHESIS_CLASSES = new Set(['meta_analysis', 'systematic_review'])

export type CategoryEvidenceMix = {
  category: string
  evidenceRelationships: number
  humanRelationships: number
  primaryHumanRelationships: number
  synthesisRelationships: number
  preclinicalRelationships: number
  otherRelationships: number
  preclinicalShare: number
  humanShare: number
  primaryHumanShare: number
  synthesisShare: number
}

/**
 * Only `ingredients` and `studies` are read, so the parameter says so. The
 * wider PublicEvidenceDataset type forced test fixtures to fake seven unused
 * fields or cast around the checker; a full dataset still satisfies this.
 */
export function summarizeCategoryEvidenceMix(
  dataset: Pick<PublicEvidenceDataset, 'ingredients' | 'studies'>,
): CategoryEvidenceMix[] {
  const categoryByPath = new Map(dataset.ingredients.map(ingredient => [ingredient.path, ingredient.category]))
  const buckets = new Map<string, Omit<CategoryEvidenceMix, 'preclinicalShare' | 'humanShare' | 'primaryHumanShare' | 'synthesisShare'>>()

  for (const study of dataset.studies) {
    for (const relationship of study.relationships) {
      const category = categoryByPath.get(relationship.ingredientPath) || 'Uncategorized'
      const bucket = buckets.get(category) || {
        category,
        evidenceRelationships: 0,
        humanRelationships: 0,
        primaryHumanRelationships: 0,
        synthesisRelationships: 0,
        preclinicalRelationships: 0,
        otherRelationships: 0,
      }

      bucket.evidenceRelationships += 1
      if (PRECLINICAL_CLASSES.has(study.evidenceClass)) bucket.preclinicalRelationships += 1
      else if (PRIMARY_HUMAN_CLASSES.has(study.evidenceClass)) {
        bucket.primaryHumanRelationships += 1
        bucket.humanRelationships += 1
      } else if (SYNTHESIS_CLASSES.has(study.evidenceClass)) {
        bucket.synthesisRelationships += 1
        bucket.humanRelationships += 1
      } else bucket.otherRelationships += 1
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
      primaryHumanShare: bucket.evidenceRelationships
        ? bucket.primaryHumanRelationships / bucket.evidenceRelationships
        : 0,
      synthesisShare: bucket.evidenceRelationships
        ? bucket.synthesisRelationships / bucket.evidenceRelationships
        : 0,
    }))
    .sort((a, b) =>
      b.preclinicalShare - a.preclinicalShare ||
      b.preclinicalRelationships - a.preclinicalRelationships ||
      a.category.localeCompare(b.category),
    )
}
