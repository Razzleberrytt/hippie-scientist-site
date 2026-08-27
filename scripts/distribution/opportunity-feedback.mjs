const DAY_MS = 86400000
const MIN_PERFORMANCE_REWARD_VIEWS = 250

function clamp(value, min, max) {
  const number = Number(value)
  if (!Number.isFinite(number)) return min
  return Math.max(min, Math.min(max, number))
}

function stableToken(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function daysSince(value, now) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return Infinity
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / DAY_MS))
}

function normalizeRate(value) {
  return clamp(value, 0, 1)
}

export function angleKey(candidate) {
  return `${stableToken(candidate?.id)}:${stableToken(candidate?.platform)}:${stableToken(candidate?.angle)}`
}

export function assessDistributionFeedback(candidate, history = [], { now = new Date() } = {}) {
  const records = (Array.isArray(history) ? history : [])
    .filter((entry) => entry && entry.candidateId === candidate?.id)
    .map((entry) => ({
      ...entry,
      ageDays: daysSince(entry.publishedAt, now),
      assetViews: Math.max(0, Number(entry.assetViews) || 0),
      qualifiedVisits: Math.max(0, Number(entry.qualifiedVisits) || 0),
      completionRate: normalizeRate(entry.completionRate),
      saveRate: normalizeRate(entry.saveRate),
    }))
    .filter((entry) => Number.isFinite(entry.ageDays))

  const recent = records.filter((entry) => entry.ageDays <= 42)
  const samePlatform = recent.filter((entry) => entry.platform === candidate?.platform)
  const key = angleKey(candidate)
  const duplicateAngleCount = samePlatform.filter((entry) => String(entry.angleKey || '') === key).length
  const saturationCount = samePlatform.length

  const measured = samePlatform.filter((entry) => entry.ageDays <= 28 && entry.assetViews > 0)
  const views = measured.reduce((sum, entry) => sum + entry.assetViews, 0)
  const visits = measured.reduce((sum, entry) => sum + entry.qualifiedVisits, 0)
  const qualifiedVisitRate = views > 0 ? visits / views : 0
  const avgCompletionRate = measured.length ? measured.reduce((sum, entry) => sum + entry.completionRate, 0) / measured.length : 0
  const avgSaveRate = measured.length ? measured.reduce((sum, entry) => sum + entry.saveRate, 0) / measured.length : 0
  const rewardSampleSufficient = views >= MIN_PERFORMANCE_REWARD_VIEWS

  const duplicatePenalty = Math.min(10, duplicateAngleCount * 6)
  const saturationPenalty = Math.min(8, Math.max(0, saturationCount - duplicateAngleCount) * 2)
  const poorPerformancePenalty = views >= 100 && qualifiedVisitRate < 0.005 ? 4 : 0
  const performanceReward = rewardSampleSufficient
    ? Math.min(8, Math.round(qualifiedVisitRate * 100 + avgCompletionRate * 4 + avgSaveRate * 20))
    : 0
  const adjustment = clamp(performanceReward - duplicatePenalty - saturationPenalty - poorPerformancePenalty, -20, 8)

  const reasons = []
  if (duplicateAngleCount) reasons.push(`${duplicateAngleCount} matching angle/platform asset(s) published within 42 days`)
  if (saturationCount > duplicateAngleCount) reasons.push(`${saturationCount} recent asset(s) already used this topic/platform`)
  if (poorPerformancePenalty) reasons.push('recent measured assets produced fewer than 0.5 qualified visits per 100 views')
  if (measured.length && !rewardSampleSufficient) reasons.push(`positive performance reward withheld until at least ${MIN_PERFORMANCE_REWARD_VIEWS} measured views`)
  if (performanceReward) reasons.push('bounded reward from sufficiently exposed measured qualified visits, completion, and saves')

  return {
    angleKey: key,
    adjustment,
    duplicateAngleCount,
    saturationCount,
    performanceReward,
    duplicatePenalty,
    saturationPenalty,
    poorPerformancePenalty,
    measured: {
      assets: measured.length,
      assetViews: views,
      qualifiedVisits: visits,
      qualifiedVisitRate,
      averageCompletionRate: avgCompletionRate,
      averageSaveRate: avgSaveRate,
      rewardSampleSufficient,
      minimumRewardViews: MIN_PERFORMANCE_REWARD_VIEWS,
      windowDays: 28,
    },
    reasons,
    policy: 'Feedback may re-rank eligible distribution opportunities only; it cannot alter governed evidence or make an ineligible scientific candidate eligible.',
  }
}

export function applyDistributionFeedback(candidate, history = [], options = {}) {
  const feedback = assessDistributionFeedback(candidate, history, options)
  const baseScore = Number(candidate?.score)
  const eligible = candidate?.eligible === true
  return {
    ...candidate,
    feedback,
    feedbackAdjustedScore: Number.isFinite(baseScore) ? baseScore + (eligible ? feedback.adjustment : 0) : null,
  }
}
