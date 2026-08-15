import type { EvidenceEngineSource } from './evidence-engine'

const HUMAN_TRIAL_TYPE = /\b(?:rct|randomi[sz]ed(?: controlled)? trial|clinical trial|controlled trial|human trial|crossover trial|cross-over trial)\b/i

export type HumanParticipantMetric = {
  total: number
  trialsWithSampleSize: number
  humanTrials: number
  complete: boolean
}

export function isHumanTrialSource(source: Pick<EvidenceEngineSource, 'source_type'>): boolean {
  return HUMAN_TRIAL_TYPE.test(source.source_type.trim())
}

export function countHumanTrials(sources: EvidenceEngineSource[]): number {
  return sources.filter(isHumanTrialSource).length
}

export function getHumanParticipantMetric(sources: EvidenceEngineSource[]): HumanParticipantMetric | null {
  const humanTrials = sources.filter(isHumanTrialSource)
  if (humanTrials.length === 0) return null

  const withSampleSize = humanTrials.filter(
    (source) => typeof source.sample_size === 'number' && Number.isFinite(source.sample_size) && source.sample_size > 0
  )
  if (withSampleSize.length === 0) return null

  return {
    total: withSampleSize.reduce((sum, source) => sum + (source.sample_size as number), 0),
    trialsWithSampleSize: withSampleSize.length,
    humanTrials: humanTrials.length,
    complete: withSampleSize.length === humanTrials.length,
  }
}
