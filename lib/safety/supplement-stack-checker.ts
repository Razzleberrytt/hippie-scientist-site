export type StackIngredient = {
  id: string
  name: string
  aliases?: string[]
  classes?: string[]
  stimulantLoad?: number
  sedativeLoad?: number
  serotonergic?: boolean
  anticoagulantPotential?: boolean
  bloodPressureLoweringPotential?: boolean
  glucoseLoweringPotential?: boolean
  duplicateKey?: string
}

export type StackInteraction = {
  ingredientIds: string[]
  kind: 'duplicate' | 'known-interaction' | 'theoretical-overlap' | 'cumulative-effect'
  severity: 'info' | 'caution' | 'high'
  confidence: 'known' | 'probable' | 'theoretical'
  message: string
}

export type StackAnalysis = {
  ingredientCount: number
  normalizedIds: string[]
  interactions: StackInteraction[]
  knownInteractions: StackInteraction[]
  theoreticalInteractions: StackInteraction[]
  cumulativeSignals: Array<{ signal: string; score: number; severity: 'info' | 'caution' | 'high' }>
  privacy: 'local-only'
  disclaimer: string
}

function scoreSeverity(score: number): 'info' | 'caution' | 'high' {
  return score >= 4 ? 'high' : score >= 2 ? 'caution' : 'info'
}

export function analyzeSupplementStack(ingredients: StackIngredient[]): StackAnalysis {
  const interactions: StackInteraction[] = []
  const normalized = ingredients.map((ingredient) => ({
    ...ingredient,
    duplicateKey: ingredient.duplicateKey ?? ingredient.id,
  }))

  const duplicateGroups = new Map<string, StackIngredient[]>()
  for (const ingredient of normalized) {
    const group = duplicateGroups.get(ingredient.duplicateKey!) ?? []
    group.push(ingredient)
    duplicateGroups.set(ingredient.duplicateKey!, group)
  }

  for (const group of duplicateGroups.values()) {
    if (group.length < 2) continue
    interactions.push({
      ingredientIds: group.map((ingredient) => ingredient.id),
      kind: 'duplicate',
      severity: 'caution',
      confidence: 'known',
      message: 'The same ingredient or equivalent source appears more than once in this stack.',
    })
  }

  const serotonergic = normalized.filter((ingredient) => ingredient.serotonergic)
  if (serotonergic.length >= 2) {
    interactions.push({
      ingredientIds: serotonergic.map((ingredient) => ingredient.id),
      kind: 'theoretical-overlap',
      severity: 'caution',
      confidence: 'theoretical',
      message: 'Multiple ingredients share serotonergic activity. Mechanistic overlap is not the same as a proven clinical interaction.',
    })
  }

  const anticoagulant = normalized.filter((ingredient) => ingredient.anticoagulantPotential)
  if (anticoagulant.length >= 2) {
    interactions.push({
      ingredientIds: anticoagulant.map((ingredient) => ingredient.id),
      kind: 'theoretical-overlap',
      severity: 'caution',
      confidence: 'theoretical',
      message: 'Several ingredients may influence platelet or coagulation pathways; combined clinical risk may be uncertain.',
    })
  }

  const stimulantLoad = normalized.reduce((sum, ingredient) => sum + (ingredient.stimulantLoad ?? 0), 0)
  const sedativeLoad = normalized.reduce((sum, ingredient) => sum + (ingredient.sedativeLoad ?? 0), 0)
  const bpLoweringLoad = normalized.filter((ingredient) => ingredient.bloodPressureLoweringPotential).length
  const glucoseLoweringLoad = normalized.filter((ingredient) => ingredient.glucoseLoweringPotential).length

  const cumulativeSignals = [
    { signal: 'stimulant load', score: stimulantLoad, severity: scoreSeverity(stimulantLoad) },
    { signal: 'sedative load', score: sedativeLoad, severity: scoreSeverity(sedativeLoad) },
    { signal: 'blood-pressure-lowering overlap', score: bpLoweringLoad, severity: scoreSeverity(bpLoweringLoad) },
    { signal: 'glucose-lowering overlap', score: glucoseLoweringLoad, severity: scoreSeverity(glucoseLoweringLoad) },
  ].filter((signal) => signal.score > 0)

  for (const signal of cumulativeSignals.filter((item) => item.score >= 2)) {
    interactions.push({
      ingredientIds: normalized.map((ingredient) => ingredient.id),
      kind: 'cumulative-effect',
      severity: signal.severity,
      confidence: 'theoretical',
      message: `The stack has overlapping ${signal.signal}. This is a screening signal, not a prediction of what will happen to an individual.`,
    })
  }

  const knownInteractions = interactions.filter((interaction) => interaction.confidence === 'known' || interaction.confidence === 'probable')
  const theoreticalInteractions = interactions.filter((interaction) => interaction.confidence === 'theoretical')

  return {
    ingredientCount: normalized.length,
    normalizedIds: normalized.map((ingredient) => ingredient.id),
    interactions,
    knownInteractions,
    theoreticalInteractions,
    cumulativeSignals,
    privacy: 'local-only',
    disclaimer: 'This checker is informational and does not determine whether a stack is safe for a specific person. Known evidence is separated from theoretical overlap; medication and medical-condition review requires appropriate professional guidance.',
  }
}

export function summarizeStackRisk(analysis: StackAnalysis) {
  const high = analysis.interactions.filter((interaction) => interaction.severity === 'high').length
  const caution = analysis.interactions.filter((interaction) => interaction.severity === 'caution').length
  return {
    level: high > 0 ? 'high-review-priority' : caution > 0 ? 'review-recommended' : 'no-major-screening-signal',
    high,
    caution,
    knownCount: analysis.knownInteractions.length,
    theoreticalCount: analysis.theoreticalInteractions.length,
  }
}
