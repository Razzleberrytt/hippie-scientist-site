import type { InteractionReport, InteractionSourceItem } from '@/types/interactions'

export type StackSummary = {
  name: string
  items: string[]
  goal: string | null
  effectsSummary: string
  safetySummary: string
  interactionVerdict: string
  topSignals: string[]
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

  const topSignals = (report?.keySignals || []).slice(0, 4)

  const disclaimers = [
    'Educational use only. Not medical advice.',
    'Individual response can vary by dose, timing, medications, and health conditions.',
    'Talk to a qualified clinician before combining herbs or compounds with prescriptions.',
  ]

  return {
    name: stackName?.trim() || 'My Stack',
    items,
    goal: goal || null,
    effectsSummary,
    safetySummary,
    interactionVerdict: getVerdict(report?.overallSeverity),
    topSignals,
    basicDosageGuidance: dosageGuidance || null,
    disclaimers,
  }
}
