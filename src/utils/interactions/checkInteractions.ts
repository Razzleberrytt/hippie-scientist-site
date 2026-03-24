import {
  type InteractionConfidence,
  type InteractionFinding,
  type InteractionFindingBasis,
  type InteractionReport,
  type InteractionSignalSource,
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

function resolveFindingBasisAndConfidence(
  matchedItems: ReturnType<typeof extractInteractionSignals>[],
  signalTags: string[]
): { basis: InteractionFindingBasis; confidence: InteractionConfidence } {
  const usedSources = new Set<InteractionSignalSource>()

  matchedItems.forEach(item => {
    signalTags.forEach(tag => {
      const source = item.sourceByTag.get(tag)
      if (source) usedSources.add(source)
    })
  })

  const hasStructured = usedSources.has('structured')
  const hasInferred = usedSources.has('inferred')

  if (hasStructured && hasInferred) return { basis: 'mixed', confidence: 'medium' }
  if (hasStructured) return { basis: 'structured', confidence: 'high' }
  return { basis: 'inferred', confidence: 'low' }
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
    hasAny(tags, ['sedative', 'cns-depressant', 'gabaergic'])
  )
  if (sedativeItems.length >= 2) {
    const basis = resolveFindingBasisAndConfidence(sedativeItems, [
      'sedative',
      'cns-depressant',
      'gabaergic',
    ])
    pushUniqueFindings(findings, {
      title: 'Sedative overlap signal',
      severity: sedativeItems.length >= 3 ? 'moderate' : 'low',
      confidence: basis.confidence,
      basis: basis.basis,
      summary:
        'More than one selected item has calming or sedating signals. Taking them together may increase drowsiness, slowed reaction time, or next-day grogginess.',
      evidenceBasis: collectEvidence(sedativeItems, ['sedative', 'cns-depressant', 'gabaergic']),
    })
  }

  const stimulantItems = extracted.filter(({ tags }) => tags.has('stimulant'))
  if (stimulantItems.length >= 2) {
    const basis = resolveFindingBasisAndConfidence(stimulantItems, ['stimulant'])
    pushUniqueFindings(findings, {
      title: 'Stimulant overlap signal',
      severity: stimulantItems.length >= 3 ? 'moderate' : 'low',
      confidence: basis.confidence,
      basis: basis.basis,
      summary:
        'More than one selected item has stimulating signals. Combining them may raise the chance of jitters, anxiety, faster heart rate, or trouble sleeping.',
      evidenceBasis: collectEvidence(stimulantItems, ['stimulant']),
    })
  }

  const serotonergicItems = extracted.filter(({ tags }) => tags.has('serotonergic'))
  if (serotonergicItems.length >= 2) {
    const basis = resolveFindingBasisAndConfidence(serotonergicItems, ['serotonergic'])
    pushUniqueFindings(findings, {
      title: 'Serotonergic overlap signal',
      severity: 'moderate',
      confidence: basis.confidence,
      basis: basis.basis,
      summary:
        'Multiple selected items show serotonin-related activity. The combination deserves extra caution, especially with conservative dosing and timing.',
      evidenceBasis: collectEvidence(serotonergicItems, ['serotonergic']),
    })
  }

  const maoItems = extracted.filter(({ tags }) => tags.has('maoi'))
  if (maoItems.length >= 1 && (serotonergicItems.length >= 1 || stimulantItems.length >= 1)) {
    const severity: InteractionSeverity =
      maoItems.length >= 1 && serotonergicItems.length >= 1 && stimulantItems.length >= 1
        ? 'high'
        : 'moderate'
    const basis = resolveFindingBasisAndConfidence(
      [...maoItems, ...serotonergicItems, ...stimulantItems],
      ['maoi', 'serotonergic', 'stimulant']
    )
    pushUniqueFindings(findings, {
      title: 'MAOI combination caution',
      severity,
      confidence: severity === 'high' && basis.confidence === 'high' ? 'high' : basis.confidence,
      basis: basis.basis,
      summary:
        'An MAO-related signal appears with serotonin-related or stimulant signals. That pattern can increase interaction concern, so a conservative approach is important.',
      evidenceBasis: [
        ...collectEvidence(maoItems, ['maoi']),
        ...collectEvidence(serotonergicItems, ['serotonergic']),
        ...collectEvidence(stimulantItems, ['stimulant']),
      ],
    })
  }

  const cardioItems = extracted.filter(({ tags }) => hasAny(tags, ['cardioactive', 'stimulant']))
  if (cardioItems.length >= 2) {
    const basis = resolveFindingBasisAndConfidence(cardioItems, ['cardioactive', 'stimulant'])
    pushUniqueFindings(findings, {
      title: 'Cardiovascular caution overlap',
      severity: cardioItems.length >= 3 ? 'moderate' : 'low',
      confidence: basis.confidence,
      basis: basis.basis,
      summary:
        'Selected items share heart or stimulant-related caution signals. Together they may add strain on heart rate or blood pressure.',
      evidenceBasis: collectEvidence(cardioItems, ['cardioactive', 'stimulant']),
    })
  }

  const hepaticItems = extracted.filter(({ tags }) => tags.has('hepatotoxic'))
  if (hepaticItems.length >= 2) {
    const basis = resolveFindingBasisAndConfidence(hepaticItems, ['hepatotoxic'])
    pushUniqueFindings(findings, {
      title: 'Liver burden overlap signal',
      severity: hepaticItems.length >= 3 ? 'moderate' : 'low',
      confidence: basis.confidence,
      basis: basis.basis,
      summary:
        'More than one selected item includes liver-related caution signals. Using them together may increase overall liver burden.',
      evidenceBasis: collectEvidence(hepaticItems, ['hepatotoxic']),
    })
  }

  const sparseDataItems = extracted.filter(item => item.dataCoverageScore <= 1)
  const dataLimited = sparseDataItems.length > 0

  if (dataLimited) {
    pushUniqueFindings(findings, {
      title: 'Sparse data warning',
      severity: 'unknown',
      confidence: 'low',
      basis: 'inferred',
      summary:
        'At least one selected item has limited structured mechanism or safety data, so this report has lower reliability and may miss signals.',
      evidenceBasis: sparseDataItems.map(item => `${item.item.name}: limited structured fields`),
    })
  }

  const overallSeverity = maxSeverity(findings.map(item => item.severity))
  const overallConfidence = overallConfidenceFromFindings(findings, dataLimited)

  const notes = [
    'This tool surfaces structured overlap signals to support harm-reduction decisions; it is not medical advice.',
    'Findings are caution signals, not proof of a specific outcome.',
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
