import type { CanonicalEvidenceGrade } from '../../lib/evidence-grade'

export const RISK_MATRIX_DEFINITIONS = [
  { id: 'interaction', title: 'Interaction Matrix', signal: null, description: 'Structured interaction and safety signals across the research inventory.' },
  { id: 'sedation', title: 'Sedation Risk Matrix', signal: 'Sedation', description: 'Screens for sedation, drowsiness, or CNS-depressant signals.' },
  { id: 'stimulation', title: 'Stimulation Risk Matrix', signal: 'Stimulation', description: 'Screens for stimulant, agitation, insomnia, or jitteriness signals.' },
  { id: 'serotonergic', title: 'Serotonergic Caution Matrix', signal: 'Serotonergic', description: 'Screens for serotonergic, SSRI/SNRI, or MAOI-related cautions.' },
  { id: 'blood-pressure', title: 'Blood Pressure Effects Matrix', signal: 'Cardiovascular', description: 'Screens for blood-pressure, rhythm, heart-rate, or related cardiovascular signals; it does not infer direction.' },
  { id: 'bleeding', title: 'Bleeding Risk Matrix', signal: 'Bleeding', description: 'Screens for bleeding, anticoagulant, or antiplatelet cautions.' },
  { id: 'liver', title: 'Liver Caution Matrix', signal: 'Liver', description: 'Screens for liver or hepatotoxicity-related cautions.' },
  { id: 'pregnancy', title: 'Pregnancy Evidence / Safety Matrix', signal: 'Pregnancy / breastfeeding', description: 'Screens for pregnancy, lactation, or breastfeeding cautions in the structured dataset.' },
] as const

export type RiskMatrixId = (typeof RISK_MATRIX_DEFINITIONS)[number]['id']

export interface ResearchMatrixRow {
  slug: string
  name: string
  entityType: 'herb' | 'compound'
  href: string
  evidenceGrade: CanonicalEvidenceGrade | 'Unassigned'
  /** Independence-adjusted primary-human study count when canonical topology is available. */
  humanEvidenceCount: number
  /** Canonical primary-human publication count before proven same-study collapse. */
  humanPublicationCount: number
  collapsedHumanPublicationCount: number
  /** False only for runtime records that do not yet have a canonical research profile. */
  humanEvidenceCountCanonical: boolean
  outcomes: string[]
  mechanisms: string[]
  safetySignals: string[]
}

export const rowsForRiskMatrix = (rows: ResearchMatrixRow[], matrixId: RiskMatrixId) => {
  const definition = RISK_MATRIX_DEFINITIONS.find((item) => item.id === matrixId)
  if (!definition) return []
  if (!definition.signal) return rows.filter((row) => row.safetySignals.length > 0)
  return rows.filter((row) => row.safetySignals.includes(definition.signal))
}
