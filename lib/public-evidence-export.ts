import type {
  PublicEvidenceDataset,
  PublicStudyRelationship,
} from '@/lib/public-evidence-dataset'

function clean(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function relationshipSortKey(relationship: PublicStudyRelationship): string {
  return JSON.stringify([
    clean(relationship.ingredientSlug),
    clean(relationship.ingredientType),
    clean(relationship.ingredientPath),
    clean(relationship.ingredientName),
    clean(relationship.evidenceGrade),
    clean(relationship.relationship),
    clean(relationship.outcome),
    clean(relationship.result),
    clean(relationship.dose),
    clean(relationship.duration),
    clean(relationship.population),
    clean(relationship.limitation),
    clean(relationship.confidence),
    clean(relationship.statisticalConsistency),
    clean(relationship.extractName),
    [...(relationship.conditions ?? [])].map(clean).filter(Boolean).sort(),
    clean(relationship.safetyOutcome),
  ])
}

export function normalizePublicEvidenceDatasetForExport(dataset: PublicEvidenceDataset): PublicEvidenceDataset {
  const ingredients = dataset.ingredients
    .map((ingredient) => ({ ...ingredient }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.path.localeCompare(b.path))

  const studies = dataset.studies
    .map((study) => {
      const publicationYearCandidates = study.publicationYearCandidates
        ? [...study.publicationYearCandidates].sort((a, b) => a - b)
        : undefined
      const studyClassCandidates = study.studyClassCandidates
        ? [...study.studyClassCandidates].sort()
        : undefined
      const participantCountCandidates = study.participantCountCandidates
        ? [...study.participantCountCandidates].sort((a, b) => a - b)
        : undefined

      return {
        ...study,
        publicationYearCandidates,
        publicationYearAmbiguous: publicationYearCandidates ? publicationYearCandidates.length > 1 : false,
        studyClassCandidates,
        studyClassAmbiguous: studyClassCandidates ? studyClassCandidates.length > 1 : false,
        participantCountCandidates,
        participantCountAmbiguous: participantCountCandidates ? participantCountCandidates.length > 1 : false,
        conditions: [...study.conditions].sort((a, b) => a.localeCompare(b)),
        relationships: study.relationships
          .map((relationship) => ({
            ...relationship,
            conditions: relationship.conditions
              ? [...relationship.conditions].sort((a, b) => a.localeCompare(b))
              : undefined,
          }))
          .sort((a, b) => relationshipSortKey(a).localeCompare(relationshipSortKey(b))),
      }
    })
    .sort((a, b) => {
      const yearDiff = Number(b.year || 0) - Number(a.year || 0)
      if (yearDiff !== 0) return yearDiff
      return a.title.localeCompare(b.title) || a.id.localeCompare(b.id)
    })

  return {
    ...dataset,
    ingredients,
    studies,
  }
}
