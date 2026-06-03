export interface EvidenceMetrics {
  clinicalTrialCount: number
  metaAnalysisCount: number
  humanStudiesCount: number
  animalStudiesCount: number
  inVitroCount: number
  citationCount: number
}

export interface RelationalConnection {
  targetSlug: string
  targetName: string
  type: 'herb' | 'compound'
  relationshipType: string
  weight: number
  sharedMechanisms: string[]
  sharedPathways: string[]
  sharedGoals: string[]
  rationale: string
}

export interface RelationalGraphProfile {
  slug: string
  name: string
  type: 'herb' | 'compound'
  pathways: string[]
  mechanisms: string[]
  goals: string[]
  evidenceMetrics: EvidenceMetrics
  connections: RelationalConnection[]
}
