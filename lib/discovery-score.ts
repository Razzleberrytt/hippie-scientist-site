import { getEvidenceMaturity, getMechanismDepth, getProfileCompleteness } from '@/lib/semantic-trust-badges'
import { getSafetySensitivity } from '@/lib/safety-classification'

export function calculateDiscoveryScore(base: any, candidate: any) {
  let score = 0

  const baseEffects = normalize(base?.primary_effects || base?.effects)
  const candidateEffects = normalize(candidate?.primary_effects || candidate?.effects)

  const baseMechanisms = normalize(base?.mechanisms)
  const candidateMechanisms = normalize(candidate?.mechanisms)

  const basePathways = normalize(base?.pathways)
  const candidatePathways = normalize(candidate?.pathways)

  score += overlapScore(baseEffects, candidateEffects) * 3
  score += overlapScore(baseMechanisms, candidateMechanisms) * 4
  score += overlapScore(basePathways, candidatePathways) * 2

  if (/strong|moderate|clinical|human/i.test(String(candidate?.evidence_tier || candidate?.evidenceTier || ''))) {
    score += 3
  }

  if (/complete/i.test(String(candidate?.profile_status || candidate?.review_status || ''))) {
    score += 2
  }

  const baseMaturity = getEvidenceMaturity(base)
  const candidateMaturity = getEvidenceMaturity(candidate)
  const baseCompleteness = getProfileCompleteness(base)
  const candidateCompleteness = getProfileCompleteness(candidate)
  const baseSafety = getSafetySensitivity(base)
  const candidateSafety = getSafetySensitivity(candidate)
  const baseMechanismDepth = getMechanismDepth(base)
  const candidateMechanismDepth = getMechanismDepth(candidate)

  if (baseMaturity === candidateMaturity) score += baseMaturity === 'mature' ? 4 : 2
  if (baseMaturity === 'mature' && candidateMaturity === 'mature') score += 2
  if (baseMaturity === 'exploratory' && candidateMechanismDepth !== 'light') score += 3

  if (baseCompleteness === candidateCompleteness) score += 2
  if (baseCompleteness === 'complete' && candidateCompleteness === 'complete') score += 2

  if (baseSafety === candidateSafety && baseSafety !== 'low') score += 3
  if (baseSafety === 'high' && candidateSafety !== 'low') score += 2

  if (baseMechanismDepth === candidateMechanismDepth) score += 2
  if (baseMechanismDepth !== 'light' && candidateMechanismDepth !== 'light') score += 2

  return score
}

function normalize(value: any): string[] {
  if (!value) return []

  const array = Array.isArray(value) ? value : [value]

  return array
    .map(item => String(item).trim().toLowerCase())
    .filter(Boolean)
}

function overlapScore(a: string[], b: string[]) {
  const matches = a.filter(item => b.includes(item))
  return matches.length
}
