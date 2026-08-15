export type MechanismEvidenceType =
  | 'human-outcome'
  | 'human-biomarker'
  | 'animal'
  | 'in-vitro'
  | 'computational'

export type MechanismRecord = {
  ingredientId: string
  pathwayId: string
  pathwayLabel: string
  target?: string
  direction?: 'increase' | 'decrease' | 'modulate' | 'unknown'
  evidenceType: MechanismEvidenceType
  evidenceSummary: string
  sourceIds?: string[]
  linkedOutcomeIds?: string[]
  humanOutcomeDemonstrated?: boolean
}

export type MechanismViewMode = 'human-outcomes' | 'mechanistic-context' | 'all'

export type MechanismExplorerEntry = MechanismRecord & {
  evidenceTier: 'clinical-outcome' | 'human-mechanistic' | 'preclinical'
  implicationLabel: string
  canSupportEfficacyClaim: boolean
}

function evidenceTier(record: MechanismRecord): MechanismExplorerEntry['evidenceTier'] {
  if (record.evidenceType === 'human-outcome' && record.humanOutcomeDemonstrated) return 'clinical-outcome'
  if (record.evidenceType === 'human-outcome' || record.evidenceType === 'human-biomarker') return 'human-mechanistic'
  return 'preclinical'
}

export function mechanismEntry(record: MechanismRecord): MechanismExplorerEntry {
  const tier = evidenceTier(record)
  const canSupportEfficacyClaim = tier === 'clinical-outcome' && record.humanOutcomeDemonstrated === true
  const implicationLabel = canSupportEfficacyClaim
    ? 'Human outcome evidence exists for this linked effect; mechanism should still be presented as explanatory context rather than proof by itself.'
    : tier === 'human-mechanistic'
      ? 'Observed in humans at a mechanistic or biomarker level; this does not establish a meaningful health outcome.'
      : 'Preclinical mechanism only; it should not be translated into a human efficacy claim.'

  return { ...record, evidenceTier: tier, implicationLabel, canSupportEfficacyClaim }
}

export function exploreMechanisms(records: MechanismRecord[], mode: MechanismViewMode = 'all') {
  const entries = records.map(mechanismEntry)
  if (mode === 'human-outcomes') return entries.filter((entry) => entry.evidenceTier === 'clinical-outcome')
  if (mode === 'mechanistic-context') return entries.filter((entry) => entry.evidenceTier !== 'clinical-outcome')
  return entries
}

export function mechanismStrengthSummary(records: MechanismRecord[]) {
  const entries = records.map(mechanismEntry)
  return {
    total: entries.length,
    clinicalOutcome: entries.filter((entry) => entry.evidenceTier === 'clinical-outcome').length,
    humanMechanistic: entries.filter((entry) => entry.evidenceTier === 'human-mechanistic').length,
    preclinical: entries.filter((entry) => entry.evidenceTier === 'preclinical').length,
    pathways: [...new Set(entries.map((entry) => entry.pathwayId))],
    outcomes: [...new Set(entries.flatMap((entry) => entry.linkedOutcomeIds ?? []))],
  }
}

export function pathwayGraph(records: MechanismRecord[]) {
  const nodes = new Map<string, { id: string; label: string; type: 'ingredient' | 'pathway' | 'target' | 'outcome' }>()
  const edges: Array<{ from: string; to: string; relation: string; evidenceTier: MechanismExplorerEntry['evidenceTier'] }> = []

  for (const record of records) {
    const entry = mechanismEntry(record)
    const ingredientNode = `ingredient:${record.ingredientId}`
    const pathwayNode = `pathway:${record.pathwayId}`
    nodes.set(ingredientNode, { id: ingredientNode, label: record.ingredientId, type: 'ingredient' })
    nodes.set(pathwayNode, { id: pathwayNode, label: record.pathwayLabel, type: 'pathway' })
    edges.push({ from: ingredientNode, to: pathwayNode, relation: record.direction ?? 'modulate', evidenceTier: entry.evidenceTier })

    if (record.target) {
      const targetNode = `target:${record.target}`
      nodes.set(targetNode, { id: targetNode, label: record.target, type: 'target' })
      edges.push({ from: pathwayNode, to: targetNode, relation: 'targets', evidenceTier: entry.evidenceTier })
    }

    for (const outcomeId of record.linkedOutcomeIds ?? []) {
      const outcomeNode = `outcome:${outcomeId}`
      nodes.set(outcomeNode, { id: outcomeNode, label: outcomeId, type: 'outcome' })
      edges.push({ from: pathwayNode, to: outcomeNode, relation: record.humanOutcomeDemonstrated ? 'linked-human-outcome' : 'hypothesized-outcome-link', evidenceTier: entry.evidenceTier })
    }
  }

  return { nodes: [...nodes.values()], edges }
}

export function validateMechanismRecord(record: MechanismRecord) {
  const errors: string[] = []
  if (!record.evidenceSummary.trim()) errors.push('Evidence summary is required.')
  if (record.humanOutcomeDemonstrated && record.evidenceType !== 'human-outcome') {
    errors.push('humanOutcomeDemonstrated may only be true for human-outcome evidence.')
  }
  if (record.evidenceType === 'human-outcome' && record.humanOutcomeDemonstrated && (record.sourceIds?.length ?? 0) === 0) {
    errors.push('Human outcome claims require at least one source ID.')
  }
  return errors
}
