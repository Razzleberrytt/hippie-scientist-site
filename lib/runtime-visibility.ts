import { list, text } from '@/lib/display-utils'

function hasResearchPending(record: any) {
  return list(record?.primary_effects).some((effect) =>
    /research-pending/i.test(effect)
  )
}

export function getRuntimeVisibility(record: any) {
  const exportDecision = text(record?.runtime_export_decision)
  const profileStatus = text(record?.profile_status)
  const summaryQuality = text(record?.summary_quality)

  const hidden =
    /^hide$/i.test(exportDecision)

  const weak =
    /^minimal$/i.test(profileStatus) ||
    /^weak$/i.test(summaryQuality) ||
    hasResearchPending(record)

  const strong =
    /^complete$/i.test(profileStatus) &&
    /^strong$/i.test(summaryQuality)

  return {
    canRender: !hidden,
    canIndex: !hidden && strong,
    canFeature: !hidden && strong,
    canMonetize: !hidden && !weak,
  }
}
