import fs from 'node:fs'

export type SourceClassGovernanceRule = {
  evidenceClass: string
  allowedSourceTypes: string[]
  pmidApplicable: boolean
  preferredStudyDesigns: string[]
}

export type SourceClassGovernance = Record<string, SourceClassGovernanceRule>

const governanceUrl = new URL('../../schemas/source-class-governance.json', import.meta.url)

export const sourceClassGovernance = JSON.parse(
  fs.readFileSync(governanceUrl, 'utf8'),
) as SourceClassGovernance

export function sourceClassesForEvidenceClasses(evidenceClasses: Iterable<string>): Set<string> {
  const allowedEvidenceClasses = new Set(evidenceClasses)
  return new Set(
    Object.entries(sourceClassGovernance)
      .filter(([, rule]) => allowedEvidenceClasses.has(rule.evidenceClass))
      .map(([sourceClass]) => sourceClass),
  )
}

export function getSourceClassRule(sourceClass: string): SourceClassGovernanceRule | null {
  return sourceClassGovernance[sourceClass] ?? null
}
