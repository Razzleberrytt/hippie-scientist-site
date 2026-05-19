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

function getIndexabilityStatus(record: any) {
  const status = text(record?.indexability_status)
  return /^(PUBLISH|NOINDEX|NEEDS_REVIEW|BLOCKED)$/i.test(status)
    ? status.toUpperCase()
    : ''
}

export function getRuntimeVisibility(record: any) {
  const exportDecision = text(record?.runtime_export_decision)
  const profileStatus = text(record?.profile_status)
  const summaryQuality = text(record?.summary_quality)
  const evidenceTier = text(record?.evidence_tier || record?.evidenceTier || record?.evidence_grade)
  const indexabilityStatus = getIndexabilityStatus(record)

  const hidden =
    /^hide$/i.test(exportDecision)

  const weak =
    /^minimal$/i.test(profileStatus) ||
    /^weak$/i.test(summaryQuality) ||
    hasResearchPending(record)

  if (indexabilityStatus) {
    const publish = indexabilityStatus === 'PUBLISH'

    return {
      canRender: !hidden,
      canIndex: !hidden && publish,
      canFeature: !hidden && publish,
      canMonetize: !hidden && indexabilityStatus !== 'BLOCKED' && !weak,
    }
  }

  // Respect pre-computed pipeline fields when present
  const sitemapIncluded = record?.sitemap_included
  const robotsField = text(record?.robots || '')
  if (typeof sitemapIncluded === 'boolean' && robotsField) {
    const publish = sitemapIncluded && /^index/i.test(robotsField)
    return {
      canRender: !hidden,
      canIndex: !hidden && publish,
      canFeature: !hidden && publish,
      canMonetize: !hidden && !weak,
    }
  }

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
