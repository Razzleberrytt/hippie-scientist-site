export type MedicationClassId =
  | 'ssri-snri'
  | 'maoi'
  | 'anticoagulant-antiplatelet'
  | 'sedative-hypnotic'
  | 'stimulant'
  | 'antihypertensive'
  | 'glucose-lowering'
  | 'thyroid-hormone'
  | 'immunosuppressant'
  | 'cyp3a4-sensitive-substrate'
  | 'cyp2d6-sensitive-substrate'

export type InteractionEvidenceLevel = 'established' | 'probable' | 'theoretical' | 'insufficient'
export type InteractionSeverity = 'minor' | 'moderate' | 'major' | 'unknown'

export type MedicationClassDefinition = {
  id: MedicationClassId
  label: string
  examples: string[]
  mechanismSummary: string
}

export const MEDICATION_CLASSES: MedicationClassDefinition[] = [
  { id: 'ssri-snri', label: 'SSRIs / SNRIs', examples: ['sertraline', 'fluoxetine', 'venlafaxine'], mechanismSummary: 'Increase serotonergic signaling through reuptake inhibition.' },
  { id: 'maoi', label: 'Monoamine oxidase inhibitors', examples: ['phenelzine', 'tranylcypromine'], mechanismSummary: 'Reduce monoamine breakdown and can strongly alter monoamine signaling.' },
  { id: 'anticoagulant-antiplatelet', label: 'Anticoagulants / antiplatelets', examples: ['warfarin', 'apixaban', 'clopidogrel'], mechanismSummary: 'Reduce clotting or platelet aggregation through multiple pathways.' },
  { id: 'sedative-hypnotic', label: 'Sedatives / hypnotics', examples: ['zolpidem', 'benzodiazepines'], mechanismSummary: 'Reduce central nervous system arousal.' },
  { id: 'stimulant', label: 'Stimulants', examples: ['amphetamine', 'methylphenidate'], mechanismSummary: 'Increase catecholaminergic signaling and arousal.' },
  { id: 'antihypertensive', label: 'Blood-pressure-lowering medicines', examples: ['lisinopril', 'amlodipine', 'losartan'], mechanismSummary: 'Lower blood pressure through vascular, renal, or cardiac mechanisms.' },
  { id: 'glucose-lowering', label: 'Glucose-lowering medicines', examples: ['metformin', 'insulin', 'sulfonylureas'], mechanismSummary: 'Lower blood glucose through insulin-dependent or insulin-independent pathways.' },
  { id: 'thyroid-hormone', label: 'Thyroid hormone replacement', examples: ['levothyroxine'], mechanismSummary: 'Replaces thyroid hormone and is sensitive to absorption timing and binding interactions.' },
  { id: 'immunosuppressant', label: 'Immunosuppressants', examples: ['tacrolimus', 'cyclosporine'], mechanismSummary: 'Suppress immune activity; several agents have narrow therapeutic windows.' },
  { id: 'cyp3a4-sensitive-substrate', label: 'CYP3A4-sensitive substrates', examples: ['selected statins', 'selected calcium-channel blockers'], mechanismSummary: 'Depend substantially on CYP3A4 metabolism.' },
  { id: 'cyp2d6-sensitive-substrate', label: 'CYP2D6-sensitive substrates', examples: ['selected antidepressants', 'selected beta blockers'], mechanismSummary: 'Depend substantially on CYP2D6 metabolism.' },
]

export type IngredientMedicationInteraction = {
  ingredientId: string
  medicationClassId: MedicationClassId
  evidenceLevel: InteractionEvidenceLevel
  severity: InteractionSeverity
  effect: string
  evidenceSummary: string
  mechanism?: string
  sourceIds?: string[]
  lastReviewed?: string
}

export type MedicationInteractionResult = IngredientMedicationInteraction & {
  medicationClass: MedicationClassDefinition
  confidenceLabel: string
  actionLabel: 'avoid-without-review' | 'review-before-combining' | 'monitoring-may-be-relevant' | 'theoretical-only' | 'insufficient-evidence'
  disclaimer: string
}

function actionFor(interaction: IngredientMedicationInteraction): MedicationInteractionResult['actionLabel'] {
  if (interaction.severity === 'major' && (interaction.evidenceLevel === 'established' || interaction.evidenceLevel === 'probable')) {
    return 'avoid-without-review'
  }
  if (interaction.severity === 'moderate' && interaction.evidenceLevel !== 'theoretical' && interaction.evidenceLevel !== 'insufficient') {
    return 'review-before-combining'
  }
  if (interaction.evidenceLevel === 'theoretical') return 'theoretical-only'
  if (interaction.evidenceLevel === 'insufficient') return 'insufficient-evidence'
  return 'monitoring-may-be-relevant'
}

export function exploreMedicationClassInteractions(
  ingredientId: string,
  medicationClassId: MedicationClassId,
  knowledgeBase: IngredientMedicationInteraction[],
): MedicationInteractionResult[] {
  const medicationClass = MEDICATION_CLASSES.find((item) => item.id === medicationClassId)
  if (!medicationClass) return []

  return knowledgeBase
    .filter((interaction) => interaction.ingredientId === ingredientId && interaction.medicationClassId === medicationClassId)
    .map((interaction) => ({
      ...interaction,
      medicationClass,
      confidenceLabel: interaction.evidenceLevel === 'established'
        ? 'Established clinical interaction evidence'
        : interaction.evidenceLevel === 'probable'
          ? 'Probable interaction based on clinical or pharmacologic evidence'
          : interaction.evidenceLevel === 'theoretical'
            ? 'Theoretical or mechanistic interaction signal'
            : 'Evidence is insufficient to characterize the interaction',
      actionLabel: actionFor(interaction),
      disclaimer: 'This explorer is educational and class-based. It does not evaluate an individual medication regimen, dose, diagnosis, laboratory result, or personal risk.',
    }))
}

export function interactionCoverage(knowledgeBase: IngredientMedicationInteraction[]) {
  const classIds = new Set(MEDICATION_CLASSES.map((item) => item.id))
  const covered = new Set(knowledgeBase.map((item) => item.medicationClassId))
  return {
    classesDefined: classIds.size,
    classesWithEvidenceRecords: [...covered].filter((id) => classIds.has(id)).length,
    ingredientCount: new Set(knowledgeBase.map((item) => item.ingredientId)).size,
    recordCount: knowledgeBase.length,
    establishedCount: knowledgeBase.filter((item) => item.evidenceLevel === 'established').length,
    theoreticalCount: knowledgeBase.filter((item) => item.evidenceLevel === 'theoretical').length,
  }
}

export function validateInteractionRecord(record: IngredientMedicationInteraction) {
  const errors: string[] = []
  if (!MEDICATION_CLASSES.some((item) => item.id === record.medicationClassId)) errors.push('Unknown medication class.')
  if (!record.effect.trim()) errors.push('Interaction effect is required.')
  if (!record.evidenceSummary.trim()) errors.push('Evidence summary is required.')
  if (record.evidenceLevel === 'established' && (record.sourceIds?.length ?? 0) === 0) {
    errors.push('Established interactions require at least one source ID.')
  }
  if (record.evidenceLevel === 'theoretical' && record.severity === 'major') {
    errors.push('Theoretical interactions cannot be labeled major without stronger evidence; use unknown/moderate and explain uncertainty.')
  }
  return errors
}

export function groupInteractionsByEvidence(results: MedicationInteractionResult[]) {
  return {
    establishedOrProbable: results.filter((item) => item.evidenceLevel === 'established' || item.evidenceLevel === 'probable'),
    theoretical: results.filter((item) => item.evidenceLevel === 'theoretical'),
    insufficient: results.filter((item) => item.evidenceLevel === 'insufficient'),
  }
}
