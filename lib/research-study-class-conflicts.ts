import {
  NARRATIVE_STUDY_CLASSES,
  PRIMARY_HUMAN_STUDY_CLASSES,
  SYNTHESIS_STUDY_CLASSES,
  canonicalStudyGroups,
  sourceStudyClass,
} from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'
import type { StudyClass } from './study-class'

export type StudyClassFamily =
  | 'primary-human'
  | 'synthesis'
  | 'narrative'
  | 'other-human'
  | 'preclinical'
  | 'regulatory'
  | 'unclassified'

export type StudyClassConflict = {
  url: string
  studyId: string
  sourceIds: string[]
  classes: StudyClass[]
  families: StudyClassFamily[]
  severe: boolean
}

export type StudyClassConflictAnalysis = {
  conflicts: StudyClassConflict[]
  severeConflicts: StudyClassConflict[]
  summary: {
    canonicalStudiesChecked: number
    studiesWithClassConflict: number
    severeClassConflicts: number
  }
}

function familyForStudyClass(studyClass: StudyClass): StudyClassFamily {
  if (PRIMARY_HUMAN_STUDY_CLASSES.has(studyClass)) return 'primary-human'
  if (SYNTHESIS_STUDY_CLASSES.has(studyClass)) return 'synthesis'
  if (NARRATIVE_STUDY_CLASSES.has(studyClass)) return 'narrative'
  if (studyClass === 'observational' || studyClass === 'case-report') return 'other-human'
  if (studyClass === 'animal' || studyClass === 'in-vitro') return 'preclinical'
  if (studyClass === 'regulatory-guidance') return 'regulatory'
  return 'unclassified'
}

/**
 * Detect contradictory classifications across source rows that canonicalize to
 * the same PMID/DOI-backed study. Near-neighbor design disagreements are
 * reported, while cross-family disagreements are severe because they can change
 * evidence interpretation (for example RCT vs narrative review).
 */
export function analyzeStudyClassConflicts(analysis: ResearchQualityAnalysis): StudyClassConflictAnalysis {
  const conflicts: StudyClassConflict[] = []
  let canonicalStudiesChecked = 0

  for (const { url, record } of analysis.profiles) {
    for (const [studyId, group] of canonicalStudyGroups(record)) {
      canonicalStudiesChecked += 1
      if (group.length < 2) continue

      const classes = [...new Set(group.map((source) => sourceStudyClass(source, analysis.cache)).filter((studyClass) => studyClass !== 'unclassified'))]
        .sort() as StudyClass[]
      if (classes.length < 2) continue

      const families = [...new Set(classes.map(familyForStudyClass))].sort() as StudyClassFamily[]
      const sourceIds = group.map((source) => String(source.id ?? '')).filter(Boolean).sort()
      conflicts.push({
        url,
        studyId,
        sourceIds,
        classes,
        families,
        severe: families.length > 1,
      })
    }
  }

  conflicts.sort((a, b) => Number(b.severe) - Number(a.severe) || a.url.localeCompare(b.url) || a.studyId.localeCompare(b.studyId))
  const severeConflicts = conflicts.filter((conflict) => conflict.severe)

  return {
    conflicts,
    severeConflicts,
    summary: {
      canonicalStudiesChecked,
      studiesWithClassConflict: conflicts.length,
      severeClassConflicts: severeConflicts.length,
    },
  }
}
