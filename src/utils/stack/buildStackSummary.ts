import type { InteractionReport, InteractionSourceItem } from '@/types/interactions'

export type StackSummary = {
  name: string
  items: string[]
  goal: string | null
  recommendedTiming: string
  dosageRanges: {
    light: string
    moderate: string
    strong: string
  }
  effectsSummary: string
  safetySummary: string
  interactionVerdict: string
  interactionWarnings: string[]
  safetyNotes: string[]
  topSignals: string[]
  watchFor: string[]
  saferAlternatives: string[]
  basicDosageGuidance: string | null
  disclaimers: string[]
}

type BuildStackSummaryInput = {
  stackName?: string
  goal?: string | null
  report: InteractionReport | null
  sourceItems: InteractionSourceItem[]
}

function getVerdict(severity: InteractionReport['overallSeverity'] | undefined): string {
  if (severity === 'high') return 'Potentially risky combination'
  if (severity === 'moderate') return 'Use caution'
  if (severity === 'low') return 'Low risk combination'
  return 'Not enough data'
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean)))
}

function hasSignal(values: string[], patterns: RegExp[]): boolean {
  const joined = values.join(' ').toLowerCase()
  return patterns.some(pattern => pattern.test(joined))
}

function resolveTiming(goal: string | null, sourceItems: InteractionSourceItem[]): string {
  const effectText = sourceItems.flatMap(item => [...(item.effects || []), ...(item.safety || [])])
  const goalValue = (goal || '').toLowerCase()
  const sedationSignals = hasSignal(effectText, [/sedat/i, /sleep/i, /calm/i, /relax/i])
  const activationSignals = hasSignal(effectText, [/stim/i, /energ/i, /focus/i, /alert/i])

  if (goalValue.includes('sleep') || (sedationSignals && !activationSignals)) {
    return 'Best used in the evening, ideally 60–120 minutes before wind-down.'
  }

  if (goalValue.includes('focus') || (activationSignals && !sedationSignals)) {
    return 'Best used in the morning or early afternoon; avoid taking close to bedtime.'
  }

  return 'Start in the late afternoon or early evening and keep timing consistent for a few days.'
}

export function buildStackSummary({
  stackName,
  goal,
  report,
  sourceItems,
}: BuildStackSummaryInput): StackSummary {
  const items = sourceItems.map(item => item.name)
  const effectSignals = unique(sourceItems.flatMap(item => item.effects || [])).slice(0, 5)
  const safetySignals = unique(
    sourceItems.flatMap(item => [...(item.contraindications || []), ...(item.safety || [])])
  ).slice(0, 5)

  const effectsSummary =
    effectSignals.length > 0
      ? `Potential overlapping effects: ${effectSignals.join(', ')}.`
      : report?.summary || 'No clear shared effect pattern found in the current data.'

  const safetySummary =
    safetySignals.length > 0
      ? `Safety flags to consider: ${safetySignals.join(', ')}.`
      : report?.notes[0] || 'No specific safety notes were detected from structured fields.'

  const dosageGuidance = unique(
    sourceItems
      .flatMap(item => item.interactionNotes || [])
      .filter(note => /dose|dosing|start low|titrate|timing|space/i.test(note))
  )[0]
  const guidanceSource =
    dosageGuidance ||
    'Start low with one item, hold for 2-3 days, then add the next item only if tolerated.'

  const dosageRanges = {
    light: `~25-40% of the label serving. ${guidanceSource}`,
    moderate: '~50-75% of the label serving after tolerability is established.',
    strong:
      'Near full label serving only for experienced users; avoid introducing multiple strong items together.',
  }

  const topSignals = (report?.keySignals || []).slice(0, 4)
  const watchFor = unique(
    report?.findings.flatMap(finding => finding.whatToWatchFor || []) || []
  ).slice(0, 6)
  const saferAlternatives = unique(
    report?.findings.flatMap(finding => finding.saferAlternatives || []) || []
  ).slice(0, 6)
  const interactionWarnings = unique(
    report?.findings
      .filter(finding => finding.severity === 'high' || finding.severity === 'moderate')
      .map(finding => finding.summary) || []
  ).slice(0, 4)
  const safetyNotes = unique(
    sourceItems.flatMap(item => [...(item.contraindications || []), ...(item.safety || [])])
  ).slice(0, 6)

  const disclaimers = [
    'Educational use only. Not medical advice.',
    'Individual response can vary by dose, timing, medications, and health conditions.',
    'Talk to a qualified clinician before combining herbs or compounds with prescriptions.',
  ]

  return {
    name: stackName?.trim() || 'My Stack',
    items,
    goal: goal || null,
    recommendedTiming: resolveTiming(goal || null, sourceItems),
    dosageRanges,
    effectsSummary,
    safetySummary,
    interactionVerdict: getVerdict(report?.overallSeverity),
    interactionWarnings,
    safetyNotes,
    topSignals,
    watchFor,
    saferAlternatives,
    basicDosageGuidance: dosageGuidance || null,
    disclaimers,
  }
}
