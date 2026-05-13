import { list, text } from '@/lib/display-utils'

function hasResearchPending(record: any) {
  return list(record?.primary_effects).some((effect) =>
    /research-pending/i.test(effect)
  )
}

function hasIndexableStatus(profileStatus: string) {
  return /^(complete|near_complete|top50_authority_patched|commercial_ready)$/i.test(profileStatus)
}

function hasIndexableQuality(summaryQuality: string) {
  return !/^(weak|minimal|thin|stub|research_needed)$/i.test(summaryQuality)
}

export function getRuntimeVisibility(record: any) {
  const exportDecision = text(record?.runtime_export_decision)
  const profileStatus = text(record?.profile_status)
  const summaryQuality = text(record?.summary_quality)
  const evidenceTier = text(record?.evidence_tier || record?.evidenceTier || record?.evidence_grade)

  const hidden =
    /^hide$/i.test(exportDecision)

  const weak =
    /^minimal$/i.test(profileStatus) ||
    /^weak$/i.test(summaryQuality) ||
    hasResearchPending(record)

  const indexableStatus = hasIndexableStatus(profileStatus)
  const indexableQuality = hasIndexableQuality(summaryQuality)
  const evidenceSupported = /^(strong|moderate|human|clinical|commercial_ready)$/i.test(evidenceTier) || indexableStatus

  const strong =
    indexableStatus &&
    indexableQuality &&
    evidenceSupported &&
    !hasResearchPending(record)

  return {
    canRender: !hidden,
    canIndex: !hidden && strong,
    canFeature: !hidden && strong,
    canMonetize: !hidden && !weak,
  }
}
