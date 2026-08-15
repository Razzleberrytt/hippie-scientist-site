export const RESEARCH_MATURITY_LEVELS = [
  'established',
  'emerging',
  'preliminary',
  'theoretical',
] as const

export type ResearchMaturity = (typeof RESEARCH_MATURITY_LEVELS)[number]

export interface ResearchMaturityPolicy {
  label: string
  rank: number
  visualWeight: 'full' | 'standard' | 'muted' | 'research-only'
  commercialAllowed: boolean
  purchaseIntentAllowed: boolean
  outcomeLanguage: 'supported' | 'cautious' | 'preliminary' | 'mechanistic-only'
}

export const RESEARCH_MATURITY_POLICIES: Record<ResearchMaturity, ResearchMaturityPolicy> = {
  established: {
    label: 'Established research',
    rank: 4,
    visualWeight: 'full',
    commercialAllowed: true,
    purchaseIntentAllowed: true,
    outcomeLanguage: 'supported',
  },
  emerging: {
    label: 'Emerging research',
    rank: 3,
    visualWeight: 'standard',
    commercialAllowed: true,
    purchaseIntentAllowed: true,
    outcomeLanguage: 'cautious',
  },
  preliminary: {
    label: 'Preliminary research',
    rank: 2,
    visualWeight: 'muted',
    commercialAllowed: false,
    purchaseIntentAllowed: false,
    outcomeLanguage: 'preliminary',
  },
  theoretical: {
    label: 'Theoretical / mechanistic research',
    rank: 1,
    visualWeight: 'research-only',
    commercialAllowed: false,
    purchaseIntentAllowed: false,
    outcomeLanguage: 'mechanistic-only',
  },
}

export type RelationshipKind =
  | 'outcome-supported'
  | 'exploratory-outcome'
  | 'practical-alternative'
  | 'similar-clinical-effect'
  | 'similar-chemistry'
  | 'same-pathway'

export interface ResearchRelationship {
  fromId: string
  toId: string
  kind: RelationshipKind
  outcomeEvidenceCount?: number
  mechanismEvidenceCount?: number
  label?: string
}

export interface RelationshipValidationIssue {
  code:
    | 'mechanism-mapped-as-clinical-outcome'
    | 'alternative-without-outcome-evidence'
    | 'clinical-effect-without-outcome-evidence'
  message: string
}

export function policyForResearchMaturity(level: ResearchMaturity): ResearchMaturityPolicy {
  return RESEARCH_MATURITY_POLICIES[level]
}

export function validateResearchRelationship(
  relationship: ResearchRelationship,
): RelationshipValidationIssue[] {
  const issues: RelationshipValidationIssue[] = []
  const outcomeEvidence = relationship.outcomeEvidenceCount ?? 0
  const mechanismEvidence = relationship.mechanismEvidenceCount ?? 0

  if (relationship.kind === 'outcome-supported' && outcomeEvidence === 0 && mechanismEvidence > 0) {
    issues.push({
      code: 'mechanism-mapped-as-clinical-outcome',
      message: 'Mechanism evidence alone cannot create an outcome-supported condition mapping; use exploratory-outcome instead.',
    })
  }

  if (relationship.kind === 'practical-alternative' && outcomeEvidence === 0) {
    issues.push({
      code: 'alternative-without-outcome-evidence',
      message: 'A practical alternative requires outcome evidence for the same reader goal; chemical or pathway similarity is not enough.',
    })
  }

  if (relationship.kind === 'similar-clinical-effect' && outcomeEvidence === 0) {
    issues.push({
      code: 'clinical-effect-without-outcome-evidence',
      message: 'Similar clinical effect requires direct outcome evidence; otherwise use similar-chemistry or same-pathway.',
    })
  }

  return issues
}

export function canMapToCondition(relationship: ResearchRelationship): boolean {
  if (relationship.kind === 'exploratory-outcome') return true
  if (relationship.kind !== 'outcome-supported') return false
  return (relationship.outcomeEvidenceCount ?? 0) > 0
}

export function canLabelAsPracticalAlternative(relationship: ResearchRelationship): boolean {
  return relationship.kind === 'practical-alternative' && (relationship.outcomeEvidenceCount ?? 0) > 0
}

export function displayRelationshipLabel(kind: RelationshipKind): string {
  const labels: Record<RelationshipKind, string> = {
    'outcome-supported': 'Supported for the same outcome',
    'exploratory-outcome': 'Exploratory outcome connection',
    'practical-alternative': 'Alternative for the same goal',
    'similar-clinical-effect': 'Similar clinical effect',
    'similar-chemistry': 'Similar chemistry',
    'same-pathway': 'Same pathway',
  }
  return labels[kind]
}
