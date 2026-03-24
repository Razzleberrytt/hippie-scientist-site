export type InteractionSeverity = 'low' | 'moderate' | 'high' | 'unknown'

export type InteractionConfidence = 'high' | 'medium' | 'low'
export type InteractionSignalSource = 'structured' | 'inferred'
export type InteractionFindingBasis = 'structured' | 'inferred' | 'mixed'

export type InteractionFinding = {
  title: string
  severity: InteractionSeverity
  confidence: InteractionConfidence
  confidenceScore: number
  basis: InteractionFindingBasis
  summary: string
  explanation: string
  sharedTagCount: number
  overlappingMechanismCount: number
  overlappingMechanisms: string[]
  evidenceBasis: string[]
}

export type InteractionReport = {
  items: string[]
  findings: InteractionFinding[]
  summary: string
  keySignals: string[]
  overallSeverity: InteractionSeverity
  overallConfidence: InteractionConfidence
  overallConfidenceScore: number
  dataLimited: boolean
  notes: string[]
}

export type InteractionSourceItem = {
  id: string
  name: string
  kind: 'herb' | 'compound'
  category?: string
  mechanism?: string
  effects?: string[]
  contraindications?: string[]
  safety?: string[]
  interactions?: string[]
  interactionTags?: string[]
  interactionNotes?: string[]
  confidence?: InteractionConfidence
}

export type InteractionSignal = {
  tag: string
  source: InteractionSignalSource
  basis: string[]
}

export type InteractionSignals = {
  item: InteractionSourceItem
  tags: Set<string>
  structuredTags: Set<string>
  inferredTags: Set<string>
  evidenceByTag: Map<string, string[]>
  sourceByTag: Map<string, InteractionSignalSource>
  dataCoverageScore: number
}
