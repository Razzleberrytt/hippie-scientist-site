import { buildAuthorityHierarchy } from '@/lib/runtime-authority-hierarchy'
import { buildEvidenceConfidence } from '@/lib/runtime-evidence-confidence'
import { buildRuntimeGovernance } from '@/lib/runtime-governance'
import {
  safeObject,
  safeText,
} from '@/lib/runtime-render-guards'

function reviewState(score: number) {
  if (score >= 72) {
    return 'high-review-priority'
  }

  if (score >= 48) {
    return 'moderate-review-priority'
  }

  return 'stable-governance'
}

export function buildGovernanceVisibility(source: unknown) {
  const record = safeObject(source)

  const governance = buildRuntimeGovernance(record)
  const evidence = buildEvidenceConfidence(record)
  const authority = buildAuthorityHierarchy(record)

  const runtimeVisibility = safeText(
    record?.runtime_visibility,
    'visible',
  )

  const reviewStatus = reviewState(
    governance.reviewPriority,
  )

  const canIndex =
    runtimeVisibility !== 'hidden' &&
    evidence.confidenceScore >= 40

  const canRecommend =
    authority.authorityScore >= 50 &&
    governance.freshnessScore >= 45

  return {
    runtimeVisibility,
    reviewStatus,
    canIndex,
    canRecommend,
    governance,
    evidence,
    authority,
  }
}
