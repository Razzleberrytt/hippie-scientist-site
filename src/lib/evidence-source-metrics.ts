import type { EvidenceEngineSource } from './evidence-engine'

const HUMAN_TRIAL_TYPE = /\b(?:rct|randomi[sz]ed(?: controlled)? trial|clinical trial|controlled trial|human trial|crossover trial|cross-over trial)\b/i

export function isHumanTrialSource(source: Pick<EvidenceEngineSource, 'source_type'>): boolean {
  return HUMAN_TRIAL_TYPE.test(source.source_type.trim())
}

export function countHumanTrials(sources: EvidenceEngineSource[]): number {
  return sources.filter(isHumanTrialSource).length
}
