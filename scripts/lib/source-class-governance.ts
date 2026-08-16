import sourceClassGovernanceData from '../../schemas/source-class-governance.json'

export type SourceClass = keyof typeof sourceClassGovernanceData
export type SourceClassGovernanceRule = (typeof sourceClassGovernanceData)[SourceClass]
export type EvidenceClass = SourceClassGovernanceRule['evidenceClass']
export type SourceType = SourceClassGovernanceRule['allowedSourceTypes'][number]
export type StudyDesign = SourceClassGovernanceRule['preferredStudyDesigns'][number]

export const sourceClassGovernance = sourceClassGovernanceData

export function sourceClassesForEvidenceClasses(evidenceClasses: Iterable<string>): Set<SourceClass> {
  const allowedEvidenceClasses = new Set(evidenceClasses)
  return new Set(
    (Object.entries(sourceClassGovernance) as Array<[SourceClass, SourceClassGovernanceRule]>)
      .filter(([, rule]) => allowedEvidenceClasses.has(rule.evidenceClass))
      .map(([sourceClass]) => sourceClass),
  )
}

export function getSourceClassRule(sourceClass: string): SourceClassGovernanceRule | null {
  return sourceClass in sourceClassGovernance
    ? sourceClassGovernance[sourceClass as SourceClass]
    : null
}
