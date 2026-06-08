import type { EvidenceSnapshotField } from '@/components/ui/EvidenceSnapshotPanel'

type DetailSnapshotInput = {
  bestFit?: string
  humanEvidence?: string
  safetyLevel?: string
  toleranceRisk?: string
  regulationProfile?: string
  typicalOnset?: string
  useCautionIf?: string
  uncertain?: string
  confidenceLabel?: string
  evidenceWeight?: number
  humanEvidenceFlag?: boolean
  evidenceExplanation?: string
}

type CompareSnapshotInput = {
  bestFit?: string
  humanEvidence?: string
  safetyLevel?: string
  toleranceRisk?: string
  regulationProfile?: string
  typicalOnset?: string
  useCautionIf?: string
  uncertain?: string
  confidenceLabel?: string
  evidenceWeight?: number
  humanEvidenceFlag?: boolean
  evidenceExplanation?: string
}

const DEFAULTS = {
  bestFit: 'Best-fit use case is not clearly specified in the current profile data.',
  humanEvidence: 'Human evidence quality is unclear from the available profile data.',
  safetyLevel: 'Safety context is incomplete. Review medications, health conditions, and clinician guidance before use.',
  toleranceRisk: 'Tolerance risk is not clearly specified; monitor individual response over time.',
  regulationProfile: 'Stimulation/sedation profile is not clearly defined in the current data.',
  typicalOnset: 'Typical onset varies by dose, formulation, and individual biology.',
  useCautionIf: 'No specific avoid-if flags were surfaced in the available profile data.',
  uncertain: 'Long-term outcomes, product standardization, and individual response can vary.',
}

export function buildDetailEvidenceSnapshotFields(input: DetailSnapshotInput): EvidenceSnapshotField[] {
  return [
    { label: 'Best fit', value: input.bestFit || DEFAULTS.bestFit, tone: 'best-fit' },
    { label: 'Human evidence', value: input.humanEvidence || DEFAULTS.humanEvidence },
    {
      label: 'Evidence confidence',
      value: input.confidenceLabel && input.evidenceWeight !== undefined
        ? `${input.confidenceLabel} (${(input.evidenceWeight * 100).toFixed(0)}% Index) — ${input.evidenceExplanation || ''}`
        : DEFAULTS.humanEvidence
    },
    {
      label: 'Human trials mapped',
      value: input.humanEvidenceFlag !== undefined
        ? (input.humanEvidenceFlag ? 'Yes — clinical outcomes observed in human populations.' : 'No — primarily preclinical, cell-model, or traditional-use signals only.')
        : 'Review underlying research context for details.'
    },
    { label: 'Safety level', value: input.safetyLevel || DEFAULTS.safetyLevel, tone: 'caution' },
    { label: 'Tolerance risk', value: input.toleranceRisk || DEFAULTS.toleranceRisk },
    { label: 'Stimulation/sedation profile', value: input.regulationProfile || DEFAULTS.regulationProfile },
    { label: 'Typical onset', value: input.typicalOnset || DEFAULTS.typicalOnset },
    { label: 'Use caution if', value: input.useCautionIf || DEFAULTS.useCautionIf, tone: 'caution' },
    { label: 'What remains uncertain', value: input.uncertain || DEFAULTS.uncertain },
  ]
}

export function buildCompareEvidenceSnapshotFields(input: CompareSnapshotInput): EvidenceSnapshotField[] {
  return [
    { label: 'Best fit', value: input.bestFit || DEFAULTS.bestFit, tone: 'best-fit' },
    { label: 'Human evidence', value: input.humanEvidence || DEFAULTS.humanEvidence },
    {
      label: 'Evidence confidence',
      value: input.confidenceLabel && input.evidenceWeight !== undefined
        ? `${input.confidenceLabel} (${(input.evidenceWeight * 100).toFixed(0)}% Index) — ${input.evidenceExplanation || ''}`
        : DEFAULTS.humanEvidence
    },
    {
      label: 'Human trials mapped',
      value: input.humanEvidenceFlag !== undefined
        ? (input.humanEvidenceFlag ? 'Yes — clinical outcomes observed in human populations.' : 'No — primarily preclinical, cell-model, or traditional-use signals only.')
        : 'Review underlying research context for details.'
    },
    { label: 'Safety level', value: input.safetyLevel || DEFAULTS.safetyLevel, tone: 'caution' },
    { label: 'Tolerance risk', value: input.toleranceRisk || DEFAULTS.toleranceRisk },
    { label: 'Stimulation/sedation profile', value: input.regulationProfile || DEFAULTS.regulationProfile },
    { label: 'Typical onset', value: input.typicalOnset || DEFAULTS.typicalOnset },
    { label: 'Use caution if', value: input.useCautionIf || DEFAULTS.useCautionIf, tone: 'caution' },
    { label: 'What remains uncertain', value: input.uncertain || DEFAULTS.uncertain },
  ]
}

