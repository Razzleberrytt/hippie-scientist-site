const EVIDENCE_GRADES = new Set(['A', 'B', 'C', 'D', 'Avoid/Insufficient'])

function clean(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

export function assertDistributionEvidenceGradeBinding(pack, researchObject) {
  if (!pack || typeof pack !== 'object' || Array.isArray(pack)) {
    throw new Error('distribution pack must be an object for evidence-grade binding')
  }
  if (!researchObject || typeof researchObject !== 'object' || Array.isArray(researchObject)) {
    throw new Error('research object must be an object for evidence-grade binding')
  }

  const canonicalGrade = clean(researchObject.evidenceGrade)
  if (!EVIDENCE_GRADES.has(canonicalGrade)) {
    throw new Error(`canonical research object has unsupported evidenceGrade: ${canonicalGrade || '(empty)'}`)
  }

  if (!Array.isArray(pack.claims) || pack.claims.length !== 1 || !pack.claims[0] || typeof pack.claims[0] !== 'object') {
    throw new Error('distribution pack must contain exactly one claim for evidence-grade binding')
  }

  const projectedGrade = clean(pack.claims[0].evidenceGrade)
  if (projectedGrade !== canonicalGrade) {
    throw new Error(`distribution evidenceGrade must exactly equal canonical research-object evidenceGrade ${canonicalGrade}`)
  }

  return pack
}
