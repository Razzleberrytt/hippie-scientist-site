import {
  type InteractionConfidence,
  type InteractionFinding,
  type InteractionReport,
  type InteractionSeverity,
  type InteractionSourceItem,
} from '@/types/interactions'
import { extractInteractionSignals } from './extractInteractionSignals'

function hasAny(tags: Set<string>, expected: string[]): boolean {
  return expected.some(tag => tags.has(tag))
}

function pushUniqueFindings(findings: InteractionFinding[], finding: InteractionFinding) {
  const key = `${finding.title}:${finding.summary}`
  if (findings.some(item => `${item.title}:${item.summary}` === key)) return
  findings.push(finding)
}

function maxSeverity(severities: InteractionSeverity[]): InteractionSeverity {
  const rank: Record<InteractionSeverity, number> = { unknown: 0, low: 1, moderate: 2, high: 3 }
  return severities.reduce(
    (current, next) => (rank[next] > rank[current] ? next : current),
    'unknown'
  )
}

function overallConfidenceFromFindings(
  findings: InteractionFinding[],
  dataLimited: boolean
): InteractionConfidence {
  if (findings.length === 0) return dataLimited ? 'low' : 'medium'
  const rank: Record<InteractionConfidence, number> = { low: 1, medium: 2, high: 3 }
  const total = findings.reduce((sum, finding) => sum + rank[finding.confidence], 0)
  const average = total / findings.length

  if (dataLimited && average < 2.6) return 'low'
  if (average >= 2.6) return 'high'
  if (average >= 1.8) return 'medium'
  return 'low'
}

function collectEvidence(
  matchedItems: ReturnType<typeof extractInteractionSignals>[],
  signalTags: string[]
): string[] {
  return matchedItems.flatMap(item =>
    signalTags.flatMap(tag => {
      const basis = item.evidenceByTag.get(tag)
      if (!basis?.length) return []
      return basis.map(entry => `${item.item.name}: ${entry}`)
    })
  )
}

export function checkInteractions(items: InteractionSourceItem[]): InteractionReport {
  const selected = items.slice(0, 3)
  const extracted = selected.map(extractInteractionSignals)
  const findings: InteractionFinding[] = []

  const sedativeItems = extracted.filter(({ tags }) =>
    hasAny(tags, ['sedative', 'anxiolytic', 'cns-depressant', 'gabaergic'])
  )
  if (sedativeItems.length >= 2) {
    pushUniqueFindings(findings, {
      title: 'Sedative overlap signal',
      severity: sedativeItems.length >= 3 ? 'moderate' : 'low',
      confidence: sedativeItems.length >= 3 ? 'medium' : 'low',
      summary:
        'Multiple selections include sedative-style signals. Combined use may increase drowsiness or impairment.',
      evidenceBasis: collectEvidence(sedativeItems, [
        'sedative',
        'anxiolytic',
        'cns-depressant',
        'gabaergic',
      ]),
    })
  }

  const stimulantItems = extracted.filter(({ tags }) => tags.has('stimulant'))
  if (stimulantItems.length >= 2) {
    pushUniqueFindings(findings, {
      title: 'Stimulant overlap signal',
      severity: stimulantItems.length >= 3 ? 'moderate' : 'low',
      confidence: stimulantItems.length >= 3 ? 'medium' : 'low',
      summary:
        'Multiple selections include stimulant-like signals. Combined use may increase restlessness, anxiety, heart rate, or sleep disruption.',
      evidenceBasis: collectEvidence(stimulantItems, ['stimulant']),
    })
  }

  const serotonergicItems = extracted.filter(({ tags }) => tags.has('serotonergic'))
  if (serotonergicItems.length >= 2) {
    pushUniqueFindings(findings, {
      title: 'Serotonergic overlap signal',
      severity: 'moderate',
      confidence: serotonergicItems.length >= 3 ? 'medium' : 'low',
      summary:
        'Multiple selections include serotonergic-style signals. This suggests a possible interaction caution and merits conservative dosing decisions.',
      evidenceBasis: collectEvidence(serotonergicItems, ['serotonergic']),
    })
  }

  const maoItems = extracted.filter(({ tags }) => tags.has('mao-related'))
  if (maoItems.length >= 1 && (serotonergicItems.length >= 1 || stimulantItems.length >= 1)) {
    const severity: InteractionSeverity =
      maoItems.length >= 1 && serotonergicItems.length >= 1 && stimulantItems.length >= 1
        ? 'high'
        : 'moderate'
    pushUniqueFindings(findings, {
      title: 'MAO-related combination caution',
      severity,
      confidence: severity === 'high' ? 'medium' : 'low',
      summary:
        'An MAO-related signal appears alongside serotonergic or stimulant-like signals. This pattern may elevate interaction caution.',
      evidenceBasis: [
        ...collectEvidence(maoItems, ['mao-related']),
        ...collectEvidence(serotonergicItems, ['serotonergic']),
        ...collectEvidence(stimulantItems, ['stimulant']),
      ],
    })
  }

  const cardioItems = extracted.filter(({ tags }) =>
    hasAny(tags, ['cardiovascular-caution', 'stimulant'])
  )
  if (cardioItems.length >= 2) {
    pushUniqueFindings(findings, {
      title: 'Cardiovascular caution overlap',
      severity: cardioItems.length >= 3 ? 'moderate' : 'low',
      confidence: cardioItems.some(item => item.tags.has('cardiovascular-caution'))
        ? 'medium'
        : 'low',
      summary:
        'Selections include overlapping cardiovascular or stimulant-related signals that may increase heart rate or blood pressure burden.',
      evidenceBasis: collectEvidence(cardioItems, ['cardiovascular-caution', 'stimulant']),
    })
  }

  const hepaticItems = extracted.filter(({ tags }) => tags.has('hepatotoxicity-caution'))
  if (hepaticItems.length >= 2) {
    pushUniqueFindings(findings, {
      title: 'Liver burden overlap signal',
      severity: hepaticItems.length >= 3 ? 'moderate' : 'low',
      confidence: 'low',
      summary:
        'Multiple selections include liver-toxicity caution signals. Combined use may increase hepatic burden.',
      evidenceBasis: collectEvidence(hepaticItems, ['hepatotoxicity-caution']),
    })
  }

  const sparseDataItems = extracted.filter(item => item.dataCoverageScore <= 1)
  const dataLimited = sparseDataItems.length > 0

  if (dataLimited) {
    pushUniqueFindings(findings, {
      title: 'Sparse data warning',
      severity: 'unknown',
      confidence: 'low',
      summary:
        'One or more selections have limited mechanism/safety/effects detail, so interaction coverage is incomplete.',
      evidenceBasis: sparseDataItems.map(item => `${item.item.name}: limited structured fields`),
    })
  }

  const overallSeverity = maxSeverity(findings.map(item => item.severity))
  const overallConfidence = overallConfidenceFromFindings(findings, dataLimited)

  const notes = [
    'This tool highlights structured overlap signals and does not replace medical advice.',
    'Interpret findings as possible caution signals, not certainty.',
  ]

  if (dataLimited) {
    notes.push('Some selected entries have limited safety data, so this report may be incomplete.')
  }

  return {
    items: selected.map(item => item.name),
    findings,
    overallSeverity,
    overallConfidence,
    dataLimited,
    notes,
  }
}
