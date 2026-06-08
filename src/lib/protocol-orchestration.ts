import { calculateSemanticConfidence } from './semantic-confidence'
import { calculateSemanticFreshness } from './semantic-freshness'
import { evaluateSemanticSuppression } from './semantic-suppression'

export type ProtocolOrchestrationResult = {
  slug: string
  protocolWeight: number
  stackCompatibility: number
  recoveryCompatibility: number
  stimulationBalance: number
  orchestrationTier: 'core' | 'adaptive' | 'supporting' | 'suppressed'
  reasons: string[]
}

function normalizeList(value: unknown) {
  return Array.isArray(value)
    ? value.filter(Boolean)
    : []
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim().toLowerCase()
    : ''
}

export function buildProtocolOrchestration(
  source: any,
  candidates: any[],
): ProtocolOrchestrationResult[] {
  return candidates
    .map((candidate) => {
      const confidence = calculateSemanticConfidence(candidate)
      const freshness = calculateSemanticFreshness(candidate)
      const suppression = evaluateSemanticSuppression(source, candidate)

      const sourceRecovery = normalizeText(source?.recovery_intent)
      const candidateRecovery = normalizeText(candidate?.recovery_intent)

      const sourceStimulation = normalizeText(source?.stimulation_axis)
      const candidateStimulation = normalizeText(candidate?.stimulation_axis)

      const sourceProtocols = normalizeList(source?.protocols)
      const candidateProtocols = normalizeList(candidate?.protocols)

      const reasons: string[] = []

      let stackCompatibility = 50

      if (candidateProtocols.length >= 2) {
        stackCompatibility += 20
        reasons.push('protocol-density')
      }

      if (
        sourceProtocols.length > 0 &&
        candidateProtocols.some((item) => sourceProtocols.includes(item))
      ) {
        stackCompatibility += 15
        reasons.push('shared-protocol-membership')
      }

      let recoveryCompatibility = 45

      if (
        sourceRecovery &&
        candidateRecovery &&
        sourceRecovery === candidateRecovery
      ) {
        recoveryCompatibility += 30
        reasons.push('recovery-alignment')
      }

      let stimulationBalance = 50

      if (
        sourceStimulation &&
        candidateStimulation &&
        sourceStimulation !== candidateStimulation
      ) {
        stimulationBalance += 20
        reasons.push('stimulation-balance')
      }

      let protocolWeight =
        confidence.recommendationConfidence * 0.4 +
        freshness.authorityFreshness * 0.2 +
        stackCompatibility * 0.2 +
        recoveryCompatibility * 0.1 +
        stimulationBalance * 0.1

      protocolWeight -= suppression.redundancyPenalty * 0.35

      protocolWeight = Math.max(
        0,
        Math.min(Math.round(protocolWeight), 100),
      )

      let orchestrationTier: ProtocolOrchestrationResult['orchestrationTier'] = 'supporting'

      if (!suppression.allowed) {
        orchestrationTier = 'suppressed'
        reasons.push('suppressed-for-redundancy')
      } else if (protocolWeight >= 78) {
        orchestrationTier = 'core'
      } else if (protocolWeight >= 58) {
        orchestrationTier = 'adaptive'
      }

      return {
        slug: normalizeText(candidate?.slug || 'discovery'),
        protocolWeight,
        stackCompatibility,
        recoveryCompatibility,
        stimulationBalance,
        orchestrationTier,
        reasons,
      }
    })
    .sort((a, b) => b.protocolWeight - a.protocolWeight)
}
