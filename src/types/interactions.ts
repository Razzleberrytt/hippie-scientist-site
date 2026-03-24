export type InteractionSeverity = 'low' | 'moderate' | 'high' | 'unknown'

export type InteractionConfidence = 'high' | 'medium' | 'low'

export type InteractionFinding = {
  title: string
  severity: InteractionSeverity
  confidence: InteractionConfidence
  summary: string
  evidenceBasis: string[]
}

export type InteractionReport = {
  items: string[]
  findings: InteractionFinding[]
  overallSeverity: InteractionSeverity
  overallConfidence: InteractionConfidence
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
  confidence?: InteractionConfidence
}

export type InteractionSignal = {
  tag: string
  basis: string[]
}

export type InteractionSignals = {
  item: InteractionSourceItem
  tags: Set<string>
  evidenceByTag: Map<string, string[]>
  dataCoverageScore: number
}
