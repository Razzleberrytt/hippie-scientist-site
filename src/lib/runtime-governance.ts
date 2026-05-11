import {
  clampScore,
  safeNumber,
  safeObject,
  safeText,
} from '@/lib/runtime-render-guards'

function calculateEvidenceDepth(record: any) {
  const evidence = safeNumber(record?.human_studies_count)
  const mechanisms = safeNumber(record?.mechanism_count)
  const citations = safeNumber(record?.citation_count)

  return clampScore(
    evidence * 8 + mechanisms * 4 + citations * 2,
    45,
  )
}

function calculateFreshness(record: any) {
  const updated = safeText(record?.updated_at)
  const reviewed = safeText(record?.reviewed_at)

  if (updated || reviewed) {
    return 88
  }

  return 62
}

function calculateAuthority(record: any) {
  const authorityTier = safeText(record?.authority_tier)

  if (/tier\s*1/i.test(authorityTier)) {
    return 94
  }

  if (/tier\s*2/i.test(authorityTier)) {
    return 82
  }

  return 68
}

export function buildRuntimeGovernance(source: unknown) {
  const record = safeObject(source)

  return {
    freshnessScore: calculateFreshness(record),
    evidenceDepth: calculateEvidenceDepth(record),
    authorityScore: calculateAuthority(record),
    reviewPriority: clampScore(
      100 - calculateFreshness(record),
      35,
    ),
  }
}
