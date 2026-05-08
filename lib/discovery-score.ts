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

  if (/strong|moderate|clinical|human/i.test(String(candidate?.evidence_tier || ''))) {
    score += 3
  }

  if (/complete/i.test(String(candidate?.profile_status || ''))) {
    score += 2
  }

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
